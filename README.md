# Deep Learning Notes

![Deep Learning Notes](assets/readme-banner.svg)

A static, fast, pastel-coloured home for markdown notes. No framework, no build step for the site itself.
Maths (KaTeX + mhchem), diagrams (Mermaid), code highlighting, full-text search, a table of contents,
live annotation and print-to-PDF — all loaded lazily, only when a note needs them.

## Run it locally

Browsers block `fetch()` on `file://`, so serve the folder:

    python3 -m http.server 8000      # then open http://localhost:8000

## Adding a note

1. Create `content/my-note.md` and paste your markdown into it.
2. Run `node tools/build-manifest.mjs` (add `--watch` to rebuild on every save).
3. Reload. The note appears as a card, is searchable, and opens when clicked.

No Node? Open `content/manifest.json` and add the file name by hand, e.g. `["my-note.md"]`.
The site then reads each file itself to build the cards.

Files or folders starting with `_` (and `README.md`) are skipped — handy for drafts.
Sub-folders are fine: `content/week-2/gradients.md`.

## Contributing

Notes, corrections, worked examples and improvements are welcome. Read the [contribution guide](contribute.md)
for the note format, content standards, local preview steps and pull request checklist.

### Optional front matter (top of the .md file)

    ---
    title: Week 2 — Gradients
    summary: One or two sentences for the card.
    tags: [deep-learning, week-2]
    color: green        # green | blue | red | yellow
    order: 2            # lower comes first
    updated: 2026-10-02 # shown as "Changed …"
    ---

Everything is optional: the title defaults to the first `# heading`, the summary to the first paragraph.

## What markdown supports

- GitHub-flavoured markdown: tables, task lists, strikethrough, fenced code (any language highlight.js knows).
- Maths: `$inline$`, `$$display$$`, `\( \)`, `\[ \]`, and `\begin{align} … \end{align}` (also equation, gather, aligned, split, CD).
  Chemistry: `$\ce{H2O}$`. A `$$` block that only contains `\newcommand` / `\DeclareMathOperator` / `\gdef`
  is treated as a hidden preamble and applies to the whole note. Site-wide macros live in `config.js`.
  KaTeX covers amsmath/amssymb-style maths, not arbitrary LaTeX packages or TikZ.
  Equation numbering restarts in each display block.
- Diagrams: a ```` ```mermaid ```` fence (flowchart, sequence, class, state, ER, gantt, mindmap …), drawn with thick pastel
  borders and bold labels. Flowchart shapes pick a colour automatically (rectangle blue, rounded green, decision yellow,
  circle red); choose one yourself with `A[Input]:::green` (`green`, `blue`, `yellow`, `red`). Subgraphs get dashed tinted frames.
- Callouts: `> [!NOTE]`, `[!TIP]`, `[!WARNING]`, `[!CAUTION]`, `[!IMPORTANT]`, `[!EXAMPLE]`.
- Chips: `**[Ex]**`, `**[!]**`, `**[Exam]**` … become small coloured labels (set in `config.js`).
- Links between notes: `[see this](other-note.md#some-heading)`.
- Images: put them under `content/` and use relative paths.

## Files

    index.html            page shell and icon sprite
    config.js             name, hero text, theme default, maths macros, chip colours
    content/              your notes + manifest.json (generated)
    assets/css/style.css  all styling (light/dark tokens at the top)
    assets/js/app.js      router, library, reader, print
    assets/js/render.js   markdown → HTML, lazy KaTeX / Mermaid / highlight.js
    assets/js/search.js   search modal        assets/js/indexer.worker.js  indexing + matching (off main thread)
    assets/js/annotate.js highlights and notes
    vendor/               marked, KaTeX, Mermaid, highlight.js (self-hosted, MIT/BSD/Apache licensed)
    tools/build-manifest.mjs

## Hosting

Any static host works. Navigation uses `#/…` URLs, so no rewrites are needed. Commit `content/manifest.json`
(re-run the build script after adding notes) so the host serves the current list.

**GitHub Pages** — push this folder's contents to a repo, then *Settings → Pages → Deploy from a branch →
main / (root)*. A `.nojekyll` file is included.

**Cloudflare Pages** — connect the repo (or use *Direct Upload* with the folder). Framework preset: *None*,
build command: *(empty)*, output directory: `/`.

Annotations are stored per browser (localStorage); use Export / Import in the *Notes* tab to move them.

## Keyboard

`/` or `Ctrl/⌘ K` search · `Ctrl/⌘ P` print the open note · `Esc` closes panels.
