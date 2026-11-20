// Leonida Ledger — a GTA 6 trophy guide and tracker for gta6-trophy-guide-01 (Node 22, stdlib only).
//
// The guide itself is app/: plain static files a browser opens at app/index.html (ES modules,
// one stylesheet, JSON data, no build step, nothing fetched over the network), so it works offline.
// app/data/trophies.json holds all 55 official trophies with this guide's own-word guides and
// their sources; app/data/roadmap.json holds the roadmap stages, the 100% checklist and the
// missables notes.
//
// This program hands the guide in: it copies app/ and screenshots/ from beside this file to
// /output and writes /output/dossier.json with buildDossier from the kit's vendored library.
// Leave vendor/makefun-frontend.ts untouched: the scorer rebuilds the dossier with its own copy
// of that library and the two must match byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice: the dossier must come out byte-identical both times.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): text_max_bytes shapes the dossier text, and the
// other limits refuse an entry the scorer would refuse — more than 4 screenshots or one over
// 256 KiB; more than 993 files and directories in app/ or 48 MiB of app files. app/ counts beside
// /output's own 1,000-entry cap, its screenshots/ and dossier.json, so the limits leave them room.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
