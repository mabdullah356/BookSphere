import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaRedo } from 'react-icons/fa'
import { useCart } from '../../Contexts/CartContext'
import AnimatedShopHero from '../AnimatedShopHero'
import ClothCard from '../ClothCard'

const categories = ['All', 'Sweatshirts', 'T-Shirts', 'Accessories']
const sortOptions = [
  { label: 'Bestseller', value: 'bestseller' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
]

const STORE = 'https://thebooksphere.com'
const COLLECTIONS = [
  { handle: 'sweatshirts', type: 'Sweatshirts' },
  { handle: 't-shirts', type: 'T-Shirts' },
  { handle: 'accessories', type: 'Accessories' },
]
const CACHE_KEY = 'bs-shop-products-v4'
const CACHE_TTL = 20 * 60 * 1000

const DESCRIPTIONS = {
  Sweatshirts:
    'Heavyweight fleece, brushed inside and embroidered in small batches for readers who like to wear their shelves.',
  'T-Shirts':
    'Organic cotton jersey, garment-washed for an easy hand and printed with archival ink that softens with time.',
  Accessories:
    'Everyday carry for the chronically bookmarked. Canvas, cotton and quiet details, built to age well.',
}

const shopImg = (url, width = 1000) => {
  if (!url) return ''
  if (!url.includes('cdn.shopify.com')) return url
  return `${url}${url.includes('?') ? '&' : '?'}width=${width}`
}

const stripHtml = (html) => {
  if (!html) return ''
  if (typeof document === 'undefined') {
    return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  const el = document.createElement('div')
  el.innerHTML = html
  return (el.textContent || '').replace(/\s+/g, ' ').trim()
}

const trimText = (value, max) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text
}

const readCache = () => {
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.at || Date.now() - parsed.at > CACHE_TTL) return null
    return Array.isArray(parsed.items) && parsed.items.length ? parsed.items : null
  } catch {
    return null
  }
}

const writeCache = (items) => {
  try {
    window.sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ at: Date.now(), items }),
    )
  } catch {
    /* storage unavailable */
  }
}

function mapProduct(product, type) {
  if (!product || !product.handle || !product.title) return null

  const variants = Array.isArray(product.variants) ? product.variants : []
  const prices = variants
    .map((variant) => Number.parseFloat(variant && variant.price))
    .filter((value) => Number.isFinite(value))
  const compares = variants
    .filter((variant) => variant && variant.compare_at_price)
    .map((variant) => Number.parseFloat(variant.compare_at_price))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)
  const price = prices.length ? Math.min(...prices) : 0
  const compareAt = compares.length && compares[0] > price ? compares[0] : null

  const images = (Array.isArray(product.images) ? product.images : [])
    .map((image) => (typeof image === 'string' ? image : image && image.src))
    .filter(Boolean)
    .map((src) => shopImg(src, 1000))

  const sizes = new Set()
  const colors = new Set()
  variants.forEach((variant) => {
    const chunks = String((variant && variant.title) || '')
      .split(/\s*\/\s*|\s*,\s*/)
      .map((part) => part.trim())
      .filter((part) => part && !/^default title$/i.test(part))
    chunks.forEach((chunk) => {
      if (/^(xxs|xs|s|m|l|xl|xxl|xxxl|2xl|3xl|4xl|5xl|one size)$/i.test(chunk)) {
        sizes.add(/^one size$/i.test(chunk) ? 'One size' : chunk.toUpperCase())
      } else {
        colors.add(chunk)
      }
    })
  })
  ;(Array.isArray(product.options) ? product.options : []).forEach((option) => {
    if (!option || typeof option === 'string') return
    if (/colou?r/i.test(option.name || '') && Array.isArray(option.values)) {
      option.values.forEach((value) => value && colors.add(String(value)))
    }
  })

  const tags = String(product.tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  const bestseller = tags.find((tag) => /bestseller/i.test(tag))
  const fresh = tags.find((tag) => /^new\b|new arrival/i.test(tag))
  const signature = tags.find((tag) => /signature/i.test(tag))
  const badge = bestseller
    ? 'Bestseller'
    : fresh
      ? 'New arrival'
      : signature
        ? 'Signature'
        : null

  const body = trimText(stripHtml(product.body_html), 220)

  return {
    id: String(product.id || product.handle),
    name: product.title,
    handle: product.handle,
    type,
    price,
    compareAt,
    image: images[0] || '',
    images,
    sizes: sizes.size
      ? Array.from(sizes)
      : type === 'Accessories'
        ? ['One size']
        : ['S', 'M', 'L', 'XL'],
    colors: Array.from(colors),
    badge,
    desc: body || DESCRIPTIONS[type],
    vendor: product.vendor || 'The Booksphere',
    tags,
  }
}

async function readCollection(collection, signal) {
  const response = await fetch(
    `${STORE}/collections/${collection.handle}/products.json?limit=20`,
    { headers: { Accept: 'application/json' }, signal },
  )
  if (!response.ok) throw new Error(`${response.status} on ${collection.handle}`)
  const data = await response.json()
  return (Array.isArray(data && data.products) ? data.products : [])
    .map((product) => mapProduct(product, collection.type))
    .filter(Boolean)
}

async function loadProducts(signal) {
  const settled = await Promise.allSettled(
    COLLECTIONS.map((collection) => readCollection(collection, signal)),
  )
  const buckets = settled.map((result) =>
    result.status === 'fulfilled' && Array.isArray(result.value)
      ? result.value
      : [],
  )
  const max = buckets.reduce(
    (longest, bucket) => Math.max(longest, bucket.length),
    0,
  )
  const merged = []
  for (let index = 0; index < max; index += 1) {
    buckets.forEach((bucket) => {
      if (bucket[index]) merged.push(bucket[index])
    })
  }
  return merged
}

function FilterBar({
  activeCategory,
  setActiveCategory,
  activeSort,
  setActiveSort,
  products,
}) {
  const counts = useMemo(() => {
    const next = { All: products.length }
    categories.slice(1).forEach((category) => {
      next[category] = products.filter((product) => product.type === category)
        .length
    })
    return next
  }, [products])

  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#17100E]/95 backdrop-blur-md border-b border-white/10 py-5"
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-5">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = activeCategory === cat
            return (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileTap={{ scale: 0.94 }}
                aria-pressed={active}
                className={`relative px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${
                  active
                    ? 'text-white'
                    : 'text-[#F6EFDF]/70 hover:text-[#F6EFDF] bg-white/5 hover:bg-white/10'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="shop-cat-pill"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    className="absolute inset-0 bg-brand-600 rounded-full shadow-lg shadow-brand-100"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {cat}
                  <span
                    className={`text-[10px] font-black ${
                      active ? 'text-white' : 'text-[#F6EFDF]/80'
                    }`}
                  >
                    {counts[cat] ?? 0}
                  </span>
                </span>
              </motion.button>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-4"
        >
          <span className="text-xs font-black uppercase text-[#F6EFDF]/70 tracking-widest">
            Sort by:
          </span>
          <select
            aria-label="Sort products"
            value={activeSort}
            onChange={(event) => setActiveSort(event.target.value)}
            className="bg-white border border-transparent rounded-xl px-4 py-2.5 text-sm font-bold text-[#17100E] outline-none focus:border-brand-600 transition-all cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </motion.div>
      </div>
    </motion.div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[4/5] rounded-[2rem] bg-white/10 border border-white/10 mb-6" />
          <div className="px-2 space-y-3">
            <div className="h-2.5 w-20 rounded-full bg-white/10" />
            <div className="h-4 w-4/5 rounded-full bg-white/10" />
            <div className="h-6 w-24 rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorPanel({ onRetry }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-16 text-center">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-[#E9A9A1]">
        The rack is offline
      </p>
      <h3 className="mt-4 text-2xl font-black text-[#F6EFDF]">
        We couldn&apos;t load the collection.
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#F6EFDF]/65">
        Check your connection and try again. The featured pieces above are still
        available to explore.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-brand-700"
      >
        <FaRedo size={10} /> Try again
      </button>
    </div>
  )
}

function ProductGrid({
  products,
  loading,
  error,
  onRetry,
  activeCategory,
  setActiveCategory,
  activeSort,
}) {
  const { addToCart } = useCart()

  const filteredProducts = useMemo(() => {
    const list = products.filter(
      (product) =>
        activeCategory === 'All' || product.type === activeCategory,
    )
    const sorted = [...list]
    if (activeSort === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price)
    } else if (activeSort === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price)
    } else if (activeSort === 'newest') {
      sorted.sort((a, b) =>
        String(b.id).localeCompare(String(a.id), undefined, { numeric: true }),
      )
    }
    return sorted
  }, [products, activeCategory, activeSort])

  return (
    <section id="shop-grid" className="py-16 md:py-20 bg-transparent scroll-mt-[136px]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E9A9A1]">
              The collection
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#F6EFDF] md:text-3xl">
              Printed for readers
            </h2>
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-[#F6EFDF]/70">
            {loading && !products.length
              ? 'Loading pieces'
              : `${filteredProducts.length} ${
                  filteredProducts.length === 1 ? 'piece' : 'pieces'
                }`}
          </span>
        </div>

        {error && products.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#A7545F]/40 bg-[#A7545F]/10 px-5 py-4">
            <p className="text-sm font-semibold text-[#E9A9A1]">
              Couldn&apos;t refresh the live rack — showing saved pieces.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E9A9A1] underline underline-offset-4"
            >
              <FaRedo size={10} /> Refresh
            </button>
          </div>
        )}

        {!products.length && loading ? (
          <GridSkeleton />
        ) : !products.length && error ? (
          <ErrorPanel onRetry={onRetry} />
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/15 py-16 text-center">
            <p className="text-sm font-semibold text-[#F6EFDF]/65">
              Nothing in this collection yet.
            </p>
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className="mt-4 text-xs font-black uppercase tracking-widest text-[#E9A9A1] underline underline-offset-4"
            >
              Show everything
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ClothCard
                  key={product.id}
                  product={product}
                  onAdd={addToCart}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeSort, setActiveSort] = useState('bestseller')
  const [products, setProducts] = useState(() => readCache() || [])
  const [loading, setLoading] = useState(() => products.length === 0)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let alive = true
    loadProducts(controller.signal)
      .then((rows) => {
        if (!alive) return
        if (!rows.length) {
          setError(true)
          return
        }
        setProducts(rows)
        writeCache(rows)
        setError(false)
      })
      .catch((cause) => {
        if (!alive || (cause && cause.name === 'AbortError')) return
        setError(true)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
      controller.abort()
    }
  }, [attempt])

  const retry = () => {
    setError(false)
    setLoading(true)
    setAttempt((value) => value + 1)
  }

  const browse = () => {
    const el = document.getElementById('shop-grid')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="bg-white min-h-screen">
      <AnimatedShopHero
        items={products}
        onBrowse={browse}
        autoFetch={false}
      />
      <FilterBar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeSort={activeSort}
        setActiveSort={setActiveSort}
        products={products}
      />
      <ProductGrid
        products={products}
        loading={loading}
        error={error}
        onRetry={retry}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeSort={activeSort}
      />
    </main>
  )
}
