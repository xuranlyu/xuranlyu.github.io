// The Cantor set C_n, the Cantor function F and its approximations F_n.
// Points are kept as exact fractions p/q so ternary digits (and membership in C) are computed exactly.
(function () {
  const root = document.getElementById("cantor-demo");
  if (!root) return;

  const canvas = root.querySelector('[data-role="main"]');
  const nInput = root.querySelector('[data-role="n"]');
  const nOut = root.querySelector('[data-role="n-out"]');
  const picks = Array.from(root.querySelectorAll("[data-p]"));
  const out = {};
  ["count", "len", "measure", "x", "F", "status", "tern", "bin"].forEach((k) => (out[k] = root.querySelector('[data-role="' + k + '"]')));

  const SNAP = 1000000; // clicks snap to multiples of 1e-6
  const state = { n: 3, p: 1, q: 2, label: "1/2" };

  // Ternary analysis of x = p/q in [0,1], done in exact integer arithmetic.
  // Digits: d_i = floor(3 r_{i-1} / q), r_i = 3 r_{i-1} - d_i q, r_0 = p.
  // The remainders are eventually periodic, so "a digit 1 ever occurs" is decided exactly:
  // we scan digits in order and stop at the first 1, or when the remainder repeats (cycle found).
  function analyse(p, q) {
    const D = 64;
    if (p === q) {
      return { digits: Array(D).fill(2), inC: true, N: Infinity, endpoint: false, F: 1, fbits: Array(D).fill(1) };
    }
    const digits = [];
    let r = p,
      tort = p,
      i = 0,
      N = Infinity,
      endpoint = false;
    for (;;) {
      const d = Math.floor((3 * r) / q);
      r = 3 * r - d * q;
      i += 1;
      if (digits.length < D) digits.push(d);
      if (d === 1) {
        N = i;
        endpoint = r === 0; // ...1000... = ...0222..., still in C
        break;
      }
      if (i % 2 === 0) tort = (3 * tort) % q; // tortoise at r_{floor(i/2)}
      if (r === tort) break; // r_i = r_j with j < i: every state has been scanned, no 1 anywhere
    }
    while (digits.length < D) {
      const d = Math.floor((3 * r) / q);
      r = 3 * r - d * q;
      digits.push(d);
    }
    const inC = N === Infinity || endpoint;
    // F(x) = sum_{k<N} (a_k/2) 2^-k + 2^-N
    const fbits = [];
    let F = 0;
    const upto = Math.min(N === Infinity ? D : N - 1, D);
    for (let k = 1; k <= upto; k++) {
      const b = digits[k - 1] / 2;
      fbits.push(b);
      F += b * Math.pow(2, -k);
    }
    if (N !== Infinity) {
      fbits.push(1);
      F += Math.pow(2, -N);
    }
    while (fbits.length < D) fbits.push(0);
    return { digits, inC, N, endpoint, F, fbits };
  }

  // Cantor function for drawing (floating point recursion, depth-limited).
  function cantorF(x, depth) {
    if (depth === 0) return x;
    if (x <= 1 / 3) return 0.5 * cantorF(3 * x, depth - 1);
    if (x >= 2 / 3) return 0.5 + 0.5 * cantorF(3 * x - 2, depth - 1);
    return 0.5;
  }
  // F_n: piecewise linear, equal to F at the endpoints of the intervals of C_n
  function Fn(x, n) {
    if (n === 0) return x;
    if (x <= 1 / 3) return 0.5 * Fn(3 * x, n - 1);
    if (x >= 2 / 3) return 0.5 + 0.5 * Fn(3 * x - 2, n - 1);
    return 0.5;
  }

  function intervals(n) {
    let iv = [[0, 1]];
    for (let k = 0; k < n; k++) {
      const next = [];
      iv.forEach(([a, b]) => {
        const t = (b - a) / 3;
        next.push([a, a + t], [b - t, b]);
      });
      iv = next;
    }
    return iv;
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

  const P = { l: 34, r: 14, t: 10 };
  const ROW = 13,
    ROWS = 11,
    GAP = 26;

  function draw(info) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = Number(canvas.dataset.h || (canvas.dataset.h = canvas.getAttribute("height")));
    canvas.style.height = h + "px";
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const c = colors();
    ctx.clearRect(0, 0, w, h);
    ctx.font = "12px " + c.font;

    const X = (x) => P.l + x * (w - P.l - P.r);
    const x = state.p / state.q;

    // rows C_0 ... C_n
    for (let k = 0; k <= state.n; k++) {
      const y = P.t + k * ROW;
      ctx.fillStyle = k === state.n ? c.theme : c.light;
      ctx.globalAlpha = k === state.n ? 1 : 0.55;
      intervals(k).forEach(([a, b]) => {
        ctx.fillRect(X(a), y, Math.max(X(b) - X(a), 1), ROW - 5);
      });
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = c.light;
    ctx.textAlign = "right";
    ctx.fillText("C\u2080", P.l - 6, P.t + 8);
    if (state.n > 0) ctx.fillText("C" + subscript(state.n), P.l - 6, P.t + state.n * ROW + 8);

    // staircase panel
    const top = P.t + ROWS * ROW + GAP;
    const bottom = h - 26;
    const Y = (v) => bottom - v * (bottom - top);
    ctx.strokeStyle = c.light;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X(0), top);
    ctx.lineTo(X(0), bottom);
    ctx.lineTo(X(1), bottom);
    ctx.stroke();
    ctx.fillStyle = c.light;
    ctx.textAlign = "center";
    ["0", "1/3", "2/3", "1"].forEach((t, i) => ctx.fillText(t, X([0, 1 / 3, 2 / 3, 1][i]), bottom + 16));
    ctx.textAlign = "right";
    ctx.fillText("0", P.l - 6, Y(0) + 4);
    ctx.fillText("1/2", P.l - 6, Y(0.5) + 4);
    ctx.fillText("1", P.l - 6, Y(1) + 4);
    ctx.strokeStyle = c.divider;
    [0.5, 1].forEach((v) => {
      ctx.beginPath();
      ctx.moveTo(X(0), Y(v));
      ctx.lineTo(X(1), Y(v));
      ctx.stroke();
    });

    // F (limit), sampled finely
    const M = Math.max(600, Math.round(w * 2));
    ctx.strokeStyle = c.text;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= M; i++) {
      const t = i / M;
      const v = cantorF(t, 30);
      if (i === 0) ctx.moveTo(X(t), Y(v));
      else ctx.lineTo(X(t), Y(v));
    }
    ctx.stroke();

    // F_n, exact polyline through the endpoints of C_n
    ctx.strokeStyle = c.theme;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    intervals(state.n).forEach(([a, b]) => {
      ctx.lineTo(X(a), Y(Fn(a, state.n)));
      ctx.lineTo(X(b), Y(Fn(b, state.n)));
    });
    ctx.lineTo(X(1), Y(1));
    ctx.stroke();
    ctx.fillStyle = c.theme;
    ctx.textAlign = "left";
    ctx.fillText("F" + subscript(state.n), X(0) + 6, top + 12);

    // the chosen point
    ctx.strokeStyle = c.text;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X(x), P.t - 4);
    ctx.lineTo(X(x), bottom);
    ctx.moveTo(X(0), Y(info.F));
    ctx.lineTo(X(x), Y(info.F));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = info.inC ? c.theme : c.text;
    ctx.beginPath();
    ctx.arc(X(x), Y(info.F), 4.5, 0, 2 * Math.PI);
    ctx.fill();

    // outline the gap containing x on row N, the stage at which x is removed
    if (!info.inC && info.N <= state.n) {
      const N = info.N;
      let a = 0;
      for (let k = 1; k <= N; k++) a += info.digits[k - 1] * Math.pow(3, -k);
      const len = Math.pow(3, -N);
      const y = P.t + N * ROW;
      ctx.strokeStyle = c.text;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(X(a), y - 1, Math.max(X(a + len) - X(a), 3), ROW - 3);
    }

    canvas._toX = (px) => (px - P.l) / (w - P.l - P.r);
  }

  const SUB = "\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089";
  function subscript(n) {
    return String(n)
      .split("")
      .map((d) => SUB[Number(d)])
      .join("");
  }

  function digitString(ds, count, mark) {
    return ds
      .slice(0, count)
      .map((d) => (mark && d === 1 ? '<span class="one">1</span>' : String(d)))
      .join("");
  }

  function update() {
    const n = state.n;
    nOut.textContent = String(n);
    out.count.textContent = "2" + sup(n) + " = " + Math.pow(2, n);
    out.len.textContent = "3\u207b" + sup(n) + " \u2248 " + Math.pow(3, -n).toPrecision(4);
    if (n === 0) out.len.textContent = "1";
    out.measure.textContent = "(2/3)" + sup(n) + " \u2248 " + Math.pow(2 / 3, n).toPrecision(4);

    const info = analyse(state.p, state.q);
    out.x.textContent = "= " + state.label;
    out.F.textContent = "= " + info.F.toFixed(6);
    if (info.inC) {
      out.status.textContent = info.endpoint
        ? "in C (endpoint: \u20261000\u2026\u2083 = \u20260222\u2026\u2083)"
        : state.p === state.q
          ? "in C (1 = 0.222\u2026\u2083)"
          : "in C (no digit 1)";
    } else {
      out.status.textContent = "removed at stage " + info.N;
    }
    const shown = 20;
    out.tern.innerHTML = "0." + digitString(info.digits, shown, true) + "\u2026";
    out.bin.innerHTML = "0." + digitString(info.fbits, shown, false) + "\u2026";
    picks.forEach((b) => b.classList.toggle("is-on", Number(b.dataset.p) * state.q === Number(b.dataset.q) * state.p));
    draw(info);
  }

  function sup(n) {
    const S = "\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079";
    return String(n)
      .split("")
      .map((d) => S[Number(d)])
      .join("");
  }

  function gcd(a, b) {
    while (b) [a, b] = [b, a % b];
    return a;
  }

  nInput.addEventListener("input", () => {
    state.n = Number(nInput.value);
    update();
  });
  picks.forEach((b) =>
    b.addEventListener("click", () => {
      state.p = Number(b.dataset.p);
      state.q = Number(b.dataset.q);
      state.label = b.textContent.trim();
      update();
    })
  );

  let dragging = false;
  function setX(ev) {
    const rect = canvas.getBoundingClientRect();
    let t = canvas._toX(ev.clientX - rect.left);
    t = Math.min(Math.max(t, 0), 1);
    let p = Math.round(t * SNAP);
    let q = SNAP;
    const g = gcd(p, q) || 1;
    p /= g;
    q /= g;
    state.p = p;
    state.q = q;
    state.label = (p / q).toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
    update();
  }
  canvas.addEventListener("pointerdown", (ev) => {
    dragging = true;
    canvas.setPointerCapture(ev.pointerId);
    setX(ev);
  });
  canvas.addEventListener("pointermove", (ev) => dragging && setX(ev));
  canvas.addEventListener("pointerup", () => (dragging = false));

  window.addEventListener("resize", update);
  new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  update();
})();
