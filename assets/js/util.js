export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const icon = (name, cls = '') =>
  `<svg class="i ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

export function debounce(fn, ms) {
  let t;
  const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  d.cancel = () => clearTimeout(t);
  return d;
}

export function rafThrottle(fn) {
  let queued = false;
  return (...a) => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fn(...a); });
  };
}

export const idle = (fn, timeout = 1500) =>
  ('requestIdleCallback' in window) ? requestIdleCallback(fn, { timeout }) : setTimeout(fn, 200);

/* ---- localStorage that never throws ---- */
export const store = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota / private mode */ } },
  del(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } }
};

/* ---- one-shot script loader (cached by URL) ---- */
const scripts = new Map();
export function loadScript(src) {
  if (!scripts.has(src)) {
    scripts.set(src, new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { scripts.delete(src); reject(new Error('Could not load ' + src)); };
      document.head.appendChild(s);
    }));
  }
  return scripts.get(src);
}

const styles = new Map();
export function loadStyle(href) {
  if (!styles.has(href)) {
    styles.set(href, new Promise((resolve) => {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = href;
      l.onload = () => resolve(); l.onerror = () => resolve();
      document.head.appendChild(l);
    }));
  }
  return styles.get(href);
}

/* ---- dates ---- */
export function parseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
}

export function fmtDate(d) {
  return d ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
}

export function relTime(d) {
  if (!d) return '';
  const diff = (d.getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const abs = Math.abs(diff);
  if (abs < 60) return rtf.format(0, 'second');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
  if (abs < 86400 * 365) return rtf.format(Math.round(diff / (86400 * 30)), 'month');
  return rtf.format(Math.round(diff / (86400 * 365)), 'year');
}

export function formatCount(n) {
  return n >= 10000 ? Math.round(n / 1000) + 'k' : n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n);
}

let toastTimer;
export function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

export function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  return new Promise((resolve) => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove(); resolve();
  });
}

export function download(filename, text, type = 'application/json') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
