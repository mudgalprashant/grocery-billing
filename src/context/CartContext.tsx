import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { CartItem, Product } from '@/types'

// ─── State ────────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[]
  taxPercent: number
}

const initialState: CartState = { items: [], taxPercent: 0 }

// ─── Actions ─────────────────────────────────────────────────────────────────

type CartAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | { type: 'SET_TAX'; percent: number }
  | { type: 'CLEAR' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.product.id === action.product.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.product.price }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: 1, subtotal: action.product.price }],
      }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.product.id !== action.productId) }
    case 'UPDATE_QTY': {
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.product.id !== action.productId) }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.product.id === action.productId
            ? { ...i, quantity: action.quantity, subtotal: action.quantity * i.product.price }
            : i
        ),
      }
    }
    case 'SET_TAX':
      return { ...state, taxPercent: action.percent }
    case 'CLEAR':
      return initialState
    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[]
  taxPercent: number
  subtotal: number
  taxAmount: number
  total: number
  itemCount: number
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, quantity: number) => void
  setTax: (percent: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const subtotal = state.items.reduce((s, i) => s + i.subtotal, 0)
  const taxAmount = (subtotal * state.taxPercent) / 100
  const total = subtotal + taxAmount

  const value: CartContextValue = {
    items: state.items,
    taxPercent: state.taxPercent,
    subtotal,
    taxAmount,
    total,
    itemCount: state.items.reduce((s, i) => s + i.quantity, 0),
    addItem: (product) => dispatch({ type: 'ADD_ITEM', product }),
    removeItem: (productId) => dispatch({ type: 'REMOVE_ITEM', productId }),
    updateQty: (productId, quantity) => dispatch({ type: 'UPDATE_QTY', productId, quantity }),
    setTax: (percent) => dispatch({ type: 'SET_TAX', percent }),
    clear: () => dispatch({ type: 'CLEAR' }),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
