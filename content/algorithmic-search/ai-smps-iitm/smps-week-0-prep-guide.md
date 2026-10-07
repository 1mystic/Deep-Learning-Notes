---
title: Week 0 (Prep Guide: Big-O, DSA, Algorithm Map)
summary: Zero-to-hero prerequisites: Big-O, stacks, queues, heaps, recursion, graphs, plus the full algorithm tree and LeetCode map.
tags: [ai, smps, search]
color: green
order: -1
---

# AI Search Methods — Zero-to-Hero Prep Guidebook
*For a complete beginner. Read Part 0 first even if you "know some coding" — the vocabulary here is used without re-explanation for the rest of the course.*

---

## PART 0 — Prerequisites You MUST Have Before Week 1

## 0.1 What even is "an algorithm"?
- A finite, exact sequence of steps that transforms an **input** into an **output**.
- In this course, the input is almost always "a starting situation" and the output is "a sequence of moves" or "a single best choice."

## 0.2 Time Complexity (Big-O) — the language every algorithm's speed is described in

| Notation | Name | Feels like | Example |
|---|---|---|---|
| O(1) | Constant | Instant, size doesn't matter | Array index lookup |
| O(log n) | Logarithmic | Halves the problem each step | Binary search |
| O(n) | Linear | One pass through the data | Scanning a list |
| O(n log n) | Linearithmic | A bit worse than linear | Merge sort, heap operations |
| O(n²) | Quadratic | Nested loop over the data | Comparing every pair |
| O(b^d) | Exponential | Explodes fast — **this is what search trees look like** | DFS/BFS/Minimax on a game tree |
| O(n!) | Factorial | Worse than exponential | Brute-force TSP |

- **Why this matters here:** almost every algorithm in this course is rated by **O(bᵈ)** where `b` = branching factor (avg. children per state) and `d` = depth of the goal. This single fact — that the search tree grows exponentially — is *why the entire course exists*: every algorithm from here on is a different strategy for taming that explosion.
- **Space complexity** = same idea, but "how much memory is used," not "how much time." In this course, this is usually "how many nodes do I have to keep in memory (OPEN + CLOSED) at once?"

## 0.3 Basic Data Structures You Need Fluent, Not Just "Heard Of"

| Structure | What it does | Where it appears in this course |
|---|---|---|
| **Array / List** | Ordered, indexable collection | Representing states (e.g. a tuple `(j8,j5,j3)` for water jugs) |
| **Stack (LIFO)** | Last-In-First-Out; push/pop from one end | **DFS's OPEN list** — literally implemented as a stack |
| **Queue (FIFO)** | First-In-First-Out; push at back, pop from front | **BFS's OPEN list** — literally implemented as a queue |
| **Priority Queue / Min-Heap** | Always pops the *smallest* (or largest) item, not the oldest | **A*, Uniform-Cost, Best-First, Beam Search** — OPEN sorted by cost/heuristic |
| **Hash Set / Hash Map** | O(1) average lookup: "have I seen this before?" | **CLOSED list** — checking if a state was already visited |
| **Tree / Graph** | Nodes + edges; a tree is a graph with no cycles | The entire "state space" is a graph; a "game tree" is literally a tree |
| **Adjacency List** | For each node, a list of its neighbours | This IS what **MoveGen(N)** returns |

- If you don't yet know how to implement a stack, queue, and a min-heap (or at least use Python's `list`, `collections.deque`, and `heapq`), **stop and learn these three first** — every single algorithm below is built on top of them.

## 0.4 Recursion — you need to be comfortable with functions calling themselves
- Every DFS-family algorithm, every game-tree algorithm (Minimax, Alpha-Beta), and every backtracking algorithm (N-Queens, B&B) is most naturally written recursively.
- The core pattern to internalize: **base case** (stop condition, e.g. "is this the goal?") + **recursive case** (try each option, recurse, undo/backtrack if needed).

## 0.5 Graphs — the universal language of this entire course
- A **state space** = a graph where nodes are situations and edges are moves.
- **Directed vs undirected**: is a move always reversible? (Matters for whether you can "walk back.")
- **Weighted vs unweighted**: does every move cost the same (1 step). If not (weighted), plain BFS stops being correct — you need Uniform-Cost/Dijkstra/A*.
- **Cyclic vs acyclic**: does the graph have loops? (Matters — DFS without a CLOSED list can loop forever on a cyclic graph.)

## 0.6 The Course's Own Core Vocabulary (memorize before Week 1)

| Symbol/Term | Meaning |
|---|---|
| State | One complete situation/configuration |
| MoveGen(N) | Function returning valid next-states from N — this is your adjacency list, generated on demand |
| GoalTest(N) | Returns true iff N is a goal state |
| OPEN | The frontier — states generated but not yet explored |
| CLOSED | States already explored |
| b | Branching factor — average number of children per state |
| d | Depth of the shallowest goal |
| m | Maximum depth of the search tree |
| g(n) | Cost of the path from start to node n **so far** |
| h(n) | Heuristic — an *estimate* of the remaining cost from n to a goal |
| f(n) | g(n) + h(n) — used by A* and its family |

---

## PART 1 — The Algorithm Tree, Explained One-by-One

*Organized exactly as you listed. For each: what problem it solves, the ONE mechanical rule that defines it, complexity, and when it's used.*

## GROUP A — Blind (Uninformed) Search
*"Blind" = no heuristic, no knowledge of where the goal is. Pure structural exploration.*

### Breadth-First Search (BFS)
- **Rule:** OPEN is a **queue**. New children go to the **back**. Always explores everything at depth k before touching depth k+1.
- **Guarantees:** Complete (finds a solution if one exists) and **optimal** — but only when every move costs the same (unit cost).
- **Complexity:** Time O(bᵈ), Space O(bᵈ) — the memory cost is the killer; the entire frontier at depth d must be held at once.
- **DSA needed:** Queue.

### Depth-First Search (DFS)
- **Rule:** OPEN is a **stack**. New children go to the **front** (prepended). Dives down one branch fully before backtracking.
- **Guarantees:** Not complete on infinite/cyclic graphs without a CLOSED list. Not optimal — returns whatever it finds first.
- **Complexity:** Time O(bᵐ) worst case, Space **O(b·m)** — linear! This is DFS's one big advantage over BFS.
- **DSA needed:** Stack (or plain recursion, which uses the call stack automatically).

### DFID / IDDFS (Iterative Deepening DFS)
- **Rule:** Run depth-limited DFS with limit=1, then limit=2, then limit=3... until the goal is found at the smallest possible depth.
- **Why it exists:** Gets BFS's guarantee (shortest path found first) **and** DFS's linear space — at the cost of re-exploring the tree at every iteration (only ~11% extra work when b≈10, since the bottom level dominates node count).
- **Complexity:** Time O(bᵈ) (same order as BFS), Space O(b·d) (linear, like DFS).
- **Gotcha:** if you keep a global CLOSED list across iterations (instead of resetting it every iteration), you can accidentally miss the truly-optimal path — this is a classic exam trap ("the DFID CLOSED-list bug").

### Uniform-Cost Search (UCS)
- **Rule:** OPEN is a **priority queue sorted by g(n)** (cost-so-far). Always expand the *cheapest* path known, not the "deepest" or "widest" one.
- **This is exactly Dijkstra's algorithm.**
- **Why it exists:** BFS is only optimal for unit-cost edges. As soon as edges have different weights, you need UCS to guarantee the cheapest path.
- **DSA needed:** Priority Queue / Min-Heap.

### Bidirectional BFS
- **Rule:** Run BFS **simultaneously from the start AND from the goal**, stop the moment the two frontiers meet in the middle.
- **Why it exists:** Cuts the effective search depth in half. Instead of O(bᵈ), you get roughly **O(2·b^(d/2))** — dramatically smaller for large d, since exponential growth is brutal.
- **Requirement:** you must be able to run MoveGen *backwards* from the goal too (i.e., the reverse graph must be computable) and know the goal state explicitly.

---

## GROUP B — Branch & Bound
*Adds a "cost so far" awareness on top of blind search, used mainly for finding the cheapest complete solution (not just any solution).*

### Branch & Bound (basic)
- **Rule:** Always extend the partial path with the **smallest g(n)** (cost so far) — identical mechanism to Uniform-Cost Search, but framed as "partition the solution set and prune branches whose lower-bound cost can't beat the best solution found so far."
- **Key idea:** a branch is *pruned* the instant its lower-bound cost estimate exceeds the cost of the best complete solution already found.

### B&B · No-Repeat + Acyclic
- **Rule:** Same as B&B, but additionally refuses to ever revisit a node already on the current path (or ever, via a CLOSED set) — this guarantees termination on graphs with cycles, and avoids wasted re-exploration.
- **When needed:** any real-world graph with cycles (e.g. road networks) — without this, plain B&B could loop.

---

## GROUP C — Local / Beam Search
*Trade completeness/optimality for tiny memory footprint. No OPEN/CLOSED bookkeeping at all (mostly).*

### Hill Climbing
- **Rule:** Look at all neighbours of the current state; move to the best one **only if it's strictly better** than the current state (a tie does NOT count as an improvement). Stop when nothing improves.
- **Complexity:** O(1) extra memory — this is the whole appeal.
- **Weaknesses (the "3 curses"):** local maxima, plateaus (all neighbours equal), ridges.
- **DSA needed:** none beyond basic looping/comparison — the whole difficulty is conceptual, not structural.

### Beam Search
- **Rule:** Like BFS, but at every level, keep only the **top-w** candidates by heuristic value (discard the rest). `w` = beam width.
- **Special cases:** w=1 → identical to Hill Climbing. w=∞ → identical to Best-First Search.
- **Trade-off:** linear memory O(w·d), but **not guaranteed optimal or even complete** — the true solution might fall outside the beam and get discarded forever.

### Simulated Annealing (SA)
- **Rule:** Like Hill Climbing, but sometimes accept a *worse* move too, with probability `P = 1/(1+e^(−ΔE/T))`, where T (temperature) starts high and is slowly cooled.
- **Behavior at the limits:** T→∞ acts like a **Random Walk** (accepts almost anything, ~50/50). T→0 acts like plain **Hill Climbing** (only accepts strict improvements).
- **Why it exists:** the controlled randomness lets it escape local maxima that pure Hill Climbing gets permanently stuck in.

---

## GROUP D — Informed Search (uses h(n))

### Greedy Best-First Search
- **Rule:** OPEN is a priority queue sorted by **h(n) only**.
- **Weakness:** ignores cost-so-far entirely, so it is **not optimal** — it can walk into an expensive path just because it *looks* close to the goal.

### A* Search
- **Rule:** OPEN sorted by **f(n) = g(n) + h(n)**. Combines Uniform-Cost's guarantee (via g) with Greedy's sense of direction (via h).
- **Guarantee:** optimal **if and only if** h is admissible (never overestimates the true remaining cost) — plus finite branching and edge costs bounded above zero.
- **This is the single most important algorithm in the whole course.** Everything after it (Weighted A*, IDA*, Frontier Search, Beam-Stack, etc.) is a variation trying to fix A*'s one flaw: **it needs O(bᵈ) memory** to hold OPEN and CLOSED.

### Weighted A*
- **Rule:** f(n) = g(n) + **w·h(n)**, with w > 1. Deliberately over-weights the heuristic to search faster.
- **Trade-off:** no longer guaranteed optimal (solution cost is at most w× the true optimum), but explores far fewer nodes — useful when "good enough, fast" beats "perfect, slow."

### IDA* (Iterative Deepening A*)
- **Rule:** Like DFID, but instead of an increasing depth-limit, you use an increasing **f-value bound**. Run DFS, but prune any branch whose f(n) exceeds the current bound; if no solution found, raise the bound to the smallest f-value that got pruned, and retry.
- **Why it exists:** gets A*'s optimality guarantee with **DFS's linear memory** — the classic fix for A*'s memory blow-up.
- **DSA needed:** recursion / stack, same as DFS, plus tracking a numeric bound.

---

## GROUP E — Memory-Bounded Search
*All of these exist for one reason: A* eats too much memory. Each is a different way to keep A*'s optimality while shrinking the memory footprint.*

### Frontier Search / DCFS (Divide-and-Conquer Frontier Search)
- **Rule:** Deletes the CLOSED list entirely; instead, each OPEN node carries a small "do not regenerate these" tabu list of its own recent ancestors. Path reconstruction is recovered afterward using sparse "relay" checkpoint nodes and two recursive re-searches (start→relay, relay→goal).
- **Why it exists:** in problems like sequence alignment, CLOSED grows *quadratically* while OPEN only grows linearly — deleting CLOSED is a huge memory win.

### Sparse-Memory Graph Search (SMGS)
- **Rule:** Adaptive version of Frontier Search — runs plain A* with a full CLOSED list while memory allows; only when memory pressure hits a threshold does it prune the CLOSED list's "kernel" (fully-enclosed interior nodes) down to just its "boundary" (nodes touching OPEN).

### Breadth-First Heuristic Search (BFHS)
- **Rule:** Get a cheap upper bound U on the solution cost first (e.g. via Beam Search). Then run a plain, blind **BFS**, but prune any node whose f(n) > U. Because f-values are non-decreasing along any path (true whenever h is consistent), this pruning is always safe.

### Divide & Conquer BFHS
- **Rule:** Same idea as BFHS, but adds sparse "relay" checkpoints (like Frontier Search) so you don't need to hold the whole frontier in memory at once — trades some recomputation time for even less memory.

### RBFS (Recursive Best-First Search)
- **Rule:** A recursive, DFS-style traversal that mimics A*'s ordering by tracking the best alternative f-value (F) seen at each ancestor; if the current subtree's f exceeds that alternative, it backs off (and remembers the best f found in that subtree in case it returns later).
- **Complexity:** Linear space (like DFS/IDA*), but can revisit the same nodes multiple times if it backtracks and returns.

---

## GROUP F — Beam-Stack Search family
*Fixes plain Beam Search's fatal flaw: nodes dropped from the beam are lost forever, so Beam Search alone is not optimal.*

### Beam-Stack Search
- **Rule:** Keep a small beam (like Beam Search) **plus** an explicit stack of `[f_min, f_max)` windows per level. If the current beam's best-found solution isn't provably optimal, backtrack: pop the stack, slide the window to consider the next-cheapest batch of children that were excluded before.
- **Result:** admissible (optimal) **and** low memory — because backtracking lets it eventually consider everything the plain beam would have permanently discarded.

### D&C Beam-Stack Search
- **Rule:** Adds the Frontier-Search-style sparse relay/checkpoint trick on top of Beam-Stack Search, pushing memory down to near-constant (aside from the beam stack itself).

### D&C Beam-Stack + Backtrack
- **Rule:** The fullest version — combines constant-width layers, relay checkpoints, AND explicit backtracking — the most memory-frugal, fully-optimal member of the whole A* family. The cost: significant recomputation time whenever it backtracks, since it regenerates discarded branches from scratch.

---

## GROUP G — Game Trees / Adversarial Search
*Now there's an opponent trying to minimize your score. Search must account for both players.*

### Minimax
- **Rule:** Alternate MAX levels (pick the child with the **highest** value) and MIN levels (pick the child with the **lowest** value), assuming the opponent always plays optimally against you.
- **Complexity:** Time O(bᵈ), Space O(b·d) — it's a DFS traversal of the game tree underneath.
- **DSA needed:** recursion, exactly like DFS.

### Alpha-Beta Pruning
- **Rule:** Same result as Minimax, but maintains a running window **[α, β]** — α = the best value MAX can guarantee so far, β = the best value MIN can guarantee so far. The instant α ≥ β, the remaining siblings at that node are **provably irrelevant** and get skipped entirely.
- **Complexity:** With perfect move ordering, only **O(b^(d/2))** — effectively doubling the depth you can search for the same cost. Same final answer as plain Minimax, just faster.

### SSS*
- **Rule:** Instead of Minimax's depth-first traversal, SSS* is a **best-first search over "strategies"** (whole subtrees), using a priority queue of partially-evaluated solution clusters.
- **Guarantee:** provably inspects a **subset** of the nodes that left-to-right Alpha-Beta inspects — but needs an exponentially-sized priority queue to do it, so in practice Alpha-Beta with good move ordering usually wins on real hardware. Mostly of theoretical importance.

---

## PART 2 — LeetCode Practice Map

*Real, actual LeetCode problems, mapped to each concept above, so the DSA mechanics become muscle memory alongside the course's theory. Problems are ordered easy→hard within each row where possible.*

## Prerequisite DSA (do these FIRST, before touching search algorithms)

| Concept | LeetCode Problems |
|---|---|
| Arrays / hashing basics | **1. Two Sum**, **217. Contains Duplicate** |
| Stack | **20. Valid Parentheses**, **155. Min Stack**, **232. Implement Queue using Stacks** |
| Queue | **933. Number of Recent Calls**, **225. Implement Stack using Queues** |
| Heap / Priority Queue | **215. Kth Largest Element in an Array**, **347. Top K Frequent Elements**, **23. Merge k Sorted Lists** |
| Recursion | **509. Fibonacci Number**, **70. Climbing Stairs**, **206. Reverse Linked List** (recursive version) |
| Graph representation | **133. Clone Graph**, **207. Course Schedule** |

## Group A — Blind Search

| Algorithm | LeetCode Problems |
|---|---|
| BFS | **102. Binary Tree Level Order Traversal**, **200. Number of Islands**, **994. Rotting Oranges**, **127. Word Ladder**, **1091. Shortest Path in Binary Matrix** |
| DFS | **200. Number of Islands**, **112. Path Sum**, **695. Max Area of Island**, **130. Surrounded Regions**, **207. Course Schedule** (cycle detection via DFS) |
| DFID / IDDFS | No direct LeetCode equivalent (LeetCode rarely rewards artificially bounded re-search). Practice the *concept* on: **51. N-Queens** and **37. Sudoku Solver**, by manually adding a depth-limit parameter and re-running with increasing limits, to feel why plain DFS would fail without it on deep/infinite trees. |
| Uniform-Cost (Dijkstra) | **743. Network Delay Time**, **787. Cheapest Flights Within K Stops**, **1631. Path With Minimum Effort**, **778. Swim in Rising Water** |
| Bidirectional BFS | **127. Word Ladder** (re-solve it a second time using bidirectional BFS to feel the speedup), **752. Open the Lock** |

## Group B — Branch & Bound

| Algorithm | LeetCode Problems |
|---|---|
| Branch & Bound / pruning | **39. Combination Sum**, **46. Permutations**, **51. N-Queens**, **37. Sudoku Solver**, **79. Word Search** — all of these are backtracking with implicit "bound" pruning (an invalid partial assignment is abandoned immediately) |

## Group C — Local / Beam Search

| Algorithm | LeetCode Problems |
|---|---|
| Hill Climbing (local optimum concept) | **162. Find Peak Element** (this IS the "climb until no neighbour is better" idea, formalized) |
| Beam Search | No direct LeetCode problem (it's a construction-heuristic technique, not a typical interview topic). Best practice: implement your own beam-width-k search over **773. Sliding Puzzle** and compare node counts against plain BFS. |
| Simulated Annealing | No direct LeetCode problem. Practice outside LeetCode: implement SA to approximately solve a small **Traveling Salesman** instance you construct yourself, and compare against brute force. |

## Group D — Informed Search (A* family)

| Algorithm | LeetCode Problems |
|---|---|
| Greedy Best-First (heuristic-only ordering) | **1091. Shortest Path in Binary Matrix** (solve once with plain BFS, once ordering the queue by Chebyshev-distance heuristic only, to see it's *not* always optimal) |
| A* Search | **1091. Shortest Path in Binary Matrix** (with true A*: g + Chebyshev distance heuristic), **773. Sliding Puzzle** (g + Manhattan-distance-of-misplaced-tiles heuristic), **864. Shortest Path to Get All Keys** |
| Weighted A* | Take any of the above and multiply the heuristic term by w=1.5–2 to feel the speed/optimality trade-off directly |
| IDA* | **773. Sliding Puzzle** — implement IDA* as an alternative to BFS/A* and compare memory usage empirically |

## Group E — Memory-Bounded Search

*These (Frontier Search, SMGS, BFHS, D&C BFHS, RBFS) are research-level, memory-engineering algorithms with no standard LeetCode analog — they don't show up in interview-style problems because LeetCode's memory limits rarely force this level of sophistication.*
- **Best substitute practice:** take **773. Sliding Puzzle** or a self-made 15-puzzle, implement plain A*, then implement **RBFS** on the same problem and compare memory usage — the conceptual payoff (linear vs exponential memory) becomes concrete even without a "LeetCode-graded" version of these algorithms.

## Group F — Beam-Stack Search family

*Same situation as Group E — these are academic search-theory constructions, not interview topics.*
- **Best substitute practice:** implement plain Beam Search (width k) on **773. Sliding Puzzle**, deliberately construct a case where the true solution falls outside the beam and gets lost, then add the backtracking `[f_min, f_max)` stack mechanism yourself to recover it — this hands-on failure-then-fix is the fastest way to internalize *why* Beam-Stack Search exists.

## Group G — Game Trees / Adversarial Search

| Algorithm | LeetCode Problems |
|---|---|
| Minimax | **292. Nim Game**, **877. Stone Game**, **486. Predict the Winner**, **464. Can I Win**, **293. Flip Game II** |
| Alpha-Beta Pruning | Re-solve **486. Predict the Winner** and **877. Stone Game** with explicit alpha-beta pruning added on top of your minimax solution, and count nodes visited before/after to see the pruning effect directly |
| SSS* | No LeetCode equivalent — it's a research algorithm compared against Alpha-Beta theoretically, not implemented for interview practice. Best practice: read Stockman's original node-count proof and trust the theory rather than trying to code a practical version. |

---

## PART 3 — Suggested Order of Attack (a realistic weekly plan)

| Phase | Do this | Then solve |
|---|---|---|
| 0 | Big-O, Stack, Queue, Heap, Recursion basics | All 6 "Prerequisite DSA" problems |
| 1 | BFS, DFS mechanics (course Week 2) | All Group A "BFS"/"DFS" problems |
| 2 | DFID, UCS, Bidirectional BFS (course Week 2/6) | Remaining Group A problems |
| 3 | Hill Climbing, Beam, SA (course Week 3) | Group C problems + your own SA/Beam experiment |
| 4 | GA/ACO/TSP heuristics (course Week 4) | (covered in the previous guidebook — no LeetCode analog, these are constructive heuristics) |
| 5 | A*, Weighted A*, IDA* (course Week 5–6) | All Group D problems |
| 6 | Frontier Search, SMGS, BFHS, RBFS, Beam-Stack family (course Week 6) | Group E + F substitute practice |
| 7 | Minimax, Alpha-Beta, SSS* (course Week 7) | All Group G problems |

**Golden rule for every problem above:** before writing code, explicitly write down (on paper) what the *state*, *MoveGen*, and *GoalTest* are for that specific LeetCode problem. This single habit — translating a coding problem into this course's exact vocabulary — is what makes the two reinforce each other instead of feeling like separate subjects.
