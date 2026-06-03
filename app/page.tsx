"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  calculateLearningStreak,
  clearLearningHistory,
  getCategoryAccuracies,
  getTodayReviewCount,
  loadSentenceReviewStates,
  loadLearningHistory,
  subscribeLearningHistory
} from "../lib/learning-history";

const categories = ["일상생활", "여행", "음식", "비즈니스", "취미"];

const fallbackWeakAreas = [
  { category: "비즈니스", accuracy: 58, totalCount: 0 },
  { category: "일상생활", accuracy: 81, totalCount: 0 },
  { category: "여행", accuracy: 92, totalCount: 0 }
];

export default function HomePage() {
  const history = useSyncExternalStore(
    subscribeLearningHistory,
    loadLearningHistory,
    () => []
  );
  const reviewStates = useSyncExternalStore(
    subscribeLearningHistory,
    loadSentenceReviewStates,
    () => ({})
  );

  const todayReviewCount = getTodayReviewCount(reviewStates);
  const streak = calculateLearningStreak(history);
  const categoryAccuracies = getCategoryAccuracies(history);
  const weakAreas =
    categoryAccuracies.length > 0 ? categoryAccuracies : fallbackWeakAreas;
  const recentSessions = history.slice(0, 3);

  function resetHistory() {
    clearLearningHistory();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-paper px-5 py-6 text-ink">
      <header className="flex items-center justify-between border-b border-black/10 pb-4">
        <div>
          <p className="text-sm font-semibold text-mint">InterLingo</p>
          <h1 className="mt-1 text-2xl font-bold">오늘의 회상 학습</h1>
        </div>
        <div className="rounded-full border border-coral/30 bg-coral/10 px-3 py-1 text-sm font-semibold text-coral">
          {streak}일
        </div>
      </header>

      <section className="border-b border-black/10 py-6">
        <p className="text-sm font-semibold text-plum">오늘의 복습</p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold">{todayReviewCount}</p>
            <p className="mt-1 text-sm text-black/60">개 남음</p>
          </div>
          <Link
            className="flex h-11 items-center rounded-md bg-mint px-5 text-sm font-bold text-white shadow-sm"
            href="/learn"
          >
            복습 시작
          </Link>
        </div>
        <p className="mt-3 text-xs text-black/50">
          문장별 nextReviewAt이 오늘이거나 지난 문장을 복습 대상으로 계산합니다.
        </p>
      </section>

      <section className="border-b border-black/10 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">새 학습</h2>
          <span className="text-sm text-black/50">10문제</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <button
              className="h-12 rounded-md border border-black/10 bg-white text-sm font-semibold shadow-sm disabled:opacity-60"
              disabled={category !== "여행"}
              key={category}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="border-b border-black/10 py-6">
        <h2 className="text-base font-bold">나의 약점</h2>
        <div className="mt-4 space-y-3">
          {weakAreas.map((area) => (
            <div key={area.category}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{area.category}</span>
                <span className="font-semibold">{area.accuracy}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-plum"
                  style={{ width: `${area.accuracy}%` }}
                />
              </div>
              {area.totalCount > 0 && (
                <p className="mt-1 text-xs text-black/40">
                  누적 {area.totalCount}문제 기준
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-black/10 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">최근 학습 기록</h2>
          <span className="text-sm text-black/50">localStorage</span>
        </div>
        <div className="mt-4 space-y-3">
          {recentSessions.length === 0 ? (
            <p className="rounded-md border border-black/10 bg-white p-4 text-sm text-black/60 shadow-sm">
              아직 저장된 학습 기록이 없습니다.
            </p>
          ) : (
            recentSessions.map((session) => (
              <article
                className="rounded-md border border-black/10 bg-white p-4 shadow-sm"
                key={session.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold">{session.category}</p>
                  <p className="text-xs text-black/50">{session.date}</p>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <p className="font-bold text-mint">{session.correctCount}</p>
                    <p className="text-black/50">정답</p>
                  </div>
                  <div>
                    <p className="font-bold text-plum">{session.partialCount}</p>
                    <p className="text-black/50">부분</p>
                  </div>
                  <div>
                    <p className="font-bold text-coral">{session.wrongCount}</p>
                    <p className="text-black/50">오답</p>
                  </div>
                  <div>
                    <p className="font-bold">{session.accuracy}%</p>
                    <p className="text-black/50">정답률</p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="py-5">
        <button
          className="text-xs font-semibold text-black/35 underline decoration-black/20 underline-offset-4"
          onClick={resetHistory}
          type="button"
        >
          개발용 기록 초기화
        </button>
      </section>
    </main>
  );
}
