import { motion, AnimatePresence } from 'framer-motion'
import { useNetworkStatus } from '../context/useNetworkStatus'

function OfflineBanner() {
  const isOnline = useNetworkStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 px-4 text-sm font-semibold"
        >
          📡 No internet connection — please check your network
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OfflineBanner