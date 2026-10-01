from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
# from .permissions import IsAuthenticatedOrReadOnlyParent
from .permissions import (
    IsAuthenticatedOrReadOnlyParent,
    IsAdminOnly,
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.decorators import action
from rest_framework import status
from django.db.models import Q

from .models import (
    Teacher,
    Parent,
    ClassRoom,
    Child,
    Activity,
    DailyReport,
    Notice,
)
from .serializers import (
    TeacherSerializer,
    ParentSerializer,
    ClassRoomSerializer,
    ChildSerializer,
    ActivitySerializer,
    DailyReportSerializer,
    NoticeSerializer,
)

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAdminOnly]

    @action(
        detail=False,
        methods=["post"],
        url_path="create-account"
    )
    def create_account(self, request):
        if not request.user.is_staff:
            return Response(
                {"detail": "Only administrators can create teachers."},
                status=status.HTTP_403_FORBIDDEN
            )

        username = request.data.get("username")
        password = request.data.get("password")
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        phone = request.data.get("phone", "")
        address = request.data.get("address", "")

        if not username or not password or not first_name:
            return Response(
                {
                    "detail": "Username, password and first name are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "A user with this username already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        teacher = Teacher.objects.create(
            user=user,
            phone=phone,
            address=address,
            is_active=True,
        )

        serializer = self.get_serializer(teacher)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

class ParentViewSet(viewsets.ModelViewSet):
    queryset = Parent.objects.all()
    serializer_class = ParentSerializer
    # permission_classes = [IsAuthenticated]
    permission_classes = [IsAdminOnly]

    @action(
        detail=False,
        methods=["post"],
        url_path="create-account"
    )
    def create_account(self, request):
        if not request.user.is_staff:
            return Response(
                {"detail": "Only administrators can create parents."},
                status=status.HTTP_403_FORBIDDEN
            )

        username = request.data.get("username")
        password = request.data.get("password")
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        phone = request.data.get("phone", "")
        address = request.data.get("address", "")

        if not username or not password or not first_name:
            return Response(
                {
                    "detail": (
                        "Username, password and first name "
                        "are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "A user with this username already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        parent = Parent.objects.create(
            user=user,
            phone=phone,
            address=address,
        )

        serializer = self.get_serializer(parent)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )
    

class ClassRoomViewSet(viewsets.ModelViewSet):
    queryset = ClassRoom.objects.all()
    serializer_class = ClassRoomSerializer
    permission_classes = [IsAdminOnly]


class ChildViewSet(viewsets.ModelViewSet):
    serializer_class = ChildSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminOnly()]

        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Child.objects.all()

        if hasattr(user, "teacher"):
            return Child.objects.filter(
                classroom__teachers=user.teacher,
                is_active=True
            ).distinct()

        if hasattr(user, "parent"):
            return Child.objects.filter(
                parents=user.parent,
                is_active=True
            ).distinct()

        return Child.objects.none()

# class ActivityViewSet(viewsets.ModelViewSet):
#     queryset = Activity.objects.all()
#     serializer_class = ActivitySerializer
#     # permission_classes = [IsAuthenticated]
#     permission_classes = [IsAdminOnly]

class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminOnly()]

        return [IsAuthenticated()]

class DailyReportViewSet(viewsets.ModelViewSet):
    serializer_class = DailyReportSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticatedOrReadOnlyParent()]

        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            queryset = DailyReport.objects.all()

        elif hasattr(user, "teacher"):
            queryset = DailyReport.objects.filter(
                child__classroom__teachers=user.teacher
            ).distinct()

        elif hasattr(user, "parent"):
            queryset = DailyReport.objects.filter(
                child__parents=user.parent
            ).distinct()

        else:
            queryset = DailyReport.objects.none()

        report_date = self.request.query_params.get("date")
        classroom = self.request.query_params.get("classroom")
        submitted = self.request.query_params.get("submitted")
        search = self.request.query_params.get("search")

        if report_date:
            queryset = queryset.filter(
                report_date=report_date
            )

        if classroom:
            queryset = queryset.filter(
                child__classroom_id=classroom
            )

        if submitted in ["true", "false"]:
            queryset = queryset.filter(
                submitted=submitted == "true"
            )

        if search:
            queryset = queryset.filter(
                Q(child__first_name__icontains=search)
                | Q(child__last_name__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        user = self.request.user

        # Admin can create a report
        if user.is_staff:
            serializer.save()
            return

        # Teacher can only create reports for children
        # in their assigned classroom
        if hasattr(user, "teacher"):
            child = serializer.validated_data["child"]

            if (
                not child.classroom
                or not child.classroom.teachers.filter(
                    id=user.teacher.id
                ).exists()
            ):
                from rest_framework.exceptions import PermissionDenied

                raise PermissionDenied(
                    "You are not allowed to create a report for this child."
                )

            serializer.save(teacher=user.teacher)
            return

        # Parents cannot create reports
        from rest_framework.exceptions import PermissionDenied

        raise PermissionDenied(
            "Parents are not allowed to create daily reports."
        )

    def perform_update(self, serializer):
        user = self.request.user

        # Admin can update any report
        if user.is_staff:
            serializer.save()
            return

        # Teacher can only update reports for assigned children
        if hasattr(user, "teacher"):
            report = self.get_object()

            if (
                not report.child.classroom
                or not report.child.classroom.teachers.filter(
                    id=user.teacher.id
                ).exists()
            ):
                from rest_framework.exceptions import PermissionDenied

                raise PermissionDenied(
                    "You are not allowed to update this report."
                )

            serializer.save(teacher=user.teacher)
            return

        # Parents cannot update reports
        from rest_framework.exceptions import PermissionDenied

        raise PermissionDenied(
            "Parents are not allowed to update daily reports."
        )

    def perform_destroy(self, instance):
        user = self.request.user

        # Admin can delete any report
        if user.is_staff:
            instance.delete()
            return

        # Teacher can delete reports only for assigned children
        if hasattr(user, "teacher"):
            if (
                not instance.child.classroom
                or not instance.child.classroom.teachers.filter(
                    id=user.teacher.id
                ).exists()
            ):
                from rest_framework.exceptions import PermissionDenied

                raise PermissionDenied(
                    "You are not allowed to delete this report."
                )

            instance.delete()
            return

        # Parents cannot delete reports
        from rest_framework.exceptions import PermissionDenied

        raise PermissionDenied(
            "Parents are not allowed to delete daily reports."
        )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user

    if user.is_staff:
        role = "admin"
    elif hasattr(user, "teacher"):
        role = "teacher"
    elif hasattr(user, "parent"):
        role = "parent"
    else:
        role = "unknown"

    return Response({
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": role,
    })


class NoticeViewSet(viewsets.ModelViewSet):
    serializer_class = NoticeSerializer

    def get_permissions(self):
        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
        ]:
            return [IsAdminOnly()]

        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Notice.objects.all().order_by(
                "-notice_date",
                "-created_at",
            )

        return Notice.objects.filter(
            is_active=True
        ).order_by(
            "-notice_date",
            "-created_at",
        )