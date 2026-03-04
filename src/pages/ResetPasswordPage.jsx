import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { useToast } from '../context/ToastContext'

function ResetPasswordPage() {
  const [step, setStep] = useState(1)
  const [recoveryKey, setRecoveryKey] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  async function handleVerifyKey() {
  if (!recoveryKey.trim()) {
    showToast('Please enter your recovery key', 'warning')
    return
  }

  setLoading(true)

  try {
    const snap = await getDoc(doc(db, 'settings', 'seller'))
    const correctKey = snap.data().recoverykey

    if (recoveryKey.trim() === correctKey) {
      setStep(2)
    } else {
      showToast('Incorrect recovery key. Please try again.', 'error')
    }
  } catch (err) {
    console.error(err)
    showToast('Something went wrong. Please try again.', 'error')
  }

  setLoading(false)
}

  async function handleResetPassword() {
    if (!newPassword || !confirmPassword) {
      showToast('Please fill in all fields', 'warning')
      return
    }

    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'warning')
      return
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    setLoading(true)

    try {
      await updateDoc(doc(db, 'settings', 'seller'), {
        password: newPassword
      })
      showToast('Password reset successfully!', 'success')
      setTimeout(() => navigate('/login'), 1500)
    } catch (error) {
      showToast('Something went wrong. Please try again.', 'error')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm flex flex-col gap-4"
      >
        {/* Header */}
        <div className="text-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-5xl block"
          >
            {step === 1 ? '🔑' : '🔐'}
          </motion.span>
          <h1 className="text-xl font-bold text-gray-800 mt-2">
            {step === 1 ? 'Reset Password' : 'Set New Password'}
          </h1>
          <p className="text-sm text-gray-500">
            {step === 1
              ? 'Enter your secret recovery key to continue'
              : 'Choose a strong new password'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2].map(s => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1 - Recovery Key */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500 font-medium">Recovery Key</label>
              <input
                type="text"
                value={recoveryKey}
                onChange={e => setRecoveryKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerifyKey()}
                placeholder="Enter your recovery key"
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleVerifyKey}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Verifying...
                </span>
              ) : 'Verify Key'}
            </motion.button>
          </motion.div>
        )}

        {/* Step 2 - New Password */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500 font-medium">New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500 font-medium">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                placeholder="••••••••"
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={e => setShowPassword(e.target.checked)}
                className="w-4 h-4 accent-orange-500"
              />
              <label htmlFor="showPassword" className="text-sm text-gray-500">Show passwords</label>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Resetting...
                </span>
              ) : 'Reset Password'}
            </motion.button>
          </motion.div>
        )}

        {/* Back to Login */}
        <button
          onClick={() => navigate('/login')}
          className="text-sm text-gray-400 hover:text-orange-500 transition text-center"
        >
          ← Back to Login
        </button>
      </motion.div>
    </div>
  )
}

export default ResetPasswordPage