/** 레벨 L → L+1 필요 XP = LEVEL_XP_TO_NEXT[L+1] («N레벨» 행 = N 도달 XP) */
export const LEVEL_XP_TO_NEXT = {
  2: 49,
  3: 50,
  4: 61,
  5: 61,
  6: 68,
  7: 74,
  8: 82,
  9: 90,
  10: 98,
  11: 148,
  12: 162,
  13: 178,
  14: 195,
  15: 216,
  16: 238,
  17: 261,
  18: 286,
  19: 316,
  20: 348,
  21: 521,
  22: 600,
  23: 622,
  24: 644,
  25: 667,
  26: 689,
  27: 711,
  28: 733,
  29: 756,
  30: 778,
  31: 800,
  32: 1200,
  33: 1333,
  34: 1467,
  35: 1600,
  36: 1733,
  37: 1867,
  38: 2000,
  39: 2133,
  40: 2267,
  41: 2400,
  42: 2600,
  43: 2867,
  44: 3133,
  45: 3400,
  46: 3667,
  47: 3933,
  48: 4200,
  49: 4467,
  50: 4733,
  51: 5000,
  52: 5300,
  53: 5656,
  54: 6011,
  55: 6367,
  56: 6722,
  57: 7078,
  58: 7433,
  59: 7789,
  60: 8144,
  61: 8500,
  62: 9000,
  63: 9456,
  64: 9911,
  65: 10367,
  66: 10822,
  67: 11278,
  68: 11733,
  69: 12189,
  70: 12644,
  71: 13100,
  72: 16000,
  73: 17875,
  74: 19750,
  75: 21625,
  76: 23500,
  77: 25375,
  78: 27250,
  79: 29125,
  80: 31004,
};

export const MAX_LEVEL = 80;
export const MIN_LEVEL = 1;

export const ACTIVITIES = {
  pvp1: { xp: 30, tickets: 6, entries: 0 },
  terra: { xp: 50, tickets: 10, entries: 0 },
  jode: { xp: 600, tickets: 10, entries: 1 },
  habit: { xp: 120, tickets: 20, entries: 0, suppressTicketRefillOnLevelUp: true },
  rune: { xp: 300, tickets: 10, entries: 1 },
};

/** 기록 표시 순서 */
export const ACTIVITY_LOG_ORDER = ['jode', 'rune', 'habit', 'terra', 'pvp1'];

export function createEmptyActivityCounts() {
  return { pvp1: 0, terra: 0, jode: 0, habit: 0, rune: 0 };
}

export const DAY_ACTIVITY_ORDER = ['ticketCraft', 'jode', 'rune', 'habit', 'terra', 'pvp1'];

export const PVP_RANGES = {
  '0': { min: 0, max: 0 },
  '0-50': { min: 0, max: 50 },
  '51-100': { min: 51, max: 100 },
  '101-200': { min: 101, max: 200 },
  '201-300': { min: 201, max: 300 },
  '301-400': { min: 301, max: 400 },
};

export const GOBLIN_XP_MIN = 300;
export const GOBLIN_XP_MAX = 600;

/** 프리셋 전부 1vs1 고블린 */
export const PRESET_PVP_GOBLIN_TICKET_THRESHOLD = 2400;
export const PRESET_PVP_GOBLIN_COUNT = 15;
/** 소비 티켓 ≤ 2400일 때 고블린 마릿수 하한 */
export const PRESET_PVP_GOBLIN_COUNT_LOW = 10;

const MAX_SIM_DAYS = 100000;
const TERRA_COST = ACTIVITIES.terra.tickets;

export function xpToNext(level) {
  if (level < MIN_LEVEL || level >= MAX_LEVEL) return 0;
  return LEVEL_XP_TO_NEXT[level + 1] ?? 0;
}

export function sumXpFrom(currentLevel, currentXp, targetLevel) {
  if (currentLevel >= targetLevel) return 0;
  let total = Math.max(0, xpToNext(currentLevel) - currentXp);
  for (let level = currentLevel + 1; level < targetLevel; level++) {
    total += xpToNext(level);
  }
  return total;
}

export function ticketCap(ticketBoost) {
  return ticketBoost ? 100 : 60;
}

export function shouldRefillTickets(newLevel, activityId) {
  if (activityId === 'habit') return false;
  if (newLevel >= 20) return true;
  if (newLevel <= 19 && newLevel % 3 === 0) return true;
  return false;
}

export function goblinCountRange(pvpMin, pvpMax) {
  const scale = (n) => Math.floor((n / 50) * 5);
  return { goblinMin: scale(pvpMin), goblinMax: scale(pvpMax) };
}

export function pvpDayXpRange(pvpMin, pvpMax, includeGoblin) {
  if (pvpMax <= 0 && pvpMin <= 0) {
    return { minXp: 0, maxXp: 0, goblinMin: 0, goblinMax: 0 };
  }
  if (!includeGoblin) {
    return {
      minXp: pvpMin * ACTIVITIES.pvp1.xp,
      maxXp: pvpMax * ACTIVITIES.pvp1.xp,
      goblinMin: 0,
      goblinMax: 0,
    };
  }
  const { goblinMin, goblinMax } = goblinCountRange(pvpMin, pvpMax);
  const minXp =
    Math.max(0, pvpMin - goblinMax) * ACTIVITIES.pvp1.xp + goblinMin * GOBLIN_XP_MIN;
  const maxXp =
    Math.max(0, pvpMax - goblinMin) * ACTIVITIES.pvp1.xp + goblinMax * GOBLIN_XP_MAX;
  return { minXp, maxXp, goblinMin, goblinMax };
}

export function parsePvpRangeKey(key) {
  return PVP_RANGES[key] || PVP_RANGES['0'];
}

/**
 * 티켓작 1사이클: 부캐 Lv1→endLevel 테라 육성.
 * 각 테라 판은 부캐와 본캐가 함께 들어가 둘 다 XP를 받는다.
 * 회수 티켓 = 부캐 레벨업 충전합 − 해당 사이클 테라 소비 티켓.
 */
export function simulateAltTicketCraft(endLevel, ticketBoost) {
  const maxTickets = ticketCap(ticketBoost);
  let level = 1;
  let xp = 0;
  let tickets = 0;
  let spent = 0;
  let refillSum = 0;
  let terraRuns = 0;

  let guard = 0;
  while (level < endLevel && guard++ < MAX_SIM_DAYS * 50) {
    spent += TERRA_COST;
    tickets = Math.max(0, tickets - TERRA_COST);
    xp += ACTIVITIES.terra.xp;
    terraRuns += 1;

    while (level < endLevel && xp >= xpToNext(level)) {
      xp -= xpToNext(level);
      level += 1;
      if (shouldRefillTickets(level, 'terra')) {
        const before = tickets;
        tickets = maxTickets;
        refillSum += Math.max(0, tickets - before);
      }
      if (level >= endLevel) {
        xp = 0;
        break;
      }
    }
  }

  return {
    netTickets: refillSum - spent,
    spent,
    refillSum,
    endLevel: level,
    terraRuns,
  };
}

/**
 * 티켓작 사이클을 본캐 상태에 적용.
 * 테라 1판마다 본캐도 50 XP를 얻고, 사이클 종료 후 순 회수 티켓을 본캐 풀에 합류시킨다.
 */
function runTicketCraftCycles(state, cycles, endLevel, ticketBoost, targetLevel, maxTickets, useLevelUpTickets) {
  if (!useLevelUpTickets || cycles <= 0 || endLevel <= 1) return;

  for (let i = 0; i < cycles; i++) {
    if (state.level >= targetLevel) break;

    let altLevel = 1;
    let altXp = 0;
    let altTickets = 0;
    let spent = 0;
    let refillSum = 0;
    let guard = 0;

    while (altLevel < endLevel && state.level < targetLevel && guard++ < MAX_SIM_DAYS * 50) {
      // 부캐 + 본캐 동시 테라
      spent += TERRA_COST;
      state.totalTicketsSpent += TERRA_COST;
      recordActivity(state, 'terra', 1);

      altTickets = Math.max(0, altTickets - TERRA_COST);
      altXp += ACTIVITIES.terra.xp;
      while (altLevel < endLevel && altXp >= xpToNext(altLevel)) {
        altXp -= xpToNext(altLevel);
        altLevel += 1;
        if (shouldRefillTickets(altLevel, 'terra')) {
          const before = altTickets;
          altTickets = maxTickets;
          refillSum += Math.max(0, altTickets - before);
        }
        if (altLevel >= endLevel) {
          altXp = 0;
          break;
        }
      }

      state.xp += ACTIVITIES.terra.xp;
      applyLevelUps(state, 'terra', targetLevel, maxTickets, useLevelUpTickets, 'terra');
    }

    const netTickets = refillSum - spent;
    if (netTickets > 0 && state.level < targetLevel) {
      state.tickets += netTickets;
      burnLevelUpTickets(state, targetLevel, maxTickets, useLevelUpTickets, 'terra');
    }
  }
}

function createState(currentLevel, currentXp) {
  return {
    level: currentLevel,
    xp: currentXp,
    tickets: 0,
    totalTicketsSpent: 0,
    totalEntriesSpent: 0,
    levelUpCount: 0,
    day: 0,
    activityCounts: createEmptyActivityCounts(),
  };
}

function recordActivity(state, activityId, times = 1) {
  if (!state.activityCounts[activityId]) state.activityCounts[activityId] = 0;
  state.activityCounts[activityId] += times;
}

function refillToCap(state, maxTickets) {
  const before = state.tickets;
  state.tickets = maxTickets;
  return Math.max(0, state.tickets - before);
}

/** 직접 입력·티켓작 = 테라, 프리셋 = 선택 콘텐츠(습던만 테라) */
export function resolveBurnActivityId(mode) {
  if (!mode || mode === 'direct') return 'terra';
  if (mode === 'habit') return 'terra';
  return mode;
}

function burnLevelUpTickets(state, targetLevel, maxTickets, useLevelUpTickets, burnId = 'terra') {
  if (!useLevelUpTickets) return;
  const burn = ACTIVITIES[burnId];
  if (!burn) return;
  while (state.level < targetLevel && state.tickets >= burn.tickets) {
    runActivity(state, burnId, targetLevel, maxTickets, useLevelUpTickets, {
      countSpend: true,
      consumeFromPool: true,
      burnActivityId: burnId,
    });
  }
}

function applyLevelUps(state, activityId, targetLevel, maxTickets, useLevelUpTickets, burnId = 'terra') {
  while (state.level < targetLevel && state.xp >= xpToNext(state.level)) {
    state.xp -= xpToNext(state.level);
    state.level += 1;
    state.levelUpCount += 1;
    if (state.level >= targetLevel) {
      state.xp = 0;
      break;
    }
    if (shouldRefillTickets(state.level, activityId)) {
      refillToCap(state, maxTickets);
      burnLevelUpTickets(state, targetLevel, maxTickets, useLevelUpTickets, burnId);
    }
  }
}

function runActivity(state, activityId, targetLevel, maxTickets, useLevelUpTickets, opts = {}) {
  if (state.level >= targetLevel) return;
  const activity = ACTIVITIES[activityId];
  if (!activity) return;
  const burnId = opts.burnActivityId || 'terra';

  const need = xpToNext(state.level) - state.xp;
  const wouldLevelUp = activity.xp >= need;

  // 습던 + 레벨업 티켓 사용 ON: 레벨업을 유발하면 테라로 대체
  if (activityId === 'habit' && useLevelUpTickets && wouldLevelUp) {
    runActivity(state, 'terra', targetLevel, maxTickets, useLevelUpTickets, {
      ...opts,
      burnActivityId: burnId,
    });
    return;
  }

  if (opts.countSpend !== false) {
    state.totalTicketsSpent += activity.tickets;
    state.totalEntriesSpent += activity.entries;
  }

  if (opts.consumeFromPool) {
    state.tickets = Math.max(0, state.tickets - activity.tickets);
  }

  recordActivity(state, activityId, 1);
  state.xp += activity.xp;
  applyLevelUps(state, activityId, targetLevel, maxTickets, useLevelUpTickets, burnId);
}

/** 티켓/기록은 activityId 기준, XP만 커스텀 (고블린 등) */
function runActivityWithXp(state, activityId, xp, targetLevel, maxTickets, useLevelUpTickets, burnId) {
  if (state.level >= targetLevel) return;
  const activity = ACTIVITIES[activityId];
  if (!activity) return;

  state.totalTicketsSpent += activity.tickets;
  state.totalEntriesSpent += activity.entries;
  recordActivity(state, activityId, 1);
  state.xp += xp;
  applyLevelUps(state, activityId, targetLevel, maxTickets, useLevelUpTickets, burnId);
}

function applyXpBatch(state, xpAmount, activityId, targetLevel, maxTickets, useLevelUpTickets, ticketCostPerUnit, units, entryCost = 0, burnId = 'terra') {
  if (state.level >= targetLevel || (xpAmount <= 0 && units <= 0)) return;
  state.totalTicketsSpent += ticketCostPerUnit * units;
  state.totalEntriesSpent += entryCost * units;
  if (units > 0) recordActivity(state, activityId, units);
  state.xp += xpAmount;
  applyLevelUps(state, activityId, targetLevel, maxTickets, useLevelUpTickets, burnId);
}

function runDirectDay(state, plan, targetLevel, maxTickets, useLevelUpTickets, pvpXp, pvpFights) {
  const {
    ticketBoost,
    ticketCraftCount,
    ticketCraftEndLevel,
    terraCount,
    jodeCount,
    habitCount,
    runeCount,
  } = plan;
  const burnId = 'terra';
  const actOpts = { burnActivityId: burnId };

  runTicketCraftCycles(
    state,
    ticketCraftCount,
    ticketCraftEndLevel,
    ticketBoost,
    targetLevel,
    maxTickets,
    useLevelUpTickets
  );

  for (let i = 0; i < jodeCount && state.level < targetLevel; i++) {
    runActivity(state, 'jode', targetLevel, maxTickets, useLevelUpTickets, actOpts);
  }
  for (let i = 0; i < runeCount && state.level < targetLevel; i++) {
    runActivity(state, 'rune', targetLevel, maxTickets, useLevelUpTickets, actOpts);
  }
  for (let i = 0; i < habitCount && state.level < targetLevel; i++) {
    runActivity(state, 'habit', targetLevel, maxTickets, useLevelUpTickets, actOpts);
  }
  for (let i = 0; i < terraCount && state.level < targetLevel; i++) {
    runActivity(state, 'terra', targetLevel, maxTickets, useLevelUpTickets, actOpts);
  }

  if (pvpFights > 0 && state.level < targetLevel) {
    applyXpBatch(
      state,
      pvpXp,
      'pvp1',
      targetLevel,
      maxTickets,
      useLevelUpTickets,
      ACTIVITIES.pvp1.tickets,
      pvpFights,
      0,
      burnId
    );
  }
}

function runPresetUntilTarget(state, activityId, targetLevel, maxTickets, useLevelUpTickets, burnId, presetGoblin = null) {
  let guard = 0;
  if (activityId === 'pvp1') {
    const goblinCount = presetGoblin?.count ?? 0;
    const goblinXp = presetGoblin?.xp ?? GOBLIN_XP_MIN;
    let goblinsLeft = goblinCount;
    while (state.level < targetLevel && guard++ < MAX_SIM_DAYS * 200) {
      if (goblinsLeft > 0) {
        runActivityWithXp(
          state,
          'pvp1',
          goblinXp,
          targetLevel,
          maxTickets,
          useLevelUpTickets,
          burnId
        );
        goblinsLeft -= 1;
      } else {
        runActivity(state, 'pvp1', targetLevel, maxTickets, useLevelUpTickets, {
          burnActivityId: burnId,
        });
      }
    }
  } else {
    while (state.level < targetLevel && guard++ < MAX_SIM_DAYS * 200) {
      runActivity(state, activityId, targetLevel, maxTickets, useLevelUpTickets, {
        burnActivityId: burnId,
      });
    }
  }
  state.day = 1;
}

function simulateOnce(input, pvpTrack) {
  const {
    currentLevel,
    currentXp,
    targetLevel,
    mode,
    ticketBoost,
    useLevelUpTickets,
    includeGoblin,
    pvpRangeKey,
    terraCount,
    jodeCount,
    habitCount,
    runeCount,
    ticketCraftCount,
    ticketCraftEndLevel,
    presetGoblin = null,
  } = input;

  const maxTickets = ticketCap(ticketBoost);
  const state = createState(currentLevel, currentXp);
  const startLevel = currentLevel;

  if (mode !== 'direct') {
    const activityId = mode; // jode | habit | terra | rune | pvp1
    const burnId = resolveBurnActivityId(mode);
    runPresetUntilTarget(
      state,
      activityId,
      targetLevel,
      maxTickets,
      useLevelUpTickets,
      burnId,
      mode === 'pvp1' ? presetGoblin : null
    );
    return finalizeResult(state, startLevel, currentXp, targetLevel, null);
  }

  const range = parsePvpRangeKey(pvpRangeKey);
  const xpRange = pvpDayXpRange(range.min, range.max, includeGoblin && range.max > 0);
  let pvpXp;
  let pvpFights;
  if (pvpTrack === 'minDays') {
    // 더 많은 일일 XP → 소요일 최소
    pvpXp = xpRange.maxXp;
    pvpFights = range.max;
  } else {
    pvpXp = xpRange.minXp;
    pvpFights = range.min;
  }

  const plan = {
    ticketBoost,
    ticketCraftCount: useLevelUpTickets ? ticketCraftCount : 0,
    ticketCraftEndLevel,
    terraCount,
    jodeCount,
    habitCount,
    runeCount,
  };

  const dailyXpEstimate =
    terraCount * ACTIVITIES.terra.xp +
    jodeCount * ACTIVITIES.jode.xp +
    habitCount * ACTIVITIES.habit.xp +
    runeCount * ACTIVITIES.rune.xp +
    pvpXp;

  if (dailyXpEstimate <= 0 && plan.ticketCraftCount <= 0 && !useLevelUpTickets) {
    return {
      ok: false,
      error: 'noProgress',
      remainingXp: sumXpFrom(currentLevel, currentXp, targetLevel),
      targetLevel,
    };
  }

  while (state.level < targetLevel && state.day < MAX_SIM_DAYS) {
    const levelBefore = state.level;
    const xpBefore = state.xp;
    const spentBefore = state.totalTicketsSpent;
    state.day += 1;
    runDirectDay(state, plan, targetLevel, maxTickets, useLevelUpTickets, pvpXp, pvpFights);

    if (
      state.level === levelBefore &&
      state.xp === xpBefore &&
      state.totalTicketsSpent === spentBefore
    ) {
      return {
        ok: false,
        error: 'noProgress',
        remainingXp: sumXpFrom(currentLevel, currentXp, targetLevel),
        targetLevel,
      };
    }
  }

  if (state.level < targetLevel) {
    return {
      ok: false,
      error: 'maxDays',
      remainingXp: sumXpFrom(currentLevel, currentXp, targetLevel),
      targetLevel,
    };
  }

  return finalizeResult(state, startLevel, currentXp, targetLevel, pvpTrack);
}

function finalizeResult(state, startLevel, startXp, targetLevel, pvpTrack) {
  return {
    ok: true,
    gainedXp: sumXpFrom(startLevel, startXp, targetLevel),
    remainingXp: sumXpFrom(startLevel, startXp, targetLevel),
    days: state.day,
    totalTicketsSpent: state.totalTicketsSpent,
    totalEntriesSpent: state.totalEntriesSpent,
    levelUpCount: state.levelUpCount,
    activityCounts: { ...state.activityCounts },
    targetLevel,
    pvpTrack,
  };
}

function mergeActivityCountRange(a, b) {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  const min = createEmptyActivityCounts();
  const max = createEmptyActivityCounts();
  for (const key of keys) {
    const va = a?.[key] || 0;
    const vb = b?.[key] || 0;
    min[key] = Math.min(va, vb);
    max[key] = Math.max(va, vb);
  }
  return { activityCountsMin: min, activityCountsMax: max };
}

export function validateLevelingInput(input) {
  const {
    currentLevel,
    currentXp,
    targetLevel,
  } = input;

  if (
    !Number.isFinite(currentLevel) ||
    !Number.isFinite(currentXp) ||
    !Number.isFinite(targetLevel)
  ) {
    return { ok: false, error: 'invalidNumber' };
  }
  if (currentLevel < MIN_LEVEL || currentLevel > MAX_LEVEL) {
    return { ok: false, error: 'levelRange' };
  }
  if (targetLevel < MIN_LEVEL || targetLevel > MAX_LEVEL) {
    return { ok: false, error: 'targetRange' };
  }
  if (!(currentLevel < targetLevel)) {
    return { ok: false, error: 'levelOrder' };
  }
  const need = xpToNext(currentLevel);
  if (currentXp < 0 || currentXp >= need) {
    return { ok: false, error: 'xpRange' };
  }
  return { ok: true };
}

/**
 * @returns {{ ok, gainedXp, daysMin, daysMax, totalTicketsSpentMin, totalTicketsSpentMax, totalEntriesSpentMin, totalEntriesSpentMax, activityCountsMin, activityCountsMax, targetLevel, mode, hasRange, showDays, error? }}
 */
export function runLevelingSimulation(input) {
  const validation = validateLevelingInput(input);
  if (!validation.ok) {
    return {
      ok: false,
      error: validation.error,
      gainedXp: 0,
      remainingXp: 0,
      targetLevel: input.targetLevel,
      mode: input.mode,
      showDays: input.mode === 'direct',
    };
  }

  const gainedXp = sumXpFrom(input.currentLevel, input.currentXp, input.targetLevel);
  const showDays = input.mode === 'direct';

  if (input.mode === 'direct') {
    const range = parsePvpRangeKey(input.pvpRangeKey);
    const hasPvpRange = range.min !== range.max || (input.includeGoblin && range.max > 0);
    const needTwoTracks =
      hasPvpRange &&
      (range.min !== range.max || input.includeGoblin);

    if (needTwoTracks) {
      const minDaysResult = simulateOnce(input, 'minDays');
      const maxDaysResult = simulateOnce(input, 'maxDays');

      if (!minDaysResult.ok && !maxDaysResult.ok) {
        return { ...minDaysResult, gainedXp, remainingXp: gainedXp, mode: input.mode, showDays };
      }

      // 구간 하한이 0이면 최대 소요일 트랙은 진행 불가 → 상한 무한
      if (minDaysResult.ok && !maxDaysResult.ok && maxDaysResult.error === 'noProgress') {
        return {
          ok: true,
          gainedXp,
          remainingXp: gainedXp,
          daysMin: minDaysResult.days,
          daysMax: null,
          totalTicketsSpentMin: minDaysResult.totalTicketsSpent,
          totalTicketsSpentMax: minDaysResult.totalTicketsSpent,
          totalEntriesSpentMin: minDaysResult.totalEntriesSpent,
          totalEntriesSpentMax: minDaysResult.totalEntriesSpent,
          activityCountsMin: { ...minDaysResult.activityCounts },
          activityCountsMax: { ...minDaysResult.activityCounts },
          targetLevel: input.targetLevel,
          hasRange: true,
          unboundedMax: true,
          mode: input.mode,
          showDays,
        };
      }

      if (!minDaysResult.ok) {
        return { ...minDaysResult, gainedXp, remainingXp: gainedXp, mode: input.mode, showDays };
      }
      if (!maxDaysResult.ok) {
        return { ...maxDaysResult, gainedXp, remainingXp: gainedXp, mode: input.mode, showDays };
      }

      const daysA = minDaysResult.days;
      const daysB = maxDaysResult.days;
      const counts = mergeActivityCountRange(
        minDaysResult.activityCounts,
        maxDaysResult.activityCounts
      );
      return {
        ok: true,
        gainedXp,
        remainingXp: gainedXp,
        daysMin: Math.min(daysA, daysB),
        daysMax: Math.max(daysA, daysB),
        totalTicketsSpentMin: Math.min(
          minDaysResult.totalTicketsSpent,
          maxDaysResult.totalTicketsSpent
        ),
        totalTicketsSpentMax: Math.max(
          minDaysResult.totalTicketsSpent,
          maxDaysResult.totalTicketsSpent
        ),
        totalEntriesSpentMin: Math.min(
          minDaysResult.totalEntriesSpent,
          maxDaysResult.totalEntriesSpent
        ),
        totalEntriesSpentMax: Math.max(
          minDaysResult.totalEntriesSpent,
          maxDaysResult.totalEntriesSpent
        ),
        ...counts,
        targetLevel: input.targetLevel,
        hasRange: daysA !== daysB,
        unboundedMax: false,
        mode: input.mode,
        showDays,
      };
    }
  }

  // 프리셋 전부 1vs1 고블린:
  // - 소비 티켓 ≤ 2400 → 고블린 10~15마리 (XP 300~600)
  // - 소비 티켓 > 2400 → 고블린 15마리 (XP 300~600)
  if (input.mode === 'pvp1') {
    const probe = simulateOnce({ ...input, presetGoblin: null }, 'maxDays');
    if (!probe.ok) {
      return { ...probe, gainedXp, remainingXp: gainedXp, mode: input.mode, showDays };
    }

    const lowTicketBand =
      probe.totalTicketsSpent <= PRESET_PVP_GOBLIN_TICKET_THRESHOLD;
    const goblinCountForMaxDays = lowTicketBand
      ? PRESET_PVP_GOBLIN_COUNT_LOW
      : PRESET_PVP_GOBLIN_COUNT;
    const goblinCountForMinDays = PRESET_PVP_GOBLIN_COUNT;

    const minDaysResult = simulateOnce(
      {
        ...input,
        presetGoblin: { count: goblinCountForMinDays, xp: GOBLIN_XP_MAX },
      },
      'minDays'
    );
    const maxDaysResult = simulateOnce(
      {
        ...input,
        presetGoblin: { count: goblinCountForMaxDays, xp: GOBLIN_XP_MIN },
      },
      'maxDays'
    );
    if (!minDaysResult.ok) {
      return { ...minDaysResult, gainedXp, remainingXp: gainedXp, mode: input.mode, showDays };
    }
    if (!maxDaysResult.ok) {
      return { ...maxDaysResult, gainedXp, remainingXp: gainedXp, mode: input.mode, showDays };
    }

    const counts = mergeActivityCountRange(
      minDaysResult.activityCounts,
      maxDaysResult.activityCounts
    );
    return {
      ok: true,
      gainedXp,
      remainingXp: gainedXp,
      daysMin: 1,
      daysMax: 1,
      totalTicketsSpentMin: Math.min(
        minDaysResult.totalTicketsSpent,
        maxDaysResult.totalTicketsSpent
      ),
      totalTicketsSpentMax: Math.max(
        minDaysResult.totalTicketsSpent,
        maxDaysResult.totalTicketsSpent
      ),
      totalEntriesSpentMin: Math.min(
        minDaysResult.totalEntriesSpent,
        maxDaysResult.totalEntriesSpent
      ),
      totalEntriesSpentMax: Math.max(
        minDaysResult.totalEntriesSpent,
        maxDaysResult.totalEntriesSpent
      ),
      ...counts,
      targetLevel: input.targetLevel,
      hasRange:
        minDaysResult.totalTicketsSpent !== maxDaysResult.totalTicketsSpent,
      mode: input.mode,
      showDays,
      presetGoblinsApplied: true,
      presetGoblinCountMin: goblinCountForMaxDays,
      presetGoblinCountMax: goblinCountForMinDays,
    };
  }

  const result = simulateOnce(input, 'maxDays');
  if (!result.ok) {
    return { ...result, gainedXp, remainingXp: gainedXp, mode: input.mode, showDays };
  }

  return {
    ok: true,
    gainedXp,
    remainingXp: gainedXp,
    daysMin: result.days,
    daysMax: result.days,
    totalTicketsSpentMin: result.totalTicketsSpent,
    totalTicketsSpentMax: result.totalTicketsSpent,
    totalEntriesSpentMin: result.totalEntriesSpent,
    totalEntriesSpentMax: result.totalEntriesSpent,
    activityCountsMin: { ...result.activityCounts },
    activityCountsMax: { ...result.activityCounts },
    targetLevel: input.targetLevel,
    hasRange: false,
    mode: input.mode,
    showDays,
  };
}
