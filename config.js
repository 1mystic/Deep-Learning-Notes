/*  config.js — the only file you need to edit to rebrand the site.
 *  Loaded before everything else, so keep it plain JavaScript (no imports).            */
window.SITE_CONFIG = {
  /* ---- branding ---- */
  name: "Deep Learning Notes",
  pageTitle: "Deep Learning Notes",
  heroTitle: "Learn deep learning from first principles.",
  heroText: "Illustrated notes with derivations, solved examples, traps and exam patterns. Search everything, annotate as you read, print any note to PDF.",

  /* ---- content ---- */
  contentDir: "content/",                 // where your .md files live
  manifest: "content/manifest.json",      // list of notes (see README → "Adding a note")

  /* ---- look & feel ---- */
  defaultTheme: "system",                 // "system" | "light" | "dark"
  chips: true,                            // turn **[Ex]**, **[!]**, **[Exam]** … into small coloured chips
  badgeColors: {                          // chip label (lower case) → green | blue | red | yellow
    "intuition": "blue", "derivation": "green", "ex": "yellow", "!": "red", "exam": "red", "?": "blue"
  },
  tocDepth: 4,                            // deepest heading level shown in the table of contents

  /* ---- maths ---- */
  mathOutput: "html",                     // "html" (fast, light) or "htmlAndMathml" (screen-reader friendly, heavier)
  macros: {                               // available in every $...$ and $$...$$ (KaTeX macro syntax)
    "\\R": "\\mathbb{R}",
    "\\N": "\\mathbb{N}",
    "\\Z": "\\mathbb{Z}",
    "\\E": "\\mathbb{E}",
    "\\argmax": "\\operatorname*{arg\\,max}",
    "\\argmin": "\\operatorname*{arg\\,min}",
    "\\norm": "\\left\\lVert #1 \\right\\rVert",
    "\\abs": "\\left\\lvert #1 \\right\\rvert",
    "\\vect": "\\boldsymbol{#1}",
    "\\dd": "\\,\\mathrm{d}"
  }
};
