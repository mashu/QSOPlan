from rest_framework import serializers
from .models import User, QSOContact

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'call_sign')
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
