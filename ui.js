/**
 * UI bindings and event handlers
 */
import { calculateEfficiency } from './logic/efficiency.js';
import { getFirstStrikeDetail } from './logic/speed.js';
import {
  runMonteCarlo,
  formatProbability,
  GRADE_NAMES,
  GRADE_VALUES,
  OPTION_TYPES,
} from './logic/probability.js';
import { getQuestions, calculatePosition } from './logic/testLogic.js';
import { characters } from './characters.js';
import {
  runAniEnhancementSimulation,
  MAX_PICKAXE_TRIGGER_OPTIONS,
} from './logic/aniEnhancementSimulator.js';

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
        <span class="${GRADE_CLASSES[sub.grade]}">
  ${OPT_LABELS[sub.type]} +${sub.value}
</span>
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
    const star = parseInt(targetStar.value, 10) || 5;
  
    // ✅ 목표 성급 이상이면 추가 금지
    if (currentSubs.length >= star-1) {
      resultEl.textContent = `부옵을 목표 성급과 같거나 높게 추가할 수 없습니다.`;
      resultEl.classList.add('error');
      return;
    }
  
    const type = optType.value;
    const g = parseInt(grade.value, 10);
    const val = GRADE_VALUES[type][g];
  
    currentSubs.push({ type, grade: g, value: val });
    renderSubList();
  });

  calcBtn.addEventListener('click', () => {
    if (currentSubs.length === 0) {
      resultEl.textContent = '계산을 원하시는 카드의 부옵을 추가 해주세요';
      return;
    }
    resultEl.textContent = '계산 중...';
    resultEl.classList.remove('error');
  
    setTimeout(() => {
      try {
        const star = parseInt(targetStar.value, 10) || 5;
        const eff = parseInt(targetEff.value, 10) || 0;
        const currentEff = calculateEfficiency(currentSubs);
        const remaining = Math.max(0, star - currentSubs.length);
  
        if (currentEff >= eff) {
          resultEl.textContent = `목표 효율 ${eff}의 달성 확률은 100% 입니다.`;
          return;
        }
  
        const maxPossible = currentEff + (remaining * 10);
  
        if (eff > maxPossible) {
          resultEl.textContent = `목표 효율 ${eff} 달성 확률: 0%`;
          return;
        }
  
        const p = runMonteCarlo(currentSubs, star, eff, 100000);
  
        // 🔥 확률 후처리 (초소수 → 0 처리)
        let finalP = p;
        if (p > 0 && p < 1e-8) {
          finalP = 0;
        }
  
        const pct = finalP === 0
          ? '0'
          : finalP < 0.01
            ? (finalP * 100).toFixed(8)
            : (finalP * 100).toFixed(2);
  
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

  const MAIN_VALUES = {
    atk: 30,
    spd: 30,
    def: 30,
    hp: 30,
    crit: 15,
  };

  function randomMainStat() {
    const types = ['atk', 'spd', 'crit', 'def', 'hp'];
    const type = types[Math.floor(Math.random() * 5)];
    const value = MAIN_VALUES[type];
  
    return { type, value };
  }

  function randomStat() {
    const types = ['atk', 'spd', 'crit', 'def', 'hp'];
    const grades = [0, 1, 2, 3, 4];
    const type = types[Math.floor(Math.random() * 5)];
    const grade = grades[Math.floor(Math.random() * 5)];
    const value = GRADE_VALUES[type][grade];
    return { type, grade, value };
  }

  rollBtn.addEventListener('click', () => {
    const main = randomMainStat();
    const subs = Array.from({ length: 5 }, () => randomStat());
    simMain.innerHTML = `
  <span>
    ${OPT_LABELS[main.type]} +${main.value}%
  </span>
`;
    simSubs.innerHTML = subs
      .map(
        (s) =>
          `<div class="sub-stat"><span class="${GRADE_CLASSES[s.grade]}">${OPT_LABELS[s.type]} +${s.value}</span></div>`
      )
      .join('');
    cardResult.classList.remove('hidden');
  });
}

// --- Ani Enhancement Simulator ---
function initAniEnhancementSimulator() {
  const modeSelect = document.getElementById('ani-mode');
  const focusOptionSelect = document.getElementById('ani-focus-option');
  const pickaxeEnabled = document.getElementById('ani-pickaxe-enabled');
  const pickaxeOptionsEl = document.getElementById('ani-pickaxe-options');
  const runBtn = document.getElementById('ani-run-btn');
  const resultEl = document.getElementById('ani-result');

  if (
    !modeSelect ||
    !focusOptionSelect ||
    !pickaxeEnabled ||
    !pickaxeOptionsEl ||
    !runBtn ||
    !resultEl
  ) {
    return;
  }

  const pickaxeCheckboxes = pickaxeOptionsEl.querySelectorAll('input[type="checkbox"]');

  function updateModeUI() {
    const isFocus = modeSelect.value === 'focus';
    focusOptionSelect.disabled = !isFocus;
    const pickaxeOn = pickaxeEnabled.checked;
    pickaxeCheckboxes.forEach((cb) => {
      cb.disabled = false;
    });
    pickaxeEnabled.addEventListener('change', () => {
      if (!pickaxeEnabled.checked) {
        pickaxeCheckboxes.forEach(cb => cb.checked = false);
      }
      updateModeUI();
    });
  }

  function onPickaxeCheckboxChange(e) {
    if (e.target.checked) {
      pickaxeEnabled.checked = true;
    }
    const checked = pickaxeOptionsEl.querySelectorAll('input[type="checkbox"]:checked');
    if (checked.length > MAX_PICKAXE_TRIGGER_OPTIONS) {
      e.target.checked = false;
    }
  }

  function renderResult(result) {
    const {
      stats,
      optionCounts,
      optionValueSums,
      useFocus,
      focusOption,
      usePickaxe,
      pickaxeTriggerOptions,
    } = result;
    const focusText =
      useFocus && focusOption
        ? `
        <p><strong>집중 강화 옵션</strong>: ${OPT_LABELS[focusOption]}</p>
        <p><strong>집중 강화 옵션 강화 횟수</strong>: ${stats.focusHit}회</p>
      `
        : '';

    const pickaxeLabels =
      usePickaxe && pickaxeTriggerOptions && pickaxeTriggerOptions.length
        ? pickaxeTriggerOptions.map((o) => OPT_LABELS[o]).join(', ')
        : '';

    const pickaxeText = usePickaxe
      ? `
        <p><strong>곡괭이 발동 옵션</strong>: ${pickaxeLabels || '없음'}</p>
        <p><strong>곡괭이 사용 횟수</strong>: ${stats.pickaxeUsed}회</p>
      `
      : '';
    const statLines = [
      { key: 'atk', label: '공' },
      { key: 'spd', label: '속' },
      { key: 'crit', label: '크' },
      { key: 'def', label: '방' },
      { key: 'hp', label: '체' },
    ]
      .filter(stat => optionValueSums[stat.key] > 0) // 🔥 핵심
      .map(stat => `
        <p><strong>${stat.label}</strong> (${optionCounts[stat.key]}칸) 합계값: ${optionValueSums[stat.key]}</p>
      `)
      .join('');

    resultEl.innerHTML = `
      <div class="ani-result-grid">
        <p><strong>총 시도 횟수</strong>: ${stats.total}회</p>
        <p><strong>성공</strong>: ${stats.success}회</p>
        <p><strong>실패</strong>: ${stats.fail}회</p>
        <p><strong>하락</strong>: ${stats.down}회</p>
        ${focusText}
        ${pickaxeText}
      </div>
      <hr class="ani-divider">
      <div class="ani-result-grid">
      ${statLines}
      </div>
    `;
  }

  modeSelect.addEventListener('change', updateModeUI);
  pickaxeEnabled.addEventListener('change', updateModeUI);
  pickaxeCheckboxes.forEach((cb) => cb.addEventListener('change', onPickaxeCheckboxChange));
  runBtn.addEventListener('click', () => {
    const useFocus = modeSelect.value === 'focus';
    const focusOption = useFocus ? focusOptionSelect.value : null;
    const usePickaxe = pickaxeEnabled.checked;
    const pickaxeTriggerOptions = usePickaxe
      ? [...pickaxeOptionsEl.querySelectorAll('input[type="checkbox"]:checked')].map(
          (el) => el.value
        )
      : [];
    const result = runAniEnhancementSimulation({
      useFocus,
      focusOption,
      usePickaxe,
      pickaxeTriggerOptions,
    });
    renderResult(result);
  });

  updateModeUI();
}

// --- Characters ---
function initCharacters() {
  let currentCharacter = null;
  let lastIndex = 1;
  const selector = document.getElementById('char-selector');
  const img = document.getElementById('char-img');
  const name = document.getElementById('char-name');
  const description = document.getElementById('char-description');
  const line = document.getElementById('char-line');
  const story = document.getElementById('char-story');
  const extra = document.getElementById('char-extra');

  const basePath = 'assets/characters/';

  function renderCharacter(c) {
    currentCharacter = c;
  
    // 👉 기본 이미지는 1번
    img.src = `${basePath}${c.id}/1.webp`;
  
    name.textContent = c.name;
    line.textContent = c.line || '';
    description.textContent = c.description;
  
    extra.innerHTML = (c.extra || [])
      .map(t => `<p>${t}</p>`)
      .join('');
  }

  const randomBtn = document.getElementById('char-random-btn');

  randomBtn.addEventListener('click', () => {
    if (!currentCharacter) return;
  
    let randomIndex;
  
    do {
      randomIndex = Math.floor(Math.random() * currentCharacter.imageCount) + 1;
    } while (randomIndex === lastIndex);
  
    lastIndex = randomIndex;
  
    img.src = `${basePath}${currentCharacter.id}/${randomIndex}.webp`;
  });

  function renderSelector() {
    selector.innerHTML = characters.map(c => `
      <button class="btn btn-secondary char-btn" data-id="${c.id}">
        ${c.name}
      </button>
    `).join('');

    selector.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const c = characters.find(x => x.id === id);
    
        // ✅ 기존 active 제거
        selector.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    
        // ✅ 클릭한 버튼에 active 추가
        btn.classList.add('active');
    
        // 캐릭터 렌더링
        renderCharacter(c);
      });
    });
  }

  renderSelector();
  renderCharacter(characters[0]); // 첫 캐릭터 기본 표시

  const firstBtn = selector.querySelector('button');
if (firstBtn) firstBtn.classList.add('active');
}

// --- Mobile menu ---
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.nav');
  if (btn && nav) {
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }
}

const menu = document.getElementById('custom-menu');

document.addEventListener('contextmenu', (e) => {
  e.preventDefault();

  const rect = menu.getBoundingClientRect();
  const menuWidth = rect.width;
  const menuHeight = rect.height;

  const isRightSide = e.clientX > window.innerWidth / 2;

  let x;
  let y;

  // 👉 좌우 방향 결정
  if (isRightSide) {
    // 오른쪽 클릭 → 왼쪽에 표시
    x = e.pageX - menuWidth;
  } else {
    // 왼쪽 클릭 → 오른쪽에 표시
    x = e.pageX;
  }

  // 👉 아래로 넘치면 위로
  if (e.clientY > window.innerHeight / 2) {
    y = e.pageY - menuHeight;
  } else {
    y = e.pageY;
  }

  // 👉 화면 밖 방지 (보정)
  x = Math.max(0, Math.min(x, window.innerWidth - menuWidth));
  y = Math.max(0, Math.min(y, window.innerHeight - menuHeight));

  menu.style.left = x + 'px';
  menu.style.top = y + 'px';

  menu.classList.remove('hidden');
});

// 클릭하면 닫기
document.addEventListener('click', () => {
  menu.classList.add('hidden');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    menu.classList.add('hidden');
  }
});

// 탭 이동 / 최소화
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    menu.classList.add('hidden');
  }
});

// 다른 프로그램 클릭
window.addEventListener('blur', () => {
  menu.classList.add('hidden');
});

export function initUI() {
  initEfficiencyCalc();
  initSpeedCalc();
  initProbabilityCalc();
  initAniEnhancementSimulator();
  initPositionTest();
  initCardSimulator();
  initCharacters();
  initMobileMenu();
}
