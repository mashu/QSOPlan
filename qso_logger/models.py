# qso_logger/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    call_sign = models.CharField(
        max_length=10,
        unique=True,
        validators=[RegexValidator(r'^[A-Z0-9]{3,10}$', 'Call sign must be 3-10 alphanumeric characters')]
    )
    email = models.EmailField(unique=True)
    default_grid_square = models.CharField(
        max_length=6,
        blank=True,
        validators=[RegexValidator(r'^[A-Z]{2}[0-9]{2}[A-Z]{2}$', 'Grid square must be in format AA00AA')]
    )
    is_approved = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.default_grid_square:
            self.default_grid_square = self.default_grid_square.upper()
        if self.call_sign:
            self.call_sign = self.call_sign.upper()
        if not self.is_approved:
            self.is_active = False
        super().save(*args, **kwargs)

class QSOContact(models.Model):
    initiator = models.ForeignKey(User, related_name='initiated_contacts', on_delete=models.CASCADE)
    recipient = models.CharField(
        max_length=10,
        validators=[RegexValidator(r'^[A-Z0-9]{3,10}$', 'Call sign must be 3-10 alphanumeric characters')]
    )
    frequency = models.DecimalField(max_digits=10, decimal_places=3)  # MHz
    mode = models.CharField(max_length=10)  # e.g., SSB, FM, AM
    datetime = models.DateTimeField(db_index=True)
    initiator_location = models.CharField(
        max_length=6,
        validators=[RegexValidator(r'^[A-Z]{2}[0-9]{2}[A-Z]{2}$', 'Grid square must be in format AA00AA')]
    )
    recipient_location = models.CharField(
        max_length=6,
        validators=[RegexValidator(r'^[A-Z]{2}[0-9]{2}[A-Z]{2}$', 'Grid square must be in format AA00AA')]
    )
    confirmed = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['recipient', 'datetime']),
            models.Index(fields=['initiator', 'recipient', 'datetime']),
            models.Index(fields=['frequency', 'mode', 'datetime']),
        ]
        unique_together = ['initiator', 'recipient', 'datetime']
        verbose_name = "QSO Contact"
        verbose_name_plural = "QSO Contacts"

    def clean(self):
        if self.recipient:
            self.recipient = self.recipient.upper()
        if self.initiator_location:
            self.initiator_location = self.initiator_location.upper()
        if self.recipient_location:
            self.recipient_location = self.recipient_location.upper()

        if self.initiator and self.initiator.call_sign == self.recipient:
            raise ValidationError("Cannot log a QSO with yourself")

        if self.initiator and self.recipient and self.datetime:
            existing = QSOContact.objects.filter(
                initiator=self.initiator,
                recipient=self.recipient,
                datetime__year=self.datetime.year,
                datetime__month=self.datetime.month,
                datetime__day=self.datetime.day,
                datetime__hour=self.datetime.hour,
                datetime__minute=self.datetime.minute
            ).exclude(pk=self.pk).first()

            if existing:
                raise ValidationError(
                    "You already have a QSO logged with this station at this time. "
                    "Please wait at least one minute between logging contacts with the same station."
                )

        super().clean()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.initiator.call_sign} → {self.recipient} ({self.datetime})"