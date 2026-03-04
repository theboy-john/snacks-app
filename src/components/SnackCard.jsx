import { motion } from 'framer-motion'
import { useState } from 'react'

function SnackCard({ snack, onAddToCart, disabled }) {
  const [added, setAdded] = useState(false)

  function handleAdd() {
    if (disabled) return
    onAddToCart(snack)
    setAdded(true)
    setTimeout(() => setAdded(false), 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 flex flex-col gap-2"
    >
      <div className="rounded-xl h-24 sm:h-32 overflow-hidden bg-orange-100 flex items-center justify-center">
        {snack.imageUrl ? (
          <img
            src={snack.imageUrl}
            alt={snack.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl sm:text-5xl">🍿</span>
        )}
      </div>
      <h2 className="text-sm sm:text-base font-bold text-gray-800 leading-tight">{snack.name}</h2>
      <p className="text-xs text-gray-400 leading-snug">{snack.description}</p>
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-orange-500 font-bold text-sm sm:text-base">₦{snack.price}</span>
        <motion.button
          onClick={handleAdd}
          disabled={disabled}
          whileTap={{ scale: 0.92 }}
          animate={{ backgroundColor: added ? '#22c55e' : '#f97316' }}
          transition={{ duration: 0.2 }}
          className="text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {added ? '✓ Added!' : 'Add'}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default SnackCard