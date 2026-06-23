import { useState } from 'react'

export default function UserProfile({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('access_token')

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
      const response = await fetch('http://localhost:8000/api/auth/change-password/', {
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
    } catch (err) {
      setError('Serverga ulanishda xatolik yuz berdi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-950">Parolni o'zgartirish</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-lg"
          >
            ✕
          </button>
        </div>

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
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Amaldagi parol *
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
              placeholder="Amaldagi parolni kiriting"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Yangi parol *
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
              placeholder="Yangi parol kiriting"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Yangi parolni tasdiqlash *
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
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
              Yopish
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
    </div>
  )
}
