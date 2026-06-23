import random
import string
import re
from datetime import timedelta, datetime
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import StudentProfile, Course, LessonProgress, Certificate
from .serializers import UserSerializer, StudentSerializer, CourseSerializer, CertificateSerializer
from .utils import generate_pdf_and_qr

User = get_user_model()

# Helper to normalize Uzbek characters to clean English letters
def normalize_uzbek_name(name):
    name = name.lower().strip()
    name = name.replace("o'", "o").replace("g'", "g").replace("o`", "o").replace("g`", "g")
    name = name.replace("sh", "sh").replace("ch", "ch")
    name = re.sub(r'[^a-zA-Z0-9]', '_', name)
    return name

# Helper to generate unique username matching ismi_familiyasi
def generate_username(first_name, last_name):
    first = normalize_uzbek_name(first_name)
    last = normalize_uzbek_name(last_name)
    base_username = f"{first}_{last}"
    
    # Trim excessive underscores
    base_username = re.sub(r'_+', '_', base_username).strip('_')
    
    if not base_username:
        base_username = "user"
        
    username = base_username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}_{counter}"
        counter += 1
    return username

# Helper to check if user has admin permission
def is_admin_user(user):
    return user.role == User.Role.ADMIN or user.is_staff or user.is_superuser

# Helper to check if user has teacher permission
def is_teacher_user(user):
    return user.role == User.Role.TEACHER or is_admin_user(user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def auth_me(request):
    """
    Get details of the currently authenticated user.
    """
    serializer = UserSerializer(request.user, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """
    Change password of the logged-in user.
    Payload: {"current_password": "...", "new_password": "..."}
    """
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response({"detail": "Amaldagi parol va yangi parol kiritilishi shart."}, status=status.HTTP_400_BAD_REQUEST)
        
    if not request.user.check_password(current_password):
        return Response({"detail": "Amaldagi parol noto'g'ri kiritildi."}, status=status.HTTP_400_BAD_REQUEST)
        
    request.user.set_password(new_password)
    request.user.save()
    return Response({"detail": "Parol muvaffaqiyatli yangilandi."})


# --- ADMIN ENDPOINTS ---

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def admin_users(request):
    """
    GET: List all teachers and students (Admin view).
    POST: Create a new Teacher user.
    """
    if not is_admin_user(request.user):
        return Response({"detail": "Ushbu sahifani ko'rish uchun ruxsatingiz yo'q (Admin talab etiladi)."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        users = User.objects.all().order_by('-id')
        serializer = UserSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email', '')
        passport_series = request.data.get('passport_series', '')
        passport_number = request.data.get('passport_number', '')
        jshshir = request.data.get('jshshir', '')
        birth_date = request.data.get('birth_date') or None
        father_name = request.data.get('father_name', '')
        role = request.data.get('role', User.Role.TEACHER)
        profile_picture = request.FILES.get('profile_picture')

        if not first_name or not last_name:
            return Response({"detail": "Ism va Familiya kiritilishi shart."}, status=status.HTTP_400_BAD_REQUEST)

        if role not in [User.Role.TEACHER, User.Role.ADMIN]:
            return Response({"detail": "Noto'g'ri rol tanlandi."}, status=status.HTTP_400_BAD_REQUEST)

        username = generate_username(first_name, last_name)
        
        new_user = User.objects.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            passport_series=passport_series.upper(),
            passport_number=passport_number,
            jshshir=jshshir,
            birth_date=birth_date,
            father_name=father_name,
            password='ses2026',
            role=role,
            profile_picture=profile_picture
        )

        serializer = UserSerializer(new_user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def admin_reset_password(request):
    """
    Reset target user's password back to 'ses2026'. (Admin only)
    Payload: {"user_id": int}
    """
    if not is_admin_user(request.user):
        return Response({"detail": "Faqat administratorlar parollarni qayta tiklay oladilar."}, status=status.HTTP_403_FORBIDDEN)

    user_id = request.data.get('user_id')
    if not user_id:
        return Response({"detail": "Foydalanuvchi ID kiritilishi shart."}, status=status.HTTP_400_BAD_REQUEST)

    target_user = get_object_or_404(User, id=user_id)
    target_user.set_password('ses2026')
    target_user.save()

    return Response({"detail": f"Foydalanuvchi {target_user.username} paroli 'ses2026' ga qaytarildi."})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admin_all_certificates(request):
    """
    GET: List all certificates in the system.
    Supports Admin (all certificates) and Teacher (only their course certificates).
    Supports optional search by student name or certificate_id.
    """
    is_admin = is_admin_user(request.user)
    is_teacher = is_teacher_user(request.user)

    if not is_admin and not is_teacher:
        return Response({"detail": "Faqat administratorlar va o'qituvchilar sertifikatlarni ko'ra oladi."}, status=status.HTTP_403_FORBIDDEN)

    search = request.GET.get('search', '').strip()
    
    if is_admin:
        certs = Certificate.objects.select_related('student', 'course').order_by('-issued_at')
    else:
        certs = Certificate.objects.filter(course__teacher=request.user).select_related('student', 'course').order_by('-issued_at')

    if search:
        if is_admin:
            certs = certs.filter(
                certificate_id__icontains=search
            ) | Certificate.objects.filter(
                student__first_name__icontains=search
            ) | Certificate.objects.filter(
                student__last_name__icontains=search
            ) | Certificate.objects.filter(
                course__title__icontains=search
            )
        else:
            certs = certs.filter(
                course__teacher=request.user,
                certificate_id__icontains=search
            ) | Certificate.objects.filter(
                course__teacher=request.user,
                student__first_name__icontains=search
            ) | Certificate.objects.filter(
                course__teacher=request.user,
                student__last_name__icontains=search
            ) | Certificate.objects.filter(
                course__teacher=request.user,
                course__title__icontains=search
            )
        certs = certs.distinct().order_by('-issued_at')

    result = []
    for cert in certs:
        student = cert.student
        pic = None
        if student.profile_picture:
            pic = request.build_absolute_uri(student.profile_picture.url)
        
        # Build absolute pdf path if file exists
        pdf_path = None
        if cert.pdf_file:
            pdf_path = request.build_absolute_uri(cert.pdf_file.url)

        result.append({
            "certificate_id": cert.certificate_id,
            "student_id": student.id,
            "student_name": student.get_full_name() or student.username,
            "student_username": student.username,
            "student_picture": pic,
            "course_id": cert.course.id,
            "course_name": cert.course.title,
            "teacher_id": cert.course.teacher.id,
            "teacher_name": cert.course.teacher.get_full_name() or cert.course.teacher.username,
            "issued_at": cert.issued_at.strftime('%d.%m.%Y') if cert.issued_at else None,
            "expires_at": cert.expires_at.strftime('%d.%m.%Y') if cert.expires_at else None,
            "is_active": cert.is_active,
            "qr_code_image": request.build_absolute_uri(cert.qr_code_image.url) if cert.qr_code_image else None,
            "pdf_file": pdf_path,
        })

    return Response(result)


# --- TEACHER ENDPOINTS ---

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def teacher_courses(request):
    """
    GET: List all courses created by the logged-in teacher (or all courses for admin).
    POST: Create a new Course.
    """
    if not is_teacher_user(request.user):
        return Response({"detail": "Darslarni boshqarish faqat o'qituvchilarga ruxsat berilgan."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        if is_admin_user(request.user):
            courses = Course.objects.all().order_by('-id')
        else:
            courses = Course.objects.filter(teacher=request.user).order_by('-id')
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        title = request.data.get('title')
        description = request.data.get('description', '')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        total_lessons = request.data.get('total_lessons', 10)

        if not title or not start_date or not end_date:
            return Response({"detail": "Kurs nomi, boshlanish va tugash sanalari majburiy."}, status=status.HTTP_400_BAD_REQUEST)

        course = Course.objects.create(
            title=title,
            description=description,
            teacher=request.user,
            start_date=start_date,
            end_date=end_date,
            total_lessons=int(total_lessons)
        )

        serializer = CourseSerializer(course)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def teacher_students(request):
    """
    GET: List all students linked to the teacher.
    Supports ?all=true to fetch all students for dropdown selection.
    """
    if not is_teacher_user(request.user):
        return Response({"detail": "Talabalarni boshqarish faqat o'qituvchilarga ruxsat berilgan."}, status=status.HTTP_403_FORBIDDEN)

    get_all = request.GET.get('all', 'false').lower() == 'true'

    if is_admin_user(request.user) or get_all:
        profiles = StudentProfile.objects.all().distinct().order_by('-id')
    else:
        from django.db.models import Q
        profiles = StudentProfile.objects.filter(
            Q(teacher=request.user) | Q(user__assigned_courses__teacher=request.user)
        ).distinct().order_by('-id')
        
    serializer = StudentSerializer(profiles, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@transaction.atomic
def course_add_student(request, course_id):
    """
    Add a student to a specific course.
    If 'student_id' is provided, enroll that existing student.
    Otherwise, create a new student user and profile automatically.
    """
    if not is_teacher_user(request.user):
        return Response({"detail": "O'quvchilarni kursga qo'shish faqat o'qituvchilarga ruxsat etiladi."}, status=status.HTTP_403_FORBIDDEN)

    course = get_object_or_404(Course, id=course_id)
    if not is_admin_user(request.user) and course.teacher != request.user:
        return Response({"detail": "Ushbu kursni tahrirlash huquqi sizda yo'q."}, status=status.HTTP_403_FORBIDDEN)

    student_id = request.data.get('student_id')
    if student_id:
        student_user = get_object_or_404(User, id=student_id, role=User.Role.STUDENT)
        # Associate student with this teacher's profile if not already
        profile = StudentProfile.objects.filter(user=student_user).first()
        if profile and profile.teacher != course.teacher and not is_admin_user(request.user):
            # If student was under another teacher, we can update them or allow sharing
            # In our system, one student profile belongs to one teacher, but let's check
            pass
        
        # Add to course
        course.students.add(student_user)
        # Initialize LessonProgress
        LessonProgress.objects.get_or_create(
            student=student_user,
            course=course,
            defaults={'completed_lessons': []}
        )
        if profile:
            serializer = StudentSerializer(profile, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({"detail": "Talaba profili topilmadi."}, status=status.HTTP_404_NOT_FOUND)

    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    email = request.data.get('email', '')
    phone_number = request.data.get('phone_number', '')
    organization = request.data.get('organization', '')
    passport_series = request.data.get('passport_series', '')
    passport_number = request.data.get('passport_number', '')
    jshshir = request.data.get('jshshir', '')
    profile_picture = request.FILES.get('profile_picture')

    if not first_name or not last_name:
        return Response({"detail": "Ism va Familiya majburiy."}, status=status.HTTP_400_BAD_REQUEST)

    # Autogenerate username
    username = generate_username(first_name, last_name)

    # 1. Create Student User with default password 'ses2026' and profile picture
    student_user = User.objects.create_user(
        username=username,
        first_name=first_name,
        last_name=last_name,
        email=email,
        passport_series=passport_series.upper(),
        passport_number=passport_number,
        jshshir=jshshir,
        password='ses2026',
        role=User.Role.STUDENT,
        profile_picture=profile_picture
    )

    # 2. Create StudentProfile
    profile = StudentProfile.objects.create(
        user=student_user,
        teacher=course.teacher,
        phone_number=phone_number,
        organization=organization
    )

    # 3. Add to Course students
    course.students.add(student_user)

    # 4. Initialize LessonProgress
    LessonProgress.objects.create(
        student=student_user,
        course=course,
        completed_lessons=[]
    )

    serializer = StudentSerializer(profile, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_lesson(request, student_id):
    """
    Toggle completed status of a lesson for a student in their course.
    Payload: {"course_id": int, "lesson_id": int, "completed": bool}
    """
    if not is_teacher_user(request.user):
        return Response({"detail": "Darslar holatini o'zgartirish faqat o'qituvchilarga ruxsat berilgan."}, status=status.HTTP_403_FORBIDDEN)

    course_id = request.data.get('course_id')
    lesson_id = request.data.get('lesson_id')
    completed = request.data.get('completed', False)

    if not course_id or lesson_id is None:
        return Response({"detail": "Course ID va Lesson ID kiritilishi shart."}, status=status.HTTP_400_BAD_REQUEST)

    student_user = get_object_or_404(User, id=student_id, role=User.Role.STUDENT)
    course = get_object_or_404(Course, id=course_id)

    # Check permission
    if not is_admin_user(request.user) and course.teacher != request.user:
        return Response({"detail": "Ushbu kurs o'quvchilarini boshqarishga huquqingiz yo'q."}, status=status.HTTP_403_FORBIDDEN)

    progress, created = LessonProgress.objects.get_or_create(student=student_user, course=course)
    completed_list = list(progress.completed_lessons)

    if completed:
        if lesson_id not in completed_list:
            completed_list.append(lesson_id)
    else:
        if lesson_id in completed_list:
            completed_list.remove(lesson_id)

    progress.completed_lessons = completed_list
    progress.save()

    return Response({
        "student_id": student_id,
        "course_id": course_id,
        "completed_lessons": progress.completed_lessons
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_certificate(request, student_id):
    """
    Generate certificate for a student.
    Payload: {"course_id": int}
    """
    if not is_teacher_user(request.user):
        return Response({"detail": "Faqat o'qituvchilar sertifikat yaratishi mumkin."}, status=status.HTTP_403_FORBIDDEN)

    course_id = request.data.get('course_id')
    if not course_id:
        return Response({"detail": "Course ID majburiy."}, status=status.HTTP_400_BAD_REQUEST)

    student_user = get_object_or_404(User, id=student_id, role=User.Role.STUDENT)
    course = get_object_or_404(Course, id=course_id)

    if not is_admin_user(request.user) and course.teacher != request.user:
        return Response({"detail": "Ushbu kurs sertifikatini yaratishga huquqingiz yo'q."}, status=status.HTTP_403_FORBIDDEN)

    # Check if certificate exists
    if Certificate.objects.filter(student=student_user, course=course).exists():
        cert = Certificate.objects.filter(student=student_user, course=course).first()
        serializer = CertificateSerializer(cert, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ── Barcha darslarni "yakunlandi" statusiga o'tkazish ─────────────────────
    # Sertifikat yaratishdan oldin o'quvchining ushbu kurs uchun barcha darslarini
    # tugallangan deb belgilaymiz.
    total = course.total_lessons or 0
    if total > 0:
        progress, _ = LessonProgress.objects.get_or_create(student=student_user, course=course)
        all_lessons = list(range(1, total + 1))
        # Add any missing lessons to completed list
        completed_set = set(progress.completed_lessons)
        completed_set.update(all_lessons)
        progress.completed_lessons = sorted(completed_set)
        progress.save()

    # Generate certificate ID
    def generate_cert_id():
        year = timezone.now().year
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        cert_id = f"SES-{year}-{random_str}"
        while Certificate.objects.filter(certificate_id=cert_id).exists():
            random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            cert_id = f"SES-{year}-{random_str}"
        return cert_id

    cert_id = generate_cert_id()
    expiry_date = timezone.now() + timedelta(days=365) # Valid for 1 year

    cert = Certificate(
        certificate_id=cert_id,
        student=student_user,
        course=course,
        expires_at=expiry_date
    )

    generate_pdf_and_qr(cert)
    cert.save()

    serializer = CertificateSerializer(cert, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# --- STUDENT ENDPOINTS ---

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_progress(request):
    """
    Get progress and certificate info of the logged-in student user.
    """
    if request.user.role != User.Role.STUDENT:
        return Response({"detail": "Ushbu sahifa faqat o'quvchilar uchun."}, status=status.HTTP_403_FORBIDDEN)

    progresses = LessonProgress.objects.filter(student=request.user)
    results = []
    
    for prog in progresses:
        cert = Certificate.objects.filter(student=request.user, course=prog.course).first()
        results.append({
            "course_id": prog.course.id,
            "course_title": prog.course.title,
            "completed_lessons": prog.completed_lessons,
            "total_lessons": prog.course.total_lessons,
            "start_date": prog.course.start_date.strftime('%d.%m.%Y'),
            "end_date": prog.course.end_date.strftime('%d.%m.%Y'),
            "has_certificate": cert is not None,
            "certificate": CertificateSerializer(cert, context={'request': request}).data if cert else None
        })

    return Response(results)


# --- PUBLIC ENDPOINTS ---

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def verify_certificate(request, certificate_id):
    """
    Verify certificate details by certificate ID.
    No auth required. Publicly accessible.
    """
    try:
        cert = Certificate.objects.get(certificate_id=certificate_id, is_active=True)
    except Certificate.DoesNotExist:
        return Response({"detail": "Sertifikat topilmadi yoki muddati yakunlangan."}, status=status.HTTP_404_NOT_FOUND)

    # Check expiration
    if cert.expires_at < timezone.now():
        cert.is_active = False
        cert.save()
        return Response({
            "is_valid": False,
            "detail": "Sertifikat muddati tugagan.",
            "certificate_id": cert.certificate_id,
            "student_name": cert.student.get_full_name() or cert.student.username,
            "course_name": cert.course.title,
            "expiry_date": cert.expires_at.strftime('%d.%m.%Y')
        }, status=status.HTTP_200_OK)

    serializer = CertificateSerializer(cert, context={'request': request})
    data = serializer.data
    data['is_valid'] = True
    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admin_teacher_stats(request):
    """
    Get statistics for all teachers:
    - Number of courses (darslar soni)
    - Number of registered students (o'quvchilar soni)
    - Total student-course enrollments (kursdagi o'quvchilar soni)
    - Number of issued certificates (berilgan sertifikatlar soni)
    """
    if not is_admin_user(request.user):
        return Response({"detail": "Faqat administratorlar ushbu ma'lumotlarni ko'ra oladilar."}, status=status.HTTP_403_FORBIDDEN)

    teachers = User.objects.filter(role=User.Role.TEACHER).order_by('-id')
    stats = []

    for teacher in teachers:
        courses = Course.objects.filter(teacher=teacher)
        courses_count = courses.count()
        students_count = StudentProfile.objects.filter(teacher=teacher).count()
        total_enrollments = sum(course.students.count() for course in courses)
        certificates_count = Certificate.objects.filter(course__teacher=teacher).count()

        courses_list = []
        for course in courses:
            today = timezone.now().date()
            if today < course.start_date:
                status_str = "UPCOMING"
                time_progress = 0
            elif today > course.end_date:
                status_str = "COMPLETED"
                time_progress = 100
            else:
                status_str = "ACTIVE"
                total_days = (course.end_date - course.start_date).days
                elapsed_days = (today - course.start_date).days
                time_progress = int((elapsed_days / total_days) * 100) if total_days > 0 else 100

            courses_list.append({
                "id": course.id,
                "title": course.title,
                "student_count": course.students.count(),
                "start_date": course.start_date.strftime('%d.%m.%Y'),
                "end_date": course.end_date.strftime('%d.%m.%Y'),
                "time_progress": time_progress,
                "total_lessons": course.total_lessons,
                "status": status_str
            })

        stats.append({
            "id": teacher.id,
            "username": teacher.username,
            "first_name": teacher.first_name,
            "last_name": teacher.last_name,
            "email": teacher.email,
            "courses_count": courses_count,
            "students_count": students_count,
            "total_enrollments": total_enrollments,
            "certificates_count": certificates_count,
            "courses": courses_list
        })

    return Response(stats)
