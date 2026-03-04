import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart()
  const navigate = useNavigate()
  const [shopOpen, setShopOpen] = useState(true)

  useEffect(() => {
    async function checkShop() {
      const snap = await getDoc(doc(db, 'settings', 'shop'))
      if (snap.exists()) setShopOpen(snap.data().isOpen)
    }
    checkShop()
  }, [])

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center gap-4 p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-7xl"
        >
          🛒
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-gray-700"
        >
          Your cart is empty
        </motion.h2>
        <p className="text-gray-400 text-sm text-center">Go back to the menu and add some snacks!</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition shadow-md"
        >
          Browse Menu
        </motion.button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="text-2xl p-1"
          >
            ←
          </motion.button>
          <h1 className="text-lg sm:text-xl font-bold">Your Cart ({totalItems} items)</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto flex flex-col gap-3 pb-32">
        <AnimatePresence>
          {cartItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 flex items-center gap-3"
            >
              <div className="bg-orange-100 rounded-xl w-14 h-14 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span>🍿</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{item.name}</h3>
                <p className="text-orange-500 font-semibold text-sm">₦{item.price * item.quantity}</p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center hover:bg-orange-200 transition"
                >
                  −
                </motion.button>
                <span className="w-5 text-center font-semibold text-sm">{item.quantity}</span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center hover:bg-orange-200 transition"
                >
                  +
                </motion.button>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => removeFromCart(item.id)}
                className="text-gray-300 hover:text-red-400 transition text-lg ml-1 p-1"
              >
                ✕
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-2"
        >
          <h3 className="font-bold text-gray-700">Order Summary</h3>
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between text-sm text-gray-400">
              <span>{item.name} x{item.quantity}</span>
              <span>₦{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold text-gray-800">
            <span>Total</span>
            <span className="text-orange-500">₦{totalPrice}</span>
          </div>
        </motion.div>
      </div>

      {/* Sticky Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          {!shopOpen && (
            <p className="text-center text-red-500 text-sm font-semibold">
              🔴 Shop is currently closed. You cannot place orders right now.
            </p>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/checkout')}
            disabled={!shopOpen}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white py-4 rounded-2xl font-bold text-base sm:text-lg shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Proceed to Checkout • ₦{totalPrice}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default CartPage