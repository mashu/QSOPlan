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
    CallSignSerializer
)

class QSOContactViewSet(viewsets.ModelViewSet):
    serializer_class = QSOContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_call_sign = self.request.user.call_sign
        return QSOContact.objects.filter(
            Q(initiator=self.request.user) |
            Q(recipient=user_call_sign)
        ).order_by('-datetime')

    def perform_create(self, serializer):
        qso = serializer.save(initiator=self.request.user, confirmed=False)
        try:
            recipient_user = User.objects.get(call_sign=qso.recipient)
            matching_qso = QSOContact.objects.filter(
                initiator=recipient_user,
                recipient=qso.initiator.call_sign,
                datetime__range=(
                    qso.datetime - timedelta(hours=1),
                    qso.datetime + timedelta(hours=1)
                ),
                frequency=qso.frequency,
                mode=qso.mode
            ).first()

            if matching_qso:
                matching_qso.confirmed = True
                matching_qso.save()
                qso.confirmed = True
                qso.save()

        except User.DoesNotExist:
            pass

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
