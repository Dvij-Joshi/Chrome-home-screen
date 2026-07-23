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
  const avatar = document.getElementById('navAvatar');
  if (avatar) avatar.textContent = name.charAt(0).toUpperCase();
  
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
// DSA stats are populated live by loadLC() — no manual bindEdit needed
// Daily Focus card removed — fdL1/V1/etc. no longer in DOM
bindEdit('memTitle', 'ai_memory_title', 'AI Memory Empty');
bindEdit('memBody', 'ai_memory_body', 'Complete setup and use the search bar to start filling your memory.');

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
  
// strList rows are read-only (populated by AI) — no edit listeners needed
});

// actL/T are populated by GitHub API — we just ensure IDs exist for JS injection, no user editing

/* ============================================================
   SCHEDULE
============================================================ */
let schedule = LS.getObj('schedule', [
  {time: "Morning", event: "--"},
  {time: "Noon", event: "--"},
  {time: "Night", event: "--"}
]);
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
    const pTot = document.getElementById('ghProfTotal'); if (pTot) pTot.textContent = total.toLocaleString();
    const pCur = document.getElementById('ghProfCur'); if (pCur) pCur.textContent = curS;
    const pMax = document.getElementById('ghProfMax'); if (pMax) pMax.textContent = maxS;
    document.getElementById('mRight').textContent = `${total.toLocaleString()} CONTRIBUTIONS`;
    renderMap(document.getElementById('ghWrap'), sorted);

    // GitHub Profile card
    const profileUrl = `https://github.com/${ghUser}`;
    const el = document.getElementById('ghProfileLink'); if (el) el.href = profileUrl;
    const rl = document.getElementById('ghRepoLink'); if (rl) rl.href = profileUrl;
    const av = document.getElementById('ghAvatar'); if (av) av.textContent = ghUser.charAt(0).toUpperCase();
    const un = document.getElementById('ghUsername'); if (un) un.textContent = `@${ghUser}`;
    const sub = document.getElementById('ghProfileSub'); if (sub) sub.textContent = `${total.toLocaleString()} contributions · ${curS} day streak`;
  } catch(e) {
    document.getElementById('ghWrap').innerHTML = '<span style="color:var(--color-ink-muted);font-size:12px">Failed to load GitHub activity.</span>';
  }
}
loadGH();

async function loadRecentActivity() {
  const setAct = (idBase, title, time) => {
    const elT = document.getElementById(idBase + 'Title');
    const elTm = document.getElementById(idBase + 'Time');
    if (elT) {
      elT.textContent = title;
      elT.title = title; // tooltip for long titles
    }
    if (elTm) elTm.textContent = time;
  };
  
  const getTimeStr = (dateObj) => {
    if (!dateObj) return '--';
    const diffMins = Math.floor((new Date() - dateObj) / (1000 * 60));
    if (diffMins < 60) return diffMins < 2 ? 'Just now' : `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs/24)}d ago`;
  };

  // 1. LeetCode Activity
  const lcUser = LS.get('lcUser', '');
  if (lcUser) {
    try {
      const res = await fetch(`https://alfa-leetcode-api.onrender.com/${lcUser}/acSubmission`);
      if (res.ok) {
        const data = await res.json();
        if (data.submission && data.submission.length > 0) {
          const sub = data.submission[0];
          setAct('lcAct', `Solved ${sub.title}`, getTimeStr(new Date(sub.timestamp * 1000)));
        } else {
          setAct('lcAct', 'No recent submissions', '--');
        }
      } else {
        setAct('lcAct', 'LC API failed', '--');
      }
    } catch (e) {
      setAct('lcAct', 'LC fetch error', '--');
    }
  } else {
    setAct('lcAct', 'Set LeetCode username', '--');
  }

  // 2. GitHub Activity
  const ghUser = LS.get('ghUser', '');
  if (ghUser) {
    try {
      const res = await fetch(`https://api.github.com/users/${ghUser}/events/public`);
      if (res.ok) {
        const events = await res.json();
        let desc = 'No recent activity';
        let dateObj = null;
        for (const ev of events) {
          if (ev.type === 'PushEvent') desc = `Pushed to ${ev.repo.name.split('/')[1]}`;
          else if (ev.type === 'CreateEvent') desc = `Created ${ev.repo.name.split('/')[1]}`;
          else if (ev.type === 'WatchEvent') desc = `Starred ${ev.repo.name.split('/')[1]}`;
          else if (ev.type === 'PullRequestEvent') desc = `PR in ${ev.repo.name.split('/')[1]}`;
          else if (ev.type === 'IssuesEvent') desc = `Issue in ${ev.repo.name.split('/')[1]}`;
          else continue;
          dateObj = new Date(ev.created_at);
          break;
        }
        setAct('ghAct', desc, getTimeStr(dateObj));
      } else {
        setAct('ghAct', 'GH API failed', '--');
      }
    } catch (e) {
      setAct('ghAct', 'GH fetch error', '--');
    }
  } else {
    setAct('ghAct', 'Set GitHub username', '--');
  }

  // 3 & 4. Chrome History
  if (typeof chrome !== 'undefined' && chrome.history) {
    chrome.history.search({ text: '', maxResults: 15 }, (results) => {
      // Filter out extension pages and google searches to make it cleaner
      const filtered = results.filter(r => 
        !r.url.startsWith('chrome-extension://') && 
        !r.url.startsWith('chrome://') && 
        !r.url.includes('google.com/search')
      );
      if (filtered.length > 0) {
        setAct('hist1', filtered[0].title || new URL(filtered[0].url).hostname, getTimeStr(new Date(filtered[0].lastVisitTime)));
      } else {
        setAct('hist1', 'No recent history', '--');
      }
      if (filtered.length > 1) {
        setAct('hist2', filtered[1].title || new URL(filtered[1].url).hostname, getTimeStr(new Date(filtered[1].lastVisitTime)));
      } else {
        setAct('hist2', '--', '--');
      }
    });
  } else {
    setAct('hist1', 'History not accessible', '--');
    setAct('hist2', '--', '--');
  }
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
  const BASE = 'https://leetcode-api-faisalshohag.vercel.app';
  const USER = LS.get('lcUser', '');
  if (!USER) return;
  const wrap = document.getElementById('lcWrap');
  wrap.innerHTML = '<div class="skeleton-heatmap"></div>';

  // --- Show cached values immediately so nothing stays blank ---
  const setEl = (id, val) => { const el = document.getElementById(id); if (el && val && val !== 'null') el.textContent = val; };
  setEl('dsaSolved',   LS.get('solved',  '--'));
  setEl('dsaEasy',     LS.get('easy',    '--'));
  setEl('dsaMed',      LS.get('medium',  '--'));
  setEl('dsaHard',     LS.get('hard',    '--'));
  setEl('dsaStreak',   LS.get('streak',  '--'));
  setEl('lcCurStreak', LS.get('streak',  '--'));

  // Profile link
  const lcPl = document.getElementById('lcProfileLink');
  if (lcPl) lcPl.href = `https://leetcode.com/u/${USER}/`;

  try {
    const cachedTime = parseInt(LS.get('lcCalTime', '0'));
    const cachedData = LS.getObj('lcRawCal', null);
    const useCache = cachedData && (Date.now() - cachedTime < 3600000); // 1 hour cache

    let s = null;
    if (useCache) {
      s = cachedData;
    } else {
      const res = await fetch(`${BASE}/${USER}`).catch(() => null);
      if (res && res.ok) {
        s = await res.json();
        if (s.status === 'success') {
          LS.setObj('lcRawCal', s);
          LS.set('lcCalTime', Date.now().toString());
        }
      }
    }

    if (s && s.status === 'success') {
      const total  = s.totalSolved ?? null;
      const easy   = s.easySolved   ?? null;
      const medium = s.mediumSolved ?? null;
      const hard   = s.hardSolved   ?? null;
      if (total  !== null) { setEl('dsaSolved', total);  LS.set('solved',  String(total));  }
      if (easy   !== null) { setEl('dsaEasy',   easy);   LS.set('easy',    String(easy));   }
      if (medium !== null) { setEl('dsaMed',    medium); LS.set('medium',  String(medium)); }
      if (hard   !== null) { setEl('dsaHard',   hard);   LS.set('hard',    String(hard));   }

      let rawCal = s.submissionCalendar || {};
      if (typeof rawCal === 'string') rawCal = JSON.parse(rawCal);

      const lcMap = {};
      Object.keys(rawCal).forEach(ts => {
        lcMap[new Date(Number(ts) * 1000).toISOString().slice(0, 10)] = rawCal[ts];
      });

      const days = [];
      const today = new Date();
      for (let i = 364; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const k = d.toISOString().slice(0, 10);
        days.push({ date: k, count: lcMap[k] || 0 });
      }
      renderMap(wrap, days);

      const todayStr = new Date().toISOString().slice(0, 10);
      let lcStreak = 0;
      for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].count > 0) { lcStreak++; }
        else if (days[i].date < todayStr) { break; }
      }
      setEl('lcCurStreak', lcStreak); setEl('dsaStreak', lcStreak);
      LS.set('streak', String(lcStreak));

      let lMax = 0, lTemp = 0, lAct = 0;
      days.forEach(d => { 
        if (d.count > 0) { 
          lTemp++; lAct++; 
          if (lTemp > lMax) lMax = lTemp; 
        } else lTemp = 0; 
      });
      setEl('lcActiveDays', lAct);
      setEl('lcMaxStreak', Math.max(lMax, parseInt(LS.get('max_streak', '0')) || 0));
      setEl('lcTotalVal', lAct);
    } else {
      wrap.innerHTML = `<span style="color:var(--color-ink-muted);font-size:12px">Could not load LeetCode data. <a href="https://leetcode.com/u/${USER}" target="_blank" style="color:var(--color-accent)">Open LeetCode →</a></span>`;
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
   LEETCODE DAILY CHALLENGE
============================================================ */
async function loadDailyChallenge() {
  const today = new Date().toISOString().slice(0, 10);
  const cachedDate = LS.get('dailyDate', '');
  const cachedTitle = LS.get('dailyTitle', '');
  
  // Use cache if already fetched today
  if (cachedDate === today && cachedTitle) {
    renderDailyChallenge({
      title: cachedTitle,
      link: LS.get('dailyLink', 'https://leetcode.com/problemset/'),
      diff: LS.get('dailyDiff', '--'),
      tags: JSON.parse(LS.get('dailyTags', '[]'))
    });
    return;
  }

  try {
    const res = await fetch('https://alfa-leetcode-api.vercel.app/daily');
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    // Fields are at root level — data.question is the raw HTML problem text, not metadata
    const title = data.questionTitle || 'Daily Problem';
    const link  = data.questionLink  || `https://leetcode.com/problems/${data.titleSlug || 'daily-problem'}/`;
    const diff  = data.difficulty    || '--';
    const tags  = (data.topicTags   || []).map(t => t.name || t).slice(0, 3);

    LS.set('dailyDate',  today);
    LS.set('dailyTitle', title);
    LS.set('dailyLink',  link);
    LS.set('dailyDiff',  diff);
    LS.set('dailyTags',  JSON.stringify(tags));

    renderDailyChallenge({ title, link, diff, tags });
  } catch (e) {
    document.getElementById('dailyLoading').style.display = 'none';
    document.getElementById('dailyError').style.display = 'block';
  }
}

function renderDailyChallenge({ title, link, diff, tags }) {
  document.getElementById('dailyLoading').style.display = 'none';
  document.getElementById('dailyContent').style.display = 'block';
  document.getElementById('dailyTitle').textContent = title;
  document.getElementById('dailyLink').href = link;
  document.getElementById('dailyTitle').onclick = () => window.open(link, '_blank');

  const diffEl = document.getElementById('dailyDiff');
  diffEl.textContent = diff;
  const diffColors = { Easy: 'var(--color-easy,#22c55e)', Medium: 'var(--color-medium,#f59e0b)', Hard: 'var(--color-hard,#ef4444)' };
  diffEl.style.background = diffColors[diff] || 'var(--color-ink-muted)';
  diffEl.style.color = '#fff';

  const tagsEl = document.getElementById('dailyTags');
  tagsEl.innerHTML = tags.map(t =>
    `<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:var(--color-surface-2,rgba(0,0,0,.08));color:var(--color-ink-muted)">${t}</span>`
  ).join('');

  const d = new Date();
  document.getElementById('dailyDate').textContent = d.toLocaleDateString('en-US', {month:'short', day:'numeric'});
}

loadDailyChallenge();

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
  if (!key) { document.getElementById('settingsModal').classList.add('visible'); return; }
  
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
if (mT) mT.textContent = LS.get('lastQuery', 'AI Memory Empty');
if (mB) mB.textContent = LS.get('lastSummary', 'Complete setup and use the search bar to start filling your memory.');

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
  
  // AI Coach card removed — coach fields no longer in DOM

  const ins = LS.getObj('aiInsights', {body: 'Complete setup to view insights.', tag1: '--', tag2: '--', rec: '--'});
  const bEl = document.getElementById('insBody'); if (ins.body && bEl) bEl.textContent = ins.body;
  const t1El = document.getElementById('insT1'); if (ins.tag1 && t1El) t1El.textContent = ins.tag1;
  const t2El = document.getElementById('insT2'); if (ins.tag2 && t2El) t2El.textContent = ins.tag2;
  const rEl = document.getElementById('insRec'); if (ins.rec && rEl) rEl.textContent = ins.rec;

  const str = LS.getObj('aiStrengths', []);
  if (str.length === 5) {
    const list = document.getElementById('strList');
    if (list) {
      list.innerHTML = str.map(s => `
        <div class="prog-item">
          <div class="prog-header"><span class="s-l">${s.label}</span><span class="s-v">${s.value}</span></div>
          <div class="prog-track"><div class="prog-fill s-b" style="width: ${s.value}"></div></div>
        </div>
      `).join('');
    }
  }
}
setTimeout(fetchAI, 3000);

/* ============================================================
   MILESTONE TRACKER
============================================================ */
function renderMilestone() {
  const goal = LS.getObj('milestone', null);
  if (!goal) {
    document.getElementById('milestoneSetup').style.display = 'block';
    document.getElementById('milestoneActive').style.display = 'none';
    return;
  }

  document.getElementById('milestoneSetup').style.display = 'none';
  document.getElementById('milestoneActive').style.display = 'block';

  const totalSolved = parseInt(LS.get('solved', '0')) || 0;
  const startSolved = goal.startSolved || 0;          // how many were solved when goal was set
  const earned      = Math.max(0, totalSolved - startSolved); // solved since goal started
  const target      = goal.target;
  const pct         = Math.min(Math.round((earned / target) * 100), 100);

  document.getElementById('milestoneTitle').textContent = goal.name;
  document.getElementById('milestoneCurrent').textContent = earned;
  document.getElementById('milestoneTargetDisp').textContent = target;
  document.getElementById('milestonePercent').textContent = pct + '%';
  setTimeout(() => { document.getElementById('milestoneFill').style.width = pct + '%'; }, 100);

  // Days remaining
  const start    = new Date(goal.startDate);
  const deadline = new Date(start);
  deadline.setDate(start.getDate() + goal.days);
  const daysLeft = Math.max(0, Math.ceil((deadline - new Date()) / 86400000));
  document.getElementById('milestoneDaysLeft').textContent = daysLeft > 0 ? `${daysLeft}d left` : 'Deadline passed!';

  // Pace calculation
  const remaining = target - earned;
  if (remaining <= 0) {
    document.getElementById('milestonePace').textContent = '🎉 Goal achieved!';
  } else if (daysLeft > 0) {
    const perDay = (remaining / daysLeft).toFixed(1);
    document.getElementById('milestonePace').textContent = `Need ${perDay} problems/day to finish on time`;
  } else {
    document.getElementById('milestonePace').textContent = `${remaining} problems remaining — deadline passed`;
  }
}

function saveMilestone() {
  const name   = document.getElementById('milestoneGoalName').value.trim();
  const target = parseInt(document.getElementById('milestoneTarget').value);
  const days   = parseInt(document.getElementById('milestoneDays').value);
  if (!name || !target || !days) { alert('Please fill in all three fields.'); return; }
  const startSolved = parseInt(LS.get('solved', '0')) || 0;  // snapshot current count
  LS.setObj('milestone', { name, target, days, startDate: new Date().toISOString().slice(0, 10), startSolved });
  renderMilestone();
}

function resetMilestone() {
  if (!confirm('Reset your milestone?')) return;
  localStorage.removeItem('milestone');
  renderMilestone();
}

renderMilestone();

document.getElementById('btnSetMilestone').addEventListener('click', saveMilestone);
document.getElementById('btnResetMilestone').addEventListener('click', resetMilestone);

/* ============================================================
   SETTINGS & SETUP
============================================================ */
function populateSettings() {
  document.getElementById('setFirstName').value = LS.get('firstName', '');
  document.getElementById('setGhUser').value   = LS.get('ghUser', '');
  document.getElementById('setLcUser').value   = LS.get('lcUser', '');
  document.getElementById('setCity').value     = LS.get('weatherCity', '');
  document.getElementById('setLinkedIn').value = LS.get('linkedIn', '');
  document.getElementById('setPortfolio').value = LS.get('portfolio', '');
  document.getElementById('setGroq').value     = LS.get('groqKey', '');
}

if (!LS.get('firstName')) {
  populateSettings();
  document.getElementById('setCloseBtn').style.display = 'none'; // Force setup
  document.getElementById('settingsModal').classList.add('visible');
}

document.getElementById('settingsBtn').onclick = () => {
  populateSettings();
  document.getElementById('setCloseBtn').style.display = 'inline-block';
  document.getElementById('settingsModal').classList.add('visible');
};
document.getElementById('setCloseBtn').onclick = () => document.getElementById('settingsModal').classList.remove('visible');
document.getElementById('setSaveBtn').onclick = () => {
  const fName = document.getElementById('setFirstName').value.trim();
  const ghUser = document.getElementById('setGhUser').value.trim();
  const lcUser = document.getElementById('setLcUser').value.trim();
  const city   = document.getElementById('setCity').value.trim();
  
  if (!fName) { alert('Please enter your first name to continue.'); return; }
  LS.set('firstName', fName);
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
  const avatar = document.getElementById('navAvatar');
  if (avatar) avatar.textContent = name.charAt(0).toUpperCase();

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

// btnAddNote listener removed
async function loadNews() {
  const list = document.getElementById('newsList');
  if (!list) return;
  try {
    const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const ids = await res.json();
    const topIds = ids.slice(0, 3); // Fetch top 3
    const stories = await Promise.all(topIds.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())));
    
    list.innerHTML = stories.map(s => `
      <a href="${s.url || `https://news.ycombinator.com/item?id=${s.id}`}" target="_blank" class="news-item" style="text-decoration:none;display:block;padding:8px;border-radius:8px;background:var(--color-surface-2,rgba(0,0,0,.06));transition:background 0.2s">
        <div style="font-size:12px;font-weight:600;color:var(--color-ink);line-height:1.4;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${s.title}</div>
        <div style="font-size:10px;color:var(--color-ink-muted)">${s.score} pts · by ${s.by}</div>
      </a>
    `).join('');
  } catch(e) {
    list.innerHTML = '<div style="color:var(--color-ink-muted);font-size:12px">Failed to load news.</div>';
  }
}
loadNews();
if (document.getElementById('btnAddPlaylist')) {
  document.getElementById('btnAddPlaylist').addEventListener('click', window.addPlaylist || function(){});
}
// === Daily Focus is handled by bindEdit above — no duplicate listener needed ===