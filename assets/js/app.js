/*  app.js — router, library view, reader view, theme, printing.  */
import { $, $$, esc, icon, store, rafThrottle, idle, relTime, fmtDate, parseDate, formatCount, toast, copyText } from './util.js';
import { ensureMarked, renderMarkdown, enhance, renderAllNow, setRenderTheme, prepareMath, labelHtml, warm } from './render.js';
import { createSearch } from './search.js';
import { createAnnotator } from './annotate.js';

const CFG = window.SITE_CONFIG || {};
const MD = window.MDMeta;
const app = $('#app');

const state = {
  notes: new Map(),     // id → meta (merged: manifest first, then fresh values from the worker)
  entries: [],          // [{ id, file, url }]
  loaded: false,
  error: null,
  tag: null,
  homeScroll: 0,
  reader: null          // live reader instance, if one is open
};

/* ======================================================================= theme */
function currentTheme() { return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'; }
function applyTheme(theme, persist = true) {
  const root = document.documentElement;
  root.classList.add('theming');
  root.dataset.theme = theme;
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#222224' : '#f8f9f8';
  if (persist) store.set('mg:theme', theme);
  setRenderTheme(theme);
  setTimeout(() => root.classList.remove('theming'), 250);
}
$('#themeBtn').addEventListener('click', () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'));

/* ====================================================================== search */
const search = createSearch({
  getNotes: () => sortedNotes(),
  go: (id, h) => navigate(id, h)
});
$('#searchOpen').addEventListener('click', () => search.open());
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
$('#searchKbd').textContent = isMac ? '⌘K' : 'Ctrl K';

document.addEventListener('keydown', (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
  if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); search.isOpen() ? search.close() : search.open(); }
  else if (e.key === '/' && !typing && !search.isOpen()) { e.preventDefault(); search.open(); }
  else if ((e.key === 'p' || e.key === 'P') && (e.metaKey || e.ctrlKey) && state.reader) { e.preventDefault(); state.reader.print(); }
});

/* ===================================================================== helpers */
function navigate(id, h) {
  location.hash = `#/n/${encodeURIComponent(id)}` + (h ? `?h=${encodeURIComponent(h)}` : '');
}

function parseHash() {
  const m = /^#\/n\/([^?]+)(?:\?h=(.*))?$/.exec(location.hash);
  if (m) {
    let id = m[1], h = m[2] || null;
    try { id = decodeURIComponent(id); if (h) h = decodeURIComponent(h); } catch { /* keep raw */ }
    return { view: 'note', id, h };
  }
  return { view: 'home' };
}

function sortedNotes() {
  return Array.from(state.notes.values()).sort((a, b) => {
    const ao = a.order, bo = b.order;
    if (ao != null && bo != null && ao !== bo) return ao - bo;
    if (ao != null && bo == null) return -1;
    if (ao == null && bo != null) return 1;
    const ad = parseDate(a.updated), bd = parseDate(b.updated);
    if (ad && bd && ad - bd) return bd - ad;
    return String(a.title).localeCompare(String(b.title));
  });
}

/** Fresh values (from the worker / the note itself) win, but never blank out a known update date. */
function mergeMeta(prev, fresh) {
  return Object.assign({}, prev, fresh, { pending: false, updated: fresh.updated || (prev && prev.updated) || '' });
}

function setTitle(t) { document.title = t ? `${t} · ${CFG.pageTitle || CFG.name || 'Notes'}` : (CFG.pageTitle || CFG.name || 'Notes'); }

/* ================================================================== manifest */
async function loadManifest() {
  let res;
  try { res = await fetch(CFG.manifest || 'content/manifest.json', { cache: 'no-cache' }); }
  catch (err) { throw Object.assign(new Error('fetch'), { kind: location.protocol === 'file:' ? 'file' : 'network' }); }
  if (!res.ok) throw Object.assign(new Error('http'), { kind: 'missing', status: res.status });
  const data = await res.json();
  const list = Array.isArray(data) ? data : (data.notes || []);
  const dir = CFG.contentDir || 'content/';
  list.forEach((raw) => {
    const e = typeof raw === 'string' ? { file: raw } : raw;
    if (!e || !e.file) return;
    const id = e.id || MD.idFromFile(e.file);
    // absolute, because the search worker lives in another folder and would resolve a relative path against itself
    const url = new URL(dir + e.file.split('/').map(encodeURIComponent).join('/') + (e.v ? `?v=${e.v}` : ''), document.baseURI).href;
    state.entries.push({ id, file: e.file, url });
    const hasMeta = e.title !== undefined;
    state.notes.set(id, Object.assign({ id, file: e.file, url, title: e.file.replace(/\.md$/i, ''), pending: !hasMeta, tags: [], color: 'blue', outline: [] }, hasMeta ? e : {}, { id, url }));
  });
}

/* ==================================================================== library */
function cardHtml(n) {
  if (n.pending) {
    return `<div class="card skel" aria-hidden="true"><div class="card-head"><div class="tile sk"></div><div class="sk" style="flex:1"></div></div><div class="sk"></div><div class="sk" style="width:70%"></div></div>`;
  }
  const upd = parseDate(n.updated);
  return `<a class="card" href="#/n/${encodeURIComponent(n.id)}" data-c="${esc(n.color)}" data-id="${esc(n.id)}">
    <div class="card-head"><span class="tile">${icon('file')}</span><span class="card-title">${esc(n.title)}</span></div>
    ${n.summary ? `<p class="card-sum">${esc(n.summary)}</p>` : ''}
    ${n.outline && n.outline.length ? `<ul class="card-outline">${n.outline.slice(0, 4).map((o) => `<li><span>${esc(o)}</span></li>`).join('')}</ul>` : ''}
    ${n.tags && n.tags.length ? `<div class="card-tags">${n.tags.slice(0, 4).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
    <div class="card-foot"><span>${n.minutes || 1} min read</span><span>${n.sections || 0} sections</span>${upd ? `<span>Updated ${esc(fmtDate(upd))}</span>` : ''}</div>
  </a>`;
}

function homeHtml() {
  const notes = sortedNotes();
  const words = notes.reduce((a, n) => a + (n.words || 0), 0);
  const tags = Array.from(new Set(notes.flatMap((n) => n.tags || []))).sort((a, b) => a.localeCompare(b));
  const shown = state.tag ? notes.filter((n) => (n.tags || []).includes(state.tag)) : notes;
  const pending = notes.some((n) => n.pending);
  return `<div class="home"><div class="home-bg" aria-hidden="true"></div>
    <section class="hero">
      <h1>${esc(CFG.heroTitle || 'Notes')}</h1>
      ${CFG.heroText ? `<p>${esc(CFG.heroText)}</p>` : ''}
      <div class="hero-stats"><span>${notes.length} ${notes.length === 1 ? 'note' : 'notes'}</span>${pending ? '' : `<span>${formatCount(words)} words</span>`}</div>
    </section>
    <div class="toolbar" role="group" aria-label="Filter by tag">${tags.length ? `<button class="chip-btn" type="button" data-tag="" aria-pressed="${!state.tag}">All</button>` + tags.map((t) => `<button class="chip-btn" type="button" data-tag="${esc(t)}" aria-pressed="${state.tag === t}">${esc(t)}</button>`).join('') : ''}</div>
    <div class="grid" id="grid">${shown.map(cardHtml).join('')}</div>
  </div>`;
}

function notice(title, bodyHtml) {
  app.innerHTML = `<div class="notice"><h2>${esc(title)}</h2>${bodyHtml}</div>`;
}

function showHome() {
  closeReader();
  document.body.dataset.view = 'home';
  setTitle('');
  if (state.error) {
    const k = state.error.kind;
    if (k === 'file') notice('Open this site through a web server', '<p>Browsers block loading local files directly. From this folder run:</p><p><code>python3 -m http.server 8000</code></p><p>then visit <code>http://localhost:8000</code>.</p>');
    else if (k === 'missing') notice('No manifest found', `<p>Create <code>${esc(CFG.manifest)}</code> — run <code>node tools/build-manifest.mjs</code> or list your files by hand.</p>`);
    else notice('Could not load your notes', '<p>Check your connection and reload.</p>');
    return;
  }
  if (!state.loaded) { app.innerHTML = `<div class="home"><div class="home-bg" aria-hidden="true"></div><section class="hero"><h1>${esc(CFG.heroTitle || '')}</h1></section><div class="grid"><div class="card skel"><div class="sk"></div><div class="sk"></div></div><div class="card skel"><div class="sk"></div><div class="sk"></div></div></div></div>`; return; }
  if (!state.notes.size) { notice('No notes yet', `<p>Add a <code>.md</code> file to <code>${esc(CFG.contentDir)}</code>, list it in <code>manifest.json</code> and reload.</p>`); return; }
  app.innerHTML = homeHtml();
  requestAnimationFrame(() => window.scrollTo(0, state.homeScroll || 0));
}

let homeRefresh = 0;
function refreshHome() {
  if (parseHash().view !== 'home' || !state.loaded || state.error) return;
  cancelAnimationFrame(homeRefresh);
  homeRefresh = requestAnimationFrame(() => {
    const y = window.scrollY;
    app.innerHTML = homeHtml();
    window.scrollTo(0, y);
  });
}

app.addEventListener('click', (e) => {
  const t = e.target.closest('[data-tag]');
  if (t) { state.tag = t.dataset.tag || null; refreshHome(); }
});
app.addEventListener('pointerover', (e) => {
  const c = e.target.closest && e.target.closest('a.card');
  if (c && !c.dataset.warm) { c.dataset.warm = '1'; const n = state.notes.get(c.dataset.id); if (n && n.url) fetch(n.url).catch(() => {}); warm(); }
});
window.addEventListener('scroll', rafThrottle(() => {
  if (document.body.dataset.view === 'home') $('#siteHeader').classList.toggle('scrolled', window.scrollY > 8);
}), { passive: true });

/* ===================================================================== reader */
function closeReader() {
  if (state.reader) { state.reader.destroy(); state.reader = null; }
}

async function openNote(id, headingId) {
  const sameNote = state.reader && state.reader.id === id;
  if (sameNote) { state.reader.jump(headingId, { smooth: false, push: false }); return; }
  if (document.body.dataset.view === 'home') state.homeScroll = window.scrollY;
  closeReader();
  document.body.dataset.view = 'note';
  window.scrollTo(0, 0);

  const entry = state.entries.find((e) => e.id === id);
  if (!entry) {
    notice('Note not found', `<p>There is no note called <code>${esc(id)}</code>.</p><p><a href="#/">Back to the library</a></p>`);
    return;
  }
  const meta = state.notes.get(id);
  setTitle(meta && !meta.pending ? meta.title : '');
  const reader = new Reader(id, entry, meta);
  state.reader = reader;
  try { await reader.load(headingId); }
  catch (err) {
    if (state.reader !== reader) return;
    console.error(err);
    notice('This note could not be opened', `<p>${esc(err.message || 'Unknown error')}</p><p><a href="#/">Back to the library</a></p>`);
  }
}

class Reader {
  constructor(id, entry, meta) {
    this.id = id; this.entry = entry; this.meta = meta || { title: id };
    this.dead = false; this.headings = []; this.cleanup = []; this.active = -1;
    this.pinned = store.get('mg:pin', window.innerWidth > 1000);
  }

  on(target, type, fn, opts) { target.addEventListener(type, fn, opts); this.cleanup.push(() => target.removeEventListener(type, fn, opts)); }

  shell() {
    const updated = parseDate(this.meta.updated);
    app.innerHTML = `
    <div class="reader ${this.pinned ? 'pinned' : ''}" id="reader">
      <div class="rail" id="rail" aria-hidden="true"></div>
      <nav class="toc" id="toc" aria-label="Table of contents">
        <div class="toc-head"><h2>Table of Contents</h2>
          <button class="icon-btn toc-pin" id="pinBtn" type="button" aria-pressed="${this.pinned}" aria-label="Pin table of contents" title="Pin table of contents">${icon('pin')}</button></div>
        <div class="toc-tabs" role="tablist"><button class="toc-tab" role="tab" data-tab="toc" aria-selected="true">Contents</button><button class="toc-tab" role="tab" data-tab="ann" aria-selected="false">Notes <span id="annCount"></span></button></div>
        <div class="toc-body" id="tocBody"><ol class="toc-list" id="tocList"></ol></div>
        <div class="toc-body" id="annBody" hidden></div>
      </nav>
      <div class="scrim" id="scrim"></div>
      <div class="doc-wrap">
        <header class="topbar">
          <a class="back" href="#/" aria-label="Back to library">${icon('back')}<span>Library</span></a>
          <div class="status"><svg aria-hidden="true"><use href="#logo"/></svg><span>${updated ? 'Changed ' + esc(relTime(updated)) : esc(this.meta.title || '')}</span></div>
          <span class="sp"></span>
          <button class="icon-btn" id="btnSearch" type="button" aria-label="Search" title="Search (/)">${icon('search')}</button>
          <button class="icon-btn" id="btnAnn" type="button" aria-pressed="false" aria-label="Annotate" title="Annotate: highlight and add notes">${icon('highlighter')}</button>
          <button class="icon-btn" id="btnPrint" type="button" aria-label="Print or save as PDF" title="Print / save as PDF">${icon('print')}</button>
          <button class="icon-btn theme-btn" id="btnTheme" type="button" aria-label="Toggle theme" title="Toggle theme"><svg class="i i-sun" aria-hidden="true"><use href="#i-sun"/></svg><svg class="i i-moon" aria-hidden="true"><use href="#i-moon"/></svg></button>
          <button class="icon-btn" id="btnToc" type="button" aria-label="Table of contents" title="Table of contents">${icon('panel')}</button>
          <div class="progress" aria-hidden="true"><i id="progress"></i></div>
        </header>
        <article class="doc" id="doc" aria-label="${esc(this.meta.title || '')}"><div class="doc-skel"><div class="sk" style="height:34px;width:70%"></div><div class="sk"></div><div class="sk"></div><div class="sk" style="width:80%"></div></div></article>
      </div>
    </div>`;
    this.el = $('#reader'); this.doc = $('#doc'); this.toc = $('#toc'); this.rail = $('#rail');
  }

  async load(headingId) {
    this.shell();
    this.wire();
    const [res] = await Promise.all([fetch(this.entry.url), ensureMarked()]);
    if (!res.ok) throw new Error(`Could not read ${this.entry.file} (HTTP ${res.status}).`);
    const text = await res.text();
    if (this.dead) return;

    const parsed = MD.parseNote(text, this.id, this.entry.file);
    this.meta = mergeMeta(this.meta, parsed.meta);
    state.notes.set(this.id, mergeMeta(state.notes.get(this.id), parsed.meta));
    setTitle(this.meta.title);
    const info = renderMarkdown(parsed.body, this.id, this.meta.title);
    await prepareMath(info);
    if (this.dead) return;

    this.headings = info.headings;
    this.buildToc();

    // first chunks immediately, the rest in idle batches so the page paints fast
    this.doc.innerHTML = '';
    const insert = (html) => {
      this.doc.insertAdjacentHTML('beforeend', html);
      enhance(this.doc.lastElementChild);
    };
    const chunks = info.chunks;
    const firstBatch = headingId ? chunks.length : 2;
    chunks.slice(0, firstBatch).forEach(insert);
    let i = firstBatch;
    await new Promise((resolve) => {
      const step = () => {
        if (this.dead) return resolve();
        const t0 = performance.now();
        while (i < chunks.length && performance.now() - t0 < 8) insert(chunks[i++]);
        if (i < chunks.length) requestAnimationFrame(step); else resolve();
      };
      step();
    });
    if (this.dead) return;

    this.observeHeadings();
    this.annotator = createAnnotator({ root: this.doc, noteId: this.id, onChange: (l) => this.renderAnnotations(l) });
    this.annotator.onMode((on) => { $('#btnAnn').setAttribute('aria-pressed', String(on)); });
    this.annotator.mount();
    this.jump(headingId, { smooth: false, push: false });
  }

  /* ------------------------------------------------------------- toc + rail */
  buildToc() {
    const depth = CFG.tocDepth || 4;
    const hs = this.headings.filter((h) => h.depth <= depth);
    this.tocHeads = hs;
    const minD = hs.reduce((a, h) => Math.min(a, h.depth), 9);
    const base = `#/n/${encodeURIComponent(this.id)}?h=`;
    $('#tocList').innerHTML = hs.map((h, i) =>
      `<li><a href="${base}${encodeURIComponent(h.id)}" data-i="${i}" style="--l:${h.depth - minD}"><span class="t">${labelHtml(h.label)}</span></a></li>`).join('');
    enhance($('#tocList'));

    const railHs = hs.map((h, i) => ({ h, i })).filter((x) => x.h.depth <= 3);
    const avail = Math.max(120, window.innerHeight - 60);
    const th = Math.max(4, Math.min(12, Math.floor(avail / Math.max(1, railHs.length))));
    this.rail.style.setProperty('--th', th + 'px');
    this.rail.innerHTML = railHs.map(({ h, i }) => `<button class="tick" type="button" data-i="${i}" data-d="${h.depth}" tabindex="-1" aria-label="${esc(h.text)}"></button>`).join('');
  }

  setActive(i) {
    if (i === this.active) return;
    this.active = i;
    $$('.toc-list a[aria-current]', this.toc).forEach((a) => a.removeAttribute('aria-current'));
    $$('.tick.on', this.rail).forEach((t) => t.classList.remove('on'));
    const a = $(`.toc-list a[data-i="${i}"]`, this.toc);
    if (a) {
      a.setAttribute('aria-current', 'true');
      const body = $('#tocBody'), top = a.offsetTop, bottom = top + a.offsetHeight;
      if (top < body.scrollTop + 8) body.scrollTop = Math.max(0, top - 40);
      else if (bottom > body.scrollTop + body.clientHeight - 8) body.scrollTop = bottom - body.clientHeight + 40;
    }
    let t = $(`.tick[data-i="${i}"]`, this.rail);
    if (!t) { // active heading is deeper than the rail shows: highlight the nearest shallower tick above it
      for (let k = i - 1; k >= 0 && !t; k--) t = $(`.tick[data-i="${k}"]`, this.rail);
    }
    if (t) t.classList.add('on');
  }

  observeHeadings() {
    const els = this.tocHeads.map((h) => { try { return this.doc.querySelector('#' + CSS.escape(h.id)); } catch { return null; } });
    const index = new Map();
    els.forEach((el, i) => { if (el) index.set(el, i); });
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const i = index.get(e.target);
        if (i === undefined) continue;
        if (e.isIntersecting) visible.add(i);
        else {
          visible.delete(i);
          if (e.boundingClientRect.top < 0 && !visible.size) this.setActive(i);
          else if (e.boundingClientRect.top >= 0 && this.active === i) this.setActive(Math.max(0, i - 1));
        }
      }
      if (visible.size) this.setActive(Math.min(...visible));
    }, { rootMargin: '-70px 0px -68% 0px' });
    els.forEach((el) => el && io.observe(el));
    this.cleanup.push(() => io.disconnect());
    if (els.length) this.setActive(0);
  }

  /* ------------------------------------------------------------- navigation */
  jump(id, { smooth = true, push = true } = {}) {
    if (!id) { if (!smooth) window.scrollTo(0, 0); else window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const find = (x) => { try { return this.doc.querySelector('#' + CSS.escape(x)); } catch { return null; } };
    const el = find(id) || find(MD.slugify(id));
    if (!el) { toast('That section could not be found'); return; }
    const go = () => {
      const y = el.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
    };
    go();
    // chunks above may still be measuring (content-visibility); settle the position
    if (!smooth) { requestAnimationFrame(go); setTimeout(go, 120); }
    if (/^h[1-6]$/i.test(el.tagName)) { el.classList.remove('flash-h'); void el.offsetWidth; el.classList.add('flash-h'); setTimeout(() => el.classList.remove('flash-h'), 1800); }
    if (push) history.replaceState(null, '', `#/n/${encodeURIComponent(this.id)}?h=${encodeURIComponent(el.id)}`);
    if (this.el.classList.contains('toc-open') && !this.pinned) this.setToc(false);
  }

  /* ------------------------------------------------------------- panels */
  setToc(open) {
    this.el.classList.toggle('toc-open', open);
    $('#btnToc').setAttribute('aria-expanded', String(open));
  }

  setPinned(v) {
    this.pinned = v; store.set('mg:pin', v);
    this.el.classList.toggle('pinned', v);
    $('#pinBtn').setAttribute('aria-pressed', String(v));
    if (v) this.setToc(false);
  }

  showTab(tab) {
    $$('.toc-tab', this.toc).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    $('#tocBody').hidden = tab !== 'toc';
    $('#annBody').hidden = tab !== 'ann';
  }

  renderAnnotations(list) {
    const body = $('#annBody');
    if (!body) return;
    $('#annCount').textContent = list.length ? `(${list.length})` : '';
    const tools = `<div class="ann-tools"><button class="btn" type="button" data-a="export">${icon('download')}Export</button><button class="btn" type="button" data-a="import">${icon('upload')}Import</button><button class="btn danger" type="button" data-a="clear">${icon('trash')}Clear</button></div>`;
    body.innerHTML = (list.length
      ? `<ul class="ann-list">${list.map((a) => `<li><button class="ann-item${a.orphan ? ' orphan' : ''}" type="button" data-id="${esc(a.id)}" data-c="${esc(a.c)}"><div class="ann-q">${esc(a.q)}</div>${a.note ? `<div class="ann-n">${esc(a.note)}</div>` : ''}</button></li>`).join('')}</ul>`
      : `<p class="ann-empty">No highlights yet. Press the highlighter in the top bar, then select text. Highlights and notes are saved in this browser.</p>`) + tools;
  }

  /* ------------------------------------------------------------- print */
  async print() {
    if (this.printing) return;
    this.printing = true;
    toast('Preparing PDF…');
    const theme = currentTheme();
    try {
      if (theme === 'dark') setRenderTheme('light');
      this.annotator && this.annotator.setMode(false);
      $$('img', this.doc).forEach((im) => { im.loading = 'eager'; });
      await renderAllNow(this.doc);
      await Promise.all($$('img', this.doc).map((im) => im.complete ? 1 : new Promise((r) => { im.onload = im.onerror = r; setTimeout(r, 2500); })));
      const prevTitle = document.title;
      document.title = this.meta.title || prevTitle;
      const restore = () => { document.title = prevTitle; if (theme === 'dark') setRenderTheme('dark'); this.printing = false; window.removeEventListener('afterprint', restore); };
      window.addEventListener('afterprint', restore);
      await new Promise((r) => setTimeout(r, 60));
      window.print();
      if (!('onafterprint' in window)) restore();
    } catch (err) {
      console.error(err); toast('Could not prepare the PDF');
      if (theme === 'dark') setRenderTheme('dark');
      this.printing = false;
    }
  }

  /* ------------------------------------------------------------- diagram lightbox */
  openDiagram(box) {
    const svg = box.querySelector('.mm-svg svg');
    if (!svg) return;
    const lb = document.createElement('div');
    lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Diagram');
    lb.innerHTML = `<div class="lb-bar"><button class="icon-btn" data-z="out" aria-label="Zoom out">${icon('minus')}</button><span class="lb-zoom">100%</span><button class="icon-btn" data-z="in" aria-label="Zoom in">${icon('plus')}</button><button class="btn" data-z="fit">Fit</button><span class="sp"></span><button class="icon-btn" data-z="close" aria-label="Close">${icon('x')}</button></div><div class="lb-stage"></div>`;
    const stage = lb.querySelector('.lb-stage');
    const clone = svg.cloneNode(true);
    clone.removeAttribute('style'); clone.removeAttribute('width'); clone.removeAttribute('height');
    stage.appendChild(clone);
    document.body.appendChild(lb);
    document.documentElement.classList.add('modal-open');
    const vb = (clone.getAttribute('viewBox') || '0 0 800 600').split(/\s+/).map(Number);
    const base = vb[2] || 800;
    const fit = () => Math.min(2, (stage.clientWidth - 56) / base);
    let zoom = fit();
    const apply = () => { clone.style.width = Math.round(base * zoom) + 'px'; lb.querySelector('.lb-zoom').textContent = Math.round(zoom * 100) + '%'; };
    apply();
    const close = () => { lb.remove(); document.documentElement.classList.remove('modal-open'); document.removeEventListener('keydown', onKey, true); };
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    document.addEventListener('keydown', onKey, true);
    lb.addEventListener('click', (e) => {
      const z = e.target.closest('[data-z]'); if (!z) return;
      const k = z.dataset.z;
      if (k === 'close') close();
      else { zoom = k === 'in' ? Math.min(6, zoom * 1.25) : k === 'out' ? Math.max(.2, zoom / 1.25) : fit(); apply(); }
    });
    stage.addEventListener('wheel', (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault(); zoom = Math.max(.2, Math.min(6, zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1))); apply();
    }, { passive: false });
  }

  /* ------------------------------------------------------------- wiring */
  wire() {
    const el = this.el;
    // pin / unpin
    $('#pinBtn').addEventListener('click', () => this.setPinned(!this.pinned));
    $('#btnToc').addEventListener('click', () => {
      if (window.innerWidth > 1000) this.setPinned(!this.pinned); else this.setToc(!el.classList.contains('toc-open'));
    });
    $('#scrim').addEventListener('click', () => this.setToc(false));
    $('#btnSearch').addEventListener('click', () => search.open());
    $('#btnTheme').addEventListener('click', () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
    $('#btnPrint').addEventListener('click', () => this.print());
    $('#btnAnn').addEventListener('click', () => {
      if (!this.annotator) return;
      const on = !this.annotator.isOn();
      this.annotator.setMode(on);
      if (on) { this.showTab('ann'); if (window.innerWidth > 1000 && !this.pinned) this.setToc(false); toast('Select text to highlight it'); }
    });

    // hover the rail to peek at the contents when unpinned
    let closeT = 0;
    const open = () => { if (this.pinned || window.innerWidth <= 1000) return; clearTimeout(closeT); this.setToc(true); };
    const delayClose = () => { if (this.pinned) return; clearTimeout(closeT); closeT = setTimeout(() => this.setToc(false), 260); };
    this.rail.addEventListener('mouseenter', open);
    this.toc.addEventListener('mouseenter', () => clearTimeout(closeT));
    this.rail.addEventListener('mouseleave', delayClose);
    this.toc.addEventListener('mouseleave', delayClose);
    this.cleanup.push(() => clearTimeout(closeT));
    this.rail.addEventListener('click', (e) => {
      const t = e.target.closest('.tick'); if (!t) return;
      const h = this.tocHeads[+t.dataset.i]; if (h) this.jump(h.id);
    });
    // rail ticks are pointer-only; the contents list is the accessible equivalent

    this.toc.addEventListener('click', (e) => {
      const tab = e.target.closest('.toc-tab');
      if (tab) { this.showTab(tab.dataset.tab); return; }
      const a = e.target.closest('.toc-list a');
      if (a) { e.preventDefault(); const h = this.tocHeads[+a.dataset.i]; if (h) this.jump(h.id); return; }
      const item = e.target.closest('.ann-item');
      if (item) { this.annotator.goTo(item.dataset.id); if (window.innerWidth <= 1000) this.setToc(false); return; }
      const act = e.target.closest('[data-a]');
      if (!act) return;
      if (act.dataset.a === 'export') this.annotator.exportJSON();
      else if (act.dataset.a === 'clear') this.annotator.clearAll();
      else if (act.dataset.a === 'import') {
        const f = document.createElement('input'); f.type = 'file'; f.accept = 'application/json,.json';
        f.onchange = async () => { const file = f.files[0]; if (!file) return; const n = this.annotator.importJSON(await file.text()); toast(n ? `Imported ${n} highlight${n === 1 ? '' : 's'}` : 'Nothing new to import'); };
        f.click();
      }
    });

    // in-document clicks: copy buttons, diagram expand, anchors, same-note links
    this.doc.addEventListener('click', (e) => {
      const copy = e.target.closest('.copy');
      if (copy) {
        const code = copy.closest('.code-block').querySelector('code').textContent;
        copyText(code).then(() => { copy.textContent = 'Copied'; setTimeout(() => { copy.textContent = 'Copy'; }, 1400); });
        return;
      }
      const ex = e.target.closest('.mm-expand');
      if (ex) { this.openDiagram(ex.closest('.mermaid-box')); return; }
      const a = e.target.closest('a[href^="#/n/"]');
      if (a) {
        const m = /^#\/n\/([^?]+)(?:\?h=(.*))?$/.exec(a.getAttribute('href'));
        if (m && decodeURIComponent(m[1]) === this.id) { e.preventDefault(); this.jump(m[2] ? decodeURIComponent(m[2]) : null); }
      }
    });

    // progress bar + header scroll state
    const prog = $('#progress');
    this.on(window, 'scroll', rafThrottle(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.setProperty('--p', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
    }), { passive: true });

    this.on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && !search.isOpen() && !document.querySelector('.lb, .pop')) {
        if (this.annotator && this.annotator.isOn()) this.annotator.setMode(false);
        else if (this.el.classList.contains('toc-open')) this.setToc(false);
      }
    });
  }

  destroy() {
    this.dead = true;
    this.cleanup.forEach((fn) => fn());
    if (this.annotator) this.annotator.destroy();
    document.querySelectorAll('.lb, .pop, .dock').forEach((n) => n.remove());
    document.body.classList.remove('annotating');
  }
}

/* ===================================================================== router */
async function route() {
  const r = parseHash();
  if (r.view === 'note') {
    if (!state.loaded && !state.error) { await bootPromise; }
    if (state.error) { showHome(); return; }
    openNote(r.id, r.h);
  } else {
    if (document.body.dataset.view === 'note') window.scrollTo(0, 0);
    showHome();
    if (document.body.dataset.view === 'home' && state.homeScroll) requestAnimationFrame(() => window.scrollTo(0, state.homeScroll));
  }
}
window.addEventListener('hashchange', route);

/* ====================================================================== boot */
$('#brandName').textContent = CFG.name || 'Notes';
setTitle('');

if (parseHash().view === 'home') showHome();

const bootPromise = (async () => {
  try {
    await loadManifest();
    state.loaded = true;
    // background indexing: card metadata for bare manifests + full-text search
    idle(() => search.start(state.entries, {
      onMeta: (id, meta) => {
        const prev = state.notes.get(id) || {};
        state.notes.set(id, mergeMeta(prev, meta));
        if (prev.pending || prev.title !== meta.title || prev.words !== meta.words) refreshHome();
      },
      onError: (id, msg) => { console.warn('Could not index', id, msg); const n = state.notes.get(id); if (n && n.pending) { n.pending = false; n.title = n.file; n.summary = 'This file could not be loaded.'; refreshHome(); } }
    }));
  } catch (err) {
    state.error = err;
  }
  idle(warm);
})();

bootPromise.then(route);
