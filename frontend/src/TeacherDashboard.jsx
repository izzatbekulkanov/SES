import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import UserProfile from './UserProfile'

const API = '/api'

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
  bell:     'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
  trash:    'M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2',
}

// ── Helper to resolve media URLs ──────────────────────────────────────────────
const getMediaUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${window.location.origin}${url}`
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ src, name, size = 'sm' }) {
  const sz = size === 'lg' ? 'w-14 h-14 text-xl' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  if (src) return <img src={getMediaUrl(src)} alt={name} className={`${sz} rounded-full object-cover border-2 border-violet-200 shrink-0`} />
  return (
    <div className={`${sz} rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold border border-violet-200 shrink-0`}>
      {initials}
    </div>
  )
}

// ── Confetti Fireworks ────────────────────────────────────────────────────────
function Confetti({ onDone }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const COLORS = ['#7c3aed','#2563eb','#059669','#f59e0b','#ef4444','#ec4899','#06b6d4','#10b981','#f97316','#8b5cf6']
    const particles = []

    // Create multiple burst origins
    const origins = [
      { x: canvas.width * 0.2, y: canvas.height * 0.4 },
      { x: canvas.width * 0.5, y: canvas.height * 0.35 },
      { x: canvas.width * 0.8, y: canvas.height * 0.4 },
      { x: canvas.width * 0.35, y: canvas.height * 0.55 },
      { x: canvas.width * 0.65, y: canvas.height * 0.5 },
    ]

    origins.forEach((origin, oi) => {
      const count = 80 + oi * 10
      for (let i = 0; i < count; i++) {
        const angle = (Math.random() * Math.PI * 2)
        const speed = 3 + Math.random() * 9
        particles.push({
          x: origin.x, y: origin.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (3 + Math.random() * 4),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 4 + Math.random() * 7,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 12,
          opacity: 1,
          shape: Math.random() > 0.4 ? 'rect' : 'circle',
          delay: oi * 80,
          born: 0,
        })
      }
    })

    let frame = 0
    let raf
    const tick = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      particles.forEach(p => {
        if (frame < p.delay / 16) return
        p.born++
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.25        // gravity
        p.vx *= 0.98        // drag
        p.rotation += p.rotSpeed
        p.opacity -= 0.012
        if (p.opacity <= 0) return
        alive = true
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      })
      if (alive) {
        raf = requestAnimationFrame(tick)
      } else {
        onDone && onDone()
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[99999] pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { section: urlSection } = useParams()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('access_token')

  const VALID = ['courses', 'students', 'certs', 'notifs']
  const section = VALID.includes(urlSection) ? urlSection : 'courses'
  const changeSection = (s) => navigate(`/teacher/${s}`)

  // ── Data ──────────────────────────────────────────────────────────────────
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [certs, setCerts] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingCerts, setLoadingCerts] = useState(false)

  // ── Toast & Confetti ─────────────────────────────────────────────────────
  const [toast, setToast] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)

  // ── Language ─────────────────────────────────────────────────────────────────
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'uz')

  // ── Cert search & date filters ──────────────────────────────────────────────
  const [certSearch, setCertSearch] = useState('')
  const [certStartDate, setCertStartDate] = useState('')
  const [certEndDate, setCertEndDate] = useState('')

  // ── Selection ─────────────────────────────────────────────────────────────
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  // lessonDoneMap: { studentId: true } — o'qituvchi "Dars yakunlandi" bosdi
  const [lessonDoneMap, setLessonDoneMap] = useState({})

  // ── Modals ────────────────────────────────────────────────────────────────
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [previewCert, setPreviewCert] = useState(null)
  const [addStudentType, setAddStudentType] = useState('new') // 'new' | 'existing'
  const [selectedExistingStudentId, setSelectedExistingStudentId] = useState('')
  const [existingSearch, setExistingSearch] = useState('')

  // ── Course form ───────────────────────────────────────────────────────────
  const [courseTitle, setCourseTitle] = useState('')
  const [courseDesc, setCourseDesc] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [totalLessons, setTotalLessons] = useState(10)
  const [courseErr, setCourseErr] = useState('')
  const [courseLoading, setCourseLoading] = useState(false)

  // ── Student form ──────────────────────────────────────────────────────────
  const [sfFirst, setSfFirst] = useState('')
  const [sfLast, setSfLast] = useState('')
  const [sfFather, setSfFather] = useState('')
  const [sfPhone, setSfPhone] = useState('')
  const [sfPS, setSfPS] = useState('')
  const [sfPN, setSfPN] = useState('')
  const [sfErr, setSfErr] = useState('')
  const [sfLoading, setSfLoading] = useState(false)

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchCourses()
    fetchStudents()
  }, [])

  useEffect(() => {
    if (section === 'certs' || section === 'notifs') fetchCerts()
  }, [section])

  const fetchCourses = async () => {
    setLoadingCourses(true)
    try {
      const r = await fetch(`${API}/teacher/courses/`, { headers: { Authorization: `Bearer ${token}` } })
      if (r.ok) {
        const data = await r.json()
        setCourses(data)
        if (data.length > 0 && !selectedCourse) {
          if (window.innerWidth >= 768) {
            setSelectedCourse(data[0])
          }
        }
      } else if (r.status === 401) navigate('/login')
    } catch { /* silent */ }
    finally { setLoadingCourses(false) }
  }

  const fetchStudents = async () => {
    setLoadingStudents(true)
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${API}/teacher/students/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/teacher/students/?all=true`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      if (r1.ok) setStudents(await r1.json())
      if (r2.ok) setAllStudents(await r2.json())
    } catch { /* silent */ }
    finally { setLoadingStudents(false) }
  }

  const fetchCerts = async () => {
    setLoadingCerts(true)
    try {
      const r = await fetch(`${API}/admin/certificates/`, { headers: { Authorization: `Bearer ${token}` } })
      if (r.ok) {
        const all = await r.json()
        setCerts(all)
      }
    } catch { /* silent */ }
    finally { setLoadingCerts(false) }
  }

  const handleLogout = () => { localStorage.clear(); navigate('/login') }

  // ── Create course ─────────────────────────────────────────────────────────
  const handleCreateCourse = async (e) => {
    e.preventDefault(); setCourseErr(''); setCourseLoading(true)
    try {
      const r = await fetch(`${API}/teacher/courses/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: courseTitle, description: courseDesc, start_date: startDate, end_date: endDate, total_lessons: parseInt(totalLessons) })
      })
      if (r.ok) {
        const nc = await r.json()
        setCourseTitle(''); setCourseDesc(''); setStartDate(''); setEndDate(''); setTotalLessons(10)
        setShowAddCourse(false); await fetchCourses(); setSelectedCourse(nc)
      } else {
        const d = await r.json(); setCourseErr(d.detail || 'Kurs yaratishda xatolik.')
      }
    } catch { setCourseErr('Serverga ulanishda xatolik.') }
    finally { setCourseLoading(false) }
  }

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    if (!input || input === '+' || input === '+9' || input === '+99' || input === '+998') {
      setSfPhone('');
      return;
    }
    const numbers = input.replace(/\D/g, '');
    let local = numbers;
    if (numbers.startsWith('998')) {
      local = numbers.slice(3);
    }
    local = local.slice(0, 9);
    let formatted = '+998';
    if (local.length > 0) formatted += ' ' + local.slice(0, 2);
    if (local.length > 2) formatted += ' ' + local.slice(2, 5);
    if (local.length > 5) formatted += ' ' + local.slice(5, 7);
    if (local.length > 7) formatted += ' ' + local.slice(7, 9);
    setSfPhone(formatted);
  };

  // ── Add student ───────────────────────────────────────────────────────────
  const resetStudentForm = () => {
    setSfFirst(''); setSfLast(''); setSfFather(''); setSfPhone('')
    setSfPS(''); setSfPN('')
    setExistingSearch(''); setSelectedExistingStudentId('')
  }

  const handleAddStudent = async (e) => {
    e.preventDefault(); setSfErr(''); setSfLoading(true)
    try {
      let r;
      if (addStudentType === 'existing') {
        if (!selectedExistingStudentId) {
          setSfErr("O'quvchini tanlang.");
          setSfLoading(false);
          return;
        }
        r = await fetch(`${API}/teacher/courses/${selectedCourse.id}/add-student/`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ student_id: selectedExistingStudentId })
        })
      } else {
        const fd = new FormData()
        fd.append('first_name', sfFirst)
        fd.append('last_name', sfLast)
        fd.append('father_name', sfFather)
        fd.append('phone_number', sfPhone)
        fd.append('passport_series', sfPS.toUpperCase())
        fd.append('passport_number', sfPN)

        r = await fetch(`${API}/teacher/courses/${selectedCourse.id}/add-student/`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd
        })
      }

      if (r.ok) {
        resetStudentForm(); 
        setShowAddStudent(false);
        setSelectedExistingStudentId('');
        await fetchCourses(); 
        await fetchStudents();
        const list = await (await fetch(`${API}/teacher/courses/`, { headers: { Authorization: `Bearer ${token}` } })).json()
        setCourses(list)
        const upd = list.find(c => c.id === selectedCourse.id)
        if (upd) setSelectedCourse(upd)
      } else {
        const d = await r.json(); setSfErr(d.detail || "Xatolik yuz berdi.")
      }
    } catch { setSfErr('Serverga ulanishda xatolik.') }
    finally { setSfLoading(false) }
  }

  // ── Excel import/export ──────────────────────────────────────────────────
  const [importingExcel, setImportingExcel] = useState(false)

  const handleDownloadTemplate = async () => {
    try {
      const r = await fetch(`${API}/teacher/courses/download-template/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (r.ok) {
        const blob = await r.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'ses_oquvchilar_shablon.xlsx'
        document.body.appendChild(a)
        a.click()
        a.remove()
      } else {
        setToast('⚠ Shablon yuklashda xatolik.')
        setTimeout(() => setToast(''), 4500)
      }
    } catch {
      setToast('⚠ Serverga ulanishda xatolik.')
      setTimeout(() => setToast(''), 4500)
    }
  }

  const handleImportExcel = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setImportingExcel(true)
    const fd = new FormData()
    fd.append('file', file)
    
    try {
      const r = await fetch(`${API}/teacher/courses/${selectedCourse.id}/import-excel/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      })
      const data = await r.json()
      if (r.ok) {
        setToast(`✓ ${data.detail || 'O\'quvchilar muvaffaqiyatli import qilindi.'}`)
        setTimeout(() => setToast(''), 4500)
        await fetchCourses()
        await fetchStudents()
        const list = await (await fetch(`${API}/teacher/courses/`, { headers: { Authorization: `Bearer ${token}` } })).json()
        setCourses(list)
        const upd = list.find(c => c.id === selectedCourse.id)
        if (upd) setSelectedCourse(upd)
      } else {
        setToast(`⚠ ${data.detail || 'Faylni yuklashda xatolik.'}`)
        setTimeout(() => setToast(''), 5500)
      }
    } catch {
      setToast('⚠ Serverga ulanishda xatolik.')
      setTimeout(() => setToast(''), 4500)
    } finally {
      setImportingExcel(false)
      e.target.value = ''
    }
  }

  // ── Generate certificate ──────────────────────────────────────────────────
  const [certLoading, setCertLoading] = useState(false)

  const handleGenerateCert = async (studentId) => {
    setCertLoading(true)
    try {
      const r = await fetch(`${API}/teacher/students/${studentId}/generate-certificate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ course_id: selectedCourse.id })
      })
      if (r.ok) {
        const list = await (await fetch(`${API}/teacher/students/`, { headers: { Authorization: `Bearer ${token}` } })).json()
        setStudents(list)
        const matched = list.find(s => s.id === studentId)
        // Do NOT setSelectedStudent — stay on the course table view
        await fetchCourses()
        if (section === 'certs' || section === 'notifs') fetchCerts()
        // Show bottom-right toast
        const studentName = matched ? `${matched.first_name} ${matched.last_name}` : 'O\'quvchi'
        setToast(`✓ ${studentName} uchun sertifikat yaratildi.`)
        setTimeout(() => setToast(''), 4500)
        setShowConfetti(true)
      } else {
        const d = await r.json()
        setToast(`⚠ ${d.detail || 'Sertifikat yaratishda xatolik.'}`)
        setTimeout(() => setToast(''), 4500)
      }
    } catch {
      setToast('⚠ Serverga ulanishda xatolik.')
      setTimeout(() => setToast(''), 4500)
    } finally {
      setCertLoading(false)
    }
  }

  const handleDeleteStudent = async (studentId, studentName) => {
    const confirmMsg = lang === 'ru' 
      ? `Вы действительно хотите удалить студента ${studentName}? Все связанные сертификаты также будут удалены!`
      : `Haqiqatan ham o'quvchi ${studentName}ni o'chirmoqchimisiz? Unga tegishli barcha sertifikatlar ham o'chib ketadi!`
    
    if (!window.confirm(confirmMsg)) return

    try {
      const r = await fetch(`${API}/teacher/students/${studentId}/delete/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (r.ok) {
        setToast(lang === 'ru' ? 'Студент успешно удален.' : "O'quvchi muvaffaqiyatli o'chirildi.")
        setTimeout(() => setToast(''), 4500)
        await fetchCourses()
        await fetchStudents()
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

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getCourseStudents = (course) => {
    if (!course) return []
    return students.filter(s => s.courses && s.courses.some(c => c.id === course.id))
  }

  const enrolledStudents = getCourseStudents(selectedCourse)

  const selectedStudentCert = selectedStudent?.certificates?.find(c => c.course_id === selectedCourse?.id)
  const selectedStudentHasCert = !!selectedStudentCert
  const selectedStudentCertId = selectedStudentCert?.certificate_id
  const selectedStudentCertPdf = selectedStudentCert?.pdf_file

  // Expired certs count for notification badge
  const expiredCertsCount = certs.filter(c => {
    if (c.raw_expires_at) return new Date(c.raw_expires_at) < new Date()
    return !c.is_active
  }).length

  // Filter certs based on search query
  const filteredCerts = certs.filter(cert => {
    if (certStartDate || certEndDate) {
      const parseDateDMY = (dmyStr) => {
        if (!dmyStr) return null;
        const parts = dmyStr.split('.');
        if (parts.length !== 3) return null;
        return new Date(parts[2], parts[1] - 1, parts[0]);
      };
      const certDate = parseDateDMY(cert.issued_at);
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

    if (!certSearch.trim()) return true

    const query = certSearch.toLowerCase().trim()

    // 1. Check student name, username, course name, certificate ID directly from cert
    const name = (cert.student_name || '').toLowerCase()
    const username = (cert.student_username || '').toLowerCase()
    const course = (cert.course_name || '').toLowerCase()
    const certId = (cert.certificate_id || '').toLowerCase()

    if (
      name.includes(query) ||
      username.includes(query) ||
      course.includes(query) ||
      certId.includes(query)
    ) {
      return true
    }

    // 2. Find matching student in students or allStudents to check passport_series, passport_number, father_name
    const student =
      students.find(s => s.username === cert.student_username) ||
      allStudents.find(s => s.username === cert.student_username)

    if (student) {
      const fatherName = (student.father_name || '').toLowerCase()
      const passportSeries = (student.passport_series || '').toLowerCase()
      const passportNumber = (student.passport_number || '').toLowerCase()
      const passportFull = `${passportSeries}${passportNumber}`.replace(/\s+/g, '').toLowerCase()
      const queryClean = query.replace(/\s+/g, '')

      if (
        fatherName.includes(query) ||
        passportSeries.includes(query) ||
        passportNumber.includes(query) ||
        passportFull.includes(queryClean)
      ) {
        return true
      }
    }

    return false
  })


  const navItems = [
    { id: 'courses',  label: lang === 'ru' ? 'Курсы' : 'Dars kurslari',     icon: IC.courses,  color: 'violet',  count: courses.length },
    { id: 'students', label: lang === 'ru' ? 'Студенты' : "O'quvchilar",    icon: IC.students, color: 'blue',    count: students.length },
    { id: 'certs',    label: lang === 'ru' ? 'Сертификаты' : 'Sertifikatlar', icon: IC.cert,    color: 'emerald', count: certs.length || null },
    { id: 'notifs',   label: lang === 'ru' ? 'Уведомления' : 'Bildirishnomalar', icon: IC.bell, color: 'orange', count: expiredCertsCount || null },
  ]

  const colorConfig = {
    violet:  { active: 'bg-violet-600 text-white shadow-md',  pill: 'bg-violet-100 text-violet-700' },
    blue:    { active: 'bg-blue-600 text-white shadow-md',    pill: 'bg-blue-100 text-blue-700' },
    emerald: { active: 'bg-emerald-600 text-white shadow-md', pill: 'bg-emerald-100 text-emerald-700' },
    orange:  { active: 'bg-orange-500 text-white shadow-md',  pill: 'bg-orange-100 text-orange-600' },
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f2f8] flex flex-col">

      {/* ── Topbar ── */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SES Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-slate-800 text-sm">SES PORTAL</span>
          <span className="hidden sm:inline text-[11px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">
            O'qituvchi
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 mr-1">
            <button onClick={() => { setLang('uz'); localStorage.setItem('lang', 'uz') }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${lang === 'uz' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              UZ
            </button>
            <button onClick={() => { setLang('ru'); localStorage.setItem('lang', 'ru') }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${lang === 'ru' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              RU
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800 leading-none">{user.first_name} {user.last_name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{user.email || user.username}</p>
            </div>
            <Avatar src={user.profile_picture} name={`${user.first_name} ${user.last_name}`} />
          </div>
          <button onClick={() => setShowProfile(true)}
            title={lang === 'ru' ? 'Профиль' : 'Profil'}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-violet-600 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 px-3 py-1.5 rounded-lg font-semibold transition">
            <Icon d={IC.profile} size={13} /> <span className="hidden sm:inline">{lang === 'ru' ? 'Профиль' : 'Profil'}</span>
          </button>
          <button onClick={handleLogout}
            title={lang === 'ru' ? 'Выйти' : 'Chiqish'}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg font-semibold transition">
            <Icon d={IC.logout} size={13} /> <span className="hidden sm:inline">{lang === 'ru' ? 'Выйти' : 'Chiqish'}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden pb-16 md:pb-0">

        {/* ── Sidebar ── */}
        <aside className="hidden md:flex w-56 shrink-0 bg-white border-r border-slate-200 flex-col py-4 px-3 gap-1 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
            {lang === 'ru' ? 'Панель учителя' : "O'qituvchi paneli"}
          </p>

          {navItems.map(item => {
            const isActive = section === item.id
            const cc = colorConfig[item.color]
            return (
              <button key={item.id}
                onClick={() => { changeSection(item.id); setSelectedStudent(null) }}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                  isActive ? cc.active : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon d={item.icon} size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/25 text-white' : cc.pill
                  }`}>{item.count}</span>
                )}
              </button>
            )
          })}
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-3 md:p-5 gap-3 md:gap-5">

          {/* ══ COURSES SECTION ══ */}
          {section === 'courses' && (
            <>
              {/* Course list panel */}
              <div className={`w-full md:w-72 shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden ${
                selectedCourse ? 'hidden md:flex' : 'flex'
              }`}>
                <div className="p-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900 text-sm">Dars kurslari</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">{courses.length} ta kurs</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {loadingCourses ? (
                    <div className="flex items-center justify-center h-32 text-slate-400 text-sm">Yuklanmoqda...</div>
                  ) : courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-xs text-center gap-2">
                      <Icon d={IC.courses} size={28} className="opacity-30" />
                      Hali kurslar yo'q.<br />Dars yaratish tugmasini bosing.
                    </div>
                  ) : courses.map(course => {
                    const isActive = selectedCourse?.id === course.id
                    return (
                      <div key={course.id} onClick={() => { setSelectedCourse(course); setSelectedStudent(null) }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isActive ? 'bg-violet-50 border-violet-300 shadow-sm' : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                        }`}>
                        <p className="font-semibold text-slate-900 text-sm leading-snug mb-1">{course.title}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{course.start_date} – {course.end_date}</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-slate-600">{course.student_count} ta</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {/* Dars yaratish tugmasi */}
                <div className="p-3 border-t border-slate-100 shrink-0">
                  <button onClick={() => setShowAddCourse(true)}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition">
                    <Icon d={IC.plus} size={14} /> Dars yaratish
                  </button>
                </div>
              </div>

              {/* Course detail / student panel */}
              <div className={`flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden ${
                !selectedCourse ? 'hidden md:flex' : 'flex'
              }`}>
                {selectedStudent && selectedCourse ? (
                  /* ── Student detail: two-step flow ── */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-100 shrink-0">
                      <button onClick={() => setSelectedStudent(null)}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-4 font-semibold transition">
                        <Icon d={IC.back} size={13} /> Kursga qaytish
                      </button>
                      <div className="flex items-center gap-4">
                        <Avatar src={selectedStudent.profile_picture} name={`${selectedStudent.first_name} ${selectedStudent.last_name}`} size="lg" />
                        <div>
                          <h1 className="text-xl font-bold text-slate-900">{selectedStudent.first_name} {selectedStudent.last_name}</h1>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <code>@{selectedStudent.username}</code>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  navigator.clipboard.writeText(selectedStudent.username); 
                                }}
                                className="p-0.5 bg-slate-100 hover:bg-slate-200 active:bg-violet-100 text-slate-500 hover:text-slate-700 rounded transition duration-150"
                                title="Username ko'chirish"
                              >
                                <Icon d={IC.copy} size={9} />
                              </button>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Icon d={IC.passport} size={13} className="text-slate-400" />
                              Pass: <b className="font-mono text-slate-700">{selectedStudent.passport_series} {selectedStudent.passport_number}</b>
                            </span>
                            {selectedStudent.jshshir && (
                              <span className="flex items-center gap-1">
                                <span className="font-bold text-slate-400 font-mono text-[10px]">JSHSHIR:</span>
                                <b className="font-mono text-slate-700">{selectedStudent.jshshir}</b>
                              </span>
                            )}
                            {selectedStudent.phone_number && (
                              <span className="flex items-center gap-1.5">
                                <Icon d={IC.phone} size={13} className="text-slate-400" />
                                <span className="text-slate-700">{selectedStudent.phone_number}</span>
                              </span>
                            )}
                            {selectedStudent.organization && (
                              <span className="flex items-center gap-1.5">
                                <Icon d={IC.building} size={13} className="text-slate-400" />
                                <span className="text-slate-700">{selectedStudent.organization}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Center: three states */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                      {selectedStudentHasCert ? (
                        /* State 3: Already has cert */
                        <div className="flex flex-col items-center gap-4 text-center w-full max-w-xl overflow-y-auto">
                          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                            <Icon d={IC.award} size={28} className="text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-slate-800">Sertifikat berilgan</p>
                            <p className="text-xs text-slate-400 mt-0.5">{selectedCourse.title}</p>
                          </div>
                          <div className="flex gap-3 shrink-0">
                            <button onClick={() => setPreviewCert({ ...selectedStudentCert, student_name: `${selectedStudent.first_name} ${selectedStudent.last_name}${selectedStudent.father_name ? ' ' + selectedStudent.father_name : ''}` })}
                              className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl font-bold transition">
                              <Icon d={IC.eye} size={12} /> Ko'rish
                            </button>
                            <a href={getMediaUrl(selectedStudentCertPdf)}
                              target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm">
                              <Icon d={IC.cert} size={12} /> Yuklab olish (PDF)
                            </a>
                            <button onClick={() => navigate(`/verify/${selectedStudentCertId}`)}
                              className="flex items-center gap-1.5 text-xs text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl font-semibold transition">
                              <Icon d={IC.eye} size={12} /> Tekshirish
                            </button>
                          </div>
                          {/* Beautiful HTML Certificate Preview Mockup (Inline) */}
                          <div className="w-full max-w-lg bg-[#0a1628] text-white p-5 rounded-xl border-4 border-[#c9a84c] shadow-sm relative overflow-hidden font-sans select-none mt-2">
                            {/* Inner gold border */}
                            <div className="absolute inset-1.5 border border-[#e8c97a] pointer-events-none"></div>

                            {/* Main Content Layout */}
                            <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                              {/* Emblem/Logo */}
                              <div className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center p-1 border border-[#c9a84c]/30">
                                <img src="/logo.png" alt="SES" className="w-full h-full object-contain" />
                              </div>

                              {/* Headers */}
                              <div className="space-y-0.5">
                                <h4 className="text-[7.5px] font-extrabold text-[#c9a84c] tracking-wider uppercase leading-tight">
                                  SANITARIYA-EPIDEMIOLOGIK OSOYISHTALIK<br />
                                  VA JAMOAT SALOMATLIGI QO'MITASINING<br />
                                  TOSHKENT SHAHAR BOSHQARMASI
                                </h4>
                              </div>

                              {/* Divider line */}
                              <div className="w-4/5 h-[1px] bg-[#c9a84c] opacity-55"></div>

                              {/* Certificate title */}
                              <div className="space-y-0.5">
                                <h2 className="text-xl font-black tracking-widest text-[#c9a84c] font-serif">SERTIFIKAT</h2>
                              </div>

                              {/* Student Name */}
                              <h1 className="text-lg font-black text-white uppercase tracking-wide border-b border-[#e8c97a]/30 pb-0.5 px-4">
                                {selectedStudent.first_name} {selectedStudent.last_name}{selectedStudent.father_name ? ` ${selectedStudent.father_name}` : ''}
                              </h1>

                              {/* Course Info */}
                              <p className="text-[9px] text-[#e8c97a] leading-relaxed max-w-sm italic px-2">
                                "{selectedCourse.title}" sanitariya-gigiyena minimumi o'quv dasturini muvaffaqiyatli yakunlaganligi tasdiqlanadi.
                              </p>

                              {/* Divider */}
                              <div className="w-4/5 h-[1px] bg-[#c9a84c] opacity-35"></div>

                              {/* Bottom section */}
                              <div className="grid grid-cols-3 gap-2 w-full text-left pt-1 px-2 items-center">
                                {/* Metadata */}
                                <div className="text-[7.5px] text-slate-300 space-y-0.5 bg-slate-900/30 p-2 rounded-lg border border-slate-800/40">
                                  <p><b>ID:</b> <span className="font-mono text-emerald-400 font-bold">{selectedStudentCertId}</span></p>
                                  <p><b>Berilgan:</b> {selectedStudentCert?.issued_at}</p>
                                  <p><b>Amal qilish:</b> {selectedStudentCert?.expires_at}</p>
                                </div>

                                {/* QR Code */}
                                <div className="flex justify-center">
                                  {selectedStudentCert?.qr_code_image ? (
                                    <img 
                                      src={getMediaUrl(selectedStudentCert.qr_code_image)} 
                                      alt="QR Code" 
                                      className="w-12 h-12 bg-white p-0.5 rounded border border-emerald-100 shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center text-[7px] text-slate-500">QR</div>
                                  )}
                                </div>

                                {/* Leader signature */}
                                <div className="text-center space-y-0.5 text-[7px] text-slate-300">
                                  <div className="h-3"></div>
                                  <p className="border-t border-slate-500 w-16 mx-auto pt-0.5"></p>
                                  <p className="font-bold text-white text-[6px]">Malika Kudratxodjayeva</p>
                                  <p className="text-slate-400 italic text-[5px] max-w-[80px] mx-auto leading-tight">
                                    Toshkent shahar Sanitariya-epidemiologik osoyishtalik va jamoat salomatligi boshqarmasi boshlig'i
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : lessonDoneMap[`${selectedCourse.id}_${selectedStudent.id}`] ? (
                        /* State 2: Lesson marked done — show Sertifikat yaratish */
                        <div className="flex flex-col items-center gap-5 text-center">
                          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
                            <Icon d={IC.check} size={40} className="text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-slate-800">Dars yakunlandi!</p>
                            <p className="text-xs text-slate-400 mt-1">{selectedCourse.title}</p>
                          </div>
                          <button onClick={() => handleGenerateCert(selectedStudent.id)}
                            disabled={certLoading}
                            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-wait text-white text-sm px-8 py-3 rounded-2xl font-bold shadow-md transition">
                            <Icon d={IC.award} size={16} />
                            {certLoading ? 'Yaratilmoqda...' : 'Sertifikat yaratish'}
                          </button>
                        </div>
                      ) : (
                        /* State 1: Not done — show Dars yakunlandi */
                        <div className="flex flex-col items-center gap-5 text-center">
                          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center shadow-inner">
                            <Icon d={IC.courses} size={40} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-slate-700">Dars hali yakunlanmagan</p>
                            <p className="text-xs text-slate-400 mt-1">Dars tugagandan so'ng quyidagi tugmani bosing</p>
                          </div>
                          <button
                            onClick={() => setLessonDoneMap(m => ({ ...m, [`${selectedCourse.id}_${selectedStudent.id}`]: true }))}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-8 py-3 rounded-2xl font-bold shadow-md transition">
                            <Icon d={IC.check} size={16} /> Dars yakunlandi
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                ) : selectedCourse ? (
                  /* Course detail — enrolled students table */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-3 md:p-5 border-b border-slate-100 shrink-0">
                      <button onClick={() => setSelectedCourse(null)}
                        className="md:hidden flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-3.5 font-semibold transition">
                        <Icon d={IC.back} size={13} /> {lang === 'ru' ? 'Назад к списку' : 'Kurslar ro\'yxatiga qaytish'}
                      </button>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <h1 className="text-xl font-bold text-slate-900">{selectedCourse.title}</h1>
                          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Icon d={IC.calendar} size={13} className="text-slate-400 shrink-0" />
                              {selectedCourse.start_date} – {selectedCourse.end_date}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Icon d={IC.courses} size={13} className="text-slate-400 shrink-0" />
                              {selectedCourse.total_lessons} ta dars
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Icon d={IC.students} size={13} className="text-slate-400 shrink-0" />
                              {selectedCourse.student_count} ta o'quvchi
                            </span>
                          </div>
                          {selectedCourse.description && (
                            <p className="text-xs text-slate-500 mt-1.5">{selectedCourse.description}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {/* Excel template download button */}
                          <button 
                            onClick={handleDownloadTemplate}
                            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-2 rounded-xl font-semibold border border-slate-200 transition"
                            title="Excel shablonini yuklab olish"
                          >
                            <Icon d={IC.download} size={13} className="text-slate-500" />
                            Excel shablon
                          </button>

                          {/* Excel import button */}
                          <label 
                            className={`flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs px-3.5 py-2 rounded-xl font-semibold border border-emerald-200 cursor-pointer transition ${importingExcel ? 'opacity-50 pointer-events-none' : ''}`}
                            title="Excel fayldan o'quvchilarni import qilish"
                          >
                            <Icon d={IC.upload} size={13} className="text-emerald-600" />
                            {importingExcel ? 'Yuklanmoqda...' : 'Excelda yuklash'}
                            <input 
                              type="file" 
                              accept=".xlsx" 
                              onChange={handleImportExcel} 
                              className="hidden" 
                              disabled={importingExcel}
                            />
                          </label>

                          <button onClick={() => setShowAddStudent(true)}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-xl font-semibold shadow-sm transition">
                            <Icon d={IC.plus} size={13} /> O'quvchi qo'shish
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5">
                      <h3 className="text-sm font-bold text-slate-800 mb-3">Kursga yozilgan o'quvchilar</h3>
                      {enrolledStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs text-center gap-2">
                          <Icon d={IC.students} size={32} className="opacity-20" />
                          O'quvchilar yo'q. "O'quvchi qo'shish" tugmasini bosing.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                <th className="py-3 px-4 rounded-tl-xl">O'quvchi</th>
                                <th className="py-3 px-4">Pasport</th>
                                <th className="py-3 px-4 text-center">Darslar</th>
                                <th className="py-3 px-4">Holati</th>
                                <th className="py-3 px-4 text-center rounded-tr-xl">Amallar</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                              {enrolledStudents.map(s => {
                                const hasCert = s.certificates && s.certificates.some(c => c.course_id === selectedCourse.id)
                                const lessonDone = !!lessonDoneMap[`${selectedCourse.id}_${s.id}`]
                                const cert = s.certificates?.find(c => c.course_id === selectedCourse.id)
                                return (
                                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                                    {/* O'quvchi */}
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-3">
                                        <Avatar src={s.profile_picture} name={`${s.first_name} ${s.last_name}`} />
                                        <div className="min-w-0">
                                          <p className="font-semibold text-slate-900 text-sm truncate">{s.first_name} {s.last_name}</p>
                                          <div className="flex items-center gap-1">
                                            <code className="text-[10px] text-slate-400">@{s.username}</code>
                                            <button
                                              onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(s.username) }}
                                              className="p-0.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded transition"
                                              title="Username ko'chirish"
                                            >
                                              <Icon d={IC.copy} size={9} />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    {/* Pasport */}
                                    <td className="py-3 px-4">
                                      <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-bold">
                                        {s.passport_series} {s.passport_number}
                                      </span>
                                    </td>
                                    {/* Darslar */}
                                    <td className="py-3 px-4 text-center">
                                      {hasCert || lessonDone ? (
                                        <span className={`text-xs font-bold ${hasCert ? 'text-emerald-600' : 'text-blue-600'}`}>
                                          {selectedCourse.total_lessons} / {selectedCourse.total_lessons}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-slate-400">0 / {selectedCourse.total_lessons}</span>
                                      )}
                                    </td>
                                    {/* Holati */}
                                    <td className="py-3 px-4">
                                      {hasCert ? (
                                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                                          <Icon d={IC.award} size={11} /> Sertifikat berilgan
                                        </span>
                                      ) : lessonDone ? (
                                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                                          <Icon d={IC.check} size={11} /> Dars yakunlandi
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                                          <Icon d={IC.courses} size={11} /> Davom etmoqda
                                        </span>
                                      )}
                                    </td>
                                    {/* Amallar */}
                                    <td className="py-3 px-4 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        {hasCert ? (
                                          <button
                                            onClick={() => setPreviewCert({ ...cert, student_name: `${s.first_name} ${s.last_name}${s.father_name ? ' ' + s.father_name : ''}` })}
                                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                                          >
                                            <Icon d={IC.eye} size={12} /> Ko'rish
                                          </button>
                                        ) : lessonDone ? (
                                          <button
                                            onClick={() => handleGenerateCert(s.id)}
                                            disabled={certLoading}
                                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-wait px-3 py-1.5 rounded-lg transition shadow-sm whitespace-nowrap"
                                          >
                                            <Icon d={IC.award} size={12} />
                                            {certLoading ? 'Yaratilmoqda...' : 'Sertifikat berish'}
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => setLessonDoneMap(m => ({ ...m, [`${selectedCourse.id}_${s.id}`]: true }))}
                                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition shadow-sm whitespace-nowrap"
                                          >
                                            <Icon d={IC.check} size={12} /> Dars yakunlash
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleDeleteStudent(s.id, `${s.first_name} ${s.last_name}`)}
                                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 border border-red-100 transition shadow-xs shrink-0"
                                          title={lang === 'ru' ? 'Удалить студента' : "O'quvchini o'chirish"}
                                        >
                                          <Icon d={IC.trash} size={12} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                    Chap tomondan kurs tanlang
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══ STUDENTS SECTION ══ */}
          {section === 'students' && (
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden p-5">
              <div className="flex items-center justify-between mb-5 shrink-0">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Barcha o'quvchilarim</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{students.length} ta o'quvchi</p>
                </div>
              </div>

              {loadingStudents ? (
                <div className="flex-1 flex items-center justify-center text-slate-400">Yuklanmoqda...</div>
              ) : students.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Icon d={IC.students} size={40} className="opacity-20" />
                  <p className="text-sm">O'quvchilar yo'q</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {students.map(s => (
                      <div key={s.id} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-blue-200 hover:bg-blue-50/20 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar src={s.profile_picture} name={`${s.first_name} ${s.last_name}`} size="md" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 leading-tight truncate">{s.first_name} {s.last_name}</p>
                            <div className="flex items-center">
                              <code className="text-[10px] text-slate-400">@{s.username}</code>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  navigator.clipboard.writeText(s.username); 
                                }}
                                className="ml-1.5 p-0.5 bg-slate-100 hover:bg-slate-200 active:bg-violet-100 text-slate-500 hover:text-slate-700 rounded transition duration-150"
                                title="Username ko'chirish"
                              >
                                <Icon d={IC.copy} size={9} />
                              </button>
                            </div>
                          </div>
                          <div className="ml-auto flex items-center gap-2 shrink-0">
                            {s.has_certificate && (
                              <span className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-bold border border-emerald-200">✓ Cert</span>
                            )}
                            <button
                              onClick={() => handleDeleteStudent(s.id, `${s.first_name} ${s.last_name}`)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 border border-red-100 transition shadow-xs"
                              title={lang === 'ru' ? 'Удалить студента' : "O'quvchini o'chirish"}
                            >
                              <Icon d={IC.trash} size={11} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 mt-4 pt-3 border-t border-slate-100/80 text-xs text-slate-600">
                          {s.passport_series && (
                            <div className="flex items-center gap-2">
                              <Icon d={IC.passport} size={13} className="text-slate-400 shrink-0" />
                              <span className="font-mono bg-slate-100/80 px-2 py-0.5 rounded text-slate-700 text-[10px] font-bold">
                                {s.passport_series} {s.passport_number}
                              </span>
                            </div>
                          )}
                          {s.jshshir && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 font-mono shrink-0 w-14">JSHSHIR:</span>
                              <span className="font-mono text-[10px] text-slate-500 tracking-wider font-semibold">{s.jshshir}</span>
                            </div>
                          )}
                          {s.phone_number && (
                            <div className="flex items-center gap-2">
                              <Icon d={IC.phone} size={13} className="text-slate-400 shrink-0" />
                              <span className="font-medium text-slate-600">{s.phone_number}</span>
                            </div>
                          )}
                          {s.email && (
                            <div className="flex items-center gap-2">
                              <Icon d={IC.mail} size={13} className="text-slate-400 shrink-0" />
                              <span className="text-slate-600 truncate" title={s.email}>{s.email}</span>
                            </div>
                          )}
                          {s.courses && s.courses.length > 0 && (
                            <div className="pt-2 border-t border-slate-100/50">
                              <span className="text-[10px] font-bold text-slate-400 block mb-1">BOG'LANGAN DARSLAR:</span>
                              <div className="flex flex-wrap gap-1">
                                {s.courses.map(c => (
                                  <span key={c.id} className="bg-violet-50 text-violet-700 text-[10px] px-2 py-0.5 rounded-full border border-violet-100 font-medium">
                                    {c.title}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {s.certificates && s.certificates.length > 0 && (
                            <div className="pt-2 border-t border-slate-100/50">
                              <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">Sertifikatlar:</span>
                              <div className="space-y-1.5">
                                {s.certificates.map(cert => (
                                  <div key={cert.certificate_id} className="flex items-center justify-between bg-emerald-50/30 p-2 rounded-xl border border-emerald-100/30">
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-bold text-slate-800 truncate" title={cert.course_name}>{cert.course_name}</p>
                                      <code className="text-[9px] text-slate-400 font-mono block">{cert.certificate_id}</code>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                      <button 
                                        onClick={() => setPreviewCert({ ...cert, student_name: `${s.first_name} ${s.last_name}${s.father_name ? ' ' + s.father_name : ''}` })}
                                        className="w-6 h-6 flex items-center justify-center rounded bg-white hover:bg-slate-100 text-slate-500 hover:text-emerald-600 border border-slate-200 transition shadow-xs"
                                        title="Ko'rish"
                                      >
                                        <Icon d={IC.eye} size={11} />
                                      </button>
                                      <a 
                                        href={getMediaUrl(cert.pdf_file)} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="w-6 h-6 flex items-center justify-center rounded bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                                        title="PDF yuklab olish"
                                      >
                                        <Icon d={IC.download} size={11} />
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ CERTS SECTION ══ */}
          {section === 'certs' && (
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden p-5">

              {/* Header + Search */}
              <div className="shrink-0 mb-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">Sertifikatlar</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {certSearch.trim()
                        ? `${filteredCerts.length} ta natija topildi`
                        : `${certs.length} ta sertifikat berilgan`}
                    </p>
                  </div>
                  {certSearch && (
                    <button
                      onClick={() => setCertSearch('')}
                      className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mt-1 transition shrink-0"
                    >
                      <Icon d={IC.close} size={13} /> Tozalash
                    </button>
                  )}
                </div>

                {/* Search bar & Date filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Icon d={IC.search} size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={certSearch}
                      onChange={e => setCertSearch(e.target.value)}
                      placeholder="Ism, familiya, otasining ismi, pasport seriyasi bo'yicha qidirish..."
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                    />
                  </div>
                  
                  {/* Date range inputs */}
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-1 px-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Sana:</span>
                      <input
                        type="date"
                        value={certStartDate}
                        onChange={e => setCertStartDate(e.target.value)}
                        className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                        title="Boshlanish sanasi"
                      />
                    </div>
                    <span className="text-slate-300 font-bold">—</span>
                    <input
                      type="date"
                      value={certEndDate}
                      onChange={e => setCertEndDate(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                      title="Tugash sanasi"
                    />
                    {(certStartDate || certEndDate) && (
                      <button
                        onClick={() => { setCertStartDate(''); setCertEndDate('') }}
                        className="text-xs text-red-500 hover:text-red-700 ml-1.5 transition font-bold"
                        title="Sana filtrini tozalash"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {loadingCerts ? (
                <div className="flex-1 flex items-center justify-center text-slate-400">Yuklanmoqda...</div>
              ) : certs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Icon d={IC.cert} size={40} className="opacity-20" />
                  <p className="text-sm">Hali sertifikatlar yo'q</p>
                </div>
              ) : filteredCerts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                    <Icon d={IC.search} size={26} className="opacity-40" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-600">Natija topilmadi</p>
                    <p className="text-xs text-slate-400 mt-1">"<span className="font-mono">{certSearch}</span>" bo'yicha hech narsa topilmadi</p>
                  </div>
                  <button onClick={() => setCertSearch('')}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold underline transition">
                    Qidiruvni tozalash
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        <th className="py-3 px-4 rounded-tl-xl">{lang === 'ru' ? 'Студент' : "O'quvchi"}</th>
                        <th className="py-3 px-4">{lang === 'ru' ? 'ID сертификата' : 'Sertifikat ID'}</th>
                        <th className="py-3 px-4">{lang === 'ru' ? 'Курс' : 'Kurs'}</th>
                        <th className="py-3 px-4">{lang === 'ru' ? 'Дата выдачи' : 'Berilgan sana'}</th>
                        <th className="py-3 px-4">{lang === 'ru' ? 'Срок действия' : 'Amal qilish muddati'}</th>
                        <th className="py-3 px-4 text-center rounded-tr-xl">{lang === 'ru' ? 'Статус' : 'Holati'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredCerts.map(cert => (
                        <tr key={cert.certificate_id} className="hover:bg-emerald-50/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={cert.student_picture} name={cert.student_name} />
                              <div>
                                <p className="font-semibold text-slate-900">{cert.student_name}</p>
                                <code className="text-[10px] text-slate-400">@{cert.student_username}</code>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <code className="text-xs font-bold font-mono bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100">
                              {cert.certificate_id}
                            </code>
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-xs max-w-[180px] truncate">{cert.course_name}</td>
                          <td className="py-3 px-4">
                            <span className="bg-violet-50 text-violet-700 border border-violet-100 text-[10px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                              <Icon d={IC.calendar} size={10} className="shrink-0 text-violet-600" />
                              {cert.issued_at}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-orange-50 text-orange-700 border border-orange-100 text-[10px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                              <Icon d={IC.calendar} size={10} className="shrink-0 text-orange-600" />
                              {cert.expires_at}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                              {cert.is_active
                                ? <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold">✓ Faol</span>
                                : <span className="bg-slate-100 text-slate-500 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Tugagan</span>
                              }
                              {cert.pdf_file && (
                                <button onClick={() => setPreviewCert(cert)}
                                  className="w-7 h-7 flex items-center justify-center rounded bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 border border-slate-200 transition shadow-xs"
                                  title="Ko'rish"
                                >
                                  <Icon d={IC.eye} size={13} />
                                </button>
                              )}
                              <button onClick={() => navigate(`/verify/${cert.certificate_id}`)}
                                className="w-7 h-7 flex items-center justify-center rounded bg-slate-50 hover:bg-violet-50 text-slate-500 hover:text-violet-600 border border-slate-200 transition shadow-xs"
                                title="Tekshirish"
                              >
                                <Icon d={IC.cert} size={12} />
                              </button>
                              {cert.pdf_file && (
                                <a href={getMediaUrl(cert.pdf_file)} target="_blank" rel="noreferrer"
                                  className="w-7 h-7 flex items-center justify-center rounded bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 border border-slate-200 transition shadow-xs"
                                  title="PDF yuklab olish"
                                >
                                  <Icon d={IC.download} size={12} />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══ NOTIFICATIONS SECTION ══ */}
          {section === 'notifs' && (
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden p-5">
              <div className="flex items-center justify-between mb-5 shrink-0">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <Icon d={IC.bell} size={20} className="text-orange-500" />
                    Bildirishnomalar
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Tizim va o'quvchilarga oid so'nggi xabarlar</p>
                </div>
                {expiredCertsCount > 0 && (
                  <span className="bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold px-3 py-1 rounded-full">
                    {expiredCertsCount} ta muddati o'tgan
                  </span>
                )}
              </div>

              {loadingCerts ? (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
                    <span className="text-sm">Yuklanmoqda...</span>
                  </div>
                </div>
              ) : expiredCertsCount === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Icon d={IC.check} size={32} className="text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-600">Bildirishnomalar mavjud emas</p>
                    <p className="text-xs text-slate-400 mt-1">Barcha sertifikatlar faol</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3">
                  {certs.filter(c => c.raw_expires_at ? new Date(c.raw_expires_at) < new Date() : !c.is_active).map(cert => (
                    <div key={cert.certificate_id} className="flex items-start gap-4 p-4 rounded-xl border border-orange-100 bg-orange-50/50 hover:bg-orange-50 transition">
                      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon d={IC.cert} size={16} className="text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{cert.student_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{cert.course_name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                            Muddati o'tgan
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {cert.expires_at || (cert.raw_expires_at ? new Date(cert.raw_expires_at).toLocaleDateString('uz-UZ') : '')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setPreviewCert(cert)}
                        className="shrink-0 text-[10px] font-bold text-slate-500 hover:text-violet-600 bg-white border border-slate-200 hover:border-violet-200 px-3 py-1.5 rounded-lg transition"
                      >
                        Ko'rish
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
      {showAddCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Yangi dars kursi yaratish</h3>
              <button onClick={() => setShowAddCourse(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                <Icon d={IC.close} size={16} />
              </button>
            </div>
            {courseErr && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold mb-4 border border-red-100">{courseErr}</div>}
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Kurs nomi *</label>
                <input required type="text" placeholder="Masalan: Umumiy ovqatlanish minimumi" value={courseTitle} onChange={e => setCourseTitle(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Tavsif</label>
                <textarea placeholder="Kurs haqida qo'shimcha ma'lumot" value={courseDesc} onChange={e => setCourseDesc(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none h-20 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Boshlanish *</label>
                  <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Tugash *</label>
                  <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Jami darslar soni *</label>
                <input required type="number" min="1" value={totalLessons} onChange={e => setTotalLessons(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddCourse(false)}
                  className="text-sm text-slate-500 hover:text-slate-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-100 transition">
                  Bekor qilish
                </button>
                <button type="submit" disabled={courseLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-sm disabled:opacity-50 transition">
                  {courseLoading ? "Yaratilmoqda..." : "Kurs yaratish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    {/* ── Add Student Modal ── */}
    {showAddStudent && selectedCourse && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">O'quvchi qo'shish</h3>
              <p className="text-xs text-slate-400 mt-0.5">Kurs: <span className="font-semibold text-slate-600">{selectedCourse.title}</span></p>
            </div>
            <button onClick={() => { setShowAddStudent(false); resetStudentForm(); setSelectedExistingStudentId(''); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
              <Icon d={IC.close} size={16} />
            </button>
          </div>
          {sfErr && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold mb-4 border border-red-100">{sfErr}</div>}
          
          {/* Tab selector */}
          <div className="flex border-b border-slate-100 mb-4 text-xs font-bold uppercase tracking-wider shrink-0">
            <button 
              type="button"
              onClick={() => { setAddStudentType('new'); setSfErr(''); }}
              className={`flex-1 py-2 text-center border-b-2 transition-all ${
                addStudentType === 'new' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Yangi o'quvchi yaratish
            </button>
            <button 
              type="button"
              onClick={() => { setAddStudentType('existing'); setSfErr(''); }}
              className={`flex-1 py-2 text-center border-b-2 transition-all ${
                addStudentType === 'existing' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Mavjud o'quvchini biriktirish
            </button>
          </div>

          {addStudentType === 'existing' ? (
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                  O'quvchini tanlang *
                </label>
                {(() => {
                  const unassignedStudents = allStudents.filter(s => {
                    const isEnrolled = s.courses && s.courses.some(c => c.id === selectedCourse?.id);
                    if (isEnrolled) return false;
                    if (!existingSearch.trim()) return true;
                    const q = existingSearch.toLowerCase();
                    return (
                      `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
                      s.username.toLowerCase().includes(q) ||
                      `${s.passport_series || ''} ${s.passport_number || ''}`.toLowerCase().includes(q) ||
                      (s.jshshir || '').includes(q)
                    );
                  });
                  
                  if (allStudents.filter(s => !s.courses || !s.courses.some(c => c.id === selectedCourse?.id)).length === 0) {
                    return (
                      <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                        Barcha o'quvchilar ushbu darsga bog'langan.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="relative">
                        <Icon d={IC.search} size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Ism, username, pasport yoki JSHSHIR bo'yicha qidirish..."
                          value={existingSearch}
                          onChange={e => setExistingSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                        />
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl p-2 bg-slate-50 space-y-1.5 scrollbar-thin">
                        {unassignedStudents.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-xs">
                            Qidiruv bo'yicha mos o'quvchilar topilmadi.
                          </div>
                        ) : (
                          unassignedStudents.map(s => {
                            const isSelected = selectedExistingStudentId === s.id;
                            return (
                              <div 
                                key={s.id}
                                onClick={() => setSelectedExistingStudentId(s.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                                  isSelected 
                                    ? 'bg-blue-50/50 border-blue-600 shadow-sm' 
                                    : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <Avatar src={s.profile_picture} name={`${s.first_name} ${s.last_name}`} />
                                  <div className="min-w-0 text-left">
                                    <p className="font-bold text-slate-900 text-xs truncate leading-snug">{s.first_name} {s.last_name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-medium">
                                      <code className="bg-slate-100 px-1 rounded">@{s.username}</code>
                                      <span>•</span>
                                      <span className="font-mono">{s.passport_series} {s.passport_number}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                                  isSelected 
                                    ? 'bg-blue-600 border-blue-600 text-white' 
                                    : 'border-slate-300 bg-white'
                                }`}>
                                  {isSelected && <Icon d={IC.check} size={11} />}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowAddStudent(false); resetStudentForm(); setSelectedExistingStudentId(''); }}
                  className="text-sm text-slate-500 hover:text-slate-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-100 transition">
                  Bekor qilish
                </button>
                <button type="submit" disabled={sfLoading || !selectedExistingStudentId}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition">
                  {sfLoading ? "Biriktirilmoqda..." : "Kursga biriktirish"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Ism *</label>
                  <input required type="text" placeholder="Ali" value={sfFirst} onChange={e => setSfFirst(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Familiya *</label>
                  <input required type="text" placeholder="Valiyev" value={sfLast} onChange={e => setSfLast(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Otasining ismi *</label>
                <input required type="text" placeholder="Qobilovich" value={sfFather} onChange={e => setSfFather(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Seriya *</label>
                  <input required type="text" placeholder="AA" maxLength={2} value={sfPS} onChange={e => setSfPS(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-violet-300 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Pasport raqam *</label>
                  <input required type="text" placeholder="1234567" maxLength={7} value={sfPN} onChange={e => setSfPN(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-violet-300 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Telefon</label>
                <input type="text" placeholder="+998 xx xxx xx xx" value={sfPhone} onChange={handlePhoneChange}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-300 outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddStudent(false); resetStudentForm() }}
                  className="text-sm text-slate-500 hover:text-slate-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-100 transition">
                  Bekor qilish
                </button>
                <button type="submit" disabled={sfLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-sm disabled:opacity-50 transition">
                  {sfLoading ? "Qo'shilmoqda..." : "O'quvchini qo'shish"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )}

      {/* ── Certificate Preview Modal ── */}
      {previewCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden border border-slate-100 my-8">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-40 px-2 shadow-lg">
        {navItems.map(item => {
          const isActive = section === item.id
          const cc = colorConfig[item.color]
          return (
            <button key={item.id}
              onClick={() => { changeSection(item.id); setSelectedStudent(null) }}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-all duration-150 relative ${
                isActive ? 'text-violet-600' : 'text-slate-500'
              }`}
            >
              <Icon d={item.icon} size={18} className={isActive ? 'text-violet-600' : 'text-slate-400'} />
              <span className="mt-1 text-[9px]">{item.label}</span>
              {item.count !== null && (
                <span className={`absolute top-1 right-5 text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-violet-600 text-white' : cc.pill
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}

      {/* ── Confetti animation ── */}
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

      {/* ── Bottom-right toast ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl ${
            toast.startsWith('⚠') ? 'bg-red-500 border border-red-400' : 'bg-emerald-600 border border-emerald-500'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          {toast}
        </div>
      )}
    </div>
  )
}
