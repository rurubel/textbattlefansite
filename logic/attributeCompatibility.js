/**
 * 속성 상성: 행(row) = 보정을 받는 쪽의 속성, 열(col) = 상대 속성. 값은 % 정수.
 * 동일 속성 대각은 0.
 */

export const ATTR_IDS = [
  'fire',
  'none',
  'mind',
  'water',
  'thunder',
  'wind',
  'dark',
  'light',
  'earth',
];

export const ATTR_LABELS = {
  fire: '불',
  none: '무',
  mind: '정신',
  water: '물',
  thunder: '번개',
  wind: '바람',
  dark: '어둠',
  light: '빛',
  earth: '대지',
};

/** @type {number[][]} */
const MATRIX = [
  [0, 0, -3, -10, 0, 10, 0, 3, 0],
  [0, 0, 3, 0, 0, 0, -6, -6, 0],
  [3, -3, 0, 3, 3, 0, -10, 10, -3],
  [10, 0, -3, 0, -10, -6, 0, 6, 6],
  [0, 0, -3, 10, 0, 3, 0, 3, -10],
  [-10, 0, 0, 6, -3, 0, 0, 3, 3],
  [0, 6, 10, 0, 0, 0, 0, -10, -3],
  [-3, 6, -10, -6, -3, -3, 10, 0, 6],
  [0, 0, 3, -6, 10, -3, 3, -6, 0],
];

export function isValidAttrId(id) {
  return typeof id === 'string' && ATTR_IDS.includes(id);
}

export function getModifierPercent(rowAttrId, colAttrId) {
  const i = ATTR_IDS.indexOf(rowAttrId);
  const j = ATTR_IDS.indexOf(colAttrId);
  if (i < 0 || j < 0) return 0;
  if (i === j) return 0;
  return MATRIX[i][j];
}

export function getBattleModifiers(myAttrId, oppAttrId) {
  return {
    myPercent: getModifierPercent(myAttrId, oppAttrId),
    oppPercent: getModifierPercent(oppAttrId, myAttrId),
  };
}

/** 보정 후 값, 소수 둘째 자리까지 반올림 */
export function applyAttributePercent(value, percent) {
  const raw = Number(value) * (1 + percent / 100);
  return Math.round(raw * 100) / 100;
}

/** 결과 표시용 (항상 소수 둘째 자리) */
export function formatAttributeCalcDecimal(n) {
  if (!Number.isFinite(n)) return '';
  return (Math.round(n * 100) / 100).toFixed(2);
}

export function formatSignedPercent(percent) {
  if (percent > 0) return `+${percent}%`;
  if (percent < 0) return `${percent}%`;
  return '0%';
}

/**
 * 보정율 절댓값 기준: 0 → 경합, 3 → 약열세, 6·10 → 열세 (게임 상성 단계명).
 * @param {number} percent 나(또는 상대)에게 적용되는 보정 %
 * @param {'player' | 'opponent'} who
 * @returns {string | null} 알 수 없는 크기면 null
 */
export function getAttributeStanceSentence(percent, who) {
  const isPlayer = who === 'player';
  const topic = isPlayer ? '당신은' : '상대는';
  const a = Math.abs(percent);
  if (a === 0) return `${topic} 경합입니다.`;
  if (a === 3) return `${topic} 약열세입니다.`;
  if (a === 6 || a === 10) return `${topic} 열세입니다.`;
  return null;
}

/**
 * @param {string} raw
 * @returns {number | null} null = 비입력
 */
export function parseOptionalNumber(raw) {
  if (raw == null || String(raw).trim() === '') return null;
  const n = Number(String(raw).trim());
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {{ myAttr: string, oppAttr: string, myHp: number | null, myDmg: number | null, oppHp: number | null, oppDmg: number | null }} input
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validateAttributeCalcInput(input) {
  const { myAttr, oppAttr } = input;

  if (!isValidAttrId(myAttr) || !isValidAttrId(oppAttr)) {
    return {
      ok: false,
      message: '나와 상대의 속성을 모두 입력해주세요.',
    };
  }

  return { ok: true };
}

/**
 * @param {{ myAttr: string, oppAttr: string, myHp: number | null, myDmg: number | null, oppHp: number | null, oppDmg: number | null }} input
 * @returns {{ myPercent: number, oppPercent: number, lines: { label: string, before: number | null, after: number | null }[] }}
 */
export function computeAttributeCalc(input) {
  const { myAttr, oppAttr, myHp, myDmg, oppHp, oppDmg } = input;
  const { myPercent, oppPercent } = getBattleModifiers(myAttr, oppAttr);

  const lines = [
    {
      label: '나의 평타 데미지',
      before: myDmg,
      after: myDmg === null ? null : applyAttributePercent(myDmg, myPercent),
    },
    {
      label: '나의 체력',
      before: myHp,
      after: myHp === null ? null : applyAttributePercent(myHp, myPercent),
    },
    {
      label: '상대의 평타 데미지',
      before: oppDmg,
      after: oppDmg === null ? null : applyAttributePercent(oppDmg, oppPercent),
    },
    {
      label: '상대의 체력',
      before: oppHp,
      after: oppHp === null ? null : applyAttributePercent(oppHp, oppPercent),
    },
  ];

  return { myPercent, oppPercent, lines };
}
