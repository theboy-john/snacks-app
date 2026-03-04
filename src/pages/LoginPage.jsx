import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin() {
    if (!password) return
    setLoading(true)
    setError(false)

    try {
      const snap = await getDoc(doc(db, 'settings', 'seller'))
      const correctPassword = snap.data().password

      if (password === correctPassword) {
        sessionStorage.setItem('sellerAuth', 'true')
        navigate('/dashboard')
      } else {
        setError(true)
      }
    } catch (err) {
      setError(true)
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
        <div className="text-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-5xl block"
          >
            🔐
          </motion.span>
          <h1 className="text-xl font-bold text-gray-800 mt-2">Seller Login</h1>
          <p className="text-sm text-gray-500">Enter your password to access the dashboard</p>
        </div>

        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="Enter password"
          className={`border rounded-xl px-4 py-3 text-sm focus:outline-none transition ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-orange-400'
          }`}
        />

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm text-center"
          >
            Incorrect password. Try again.
          </motion.p>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
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
          ) : 'Login'}
        </motion.button>
        <Link
  to="/reset-password"
  className="text-sm text-gray-400 hover:text-orange-500 transition text-center"
>
  Forgot password?
</Link>
      </motion.div>
    </div>
  )
}

export default LoginPage