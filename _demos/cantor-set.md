---
layout: page
title: The Cantor set and the devil's staircase
description: An uncountable set of measure zero, and a continuous function that climbs from 0 to 1 with derivative 0 almost everywhere.
topic: measure theory
order: 2
thumb: demo-thumbs/cantor-set.svg
---

The Cantor set is where different notions of "size" stop agreeing. It has as many points as $$[0,1]$$, yet its Lebesgue measure is zero. Its distribution function, the Cantor function, is the standard counterexample to the fundamental theorem of calculus for Lebesgue integrals, and the measure it defines is the standard example of a measure that is neither absolutely continuous nor made of atoms.

## Definitions

Let $$C_0 = [0,1]$$, and obtain $$C_{n}$$ from $$C_{n-1}$$ by removing the open middle third of each of its intervals. Equivalently,

$$
C_n = \tfrac13 C_{n-1} \,\cup\, \left( \tfrac23 + \tfrac13 C_{n-1} \right), \qquad
C = \bigcap_{n \ge 0} C_n .
$$

$$C_n$$ is a disjoint union of $$2^n$$ closed intervals, each of length $$3^{-n}$$, so

$$
\lambda(C) \le \lambda(C_n) = \left(\tfrac23\right)^n \longrightarrow 0 .
$$

In base 3, a point $$x \in [0,1]$$ lies in $$C$$ if and only if it has a ternary expansion $$x = \sum_{k \ge 1} a_k 3^{-k}$$ with every digit $$a_k \in \{0, 2\}$$. Some points have two expansions, for example $$\tfrac13 = 0.1000\ldots_3 = 0.0222\ldots_3$$; the condition asks for one of them to avoid the digit 1. Replacing each digit $$2$$ by $$1$$ and reading the result in base 2 maps $$C$$ onto $$[0,1]$$, so $$C$$ is uncountable.

The **Cantor function** $$F : [0,1] \to [0,1]$$ is defined from the ternary expansion $$x = 0.a_1 a_2 a_3 \ldots_3$$. Let $$N$$ be the first index with $$a_N = 1$$, or $$N = \infty$$ if there is none. Then

$$
F(x) = \sum_{k < N} \frac{a_k}{2}\, 2^{-k} \;+\; 2^{-N},
$$

where the last term is dropped when $$N = \infty$$. This does not depend on which expansion is used. $$F$$ is nondecreasing and continuous, $$F(0) = 0$$, $$F(1) = 1$$, and $$F$$ is constant on every removed interval.

<div class="demo-widget" id="cantor-demo">
  <div class="demo-controls">
    <label>stage n <input type="range" min="0" max="10" step="1" value="3" data-role="n" /> <span class="v" data-role="n-out">3</span></label>
    <div class="demo-seg" role="group" aria-label="Pick a point">
      <button type="button" data-p="1" data-q="4">1/4</button>
      <button type="button" data-p="3" data-q="4">3/4</button>
      <button type="button" data-p="1" data-q="3">1/3</button>
      <button type="button" class="is-on" data-p="1" data-q="2">1/2</button>
      <button type="button" data-p="1" data-q="10">1/10</button>
    </div>
  </div>
  <canvas data-role="main" height="430" aria-label="The sets C_0 to C_n and the graph of the Cantor function"></canvas>
  <p class="demo-caption">Top: C<sub>0</sub>, …, C<sub>n</sub>. Bottom: the Cantor function F (thin) and its stage-n approximation F<sub>n</sub> (thick). Click or drag to pick any point x. A point picked at random lands in a removed interval with probability 1.</p>
  <div class="demo-readout">
    <div><span class="k">intervals in C<sub>n</sub></span><span class="v" data-role="count">–</span></div>
    <div><span class="k">each of length</span><span class="v" data-role="len">–</span></div>
    <div><span class="k">λ(C<sub>n</sub>)</span><span class="v" data-role="measure">–</span></div>
    <div><span class="k">x</span><span class="v" data-role="x">–</span></div>
    <div><span class="k">F(x)</span><span class="v" data-role="F">–</span></div>
    <div><span class="k">status</span><span class="v" data-role="status">–</span></div>
  </div>
  <div class="demo-readout demo-readout-wide">
    <div><span class="k">x in base 3</span><span class="v demo-digits" data-role="tern">–</span></div>
    <div><span class="k">F(x) in base 2</span><span class="v demo-digits" data-role="bin">–</span></div>
  </div>
</div>

## What to notice

**Measure zero but uncountable.** Every point you click is removed at some finite stage unless you pick one of the special points. Try $$\tfrac14 = 0.0202\ldots_3$$: it is in $$C$$ but is not the endpoint of any removed interval, and $$F(\tfrac14) = 0.0101\ldots_2 = \tfrac13$$.

**The stage-$$n$$ approximations.** Let $$F_n$$ be the distribution function of the uniform probability measure on $$C_n$$: it rises with slope $$(3/2)^n$$ on each interval of $$C_n$$ and is flat elsewhere. On each interval of $$C_n$$ both $$F_n$$ and $$F$$ go from $$j/2^n$$ to $$(j+1)/2^n$$, and off $$C_n$$ they agree, so

$$
\sup_{x \in [0,1]} \lvert F_n(x) - F(x) \rvert \le 2^{-n} .
$$

**The fundamental theorem of calculus fails.** $$F$$ is constant on each removed interval, so $$F'(x) = 0$$ for every $$x \in [0,1] \setminus C$$, that is, almost everywhere. Hence

$$
\int_0^1 F'(x)\, dx = 0 \neq 1 = F(1) - F(0) .
$$

The theorem $$\int_a^b F' = F(b) - F(a)$$ for Lebesgue integrals needs $$F$$ to be absolutely continuous, and $$F$$ is not.

**A singular continuous measure.** Let $$\mu_F$$ be the Lebesgue–Stieltjes measure of $$F$$, so $$\mu_F((a,b]) = F(b) - F(a)$$. It gives the whole interval $$[0,1]$$ mass $$1$$ but gives each removed interval mass $$0$$, so $$\mu_F(C) = 1$$ while $$\lambda(C) = 0$$: $$\mu_F$$ and $$\lambda$$ are mutually singular. Because $$F$$ is continuous, $$\mu_F(\{x\}) = 0$$ for every point. In the Lebesgue decomposition of a finite measure on $$\mathbb{R}$$ into an absolutely continuous part, a part concentrated on countably many atoms, and a singular continuous part, $$\mu_F$$ is entirely the third kind.

**Dimension.** $$C$$ is made of 2 copies of itself scaled by $$\tfrac13$$, which gives Hausdorff dimension $$\log 2 / \log 3 \approx 0.631$$: bigger than a countable set, smaller than an interval.

<script src="{{ '/assets/js/demos/cantor-set.js' | relative_url }}"></script>
