---
title: Week 8 (Word Representations, CNNs, LeNet to ResNet)
summary: Week 8 from first principles: one-hot to distributed word vectors (co-occurrence, PPMI, SVD, CBOW, skip-gram, negative sampling, GloVe), then convolution, output sizes, parameter counts, pooling, backprop through convolution and the LeNet to ResNet architectures with worked examples.
tags: [deep-learning, quiz-2, week-8]
color: blue
order: 8
---

# Deep Learning : Illustrated Notes for Week 8


## Contents

- **Week 8 — Learning vectorial representations of words; convolutional neural networks; LeNet, AlexNet, ZF-Net, VGGNet, GoogLeNet, ResNet** ✓
  - 8.0 Week-8 map
  - **Part A: words as vectors**
  - 8.1 One-hot representations and their problem
  - 8.2 Count-based: co-occurrence, PMI, PPMI
  - 8.3 SVD for word representations
  - 8.4 CBOW (predict the word from its context)
  - 8.5 Skip-gram, negative sampling, hierarchical softmax
  - 8.6 GloVe and evaluating word vectors
  - **Part B: convolutional neural networks**
  - 8.7 The convolution operation
  - 8.8 Output size, padding and stride
  - 8.9 Parameters: sparse connectivity and weight sharing
  - 8.10 Pooling and a full parameter count
  - 8.11 Backpropagation through a convolution
  - 8.12 The architectures: LeNet, AlexNet, ZF-Net, VGGNet, GoogLeNet, ResNet
  - 8.13 Week-8 exam toolkit & practice set


---


## 8.0 Week-8 map

**[Intuition]** Week 8 has two halves joined by one idea: **the right representation makes learning easy.**
- **Words:** a network cannot use the string "cat". Turn every word into a vector whose geometry carries meaning (similar words, nearby vectors).
- **Images:** a fully connected layer on a $224\times224\times3$ image would need tens of millions of weights per neuron layer and ignores the fact that nearby pixels belong together. Convolutions reuse one small detector everywhere.

<div class="fig" role="img" aria-label="Week 8 map">
<svg viewBox="0 0 700 128" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="0" y="6" width="150" height="48" rx="8" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<text x="75" y="26.8" text-anchor="middle" style="fill:var(--fg-2);font-size:11.5px;font-weight:700">Words</text>
<text x="75" y="41.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">strings, not numbers</text>
<rect x="183" y="6" width="150" height="48" rx="8" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="258" y="26.8" text-anchor="middle" style="fill:var(--red-ink);font-size:11.5px;font-weight:700">One-hot</text>
<text x="258" y="41.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">no similarity</text>
<rect x="366" y="6" width="150" height="48" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="441" y="26.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">PPMI + SVD</text>
<text x="441" y="41.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">CBOW · skip-gram</text>
<rect x="549" y="6" width="150" height="48" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="624" y="26.8" text-anchor="middle" style="fill:var(--green-ink);font-size:11.5px;font-weight:700">GloVe</text>
<text x="624" y="41.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">counts + prediction</text>
<rect x="0" y="74" width="150" height="48" rx="8" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<text x="75" y="94.8" text-anchor="middle" style="fill:var(--fg-2);font-size:11.5px;font-weight:700">Images</text>
<text x="75" y="109.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">224 × 224 × 3</text>
<rect x="183" y="74" width="150" height="48" rx="8" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="258" y="94.8" text-anchor="middle" style="fill:var(--red-ink);font-size:11.5px;font-weight:700">Fully connected</text>
<text x="258" y="109.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">far too many weights</text>
<rect x="366" y="74" width="150" height="48" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="441" y="94.8" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">Convolution</text>
<text x="441" y="109.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">local + shared filters</text>
<rect x="549" y="74" width="150" height="48" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="624" y="94.8" text-anchor="middle" style="fill:var(--green-ink);font-size:11.5px;font-weight:700">Architectures</text>
<text x="624" y="109.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">LeNet … ResNet</text>
<line x1="150" y1="30" x2="178.8" y2="30" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="183,30 177,32.9 177,27.1" style="fill:var(--line-strong)"/>
<line x1="150" y1="98" x2="178.8" y2="98" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="183,98 177,100.9 177,95.1" style="fill:var(--line-strong)"/>
<line x1="333" y1="30" x2="361.8" y2="30" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="366,30 360,32.9 360,27.1" style="fill:var(--line-strong)"/>
<line x1="333" y1="98" x2="361.8" y2="98" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="366,98 360,100.9 360,95.1" style="fill:var(--line-strong)"/>
<line x1="516" y1="30" x2="544.8" y2="30" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="549,30 543,32.9 543,27.1" style="fill:var(--line-strong)"/>
<line x1="516" y1="98" x2="544.8" y2="98" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="549,98 543,100.9 543,95.1" style="fill:var(--line-strong)"/>
</svg>
<p class="fig-cap">Two halves, one idea: the right representation makes learning easy. Top: from one-hot words to dense vectors. Bottom: from fully connected layers to convolutions.</p>
</div>

> [!TIP]
> **Everyday pictures for the whole week.**
> - **A word is known by its neighbours:** if two words keep turning up beside the same words ("coffee" and "tea" both sit near "cup", "hot", "drink"), they probably mean similar things.
> - **A convolution filter is a stamp-sized magnifying glass** slid over the whole picture, asking the same question ("is there a vertical edge here?") at every spot.
> - **Pooling is squinting:** keep the strongest signal in each small window, forget exactly where it was.

---

# Part A: words as vectors

## 8.1 One-hot representations and their problem

Vocabulary $V$ of size $|V|$ (e.g. 50,000). Word $i$ is the vector with a 1 in position $i$ and 0 elsewhere.

| Property | Value | Consequence |
|---|---|---|
| dimension | $\lvert V\rvert$ | huge and sparse |
| Euclidean distance between any two different words | $\sqrt2$ | "cat–dog" as far apart as "cat–truck" |
| cosine similarity between any two different words | 0 | no notion of similarity at all |

We want **dense, low-dimensional** vectors where similar words are close.

---

## 8.2 Count-based: co-occurrence, PMI, PPMI

### 8.2.1 The co-occurrence matrix

Rows are words, columns are **context** words. Entry $X_{ij}$ = number of times context word $j$ appears within a window of $k$ words of word $i$ in the corpus. Each row is now a (long) vector describing the company the word keeps.

Problems and fixes:

| Problem | Fix |
|---|---|
| frequent words ("the", "a") dominate every row | drop stop words, or cap counts, $\min(\text{count},t)$ |
| raw counts reward frequency, not association | **PMI** |
| PMI of unseen pairs is $\log0=-\infty$; negative values are unreliable | **PPMI** = $\max(\mathrm{PMI},0)$ |
| rows are still $\lvert V\rvert$-dimensional and sparse | **SVD** (§8.3) |

### 8.2.2 [Derivation] PMI

PMI compares how often $w$ and $c$ actually co-occur with how often they would if they were independent:
$$\mathrm{PMI}(w,c)=\log\frac{p(c\mid w)}{p(c)}=\log\frac{p(w,c)}{p(w)\,p(c)}=\log\frac{\mathrm{count}(w,c)\cdot N}{\mathrm{count}(w)\cdot\mathrm{count}(c)},$$
using $p(w,c)=\frac{\mathrm{count}(w,c)}N$, $p(w)=\frac{\mathrm{count}(w)}N$, $p(c)=\frac{\mathrm{count}(c)}N$ (the $N$'s leave one $N$ in the numerator).

| PMI | Meaning |
|---|---|
| > 0 | co-occur **more** than chance (associated) |
| = 0 | independent |
| < 0 | co-occur **less** than chance |

$$\mathrm{PPMI}(w,c)=\max\big(\mathrm{PMI}(w,c),\,0\big)$$

**[Exam] End-term.** $N=10{,}000$, $\mathrm{count}(w)=50$, $\mathrm{count}(c)=40$, $\mathrm{count}(w,c)=10$, natural log:

| Line | Calculation | Result |
|---|---|---|
| 1 | $\frac{\mathrm{count}(w,c)\,N}{\mathrm{count}(w)\,\mathrm{count}(c)}=\frac{10\times10000}{50\times40}$ | 50 |
| 2 | $\ln50$ | **3.91** |
| 3 | a second pair with PMI $=-1.0986$: PPMI | $\max(-1.0986,0)=$ **0** |

### 8.2.3 [Ex] A small PPMI matrix

Counts (rows: words, columns: contexts):

| | learning | network | pizza | row sum |
|---|---|---|---|---|
| deep | 10 | 6 | 0 | 16 |
| neural | 6 | 10 | 1 | 17 |
| cheese | 0 | 1 | 8 | 9 |
| col sum | 16 | 17 | 9 | $N=42$ |

| Pair | Calculation | PMI | PPMI |
|---|---|---|---|
| (deep, learning) | $\ln\frac{10\cdot42}{16\cdot16}=\ln1.641$ | 0.495 | 0.495 |
| (deep, network) | $\ln\frac{6\cdot42}{16\cdot17}=\ln0.926$ | −0.076 | 0 |
| (neural, network) | $\ln\frac{10\cdot42}{17\cdot17}=\ln1.453$ | 0.374 | 0.374 |
| (cheese, network) | $\ln\frac{1\cdot42}{9\cdot17}=\ln0.275$ | −1.293 | 0 |
| (cheese, pizza) | $\ln\frac{8\cdot42}{9\cdot9}=\ln4.148$ | 1.423 | 1.423 |
| (deep, pizza) | $\ln0$ | $-\infty$ | 0 |

**[Intuition]** Rare pairs that co-occur a lot (cheese–pizza) get the highest PPMI; PMI corrects for "network" being common.

<div class="fig" role="img" aria-label="PMI to PPMI">
<svg viewBox="0 0 700 172" width="700" style="font-family:var(--font)" aria-hidden="true">
<text x="180" y="18" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">co-occurrence counts</text>
<text x="127" y="42" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">learning</text>
<text x="181" y="42" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">network</text>
<text x="235" y="42" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">pizza</text>
<text x="92" y="85" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">deep</text>
<text x="92" y="117" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">neural</text>
<text x="92" y="149" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">cheese</text>
<rect x="100" y="56" width="51" height="29" rx="4" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:1"/>
<text x="125.5" y="75" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">10</text>
<rect x="154" y="56" width="51" height="29" rx="4" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.74"/>
<text x="179.5" y="75" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">6</text>
<rect x="208" y="56" width="51" height="29" rx="4" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1;opacity:1"/>
<text x="233.5" y="75" text-anchor="middle" style="fill:var(--muted);font-size:11px;font-weight:400">0</text>
<rect x="100" y="88" width="51" height="29" rx="4" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.74"/>
<text x="125.5" y="107" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">6</text>
<rect x="154" y="88" width="51" height="29" rx="4" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:1"/>
<text x="179.5" y="107" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">10</text>
<rect x="208" y="88" width="51" height="29" rx="4" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.415"/>
<text x="233.5" y="107" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">1</text>
<rect x="100" y="120" width="51" height="29" rx="4" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1;opacity:1"/>
<text x="125.5" y="139" text-anchor="middle" style="fill:var(--muted);font-size:11px;font-weight:400">0</text>
<rect x="154" y="120" width="51" height="29" rx="4" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.415"/>
<text x="179.5" y="139" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">1</text>
<rect x="208" y="120" width="51" height="29" rx="4" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.87"/>
<text x="233.5" y="139" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">8</text>
<line x1="272" y1="106" x2="337.8" y2="106" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="342,106 336,108.9 336,103.1" style="fill:var(--line-strong)"/>
<text x="307" y="98" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">PMI, then</text>
<text x="307" y="123" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">max(·, 0)</text>
<text x="460" y="18" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">PPMI</text>
<text x="407" y="42" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">learning</text>
<text x="461" y="42" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">network</text>
<text x="515" y="42" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">pizza</text>
<text x="372" y="85" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">deep</text>
<text x="372" y="117" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">neural</text>
<text x="372" y="149" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">cheese</text>
<rect x="380" y="56" width="51" height="29" rx="4" style="fill:var(--green);stroke:var(--line-strong);stroke-width:1;opacity:0.564533482279069"/>
<text x="405.5" y="75" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">0.50</text>
<rect x="434" y="56" width="51" height="29" rx="4" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1;opacity:1"/>
<text x="459.5" y="75" text-anchor="middle" style="fill:var(--muted);font-size:11px;font-weight:400">0</text>
<rect x="488" y="56" width="51" height="29" rx="4" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1;opacity:1"/>
<text x="513.5" y="75" text-anchor="middle" style="fill:var(--muted);font-size:11px;font-weight:400">0</text>
<rect x="380" y="88" width="51" height="29" rx="4" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1;opacity:1"/>
<text x="405.5" y="107" text-anchor="middle" style="fill:var(--muted);font-size:11px;font-weight:400">0</text>
<rect x="434" y="88" width="51" height="29" rx="4" style="fill:var(--green);stroke:var(--line-strong);stroke-width:1;opacity:0.5119921433714921"/>
<text x="459.5" y="107" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">0.37</text>
<rect x="488" y="88" width="51" height="29" rx="4" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1;opacity:1"/>
<text x="513.5" y="107" text-anchor="middle" style="fill:var(--muted);font-size:11px;font-weight:400">0</text>
<rect x="380" y="120" width="51" height="29" rx="4" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1;opacity:1"/>
<text x="405.5" y="139" text-anchor="middle" style="fill:var(--muted);font-size:11px;font-weight:400">0</text>
<rect x="434" y="120" width="51" height="29" rx="4" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1;opacity:1"/>
<text x="459.5" y="139" text-anchor="middle" style="fill:var(--muted);font-size:11px;font-weight:400">0</text>
<rect x="488" y="120" width="51" height="29" rx="4" style="fill:var(--green);stroke:var(--line-strong);stroke-width:1;opacity:0.9664868689593318"/>
<text x="513.5" y="139" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">1.42</text>
<text x="560" y="70" text-anchor="start" style="fill:var(--green-ink);font-size:10.5px;font-weight:400">cheese–pizza: rare but</text>
<text x="560" y="83" text-anchor="start" style="fill:var(--green-ink);font-size:10.5px;font-weight:400">tightly linked, so the</text>
<text x="560" y="96" text-anchor="start" style="fill:var(--green-ink);font-size:10.5px;font-weight:400">highest PPMI (1.42)</text>
<text x="560" y="118" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">negative PMI and unseen</text>
<text x="560" y="131" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">pairs (−∞) clip to 0</text>
</svg>
<p class="fig-cap">The worked example matrix, N = 42. Each cell is ln[count(w,c)·N / (count(w)·count(c))], kept only when positive.</p>
</div>

---

## 8.3 SVD for word representations

### 8.3.1 The recipe

Factorise the (PPMI) matrix $X\in\mathbb R^{m\times n}$ ($m$ words, $n$ contexts): $X=U\Sigma V^\top$. Keep the top $k$ singular values: $\hat X=U_k\Sigma_kV_k^\top$, the best rank-$k$ approximation (Eckart–Young, as in Week 5).
$$\boxed{W_{\text{word}}=U_k\Sigma_k\in\mathbb R^{m\times k},\qquad W_{\text{context}}=V_k\in\mathbb R^{n\times k}}$$
Row $i$ of $W_{\text{word}}$ is a $k$-dimensional, dense word vector.

### 8.3.2 [Derivation] Why $U\Sigma$ and not just $U$

Word similarity in the approximated matrix is $\hat X\hat X^\top$ (dot products of rows). Since $V_k^\top V_k=I$:
$$\hat X\hat X^\top=U_k\Sigma_kV_k^\top V_k\Sigma_kU_k^\top=(U_k\Sigma_k)(U_k\Sigma_k)^\top=W_{\text{word}}W_{\text{word}}^\top.$$
So the short $k$-dimensional rows of $U_k\Sigma_k$ have **exactly the same dot products** as the long $n$-dimensional rows of $\hat X$: same similarities, far fewer numbers.

**[Exam] End-term.** $X_{\text{PPMI}}\in\mathbb R^{1000\times800}$, SVD truncated to $k=50$.

| Statement / question | Answer | Why |
|---|---|---|
| numbers stored for a rank-1 truncation $\sigma_1\mathbf u_1\mathbf v_1^\top$ | **1801** | $1000+800+1$ |
| $W_{\text{word}}=U\Sigma\in\mathbb R^{1000\times50}$ gives 50-d vectors for the 1000 words | ✓ | §8.3.1 |
| $W_{\text{context}}=V\in\mathbb R^{800\times50}$ represents the 800 contexts | ✓ | §8.3.1 |
| SVD needs an iterative gradient-based procedure like CBOW | ✗ | it is a closed-form matrix factorisation |
| since $V^\top V=I$, $\hat X\hat X^\top=W_{\text{context}}W_{\text{context}}^\top$ | ✗ | it equals $W_{\text{word}}W_{\text{word}}^\top$ |

In general a rank-$k$ truncation of an $m\times n$ matrix stores $k(m+n+1)$ numbers instead of $mn$.

---

## 8.4 CBOW (predict the word from its context)

### 8.4.1 The model

**Continuous bag of words:** given the context, predict the centre word. With one context word $c$ (one-hot $\mathbf x_c$):
$$\mathbf h=W_{\text{context}}\,\mathbf x_c=\mathbf v_c\ \ (\text{the column of }c),\qquad \hat y_w=\frac{\exp(\mathbf u_w^\top\mathbf v_c)}{\sum_{w'\in V}\exp(\mathbf u_{w'}^\top\mathbf v_c)},\qquad \mathcal L=-\log\hat y_w.$$
$\mathbf v$ = context vectors, $\mathbf u$ = word (output) vectors, both $k$-dimensional. Multiplying by a one-hot vector just **selects a column**: no real multiplication happens. With several context words, $\mathbf h$ is the sum (or average) of their columns.

### 8.4.2 [Derivation] The updates pull the right pair together

$\mathcal L=-\mathbf u_w^\top\mathbf v_c+\log\sum_{w'}\exp(\mathbf u_{w'}^\top\mathbf v_c)$. Differentiate:
$$\frac{\partial\mathcal L}{\partial\mathbf u_{w'}}=(\hat y_{w'}-y_{w'})\,\mathbf v_c,\qquad \frac{\partial\mathcal L}{\partial\mathbf v_c}=\sum_{w'}(\hat y_{w'}-y_{w'})\,\mathbf u_{w'},$$
with $y_{w'}=1$ for the true word and 0 otherwise. So the GD step is
- true word: $\mathbf u_w\leftarrow\mathbf u_w+\eta(1-\hat y_w)\mathbf v_c$ (moves **toward** $\mathbf v_c$);
- every other word: $\mathbf u_{w'}\leftarrow\mathbf u_{w'}-\eta\hat y_{w'}\mathbf v_c$ (moves **away**).

Words that appear in the same contexts are all pulled toward the same $\mathbf v_c$'s, so they end up close to each other.

### 8.4.3 [Ex] One CBOW step, line by line

$|V|=3$, $k=2$, context vector $\mathbf v_c=(1,0)$, word vectors $\mathbf u_1=(1,1)$, $\mathbf u_2=(0,1)$, $\mathbf u_3=(-1,0)$. True word: 1. $\eta=0.5$.

| Line | Calculation | Result |
|---|---|---|
| 1 | scores $\mathbf u_{w}^\top\mathbf v_c$ | $(1,\ 0,\ -1)$ |
| 2 | softmax $\frac{e^{1},e^{0},e^{-1}}{e+1+e^{-1}}$ | $(0.665,\ 0.245,\ 0.090)$ |
| 3 | $\mathcal L=-\ln0.665$ | 0.408 |
| 4 | $\mathbf u_1+0.5(1-0.665)\mathbf v_c$ | $(1.168,\ 1)$ |
| 5 | $\mathbf u_2-0.5(0.245)\mathbf v_c$ | $(-0.122,\ 1)$ |
| 6 | $\mathbf u_3-0.5(0.090)\mathbf v_c$ | $(-1.045,\ 0)$ |
| 7 | $\partial\mathcal L/\partial\mathbf v_c=(0.665-1)\mathbf u_1+0.245\mathbf u_2+0.090\mathbf u_3$ | $(-0.425,\ -0.090)$ |
| 8 | $\mathbf v_c-0.5\times$ line 7 | $(1.212,\ 0.045)$ |

**[!] The bottleneck.** Line 2 sums over the **whole vocabulary**. With $|V|=50{,}000$, every training pair needs 50,000 dot products. §8.5 fixes this.

<div class="fig" role="img" aria-label="One CBOW update">
<svg viewBox="0 0 700 208" width="700" style="font-family:var(--font)" aria-hidden="true">
<line x1="46" y1="141.1" x2="316" y2="141.1" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="50.3" x2="316" y2="50.3" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="88.2" y1="14" x2="88.2" y2="182" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="172.6" y1="14" x2="172.6" y2="182" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="256.9" y1="14" x2="256.9" y2="182" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="14" x2="46" y2="182" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="46" y1="182" x2="316" y2="182" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="88.2" y="195" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">-1</text>
<text x="172.6" y="195" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="256.9" y="195" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="40" y="144.6" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="40" y="53.8" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<circle cx="256.9" cy="50.3" r="5" style="fill:var(--surface);stroke:var(--green-ink);stroke-width:1.6;opacity:0.8"/>
<line x1="256.9" y1="50.3" x2="267.6" y2="50.3" style="stroke:var(--green-ink);stroke-width:1.8;stroke-linecap:round"/>
<polygon points="271.1,50.3 266.1,52.7 266.1,47.9" style="fill:var(--green-ink)"/>
<circle cx="271.1" cy="50.3" r="4" style="fill:var(--green-ink);stroke:var(--green-ink);stroke-width:1"/>
<circle cx="172.6" cy="50.3" r="5" style="fill:var(--surface);stroke:var(--red-ink);stroke-width:1.6;opacity:0.8"/>
<line x1="172.6" y1="50.3" x2="165.8" y2="50.3" style="stroke:var(--red-ink);stroke-width:1.8;stroke-linecap:round"/>
<polygon points="162.3,50.3 167.3,47.9 167.3,52.7" style="fill:var(--red-ink)"/>
<circle cx="162.3" cy="50.3" r="4" style="fill:var(--red-ink);stroke:var(--red-ink);stroke-width:1"/>
<circle cx="88.2" cy="141.1" r="5" style="fill:var(--surface);stroke:var(--red-ink);stroke-width:1.6;opacity:0.8"/>
<line x1="88.2" y1="141.1" x2="87.9" y2="141.1" style="stroke:var(--red-ink);stroke-width:1.8;stroke-linecap:round"/>
<polygon points="84.4,141.1 89.4,138.7 89.4,143.5" style="fill:var(--red-ink)"/>
<circle cx="84.4" cy="141.1" r="4" style="fill:var(--red-ink);stroke:var(--red-ink);stroke-width:1"/>
<circle cx="256.9" cy="141.1" r="5" style="fill:var(--surface);stroke:var(--blue-ink);stroke-width:1.6;opacity:0.8"/>
<line x1="256.9" y1="141.1" x2="271.4" y2="137.8" style="stroke:var(--blue-ink);stroke-width:1.8;stroke-linecap:round"/>
<polygon points="274.8,137 270.5,140.5 269.4,135.8" style="fill:var(--blue-ink)"/>
<circle cx="274.8" cy="137" r="4" style="fill:var(--blue-ink);stroke:var(--blue-ink);stroke-width:1"/>
<text x="265.9" y="42.3" text-anchor="start" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">u₁ (true word) → toward v_c</text>
<text x="165.6" y="41.3" text-anchor="end" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">u₂ ← away</text>
<text x="88.2" y="158.1" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">u₃ ← away</text>
<text x="256.9" y="159.1" text-anchor="middle" style="fill:var(--blue-ink);font-size:10.5px;font-weight:700">v_c</text>
<text x="181" y="14" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700"></text>
<text x="550" y="20" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">softmax over the vocabulary</text>
<text x="452" y="61" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">word 1 (true)</text>
<rect x="460" y="40" width="139.7" height="16" rx="3" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.2"/>
<rect x="460" y="58" width="164.7" height="16" rx="3" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="604.7" y="52" text-anchor="start" style="fill:var(--muted);font-size:10px;font-weight:400">0.665</text>
<text x="629.7" y="70" text-anchor="start" style="fill:var(--green-ink);font-size:10px;font-weight:700">0.784</text>
<text x="452" y="105" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">word 2</text>
<rect x="460" y="84" width="51.4" height="16" rx="3" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.2"/>
<rect x="460" y="102" width="34.5" height="16" rx="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="516.4" y="96" text-anchor="start" style="fill:var(--muted);font-size:10px;font-weight:400">0.245</text>
<text x="499.5" y="114" text-anchor="start" style="fill:var(--red-ink);font-size:10px;font-weight:700">0.164</text>
<text x="452" y="149" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">word 3</text>
<rect x="460" y="128" width="18.9" height="16" rx="3" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.2"/>
<rect x="460" y="146" width="10.8" height="16" rx="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="483.9" y="140" text-anchor="start" style="fill:var(--muted);font-size:10px;font-weight:400">0.090</text>
<text x="475.8" y="158" text-anchor="start" style="fill:var(--red-ink);font-size:10px;font-weight:700">0.051</text>
<text x="550" y="178" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">loss  0.408  →  0.243  after one step</text>
<rect x="460" y="193" width="10" height="8" rx="0" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1"/>
<text x="474" y="201" text-anchor="start" style="fill:var(--muted);font-size:10px;font-weight:400">before</text>
<rect x="530" y="193" width="10" height="8" rx="0" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1"/>
<text x="544" y="201" text-anchor="start" style="fill:var(--muted);font-size:10px;font-weight:400">after the update</text>
</svg>
<p class="fig-cap">The worked CBOW step with η = 0.5. Hollow points are before the update, filled after: the true word vector moves toward the context vector and the others move away, so the true word's probability rises from 0.665 to 0.784.</p>
</div>

---

## 8.5 Skip-gram, negative sampling, hierarchical softmax

### 8.5.1 Skip-gram

The reverse of CBOW: given the word $w$, predict each context word $c$ in its window: $p(c\mid w)=\mathrm{softmax}(\mathbf u_c^\top\mathbf v_w)$. Same softmax cost over $|V|$, so it needs a cheaper objective.

<div class="fig" role="img" aria-label="CBOW and skip-gram">
<svg viewBox="0 0 700 174" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="0" y="4" width="64" height="20" rx="5" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<text x="32" y="17.7" text-anchor="middle" style="fill:var(--fg-2);font-size:10.5px;font-weight:700">w(t−2)</text>
<line x1="64" y1="14" x2="146.8" y2="47.7" style="stroke:var(--line-strong);stroke-width:1.2;stroke-linecap:round"/>
<polygon points="150,49 144.5,49.3 146.3,44.9" style="fill:var(--line-strong)"/>
<rect x="0" y="30" width="64" height="20" rx="5" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<text x="32" y="43.7" text-anchor="middle" style="fill:var(--fg-2);font-size:10.5px;font-weight:700">w(t−1)</text>
<line x1="64" y1="40" x2="146.5" y2="48.6" style="stroke:var(--line-strong);stroke-width:1.2;stroke-linecap:round"/>
<polygon points="150,49 144.8,50.9 145.3,46.1" style="fill:var(--line-strong)"/>
<rect x="0" y="56" width="64" height="20" rx="5" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<text x="32" y="69.7" text-anchor="middle" style="fill:var(--fg-2);font-size:10.5px;font-weight:700">w(t+1)</text>
<line x1="64" y1="66" x2="146.6" y2="49.7" style="stroke:var(--line-strong);stroke-width:1.2;stroke-linecap:round"/>
<polygon points="150,49 145.6,52.3 144.6,47.6" style="fill:var(--line-strong)"/>
<rect x="0" y="82" width="64" height="20" rx="5" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<text x="32" y="95.7" text-anchor="middle" style="fill:var(--fg-2);font-size:10.5px;font-weight:700">w(t+2)</text>
<line x1="64" y1="92" x2="146.9" y2="50.6" style="stroke:var(--line-strong);stroke-width:1.2;stroke-linecap:round"/>
<polygon points="150,49 146.6,53.4 144.5,49.1" style="fill:var(--line-strong)"/>
<rect x="152" y="34" width="96" height="30" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="200" y="52.9" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">centre w(t)</text>
<rect x="380" y="34" width="96" height="30" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="428" y="52.9" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">centre w(t)</text>
<line x1="476" y1="49" x2="556.8" y2="15.3" style="stroke:var(--line-strong);stroke-width:1.2;stroke-linecap:round"/>
<polygon points="560,14 556.3,18.1 554.5,13.7" style="fill:var(--line-strong)"/>
<rect x="562" y="4" width="64" height="20" rx="5" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<text x="594" y="17.7" text-anchor="middle" style="fill:var(--fg-2);font-size:10.5px;font-weight:700">w(t−2)</text>
<line x1="476" y1="49" x2="556.5" y2="40.4" style="stroke:var(--line-strong);stroke-width:1.2;stroke-linecap:round"/>
<polygon points="560,40 555.3,42.9 554.8,38.1" style="fill:var(--line-strong)"/>
<rect x="562" y="30" width="64" height="20" rx="5" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<text x="594" y="43.7" text-anchor="middle" style="fill:var(--fg-2);font-size:10.5px;font-weight:700">w(t−1)</text>
<line x1="476" y1="49" x2="556.6" y2="65.3" style="stroke:var(--line-strong);stroke-width:1.2;stroke-linecap:round"/>
<polygon points="560,66 554.6,67.4 555.6,62.7" style="fill:var(--line-strong)"/>
<rect x="562" y="56" width="64" height="20" rx="5" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<text x="594" y="69.7" text-anchor="middle" style="fill:var(--fg-2);font-size:10.5px;font-weight:700">w(t+1)</text>
<line x1="476" y1="49" x2="556.9" y2="90.4" style="stroke:var(--line-strong);stroke-width:1.2;stroke-linecap:round"/>
<polygon points="560,92 554.5,91.9 556.6,87.6" style="fill:var(--line-strong)"/>
<rect x="562" y="82" width="64" height="20" rx="5" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<text x="594" y="95.7" text-anchor="middle" style="fill:var(--fg-2);font-size:10.5px;font-weight:700">w(t+2)</text>
<text x="124" y="122" text-anchor="middle" style="fill:var(--fg);font-size:11px;font-weight:700">CBOW: context words predict the centre</text>
<text x="500" y="122" text-anchor="middle" style="fill:var(--fg);font-size:11px;font-weight:700">Skip-gram: centre predicts each context word</text>
<rect x="0" y="134" width="215" height="34" rx="8" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="107.5" y="147.9" text-anchor="middle" style="fill:var(--red-ink);font-size:11px;font-weight:700">full softmax</text>
<text x="107.5" y="161.9" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:500">|V| exponentials per pair</text>
<line x1="215" y1="151" x2="257.8" y2="151" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="262,151 256,153.9 256,148.1" style="fill:var(--line-strong)"/>
<rect x="262" y="134" width="215" height="34" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="369.5" y="147.9" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">negative sampling</text>
<text x="369.5" y="161.9" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:500">k + 1 sigmoids per pair</text>
<text x="496" y="155" text-anchor="middle" style="fill:var(--muted);font-size:11px;font-weight:700">or</text>
<rect x="515" y="134" width="175" height="34" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="602.5" y="147.9" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">hierarchical softmax</text>
<text x="602.5" y="161.9" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:500">log₂|V| sigmoids</text>
</svg>
<p class="fig-cap">Both models need a softmax over the whole vocabulary; negative sampling or a binary-tree softmax makes each training pair cheap.</p>
</div>

### 8.5.2 Negative sampling

Turn "which of 50,000 words?" into many cheap **yes/no** questions. $D$ = observed (word, context) pairs, labelled 1; $D'$ = random (word, random word) pairs, labelled 0, about $k$ per positive pair. Model $P(\text{real}\mid w,c)=\sigma(\mathbf u_c^\top\mathbf v_w)$. Maximise
$$\sum_{(w,c)\in D}\log\sigma(\mathbf u_c^\top\mathbf v_w)+\sum_{(w,r)\in D'}\log\sigma(-\mathbf u_r^\top\mathbf v_w).$$
(Using $1-\sigma(z)=\sigma(-z)$ for the negatives.) Cost per pair: $k+1$ sigmoids instead of $|V|$ exponentials.

**Sampling negatives.** Draw $r$ with probability $\propto\mathrm{count}(r)^{3/4}$. The power $\frac34$ flattens the distribution so rare words are sampled more often than their raw frequency.

| count | raw share | share with $^{3/4}$ |
|---|---|---|
| 100 | 0.901 | 0.827 |
| 10 | 0.090 | 0.147 |
| 1 | 0.009 | 0.026 |

<div class="fig" role="img" aria-label="Negative sampling and hierarchical softmax">
<svg viewBox="0 0 700 188" width="700" style="font-family:var(--font)" aria-hidden="true">
<line x1="46" y1="142" x2="296" y2="142" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="86" x2="296" y2="86" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="30" x2="296" y2="30" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="30" x2="46" y2="142" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="46" y1="142" x2="296" y2="142" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="40" y="145.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="40" y="89.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0.5</text>
<text x="40" y="33.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">1</text>
<text x="12" y="86" text-anchor="middle" transform="rotate(-90 12 86)" style="fill:var(--muted);font-size:10.5px;font-weight:400">sampling share</text>
<text x="171" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">negative sampling: counts vs counts^¾</text>
<rect x="54.3" y="41.1" width="31.7" height="100.9" rx="3" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.4"/>
<rect x="89" y="49.4" width="31.7" height="92.6" rx="3" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.4"/>
<text x="87.5" y="155" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">count 100</text>
<text x="70.2" y="37.1" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:700">0.901</text>
<text x="104.8" y="45.4" text-anchor="middle" style="fill:var(--green-ink);font-size:9.5px;font-weight:700">0.827</text>
<rect x="137.7" y="131.9" width="31.7" height="10.1" rx="3" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.4"/>
<rect x="172.3" y="125.5" width="31.7" height="16.5" rx="3" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.4"/>
<text x="170.8" y="155" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">count 10</text>
<text x="153.5" y="127.9" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:700">0.090</text>
<text x="188.2" y="121.5" text-anchor="middle" style="fill:var(--green-ink);font-size:9.5px;font-weight:700">0.147</text>
<rect x="221" y="141" width="31.7" height="1" rx="3" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.4"/>
<rect x="255.7" y="139.1" width="31.7" height="2.9" rx="3" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.4"/>
<text x="254.2" y="155" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">count 1</text>
<text x="236.8" y="137" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:700">0.009</text>
<text x="271.5" y="135.1" text-anchor="middle" style="fill:var(--green-ink);font-size:9.5px;font-weight:700">0.026</text>
<rect x="160" y="170" width="10" height="10" rx="0" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.2"/>
<text x="174" y="179" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">raw share</text>
<rect x="240" y="170" width="10" height="10" rx="0" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.2"/>
<text x="254" y="179" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">share with ^¾</text>
<text x="560" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">evaluations per prediction, |V| = 65,536</text>
<text x="462" y="57" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">full softmax</text>
<rect x="470" y="40" width="149" height="24" rx="4" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="625" y="57" text-anchor="start" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">65,536</text>
<text x="462" y="95" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">neg. sampling, k = 5</text>
<rect x="470" y="78" width="27.8" height="24" rx="4" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="503.8" y="95" text-anchor="start" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">6</text>
<text x="462" y="133" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">hier. softmax</text>
<rect x="470" y="116" width="40.6" height="24" rx="4" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="516.6" y="133" text-anchor="start" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">16</text>
<text x="560" y="162" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">log scale: ≈ 4,000× fewer exponentials</text>
</svg>
<p class="fig-cap">Left: the ¾ power flattens the sampling distribution so rare words are drawn as negatives more often than their raw share. Right: cost of one prediction under each scheme.</p>
</div>

### 8.5.3 [Exam] End-term: one negative-sampling step

Loss for one positive pair and one negative: $L=-\log\sigma(\mathbf w^\top\mathbf c)-\log\sigma(-\mathbf w_{\text{neg}}^\top\mathbf c)$, with $\mathbf w=(1,0)$, $\mathbf c=(1,1)$, $\mathbf w_{\text{neg}}=(0,1)$; update $\mathbf w$ with $\eta=0.5$.

| Line | Calculation | Result |
|---|---|---|
| 1 | $\mathbf w^\top\mathbf c=1$; $\mathbf w_{\text{neg}}^\top\mathbf c=1$ | |
| 2 | $-\ln\sigma(1)=-\ln0.7311$ | 0.3133 |
| 3 | $-\ln\sigma(-1)=-\ln0.2689$ | 1.3133 |
| 4 | $L$ | **1.627** |
| 5 | $\partial L/\partial\mathbf w=-(1-\sigma(\mathbf w^\top\mathbf c))\mathbf c=-\sigma(-1)\mathbf c$ (the negative term has no $\mathbf w$) | $-0.2689\,(1,1)$ |
| 6 | $\mathbf w_{\text{new}}=\mathbf w-0.5\times$ line 5 | $(1.1345,\ 0.1345)$ |
| 7 | $\cos(\mathbf w_{\text{new}},\mathbf c)=\frac{1.269}{1.1424\times1.4142}$ | **0.785** |

Before the step $\cos(\mathbf w,\mathbf c)=1/\sqrt2=0.707$: the update pulled the word toward its true context.

**Where the gradient comes from:** $\frac{d}{dz}[-\log\sigma(z)]=-(1-\sigma(z))$, and $z=\mathbf w^\top\mathbf c$ gives $\partial z/\partial\mathbf w=\mathbf c$.

### 8.5.4 Hierarchical softmax

Put the vocabulary at the leaves of a binary tree. $p(w\mid\text{context})$ is the product of left/right sigmoid decisions $\sigma(\pm\mathbf u_{\text{node}}^\top\mathbf h)$ along the path from the root to $w$. Cost: path length $\approx\log_2|V|$. For $|V|=65{,}536$: 16 sigmoids instead of 65,536 exponentials. The probabilities over all leaves still sum to 1 automatically.

---

## 8.6 GloVe and evaluating word vectors

### 8.6.1 GloVe (global vectors)

Count methods use **global** statistics but train no predictor; prediction methods learn well but only see one window at a time. GloVe asks the vectors to explain the global counts directly:
$$\mathbf v_i^\top\tilde{\mathbf v}_j+b_i+\tilde b_j\approx\log X_{ij},\qquad J=\sum_{i,j}f(X_{ij})\big(\mathbf v_i^\top\tilde{\mathbf v}_j+b_i+\tilde b_j-\log X_{ij}\big)^2.$$
(Start from $\mathbf v_i^\top\tilde{\mathbf v}_j\approx\log P(j\mid i)=\log X_{ij}-\log X_i$; the $\log X_i$ term and symmetry are absorbed into biases.)
Weighting $f(x)=(x/x_{\max})^{\alpha}$ for $x<x_{\max}$, else 1 (typically $\alpha=0.75$, $x_{\max}=100$): rare pairs count less, very frequent pairs do not dominate, and $f(0)=0$ removes $\log0$.
**[Ex]** $f(25)=0.25^{0.75}=0.354$; $f(400)=1$.

### 8.6.2 Evaluating word vectors

| Task | How |
|---|---|
| Semantic relatedness | correlate $\cos(\mathbf v_a,\mathbf v_b)$ with human similarity scores |
| Synonym detection | pick the candidate with the highest cosine |
| Analogy | $\mathbf v_{\text{king}}-\mathbf v_{\text{man}}+\mathbf v_{\text{woman}}\approx\mathbf v_{\text{queen}}$: answer = $\arg\max_w\cos(\mathbf v_w,\ \cdot)$ |

**Count vs predict.** Early comparisons favoured prediction (word2vec), but with tuned hyperparameters SVD on PPMI is competitive; in fact skip-gram with negative sampling has been shown to implicitly factorise a shifted PMI matrix ($\mathrm{PMI}-\log k$). The two families are closer than they look.

---

# Part B: convolutional neural networks

## 8.7 The convolution operation

### 8.7.1 1-D

A weighted sum of a few neighbouring inputs, with the **same** weights at every position:
$$s_t=\sum_{a}x_{t+a}\,w_a.$$
(Strictly, convolution flips the kernel, $\sum_ax_{t-a}w_a$; deep-learning libraries compute the unflipped version, cross-correlation, and still call it convolution. Since the weights are learned, it makes no difference.)

**[Ex]** $\mathbf x=(1,2,3,4,5)$, $\mathbf w=(1,0,-1)$: $s=(1-3,\ 2-4,\ 3-5)=(-2,-2,-2)$. A constant slope gives a constant response: this filter is a slope detector.

### 8.7.2 2-D

$$S_{ij}=\sum_{a}\sum_{b}I_{i+a,\,j+b}\,K_{a,b}.$$
Slide the $F\times F$ kernel over the image; at each position multiply element-wise and add.

**[Ex] A vertical-edge filter.** $I=\begin{bmatrix}1&2&0&1\\0&1&3&1\\2&1&0&2\\1&0&1&3\end{bmatrix}$, $K=\begin{bmatrix}1&0&-1\\1&0&-1\\1&0&-1\end{bmatrix}$ (left column minus right column), stride 1, no padding.

| Position | left column sum | right column sum | $S$ |
|---|---|---|---|
| top-left | $1+0+2=3$ | $0+3+0=3$ | 0 |
| top-right | $2+1+1=4$ | $1+1+2=4$ | 0 |
| bottom-left | $0+2+1=3$ | $3+0+1=4$ | −1 |
| bottom-right | $1+1+0=2$ | $1+2+3=6$ | −4 |

$S=\begin{bmatrix}0&0\\-1&-4\end{bmatrix}$: strongest response where the right side is much brighter than the left.

<div class="fig" role="img" aria-label="Sliding a convolution kernel">
<svg viewBox="0 0 700 190" width="700" style="font-family:var(--font)" aria-hidden="true">
<text x="94" y="28" text-anchor="middle" style="fill:var(--fg);font-size:11px;font-weight:700">image 4 × 4</text>
<rect x="30" y="40" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.43000000000000005"/>
<text x="45" y="60" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">1</text>
<rect x="62" y="40" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.7100000000000001"/>
<text x="77" y="60" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">2</text>
<rect x="94" y="40" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.15"/>
<text x="109" y="60" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">0</text>
<rect x="126" y="40" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.43000000000000005"/>
<text x="141" y="60" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">1</text>
<rect x="30" y="72" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.15"/>
<text x="45" y="92" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">0</text>
<rect x="62" y="72" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.43000000000000005"/>
<text x="77" y="92" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">1</text>
<rect x="94" y="72" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.9900000000000001"/>
<text x="109" y="92" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">3</text>
<rect x="126" y="72" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.43000000000000005"/>
<text x="141" y="92" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">1</text>
<rect x="30" y="104" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.7100000000000001"/>
<text x="45" y="124" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">2</text>
<rect x="62" y="104" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.43000000000000005"/>
<text x="77" y="124" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">1</text>
<rect x="94" y="104" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.15"/>
<text x="109" y="124" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">0</text>
<rect x="126" y="104" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.7100000000000001"/>
<text x="141" y="124" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">2</text>
<rect x="30" y="136" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.43000000000000005"/>
<text x="45" y="156" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">1</text>
<rect x="62" y="136" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.15"/>
<text x="77" y="156" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">0</text>
<rect x="94" y="136" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.43000000000000005"/>
<text x="109" y="156" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">1</text>
<rect x="126" y="136" width="30" height="30" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1;opacity:0.9900000000000001"/>
<text x="141" y="156" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">3</text>
<rect x="30" y="40" width="94" height="94" rx="4" style="fill:none;stroke:var(--blue-ink);stroke-width:1;opacity:0.25;stroke-dasharray:3 3"/>
<rect x="62" y="40" width="94" height="94" rx="4" style="fill:none;stroke:var(--blue-ink);stroke-width:1;opacity:0.25;stroke-dasharray:3 3"/>
<rect x="30" y="72" width="94" height="94" rx="4" style="fill:none;stroke:var(--blue-ink);stroke-width:1;opacity:0.25;stroke-dasharray:3 3"/>
<rect x="62" y="72" width="94" height="94" rx="4" style="fill:none;stroke:var(--blue-ink);stroke-width:1;opacity:0.25;stroke-dasharray:3 3"/>
<rect x="30" y="40" width="94" height="94" rx="4" style="fill:var(--blue);fill-opacity:0.12;stroke:var(--blue-ink);stroke-width:3"><animate attributeName="x" dur="8s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3;0.5;0.8" values="30;62;30;62"/><animate attributeName="y" dur="8s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3;0.5;0.8" values="40;40;72;72"/></rect>
<text x="172" y="112" text-anchor="middle" style="fill:var(--muted);font-size:20px;font-weight:700">⊛</text>
<text x="238" y="50" text-anchor="middle" style="fill:var(--fg);font-size:11px;font-weight:700">kernel 3 × 3</text>
<rect x="196" y="62" width="26" height="26" rx="3" style="fill:var(--green);stroke:var(--line-strong);stroke-width:1"/>
<text x="209" y="80" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">1</text>
<rect x="224" y="62" width="26" height="26" rx="3" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1"/>
<text x="237" y="80" text-anchor="middle" style="fill:var(--muted);font-size:11px;font-weight:700">0</text>
<rect x="252" y="62" width="26" height="26" rx="3" style="fill:var(--red);stroke:var(--line-strong);stroke-width:1"/>
<text x="265" y="80" text-anchor="middle" style="fill:var(--red-ink);font-size:11px;font-weight:700">-1</text>
<rect x="196" y="90" width="26" height="26" rx="3" style="fill:var(--green);stroke:var(--line-strong);stroke-width:1"/>
<text x="209" y="108" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">1</text>
<rect x="224" y="90" width="26" height="26" rx="3" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1"/>
<text x="237" y="108" text-anchor="middle" style="fill:var(--muted);font-size:11px;font-weight:700">0</text>
<rect x="252" y="90" width="26" height="26" rx="3" style="fill:var(--red);stroke:var(--line-strong);stroke-width:1"/>
<text x="265" y="108" text-anchor="middle" style="fill:var(--red-ink);font-size:11px;font-weight:700">-1</text>
<rect x="196" y="118" width="26" height="26" rx="3" style="fill:var(--green);stroke:var(--line-strong);stroke-width:1"/>
<text x="209" y="136" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">1</text>
<rect x="224" y="118" width="26" height="26" rx="3" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1"/>
<text x="237" y="136" text-anchor="middle" style="fill:var(--muted);font-size:11px;font-weight:700">0</text>
<rect x="252" y="118" width="26" height="26" rx="3" style="fill:var(--red);stroke:var(--line-strong);stroke-width:1"/>
<text x="265" y="136" text-anchor="middle" style="fill:var(--red-ink);font-size:11px;font-weight:700">-1</text>
<text x="302" y="112" text-anchor="middle" style="fill:var(--muted);font-size:20px;font-weight:700">=</text>
<text x="370" y="50" text-anchor="middle" style="fill:var(--fg);font-size:11px;font-weight:700">output 2 × 2</text>
<rect x="330" y="66" width="37" height="37" rx="4" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1;opacity:1"/>
<text x="348.5" y="90" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-weight:700">0</text>
<rect x="370" y="66" width="37" height="37" rx="4" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1;opacity:1"/>
<text x="388.5" y="90" text-anchor="middle" style="fill:var(--muted);font-size:12px;font-weight:700">0</text>
<rect x="330" y="106" width="37" height="37" rx="4" style="fill:var(--red);stroke:var(--line-strong);stroke-width:1;opacity:0.47"/>
<text x="348.5" y="130" text-anchor="middle" style="fill:var(--red-ink);font-size:12px;font-weight:700">-1</text>
<rect x="370" y="106" width="37" height="37" rx="4" style="fill:var(--red);stroke:var(--line-strong);stroke-width:1;opacity:0.98"/>
<text x="388.5" y="130" text-anchor="middle" style="fill:var(--red-ink);font-size:12px;font-weight:700">-4</text>
<rect x="330" y="66" width="37" height="37" rx="4" style="fill:none;stroke:var(--blue-ink);stroke-width:3"><animate attributeName="x" dur="8s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3;0.5;0.8" values="330;370;330;370"/><animate attributeName="y" dur="8s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3;0.5;0.8" values="66;66;106;106"/></rect>
<text x="450" y="96" text-anchor="start" opacity="1" style="fill:var(--fg);font-size:11.5px;font-weight:700">top-left: left column 3, right column 3 → 0<animate attributeName="opacity" dur="8s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3;0.5;0.8" values="1;0;0;0"/></text>
<text x="450" y="96" text-anchor="start" opacity="0" style="fill:var(--fg);font-size:11.5px;font-weight:700">top-right: 4 − 4 → 0<animate attributeName="opacity" dur="8s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3;0.5;0.8" values="0;1;0;0"/></text>
<text x="450" y="96" text-anchor="start" opacity="0" style="fill:var(--fg);font-size:11.5px;font-weight:700">bottom-left: 3 − 4 → −1<animate attributeName="opacity" dur="8s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3;0.5;0.8" values="0;0;1;0"/></text>
<text x="450" y="96" text-anchor="start" opacity="0" style="fill:var(--fg);font-size:11.5px;font-weight:700">bottom-right: 2 − 6 → −4<animate attributeName="opacity" dur="8s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3;0.5;0.8" values="0;0;0;1"/></text>
<text x="450" y="72" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">window sum, left column minus right column:</text>
<text x="450" y="124" text-anchor="start" style="fill:var(--fg-2);font-size:11px;font-weight:400">output size = (4 − 3 + 0) / 1 + 1 = 2</text>
<text x="450" y="140" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">the same 9 weights are used at every position</text>
</svg>
<p class="fig-cap">The vertical-edge example: a 3 × 3 window slides over the 4 × 4 image with stride 1 and no padding; each position gives one output number. The window cycles through the four positions.</p>
</div>

### 8.7.3 Depth

For an input of depth $D_1$ (e.g. 3 for RGB), every filter is $F\times F\times D_1$: it always spans the **full depth**. One filter produces **one** 2-D feature map. $K$ filters stacked give an output of depth $K$.

<div class="fig" role="img" aria-label="Convolution depth">
<svg viewBox="0 0 700 164" width="700" style="font-family:var(--font)" aria-hidden="true">
<polygon points="20,38 50,20 120,20 90,38" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.3;opacity:1"/>
<polygon points="90,38 120,20 120,90 90,108" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.3;opacity:0.8"/>
<rect x="20" y="38" width="70" height="70" rx="0" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="65" y="144" text-anchor="middle" style="fill:var(--blue-ink);font-size:10.5px;font-weight:700">input  W₁ × H₁ × D₁</text>
<text x="122" y="26" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">D₁</text>
<line x1="150" y1="76" x2="201.8" y2="76" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="206,76 200,78.9 200,73.1" style="fill:var(--line-strong)"/>
<text x="178" y="66" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:700">K filters</text>
<polygon points="220,24 250,6 274,6 244,24" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.3;opacity:1"/>
<polygon points="244,24 274,6 274,30 244,48" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.3;opacity:0.8"/>
<rect x="220" y="24" width="24" height="24" rx="0" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<polygon points="220,62 250,44 274,44 244,62" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.3;opacity:1"/>
<polygon points="244,62 274,44 274,68 244,86" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.3;opacity:0.8"/>
<rect x="220" y="62" width="24" height="24" rx="0" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.5"/>
<polygon points="220,100 250,82 274,82 244,100" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.3;opacity:1"/>
<polygon points="244,100 274,82 274,106 244,124" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.3;opacity:0.8"/>
<rect x="220" y="100" width="24" height="24" rx="0" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="250" y="144" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:700">each F × F × D₁</text>
<text x="250" y="157" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">(full input depth)</text>
<line x1="312" y1="76" x2="383.8" y2="76" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="388,76 382,78.9 382,73.1" style="fill:var(--line-strong)"/>
<text x="350" y="66" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:700">one map each</text>
<polygon points="442,38 450,33 506,33 498,38" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.3;opacity:0.95"/>
<polygon points="498,38 506,33 506,89 498,94" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.3;opacity:0.76"/>
<rect x="442" y="38" width="56" height="56" rx="0" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<polygon points="426,46 434,41 490,41 482,46" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.3;opacity:0.95"/>
<polygon points="482,46 490,41 490,97 482,102" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.3;opacity:0.76"/>
<rect x="426" y="46" width="56" height="56" rx="0" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.5"/>
<polygon points="410,54 418,49 474,49 466,54" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.3;opacity:0.95"/>
<polygon points="466,54 474,49 474,105 466,110" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.3;opacity:0.76"/>
<rect x="410" y="54" width="56" height="56" rx="0" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="458" y="144" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">output  W₂ × H₂ × K</text>
<text x="630" y="76" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">depth = number of filters,</text>
<text x="630" y="90" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">never the input depth</text>
</svg>
<p class="fig-cap">Every filter spans the full input depth and produces one 2-D feature map; K filters stacked give an output of depth K.</p>
</div>

---

## 8.8 Output size, padding and stride

### 8.8.1 [Derivation] The output-size formula

Pad the input with $P$ zeros on each side: width $W_1+2P$. A filter of width $F$ can start at positions $0,S,2S,\dots$ as long as it fits, i.e. start $\le W_1+2P-F$. The number of starting positions is
$$\boxed{W_2=\frac{W_1-F+2P}{S}+1,\qquad H_2=\frac{H_1-F+2P}{S}+1,\qquad D_2=K}$$
(take the floor if the division is not exact).

| Special case | Result |
|---|---|
| "same" output size with $S=1$ | $P=\frac{F-1}{2}$ ($F=3\Rightarrow P=1$, $F=5\Rightarrow P=2$, $F=7\Rightarrow P=3$) |
| no padding, $S=1$ | each layer shrinks by $F-1$ |
| stride 2 | output roughly halves |

### 8.8.2 [Exam] Quiz 2 and end-term, solved

| Question | Working | Answer |
|---|---|---|
| $48\times48\times3$, $7\times7$ kernel, $S=1$: padding for same size | $\frac{48-7+2P}{1}+1=48\Rightarrow2P=6$ | $P=$ **3** |
| same input, $P=0$, $S=1$, $K=4$: output shape | $\frac{48-7}{1}+1=42$; depth $=K$ | **$42\times42\times4$** |
| parameters of that layer | $4\times(7\cdot7\cdot3+1)=4\times148$ | **592** |
| $300\times300\times6$, ten $15\times15\times6$ kernels, $P=0$, output $96\times96\times10$: stride | $\frac{300-15}{S}+1=96\Rightarrow285/S=95$ | $S=$ **3** |

**[!] Trap.** The output depth is the number of **filters**, never the input depth (the $42\times42\times3$ option is wrong).

---

## 8.9 Parameters: sparse connectivity and weight sharing

### 8.9.1 Counting

$$\boxed{\#\text{params}=K\,(F\cdot F\cdot D_1+1)}$$
($F\cdot F\cdot D_1$ weights per filter plus one bias per filter.) It does **not** depend on the image size.

**[Ex] Conv vs fully connected.** $32\times32\times3$ input to a $28\times28\times6$ output.

| Layer | Parameters |
|---|---|
| fully connected | $3072\times4704\approx14.45$ million |
| six $5\times5\times3$ filters | $6\times(75+1)=456$ |

### 8.9.2 Why it works

- **Sparse connectivity:** each output looks at only an $F\times F$ patch (local structure: neighbouring pixels are related).
- **Weight sharing:** the same filter is applied everywhere (a feature useful in one corner is useful in another).
- **Receptive field grows with depth:** a unit in layer 2 sees $3\times3$ units of layer 1, each of which sees $3\times3$ pixels, so it sees a $5\times5$ patch of the image. Deep layers see large regions while every layer stays local.

<div class="fig" role="img" aria-label="Receptive field and weight sharing">
<svg viewBox="0 0 700 172" width="700" style="font-family:var(--font)" aria-hidden="true">
<line x1="144" y1="24" x2="106" y2="66" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="144" y1="24" x2="144" y2="66" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="144" y1="24" x2="182" y2="66" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="182" y1="24" x2="144" y2="66" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="182" y1="24" x2="182" y2="66" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="182" y1="24" x2="220" y2="66" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="220" y1="24" x2="182" y2="66" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="220" y1="24" x2="220" y2="66" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="220" y1="24" x2="258" y2="66" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="106" y1="66" x2="68" y2="108" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="106" y1="66" x2="106" y2="108" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="106" y1="66" x2="144" y2="108" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="144" y1="66" x2="106" y2="108" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="144" y1="66" x2="144" y2="108" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="144" y1="66" x2="182" y2="108" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="182" y1="66" x2="144" y2="108" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="182" y1="66" x2="182" y2="108" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="182" y1="66" x2="220" y2="108" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="220" y1="66" x2="182" y2="108" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="220" y1="66" x2="220" y2="108" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="220" y1="66" x2="258" y2="108" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="258" y1="66" x2="220" y2="108" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="258" y1="66" x2="258" y2="108" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="258" y1="66" x2="296" y2="108" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="68" y1="108" x2="30" y2="150" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="68" y1="108" x2="68" y2="150" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="68" y1="108" x2="106" y2="150" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="106" y1="108" x2="68" y2="150" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="106" y1="108" x2="106" y2="150" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="106" y1="108" x2="144" y2="150" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="144" y1="108" x2="106" y2="150" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="144" y1="108" x2="144" y2="150" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="144" y1="108" x2="182" y2="150" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="182" y1="108" x2="144" y2="150" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="182" y1="108" x2="182" y2="150" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="182" y1="108" x2="220" y2="150" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="220" y1="108" x2="182" y2="150" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="220" y1="108" x2="220" y2="150" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="220" y1="108" x2="258" y2="150" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="258" y1="108" x2="220" y2="150" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="258" y1="108" x2="258" y2="150" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="258" y1="108" x2="296" y2="150" style="stroke:var(--green-ink);stroke-width:1.6;stroke-linecap:round"/>
<line x1="296" y1="108" x2="258" y2="150" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="296" y1="108" x2="296" y2="150" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="296" y1="108" x2="334" y2="150" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<circle cx="144" cy="24" r="7" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1.2"/>
<circle cx="182" cy="24" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="220" cy="24" r="7" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1.2"/>
<circle cx="106" cy="66" r="7" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1.2"/>
<circle cx="144" cy="66" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="182" cy="66" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="220" cy="66" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="258" cy="66" r="7" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1.2"/>
<circle cx="68" cy="108" r="7" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1.2"/>
<circle cx="106" cy="108" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="144" cy="108" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="182" cy="108" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="220" cy="108" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="258" cy="108" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="296" cy="108" r="7" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1.2"/>
<circle cx="30" cy="150" r="7" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1.2"/>
<circle cx="68" cy="150" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="106" cy="150" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="144" cy="150" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="182" cy="150" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="220" cy="150" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="258" cy="150" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="296" cy="150" r="7" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<circle cx="334" cy="150" r="7" style="fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1.2"/>
<text x="350" y="28" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">conv 3</text>
<text x="350" y="70" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">conv 2</text>
<text x="350" y="112" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">conv 1</text>
<text x="350" y="154" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">input</text>
<text x="12" y="22" text-anchor="start" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">top unit sees</text>
<text x="12" y="35" text-anchor="start" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">7 inputs</text>
<text x="584" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">parameters, 32×32×3 → 28×28×6</text>
<text x="500" y="57" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">fully connected</text>
<rect x="508" y="40" width="114.6" height="24" rx="4" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="628.6" y="57" text-anchor="start" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">14,450,000</text>
<text x="500" y="101" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">6 conv filters 5×5×3</text>
<rect x="508" y="84" width="42.5" height="24" rx="4" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="556.5" y="101" text-anchor="start" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">456</text>
<text x="584" y="150" text-anchor="middle" style="fill:var(--muted);font-size:10.5px;font-weight:400">log scale: ≈ 31,000× fewer</text>
</svg>
<p class="fig-cap">Left: three stacked 3-wide layers (1-D for clarity): every unit is local, yet the top unit depends on 7 inputs; n stacked 3 × 3 layers see (2n + 1) × (2n + 1). Right: sharing one small filter everywhere slashes the parameter count.</p>
</div>

---

## 8.10 Pooling and a full parameter count

### 8.10.1 Pooling

Summarise each small window; applied to each depth slice separately; **no parameters**. Output size $\frac{W_1-F}{S}+1$ (floor), depth unchanged.

**[Ex]** $2\times2$ pooling, stride 2, on $\begin{bmatrix}1&3&2&1\\4&6&5&0\\3&1&1&2\\0&2&4&8\end{bmatrix}$:

| Window | values | max | average |
|---|---|---|---|
| top-left | 1, 3, 4, 6 | 6 | 3.5 |
| top-right | 2, 1, 5, 0 | 5 | 2 |
| bottom-left | 3, 1, 0, 2 | 3 | 1.5 |
| bottom-right | 1, 2, 4, 8 | 8 | 3.75 |

Max pooling: $\begin{bmatrix}6&5\\3&8\end{bmatrix}$; average pooling: $\begin{bmatrix}3.5&2\\1.5&3.75\end{bmatrix}$. Pooling gives a little **translation invariance** (a feature shifted by one pixel often lands in the same window).

<div class="fig" role="img" aria-label="Max and average pooling">
<svg viewBox="0 0 700 158" width="700" style="font-family:var(--font)" aria-hidden="true">
<text x="80" y="14" text-anchor="middle" style="fill:var(--fg);font-size:11px;font-weight:700">input 4 × 4</text>
<rect x="20" y="20" width="28" height="28" rx="3" style="fill:var(--green);stroke:var(--line-strong);stroke-width:1"/>
<text x="34" y="39" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:400">1</text>
<rect x="50" y="20" width="28" height="28" rx="3" style="fill:var(--green);stroke:var(--line-strong);stroke-width:1"/>
<text x="64" y="39" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:400">3</text>
<rect x="80" y="20" width="28" height="28" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1"/>
<text x="94" y="39" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:400">2</text>
<rect x="110" y="20" width="28" height="28" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1"/>
<text x="124" y="39" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:400">1</text>
<rect x="20" y="50" width="28" height="28" rx="3" style="fill:var(--green);stroke:var(--line-strong);stroke-width:1"/>
<text x="34" y="69" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:400">4</text>
<rect x="50" y="50" width="28" height="28" rx="3" style="fill:var(--green);stroke:var(--green-ink);stroke-width:2.4"/>
<text x="64" y="69" text-anchor="middle" style="fill:var(--green-ink);font-size:11px;font-weight:700">6</text>
<rect x="80" y="50" width="28" height="28" rx="3" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:2.4"/>
<text x="94" y="69" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">5</text>
<rect x="110" y="50" width="28" height="28" rx="3" style="fill:var(--blue);stroke:var(--line-strong);stroke-width:1"/>
<text x="124" y="69" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:400">0</text>
<rect x="20" y="80" width="28" height="28" rx="3" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:2.4"/>
<text x="34" y="99" text-anchor="middle" style="fill:var(--yellow-ink);font-size:11px;font-weight:700">3</text>
<rect x="50" y="80" width="28" height="28" rx="3" style="fill:var(--yellow);stroke:var(--line-strong);stroke-width:1"/>
<text x="64" y="99" text-anchor="middle" style="fill:var(--yellow-ink);font-size:11px;font-weight:400">1</text>
<rect x="80" y="80" width="28" height="28" rx="3" style="fill:var(--red);stroke:var(--line-strong);stroke-width:1"/>
<text x="94" y="99" text-anchor="middle" style="fill:var(--red-ink);font-size:11px;font-weight:400">1</text>
<rect x="110" y="80" width="28" height="28" rx="3" style="fill:var(--red);stroke:var(--line-strong);stroke-width:1"/>
<text x="124" y="99" text-anchor="middle" style="fill:var(--red-ink);font-size:11px;font-weight:400">2</text>
<rect x="20" y="110" width="28" height="28" rx="3" style="fill:var(--yellow);stroke:var(--line-strong);stroke-width:1"/>
<text x="34" y="129" text-anchor="middle" style="fill:var(--yellow-ink);font-size:11px;font-weight:400">0</text>
<rect x="50" y="110" width="28" height="28" rx="3" style="fill:var(--yellow);stroke:var(--line-strong);stroke-width:1"/>
<text x="64" y="129" text-anchor="middle" style="fill:var(--yellow-ink);font-size:11px;font-weight:400">2</text>
<rect x="80" y="110" width="28" height="28" rx="3" style="fill:var(--red);stroke:var(--line-strong);stroke-width:1"/>
<text x="94" y="129" text-anchor="middle" style="fill:var(--red-ink);font-size:11px;font-weight:400">4</text>
<rect x="110" y="110" width="28" height="28" rx="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:2.4"/>
<text x="124" y="129" text-anchor="middle" style="fill:var(--red-ink);font-size:11px;font-weight:700">8</text>
<rect x="18" y="18" width="62" height="62" rx="5" style="fill:none;stroke:var(--fg);stroke-width:2.2"><animate attributeName="x" dur="8s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3;0.5;0.8" values="18;78;18;78"/><animate attributeName="y" dur="8s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.3;0.5;0.8" values="18;18;78;78"/></rect>
<line x1="150" y1="74" x2="191.8" y2="74" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="196,74 190,76.9 190,71.1" style="fill:var(--line-strong)"/>
<text x="248" y="14" text-anchor="middle" style="fill:var(--fg);font-size:11px;font-weight:700">max pooling</text>
<rect x="206" y="28" width="42" height="42" rx="5" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="227" y="53" text-anchor="middle" style="fill:var(--green-ink);font-size:12px;font-weight:700">6</text>
<rect x="250" y="28" width="42" height="42" rx="5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="271" y="53" text-anchor="middle" style="fill:var(--blue-ink);font-size:12px;font-weight:700">5</text>
<rect x="206" y="72" width="42" height="42" rx="5" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.5"/>
<text x="227" y="97" text-anchor="middle" style="fill:var(--yellow-ink);font-size:12px;font-weight:700">3</text>
<rect x="250" y="72" width="42" height="42" rx="5" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="271" y="97" text-anchor="middle" style="fill:var(--red-ink);font-size:12px;font-weight:700">8</text>
<text x="388" y="14" text-anchor="middle" style="fill:var(--fg);font-size:11px;font-weight:700">average pooling</text>
<rect x="346" y="28" width="42" height="42" rx="5" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="367" y="53" text-anchor="middle" style="fill:var(--green-ink);font-size:12px;font-weight:700">3.5</text>
<rect x="390" y="28" width="42" height="42" rx="5" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="411" y="53" text-anchor="middle" style="fill:var(--blue-ink);font-size:12px;font-weight:700">2</text>
<rect x="346" y="72" width="42" height="42" rx="5" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.5"/>
<text x="367" y="97" text-anchor="middle" style="fill:var(--yellow-ink);font-size:12px;font-weight:700">1.5</text>
<rect x="390" y="72" width="42" height="42" rx="5" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="411" y="97" text-anchor="middle" style="fill:var(--red-ink);font-size:12px;font-weight:700">3.75</text>
<text x="480" y="52" text-anchor="start" style="fill:var(--fg);font-size:11.5px;font-weight:700">no parameters</text>
<text x="480" y="70" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">2 × 2 window, stride 2, per depth slice</text>
<text x="480" y="94" text-anchor="start" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">size: ⌊(W₁ − F)/S⌋ + 1</text>
<text x="480" y="108" text-anchor="start" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">15 → ⌊(15 − 2)/2⌋ + 1 = 7</text>
<text x="480" y="132" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">a feature shifted by one pixel often</text>
<text x="480" y="145" text-anchor="start" style="fill:var(--muted);font-size:10.5px;font-weight:400">lands in the same window</text>
</svg>
<p class="fig-cap">The pooling example: each 2 × 2 window of the input (outlined square cycles through them) gives one number. Bold cells are the maxima.</p>
</div>

### 8.10.2 [Exam] End-term: total parameters of a small CNN

Input $32\times32\times3$ → Conv1 (16 filters $3\times3$, $S=1$, $P=0$) → MaxPool $2\times2$/2 → Conv2 (32 filters $3\times3$, $S=1$, $P=0$) → MaxPool $2\times2$/2 → FC 64 → output 10.

| Layer | Output shape | Parameters |
|---|---|---|
| Conv1 | $30\times30\times16$ | $16(3\cdot3\cdot3+1)=448$ |
| MaxPool | $15\times15\times16$ | 0 |
| Conv2 | $13\times13\times32$ | $32(3\cdot3\cdot16+1)=4640$ |
| MaxPool | $\lfloor13/2\rfloor=6$: $6\times6\times32=1152$ | 0 |
| FC | 64 | $64(1152+1)=73{,}792$ |
| Output | 10 | $10(64+1)=650$ |
| **Total** | | **79,530** |

**[!] Traps:** the conv2 filter depth is 16 (the previous layer's depth), not 3; the pool after a 13-wide map floors to 6; the FC layer holds 93% of all parameters.

---

## 8.11 Backpropagation through a convolution

### 8.11.1 Rule

A convolution is a fully connected layer with most weights forced to 0 and the rest **shared**. A shared weight's gradient is the **sum** of its contributions at every position where it was used:
$$\frac{\partial\mathcal L}{\partial w_{ab}}=\sum_{i,j}\frac{\partial\mathcal L}{\partial o_{ij}}\cdot\underbrace{f'(z_{ij})}_{\text{activation}}\cdot\underbrace{I_{i+a,\,j+b}}_{\text{input under }w_{ab}}.$$
A weight gets **zero** gradient if it only ever sits on zero inputs, or only on positions where ReLU is off.

### 8.11.2 [Exam] Quiz 2, solved

$I=\begin{bmatrix}0&0&0\\0&0&0\\1&1&1\end{bmatrix}$, filter $\begin{bmatrix}w_1&w_2\\w_3&w_4\end{bmatrix}$, $S=1$, $P=0$, ReLU after, no bias.

| Line | Calculation | Result |
|---|---|---|
| 1 | $z_{11}=z_{12}=$ (top two rows are all 0) | 0 |
| 2 | $z_{21}=z_{22}=w_1\cdot0+w_2\cdot0+w_3\cdot1+w_4\cdot1$ | $w_3+w_4>0$ |
| 3 | inputs under $w_1,w_2$ at every position | always 0 ⇒ gradient **0** |
| 4 | inputs under $w_3,w_4$ in the bottom row of outputs | 1 ⇒ can be non-zero |
| 5 | non-zero gradient possible for | **$w_3,\ w_4$** |
| 6 | $\frac{\partial\mathcal L}{\partial w_3}=\sum_{ij}\frac{\partial\mathcal L}{\partial o_{ij}}f'(z_{ij})I_{\cdot}$ with all $\frac{\partial\mathcal L}{\partial o_{ij}}=1$ | $0+0+1\cdot1\cdot1+1\cdot1\cdot1=$ **2** |

### 8.11.3 [Ex] A variant with ReLU switching some positions off

$I=\begin{bmatrix}1&0&2\\0&0&0\\3&1&0\end{bmatrix}$, $K=\begin{bmatrix}1&-1\\1&1\end{bmatrix}$, ReLU, all $\partial\mathcal L/\partial o_{ij}=1$.

| Line | Calculation | Result |
|---|---|---|
| 1 | $z=\begin{bmatrix}1&-2\\4&1\end{bmatrix}$ | top-right position is off (ReLU' = 0) |
| 2 | sum the input patches of the three active positions: $\begin{bmatrix}1&0\\0&0\end{bmatrix}+\begin{bmatrix}0&0\\3&1\end{bmatrix}+\begin{bmatrix}0&0\\1&0\end{bmatrix}$ | $\nabla K=\begin{bmatrix}1&0\\4&1\end{bmatrix}$ |

---

## 8.12 The architectures: LeNet, AlexNet, ZF-Net, VGGNet, GoogLeNet, ResNet

ImageNet (ILSVRC) top-5 error, as on the classic chart: AlexNet 16.4% (2012) → ZF-Net 11.7% (2013) → VGG 7.3% and GoogLeNet 6.7% (2014) → ResNet 3.6% (2015).

<div class="fig" role="img" aria-label="Architectures compared">
<svg viewBox="0 0 700 192" width="700" style="font-family:var(--font)" aria-hidden="true">
<line x1="46" y1="160" x2="308" y2="160" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="123.9" x2="308" y2="123.9" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="87.8" x2="308" y2="87.8" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="51.7" x2="308" y2="51.7" style="stroke:var(--line);stroke-width:1;stroke-linecap:round"/>
<line x1="46" y1="30" x2="46" y2="160" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<line x1="46" y1="160" x2="308" y2="160" style="stroke:var(--line-strong);stroke-width:1.5;stroke-linecap:round"/>
<text x="40" y="163.5" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">0</text>
<text x="40" y="127.4" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">5</text>
<text x="40" y="91.3" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">10</text>
<text x="40" y="55.2" text-anchor="end" style="fill:var(--muted);font-size:10px;font-weight:400">15</text>
<text x="12" y="95" text-anchor="middle" transform="rotate(-90 12 95)" style="fill:var(--muted);font-size:10.5px;font-weight:400">top-5 error (%)</text>
<text x="177" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">ImageNet top-5 error</text>
<rect x="55.4" y="41.6" width="33.5" height="118.4" rx="3" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="72.2" y="37.6" text-anchor="middle" style="fill:var(--blue-ink);font-size:10px;font-weight:700">16.4</text>
<text x="72.2" y="173" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:400">AlexNet</text>
<text x="72.2" y="185" text-anchor="middle" style="fill:var(--muted);font-size:9.5px;font-weight:400">2012</text>
<rect x="107.8" y="75.5" width="33.5" height="84.5" rx="3" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="124.6" y="71.5" text-anchor="middle" style="fill:var(--blue-ink);font-size:10px;font-weight:700">11.7</text>
<text x="124.6" y="173" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:400">ZF-Net</text>
<text x="124.6" y="185" text-anchor="middle" style="fill:var(--muted);font-size:9.5px;font-weight:400">2013</text>
<rect x="160.2" y="107.3" width="33.5" height="52.7" rx="3" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="177" y="103.3" text-anchor="middle" style="fill:var(--blue-ink);font-size:10px;font-weight:700">7.3</text>
<text x="177" y="173" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:400">VGG</text>
<text x="177" y="185" text-anchor="middle" style="fill:var(--muted);font-size:9.5px;font-weight:400">2014</text>
<rect x="212.6" y="111.6" width="33.5" height="48.4" rx="3" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="229.4" y="107.6" text-anchor="middle" style="fill:var(--blue-ink);font-size:10px;font-weight:700">6.7</text>
<text x="229.4" y="173" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:400">GoogLeNet</text>
<text x="229.4" y="185" text-anchor="middle" style="fill:var(--muted);font-size:9.5px;font-weight:400">2014</text>
<rect x="265" y="134" width="33.5" height="26" rx="3" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="281.8" y="130" text-anchor="middle" style="fill:var(--green-ink);font-size:10px;font-weight:700">3.6</text>
<text x="281.8" y="173" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:400">ResNet</text>
<text x="281.8" y="185" text-anchor="middle" style="fill:var(--muted);font-size:9.5px;font-weight:400">2015</text>
<line x1="46" y1="123.2" x2="308" y2="123.2" style="stroke:var(--red-ink);stroke-width:1.4;stroke-linecap:round;stroke-dasharray:5 3"/>
<text x="313" y="122.2" text-anchor="start" style="fill:var(--red-ink);font-size:10px;font-weight:700">human</text>
<text x="313" y="134.2" text-anchor="start" style="fill:var(--red-ink);font-size:10px;font-weight:700">≈ 5.1%</text>
<text x="565" y="16" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">parameters (millions, log scale)</text>
<text x="472" y="45" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">LeNet-5</text>
<rect x="480" y="30" width="29.6" height="20" rx="4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="515.6" y="45" text-anchor="start" style="fill:var(--blue-ink);font-size:10.5px;font-weight:700">0.06</text>
<text x="472" y="73" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">GoogLeNet</text>
<rect x="480" y="58" width="105.6" height="20" rx="4" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="591.6" y="73" text-anchor="start" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">≈ 6</text>
<text x="472" y="101" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">AlexNet</text>
<rect x="480" y="86" width="144.1" height="20" rx="4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="630.1" y="101" text-anchor="start" style="fill:var(--blue-ink);font-size:10.5px;font-weight:700">≈ 62</text>
<text x="472" y="129" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">ResNet-152</text>
<rect x="480" y="114" width="143.6" height="20" rx="4" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="629.6" y="129" text-anchor="start" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">≈ 60</text>
<text x="472" y="157" text-anchor="end" style="fill:var(--fg-2);font-size:10.5px;font-weight:400">VGG-16</text>
<rect x="480" y="142" width="157.3" height="20" rx="4" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="643.3" y="157" text-anchor="start" style="fill:var(--blue-ink);font-size:10.5px;font-weight:700">≈ 138</text>
</svg>
<p class="fig-cap">Left: ImageNet error fell every year from AlexNet to ResNet, which beat the commonly quoted human figure. Right: more depth did not mean more parameters; GoogLeNet and ResNet are far leaner than VGG.</p>
</div>

### 8.12.1 LeNet-5 (handwritten digits)

| Layer | Output | Parameters |
|---|---|---|
| input | $32\times32\times1$ | |
| C1: 6 filters $5\times5$ | $28\times28\times6$ | $6(25+1)=156$ |
| S2: pool $2\times2$/2 | $14\times14\times6$ | 0 |
| C3: 16 filters $5\times5\times6$ | $10\times10\times16$ | $16(150+1)=2416$ |
| S4: pool $2\times2$/2 | $5\times5\times16=400$ | 0 |
| F5: 120 | 120 | $120(401)=48{,}120$ |
| F6: 84 | 84 | $84(121)=10{,}164$ |
| output: 10 | 10 | $10(85)=850$ |
| total | | ≈ 61.7 K (≈ 60 K in the original, which connected C3 to only some S2 maps) |

The template every later CNN follows: **conv → pool → conv → pool → fully connected**.

### 8.12.2 AlexNet (2012)

| Layer | Output | Parameters |
|---|---|---|
| input | $227\times227\times3$ | |
| conv1: 96 @ $11\times11$, $S=4$ | $\frac{227-11}{4}+1=55$: $55\times55\times96$ | $96(363+1)=34{,}944$ |
| max pool $3\times3$, $S=2$ | $27\times27\times96$ | 0 |
| conv2: 256 @ $5\times5$, $P=2$ | $27\times27\times256$ | 614,656 |
| max pool $3\times3$/2 | $13\times13\times256$ | 0 |
| conv3: 384 @ $3\times3$, $P=1$ | $13\times13\times384$ | 885,120 |
| conv4: 384 @ $3\times3$, $P=1$ | $13\times13\times384$ | 1,327,488 |
| conv5: 256 @ $3\times3$, $P=1$ | $13\times13\times256$ | 884,992 |
| max pool $3\times3$/2 | $6\times6\times256=9216$ | 0 |
| FC6, FC7: 4096 each | 4096 | 37,752,832 and 16,781,312 |
| FC8: 1000 | 1000 | 4,097,000 |
| total | | ≈ 62.4 M (conv ≈ 3.7 M, FC ≈ 58.6 M) |

(Counted without the original two-GPU split, which halved some conv layers' connections; the method is what is tested.)

**What made it work:** ReLU instead of tanh, dropout in the FC layers, heavy data augmentation, overlapping max pooling, training on GPUs (plus local response normalisation, since dropped from practice).

### 8.12.3 ZF-Net (2013)

Same skeleton as AlexNet, tuned by **visualising** what each layer learned: first layer $7\times7$ filters with stride 2 (instead of $11\times11$, stride 4) to keep more fine detail, and more filters in conv3–conv5 (512, 1024, 512).

### 8.12.4 VGGNet (2014)

Only $3\times3$ convolutions (stride 1, padding 1) and $2\times2$ max pools (stride 2); 16 or 19 weight layers; about **138 M** parameters, most in the first FC layer ($7\cdot7\cdot512\cdot4096\approx102.8$ M).

**[Derivation] Why stack $3\times3$.** Two stacked $3\times3$ layers see a $5\times5$ patch; three see $7\times7$ (in general $n$ stacked $3\times3$ layers see $(2n+1)\times(2n+1)$). With $C$ channels in and out:

| Same receptive field | Weights | $C=64$ |
|---|---|---|
| one $5\times5$ | $25C^2$ | 102,400 |
| two $3\times3$ | $2\cdot9C^2=18C^2$ | 73,728 |
| one $7\times7$ | $49C^2$ | 200,704 |
| three $3\times3$ | $27C^2$ | 110,592 |

Fewer parameters **and** more non-linearities (a ReLU after each layer).

### 8.12.5 GoogLeNet (2014): the inception module

**Problem:** which filter size is best at each layer? **Answer:** use $1\times1$, $3\times3$, $5\times5$ convolutions and $3\times3$ max pooling **in parallel** and concatenate their outputs along depth.
**Problem 2:** that is very expensive. **Fix: $1\times1$ convolutions** to shrink the depth first.

**[Intuition] A $1\times1$ convolution** looks at one pixel at a time but across **all** $D_1$ channels: it is a small fully connected layer applied at every pixel, mapping depth $D_1\to K$ (with a ReLU). It changes depth without touching width or height.

**[Ex] The bottleneck saves 10×.** Input $28\times28\times192$, want $28\times28\times32$ from a $5\times5$ conv (same padding).

| Route | Multiplications | Parameters |
|---|---|---|
| direct $5\times5\times192$, 32 filters | $28\cdot28\cdot32\cdot(5\cdot5\cdot192)=120.4$ M | $32(4800+1)=153{,}632$ |
| $1\times1$ to 16 channels, then $5\times5$ to 32 | $28\cdot28\cdot16\cdot192=2.4$ M + $28\cdot28\cdot32\cdot(5\cdot5\cdot16)=10.0$ M $=12.4$ M | $3088+12{,}832=15{,}920$ |

Other ideas: **global average pooling** at the end ($7\times7\times1024\to1024$) instead of a huge FC layer (which would need $7\cdot7\cdot1024\cdot1000\approx50$ M weights); auxiliary classifiers in the middle to inject gradient; 22 layers with about 12× fewer parameters than AlexNet.

<div class="fig" role="img" aria-label="Inception module">
<svg viewBox="0 0 700 152" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="0" y="52" width="72" height="48" rx="8" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.5"/>
<text x="36" y="72.9" text-anchor="middle" style="fill:var(--fg-2);font-size:11px;font-weight:700">previous</text>
<text x="36" y="86.9" text-anchor="middle" style="fill:var(--fg-2);font-size:9.5px;font-weight:500">layer</text>
<line x1="72" y1="76" x2="106.1" y2="22.9" style="stroke:var(--line-strong);stroke-width:1.3;stroke-linecap:round"/>
<polygon points="108,20 107.3,25.5 103.3,22.9" style="fill:var(--line-strong)"/>
<line x1="72" y1="76" x2="104.9" y2="57.7" style="stroke:var(--line-strong);stroke-width:1.3;stroke-linecap:round"/>
<polygon points="108,56 104.8,60.5 102.5,56.3" style="fill:var(--line-strong)"/>
<line x1="72" y1="76" x2="104.8" y2="90.6" style="stroke:var(--line-strong);stroke-width:1.3;stroke-linecap:round"/>
<polygon points="108,92 102.5,92.2 104.4,87.8" style="fill:var(--line-strong)"/>
<line x1="72" y1="76" x2="106" y2="125.1" style="stroke:var(--line-strong);stroke-width:1.3;stroke-linecap:round"/>
<polygon points="108,128 103.2,125.3 107.1,122.5" style="fill:var(--line-strong)"/>
<rect x="110" y="6" width="230" height="28" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="225" y="23.9" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">1×1 conv</text>
<rect x="110" y="42" width="104" height="28" rx="8" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.5"/>
<text x="162" y="59.9" text-anchor="middle" style="fill:var(--yellow-ink);font-size:11px;font-weight:700">1×1 reduce</text>
<line x1="214" y1="56" x2="232.5" y2="56" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="236,56 231,58.4 231,53.6" style="fill:var(--line-strong)"/>
<rect x="236" y="42" width="104" height="28" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="288" y="59.9" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">3×3 conv</text>
<rect x="110" y="78" width="104" height="28" rx="8" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.5"/>
<text x="162" y="95.9" text-anchor="middle" style="fill:var(--yellow-ink);font-size:11px;font-weight:700">1×1 reduce</text>
<line x1="214" y1="92" x2="232.5" y2="92" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="236,92 231,94.4 231,89.6" style="fill:var(--line-strong)"/>
<rect x="236" y="78" width="104" height="28" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="288" y="95.9" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">5×5 conv</text>
<rect x="110" y="114" width="104" height="28" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="162" y="131.9" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">3×3 max pool</text>
<line x1="214" y1="128" x2="232.5" y2="128" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="236,128 231,130.4 231,125.6" style="fill:var(--line-strong)"/>
<rect x="236" y="114" width="104" height="28" rx="8" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.5"/>
<text x="288" y="131.9" text-anchor="middle" style="fill:var(--yellow-ink);font-size:11px;font-weight:700">1×1 conv</text>
<line x1="340" y1="20" x2="370.3" y2="73" style="stroke:var(--line-strong);stroke-width:1.3;stroke-linecap:round"/>
<polygon points="372,76 367.4,72.8 371.6,70.5" style="fill:var(--line-strong)"/>
<line x1="340" y1="56" x2="369" y2="74.1" style="stroke:var(--line-strong);stroke-width:1.3;stroke-linecap:round"/>
<polygon points="372,76 366.5,75.4 369,71.3" style="fill:var(--line-strong)"/>
<line x1="340" y1="92" x2="368.9" y2="77.6" style="stroke:var(--line-strong);stroke-width:1.3;stroke-linecap:round"/>
<polygon points="372,76 368.6,80.4 366.5,76.1" style="fill:var(--line-strong)"/>
<line x1="340" y1="128" x2="370.2" y2="79" style="stroke:var(--line-strong);stroke-width:1.3;stroke-linecap:round"/>
<polygon points="372,76 371.4,81.5 367.3,79" style="fill:var(--line-strong)"/>
<rect x="374" y="40" width="96" height="72" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="422" y="72.8" text-anchor="middle" style="fill:var(--green-ink);font-size:11.5px;font-weight:700">concatenate</text>
<text x="422" y="87.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">along depth</text>
<text x="600" y="14" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">multiplications, 5×5 to 32 maps</text>
<rect x="540" y="34" width="44" height="96" rx="3" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="562" y="29" text-anchor="middle" style="fill:var(--red-ink);font-size:10.5px;font-weight:700">120.4 M</text>
<text x="562" y="144" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">direct</text>
<rect x="630" y="120.1" width="44" height="9.9" rx="3" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="652" y="115.1" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">12.4 M</text>
<text x="652" y="144" text-anchor="middle" style="fill:var(--muted);font-size:10px;font-weight:400">1×1 bottleneck</text>
<text x="652" y="60" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">≈ 10× fewer</text>
</svg>
<p class="fig-cap">Four filter sizes run in parallel and are concatenated along depth. Yellow 1×1 convolutions shrink the depth first, cutting the cost of the 5×5 branch about tenfold.</p>
</div>

### 8.12.6 ResNet (2015): residual connections

**The puzzle.** A 56-layer plain CNN had **higher training error** than a 20-layer one. Not overfitting (that would show only in test error): the deeper net was simply harder to optimise. Yet a deeper net could in principle copy the shallow one and set its extra layers to the identity, so the problem is that layers find it hard to learn the identity.

**The fix.** Let a block learn only the **change** it makes:
$$\boxed{\mathbf y=F(\mathbf x)+\mathbf x}$$
If the identity is best, the block only needs $F(\mathbf x)=0$, which is easy (weights near 0).

**[Derivation] Gradients flow through the shortcut.** $\dfrac{\partial\mathbf y}{\partial\mathbf x}=\dfrac{\partial F}{\partial\mathbf x}+I$. Even if $\partial F/\partial\mathbf x$ is tiny, the identity term carries the gradient straight back, so stacking many blocks does not make it vanish (contrast with the product of factors $\le\frac14$ in Week 7).

<div class="fig" role="img" aria-label="Residual block">
<svg viewBox="0 0 700 124" width="700" style="font-family:var(--font)" aria-hidden="true">
<circle cx="26" cy="76" r="14" style="fill:var(--surface-2);stroke:var(--fg-2);stroke-width:1.8"/>
<text x="26" y="80" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">x</text>
<line x1="40" y1="76" x2="61.8" y2="76" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="66,76 60,78.9 60,73.1" style="fill:var(--line-strong)"/>
<rect x="68" y="54" width="126" height="44" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="131" y="79.9" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">conv · BN · ReLU</text>
<line x1="194" y1="76" x2="215.8" y2="76" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="220,76 214,78.9 214,73.1" style="fill:var(--line-strong)"/>
<rect x="222" y="54" width="90" height="44" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="267" y="79.9" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">conv · BN</text>
<line x1="312" y1="76" x2="329.8" y2="76" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="334,76 328,78.9 328,73.1" style="fill:var(--line-strong)"/>
<circle cx="350" cy="76" r="15" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:2"/>
<text x="350" y="81" text-anchor="middle" style="fill:var(--yellow-ink);font-size:18px;font-weight:700">+</text>
<line x1="365" y1="76" x2="387.8" y2="76" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="392,76 386,78.9 386,73.1" style="fill:var(--line-strong)"/>
<rect x="394" y="58" width="56" height="36" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="422" y="79.9" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">ReLU</text>
<line x1="450" y1="76" x2="469.8" y2="76" style="stroke:var(--line-strong);stroke-width:1.6;stroke-linecap:round"/>
<polygon points="474,76 468,78.9 468,73.1" style="fill:var(--line-strong)"/>
<circle cx="490" cy="76" r="14" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.8"/>
<text x="490" y="80" text-anchor="middle" style="fill:var(--green-ink);font-size:12px;font-weight:700">y</text>
<path d="M26,62 V28 H350 V59" fill="none" style="stroke:var(--green-ink);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round"/>
<polygon points="350,60 347.1,54 352.9,54" style="fill:var(--green-ink)"/>
<text x="188" y="22" text-anchor="middle" style="fill:var(--green-ink);font-size:10.5px;font-weight:700">identity shortcut</text>
<text x="190" y="114" text-anchor="middle" style="fill:var(--blue-ink);font-size:11px;font-weight:700">F(x)</text>
<circle r="4" style="fill:var(--green-ink)"><animateMotion dur="5s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.8;1" path="M26,62 V28 H350 V60"/></circle>
<rect x="530" y="10" width="164" height="46" rx="8" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.5"/>
<text x="612" y="29.7" text-anchor="middle" style="fill:var(--yellow-ink);font-size:12px;font-weight:700">y = F(x) + x</text>
<text x="612" y="44.7" text-anchor="middle" style="fill:var(--fg-2);font-size:10.5px;font-weight:500">∂y/∂x = ∂F/∂x + I</text>
<rect x="530" y="66" width="164" height="46" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="612" y="85.8" text-anchor="middle" style="fill:var(--green-ink);font-size:11.5px;font-weight:700">F(x) = 0 ⇒ identity</text>
<text x="612" y="100.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">easy to learn</text>
</svg>
<p class="fig-cap">The block only learns the change F(x). Even if ∂F/∂x is tiny, the identity term in ∂y/∂x carries the gradient straight back, so depth no longer makes it vanish.</p>
</div>

Other ingredients: batch norm after every conv, He initialization (Week 7), no dropout, global average pooling, **bottleneck blocks** ($1\times1$ reduce → $3\times3$ → $1\times1$ expand) in the deeper versions, 152 layers. ResNet-50's last convolutional block outputs a $7\times7\times2048$ feature map: 49 spatial locations, each a 2048-dimensional vector (used later in the course for attention over image regions).

### 8.12.7 Side by side

| Net | Year | Depth | Key idea | Params |
|---|---|---|---|---|
| LeNet-5 | 1998 | 7 | conv-pool-conv-pool-FC template | ≈ 60 K |
| AlexNet | 2012 | 8 | ReLU, dropout, augmentation, GPUs | ≈ 60 M |
| ZF-Net | 2013 | 8 | smaller first filter/stride, chosen by visualisation | ≈ AlexNet |
| VGG-16 | 2014 | 16 | only 3×3 convs, deep and uniform | ≈ 138 M |
| GoogLeNet | 2014 | 22 | inception, 1×1 bottlenecks, global avg pool | ≈ 5–7 M |
| ResNet | 2015 | 152 | residual (skip) connections | ≈ 60 M (ResNet-152) |

---

## 8.13 Week-8 exam toolkit & practice set

**Diagram — Week 8 at a glance**

<div class="fig" role="img" aria-label="Week 8 at a glance">
<svg viewBox="0 0 700 94" width="700" style="font-family:var(--font)" aria-hidden="true">
<rect x="0" y="4" width="164" height="82" rx="8" style="fill:var(--blue);stroke:var(--blue-ink);stroke-width:1.5"/>
<text x="82" y="27.3" text-anchor="middle" style="fill:var(--blue-ink);font-size:11.5px;font-weight:700">Word vectors</text>
<text x="82" y="41.8" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">PMI = log p(w,c)/p(w)p(c)</text>
<text x="82" y="56.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">PPMI = max(PMI, 0)</text>
<text x="82" y="70.8" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">SVD: W_word = UΣ</text>
<rect x="178.7" y="4" width="164" height="82" rx="8" style="fill:var(--green);stroke:var(--green-ink);stroke-width:1.5"/>
<text x="260.7" y="27.3" text-anchor="middle" style="fill:var(--green-ink);font-size:11.5px;font-weight:700">Prediction</text>
<text x="260.7" y="41.8" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">CBOW: ∂L/∂u = (ŷ − y)v</text>
<text x="260.7" y="56.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">neg. sampling, counts^¾</text>
<text x="260.7" y="70.8" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">hier. softmax: log₂|V|</text>
<rect x="357.3" y="4" width="164" height="82" rx="8" style="fill:var(--yellow);stroke:var(--yellow-ink);stroke-width:1.5"/>
<text x="439.3" y="27.3" text-anchor="middle" style="fill:var(--yellow-ink);font-size:11.5px;font-weight:700">Convolution</text>
<text x="439.3" y="41.8" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">size (W − F + 2P)/S + 1</text>
<text x="439.3" y="56.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">params K(F²D + 1)</text>
<text x="439.3" y="70.8" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">pooling: 0 parameters</text>
<rect x="536" y="4" width="164" height="82" rx="8" style="fill:var(--red);stroke:var(--red-ink);stroke-width:1.5"/>
<text x="618" y="27.3" text-anchor="middle" style="fill:var(--red-ink);font-size:11.5px;font-weight:700">Architectures</text>
<text x="618" y="41.8" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">VGG: stacked 3×3</text>
<text x="618" y="56.3" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">inception: 1×1 bottleneck</text>
<text x="618" y="70.8" text-anchor="middle" style="fill:var(--fg-2);font-size:10px;font-weight:500">ResNet: y = F(x) + x</text>
</svg>
<p class="fig-cap">Week 8 on one line.</p>
</div>

### 8.13.1 Recognition rules

| See | Think |
|---|---|
| one-hot similarity | cosine 0, distance $\sqrt2$ for every pair |
| counts $\mathrm{count}(w,c)$, $\mathrm{count}(w)$, $\mathrm{count}(c)$, $N$ | PMI formula; negative ⇒ PPMI 0 |
| "numbers stored for rank-$k$ SVD" | $k(m+n+1)$ |
| "which matrix gives word vectors" | $W_{\text{word}}=U\Sigma$ (rows), $W_{\text{context}}=V$ |
| CBOW/skip-gram softmax step | scores → softmax → $(\hat y-y)$ times the other vector |
| negative sampling loss | $-\log\sigma(\text{pos})-\sum\log\sigma(-\text{neg})$; only the positive term involves $\mathbf w$ if negatives are other words' vectors |
| "why $^{3/4}$" | boosts rare words as negatives |
| conv output size | $(W_1-F+2P)/S+1$, depth $=K$ |
| "same padding" | $P=(F-1)/2$ for $S=1$ |
| parameter count | $K(F\cdot F\cdot D_1+1)$; pooling 0; FC $=(\text{in}+1)\times\text{out}$ |
| which filter weights get gradient | the ones that ever sit on non-zero inputs at active (ReLU on) positions |
| $1\times1$ convolution | changes depth only; bottleneck |
| "two $3\times3$ vs one $5\times5$" | same receptive field, $18C^2$ vs $25C^2$ |
| deeper plain net has higher **training** error | degradation (optimisation), fixed by residual blocks |

### 8.13.2 Formula sheet

| Formula | Use |
|---|---|
| $\mathrm{PMI}=\log\frac{\mathrm{count}(w,c)N}{\mathrm{count}(w)\mathrm{count}(c)}$ | association |
| $\hat X=U_k\Sigma_kV_k^\top$, $W_{\text{word}}=U_k\Sigma_k$ | SVD word vectors |
| $\hat y_w=\mathrm{softmax}(\mathbf u_w^\top\mathbf v_c)$, $\partial\mathcal L/\partial\mathbf u_{w'}=(\hat y_{w'}-y_{w'})\mathbf v_c$ | CBOW |
| $\log\sigma(\mathbf u_c^\top\mathbf v_w)+\sum_r\log\sigma(-\mathbf u_r^\top\mathbf v_w)$ | negative sampling |
| $\mathbf v_i^\top\tilde{\mathbf v}_j+b_i+\tilde b_j\approx\log X_{ij}$ | GloVe |
| $W_2=\frac{W_1-F+2P}{S}+1$ | output size |
| $K(F^2D_1+1)$ | conv parameters |
| $\frac{\partial\mathcal L}{\partial w_{ab}}=\sum_{ij}\frac{\partial\mathcal L}{\partial o_{ij}}f'(z_{ij})I_{i+a,j+b}$ | conv backprop |
| $\mathbf y=F(\mathbf x)+\mathbf x$, $\frac{\partial\mathbf y}{\partial\mathbf x}=\frac{\partial F}{\partial\mathbf x}+I$ | residual block |

### 8.13.3 Practice set

1. $N=1000$, $\mathrm{count}(w)=20$, $\mathrm{count}(c)=50$, $\mathrm{count}(w,c)=5$. PMI (natural log) and PPMI?
2. A $5000\times4000$ PPMI matrix is truncated to rank 100. Numbers stored? Fraction of the original?
3. CBOW scores $(2,1,0)$ for three words; the true word is the first. Softmax and loss? Compare with §8.4.3.
4. Word counts $81,16,1$. Negative-sampling probabilities with the $\frac34$ power?
5. Hierarchical softmax with $|V|=10^6$: about how many sigmoid evaluations per prediction?
6. Input $64\times64\times3$, 16 filters $5\times5$, $S=1$, $P=0$. Output shape and parameters?
7. "Same" padding for $F=3$ and $F=5$ (stride 1)?
8. $2\times2$ max pooling with stride 2 on a $15\times15\times32$ map. Output shape and parameters?
9. A $1\times1$ convolution maps $56\times56\times256$ to depth 64. Output shape and parameters?
10. Input width 128, $F=8$, $P=0$, output width 31. Stride?
11. Two stacked $3\times3$ conv layers vs one $5\times5$, 128 channels in and out, no biases. Parameters of each?
12. 1-D: input $(1,0,2,3)$, filter $(w_1,w_2)$, stride 1, no activation, all $\partial\mathcal L/\partial o=1$. Find $\partial\mathcal L/\partial w_1$ and $\partial\mathcal L/\partial w_2$.
13. True/False: (a) Pooling layers have learnable parameters. (b) The output depth of a conv layer equals the input depth. (c) In a residual block, the gradient through the block is at least the identity term.
14. Creative: you must design a layer that turns a $28\times28\times480$ map into $28\times28\times64$ features with $5\times5$ context while keeping multiplications under 50 million. Show the plan and its cost.

### 8.13.4 Answers

1. $\ln\frac{5\times1000}{20\times50}=\ln5=1.609$; PPMI $1.609$.
2. $100(5000+4000+1)=900{,}100$, which is $4.5\%$ of $20{,}000{,}000$.
3. Same as §8.4.3: $(0.665,0.245,0.090)$, loss $0.408$. Softmax is unchanged when every score shifts by the same constant.
4. $81^{3/4}=27$, $16^{3/4}=8$, $1^{3/4}=1$; shares $27/36=0.75$, $8/36=0.222$, $1/36=0.028$ (raw: $0.827,0.163,0.010$).
5. $\log_2 10^6\approx20$.
6. $60\times60\times16$; $16(75+1)=1216$.
7. $P=1$ and $P=2$.
8. $\lfloor(15-2)/2\rfloor+1=7$: $7\times7\times32$; 0 parameters.
9. $56\times56\times64$; $64(256+1)=16{,}448$.
10. $(128-8)/S+1=31\Rightarrow S=4$.
11. $2\times9\times128^2=294{,}912$ vs $25\times128^2=409{,}600$.
12. $\partial\mathcal L/\partial w_1=1+0+2=3$; $\partial\mathcal L/\partial w_2=0+2+3=5$.
13. (a) False. (b) False (equals the number of filters). (c) True ($\partial F/\partial\mathbf x+I$).
14. $1\times1$ conv to 16 channels: $28\cdot28\cdot16\cdot480=6.0$ M; then $5\times5$ conv to 64 with same padding: $28\cdot28\cdot64\cdot(25\cdot16)=20.1$ M; total ≈ 26.1 M (direct would be $28\cdot28\cdot64\cdot25\cdot480=602$ M).

### 8.13.5 Worked solutions, line by line

**Q6.**

| Line | Calculation | Result |
|---|---|---|
| 1 | $W_2=\frac{64-5+0}{1}+1$ | 60 |
| 2 | depth $=K$ | 16 |
| 3 | weights per filter $5\cdot5\cdot3$ | 75 |
| 4 | parameters $16\times(75+1)$ | 1216 |

**Q12.**

| Output | uses | $w_1$ sits on | $w_2$ sits on |
|---|---|---|---|
| $o_1=w_1x_1+w_2x_2$ | $(1,0)$ | 1 | 0 |
| $o_2=w_1x_2+w_2x_3$ | $(0,2)$ | 0 | 2 |
| $o_3=w_1x_3+w_2x_4$ | $(2,3)$ | 2 | 3 |
| **sum** (all $\partial\mathcal L/\partial o=1$) | | **3** | **5** |

**Q14.**

| Line | Calculation | Result |
|---|---|---|
| 1 | direct: $28\cdot28\cdot64\cdot(5\cdot5\cdot480)$ | 602 M: too many |
| 2 | $1\times1$ reduce to 16: $28\cdot28\cdot16\cdot480$ | 6.0 M |
| 3 | $5\times5$ on 16 channels, 64 filters: $28\cdot28\cdot64\cdot400$ | 20.1 M |
| 4 | total | ≈ 26.1 M ✓ under 50 M |

---
