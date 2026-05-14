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

export function applyAttributePercent(value, percent) {
  return Math.round(Number(value) * (1 + percent / 100));
}

export function formatSignedPercent(percent) {
  if (percent > 0) return `+${percent}%`;
  if (percent < 0) return `${percent}%`;
  return '0%';
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
  const { myAttr, oppAttr, myHp, myDmg, oppHp, oppDmg } = input;

  if (!isValidAttrId(myAttr) || !isValidAttrId(oppAttr)) {
    return {
      ok: false,
      message:
        '나의 속성과 상대의 속성을 모두 선택해 주세요.',
    };
  }

  const hasMyPair = myHp !== null && myDmg !== null;
  const hasOppPair = oppHp !== null && oppDmg !== null;
  const bothHp = myHp !== null && oppHp !== null;
  const bothAtk = myDmg !== null && oppDmg !== null;

  if (!(hasMyPair || hasOppPair || bothHp || bothAtk)) {
    return {
      ok: false,
      message:
        '최소 한 쌍의 체력·평타 데미지 조건을 충족해야 합니다. (나 체+나 평타, 상대 체+상대 평타, 나 체+상대 체, 나 평타+상대 평타 중 하나)',
    };
  }

  return { ok: true };
}

/**
 * @param {{ myAttr: string, oppAttr: string, myHp: number | null, myDmg: number | null, oppHp: number | null, oppDmg: number | null }} input
 * @returns {{ myPercent: number, oppPercent: number, lines: { label: string, before: number, after: number }[] }}
 */
export function computeAttributeCalc(input) {
  const { myAttr, oppAttr, myHp, myDmg, oppHp, oppDmg } = input;
  const { myPercent, oppPercent } = getBattleModifiers(myAttr, oppAttr);
  /** @type {{ label: string, before: number, after: number }[]} */
  const lines = [];

  if (myDmg !== null) {
    lines.push({
      label: '나의 평타 데미지',
      before: myDmg,
      after: applyAttributePercent(myDmg, myPercent),
    });
  }
  if (myHp !== null) {
    lines.push({
      label: '나의 체력',
      before: myHp,
      after: applyAttributePercent(myHp, myPercent),
    });
  }
  if (oppDmg !== null) {
    lines.push({
      label: '상대의 평타 데미지',
      before: oppDmg,
      after: applyAttributePercent(oppDmg, oppPercent),
    });
  }
  if (oppHp !== null) {
    lines.push({
      label: '상대의 체력',
      before: oppHp,
      after: applyAttributePercent(oppHp, oppPercent),
    });
  }

  return { myPercent, oppPercent, lines };
}
