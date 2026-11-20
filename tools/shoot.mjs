// Screenshot tool for the Leonida Ledger entry (dev tool, not part of the submitted app).
// Serves app/ on localhost, seeds 13 of 55 trophies as earned (like the house engine's
// screenshots), and takes 4 JPEG renders at 1280x800 in headless Chromium.
// Usage: CHROME_PATH=<chromium> node tools/shoot.mjs
import { createServer } from 'node:http';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/hatch/workspace/makefun/shot-tool/node_modules/playwright-core');

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, '..');
const appDir = join(root, 'app');
const outDir = join(root, 'screenshots');
mkdirSync(outDir, { recursive: true });

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
  const file = join(appDir, path);
  if (!file.startsWith(appDir) || !existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

// Seed: 13 earned, a plausible early-game set (story + activities + a few open-world ones).
const doc = JSON.parse(readFileSync(join(appDir, 'data/trophies.json'), 'utf8'));
const seedIds = [2, 3, 4, 5, 8, 16, 20, 21, 33, 35, 36, 42, 53];
const seedNames = doc.trophies.filter((t) => seedIds.includes(t.id)).map((t) => t.name);
const seedValue = JSON.stringify({ earned: seedNames, spoilers: false });

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/home/hatch/.cache/ms-playwright/chromium-1187/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});
const shots = [
  { file: '1-cover.jpg', url: `http://127.0.0.1:${port}/index.html#view=tracker&trophy=28` },
  { file: '2-planner.jpg', url: `http://127.0.0.1:${port}/index.html#view=planner` },
  { file: '3-roadmap.jpg', url: `http://127.0.0.1:${port}/index.html#view=roadmap` },
  { file: '4-missables.jpg', url: `http://127.0.0.1:${port}/index.html#view=missables` },
];
for (const shot of shots) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()); });
  page.on('requestfailed', (r) => errors.push('REQFAIL ' + r.url()));
  await page.addInitScript((v) => localStorage.setItem('leonida-ledger-v1', v), seedValue);
  await page.goto(shot.url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1200);
  const state = await page.evaluate(() => ({
    rows: document.querySelectorAll('.trow').length,
    dash: document.getElementById('dash')?.textContent?.slice(0, 120),
    title: document.title,
  }));
  const path = join(outDir, shot.file);
  await page.screenshot({ path, type: 'jpeg', quality: 82 });
  const { size } = (await import('node:fs')).statSync(path);
  console.log(shot.file, size, 'bytes', JSON.stringify(state), errors.length ? 'ERRORS: ' + errors.join(' | ') : 'ok');
  await page.close();
}
await browser.close();
server.close();
console.log('DONE');
