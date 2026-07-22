/* ============================================================
   LOCAL STORAGE UTILS
============================================================ */
const LS = {
  get: (k, d) => { const v = localStorage.getItem(k); return v !== null ? v : d; },
  set: (k, v) => localStorage.setItem(k, v),
  setObj: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  getObj: (k, d) => { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }
};

/* ============================================================
   THEMES
============================================================ */
const themeBtns = document.querySelectorAll('.theme-btn');
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeBtns.forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
  LS.set('theme', theme);
}
themeBtns.forEach(b => b.addEventListener('click', () => applyTheme(b.dataset.theme)));
applyTheme(LS.get('theme', 'day'));

/* ============================================================
   CLOCK & DATES
============================================================ */
function updateClock() {
  const d = new Date();
  document.getElementById('clock').textContent = d.toLocaleTimeString('en-GB', { hour12: false });
  
  const hr = d.getHours();
  let gr = 'Good evening';
  if (hr >= 5 && hr < 12) gr = 'Good morning';
  else if (hr >= 12 && hr < 17) gr = 'Good afternoon';
  else if (hr >= 21 || hr < 5) gr = 'Still up';
  const name = LS.get('firstName', 'Developer');
  document.getElementById('greetText').textContent = `${gr}, ${name}`;
  
  const opts = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  document.getElementById('greetDate').textContent = d.toLocaleDateString('en-US', opts);
  
  document.getElementById('mLeft').textContent = d.toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}).toUpperCase();
}
updateClock();
setInterval(updateClock, 1000);

/* ============================================================
   QUOTES
============================================================ */
const quotes = [
  {q: "The obstacle is the way.", a: "Ryan Holiday"},
  {q: "We suffer more often in imagination than in reality.", a: "Seneca"},
  {q: "Amateur hackers build, professional hackers break.", a: "Anonymous"},
  {q: "First, solve the problem. Then, write the code.", a: "John Johnson"},
  {q: "Make it work, make it right, make it fast.", a: "Kent Beck"},
  {q: "Simplicity is the ultimate sophistication.", a: "Leonardo da Vinci"},
  {q: "Talk is cheap. Show me the code.", a: "Linus Torvalds"},
  {q: "Done is better than perfect.", a: "Sheryl Sandberg"},
  {q: "Focus is a matter of deciding what things you're not going to do.", a: "John Carmack"},
  {q: "The best way to predict the future is to invent it.", a: "Alan Kay"}
];
const qIdx = new Date().getDate() % quotes.length;
document.getElementById('quoteText').textContent = `"${quotes[qIdx].q}"`;
document.getElementById('quoteAuthor').textContent = `— ${quotes[qIdx].a}`;

/* ============================================================
   EDITABLE BINDINGS
============================================================ */
function bindEdit(id, key, defaultVal, isNum = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = LS.get(key, defaultVal);
  el.addEventListener('input', () => {
    let val = el.textContent;
    if (isNum) val = val.replace(/\D/g, '') || '0';
    if (isNum) el.textContent = val;
    LS.set(key, val);
    const r = document.createRange(); const s = window.getSelection();
    r.selectNodeContents(el); r.collapse(false); s.removeAllRanges(); s.addRange(r);
  });
  el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); el.blur(); } });
}
bindEdit('dsaStreak', 'streak', '--', true);
bindEdit('dsaSolved', 'solved', '--', true);
bindEdit('dsaEasy', 'easy', '--', true);
bindEdit('dsaMed', 'medium', '--', true);
bindEdit('dsaHard', 'hard', '--', true);

bindEdit('fdL1', 'fdL1', '--'); bindEdit('fdV1', 'fdV1', '0%'); document.getElementById('fdB1').style.width = LS.get('fdV1','0%');
bindEdit('fdL2', 'fdL2', '--'); bindEdit('fdV2', 'fdV2', '0%'); document.getElementById('fdB2').style.width = LS.get('fdV2','0%');
bindEdit('fdL3', 'fdL3', '--'); bindEdit('fdV3', 'fdV3', '0%'); document.getElementById('fdB3').style.width = LS.get('fdV3','0%');
['fdV1','fdV2','fdV3'].forEach(id => document.getElementById(id).addEventListener('input', e => document.getElementById(id.replace('V','B')).style.width = e.target.textContent));

bindEdit('fdTime', 'focused_time', '0h 0m');
bindEdit('fdGoal', 'goals', '0/0');
bindEdit('memTitle', 'ai_memory_title', 'AI Memory Empty');
bindEdit('memBody', 'ai_memory_body', "Search or ask a question to start filling your memory.");

const strKeys = ['strength_arrays','strength_trees','strength_dp','strength_graphs','strength_linked_list'];
const strDefs = ['0%','0%','0%','0%','0%'];
const strList = document.getElementById('strList');
Array.from(strList.children).forEach((item, i) => {
  const lbl = item.querySelector('.s-l');
  const val = item.querySelector('.s-v');
  const bar = item.querySelector('.s-b');
  lbl.textContent = LS.get(`str_l_${i}`, lbl.textContent);
  val.textContent = LS.get(strKeys[i], strDefs[i]);
  bar.style.width = val.textContent;
  
  lbl.addEventListener('input', () => LS.set(`str_l_${i}`, lbl.textContent));
  val.addEventListener('input', () => { LS.set(strKeys[i], val.textContent); bar.style.width = val.textContent; });
});

bindEdit('actL1','actL1','--'); bindEdit('actT1','actT1','--');
bindEdit('actL2','actL2','--'); bindEdit('actT2','actT2','--');
bindEdit('actL3','actL3','--'); bindEdit('actT3','actT3','--');
bindEdit('actL4','actL4','--'); bindEdit('actT4','actT4','--');

/* ============================================================
   NOTES & SCHEDULE
============================================================ */
let notes = LS.getObj('notes', []);
function renderNotes() {
  const c = document.getElementById('notesList');
  c.innerHTML = '';
  notes.forEach((n, i) => {
    const d = document.createElement('div'); d.className = 'note-item';
    const s = document.createElement('span'); s.contentEditable = true; s.textContent = n; s.style.flex = 1; s.style.outline = 'none';
    s.addEventListener('input', () => { notes[i] = s.textContent; LS.setObj('notes', notes); });
    s.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); s.blur(); } });
    const x = document.createElement('span'); x.className = 'note-del'; x.textContent = '×';
    x.onclick = () => { notes.splice(i, 1); LS.setObj('notes', notes); renderNotes(); };
    d.appendChild(s); d.appendChild(x); c.appendChild(d);
  });
}
window.addNote = () => { notes.push('New note'); LS.setObj('notes', notes); renderNotes(); };
renderNotes();

let schedule = LS.getObj('schedule', []);
function renderSch() {
  const c = document.getElementById('schList');
  c.innerHTML = '';
  schedule.forEach((s, i) => {
    const d = document.createElement('div'); d.className = 'sch-item';
    const t = document.createElement('span'); t.className = 'sch-time'; t.contentEditable = true; t.textContent = s.time;
    const e = document.createElement('span'); e.className = 'sch-evt'; e.contentEditable = true; e.textContent = s.event;
    t.addEventListener('input', () => { schedule[i].time = t.textContent; LS.setObj('schedule', schedule); });
    e.addEventListener('input', () => { schedule[i].event = e.textContent; LS.setObj('schedule', schedule); });
    [t,e].forEach(el => el.addEventListener('keydown', ev => { if (ev.key==='Enter'){ev.preventDefault();el.blur();} }));
    d.appendChild(t); d.appendChild(e); c.appendChild(d);
  });
}
renderSch();

/* ============================================================
   POMODORO
============================================================ */
let pTime = 25 * 60, pMode = 'Focus Time', pTimer = null;
const pEl = document.getElementById('pomoTime'), pLbl = document.getElementById('pomoLbl'), pIco = document.getElementById('pomoIcon');
function updatePomo() {
  const m = String(Math.floor(pTime/60)).padStart(2,'0');
  const s = String(pTime%60).padStart(2,'0');
  pEl.textContent = `${m}:${s}`;
}
document.getElementById('pomoBtn').addEventListener('click', () => {
  if (pTimer) {
    clearInterval(pTimer); pTimer = null; pIco.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
  } else {
    pIco.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    pTimer = setInterval(() => {
      pTime--; updatePomo();
      if (pTime <= 0) {
        clearInterval(pTimer); pTimer = null;
        new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...').play().catch(()=>{});
        pMode = pMode === 'Focus Time' ? 'Break Time' : 'Focus Time';
        pTime = pMode === 'Focus Time' ? 25*60 : 5*60;
        pLbl.textContent = pMode;
        updatePomo();
        pIco.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
      }
    }, 1000);
  }
});

/* ============================================================
   HEATMAPS
============================================================ */
const tooltip = document.getElementById('tooltip');
function renderMap(cont, days) {
  cont.innerHTML = '';
  if (!days.length) return;
  const mRow = document.createElement('div'); mRow.className = 'heatmap-months';
  const grid = document.createElement('div'); grid.className = 'heatmap-grid';
  let wCol = document.createElement('div'); wCol.className = 'heatmap-col';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let lastM = -1;

  // pad to Sunday
  const pad = new Date(days[0].date).getDay();
  for(let i=0; i<pad; i++) wCol.appendChild(Object.assign(document.createElement('div'), {className:'heatmap-cell empty'}));

  days.forEach((d, i) => {
    const dateObj = new Date(d.date);
    const m = dateObj.getMonth();
    if (m !== lastM && dateObj.getDate() <= 14) { mRow.appendChild(Object.assign(document.createElement('span'), {textContent: months[m]})); lastM = m; }
    
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell live';
    // Stagger the pop animation per cell
    cell.style.animationDelay = `${Math.min(i * 1.2, 300)}ms`;
    cell.style.opacity = '0'; // start hidden, animation fills it
    let lvl = 0; if (d.count>0) lvl=1; if (d.count>2) lvl=2; if (d.count>5) lvl=3; if (d.count>10) lvl=4;
    cell.setAttribute('data-level', lvl);
    
    cell.onmouseenter = () => { tooltip.style.display='block'; tooltip.textContent = `${d.date} : ${d.count}`; };
    cell.onmousemove = e => { tooltip.style.left = e.clientX+10+'px'; tooltip.style.top = e.clientY-25+'px'; };
    cell.onmouseleave = () => tooltip.style.display='none';
    
    wCol.appendChild(cell);
    if (wCol.children.length === 7 || i === days.length - 1) { grid.appendChild(wCol); wCol = document.createElement('div'); wCol.className = 'heatmap-col'; }
  });
  
  cont.appendChild(mRow); cont.appendChild(grid);
}

async function loadGH() {
  const ghUser = LS.get('ghUser', '');
  if (!ghUser) return;
  // Show skeleton while loading
  const ghWrap = document.getElementById('ghWrap');
  ghWrap.innerHTML = '<div class="skeleton-heatmap"></div>';
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${ghUser}?y=last`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Sort oldest → newest
    const sorted = (data.contributions || []).sort((a, b) => a.date.localeCompare(b.date));

    let total = 0, maxS = 0, curS = 0, tempS = 0;
    const todayStr = new Date().toISOString().slice(0, 10);

    sorted.forEach(d => {
      total += d.count;
      if (d.count > 0) { tempS++; if (tempS > maxS) maxS = tempS; }
      else tempS = 0;
    });

    // Walk back from today to compute current streak
    // (ignore today if it has no contributions yet — it's still in progress)
    const past = sorted.filter(d => d.date <= todayStr);
    for (let i = past.length - 1; i >= 0; i--) {
      if (past[i].count > 0) curS++;
      else { if (i < past.length - 1) break; } // allow today to be 0
    }

    document.getElementById('ghTotalVal').textContent = total.toLocaleString();
    document.getElementById('ghCurStreak').textContent = curS;
    document.getElementById('ghMaxStreak').textContent = maxS;
    document.getElementById('mRight').textContent = `${total.toLocaleString()} CONTRIBUTIONS`;
    renderMap(document.getElementById('ghWrap'), sorted);
  } catch(e) {
    document.getElementById('ghWrap').innerHTML = '<span style="color:var(--color-ink-muted);font-size:12px">Failed to load GitHub activity.</span>';
  }
}
loadGH();

async function loadRecentActivity() {
  const user = LS.get('ghUser', '');
  if (!user) return;
  try {
    const res = await fetch(`https://api.github.com/users/${user}/events/public`);
    if (!res.ok) return;
    const events = await res.json();
    let count = 1;
    for (const ev of events) {
      if (count > 3) break;
      let desc = '';
      if (ev.type === 'PushEvent') desc = `Pushed to ${ev.repo.name.split('/')[1]}`;
      else if (ev.type === 'CreateEvent') desc = `Created ${ev.repo.name.split('/')[1]}`;
      else if (ev.type === 'WatchEvent') desc = `Starred ${ev.repo.name.split('/')[1]}`;
      else if (ev.type === 'PullRequestEvent') desc = `PR in ${ev.repo.name.split('/')[1]}`;
      else if (ev.type === 'IssuesEvent') desc = `Issue in ${ev.repo.name.split('/')[1]}`;
      else continue;

      const date = new Date(ev.created_at);
      const diffHrs = Math.floor((new Date() - date) / (1000 * 60 * 60));
      const timeStr = diffHrs < 1 ? 'Just now' : (diffHrs < 24 ? `${diffHrs}h ago` : `${Math.floor(diffHrs/24)}d ago`);

      const lbl = document.getElementById(`actL${count}`);
      const tme = document.getElementById(`actT${count}`);
      if (lbl) lbl.textContent = desc;
      if (tme) tme.textContent = timeStr;
      count++;
    }
  } catch(e) {}
}
loadRecentActivity();

/* ============================================================
   LEETCODE — uses alfa-leetcode-api.onrender.com (CORS-friendly)
   Three parallel calls:
     1. /username          → streak, totalActiveDays
     2. /username/solved   → easySolved, mediumSolved, hardSolved, solvedProblem
     3. /username/calendar → submissionCalendar (timestamp→count map)
============================================================ */
async function loadLC() {
  const BASE = 'https://alfa-leetcode-api.onrender.com';
  const USER = LS.get('lcUser', '');
  if (!USER) return;
  const wrap = document.getElementById('lcWrap');
  // Show skeleton while API wakes up (Render free tier cold-start)
  wrap.innerHTML = '<div class="skeleton-heatmap"></div>';

  try {
    // Fire all three requests in parallel
    const [rProfile, rSolved, rCal] = await Promise.all([
      fetch(`${BASE}/${USER}`).catch(() => null),
      fetch(`${BASE}/${USER}/solved`).catch(() => null),
      fetch(`${BASE}/${USER}/calendar`).catch(() => null)
    ]);

    // --- Profile: streak & totalActiveDays ---
    if (rProfile && rProfile.ok) {
      const p = await rProfile.json();
      const streak   = p.streak        ?? p.currentStreak        ?? null;
      const active   = p.totalActiveDays ?? p.totalActiveDays    ?? null;
      if (streak  !== null) {
        document.getElementById('lcCurStreak').textContent = streak;
        // Also update the DSA Tracker streak (real data wins over manual)
        document.getElementById('dsaStreak').textContent = streak;
        LS.set('streak', String(streak));
      }
      if (active  !== null) {
        document.getElementById('lcTotalVal').textContent = active;
      }
    }

    // --- Solved: difficulty breakdown & total ---
    if (rSolved && rSolved.ok) {
      const s = await rSolved.json();
      const total  = s.solvedProblem  ?? s.totalSolved  ?? null;
      const easy   = s.easySolved     ?? null;
      const medium = s.mediumSolved   ?? null;
      const hard   = s.hardSolved     ?? null;
      if (total  !== null) {
        document.getElementById('dsaSolved').textContent = total;
        LS.set('solved', String(total));
      }
      if (easy   !== null) { document.getElementById('dsaEasy').textContent = easy;   LS.set('easy',   String(easy));   }
      if (medium !== null) { document.getElementById('dsaMed').textContent  = medium; LS.set('medium', String(medium)); }
      if (hard   !== null) { document.getElementById('dsaHard').textContent = hard;   LS.set('hard',   String(hard));   }
    }

    // --- Calendar: heatmap ---
    if (rCal && rCal.ok) {
      const c = await rCal.json();
      // API returns { submissionCalendar: "{ts:count,...}" } or the object directly
      let rawCal = c.submissionCalendar ?? c;
      if (typeof rawCal === 'string') rawCal = JSON.parse(rawCal);

      const lcMap = {};
      Object.keys(rawCal).forEach(ts => {
        lcMap[new Date(Number(ts) * 1000).toISOString().slice(0, 10)] = rawCal[ts];
      });

      const days = [];
      const today = new Date();
      // Match GitHub's format: rolling last 365 days
      for (let i = 364; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const k = d.toISOString().slice(0, 10);
        days.push({ date: k, count: lcMap[k] || 0 });
      }
      renderMap(wrap, days);
    } else {
      throw new Error('Calendar fetch failed');
    }

  } catch(e) {
    wrap.innerHTML = `<span style="color:var(--color-ink-muted);font-size:12px">Could not load LeetCode data. <a href="https://leetcode.com/u/${USER}" target="_blank" style="color:var(--color-accent)">Open LeetCode →</a></span>`;
  }
}
loadLC();

/* ============================================================
   WEATHER
============================================================ */
async function loadWeather() {
  try {
    const city = LS.get('weatherCity', '');
    if (!city) return;
    // Geocode city name → lat/lon using Open-Meteo geocoding (free, no key)
    const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geo.json();
    if (!geoData.results || !geoData.results.length) throw new Error('City not found');
    const { latitude, longitude, name } = geoData.results[0];

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
    const data = await res.json();
    document.getElementById('weatherTemp').textContent = `${Math.round(data.current_weather.temperature)}°C`;
    document.getElementById('weatherCity').textContent = name;
    const codes = {0:'Clear Sky',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',45:'Fog',48:'Fog',51:'Drizzle',53:'Drizzle',55:'Drizzle',61:'Rain',63:'Rain',65:'Rain',71:'Snow',73:'Snow',75:'Snow',95:'Thunderstorm'};
    document.getElementById('weatherCond').textContent = codes[data.current_weather.weathercode] || 'Unknown';
  } catch(e) {
    document.getElementById('weatherCond').textContent = 'Unavailable';
  }
}
loadWeather();

/* ============================================================
   GROQ AI LOGIC
============================================================ */
const placeholders = ["Ask anything or search...", "Ask a DSA question...", "What should I grind today?", "Open LeetCode", "Summarize my GitHub"];
let phIdx = 0;
setInterval(() => {
  const inp = document.getElementById('searchInput');
  if (document.activeElement !== inp) inp.placeholder = placeholders[++phIdx % placeholders.length];
}, 4000);

function parseMarkdown(text) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^\s*\*\s+(.*)/gm, '<ul><li>$1</li></ul>')
    .replace(/<\/ul>\n<ul>/g, '\n')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  return `<p>${html}</p>`.replace(/<p><\/p>/g, '').replace(/<br><\/p>/g, '</p>');
}

async function callGroq(prompt) {
  const key = LS.get('groqKey', '');
  if (!key) { document.getElementById('setupModal').classList.add('visible'); return; }
  
  const out = document.getElementById('searchOutput');
  out.classList.add('visible');
  out.innerHTML = '<span style="color:var(--color-ink-muted)">Thinking...</span>';
  
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{role:'user', content:prompt}], max_tokens: 500 })
    });
    const data = await res.json();
    const reply = data.choices[0].message.content;
    out.innerHTML = parseMarkdown(reply);
    
    // Save to AI Memory
    LS.set('lastQuery', prompt);
    LS.set('lastSummary', reply.substring(0, 80) + '...');
    const mT = document.getElementById('memTitle');
    const mB = document.getElementById('memBody');
    if (mT) mT.textContent = prompt;
    if (mB) mB.textContent = reply.substring(0, 80) + '...';
  } catch(e) { out.innerHTML = 'Error fetching from Groq.'; }
}

window.submitSearch = (val) => {
  const q = typeof val === 'string' ? val : document.getElementById('searchInput').value.trim();
  if (!q) return;
  
  if (/^https?:\/\//.test(q)) { window.open(q, '_blank'); return; }
  if (q.toLowerCase() === 'open leetcode') { window.open('https://leetcode.com', '_blank'); return; }
  if (q.startsWith('?') || /grind|dsa|practice/.test(q.toLowerCase()) || val) { callGroq(q); return; }
  window.open(`https://google.com/search?q=${encodeURIComponent(q)}`, '_blank');
};

document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') submitSearch();
  if (e.key === 'Escape') document.getElementById('searchOutput').classList.remove('visible');
});

document.addEventListener('click', e => {
  const container = document.querySelector('.search-container');
  if (container && !container.contains(e.target)) {
    document.getElementById('searchOutput').classList.remove('visible');
  }
});

// Load AI Memory
const mT = document.getElementById('memTitle');
const mB = document.getElementById('memBody');
if (mT) mT.textContent = LS.get('lastQuery', 'Linked List Cycle Detection');
if (mB) mB.textContent = LS.get('lastSummary', 'We were discussing Floyd\'s Cycle Detection Algorithm.');

// AI Coach & Insights Cache
async function fetchAI() {
  const key = LS.get('groqKey', '');
  const today = new Date().toISOString().slice(0,10);
  if (!key) return;

  const ghTotal = document.getElementById('ghTotalVal')?.textContent || '0';
  const ghStreak = document.getElementById('ghCurStreak')?.textContent || '0';
  const lcTotal = document.getElementById('lcTotalVal')?.textContent || '0';
  const lcStreak = document.getElementById('lcCurStreak')?.textContent || '0';

  if (LS.get('aiDate') !== today || !LS.get('aiStrengths')) {
    try {
      const prompt = `Developer stats: GitHub total ${ghTotal}, streak ${ghStreak}. LeetCode active days ${lcTotal}, streak ${lcStreak}.
Give JSON:
{
  "coach": {"body": "short today's recommendation under 30 words", "focus": "e.g. Graphs", "diff": "Medium", "time": "35 min"},
  "insights": {"body": "short summary of progress", "tag1": "weak topic 1", "tag2": "weak topic 2", "rec": "short advice"},
  "strengths": [{"label": "Arrays", "value": "85%"}, {"label": "DP", "value": "40%"}, {"label": "Trees", "value": "60%"}, {"label": "Graphs", "value": "20%"}, {"label": "Linked List", "value": "70%"}]
}
Make strengths visually varied and plausible based on a typical learner.`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{role:'user', content:prompt}], response_format:{type:'json_object'} })
      });
      const data = await res.json();
      const obj = JSON.parse(data.choices[0].message.content);
      
      LS.setObj('aiCoach', obj.coach || {});
      LS.setObj('aiInsights', obj.insights || {});
      LS.setObj('aiStrengths', obj.strengths || []);
      LS.set('aiDate', today);
    } catch(e) {}
  }
  
  const coach = LS.getObj('aiCoach', {body: 'Solve 2 Medium problems on Graphs to maintain your streak.', focus: 'Graphs', diff: 'Medium', time: '35 min'});
  document.getElementById('coachBody').textContent = coach.body;
  document.getElementById('coachFocus').textContent = coach.focus;
  document.getElementById('coachDiff').textContent = coach.diff;
  document.getElementById('coachTime').textContent = coach.time;

  const ins = LS.getObj('aiInsights', {body: 'You solved 31 problems this month.', tag1: 'Binary Search', tag2: 'Sliding Window', rec: 'Strengthen your Graphs & DP.'});
  document.getElementById('insBody').textContent = ins.body;
  document.getElementById('insT1').textContent = ins.tag1;
  document.getElementById('insT2').textContent = ins.tag2;
  document.getElementById('insRec').textContent = ins.rec;

  const str = LS.getObj('aiStrengths', []);
  if (str.length === 5) {
    const list = document.getElementById('strList');
    if (list) {
      list.innerHTML = str.map(s => `
        <div class="prog-item">
          <div class="prog-header"><span contenteditable="true" class="s-l">${s.label}</span><span contenteditable="true" class="s-v">${s.value}</span></div>
          <div class="prog-track"><div class="prog-fill s-b" style="width: ${s.value}"></div></div>
        </div>
      `).join('');
    }
  }
}
setTimeout(fetchAI, 3000);

/* ============================================================
   SETTINGS & SETUP
============================================================ */
if (!LS.get('firstName') || !LS.get('ghUser')) {
  document.getElementById('setCloseBtn').style.display = 'none'; // Force setup
  document.getElementById('settingsModal').classList.add('visible');
}

document.getElementById('settingsBtn').onclick = () => {
  document.getElementById('setFirstName').value = LS.get('firstName', '');
  document.getElementById('setGhUser').value   = LS.get('ghUser', '');
  document.getElementById('setLcUser').value   = LS.get('lcUser', '');
  document.getElementById('setCity').value     = LS.get('weatherCity', '');
  document.getElementById('setLinkedIn').value = LS.get('linkedIn', '');
  document.getElementById('setPortfolio').value = LS.get('portfolio', '');
  document.getElementById('setGroq').value     = LS.get('groqKey', '');
  document.getElementById('setCloseBtn').style.display = 'inline-block';
  document.getElementById('settingsModal').classList.add('visible');
};
document.getElementById('setCloseBtn').onclick = () => document.getElementById('settingsModal').classList.remove('visible');
document.getElementById('setSaveBtn').onclick = () => {
  const fName = document.getElementById('setFirstName').value.trim();
  const ghUser = document.getElementById('setGhUser').value.trim();
  const lcUser = document.getElementById('setLcUser').value.trim();
  const city   = document.getElementById('setCity').value.trim();
  
  if (fName) LS.set('firstName', fName);
  if (ghUser) LS.set('ghUser', ghUser);
  if (lcUser) LS.set('lcUser', lcUser);
  if (city)   LS.set('weatherCity', city);
  LS.set('linkedIn',  document.getElementById('setLinkedIn').value);
  LS.set('portfolio', document.getElementById('setPortfolio').value);
  LS.set('groqKey',   document.getElementById('setGroq').value);
  
  document.getElementById('settingsModal').classList.remove('visible');
  applyLinks();
  
  // Update Greeting
  const name = LS.get('firstName', 'Developer');
  let gr = 'Good evening';
  const hr = new Date().getHours();
  if (hr >= 5 && hr < 12) gr = 'Good morning';
  else if (hr >= 12 && hr < 17) gr = 'Good afternoon';
  else if (hr >= 21 || hr < 5) gr = 'Still up';
  const gt = document.getElementById('greetText');
  if (gt) gt.textContent = `${gr}, ${name}`;

  // Re-fetch all data
  loadGH();
  loadRecentActivity();
  loadLC();
  loadWeather();
  // Clear AI date to force a fresh fetch with new details
  LS.set('aiDate', '');
  fetchAI();
};

function applyLinks() {
  const ghUser = LS.get('ghUser', '');
  const lcUser = LS.get('lcUser', '');
  // Topbar nav links
  document.querySelectorAll('.gh-nav-link').forEach(el => el.href = `https://github.com/${ghUser}`);
  document.querySelectorAll('.lc-nav-link').forEach(el => el.href = `https://leetcode.com/u/${lcUser}/`);
  document.getElementById('linkedInBtn').href  = LS.get('linkedIn',  '#');
  document.getElementById('linkInQa').href     = LS.get('linkedIn',  '#');
  document.getElementById('portfolioBtn').href = LS.get('portfolio', '#');
}
applyLinks();

/* ============================================================
   SHORTCUTS
============================================================ */
document.addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey) {
    if (e.key === 'k') { e.preventDefault(); document.getElementById('searchInput').focus(); }
    if (e.key === 'l') { e.preventDefault(); window.open('https://leetcode.com', '_blank'); }
    if (e.key === 'g') { e.preventDefault(); window.open('https://github.com', '_blank'); }
    if (e.key === 'a') { e.preventDefault(); document.getElementById('searchInput').focus(); document.getElementById('searchInput').value = '? '; }
  }
});

/* ============================================================
   YOUTUBE THUMBNAILS
   Strategy per URL type:
   - playlist?list=XXX   → oEmbed works perfectly
   - /watch?v=XXX        → direct i.ytimg.com thumbnail (instant, no CORS)
   - @handle / /c/ / /channel/ → oEmbed works for channels
   - Hardcoded fallback thumbnailUrl in defaultPlaylists for channels
     that have known video IDs we can use directly.
============================================================ */
async function loadPlThumbnails() {
  const imgs = document.querySelectorAll('.pl-img[data-yt-url]');
  await Promise.all(Array.from(imgs).map(async img => {
    // If a sibling with a rendered fallback already exists, skip
    if (img.style.display === 'none') return;
    
    const url = img.dataset.ytUrl;
    
    // Direct video thumbnail — no fetch needed
    const vidMatch = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
    if (vidMatch) {
      img.src = `https://i.ytimg.com/vi/${vidMatch[1]}/mqdefault.jpg`;
      return;
    }
    
    // oEmbed for playlists and channels
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    try {
      const res = await fetch(oEmbedUrl);
      if (!res.ok) throw new Error(`oEmbed ${res.status}`);
      const data = await res.json();
      if (data.thumbnail_url) { img.src = data.thumbnail_url; return; }
      throw new Error('no thumb');
    } catch (_) {
      // Fallback: YouTube-red square with play icon
      img.style.display = 'none';
      const fb = document.createElement('div');
      fb.style.cssText = 'width:44px;height:44px;border-radius:6px;background:#FF0000;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
      fb.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      img.parentNode.insertBefore(fb, img);
    }
  }));
}

/* ============================================================
   PLAYLISTS MANAGER
============================================================ */
const defaultPlaylists = [];
let playlists = LS.getObj('playlists', defaultPlaylists);

function renderPlaylists() {
  const cont = document.getElementById('plList');
  cont.innerHTML = '';
  playlists.forEach((p, i) => {
    const a = document.createElement('a');
    a.href = p.url;
    a.target = '_blank';
    a.className = 'pl-item';
    
    a.innerHTML = `
      <img class="pl-img" alt="${p.title}" data-yt-url="${p.url}">
      <div class="pl-info">
        <span class="pl-title">${p.title}</span>
        <span class="pl-src">${p.src}</span>
      </div>
    `;
    
    const del = document.createElement('div');
    del.className = 'pl-del';
    del.innerHTML = '×';
    del.title = 'Remove';
    del.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      playlists.splice(i, 1);
      LS.setObj('playlists', playlists);
      renderPlaylists();
    };
    
    a.appendChild(del);
    cont.appendChild(a);
  });
  
  // Re-fetch thumbnails for the newly rendered list
  loadPlThumbnails();
}

window.addPlaylist = () => {
  const url = prompt('Enter YouTube URL (playlist or channel):');
  if (!url) return;
  const title = prompt('Enter a short title (e.g. "DSA Practice"):', 'New Playlist');
  if (!title) return;
  const src = prompt('Enter source string (e.g. "YouTube • Playlist"):', 'YouTube');
  
  playlists.push({ url, title, src: src || 'YouTube' });
  LS.setObj('playlists', playlists);
  renderPlaylists();
};

renderPlaylists();

// === Event Listeners for Elements (CSP compliant) ===
document.querySelectorAll('.search-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    if (typeof submitSearch === 'function') {
      submitSearch(chip.getAttribute('data-query'));
    }
  });
});
if (document.getElementById('btnStartFocus')) {
  document.getElementById('btnStartFocus').addEventListener('click', () => {
    submitSearch('Give me 2 medium LeetCode problems on Graphs with hints only, no solutions');
  });
}
if (document.getElementById('btnAddNote')) {
  document.getElementById('btnAddNote').addEventListener('click', window.addNote || function(){});
}
if (document.getElementById('btnDetailedReport')) {
  document.getElementById('btnDetailedReport').addEventListener('click', () => {
    submitSearch('Give me a detailed report on my LeetCode progress based on Arrays being strong and DP/Graphs being weak.');
  });
}
if (document.getElementById('btnAddPlaylist')) {
  document.getElementById('btnAddPlaylist').addEventListener('click', window.addPlaylist || function(){});
}
if (document.getElementById('weatherImg')) {
  document.getElementById('weatherImg').addEventListener('error', function() {
    this.style.display = 'none';
  });
}

// === Daily Focus Dynamic Logic ===
const focusKeys = ['fdL1', 'fdV1', 'fdL2', 'fdV2', 'fdL3', 'fdV3', 'fdTime', 'fdGoal'];
focusKeys.forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  // Load saved values
  const saved = LS.get(id, '');
  if (saved) {
    el.textContent = saved;
    // Update bar if it's a value
    if (id.startsWith('fdV')) {
      const barId = 'fdB' + id.slice(3);
      const bar = document.getElementById(barId);
      if (bar) bar.style.width = saved.endsWith('%') ? saved : saved + '%';
    }
  }
  // Save on edit and update bar
  el.addEventListener('input', () => {
    const val = el.textContent.trim();
    LS.set(id, val);
    if (id.startsWith('fdV')) {
      const barId = 'fdB' + id.slice(3);
      const bar = document.getElementById(barId);
      if (bar) {
        let percent = val.replace(/[^0-9]/g, '');
        bar.style.width = (percent ? percent : 0) + '%';
      }
    }
  });
});