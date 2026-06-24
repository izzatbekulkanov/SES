import os
import django
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Certificate, User

def main():
    certs = Certificate.objects.all()
    print(f"Total certificates in database: {certs.count()}")
    for cert in certs:
        is_expired = cert.expires_at < timezone.now() if cert.expires_at else False
        teacher_username = cert.course.teacher.username if cert.course and cert.course.teacher else "No Teacher"
        print(f"ID: {cert.certificate_id} | Student: {cert.student.get_full_name()} | Teacher: {teacher_username} | Expires: {cert.expires_at} | Expired: {is_expired}")

if __name__ == '__main__':
    main()
