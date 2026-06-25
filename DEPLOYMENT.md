# 🚀 SES Loyihasi - Serverga Joylashtirish va Sozlash Hujjati (Deployment Guide)

Ushbu hujjat **SES (Django & React)** loyihasining serverda qanday sozlanganligi, portlar, xizmatlar (services) va Cloudflare Tunnel ulanishlari haqidagi ma'lumotlarni o'z ichiga oladi.

---

## 🏗️ Tizim Arxitekturasi va Portlar (Ports Architecture)

Loyihaning turli qismlari quyidagi portlarda mustaqil ravishda ishlamoqda:

*   **React Frontend (Nginx):** `8112` portida.
    *   Nginx React yig'ilgan static fayllarini serve qiladi va `/api/` so'rovlarini backendga proxy qiladi.
*   **Django Backend (Gunicorn):** `8111` portida (`127.0.0.1:8111`).
    *   SQLite ma'lumotlar bazasi va JWT avtorizatsiya shu qismda ishlaydi.
*   **Asosiy Domen (Cloudflare Tunnel):** `https://shahar-ses.uz` -> `http://127.0.0.1:8112` (frontend) ga yo'naltirilgan.
*   **Nginx Default (Port 80):** Avvalgi holatida saqlandi (Default sahifa), bu ARM (port `8001`) va boshqa tizimlarga xalaqit bermasligini ta'minlaydi.

---

## 📁 Loyiha Kataloglari (Directories)

*   **Loyiha ildiz papkasi:** `/home/superadmin/SES`
*   **Backend kodlari:** `/home/superadmin/SES/backend`
*   **Backend Virtual Environment:** `/home/superadmin/SES/backend/venv`
*   **Frontend kodlari:** `/home/superadmin/SES/frontend`
*   **Frontend yig'ilgan (Build) fayllari:** `/home/superadmin/SES/frontend/dist`
*   **Statik fayllar (Collected Static):** `/home/superadmin/SES/backend/static`
*   **Yuklangan fayllar (Media):** `/home/superadmin/SES/backend/media`
*   **Cloudflare Sozlamalari:** `/home/superadmin/.cloudflared`

---

## ⚙️ Xizmatlar Sozlamalari (Systemd Services)

Tizimda loyihaning uzluksiz ishlashini ta'minlovchi ikkita asosiy xizmat (service) sozlangan:

### 1. Django Backend Xizmati (`ses-backend.service`)
Fayl manzili: `/etc/systemd/system/ses-backend.service`

```ini
[Unit]
Description=SES Django Backend Service
After=network.target

[Service]
User=superadmin
WorkingDirectory=/home/superadmin/SES/backend
ExecStart=/home/superadmin/SES/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8111 core.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

### 2. Cloudflare Tunnel Xizmati (`cloudflared.service`)
Fayl manzili: `/etc/systemd/system/cloudflared.service`

*   **Tunnel nomi:** `ses`
*   **Tunnel ID:** `173dfa7e-75fa-47d7-ac09-cbecc1b6aaf9`
*   **Domen:** `shahar-ses.uz`
*   **Sozlamalar fayli (`config.yml`):** `/etc/cloudflared/config.yml` (yoki `/home/superadmin/.cloudflared/config.yml`)

```yaml
tunnel: 173dfa7e-75fa-47d7-ac09-cbecc1b6aaf9
credentials-file: /home/superadmin/.cloudflared/173dfa7e-75fa-47d7-ac09-cbecc1b6aaf9.json

ingress:
  - hostname: shahar-ses.uz
    service: http://127.0.0.1:8112
  - service: http_status:404
```

---

## 🛠️ Xizmatlarni Boshqarish Buyruqlari (Useful Commands)

Loyihani boshqarish uchun terminalda quyidagi buyruqlardan foydalaning (parol so'ralsa: `Ulk@nov0209coder`):

### Django Backend boshqaruvi:
*   Xizmat holatini tekshirish: `systemctl status ses-backend`
*   Qayta ishga tushirish: `sudo systemctl restart ses-backend`
*   To'xtatish: `sudo systemctl stop ses-backend`
*   Ishga tushirish: `sudo systemctl start ses-backend`
*   Loglarni ko'rish: `journalctl -u ses-backend -n 50 --no-pager`

### Cloudflare Tunnel boshqaruvi:
*   Tunnel holatini tekshirish: `systemctl status cloudflared`
*   Qayta ishga tushirish: `sudo systemctl restart cloudflared`
*   Loglarni ko'rish: `journalctl -u cloudflared -n 50 --no-pager`

### Nginx Web Server boshqaruvi:
*   Nginx holatini tekshirish: `systemctl status nginx`
*   Sozlamalarni tekshirish (Syntax test): `sudo nginx -t`
*   Qayta ishga tushirish: `sudo systemctl restart nginx`

---

## 🔒 Saytga Kirish Ma'lumotlari (Credentials)

*   **Asosiy domen:** `https://shahar-ses.uz`
*   **Admin Login:** `superadmin`
*   **Admin Parol:** `Ulk@nov0209coder`
*   **Foydalanuvchi roli:** `ADMIN`
