/*  search.js — command-palette style search over every note.
 *  The heavy lifting (fetching, parsing, matching) happens in indexer.worker.js.          */
import { esc, icon, debounce } from './util.js';

export function createSearch({ getNotes, go }) {
  let worker = null, failed = false, rid = 0;
  let progress = { done: 0, total: 0 };
  let modal = null, input, list, preview, statusEl;
  let items = [], sel = 0, lastFocus = null, handlers = {};

  /* ------------------------------------------------------------- worker */
  function start(entries, h) {
    handlers = h || {};
    if (!entries.length) return;
    try {
      worker = new Worker('assets/js/indexer.worker.js');
    } catch { failed = true; return; }
    progress = { done: 0, total: entries.length };
    worker.onerror = () => { failed = true; refreshStatus(); };
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'note') handlers.onMeta && handlers.onMeta(m.id, m.meta);
      else if (m.type === 'error') handlers.onError && handlers.onError(m.id, m.message);
      else if (m.type === 'progress') { progress = { done: m.done, total: m.total }; refreshStatus(); }
      else if (m.type === 'ready') { handlers.onReady && handlers.onReady(); if (isOpen() && input.value.trim().length >= 2) runSearch(); }
      else if (m.type === 'results' && m.rid === rid) showResults(m.results);
    };
    worker.postMessage({ type: 'init', entries, concurrency: 2 });
  }

  /* ------------------------------------------------------------- modal */
  function build() {
    modal = document.createElement('div');
    modal.className = 'sm'; modal.hidden = true;
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', 'Search notes');
    modal.innerHTML = `
      <div class="sm-scrim" data-close></div>
      <div class="sm-box">
        <div class="sm-head">
          ${icon('search')}
          <input type="text" id="smInput" role="combobox" aria-expanded="true" aria-controls="smList" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Search all notes" aria-label="Search all notes">
          <span class="sm-status" aria-live="polite"></span>
          <button class="icon-btn" type="button" data-close aria-label="Close search">${icon('x')}</button>
        </div>
        <div class="sm-body">
          <ul class="sm-list" id="smList" role="listbox" aria-label="Results"></ul>
          <div class="sm-preview" aria-live="polite"></div>
        </div>
        <div class="sm-foot">
          <span>${icon('updown')} Navigate</span><span>${icon('enter')} Open</span><span><kbd>Esc</kbd> Close</span>
        </div>
      </div>`;
    document.body.appendChild(modal);
    input = modal.querySelector('input'); list = modal.querySelector('.sm-list');
    preview = modal.querySelector('.sm-preview'); statusEl = modal.querySelector('.sm-status');

    const onInput = debounce(runSearch, 70);
    input.addEventListener('input', onInput);
    modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
    list.addEventListener('mousemove', (e) => {
      const b = e.target.closest('.res');
      if (b && +b.dataset.i !== sel) setSel(+b.dataset.i, false);
    });
    list.addEventListener('click', (e) => { const b = e.target.closest('.res'); if (b) choose(+b.dataset.i); });
    preview.addEventListener('click', (e) => { if (e.target.closest('[data-open]')) choose(sel); });
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setSel(Math.min(items.length - 1, sel + 1), true); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(Math.max(0, sel - 1), true); }
      else if (e.key === 'Enter' && document.activeElement === input) { e.preventDefault(); choose(sel); }
      else if (e.key === 'Tab') { e.preventDefault(); input.focus(); }
    });
  }

  const isOpen = () => !!modal && !modal.hidden;

  function open(prefill = '') {
    if (!modal) build();
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.documentElement.classList.add('modal-open');
    input.value = prefill;
    input.focus(); input.select();
    runSearch();
  }

  function close() {
    if (!isOpen()) return;
    modal.hidden = true;
    document.documentElement.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------- querying */
  function refreshStatus() {
    if (!statusEl) return;
    if (failed) { statusEl.textContent = 'Search unavailable'; return; }
    const q = input.value.trim();
    if (progress.done < progress.total) statusEl.textContent = `Indexing ${progress.done}/${progress.total}`;
    else statusEl.textContent = q.length >= 2 ? `${items.filter((i) => i.kind === 'sec').length} matches` : '';
  }

  function runSearch() {
    const q = input.value.trim();
    if (q.length < 2) { showDefault(); return; }
    if (failed || !worker) { showMessage('Search needs the indexer worker. Serve the site over http(s) and reload.'); return; }
    rid++;
    worker.postMessage({ type: 'search', q, rid });
  }

  function noteHits(q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return getNotes().filter((n) => {
      const hay = (n.title + ' ' + (n.tags || []).join(' ') + ' ' + (n.summary || '')).toLowerCase();
      return terms.every((t) => hay.includes(t));
    }).slice(0, 4).map((n) => ({ kind: 'note', note: n }));
  }

  function showDefault() {
    items = getNotes().map((n) => ({ kind: 'note', note: n }));
    renderList('All notes');
    refreshStatus();
  }

  function showResults(rs) {
    const q = input.value.trim();
    const notes = noteHits(q);
    items = notes.concat(rs.map((r) => Object.assign({ kind: 'sec' }, r)));
    if (!items.length) { showMessage(progress.done < progress.total ? 'Still indexing… results will appear as notes load.' : `Nothing matches “${q}”. Try fewer or different words.`); return; }
    renderList(null, notes.length);
    refreshStatus();
  }

  function showMessage(msg) {
    items = []; list.innerHTML = ''; preview.innerHTML = `<div class="sm-empty">${esc(msg)}</div>`;
    input.removeAttribute('aria-activedescendant'); refreshStatus();
  }

  /* ------------------------------------------------------------- rendering */
  function row(it, i) {
    if (it.kind === 'note') {
      const n = it.note;
      const kind = n.external ? 'New tab ↗' : 'Note';
      return `<li role="presentation"><button type="button" class="res" role="option" id="res-${i}" data-i="${i}" data-c="${esc(n.color || 'blue')}" aria-selected="false">` +
        `<div class="res-top"><span class="dot"></span><span>${kind}</span></div><div class="res-title">${esc(n.title)}</div>` +
        (n.summary ? `<div class="res-sn">${esc(n.summary)}</div>` : '') + '</button></li>';
    }
    const trail = (it.path || []).filter((x) => x !== it.noteTitle);
    const where = trail.length ? ` › ${esc(trail[trail.length - 1])}` : '';
    return `<li role="presentation"><button type="button" class="res" role="option" id="res-${i}" data-i="${i}" data-c="${esc(it.color)}" aria-selected="false">` +
      `<div class="res-top"><span class="dot"></span><span>${esc(it.noteTitle)}${where}</span></div>` +
      `<div class="res-title">${it.th}</div><div class="res-sn">${it.sn}</div></button></li>`;
  }

  function renderList(heading, noteCount) {
    let html = '';
    items.forEach((it, i) => {
      if (heading && i === 0) html += `<li class="sm-group" role="presentation">${esc(heading)}</li>`;
      if (!heading && i === 0 && noteCount) html += '<li class="sm-group" role="presentation">Notes</li>';
      if (!heading && i === noteCount) html += '<li class="sm-group" role="presentation">Sections</li>';
      html += row(it, i);
    });
    list.innerHTML = html;
    setSel(0, false);
    list.scrollTop = 0;
  }

  function setSel(i, scroll) {
    sel = i;
    list.querySelectorAll('.res[aria-selected="true"]').forEach((b) => b.setAttribute('aria-selected', 'false'));
    const b = list.querySelector(`.res[data-i="${i}"]`);
    if (b) {
      b.setAttribute('aria-selected', 'true');
      input.setAttribute('aria-activedescendant', b.id);
      if (scroll) b.scrollIntoView({ block: 'nearest' });
    }
    renderPreview(items[i]);
  }

  function renderPreview(it) {
    if (!it) { preview.innerHTML = ''; return; }
    if (it.kind === 'note') {
      const n = it.note;
      const openLabel = n.external ? 'Open in new tab' : 'Open note';
      preview.innerHTML = `<div class="pv-top" data-c="${esc(n.color || 'blue')}"><span class="dot"></span><span>${n.external ? 'New tab ↗' : 'Note'}</span></div>` +
        `<h3 class="pv-title">${esc(n.title)}</h3>` +
        (n.tags && n.tags.length ? `<div class="pv-tags" data-c="${esc(n.color || 'blue')}">${n.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : '') +
        `<p class="pv-text">${esc(n.summary || '')}</p>` +
        (n.outline && n.outline.length ? `<ul class="pv-list">${n.outline.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>` : '') +
        `<button type="button" class="btn primary" data-open>${openLabel} ${icon('enter')}</button>`;
    } else {
      const trail = (it.path || []).filter((x) => x !== it.noteTitle);
      preview.innerHTML = `<div class="pv-top" data-c="${esc(it.color)}"><span class="dot"></span><span>${esc(it.noteTitle)}</span></div>` +
        (trail.length ? `<div class="pv-path">${trail.map(esc).join(' › ')}</div>` : '') +
        `<h3 class="pv-title">${it.th}</h3><p class="pv-text">${it.pv}</p>` +
        `<button type="button" class="btn primary" data-open>Open section ${icon('enter')}</button>`;
    }
    preview.scrollTop = 0;
  }

  function choose(i) {
    const it = items[i];
    if (!it) return;
    // external pages open directly in a new tab (synchronous: popup-safe)
    if (it.kind === 'note' && it.note.external && it.note.url) { close(); window.open(it.note.url, '_blank', 'noopener'); return; }
    close();
    if (it.kind === 'note') go(it.note.id, null);
    else go(it.n, it.sid || null);
  }

  return { start, open, close, isOpen };
}
