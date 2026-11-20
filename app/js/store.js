// Progress store: what the player has earned, saved in the browser, with export/import.
// Key is versioned so a later guide format can migrate cleanly. No network is used.
export const STORE_KEY = 'leonida-ledger-v1';

// PSN points per grade, as PSNProfiles totals them (1,350 for the full set:
// 1x300 platinum + 2x90 gold + 6x30 silver + 46x15 bronze).
export const GRADE_POINTS = { platinum: 300, gold: 90, silver: 30, bronze: 15 };
export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { earned: [], spoilers: false };
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => typeof n === 'string') : [],
      spoilers: parsed.spoilers === true,
    };
  } catch {
    return { earned: [], spoilers: false };
  }
}

export function saveStore(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...state.earned], spoilers: state.spoilers }));
  } catch {
    // Storage full or unavailable (private mode): progress still works for this session.
  }
}

// Export the earned list as a downloadable JSON file.
export function exportProgress(state) {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', exported: new Date().toISOString(), earned: [...state.earned] }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// Import an exported file; returns { ok, imported, rejected }.
export async function importProgress(file, knownNames) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('That file has no earned list in it.');
  const known = new Set(knownNames);
  const imported = names.filter((n) => typeof n === 'string' && known.has(n));
  const rejected = names.filter((n) => typeof n === 'string' && !known.has(n));
  return { imported, rejected };
}

export function earnedSet(state) {
  return new Set(state.earned);
}

export function toggleEarned(state, name) {
  const set = earnedSet(state);
  if (set.has(name)) set.delete(name);
  else set.add(name);
  state.earned = [...set];
  saveStore(state);
  return state;
}

export function gradeCounts(trophies) {
  const counts = {};
  for (const g of GRADE_ORDER) counts[g] = { total: 0, earned: 0 };
  return counts;
}

export function progressSummary(trophies, state) {
  const earned = earnedSet(state);
  const byGrade = {};
  for (const g of GRADE_ORDER) byGrade[g] = { total: 0, earned: 0 };
  let points = 0;
  let totalPoints = 0;
  for (const t of trophies) {
    byGrade[t.grade].total += 1;
    totalPoints += GRADE_POINTS[t.grade] ?? 0;
    if (earned.has(t.name)) {
      byGrade[t.grade].earned += 1;
      points += GRADE_POINTS[t.grade] ?? 0;
    }
  }
  return {
    earned: earned.size,
    total: trophies.length,
    pct: trophies.length ? Math.round((earned.size / trophies.length) * 100) : 0,
    byGrade,
    points,
    totalPoints,
  };
}
