import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";

const PAPER = "#F1EFE9";
const INK = "#151515";
const BLUE = "#2F3FC4";
const GREY = "#8A8780";
const MICRO = {
  fontFamily: "Inter, sans-serif",
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};
const SERIF = "'Newsreader', Georgia, serif";
const TON = {
  cream: ["#E6D9C3", "#2A2118"],
  blue: ["#2147B8", "#F1EFE9"],
  charcoal: ["#2B2B29", "#E6D9C3"],
  red: ["#7E2A28", "#F1EFE9"],
  green: ["#1F5B43", "#E6D9C3"],
};
const FILMS = [
  {
    id: "silent",
    title: "The Silent Valley",
    year: 1958,
    romaji: "SHIZUKANA TANI",
    kanji: "THE SILENT VALLEY",
    genre: "Drama",
    mins: 114,
    tone: "charcoal",
    desc: "A schoolteacher returns to the mountain village that exiled her father, and finds the valley has kept every one of its secrets.",
    q: ["mountain valley river engraving", "alpine landscape etching"],
    seed: "silent-valley",
  },
  {
    id: "blue",
    title: "The Blue Hour",
    year: 1961,
    romaji: "AOI JIKAN",
    kanji: "THE BLUE HOUR",
    genre: "Drama",
    mins: 96,
    tone: "blue",
    desc: "A night-shift nurse meets a stranger at the hour when the city forgets its own name.",
    q: ["woman profile woodblock print", "moonlit portrait print"],
    seed: "blue-hour",
  },
  {
    id: "salt",
    title: "River of Salt",
    year: 1964,
    romaji: "SHIO NO KAWA",
    kanji: "RIVER OF SALT",
    genre: "Drama",
    mins: 108,
    tone: "cream",
    desc: "A salt trader and his daughter drift downriver while a patient drought erases the towns behind them.",
    q: ["sunset river woodblock print", "red sun landscape print"],
    seed: "river-salt",
  },
  {
    id: "summer",
    title: "The Last Summer",
    year: 1966,
    romaji: "SAIGO NO NATSU",
    kanji: "THE LAST SUMMER",
    genre: "Drama",
    mins: 101,
    tone: "charcoal",
    desc: "Two siblings spend one final harvest on their family farm before the land is sold.",
    q: ["summer field woodcut", "harvest figure print"],
    seed: "last-summer",
  },
  {
    id: "green",
    title: "The Green Road",
    year: 1968,
    romaji: "MIDORI NO MICHI",
    kanji: "THE GREEN ROAD",
    genre: "Drama",
    mins: 99,
    tone: "green",
    desc: "A widowed postman walks a forest route where every letter is addressed to someone already gone.",
    q: ["forest road woodcut", "country lane print"],
    seed: "green-road",
  },
  {
    id: "noon",
    title: "Noon in Ashes",
    year: 1971,
    romaji: "HAI NO HIRU",
    kanji: "NOON IN ASHES",
    genre: "Western",
    mins: 112,
    tone: "cream",
    desc: "A rider crosses the desert carrying a message no town is willing to read.",
    q: ["horseman desert linocut", "rider landscape print"],
    seed: "noon-ashes",
  },
  {
    id: "observer",
    title: "The Observer",
    year: 1974,
    romaji: "KANSATSUSHA",
    kanji: "THE OBSERVER",
    genre: "Thriller",
    mins: 94,
    tone: "cream",
    desc: "A portrait photographer begins to see the same stranger in every frame she develops.",
    q: ["portrait woman etching", "face engraving"],
    seed: "observer",
  },
  {
    id: "birds",
    title: "The Fallen Birds",
    year: 1976,
    romaji: "OCHITA TORI",
    kanji: "THE FALLEN BIRDS",
    genre: "Drama",
    mins: 103,
    tone: "cream",
    desc: "After the war, a village waits for the birds to return and for its sons to follow.",
    q: ["birds in flight woodblock print", "bird woodcut"],
    seed: "fallen-birds",
  },
  {
    id: "storm",
    title: "Light in the Storm",
    year: 1979,
    romaji: "ARASHI NO HIKARI",
    kanji: "LIGHT IN THE STORM",
    genre: "Drama",
    mins: 110,
    tone: "cream",
    desc: "A lighthouse keeper counts the ships that pass and the one that never arrives.",
    q: ["lighthouse storm print", "lighthouse woodcut"],
    seed: "light-storm",
  },
  {
    id: "tide",
    title: "The Long Tide",
    year: 1981,
    romaji: "NAGAI SHIO",
    kanji: "THE LONG TIDE",
    genre: "Drama",
    mins: 105,
    tone: "blue",
    desc: "An island fisherman rows out each dawn to meet a sea that keeps changing its mind.",
    q: ["moon over sea woodblock print", "ocean waves print"],
    seed: "long-tide",
  },
  {
    id: "war",
    title: "A Quiet War",
    year: 1982,
    romaji: "SHIZUKANA SENSO",
    kanji: "A QUIET WAR",
    genre: "War",
    mins: 118,
    tone: "charcoal",
    desc: "A soldier returns to a silent border town where no one admits the fighting ended.",
    q: ["soldier portrait engraving", "war etching"],
    seed: "quiet-war",
  },
  {
    id: "door",
    title: "Red Door",
    year: 1984,
    romaji: "AKAI TOBIRA",
    kanji: "RED DOOR",
    genre: "Thriller",
    mins: 97,
    tone: "red",
    desc: "A detective follows a single red door through a city that insists it does not exist.",
    q: ["red door architecture print", "doorway interior print"],
    seed: "red-door",
  },
];
const TABS = [
  { l: "ALL", f: 0 },
  { l: "1950s", f: 0 },
  { l: "1960s", f: 2 },
  { l: "1970s", f: 5 },
  { l: "1980s", f: 11 },
];
const BASE = [
  [0, 0],
  [0.25, 0],
  [0.5, 0],
  [0.75, 0],
  [1, 0],
  [1, 0.33],
  [1, 0.66],
  [1, 1],
  [0.75, 1],
  [0.5, 1],
  [0.25, 1],
  [0, 1],
  [0, 0.66],
  [0, 0.33],
];
const decade = (y) => (y < 1960 ? 1 : y < 1970 ? 2 : y < 1980 ? 3 : 4);
const wrap = (n) => ((n % 12) + 12) % 12;
const hash = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const picsum = (s) => `https://picsum.photos/seed/${s}/440/800`;
const poly = (a) =>
  `polygon(${a.map((p) => `${(p[0] * 100).toFixed(2)}% ${(p[1] * 100).toFixed(2)}%`).join(",")})`;
const used = new Set();
const getJSON = async (url) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 6000);
  try {
    const r = await fetch(url, { signal: c.signal });
    if (!r.ok) throw new Error("bad");
    return await r.json();
  } finally {
    clearTimeout(t);
  }
};
const choose = (list, id) => {
  for (let i = 0; i < list.length; i++) {
    const u = list[(hash(id) + i) % list.length];
    if (!used.has(u)) return u;
  }
  return list[hash(id) % list.length];
};

async function aic(q, id) {
  const d = await getJSON(
    "https://api.artic.edu/api/v1/artworks/search?" +
      new URLSearchParams({
        q,
        "query[term][is_public_domain]": "true",
        fields: "id,image_id",
        limit: "20",
      }),
  );
  const urls = (d.data || [])
    .filter((x) => x.image_id)
    .map((x) => `${d.config.iiif_url}/${x.image_id}/full/843,/0/default.jpg`);
  return urls.length ? choose(urls, id) : null;
}
async function met(q) {
  const d = await getJSON(
    `https://collectionapi.metmuseum.org/public/collection/v1.1/search?hasImages=true&isPublicDomain=true&q=${encodeURIComponent(q)}`,
  );
  for (const oid of (d.objectIDs || []).slice(0, 6)) {
    try {
      const o = await getJSON(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${oid}`,
      );
      if (o.primaryImageSmall) return o.primaryImageSmall;
    } catch {
      null;
    }
  }
  return null;
}
async function resolve(f) {
  try {
    const c = sessionStorage.getItem("vhs-art-" + f.id);
    if (c) return c;
  } catch {
    null;
  }
  for (const q of f.q) {
    try {
      const u = await aic(q, f.id);
      if (u) {
        used.add(u);
        try {
          sessionStorage.setItem("vhs-art-" + f.id, u);
        } catch {
          null;
        }
        return u;
      }
    } catch {
      continue;
    }
  }
  for (const q of f.q) {
    try {
      const u = await met(q);
      if (u) {
        used.add(u);
        try {
          sessionStorage.setItem("vhs-art-" + f.id, u);
        } catch {
          null;
        }
        return u;
      }
    } catch {
      continue;
    }
  }
  return null;
}

export default function AnimatedHeroSection() {
  const [m, setM] = useState({ k: 1, TH: 360, S: 56, E: 170, mob: false });
  const [art, setArt] = useState({});
  const [focus, setFocus] = useState(0);
  const [view, setView] = useState("shelf");
  const [openId, setOpenId] = useState(0);
  const [cursorOn, setCursorOn] = useState(false);
  const [fine, setFine] = useState(false);
  const state = useRef({ pos: 0 }).current;
  const mRef = useRef(m);
  const artRef = useRef(art);
  const focusRef = useRef(0);
  const tapeRefs = useRef([]);
  const trackRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const coverRef = useRef(null);
  const hoverT = useRef(null);
  const glide = useRef(null);
  const scrub = useRef(null);
  const scrubTo = useRef(0);
  const polled = useRef(new Set());
  const reduced = useRef(false);
  mRef.current = m;
  artRef.current = art;

  const layout = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { k: kk, S, E } = mRef.current;
    const CX = el.clientWidth / 2;
    const pos = state.pos;
    const k0 = Math.round(pos);
    const u = pos - k0 + 0.5;
    const w = (k) => S + E * Math.max(0, 1 - Math.abs(k - pos));
    const ws = {},
      ls = {};
    ws[k0] = w(k0);
    ls[k0] = CX - u * ws[k0];
    for (let k = k0 + 1; k <= k0 + 18; k++) {
      ws[k] = w(k);
      ls[k] = ls[k - 1] + ws[k - 1];
    }
    for (let k = k0 - 1; k >= k0 - 17; k--) {
      ws[k] = w(k);
      ls[k] = ls[k + 1] - ws[k];
    }
    for (let k = k0 - 17; k <= k0 + 18; k++) {
      const node = tapeRefs.current[((k % 36) + 36) % 36];
      if (!node) continue;
      const d = k - pos;
      const b = Math.max(0, 1 - Math.abs(d));
      gsap.set(node, {
        left: ls[k],
        width: ws[k],
        y: -6 * kk * b,
        scale: 1 + 0.04 * b,
        rotateZ: 2 * b,
        rotateY: Math.abs(d) < 1 ? -10 * d : 0,
      });
      if (node.children[0])
        gsap.set(node.children[0], { opacity: 1 - Math.min(1, b * 1.4) });
      if (node.children[1])
        gsap.set(node.children[1], { opacity: Math.min(1, b * 1.4) });
    }
    const fi = wrap(Math.round(pos));
    if (fi !== focusRef.current) {
      focusRef.current = fi;
      setFocus(fi);
    }
  }, [state]);

  const goTo = useCallback(
    (idx) => {
      const cur = wrap(Math.round(state.pos));
      let d = wrap(idx - cur);
      if (d > 6) d -= 12;
      scrub.current = null;
      if (glide.current) glide.current.kill();
      glide.current = gsap.to(state, {
        pos: Math.round(state.pos) + d,
        duration: reduced.current
          ? 0
          : Math.min(1.1, Math.max(0.6, 0.55 + 0.08 * Math.abs(d))),
        ease: "expo.out",
        overwrite: true,
        onUpdate: layout,
      });
    },
    [state, layout],
  );

  const step = useCallback(
    (n) => goTo(wrap(wrap(Math.round(state.pos)) + n)),
    [goTo, state],
  );
  const doOpen = useCallback(() => {
    setOpenId(focusRef.current);
    setView("open");
  }, []);
  const doClose = useCallback(
    () => setView((v) => (v === "open" ? "closing" : v)),
    [],
  );

  useEffect(() => {
    const r = () => {
      reduced.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mob = innerWidth < 768;
      const k = Math.max(
        0.6,
        Math.min(1.4, Math.min(innerWidth / 1440, innerHeight / 800)),
      );
      setM({
        k,
        TH: mob ? innerHeight * 0.52 : 360 * k,
        S: mob ? 34 : 56 * k,
        E: mob ? 110 : 170 * k,
        mob,
      });
    };
    r();
    addEventListener("resize", r);
    setFine(matchMedia("(pointer:fine)").matches);
    return () => removeEventListener("resize", r);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(layout);
    return () => cancelAnimationFrame(id);
  }, [m, layout]);

  useEffect(() => {
    let alive = true;
    FILMS.forEach((f) =>
      resolve(f).then((u) => {
        if (alive && u) setArt((a) => ({ ...a, [f.id]: u }));
      }),
    );
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const timers = [focus - 1, focus, focus + 1].map((fi, n) => {
      const f = FILMS[wrap(fi)];
      if (polled.current.has(f.id)) return null;
      polled.current.add(f.id);
      return setTimeout(
        () => {
          const cur = artRef.current[f.id];
          if (cur && !cur.includes("picsum")) return;
          setArt((a) => ({
            ...a,
            [f.id]: `https://image.pollinations.ai/prompt/${encodeURIComponent("vintage linocut poster, flat two-ink, grain, no text, " + f.q[0])}?width=440&height=800&seed=${hash(f.id)}&model=flux&nologo=true`,
          }));
        },
        3500 + n * 700,
      );
    });
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, [focus]);

  useEffect(() => {
    if (!fine || m.mob) return;
    const r = ringRef.current;
    const ctx = gsap.context(() => {
      gsap.set(r, {
        xPercent: -50,
        yPercent: -50,
        x: innerWidth / 2,
        y: innerHeight / 2,
      });
    });
    const qx = gsap.quickTo(r, "x", {
      duration: reduced.current ? 0 : 0.35,
      ease: "power3.out",
    });
    const qy = gsap.quickTo(r, "y", {
      duration: reduced.current ? 0 : 0.35,
      ease: "power3.out",
    });
    const move = (e) => {
      qx(e.clientX);
      qy(e.clientY);
    };
    addEventListener("pointermove", move);
    return () => {
      removeEventListener("pointermove", move);
      ctx.revert();
    };
  }, [fine, m.mob]);

  useEffect(() => {
    if (!fine || m.mob) return;
    const ctx = gsap.context(() => {
      gsap.to(ringRef.current, {
        width: cursorOn ? 56 : 28,
        height: cursorOn ? 56 : 28,
        backgroundColor: cursorOn ? BLUE : "rgba(0,0,0,0)",
        borderWidth: cursorOn ? 0 : 1,
        duration: reduced.current ? 0 : 0.25,
        ease: "power2.out",
      });
      gsap.to(labelRef.current, {
        opacity: cursorOn ? 1 : 0,
        duration: reduced.current ? 0 : 0.2,
      });
    });
    return () => ctx.revert();
  }, [cursorOn, fine, m.mob]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") {
        doClose();
        return;
      }
      if (view !== "shelf") return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, [step, view, doClose]);

  useEffect(
    () => () => {
      if (glide.current) glide.current.kill();
    },
    [],
  );

  useEffect(() => {
    if (view !== "open") return;
    const o = overlayRef.current;
    const c = coverRef.current;
    const node = tapeRefs.current[((Math.round(state.pos) % 36) + 36) % 36];
    if (!o || !node) return;
    const r = node.getBoundingClientRect();
    const clean = BASE;
    const torn = BASE.map(([x, y]) => {
      const f = Math.random() * 0.06;
      return [x + (0.5 - x) * f, y + (0.5 - y) * f];
    });
    const D = reduced.current ? 0 : 1;
    const ctx = gsap.context(() => {
      gsap.set(o, {
        opacity: 0,
        rotateZ: 2,
        clipPath: `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 3px)`,
      });
      if (c) gsap.set(c, { clipPath: poly(torn) });
      gsap
        .timeline()
        .to(o, { opacity: 1, duration: 0.18 * D, ease: "power1.out" }, 0)
        .to(
          o,
          {
            clipPath: "inset(0px 0px 0px 0px round 0px)",
            rotateZ: 0,
            duration: 0.6 * D,
            ease: "expo.out",
          },
          0.2 * D,
        )
        .to(
          c,
          { clipPath: poly(clean), duration: 0.5 * D, ease: "power2.out" },
          0.55 * D,
        );
    }, o);
    return () => ctx.revert();
  }, [view, state]);

  useEffect(() => {
    if (view !== "closing") return;
    const o = overlayRef.current;
    const ct = contentRef.current;
    const node = tapeRefs.current[((Math.round(state.pos) % 36) + 36) % 36];
    if (!o || !node) return;
    const r = node.getBoundingClientRect();
    const D = reduced.current ? 0 : 1;
    const ctx = gsap.context(() => {
      gsap.set(o, { opacity: 1, rotateZ: 0 });
      gsap
        .timeline()
        .to(ct, { opacity: 0, x: -24, duration: 0.2 * D, ease: "power2.in" }, 0)
        .to(
          o,
          {
            clipPath: `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 3px)`,
            rotateZ: 2,
            duration: 0.6 * D,
            ease: "power3.inOut",
          },
          0.05 * D,
        )
        .to(o, { opacity: 0, duration: 0.15 * D, ease: "power1.in" }, 0.65 * D)
        .add(() => setView("shelf"));
    }, o);
    return () => ctx.revert();
  }, [view, state]);

  const img = (f) => (
    <img
      src={art[f.id] || picsum(f.seed)}
      alt=""
      draggable={false}
      onError={(e) => {
        const p = picsum(f.seed);
        if (e.currentTarget.src !== p) e.currentTarget.src = p;
      }}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        filter:
          f.tone === "charcoal"
            ? "sepia(.35) grayscale(.7) contrast(1.3) brightness(.7)"
            : `grayscale(1) contrast(1.2) brightness(${f.tone === "blue" || f.tone === "red" ? 1.25 : 0.95})`,
        mixBlendMode: f.tone === "charcoal" ? "normal" : "multiply",
      }}
    />
  );
  const d = FILMS[openId];
  const words = d.title.split(" ");
  const capTop = `calc(55% + ${m.TH / 2 + 28 * m.k}px)`;
  const stg = {
    show: { transition: { delayChildren: 0.6, staggerChildren: 0.09 } },
  };
  const fade = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };
  const linev = {
    hidden: { y: "105%" },
    show: { y: "0%", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section
      className="vhs"
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        background: PAPER,
        color: INK,
        fontFamily: SERIF,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Noto+Serif+SC:wght@600&display=swap');.vhs button{font:inherit;color:inherit}.vhs button:focus-visible{outline:2px solid ${BLUE};outline-offset:2px}.vhs img{animation:vhsIn .4s ease both}@keyframes vhsIn{from{opacity:0}to{opacity:1}}`}</style>

      <header
        style={{
          position: "absolute",
          top: 28 * m.k,
          left: 40 * m.k,
          right: 40 * m.k,
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={doClose}
          style={{
            ...MICRO,
            fontSize: 10 * m.k,
            background: "transparent",
            border: `1px solid ${INK}`,
            padding: `${6 * m.k}px ${10 * m.k}px`,
            cursor: "pointer",
          }}
        >
          {view === "shelf" ? "BACK" : "CLOSE"}
        </button>
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            color: BLUE,
          }}
        >
          <div
            style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: 18 * m.k,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            LEON VASARI
          </div>
          <div style={{ ...MICRO, fontSize: 8 * m.k, marginTop: 2 * m.k }}>
            LEON VASARI
          </div>
        </div>
        <div
          style={{
            ...MICRO,
            fontSize: 10 * m.k,
            color: GREY,
            opacity: view === "shelf" ? 1 : 0,
            transition: "opacity .2s",
          }}
        >
          CAREER 1938—1988
        </div>
      </header>

      <nav
        style={{
          position: "absolute",
          top: "22%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 10,
          overflowX: m.mob ? "auto" : "visible",
        }}
      >
        {TABS.map((t, i) => {
          const on = i === decade(FILMS[focus].year);
          return (
            <button
              key={i}
              onClick={() => goTo(t.f)}
              onMouseEnter={() => {
                hoverT.current = setTimeout(() => goTo(t.f), 150);
              }}
              onMouseLeave={() => clearTimeout(hoverT.current)}
              style={{
                ...MICRO,
                fontSize: 10 * m.k,
                position: "relative",
                height: 22 * m.k,
                padding: `0 ${12 * m.k}px`,
                border: "1px solid rgba(21,21,21,.35)",
                marginLeft: i ? -1 : 0,
                background: "transparent",
                color: on ? PAPER : INK,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {on && (
                <motion.span
                  layoutId="pill"
                  transition={{ type: "spring", stiffness: 500, damping: 45 }}
                  style={{
                    position: "absolute",
                    inset: -1,
                    background: BLUE,
                    zIndex: 0,
                  }}
                />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>{t.l}</span>
            </button>
          );
        })}
      </nav>

      <div
        ref={trackRef}
        onMouseMove={(e) => {
          if (view !== "shelf") return;
          if (scrub.current == null) {
            scrub.current = e.clientX;
            scrubTo.current = state.pos;
            return;
          }
          const dx = e.clientX - scrub.current;
          scrub.current = e.clientX;
          if (!dx) return;
          scrubTo.current -= dx / (mRef.current.S + mRef.current.E);
          glide.current = gsap.to(state, {
            pos: scrubTo.current,
            duration: reduced.current ? 0 : 0.4,
            ease: "power3.out",
            overwrite: true,
            onUpdate: layout,
          });
        }}
        onMouseLeave={() => {
          scrub.current = null;
        }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "55%",
          height: 0,
          perspective: 1400,
        }}
      >
        {Array.from({ length: 36 }, (_, j) => {
          const f = FILMS[j % 12];
          const t = TON[f.tone];
          return (
            <button
              key={j}
              ref={(el) => {
                tapeRefs.current[j] = el;
              }}
              aria-label={f.title}
              onMouseEnter={() => {
                const p = state.pos,
                  k = j + 36 * Math.round((p - j) / 36);
                if (Math.abs(k - p) < 0.5) setCursorOn(true);
              }}
              onMouseLeave={() => setCursorOn(false)}
              onClick={() => {
                const p = state.pos,
                  k = j + 36 * Math.round((p - j) / 36);
                if (Math.abs(k - p) < 0.5) doOpen();
                else goTo(j % 12);
              }}
              style={{
                position: "absolute",
                top: -m.TH / 2,
                height: m.TH,
                width: m.S,
                border: 0,
                padding: 0,
                background: t[0],
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 24px 18px -14px rgba(0,0,0,.28)",
                cursor: "pointer",
                transformOrigin: "center center",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 8 * m.k,
                  color: t[1],
                  background: t[0],
                }}
              >
                <span
                  style={{
                    width: 28 * m.k,
                    height: 28 * m.k,
                    borderRadius: "50%",
                    overflow: "hidden",
                    flex: "0 0 auto",
                  }}
                >
                  {img(f)}
                </span>
                <span
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: 15 * m.k,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    maxHeight: "68%",
                  }}
                >
                  {f.title}
                </span>
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4 * m.k,
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      width: "100%",
                      height: 1,
                      background: t[1],
                      opacity: 0.5,
                    }}
                  />
                  <span
                    style={{
                      ...MICRO,
                      fontSize: 6 * m.k,
                      border: `1px solid ${t[1]}`,
                      padding: "1px 4px",
                    }}
                  >
                    VHS
                  </span>
                </span>
              </span>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  background: t[0],
                  isolation: "isolate",
                }}
              >
                {img(f)}
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,0) 30%,rgba(0,0,0,0) 52%,rgba(0,0,0,.6))",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "repeating-radial-gradient(circle at 1px 1px,rgba(0,0,0,.4) 1px,rgba(0,0,0,0) 1.4px)",
                    backgroundSize: `${3 * m.k}px ${3 * m.k}px`,
                    opacity: 0.09,
                    mixBlendMode: "overlay",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: 8 * m.k,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    ...MICRO,
                    fontSize: 6 * m.k,
                    color: PAPER,
                  }}
                >
                  A LEON VASARI FILM
                </span>
                <span
                  style={{
                    position: "absolute",
                    bottom: 34 * m.k,
                    left: 8 * m.k,
                    right: 8 * m.k,
                    textAlign: "center",
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: 17 * m.k,
                    lineHeight: 0.95,
                    color: PAPER,
                    textTransform: "uppercase",
                    letterSpacing: "-.01em",
                  }}
                >
                  {f.title}
                </span>
                <span
                  style={{
                    position: "absolute",
                    right: 8 * m.k,
                    bottom: 8 * m.k,
                    ...MICRO,
                    fontSize: 6 * m.k,
                    color: PAPER,
                    border: `1px solid ${PAPER}`,
                    padding: "1px 4px",
                  }}
                >
                  VHS
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: capTop,
          textAlign: "center",
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={focus}
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ fontFamily: SERIF, fontSize: 22 * m.k }}>
              {FILMS[focus].title}
            </div>
            <div style={{ ...MICRO, color: BLUE, marginTop: 6 * m.k }}>
              {FILMS[focus].romaji} | {FILMS[focus].kanji}
            </div>
            <div style={{ ...MICRO, color: GREY, marginTop: 4 * m.k }}>
              {FILMS[focus].year}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={() => step(-1)}
        aria-label="Previous film"
        style={{
          position: "absolute",
          left: 40 * m.k,
          top: capTop,
          zIndex: 10,
          background: "none",
          border: 0,
          fontSize: 18 * m.k,
          cursor: "pointer",
        }}
      >
        ←
      </button>
      <button
        onClick={() => step(1)}
        aria-label="Next film"
        style={{
          position: "absolute",
          right: 40 * m.k,
          top: capTop,
          zIndex: 10,
          background: "none",
          border: 0,
          fontSize: 18 * m.k,
          cursor: "pointer",
        }}
      >
        →
      </button>
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 40 * m.k,
          ...MICRO,
          fontSize: 9,
          color: GREY,
        }}
      >
        © LEON VASARI · ALL RIGHTS RESERVED
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 40 * m.k,
          ...MICRO,
          fontSize: 9,
          color: GREY,
        }}
      >
        SELECTED FILMS 1958—1984
      </div>

      {view !== "shelf" && (
        <div
          ref={overlayRef}
          style={{
            position: "fixed",
            inset: 0,
            background: PAPER,
            zIndex: 50,
            overflow: "hidden",
            opacity: 0,
          }}
        >
          <div ref={contentRef} style={{ position: "absolute", inset: 0 }}>
            <motion.div
              initial="hidden"
              animate="show"
              variants={stg}
              style={{
                position: "absolute",
                left: "7vw",
                top: m.mob ? "60%" : "50%",
                transform: m.mob ? "none" : "translateY(-50%)",
                maxWidth: m.mob ? "86vw" : "30vw",
              }}
            >
              <motion.div
                variants={fade}
                style={{ ...MICRO, color: BLUE, marginBottom: 16 * m.k }}
              >
                {d.romaji} | {d.kanji}
              </motion.div>
              <h1
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontWeight: 400,
                  fontSize: m.mob ? 40 : 70 * m.k,
                  lineHeight: 0.95,
                  letterSpacing: "-.02em",
                }}
              >
                <span style={{ display: "block", overflow: "hidden" }}>
                  <motion.span variants={linev} style={{ display: "block" }}>
                    {words.slice(0, -1).join(" ")}
                  </motion.span>
                </span>
                <span style={{ display: "block", overflow: "hidden" }}>
                  <motion.span variants={linev} style={{ display: "block" }}>
                    {words[words.length - 1]}
                  </motion.span>
                </span>
              </h1>
              <motion.div
                variants={fade}
                style={{ ...MICRO, color: GREY, marginTop: 18 * m.k }}
              >
                {d.year} / {d.genre} / {d.mins} MIN
              </motion.div>
              <motion.p
                variants={fade}
                style={{
                  fontFamily: SERIF,
                  fontSize: 14 * m.k,
                  lineHeight: 1.6,
                  margin: `${18 * m.k}px 0 0`,
                  color: INK,
                }}
              >
                {d.desc}
              </motion.p>
              <motion.div
                variants={fade}
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 13 * m.k,
                  color: GREY,
                  marginTop: 16 * m.k,
                }}
              >
                Written and directed by Leon Vasari
              </motion.div>
              <motion.button
                variants={fade}
                whileHover={{ backgroundColor: BLUE, color: PAPER }}
                style={{
                  marginTop: 24 * m.k,
                  border: `1px solid ${BLUE}`,
                  background: "transparent",
                  color: BLUE,
                  padding: `${12 * m.k}px ${18 * m.k}px`,
                  ...MICRO,
                  fontSize: 10 * m.k,
                  cursor: "pointer",
                }}
              >
                WATCH THE FILM
              </motion.button>
            </motion.div>
            <div
              ref={coverRef}
              style={{
                position: "absolute",
                left: m.mob ? "50%" : "73%",
                top: m.mob ? "28%" : "50%",
                width: m.mob ? "46vw" : 300 * m.k,
                height: m.mob ? "min(88vw, 50vh)" : 580 * m.k,
                transform: "translate(-50%,-50%)",
                overflow: "hidden",
                background: TON[d.tone][0],
                isolation: "isolate",
              }}
            >
              {img(d)}
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg,rgba(0,0,0,.42),rgba(0,0,0,0) 34%,rgba(0,0,0,0) 52%,rgba(0,0,0,.62))",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "12%",
                  top: "18%",
                  width: "38%",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle,rgba(241,239,233,.9),rgba(241,239,233,0) 70%)",
                  opacity: 0.7,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "repeating-radial-gradient(circle at 1px 1px,rgba(0,0,0,.4) 1px,rgba(0,0,0,0) 1.5px)",
                  backgroundSize: "3px 3px",
                  opacity: 0.1,
                  mixBlendMode: "overlay",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  top: "4%",
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  ...MICRO,
                  fontSize: 9,
                  color: PAPER,
                }}
              >
                A LEON VASARI FILM
              </span>
              <span
                style={{
                  position: "absolute",
                  bottom: "14%",
                  left: "8%",
                  right: "8%",
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: 34,
                  lineHeight: 0.92,
                  letterSpacing: "-.01em",
                  textTransform: "uppercase",
                  color: PAPER,
                }}
              >
                {d.title}
              </span>
              <span
                style={{
                  position: "absolute",
                  right: "7%",
                  bottom: "5%",
                  ...MICRO,
                  fontSize: 9,
                  color: PAPER,
                  border: `1px solid ${PAPER}`,
                  padding: "3px 6px",
                }}
              >
                VHS
              </span>
            </div>
          </div>
        </div>
      )}

      {fine && !m.mob && (
        <div
          ref={ringRef}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: 28,
            height: 28,
            boxSizing: "border-box",
            border: `1px solid ${INK}`,
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
          }}
        >
          <span
            ref={labelRef}
            style={{ ...MICRO, fontSize: 9, color: PAPER, opacity: 0 }}
          >
            OPEN
          </span>
        </div>
      )}
    </section>
  );
}
