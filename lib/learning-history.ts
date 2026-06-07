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

export const LEARNING_HISTORY_KEY = "interlingo.learningHistory.v1";
export const SENTENCE_REVIEW_STATE_KEY = "interlingo.sentenceReviewState.v1";
export const LEARNING_MODE_KEY = "interlingo.learningMode.v1";
const LEARNING_HISTORY_EVENT = "interlingo-learning-history-change";
const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14];
const DEFAULT_LEARNING_MODE: LearningMode = "recall";
const EMPTY_HISTORY: LearningSessionRecord[] = [];
const EMPTY_REVIEW_STATES: Record<string, SentenceReviewState> = {};
let cachedHistoryRaw: string | null = null;
let cachedHistory: LearningSessionRecord[] = EMPTY_HISTORY;
let cachedReviewStatesRaw: string | null = null;
let cachedReviewStates: Record<string, SentenceReviewState> = EMPTY_REVIEW_STATES;
let cachedLearningModeRaw: string | null = null;
let cachedLearningMode: LearningMode = DEFAULT_LEARNING_MODE;

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
  notifyLearningHistoryChanged();

  return nextHistory;
}

export function clearLearningHistory() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LEARNING_HISTORY_KEY);
  window.localStorage.removeItem(SENTENCE_REVIEW_STATE_KEY);
  cachedHistoryRaw = null;
  cachedHistory = EMPTY_HISTORY;
  cachedReviewStatesRaw = null;
  cachedReviewStates = EMPTY_REVIEW_STATES;
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
