import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  function addToCart(snack) {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === snack.id)
      if (existing) {
        // If snack already in cart, just increase quantity
        return prev.map(item =>
          item.id === snack.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      // Otherwise add it fresh with quantity 1
      return [...prev, { ...snack, quantity: 1 }]
    })
  }

  function removeFromCart(id) {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  function updateQuantity(id, quantity) {
    if (quantity < 1) return removeFromCart(id)
    setCartItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity } : item)
    )
  }

  function clearCart() {
    setCartItems([])
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}