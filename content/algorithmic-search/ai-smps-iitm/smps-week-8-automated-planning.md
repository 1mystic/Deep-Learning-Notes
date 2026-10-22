---
title: Week 8 (Automated Planning: Lecture Notes)
summary: Condensed lecture notes: STRIPS and PDDL, blocks world, forward and backward planning, goal stack, Sussman anomaly, plan space planning, Graphplan.
tags: [ai, smps, search]
color: blue
order: 8.5
course: "BSCS3003 AI: Search Methods for Problem Solving (IIT Madras BS) — Prof. Deepak Khemani"
covers: "STRIPS domains, PDDL, blocks world, forward and backward state space planning, goal stack planning, Sussman anomaly, plan space (partial order) planning, multi-arm robots, Graphplan, means-ends analysis"
---

# Week 8 — Automated Planning

**Course:** BSCS3003 AI: Search Methods for Problem Solving · **Week 8** · STRIPS · Blocks world · FSSP · BSSP · Goal Stack Planning · Plan space planning · Graphplan

> **The one question of this week.** State space search treated moves as black boxes produced by MoveGen. Planning opens the box: every action says **what it needs** (preconditions) and **what it changes** (effects). _How can an agent use that structure to find a sequence of actions that achieves its goals — forwards, backwards, goal by goal, in plan space, or with a planning graph?_

**Contents**

1. Planning in one page — the STRIPS world
2. The blocks world domain
3. Forward State Space Planning (FSSP)
4. Backward State Space Planning (BSSP)
5. Goal Stack Planning (GSP)
6. The Sussman anomaly
7. Plan space planning (partial order planning)
8. Multi-arm robots and makespan
9. Algorithm Graphplan
10. Means-ends analysis (related idea)
11. One problem, every planner — outcome comparison
12. Complexity — results and derivations
13. Merits and demerits
14. Exam traps and speed tricks
15. Difficult solved examples (exam pattern)
16. One-page revision sheet

---

## 1. Planning in one page — the STRIPS world

An agent **perceives** its world, **deliberates** (finds a plan) and **acts** (executes it), monitoring as it goes. Planning is the deliberation step, with an **action-centric** view: a solution is a **sequence of actions**.

**STRIPS domains** (STanford Research Institute Planning System) are the simplest:

| Assumption | Meaning |
|---|---|
| finite, static, fully observable | finite states and actions; nothing changes unless the agent acts; the agent knows the full state |
| single agent | no other agents, no extraneous events |
| deterministic, instantaneous actions | no failures, no notion of time |
| goals are hard constraints on the final state | every goal proposition must hold at the end |

Formally a **state-transition system (S, A, γ)**: S finite states, A finite actions, **γ : S × A → S** a partial function — γ(s, a) is defined only if a is applicable in s.

**PDDL** (Planning Domain Description Language) — a standard input language. A problem specifies **objects**, **predicates**, the **initial state**, the **goal** and the **actions/operators**. STRIPS needs only PDDL 1.0.

**Operator** = name(arguments) + **pre(O)** (preconditions) + **effects⁺(O)** (ADD list) + **effects⁻(O)** (DELETE list). An **action** is a ground instance of an operator (all arguments are actual objects).

---

## 2. The blocks world domain

Predicates: **on(X, Y)**, **onTable(X)**, **clear(X)**, **holding(X)**, **AE** (arm empty). One one-armed robot, an arbitrarily large table, at most one block directly on another.

Operators (course convention — note that **holding a block does not delete clear(X)**, so clear(X) only means "nothing is on X"):

| Action | Preconditions (in this order) | ADD (effects⁺) | DELETE (effects⁻) |
|---|---|---|---|
| pickup(X) | onTable(X), clear(X), AE | holding(X) | onTable(X), AE |
| putdown(X) | holding(X) | onTable(X), AE | holding(X) |
| unstack(X, Y) | on(X, Y), clear(X), AE | holding(X), clear(Y) | on(X, Y), AE |
| stack(X, Y) | holding(X), clear(Y) | on(X, Y), AE | holding(X), clear(Y) |

(In the multi-arm version in Section 8, pickup and unstack also delete clear(X), and putdown and stack add it back. Some textbooks use that convention even for one arm — always use the operator table given in the question.)

**Running example — the Sussman anomaly.** Start: C on A; A and B on the table. Goal: on(A, B) ∧ on(B, C) (a tower A on B on C).

```text
  Start              Goal
                      A
  C                   B
  A   B               C
 -------            -------
```

S0 = { on(C,A), onTable(A), onTable(B), clear(C), clear(B), AE }.

---

## 3. Forward State Space Planning (FSSP)

### 3.1 Definitions

- **Applicable:** a is applicable in S iff **pre(a) ⊆ S**.
- **Progression:** **S′ = γ(S, a) = (S ∪ effects⁺(a)) \ effects⁻(a)**.
- **Plan** π = ⟨a1, …, an⟩ is applicable in S0 if each ai is applicable in the state produced by the previous ones; the final state is γ(S0, π).
- **Valid plan:** **G ⊆ γ(S0, π)**. Plans are built as π ← π ∘ a (append at the end).

### 3.2 Simple solved example

In S0 of the Sussman problem, the applicable actions are only **unstack(C, A)** and **pickup(B)** (pickup(A) fails: A is not clear; nothing can be stacked: the arm is empty).

Progression through unstack(C, A): S1 = S0 ∪ {holding(C), clear(A)} \ {on(C,A), AE} = { onTable(A), onTable(B), clear(C), clear(B), clear(A), holding(C) }.

Breadth-first FSSP (verified) finds the optimal 6-step plan:

**unstack(C,A) → putdown(C) → pickup(B) → stack(B,C) → pickup(A) → stack(A,B)**,

after generating 41 successor states (22 distinct states). So **FSSP can solve the Sussman anomaly** — and optimally, if it searches breadth-first.

### 3.3 Properties

- **Sound**: every state reached is a real state, so any plan found is valid.
- **High branching factor**: the state is fully described and many actions are applicable, most irrelevant to the goal.

---

## 4. Backward State Space Planning (BSSP)

### 4.1 Definitions

- **Relevant:** a is relevant to goal set G iff it **achieves some goal and destroys none**: **effects⁺(a) ∩ G ≠ ∅ and effects⁻(a) ∩ G = ∅**.
- **Regression:** **G′ = γ⁻¹(G, a) = (G \ effects⁺(a)) ∪ pre(a)** — what must be true before a so that G holds after it.
- Plans are built as π ← a ∘ π (prepend). Stop when **G0 ⊆ S0**.
- Then **check validity by progression**: regression is **not sound** — a regressed goal set may not describe any real state.

### 4.2 Simple solved example (Sussman goal)

G = { on(A,B), on(B,C) }. Relevant actions: only **stack(A,B)** and **stack(B,C)** (low branching factor).

- Regress through stack(A,B): G1 = { on(B,C), holding(A), clear(B) }.
- stack(B,C) is still relevant to G1 (adds on(B,C), deletes holding(B), clear(C) — neither is in G1). Regress: G2 = { holding(A), clear(B), holding(B), clear(C) } — **impossible**: a one-armed robot cannot hold A and B together. BSSP happily produced a subgoal that no real state satisfies — this is why it is "not sound" and needs the validity check.

| | FSSP | BSSP |
|---|---|---|
| Starts at | start state S0 | goal description G |
| Moves | applicable: pre(a) ⊆ S | relevant: eff⁺ ∩ G ≠ ∅, eff⁻ ∩ G = ∅ |
| Transition | progression (S ∪ eff⁺) \ eff⁻ | regression (G \ eff⁺) ∪ pre |
| Plan built | π ∘ a | a ∘ π |
| Goal test | G ⊆ γ(S0, π) | γ⁻¹(G, π) ⊆ S0, then validity check |
| Soundness | sound | not sound |
| Branching | high | low (goals are small) |

---

## 5. Goal Stack Planning (GSP)

### 5.1 Idea in simple words

GSP mixes both directions: it **reasons backwards** from goals (like BSSP) but **keeps the real current state** and executes actions **forwards** (like FSSP). It breaks a compound goal into individual goals and solves them **one at a time** (a **linear** planner), using a stack.

**PushSet(G):** push the compound goal G itself, then each individual goal of G. The compound goal stays underneath so that, after the parts are solved, GSP can **check that they all still hold together**.

Tie conventions used in papers: goal lists and precondition lists are read left to right and **pushed one by one, so the last element ends up on top** (it is solved first).

### 5.2 Algorithm

```text
GSP(givenState, givenGoal, actions)
 1  S ← givenState ;  plan ← ( ) ;  stack ← empty
 2  PushSet(givenGoal, stack)
 3  while stack is not empty
 4      x ← Pop(stack)
 5      if x is an action a
 6          plan ← plan ∘ a ;  S ← Progress(S, a)         -- a is applicable here
 7      else if x is a compound goal G and G is not true in S
 8          PushSet(G, stack)                              -- some part was undone: redo
 9      else if x is a single goal g and g ∉ S
10          CHOOSE a relevant action a that achieves g     -- none → FAILURE
11          Push(a, stack) ;  PushSet(pre(a), stack)
12  return plan
```

CHOOSE used below (the natural choice in the current state): on(X,Y) → stack(X,Y); onTable(X) → putdown(X); clear(X) → unstack(Z,X) for the Z on X; holding(X) → pickup(X) if X is on the table, else unstack(X,Y); AE → putdown(the held block).

### 5.3 Simple solved example

Start: A on B; B and C on the table; arm empty. Goal: [on(B, C)].

| # | Popped | Result | Plan so far |
|---|---|---|---|
| 1 | on(B,C) | false → push stack(B,C), PushSet[holding(B), clear(C)] | |
| 2 | clear(C) | true | |
| 3 | holding(B) | false → B on table → push pickup(B), PushSet[onTable(B), clear(B), AE] | |
| 4 | AE | true | |
| 5 | clear(B) | false (A on B) → push unstack(A,B), PushSet[on(A,B), clear(A), AE] | |
| 6–9 | AE, clear(A), on(A,B), {on(A,B), clear(A), AE} | all true | |
| 10 | unstack(A,B) | **execute** | unstack(A,B) |
| 11 | onTable(B) | true | |
| 12 | {onTable(B), clear(B), AE} | **false — AE was destroyed by unstack** → re-push the set | |
| 13 | AE | false → holding A → push putdown(A), PushSet[holding(A)] | |
| 14–15 | holding(A), {holding(A)} | true | |
| 16 | putdown(A) | **execute** | + putdown(A) |
| 17–19 | clear(B), onTable(B), {onTable(B), clear(B), AE} | true | |
| 20 | pickup(B) | **execute** | + pickup(B) |
| 21 | {holding(B), clear(C)} | true | |
| 22 | stack(B,C) | **execute** | + stack(B,C) |
| 23 | {on(B,C)} | true → stack empty | |

Plan: **unstack(A,B) → putdown(A) → pickup(B) → stack(B,C)** (4 actions, optimal). Step 12 shows why compound goals are pushed: solving clear(B) had quietly destroyed AE.

---

## 6. The Sussman anomaly

### 6.1 GSP on the anomaly

Goal list [on(B,C), on(A,B)] → **on(A,B) is on top and solved first** (verified trace, 57 stack operations):

1. Solve on(A,B): unstack(C,A), putdown(C), pickup(A), stack(A,B).
2. Solve on(B,C): needs holding(B) → pickup(B) needs clear(B) → **unstack(A,B)** (undoing goal 1), putdown(A), pickup(B), stack(B,C).
3. Compound {on(B,C), on(A,B)} is **false** → re-push → solve on(A,B) again: pickup(A), stack(A,B).

Plan (10 actions): unstack(C,A), putdown(C), pickup(A), stack(A,B), unstack(A,B), putdown(A), pickup(B), stack(B,C), pickup(A), stack(A,B).

With the other order [on(A,B), on(B,C)] GSP solves on(B,C) first and finds a **14-action** plan. The optimal plan has **6** actions.

### 6.2 What the anomaly shows

- The two goals are **non-serializable**: whichever is solved first, solving the second **undoes** the first. **No ordering of the goals gives the optimal plan** with a linear (one-goal-at-a-time) planner.
- GSP **does find a plan** (the compound-goal check makes it redo undone goals), but not an optimal one.
- Each unit goal may be solved **more than once**, and the same action may appear **more than once** in the plan (stack(A,B) above).
- Remedies: plan space planning (Section 7) or Graphplan (Section 9), which do not commit to solving goals one after another.

---

## 7. Plan space planning (partial order planning)

### 7.1 Search in the space of plans

Nodes are **partial plans**; moves **refine** a plan. A partial plan is a 4-tuple **π = ⟨A, O, L, B⟩**:

| Part | Content |
|---|---|
| A | actions in the plan (possibly partly instantiated, e.g. stack(A, ?X)) |
| O | ordering constraints Ai ≺ Aj (a partial order — a directed graph) |
| L | **causal links** (Ai, P, Aj): Ai produces P, Aj consumes P |
| B | binding constraints: ?X = ?Y, ?X ≠ B, ?X = A, … |

Start with **π0 = ⟨{A0, A∞}, {A0 ≺ A∞}, {}, {}⟩**: A0 has no preconditions and the start state as its effects; A∞ has the goals as preconditions and no effects.

### 7.2 Flaws and how they are removed

- **Open goal:** a precondition of some action not supported by a causal link. Fix by linking from an **existing action** that produces it (add the link and the ordering) or by **inserting a new action** that produces it.
- **Threat:** an action At that can delete P could fall **between** Ai and Aj of the link (Ai, P, Aj). It materialises only if (1) At has an effect ¬Q with Q unifiable with P, (2) At comes after Ai, (3) At comes before Aj. Remove any one condition:

| Resolution | Added constraint |
|---|---|
| **Separation** | a binding so that P and Q cannot unify (into B) |
| **Promotion** | At ≺ Ai — threat happens before the producer |
| **Demotion** | Aj ≺ At — threat happens after the consumer |

A **solution** is a partial plan with **no flaws**; any linearisation consistent with O is a valid plan.

### 7.3 Solved example — Sussman in plan space

1. Open goals of A∞: on(A,B), on(B,C) → insert **stack(A,B)** and **stack(B,C)** with causal links to A∞.
2. Their open preconditions: holding(A) ← insert **pickup(A)**; holding(B) ← insert **pickup(B)**; clear(B), clear(C) ← A0; pickup(A) needs clear(A) ← insert **unstack(C,A)**; AE for the pickups ← A0 / **putdown(C)** (insert); onTable(A), onTable(B) ← A0.
3. **Threat 1:** stack(A,B) deletes clear(B), which pickup(B) consumes (link A0 —clear(B)→ pickup(B)). Resolve by **demotion**: **pickup(B) ≺ stack(A,B)**.
4. **Threat 2:** stack(B,C) deletes clear(C), which unstack(C,A) consumes (link A0 —clear(C)→ unstack(C,A)). **Demotion**: **unstack(C,A) ≺ stack(B,C)**.
5. With one arm, every pickup/unstack deletes AE, so each "hold" action threatens the AE links of the others; promotions/demotions resolving these impose a total order on the arm actions.

Linearisation: **unstack(C,A), putdown(C), pickup(B), stack(B,C), pickup(A), stack(A,B)** — the optimal 6 steps. Plan space planning handles the interaction because it never commits to "finish goal 1 before goal 2".

---

## 8. Multi-arm robots and makespan

With several arms, actions take an arm parameter: pickup(N, X), putdown(N, X), unstack(N, X, Y), stack(N, X, Y), holding(N, X), AE(N). Now **pickup and unstack must delete clear(X)** (otherwise two arms could grab the same block), and putdown/stack add clear(X) back.

- Independent actions by different arms can happen **in the same time step**.
- **Makespan** = number of time steps of a parallel plan (not the number of actions).
- Constraints that remain sequential: two arms cannot pick up (or unstack) the same block at once; two arms cannot stack onto the same block at once; a tower can only grow (or shrink) one block per step at its top.

---

## 9. Algorithm Graphplan

### 9.1 The planning graph

A layered graph **P0, A1, P1, A2, P2, …**:

- **P0** = the start state (no mutexes).
- **Ai** = every action whose preconditions are all in P(i−1) and **pairwise non-mutex** there, plus a **no-op** for every proposition (no-op(p): pre p, add p) — so everything **persists**.
- **Pi** = P(i−1) ∪ all positive effects of Ai. Negative effects do not remove anything (no-ops keep it), so layers **grow monotonically**.

### 9.2 Mutex relations

**Two actions in Ai are mutex if:**

| Rule | Condition |
|---|---|
| Inconsistent effects | one adds p, the other deletes p |
| Interference | one deletes a precondition of the other |
| Competing needs | some precondition of a is mutex (in P(i−1)) with some precondition of b |
| (both consume p) | both have p as precondition and both delete it — a special case of interference |

**Two propositions in Pi are mutex** if **every** pair of actions achieving them (one for each) is mutex.

Monotone property: once two propositions (or actions) are non-mutex, they stay non-mutex in all later layers (because of no-ops).

### 9.3 Extending and searching

- **Extend** the graph one layer at a time until **all goal propositions appear in the newest layer and no two of them are mutex**.
- Then **search backwards** (depth first) from the goals: choose for each goal an achieving action in that layer so the chosen actions are pairwise non-mutex; their preconditions form the subgoal set of the previous layer; recurse to P0. If some choice fails, backtrack; if everything fails, **extend by one more layer** and try again.
- **Success:** reaching P0 gives a plan of **shortest makespan** (fewest layers); actions in the same layer may run in parallel.
- **No plan exists** when the graph has **levelled off** — two consecutive layers with the same propositions and the same mutexes — and the goals are still not all present and non-mutex (and, in the full algorithm, the backward search keeps failing with no new failure sets at the levelled-off layer).

### 9.4 Simple solved example (two blocks)

Start: A on B, B on table, A clear, arm empty. Goal: on(B, A). S0 = { on(A,B), onTable(B), clear(A), AE }.

**A1:** only **unstack(A,B)** (+ no-ops). Mutexes in A1: unstack(A,B) with no-op(AE) and with no-op(on(A,B)) — **inconsistent effects** (it deletes what they keep).

**P1** = { AE, clear(A), clear(B), holding(A), on(A,B), onTable(B) } — new: clear(B), holding(A).
Proposition mutexes in P1: (AE, clear(B)), (AE, holding(A)), (clear(B), on(A,B)), (holding(A), on(A,B)) — each pair can only be produced by mutex actions.

**A2:** putdown(A), stack(A,B), unstack(A,B) (+ no-ops). Examples of mutex reasons: putdown(A) vs stack(A,B) — **interference** (each deletes holding(A), the other's precondition); putdown(A) vs no-op(AE) — **competing needs** (holding(A) and AE are mutex in P1).
**P2** adds onTable(A). **A3** adds pickup(A) and pickup(B) → **P3** adds holding(B). **A4** adds putdown(B) and stack(B,A) → **P4** contains on(B,A) — the goal appears at P4 (non-mutex trivially, single goal).

Backward search from P4 succeeds: **unstack(A,B) | putdown(A) | pickup(B) | stack(B,A)** — makespan 4 (one action per layer: with one arm every pair of real actions in a layer is mutex through AE).

### 9.5 Graphplan on the Sussman anomaly (verified)

Layers: A1 has 2 real actions (pickup(B), unstack(C,A)); on(B,C) first appears in P2; on(A,B) first appears in P4; but the two goals are mutex at P4 and P5; at P6 extraction succeeds:

**unstack(C,A) | putdown(C) | pickup(B) | stack(B,C) | pickup(A) | stack(A,B)** — makespan 6, optimal. So **Graphplan can solve the Sussman anomaly**.

---

## 10. Means-ends analysis (related idea)

Newell and Simon's **General Problem Solver (GPS)**: compare the current state with the desired one, list the **differences**, rank them by importance, consult an **operator-difference table** to find an operator (the **means**) that reduces the most important difference (the **end**), and recurse on that operator's preconditions. It is goal-directed like BSSP but works on differences rather than whole goal sets.

---

## 11. One problem, every planner — outcome comparison

Sussman anomaly (all results verified by running the algorithms).

| Planner | Plan length / makespan | Optimal? | Remark |
|---|---|---|---|
| FSSP (breadth first) | 6 | yes | 41 states generated |
| BSSP | — | — | produces impossible subgoals (holding two blocks) unless checked |
| GSP, goal list [on(B,C), on(A,B)] | 10 | no | undoes on(A,B) once |
| GSP, goal list [on(A,B), on(B,C)] | 14 | no | undoes goals twice |
| Plan space (POP) | 6 | yes | threats resolved by demotion |
| Graphplan | makespan 6 (6 layers) | yes (shortest makespan) | goals mutex at P4, P5 |

---

## 12. Complexity — results and derivations

- **FSSP / BSSP** are state space searches: with branching factor b and plan length d, BFS is O(b^d) time and space; DFS O(b·d) space without optimality.
- **Blocks world state count** grows faster than exponentially in the number of blocks (every arrangement into towers): exhaustive search is hopeless for large n, hence goal-directed and graph-based planners.
- **GSP**: linear in the number of goal pushes for serialisable goals; can loop or produce long plans for interacting goals.
- **Graphplan**: the planning graph has **polynomial size** — each layer has at most the number of ground propositions (and actions), and the graph levels off after a bounded number of layers. The backward extraction is the exponential part (in the worst case), but mutexes prune it heavily.

---

## 13. Merits and demerits

| Planner | Merits | Demerits |
|---|---|---|
| FSSP | sound; simple; optimal with BFS | huge branching factor |
| BSSP | small branching factor, goal-directed | not sound — needs a validity check |
| GSP | simple, goal-directed, keeps the real state | linear; non-serialisable goals → long plans; goal order matters |
| Plan space (POP) | least commitment; handles interacting goals; partial order allows parallelism | bookkeeping of links, threats and bindings |
| Graphplan | polynomial graph; shortest makespan; detects unsolvability by levelling off | extraction can be expensive; works on ground actions |

---

## 14. Exam traps and speed tricks

1. **Use the operator table given.** In the course convention, pickup/unstack do **not** delete clear(X); in the multi-arm version they do.
2. **Applicable** = pre ⊆ S. **Relevant** = adds a goal **and deletes none**. Read the "and deletes none" part.
3. **Progression** (S ∪ eff⁺) \ eff⁻; **regression** (G \ eff⁺) ∪ pre — apply the set operations in that order.
4. FSSP is sound; BSSP is not (regressed goal sets may be impossible states).
5. GSP stack order: the **last** element of a list is **on top** and is solved **first**. Always re-check compound goals; when false, push the set again.
6. A popped **action** in GSP is always applicable (its compound precondition was just verified).
7. Sussman anomaly: FSSP **yes** (optimally with BFS), GSP **yes but not optimally**, POP **yes**, Graphplan **yes**.
8. GSP may solve a unit goal **more than once** and repeat actions in the final plan.
9. Threat resolution: **promotion** = threat before producer; **demotion** = threat after consumer; **separation** = bindings.
10. Graphplan action mutex: inconsistent effects, interference, competing needs. Proposition mutex: **all** achiever pairs mutex.
11. Graphplan stops with failure when the graph **levels off** without the goals present and non-mutex; it returns a plan when backward search reaches P0 — and that plan has the **shortest makespan**.
12. One arm → every two real actions in a layer are mutex (they all touch AE) → makespan = number of actions.

---

## 15. Difficult solved examples (exam pattern)

### P1 — GSP on the Sussman anomaly: properties (Quiz pattern)

Questions: (a) Can GSP (lecture version) solve the Sussman anomaly? (b) Which statements are true: (i) it solves every unit goal exactly once, (ii) it never repeats an action in the final plan, (iii) it builds the plan in a linear fashion without backtracking.

- (a) **Yes** — it returns a valid plan (10 or 14 actions, depending on goal order), though not the optimal 6.
- (i) **False** — on(A,B) is solved twice (Section 6.1).
- (ii) **False** — pickup(A) and stack(A,B) each appear twice.
- (iii) The lecture GSP has no backtracking step: actions are appended to a single linear plan and the compound-goal check simply re-pushes undone goals. Its only choice point is CHOOSE; if that choice is wrong it does not backtrack (it can fail). So (iii) describes the algorithm as given.

### P2 — FSSP versus BSSP on the Sussman start state

- Applicable actions in S0: **unstack(C,A), pickup(B)** — 2.
- Relevant actions for G = {on(A,B), on(B,C)}: **stack(A,B), stack(B,C)** — 2.
- After regressing through stack(A,B): G1 = {on(B,C), holding(A), clear(B)}. Actions relevant to G1: pickup(A), unstack(A,B), unstack(A,C), stack(B,C), unstack(C,B). Regressing G1 through stack(B,C) gives {holding(A), holding(B), clear(B), clear(C)} — an impossible state (two blocks held with one arm).

### P3 — GSP: which propositions trigger which push? (End-term pattern)

Use the trace of Section 5.3.

- When clear(B) is popped (step 5) it is false. The propositions of the current state that make CHOOSE push **unstack(A,B)** are **clear(A), on(A,B)**: on(A,B) says A is the block sitting on B, and A is clear, so unstack(A,B) is the relevant action.
- After unstack(A,B) is executed, the compound {onTable(B), clear(B), AE} fails because AE is false; the proposition that makes CHOOSE push **putdown(A)** is **holding(A)**.

This is exactly the reasoning behind paper answers such as "clear(D),on(D,C)" and "holding(A)": name the facts in the **current state** that select the action, in alphabetical order.

### P4 — Graphplan layer questions (End-term pattern)

For the two-block example (Section 9.4):

- Actions applicable in A2: **putdown(A), stack(A,B), unstack(A,B)** (unstack(A,B) persists because its preconditions persist through no-ops).
- New propositions in P2: **onTable(A)**.
- Mutex pairs in P1: **(AE, clear(B)), (AE, holding(A)), (clear(B), on(A,B)), (holding(A), on(A,B))**.
- Why is putdown(A) mutex with no-op(AE) in A2? **Competing needs** — their preconditions holding(A) and AE are mutex in P1.

### P5 — Graphplan on the Sussman anomaly

Can Graphplan solve it? **Yes.** Goals first appear together at P4 but are mutex at P4 and P5; the plan is extracted at P6 with makespan 6: unstack(C,A) | putdown(C) | pickup(B) | stack(B,C) | pickup(A) | stack(A,B).

### P6 — Short answers on Graphplan (≤ 64 words each)

_When does Graphplan return a valid plan?_ When the newest proposition layer contains all goals with no goal pair mutex, and the backward depth-first search finds, layer by layer, sets of pairwise non-mutex actions whose preconditions regress to the start layer P0. The extracted layered plan is valid and has the shortest makespan.

_When does Graphplan report that no plan exists?_ When the planning graph levels off — two consecutive layers have identical propositions and identical mutex pairs — and the goals still are not all present without mutexes (or the backward search keeps failing with no new failure information at the levelled-off layer). No new actions or propositions can ever appear, so no plan exists.

### P7 — Plan space: name the resolution

Link (pickup(B), holding(B), stack(B,C)) and an action putdown(B) that deletes holding(B). Adding **putdown(B) ≺ pickup(B)** is **promotion**; adding **stack(B,C) ≺ putdown(B)** is **demotion**; if the threat were putdown(?X), adding **?X ≠ B** would be **separation**.

### P8 — Multi-arm makespan (End-term recall)

Paper item: a multi-arm blocks world with 2^(2^k) blocks and 2^k arms (another paper: 2^(k²) blocks and k² arms), an arbitrary valid start state, and the goal of one tower on the table. Answer key: worst-case makespan **2^((2^k)+1)** (respectively **2^((k²)+1)**), i.e. **2 × (number of blocks)**.

Reading the key: every block needs one "take" step (pickup/unstack) and one "place" step (putdown/stack), giving about 2 steps per block, and the arms (only logarithmically many compared with the blocks) do not reduce the worst case below that order. Remember the pattern **makespan = 2 × blocks = 2^(exponent + 1)**.

### P9 — Concept MSQ set (mark all true)

1. _A relevant action for G_ — produces at least one goal ✓; deletes no goal ✓; must be applicable in the start state ✗.
2. _Regression_ — G′ = (G \ eff⁺) ∪ pre ✓; is always sound ✗.
3. _In Graphplan_ — layers grow monotonically ✓; no-ops have one precondition and one effect ✓; two non-mutex propositions can become mutex later ✗.
4. _Sussman anomaly_ — has non-serialisable subgoals ✓; cannot be solved by any planner ✗; is solved optimally by plan space planning ✓.

---

## 16. One-page revision sheet

**STRIPS operator.** name + pre + eff⁺ (ADD) + eff⁻ (DELETE). Blocks world: pickup(X) [onTable, clear, AE → +holding, −onTable, −AE]; putdown(X) [holding → +onTable, +AE, −holding]; unstack(X,Y) [on, clear(X), AE → +holding, +clear(Y), −on, −AE]; stack(X,Y) [holding, clear(Y) → +on, +AE, −holding, −clear(Y)].


**FSSP.** applicable pre ⊆ S; progression (S ∪ eff⁺) \ eff⁻; sound; high branching.

**BSSP.** relevant eff⁺ ∩ G ≠ ∅ and eff⁻ ∩ G = ∅; regression (G \ eff⁺) ∪ pre; not sound; low branching.

**GSP.** PushSet = compound goal then parts (last part on top); false goal → push action + PushSet(pre); popped action → execute; false compound → re-push.

**Sussman.** non-serialisable goals; GSP 10/14 actions vs optimal 6; FSSP, POP and Graphplan give 6.

**POP.** ⟨A, O, L, B⟩; flaws = open goals + threats; promotion / demotion / separation.

**Graphplan.** layers P0 A1 P1 …; mutex: inconsistent effects, interference, competing needs; propositions mutex if all achiever pairs mutex; extend until goals non-mutex, then DFS backwards; level-off ⇒ no plan; result = shortest makespan.

**Bridge to Week 9.** Planning breaks goals into subgoals; Week 9 makes that explicit with AND-OR graphs and algorithm AO\* (problem decomposition).
