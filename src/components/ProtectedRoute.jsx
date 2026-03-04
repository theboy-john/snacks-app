import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const isAuth = sessionStorage.getItem('sellerAuth') === 'true'

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute