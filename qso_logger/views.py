# qso_logger/views.py
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Q
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import QSOContact, User
from .serializers import (
    QSOContactSerializer,
    UserSerializer,
    PasswordChangeSerializer,
    UserUpdateSerializer,
    CallSignSerializer,
    RegistrationSerializer
)

class QSOContactViewSet(viewsets.ModelViewSet):
    serializer_class = QSOContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return QSOs where the current user is the initiator
        return QSOContact.objects.filter(
            initiator=self.request.user
        ).order_by('-datetime')

    def perform_create(self, serializer):
        # First save the new QSO
        qso = serializer.save(initiator=self.request.user, confirmed=False)

        # Search for matching QSOs
        try:
            # Look for any QSO from the recipient to the initiator within the time window
            potential_matches = QSOContact.objects.filter(
                initiator__call_sign=qso.recipient,  # QSO initiated by the recipient
                recipient=qso.initiator.call_sign,   # To the current initiator
                datetime__range=(
                    qso.datetime - timedelta(hours=1),
                    qso.datetime + timedelta(hours=1)
                ),
                confirmed=False  # Only match unconfirmed QSOs
            )

            # Add frequency and mode matching criteria
            # Allow for small frequency differences (within 0.005 MHz)
            matching_qso = None
            for potential_match in potential_matches:
                freq_diff = abs(potential_match.frequency - qso.frequency)
                if (freq_diff <= 0.005 and  # Frequency within 5 kHz
                    potential_match.mode == qso.mode and  # Same mode
                    potential_match.initiator_location == qso.recipient_location and  # Location match
                    potential_match.recipient_location == qso.initiator_location):  # Cross-location match
                    matching_qso = potential_match
                    break

            if matching_qso:
                # Update both QSOs to confirmed status
                matching_qso.confirmed = True
                matching_qso.save()
                qso.confirmed = True
                qso.save()

        except Exception as e:
            # Log the error but don't stop the QSO from being created
            print(f"Error during QSO matching: {str(e)}")

    def perform_destroy(self, instance):
        # Only allow deletion of unconfirmed QSOs
        if instance.confirmed:
            raise serializers.ValidationError(
                "Cannot delete confirmed QSOs"
            )
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def rankings(self, request):
        try:
            User = get_user_model()
            users = User.objects.annotate(
                confirmed_contacts=Count(
                    'initiated_contacts',
                    filter=Q(initiated_contacts__confirmed=True)
                ),
                total_contacts=Count('initiated_contacts')
            ).values('call_sign', 'confirmed_contacts', 'total_contacts')
            return Response(list(users))
        except Exception as e:
            return Response(
                {"error": "Failed to fetch rankings"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        if 'call_sign' in request.data:
            del request.data['call_sign']
        return super().update(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = PasswordChangeSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if user.check_password(serializer.data.get('old_password')):
            user.set_password(serializer.data.get('new_password'))
            user.save()
            return Response({'message': 'Password updated successfully'})
        return Response({'error': 'Incorrect old password'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_callsigns(request):
    search_query = request.query_params.get('search', '').upper()
    if len(search_query) < 2:
        return Response([])

    users = User.objects.filter(
        call_sign__istartswith=search_query
    ).exclude(
        call_sign=request.user.call_sign
    ).values('call_sign', 'default_grid_square')[:10]

    return Response(users)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            return Response({
                'message': 'Registration successful. Please wait for admin approval.',
                'email': user.email,
                'call_sign': user.call_sign
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)