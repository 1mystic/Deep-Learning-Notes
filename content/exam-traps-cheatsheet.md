---
title: Exam traps cheat-sheet
summary: The slips that cost marks in Week 1 problems, each with the correct statement next to it.
tags: [deep-learning, quiz-1, revision]
color: red
order: 4
---

# Exam traps cheat-sheet

> [!CAUTION]
> Read the question for the **number of inputs** before you reach for a formula.

## Counting

**[!]** The number of Boolean functions of $n$ inputs is $2^{2^n}$, not $2^n$ and not $n^2$.

| Inputs $n$ | Wrong answer | Right answer |
|:---:|:---:|:---:|
| 2 | 4 | 16 |
| 3 | 8 | 256 |

## Thresholds

**[!]** An MP neuron fires when the sum is **greater than or equal to** $\theta$. Off-by-one on the inequality flips AND and OR.

**[!]** In the perceptron, bias $b = -\theta$. Moving the threshold across the inequality changes its sign.

## Geometry

- **[!]** The weight vector $\mathbf{w}$ is *perpendicular* to the decision boundary, not parallel to it.
- **[!]** XOR is not separable by *one* line, but two perceptrons in a layer solve it.
- **[?]** What is the smallest network that computes XOR?

## Learning

**[Exam]** PLA update: $\mathbf{w} \leftarrow \mathbf{w} + y\,\mathbf{x}$ **only on a mistake**.

```python
if y * (w @ x) <= 0:
    w = w + y * x
```
