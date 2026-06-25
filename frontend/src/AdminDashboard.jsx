import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import UserProfile from './UserProfile'

const API = '/api'
const PAGE_SIZE = 50

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d={d} />
  </svg>
)

const ICONS = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  students:  'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  teacher:   'M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16',
  admin:     'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  cert:      'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  plus:      'M12 5v14 M5 12h14',
  search:    'M21 21l-4.35-4.35 M17 11A6 6 0 115 11a6 6 0 0112 0z',
  reset:     'M1 4v6h6 M23 20v-6h-6 M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15',
  logout:    'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9',
  profile:   'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8',
  eye:       'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z',
  chevronL:  'M15 18l-6-6 6-6',
  chevronR:  'M9 18l6-6-6-6',
  upload:    'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  trash:     'M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2',
  stats:     'M18 20V10 M12 20V4 M6 20v-6',
  copy:      'M9 15H5a2 2 0 01-2-2V3a2 2 0 012-2h8a2 2 0 012 2v4 M5 12h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z',
  calendar:  'M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z M16 2v4 M8 2v4 M3 10h18',
  passport:  'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M12 11a3 3 0 100-6 3 3 0 000 6z M18 16.5a6 6 0 00-12 0',
  download:  'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  check:     'M20 6L9 17l-5-5',
  close:     'M18 6L6 18M6 6l12 12',
  clock:     'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
}

// ─── Helper to resolve media URLs ──────────────────────────────────────────────
const getMediaUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${window.location.origin}${url}`
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ src, name, role, size = 'md' }) {
  const sz = size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-xs'
  const colors = {
    ADMIN:   'bg-red-100 text-red-600 border-red-200',
    TEACHER: 'bg-blue-100 text-blue-600 border-blue-200',
    STUDENT: 'bg-violet-100 text-violet-600 border-violet-200',
    DEFAULT: 'bg-slate-100 text-slate-600 border-slate-200',
  }
  const cls = colors[role] || colors.DEFAULT
  if (src) return (
    <img src={getMediaUrl(src)} alt={name} className={`${sz} rounded-full object-cover border-2 ${cls} shrink-0`} />
  )
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-bold border shrink-0 ${cls}`}>
      {initials}
    </div>
  )
}



// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, total, pageSize, onPage, t }) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null
  const items = []
  const delta = 1
  const left = Math.max(1, page - delta)
  const right = Math.min(pages, page + delta)
  if (left > 1) { items.push(1); if (left > 2) items.push('...') }
  for (let i = left; i <= right; i++) items.push(i)
  if (right < pages) { if (right < pages - 1) items.push('...'); items.push(pages) }

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 shrink-0">
      <span className="text-xs text-slate-400">{total} {t ? t.items : 'ta'} • {t ? t.page : 'Sahifa'} {page}/{pages}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500 transition">
          <Icon d={ICONS.chevronL} size={15} />
        </button>
        {items.map((item, i) =>
          item === '...'
            ? <span key={`e${i}`} className="px-1 text-slate-400 text-xs">…</span>
            : <button key={item} onClick={() => onPage(item)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                  page === item
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}>{item}</button>
        )}
        <button onClick={() => onPage(page + 1)} disabled={page === pages}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500 transition">
          <Icon d={ICONS.chevronR} size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Search Input ─────────────────────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder = "" }) {
  return (
    <div className="relative">
      <Icon d={ICONS.search} size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition"
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════

const translations = {
  uz: {
    dashboardTitle: "Administrator",
    controlPanel: "Boshqaruv paneli",
    students: "O'quvchilar",
    teachers: "O'qituvchilar",
    admins: "Adminlar",
    certs: "Sertifikatlar",
    stats: "Statistika",
    profile: "Profil",
    logout: "Chiqish",
    addUser: "Foydalanuvchi qo'shish",
    totalRegistered: "Jami ro'yxatda",
    search: "Qidirish...",
    page: "Sahifa",
    items: "ta",
    addNewUser: "Yangi foydalanuvchi yaratish",
    role: "Tizim Roli *",
    roleTeacher: "O'qituvchi",
    roleAdmin: "Administrator",
    firstName: "Ism *",
    lastName: "Familiya *",
    email: "Email",
    passport: "Pasport Seriya",
    passportNum: "Pasport Raqami",
    jshshir: "JSHSHIR (14 raqam)",
    birthDate: "Tug'ilgan sana",
    fatherName: "Otasining ismi",
    profilePic: "Profil rasmi",
    cancel: "Bekor qilish",
    save: "Saqlash",
    saving: "Saqlanmoqda...",
    noUsers: "Hozircha foydalanuvchilar yo'q.",
    actions: "Amallar",
    resetPass: "Parolni tiklash",
    resetPassConfirm: "haqiqatan ham parolini 'ses2026' ga tiklamoqchimisiz?",
    resetting: "Tiklanmoqda...",
    certListTitle: "Barcha Berilgan Sertifikatlar",
    noCerts: "Hozircha sertifikatlar berilmagan.",
    certId: "Sertifikat ID",
    student: "O'quvchi",
    course: "Kurs",
    issuedDate: "Berilgan sana",
    status: "Holati",
    active: "Faol",
    finished: "Tugagan",
    viewPdf: "PDF ko'rish",
    downloadPdf: "Yuklab olish",
    teacherStatsTitle: "O'qituvchilar Statistikasi",
    noTeachers: "Hozircha o'qituvchilar mavjud emas.",
    courses: "Kurslar",
    enrolledStudents: "O'quvchilar (jami)",
    certCount: "Sertifikatlar",
    createdCourses: "Yaratilgan kurslar",
    noTeacherCourses: "Hozircha dars kurslari yaratilmagan.",
    courseTitle: "Kurs nomi",
    dates: "Sanalar",
    progress: "Jarayon",
    lessonsCount: "ta dars",
    totalStr: "Jami:",
    // New additions for complete translation:
    user: "Foydalanuvchi",
    harakatlar: "Harakatlar",
    loading: "Yuklanmoqda...",
    copied: "Nusxalandi!",
    fatherPrefix: "Otasi:",
    searchUsersPlaceholder: "Ism, username, JSHSHIR bo'yicha...",
    searchCertsPlaceholder: "Ism, kurs, ID bo'yicha...",
    usersFound: "ta foydalanuvchi topildi",
    notFound: "Foydalanuvchi topilmadi",
    noCertsFound: "Sertifikatlar topilmadi",
    filtersReset: "Filtrlarni tozalash",
    allCertsFound: "ta topildi",
    certTotalFound: "Sertifikatlar",
    tempPasswordDesc: "Parol avtomatik:",
    exportExcel: "Excelga eksport"
  },
  ru: {
    dashboardTitle: "Администратор",
    controlPanel: "Панель управления",
    students: "Студенты",
    teachers: "Преподаватели",
    admins: "Админы",
    certs: "Сертификаты",
    stats: "Статистика",
    profile: "Профиль",
    logout: "Выйти",
    addUser: "Добавить пользователя",
    totalRegistered: "Всего в списке",
    search: "Поиск...",
    page: "Страница",
    items: "шт",
    addNewUser: "Создать нового пользователя",
    role: "Роль в системе *",
    roleTeacher: "Преподаватель",
    roleAdmin: "Администратор",
    firstName: "Имя *",
    lastName: "Фамилия *",
    email: "Email",
    passport: "Серия паспорта",
    passportNum: "Номер паспорта",
    jshshir: "ПИНФЛ (14 цифр)",
    birthDate: "Дата рождения",
    fatherName: "Отчество",
    profilePic: "Фото профиля",
    cancel: "Отмена",
    save: "Сохранить",
    saving: "Сохранение...",
    noUsers: "Пока нет пользователей.",
    actions: "Действия",
    resetPass: "Сброс пароля",
    resetPassConfirm: "вы действительно хотите сбросить пароль на 'ses2026'?",
    resetting: "Сброс...",
    certListTitle: "Все выданные сертификаты",
    noCerts: "Пока нет сертификатов.",
    certId: "ID Сертификата",
    student: "Студент",
    course: "Курс",
    issuedDate: "Дата выдачи",
    status: "Статус",
    active: "Активен",
    finished: "Завершен",
    viewPdf: "Смотреть PDF",
    downloadPdf: "Скачать",
    teacherStatsTitle: "Статистика преподавателей",
    noTeachers: "Пока нет преподавателей.",
    courses: "Курсы",
    enrolledStudents: "Студенты (всего)",
    certCount: "Сертификаты",
    createdCourses: "Созданные курсы",
    noTeacherCourses: "Пока нет курсов.",
    courseTitle: "Название курса",
    dates: "Даты",
    progress: "Прогресс",
    lessonsCount: "уроков",
    totalStr: "Итого:",
    // New additions for complete translation:
    user: "Пользователь",
    harakatlar: "Действия",
    loading: "Загрузка...",
    copied: "Скопировано!",
    fatherPrefix: "Отец:",
    searchUsersPlaceholder: "По имени, username, ПИНФЛ...",
    searchCertsPlaceholder: "По имени, курсу, ID...",
    usersFound: "пользователей найдено",
    notFound: "Пользователь не найден",
    noCertsFound: "Сертификаты не найдены",
    filtersReset: "Сбросить фильтры",
    allCertsFound: "найдено",
    certTotalFound: "Сертификаты",
    tempPasswordDesc: "Пароль по умолчанию:",
    exportExcel: "Экспорт в Excel"
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { section: urlSection } = useParams()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('access_token')

  // ── Navigation ──────────────────────────────────────────────────────────────
  const VALID_SECTIONS = ['students', 'teachers', 'admins', 'add_user', 'stats', 'certs']
  const section = VALID_SECTIONS.includes(urlSection) ? urlSection : 'students'

  const changeSection = (s) => {
    navigate(`/admin/${s}`)
  }

  // ── Users data ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'uz')
  const t = translations[lang] || translations.uz;

  // ── Teacher stats ────────────────────────────────────────────────────────────
  const [teacherStats, setTeacherStats] = useState([])
  const [loadingStats, setLoadingStats] = useState(false)

  // ── Certificates ─────────────────────────────────────────────────────────────
  const [certs, setCerts] = useState([])
  const [loadingCerts, setLoadingCerts] = useState(false)
  const [certSearch, setCertSearch] = useState('')
  const [certPage, setCertPage] = useState(1)
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [previewCert, setPreviewCert] = useState(null)
  const [certStartDate, setCertStartDate] = useState('')
  const [certEndDate, setCertEndDate] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportStartDate, setExportStartDate] = useState('')
  const [exportEndDate, setExportEndDate] = useState('')
  const [deletingCertId, setDeletingCertId] = useState(null)

  // ── Create user form ─────────────────────────────────────────────────────────
  const [role, setRole] = useState('TEACHER')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [passportSeries, setPassportSeries] = useState('')
  const [passportNumber, setPassportNumber] = useState('')
  const [jshshir, setJshshir] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [profilePicture, setProfilePicture] = useState(null)
  const [profilePreview, setProfilePreview] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  // ── Feedback ─────────────────────────────────────────────────────────────────
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [toast, setToast] = useState('') // bottom-right toast
  const [showProfile, setShowProfile] = useState(false)
  const [copiedUserId, setCopiedUserId] = useState(null)

  const handleCopyUsername = (e, username, userId) => {
    e.stopPropagation()
    navigator.clipboard.writeText(username)
    setCopiedUserId(userId)
    setTimeout(() => setCopiedUserId(null), 1500)
  }

  // ── Load ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchUsers()
    fetchCerts()
  }, [])

  useEffect(() => {
    if (section === 'stats') fetchTeacherStats()
    if (section === 'certs') fetchCerts()
  }, [section])

  async function fetchUsers() {
    setLoadingUsers(true)
    try {
      const r = await fetch(`${API}/admin/users/`, { headers: { Authorization: `Bearer ${token}` } })
      if (r.ok) setUsers(await r.json())
      else if (r.status === 401 || r.status === 403) handleLogout()
    } catch { /* silent */ }
    finally { setLoadingUsers(false) }
  }

  async function fetchTeacherStats() {
    setLoadingStats(true)
    try {
      const r = await fetch(`${API}/admin/teacher-stats/`, { headers: { Authorization: `Bearer ${token}` } })
      if (r.ok) setTeacherStats(await r.json())
    } catch { /* silent */ }
    finally { setLoadingStats(false) }
  }

  async function fetchCerts(search = '') {
    setLoadingCerts(true)
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : ''
      const r = await fetch(`${API}/admin/certificates/${q}`, { headers: { Authorization: `Bearer ${token}` } })
      if (r.ok) setCerts(await r.json())
    } catch { /* silent */ }
    finally { setLoadingCerts(false) }
  }

  // Debounce cert search
  useEffect(() => {
    if (section !== 'certs') return
    const timer = setTimeout(() => { fetchCerts(certSearch); setCertPage(1) }, 350)
    return () => clearTimeout(timer)
  }, [certSearch, section])

  // ── Actions ───────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0]
    if (file) { setProfilePicture(file); setProfilePreview(URL.createObjectURL(file)) }
  }

  const resetForm = () => {
    setFirstName(''); setLastName(''); setEmail('')
    setPassportSeries(''); setPassportNumber('')
    setBirthDate(''); setFatherName('')
    setRole('TEACHER'); setProfilePicture(null); setProfilePreview(null)
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setError(''); setSuccessMsg(''); setFormLoading(true)
    try {
      const fd = new FormData()
      fd.append('first_name', firstName); fd.append('last_name', lastName)
      fd.append('email', email); fd.append('passport_series', passportSeries)
      fd.append('passport_number', passportNumber)
      if (birthDate) fd.append('birth_date', birthDate)
      fd.append('father_name', fatherName)
      fd.append('role', role)
      if (profilePicture) fd.append('profile_picture', profilePicture)

      const r = await fetch(`${API}/admin/users/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      })
      if (r.ok) {
        const u = await r.json()
        setSuccessMsg('')
        setToast(`✓ ${role === 'ADMIN' ? 'Admin' : role === 'TEACHER' ? t.roleTeacher : "O'quvchi"} yaratildi. Username: ${u.username}`)
        setTimeout(() => setToast(''), 4500)
        resetForm()
        fetchUsers()
        if (section === 'stats') fetchTeacherStats()
        setTimeout(() => {
          changeSection(role === 'ADMIN' ? 'admins' : 'teachers')
        }, 2000)
      } else {
        const d = await r.json()
        setError(d.detail || "Yaratishda xatolik yuz berdi.")
      }
    } catch { setError("Serverga ulanishda xatolik yuz berdi.") }
    finally { setFormLoading(false) }
  }

  const handleResetPassword = async (userId, username) => {
    setError('')
    const r = await fetch(`${API}/admin/reset-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ user_id: userId })
    })
    if (r.ok) {
      setToast(`✓ ${username} paroli 'ses2026' ga qaytarildi.`)
      setTimeout(() => setToast(''), 4000)
    } else setError(`${t.resetPass}da xatolik yuz berdi.`)
  }

  const handleDeleteStudent = async (studentId, studentName) => {
    const confirmMsg = lang === 'ru' 
      ? `Вы действительно хотите удалить студента ${studentName}? Все связанные сертификаты также будут удалены!`
      : `Haqiqatan ham o'quvchi ${studentName}ni o'chirmoqchimisiz? Unga tegishli barcha sertifikatlar ham o'chib ketadi!`
    
    if (!window.confirm(confirmMsg)) return

    try {
      const r = await fetch(`${API}/admin/users/${studentId}/delete/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (r.ok) {
        setToast(lang === 'ru' ? 'Студент успешно удален.' : "O'quvchi muvaffaqiyatli o'chirildi.")
        setTimeout(() => setToast(''), 4500)
        await fetchUsers()
        await fetchCerts()
      } else {
        const d = await r.json()
        setToast(`⚠ ${d.detail || (lang === 'ru' ? 'Ошибка при удалении.' : 'O\'chirishda xatolik.')}`)
        setTimeout(() => setToast(''), 4500)
      }
    } catch {
      setToast(lang === 'ru' ? '⚠ Ошибка сети.' : '⚠ Tarmoq xatoligi.')
      setTimeout(() => setToast(''), 4500)
    }
  }

  const handleDeleteCertificate = (certificateId) => {
    setDeletingCertId(certificateId)
  }

  const submitDeleteCertificate = async () => {
    if (!deletingCertId) return

    try {
      const r = await fetch(`${API}/admin/certificates/${deletingCertId}/delete/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (r.ok) {
        setToast(lang === 'ru' ? 'Сертификат успешно удален.' : "Sertifikat muvaffaqiyatli o'chirildi.")
        setTimeout(() => setToast(''), 4500)
        await fetchCerts()
      } else {
        const d = await r.json()
        setToast(`⚠ ${d.detail || (lang === 'ru' ? 'Ошибка при удалении.' : 'O\'chirishda xatolik.')}`)
        setTimeout(() => setToast(''), 4500)
      }
    } catch {
      setToast(lang === 'ru' ? '⚠ Ошибка сети.' : '⚠ Tarmoq xatoligi.')
      setTimeout(() => setToast(''), 4500)
    } finally {
      setDeletingCertId(null)
    }
  }

  const handleExportExcel = async (e) => {
    e.preventDefault();
    try {
      const q = `?start_date=${exportStartDate}&end_date=${exportEndDate}`;
      const r = await fetch(`${API}/admin/certificates/export-excel/${q}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (r.ok) {
        const blob = await r.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sertifikatlar_${exportStartDate || 'barchasi'}_${exportEndDate || 'barchasi'}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setShowExportModal(false);
        setExportStartDate('');
        setExportEndDate('');
      } else {
        const d = await r.json();
        setToast(`⚠ ${d.detail || 'Eksport qilishda xatolik yuz berdi.'}`);
        setTimeout(() => setToast(''), 4500);
      }
    } catch {
      setToast('⚠ Serverga ulanishda xatolik.');
      setTimeout(() => setToast(''), 4500);
    }
  };

  // ── Filtered & paginated users ────────────────────────────────────────────────
  const roleMap = { students: 'STUDENT', teachers: 'TEACHER', admins: 'ADMIN' }
  const filteredUsers = useMemo(() => {
    const roleFilter = roleMap[section]
    if (!roleFilter) return []
    const q = userSearch.toLowerCase()
    return users.filter(u =>
      u.role === roleFilter &&
      (!q || `${u.first_name} ${u.last_name} ${u.username} ${u.email || ''} ${u.jshshir || ''}`.toLowerCase().includes(q))
    )
  }, [users, section, userSearch])

  const pagedUsers = filteredUsers.slice((userPage - 1) * PAGE_SIZE, userPage * PAGE_SIZE)

  const handleTeacherChange = (val) => {
    setSelectedTeacherId(val)
    setSelectedCourseId('')
    setCertPage(1)
  }

  const uniqueTeachers = useMemo(() => {
    const map = {}
    certs.forEach(c => {
      if (c.teacher_id && c.teacher_name) {
        map[c.teacher_id] = c.teacher_name
      }
    })
    return Object.entries(map).map(([id, name]) => ({ id: parseInt(id), name }))
  }, [certs])

  const uniqueCourses = useMemo(() => {
    const map = {}
    certs.forEach(c => {
      if (selectedTeacherId && c.teacher_id !== parseInt(selectedTeacherId)) return
      if (c.course_id && c.course_name) {
        map[c.course_id] = c.course_name
      }
    })
    return Object.entries(map).map(([id, name]) => ({ id: parseInt(id), name }))
  }, [certs, selectedTeacherId])

  const filteredCerts = useMemo(() => {
    return certs.filter(c => {
      if (selectedTeacherId && c.teacher_id !== parseInt(selectedTeacherId)) return false
      if (selectedCourseId && c.course_id !== parseInt(selectedCourseId)) return false
      
      // Date range filter
      if (certStartDate || certEndDate) {
        const parseDateDMY = (dmyStr) => {
          if (!dmyStr) return null;
          const parts = dmyStr.split('.');
          if (parts.length !== 3) return null;
          return new Date(parts[2], parts[1] - 1, parts[0]);
        };
        const certDate = parseDateDMY(c.issued_at);
        if (certDate) {
          if (certStartDate) {
            const start = new Date(certStartDate);
            start.setHours(0, 0, 0, 0);
            if (certDate < start) return false;
          }
          if (certEndDate) {
            const end = new Date(certEndDate);
            end.setHours(23, 59, 59, 999);
            if (certDate > end) return false;
          }
        }
      }

      if (certSearch.trim()) {
        const q = certSearch.toLowerCase()
        return (
          c.student_name.toLowerCase().includes(q) ||
          c.student_username.toLowerCase().includes(q) ||
          c.certificate_id.toLowerCase().includes(q) ||
          (c.course_name || '').toLowerCase().includes(q) ||
          (c.teacher_name || '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [certs, selectedTeacherId, selectedCourseId, certSearch, certStartDate, certEndDate])

  const pagedCerts = useMemo(() => {
    return filteredCerts.slice((certPage - 1) * PAGE_SIZE, certPage * PAGE_SIZE)
  }, [filteredCerts, certPage])

  // ── Nav menu config ────────────────────────────────────────────────────────────
  const navItems = [
    { id: 'students', label: t.students, icon: ICONS.students, color: 'violet', count: users.filter(u => u.role === 'STUDENT').length },
    { id: 'teachers', label: t.teachers, icon: ICONS.teacher, color: 'blue', count: users.filter(u => u.role === 'TEACHER').length },
    { id: 'admins',   label: t.admins,    icon: ICONS.admin,   color: 'red',    count: users.filter(u => u.role === 'ADMIN').length },
    { id: 'add_user', label: t.addUser,   icon: ICONS.plus,    color: 'indigo', count: null },
    { id: 'stats',    label: t.stats,  icon: ICONS.stats,   color: 'indigo', count: null },
    { id: 'certs',    label: t.certs, icon: ICONS.cert,  color: 'emerald', count: certs.length || null },
  ]

  const colorConfig = {
    violet: { active: 'bg-violet-600 text-white shadow-md', pill: 'bg-violet-100 text-violet-700', dot: 'bg-violet-400' },
    blue:   { active: 'bg-blue-600 text-white shadow-md',   pill: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-400' },
    red:    { active: 'bg-red-500 text-white shadow-md',    pill: 'bg-red-100 text-red-700',       dot: 'bg-red-400' },
    indigo: { active: 'bg-indigo-600 text-white shadow-md', pill: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-400' },
    emerald:{ active: 'bg-emerald-600 text-white shadow-md',pill: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
  }

  const isUserSection = ['students', 'teachers', 'admins'].includes(section)

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#f0f2f8] flex flex-col overflow-hidden">

      {/* ── Topbar ── */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SES Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-slate-800 text-sm tracking-tight">SES PORTAL</span>
          <span className="hidden sm:inline text-[11px] bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-full font-semibold">
            {t.roleAdmin}
          </span>
        </div>
        <div className="flex items-center gap-3">
          
          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 mr-2">
            <button onClick={() => { setLang('uz'); localStorage.setItem('lang', 'uz'); }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${lang === 'uz' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              UZ
            </button>
            <button onClick={() => { setLang('ru'); localStorage.setItem('lang', 'ru'); }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${lang === 'ru' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              RU
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-right">
            <div>
              <p className="text-xs font-bold text-slate-800 leading-none">{user.first_name} {user.last_name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{user.email || user.username}</p>
            </div>
            <Avatar src={user.profile_picture} name={`${user.first_name} ${user.last_name}`} role="ADMIN" />
          </div>
          <button onClick={() => setShowProfile(true)}
            title={t.profile}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-violet-600 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 px-3 py-1.5 rounded-lg font-semibold transition">
            <Icon d={ICONS.profile} size={13} />
            <span className="hidden sm:inline">{t.profile}</span>
          </button>
          <button onClick={handleLogout}
            title={t.logout}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg font-semibold transition">
            <Icon d={ICONS.logout} size={13} />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden pb-16 md:pb-0">

        {/* ── Sidebar ── */}
        <aside className="hidden md:flex w-64 shrink-0 bg-white border-r border-slate-200 flex-col py-4 px-3 gap-1 shadow-sm overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">{t.controlPanel}</p>

          {navItems.map(item => {
            const isActive = section === item.id
            const cc = colorConfig[item.color]
            return (
              <button
                key={item.id}
                onClick={() => { changeSection(item.id); setUserSearch(''); setUserPage(1); setError(''); setSuccessMsg('') }}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                  isActive ? cc.active : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon d={item.icon} size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                  <span className="truncate whitespace-nowrap">{item.label}</span>
                </div>
                {item.count !== null && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : cc.pill}`}>
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}

        </aside>

        {/* ── Main ── */}
        <main className="flex-1 flex flex-col p-3 md:p-5 gap-4 overflow-y-auto pb-20 md:pb-5">

          {/* ── Summary Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
            {[
              {
                label: t.students,
                count: users.filter(u => u.role === 'STUDENT').length,
                icon: ICONS.students,
                iconBg: 'bg-violet-100',
                iconColor: 'text-violet-600',
                text: 'text-violet-600',
                border: 'border-violet-100',
                onClick: () => { changeSection('students'); setUserSearch(''); setUserPage(1) }
              },
              {
                label: t.teachers,
                count: users.filter(u => u.role === 'TEACHER').length,
                icon: ICONS.teacher,
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
                text: 'text-blue-600',
                border: 'border-blue-100',
                onClick: () => { changeSection('teachers'); setUserSearch(''); setUserPage(1) }
              },
              {
                label: t.admins,
                count: users.filter(u => u.role === 'ADMIN').length,
                icon: ICONS.admin,
                iconBg: 'bg-red-100',
                iconColor: 'text-red-500',
                text: 'text-red-500',
                border: 'border-red-100',
                onClick: () => { changeSection('admins'); setUserSearch(''); setUserPage(1) }
              },
              {
                label: t.certs,
                count: certs.length,
                icon: ICONS.cert,
                iconBg: 'bg-emerald-100',
                iconColor: 'text-emerald-600',
                text: 'text-emerald-600',
                border: 'border-emerald-100',
                onClick: () => changeSection('certs')
              },
            ].map(({ label, count, icon, iconBg, iconColor, text, border, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className={`group flex items-center justify-between p-4 bg-white border ${border} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 text-left`}
              >
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
                  <p className={`text-3xl font-black ${text} leading-none`}>
                    {loadingUsers ? <span className="text-slate-300 text-xl">—</span> : count}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{t.totalRegistered}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon d={icon} size={20} className={iconColor} />
                </div>
              </button>
            ))}
          </div>

          {/* Alerts */}
          {(error || successMsg) && (
            <div className={`px-4 py-3 rounded-xl text-sm font-semibold border flex items-center gap-2 shrink-0 ${
              error ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {error || successMsg}
            </div>
          )}

          {/* Create User Section (Separate Page) */}
          {section === 'add_user' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h2 className="font-bold text-slate-900 text-base">{t.addNewUser}</h2>
                <button type="button" onClick={() => { changeSection('students'); resetForm() }}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold leading-none w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition">✕</button>
              </div>

              <form onSubmit={handleCreateUser}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Role */}
                  <div className="lg:col-span-3">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">{t.role}</label>
                    <div className="flex gap-2">
                      {[['TEACHER',t.roleTeacher,'blue'], ['ADMIN',t.roleAdmin,'red']].map(([val, lbl, color]) => (
                        <button key={val} type="button" onClick={() => setRole(val)}
                          className={`flex-1 py-2 rounded-xl text-sm font-bold border transition ${
                            role === val
                              ? color === 'blue' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-red-500 text-white border-red-500 shadow-md'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}>{lbl}</button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{t.firstName}</label>
                    <input required type="text" placeholder="Bahrom" value={firstName} onChange={e => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{t.lastName}</label>
                    <input required type="text" placeholder="Karimov" value={lastName} onChange={e => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{t.fatherName}</label>
                    <input type="text" placeholder="Masalan: Aliyevich" value={fatherName} onChange={e => setFatherName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" />
                  </div>

                  {/* Email & Passport */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{t.email}</label>
                    <input type="email" placeholder="user@ses.uz" value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{t.passport}</label>
                    <input type="text" placeholder="AA" maxLength={2} value={passportSeries}
                      onChange={e => setPassportSeries(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{t.passportNum}</label>
                    <input type="text" placeholder="1234567" maxLength={7} value={passportNumber}
                      onChange={e => setPassportNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" />
                  </div>

                  {/* Birth date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{t.birthDate}</label>
                    <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none text-slate-700" />
                  </div>

                  {/* Photo */}
                  <div className="lg:col-span-3">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Profil Rasmi</label>
                    <div className="flex items-center gap-4">
                      {profilePreview
                        ? <img src={profilePreview} alt="preview" className="w-14 h-14 rounded-full object-cover border-2 border-violet-300 shadow" />
                        : <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                            <Icon d={ICONS.profile} size={24} />
                          </div>
                      }
                      <label htmlFor="pic-admin"
                        className="cursor-pointer flex items-center gap-2 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 text-slate-600 hover:text-violet-700 text-xs font-bold px-4 py-2 rounded-xl transition">
                        <Icon d={ICONS.upload} size={14} />
                        {profilePicture ? profilePicture.name : 'Rasm tanlang...'}
                      </label>
                      <input id="pic-admin" type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                      {profilePicture && (
                        <button type="button" onClick={() => { setProfilePicture(null); setProfilePreview(null) }}
                          className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition">
                          <Icon d={ICONS.trash} size={12} /> Olib tashlash
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-slate-100">
                  <button type="submit" disabled={formLoading}
                    className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-sm disabled:opacity-50 transition">
                    {formLoading ? 'Yaratilmoqda...' : `${role === 'ADMIN' ? 'Admin' : t.roleTeacher}ni yaratish`}
                  </button>
                  <button type="button" onClick={() => { changeSection('students'); resetForm() }}
                    className="text-sm text-slate-500 hover:text-slate-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-100 transition">
                    Bekor qilish
                  </button>
                  <span className="text-xs text-slate-400 ml-auto">Parol avtomatik: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">ses2026</code></span>
                </div>
              </form>
            </div>
          )}

          {/* ── Users Section (Students / Teachers / Admins) ── */}
          {isUserSection && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden p-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">
                    {section === 'students' ? t.students : section === 'teachers' ? t.teachers : t.admins}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{filteredUsers.length} {t.usersFound}</p>
                </div>
                <SearchBar
                  value={userSearch}
                  onChange={v => { setUserSearch(v); setUserPage(1) }}
                  placeholder={t.searchUsersPlaceholder}
                />
              </div>

              {/* Table */}
              {loadingUsers ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 font-semibold">{t.loading}</div>
              ) : pagedUsers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Icon d={ICONS.search} size={36} className="opacity-30" />
                  <p className="text-sm font-semibold">{t.notFound}</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[640px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        <th className="py-3 px-4 rounded-tl-xl">{t.user}</th>
                        <th className="py-3 px-4">{t.passport}</th>
                        {section === 'students' && <th className="py-3 px-4">{t.courses}</th>}
                        {section !== 'students' && <th className="py-3 px-4">{t.email}</th>}
                        <th className="py-3 px-4 text-center rounded-tr-xl">{t.harakatlar}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {pagedUsers.map(u => (
                        <tr key={u.id} className="hover:bg-violet-50/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={u.profile_picture} name={`${u.first_name} ${u.last_name}`} role={u.role} />
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {u.first_name} {u.last_name}{u.father_name ? ` ${u.father_name}` : ''}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  <code className="text-[11px] text-slate-400 font-mono">@{u.username}</code>
                                  {copiedUserId === u.id ? (
                                    <span className="text-[9px] text-emerald-600 font-bold animate-pulse">{t.copied}</span>
                                  ) : (
                                    <button 
                                      onClick={(e) => handleCopyUsername(e, u.username, u.id)}
                                      className="p-0.5 bg-slate-100 hover:bg-slate-200 active:bg-violet-100 text-slate-500 hover:text-slate-700 rounded transition duration-150"
                                      title={t.copied}
                                    >
                                      <Icon d={ICONS.copy} size={9} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {u.passport_series && u.passport_number ? `${u.passport_series} ${u.passport_number}` : '—'}
                            </span>
                            {u.birth_date && (
                              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-mono">
                                <Icon d={ICONS.calendar} size={11} className="text-slate-400 shrink-0" />
                                <span>{u.birth_date}</span>
                              </div>
                            )}
                          </td>
                          {section === 'students' && (
                            <td className="py-3 px-4">
                              {u.courses && u.courses.length > 0 ? (
                                <div className="flex flex-col gap-1.5 items-start">
                                  {u.courses.map(c => (
                                    <span key={c.id} className="bg-violet-50 text-violet-700 text-[10px] px-2.5 py-1 rounded-lg border border-violet-100 font-semibold leading-tight text-left block" title={c.title}>
                                      {c.title}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </td>
                          )}
                          {section !== 'students' && <td className="py-3 px-4 text-slate-600 text-xs">{u.email || '—'}</td>}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleResetPassword(u.id, u.username)}
                                className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition">
                                <Icon d={ICONS.reset} size={11} />
                                {t.resetPass}
                              </button>
                              {u.role === 'STUDENT' && (
                                <button onClick={() => handleDeleteStudent(u.id, `${u.first_name} ${u.last_name}`)}
                                  className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 border border-red-200 p-1.5 rounded-lg text-xs font-bold transition"
                                  title={lang === 'ru' ? 'Удалить студента' : "O'quvchini o'chirish"}
                                >
                                  <Icon d={ICONS.trash} size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <Pagination page={userPage} total={filteredUsers.length} pageSize={PAGE_SIZE} onPage={setUserPage} t={t} />
            </div>
          )}

          {/* ── Teacher Stats Section ── */}
          {section === 'stats' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden p-5">
              <div className="flex items-center justify-between mb-5 shrink-0">
                <h2 className="font-bold text-slate-900 text-lg">{t.teacherStatsTitle}</h2>
                <button onClick={fetchTeacherStats}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 px-3 py-1.5 rounded-lg font-semibold transition">
                  <Icon d={ICONS.reset} size={13} /> Yangilash
                </button>
              </div>

              {loadingStats ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 font-semibold">Yuklanmoqda...</div>
              ) : teacherStats.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">{t.noTeachers}</div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {teacherStats.map(teacher => (
                    <div key={teacher.id} className="border border-slate-100 rounded-2xl p-5 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all shadow-sm">
                      {/* Header */}
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={teacher.profile_picture} name={`${teacher.first_name} ${teacher.last_name}`} role="TEACHER" size="lg" />
                          <div>
                            <h3 className="font-bold text-slate-900">{teacher.first_name} {teacher.last_name}</h3>
                            <p className="text-xs text-slate-400 font-mono">@{teacher.username}</p>
                          </div>
                        </div>
                        {/* Stat chips */}
                        <div className="flex flex-wrap gap-2">
                          {[
                            [teacher.courses_count, "ta kurs", 'violet'],
                            [teacher.students_count, "ta o'quvchi", 'blue'],
                            [teacher.total_enrollments, `${t.lessonsCount}`, 'indigo'],
                            [teacher.certificates_count, 'ta sertifikat', 'emerald'],
                          ].map(([n, label, color], i) => {
                            const chip = {
                              violet: 'bg-violet-50 text-violet-700 border-violet-200',
                              blue:   'bg-blue-50 text-blue-700 border-blue-200',
                              indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                              emerald:'bg-emerald-50 text-emerald-700 border-emerald-200',
                            }[color]
                            return (
                              <span key={i} className={`border px-3 py-1 rounded-full text-xs font-bold ${chip}`}>
                                <span className="text-base font-black mr-1">{n}</span>{label}
                              </span>
                            )
                          })}
                        </div>
                      </div>

                      {/* Courses */}
                      {teacher.courses.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.courses}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                            {teacher.courses.map(course => (
                              <div key={course.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-semibold text-slate-800 text-sm leading-snug">{course.title}</p>
                                  <span className={`shrink-0 text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                                    course.status === 'ACTIVE' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : course.status === 'UPCOMING' ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-slate-100 border-slate-200 text-slate-600'
                                  }`}>
                                    {course.status === 'ACTIVE' ? 'Faol' : course.status === 'UPCOMING' ? 'Kutilmoqda' : 'Yakunlangan'}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  <span className="bg-[#f0f9ff] text-blue-700 border border-blue-100 text-[9px] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                                    <Icon d={ICONS.calendar} size={10} className="text-blue-500" />
                                    {course.start_date}
                                  </span>
                                  <span className="bg-[#fffbeb] text-amber-700 border border-amber-100 text-[9px] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                                    <Icon d={ICONS.calendar} size={10} className="text-amber-500" />
                                    {course.end_date}
                                  </span>
                                  <span className="bg-slate-50 text-slate-600 border border-slate-100 text-[9px] px-2 py-0.5 rounded font-medium font-mono">
                                    {course.total_lessons} dars
                                  </span>
                                </div>
                                <div>
                                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                    <span>Muddat progressi</span>
                                    <span className="font-bold">{course.time_progress}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${course.time_progress === 100 ? 'bg-emerald-500' : 'bg-violet-500'}`}
                                      style={{ width: `${course.time_progress}%` }} />
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-50">
                                  <span className="text-slate-500">O'quvchilar</span>
                                  <span className="font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{course.student_count}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Certificates Section ── */}
          {section === 'certs' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 shrink-0 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">{t.certListTitle}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{t.totalStr} {certs.length} {lang === 'uz' ? 'ta sertifikat' : 'сертификатов'}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Teacher Filter */}
                  <div className="relative min-w-[170px]">
                    <select
                      value={selectedTeacherId}
                      onChange={e => handleTeacherChange(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition appearance-none cursor-pointer"
                    >
                      <option value="">{lang === 'uz' ? "Barcha o'qituvchilar" : "Все преподаватели"}</option>
                      {uniqueTeachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Icon d="M6 9l6 6 6-6" size={12} />
                    </div>
                  </div>

                  {/* Course Filter */}
                  <div className="relative min-w-[190px]">
                    <select
                      value={selectedCourseId}
                      onChange={e => { setSelectedCourseId(e.target.value); setCertPage(1) }}
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition appearance-none cursor-pointer"
                    >
                      <option value="">{lang === 'uz' ? "Barcha darslar" : "Все курсы"}</option>
                      {uniqueCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Icon d="M6 9l6 6 6-6" size={12} />
                    </div>
                  </div>

                  {/* Reset Filters button */}
                  {(selectedTeacherId || selectedCourseId || certStartDate || certEndDate) && (
                    <button
                      onClick={() => { setSelectedTeacherId(''); setSelectedCourseId(''); setCertStartDate(''); setCertEndDate(''); setCertPage(1) }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-red-150 transition"
                      title={t.filtersReset}
                    >
                      <Icon d={ICONS.reset} size={14} />
                    </button>
                  )}

                  {/* Date range inputs */}
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-1 px-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Sana:</span>
                      <input
                        type="date"
                        value={certStartDate}
                        onChange={e => { setCertStartDate(e.target.value); setCertPage(1) }}
                        className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                        title="Boshlanish sanasi"
                      />
                    </div>
                    <span className="text-slate-300 font-bold">—</span>
                    <input
                      type="date"
                      value={certEndDate}
                      onChange={e => { setCertEndDate(e.target.value); setCertPage(1) }}
                      className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                      title="Tugash sanasi"
                    />
                  </div>

                  {/* Excel Export Button */}
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-200 hover:border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                    title={t.exportExcel}
                  >
                    <Icon d={ICONS.download} size={14} />
                    <span>{t.exportExcel}</span>
                  </button>

                  <SearchBar
                    value={certSearch}
                    onChange={v => { setCertSearch(v); setCertPage(1) }}
                    placeholder={t.searchCertsPlaceholder}
                  />
                </div>
              </div>

              {loadingCerts ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 font-semibold">{t.loading}</div>
              ) : pagedCerts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Icon d={ICONS.cert} size={40} className="opacity-20" />
                  <p className="text-sm font-semibold">{t.noCertsFound}</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        <th className="py-3 px-4 rounded-tl-xl w-[60px]">#</th>
                        <th className="py-3 px-4 w-[240px]">{t.student}</th>
                        <th className="py-3 px-4 w-[140px]">{t.certId}</th>
                        <th className="py-3 px-4">{t.course}</th>
                        <th className="py-3 px-4 w-[200px]">{t.roleTeacher}</th>
                        <th className="py-3 px-4 w-[115px]">{t.issuedDate}</th>
                        <th className="py-3 px-4 w-[115px]">{lang === 'uz' ? 'Amal qilish' : 'Срок действия'}</th>
                        <th className="py-3 px-4 w-[115px]">{t.status}</th>
                        <th className="py-3 px-4 rounded-tr-xl w-[180px] text-right pr-6">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {pagedCerts.map((cert, index) => (
                        <tr key={cert.certificate_id} className="hover:bg-slate-50/30 transition-colors">
                          {/* Tartib raqami */}
                          <td className="py-3 px-4 text-slate-500 font-mono font-bold">
                            {(certPage - 1) * PAGE_SIZE + index + 1}
                          </td>
                          
                          {/* Student Details */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar src={cert.student_picture} name={cert.student_name} role="STUDENT" size="sm" />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate max-w-[180px]">{cert.student_name}</p>
                                <code className="text-[10px] text-slate-400 font-mono">@{cert.student_username}</code>
                              </div>
                            </div>
                          </td>

                          {/* Certificate ID */}
                          <td className="py-3 px-4 font-mono font-bold text-slate-650">
                            {cert.certificate_id}
                          </td>

                          {/* Course Name */}
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {cert.course_name}
                          </td>

                          {/* Teacher Name */}
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {cert.teacher_name}
                          </td>

                          {/* Issued Date */}
                          <td className="py-3 px-4 text-slate-500 font-semibold">
                            {cert.issued_at || '—'}
                          </td>

                          {/* Expires Date */}
                          <td className="py-3 px-4 text-slate-500 font-semibold">
                            {cert.expires_at || '—'}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            {cert.is_active ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-150 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {t.active}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                {t.finished}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right pr-6">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <button 
                                onClick={() => setPreviewCert(cert)}
                                className="p-1.5 bg-slate-50 hover:bg-violet-50 text-slate-500 hover:text-violet-600 border border-slate-200 hover:border-violet-300 rounded-lg transition"
                                title="Ko'rish"
                              >
                                <Icon d={ICONS.eye} size={13} />
                              </button>

                              {cert.pdf_file ? (
                                <a 
                                  href={getMediaUrl(cert.pdf_file)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 border border-emerald-250 rounded-lg transition inline-flex items-center justify-center"
                                  title={t.downloadPdf}
                                >
                                  <Icon d={ICONS.download} size={13} />
                                </a>
                              ) : (
                                <span className="p-1.5 bg-slate-50 text-slate-350 border border-slate-100 rounded-lg cursor-not-allowed inline-flex items-center justify-center" title="PDF mavjud emas">
                                  <Icon d={ICONS.download} size={13} className="opacity-40" />
                                </span>
                              )}

                              <a 
                                href={`/verify/${cert.certificate_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg transition inline-flex items-center justify-center"
                                title="Tekshirish"
                              >
                                <Icon d={ICONS.check} size={13} />
                              </a>

                              <button 
                                onClick={() => handleDeleteCertificate(cert.certificate_id)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 rounded-lg transition"
                                title={lang === 'ru' ? 'Удалить сертификат' : "Sertifikatni o'chirish"}
                              >
                                <Icon d={ICONS.trash} size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <Pagination page={certPage} total={filteredCerts.length} pageSize={PAGE_SIZE} onPage={setCertPage} t={t} />
            </div>

          )}

        </main>
      </div>

      {/* ── Certificate Preview Modal ── */}
      {previewCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden border border-slate-100 my-8">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Icon d={ICONS.cert} size={18} className="text-emerald-600 animate-pulse" />
                <h3 className="font-bold text-slate-800 text-sm">Sertifikatni ko'rish</h3>
              </div>
              <button 
                onClick={() => setPreviewCert(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              >
                <Icon d={ICONS.close} size={18} />
              </button>
            </div>
            
            {/* Beautiful HTML Mockup of the Certificate */}
            <div className="p-4 sm:p-6 bg-slate-100 flex-1 flex justify-center items-center">
              <div className="w-full bg-[#0a1628] text-white p-5 sm:p-7 rounded-xl border-4 border-[#c9a84c] shadow-md relative overflow-hidden font-sans select-none">
                {/* Inner gold border */}
                <div className="absolute inset-1.5 border border-[#e8c97a] pointer-events-none"></div>

                {/* Main Content Layout */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-3.5">
                  {/* Emblem/Logo */}
                  <div className="w-11 h-11 bg-white/5 rounded-full flex items-center justify-center p-1.5 border border-[#c9a84c]/30">
                    <img src="/logo.png" alt="SES" className="w-full h-full object-contain" />
                  </div>

                  {/* Headers */}
                  <div className="space-y-0.5">
                    <h4 className="text-[9px] font-extrabold text-[#c9a84c] tracking-wider uppercase leading-tight">
                      SANITARIYA-EPIDEMIOLOGIK OSOYISHTALIK<br />
                      VA JAMOAT SALOMATLIGI QO'MITASINING<br />
                      TOSHKENT SHAHAR BOSHQARMASI
                    </h4>
                  </div>

                  {/* Divider line */}
                  <div className="w-4/5 h-[1px] bg-[#c9a84c] opacity-60"></div>

                  {/* Certificate title */}
                  <div className="space-y-0.5">
                    <h2 className="text-2xl font-black tracking-widest text-[#c9a84c] font-serif">SERTIFIKAT</h2>
                    <p className="text-[9px] text-slate-300 italic">ushbu hujjat quyidagi shaxsga berildi:</p>
                  </div>

                  {/* Student Name */}
                  <h1 className="text-xl font-black text-white uppercase tracking-wide border-b border-[#e8c97a]/30 pb-0.5 px-4 min-w-[200px]">
                    {previewCert.student_name}
                  </h1>

                  {/* Course Info */}
                  <p className="text-[10px] text-[#e8c97a] leading-relaxed max-w-md italic px-4">
                    "{previewCert.course_name}" sanitariya-gigiyena minimumi o'quv dasturini muvaffaqiyatli yakunlaganligi tasdiqlanadi.
                  </p>

                  {/* Divider */}
                  <div className="w-4/5 h-[1px] bg-[#c9a84c] opacity-40"></div>

                  {/* Bottom section: Meta information, QR, and Signature */}
                  <div className="grid grid-cols-3 gap-2 w-full text-left pt-1.5 px-2 items-center">
                    {/* Metadata */}
                    <div className="text-[8.5px] text-slate-300 space-y-0.5 bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/40">
                      <p><b>Sertifikat ID:</b> <span className="font-mono text-emerald-400 font-bold">{previewCert.certificate_id}</span></p>
                      <p><b>Berilgan sana:</b> {previewCert.issued_at}</p>
                      <p><b>Amal qilish:</b> {previewCert.expires_at}</p>
                      <p><b>Holati:</b> <span className="text-emerald-400 font-bold">Faol / Haqiqiy</span></p>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center">
                      {previewCert.qr_code_image ? (
                        <img 
                          src={getMediaUrl(previewCert.qr_code_image)} 
                          alt="QR Code" 
                          className="w-16 h-16 bg-white p-1 rounded-lg border border-emerald-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-[8px] text-slate-500">QR Code</div>
                      )}
                    </div>

                    {/* Leader signature */}
                    <div className="text-center space-y-0.5 text-[8px] text-slate-300">
                      <div className="h-4"></div>
                      <p className="border-t border-slate-500 w-24 mx-auto pt-0.5"></p>
                      <p className="font-bold text-white">Malika Kudratxodjayeva</p>
                      <p className="text-slate-400 italic text-[6px] max-w-[120px] mx-auto leading-tight">
                        Toshkent shahar Sanitariya-epidemiologik osoyishtalik va jamoat salomatligi boshqarmasi boshlig'i
                      </p>
                    </div>
                  </div>

                  {/* Footer verification text */}
                  <p className="text-[7px] text-[#e8c97a] opacity-80 pt-1.5 font-mono">
                    Sertifikatning haqiqiyligini tekshirish uchun QR kodni skanerlang yoki: {window.location.origin}/verify/{previewCert.certificate_id}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              {previewCert.pdf_file && (
                <a 
                  href={getMediaUrl(previewCert.pdf_file)} 
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  <Icon d={ICONS.download} size={12} /> Asl PDF nusxasi
                </a>
              )}
              <button 
                onClick={() => setPreviewCert(null)}
                className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 transition"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-45 px-2 shadow-lg">
        {navItems.map(item => {
          const isActive = section === item.id
          const cc = colorConfig[item.color]
          return (
            <button key={item.id}
              onClick={() => { changeSection(item.id); setUserSearch(''); setUserPage(1); setError(''); setSuccessMsg('') }}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-all duration-150 relative ${
                isActive ? 'text-violet-600' : 'text-slate-500'
              }`}
            >
              <Icon d={item.icon} size={18} className={isActive ? 'text-violet-600' : 'text-slate-400'} />
              <span className="mt-1 text-[8px] truncate max-w-[56px]">{item.label}</span>
              {item.count !== null && (
                <span className="absolute top-0.5 right-3 text-[8px] font-bold px-1 bg-red-500 text-white rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Excel Export Modal ── */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-scaleUp">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Icon d={ICONS.cert} size={18} className="text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Excelga eksport qilish</h3>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              >
                <Icon d={ICONS.close} size={18} />
              </button>
            </div>
            
            <form onSubmit={handleExportExcel}>
              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-500">
                  Sertifikatlarni Excel formatida yuklab olish uchun sana oralig'ini tanlang. Sanalarni bo'sh qoldirsangiz, barcha sertifikatlar eksport qilinadi.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Boshlanish sanasi</label>
                  <input 
                    type="date" 
                    value={exportStartDate} 
                    onChange={e => setExportStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none text-slate-700" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Tugash sanasi</label>
                  <input 
                    type="date" 
                    value={exportEndDate} 
                    onChange={e => setExportEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none text-slate-700" 
                  />
                </div>
              </div>
              
              <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 transition"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
                >
                  Eksport qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Certificate Delete Confirmation Modal ── */}
      {deletingCertId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-scaleUp">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Icon d={ICONS.trash} size={18} className="text-red-500" />
                <h3 className="font-bold text-slate-800 text-sm">
                  {lang === 'ru' ? 'Удаление сертификата' : "Sertifikatni o'chirish"}
                </h3>
              </div>
              <button 
                onClick={() => setDeletingCertId(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              >
                <Icon d={ICONS.close} size={18} />
              </button>
            </div>
            
            <div className="p-5 space-y-3">
              <p className="text-sm text-slate-650">
                {lang === 'ru' 
                  ? `Вы действительно хотите удалить этот сертификат (${deletingCertId})?`
                  : `Haqiqatan ham ushbu sertifikatni (${deletingCertId}) o'chirmoqchimisiz?`}
              </p>
              <p className="text-xs text-red-500 font-semibold bg-red-50 border border-red-100 p-2.5 rounded-xl">
                {lang === 'ru'
                  ? '⚠ Внимание: это действие необратимо и файл сертификата будет безвозвратно удален с сервера.'
                  : "⚠ Diqqat: ushbu amalni ortga qaytarib bo'lmaydi va sertifikat fayli serverdan butunlay o'chiriladi."}
              </p>
            </div>
            
            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => setDeletingCertId(null)}
                className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 transition"
              >
                {lang === 'ru' ? 'Отмена' : 'Bekor qilish'}
              </button>
              <button 
                onClick={submitDeleteCertificate}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
              >
                {lang === 'ru' ? 'Удалить' : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}

      {/* ── Bottom-right toast for password reset ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-emerald-600 text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500 animate-slideInRight" style={{animation:'slideUp 0.3s ease'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          {toast}
        </div>
      )}
    </div>
  )
}
