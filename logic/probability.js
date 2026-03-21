/**
 * Monte Carlo simulation for probability of reaching target efficiency
 * Option types: atk, spd, crit, def, hp
 * Grades: 0(흰), 1(초), 2(파), 3(보), 4(황)
 */

const OPTION_TYPES = ['atk', 'spd', 'crit', 'def', 'hp'];
const GRADE_NAMES = ['흰', '초', '파', '보', '황'];

// Grade to value range [min, max] for each stat
const GRADE_VALUE_RANGES = {
  atk: { 0: [1, 3], 1: [2, 5], 2: [4, 8], 3: [6, 12], 4: [10, 18] },
  spd: { 0: [1, 2], 1: [2, 4], 2: [3, 6], 3: [5, 10], 4: [8, 15] },
  crit: { 0: [1, 2], 1: [2, 4], 2: [3, 6], 3: [5, 10], 4: [8, 15] },
  def: { 0: [1, 3], 1: [2, 5], 2: [4, 8], 3: [6, 12], 4: [10, 18] },
  hp: { 0: [2, 5], 1: [4, 10], 2: [8, 18], 3: [12, 25], 4: [20, 40] },
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSubOption() {
  const optType = OPTION_TYPES[Math.floor(Math.random() * 5)];
  const grade = Math.floor(Math.random() * 5);
  const [min, max] = GRADE_VALUE_RANGES[optType][grade];
  const value = getRandomInt(min, max);
  return { type: optType, grade, value };
}

function subToStats(subs) {
  const stats = { atk: 0, def: 0, hp: 0 };
  for (const sub of subs) {
    if (sub.type in stats) {
      stats[sub.type] += sub.value;
    }
  }
  return stats;
}

export function calculateEfficiencyFromSubs(subs) {
  const stats = subToStats(subs);
  return stats.atk * 2 + stats.def * 2 + stats.hp;
}

export function runMonteCarlo(currentSubs, targetStar, targetEfficiency, iterations = 100000) {
  const subCount = Math.min(5, Math.max(1, parseInt(targetStar, 10) || 5));
  const remaining = Math.max(0, subCount - currentSubs.length);

  let successCount = 0;

  for (let i = 0; i < iterations; i++) {
    const allSubs = [...currentSubs];
    for (let j = 0; j < remaining; j++) {
      allSubs.push(randomSubOption());
    }
    const efficiency = calculateEfficiencyFromSubs(allSubs);
    if (efficiency >= targetEfficiency) {
      successCount++;
    }
  }

  return successCount / iterations;
}

export function formatProbability(p) {
  if (p < 0.01 && p > 0) {
    return p.toFixed(8);
  }
  return Math.round(p * 100) / 100;
}

export { GRADE_NAMES, OPTION_TYPES };
