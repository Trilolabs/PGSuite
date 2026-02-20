"""Core RBAC permission classes."""
from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Allow only admin users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsPropertyManager(permissions.BasePermission):
    """Allow admin or property manager."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ('admin', 'manager')
        )


class IsStaffOrAbove(permissions.BasePermission):
    """Allow admin, manager, or staff."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ('admin', 'manager', 'staff')
        )


class IsTenantUser(permissions.BasePermission):
    """Allow tenant users (self-service)."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'tenant'
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Object-level: write only for owner, read for anyone authenticated."""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return hasattr(obj, 'user') and obj.user == request.user


class PropertyAccessMixin:
    """
    Mixin to check user has access to the property in the URL.
    Use in views that have `property_pk` in URL kwargs.
    """
    def check_property_access(self, request, property_id):
        user = request.user
        if user.role == 'admin':
            return True
        # Manager/staff: check they are assigned to this property
        from pms.apps.properties.models import Property
        return Property.objects.filter(
            id=property_id,
            staff__user=user,
        ).exists()
