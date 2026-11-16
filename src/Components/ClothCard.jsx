import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { FaCheck, FaPlus, FaTag } from "react-icons/fa";
import gsap from "gsap";

const W = 0.8;
const H = 1;
const VERT = `attribute vec3 aPos; attribute vec3 aNor; attribute vec2 aUv; uniform vec2 uFit; varying vec2 vUv; varying vec3 vNor;
void main() { vUv = aUv; vNor = aNor; gl_Position = vec4(aPos.xy * uFit, aPos.z * 0.5, 1.0); }`;
const FRAG = `precision mediump float; uniform sampler2D uTex; uniform vec3 uLight; varying vec2 vUv; varying vec3 vNor;
void main() { vec4 c = texture2D(uTex, vUv); vec3 n = normalize(vNor); float d = max(dot(n, normalize(uLight)), 0.0); vec3 s = c.rgb * (0.78 + 0.3 * d); s += (1.0 - clamp(n.z, 0.0, 1.0)) * 0.08; gl_FragColor = vec4(s * c.a, c.a); }`;

let budget = 8;

const load = (url, cors = true) =>
  new Promise((res, rej) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    const t = setTimeout(() => rej(new Error("t")), 6000);
    img.onload = () => {
      clearTimeout(t);
      res(img);
    };
    img.onerror = () => {
      clearTimeout(t);
      rej(new Error("e"));
    };
    img.src = url;
  });
const resolve = async (id, url) => {
  const key = "shop-cloth-" + id;
  let cached = null;
  try {
    cached = sessionStorage.getItem(key);
  } catch {
    null;
  }
  if (cached) {
    try {
      return { img: await load(cached), url: cached };
    } catch {
      try {
        sessionStorage.removeItem(key);
      } catch {
        null;
      }
    }
  }
  try {
    const img = await load(url);
    try {
      sessionStorage.setItem(key, url);
    } catch {
      null;
    }
    return { img, url };
  } catch {
    null;
  }
  try {
    await load(url, false);
    return { img: null, url };
  } catch {
    null;
  }
  return { img: null, url };
};

const buildTexture = (img) => {
  const CW = 800,
    CH = 1000,
    c = document.createElement("canvas");
  c.width = CW;
  c.height = CH;
  const x = c.getContext("2d");
  const sc = Math.max(CW / img.width, CH / img.height),
    dw = img.width * sc,
    dh = img.height * sc;
  x.drawImage(img, (CW - dw) / 2, (CH - dh) / 2, dw, dh);
  const g = x.createLinearGradient(0, 0, 0, CH);
  g.addColorStop(0, "rgba(42,33,24,0)");
  g.addColorStop(0.72, "rgba(42,33,24,0)");
  g.addColorStop(1, "rgba(42,33,24,0.28)");
  x.fillStyle = g;
  x.fillRect(0, 0, CW, CH);
  return c;
};

const getGL = (el) => {
  if (!el) return null;
  try {
    return el.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      depth: false,
    });
  } catch {
    return null;
  }
};
const program = (gl) => {
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT),
    fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
};

const setup = (gl, canvasEl, tex, wrapEl, live) => {
  const p = program(gl);
  if (!p) return null;
  const mob = window.innerWidth < 768,
    N = mob ? 18 : 22,
    count = N * N;
  const pos = new Float32Array(count * 3),
    prev = new Float32Array(count * 3),
    rest = new Float32Array(count * 3);
  const anch = new Float32Array(count),
    data = new Float32Array(count * 8),
    idx = new Uint16Array((N - 1) * (N - 1) * 6);
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const k = j * N + i,
        u = i / (N - 1),
        v = j / (N - 1),
        px = (u - 0.5) * W,
        py = (0.5 - v) * H;
      pos[k * 3] = rest[k * 3] = px;
      pos[k * 3 + 1] = rest[k * 3 + 1] = py;
      anch[k] = j < 2 ? 0.06 : 0.014;
      data[k * 8 + 6] = u;
      data[k * 8 + 7] = v;
    }
  prev.set(pos);
  const cons = [];
  const link = (a, b, w) => {
    const dx = rest[a * 3] - rest[b * 3],
      dy = rest[a * 3 + 1] - rest[b * 3 + 1];
    cons.push(a, b, w, Math.hypot(dx, dy));
  };
  let t = 0;
  for (let j = 0; j < N - 1; j++) {
    for (let i = 0; i < N - 1; i++) {
      const a = j * N + i,
        b = a + 1,
        c = a + N,
        d = c + 1;
      idx[t++] = a;
      idx[t++] = c;
      idx[t++] = b;
      idx[t++] = b;
      idx[t++] = c;
      idx[t++] = d;
      link(a, b, 1);
      link(a, c, 1);
      link(a, d, 0.5);
      link(b, c, 0.5);
    }
    link(j * N + N - 1, (j + 1) * N + N - 1, 1);
  }
  for (let i = 0; i < N - 1; i++) link((N - 1) * N + i, (N - 1) * N + i + 1, 1);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
  const ibuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(p, "aPos"),
    aNor = gl.getAttribLocation(p, "aNor"),
    aUv = gl.getAttribLocation(p, "aUv");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 32, 0);
  gl.enableVertexAttribArray(aNor);
  gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, 32, 12);
  gl.enableVertexAttribArray(aUv);
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 32, 24);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.useProgram(p);
  gl.uniform1i(gl.getUniformLocation(p, "uTex"), 0);
  gl.uniform2f(gl.getUniformLocation(p, "uFit"), 2 / W, 2 / H);
  gl.uniform3f(gl.getUniformLocation(p, "uLight"), -0.3, 0.45, 0.84);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  const grab = { on: false, x: 0, y: 0 };
  let intro = 0,
    acc = 0;
  const normals = () => {
    const dx = W / (N - 1),
      dy = H / (N - 1);
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const k = j * N + i,
          l = (i > 0 ? k - 1 : k) * 3,
          r = (i < N - 1 ? k + 1 : k) * 3,
          u = (j > 0 ? k - N : k) * 3,
          d = (j < N - 1 ? k + N : k) * 3;
        const nx = ((pos[l + 2] - pos[r + 2]) / (2 * dx)) * 3,
          ny = ((pos[d + 2] - pos[u + 2]) / (2 * dy)) * 3,
          m = Math.hypot(nx, ny, 1),
          o = k * 8;
        data[o + 3] = nx / m;
        data[o + 4] = ny / m;
        data[o + 5] = 1 / m;
      }
  };
  const step = () => {
    for (let k = 0; k < count; k++) {
      const i3 = k * 3,
        px = pos[i3],
        py = pos[i3 + 1],
        pz = pos[i3 + 2];
      const vx = (px - prev[i3]) * 0.985,
        vy = (py - prev[i3 + 1]) * 0.985,
        vz = (pz - prev[i3 + 2]) * 0.985;
      prev[i3] = px;
      prev[i3 + 1] = py;
      prev[i3 + 2] = pz;
      pos[i3] = px + vx;
      pos[i3 + 1] = py + vy - 0.0011;
      pos[i3 + 2] = pz + vz;
    }
    if (intro < 2) {
      intro += 1 / 60;
      const a = 0.09 * W * (1 - intro / 2);
      for (let k = 0; k < count; k++) {
        const i3 = k * 3,
          u = (k % N) / (N - 1),
          z = Math.sin(u * Math.PI * 2.5 + intro * 4) * a;
        pos[i3 + 2] = z;
        prev[i3 + 2] = z;
      }
    }
    for (let k = 0; k < count; k++) {
      const i3 = k * 3,
        w = anch[k];
      pos[i3] += (rest[i3] - pos[i3]) * w;
      pos[i3 + 1] += (rest[i3 + 1] - pos[i3 + 1]) * w;
      pos[i3 + 2] += (rest[i3 + 2] - pos[i3 + 2]) * w;
    }
    if (grab.on) {
      const r = (mob ? 0.26 : 0.2) * W;
      for (let k = 0; k < count; k++) {
        const i3 = k * 3,
          dx = grab.x - pos[i3],
          dy = grab.y - pos[i3 + 1],
          d = Math.hypot(dx, dy);
        if (d < r) {
          const w = (1 - d / r) ** 2 * 0.32;
          pos[i3] += dx * w;
          pos[i3 + 1] += dy * w;
        }
      }
    }
    for (let it = 0; it < 4; it++)
      for (let c = 0; c < cons.length; c += 4) {
        const a = cons[c] * 3,
          b = cons[c + 1] * 3,
          w = cons[c + 2],
          rl = cons[c + 3];
        const dx = pos[b] - pos[a],
          dy = pos[b + 1] - pos[a + 1],
          dz = pos[b + 2] - pos[a + 2],
          d = Math.hypot(dx, dy, dz) || 1e-6,
          f = ((d - rl) / d) * 0.5 * w;
        pos[a] += dx * f;
        pos[a + 1] += dy * f;
        pos[a + 2] += dz * f;
        pos[b] -= dx * f;
        pos[b + 1] -= dy * f;
        pos[b + 2] -= dz * f;
      }
    normals();
    for (let k = 0; k < count; k++) {
      const i3 = k * 3,
        o = k * 8;
      data[o] = pos[i3];
      data[o + 1] = pos[i3 + 1];
      data[o + 2] = pos[i3 + 2];
    }
  };
  const draw = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
  };
  const tick = (time, delta) => {
    if (!live.current) return;
    acc += Math.min(delta, 50) / 1000;
    while (acc >= 1 / 60) {
      step();
      acc -= 1 / 60;
    }
    draw();
  };
  const size = () => {
    const b = wrapEl.getBoundingClientRect(),
      dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w2 = Math.max(1, Math.round(b.width * dpr)),
      h2 = Math.max(1, Math.round(b.height * dpr));
    if (w2 !== canvasEl.width || h2 !== canvasEl.height) {
      canvasEl.width = w2;
      canvasEl.height = h2;
      gl.viewport(0, 0, w2, h2);
    }
  };
  const local = (e) => {
    const b = canvasEl.getBoundingClientRect();
    return {
      x: ((e.clientX - b.left) / b.width - 0.5) * W,
      y: (0.5 - (e.clientY - b.top) / b.height) * H,
    };
  };
  const move = (e) => {
    const q = local(e);
    grab.x = q.x;
    grab.y = q.y;
  };
  const down = (e) => {
    const q = local(e);
    grab.on = true;
    grab.x = q.x;
    grab.y = q.y;
    canvasEl.style.cursor = "grabbing";
    if (canvasEl.setPointerCapture) canvasEl.setPointerCapture(e.pointerId);
  };
  const up = (e) => {
    grab.on = false;
    canvasEl.style.cursor = "grab";
    if (canvasEl.hasPointerCapture && canvasEl.hasPointerCapture(e.pointerId))
      canvasEl.releasePointerCapture(e.pointerId);
  };
  size();
  canvasEl.style.cursor = "grab";
  canvasEl.addEventListener("pointermove", move);
  canvasEl.addEventListener("pointerdown", down);
  canvasEl.addEventListener("pointerup", up);
  canvasEl.addEventListener("pointercancel", up);
  canvasEl.addEventListener("pointerleave", up);
  const ro = new ResizeObserver(size);
  ro.observe(wrapEl);
  gsap.ticker.add(tick);
  const stop = () => {
    gsap.ticker.remove(tick);
    ro.disconnect();
    canvasEl.removeEventListener("pointermove", move);
    canvasEl.removeEventListener("pointerdown", down);
    canvasEl.removeEventListener("pointerup", up);
    canvasEl.removeEventListener("pointercancel", up);
    canvasEl.removeEventListener("pointerleave", up);
    const lose = gl.getExtension("WEBGL_lose_context");
    if (lose) lose.loseContext();
  };
  return { stop };
};

export default function ClothCard({ product, onAdd }) {
  const wrap = useRef(null),
    canvas = useRef(null),
    live = useRef(false),
    timer = useRef(null);
  const [status, setStatus] = useState("load"),
    [src, setSrc] = useState(null),
    [added, setAdded] = useState(false),
    [broken, setBroken] = useState(false);
  const inView = useInView(wrap, { margin: "250px" });
  useEffect(() => {
    live.current = inView;
  }, [inView]);
  useEffect(() => {
    const canvasEl = canvas.current,
      wrapEl = wrap.current,
      off = [];
    let dead = false,
      held = false;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const gl = reduced ? null : getGL(canvasEl);
    const fallback = (url) => {
      if (!dead && url) {
        setSrc(url);
        setStatus("img");
      }
    };
    (async () => {
      const r = await resolve(product.id, product.image);
      if (dead) return;
      if (!r.img) return fallback(r.url);
      const tex = buildTexture(r.img);
      let dataUrl = null;
      try {
        dataUrl = tex.toDataURL();
      } catch {
        null;
      }
      if (!gl || budget <= 0) return fallback(dataUrl || r.url);
      const env = setup(gl, canvasEl, tex, wrapEl, live);
      if (!env) return fallback(dataUrl || r.url);
      budget -= 1;
      held = true;
      off.push(env.stop);
      setSrc(dataUrl || r.url);
      setStatus("run");
    })();
    return () => {
      dead = true;
      if (held) budget += 1;
      off.forEach((f) => f());
    };
  }, [product.id, product.image]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const add = () => {
    if (added) return;
    setAdded(true);
    if (onAdd) onAdd();
    timer.current = setTimeout(() => setAdded(false), 1500);
  };
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 bg-gray-50 border border-gray-100 shadow-sm group-hover:shadow-2xl group-hover:shadow-brand-100 transition-all duration-500">
        <div ref={wrap} className="absolute inset-0">
          {!broken && (
            <>
              <canvas
                ref={canvas}
                role="img"
                aria-label={`${product.name} cloth preview`}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  touchAction: "pan-y",
                  opacity: status === "run" ? 1 : 0,
                  transition: "opacity .5s ease",
                }}
              />
              {status !== "run" && src && (
                <img
                  src={src}
                  alt={product.name}
                  onError={() => setBroken(true)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: "6%",
                  }}
                />
              )}
            </>
          )}
          {broken && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{
                background: "linear-gradient(135deg,#f9eff1,#ffffff 55%,#f2dfe3)",
              }}
            >
              <FaTag className="text-brand-600/40" size={28} />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-600/60">
                {product.type}
              </span>
            </div>
          )}
        </div>

        {product.badge && (
          <div className="absolute top-4 left-4 bg-brand-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg pointer-events-none">
            {product.badge}
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />

        <motion.button
          onClick={add}
          aria-label={`Add ${product.name} to cart`}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          className={`absolute bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-colors duration-300 ${
            added
              ? "bg-brand-600 text-white"
              : "bg-white text-gray-900 hover:bg-brand-600 hover:text-white"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="ok"
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <FaCheck />
              </motion.span>
            ) : (
              <motion.span
                key="plus"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FaPlus />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {added && (
            <motion.span
              key="pop"
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.9 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-9 right-24 bg-white text-brand-600 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg pointer-events-none"
            >
              Added
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="px-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-brand-600 tracking-widest mb-1">
          <FaTag size={8} /> {product.type}
        </div>
        <h3 className="text-gray-900 font-bold text-lg mb-2 group-hover:text-brand-600 transition-colors truncate">
          {product.name}
        </h3>
        <div className="text-2xl font-black text-gray-900 leading-none">
          ${Number(product.price || 0).toFixed(2)}
        </div>
      </div>
    </motion.div>
  );
}
