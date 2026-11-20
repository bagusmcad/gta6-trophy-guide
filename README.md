[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/bagusmcad/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/bagusmcad/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Ledger — GTA 6 Trophy Guide & Tracker

An offline, open-source guide and tracker for all 55 PlayStation 5 trophies of
Grand Theft Auto VI: the official list with saved progress, filters and a
spoiler setting, a roadmap to the platinum, a planner that re-orders the whole
list into a play order, and a guide to each trophy in our own words that cites
its sources. Built for the make.fun competition `gta6-trophy-guide-01`
($250, 50 paid places, closes 2026-11-21 11:00 UTC).

No Rockstar logo or artwork is used anywhere. The guide is plain static files
under `app/` and works with the network off.

## What it does

- **Tracker** — all 55 official trophies with their official name, description
  and grade (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden). Tick a
  trophy off and it stays ticked in this browser (localStorage), with export
  to a file and import back. Filters by grade, kind, earned status and
  missable-only, plus text search across name, description and guide.
- **Spoiler-free mode** — hides the names and descriptions of hidden story
  trophies until you earn them.
- **Roadmap to the platinum** — three stages built from the official
  descriptions: story first (60–80 hours), the 100% checklist (about 100
  hours), then strangers and cleanup (about 10 hours). Includes the full 100%
  Completion checklist and three warnings before you start.
- **Platinum Planner** — the original feature: the whole list re-ordered into
  a suggested playthrough sequence with a per-trophy effort estimate and a
  live "next up" pick that counts down as you tick trophies off. The
  estimates add up to about 218 hours, close to PowerPyx's ~200-hour platinum
  estimate, and are labelled as this guide's own judgement, not measured
  times.
- **Missables** — exactly one trophy is flagged as possibly missable:
  Positive Mental Attitude, because its first meditation (on the balcony at
  Jason's house in Chapter 1) may not be repeatable. Everything else can be
  finished after the story in free roam, including the things that look
  missable but are not.
- **Sources** — every trophy's guide names its sources beside it. Names,
  descriptions and grades come from the official list as published by Exophase
  and PSNProfiles on 2026-11-18; methods draw on PowerPyx, Push Square,
  Sixshore and KeenGamer and cite them. Their text is never reproduced.

## Run it

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

Or open `app/index.html` through any static file server with `app/` at its
root. It makes no network request at run time.

## Build the dossier

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, stdlib only) copies `app/` and `screenshots/` to the
output directory and writes `dossier.json` with `buildDossier` from the kit's
vendored `vendor/makefun-frontend.ts`, unchanged.

## Screenshots

Four JPEGs in `screenshots/`, taken with Playwright Chromium headless
(`node tools/shoot.mjs`): the tracker with the missable trophy's guide open
(cover), the Platinum Planner, the Roadmap, and the Missables page. Progress
is seeded at 13 of 55 earned so the progress bar, grade chips and "next up"
card read as a guide mid-way through the story. All four are 1280x800 and
under the 256 KiB cap.

## Validation and limitations

Checked 2026-11-20 in this repository, after rewriting
`app/data/trophies.json` from the official list with freshly written guides:

- **Gate self-check:** all 55 official names present (0 missing, matched
  case-, quote- and dash-insensitively against the kit's official list);
  0 trophies with a blank guide; grades 1 platinum / 2 gold / 6 silver /
  46 bronze; 28 hidden; exactly 1 missable (Positive Mental Attitude); every
  trophy carries 2–4 cited sources; planner order is a unique 1–55 sequence.
- **Determinism:** `main.ts` run twice writes byte-identical dossiers.
  Dossier sha256
  `7de9c3c6d1b6dec9f90cf3ed70911a8d10787170c4d1a2b716bff8d2b0e63d17`,
  945,220 bytes.
- **Offline:** the screenshot run records every request the app makes and
  fails on any request outside the local server. None occurred.
- **Honest gaps — five trophies have no confirmed method yet** in any
  published guide, and their entries say so instead of inventing a step:
  In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out
  There, and Ten Pin. Two more (Catch Me If You Can, Challenging Tank) have
  only the lead their description gives. Personal Best and Actions Speak
  Louder are likewise given as the description's own hint plus the PSN
  count (500 choices) rather than a confirmed method.
- **The guides disagree in one place, and this guide says so:** PowerPyx
  flags Positive Mental Attitude as possibly missable; Push Square lists no
  known missables. The safe play (do the Chapter 1 balcony meditation) is
  given either way.
- **Estimates are labelled, not measured:** the Planner's per-trophy effort
  figures are this guide's own judgement from PowerPyx's roadmap totals, and
  the ~200-hour platinum figure is PowerPyx's estimate (Push Square says
  300+ hours). Neither is a measured average — the game launched
  2026-11-19, a day before this guide was written, so completion data is
  still coming in and some methods will change. The 100% checklist figures
  (70 of 80 challenges, 200 of 277 vehicles, 100 of 255 animals, 15 of 18
  card sets) are PowerPyx's as published 2026-11-19.
- **What this guide does not do:** it does not play the game or verify a
  claim in it. Anything it could not confirm from a published source is
  marked as unconfirmed in the guide itself.

## License

MIT — see `LICENSE`.
