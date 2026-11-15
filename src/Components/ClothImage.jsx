import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useInView } from "framer-motion";
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
  [0, 8],
  [6, 2],
  [16, 2],
  [16, 0],
  [30, 0],
  [30, 5],
  [46, 5],
  [46, 0],
  [62, 0],
  [62, 4],
  [78, 4],
  [78, 0],
  [92, 0],
  [94, 3],
  [100, 8],
  [100, 92],
  [94, 97],
  [80, 97],
  [80, 100],
  [64, 100],
  [64, 95],
  [48, 95],
  [48, 100],
  [32, 100],
  [32, 96],
  [18, 96],
  [18, 100],
  [6, 100],
  [0, 92],
];
const VERT = `attribute vec3 aPos; attribute vec3 aNor; attribute vec2 aUv; uniform vec2 uFit; varying vec2 vUv; varying vec3 vNor;
void main() { vUv = aUv; vNor = aNor; gl_Position = vec4(aPos.xy * uFit, aPos.z * 0.5, 1.0); }`;
const FRAG = `precision mediump float; uniform sampler2D uTex; uniform vec3 uLight; varying vec2 vUv; varying vec3 vNor;
void main() { vec4 c = texture2D(uTex, vUv); vec3 n = normalize(vNor); float d = max(dot(n, normalize(uLight)), 0.0); vec3 s = c.rgb * (0.74 + 0.34 * d); s += (1.0 - clamp(n.z, 0.0, 1.0)) * 0.1; gl_FragColor = vec4(s * c.a, c.a); }`;

const json = (url) => {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 6000);
  return fetch(url, { signal: ac.signal })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
    .finally(() => clearTimeout(t));
};
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
const candidates = async (index) => {
  const q = ART[index % ART.length][1];
  const out = [];
  const art = await json(
    `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(q)}&query[term][is_public_domain]=true&fields=id,image_id&limit=8`,
  );
  const base =
    (art && art.config && art.config.iiif_url) ||
    "https://www.artic.edu/iiif/2";
  if (art && art.data)
    art.data.forEach((d) => {
      if (d.image_id) out.push(`${base}/${d.image_id}/full/843,/0/default.jpg`);
    });
  if (!out.length) {
    const met = await json(
      `https://collectionapi.metmuseum.org/public/collection/v1.1/search?hasImages=true&isPublicDomain=true&q=${encodeURIComponent(q)}`,
    );
    for (const id of (met && met.objectIDs ? met.objectIDs : []).slice(0, 6)) {
      const o = await json(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
      );
      if (o && o.primaryImageSmall) out.push(o.primaryImageSmall);
      if (out.length > 8) break;
    }
  }
  out.push(`https://picsum.photos/seed/cloth-${index}/1024/1024`);
  return out;
};
const resolve = async (index) => {
  const key = "cloth-art-" + index;
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
  const urls = await candidates(index);
  for (const url of urls) {
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
  }
  for (const url of urls) {
    try {
      await load(url, false);
      return { img: null, url };
    } catch {
      null;
    }
  }
  return { img: null, url: urls[urls.length - 1] };
};
const path = (x, pts, s) => {
  x.beginPath();
  pts.forEach((p, i) => {
    const px = (p[0] / 100) * s,
      py = (p[1] / 100) * s;
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

const buildTexture = (img, title) => {
  const S = 1024,
    c = document.createElement("canvas");
  c.width = c.height = S;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, "#F4EFE3");
  g.addColorStop(1, "#E3D7BC");
  x.fillStyle = g;
  path(x, SHAPE, S);
  x.fill();
  x.save();
  path(x, SHAPE, S);
  x.clip();
  const bh = S * 0.7,
    sc = Math.max(S / img.width, bh / img.height),
    dw = img.width * sc,
    dh = img.height * sc;
  x.drawImage(img, (S - dw) / 2, 0.12 * S + (bh - dh) / 2, dw, dh);
  x.fillStyle = "rgba(244,239,227,0.08)";
  x.fillRect(0, 0, S, S);
  const tg = x.createLinearGradient(0, 0, 0, 0.28 * S);
  tg.addColorStop(0, "#F4EFE3");
  tg.addColorStop(0.7, "rgba(244,239,227,0.6)");
  tg.addColorStop(1, "rgba(244,239,227,0)");
  x.fillStyle = tg;
  x.fillRect(0, 0, S, 0.28 * S);
  x.fillStyle = "#F4EFE3";
  x.beginPath();
  x.moveTo(0, S);
  x.lineTo(0, 0.8 * S);
  const n = 9,
    r = S / (2 * n);
  for (let i = 0; i < n; i++)
    x.arc(r + i * 2 * r, 0.8 * S, r, Math.PI, Math.PI * 2, false);
  x.lineTo(S, S);
  x.closePath();
  x.fill();
  x.restore();
  const serif = "'Newsreader', Georgia, serif";
  x.textAlign = "left";
  x.fillStyle = "rgba(42,33,24,0.85)";
  x.font = `500 26px ${serif}`;
  x.fillText("* Studio", 0.07 * S, 0.085 * S);
  x.textAlign = "right";
  x.fillStyle = "rgba(42,33,24,0.6)";
  x.font = "600 20px Inter, sans-serif";
  x.fillText("SERIES 04", 0.93 * S, 0.085 * S);
  x.textAlign = "center";
  x.fillStyle = "#2A2118";
  x.font = `600 44px ${serif}`;
  tracked(x, `+ ${title} +`, S / 2, 0.9 * S, 7);
  x.fillStyle = "rgba(42,33,24,0.7)";
  x.font = "600 22px Inter, sans-serif";
  tracked(x, "EST. 1958", S / 2, 0.945 * S, 6);
  x.fillStyle = "rgba(42,33,24,0.35)";
  for (let i = 0; i < 5; i++) {
    x.beginPath();
    x.arc(0.42 * S + i * 0.04 * S, 0.945 * S, 2.5, 0, Math.PI * 2);
    x.fill();
  }
  for (let j = 0; j < 3; j++)
    for (let i = 0; i < 3; i++) {
      x.fillStyle = (i + j) % 2 ? "#2A2118" : "#F4EFE3";
      x.fillRect(0.07 * S + i * 14, 0.88 * S + j * 14, 14, 14);
    }
  x.textAlign = "right";
  x.fillStyle = "rgba(42,33,24,0.55)";
  x.font = "600 18px Inter, sans-serif";
  x.fillText("No. 072", 0.93 * S, 0.905 * S);
  x.fillText("28/11", 0.93 * S, 0.945 * S);
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

const setup = (gl, canvasEl, tex, wrapEl, live, setHot, ringApi, ptr) => {
  const p = program(gl);
  if (!p) return null;
  const mob = window.innerWidth < 768,
    N = mob ? 20 : 26,
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
      anch[k] = j < 3 ? 0.05 : 0.012;
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
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_LINEAR,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);
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
      pos[i3 + 1] = py + vy - 0.0009;
      pos[i3 + 2] = pz + vz;
    }
    if (intro < 2.5) {
      intro += 1 / 60;
      const a = 0.12 * W * (1 - intro / 2.5);
      for (let k = 0; k < count; k++) {
        const i3 = k * 3,
          u = (k % N) / (N - 1),
          z = Math.sin(u * Math.PI * 3 + intro * 5) * a;
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
      const r = (mob ? 0.22 : 0.18) * W;
      for (let k = 0; k < count; k++) {
        const i3 = k * 3,
          dx = grab.x - pos[i3],
          dy = grab.y - pos[i3 + 1],
          d = Math.hypot(dx, dy);
        if (d < r) {
          const w = (1 - d / r) ** 2 * 0.35;
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

export default function ClothImage({ index = 0 }) {
  const title = ART[index % ART.length][0];
  const wrap = useRef(null),
    canvas = useRef(null),
    ringOut = useRef(null),
    ringApi = useRef(null),
    ptr = useRef({ x: 0, y: 0 }),
    live = useRef(false);
  const [status, setStatus] = useState("load"),
    [src, setSrc] = useState(null),
    [hot, setHot] = useState(false);
  const inView = useInView(wrap, { margin: "200px" });
  useEffect(() => {
    live.current = inView;
  }, [inView]);
  useEffect(() => {
    const canvasEl = canvas.current,
      wrapEl = wrap.current,
      off = [];
    let dead = false;
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
      const r = await resolve(index);
      if (dead) return;
      if (!r.img) return fallback(r.url);
      const tex = buildTexture(r.img, title);
      let dataUrl = null;
      try {
        dataUrl = tex.toDataURL();
      } catch {
        null;
      }
      if (!gl) return fallback(dataUrl || r.url);
      const env = setup(gl, canvasEl, tex, wrapEl, live, setHot, ringApi, ptr);
      if (!env) return fallback(dataUrl || r.url);
      off.push(env.stop);
      setSrc(dataUrl || r.url);
      setStatus("run");
    })();
    return () => {
      dead = true;
      off.forEach((f) => f());
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
      <motion.div
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
            opacity: status === "run" ? 1 : 0,
            transition: "opacity .5s ease",
          }}
        />
        {status === "img" && src && (
          <img
            src={src}
            alt={title}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "1rem",
            }}
          />
        )}
      </motion.div>
      {createPortal(
        <AnimatePresence>
          {hot && (
            <motion.div
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
              <motion.span
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
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
