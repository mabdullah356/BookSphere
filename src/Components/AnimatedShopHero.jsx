import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  FaArrowRight,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import gsap from "gsap";
import { useCart } from "../Contexts/CartContext";

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;

const STORE = "https://thebooksphere.com";
const TYPES = ["Sweatshirts", "T-Shirts", "Accessories"];
const COLLECTIONS = [
  { handle: "sweatshirts", type: "Sweatshirts" },
  { handle: "t-shirts", type: "T-Shirts" },
  { handle: "accessories", type: "Accessories" },
];

const DEFAULT_DESC = {
  Sweatshirts:
    "Heavyweight fleece, brushed inside and embroidered in small batches for readers who like to wear their shelves.",
  "T-Shirts":
    "Organic cotton jersey, garment-washed for an easy hand and printed with archival ink that softens with time.",
  Accessories:
    "Everyday carry for the chronically bookmarked. Canvas, cotton and quiet details, built to age well.",
};

const SWATCH = {
  "light pink": "#f2c7d4",
  heliconia: "#d94f86",
  military: "#4b5240",
  "sport grey": "#9a9a98",
  black: "#1c1a19",
  white: "#f6f3ec",
  navy: "#27364f",
  maroon: "#6e2b32",
  purple: "#5b3d78",
  pink: "#d94f86",
  sand: "#d8c3a1",
  grey: "#9a9a98",
  gray: "#9a9a98",
  green: "#4b5240",
  blue: "#9cbfd8",
  ash: "#b9b4ac",
  cream: "#efe4cc",
  red: "#8c2f2f",
};

const mod = (n, m) => ((n % m) + m) % m;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const pad = (n) => String(Math.max(0, n)).padStart(2, "0");
const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const colorFor = (name) => {
  const key = String(name || "").toLowerCase();
  const hit = Object.keys(SWATCH).find((token) => key.includes(token));
  return hit ? SWATCH[hit] : "#b98a8f";
};

const shopImg = (url, width = 800) => {
  if (!url) return "";
  if (!url.includes("cdn.shopify.com")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}width=${width}`;
};

function labelFor(type, name) {
  const n = String(name || "").toLowerCase();
  if (n.includes("hoodie")) return "Heavyweight hoodie";
  if (n.includes("sweatshirt") || n.includes("crew")) {
    return n.includes("embroider")
      ? "Embroidered sweatshirt"
      : "Small-batch sweatshirt";
  }
  if (n.includes("crop")) return "Cropped tee";
  if (n.includes("t-shirt") || n.includes("tee")) return "Organic cotton tee";
  if (n.includes("hat") || n.includes("cap")) return "Embroidered cap";
  if (n.includes("tote")) return "Canvas tote";
  if (type === "Accessories") return "Everyday accessory";
  return "Small-batch piece";
}

function stripHtml(html) {
  if (!html) return "";
  if (typeof document === "undefined") {
    return String(html).replace(/<[^>]*>/g, " ");
  }
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent || "").replace(/\s+/g, " ").trim();
}

const trimText = (text, max) => {
  const value = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  return value.length > max ? `${value.slice(0, max - 1).trim()}…` : value;
};

const piece = (id, name, type, price, handle, image, extra = {}) => ({
  id,
  name,
  handle,
  type,
  price,
  compareAt: extra.compareAt ?? null,
  image,
  images:
    Array.isArray(extra.images) && extra.images.length
      ? extra.images
      : [image],
  sizes:
    extra.sizes && extra.sizes.length
      ? extra.sizes
      : type === "Accessories"
        ? ["One size"]
        : ["S", "M", "L", "XL"],
  colors: extra.colors || [],
  label: extra.label || labelFor(type, name),
  desc: extra.desc || DEFAULT_DESC[type],
  badge: extra.badge || null,
  vendor: extra.vendor || "The Booksphere",
  tags: Array.isArray(extra.tags) ? extra.tags : [],
});

const FALLBACK = [
  piece("bk-dragon-crew", "Book Dragon Embroidered Sweatshirt", "Sweatshirts", 48.99, "book-dragon-sweatshirt", "https://cdn.shopify.com/s/files/1/0955/1183/9102/files/unisex-crew-neck-sweatshirt-navy-front-68dc21e7af387.png?v=1772645314", { colors: ["Navy"], badge: "Embroidered" }),
  piece("bk-tropes-crew", "Book Tropes Sweatshirt", "Sweatshirts", 44.99, "book-tropes-sweatshirt", "https://cdn.shopify.com/s/files/1/0955/1183/9102/files/unisex-crew-neck-sweatshirt-light-pink-front-6900af951abba.png?v=1761671640", { colors: ["Light Pink"] }),
  piece("bk-hoodie-sand", "I'd Rather Be Reading Embroidered Hoodie", "Sweatshirts", 54.99, "id-rather-be-reading-hoodie", "https://cdn.shopify.com/s/files/1/0955/1183/9102/files/unisex-heavy-blend-hoodie-sand-front-690f826f4cb3d.png?v=1762631055", { colors: ["Sand"], badge: "Heavyweight" }),
  piece("bk-bookshop-hoodie", "Meet Me at the Bookshop Hoodie", "Sweatshirts", 48.99, "meet-me-at-the-bookshop-hoodie", "https://cdn.shopify.com/s/files/1/0955/1183/9102/files/unisex-heavy-blend-hoodie-military-green-front-6915ae28b26f9.png?v=1763028578", { colors: ["Military Green"] }),
  piece("bk-bookaholic-tee", "Bookaholic T-shirt", "T-Shirts", 29.99, "bookaholic-t-shirt", "https://cdn.shopify.com/s/files/1/0955/1183/9102/files/unisex-classic-tee-heliconia-front-699da21ab0d9b.png?v=1771938412", { colors: ["Heliconia", "Maroon", "Purple", "Black"], badge: "Bestseller" }),
  piece("bk-bookday-tee", "A Book a Day T-shirt", "T-Shirts", 29.99, "a-book-a-day-t-shirt", "https://cdn.shopify.com/s/files/1/0955/1183/9102/files/unisex-classic-tee-ash-front-68b6b7a48801c.png?v=1771937964", { colors: ["Ash"] }),
  piece("bk-dragon-tee", "Book Dragon T-shirt", "T-Shirts", 29.99, "book-dragon-t-shirt", "https://cdn.shopify.com/s/files/1/0955/1183/9102/files/unisex-classic-tee-purple-front-69035425e6a47.png?v=1772794003", { colors: ["Purple"] }),
  piece("bk-heartbeat-tee", "Book Lover's Heartbeat T-shirt", "T-Shirts", 29.99, "book-lovers-heartbeat-t-shirt", "https://cdn.shopify.com/s/files/1/0955/1183/9102/files/unisex-classic-tee-ash-front-68b6ffc1ab1bf.png?v=1771937553", { colors: ["Ash"] }),
  piece("bk-chapter-tee", "Just One More Chapter T-shirt", "T-Shirts", 29.99, "just-one-more-chapter-t-shirt", "https://cdn.shopify.com/s/files/1/0955/1183/9102/files/unisex-classic-tee-white-front-68d59fbe70fc4.png?v=1758830537", { colors: ["White"], badge: "New arrival" }),
  piece("bk-clubbing-tee", "Book Clubbing T-shirt", "T-Shirts", 29.99, "book-clubbing-t-shirt", "https://cdn.shopify.com/s/files/1/0955/1183/9102/files/unisex-classic-tee-navy-front-68b708c53d5ce.png?v=1756825811", { colors: ["Navy"] }),
  piece("bk-dragon-hat", "Book Dragon Embroidered Hat", "Accessories", 27.99, "book-dragon-embroidered-hat", "https://cdn.shopify.com/s/files/1/0955/1183/9102/files/classic-dad-hat-black-front-68bad111147f5.png?v=1762630959", { colors: ["Black"], badge: "Embroidered" }),
  piece("bk-lover-hat", "Book Lover Embroidered Hat", "Accessories", 27.99, "book-lover-embroidered-hat", "https://cdn.shopify.com/s/files/1/0955/1183/9102/files/classic-dad-hat-pink-front-68b5c7121311d.png?v=1756743464", { colors: ["Pink"] }),
  piece("bk-shelf-tote", "Bookshelf Pattern Tote bag", "Accessories", 24.99, "bookshelf-pattern-tote-bag", "https://cdn.shopify.com/s/files/1/0955/1183/9102/files/all-over-print-tote-bag-black-15x15-front-68b5fb70644b3.png?v=1756756867", { colors: ["Black"], badge: "Signature" }),
  piece("bk-bookday-tote", "A Book a Day Tote Bag", "Accessories", 24.99, "eco-tote-bag", "https://cdn.shopify.com/s/files/1/0955/1183/9102/files/eco-tote-bag-black-front-68bb1c4d07304.png?v=1757092953", { colors: ["Black"] }),
  piece("bk-mood-tote", "The Mood Reader Tote Bag", "Accessories", 24.99, "the-mood-reader-eco-tote-bag", "https://cdn.shopify.com/s/files/1/0955/1183/9102/files/eco-tote-bag-black-front-68b5e8be73c7b.png?v=1756752074", { colors: ["Black"] }),
];

const CACHE_KEY = "bs-shop-catalogue-v3";
const CACHE_TTL = 20 * 60 * 1000;

const session = {
  get(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      /* storage unavailable */
    }
  },
};

function readCache() {
  try {
    const raw = session.get(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.at || Date.now() - parsed.at > CACHE_TTL) {
      return null;
    }
    if (!Array.isArray(parsed.items) || parsed.items.length < 4) return null;
    return parsed.items;
  } catch {
    return null;
  }
}

function writeCache(items) {
  try {
    session.set(CACHE_KEY, JSON.stringify({ at: Date.now(), items }));
  } catch {
    /* quota */
  }
}

async function requestJSON(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`${response.status} on ${url}`);
  return response.json();
}

function mapShopify(product, type) {
  if (!product || !product.handle || !product.title) return null;

  const rawImages = Array.isArray(product.images) ? product.images : [];
  const images = rawImages
    .map((image) => (typeof image === "string" ? image : image && image.src))
    .filter(Boolean)
    .map((src) => shopImg(src, 1000));

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const prices = variants
    .map((variant) => Number.parseFloat(variant && variant.price))
    .filter((value) => Number.isFinite(value));
  const compares = variants
    .filter((variant) => variant && variant.compare_at_price)
    .map((variant) => Number.parseFloat(variant.compare_at_price))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  const price = prices.length ? Math.min(...prices) : 0;
  const compareAt = compares.length && compares[0] > price ? compares[0] : null;

  const sizes = new Set();
  const colors = new Set();
  variants.forEach((variant) => {
    const chunks = String((variant && variant.title) || "")
      .split(/\s*\/\s*|\s*,\s*/)
      .map((part) => part.trim())
      .filter((part) => part && !/^default title$/i.test(part));
    chunks.forEach((chunk) => {
      if (
        /^(xxs|xs|s|m|l|xl|xxl|xxxl|2xl|3xl|4xl|5xl|one size)$/i.test(chunk)
      ) {
        sizes.add(/^one size$/i.test(chunk) ? "One size" : chunk.toUpperCase());
      } else {
        colors.add(chunk);
      }
    });
  });

  const options = Array.isArray(product.options) ? product.options : [];
  options.forEach((option) => {
    if (!option || typeof option === "string") return;
    if (/colou?r/i.test(option.name || "") && Array.isArray(option.values)) {
      option.values.forEach((value) => value && colors.add(String(value)));
    }
  });

  const tags = String(product.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const badgeMatch = tags.find((tag) =>
    /bestseller|new arrival|signature|featured|limited/i.test(tag),
  );

  const body = trimText(stripHtml(product.body_html), 220);

  return {
    id: String(product.id || product.handle),
    handle: product.handle,
    name: product.title,
    type,
    price,
    compareAt,
    image: images[0] || "",
    images: images.length ? images : [""],
    sizes: sizes.size
      ? Array.from(sizes)
      : type === "Accessories"
        ? ["One size"]
        : ["S", "M", "L", "XL"],
    colors: Array.from(colors),
    label: labelFor(type, product.title),
    desc: body || DEFAULT_DESC[type],
    badge: badgeMatch || null,
    vendor: product.vendor || "The Booksphere",
    tags,
  };
}

async function loadCatalogue(signal) {
  const settled = await Promise.allSettled(
    COLLECTIONS.map((collection) =>
      requestJSON(
        `${STORE}/collections/${collection.handle}/products.json?limit=20`,
      ).then((data) => {
        const products = Array.isArray(data && data.products)
          ? data.products
          : [];
        return products
          .map((product) => mapShopify(product, collection.type))
          .filter(Boolean);
      }),
    ),
  );
  if (signal && signal.aborted) return [];

  const buckets = settled.map((result) =>
    result.status === "fulfilled" && Array.isArray(result.value)
      ? result.value
      : [],
  );
  const max = buckets.reduce((longest, bucket) => Math.max(longest, bucket.length), 0);
  const merged = [];
  for (let index = 0; index < max; index += 1) {
    buckets.forEach((bucket) => {
      if (bucket[index]) merged.push(bucket[index]);
    });
  }
  return merged;
}

function seedFromItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item, index) => {
      if (!item) return null;
      const image =
        (typeof item.image === "string" && item.image) ||
        (Array.isArray(item.images) ? item.images[0] : "") ||
        "";
      const type = TYPES.includes(item.type) ? item.type : "T-Shirts";
      const name = item.name || `Booksphere piece ${index + 1}`;
      const handle =
        item.handle ||
        String(name)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      const parsed = Number.parseFloat(
        String(item.price == null ? "" : item.price).replace(/[^0-9.]/g, ""),
      );
      const compareAt = Number.parseFloat(
        String(
          item.compareAt == null ? "" : item.compareAt,
        ).replace(/[^0-9.]/g, ""),
      );
      return piece(
        item.id || `seed-${index}`,
        name,
        type,
        Number.isFinite(parsed) ? parsed : 29.99,
        handle,
        image,
        {
          colors: Array.isArray(item.colors) ? item.colors : [],
          badge: item.badge || null,
          sizes: Array.isArray(item.sizes) ? item.sizes : undefined,
          images: Array.isArray(item.images) ? item.images : undefined,
          desc: item.desc || undefined,
          label: item.label || undefined,
          vendor: item.vendor || undefined,
          tags: Array.isArray(item.tags) ? item.tags : undefined,
          compareAt: Number.isFinite(compareAt) ? compareAt : null,
        },
      );
    })
    .filter(Boolean);
}


const STYLE_A = `
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&display=swap');

.ash-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: calc(100svh - 72px);
  padding: clamp(14px, 2.2vw, 30px) clamp(16px, 4vw, 64px) clamp(16px, 2.4vw, 28px);
  color: #F6EFDF;
  background: #fff;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
}
.ash-hero *, .ash-hero *::before, .ash-hero *::after { box-sizing: border-box; }

.ash-hero button:focus-visible, .ash-hero [tabindex]:focus-visible {
  outline: 2px solid #F6EFDF;
  outline-offset: 3px;
}
.ash-hero::before {
  content: "";
  position: absolute;
  z-index: 0;
  top: -22vw;
  right: -12vw;
  width: 56vw;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #fff;
  filter: blur(34px);
  pointer-events: none;
}
.ash-hero::after {
  content: "";
  position: absolute;
  z-index: 0;
  bottom: -24vw;
  left: -16vw;
  width: 46vw;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(196, 149, 96, .18), transparent 64%);
  filter: blur(42px);
  pointer-events: none;
}
.ash-grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: .18;
  background-image:
    radial-gradient(rgba(255, 255, 255, .6) .5px, transparent .7px),
    radial-gradient(rgba(0, 0, 0, .7) .5px, transparent .7px);
  background-size: 3px 3px, 4px 4px;
  background-position: 0 0, 1px 2px;
  mix-blend-mode: overlay;
}
.ash-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  gap: clamp(10px, 1.6vh, 20px);
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}
.ash-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(246, 239, 223, .16);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: .26em;
  text-transform: uppercase;
  color: rgba(246, 239, 223, .55);
}
.ash-eyebrow { display: inline-flex; align-items: center; gap: 9px; }
.ash-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #D98E86;
  box-shadow: 0 0 0 0 rgba(217, 142, 134, .6);
  animation: ash-pulse 2.8s ease-out infinite;
}
.ash-grid {
  display: grid;
  flex: 1;
  grid-template-columns: minmax(290px, .8fr) minmax(0, 1.2fr);
  align-items: center;
  gap: clamp(16px, 3vw, 52px);
  padding-block: clamp(6px, 1.4vh, 18px);
}
.ash-copy {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: clamp(13px, 1.9vh, 22px);
  max-width: 570px;
}
.ash-kicker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .28em;
  text-transform: uppercase;
  color: rgba(246, 239, 223, .6);
}
.ash-kicker::before {
  content: "";
  width: 28px;
  height: 1px;
  background: #A7545F;
}
.ash-title {
  margin: 0;
  font-family: "Newsreader", Georgia, "Times New Roman", serif;
  font-size: clamp(2.85rem, 6.3vw, 6rem);
  font-weight: 300;
  line-height: .9;
  letter-spacing: -.045em;
  text-wrap: balance;
}
.ash-title__line { display: block; }
.ash-title__line--accent {
  font-style: italic;
  font-weight: 400;
  color: #E9A9A1;
  padding-bottom: .08em;
}
.ash-title__line--accent em { font-style: normal; color: #F6EFDF; }
.ash-lede {
  max-width: 42ch;
  margin: 0;
  font-size: clamp(12.5px, 1.02vw, 14.5px);
  line-height: 1.75;
  color: rgba(246, 239, 223, .66);
}
.ash-filters {
  display: flex;
  align-items: center;
  gap: 1px;
  width: fit-content;
  max-width: 100%;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.ash-filters::-webkit-scrollbar { display: none; }
.ash-filter {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  padding: 6px 7px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: rgba(246, 239, 223, .66);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition: color .25s ease;
}
.ash-filter:hover { color: #F6EFDF; }
.ash-filter.is-on {
  color: #F6EFDF;
  text-decoration: underline;
  text-decoration-color: #E9A9A1;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
}
.ash-filter sup { font-size: 7px; letter-spacing: 0; opacity: .62; }
.ash-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; }
.ash-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 13px 20px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: .15em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform .35s cubic-bezier(.16, 1, .3, 1), background .35s ease, color .35s ease, border-color .35s ease, box-shadow .35s ease;
}
.ash-btn svg { width: 10px; height: 10px; transition: transform .35s cubic-bezier(.16, 1, .3, 1); }
.ash-btn--solid {
  background: #F6EFDF;
  color: #17100E;
  box-shadow: 0 20px 44px -22px rgba(246, 239, 223, .55);
}
.ash-btn--solid:hover { transform: translateY(-2px); background: #fffaf0; }
.ash-btn--solid:hover svg { transform: translateX(3px); }
.ash-btn--ghost {
  border-color: rgba(246, 239, 223, .22);
  background: transparent;
  color: #F6EFDF;
}
.ash-btn--ghost:hover { transform: translateY(-2px); border-color: rgba(246, 239, 223, .45); background: rgba(246, 239, 223, .07); }
.ash-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 7px 18px;
  margin: 3px 0 0;
  padding: 0;
  list-style: none;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: .13em;
  text-transform: uppercase;
  color: rgba(246, 239, 223, .48);
}
.ash-notes li { display: inline-flex; align-items: center; gap: 6px; }
.ash-notes svg { width: 8px; height: 8px; color: #A9BE9B; }
.ash-stage-wrap {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 100%;
  min-height: clamp(360px, 52vh, 560px);
}
.ash-stage {
  position: relative;
  width: 100%;
  height: clamp(360px, 52vh, 560px);
  overflow: hidden;
  border-radius: 26px;
  perspective: 1600px;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
  cursor: none;
  outline: none;
}
.ash-stage:focus-visible { box-shadow: inset 0 0 0 1px rgba(246, 239, 223, .45); }
.ash-halo {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(88%, 640px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(246, 239, 223, .14), transparent 68%);
  filter: blur(12px);
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.ash-cards {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  will-change: transform;
}
.ash-card {
  --o: 0;
  --a: 0;
  --step: clamp(74px, 10.2vw, 138px);
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  width: clamp(182px, 19vw, 258px);
  height: clamp(252px, 26.5vw, 350px);
  padding: 10px;
  border: 0;
  border-radius: 18px;
  background: #FBF6EA;
  color: #17100E;
  text-align: left;
  box-shadow: 0 28px 70px -30px rgba(0, 0, 0, .85);
  transform:
    translate(-50%, -50%)
    translateX(calc(var(--o) * var(--step)))
    translateZ(calc(var(--a) * -110px))
    rotateY(calc(var(--o) * -27deg))
    scale(calc(1 - var(--a) * .085));
  opacity: calc(1 - var(--a) * .2);
  z-index: calc(20 - var(--a));
  filter: saturate(calc(1 - var(--a) * .2)) brightness(calc(1 - var(--a) * .1));
  transition:
    transform .78s cubic-bezier(.16, 1, .3, 1),
    opacity .55s ease,
    filter .55s ease,
    box-shadow .55s ease;
  will-change: transform;
}
.ash-card.is-active {
  box-shadow: 0 44px 100px -38px rgba(0, 0, 0, .9), 0 0 0 1px rgba(23, 16, 14, .08);
}
.ash-card__badge {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 2;
  max-width: calc(100% - 36px);
  padding: 4px 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(23, 16, 14, .88);
  color: #F6EFDF;
  font-size: 7.5px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ash-card__media {
  position: relative;
  display: grid;
  flex: 1;
  min-height: 0;
  place-items: center;
  overflow: hidden;
  border-radius: 12px;
  background:
    radial-gradient(circle at 50% 32%, #ffffff 0%, #F7F0E1 52%, #EBDFC9 100%);
}
.ash-card__media img {
  width: 100%;
  height: 100%;
  padding: 6px;
  object-fit: contain;
  filter: drop-shadow(0 14px 18px rgba(60, 38, 24, .16));
  transition: transform .8s cubic-bezier(.16, 1, .3, 1);
  pointer-events: none;
  -webkit-user-drag: none;
}
.ash-card.is-active:hover .ash-card__media img { transform: scale(1.045); }
.ash-card__ph {
  font-family: "Newsreader", Georgia, serif;
  font-style: italic;
  font-size: 30px;
  color: rgba(23, 16, 14, .35);
}
.ash-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 4px 2px;
}
.ash-card__name {
  display: -webkit-box;
  overflow: hidden;
  font-family: "Newsreader", Georgia, serif;
  font-size: 14.5px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -.01em;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.ash-card__label {
  overflow: hidden;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: rgba(23, 16, 14, .45);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ash-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 5px;
}
.ash-card__price { font-size: 11.5px; font-weight: 650; letter-spacing: .02em; }
.ash-card__swatches { display: inline-flex; align-items: center; gap: 3px; }
.ash-card__swatches i {
  display: block;
  width: 8px;
  height: 8px;
  border: 1px solid rgba(23, 16, 14, .14);
  border-radius: 50%;
}
`;
const STYLE_B = `
.ash-ring {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9;
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  margin: -34px 0 0 -34px;
  border: 1px solid rgba(246, 239, 223, .34);
  border-radius: 50%;
  background: rgba(23, 16, 14, .2);
  color: rgba(246, 239, 223, .72);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: .2em;
  text-transform: uppercase;
  backdrop-filter: blur(6px);
  pointer-events: none;
  opacity: 0;
  transition: opacity .25s ease;
  will-change: transform;
}
.ash-ring.is-live { opacity: 1; }
.ash-seal {
  position: absolute;
  top: 4px;
  right: 1%;
  z-index: 5;
  width: clamp(78px, 7vw, 104px);
  aspect-ratio: 1;
  color: rgba(246, 239, 223, .68);
  pointer-events: none;
}
.ash-seal__ring {
  width: 100%;
  height: 100%;
  animation: ash-spin 30s linear infinite;
}
.ash-seal__ring text {
  fill: currentColor;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  font-size: 7.4px;
  font-weight: 600;
  letter-spacing: .3em;
  text-transform: uppercase;
}
.ash-seal__mark {
  position: absolute;
  inset: 30%;
  display: grid;
  place-items: center;
  border: 1px solid rgba(246, 239, 223, .26);
  border-radius: 50%;
  font-family: "Newsreader", Georgia, serif;
  font-style: italic;
  font-size: 15px;
  letter-spacing: .02em;
}
.ash-foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  padding-top: 12px;
  border-top: 1px solid rgba(246, 239, 223, .16);
}
.ash-foot__details {
  display: flex;
  align-items: center;
  gap: clamp(12px, 2vw, 22px);
  min-width: 0;
}
.ash-index {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .2em;
  color: rgba(246, 239, 223, .42);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.ash-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ash-meta strong {
  max-width: 38vw;
  overflow: hidden;
  font-family: "Newsreader", Georgia, serif;
  font-size: clamp(14px, 1.4vw, 18px);
  font-weight: 500;
  letter-spacing: -.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ash-meta span {
  overflow: hidden;
  color: rgba(246, 239, 223, .5);
  font-size: 8.5px;
  font-weight: 500;
  letter-spacing: .16em;
  text-transform: uppercase;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ash-price { display: flex; align-items: baseline; gap: 7px; font-size: 12.5px; font-weight: 600; }
.ash-price em {
  color: rgba(246, 239, 223, .38);
  font-size: 10px;
  font-style: normal;
  text-decoration: line-through;
}
.ash-controls { display: flex; align-items: center; gap: 8px; }
.ash-arrow, .ash-view {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(246, 239, 223, .2);
  border-radius: 50%;
  background: transparent;
  color: #F6EFDF;
  cursor: pointer;
  transition: transform .3s cubic-bezier(.16, 1, .3, 1), background .3s ease, color .3s ease, border-color .3s ease;
}
.ash-arrow svg { width: 9px; height: 9px; }
.ash-arrow:hover { transform: translateY(-1px); border-color: #F6EFDF; background: #F6EFDF; color: #17100E; }
.ash-progress {
  display: flex;
  align-items: center;
  gap: 0;
  position: relative;
  max-width: min(38vw, 360px);
  padding: 2px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  scroll-behavior: smooth;
}
.ash-progress::-webkit-scrollbar { display: none; }
.ash-progress button {
  position: relative;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: width .4s cubic-bezier(.16, 1, .3, 1);
}
.ash-progress button::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 2px;
  margin: -1px 0 0 -6px;
  border-radius: 999px;
  background: rgba(246, 239, 223, .28);
  transition: width .3s ease, margin-left .3s ease, background .3s ease;
}
.ash-progress button:hover::after { background: rgba(246, 239, 223, .6); }
.ash-progress button.is-on { width: 34px; }
.ash-progress button.is-on::after {
  width: 22px;
  margin-left: -11px;
  background: #F6EFDF;
}
.ash-view {
  width: 44px;
  height: 44px;
  border-color: #F6EFDF;
  background: #F6EFDF;
  color: #17100E;
}
.ash-view svg { width: 12px; height: 12px; transform: rotate(-45deg); }
.ash-view:hover { transform: translateY(-2px) rotate(-8deg); background: #fffaf0; }

.ash-modal {
  position: fixed;
  inset: 0;
  z-index: 140;
  overflow: hidden;
  color: #17100E;
  background: linear-gradient(155deg, #FCF7EB 0%, #F3E8D2 100%);
  will-change: clip-path;
}
.ash-modal__grain {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: radial-gradient(rgba(23, 16, 14, .16) .5px, transparent .6px);
  background-size: 3px 3px;
  mix-blend-mode: multiply;
  opacity: .35;
  pointer-events: none;
}
.ash-modal__scroll {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: clamp(16px, 2.4vw, 34px) clamp(18px, 4vw, 56px) clamp(22px, 3vw, 46px);
  overflow-y: auto;
  overscroll-behavior: contain;
}
.ash-modal__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(23, 16, 14, .14);
}
.ash-back {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  padding: 0 13px 0 10px;
  border: 1px solid rgba(23, 16, 14, .18);
  border-radius: 999px;
  background: #FBF6EA;
  color: #17100E;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .13em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background .25s ease, border-color .25s ease, color .25s ease;
}
.ash-back:hover { border-color: #17100E; background: #17100E; color: #F6EFDF; }
.ash-back svg { width: 9px; height: 9px; }
.ash-modal__tag {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  gap: 10px;
  overflow: hidden;
  color: rgba(23, 16, 14, .62);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: .22em;
  text-transform: uppercase;
  white-space: nowrap;
}
.ash-modal__tag b { color: #17100E; font-weight: 650; letter-spacing: .16em; }
.ash-modal__tag span { color: #A7545F; }
.ash-close {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 50%;
  background: #17100E;
  color: #F6EFDF;
  cursor: pointer;
  transition: transform .35s cubic-bezier(.16, 1, .3, 1), background .3s ease;
}
.ash-close svg { width: 11px; height: 11px; }
.ash-close:hover { transform: rotate(90deg); background: #A7545F; }
.ash-modal__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.06fr) minmax(320px, .94fr);
  align-items: center;
  gap: clamp(22px, 4vw, 64px);
  min-height: calc(100vh - 128px);
  padding-top: clamp(16px, 2.6vw, 34px);
}
.ash-gallery { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.ash-gallery__main {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: clamp(300px, 52vh, 540px);
  overflow: hidden;
  border-radius: 24px;
  background: radial-gradient(circle at 50% 38%, #fffdf8 0%, #F5EBD8 58%, #E7D8BE 100%);
  box-shadow: inset 0 0 0 1px rgba(23, 16, 14, .07);
}
.ash-gallery__main img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: clamp(12px, 2vw, 28px);
  object-fit: contain;
  filter: drop-shadow(0 30px 30px rgba(69, 44, 26, .18));
}
.ash-gallery__thumbs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: thin;
}
.ash-thumb {
  flex: 0 0 auto;
  width: 62px;
  height: 70px;
  padding: 4px;
  border: 1px solid rgba(23, 16, 14, .14);
  border-radius: 10px;
  background: #FBF6EA;
  cursor: pointer;
  transition: transform .3s ease, border-color .3s ease, box-shadow .3s ease;
}
.ash-thumb img { width: 100%; height: 100%; object-fit: contain; }
.ash-thumb:hover { transform: translateY(-2px); }
.ash-thumb.is-on { border-color: #17100E; box-shadow: 0 0 0 1px #17100E; }
.ash-details { display: flex; flex-direction: column; gap: clamp(10px, 1.5vh, 16px); max-width: 530px; }
.ash-details__type {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0;
  color: #A7545F;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: .24em;
  text-transform: uppercase;
}
.ash-details__type::before { content: ""; width: 22px; height: 1px; background: currentColor; }
.ash-details__title {
  margin: 0;
  font-family: "Newsreader", Georgia, serif;
  font-size: clamp(2rem, 3.6vw, 3.4rem);
  font-weight: 400;
  line-height: .98;
  letter-spacing: -.035em;
}
.ash-details__price { display: flex; align-items: baseline; gap: 10px; font-size: 14px; font-weight: 650; }
.ash-details__price em {
  color: rgba(23, 16, 14, .45);
  font-size: 11px;
  font-style: normal;
  font-weight: 500;
  text-decoration: line-through;
}
.ash-details__price i {
  color: #A7545F;
  font-size: 8.5px;
  font-style: normal;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.ash-details__desc { max-width: 46ch; margin: 0; color: rgba(23, 16, 14, .62); font-size: 13px; line-height: 1.7; }
.ash-colors { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }
.ash-color {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px 5px 6px;
  border: 1px solid rgba(23, 16, 14, .12);
  border-radius: 999px;
  background: rgba(255, 255, 255, .35);
  color: rgba(23, 16, 14, .62);
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: .1em;
  text-transform: uppercase;
}
.ash-color i { width: 12px; height: 12px; border: 1px solid rgba(23, 16, 14, .16); border-radius: 50%; }
.ash-size-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 2px; }
.ash-size-head span { color: rgba(23, 16, 14, .55); font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; }
.ash-size-head button {
  padding: 0;
  border: 0;
  background: none;
  color: rgba(23, 16, 14, .5);
  font-size: 9px;
  letter-spacing: .08em;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-transform: uppercase;
  cursor: pointer;
}
.ash-sizes { display: flex; flex-wrap: wrap; gap: 6px; }
.ash-size-btn {
  min-width: 44px;
  padding: 10px 12px;
  border: 1px solid rgba(23, 16, 14, .16);
  border-radius: 9px;
  background: transparent;
  color: #17100E;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background .25s ease, color .25s ease, border-color .25s ease;
}
.ash-size-btn:hover { border-color: #17100E; }
.ash-size-btn.is-on { border-color: #17100E; background: #17100E; color: #F6EFDF; }
.ash-modal__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; margin-top: 4px; }
.ash-add {
  display: inline-flex;
  flex: 1 1 190px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 20px;
  border: 0;
  border-radius: 999px;
  background: #17100E;
  color: #F6EFDF;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: .15em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform .3s ease, background .3s ease;
}
.ash-add:hover { transform: translateY(-1px); background: #A7545F; }
.ash-add.is-done { background: #4B5F47; }
.ash-add svg { width: 11px; height: 11px; }
.ash-modal__notes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
  color: rgba(23, 16, 14, .45);
  font-size: 8.5px;
  font-weight: 500;
  letter-spacing: .11em;
  text-transform: uppercase;
}
.ash-modal__notes li { display: inline-flex; align-items: center; gap: 6px; }
.ash-modal__notes svg { width: 8px; height: 8px; color: #6E815F; }

`;
const STYLE_C = `
.ash-hero { color: #17100E; }
.ash-hero button:focus-visible, .ash-hero [tabindex]:focus-visible { outline-color: #17100E; }
.ash-top, .ash-kicker, .ash-lede, .ash-filter, .ash-notes,
.ash-index, .ash-meta span, .ash-price em { color: rgba(23, 16, 14, .72); }
.ash-title__line--accent { color: #A7545F; }
.ash-title__line--accent em, .ash-filter:hover, .ash-filter.is-on { color: #17100E; }
.ash-filter.is-on { text-decoration-color: #A7545F; }
.ash-btn--ghost { border-color: rgba(23, 16, 14, .28); color: #17100E; }
.ash-btn--ghost:hover { border-color: rgba(23, 16, 14, .45); background: rgba(23, 16, 14, .05); }
.ash-ring, .ash-seal { color: rgba(23, 16, 14, .72); }
.ash-arrow { border-color: rgba(23, 16, 14, .25); color: #17100E; }
.ash-progress button::after { background: rgba(23, 16, 14, .28); }
.ash-progress button:hover::after { background: rgba(23, 16, 14, .6); }
.ash-progress button.is-on::after { background: #17100E; }
.ash-top__meta { white-space: nowrap; }
.ash-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
@media (max-width: 1120px) {
  .ash-grid {
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: 18px;
  }
  .ash-copy { max-width: 760px; min-width: 0; }
  .ash-stage-wrap { min-width: 0; }
  .ash-stage-wrap { min-height: 400px; }
  .ash-stage { height: clamp(380px, 48vh, 500px); }
  .ash-seal { right: 2%; }
  .ash-meta strong { max-width: 52vw; }
  .ash-modal__grid {
    grid-template-columns: 1fr;
    gap: 24px;
    min-height: 0;
  }
  .ash-gallery__main { height: min(58vh, 460px); }
  .ash-details { max-width: none; }
}
@media (max-width: 760px) {
  .ash-hero {
    min-height: calc(100svh - 72px);
    padding: 14px 14px 18px;
  }
  .ash-top { font-size: 8px; letter-spacing: .2em; }
  .ash-top__meta { display: none; }
  .ash-grid { gap: 12px; padding-block: 8px; }
  .ash-copy { gap: 12px; }
  .ash-title { font-size: clamp(2.5rem, 11.5vw, 3.6rem); }
  .ash-lede { font-size: 12px; line-height: 1.65; }
  .ash-filters {
    width: 100%;
    max-width: 100%;
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .ash-filters::-webkit-scrollbar { display: none; }
  .ash-filter { flex: 0 0 auto; }
  .ash-actions { width: 100%; flex-wrap: nowrap; }
  .ash-btn {
    flex: 1 1 0;
    min-width: 0;
    gap: 6px;
    padding: 11px 8px;
    font-size: 9px;
    letter-spacing: .1em;
    white-space: nowrap;
  }
  .ash-notes { display: none; }
  .ash-stage-wrap { min-height: 276px; }
  .ash-stage { height: 276px; border-radius: 20px; }
  .ash-card {
    --step: clamp(58px, 18vw, 78px);
    width: 166px;
    height: 232px;
    padding: 8px;
    border-radius: 15px;
  }
  .ash-card__body { padding: 8px 3px 1px; }
  .ash-card__name { font-size: 12.5px; }
  .ash-card__label { font-size: 7px; }
  .ash-card__price { font-size: 10px; }
  .ash-card__badge { top: 14px; left: 14px; font-size: 6.5px; }
  .ash-seal { top: 2px; width: 68px; }
  .ash-foot {
    flex-wrap: nowrap;
    align-items: center;
    gap: 8px;
    padding-top: 8px;
  }
  .ash-foot__details { display: none; }
  .ash-meta { flex: 1; }
  .ash-meta strong { max-width: none; font-size: 14px; }
  .ash-controls { width: 100%; justify-content: space-between; }
  .ash-progress {
    flex: 1;
    justify-content: flex-start;
    max-width: none;
  }
  .ash-modal__scroll { padding: 14px 14px 26px; }
  .ash-modal__bar { padding-bottom: 10px; }
  .ash-modal__tag { font-size: 7.5px; letter-spacing: .16em; }
  .ash-modal__tag b { display: none; }
  .ash-modal__grid { gap: 20px; padding-top: 14px; }
  .ash-gallery__main {
    height: 42vh;
    min-height: 260px;
    border-radius: 18px;
  }
  .ash-details__title { font-size: clamp(1.8rem, 8vw, 2.5rem); }
  .ash-details__desc { font-size: 12.5px; }
  .ash-modal__actions { flex-direction: column; align-items: stretch; }
  .ash-add { width: 100%; justify-content: center; }
  .ash-modal__tag { justify-content: flex-end; font-size: 8px; letter-spacing: .12em; }
  .ash-back { min-height: 38px; padding: 0 10px 0 8px; font-size: 8px; }
}
@media (max-width: 420px) {
  .ash-title { font-size: 2.35rem; }
  .ash-card { width: 150px; height: 214px; }
  .ash-stage, .ash-stage-wrap { min-height: 276px; height: 276px; }
}
@media (max-height: 760px) and (min-width: 761px) {
  .ash-hero { padding-top: 14px; padding-bottom: 14px; }
  .ash-inner { gap: 8px; }
  .ash-grid { padding-block: 4px; }
  .ash-copy { gap: 10px; }
  .ash-title { font-size: clamp(2.5rem, 5vw, 4.5rem); }
  .ash-lede { max-width: 46ch; font-size: 12px; line-height: 1.55; }
  .ash-notes { display: none; }
  .ash-filter { padding: 6px 6px; }
  .ash-actions .ash-btn { padding: 11px 18px; }
  .ash-stage-wrap { min-height: 340px; }
  .ash-stage { height: 340px; }
  .ash-card {
    --step: clamp(96px, 9.2vw, 122px);
    width: clamp(196px, 17vw, 232px);
    height: clamp(266px, 23.4vw, 300px);
  }
  .ash-foot { padding-top: 8px; }
  .ash-seal { width: 78px; }
}
@media (hover: none) {
  .ash-stage { cursor: grab; }
  .ash-ring { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ash-hero *, .ash-hero *::before, .ash-hero *::after,
  .ash-modal *, .ash-modal *::before, .ash-modal *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
  .ash-seal__ring { animation: none; }
}
@keyframes ash-spin { to { transform: rotate(360deg); } }
@keyframes ash-pulse {
  0% { box-shadow: 0 0 0 0 rgba(217, 142, 134, .55); }
  70% { box-shadow: 0 0 0 7px rgba(217, 142, 134, 0); }
  100% { box-shadow: 0 0 0 0 rgba(217, 142, 134, 0); }
}
`;
export default function AnimatedShopHero({
  items = [],
  onBrowse,
  onAdd,
  autoFetch = true,
}) {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const cursorRef = useRef(null);
  const progressRef = useRef(null);
  const lastTrigger = useRef(null);
  const addedTimer = useRef(0);
  const drag = useRef({ active: false, startX: 0, delta: 0 });
  const moved = useRef(false);
  const reduce = useReducedMotion();
  const { cartCount = 0, addToCart } = useCart();

  const seeded = useMemo(
    () =>
      seedFromItems(items).filter((item) =>
        item.image.includes("cdn.shopify.com"),
      ),
    [items],
  );
  const [remote, setRemote] = useState(() => readCache() || FALLBACK);
  const catalogue = seeded.length >= 4 ? seeded : remote;
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(2);
  const [paused, setPaused] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [shot, setShot] = useState(0);
  const [size, setSize] = useState("");
  const [added, setAdded] = useState(false);
  const [dragShift, setDragShift] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [cursorLive, setCursorLive] = useState(false);

  const { scrollY } = useScroll();
  const lift = useTransform(scrollY, [0, 520], [0, -42]);
  const fade = useTransform(scrollY, [0, 420], [1, 0.4]);

  const visible = useMemo(
    () =>
      filter === "All"
        ? catalogue
        : catalogue.filter((product) => product.type === filter),
    [catalogue, filter],
  );
  const counts = useMemo(
    () => ({
      All: catalogue.length,
      Sweatshirts: catalogue.filter((p) => p.type === "Sweatshirts").length,
      "T-Shirts": catalogue.filter((p) => p.type === "T-Shirts").length,
      Accessories: catalogue.filter((p) => p.type === "Accessories").length,
    }),
    [catalogue],
  );
  const activeIndex = visible.length
    ? clamp(active, 0, visible.length - 1)
    : 0;
  const current = visible[activeIndex] || FALLBACK[0];
  const openProduct = openId
    ? catalogue.find((product) => product.id === openId) ||
      FALLBACK.find((product) => product.id === openId) ||
      null
    : null;
  const gallery = openProduct
    ? Array.from(
        new Set(
          (openProduct.images && openProduct.images.length
            ? openProduct.images
            : [openProduct.image]
          ).filter(Boolean),
        ),
      )
    : [];
  const shotIndex = gallery.length
    ? Math.min(Math.max(shot, 0), gallery.length - 1)
    : 0;
  const shotImage = gallery[shotIndex] || (openProduct ? openProduct.image : "");

  const step = useCallback(
    (direction) => {
      if (visible.length < 2) return;
      setActive((value) =>
        mod(clamp(value, 0, visible.length - 1) + direction, visible.length),
      );
    },
    [visible.length],
  );

  const goTo = useCallback(
    (index) => {
      if (!visible.length) return;
      setActive(clamp(index, 0, visible.length - 1));
    },
    [visible.length],
  );

  const openAt = useCallback(
    (index) => {
      const product = visible[index];
      if (!product) return;
      lastTrigger.current = document.activeElement;
      setOpenId(product.id);
      setShot(0);
      setSize(product.sizes[0] || "One size");
      setAdded(false);
      window.clearTimeout(addedTimer.current);
    },
    [visible],
  );

  const close = useCallback(() => {
    const overlay = overlayRef.current;
    const finish = () => {
      setOpenId(null);
      const trigger = lastTrigger.current;
      if (trigger && typeof trigger.focus === "function") {
        trigger.focus({ preventScroll: true });
      }
    };
    if (!overlay || reduce) {
      finish();
      return;
    }
    const card =
      openId && stageRef.current
        ? stageRef.current.querySelector(`[data-card="${openId}"]`)
        : null;
    const rect = card ? card.getBoundingClientRect() : null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const target = rect
      ? `inset(${Math.max(0, rect.top)}px ${Math.max(0, vw - rect.right)}px ${Math.max(0, vh - rect.bottom)}px ${Math.max(0, rect.left)}px round 18px)`
      : "inset(42% 40% 42% 40% round 18px)";
    gsap.to(overlay, {
      clipPath: target,
      duration: 0.55,
      ease: "power3.inOut",
      onComplete: finish,
    });
  }, [openId, reduce]);

  const handleFilter = useCallback((type) => {
    setFilter(type);
    setActive(0);
  }, []);

  const handleBrowse = useCallback(() => {
    if (typeof onBrowse === "function") {
      onBrowse();
      return;
    }
    const grid = document.getElementById("shop-grid");
    if (grid) grid.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }, [onBrowse, reduce]);

  const handleAdd = useCallback(() => {
    if (!openProduct) return;
    if (typeof onAdd === "function") onAdd(openProduct, size);
    if (typeof addToCart === "function") addToCart(openProduct, size);
    setAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 1800);
  }, [addToCart, onAdd, openProduct, size]);

  const trackCursor = useCallback((event) => {
    const ring = cursorRef.current;
    const wrap = stageRef.current ? stageRef.current.parentElement : null;
    if (!ring || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    ring.style.transform = `translate3d(${event.clientX - rect.left}px, ${event.clientY - rect.top}px, 0)`;
  }, []);

  const startDrag = useCallback((event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    drag.current = { active: true, startX: event.clientX, delta: 0 };
    moved.current = false;
    setDragging(true);
    if (event.currentTarget.setPointerCapture) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* capture unavailable */
      }
    }
  }, []);

  const moveDrag = useCallback(
    (event) => {
      trackCursor(event);
      const state = drag.current;
      if (!state.active) return;
      const delta = event.clientX - state.startX;
      state.delta = delta;
      if (Math.abs(delta) > 8) moved.current = true;
      setDragShift(clamp(delta * 0.55, -110, 110));
    },
    [trackCursor],
  );

  const finishDrag = useCallback(
    (event) => {
      const state = drag.current;
      if (!state.active) return;
      state.active = false;
      setDragging(false);
      setDragShift(0);
      if (Math.abs(state.delta) > 46) {
        step(state.delta > 0 ? -1 : 1);
      }
      if (
        event &&
        event.pointerId != null &&
        event.currentTarget &&
        event.currentTarget.hasPointerCapture &&
        event.currentTarget.hasPointerCapture(event.pointerId)
      ) {
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
          /* already released */
        }
      }
      if (moved.current) {
        window.setTimeout(() => {
          moved.current = false;
        }, 80);
      }
    },
    [step],
  );

  const handleCard = useCallback(
    (index) => {
      if (moved.current) return;
      openAt(index);
    },
    [openAt],
  );

  const handleStageKeyDown = useCallback(
    (event) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openAt(activeIndex);
      }
    },
    [step, openAt, activeIndex],
  );

  useEffect(
    () => () => {
      window.clearTimeout(addedTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!autoFetch || seeded.length >= 4) return undefined;
    const controller = new AbortController();
    let alive = true;
    loadCatalogue(controller.signal)
      .then((rows) => {
        if (!alive || !rows || !rows.length) return;
        const merged = [...rows];
        seeded.forEach((item) => {
          if (!merged.some((row) => row.id === item.id)) merged.push(item);
        });
        setRemote(merged);
        writeCache(rows);
      })
      .catch(() => {
        /* keep the curated fallback */
      });
    return () => {
      alive = false;
      controller.abort();
    };
  }, [autoFetch, seeded]);

  useEffect(() => {
    if (reduce || paused || openId || visible.length < 2) return undefined;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setActive((value) =>
        mod(clamp(value, 0, visible.length - 1) + 1, visible.length),
      );
    }, 5200);
    return () => window.clearInterval(timer);
  }, [reduce, paused, openId, visible.length]);

  useEffect(() => {
    const rail = progressRef.current;
    if (!rail) return;
    const dot = rail.querySelector('[aria-current="true"]');
    if (!dot) return;
    const left =
      dot.offsetLeft - rail.clientWidth / 2 + dot.offsetWidth / 2;
    rail.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }, [activeIndex, visible.length, reduce]);

  useEffect(() => {
    if (!openId) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [openId]);

  useLayoutEffect(() => {
    if (!openId) return undefined;
    const overlay = overlayRef.current;
    if (!overlay) return undefined;
    const scroll = overlay.querySelector(".ash-modal__scroll");
    if (scroll) scroll.scrollTop = 0;
    const card = stageRef.current
      ? stageRef.current.querySelector(`[data-card="${openId}"]`)
      : null;
    const rect = card ? card.getBoundingClientRect() : null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const start = rect
      ? `inset(${Math.max(0, rect.top)}px ${Math.max(0, vw - rect.right)}px ${Math.max(0, vh - rect.bottom)}px ${Math.max(0, rect.left)}px round 18px)`
      : "inset(28% 32% 28% 32% round 18px)";
    if (reduce) {
      gsap.set(overlay, { clipPath: "inset(0px 0px 0px 0px round 0px)" });
    } else {
      gsap.fromTo(
        overlay,
        { clipPath: start },
        {
          clipPath: "inset(0px 0px 0px 0px round 0px)",
          duration: 0.72,
          ease: "power4.inOut",
          overwrite: "auto",
        },
      );
      const scene = overlay.querySelector(".ash-modal__grid");
      if (scene) {
        gsap.fromTo(
          scene,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            delay: 0.24,
            ease: "power3.out",
            overwrite: "auto",
          },
        );
      }
    }
    const focusTimer = window.setTimeout(
      () => {
        if (closeRef.current) closeRef.current.focus({ preventScroll: true });
      },
      reduce ? 0 : 140,
    );
    return () => window.clearTimeout(focusTimer);
  }, [openId, reduce]);

  useEffect(() => {
    if (!openId) return undefined;
    const handler = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const nodes = Array.from(
        dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((node) => !node.disabled && node.offsetParent !== null);
      if (!nodes.length) {
        event.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const focused = document.activeElement;
      if (!dialog.contains(focused)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && focused === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && focused === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openId, close]);

  return (
    <section className="ash-hero" ref={rootRef} aria-labelledby="ash-title">
      <style>{STYLE_A + STYLE_B + STYLE_C}</style>
      <div className="ash-grain" aria-hidden="true" />
      <MotionDiv
        className="ash-inner"
        style={{ y: reduce ? 0 : lift, opacity: reduce ? 1 : fade }}
      >
        <header className="ash-top">
          <span className="ash-eyebrow">
            <span className="ash-dot" aria-hidden="true" />
            The Booksphere · Wear the story
          </span>
          <span className="ash-top__meta">
            Vol. 03 — {new Date().getFullYear()} · Small batch
          </span>
        </header>

        <div className="ash-grid">
          <div className="ash-copy">
            <p className="ash-kicker">
              {current.type} · {current.label}
            </p>
            <h1 className="ash-title" id="ash-title">
              <span className="ash-title__line">Wear your</span>
              <span className="ash-title__line ash-title__line--accent">
                bookish heart<em>.</em>
              </span>
            </h1>
            <p className="ash-lede">{current.desc}</p>
            <div
              className="ash-filters"
              role="group"
              aria-label="Filter the collection"
            >
              {["All", ...TYPES].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`ash-filter ${filter === type ? "is-on" : ""}`}
                  aria-pressed={filter === type}
                  onClick={() => handleFilter(type)}
                >
                  {type}
                  <sup>{counts[type]}</sup>
                </button>
              ))}
            </div>
            <div className="ash-actions">
              <button
                type="button"
                className="ash-btn ash-btn--solid"
                onClick={() => openAt(activeIndex)}
              >
                Shop the piece <FaArrowRight aria-hidden="true" />
              </button>
              <button
                type="button"
                className="ash-btn ash-btn--ghost"
                onClick={handleBrowse}
              >
                {cartCount > 0
                  ? `View bag (${pad(cartCount)})`
                  : "Browse the shop"}
              </button>
            </div>
            <ul className="ash-notes">
              <li>
                <FaCheck aria-hidden="true" /> Free shipping over $75
              </li>
              <li>
                <FaCheck aria-hidden="true" /> Small-batch runs
              </li>
              <li>
                <FaCheck aria-hidden="true" /> Printed to order
              </li>
            </ul>
          </div>

          <div className="ash-stage-wrap">
            <div
              className="ash-stage"
              ref={stageRef}
              role="group"
              aria-roledescription="carousel"
              aria-label="Featured Booksphere pieces"
              tabIndex={0}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
              onPointerEnter={() => {
                setPaused(true);
                setCursorLive(true);
              }}
              onPointerLeave={() => {
                setPaused(false);
                setCursorLive(false);
              }}
              onKeyDown={handleStageKeyDown}
            >
              <div className="ash-halo" aria-hidden="true" />
              <div
                className="ash-cards"
                style={{
                  transform: `translate3d(${dragShift}px, 0, 0)`,
                  transition: dragging ? "none" : undefined,
                }}
              >
                {visible.map((product, index) => {
                  const count = visible.length;
                  const offset = Math.round(
                    mod(index - activeIndex + count / 2, count) - count / 2,
                  );
                  return (
                    <button
                      key={product.id}
                      type="button"
                      data-card={product.id}
                      className={`ash-card ${offset === 0 ? "is-active" : ""}`}
                      style={{ "--o": offset, "--a": Math.abs(offset) }}
                      onClick={() => handleCard(index)}
                      tabIndex={offset === 0 ? 0 : -1}
                    >
                      <span className="ash-card__badge">
                        {product.badge || product.type}
                      </span>
                      <span className="ash-card__media">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            loading={
                              Math.abs(offset) <= 1 ? "eager" : "lazy"
                            }
                            draggable="false"
                          />
                        ) : (
                          <span className="ash-card__ph">
                            {product.name.slice(0, 2)}
                          </span>
                        )}
                      </span>
                      <span className="ash-card__body">
                        <span className="ash-card__name">{product.name}</span>
                        <span className="ash-card__label">{product.label}</span>
                        <span className="ash-card__meta">
                          <span className="ash-card__price">
                            {money(product.price)}
                          </span>
                          <span
                            className="ash-card__swatches"
                            aria-hidden="true"
                          >
                            {product.colors.slice(0, 3).map((color) => (
                              <i
                                key={color}
                                style={{ background: colorFor(color) }}
                              />
                            ))}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              ref={cursorRef}
              className={`ash-ring ${cursorLive ? "is-live" : ""}`}
              aria-hidden="true"
              style={{ transform: "translate3d(-140px, -140px, 0)" }}
            >
              Drag
            </div>
          </div>
        </div>

        <footer className="ash-foot">
          <div className="ash-foot__details">
            <span className="ash-index">
              {pad(activeIndex + 1)} / {pad(visible.length)}
            </span>
            <div className="ash-meta">
              <strong>{current.name}</strong>
              <span>
                {current.label}
                {current.colors.length
                  ? ` · ${current.colors.slice(0, 2).join(" / ")}`
                  : ""}
              </span>
            </div>
            <span className="ash-price">
              {money(current.price)}
              {current.compareAt ? <em>{money(current.compareAt)}</em> : null}
            </span>
          </div>
          <div className="ash-controls">
            <button
              type="button"
              className="ash-arrow"
              onClick={() => step(-1)}
              aria-label="Previous piece"
            >
              <FaChevronLeft aria-hidden="true" />
            </button>
            <div className="ash-progress" ref={progressRef}>
              {visible.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  className={index === activeIndex ? "is-on" : ""}
                  onClick={() => goTo(index)}
                  aria-label={`Show ${product.name}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                />
              ))}
            </div>
            <button
              type="button"
              className="ash-arrow"
              onClick={() => step(1)}
              aria-label="Next piece"
            >
              <FaChevronRight aria-hidden="true" />
            </button>
            <button
              type="button"
              className="ash-view"
              onClick={() => openAt(activeIndex)}
              aria-label={`Open ${current.name}`}
            >
              <FaArrowRight aria-hidden="true" />
            </button>
          </div>
        </footer>
      </MotionDiv>

      {openProduct ? (
        <div
          className="ash-modal"
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ash-product-title"
        >
          <div className="ash-modal__grain" aria-hidden="true" />
          <div className="ash-modal__scroll" ref={dialogRef} tabIndex={-1}>
            <div className="ash-modal__bar">
              <button
                type="button"
                className="ash-back"
                onClick={close}
              >
                <FaChevronLeft aria-hidden="true" /> Back to shop
              </button>
              <span className="ash-modal__tag">
                <b>The Booksphere</b>
                <span>/</span>
                {openProduct.type}
              </span>
              <button
                ref={closeRef}
                type="button"
                className="ash-close"
                onClick={close}
                aria-label="Close product view"
              >
                <FaTimes aria-hidden="true" />
              </button>
            </div>

            <div className="ash-modal__grid">
              <div className="ash-gallery">
                <div className="ash-gallery__main">
                  <AnimatePresence mode="wait" initial={false}>
                    {shotImage ? (
                      <motion.img
                        key={shotImage}
                        src={shotImage}
                        alt={openProduct.name}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        transition={{
                          duration: reduce ? 0 : 0.3,
                          ease: EASE,
                        }}
                        draggable="false"
                      />
                    ) : (
                      <span className="ash-card__ph">
                        {openProduct.name.slice(0, 2)}
                      </span>
                    )}
                  </AnimatePresence>
                </div>
                {gallery.length > 1 ? (
                  <div className="ash-gallery__thumbs">
                    {gallery.map((image, index) => (
                      <button
                        key={image}
                        type="button"
                        className={`ash-thumb ${
                          index === shotIndex ? "is-on" : ""
                        }`}
                        onClick={() => setShot(index)}
                        aria-label={`Show image ${index + 1} of ${
                          openProduct.name
                        }`}
                        aria-pressed={index === shotIndex}
                      >
                        <img src={image} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="ash-details">
                <p className="ash-details__type">
                  {openProduct.type} · {openProduct.label}
                </p>
                <h2 className="ash-details__title" id="ash-product-title">
                  {openProduct.name}
                </h2>
                <p className="ash-details__price">
                  {money(openProduct.price)}
                  {openProduct.compareAt ? (
                    <em>{money(openProduct.compareAt)}</em>
                  ) : null}
                  {openProduct.badge ? <i>{openProduct.badge}</i> : null}
                </p>
                <p className="ash-details__desc">{openProduct.desc}</p>

                {openProduct.colors.length ? (
                  <div
                    className="ash-colors"
                    aria-label="Available colours"
                  >
                    {openProduct.colors.slice(0, 6).map((color) => (
                      <span key={color} className="ash-color">
                        <i
                          style={{ background: colorFor(color) }}
                          aria-hidden="true"
                        />
                        {color}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="ash-size-head">
                  <span>Select size</span>
                  <span>Fits true to size</span>
                </div>
                <div className="ash-sizes" role="group" aria-label="Size">
                  {openProduct.sizes.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`ash-size-btn ${
                        size === option ? "is-on" : ""
                      }`}
                      onClick={() => setSize(option)}
                      aria-pressed={size === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="ash-modal__actions">
                  <button
                    type="button"
                    className={`ash-add ${added ? "is-done" : ""}`}
                    onClick={handleAdd}
                  >
                    {added ? (
                      <>
                        <FaCheck aria-hidden="true" /> Added to bag
                      </>
                    ) : (
                      `Add to bag — ${money(openProduct.price)}`
                    )}
                  </button>
                </div>

                <ul className="ash-modal__notes">
                  <li>
                    <FaCheck aria-hidden="true" /> Ships in 2–4 days
                  </li>
                  <li>
                    <FaCheck aria-hidden="true" /> Free returns
                  </li>
                  <li>
                    <FaCheck aria-hidden="true" /> Secure checkout
                  </li>
                </ul>
                <span className="ash-sr" role="status" aria-live="polite">
                  {added
                    ? `${openProduct.name} added to your bag`
                    : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
