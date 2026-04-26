const minutesEl      = document.getElementById('minutes');
const secondsEl      = document.getElementById('seconds');
const centisecondsEl = document.getElementById('centiseconds');
const startBtn       = document.getElementById('start-btn');
const startIcon      = document.getElementById('start-icon');
const startLabel     = document.getElementById('start-label');
const lapBtn         = document.getElementById('lap-btn');
const resetBtn       = document.getElementById('reset-btn');
const lapList        = document.getElementById('lap-list');
const lapHeader      = document.getElementById('lap-header');
const ringProgress   = document.getElementById('ring-progress');
const statusLabel    = document.getElementById('status-label');
const colon          = document.querySelector('.colon');

const CIRCUMFERENCE = 2 * Math.PI * 130; // 816.81

let startTime  = 0;
let elapsed    = 0;
let lapStart   = 0;
let rafId      = null;
let running    = false;
let laps       = [];

function pad(n) {
  return String(Math.floor(n)).padStart(2, '0');
}

function msToComponents(ms) {
  const totalCs  = Math.floor(ms / 10);
  const cs       = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec      = totalSec % 60;
  const min      = Math.floor(totalSec / 60);
  return { min, sec, cs };
}

function formatStr(ms) {
  const { min, sec, cs } = msToComponents(ms);
  return `${pad(min)}:${pad(sec)}.${pad(cs)}`;
}

function updateDisplay(ms) {
  const { min, sec, cs } = msToComponents(ms);
  minutesEl.textContent      = pad(min);
  secondsEl.textContent      = pad(sec);
  centisecondsEl.textContent = pad(cs);

  // Ring: full rotation = 60 seconds
  const progress = (sec + cs / 100) / 60;
  ringProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
}

function tick() {
  elapsed = Date.now() - startTime;
  updateDisplay(elapsed);
  rafId = requestAnimationFrame(tick);
}

// --- PAUSE icon (two bars)
const PAUSE_SVG = `<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>`;
const PLAY_SVG  = `<polygon points="5,3 19,12 5,21"/>`;

startBtn.addEventListener('click', () => {
  if (!running) {
    startTime = Date.now() - elapsed;
    if (laps.length === 0) lapStart = startTime;
    rafId   = requestAnimationFrame(tick);
    running = true;

    startIcon.innerHTML = PAUSE_SVG;
    startBtn.classList.add('running');
    colon.classList.add('active');
    statusLabel.textContent = 'RUNNING';
    statusLabel.className   = 'status-label running';

    lapBtn.disabled   = false;
    resetBtn.disabled = true;
  } else {
    cancelAnimationFrame(rafId);
    running = false;

    startIcon.innerHTML = PLAY_SVG;
    startBtn.classList.remove('running');
    colon.classList.remove('active');
    statusLabel.textContent = 'PAUSED';
    statusLabel.className   = 'status-label stopped';

    lapBtn.disabled   = true;
    resetBtn.disabled = false;
  }
});

lapBtn.addEventListener('click', () => {
  const now     = Date.now();
  const split   = now - lapStart;
  lapStart      = now;
  laps.unshift({ total: elapsed, split });
  renderLaps();
});

resetBtn.addEventListener('click', () => {
  elapsed = 0;
  laps    = [];
  updateDisplay(0);
  lapList.innerHTML         = '';
  lapHeader.textContent     = '';
  statusLabel.textContent   = 'READY';
  statusLabel.className     = 'status-label';
  resetBtn.disabled         = true;
  lapBtn.disabled           = true;
  ringProgress.style.strokeDashoffset = CIRCUMFERENCE;
});

function renderLaps() {
  if (!laps.length) { lapHeader.textContent = ''; lapList.innerHTML = ''; return; }

  lapHeader.textContent = `LAPS — ${laps.length}`;

  const splits  = laps.map(l => l.split);
  const minSp   = Math.min(...splits);
  const maxSp   = Math.max(...splits);

  lapList.innerHTML = laps.map((lap, i) => {
    const num = laps.length - i;
    let cls   = '';
    if (laps.length > 1) {
      if (lap.split === minSp) cls = 'fastest';
      else if (lap.split === maxSp) cls = 'slowest';
    }
    return `
      <li class="${cls}">
        <span class="lap-num">LAP ${String(num).padStart(2,'0')}</span>
        <span class="lap-time">${formatStr(lap.total)}</span>
        <span class="lap-split">${formatStr(lap.split)}</span>
      </li>`;
  }).join('');
}

// Init ring
ringProgress.style.strokeDasharray  = CIRCUMFERENCE;
ringProgress.style.strokeDashoffset = CIRCUMFERENCE;
