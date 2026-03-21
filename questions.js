export const questions = [
  {
    id: 1,
    text: '원하시는 포지션의 성능은?',
    options: [
      { value: 'top', label: '무조건 좋은 상위 포지션' },
      { value: 'midlow', label: '중~하위권 포지션' },
      { value: 'any', label: '상관 없다' },
    ],
    mandatory: true,
  },
  {
    id: 2,
    text: '어떤 스탯을 선호 하시나요?',
    options: [
      { value: 'simple', label: '뽑기 쉬운 간단한 스탯' },
      { value: 'special', label: '조금 특별한 스탯' },
      { value: 'any', label: '상관 없다' },
    ],
    mandatory: true,
  },
  {
    id: 3,
    text: '카드 부옵과 애니 스탯 세팅 난이도는 어느 정도를 고려 하시나요?',
    options: [
      { value: 'easy', label: '유니크 3개 이하로 성능이 보장되는 쉬움' },
      { value: 'normal', label: '평균 4~5개의 유니크를 요구하는 보통' },
      { value: 'hard', label: '필요한 옵션 유니크를 5개 이상 뽑아야 하는 어려움' },
      { value: 'easy_normal', label: '쉬움과 보통' },
      { value: 'normal_hard', label: '보통과 어려움' },
      { value: 'all', label: '모두 괜찮다' },
    ],
    mandatory: true,
  },
  {
    id: 4,
    text: '레벨이 낮아도 비교적 쓸만한 포지션을 원하시나요?',
    options: [
      { value: 'low_yes', label: '네(뉴비 유저분께 강추)' },
      { value: 'low_no', label: '아뇨 필요 없어요' },
    ],
    mandatory: false,
  },
  {
    id: 5,
    text: '승패가 확실한 것과 조금이라도 변수가 있는 것, 둘 중 어떤 게 더 나으신가요?',
    options: [
      { value: 'certain', label: '확승과 확패가 딱딱 정해진 것' },
      { value: 'variable', label: '상황에 따라 변수가 있는 것' },
      { value: 'q5_any', label: '상관 없다' },
    ],
    mandatory: false,
  },
  {
    id: 6,
    text: '너프 의존도가 심해도 괜찮은가요?',
    options: [
      { value: 'nerf_yes', label: '네' },
      { value: 'nerf_no', label: '아뇨' },
    ],
    mandatory: false,
  },
  {
    id: 7,
    text: '메타(포지션 분포도)의 영향을 거의 받지 않는 포지션을 찾으시나요?',
    options: [
      { value: 'meta_yes', label: '네' },
      { value: 'meta_no', label: '아뇨 괜찮아요' },
    ],
    mandatory: false,
  },
];
