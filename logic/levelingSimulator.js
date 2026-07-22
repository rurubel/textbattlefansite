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
 * 부캐를 테라만으로 endLevel까지 육성. 회수 = 충전합 − 소비합.
 */
export function simulateAltTicketCraft(endLevel, ticketBoost) {
  const maxTickets = ticketCap(ticketBoost);
  let level = 1;
  let xp = 0;
  let tickets = 0;
  let spent = 0;
  let refillSum = 0;

  let guard = 0;
  while (level < endLevel && guard++ < MAX_SIM_DAYS * 50) {
    spent += TERRA_COST;
    tickets = Math.max(0, tickets - TERRA_COST);
    xp += ACTIVITIES.terra.xp;

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
  };
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

function burnLevelUpTickets(state, targetLevel, maxTickets, useLevelUpTickets) {
  if (!useLevelUpTickets) return;
  while (state.level < targetLevel && state.tickets >= TERRA_COST) {
    runActivity(state, 'terra', targetLevel, maxTickets, useLevelUpTickets, {
      countSpend: true,
      consumeFromPool: true,
    });
  }
}

function applyLevelUps(state, activityId, targetLevel, maxTickets, useLevelUpTickets) {
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
      burnLevelUpTickets(state, targetLevel, maxTickets, useLevelUpTickets);
    }
  }
}

function runActivity(state, activityId, targetLevel, maxTickets, useLevelUpTickets, opts = {}) {
  if (state.level >= targetLevel) return;
  const activity = ACTIVITIES[activityId];
  if (!activity) return;

  const need = xpToNext(state.level) - state.xp;
  const wouldLevelUp = activity.xp >= need;

  // 습던 + 레벨업 티켓 사용 ON: 레벨업을 유발하면 테라로 대체
  if (
    activityId === 'habit' &&
    useLevelUpTickets &&
    wouldLevelUp
  ) {
    runActivity(state, 'terra', targetLevel, maxTickets, useLevelUpTickets, opts);
    return;
  }

  if (opts.countSpend !== false) {
    state.totalTicketsSpent += activity.tickets;
    state.totalEntriesSpent += activity.entries;
  }

  // 일일 계획 티켓은 무한 — 보유 tickets 풀은 레벨업 충전/티켓작 회수용
  if (opts.consumeFromPool) {
    state.tickets = Math.max(0, state.tickets - activity.tickets);
  }

  recordActivity(state, activityId, 1);
  state.xp += activity.xp;
  applyLevelUps(state, activityId, targetLevel, maxTickets, useLevelUpTickets);
}

function applyXpBatch(state, xpAmount, activityId, targetLevel, maxTickets, useLevelUpTickets, ticketCostPerUnit, units, entryCost = 0) {
  if (state.level >= targetLevel || (xpAmount <= 0 && units <= 0)) return;
  state.totalTicketsSpent += ticketCostPerUnit * units;
  state.totalEntriesSpent += entryCost * units;
  if (units > 0) recordActivity(state, activityId, units);
  state.xp += xpAmount;
  applyLevelUps(state, activityId, targetLevel, maxTickets, useLevelUpTickets);
}

function runTicketCraftCycles(state, cycles, endLevel, ticketBoost, targetLevel, maxTickets, useLevelUpTickets) {
  if (!useLevelUpTickets || cycles <= 0 || endLevel <= 1) return;
  for (let i = 0; i < cycles; i++) {
    if (state.level >= targetLevel) break;
    const craft = simulateAltTicketCraft(endLevel, ticketBoost);
    if (craft.netTickets > 0) {
      state.tickets += craft.netTickets;
      burnLevelUpTickets(state, targetLevel, maxTickets, useLevelUpTickets);
    }
  }
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
    runActivity(state, 'jode', targetLevel, maxTickets, useLevelUpTickets);
  }
  for (let i = 0; i < runeCount && state.level < targetLevel; i++) {
    runActivity(state, 'rune', targetLevel, maxTickets, useLevelUpTickets);
  }
  for (let i = 0; i < habitCount && state.level < targetLevel; i++) {
    runActivity(state, 'habit', targetLevel, maxTickets, useLevelUpTickets);
  }
  for (let i = 0; i < terraCount && state.level < targetLevel; i++) {
    runActivity(state, 'terra', targetLevel, maxTickets, useLevelUpTickets);
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
      0
    );
  }
}

function runPresetUntilTarget(state, activityId, targetLevel, maxTickets, useLevelUpTickets) {
  let guard = 0;
  while (state.level < targetLevel && guard++ < MAX_SIM_DAYS * 200) {
    runActivity(state, activityId, targetLevel, maxTickets, useLevelUpTickets);
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
  } = input;

  const maxTickets = ticketCap(ticketBoost);
  const state = createState(currentLevel, currentXp);
  const startLevel = currentLevel;

  if (mode !== 'direct') {
    const activityId = mode; // jode | habit | terra | rune | pvp1
    runPresetUntilTarget(state, activityId, targetLevel, maxTickets, useLevelUpTickets);
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
