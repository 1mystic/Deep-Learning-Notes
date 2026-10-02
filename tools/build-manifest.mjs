#!/usr/bin/env node
/*  build-manifest.mjs — scans content/ for .md files and writes content/manifest.json
 *
 *      node tools/build-manifest.mjs            # build once
 *      node tools/build-manifest.mjs --watch    # rebuild whenever a note changes
 *
 *  Files and folders starting with "_" (and README.md) are ignored — handy for drafts.
 *  The site works without this script too: you can list files by hand in manifest.json
 *  (e.g. ["my-note.md", "another.md"]), it will just fetch them to build the cards.    */
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
  notes.sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9) || a.title.localeCompare(b.title));
  fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), notes }, null, 2) + '\n');
  console.log(`manifest.json: ${notes.length} note${notes.length === 1 ? '' : 's'}`);
  for (const n of notes) console.log(`  - ${n.file}  (${n.words} words, ${n.sections} sections)`);
}

build();

if (process.argv.includes('--watch')) {
  console.log('\nWatching content/ for changes… (Ctrl+C to stop)');
  let timer;
  fs.watch(dir, { recursive: true }, (_evt, name) => {
    if (!name || name === 'manifest.json' || !/\.md$/i.test(name)) return;
    clearTimeout(timer);
    timer = setTimeout(() => { try { build(); } catch (e) { console.error(e.message); } }, 250);
  });
}
