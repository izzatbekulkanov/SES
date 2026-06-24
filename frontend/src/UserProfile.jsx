import { useState } from 'react'

export default function UserProfile({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('details') // 'details' or 'password'

  const token = localStorage.getItem('access_token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const getRoleLabel = (role) => {
    if (role === 'ADMIN') return 'Administrator'
    if (role === 'TEACHER') return 'O\'qituvchi'
    if (role === 'STUDENT') return 'O\'quvchi / Talaba'
    return role
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Yangi parol va tasdiqlovchi parol bir-biriga mos kelmadi.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('https://shahar-ses.uz/api/auth/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      })

      if (response.ok) {
        setSuccess('Parol muvaffaqiyatli o\'zgartirildi.')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await response.json()
        setError(data.detail || 'Xatolik yuz berdi. Joriy parol xato bo‘lishi mumkin.')
      }
    } catch {
      setError('Serverga ulanishda xatolik yuz berdi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 shrink-0">
          <h3 className="text-xl font-bold text-slate-950">Foydalanuvchi profili</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 mb-5 shrink-0 gap-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'details'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Ma'lumotlar
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'password'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Parolni o'zgartirish
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* User Avatar & Info Card */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="w-14 h-14 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xl border border-violet-200 uppercase">
                  {(user.first_name || '?')[0]}{(user.last_name || '')[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base leading-tight">
                    {user.first_name} {user.last_name}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">@{user.username}</p>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Foydalanuvchi roli</span>
                  <span className="text-xs font-semibold text-slate-800">{getRoleLabel(user.role)}</span>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Username</span>
                  <span className="text-xs font-semibold text-slate-800 font-mono">@{user.username}</span>
                </div>
                <div className="col-span-2 bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Email manzil</span>
                  <span className="text-xs font-semibold text-slate-800 block truncate" title={user.email}>
                    {user.email || '—'}
                  </span>
                </div>
                {user.passport_series && (
                  <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Pasport</span>
                    <span className="text-xs font-semibold text-slate-800 font-mono">
                      {user.passport_series} {user.passport_number}
                    </span>
                  </div>
                )}
                {user.jshshir && (
                  <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">JSHSHIR</span>
                    <span className="text-xs font-semibold text-slate-800 font-mono">{user.jshshir}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-semibold mb-4 border border-red-100">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm font-semibold mb-4 border border-emerald-100">
                  {success}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Amaldagi parol *
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
                    placeholder="Amaldagi parolni kiriting"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Yangi parol *
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
                    placeholder="Yangi parol kiriting"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Yangi parolni tasdiqlash *
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
                    placeholder="Yangi parolni qayta kiriting"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-5 py-2 rounded-lg font-semibold shadow-md disabled:bg-slate-400 transition"
                  >
                    {loading ? 'Yangilanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'details' && (
          <div className="pt-4 border-t border-slate-100 mt-5 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-5 py-2 rounded-lg font-semibold transition"
            >
              Yopish
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
