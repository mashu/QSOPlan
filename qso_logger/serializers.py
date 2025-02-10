from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError
from .models import User, QSOContact

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'call_sign', 'default_grid_square')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            call_sign=validated_data['call_sign'].upper(),
            password=validated_data['password']
        )
        return user

class QSOContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = QSOContact
        fields = '__all__'
        read_only_fields = ('confirmed', 'initiator')

    def create(self, validated_data):
        try:
            return super().create(validated_data)
        except IntegrityError:
            raise serializers.ValidationError({
                "error": "You already have a QSO logged with this station at this exact time. Please use a different time."
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
        return value.upper() if value else value

class CallSignSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('call_sign',)
