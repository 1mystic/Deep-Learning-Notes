---
title: Week 6 (Regularization: Bias-Variance, L2, Early Stopping, Dropout)
summary: Week 6 from first principles: bias-variance decomposition, train vs test error, L2, augmentation, sharing and tying, input and output noise, early stopping, ensembles and dropout with worked examples.
tags: [deep-learning, quiz-2, week-6]
color: blue
order: 6
---

# Deep Learning : Illustrated Notes for Week 6


## Contents

- **Week 6 — Bias-variance trade-off, L2 regularization, early stopping, dataset augmentation, parameter sharing and tying, injecting noise, ensembles, dropout** ✓
  - 6.0 Week-6 map
  - 6.1 Bias and variance
  - 6.2 Train error vs test error (why training error lies)
  - 6.3 L2 regularization
  - 6.4 Dataset augmentation
  - 6.5 Parameter sharing and tying
  - 6.6 Injecting noise at the input
  - 6.7 Injecting noise at the output (label smoothing)
  - 6.8 Early stopping
  - 6.9 Ensemble methods
  - 6.10 Dropout
  - 6.11 Week-6 exam toolkit & practice set


---


## 6.0 Week-6 map

**[Intuition]** Deep networks have millions of parameters, often more than training examples. They can fit the training set perfectly, including its noise, and then do badly on new data. That is **overfitting**, or in this week's language, **high variance**. Every technique this week is a different way to buy lower variance at the price of a little bias.

| Technique | Where it acts | One-line idea |
|---|---|---|
| L2 | loss | penalise large weights |
| Augmentation | data | more (label-preserving) examples |
| Sharing / tying | architecture | fewer free parameters |
| Input noise | data | equivalent to L2 for linear models |
| Output noise | labels | do not chase 100% confidence |
| Early stopping | training time | stop before memorising |
| Ensembles | many models | average out independent errors |
| Dropout | architecture during training | a cheap ensemble of $2^n$ thinned nets |

<div class="fig" role="img" aria-label="Regularisation techniques">
<svg viewBox="0 0 700 116" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="0" y="34" width="130" height="48" rx="8" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="65" y="54.8" text-anchor="middle" style="fill:var(--red-ink);font-size:11.5px;font-weight:700">Overfitting</text>
<text x="65" y="69.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">= high variance</text>
<line x1="130" y1="52" x2="159.6" y2="31.4" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="163,29 159.7,34.8 156.4,30.1" style="fill:var(--line-strong)"/>
<line x1="130" y1="66" x2="159.4" y2="82.9" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="163,85 156.4,84.5 159.2,79.5" style="fill:var(--line-strong)"/>
<rect x="165" y="6" width="125" height="46" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="227.5" y="25.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">L2 / weight decay</text>
<text x="227.5" y="40.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">penalise big w</text>
<rect x="300" y="6" width="125" height="46" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="362.5" y="25.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">Augmentation</text>
<text x="362.5" y="40.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">more label-safe data</text>
<rect x="435" y="6" width="125" height="46" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="497.5" y="25.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">Sharing / tying</text>
<text x="497.5" y="40.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">fewer free weights</text>
<rect x="570" y="6" width="125" height="46" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="632.5" y="25.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">Noise in / out</text>
<text x="632.5" y="40.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">≡ L2 · smoothing</text>
<rect x="165" y="62" width="125" height="46" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="227.5" y="81.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">Early stopping</text>
<text x="227.5" y="96.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">≈ L2, α ≈ 1/(ηt)</text>
<rect x="300" y="62" width="125" height="46" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="362.5" y="81.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">Ensembles</text>
<text x="362.5" y="96.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">V/k + (k−1)C/k</text>
<rect x="435" y="62" width="125" height="46" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="497.5" y="81.8" text-anchor="middle" style="fill:var(--green-ink);font-size:11.5px;font-weight:700">Dropout</text>
<text x="497.5" y="96.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">2ⁿ thinned nets</text>
<text x="632" y="82" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">each trades a little bias</text>
<text x="632" y="95" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">for much lower variance</text>
</svg>
<p class="fig-cap">Every technique this week buys lower variance at the price of slightly higher bias; dropout is a cheap ensemble of 2ⁿ thinned networks.</p>
</div>

> [!TIP]
> **Everyday pictures for the whole week.**
> - **Bias** is a dart player whose aim is off; **variance** is a dart player with shaky hands.
> - **L2** is a budget: every unit of weight costs something, so only weights that really help survive.
> - **Early stopping** is leaving the exam hall when you have written the good answers, before you start "correcting" them into mistakes.
> - **Ensembles** are asking several doctors and averaging their opinions. **Dropout** is a team where any member may be absent, so nobody can rely on one star player.

---

## 6.1 Bias and variance

### 6.1.1 Setup (the course's thought experiment)

The truth is $y=f(x)+\varepsilon$, $\varepsilon\sim\mathcal N(0,\sigma^2)$. Draw **many different training sets** from this distribution and fit the same model family to each. At a fixed test point $x$, each fit gives a prediction $\hat f(x)$; the predictions vary from one training set to another.

- **Bias:** how far the **average** prediction is from the truth, $\mathrm{Bias}=\mathbb E[\hat f(x)]-f(x)$.
- **Variance:** how much the predictions **scatter** around their own average, $\mathrm{Var}=\mathbb E\big[(\hat f(x)-\mathbb E[\hat f(x)])^2\big]$.

| Model | Bias | Variance | Picture |
|---|---|---|---|
| Simple (e.g. degree-1 polynomial on a curve) | **high** | low | all fits similar, all wrong in the same way |
| Complex (e.g. degree-25 polynomial) | low | **high** | fits wiggle wildly from one training set to the next |

### 6.1.2 [Derivation] The decomposition

Expected squared error at a new point $(x,y)$:
$$\mathbb E\big[(y-\hat f)^2\big]=\mathbb E\big[(f+\varepsilon-\hat f)^2\big]=\mathbb E\big[(f-\hat f)^2\big]+\sigma^2,$$
because $\varepsilon$ has mean 0 and is independent of $\hat f$ (the test noise was not used for training), so the cross term vanishes. Now add and subtract $\mathbb E[\hat f]$:
$$\mathbb E\big[(f-\hat f)^2\big]=\big(f-\mathbb E[\hat f]\big)^2+\mathbb E\big[(\hat f-\mathbb E[\hat f])^2\big]+\underbrace{2\big(f-\mathbb E\hat f\big)\,\mathbb E\big[\mathbb E\hat f-\hat f\big]}_{=0}.$$
$$\boxed{\mathbb E\big[(y-\hat f)^2\big]=\mathrm{Bias}^2+\mathrm{Variance}+\sigma^2}$$
$\sigma^2$ is the **irreducible error**: no model can beat the noise.

### 6.1.3 [Ex] Bias and variance from four fits

Truth $f(x_0)=3$, noise $\sigma^2=0.5$. Four models trained on four datasets predict $2,4,3,5$ at $x_0$.

| Line | Calculation | Result |
|---|---|---|
| 1 | $\mathbb E[\hat f]=(2+4+3+5)/4$ | 3.5 |
| 2 | $\mathrm{Bias}^2=(3.5-3)^2$ | 0.25 |
| 3 | $\mathrm{Var}=\frac{(-1.5)^2+0.5^2+(-0.5)^2+1.5^2}{4}$ | 1.25 |
| 4 | check: $\mathbb E[(\hat f-f)^2]=\frac{1+1+0+4}{4}$ | $1.5=0.25+1.25$ ✓ |
| 5 | expected test error $=0.25+1.25+0.5$ | **2.0** |

<div class="fig" role="img" aria-label="Bias-variance decomposition">
<svg viewBox="0 0 700 218" width="700" style="font-family:var(--font)" aria-hidden="true">
<line x1="46" y1="170" x2="356" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="100" x2="356" y2="100" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="30" x2="356" y2="30" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="30" x2="46" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="201" y1="30" x2="201" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="356" y1="30" x2="356" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="30" x2="46" y2="170" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="46" y1="170" x2="356" y2="170" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="46" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">simple</text>
<text x="201" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400"></text>
<text x="356" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">complex</text>
<text x="40" y="173.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="40" y="103.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="40" y="33.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="201" y="196" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">model complexity</text>
<text x="12" y="100" text-anchor="middle" transform="rotate(-90 12 100)" style="fill:var(--muted);font-size:10.5px;font-weight:400">error</text>
<text x="201" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">the U-shaped test error (illustrative)</text>
<rect x="46" y="30" width="157.4" height="140" rx="0" style="fill:var(--yellow);stroke:none;stroke-width:1.2;opacity:0.25"/>
<rect x="203.4" y="30" width="152.6" height="140" rx="0" style="fill:var(--red);stroke:none;stroke-width:1.2;opacity:0.2"/>
<text x="124.7" y="44" text-anchor="middle" style="fill:var(--yellow-ink);font-size:10.5px;font-weight:700">high bias</text>
<text x="279.7" y="44" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">high variance</text>
<polyline points="46,58 48.6,63 51.2,67.8 53.8,72.4 56.3,76.8 58.9,80.9 61.5,84.9 64.1,88.7 66.7,92.4 69.3,95.9 71.8,99.2 74.4,102.4 77,105.4 79.6,108.3 82.2,111 84.8,113.7 87.3,116.2 89.9,118.6 92.5,120.9 95.1,123.1 97.7,125.2 100.3,127.2 102.8,129.1 105.4,131 108,132.7 110.6,134.4 113.2,136 115.8,137.5 118.3,139 120.9,140.4 123.5,141.7 126.1,143 128.7,144.2 131.3,145.3 133.8,146.4 136.4,147.5 139,148.5 141.6,149.5 144.2,150.4 146.8,151.3 149.3,152.1 151.9,152.9 154.5,153.7 157.1,154.4 159.7,155.1 162.3,155.8 164.8,156.4 167.4,157 170,157.6 172.6,158.1 175.2,158.7 177.8,159.2 180.3,159.7 182.9,160.1 185.5,160.6 188.1,161 190.7,161.4 193.3,161.8 195.8,162.2 198.4,162.5 201,162.8 203.6,163.2 206.2,163.5 208.8,163.8 211.3,164 213.9,164.3 216.5,164.6 219.1,164.8 221.7,165 224.3,165.3 226.8,165.5 229.4,165.7 232,165.9 234.6,166.1 237.2,166.2 239.8,166.4 242.3,166.6 244.9,166.7 247.5,166.9 250.1,167 252.7,167.1 255.3,167.3 257.8,167.4 260.4,167.5 263,167.6 265.6,167.7 268.2,167.8 270.8,167.9 273.3,168 275.9,168.1 278.5,168.2 281.1,168.3 283.7,168.3 286.3,168.4 288.8,168.5 291.4,168.6 294,168.6 296.6,168.7 299.2,168.7 301.8,168.8 304.3,168.9 306.9,168.9 309.5,169 312.1,169 314.7,169 317.3,169.1 319.8,169.1 322.4,169.2 325,169.2 327.6,169.2 330.2,169.3 332.8,169.3 335.3,169.3 337.9,169.4 340.5,169.4 343.1,169.4 345.7,169.5 348.3,169.5 350.8,169.5 353.4,169.5 356,169.5" fill="none" style="stroke:var(--blue-ink);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:5 3"/>
<polyline points="46,169.6 48.6,169.6 51.2,169.5 53.8,169.5 56.3,169.5 58.9,169.5 61.5,169.4 64.1,169.4 66.7,169.4 69.3,169.4 71.8,169.3 74.4,169.3 77,169.3 79.6,169.2 82.2,169.2 84.8,169.2 87.3,169.1 89.9,169.1 92.5,169 95.1,169 97.7,168.9 100.3,168.9 102.8,168.8 105.4,168.8 108,168.7 110.6,168.7 113.2,168.6 115.8,168.6 118.3,168.5 120.9,168.4 123.5,168.3 126.1,168.3 128.7,168.2 131.3,168.1 133.8,168 136.4,167.9 139,167.8 141.6,167.7 144.2,167.6 146.8,167.5 149.3,167.4 151.9,167.2 154.5,167.1 157.1,167 159.7,166.8 162.3,166.7 164.8,166.5 167.4,166.4 170,166.2 172.6,166 175.2,165.8 177.8,165.7 180.3,165.4 182.9,165.2 185.5,165 188.1,164.8 190.7,164.5 193.3,164.3 195.8,164 198.4,163.7 201,163.4 203.6,163.1 206.2,162.8 208.8,162.5 211.3,162.1 213.9,161.7 216.5,161.4 219.1,160.9 221.7,160.5 224.3,160.1 226.8,159.6 229.4,159.1 232,158.6 234.6,158.1 237.2,157.5 239.8,156.9 242.3,156.3 244.9,155.7 247.5,155 250.1,154.3 252.7,153.6 255.3,152.8 257.8,152 260.4,151.1 263,150.3 265.6,149.3 268.2,148.4 270.8,147.4 273.3,146.3 275.9,145.2 278.5,144 281.1,142.8 283.7,141.5 286.3,140.2 288.8,138.8 291.4,137.3 294,135.8 296.6,134.2 299.2,132.5 301.8,130.7 304.3,128.9 306.9,127 309.5,125 312.1,122.9 314.7,120.6 317.3,118.3 319.8,115.9 322.4,113.4 325,110.7 327.6,107.9 330.2,105 332.8,102 335.3,98.8 337.9,95.4 340.5,91.9 343.1,88.3 345.7,84.4 348.3,80.4 350.8,76.2 353.4,71.8 356,67.2" fill="none" style="stroke:var(--red-ink);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:5 3"/>
<polyline points="46,64.3 48.6,69.6 51.2,74.6 53.8,79.4 56.3,83.9 58.9,88.2 61.5,92.3 64.1,96.2 66.7,99.8 69.3,103.3 71.8,106.7 74.4,109.8 77,112.8 79.6,115.7 82.2,118.4 84.8,120.9 87.3,123.4 89.9,125.7 92.5,127.9 95.1,130 97.7,131.9 100.3,133.8 102.8,135.6 105.4,137.3 108,138.9 110.6,140.4 113.2,141.9 115.8,143.3 118.3,144.6 120.9,145.8 123.5,147 126.1,148.1 128.7,149.2 131.3,150.2 133.8,151.2 136.4,152.1 139,153 141.6,153.8 144.2,154.6 146.8,155.3 149.3,156 151.9,156.7 154.5,157.3 157.1,157.9 159.7,158.5 162.3,159 164.8,159.5 167.4,160 170,160.5 172.6,160.9 175.2,161.4 177.8,161.8 180.3,162.1 182.9,162.5 185.5,162.9 188.1,163.2 190.7,163.5 193.3,163.8 195.8,164.1 198.4,164.3 201,164.6 203.6,164.8 206.2,165 208.8,165.2 211.3,165.5 213.9,165.6 216.5,165.8 219.1,166 221.7,166.2 224.3,166.3 226.8,166.5 229.4,166.6 232,166.8 234.6,166.9 237.2,167 239.8,167.1 242.3,167.2 244.9,167.3 247.5,167.4 250.1,167.5 252.7,167.6 255.3,167.7 257.8,167.8 260.4,167.9 263,167.9 265.6,168 268.2,168.1 270.8,168.1 273.3,168.2 275.9,168.2 278.5,168.3 281.1,168.3 283.7,168.4 286.3,168.4 288.8,168.5 291.4,168.5 294,168.6 296.6,168.6 299.2,168.6 301.8,168.7 304.3,168.7 306.9,168.7 309.5,168.8 312.1,168.8 314.7,168.8 317.3,168.8 319.8,168.9 322.4,168.9 325,168.9 327.6,168.9 330.2,168.9 332.8,169 335.3,169 337.9,169 340.5,169 343.1,169 345.7,169 348.3,169.1 350.8,169.1 353.4,169.1 356,169.1" fill="none" style="stroke:var(--green-ink);stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round"/>
<polyline points="46,40.1 48.6,45.1 51.2,49.8 53.8,54.4 56.3,58.8 58.9,62.9 61.5,66.9 64.1,70.7 66.7,74.3 69.3,77.7 71.8,81 74.4,84.2 77,87.2 79.6,90 82.2,92.7 84.8,95.3 87.3,97.8 89.9,100.2 92.5,102.5 95.1,104.6 97.7,106.7 100.3,108.6 102.8,110.5 105.4,112.3 108,114 110.6,115.6 113.2,117.1 115.8,118.6 118.3,119.9 120.9,121.3 123.5,122.5 126.1,123.7 128.7,124.8 131.3,125.9 133.8,126.9 136.4,127.9 139,128.8 141.6,129.7 144.2,130.5 146.8,131.2 149.3,132 151.9,132.6 154.5,133.3 157.1,133.9 159.7,134.4 162.3,135 164.8,135.4 167.4,135.9 170,136.3 172.6,136.7 175.2,137 177.8,137.3 180.3,137.6 182.9,137.9 185.5,138.1 188.1,138.3 190.7,138.4 193.3,138.6 195.8,138.7 198.4,138.7 201,138.8 203.6,138.8 206.2,138.8 208.8,138.7 211.3,138.6 213.9,138.5 216.5,138.4 219.1,138.3 221.7,138.1 224.3,137.8 226.8,137.6 229.4,137.3 232,137 234.6,136.6 237.2,136.3 239.8,135.8 242.3,135.4 244.9,134.9 247.5,134.4 250.1,133.8 252.7,133.2 255.3,132.6 257.8,131.9 260.4,131.2 263,130.4 265.6,129.6 268.2,128.7 270.8,127.8 273.3,126.8 275.9,125.8 278.5,124.7 281.1,123.6 283.7,122.4 286.3,121.1 288.8,119.8 291.4,118.4 294,116.9 296.6,115.4 299.2,113.8 301.8,112 304.3,110.3 306.9,108.4 309.5,106.4 312.1,104.4 314.7,102.2 317.3,99.9 319.8,97.5 322.4,95 325,92.4 327.6,89.7 330.2,86.8 332.8,83.8 335.3,80.6 337.9,77.3 340.5,73.8 343.1,70.2 345.7,66.4 348.3,62.4 350.8,58.2 353.4,53.9 356,49.3" fill="none" style="stroke:var(--fg);stroke-width:2.8;stroke-linejoin:round;stroke-linecap:round"/>
<line x1="203.4" y1="30" x2="203.4" y2="170" style="stroke:var(--fg-2);stroke-width:1.2;stroke-linecap:round;stroke-dasharray:3 3"/>
<circle cx="203.4" cy="138.8" r="4.5" style="fill:var(--surface);stroke:var(--fg);stroke-width:2"/>
<text x="210.4" y="130.8" text-anchor="start" style="fill:var(--fg);font-size:10.5px;font-weight:700">best</text>
<text x="352.9" y="46.7" text-anchor="end" style="fill:var(--fg);font-size:10.5px;font-weight:700">test</text>
<text x="352.9" y="162.1" text-anchor="end" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">train</text>
<text x="98.7" y="142" text-anchor="start" style="fill:var(--blue-ink);font-size:10.5px;font-weight:700">Bias²</text>
<text x="306.4" y="141.4" text-anchor="end" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">Var</text>
<text x="555" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">four fits at x₀ (worked example)</text>
<line x1="430" y1="86" x2="680" y2="86" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="430" y1="83" x2="430" y2="89" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="430" y="101" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<line x1="480" y1="83" x2="480" y2="89" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="480" y="101" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<line x1="530" y1="83" x2="530" y2="89" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="530" y="101" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">3</text>
<line x1="580" y1="83" x2="580" y2="89" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="580" y="101" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<line x1="630" y1="83" x2="630" y2="89" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="630" y="101" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">5</text>
<line x1="680" y1="83" x2="680" y2="89" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="680" y="101" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">6</text>
<line x1="530" y1="50" x2="530" y2="86" style="stroke:var(--green-ink);stroke-width:2;stroke-linecap:round"/>
<text x="526" y="46" text-anchor="end" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">truth 3</text>
<line x1="555" y1="50" x2="555" y2="86" style="stroke:var(--yellow-ink);stroke-width:2;stroke-linecap:round"/>
<text x="559" y="46" text-anchor="start" style="fill:var(--yellow-ink);font-size:10.5px;font-weight:700">mean 3.5</text>
<circle cx="480" cy="72" r="5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<circle cx="530" cy="72" r="5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<circle cx="580" cy="72" r="5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<circle cx="630" cy="72" r="5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<line x1="480" y1="114" x2="630" y2="114" style="stroke:var(--red-ink);stroke-width:1.5;stroke-linecap:round"/>
<line x1="480" y1="110" x2="480" y2="118" style="stroke:var(--red-ink);stroke-width:1.5;stroke-linecap:round"/>
<line x1="630" y1="110" x2="630" y2="118" style="stroke:var(--red-ink);stroke-width:1.5;stroke-linecap:round"/>
<text x="555" y="130" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">spread: Var = 1.25</text>
<rect x="430" y="150" width="31.3" height="22" rx="0" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="445.6" y="165" text-anchor="middle" style="fill:var(--blue-ink);font-size:10px;font-weight:700">0.25</text>
<text x="445.6" y="186" text-anchor="middle" style="fill:var(--blue-ink);font-size:10.5px;font-weight:700">Bias²</text>
<rect x="461.3" y="150" width="156.3" height="22" rx="0" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="539.4" y="165" text-anchor="middle" style="fill:var(--red-ink);font-size:10px;font-weight:700">1.25</text>
<text x="539.4" y="186" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">Var</text>
<rect x="617.5" y="150" width="62.5" height="22" rx="0" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<text x="648.8" y="165" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:700">0.5</text>
<text x="648.8" y="186" text-anchor="middle" style="fill:var(--fg-2);font-size:10.5px;font-weight:700">σ²</text>
<text x="555" y="204" text-anchor="middle" style="fill:var(--fg);font-size:10.5px;font-weight:700">Bias² + Var + σ² = 2.0 expected test error</text>
</svg>
<p class="fig-cap">Left: as complexity grows, bias² falls and variance rises, so test error is U-shaped while training error keeps falling. Right: four fits give mean 3.5 for truth 3, so Bias² = 0.25, Var = 1.25, and with σ² = 0.5 the expected error is 2.0.</p>
</div>

**[Exam] Quiz 2.** A degree-25 polynomial is fit to data $y=f(x)+\varepsilon$; the training set is then enlarged with more samples from the same distribution, model unchanged. Effect?
- ✓ **Variance tends to decrease, bias stays about the same.** More data pins down the wiggly fit (less scatter between datasets), but the family of degree-25 polynomials, and hence how close its *average* fit can get to $f$, is unchanged.
- ✗ "Bias decreases significantly": bias depends on the model family, not the amount of data.
- ✗ "Both become zero": $\sigma^2$ is irreducible, and finite data leaves some variance.
- ✗ "No effect": variance clearly drops.

### 6.1.4 The U-shaped test error

As complexity grows, training error keeps falling, while test error first falls (bias dropping) and then rises (variance exploding). The best model sits at the bottom of the test-error U. Regularization lets us use a complex model but pull it back toward that bottom.

---

## 6.2 Train error vs test error (why training error lies)

### 6.2.1 [Derivation] The gap, via Stein's lemma

Write $\hat f_i=\hat f(x_i)$, $f_i=f(x_i)$, $y_i=f_i+\varepsilon_i$. For any point,
$$\mathbb E[(\hat f_i-y_i)^2]=\mathbb E[(\hat f_i-f_i)^2]+\sigma^2-2\,\mathbb E[\varepsilon_i(\hat f_i-f_i)].$$
- **Test point:** $\varepsilon_i$ was not seen in training, so it is independent of $\hat f_i$ and the last term is 0.
- **Training point:** $\hat f_i$ was fit using $y_i$, so it is correlated with $\varepsilon_i$. **Stein's lemma** (for Gaussian noise) gives $\mathbb E[\varepsilon_i(\hat f_i-f_i)]=\sigma^2\,\mathbb E\big[\partial\hat f_i/\partial y_i\big]$.

Putting the two together (averaging over $m$ training points):
$$\boxed{\text{true error}=\text{training error}+\frac{2\sigma^2}{m}\sum_{i=1}^m\frac{\partial\hat f(x_i)}{\partial y_i}}$$

**[Intuition]** $\partial\hat f(x_i)/\partial y_i$ asks: *if I nudge one training label, how much does the model's prediction at that point follow?* A model that memorises ($\hat f(x_i)=y_i$) has derivative 1 everywhere: maximum optimism. A very rigid model barely reacts: small gap. So **the more a model can bend to individual labels, the more its training error underestimates its true error.** Regularization reduces that sensitivity.

**[Ex]** For ordinary least squares with $p$ parameters, $\sum_i\partial\hat f(x_i)/\partial y_i=p$ (the trace of the "hat" matrix). With $\sigma^2=1$, $m=100$, $p=10$: gap $=2\cdot1\cdot10/100=0.2$. Double the parameters, double the gap.

---

## 6.3 L2 regularization

### 6.3.1 Objective and update

$$\tilde{\mathcal L}(\mathbf w)=\mathcal L(\mathbf w)+\frac\alpha2\lVert\mathbf w\rVert^2,\qquad \nabla\tilde{\mathcal L}=\nabla\mathcal L+\alpha\mathbf w,$$
$$\mathbf w_{t+1}=\mathbf w_t-\eta\nabla\mathcal L(\mathbf w_t)-\eta\alpha\mathbf w_t=\underbrace{(1-\eta\alpha)}_{\text{decay}}\mathbf w_t-\eta\nabla\mathcal L(\mathbf w_t).$$
Every step first **shrinks** the weights by a constant factor, then takes the usual step: hence the name **weight decay**.

**[Exam] End-term.** $J(w)=L(w)+\frac\lambda2w^2$, $w_t=3$, $\partial L/\partial w=4$, $\lambda=0.1$, $\eta=0.05$:

| Line | Calculation | Result |
|---|---|---|
| 1 | $\nabla J=\nabla L+\lambda w=4+0.1\times3$ | 4.3 |
| 2 | $w_{t+1}=3-0.05\times4.3$ | **2.785** |
| 3 | check with the decay form: $(1-0.005)\times3-0.05\times4$ | $2.985-0.2=2.785$ ✓ |

### 6.3.2 [Derivation] Where L2 moves the optimum

Let $\mathbf w^*$ minimise the unregularized loss. Near it, a second-order Taylor expansion (gradient is 0 at a minimum) gives
$$\mathcal L(\mathbf w)\approx\mathcal L(\mathbf w^*)+\tfrac12(\mathbf w-\mathbf w^*)^\top H(\mathbf w-\mathbf w^*),\qquad \nabla\mathcal L(\mathbf w)\approx H(\mathbf w-\mathbf w^*).$$
At the regularized optimum $\tilde{\mathbf w}$: $H(\tilde{\mathbf w}-\mathbf w^*)+\alpha\tilde{\mathbf w}=0$, so
$$\tilde{\mathbf w}=(H+\alpha I)^{-1}H\,\mathbf w^*.$$
Diagonalise $H=Q\Lambda Q^\top$ ($Q$ orthogonal, $\Lambda=\mathrm{diag}(\lambda_i)$):
$$\tilde{\mathbf w}=Q(\Lambda+\alpha I)^{-1}\Lambda\,Q^\top\mathbf w^*\quad\Longrightarrow\quad\boxed{\text{component }i\text{ is scaled by }\frac{\lambda_i}{\lambda_i+\alpha}}$$

| Direction | $\lambda_i$ vs $\alpha$ | factor $\frac{\lambda_i}{\lambda_i+\alpha}$ | meaning |
|---|---|---|---|
| high curvature (loss cares a lot) | $\lambda_i\gg\alpha$ | ≈ 1 | kept |
| low curvature (loss barely cares) | $\lambda_i\ll\alpha$ | ≈ 0 | shrunk away |
| no regularization | $\alpha=0$ | 1 | $\tilde{\mathbf w}=\mathbf w^*$ |

**Effective number of parameters** $=\sum_i\frac{\lambda_i}{\lambda_i+\alpha}<n$: L2 quietly switches off the directions the data does not support.

**[Ex]** Eigenvalues $10,1,0.1$, $\alpha=1$: factors $0.909,\ 0.5,\ 0.091$; effective parameters $\approx1.5$ instead of 3.

**[Ex] 1-D check.** $\mathcal L=(w-4)^2$ (so $H=2$, $w^*=4$), $\alpha=2$. Formula: $\tilde w=\frac{2}{2+2}\cdot4=2$. Direct: minimise $(w-4)^2+w^2$: $2(w-4)+2w=0\Rightarrow w=2$ ✓.

<div class="fig" role="img" aria-label="L2 regularisation geometry">
<svg viewBox="0 0 700 226" width="700" style="font-family:var(--font)" aria-hidden="true">
<line x1="46" y1="170" x2="296" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="103.3" x2="296" y2="103.3" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="36.7" x2="296" y2="36.7" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="71.1" y1="30" x2="71.1" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="154.4" y1="30" x2="154.4" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="237.8" y1="30" x2="237.8" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="30" x2="46" y2="170" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="46" y1="170" x2="296" y2="170" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="71.1" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.1</text>
<text x="154.4" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="237.8" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">10</text>
<text x="40" y="173.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="40" y="106.8" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.5</text>
<text x="40" y="40.2" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="171" y="196" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">curvature λᵢ of the direction</text>
<text x="12" y="100" text-anchor="middle" transform="rotate(-90 12 100)" style="fill:var(--muted);font-size:10.5px;font-weight:400">factor kept</text>
<text x="171" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">L2 scales each direction by λᵢ / (λᵢ + α)</text>
<polyline points="46,163.7 47.6,163.4 49.1,163.1 50.7,162.8 52.3,162.5 53.8,162.2 55.4,161.9 56.9,161.6 58.5,161.2 60.1,160.8 61.6,160.5 63.2,160.1 64.8,159.7 66.3,159.3 67.9,158.8 69.4,158.4 71,157.9 72.6,157.4 74.1,156.9 75.7,156.4 77.3,155.9 78.8,155.3 80.4,154.7 81.9,154.1 83.5,153.5 85.1,152.9 86.6,152.2 88.2,151.6 89.8,150.9 91.3,150.2 92.9,149.4 94.4,148.7 96,147.9 97.6,147.1 99.1,146.2 100.7,145.4 102.3,144.5 103.8,143.6 105.4,142.7 106.9,141.7 108.5,140.7 110.1,139.7 111.6,138.7 113.2,137.7 114.8,136.6 116.3,135.5 117.9,134.4 119.4,133.3 121,132.1 122.6,130.9 124.1,129.7 125.7,128.5 127.3,127.2 128.8,126 130.4,124.7 131.9,123.4 133.5,122.1 135.1,120.7 136.6,119.4 138.2,118 139.8,116.7 141.3,115.3 142.9,113.9 144.4,112.5 146,111.1 147.6,109.6 149.1,108.2 150.7,106.8 152.3,105.3 153.8,103.9 155.4,102.5 156.9,101 158.5,99.6 160.1,98.1 161.6,96.7 163.2,95.3 164.8,93.9 166.3,92.5 167.9,91.1 169.4,89.7 171,88.3 172.6,87 174.1,85.6 175.7,84.3 177.3,83 178.8,81.7 180.4,80.4 181.9,79.1 183.5,77.9 185.1,76.7 186.6,75.5 188.2,74.3 189.8,73.2 191.3,72 192.9,70.9 194.4,69.8 196,68.8 197.6,67.7 199.1,66.7 200.7,65.7 202.3,64.7 203.8,63.8 205.4,62.9 206.9,62 208.5,61.1 210.1,60.3 211.6,59.4 213.2,58.6 214.8,57.8 216.3,57.1 217.9,56.4 219.4,55.6 221,54.9 222.6,54.3 224.1,53.6 225.7,53 227.3,52.4 228.8,51.8 230.4,51.2 231.9,50.7 233.5,50.1 235.1,49.6 236.6,49.1 238.2,48.7 239.8,48.2 241.3,47.7 242.9,47.3 244.4,46.9 246,46.5 247.6,46.1 249.1,45.7 250.7,45.4 252.2,45 253.8,44.7 255.4,44.4 256.9,44.1 258.5,43.8 260.1,43.5 261.6,43.2 263.2,43 264.8,42.7 266.3,42.5 267.9,42.2 269.4,42 271,41.8 272.6,41.6 274.1,41.4 275.7,41.2 277.3,41 278.8,40.8 280.4,40.7 281.9,40.5 283.5,40.3 285.1,40.2 286.6,40 288.2,39.9 289.8,39.8 291.3,39.6 292.9,39.5 294.4,39.4 296,39.3" fill="none" style="stroke:var(--blue-ink);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round"/>
<polyline points="46,125.6 47.6,124.3 49.1,123 50.7,121.6 52.3,120.3 53.8,118.9 55.4,117.6 56.9,116.2 58.5,114.8 60.1,113.4 61.6,112 63.2,110.6 64.8,109.2 66.3,107.7 67.9,106.3 69.4,104.9 71,103.4 72.6,102 74.1,100.5 75.7,99.1 77.3,97.7 78.8,96.2 80.4,94.8 81.9,93.4 83.5,92 85.1,90.6 86.6,89.2 88.2,87.9 89.8,86.5 91.3,85.2 92.9,83.8 94.4,82.5 96,81.3 97.6,80 99.1,78.7 100.7,77.5 102.3,76.3 103.8,75.1 105.4,73.9 106.9,72.8 108.5,71.6 110.1,70.5 111.6,69.5 113.2,68.4 114.8,67.4 116.3,66.4 117.9,65.4 119.4,64.4 121,63.5 122.6,62.6 124.1,61.7 125.7,60.8 127.3,60 128.8,59.2 130.4,58.4 131.9,57.6 133.5,56.8 135.1,56.1 136.6,55.4 138.2,54.7 139.8,54.1 141.3,53.4 142.9,52.8 144.4,52.2 146,51.6 147.6,51 149.1,50.5 150.7,50 152.3,49.5 153.8,49 155.4,48.5 156.9,48 158.5,47.6 160.1,47.2 161.6,46.8 163.2,46.4 164.8,46 166.3,45.6 167.9,45.3 169.4,44.9 171,44.6 172.6,44.3 174.1,44 175.7,43.7 177.3,43.4 178.8,43.1 180.4,42.9 181.9,42.6 183.5,42.4 185.1,42.1 186.6,41.9 188.2,41.7 189.8,41.5 191.3,41.3 192.9,41.1 194.4,40.9 196,40.8 197.6,40.6 199.1,40.4 200.7,40.3 202.3,40.1 203.8,40 205.4,39.9 206.9,39.7 208.5,39.6 210.1,39.5 211.6,39.4 213.2,39.2 214.8,39.1 216.3,39 217.9,38.9 219.4,38.8 221,38.8 222.6,38.7 224.1,38.6 225.7,38.5 227.3,38.4 228.8,38.4 230.4,38.3 231.9,38.2 233.5,38.1 235.1,38.1 236.6,38 238.2,38 239.8,37.9 241.3,37.9 242.9,37.8 244.4,37.8 246,37.7 247.6,37.7 249.1,37.6 250.7,37.6 252.2,37.6 253.8,37.5 255.4,37.5 256.9,37.4 258.5,37.4 260.1,37.4 261.6,37.4 263.2,37.3 264.8,37.3 266.3,37.3 267.9,37.2 269.4,37.2 271,37.2 272.6,37.2 274.1,37.2 275.7,37.1 277.3,37.1 278.8,37.1 280.4,37.1 281.9,37.1 283.5,37 285.1,37 286.6,37 288.2,37 289.8,37 291.3,37 292.9,37 294.4,36.9 296,36.9" fill="none" style="stroke:var(--green-ink);stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:6 4"/>
<text x="183" y="119.3" text-anchor="start" style="fill:var(--blue-ink);font-size:10.5px;font-weight:700">α = 1</text>
<text x="58.2" y="87.3" text-anchor="start" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">α = 0.1</text>
<circle cx="237.8" cy="48.8" r="4.5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<text x="244.8" y="64.8" text-anchor="start" style="fill:var(--blue-ink);font-size:10px;font-weight:700">0.909</text>
<circle cx="154.4" cy="103.3" r="4.5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<text x="161.4" y="117.3" text-anchor="start" style="fill:var(--blue-ink);font-size:10px;font-weight:700">0.5</text>
<circle cx="71.1" cy="157.9" r="4.5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<text x="78.1" y="171.9" text-anchor="start" style="fill:var(--blue-ink);font-size:10px;font-weight:700">0.091</text>
<line x1="380" y1="177.8" x2="550" y2="177.8" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="380" y1="107" x2="550" y2="107" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="380" y1="36.2" x2="550" y2="36.2" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="394.2" y1="22" x2="394.2" y2="192" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="465" y1="22" x2="465" y2="192" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="535.8" y1="22" x2="535.8" y2="192" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="380" y1="22" x2="380" y2="192" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="380" y1="192" x2="550" y2="192" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="394.2" y="205" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="465" y="205" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="535.8" y="205" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="374" y="181.3" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="374" y="110.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="374" y="39.7" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="465" y="218" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">u: steep (λ = 4)</text>
<text x="350" y="107" text-anchor="middle" transform="rotate(-90 350 107)" style="fill:var(--muted);font-size:10.5px;font-weight:400">v: flat (λ = 1)</text>
<text x="465" y="14" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">weight space, α swept 0 → 12</text>
<ellipse cx="465" cy="107" rx="14.2" ry="28.3" style="fill:none;stroke:var(--blue-ink);stroke-width:1.3;opacity:0.5"/>
<ellipse cx="465" cy="107" rx="22.7" ry="45.4" style="fill:none;stroke:var(--blue-ink);stroke-width:1.3;opacity:0.9"/>
<ellipse cx="465" cy="107" rx="38.8" ry="77.6" style="fill:none;stroke:var(--blue-ink);stroke-width:1.3;opacity:0.5"/>
<polyline points="459.5,191.7 460.3,187.1 460.8,182.5 461,177.8 460.8,173.2 460.3,168.5 459.5,163.9 458.4,159.4 456.9,155 455.2,150.7 453.1,146.5 450.8,142.4 448.2,138.6 445.3,134.9 442.2,131.4 438.9,128.2 435.3,125.2 431.5,122.5 427.6,120 423.4,117.8 419.2,115.9 414.8,114.3 410.3,113 405.8,112.1 401.1,111.4 396.5,111.1 391.8,111.1 387.2,111.4 382.6,112.1" fill="none" style="stroke:var(--red-ink);stroke-width:1.5;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:4 3"/>
<polyline points="465,107 460.8,121.2 457.1,130.6 453.8,137.4 450.8,142.4 448.1,146.4 445.7,149.5 443.4,152.1 441.4,154.2 439.5,156 437.8,157.6 436.1,158.9 434.6,160.1 433.2,161.2 431.9,162.1 430.7,162.9 429.6,163.7 428.5,164.3 427.5,165 426.5,165.5 425.6,166 424.8,166.5 424,166.9 423.2,167.3 422.5,167.7 421.8,168.1 421.2,168.4 420.5,168.7 419.9,169 419.4,169.2 418.8,169.5 418.3,169.7 417.8,170 417.3,170.2 416.8,170.4 416.4,170.6 416,170.8 415.6,170.9 415.2,171.1 414.8,171.2 414.4,171.4 414,171.5 413.7,171.7 413.4,171.8 413.1,171.9 412.7,172.1 412.4,172.2 412.2,172.3 411.9,172.4" fill="none" style="stroke:var(--green-ink);stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round"/>
<circle cx="465" cy="107" r="5" style="fill:var(--green);stroke:var(--green-ink);stroke-width:2"/>
<text x="473" y="101" text-anchor="start" style="fill:var(--green-ink);font-size:11px;font-weight:700">w*</text>
<circle cx="450.8" cy="142.4" r="5" style="fill:var(--red);stroke:var(--red-ink);stroke-width:2"/>
<text x="458.8" y="156.4" text-anchor="start" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">w̃ (α = 1)</text>
<circle r="4" style="fill:var(--fg)"><animateMotion dur="6s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.8;1" path="M465,107 L460.8,121.2 L457.1,130.6 L453.8,137.4 L450.8,142.4 L448.1,146.4 L445.7,149.5 L443.4,152.1 L441.4,154.2 L439.5,156 L437.8,157.6 L436.1,158.9 L434.6,160.1 L433.2,161.2 L431.9,162.1 L430.7,162.9 L429.6,163.7 L428.5,164.3 L427.5,165 L426.5,165.5 L425.6,166 L424.8,166.5 L424,166.9 L423.2,167.3 L422.5,167.7 L421.8,168.1 L421.2,168.4 L420.5,168.7 L419.9,169 L419.4,169.2 L418.8,169.5 L418.3,169.7 L417.8,170 L417.3,170.2 L416.8,170.4 L416.4,170.6 L416,170.8 L415.6,170.9 L415.2,171.1 L414.8,171.2 L414.4,171.4 L414,171.5 L413.7,171.7 L413.4,171.8 L413.1,171.9 L412.7,172.1 L412.4,172.2 L412.2,172.3 L411.9,172.4"/></circle>
<text x="566" y="70" text-anchor="start" style="fill:var(--fg-2);font-size:10.5px;font-weight:700">flat direction v</text>
<text x="566" y="83" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">shrinks first,</text>
<text x="566" y="96" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">steep u barely moves</text>
<text x="566" y="124" text-anchor="start" style="fill:var(--red-ink);font-size:10.5px;font-weight:400">dashed circle ‖w‖ = ‖w̃‖</text>
<text x="566" y="137" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">touches the loss contour</text>
<text x="566" y="150" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">at w̃ (tangent)</text>
</svg>
<p class="fig-cap">Left: L2 keeps steep directions (λ ≫ α) and removes flat ones. Right: for a loss with Hessian diag(4, 1) the regularised optimum slides from w* toward 0 as α grows; at α = 1 it is w̃ = (0.8, 0.5).</p>
</div>

<details>
<summary><b>Try it yourself</b>: w = 2, ∂L/∂w = −1, η = 0.1, α = 0.5. New w?</summary>

$\nabla\tilde{\mathcal L}=-1+0.5\times2=0$, so $w$ stays at 2: the loss gradient and the decay exactly balance. That is what a regularized optimum looks like.

</details>

---

## 6.4 Dataset augmentation

Create new training examples by applying transformations that **do not change the label**: rotations, shifts, crops, flips, scaling, colour/brightness changes, small noise. More (realistic) data ⇒ lower variance (§6.1.3).

**[!]** The transform must preserve the label. Flipping a "6" vertically makes a "9"; rotating a "b" can make a "q". Choose transforms that respect the task.

---

## 6.5 Parameter sharing and tying

- **Sharing:** the same weights are used at many places. CNNs (Week 8) use one small filter across the whole image, so a layer needs hundreds of parameters instead of millions.
- **Tying:** two parts of a network are forced to have related weights, e.g. autoencoder decoder $W^*=W^\top$ (Week 5).

Both reduce the number of **free** parameters, which reduces variance.

---

## 6.6 Injecting noise at the input

### 6.6.1 [Derivation] Noise = L2 for a linear model

Model $\hat y=\sum_iw_ix_i$. Train on noisy inputs $\tilde x_i=x_i+\varepsilon_i$, $\varepsilon_i\sim\mathcal N(0,\sigma^2)$ independent. The prediction becomes $\tilde y=\hat y+\sum_iw_i\varepsilon_i$, and
$$\mathbb E\big[(\tilde y-y)^2\big]=\mathbb E\big[(\hat y-y)^2\big]+2\,\mathbb E\Big[(\hat y-y)\sum_iw_i\varepsilon_i\Big]+\mathbb E\Big[\Big(\sum_iw_i\varepsilon_i\Big)^2\Big].$$
- Middle term: the noise is independent with mean 0, so it is **0**.
- Last term: $\sum_iw_i^2\mathbb E[\varepsilon_i^2]+\sum_{i\ne j}w_iw_j\mathbb E[\varepsilon_i]\mathbb E[\varepsilon_j]=\sigma^2\sum_iw_i^2$.

$$\boxed{\mathbb E\big[(\tilde y-y)^2\big]=\mathbb E\big[(\hat y-y)^2\big]+\sigma^2\lVert\mathbf w\rVert^2}$$
Training with Gaussian input noise **is** L2 regularization with $\alpha/2=\sigma^2$ (for linear models; approximately for others). The denoising autoencoder of Week 5 is the same idea.

**[Ex]** $\mathbf w=(2,-1)$, $\sigma^2=0.1$: implicit penalty $0.1\times(4+1)=0.5$.

---

## 6.7 Injecting noise at the output (label smoothing)

Hard one-hot targets push the network to output probability exactly 1, which needs logits going to infinity: overconfidence and large weights. **Soft targets** with $k$ classes and a small $\varepsilon$:
$$y_{\text{correct}}=1-\varepsilon,\qquad y_{\text{other}}=\frac{\varepsilon}{k-1}.$$

**[Ex]** $k=10$, $\varepsilon=0.1$: correct $0.9$, each other class $0.1/9=0.0111$.

Prediction gives the correct class $0.7$ and $0.0333$ to each of the others:

| Target | Cross-entropy | Minimised when |
|---|---|---|
| hard $(1,0,\dots)$ | $-\ln0.7=0.357$ | $p_{\text{correct}}\to1$ (logits → ∞) |
| smoothed $(0.9,0.011,\dots)$ | $-[0.9\ln0.7+9(0.0111)\ln0.0333]=0.661$ | $p_{\text{correct}}=0.9$ exactly |

The smoothed target has a **finite** optimum, so the weights have no reason to grow without bound.

---

## 6.8 Early stopping

### 6.8.1 The procedure

Track validation error during training. Keep the best weights so far. If validation error has not improved for **$p$ epochs** (patience), stop and return the best weights.

**[Ex]** Validation errors by epoch: $0.50,\,0.42,\,0.38,\,0.37,\,0.39,\,0.38,\,0.40,\,0.41$, patience $p=3$.

| Epoch | Val error | Best so far | Epochs without improvement |
|---|---|---|---|
| 1 | 0.50 | 0.50 (ep 1) | 0 |
| 2 | 0.42 | 0.42 (ep 2) | 0 |
| 3 | 0.38 | 0.38 (ep 3) | 0 |
| 4 | 0.37 | **0.37 (ep 4)** | 0 |
| 5 | 0.39 | 0.37 | 1 |
| 6 | 0.38 | 0.37 | 2 |
| 7 | 0.40 | 0.37 | **3 ⇒ stop** |

Training stops after epoch 7 and returns the **epoch-4** weights. (Epoch 6 improved on epoch 5 but not on the best, so it does not reset the counter.)

### 6.8.2 [Derivation] Early stopping behaves like L2

Take the quadratic loss of §6.3.2, start from $\mathbf w_0=\mathbf 0$, run GD with rate $\eta$. In the eigenbasis each component evolves independently (Week 4, §4.1):
$$(Q^\top\mathbf w_t)_i=\big[1-(1-\eta\lambda_i)^t\big](Q^\top\mathbf w^*)_i.$$
Compare L2: $(Q^\top\tilde{\mathbf w})_i=\frac{\lambda_i}{\lambda_i+\alpha}(Q^\top\mathbf w^*)_i=\big[1-\frac{\alpha}{\lambda_i+\alpha}\big](Q^\top\mathbf w^*)_i$.

They match when $(1-\eta\lambda_i)^t=\frac{\alpha}{\lambda_i+\alpha}$. Take logs and use $\ln(1+x)\approx x$ for small $\eta\lambda_i$ and small $\lambda_i/\alpha$: $-t\eta\lambda_i\approx-\lambda_i/\alpha$, so
$$\boxed{\alpha\approx\frac{1}{\eta\,t}}$$
**Stopping after $t$ steps ≈ L2 with strength $1/(\eta t)$.** Stop earlier ⇒ stronger regularization.

**[Ex]** $\eta=0.01$, $t=1000\Rightarrow\alpha\approx0.1$. Compare the kept fraction per direction:

| $\lambda_i$ | early stopping $1-(1-\eta\lambda)^t$ | L2 $\frac{\lambda}{\lambda+0.1}$ |
|---|---|---|
| 10 (steep) | 1.000 | 0.990 |
| 0.05 (flat) | 0.394 | 0.333 |

Same pattern: steep directions are learned fully, flat directions are held back because GD has not had time to travel along them.

<div class="fig" role="img" aria-label="Early stopping">
<svg viewBox="0 0 700 206" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="196" y="30" width="112.5" height="140" rx="0" style="fill:var(--red);stroke:none;stroke-width:1.2;opacity:0.28"/>
<line x1="46" y1="170" x2="346" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="106.4" x2="346" y2="106.4" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="42.7" x2="346" y2="42.7" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="64.8" y1="30" x2="64.8" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="102.3" y1="30" x2="102.3" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="139.8" y1="30" x2="139.8" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="177.3" y1="30" x2="177.3" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="214.8" y1="30" x2="214.8" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="252.3" y1="30" x2="252.3" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="289.8" y1="30" x2="289.8" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="327.3" y1="30" x2="327.3" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="30" x2="46" y2="170" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="46" y1="170" x2="346" y2="170" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="64.8" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="102.3" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">2</text>
<text x="139.8" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">3</text>
<text x="177.3" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">4</text>
<text x="214.8" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">5</text>
<text x="252.3" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">6</text>
<text x="289.8" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">7</text>
<text x="327.3" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">8</text>
<text x="40" y="173.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.00</text>
<text x="40" y="109.9" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.25</text>
<text x="40" y="46.2" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.50</text>
<text x="196" y="196" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">epoch</text>
<text x="12" y="100" text-anchor="middle" transform="rotate(-90 12 100)" style="fill:var(--muted);font-size:10.5px;font-weight:400">error</text>
<text x="196" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">validation error and patience p = 3</text>
<text x="252.3" y="43" text-anchor="middle" style="fill:var(--red-ink);font-size:10px;font-weight:700">no new best for 3 epochs</text>
<polyline points="64.8,55.5 102.3,86 139.8,106.4 177.3,121.6 214.8,134.4 252.3,144.5 289.8,152.2 327.3,157.3" fill="none" style="stroke:var(--green-ink);stroke-width:2;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:5 3"/>
<polyline points="64.8,42.7 102.3,63.1 139.8,73.3 177.3,75.8 214.8,70.7 252.3,73.3 289.8,68.2 327.3,65.6" fill="none" style="stroke:var(--fg);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round"/>
<circle cx="64.8" cy="42.7" r="3.6" style="fill:var(--surface);stroke:var(--fg);stroke-width:1.6"/>
<circle cx="102.3" cy="63.1" r="3.6" style="fill:var(--surface);stroke:var(--fg);stroke-width:1.6"/>
<circle cx="139.8" cy="73.3" r="3.6" style="fill:var(--surface);stroke:var(--fg);stroke-width:1.6"/>
<circle cx="177.3" cy="75.8" r="6" style="fill:var(--green);stroke:var(--green-ink);stroke-width:2.2"/>
<circle cx="214.8" cy="70.7" r="3.6" style="fill:var(--surface);stroke:var(--fg);stroke-width:1.6"/>
<circle cx="252.3" cy="73.3" r="3.6" style="fill:var(--surface);stroke:var(--fg);stroke-width:1.6"/>
<circle cx="289.8" cy="68.2" r="3.6" style="fill:var(--surface);stroke:var(--fg);stroke-width:1.6"/>
<circle cx="327.3" cy="65.6" r="3.6" style="fill:var(--surface);stroke:var(--fg);stroke-width:1.6"/>
<text x="177.3" y="101.8" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">best 0.37: return these weights</text>
<text x="289.8" y="59.2" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">stop</text>
<text x="109.8" y="40.7" text-anchor="start" style="fill:var(--fg);font-size:10.5px;font-weight:700">validation</text>
<text x="267.3" y="162.4" text-anchor="middle" style="fill:var(--green-ink);font-size:10px;font-weight:700">training (illustrative)</text>
<circle r="4" style="fill:var(--fg)"><animateMotion dur="6s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.8;1" path="M64.8,42.7 L102.3,63.1 L139.8,73.3 L177.3,75.8 L214.8,70.7 L252.3,73.3 L289.8,68.2 L327.3,65.6"/></circle>
<line x1="440" y1="170" x2="680" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="440" y1="103.3" x2="680" y2="103.3" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="440" y1="36.7" x2="680" y2="36.7" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="440" y1="30" x2="440" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="512.7" y1="30" x2="512.7" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="585.4" y1="30" x2="585.4" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="658.1" y1="30" x2="658.1" y2="170" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="440" y1="30" x2="440" y2="170" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="440" y1="170" x2="680" y2="170" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="440" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.01</text>
<text x="512.7" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0.1</text>
<text x="585.4" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="658.1" y="183" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">10</text>
<text x="434" y="173.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="434" y="106.8" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.5</text>
<text x="434" y="40.2" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="560" y="196" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">curvature λᵢ</text>
<text x="406" y="100" text-anchor="middle" transform="rotate(-90 406 100)" style="fill:var(--muted);font-size:10.5px;font-weight:400">fraction learned</text>
<text x="560" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">early stopping ≈ L2 with α = 1/(ηt)</text>
<polyline points="440,157.3 441.2,156.8 442.4,156.4 443.6,155.9 444.8,155.3 446,154.8 447.2,154.3 448.4,153.7 449.6,153.1 450.8,152.5 452,151.9 453.2,151.2 454.4,150.5 455.6,149.8 456.8,149.1 458,148.4 459.2,147.6 460.4,146.8 461.6,146 462.8,145.2 464,144.3 465.2,143.4 466.4,142.5 467.6,141.6 468.8,140.6 470,139.6 471.2,138.6 472.4,137.5 473.6,136.4 474.8,135.3 476,134.2 477.2,133 478.4,131.8 479.6,130.6 480.8,129.3 482,128 483.2,126.7 484.4,125.3 485.6,123.9 486.8,122.5 488,121.1 489.2,119.6 490.4,118.1 491.6,116.5 492.8,114.9 494,113.4 495.2,111.7 496.4,110.1 497.6,108.4 498.8,106.7 500,105 501.2,103.2 502.4,101.4 503.6,99.7 504.8,97.9 506,96 507.2,94.2 508.4,92.4 509.6,90.5 510.8,88.7 512,86.8 513.2,84.9 514.4,83.1 515.6,81.2 516.8,79.3 518,77.5 519.2,75.7 520.4,73.9 521.6,72.1 522.8,70.3 524,68.5 525.2,66.8 526.4,65.1 527.6,63.5 528.8,61.9 530,60.3 531.2,58.8 532.4,57.3 533.6,55.8 534.8,54.4 536,53.1 537.2,51.8 538.4,50.6 539.6,49.4 540.8,48.3 542,47.3 543.2,46.3 544.4,45.3 545.6,44.5 546.8,43.7 548,42.9 549.2,42.2 550.4,41.6 551.6,41 552.8,40.4 554,39.9 555.2,39.5 556.4,39.1 557.6,38.8 558.8,38.4 560,38.2 561.2,37.9 562.4,37.7 563.6,37.5 564.8,37.4 566,37.3 567.2,37.1 568.4,37 569.6,37 570.8,36.9 572,36.9 573.2,36.8 574.4,36.8 575.6,36.8 576.8,36.7 578,36.7 579.2,36.7 580.4,36.7 581.6,36.7 582.8,36.7 584,36.7 585.2,36.7 586.4,36.7 587.6,36.7 588.8,36.7 590,36.7 591.2,36.7 592.4,36.7 593.6,36.7 594.8,36.7 596,36.7 597.2,36.7 598.4,36.7 599.6,36.7 600.8,36.7 602,36.7 603.2,36.7 604.4,36.7 605.6,36.7 606.8,36.7 608,36.7 609.2,36.7 610.4,36.7 611.6,36.7 612.8,36.7 614,36.7 615.2,36.7 616.4,36.7 617.6,36.7 618.8,36.7 620,36.7 621.2,36.7 622.4,36.7 623.6,36.7 624.8,36.7 626,36.7 627.2,36.7 628.4,36.7 629.6,36.7 630.8,36.7 632,36.7 633.2,36.7 634.4,36.7 635.6,36.7 636.8,36.7 638,36.7 639.2,36.7 640.4,36.7 641.6,36.7 642.8,36.7 644,36.7 645.2,36.7 646.4,36.7 647.6,36.7 648.8,36.7 650,36.7 651.2,36.7 652.4,36.7 653.6,36.7 654.8,36.7 656,36.7 657.2,36.7 658.4,36.7 659.6,36.7 660.8,36.7 662,36.7 663.2,36.7 664.4,36.7 665.6,36.7 666.8,36.7 668,36.7 669.2,36.7 670.4,36.7 671.6,36.7 672.8,36.7 674,36.7 675.2,36.7 676.4,36.7 677.6,36.7 678.8,36.7 680,36.7" fill="none" style="stroke:var(--fg);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round"/>
<polyline points="440,157.9 441.2,157.5 442.4,157 443.6,156.6 444.8,156.1 446,155.6 447.2,155.1 448.4,154.6 449.6,154.1 450.8,153.5 452,153 453.2,152.4 454.4,151.8 455.6,151.2 456.8,150.6 458,150 459.2,149.3 460.4,148.6 461.6,147.9 462.8,147.2 464,146.5 465.2,145.8 466.4,145 467.6,144.2 468.8,143.4 470,142.6 471.2,141.8 472.4,140.9 473.6,140 474.8,139.1 476,138.2 477.2,137.3 478.4,136.4 479.6,135.4 480.8,134.4 482,133.4 483.2,132.4 484.4,131.4 485.6,130.3 486.8,129.2 488,128.2 489.2,127.1 490.4,125.9 491.6,124.8 492.8,123.7 494,122.5 495.2,121.4 496.4,120.2 497.6,119 498.8,117.8 500,116.6 501.2,115.3 502.4,114.1 503.6,112.9 504.8,111.6 506,110.4 507.2,109.1 508.4,107.9 509.6,106.6 510.8,105.3 512,104.1 513.2,102.8 514.4,101.5 515.6,100.3 516.8,99 518,97.8 519.2,96.5 520.4,95.2 521.6,94 522.8,92.8 524,91.5 525.2,90.3 526.4,89.1 527.6,87.9 528.8,86.7 530,85.5 531.2,84.3 532.4,83.2 533.6,82 534.8,80.9 536,79.8 537.2,78.7 538.4,77.6 539.6,76.5 540.8,75.5 542,74.4 543.2,73.4 544.4,72.4 545.6,71.4 546.8,70.5 548,69.5 549.2,68.6 550.4,67.7 551.6,66.8 552.8,65.9 554,65 555.2,64.2 556.4,63.4 557.6,62.6 558.8,61.8 560,61 561.2,60.3 562.4,59.6 563.6,58.8 564.8,58.1 566,57.5 567.2,56.8 568.4,56.2 569.6,55.5 570.8,54.9 572,54.4 573.2,53.8 574.4,53.2 575.6,52.7 576.8,52.1 578,51.6 579.2,51.1 580.4,50.7 581.6,50.2 582.8,49.7 584,49.3 585.2,48.9 586.4,48.4 587.6,48 588.8,47.7 590,47.3 591.2,46.9 592.4,46.6 593.6,46.2 594.8,45.9 596,45.6 597.2,45.3 598.4,45 599.6,44.7 600.8,44.4 602,44.1 603.2,43.8 604.4,43.6 605.6,43.3 606.8,43.1 608,42.9 609.2,42.7 610.4,42.4 611.6,42.2 612.8,42 614,41.8 615.2,41.7 616.4,41.5 617.6,41.3 618.8,41.1 620,41 621.2,40.8 622.4,40.7 623.6,40.5 624.8,40.4 626,40.3 627.2,40.1 628.4,40 629.6,39.9 630.8,39.8 632,39.6 633.2,39.5 634.4,39.4 635.6,39.3 636.8,39.2 638,39.1 639.2,39.1 640.4,39 641.6,38.9 642.8,38.8 644,38.7 645.2,38.6 646.4,38.6 647.6,38.5 648.8,38.4 650,38.4 651.2,38.3 652.4,38.2 653.6,38.2 654.8,38.1 656,38.1 657.2,38 658.4,38 659.6,37.9 660.8,37.9 662,37.8 663.2,37.8 664.4,37.8 665.6,37.7 666.8,37.7 668,37.6 669.2,37.6 670.4,37.6 671.6,37.5 672.8,37.5 674,37.5 675.2,37.4 676.4,37.4 677.6,37.4 678.8,37.4 680,37.3" fill="none" style="stroke:var(--blue-ink);stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:6 4"/>
<text x="678" y="103.3" text-anchor="end" style="fill:var(--fg);font-size:10px;font-weight:700">early stop</text>
<text x="678" y="115.3" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">η = 0.01, t = 1000</text>
<text x="678" y="143.3" text-anchor="end" style="fill:var(--blue-ink);font-size:10px;font-weight:700">L2 (α = 0.1)</text>
<circle cx="490.8" cy="117.5" r="4" style="fill:var(--surface);stroke:var(--fg);stroke-width:1.8"/>
<circle cx="490.8" cy="125.6" r="4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"/>
<text x="498.8" y="136" text-anchor="start" style="fill:var(--muted);font-size:10px;font-weight:400">0.394 vs 0.333 at λ = 0.05</text>
</svg>
<p class="fig-cap">Left: the worked patience example. Training stops after epoch 7 and returns the epoch-4 weights. Right: stopping gradient descent after t steps learns steep directions fully and holds flat ones back, just like L2 with α ≈ 1/(ηt).</p>
</div>

---

## 6.9 Ensemble methods

### 6.9.1 Idea

Train several models and combine them (average for regression, vote/average probabilities for classification). Ways to get different models: **bagging** (each model trained on a bootstrap sample, i.e. $m$ examples drawn **with replacement**), different architectures, hyperparameters, features or random initialisations.

### 6.9.2 [Derivation] When averaging helps

Model $i$ has error $\varepsilon_i$ at a test point with $\mathbb E[\varepsilon_i^2]=V$ and $\mathbb E[\varepsilon_i\varepsilon_j]=C$ ($i\ne j$). The ensemble's error is $\frac1k\sum_i\varepsilon_i$:
$$\mathrm{mse}_{\text{ens}}=\mathbb E\Big[\Big(\frac1k\sum_i\varepsilon_i\Big)^2\Big]=\frac1{k^2}\Big[\underbrace{kV}_{i=j\text{ terms}}+\underbrace{k(k-1)C}_{i\ne j\text{ terms}}\Big]=\boxed{\frac Vk+\frac{k-1}{k}C}$$

| Errors are | $C$ | $\mathrm{mse}_{\text{ens}}$ | Verdict |
|---|---|---|---|
| perfectly correlated | $V$ | $V$ | no gain at all |
| independent | 0 | $V/k$ | error falls like $1/k$ |
| anti-correlated | $<0$ | below $V/k$ | best case |

**[Ex]** $k=5$, $V=1$: $C=0\Rightarrow0.2$; $C=0.5\Rightarrow0.1+0.4=0.6$; $C=1\Rightarrow1$.

**[Exam] Quiz 2** ($V=12$).
- $k=2$, fixed $V$: which $C\in[-V,V]$ minimises the mse? $\mathrm{mse}=6+\frac C2$, increasing in $C$, so **$C=-V$**, giving $6-6=0$ (the two errors cancel exactly).
- $k\to\infty$ with $C=C_0>0$: $\frac Vk\to0$ and $\frac{k-1}{k}\to1$, so $\mathrm{mse}\to\mathbf{C_0}$. Correlated errors are a floor that no number of models can break.

<div class="fig" role="img" aria-label="Ensemble error">
<svg viewBox="0 0 700 200" width="700" style="font-family:var(--font)" aria-hidden="true">
<line x1="46" y1="168" x2="306" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="101.3" x2="306" y2="101.3" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="34.7" x2="306" y2="34.7" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="28" x2="46" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="100.7" y1="28" x2="100.7" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="169.2" y1="28" x2="169.2" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="237.6" y1="28" x2="237.6" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="306" y1="28" x2="306" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="28" x2="46" y2="168" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="46" y1="168" x2="306" y2="168" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="46" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="100.7" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">5</text>
<text x="169.2" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">10</text>
<text x="237.6" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">15</text>
<text x="306" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">20</text>
<text x="40" y="171.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="40" y="104.8" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.5</text>
<text x="40" y="38.2" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="176" y="194" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">number of models k</text>
<text x="12" y="98" text-anchor="middle" transform="rotate(-90 12 98)" style="fill:var(--muted);font-size:10.5px;font-weight:400">ensemble mse</text>
<text x="176" y="14" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">mse = V/k + (k − 1)C/k   (V = 1)</text>
<polyline points="46,34.7 48.2,52.9 50.3,66.7 52.5,77.6 54.7,86.4 56.8,93.6 59,99.6 61.2,104.8 63.3,109.2 65.5,113 67.7,116.4 69.8,119.4 72,122 74.2,124.4 76.3,126.5 78.5,128.5 80.7,130.3 82.8,131.9 85,133.4 87.2,134.7 89.3,136 91.5,137.2 93.7,138.3 95.8,139.3 98,140.2 100.2,141.1 102.3,141.9 104.5,142.7 106.7,143.5 108.8,144.2 111,144.8 113.2,145.4 115.3,146 117.5,146.6 119.7,147.1 121.8,147.6 124,148.1 126.2,148.6 128.3,149 130.5,149.4 132.7,149.8 134.8,150.2 137,150.6 139.2,150.9 141.3,151.3 143.5,151.6 145.7,151.9 147.8,152.2 150,152.5 152.2,152.8 154.3,153 156.5,153.3 158.7,153.6 160.8,153.8 163,154 165.2,154.3 167.3,154.5 169.5,154.7 171.7,154.9 173.8,155.1 176,155.3 178.2,155.5 180.3,155.7 182.5,155.9 184.7,156 186.8,156.2 189,156.4 191.2,156.5 193.3,156.7 195.5,156.8 197.7,157 199.8,157.1 202,157.2 204.2,157.4 206.3,157.5 208.5,157.6 210.7,157.8 212.8,157.9 215,158 217.2,158.1 219.3,158.2 221.5,158.4 223.7,158.5 225.8,158.6 228,158.7 230.2,158.8 232.3,158.9 234.5,159 236.7,159.1 238.8,159.2 241,159.3 243.2,159.3 245.3,159.4 247.5,159.5 249.7,159.6 251.8,159.7 254,159.8 256.2,159.8 258.3,159.9 260.5,160 262.7,160.1 264.8,160.2 267,160.2 269.2,160.3 271.3,160.4 273.5,160.4 275.7,160.5 277.8,160.6 280,160.6 282.2,160.7 284.3,160.8 286.5,160.8 288.7,160.9 290.8,160.9 293,161 295.2,161.1 297.3,161.1 299.5,161.2 301.7,161.2 303.8,161.3 306,161.3" fill="none" style="stroke:var(--green-ink);stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round"/>
<text x="312" y="165.3" text-anchor="start" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">C = 0</text>
<polyline points="46,34.7 48.2,48.3 50.3,58.7 52.5,66.9 54.7,73.4 56.8,78.9 59,83.4 61.2,87.2 63.3,90.5 65.5,93.4 67.7,96 69.8,98.2 72,100.2 74.2,102 76.3,103.6 78.5,105 80.7,106.4 82.8,107.6 85,108.7 87.2,109.7 89.3,110.7 91.5,111.5 93.7,112.4 95.8,113.1 98,113.8 100.2,114.5 102.3,115.1 104.5,115.7 106.7,116.3 108.8,116.8 111,117.3 113.2,117.7 115.3,118.2 117.5,118.6 119.7,119 121.8,119.4 124,119.7 126.2,120.1 128.3,120.4 130.5,120.7 132.7,121 134.8,121.3 137,121.6 139.2,121.9 141.3,122.1 143.5,122.4 145.7,122.6 147.8,122.8 150,123 152.2,123.2 154.3,123.5 156.5,123.6 158.7,123.8 160.8,124 163,124.2 165.2,124.4 167.3,124.5 169.5,124.7 171.7,124.8 173.8,125 176,125.1 178.2,125.3 180.3,125.4 182.5,125.6 184.7,125.7 186.8,125.8 189,125.9 191.2,126.1 193.3,126.2 195.5,126.3 197.7,126.4 199.8,126.5 202,126.6 204.2,126.7 206.3,126.8 208.5,126.9 210.7,127 212.8,127.1 215,127.2 217.2,127.3 219.3,127.3 221.5,127.4 223.7,127.5 225.8,127.6 228,127.7 230.2,127.8 232.3,127.8 234.5,127.9 236.7,128 238.8,128 241,128.1 243.2,128.2 245.3,128.2 247.5,128.3 249.7,128.4 251.8,128.4 254,128.5 256.2,128.6 258.3,128.6 260.5,128.7 262.7,128.7 264.8,128.8 267,128.8 269.2,128.9 271.3,128.9 273.5,129 275.7,129 277.8,129.1 280,129.1 282.2,129.2 284.3,129.2 286.5,129.3 288.7,129.3 290.8,129.4 293,129.4 295.2,129.5 297.3,129.5 299.5,129.5 301.7,129.6 303.8,129.6 306,129.7" fill="none" style="stroke:var(--blue-ink);stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round"/>
<text x="312" y="133.7" text-anchor="start" style="fill:var(--blue-ink);font-size:10.5px;font-weight:700">C = 0.25</text>
<polyline points="46,34.7 48.2,43.8 50.3,50.7 52.5,56.1 54.7,60.5 56.8,64.1 59,67.1 61.2,69.7 63.3,71.9 65.5,73.8 67.7,75.5 69.8,77 72,78.3 74.2,79.5 76.3,80.6 78.5,81.6 80.7,82.5 82.8,83.3 85,84 87.2,84.7 89.3,85.3 91.5,85.9 93.7,86.5 95.8,87 98,87.4 100.2,87.9 102.3,88.3 104.5,88.7 106.7,89.1 108.8,89.4 111,89.7 113.2,90 115.3,90.3 117.5,90.6 119.7,90.9 121.8,91.1 124,91.4 126.2,91.6 128.3,91.8 130.5,92 132.7,92.2 134.8,92.4 137,92.6 139.2,92.8 141.3,93 143.5,93.1 145.7,93.3 147.8,93.4 150,93.6 152.2,93.7 154.3,93.9 156.5,94 158.7,94.1 160.8,94.2 163,94.4 165.2,94.5 167.3,94.6 169.5,94.7 171.7,94.8 173.8,94.9 176,95 178.2,95.1 180.3,95.2 182.5,95.3 184.7,95.3 186.8,95.4 189,95.5 191.2,95.6 193.3,95.7 195.5,95.7 197.7,95.8 199.8,95.9 202,96 204.2,96 206.3,96.1 208.5,96.2 210.7,96.2 212.8,96.3 215,96.3 217.2,96.4 219.3,96.5 221.5,96.5 223.7,96.6 225.8,96.6 228,96.7 230.2,96.7 232.3,96.8 234.5,96.8 236.7,96.9 238.8,96.9 241,97 243.2,97 245.3,97.1 247.5,97.1 249.7,97.1 251.8,97.2 254,97.2 256.2,97.3 258.3,97.3 260.5,97.3 262.7,97.4 264.8,97.4 267,97.4 269.2,97.5 271.3,97.5 273.5,97.6 275.7,97.6 277.8,97.6 280,97.7 282.2,97.7 284.3,97.7 286.5,97.7 288.7,97.8 290.8,97.8 293,97.8 295.2,97.9 297.3,97.9 299.5,97.9 301.7,97.9 303.8,98 306,98" fill="none" style="stroke:var(--yellow-ink);stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round"/>
<text x="312" y="102" text-anchor="start" style="fill:var(--yellow-ink);font-size:10.5px;font-weight:700">C = 0.5</text>
<polyline points="46,34.7 48.2,34.7 50.3,34.7 52.5,34.7 54.7,34.7 56.8,34.7 59,34.7 61.2,34.7 63.3,34.7 65.5,34.7 67.7,34.7 69.8,34.7 72,34.7 74.2,34.7 76.3,34.7 78.5,34.7 80.7,34.7 82.8,34.7 85,34.7 87.2,34.7 89.3,34.7 91.5,34.7 93.7,34.7 95.8,34.7 98,34.7 100.2,34.7 102.3,34.7 104.5,34.7 106.7,34.7 108.8,34.7 111,34.7 113.2,34.7 115.3,34.7 117.5,34.7 119.7,34.7 121.8,34.7 124,34.7 126.2,34.7 128.3,34.7 130.5,34.7 132.7,34.7 134.8,34.7 137,34.7 139.2,34.7 141.3,34.7 143.5,34.7 145.7,34.7 147.8,34.7 150,34.7 152.2,34.7 154.3,34.7 156.5,34.7 158.7,34.7 160.8,34.7 163,34.7 165.2,34.7 167.3,34.7 169.5,34.7 171.7,34.7 173.8,34.7 176,34.7 178.2,34.7 180.3,34.7 182.5,34.7 184.7,34.7 186.8,34.7 189,34.7 191.2,34.7 193.3,34.7 195.5,34.7 197.7,34.7 199.8,34.7 202,34.7 204.2,34.7 206.3,34.7 208.5,34.7 210.7,34.7 212.8,34.7 215,34.7 217.2,34.7 219.3,34.7 221.5,34.7 223.7,34.7 225.8,34.7 228,34.7 230.2,34.7 232.3,34.7 234.5,34.7 236.7,34.7 238.8,34.7 241,34.7 243.2,34.7 245.3,34.7 247.5,34.7 249.7,34.7 251.8,34.7 254,34.7 256.2,34.7 258.3,34.7 260.5,34.7 262.7,34.7 264.8,34.7 267,34.7 269.2,34.7 271.3,34.7 273.5,34.7 275.7,34.7 277.8,34.7 280,34.7 282.2,34.7 284.3,34.7 286.5,34.7 288.7,34.7 290.8,34.7 293,34.7 295.2,34.7 297.3,34.7 299.5,34.7 301.7,34.7 303.8,34.7 306,34.7" fill="none" style="stroke:var(--red-ink);stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round"/>
<text x="312" y="38.7" text-anchor="start" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">C = 1</text>
<text x="155.5" y="149" text-anchor="start" style="fill:var(--green-ink);font-size:10px;font-weight:400">independent errors: 1/k</text>
<text x="51.5" y="27.7" text-anchor="start" style="fill:var(--red-ink);font-size:10px;font-weight:400">perfectly correlated: no gain</text>
<line x1="420" y1="168" x2="670" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="420" y1="100.8" x2="670" y2="100.8" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="420" y1="33.6" x2="670" y2="33.6" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="420" y1="28" x2="420" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="482.5" y1="28" x2="482.5" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="545" y1="28" x2="545" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="607.5" y1="28" x2="607.5" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="670" y1="28" x2="670" y2="168" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="420" y1="28" x2="420" y2="168" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="420" y1="168" x2="670" y2="168" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="420" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-12</text>
<text x="482.5" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-6</text>
<text x="545" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="607.5" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">6</text>
<text x="670" y="181" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">12</text>
<text x="414" y="171.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="414" y="104.3" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">6</text>
<text x="414" y="37.1" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">12</text>
<text x="545" y="194" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">error covariance C  (V = 12)</text>
<text x="386" y="98" text-anchor="middle" transform="rotate(-90 386 98)" style="fill:var(--muted);font-size:10.5px;font-weight:400">mse</text>
<text x="545" y="14" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">which C is best?</text>
<polyline points="420,168 424.2,165.8 428.3,163.5 432.5,161.3 436.7,159 440.8,156.8 445,154.6 449.2,152.3 453.3,150.1 457.5,147.8 461.7,145.6 465.8,143.4 470,141.1 474.2,138.9 478.3,136.6 482.5,134.4 486.7,132.2 490.8,129.9 495,127.7 499.2,125.4 503.3,123.2 507.5,121 511.7,118.7 515.8,116.5 520,114.2 524.2,112 528.3,109.8 532.5,107.5 536.7,105.3 540.8,103 545,100.8 549.2,98.6 553.3,96.3 557.5,94.1 561.7,91.8 565.8,89.6 570,87.4 574.2,85.1 578.3,82.9 582.5,80.6 586.7,78.4 590.8,76.2 595,73.9 599.2,71.7 603.3,69.4 607.5,67.2 611.7,65 615.8,62.7 620,60.5 624.2,58.2 628.3,56 632.5,53.8 636.7,51.5 640.8,49.3 645,47 649.2,44.8 653.3,42.6 657.5,40.3 661.7,38.1 665.8,35.8 670,33.6" fill="none" style="stroke:var(--blue-ink);stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round"/>
<text x="575.4" y="77.8" text-anchor="end" style="fill:var(--blue-ink);font-size:10.5px;font-weight:700">k = 2</text>
<polyline points="503.3,168 506.1,165.8 508.9,163.5 511.7,161.3 514.4,159 517.2,156.8 520,154.6 522.8,152.3 525.6,150.1 528.3,147.8 531.1,145.6 533.9,143.4 536.7,141.1 539.4,138.9 542.2,136.6 545,134.4 547.8,132.2 550.6,129.9 553.3,127.7 556.1,125.4 558.9,123.2 561.7,121 564.4,118.7 567.2,116.5 570,114.2 572.8,112 575.6,109.8 578.3,107.5 581.1,105.3 583.9,103 586.7,100.8 589.4,98.6 592.2,96.3 595,94.1 597.8,91.8 600.6,89.6 603.3,87.4 606.1,85.1 608.9,82.9 611.7,80.6 614.4,78.4 617.2,76.2 620,73.9 622.8,71.7 625.6,69.4 628.3,67.2 631.1,65 633.9,62.7 636.7,60.5 639.4,58.2 642.2,56 645,53.8 647.8,51.5 650.6,49.3 653.3,47 656.1,44.8 658.9,42.6 661.7,40.3 664.4,38.1 667.2,35.8 670,33.6" fill="none" style="stroke:var(--yellow-ink);stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round"/>
<text x="573.3" y="103.5" text-anchor="end" style="fill:var(--yellow-ink);font-size:10.5px;font-weight:700">k = 4</text>
<polyline points="531.1,168 533.4,165.8 535.7,163.5 538.1,161.3 540.4,159 542.7,156.8 545,154.6 547.3,152.3 549.6,150.1 551.9,147.8 554.3,145.6 556.6,143.4 558.9,141.1 561.2,138.9 563.5,136.6 565.8,134.4 568.1,132.2 570.5,129.9 572.8,127.7 575.1,125.4 577.4,123.2 579.7,121 582,118.7 584.4,116.5 586.7,114.2 589,112 591.3,109.8 593.6,107.5 595.9,105.3 598.2,103 600.6,100.8 602.9,98.6 605.2,96.3 607.5,94.1 609.8,91.8 612.1,89.6 614.4,87.4 616.8,85.1 619.1,82.9 621.4,80.6 623.7,78.4 626,76.2 628.3,73.9 630.6,71.7 633,69.4 635.3,67.2 637.6,65 639.9,62.7 642.2,60.5 644.5,58.2 646.9,56 649.2,53.8 651.5,51.5 653.8,49.3 656.1,47 658.4,44.8 660.7,42.6 663.1,40.3 665.4,38.1 667.7,35.8 670,33.6" fill="none" style="stroke:var(--red-ink);stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round"/>
<text x="571.3" y="120.3" text-anchor="end" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">k = 10</text>
<polyline points="545,168 548.1,164.6 551.3,161.3 554.4,157.9 557.5,154.6 560.6,151.2 563.8,147.8 566.9,144.5 570,141.1 573.1,137.8 576.3,134.4 579.4,131 582.5,127.7 585.6,124.3 588.8,121 591.9,117.6 595,114.2 598.1,110.9 601.3,107.5 604.4,104.2 607.5,100.8 610.6,97.4 613.8,94.1 616.9,90.7 620,87.4 623.1,84 626.3,80.6 629.4,77.3 632.5,73.9 635.6,70.6 638.8,67.2 641.9,63.8 645,60.5 648.1,57.1 651.3,53.8 654.4,50.4 657.5,47 660.6,43.7 663.8,40.3 666.9,37 670,33.6" fill="none" style="stroke:var(--green-ink);stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:6 4"/>
<text x="667.9" y="141.1" text-anchor="end" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">k → ∞: mse = C</text>
<circle cx="420" cy="168" r="4.5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:2"/>
<text x="428" y="160" text-anchor="start" style="fill:var(--blue-ink);font-size:10px;font-weight:700">errors cancel: 0</text>
</svg>
<p class="fig-cap">Left: averaging helps only as far as the errors are uncorrelated; correlation C is a floor. Right: for the Quiz-2 values (V = 12) the best case is C = −V with two models, and with many models the mse tends to C.</p>
</div>

---

## 6.10 Dropout

### 6.10.1 The procedure

**Training:** at every step, keep each unit (input or hidden) **independently with probability $p$** (the retention probability) and remove it with probability $1-p$, together with its connections. Do forward and backward passes on this **thinned** network; only the surviving weights get gradient updates. Draw a fresh mask at the next step.

**Testing:** use the full network, with each unit's outgoing weights **multiplied by $p$** (weight scaling), so every unit's expected contribution matches training.

| Quantity | Formula |
|---|---|
| expected number of active units (layer of $n$) | $np$ |
| number of distinct thinned networks | $2^n$ (each unit in or out) |
| test-time weights | $p\,W$ |
| "inverted dropout" (common in code) | divide by $p$ during training, no scaling at test |

**[Exam] Quiz 2.** $n=10$ units, $p=0.7$: expected active units $=10\times0.7=$ **7**; thinned sub-networks $=$ **$2^{10}$** (not $10$, $10^2$ or $10!$).

### 6.10.2 [Ex] Why weights are scaled by $p$ at test time

Two hidden units with outputs $h=(2,4)$, outgoing weights $(1,1)$, $p=0.5$. Enumerate the four equally likely masks:

| Mask | Output |
|---|---|
| both dropped | 0 |
| only unit 1 | 2 |
| only unit 2 | 4 |
| both kept | 6 |
| **average** | **3** |

The full network would output $6$. Scaling the weights by $p=0.5$ gives $0.5\times6=3$: it reproduces the **average over all thinned networks** in a single pass (exactly so for a linear output; an excellent approximation otherwise).

### 6.10.3 Why dropout works

- **Ensemble view:** each step trains a different one of $2^n$ thinned networks; they all **share** weights, so it is an ensemble of exponentially many models at the cost of one. Test-time scaling approximates averaging them.
- **No co-adaptation:** a unit cannot rely on specific other units being present, so it must learn features that are useful on their own. (Course example: a "nose detector" cannot depend on the "eye detector" always firing; the network learns redundant evidence.)
- **Noise view:** dropout injects multiplicative noise into hidden units, a cousin of §6.6.

<div class="fig" role="img" aria-label="Dropout">
<svg viewBox="0 0 700 188" width="700" style="font-family:var(--font)" aria-hidden="true">
<line x1="40" y1="58" x2="118" y2="41" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;0.12;1"/></line>
<line x1="40" y1="58" x2="118" y2="75" opacity="0.12" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="0.12;1;1"/></line>
<line x1="40" y1="58" x2="118" y2="109" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;0.12"/></line>
<line x1="40" y1="58" x2="118" y2="143" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;1"/></line>
<line x1="40" y1="92" x2="118" y2="41" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;0.12;1"/></line>
<line x1="40" y1="92" x2="118" y2="75" opacity="0.12" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="0.12;1;1"/></line>
<line x1="40" y1="92" x2="118" y2="109" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;0.12"/></line>
<line x1="40" y1="92" x2="118" y2="143" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;1"/></line>
<line x1="40" y1="126" x2="118" y2="41" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;0.12;1"/></line>
<line x1="40" y1="126" x2="118" y2="75" opacity="0.12" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="0.12;1;1"/></line>
<line x1="40" y1="126" x2="118" y2="109" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;0.12"/></line>
<line x1="40" y1="126" x2="118" y2="143" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;1"/></line>
<line x1="118" y1="41" x2="196" y2="41" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;0.12;0.12"/></line>
<line x1="118" y1="41" x2="196" y2="75" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;0.12;1"/></line>
<line x1="118" y1="41" x2="196" y2="109" opacity="0.12" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="0.12;0.12;1"/></line>
<line x1="118" y1="41" x2="196" y2="143" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;0.12;1"/></line>
<line x1="118" y1="75" x2="196" y2="41" opacity="0.12" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="0.12;1;0.12"/></line>
<line x1="118" y1="75" x2="196" y2="75" opacity="0.12" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="0.12;0.12;1"/></line>
<line x1="118" y1="75" x2="196" y2="109" opacity="0.12" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="0.12;1;1"/></line>
<line x1="118" y1="75" x2="196" y2="143" opacity="0.12" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="0.12;1;1"/></line>
<line x1="118" y1="109" x2="196" y2="41" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;0.12"/></line>
<line x1="118" y1="109" x2="196" y2="75" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;0.12;0.12"/></line>
<line x1="118" y1="109" x2="196" y2="109" opacity="0.12" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="0.12;1;0.12"/></line>
<line x1="118" y1="109" x2="196" y2="143" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;0.12"/></line>
<line x1="118" y1="143" x2="196" y2="41" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;0.12"/></line>
<line x1="118" y1="143" x2="196" y2="75" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;0.12;1"/></line>
<line x1="118" y1="143" x2="196" y2="109" opacity="0.12" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="0.12;1;1"/></line>
<line x1="118" y1="143" x2="196" y2="143" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;1"/></line>
<line x1="196" y1="41" x2="274" y2="75" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;0.12"/></line>
<line x1="196" y1="41" x2="274" y2="109" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;0.12"/></line>
<line x1="196" y1="75" x2="274" y2="75" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;0.12;1"/></line>
<line x1="196" y1="75" x2="274" y2="109" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;0.12;1"/></line>
<line x1="196" y1="109" x2="274" y2="75" opacity="0.12" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="0.12;1;1"/></line>
<line x1="196" y1="109" x2="274" y2="109" opacity="0.12" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="0.12;1;1"/></line>
<line x1="196" y1="143" x2="274" y2="75" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;1"/></line>
<line x1="196" y1="143" x2="274" y2="109" opacity="1" style="stroke:var(--line-strong);stroke-width:1.2"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;1"/></line>
<circle cx="40" cy="58" r="10" opacity="1" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.8"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;1"/></circle>
<circle cx="40" cy="92" r="10" opacity="1" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.8"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;1"/></circle>
<circle cx="40" cy="126" r="10" opacity="1" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.8"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;1"/></circle>
<circle cx="118" cy="41" r="10" opacity="1" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;0.12;1"/></circle>
<circle cx="118" cy="75" r="10" opacity="0.12" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="0.12;1;1"/></circle>
<circle cx="118" cy="109" r="10" opacity="1" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;0.12"/></circle>
<circle cx="118" cy="143" r="10" opacity="1" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;1"/></circle>
<circle cx="196" cy="41" r="10" opacity="1" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;0.12"/></circle>
<circle cx="196" cy="75" r="10" opacity="1" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;0.12;1"/></circle>
<circle cx="196" cy="109" r="10" opacity="0.12" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="0.12;1;1"/></circle>
<circle cx="196" cy="143" r="10" opacity="1" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.8"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;1"/></circle>
<circle cx="274" cy="75" r="10" opacity="1" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;1"/></circle>
<circle cx="274" cy="109" r="10" opacity="1" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"><animate attributeName="opacity" dur="6s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3333;0.6667" values="1;1;1"/></circle>
<text x="157" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">training: a new thinned net every step</text>
<text x="40" y="176" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">input</text>
<text x="118" y="176" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">hidden 1</text>
<text x="196" y="176" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">hidden 2</text>
<text x="274" y="176" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">output</text>
<line x1="446" y1="152" x2="676" y2="152" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="446" y1="104" x2="676" y2="104" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="446" y1="56" x2="676" y2="56" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="446" y1="40" x2="446" y2="152" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="446" y1="152" x2="676" y2="152" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="440" y="155.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="440" y="107.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">3</text>
<text x="440" y="59.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">6</text>
<text x="416" y="96" text-anchor="middle" transform="rotate(-90 416 96)" style="fill:var(--muted);font-size:10.5px;font-weight:400">output</text>
<text x="561" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">p = 0.5, h = (2, 4): output of each mask</text>
<rect x="457.5" y="152" width="34.5" height="0" rx="3" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="474.8" y="165" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">none</text>
<text x="474.8" y="148" text-anchor="middle" style="fill:var(--blue-ink);font-size:10px;font-weight:700">0</text>
<rect x="515" y="120" width="34.5" height="32" rx="3" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="532.3" y="165" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">unit 1</text>
<text x="532.3" y="116" text-anchor="middle" style="fill:var(--blue-ink);font-size:10px;font-weight:700">2</text>
<rect x="572.5" y="88" width="34.5" height="64" rx="3" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="589.8" y="165" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">unit 2</text>
<text x="589.8" y="84" text-anchor="middle" style="fill:var(--blue-ink);font-size:10px;font-weight:700">4</text>
<rect x="630" y="56" width="34.5" height="96" rx="3" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="647.3" y="165" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">both</text>
<text x="647.3" y="52" text-anchor="middle" style="fill:var(--blue-ink);font-size:10px;font-weight:700">6</text>
<line x1="446" y1="104" x2="676" y2="104" style="stroke:var(--green-ink);stroke-width:1.8;stroke-linecap:round;stroke-dasharray:6 4"/>
<text x="450" y="99" text-anchor="start" style="fill:var(--green-ink);font-size:10px;font-weight:700">average 3</text>
</svg>
<p class="fig-cap">Left: three consecutive training steps keep different random subsets of units (the picture cycles through masks). Right: the average over all four masks is 3, and weight scaling reproduces it in one pass (p × 6 = 0.5 × 6).</p>
</div>

**[!] Traps.**
- $p$ here is the probability of **keeping** a unit. Some sources (and PyTorch) parametrise by the drop rate $1-p$; read the question.
- No dropout at test time; only the scaling.
- Typical values: $p\approx0.8$ for inputs, $0.5$ for hidden units.

---

## 6.11 Week-6 exam toolkit & practice set

**Diagram — Week 6 at a glance**

<div class="fig" role="img" aria-label="Week 6 at a glance">
<svg viewBox="0 0 700 84" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="0" y="6" width="160" height="70" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="80" y="30.5" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">Error</text>
<text x="80" y="45" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">Bias² + Var + σ²</text>
<text x="80" y="59.5" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">more data ⇒ Var ↓</text>
<rect x="180" y="6" width="160" height="70" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="260" y="30.5" text-anchor="middle" style="fill:var(--green-ink);font-size:11.5px;font-weight:700">L2 / weight decay</text>
<text x="260" y="45" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">w ← (1 − ηα)w − η∇L</text>
<text x="260" y="59.5" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">factor λᵢ/(λᵢ + α)</text>
<rect x="360" y="6" width="160" height="70" rx="8" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.5"/>
<text x="440" y="30.5" text-anchor="middle" style="fill:var(--yellow-ink);font-size:11.5px;font-weight:700">Early stop ≈ L2</text>
<text x="440" y="45" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">α ≈ 1/(ηt)</text>
<text x="440" y="59.5" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">input noise σ² ≡ L2</text>
<rect x="540" y="6" width="160" height="70" rx="8" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="620" y="30.5" text-anchor="middle" style="fill:var(--red-ink);font-size:11.5px;font-weight:700">Ensemble</text>
<text x="620" y="45" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">V/k + (k − 1)C/k</text>
<text x="620" y="59.5" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">Dropout: np · 2ⁿ · × p</text>
</svg>
<p class="fig-cap">Week 6 on one line.</p>
</div>

### 6.11.1 Recognition rules

| See | Think |
|---|---|
| several model predictions at one point + true value | bias = mean − truth; variance = spread around the mean |
| "more training data, same model" | variance ↓, bias unchanged |
| "more complex model" | bias ↓, variance ↑ |
| "why training error is optimistic" | $+\frac{2\sigma^2}{m}\sum\partial\hat f_i/\partial y_i$ |
| L2 gradient step with numbers | $w-\eta(\nabla L+\alpha w)$ |
| Hessian eigenvalues + $\alpha$ | factors $\lambda_i/(\lambda_i+\alpha)$ |
| Gaussian input noise on a linear model | L2 with penalty $\sigma^2\lVert\mathbf w\rVert^2$ |
| soft targets | $1-\varepsilon$ and $\varepsilon/(k-1)$ |
| patience question | count epochs since the **best** value; return the best epoch's weights |
| "early stopping equivalent L2" | $\alpha\approx1/(\eta t)$ |
| $V$, $C$, $k$ ensemble | $V/k+(k-1)C/k$; $k\to\infty\Rightarrow C$ |
| dropout counts | $np$ active, $2^n$ thinned nets, test weights $\times p$ |

### 6.11.2 Formula sheet

| Formula | Use |
|---|---|
| $\mathbb E[(y-\hat f)^2]=\mathrm{Bias}^2+\mathrm{Var}+\sigma^2$ | decomposition |
| $\text{true}=\text{train}+\frac{2\sigma^2}{m}\sum_i\frac{\partial\hat f(x_i)}{\partial y_i}$ | Stein's lemma gap |
| $\mathbf w\leftarrow(1-\eta\alpha)\mathbf w-\eta\nabla\mathcal L$ | weight decay |
| $\tilde{\mathbf w}=Q(\Lambda+\alpha I)^{-1}\Lambda Q^\top\mathbf w^*$ | L2 optimum |
| $\mathbb E[(\tilde y-y)^2]=\mathbb E[(\hat y-y)^2]+\sigma^2\lVert\mathbf w\rVert^2$ | input noise |
| $(1-\eta\lambda_i)^t\approx\frac{\alpha}{\lambda_i+\alpha}$, $\alpha\approx\frac1{\eta t}$ | early stopping ≈ L2 |
| $\mathrm{mse}_{\text{ens}}=\frac Vk+\frac{k-1}kC$ | ensembles |
| $np$, $2^n$, $pW$ | dropout |

### 6.11.3 Practice set

1. True $f(x_0)=5$, $\sigma^2=1$. Five models predict $4,6,5,7,8$. Bias², variance, expected test error?
2. Hessian eigenvalues 9 and 1, $\alpha=1$, $Q^\top\mathbf w^*=(10,10)$. Find $Q^\top\tilde{\mathbf w}$ and the effective number of parameters.
3. $w=1.5$, $\partial L/\partial w=2$, $\alpha=0.2$, $\eta=0.1$. One L2-regularized GD step.
4. Linear model $\mathbf w=(3,4)$ trained with input noise $\sigma^2=0.04$. Implicit penalty?
5. Validation errors: $0.9,0.7,0.6,0.62,0.58,0.59,0.60,0.61,0.57$, patience 3. When does training stop and which epoch's weights are returned?
6. Ensemble with $k=4$, $V=8$, $C=2$. mse? What if $C=0$?
7. A layer has 20 units, retention $p=0.8$. Expected active units, number of thinned networks, test-time weight factor?
8. Label smoothing with $k=5$, $\varepsilon=0.2$. Target vector for class 2?
9. GD with $\eta=0.001$ is stopped after 500 steps. Equivalent L2 strength?
10. Least squares with $p=10$ parameters, $m=50$ points, $\sigma^2=0.5$. Expected gap between true and training error?
11. Multi-select: which reduce variance? (a) more data (b) larger polynomial degree (c) dropout (d) L2 (e) bagging.
12. Creative: training accuracy 99.8%, validation accuracy 81%, and validation loss started rising at epoch 12 of 60. Diagnose and give a fix from four different sections of this week.

### 6.11.4 Answers

1. Mean 6, Bias² $=1$; Var $=\frac{4+0+1+1+4}{5}=2$; error $=1+2+1=4$.
2. Factors $\frac9{10}=0.9$, $\frac12=0.5$ ⇒ $(9,5)$; effective parameters $1.4$.
3. $1.5-0.1(2+0.2\times1.5)=1.5-0.23=1.27$.
4. $0.04\times(9+16)=1$.
5. Best 0.58 at epoch 5; epochs 6, 7, 8 do not beat it ⇒ stop after epoch 8, return epoch-5 weights (the 0.57 at epoch 9 is never seen).
6. $2+\frac34\times2=3.5$; with $C=0$: $2$.
7. $16$; $2^{20}$; $0.8$.
8. $(0.05,\ 0.8,\ 0.05,\ 0.05,\ 0.05)$.
9. $\alpha\approx1/(0.001\times500)=2$.
10. $\frac{2\times0.5\times10}{50}=0.2$.
11. (a), (c), (d), (e).
12. Overfitting (high variance). Fixes: early stopping around epoch 12 (§6.8), L2/weight decay (§6.3), dropout (§6.10), data augmentation (§6.4); ensembles (§6.9) also work.

### 6.11.5 Worked solutions, line by line

**Q1.**

| Line | Calculation | Result |
|---|---|---|
| 1 | mean $(4+6+5+7+8)/5$ | 6 |
| 2 | Bias² $(6-5)^2$ | 1 |
| 3 | deviations from 6: $-2,0,-1,1,2$; squares $4,0,1,1,4$ | sum 10 |
| 4 | Var $10/5$ | 2 |
| 5 | error $1+2+\sigma^2$ | 4 |

**Q5.**

| Epoch | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| val | 0.90 | 0.70 | 0.60 | 0.62 | 0.58 | 0.59 | 0.60 | 0.61 |
| best | 0.90 | 0.70 | 0.60 | 0.60 | **0.58** | 0.58 | 0.58 | 0.58 |
| no-improve count | 0 | 0 | 0 | 1 | 0 | 1 | 2 | **3 ⇒ stop** |

Patience is counted from the **last improvement of the best value** (epoch 5), so the counter reset at epoch 5.

**Q6.** $\frac Vk=\frac84=2$; $\frac{k-1}{k}C=\frac34\times2=1.5$; total $3.5$. With independent errors ($C=0$) it would be $2$, a factor $k=4$ below a single model's $8$; the correlation costs the extra $1.5$.

---
