from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, QSOContact

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('username', 'email', 'call_sign', 'default_grid_square', 'is_approved', 'is_active', 'is_staff')
    list_filter = ('is_approved', 'is_active', 'is_staff')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'call_sign', 'default_grid_square')}),
        ('Permissions', {'fields': ('is_approved', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    actions = ['approve_users']

    def approve_users(self, request, queryset):
        queryset.update(is_approved=True, is_active=True)
    approve_users.short_description = "Approve selected users"

class QSOContactAdmin(admin.ModelAdmin):
    list_display = ('initiator', 'recipient', 'datetime', 'frequency', 'mode', 'confirmed')
    list_filter = ('confirmed', 'mode', 'datetime')
    search_fields = ('initiator__username', 'initiator__call_sign', 'recipient')
    date_hierarchy = 'datetime'

admin.site.register(User, CustomUserAdmin)
admin.site.register(QSOContact, QSOContactAdmin)
