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

/** 기본 표기 (한국어). UI에서는 locale별 라벨로 치환 가능 */
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
 * @param {{ even: string, slightDis: string, slightAdv: string, dis: string, adv: string }} labels
 * @returns {string | null} 알 수 없는 크기면 null
 */
export function getAttributeStanceSentence(percent, who, labels) {
  if (!labels) return null;
  const isPlayer = who === 'player';
  const a = Math.abs(percent);

  if (a === 0) return labels.even;
  if (a === 3) return isPlayer ? labels.slightDis : labels.slightAdv;
  if (a === 6 || a === 10) return isPlayer ? labels.dis : labels.adv;

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
 * @returns {{ ok: true } | { ok: false, code: 'select_attrs' }}
 */
export function validateAttributeCalcInput(input) {
  const { myAttr, oppAttr } = input;

  if (!isValidAttrId(myAttr) || !isValidAttrId(oppAttr)) {
    return {
      ok: false,
      code: 'select_attrs',
    };
  }

  return { ok: true };
}

/**
 * @param {{ myAttr: string, oppAttr: string, myHp: number | null, myDmg: number | null, oppHp: number | null, oppDmg: number | null }} input
 * @returns {{ myPercent: number, oppPercent: number, lines: { key: 'myDmg' | 'myHp' | 'oppDmg' | 'oppHp', before: number | null, after: number | null }[] }}
 */
export function computeAttributeCalc(input) {
  const { myAttr, oppAttr, myHp, myDmg, oppHp, oppDmg } = input;
  const { myPercent, oppPercent } = getBattleModifiers(myAttr, oppAttr);

  const lines = [
    {
      key: 'myDmg',
      before: myDmg,
      after: myDmg === null ? null : applyAttributePercent(myDmg, myPercent),
    },
    {
      key: 'myHp',
      before: myHp,
      after: myHp === null ? null : applyAttributePercent(myHp, myPercent),
    },
    {
      key: 'oppDmg',
      before: oppDmg,
      after: oppDmg === null ? null : applyAttributePercent(oppDmg, oppPercent),
    },
    {
      key: 'oppHp',
      before: oppHp,
      after: oppHp === null ? null : applyAttributePercent(oppHp, oppPercent),
    },
  ];

  return { myPercent, oppPercent, lines };
}
