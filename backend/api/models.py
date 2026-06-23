from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        TEACHER = 'TEACHER', 'Teacher'
        STUDENT = 'STUDENT', 'Student'
        
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    passport_series = models.CharField(max_length=5, blank=True)
    passport_number = models.CharField(max_length=15, blank=True)
    jshshir = models.CharField(max_length=14, blank=True)
    birth_date = models.DateField(blank=True, null=True)
    father_name = models.CharField(max_length=150, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)


    def is_admin(self):
        return self.role == self.Role.ADMIN

    def is_teacher(self):
        return self.role == self.Role.TEACHER

    def is_student(self):
        return self.role == self.Role.STUDENT


class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'TEACHER'},
        related_name='created_courses'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    total_lessons = models.IntegerField(default=10)
    students = models.ManyToManyField(
        User,
        related_name='assigned_courses',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} (Teacher: {self.teacher.username})"


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    teacher = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        limit_choices_to={'role': 'TEACHER'}, 
        related_name='students'
    )
    phone_number = models.CharField(max_length=20, blank=True)
    organization = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} ({self.user.username})"


class LessonProgress(models.Model):
    student = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        limit_choices_to={'role': 'STUDENT'}, 
        related_name='progress'
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='progress')
    completed_lessons = models.JSONField(default=list) # e.g. [1, 2, 3, 4]

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} - {self.course.title} Progress"


def certificate_pdf_path(instance, filename):
    return f"certificates/pdfs/{instance.certificate_id}.pdf"

def certificate_qr_path(instance, filename):
    return f"certificates/qrs/{instance.certificate_id}.png"

class Certificate(models.Model):
    certificate_id = models.CharField(max_length=50, unique=True, primary_key=True)
    student = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        limit_choices_to={'role': 'STUDENT'}, 
        related_name='certificates'
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    qr_code_image = models.ImageField(upload_to=certificate_qr_path, blank=True, null=True)
    pdf_file = models.FileField(upload_to=certificate_pdf_path, blank=True, null=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Certificate {self.certificate_id} for {self.student.username} ({self.course.title})"
