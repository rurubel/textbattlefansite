/** 포지션 성향 테스트 문항·결과 (한·영·일) */

const KO_QUESTIONS = [
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

const EN_QUESTIONS = [
  {
    id: 1,
    text: 'What performance level do you want from your position?',
    options: [
      { value: 'top', label: 'A strong top-tier position' },
      { value: 'midlow', label: 'Mid to lower-tier is fine' },
      { value: 'any', label: 'No preference' },
    ],
    mandatory: true,
  },
  {
    id: 2,
    text: 'Which stats do you prefer?',
    options: [
      { value: 'simple', label: 'Simple stats that are easy to roll' },
      { value: 'special', label: 'Something a bit more special' },
      { value: 'any', label: 'No preference' },
    ],
    mandatory: true,
  },
  {
    id: 3,
    text: 'How much do you care about the difficulty of card substats and Ani stat setups?',
    options: [
      { value: 'easy', label: 'Easy — performance with 3 or fewer uniques' },
      { value: 'normal', label: 'Normal — about 4–5 uniques on average' },
      { value: 'hard', label: 'Hard — need 5+ uniques for the right options' },
      { value: 'easy_normal', label: 'Easy and normal' },
      { value: 'normal_hard', label: 'Normal and hard' },
      { value: 'all', label: 'All are fine' },
    ],
    mandatory: true,
  },
  {
    id: 4,
    text: 'Do you want a position that is still usable at low level?',
    options: [
      { value: 'low_yes', label: 'Yes (recommended for new players)' },
      { value: 'low_no', label: 'No, not needed' },
    ],
    mandatory: false,
  },
  {
    id: 5,
    text: 'Which do you prefer: clear wins/losses, or some room for variance?',
    options: [
      { value: 'certain', label: 'Very predictable wins and losses' },
      { value: 'variable', label: 'Situations with some variance' },
      { value: 'q5_any', label: 'No preference' },
    ],
    mandatory: false,
  },
  {
    id: 6,
    text: 'Is it okay if the position relies heavily on balance patches?',
    options: [
      { value: 'nerf_yes', label: 'Yes' },
      { value: 'nerf_no', label: 'No' },
    ],
    mandatory: false,
  },
  {
    id: 7,
    text: 'Are you looking for a position that barely depends on the meta (position spread)?',
    options: [
      { value: 'meta_yes', label: 'Yes' },
      { value: 'meta_no', label: 'No, that is fine' },
    ],
    mandatory: false,
  },
];

const JA_QUESTIONS = [
  {
    id: 1,
    text: '求めるポジションの性能は？',
    options: [
      { value: 'top', label: 'とにかく強い上位ポジション' },
      { value: 'midlow', label: '中〜下位帯でもよい' },
      { value: 'any', label: 'どちらでもよい' },
    ],
    mandatory: true,
  },
  {
    id: 2,
    text: '好みのステータスは？',
    options: [
      { value: 'simple', label: '出やすいシンプルなステ' },
      { value: 'special', label: '少し変わったステ' },
      { value: 'any', label: 'どちらでもよい' },
    ],
    mandatory: true,
  },
  {
    id: 3,
    text: 'カードのサブオプとアニのステ設定の難易度はどの程度を想定しますか？',
    options: [
      { value: 'easy', label: 'ユニーク3個以下で性能が担保される易しさ' },
      { value: 'normal', label: '平均4〜5個のユニークが必要な普通' },
      { value: 'hard', label: '必要オプションのユニークを5個以上引く難しさ' },
      { value: 'easy_normal', label: '易しさと普通' },
      { value: 'normal_hard', label: '普通と難しさ' },
      { value: 'all', label: 'すべて問題ない' },
    ],
    mandatory: true,
  },
  {
    id: 4,
    text: 'レベルが低くても比較的使えるポジションを望みますか？',
    options: [
      { value: 'low_yes', label: 'はい（初心者におすすめ）' },
      { value: 'low_no', label: 'いいえ、不要です' },
    ],
    mandatory: false,
  },
  {
    id: 5,
    text: '勝ち負けがはっきりしているものと、多少ムラがあるもの、どちらがよいですか？',
    options: [
      { value: 'certain', label: '確定勝ち・確定負けがはっきりしているもの' },
      { value: 'variable', label: '状況によって変動があるもの' },
      { value: 'q5_any', label: 'どちらでもよい' },
    ],
    mandatory: false,
  },
  {
    id: 6,
    text: 'ナーフ（弱体化）への依存が強くてもよいですか？',
    options: [
      { value: 'nerf_yes', label: 'はい' },
      { value: 'nerf_no', label: 'いいえ' },
    ],
    mandatory: false,
  },
  {
    id: 7,
    text: 'メタ（ポジション分布）の影響をほとんど受けないポジションを探していますか？',
    options: [
      { value: 'meta_yes', label: 'はい' },
      { value: 'meta_no', label: 'いいえ、気にしない' },
    ],
    mandatory: false,
  },
];

const KO_POSITIONS = {
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

const EN_POSITIONS = {
  bruiser: {
    id: 'bruiser',
    name: 'Bruiser',
    description: 'A damage-dealing tank with both HP and attack.',
    attributes: [
      'Top tier',
      'Simple stats',
      'Medium difficulty',
      'Usable at low level',
      'Has variance',
      'Patch-dependent',
      'Affected by position meta',
    ],
  },
  tank: {
    id: 'tank',
    name: 'Tank',
    description: 'A tank that soaks enemy hits with high HP.',
    attributes: [
      'Top tier',
      'Simple stats',
      'Easy',
      'Usable at low level',
      'Clear wins/losses',
      'Not very patch-dependent',
      'Little meta influence',
    ],
  },
  extreme_speed: {
    id: 'extreme_speed',
    name: 'Extreme AGI DPS',
    description: 'High agility and high ATK substats merge speed and damage.',
    attributes: [
      'Top tier',
      'Simple stats',
      'Hard',
      'Needs levels',
      'Clear wins/losses',
      'Patch-dependent',
      'Little meta influence',
    ],
  },
  min_speed: {
    id: 'min_speed',
    name: 'AGI DPS',
    description: 'High agility to win the first-strike game.',
    attributes: [
      'Mid–low',
      'Special stats',
      'Medium',
      'Needs levels',
      'Clear wins/losses',
      'Not very patch-dependent',
      'Affected by meta',
    ],
  },
  extreme_atk: {
    id: 'extreme_atk',
    name: 'Extreme ATK DPS',
    description: 'Maximizes damage by focusing on attack.',
    attributes: [
      'Mid–low',
      'Special stats',
      'Easy',
      'Needs levels',
      'Clear wins/losses',
      'Not very patch-dependent',
      'Little meta influence',
    ],
  },
  atk_speed: {
    id: 'atk_speed',
    name: 'ATK–AGI DPS',
    description: 'Balanced aggression and agility.',
    attributes: [
      'Mid–low',
      'Simple stats',
      'Hard',
      'Needs levels',
      'Flexible',
      'Patch-dependent',
      'Affected by meta',
    ],
  },
  berserker: {
    id: 'berserker',
    name: 'Berserker',
    description: 'Anti-tank DPS with high attack and solid HP.',
    attributes: [
      'Mid–low',
      'Special stats',
      'Medium',
      'Needs levels',
      'Clear wins/losses',
      'Moderate patch reliance',
      'Affected by meta',
    ],
  },
  atk_bruiser: {
    id: 'atk_bruiser',
    name: 'ATK Bruiser',
    description: 'A bruiser that leans on attack.',
    attributes: [
      'Mid–low',
      'Simple stats',
      'Medium',
      'Needs levels',
      'Clear wins/losses',
      'Patch-dependent',
      'Affected by meta',
    ],
  },
  balance: {
    id: 'balance',
    name: 'Balance',
    description: 'Evenly spread stats across the board.',
    attributes: [
      'Mid–low',
      'Simple stats',
      'Easy',
      'Usable at low level',
      'Flexible',
      'Patch-dependent',
      'Affected by meta',
    ],
  },
  non_tank: {
    id: 'non_tank',
    name: 'Non-tank',
    description: 'A tanky style built around reducing damage taken.',
    attributes: [
      'Strong',
      'Simple stats',
      'Easy',
      'Needs levels',
      'Clear wins/losses',
      'Moderate patch reliance',
      'Affected by meta',
    ],
  },
};

const JA_POSITIONS = {
  bruiser: {
    id: 'bruiser',
    name: 'ブルーザー',
    description: '体力と攻撃を兼ね備えたデルタンク。',
    attributes: [
      '上位',
      'シンプルなステ',
      '普通',
      '低レベルでも使える',
      '変動あり',
      'ナーフ依存が強い',
      'ポジ分布の影響あり',
    ],
  },
  tank: {
    id: 'tank',
    name: 'タンク',
    description: '高い体力で敵の攻撃を耐えるタンク。',
    attributes: [
      '上位',
      'シンプルなステ',
      '易しい',
      '低レベルでも使える',
      '確定勝ち負け',
      'ナーフ依存は低め',
      'ポジ分布の影響は小さい',
    ],
  },
  extreme_speed: {
    id: 'extreme_speed',
    name: '極敏発',
    description: '高い敏捷と高い攻撃サブで火力と速度を両立。',
    attributes: [
      '上位',
      'シンプルなステ',
      '難しい',
      'レベルが必要',
      '確定勝ち負け',
      'ナーフ依存が強い',
      'ポジ分布の影響は小さい',
    ],
  },
  min_speed: {
    id: 'min_speed',
    name: '敏発',
    description: '高い敏捷で先手を取る発動型。',
    attributes: [
      '中下位',
      '特別なステ',
      '普通',
      'レベルが必要',
      '確定勝ち負け',
      'ナーフ依存は低め',
      'ポジ分布の影響あり',
    ],
  },
  extreme_atk: {
    id: 'extreme_atk',
    name: '極攻発',
    description: '攻撃を主軸にダメージを最大化。',
    attributes: [
      '中下位',
      '特別なステ',
      '易しい',
      'レベルが必要',
      '確定勝ち負け',
      'ナーフ依存は低め',
      'ポジ分布の影響は小さい',
    ],
  },
  atk_speed: {
    id: 'atk_speed',
    name: '攻発',
    description: '攻撃性と敏捷のバランス型。',
    attributes: [
      '中下位',
      'シンプルなステ',
      '難しい',
      'レベルが必要',
      'どちらにも振れる',
      'ナーフ依存が強い',
      'ポジ分布の影響あり',
    ],
  },
  berserker: {
    id: 'berserker',
    name: 'バーサーカー',
    description: '高い攻撃性と十分な体力で安定火力を出すアンチタンク。',
    attributes: [
      '中下位',
      '特別なステ',
      '普通',
      'レベルが必要',
      '確定勝ち負け',
      'ナーフ依存は中程度',
      'ポジ分布の影響あり',
    ],
  },
  atk_bruiser: {
    id: 'atk_bruiser',
    name: '攻ブルーザー',
    description: '攻撃性を主軸にしたブルーザー。',
    attributes: [
      '中下位',
      'シンプルなステ',
      '普通',
      'レベルが必要',
      '確定勝ち負け',
      'ナーフ依存が強い',
      'ポジ分布の影響あり',
    ],
  },
  balance: {
    id: 'balance',
    name: 'バランス',
    description: '全ステを均等に振ったポジション。',
    attributes: [
      '中下位',
      'シンプルなステ',
      '易しい',
      '低レベルでも使える',
      'どちらにも振れる',
      'ナーフ依存が強い',
      'ポジ分布の影響あり',
    ],
  },
  non_tank: {
    id: 'non_tank',
    name: 'ノンタンク',
    description: '防御を軸に被ダメを抑えるタンク寄り。',
    attributes: [
      '良好',
      'シンプルなステ',
      '易しい',
      'レベルが必要',
      '確定勝ち負け',
      'ナーフ依存は低め',
      'ポジ分布の影響あり',
    ],
  },
};

const QUESTIONS_BY_LANG = { ko: KO_QUESTIONS, en: EN_QUESTIONS, ja: JA_QUESTIONS };
const POSITIONS_BY_LANG = { ko: KO_POSITIONS, en: EN_POSITIONS, ja: JA_POSITIONS };

export function getLocalizedQuestions(locale) {
  return QUESTIONS_BY_LANG[locale] || QUESTIONS_BY_LANG.ko;
}

export function getLocalizedPositions(locale) {
  return POSITIONS_BY_LANG[locale] || POSITIONS_BY_LANG.ko;
}
