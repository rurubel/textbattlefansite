/**
 * Monte Carlo simulation for probability of reaching target efficiency
 * Option types: atk, spd, crit, def, hp
 * Grades: 0(흰), 1(초), 2(파), 3(보), 4(황)
 */

const OPTION_TYPES = ['atk', 'spd', 'crit', 'def', 'hp'];
const GRADE_NAMES = ['흰', '초', '파', '보', '황'];
const GRADE_PROB = [0.40, 0.25, 0.20, 0.10, 0.05];

// Grade to value range [min, max] for each stat
const GRADE_VALUES = {
  atk: { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 },
  spd: { 0: 2, 1: 3, 2: 4, 3: 5, 4: 6 },
  crit: { 0: 1, 1: 1.5, 2: 2, 3: 2.5, 4: 3 },
  def: { 0: 0.5, 1: 1, 2: 1.5, 3: 2.0, 4: 2.5 },
  hp: { 0: 2, 1: 3, 2: 5, 3: 6, 4: 8 },
};

function subToStats(subs) {
  const stats = { atk: 0, def: 0, hp: 0 };
  for (const sub of subs) {
    if (sub.type in stats) {
      stats[sub.type] += sub.value;
    }
  }
  return stats;
}

function getRandomGrade() {
  const r = Math.random();
  let cumulative = 0;

  for (let i = 0; i < GRADE_PROB.length; i++) {
    cumulative += GRADE_PROB[i];
    if (r < cumulative) {
      return i;
    }
  }

  return GRADE_PROB.length - 1; // fallback
}

function randomSubOption() {
  const optType = OPTION_TYPES[Math.floor(Math.random() * 5)];
  const grade = getRandomGrade(); // 🔥 변경
  const value = GRADE_VALUES[optType][grade];
  return { type: optType, grade, value };
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
  if (p > 0 && p < 1e-8) return 0;
  if (p < 0.01) return Number(p.toFixed(8));
  return Math.round(p * 100) / 100;
}

export { GRADE_NAMES, OPTION_TYPES, GRADE_VALUES, GRADE_PROB, getRandomGrade };
