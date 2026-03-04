import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { useToast } from '../context/ToastContext'
import { useNetworkStatus } from '../context/useNetworkStatus'

function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '' })
  const [errors, setErrors] = useState({})
  const { showToast } = useToast()
  const isOnline = useNetworkStatus()

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  function validate() {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!form.address.trim()) newErrors.address = 'Delivery address is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handlePlaceOrder() {
  if (!validate()) {
    showToast('Please fill in all required fields', 'error')
    return
  }

  if (!isOnline) {
    showToast('No internet connection. Please check your network and try again.', 'error')
    return
  }

  setLoading(true)
  try {
    await addDoc(collection(db, 'orders'), {
      customerName: form.name,
      phone: form.phone,
      address: form.address,
      note: form.note,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice,
      status: 'pending',
      paymentConfirmed: false,
      createdAt: serverTimestamp()
    })
    clearCart()
    navigate('/order-success')
  } catch (error) {
    console.error(error)
    if (!navigator.onLine) {
      showToast('You appear to be offline. Please check your connection and try again.', 'error')
    } else {
      showToast('Something went wrong placing your order. Please try again.', 'error')
    }
    setLoading(false)
  }
 }

  const fields = [
    { name: 'name', label: 'Full Name *', placeholder: 'e.g. Amaka Obi' },
    { name: 'phone', label: 'Phone Number *', placeholder: 'e.g. 08012345678' },
    { name: 'address', label: 'Delivery Address *', placeholder: 'e.g. 12 Murtala Street, Surulere' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/cart')}
            className="text-2xl p-1"
          >
            ←
          </motion.button>
          <h1 className="text-lg sm:text-xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto flex flex-col gap-4 pb-32">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4"
        >
          <h2 className="font-bold text-gray-700">Delivery Details</h2>

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
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className={`border rounded-xl px-4 py-3 text-sm focus:outline-none transition ${
                  errors[field.name]
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-orange-400'
                }`}
              />
              {errors[field.name] && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs"
                >
                  {errors[field.name]}
                </motion.p>
              )}
            </motion.div>
          ))}

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500 font-medium">Order Note (optional)</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Any special instructions?"
              rows={3}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none"
            />
          </div>
        </motion.div>

        {/* Payment Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 flex flex-col gap-2 border border-orange-200"
        >
          <h2 className="font-bold text-orange-700">💰 Payment via Mobile Money</h2>
          <p className="text-sm text-orange-600">After placing your order, send payment to:</p>
          <p className="font-bold text-gray-800">MTN MoMo: 08012345678 (Your Name)</p>
          <p className="text-sm text-orange-600">Your order will be confirmed once payment is received.</p>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-2"
        >
          <h2 className="font-bold text-gray-700">Order Summary</h2>
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

      {/* Sticky Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white py-4 rounded-2xl font-bold text-base sm:text-lg shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Placing Order...
              </span>
            ) : `Place Order • ₦${totalPrice}`}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage