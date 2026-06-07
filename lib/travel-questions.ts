export type LanguageCode = "ko" | "en" | "ja";

export type StudyDirection = {
  source: LanguageCode;
  target: LanguageCode;
};

export type AnswerMode = "typing" | "multipleChoice" | "wordOrder";

export type TravelQuestion = {
  id: number;
  korean: string;
  english: string;
  japanese: string;
  answerAlternatives?: Partial<Record<LanguageCode, string[]>>;
  hints: Record<LanguageCode, string[]>;
  wordChunks?: Partial<Record<LanguageCode, string[]>>;
  wordOrder?: Partial<Record<LanguageCode, string[]>>;
};

export type WordOrderChunkOption = {
  chunk: string;
  isDistractor: boolean;
};

export const languageLabels: Record<LanguageCode, string> = {
  ko: "한국어",
  en: "영어",
  ja: "일본어"
};

export const studyDirections: StudyDirection[] = [
  { source: "ko", target: "en" },
  { source: "ko", target: "ja" },
  { source: "en", target: "ko" },
  { source: "en", target: "ja" },
  { source: "ja", target: "ko" },
  { source: "ja", target: "en" }
];

export const travelQuestions: TravelQuestion[] = [
  {
    id: 1,
    korean: "공항까지 어떻게 가나요?",
    english: "How do I get to the airport?",
    japanese: "空港までどうやって行きますか？",
    answerAlternatives: {
      en: ["How can I get to the airport?"],
      ko: ["공항까지 어떻게 갈 수 있나요?"],
      ja: ["空港までどう行けばいいですか？"]
    },
    hints: {
      ko: ["공항", "어떻게 가나요?", "공항까지 어..."],
      en: ["airport", "How do I get to ...?", "How do I get to the a..."],
      ja: ["空港", "どうやって行きますか", "空港までど..."]
    },
    wordChunks: {
      ko: ["공항까지", "어떻게", "가나요?"],
      en: ["How do I", "get to", "the airport?"]
    },
    wordOrder: {
      ja: ["空港まで", "どうやって", "行きますか？"]
    }
  },
  {
    id: 2,
    korean: "호텔에 체크인하고 싶습니다.",
    english: "I would like to check in at the hotel.",
    japanese: "ホテルにチェックインしたいです。",
    answerAlternatives: {
      en: ["I'd like to check in at the hotel.", "I want to check in at the hotel."],
      ko: ["호텔에 체크인하고 싶어요."],
      ja: ["ホテルでチェックインしたいです。"]
    },
    hints: {
      ko: ["호텔, 체크인", "~하고 싶습니다", "호텔에 체크..."],
      en: ["check in, hotel", "I would like to + verb", "I would like to check i..."],
      ja: ["ホテル, チェックイン", "〜したいです", "ホテルにチェック..."]
    },
    wordChunks: {
      ko: ["호텔에", "체크인하고", "싶습니다."],
      en: ["I would like to", "check in", "at the hotel."]
    },
    wordOrder: {
      ja: ["ホテルに", "チェックイン", "したいです。"]
    }
  },
  {
    id: 3,
    korean: "이 기차는 서울역에 정차하나요?",
    english: "Does this train stop at Seoul Station?",
    japanese: "この電車はソウル駅に停まりますか？",
    answerAlternatives: {
      ko: ["이 열차는 서울역에 서나요?"],
      ja: ["この列車はソウル駅に停まりますか？"]
    },
    hints: {
      ko: ["기차, 서울역", "정차하나요?", "이 기차는 서..."],
      en: ["train, stop, Seoul Station", "Does this + noun + verb at ...?", "Does this train stop at S..."],
      ja: ["電車, ソウル駅", "停まりますか", "この電車はソ..."]
    },
    wordChunks: {
      ko: ["이 기차는", "서울역에", "정차하나요?"],
      en: ["Does this train", "stop at", "Seoul Station?"]
    },
    wordOrder: {
      ja: ["この電車は", "ソウル駅に", "停まりますか？"]
    }
  },
  {
    id: 4,
    korean: "창가 좌석으로 부탁드립니다.",
    english: "A window seat, please.",
    japanese: "窓側の席をお願いします。",
    answerAlternatives: {
      en: ["I'd like a window seat, please."],
      ko: ["창가 자리로 부탁드립니다."],
      ja: ["窓側の座席をお願いします。"]
    },
    hints: {
      ko: ["창가 좌석", "부탁드립니다", "창가 좌..."],
      en: ["window seat", "A + noun, please.", "A window s..."],
      ja: ["窓側の席", "お願いします", "窓側の..."]
    },
    wordChunks: {
      ko: ["창가 좌석으로", "부탁드립니다."],
      en: ["A window seat,", "please."]
    },
    wordOrder: {
      ja: ["窓側の席を", "お願いします。"]
    }
  },
  {
    id: 5,
    korean: "근처에 좋은 식당이 있나요?",
    english: "Is there a good restaurant nearby?",
    japanese: "近くに良いレストランはありますか？",
    answerAlternatives: {
      en: ["Are there any good restaurants nearby?"],
      ko: ["근처에 괜찮은 식당이 있나요?"],
      ja: ["近くにいいレストランはありますか？"]
    },
    hints: {
      ko: ["근처, 식당", "있나요?", "근처에 좋은..."],
      en: ["restaurant, nearby", "Is there a + noun + nearby?", "Is there a good r..."],
      ja: ["近く, レストラン", "ありますか", "近くに良い..."]
    },
    wordChunks: {
      ko: ["근처에", "좋은 식당이", "있나요?"],
      en: ["Is there", "a good restaurant", "nearby?"]
    },
    wordOrder: {
      ja: ["近くに", "良いレストランは", "ありますか？"]
    }
  },
  {
    id: 6,
    korean: "사진을 찍어 주시겠어요?",
    english: "Could you take a picture of me?",
    japanese: "写真を撮っていただけますか？",
    answerAlternatives: {
      en: ["Could you take a photo of me?"],
      ko: ["사진 좀 찍어 주시겠어요?"],
      ja: ["写真を撮ってもらえますか？"]
    },
    hints: {
      ko: ["사진", "찍어 주시겠어요?", "사진을 찍..."],
      en: ["take, picture", "Could you + verb + a picture of me?", "Could you take a p..."],
      ja: ["写真", "撮っていただけますか", "写真を撮..."]
    },
    wordChunks: {
      ko: ["사진을", "찍어", "주시겠어요?"],
      en: ["Could you", "take a picture", "of me?"]
    },
    wordOrder: {
      ja: ["写真を", "撮って", "いただけますか？"]
    }
  },
  {
    id: 7,
    korean: "여기서 박물관까지 얼마나 걸리나요?",
    english: "How long does it take to get to the museum from here?",
    japanese: "ここから博物館までどのくらいかかりますか？",
    answerAlternatives: {
      ko: ["여기에서 박물관까지 얼마나 걸리나요?"],
      ja: ["ここから博物館までどれくらいかかりますか？"]
    },
    hints: {
      ko: ["여기서, 박물관", "얼마나 걸리나요?", "여기서 박..."],
      en: ["how long, museum, from here", "How long does it take to get to ...?", "How long does it take to get to the m..."],
      ja: ["ここから, 博物館", "どのくらいかかりますか", "ここから博..."]
    },
    wordChunks: {
      ko: ["여기서", "박물관까지", "얼마나 걸리나요?"],
      en: ["How long does it take", "to get to", "the museum", "from here?"]
    },
    wordOrder: {
      ja: ["ここから", "博物館まで", "どのくらい", "かかりますか？"]
    }
  },
  {
    id: 8,
    korean: "이 표를 취소할 수 있나요?",
    english: "Can I cancel this ticket?",
    japanese: "このチケットをキャンセルできますか？",
    answerAlternatives: {
      ko: ["이 티켓을 취소할 수 있나요?"],
      ja: ["この切符をキャンセルできますか？"]
    },
    hints: {
      ko: ["표, 취소", "할 수 있나요?", "이 표를 취..."],
      en: ["cancel, ticket", "Can I + verb + this noun?", "Can I cancel this t..."],
      ja: ["チケット, キャンセル", "できますか", "このチケットを..."]
    },
    wordChunks: {
      ko: ["이 표를", "취소할 수", "있나요?"],
      en: ["Can I", "cancel", "this ticket?"]
    },
    wordOrder: {
      ja: ["このチケットを", "キャンセル", "できますか？"]
    }
  },
  {
    id: 9,
    korean: "와이파이 비밀번호가 무엇인가요?",
    english: "What is the Wi-Fi password?",
    japanese: "Wi-Fiのパスワードは何ですか？",
    answerAlternatives: {
      en: ["What's the Wi-Fi password?"],
      ko: ["와이파이 비밀번호는 뭐예요?"],
      ja: ["Wi-Fiのパスワードはなんですか？"]
    },
    hints: {
      ko: ["와이파이, 비밀번호", "무엇인가요?", "와이파이 비..."],
      en: ["Wi-Fi, password", "What is the + noun?", "What is the Wi-Fi p..."],
      ja: ["Wi-Fi, パスワード", "何ですか", "Wi-Fiのパ..."]
    },
    wordChunks: {
      ko: ["와이파이 비밀번호가", "무엇인가요?"],
      en: ["What is", "the Wi-Fi password?"]
    },
    wordOrder: {
      ja: ["Wi-Fiの", "パスワードは", "何ですか？"]
    }
  },
  {
    id: 10,
    korean: "짐을 잠시 맡길 수 있을까요?",
    english: "Can I leave my luggage here for a while?",
    japanese: "荷物をしばらく預けてもいいですか？",
    answerAlternatives: {
      en: ["Could I leave my luggage here for a while?"],
      ko: ["짐을 잠깐 맡길 수 있을까요?"],
      ja: ["荷物を少し預けてもいいですか？"]
    },
    hints: {
      ko: ["짐, 맡기다", "할 수 있을까요?", "짐을 잠시..."],
      en: ["leave, luggage, for a while", "Can I leave my + noun + here for a while?", "Can I leave my l..."],
      ja: ["荷物, 預ける", "てもいいですか", "荷物をしば..."]
    },
    wordChunks: {
      ko: ["짐을", "잠시", "맡길 수 있을까요?"],
      en: ["Can I", "leave my luggage", "here", "for a while?"]
    },
    wordOrder: {
      ja: ["荷物を", "しばらく", "預けても", "いいですか？"]
    }
  }
];

export function getTranslation(question: TravelQuestion, language: LanguageCode) {
  if (language === "ko") {
    return question.korean;
  }

  if (language === "en") {
    return question.english;
  }

  return question.japanese;
}

export function getAnswersForLanguage(
  question: TravelQuestion,
  language: LanguageCode
) {
  return [
    getTranslation(question, language),
    ...(question.answerAlternatives?.[language] ?? [])
  ];
}

export function getDirectionLabel(direction: StudyDirection) {
  return `${languageLabels[direction.source]} → ${languageLabels[direction.target]}`;
}

export function getAnswerMode(direction: StudyDirection, questionIndex: number): AnswerMode {
  if (direction.target !== "ja") {
    return "typing";
  }

  return questionIndex % 2 === 0 ? "multipleChoice" : "wordOrder";
}

export function getWordOrderChunks(
  question: TravelQuestion,
  language: LanguageCode
) {
  return getWordOrderChunkOptions(question, language).map((option) => option.chunk);
}

export function getWordOrderChunkOptions(
  question: TravelQuestion,
  language: LanguageCode
) {
  const chunks = getBaseWordOrderChunks(question, language);
  const seed = hashChunk(`${question.id}-${language}`, question.id + language.charCodeAt(0));
  const distractorChunks = getAutomaticDistractorChunks(
    question,
    language,
    chunks,
    seed
  );
  const options = [
    ...chunks.map((chunk) => ({ chunk, isDistractor: false })),
    ...distractorChunks.map((chunk) => ({ chunk, isDistractor: true }))
  ];

  return shuffleWordOrderChunkOptions(options, seed);
}

export function combineWordOrderChunks(
  chunks: string[],
  language: LanguageCode
) {
  if (language === "ja") {
    return chunks.join("");
  }

  return chunks.join(" ").replace(/\s+([.,?!])/g, "$1");
}

function createWordOrderChunks(sentence: string, language: LanguageCode) {
  if (language === "ja") {
    return [sentence];
  }

  return sentence.match(/\S+/g) ?? [sentence];
}

function getBaseWordOrderChunks(
  question: TravelQuestion,
  language: LanguageCode
) {
  return question.wordChunks?.[language] ?? question.wordOrder?.[language] ?? createWordOrderChunks(
    getTranslation(question, language),
    language
  );
}

function getAutomaticDistractorChunks(
  question: TravelQuestion,
  language: LanguageCode,
  answerChunks: string[],
  seed: number
) {
  const answerChunkSet = new Set(answerChunks.map(normalizeChunkKey));
  const candidates = travelQuestions
    .filter((candidate) => candidate.id !== question.id)
    .flatMap((candidate) => getBaseWordOrderChunks(candidate, language))
    .filter((chunk) => !answerChunkSet.has(normalizeChunkKey(chunk)));
  const uniqueCandidates = Array.from(
    new Map(candidates.map((chunk) => [normalizeChunkKey(chunk), chunk])).values()
  );
  const distractorCount = Math.min(
    uniqueCandidates.length,
    1 + (seed % 3)
  );

  return shuffleWordOrderChunks(uniqueCandidates, seed + 17).slice(0, distractorCount);
}

function normalizeChunkKey(chunk: string) {
  return chunk.trim().toLowerCase();
}

function shuffleWordOrderChunks(chunks: string[], seed: number) {
  return shuffleWordOrderChunkOptions(
    chunks.map((chunk) => ({ chunk, isDistractor: false })),
    seed
  ).map((item) => item.chunk);
}

function shuffleWordOrderChunkOptions(
  options: WordOrderChunkOption[],
  seed: number
) {
  return options
    .map((option, index) => ({
      ...option,
      rank: hashChunk(`${option.chunk}-${index}`, seed)
    }))
    .sort((left, right) => left.rank - right.rank)
    .map(({ rank, ...option }) => option);
}

function hashChunk(value: string, seed: number) {
  let hash = seed;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 9973;
  }

  return hash;
}

export function getMultipleChoiceOptions(
  question: TravelQuestion,
  language: LanguageCode
) {
  const correctAnswer = getTranslation(question, language);
  const distractors = travelQuestions
    .filter((candidate) => candidate.id !== question.id)
    .map((candidate) => getTranslation(candidate, language));
  const rotatedDistractors = [
    ...distractors.slice(question.id % distractors.length),
    ...distractors.slice(0, question.id % distractors.length)
  ];

  return [correctAnswer, ...rotatedDistractors.slice(0, 3)].sort();
}
