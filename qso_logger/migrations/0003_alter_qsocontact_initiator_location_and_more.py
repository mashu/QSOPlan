# Generated by Django 5.0.1 on 2025-02-10 21:13

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('qso_logger', '0002_alter_qsocontact_confirmed_alter_qsocontact_datetime_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='qsocontact',
            name='initiator_location',
            field=models.CharField(max_length=6, validators=[django.core.validators.RegexValidator('^[A-Z]{2}[0-9]{2}[A-Z]{2}$', 'Grid square must be in format AA00AA')]),
        ),
        migrations.AlterField(
            model_name='qsocontact',
            name='recipient_location',
            field=models.CharField(max_length=6, validators=[django.core.validators.RegexValidator('^[A-Z]{2}[0-9]{2}[A-Z]{2}$', 'Grid square must be in format AA00AA')]),
        ),
        migrations.AlterField(
            model_name='user',
            name='default_grid_square',
            field=models.CharField(blank=True, max_length=6, validators=[django.core.validators.RegexValidator('^[A-Z]{2}[0-9]{2}[A-Z]{2}$', 'Grid square must be in format AA00AA')]),
        ),
    ]
