import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion"
import { FaBookOpen, FaBars, FaTimes, FaShoppingCart } from "react-icons/fa"
import { useCart } from "../Contexts/CartContext"

const links = [
    { name: "Home", path: "/" },
    { name: "Books", path: "/books" },
    { name: "Shop", path: "/shop" },
    { name: "Contact Us", path: "/contact" },
]

const spring = { type: "spring", stiffness: 420, damping: 34 }
const ease = [0.16, 1, 0.3, 1]
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70"

function Logo({ reduce, onClick }) {
    return (
        <Link to="/" onClick={onClick} aria-label="BookSphere home" className={`group flex items-center gap-2.5 ${focusRing}`}>
            <motion.span
                whileHover={reduce ? undefined : { rotate: -8, scale: 1.06 }}
                transition={spring}
                className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-[0_6px_18px_-8px_rgba(153,75,92,.9)]"
            >
                <FaBookOpen size={18} aria-hidden="true" />
            </motion.span>
            <span className="text-[22px] font-black tracking-tighter text-gray-900">
                Book<span className="text-brand-600">Sphere</span>
            </span>
        </Link>
    )
}

function Cart({ count, reduce }) {
    return (
        <motion.div
            whileHover={reduce ? undefined : { y: -2 }}
            transition={spring}
            role="img"
            aria-label={`Shopping cart, ${count} ${count === 1 ? "item" : "items"}`}
            className="relative text-gray-600 transition-colors hover:text-brand-600"
        >
            <FaShoppingCart size={20} aria-hidden="true" />
            <AnimatePresence>
                {count > 0 && (
                    <motion.span
                        key={count}
                        initial={reduce ? false : { scale: 0.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={reduce ? undefined : { scale: 0.3, opacity: 0 }}
                        transition={spring}
                        className="absolute -right-2.5 -top-2.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white"
                    >
                        {count}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default function Header() {
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [hidden, setHidden] = useState(false)
    const { cartCount } = useCart()
    const { pathname } = useLocation()
    const reduce = useReducedMotion()
    const { scrollY, scrollYProgress } = useScroll()
    const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 40 })
    const lastY = useRef(0)
    const toggleRef = useRef(null)
    const menuRef = useRef(null)
    const closeRef = useRef(null)

    useMotionValueEvent(scrollY, "change", value => {
        if (open) return
        const delta = value - lastY.current
        lastY.current = value
        setScrolled(value > 8)
        if (reduce || value < 96) setHidden(false)
        else if (delta > 6) setHidden(true)
        else if (delta < -4) setHidden(false)
    })

    useEffect(() => {
        setOpen(false)
    }, [pathname])

    useEffect(() => {
        const query = matchMedia("(min-width: 768px)")
        const onChange = event => event.matches && setOpen(false)
        query.addEventListener("change", onChange)
        return () => query.removeEventListener("change", onChange)
    }, [])

    useEffect(() => {
        if (!open) return
        const previous = document.activeElement
        const overflow = document.body.style.overflow
        const padding = document.body.style.paddingRight
        const gap = window.innerWidth - document.documentElement.clientWidth
        document.body.style.overflow = "hidden"
        if (gap > 0) document.body.style.paddingRight = `${gap}px`
        closeRef.current?.focus()
        const onKey = event => {
            if (event.key === "Escape") {
                setOpen(false)
                return
            }
            if (event.key !== "Tab" || !menuRef.current) return
            const items = [...menuRef.current.querySelectorAll("a[href], button:not([disabled])")]
            if (!items.length) return
            const first = items[0]
            const last = items[items.length - 1]
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first.focus()
            }
        }
        window.addEventListener("keydown", onKey)
        return () => {
            document.body.style.overflow = overflow
            document.body.style.paddingRight = padding
            window.removeEventListener("keydown", onKey)
            if (previous instanceof HTMLElement && document.contains(previous)) previous.focus()
        }
    }, [open])

    const active = path => (path === "/" ? pathname === "/" : pathname.startsWith(path))

    return (
        <>
            <motion.header
                initial={reduce ? false : { y: -88, opacity: 0 }}
                animate={{ y: reduce || !hidden ? 0 : -88, opacity: 1 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 32, opacity: { duration: 0.4, ease } }}
                onFocusCapture={() => setHidden(false)}
                className={`sticky top-0 z-50 ${scrolled ? "bg-white/85 shadow-[0_12px_32px_-20px_rgba(17,17,17,.35)] backdrop-blur-xl" : "bg-white"} transition-[background-color,box-shadow] duration-300`}
            >
                <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gray-200 transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-60"}`} />
                <motion.div style={{ scaleX: reduce ? scrollYProgress : progress }} className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left bg-brand-600/80" />

                <nav aria-label="Primary" className="relative mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-6">
                    <Logo reduce={reduce} />

                    <ul className="hidden items-center gap-1 md:flex">
                        {links.map(link => {
                            const current = active(link.path)
                            return (
                                <li key={link.path} className="relative">
                                    <Link
                                        to={link.path}
                                        aria-current={current ? "page" : undefined}
                                        className={`group relative flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors ${focusRing} ${current ? "text-brand-700" : "text-gray-600 hover:text-gray-900"}`}
                                    >
                                        {current && <motion.span layoutId="nav-pill" transition={reduce ? { duration: 0 } : spring} className="absolute inset-0 rounded-full bg-brand-50" />}
                                        <span className="relative">{link.name}</span>
                                        <span className={`absolute inset-x-4 -bottom-1 h-px origin-left bg-brand-600 transition-transform duration-300 ${current ? "scale-x-0" : "scale-x-0 group-hover:scale-x-100"}`} />
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>

                    <div className="hidden items-center gap-1 md:flex">
                        <Cart count={cartCount} reduce={reduce} />
                    </div>

                    <div className="flex items-center gap-3 md:hidden">
                        <Cart count={cartCount} reduce={reduce} />
                        <motion.button
                            ref={toggleRef}
                            type="button"
                            onClick={() => setOpen(true)}
                            aria-label="Open menu"
                            aria-expanded={open}
                            aria-controls="mobile-menu"
                            whileTap={reduce ? undefined : { scale: 0.92 }}
                            className={`grid h-10 w-10 place-items-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 ${focusRing}`}
                        >
                            <FaBars size={20} aria-hidden="true" />
                        </motion.button>
                    </div>
                </nav>
            </motion.header>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="scrim"
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduce ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={() => setOpen(false)}
                        aria-hidden="true"
                        className="fixed inset-0 z-[55] bg-gray-950/35 backdrop-blur-sm md:hidden"
                    />
                )}
                {open && (
                    <motion.div
                        key="menu"
                        ref={menuRef}
                        id="mobile-menu"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="mobile-menu-title"
                        initial={reduce ? false : { x: "100%" }}
                        animate={{ x: 0 }}
                        exit={reduce ? undefined : { x: "100%" }}
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 32 }}
                        className="fixed inset-y-0 right-0 z-[60] flex w-[86%] max-w-sm flex-col bg-white p-6 shadow-2xl md:hidden"
                    >
                        <h2 id="mobile-menu-title" className="sr-only">Menu</h2>
                        <div className="flex items-center justify-between">
                            <Logo reduce={reduce} onClick={() => setOpen(false)} />
                            <motion.button
                                ref={closeRef}
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Close menu"
                                whileTap={reduce ? undefined : { scale: 0.92 }}
                                className={`grid h-10 w-10 place-items-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 ${focusRing}`}
                            >
                                <FaTimes size={18} aria-hidden="true" />
                            </motion.button>
                        </div>

                        <motion.ul
                            initial={reduce ? false : "hidden"}
                            animate="show"
                            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } } }}
                            className="mt-10 space-y-1"
                        >
                            {links.map((link, index) => {
                                const current = active(link.path)
                                return (
                                    <motion.li key={link.path} variants={{ hidden: { opacity: 0, x: 24 }, show: { opacity: 1, x: 0, transition: { duration: 0.35, ease } } }}>
                                        <Link
                                            to={link.path}
                                            onClick={() => setOpen(false)}
                                            aria-current={current ? "page" : undefined}
                                            className={`flex items-center justify-between rounded-xl px-4 py-4 text-2xl font-bold transition-colors ${focusRing} ${current ? "bg-brand-50 text-brand-700" : "text-gray-900 hover:bg-gray-50"}`}
                                        >
                                            <span>{link.name}</span>
                                            <span className={`text-xs font-semibold ${current ? "text-brand-600" : "text-gray-300"}`}>{`0${index + 1}`}</span>
                                        </Link>
                                    </motion.li>
                                )
                            })}
                        </motion.ul>

                        <div className="mt-auto border-t border-gray-100 pt-6">
                            <Link to="/books" onClick={() => setOpen(false)} className={`flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 ${focusRing}`}>
                                Browse Books
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
