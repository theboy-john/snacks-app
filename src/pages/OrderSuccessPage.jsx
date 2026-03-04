import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function OrderSuccessPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center gap-6 p-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="text-7xl"
      >
        🎉
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl font-bold text-gray-800">Order Placed!</h1>
        <p className="text-gray-500 max-w-sm">
          Your order has been received. Please send your payment via mobile money and we'll process it shortly.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm p-4 w-full max-w-sm text-left flex flex-col gap-2 border border-orange-100"
      >
        <p className="font-bold text-gray-700">💰 Payment Details</p>
        <p className="text-sm text-gray-500">Send payment to:</p>
        <p className="font-bold text-gray-800">MTN MoMo: 08012345678 (Your Name)</p>
        <p className="text-sm text-gray-500">Use your phone number as the reference.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <Link
          to="/track"
          className="text-orange-500 font-semibold text-sm underline text-center"
        >
          Track your order status →
        </Link>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/')}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white px-8 py-4 rounded-2xl font-bold shadow-md hover:shadow-lg transition"
        >
          Back to Menu
        </motion.button>
      </motion.div>
    </div>
  )
}

export default OrderSuccessPage