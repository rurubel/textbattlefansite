/**
 * 포지션 성향 테스트: 답변 가중치만 유지 (포지션 표시 문구는 gameLocales.js)
 */
export const answerWeights = {
  // Q1: 포지션 성능
  top: { bruiser: 2, tank: 2, extreme_speed: 2, non_tank: 2 },
  midlow: { min_speed: 2, extreme_atk: 2, atk_speed: 2, berserker: 2, atk_bruiser: 2, balance: 2 },
  any: { bruiser: 1, tank: 1, extreme_speed: 1, min_speed: 1, extreme_atk: 1, atk_speed: 1, berserker: 1, atk_bruiser: 1, balance: 1, non_tank: 1 },

  // Q2: 스탯 선호
  simple: { bruiser: 2, tank: 2, extreme_speed: 2, atk_speed: 2, atk_bruiser: 2, balance: 2, non_tank: 2 },
  special: { min_speed: 2, extreme_atk: 2, berserker: 2 },

  // Q3: 난이도
  easy: { tank: 2, balance: 2, non_tank: 2, extreme_atk: 2 },
  normal: { bruiser: 2, min_speed: 2, berserker: 2, atk_bruiser: 2 },
  hard: { extreme_speed: 2, atk_speed: 2 },
  easy_normal: { tank: 1, balance: 1, bruiser: 1, min_speed: 1, extreme_atk: 1, berserker: 1, atk_bruiser: 1 },
  normal_hard: { bruiser: 1, min_speed: 1, extreme_atk: 1, berserker: 1, atk_bruiser: 1, extreme_speed: 1, atk_speed: 1 },
  all: { bruiser: 1, tank: 1, extreme_speed: 1, min_speed: 1, extreme_atk: 1, atk_speed: 1, berserker: 1, atk_bruiser: 1, balance: 1, non_tank: 1 },

  // Q4: 렙 낮아도 쓸만한지
  low_yes: { bruiser: 2, tank: 2, balance: 2 },
  low_no: { extreme_speed: 2, min_speed: 2, extreme_atk: 2, atk_speed: 2, berserker: 2, atk_bruiser: 2, non_tank: 2 },

  // Q5: 승패 변수
  certain: { tank: 2, extreme_speed: 2, min_speed: 2, extreme_atk: 2, berserker: 2, atk_bruiser: 2, non_tank: 2 },
  variable: { bruiser: 2 },
  q5_any: { bruiser: 1, tank: 1, extreme_speed: 1, min_speed: 1, extreme_atk: 1, atk_speed: 1, berserker: 1, atk_bruiser: 1, balance: 1, non_tank: 1 },
  both: { atk_speed: 2, balance: 2 },

  // Q6: 너프 의존도
  nerf_yes: { bruiser: 2, extreme_speed: 2, atk_speed: 2, atk_bruiser: 2, balance: 2 },
  nerf_no: { tank: 2, min_speed: 2, extreme_atk: 2, berserker: 2, non_tank: 2 },

  // Q7: 메타 영향
  meta_yes: { tank: 2, extreme_speed: 2, extreme_atk: 2 },
  meta_no: { bruiser: 2, min_speed: 2, atk_speed: 2, berserker: 2, atk_bruiser: 2, balance: 2, non_tank: 2 },
};
