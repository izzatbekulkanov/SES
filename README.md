# SES - Django & React Fullstack Loyihasi

Ushbu loyiha **Django (REST API)** va **React (Vite)** freymvorklarini birlashtirgan to'liq stackli (fullstack) vazifalar boshqaruvi va ulanish paneli ilovasidir.

---

## 📂 Loyiha Tuzilmasi

Loyiha quyidagi papkalardan iborat:

```text
D:\SES\
├── backend\                 # Django Backend
│   ├── core\                # Django Asosiy Sozlamalari (settings.py, urls.py, etc.)
│   ├── api\                 # API ilovasi (Modellar, serializatorlar va kontrollerlar)
│   │   ├── models.py        # Task (Vazifalar) ma'lumotlar bazasi jadvali
│   │   ├── serializers.py  # Modellar ma'lumotlarini JSON-ga o'tkazuvchi qatlam
│   │   ├── views.py         # API kontrollerlari (GET, POST, PUT, DELETE)
│   │   └── urls.py          # API marshrutlari (/api/hello/, /api/tasks/)
│   ├── venv\                # Python Virtual Muhiti (Virtual Environment)
│   ├── manage.py            # Django boshqaruv fayli
│   └── db.sqlite3           # SQLite ma'lumotlar bazasi
│
├── frontend\                # React Frontend
│   ├── src\                 # React kodlari
│   │   ├── App.jsx          # Asosiy sahifa logikasi (CORS va API ulanishlar)
│   │   ├── App.css          # Sahifaning umumiy ko'rinish va elementlar stillari
│   │   ├── index.css        # Global o'zgaruvchilar, dark-mode va animatsiyalar
│   │   └── main.jsx         # Reactni ishga tushiruvchi kirish nuqtasi
│   ├── index.html           # HTML asosi (Google Fonts Inter ulatilgan)
│   ├── package.json         # Node.js kutubxonalari
│   └── vite.config.js       # Vite sozlamalari
│
└── start.bat                # Ikkala serverni bir vaqtda ochish uchun skript (launcher)
```

---

## ⚡ Tezkor Ishga Tushirish

Loyihani ishga tushirish uchun eng oson yo'li - papkaning ildizida joylashgan `start.bat` faylini ikki marta bosishdir. Bu skript:
1. Django backend serverini `http://127.0.0.1:8000` portida ishga tushiradi.
2. React frontend serverini `http://localhost:5173` portida ishga tushiradi.
3. Defolt brauzeringizni ochib, frontend sahifasiga yo'naltiradi.

---

## 🛠 Qo'lda Ishga Tushirish

Agar siz serverlarni alohida terminallarda o'zingiz ishga tushirmoqchi bo'lsangiz, quyidagi buyruqlardan foydalaning:

### 1. Backend Serverni Ishga Tushirish
Yangi terminal ochib quyidagilarni bajaring:
```powershell
cd D:\SES\backend
# Virtual muhitni faollashtirish
.\venv\Scripts\activate
# Serverni boshlash
python manage.py runserver
```

### 2. Frontend Serverni Ishga Tushirish
Boshqa terminal ochib quyidagilarni bajaring:
```powershell
cd D:\SES\frontend
# Kutubxonalarni ishga tushirish (agar hali o'rnatilmagan bo'lsa: npm install)
npm run dev
```

---

## 📡 API Marshrutlari (Endpoints)

Loyiha quyidagi REST API marshrutlariga ega:

* **GET** `/api/hello/` - Server holati va ulanishini tekshirish uchun test API.
* **GET** `/api/tasks/` - Barcha vazifalar ro'yxatini yuklash (SQLite bazasidan).
* **POST** `/api/tasks/` - Yangi vazifa qo'shish.
* **PUT** `/api/tasks/<id>/` - Vazifani bajarilgan deb belgilash yoki o'zgartirish.
* **DELETE** `/api/tasks/<id>/` - Vazifani o'chirish.

---

## 🎨 Dizayn Sozlamalari

Frontend interfeysi to'liq **Dark Mode** rejimida, zamonaviy HSL ranglar palitrasi, **glassmorphism** (shaffof oyna effekti) elementlari hamda silliq mikromotivatsiyali o'tishlar bilan jihozlangan.
* Stillarni tahrirlash uchun: [index.css](file:///D:/SES/frontend/src/index.css) va [App.css](file:///D:/SES/frontend/src/App.css)
* Logikani tahrirlash uchun: [App.jsx](file:///D:/SES/frontend/src/App.jsx)
