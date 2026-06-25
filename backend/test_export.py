import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.test import RequestFactory
from django.contrib.auth import get_user_model
from api.views import admin_export_certificates_excel
from rest_framework_simplejwt.tokens import RefreshToken
User = get_user_model()
admin_user = User.objects.filter(role=User.Role.ADMIN).first()
if not admin_user:
    admin_user = User.objects.filter(is_superuser=True).first()
token = str(RefreshToken.for_user(admin_user).access_token)
factory = RequestFactory()
request = factory.get('/api/admin/certificates/export-excel/', {'start_date': '', 'end_date': ''}, HTTP_AUTHORIZATION=f'Bearer {token}')
try:
    response = admin_export_certificates_excel(request)
    print('STATUS CODE:', response.status_code)
    print('CONTENT TYPE:', response.get('Content-Type'))
except Exception as e:
    import traceback
    traceback.print_exc()