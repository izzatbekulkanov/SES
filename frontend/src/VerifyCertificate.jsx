import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const getMediaUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${window.location.origin}${url}`
}

const t = {
  uz: {
    header: "SANITARIYA-EPIDEMIOLOGIK OSOYISHTALIK VA JAMOAT SALOMATLIGI QO’MITASINING TOSHKENT SHAHAR BOSHQARMASI",
    subHeader: "SERTIFIKAT HAQIQIYLIGINI TEKSHIRISH TIZIMI",
    checking: "Tekshirilmoqda...",
    notFoundTitle: "Sertifikat topilmadi",
    notFoundDesc: (id) => `Siz kiritgan ID (${id}) bo‘yicha tizimda faol sertifikat topilmadi.`,
    notFoundHelp: "Muammo yuzasidan Sanitariya-epidemiologik osoyishtalik va jamoat salomatligi qo'mitasining Toshkent shahar boshqarmasiga murojaat qiling.",
    activeBadge: "HAQIQIY / FAOL",
    expiredBadge: "MUDDATI TUGAGAN",
    successTitle: "Sertifikat muvaffaqiyatli tasdiqlandi!",
    expiredTitle: "Sertifikat muddati yakunlangan!",
    idLabel: "Sertifikat ID",
    studentLabel: "Sertifikat egasi",
    courseLabel: "Kurs yo'nalishi",
    issuedLabel: "Berilgan sana",
    expiresLabel: "Amal qilish muddati",
    downloadPdf: "Rasmiy PDF nusxasini yuklab olish",
    backToLogin: "Tizimga kirish sahifasiga o'tish",
    connError: "Tizimga ulanishda xatolik yuz berdi."
  },
  ru: {
    header: "ТАШКЕНТСКОЕ ГОРОДСКОЕ УПРАВЛЕНИЕ КОМИТЕТА САНИТАРНО-ЭПИДЕМИОЛОГИЧЕСКОГО БЛАГОПОЛУЧИЯ И ОБЩЕСТВЕННОГО ЗДОРОВЬЯ",
    subHeader: "СИСТЕМА ПРОВЕРКИ ПОДЛИННОСТИ СЕРТИФИКАТОВ",
    checking: "Проверяется...",
    notFoundTitle: "Сертификат не найден",
    notFoundDesc: (id) => `По указанному ID (${id}) активный сертификат в системе не найден.`,
    notFoundHelp: "По вопросам обращайтесь в Ташкентское городское управление Комитета санитарно-эпидемиологического благополучия и общественного здоровья.",
    activeBadge: "ДЕЙСТВИТЕЛЕН / АКТИВЕН",
    expiredBadge: "СРОК ДЕЙСТВИЯ ИСТЕК",
    successTitle: "Сертификат успешно подтвержден!",
    expiredTitle: "Срок действия сертификата истек!",
    idLabel: "ID Сертификата",
    studentLabel: "Владелец сертификата",
    courseLabel: "Направление курса",
    issuedLabel: "Дата выдачи",
    expiresLabel: "Срок действия",
    downloadPdf: "Скачать официальную копию PDF",
    backToLogin: "Перейти на страницу входа",
    connError: "Ошибка при подключении к системе."
  }
}

export default function VerifyCertificate() {
  const { certificateId } = useParams()
  const [certData, setCertData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lang, setLang] = useState('uz')

  async function fetchVerify() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/certificates/verify/${certificateId}/`)
      if (response.ok) {
        const data = await response.json()
        setCertData(data)
      } else {
        const data = await response.json()
        setError(data.detail || 'Sertifikat haqiqiy emas yoki topilmadi.')
      }
    } catch {
      setError(t[lang].connError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      fetchVerify()
    }, 0)
  }, [certificateId])

  const currentT = t[lang]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Language selector at the top */}
      <div className="w-full max-w-xl flex justify-end gap-2 mb-3">
        <button
          onClick={() => setLang('uz')}
          className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
            lang === 'uz'
              ? 'bg-violet-600 border-violet-600 text-white shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          O'zbekcha
        </button>
        <button
          onClick={() => setLang('ru')}
          className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
            lang === 'ru'
              ? 'bg-violet-600 border-violet-600 text-white shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Русский
        </button>
      </div>

      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center space-y-6">
        
        {/* SES Header Emblem */}
        <div className="space-y-2 border-b border-slate-100 pb-5">
          <img src="/logo.png" alt="SES Logo" className="w-16 h-16 object-contain mx-auto mb-2" />
          <h2 className="text-sm font-bold text-slate-800 tracking-wider uppercase leading-snug">
            {currentT.header}
          </h2>
          <p className="text-[10px] text-slate-500 font-semibold uppercase mt-2">
            {currentT.subHeader}
          </p>
        </div>

        {loading ? (
          <div className="py-10 text-slate-500 font-semibold">{currentT.checking}</div>
        ) : error ? (
          <div className="py-6 space-y-4">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl border border-red-100">
              ✕
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-red-700">{currentT.notFoundTitle}</h3>
              <p className="text-sm text-slate-500">
                {currentT.notFoundDesc(certificateId)}
              </p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg">
              {currentT.notFoundHelp}
            </div>
          </div>
        ) : certData ? (
          <div className="space-y-6">
            
            {/* Validity Badge */}
            {certData.is_valid ? (
              <div className="space-y-2">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl border border-emerald-100">
                  ✓
                </div>
                <span className="inline-block bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold border border-emerald-200">
                  {currentT.activeBadge}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{currentT.successTitle}</h3>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto text-xl border border-amber-100">
                  !
                </div>
                <span className="inline-block bg-amber-50 text-amber-700 text-xs px-3 py-1 rounded-full font-bold border border-amber-200">
                  {currentT.expiredBadge}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{currentT.expiredTitle}</h3>
              </div>
            )}

            {/* Certificate Details list */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left space-y-3.5">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-xs font-medium text-slate-500">{currentT.idLabel}</span>
                <span className="text-xs font-bold text-slate-800 font-mono">{certData.certificate_id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-xs font-medium text-slate-500">{currentT.studentLabel}</span>
                <span className="text-xs font-bold text-slate-800">{certData.student_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-xs font-medium text-slate-500">{currentT.courseLabel}</span>
                <span className="text-xs font-bold text-slate-800 text-right">{certData.course_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-xs font-medium text-slate-500">{currentT.issuedLabel}</span>
                <span className="text-xs font-bold text-slate-800">{certData.issued_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-medium text-slate-500">{currentT.expiresLabel}</span>
                <span className="text-xs font-bold text-slate-800">{certData.expiry_date}</span>
              </div>
            </div>

            {/* Actions: Download PDF */}
            {certData.is_valid && certData.pdf_file && (
              <div className="pt-2">
                <a
                  href={getMediaUrl(certData.pdf_file)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition duration-150 gap-2 w-full"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {currentT.downloadPdf}
                </a>
              </div>
            )}

          </div>
        ) : null}

        {/* Back Link */}
        <div className="pt-2">
          <a href="/login" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
            {currentT.backToLogin}
          </a>
        </div>
      </div>
    </div>
  )
}
