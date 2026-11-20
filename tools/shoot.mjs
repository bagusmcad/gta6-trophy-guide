// Re-shoot the Leonida Ledger screenshots with Playwright Chromium headless.
//
// Serves app/ on a local port, seeds 13 of 55 trophies as earned (the same
// mid-progress state the guide shows by default), and captures four 1280x800
// JPEGs into screenshots/: the tracker with the missable trophy's guide open
// (cover), the Planner, the Roadmap, and the Missables page. Every shot is
// kept under the gate's 256 KiB cap by lowering JPEG quality until it fits.
//
// Run from the entry root:
//   node tools/shoot.mjs
//
// Requires playwright-core plus a cached Chromium build (here:
// /tmp/pw/node_modules/playwright-core and ~/.cache/ms-playwright).
// No network is used beyond the local server: any request to another origin
// fails the run, so a shot can never hide an offline violation.

import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/tmp/pw/node_modules/playwright-core');

const here = join(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

// The 13 trophies seeded as earned: the first 13 steps of the Planner order,
// so the progress bar, the grade chips and the "next up" card all read as a
// guide mid-way through the story.
const SEEDED_EARNED = [
  'Just Like Paradise',
  'Positive Mental Attitude',
  'Paradise Lost',
  'Trust',
  'T**s Ass Drug Money',
  'Break the Bank',
  'Vice City, Baby!',
  'Family Matters',
  'DWNFALL',
  'Top Of The World, Ma',
  'Hi-Jacked',
  'Snow Storm',
  'You Gotta Know When to Get Off',
];

const SHOTS = [
  { file: '1-cover.jpg', url: '/#view=tracker&trophy=28', note: 'tracker, missable guide open' },
  { file: '2-planner.jpg', url: '/#view=planner', note: 'platinum planner' },
  { file: '3-roadmap.jpg', url: '/#view=roadmap', note: 'roadmap to the platinum' },
  { file: '4-missables.jpg', url: '/#view=missables', note: 'missables page' },
];

const MAX_BYTES = 262144;

function serve() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/+/, '') || 'index.html';
    const file = join(appDir, path);
    if (!file.startsWith(appDir) || !existsSync(file)) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

async function shoot(browser, base, shot) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const outside = [];
  page.on('request', (req) => {
    const url = req.url();
    if (!url.startsWith(base) && !url.startsWith('data:') && !url.startsWith('blob:')) outside.push(url);
  });
  await page.addInitScript((earned) => {
    localStorage.setItem('leonida-ledger-v1', JSON.stringify({ earned, spoilers: false }));
  }, SEEDED_EARNED);
  await page.goto(base + shot.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  mkdirSync(shotsDir, { recursive: true });
  const out = join(shotsDir, shot.file);
  let quality = 82;
  for (;;) {
    await page.screenshot({ path: out, type: 'jpeg', quality });
    const size = statSync(out).size;
    if (size <= MAX_BYTES || quality <= 50) {
      console.log(`${shot.file} (${shot.note}): ${size} bytes at quality ${quality}`);
      break;
    }
    quality -= 8;
  }
  if (outside.length) {
    throw new Error(`offline violation on ${shot.file}: requested ${outside.join(', ')}`);
  }
  await page.close();
}

const { server, port } = await serve();
const base = `http://127.0.0.1:${port}`;
console.log(`serving app/ at ${base}`);
const browser = await chromium.launch({
  headless: true,
  // The cached build on this machine is chromium-1187; playwright-core's
  // default lookup expects a newer build, so name the binary explicitly.
  executablePath: '/home/hatch/.cache/ms-playwright/chromium-1187/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});
try {
  for (const shot of SHOTS) await shoot(browser, base, shot);
} finally {
  await browser.close();
  server.close();
}
console.log('done: 4 screenshots in screenshots/');
