import { useState } from 'react'
import { db } from '../firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../context/ToastContext'
import { useNetworkStatus } from '../context/useNetworkStatus'

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'ready', 'completed']

const STATUS_INFO = {
  pending: { icon: '⏳', label: 'Order Received', desc: 'We have your order and are waiting for payment confirmation.' },
  confirmed: { icon: '✅', label: 'Payment Confirmed', desc: 'Your payment has been confirmed. We are preparing your order.' },
  processing: { icon: '👨‍🍳', label: 'Being Prepared', desc: 'Your snacks are being freshly prepared.' },
  ready: { icon: '📦', label: 'Ready', desc: 'Your order is ready and on its way to you!' },
  completed: { icon: '🎉', label: 'Delivered', desc: 'Your order has been delivered. Enjoy your snacks!' }
}

function OrderTrackingPage() {
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const isOnline = useNetworkStatus()

  async function handleSearch() {
  if (!phone.trim()) {
    showToast('Please enter your phone number', 'warning')
    return
  }

  if (!isOnline) {
    showToast('No internet connection. Please check your network.', 'error')
    return
  }

  setLoading(true)
  setSearched(false)

  try {
    const q = query(
      collection(db, 'orders'),
      where('phone', '==', phone.trim()),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setOrders(data)
    setSearched(true)
  } catch (error) {
    console.error(error)
    showToast('Failed to fetch orders. Please try again.', 'error')
  }

  setLoading(false)
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
          <h1 className="text-lg sm:text-xl font-bold">Track My Order</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto flex flex-col gap-4">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3"
        >
          <p className="text-sm text-gray-500">Enter the phone number you used when placing your order.</p>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. 08012345678"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Searching...
              </span>
            ) : 'Find My Orders'}
          </motion.button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {searched && orders.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 text-gray-400"
            >
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-semibold">No orders found</p>
              <p className="text-sm">Make sure you entered the correct phone number.</p>
            </motion.div>
          )}

          {orders.map((order, index) => {
            const currentStep = STATUS_STEPS.indexOf(order.status)
            const info = STATUS_INFO[order.status]

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4"
              >
                {/* Status Banner */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-3 flex items-center gap-3 border border-orange-100">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-3xl"
                  >
                    {info.icon}
                  </motion.span>
                  <div>
                    <p className="font-bold text-gray-800">{info.label}</p>
                    <p className="text-xs text-gray-500">{info.desc}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-1">
                  {STATUS_STEPS.map((step, i) => (
                    <motion.div
                      key={step}
                      className="flex-1 h-2 rounded-full"
                      initial={{ backgroundColor: '#e5e7eb' }}
                      animate={{ backgroundColor: i <= currentStep ? '#f97316' : '#e5e7eb' }}
                      transition={{ delay: i * 0.1 }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Placed</span>
                  <span>Confirmed</span>
                  <span>Preparing</span>
                  <span>Ready</span>
                  <span>Done</span>
                </div>

                {/* Order Details */}
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-gray-700">Order Details</p>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-500">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₦{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-orange-500">₦{order.totalPrice}</span>
                  </div>
                </div>

                {order.createdAt && (
                  <p className="text-xs text-gray-400">
                    🕐 Ordered on {new Date(order.createdAt.seconds * 1000).toLocaleString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default OrderTrackingPage