from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminUserRole(BasePermission):
    """
    Allows access only to Django superusers or staff users.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class IsTeacherUser(BasePermission):
    """
    Allows access only to users connected to a Teacher profile.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "teacher")
        )


class IsParentUser(BasePermission):
    """
    Allows access only to users connected to a Parent profile.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "parent")
        )



class IsAuthenticatedOrReadOnlyParent(BasePermission):
    """
    Authenticated users can access the endpoint.

    Parents are read-only.
    Staff and teachers may perform write operations.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Everyone can read
        if request.method in SAFE_METHODS:
            return True

        # Parents cannot write
        if hasattr(user, "parent"):
            return False

        # Staff and teachers can write
        return user.is_staff or hasattr(user, "teacher")

class IsAdminOnly(BasePermission):
    """
    Only Django staff/admin users can access the endpoint.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )