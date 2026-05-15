/**
 * UI bindings and event handlers
 */
import { getLocale, t, applyDomI18n } from './i18n.js';
import { getCharacterTexts } from './characterTexts.js';
import { calculateEfficiency } from './logic/efficiency.js';
import { getFirstStrikeDetail } from './logic/speed.js';
import {
  runMonteCarlo,
  GRADE_VALUES,
  OPTION_TYPES,
  getRandomGrade,
  calculateEfficiencyFromSubs,
} from './logic/probability.js';
import { getQuestions, calculatePosition } from './logic/testLogic.js';
import { characters } from './characters.js';
import {
  runAniEnhancementSimulation,
  MAX_PICKAXE_TRIGGER_OPTIONS,
} from './logic/aniEnhancementSimulator.js';
import {
  ATTR_IDS,
  parseOptionalNumber,
  validateAttributeCalcInput,
  computeAttributeCalc,
  formatSignedPercent,
  getModifierPercent,
  getAttributeStanceSentence,
  formatAttributeCalcDecimal,
} from './logic/attributeCompatibility.js';

const GRADE_CLASSES = ['grade-white', 'grade-green', 'grade-blue', 'grade-purple', 'grade-yellow'];

const localeRefreshers = [];

function optLabel(type) {
  return t(`common.opt.${type}`);
}

function gradeLabel(g) {
  return t(`common.grade.${g}`);
}

function formatSpeedMessage(detail) {
  if (detail.kind === 'empty') return t('speed.empty');
  if (detail.kind === 'tie') return t('speed.tie');
  const { totalDiff, spdOptionDiff } = detail;
  if (detail.kind === 'first_me') return t('speed.firstMe', { totalDiff, spdOptionDiff });
  if (detail.kind === 'first_enemy') return t('speed.firstEnemy', { totalDiff, spdOptionDiff });
  return '';
}

function fillElementSelect(select) {
  if (!select) return;
  const prev = select.value;
  select.innerHTML = '';
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = t('attr.select');
  select.appendChild(empty);
  ATTR_IDS.forEach((id) => {
    const o = document.createElement('option');
    o.value = id;
    o.textContent = t(`attr.elem.${id}`);
    select.appendChild(o);
  });
  if ([...select.options].some((o) => o.value === prev)) select.value = prev;
}

function fillProbTypeSelect(sel) {
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '';
  OPTION_TYPES.forEach((type) => {
    const o = document.createElement('option');
    o.value = type;
    o.textContent = optLabel(type);
    sel.appendChild(o);
  });
  if ([...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

function fillProbGradeSelect(sel) {
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '';
  for (let g = 0; g <= 4; g++) {
    const o = document.createElement('option');
    o.value = String(g);
    o.textContent = gradeLabel(g);
    sel.appendChild(o);
  }
  if ([...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

function fillProbTargetStar(sel) {
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '';
  for (let s = 2; s <= 5; s++) {
    const o = document.createElement('option');
    o.value = String(s);
    o.textContent = t(`probability.star${s}`);
    if (s === 5) o.selected = true;
    sel.appendChild(o);
  }
  if ([...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

function fillAniModeSelect(sel) {
  if (!sel) return;
  sel.innerHTML = '';
  [['normal', 'ani.modeNormal'], ['focus', 'ani.modeFocus']].forEach(([val, key]) => {
    const o = document.createElement('option');
    o.value = val;
    o.textContent = t(key);
    if (val === 'normal') o.selected = true;
    sel.appendChild(o);
  });
}

function fillAniFocusSelect(sel) {
  if (!sel) return;
  sel.innerHTML = '';
  OPTION_TYPES.forEach((type) => {
    const o = document.createElement('option');
    o.value = type;
    o.textContent = optLabel(type);
    sel.appendChild(o);
  });
}

function buildAniPickaxeOptions(container) {
  if (!container) return;
  container.innerHTML = '';
  OPTION_TYPES.forEach((type) => {
    const lab = document.createElement('label');
    lab.className = 'ani-inline-check';
    lab.innerHTML = `<input type="checkbox" name="ani-pickaxe-opt" value="${type}"> ${optLabel(type)}`;
    container.appendChild(lab);
  });
}

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
    const detail = getFirstStrikeDetail(
      Number(myAgi.value) || 0,
      Number(mySpd.value) || 0,
      Number(enemyAgi.value) || 0,
      Number(enemySpd.value) || 0,
      Number(conv.value) || 1
    );
    result.textContent = formatSpeedMessage(detail);
  };

  [myAgi, mySpd, enemyAgi, enemySpd, conv].forEach((el) =>
    el.addEventListener('input', update)
  );
  update();
  localeRefreshers.push(update);
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

  function ensureHint() {
    if (currentSubs.length === 0 && !subList.querySelector('.hint')) {
      const p = document.createElement('p');
      p.className = 'hint';
      p.textContent = t('probability.subHint');
      subList.appendChild(p);
    }
  }

  function renderSubList() {
    const hint = subList.querySelector('.hint');
    if (hint) hint.remove();
    subList.querySelectorAll('.sub-item').forEach((el) => el.remove());

    currentSubs.forEach((sub, i) => {
      const div = document.createElement('div');
      div.className = 'sub-item';
      div.innerHTML = `
        <span class="${GRADE_CLASSES[sub.grade]}">
  ${optLabel(sub.type)} +${sub.value}
</span>
        <button type="button" data-index="${i}">${t('common.delete')}</button>
      `;
      div.querySelector('button').addEventListener('click', () => {
        currentSubs.splice(i, 1);
        renderSubList();
      });
      subList.appendChild(div);
    });
    ensureHint();
  }

  function refreshProbSelects() {
    fillProbTypeSelect(optType);
    fillProbGradeSelect(grade);
    fillProbTargetStar(targetStar);
  }

  refreshProbSelects();
  resultEl.textContent = t('common.resultPlaceholder');

  addBtn.addEventListener('click', () => {
    const star = parseInt(targetStar.value, 10) || 5;

    if (currentSubs.length >= star - 1) {
      resultEl.textContent = t('probability.errTooMany');
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
      resultEl.textContent = t('probability.errNoSubs');
      return;
    }
    resultEl.textContent = t('common.calculating');
    resultEl.classList.remove('error');

    setTimeout(() => {
      try {
        const star = parseInt(targetStar.value, 10) || 5;
        const eff = parseInt(targetEff.value, 10) || 0;
        const currentEff = calculateEfficiencyFromSubs(currentSubs);
        const remaining = Math.max(0, star - currentSubs.length);

        if (currentEff >= eff) {
          resultEl.textContent = t('probability.prob100', { eff });
          return;
        }

        const maxPossible = currentEff + remaining * 10;

        if (eff > maxPossible) {
          resultEl.textContent = t('probability.prob0', { eff });
          return;
        }

        const p = runMonteCarlo(currentSubs, star, eff, 100000);

        let finalP = p;
        if (p > 0 && p < 1e-8) {
          finalP = 0;
        }

        function formatPercent(pct) {
          if (pct === 0) return '0';
          const percent = pct * 100;
          if (percent < 1) {
            return parseFloat(percent.toFixed(8)).toString();
          }
          return parseFloat(percent.toFixed(2)).toString();
        }

        const pct = formatPercent(finalP);

        resultEl.textContent = t('probability.prob', { eff, pct });
      } catch (e) {
        resultEl.textContent = t('probability.calcErr') + e.message;
        resultEl.classList.add('error');
      }
    }, 50);
  });

  renderSubList();

  localeRefreshers.push(() => {
    refreshProbSelects();
    renderSubList();
    resultEl.textContent = t('common.resultPlaceholder');
    resultEl.classList.remove('error');
  });
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

  const qList = () => getQuestions(getLocale());
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

    const list = qList();
    if (idx >= list.length) {
      showResult();
      return;
    }

    const q = list[idx];
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
    const pos = calculatePosition(answers, getLocale());
    resultPosition.textContent = pos.name;
    resultAttributes.innerHTML = `<p>${pos.description}</p>`;
    continueBtn.classList.toggle('hidden', answers.length >= qList().length);
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

  localeRefreshers.push(() => {
    if (!questionsDiv.classList.contains('hidden')) {
      showQuestion(currentQ);
    } else if (!resultDiv.classList.contains('hidden') && answers.length) {
      showResult();
    }
  });
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
    const type = types[Math.floor(Math.random() * 5)];
    const grade = getRandomGrade();
    const value = GRADE_VALUES[type][grade];
    return { type, grade, value };
  }

  rollBtn.addEventListener('click', () => {
    const main = randomMainStat();
    const subs = Array.from({ length: 5 }, () => randomStat());
    simMain.innerHTML = `<span>${optLabel(main.type)} +${main.value}%</span>`;
    simSubs.innerHTML = subs
      .map(
        (s) =>
          `<div class="sub-stat"><span class="${GRADE_CLASSES[s.grade]}">${optLabel(s.type)} +${s.value}</span></div>`
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

  fillAniModeSelect(modeSelect);
  fillAniFocusSelect(focusOptionSelect);
  buildAniPickaxeOptions(pickaxeOptionsEl);
  pickaxeOptionsEl.addEventListener('change', (e) => {
    const tgt = e.target;
    if (tgt && tgt.matches && tgt.matches('input[name="ani-pickaxe-opt"]')) {
      onPickaxeCheckboxChange(e);
    }
  });

  function updateModeUI() {
    const isFocus = modeSelect.value === 'focus';
    focusOptionSelect.disabled = !isFocus;
    const pickaxeCheckboxes = pickaxeOptionsEl.querySelectorAll('input[type="checkbox"]');
    pickaxeCheckboxes.forEach((cb) => {
      cb.disabled = false;
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
    const tu = t('ani.timesUnit');
    const focusText =
      useFocus && focusOption
        ? `
        <p><strong>${t('ani.resFocusOpt')}</strong>: ${optLabel(focusOption)}</p>
        <p><strong>${t('ani.resFocusHits')}</strong>: ${stats.focusHit}${tu}</p>
      `
        : '';

    const pickaxeLabels =
      usePickaxe && pickaxeTriggerOptions && pickaxeTriggerOptions.length
        ? pickaxeTriggerOptions.map((o) => optLabel(o)).join(', ')
        : '';

    const pickaxeText = usePickaxe
      ? `
        <p><strong>${t('ani.resPickOpts')}</strong>: ${pickaxeLabels || t('ani.none')}</p>
        <p><strong>${t('ani.resPickUses')}</strong>: ${stats.pickaxeUsed}${tu}</p>
      `
      : '';

    const statLines = ['atk', 'spd', 'crit', 'def', 'hp']
      .filter((key) => optionCounts[key] > 0)
      .sort((a, b) => optionCounts[b] - optionCounts[a])
      .map(
        (key) =>
          `<p><strong>${optLabel(key)}</strong> ${t('ani.slotSum', {
            n: optionCounts[key],
            v: optionValueSums[key],
          })}</p>`
      )
      .join('');

    resultEl.innerHTML = `
      <div class="ani-result-grid">
        <p><strong>${t('ani.resTotal')}</strong>: ${stats.total}${tu}</p>
        <p><strong>${t('ani.resSuccess')}</strong>: ${stats.success}${tu}</p>
        <p><strong>${t('ani.resFail')}</strong>: ${stats.fail}${tu}</p>
        <p><strong>${t('ani.resDown')}</strong>: ${stats.down}${tu}</p>
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
  pickaxeEnabled.addEventListener('change', () => {
    if (!pickaxeEnabled.checked) {
      pickaxeOptionsEl.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.checked = false;
      });
    }
    updateModeUI();
  });
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
  resultEl.textContent = t('common.resultPlaceholder');

  localeRefreshers.push(() => {
    fillAniModeSelect(modeSelect);
    fillAniFocusSelect(focusOptionSelect);
    buildAniPickaxeOptions(pickaxeOptionsEl);
    updateModeUI();
    if (!resultEl.querySelector('.ani-result-grid')) {
      resultEl.textContent = t('common.resultPlaceholder');
    }
  });
}

// --- Characters ---
function initCharacters() {
  let currentIndex = 1;
  let currentCharacter = null;
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
    currentIndex = 1;
    img.src = `${basePath}${c.id}/${currentIndex}.webp`;

    const texts = getCharacterTexts(getLocale(), c.id);
    name.textContent = c.name;
    line.textContent = texts?.line || '';
    description.textContent = texts?.description || '';
    if (story) {
      story.textContent = texts?.story || '';
    }
    extra.innerHTML = (texts?.extra || []).map((x) => `<p>${x}</p>`).join('');
  }

  const randomBtn = document.getElementById('char-random-btn');

  randomBtn.addEventListener('click', () => {
    if (!currentCharacter) return;
    currentIndex++;
    if (currentIndex > currentCharacter.imageCount) {
      currentIndex = 1;
    }
    img.src = `${basePath}${currentCharacter.id}/${currentIndex}.webp`;
  });

  function renderSelector() {
    selector.innerHTML = characters
      .map(
        (c) => `
      <button type="button" class="btn btn-secondary char-btn" data-id="${c.id}">
        ${c.name}
      </button>
    `
      )
      .join('');

    selector.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const c = characters.find((x) => x.id === id);
        selector.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderCharacter(c);
      });
    });
  }

  renderSelector();
  renderCharacter(characters[0]);
  const firstBtn = selector.querySelector('button');
  if (firstBtn) firstBtn.classList.add('active');

  localeRefreshers.push(() => {
    if (currentCharacter) renderCharacter(currentCharacter);
  });
}

// --- Attribute compatibility calculator ---
function renderAttributeMatrix(container) {
  if (!container) return;
  container.innerHTML = '';
  const table = document.createElement('table');
  table.className = 'attr-matrix-table';

  const thead = document.createElement('thead');
  const headTr = document.createElement('tr');
  const corner = document.createElement('th');
  corner.className = 'attr-matrix-corner';
  corner.textContent = t('attr.matrixCorner');
  headTr.appendChild(corner);
  ATTR_IDS.forEach((id) => {
    const th = document.createElement('th');
    th.textContent = t(`attr.elem.${id}`);
    headTr.appendChild(th);
  });
  thead.appendChild(headTr);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  ATTR_IDS.forEach((rowId, i) => {
    const tr = document.createElement('tr');
    const rowTh = document.createElement('th');
    rowTh.textContent = t(`attr.elem.${rowId}`);
    tr.appendChild(rowTh);
    ATTR_IDS.forEach((colId, j) => {
      const td = document.createElement('td');
      if (i === j) {
        td.textContent = t('attr.matrixDash');
        td.className = 'attr-matrix-cell attr-matrix-diag';
      } else {
        const pct = getModifierPercent(rowId, colId);
        td.textContent = formatSignedPercent(pct);
        td.className = 'attr-matrix-cell';
        if (pct > 0) td.classList.add('attr-matrix-pos');
        else if (pct < 0) td.classList.add('attr-matrix-neg');
        else td.classList.add('attr-matrix-zero');
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

function initAttributeCalculator() {
  const wrap = document.getElementById('attr-matrix-wrap');
  const myAtk = document.getElementById('attr-my-atk');
  const myHp = document.getElementById('attr-my-hp');
  const myElem = document.getElementById('attr-my-elem');
  const oppAtk = document.getElementById('attr-opp-atk');
  const oppHp = document.getElementById('attr-opp-hp');
  const oppElem = document.getElementById('attr-opp-elem');
  const btn = document.getElementById('attr-calc-btn');
  const resultEl = document.getElementById('attr-result');

  function refreshAttrSelects() {
    fillElementSelect(myElem);
    fillElementSelect(oppElem);
  }

  refreshAttrSelects();
  if (wrap) renderAttributeMatrix(wrap);
  resultEl.textContent = t('attr.resultPlaceholder');

  if (!btn || !resultEl || !myElem || !oppElem) return;

  btn.addEventListener('click', () => {
    resultEl.classList.remove('error');

    const payload = {
      myAttr: myElem.value,
      oppAttr: oppElem.value,
      myHp: parseOptionalNumber(myHp?.value),
      myDmg: parseOptionalNumber(myAtk?.value),
      oppHp: parseOptionalNumber(oppHp?.value),
      oppDmg: parseOptionalNumber(oppAtk?.value),
    };

    const validation = validateAttributeCalcInput(payload);
    if (!validation.ok) {
      resultEl.textContent = t('attr.errorSelect');
      resultEl.classList.add('error');
      return;
    }

    const { myPercent, oppPercent, lines } = computeAttributeCalc(payload);
    const frag = document.createDocumentFragment();
    const summary = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = t('attr.summaryPrefix');
    summary.appendChild(strong);
    summary.appendChild(
      document.createTextNode(
        `${t('attr.youAdj')}${formatSignedPercent(myPercent)}${t('attr.summaryJoin')}${t('attr.oppAdj')}${formatSignedPercent(oppPercent)}`
      )
    );
    frag.appendChild(summary);

    const stanceLabels = {
      even: t('attr.stance.even'),
      slightDis: t('attr.stance.slightDis'),
      slightAdv: t('attr.stance.slightAdv'),
      dis: t('attr.stance.dis'),
      adv: t('attr.stance.adv'),
    };

    const stanceP1 = document.createElement('p');
    stanceP1.className = 'attr-calc-stance';
    stanceP1.textContent =
      getAttributeStanceSentence(myPercent, 'player', stanceLabels) ??
      t('attr.stanceFallbackYou', { pct: formatSignedPercent(myPercent) });
    frag.appendChild(stanceP1);

    const stanceP2 = document.createElement('p');
    stanceP2.className = 'attr-calc-stance';
    stanceP2.textContent =
      getAttributeStanceSentence(oppPercent, 'opponent', stanceLabels) ??
      t('attr.stanceFallbackOpp', { pct: formatSignedPercent(oppPercent) });
    frag.appendChild(stanceP2);

    const ul = document.createElement('ul');
    ul.className = 'attr-calc-result-list';
    lines.forEach(({ key, before, after }) => {
      const li = document.createElement('li');
      const label = t(`attr.lineKeys.${key}`);
      if (before === null) {
        li.textContent = `${label}: ${t('attr.omitted')}`;
      } else {
        li.textContent = `${label}: ${formatAttributeCalcDecimal(before)}${t('attr.arrow')}${formatAttributeCalcDecimal(after)}${t('attr.afterSuffix')}`;
      }
      ul.appendChild(li);
    });
    frag.appendChild(ul);

    resultEl.innerHTML = '';
    resultEl.appendChild(frag);
  });

  localeRefreshers.push(() => {
    refreshAttrSelects();
    if (wrap) renderAttributeMatrix(wrap);
    resultEl.textContent = t('attr.resultPlaceholder');
    resultEl.classList.remove('error');
  });
}

// --- Mobile menu ---
function initMobileMenu() {
  setTimeout(() => {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (btn && nav) {
      btn.addEventListener('click', () => {
        nav.classList.toggle('open');
      });
    }
  }, 0);
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

  if (isRightSide) {
    x = e.pageX - menuWidth;
  } else {
    x = e.pageX;
  }

  if (e.clientY > window.innerHeight / 2) {
    y = e.pageY - menuHeight;
  } else {
    y = e.pageY;
  }

  x = Math.max(0, Math.min(x, window.innerWidth - menuWidth));
  y = Math.max(0, Math.min(y, window.innerHeight - menuHeight));

  menu.style.left = x + 'px';
  menu.style.top = y + 'px';

  menu.classList.remove('hidden');
});

document.addEventListener('click', () => {
  menu.classList.add('hidden');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    menu.classList.add('hidden');
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    menu.classList.add('hidden');
  }
});

window.addEventListener('blur', () => {
  menu.classList.add('hidden');
});

function runLocaleRefreshers() {
  applyDomI18n();
  localeRefreshers.forEach((fn) => {
    try {
      fn();
    } catch (_) {}
  });
}

window.addEventListener('tb-locale-change', runLocaleRefreshers);

export function initUI() {
  initEfficiencyCalc();
  initSpeedCalc();
  initAttributeCalculator();
  initProbabilityCalc();
  initAniEnhancementSimulator();
  initPositionTest();
  initCardSimulator();
  initCharacters();
  initMobileMenu();

  document.getElementById('prob-result').textContent = t('common.resultPlaceholder');
  document.getElementById('ani-result').textContent = t('common.resultPlaceholder');
}
