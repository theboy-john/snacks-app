import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { useToast } from '../context/ToastContext'

function ChangePasswordPage() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleChangePassword() {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      showToast('Please fill in all fields', 'warning')
      return
    }

    if (form.newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'warning')
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }

    if (form.currentPassword === form.newPassword) {
      showToast('New password must be different from current password', 'warning')
      return
    }

    setLoading(true)

    try {
      const snap = await getDoc(doc(db, 'settings', 'seller'))
      const correctPassword = snap.data().password

      if (form.currentPassword !== correctPassword) {
        showToast('Current password is incorrect', 'error')
        setLoading(false)
        return
      }

      await updateDoc(doc(db, 'settings', 'seller'), {
        password: form.newPassword
      })

      showToast('Password changed successfully!', 'success')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (error) {
      showToast('Something went wrong. Please try again.', 'error')
    }

    setLoading(false)
  }

  const fields = [
    { name: 'currentPassword', label: 'Current Password' },
    { name: 'newPassword', label: 'New Password' },
    { name: 'confirmPassword', label: 'Confirm New Password' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/dashboard')}
            className="text-2xl p-1"
          >
            ←
          </motion.button>
          <h1 className="text-lg sm:text-xl font-bold">Change Password</h1>
        </div>
      </div>

      <div className="p-4 max-w-sm mx-auto mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4"
        >
          <div className="text-center">
            <span className="text-4xl">🔑</span>
            <p className="text-sm text-gray-500 mt-2">Choose a strong password with at least 8 characters.</p>
          </div>

          {fields.map((field, i) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col gap-1"
            >
              <label className="text-sm text-gray-500 font-medium">{field.label}</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder="••••••••"
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
              />
            </motion.div>
          ))}

          {/* Show/Hide Passwords Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showPasswords"
              checked={showPasswords}
              onChange={e => setShowPasswords(e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            <label htmlFor="showPasswords" className="text-sm text-gray-500">Show passwords</label>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Updating...
              </span>
            ) : 'Change Password'}
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default ChangePasswordPage