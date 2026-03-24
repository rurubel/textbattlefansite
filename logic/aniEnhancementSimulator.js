import { GRADE_VALUES, OPTION_TYPES } from './probability.js';

const MAX_LEVEL = 30;
const MAX_OPTION_SLOTS = 20;

const LEVEL_PROB_TABLE = [
  { success: 75, fail: 25, down: 0 },
  { success: 75, fail: 25, down: 0 },
  { success: 74, fail: 24, down: 2 },
  { success: 73, fail: 24, down: 3 },
  { success: 72, fail: 25, down: 3 },
  { success: 70, fail: 26, down: 4 },
  { success: 68, fail: 26, down: 6 },
  { success: 66, fail: 27, down: 7 },
  { success: 64, fail: 28, down: 8 },
  { success: 62, fail: 29, down: 9 },
  { success: 60, fail: 30, down: 10 },
  { success: 58, fail: 31, down: 11 },
  { success: 56, fail: 32, down: 12 },
  { success: 54, fail: 33, down: 13 },
  { success: 52, fail: 34, down: 14 },
  { success: 50, fail: 34, down: 16 },
  { success: 48, fail: 36, down: 16 },
  { success: 46, fail: 36, down: 18 },
  { success: 44, fail: 36, down: 20 },
  { success: 42, fail: 36, down: 22 },
  { success: 40, fail: 38, down: 22 },
  { success: 38, fail: 38, down: 24 },
  { success: 36, fail: 38, down: 26 },
  { success: 34, fail: 38, down: 28 },
  { success: 37, fail: 39, down: 24 },
  { success: 35, fail: 40, down: 25 },
  { success: 33, fail: 41, down: 26 },
  { success: 31, fail: 42, down: 27 },
  { success: 29, fail: 45, down: 26 },
  { success: 27, fail: 46, down: 27 },
];

function getGradeByLevel(level) {
  if (level >= 28) return 4;
  if (level >= 24) return 3;
  if (level >= 18) return 2;
  if (level >= 10) return 1;
  return 0;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getAvailableOptions(optionSlots) {
  return OPTION_TYPES.filter((opt) => optionSlots[opt].length < MAX_OPTION_SLOTS);
}

function chooseOptionOnSuccess(optionSlots, useFocus, focusOption) {
  const available = getAvailableOptions(optionSlots);
  if (available.length === 0) return null;

  if (!useFocus || !focusOption || !available.includes(focusOption)) {
    return randomChoice(available);
  }

  const otherAvailable = available.filter((opt) => opt !== focusOption);
  const roll = Math.random() * 100;
  if (roll < 40 || otherAvailable.length === 0) {
    return focusOption;
  }

  return randomChoice(otherAvailable);
}

function rollEnhancementResult(level) {
  const probs = LEVEL_PROB_TABLE[level];
  const roll = Math.random() * 100;

  if (roll < probs.success) return 'success';
  if (roll < probs.success + probs.fail) return 'fail';
  return 'down';
}

function createEmptySlots() {
  return {
    atk: [],
    spd: [],
    crit: [],
    def: [],
    hp: [],
  };
}

function sumOptionValues(optionSlots) {
  return OPTION_TYPES.reduce((acc, opt) => {
    acc[opt] = optionSlots[opt].reduce((sum, item) => sum + item.value, 0);
    return acc;
  }, {});
}

export function runAniEnhancementSimulation({ useFocus = false, focusOption = null } = {}) {
  const optionSlots = createEmptySlots();
  const history = [];
  const stats = {
    total: 0,
    success: 0,
    fail: 0,
    down: 0,
    focusHit: 0,
  };

  let level = 0;

  while (level < MAX_LEVEL) {
    const result = rollEnhancementResult(level);
    stats.total += 1;

    if (result === 'success') {
      level += 1;
      stats.success += 1;

      const targetOption = chooseOptionOnSuccess(optionSlots, useFocus, focusOption);
      if (!targetOption) continue;

      const grade = getGradeByLevel(level);
      const value = GRADE_VALUES[targetOption][grade];
      const item = { grade, value };

      optionSlots[targetOption].push(item);
      history.push(targetOption);

      if (useFocus && focusOption && targetOption === focusOption) {
        stats.focusHit += 1;
      }
      continue;
    }

    if (result === 'fail') {
      stats.fail += 1;
      continue;
    }

    stats.down += 1;
    level = Math.max(0, level - 1);

    const lastOption = history.pop();
    if (!lastOption) continue;
    optionSlots[lastOption].pop();
  }

  return {
    level,
    optionSlots,
    optionCounts: OPTION_TYPES.reduce((acc, opt) => {
      acc[opt] = optionSlots[opt].length;
      return acc;
    }, {}),
    optionValueSums: sumOptionValues(optionSlots),
    stats,
    useFocus,
    focusOption,
  };
}

export { MAX_LEVEL, MAX_OPTION_SLOTS, LEVEL_PROB_TABLE, getGradeByLevel };
