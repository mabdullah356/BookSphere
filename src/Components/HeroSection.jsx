import { FaArrowRight, FaBookOpen } from "react-icons/fa"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

import AnimatedHeroSection from "./AnimatedHeroSection"

export default function HeroSection() {
    return (
        <>
        <AnimatedHeroSection />
        <section className="bg-white min-h-[80vh] flex items-center">
            <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 text-brand-600 bg-brand-50 px-4 py-2 rounded-full text-xs font-bold mb-6">
                            <FaBookOpen /> Your gateway to endless stories
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-6">
                            Escape Into <br /> <span className="text-brand-600">Another World</span>
                        </h1>
                        <p className="text-lg text-gray-500 mb-10 max-w-lg leading-relaxed">
                            Discover a vast collection of books and exclusive reader merch. From timeless classics to modern bestsellers, your next adventure starts here.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link 
                                to="/books" 
                                className="w-full sm:w-auto bg-brand-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-700 transition-all shadow-xl shadow-brand-100"
                            >
                                Browse Books <FaArrowRight size={14} />
                            </Link>
                            <Link 
                                to="/shop" 
                                className="w-full sm:w-auto bg-white border border-gray-200 text-gray-900 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                            >
                                Visit Shop
                            </Link>
                        </div>
                    </motion.div>
                </div>

                <div className="flex-1 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10"
                    >
                        <div className="w-full aspect-square bg-brand-600 rounded-[3rem] overflow-hidden flex items-center justify-center p-12">
                            <FaBookOpen className="text-white text-[10rem] opacity-20 absolute" />
                            <img 
                                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2074&auto=format&fit=crop" 
                                alt="Books"
                                className="w-full h-full object-cover rounded-2xl shadow-2xl rotate-3"
                            />
                        </div>
                    </motion.div>
                    
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-brand-50 rounded-full blur-3xl opacity-50" />
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-brand-100 rounded-full blur-3xl opacity-50" />
                </div>
            </div>
        </section>
        </>
    )
}
