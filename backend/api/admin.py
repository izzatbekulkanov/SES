from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Course, StudentProfile, LessonProgress, Certificate

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('role',)}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(Course)
admin.site.register(StudentProfile)
admin.site.register(LessonProgress)
admin.site.register(Certificate)
