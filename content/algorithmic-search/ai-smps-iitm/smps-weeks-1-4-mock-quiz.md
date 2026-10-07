---
title: Weeks 1-4 Mock Quiz + Toy-Problem Reference
summary: Fresh practice problems plus a toy-problem reference for weeks 1-4.
tags: [ai, smps, search, revision]
color: red
order: 13
---

# AI: Search Methods for Problem Solving — Weeks 1-4 Mock Quiz 1 (fresh problems) + Toy-Problem Reference
*Modelled on the Term-2 2026 Quiz 1 and Quiz 2 papers: case-based comprehension blocks, NO-SPACES answer formats, MSQs with several correct options, NIL answers. Every answer was computed in code with the course's conventions (goal test on pop, RemoveSeen against OPEN and CLOSED, alphabetical order, Hill Climbing moves only on strict improvement).*

> **Where this file fits.** Timed practice + reference: the [Guidebook](smps-weeks-1-4-guidebook.md) teaches the material fast, the [Workbook](smps-weeks-1-4-workbook.md) drills it deep, and this file tests it. Learn the algorithms in [Week 0](smps-week-0-prep-guide.md) and [Week 1](smps-week-1.md)–[Week 4](smps-week-4.md) first.

---

## 1 · Syllabus: Weeks 1-4 (quick reference)
★ = the instructor's "understand down to the last detail" zone (Weeks 2–3).

| Wk | Topic | What you must be able to do |
|---|---|---|
| 1 | What is AI; agents; history | Agent properties; Dartmouth 1956; Deep Blue, Watson, AlphaGo |
| 1 | Philosophy | Turing Test, Chinese Room, Winograd Schema, ELIZA, Physical Symbol System |
| 1 | Problem types | Planning (path is the answer) vs Configuration (state is the answer) |
| 2 ★ | State space formulation | State representation, MoveGen, GoalTest; counting reachable states; invariants |
| 2 ★ | Graph properties | Reachability, reversibility, directedness, degree, connectivity, tours |
| 2 ★ | Simple Search 1/2, DFS, BFS | OPEN/CLOSED, RemoveSeen, node pairs, ReconstructPath, traces |
| 2 ★ | DB-DFS, DFID (-N, -C) | Iterations, shortest-path guarantee, total cost |
| 2 ★ | Complexity | Node counts (best/worst), time & space, b/(b−1) ratio, goal-test timing |
| 3 ★ | Heuristic functions | Designing h, min vs max, monotonic vs non-monotonic, ties |
| 3 ★ | Best-First Search, Hill Climbing | Traces, NIL outcomes, local optima, plateaus, ridges |
| 3 ★ | Solution-space search | SAT (CNF, clauses, h = satisfied clauses), TSP as optimisation |
| 3 ★ | TSP construction | Nearest Neighbour, Greedy edge, Savings (formula, base city) |
| 3 ★ | TSP perturbation | 2-city exchange, 2-edge / 3-edge exchange, neighbourhood sizes |
| 3 ★ | Escaping local optima | Beam, VND, Best-Neighbour, Tabu (tenure, aspiration), Iterated HC, Random Walk |
| 3/4 | Stochastic local search | Simulated Annealing (sigmoid, T limits) |
| 4 | Genetic Algorithms | Roulette, crossover, mutation, premature convergence |
| 4 | GA for TSP | Path / adjacency / ordinal representations; CX, PMX, OX |
| 4 | Emergent systems, ACO | Game of Life; pheromone probability and update |

---

## 2 · Toy-Problem Reference (the classic worlds, explained once)

Every search problem is defined by: **State** (snapshot), **MoveGen** (legal moves), **GoalTest** (done?). Below, "size" means how many states or candidates exist, which tells you why blind search fails.

### 2.1 Travelling Salesman Problem (TSP)
A salesman visits **every city exactly once** and returns home, minimising total distance. A closed route is a **tour** (a Hamiltonian cycle).
- **Type:** configuration / optimisation. You search over complete tours, not paths from a start state.
- **Size:** (n−1)!/2 distinct tours for n cities (symmetric distances). 5 → 12, 10 → 181 440, 20 → ≈6×10¹⁶.
- **Representations:** path (A,C,B,E,D), adjacency (slot X holds the city after X), ordinal (positions in a shrinking list).
- **Construction heuristics:** Nearest Neighbour, Greedy edge, Savings.
- **Perturbation:** 2-city exchange, 2-edge exchange (2-opt: reverse a segment), 3-edge exchange.
- **Euclidean TSP:** cities are points in a plane, so every triple obeys the triangle inequality. One violation ⇒ non-Euclidean.
- **When does no tour exist?** If some city has degree < 2 in the road graph; if the degree-2 cities' forced edges close a small loop (see the knight board below); if the graph is bipartite with an odd number of cities.

### 2.2 N-Queens
Place N queens on an N×N board so none attack each other (same row, column or diagonal).
- **Type:** configuration.
- **Formulations and sizes (N = 8):** any 8 squares: C(64,8) = 4 426 165 368. One queen per row: 8⁸ = 16 777 216. One per row and column (a permutation): 8! = 40 320. Solutions: 92 (4-Queens: 2; 5-Queens: 10).
- **Search:** DFS placing row by row, backtracking when no safe column exists. Also solvable by local search (h = number of attacking pairs, minimise).

### 2.3 8-Puzzle
Slide tiles into a 3×3 frame with one blank.
- **State:** the arrangement. **Moves:** blank up/down/left/right (2–4 moves).
- **Size:** 9! = 362 880 arrangements, but only **9!/2 = 181 440** reachable from any given start (a parity invariant splits the space into two halves).
- **Heuristics:** misplaced tiles (h₁), Manhattan distance (h₂ ≥ h₁).

### 2.4 Water Jug
Jugs of fixed capacity; fill, empty, or pour one into another until the source is empty or the target full.
- **State:** (amount in each jug).
- **Invariants:** with pouring only, total water is conserved. With a tap and drain, every reachable state has at least one jug empty or full.
- **Trick:** only amounts that are combinations of the capacities appear (e.g. gcd rule: with 6 and 4 you can never measure an odd amount).

### 2.5 Missionaries & Cannibals
3 missionaries and 3 cannibals cross a river in a 2-seat boat; cannibals may never outnumber missionaries on a bank that has missionaries.
- **State:** (M on left, C on left, boat side). 16 legal reachable states, **11 crossings** minimum.

### 2.6 Man–Goat–Lion–Cabbage (river crossing)
Man with a goat, a lion and a cabbage; the boat carries the man plus one item. Goat can't be left alone with lion or cabbage.
- **State:** bank of each of the 4. 2⁴ = 16 raw, **10 legal**, all 10 reachable, **7 crossings** minimum.

### 2.7 Towers of Hanoi
Move n discs between 3 pegs, never placing a larger disc on a smaller one.
- **Size:** 3ⁿ states. Minimum moves 2ⁿ − 1. The 3 "all on one peg" states have 2 neighbours; all others 3.

### 2.8 SAT (Boolean Satisfiability)
Find true/false values for n variables making a formula true. Course formulas are in **CNF**: AND of clauses, each clause an OR of literals.
- **Size:** 2ⁿ candidates. 2-SAT is polynomial; 3-SAT is NP-complete.
- **Local search:** neighbourhood = flip 1 bit (n neighbours); heuristic = number of satisfied clauses (maximise).

### 2.9 Map Colouring
Colour regions so neighbours differ. Configuration problem; each move colours one more region, or a CSP.

### 2.10 Knight's Tour
A chess knight visits every square exactly once (open tour) and, for a closed tour, returns to the start. A closed knight's tour is a TSP tour on the knight-move graph.

### 2.11 Toggle puzzles (Lights Out, square-touch, lantern rings)
Pressing a button toggles a fixed set of lights. Order of presses doesn't matter, and pressing twice cancels. So a pattern is determined by **which set** of buttons is pressed. That gives at most 2^(buttons) reachable patterns, fewer when different press-sets give the same pattern (see Case A).

---

## 3 · MOCK QUIZ 1 — Question Paper
**Conventions for the whole paper.** A node is *inspected* when it is picked from OPEN; GoalTest is called; if it fails, MoveGen is called and the neighbours are placed in OPEN according to the algorithm. RemoveSeen drops neighbours already in OPEN or CLOSED. Use alphabetical (or stated) order for MoveGen and ties. Answers: comma-separated, **NO SPACES**; enter **NIL** if no path is found.

### SECTION 1 — AI BASICS (Week 1)

**Q1 [MSQ].** Which properties does the course use to characterise an intelligent agent?
(a) Persistent (b) Autonomous (c) Proactive (d) Goal-directed (e) Must have a physical body

**Q2 [MCQ].** "Priya poured water from the bottle into the cup until **it** was *full*." Replacing *full* by which word turns this into a valid Winograd Schema pair (the referent of "it" flips)?
(a) cold (b) empty (c) clean (d) heavy

**Q3 [MSQ].** Which are **configuration** problems?
(a) 8-Queens (b) Water Jug (c) Sudoku (d) TSP (e) Towers of Hanoi

---

### SECTION 2 — STATE SPACE SEARCH

#### CASE A — The Lantern Ring
Six lanterns L1…L6 stand in a circle (L6 is next to L1). Pressing a lantern **toggles it and its two neighbours** (on ↔ off). All lanterns start **off**. Write a state as a 6-bit string in the order L1…L6 (1 = on). MoveGen presses L1, L2, …, L6 in that order.

**Q4 [SA].** Design a state representation. Enter it as succinctly as possible.
**Q5 [SA, integer].** The number of unique states reachable from the all-off state is ____.
**Q6 [SA].** MoveGen(000000) is ____. (comma-separated bit strings)
**Q7 [SA, integer].** The minimum number of presses to switch **all six** lanterns on is ____.
**Q8 [MSQ].** What is true about this state space?
(a) Every move is reversible.
(b) Every state has exactly 6 neighbours.
(c) Some 6-bit patterns can never be reached from all-off.
(d) The order in which lanterns are pressed changes the final pattern.
(e) A shortest solution never presses the same lantern twice.
**Q9 [MCQ].** With **five** lanterns in the ring (same rule), how many states are reachable from all-off?
(a) 8 (b) 16 (c) 32 (d) 31

#### CASE B — The Frog Pond
Twelve lily pads are numbered 0–11 clockwise around a pond. A frog may only jump **clockwise**, either **3 pads or 5 pads**. MoveGen(p) = [p+3, p+5] (mod 12), in that order. The frog starts on pad 0.

**Q10 [SA, integer].** Number of pads reachable from pad 0: ____.
**Q11 [SA].** List the pads inspected by BFS searching for pad 1, in order, until termination.
**Q12 [SA].** Path found by BFS to pad 1: ____. Path found by DFS to pad 1: ____.
**Q13 [MSQ].** What is true about the frog's state space?
(a) Every move is reversible by a single move.
(b) Every pad has a path to every other pad.
(c) The state space graph is directed.
(d) Every state has exactly two successors.
**Q14 [MCQ].** Can the frog visit every pad exactly once and return to pad 0 (a TSP tour of the pads)?
(a) Yes (b) No (c) Cannot be determined
**Q15 [SA, integer].** If the allowed jumps were 3 or 6 instead, how many pads would be reachable from 0?

#### CASE C — Two Jugs with a Tap
A 7-litre and a 4-litre jug; state (x, y). Operations in MoveGen order: fill 7, fill 4, empty 7, empty 4, pour 7→4, pour 4→7. Operations that don't change the state are dropped. Start (0,0).

**Q16 [SA, integer].** Number of unique reachable states: ____.
**Q17 [SA].** MoveGen((3,4)) = ____. (format: (7,4),(0,4),...)
**Q18 [SA, integer].** Minimum number of operations to have exactly 2 litres in either jug: ____.
**Q19 [MSQ].** Which hold for **every** reachable state?
(a) At least one jug is either empty or full. (b) x + y is even. (c) x + y ≤ 11. (d) x ≠ y.

#### CASE D — Queens
**Q20 [SA].** 4-Queens by DFS: one queen per row (top to bottom), columns tried 1→4, only safe placements are generated, backtrack on dead ends. Enter the first solution as the column of the queen in rows 1–4.
**Q21 [SA, integer].** In Q20, how many search nodes (partial placements, counting the empty board and the final solution) are visited up to the first solution?
**Q22 [SA, integer].** For 8-Queens, size of the search space if each row gets exactly one queen and no two queens share a column: ____.

---

### SECTION 3 — SEARCH (the knight board)

#### CASE E — A knight on a 3×4 board
```
  A  B  C  D
  E  F  G  H
  I  J  K  L
```
Each square is a unit square. A chess knight moves 2 squares in one direction and 1 square perpendicular (an "L"). Distance d(X,Y) = Euclidean distance between square centres (e.g. d(A,B) = 1, d(A,F) = √2). MoveGen returns knight moves in alphabetical order. **Start A, goal F. Heuristic h(n) = d(n, F).** Alphabetical order breaks ties.

**Q23 [SA].** MoveGen(K) = ____.
**Q24 [SA, 1 decimal].** d(A, L) = ____.
**Q25 [MSQ].** What is true about this state space?
(a) Every state has at most 3 neighbours.
(b) Every state has at least 2 neighbours.
(c) Every state has a path to every other state.
(d) Exactly 4 states have 3 neighbours.
(e) Some state cannot be reached from A.
**Q26 [MCQ].** Can the knight complete a closed tour visiting all 12 squares (a TSP tour)? (a) Yes (b) No (c) Cannot be determined
**Q27 [SA].** First 4 squares inspected by DFS. **Q28 [SA].** Path found by DFS.
**Q29 [SA].** First 4 squares inspected by BFS. **Q30 [SA].** Path found by BFS.
**Q31 [SA].** First 4 squares inspected by Best-First Search. **Q32 [SA].** Path found by Best-First Search.
**Q33 [SA].** Path found by Hill Climbing.
**Q34 [SA, integer].** DFID (each iteration is a fresh depth-bounded DFS with its own OPEN, CLOSED and RemoveSeen; bounds 0,1,2,…). The depth bound at which the path is found is ____, and the total number of inspections over all iterations is ____.
**Q35 [MCQ].** Beam Search with width 2 (keep the best 2 of all children of the current beam; stop when the best new node is not better than the best so far). It terminates at: (a) F (b) G (c) J (d) A
**Q36 [MSQ].** The heuristic for this board ____. (a) defines a maximisation problem (b) defines a minimisation problem (c) is monotonic (d) is non-monotonic

---

### SECTION 4 — COMPLEXITY

**Q37 [SA, integer].** A uniform tree has branching factor 3; the only goal is at depth 4 (root = depth 0). Worst-case number of nodes inspected by BFS: ____.
**Q38 [SA, integer].** Same tree, worst case: total nodes inspected by DFID over all iterations: ____.
**Q39 [SA, integer].** Same tree, BFS worst case, but GoalTest is applied **when a node is generated** instead of when it is popped. How many nodes are expanded (MoveGen called)?
**Q40 [MCQ].** The time overhead of DFID over BFS for large depth is roughly (a) b (b) b/(b−1) (c) d (d) 2^d, which for b = 3 is ____.

---

### SECTION 5 — SAT (the hackathon team)
Five students may join a hackathon team: Arjun (a), Bela (b), Chitra (c), Dev (d), Esha (e); 1 = joins. Constraints:
1. Arjun or Bela must join. 2. Bela and Esha refuse to work together. 3. If Arjun joins, Esha must join. 4. Bela or Dev must join. 5. If Bela joins, Esha must join. 6. Bela and Chitra refuse to work together. 7. Dev or Chitra must join. 8. Chitra or Bela must join.

A candidate is a 5-bit string abcde. h = number of satisfied clauses (maximise). Neighbourhood = flip one bit; ties go to the earlier variable (a before b …).

**Q41 [MSQ].** Which clauses correctly encode constraints 2, 3 and 5 (in that order)?
(a) (¬b∨¬e), (¬a∨e), (e∨¬b) (b) (b∨e), (a∨¬e), (¬e∨b) (c) ¬(b∧e), (¬a∨e), (¬b∨e) (d) (¬b∧¬e), (a→e), (b∨e)
**Q42 [SA, integer].** h(00000) = ____.
**Q43 [SA].** Hill Climbing from 00000 terminates at state ____ with h = ____.
**Q44 [MCQ].** From the Hill Climbing end state, would VND succeed by switching to the **2-bit-flip** neighbourhood? (a) Yes (b) No
**Q45 [SA].** Tabu Search from 00000 with tenure 2 (a flipped bit may not be flipped in the next 2 moves; always take the best allowed neighbour, even if it is not better). Number of moves to reach a satisfying assignment, and that assignment: ____.
**Q46 [MCQ].** Which variable is forced by two clauses alone, before any search? (a) a = 1 (b) b = 0 (c) c = 1 (d) e = 1

---

### SECTION 6 — TSP (the drone depots)
A drone must visit depots A–E once and return. Flight distances:

|   | A | B | C | D | E |
|---|---|---|---|---|---|
| A | – | 7 | 7 | 4 | 15 |
| B | 7 | – | 8 | 8 | 9 |
| C | 7 | 8 | – | 15 | 10 |
| D | 4 | 8 | 15 | – | 8 |
| E | 15 | 9 | 10 | 8 | – |

**Q47 [MCQ].** This TSP is (a) Euclidean (b) non-Euclidean. (Caution: may require bull work.)
**Q48 [SA].** Nearest Neighbour tour from A (ties alphabetical), in construction order; and its cost.
**Q49 [SA].** Greedy edge tour, written from A (either direction accepted); and its cost.
**Q50 [SA].** Savings tour with base city A, written from A (either direction); and its cost.
**Q51 [SA, integer].** Best cost reachable from the NN tour by **one** 2-city exchange (A fixed): ____.
**Q52 [SA, integer].** Number of distinct tours: ____. Optimal tour cost: ____.

---

### SECTION 7 — LOCAL SEARCH & SIMULATED ANNEALING

**Q53 [MCQ].** Beam Search with beam width 1 behaves exactly like (a) Best-First (b) Hill Climbing (c) DFS (d) Random Walk
**Q54 [MCQ].** Tabu Search on a 5-variable SAT with tenure 5 and **no aspiration criterion**. What happens on the 6th move?
(a) best neighbour chosen normally (b) no neighbour is allowed, the search is stuck (c) it restarts randomly (d) it flips the oldest tabu bit
**Q55 [MSQ].** For SA with P(move) = 1/(1 + e^{−ΔE/T}), ΔE = eval(neighbour) − eval(current):
(a) at very high T, every move has P ≈ 0.5
(b) with ΔE = 0 the probability is 0.5 at every T
(c) as T → 0, worse moves are never taken
(d) a better neighbour is always accepted with probability exactly 1
**Q56 [SA, 3 decimals].** P(move) for ΔE = −6, T = 3: ____; for ΔE = −6, T = 30: ____.

---

### SECTION 8 — GENETIC ALGORITHMS & ACO
Reference order of cities A…H.

**Q57 [SA].** Cycle crossover, P1 = B,D,A,F,C,E,H,G and P2 = H,A,G,B,E,D,C,F. Child C1 (odd cycles from P1) = ____.
**Q58 [SA].** Cycle crossover, P1 = A,B,C,D,E,F,G,H and P2 = C,F,A,E,B,D,H,G. C1 = ____, C2 = ____.
**Q59 [SA].** PMX of P1 = B,D,A,F,C,E,H,G and P2 = H,A,G,B,E,D,C,F, with the segment at positions 4–6 copied from P1. Child = ____.
**Q60 [SA].** Ordinal representation of B,D,A,F,C,E,H,G = ____.
**Q61 [MCQ].** Is C,E,D,A,H,B,F,G (listed for A…H) a valid adjacency representation of a tour? (a) Yes (b) No
**Q62 [SA].** Roulette wheel with fitness 12, 30, 18, 40, 20, 0. Angle of the 4th individual (degrees): ____; expected copies of it in 6 spins: ____.
**Q63 [SA, 3 decimals].** Ant at A; allowed B, C, D with pheromone τ = 2, 1, 4 and distances 7, 7, 4. With α = 1, β = 1: P(D) = ____. With α = 0, β = 2: P(D) = ____.
**Q64 [SA, 1 decimal].** Edge τ = 4, evaporation ρ = 0.3, two ants with tour lengths 40 and 50 used it, Q = 100. New τ = ____.

---

## 4 · ANSWER KEY WITH WORKED SOLUTIONS

### Section 1
**Q1:** a,b,c,d. **Q2:** (b) empty: "full" refers to the cup, "empty" to the bottle. **Q3:** a,c,d (Water Jug and Hanoi are planning).

### Case A — Lantern Ring
**Q4:** On/off status of the 6 lanterns (a 6-bit string).
**Q5: 16.** Presses commute and pressing twice cancels, so a pattern depends only on the **set** of lanterns pressed: 2⁶ = 64 press-sets. But {L1,L4}, {L2,L5}, {L3,L6} each light all six lanterns, so press-sets that differ by these give the same pattern. Each pattern comes from 4 press-sets ⇒ 64/4 = **16**.
**Q6:** 110001,111000,011100,001110,000111,100011 (L1 toggles L6,L1,L2, etc.).
**Q7: 2** (press L1 and L4: 110001 → 111111).
**Q8: a,b,c,e.** (a) press again to undo. (b) each state XOR 6 distinct masks → 6 distinct neighbours. (c) 48 patterns unreachable. (d) false: toggles commute. (e) pressing twice cancels, so it would waste 2 moves.
**Q9: (c) 32.** With 5 lanterns there is no such dependency: all 2⁵ patterns are reachable (all-on needs 5 presses). The number of lanterns changes the structure of the space completely.

### Case B — Frog Pond
**Q10: 12** (gcd(3,5) = 1, so jump combinations hit every residue).
**Q11:** 0,3,5,6,8,10,9,11,1.

| Pop | OPEN after |
|---|---|
| 0 | 3,5 |
| 3 | 5,6,8 |
| 5 | 6,8,10 (8 already seen) |
| 6 | 8,10,9,11 |
| 8 | 10,9,11,1 |
| 10 | 9,11,1 (1 and 3 seen) |
| 9 | 11,1,2 |
| 11 | 1,2,4 |
| 1 | goal ✔ |

**Q12:** BFS 0,3,8,1 (3 jumps). DFS 0,3,6,9,2,7,10,1 (7 jumps: DFS always takes the +3 branch first).
**Q13: b,c,d.** (a) is false: no single clockwise jump undoes a jump, yet (b) is still true because you can go "all the way round". Reversible ⇒ you can return, but being able to return does **not** imply reversible.
**Q14: (a) Yes.** Jumping 5 every time visits 0,5,10,3,8,1,6,11,4,9,2,7 and returns to 0, since gcd(5,12) = 1.
**Q15: 4** (pads 0,3,6,9: every jump is a multiple of 3).

### Case C — Jugs
**Q16: 22.** Exactly the states with one jug empty or full: x ∈ 0..7 with y ∈ {0,4} (16) plus x ∈ {0,7} with y ∈ {1,2,3} (6).
**Q17:** (7,4),(0,4),(3,0),(7,0). (Fill 4 and pour 7→4 change nothing and are dropped.)
**Q18: 8.** (0,0)→(7,0)→(3,4)→(3,0)→(0,3)→(7,3)→(6,4)→(6,0)→(2,4).
**Q19: a,c.** (b) fails at (7,0); (d) fails at (0,0) and (4,4).

### Case D — Queens
**Q20:** 2,4,1,3.
**Q21: 9.** root → [1] → [1,3] dead → [1,4] → [1,4,2] dead → back to row 1 → [2] → [2,4] → [2,4,1] → [2,4,1,3] ✔.
**Q22:** 8! = **40320**.

### Case E — Knight board
Neighbour lists: A:G,J · B:H,I,K · C:E,J,L · D:F,K · E:C,K · F:D,L · G:A,I · H:B,J · I:B,G · J:A,C,H · K:B,D,E · L:C,F.
Heuristic h = d(·,F): E,B,G,J = 1 · A,C,I,K = 1.414 · H = 2 · D,L = 2.236 · F = 0.

**Q23:** B,D,E. **Q24: 3.6** (√(2² + 3²) = √13).
**Q25: a,b,c,d.** Degrees are 2 or 3; B, C, J, K have 3; the graph is connected.
**Q26: (b) No.** A degree-2 square must use **both** of its edges in any closed tour. The forced edges A–G, G–I, I–B, B–H, H–J, J–A close a 6-square loop, so no 12-square cycle can contain them. *(This "forced edges at degree-2 nodes" trick is the fastest way to prove "no tour".)*

**Q27:** A,G,I,B. **Q28:** A,G,I,B,K,D,F.

| Pop | OPEN after (DFS) |
|---|---|
| A | G,J |
| G | I,J |
| I | B,J |
| B | H,K,J |
| H | K,J (B closed, J already in OPEN) |
| K | D,E,J |
| D | F,E,J |
| F | goal ✔ |

H was a dead end, so it is inspected but not on the path.

**Q29:** A,G,J,I. **Q30:** A,J,C,L,F. (BFS generates F from L; parents F←L←C←J←A.)

**Q31:** A,G,J,C. **Q32:** A,J,C,E,K,D,F.

| Pop | OPEN after (h) |
|---|---|
| A | G1, J1 |
| G | J1, I1.41 |
| J | C1.41, I1.41, H2 |
| C | E1, I1.41, H2, L2.24 |
| E | I1.41, K1.41, H2, L2.24 |
| I | B1, K1.41, H2, L2.24 |
| B | K1.41, H2, L2.24 |
| K | H2, D2.24, L2.24 |
| H | D2.24, L2.24 |
| D | F0, L2.24 |
| F | goal ✔ |

Best-First inspected 11 squares and found a 6-move path: a heuristic that points straight at F is misleading on a knight graph, because knights can't move "straight".

**Q33: NIL.** A (1.414) → neighbours G(1), J(1): tie → G. G's neighbours A(1.414), I(1.414): none better → stop at G.
**Q34:** bound **4**; inspections 1 + 3 + 6 + 9 + 11 = **30**. The iterations inspect: A · A,G,J · A,G,I,J,C,H · A,G,I,B,J,C,E,L,H · A,G,I,B,H,K,J,C,E,L,F, and bound 4 finds the path A,J,C,L,F (the BFS path).
**Q35: (b) G.** Beam [G,J] (h = 1, better than A's 1.414). Children of G and J: A, I, C, H → best two A, C (1.414, alphabetical among A, C, I) → 1.414 is not better than 1 → stop; best so far is G.
**Q36: b,d.** Distance to the goal is minimised. Non-monotonic: along the shortest route (BFS's A→J→C→L→F), h goes 1.41 → 1 → 1.41 → 2.24 → 0; you must move *away* from F to reach it. That is exactly why Hill Climbing fails.

### Section 4 — Complexity
**Q37:** 1+3+9+27+81 = **121**. **Q38:** 1+4+13+40+121 = **179**. **Q39:** 1+3+9+27 = **40**: the goal is detected as soon as it is generated at depth 4, so depth-4 nodes never need expanding. **Q40:** (b) b/(b−1) = **1.5** (179/121 ≈ 1.48).

### Section 5 — SAT
Clauses: (a∨b)(¬b∨¬e)(¬a∨e)(b∨d)(e∨¬b)(¬b∨¬c)(d∨c)(c∨b). Unique solution **10111** (Arjun, Chitra, Dev, Esha).
**Q41: a,c.** (c) writes the same clauses in equivalent notation; (b) and (d) have the wrong signs or connectives.
**Q42: 4** (clauses 2, 3, 5, 6 are satisfied when everyone is 0).
**Q43: 01010, h = 7.**

| Current (h) | Flip a, b, c, d, e | Move |
|---|---|---|
| 00000 (4) | 4, **6**, 6, 6, 4 | flip b (tie → earlier variable) |
| 01000 (6) | 5, 4, 6, **7**, 6 | flip d |
| 01010 (7) | 6, 6, 6, 6, 7 | nothing better → stop |

**Q44: (b) No.** The best 2-flip neighbour of 01010 also has h = 7 (e.g. 11011, 00110). The solution 10111 is 4 flips away.
**Q45: 6 moves → 10111.** Flips: b (01000·6), d (01010·7), e (01011·7, sideways), a (11011·7), b (10011·7), c (**10111·8**). The tabu list blocks undoing recent flips, pushing the search across the plateau of 7s.
**Q46: (b) b = 0.** (¬b∨¬e) and (¬b∨e) together say "b implies not e and b implies e", so b must be 0. Then a = 1 (clause 1), e = 1 (clause 3), c = 1 (clause 8), d = 1 (clause 4). Unit propagation solves it without any search.

### Section 6 — TSP
**Q47: (b) non-Euclidean.** d(A,E) = 15 > d(A,D) + d(D,E) = 12; also d(C,D) = 15 > d(C,A) + d(A,D) = 11.
**Q48:** A,D,B,C,E, cost **45**. A→D (4); at D, B and E tie at 8 → B; B→C (8); C→E (10); E→A (15). The tie and the long return leg are both typical NN traps.
**Q49:** A,B,C,E,D, cost **37**.

| Edge | Len | Accept? | Reason |
|---|---|---|---|
| AD | 4 | ✔ | |
| AB | 7 | ✔ | A now full |
| AC | 7 | ✗ | A has degree 2 |
| BC | 8 | ✔ | |
| BD | 8 | ✗ | B full; would also close a loop |
| DE | 8 | ✔ | |
| BE | 9 | ✗ | B full |
| CE | 10 | ✔ | closes the tour |

**Q50:** A,C,E,B,D (or A,D,B,E,C), cost **38**. Savings S(x,y) = d(A,x) + d(A,y) − d(x,y): BE 13 ✔, CE 12 ✔, DE 11 ✗ (E full), BC 6 ✗ (loop), BD 3 ✔, CD −4 → chain C–E–B–D, then join both ends to A.
**Q51: 37** (swap B and E: A,D,E,C,B).
**Q52:** 4!/2 = **12** tours; optimum **36** (A,C,B,E,D). Ranking: optimum 36 < Greedy 37 < Savings 38 < NN 45.

### Section 7 — Local search
**Q53:** (b). **Q54:** (b): all 5 bits were flipped in the last 5 moves, so all are tabu. Aspiration (or a shorter tenure) is needed.
**Q55:** a,b,c. (d) is false: under the sigmoid a better move is accepted with probability < 1 (e.g. 0.881 for ΔE = 6, T = 3).
**Q56:** 0.119 and 0.450.

### Section 8 — GA & ACO
**Q57:** B,D,A,F,C,E,H,G. **Trap:** the positions form a single cycle (pos 1→7→5→6→2→3→8→4→1: B/H → H is at P1 pos 7 → C → pos 5 → E → pos 6 → D → pos 2 → A → pos 3 → G → pos 8 → F → pos 4 → B), so C1 is a copy of P1 and C2 a copy of P2. CX produces nothing new when there is only one cycle.
**Q58:** cycles by position = [1,2,1,2,2,2,3,3]. C1 = **A,F,C,E,B,D,G,H**; C2 = **C,B,A,D,E,F,H,G**.
**Q59:** H,A,G,F,C,E,D,B. Segment F,C,E from P1; mapping F↔B, C↔E, E↔D. Positions 1–3 from P2 (H,A,G); position 7: P2 has C → maps to E → maps to D; position 8: P2 has F → maps to B.
**Q60:** 2,3,1,3,1,1,2,1.
**Q61: (b) No.** Follow it from A: A→C→D→A, a 3-city subtour. A valid adjacency string must form **one** cycle through all cities.
**Q62:** 360·40/120 = **120°**; 6·40/120 = **2**. (The individual with fitness 0 can never be selected.)
**Q63:** weights τ/d = 2/7, 1/7, 4/4 → P(D) = 1/(3/7 + 1) = **0.700**. With α = 0, β = 2: weights 1/49, 1/49, 1/16 → P(D) = **0.605**.
**Q64:** 0.7·4 + 100/40 + 100/50 = **7.3**.

---

## 5 · Patterns these questions train (Weeks 2–3 depth)
| Pattern | Where it appeared | The move |
|---|---|---|
| Invariant / linear-algebra counting | Lanterns, jugs, frog | Ask "what never changes?" or "which press-sets coincide?" before enumerating |
| Directed but strongly connected | Frog | "Can return" ≠ "reversible" |
| gcd reachability | Frog, jugs | Reachable positions are multiples of gcd |
| Forced edges at degree-2 nodes | Knight board | Fastest proof that no tour exists |
| Tie-breaking decides the answer | Knight HC (G vs J), TSP NN at D | Always write h values and apply the stated tie rule |
| Misleading heuristic | Knight Best-First | Straight-line distance misleads when moves aren't straight → non-monotonic |
| Plateau escape | SAT Tabu | Sideways moves plus tabu memory cross flat regions |
| Unit propagation | SAT Q46 | Two clauses (x∨y)(x∨¬y) force x |
| Goal-test timing | Q39 | Testing at generation saves the whole last level |
| Degenerate operators | CX single cycle, adjacency subtour | Check whether the operator produces anything new or anything valid |
