// Leonida Ledger — boot, tabs, filters, selection and progress wiring.
// Static files only: data comes from app/data/trophies.json and app/data/roadmap.json,
// progress lives in localStorage, and nothing is fetched over the network at run time.
import { loadStore, saveStore, exportProgress, importProgress, toggleEarned, progressSummary } from './store.js';
import { renderDash, renderTracker, renderRoadmap, renderPlanner, renderMissables, renderSources } from './views.js';

const viewEl = document.getElementById('view');
const dashEl = document.getElementById('dash');
const footEl = document.getElementById('footStats');

const trophiesDoc = await (await fetch('data/trophies.json')).json();
const roadmapDoc = await (await fetch('data/roadmap.json')).json();
const trophies = trophiesDoc.trophies;

const state = loadStore();
let currentView = 'tracker';
let selectedId = null;
const filters = { search: '', grade: 'all', kind: 'all', status: 'all', missableOnly: false };

// Deep link: #view=planner or #trophy=28 (opens the tracker with that trophy selected).
function readHash() {
  const hash = new URLSearchParams(location.hash.slice(1));
  const v = hash.get('view');
  if (['tracker', 'roadmap', 'planner', 'missables', 'sources'].includes(v)) currentView = v;
  const t = Number.parseInt(hash.get('trophy') || '', 10);
  if (Number.isInteger(t) && trophies.some((x) => x.id === t)) {
    selectedId = t;
    currentView = 'tracker';
  }
}

function render() {
  dashEl.innerHTML = renderDash(trophies, state);
  const s = progressSummary(trophies, state);
  footEl.textContent = `${s.earned} of ${s.total} trophies earned (${s.pct}%) · ${s.points}/${s.totalPoints} PSN points · ${trophies.length} trophies: 1 platinum, 2 gold, 6 silver, 46 bronze · 28 hidden · 1 possibly missable · data as of 2026-11-18.`;
  document.querySelectorAll('.tab').forEach((b) => {
    const active = b.dataset.view === currentView;
    b.classList.toggle('active', active);
    if (active) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  if (currentView === 'tracker') viewEl.innerHTML = renderTracker(trophies, state, filters, selectedId);
  else if (currentView === 'roadmap') viewEl.innerHTML = renderRoadmap(trophies, state, roadmapDoc);
  else if (currentView === 'planner') viewEl.innerHTML = renderPlanner(trophies, state);
  else if (currentView === 'missables') viewEl.innerHTML = renderMissables(trophies, state, roadmapDoc);
  else viewEl.innerHTML = renderSources(trophiesDoc);
  document.getElementById('spoilerToggle').checked = state.spoilers;
}

// Tabs.
document.querySelectorAll('.tab').forEach((b) => {
  b.addEventListener('click', () => {
    currentView = b.dataset.view;
    history.replaceState(null, '', `#view=${currentView}`);
    render();
  });
});

// Spoiler toggle, export and import live in the header.
document.getElementById('spoilerToggle').addEventListener('change', (e) => {
  state.spoilers = e.target.checked;
  saveStore(state);
  render();
});
document.getElementById('exportBtn').addEventListener('click', () => exportProgress(state));
document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const { imported, rejected } = await importProgress(file, trophies.map((t) => t.name));
    state.earned = [...new Set([...state.earned, ...imported])];
    saveStore(state);
    render();
    alert(`Imported ${imported.length} earned trophies.${rejected.length ? ` ${rejected.length} names were not in the official list and were skipped.` : ''}`);
  } catch (err) {
    alert(`Could not import that file: ${err.message}`);
  }
  e.target.value = '';
});

// Tracker events, delegated: row click selects, checkbox toggles earned, filters re-render.
viewEl.addEventListener('click', (e) => {
  const check = e.target.closest('[data-check]');
  if (check) {
    e.stopPropagation();
    const t = trophies.find((x) => x.id === Number(check.dataset.check));
    if (t) {
      toggleEarned(state, t.name);
      render();
    }
    return;
  }
  const row = e.target.closest('[data-trophy]');
  if (row) {
    selectedId = Number(row.dataset.trophy);
    history.replaceState(null, '', `#view=tracker&trophy=${selectedId}`);
    render();
  }
});
viewEl.addEventListener('input', (e) => {
  if (e.target.id === 'fSearch') {
    filters.search = e.target.value;
    // Re-render the list only, keeping focus in the search box.
    const pos = e.target.selectionStart;
    render();
    const box = document.getElementById('fSearch');
    box.focus();
    box.setSelectionRange(pos, pos);
  }
});
viewEl.addEventListener('change', (e) => {
  if (e.target.id === 'fGrade') { filters.grade = e.target.value; render(); }
  if (e.target.id === 'fKind') { filters.kind = e.target.value; render(); }
  if (e.target.id === 'fStatus') { filters.status = e.target.value; render(); }
  if (e.target.id === 'fMissable') { filters.missableOnly = e.target.checked; render(); }
});

readHash();
render();
