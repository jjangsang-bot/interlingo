"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  getLearningHistoryServerSnapshot,
  getLearningStreakServerSnapshot,
  getLearningXpServerSnapshot,
  getXpProgress,
  loadLearningHistory,
  loadLearningStreakState,
  loadLearningXpState,
  subscribeLearningHistory
} from "../../lib/learning-history";

const modeStats = [
  { answerMode: "multipleChoice", label: "쉬움" },
  { answerMode: "wordOrder", label: "보통" },
  { answerMode: "typing", label: "어려움" }
];

const directionLabels = [
  "한국어 → 영어",
  "영어 → 한국어",
  "한국어 → 일본어",
  "일본어 → 한국어",
  "영어 → 일본어",
  "일본어 → 영어"
];

function getAccuracy(correctCount: number, totalCount: number) {
  if (totalCount === 0) {
    return 0;
  }

  return Math.round((correctCount / totalCount) * 100);
}

export default function StatsPage() {
  const history = useSyncExternalStore(
    subscribeLearningHistory,
    loadLearningHistory,
    getLearningHistoryServerSnapshot
  );
  const streakState = useSyncExternalStore(
    subscribeLearningHistory,
    loadLearningStreakState,
    getLearningStreakServerSnapshot
  );
  const xpState = useSyncExternalStore(
    subscribeLearningHistory,
    loadLearningXpState,
    getLearningXpServerSnapshot
  );

  const attempts = history.flatMap((session) => session.learnedSentences);
  const totalSessionCount = history.length;
  const totalQuestionCount = attempts.length;
  const totalCorrectCount = attempts.filter(
    (attempt) => attempt.result === "correct"
  ).length;
  const totalAccuracy = getAccuracy(totalCorrectCount, totalQuestionCount);
  const modeReport = modeStats.map((mode) => {
    const modeAttempts = attempts.filter(
      (attempt) => attempt.answerMode === mode.answerMode
    );
    const modeCorrectCount = modeAttempts.filter(
      (attempt) => attempt.result === "correct"
    ).length;

    return {
      ...mode,
      totalCount: modeAttempts.length,
      accuracy: getAccuracy(modeCorrectCount, modeAttempts.length)
    };
  });
  const directionReport = directionLabels.map((directionLabel) => ({
    directionLabel,
    totalCount: attempts.filter(
      (attempt) => attempt.directionLabel === directionLabel
    ).length
  }));
  const xpProgress = getXpProgress(xpState);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-paper px-5 py-6 text-ink">
      <header className="border-b border-black/10 pb-4">
        <Link className="text-sm font-semibold text-mint" href="/">
          ← 대시보드
        </Link>
        <h1 className="mt-2 text-2xl font-bold">학습 통계</h1>
        <p className="mt-1 text-sm text-black/55">
          브라우저 localStorage에 저장된 학습 기록 기준입니다.
        </p>
      </header>

      <section className="border-b border-black/10 py-6">
        <h2 className="text-base font-bold">전체 요약</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <article className="rounded-md border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-black/50">총 학습 세션 수</p>
            <p className="mt-1 text-2xl font-bold">{totalSessionCount}</p>
          </article>
          <article className="rounded-md border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-black/50">총 문제 수</p>
            <p className="mt-1 text-2xl font-bold">{totalQuestionCount}</p>
          </article>
          <article className="rounded-md border border-mint/20 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-black/50">총 정답 수</p>
            <p className="mt-1 text-2xl font-bold text-mint">{totalCorrectCount}</p>
          </article>
          <article className="rounded-md border border-mint/20 bg-mint/10 p-4 shadow-sm">
            <p className="text-xs font-semibold text-black/50">전체 정답률</p>
            <p className="mt-1 text-2xl font-bold text-mint">{totalAccuracy}%</p>
          </article>
        </div>
      </section>

      <section className="border-b border-black/10 py-6">
        <h2 className="text-base font-bold">연속 학습</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <article className="rounded-md border border-coral/20 bg-coral/10 p-4 shadow-sm">
            <p className="text-xs font-semibold text-black/50">현재 연속 학습</p>
            <p className="mt-1 text-2xl font-bold text-coral">
              {streakState.currentStreak}일
            </p>
          </article>
          <article className="rounded-md border border-plum/20 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-black/50">최고 연속 학습</p>
            <p className="mt-1 text-2xl font-bold text-plum">
              {streakState.maxStreak}일
            </p>
          </article>
        </div>
      </section>

      <section className="border-b border-black/10 py-6">
        <h2 className="text-base font-bold">XP와 레벨</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <article className="rounded-md border border-mint/20 bg-mint/10 p-4 shadow-sm">
            <p className="text-xs font-semibold text-black/50">현재 레벨</p>
            <p className="mt-1 text-2xl font-bold text-mint">
              Lv{xpState.currentLevel}
            </p>
          </article>
          <article className="rounded-md border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-black/50">누적 XP</p>
            <p className="mt-1 text-2xl font-bold">{xpState.totalXp}</p>
          </article>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-mint"
            style={{ width: `${xpProgress.progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-black/50">
          {xpProgress.nextLevelXp
            ? `Lv${xpProgress.nextLevel}까지 ${
                xpProgress.nextLevelXp - xpState.totalXp
              } XP 남음`
            : "최고 레벨에 도달했습니다."}
        </p>
      </section>

      <section className="border-b border-black/10 py-6">
        <h2 className="text-base font-bold">난이도별 정답률</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {modeReport.map((mode) => (
            <article
              className="rounded-md border border-black/10 bg-white p-3 text-center shadow-sm"
              key={mode.answerMode}
            >
              <p className="text-sm font-bold">{mode.label}</p>
              <p className="mt-2 text-xl font-bold text-mint">{mode.accuracy}%</p>
              <p className="text-xs text-black/45">{mode.totalCount}문제</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-6">
        <h2 className="text-base font-bold">언어 방향별 풀이 수</h2>
        <div className="mt-4 space-y-3">
          {directionReport.map((item) => (
            <article
              className="rounded-md border border-black/10 bg-white p-4 shadow-sm"
              key={item.directionLabel}
            >
              <div className="flex items-center justify-between text-sm">
                <p className="font-semibold">{item.directionLabel}</p>
                <p className="font-bold text-plum">{item.totalCount}문제</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
