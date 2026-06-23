import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import UserProfile from './UserProfile'

const API = 'http://localhost:8000/api'
const PAGE_SIZE = 8

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
  return `http://localhost:8000${url}`
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

// ─── Badge ────────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const map = {
    ADMIN:   { label: 'Admin', cls: 'bg-red-50 text-red-700 border-red-200' },
    TEACHER: { label: "O'qituvchi", cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    STUDENT: { label: "O'quvchi", cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  }
  const { label, cls } = map[role] || { label: role, cls: 'bg-slate-50 text-slate-600 border-slate-200' }
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cls}`}>{label}</span>
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, total, pageSize, onPage }) {
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
      <span className="text-xs text-slate-400">{total} ta • Sahifa {page}/{pages}</span>
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
function SearchBar({ value, onChange, placeholder = 'Qidirish...' }) {
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
export default function AdminDashboard() {
  const navigate = useNavigate()
  const { section: urlSection } = useParams()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('access_token')

  // ── Navigation ──────────────────────────────────────────────────────────────
  const VALID_SECTIONS = ['students', 'teachers', 'admins', 'stats', 'certs']
  const section = VALID_SECTIONS.includes(urlSection) ? urlSection : 'students'

  const changeSection = (s) => {
    navigate(`/admin/${s}`)
  }

  // ── Users data ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)

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

  // ── Create user form ─────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false)
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
  const [showProfile, setShowProfile] = useState(false)

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

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const r = await fetch(`${API}/admin/users/`, { headers: { Authorization: `Bearer ${token}` } })
      if (r.ok) setUsers(await r.json())
      else if (r.status === 401 || r.status === 403) handleLogout()
    } catch { /* silent */ }
    finally { setLoadingUsers(false) }
  }

  const fetchTeacherStats = async () => {
    setLoadingStats(true)
    try {
      const r = await fetch(`${API}/admin/teacher-stats/`, { headers: { Authorization: `Bearer ${token}` } })
      if (r.ok) setTeacherStats(await r.json())
    } catch { /* silent */ }
    finally { setLoadingStats(false) }
  }

  const fetchCerts = async (search = '') => {
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
  const handleLogout = () => { localStorage.clear(); navigate('/login') }

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0]
    if (file) { setProfilePicture(file); setProfilePreview(URL.createObjectURL(file)) }
  }

  const resetForm = () => {
    setFirstName(''); setLastName(''); setEmail('')
    setPassportSeries(''); setPassportNumber(''); setJshshir('')
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
      fd.append('passport_number', passportNumber); fd.append('jshshir', jshshir)
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
        setSuccessMsg(`✓ ${role === 'ADMIN' ? 'Admin' : role === 'TEACHER' ? "O'qituvchi" : "O'quvchi"} yaratildi. Username: ${u.username}`)
        resetForm(); setShowForm(false)
        fetchUsers()
        if (section === 'stats') fetchTeacherStats()
      } else {
        const d = await r.json()
        setError(d.detail || "Yaratishda xatolik yuz berdi.")
      }
    } catch { setError("Serverga ulanishda xatolik yuz berdi.") }
    finally { setFormLoading(false) }
  }

  const handleResetPassword = async (userId, username) => {
    setError(''); setSuccessMsg('')
    const r = await fetch(`${API}/admin/reset-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ user_id: userId })
    })
    if (r.ok) setSuccessMsg(`✓ ${username} paroli 'ses2026' ga qaytarildi.`)
    else setError('Parolni tiklashda xatolik yuz berdi.')
  }

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

  const groupedCerts = useMemo(() => {
    const filtered = certs.filter(c => {
      if (selectedTeacherId && c.teacher_id !== parseInt(selectedTeacherId)) return false
      if (selectedCourseId && c.course_id !== parseInt(selectedCourseId)) return false
      
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

    const groups = {}
    filtered.forEach(c => {
      const uid = c.student_username
      if (!groups[uid]) {
        groups[uid] = {
          student_id: c.student_id,
          student_name: c.student_name,
          student_username: c.student_username,
          student_picture: c.student_picture,
          certificates: []
        }
      }
      groups[uid].certificates.push(c)
    })
    return Object.values(groups)
  }, [certs, selectedTeacherId, selectedCourseId, certSearch])

  const pagedGroupedCerts = useMemo(() => {
    return groupedCerts.slice((certPage - 1) * PAGE_SIZE, certPage * PAGE_SIZE)
  }, [groupedCerts, certPage])

  // ── Nav menu config ────────────────────────────────────────────────────────────
  const navItems = [
    { id: 'students', label: "O'quvchilar", icon: ICONS.students, color: 'violet', count: users.filter(u => u.role === 'STUDENT').length },
    { id: 'teachers', label: "O'qituvchilar", icon: ICONS.teacher, color: 'blue', count: users.filter(u => u.role === 'TEACHER').length },
    { id: 'admins',   label: 'Adminlar',    icon: ICONS.admin,   color: 'red',    count: users.filter(u => u.role === 'ADMIN').length },
    { id: 'stats',    label: 'Statistika',  icon: ICONS.stats,   color: 'indigo', count: null },
    { id: 'certs',    label: 'Sertifikatlar', icon: ICONS.cert,  color: 'emerald', count: certs.length || null },
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
    <div className="min-h-screen bg-[#f0f2f8] flex flex-col">

      {/* ── Topbar ── */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SES Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-slate-800 text-sm tracking-tight">SES PORTAL</span>
          <span className="hidden sm:inline text-[11px] bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-full font-semibold">
            Administrator
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-right">
            <div>
              <p className="text-xs font-bold text-slate-800 leading-none">{user.first_name} {user.last_name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{user.email || user.username}</p>
            </div>
            <Avatar src={user.profile_picture} name={`${user.first_name} ${user.last_name}`} role="ADMIN" />
          </div>
          <button onClick={() => setShowProfile(true)}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-violet-600 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 px-3 py-1.5 rounded-lg font-semibold transition">
            <Icon d={ICONS.profile} size={13} />
            Profil
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg font-semibold transition">
            <Icon d={ICONS.logout} size={13} />
            Chiqish
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col py-4 px-3 gap-1 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Boshqaruv paneli</p>

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
                <div className="flex items-center gap-2.5">
                  <Icon d={item.icon} size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : cc.pill}`}>
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}

          <div className="mt-auto pt-4 border-t border-slate-100">
            <button
              onClick={() => { setShowForm(!showForm); setError(''); setSuccessMsg('') }}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-all"
            >
              <Icon d={ICONS.plus} size={15} />
              Foydalanuvchi qo'shish
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 flex flex-col overflow-hidden p-5 gap-4 overflow-y-auto">

          {/* ── Summary Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
            {[
              {
                label: "O'quvchilar",
                count: users.filter(u => u.role === 'STUDENT').length,
                icon: ICONS.students,
                iconBg: 'bg-violet-100',
                iconColor: 'text-violet-600',
                text: 'text-violet-600',
                border: 'border-violet-100',
                onClick: () => { changeSection('students'); setUserSearch(''); setUserPage(1) }
              },
              {
                label: "O'qituvchilar",
                count: users.filter(u => u.role === 'TEACHER').length,
                icon: ICONS.teacher,
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
                text: 'text-blue-600',
                border: 'border-blue-100',
                onClick: () => { changeSection('teachers'); setUserSearch(''); setUserPage(1) }
              },
              {
                label: 'Adminlar',
                count: users.filter(u => u.role === 'ADMIN').length,
                icon: ICONS.admin,
                iconBg: 'bg-red-100',
                iconColor: 'text-red-500',
                text: 'text-red-500',
                border: 'border-red-100',
                onClick: () => { changeSection('admins'); setUserSearch(''); setUserPage(1) }
              },
              {
                label: 'Sertifikatlar',
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
                  <p className="text-[10px] text-slate-400 mt-1">Jami ro'yxatda</p>
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

          {/* Create User Modal/Panel */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 text-base">Yangi foydalanuvchi yaratish</h2>
                <button onClick={() => { setShowForm(false); resetForm() }}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold leading-none w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition">✕</button>
              </div>

              <form onSubmit={handleCreateUser}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Role */}
                  <div className="lg:col-span-3">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Tizim Roli *</label>
                    <div className="flex gap-2">
                      {[['TEACHER',"O'qituvchi",'blue'], ['ADMIN','Administrator','red']].map(([val, lbl, color]) => (
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
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Ism *</label>
                    <input required type="text" placeholder="Bahrom" value={firstName} onChange={e => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Familiya *</label>
                    <input required type="text" placeholder="Karimov" value={lastName} onChange={e => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Email</label>
                    <input type="email" placeholder="user@ses.uz" value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" />
                  </div>

                  {/* Passport */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Pasport Seriya</label>
                    <input type="text" placeholder="AA" maxLength={2} value={passportSeries}
                      onChange={e => setPassportSeries(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Pasport Raqam</label>
                    <input type="text" placeholder="1234567" maxLength={7} value={passportNumber}
                      onChange={e => setPassportNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">JSHSHIR (14 raqam) *</label>
                    <input required type="text" placeholder="30101901234567" maxLength={14} value={jshshir}
                      onChange={e => setJshshir(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" />
                  </div>

                  {/* Birth date & Father name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Tug'ilgan sana</label>
                    <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none text-slate-700" />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Otasining ismi (Patronim)</label>
                    <input type="text" placeholder="Masalan: Aliyevich" value={fatherName} onChange={e => setFatherName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" />
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

                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
                  <button type="submit" disabled={formLoading}
                    className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-sm disabled:opacity-50 transition">
                    {formLoading ? 'Yaratilmoqda...' : `${role === 'ADMIN' ? 'Admin' : "O'qituvchi"}ni yaratish`}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); resetForm() }}
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
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">
                    {section === 'students' ? "O'quvchilar" : section === 'teachers' ? "O'qituvchilar" : 'Adminlar'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{filteredUsers.length} ta foydalanuvchi topildi</p>
                </div>
                <SearchBar
                  value={userSearch}
                  onChange={v => { setUserSearch(v); setUserPage(1) }}
                  placeholder="Ism, username, JSHSHIR bo'yicha..."
                />
              </div>

              {/* Table */}
              {loadingUsers ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 font-semibold">Yuklanmoqda...</div>
              ) : pagedUsers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Icon d={ICONS.search} size={36} className="opacity-30" />
                  <p className="text-sm font-semibold">Foydalanuvchi topilmadi</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[640px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        <th className="py-3 px-4 rounded-tl-xl">Foydalanuvchi</th>
                        <th className="py-3 px-4">Pasport</th>
                        <th className="py-3 px-4">JSHSHIR</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4 text-center rounded-tr-xl">Harakatlar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {pagedUsers.map(u => (
                        <tr key={u.id} className="hover:bg-violet-50/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={u.profile_picture} name={`${u.first_name} ${u.last_name}`} role={u.role} />
                              <div>
                                <p className="font-semibold text-slate-900">{u.first_name} {u.last_name}</p>
                                <div className="flex items-center">
                                  <code className="text-[11px] text-slate-400 font-mono">@{u.username}</code>
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      navigator.clipboard.writeText(u.username); 
                                    }}
                                    className="ml-1.5 p-0.5 bg-slate-100 hover:bg-slate-200 active:bg-violet-100 text-slate-500 hover:text-slate-700 rounded transition duration-150"
                                    title="Username ko'chirish"
                                  >
                                    <Icon d={ICONS.copy} size={9} />
                                  </button>
                                </div>
                                {u.father_name && (
                                  <p className="text-[10px] text-slate-400 mt-0.5">Otasi: {u.father_name}</p>
                                )}
                                {section === 'students' && u.courses && u.courses.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5 max-w-[250px]">
                                    {u.courses.map(c => (
                                      <span key={c.id} className="bg-violet-50 text-violet-700 text-[9px] px-2 py-0.5 rounded-full border border-violet-100 font-bold leading-none shrink-0" title={c.title}>
                                        {c.title}
                                      </span>
                                    ))}
                                  </div>
                                )}
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
                          <td className="py-3 px-4 font-mono text-xs text-slate-600">{u.jshshir || '—'}</td>
                          <td className="py-3 px-4 text-slate-600 text-xs">{u.email || '—'}</td>
                          <td className="py-3 px-4 text-center">
                            <button onClick={() => handleResetPassword(u.id, u.username)}
                              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition">
                              <Icon d={ICONS.reset} size={11} />
                              Parolni tiklash
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <Pagination page={userPage} total={filteredUsers.length} pageSize={PAGE_SIZE} onPage={setUserPage} />
            </div>
          )}

          {/* ── Teacher Stats Section ── */}
          {section === 'stats' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden p-5">
              <div className="flex items-center justify-between mb-5 shrink-0">
                <h2 className="font-bold text-slate-900 text-lg">O'qituvchilar Statistikasi</h2>
                <button onClick={fetchTeacherStats}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 px-3 py-1.5 rounded-lg font-semibold transition">
                  <Icon d={ICONS.reset} size={13} /> Yangilash
                </button>
              </div>

              {loadingStats ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 font-semibold">Yuklanmoqda...</div>
              ) : teacherStats.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">O'qituvchilar topilmadi.</div>
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
                            [teacher.courses_count, 'ta kurs', 'violet'],
                            [teacher.students_count, "ta o'quvchi", 'blue'],
                            [teacher.total_enrollments, 'ta dars-talaba', 'indigo'],
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
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Kurslar</p>
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
                  <h2 className="font-bold text-slate-900 text-lg">Barcha Sertifikatlar</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Jami: {certs.length} ta sertifikat</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Teacher Filter */}
                  <div className="relative min-w-[170px]">
                    <select
                      value={selectedTeacherId}
                      onChange={e => handleTeacherChange(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition appearance-none cursor-pointer"
                    >
                      <option value="">Barcha o'qituvchilar</option>
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
                      <option value="">Barcha darslar</option>
                      {uniqueCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Icon d="M6 9l6 6 6-6" size={12} />
                    </div>
                  </div>

                  {/* Reset Filters button */}
                  {(selectedTeacherId || selectedCourseId) && (
                    <button
                      onClick={() => { setSelectedTeacherId(''); setSelectedCourseId(''); setCertPage(1) }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-red-150 transition"
                      title="Filtrlarni tozalash"
                    >
                      <Icon d={ICONS.reset} size={14} />
                    </button>
                  )}

                  <SearchBar
                    value={certSearch}
                    onChange={v => { setCertSearch(v); setCertPage(1) }}
                    placeholder="Ism, kurs, ID bo'yicha..."
                  />
                </div>
              </div>

              {loadingCerts ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 font-semibold">Yuklanmoqda...</div>
              ) : pagedGroupedCerts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Icon d={ICONS.cert} size={40} className="opacity-20" />
                  <p className="text-sm font-semibold">Sertifikatlar topilmadi</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        <th className="py-3 px-4 rounded-tl-xl w-[280px]">O'quvchi</th>
                        <th className="py-3 px-4 rounded-tr-xl">Sertifikatlar ({groupedCerts.reduce((acc, g) => acc + g.certificates.length, 0)} ta topildi)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {pagedGroupedCerts.map(group => (
                        <tr key={group.student_username} className="hover:bg-slate-50/20 transition-colors align-top">
                          {/* Student Column */}
                          <td className="py-4 px-4 border-r border-slate-100">
                            <div className="flex items-start gap-3">
                              <Avatar src={group.student_picture} name={group.student_name} role="STUDENT" size="lg" />
                              <div className="space-y-1">
                                <p className="font-bold text-slate-900 leading-snug">{group.student_name}</p>
                                <div className="flex items-center">
                                  <code className="text-[11px] text-slate-400 font-mono">@{group.student_username}</code>
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      navigator.clipboard.writeText(group.student_username); 
                                    }}
                                    className="ml-1.5 p-0.5 bg-slate-100 hover:bg-slate-200 active:bg-violet-100 text-slate-500 hover:text-slate-700 rounded transition duration-150"
                                    title="Username ko'chirish"
                                  >
                                    <Icon d={ICONS.copy} size={9} />
                                  </button>
                                </div>
                                <div className="pt-1">
                                  <span className="inline-block px-2.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-150 rounded-full text-[10px] font-bold">
                                    {group.certificates.length} ta sertifikat
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Certificates Column */}
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-3">
                              {group.certificates.map(cert => (
                                <div key={cert.certificate_id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-violet-200 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  
                                  {/* Info */}
                                  <div className="space-y-2 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-[10px] font-bold font-mono bg-violet-50 text-violet-700 border border-violet-150 px-2.5 py-0.5 rounded-lg">
                                        ID: {cert.certificate_id}
                                      </span>
                                      {cert.is_active ? (
                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-250 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                          <Icon d={ICONS.check} size={10} /> Faol
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 border border-slate-250 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                          <Icon d={ICONS.clock} size={10} /> Yakunlangan
                                        </span>
                                      )}
                                    </div>

                                    <div>
                                      <p className="font-bold text-slate-800 text-sm leading-snug">{cert.course_name}</p>
                                      <p className="text-[11.5px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                                        <Icon d={ICONS.teacher} size={12} className="text-slate-400" />
                                        O'qituvchi: <span className="text-slate-700 font-bold">{cert.teacher_name}</span>
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                                        <Icon d={ICONS.calendar} size={11} className="text-slate-400" />
                                        <span>Berilgan: <strong className="text-slate-700">{cert.issued_at || '—'}</strong></span>
                                      </div>
                                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                                        <Icon d={ICONS.calendar} size={11} className="text-slate-400" />
                                        <span>Amal qilish: <strong className="text-slate-700">{cert.expires_at || '—'}</strong></span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex flex-wrap md:flex-col lg:flex-row items-stretch md:items-end lg:items-center gap-1.5 shrink-0">
                                    <button 
                                      onClick={() => setPreviewCert(cert)}
                                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-violet-50 text-slate-700 hover:text-violet-700 border border-slate-200 hover:border-violet-300 px-3.5 py-2 rounded-xl text-xs font-bold transition"
                                    >
                                      <Icon d={ICONS.eye} size={13} />
                                      Ko'rish
                                    </button>

                                    {cert.pdf_file ? (
                                      <a 
                                        href={getMediaUrl(cert.pdf_file)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-250 hover:border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold transition"
                                      >
                                        <Icon d={ICONS.download} size={13} />
                                        Yuklab olish
                                      </a>
                                    ) : (
                                      <span className="text-[10px] text-slate-450 font-semibold px-3 py-2 border border-slate-100 rounded-xl bg-slate-50 select-none text-center">
                                        PDF mavjud emas
                                      </span>
                                    )}

                                    <a 
                                      href={`/verify/${cert.certificate_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border border-blue-200 hover:border-blue-300 px-3.5 py-2 rounded-xl text-xs font-bold transition"
                                    >
                                      <Icon d={ICONS.check} size={13} />
                                      Tekshirish
                                    </a>
                                  </div>

                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <Pagination page={certPage} total={groupedCerts.length} pageSize={PAGE_SIZE} onPage={setCertPage} />
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
                    <p className="text-[7.5px] tracking-widest text-[#e8c97a] font-bold uppercase">
                      O'ZBEKISTON RESPUBLIKASI SOG'LIQNI SAQLASH VAZIRLIGI LITSENZIYASI ASOSIDA
                    </p>
                    <h4 className="text-[11px] font-extrabold text-[#c9a84c] tracking-wide uppercase">
                      "SAVDO AKADEMIYASI" O'QUV MARKAZI
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
                      <p className="font-bold text-white">Markaz rahbari</p>
                      <p className="text-slate-400 italic">"Savdo Akademiyasi"</p>
                    </div>
                  </div>

                  {/* Footer verification text */}
                  <p className="text-[7px] text-[#e8c97a] opacity-80 pt-1.5 font-mono">
                    Sertifikatning haqiqiyligini tekshirish uchun QR kodni skanerlang yoki: http://localhost:5173/verify/{previewCert.certificate_id}
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

      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
    </div>
  )
}
