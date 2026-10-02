# Contributing to Deep Learning Notes

Thank you for helping make these notes clearer, more accurate and more useful. Contributions should improve the
learning experience: add a careful explanation, repair an error, include a worked example or make the site easier to
use.

## What to contribute

- New deep-learning notes with accurate derivations and useful intuition.
- Corrections to mathematics, terminology, links, examples or rendering.
- Exam traps, worked problems and concise summaries that complement the existing notes.
- Small improvements to the reader, search, annotation, printing or documentation.

Please keep material educational and focused. Prefer original explanations and cite external sources when an idea,
figure or result depends on them. Do not add copyrighted course material unless you have permission to redistribute it.

## Add a note

1. Create a Markdown file inside `content/`, or inside a collection folder such as
   `content/iitm-bs/` or `content/granular-dl-concepts/`. Use a descriptive, lowercase filename such as
   `gradient-descent-intuition.md`. Files at the root render as standalone cards; files inside a
   collection folder render grouped under that folder's card (which lists each note title).
2. Add front matter at the very top of the file. All fields are technically optional, but
   `tags` is what makes the note discoverable — without it the library card renders with
   no tags and the note disappears as soon as anyone filters by tag. Set it **before**
   you run the manifest builder, because `content/manifest.json` just copies what you
   wrote here:

   ```yaml
   ---
   title: Gradient descent intuition
   summary: A geometric view of gradients, step sizes and convergence.
   tags: [deep-learning, optimisation]
   color: green
   order: 5
   ---
   ```

   Available colors are `green`, `blue`, `red` and `yellow`. Lower `order` values appear first.
   Reuse existing tags when they fit (`deep-learning`, `quiz-1`, `derivations`, `revision`, …)
   so filters stay useful; check `content/manifest.json` or the tag bar on the site for the
   current list.
3. Write the note with GitHub-flavoured Markdown. Use the existing notes as examples for equations, Mermaid diagrams,
   callouts, code blocks and cross-links.
4. Rebuild the manifest from the repository root:

   ```sh
   node tools/build-manifest.mjs
   ```

5. Serve the repository locally and check the library card and the rendered note:

   ```sh
   python3 -m http.server 8000
   ```

   Open `http://localhost:8000` in a browser. Check both light and dark themes, and print the note if it contains
   equations or diagrams.

## Writing standards

- Explain the idea before relying on notation; define symbols when they first appear.
- Check dimensions, signs, boundary cases and numerical examples in every derivation.
- Use headings that describe the topic, not only the section number.
- Keep paragraphs focused and use tables or lists when they improve scanning.
- Use `$...$` for inline mathematics and fenced `mermaid` blocks for diagrams.
- Keep front matter valid YAML and avoid changing generated `content/manifest.json` by hand when the build script is available.
- Watch the build output: `node tools/build-manifest.mjs` now warns when a note has no `tags` or `order`.

## Site changes

For changes to JavaScript, CSS or HTML, keep the implementation dependency-free and consistent with the existing
pastel light/dark theme. Preserve keyboard navigation, responsive layouts, accessible labels and print behavior.

## Pull requests

Before opening a pull request:

- Run `node tools/build-manifest.mjs` after adding or renaming a note.
- Review the generated card title, summary, tags and ordering in the library. If you added a new
  folder, also add it to `config.js → collections` with a title, summary, color and `order`.
- Test the affected note or interface in a local browser.
- Confirm that links work and that equations, diagrams, code and callouts render as expected.
- Keep each pull request focused and describe what changed and how it was checked.

Small, focused pull requests are easier to review and are more likely to be merged quickly.