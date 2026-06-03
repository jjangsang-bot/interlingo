export type LearningResult = "correct" | "partial" | "wrong" | "revealed";

export type LearnedSentenceRecord = {
  questionId: number;
  korean: string;
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

export const LEARNING_HISTORY_KEY = "interlingo.learningHistory.v1";
const LEARNING_HISTORY_EVENT = "interlingo-learning-history-change";

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
    return [];
  }

  try {
    const rawHistory = window.localStorage.getItem(LEARNING_HISTORY_KEY);

    if (!rawHistory) {
      return [];
    }

    const parsedHistory = JSON.parse(rawHistory);

    return Array.isArray(parsedHistory)
      ? (parsedHistory as LearningSessionRecord[])
      : [];
  } catch {
    return [];
  }
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

export function getTodayReviewCount(history: LearningSessionRecord[]) {
  const latestSession = history[0];

  if (!latestSession) {
    return 10;
  }

  return latestSession.wrongCount + latestSession.partialCount;
}
