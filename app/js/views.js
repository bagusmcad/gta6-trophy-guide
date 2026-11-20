// Views: every screen of the guide, rendered from the trophy and roadmap data.
// All text is this guide's own words; sources are shown beside each trophy's guide.
import { GRADE_ORDER, GRADE_POINTS, progressSummary } from './store.js';
import { KIND_LABELS, filterTrophies, isHiddenFromSpoilers, plannerOrder, stageTrophies, nextUp, formatEffort, remainingEffort } from './filters.js';

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function gradeChip(t) {
  return `<span class="dot ${t.grade}" aria-hidden="true"></span>${t.grade}`;
}

export function renderDash(trophies, state) {
  const s = progressSummary(trophies, state);
  const chips = GRADE_ORDER.map((g) => {
    const c = s.byGrade[g];
    return `<span class="chip"><span class="dot ${g}"></span>${g} ${c.earned}/${c.total}</span>`;
  }).join('');
  return `
    <span class="big">${s.earned}<small> / ${s.total} earned</small></span>
    <span class="bar" role="img" aria-label="${s.pct}% of trophies earned"><i style="width:${s.pct}%"></i></span>
    <span class="chip">${s.pct}% · ${s.points}/${s.totalPoints} PSN pts</span>
    <span class="grade-chips">${chips}</span>`;
}

function trophyRow(t, state, selectedId) {
  const earned = state.earned.includes(t.name);
  const hidden = isHiddenFromSpoilers(t, state);
  const name = hidden ? '<span class="hidden-name">Hidden trophy — earn it to reveal</span>' : esc(t.name);
  const desc = hidden ? 'Spoiler-free mode hides this trophy until you earn it.' : esc(t.description);
  const target = t.target ? `${t.target.count.toLocaleString()} ${esc(t.target.unit)}` : '';
  const miss = t.missable ? '<span class="tag missable">Missable</span>' : '';
  return `<button type="button" class="trow${earned ? ' earned' : ''}${selectedId === t.id ? ' selected' : ''}" data-trophy="${t.id}">
    <input type="checkbox" ${earned ? 'checked' : ''} data-check="${t.id}" aria-label="Mark ${hidden ? 'hidden trophy' : esc(t.name)} as earned">
    <span><span class="tname">${name}</span><br><span class="tdesc">${desc}</span>
    <span class="tmeta"><span class="tag ${t.grade}">${t.grade}</span><span class="tag kind">${esc(KIND_LABELS[t.kind] || t.kind)}</span>${miss}</span></span>
    <span class="ttarget">${target}${t.stage ? `<br>Stage ${t.stage}` : ''}</span>
  </button>`;
}

export function renderTracker(trophies, state, filters, selectedId) {
  const list = filterTrophies(trophies, state, filters);
  const selected = trophies.find((t) => t.id === selectedId) || list[0] || null;
  const kindOptions = Object.entries(KIND_LABELS)
    .map(([k, label]) => `<option value="${k}"${filters.kind === k ? ' selected' : ''}>${label}</option>`)
    .join('');
  const rows = list.length
    ? list.map((t) => trophyRow(t, state, selected ? selected.id : null)).join('')
    : '<p class="empty">No trophies match these filters. Clear the search or widen the filters.</p>';
  return `
  <div class="view-head">
    <h2>Tracker — all 55 official trophies</h2>
    <p>Tick a trophy off and it stays ticked in this browser. Names, descriptions and grades are the official list as PlayStation publishes it. Click any row to open its guide and sources. Spoiler-free mode (top right) hides hidden story trophies until you earn them.</p>
  </div>
  <div class="tracker-grid">
    <section aria-label="Trophy list">
      <div class="filters">
        <input type="search" id="fSearch" placeholder="Search name, description or guide…" value="${esc(filters.search)}" aria-label="Search trophies">
        <select id="fGrade" aria-label="Filter by grade">
          <option value="all">All grades</option>
          ${GRADE_ORDER.map((g) => `<option value="${g}"${filters.grade === g ? ' selected' : ''}>${g[0].toUpperCase() + g.slice(1)}</option>`).join('')}
        </select>
        <select id="fKind" aria-label="Filter by kind">
          <option value="all">All kinds</option>${kindOptions}
        </select>
        <select id="fStatus" aria-label="Filter by earned status">
          <option value="all"${filters.status === 'all' ? ' selected' : ''}>Earned + unearned</option>
          <option value="earned"${filters.status === 'earned' ? ' selected' : ''}>Earned only</option>
          <option value="unearned"${filters.status === 'unearned' ? ' selected' : ''}>Unearned only</option>
        </select>
        <label><input type="checkbox" id="fMissable"${filters.missableOnly ? ' checked' : ''}> Missable only</label>
        <span aria-label="Matching trophies">${list.length} of ${trophies.length} shown</span>
      </div>
      <div class="list">${rows}</div>
    </section>
    <aside class="card detail" aria-label="Selected trophy guide">${selected ? detailPane(selected, state) : '<p class="empty">Select a trophy to read its guide.</p>'}</aside>
  </div>`;
}

function detailPane(t, state) {
  const earned = state.earned.includes(t.name);
  const hidden = isHiddenFromSpoilers(t, state);
  const name = hidden ? 'Hidden trophy' : esc(t.name);
  const desc = hidden ? 'Spoiler-free mode hides this trophy until you earn it.' : esc(t.description);
  const steps = (t.steps || []).map((s) => `<li>${esc(s)}</li>`).join('');
  const sources = (t.sources || []).map((s) => `<li>${esc(s.label)} — <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a></li>`).join('');
  const target = t.target ? `<dt>PSN target</dt><dd>${t.target.count.toLocaleString()} ${esc(t.target.unit)}</dd>` : '';
  return `
    <h2>${name}</h2>
    <p class="odesc">“${desc}”</p>
    <div class="tmeta">
      <span class="tag ${t.grade}">${t.grade}</span>
      <span class="tag kind">${esc(KIND_LABELS[t.kind] || t.kind)}</span>
      ${t.missable ? '<span class="tag missable">Possibly missable</span>' : ''}
      <span class="tag">${earned ? '✓ Earned' : 'Not yet earned'}</span>
    </div>
    <dl class="kv">
      <dt>Roadmap stage</dt><dd>Stage ${t.stage} — ${esc(['', 'Story first', '100% checklist', 'Strangers & cleanup'][t.stage] || '')}</dd>
      <dt>Planner step</dt><dd>#${t.order} of 55 · ${formatEffort(t.effort_min)} estimated</dd>
      ${target}
    </dl>
    <div class="guide"><p>${esc(t.guide)}</p></div>
    ${steps ? `<ol class="steps">${steps}</ol>` : ''}
    ${t.note ? `<p class="note">Note: ${esc(t.note)}</p>` : ''}
    <h3 style="margin:12px 0 4px;font-size:14px;">Sources for this guide</h3>
    <ul class="src-list">${sources}</ul>`;
}

export function renderRoadmap(trophies, state, roadmap) {
  const s = progressSummary(trophies, state);
  const stages = roadmap.stages.map((st) => {
    const done = stageTrophies(trophies, st.n).filter((t) => state.earned.includes(t.name)).length;
    const total = stageTrophies(trophies, st.n).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const steps = st.do.map((d) => `<li>${esc(d)}</li>`).join('');
    const srcs = st.sources.map((x) => `<li>${esc(x.label)} — <a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.url)}</a></li>`).join('');
    return `<section class="card stage">
      <div class="stage-head"><h3>Stage ${st.n} — ${esc(st.name)}</h3><span class="hours">${esc(st.hours)} hours</span><span class="chip">${done}/${total} trophies · ${pct}%</span></div>
      <div class="progress-line"><i style="width:${pct}%"></i></div>
      <p>${esc(st.blurb)}</p>
      <ol>${steps}</ol>
      <p style="font-size:12.5px">Sources: </p><ul class="src-list">${srcs}</ul>
    </section>`;
  }).join('');
  const checklist = roadmap.checklist100.map((r) => `<tr><td>${esc(r.need)}</td><td>${esc(r.row)}</td></tr>`).join('');
  const warnings = roadmap.warnings.map((w) => `<li><strong>${esc(w.item)}.</strong> ${esc(w.why)}</li>`).join('');
  return `
  <div class="view-head">
    <h2>Roadmap to the platinum</h2>
    <p>${esc(roadmap.title)} — three stages, about 200 hours in total (PowerPyx ~200 h; Push Square 250+ h). You need one playthrough: no difficulty settings, no online trophies, no New Game+. You are at ${s.earned} of ${s.total} trophies (${s.pct}%).</p>
  </div>
  ${stages}
  <section class="card">
    <h3>The 100% Completion checklist (A Long Road)</h3>
    <p>Every requirement PowerPyx lists for the checklist, which appears after the story under Progress &gt; Stats &gt; 100% Completion. The “need” column is what the checklist asks for — not how many exist.</p>
    <div class="mini-list"><table class="data"><thead><tr><th>Need</th><th>What</th></tr></thead><tbody>${checklist}</tbody></table></div>
    <p style="font-size:12.5px">Source: <a href="https://www.powerpyx.com/gta-6-100-completion-checklist-guide/" target="_blank" rel="noopener">PowerPyx — 100% Completion Checklist &amp; Guide</a></p>
  </section>
  <section class="card warn-card" style="margin-top:12px">
    <h3>Three warnings before you start</h3>
    <ul>${warnings}</ul>
  </section>`;
}

export function renderPlanner(trophies, state) {
  const ordered = plannerOrder(trophies);
  const next = nextUp(trophies, state);
  const remainingMin = remainingEffort(trophies, state);
  const totalMin = trophies.reduce((sum, t) => sum + (t.effort_min || 0), 0);
  const stageCards = [1, 2, 3].map((n) => {
    const list = stageTrophies(trophies, n);
    const done = list.filter((t) => state.earned.includes(t.name)).length;
    const pct = list.length ? Math.round((done / list.length) * 100) : 0;
    const left = list.filter((t) => !state.earned.includes(t.name)).reduce((sum, t) => sum + (t.effort_min || 0), 0);
    const rows = list.map((t) => {
      const earned = state.earned.includes(t.name);
      return `<div class="plan-row${earned ? ' done' : ''}"><span class="seq">#${t.order}</span><span class="pname">${esc(t.name)}<span class="pgrade">${t.grade}${t.missable ? ' · missable' : ''}</span></span><span class="eff">${earned ? '✓ done' : formatEffort(t.effort_min)}</span></div>`;
    }).join('');
    const names = ['', 'Story first', '100% checklist', 'Strangers & cleanup'];
    return `<section class="card">
      <h3>Stage ${n} — ${esc(names[n])}</h3>
      <p><span class="num">${done}<small> / ${list.length}</small></span> · ${formatEffort(left)} left in this stage</p>
      <div class="progress-line"><i style="width:${pct}%"></i></div>
      ${rows}
    </section>`;
  }).join('');
  const nextCard = next ? `
    <section class="card next-up">
      <h3>Next up — step #${next.order} of 55</h3>
      <p class="tname serif">${esc(next.name)}</p>
      <p><span class="tag ${next.grade}">${next.grade}</span> <span class="tag kind">${esc(KIND_LABELS[next.kind] || next.kind)}</span> ${next.missable ? '<span class="tag missable">Possibly missable</span>' : ''} · Stage ${next.stage} · ${formatEffort(next.effort_min)} estimated</p>
      <p>${esc(next.description)}</p>
      <p>${esc(next.guide)}</p>
    </section>` : `
    <section class="card good-card next-up">
      <h3>Platinum earned</h3>
      <p>Every trophy is ticked. Vice Got a Price! is yours — you are a Leonida Legend.</p>
    </section>`;
  return `
  <div class="view-head">
    <h2>Platinum Planner — the 55 trophies in play order</h2>
    <p>The original feature of this guide: the whole list re-ordered into a suggested playthrough sequence, with an effort estimate per trophy and a live “next up” pick. Estimates are rough — they add up to about ${Math.round(totalMin / 60)} hours, close to PowerPyx’s ~200-hour platinum estimate — and they count down as you tick trophies off. ${formatEffort(remainingMin)} of estimated work remains.</p>
  </div>
  ${nextCard}
  <div class="cards" style="grid-template-columns:repeat(auto-fit,minmax(330px,1fr))">${stageCards}</div>
  <p style="color:var(--faint);font-size:12.5px">How the order was built: story trophies in chapter order first (with the Chapter 1 meditation pulled forward — it is the one possibly missable trophy), habits that pay off later (scanning, exploring, activities) alongside the story, then the 100% grind ordered so each trophy feeds the checklist, and finally the stranger strands and free-roam trophies that the checklist does not cover. Effort estimates are this guide's own judgement from the PowerPyx roadmap totals, not measured times.</p>`;
}

export function renderMissables(trophies, state, roadmap) {
  const miss = trophies.filter((t) => t.missable);
  const cards = miss.map((t) => {
    const earned = state.earned.includes(t.name);
    return `<section class="card warn-card">
      <h3>⚠ ${esc(t.name)} — the one possibly missable trophy ${earned ? '(earned ✓)' : ''}</h3>
      <p><strong>${esc(t.description)}</strong></p>
      <p>${esc(t.guide)}</p>
      <ol class="steps">${(t.steps || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      <ul class="src-list">${(t.sources || []).map((s) => `<li>${esc(s.label)} — <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a></li>`).join('')}</ul>
    </section>`;
  }).join('');
  const looks = roadmap.looksMissableButIsnt.map((x) => `<li><strong>${esc(x.item)}.</strong> ${esc(x.why)}</li>`).join('');
  return `
  <div class="view-head">
    <h2>Missables — early warning</h2>
    <p>Only one trophy is flagged as possibly missable by any guide. Everything else can be finished after the story in free roam — including the things that look missable but are not.</p>
  </div>
  ${cards}
  <section class="card">
    <h3>Looks missable, but is not</h3>
    <ul>${looks}</ul>
    <p style="font-size:12.5px">Sources: <a href="https://sixshore.com/gta-6/guides/trophies-and-achievements/" target="_blank" rel="noopener">Sixshore — missable trophies</a> · <a href="https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/" target="_blank" rel="noopener">PowerPyx trophy guide</a></p>
  </section>
  <section class="card" style="margin-top:12px">
    <h3>Save advice</h3>
    <p>The game has <strong>15 manual save slots plus 1 autosave</strong>, and there is no mission replay. PowerPyx suggests keeping a save at the start and end of each chapter, then rotating the rest during free roam. Do that from Chapter 1 and the one possibly-missable meditation is protected twice over.</p>
    <p style="font-size:12.5px">Source: <a href="https://www.powerpyx.com/gta-6-100-completion-checklist-guide/" target="_blank" rel="noopener">PowerPyx 100% checklist — save advice</a></p>
  </section>`;
}

export function renderSources(data) {
  const rows = data.sources.map((s) => `<tr><td>${esc(s.label)}</td><td><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a></td></tr>`).join('');
  return `
  <div class="view-head">
    <h2>Sources &amp; method</h2>
    <p>Every guide in this entry is written in our own words. Facts are cited to the source beside each trophy; where the guides disagree or a method is not yet confirmed, the guide says so instead of inventing a step.</p>
  </div>
  <section class="card">
    <h3>Sources cited</h3>
    <table class="source-table"><tbody>${rows}</tbody></table>
  </section>
  <section class="card" style="margin-top:12px">
    <h3>How this guide was built</h3>
    <ul>
      <li><strong>Official list first.</strong> Names, descriptions, grades and hidden flags come from the official PlayStation 5 list as published by Exophase and PSNProfiles on 2026-11-18; the two agree on every name, description and grade. The gate checks this file against that list.</li>
      <li><strong>Cited, never copied.</strong> Guide steps draw on PowerPyx, Push Square, Sixshore and KeenGamer, and name them beside each trophy. Their text is never reproduced.</li>
      <li><strong>Honest gaps.</strong> Five trophies (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin) have no confirmed method yet in any published guide. Their entries say so and give only the reported lead — no invented location or step.</li>
      <li><strong>One possibly missable trophy.</strong> Positive Mental Attitude is flagged by PowerPyx; Push Square lists no known missables. The guide gives the safe play (do the Chapter 1 balcony meditation) and says the disagreement plainly.</li>
      <li><strong>Estimates labelled.</strong> The Planner's per-trophy effort estimates are this guide's own judgement from PowerPyx's roadmap totals (~200 hours), not measured times.</li>
    </ul>
  </section>`;
}
