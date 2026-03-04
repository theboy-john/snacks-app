import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import SnackCard from '../components/SnackCard'
import { motion } from 'framer-motion'
import { collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 flex flex-col gap-2 animate-pulse">
      <div className="rounded-xl h-24 sm:h-32 bg-orange-100" />
      <div className="h-4 bg-gray-200 rounded-full w-3/4" />
      <div className="h-3 bg-gray-100 rounded-full w-full" />
      <div className="h-3 bg-gray-100 rounded-full w-2/3" />
      <div className="flex items-center justify-between mt-2">
        <div className="h-4 bg-orange-100 rounded-full w-16" />
        <div className="h-8 bg-orange-100 rounded-full w-16" />
      </div>
    </div>
  )
}

function MenuPage() {
  const [snacks, setSnacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [shopOpen, setShopOpen] = useState(true)
  const [shopLoading, setShopLoading] = useState(true)
  const { addToCart, totalItems } = useCart()

 useEffect(() => {
  async function fetchSnacks() {
    const snapshot = await getDocs(collection(db, 'snacks'))
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setSnacks(data.filter(s => s.available))
    setLoading(false)
  }
  fetchSnacks()

  // Listen to shop status in real time
  const unsub = onSnapshot(doc(db, 'settings', 'shop'), snap => {
    if (snap.exists()) setShopOpen(snap.data().isOpen)
    setShopLoading(false)
  })
  return () => unsub()
}, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-xl sm:text-2xl font-bold">🍿 Snacks Order</h1>
            <p className="text-xs sm:text-sm opacity-80">Fresh snacks delivered to you</p>
          </motion.div>
          <div className="flex items-center gap-3">
            <Link to="/track" className="text-white text-sm font-semibold opacity-90 hover:opacity-100 transition">
              Track Order
            </Link>
            <Link to="/cart" className="relative p-2">
              <span className="text-3xl">🛒</span>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 bg-white text-orange-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Closed Banner */}
      {!shopOpen && !shopLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500 text-white text-center py-3 px-4"
        >
          <p className="font-bold text-sm">🔴 We're currently closed</p>
          <p className="text-xs opacity-80">Check back soon — we'll be open again shortly!</p>
        </motion.div>
      )}

      {/* Content */}
      <div className="p-4 max-w-2xl mx-auto">
        {loading ? (
          <>
            <div className="h-5 bg-gray-200 rounded-full w-32 mb-4 animate-pulse" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        ) : snacks.length === 0 ? (
          <div className="text-center mt-20 text-gray-400">
            <p className="text-5xl mb-3">🍽️</p>
            <p className="font-semibold">No snacks available right now.</p>
          </div>
        ) : (
          <>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-base sm:text-lg font-semibold text-gray-700 mb-4"
            >
              Our Menu
            </motion.h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {snacks.map((snack, i) => (
                <motion.div
                  key={snack.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <SnackCard
                    snack={snack}
                    onAddToCart={addToCart}
                    disabled={!shopOpen}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MenuPage