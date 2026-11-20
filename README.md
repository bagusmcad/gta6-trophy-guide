[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/bagusmcad/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/bagusmcad/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Ledger — GTA 6 Trophy Guide & Tracker

**Competition:** gta6-trophy-guide-01 — "Build the best GTA 6 trophy guide" ($250, closes 2026-11-21T11:00:00Z)
**What it is:** an offline static web app that guides and tracks all 55 PlayStation 5 trophies of Grand Theft Auto VI. Open `app/index.html` in a desktop browser with the network off and it works: the checklist, the guides, the roadmap, the planner and the missables pages are all local files.

## What it does

- **Tracker** — every one of the 55 official trophies with its official name, description and grade, a checklist saved in the browser (localStorage) with export and import, filters by grade, kind and earned status, text search, and a missable-only filter. Click any trophy for its guide.
- **Guides with sources** — each trophy has a guide in our own words that cites its sources (PowerPyx, Push Square, Sixshore, KeenGamer, Exophase, PSNProfiles) beside it, with steps where the method is known. Five trophies have no confirmed method in any published guide yet (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin); their entries say so plainly and give only the reported lead — no invented location or step.
- **Spoiler-free mode** — hides the names and descriptions of the 28 hidden trophies until you earn them.
- **Roadmap to the platinum** — three stages (story ~60–80 h, 100% checklist ~100 h, strangers & cleanup ~10 h), the full 100% Completion checklist with PowerPyx's numbers, and three warnings (cheats disable trophies, the Irredeemable profile is permanent, no mission replay).
- **Platinum Planner (the original feature)** — the 55 trophies re-ordered into a suggested playthrough sequence with an effort estimate per trophy, per-stage progress bars, a live remaining-time estimate, and a "Next up" card that picks the first unearned trophy in sequence and shows its guide. The order pulls the Chapter 1 meditation forward (the one possibly missable trophy) and puts the 100% grind in checklist order.
- **Missables** — an early-warning page for Positive Mental Attitude (the only trophy any guide flags as possibly missable), plus the things that look missable but are not, and save-slot advice.

## Facts the guide is built on

- 55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden; 1,350 PSN points in total.
- All single-player and offline — no online trophies. One playthrough is enough.
- Platinum estimate: ~200 hours (PowerPyx), 250+ hours (Push Square); difficulty 4/10.
- Only one possibly missable trophy: Positive Mental Attitude (PowerPyx flags it; Push Square lists none). The Chapter 1 balcony meditation with Lucia is the precaution.
- Cheats disable trophies and stop the game from saving.

## Run it

```sh
node serve.ts            # serves app/ at http://localhost:8080
```

or open `app/index.html` directly from the files. No build step, no network requests at run time.

Hand it in with:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/dossier.json
```

Run main.ts twice — the dossier must be byte-identical both times (it is deterministic).

## Validation and limitations

- **Gate data check:** `app/data/trophies.json` names all 55 official trophies exactly as PlayStation publishes them (verified against the kit's official list: 55/55 names, descriptions and grades match; 28 hidden; 1 missable flagged), each with a non-blank guide.
- **Determinism:** main.ts run twice produces a byte-identical dossier (sha256 recorded in the build notes below).
- **Screenshots:** 4 JPEG renders at 1280×800 of the app's own code in headless Chromium, with 13 of 55 trophies seeded as earned so the progress dashboard, planner and detail pane show real state. Each is under the 256 KiB cap.
- **Offline:** the app makes no network request at run time (only local files; source links open only when the reader follows them).
- **What this guide cannot do:** the game released 2026-11-19 and the guides were written 2026-11-20 from published guides, not from playing the game — five trophies have no confirmed method yet and their entries say so. Effort estimates in the Planner are this guide's own judgement from PowerPyx's roadmap totals, not measured times. PSN points per grade use the standard PSNProfiles values (platinum 300, gold 90, silver 30, bronze 15), which sum to the published 1,350.
- **Known gaps:** no Rockstar logo or official artwork is used (deliberate — the rules forbid it). The guide covers the PS5 trophy list; the Xbox achievement list is the same 55 with the same requirements.

## Build notes

- Entry built 2026-11-20 in a recorded session. main.ts: 45 lines. Dossier sha256 `00613394402b381c6d58439300d70917bb619c10dddc7f0e09851686a724ab27`, 965,456 bytes (cap 1.5 MiB), byte-identical across two runs. Screenshots: 4 JPEGs at 1280×800 — 1-cover.jpg 149,951 B, 2-planner.jpg 157,283 B, 3-roadmap.jpg 148,770 B, 4-missables.jpg 173,308 B (cap 256 KiB each), seeded with 13 of 55 earned. App: 8 files, 116,885 bytes.
- Sources: Exophase (official list), PSNProfiles (counts), PowerPyx (trophy guide & 100% checklist), Push Square (trophy guide & roadmap), Sixshore (trophy list & missables), KeenGamer (roadmap). Full URLs in `app/data/trophies.json` and on the Sources tab.

## License

MIT — see LICENSE.
