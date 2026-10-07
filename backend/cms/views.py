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
from django.db.models import Q, Exists, OuterRef
from django.utils import timezone
from datetime import timedelta
from collections import Counter, defaultdict
from django.utils.dateparse import parse_date


from .models import (
    Teacher,
    Parent,
    ClassRoom,
    Child,
    Activity,
    DailyReport,
    Notice,
    Attendance,
)
from .serializers import (
    TeacherSerializer,
    ParentSerializer,
    ClassRoomSerializer,
    ChildSerializer,
    ActivitySerializer,
    DailyReportSerializer,
    NoticeSerializer,
    AttendanceSerializer,
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

    # def get_queryset(self):
    #     user = self.request.user

    #     if user.is_staff:
    #         return Child.objects.all()

    #     if hasattr(user, "teacher"):
    #         return Child.objects.filter(
    #             classroom__teachers=user.teacher,
    #             is_active=True
    #         ).distinct()

    #     if hasattr(user, "parent"):
    #         return Child.objects.filter(
    #             parents=user.parent,
    #             is_active=True
    #         ).distinct()

    #     return Child.objects.none()
    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            queryset = Child.objects.all()

        elif hasattr(user, "teacher"):
            queryset = Child.objects.filter(
                classroom__teachers=user.teacher,
                is_active=True
            ).distinct()

        elif hasattr(user, "parent"):
            queryset = Child.objects.filter(
                parents=user.parent,
                is_active=True
            ).distinct()

        else:
            return Child.objects.none()

        classroom = self.request.query_params.get("classroom")
        search = self.request.query_params.get("search")

        if classroom:
            queryset = queryset.filter(
                classroom_id=classroom
            )

        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )

        return queryset


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer

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

        # Admin can see all activities
        if user.is_staff:
            return Activity.objects.all()

        # Teachers and parents can only see active activities
        return Activity.objects.filter(
            is_active=True
        )

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
        ]:
            return [IsAuthenticatedOrReadOnlyParent()]

        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            queryset = Attendance.objects.all()

        elif hasattr(user, "teacher"):
            queryset = Attendance.objects.filter(
                child__classroom__teachers=user.teacher
            ).distinct()

        elif hasattr(user, "parent"):
            queryset = Attendance.objects.filter(
                child__parents=user.parent
            ).distinct()

        else:
            queryset = Attendance.objects.none()

        attendance_date = self.request.query_params.get("date")
        classroom = self.request.query_params.get("classroom")
        status_filter = self.request.query_params.get("status")
        search = self.request.query_params.get("search")
        child = self.request.query_params.get("child")

        if child:
            queryset = queryset.filter(child_id=child)

        if attendance_date:
            queryset = queryset.filter(
                attendance_date=attendance_date
            )

        if classroom:
            queryset = queryset.filter(
                child__classroom_id=classroom
            )

        if status_filter in [
            Attendance.PRESENT,
            Attendance.ABSENT,
        ]:
            queryset = queryset.filter(
                status=status_filter
            )

        if search:
            queryset = queryset.filter(
                Q(child__first_name__icontains=search)
                | Q(child__last_name__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        user = self.request.user

        if user.is_staff:
            serializer.save()
            return

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
                    "You are not allowed to mark attendance for this child."
                )

            serializer.save(teacher=user.teacher)
            return

        from rest_framework.exceptions import PermissionDenied

        raise PermissionDenied(
            "Parents are not allowed to create attendance records."
        )

    def perform_update(self, serializer):
        user = self.request.user

        if user.is_staff:
            serializer.save()
            return

        if hasattr(user, "teacher"):
            attendance = self.get_object()

            if (
                not attendance.child.classroom
                or not attendance.child.classroom.teachers.filter(
                    id=user.teacher.id
                ).exists()
            ):
                from rest_framework.exceptions import PermissionDenied

                raise PermissionDenied(
                    "You are not allowed to update this attendance record."
                )

            serializer.save(teacher=user.teacher)
            return

        from rest_framework.exceptions import PermissionDenied

        raise PermissionDenied(
            "Parents are not allowed to update attendance."
        )

    def perform_destroy(self, instance):
        user = self.request.user

        if user.is_staff:
            instance.delete()
            return

        if hasattr(user, "teacher"):
            if (
                not instance.child.classroom
                or not instance.child.classroom.teachers.filter(
                    id=user.teacher.id
                ).exists()
            ):
                from rest_framework.exceptions import PermissionDenied

                raise PermissionDenied(
                    "You are not allowed to delete this attendance record."
                )

            instance.delete()
            return

        from rest_framework.exceptions import PermissionDenied

        raise PermissionDenied(
            "Parents are not allowed to delete attendance."
        )

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
        child = self.request.query_params.get("child")

        if child:
            queryset = queryset.filter(child_id=child)

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
        child = serializer.validated_data["child"]
        report_date = serializer.validated_data["report_date"]

        attendance = Attendance.objects.filter(
            child=child,
            attendance_date=report_date,
            status=Attendance.PRESENT,
        ).first()

        if not attendance:
            from rest_framework.exceptions import ValidationError

            raise ValidationError({
                "child": (
                    "A daily report can only be created "
                    "for a child marked Present on this date."
                )
            })

        if user.is_staff:
            serializer.save()
            return

        if hasattr(user, "teacher"):
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


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def insights_summary(request):
#     user = request.user

#     # -----------------------------------------
#     # ACCESS CONTROL
#     # -----------------------------------------

#     if user.is_staff:
#         children = Child.objects.filter(
#             is_active=True
#         )

#     elif hasattr(user, "teacher"):
#         children = Child.objects.filter(
#             classroom__teachers=user.teacher,
#             is_active=True
#         ).distinct()

#     else:
#         return Response(
#             {
#                 "detail": (
#                     "Only administrators and teachers "
#                     "can access insights."
#                 )
#             },
#             status=status.HTTP_403_FORBIDDEN
#         )

#     # -----------------------------------------
#     # DATE RANGE
#     # -----------------------------------------

#     today = timezone.localdate()

#     start_date_param = request.query_params.get("start_date")
#     end_date_param = request.query_params.get("end_date")

#     if start_date_param:
#         try:
#             from datetime import date
#             start_date = date.fromisoformat(
#                 start_date_param
#             )
#         except ValueError:
#             return Response(
#                 {"detail": "Invalid start_date."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#     else:
#         start_date = today - timedelta(days=6)

#     if end_date_param:
#         try:
#             from datetime import date
#             end_date = date.fromisoformat(
#                 end_date_param
#             )
#         except ValueError:
#             return Response(
#                 {"detail": "Invalid end_date."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#     else:
#         end_date = today

#     if start_date > end_date:
#         return Response(
#             {
#                 "detail": (
#                     "start_date cannot be later "
#                     "than end_date."
#                 )
#             },
#             status=status.HTTP_400_BAD_REQUEST
#         )

#     # -----------------------------------------
#     # FILTERS
#     # -----------------------------------------

#     classroom_id = request.query_params.get("classroom")
#     teacher_id = request.query_params.get("teacher")
#     child_id = request.query_params.get("child")

#     if classroom_id:
#         children = children.filter(
#             classroom_id=classroom_id
#         )

#     if teacher_id:
#         children = children.filter(
#             classroom__teachers__id=teacher_id
#         ).distinct()

#     if child_id:
#         children = children.filter(
#             id=child_id
#         )

#     # -----------------------------------------
#     # ATTENDANCE
#     # -----------------------------------------

#     attendance = Attendance.objects.filter(
#         child__in=children,
#         attendance_date__range=[
#             start_date,
#             end_date
#         ]
#     )

#     # -----------------------------------------
#     # DAILY REPORTS
#     # -----------------------------------------

#     reports = DailyReport.objects.filter(
#         child__in=children,
#         report_date__range=[
#             start_date,
#             end_date
#         ]
#     )

#     # -----------------------------------------
#     # BASIC COUNTS
#     # -----------------------------------------

#     attendance_records = list(
#         attendance.select_related(
#             "child",
#             "child__classroom",
#             "teacher"
#         )
#     )

#     report_records = list(
#         reports.prefetch_related(
#             "activities"
#         ).select_related(
#             "child",
#             "child__classroom",
#             "teacher"
#         )
#     )

#     present_count = sum(
#         1
#         for record in attendance_records
#         if record.status == Attendance.PRESENT
#     )

#     absent_count = sum(
#         1
#         for record in attendance_records
#         if record.status == Attendance.ABSENT
#     )

#     submitted_reports = [
#         report
#         for report in report_records
#         if report.submitted
#     ]

#     # -----------------------------------------
#     # MOOD
#     # -----------------------------------------

#     mood_counts = Counter(
#         report.mood
#         for report in submitted_reports
#         if report.mood
#     )

#     # -----------------------------------------
#     # FOOD
#     # -----------------------------------------

#     morning_snack_counts = Counter(
#         report.morning_snack
#         for report in submitted_reports
#         if report.morning_snack
#     )

#     lunch_counts = Counter(
#         report.lunch
#         for report in submitted_reports
#         if report.lunch
#     )

#     # -----------------------------------------
#     # PARTICIPATION
#     # -----------------------------------------

#     participation_counts = Counter(
#         report.participation
#         for report in submitted_reports
#         if report.participation
#     )

#     # -----------------------------------------
#     # ACTIVITIES
#     # -----------------------------------------

#     activity_counts = Counter()

#     for report in submitted_reports:
#         for activity in report.activities.all():
#             activity_counts[activity.name] += 1

#     # -----------------------------------------
#     # CHILD INSIGHTS
#     # -----------------------------------------

#     child_data = []

#     for child in children.select_related(
#         "classroom"
#     ):
#         child_attendance = [
#             record
#             for record in attendance_records
#             if record.child_id == child.id
#         ]

#         child_reports = [
#             report
#             for report in submitted_reports
#             if report.child_id == child.id
#         ]

#         child_moods = Counter(
#             report.mood
#             for report in child_reports
#             if report.mood
#         )

#         child_lunch = Counter(
#             report.lunch
#             for report in child_reports
#             if report.lunch
#         )

#         child_snack = Counter(
#             report.morning_snack
#             for report in child_reports
#             if report.morning_snack
#         )

#         child_participation = Counter(
#             report.participation
#             for report in child_reports
#             if report.participation
#         )

#         child_activities = Counter()

#         for report in child_reports:
#             for activity in report.activities.all():
#                 child_activities[activity.name] += 1

#         present = sum(
#             1
#             for record in child_attendance
#             if record.status == Attendance.PRESENT
#         )

#         absent = sum(
#             1
#             for record in child_attendance
#             if record.status == Attendance.ABSENT
#         )

#         # -----------------------------------------
#         # NEEDS ATTENTION
#         # -----------------------------------------

#         attention = []

#         tired_count = child_moods.get(
#             "tired",
#             0
#         )

#         lunch_not_eaten = child_lunch.get(
#             "did_not_eat",
#             0
#         )

#         snack_not_eaten = child_snack.get(
#             "did_not_eat",
#             0
#         )

#         if tired_count >= 2:
#             attention.append(
#                 "Marked tired multiple times"
#             )

#         if lunch_not_eaten >= 2:
#             attention.append(
#                 "Did not eat lunch multiple times"
#             )

#         if snack_not_eaten >= 2:
#             attention.append(
#                 "Did not eat morning snack multiple times"
#             )

#         child_data.append({
#             "id": child.id,
#             "name": str(child),
#             "classroom": (
#                 child.classroom.name
#                 if child.classroom
#                 else ""
#             ),
#             "attendance": {
#                 "present": present,
#                 "absent": absent,
#                 "marked": len(child_attendance),
#             },
#             "reports": {
#                 "submitted": len(child_reports),
#             },
#             "mood": dict(child_moods),
#             "morning_snack": dict(child_snack),
#             "lunch": dict(child_lunch),
#             "participation": dict(child_participation),
#             "activities": dict(child_activities),
#             "needs_attention": attention,
#         })

#     # -----------------------------------------
#     # RESPONSE
#     # -----------------------------------------

#     return Response({
#         "period": {
#             "start_date": start_date,
#             "end_date": end_date,
#         },

#         "overview": {
#             "children": children.count(),
#             "attendance_records": len(
#                 attendance_records
#             ),
#             "present": present_count,
#             "absent": absent_count,
#             "reports_submitted": len(
#                 submitted_reports
#             ),
#         },

#         "mood": dict(mood_counts),

#         "morning_snack": dict(
#             morning_snack_counts
#         ),

#         "lunch": dict(
#             lunch_counts
#         ),

#         "participation": dict(
#             participation_counts
#         ),

#         "activities": dict(
#             activity_counts
#         ),

#         "children": child_data,
#     })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def insights_summary(request):
    user = request.user

    # ---------------------------------------------------------
    # 1. BASE ACCESS SCOPE
    # ---------------------------------------------------------
    if hasattr(user, "teacher"):
        teacher = user.teacher

        children = Child.objects.filter(
            is_active=True,
            classroom__teachers=teacher
        ).select_related(
            "classroom"
        ).prefetch_related(
            "classroom__teachers__user",
            "parents__user"
        ).distinct()

    elif hasattr(user, "parent"):
        return Response(
            {"detail": "Parents do not have access to school insights."},
            status=status.HTTP_403_FORBIDDEN
        )

    elif user.is_staff or user.is_superuser:
        children = Child.objects.filter(
            is_active=True
        ).select_related(
            "classroom"
        ).prefetch_related(
            "classroom__teachers__user",
            "parents__user"
        )

    else:
        return Response(
            {"detail": "You do not have permission to view insights."},
            status=status.HTTP_403_FORBIDDEN
        )

    # ---------------------------------------------------------
    # 2. DATE RANGE
    # ---------------------------------------------------------
    today = timezone.localdate()

    start_date = parse_date(
        request.query_params.get("start_date", "")
    )

    end_date = parse_date(
        request.query_params.get("end_date", "")
    )

    if not end_date:
        end_date = today

    if not start_date:
        start_date = end_date - timedelta(days=6)

    if start_date > end_date:
        return Response(
            {"detail": "start_date cannot be after end_date."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ---------------------------------------------------------
    # 3. OPTIONAL FILTERS
    # ---------------------------------------------------------
    classroom_id = request.query_params.get("classroom")
    teacher_id = request.query_params.get("teacher")
    child_id = request.query_params.get("child")

    if classroom_id:
        children = children.filter(
            classroom_id=classroom_id
        )

    if teacher_id:
        children = children.filter(
            classroom__teachers__id=teacher_id
        ).distinct()

    if child_id:
        children = children.filter(
            id=child_id
        )

    children = list(children)

    child_ids = {child.id for child in children}

    # ---------------------------------------------------------
    # 4. ATTENDANCE
    # ---------------------------------------------------------
    attendance_records = list(
        Attendance.objects.filter(
            child_id__in=child_ids,
            attendance_date__range=(start_date, end_date)
        ).select_related(
            "child",
            "child__classroom",
            "teacher",
            "teacher__user"
        ).order_by(
            "-attendance_date",
            "child__first_name"
        )
    )

    present_records = [
        record
        for record in attendance_records
        if record.status == Attendance.PRESENT
    ]

    absent_records = [
        record
        for record in attendance_records
        if record.status == Attendance.ABSENT
    ]

    present_count = len(present_records)
    absent_count = len(absent_records)

    # A daily report is expected only when attendance is PRESENT.
    present_dates = {
        (
            record.child_id,
            record.attendance_date
        )
        for record in present_records
    }

    # ---------------------------------------------------------
    # 5. DAILY REPORTS
    # ---------------------------------------------------------
    report_records = list(
        DailyReport.objects.filter(
            child_id__in=child_ids,
            report_date__range=(start_date, end_date)
        ).select_related(
            "child",
            "child__classroom",
            "teacher",
            "teacher__user"
        ).prefetch_related(
            "activities"
        ).order_by(
            "-report_date",
            "child__first_name"
        )
    )

    valid_submitted_reports = [
        report
        for report in report_records
        if report.submitted
        and (
            report.child_id,
            report.report_date
        ) in present_dates
    ]

    reports_expected = present_count
    reports_submitted = len(valid_submitted_reports)

    reports_pending = max(
        reports_expected - reports_submitted,
        0
    )

    # ---------------------------------------------------------
    # 6. HELPER FUNCTIONS
    # ---------------------------------------------------------
    def increment(counter, key):
        if key:
            counter[key] += 1

    def completion_percentage(submitted, expected):
        if expected == 0:
            return 0

        return round(
            (submitted / expected) * 100,
            1
        )

    # ---------------------------------------------------------
    # 7. OVERALL DISTRIBUTIONS
    # ---------------------------------------------------------
    mood_counts = Counter()
    snack_counts = Counter()
    lunch_counts = Counter()
    participation_counts = Counter()
    activity_counts = Counter()

    for report in valid_submitted_reports:

        increment(
            mood_counts,
            report.mood
        )

        increment(
            snack_counts,
            report.morning_snack
        )

        increment(
            lunch_counts,
            report.lunch
        )

        increment(
            participation_counts,
            report.participation
        )

        for activity in report.activities.all():
            increment(
                activity_counts,
                activity.name
            )

    # ---------------------------------------------------------
    # 8. ATTENDANCE LOOKUP
    # ---------------------------------------------------------
    attendance_status_map = {
        (
            record.child_id,
            record.attendance_date
        ): record.status
        for record in attendance_records
    }

    # ---------------------------------------------------------
    # 9. CHILD-LEVEL INSIGHTS
    # ---------------------------------------------------------
    children_data = []

    for child in children:

        child_attendance = [
            record
            for record in attendance_records
            if record.child_id == child.id
        ]

        child_present = [
            record
            for record in child_attendance
            if record.status == Attendance.PRESENT
        ]

        child_absent = [
            record
            for record in child_attendance
            if record.status == Attendance.ABSENT
        ]

        child_reports = [
            report
            for report in report_records
            if report.child_id == child.id
        ]

        child_valid_reports = [
            report
            for report in valid_submitted_reports
            if report.child_id == child.id
        ]

        child_mood = Counter()
        child_snack = Counter()
        child_lunch = Counter()
        child_participation = Counter()
        child_activities = Counter()

        for report in child_valid_reports:

            increment(
                child_mood,
                report.mood
            )

            increment(
                child_snack,
                report.morning_snack
            )

            increment(
                child_lunch,
                report.lunch
            )

            increment(
                child_participation,
                report.participation
            )

            for activity in report.activities.all():
                increment(
                    child_activities,
                    activity.name
                )

        # -----------------------------------------------------
        # Attention indicators
        # -----------------------------------------------------
        needs_attention = []

        if child_mood["tired"] >= 2:
            needs_attention.append(
                "Frequently reported as tired"
            )

        if child_lunch["did_not_eat"] >= 2:
            needs_attention.append(
                "Frequently did not eat lunch"
            )

        if child_snack["did_not_eat"] >= 2:
            needs_attention.append(
                "Frequently did not eat morning snack"
            )

        # -----------------------------------------------------
        # Daily report drill-down
        # -----------------------------------------------------
        daily_reports = []

        for report in child_reports:

            attendance_status = attendance_status_map.get(
                (
                    report.child_id,
                    report.report_date
                )
            )

            daily_reports.append({
                "id": report.id,
                "date": report.report_date,
                "mood": report.mood,
                "morning_snack": report.morning_snack,
                "lunch": report.lunch,
                "rest_status": report.rest_status,
                "rest_start": report.rest_start,
                "rest_end": report.rest_end,
                "participation": report.participation,
                "teacher_observation": report.teacher_observation,
                "activities": [
                    activity.name
                    for activity in report.activities.all()
                ],
                "teacher": {
                    "id": report.teacher_id,
                    "name": str(report.teacher)
                },
                "submitted": report.submitted,
                "attendance_status": attendance_status,
                "is_valid_for_completion": (
                    report.submitted
                    and attendance_status == Attendance.PRESENT
                ),
            })

        children_data.append({
            "id": child.id,
            "name": str(child),
            "classroom": (
                child.classroom.name
                if child.classroom
                else ""
            ),
            "academic_year": (
                child.classroom.academic_year
                if child.classroom
                else ""
            ),

            "attendance": {
                "present": len(child_present),
                "absent": len(child_absent),
                "marked": len(child_attendance),
            },

            "reports": {
                "expected": len(child_present),
                "submitted": len(child_valid_reports),
                "pending": max(
                    len(child_present)
                    - len(child_valid_reports),
                    0
                ),
                "total_records": len(child_reports),
            },

            "mood": dict(child_mood),
            "morning_snack": dict(child_snack),
            "lunch": dict(child_lunch),
            "participation": dict(child_participation),
            "activities": dict(child_activities),

            "needs_attention": needs_attention,

            "daily_reports": daily_reports,
        })

    # ---------------------------------------------------------
    # 10. CLASSROOM INSIGHTS
    # ---------------------------------------------------------
    classroom_map = {}

    for child in children:

        if not child.classroom:
            continue

        classroom_id = child.classroom.id

        if classroom_id not in classroom_map:
            classroom_map[classroom_id] = {
                "classroom": child.classroom,
                "children": []
            }

        classroom_map[classroom_id]["children"].append(
            child
        )

    classrooms_data = []

    for classroom_id, data in classroom_map.items():

        classroom = data["classroom"]
        classroom_children = data["children"]

        classroom_child_ids = {
            child.id
            for child in classroom_children
        }

        class_attendance = [
            record
            for record in attendance_records
            if record.child_id in classroom_child_ids
        ]

        class_present = [
            record
            for record in class_attendance
            if record.status == Attendance.PRESENT
        ]

        class_absent = [
            record
            for record in class_attendance
            if record.status == Attendance.ABSENT
        ]

        class_reports = [
            report
            for report in valid_submitted_reports
            if report.child_id in classroom_child_ids
        ]

        class_expected = len(class_present)
        class_submitted = len(class_reports)

        classrooms_data.append({
            "id": classroom.id,
            "name": classroom.name,
            "academic_year": classroom.academic_year,

            "teachers": [
                {
                    "id": teacher.id,
                    "name": str(teacher)
                }
                for teacher in classroom.teachers.all()
            ],

            "children": len(classroom_children),

            "attendance": {
                "marked": len(class_attendance),
                "present": len(class_present),
                "absent": len(class_absent),
            },

            "reports": {
                "expected": class_expected,
                "submitted": class_submitted,
                "pending": max(
                    class_expected - class_submitted,
                    0
                ),
                "completion_percentage": completion_percentage(
                    class_submitted,
                    class_expected
                ),
            },
        })

    classrooms_data.sort(
        key=lambda item: item["name"]
    )

    # ---------------------------------------------------------
    # 11. TEACHER TRACKING
    # ---------------------------------------------------------
    classroom_ids = set(
        classroom_map.keys()
    )

    relevant_teacher_ids = set()

    for classroom in ClassRoom.objects.filter(
        id__in=classroom_ids
    ).prefetch_related(
        "teachers__user"
    ):
        for teacher in classroom.teachers.all():
            relevant_teacher_ids.add(
                teacher.id
            )

    for record in attendance_records:
        if record.teacher_id:
            relevant_teacher_ids.add(
                record.teacher_id
            )

    for report in report_records:
        if report.teacher_id:
            relevant_teacher_ids.add(
                report.teacher_id
            )

    teachers = Teacher.objects.filter(
        id__in=relevant_teacher_ids
    ).select_related(
        "user"
    ).prefetch_related(
        "classroom_set"
    )

    teachers_data = []

    for teacher in teachers:

        assigned_classrooms = [
            classroom
            for classroom in classroom_map.values()
            if classroom["classroom"].teachers.filter(
                id=teacher.id
            ).exists()
        ]

        assigned_classroom_names = [
            item["classroom"].name
            for item in assigned_classrooms
        ]

        assigned_children = [
            child
            for child in children
            if child.classroom
            and child.classroom.teachers.filter(
                id=teacher.id
            ).exists()
        ]

        teacher_attendance = [
            record
            for record in attendance_records
            if record.teacher_id == teacher.id
        ]

        teacher_present = [
            record
            for record in teacher_attendance
            if record.status == Attendance.PRESENT
        ]

        teacher_absent = [
            record
            for record in teacher_attendance
            if record.status == Attendance.ABSENT
        ]

        teacher_reports = [
            report
            for report in valid_submitted_reports
            if report.teacher_id == teacher.id
        ]

        teacher_expected = len(teacher_present)
        teacher_submitted = len(teacher_reports)

        teachers_data.append({
            "id": teacher.id,
            "name": str(teacher),

            "assigned_classrooms": assigned_classroom_names,

            "assigned_children": len(
                assigned_children
            ),

            "attendance": {
                "marked": len(teacher_attendance),
                "present": len(teacher_present),
                "absent": len(teacher_absent),
            },

            "reports": {
                "expected": teacher_expected,
                "submitted": teacher_submitted,
                "pending": max(
                    teacher_expected - teacher_submitted,
                    0
                ),
                "completion_percentage": completion_percentage(
                    teacher_submitted,
                    teacher_expected
                ),
            },
        })

    teachers_data.sort(
        key=lambda item: item["name"]
    )

    # ---------------------------------------------------------
    # 12. DAILY BREAKDOWN
    # ---------------------------------------------------------
    data_dates = sorted(
        set(
            record.attendance_date
            for record in attendance_records
        )
        |
        set(
            report.report_date
            for report in report_records
        ),
        reverse=True
    )

    daily_data = []

    for current_date in data_dates:

        date_attendance = [
            record
            for record in attendance_records
            if record.attendance_date == current_date
        ]

        date_present = [
            record
            for record in date_attendance
            if record.status == Attendance.PRESENT
        ]

        date_absent = [
            record
            for record in date_attendance
            if record.status == Attendance.ABSENT
        ]

        date_present_keys = {
            (
                record.child_id,
                record.attendance_date
            )
            for record in date_present
        }

        date_submitted_reports = [
            report
            for report in report_records
            if report.submitted
            and (
                report.child_id,
                report.report_date
            ) in date_present_keys
        ]

        date_expected = len(date_present)

        date_submitted = len(
            date_submitted_reports
        )

        daily_data.append({
            "date": current_date,

            "attendance_records": len(
                date_attendance
            ),

            "present": len(
                date_present
            ),

            "absent": len(
                date_absent
            ),

            "reports_expected": date_expected,

            "reports_submitted": date_submitted,

            "reports_pending": max(
                date_expected - date_submitted,
                0
            ),

            "report_completion_percentage":
                completion_percentage(
                    date_submitted,
                    date_expected
                ),
        })

    # ---------------------------------------------------------
    # 13. FINAL RESPONSE
    # ---------------------------------------------------------
    return Response({
        "period": {
            "start_date": start_date,
            "end_date": end_date,
        },

        "overview": {
            "children": len(children),

            "attendance_records": len(
                attendance_records
            ),

            "present": present_count,

            "absent": absent_count,

            "reports_expected": reports_expected,

            "reports_submitted": reports_submitted,

            "reports_pending": reports_pending,

            "report_completion_percentage":
                completion_percentage(
                    reports_submitted,
                    reports_expected
                ),
        },

        "mood": dict(mood_counts),

        "morning_snack": dict(
            snack_counts
        ),

        "lunch": dict(
            lunch_counts
        ),

        "participation": dict(
            participation_counts
        ),

        "activities": dict(
            activity_counts
        ),

        "classrooms": classrooms_data,

        "teachers": teachers_data,

        "daily": daily_data,

        "children": children_data,
    })