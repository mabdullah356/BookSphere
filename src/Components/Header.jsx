import { useState } from "react"
import { FaBookOpen, FaBars, FaTimes, FaShoppingCart } from "react-icons/fa"
import { useCart } from "../Contexts/CartContext"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

const links = [
    { name: "Home", path: "/" },
    { name: "Books", path: "/books" },
    { name: "Shop", path: "/shop" },
    { name: "Contact Us", path: "/contact" }
]

export default function Header() {
    const [open, setOpen] = useState(false)
    const { cartCount } = useCart()

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                
                <Link to="/" className="flex items-center gap-2 text-brand-600 font-black text-2xl tracking-tighter">
                    <FaBookOpen size={28} />
                    <span>BookSphere</span>
                </Link>

                <ul className="hidden md:flex items-center gap-8">
                    {links.map(l => (
                        <li key={l.path}>
                            <Link to={l.path} className="text-gray-600 text-sm font-semibold hover:text-brand-600 transition-colors">
                                {l.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="hidden md:flex items-center gap-6">
                    <div className="relative cursor-pointer text-gray-600 hover:text-brand-600 transition-colors">
                        <FaShoppingCart size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </div>

                </div>

                <div className="flex items-center gap-4 md:hidden">
                    <div className="relative text-gray-600">
                        <FaShoppingCart size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </div>
                    <button className="text-gray-600" onClick={() => setOpen(!open)}>
                        {open ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {open && (
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl z-[60] p-8 md:hidden"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <span className="text-brand-600 font-black text-2xl tracking-tighter flex items-center gap-2">
                                <FaBookOpen size={24} /> BookSphere
                            </span>
                            <button onClick={() => setOpen(false)} className="text-gray-600"><FaTimes size={24} /></button>
                        </div>

                        <ul className="space-y-6 mb-12">
                            {links.map(l => (
                                <li key={l.path}>
                                    <Link to={l.path} onClick={() => setOpen(false)} className="text-gray-900 text-xl font-bold block">
                                        {l.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="pt-8 border-t border-gray-100"></div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {open && <div className="fixed inset-0 bg-black/20 z-[55] md:hidden" onClick={() => setOpen(false)} />}
        </header>
    )
}
