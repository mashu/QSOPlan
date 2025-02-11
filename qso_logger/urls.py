# qso_logger/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QSOContactViewSet,
    change_password,
    UserProfileView,
    search_callsigns,
    register
)

router = DefaultRouter()
router.register(r'qsos', QSOContactViewSet, basename='qso')

urlpatterns = [
    path('', include(router.urls)),
    path('user/change-password/', change_password, name='change-password'),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    path('users/callsigns/', search_callsigns, name='search-callsigns'),
    path('register/', register, name='register'),
]