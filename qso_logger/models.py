from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator

class User(AbstractUser):
    call_sign = models.CharField(
        max_length=10,
        unique=True,
        validators=[RegexValidator(r'^[A-Z0-9]{3,10}$', 'Call sign must be 3-10 alphanumeric characters')]
    )
    email = models.EmailField(unique=True)

class QSOContact(models.Model):
    initiator = models.ForeignKey(User, related_name='initiated_contacts', on_delete=models.CASCADE)
    recipient = models.CharField(max_length=10)  # Call sign of the other station
    frequency = models.DecimalField(max_digits=10, decimal_places=3)  # MHz
    mode = models.CharField(max_length=10)  # e.g., SSB, CW, FT8
    datetime = models.DateTimeField()
    initiator_location = models.CharField(max_length=6)  # Grid square
    recipient_location = models.CharField(max_length=6)  # Grid square
    confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['initiator', 'recipient', 'datetime']
