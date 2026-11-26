import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion'
import { FaArrowLeft, FaCheckCircle, FaMinus, FaPlus, FaShoppingBag, FaTrash } from 'react-icons/fa'
import { useCart } from '../../Contexts/CartContext'

const CART_STORAGE_KEY = 'booksphere.shop.cart.v1'
const SHIPPING_THRESHOLD = 75
const SHIPPING_FEE = 6.95
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const formatCurrency = (value) => {
  const amount = Number(value)
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0)
}

const readStoredCart = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => item && item.key)
      .map((item) => ({
        key: String(item.key),
        id: String(item.id || item.key),
        name: String(item.name || 'Untitled product'),
        type: String(item.type || 'Product'),
        size: String(item.size || 'One size'),
        price: Number(item.price) || 0,
        compareAt: Number(item.compareAt) || Number(item.price) || 0,
        image: String(item.image || ''),
        description: String(item.description || ''),
        quantity: Math.min(Math.max(Math.floor(Number(item.quantity) || 1), 1), 99),
      }))
  } catch {
    return []
  }
}

const writeStoredCart = (items) => {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    return undefined
  }
}

function ProductThumb({ item }) {
  const [failed, setFailed] = useState(false)

  if (failed || !item.image) {
    return (
      <div className="grid h-full w-full place-items-center bg-brand-50 text-brand-600">
        <FaShoppingBag size={28} aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={item.image}
      alt={item.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  )
}

function ProductRow({ item, reduce, onChangeQuantity, onRemove }) {
  return (
    <Motion.li
      layout
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
      transition={{ duration: 0.25 }}
      className="flex gap-4 rounded-[1.75rem] border border-gray-100 bg-white p-4 shadow-[0_12px_40px_-30px_rgba(17,17,17,.45)] sm:gap-6 sm:p-5"
    >
      <div className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-brand-50 sm:h-36 sm:w-32">
        <ProductThumb item={item} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600">
              {item.type}
            </p>
            <h3 className="mt-1 truncate text-base font-black text-gray-900 sm:text-lg">
              {item.name}
            </h3>
            <p className="mt-1 text-xs font-semibold text-gray-400">Size: {item.size}</p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.key)}
            aria-label={`Remove ${item.name} from cart`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <FaTrash size={14} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => onChangeQuantity(item.key, -1)}
              disabled={item.quantity <= 1}
              aria-label={`Decrease quantity of ${item.name}`}
              className="grid h-8 w-8 place-items-center rounded-full text-gray-700 transition hover:bg-white hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaMinus size={11} aria-hidden="true" />
            </button>
            <span aria-live="polite" className="w-9 text-center text-sm font-black text-gray-900">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onChangeQuantity(item.key, 1)}
              aria-label={`Increase quantity of ${item.name}`}
              className="grid h-8 w-8 place-items-center rounded-full text-gray-700 transition hover:bg-white hover:text-brand-600"
            >
              <FaPlus size={11} aria-hidden="true" />
            </button>
          </div>

          <div className="text-right">
            <p className="text-[11px] font-semibold text-gray-400">
              {formatCurrency(item.price)} each
            </p>
            <p className="text-lg font-black text-gray-900">
              {formatCurrency(item.price * item.quantity)}
            </p>
            {item.compareAt > item.price && (
              <p className="text-[11px] font-bold text-brand-600">
                Save {formatCurrency((item.compareAt - item.price) * item.quantity)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Motion.li>
  )
}

export default function CartPage() {
  const reduce = useReducedMotion()
  const { setCartCount } = useCart()
  const [items, setItems] = useState(() => readStoredCart())
  const [orderState, setOrderState] = useState('idle')
  const orderTimer = useRef(null)

  useEffect(() => () => window.clearTimeout(orderTimer.current), [])

  useEffect(() => {
    if (orderState === 'idle') writeStoredCart(items)
  }, [items, orderState])

  const totals = useMemo(() => {
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
    const savings = items.reduce(
      (total, item) => total + Math.max(0, item.compareAt - item.price) * item.quantity,
      0,
    )
    const shipping = items.length === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
    return { subtotal, savings, shipping, total: subtotal + shipping }
  }, [items])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  const syncCartCount = (nextItems) => {
    setCartCount(nextItems.reduce((total, item) => total + item.quantity, 0))
  }

  const changeQuantity = (key, delta) => {
    const next = items
      .map((item) => item.key === key
        ? { ...item, quantity: Math.min(Math.max(item.quantity + delta, 0), 99) }
        : item)
      .filter((item) => item.quantity > 0)
    setItems(next)
    syncCartCount(next)
  }

  const removeItem = (key) => {
    const next = items.filter((item) => item.key !== key)
    setItems(next)
    syncCartCount(next)
  }

  const completeOrder = () => {
    if (!items.length || orderState !== 'idle') return
    setOrderState('processing')
    orderTimer.current = window.setTimeout(() => {
      try {
        window.localStorage.removeItem(CART_STORAGE_KEY)
      } catch {
        return undefined
      }
      setItems([])
      setCartCount(0)
      setOrderState('complete')
    }, reduce ? 400 : 1800)
  }

  return (
    <main className="min-h-screen bg-white px-5 pb-24 pt-14 sm:px-6 lg:pt-20">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-400">
          <Link to="/" className="transition hover:text-brand-600">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-brand-600">Cart</span>
        </nav>

        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-600">
              Your selection
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              Shopping cart
            </h1>
            <p className="mt-3 text-sm font-semibold text-gray-500">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} saved from the shop
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-brand-600 px-8 py-4 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <FaShoppingBag size={14} aria-hidden="true" />
            Shop more
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {orderState === 'complete' ? (
            <Motion.section
              key="complete"
              initial={reduce ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className="rounded-[2.5rem] border border-brand-100 bg-brand-50/60 px-8 py-20 text-center"
            >
              <Motion.div
                initial={reduce ? false : { scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-600 text-white"
              >
                <FaCheckCircle size={36} aria-hidden="true" />
              </Motion.div>
              <h2 className="mt-7 text-4xl font-black tracking-tight text-gray-900">
                Order complete
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-7 text-gray-600">
                Your order has been placed and your saved cart has been cleared.
              </p>
              <Link
                to="/shop"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-brand-700"
              >
                Back to shop
                <FaArrowLeft size={12} aria-hidden="true" className="rotate-180" />
              </Link>
            </Motion.section>
          ) : (
            <Motion.div
              key="cart"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]"
            >
              <section aria-label="Cart items">
                {items.length === 0 ? (
                  <div className="rounded-[2rem] border border-dashed border-gray-200 py-16 text-center">
                    <h2 className="text-2xl font-black text-gray-900">Your cart is empty.</h2>
                    <p className="mt-3 text-sm font-medium text-gray-500">
                      Add products from the shop and they will appear here.
                    </p>
                    <Link
                      to="/shop"
                      className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-600 underline underline-offset-4"
                    >
                      Browse the shop
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-5">
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <ProductRow
                          key={item.key}
                          item={item}
                          reduce={reduce}
                          onChangeQuantity={changeQuantity}
                          onRemove={removeItem}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </section>

              <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-gray-900">Order summary</h2>
                  <dl className="mt-5 space-y-3 text-sm font-semibold text-gray-500">
                    <div className="flex items-center justify-between">
                      <dt>Subtotal</dt>
                      <dd className="font-black text-gray-900">{formatCurrency(totals.subtotal)}</dd>
                    </div>
                    {totals.savings > 0 && (
                      <div className="flex items-center justify-between text-brand-600">
                        <dt>Savings</dt>
                        <dd className="font-black">-{formatCurrency(totals.savings)}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <dt>Shipping</dt>
                      <dd className="font-black text-gray-900">
                        {totals.shipping === 0 ? 'Free' : formatCurrency(totals.shipping)}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">Total</span>
                    <span className="text-2xl font-black text-gray-900">{formatCurrency(totals.total)}</span>
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                    {orderState === 'processing' ? (
                      <Motion.div
                        key="processing"
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-6 rounded-2xl bg-brand-50 px-5 py-4"
                      >
                        <p className="text-xs font-black uppercase tracking-widest text-brand-700">
                          Completing your order…
                        </p>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-100">
                          <Motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: reduce ? 0.2 : 1.6, ease: 'easeInOut' }}
                            className="h-full rounded-full bg-brand-600"
                          />
                        </div>
                      </Motion.div>
                    ) : (
                      <Motion.button
                        key="idle"
                        type="button"
                        onClick={completeOrder}
                        disabled={!items.length}
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        whileHover={reduce ? undefined : { scale: 1.02 }}
                        whileTap={reduce ? undefined : { scale: 0.98 }}
                        className="mt-6 w-full rounded-full bg-brand-600 px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Complete order · {formatCurrency(totals.total)}
                      </Motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </aside>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
