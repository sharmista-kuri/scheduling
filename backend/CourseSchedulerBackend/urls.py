from django.contrib import admin
from django.urls import path
from scheduler import views  # ← replace 'your_app' with your real app name
from django.http import JsonResponse

def cors_test_view(request):
    return JsonResponse({"message": "CORS works!"})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/test-cors/', cors_test_view),
    path('api/login/', views.login_view),
    path('api/signup/', views.signup_view),
    path('api/change_password/', views.change_password, name='change_password'),
    path('api/run-scheduler/', views.run_scheduler),
    path('api/admin/total_counts/', views.total_counts),
    path('api/faculty/<int:fid>/courses/', views.courses_by_faculty),
    path('api/upload_csv/', views.upload_csv_view),



    # ---------- Faculty ----------
    path('api/faculty/', views.faculty_list_view),
    path('api/faculty/create/', views.faculty_create_view),
    path('api/faculty/<int:fid>/', views.faculty_profile_view),
    path('api/faculty/<int:fid>/update/', views.faculty_update_view),
    path('api/faculty/<int:fid>/update_all/', views.faculty_all_update_view),
    path('api/faculty/<int:fid>/delete/', views.faculty_delete_view),


    # ---------- Comments ----------
    path('api/comment/', views.comment_post_view),
    path('api/comments/<int:crn>/', views.comment_list_view),
    path('api/comment/<int:cid>/edit/', views.comment_edit_view),
    path('api/comment/<int:cid>/delete/', views.comment_delete_view),

    # ---------- Courses ----------
    path('api/courses/', views.course_list_view),
    path('api/course/create/', views.course_create_view),
    path('api/course/<int:crn>/update/', views.course_update_view),
    path('api/course/<int:crn>/delete/', views.course_delete_view),
    path('api/course/<int:crn>/relations/', views.course_relation_view),
    path('api/courses/by-crns/', views.get_courses_by_crns),


    # ---------- Configuration ----------
    path('api/config/<int:fid>/', views.configuration_view),
    path('api/config/<int:fid>/save/', views.configuration_save_view),
    path('api/possible_times/', views.possible_times_view),

    
    path('api/configurations/', views.list_configurations),
    path('api/configurations/create/', views.create_configuration),
    path('api/configurations/<int:config_id>/', views.update_configuration),
    path('api/configurations/<int:config_id>/', views.delete_configuration),


]
