---
title: Week 5 (Autoencoders, PCA link, Regularised AEs)
summary: Week 5 from first principles: autoencoders, their exact link to PCA, and the regularised family (weight decay, tied weights, denoising, sparse, contractive) with worked examples.
tags: [deep-learning, quiz-2, week-5]
color: blue
order: 5
---

# Deep Learning : Illustrated Notes for Week 5


## Contents

- **Week 5 — Autoencoders and relation to PCA, regularisation in autoencoders, denoising, sparse and contractive autoencoders** ✓
  - 5.0 Week-5 map
  - 5.1 PCA refresher (the yardstick for autoencoders)
  - 5.2 The autoencoder: encoder, decoder, loss
  - 5.3 Link between PCA and autoencoders
  - 5.4 Regularisation in autoencoders (why, weight decay, tied weights)
  - 5.5 Denoising autoencoders
  - 5.6 Sparse autoencoders
  - 5.7 Contractive autoencoders
  - 5.8 The autoencoder family side by side
  - 5.9 Week-5 exam toolkit & practice set


---


## 5.0 Week-5 map

**[Intuition]** Weeks 1–4 were **supervised**: every $\mathbf x$ came with a label $y$. Week 5 asks: can a network learn something useful from $\mathbf x$ **alone**? The trick is to make $\mathbf x$ its own label. Squeeze the input through a narrow code $\mathbf h$ and ask the network to rebuild $\mathbf x$ from it. If it can, $\mathbf h$ must hold the important structure of the data.

Two questions drive the week:
1. **What does an autoencoder learn?** In the simplest (linear) case: exactly PCA.
2. **How do we stop it from cheating** (copying input to output)? Regularise: weight decay, tied weights, noise, sparsity, contraction.

<div class="fig" role="img" aria-label="Autoencoder overview">
<svg viewBox="0 0 700 126" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="10" y="8" width="80" height="44" rx="8" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<text x="50" y="26.8" text-anchor="middle" style="fill:var(--fg-2);font-size:11.5px;font-weight:700">Input</text>
<text x="50" y="41.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">x</text>
<rect x="120" y="8" width="150" height="44" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="195" y="26.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">Encoder</text>
<text x="195" y="41.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">h = g(Wx + b)</text>
<rect x="300" y="8" width="90" height="44" rx="8" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.5"/>
<text x="345" y="26.8" text-anchor="middle" style="fill:var(--yellow-ink);font-size:11.5px;font-weight:700">Code</text>
<text x="345" y="41.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">h  (k &lt; n)</text>
<rect x="420" y="8" width="140" height="44" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="490" y="26.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">Decoder</text>
<text x="490" y="41.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">x̂ = f(W*h + c)</text>
<rect x="590" y="8" width="100" height="44" rx="8" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="640" y="26.8" text-anchor="middle" style="fill:var(--red-ink);font-size:11.5px;font-weight:700">Loss</text>
<text x="640" y="41.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">x̂ vs x</text>
<line x1="90" y1="30" x2="115.8" y2="30" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="120,30 114,32.9 114,27.1" style="fill:var(--line-strong)"/>
<line x1="270" y1="30" x2="295.8" y2="30" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="300,30 294,32.9 294,27.1" style="fill:var(--line-strong)"/>
<line x1="390" y1="30" x2="415.8" y2="30" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="420,30 414,32.9 414,27.1" style="fill:var(--line-strong)"/>
<line x1="560" y1="30" x2="585.8" y2="30" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="590,30 584,32.9 584,27.1" style="fill:var(--line-strong)"/>
<circle r="4" style="fill:var(--fg)"><animateMotion dur="5s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.8;1" path="M12,30 L688,30"/></circle>
<line x1="345" y1="52" x2="345" y2="77.8" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="345,82 342.1,76 347.9,76" style="fill:var(--line-strong)"/>
<rect x="225" y="82" width="210" height="36" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="330" y="96.8" text-anchor="middle" style="fill:var(--green-ink);font-size:11.5px;font-weight:700">linear + squared loss</text>
<text x="330" y="111.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">= PCA</text>
<line x1="640" y1="52" x2="640" y2="77.8" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="640,82 637.1,76 642.9,76" style="fill:var(--line-strong)"/>
<rect x="455" y="82" width="235" height="36" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="572.5" y="96.9" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">stop copying (regularise)</text>
<text x="572.5" y="110.9" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:500">L2 · tied · denoise · sparse · contractive</text>
</svg>
<p class="fig-cap">Squeeze x through a narrow code h and rebuild it. With linear maps and squared loss this is exactly PCA; with room to copy, the network needs a regulariser.</p>
</div>

> [!TIP]
> **Everyday pictures for the whole week.**
> - **An autoencoder is a student summarising a chapter** into a few lines, then rewriting the chapter from the summary. A good summary lets you rebuild the chapter.
> - **Undercomplete** = a short summary (forced to keep only what matters). **Overcomplete** = a summary longer than the chapter (it can just copy).
> - **Denoising** = rebuilding a page from a photocopy with smudges.
> - **Sparse** = a summary that may use only a few keywords at a time.
> - **Contractive** = a summary that barely changes when the chapter has a typo.

---

## 5.1 PCA refresher (the yardstick for autoencoders)

### 5.1.1 Setup

Data matrix $X\in\mathbb R^{m\times n}$ ($m$ examples as rows, $n$ features), **mean-centred** (each column has mean 0). Covariance:
$$C=\frac1m X^\top X\in\mathbb R^{n\times n}.$$
PCA looks for new axes (unit vectors $\mathbf u$) along which the data **varies most**, so that a few axes keep most of the information.

### 5.1.2 [Derivation] Why the axes are eigenvectors of $C$

The projection of example $\mathbf x_i$ on a unit direction $\mathbf u$ is the number $\mathbf u^\top\mathbf x_i$. Its variance over the data is
$$\frac1m\sum_i(\mathbf u^\top\mathbf x_i)^2=\mathbf u^\top\Big(\frac1m\sum_i\mathbf x_i\mathbf x_i^\top\Big)\mathbf u=\mathbf u^\top C\,\mathbf u.$$
Maximise $\mathbf u^\top C\mathbf u$ subject to $\mathbf u^\top\mathbf u=1$. Lagrangian: $\mathbf u^\top C\mathbf u-\lambda(\mathbf u^\top\mathbf u-1)$. Set the gradient to 0:
$$2C\mathbf u-2\lambda\mathbf u=0\ \Longrightarrow\ \boxed{C\mathbf u=\lambda\mathbf u}.$$
So $\mathbf u$ is an **eigenvector**, and the variance along it is $\mathbf u^\top C\mathbf u=\lambda\mathbf u^\top\mathbf u=\lambda$. Pick the eigenvector with the **largest** eigenvalue first, then the next (orthogonal) one, and so on.

| Fact | Why |
|---|---|
| Principal directions = eigenvectors of $C$ | Lagrange condition above |
| Variance along PC $i$ = $\lambda_i$ | $\mathbf u_i^\top C\mathbf u_i=\lambda_i$ |
| Fraction of variance kept by top $k$ | $\sum_{i\le k}\lambda_i\,/\,\sum_i\lambda_i$ |
| Mean squared reconstruction error with top $k$ | $\sum_{i>k}\lambda_i$ (the discarded eigenvalues) |
| PCs are uncorrelated | eigenvectors of a symmetric matrix are orthogonal |
| Via SVD $X=U\Sigma V^\top$ | $C=V\frac{\Sigma^2}{m}V^\top$: PCs = columns of $V$, $\lambda_i=\sigma_i^2/m$ |

### 5.1.3 [Ex] PCA by hand on four points

Points $(2,1),(-2,-1),(1,2),(-1,-2)$; the mean is already $(0,0)$.

| Line | Calculation | Result |
|---|---|---|
| 1 | $\frac14\sum x^2=\frac{4+4+1+1}{4}$ | 2.5 |
| 2 | $\frac14\sum y^2=\frac{1+1+4+4}{4}$ | 2.5 |
| 3 | $\frac14\sum xy=\frac{2+2+2+2}{4}$ | 2 |
| 4 | $C=\begin{bmatrix}2.5&2\\2&2.5\end{bmatrix}$; $\det(C-\lambda I)=(2.5-\lambda)^2-4=0$ | $\lambda=4.5,\ 0.5$ |
| 5 | eigenvectors | $\mathbf u_1=\tfrac1{\sqrt2}(1,1)$, $\mathbf u_2=\tfrac1{\sqrt2}(1,-1)$ |
| 6 | variance kept by PC1 | $4.5/5=90\%$ |
| 7 | 1-D codes $h=\mathbf u_1^\top\mathbf x$ | $2.121,\,-2.121,\,2.121,\,-2.121$ |
| 8 | MSE of 1-D reconstruction | $\lambda_2=0.5$ |

**Check line 8 by hand:** $(2,1)$ has code $h=3/\sqrt2=2.121$, reconstruction $h\,\mathbf u_1=(1.5,1.5)$, error $(0.5,-0.5)$, squared length $0.5$. Every point gives 0.5, so the mean is 0.5 $=\lambda_2$. ✓

<div class="fig" role="img" aria-label="PCA on four points">
<svg viewBox="0 0 700 250" width="700" style="font-family:var(--font)" aria-hidden="true">
<line x1="40" y1="192.9" x2="240" y2="192.9" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="40" y1="116" x2="240" y2="116" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="40" y1="39.1" x2="240" y2="39.1" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="63.1" y1="16" x2="63.1" y2="216" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="140" y1="16" x2="140" y2="216" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="216.9" y1="16" x2="216.9" y2="216" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="40" y1="16" x2="40" y2="216" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="40" y1="216" x2="240" y2="216" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="63.1" y="229" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-2</text>
<text x="140" y="229" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="216.9" y="229" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="34" y="196.4" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">-2</text>
<text x="34" y="119.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="34" y="42.6" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<line x1="43.8" y1="212.2" x2="236.2" y2="19.8" style="stroke:var(--green-ink);stroke-width:2.4;stroke-linecap:round"/>
<line x1="90" y1="66" x2="190" y2="166" style="stroke:var(--yellow-ink);stroke-width:1.6;stroke-linecap:round;stroke-dasharray:5 4"/>
<text x="245" y="20" text-anchor="start" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">u₁  λ = 4.5</text>
<text x="196" y="170" text-anchor="start" style="fill:var(--yellow-ink);font-size:10.5px;font-weight:700">u₂  λ = 0.5</text>
<line x1="216.9" y1="77.5" x2="197.7" y2="58.3" style="stroke:var(--red-ink);stroke-width:1.3;stroke-linecap:round;stroke-dasharray:3 3"/>
<line x1="63.1" y1="154.5" x2="82.3" y2="173.7" style="stroke:var(--red-ink);stroke-width:1.3;stroke-linecap:round;stroke-dasharray:3 3"/>
<line x1="178.5" y1="39.1" x2="197.7" y2="58.3" style="stroke:var(--red-ink);stroke-width:1.3;stroke-linecap:round;stroke-dasharray:3 3"/>
<line x1="101.5" y1="192.9" x2="82.3" y2="173.7" style="stroke:var(--red-ink);stroke-width:1.3;stroke-linecap:round;stroke-dasharray:3 3"/>
<circle cx="197.7" cy="58.3" r="3.6" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<circle cx="82.3" cy="173.7" r="3.6" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<circle cx="197.7" cy="58.3" r="3.6" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<circle cx="82.3" cy="173.7" r="3.6" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<circle cx="216.9" cy="77.5" r="4.6" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<circle cx="63.1" cy="154.5" r="4.6" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<circle cx="178.5" cy="39.1" r="4.6" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<circle cx="101.5" cy="192.9" r="4.6" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<circle r="3" style="fill:var(--fg)"><animateMotion dur="4s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.8;1" path="M216.9,77.5 L197.7,58.3"/></circle>
<circle r="3" style="fill:var(--fg)"><animateMotion dur="4s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.8;1" path="M63.1,154.5 L82.3,173.7"/></circle>
<circle r="3" style="fill:var(--fg)"><animateMotion dur="4s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.8;1" path="M178.5,39.1 L197.7,58.3"/></circle>
<circle r="3" style="fill:var(--fg)"><animateMotion dur="4s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.8;1" path="M101.5,192.9 L82.3,173.7"/></circle>
<text x="540" y="28" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">mean squared error of a 1-D code</text>
<text x="422" y="63" text-anchor="end" style="fill:var(--fg-2);font-size:11px;font-weight:400">u₁ (PC1)</text>
<rect x="430" y="48" width="26" height="22" rx="4" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="462" y="63" text-anchor="start" style="fill:var(--green-ink);font-size:11px;font-weight:700">0.5</text>
<text x="422" y="99" text-anchor="end" style="fill:var(--fg-2);font-size:11px;font-weight:400">x-axis</text>
<rect x="430" y="84" width="130" height="22" rx="4" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.5"/>
<text x="566" y="99" text-anchor="start" style="fill:var(--yellow-ink);font-size:11px;font-weight:700">2.5</text>
<text x="422" y="135" text-anchor="end" style="fill:var(--fg-2);font-size:11px;font-weight:400">y-axis</text>
<rect x="430" y="120" width="130" height="22" rx="4" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.5"/>
<text x="566" y="135" text-anchor="start" style="fill:var(--yellow-ink);font-size:11px;font-weight:700">2.5</text>
<text x="422" y="171" text-anchor="end" style="fill:var(--fg-2);font-size:11px;font-weight:400">u₂ (PC2)</text>
<rect x="430" y="156" width="234" height="22" rx="4" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="670" y="171" text-anchor="start" style="fill:var(--red-ink);font-size:11px;font-weight:700">4.5</text>
<text x="540" y="206" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">MSE = total variance (5) − variance kept along the axis</text>
<circle cx="46" cy="238" r="4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="54" y="242" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">data</text>
<circle cx="100" cy="238" r="3.4" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="108" y="242" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">projection on u₁</text>
<line x1="212" y1="238" x2="236" y2="238" style="stroke:var(--red-ink);stroke-width:1.3;stroke-linecap:round;stroke-dasharray:3 3"/>
<text x="242" y="242" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">error (squared length 0.5)</text>
</svg>
<p class="fig-cap">The four points of the worked example. Projecting onto u₁ keeps 90% of the variance and leaves a mean squared error of λ₂ = 0.5; every other 1-D axis does worse.</p>
</div>

<details>
<summary><b>Try it yourself</b>: eigenvalues 6, 3, 1. How much variance does one component keep, and what is the reconstruction MSE?</summary>

Kept: $6/10=60\%$. MSE: the discarded eigenvalues, $3+1=4$.

</details>

---

## 5.2 The autoencoder: encoder, decoder, loss

### 5.2.1 Definition

A feedforward network trained to reproduce its own input:
$$\mathbf h=g(W\mathbf x+\mathbf b)\quad\text{(encoder)},\qquad \hat{\mathbf x}=f(W^*\mathbf h+\mathbf c)\quad\text{(decoder)}.$$
With $\mathbf x\in\mathbb R^n$ and $\mathbf h\in\mathbb R^k$: $W$ is $k\times n$, $W^*$ is $n\times k$.

| Type | Condition | What happens |
|---|---|---|
| **Undercomplete** | $k<n$ | $\mathbf h$ is a compressed code; to rebuild $\mathbf x$ it must keep the important factors (like PCA) |
| **Overcomplete** | $k\ge n$ | $\mathbf h$ can simply **copy** $\mathbf x$ (e.g. $W=I$); perfect reconstruction, nothing learned. Needs regularisation (§5.4) |

<div class="fig" role="img" aria-label="Autoencoder shape">
<svg viewBox="0 0 700 172" width="700" style="font-family:var(--font)" aria-hidden="true">
<line x1="50" y1="44" x2="140" y2="64" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round"/>
<line x1="140" y1="64" x2="230" y2="44" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round"/>
<line x1="50" y1="44" x2="140" y2="104" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round"/>
<line x1="140" y1="104" x2="230" y2="44" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round"/>
<line x1="50" y1="84" x2="140" y2="64" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round"/>
<line x1="140" y1="64" x2="230" y2="84" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round"/>
<line x1="50" y1="84" x2="140" y2="104" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round"/>
<line x1="140" y1="104" x2="230" y2="84" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round"/>
<line x1="50" y1="124" x2="140" y2="64" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round"/>
<line x1="140" y1="64" x2="230" y2="124" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round"/>
<line x1="50" y1="124" x2="140" y2="104" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round"/>
<line x1="140" y1="104" x2="230" y2="124" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round"/>
<circle cx="50" cy="44" r="11" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<circle cx="230" cy="44" r="11" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<circle cx="50" cy="84" r="11" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<circle cx="230" cy="84" r="11" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<circle cx="50" cy="124" r="11" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<circle cx="230" cy="124" r="11" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<circle cx="140" cy="64" r="11" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:2"/>
<circle cx="140" cy="104" r="11" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:2"/>
<text x="50" y="160" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">x</text>
<text x="140" y="160" text-anchor="middle" style="fill:var(--yellow-ink);font-size:11px;font-weight:700">h (code, k = 2)</text>
<text x="230" y="160" text-anchor="middle" style="fill:var(--green-ink);font-size:12px;font-weight:700">x̂</text>
<text x="140" y="30" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">bottleneck</text>
<circle r="4" style="fill:var(--fg)"><animateMotion dur="4s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.8;1" path="M50,84 L140,64 L230,44"/></circle>
<text x="140" y="14" text-anchor="middle" style="fill:var(--fg);font-size:11px;font-weight:700">3 → 2 → 3</text>
<rect x="348" y="46" width="24" height="64" rx="5" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="360" y="41" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">n</text>
<rect x="398" y="70" width="24" height="16" rx="5" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="410" y="65" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">k</text>
<rect x="448" y="46" width="24" height="64" rx="5" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="460" y="41" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">n</text>
<line x1="374" y1="78" x2="392.5" y2="78" style="stroke:var(--green-ink);stroke-width:1.2;stroke-linecap:round"/>
<polygon points="396,78 391,80.4 391,75.6" style="fill:var(--green-ink)"/>
<line x1="424" y1="78" x2="442.5" y2="78" style="stroke:var(--green-ink);stroke-width:1.2;stroke-linecap:round"/>
<polygon points="446,78 441,80.4 441,75.6" style="fill:var(--green-ink)"/>
<text x="410" y="150" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">undercomplete  k &lt; n</text>
<text x="410" y="164" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">forced to compress</text>
<rect x="538" y="46" width="24" height="64" rx="5" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="550" y="41" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">n</text>
<rect x="588" y="36" width="24" height="84" rx="5" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="600" y="31" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">k</text>
<rect x="638" y="46" width="24" height="64" rx="5" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="650" y="41" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">n</text>
<line x1="564" y1="78" x2="582.5" y2="78" style="stroke:var(--red-ink);stroke-width:1.2;stroke-linecap:round"/>
<polygon points="586,78 581,80.4 581,75.6" style="fill:var(--red-ink)"/>
<line x1="614" y1="78" x2="632.5" y2="78" style="stroke:var(--red-ink);stroke-width:1.2;stroke-linecap:round"/>
<polygon points="636,78 631,80.4 631,75.6" style="fill:var(--red-ink)"/>
<text x="600" y="150" text-anchor="middle" style="fill:var(--red-ink);font-size:11px;font-weight:700">overcomplete  k ≥ n</text>
<text x="600" y="164" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">can copy: needs a regulariser</text>
</svg>
<p class="fig-cap">Left: a 3 → 2 → 3 autoencoder, the code layer is the bottleneck. Right: relative layer sizes. A code at least as wide as the input (k ≥ n) can simply copy x.</p>
</div>

(An undercomplete 3 → 2 → 3 autoencoder: the code layer is the bottleneck.)

### 5.2.2 Choosing the decoder and loss

The decoder's output must live where $\mathbf x$ lives, and the loss must match.

| Input type | Decoder $f$ | Loss (one example) |
|---|---|---|
| **binary** $x_j\in\{0,1\}$ | logistic $\sigma$ (outputs in (0,1)) | cross-entropy $-\sum_j\big[x_j\ln\hat x_j+(1-x_j)\ln(1-\hat x_j)\big]$ |
| **real** $x_j\in\mathbb R$ | **linear** (identity) | squared error $\tfrac12\sum_j(\hat x_j-x_j)^2$ |

The encoder $g$ is usually a sigmoid or tanh; over the dataset we average (or sum) the per-example loss.

**[!]** A sigmoid decoder for real-valued inputs is a classic trap: it can never output values outside (0,1).

### 5.2.3 [Derivation] Both pairings give the same output gradient

Let $\mathbf a=W^*\mathbf h+\mathbf c$ be the decoder pre-activation.

- **Sigmoid + cross-entropy:** $\dfrac{\partial\mathcal L}{\partial\hat x_j}=-\dfrac{x_j}{\hat x_j}+\dfrac{1-x_j}{1-\hat x_j}=\dfrac{\hat x_j-x_j}{\hat x_j(1-\hat x_j)}$, and $\dfrac{\partial\hat x_j}{\partial a_j}=\hat x_j(1-\hat x_j)$. Multiply: $\dfrac{\partial\mathcal L}{\partial a_j}=\hat x_j-x_j$.
- **Linear + squared error:** $\hat x_j=a_j$, so $\dfrac{\partial\mathcal L}{\partial a_j}=\hat x_j-x_j$ directly.

$$\boxed{\frac{\partial\mathcal L}{\partial\mathbf a}=\hat{\mathbf x}-\mathbf x}$$
Then the usual backprop (Week 3):
$$\frac{\partial\mathcal L}{\partial W^*}=(\hat{\mathbf x}-\mathbf x)\,\mathbf h^\top,\qquad \frac{\partial\mathcal L}{\partial\mathbf h}=W^{*\top}(\hat{\mathbf x}-\mathbf x),\qquad \frac{\partial\mathcal L}{\partial W}=\Big[\frac{\partial\mathcal L}{\partial\mathbf h}\odot g'(\cdot)\Big]\mathbf x^\top.$$

<div class="fig" role="img" aria-label="Backpropagation through an autoencoder">
<svg viewBox="0 0 700 132" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="10" y="10" width="50" height="36" rx="8" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<text x="35" y="32" text-anchor="middle" style="fill:var(--fg-2);font-size:11.5px;font-weight:700">x</text>
<rect x="90" y="10" width="100" height="36" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="140" y="24.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">pre-act</text>
<text x="140" y="39.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">Wx + b</text>
<rect x="220" y="10" width="90" height="36" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="265" y="24.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">h</text>
<text x="265" y="39.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">σ(·)</text>
<rect x="340" y="10" width="120" height="36" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="400" y="24.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">a</text>
<text x="400" y="39.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">W*h + c</text>
<rect x="490" y="10" width="100" height="36" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="540" y="24.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">x̂</text>
<text x="540" y="39.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">σ(a)</text>
<rect x="620" y="10" width="70" height="36" rx="8" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="655" y="24.8" text-anchor="middle" style="fill:var(--red-ink);font-size:11.5px;font-weight:700">loss</text>
<text x="655" y="39.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">CE</text>
<line x1="60" y1="28" x2="85.8" y2="28" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="90,28 84,30.9 84,25.1" style="fill:var(--line-strong)"/>
<line x1="190" y1="28" x2="215.8" y2="28" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="220,28 214,30.9 214,25.1" style="fill:var(--line-strong)"/>
<line x1="310" y1="28" x2="335.8" y2="28" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="340,28 334,30.9 334,25.1" style="fill:var(--line-strong)"/>
<line x1="460" y1="28" x2="485.8" y2="28" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="490,28 484,30.9 484,25.1" style="fill:var(--line-strong)"/>
<line x1="590" y1="28" x2="615.8" y2="28" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="620,28 614,30.9 614,25.1" style="fill:var(--line-strong)"/>
<path d="M660,46 V68 H410 V48" fill="none" style="stroke:var(--red-ink);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:4 3"/>
<polygon points="410,46 412.9,52 407.1,52" style="fill:var(--red-ink)"/>
<text x="535" y="63" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">∂L/∂a = x̂ − x</text>
<path d="M385,46 V90 H275 V48" fill="none" style="stroke:var(--red-ink);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:4 3"/>
<polygon points="275,46 277.9,52 272.1,52" style="fill:var(--red-ink)"/>
<text x="330" y="103" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">∂L/∂h = W*ᵀ(x̂ − x)</text>
<path d="M250,46 V112 H140 V48" fill="none" style="stroke:var(--red-ink);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:4 3"/>
<polygon points="140,46 142.9,52 137.1,52" style="fill:var(--red-ink)"/>
<text x="195" y="125" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">⊙ h(1 − h)</text>
<text x="520" y="125" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">forward: solid   ·   gradients: dashed red</text>
</svg>
<p class="fig-cap">Forward pass left to right. With sigmoid + cross-entropy or linear + squared error, the gradient at the decoder pre-activation is the same simple difference x̂ − x.</p>
</div>

### 5.2.4 [Ex] One forward and backward pass by hand

Binary input $\mathbf x=(1,0,1)$, two sigmoid hidden units, no biases,
$W=\begin{bmatrix}0.5&-0.5&0.5\\-0.5&0.5&0.5\end{bmatrix}$, sigmoid decoder with $W^*=W^\top$, cross-entropy loss.

**Forward, line by line:**

| Line | Calculation | Result |
|---|---|---|
| 1 | $W\mathbf x=(0.5-0+0.5,\ -0.5+0+0.5)$ | $(1,\ 0)$ |
| 2 | $\mathbf h=\sigma(1,0)$ | $(0.7311,\ 0.5)$ |
| 3 | $a_1=0.5(0.7311)-0.5(0.5)$ | 0.1155 |
| 4 | $a_2=-0.5(0.7311)+0.5(0.5)$ | −0.1155 |
| 5 | $a_3=0.5(0.7311)+0.5(0.5)$ | 0.6155 |
| 6 | $\hat{\mathbf x}=\sigma(\mathbf a)$ | $(0.5289,\ 0.4711,\ 0.6492)$ |
| 7 | $\mathcal L=-[\ln0.5289+\ln(1-0.4711)+\ln0.6492]$ | $0.637+0.637+0.432=\mathbf{1.706}$ |

**Backward, line by line:**

| Line | Calculation | Result |
|---|---|---|
| 8 | $\hat{\mathbf x}-\mathbf x$ | $(-0.4711,\ 0.4711,\ -0.3508)$ |
| 9 | $\partial\mathcal L/\partial W^*_{11}=(\hat x_1-x_1)h_1=-0.4711\times0.7311$ | −0.3444 |
| 10 | $\partial\mathcal L/\partial\mathbf h=W^{*\top}(\hat{\mathbf x}-\mathbf x)$ | $(-0.6466,\ 0.2957)$ |
| 11 | $\odot\,h(1-h)=(0.1966,\ 0.25)$ | $(-0.1271,\ 0.0739)$ |
| 12 | $\partial\mathcal L/\partial W_{11}=-0.1271\times x_1$ | −0.1271 |

**[Intuition]** Read line 8 as "push each output toward its target": $\hat x_1$ and $\hat x_3$ are too low (negative error, GD raises them), $\hat x_2$ is too high.

<details>
<summary><b>Try it yourself</b>: x = (0, 1), x̂ = (0.2, 0.6). Loss and ∂L/∂a?</summary>

$\mathcal L=-[\ln(1-0.2)+\ln0.6]=0.2231+0.5108=0.734$. $\partial\mathcal L/\partial\mathbf a=\hat{\mathbf x}-\mathbf x=(0.2,\,-0.4)$.

</details>

---

## 5.3 Link between PCA and autoencoders

### 5.3.1 The statement

> An autoencoder is **equivalent to PCA** when (1) the encoder is **linear**, (2) the decoder is **linear**, (3) the loss is **squared error**, and (4) the inputs are **normalised**: $\hat x_{ij}=\dfrac{1}{\sqrt m}\Big(x_{ij}-\dfrac1m\sum_{k}x_{kj}\Big)$.

Normalisation (4) makes $X^\top X$ **equal to the covariance matrix** (centring removes the mean, the $1/\sqrt m$ gives the $1/m$). Without it, the "PCA" you recover is of the wrong matrix.

### 5.3.2 [Derivation] Why the optimum is PCA

With linear layers and no biases, stack all examples as rows: codes $H=XW^\top$ ($m\times k$), reconstructions $\hat X=HW^{*\top}$. The total squared error is
$$\sum_i\lVert\mathbf x_i-\hat{\mathbf x}_i\rVert^2=\lVert X-HW^{*\top}\rVert_F^2.$$
1. $HW^{*\top}$ is a product through a $k$-dimensional layer, so its **rank is at most $k$**.
2. **Eckart–Young:** the best rank-$k$ approximation of $X=U\Sigma V^\top$ in Frobenius norm is $U_k\Sigma_kV_k^\top$ (keep the top $k$ singular values).
3. So we want $HW^{*\top}=U_k\Sigma_kV_k^\top$. One choice that works: $W^*=V_k$ and $H=U_k\Sigma_k$.
4. Can the encoder produce that $H$? From $X=U\Sigma V^\top$, $XV_k=U_k\Sigma_k$. So $H=XV_k$, i.e. $W^\top=V_k$, $W=V_k^\top$.

$$\boxed{W=V_k^\top\ \text{(encoder)},\qquad W^*=V_k\ \text{(decoder)},\qquad \mathbf h=V_k^\top\mathbf x}$$
The columns of $V_k$ are the top-$k$ eigenvectors of $X^\top X$ (= covariance, thanks to the normalisation): **the code is the PCA projection**, and encoder and decoder are transposes of each other.

**[!] Fine print (exam favourites):**
- A trained linear AE spans the **same subspace** as PCA; its weights may be any invertible mix of the top-$k$ eigenvectors (any $W^*=V_kA$, $W=A^{-1}V_k^\top$ gives the same error). The equivalence is about the subspace and the error, not unique weights.
- **Non-linear** encoders/decoders can fit **curved** structure (manifolds) that PCA cannot. This is the main advantage of autoencoders over PCA.

### 5.3.3 [Ex] The four points again, as a linear autoencoder

Use $k=1$, encoder $W=\mathbf u_1^\top=\tfrac1{\sqrt2}(1,1)$, decoder $W^*=\mathbf u_1$.

| $\mathbf x$ | $h=W\mathbf x$ | $\hat{\mathbf x}=W^*h$ | squared error |
|---|---|---|---|
| (2, 1) | 2.121 | (1.5, 1.5) | 0.5 |
| (−2, −1) | −2.121 | (−1.5, −1.5) | 0.5 |
| (1, 2) | 2.121 | (1.5, 1.5) | 0.5 |
| (−1, −2) | −2.121 | (−1.5, −1.5) | 0.5 |

Mean error $0.5=\lambda_2$: the same number PCA gave in §5.1.3. Any other 1-D linear code gives a larger error (try $W=(1,0)$: error is $y^2$, mean $2.5$).

<div class="fig" role="img" aria-label="When an autoencoder equals PCA, and when it beats it">
<svg viewBox="0 0 700 198" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="6" y="14" width="156" height="26" rx="6" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="84" y="30.9" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">linear encoder</text>
<line x1="162" y1="27" x2="201.9" y2="81.2" style="stroke:var(--green-ink);stroke-width:1.3;stroke-linecap:round"/>
<polygon points="204,84 199.1,81.4 203,78.6" style="fill:var(--green-ink)"/>
<rect x="6" y="50" width="156" height="26" rx="6" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="84" y="66.9" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">linear decoder</text>
<line x1="162" y1="63" x2="200.9" y2="82.4" style="stroke:var(--green-ink);stroke-width:1.3;stroke-linecap:round"/>
<polygon points="204,84 198.5,83.9 200.6,79.6" style="fill:var(--green-ink)"/>
<rect x="6" y="86" width="156" height="26" rx="6" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="84" y="102.9" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">squared loss</text>
<line x1="162" y1="99" x2="200.7" y2="85.2" style="stroke:var(--green-ink);stroke-width:1.3;stroke-linecap:round"/>
<polygon points="204,84 200.1,87.9 198.5,83.4" style="fill:var(--green-ink)"/>
<rect x="6" y="122" width="156" height="26" rx="6" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="84" y="138.9" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">centred, 1/√m scaled x</text>
<line x1="162" y1="135" x2="201.8" y2="86.7" style="stroke:var(--green-ink);stroke-width:1.3;stroke-linecap:round"/>
<polygon points="204,84 202.7,89.4 199,86.3" style="fill:var(--green-ink)"/>
<rect x="206" y="56" width="130" height="56" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="271" y="80.7" text-anchor="middle" style="fill:var(--green-ink);font-size:12px;font-weight:700">= PCA</text>
<text x="271" y="95.7" text-anchor="middle" style="fill:var(--fg-2);font-size:10.5px;font-weight:500">W = V_kᵀ,  W* = V_k</text>
<rect x="390" y="14" width="290" height="150" rx="6" style="fill:none;stroke:var(--line);stroke-width:1"/>
<line x1="423.8" y1="46.6" x2="424.2" y2="105.2" style="stroke:var(--red-ink);stroke-width:1.2;stroke-linecap:round"/>
<line x1="442.4" y1="77.7" x2="442.6" y2="105.1" style="stroke:var(--red-ink);stroke-width:1.2;stroke-linecap:round"/>
<line x1="460.9" y1="103.9" x2="460.9" y2="105" style="stroke:var(--red-ink);stroke-width:1.2;stroke-linecap:round"/>
<line x1="479.4" y1="121.6" x2="479.3" y2="104.9" style="stroke:var(--red-ink);stroke-width:1.2;stroke-linecap:round"/>
<line x1="497.9" y1="130.2" x2="497.8" y2="104.8" style="stroke:var(--red-ink);stroke-width:1.2;stroke-linecap:round"/>
<line x1="516.5" y1="133.1" x2="516.3" y2="104.7" style="stroke:var(--red-ink);stroke-width:1.2;stroke-linecap:round"/>
<line x1="535" y1="134.1" x2="534.8" y2="104.6" style="stroke:var(--red-ink);stroke-width:1.2;stroke-linecap:round"/>
<line x1="553.5" y1="134.6" x2="553.3" y2="104.5" style="stroke:var(--red-ink);stroke-width:1.2;stroke-linecap:round"/>
<line x1="572.1" y1="132" x2="571.9" y2="104.4" style="stroke:var(--red-ink);stroke-width:1.2;stroke-linecap:round"/>
<line x1="590.6" y1="122" x2="590.5" y2="104.3" style="stroke:var(--red-ink);stroke-width:1.2;stroke-linecap:round"/>
<line x1="609.1" y1="102.6" x2="609.1" y2="104.2" style="stroke:var(--red-ink);stroke-width:1.2;stroke-linecap:round"/>
<line x1="627.6" y1="75.9" x2="627.8" y2="104.1" style="stroke:var(--red-ink);stroke-width:1.2;stroke-linecap:round"/>
<line x1="646.2" y1="45.9" x2="646.6" y2="104.1" style="stroke:var(--red-ink);stroke-width:1.2;stroke-linecap:round"/>
<polyline points="404.2,16.9 406.5,21.2 408.9,25.5 411.2,29.6 413.5,33.7 415.9,37.7 418.2,41.7 420.5,45.5 422.9,49.3 425.2,53 427.5,56.6 429.9,60.2 432.2,63.6 434.5,67 436.9,70.3 439.2,73.5 441.6,76.7 443.9,79.8 446.2,82.8 448.6,85.7 450.9,88.5 453.2,91.3 455.6,94 457.9,96.6 460.2,99.1 462.6,101.6 464.9,104 467.3,106.3 469.6,108.5 471.9,110.6 474.3,112.7 476.6,114.7 478.9,116.6 481.3,118.4 483.6,120.2 485.9,121.8 488.3,123.4 490.6,124.9 493,126.4 495.3,127.7 497.6,129 500,130.2 502.3,131.4 504.6,132.4 507,133.4 509.3,134.3 511.6,135.1 514,135.8 516.3,136.5 518.6,137.1 521,137.6 523.3,138 525.7,138.4 528,138.6 530.3,138.8 532.7,139 535,139 537.3,139 539.7,138.8 542,138.6 544.3,138.4 546.7,138 549,137.6 551.4,137.1 553.7,136.5 556,135.8 558.4,135.1 560.7,134.3 563,133.4 565.4,132.4 567.7,131.4 570,130.2 572.4,129 574.7,127.7 577.1,126.4 579.4,124.9 581.7,123.4 584.1,121.8 586.4,120.2 588.7,118.4 591.1,116.6 593.4,114.7 595.7,112.7 598.1,110.6 600.4,108.5 602.7,106.3 605.1,104 607.4,101.6 609.8,99.1 612.1,96.6 614.4,94 616.8,91.3 619.1,88.5 621.4,85.7 623.8,82.8 626.1,79.8 628.4,76.7 630.8,73.5 633.1,70.3 635.5,67 637.8,63.6 640.1,60.2 642.5,56.6 644.8,53 647.1,49.3 649.5,45.5 651.8,41.7 654.1,37.7 656.5,33.7 658.8,29.6 661.2,25.5 663.5,21.2 665.8,16.9" fill="none" style="stroke:var(--green-ink);stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round"/>
<line x1="394.8" y1="105.3" x2="675.2" y2="103.9" style="stroke:var(--red-ink);stroke-width:2;stroke-linecap:round;stroke-dasharray:6 4"/>
<circle cx="423.8" cy="46.6" r="3.4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<circle cx="442.4" cy="77.7" r="3.4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<circle cx="460.9" cy="103.9" r="3.4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<circle cx="479.4" cy="121.6" r="3.4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<circle cx="497.9" cy="130.2" r="3.4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<circle cx="516.5" cy="133.1" r="3.4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<circle cx="535" cy="134.1" r="3.4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<circle cx="553.5" cy="134.6" r="3.4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<circle cx="572.1" cy="132" r="3.4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<circle cx="590.6" cy="122" r="3.4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<circle cx="609.1" cy="102.6" r="3.4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<circle cx="627.6" cy="75.9" r="3.4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<circle cx="646.2" cy="45.9" r="3.4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="535" y="26" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">non-linear AE follows the curve</text>
<text x="535" y="158" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">linear AE = PCA line: errors in red</text>
<text x="535" y="190" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">curved data (illustrative)</text>
</svg>
<p class="fig-cap">Four conditions make a linear autoencoder span the PCA subspace. Add non-linearity and it can follow curved data: on this sample the best line leaves mean squared error 0.143, the curve 0.002.</p>
</div>

---

## 5.4 Regularisation in autoencoders

### 5.4.1 Why regularise?

- **Overcomplete AE:** with $k\ge n$, the network can learn $\mathbf h\approx\mathbf x$, $\hat{\mathbf x}\approx\mathbf h$ (copy). Zero training error, useless code.
- **Undercomplete but high-capacity AE:** many parameters can still memorise the training set: low training error, poor reconstruction on new data (overfitting).

The fix in every case: add a penalty $\Omega(\theta)$ to the reconstruction loss,
$$\min_\theta\ \mathcal L(\theta)+\Omega(\theta),$$
where $\Omega$ makes "just copy" or "just memorise" expensive.

### 5.4.2 L2 (weight decay)

$$\Omega(\theta)=\frac\lambda2\lVert\theta\rVert^2\quad\Longrightarrow\quad\nabla_W\big(\mathcal L+\Omega\big)=\nabla_W\mathcal L+\lambda W.$$
Small weights keep the hidden units in their linear-ish region and stop the exact identity map from being cheap. (Full analysis of L2 is in Week 6.)

### 5.4.3 Tied weights

Force $W^*=W^\top$. Half the parameters, and the decoder must "undo" the encoder with the same matrix, which limits copying.

**Gradient with tied weights.** $W$ now appears twice, so its gradient is the **sum** of both uses:
$$\nabla_W\mathcal L=\underbrace{\Big[\frac{\partial\mathcal L}{\partial\mathbf h}\odot g'\Big]\mathbf x^\top}_{\text{encoder use}}+\underbrace{\big[(\hat{\mathbf x}-\mathbf x)\,\mathbf h^\top\big]^\top}_{\text{decoder use, transposed}}.$$

**[Ex] Parameter count.** $n=784$ (MNIST pixels), $k=100$:

| | weights | biases | total |
|---|---|---|---|
| untied | $784\cdot100+100\cdot784=156{,}800$ | $100+784=884$ | **157,684** |
| tied | $78{,}400$ | 884 | **79,284** |

---

## 5.5 Denoising autoencoders

### 5.5.1 Idea

Corrupt the input, then ask the network to rebuild the **clean** input:
$$\tilde{\mathbf x}\sim q(\tilde{\mathbf x}\mid\mathbf x),\qquad \mathbf h=g(W\tilde{\mathbf x}+\mathbf b),\qquad \hat{\mathbf x}=f(W^*\mathbf h+\mathbf c),\qquad \text{loss compares }\hat{\mathbf x}\text{ with }\mathbf x.$$

Common corruption (masking noise):
$$P(\tilde x_{ij}=0\mid x_{ij})=q,\qquad P(\tilde x_{ij}=x_{ij}\mid x_{ij})=1-q.$$
For real inputs, Gaussian noise $\tilde{\mathbf x}=\mathbf x+\boldsymbol\epsilon$, $\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\sigma^2I)$, is also used.

**[Intuition]** Copying is now useless: copying $\tilde{\mathbf x}$ reproduces the noise and is penalised against the clean $\mathbf x$. To fill in a missing pixel the network must know **how features relate** (e.g. "if the pixels around are part of a stroke, this one probably is too"). That knowledge is exactly a good representation.

<div class="fig" role="img" aria-label="Denoising autoencoder">
<svg viewBox="0 0 700 116" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="10" y="20" width="26" height="26" rx="4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.4"/>
<text x="23" y="38" text-anchor="middle" style="fill:var(--blue-ink);font-size:12px;font-weight:700">1</text>
<rect x="40" y="20" width="26" height="26" rx="4" style="fill:var(--surface);stroke:var(--blue-ink);stroke-width:1.4"/>
<text x="53" y="38" text-anchor="middle" style="fill:var(--blue-ink);font-size:12px;font-weight:700">0</text>
<rect x="70" y="20" width="26" height="26" rx="4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.4"/>
<text x="83" y="38" text-anchor="middle" style="fill:var(--blue-ink);font-size:12px;font-weight:700">1</text>
<rect x="100" y="20" width="26" height="26" rx="4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.4"/>
<text x="113" y="38" text-anchor="middle" style="fill:var(--blue-ink);font-size:12px;font-weight:700">1</text>
<text x="68" y="64" text-anchor="middle" style="fill:var(--fg);font-size:11px;font-weight:700">clean x</text>
<line x1="134" y1="33" x2="179.8" y2="33" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="184,33 178,35.9 178,30.1" style="fill:var(--line-strong)"/>
<text x="159" y="22" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">corrupt</text>
<text x="159" y="46" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">q = 0.25</text>
<rect x="190" y="20" width="26" height="26" rx="4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.4"/>
<text x="203" y="38" text-anchor="middle" style="fill:var(--blue-ink);font-size:12px;font-weight:700">1</text>
<rect x="220" y="20" width="26" height="26" rx="4" style="fill:var(--surface);stroke:var(--blue-ink);stroke-width:1.4"/>
<text x="233" y="38" text-anchor="middle" style="fill:var(--blue-ink);font-size:12px;font-weight:700">0</text>
<rect x="250" y="20" width="26" height="26" rx="4" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.6"/>
<line x1="255" y1="25" x2="271" y2="41" style="stroke:var(--red-ink);stroke-width:2;stroke-linecap:round"/>
<line x1="271" y1="25" x2="255" y2="41" style="stroke:var(--red-ink);stroke-width:2;stroke-linecap:round"/>
<rect x="280" y="20" width="26" height="26" rx="4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.4"/>
<text x="293" y="38" text-anchor="middle" style="fill:var(--blue-ink);font-size:12px;font-weight:700">1</text>
<text x="248" y="64" text-anchor="middle" style="fill:var(--fg);font-size:11px;font-weight:700">noisy x̃</text>
<line x1="314" y1="33" x2="339.8" y2="33" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="344,33 338,35.9 338,30.1" style="fill:var(--line-strong)"/>
<rect x="344" y="14" width="120" height="38" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="404" y="36.9" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">encoder → decoder</text>
<line x1="464" y1="33" x2="489.8" y2="33" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="494,33 488,35.9 488,30.1" style="fill:var(--line-strong)"/>
<rect x="500" y="20" width="26" height="26" rx="4" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.4"/>
<text x="513" y="37" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">0.9</text>
<rect x="530" y="20" width="26" height="26" rx="4" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.4"/>
<text x="543" y="37" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">0.1</text>
<rect x="560" y="20" width="26" height="26" rx="4" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.4"/>
<text x="573" y="37" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">0.8</text>
<rect x="590" y="20" width="26" height="26" rx="4" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.4"/>
<text x="603" y="37" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">0.9</text>
<text x="558" y="64" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">x̂ (illustrative)</text>
<line x1="624" y1="33" x2="635.8" y2="33" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="640,33 634,35.9 634,30.1" style="fill:var(--line-strong)"/>
<rect x="640" y="14" width="54" height="38" rx="8" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="667" y="36.9" text-anchor="middle" style="fill:var(--red-ink);font-size:11px;font-weight:700">loss</text>
<path d="M70,76 V108 H667 V56" fill="none" style="stroke:var(--red-ink);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:4 3"/>
<polygon points="667,54 669.9,60 664.1,60" style="fill:var(--red-ink)"/>
<text x="368" y="103" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">target = the CLEAN x, never the noisy x̃</text>
</svg>
<p class="fig-cap">Masking noise on the worked example: the third entry is zeroed, yet the loss still compares the output with the clean (1, 0, 1, 1). To fill the gap the network must learn how features relate.</p>
</div>

### 5.5.2 [Ex] Masking noise, line by line

$\mathbf x=(1,0,1,1)$, $q=0.25$.

| Line | Question | Answer |
|---|---|---|
| 1 | expected number of entries masked | $4\times0.25=1$ |
| 2 | expected value $\mathbb E[\tilde x_j]$ | $(1-q)x_j$: $(0.75,0,0.75,0.75)$ |
| 3 | one possible sample | $\tilde{\mathbf x}=(1,0,0,1)$ (third entry masked) |
| 4 | what the loss compares | $\hat{\mathbf x}$ with $\mathbf x=(1,0,1,1)$, **not** with $\tilde{\mathbf x}$ |
| 5 | can masking change $x_2$? | no: it is already 0 (masking only removes information that was there) |

**What the course shows (filters).** On MNIST, a plain AE's first-layer weights look like noise; a DAE's weights look like **stroke and edge detectors**, and higher noise (25% → 50%) gives broader, more robust strokes. With Gaussian noise the learned filters resemble edge detectors.

**[!]** The noise is applied only during **training**. At test time the clean input goes in.

---

## 5.6 Sparse autoencoders

### 5.6.1 Idea

Let the hidden layer be large (even overcomplete), but allow each input to switch on only **a few** hidden units. A sigmoid unit is "active" when its output is near 1, "inactive" near 0.

Average activation of hidden unit $l$ over the $m$ training examples:
$$\hat\rho_l=\frac1m\sum_{i=1}^m h(\mathbf x_i)_l.$$
Pick a small target $\rho$ (e.g. 0.005–0.05) and penalise any $\hat\rho_l$ that drifts away from it:
$$\Omega(\theta)=\sum_{l=1}^k\Big[\rho\ln\frac{\rho}{\hat\rho_l}+(1-\rho)\ln\frac{1-\rho}{1-\hat\rho_l}\Big],\qquad \hat{\mathcal L}=\mathcal L+\Omega.$$
Each term is the **KL divergence** between two Bernoulli distributions, Bernoulli$(\rho)$ and Bernoulli$(\hat\rho_l)$: zero when $\hat\rho_l=\rho$, positive otherwise.

### 5.6.2 [Derivation] The gradient of the penalty

For one term (unit $l$):
$$\frac{\partial\Omega}{\partial\hat\rho_l}=\rho\cdot\Big(-\frac1{\hat\rho_l}\Big)+(1-\rho)\cdot\frac{1}{1-\hat\rho_l}=-\frac{\rho}{\hat\rho_l}+\frac{1-\rho}{1-\hat\rho_l}.$$
Then chain into the weights: $\dfrac{\partial\Omega}{\partial W}=\dfrac{\partial\Omega}{\partial\hat{\boldsymbol\rho}}\cdot\dfrac{\partial\hat{\boldsymbol\rho}}{\partial W}$, and for a sigmoid encoder $\dfrac{\partial\hat\rho_l}{\partial W_{lj}}=\dfrac1m\sum_i h_l(1-h_l)\,x_{ij}$.

Read the sign: **positive** derivative means $\hat\rho_l$ is above target, so gradient descent pushes it **down**; negative means push it up.

### 5.6.3 [Ex] One hidden unit, line by line

Target $\rho=0.05$. Unit $l$ outputs $0.1,0.3,0.2,0.2$ on four examples.

| Line | Calculation | Result |
|---|---|---|
| 1 | $\hat\rho_l=(0.1+0.3+0.2+0.2)/4$ | 0.2 |
| 2 | $\rho\ln(\rho/\hat\rho)=0.05\ln0.25$ | −0.0693 |
| 3 | $(1-\rho)\ln\frac{1-\rho}{1-\hat\rho}=0.95\ln(0.95/0.8)$ | 0.1633 |
| 4 | $\Omega_l$ = line 2 + line 3 | **0.0939** |
| 5 | $\partial\Omega/\partial\hat\rho=-0.05/0.2+0.95/0.8=-0.25+1.1875$ | **+0.9375** (too active: push down) |

If instead $\hat\rho_l=0.02$: $\Omega_l=0.0163$ and $\partial\Omega/\partial\hat\rho=-2.5+0.969=-1.53$ (too quiet: push up). At $\hat\rho_l=\rho$ both are 0.

<div class="fig" role="img" aria-label="Sparse autoencoder penalty">
<svg viewBox="0 0 700 196" width="700" style="font-family:var(--font)" aria-hidden="true">
<line x1="46" y1="166" x2="316" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="122.7" x2="316" y2="122.7" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="79.3" x2="316" y2="79.3" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="36" x2="316" y2="36" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="36" x2="46" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="91" y1="36" x2="91" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="136" y1="36" x2="136" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="181" y1="36" x2="181" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="226" y1="36" x2="226" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="271" y1="36" x2="271" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="316" y1="36" x2="316" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="36" x2="46" y2="166" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="46" y1="166" x2="316" y2="166" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="46" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.0</text>
<text x="91" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.1</text>
<text x="136" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.2</text>
<text x="181" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.3</text>
<text x="226" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.4</text>
<text x="271" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.5</text>
<text x="316" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.6</text>
<text x="40" y="169.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.0</text>
<text x="40" y="126.2" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.2</text>
<text x="40" y="82.8" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.4</text>
<text x="40" y="39.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.6</text>
<text x="181" y="192" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">average activation ρ̂</text>
<line x1="396" y1="153" x2="670" y2="153" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="396" y1="101" x2="670" y2="101" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="396" y1="49" x2="670" y2="49" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="396" y1="36" x2="396" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="441.7" y1="36" x2="441.7" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="487.3" y1="36" x2="487.3" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="533" y1="36" x2="533" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="578.7" y1="36" x2="578.7" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="624.3" y1="36" x2="624.3" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="670" y1="36" x2="670" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="396" y1="36" x2="396" y2="166" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="396" y1="166" x2="670" y2="166" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="396" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.0</text>
<text x="441.7" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.1</text>
<text x="487.3" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.2</text>
<text x="533" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.3</text>
<text x="578.7" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.4</text>
<text x="624.3" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.5</text>
<text x="670" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.6</text>
<text x="390" y="156.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">-2</text>
<text x="390" y="104.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="390" y="52.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="533" y="192" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">average activation ρ̂</text>
<text x="181" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">penalty Ω(ρ̂), target ρ = 0.05</text>
<text x="533" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">slope ∂Ω/∂ρ̂</text>
<polyline points="47.8,148.4 49.5,154.7 51.2,158.2 52.8,160.5 54.5,162.1 56.2,163.3 57.9,164.1 59.5,164.8 61.2,165.2 62.9,165.6 64.6,165.8 66.2,165.9 67.9,166 69.6,166 71.3,165.9 72.9,165.8 74.6,165.6 76.3,165.4 78,165.2 79.6,164.9 81.3,164.6 83,164.3 84.7,163.9 86.4,163.5 88,163.1 89.7,162.7 91.4,162.3 93.1,161.8 94.7,161.3 96.4,160.8 98.1,160.3 99.8,159.8 101.4,159.3 103.1,158.7 104.8,158.1 106.5,157.6 108.1,157 109.8,156.4 111.5,155.8 113.2,155.1 114.9,154.5 116.5,153.8 118.2,153.2 119.9,152.5 121.6,151.8 123.2,151.2 124.9,150.5 126.6,149.8 128.3,149.1 129.9,148.3 131.6,147.6 133.3,146.9 135,146.1 136.6,145.4 138.3,144.6 140,143.8 141.7,143 143.3,142.3 145,141.5 146.7,140.7 148.4,139.8 150.1,139 151.7,138.2 153.4,137.4 155.1,136.5 156.8,135.7 158.4,134.8 160.1,133.9 161.8,133.1 163.5,132.2 165.1,131.3 166.8,130.4 168.5,129.5 170.2,128.6 171.8,127.7 173.5,126.8 175.2,125.8 176.9,124.9 178.5,124 180.2,123 181.9,122 183.6,121.1 185.3,120.1 186.9,119.1 188.6,118.1 190.3,117.1 192,116.1 193.6,115.1 195.3,114.1 197,113 198.7,112 200.3,111 202,109.9 203.7,108.8 205.4,107.8 207,106.7 208.7,105.6 210.4,104.5 212.1,103.4 213.7,102.3 215.4,101.2 217.1,100.1 218.8,98.9 220.5,97.8 222.1,96.6 223.8,95.5 225.5,94.3 227.2,93.1 228.8,91.9 230.5,90.7 232.2,89.5 233.9,88.3 235.5,87.1 237.2,85.9 238.9,84.6 240.6,83.4 242.2,82.1 243.9,80.8 245.6,79.5 247.3,78.3 249,77 250.6,75.6 252.3,74.3 254,73 255.7,71.6 257.3,70.3 259,68.9 260.7,67.5 262.4,66.2 264,64.8 265.7,63.4 267.4,61.9 269.1,60.5 270.7,59.1 272.4,57.6 274.1,56.1 275.8,54.6 277.4,53.2 279.1,51.6 280.8,50.1 282.5,48.6 284.2,47 285.8,45.5 287.5,43.9 289.2,42.3 290.9,40.7 292.5,39.1 294.2,37.5 295.9,35.8" fill="none" style="stroke:var(--blue-ink);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round"/>
<polyline points="405.1,140.8 406.8,130.7 408.4,123.3 410.1,117.6 411.8,113.1 413.4,109.4 415.1,106.4 416.7,103.8 418.4,101.6 420,99.6 421.7,97.9 423.3,96.4 425,95.1 426.7,93.9 428.3,92.8 430,91.8 431.6,90.9 433.3,90 434.9,89.2 436.6,88.5 438.2,87.8 439.9,87.2 441.6,86.6 443.2,86 444.9,85.5 446.5,85 448.2,84.5 449.8,84 451.5,83.6 453.1,83.2 454.8,82.7 456.5,82.4 458.1,82 459.8,81.6 461.4,81.2 463.1,80.9 464.7,80.6 466.4,80.2 468,79.9 469.7,79.6 471.4,79.3 473,79 474.7,78.7 476.3,78.4 478,78.1 479.6,77.9 481.3,77.6 482.9,77.3 484.6,77.1 486.2,76.8 487.9,76.5 489.6,76.3 491.2,76 492.9,75.8 494.5,75.5 496.2,75.3 497.8,75 499.5,74.8 501.1,74.6 502.8,74.3 504.5,74.1 506.1,73.8 507.8,73.6 509.4,73.4 511.1,73.1 512.7,72.9 514.4,72.7 516,72.4 517.7,72.2 519.4,72 521,71.7 522.7,71.5 524.3,71.3 526,71 527.6,70.8 529.3,70.6 530.9,70.3 532.6,70.1 534.3,69.9 535.9,69.6 537.6,69.4 539.2,69.2 540.9,68.9 542.5,68.7 544.2,68.4 545.8,68.2 547.5,68 549.2,67.7 550.8,67.5 552.5,67.2 554.1,67 555.8,66.7 557.4,66.5 559.1,66.2 560.7,66 562.4,65.7 564.1,65.5 565.7,65.2 567.4,64.9 569,64.7 570.7,64.4 572.3,64.1 574,63.9 575.6,63.6 577.3,63.3 579,63 580.6,62.8 582.3,62.5 583.9,62.2 585.6,61.9 587.2,61.6 588.9,61.3 590.5,61 592.2,60.7 593.9,60.4 595.5,60.1 597.2,59.8 598.8,59.5 600.5,59.2 602.1,58.9 603.8,58.5 605.4,58.2 607.1,57.9 608.7,57.5 610.4,57.2 612.1,56.9 613.7,56.5 615.4,56.2 617,55.8 618.7,55.5 620.3,55.1 622,54.7 623.6,54.4 625.3,54 627,53.6 628.6,53.2 630.3,52.8 631.9,52.4 633.6,52 635.2,51.6 636.9,51.2 638.5,50.8 640.2,50.3 641.9,49.9 643.5,49.5 645.2,49 646.8,48.6 648.5,48.1 650.1,47.6 651.8,47.2 653.4,46.7 655.1,46.2 656.8,45.7 658.4,45.2 660.1,44.7 661.7,44.2 663.4,43.6 665,43.1 666.7,42.5 668.3,42 670,41.4" fill="none" style="stroke:var(--red-ink);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round"/>
<line x1="68.5" y1="36" x2="68.5" y2="166" style="stroke:var(--green-ink);stroke-width:1.2;stroke-linecap:round;stroke-dasharray:4 3"/>
<line x1="418.8" y1="36" x2="418.8" y2="166" style="stroke:var(--green-ink);stroke-width:1.2;stroke-linecap:round;stroke-dasharray:4 3"/>
<line x1="396" y1="101" x2="670" y2="101" style="stroke:var(--fg-2);stroke-width:1.2;stroke-linecap:round"/>
<text x="430.3" y="45.1" text-anchor="start" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">ρ̂ &gt; ρ: too active, push down</text>
<text x="660.9" y="140" text-anchor="end" style="fill:var(--blue-ink);font-size:10.5px;font-weight:700">ρ̂ &lt; ρ: too quiet, push up</text>
<text x="73.5" y="46" text-anchor="start" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">Ω = 0 at ρ̂ = ρ</text>
<circle cx="55" cy="162.5" r="4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<circle cx="68.5" cy="166" r="4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<circle cx="136" cy="145.6" r="4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<circle cx="271" cy="58.8" r="4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<text x="142" y="138.6" text-anchor="start" style="fill:var(--blue-ink);font-size:10px;font-weight:700">0.094</text>
<text x="264" y="62.8" text-anchor="end" style="fill:var(--blue-ink);font-size:10px;font-weight:700">0.495</text>
<circle cx="405.1" cy="140.8" r="4" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.8"/>
<circle cx="487.3" cy="76.6" r="4" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.8"/>
<circle cx="624.3" cy="54.2" r="4" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.8"/>
<text x="411.1" y="152.8" text-anchor="start" style="fill:var(--red-ink);font-size:10px;font-weight:700">−1.53</text>
<text x="491.3" y="90.6" text-anchor="start" style="fill:var(--red-ink);font-size:10px;font-weight:700">+0.94</text>
<text x="617.3" y="46.2" text-anchor="end" style="fill:var(--red-ink);font-size:10px;font-weight:700">+1.80</text>
<circle r="4.5" style="fill:var(--fg)"><animateMotion dur="5s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.8;1" path="M270.7,59.1 L269.1,60.5 L267.4,61.9 L265.7,63.4 L264,64.8 L262.4,66.2 L260.7,67.5 L259,68.9 L257.3,70.3 L255.7,71.6 L254,73 L252.3,74.3 L250.6,75.6 L249,77 L247.3,78.3 L245.6,79.5 L243.9,80.8 L242.2,82.1 L240.6,83.4 L238.9,84.6 L237.2,85.9 L235.5,87.1 L233.9,88.3 L232.2,89.5 L230.5,90.7 L228.8,91.9 L227.2,93.1 L225.5,94.3 L223.8,95.5 L222.1,96.6 L220.5,97.8 L218.8,98.9 L217.1,100.1 L215.4,101.2 L213.7,102.3 L212.1,103.4 L210.4,104.5 L208.7,105.6 L207,106.7 L205.4,107.8 L203.7,108.8 L202,109.9 L200.3,111 L198.7,112 L197,113 L195.3,114.1 L193.6,115.1 L192,116.1 L190.3,117.1 L188.6,118.1 L186.9,119.1 L185.3,120.1 L183.6,121.1 L181.9,122 L180.2,123 L178.5,124 L176.9,124.9 L175.2,125.8 L173.5,126.8 L171.8,127.7 L170.2,128.6 L168.5,129.5 L166.8,130.4 L165.1,131.3 L163.5,132.2 L161.8,133.1 L160.1,133.9 L158.4,134.8 L156.8,135.7 L155.1,136.5 L153.4,137.4 L151.7,138.2 L150.1,139 L148.4,139.8 L146.7,140.7 L145,141.5 L143.3,142.3 L141.7,143 L140,143.8 L138.3,144.6 L136.6,145.4 L135,146.1 L133.3,146.9 L131.6,147.6 L129.9,148.3 L128.3,149.1 L126.6,149.8 L124.9,150.5 L123.2,151.2 L121.6,151.8 L119.9,152.5 L118.2,153.2 L116.5,153.8 L114.9,154.5 L113.2,155.1 L111.5,155.8 L109.8,156.4 L108.1,157 L106.5,157.6 L104.8,158.1 L103.1,158.7 L101.4,159.3 L99.8,159.8 L98.1,160.3 L96.4,160.8 L94.7,161.3 L93.1,161.8 L91.4,162.3 L89.7,162.7 L88,163.1 L86.4,163.5 L84.7,163.9 L83,164.3 L81.3,164.6 L79.6,164.9 L78,165.2 L76.3,165.4 L74.6,165.6 L72.9,165.8 L71.3,165.9 L69.6,166"/></circle>
</svg>
<p class="fig-cap">KL penalty for one hidden unit with target ρ = 0.05. The penalty is zero at ρ̂ = ρ and grows on both sides; the sign of its slope tells gradient descent which way to push. Dots mark the worked-example values.</p>
</div>

<details>
<summary><b>Try it yourself</b>: ρ = 0.1 and ρ̂ = 0.5. Penalty and derivative?</summary>

$\Omega=0.1\ln0.2+0.9\ln1.8=-0.1609+0.5290=0.368$. Derivative $=-0.1/0.5+0.9/0.5=-0.2+1.8=1.6$ (push $\hat\rho$ down).

</details>

---

## 5.7 Contractive autoencoders

### 5.7.1 Idea

Make the code **insensitive** to small changes in the input. Measure sensitivity by the Jacobian of $\mathbf h$ with respect to $\mathbf x$ and penalise its size:
$$J_{\mathbf x}(\mathbf h)\in\mathbb R^{k\times n},\quad \big[J\big]_{lj}=\frac{\partial h_l}{\partial x_j},\qquad \Omega(\theta)=\lVert J_{\mathbf x}(\mathbf h)\rVert_F^2=\sum_{l=1}^k\sum_{j=1}^n\Big(\frac{\partial h_l}{\partial x_j}\Big)^2.$$

### 5.7.2 [Derivation] The Jacobian of a sigmoid encoder

$h_l=\sigma\big(\sum_jW_{lj}x_j+b_l\big)$, so by the chain rule
$$\frac{\partial h_l}{\partial x_j}=h_l(1-h_l)\,W_{lj}\quad\Longrightarrow\quad \Omega=\sum_l\big[h_l(1-h_l)\big]^2\sum_jW_{lj}^2.$$
Two ways to make it small: **small weights**, or **saturated** hidden units ($h_l\approx0$ or 1, so $h_l(1-h_l)\approx0$).

### 5.7.3 [Ex] Penalty at the centre vs in saturation

$W=\begin{bmatrix}1&2\\-1&1\end{bmatrix}$, $\mathbf b=\mathbf 0$.

| Case | $\mathbf h$ | $h(1-h)$ | $\Omega$ |
|---|---|---|---|
| $\mathbf x=(0,0)$: pre-activations (0, 0) | (0.5, 0.5) | (0.25, 0.25) | $0.0625\,(1+4+1+1)=\mathbf{0.4375}$ |
| pre-activations (4, −4) | (0.982, 0.018) | (0.0177, 0.0177) | $0.000312(5)+0.000312(2)=\mathbf{0.0022}$ |

**[Intuition] The tug of war.** The reconstruction loss $\mathcal L$ wants $\mathbf h$ to **change** whenever $\mathbf x$ changes (otherwise two different inputs get the same code and cannot both be rebuilt). $\Omega$ wants $\mathbf h$ to change **as little as possible**. The compromise: $\mathbf h$ stays sensitive only along directions the data actually varies in (the data manifold) and ignores everything else. That is the same goal as the denoising AE, reached analytically instead of by sampling noise.

<div class="fig" role="img" aria-label="Contractive penalty">
<svg viewBox="0 0 700 190" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="46" y="34" width="67.5" height="120" rx="0" style="fill:var(--red);stroke:none;stroke-width:1.2;opacity:0.35"/>
<rect x="248.5" y="34" width="67.5" height="120" rx="0" style="fill:var(--red);stroke:none;stroke-width:1.2;opacity:0.35"/>
<line x1="46" y1="154" x2="316" y2="154" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="114" x2="316" y2="114" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="74" x2="316" y2="74" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="34" x2="316" y2="34" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="34" x2="46" y2="154" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="91" y1="34" x2="91" y2="154" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="136" y1="34" x2="136" y2="154" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="181" y1="34" x2="181" y2="154" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="226" y1="34" x2="226" y2="154" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="271" y1="34" x2="271" y2="154" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="316" y1="34" x2="316" y2="154" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="34" x2="46" y2="154" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="46" y1="154" x2="316" y2="154" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="46" y="167" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-6</text>
<text x="91" y="167" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-4</text>
<text x="136" y="167" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-2</text>
<text x="181" y="167" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="226" y="167" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="271" y="167" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="316" y="167" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">6</text>
<text x="40" y="157.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.0</text>
<text x="40" y="117.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.1</text>
<text x="40" y="77.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.2</text>
<text x="40" y="37.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.3</text>
<text x="181" y="180" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">pre-activation z</text>
<text x="181" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">Jacobian factor h(1 − h) of a sigmoid unit</text>
<polyline points="46,153 47.7,152.9 49.4,152.9 51.1,152.8 52.7,152.7 54.4,152.6 56.1,152.5 57.8,152.3 59.5,152.2 61.2,152.1 62.9,151.9 64.6,151.8 66.3,151.6 67.9,151.4 69.6,151.2 71.3,151 73,150.8 74.7,150.5 76.4,150.2 78.1,150 79.8,149.7 81.4,149.3 83.1,149 84.8,148.6 86.5,148.2 88.2,147.7 89.9,147.3 91.6,146.8 93.3,146.2 94.9,145.6 96.6,145 98.3,144.4 100,143.6 101.7,142.9 103.4,142.1 105.1,141.2 106.8,140.3 108.4,139.3 110.1,138.2 111.8,137.1 113.5,135.9 115.2,134.7 116.9,133.3 118.6,131.9 120.2,130.4 121.9,128.8 123.6,127.1 125.3,125.4 127,123.5 128.7,121.5 130.4,119.5 132.1,117.4 133.8,115.1 135.4,112.8 137.1,110.4 138.8,107.9 140.5,105.3 142.2,102.7 143.9,99.9 145.6,97.2 147.3,94.3 148.9,91.5 150.6,88.6 152.3,85.7 154,82.8 155.7,80 157.4,77.2 159.1,74.5 160.8,71.8 162.4,69.3 164.1,66.8 165.8,64.6 167.5,62.5 169.2,60.6 170.9,58.9 172.6,57.4 174.3,56.2 175.9,55.3 177.6,54.6 179.3,54.1 181,54 182.7,54.1 184.4,54.6 186.1,55.3 187.8,56.2 189.4,57.4 191.1,58.9 192.8,60.6 194.5,62.5 196.2,64.6 197.9,66.8 199.6,69.3 201.3,71.8 202.9,74.5 204.6,77.2 206.3,80 208,82.8 209.7,85.7 211.4,88.6 213.1,91.5 214.8,94.3 216.4,97.2 218.1,99.9 219.8,102.7 221.5,105.3 223.2,107.9 224.9,110.4 226.6,112.8 228.2,115.1 229.9,117.4 231.6,119.5 233.3,121.5 235,123.5 236.7,125.4 238.4,127.1 240.1,128.8 241.8,130.4 243.4,131.9 245.1,133.3 246.8,134.7 248.5,135.9 250.2,137.1 251.9,138.2 253.6,139.3 255.3,140.3 256.9,141.2 258.6,142.1 260.3,142.9 262,143.6 263.7,144.4 265.4,145 267.1,145.6 268.8,146.2 270.4,146.8 272.1,147.3 273.8,147.7 275.5,148.2 277.2,148.6 278.9,149 280.6,149.3 282.3,149.7 283.9,150 285.6,150.2 287.3,150.5 289,150.8 290.7,151 292.4,151.2 294.1,151.4 295.8,151.6 297.4,151.8 299.1,151.9 300.8,152.1 302.5,152.2 304.2,152.3 305.9,152.5 307.6,152.6 309.3,152.7 310.9,152.8 312.6,152.9 314.3,152.9 316,153" fill="none" style="stroke:var(--blue-ink);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round"/>
<circle cx="181" cy="54" r="4.5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<text x="189" y="58" text-anchor="start" style="fill:var(--blue-ink);font-size:10px;font-weight:700">0.25 at z = 0</text>
<circle cx="271" cy="146.9" r="4.5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<text x="271" y="136.9" text-anchor="middle" style="fill:var(--blue-ink);font-size:10px;font-weight:700">0.018</text>
<text x="79.8" y="74" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">saturated</text>
<text x="282.3" y="74" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">saturated</text>
<text x="560" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">penalty Ω = Σ[h(1 − h)]² · ΣW²</text>
<text x="560" y="29" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">log scale</text>
<text x="462" y="80" text-anchor="end" style="fill:var(--fg-2);font-size:11px;font-weight:400">z = (0, 0)</text>
<rect x="470" y="64" width="176.1" height="24" rx="4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="652.1" y="80" text-anchor="start" style="fill:var(--blue-ink);font-size:11px;font-weight:700">0.4375</text>
<text x="462" y="122" text-anchor="end" style="fill:var(--fg-2);font-size:11px;font-weight:400">z = (4, −4)</text>
<rect x="470" y="106" width="22.8" height="24" rx="4" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="498.8" y="122" text-anchor="start" style="fill:var(--green-ink);font-size:11px;font-weight:700">0.0022</text>
<text x="560" y="168" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">saturating the units shrinks Ω ≈ 200×</text>
</svg>
<p class="fig-cap">W = [[1, 2], [−1, 1]]. The code is insensitive to the input when the units sit in the flat (saturated) part of the sigmoid, which is exactly what the contractive penalty rewards.</p>
</div>

<details>
<summary><b>Try it yourself</b>: one sigmoid hidden unit, weights (2, −1), output h = 0.8. Contractive penalty?</summary>

$h(1-h)=0.16$, squared $0.0256$, times $\sum w^2=5$: $\Omega=0.128$.

</details>

---

## 5.8 The autoencoder family side by side

| Variant | What changes | Penalty / mechanism | What it buys |
|---|---|---|---|
| Undercomplete AE | $k<n$ | the bottleneck itself | compression; linear case = PCA |
| Overcomplete AE | $k\ge n$ | none | **copies**: needs one of the below |
| Weight decay | loss | $\frac\lambda2\lVert\theta\rVert^2$ | small weights, less memorising |
| Tied weights | architecture | $W^*=W^\top$ | half the parameters |
| Denoising | **input** | train on $\tilde{\mathbf x}$, target $\mathbf x$ | robust features (strokes, edges) |
| Sparse | loss | $\sum_l\mathrm{KL}(\rho\,\Vert\,\hat\rho_l)$ | few active units per input |
| Contractive | loss | $\lVert J_{\mathbf x}(\mathbf h)\rVert_F^2$ | code insensitive to small input changes |

<div class="fig" role="img" aria-label="The autoencoder family">
<svg viewBox="0 0 700 154" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="14" y="58" width="104" height="44" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="66" y="76.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">Autoencoder</text>
<text x="66" y="91.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">h = g(Wx + b)</text>
<line x1="118" y1="70" x2="172.4" y2="38.1" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="176,36 172.3,41.5 169.4,36.5" style="fill:var(--line-strong)"/>
<line x1="118" y1="90" x2="172.3" y2="120" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="176,122 169.4,121.6 172.1,116.6" style="fill:var(--line-strong)"/>
<rect x="178" y="8" width="220" height="56" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="288" y="32.8" text-anchor="middle" style="fill:var(--green-ink);font-size:11.5px;font-weight:700">Undercomplete  k &lt; n</text>
<text x="288" y="47.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">compression; linear + MSE = PCA</text>
<rect x="178" y="96" width="220" height="56" rx="8" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="288" y="120.8" text-anchor="middle" style="fill:var(--red-ink);font-size:11.5px;font-weight:700">Overcomplete  k ≥ n</text>
<text x="288" y="135.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">copies x: needs a regulariser</text>
<line x1="398" y1="124" x2="453.8" y2="124" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="458,124 452,126.9 452,121.1" style="fill:var(--green-ink)"/>
<text x="428" y="114" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">regularise</text>
<rect x="460" y="2" width="232" height="32" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="576" y="14.9" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">Weight decay / tied weights</text>
<text x="576" y="28.9" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:500">small weights · half the parameters</text>
<rect x="460" y="40" width="232" height="32" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="576" y="52.9" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">Denoising</text>
<text x="576" y="66.9" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:500">corrupt input, target the clean x</text>
<rect x="460" y="78" width="232" height="32" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="576" y="90.9" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">Sparse</text>
<text x="576" y="104.9" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:500">KL on ρ̂: few active units</text>
<rect x="460" y="116" width="232" height="32" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="576" y="128.9" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">Contractive</text>
<text x="576" y="142.9" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:500">penalty ‖J‖²_F on ∂h/∂x</text>
</svg>
<p class="fig-cap">Undercomplete autoencoders compress by construction; overcomplete ones need one of the four regularisers to avoid learning the identity.</p>
</div>

**[Exam] Typical multi-select, solved.**

| Statement | Verdict | Why |
|---|---|---|
| AEs can capture non-linear relationships; PCA cannot | ✓ | non-linear encoder/decoder |
| An overcomplete AE without regularisation can learn the identity | ✓ | $k\ge n$ lets $\mathbf h$ copy $\mathbf x$ |
| A DAE's loss compares the output with the corrupted input | ✗ | compares with the **clean** input |
| A sparse AE forces the hidden layer to be small | ✗ | it forces **few active** units; the layer may be large |
| A CAE penalises the derivative of the code w.r.t. the input | ✓ | $\lVert J_{\mathbf x}(\mathbf h)\rVert_F^2$ |
| A linear AE with squared loss on raw (un-centred) data gives exactly PCA | ✗ | inputs must be centred and scaled |
| AEs always need fewer data than PCA / are always faster | ✗ | neither is guaranteed |

---

## 5.9 Week-5 exam toolkit & practice set

**Diagram — Week 5 at a glance**

<div class="fig" role="img" aria-label="Week 5 at a glance">
<svg viewBox="0 0 700 84" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="0" y="6" width="160" height="70" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="80" y="30.5" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">PCA</text>
<text x="80" y="45" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">C u = λ u</text>
<text x="80" y="59.5" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">MSE = Σ discarded λ</text>
<rect x="180" y="6" width="160" height="70" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="260" y="30.5" text-anchor="middle" style="fill:var(--green-ink);font-size:11.5px;font-weight:700">Linear AE</text>
<text x="260" y="45" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">+ squared loss</text>
<text x="260" y="59.5" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">+ centred x  =  PCA</text>
<rect x="360" y="6" width="160" height="70" rx="8" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.5"/>
<text x="440" y="23.3" text-anchor="middle" style="fill:var(--yellow-ink);font-size:11.5px;font-weight:700">Decoder / loss</text>
<text x="440" y="37.8" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">binary: σ + CE</text>
<text x="440" y="52.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">real: linear + MSE</text>
<text x="440" y="66.8" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">∂L/∂a = x̂ − x</text>
<rect x="540" y="6" width="160" height="70" rx="8" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="620" y="30.5" text-anchor="middle" style="fill:var(--red-ink);font-size:11.5px;font-weight:700">k ≥ n copies</text>
<text x="620" y="45" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">L2 · tied · denoise</text>
<text x="620" y="59.5" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">sparse KL · ‖J‖²_F</text>
<line x1="160" y1="41" x2="175.8" y2="41" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="180,41 174,43.9 174,38.1" style="fill:var(--line-strong)"/>
<line x1="340" y1="41" x2="355.8" y2="41" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="360,41 354,43.9 354,38.1" style="fill:var(--line-strong)"/>
<line x1="520" y1="41" x2="535.8" y2="41" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="540,41 534,43.9 534,38.1" style="fill:var(--line-strong)"/>
</svg>
<p class="fig-cap">Week 5 on one line.</p>
</div>

### 5.9.1 Recognition rules

| See | Think |
|---|---|
| covariance matrix + "first principal component" | top eigenvector; variance = its eigenvalue |
| "fraction of variance retained" | $\sum_{i\le k}\lambda_i/\sum\lambda_i$ |
| "reconstruction error of PCA with $k$ components" | sum of discarded eigenvalues |
| binary inputs | sigmoid decoder + cross-entropy |
| real inputs | linear decoder + squared error |
| "gradient at the decoder pre-activation" | $\hat{\mathbf x}-\mathbf x$ (both pairings) |
| "when does an AE equal PCA" | linear + linear + MSE + centred, $1/\sqrt m$-scaled inputs |
| $k\ge n$ | overcomplete: can copy, needs regularisation |
| "tied weights" | $W^*=W^\top$; gradient = encoder part + decoder part transposed |
| "corrupt input, reconstruct clean" | denoising AE; $P(\tilde x=0)=q$ |
| $\hat\rho_l$, KL, target $\rho$ | sparse AE; $\partial\Omega/\partial\hat\rho=-\rho/\hat\rho+(1-\rho)/(1-\hat\rho)$ |
| Frobenius norm of a Jacobian | contractive AE; $\partial h_l/\partial x_j=h_l(1-h_l)W_{lj}$ |

### 5.9.2 Formula sheet

| Formula | Use |
|---|---|
| $C=\frac1mX^\top X$, $C\mathbf u=\lambda\mathbf u$ | PCA directions |
| $X=U\Sigma V^\top$, $\lambda_i=\sigma_i^2/m$ | PCA via SVD |
| $\mathbf h=g(W\mathbf x+\mathbf b)$, $\hat{\mathbf x}=f(W^*\mathbf h+\mathbf c)$ | autoencoder |
| $-\sum_j[x_j\ln\hat x_j+(1-x_j)\ln(1-\hat x_j)]$ | binary loss |
| $\partial\mathcal L/\partial W^*=(\hat{\mathbf x}-\mathbf x)\mathbf h^\top$ | decoder gradient |
| $W=V_k^\top$, $W^*=V_k$ | optimal linear AE |
| $P(\tilde x_{ij}=0)=q$ | denoising corruption |
| $\hat\rho_l=\frac1m\sum_ih_l(\mathbf x_i)$, $\Omega=\sum_l\big[\rho\ln\frac\rho{\hat\rho_l}+(1-\rho)\ln\frac{1-\rho}{1-\hat\rho_l}\big]$ | sparse AE |
| $\Omega=\sum_l[h_l(1-h_l)]^2\sum_jW_{lj}^2$ | contractive AE, sigmoid encoder |

### 5.9.3 Practice set

1. Covariance $\begin{bmatrix}4&0\\0&1\end{bmatrix}$. First principal direction? Variance kept by one component?
2. Eigenvalues $5,3,1,1$. Smallest $k$ keeping at least 80% of the variance? Reconstruction MSE with $k=1$?
3. Binary $\mathbf x=(1,1,0)$, decoder outputs $\hat{\mathbf x}=(0.9,0.5,0.2)$. Cross-entropy loss and $\partial\mathcal L/\partial\mathbf a$?
4. An AE maps 100 → 20 → 100. Parameters untied vs tied (with biases)?
5. Real-valued inputs in $[-5,5]$. Which decoder and loss? What goes wrong with a sigmoid decoder?
6. Masking noise $q=0.3$ on a 1000-dimensional input. Expected number of masked entries? What is the target of the loss?
7. Sparse AE, $\rho=0.05$, a unit with $\hat\rho=0.05$. Penalty and gradient? Same unit with $\hat\rho=0.5$?
8. Contractive AE, one sigmoid hidden unit with weights $(3,4)$ and output $h=0.5$. Compute $\Omega$.
9. True/False: "A linear autoencoder trained with squared error always learns exactly the eigenvectors as its weights."
10. Creative: you train an overcomplete AE (784 → 1000 → 784) and get almost zero training error after one epoch, but the codes are useless for classification. Name the problem and three distinct fixes from this week, one line each.

### 5.9.4 Answers

1. $(1,0)$ (eigenvalue 4); kept $4/5=80\%$.
2. $k=2$ ($8/10=80\%$); MSE with $k=1$ is $3+1+1=5$.
3. $\mathcal L=-[\ln0.9+\ln0.5+\ln0.8]=0.105+0.693+0.223=1.022$; $\hat{\mathbf x}-\mathbf x=(-0.1,-0.5,0.2)$.
4. Untied $2000+2000+20+100=4120$; tied $2000+120=2120$.
5. Linear decoder + squared error; a sigmoid can only output (0,1), so it can never reach targets like −3 or 4.
6. $300$; the clean input $\mathbf x$.
7. $\Omega=0$, gradient 0. At 0.5: $\Omega=0.05\ln0.1+0.95\ln1.9=-0.1151+0.6098=0.495$; gradient $-0.1+1.9=1.8$.
8. $h(1-h)=0.25$, squared $0.0625$, times $9+16=25$: $\Omega=1.5625$.
9. False: it learns the same **subspace** (any invertible mix of the top-$k$ eigenvectors), and only if inputs are centred/scaled and training reaches the optimum.
10. Overcomplete AE copying the input (identity map). Fixes: denoising (corrupt input, target clean), sparse KL penalty (few active units), contractive penalty (small Jacobian); weight decay or tied weights also count.

### 5.9.5 Worked solutions, line by line

**Q2.** Eigenvalues $5,3,1,1$, total 10.

| Line | Calculation | Result |
|---|---|---|
| 1 | $k=1$: $5/10$ | 50%: not enough |
| 2 | $k=2$: $(5+3)/10$ | 80% ✓ |
| 3 | MSE with $k=1$: discarded $3+1+1$ | 5 |
| 4 | MSE with $k=2$: discarded $1+1$ | 2 |

**Q7.** $\rho=0.05$, $\hat\rho=0.5$.

| Line | Calculation | Result |
|---|---|---|
| 1 | $\rho\ln(\rho/\hat\rho)=0.05\ln0.1$ | −0.1151 |
| 2 | $(1-\rho)\ln\frac{1-\rho}{1-\hat\rho}=0.95\ln1.9$ | 0.6098 |
| 3 | $\Omega$ | 0.495 |
| 4 | $-\rho/\hat\rho+(1-\rho)/(1-\hat\rho)=-0.1+1.9$ | 1.8 > 0, so GD lowers $\hat\rho$ |

**Q8.** $\partial h/\partial x_j=h(1-h)w_j=0.25\,(3,4)=(0.75,1)$; $\Omega=0.75^2+1^2=0.5625+1=1.5625$. ✓ Same as the formula route.

---
