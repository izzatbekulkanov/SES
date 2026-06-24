import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UserProfile from './UserProfile'

const API = 'http://127.0.0.1:8000/api'

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d={d} />
  </svg>
)

const IC = {
  courses:  'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',
  students: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  cert:     'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  plus:     'M12 5v14 M5 12h14',
  logout:   'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9',
  profile:  'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8',
  upload:   'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  check:    'M20 6L9 17l-5-5',
  close:    'M18 6L6 18M6 6l12 12',
  back:     'M19 12H5 M12 5l-7 7 7 7',
  award:    'M12 15l-2 5L8 18l-5 3 3-5-2-2 5-3 M12 15l2 5 2-2 5 3-3-5 2-2-5-3 M9 9a3 3 0 116 0 3 3 0 01-6 0z',
  eye:      'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z',
  copy:     'M9 15H5a2 2 0 01-2-2V3a2 2 0 012-2h8a2 2 0 012 2v4 M5 12h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z',
  phone:    'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z',
  building: 'M3 21h18M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2M3 7h18M3 7v14a2 2 0 002 2h14a2 2 0 002-2V7M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6M9 11h2M13 11h2',
  mail:     'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  passport: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M12 11a3 3 0 100-6 3 3 0 000 6z M18 16.5a6 6 0 00-12 0',
  calendar: 'M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z M16 2v4 M8 2v4 M3 10h18',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  search:   'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
}

// ── Helper to resolve media URLs ──────────────────────────────────────────────
const getMediaUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `http://127.0.0.1:8000${url}`
}


const translations = {
  uz: {
    studentRole: "Talaba",
    changePassword: "Parolni o'zgartirish",
    logout: "Chiqish",
    profilePic: "Profil rasmi",
    father: "Otasi:",
    passport: "Pasport",
    jshshir: "JSHSHIR (14 raqam)",
    birthDate: "Tug'ilgan sana",
    phone: "Telefon",
    org: "Tashkilot / Ish joyi",
    email: "Email",
    loading: "Yuklanmoqda...",
    progressGraph: "Darslar jadvali (progress)",
    enrolledCourses: "Kursga yozilgan darslar",
    ongoingCourses: "Davom etayotgan darslar",
    completedCourses: "Yakunlangan darslar",
    allCompleted: "Barcha kurslar yakunlangan",
    downloadCert: "Sertifikatni yuklab olish",
    noCourses: "Hozircha hech qanday kursga yozilmagansiz.",
    lessons36: "36 soat dars",
    downloadPdf: "Yuklab olish (PDF)"
  },
  ru: {
    studentRole: "Студент",
    changePassword: "Сменить пароль",
    logout: "Выйти",
    profilePic: "Фото профиля",
    father: "Отец:",
    passport: "Паспорт",
    jshshir: "ПИНФЛ (14 цифр)",
    birthDate: "Дата рождения",
    phone: "Телефон",
    org: "Организация / Место работы",
    email: "Email",
    loading: "Загрузка...",
    progressGraph: "График уроков (прогресс)",
    enrolledCourses: "Мои курсы",
    ongoingCourses: "Текущие курсы",
    completedCourses: "Завершенные курсы",
    allCompleted: "Все курсы завершены",
    downloadCert: "Скачать сертификат",
    noCourses: "Пока вы не записаны ни на один курс.",
    lessons36: "36 часов занятий",
    downloadPdf: "Скачать (PDF)"
  }
};

export default function StudentDashboard() {
  const [coursesProgress, setCoursesProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const [previewCert, setPreviewCert] = useState(null)
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'uz')
  const t = translations[lang] || translations.uz;
  
  const token = localStorage.getItem('access_token')
  const navigate = useNavigate()
  
  // Student Profile state (loads from localStorage, updates from backend /auth/me)
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'))

  async function fetchProfile() {
    try {
      const response = await fetch(`${API}/auth/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        localStorage.setItem('user', JSON.stringify(data))
      }
    } catch { /* silent */ }
  }

  async function fetchProgress() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API}/student/progress/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const resData = await response.json()
        setCoursesProgress(resData)
      } else {
        if (response.status === 401) {
          handleLogout()
        } else {
          setError('Ma’lumotlarni yuklashda xatolik yuz berdi.')
        }
      }
    } catch {
      setError('Serverga ulanishda xatolik yuz berdi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    setTimeout(() => {
      fetchProgress()
      fetchProfile()
    }, 0)
  }, [])

  function handleLogout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-600 font-semibold text-sm">{t.loading}</div>
        </div>
      </div>
    )
  }

  // Group courses by status
  const ongoingCourses = coursesProgress.filter(c => !c.has_certificate)
  const completedCourses = coursesProgress.filter(c => c.has_certificate)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="SES Logo" className="w-8 h-8 object-contain" />
              <span className="text-lg font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wider">
                SES PORTAL
              </span>
              <span className="bg-violet-50 text-violet-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-violet-100 uppercase">
                Talaba
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
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
              <button 
                onClick={() => setShowProfile(true)}
                className="bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 text-slate-700 hover:text-violet-700 text-xs px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
              >
                <Icon d={IC.profile} size={13} /> {t.changePassword}
              </button>
              <button 
                onClick={handleLogout}
                className="bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 text-xs px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
              >
                <Icon d={IC.logout} size={13} /> Chiqish
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* LEFT COLUMN: Full Student Profile Info */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center">
            {profile.profile_picture ? (
              <img 
                src={getMediaUrl(profile.profile_picture)} 
                alt="{t.profilePic}" 
                className="w-24 h-24 rounded-full object-cover border-2 border-violet-100 shadow-md mb-4 shrink-0" 
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-100 to-indigo-100 text-violet-700 flex items-center justify-center font-black text-3xl border border-violet-200 shadow-md mb-4 shrink-0 font-sans">
                {profile.first_name ? profile.first_name[0] : ''}{profile.last_name ? profile.last_name[0] : ''}
              </div>
            )}
            
            <h2 className="text-base font-extrabold text-slate-900 text-center leading-snug">
              {profile.first_name} {profile.last_name}
            </h2>
            {profile.father_name && (
              <p className="text-xs text-slate-400 mt-0.5 text-center font-medium">{t.father} {profile.father_name}</p>
            )}
            <code className="text-[10px] text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full font-bold mt-2 font-mono">@{profile.username}</code>

            {/* Profile fields detail list */}
            <div className="w-full space-y-4.5 mt-6 pt-5 border-t border-slate-100 text-xs">
              
              {profile.passport_series && (
                <div className="flex items-start gap-2.5">
                  <Icon d={IC.passport} size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">{t.passport}</span>
                    <span className="font-mono text-slate-700 font-extrabold">{profile.passport_series} {profile.passport_number}</span>
                  </div>
                </div>
              )}

              {profile.jshshir && (
                <div className="flex items-start gap-2.5">
                  <span className="text-[9px] font-black text-slate-400 shrink-0 w-5 mt-1 font-mono">JSH</span>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">{t.jshshir}</span>
                    <span className="font-mono text-slate-700 font-extrabold tracking-wider">{profile.jshshir}</span>
                  </div>
                </div>
              )}

              {profile.birth_date && (
                <div className="flex items-start gap-2.5">
                  <Icon d={IC.calendar} size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">{t.birthDate}</span>
                    <span className="text-slate-700 font-semibold">{profile.birth_date}</span>
                  </div>
                </div>
              )}

              {profile.phone_number && (
                <div className="flex items-start gap-2.5">
                  <Icon d={IC.phone} size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">{t.phone}</span>
                    <span className="text-slate-700 font-semibold">{profile.phone_number}</span>
                  </div>
                </div>
              )}

              {profile.organization && (
                <div className="flex items-start gap-2.5">
                  <Icon d={IC.building} size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">{t.org}</span>
                    <span className="text-slate-700 font-semibold truncate block" title={profile.organization}>{profile.organization}</span>
                  </div>
                </div>
              )}

              {profile.email && (
                <div className="flex items-start gap-2.5">
                  <Icon d={IC.mail} size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">{t.email}</span>
                    <span className="text-slate-700 font-semibold truncate block" title={profile.email}>{profile.email}</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Courses division (ongoing and completed) */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-xs font-semibold shrink-0">
              {error}
            </div>
          )}

          {coursesProgress.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm shadow-sm">
              Siz hali biror dars kursiga yozilmangansiz.
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* SECTION 1: Jarayondagi darslar (In Progress) */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Jarayondagi dars kurslari ({ongoingCourses.length})
                </h3>
                
                {ongoingCourses.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center text-slate-400 text-xs shadow-sm">
                    Ayni damda jarayondagi darslar yo'q.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {ongoingCourses.map((c) => {
                      const pct = Math.round((c.completed_lessons.length / c.total_lessons) * 100)
                      return (
                        <div key={c.course_id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">{c.course_title}</h4>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Muddat: <span className="font-semibold text-slate-600">{c.start_date} - {c.end_date}</span>
                              </p>
                            </div>
                            <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase shrink-0">
                              O'qitilmoqda
                            </span>
                          </div>

                          {/* Progress slider */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px] text-slate-500 font-bold">
                              <span>O'zlashtirish</span>
                              <span>{pct}% ({c.completed_lessons.length}/{c.total_lessons} dars)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-amber-500 h-2 rounded-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>

                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-500 flex items-center gap-1.5">
                            <span>⚠️ Barcha darslarni yakunlaganingizdan so'ng sertifikat tasdiqlanadi.</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 2: {t.completedCourses} (Completed) */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Yakunlangan dars kurslari ({completedCourses.length})
                </h3>

                {completedCourses.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center text-slate-400 text-xs shadow-sm">
                    {t.completedCourses} yo'q.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {completedCourses.map((c) => {
                      const cert = c.certificate || {}
                      return (
                        <div key={c.course_id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4.5">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">{c.course_title}</h4>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Yakunlandi: <span className="font-semibold text-slate-600">{c.end_date}</span>
                              </p>
                            </div>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase shrink-0">
                              ✓ Tamomlangan
                            </span>
                          </div>

                          {/* Certificate Badge and Actions */}
                          <div className="flex flex-col sm:flex-row items-center gap-4 bg-emerald-50/20 p-4 rounded-xl border border-emerald-100/50">
                            {cert.qr_code_image && (
                              <img 
                                src={getMediaUrl(cert.qr_code_image)} 
                                alt="QR Code" 
                                className="w-16 h-16 bg-white p-1 rounded-lg border border-emerald-100 shrink-0 shadow-sm"
                              />
                            )}
                            <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                              <h5 className="font-bold text-slate-800 text-xs">Sertifikat rasmiylashtirildi</h5>
                              <p className="text-[10px] text-slate-400 font-mono">
                                ID: <span className="font-bold text-slate-600">{cert.certificate_id}</span> | 
                                Amal qilish muddati: <span className="font-bold text-slate-600">{cert.expiry_date}</span>
                              </p>
                              
                              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1.5">
                                <a 
                                  href={getMediaUrl(cert.pdf_file)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                                >
                                  <Icon d={IC.download} size={11} /> {t.downloadPdf}
                                </a>
                                <button 
                                  onClick={() => setPreviewCert({ ...cert, student_name: `${profile.first_name} ${profile.last_name}`, course_name: c.course_title })}
                                  className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                                >
                                  <Icon d={IC.eye} size={11} /> Ko'rish
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </main>

      {/* ── Certificate Preview Modal ── */}
      {previewCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden border border-slate-100 my-8">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <Icon d={IC.cert} size={18} className="text-emerald-600 animate-pulse" />
                <h3 className="font-bold text-slate-800 text-sm">Sertifikatni ko'rish</h3>
              </div>
              <button 
                onClick={() => setPreviewCert(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              >
                <Icon d={IC.close} size={18} />
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
                        <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-[8px] text-slate-500">QR</div>
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
                    Sertifikatning haqiqiyligini tekshirish uchun QR kodni skanerlang yoki: https://shahar-ses.uz/verify/{previewCert.certificate_id}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 shrink-0">
              <a 
                href={getMediaUrl(previewCert.pdf_file)} 
                target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                <Icon d={IC.download} size={12} /> Asl PDF nusxasi
              </a>
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

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </div>
  )
}
