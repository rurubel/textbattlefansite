/**
 * Speed/First Strike Calculator
 * 선공 = 민첩성 + (속부옵 × 변환값)
 */

export function calculateSpeed(agility, speedSubOpt, conversionValue) {
  return agility + speedSubOpt * conversionValue;
}

/**
 * @returns {{ kind: 'empty' } | { kind: 'tie' } | { kind: 'first_me', totalDiff: number, spdOptionDiff: number } | { kind: 'first_enemy', totalDiff: number, spdOptionDiff: number }}
 */
export function getFirstStrikeDetail(myAgi, mySpd, enemyAgi, enemySpd, conversion) {
  if (
    myAgi === 0 &&
    mySpd === 0 &&
    enemyAgi === 0 &&
    enemySpd === 0
  ) {
    return { kind: 'empty' };
  }
  const mySpeed = calculateSpeed(myAgi, mySpd, conversion);
  const enemySpeed = calculateSpeed(enemyAgi, enemySpd, conversion);

  const totalDiff = Math.ceil(Math.abs(mySpeed - enemySpeed) * 100) / 100;
  const spdOptionDiff = Math.ceil(totalDiff / conversion);

  if (mySpeed > enemySpeed) {
    return { kind: 'first_me', totalDiff, spdOptionDiff };
  }

  if (enemySpeed > mySpeed) {
    return { kind: 'first_enemy', totalDiff, spdOptionDiff };
  }

  return { kind: 'tie' };
}
