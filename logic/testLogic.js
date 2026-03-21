/**
 * Position tendency test logic
 */
import { questions } from '../questions.js';
import { positions, answerWeights } from '../positions.js';

export function getQuestions() {
  return questions;
}

export function calculatePosition(answers) {
  const scores = {};
  for (const posId of Object.keys(positions)) {
    scores[posId] = 0;
  }

  for (const answer of answers) {
    const weights = answerWeights[answer] || {};
    for (const [posId, score] of Object.entries(weights)) {
      scores[posId] = (scores[posId] || 0) + score;
    }
  }

  let bestId = 'balanced';
  let bestScore = 0;
  for (const [posId, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestId = posId;
    }
  }

  return positions[bestId];
}
