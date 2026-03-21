/**
 * UI bindings and event handlers
 */
import { calculateEfficiency } from './logic/efficiency.js';
import { getFirstStrikeDetail } from './logic/speed.js';
import {
  runMonteCarlo,
  formatProbability,
  GRADE_NAMES,
  OPTION_TYPES,
} from './logic/probability.js';
import { getQuestions, calculatePosition } from './logic/testLogic.js';
import { characters } from './characters.js';

const OPT_LABELS = { atk: '공', spd: '속', crit: '크', def: '방', hp: '체' };
const GRADE_CLASSES = ['grade-white', 'grade-green', 'grade-blue', 'grade-purple', 'grade-yellow'];

// --- Efficiency Calculator ---
function initEfficiencyCalc() {
  const atk = document.getElementById('eff-atk');
  const def = document.getElementById('eff-def');
  const hp = document.getElementById('eff-hp');
  const result = document.getElementById('eff-result');

  const update = () => {
    const val = calculateEfficiency(
      Number(atk.value) || 0,
      Number(def.value) || 0,
      Number(hp.value) || 0
    );
    result.textContent = val;
  };

  [atk, def, hp].forEach((el) => el.addEventListener('input', update));
  update();
}

// --- Speed Calculator ---
function initSpeedCalc() {
  const myAgi = document.getElementById('speed-my-agi');
  const mySpd = document.getElementById('speed-my-spd');
  const enemyAgi = document.getElementById('speed-enemy-agi');
  const enemySpd = document.getElementById('speed-enemy-spd');
  const conv = document.getElementById('speed-conv');
  const result = document.getElementById('speed-result');

  const update = () => {
    const text = getFirstStrikeDetail(
      Number(myAgi.value) || 0,
      Number(mySpd.value) || 0,
      Number(enemyAgi.value) || 0,
      Number(enemySpd.value) || 0,
      Number(conv.value) || 1
    );
    result.textContent = text;
  };

  [myAgi, mySpd, enemyAgi, enemySpd, conv].forEach((el) =>
    el.addEventListener('input', update)
  );
}

// --- Probability Calculator ---
function initProbabilityCalc() {
  const subList = document.getElementById('prob-sub-list');
  const optType = document.getElementById('prob-opt-type');
  const grade = document.getElementById('prob-grade');
  const valueInput = document.getElementById('prob-value');
  const addBtn = document.getElementById('prob-add-btn');
  const targetStar = document.getElementById('prob-target-star');
  const targetEff = document.getElementById('prob-target-eff');
  const calcBtn = document.getElementById('prob-calc-btn');
  const resultEl = document.getElementById('prob-result');

  let currentSubs = [];

  function renderSubList() {
    const hint = subList.querySelector('.hint');
    if (hint) hint.remove();
    subList.querySelectorAll('.sub-item').forEach((el) => el.remove());

    currentSubs.forEach((sub, i) => {
      const div = document.createElement('div');
      div.className = 'sub-item';
      div.innerHTML = `
        <span>${OPT_LABELS[sub.type]} ${GRADE_NAMES[sub.grade]} ${sub.value}</span>
        <button type="button" data-index="${i}">삭제</button>
      `;
      div.querySelector('button').addEventListener('click', () => {
        currentSubs.splice(i, 1);
        renderSubList();
      });
      subList.appendChild(div);
    });
  }

  addBtn.addEventListener('click', () => {
    if (currentSubs.length >= 4) return;
    const type = optType.value;
    const g = parseInt(grade.value, 10);
    const val = parseInt(valueInput.value, 10) || 0;
    currentSubs.push({ type, grade: g, value: val });
    valueInput.value = '';
    renderSubList();
  });

  calcBtn.addEventListener('click', () => {
    resultEl.textContent = '계산 중...';
    resultEl.classList.remove('error');
    setTimeout(() => {
      try {
        const star = parseInt(targetStar.value, 10) || 5;
        const eff = parseInt(targetEff.value, 10) || 0;
        const p = runMonteCarlo(currentSubs, star, eff, 100000);
        const formatted = formatProbability(p);
        const pct = p < 0.01 ? (p * 100).toFixed(8) : (p * 100).toFixed(2);
        resultEl.textContent = `목표 효율 ${eff} 달성 확률: ${pct}%`;
      } catch (e) {
        resultEl.textContent = '계산 오류: ' + e.message;
        resultEl.classList.add('error');
      }
    }, 50);
  });

  renderSubList();
}

// --- Position Test ---
function initPositionTest() {
  const intro = document.getElementById('position-intro');
  const questionsDiv = document.getElementById('position-questions');
  const resultDiv = document.getElementById('position-result');
  const startBtn = document.getElementById('position-start-btn');
  const qNum = document.getElementById('q-num');
  const qText = document.getElementById('q-text');
  const qOptions = document.getElementById('q-options');
  const qNextBtn = document.getElementById('q-next-btn');
  const qResultBtn = document.getElementById('q-result-btn');
  const resultPosition = document.getElementById('result-position');
  const resultAttributes = document.getElementById('result-attributes');
  const continueBtn = document.getElementById('result-continue-btn');
  const restartBtn = document.getElementById('result-restart-btn');

  const qList = getQuestions();
  let currentQ = 0;
  let answers = [];

  function showIntro() {
    intro.classList.remove('hidden');
    questionsDiv.classList.add('hidden');
    resultDiv.classList.add('hidden');
    currentQ = 0;
    answers = [];
  }

  function showQuestion(idx) {
    intro.classList.add('hidden');
    resultDiv.classList.add('hidden');
    questionsDiv.classList.remove('hidden');

    if (idx >= qList.length) {
      showResult();
      return;
    }

    const q = qList[idx];
    qNum.textContent = `Q${q.id}`;
    qText.textContent = q.text;
    qOptions.innerHTML = '';
    q.options.forEach((opt) => {
      const label = document.createElement('label');
      label.innerHTML = `
        <input type="radio" name="q-opt" value="${opt.value}">
        ${opt.label}
      `;
      qOptions.appendChild(label);
    });

    qResultBtn.classList.toggle('hidden', idx < 3);
    currentQ = idx;
  }

  function collectAnswer() {
    const sel = document.querySelector('input[name="q-opt"]:checked');
    return sel ? sel.value : null;
  }

  function showResult() {
    intro.classList.add('hidden');
    questionsDiv.classList.add('hidden');
    resultDiv.classList.remove('hidden');
    const pos = calculatePosition(answers);
    resultPosition.textContent = pos.name;
    resultAttributes.innerHTML = `
      <p>${pos.description}</p>
      <ul>
        ${pos.attributes.map((a) => `<li>${a}</li>`).join('')}
      </ul>
    `;
    continueBtn.classList.toggle('hidden', answers.length >= qList.length);
  }

  startBtn.addEventListener('click', () => showQuestion(0));

  qNextBtn.addEventListener('click', () => {
    const ans = collectAnswer();
    if (ans) {
      answers.push(ans);
      showQuestion(currentQ + 1);
    }
  });

  qResultBtn.addEventListener('click', () => {
    const ans = collectAnswer();
    if (ans) answers.push(ans);
    showResult();
  });

  continueBtn.addEventListener('click', () => showQuestion(currentQ));
  restartBtn.addEventListener('click', showIntro);

  showIntro();
}

// --- Card Simulator ---
function initCardSimulator() {
  const rollBtn = document.getElementById('card-roll-btn');
  const cardResult = document.getElementById('card-result');
  const simMain = document.getElementById('sim-main');
  const simSubs = document.getElementById('sim-subs');

  function randomStat() {
    const types = ['atk', 'spd', 'crit', 'def', 'hp'];
    const grades = [0, 1, 2, 3, 4];
    const type = types[Math.floor(Math.random() * 5)];
    const grade = grades[Math.floor(Math.random() * 5)];
    const valueRanges = { atk: 10, spd: 8, crit: 6, def: 10, hp: 25 };
    const maxVal = valueRanges[type] || 10;
    const value = Math.floor(Math.random() * maxVal) + 1;
    return { type, grade, value };
  }

  rollBtn.addEventListener('click', () => {
    const main = randomStat();
    const subs = Array.from({ length: 5 }, () => randomStat());
    simMain.innerHTML = `
      <span class="${GRADE_CLASSES[main.grade]}">${OPT_LABELS[main.type]} ${GRADE_NAMES[main.grade]} +${main.value}</span>
    `;
    simSubs.innerHTML = subs
      .map(
        (s) =>
          `<div class="sub-stat"><span class="${GRADE_CLASSES[s.grade]}">${OPT_LABELS[s.type]} ${GRADE_NAMES[s.grade]} +${s.value}</span></div>`
      )
      .join('');
    cardResult.classList.remove('hidden');
  });
}

// --- Characters ---
function initCharacters() {
  const grid = document.getElementById('character-grid');
  const basePath = 'assets/characters/';

  function render() {
    grid.innerHTML = characters
      .map(
        (c) => `
      <div class="character-card">
        <img src="${basePath}${c.image}" alt="${c.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2250%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22>${encodeURIComponent(c.name)}</text></svg>'">
        <div class="char-info">
          <h4>${c.name}</h4>
          <p>${c.description}</p>
        </div>
      </div>
    `
      )
      .join('');
  }

  render();
}

// --- Mobile menu ---
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.nav');
  if (btn && nav) {
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }
}

export function initUI() {
  initEfficiencyCalc();
  initSpeedCalc();
  initProbabilityCalc();
  initPositionTest();
  initCardSimulator();
  initCharacters();
  initMobileMenu();
}
