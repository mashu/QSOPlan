from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, QSOContact

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('username', 'email', 'call_sign', 'default_grid_square', 'is_staff', 'is_active',)
    list_filter = ('is_staff', 'is_active',)
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'call_sign', 'default_grid_square')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'call_sign', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email', 'username', 'call_sign')
    ordering = ('username',)

class QSOContactAdmin(admin.ModelAdmin):
    list_display = ('initiator', 'recipient', 'datetime', 'frequency', 'mode', 'confirmed')
    list_filter = ('confirmed', 'mode', 'datetime')
    search_fields = ('initiator__username', 'initiator__call_sign', 'recipient')
    date_hierarchy = 'datetime'

admin.site.register(User, CustomUserAdmin)
admin.site.register(QSOContact, QSOContactAdmin)
