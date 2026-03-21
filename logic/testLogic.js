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

  // 1. 점수 초기화
  for (const posId of Object.keys(positions)) {
    scores[posId] = 0;
  }

  // 2. 답변 기반 점수 누적
  for (const answer of answers) {
    const weights = answerWeights[answer];
    if (!weights) continue; // 상관 없다 or 정의 안된 경우

    for (const [posId, score] of Object.entries(weights)) {
      scores[posId] += score;
    }
  }

  // 3. 최고 점수 찾기 (동점 포함)
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

  // 4. 동점일 경우 랜덤 선택
  const randomIndex = Math.floor(Math.random() * bestIds.length);
  const selectedId = bestIds[randomIndex];

  return positions[selectedId];
}