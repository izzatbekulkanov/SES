import os
import django

# Set Django environment settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Certificate
from api.utils import generate_pdf_and_qr

def main():
    certs = Certificate.objects.all()
    total = certs.count()
    print(f"Found {total} certificates to regenerate.")
    
    success_count = 0
    fail_count = 0
    for idx, cert in enumerate(certs, 1):
        print(f"[{idx}/{total}] Regenerating certificate: {cert.certificate_id} for student: {cert.student.username}...")
        try:
            generate_pdf_and_qr(cert)
            cert.save()
            success_count += 1
            print(f"  --> Success! Saved PDF: {cert.pdf_file.name}")
        except Exception as e:
            fail_count += 1
            print(f"  --> Failed to regenerate: {e}")
            import traceback
            traceback.print_exc()
            
    print("\n==============================")
    print(f"Regeneration finished!")
    print(f"Successfully regenerated: {success_count}")
    print(f"Failed to regenerate: {fail_count}")
    print("==============================")

if __name__ == '__main__':
    main()
