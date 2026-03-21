/**
 * Speed/First Strike Calculator
 * 선공 = 민첩성 + (속부옵 × 변환값)
 */
export function calculateSpeed(agility, speedSubOpt, conversionValue) {
  return agility + speedSubOpt * conversionValue;
}

export function getFirstStrike(myAgi, mySpd, enemyAgi, enemySpd, conversion) {
  const mySpeed = calculateSpeed(myAgi, mySpd, conversion);
  const enemySpeed = calculateSpeed(enemyAgi, enemySpd, conversion);

  if (mySpeed > enemySpeed) return 'mine';
  if (enemySpeed > mySpeed) return 'enemy';
  return 'tie';
}
