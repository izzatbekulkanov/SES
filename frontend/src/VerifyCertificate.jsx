import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const getMediaUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `http://localhost:8000${url}`
}

export default function VerifyCertificate() {
  const { certificateId } = useParams()
  const [certData, setCertData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVerify()
  }, [certificateId])

  const fetchVerify = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`http://localhost:8000/api/certificates/verify/${certificateId}/`)
      if (response.ok) {
        const data = await response.json()
        setCertData(data)
      } else {
        const data = await response.json()
        setError(data.detail || 'Sertifikat haqiqiy emas yoki topilmadi.')
      }
    } catch (err) {
      setError('Tizimga ulanishda xatolik yuz berdi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center space-y-6">
        
        {/* SES Header Emblem */}
        <div className="space-y-2 border-b border-slate-100 pb-5">
          <img src="/logo.png" alt="SES Logo" className="w-16 h-16 object-contain mx-auto mb-2" />
          <h2 className="text-sm font-bold text-slate-800 tracking-wider">
            TOSHKENT SHAHAR SANITARIYA-EPIDEMIOLOGIK XIZMATI
          </h2>
          <p className="text-[10px] text-slate-500 font-semibold uppercase">
            SERTIFIKAT HAQIQIYLIGINI TEKSHIRISH TIZIMI
          </p>
        </div>

        {loading ? (
          <div className="py-10 text-slate-500 font-semibold">Tekshirilmoqda...</div>
        ) : error ? (
          <div className="py-6 space-y-4">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl border border-red-100">
              ✕
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-red-700">Sertifikat topilmadi</h3>
              <p className="text-sm text-slate-500">
                Siz kiritgan ID (<code>{certificateId}</code>) bo‘yicha tizimda faol sertifikat topilmadi.
              </p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg">
              Muammo yuzasidan o'quv markazi yoki Toshkent shahar SES bo'limiga murojaat qiling.
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
                  HAQIQIY / FAOL
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Sertifikat muvaffaqiyatli tasdiqlandi!</h3>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto text-xl border border-amber-100">
                  !
                </div>
                <span className="inline-block bg-amber-50 text-amber-700 text-xs px-3 py-1 rounded-full font-bold border border-amber-200">
                  MUDDATI TUGAGAN
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Sertifikat muddati yakunlangan!</h3>
              </div>
            )}

            {/* Certificate Details list */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left space-y-3.5">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-xs font-medium text-slate-500">Sertifikat ID</span>
                <span className="text-xs font-bold text-slate-800 font-mono">{certData.certificate_id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-xs font-medium text-slate-500">Sertifikat egasi</span>
                <span className="text-xs font-bold text-slate-800">{certData.student_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-xs font-medium text-slate-500">Kurs yo'nalishi</span>
                <span className="text-xs font-bold text-slate-800 text-right">{certData.course_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-xs font-medium text-slate-500">Berilgan sana</span>
                <span className="text-xs font-bold text-slate-800">{certData.issued_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-medium text-slate-500">Amal qilish muddati</span>
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
                  Rasmiy PDF nusxasini yuklab olish
                </a>
              </div>
            )}

          </div>
        ) : null}

        {/* Back Link */}
        <div className="pt-2">
          <a href="/login" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
            Tizimga kirish sahifasiga o'tish
          </a>
        </div>
      </div>
    </div>
  )
}
