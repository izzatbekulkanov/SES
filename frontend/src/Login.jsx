import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'https://shahar-ses.uz/api'

// Simple icon
const Icon = ({ d, size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d={d} />
  </svg>
)
const IC = {
  login:  'M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4 M10 17l5-5-5-5 M15 12H3',
  cert:   'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.35-4.35',
  check:  'M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3',
  warn:   'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
  qr:     'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M17 14h.01 M14 14h.01 M20 14h.01 M17 17h.01 M20 17h.01 M14 17h.01 M17 20h.01 M20 20h.01 M14 20h.01',
  award:  'M8.21 13.89L7 23l5-3 5 3-1.21-9.12 M12 2a7 7 0 100 14 7 7 0 000-14z',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  eye:    'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 5a7 7 0 100 14 7 7 0 000-14z M12 9a3 3 0 100 6 3 3 0 000-6z',
  eyeOff: 'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22',
}

const translations = {
  uz: {
    portalTitle: "SES PORTAL",
    subtitle: "Sanitariya minimumi sertifikatlashtirish tizimi",
    description: "Sanitariya-epidemiologik osoyishtalik va jamoat salomatligi qo'mitasining Toshkent shahar boshqarmasi",
    loginTab: "Tizimga kirish",
    verifyTab: "Sertifikat tekshirish",
    // Login form
    usernameLabel: "Foydalanuvchi nomi",
    usernamePlaceholder: "Masalan: admin",
    passwordLabel: "Parol",
    rememberMe: "Eslab qolinsinmi?",
    loginBtn: "Tizimga kirish",
    loggingIn: "Kirilmoqda...",
    rememberedAccount: "Eslab qolingan hisob",
    deleteSavedAccount: "O'chirish",
    errorLoadUser: "Foydalanuvchi ma'lumotlarini yuklab bo'lmadi.",
    errorConn: "Serverga ulanishda xatolik yuz berdi.",
    errorCreds: "Foydalanuvchi nomi yoki parol xato!",
    errorNoActiveAccount: "Kiritilgan ma'lumotlarga mos faol foydalanuvchi topilmadi!",
    // Verify form
    verifyIntro: "O'quvchining pasport seriyasi va raqamini kiritib, sertifikatlarni tekshiring.",
    passportInputLabel: "Pasport seriyasi va raqami",
    invalidFormat: "Pasport formatini to'g'ri kiriting (Masalan: AA 1234567)",
    passportSeriesLabel: "Seriya",
    passportNumberLabel: "Raqam",
    searchBtn: "Sertifikatni izlash",
    searching: "Qidirilmoqda...",
    exampleHint: "Misol: AA 1234567",
    // Verify results
    noCertsTitle: "Sertifikatlar topilmadi",
    noCertsDesc: "Ushbu pasport egasi nomiga sertifikatlar rasmiylashtirilmagan.",
    foundCertsHeader: (count) => `Topilgan sertifikatlar (${count} ta)`,
    certFoundTitle: "Sertifikat topildi!",
    certIdLabel: "ID",
    ownerLabel: "Egasi",
    courseLabel: "Kurs",
    issuedLabel: "Berilgan sana",
    expiresLabel: "Amal qiladi",
    statusLabel: "Holati",
    statusActive: "✓ Faol",
    statusExpired: "✗ Muddati tugagan",
    btnViewDetails: "Batafsil ko'rish",
    btnDownloadPdf: "PDF yuklab olish",
    studentNotFoundTitle: "O'quvchi topilmadi",
    studentNotFoundDesc: "Kiritilgan pasport ma'lumotlariga mos keladigan o'quvchi tizimda topilmadi.",
    verifyErrorGeneral: "Tekshirishda xatolik yuz berdi.",
    verifyErrorConn: "Serverga ulanishda xatolik.",
    footerText: "© 2026 Sanitariya-epidemiologik osoyishtalik va jamoat salomatligi qo'mitasining Toshkent shahar boshqarmasi · Sanitariya minimumi sertifikatlashtirish"
  },
  ru: {
    portalTitle: "SES PORTAL",
    subtitle: "Система сертификации санитарного минимума",
    description: "Ташкентское городское управление Комитета санитарно-эпидемиологического благополучия и общественного здоровья",
    loginTab: "Вход в систему",
    verifyTab: "Проверка сертификата",
    // Login form
    usernameLabel: "Имя пользователя",
    usernamePlaceholder: "Например: admin",
    passwordLabel: "Пароль",
    rememberMe: "Запомнить меня?",
    loginBtn: "Войти",
    loggingIn: "Вход...",
    rememberedAccount: "Сохраненный аккаунт",
    deleteSavedAccount: "Убрать",
    errorLoadUser: "Не удалось загрузить данные пользователя.",
    errorConn: "Произошла ошибка при подключении к серверу.",
    errorCreds: "Неверное имя пользователя или пароль!",
    errorNoActiveAccount: "Не найден активный пользователь с указанными учетными данными!",
    // Verify form
    verifyIntro: "Введите серию и номер паспорта студента для проверки сертификатов.",
    passportInputLabel: "Серия и номер паспорта",
    invalidFormat: "Введите паспорт в правильном формате (Например: AA 1234567)",
    passportSeriesLabel: "Серия",
    passportNumberLabel: "Номер",
    searchBtn: "Поиск сертификата",
    searching: "Поиск...",
    exampleHint: "Пример: AA 1234567",
    // Verify results
    noCertsTitle: "Сертификаты не найдены",
    noCertsDesc: "На имя владельца этого паспорта сертификаты не оформлены.",
    foundCertsHeader: (count) => `Найденные сертификаты (${count} шт)`,
    certFoundTitle: "Сертификат найден!",
    certIdLabel: "ID",
    ownerLabel: "Владелец",
    courseLabel: "Курс",
    issuedLabel: "Дата выдачи",
    expiresLabel: "Действителен до",
    statusLabel: "Статус",
    statusActive: "✓ Активен",
    statusExpired: "✗ Срок действия истек",
    btnViewDetails: "Подробнее",
    btnDownloadPdf: "Скачать PDF",
    studentNotFoundTitle: "Студент не найден",
    studentNotFoundDesc: "Студент с указанными паспортными данными не найден в системе.",
    verifyErrorGeneral: "Произошла ошибка при проверке.",
    verifyErrorConn: "Ошибка связи с сервером.",
    footerText: "© 2026 Ташкентское городское управление Комитета санитарно-эпидемиологического благополучия и общественного здоровья · Сертификация санитарного минимума"
  }
}

export default function Login() {
  const navigate = useNavigate()

  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'uz')
  const t = translations[lang] || translations.uz

  // ── Tab ───────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState('login') // 'login' | 'verify'

  // ── Login form ────────────────────────────────────────────────────────────
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [rememberMe, setRememberMe] = useState(true)
  const [rememberedAccounts, setRememberedAccounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ses_remembered_accounts') || '[]')
    } catch {
      return []
    }
  })
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const r = await fetch(`${API}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (r.ok) {
        const data = await r.json()
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)

        if (rememberMe) {
          const exists = rememberedAccounts.some(acc => acc.username.toLowerCase() === username.toLowerCase())
          let updated = [...rememberedAccounts]
          if (exists) {
            updated = updated.map(acc => acc.username.toLowerCase() === username.toLowerCase() ? { username, password } : acc)
          } else {
            updated.push({ username, password })
          }
          localStorage.setItem('ses_remembered_accounts', JSON.stringify(updated))
          setRememberedAccounts(updated)
        }

        const meR = await fetch(`${API}/auth/me/`, {
          headers: { Authorization: `Bearer ${data.access}` }
        })
        if (meR.ok) {
          const user = await meR.json()
          localStorage.setItem('user', JSON.stringify(user))
          navigate('/')
        } else {
          setError(t.errorLoadUser)
        }
      } else {
        const d = await r.json()
        let errMsg = d.detail || t.errorCreds
        if (errMsg === 'No active account found with the given credentials') {
          errMsg = t.errorNoActiveAccount
        }
        setError(errMsg)
      }
    } catch {
      setError(t.errorConn)
    } finally {
      setLoading(false)
    }
  }

  // ── Verify form ───────────────────────────────────────────────────────────
  const [passportInput, setPassportInput] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyResult, setVerifyResult] = useState(null) // null | { valid, data }
  const [verifyError, setVerifyError] = useState('')

  const handleVerify = async (e) => {
    e.preventDefault()
    const rawVal = passportInput.trim()
    if (!rawVal) return

    // Parse AA1234567 or AA 1234567 (2 letters followed by 7 digits)
    const match = rawVal.match(/^([A-Za-z]{2})\s*(\d{7})$/)
    if (!match) {
      setVerifyError(t.invalidFormat)
      return
    }

    const series = match[1].toUpperCase()
    const num = match[2]

    setVerifyError('')
    setVerifyResult(null)
    setVerifyLoading(true)
    try {
      const q = `?passport_series=${encodeURIComponent(series)}&passport_number=${encodeURIComponent(num)}`
      const r = await fetch(`${API}/certificates/verify-passport/${q}`)
      if (r.ok) {
        const data = await r.json()
        setVerifyResult({ valid: true, data })
      } else if (r.status === 404) {
        setVerifyResult({ valid: false })
      } else {
        const d = await r.json()
        setVerifyError(d.detail || t.verifyErrorGeneral)
      }
    } catch {
      setVerifyError(t.verifyErrorConn)
    } finally {
      setVerifyLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-violet-50 to-slate-100 flex flex-col items-center justify-center py-12 px-4">

      {/* Language Selector */}
      <div className="w-full max-w-md flex justify-end gap-2 mb-4">
        <div className="flex bg-white/85 rounded-xl p-0.5 border border-slate-200/80 shadow-xs backdrop-blur-xs">
          <button
            onClick={() => { setLang('uz'); localStorage.setItem('lang', 'uz'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              lang === 'uz'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            UZ
          </button>
          <button
            onClick={() => { setLang('ru'); localStorage.setItem('lang', 'ru'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              lang === 'ru'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            RU
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <img src="/logo.png" alt="SES Logo" className="w-16 h-16 object-contain mx-auto mb-3" />
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t.portalTitle}</h1>
        <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
        <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => { setTab('login'); setVerifyResult(null); setVerifyError('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all ${
              tab === 'login'
                ? 'bg-violet-600 text-white'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Icon d={IC.login} size={15} />
            {t.loginTab}
          </button>
          <button
            onClick={() => { setTab('verify'); setError('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all ${
              tab === 'verify'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Icon d={IC.cert} size={15} />
            {t.verifyTab}
          </button>
        </div>

        <div className="p-8">

          {/* ── LOGIN TAB ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                  <Icon d={IC.warn} size={15} className="shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  {t.usernameLabel}
                </label>
                <div className="relative">
                  <input
                    type="text" required
                    autoComplete="off"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-sm transition"
                    placeholder={t.usernamePlaceholder}
                    value={username}
                    onChange={e => {
                      setUsername(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  {showSuggestions && rememberedAccounts.filter(acc => !username || acc.username.toLowerCase().includes(username.toLowerCase())).length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                      {rememberedAccounts
                        .filter(acc => !username || acc.username.toLowerCase().includes(username.toLowerCase()))
                        .map((acc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-violet-50 cursor-pointer transition text-sm"
                            onMouseDown={() => {
                              setUsername(acc.username)
                              setPassword(acc.password)
                              setShowSuggestions(false)
                            }}
                          >
                            <div className="flex flex-col text-left">
                              <span className="font-semibold text-slate-800">@{acc.username}</span>
                              <span className="text-[10px] text-slate-400">{t.rememberedAccount}</span>
                            </div>
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.stopPropagation()
                                const updated = rememberedAccounts.filter(a => a.username !== acc.username)
                                localStorage.setItem('ses_remembered_accounts', JSON.stringify(updated))
                                setRememberedAccounts(updated)
                              }}
                              className="p-1.5 hover:bg-red-50 text-slate-455 hover:text-red-600 rounded-lg transition"
                              title={t.deleteSavedAccount}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {t.passwordLabel}
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} required
                    autoComplete="current-password"
                    className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-sm transition"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    <Icon d={showPassword ? IC.eyeOff : IC.eye} size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 select-none">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 border-slate-300 focus:ring-violet-400"
                  />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {t.rememberMe}
                  </span>
                </label>
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-semibold text-sm transition shadow-sm"
              >
                <Icon d={IC.login} size={15} />
                {loading ? t.loggingIn : t.loginBtn}
              </button>
            </form>
          )}

          {/* ── VERIFY TAB ── */}
          {tab === 'verify' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-3">
                  <Icon d={IC.award} size={22} className="text-emerald-600" />
                </div>
                <p className="text-sm text-slate-600">{t.verifyIntro}</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-3">
                {verifyError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                    <Icon d={IC.warn} size={15} className="shrink-0" /> {verifyError}
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    {t.passportInputLabel}
                  </label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-sm font-mono tracking-wider transition uppercase"
                    placeholder="AA 1234567"
                    value={passportInput}
                    onChange={e => {
                      setPassportInput(e.target.value)
                      setVerifyResult(null)
                      setVerifyError('')
                    }}
                  />
                </div>

                <button
                  type="submit" disabled={verifyLoading || !passportInput.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-semibold text-sm transition shadow-sm"
                >
                  <Icon d={IC.search} size={15} />
                  {verifyLoading ? t.searching : t.searchBtn}
                </button>
              </form>

              {/* Result */}
              {verifyResult && verifyResult.valid && (
                <div className="space-y-4">
                  {verifyResult.data.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                      <p className="font-bold text-amber-800 text-sm">{t.noCertsTitle}</p>
                      <p className="text-xs text-amber-600 mt-1">{t.noCertsDesc}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">{t.foundCertsHeader(verifyResult.data.length)}</p>
                      {verifyResult.data.map((cert) => (
                        <div key={cert.certificate_id} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                              <Icon d={IC.check} size={18} className="text-white" />
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-emerald-800 text-sm">{t.certFoundTitle}</p>
                              <p className="text-xs text-emerald-650 font-semibold font-mono">{t.certIdLabel}: {cert.certificate_id}</p>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-xl border border-emerald-100 p-4 space-y-2 text-xs text-slate-700 text-left">
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-semibold">{t.ownerLabel}</span>
                              <span className="font-bold">{cert.student_name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-semibold">{t.courseLabel}</span>
                              <span className="font-medium max-w-[180px] text-right">{cert.course_name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-semibold">{t.issuedLabel}</span>
                              <span>{cert.issued_date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-semibold">{t.expiresLabel}</span>
                              <span>{cert.expiry_date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-semibold">{t.statusLabel}</span>
                              <span className={`font-bold ${cert.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                                {cert.is_active ? t.statusActive : t.statusExpired}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/verify/${cert.certificate_id}`)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                            >
                              <Icon d={IC.cert} size={13} /> {t.btnViewDetails}
                            </button>
                            {cert.pdf_file && (
                              <a
                                href={cert.pdf_file.startsWith('http') ? cert.pdf_file : `https://shahar-ses.uz${cert.pdf_file}`}
                                target="_blank" rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl transition"
                              >
                                <Icon d={IC.download} size={13} /> {t.btnDownloadPdf}
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {verifyResult && !verifyResult.valid && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <Icon d={IC.warn} size={18} className="text-red-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-red-800 text-sm">{t.studentNotFoundTitle}</p>
                      <p className="text-xs text-red-650">{t.studentNotFoundDesc}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick hint */}
              {!verifyResult && (
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-center">
                  <p className="text-xs text-slate-400">{t.exampleHint}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-400 text-center leading-normal max-w-sm mx-auto">
        {t.footerText}
      </p>
    </div>
  )
}
