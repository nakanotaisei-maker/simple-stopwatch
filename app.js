const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const centisecondsEl = document.getElementById('centiseconds');
const startBtn = document.getElementById('start-btn');
const lapBtn = document.getElementById('lap-btn');
const resetBtn = document.getElementById('reset-btn');
const lapList = document.getElementById('lap-list');
const lapHeader = document.getElementById('lap-header');

let startTime = 0;
let elapsed = 0;
let lapStart = 0;
let timerInterval = null;
let running = false;
let laps = [];

function pad(n) {
  return String(Math.floor(n)).padStart(2, '0');
}

function formatTime(ms) {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const min = Math.floor(totalSec / 60);
  return { min, sec, cs };
}

function formatTimeStr(ms) {
  const { min, sec, cs } = formatTime(ms);
  return `${pad(min)}:${pad(sec)}.${pad(cs)}`;
}

function updateDisplay(ms) {
  const { min, sec, cs } = formatTime(ms);
  minutesEl.textContent = pad(min);
  secondsEl.textContent = pad(sec);
  centisecondsEl.textContent = pad(cs);
}

function tick() {
  elapsed = Date.now() - startTime;
  updateDisplay(elapsed);
}

startBtn.addEventListener('click', () => {
  if (!running) {
    startTime = Date.now() - elapsed;
    if (laps.length === 0) lapStart = startTime;
    timerInterval = setInterval(tick, 10);
    running = true;
    startBtn.textContent = 'ストップ';
    startBtn.classList.add('running');
    lapBtn.disabled = false;
    resetBtn.disabled = true;
  } else {
    clearInterval(timerInterval);
    running = false;
    startBtn.textContent = 'スタート';
    startBtn.classList.remove('running');
    lapBtn.disabled = true;
    resetBtn.disabled = false;
  }
});

lapBtn.addEventListener('click', () => {
  const now = Date.now();
  const lapTime = now - (laps.length === 0 ? startTime : lapStart);
  lapStart = now;
  laps.unshift({ total: elapsed, split: lapTime });
  renderLaps();
});

resetBtn.addEventListener('click', () => {
  elapsed = 0;
  laps = [];
  updateDisplay(0);
  lapList.innerHTML = '';
  lapHeader.textContent = '';
  resetBtn.disabled = true;
  lapBtn.disabled = true;
});

function renderLaps() {
  if (laps.length === 0) {
    lapHeader.textContent = '';
    lapList.innerHTML = '';
    return;
  }

  lapHeader.textContent = `ラップ (${laps.length})`;

  const splits = laps.map(l => l.split);
  const minSplit = Math.min(...splits);
  const maxSplit = Math.max(...splits);

  lapList.innerHTML = laps.map((lap, i) => {
    const num = laps.length - i;
    let cls = '';
    if (laps.length > 1) {
      if (lap.split === minSplit) cls = 'fastest';
      else if (lap.split === maxSplit) cls = 'slowest';
    }
    return `
      <li class="${cls}">
        <span class="lap-num">ラップ ${num}</span>
        <span class="lap-time">${formatTimeStr(lap.total)}</span>
        <span class="lap-split">${formatTimeStr(lap.split)}</span>
      </li>`;
  }).join('');
}
