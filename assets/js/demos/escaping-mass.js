// Three ways to lose mass: h_n = 1_[n,n+1], w_n = (1/n) 1_[0,n], v_n = n 1_[1/n,2/n].
(function () {
  const root = document.getElementById("escape-demo");
  if (!root) return;

  const NMAX = 40;
  const mainCanvas = root.querySelector('[data-role="main"]');
  const seqCanvas = root.querySelector('[data-role="seq"]');
  const nInput = root.querySelector('[data-role="n"]');
  const nOut = root.querySelector('[data-role="n-out"]');
  const envInput = root.querySelector('[data-role="env"]');
  const out = {
    x0: root.querySelector('[data-role="x0"]'),
    fx0: root.querySelector('[data-role="fx0"]'),
    envint: root.querySelector('[data-role="envint"]'),
  };
  const buttons = Array.from(root.querySelectorAll("[data-seq]"));

  // Each sequence: the interval [a_n, b_n] and the height c_n, so f_n = c_n 1_[a_n, b_n].
  const SEQ = {
    h: { a: (n) => n, b: (n) => n + 1, c: () => 1, view: { x0: -1, x1: 42, y1: 1.4 }, start: 3.5 },
    w: { a: () => 0, b: (n) => n, c: (n) => 1 / n, view: { x0: -1, x1: 42, y1: 1.4 }, start: 3.5 },
    v: { a: (n) => 1 / n, b: (n) => 2 / n, c: (n) => n, view: { x0: -0.1, x1: 2.2, y1: 12 }, start: 0.3 },
  };

  const state = { seq: "h", n: 1, env: false, x0: { h: SEQ.h.start, w: SEQ.w.start, v: SEQ.v.start } };

  function f(seq, n, x) {
    const s = SEQ[seq];
    return x >= s.a(n) && x <= s.b(n) ? s.c(n) : 0;
  }

  // Exact integral of the piecewise-constant envelope max_{k<=n} f_k.
  function envelope(seq, n) {
    const s = SEQ[seq];
    const pts = new Set();
    for (let k = 1; k <= n; k++) {
      pts.add(s.a(k));
      pts.add(s.b(k));
    }
    const xs = Array.from(pts).sort((p, q) => p - q);
    const pieces = [];
    let total = 0;
    for (let i = 0; i + 1 < xs.length; i++) {
      const mid = (xs[i] + xs[i + 1]) / 2;
      let m = 0;
      for (let k = 1; k <= n; k++) m = Math.max(m, f(seq, k, mid));
      total += m * (xs[i + 1] - xs[i]);
      pieces.push([xs[i], xs[i + 1], m]);
    }
    return { total, pieces };
  }

  function colors() {
    const cs = getComputedStyle(document.documentElement);
    const get = (name, fallback) => (cs.getPropertyValue(name) || "").trim() || fallback;
    return {
      text: get("--global-text-color", "#000"),
      light: get("--global-text-color-light", "#888"),
      theme: get("--global-theme-color", "#b509ac"),
      divider: get("--global-divider-color", "rgba(0,0,0,.1)"),
      font: getComputedStyle(document.body).fontFamily,
    };
  }

  function setup(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = Number(canvas.dataset.h || (canvas.dataset.h = canvas.getAttribute("height")));
    canvas.style.height = h + "px";
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  const PAD = { l: 34, r: 12, t: 14, b: 26 };

  function drawMain() {
    const { ctx, w, h } = setup(mainCanvas);
    const c = colors();
    const s = SEQ[state.seq];
    const V = s.view;
    const X = (x) => PAD.l + ((x - V.x0) / (V.x1 - V.x0)) * (w - PAD.l - PAD.r);
    const Y = (y) => h - PAD.b - (y / V.y1) * (h - PAD.t - PAD.b);
    ctx.clearRect(0, 0, w, h);
    ctx.font = "12px " + c.font;

    // axes and ticks
    ctx.strokeStyle = c.light;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.l, Y(0));
    ctx.lineTo(w - PAD.r, Y(0));
    ctx.moveTo(X(0), PAD.t);
    ctx.lineTo(X(0), h - PAD.b);
    ctx.stroke();
    ctx.fillStyle = c.light;
    ctx.textAlign = "center";
    const xticks = state.seq === "v" ? [0, 0.5, 1, 1.5, 2] : [0, 10, 20, 30, 40];
    xticks.forEach((t) => {
      ctx.fillText(String(t), X(t), h - PAD.b + 16);
      ctx.beginPath();
      ctx.moveTo(X(t), Y(0));
      ctx.lineTo(X(t), Y(0) + 4);
      ctx.stroke();
    });
    ctx.textAlign = "right";
    const yticks = state.seq === "v" ? [0, 5, 10] : [0, 0.5, 1];
    yticks.forEach((t) => {
      ctx.fillText(String(t), PAD.l - 6, Y(t) + 4);
      ctx.strokeStyle = c.divider;
      ctx.beginPath();
      ctx.moveTo(PAD.l, Y(t));
      ctx.lineTo(w - PAD.r, Y(t));
      ctx.stroke();
    });

    const clipY = (y) => Math.max(Y(Math.min(y, V.y1)), PAD.t);

    // envelope
    if (state.env) {
      const { pieces } = envelope(state.seq, state.n);
      ctx.fillStyle = c.light;
      ctx.globalAlpha = 0.22;
      pieces.forEach(([a, b, m]) => {
        if (m > 0) ctx.fillRect(X(a), clipY(m), Math.max(X(b) - X(a), 0.5), Y(0) - clipY(m));
      });
      ctx.globalAlpha = 1;
    }

    // f_n
    const a = s.a(state.n),
      b = s.b(state.n),
      ht = s.c(state.n);
    const left = X(a),
      right = X(b),
      top = clipY(ht);
    ctx.fillStyle = c.theme;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(left, top, Math.max(right - left, 1), Y(0) - top);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = c.theme;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD.l, Y(0));
    ctx.lineTo(left, Y(0));
    ctx.lineTo(left, top);
    ctx.lineTo(right, top);
    ctx.lineTo(right, Y(0));
    ctx.lineTo(w - PAD.r, Y(0));
    ctx.stroke();
    if (ht > V.y1) {
      ctx.fillStyle = c.theme;
      ctx.textAlign = "left";
      ctx.fillText("\u2191 height " + ht + " (off the chart)", right + 6, PAD.t + 10);
    }
    ctx.fillStyle = c.text;
    ctx.textAlign = "left";
    const labelY = Y(0) - top > 24 ? Math.max(top + 14, PAD.t + 26) : top - 8;
    ctx.fillText("area = 1", Math.min(right + 6, w - PAD.r - 60), labelY);

    // x0 marker
    const x0 = state.x0[state.seq];
    const fx = f(state.seq, state.n, x0);
    ctx.strokeStyle = c.text;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X(x0), PAD.t);
    ctx.lineTo(X(x0), Y(0));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c.text;
    ctx.beginPath();
    ctx.arc(X(x0), clipY(fx), 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.textAlign = "left";
    ctx.fillText("x\u2080", X(x0) + 5, Y(0) - 7);

    mainCanvas._toX = (px) => V.x0 + ((px - PAD.l) / (w - PAD.l - PAD.r)) * (V.x1 - V.x0);
  }

  function drawSeq() {
    const { ctx, w, h } = setup(seqCanvas);
    const c = colors();
    const x0 = state.x0[state.seq];
    const vals = [];
    for (let k = 1; k <= NMAX; k++) vals.push(f(state.seq, k, x0));
    const ymax = Math.min(Math.max(1.3, Math.max(...vals) * 1.1), 12);
    const P = { l: 34, r: 12, t: 12, b: 24 };
    const X = (k) => P.l + ((k - 0.5) / NMAX) * (w - P.l - P.r);
    const Y = (y) => h - P.b - (Math.min(y, ymax) / ymax) * (h - P.t - P.b);
    ctx.clearRect(0, 0, w, h);
    ctx.font = "12px " + c.font;

    ctx.strokeStyle = c.light;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(P.l, Y(0));
    ctx.lineTo(w - P.r, Y(0));
    ctx.stroke();
    ctx.fillStyle = c.light;
    ctx.textAlign = "center";
    [1, 10, 20, 30, 40].forEach((k) => ctx.fillText(String(k), X(k), h - P.b + 15));
    ctx.textAlign = "right";
    ctx.fillText("0", P.l - 6, Y(0) + 4);
    ctx.fillText("1", P.l - 6, Y(1) + 4);
    const top = Math.floor(ymax);
    if (top >= 3) ctx.fillText(String(top), P.l - 6, Y(top) + 4);
    ctx.strokeStyle = c.divider;
    ctx.beginPath();
    ctx.moveTo(P.l, Y(1));
    ctx.lineTo(w - P.r, Y(1));
    ctx.stroke();

    // integrals: constant 1
    ctx.strokeStyle = c.text;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(X(1), Y(1));
    ctx.lineTo(X(NMAX), Y(1));
    ctx.stroke();
    ctx.fillStyle = c.text;
    ctx.textAlign = "right";
    ctx.fillText("\u222b f\u2096 d\u03bb = 1", w - P.r, Y(1) - 6);

    // pointwise values
    vals.forEach((v, i) => {
      const k = i + 1;
      ctx.fillStyle = c.theme;
      ctx.globalAlpha = k === state.n ? 1 : 0.55;
      ctx.beginPath();
      ctx.arc(X(k), Y(v), k === state.n ? 5 : 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = c.theme;
    ctx.textAlign = "left";
    ctx.fillText("f\u2096(x\u2080)", P.l + 4, P.t + 8);
  }

  function fmt(v) {
    if (v === 0) return "0";
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(6).replace(/0+$/, "");
  }

  function update() {
    nOut.textContent = String(state.n);
    buttons.forEach((b) => b.classList.toggle("is-on", b.dataset.seq === state.seq));
    const x0 = state.x0[state.seq];
    out.x0.textContent = "= " + fmt(Math.round(x0 * 1000) / 1000);
    out.fx0.textContent = "= " + fmt(f(state.seq, state.n, x0));
    const E = envelope(state.seq, state.n).total;
    let label = "= " + fmt(Math.round(E * 1e6) / 1e6);
    if (state.seq === "h") label = "= " + state.n;
    if (state.seq === "w") label = "= H\u2099 \u2248 " + E.toFixed(4);
    out.envint.textContent = label;
    drawMain();
    drawSeq();
  }

  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      state.seq = b.dataset.seq;
      update();
    })
  );
  nInput.addEventListener("input", () => {
    state.n = Number(nInput.value);
    update();
  });
  envInput.addEventListener("change", () => {
    state.env = envInput.checked;
    update();
  });

  let dragging = false;
  function setX0(ev) {
    const rect = mainCanvas.getBoundingClientRect();
    const V = SEQ[state.seq].view;
    const x = mainCanvas._toX(ev.clientX - rect.left);
    state.x0[state.seq] = Math.min(Math.max(x, V.x0), V.x1);
    update();
  }
  mainCanvas.addEventListener("pointerdown", (ev) => {
    dragging = true;
    mainCanvas.setPointerCapture(ev.pointerId);
    setX0(ev);
  });
  mainCanvas.addEventListener("pointermove", (ev) => dragging && setX0(ev));
  mainCanvas.addEventListener("pointerup", () => (dragging = false));

  window.addEventListener("resize", update);
  new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  update();
})();
