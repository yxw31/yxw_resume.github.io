#!/usr/bin/env node
/**
 * build-notes.js
 *
 * Scans notes/content/<category>/<slug>.md, parses YAML frontmatter, and
 * writes data/51_notes-index.json sorted by `updated` (newest first).
 *
 * Usage:
 *   node tools/build-notes.js
 *   npm run build:notes
 *
 * No external dependencies — uses a small inline frontmatter parser.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'notes', 'content');
const OUTPUT = path.join(ROOT, 'data', '51_notes-index.json');

// --- minimal YAML frontmatter parser (handles strings, arrays of strings) ---
function parseFrontmatter(src) {
  const m = src.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { data: {}, body: src };
  const yaml = m[1];
  const body = src.slice(m[0].length);
  const data = {};
  yaml.split(/\r?\n/).forEach(function (line) {
    if (!line.trim() || line.trim().startsWith('#')) return;
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // array literal: [a, b, c]
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(function (s) {
        return s.trim().replace(/^['"]|['"]$/g, '');
      }).filter(Boolean);
    } else {
      // strip surrounding quotes
      val = val.replace(/^['"]|['"]$/g, '');
      // coerce booleans
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
    }
    data[key] = val;
  });
  return { data: data, body: body };
}

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  fs.readdirSync(dir).forEach(function (name) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) results = results.concat(walk(p));
    else if (name.endsWith('.md')) results.push(p);
  });
  return results;
}

function relForward(p) {
  return p.split(path.sep).join('/');
}

function main() {
  const files = walk(CONTENT_DIR);
  const notes = [];

  files.forEach(function (file) {
    const src = fs.readFileSync(file, 'utf8');
    const fm = parseFrontmatter(src).data;
    if (fm.draft === true) return;

    const rel = path.relative(path.join(ROOT, 'notes'), file);
    const id = rel.replace(/^content[\/\\]/, '').replace(/\.md$/, '').replace(/\\/g, '/');

    notes.push({
      id: id,
      title: fm.title || id,
      category: fm.category || 'uncategorized',
      date: fm.date || '',
      updated: fm.updated || fm.date || '',
      tags: Array.isArray(fm.tags) ? fm.tags : [],
      summary: fm.summary || '',
      path: relForward(path.relative(path.join(ROOT, 'notes'), file))
    });
  });

  notes.sort(function (a, b) {
    return (b.updated || '').localeCompare(a.updated || '');
  });

  const out = {
    generatedAt: new Date().toISOString(),
    notes: notes
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2) + '\n', 'utf8');

  console.log('[build-notes] indexed ' + notes.length + ' note(s) → ' + path.relative(ROOT, OUTPUT));
  notes.forEach(function (n) {
    console.log('  · [' + n.category + '] ' + n.title + '  (' + n.updated + ')');
  });
}

main();
