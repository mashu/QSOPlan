# Generated by Django 5.0.1 on 2025-02-11 21:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('qso_logger', '0005_user_is_approved'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='qsocontact',
            unique_together=set(),
        ),
    ]
