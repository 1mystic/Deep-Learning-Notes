/*  indexer.worker.js — fetches every note in the background, extracts metadata + heading sections,
 *  and answers search queries. Runs off the main thread so low-end devices stay responsive.   */
importScripts('mdmeta.js');

var notes = [];          // [{ id, title, color, secs: [{ id, title, path, text, lower, head }] }]
var total = 0, done = 0;

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

async function loadOne(entry) {
  try {
    var res = await fetch(entry.url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var parsed = MDMeta.parseNote(await res.text(), entry.id, entry.file);
    notes.push({
      id: entry.id, title: parsed.meta.title, color: parsed.meta.color,
      secs: parsed.sections.map(function (s) {
        return { id: s.id, title: s.title, path: s.path, text: s.text, lower: s.text.toLowerCase(), head: s.title.toLowerCase() };
      })
    });
    parsed.meta.url = entry.url;
    postMessage({ type: 'note', id: entry.id, meta: parsed.meta });
  } catch (err) {
    postMessage({ type: 'error', id: entry.id, message: String(err && err.message || err) });
  }
  done++;
  postMessage({ type: 'progress', done: done, total: total });
}

async function start(entries, concurrency) {
  total = entries.length; done = 0; notes = [];
  var queue = entries.slice();
  async function lane() { while (queue.length) await loadOne(queue.shift()); }
  var lanes = [];
  for (var i = 0; i < concurrency; i++) lanes.push(lane());
  await Promise.all(lanes);
  postMessage({ type: 'ready' });
}

/* ---------- highlighting & snippets ---------- */
function ranges(lower, terms) {
  var out = [];
  terms.forEach(function (t) {
    var i = lower.indexOf(t);
    while (i !== -1 && out.length < 400) { out.push([i, i + t.length]); i = lower.indexOf(t, i + t.length); }
  });
  out.sort(function (a, b) { return a[0] - b[0]; });
  var merged = [];
  out.forEach(function (r) {
    var last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]); else merged.push(r.slice());
  });
  return merged;
}

function highlight(text, lower, terms, pre, len) {
  var rs = ranges(lower, terms);
  var first = rs.length ? rs[0][0] : 0;
  var start = Math.max(0, first - pre);
  if (start > 0) { var sp = text.indexOf(' ', start); if (sp !== -1 && sp - start < 20) start = sp + 1; }
  var end = Math.min(text.length, start + len);
  if (end < text.length) { var sp2 = text.lastIndexOf(' ', end); if (sp2 > start + len * 0.7) end = sp2; }
  var html = '', pos = start;
  for (var i = 0; i < rs.length; i++) {
    var r = rs[i];
    if (r[1] <= start) continue;
    if (r[0] >= end) break;
    var a = Math.max(r[0], start), b = Math.min(r[1], end);
    html += esc(text.slice(pos, a)) + '<mark>' + esc(text.slice(a, b)) + '</mark>';
    pos = b;
  }
  html += esc(text.slice(pos, end));
  return (start > 0 ? '… ' : '') + html + (end < text.length ? ' …' : '');
}

/* ---------- search ---------- */
function search(q, rid) {
  var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  terms = terms.filter(function (t, i) { return terms.indexOf(t) === i; }).slice(0, 6);
  if (!terms.length || q.trim().length < 2) { postMessage({ type: 'results', rid: rid, results: [], indexed: done, total: total }); return; }
  var phrase = terms.length > 1 ? q.toLowerCase().trim().replace(/\s+/g, ' ') : '';
  var hits = [];

  function score(n, s, requireAll) {
    var sc = 0, matched = 0, titleL = n.title.toLowerCase();
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i], c = 0, p = s.lower.indexOf(t);
      var inHead = s.head.indexOf(t) !== -1, inTitle = titleL.indexOf(t) !== -1;
      while (p !== -1 && c < 6) { c++; p = s.lower.indexOf(t, p + t.length); }
      if (!c && !inHead && !inTitle) { if (requireAll) return 0; continue; }
      matched++;
      sc += (inHead ? 8 : 0) + c + (inTitle ? 1 : 0);
    }
    if (!matched) return 0;
    if (phrase && (s.head + ' ' + s.lower).indexOf(phrase) !== -1) sc += 8;
    return sc * (matched / terms.length);
  }

  function collect(requireAll) {
    for (var ni = 0; ni < notes.length; ni++) {
      var n = notes[ni];
      for (var si = 0; si < n.secs.length; si++) {
        var sc = score(n, n.secs[si], requireAll);
        if (sc > 0) hits.push({ n: n, s: n.secs[si], sc: sc });
      }
    }
  }
  collect(true);
  if (!hits.length) collect(false);
  hits.sort(function (a, b) { return b.sc - a.sc; });

  var perNote = Object.create(null), results = [];
  for (var h = 0; h < hits.length && results.length < 50; h++) {
    var hit = hits[h];
    perNote[hit.n.id] = (perNote[hit.n.id] || 0) + 1;
    if (perNote[hit.n.id] > 8) continue;
    var s = hit.s, text = s.text || s.title, low = s.text ? s.lower : s.head;
    results.push({
      n: hit.n.id, color: hit.n.color, noteTitle: hit.n.title, sid: s.id, st: s.title, path: s.path,
      sn: highlight(text, low, terms, 48, 170),
      pv: highlight(text, low, terms, 140, 900),
      th: ranges(s.title.toLowerCase(), terms).length ? highlight(s.title, s.title.toLowerCase(), terms, 200, 200) : esc(s.title)
    });
  }
  postMessage({ type: 'results', rid: rid, results: results, indexed: done, total: total });
}

self.onmessage = function (e) {
  var m = e.data;
  if (m.type === 'init') start(m.entries, m.concurrency || 2);
  else if (m.type === 'search') search(m.q, m.rid);
};
