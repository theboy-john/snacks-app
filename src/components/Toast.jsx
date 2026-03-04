import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const styles = {
    error: 'bg-red-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }

  const icons = {
    error: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${styles[type]} text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 max-w-sm w-[90%]`}
    >
      <span>{icons[type]}</span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-white opacity-70 hover:opacity-100 transition">✕</button>
    </motion.div>
  )
}

export default Toast