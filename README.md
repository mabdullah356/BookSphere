# BookSphere

BookSphere is a responsive React single-page application for discovering books and shopping reader-inspired merchandise. It combines a book catalogue powered by Open Library with a curated apparel storefront, a persistent client-side cart, and an animated editorial design system.

> **Project status:** front-end only. Product and book data come from public APIs, the cart is stored in the browser, and checkout is a simulated confirmation. There is no authentication, payment processing, order database, or server-side persistence.

---

## Table of contents

- [Highlights](#highlights)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Configuration](#configuration)
- [Application structure](#application-structure)
- [Routing](#routing)
- [Data sources and integrations](#data-sources-and-integrations)
- [State, caching, and storage](#state-caching-and-storage)
- [Accessibility and resilience](#accessibility-and-resilience)
- [Build and deployment](#build-and-deployment)
- [Production readiness](#production-readiness)
- [Contributing](#contributing)
- [License](#license)

---

## Highlights

### Book discovery

- Debounced search (300 ms) against the Open Library search API.
- Genre filtering and client-side sorting by publication year or title.
- Book detail pages resolved from Open Library work IDs, including cover art, description, and subjects.
- Loading, empty, and failure states for catalogue browsing.

### Shop

- Merchandise catalogue assembled from three public Shopify collection feeds.
- Interactive 3D-style product carousel with drag, keyboard, and arrow controls.
- Full-screen product dialog with gallery, colour swatches, size selection, and add-to-bag feedback.
- Product grid with category filters, sorting, retry-on-error, and a 20-minute session cache.
- WebGL cloth-simulation previews with a lightweight canvas/image fallback and a global rendering budget.

### Cart and checkout experience

- Cart lines keyed by product plus selected size, with quantity limits (1–99).
- Persistent cart in `localStorage`, shared with the header cart badge through React context.
- Order summary with subtotal, savings, flat shipping fee, free-shipping threshold, and USD formatting.
- Simulated two-stage checkout (processing → confirmation) that clears the saved cart.

### Experience quality

- Responsive layouts built with Tailwind CSS v4 plus scoped component styles.
- Motion design with Framer Motion and GSAP, including `prefers-reduced-motion` handling.
- Keyboard navigation, focus management, focus traps for modal/dialog surfaces, ARIA labels, and live regions.
- Deferred image loading, skeleton screens, abortable requests, and graceful fallbacks for unavailable artwork.

---

## Tech stack

| Concern | Choice |
| --- | --- |
| UI runtime | React 19 |
| Build tool | Vite 8 (`@vitejs/plugin-react`) |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite`, plus scoped CSS-in-JS |
| Routing | React Router 7 (`BrowserRouter`) |
| Animation | Framer Motion 12, GSAP 3 |
| Icons | React Icons 5 |
| Graphics | WebGL shaders, Canvas 2D |
| Linting | ESLint 9 with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` |
| Hosting config | Vercel SPA rewrite in `vercel.json` |

> `axios` is present in `dependencies` but is not currently used; network calls use the native `fetch` API.

---

## Requirements

- Node.js `^20.19.0 || >=22.12.0` (required by Vite 8).
- npm with `package-lock.json` support.
- A modern browser with ES module, `fetch`, `localStorage`, and `sessionStorage` support. WebGL is optional and degrades gracefully.

---

## Getting started

```bash
npm ci
npm run dev
```

The development server starts on Vite's default address (`http://localhost:5173`).

Optional local configuration: create a `.env` file in the project root and set `VITE_CONTACT_ENDPOINT` only when you have an endpoint that accepts the contact form payload (see [Configuration](#configuration)).

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server with HMR. |
| `npm run build` | Produce an optimized production bundle in `dist/`. |
| `npm run preview` | Serve the production build locally for verification. |
| `npm run lint` | Run ESLint across the project. |

There is currently **no test script** and no unit, integration, or end-to-end test suite in the repository.

---

## Configuration

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_CONTACT_ENDPOINT` | No | Empty string | HTTPS endpoint that receives contact form submissions. Consumed by `src/Components/Pages/ContactUs.jsx`. |

### Contact form behaviour

- With `VITE_CONTACT_ENDPOINT` set, the form sends a `POST` request with `Content-Type: application/json` and a 10-second abort timeout. Payload: `name`, `email`, `phone`, `subject`, `message`, and `company`.
- Without it, the form validates locally and opens the visitor's mail client with a prefilled `mailto:` message.
- `company` is a hidden honeypot field; submissions that fill it are treated as successful without a network request.
- Validation covers required name, email format, optional phone format, subject selection, and a 10–1200 character message.

`.env` is gitignored. Never commit real credentials or private endpoints; only `VITE_`-prefixed values are exposed to the browser bundle.

---

## Application structure

```text
BookSphere/
├── public/
│   ├── abdullah.jpg            # Footer portrait
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── Components/
│   │   ├── Books/
│   │   │   ├── BookGrid.jsx
│   │   │   ├── BookSearchBar.jsx
│   │   │   └── FilterBar.jsx
│   │   ├── Pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── Books.jsx
│   │   │   ├── BookDetails.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── Cart.jsx
│   │   │   └── ContactUs.jsx
│   │   ├── AnimatedHeroSection.jsx   # Editorial film-shelf hero
│   │   ├── AnimatedShopHero.jsx      # Product carousel and detail dialog
│   │   ├── ClothCard.jsx             # WebGL cloth preview for shop grid
│   │   ├── ClothImage.jsx            # WebGL cloth poster for home hero
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   └── HeroSection.jsx
│   ├── Contexts/
│   │   └── CartContext.jsx           # Cart badge count + provider
│   ├── App.jsx                       # Router, header, footer, route table
│   ├── main.jsx                      # React root + CartProvider
│   ├── index.css                     # Tailwind import + brand theme tokens
│   └── App.css                       # Legacy template styles (unused)
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── vercel.json
└── vite.config.js
```

`App.css` is not imported by the application and can be removed in a cleanup pass.

---

## Routing

| Path | Page | Notes |
| --- | --- | --- |
| `/` | `HomePage` | Animated film-shelf hero, book CTA, testimonials, footer. |
| `/books` | `Books` | Search, genre filter, sort controls, results grid. |
| `/books/:id` | `BookDetails` | Open Library work detail by ID. |
| `/shop` | `Shop` | Featured carousel, filters, product grid. |
| `/cart` | `Cart` | Client-side cart and simulated checkout. |
| `/contact` | `ContactUs` | Validated contact form and contact information. |

All paths are client-side routes. A hosting rewrite to `/index.html` is required for direct URL loads and refreshes; `vercel.json` provides this for Vercel.

---

## Data sources and integrations

All integrations are public, keyless HTTP endpoints called directly from the browser.

| Source | Used for | Key endpoints |
| --- | --- | --- |
| Open Library | Book search and details | `https://openlibrary.org/search.json`, `https://openlibrary.org/works/:id.json` |
| Open Library Covers | Book cover images | `https://covers.openlibrary.org/b/id/:id-L.jpg` |
| Shopify storefront | Merchandise catalogue | `https://thebooksphere.com/collections/{sweatshirts,t-shirts,accessories}/products.json` |
| Art Institute of Chicago | Public-domain hero/cloth artwork | `https://api.artic.edu/api/v1/artworks/search` |
| Metropolitan Museum of Art | Secondary artwork source | `https://collectionapi.metmuseum.org/public/collection/v1.1/...` |
| Picsum / Pollinations / Placeholder | Artwork and cover fallbacks | External image URLs |
| Google Fonts | Inter, Newsreader, Noto Serif SC | CSS `@import` in component styles |

Collection requests use `Promise.allSettled`, so one failing collection does not remove the others. Book and artwork requests are time-limited or abortable where appropriate.

---

## State, caching, and storage

### React state

- `CartProvider` in `src/main.jsx` exposes `cartCount`, `setCartCount`, and `addToCart` via `useCart()`.
- Page-level state manages search, filters, sorting, loading flags, errors, dialogs, and carousel position.

### Browser storage

| Key | Scope | Purpose |
| --- | --- | --- |
| `booksphere.shop.cart.v1` | `localStorage` (persistent) | Cart items: `key`, `id`, `name`, `type`, `size`, prices, image, description, quantity, `addedAt`. |
| `bs-shop-products-v4` | `sessionStorage` | Product grid cache with 20-minute TTL. |
| `bs-shop-catalogue-v3` | `sessionStorage` | Featured carousel cache with 20-minute TTL. |
| `vhs-art-*`, `cloth-art-*`, `shop-cloth-*` | `sessionStorage` | Resolved artwork URLs for animated sections. |

All storage reads/writes are wrapped in `try/catch`, so private browsing or disabled storage does not break the UI.

### Cart rules

- An item is uniquely identified by `product id :: selected size`.
- Quantity is clamped to 1–99; reducing below 1 removes the line.
- Subtotal uses current price; savings use `compareAt - price`.
- Shipping is free for an empty cart or subtotal of **$75+**; otherwise a flat **$6.95** fee applies.
- Completing an order clears the stored cart after the confirmation delay.

---

## Accessibility and resilience

- Sticky header with active-route indicators, cart count announcements, and an accessible mobile dialog with focus trapping and Escape-to-close.
- Product dialog and contact/hero interactions expose labels, pressed states, live regions, and keyboard controls (arrows, Enter, Space, Escape).
- `useReducedMotion()` and `prefers-reduced-motion` media rules shorten or disable animation for users who request it.
- Skeletons, empty states, retry buttons, and cached/fallback content keep pages usable when APIs fail.
- Images include descriptive `alt` text where meaningful; decorative visuals are hidden with `aria-hidden`.
- WebGL is capability-checked and falls back to Canvas 2D or plain images; concurrently active cloth simulations are budgeted.

---

## Build and deployment

```bash
npm ci
npm run lint
npm run build
npm run preview
```

The production output is the static `dist/` directory.

### Vercel

`vercel.json` rewrites all paths to `/index.html`, which is required for React Router deep links. Configure the project as follows:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variable | `VITE_CONTACT_ENDPOINT` (optional) |

### Other static hosts

Configure an SPA fallback so unknown paths serve `index.html` rather than returning 404. Without this rewrite, `/books`, `/shop`, `/cart`, `/contact`, and `/books/:id` will fail on refresh or direct navigation.

---

## Production readiness

The application builds as a static SPA, but the following items should be addressed before treating it as a fully production-hardened storefront:

1. **Testing:** add unit tests for cart math and storage helpers, component/integration tests for search and filters, and end-to-end coverage for shop → cart → checkout.
2. **Lint debt:** `npm run lint` currently reports 9 errors and 2 warnings (unused default `motion` imports, a fast-refresh export in `CartContext.jsx`, and missing hook dependencies). Resolve these before enforcing lint in CI.
3. **Bundle size:** `npm run build` succeeds but emits a chunk-size warning (~640 kB minified, ~206 kB gzipped). Split routes and heavy animation/graphics modules with dynamic imports.
4. **Real commerce:** replace the simulated checkout with a payment provider, server-side order creation, inventory validation, and webhook-driven fulfilment.
5. **Backend boundary:** proxy third-party APIs through a server or edge function to add caching, rate-limit protection, response validation, and stable error contracts.
6. **SEO and metadata:** replace the default `booksphere` title in `index.html` and add meta descriptions, Open Graph/Twitter tags, canonical URLs, `robots.txt`, and a sitemap.
7. **Error containment:** add React error boundaries and user-facing error states for book and shop routes instead of relying on console logging.
8. **Security hygiene:** add a content security policy, keep `.env` gitignored, validate the contact endpoint server-side, and add rate limiting/anti-spam protection to the form endpoint.
9. **Dependency cleanup:** remove unused `axios` and the legacy `src/App.css` template file.
10. **Release controls:** add an `engines` field to `package.json`, lock dependency update policy, and wire lint/tests/build into CI.

---

## Contributing

1. Create a branch from the current default branch.
2. Keep changes focused and follow the existing file/component conventions.
3. Run `npm run lint` and `npm run build` before opening a pull request.
4. Use concise, conventional commit messages (the repository history uses forms such as `feat(Cart): ...`, `fix(...): ...`, and `refactor(...): ...`).
5. Do not commit `.env`, build output, or generated dependency directories.

---

## License

No license file is present in this repository. Add an appropriate license before distributing or open-sourcing the project.
