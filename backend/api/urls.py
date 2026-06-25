from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    auth_me,
    change_password,
    admin_users,
    admin_reset_password,
    admin_teacher_stats,
    teacher_courses,
    teacher_students,
    course_add_student,
    toggle_lesson,
    generate_certificate,
    verify_certificate,
    verify_certificates_by_passport,
    student_progress,
    admin_all_certificates,
    teacher_import_excel,
    download_excel_template,
    admin_delete_user,
    teacher_delete_student,
    admin_delete_certificate,
    admin_export_certificates_excel,
    admin_check_certificate_id,
    admin_edit_certificate_id
)

urlpatterns = [
    # Auth
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', auth_me, name='auth_me'),
    path('auth/change-password/', change_password, name='change_password'),
    
    # Admin User management
    path('admin/users/', admin_users, name='admin_users'),
    path('admin/users/<int:user_id>/delete/', admin_delete_user, name='admin_delete_user'),
    path('admin/reset-password/', admin_reset_password, name='admin_reset_password'),
    path('admin/teacher-stats/', admin_teacher_stats, name='admin_teacher_stats'),
    path('admin/certificates/', admin_all_certificates, name='admin_all_certificates'),
    path('admin/certificates/export-excel/', admin_export_certificates_excel, name='admin_export_certificates_excel'),
    path('admin/certificates/check-id/', admin_check_certificate_id, name='admin_check_certificate_id'),
    path('admin/certificates/<str:certificate_id>/delete/', admin_delete_certificate, name='admin_delete_certificate'),
    path('admin/certificates/<str:certificate_id>/edit/', admin_edit_certificate_id, name='admin_edit_certificate_id'),
    
    # Teacher operations
    path('teacher/courses/', teacher_courses, name='teacher_courses'),
    path('teacher/courses/<int:course_id>/add-student/', course_add_student, name='course_add_student'),
    path('teacher/courses/<int:course_id>/import-excel/', teacher_import_excel, name='teacher_import_excel'),
    path('teacher/courses/download-template/', download_excel_template, name='download_excel_template'),
    path('teacher/students/', teacher_students, name='teacher_students'),
    path('teacher/students/<int:student_id>/delete/', teacher_delete_student, name='teacher_delete_student'),
    path('teacher/students/<int:student_id>/toggle-lesson/', toggle_lesson, name='toggle_lesson'),
    path('teacher/students/<int:student_id>/generate-certificate/', generate_certificate, name='generate_certificate'),
    
    # Student operations
    path('student/progress/', student_progress, name='student_progress'),
    
    # Public verification
    path('certificates/verify/<str:certificate_id>/', verify_certificate, name='verify_certificate'),
    path('certificates/verify-passport/', verify_certificates_by_passport, name='verify_certificates_by_passport'),
]
