from django.db import models
from django.contrib.auth.models import User


class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class Parent(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class ClassRoom(models.Model):
    name = models.CharField(max_length=100)
    academic_year = models.CharField(max_length=20)
    teachers = models.ManyToManyField(Teacher, blank=True)

    def __str__(self):
        return f"{self.name} - {self.academic_year}"


class Child(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    roll_number = models.PositiveIntegerField(null=True, blank=True)

    parents = models.ManyToManyField(
        Parent,
        related_name="children",
        blank=True
    )

    classroom = models.ForeignKey(
        ClassRoom,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="children"
    )

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Activity(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Attendance(models.Model):
    PRESENT = "present"
    ABSENT = "absent"

    STATUS_CHOICES = [
        (PRESENT, "Present"),
        (ABSENT, "Absent"),
    ]

    child = models.ForeignKey(
        Child,
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="attendance_records",
    )
    attendance_date = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
    )
    marked_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-attendance_date", "child__first_name"]
        constraints = [
            models.UniqueConstraint(
                fields=["child", "attendance_date"],
                name="unique_child_attendance_date",
            )
        ]

    def __str__(self):
        return f"{self.child} - {self.attendance_date} - {self.status}"


class DailyReport(models.Model):

    MOOD_CHOICES = [
        ("happy", "Happy"),
        ("good", "Good"),
        ("normal", "Normal"),
        ("tired", "Tired"),
    ]

    PARTICIPATION_CHOICES = [
        ("participated", "Participated"),
        ("partial", "Partially Participated"),
        ("not_participated", "Not Participated"),
    ]

    REST_CHOICES = [
        ("slept", "Slept"),
        ("rested", "Rested"),
        ("did_not_rest", "Did Not Rest"),
    ]

    MEAL_CHOICES = [
        ("finished", "Finished"),
        ("partial", "Partly"),
        ("did_not_eat", "Did Not Eat"),
    ]

    child = models.ForeignKey(
        Child,
        on_delete=models.CASCADE,
        related_name="daily_reports"
    )

    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.PROTECT,
        related_name="daily_reports"
    )

    report_date = models.DateField()

    mood = models.CharField(
        max_length=30,
        choices=MOOD_CHOICES,
        blank=True
    )

    morning_snack = models.CharField(
        max_length=30,
        choices=MEAL_CHOICES,
        blank=True
    )

    lunch = models.CharField(
        max_length=30,
        choices=MEAL_CHOICES,
        blank=True
    )

    rest_status = models.CharField(
        max_length=30,
        choices=REST_CHOICES,
        blank=True
    )

    rest_start = models.TimeField(null=True, blank=True)
    rest_end = models.TimeField(null=True, blank=True)

    participation = models.CharField(
        max_length=30,
        choices=PARTICIPATION_CHOICES,
        blank=True
    )

    teacher_observation = models.TextField(blank=True)

    activities = models.ManyToManyField(
        Activity,
        blank=True,
        related_name="daily_reports"
    )

    submitted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["child", "report_date"],
                name="unique_child_daily_report"
            )
        ]
        ordering = ["-report_date"]

    def __str__(self):
        return f"{self.child} - {self.report_date}"

class Notice(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()

    notice_date = models.DateField()
    event_date = models.DateField(null=True, blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-notice_date", "-created_at"]
    def __str__(self):
        return self.title