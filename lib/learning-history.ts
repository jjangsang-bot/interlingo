export type LearningResult = "correct" | "partial" | "wrong" | "revealed";

export type LearningMode = "recognition" | "recall" | "production";

export type LearnedSentenceRecord = {
  sentenceId: string;
  questionId: number;
  korean: string;
  english: string;
  japanese: string;
  directionLabel: string;
  promptText: string;
  promptLanguage: string;
  targetLanguage: string;
  answerMode: string;
  userAnswer: string;
  recommendedAnswer: string;
  result: LearningResult;
  similarity: number;
};

export type LearningSessionRecord = {
  id: string;
  date: string;
  category: string;
  totalCount: number;
  correctCount: number;
  partialCount: number;
  wrongCount: number;
  accuracy: number;
  learnedSentences: LearnedSentenceRecord[];
  wrongSentences: LearnedSentenceRecord[];
};

export type CategoryAccuracy = {
  category: string;
  totalCount: number;
  accuracy: number;
};

export type SentenceReviewState = {
  sentenceId: string;
  reviewLevel: number;
  correctCount: number;
  wrongCount: number;
  nextReviewAt: string;
  lastReviewedAt: string;
};

export type LearningStreakState = {
  currentStreak: number;
  maxStreak: number;
  lastStudyDate: string | null;
};

export type AchievementId =
  | "first-step"
  | "three-day-streak"
  | "seven-day-streak"
  | "hundred-sentences"
  | "interleaving-explorer";

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  description: string;
};

export type EarnedAchievement = AchievementDefinition & {
  earnedAt: string;
};

export type LearningXpState = {
  totalXp: number;
  currentLevel: number;
};

export type XpProgress = LearningXpState & {
  currentLevelXp: number;
  nextLevel: number | null;
  nextLevelXp: number | null;
  progressPercent: number;
};

export const LEARNING_HISTORY_KEY = "interlingo.learningHistory.v1";
export const SENTENCE_REVIEW_STATE_KEY = "interlingo.sentenceReviewState.v1";
export const LEARNING_MODE_KEY = "interlingo.learningMode.v1";
export const LEARNING_STREAK_KEY = "interlingo.learningStreak.v1";
export const ACHIEVEMENTS_KEY = "interlingo.achievements.v1";
export const LEARNING_XP_KEY = "interlingo.learningXp.v1";
const LEARNING_HISTORY_EVENT = "interlingo-learning-history-change";
const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14];
const DEFAULT_LEARNING_MODE: LearningMode = "recall";
const EMPTY_HISTORY: LearningSessionRecord[] = [];
const EMPTY_REVIEW_STATES: Record<string, SentenceReviewState> = {};
const EMPTY_ACHIEVEMENTS: EarnedAchievement[] = [];
const EMPTY_XP_STATE: LearningXpState = {
  totalXp: 0,
  currentLevel: 1
};
const LEVEL_THRESHOLDS = [
  { level: 1, requiredXp: 0 },
  { level: 2, requiredXp: 100 },
  { level: 3, requiredXp: 250 },
  { level: 4, requiredXp: 500 },
  { level: 5, requiredXp: 1000 }
];
const ANSWER_MODE_XP: Record<string, number> = {
  multipleChoice: 5,
  wordOrder: 10,
  typing: 15
};
const REQUIRED_DIRECTION_LABELS = [
  "한국어 → 영어",
  "영어 → 한국어",
  "한국어 → 일본어",
  "일본어 → 한국어",
  "영어 → 일본어",
  "일본어 → 영어"
];
const EMPTY_STREAK_STATE: LearningStreakState = {
  currentStreak: 0,
  maxStreak: 0,
  lastStudyDate: null
};
let cachedHistoryRaw: string | null = null;
let cachedHistory: LearningSessionRecord[] = EMPTY_HISTORY;
let cachedReviewStatesRaw: string | null = null;
let cachedReviewStates: Record<string, SentenceReviewState> = EMPTY_REVIEW_STATES;
let cachedLearningModeRaw: string | null = null;
let cachedLearningMode: LearningMode = DEFAULT_LEARNING_MODE;
let cachedStreakRaw: string | null = null;
let cachedStreak: LearningStreakState = EMPTY_STREAK_STATE;
let cachedAchievementsRaw: string | null = null;
let cachedAchievements: EarnedAchievement[] = EMPTY_ACHIEVEMENTS;
let cachedXpRaw: string | null = null;
let cachedXp: LearningXpState = EMPTY_XP_STATE;

export const achievementDefinitions: AchievementDefinition[] = [
  {
    id: "first-step",
    title: "First Step",
    description: "첫 학습 완료"
  },
  {
    id: "three-day-streak",
    title: "3 Day Streak",
    description: "3일 연속 학습"
  },
  {
    id: "seven-day-streak",
    title: "7 Day Streak",
    description: "7일 연속 학습"
  },
  {
    id: "hundred-sentences",
    title: "100 Sentences",
    description: "누적 100문장 학습"
  },
  {
    id: "interleaving-explorer",
    title: "Interleaving Explorer",
    description: "모든 언어 방향 경험"
  }
];

export function getTodayKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

export function createLearningSessionRecord(params: {
  category: string;
  attempts: LearnedSentenceRecord[];
  now?: Date;
}): LearningSessionRecord {
  const totalCount = params.attempts.length;
  const correctCount = params.attempts.filter(
    (attempt) => attempt.result === "correct"
  ).length;
  const partialCount = params.attempts.filter(
    (attempt) => attempt.result === "partial"
  ).length;
  const wrongSentences = params.attempts.filter(
    (attempt) => attempt.result === "wrong" || attempt.result === "revealed"
  );
  const wrongCount = wrongSentences.length;
  const accuracy = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);
  const date = getTodayKey(params.now);

  return {
    id: `${date}-${Date.now()}`,
    date,
    category: params.category,
    totalCount,
    correctCount,
    partialCount,
    wrongCount,
    accuracy,
    learnedSentences: params.attempts,
    wrongSentences
  };
}

export function loadLearningHistory() {
  if (typeof window === "undefined") {
    return getLearningHistoryServerSnapshot();
  }

  try {
    const rawHistory = window.localStorage.getItem(LEARNING_HISTORY_KEY);

    if (!rawHistory) {
      cachedHistoryRaw = null;
      cachedHistory = EMPTY_HISTORY;
      return cachedHistory;
    }

    if (rawHistory === cachedHistoryRaw) {
      return cachedHistory;
    }

    const parsedHistory = JSON.parse(rawHistory);

    cachedHistoryRaw = rawHistory;
    cachedHistory = Array.isArray(parsedHistory)
      ? (parsedHistory as LearningSessionRecord[])
      : [];

    return cachedHistory;
  } catch {
    cachedHistoryRaw = null;
    cachedHistory = EMPTY_HISTORY;
    return cachedHistory;
  }
}

export function getLearningHistoryServerSnapshot() {
  return EMPTY_HISTORY;
}

export function loadLearningMode() {
  if (typeof window === "undefined") {
    return getLearningModeServerSnapshot();
  }

  const rawMode = window.localStorage.getItem(LEARNING_MODE_KEY);

  if (rawMode === cachedLearningModeRaw) {
    return cachedLearningMode;
  }

  cachedLearningModeRaw = rawMode;
  cachedLearningMode = isLearningMode(rawMode)
    ? rawMode
    : DEFAULT_LEARNING_MODE;

  return cachedLearningMode;
}

export function getLearningModeServerSnapshot() {
  return DEFAULT_LEARNING_MODE;
}

export function saveLearningMode(mode: LearningMode) {
  if (typeof window === "undefined") {
    return DEFAULT_LEARNING_MODE;
  }

  window.localStorage.setItem(LEARNING_MODE_KEY, mode);
  cachedLearningModeRaw = mode;
  cachedLearningMode = mode;
  notifyLearningHistoryChanged();

  return mode;
}

export function saveLearningSession(session: LearningSessionRecord) {
  const history = loadLearningHistory();
  const nextHistory = [session, ...history];

  window.localStorage.setItem(LEARNING_HISTORY_KEY, JSON.stringify(nextHistory));
  const nextStreak = updateLearningStreak(session.date);
  updateLearningXp(session);
  updateAchievements(nextHistory, nextStreak, session.date);
  notifyLearningHistoryChanged();

  return nextHistory;
}

export function loadLearningStreakState() {
  if (typeof window === "undefined") {
    return getLearningStreakServerSnapshot();
  }

  try {
    const rawStreak = window.localStorage.getItem(LEARNING_STREAK_KEY);

    if (!rawStreak) {
      cachedStreakRaw = null;
      cachedStreak = EMPTY_STREAK_STATE;
      return cachedStreak;
    }

    if (rawStreak === cachedStreakRaw) {
      return cachedStreak;
    }

    const parsedStreak = JSON.parse(rawStreak);

    cachedStreakRaw = rawStreak;
    cachedStreak = isLearningStreakState(parsedStreak)
      ? parsedStreak
      : EMPTY_STREAK_STATE;

    return cachedStreak;
  } catch {
    cachedStreakRaw = null;
    cachedStreak = EMPTY_STREAK_STATE;
    return cachedStreak;
  }
}

export function getLearningStreakServerSnapshot() {
  return EMPTY_STREAK_STATE;
}

export function loadAchievements() {
  if (typeof window === "undefined") {
    return getAchievementsServerSnapshot();
  }

  try {
    const rawAchievements = window.localStorage.getItem(ACHIEVEMENTS_KEY);

    if (!rawAchievements) {
      cachedAchievementsRaw = null;
      cachedAchievements = EMPTY_ACHIEVEMENTS;
      return cachedAchievements;
    }

    if (rawAchievements === cachedAchievementsRaw) {
      return cachedAchievements;
    }

    const parsedAchievements = JSON.parse(rawAchievements);

    cachedAchievementsRaw = rawAchievements;
    cachedAchievements = Array.isArray(parsedAchievements)
      ? parsedAchievements.filter(isEarnedAchievement)
      : EMPTY_ACHIEVEMENTS;

    return cachedAchievements;
  } catch {
    cachedAchievementsRaw = null;
    cachedAchievements = EMPTY_ACHIEVEMENTS;
    return cachedAchievements;
  }
}

export function getAchievementsServerSnapshot() {
  return EMPTY_ACHIEVEMENTS;
}

export function loadLearningXpState() {
  if (typeof window === "undefined") {
    return getLearningXpServerSnapshot();
  }

  try {
    const rawXp = window.localStorage.getItem(LEARNING_XP_KEY);

    if (!rawXp) {
      cachedXpRaw = null;
      cachedXp = EMPTY_XP_STATE;
      return cachedXp;
    }

    if (rawXp === cachedXpRaw) {
      return cachedXp;
    }

    const parsedXp = JSON.parse(rawXp);

    cachedXpRaw = rawXp;
    cachedXp = isLearningXpState(parsedXp) ? parsedXp : EMPTY_XP_STATE;

    return cachedXp;
  } catch {
    cachedXpRaw = null;
    cachedXp = EMPTY_XP_STATE;
    return cachedXp;
  }
}

export function getLearningXpServerSnapshot() {
  return EMPTY_XP_STATE;
}

export function getXpProgress(xpState: LearningXpState): XpProgress {
  const currentThreshold = getLevelThreshold(xpState.currentLevel);
  const nextThreshold = LEVEL_THRESHOLDS.find(
    (threshold) => threshold.level === xpState.currentLevel + 1
  );

  if (!nextThreshold) {
    return {
      ...xpState,
      currentLevelXp: currentThreshold.requiredXp,
      nextLevel: null,
      nextLevelXp: null,
      progressPercent: 100
    };
  }

  const levelXpRange = nextThreshold.requiredXp - currentThreshold.requiredXp;
  const earnedInLevel = xpState.totalXp - currentThreshold.requiredXp;

  return {
    ...xpState,
    currentLevelXp: currentThreshold.requiredXp,
    nextLevel: nextThreshold.level,
    nextLevelXp: nextThreshold.requiredXp,
    progressPercent: Math.min(
      100,
      Math.max(0, Math.round((earnedInLevel / levelXpRange) * 100))
    )
  };
}

export function clearLearningHistory() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LEARNING_HISTORY_KEY);
  window.localStorage.removeItem(SENTENCE_REVIEW_STATE_KEY);
  window.localStorage.removeItem(LEARNING_STREAK_KEY);
  window.localStorage.removeItem(ACHIEVEMENTS_KEY);
  window.localStorage.removeItem(LEARNING_XP_KEY);
  cachedHistoryRaw = null;
  cachedHistory = EMPTY_HISTORY;
  cachedReviewStatesRaw = null;
  cachedReviewStates = EMPTY_REVIEW_STATES;
  cachedStreakRaw = null;
  cachedStreak = EMPTY_STREAK_STATE;
  cachedAchievementsRaw = null;
  cachedAchievements = EMPTY_ACHIEVEMENTS;
  cachedXpRaw = null;
  cachedXp = EMPTY_XP_STATE;
  notifyLearningHistoryChanged();
}

export function subscribeLearningHistory(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LEARNING_HISTORY_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LEARNING_HISTORY_EVENT, onStoreChange);
  };
}

function notifyLearningHistoryChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(LEARNING_HISTORY_EVENT));
}

function isLearningMode(mode: string | null): mode is LearningMode {
  return mode === "recognition" || mode === "recall" || mode === "production";
}

function updateLearningStreak(studyDate: string) {
  const previousStreak = loadLearningStreakState();
  const currentStreak = getNextCurrentStreak(previousStreak, studyDate);
  const nextStreak: LearningStreakState = {
    currentStreak,
    maxStreak: Math.max(previousStreak.maxStreak, currentStreak),
    lastStudyDate: studyDate
  };

  window.localStorage.setItem(LEARNING_STREAK_KEY, JSON.stringify(nextStreak));
  cachedStreakRaw = JSON.stringify(nextStreak);
  cachedStreak = nextStreak;

  return nextStreak;
}

function getNextCurrentStreak(
  previousStreak: LearningStreakState,
  studyDate: string
) {
  if (!previousStreak.lastStudyDate) {
    return 1;
  }

  if (previousStreak.lastStudyDate === studyDate) {
    return Math.max(previousStreak.currentStreak, 1);
  }

  if (isPreviousDay(previousStreak.lastStudyDate, studyDate)) {
    return previousStreak.currentStreak + 1;
  }

  return 1;
}

function isPreviousDay(previousDateKey: string, currentDateKey: string) {
  const previousDate = new Date(`${previousDateKey}T00:00:00`);
  const currentDate = new Date(`${currentDateKey}T00:00:00`);
  const oneDayMs = 24 * 60 * 60 * 1000;

  return currentDate.getTime() - previousDate.getTime() === oneDayMs;
}

function isLearningStreakState(value: unknown): value is LearningStreakState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const state = value as Partial<LearningStreakState>;

  return (
    typeof state.currentStreak === "number" &&
    typeof state.maxStreak === "number" &&
    (typeof state.lastStudyDate === "string" || state.lastStudyDate === null)
  );
}

function updateAchievements(
  history: LearningSessionRecord[],
  streak: LearningStreakState,
  earnedAt: string
) {
  const previousAchievements = loadAchievements();
  const earnedIds = new Set(previousAchievements.map((achievement) => achievement.id));
  const nextAchievements = [...previousAchievements];

  for (const definition of achievementDefinitions) {
    if (earnedIds.has(definition.id)) {
      continue;
    }

    if (isAchievementUnlocked(definition.id, history, streak)) {
      nextAchievements.push({
        ...definition,
        earnedAt
      });
    }
  }

  window.localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(nextAchievements));
  cachedAchievementsRaw = JSON.stringify(nextAchievements);
  cachedAchievements = nextAchievements;

  return nextAchievements;
}

function isAchievementUnlocked(
  achievementId: AchievementId,
  history: LearningSessionRecord[],
  streak: LearningStreakState
) {
  const learnedSentences = history.flatMap((session) => session.learnedSentences);

  if (achievementId === "first-step") {
    return history.length > 0;
  }

  if (achievementId === "three-day-streak") {
    return streak.currentStreak >= 3 || streak.maxStreak >= 3;
  }

  if (achievementId === "seven-day-streak") {
    return streak.currentStreak >= 7 || streak.maxStreak >= 7;
  }

  if (achievementId === "hundred-sentences") {
    return learnedSentences.length >= 100;
  }

  return REQUIRED_DIRECTION_LABELS.every((directionLabel) =>
    learnedSentences.some((sentence) => sentence.directionLabel === directionLabel)
  );
}

function isEarnedAchievement(value: unknown): value is EarnedAchievement {
  if (!value || typeof value !== "object") {
    return false;
  }

  const achievement = value as Partial<EarnedAchievement>;

  return (
    typeof achievement.id === "string" &&
    typeof achievement.title === "string" &&
    typeof achievement.description === "string" &&
    typeof achievement.earnedAt === "string"
  );
}

function updateLearningXp(session: LearningSessionRecord) {
  const previousXp = loadLearningXpState();
  const earnedXp = session.learnedSentences.reduce(
    (total, sentence) => total + (ANSWER_MODE_XP[sentence.answerMode] ?? 0),
    0
  );
  const totalXp = previousXp.totalXp + earnedXp;
  const nextXp: LearningXpState = {
    totalXp,
    currentLevel: calculateLevel(totalXp)
  };

  window.localStorage.setItem(LEARNING_XP_KEY, JSON.stringify(nextXp));
  cachedXpRaw = JSON.stringify(nextXp);
  cachedXp = nextXp;

  return nextXp;
}

function calculateLevel(totalXp: number) {
  return LEVEL_THRESHOLDS.reduce(
    (currentLevel, threshold) =>
      totalXp >= threshold.requiredXp ? threshold.level : currentLevel,
    1
  );
}

function getLevelThreshold(level: number) {
  return (
    LEVEL_THRESHOLDS.find((threshold) => threshold.level === level) ??
    LEVEL_THRESHOLDS[0]
  );
}

function isLearningXpState(value: unknown): value is LearningXpState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const state = value as Partial<LearningXpState>;

  return (
    typeof state.totalXp === "number" &&
    typeof state.currentLevel === "number"
  );
}

export function calculateLearningStreak(history: LearningSessionRecord[]) {
  const studiedDates = Array.from(new Set(history.map((session) => session.date))).sort(
    (left, right) => right.localeCompare(left)
  );

  if (studiedDates.length === 0) {
    return 0;
  }

  let cursor = new Date(`${getTodayKey()}T00:00:00`);
  let streak = 0;

  for (const studiedDate of studiedDates) {
    const cursorKey = getTodayKey(cursor);

    if (studiedDate === cursorKey) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (streak === 0) {
      cursor.setDate(cursor.getDate() - 1);

      if (studiedDate === getTodayKey(cursor)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
    }

    break;
  }

  return streak;
}

export function getCategoryAccuracies(history: LearningSessionRecord[]) {
  const categoryMap = new Map<string, { correctCount: number; totalCount: number }>();

  for (const session of history) {
    const previous = categoryMap.get(session.category) ?? {
      correctCount: 0,
      totalCount: 0
    };

    categoryMap.set(session.category, {
      correctCount: previous.correctCount + session.correctCount,
      totalCount: previous.totalCount + session.totalCount
    });
  }

  return Array.from(categoryMap.entries())
    .map<CategoryAccuracy>(([category, stats]) => ({
      category,
      totalCount: stats.totalCount,
      accuracy:
        stats.totalCount === 0
          ? 0
          : Math.round((stats.correctCount / stats.totalCount) * 100)
    }))
    .sort((left, right) => left.accuracy - right.accuracy);
}

export function createSentenceId(category: string, questionId: number) {
  return `${category}:${questionId}`;
}

export function loadSentenceReviewStates() {
  if (typeof window === "undefined") {
    return getSentenceReviewStatesServerSnapshot();
  }

  try {
    const rawStates = window.localStorage.getItem(SENTENCE_REVIEW_STATE_KEY);

    if (!rawStates) {
      cachedReviewStatesRaw = null;
      cachedReviewStates = EMPTY_REVIEW_STATES;
      return cachedReviewStates;
    }

    if (rawStates === cachedReviewStatesRaw) {
      return cachedReviewStates;
    }

    const parsedStates = JSON.parse(rawStates);

    cachedReviewStatesRaw = rawStates;
    cachedReviewStates = parsedStates && typeof parsedStates === "object"
      ? (parsedStates as Record<string, SentenceReviewState>)
      : {};

    return cachedReviewStates;
  } catch {
    cachedReviewStatesRaw = null;
    cachedReviewStates = EMPTY_REVIEW_STATES;
    return cachedReviewStates;
  }
}

export function getSentenceReviewStatesServerSnapshot() {
  return EMPTY_REVIEW_STATES;
}

export function getTodayReviewCount(
  reviewStates: Record<string, SentenceReviewState>
) {
  return Object.values(reviewStates).filter((state) => isReviewDue(state)).length;
}

export function isReviewDue(state: SentenceReviewState | undefined, now = new Date()) {
  if (!state) {
    return false;
  }

  return state.nextReviewAt <= getTodayKey(now);
}

export function updateSentenceReviewState(params: {
  sentenceId: string;
  result: LearningResult;
  now?: Date;
}) {
  if (typeof window === "undefined") {
    return undefined;
  }

  const now = params.now ?? new Date();
  const today = getTodayKey(now);
  const currentStates = loadSentenceReviewStates();
  const previousState = currentStates[params.sentenceId];
  const isCorrect = params.result === "correct";
  const isWrong = params.result === "wrong" || params.result === "revealed";
  const reviewLevel = isCorrect
    ? Math.min((previousState?.reviewLevel ?? 0) + 1, REVIEW_INTERVAL_DAYS.length)
    : 0;
  const intervalDays = isCorrect
    ? REVIEW_INTERVAL_DAYS[reviewLevel - 1]
    : 1;
  const nextReviewDate = new Date(now);

  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  const nextState: SentenceReviewState = {
    sentenceId: params.sentenceId,
    reviewLevel,
    correctCount:
      (previousState?.correctCount ?? 0) + (isCorrect ? 1 : 0),
    wrongCount: (previousState?.wrongCount ?? 0) + (isWrong ? 1 : 0),
    nextReviewAt: getTodayKey(nextReviewDate),
    lastReviewedAt: today
  };

  const nextStates = {
    ...currentStates,
    [params.sentenceId]: nextState
  };

  window.localStorage.setItem(SENTENCE_REVIEW_STATE_KEY, JSON.stringify(nextStates));
  notifyLearningHistoryChanged();

  return nextState;
}
