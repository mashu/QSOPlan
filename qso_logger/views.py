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
    UserUpdateSerializer
)

class QSOContactViewSet(viewsets.ModelViewSet):
    serializer_class = QSOContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all QSOs where the current user is either initiator or recipient"""
        user_call_sign = self.request.user.call_sign
        return QSOContact.objects.filter(
            Q(initiator=self.request.user) |
            Q(initiator__call_sign=user_call_sign)
        ).order_by('-datetime')

    def perform_create(self, serializer):
        """Create a new QSO entry"""
        # Save the new QSO (always unconfirmed initially)
        qso = serializer.save(initiator=self.request.user, confirmed=False)
        
        # Look for a matching QSO that was previously logged by the recipient
        try:
            recipient_user = User.objects.get(call_sign=qso.recipient)
            
            # Check if the recipient has already logged this QSO
            matching_qso = QSOContact.objects.filter(
                initiator=recipient_user,
                recipient=qso.initiator.call_sign,
                datetime__range=(
                    qso.datetime - timedelta(minutes=5),
                    qso.datetime + timedelta(minutes=5)
                ),
                frequency=qso.frequency,
                mode=qso.mode,
                initiator_location=qso.recipient_location,  # Their location when they were initiator
                recipient_location=qso.initiator_location   # Your location when you were recipient
            ).first()

            if matching_qso and not matching_qso.confirmed:
                # If a match is found and it's not already confirmed,
                # confirm both QSOs
                matching_qso.confirmed = True
                qso.confirmed = True
                matching_qso.save()
                qso.save()

        except User.DoesNotExist:
            # If the recipient isn't registered in our system, 
            # the QSO remains unconfirmed
            pass

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def rankings(self, request):
        """Get user rankings based on confirmed contacts"""
        User = get_user_model()

        users = User.objects.annotate(
            confirmed_contacts=Count(
                'initiated_contacts',
                filter=Q(initiated_contacts__confirmed=True)
            ),
            total_contacts=Count('initiated_contacts')
        ).values('call_sign', 'confirmed_contacts', 'total_contacts')

        return Response(list(users))

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

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

