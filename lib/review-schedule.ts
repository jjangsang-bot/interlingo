export type ReviewResult = "correct" | "partial" | "wrong" | "revealed";

export type ReviewState = {
  intervalDays: number;
  repetitionCount: number;
  lapseCount: number;
  priorityScore: number;
};

export function calculateNextReview(
  state: ReviewState,
  result: ReviewResult,
  now = new Date()
) {
  if (result === "wrong" || result === "revealed") {
    return {
      dueAt: now,
      intervalDays: 0,
      repetitionCount: 0,
      lapseCount: state.lapseCount + 1,
      priorityScore: state.priorityScore + (result === "revealed" ? 2 : 1)
    };
  }

  const nextRepetition =
    result === "partial" ? state.repetitionCount : state.repetitionCount + 1;

  const intervals = [1, 3, 7, 14, 30];
  const intervalDays = intervals[Math.min(nextRepetition - 1, intervals.length - 1)] ?? 1;
  const dueAt = new Date(now);
  dueAt.setDate(dueAt.getDate() + intervalDays);

  return {
    dueAt,
    intervalDays,
    repetitionCount: nextRepetition,
    lapseCount: state.lapseCount,
    priorityScore: Math.max(0, state.priorityScore - 0.5)
  };
}

