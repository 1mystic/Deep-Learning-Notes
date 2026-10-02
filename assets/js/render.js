/*  render.js — markdown → HTML, plus lazy, budgeted enhancement of math, diagrams and code.
 *  Nothing heavy is loaded until a note actually contains (and scrolls near) that kind of content. */
import { esc, icon, loadScript, loadStyle } from './util.js';

const CFG = window.SITE_CONFIG || {};
const MD = window.MDMeta;

/* ====================================================================== markdown */
let marked$ = null;
let S = null; // per-render state

const ENVS = 'equation|align|alignat|gather|aligned|split|CD';
const PREAMBLE_RE = /^\s*(?:\\(?:re)?newcommand|\\providecommand|\\DeclareMathOperator|\\gdef|\\global|\\def)(?![a-zA-Z])/;
const INLINE_DOLLAR = /^\$(?!\s)((?:\\.|[^$\\\n`])*?(?:\\.|[^\s$\\`]))\$(?!\d)/;

function mathHtml(tex, display, block) {
  S.math = true;
  if (/\\(?:ce|pu)\s*\{/.test(tex)) S.chem = true;
  if (block && PREAMBLE_RE.test(tex)) { S.preamble.push(tex); return '<div class="m-pre" hidden></div>'; }
  const tag = block ? 'div' : 'span';
  return `<${tag} class="m${display ? ' md' : ''}" data-tex="${esc(tex)}"><code class="m-raw">${esc(tex)}</code></${tag}>`;
}

function assetUrl(href) {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(href)) return href;
  return (CFG.contentDir || 'content/') + href.replace(/^\.\//, '');
}

const tocLabel = (raw) => raw
  .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/<[^>]+>/g, '').replace(/(\*\*|__|~~|`)/g, '').replace(/\*/g, '').trim();

function buildMarked() {
  const { Marked } = window.marked;
  const m = new Marked({ gfm: true, breaks: false });

  const mathBlock = {
    name: 'mathBlock', level: 'block',
    start(src) {
      const r = new RegExp('(?:^|\\n) {0,3}(?:\\$\\$|\\\\\\[|\\\\begin\\{(?:' + ENVS + ')\\*?\\})').exec(src);
      return r ? r.index + (r[0][0] === '\n' ? 1 : 0) : undefined;
    },
    tokenizer(src) {
      let r = /^ {0,3}\$\$([\s\S]+?)\$\$[ \t]*(?:\n|$)/.exec(src);
      if (r) return { type: 'mathBlock', raw: r[0], text: r[1].trim() };
      r = /^ {0,3}\\\[([\s\S]+?)\\\][ \t]*(?:\n|$)/.exec(src);
      if (r) return { type: 'mathBlock', raw: r[0], text: r[1].trim() };
      r = new RegExp('^ {0,3}(\\\\begin\\{(' + ENVS + ')(\\*?)\\}[\\s\\S]*?\\\\end\\{\\2\\3\\})[ \\t]*(?:\\n|$)').exec(src);
      if (r) return { type: 'mathBlock', raw: r[0], text: r[1].trim() };
    },
    renderer: (t) => mathHtml(t.text, true, true)
  };

  const mathInline = {
    name: 'mathInline', level: 'inline',
    start(src) { const i = src.search(/\$|\\\(/); return i < 0 ? undefined : i; },
    tokenizer(src) {
      let r = /^\$\$([^\n]+?)\$\$/.exec(src);
      if (r) return { type: 'mathInline', raw: r[0], text: r[1].trim(), display: true };
      r = /^\\\(([\s\S]+?)\\\)/.exec(src);
      if (r) return { type: 'mathInline', raw: r[0], text: r[1].trim(), display: false };
      r = INLINE_DOLLAR.exec(src);
      if (r) return { type: 'mathInline', raw: r[0], text: r[1], display: false };
    },
    renderer: (t) => mathHtml(t.text, t.display, false)
  };

  m.use({
    extensions: [mathBlock, mathInline],
    renderer: {
      heading(token) {
        const inner = this.parser.parseInline(token.tokens);
        if (token.synthetic) return `<h1 id="note-title" data-d="1">${inner}</h1>\n`;
        const plain = MD.stripInline(token.text);
        const id = S.slug(plain);
        S.headings.push({ id, depth: token.depth, text: plain, label: tocLabel(token.text) });
        return `<h${token.depth} id="${id}" data-d="${token.depth}">${inner}<a class="anchor" href="#/n/${esc(S.noteId)}?h=${id}" aria-label="Link to this section"></a></h${token.depth}>\n`;
      },
      code(token) {
        const lang = (token.lang || '').trim().split(/\s+/)[0].toLowerCase();
        if (lang === 'mermaid') {
          return `<div class="mermaid-box" data-src="${esc(token.text)}"><div class="mm-skel">Diagram</div></div>\n`;
        }
        if (lang === 'math' || lang === 'latex' || lang === 'tex' || lang === 'katex') return mathHtml(token.text, true, true) + '\n';
        return `<div class="code-block" data-lang="${esc(lang)}"><div class="code-head"><span>${esc(lang || 'text')}</span>` +
          `<button class="copy" type="button" aria-label="Copy code">Copy</button></div>` +
          `<pre><code${lang ? ` class="language-${esc(lang)}"` : ''}>${esc(token.text)}</code></pre></div>\n`;
      },
      link(token) {
        const text = this.parser.parseInline(token.tokens);
        let href = token.href || '', attrs = '';
        const md = /^(?:\.\/)?([\w\-./ %]+?)\.md(#.+)?$/i.exec(href);
        if (/^#(?!\/)/.test(href)) href = `#/n/${S.noteId}?h=${encodeURIComponent(href.slice(1))}`;
        else if (md) href = `#/n/${MD.idFromFile(md[1])}` + (md[2] ? `?h=${encodeURIComponent(md[2].slice(1))}` : '');
        else if (/^https?:/i.test(href)) attrs = ' target="_blank" rel="noopener noreferrer"';
        return `<a href="${esc(href)}"${token.title ? ` title="${esc(token.title)}"` : ''}${attrs}>${text}</a>`;
      },
      image(token) {
        return `<img src="${esc(assetUrl(token.href))}" alt="${esc(token.text || '')}"` +
          `${token.title ? ` title="${esc(token.title)}"` : ''} loading="lazy" decoding="async">`;
      }
    }
  });
  return m;
}

export async function ensureMarked() {
  if (marked$) return marked$;
  await loadScript('vendor/marked/marked.umd.js');
  marked$ = buildMarked();
  return marked$;
}

/** Parses a note body into HTML chunks (so the browser can skip off-screen chunks) + metadata. */
export function renderMarkdown(body, noteId, title) {
  S = { slug: MD.makeSlugger(), headings: [], noteId, preamble: [], math: false, chem: false };
  const tokens = marked$.lexer(body);
  // the first real token decides whether the note brings its own title (hidden macro blocks and comments don't count)
  const first = tokens.find((t) => t.type !== 'space' && !(t.type === 'mathBlock' && PREAMBLE_RE.test(t.text)) && !(t.type === 'html' && /^\s*<!--[\s\S]*-->\s*$/.test(t.raw)));
  if (!(first && first.type === 'heading' && first.depth === 1)) {
    tokens.unshift({ type: 'heading', raw: '', depth: 1, text: title, synthetic: true, tokens: [{ type: 'text', raw: title, text: title }] });
  }
  const groups = [];
  let cur = [], size = 0;
  for (const t of tokens) {
    const boundary = t.type === 'heading' && t.depth <= 3 && size > 2500;
    if (cur.length && (boundary || size > 9000)) { groups.push(cur); cur = []; size = 0; }
    cur.push(t); size += (t.raw || '').length;
  }
  if (cur.length) groups.push(cur);
  const chunks = groups.map((g) => `<section class="chunk">${marked$.parser(g)}</section>`);
  return { chunks, headings: S.headings, usesMath: S.math, chem: S.chem, preamble: S.preamble };
}

/** TOC / search labels: escapes text but keeps $math$ renderable. */
export function labelHtml(raw) {
  return esc(raw).replace(/\$([^$\n]+)\$/g, (m, tex) => `<span class="m" data-tex="${tex}"><code class="m-raw">${tex}</code></span>`);
}

/* ===================================================================== decorate */
const CALLOUT = {
  note: ['Note', 'blue'], info: ['Info', 'blue'], tip: ['Tip', 'green'], example: ['Example', 'green'],
  important: ['Important', 'yellow'], question: ['Think about it', 'yellow'],
  warning: ['Warning', 'red'], caution: ['Caution', 'red'], trap: ['Trap', 'red']
};

function chipColor(label) {
  const map = CFG.badgeColors || {};
  const k = label.toLowerCase();
  if (map[k]) return map[k];
  return MD.COLORS[[...k].reduce((a, c) => a + c.charCodeAt(0), 0) % 4];
}

function decorate(root) {
  root.querySelectorAll('table').forEach((t) => {
    if (t.parentElement.classList.contains('table-wrap')) return;
    const w = document.createElement('div'); w.className = 'table-wrap';
    t.replaceWith(w); w.appendChild(t);
  });

  root.querySelectorAll('blockquote').forEach((bq) => {
    const p = bq.firstElementChild;
    if (!p || p.tagName !== 'P') return;
    const node = p.firstChild;
    if (!node || node.nodeType !== 3) return;
    const r = /^\s*\[!(\w+)\][ \t]*\n?/.exec(node.nodeValue);
    if (!r || !CALLOUT[r[1].toLowerCase()]) return;
    const [label, color] = CALLOUT[r[1].toLowerCase()];
    node.nodeValue = node.nodeValue.slice(r[0].length);
    if (!node.nodeValue && node.nextSibling && node.nextSibling.nodeName === 'BR') node.nextSibling.remove();
    bq.classList.add('callout'); bq.dataset.c = color;
    const t = document.createElement('div'); t.className = 'callout-title'; t.textContent = label;
    bq.insertBefore(t, bq.firstChild);
  });

  if (CFG.chips !== false) {
    root.querySelectorAll('strong').forEach((s) => {
      const t = s.textContent;
      if (s.children.length || !/^\[[^\]\s][^\]]{0,14}\]$/.test(t)) return;
      s.className = 'chip'; s.dataset.c = chipColor(t.slice(1, -1)); s.textContent = t.slice(1, -1);
    });
  }

  root.querySelectorAll('li > input[type="checkbox"]').forEach((c) => c.parentElement.classList.add('task'));
}

/* ================================================================== lazy engines */
let MACROS = Object.assign({}, CFG.macros);
export function resetMacros() { MACROS = Object.assign({}, CFG.macros); }

let katexP = null, chemP = null, hljsP = null, mermaidP = null;
const ensureKatex = () => katexP || (katexP = Promise.all([
  loadStyle('vendor/katex/katex.min.css'), loadScript('vendor/katex/katex.min.js')
]));
const ensureChem = () => chemP || (chemP = ensureKatex().then(() => loadScript('vendor/katex/mhchem.min.js')));
const ensureHljs = () => hljsP || (hljsP = loadScript('vendor/hljs/highlight.min.js'));
const ensureMermaid = () => mermaidP || (mermaidP = import('../../vendor/mermaid/mermaid.esm.min.mjs').then((m) => m.default));

const needsChem = (tex) => /\\(?:ce|pu)\s*\{/.test(tex);

function renderMath(el) {
  el.dataset.r = '1';
  const tex = el.dataset.tex;
  try {
    el.innerHTML = window.katex.renderToString(tex, {
      displayMode: el.classList.contains('md'), throwOnError: false, trust: true, strict: 'ignore',
      macros: MACROS, output: CFG.mathOutput || 'html', errorColor: '#d9777a'
    });
    el.setAttribute('role', 'math');
    // KaTeX numbers rows with CSS counters, which content-visibility isolates per chunk; number them here instead.
    el.querySelectorAll('.eqn-num').forEach((n, i) => { n.dataset.n = i + 1; });
  } catch (err) {
    el.classList.add('m-err'); el.title = String(err && err.message || err);
  }
}

function renderCode(block) {
  block.dataset.r = '1';
  const lang = block.dataset.lang;
  if (!lang || lang === 'text' || lang === 'plain' || lang === 'txt') return;
  try { if (window.hljs.getLanguage(lang)) window.hljs.highlightElement(block.querySelector('code')); } catch { /* leave plain */ }
}

/* ---- mermaid ----
 * Look: filled pastel shapes, thick coloured borders, bold labels, tight padding — drawn from the site's
 * four accents. Flowchart nodes are coloured by shape; or pick a colour yourself with  A[Text]:::green
 * (green | blue | yellow | red). Subgraphs get dashed, tinted frames.                                   */
const PAL = {
  light: {
    k: { blue: ['#cfe1f7', '#3d78bf'], green: ['#c9ecd5', '#36895a'], yellow: ['#fbeeb4', '#bf951a'], red: ['#f9d2d3', '#cb5a5f'] },
    tint: { blue: '#eaf2fc', green: '#e8f6ee', yellow: '#fdf6d9', red: '#fcecec' },
    text: '#1c2521', line: '#46515c', bg: '#f8f9f8'
  },
  dark: {
    k: { blue: ['#2f4a6d', '#8db8f0'], green: ['#2f4d3c', '#8fd3a9'], yellow: ['#54492a', '#e8d07c'], red: ['#593332', '#f0a0a1'] },
    tint: { blue: '#262f3b', green: '#26322b', yellow: '#343022', red: '#382a2a' },
    text: '#f4f4f6', line: '#c4c9d1', bg: '#222224'
  }
};
const MM_SHAPES = ':is(rect,polygon,circle,ellipse,path)';
const MM_KINDS = ['blue', 'green', 'yellow', 'red'];

function mmVars(P) {
  const [bf, bs] = P.k.blue, [gf, gs] = P.k.green, [yf, ys] = P.k.yellow;
  return {
    fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px', background: 'transparent',
    primaryColor: bf, primaryBorderColor: bs, primaryTextColor: P.text,
    secondaryColor: gf, secondaryBorderColor: gs, secondaryTextColor: P.text,
    tertiaryColor: yf, tertiaryBorderColor: ys, tertiaryTextColor: P.text,
    textColor: P.text, lineColor: P.line, mainBkg: bf, nodeBorder: bs, nodeTextColor: P.text,
    clusterBkg: P.tint.blue, clusterBorder: bs, titleColor: P.text, edgeLabelBackground: P.bg,
    noteBkgColor: yf, noteTextColor: P.text, noteBorderColor: ys,
    actorBkg: bf, actorBorder: bs, actorTextColor: P.text, actorLineColor: P.line, signalColor: P.line, signalTextColor: P.text,
    labelBoxBkgColor: gf, labelBoxBorderColor: gs, labelTextColor: P.text, loopTextColor: P.text,
    activationBkgColor: gf, activationBorderColor: gs, sequenceNumberColor: P.text,
    classText: P.text, git0: bs, git1: gs, git2: ys, git3: P.k.red[1]
  };
}

function mmThemeCSS(P) {
  const t = P.text, l = P.line;
  let css = `
  .node ${MM_SHAPES}, .cluster rect, .cluster polygon { stroke-width: 2.8px; }
  .cluster rect { stroke-dasharray: 9 6; rx: 16px; ry: 16px; }
  .nodeLabel, .label, .label text, .label div, .label span, .cluster-label, .cluster-label span, .cluster-label text,
  .edgeLabel, .edgeLabel span, .edgeLabel p, .messageText, .noteText, .loopText, .labelText, .actor tspan, .titleText, .classTitle, .classLabel, .entityLabel
    { font-weight: 700; color: ${t}; fill: ${t}; }
  .messageText, .noteText, .noteText tspan, .loopText, .loopText tspan, .labelText, .labelText tspan, text.actor, .actor tspan, .messageText tspan { font-weight: 700 !important; }
  .nodeLabel p, .edgeLabel p { margin: 0; }
  .nodeLabel, .label foreignObject div { line-height: 1.3; }
  .flowchart-link, .edgePath .path, path.transition, path.relation, .messageLine0, .messageLine1, .edge-thickness-normal, .edge-thickness-thick, .relationshipLine, path.edge { stroke-width: 2.8px; }
  .arrowheadPath, .arrowMarkerPath, marker path, .marker { fill: ${l}; stroke: ${l}; }
  .edgeLabel, .edgeLabel rect, .labelBkg { background-color: ${P.bg}; fill: ${P.bg}; opacity: 1; }
  .edgeLabel span, .labelBkg span { border-radius: 7px; }
  .actor { stroke-width: 2.8px; rx: 10px; ry: 10px; }
  .note { stroke-width: 2.4px; }
  .loopLine { stroke-width: 2.2px; }
  .statediagram-cluster rect { stroke-width: 2.8px; }
  .divider { stroke-width: 2.4px; }
  .grid .tick { stroke-width: 1.5px; }
  `;
  MM_KINDS.forEach((k) => {
    const [f, st] = P.k[k];
    css += `.node[data-k="${k}"] ${MM_SHAPES} { fill: ${f}; stroke: ${st}; }\n` +
      `.cluster[data-k="${k}"] rect { fill: ${P.tint[k]}; stroke: ${st}; }\n`;
  });
  return css;
}

/** Makes  :::green  :::blue  :::yellow  :::red  available in flowcharts (user classDefs defined later still win). */
function withClasses(src, P) {
  const lines = src.split('\n');
  const i = lines.findIndex((x) => /^\s*(flowchart|graph)\b/.test(x));
  if (i < 0) return src;
  const defs = MM_KINDS.map((k) => `classDef ${k} fill:${P.k[k][0]},stroke:${P.k[k][1]},stroke-width:3px,color:${P.text}`);
  lines.splice(i + 1, 0, ...defs);
  return lines.join('\n');
}

/** Flowchart default colours by shape: rectangles blue, rounded green, decisions yellow, terminals red. */
function colorize(svg) {
  const role = svg.getAttribute('aria-roledescription') || '';
  if (!/flowchart|graph/.test(role)) return;
  svg.querySelectorAll('g.node').forEach((n) => {
    const extra = [...n.classList].filter((c) => !['node', 'default', 'clickable', 'flowchart-label'].includes(c));
    if (extra.length) return;
    const sh = n.querySelector('polygon, circle, ellipse, rect, path');
    if (!sh) return;
    const tag = sh.tagName.toLowerCase();
    n.dataset.k = tag === 'polygon' ? 'yellow' : (tag === 'circle' || tag === 'ellipse') ? 'red'
      : tag === 'rect' ? (parseFloat(sh.getAttribute('rx')) > 1 ? 'green' : 'blue') : 'green';
  });
  svg.querySelectorAll('g.cluster').forEach((c, i) => { c.dataset.k = MM_KINDS[i % 4]; });
}

/** Natural size (keeps bold text legible); shrinks only slightly to fit the column, then scrolls. */
function fitDiagram(box) {
  const svg = box.querySelector('.mm-svg svg');
  if (!svg) return;
  const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
  if (vb.length < 4 || !vb[2]) return;
  const avail = (box.clientWidth || 700) - 24;
  const w = Math.round(vb[2] * Math.max(0.7, Math.min(1, avail / vb[2])));
  svg.removeAttribute('width'); svg.removeAttribute('height');
  svg.style.width = w + 'px'; svg.style.height = Math.round(w * vb[3] / vb[2]) + 'px'; svg.style.maxWidth = 'none';
}

let mmTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
let mmApplied = null, mmId = 0, mmChain = Promise.resolve();

async function drawMermaid(box) {
  const mm = await ensureMermaid();
  const P = PAL[mmTheme];
  if (mmApplied !== mmTheme) {
    mm.initialize({
      startOnLoad: false, securityLevel: 'strict', theme: 'base', themeVariables: mmVars(P), themeCSS: mmThemeCSS(P),
      flowchart: { useMaxWidth: false, htmlLabels: true, curve: 'basis', padding: 11, nodeSpacing: 34, rankSpacing: 40, diagramPadding: 6, wrappingWidth: 240 },
      sequence: { useMaxWidth: false, diagramMarginX: 8, diagramMarginY: 8, boxMargin: 6, actorMargin: 40, messageMargin: 34, width: 130, height: 46, noteMargin: 8, boxTextMargin: 4 },
      state: { useMaxWidth: false, padding: 9 }, class: { useMaxWidth: false, padding: 9 }, er: { useMaxWidth: false },
      gantt: { useMaxWidth: false }, journey: { useMaxWidth: false }, mindmap: { useMaxWidth: false }
    });
    mmApplied = mmTheme;
  }
  const id = 'mm-' + (++mmId);
  try {
    const { svg } = await mm.render(id, withClasses(box.dataset.src, P));
    box.classList.remove('mm-err');
    box.innerHTML = `<div class="mm-svg">${svg}</div><button class="mm-expand icon-btn" type="button" aria-label="Expand diagram" title="Expand">${icon('maximize')}</button>`;
    const el = box.querySelector('.mm-svg svg');
    if (el) { colorize(el); fitDiagram(box); }
  } catch (err) {
    document.getElementById('d' + id)?.remove();
    box.classList.add('mm-err');
    box.innerHTML = `<div class="mm-error"><strong>This diagram could not be drawn.</strong><pre>${esc(String(err && err.message || err).split('\n').slice(0, 3).join('\n'))}</pre></div>`;
  }
}

function enqueueMermaid(box) {
  if (box.dataset.r) return;
  box.dataset.r = '1';
  mmChain = mmChain.then(() => (box.isConnected ? drawMermaid(box) : null)).catch(() => {});
}

/** Switch diagram colours; visible diagrams redraw now, the rest redraw when they scroll into range. */
export function setRenderTheme(theme) {
  if (theme === mmTheme) return;
  mmTheme = theme;
  document.querySelectorAll('.mermaid-box[data-r]').forEach((b) => {
    delete b.dataset.r;
    if (io) { io.unobserve(b); io.observe(b); }
  });
}

/* ---- observer + budgeted queue ---- */
const Q = { math: [], code: [] };
let io = null, pumping = false;

function getIO() {
  if (!io) {
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        queueEl(e.target);
      }
    }, { rootMargin: '900px 0px' });
  }
  return io;
}

function queueEl(el) {
  if (el.dataset.r) return;
  if (el.classList.contains('m')) {
    const chem = needsChem(el.dataset.tex);
    (chem ? ensureChem() : ensureKatex()).then(() => { Q.math.push(el); schedule(); }).catch(() => { el.classList.add('m-err'); });
  } else if (el.classList.contains('code-block')) {
    ensureHljs().then(() => { Q.code.push(el); schedule(); }).catch(() => { el.dataset.r = '1'; });
  } else {
    ensureMermaid().then(() => enqueueMermaid(el)).catch(() => {
      el.dataset.r = '1'; el.innerHTML = '<div class="mm-error"><strong>Diagram engine failed to load.</strong></div>';
    });
  }
}

function schedule() { if (!pumping) { pumping = true; requestAnimationFrame(pump); } }

function pump() {
  const t0 = performance.now();
  while (Q.math.length && performance.now() - t0 < 9) {
    const el = Q.math.shift();
    if (el.isConnected && !el.dataset.r) renderMath(el);
  }
  while (Q.code.length && performance.now() - t0 < 12) {
    const el = Q.code.shift();
    if (el.isConnected && !el.dataset.r) renderCode(el);
  }
  pumping = false;
  if (Q.math.length || Q.code.length) schedule();
}

/** Call on every freshly inserted chunk (or the TOC): decorates it and hands lazy items to the observer. */
export function enhance(root) {
  decorate(root);
  const obs = getIO();
  root.querySelectorAll('.m:not([data-o]), .code-block:not([data-o]), .mermaid-box:not([data-o])').forEach((el) => {
    el.dataset.o = '1'; obs.observe(el);
  });
}

/** Renders everything that is still pending (used before printing). */
export async function renderAllNow(root) {
  const math = Array.from(root.querySelectorAll('.m:not([data-r])'));
  if (math.length) {
    await (math.some((m) => needsChem(m.dataset.tex)) ? ensureChem() : ensureKatex());
    math.forEach(renderMath);
  }
  const code = Array.from(root.querySelectorAll('.code-block:not([data-r])'));
  if (code.length) { try { await ensureHljs(); code.forEach(renderCode); } catch { /* plain code is fine */ } }
  const mms = Array.from(root.querySelectorAll('.mermaid-box:not([data-r])'));
  if (mms.length) { try { await ensureMermaid(); mms.forEach(enqueueMermaid); } catch { /* ignore */ } }
  await mmChain;
}

/** Defines \newcommand-style macros found in "preamble" $$ blocks before anything renders. */
function toGlobalDefs(src) {
  return src
    .replace(/\\(?:re)?newcommand\*?\s*\{?\s*(\\[A-Za-z]+|\\.)\s*\}?\s*(?:\[(\d)\])?/g,
      (m, name, n) => '\\gdef' + name + (n ? Array.from({ length: +n }, (_, i) => '#' + (i + 1)).join('') : ''))
    .replace(/\\providecommand\*?\s*\{?\s*(\\[A-Za-z]+)\s*\}?\s*(?:\[(\d)\])?/g,
      (m, name, n) => '\\gdef' + name + (n ? Array.from({ length: +n }, (_, i) => '#' + (i + 1)).join('') : ''))
    .replace(/\\DeclareMathOperator(\*?)\s*\{(\\[A-Za-z]+)\}\s*\{([^}]*)\}/g,
      (m, star, name, body) => `\\gdef${name}{\\operatorname${star}{${body}}}`)
    .replace(/\\def(?![A-Za-z])/g, '\\gdef');
}

export async function prepareMath(info) {
  resetMacros();
  if (!info.preamble.length) return;
  await (info.chem ? ensureChem() : ensureKatex());
  for (const src of info.preamble) {
    try {
      window.katex.renderToString(toGlobalDefs(src), { displayMode: true, throwOnError: false, trust: true, strict: 'ignore', macros: MACROS });
    } catch { /* a bad macro shows up where it is used */ }
  }
}

/** Idle-time warm-up so the first note opens quickly. */
export function warm() { ensureMarked().catch(() => {}); }
