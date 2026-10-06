#!/usr/bin/env node
/*  build-manifest.mjs — scans content/ for .md files and writes content/manifest.json
 *
 *      node tools/build-manifest.mjs            # build once
 *      node tools/build-manifest.mjs --watch    # rebuild whenever a note changes
 *
 *  Files and folders starting with "_" (and README.md) are ignored — handy for drafts.
 *  The site works without this script too: you can list files by hand in manifest.json
 *  (e.g. ["my-note.md", "another.md"]), it will just fetch them to build the cards.
 *
 *  External resources (standalone .html pages, PDFs, …) that should open in a new tab
 *  are listed in content/links.json and merged into the manifest below.              */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const MD = require('../assets/js/mdmeta.js');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'content');
const out = path.join(dir, 'manifest.json');

function walk(d, base = '') {
  const files = [];
  for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
    if (ent.name.startsWith('_') || ent.name.startsWith('.')) continue;
    const rel = base ? `${base}/${ent.name}` : ent.name;
    if (ent.isDirectory()) files.push(...walk(path.join(d, ent.name), rel));
    else if (/\.md$/i.test(ent.name) && !/^readme\.md$/i.test(ent.name)) files.push(rel);
  }
  return files;
}

function build() {
  const seen = new Map();
  const notes = [];
  for (const file of walk(dir).sort()) {
    const full = path.join(dir, file);
    const text = fs.readFileSync(full, 'utf8');
    const id = MD.idFromFile(file);
    if (seen.has(id)) console.warn(`! "${file}" and "${seen.get(id)}" produce the same id "${id}" — rename one of them.`);
    seen.set(id, file);
    const { meta } = MD.parseNote(text, id, file);
    meta.updated = meta.updated || fs.statSync(full).mtime.toISOString();
    meta.v = crypto.createHash('sha1').update(text).digest('hex').slice(0, 8);
    meta.folder = file.includes('/') ? file.split('/').slice(0, -1).join('/') : '';
    if (!meta.tags || meta.tags.length === 0) {
      console.warn(`! "${file}" has no tags — add e.g. "tags: [deep-learning, quiz-1]" to its front matter so it shows up under tag filters.`);
    }
    if (meta.order === null || meta.order === undefined) {
      console.warn(`! "${file}" has no "order" — it will sort last. Add e.g. "order: 5" to control card position.`);
    }
    notes.push(meta);
  }
  // external resources (new-tab links) from content/links.json
  const linksFile = path.join(dir, 'links.json');
  if (fs.existsSync(linksFile)) {
    let links = [];
    try { links = JSON.parse(fs.readFileSync(linksFile, 'utf8')); }
    catch (e) { console.warn(`! could not parse content/links.json — ${e.message}`); }
    if (!Array.isArray(links)) { console.warn('! content/links.json must be an array — ignoring.'); links = []; }
    for (const link of links) {
      if (!link || !link.id || !link.file) { console.warn('! a content/links.json entry needs at least "id" and "file" — skipping one.'); continue; }
      const target = path.join(root, link.file);
      if (!fs.existsSync(target)) { console.warn(`! "${link.file}" (links.json → "${link.id}") does not exist — skipping.`); continue; }
      if (seen.has(link.id)) { console.warn(`! links.json id "${link.id}" collides with another note — rename one of them.`); continue; }
      seen.set(link.id, link.file);
      const bytes = fs.readFileSync(target);
      notes.push({
        id: link.id,
        file: link.file,
        title: link.title || link.id,
        summary: link.summary || '',
        tags: Array.isArray(link.tags) ? link.tags : [],
        color: link.color || 'blue',
        order: link.order !== undefined ? Number(link.order) : null,
        folder: link.folder || (link.file.includes('/') ? link.file.split('/').slice(0, -1).join('/') : ''),
        updated: link.updated || fs.statSync(target).mtime.toISOString(),
        words: 0, minutes: 0, sections: 0, outline: [],
        external: true,
        v: crypto.createHash('sha1').update(bytes).digest('hex').slice(0, 8)
      });
    }
  }
  notes.sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9) || a.title.localeCompare(b.title));
  fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), notes }, null, 2) + '\n');
  console.log(`manifest.json: ${notes.length} note${notes.length === 1 ? '' : 's'}`);
  for (const n of notes) console.log(n.external ? `  - ${n.file}  (external link → opens in new tab)` : `  - ${n.file}  (${n.words} words, ${n.sections} sections)`);
}

build();

if (process.argv.includes('--watch')) {
  console.log('\nWatching content/ for changes… (Ctrl+C to stop)');
  let timer;
  fs.watch(dir, { recursive: true }, (_evt, name) => {
    if (!name || name === 'manifest.json' || !(/\.md$/i.test(name) || /(^|\/)links\.json$/.test(name))) return;
    clearTimeout(timer);
    timer = setTimeout(() => { try { build(); } catch (e) { console.error(e.message); } }, 250);
  });
}
