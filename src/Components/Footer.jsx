import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { FaArrowRight, FaExternalLinkAlt, FaHeart, FaPaperPlane } from "react-icons/fa";

const MotionDiv = motion.div;
const MotionImage = motion.img;
const MotionLink = motion.a;

const INK = "#111111";
const ACCENT = "#994B5C";
const BLUE = "#2F3FC4";
const MUTED = "rgba(17, 17, 17, 0.68)";
const EASE = [0.16, 1, 0.3, 1];
const MARQUEE = ["reader first", "made for book people", "keep turning pages", "see you soon"];

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&display=swap');

.bf-footer {
  position: relative;
  overflow: hidden;
  border-top: 1.5px solid ${INK};
  background: #FFFFFF;
  color: ${INK};
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}
.bf-footer *, .bf-footer *::before, .bf-footer *::after { box-sizing: border-box; }
.bf-footer a { color: inherit; text-decoration: none; }
.bf-footer a:focus-visible { outline: 2px solid ${BLUE}; outline-offset: 4px; }
.bf-footer::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: .055;
  background-image: radial-gradient(${INK} .7px, transparent .8px);
  background-size: 22px 22px;
}
.bf-watermark {
  position: absolute;
  z-index: 0;
  top: -3%;
  left: -2%;
  color: transparent;
  font-family: Inter, sans-serif;
  font-size: clamp(7rem, 18vw, 17rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -.09em;
  white-space: nowrap;
  -webkit-text-stroke: 1px rgba(17, 17, 17, .12);
  pointer-events: none;
  user-select: none;
}
.bf-shell {
  position: relative;
  z-index: 2;
  width: min(1240px, 100%);
  margin: 0 auto;
  padding: clamp(42px, 6vw, 86px) clamp(18px, 4vw, 56px) 26px;
}
.bf-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: clamp(24px, 4vw, 52px);
  padding-bottom: clamp(28px, 4vw, 52px);
  border-bottom: 1.5px solid ${INK};
}
.bf-kicker, .bf-mini {
  margin: 0 0 14px;
  color: ${BLUE};
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .28em;
  text-transform: uppercase;
}
.bf-kicker::before {
  content: "";
  display: inline-block;
  width: 34px;
  height: 2px;
  margin-right: 11px;
  vertical-align: middle;
  background: currentColor;
}
.bf-title {
  margin: 0;
  font-family: "Newsreader", Georgia, "Times New Roman", serif;
  font-size: clamp(3rem, 7vw, 6.8rem);
  font-weight: 300;
  line-height: .88;
  letter-spacing: -.06em;
}
.bf-title em { color: ${ACCENT}; font-weight: 400; }
.bf-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; }
.bf-button {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 58px;
  padding: 7px 7px 7px 22px;
  border: 1px solid ${INK};
  border-radius: 999px;
  background: ${INK};
  color: #FFFFFF;
  cursor: pointer;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .16em;
  text-transform: uppercase;
  transition: background .3s ease, color .3s ease, box-shadow .3s ease;
}
.bf-button:hover { background: #000000; box-shadow: 0 14px 30px -18px ${INK}; }
.bf-footer a.bf-button { color: #FFFFFF; }
.bf-button--ghost { background: #FFFFFF; color: ${INK}; }
.bf-footer a.bf-button--ghost { color: ${INK}; }
.bf-footer a.bf-button--ghost:hover { color: #FFFFFF; }
.bf-button--ghost:hover { background: ${INK}; color: #FFFFFF; }
.bf-button__icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: ${ACCENT};
  color: #FFFFFF;
  font-size: 11px;
  transition: transform .35s cubic-bezier(.16, 1, .3, 1), background .35s ease;
}
.bf-button:hover .bf-button__icon { background: ${BLUE}; transform: rotate(-15deg) scale(1.06); }
.bf-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(290px, .92fr);
  align-items: start;
  gap: clamp(28px, 5vw, 64px);
  padding-top: clamp(32px, 5vw, 64px);
}
.bf-profile {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  align-items: center;
  gap: 22px;
  padding: 22px;
  border: 1.5px solid ${INK};
  background: #FFFFFF;
  box-shadow: 10px 10px 0 ${ACCENT};
}
.bf-portrait {
  width: 110px;
  height: 110px;
  border: 1px solid ${INK};
  border-radius: 50%;
  object-fit: cover;
  object-position: center 25%;
  filter: grayscale(1);
}
.bf-name {
  margin: 0 0 8px;
  font-family: "Newsreader", Georgia, serif;
  font-size: clamp(1.6rem, 3vw, 2.35rem);
  font-weight: 400;
  line-height: 1;
  letter-spacing: -.035em;
}
.bf-bio {
  max-width: 46ch;
  margin: 0;
  color: ${MUTED};
  font-size: 12px;
  line-height: 1.75;
}
.bf-contact { display: flex; flex-direction: column; }
.bf-contact__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 15px 0;
  border-bottom: 1px solid rgba(17, 17, 17, .28);
  transition: color .3s ease, padding-left .3s ease;
}
.bf-contact__link:first-of-type { border-top: 1px solid rgba(17, 17, 17, .28); }
.bf-contact__link:hover { padding-left: 6px; color: ${ACCENT}; }
.bf-contact__link span {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 700;
  text-align: right;
  overflow-wrap: anywhere;
}
.bf-contact__link svg { flex: 0 0 auto; color: ${ACCENT}; transition: transform .3s cubic-bezier(.16, 1, .3, 1); }
.bf-contact__link:hover svg { transform: translate(3px, -3px); }
.bf-marquee {
  overflow: hidden;
  margin-top: clamp(36px, 5vw, 64px);
  border-top: 1.5px solid ${INK};
  border-bottom: 1.5px solid ${INK};
  background: ${ACCENT};
  color: #FFFFFF;
}
.bf-marquee__track { display: flex; width: max-content; animation: bf-marquee 26s linear infinite; }
.bf-marquee__track span {
  display: inline-flex;
  align-items: center;
  gap: 28px;
  padding: 12px 0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .32em;
  text-transform: uppercase;
  white-space: nowrap;
}
.bf-marquee__track i { color: rgba(255, 255, 255, .92); font-style: normal; }
.bf-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding-top: 20px;
  color: ${MUTED};
  font-size: 10px;
  font-weight: 600;
  line-height: 1.6;
}
.bf-bottom p { margin: 0; }
.bf-bottom span { display: inline-flex; align-items: center; gap: 7px; }
.bf-heart { color: ${ACCENT}; }
@keyframes bf-marquee { to { transform: translateX(-50%); } }
@media (max-width: 900px) {
  .bf-top { grid-template-columns: minmax(0, 1fr); align-items: start; }
  .bf-actions { justify-content: flex-start; }
  .bf-grid { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 640px) {
  .bf-title { font-size: clamp(2.6rem, 13vw, 4.2rem); }
  .bf-button { width: 100%; }
  .bf-actions { flex-direction: column; }
  .bf-profile { grid-template-columns: minmax(0, 1fr); justify-items: start; box-shadow: 7px 7px 0 ${ACCENT}; }
  .bf-portrait { width: 88px; height: 88px; }
  .bf-contact__link span { font-size: 11px; }
  .bf-bottom { align-items: flex-start; flex-direction: column; gap: 7px; }
}
@media (prefers-reduced-motion: reduce) {
  .bf-footer *, .bf-footer *::before, .bf-footer *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
}
`;

export default function Footer() {
  const reduceMotion = useReducedMotion();
  const footerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: footerRef, offset: ["start end", "end start"] });
  const watermarkY = useTransform(scrollYProgress, [0, 1], [70, -60]);
  const marquee = [...MARQUEE, ...MARQUEE];

  const reveal = (delay = 0) =>
    reduceMotion
      ? { initial: false }
      : {
          initial: { opacity: 0, y: 26 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <footer ref={footerRef} className="bf-footer">
      <style>{STYLES}</style>
      <MotionDiv className="bf-watermark" aria-hidden="true" style={{ y: reduceMotion ? 0 : watermarkY }}>
        READ ON
      </MotionDiv>

      <div className="bf-shell">
        <MotionDiv {...reveal(0)} className="bf-top">
          <div>
            <p className="bf-kicker">The last page / for now</p>
            <h2 className="bf-title">Keep the story <em>going.</em></h2>
          </div>
          <div className="bf-actions">
            <MotionLink
              href="mailto:abdullahworld111@gmail.com"
              className="bf-button"
              whileHover={reduceMotion ? undefined : { y: -3 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              Say hello
              <span className="bf-button__icon"><FaPaperPlane /></span>
            </MotionLink>
            <MotionLink
              href="https://muhammad-abdullah-me.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="bf-button bf-button--ghost"
              whileHover={reduceMotion ? undefined : { y: -3 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              Portfolio
              <span className="bf-button__icon"><FaExternalLinkAlt /></span>
            </MotionLink>
          </div>
        </MotionDiv>

        <div className="bf-grid">
          <MotionDiv {...reveal(0.08)} className="bf-profile">
            <MotionImage
              src="/abdullah.jpg"
              alt="Muhammad Abdullah"
              className="bf-portrait"
              whileHover={reduceMotion ? undefined : { scale: 1.05, rotate: 2 }}
              transition={{ duration: 0.3 }}
            />
            <div>
              <p className="bf-mini">A note from the developer</p>
              <h3 className="bf-name">Muhammad Abdullah</h3>
              <p className="bf-bio">
                I create playful, animated websites with thoughtful details and smooth interactions.
              </p>
            </div>
          </MotionDiv>

          <MotionDiv {...reveal(0.16)} className="bf-contact">
            <p className="bf-mini">Direct lines</p>
            <a className="bf-contact__link" href="mailto:abdullahworld111@gmail.com">
              <span>abdullahworld111@gmail.com</span>
              <FaArrowRight aria-hidden="true" />
            </a>
            <a
              className="bf-contact__link"
              href="https://muhammad-abdullah-me.vercel.app/"
              target="_blank"
              rel="noreferrer"
            >
              <span>muhammad-abdullah-me.vercel.app</span>
              <FaArrowRight aria-hidden="true" />
            </a>
          </MotionDiv>
        </div>

        <div className="bf-marquee" aria-hidden="true">
          <div className="bf-marquee__track">
            {marquee.map((item, index) => (
              <span key={`${item}-${index}`}>
                {item} <i>—</i>
              </span>
            ))}
          </div>
        </div>

        <MotionDiv {...reveal(0.24)} className="bf-bottom">
          <p>Made with curiosity, tiny details, and a soft spot for good stories.</p>
          <span>
            © {new Date().getFullYear()} BookSphere · Built with
            <FaHeart aria-label="love" className="bf-heart" />
          </span>
        </MotionDiv>
      </div>
    </footer>
  );
}
