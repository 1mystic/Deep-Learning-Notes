/*  mdmeta.js — tiny shared helpers for front matter, heading ids, sections and note metadata.
 *  Loaded as a classic script in the page, via importScripts() in the search worker,
 *  and via require() in tools/build-manifest.mjs. Keep it dependency-free.            */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MDMeta = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var COLORS = ['green', 'blue', 'red', 'yellow'];

  function unquote(s) {
    s = String(s).trim();
    var m = /^(['"])(.*)\1$/.exec(s);
    return m ? m[2] : s;
  }

  /** Parses a leading  --- key: value ---  block. Values may be  [a, b, c]  lists. */
  function parseFrontMatter(src) {
    var m = /^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(src);
    if (!m) return { data: {}, body: src };
    var data = {};
    m[1].split(/\r?\n/).forEach(function (line) {
      var kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
      if (!kv) return;
      var v = kv[2].trim();
      if (/^\[.*\]$/.test(v)) {
        v = v.slice(1, -1).split(',').map(function (x) { return unquote(x); }).filter(Boolean);
      } else v = unquote(v);
      data[kv[1].toLowerCase()] = v;
    });
    return { data: data, body: src.slice(m[0].length) };
  }

  /** Removes inline markdown so a heading can be turned into an id / plain label. */
  function stripInline(s) {
    return String(s)
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/(\*\*|__|~~|`)/g, '')
      .replace(/\*/g, '')
      .replace(/\$/g, '')
      .trim();
  }

  function slugify(s) {
    return String(s).toLowerCase().trim()
      .replace(/[^\p{L}\p{N}\s_-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section';
  }

  /** Returns a function that yields unique ids: intro, intro-1, intro-2 ... */
  function makeSlugger() {
    var seen = Object.create(null);
    return function (text) {
      var base = slugify(text), id = base, n = 0;
      while (seen[id]) id = base + '-' + (++n);
      seen[id] = 1;
      return id;
    };
  }

  /** Markdown → searchable plain text (single spaced). */
  function plainText(md) {
    return md
      .replace(/\$\$[\s\S]*?\$\$/g, ' ')
      .replace(/\\\[[\s\S]*?\\\]/g, ' ')
      .replace(/\\begin\{(equation|align|alignat|gather|aligned|split)\*?\}[\s\S]*?\\end\{\1\*?\}/g, ' ')
      .replace(/\$([^$\n]{1,120}?)\$/g, function (m, t) { return t.replace(/\\[A-Za-z]+/g, ' ').replace(/[{}\\^_]/g, ' '); })
      .replace(/^\s*(?:```|~~~).*$/gm, ' ')
      .replace(/^\s*\|?[\s:|-]{3,}\|?\s*$/gm, ' ')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/<[^>\n]+>/g, ' ')
      .replace(/^\s{0,3}(?:#{1,6}\s+|>\s?|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)/gm, '')
      .replace(/(\*\*|__|~~|`)/g, '')
      .replace(/\*/g, '')
      .replace(/\$\$?/g, '')
      .replace(/\|/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Splits a markdown body into heading-delimited sections (fenced code and $$ blocks are respected). */
  function splitSections(body, fallbackTitle) {
    var slug = makeSlugger();
    var lines = body.split(/\r?\n/);
    var sections = [];
    var stack = []; // ancestors: [{level, title}]
    var cur = { id: null, level: 0, title: fallbackTitle || '', path: [], lines: [] };
    var inFence = false, fenceChar = '', fenceLen = 0, inMath = false;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i], m;
      if (inFence) {
        m = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(line);
        if (m && m[1][0] === fenceChar && m[1].length >= fenceLen) inFence = false;
        cur.lines.push(line);
        continue;
      }
      m = /^ {0,3}(`{3,}|~{3,})/.exec(line);
      if (m && !inMath) { inFence = true; fenceChar = m[1][0]; fenceLen = m[1].length; cur.lines.push(line); continue; }
      var dollars = (line.match(/\$\$/g) || []).length;
      if (dollars % 2 === 1) inMath = !inMath;
      if (!inMath || dollars) {
        m = !inMath && /^ {0,3}(#{1,6})[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/.exec(line);
        if (m) {
          sections.push(cur);
          var level = m[1].length, title = stripInline(m[2]);
          while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
          var path = stack.map(function (s) { return s.title; });
          stack.push({ level: level, title: title });
          cur = { id: slug(title), level: level, title: title, path: path, lines: [] };
          continue;
        }
      }
      cur.lines.push(line);
    }
    sections.push(cur);
    return sections.filter(function (s, idx) { return idx > 0 || s.lines.join('').trim() || sections.length === 1; });
  }

  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

  function toList(v) {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string' && v) return v.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    return [];
  }

  function truncate(s, n) {
    if (s.length <= n) return s;
    var cut = s.slice(0, n), sp = cut.lastIndexOf(' ');
    return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:.-]+$/, '') + '…';
  }

  /**
   * Parses one note.  Returns { meta, sections, body }.
   * `id` and `file` come from the manifest; front matter always wins for display fields.
   */
  function parseNote(text, id, file) {
    var fm = parseFrontMatter(text);
    var data = fm.data, body = fm.body;
    var fallbackName = String(file || id || 'Untitled').replace(/\.md$/i, '').replace(/[-_]+/g, ' ');
    var h1 = /^ {0,3}#[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/m.exec(body);
    var title = data.title || (h1 ? stripInline(h1[1]) : fallbackName);
    var sections = splitSections(body, title);

    var summary = data.summary || data.description || '';
    if (!summary) {
      for (var i = 0; i < sections.length && !summary; i++) {
        summary = plainText(sections[i].lines.join('\n'));
      }
      summary = truncate(summary, 190);
    }

    var heads = sections.filter(function (s) { return s.id; });
    var skipTitle = heads.length && heads[0].level === 1 ? 1 : 0;
    var rest = heads.slice(skipTitle);
    var minLevel = rest.reduce(function (a, s) { return Math.min(a, s.level); }, 9);
    var outline = rest.filter(function (s) { return s.level === minLevel; }).slice(0, 5).map(function (s) { return s.title; });

    var words = (plainText(body).match(/\S+/g) || []).length;
    var color = COLORS.indexOf(String(data.color).toLowerCase()) >= 0
      ? String(data.color).toLowerCase() : COLORS[hash(String(id || title)) % COLORS.length];

    var secOut = sections.map(function (s) {
      return { id: s.id, level: s.level, title: s.title, path: s.path, text: plainText(s.lines.join('\n')) };
    });

    return {
      meta: {
        id: id, file: file, title: title, summary: summary, tags: toList(data.tags), color: color,
        order: data.order !== undefined ? Number(data.order) : null,
        updated: data.updated || '', words: words, minutes: Math.max(1, Math.round(words / 220)),
        sections: heads.length, outline: outline
      },
      sections: secOut,
      body: body
    };
  }

  function idFromFile(file) {
    return slugify(String(file).replace(/\\/g, '/').split('/').pop().replace(/\.md$/i, ''));
  }

  return {
    COLORS: COLORS, parseFrontMatter: parseFrontMatter, stripInline: stripInline, slugify: slugify,
    makeSlugger: makeSlugger, plainText: plainText, splitSections: splitSections, parseNote: parseNote,
    idFromFile: idFromFile
  };
});
