import { createElement, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  FaArrowRight,
  FaCheck,
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaShieldAlt,
  FaSpinner,
  FaTimes,
  FaWhatsapp,
} from "react-icons/fa";
import gsap from "gsap";

const Motion = motion;

const INK = "#111111";
const ACCENT = "#994B5C";
const BLUE = "#2F3FC4";
const MUTED = "rgba(17, 17, 17, 0.62)";
const MAX_MESSAGE = 1200;
const CONTACT_EMAIL = "abdullahworld111@gmail.com";
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || "";
const EASE = [0.16, 1, 0.3, 1];
const SUBJECTS = ["General question", "Order support", "Wholesale", "Press & books"];
const FIELDS = ["name", "email", "phone", "subject", "message"];
const MARQUEE = ["letters welcome", "book talk", "orders & ideas", "say hello"];
const INITIAL = {
  name: "",
  email: "",
  phone: "",
  subject: "General question",
  message: "",
  company: "",
};

const CONTACTS = [
  {
    icon: FaEnvelope,
    label: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    meta: "Best for questions with details",
  },
  {
    icon: FaWhatsapp,
    label: "WhatsApp",
    value: "+92 315 6215289",
    href: `https://wa.me/923156215289?text=${encodeURIComponent("Hello BookSphere, I have a question.")}`,
    meta: "Mon – Sat, 9am – 6pm",
  },
  {
    icon: FaMapMarkerAlt,
    label: "Studio",
    value: "NUML Faisalabad Campus ,Faisalabad , Pakistan",
    href: "https://www.google.com/maps/place/NUML+Faisalabad+Campus/@31.3959606,73.1561393,17z/data=!3m1!4b1!4m6!3m5!1s0x3922670dc167e1f5:0x38f9e2c3bf402ccf!8m2!3d31.395956!4d73.1587142!16s%2Fg%2F11fwdftfxw?entry=ttu&g_ep=EgoyMDI2MTExOC4xIKXMDSoASAFQAw%3D%3D",
    meta: "Visits by appointment",
  },
];

const HOURS = [
  ["Monday — Friday", "09:00 — 18:00"],
  ["Saturday", "10:00 — 16:00"],
  ["Sunday", "Closed"],
];

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&display=swap');

.cs-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #FFFFFF;
  color: ${INK};
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
}
.cs-page *, .cs-page *::before, .cs-page *::after { box-sizing: border-box; }
.cs-page button, .cs-page input, .cs-page textarea { font: inherit; }
.cs-page button:focus-visible, .cs-page a:focus-visible {
  outline: 2px solid ${BLUE};
  outline-offset: 4px;
}
.cs-page input:focus, .cs-page input:focus-visible, .cs-page textarea:focus, .cs-page textarea:focus-visible {
  outline: none;
  box-shadow: none;
}
.cs-page::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: .055;
  pointer-events: none;
  background-image: radial-gradient(${INK} .7px, transparent .8px);
  background-size: 23px 23px;
}
.cs-page::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: linear-gradient(90deg, transparent calc(25% - 1px), rgba(17,17,17,.055) 25%, transparent calc(25% + 1px));
  background-size: 25% 100%;
}
.cs-cursor {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  width: 34px;
  height: 34px;
  border: 1px solid ${ACCENT};
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  mix-blend-mode: multiply;
}
.cs-glow {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: min(48vw, 520px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(153, 75, 92, .14), transparent 68%);
  filter: blur(30px);
  pointer-events: none;
}
.cs-shell {
  position: relative;
  z-index: 2;
  width: min(1240px, 100%);
  margin: 0 auto;
  padding: clamp(30px, 4.2vw, 60px) clamp(18px, 4vw, 56px) clamp(60px, 7vw, 104px);
}
.cs-top {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 18px;
  padding-bottom: 15px;
  border-bottom: 1px solid ${INK};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .22em;
  text-transform: uppercase;
}
.cs-top__brand { letter-spacing: .16em; }
.cs-top__middle { color: ${MUTED}; }
.cs-top__live { display: inline-flex; justify-self: end; align-items: center; gap: 9px; }
.cs-top__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #5E7A4B;
  box-shadow: 0 0 0 0 rgba(94, 122, 75, .55);
  animation: cs-pulse 2.8s ease-out infinite;
}
.cs-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.28fr) minmax(270px, .72fr);
  align-items: center;
  gap: clamp(20px, 4vw, 60px);
  padding: clamp(50px, 7.5vw, 106px) 0 clamp(40px, 5.2vw, 72px);
}
.cs-hero__watermark {
  position: absolute;
  z-index: 0;
  top: 8%;
  right: -3%;
  color: transparent;
  font-family: Inter, sans-serif;
  font-size: clamp(9rem, 21vw, 20rem);
  font-weight: 800;
  line-height: .8;
  letter-spacing: -.085em;
  white-space: nowrap;
  -webkit-text-stroke: 1px rgba(17, 17, 17, .13);
  pointer-events: none;
  user-select: none;
}
.cs-hero__main { position: relative; z-index: 2; max-width: 820px; }
.cs-kicker {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 0 0 22px;
  color: ${BLUE};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .28em;
  text-transform: uppercase;
}
.cs-kicker::before { content: ""; width: 34px; height: 2px; background: currentColor; }
.cs-title {
  margin: 0;
  font-family: "Newsreader", Georgia, "Times New Roman", serif;
  font-size: clamp(3.5rem, 8.7vw, 8.2rem);
  font-weight: 300;
  line-height: .84;
  letter-spacing: -.06em;
}
.cs-title em { color: ${ACCENT}; font-weight: 400; }
.cs-title b { color: ${BLUE}; font-weight: 400; }
.cs-line { display: block; overflow: hidden; padding-bottom: .1em; }
.cs-line > span { display: block; }
.cs-lede {
  max-width: 48ch;
  margin: 26px 0 0;
  color: rgba(17, 17, 17, .62);
  font-size: 13px;
  line-height: 1.85;
}
.cs-lede strong { color: ${INK}; font-weight: 700; }
.cs-hero__visual { position: relative; z-index: 2; min-height: 350px; display: grid; place-items: center; perspective: 800px; }
.cs-orbit {
  position: absolute;
  width: 310px;
  height: 310px;
  border: 1px dashed rgba(17, 17, 17, .3);
  border-radius: 50%;
  animation: cs-spin 28s linear infinite;
}
.cs-orbit::before {
  content: "";
  position: absolute;
  top: -4px;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${BLUE};
  transform: translateX(-50%);
}
.cs-letter {
  position: relative;
  width: min(260px, 72vw);
  height: 178px;
  overflow: hidden;
  border: 1.5px solid ${INK};
  background: #FFFFFF;
  box-shadow: 16px 16px 0 ${ACCENT};
  transform: rotate(-7deg);
}
.cs-letter__fold {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(135deg, #FFFFFF 49%, #F2E5E7 50%, #FFFFFF 51%);
  clip-path: polygon(0 0, 100% 0, 50% 64%);
  transform-origin: top center;
  animation: cs-flap 6s ease-in-out infinite;
}
.cs-letter__body { position: absolute; right: 18px; bottom: 15px; left: 18px; display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
.cs-letter__body span { color: ${MUTED}; font-size: 8px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; }
.cs-letter__body strong { font-family: "Newsreader", Georgia, serif; font-size: 30px; font-weight: 500; line-height: .85; letter-spacing: -.03em; }
.cs-stamp {
  position: absolute;
  top: 4px;
  left: -12px;
  z-index: 3;
  display: grid;
  place-items: center;
  width: 86px;
  height: 86px;
  border: 1px solid ${ACCENT};
  border-radius: 50%;
  color: ${ACCENT};
  font-family: "Newsreader", Georgia, serif;
  font-size: 13px;
  font-style: italic;
  text-align: center;
  transform: rotate(-14deg);
}
.cs-stamp::after { content: ""; position: absolute; inset: 6px; border: 1px solid rgba(153, 75, 92, .4); border-radius: 50%; }
.cs-sticker {
  position: absolute;
  right: -2px;
  bottom: 6px;
  z-index: 4;
  padding: 10px 14px;
  background: ${BLUE};
  color: #FFFFFF;
  box-shadow: 5px 5px 0 ${INK};
  font-size: 9px;
  font-weight: 800;
  line-height: 1.45;
  letter-spacing: .18em;
  text-align: center;
  text-transform: uppercase;
  transform: rotate(9deg);
}
.cs-marquee { overflow: hidden; border-top: 1px solid ${INK}; border-bottom: 1px solid ${INK}; background: ${ACCENT}; color: #FFFFFF; }
.cs-marquee__track { display: flex; width: max-content; animation: cs-marquee 24s linear infinite; }
.cs-marquee__track span { display: inline-flex; align-items: center; gap: 26px; padding: 13px 0; font-size: 10px; font-weight: 800; letter-spacing: .32em; text-transform: uppercase; white-space: nowrap; }
.cs-marquee__track i { color: rgba(255, 255, 255, .95); font-style: normal; }
.cs-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(300px, .65fr);
  align-items: start;
  gap: clamp(30px, 4.5vw, 68px);
  padding-top: clamp(50px, 6.8vw, 88px);
}
.cs-formdeck { position: relative; border: 1.5px solid ${INK}; background: #FFFFFF; box-shadow: 14px 14px 0 ${ACCENT}; }
.cs-deck__bar { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 13px 18px; border-bottom: 1px solid ${INK}; background: ${INK}; color: #FFFFFF; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
.cs-deck__dots { display: inline-flex; align-items: center; gap: 5px; }
.cs-deck__dots i { width: 6px; height: 6px; border-radius: 50%; background: ${ACCENT}; }
.cs-deck__dots i:first-child { background: ${BLUE}; }
.cs-deck__body { padding: clamp(24px, 3.3vw, 44px); }
.cs-deck__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 30px; }
.cs-deck__head h2 { margin: 0; font-family: "Newsreader", Georgia, serif; font-size: clamp(1.8rem, 3vw, 2.7rem); font-weight: 400; line-height: 1.02; letter-spacing: -.03em; }
.cs-deck__flag { flex: 0 0 auto; padding: 7px 9px; border: 1px solid ${INK}; color: ${INK}; font-size: 8px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; transform: rotate(4deg); }
.cs-form { display: flex; flex-direction: column; gap: 25px; }
.cs-form__row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 26px; }
.cs-field { position: relative; padding-bottom: 2px; }
.cs-field__head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.cs-field__no { color: ${ACCENT}; font-size: 9px; font-weight: 800; letter-spacing: .18em; }
.cs-field__head label, .cs-topic__label { color: ${MUTED}; font-size: 9px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; }
.cs-field__head b, .cs-topic__label b { color: ${ACCENT}; }
.cs-optional { color: ${MUTED}; font-size: 9px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; }
.cs-input, .cs-textarea {
  display: block;
  width: 100%;
  padding: 10px 0 12px;
  border: 0;
  border-bottom: 1px solid rgba(17, 17, 17, .3);
  border-radius: 0;
  background: transparent;
  color: ${INK};
  font-size: 17px;
  outline: none;
  transition: border-color .3s ease;
}
.cs-input::placeholder, .cs-textarea::placeholder { color: ${MUTED}; }
.cs-textarea { min-height: 132px; line-height: 1.6; resize: vertical; }
.cs-field__line { position: absolute; right: 0; bottom: 0; left: 0; height: 2px; background: ${ACCENT}; transform: scaleX(0); transform-origin: left; transition: transform .5s cubic-bezier(.16, 1, .3, 1); }
.cs-field:focus-within .cs-field__line { transform: scaleX(1); }
.cs-field.has-error .cs-input, .cs-field.has-error .cs-textarea { border-bottom-color: #B23A40; }
.cs-field.has-error .cs-field__line { background: #B23A40; transform: scaleX(1); }
.cs-error { display: flex; align-items: center; gap: 6px; margin: 9px 0 0; color: #A23036; font-size: 10.5px; font-weight: 600; }
.cs-error svg { width: 9px; height: 9px; }
.cs-topic { position: relative; }
.cs-topic__label { display: block; margin-bottom: 11px; }
.cs-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.cs-chip { position: relative; padding: 10px 13px; border: 1px solid ${INK}; background: #FFFFFF; color: ${INK}; cursor: pointer; font-size: 9px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; transition: color .3s ease, background .3s ease, transform .3s cubic-bezier(.16, 1, .3, 1); }
.cs-chip:hover { transform: translateY(-2px); }
.cs-chip.is-on { background: ${INK}; color: #FFFFFF; }
.cs-chip span { position: relative; z-index: 1; }
.cs-count { display: block; margin-top: 9px; color: ${MUTED}; font-size: 10px; font-variant-numeric: tabular-nums; text-align: right; }
.cs-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 18px; margin-top: 4px; }
.cs-submit {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  min-height: 62px;
  padding: 8px 8px 8px 24px;
  border: 1px solid ${INK};
  border-radius: 999px;
  background: ${INK};
  color: #FFFFFF;
  cursor: pointer;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .2em;
  text-transform: uppercase;
  transition: background .3s ease, box-shadow .3s ease;
}
.cs-submit:hover { background: #000000; box-shadow: 0 14px 30px -18px ${INK}; }
.cs-submit:disabled { cursor: wait; opacity: .7; }
.cs-submit__icon { display: grid; flex: 0 0 auto; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: ${ACCENT}; font-size: 12px; transition: transform .35s cubic-bezier(.16, 1, .3, 1), background .35s ease; }
.cs-submit:hover .cs-submit__icon { background: ${BLUE}; transform: rotate(-20deg) scale(1.05); }
.cs-submit--ghost { background: transparent; color: ${INK}; }
.cs-submit--ghost .cs-submit__icon { background: ${ACCENT}; }
.cs-submit--ghost:hover { background: ${INK}; color: #FFFFFF; }
.cs-note { display: inline-flex; align-items: center; gap: 9px; max-width: 240px; color: ${MUTED}; font-size: 10px; line-height: 1.55; }
.cs-note svg { flex: 0 0 auto; width: 13px; height: 13px; color: #5E7A4B; }
.cs-alert { display: flex; align-items: center; gap: 9px; padding: 12px 14px; border: 1px solid rgba(178, 58, 64, .5); background: #FFF5F5; color: #932A30; font-size: 11px; font-weight: 700; }
.cs-alert svg { flex: 0 0 auto; width: 12px; height: 12px; }
.cs-success { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; min-height: 460px; }
.cs-success__mark { display: grid; place-items: center; width: 84px; height: 84px; margin-bottom: 28px; border: 1.5px solid ${INK}; background: #FFFFFF; box-shadow: 9px 9px 0 ${ACCENT}; color: ${ACCENT}; font-size: 26px; }
.cs-success h2 { margin: 0 0 16px; font-family: "Newsreader", Georgia, serif; font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 400; line-height: .96; letter-spacing: -.05em; }
.cs-success p:not(.cs-mini) { max-width: 46ch; margin: 0 0 28px; color: rgba(17, 17, 17, .62); font-size: 13px; line-height: 1.8; }
.cs-mini { margin: 0 0 13px; color: ${BLUE}; font-size: 9px; font-weight: 800; letter-spacing: .28em; text-transform: uppercase; }
.cs-hours .cs-mini { color: #C7CEFF; }
.cs-side { display: flex; flex-direction: column; gap: 22px; }
.cs-side__intro { position: relative; padding-bottom: 20px; border-bottom: 1px solid ${INK}; }
.cs-side__num { position: absolute; top: -22px; right: 0; color: transparent; font-size: 78px; font-weight: 800; letter-spacing: -.08em; line-height: 1; -webkit-text-stroke: 1px rgba(153, 75, 92, .45); pointer-events: none; }
.cs-side__intro h2 { position: relative; margin: 0 0 12px; font-family: "Newsreader", Georgia, serif; font-size: 28px; font-weight: 400; line-height: 1.03; letter-spacing: -.03em; }
.cs-side__intro p { position: relative; max-width: 32ch; margin: 0; color: ${MUTED}; font-size: 11.5px; line-height: 1.7; }
.cs-contactlist { border: 1.5px solid ${INK}; background: #FFFFFF; }
.cs-contact { display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 16px; border-bottom: 1px solid ${INK}; color: inherit; text-decoration: none; transition: background .3s ease, color .3s ease; }
.cs-contact:last-child { border-bottom: 0; }
.cs-contact:hover { background: ${INK}; color: #FFFFFF; }
.cs-contact__icon { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid rgba(153, 75, 92, .45); border-radius: 50%; color: ${ACCENT}; font-size: 11px; transition: color .3s ease, border-color .3s ease; }
.cs-contact:hover .cs-contact__icon { border-color: #FFFFFF; color: #FFFFFF; }
.cs-contact__label { display: block; color: ${MUTED}; font-size: 8px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; }
.cs-contact:hover .cs-contact__label { color: rgba(255, 255, 255, .55); }
.cs-contact__value { display: block; margin-top: 4px; font-size: 12px; font-weight: 700; line-height: 1.4; overflow-wrap: anywhere; }
.cs-contact__meta { display: block; margin-top: 3px; color: ${MUTED}; font-size: 9.5px; }
.cs-contact:hover .cs-contact__meta { color: rgba(255, 255, 255, .5); }
.cs-contact__arrow { color: ${ACCENT}; font-size: 11px; transition: transform .3s cubic-bezier(.16, 1, .3, 1), color .3s ease; }
.cs-contact:hover .cs-contact__arrow { color: #FFFFFF; transform: translate(3px, -3px); }
.cs-hours { position: relative; margin-top: 8px; padding: 28px 24px 24px; background: ${INK}; color: #FFFFFF; box-shadow: -12px 12px 0 ${BLUE}; transform: rotate(.8deg); }
.cs-hours::before { content: ""; position: absolute; top: -50px; right: -20px; width: 150px; height: 150px; border-radius: 50%; background: radial-gradient(circle, rgba(47, 63, 196, .32), transparent 68%); pointer-events: none; }
.cs-hours__ring { position: absolute; top: -42px; right: 22px; display: grid; place-items: center; width: 82px; height: 82px; border-radius: 50%; background: conic-gradient(${ACCENT} 0 72%, rgba(255, 255, 255, .14) 72% 100%); }
.cs-hours__ring::before { content: ""; position: absolute; inset: 7px; border-radius: 50%; background: ${INK}; }
.cs-hours__ring span { position: relative; z-index: 1; font-family: "Newsreader", Georgia, serif; font-size: 17px; font-style: italic; }
.cs-hours h2 { position: relative; margin: 0 0 18px; font-family: "Newsreader", Georgia, serif; font-size: 24px; font-weight: 400; letter-spacing: -.02em; }
.cs-hours__badge { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 18px; padding: 6px 9px; border: 1px solid rgba(255, 255, 255, .25); font-size: 8px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; }
.cs-hours__badge i { width: 5px; height: 5px; border-radius: 50%; background: #8FB27A; }
.cs-hours__badge.is-away i { background: ${ACCENT}; }
.cs-hour { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 0; border-top: 1px solid rgba(255, 255, 255, .14); font-size: 10.5px; }
.cs-hour span:first-child { color: rgba(255, 255, 255, .6); }
.cs-hour span:last-child { font-weight: 700; font-variant-numeric: tabular-nums; }
.cs-hours__foot { display: flex; gap: 9px; margin: 18px 0 0; color: rgba(255, 255, 255, .58); font-size: 9.5px; line-height: 1.6; }
.cs-hours__foot svg { flex: 0 0 auto; width: 12px; height: 12px; color: #E9A9A1; }
.cs-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: clamp(54px, 7vw, 92px); padding-top: 16px; border-top: 1px solid ${INK}; color: ${MUTED}; font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
.cs-spin { animation: cs-spin 1s linear infinite; }
@keyframes cs-spin { to { transform: rotate(360deg); } }
@keyframes cs-pulse { 0% { box-shadow: 0 0 0 0 rgba(94, 122, 75, .55); } 70% { box-shadow: 0 0 0 7px rgba(94, 122, 75, 0); } 100% { box-shadow: 0 0 0 0 rgba(94, 122, 75, 0); } }
@keyframes cs-flap { 0%, 100% { transform: rotateX(0deg); } 50% { transform: rotateX(-18deg); } }
@keyframes cs-marquee { to { transform: translateX(-50%); } }
@media (max-width: 1040px) {
  .cs-hero { grid-template-columns: minmax(0, 1fr); }
  .cs-hero__visual { min-height: 290px; }
  .cs-layout { grid-template-columns: minmax(0, 1fr); }
  .cs-side { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }
  .cs-side__intro { grid-column: 1 / -1; }
  .cs-hours { margin-top: 0; }
}
@media (max-width: 680px) {
  .cs-shell { padding-right: 14px; padding-left: 14px; }
  .cs-top { grid-template-columns: 1fr auto; }
  .cs-top__middle { display: none; }
  .cs-hero { padding-top: 42px; padding-bottom: 34px; }
  .cs-hero__watermark { top: 2%; right: -12%; font-size: 8rem; }
  .cs-title { font-size: clamp(2.7rem, 13vw, 4.2rem); }
  .cs-lede { font-size: 12px; }
  .cs-hero__visual { min-height: 250px; }
  .cs-orbit { width: 240px; height: 240px; }
  .cs-letter { width: 220px; height: 150px; box-shadow: 11px 11px 0 ${ACCENT}; }
  .cs-letter__body strong { font-size: 25px; }
  .cs-stamp { width: 70px; height: 70px; font-size: 11px; }
  .cs-sticker { right: -8px; bottom: -6px; font-size: 7.5px; }
  .cs-form__row { grid-template-columns: minmax(0, 1fr); gap: 25px; }
  .cs-formdeck { box-shadow: 9px 9px 0 ${ACCENT}; }
  .cs-deck__flag { display: none; }
  .cs-actions { align-items: stretch; flex-direction: column; }
  .cs-submit { width: 100%; justify-content: space-between; }
  .cs-note { max-width: none; }
  .cs-side { grid-template-columns: minmax(0, 1fr); }
  .cs-hours { transform: none; box-shadow: -8px 8px 0 ${BLUE}; }
  .cs-footer { align-items: flex-start; flex-direction: column; gap: 8px; }
}
@media (hover: none) {
  .cs-cursor, .cs-glow { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .cs-page *, .cs-page *::before, .cs-page *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
}
`;

const validate = (data) => {
  const errors = {};
  if (data.name.trim().length < 2) errors.name = "Please enter your name.";

  const email = data.email.trim();
  if (!email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Enter a valid email address.";

  const phone = data.phone.trim();
  if (phone && !/^[+()\d\s.-]{7,20}$/.test(phone)) errors.phone = "Enter a valid phone number.";

  if (!SUBJECTS.includes(data.subject)) errors.subject = "Choose a topic.";

  const message = data.message.trim();
  if (message.length < 10) errors.message = "Tell us a little more, at least 10 characters.";
  else if (message.length > MAX_MESSAGE) errors.message = `Keep it under ${MAX_MESSAGE} characters.`;

  return errors;
};

function getOpenStatus(date) {
  const day = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Karachi" }).format(date);
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Karachi",
    }).format(date),
  );
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day);
  return weekday ? hour >= 9 && hour < 18 : day === "Sat" ? hour >= 10 && hour < 16 : false;
}

function FieldError({ id, children }) {
  return (
    <AnimatePresence initial={false}>
      {children ? (
        <Motion.p
          id={id}
          className="cs-error"
          role="alert"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          <FaTimes /> {children}
        </Motion.p>
      ) : null}
    </AnimatePresence>
  );
}

export default function ContactPage() {
  const rootRef = useRef(null);
  const glowRef = useRef(null);
  const cursorRef = useRef(null);
  const submitRef = useRef(null);
  const fieldRefs = useRef({});
  const reduce = useReducedMotion();
  const inView = useInView(rootRef, { once: true, margin: "-80px" });
  const { scrollY } = useScroll();
  const watermarkY = useTransform(scrollY, [0, 700], [0, -90]);
  const visualY = useTransform(scrollY, [0, 600], [0, -32]);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle");
  const [failure, setFailure] = useState("");
  const [now, setNow] = useState(() => new Date());

  const open = useMemo(() => getOpenStatus(now), [now]);
  const marquee = useMemo(() => [...MARQUEE, ...MARQUEE], []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const glow = glowRef.current;
    if (!root || !glow || reduce || !window.matchMedia("(pointer:fine)").matches) return undefined;

    const bounds = root.getBoundingClientRect();
    gsap.set(glow, { x: bounds.width * 0.72, y: bounds.height * 0.18, xPercent: -50, yPercent: -50 });
    const moveX = gsap.quickTo(glow, "x", { duration: 0.55, ease: "power3.out" });
    const moveY = gsap.quickTo(glow, "y", { duration: 0.55, ease: "power3.out" });
    const track = (event) => {
      const rect = root.getBoundingClientRect();
      moveX(event.clientX - rect.left);
      moveY(event.clientY - rect.top);
    };

    root.addEventListener("pointermove", track);
    return () => {
      root.removeEventListener("pointermove", track);
      gsap.killTweensOf(glow);
    };
  }, [reduce]);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || reduce || !window.matchMedia("(pointer:fine)").matches) return undefined;

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    const moveX = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power3.out" });
    const moveY = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power3.out" });
    const track = (event) => {
      moveX(event.clientX);
      moveY(event.clientY);
      gsap.to(cursor, { opacity: 1, duration: 0.2, overwrite: "auto" });
    };
    const grow = (event) => {
      if (!event.target.closest?.("a, button, input, textarea")) return;
      gsap.to(cursor, {
        width: 54,
        height: 54,
        backgroundColor: "rgba(153, 75, 92, .08)",
        duration: 0.25,
        overwrite: "auto",
      });
    };
    const shrink = (event) => {
      if (!event.target.closest?.("a, button, input, textarea")) return;
      gsap.to(cursor, {
        width: 34,
        height: 34,
        backgroundColor: "rgba(153, 75, 92, 0)",
        duration: 0.25,
        overwrite: "auto",
      });
    };

    window.addEventListener("pointermove", track);
    document.addEventListener("pointerover", grow);
    document.addEventListener("pointerout", shrink);
    return () => {
      window.removeEventListener("pointermove", track);
      document.removeEventListener("pointerover", grow);
      document.removeEventListener("pointerout", shrink);
      gsap.killTweensOf(cursor);
    };
  }, [reduce]);

  useEffect(() => () => {
    if (submitRef.current) gsap.killTweensOf(submitRef.current);
  }, []);

  const reveal = (delay = 0) =>
    reduce
      ? { initial: false }
      : {
          initial: { opacity: 0, y: 26 },
          animate: inView ? { opacity: 1, y: 0 } : undefined,
          transition: { duration: 0.75, delay, ease: EASE },
        };

  const showError = (key) => Boolean(errors[key] && touched[key]);

  const clearError = (key) => {
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    clearError(key);
    if (status === "error") {
      setStatus("idle");
      setFailure("");
    }
  };

  const blur = (key) => {
    setTouched((previous) => ({ ...previous, [key]: true }));
    const found = validate(form)[key];
    setErrors((previous) => {
      const next = { ...previous };
      if (found) next[key] = found;
      else delete next[key];
      return next;
    });
  };

  const magnet = (event) => {
    if (reduce || !submitRef.current) return;
    const rect = submitRef.current.getBoundingClientRect();
    gsap.to(submitRef.current, {
      x: (event.clientX - (rect.left + rect.width / 2)) * 0.1,
      y: (event.clientY - (rect.top + rect.height / 2)) * 0.18,
      duration: 0.3,
      ease: "power3.out",
      overwrite: true,
    });
  };

  const release = () => {
    if (reduce || !submitRef.current) return;
    gsap.to(submitRef.current, {
      x: 0,
      y: 0,
      duration: 0.55,
      ease: "elastic.out(1, 0.45)",
      overwrite: true,
    });
  };

  const reset = () => {
    setForm(INITIAL);
    setErrors({});
    setTouched({});
    setStatus("idle");
    setFailure("");
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    setTouched({ name: true, email: true, phone: true, subject: true, message: true });

    const firstInvalid = FIELDS.find((key) => found[key]);
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus?.();
      return;
    }

    if (form.company.trim()) {
      setStatus("success");
      return;
    }

    setStatus("sending");
    setFailure("");

    try {
      if (ENDPOINT) {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 10000);
        try {
          const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              name: form.name.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
              subject: form.subject,
              message: form.message.trim(),
              company: form.company,
            }),
            signal: controller.signal,
          });
          if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        } finally {
          window.clearTimeout(timeout);
        }
      } else {
        const subject = `BookSphere — ${form.subject} from ${form.name.trim()}`;
        const body = [
          `Name: ${form.name.trim()}`,
          `Email: ${form.email.trim()}`,
          `Phone: ${form.phone.trim() || "Not provided"}`,
          `Topic: ${form.subject}`,
          "",
          form.message.trim(),
        ].join("\n");
        await new Promise((resolve) => window.setTimeout(resolve, 420));
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
      setStatus("success");
    } catch (error) {
      setFailure(
        error?.name === "AbortError"
          ? "The request timed out. Please try again."
          : "Something went wrong while sending. Please try again or email us directly.",
      );
      setStatus("error");
    }
  };

  const inputProps = (key) => ({
    id: `cs-${key}`,
    name: key,
    ref: (node) => {
      fieldRefs.current[key] = node;
    },
    value: form[key],
    onChange: (event) => update(key, event.target.value),
    onBlur: () => blur(key),
    "aria-invalid": showError(key) || undefined,
    "aria-describedby": showError(key) ? `cs-${key}-error` : undefined,
  });

  return (
    <main ref={rootRef} className="cs-page">
      <style>{STYLES}</style>
      <div ref={cursorRef} className="cs-cursor" aria-hidden="true" />
      <div ref={glowRef} className="cs-glow" aria-hidden="true" />

      <div className="cs-shell">
        <Motion.div {...reveal(0)} className="cs-top">
          <span className="cs-top__brand">BookSphere / Contact</span>
          <span className="cs-top__middle">Reader desk — open daily</span>
          <span className="cs-top__live">
            <i className="cs-top__dot" /> {open ? "Currently online" : "Back soon"}
          </span>
        </Motion.div>

        <Motion.header {...reveal(0.06)} className="cs-hero">
          <Motion.div
            className="cs-hero__watermark"
            aria-hidden="true"
            style={{ y: reduce ? 0 : watermarkY }}
          >
            HELLO
          </Motion.div>
          <div className="cs-hero__main">
            <p className="cs-kicker">Start here</p>
            <Motion.h1
              className="cs-title"
              initial={reduce ? false : "hidden"}
              animate={inView ? "show" : undefined}
              variants={{
                show: { transition: { staggerChildren: 0.12, delayChildren: 0.12 } },
              }}
            >
              <span className="cs-line">
                <Motion.span
                  variants={reduce ? undefined : { hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 0.85, ease: EASE } } }}
                >
                  Let&apos;s make
                </Motion.span>
              </span>
              <span className="cs-line">
                <Motion.span
                  variants={reduce ? undefined : { hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 0.85, ease: EASE } } }}
                >
                  <em>a little</em> <b>noise.</b>
                </Motion.span>
              </span>
            </Motion.h1>
            <Motion.p {...reveal(0.24)} className="cs-lede">
              Not a chatbot. Not a ticket number. A real reader on the other side who loves <strong>books, good questions and long replies.</strong>
            </Motion.p>
          </div>
          <Motion.div
            className="cs-hero__visual"
            aria-hidden="true"
            style={{ y: reduce ? 0 : visualY }}
          >
            <div className="cs-orbit" />
            <div className="cs-stamp">open<br />me</div>
            <div className="cs-letter">
              <div className="cs-letter__fold" />
              <div className="cs-letter__body">
                <span>psychedelic post</span>
                <strong>hey,<br />you.</strong>
              </div>
            </div>
            <div className="cs-sticker">24h<br />reply</div>
          </Motion.div>
        </Motion.header>

        <Motion.div
          className="cs-marquee"
          aria-hidden="true"
          initial={reduce ? false : { opacity: 0 }}
          animate={inView ? { opacity: 1 } : undefined}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="cs-marquee__track">
            {marquee.map((item, index) => (
              <span key={`${item}-${index}`}>
                {item} <i>—</i>
              </span>
            ))}
          </div>
        </Motion.div>

        <div className="cs-layout">
          <Motion.section {...reveal(0.12)} className="cs-formdeck" aria-label="Contact form">
            <div className="cs-deck__bar">
              <span>01 / Message composer</span>
              <span className="cs-deck__dots"><i /><i /><i /></span>
            </div>
            <div className="cs-deck__body">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <Motion.div
                    key="success"
                    className="cs-success"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                  >
                    <Motion.div
                      className="cs-success__mark"
                      initial={{ scale: 0.5, rotate: -25 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
                    >
                      <FaCheck />
                    </Motion.div>
                    <p className="cs-mini">Message ready</p>
                    <h2>That&apos;s a good one.</h2>
                    <p>
                      {ENDPOINT
                        ? "Your note is with us. We usually reply within one working day."
                        : "Your email app should now open with everything filled in. Just press send and we'll take it from there."}
                    </p>
                    <button type="button" className="cs-submit cs-submit--ghost" onClick={reset}>
                      Write another <span className="cs-submit__icon"><FaPaperPlane /></span>
                    </button>
                  </Motion.div>
                ) : (
                  <Motion.form
                    key="form"
                    onSubmit={submit}
                    noValidate
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.3 }}
                  >
                    <div className="cs-deck__head">
                      <div>
                        <p className="cs-mini">Leave your mark</p>
                        <h2>Tell us everything.</h2>
                      </div>
                      <span className="cs-deck__flag">Start here</span>
                    </div>

                    <div className="cs-form">
                      <div className="cs-form__row">
                        <div className={`cs-field${showError("name") ? " has-error" : ""}`}>
                          <div className="cs-field__head">
                            <span className="cs-field__no">01</span>
                            <label htmlFor="cs-name">Full name <b>*</b></label>
                          </div>
                          <input className="cs-input" type="text" placeholder="Your name" autoComplete="name" maxLength={80} {...inputProps("name")} />
                          <span className="cs-field__line" />
                          <FieldError id="cs-name-error">{showError("name") ? errors.name : ""}</FieldError>
                        </div>
                        <div className={`cs-field${showError("email") ? " has-error" : ""}`}>
                          <div className="cs-field__head">
                            <span className="cs-field__no">02</span>
                            <label htmlFor="cs-email">Email address <b>*</b></label>
                          </div>
                          <input className="cs-input" type="email" placeholder="you@example.com" autoComplete="email" maxLength={120} {...inputProps("email")} />
                          <span className="cs-field__line" />
                          <FieldError id="cs-email-error">{showError("email") ? errors.email : ""}</FieldError>
                        </div>
                      </div>

                      <div className={`cs-field${showError("phone") ? " has-error" : ""}`}>
                        <div className="cs-field__head">
                          <span className="cs-field__no">03</span>
                          <label htmlFor="cs-phone">Phone number <span className="cs-optional">(optional)</span></label>
                        </div>
                        <input className="cs-input" type="tel" placeholder="+00 000 000 0000" autoComplete="tel" maxLength={24} {...inputProps("phone")} />
                        <span className="cs-field__line" />
                        <FieldError id="cs-phone-error">{showError("phone") ? errors.phone : ""}</FieldError>
                      </div>

                      <div className={`cs-topic${showError("subject") ? " has-error" : ""}`}>
                        <span className="cs-topic__label">04 / What is this about? <b>*</b></span>
                        <div className="cs-chips" role="group" aria-label="Message topic">
                          {SUBJECTS.map((subject, index) => (
                            <button
                              key={subject}
                              type="button"
                              className={`cs-chip${form.subject === subject ? " is-on" : ""}`}
                              aria-pressed={form.subject === subject}
                              ref={index === 0 ? (node) => { fieldRefs.current.subject = node; } : undefined}
                              onClick={() => update("subject", subject)}
                            >
                              <span>{subject}</span>
                            </button>
                          ))}
                        </div>
                        <FieldError id="cs-subject-error">{showError("subject") ? errors.subject : ""}</FieldError>
                      </div>

                      <div className={`cs-field${showError("message") ? " has-error" : ""}`}>
                        <div className="cs-field__head">
                          <span className="cs-field__no">05</span>
                          <label htmlFor="cs-message">Your message <b>*</b></label>
                        </div>
                        <textarea className="cs-textarea" placeholder="Tell us about the book, order, or idea..." maxLength={MAX_MESSAGE} {...inputProps("message")} />
                        <span className="cs-field__line" />
                        <span className="cs-count">{form.message.length}/{MAX_MESSAGE}</span>
                        <FieldError id="cs-message-error">{showError("message") ? errors.message : ""}</FieldError>
                      </div>

                      <div className="cs-field" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, padding: 0 }}>
                        <label htmlFor="cs-company">Company</label>
                        <input id="cs-company" name="company" type="text" tabIndex={-1} autoComplete="off" value={form.company} onChange={(event) => update("company", event.target.value)} />
                      </div>

                      <AnimatePresence initial={false}>
                        {status === "error" ? (
                          <Motion.div
                            className="cs-alert"
                            role="alert"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25, ease: EASE }}
                          >
                            <FaTimes /> {failure}
                          </Motion.div>
                        ) : null}
                      </AnimatePresence>

                      <div className="cs-actions">
                        <Motion.button
                          ref={submitRef}
                          type="submit"
                          className="cs-submit"
                          disabled={status === "sending"}
                          onMouseMove={magnet}
                          onMouseLeave={release}
                          whileTap={reduce ? undefined : { scale: 0.97 }}
                        >
                          {status === "sending" ? "Sending" : "Send message"}
                          <span className="cs-submit__icon">
                            {status === "sending" ? <FaSpinner className="cs-spin" /> : <FaArrowRight />}
                          </span>
                        </Motion.button>
                        <span className="cs-note">
                          <FaShieldAlt /> No spam, no newsletters. Just a reply from a real person.
                        </span>
                      </div>
                    </div>
                  </Motion.form>
                )}
              </AnimatePresence>
            </div>
          </Motion.section>

          <aside className="cs-side" aria-label="Contact information">
            <Motion.section {...reveal(0.2)} className="cs-side__intro">
              <span className="cs-side__num" aria-hidden="true">02</span>
              <p className="cs-mini">Other ways in</p>
              <h2>Prefer not to type?</h2>
              <p>Pick a lane. Every message lands on the same desk, and every desk gets answered.</p>
            </Motion.section>

            <Motion.section {...reveal(0.28)} className="cs-contactlist">
              {CONTACTS.map((contact) => (
                <a key={contact.label} className="cs-contact" href={contact.href} target={contact.href.startsWith("http") ? "_blank" : undefined} rel={contact.href.startsWith("http") ? "noreferrer" : undefined}>
                  <span className="cs-contact__icon">{createElement(contact.icon)}</span>
                  <span>
                    <span className="cs-contact__label">{contact.label}</span>
                    <span className="cs-contact__value">{contact.value}</span>
                    <span className="cs-contact__meta">{contact.meta}</span>
                  </span>
                  <FaArrowRight className="cs-contact__arrow" />
                </a>
              ))}
            </Motion.section>

            <Motion.section {...reveal(0.36)} className="cs-hours">
              <div className="cs-hours__ring"><span>24h</span></div>
              <p className="cs-mini">Reading hours</p>
              <h2>When we&apos;re around.</h2>
              <span className={`cs-hours__badge${open ? "" : " is-away"}`}>
                <i /> {open ? "Open now" : "Away right now"}
              </span>
              <div>
                {HOURS.map(([day, time]) => (
                  <div className="cs-hour" key={day}>
                    <span>{day}</span>
                    <span>{time}</span>
                  </div>
                ))}
              </div>
              <p className="cs-hours__foot">
                <FaClock /> Times shown in Asia/Karachi. We answer every note within one working day.
              </p>
            </Motion.section>
          </aside>
        </div>

        <Motion.footer {...reveal(0.42)} className="cs-footer">
          <span>© {new Date().getFullYear()} BookSphere · For people who read</span>
          <span>Made with ink, curiosity and a soft spot for stories</span>
        </Motion.footer>
      </div>
    </main>
  );
}
