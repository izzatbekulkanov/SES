import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'http://localhost:8000/api'

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

export default function Login() {
  const navigate = useNavigate()

  // ── Tab ───────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState('login') // 'login' | 'verify'

  // ── Login form ────────────────────────────────────────────────────────────
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
        const meR = await fetch(`${API}/auth/me/`, {
          headers: { Authorization: `Bearer ${data.access}` }
        })
        if (meR.ok) {
          const user = await meR.json()
          localStorage.setItem('user', JSON.stringify(user))
          navigate('/')
        } else {
          setError("Foydalanuvchi ma'lumotlarini yuklab bo'lmadi.")
        }
      } else {
        const d = await r.json()
        setError(d.detail || 'Foydalanuvchi nomi yoki parol xato!')
      }
    } catch {
      setError('Serverga ulanishda xatolik yuz berdi.')
    } finally {
      setLoading(false)
    }
  }

  // ── Verify form ───────────────────────────────────────────────────────────
  const [certId, setCertId] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyResult, setVerifyResult] = useState(null) // null | { valid, data }
  const [verifyError, setVerifyError] = useState('')

  const handleVerify = async (e) => {
    e.preventDefault()
    const id = certId.trim().toUpperCase()
    if (!id) return
    setVerifyError('')
    setVerifyResult(null)
    setVerifyLoading(true)
    try {
      const r = await fetch(`${API}/certificates/verify/${encodeURIComponent(id)}/`)
      if (r.ok) {
        const data = await r.json()
        setVerifyResult({ valid: true, data })
      } else if (r.status === 404) {
        setVerifyResult({ valid: false })
      } else {
        setVerifyError("Tekshirishda xatolik yuz berdi.")
      }
    } catch {
      setVerifyError('Serverga ulanishda xatolik.')
    } finally {
      setVerifyLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-violet-50 to-slate-100 flex flex-col items-center justify-center py-12 px-4">

      {/* Header */}
      <div className="text-center mb-8">
        <img src="/logo.png" alt="SES Logo" className="w-16 h-16 object-contain mx-auto mb-3" />
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SES PORTAL</h1>
        <p className="text-sm text-slate-500 mt-1">Sanitariya minimumi sertifikatlashtirish tizimi</p>
        <p className="text-xs text-slate-400 mt-0.5">"Savdo Akademiyasi" O'quv Markazi</p>
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
            Tizimga kirish
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
            Sertifikat tekshirish
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
                  Foydalanuvchi nomi
                </label>
                <input
                  type="text" required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-sm transition"
                  placeholder="Masalan: admin"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Parol
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} required
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
              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-semibold text-sm transition shadow-sm"
              >
                <Icon d={IC.login} size={15} />
                {loading ? 'Kirilmoqda...' : 'Tizimga kirish'}
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
                <p className="text-sm text-slate-600">Sertifikat ID raqamini kiriting va uning haqiqiyligini tekshiring.</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-3">
                {verifyError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                    <Icon d={IC.warn} size={15} className="shrink-0" /> {verifyError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Sertifikat ID
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-sm font-mono tracking-wider transition"
                    placeholder="SES-2026-XXXXXX"
                    value={certId}
                    onChange={e => {
                      setCertId(e.target.value)
                      setVerifyResult(null)
                      setVerifyError('')
                    }}
                  />
                </div>
                <button
                  type="submit" disabled={verifyLoading || !certId.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-semibold text-sm transition shadow-sm"
                >
                  <Icon d={IC.search} size={15} />
                  {verifyLoading ? 'Tekshirilmoqda...' : 'Tekshirish'}
                </button>
              </form>

              {/* Result */}
              {verifyResult && verifyResult.valid && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <Icon d={IC.check} size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-800 text-sm">Sertifikat haqiqiy!</p>
                      <p className="text-xs text-emerald-600">Ushbu sertifikat tizimda mavjud va faol.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-emerald-100 p-4 space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Sertifikat ID</span>
                      <code className="font-bold text-emerald-700">{verifyResult.data.certificate_id}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Egasi</span>
                      <span className="font-bold">{verifyResult.data.student_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Kurs</span>
                      <span className="font-medium max-w-[180px] text-right">{verifyResult.data.course_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Berilgan sana</span>
                      <span>{verifyResult.data.issued_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Amal qiladi</span>
                      <span>{verifyResult.data.expiry_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Holati</span>
                      <span className={`font-bold ${verifyResult.data.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                        {verifyResult.data.is_active ? '✓ Faol' : '✗ Bekor qilingan'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/verify/${verifyResult.data.certificate_id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                    >
                      <Icon d={IC.cert} size={13} /> Batafsil ko'rish
                    </button>
                    {verifyResult.data.pdf_file && (
                      <a
                        href={verifyResult.data.pdf_file.startsWith('http') ? verifyResult.data.pdf_file : `http://localhost:8000${verifyResult.data.pdf_file}`}
                        target="_blank" rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl transition"
                      >
                        <Icon d={IC.download} size={13} /> PDF yuklab olish
                      </a>
                    )}
                  </div>
                </div>
              )}

              {verifyResult && !verifyResult.valid && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <Icon d={IC.warn} size={18} className="text-red-500" />
                    </div>
                    <div>
                      <p className="font-bold text-red-800 text-sm">Sertifikat topilmadi</p>
                      <p className="text-xs text-red-600">Ushbu ID bilan sertifikat tizimda mavjud emas yoki noto'g'ri kiritilgan.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick hint */}
              {!verifyResult && (
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-center">
                  <p className="text-xs text-slate-400">Misol: <code className="font-mono text-slate-600 font-semibold">SES-2026-E1OX5E</code></p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-400 text-center">
        © 2026 "Savdo Akademiyasi" O'quv Markazi · Sanitariya minimumi sertifikatlashtirish
      </p>
    </div>
  )
}
