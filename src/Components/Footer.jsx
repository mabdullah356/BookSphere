import { FaArrowRight, FaHeart } from "react-icons/fa"
import { motion, useReducedMotion } from "framer-motion"

const MotionDiv = motion.div
const MotionImage = motion.img
const MotionLink = motion.a

export default function Footer() {
    const reduceMotion = useReducedMotion()

    return (
        <footer className="relative overflow-hidden border-t border-[#17100E]/10 bg-[#17100E] text-[#F6EFDF]">
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,.7)_0.5px,transparent_0.7px)] [background-size:4px_4px]" />
            <MotionDiv
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="relative mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-12"
            >
                <div className="flex flex-col gap-8 border-b border-[#F6EFDF]/15 pb-8 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-5">
                        <MotionImage
                            src="/abdullah.jpg"
                            alt="Muhammad Abdullah"
                            className="h-20 w-20 rounded-full border border-[#A7545F]/70 object-cover object-[center_25%] shadow-lg shadow-black/20"
                            whileHover={reduceMotion ? undefined : { scale: 1.05, rotate: 2 }}
                            transition={{ duration: 0.3 }}
                        />
                        <div>
                            <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#E9A9A1]">
                                A note from the developer
                            </p>
                            <h2 className="font-serif text-2xl tracking-tight md:text-3xl">
                                Muhammad Abdullah
                            </h2>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#F6EFDF]/70">
                                I create playful, animated websites with thoughtful details and smooth interactions.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 md:justify-end">
                        <MotionLink
                            href="mailto:abdullahworld111@gmail.com"
                            className="inline-flex items-center gap-2 rounded-full border border-[#F6EFDF]/25 px-5 py-3 text-xs font-semibold tracking-wide transition hover:border-[#E9A9A1] hover:text-[#E9A9A1]"
                            whileHover={reduceMotion ? undefined : { y: -3 }}
                            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                        >
                            abdullahworld111@gmail.com
                            <FaArrowRight aria-hidden="true" size={11} />
                        </MotionLink>
                        <MotionLink
                            href="https://muhammad-abdullah-me.vercel.app/"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-[#F6EFDF] px-5 py-3 text-xs font-semibold tracking-wide text-[#17100E] transition hover:bg-[#E9A9A1]"
                            whileHover={reduceMotion ? undefined : { y: -3 }}
                            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                        >
                            Visit my portfolio
                            <FaArrowRight aria-hidden="true" size={11} />
                        </MotionLink>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-5 text-xs text-[#F6EFDF]/55 sm:flex-row sm:items-center sm:justify-between">
                    <p>Made with curiosity, tiny details, and a soft spot for good stories.</p>
                    <p className="inline-flex items-center gap-1.5">
                        © {new Date().getFullYear()} BookSphere · Built with
                        <FaHeart aria-label="love" className="text-[#E9A9A1]" size={10} />
                    </p>
                </div>
            </MotionDiv>
        </footer>
    )
}
