# qso_logger/serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
import re
from .models import User, QSOContact

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'call_sign', 'default_grid_square')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_default_grid_square(self, value):
        if value:
            value = value.upper()
            if not re.match(r'^[A-Z]{2}[0-9]{2}[A-Z]{2}$', value):
                raise serializers.ValidationError('Grid square must be in format AA00AA')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            call_sign=validated_data['call_sign'].upper(),
            password=validated_data['password']
        )
        return user

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'call_sign', 'default_grid_square', 'password')
        extra_kwargs = {
            'email': {'required': True},
            'call_sign': {'required': True},
            'default_grid_square': {'required': True},
        }

    def validate_call_sign(self, value):
        value = value.upper()
        if not re.match(r'^[A-Z0-9]{3,10}$', value):
            raise serializers.ValidationError('Call sign must be 3-10 alphanumeric characters')
        return value

    def validate_default_grid_square(self, value):
        value = value.upper()
        if not re.match(r'^[A-Z]{2}[0-9]{2}[A-Z]{2}$', value):
            raise serializers.ValidationError('Grid square must be in format AA00AA')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['call_sign'],
            email=validated_data['email'],
            call_sign=validated_data['call_sign'],
            default_grid_square=validated_data['default_grid_square'],
            password=validated_data['password'],
            is_active=False,
            is_approved=False
        )
        return user

class QSOContactSerializer(serializers.ModelSerializer):
    initiator_callsign = serializers.CharField(source='initiator.call_sign', read_only=True)

    class Meta:
        model = QSOContact
        fields = (
            'id', 'initiator', 'initiator_callsign', 'recipient',
            'frequency', 'mode', 'datetime', 'initiator_location',
            'recipient_location', 'confirmed'
        )
        read_only_fields = ('confirmed', 'initiator')

    def validate_initiator_location(self, value):
        if value:
            value = value.upper()
            if not re.match(r'^[A-Z]{2}[0-9]{2}[A-Z]{2}$', value):
                raise serializers.ValidationError('Grid square must be in format AA00AA (e.g., IO91WM)')
        return value

    def validate_recipient_location(self, value):
        if value:
            value = value.upper()
            if not re.match(r'^[A-Z]{2}[0-9]{2}[A-Z]{2}$', value):
                raise serializers.ValidationError('Grid square must be in format AA00AA (e.g., IO91WM)')
        return value

    def validate(self, data):
        if 'recipient' in data:
            data['recipient'] = data['recipient'].upper()
        if 'initiator_location' in data:
            data['initiator_location'] = data['initiator_location'].upper()
        if 'recipient_location' in data:
            data['recipient_location'] = data['recipient_location'].upper()

        if self.context['request'].user.call_sign == data.get('recipient'):
            raise serializers.ValidationError({
                "recipient": "Cannot log a QSO with yourself"
            })

        if 'frequency' in data:
            if not (26.0 <= data['frequency'] <= 900.0):
                raise serializers.ValidationError({
                    "frequency": "Frequency must be between 26.0 and 900.0 MHz"
                })

        return data

    def create(self, validated_data):
        try:
            instance = QSOContact(**validated_data)
            instance.clean()
            return super().create(validated_data)
        except ValidationError as e:
            if hasattr(e, 'message_dict'):
                raise serializers.ValidationError(e.message_dict)
            raise serializers.ValidationError(str(e))
        except IntegrityError:
            raise serializers.ValidationError({
                "error": "You already have a QSO logged with this station at this exact time. "
                        "Please wait at least one minute between logging contacts with the same station."
            })

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'call_sign', 'default_grid_square')
        extra_kwargs = {
            'email': {'required': False},
            'call_sign': {'read_only': True},
            'default_grid_square': {'required': False}
        }

    def validate_default_grid_square(self, value):
        if value:
            value = value.upper()
            if not re.match(r'^[A-Z]{2}[0-9]{2}[A-Z]{2}$', value):
                raise serializers.ValidationError('Grid square must be in format AA00AA (e.g., IO91WM)')
        return value

class CallSignSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('call_sign',)