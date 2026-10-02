/*  annotate.js — live highlights and margin notes.
 *  Anchoring: each highlight stores (block index, character offsets, quoted text). Offsets only count
 *  plain prose (equations, diagrams and code are skipped), so they stay valid whether or not lazy
 *  KaTeX / Mermaid / highlight.js rendering has happened yet. If a note file is edited later, a
 *  highlight is re-found by its quoted text; if that fails it is kept (greyed) in the list.        */
import { esc, icon, store, download, toast } from './util.js';

const BLOCK_SEL = 'p,li,h1,h2,h3,h4,h5,h6,td,th,dt,dd,summary,figcaption,blockquote';
const SKIP_SEL = '.m, .mermaid-box, .code-block, pre, script, style, svg, button, input, textarea, .callout-title';
const COLORS = ['yellow', 'green', 'blue', 'red'];
const uid = () => Math.random().toString(36).slice(2, 9);

export function createAnnotator({ root, noteId, onChange }) {
  const KEY = 'mg:ann:' + noteId;
  let items = (store.get(KEY, []) || []).filter((a) => a && a.id && Array.isArray(a.segs));
  let color = store.get('mg:annColor', 'yellow');
  let on = false, cache = null, dock = null, pop = null, persistTimer = 0;

  /* ---------------------------------------------------------------- text model */
  const blocks = () => cache || (cache = Array.from(root.querySelectorAll(BLOCK_SEL))
    .filter((b) => !b.closest('.mermaid-box, .m, .code-block')));

  function textMap(block) {
    const out = []; let pos = 0;
    const w = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const p = n.parentElement;
      if (!p || p.closest(SKIP_SEL) || p.closest(BLOCK_SEL) !== block) continue;
      const len = n.nodeValue.length;
      out.push({ node: n, start: pos, end: pos + len });
      pos += len;
    }
    return out;
  }
  const textOf = (map) => map.map((m) => m.node.nodeValue).join('');

  function segmentsFromRange(range) {
    const segs = [];
    blocks().forEach((b, bi) => {
      if (!range.intersectsNode(b)) return;
      const map = textMap(b);
      let s = null, e = null;
      for (const m of map) {
        const len = m.node.nodeValue.length;
        let cs, ce;
        try { cs = range.comparePoint(m.node, 0); ce = range.comparePoint(m.node, len); } catch { continue; }
        if (cs === 1 || ce === -1) continue;
        const a = cs === -1 ? range.startOffset : 0;
        const z = ce === 1 ? range.endOffset : len;
        if (z <= a) continue;
        if (s === null) s = m.start + a;
        e = m.start + z;
      }
      if (s !== null && e > s) {
        const t = textOf(map).slice(s, e);
        if (t.trim()) segs.push({ b: bi, s, e, t });
      }
    });
    return segs;
  }

  /* ---------------------------------------------------------------- DOM marks */
  function wrap(node, a, z, ann) {
    if (z <= a) return;
    const r = document.createRange();
    r.setStart(node, a); r.setEnd(node, z);
    const mk = document.createElement('mark');
    mk.className = 'ann' + (ann.note ? ' has-note' : '');
    mk.dataset.id = ann.id; mk.dataset.c = ann.c;
    try { r.surroundContents(mk); } catch { /* range crossed an element boundary: skip */ }
  }

  function applySeg(a, seg) {
    const bl = blocks();
    let b = bl[seg.b], map = b ? textMap(b) : [], s = seg.s, e = seg.e;
    if (!b || textOf(map).slice(s, e) !== seg.t) {
      let found = false;
      for (const bi of [seg.b, ...bl.keys()]) {
        const bb = bl[bi];
        if (!bb) continue;
        const mp = textMap(bb), i = textOf(mp).indexOf(seg.t);
        if (i >= 0) { b = bb; map = mp; s = i; e = i + seg.t.length; seg.b = bi; seg.s = s; seg.e = e; found = true; break; }
      }
      if (!found) return false;
    }
    const parts = map.filter((m) => m.end > s && m.start < e);
    for (let k = parts.length - 1; k >= 0; k--) {
      const m = parts[k];
      wrap(m.node, Math.max(s, m.start) - m.start, Math.min(e, m.end) - m.start, a);
    }
    return parts.length > 0;
  }

  function applyAnn(a) {
    let ok = false;
    for (const seg of a.segs) ok = applySeg(a, seg) || ok;
    a.orphan = !ok;
    return ok;
  }

  function unwrap(mk) {
    const p = mk.parentNode;
    if (!p) return;
    while (mk.firstChild) p.insertBefore(mk.firstChild, mk);
    p.removeChild(mk); p.normalize();
  }
  const marksOf = (id) => root.querySelectorAll(`mark.ann[data-id="${id}"]`);
  const unapply = (id) => marksOf(id).forEach(unwrap);

  /* ---------------------------------------------------------------- state */
  function flush() {
    clearTimeout(persistTimer);
    if (!items.length) store.del(KEY);
    else store.set(KEY, items.map(({ id, c, q, note, segs, ts }) => ({ id, c, q, note, segs, ts })));
  }
  function persist() { clearTimeout(persistTimer); persistTimer = setTimeout(flush, 150); }
  const list = () => items.map((a) => ({ id: a.id, c: a.c, q: a.q, note: a.note, orphan: !!a.orphan }));
  const emit = () => onChange && onChange(list());
  const find = (id) => items.find((a) => a.id === id);

  function create() {
    const sel = getSelection();
    if (!sel || !sel.rangeCount || sel.isCollapsed) { toast('Select some text first'); return null; }
    const range = sel.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return null;
    const segs = segmentsFromRange(range);
    if (!segs.length) { toast('Only plain text can be highlighted (not code or equations)'); return null; }
    const a = { id: uid(), c: color, q: segs.map((s) => s.t).join(' … ').slice(0, 280), segs, note: '', ts: Date.now() };
    sel.removeAllRanges();
    applyAnn(a);
    items.push(a); persist(); emit();
    return a;
  }

  function remove(id) {
    unapply(id);
    items = items.filter((a) => a.id !== id);
    persist(); emit();
  }

  function setColor(c) {
    color = c; store.set('mg:annColor', c);
    dock && dock.querySelectorAll('.swatch').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.c === c)));
  }

  function recolor(id, c) {
    const a = find(id); if (!a) return;
    a.c = c; marksOf(id).forEach((m) => { m.dataset.c = c; });
    persist(); emit();
  }

  /* ---------------------------------------------------------------- popover */
  function closePop() { if (pop) { pop.remove(); pop = null; } }

  function openPop(id, anchor) {
    closePop();
    const a = find(id); if (!a) return;
    pop = document.createElement('div');
    pop.className = 'pop'; pop.dataset.c = a.c; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Highlight note');
    pop.innerHTML = `<p class="pop-q">${esc(a.q)}</p><textarea placeholder="Add a note…" aria-label="Note"></textarea>` +
      `<div class="pop-row">${COLORS.map((c) => `<button class="swatch" type="button" data-c="${c}" role="radio" aria-checked="${c === a.c}" aria-label="${c}"></button>`).join('')}` +
      `<span class="sp"></span><button class="btn danger" type="button" data-act="del">${icon('trash')}Delete</button><button class="btn primary" type="button" data-act="done">Done</button></div>`;
    document.body.appendChild(pop);
    const ta = pop.querySelector('textarea');
    ta.value = a.note || '';
    const r = anchor.getBoundingClientRect();
    const w = pop.offsetWidth;
    pop.style.top = Math.round(r.bottom + scrollY + 8) + 'px';
    pop.style.left = Math.round(Math.max(12 + scrollX, Math.min(r.left + scrollX - 16, innerWidth + scrollX - w - 12))) + 'px';
    ta.addEventListener('input', () => {
      a.note = ta.value;
      marksOf(a.id).forEach((m) => m.classList.toggle('has-note', !!a.note.trim()));
      persist(); emit();
    });
    pop.addEventListener('click', (e) => {
      const sw = e.target.closest('.swatch'), act = e.target.closest('[data-act]');
      if (sw) { recolor(a.id, sw.dataset.c); pop.dataset.c = sw.dataset.c; pop.querySelectorAll('.swatch').forEach((b) => b.setAttribute('aria-checked', String(b === sw))); }
      else if (act && act.dataset.act === 'del') { closePop(); remove(a.id); }
      else if (act && act.dataset.act === 'done') closePop();
    });
    pop.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); closePop(); } });
    ta.focus({ preventScroll: true });
  }

  /* ---------------------------------------------------------------- dock + mode */
  function buildDock() {
    dock = document.createElement('div');
    dock.className = 'dock'; dock.setAttribute('role', 'toolbar'); dock.setAttribute('aria-label', 'Annotation tools');
    dock.style.userSelect = dock.style.webkitUserSelect = 'none';
    dock.innerHTML = COLORS.map((c) => `<button class="swatch" type="button" data-c="${c}" role="radio" aria-checked="${c === color}" aria-label="${c} highlighter"></button>`).join('') +
      `<span class="sep"></span><button class="btn primary" type="button" data-act="hl">${icon('highlighter')}Highlight</button>` +
      `<button class="btn" type="button" data-act="note">${icon('note')}Add note</button>` +
      `<button class="btn" type="button" data-act="undo" aria-label="Undo last highlight" title="Undo last highlight">${icon('undo')}</button>` +
      `<span class="sep"></span><button class="btn" type="button" data-act="done">Done</button>`;
    dock.addEventListener('mousedown', (e) => e.preventDefault()); // keep the text selection alive
    dock.addEventListener('click', (e) => {
      const sw = e.target.closest('.swatch'), act = e.target.closest('[data-act]');
      if (sw) setColor(sw.dataset.c);
      else if (act) {
        const k = act.dataset.act;
        if (k === 'hl') create();
        else if (k === 'note') { const a = create(); if (a) { const mk = marksOf(a.id)[0]; if (mk) openPop(a.id, mk); } }
        else if (k === 'undo') { const last = items[items.length - 1]; if (last) remove(last.id); else toast('Nothing to undo'); }
        else if (k === 'done') setMode(false);
      }
    });
    document.body.appendChild(dock);
  }

  function setMode(v) {
    on = !!v;
    document.body.classList.toggle('annotating', on);
    if (on && !dock) buildDock();
    if (!on && dock) { dock.remove(); dock = null; }
    modeListeners && modeListeners(on);
  }
  let modeListeners = null;

  /* ---------------------------------------------------------------- events */
  function onPointerUp(e) {
    if (!on || e.pointerType === 'touch') return;
    if (e.target.closest && e.target.closest('.dock, .pop')) return;
    setTimeout(() => {
      const sel = getSelection();
      if (sel && !sel.isCollapsed && root.contains(sel.anchorNode)) create();
    }, 12);
  }
  function onClick(e) {
    const mk = e.target.closest && e.target.closest('mark.ann');
    const sel = getSelection();
    if (mk && (!sel || sel.isCollapsed)) openPop(mk.dataset.id, mk);
  }
  function onDocDown(e) {
    if (pop && !pop.contains(e.target) && !(e.target.closest && e.target.closest('mark.ann'))) closePop();
  }
  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointerdown', onDocDown);
  root.addEventListener('click', onClick);

  /* ---------------------------------------------------------------- public api */
  return {
    mount() { cache = null; items.forEach(applyAnn); emit(); },
    setMode, isOn: () => on, onMode(fn) { modeListeners = fn; },
    list, remove, openPop,
    goTo(id) {
      const ms = marksOf(id);
      if (!ms.length) { toast('This highlight no longer matches the text'); return; }
      ms[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
      ms.forEach((m) => { m.classList.remove('flash'); void m.offsetWidth; m.classList.add('flash'); });
      setTimeout(() => ms.forEach((m) => m.classList.remove('flash')), 1700);
    },
    exportJSON() {
      if (!items.length) { toast('No highlights to export yet'); return; }
      download(`${noteId}-annotations.json`, JSON.stringify({
        note: noteId, exported: new Date().toISOString(),
        annotations: items.map(({ id, c, q, note, segs, ts }) => ({ id, c, q, note, segs, ts }))
      }, null, 2));
    },
    importJSON(text) {
      let data;
      try { data = JSON.parse(text); } catch { toast('That file is not valid JSON'); return 0; }
      const incoming = Array.isArray(data) ? data : data.annotations;
      let n = 0;
      (incoming || []).forEach((a) => {
        if (!a || !a.id || !Array.isArray(a.segs) || find(a.id)) return;
        const copy = { id: a.id, c: COLORS.includes(a.c) ? a.c : 'yellow', q: String(a.q || ''), note: String(a.note || ''), segs: a.segs, ts: a.ts || Date.now() };
        applyAnn(copy); items.push(copy); n++;
      });
      persist(); emit();
      return n;
    },
    clearAll() {
      if (!items.length) return;
      if (!confirm('Remove all highlights and notes on this page?')) return;
      items.forEach((a) => unapply(a.id));
      items = []; persist(); emit(); closePop();
    },
    destroy() {
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointerdown', onDocDown);
      root.removeEventListener('click', onClick);
      closePop(); setMode(false);
      flush();
    }
  };
}
