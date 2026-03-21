export const questions = [
  {
    id: 1,
    text: '전투에서 무엇이 가장 중요하다고 생각하시나요?',
    options: [
      { value: 'atk', label: '강력한 공격으로 빠르게 끝내기' },
      { value: 'def', label: '견고한 방어로 버티기' },
      { value: 'bal', label: '공수 균형 맞추기' },
    ],
    mandatory: true,
  },
  {
    id: 2,
    text: '상대방보다 먼저 공격하는 것이 얼마나 중요하다고 생각하시나요?',
    options: [
      { value: 'high', label: '매우 중요 - 선공이 승패를 좌우한다' },
      { value: 'mid', label: '보통 - 상황에 따라 다르다' },
      { value: 'low', label: '별로 - 방어력이 더 중요하다' },
    ],
    mandatory: true,
  },
  {
    id: 3,
    text: '치명타 확률과 평타 중 무엇을 우선시하시나요?',
    options: [
      { value: 'crit', label: '치명타 - 운 좋으면 한 방!' },
      { value: 'atk', label: '평타 - 안정적인 딜' },
      { value: 'both', label: '둘 다 골고루' },
    ],
    mandatory: true,
  },
  {
    id: 4,
    text: '카드 강화할 때 어떤 스탯을 먼저 올리시나요?',
    options: [
      { value: 'atk', label: '공격력' },
      { value: 'spd', label: '민첩성' },
      { value: 'def', label: '방어력' },
      { value: 'hp', label: '체력' },
    ],
    mandatory: false,
  },
  {
    id: 5,
    text: '팀에서 어떤 역할을 선호하시나요?',
    options: [
      { value: 'dps', label: '주딜 - 화력을 책임진다' },
      { value: 'tank', label: '탱커 - 팀을 지킨다' },
      { value: 'support', label: '서브딜 - 보조 화력' },
    ],
    mandatory: false,
  },
  {
    id: 6,
    text: '패배했을 때 가장 아쉬운 상황은?',
    options: [
      { value: 'speed', label: '선공을 못해서' },
      { value: 'damage', label: '딜이 부족해서' },
      { value: 'survive', label: '버티지 못해서' },
    ],
    mandatory: false,
  },
  {
    id: 7,
    text: '이상적인 전투 턴 수는?',
    options: [
      { value: '1', label: '1턴에 끝 - 원킬이 최고' },
      { value: '2', label: '2턴 - 게임 규칙대로' },
      { value: '3', label: '3턴 이상 - 긴 전투도 좋다' },
    ],
    mandatory: false,
  },
];
