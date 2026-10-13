---
layout: page
title: Three ways to lose mass
description: Functions that go to zero at every point while their integrals stay equal to 1.
topic: measure theory
order: 1
thumb: demo-thumbs/escaping-mass.svg
---

When can you swap a limit and an integral? The question shows up everywhere: differentiating an option price under the integral sign, passing to the limit inside an expectation, proving that a numerical scheme for a PDE converges. Pointwise convergence alone is never enough, and the three sequences below are the reason. The names are Terence Tao's, from his notes on modes of convergence.

## The three sequences

Work on $$\mathbb{R}$$ with Lebesgue measure $$\lambda$$. For $$n \ge 1$$ define

$$
h_n = \mathbf{1}_{[n,\,n+1]}, \qquad
w_n = \tfrac{1}{n}\,\mathbf{1}_{[0,\,n]}, \qquad
v_n = n\,\mathbf{1}_{[1/n,\,2/n]}.
$$

The first one slides off to the right (escape to horizontal infinity), the second spreads out flat (escape to width infinity), the third gets thin and tall (escape to vertical infinity). Each one is nonnegative, and for every $$n$$

$$
\int_{\mathbb{R}} h_n \, d\lambda = \int_{\mathbb{R}} w_n \, d\lambda = \int_{\mathbb{R}} v_n \, d\lambda = 1 .
$$

But each one converges to $$0$$ at every point $$x \in \mathbb{R}$$. For $$h_n$$, once $$n > x$$ the point $$x$$ is to the left of the bump. For $$w_n$$, $$0 \le w_n(x) \le 1/n$$, so the convergence is even uniform. For $$v_n$$, if $$x \le 0$$ then $$v_n(x) = 0$$ for all $$n$$, and if $$x > 0$$ then $$2/n < x$$ as soon as $$n > 2/x$$. So in all three cases

$$
\lim_{n\to\infty} \int f_n \, d\lambda = 1 \neq 0 = \int \lim_{n\to\infty} f_n \, d\lambda .
$$

<div class="demo-widget" id="escape-demo">
  <div class="demo-controls">
    <div class="demo-seg" role="group" aria-label="Choose a sequence">
      <button type="button" class="is-on" data-seq="h">horizontal</button>
      <button type="button" data-seq="w">width</button>
      <button type="button" data-seq="v">vertical</button>
    </div>
    <label>n <input type="range" min="1" max="40" step="1" value="1" data-role="n" /> <span class="v" data-role="n-out">1</span></label>
    <label><input type="checkbox" data-role="env" /> <span>show the envelope max<sub>k≤n</sub> f<sub>k</sub></span></label>
  </div>
  <canvas data-role="main" height="300" aria-label="Graph of f_n"></canvas>
  <p class="demo-caption">Click or drag on the graph to move the point x₀.</p>
  <canvas data-role="seq" height="170" aria-label="The values f_k(x0) and the integrals of f_k against k"></canvas>
  <p class="demo-caption">Below: at your fixed point x₀ the values f<sub>k</sub>(x₀) go to 0, while the integrals stay at 1.</p>
  <div class="demo-readout">
    <div><span class="k">∫ f<sub>n</sub> dλ</span><span class="v">= 1</span></div>
    <div><span class="k">x₀</span><span class="v" data-role="x0">–</span></div>
    <div><span class="k">f<sub>n</sub>(x₀)</span><span class="v" data-role="fx0">–</span></div>
    <div><span class="k">∫ max<sub>k≤n</sub> f<sub>k</sub> dλ</span><span class="v" data-role="envint">–</span></div>
  </div>
</div>

## Why the convergence theorems don't apply

**Monotone convergence** needs $$f_1 \le f_2 \le \cdots$$. None of these sequences is increasing.

**Dominated convergence** needs a single integrable $$g$$ with $$f_n \le g$$ for every $$n$$. Any such $$g$$ satisfies $$g \ge \max_{k \le n} f_k$$ for each $$n$$, so $$\int g \, d\lambda \ge \int \max_{k\le n} f_k \, d\lambda$$. Turn on the envelope above and watch that number: it equals $$n$$ for the horizontal sequence, $$1 + \tfrac12 + \cdots + \tfrac1n$$ for the width sequence, and also grows without bound for the vertical one. In fact the full suprema are

$$
\sup_k h_k = \mathbf{1}_{[1,\infty)}, \qquad
\sup_k w_k(x) = \frac{1}{\max(1, \lceil x \rceil)} \ (x \ge 0), \qquad
\sup_k v_k(x) = \left\lfloor \frac{2}{x} \right\rfloor \ (0 < x \le 1),
$$

and none of them is integrable. So no dominating function exists.

**Fatou's lemma** still holds, as it always does for nonnegative functions:

$$
\int \liminf_{n\to\infty} f_n \, d\lambda \;\le\; \liminf_{n\to\infty} \int f_n \, d\lambda ,
$$

and here it reads $$0 \le 1$$. These are the standard examples showing the inequality can be strict.

## Which hypothesis each one breaks

On a space of finite measure, a uniformly bounded sequence that converges pointwise cannot lose mass (this is the bounded convergence theorem). The horizontal and width sequences are bounded by 1, so they need the infinite measure of $$\mathbb{R}$$. The vertical sequence does not: it lives inside $$[0, 2]$$.

The modern way to say this uses two conditions, as in Royden and Fitzpatrick (Section 18.3). A sequence $$\{f_n\}$$ is **uniformly integrable** if for every $$\varepsilon > 0$$ there is $$\delta > 0$$ such that for every $$n$$ and every measurable $$E$$,

$$
\lambda(E) < \delta \implies \int_E \lvert f_n \rvert \, d\lambda < \varepsilon .
$$

It is **tight** if for every $$\varepsilon > 0$$ there is a measurable set $$X_0$$ with $$\lambda(X_0) < \infty$$ such that

$$
\int_{\mathbb{R} \setminus X_0} \lvert f_n \rvert \, d\lambda < \varepsilon \quad \text{for all } n .
$$

The vertical sequence is not uniformly integrable: take $$E = [1/n, 2/n]$$, which has measure $$1/n$$ but carries all of the mass of $$v_n$$. The horizontal and width sequences are uniformly integrable (they are bounded by 1, so $$\int_E \lvert f_n \rvert \le \lambda(E)$$) but not tight: for any $$X_0$$ of finite measure, $$\int_{X_0} h_n \to 0$$ and $$\int_{X_0} w_n \le \lambda(X_0)/n \to 0$$, so the mass outside $$X_0$$ tends to 1.

The Vitali convergence theorem says these two conditions are exactly what is missing: if $$\{f_n\}$$ is uniformly integrable and tight, $$f_n \to f$$ almost everywhere, and $$f$$ is integrable, then $$\int f_n \, d\lambda \to \int f \, d\lambda$$.

<script src="{{ '/assets/js/demos/escaping-mass.js' | relative_url }}"></script>
