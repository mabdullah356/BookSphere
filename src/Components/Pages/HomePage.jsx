import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaChevronRight, FaStar, FaFire, FaArrowRight, FaCalendarAlt, FaClock, FaBookOpen, FaUsers, FaAward, FaQuoteLeft, FaGhost, FaAtom, FaScroll, FaUserAstronaut, FaPalette, FaGlobeAmericas, FaChessKnight, FaUserPlus, FaSearch, FaBookReader, FaUserCircle, FaPaperPlane, FaCheckCircle } from 'react-icons/fa'
import HeroSection from '../HeroSection'

const books = [
    { rank: 1, thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", title: "Atomic Habits", author: "James Clear", genre: "Self Help", rating: 4.9, borrows: "12.4k" },
    { rank: 2, thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", title: "Dune", author: "Frank Herbert", genre: "Fiction", rating: 4.8, borrows: "10.1k" },
    { rank: 3, thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", title: "Sapiens", author: "Yuval Noah Harari", genre: "Science", rating: 4.7, borrows: "9.8k" },
    { rank: 4, thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", title: "1984", author: "George Orwell", genre: "Fiction", rating: 4.8, borrows: "9.2k" },
    { rank: 5, thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", title: "The Alchemist", author: "Paulo Coelho", genre: "Philosophy", rating: 4.6, borrows: "8.7k" },
    { rank: 6, thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", title: "Zero to One", author: "Peter Thiel", genre: "Technology", rating: 4.5, borrows: "7.9k" },
    { rank: 7, thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", title: "Cosmos", author: "Carl Sagan", genre: "Science", rating: 4.7, borrows: "7.4k" },
    { rank: 8, thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", title: "Brave New World", author: "Aldous Huxley", genre: "Fiction", rating: 4.5, borrows: "6.8k" },
    { rank: 9, thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", title: "Thinking Fast & Slow", author: "D. Kahneman", genre: "Psychology", rating: 4.6, borrows: "6.2k" },
    { rank: 10, thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", title: "The 48 Laws of Power", author: "Robert Greene", genre: "Biography", rating: 4.4, borrows: "5.9k" },
]

function TrendingSlider() {
    const ref = useRef(null)

    const scroll = dir => {
        ref.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" })
    }

    return (
        <section className="border-b border-gray-300 py-12">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <FaFire size={18} />
                        <h2 className="text-xl font-bold">trending this week</h2>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => scroll("left")} className="border border-gray-300 rounded-full p-2">
                            <FaChevronLeft size={14} />
                        </button>
                        <button onClick={() => scroll("right")} className="border border-gray-300 rounded-full p-2">
                            <FaChevronRight size={14} />
                        </button>
                    </div>
                </div>

                <div ref={ref} className="flex gap-5 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
                    {books.map(b => (
                        <article key={b.rank} className="min-w-52 border border-gray-300 rounded-xl p-5 flex-shrink-0">
                            <div className="flex items-start justify-between mb-4">
                                <span className="text-5xl font-bold opacity-10">#{b.rank}</span>
                                <span className="border border-gray-300 rounded-full px-3 py-1 text-xs">{b.genre}</span>
                            </div>
                            <img src={b.thumbnail} alt={b.title} className="w-full h-48 object-cover mb-4" />
                            <h3 className="font-bold text-base mb-1 leading-snug">{b.title}</h3>
                            <p className="text-sm mb-4">{b.author}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs">
                                    <FaStar size={11} />
                                    <span className="font-semibold">{b.rating}</span>
                                </div>
                                <span className="text-xs">{b.borrows} borrows</span>
                            </div>
                            <button className="w-full border border-gray-300 rounded-full py-2 text-sm font-semibold mt-4">
                                borrow now
                            </button>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

const genres = [
  { name: 'Fiction', icon: FaChessKnight },
  { name: 'Science', icon: FaAtom },
  { name: 'History', icon: FaScroll },
  { name: 'Fantasy', icon: FaGhost },
  { name: 'Biography', icon: FaUserAstronaut },
  { name: 'Non-Fiction', icon: FaGlobeAmericas },
  { name: 'Art', icon: FaPalette },
]

function CategoriesSection() {
  const navigate = useNavigate()

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-black text-gray-900 mb-4">Browse by Genre</h2>
        <p className="text-gray-500 mb-16 max-w-xl mx-auto">Discover your next favorite read by exploring our diverse range of categories tailored for every mind.</p>
        
        <div className="flex flex-wrap justify-center gap-6">
          {genres.map((genre, i) => {
            const Icon = genre.icon
            return (
              <motion.button
                key={genre.name}
                whileHover={{ y: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/books?category=${genre.name}`)}
                className="group flex flex-col items-center gap-4 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-brand-100 hover:border-brand-100 transition-all min-w-[160px]"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-brand-600 group-hover:text-white transition-all">
                  <Icon size={24} />
                </div>
                <span className="font-extrabold text-gray-900 tracking-tight">{genre.name}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const author = {
    name: "George Orwell",
    photo: "https://upload.wikimedia.org/wikipedia/commons/7/7e/George_Orwell_press_photo.jpg",
    born: "25 June 1903",
    nationality: "British",
    genre: "Fiction, Political Satire",
    bio: "Eric Arthur Blair, known by his pen name George Orwell, was an English novelist, essayist, journalist and critic. His work is characterised by lucid prose, social criticism, opposition to totalitarianism, and support of democratic socialism. He is best known for the allegorical novella Animal Farm and the dystopian novel 1984.",
    quote: "In a time of deceit, telling the truth is a revolutionary act.",
    stats: [
        { icon: FaBookOpen, label: "Books", val: "12" },
        { icon: FaUsers, label: "Readers", val: "2.4M+" },
        { icon: FaStar, label: "Avg Rating", val: "4.8" },
        { icon: FaAward, label: "Awards", val: "15+" },
    ],
    books: [
        { title: "1984", year: 1949, genre: "Dystopian", rating: 4.9 },
        { title: "Animal Farm", year: 1945, genre: "Political Satire", rating: 4.8 },
        { title: "Homage to Catalonia", year: 1938, genre: "Memoir", rating: 4.6 },
        { title: "Down and Out in Paris", year: 1933, genre: "Autobiography", rating: 4.5 },
    ],
}

function FeaturedAuthor() {
    return (
        <section className="border-b border-gray-300 py-14">
            <div className="max-w-6xl mx-auto px-6">

                <div className="flex items-center justify-between mb-10">
                    <div>
                        <span className="border border-gray-300 rounded-full px-4 py-1 text-xs font-semibold mb-3 inline-block">author of the week</span>
                        <h2 className="text-xl font-bold">featured author</h2>
                    </div>
                    <a href="#" className="flex items-center gap-1 text-sm font-semibold">
                        all authors <FaArrowRight size={12} />
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-6 items-start">
                            <img
                                src={author.photo}
                                alt={`${author.name} author photo`}
                                className="w-28 h-28 rounded-xl object-cover border border-gray-300 flex-shrink-0"
                            />
                            <div>
                                <h3 className="text-2xl font-bold mb-1">{author.name}</h3>
                                <p className="text-sm mb-1">{author.nationality} · {author.genre}</p>
                                <p className="text-sm">born: {author.born}</p>
                            </div>
                        </div>

                        <div className="border border-gray-300 rounded-xl p-5">
                            <FaQuoteLeft size={16} className="mb-3 opacity-40" />
                            <p className="text-sm leading-relaxed italic">{author.quote}</p>
                        </div>

                        <p className="text-sm leading-relaxed">{author.bio}</p>

                        <div className="grid grid-cols-4 gap-4">
                            {author.stats.map(({ icon: Icon, label, val }) => (
                                <div key={label} className="border border-gray-300 rounded-xl p-4 text-center">
                                    <Icon size={16} className="mx-auto mb-2" />
                                    <p className="font-bold text-lg leading-none">{val}</p>
                                    <p className="text-xs mt-1">{label}</p>
                                </div>
                            ))}
                        </div>

                        <button className="border border-gray-300 rounded-full py-3 text-sm font-semibold flex items-center justify-center gap-2">
                            view full profile <FaArrowRight size={12} />
                        </button>
                    </div>

                    <div>
                        <h4 className="font-bold text-base mb-4">books by {author.name}</h4>
                        <div className="flex flex-col gap-4">
                            {author.books.map((b, i) => (
                                <article key={b.title} className="border border-gray-300 rounded-xl p-5 flex items-center gap-5">
                                    <span className="text-4xl font-bold opacity-10 w-10 flex-shrink-0">#{i + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h5 className="font-bold text-base">{b.title}</h5>
                                            <span className="border border-gray-300 rounded-full px-3 py-1 text-xs">{b.genre}</span>
                                        </div>
                                        <p className="text-xs mb-3">published {b.year}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-xs">
                                                <FaStar size={11} />
                                                <span className="font-semibold">{b.rating}</span>
                                            </div>
                                            <button className="border border-gray-300 rounded-full px-4 py-1 text-xs font-semibold">
                                                borrow now
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

const featuredBooks = [
  { id: '1', title: 'The Midnight Library', author: 'Matt Haig', cover: 'https://covers.openlibrary.org/b/id/10909258-L.jpg' },
  { id: '2', title: 'Project Hail Mary', author: 'Andy Weir', cover: 'https://covers.openlibrary.org/b/id/10885403-L.jpg' },
  { id: '3', title: 'The Namesake', author: 'Jhumpa Lahiri', cover: 'https://covers.openlibrary.org/b/id/8225229-L.jpg' },
  { id: '4', title: 'Atomic Habits', author: 'James Clear', cover: 'https://covers.openlibrary.org/b/id/12843460-L.jpg' },
  { id: '5', title: 'Dune', author: 'Frank Herbert', cover: 'https://covers.openlibrary.org/b/id/10626353-L.jpg' },
  { id: '6', title: 'Circe', author: 'Madeline Miller', cover: 'https://covers.openlibrary.org/b/id/10543202-L.jpg' },
]

function FeaturedBooks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Featured This Week</h2>
            <div className="w-20 h-1.5 bg-brand-600 rounded-full"></div>
          </div>
          <Link to="/books" className="hidden md:flex items-center gap-2 text-brand-600 font-bold hover:gap-3 transition-all">
            View All Collection <FaArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {featuredBooks.map((book) => (
            <motion.div
              key={book.id}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-6 shadow-sm group-hover:shadow-2xl group-hover:shadow-brand-100 transition-all border border-gray-100">
                <img 
                  src={book.cover} 
                  alt={book.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Link 
                    to={`/books/${book.id}`}
                    className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-sm shadow-xl"
                  >
                    View Details
                  </Link>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-brand-600 transition-colors uppercase tracking-tight">
                {book.title}
              </h3>
              <p className="text-sm text-gray-500 font-medium">{book.author}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 md:hidden">
            <Link to="/books" className="flex items-center justify-center gap-2 text-brand-600 font-bold py-4 border border-brand-100 rounded-2xl">
                Browse More Books <FaArrowRight size={14} />
            </Link>
        </div>
      </div>
    </section>
  )
}

const steps = [
  {
    icon: FaUserPlus,
    title: 'Sign Up',
    desc: 'Create your free account in seconds to join our global reading community.'
  },
  {
    icon: FaSearch,
    title: 'Browse Books',
    desc: 'Explore millions of titles and exclusive merch in our digital catalog.'
  },
  {
    icon: FaBookReader,
    title: 'Borrow & Read',
    desc: 'Borrow your favorites instantly and dive into your next big adventure.'
  }
]

function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-black text-gray-900 mb-20">How Antigravity Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          {/* Connector Line (Desktop Only) */}
          <div className="hidden md:block absolute top-[2.5rem] left-[15%] right-[15%] h-1 bg-gray-50 -z-0"></div>

          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="flex flex-col items-center relative z-10">
                <div className="w-20 h-20 bg-white border-4 border-brand-600 rounded-full flex items-center justify-center text-brand-600 mb-8 shadow-xl shadow-brand-100">
                  <Icon size={30} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight uppercase">{step.title}</h3>
                <p className="text-gray-500 max-w-xs">{step.desc}</p>
                <div className="mt-4 text-xs font-black text-brand-600/20 text-6xl select-none">0{i+1}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const newArrivalsBooks = [
    { title: "The Creative Act", thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", author: "Rick Rubin", genre: "Art", rating: 4.8, addedDaysAgo: 1, pages: 448, available: true },
    { title: "Fourth Wing", thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", author: "Rebecca Yarros", genre: "Fantasy", rating: 4.7, addedDaysAgo: 2, pages: 528, available: true },
    { title: "Intermezzo", thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", author: "Sally Rooney", genre: "Fiction", rating: 4.5, addedDaysAgo: 2, pages: 432, available: false },
    { title: "James", thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", author: "Percival Everett", genre: "Historical", rating: 4.6, addedDaysAgo: 3, pages: 320, available: true },
    { title: "The God of the Woods", thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", author: "Liz Moore", genre: "Mystery", rating: 4.7, addedDaysAgo: 4, pages: 480, available: true },
    { title: "All Fours", thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", author: "Miranda July", genre: "Fiction", rating: 4.4, addedDaysAgo: 5, pages: 352, available: true },
    { title: "Orbital", thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", author: "Samantha Harvey", genre: "Science", rating: 4.6, addedDaysAgo: 6, pages: 256, available: false },
    { title: "The Women", thumbnail: "https://play-lh.googleusercontent.com/QsMMDVoziY8JfvnhmxMgEnYK6UMxMRWI-BESoJMNeaKSd4HGNtuNQvfePmxyax-2mQ=w3840-h2160-rw", author: "Kristin Hannah", genre: "Historical", rating: 4.8, addedDaysAgo: 7, pages: 472, available: true },
]

const label = d => d === 1 ? "today" : d === 2 ? "yesterday" : `${d} days ago`

function NewArrivals() {
    return (
        <section className="border-b border-gray-300 py-14">
            <div className="max-w-6xl mx-auto px-6">

                <div className="flex items-center justify-between mb-4">
                    <div>
                        <span className="border border-gray-300 rounded-full px-4 py-1 text-xs font-semibold mb-3 inline-flex items-center gap-2">
                            <FaCalendarAlt size={11} /> this week
                        </span>
                        <h2 className="text-xl font-bold mt-2">new arrivals</h2>
                    </div>
                    <a href="#" className="flex items-center gap-1 text-sm font-semibold">
                        view all <FaArrowRight size={12} />
                    </a>
                </div>

                <p className="text-sm mb-8">{newArrivalsBooks.length} new books added in the last 7 days</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {newArrivalsBooks.map(b => (
                        <article key={b.title} className="border border-gray-300 rounded-xl p-5 flex flex-col justify-between gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="border border-gray-300 rounded-full px-3 py-1 text-xs">{b.genre}</span>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${b.available ? "border-gray-300" : "border-gray-300 opacity-40"}`}>
                                        {b.available ? "available" : "borrowed"}
                                    </span>
                                </div>
                                <h3 className="font-bold text-base leading-snug mb-1">{b.title}</h3>
                                <p className="text-sm mb-3">{b.author}</p>
                                <img src={b.thumbnail} alt={b.title} className="w-full h-48 object-cover rounded-xl mb-3" />
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1">
                                        <FaStar size={11} />
                                        <span className="font-semibold">{b.rating}</span>
                                    </div>
                                    <span>{b.pages} pages</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-1 text-xs mb-3">
                                    <FaClock size={10} />
                                    <span>added {label(b.addedDaysAgo)}</span>
                                </div>
                                <button
                                    disabled={!b.available}
                                    className={`w-full border border-gray-300 rounded-full py-2 text-sm font-semibold ${!b.available ? "opacity-40 cursor-not-allowed" : ""}`}
                                >
                                    {b.available ? "borrow now" : "join waitlist"}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 5000)
    }
  }

  return (
    <section className="py-24 bg-brand-600 text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">Stay in the Loop</h2>
            <p className="text-brand-100 text-lg font-medium max-w-md">Subscribe to get monthly book recommendations, exclusive shop discounts, and library updates.</p>
          </div>

          <div className="w-full max-w-md relative">
            <AnimatePresence mode="wait">
              {subscribed ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-[2rem] border border-white/20 flex items-center gap-4"
                >
                  <FaCheckCircle className="text-white text-3xl" />
                  <div>
                    <h4 className="font-bold">Subscription Successful!</h4>
                    <p className="text-sm opacity-80">Welcome to the BookSphere newsletter.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.form 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="relative group"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-white text-gray-900 rounded-full px-8 py-5 text-lg font-bold outline-none focus:ring-4 focus:ring-brand-400 transition-all placeholder:text-gray-400"
                    required
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-brand-600 hover:bg-brand-700 text-white px-8 rounded-full font-bold flex items-center gap-2 transition-all"
                  >
                    Join <FaPaperPlane size={14} />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-[0.03] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black opacity-[0.05] rounded-full -translate-x-1/2 translate-y-1/2" />
    </section>
  )
}

const StatItem = ({ value, label, duration = 2 }) => {
  const [count, setCount] = useState(0)
  
  const targetValue = parseInt(value.replace(/,/g, ''))

  useEffect(() => {
    let start = 0
    const end = targetValue
    if (start === end) return

    let totalMiliseconds = duration * 1000
    let incrementTime = (totalMiliseconds / end)

    let timer = setInterval(() => {
      start += Math.ceil(end / 100)
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 50)

    return () => clearInterval(timer)
  }, [targetValue, duration])

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-black mb-1">
        {count.toLocaleString()}{value.includes('+') ? '+' : ''}
      </div>
      <div className="text-xs font-bold uppercase tracking-widest opacity-80">{label}</div>
    </div>
  )
}

function StatsBar() {
  const stats = [
    { value: "50,000+", label: "Total Books" },
    { value: "12,000+", label: "Active Members" },
    { value: "45+", label: "Categories" },
    { value: "850+", label: "Borrowed Today" },
  ]

  return (
    <section className="bg-brand-600 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <StatItem key={i} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}

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
      <TrendingSlider />
      <StatsBar />
      <FeaturedBooks />
      <NewArrivals />
      <CategoriesSection />
      <FeaturedAuthor />
      <HowItWorks />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  )
}

export default HomePage
