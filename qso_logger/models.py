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
        verbose_name = "QSO Contact"
        verbose_name_plural = "QSO Contacts"

    def clean(self):
        # Normalize input fields to uppercase
        if self.recipient:
            self.recipient = self.recipient.upper()
        if self.initiator_location:
            self.initiator_location = self.initiator_location.upper()
        if self.recipient_location:
            self.recipient_location = self.recipient_location.upper()

        # Prevent self-QSOs
        if self.initiator and self.initiator.call_sign == self.recipient:
            raise ValidationError("Cannot log a QSO with yourself")

        # Validate time constraints
        if self.initiator and self.recipient and self.datetime:
            hour_before = self.datetime - timedelta(hours=1)
            
            # Check for existing QSOs initiated by the same user to the same recipient
            existing = QSOContact.objects.filter(
                initiator=self.initiator,
                recipient=self.recipient,
                datetime__gte=hour_before,
                datetime__lte=self.datetime
            ).exclude(pk=self.pk).exists()

            if existing:
                raise ValidationError(
                    "You have already logged a QSO with this station within the last hour. "
                    "Please wait at least one hour before logging another QSO with the same station."
                )

        super().clean()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.initiator.call_sign} → {self.recipient} ({self.datetime})"
