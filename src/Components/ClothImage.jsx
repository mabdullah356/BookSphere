import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import gsap from "gsap";

const W = 1.02;
const H = 1;
const ART = [
  ["WANDERLUST", "hudson river school landscape painting"],
  ["STILL WATERS", "still life water reflection painting"],
  ["FIRST LIGHT", "sunrise landscape oil painting"],
  ["HIGH COUNTRY", "mountain landscape painting"],
  ["LONG SHORE", "coastal seascape painting"],
  ["QUIET HOURS", "interior still life painting"],
];
const SHAPE = [
  [0, 8], [6, 2], [16, 2], [16, 0], [30, 0], [30, 5], [46, 5], [46, 0],
  [62, 0], [62, 4], [78, 4], [78, 0], [92, 0], [94, 3], [100, 8],
  [100, 92], [94, 97], [80, 97], [80, 100], [64, 100], [64, 95],
  [48, 95], [48, 100], [32, 100], [32, 96], [18, 96], [18, 100],
  [6, 100], [0, 92],
];
const VERT = `attribute vec3 aPos; attribute vec3 aNor; attribute vec2 aUv; uniform vec2 uFit; varying vec2 vUv; varying vec3 vNor;
void main() { vUv = aUv; vNor = aNor; gl_Position = vec4(aPos.xy * uFit, aPos.z * 0.5, 1.0); }`;
const FRAG = `precision mediump float; uniform sampler2D uTex; uniform vec3 uLight; varying vec2 vUv; varying vec3 vNor;
void main() { vec4 c = texture2D(uTex, vUv); vec3 n = normalize(vNor); float d = max(dot(n, normalize(uLight)), 0.0); vec3 s = c.rgb * (0.74 + 0.34 * d); s += (1.0 - clamp(n.z, 0.0, 1.0)) * 0.1; gl_FragColor = vec4(s * c.a, c.a); }`;

const fetchJson = (url) => {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 2500);
  return fetch(url, { signal: ac.signal })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
    .finally(() => clearTimeout(t));
};
const loadImage = (url) => {
  const safe = (p) => p.catch(() => null);
  const img = new Image();
  img.crossOrigin = "anonymous";
  return safe(
    new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error("timeout")), 4000);
      img.onload = () => {
        clearTimeout(t);
        res(img);
      };
      img.onerror = () => {
        clearTimeout(t);
        rej(new Error("error"));
      };
      img.src = url;
    }),
  );
};
const readCache = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeCache = (key, value) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    return;
  }
};
const imageCache = new Map();
const resolveImage = async (index) => {
  const key = "cloth-art-" + index;
  const cachedImage = imageCache.get(key);
  if (cachedImage) return cachedImage;
  const fallback = `https://picsum.photos/seed/cloth-${index}/1024/1024`;
  let done;
  const result = new Promise((res) => {
    done = res;
  });
  const timer = setTimeout(() => done(null), 7000);
  const offer = (p) =>
    p.then((img) => {
      if (!img) return;
      clearTimeout(timer);
      done(img);
    });
  const cachedUrl = readCache(key);
  offer(loadImage(fallback));
  if (cachedUrl) offer(loadImage(cachedUrl));
  fetchJson(
    `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(ART[index % ART.length][1])}&query[term][is_public_domain]=true&fields=id,image_id&limit=6`,
  ).then((art) => {
    if (!art || !art.data) return;
    const base = (art.config && art.config.iiif_url) || "https://www.artic.edu/iiif/2";
    art.data
      .filter((d) => d.image_id)
      .map((d) => `${base}/${d.image_id}/full/843,/0/default.jpg`)
      .forEach((url) => offer(loadImage(url)));
  });
  const img = await result;
  if (img) {
    imageCache.set(key, img);
    writeCache(key, img.src);
  }
  return img;
};

const path = (x, pts, s) => {
  x.beginPath();
  pts.forEach((p, i) => {
    const px = (p[0] / 100) * s;
    const py = (p[1] / 100) * s;
    if (i) x.lineTo(px, py);
    else x.moveTo(px, py);
  });
  x.closePath();
};
const tracked = (x, text, cx, y, gap) => {
  const chars = [...text];
  let w = -gap;
  chars.forEach((ch) => {
    w += x.measureText(ch).width + gap;
  });
  let px = cx - w / 2;
  chars.forEach((ch) => {
    const cw = x.measureText(ch).width;
    x.fillText(ch, px + cw / 2, y);
    px += cw + gap;
  });
};
const makeTexture = (img, title) => {
  const S = 512;
  const k = S / 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, "#F4EFE3");
  g.addColorStop(1, "#E3D7BC");
  x.fillStyle = g;
  path(x, SHAPE, S);
  x.fill();
  if (img) {
    x.save();
    path(x, SHAPE, S);
    x.clip();
    const bh = S * 0.7;
    const sc = Math.max(S / img.width, bh / img.height);
    const dw = img.width * sc;
    const dh = img.height * sc;
    x.drawImage(img, (S - dw) / 2, 0.12 * S + (bh - dh) / 2, dw, dh);
    x.fillStyle = "rgba(244,239,227,0.08)";
    x.fillRect(0, 0, S, S);
    const tg = x.createLinearGradient(0, 0, 0, 0.28 * S);
    tg.addColorStop(0, "#F4EFE3");
    tg.addColorStop(0.7, "rgba(244,239,227,0.6)");
    tg.addColorStop(1, "rgba(244,239,227,0)");
    x.fillStyle = tg;
    x.fillRect(0, 0, S, 0.28 * S);
    x.restore();
  }
  x.fillStyle = "#F4EFE3";
  x.beginPath();
  x.moveTo(0, S);
  x.lineTo(0, 0.8 * S);
  const n = 9;
  const r = S / (2 * n);
  for (let i = 0; i < n; i++)
    x.arc(r + i * 2 * r, 0.8 * S, r, Math.PI, Math.PI * 2, false);
  x.lineTo(S, S);
  x.closePath();
  x.fill();
  const serif = "'Newsreader', Georgia, serif";
  x.textAlign = "left";
  x.fillStyle = "rgba(42,33,24,0.85)";
  x.font = `500 ${26 * k}px ${serif}`;
  x.fillText("* Studio", 0.07 * S, 0.085 * S);
  x.textAlign = "right";
  x.fillStyle = "rgba(42,33,24,0.6)";
  x.font = `600 ${20 * k}px Inter, sans-serif`;
  x.fillText("SERIES 04", 0.93 * S, 0.085 * S);
  x.textAlign = "center";
  x.fillStyle = "#2A2118";
  x.font = `600 ${44 * k}px ${serif}`;
  tracked(x, `+ ${title} +`, S / 2, 0.9 * S, 7 * k);
  x.fillStyle = "rgba(42,33,24,0.7)";
  x.font = `600 ${22 * k}px Inter, sans-serif`;
  tracked(x, "EST. 1958", S / 2, 0.945 * S, 6 * k);
  x.fillStyle = "rgba(42,33,24,0.35)";
  for (let i = 0; i < 5; i++) {
    x.beginPath();
    x.arc(0.42 * S + i * 0.04 * S, 0.945 * S, 2.5 * k, 0, Math.PI * 2);
    x.fill();
  }
  for (let j = 0; j < 3; j++)
    for (let i = 0; i < 3; i++) {
      x.fillStyle = (i + j) % 2 ? "#2A2118" : "#F4EFE3";
      x.fillRect(0.07 * S + i * 14 * k, 0.88 * S + j * 14 * k, 14 * k, 14 * k);
    }
  x.textAlign = "right";
  x.fillStyle = "rgba(42,33,24,0.55)";
  x.font = `600 ${18 * k}px Inter, sans-serif`;
  x.fillText("No. 072", 0.93 * S, 0.905 * S);
  x.fillText("28/11", 0.93 * S, 0.945 * S);
  return c;
};
const textureCache = new Map();
const getTexture = (img, title) => {
  const key = title + "|" + (img ? img.src : "base");
  let tex = textureCache.get(key);
  if (!tex) {
    tex = makeTexture(img, title);
    textureCache.set(key, tex);
  }
  return tex;
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
const createProgram = (gl) => {
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT);
  const fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
};
const setup = (gl, canvasEl, wrapEl, live, tex, setHot, ringApi, ptr) => {
  const p = createProgram(gl);
  if (!p) return null;
  const mob = window.innerWidth < 768;
  const N = mob ? 20 : 26;
  const count = N * N;
  const pos = new Float32Array(count * 3);
  const prev = new Float32Array(count * 3);
  const rest = new Float32Array(count * 3);
  const anch = new Float32Array(count);
  const data = new Float32Array(count * 8);
  const idx = new Uint16Array((N - 1) * (N - 1) * 6);
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const k = j * N + i;
      const u = i / (N - 1);
      const v = j / (N - 1);
      const px = (u - 0.5) * W;
      const py = (0.5 - v) * H;
      pos[k * 3] = rest[k * 3] = px;
      pos[k * 3 + 1] = rest[k * 3 + 1] = py;
      anch[k] = j < 3 ? 0.05 : 0.012;
      data[k * 8 + 6] = u;
      data[k * 8 + 7] = v;
    }
  prev.set(pos);
  const cons = [];
  const link = (a, b, w) => {
    const dx = rest[a * 3] - rest[b * 3];
    const dy = rest[a * 3 + 1] - rest[b * 3 + 1];
    cons.push(a, b, w, Math.hypot(dx, dy));
  };
  let t = 0;
  for (let j = 0; j < N - 1; j++) {
    for (let i = 0; i < N - 1; i++) {
      const a = j * N + i;
      const b = a + 1;
      const c = a + N;
      const d = c + 1;
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
  const aPos = gl.getAttribLocation(p, "aPos");
  const aNor = gl.getAttribLocation(p, "aNor");
  const aUv = gl.getAttribLocation(p, "aUv");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 32, 0);
  gl.enableVertexAttribArray(aNor);
  gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, 32, 12);
  gl.enableVertexAttribArray(aUv);
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 32, 24);
  const texture = gl.createTexture();
  const upload = (next) => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, next);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  upload(tex);
  gl.useProgram(p);
  gl.uniform1i(gl.getUniformLocation(p, "uTex"), 0);
  gl.uniform2f(gl.getUniformLocation(p, "uFit"), 2 / W, 2 / H);
  gl.uniform3f(gl.getUniformLocation(p, "uLight"), -0.3, 0.45, 0.84);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  const grab = { on: false, x: 0, y: 0 };
  let intro = 0;
  const normals = () => {
    const dx = W / (N - 1);
    const dy = H / (N - 1);
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const k = j * N + i;
        const l = (i > 0 ? k - 1 : k) * 3;
        const r = (i < N - 1 ? k + 1 : k) * 3;
        const u = (j > 0 ? k - N : k) * 3;
        const d = (j < N - 1 ? k + N : k) * 3;
        const nx = ((pos[l + 2] - pos[r + 2]) / (2 * dx)) * 3;
        const ny = ((pos[d + 2] - pos[u + 2]) / (2 * dy)) * 3;
        const m = Math.hypot(nx, ny, 1);
        const o = k * 8;
        data[o + 3] = nx / m;
        data[o + 4] = ny / m;
        data[o + 5] = 1 / m;
      }
  };
  const step = () => {
    for (let k = 0; k < count; k++) {
      const i3 = k * 3;
      const px = pos[i3];
      const py = pos[i3 + 1];
      const pz = pos[i3 + 2];
      const vx = (px - prev[i3]) * 0.985;
      const vy = (py - prev[i3 + 1]) * 0.985;
      const vz = (pz - prev[i3 + 2]) * 0.985;
      prev[i3] = px;
      prev[i3 + 1] = py;
      prev[i3 + 2] = pz;
      pos[i3] = px + vx;
      pos[i3 + 1] = py + vy - 0.0009;
      pos[i3 + 2] = pz + vz;
    }
    if (intro < 2.5) {
      intro += 1 / 60;
      const a = 0.12 * W * (1 - intro / 2.5);
      for (let k = 0; k < count; k++) {
        const i3 = k * 3;
        const u = (k % N) / (N - 1);
        const z = Math.sin(u * Math.PI * 3 + intro * 5) * a;
        pos[i3 + 2] = z;
        prev[i3 + 2] = z;
      }
    }
    for (let k = 0; k < count; k++) {
      const i3 = k * 3;
      const w = anch[k];
      pos[i3] += (rest[i3] - pos[i3]) * w;
      pos[i3 + 1] += (rest[i3 + 1] - pos[i3 + 1]) * w;
      pos[i3 + 2] += (rest[i3 + 2] - pos[i3 + 2]) * w;
    }
    if (grab.on) {
      const r = (mob ? 0.22 : 0.18) * W;
      for (let k = 0; k < count; k++) {
        const i3 = k * 3;
        const dx = grab.x - pos[i3];
        const dy = grab.y - pos[i3 + 1];
        const d2 = dx * dx + dy * dy;
        if (d2 < r * r) {
          const w = (1 - Math.sqrt(d2) / r) ** 2 * 0.35;
          pos[i3] += dx * w;
          pos[i3 + 1] += dy * w;
        }
      }
    }
    for (let it = 0; it < 4; it++)
      for (let c = 0; c < cons.length; c += 4) {
        const a = cons[c] * 3;
        const b = cons[c + 1] * 3;
        const w = cons[c + 2];
        const rl = cons[c + 3];
        const dx = pos[b] - pos[a];
        const dy = pos[b + 1] - pos[a + 1];
        const dz = pos[b + 2] - pos[a + 2];
        const d = Math.hypot(dx, dy, dz) || 1e-6;
        const f = ((d - rl) / d) * 0.5 * w;
        pos[a] += dx * f;
        pos[a + 1] += dy * f;
        pos[a + 2] += dz * f;
        pos[b] -= dx * f;
        pos[b + 1] -= dy * f;
        pos[b + 2] -= dz * f;
      }
    normals();
    for (let k = 0; k < count; k++) {
      const i3 = k * 3;
      const o = k * 8;
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
  const size = () => {
    const b = wrapEl.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(b.width * dpr));
    const h = Math.max(1, Math.round(b.height * dpr));
    if (w !== canvasEl.width || h !== canvasEl.height) {
      canvasEl.width = w;
      canvasEl.height = h;
      gl.viewport(0, 0, w, h);
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
    ptr.current = { x: e.clientX, y: e.clientY };
    if (ringApi.current) {
      ringApi.current.qx(e.clientX);
      ringApi.current.qy(e.clientY);
    }
  };
  const down = (e) => {
    const q = local(e);
    grab.on = true;
    grab.x = q.x;
    grab.y = q.y;
    ptr.current = { x: e.clientX, y: e.clientY };
    canvasEl.style.cursor = "none";
    setHot(true);
    if (canvasEl.setPointerCapture) canvasEl.setPointerCapture(e.pointerId);
  };
  const up = (e) => {
    grab.on = false;
    canvasEl.style.cursor = "grab";
    setHot(false);
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
  let raf = 0;
  let last = 0;
  let acc = 0;
  const tick = (time) => {
    raf = requestAnimationFrame(tick);
    if (!last) last = time;
    if (!live.current) {
      last = time;
      return;
    }
    acc += Math.min(time - last, 50);
    last = time;
    let n = 0;
    while (acc >= 16.67 && n < 2) {
      step();
      acc -= 16.67;
      n++;
    }
    if (n) draw();
  };
  raf = requestAnimationFrame(tick);
  return {
    update: upload,
    stop: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvasEl.removeEventListener("pointermove", move);
      canvasEl.removeEventListener("pointerdown", down);
      canvasEl.removeEventListener("pointerup", up);
      canvasEl.removeEventListener("pointercancel", up);
      canvasEl.removeEventListener("pointerleave", up);
    },
  };
};
const paint2d = (canvasEl, tex) => {
  const b = canvasEl.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvasEl.width = Math.max(1, Math.round(b.width * dpr));
  canvasEl.height = Math.max(1, Math.round(b.height * dpr));
  const x = canvasEl.getContext("2d");
  if (x) x.drawImage(tex, 0, 0, canvasEl.width, canvasEl.height);
};

export default function ClothImage({ index = 0 }) {
  const title = ART[index % ART.length][0];
  const wrap = useRef(null);
  const canvas = useRef(null);
  const ringOut = useRef(null);
  const ringApi = useRef(null);
  const ptr = useRef({ x: 0, y: 0 });
  const live = useRef(true);
  const [hot, setHot] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !window.IntersectionObserver) return;
    const io = new IntersectionObserver(
      ([e]) => {
        live.current = e.isIntersecting;
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const canvasEl = canvas.current;
    const wrapEl = wrap.current;
    let dead = false;
    let update = null;
    let stop = null;
    let ro = null;
    let plainEl = null;
    let currentTex = getTexture(null, title);
    canvasEl.style.opacity = "0";
    const gl = getGL(canvasEl);
    const showPlain = (tex) => {
      if (plainEl) plainEl.remove();
      plainEl = document.createElement("img");
      plainEl.src = tex.toDataURL();
      plainEl.alt = title;
      Object.assign(plainEl.style, {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "1rem",
      });
      wrapEl.appendChild(plainEl);
      canvasEl.style.opacity = "0";
    };
    if (gl) {
      const env = setup(gl, canvasEl, wrapEl, live, currentTex, setHot, ringApi, ptr);
      if (env) {
        update = env.update;
        stop = env.stop;
      }
    }
    if (update || !gl) {
      canvasEl.style.opacity = "1";
      if (!gl) {
        paint2d(canvasEl, currentTex);
        ro = new ResizeObserver(() => paint2d(canvasEl, currentTex));
        ro.observe(wrapEl);
      }
    } else {
      showPlain(currentTex);
    }
    resolveImage(index).then((img) => {
      if (dead) return;
      currentTex = getTexture(img, title);
      if (update) update(currentTex);
      else if (!gl) paint2d(canvasEl, currentTex);
      else showPlain(currentTex);
    });
    return () => {
      dead = true;
      if (stop) stop();
      if (ro) ro.disconnect();
      if (plainEl) plainEl.remove();
    };
  }, [index, title]);

  useEffect(() => {
    const el = ringOut.current;
    if (!hot || !el) return;
    gsap.set(el, { x: ptr.current.x, y: ptr.current.y });
    ringApi.current = {
      qx: gsap.quickTo(el, "x", { duration: 0.25, ease: "power3" }),
      qy: gsap.quickTo(el, "y", { duration: 0.25, ease: "power3" }),
    };
    return () => {
      ringApi.current = null;
    };
  }, [hot]);

  return (
    <>
      <Motion.div
        ref={wrap}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", width: "100%", aspectRatio: "1.02 / 1" }}
      >
        <canvas
          ref={canvas}
          role="img"
          aria-label={`${title} cloth poster`}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            borderRadius: "1rem",
            touchAction: "none",
            transition: "opacity .5s ease",
          }}
        />
      </Motion.div>
      {createPortal(
        <AnimatePresence>
          {hot && (
            <Motion.div
              key="cloth-ring"
              ref={ringOut}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                zIndex: 60,
                pointerEvents: "none",
              }}
            >
              <Motion.span
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.5 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "absolute",
                  left: -32,
                  top: -32,
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  border: "1.5px solid rgba(47,63,196,.9)",
                  boxShadow: "0 0 0 6px rgba(47,63,196,.08)",
                  background: "rgba(255,255,255,.12)",
                  display: "block",
                }}
              />
            </Motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
