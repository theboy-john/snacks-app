import { useEffect, useState, useRef } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, doc, updateDoc, orderBy, query, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500'
}

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'ready', 'completed']

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 flex flex-col gap-3 animate-pulse">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <div className="h-4 bg-gray-200 rounded-full w-32" />
              <div className="h-3 bg-gray-100 rounded-full w-24" />
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-20" />
          </div>
          <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
            <div className="h-3 bg-gray-200 rounded-full w-full" />
            <div className="h-3 bg-gray-200 rounded-full w-3/4" />
          </div>
          <div className="h-10 bg-orange-100 rounded-full w-full" />
        </div>
      ))}
    </div>
  )
}

function DashboardPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [shopOpen, setShopOpen] = useState(true)
  const prevOrderCountRef = useRef(null)
  const navigate = useNavigate()

  function playNewOrderSound() {
    const context = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [523, 659, 784]
    notes.forEach((freq, i) => {
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(context.destination)
      oscillator.frequency.value = freq
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0, context.currentTime + i * 0.15)
      gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + i * 0.15 + 0.05)
      gainNode.gain.linearRampToValueAtTime(0, context.currentTime + i * 0.15 + 0.4)
      oscillator.start(context.currentTime + i * 0.15)
      oscillator.stop(context.currentTime + i * 0.15 + 0.4)
    })
  }

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      if (prevOrderCountRef.current !== null && data.length > prevOrderCountRef.current) {
        playNewOrderSound()
      }
      prevOrderCountRef.current = data.length
      setOrders(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'shop'), snap => {
      if (snap.exists()) setShopOpen(snap.data().isOpen)
    })
    return () => unsub()
  }, [])

  async function toggleShop() {
    await setDoc(doc(db, 'settings', 'shop'), { isOpen: !shopOpen })
  }

  async function updateStatus(orderId, newStatus) {
    await updateDoc(doc(db, 'orders', orderId), {
      status: newStatus,
      paymentConfirmed: newStatus !== 'pending'
    })
  }

  function handleLogout() {
    sessionStorage.removeItem('sellerAuth')
    navigate('/login')
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

  const pendingCount = orders.filter(o => o.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-lg sm:text-xl font-bold">Seller Dashboard</h1>
            <p className="text-xs sm:text-sm opacity-80">
              {pendingCount} pending order{pendingCount !== 1 ? 's' : ''}
            </p>
          </motion.div>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/menu-management')}
              className="text-xs sm:text-sm bg-white text-orange-500 px-3 sm:px-4 py-2 rounded-full font-semibold hover:bg-orange-50 transition"
            >
              Menu
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleShop}
              className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full font-semibold transition ${
                shopOpen
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-red-100 text-red-500 hover:bg-red-200'
              }`}
            >
              {shopOpen ? '🟢 Open' : '🔴 Closed'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/change-password')}
              className="text-xs sm:text-sm bg-white text-orange-500 px-3 sm:px-4 py-2 rounded-full font-semibold hover:bg-orange-50 transition"
            >
              🔑
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="text-xs sm:text-sm bg-white text-orange-500 px-3 sm:px-4 py-2 rounded-full font-semibold hover:bg-orange-50 transition"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto flex flex-col gap-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', ...STATUS_STEPS].map(s => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(s)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                filter === s
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-500 hover:bg-orange-50'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s === 'pending' && pendingCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5"
                >
                  {pendingCount}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <DashboardSkeleton />
        ) : filteredOrders.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 mt-10"
          >
            No orders here yet.
          </motion.p>
        ) : (
          <AnimatePresence>
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-800">{order.customerName}</p>
                    <p className="text-sm text-gray-400">{order.phone}</p>
                  </div>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[order.status]}`}
                  >
                    {order.status.toUpperCase()}
                  </motion.span>
                </div>

                {/* Items */}
                <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-500">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₦{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2 flex justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-orange-500">₦{order.totalPrice}</span>
                  </div>
                </div>

                {/* Address, Note & Timestamp */}
                <div className="text-sm text-gray-400 flex flex-col gap-1">
                  <p>📍 {order.address}</p>
                  {order.note && <p>📝 {order.note}</p>}
                  {order.createdAt && (
                    <p>🕐 {new Date(order.createdAt.seconds * 1000).toLocaleString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}</p>
                  )}
                </div>

                {/* Action Buttons */}
                {order.status !== 'completed' && (
                  <div className="flex gap-2 flex-wrap">
                    {STATUS_STEPS.map(nextStatus => {
                      const currentIndex = STATUS_STEPS.indexOf(order.status)
                      const nextIndex = STATUS_STEPS.indexOf(nextStatus)
                      if (nextIndex !== currentIndex + 1) return null
                      return (
                        <motion.button
                          key={nextStatus}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateStatus(order.id, nextStatus)}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition"
                        >
                          Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                        </motion.button>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default DashboardPage