from django.contrib import admin
from .models import (
    Teacher,
    Parent,
    ClassRoom,
    Child,
    Activity,
    Attendance,
    DailyReport,
    Notice,
)


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "is_active")
    search_fields = ("user__username", "user__first_name", "user__last_name")


@admin.register(Parent)
class ParentAdmin(admin.ModelAdmin):
    list_display = ("user", "phone")
    search_fields = ("user__username", "user__first_name", "user__last_name")


@admin.register(ClassRoom)
class ClassRoomAdmin(admin.ModelAdmin):
    list_display = ("name", "academic_year")
    list_filter = ("academic_year",)
    search_fields = ("name",)


@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = (
        "first_name",
        "last_name",
        "date_of_birth",
        "classroom",
        "roll_number",
        "is_active",
    )
    list_filter = ("classroom", "is_active")
    search_fields = ("first_name", "last_name")


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "child",
        "teacher",
        "attendance_date",
        "status",
        "marked_at",
    )

    list_filter = (
        "attendance_date",
        "status",
    )

    search_fields = (
        "child__first_name",
        "child__last_name",
        "teacher__user__username",
    )


@admin.register(DailyReport)
class DailyReportAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "child",
        "teacher",
        "report_date",
        "mood",
        "submitted",
    )

    list_filter = (
        "report_date",
        "submitted",
        "mood",
    )

    search_fields = (
        "child__first_name",
        "child__last_name",
        "teacher__user__username",
    )

    filter_horizontal = (
        "activities",
    )
admin.site.register(Notice)