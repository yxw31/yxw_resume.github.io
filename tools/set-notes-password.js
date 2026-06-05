#!/usr/bin/env node
/**
 * set-notes-password.js
 *
 * Updates data/52_notes-gate.json with a SHA-256 hash of (salt + password).
 * The browser-side gate compares the same hash via the Web Crypto API.
 *
 * Usage:
 *   node tools/set-notes-password.js <new-password>
 *   npm run set:password -- mynewpass
 *
 * Notes:
 *   - This is a CLIENT-SIDE password gate. It deters casual visitors but
 *     does NOT provide real cryptographic protection. Anyone willing to
 *     open DevTools can bypass it and access notes/content/*.md directly.
 *   - For real encryption, use staticrypt (see README §8).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const CONFIG = path.join(ROOT, 'data', '52_notes-gate.json');

// Fixed salt — keeps the hash specific to this site so leaked hashes
// can't be matched against generic rainbow tables.
const SALT = 'yxw-notes-2026-salt';

function usage(msg) {
  if (msg) console.error('[set-password] ' + msg);
  console.error('Usage:');
  console.error('  node tools/set-notes-password.js <new-password>');
  console.error('  npm run set:password -- <new-password>');
  console.error('');
  console.error('Password requirements: at least 6 characters.');
  process.exit(1);
}

const password = process.argv[2];
if (!password) usage('Missing password argument.');
if (password.length < 6) usage('Password must be at least 6 characters.');

const hash = crypto.createHash('sha256').update(SALT + password).digest('hex');

const defaults = {
  enabled: true,
  salt: SALT,
  rememberDays: 7,
  title:    { zh: '知识库 · 访问授权',         en: 'Notes · Access Required' },
  subtitle: { zh: '请输入访问密码后进入',       en: 'Enter the access password to continue' },
  hint:     { zh: '如不知道密码，请联系站点所有者。', en: "Please ask the site owner if you don't have the password." },
  errorMsg: { zh: '密码不正确，请重试。',       en: 'Wrong password. Try again.' },
  rememberLabel: { zh: '记住我 7 天',          en: 'Remember me for 7 days' },
  unlockLabel:   { zh: '解锁',                 en: 'Unlock' },
  backLabel:     { zh: '← 返回主站',           en: '← Back to portfolio' }
};

let cfg = {};
if (fs.existsSync(CONFIG)) {
  try { cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8')); } catch (e) { /* corrupt — start fresh */ }
}

const next = Object.assign({}, defaults, cfg, {
  enabled: true,
  salt: SALT,
  passwordHash: hash
});

fs.mkdirSync(path.dirname(CONFIG), { recursive: true });
fs.writeFileSync(CONFIG, JSON.stringify(next, null, 2) + '\n', 'utf8');

console.log('[notes-gate] password updated.');
console.log('  hash : ' + hash.slice(0, 24) + '…');
console.log('  file : ' + path.relative(ROOT, CONFIG));
console.log('  remember: ' + next.rememberDays + ' day(s)');
console.log('');
console.log('Tip: refresh / clear localStorage to force the gate to reappear in your browser.');
