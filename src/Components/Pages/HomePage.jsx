import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaStar, FaQuoteLeft,FaUserCircle, } from 'react-icons/fa'
import HeroSection from '../HeroSection'

const testimonials = [
  {
    name: 'Sarah Jenkins',
    role: 'Literature Student',
    quote: 'BookSphere has completely changed how I access research material. The library is vast and the shop merch is actually high quality!',
    rating: 5
  },
  {
    name: 'Marcus Chen',
    role: 'Avid Reader',
    quote: 'The interface is so clean. I love how I can browse by genre so easily and discover hidden gems I would never find otherwise.',
    rating: 5
  },
  {
    name: 'Elena Rodriguez',
    role: 'Teacher',
    quote: "A must-have for anyone who lives between the pages. The borrowing process is seamless and the community is wonderful.",
    rating: 5
  }
]

function TestimonialsSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-black text-gray-900 mb-20">What Our Readers Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center relative">
              <div className="absolute -top-6 bg-brand-600 text-white p-4 rounded-2xl shadow-lg shadow-brand-100">
                <FaQuoteLeft />
              </div>
              
              <div className="mb-6 flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <FaStar key={i} className="text-amber-400" size={14} />
                ))}
              </div>
              
              <p className="text-gray-600 italic mb-8 leading-relaxed">"{t.quote}"</p>
              
              <div className="flex items-center gap-3">
                <FaUserCircle size={40} className="text-gray-200" />
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 leading-none mb-1 uppercase tracking-tight">{t.name}</h4>
                  <p className="text-xs font-medium text-brand-600">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const HomePage = () => {
  return (
    <div className="bg-white">
      <HeroSection />
      <TestimonialsSection />
    </div>
  )
}

export default HomePage
