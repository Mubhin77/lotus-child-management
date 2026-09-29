from rest_framework import serializers
from .models import (
    Teacher,
    Parent,
    ClassRoom,
    Child,
    Activity,
    DailyReport,
    Notice,
)


# class TeacherSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Teacher
#         fields = "__all__"

class TeacherSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(
        source="user.first_name",
        read_only=True
    )

    last_name = serializers.CharField(
        source="user.last_name",
        read_only=True
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = Teacher
        fields = [
            "id",
            "user",
            "first_name",
            "last_name",
            "username",
            "phone",
            "address",
            "is_active",
        ]


# class ParentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Parent
#         fields = "__all__"

class ParentSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(
        source="user.first_name",
        read_only=True
    )

    last_name = serializers.CharField(
        source="user.last_name",
        read_only=True
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    is_active = serializers.BooleanField(
        source="user.is_active",
        read_only=True
    )

    class Meta:
        model = Parent
        fields = [
            "id",
            "user",
            "first_name",
            "last_name",
            "username",
            "phone",
            "address",
            "is_active",
        ]

class ClassRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassRoom
        fields = "__all__"


class ChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Child
        fields = "__all__"


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = "__all__"


# class DailyReportSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = DailyReport
#         fields = "__all__"

class DailyReportSerializer(serializers.ModelSerializer):
    child_name = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()
    classroom_name = serializers.SerializerMethodField()
    activity_names = serializers.SerializerMethodField()
    teacher = serializers.PrimaryKeyRelatedField(
        read_only=True)

    class Meta:
        model = DailyReport
        fields = [
            "id",
            "child",
            "child_name",
            "teacher",
            "teacher_name",
            "classroom_name",
            "report_date",
            "attendance_present",
            "arrival_time",
            "departure_time",
            "mood",
            "morning_snack",
            "lunch",
            "rest_status",
            "rest_start",
            "rest_end",
            "participation",
            "teacher_observation",
            "activities",
            "activity_names",
            "submitted",
            "created_at",
            "updated_at",
        ]

    def get_child_name(self, obj):
        return str(obj.child)

    def get_teacher_name(self, obj):
        return str(obj.teacher)

    def get_classroom_name(self, obj):
        if obj.child.classroom:
            return obj.child.classroom.name
        return ""

    def get_activity_names(self, obj):
        return list(
            obj.activities.values_list("name", flat=True)
        )

class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = "__all__"