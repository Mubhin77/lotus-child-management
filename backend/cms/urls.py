from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TeacherViewSet,
    ParentViewSet,
    ClassRoomViewSet,
    ChildViewSet,
    ActivityViewSet,
    DailyReportViewSet,
    NoticeViewSet,
    current_user,
)


router = DefaultRouter()

router.register("teachers", TeacherViewSet)
router.register("parents", ParentViewSet)
router.register("classes", ClassRoomViewSet)
router.register("children", ChildViewSet, basename="child")
router.register("activities", ActivityViewSet)
router.register("daily-reports", DailyReportViewSet, basename="daily-report")
router.register("notices", NoticeViewSet, basename="notice")


# urlpatterns = [
#     path("", include(router.urls)),
# ]

urlpatterns = [
    path("me/", current_user, name="current-user"),
    path("", include(router.urls)),
]