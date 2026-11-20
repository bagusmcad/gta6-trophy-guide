// Filters for the tracker: text search, grade, kind, earned status, missable-only,
// and the spoiler rule (hide the name and description of a hidden trophy until earned).
export const KIND_LABELS = {
  story: 'Story',
  side: 'Side strands',
  collectible: 'Collectibles',
  activity: 'Activities',
  robbery: 'Robbery',
  exploration: 'Exploration',
  completion: '100% completion',
  misc: 'Open world',
  platinum: 'Platinum',
};

export function isHiddenFromSpoilers(trophy, state) {
  return state.spoilers && trophy.hidden && !state.earned.includes(trophy.name);
}

export function filterTrophies(trophies, state, filters) {
  const q = (filters.search || '').trim().toLowerCase();
  const earned = new Set(state.earned);
  return trophies.filter((t) => {
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.kind !== 'all' && t.kind !== filters.kind) return false;
    if (filters.status === 'earned' && !earned.has(t.name)) return false;
    if (filters.status === 'unearned' && earned.has(t.name)) return false;
    if (filters.missableOnly && !t.missable) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// Trophies in planner order: the suggested playthrough sequence.
export function plannerOrder(trophies) {
  return [...trophies].sort((a, b) => a.order - b.order);
}

export function stageTrophies(trophies, stage) {
  return plannerOrder(trophies).filter((t) => t.stage === stage);
}

// First unearned trophy in planner order: the "next up" recommendation.
export function nextUp(trophies, state) {
  const earned = new Set(state.earned);
  return plannerOrder(trophies).find((t) => !earned.has(t.name)) || null;
}

export function formatEffort(minutes) {
  if (!minutes) return '—';
  if (minutes < 60) return `~${minutes} min`;
  const h = minutes / 60;
  return `~${Number.isInteger(h) ? h : h.toFixed(1)} h`;
}

export function remainingEffort(trophies, state) {
  const earned = new Set(state.earned);
  return trophies.filter((t) => !earned.has(t.name)).reduce((sum, t) => sum + (t.effort_min || 0), 0);
}
