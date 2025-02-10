from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Q
from .models import QSOContact, User
from .serializers import QSOContactSerializer, UserSerializer

class QSOContactViewSet(viewsets.ModelViewSet):
    serializer_class = QSOContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QSOContact.objects.filter(initiator=self.request.user)

    def perform_create(self, serializer):
        qso = serializer.save(initiator=self.request.user)
        # Check for matching QSO
        matching_qso = QSOContact.objects.filter(
            initiator__call_sign=qso.recipient,
            recipient=qso.initiator.call_sign,
            datetime=qso.datetime
        ).first()

        if matching_qso:
            matching_qso.confirmed = True
            qso.confirmed = True
            matching_qso.save()
            qso.save()

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def rankings(self, request):
        """Get user rankings based on confirmed contacts"""
        from django.db.models import Count, Q
        from django.contrib.auth import get_user_model

        User = get_user_model()

        users = User.objects.annotate(
            confirmed_contacts=Count(
                'initiated_contacts',
                filter=Q(initiated_contacts__confirmed=True)
            ),
            total_contacts=Count('initiated_contacts')
        ).values('call_sign', 'confirmed_contacts', 'total_contacts')

        print("Rankings data:", list(users))  # Debug print

        return Response(list(users))