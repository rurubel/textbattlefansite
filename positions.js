export const positions = {
  bruiser: {
    id: 'bruiser',
    name: '브루저',
    description: '체력과 공격력을 겸비한 딜탱',
    attributes: [
      '상위',
      '간단한 스탯',
      '보통',
      '렙 낮아도 쓸만함',
      '변수 있음',
      '너프 의존도 심함',
      '포지션 분포 영향 받음',
    ],
  },
  tank: {
    id: 'tank',
    name: '탱커',
    description: '높은 체력으로 상대의 공격을 버텨내는 탱커',
    attributes: [
      '상위',
      '간단한 스탯',
      '쉬움',
      '렙 낮아도 쓸만함',
      '확승과 확패',
      '너프 의존도 심하지 않음',
      '포지션 분포 영향 안 받음',
    ],
  },
  extreme_speed: {
    id: 'extreme_speed',
    name: '극민발',
    description: '많은 민첩성과 높은 공부옵으로 딜과 속도가 하나된 발도',
    attributes: [
      '상위',
      '간단한 스탯',
      '어려움',
      '렙 올려야 함',
      '확승과 확패',
      '너프 의존도 심함',
      '포지션 분포 영향 안 받음',
    ],
  },
  min_speed: {
    id: 'min_speed',
    name: '민발',
    description: '높은 민첩성으로 선공전에서 우위를 점하는 발도',
    attributes: [
      '중하위',
      '특별한 스탯',
      '보통',
      '렙 올려야 함',
      '확승과 확패',
      '너프 의존도 심하지 않음',
      '포지션 분포 영향 받음',
    ],
  },
  extreme_atk: {
    id: 'extreme_atk',
    name: '극공발',
    description: '공격력을 주력으로 올려 딜을 극대화하는 발도',
    attributes: [
      '중하위',
      '특별한 스탯',
      '쉬움',
      '렙 올려야 함',
      '확승과 확패',
      '너프 의존도 심하지 않음',
      '포지션 분포 영향 안 받음',
    ],
  },
  atk_speed: {
    id: 'atk_speed',
    name: '공발',
    description: '적당한 공격성과 민첩성이 결합된 발도',
    attributes: [
      '중하위',
      '간단한 스탯',
      '어려움',
      '렙 올려야 함',
      '두루두루',
      '너프 의존도 심함',
      '포지션 분포 영향 받음',
    ],
  },
  berserker: {
    id: 'berserker',
    name: '버서커',
    description: '높은 공격성과 준수한 체력으로 안정적인 딜을 뽐내는 안티 탱커',
    attributes: [
      '중하위',
      '특별한 스탯',
      '보통',
      '렙 올려야 함',
      '확승과 확패',
      '너프 의존도 안 심함',
      '포지션 분포 영향 받음',
    ],
  },
  atk_bruiser: {
    id: 'atk_bruiser',
    name: '공브루저',
    description: '공격성을 주력으로 사용하는 브루저',
    attributes: [
      '중하위',
      '간단한 스탯',
      '보통',
      '렙 올려야 함',
      '확승과 확패',
      '너프 의존도 심함',
      '포지션 분포 영향 받음',
    ],
  },
  balance: {
    id: 'balance',
    name: '밸런스',
    description: '모든 스탯을 균형잡은 포지션',
    attributes: [
      '중하위',
      '간단한 스탯',
      '쉬움',
      '렙 낮아도 쓸만함',
      '두루두루',
      '너프 의존도 심함',
      '포지션 분포 영향 받음',
    ],
  },
  non_tank: {
    id: 'non_tank',
    name: '논탱',
    description: '방어력을 중심으로 데미지를 감소시키는 탱커',
    attributes: [
      '좋음',
      '간단한 스탯',
      '쉬움',
      '렙 올려야 함',
      '확승과 확패',
      '너프 의존도 안 심함',
      '포지션 분포 영향 받음',
    ],
  },
};

export const answerWeights = {
  // Q1: 포지션 성능
  top: { bruiser: 2, tank: 2, extreme_speed: 2, non_tank: 2 },
  midlow: { min_speed: 2, extreme_atk: 2, atk_speed: 2, berserker: 2, atk_bruiser: 2, balance: 2 },
  any: { bruiser: 1, tank: 1, extreme_speed: 1, min_speed: 1, extreme_atk: 1, atk_speed: 1, berserker: 1, atk_bruiser: 1, balance: 1, non_tank: 1 },

  // Q2: 스탯 선호
  simple: { bruiser: 2, tank: 2, extreme_speed: 2, atk_speed: 2, atk_bruiser: 2, balance: 2, non_tank: 2 },
  special: { min_speed: 2, extreme_atk: 2, berserker: 2 },
  // any: already defined above

  // Q3: 난이도
  easy: { tank: 2, balance: 2, non_tank: 2, extreme_atk: 2, },
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
  both: { atk_speed: 2, balance: 2 },

  // Q6: 너프 의존도
  nerf_yes: { bruiser: 2, extreme_speed: 2, atk_speed: 2, atk_bruiser: 2, balance: 2 },
  nerf_no: { tank: 2, min_speed: 2, extreme_atk: 2, berserker: 2, non_tank: 2 },

  // Q7: 메타 영향
  meta_yes: { tank: 2, extreme_speed: 2, extreme_atk: 2 },
  meta_no: { bruiser: 2, min_speed: 2, atk_speed: 2, berserker: 2, atk_bruiser: 2, balance: 2, non_tank: 2 },
};
