/**
 * Position tendency test logic
 */
import { answerWeights } from '../positions.js';
import { getLocalizedPositions, getLocalizedQuestions } from '../gameLocales.js';

export function getQuestions(locale = 'ko') {
  return getLocalizedQuestions(locale);
}

export function calculatePosition(answers, locale = 'ko') {
  const scores = {};
  const positions = getLocalizedPositions(locale);

  for (const posId of Object.keys(positions)) {
    scores[posId] = 0;
  }

  for (const answer of answers) {
    const weights = answerWeights[answer];
    if (!weights) continue;

    for (const [posId, score] of Object.entries(weights)) {
      scores[posId] += score;
    }
  }

  let bestScore = -Infinity;
  let bestIds = [];

  for (const [posId, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestIds = [posId];
    } else if (score === bestScore) {
      bestIds.push(posId);
    }
  }

  const randomIndex = Math.floor(Math.random() * bestIds.length);
  const selectedId = bestIds[randomIndex];

  return positions[selectedId];
}
