/**
 * Speed/First Strike Calculator
 * 선공 = 민첩성 + (속부옵 × 변환값)
 */

export function calculateSpeed(agility, speedSubOpt, conversionValue) {
  return agility + speedSubOpt * conversionValue;
}

export function getFirstStrikeDetail(myAgi, mySpd, enemyAgi, enemySpd, conversion) {
  // ✅ 입력 안 한 상태 (전부 0)
  if (
    myAgi === 0 &&
    mySpd === 0 &&
    enemyAgi === 0 &&
    enemySpd === 0
  ) {
    return '값을 입력하세요';
  }
  const mySpeed = calculateSpeed(myAgi, mySpd, conversion);
  const enemySpeed = calculateSpeed(enemyAgi, enemySpd, conversion);

  const totalDiff = Math.ceil(Math.abs(mySpeed - enemySpeed) * 100) / 100;

  // 🔥 핵심: 속부옵 기준 환산 (무조건 올림)
  const spdOptionDiff = Math.ceil(totalDiff / conversion);

  if (mySpeed > enemySpeed) {
    return `민첩성 기준으로 ${totalDiff} 차이, 속부옵 기준으로 ${spdOptionDiff}개 차이로 당신이 선공입니다!`;
  }

  if (enemySpeed > mySpeed) {
    return `민첩성 기준으로 ${totalDiff} 차이, 속부옵 기준으로 ${spdOptionDiff}개 차이로 상대가 선공입니다!`;
  }

  return `당신과 상대의 민첩성이 동일합니다.`;
}