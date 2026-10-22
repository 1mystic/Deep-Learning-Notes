---
title: Week 7 (Pretraining, Activations, Initialization, Batch Norm)
summary: Week 7 from first principles: why deep nets were hard to train, greedy layer-wise pretraining, better activation functions, better weight initialization and batch normalization with worked examples.
tags: [deep-learning, quiz-2, week-7]
color: blue
order: 7
---

# Deep Learning : Illustrated Notes for Week 7


## Contents

- **Week 7 — Greedy layer-wise pre-training, better activation functions, better weight initialization, batch normalization** ✓
  - 7.0 Week-7 map
  - 7.1 Why deep networks were hard to train
  - 7.2 Greedy layer-wise pre-training
  - 7.3 Better activation functions
  - 7.4 Better weight initialization
  - 7.5 Batch normalization
  - 7.6 Week-7 exam toolkit & practice set


---


## 7.0 Week-7 map

**[Intuition]** Until about 2006, networks with more than two or three hidden layers simply did not train well. The gradient reaching the early layers was tiny (or huge), so those layers learned almost nothing. Week 7 is the toolkit that fixed this, in historical order:

1. **Pre-training** (2006): give every layer a good starting point, one layer at a time.
2. **Better activations** (ReLU and family): stop the gradient from shrinking at every layer.
3. **Better initialization** (Xavier, He): start with weights that keep signals at a sensible size.
4. **Batch normalization** (2015): keep each layer's inputs at a sensible size *during* training.

<div class="fig" role="img" aria-label="Fixes for deep networks">
<svg viewBox="0 0 700 116" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="0" y="30" width="150" height="56" rx="8" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="75" y="47.5" text-anchor="middle" style="fill:var(--red-ink);font-size:11.5px;font-weight:700">Deep nets won't train</text>
<text x="75" y="62" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">vanishing / exploding</text>
<text x="75" y="76.5" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">gradients</text>
<line x1="150" y1="50" x2="184.3" y2="31" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="188,29 184.1,34.4 181.4,29.4" style="fill:var(--line-strong)"/>
<line x1="150" y1="66" x2="184.2" y2="83.1" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="188,85 181.3,84.9 183.9,79.7" style="fill:var(--line-strong)"/>
<rect x="190" y="6" width="245" height="46" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="312.5" y="25.8" text-anchor="middle" style="fill:var(--green-ink);font-size:11.5px;font-weight:700">1 · Pre-training (2006)</text>
<text x="312.5" y="40.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">layer by layer, unsupervised</text>
<rect x="445" y="6" width="245" height="46" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="567.5" y="25.8" text-anchor="middle" style="fill:var(--green-ink);font-size:11.5px;font-weight:700">2 · Better activations</text>
<text x="567.5" y="40.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">ReLU family, maxout</text>
<rect x="190" y="62" width="245" height="46" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="312.5" y="81.8" text-anchor="middle" style="fill:var(--green-ink);font-size:11.5px;font-weight:700">3 · Better initialisation</text>
<text x="312.5" y="96.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">Xavier, He keep signal size</text>
<rect x="445" y="62" width="245" height="46" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="567.5" y="81.8" text-anchor="middle" style="fill:var(--green-ink);font-size:11.5px;font-weight:700">4 · Batch norm (2015)</text>
<text x="567.5" y="96.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">re-standardise each layer</text>
</svg>
<p class="fig-cap">The Week 7 toolkit, in historical order: each tool attacks the same problem of signals and gradients that shrink or blow up with depth.</p>
</div>

> [!TIP]
> **Everyday pictures for the whole week.**
> - **Vanishing gradient** is a message whispered down a long line of people: each one passes on only a quarter of what they heard.
> - **Pre-training** is building a tower one floor at a time, letting each floor settle before adding the next, then levelling the whole thing at the end.
> - **Initialization** is tuning the volume of every speaker in a chain so the signal neither fades out nor blasts.
> - **Batch norm** is a sound engineer at every floor, re-centring and re-scaling the signal before it goes up.

---

## 7.1 Why deep networks were hard to train

### 7.1.1 [Derivation] The gradient is a long product

For a chain of sigmoid layers $h_{i}=\sigma(a_i)$, $a_i=w_ih_{i-1}$ (one unit per layer, to see the pattern), backprop (Week 3) gives
$$\frac{\partial\mathcal L}{\partial w_1}=\frac{\partial\mathcal L}{\partial h_L}\prod_{i=2}^{L}\Big(\sigma'(a_i)\,w_i\Big)\cdot\sigma'(a_1)\,h_0.$$
Every layer contributes a factor $\sigma'(a_i)w_i$. Since $\sigma'\le\frac14$:
- with $|w_i|\le1$, each factor is at most $\frac14$: the gradient **vanishes** exponentially with depth;
- with large $|w_i|$, factors can exceed 1: the gradient **explodes**.

**[Ex]** 10 sigmoid layers, weights 1, best case $\sigma'=0.25$ everywhere: $0.25^{10}\approx9.5\times10^{-7}$. The first layer learns a million times slower than the last.

**[Exam] End-term multi-select (sigmoid network, cross-entropy).**

| Statement | Verdict |
|---|---|
| The gradient at each layer depends on the gradient propagated from the layer above | ✓ (chain rule) |
| Since $\sigma'(z)\le0.25$, repeated multiplication can shrink gradients toward zero | ✓ |
| A very large gradient can cause huge weight updates and unstable training | ✓ (exploding) |
| Small gradients always make the loss decrease | ✗ (they make learning crawl; they guarantee nothing) |

<div class="fig" role="img" aria-label="Vanishing gradients">
<svg viewBox="0 0 700 200" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="46" y="28" width="67.5" height="140" rx="0" style="fill:var(--red);stroke:none;stroke-width:1.2;opacity:0.3"/>
<rect x="248.5" y="28" width="67.5" height="140" rx="0" style="fill:var(--red);stroke:none;stroke-width:1.2;opacity:0.3"/>
<line x1="46" y1="168" x2="316" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="134.7" x2="316" y2="134.7" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="101.3" x2="316" y2="101.3" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="34.7" x2="316" y2="34.7" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="28" x2="46" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="113.5" y1="28" x2="113.5" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="181" y1="28" x2="181" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="248.5" y1="28" x2="248.5" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="316" y1="28" x2="316" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="28" x2="46" y2="168" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="46" y1="168" x2="316" y2="168" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="46" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-8</text>
<text x="113.5" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-4</text>
<text x="181" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="248.5" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="316" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">8</text>
<text x="40" y="171.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="40" y="138.2" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.25</text>
<text x="40" y="104.8" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.5</text>
<text x="40" y="38.2" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="181" y="194" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">pre-activation a</text>
<text x="181" y="14" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">sigmoid and its slope</text>
<polyline points="46,168 48.3,167.9 50.5,167.9 52.8,167.9 55,167.9 57.3,167.9 59.5,167.9 61.8,167.9 64,167.9 66.3,167.9 68.5,167.8 70.8,167.8 73,167.8 75.3,167.7 77.5,167.7 79.8,167.7 82,167.6 84.3,167.6 86.5,167.5 88.8,167.4 91,167.4 93.3,167.3 95.5,167.2 97.8,167 100,166.9 102.3,166.8 104.5,166.6 106.8,166.4 109,166.2 111.3,165.9 113.5,165.6 115.8,165.3 118,164.9 120.3,164.5 122.5,164 124.8,163.4 127,162.8 129.3,162.1 131.5,161.3 133.8,160.4 136,159.3 138.3,158.2 140.5,156.9 142.8,155.5 145,153.9 147.3,152.1 149.5,150.1 151.8,148 154,145.6 156.3,143 158.5,140.2 160.8,137.1 163,133.9 165.3,130.4 167.5,126.7 169.8,122.8 172,118.7 174.3,114.5 176.5,110.2 178.8,105.8 181,101.3 183.3,96.9 185.5,92.5 187.8,88.2 190,84 192.3,79.9 194.5,76 196.8,72.3 199,68.8 201.3,65.5 203.5,62.5 205.8,59.7 208,57.1 210.3,54.7 212.5,52.5 214.8,50.6 217,48.8 219.3,47.2 221.5,45.8 223.8,44.5 226,43.3 228.3,42.3 230.5,41.4 232.8,40.6 235,39.9 237.3,39.3 239.5,38.7 241.8,38.2 244,37.8 246.3,37.4 248.5,37.1 250.8,36.8 253,36.5 255.3,36.3 257.5,36.1 259.8,35.9 262,35.8 264.3,35.6 266.5,35.5 268.8,35.4 271,35.3 273.3,35.2 275.5,35.2 277.8,35.1 280,35 282.3,35 284.5,35 286.8,34.9 289,34.9 291.3,34.9 293.5,34.8 295.8,34.8 298,34.8 300.3,34.8 302.5,34.8 304.8,34.8 307,34.7 309.3,34.7 311.5,34.7 313.8,34.7 316,34.7" fill="none" style="stroke:var(--blue-ink);stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round"/>
<polyline points="46,168 48.3,167.9 50.5,167.9 52.8,167.9 55,167.9 57.3,167.9 59.5,167.9 61.8,167.9 64,167.9 66.3,167.9 68.5,167.8 70.8,167.8 73,167.8 75.3,167.7 77.5,167.7 79.8,167.7 82,167.6 84.3,167.6 86.5,167.5 88.8,167.4 91,167.4 93.3,167.3 95.5,167.2 97.8,167.1 100,166.9 102.3,166.8 104.5,166.6 106.8,166.4 109,166.2 111.3,165.9 113.5,165.6 115.8,165.3 118,165 120.3,164.5 122.5,164.1 124.8,163.6 127,163 129.3,162.3 131.5,161.6 133.8,160.8 136,159.9 138.3,158.9 140.5,157.8 142.8,156.7 145,155.4 147.3,154 149.5,152.5 151.8,151 154,149.4 156.3,147.7 158.5,146 160.8,144.3 163,142.6 165.3,141 167.5,139.5 169.8,138.1 172,136.9 174.3,136 176.5,135.3 178.8,134.8 181,134.7 183.3,134.8 185.5,135.3 187.8,136 190,136.9 192.3,138.1 194.5,139.5 196.8,141 199,142.6 201.3,144.3 203.5,146 205.8,147.7 208,149.4 210.3,151 212.5,152.5 214.8,154 217,155.4 219.3,156.7 221.5,157.8 223.8,158.9 226,159.9 228.3,160.8 230.5,161.6 232.8,162.3 235,163 237.3,163.6 239.5,164.1 241.8,164.5 244,165 246.3,165.3 248.5,165.6 250.8,165.9 253,166.2 255.3,166.4 257.5,166.6 259.8,166.8 262,166.9 264.3,167.1 266.5,167.2 268.8,167.3 271,167.4 273.3,167.4 275.5,167.5 277.8,167.6 280,167.6 282.3,167.7 284.5,167.7 286.8,167.7 289,167.8 291.3,167.8 293.5,167.8 295.8,167.9 298,167.9 300.3,167.9 302.5,167.9 304.8,167.9 307,167.9 309.3,167.9 311.5,167.9 313.8,167.9 316,168" fill="none" style="stroke:var(--red-ink);stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round"/>
<line x1="46" y1="134.7" x2="316" y2="134.7" style="stroke:var(--red-ink);stroke-width:1;stroke-linecap:round;stroke-dasharray:4 3"/>
<text x="52.8" y="48" text-anchor="start" style="fill:var(--blue-ink);font-size:10.5px;font-weight:700">σ(a)</text>
<text x="191.1" y="128.7" text-anchor="start" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">σ′ ≤ 0.25</text>
<text x="79.8" y="85.3" text-anchor="middle" style="fill:var(--red-ink);font-size:10px;font-weight:700">saturated</text>
<text x="282.3" y="128" text-anchor="middle" style="fill:var(--red-ink);font-size:10px;font-weight:700">saturated</text>
<line x1="430" y1="168" x2="670" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="430" y1="123.6" x2="670" y2="123.6" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="430" y1="79.1" x2="670" y2="79.1" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="430" y1="34.7" x2="670" y2="34.7" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="430" y1="28" x2="430" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="478" y1="28" x2="478" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="526" y1="28" x2="526" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="574" y1="28" x2="574" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="622" y1="28" x2="622" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="670" y1="28" x2="670" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="430" y1="28" x2="430" y2="168" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="430" y1="168" x2="670" y2="168" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="430" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="478" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="526" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="574" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">6</text>
<text x="622" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">8</text>
<text x="670" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">10</text>
<text x="424" y="171.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1e-6</text>
<text x="424" y="127.1" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1e-4</text>
<text x="424" y="82.6" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1e-2</text>
<text x="424" y="38.2" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="550" y="194" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">layers L</text>
<text x="392" y="98" text-anchor="middle" transform="rotate(-90 392 98)" style="fill:var(--muted);font-size:10.5px;font-weight:400">gradient factor</text>
<text x="550" y="14" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">gradient reaching layer 1</text>
<polyline points="430,34.7 670,34.7" fill="none" style="stroke:var(--green-ink);stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round"/>
<polyline points="430,34.7 454,48.1 478,61.4 502,74.8 526,88.2 550,101.6 574,115 598,128.3 622,141.7 646,155.1 670,168.5" fill="none" style="stroke:var(--red-ink);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round"/>
<circle cx="430" cy="34.7" r="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.4"/>
<circle cx="454" cy="48.1" r="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.4"/>
<circle cx="478" cy="61.4" r="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.4"/>
<circle cx="502" cy="74.8" r="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.4"/>
<circle cx="526" cy="88.2" r="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.4"/>
<circle cx="550" cy="101.6" r="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.4"/>
<circle cx="574" cy="115" r="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.4"/>
<circle cx="598" cy="128.3" r="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.4"/>
<circle cx="622" cy="141.7" r="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.4"/>
<circle cx="646" cy="155.1" r="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.4"/>
<circle cx="670" cy="168.5" r="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.4"/>
<text x="670" y="28.7" text-anchor="end" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">ReLU on: factor 1</text>
<text x="670" y="114.7" text-anchor="end" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">0.25¹⁰ ≈ 9.5e-7</text>
<text x="545.2" y="72.4" text-anchor="start" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">sigmoid, best case</text>
<circle r="4.5" style="fill:var(--fg)"><animateMotion dur="6s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.8;1" path="M430,34.7 L454,48.1 L478,61.4 L502,74.8 L526,88.2 L550,101.6 L574,115 L598,128.3 L622,141.7 L646,155.1 L670,168.5"/></circle>
</svg>
<p class="fig-cap">Left: the sigmoid slope never exceeds 0.25 and is almost 0 in the saturated tails. Right: every sigmoid layer multiplies the gradient by at most 0.25, so after 10 layers the first one learns a million times slower.</p>
</div>

---

## 7.2 Greedy layer-wise pre-training

### 7.2.1 The procedure (Hinton et al. 2006; Bengio et al. 2007)

Train the network **one layer at a time, unsupervised**, then fine-tune everything with labels.

1. Train an autoencoder (Week 5) on the inputs $\mathbf x$: $\mathbf x\to\mathbf h_1\to\hat{\mathbf x}$. Keep the encoder.
2. Compute $\mathbf h_1$ for every training example. Train a second autoencoder on these codes: $\mathbf h_1\to\mathbf h_2\to\hat{\mathbf h}_1$. Keep its encoder.
3. Repeat for as many layers as wanted ("greedy": each layer is optimised on its own, never revisited during this phase).
4. Stack the encoders, add an output layer, and **fine-tune the whole network** with backprop on the labelled task.

<div class="fig" role="img" aria-label="Greedy layer-wise pre-training">
<svg viewBox="0 0 700 94" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="0" y="6" width="118" height="48" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="59" y="26.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">AE 1</text>
<text x="59" y="41.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">x → h₁ → x̂</text>
<rect x="145.5" y="6" width="118" height="48" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="204.5" y="26.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">AE 2</text>
<text x="204.5" y="41.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">h₁ → h₂ → ĥ₁</text>
<rect x="291" y="6" width="118" height="48" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="350" y="26.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">AE 3</text>
<text x="350" y="41.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">h₂ → h₃ → ĥ₂</text>
<rect x="436.5" y="6" width="118" height="48" rx="8" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.5"/>
<text x="495.5" y="26.8" text-anchor="middle" style="fill:var(--yellow-ink);font-size:11.5px;font-weight:700">Stack encoders</text>
<text x="495.5" y="41.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">+ output layer</text>
<rect x="582" y="6" width="118" height="48" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="641" y="26.8" text-anchor="middle" style="fill:var(--green-ink);font-size:11.5px;font-weight:700">Fine-tune all</text>
<text x="641" y="41.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">backprop with labels</text>
<line x1="118" y1="30" x2="141.3" y2="30" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="145.5,30 139.5,32.9 139.5,27.1" style="fill:var(--line-strong)"/>
<line x1="263.5" y1="30" x2="286.8" y2="30" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="291,30 285,32.9 285,27.1" style="fill:var(--line-strong)"/>
<line x1="409" y1="30" x2="432.3" y2="30" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="436.5,30 430.5,32.9 430.5,27.1" style="fill:var(--line-strong)"/>
<line x1="554.5" y1="30" x2="577.8" y2="30" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="582,30 576,32.9 576,27.1" style="fill:var(--line-strong)"/>
<line x1="0" y1="68" x2="409" y2="68" style="stroke:var(--blue-ink);stroke-width:2;stroke-linecap:round"/>
<text x="204.5" y="84" text-anchor="middle" style="fill:var(--blue-ink);font-size:10.5px;font-weight:700">unsupervised, greedy: each layer is trained on its own</text>
<line x1="436.5" y1="68" x2="700" y2="68" style="stroke:var(--green-ink);stroke-width:2;stroke-linecap:round"/>
<text x="568.3" y="84" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">supervised</text>
<circle r="4" style="fill:var(--fg)"><animateMotion dur="6s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.8;1" path="M118,30 L582,30"/></circle>
</svg>
<p class="fig-cap">Each autoencoder trains on the codes of the one before it; then the encoders are stacked, an output layer is added, and everything is fine-tuned with labels.</p>
</div>

**[Ex] Counting.** A 784 → 500 → 250 → 10 classifier, untied autoencoders:

| Stage | Network | Parameters |
|---|---|---|
| AE 1 | 784 → 500 → 784 | $784\cdot500+500+500\cdot784+784=785{,}284$ |
| AE 2 | 500 → 250 → 500 | $500\cdot250+250+250\cdot500+500=250{,}750$ |
| Fine-tune | 784 → 500 → 250 → 10 | encoders kept, decoders thrown away, new 250 → 10 layer added |

### 7.2.2 Why does it work? Two explanations

| View | Claim | Supporting observation |
|---|---|---|
| **Better optimization** | pre-training starts the weights in a region where the loss is easier to descend | pre-trained deep nets reach lower **training** error |
| **Better regularization** | pre-training restricts weights to a region tied to the input distribution, like a prior | pre-trained nets generalise better for the same training error |

Studies (Erhan et al. 2010) found evidence for both. The lasting lesson: **where you start matters** and the problem is mostly optimization. Better activations, initializations, normalization and optimizers (Week 4) now make pre-training unnecessary for most supervised nets, but the idea lives on in modern pre-trained models.

---

## 7.3 Better activation functions

### 7.3.1 Why non-linear at all

Without non-linear activations, $W_L\cdots W_2W_1\mathbf x$ is one matrix times $\mathbf x$: any depth collapses into a **linear** model (Week 2). The question is *which* non-linearity trains best.

### 7.3.2 Sigmoid: three problems

1. **Saturation.** At large $|a|$, $\sigma'(a)\approx0$: the neuron's weights stop updating.
2. **Not zero-centred.** Outputs are always positive. For a neuron fed by sigmoid outputs $h_j>0$, $\partial\mathcal L/\partial w_j=\delta\cdot h_j$: **every** weight gradient has the **same sign** as $\delta$. In 2-D the update can only point into the first or third quadrant, so reaching a target that needs one weight up and the other down takes a zig-zag.
3. **Costly:** $e^{-a}$ per neuron.

**[Ex] Same-sign gradients.** $\mathbf h=(0.6,0.9)$, $\delta=-0.5$: gradients $(-0.3,-0.45)$, both negative, so both weights increase together, even if the optimum wants one up and one down.

<div class="fig" role="img" aria-label="Why zero-centred outputs matter">
<svg viewBox="0 0 700 190" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="87.5" y="24" width="112.5" height="65" rx="0" style="fill:var(--green);stroke:none;stroke-width:1.2;opacity:0.55"/>
<rect x="50" y="89" width="37.5" height="65" rx="0" style="fill:var(--green);stroke:none;stroke-width:1.2;opacity:0.55"/>
<rect x="50" y="24" width="37.5" height="65" rx="0" style="fill:var(--red);stroke:none;stroke-width:1.2;opacity:0.4"/>
<rect x="87.5" y="89" width="112.5" height="65" rx="0" style="fill:var(--red);stroke:none;stroke-width:1.2;opacity:0.4"/>
<line x1="50" y1="154" x2="200" y2="154" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="50" y1="89" x2="200" y2="89" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="50" y1="24" x2="200" y2="24" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="50" y1="24" x2="50" y2="154" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="87.5" y1="24" x2="87.5" y2="154" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="125" y1="24" x2="125" y2="154" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="162.5" y1="24" x2="162.5" y2="154" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="200" y1="24" x2="200" y2="154" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="50" y1="24" x2="50" y2="154" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="50" y1="154" x2="200" y2="154" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="50" y="167" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-1</text>
<text x="87.5" y="167" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="125" y="167" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="162.5" y="167" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="200" y="167" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">3</text>
<text x="44" y="157.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">-2</text>
<text x="44" y="92.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="44" y="27.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="125" y="180" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">w₁</text>
<text x="18" y="89" text-anchor="middle" transform="rotate(-90 18 89)" style="fill:var(--muted);font-size:10.5px;font-weight:400">w₂</text>
<text x="125" y="14" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">update direction when all h &gt; 0</text>
<text x="143.8" y="43.5" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">allowed</text>
<text x="143.8" y="144.3" text-anchor="middle" style="fill:var(--red-ink);font-size:10px;font-weight:700">target is here</text>
<polyline points="87.5,89 125,82.5 121.3,108.5 151.3,105.3 147.5,124.8 162.5,121.5" fill="none" style="stroke:var(--fg);stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round"/>
<circle cx="87.5" cy="89" r="4" style="fill:var(--surface);stroke:var(--fg);stroke-width:1.8"/>
<polygon points="162.5,114.5 168.5,121.5 162.5,128.5 156.5,121.5" style="fill:var(--red-ink)"/>
<circle r="3.8" style="fill:var(--fg)"><animateMotion dur="6s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.8;1" path="M87.5,89 L125,82.5 L121.3,108.5 L151.3,105.3 L147.5,124.8 L162.5,121.5"/></circle>
<line x1="330" y1="140" x2="460" y2="140" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="330" y1="97.1" x2="460" y2="97.1" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="330" y1="54.3" x2="460" y2="54.3" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="330" y1="40" x2="330" y2="140" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="330" y1="140" x2="460" y2="140" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="324" y="143.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">-0.6</text>
<text x="324" y="100.6" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">-0.3</text>
<text x="324" y="57.8" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.0</text>
<text x="296" y="90" text-anchor="middle" transform="rotate(-90 296 90)" style="fill:var(--muted);font-size:10.5px;font-weight:400">∂L/∂wⱼ</text>
<text x="395" y="14" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">same δ, same sign</text>
<rect x="343" y="54.3" width="39" height="42.9" rx="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="362.5" y="153" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">h₁ = 0.6</text>
<text x="362.5" y="109.1" text-anchor="middle" style="fill:var(--red-ink);font-size:10px;font-weight:700">-0.3</text>
<rect x="408" y="54.3" width="39" height="64.3" rx="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="427.5" y="153" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">h₂ = 0.9</text>
<text x="427.5" y="130.6" text-anchor="middle" style="fill:var(--red-ink);font-size:10px;font-weight:700">-0.45</text>
<text x="490" y="70" text-anchor="start" style="fill:var(--fg);font-size:11px;font-weight:700">∂L/∂wⱼ = δ · hⱼ</text>
<text x="490" y="88" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">hⱼ &gt; 0 for every j, so</text>
<text x="490" y="101" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">all weights go up together</text>
<text x="490" y="114" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">or down together (δ = −0.5 here).</text>
</svg>
<p class="fig-cap">Because sigmoid outputs are positive, a neuron's weight gradients all share the sign of δ. To reach a target that needs one weight up and one down, the path must zig-zag through the two allowed quadrants.</p>
</div>

**[Exam] Quiz 2.** A sigmoid layer whose weights grow so that $a=15$: $\sigma'(15)=\sigma(15)(1-\sigma(15))\approx3.1\times10^{-7}\approx0$. **The neuron has saturated** (not 0.25, which is the maximum, at $a=0$).

### 7.3.3 tanh

$\tanh(a)=2\sigma(2a)-1\in(-1,1)$, $\tanh'(a)=1-\tanh^2(a)$, maximum 1 at $a=0$.
- ✓ **zero-centred** (fixes problem 2), larger maximum gradient than sigmoid.
- ✗ still **saturates** for large $|a|$.

### 7.3.4 ReLU

$$f(a)=\max(0,a),\qquad f'(a)=\begin{cases}1&a>0\\0&a<0\end{cases}$$
- ✓ **no saturation** for $a>0$; gradient passes through unchanged.
- ✓ **cheap** (a comparison), and converges much faster in practice (about 6× in AlexNet's experiments).
- ✗ not zero-centred.
- ✗ **dead neurons:** if a unit's pre-activation is negative for **every** input, its gradient is always 0 and it never recovers.

**[Ex] How a neuron dies.** Inputs in $[0,1]^2$, $\mathbf w=(0.5,0.3)$. After a large update the bias becomes $b=-10$. The largest possible pre-activation is $0.5+0.3-10=-9.2<0$, so the unit outputs 0 and has gradient 0 for every input, forever. Remedies: initialise $b$ to a small positive value (e.g. 0.01), use a smaller learning rate, or use a leaky variant.

**[Exam] Quiz 2.** ReLU unit with $a=15$ for most examples, then a large negative bias update drives $a<0$ for all future inputs: **$f'(a)=0$; the neuron stops updating and may stay "dead" permanently.**

### 7.3.5 Leaky ReLU, Parametric ReLU, ELU

| Name | $f(a)$ | $f'(a)$ for $a<0$ | Note |
|---|---|---|---|
| Leaky ReLU | $\max(0.01a,\,a)$ | 0.01 | never fully dead |
| Parametric ReLU | $\max(\alpha a,\,a)$, $\alpha$ **learned** | $\alpha$ | the slope is a parameter |
| ELU | $a$ if $a>0$, else $\alpha(e^{a}-1)$ | $\alpha e^{a}$ | smooth; outputs mean closer to 0; needs $e^a$ |

**[Exam] Quiz 2 (Leaky ReLU, $\alpha=0.1$).** $w_1=2$, $w_2=-3$, $x_1=4$, $x_2=3$, no bias.

| Line | Calculation | Result |
|---|---|---|
| 1 | $a=2(4)+(-3)(3)$ | **−1** |
| 2 | $f(a)=\max(0.1\times(-1),\,-1)$ | **−0.1** |
| 3 | why Leaky ReLU here | a small non-zero gradient (0.1) flows when $a<0$, avoiding permanently dead neurons |

**[Exam] End-term (PReLU, $\alpha=0.1$).** $\mathbf x=(3,-2)$, $\mathbf w=(0.5,1.5)$, $b=0.5$: $z=1.5-3+0.5=-1$, so $f(z)=0.1\times(-1)=$ **−0.1**.

### 7.3.6 Maxout

A maxout unit takes the **max over $k$ affine functions** of its input:
$$h=\max_{j=1..k}\big(\mathbf w_j^\top\mathbf x+b_j\big).$$
- ReLU is maxout with pieces $(\mathbf w^\top\mathbf x+b)$ and $0$; Leaky ReLU is pieces $(\mathbf w^\top\mathbf x+b)$ and $0.01(\mathbf w^\top\mathbf x+b)$. So maxout **generalises** them, and with enough pieces can approximate any convex function.
- No saturation, no dead units (some piece is always the max and passes gradient).
- Cost: $k$ times the parameters ($k=2$ doubles them).

<div class="fig" role="img" aria-label="Maxout">
<svg viewBox="0 0 700 190" width="700" style="font-family:var(--font)" aria-hidden="true">
<line x1="46" y1="156" x2="306" y2="156" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="112.7" x2="306" y2="112.7" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="69.3" x2="306" y2="69.3" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="26" x2="306" y2="26" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="26" x2="46" y2="156" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="176" y1="26" x2="176" y2="156" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="306" y1="26" x2="306" y2="156" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="26" x2="46" y2="156" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="46" y1="156" x2="306" y2="156" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="46" y="169" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-3</text>
<text x="176" y="169" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="306" y="169" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">3</text>
<text x="40" y="159.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">-2</text>
<text x="40" y="116.2" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="40" y="72.8" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="40" y="29.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="176" y="14" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">maxout: max of k = 3 affine pieces</text>
<polyline points="46,45.5 50.3,48.1 54.7,50.7 59,53.3 63.3,55.9 67.7,58.5 72,61.1 76.3,63.7 80.7,66.3 85,68.9 89.3,71.5 93.7,74.1 98,76.7 102.3,79.3 106.7,81.9 111,84.5 115.3,87.1 119.7,89.7 124,92.3 128.3,94.9 132.7,97.5 137,100.1 141.3,102.7 145.7,105.3 150,107.9 154.3,110.5 158.7,113.1 163,115.7 167.3,118.3 171.7,120.9 176,123.5 180.3,126.1 184.7,128.7 189,131.3 193.3,133.9 197.7,136.5 202,139.1 206.3,141.7 210.7,144.3 215,146.9 219.3,149.5 223.7,152.1 228,154.7" fill="none" style="stroke:var(--blue-ink);stroke-width:1.6;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:5 3;opacity:0.9"/>
<polyline points="46,125.7 50.3,125.2 54.7,124.8 59,124.4 63.3,123.9 67.7,123.5 72,123.1 76.3,122.6 80.7,122.2 85,121.8 89.3,121.3 93.7,120.9 98,120.5 102.3,120 106.7,119.6 111,119.2 115.3,118.7 119.7,118.3 124,117.9 128.3,117.4 132.7,117 137,116.6 141.3,116.1 145.7,115.7 150,115.3 154.3,114.8 158.7,114.4 163,114 167.3,113.5 171.7,113.1 176,112.7 180.3,112.2 184.7,111.8 189,111.4 193.3,110.9 197.7,110.5 202,110.1 206.3,109.6 210.7,109.2 215,108.8 219.3,108.3 223.7,107.9 228,107.5 232.3,107 236.7,106.6 241,106.2 245.3,105.7 249.7,105.3 254,104.9 258.3,104.4 262.7,104 267,103.6 271.3,103.1 275.7,102.7 280,102.3 284.3,101.8 288.7,101.4 293,101 297.3,100.5 301.7,100.1 306,99.7" fill="none" style="stroke:var(--yellow-ink);stroke-width:1.6;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:5 3;opacity:0.9"/>
<polyline points="124,154.7 128.3,152.1 132.7,149.5 137,146.9 141.3,144.3 145.7,141.7 150,139.1 154.3,136.5 158.7,133.9 163,131.3 167.3,128.7 171.7,126.1 176,123.5 180.3,120.9 184.7,118.3 189,115.7 193.3,113.1 197.7,110.5 202,107.9 206.3,105.3 210.7,102.7 215,100.1 219.3,97.5 223.7,94.9 228,92.3 232.3,89.7 236.7,87.1 241,84.5 245.3,81.9 249.7,79.3 254,76.7 258.3,74.1 262.7,71.5 267,68.9 271.3,66.3 275.7,63.7 280,61.1 284.3,58.5 288.7,55.9 293,53.3 297.3,50.7 301.7,48.1 306,45.5" fill="none" style="stroke:var(--red-ink);stroke-width:1.6;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:5 3;opacity:0.9"/>
<polyline points="46,45.5 47.3,46.3 48.6,47.1 49.9,47.8 51.2,48.6 52.5,49.4 53.8,50.2 55.1,51 56.4,51.7 57.7,52.5 59,53.3 60.3,54.1 61.6,54.9 62.9,55.6 64.2,56.4 65.5,57.2 66.8,58 68.1,58.8 69.4,59.5 70.7,60.3 72,61.1 73.3,61.9 74.6,62.7 75.9,63.4 77.2,64.2 78.5,65 79.8,65.8 81.1,66.6 82.4,67.3 83.7,68.1 85,68.9 86.3,69.7 87.6,70.5 88.9,71.2 90.2,72 91.5,72.8 92.8,73.6 94.1,74.4 95.4,75.1 96.7,75.9 98,76.7 99.3,77.5 100.6,78.3 101.9,79 103.2,79.8 104.5,80.6 105.8,81.4 107.1,82.2 108.4,82.9 109.7,83.7 111,84.5 112.3,85.3 113.6,86.1 114.9,86.8 116.2,87.6 117.5,88.4 118.8,89.2 120.1,90 121.4,90.7 122.7,91.5 124,92.3 125.3,93.1 126.6,93.9 127.9,94.6 129.2,95.4 130.5,96.2 131.8,97 133.1,97.8 134.4,98.5 135.7,99.3 137,100.1 138.3,100.9 139.6,101.7 140.9,102.4 142.2,103.2 143.5,104 144.8,104.8 146.1,105.6 147.4,106.3 148.7,107.1 150,107.9 151.3,108.7 152.6,109.5 153.9,110.2 155.2,111 156.5,111.8 157.8,112.6 159.1,113.4 160.4,114.1 161.7,114.1 163,114 164.3,113.8 165.6,113.7 166.9,113.6 168.2,113.4 169.5,113.3 170.8,113.2 172.1,113.1 173.4,112.9 174.7,112.8 176,112.7 177.3,112.5 178.6,112.4 179.9,112.3 181.2,112.1 182.5,112 183.8,111.9 185.1,111.8 186.4,111.6 187.7,111.5 189,111.4 190.3,111.2 191.6,111.1 192.9,111 194.2,110.8 195.5,110.7 196.8,110.6 198.1,110.2 199.4,109.5 200.7,108.7 202,107.9 203.3,107.1 204.6,106.3 205.9,105.6 207.2,104.8 208.5,104 209.8,103.2 211.1,102.4 212.4,101.7 213.7,100.9 215,100.1 216.3,99.3 217.6,98.5 218.9,97.8 220.2,97 221.5,96.2 222.8,95.4 224.1,94.6 225.4,93.9 226.7,93.1 228,92.3 229.3,91.5 230.6,90.7 231.9,90 233.2,89.2 234.5,88.4 235.8,87.6 237.1,86.8 238.4,86.1 239.7,85.3 241,84.5 242.3,83.7 243.6,82.9 244.9,82.2 246.2,81.4 247.5,80.6 248.8,79.8 250.1,79 251.4,78.3 252.7,77.5 254,76.7 255.3,75.9 256.6,75.1 257.9,74.4 259.2,73.6 260.5,72.8 261.8,72 263.1,71.2 264.4,70.5 265.7,69.7 267,68.9 268.3,68.1 269.6,67.3 270.9,66.6 272.2,65.8 273.5,65 274.8,64.2 276.1,63.4 277.4,62.7 278.7,61.9 280,61.1 281.3,60.3 282.6,59.5 283.9,58.8 285.2,58 286.5,57.2 287.8,56.4 289.1,55.6 290.4,54.9 291.7,54.1 293,53.3 294.3,52.5 295.6,51.7 296.9,51 298.2,50.2 299.5,49.4 300.8,48.6 302.1,47.8 303.4,47.1 304.7,46.3 306,45.5" fill="none" style="stroke:var(--fg);stroke-width:3;stroke-linejoin:round;stroke-linecap:round"/>
<text x="301.7" y="41.2" text-anchor="end" style="fill:var(--fg);font-size:10.5px;font-weight:700">convex, no dead zone</text>
<line x1="420" y1="156" x2="670" y2="156" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="420" y1="123.5" x2="670" y2="123.5" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="420" y1="91" x2="670" y2="91" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="420" y1="58.5" x2="670" y2="58.5" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="420" y1="26" x2="670" y2="26" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="420" y1="26" x2="420" y2="156" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="545" y1="26" x2="545" y2="156" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="670" y1="26" x2="670" y2="156" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="420" y1="26" x2="420" y2="156" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="420" y1="156" x2="670" y2="156" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="420" y="169" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-3</text>
<text x="545" y="169" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="670" y="169" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">3</text>
<text x="414" y="159.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">-1</text>
<text x="414" y="127" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="414" y="94.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="414" y="62" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="414" y="29.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">3</text>
<text x="545" y="14" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">ReLU and Leaky ReLU are special cases</text>
<polyline points="420,133.3 426.3,132.8 432.5,132.3 438.8,131.8 445,131.3 451.3,130.8 457.5,130.3 463.8,129.8 470,129.4 476.3,128.9 482.5,128.4 488.8,127.9 495,127.4 501.3,126.9 507.5,126.4 513.8,125.9 520,125.5 526.3,125 532.5,124.5 538.8,124 545,123.5 551.3,123 557.5,122.5 563.8,122 570,121.6 576.3,121.1 582.5,120.6 588.8,120.1 595,119.6 601.3,119.1 607.5,118.6 613.8,118.1 620,117.7 626.3,117.2 632.5,116.7 638.8,116.2 645,115.7 651.3,115.2 657.5,114.7 663.8,114.2 670,113.8" fill="none" style="stroke:var(--line-strong);stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:5 3"/>
<polyline points="507.5,152.8 513.8,147.9 520,143 526.3,138.1 532.5,133.3 538.8,128.4 545,123.5 551.3,118.6 557.5,113.8 563.8,108.9 570,104 576.3,99.1 582.5,94.3 588.8,89.4 595,84.5 601.3,79.6 607.5,74.8 613.8,69.9 620,65 626.3,60.1 632.5,55.3 638.8,50.4 645,45.5 651.3,40.6 657.5,35.8 663.8,30.9 670,26" fill="none" style="stroke:var(--line-strong);stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:5 3"/>
<polyline points="420,133.3 422.5,133.1 425,132.9 427.5,132.7 430,132.5 432.5,132.3 435,132.1 437.5,131.9 440,131.7 442.5,131.5 445,131.3 447.5,131.1 450,130.9 452.5,130.7 455,130.5 457.5,130.3 460,130.1 462.5,129.9 465,129.7 467.5,129.5 470,129.4 472.5,129.2 475,129 477.5,128.8 480,128.6 482.5,128.4 485,128.2 487.5,128 490,127.8 492.5,127.6 495,127.4 497.5,127.2 500,127 502.5,126.8 505,126.6 507.5,126.4 510,126.2 512.5,126 515,125.8 517.5,125.6 520,125.5 522.5,125.3 525,125.1 527.5,124.9 530,124.7 532.5,124.5 535,124.3 537.5,124.1 540,123.9 542.5,123.7 545,123.5 547.5,121.6 550,119.6 552.5,117.7 555,115.7 557.5,113.8 560,111.8 562.5,109.9 565,107.9 567.5,106 570,104 572.5,102.1 575,100.1 577.5,98.2 580,96.2 582.5,94.3 585,92.3 587.5,90.4 590,88.4 592.5,86.5 595,84.5 597.5,82.6 600,80.6 602.5,78.7 605,76.7 607.5,74.8 610,72.8 612.5,70.9 615,68.9 617.5,66.9 620,65 622.5,63 625,61.1 627.5,59.1 630,57.2 632.5,55.3 635,53.3 637.5,51.4 640,49.4 642.5,47.5 645,45.5 647.5,43.6 650,41.6 652.5,39.6 655,37.7 657.5,35.8 660,33.8 662.5,31.8 665,29.9 667.5,27.9 670,26" fill="none" style="stroke:var(--blue-ink);stroke-width:2.8;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:6 3"/>
<polyline points="420,123.5 422.5,123.5 425,123.5 427.5,123.5 430,123.5 432.5,123.5 435,123.5 437.5,123.5 440,123.5 442.5,123.5 445,123.5 447.5,123.5 450,123.5 452.5,123.5 455,123.5 457.5,123.5 460,123.5 462.5,123.5 465,123.5 467.5,123.5 470,123.5 472.5,123.5 475,123.5 477.5,123.5 480,123.5 482.5,123.5 485,123.5 487.5,123.5 490,123.5 492.5,123.5 495,123.5 497.5,123.5 500,123.5 502.5,123.5 505,123.5 507.5,123.5 510,123.5 512.5,123.5 515,123.5 517.5,123.5 520,123.5 522.5,123.5 525,123.5 527.5,123.5 530,123.5 532.5,123.5 535,123.5 537.5,123.5 540,123.5 542.5,123.5 545,123.5 547.5,121.6 550,119.6 552.5,117.7 555,115.7 557.5,113.8 560,111.8 562.5,109.9 565,107.9 567.5,106 570,104 572.5,102.1 575,100.1 577.5,98.2 580,96.2 582.5,94.3 585,92.3 587.5,90.4 590,88.4 592.5,86.5 595,84.5 597.5,82.6 600,80.6 602.5,78.7 605,76.7 607.5,74.8 610,72.8 612.5,70.9 615,68.9 617.5,66.9 620,65 622.5,63 625,61.1 627.5,59.1 630,57.2 632.5,55.3 635,53.3 637.5,51.4 640,49.4 642.5,47.5 645,45.5 647.5,43.6 650,41.6 652.5,39.6 655,37.7 657.5,35.8 660,33.8 662.5,31.8 665,29.9 667.5,27.9 670,26" fill="none" style="stroke:var(--green-ink);stroke-width:2.8;stroke-linejoin:round;stroke-linecap:round"/>
<text x="540.8" y="45.5" text-anchor="end" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">ReLU = max(0, x)</text>
<text x="540.8" y="61.8" text-anchor="end" style="fill:var(--blue-ink);font-size:10.5px;font-weight:700">Leaky = max(0.1x, x)</text>
</svg>
<p class="fig-cap">A maxout unit takes the largest of k linear pieces, so it can model any convex shape. ReLU is the two-piece case (0 and x). Gradient flows only through the winning piece.</p>
</div>
- **Gradient flows only through the winning piece**; the losing pieces get 0 for that example.

**[Exam] End-term (ReLU vs maxout).** 2 inputs, 2 hidden units, linear output with weights $(1,1)$, all biases 0, $\mathbf x=(1,2)$.

| Line | Scenario A: ReLU, $W=\begin{bmatrix}1&-2\\-1&1\end{bmatrix}$ | Result |
|---|---|---|
| 1 | $W\mathbf x=(1-4,\ -1+2)$ | $(-3,\ 1)$ |
| 2 | ReLU | $(0,\ 1)$ |
| 3 | $\hat y_A=0+1$ | **1** |
| 4 | $\nabla_{w_{11}}\mathcal L$: unit 1 has $a=-3<0$, so ReLU$'=0$ | **0** |

| Line | Scenario B: maxout, unit 1 pieces $G^{(1)}=\begin{bmatrix}1&-2\\-1&1\end{bmatrix}$, unit 2 pieces $G^{(2)}=\begin{bmatrix}-1&2\\1&-1\end{bmatrix}$ | Result |
|---|---|---|
| 5 | unit 1: $\max(1-4,\ -1+2)=\max(-3,1)$ | 1 |
| 6 | unit 2: $\max(-1+4,\ 1-2)=\max(3,-1)$ | 3 |
| 7 | $\hat y_B=1+3$ | **4** |
| 8 | does maxout unit 1 get a gradient? | **Yes**: through its winning piece $(-1,1)$, even though it sees the same pre-activations that killed ReLU unit 1 |

### 7.3.7 All activations at a glance

| $a$ | −2 | 0 | 2 |
|---|---|---|---|
| sigmoid $\sigma(a)$ | 0.119 | 0.5 | 0.881 |
| $\sigma'(a)$ | 0.105 | **0.25** | 0.105 |
| tanh | −0.964 | 0 | 0.964 |
| $\tanh'$ | 0.071 | **1** | 0.071 |
| ReLU | 0 | 0 | 2 |
| Leaky ReLU (0.01) | −0.02 | 0 | 2 |
| ELU ($\alpha=1$) | −0.865 | 0 | 2 |

| Activation | Zero-centred | Saturates | Dead units | Cost |
|---|---|---|---|---|
| sigmoid | ✗ | ✓ (both sides) | ✗ | exp |
| tanh | ✓ | ✓ (both sides) | ✗ | exp |
| ReLU | ✗ | ✗ (for $a>0$) | ✓ | cheapest |
| Leaky / PReLU | ≈ | ✗ | ✗ | cheap |
| ELU | ≈ (mean near 0) | only toward $-\alpha$ | ✗ | exp |
| maxout | depends | ✗ | ✗ | $k\times$ params |

(Good to know beyond the course list: modern transformers often use **GELU** $a\,\Phi(a)$ and **SiLU/Swish** $a\,\sigma(a)$, smooth ReLU-like curves.)

<div class="fig" role="img" aria-label="Activation functions and their derivatives">
<svg viewBox="0 0 700 182" width="700" style="font-family:var(--font)" aria-hidden="true">
<line x1="34" y1="30" x2="34" y2="122" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="34" y1="122" x2="138" y2="122" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="34" y="135" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-4</text>
<text x="86" y="135" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="138" y="135" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="28" y="117.8" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="28" y="41.2" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="86" y="18" text-anchor="middle" style="fill:var(--fg);font-size:11.5px;font-weight:700">sigmoid</text>
<line x1="34" y1="114.3" x2="138" y2="114.3" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="86" y1="30" x2="86" y2="122" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<polyline points="34,113 34.7,112.9 35.3,112.8 35.9,112.8 36.6,112.7 37.3,112.6 37.9,112.5 38.6,112.4 39.2,112.3 39.9,112.3 40.5,112.2 41.2,112 41.8,111.9 42.5,111.8 43.1,111.7 43.8,111.6 44.4,111.4 45.1,111.3 45.7,111.2 46.4,111 47,110.9 47.7,110.7 48.3,110.5 49,110.4 49.6,110.2 50.3,110 50.9,109.8 51.6,109.6 52.2,109.4 52.9,109.2 53.5,109 54.2,108.7 54.8,108.5 55.5,108.2 56.1,108 56.8,107.7 57.4,107.4 58.1,107.2 58.7,106.9 59.4,106.6 60,106.3 60.7,106 61.3,105.7 62,105.3 62.6,105 63.3,104.7 63.9,104.3 64.6,104 65.2,103.6 65.9,103.3 66.5,102.9 67.2,102.5 67.8,102.2 68.4,101.8 69.1,101.4 69.8,101.1 70.4,100.7 71.1,100.3 71.7,100 72.4,99.6 73,99.3 73.7,98.9 74.3,98.6 74.9,98.3 75.6,97.9 76.3,97.6 76.9,97.3 77.6,97.1 78.2,96.8 78.9,96.5 79.5,96.3 80.2,96.1 80.8,95.9 81.4,95.7 82.1,95.6 82.8,95.5 83.4,95.4 84.1,95.3 84.7,95.2 85.4,95.2 86,95.2 86.7,95.2 87.3,95.2 88,95.3 88.6,95.4 89.3,95.5 89.9,95.6 90.6,95.7 91.2,95.9 91.9,96.1 92.5,96.3 93.2,96.5 93.8,96.8 94.5,97.1 95.1,97.3 95.8,97.6 96.4,97.9 97.1,98.3 97.7,98.6 98.4,98.9 99,99.3 99.6,99.6 100.3,100 101,100.3 101.6,100.7 102.3,101.1 102.9,101.4 103.6,101.8 104.2,102.2 104.9,102.5 105.5,102.9 106.2,103.3 106.8,103.6 107.5,104 108.1,104.3 108.8,104.7 109.4,105 110.1,105.3 110.7,105.7 111.4,106 112,106.3 112.7,106.6 113.3,106.9 114,107.2 114.6,107.4 115.3,107.7 115.9,108 116.6,108.2 117.2,108.5 117.9,108.7 118.5,109 119.2,109.2 119.8,109.4 120.5,109.6 121.1,109.8 121.8,110 122.4,110.2 123.1,110.4 123.7,110.5 124.4,110.7 125,110.9 125.7,111 126.3,111.2 127,111.3 127.6,111.4 128.3,111.6 128.9,111.7 129.6,111.8 130.2,111.9 130.9,112 131.5,112.2 132.1,112.3 132.8,112.3 133.5,112.4 134.1,112.5 134.8,112.6 135.4,112.7 136.1,112.8 136.7,112.8 137.4,112.9 138,113" fill="none" style="stroke:var(--red-ink);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:4 3"/>
<polyline points="34,113 34.7,112.9 35.3,112.8 35.9,112.7 36.6,112.7 37.3,112.6 37.9,112.5 38.6,112.4 39.2,112.3 39.9,112.2 40.5,112.1 41.2,112 41.8,111.9 42.5,111.7 43.1,111.6 43.8,111.5 44.4,111.3 45.1,111.2 45.7,111 46.4,110.9 47,110.7 47.7,110.5 48.3,110.3 49,110.1 49.6,109.9 50.3,109.7 50.9,109.5 51.6,109.3 52.2,109 52.9,108.8 53.5,108.5 54.2,108.2 54.8,108 55.5,107.7 56.1,107.3 56.8,107 57.4,106.7 58.1,106.3 58.7,106 59.4,105.6 60,105.2 60.7,104.8 61.3,104.4 62,103.9 62.6,103.5 63.3,103 63.9,102.5 64.6,102 65.2,101.5 65.9,100.9 66.5,100.3 67.2,99.8 67.8,99.2 68.4,98.5 69.1,97.9 69.8,97.3 70.4,96.6 71.1,95.9 71.7,95.2 72.4,94.5 73,93.7 73.7,93 74.3,92.2 74.9,91.4 75.6,90.6 76.3,89.7 76.9,88.9 77.6,88 78.2,87.2 78.9,86.3 79.5,85.4 80.2,84.5 80.8,83.6 81.4,82.6 82.1,81.7 82.8,80.8 83.4,79.8 84.1,78.9 84.7,77.9 85.4,77 86,76 86.7,75 87.3,74.1 88,73.1 88.6,72.2 89.3,71.2 89.9,70.3 90.6,69.4 91.2,68.4 91.9,67.5 92.5,66.6 93.2,65.7 93.8,64.8 94.5,64 95.1,63.1 95.8,62.3 96.4,61.4 97.1,60.6 97.7,59.8 98.4,59 99,58.3 99.6,57.5 100.3,56.8 101,56.1 101.6,55.4 102.3,54.7 102.9,54.1 103.6,53.5 104.2,52.8 104.9,52.2 105.5,51.7 106.2,51.1 106.8,50.5 107.5,50 108.1,49.5 108.8,49 109.4,48.5 110.1,48.1 110.7,47.6 111.4,47.2 112,46.8 112.7,46.4 113.3,46 114,45.7 114.6,45.3 115.3,45 115.9,44.7 116.6,44.3 117.2,44 117.9,43.8 118.5,43.5 119.2,43.2 119.8,43 120.5,42.7 121.1,42.5 121.8,42.3 122.4,42.1 123.1,41.9 123.7,41.7 124.4,41.5 125,41.3 125.7,41.1 126.3,41 127,40.8 127.6,40.7 128.3,40.5 128.9,40.4 129.6,40.3 130.2,40.1 130.9,40 131.5,39.9 132.1,39.8 132.8,39.7 133.5,39.6 134.1,39.5 134.8,39.4 135.4,39.3 136.1,39.3 136.7,39.2 137.4,39.1 138,39" fill="none" style="stroke:var(--blue-ink);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round"/>
<text x="86" y="152" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">saturates · not 0-centred</text>
<line x1="170" y1="30" x2="170" y2="122" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="170" y1="122" x2="274" y2="122" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="170" y="135" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-4</text>
<text x="222" y="135" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="274" y="135" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="164" y="117.8" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">-1</text>
<text x="164" y="79.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="164" y="41.2" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="222" y="18" text-anchor="middle" style="fill:var(--fg);font-size:11.5px;font-weight:700">tanh</text>
<line x1="170" y1="76" x2="274" y2="76" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="222" y1="30" x2="222" y2="122" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<polyline points="170,75.9 170.7,75.9 171.3,75.9 172,75.9 172.6,75.9 173.3,75.9 173.9,75.9 174.6,75.9 175.2,75.9 175.9,75.9 176.5,75.9 177.2,75.8 177.8,75.8 178.5,75.8 179.1,75.8 179.8,75.8 180.4,75.7 181.1,75.7 181.7,75.7 182.4,75.7 183,75.6 183.7,75.6 184.3,75.5 185,75.5 185.6,75.4 186.3,75.4 186.9,75.3 187.6,75.2 188.2,75.2 188.9,75.1 189.5,75 190.2,74.9 190.8,74.8 191.5,74.6 192.1,74.5 192.8,74.3 193.4,74.2 194.1,74 194.7,73.8 195.4,73.5 196,73.3 196.7,73 197.3,72.7 198,72.4 198.6,72 199.3,71.6 199.9,71.2 200.6,70.7 201.2,70.2 201.9,69.7 202.5,69.1 203.2,68.4 203.8,67.7 204.5,67 205.1,66.1 205.8,65.3 206.4,64.3 207.1,63.3 207.7,62.2 208.4,61.1 209,59.9 209.7,58.6 210.3,57.3 211,56 211.6,54.6 212.3,53.1 212.9,51.7 213.6,50.2 214.2,48.7 214.9,47.3 215.5,45.9 216.2,44.5 216.8,43.2 217.5,42 218.1,40.9 218.8,40 219.4,39.2 220.1,38.5 220.7,38 221.4,37.8 222,37.7 222.7,37.8 223.3,38 224,38.5 224.6,39.2 225.3,40 225.9,40.9 226.6,42 227.2,43.2 227.9,44.5 228.5,45.9 229.2,47.3 229.8,48.7 230.5,50.2 231.1,51.7 231.8,53.1 232.4,54.6 233.1,56 233.7,57.3 234.4,58.6 235,59.9 235.7,61.1 236.3,62.2 237,63.3 237.6,64.3 238.3,65.3 238.9,66.1 239.6,67 240.2,67.7 240.9,68.4 241.5,69.1 242.2,69.7 242.8,70.2 243.5,70.7 244.1,71.2 244.8,71.6 245.4,72 246.1,72.4 246.7,72.7 247.4,73 248,73.3 248.7,73.5 249.3,73.8 250,74 250.6,74.2 251.3,74.3 251.9,74.5 252.6,74.6 253.2,74.8 253.9,74.9 254.5,75 255.2,75.1 255.8,75.2 256.5,75.2 257.1,75.3 257.8,75.4 258.4,75.4 259.1,75.5 259.7,75.5 260.4,75.6 261,75.6 261.7,75.7 262.3,75.7 263,75.7 263.6,75.7 264.3,75.8 264.9,75.8 265.6,75.8 266.2,75.8 266.9,75.8 267.5,75.9 268.2,75.9 268.8,75.9 269.5,75.9 270.1,75.9 270.8,75.9 271.4,75.9 272.1,75.9 272.7,75.9 273.4,75.9 274,75.9" fill="none" style="stroke:var(--red-ink);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:4 3"/>
<polyline points="170,114.3 170.7,114.3 171.3,114.3 172,114.3 172.6,114.3 173.3,114.3 173.9,114.3 174.6,114.3 175.2,114.3 175.9,114.3 176.5,114.3 177.2,114.3 177.8,114.2 178.5,114.2 179.1,114.2 179.8,114.2 180.4,114.2 181.1,114.2 181.7,114.2 182.4,114.2 183,114.1 183.7,114.1 184.3,114.1 185,114.1 185.6,114.1 186.3,114 186.9,114 187.6,114 188.2,113.9 188.9,113.9 189.5,113.8 190.2,113.8 190.8,113.7 191.5,113.6 192.1,113.6 192.8,113.5 193.4,113.4 194.1,113.3 194.7,113.2 195.4,113.1 196,113 196.7,112.8 197.3,112.7 198,112.5 198.6,112.3 199.3,112.1 199.9,111.9 200.6,111.6 201.2,111.3 201.9,111 202.5,110.7 203.2,110.3 203.8,109.9 204.5,109.5 205.1,109 205.8,108.5 206.4,108 207.1,107.3 207.7,106.7 208.4,106 209,105.2 209.7,104.4 210.3,103.5 211,102.5 211.6,101.5 212.3,100.3 212.9,99.2 213.6,97.9 214.2,96.6 214.9,95.2 215.5,93.7 216.2,92.2 216.8,90.6 217.5,88.9 218.1,87.2 218.8,85.4 219.4,83.6 220.1,81.7 220.7,79.8 221.4,77.9 222,76 222.7,74.1 223.3,72.2 224,70.3 224.6,68.4 225.3,66.6 225.9,64.8 226.6,63.1 227.2,61.4 227.9,59.8 228.5,58.3 229.2,56.8 229.8,55.4 230.5,54.1 231.1,52.8 231.8,51.7 232.4,50.5 233.1,49.5 233.7,48.5 234.4,47.6 235,46.8 235.7,46 236.3,45.3 237,44.7 237.6,44 238.3,43.5 238.9,43 239.6,42.5 240.2,42.1 240.9,41.7 241.5,41.3 242.2,41 242.8,40.7 243.5,40.4 244.1,40.1 244.8,39.9 245.4,39.7 246.1,39.5 246.7,39.3 247.4,39.2 248,39 248.7,38.9 249.3,38.8 250,38.7 250.6,38.6 251.3,38.5 251.9,38.4 252.6,38.4 253.2,38.3 253.9,38.2 254.5,38.2 255.2,38.1 255.8,38.1 256.5,38 257.1,38 257.8,38 258.4,37.9 259.1,37.9 259.7,37.9 260.4,37.9 261,37.9 261.7,37.8 262.3,37.8 263,37.8 263.6,37.8 264.3,37.8 264.9,37.8 265.6,37.8 266.2,37.8 266.9,37.7 267.5,37.7 268.2,37.7 268.8,37.7 269.5,37.7 270.1,37.7 270.8,37.7 271.4,37.7 272.1,37.7 272.7,37.7 273.4,37.7 274,37.7" fill="none" style="stroke:var(--blue-ink);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round"/>
<text x="222" y="152" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">zero-centred · saturates</text>
<line x1="306" y1="30" x2="306" y2="122" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="306" y1="122" x2="410" y2="122" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="306" y="135" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-4</text>
<text x="358" y="135" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="410" y="135" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="300" y="113.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="300" y="73.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="300" y="33.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="358" y="18" text-anchor="middle" style="fill:var(--fg);font-size:11.5px;font-weight:700">ReLU</text>
<line x1="306" y1="110" x2="410" y2="110" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="358" y1="30" x2="358" y2="122" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<polyline points="306,110 306.7,110 307.3,110 308,110 308.6,110 309.3,110 309.9,110 310.6,110 311.2,110 311.9,110 312.5,110 313.2,110 313.8,110 314.5,110 315.1,110 315.8,110 316.4,110 317.1,110 317.7,110 318.4,110 319,110 319.7,110 320.3,110 321,110 321.6,110 322.3,110 322.9,110 323.6,110 324.2,110 324.9,110 325.5,110 326.2,110 326.8,110 327.5,110 328.1,110 328.8,110 329.4,110 330.1,110 330.7,110 331.4,110 332,110 332.7,110 333.3,110 334,110 334.6,110 335.3,110 335.9,110 336.6,110 337.2,110 337.9,110 338.5,110 339.2,110 339.8,110 340.5,110 341.1,110 341.8,110 342.4,110 343.1,110 343.7,110 344.4,110 345,110 345.7,110 346.3,110 347,110 347.6,110 348.3,110 348.9,110 349.6,110 350.2,110 350.9,110 351.5,110 352.2,110 352.8,110 353.5,110 354.1,110 354.8,110 355.4,110 356.1,110 356.7,110 357.4,110 358,110 358.7,90 359.3,90 360,90 360.6,90 361.3,90 361.9,90 362.6,90 363.2,90 363.9,90 364.5,90 365.2,90 365.8,90 366.5,90 367.1,90 367.8,90 368.4,90 369.1,90 369.7,90 370.4,90 371,90 371.7,90 372.3,90 373,90 373.6,90 374.3,90 374.9,90 375.6,90 376.2,90 376.9,90 377.5,90 378.2,90 378.8,90 379.5,90 380.1,90 380.8,90 381.4,90 382.1,90 382.7,90 383.4,90 384,90 384.7,90 385.3,90 386,90 386.6,90 387.3,90 387.9,90 388.6,90 389.2,90 389.9,90 390.5,90 391.2,90 391.8,90 392.5,90 393.1,90 393.8,90 394.4,90 395.1,90 395.7,90 396.4,90 397,90 397.7,90 398.3,90 399,90 399.6,90 400.3,90 400.9,90 401.6,90 402.2,90 402.9,90 403.5,90 404.2,90 404.8,90 405.5,90 406.1,90 406.8,90 407.4,90 408.1,90 408.7,90 409.4,90 410,90" fill="none" style="stroke:var(--red-ink);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:4 3"/>
<polyline points="306,110 306.7,110 307.3,110 308,110 308.6,110 309.3,110 309.9,110 310.6,110 311.2,110 311.9,110 312.5,110 313.2,110 313.8,110 314.5,110 315.1,110 315.8,110 316.4,110 317.1,110 317.7,110 318.4,110 319,110 319.7,110 320.3,110 321,110 321.6,110 322.3,110 322.9,110 323.6,110 324.2,110 324.9,110 325.5,110 326.2,110 326.8,110 327.5,110 328.1,110 328.8,110 329.4,110 330.1,110 330.7,110 331.4,110 332,110 332.7,110 333.3,110 334,110 334.6,110 335.3,110 335.9,110 336.6,110 337.2,110 337.9,110 338.5,110 339.2,110 339.8,110 340.5,110 341.1,110 341.8,110 342.4,110 343.1,110 343.7,110 344.4,110 345,110 345.7,110 346.3,110 347,110 347.6,110 348.3,110 348.9,110 349.6,110 350.2,110 350.9,110 351.5,110 352.2,110 352.8,110 353.5,110 354.1,110 354.8,110 355.4,110 356.1,110 356.7,110 357.4,110 358,110 358.7,109 359.3,108 360,107 360.6,106 361.3,105 361.9,104 362.6,103 363.2,102 363.9,101 364.5,100 365.2,99 365.8,98 366.5,97 367.1,96 367.8,95 368.4,94 369.1,93 369.7,92 370.4,91 371,90 371.7,89 372.3,88 373,87 373.6,86 374.3,85 374.9,84 375.6,83 376.2,82 376.9,81 377.5,80 378.2,79 378.8,78 379.5,77 380.1,76 380.8,75 381.4,74 382.1,73 382.7,72 383.4,71 384,70 384.7,69 385.3,68 386,67 386.6,66 387.3,65 387.9,64 388.6,63 389.2,62 389.9,61 390.5,60 391.2,59 391.8,58 392.5,57 393.1,56 393.8,55 394.4,54 395.1,53 395.7,52 396.4,51 397,50 397.7,49 398.3,48 399,47 399.6,46 400.3,45 400.9,44 401.6,43 402.2,42 402.9,41 403.5,40 404.2,39 404.8,38 405.5,37 406.1,36 406.8,35 407.4,34 408.1,33 408.7,32 409.4,31 410,30" fill="none" style="stroke:var(--blue-ink);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round"/>
<text x="358" y="152" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">no saturation · can die</text>
<line x1="442" y1="30" x2="442" y2="122" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="442" y1="122" x2="546" y2="122" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="442" y="135" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-4</text>
<text x="494" y="135" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="546" y="135" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="436" y="110.2" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="436" y="71.8" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="436" y="33.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="494" y="18" text-anchor="middle" style="fill:var(--fg);font-size:11.5px;font-weight:700">Leaky (0.1)</text>
<line x1="442" y1="106.7" x2="546" y2="106.7" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="494" y1="30" x2="494" y2="122" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<polyline points="442,104.8 442.7,104.8 443.3,104.8 444,104.8 444.6,104.8 445.3,104.8 445.9,104.8 446.6,104.8 447.2,104.8 447.9,104.8 448.5,104.8 449.2,104.8 449.8,104.8 450.5,104.8 451.1,104.8 451.8,104.8 452.4,104.8 453.1,104.8 453.7,104.8 454.4,104.8 455,104.8 455.7,104.8 456.3,104.8 457,104.8 457.6,104.8 458.3,104.8 458.9,104.8 459.6,104.8 460.2,104.8 460.9,104.8 461.5,104.8 462.2,104.8 462.8,104.8 463.5,104.8 464.1,104.8 464.8,104.8 465.4,104.8 466.1,104.8 466.7,104.8 467.4,104.8 468,104.8 468.7,104.8 469.3,104.8 470,104.8 470.6,104.8 471.3,104.8 471.9,104.8 472.6,104.8 473.2,104.8 473.9,104.8 474.5,104.8 475.2,104.8 475.8,104.8 476.5,104.8 477.1,104.8 477.8,104.8 478.4,104.8 479.1,104.8 479.7,104.8 480.4,104.8 481,104.8 481.7,104.8 482.3,104.8 483,104.8 483.6,104.8 484.3,104.8 484.9,104.8 485.6,104.8 486.2,104.8 486.9,104.8 487.5,104.8 488.2,104.8 488.8,104.8 489.5,104.8 490.1,104.8 490.8,104.8 491.4,104.8 492.1,104.8 492.7,104.8 493.4,104.8 494,104.8 494.7,87.5 495.3,87.5 496,87.5 496.6,87.5 497.3,87.5 497.9,87.5 498.6,87.5 499.2,87.5 499.9,87.5 500.5,87.5 501.2,87.5 501.8,87.5 502.5,87.5 503.1,87.5 503.8,87.5 504.4,87.5 505.1,87.5 505.7,87.5 506.4,87.5 507,87.5 507.7,87.5 508.3,87.5 509,87.5 509.6,87.5 510.3,87.5 510.9,87.5 511.6,87.5 512.2,87.5 512.9,87.5 513.5,87.5 514.2,87.5 514.8,87.5 515.5,87.5 516.1,87.5 516.8,87.5 517.4,87.5 518.1,87.5 518.7,87.5 519.4,87.5 520,87.5 520.7,87.5 521.3,87.5 522,87.5 522.6,87.5 523.3,87.5 523.9,87.5 524.6,87.5 525.2,87.5 525.9,87.5 526.5,87.5 527.2,87.5 527.8,87.5 528.5,87.5 529.1,87.5 529.8,87.5 530.4,87.5 531.1,87.5 531.7,87.5 532.4,87.5 533,87.5 533.7,87.5 534.3,87.5 535,87.5 535.6,87.5 536.3,87.5 536.9,87.5 537.6,87.5 538.2,87.5 538.9,87.5 539.5,87.5 540.2,87.5 540.8,87.5 541.5,87.5 542.1,87.5 542.8,87.5 543.4,87.5 544.1,87.5 544.7,87.5 545.4,87.5 546,87.5" fill="none" style="stroke:var(--red-ink);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:4 3"/>
<polyline points="442,114.3 442.7,114.2 443.3,114.1 444,114 444.6,114 445.3,113.9 445.9,113.8 446.6,113.7 447.2,113.6 447.9,113.5 448.5,113.4 449.2,113.3 449.8,113.2 450.5,113.1 451.1,113 451.8,112.9 452.4,112.8 453.1,112.7 453.7,112.6 454.4,112.5 455,112.4 455.7,112.3 456.3,112.2 457,112.1 457.6,112 458.3,111.9 458.9,111.8 459.6,111.7 460.2,111.7 460.9,111.6 461.5,111.5 462.2,111.4 462.8,111.3 463.5,111.2 464.1,111.1 464.8,111 465.4,110.9 466.1,110.8 466.7,110.7 467.4,110.6 468,110.5 468.7,110.4 469.3,110.3 470,110.2 470.6,110.1 471.3,110 471.9,109.9 472.6,109.8 473.2,109.7 473.9,109.6 474.5,109.5 475.2,109.4 475.8,109.4 476.5,109.3 477.1,109.2 477.8,109.1 478.4,109 479.1,108.9 479.7,108.8 480.4,108.7 481,108.6 481.7,108.5 482.3,108.4 483,108.3 483.6,108.2 484.3,108.1 484.9,108 485.6,107.9 486.2,107.8 486.9,107.7 487.5,107.6 488.2,107.5 488.8,107.4 489.5,107.3 490.1,107.2 490.8,107.1 491.4,107.1 492.1,107 492.7,106.9 493.4,106.8 494,106.7 494.7,105.7 495.3,104.8 496,103.8 496.6,102.8 497.3,101.9 497.9,100.9 498.6,100 499.2,99 499.9,98 500.5,97.1 501.2,96.1 501.8,95.2 502.5,94.2 503.1,93.3 503.8,92.3 504.4,91.3 505.1,90.4 505.7,89.4 506.4,88.5 507,87.5 507.7,86.5 508.3,85.6 509,84.6 509.6,83.7 510.3,82.7 510.9,81.8 511.6,80.8 512.2,79.8 512.9,78.9 513.5,77.9 514.2,77 514.8,76 515.5,75 516.1,74.1 516.8,73.1 517.4,72.2 518.1,71.2 518.7,70.3 519.4,69.3 520,68.3 520.7,67.4 521.3,66.4 522,65.5 522.6,64.5 523.3,63.5 523.9,62.6 524.6,61.6 525.2,60.7 525.9,59.7 526.5,58.8 527.2,57.8 527.8,56.8 528.5,55.9 529.1,54.9 529.8,54 530.4,53 531.1,52 531.7,51.1 532.4,50.1 533,49.2 533.7,48.2 534.3,47.3 535,46.3 535.6,45.3 536.3,44.4 536.9,43.4 537.6,42.5 538.2,41.5 538.9,40.5 539.5,39.6 540.2,38.6 540.8,37.7 541.5,36.7 542.1,35.8 542.8,34.8 543.4,33.8 544.1,32.9 544.7,31.9 545.4,31 546,30" fill="none" style="stroke:var(--blue-ink);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round"/>
<text x="494" y="152" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">never dead</text>
<line x1="578" y1="30" x2="578" y2="122" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="578" y1="122" x2="682" y2="122" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="578" y="135" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-4</text>
<text x="630" y="135" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="682" y="135" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="572" y="118.7" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">-1</text>
<text x="572" y="101.6" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="572" y="67.6" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="572" y="33.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="630" y="18" text-anchor="middle" style="fill:var(--fg);font-size:11.5px;font-weight:700">ELU (α = 1)</text>
<line x1="578" y1="98.1" x2="682" y2="98.1" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="630" y1="30" x2="630" y2="122" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<polyline points="578,97.8 578.7,97.8 579.3,97.8 580,97.8 580.6,97.8 581.3,97.7 581.9,97.7 582.6,97.7 583.2,97.7 583.9,97.7 584.5,97.6 585.2,97.6 585.8,97.6 586.5,97.6 587.1,97.5 587.8,97.5 588.4,97.5 589.1,97.4 589.7,97.4 590.4,97.3 591,97.3 591.7,97.3 592.3,97.2 593,97.2 593.6,97.1 594.3,97.1 594.9,97 595.6,96.9 596.2,96.9 596.9,96.8 597.5,96.7 598.2,96.7 598.8,96.6 599.5,96.5 600.1,96.4 600.8,96.4 601.4,96.3 602.1,96.2 602.7,96.1 603.4,96 604,95.8 604.7,95.7 605.3,95.6 606,95.5 606.6,95.3 607.3,95.2 607.9,95 608.6,94.9 609.2,94.7 609.9,94.5 610.5,94.3 611.2,94.2 611.8,93.9 612.5,93.7 613.1,93.5 613.8,93.3 614.4,93 615.1,92.8 615.7,92.5 616.4,92.2 617,91.9 617.7,91.6 618.3,91.2 619,90.9 619.6,90.5 620.3,90.1 620.9,89.7 621.6,89.3 622.2,88.8 622.9,88.3 623.5,87.8 624.2,87.3 624.8,86.7 625.5,86.1 626.1,85.5 626.8,84.9 627.4,84.2 628.1,83.5 628.7,82.7 629.4,81.9 630,81.1 630.7,81.1 631.3,81.1 632,81.1 632.6,81.1 633.3,81.1 633.9,81.1 634.6,81.1 635.2,81.1 635.9,81.1 636.5,81.1 637.2,81.1 637.8,81.1 638.5,81.1 639.1,81.1 639.8,81.1 640.4,81.1 641.1,81.1 641.7,81.1 642.4,81.1 643,81.1 643.7,81.1 644.3,81.1 645,81.1 645.6,81.1 646.3,81.1 646.9,81.1 647.6,81.1 648.2,81.1 648.9,81.1 649.5,81.1 650.2,81.1 650.8,81.1 651.5,81.1 652.1,81.1 652.8,81.1 653.4,81.1 654.1,81.1 654.7,81.1 655.4,81.1 656,81.1 656.7,81.1 657.3,81.1 658,81.1 658.6,81.1 659.3,81.1 659.9,81.1 660.6,81.1 661.2,81.1 661.9,81.1 662.5,81.1 663.2,81.1 663.8,81.1 664.5,81.1 665.1,81.1 665.8,81.1 666.4,81.1 667.1,81.1 667.7,81.1 668.4,81.1 669,81.1 669.7,81.1 670.3,81.1 671,81.1 671.6,81.1 672.3,81.1 672.9,81.1 673.6,81.1 674.2,81.1 674.9,81.1 675.5,81.1 676.2,81.1 676.8,81.1 677.5,81.1 678.1,81.1 678.8,81.1 679.4,81.1 680.1,81.1 680.7,81.1 681.4,81.1 682,81.1" fill="none" style="stroke:var(--red-ink);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:4 3"/>
<polyline points="578,114.9 578.7,114.9 579.3,114.8 580,114.8 580.6,114.8 581.3,114.8 581.9,114.8 582.6,114.7 583.2,114.7 583.9,114.7 584.5,114.7 585.2,114.6 585.8,114.6 586.5,114.6 587.1,114.6 587.8,114.5 588.4,114.5 589.1,114.5 589.7,114.4 590.4,114.4 591,114.3 591.7,114.3 592.3,114.2 593,114.2 593.6,114.1 594.3,114.1 594.9,114 595.6,114 596.2,113.9 596.9,113.9 597.5,113.8 598.2,113.7 598.8,113.6 599.5,113.6 600.1,113.5 600.8,113.4 601.4,113.3 602.1,113.2 602.7,113.1 603.4,113 604,112.9 604.7,112.8 605.3,112.6 606,112.5 606.6,112.4 607.3,112.2 607.9,112.1 608.6,111.9 609.2,111.7 609.9,111.6 610.5,111.4 611.2,111.2 611.8,111 612.5,110.8 613.1,110.5 613.8,110.3 614.4,110.1 615.1,109.8 615.7,109.5 616.4,109.2 617,108.9 617.7,108.6 618.3,108.3 619,107.9 619.6,107.5 620.3,107.1 620.9,106.7 621.6,106.3 622.2,105.8 622.9,105.4 623.5,104.9 624.2,104.3 624.8,103.8 625.5,103.2 626.1,102.6 626.8,101.9 627.4,101.2 628.1,100.5 628.7,99.8 629.4,99 630,98.1 630.7,97.3 631.3,96.4 632,95.6 632.6,94.7 633.3,93.9 633.9,93 634.6,92.2 635.2,91.3 635.9,90.5 636.5,89.6 637.2,88.8 637.8,87.9 638.5,87.1 639.1,86.2 639.8,85.4 640.4,84.5 641.1,83.7 641.7,82.8 642.4,82 643,81.1 643.7,80.3 644.3,79.4 645,78.6 645.6,77.7 646.3,76.9 646.9,76 647.6,75.1 648.2,74.3 648.9,73.4 649.5,72.6 650.2,71.7 650.8,70.9 651.5,70 652.1,69.2 652.8,68.3 653.4,67.5 654.1,66.6 654.7,65.8 655.4,64.9 656,64.1 656.7,63.2 657.3,62.4 658,61.5 658.6,60.7 659.3,59.8 659.9,59 660.6,58.1 661.2,57.3 661.9,56.4 662.5,55.6 663.2,54.7 663.8,53.9 664.5,53 665.1,52.1 665.8,51.3 666.4,50.4 667.1,49.6 667.7,48.7 668.4,47.9 669,47 669.7,46.2 670.3,45.3 671,44.5 671.6,43.6 672.3,42.8 672.9,41.9 673.6,41.1 674.2,40.2 674.9,39.4 675.5,38.5 676.2,37.7 676.8,36.8 677.5,36 678.1,35.1 678.8,34.3 679.4,33.4 680.1,32.6 680.7,31.7 681.4,30.9 682,30" fill="none" style="stroke:var(--blue-ink);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round"/>
<text x="630" y="152" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">smooth · mean near 0</text>
<line x1="260" y1="170" x2="284" y2="170" style="stroke:var(--blue-ink);stroke-width:2.6;stroke-linecap:round"/>
<text x="290" y="174" text-anchor="start" style="fill:var(--blue-ink);font-size:10.5px;font-weight:400">f(a)</text>
<line x1="340" y1="170" x2="364" y2="170" style="stroke:var(--red-ink);stroke-width:1.8;stroke-linecap:round;stroke-dasharray:4 3"/>
<text x="370" y="174" text-anchor="start" style="fill:var(--red-ink);font-size:10.5px;font-weight:400">f′(a)</text>
</svg>
<p class="fig-cap">Solid: activation. Dashed: its derivative. Only sigmoid and tanh squash the gradient in both tails; ReLU passes it unchanged for a > 0 but is 0 for a < 0 (leaky ReLU shown with slope 0.1 so it is visible).</p>
</div>

---

## 7.4 Better weight initialization

### 7.4.1 Zero (or equal) initialization: the symmetry problem

If all weights into a layer start equal, every unit in that layer computes the **same** output, receives the **same** gradient, gets the **same** update, and stays identical forever. A layer of 500 units behaves like one unit.

**[Ex] Watch the symmetry survive.** $\mathbf x=(1,2)$, two sigmoid hidden units with all weights $0.5$, linear output with weights $(1,1)$, target $y=0$, loss $\frac12(\hat y-y)^2$.

| Line | Calculation | Result |
|---|---|---|
| 1 | pre-activations $0.5+1$ for both units | $(1.5,\ 1.5)$ |
| 2 | $\mathbf h=\sigma(1.5)$ | $(0.8176,\ 0.8176)$ |
| 3 | $\hat y=0.8176+0.8176$ | 1.635 |
| 4 | output-weight gradients $(\hat y-y)h_j$ | $(1.337,\ 1.337)$: equal |
| 5 | hidden-weight gradients, row $j$: $(\hat y-y)v_j\,h_j(1-h_j)\,\mathbf x$ | rows $(0.244,\ 0.488)$ and $(0.244,\ 0.488)$: equal |

After the update the two units are still identical, and they will be at every later step. **Random initialization breaks the symmetry.**

### 7.4.2 [Derivation] How weight size scales the signal

Pre-activation of a unit with $n$ inputs: $s=\sum_{i=1}^n w_ix_i$. Assume $w_i$ and $x_i$ independent, zero mean. Then
$$\mathrm{Var}(w_ix_i)=\mathbb E[w_i^2]\,\mathbb E[x_i^2]=\mathrm{Var}(w)\,\mathrm{Var}(x),\qquad \mathrm{Var}(s)=n\,\mathrm{Var}(w)\,\mathrm{Var}(x).$$
Each layer multiplies the variance by $n\,\mathrm{Var}(w)$:

| Choice | Factor per layer | After many layers |
|---|---|---|
| $n\,\mathrm{Var}(w)<1$ (too small) | shrinks | activations → 0; gradients vanish |
| $n\,\mathrm{Var}(w)>1$ (too large) | grows | tanh/sigmoid saturate; or values explode |
| $n\,\mathrm{Var}(w)=1$ | 1 | signal size preserved ✓ |

**[Ex] Too small.** $n=500$, $w\sim\mathcal N(0,0.01^2)$: factor on the standard deviation $\sqrt{500\times10^{-4}}=0.224$ per layer; after 10 layers $0.224^{10}\approx3\times10^{-7}$.
**[Ex] Too large.** $n=100$, $w\sim\mathcal N(0,1)$: standard deviation multiplied by $\sqrt{100}=10$ per layer; after 5 layers $10^5$. Every tanh unit is pinned at ±1.

### 7.4.3 Xavier (Glorot) initialization: for tanh / sigmoid

Set $n\,\mathrm{Var}(w)=1$:
$$\boxed{\mathrm{Var}(w)=\frac1{n_{\text{in}}}}\quad\Longrightarrow\quad w\sim\frac{\mathcal N(0,1)}{\sqrt{n_{\text{in}}}}.$$
Balancing the backward pass too gives Glorot's compromise $\mathrm{Var}(w)=\frac{2}{n_{\text{in}}+n_{\text{out}}}$, often used as a uniform distribution $U\big[-\sqrt{6/(n_{\text{in}}+n_{\text{out}})},\ +\sqrt{6/(n_{\text{in}}+n_{\text{out}})}\big]$.

### 7.4.4 He initialization: for ReLU

ReLU zeroes the negative half of $s$. For $s$ symmetric about 0, $\mathbb E[\mathrm{ReLU}(s)^2]=\frac12\mathrm{Var}(s)$: the second moment is **halved** at every layer. Compensate with a factor 2:
$$\boxed{\mathrm{Var}(w)=\frac{2}{n_{\text{in}}}}\quad\Longrightarrow\quad w\sim\mathcal N(0,1)\cdot\sqrt{\frac2{n_{\text{in}}}}.$$

**[Ex]**

| $n_{\text{in}}$ | Xavier std $1/\sqrt n$ | He std $\sqrt{2/n}$ |
|---|---|---|
| 256 | 0.0625 | 0.0884 |
| 400 | 0.05 | 0.0707 |
| 512 | 0.0442 | 0.0625 |

<div class="fig" role="img" aria-label="Weight initialisation and signal size">
<svg viewBox="0 0 700 196" width="700" style="font-family:var(--font)" aria-hidden="true">
<line x1="54" y1="155.2" x2="344" y2="155.2" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="54" y1="122.9" x2="344" y2="122.9" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="54" y1="90.6" x2="344" y2="90.6" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="54" y1="58.3" x2="344" y2="58.3" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="54" y1="26" x2="344" y2="26" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="54" y1="26" x2="54" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="112" y1="26" x2="112" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="170" y1="26" x2="170" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="228" y1="26" x2="228" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="286" y1="26" x2="286" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="344" y1="26" x2="344" y2="166" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="54" y1="26" x2="54" y2="166" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="54" y1="166" x2="344" y2="166" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="54" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="112" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="170" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="228" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">6</text>
<text x="286" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">8</text>
<text x="344" y="179" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">10</text>
<text x="48" y="158.7" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1e-6</text>
<text x="48" y="126.4" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1e-3</text>
<text x="48" y="94.1" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="48" y="61.8" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1e3</text>
<text x="48" y="29.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1e6</text>
<text x="199" y="192" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">layer</text>
<text x="12" y="96" text-anchor="middle" transform="rotate(-90 12 96)" style="fill:var(--muted);font-size:10.5px;font-weight:400">activation std</text>
<text x="199" y="14" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">signal size per layer is f^L, f = √(n·Var(w))</text>
<polyline points="54,90.6 55.5,91 56.9,91.3 58.4,91.7 59.8,92 61.3,92.4 62.7,92.7 64.2,93.1 65.6,93.4 67.1,93.8 68.5,94.1 70,94.5 71.4,94.8 72.9,95.2 74.3,95.5 75.8,95.9 77.2,96.2 78.7,96.6 80.1,96.9 81.6,97.3 83,97.6 84.5,98 85.9,98.3 87.4,98.7 88.8,99 90.3,99.4 91.7,99.7 93.2,100.1 94.6,100.4 96.1,100.8 97.5,101.1 99,101.5 100.4,101.8 101.9,102.2 103.3,102.5 104.8,102.9 106.2,103.2 107.7,103.6 109.1,103.9 110.6,104.3 112,104.6 113.5,105 114.9,105.3 116.4,105.7 117.8,106 119.3,106.4 120.7,106.7 122.2,107.1 123.6,107.4 125.1,107.8 126.5,108.1 128,108.5 129.4,108.8 130.9,109.2 132.3,109.5 133.8,109.9 135.2,110.2 136.7,110.6 138.1,110.9 139.6,111.3 141,111.6 142.5,112 143.9,112.3 145.4,112.7 146.8,113 148.3,113.4 149.7,113.7 151.2,114.1 152.6,114.4 154.1,114.8 155.5,115.1 157,115.5 158.4,115.8 159.9,116.2 161.3,116.5 162.8,116.9 164.2,117.2 165.7,117.6 167.1,117.9 168.6,118.3 170,118.6 171.5,119 172.9,119.3 174.4,119.7 175.8,120 177.3,120.4 178.7,120.7 180.1,121.1 181.6,121.4 183.1,121.8 184.5,122.1 186,122.5 187.4,122.8 188.9,123.2 190.3,123.5 191.8,123.9 193.2,124.2 194.7,124.6 196.1,124.9 197.6,125.3 199,125.6 200.5,126 201.9,126.3 203.4,126.7 204.8,127 206.3,127.4 207.7,127.7 209.2,128.1 210.6,128.4 212.1,128.8 213.5,129.1 215,129.5 216.4,129.8 217.9,130.2 219.3,130.5 220.8,130.9 222.2,131.2 223.7,131.5 225.1,131.9 226.6,132.2 228,132.6 229.5,132.9 230.9,133.3 232.4,133.6 233.8,134 235.3,134.3 236.7,134.7 238.2,135 239.6,135.4 241.1,135.7 242.5,136.1 244,136.4 245.4,136.8 246.9,137.1 248.3,137.5 249.8,137.8 251.2,138.2 252.7,138.5 254.1,138.9 255.6,139.2 257,139.6 258.5,139.9 259.9,140.3 261.4,140.6 262.8,141 264.3,141.3 265.7,141.7 267.2,142 268.6,142.4 270.1,142.7 271.5,143.1 273,143.4 274.4,143.8 275.9,144.1 277.3,144.5 278.8,144.8 280.2,145.2 281.7,145.5 283.1,145.9 284.6,146.2 286,146.6 287.5,146.9 288.9,147.3 290.4,147.6 291.8,148 293.3,148.3 294.7,148.7 296.2,149 297.6,149.4 299,149.7 300.5,150.1 302,150.4 303.4,150.8 304.9,151.1 306.3,151.5 307.8,151.8 309.2,152.2 310.7,152.5 312.1,152.9 313.5,153.2 315,153.6 316.5,153.9 317.9,154.3 319.4,154.6 320.8,155 322.3,155.3 323.7,155.7 325.2,156 326.6,156.4 328.1,156.7 329.5,157.1 331,157.4 332.4,157.8 333.9,158.1 335.3,158.5 336.8,158.8 338.2,159.2 339.7,159.5 341.1,159.9 342.5,160.2 344,160.6" fill="none" style="stroke:var(--red-ink);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round"/>
<polyline points="54,90.6 55.5,90.6 56.9,90.6 58.4,90.6 59.8,90.6 61.3,90.6 62.7,90.6 64.2,90.6 65.6,90.6 67.1,90.6 68.5,90.6 70,90.6 71.4,90.6 72.9,90.6 74.3,90.6 75.8,90.6 77.2,90.6 78.7,90.6 80.1,90.6 81.6,90.6 83,90.6 84.5,90.6 85.9,90.6 87.4,90.6 88.8,90.6 90.3,90.6 91.7,90.6 93.2,90.6 94.6,90.6 96.1,90.6 97.5,90.6 99,90.6 100.4,90.6 101.9,90.6 103.3,90.6 104.8,90.6 106.2,90.6 107.7,90.6 109.1,90.6 110.6,90.6 112,90.6 113.5,90.6 114.9,90.6 116.4,90.6 117.8,90.6 119.3,90.6 120.7,90.6 122.2,90.6 123.6,90.6 125.1,90.6 126.5,90.6 128,90.6 129.4,90.6 130.9,90.6 132.3,90.6 133.8,90.6 135.2,90.6 136.7,90.6 138.1,90.6 139.6,90.6 141,90.6 142.5,90.6 143.9,90.6 145.4,90.6 146.8,90.6 148.3,90.6 149.7,90.6 151.2,90.6 152.6,90.6 154.1,90.6 155.5,90.6 157,90.6 158.4,90.6 159.9,90.6 161.3,90.6 162.8,90.6 164.2,90.6 165.7,90.6 167.1,90.6 168.6,90.6 170,90.6 171.5,90.6 172.9,90.6 174.4,90.6 175.8,90.6 177.3,90.6 178.7,90.6 180.1,90.6 181.6,90.6 183.1,90.6 184.5,90.6 186,90.6 187.4,90.6 188.9,90.6 190.3,90.6 191.8,90.6 193.2,90.6 194.7,90.6 196.1,90.6 197.6,90.6 199,90.6 200.5,90.6 201.9,90.6 203.4,90.6 204.8,90.6 206.3,90.6 207.7,90.6 209.2,90.6 210.6,90.6 212.1,90.6 213.5,90.6 215,90.6 216.4,90.6 217.9,90.6 219.3,90.6 220.8,90.6 222.2,90.6 223.7,90.6 225.1,90.6 226.6,90.6 228,90.6 229.5,90.6 230.9,90.6 232.4,90.6 233.8,90.6 235.3,90.6 236.7,90.6 238.2,90.6 239.6,90.6 241.1,90.6 242.5,90.6 244,90.6 245.4,90.6 246.9,90.6 248.3,90.6 249.8,90.6 251.2,90.6 252.7,90.6 254.1,90.6 255.6,90.6 257,90.6 258.5,90.6 259.9,90.6 261.4,90.6 262.8,90.6 264.3,90.6 265.7,90.6 267.2,90.6 268.6,90.6 270.1,90.6 271.5,90.6 273,90.6 274.4,90.6 275.9,90.6 277.3,90.6 278.8,90.6 280.2,90.6 281.7,90.6 283.1,90.6 284.6,90.6 286,90.6 287.5,90.6 288.9,90.6 290.4,90.6 291.8,90.6 293.3,90.6 294.7,90.6 296.2,90.6 297.6,90.6 299,90.6 300.5,90.6 302,90.6 303.4,90.6 304.9,90.6 306.3,90.6 307.8,90.6 309.2,90.6 310.7,90.6 312.1,90.6 313.5,90.6 315,90.6 316.5,90.6 317.9,90.6 319.4,90.6 320.8,90.6 322.3,90.6 323.7,90.6 325.2,90.6 326.6,90.6 328.1,90.6 329.5,90.6 331,90.6 332.4,90.6 333.9,90.6 335.3,90.6 336.8,90.6 338.2,90.6 339.7,90.6 341.1,90.6 342.5,90.6 344,90.6" fill="none" style="stroke:var(--green-ink);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round"/>
<polyline points="54,90.6 55.5,90.1 56.9,89.5 58.4,89 59.8,88.5 61.3,87.9 62.7,87.4 64.2,86.8 65.6,86.3 67.1,85.8 68.5,85.2 70,84.7 71.4,84.2 72.9,83.6 74.3,83.1 75.8,82.5 77.2,82 78.7,81.5 80.1,80.9 81.6,80.4 83,79.8 84.5,79.3 85.9,78.8 87.4,78.2 88.8,77.7 90.3,77.2 91.7,76.6 93.2,76.1 94.6,75.5 96.1,75 97.5,74.5 99,73.9 100.4,73.4 101.9,72.8 103.3,72.3 104.8,71.8 106.2,71.2 107.7,70.7 109.1,70.2 110.6,69.6 112,69.1 113.5,68.5 114.9,68 116.4,67.5 117.8,66.9 119.3,66.4 120.7,65.8 122.2,65.3 123.6,64.8 125.1,64.2 126.5,63.7 128,63.2 129.4,62.6 130.9,62.1 132.3,61.5 133.8,61 135.2,60.5 136.7,59.9 138.1,59.4 139.6,58.8 141,58.3 142.5,57.8 143.9,57.2 145.4,56.7 146.8,56.2 148.3,55.6 149.7,55.1 151.2,54.5 152.6,54 154.1,53.5 155.5,52.9 157,52.4 158.4,51.8 159.9,51.3 161.3,50.8 162.8,50.2 164.2,49.7 165.7,49.2 167.1,48.6 168.6,48.1 170,47.5 171.5,47 172.9,46.5 174.4,45.9 175.8,45.4 177.3,44.8 178.7,44.3 180.1,43.8 181.6,43.2 183.1,42.7 184.5,42.2 186,41.6 187.4,41.1 188.9,40.5 190.3,40 191.8,39.5 193.2,38.9 194.7,38.4 196.1,37.8 197.6,37.3 199,36.8 200.5,36.2 201.9,35.7 203.4,35.2 204.8,34.6 206.3,34.1 207.7,33.5 209.2,33 210.6,32.5 212.1,31.9 213.5,31.4 215,30.8 216.4,30.3 217.9,29.8 219.3,29.2 220.8,28.7 222.2,28.2 223.7,27.6 225.1,27.1 226.6,26.5 228,26 229.5,25.5" fill="none" style="stroke:var(--yellow-ink);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round"/>
<text x="344" y="130.5" text-anchor="end" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">3e-7 after 10 layers</text>
<text x="340" y="83.6" text-anchor="end" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">preserved</text>
<text x="100.4" y="31.6" text-anchor="start" style="fill:var(--yellow-ink);font-size:10.5px;font-weight:700">explodes: tanh saturates</text>
<text x="62.7" y="144.5" text-anchor="start" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">vanishes</text>
<line x1="460" y1="152" x2="680" y2="152" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="460" y1="96" x2="680" y2="96" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="460" y1="40" x2="680" y2="40" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="460" y1="40" x2="460" y2="152" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="460" y1="152" x2="680" y2="152" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="454" y="155.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.00</text>
<text x="454" y="99.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.05</text>
<text x="454" y="43.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.10</text>
<text x="420" y="96" text-anchor="middle" transform="rotate(-90 420 96)" style="fill:var(--muted);font-size:10.5px;font-weight:400">std of w</text>
<text x="570" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">weight std: Xavier vs He</text>
<rect x="468.8" y="82" width="27.9" height="70" rx="3" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.4"/>
<rect x="499.7" y="53" width="27.9" height="99" rx="3" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.4"/>
<text x="498.2" y="165" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">n = 256</text>
<text x="482.7" y="78" text-anchor="middle" style="fill:var(--blue-ink);font-size:9px;font-weight:700">0.0625</text>
<text x="513.6" y="49" text-anchor="middle" style="fill:var(--green-ink);font-size:9px;font-weight:700">0.0884</text>
<rect x="542.1" y="96" width="27.9" height="56" rx="3" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.4"/>
<rect x="573" y="72.8" width="27.9" height="79.2" rx="3" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.4"/>
<text x="571.5" y="165" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">n = 400</text>
<text x="556.1" y="92" text-anchor="middle" style="fill:var(--blue-ink);font-size:9px;font-weight:700">0.05</text>
<text x="586.9" y="68.8" text-anchor="middle" style="fill:var(--green-ink);font-size:9px;font-weight:700">0.0707</text>
<rect x="615.5" y="102.5" width="27.9" height="49.5" rx="3" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.4"/>
<rect x="646.3" y="82" width="27.9" height="70" rx="3" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.4"/>
<text x="644.8" y="165" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">n = 512</text>
<text x="629.4" y="98.5" text-anchor="middle" style="fill:var(--blue-ink);font-size:9px;font-weight:700">0.0442</text>
<text x="660.3" y="78" text-anchor="middle" style="fill:var(--green-ink);font-size:9px;font-weight:700">0.0625</text>
<rect x="468" y="172" width="10" height="10" rx="0" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.2"/>
<text x="482" y="181" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">Xavier √(1/n)</text>
<rect x="576" y="172" width="10" height="10" rx="0" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.2"/>
<text x="590" y="181" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">He √(2/n), ReLU</text>
</svg>
<p class="fig-cap">Left: each layer multiplies the signal std by √(n·Var(w)); only a factor of 1 survives depth. Right: the standard deviations that give factor 1 (Xavier, tanh) or compensate ReLU halving the second moment (He).</p>
</div>

<details>
<summary><b>Try it yourself</b>: n = 100 inputs, Var(x) = 1, Var(w) = 0.04. Var(s)? What Var(w) would keep it at 1?</summary>

$\mathrm{Var}(s)=100\times0.04\times1=4$. To keep it at 1: $\mathrm{Var}(w)=1/100=0.01$ (Xavier), i.e. std 0.1.

</details>

---

## 7.5 Batch normalization

### 7.5.1 Motivation

Good initialization makes the activations well-scaled **at the start**. During training the weights change, so the distribution of every layer's inputs keeps shifting ("internal covariate shift"), and layers deep in the network keep chasing a moving target. **Batch norm** re-standardises each unit's pre-activation on every mini-batch, throughout training.

### 7.5.2 The transform (one unit, one mini-batch of $m$ values $x_1..x_m$)

$$\mu_B=\frac1m\sum_ix_i,\qquad \sigma_B^2=\frac1m\sum_i(x_i-\mu_B)^2,$$
$$\hat x_i=\frac{x_i-\mu_B}{\sqrt{\sigma_B^2+\epsilon}},\qquad \boxed{y_i=\gamma\,\hat x_i+\beta}$$
- $\hat x$ has mean 0 and variance 1 over the batch.
- $\gamma,\beta$ are **learned** (one pair per unit). They let the network choose any mean and scale; with $\gamma=\sqrt{\sigma_B^2+\epsilon}$ and $\beta=\mu_B$ it recovers the original values. So BN never reduces what the network can represent.
- Applied to pre-activations, before the non-linearity (course placement). The layer's own bias becomes redundant (any bias is subtracted with $\mu_B$; $\beta$ takes its role).
- BN is differentiable, so backprop passes through it (including through $\mu_B$ and $\sigma_B$).

### 7.5.3 [Ex] Batch norm, line by line

One unit, batch of pre-activations $(2,4,6,8)$, $\gamma=2$, $\beta=1$, $\epsilon\approx0$.

| Line | Calculation | Result |
|---|---|---|
| 1 | $\mu_B=(2+4+6+8)/4$ | 5 |
| 2 | $\sigma_B^2=\frac{9+1+1+9}{4}$ | 5 |
| 3 | $\sqrt{\sigma_B^2}$ | 2.236 |
| 4 | $\hat x=(x-5)/2.236$ | $(-1.342,\ -0.447,\ 0.447,\ 1.342)$ |
| 5 | $y=2\hat x+1$ | $(-1.683,\ 0.106,\ 1.894,\ 3.683)$ |
| 6 | check | $y$ has mean $\beta=1$ and std $\gamma=2$ ✓ |

### 7.5.4 Test time

At test time there may be a single example, so no batch statistics. Use **running averages** collected during training, e.g. with momentum 0.9:
$$\mu_{\text{run}}\leftarrow0.9\,\mu_{\text{run}}+0.1\,\mu_B,\qquad \sigma^2_{\text{run}}\leftarrow0.9\,\sigma^2_{\text{run}}+0.1\,\sigma_B^2.$$
**[Ex]** $\mu_{\text{run}}=0$, first batch mean 5 ⇒ $0.5$; next batch mean 7 ⇒ $0.9(0.5)+0.1(7)=1.15$.

### 7.5.5 Why it helps

| Effect | Reason |
|---|---|
| larger learning rates are safe | activations cannot drift to huge values |
| less sensitive to initialization | each layer is re-standardised anyway |
| fewer saturated units | pre-activations kept near the sigmoid/tanh centre |
| mild **regularization** | $\mu_B,\sigma_B$ depend on which examples share the batch: a small noise, a cousin of dropout |

**[!] Traps.**
- Learnable parameters per unit: **2** ($\gamma,\beta$); the running mean and variance are stored statistics, **not** learned by gradient.
- Statistics are computed **per unit across the batch**, not across units of one example (that is layer norm).
- Tiny batches give noisy $\mu_B,\sigma_B$; with batch size 1, $\hat x$ is always 0.

<div class="fig" role="img" aria-label="Batch normalisation on one unit">
<svg viewBox="0 0 700 166" width="700" style="font-family:var(--font)" aria-hidden="true">
<line x1="163" y1="22" x2="163" y2="144" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="209.1" y1="22" x2="209.1" y2="144" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="255.2" y1="22" x2="255.2" y2="144" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="301.3" y1="22" x2="301.3" y2="144" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="347.4" y1="22" x2="347.4" y2="144" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="393.5" y1="22" x2="393.5" y2="144" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="439.6" y1="22" x2="439.6" y2="144" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="485.7" y1="22" x2="485.7" y2="144" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="531.7" y1="22" x2="531.7" y2="144" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="577.8" y1="22" x2="577.8" y2="144" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="623.9" y1="22" x2="623.9" y2="144" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="670" y1="22" x2="670" y2="144" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="140" y1="34" x2="670" y2="34" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="140" y1="84" x2="670" y2="84" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="140" y1="134" x2="670" y2="134" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="163" y="158" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-2</text>
<text x="209.1" y="158" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-1</text>
<text x="255.2" y="158" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="301.3" y="158" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="347.4" y="158" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="393.5" y="158" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">3</text>
<text x="439.6" y="158" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="485.7" y="158" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">5</text>
<text x="531.7" y="158" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">6</text>
<text x="577.8" y="158" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">7</text>
<text x="623.9" y="158" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">8</text>
<text x="670" y="158" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">9</text>
<text x="6" y="32" text-anchor="start" style="fill:var(--blue-ink);font-size:11px;font-weight:700">raw pre-activations</text>
<text x="6" y="46" text-anchor="start" style="fill:var(--muted);font-size:10px;font-weight:400">μ = 5, σ² = 5</text>
<text x="6" y="82" text-anchor="start" style="fill:var(--yellow-ink);font-size:11px;font-weight:700">standardised x̂</text>
<text x="6" y="96" text-anchor="start" style="fill:var(--muted);font-size:10px;font-weight:400">μ = 0, σ = 1</text>
<text x="6" y="132" text-anchor="start" style="fill:var(--green-ink);font-size:11px;font-weight:700">y = 2x̂ + 1</text>
<text x="6" y="146" text-anchor="start" style="fill:var(--muted);font-size:10px;font-weight:400">μ = β = 1, σ = γ = 2</text>
<line x1="347.4" y1="34" x2="193.4" y2="84" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round;stroke-dasharray:3 3"/>
<line x1="193.4" y1="84" x2="177.6" y2="134" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round;stroke-dasharray:3 3"/>
<circle cx="347.4" cy="34" r="5.5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<circle cx="193.4" cy="84" r="5.5" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.8"/>
<circle cx="177.6" cy="134" r="5.5" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle r="3" style="fill:var(--fg)"><animateMotion dur="6s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.7;1" path="M347.4,34 L193.4,84 L177.6,134"/></circle>
<line x1="439.6" y1="34" x2="234.6" y2="84" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round;stroke-dasharray:3 3"/>
<line x1="234.6" y1="84" x2="260.1" y2="134" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round;stroke-dasharray:3 3"/>
<circle cx="439.6" cy="34" r="5.5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<circle cx="234.6" cy="84" r="5.5" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.8"/>
<circle cx="260.1" cy="134" r="5.5" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle r="3" style="fill:var(--fg)"><animateMotion dur="6s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.7;1" path="M439.6,34 L234.6,84 L260.1,134"/></circle>
<line x1="531.7" y1="34" x2="275.8" y2="84" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round;stroke-dasharray:3 3"/>
<line x1="275.8" y1="84" x2="342.5" y2="134" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round;stroke-dasharray:3 3"/>
<circle cx="531.7" cy="34" r="5.5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<circle cx="275.8" cy="84" r="5.5" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.8"/>
<circle cx="342.5" cy="134" r="5.5" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle r="3" style="fill:var(--fg)"><animateMotion dur="6s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.7;1" path="M531.7,34 L275.8,84 L342.5,134"/></circle>
<line x1="623.9" y1="34" x2="317" y2="84" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round;stroke-dasharray:3 3"/>
<line x1="317" y1="84" x2="425" y2="134" style="stroke:var(--line-strong);stroke-width:1;stroke-linecap:round;stroke-dasharray:3 3"/>
<circle cx="623.9" cy="34" r="5.5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<circle cx="317" cy="84" r="5.5" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.8"/>
<circle cx="425" cy="134" r="5.5" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle r="3" style="fill:var(--fg)"><animateMotion dur="6s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.7;1" path="M623.9,34 L317,84 L425,134"/></circle>
<line x1="485.7" y1="24" x2="485.7" y2="44" style="stroke:var(--blue-ink);stroke-width:2;stroke-linecap:round"/>
<line x1="255.2" y1="74" x2="255.2" y2="94" style="stroke:var(--yellow-ink);stroke-width:2;stroke-linecap:round"/>
<line x1="301.3" y1="124" x2="301.3" y2="144" style="stroke:var(--green-ink);stroke-width:2;stroke-linecap:round"/>
</svg>
<p class="fig-cap">The worked batch (2, 4, 6, 8): subtract the mean and divide by the standard deviation, then rescale with the learned γ = 2 and shift β = 1. The vertical bars mark each row's mean.</p>
</div>

---

## 7.6 Week-7 exam toolkit & practice set

**Diagram — Week 7 at a glance**

<div class="fig" role="img" aria-label="Week 7 at a glance">
<svg viewBox="0 0 700 110" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="0" y="4" width="190" height="82" rx="8" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="95" y="34.5" text-anchor="middle" style="fill:var(--red-ink);font-size:11.5px;font-weight:700">Gradient = Π σ′(aᵢ) wᵢ</text>
<text x="95" y="49" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">σ′ ≤ ¼: vanishes</text>
<text x="95" y="63.5" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">(or explodes if w is large)</text>
<line x1="190" y1="45" x2="236.2" y2="21.9" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="240,20 235.9,25.3 233.3,20.1" style="fill:var(--line-strong)"/>
<line x1="190" y1="45" x2="235.8" y2="45" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="240,45 234,47.9 234,42.1" style="fill:var(--line-strong)"/>
<line x1="190" y1="45" x2="236.2" y2="68.1" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="240,70 233.3,69.9 235.9,64.7" style="fill:var(--line-strong)"/>
<rect x="242" y="0" width="458" height="32" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="471" y="12.9" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">Activations</text>
<text x="471" y="26.9" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:500">ReLU f′ ∈ {0, 1} · Leaky αa · maxout: max of k pieces</text>
<rect x="242" y="38" width="458" height="32" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="471" y="50.9" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">Initialisation</text>
<text x="471" y="64.9" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:500">Var(s) = n·Var(w)·Var(x) · Xavier 1/n · He 2/n</text>
<rect x="242" y="76" width="458" height="32" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="471" y="88.9" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">Batch norm</text>
<text x="471" y="102.9" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:500">x̂ = (x − μ_B)/√(σ_B² + ε) · y = γx̂ + β · test: running averages</text>
</svg>
<p class="fig-cap">Week 7 on one line.</p>
</div>

### 7.6.1 Recognition rules

| See | Think |
|---|---|
| many sigmoid layers, gradient at layer 1 | product of factors $\le\frac14$: vanishing |
| $\lvert a\rvert$ large with sigmoid/tanh | saturated, $\sigma'\approx0$ |
| "all weight gradients of a neuron have the same sign" | inputs all positive (sigmoid outputs): not zero-centred |
| ReLU with $a<0$ for **every** input | dead neuron, $f'=0$ forever |
| Leaky / PReLU with numbers | compute $a$ first; if $a<0$ output $\alpha a$ |
| maxout | evaluate every piece, take the max; gradient only to the winner |
| "all weights initialised to the same value" | symmetry, units stay identical |
| "variance of pre-activation" | $n\,\mathrm{Var}(w)\,\mathrm{Var}(x)$ |
| tanh/sigmoid init | Xavier $1/n$ (or $2/(n_{\text{in}}+n_{\text{out}})$) |
| ReLU init | He $2/n$ |
| BN with a batch of numbers | mean, population variance ($\div m$), standardise, then $\gamma\hat x+\beta$ |
| BN at test time | running averages, not the test batch |

### 7.6.2 Formula sheet

| Formula | Use |
|---|---|
| $\frac{\partial\mathcal L}{\partial w_1}\propto\prod_i\sigma'(a_i)w_i$ | vanishing / exploding |
| $\sigma'(a)=\sigma(1-\sigma)\le\frac14$, $\tanh'=1-\tanh^2\le1$ | saturation |
| $\max(0,a)$, $\max(\alpha a,a)$, ELU $\alpha(e^a-1)$ | ReLU family |
| $h=\max_j(\mathbf w_j^\top\mathbf x+b_j)$ | maxout |
| $\mathrm{Var}(s)=n\,\mathrm{Var}(w)\,\mathrm{Var}(x)$ | init analysis |
| Xavier $\mathrm{Var}(w)=\frac1{n_{\text{in}}}$ or $\frac2{n_{\text{in}}+n_{\text{out}}}$; He $\frac2{n_{\text{in}}}$ | initialization |
| $\hat x=\frac{x-\mu_B}{\sqrt{\sigma_B^2+\epsilon}}$, $y=\gamma\hat x+\beta$ | batch norm |

### 7.6.3 Practice set

1. A sigmoid unit has $a=-15$. What is $\sigma'(a)$ and what does it mean for learning?
2. Upper bound on the factor contributed by 6 sigmoid layers (weights of magnitude ≤ 1) to the first layer's gradient.
3. Leaky ReLU with slope 0.01: weights $(1,-2,0.5)$, inputs $(2,3,4)$, bias 0. Output and local derivative?
4. PReLU with $\alpha=0.25$, $z=-4$. Output? If $\alpha$ is learnable, what is $\partial f/\partial\alpha$ here?
5. Maxout unit with pieces $(1,1)$, $(2,-1)$, $(-1,2)$ (no biases), input $\mathbf x=(1,1)$. Output, and which piece gets the gradient?
6. A ReLU unit has $\mathbf w=(1,1)$, $b=-5$, inputs in $[0,2]^2$. Alive or dead?
7. Xavier and He standard deviations for $n_{\text{in}}=200$.
8. Batch $(3,3,6,12)$, $\gamma=0.5$, $\beta=2$. Batch-norm outputs.
9. True/False: (a) Initialising all weights to 0.01 works because it is not zero. (b) BN adds two learnable parameters per unit. (c) Pre-training is supervised.
10. Creative: a 20-layer tanh network initialised with $w\sim\mathcal N(0,1)$ and 300 inputs per layer barely trains. Explain with numbers and give two fixes from this week.

### 7.6.4 Answers

1. $\sigma'(-15)\approx3.1\times10^{-7}$: saturated; the unit's weights barely update.
2. $0.25^6\approx2.4\times10^{-4}$.
3. $a=2-6+2=-2$; output $-0.02$; derivative $0.01$.
4. $f=0.25\times(-4)=-1$; $\partial f/\partial\alpha=z=-4$.
5. Pieces give $1+1=2$, $2-1=1$, $-1+2=1$: output 2; only piece 1's weights get a gradient for this input.
6. Largest pre-activation $2+2-5=-1<0$: dead.
7. Xavier $1/\sqrt{200}=0.0707$; He $\sqrt{2/200}=0.1$.
8. $\mu=6$, $\sigma^2=13.5$, $\sigma=3.674$; $\hat x=(-0.816,-0.816,0,1.633)$; $y=(1.592,1.592,2,2.816)$.
9. (a) False: equal values still give symmetry (and may be badly scaled). (b) True ($\gamma,\beta$). (c) False: layer-wise phase is unsupervised; only fine-tuning uses labels.
10. Per-layer std factor $\sqrt{300\times1}\approx17.3$: pre-activations are huge, every tanh saturates at ±1, $\tanh'\approx0$, gradients vanish. Fixes: Xavier init ($\mathrm{Var}(w)=1/300$, std 0.058), and batch norm; switching to ReLU with He init also works.

### 7.6.5 Worked solutions, line by line

**Q8.**

| Line | Calculation | Result |
|---|---|---|
| 1 | $\mu_B=(3+3+6+12)/4$ | 6 |
| 2 | deviations $-3,-3,0,6$; squares $9,9,0,36$ | sum 54 |
| 3 | $\sigma_B^2=54/4$ | 13.5 |
| 4 | $\sigma_B$ | 3.674 |
| 5 | $\hat x=$ deviations $/3.674$ | $(-0.816,\ -0.816,\ 0,\ 1.633)$ |
| 6 | $y=0.5\hat x+2$ | $(1.592,\ 1.592,\ 2,\ 2.816)$ |

**Q10.**

| Line | Calculation | Result |
|---|---|---|
| 1 | $\mathrm{Var}(s)=300\times1\times\mathrm{Var}(x)$ | $300\,\mathrm{Var}(x)$ |
| 2 | std factor $\sqrt{300}$ | 17.3 per layer |
| 3 | typical $\lvert a\rvert$ | ≫ 3, so $\tanh(a)\approx\pm1$ |
| 4 | $\tanh'(a)=1-\tanh^2(a)$ | ≈ 0 at every layer |
| 5 | Xavier: $\mathrm{Var}(w)=1/300$ | factor 1 per layer ✓ |

---
