from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import StudentProfile, Course, LessonProgress, Certificate

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()
    courses = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    organization = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'role',
                  'passport_series', 'passport_number', 'jshshir',
                  'birth_date', 'father_name', 'profile_picture', 'courses',
                  'phone_number', 'organization')

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.profile_picture:
            url = obj.profile_picture.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_courses(self, obj):
        if obj.role == 'STUDENT':
            return [{"id": c.id, "title": c.title} for c in obj.assigned_courses.all()]
        return []

    def get_phone_number(self, obj):
        if hasattr(obj, 'student_profile'):
            return obj.student_profile.phone_number
        return ""

    def get_organization(self, obj):
        if hasattr(obj, 'student_profile'):
            return obj.student_profile.organization
        return ""


class StudentSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.CharField(source='user.email', required=False, allow_blank=True)
    passport_series = serializers.CharField(source='user.passport_series', required=False, allow_blank=True)
    passport_number = serializers.CharField(source='user.passport_number', required=False, allow_blank=True)
    jshshir = serializers.CharField(source='user.jshshir', required=False, allow_blank=True)
    father_name = serializers.CharField(source='user.father_name', required=False, allow_blank=True)
    profile_picture = serializers.SerializerMethodField()

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.user.profile_picture:
            url = obj.user.profile_picture.url
            return request.build_absolute_uri(url) if request else url
        return None
    completed_lessons = serializers.SerializerMethodField()
    has_certificate = serializers.SerializerMethodField()
    certificate_id = serializers.SerializerMethodField()
    courses = serializers.SerializerMethodField()
    completed_lessons_by_course = serializers.SerializerMethodField()
    certificates = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = (
            'id', 
            'username', 
            'first_name', 
            'last_name', 
            'father_name',
            'email', 
            'passport_series', 
            'passport_number', 
            'jshshir',
            'phone_number', 
            'organization', 
            'profile_picture',
            'completed_lessons', 
            'has_certificate', 
            'certificate_id',
            'courses',
            'completed_lessons_by_course',
            'certificates'
        )

    def get_completed_lessons(self, obj):
        progress = LessonProgress.objects.filter(student=obj.user).first()
        return progress.completed_lessons if progress else []

    def get_has_certificate(self, obj):
        return Certificate.objects.filter(student=obj.user).exists()

    def get_certificate_id(self, obj):
        cert = Certificate.objects.filter(student=obj.user).first()
        return cert.certificate_id if cert else None

    def get_courses(self, obj):
        return [{"id": c.id, "title": c.title} for c in obj.user.assigned_courses.all()]

    def get_completed_lessons_by_course(self, obj):
        progresses = LessonProgress.objects.filter(student=obj.user)
        return {p.course_id: p.completed_lessons for p in progresses}

    def get_certificates(self, obj):
        request = self.context.get('request')
        certs = Certificate.objects.filter(student=obj.user)
        res = []
        for c in certs:
            pdf_url = c.pdf_file.url if c.pdf_file else None
            qr_url = c.qr_code_image.url if c.qr_code_image else None
            if request:
                if pdf_url:
                    pdf_url = request.build_absolute_uri(pdf_url)
                if qr_url:
                    qr_url = request.build_absolute_uri(qr_url)
            # Word file URL
            import os
            from django.conf import settings
            word_rel = f"certificates/words/{c.certificate_id}.docx"
            word_path = os.path.join(settings.MEDIA_ROOT, word_rel)
            word_url = None
            if os.path.exists(word_path):
                word_url_rel = f"{settings.MEDIA_URL}{word_rel}"
                word_url = request.build_absolute_uri(word_url_rel) if request else word_url_rel
            res.append({
                "course_id": c.course_id,
                "course_name": c.course.title,
                "certificate_id": c.certificate_id,
                "pdf_file": pdf_url,
                "word_file": word_url,
                "qr_code_image": qr_url,
                "issued_at": c.issued_at.strftime('%d.%m.%Y') if c.issued_at else None,
                "expires_at": c.expires_at.strftime('%d.%m.%Y') if c.expires_at else None,
            })
        return res


class CourseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    student_count = serializers.IntegerField(source='students.count', read_only=True)

    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'teacher', 'teacher_name', 'start_date', 'end_date', 'total_lessons', 'student_count')

    def get_teacher_name(self, obj):
        full_name = obj.teacher.get_full_name()
        return full_name if full_name else obj.teacher.username


class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_username = serializers.CharField(source='student.username', read_only=True)
    student_picture = serializers.SerializerMethodField()
    course_name = serializers.CharField(source='course.title')
    issued_date = serializers.SerializerMethodField()
    expiry_date = serializers.SerializerMethodField()
    word_file = serializers.SerializerMethodField()
    raw_expires_at = serializers.DateTimeField(source='expires_at', read_only=True)

    class Meta:
        model = Certificate
        fields = ('certificate_id', 'student_name', 'student_username', 'student_picture',
                  'course_name', 'qr_code_image', 'pdf_file', 'word_file',
                  'issued_at', 'expires_at', 'raw_expires_at', 'is_active', 'issued_date', 'expiry_date')

    def get_student_name(self, obj):
        full_name = obj.student.get_full_name()
        return full_name if full_name else obj.student.username

    def get_student_picture(self, obj):
        request = self.context.get('request')
        if obj.student.profile_picture:
            url = obj.student.profile_picture.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_issued_date(self, obj):
        return obj.issued_at.strftime('%d.%m.%Y') if obj.issued_at else None

    def get_expiry_date(self, obj):
        return obj.expires_at.strftime('%d.%m.%Y') if obj.expires_at else None

    def get_word_file(self, obj):
        """Return absolute URL to the Word (.docx) file if it exists in media."""
        import os
        from django.conf import settings
        request = self.context.get('request')
        word_rel = f"certificates/words/{obj.certificate_id}.docx"
        word_path = os.path.join(settings.MEDIA_ROOT, word_rel)
        if os.path.exists(word_path):
            url = f"{settings.MEDIA_URL}{word_rel}"
            return request.build_absolute_uri(url) if request else url
        return None
