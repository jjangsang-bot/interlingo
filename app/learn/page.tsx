"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  AnswerEvaluation,
  evaluateAnswer
} from "../../lib/answer-normalize";
import { travelQuestions } from "../../lib/travel-questions";

type Result = "correct" | "partial" | "wrong" | "revealed" | null;

export default function LearnPage() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [hintCount, setHintCount] = useState(0);
  const [result, setResult] = useState<Result>(null);
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const question = travelQuestions[questionIndex];
  const isAnswered = result !== null;

  function gradeAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!answer.trim() || isAnswered) {
      return;
    }

    const nextEvaluation = evaluateAnswer(answer, question.answers);

    setEvaluation(nextEvaluation);
    setResult(nextEvaluation.result);

    if (nextEvaluation.result === "correct") {
      setCorrectCount((count) => count + 1);
    }
  }

  function showHint() {
    setHintCount((count) => Math.min(count + 1, question.hints.length));
  }

  function revealAnswer() {
    if (!isAnswered) {
      setResult("revealed");
    }
  }

  function goToNextQuestion() {
    if (questionIndex === travelQuestions.length - 1) {
      setIsComplete(true);
      return;
    }

    setQuestionIndex((index) => index + 1);
    setAnswer("");
    setHintCount(0);
    setResult(null);
    setEvaluation(null);
  }

  if (isComplete) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-paper px-5 py-6 text-ink">
        <header className="border-b border-black/10 pb-4">
          <p className="text-sm font-semibold text-mint">InterLingo</p>
          <h1 className="mt-1 text-2xl font-bold">복습 완료</h1>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <p className="text-sm font-semibold text-plum">여행 · 한국어 → 영어</p>
          <p className="mt-4 text-6xl font-bold text-mint">{correctCount}</p>
          <p className="mt-2 text-sm text-black/60">10문제 중 정답</p>
          <p className="mt-8 text-lg font-bold">오늘의 복습을 마쳤습니다.</p>
          <Link
            className="mt-8 flex h-12 w-full items-center justify-center rounded-md bg-mint text-sm font-bold text-white shadow-sm"
            href="/"
          >
            대시보드로 돌아가기
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-paper px-5 py-6 text-ink">
      <header className="border-b border-black/10 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-mint">InterLingo</p>
            <h1 className="mt-1 text-xl font-bold">여행 문장 복습</h1>
          </div>
          <p className="text-sm font-bold text-plum">
            {questionIndex + 1} / {travelQuestions.length}
          </p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-mint transition-all"
            style={{ width: `${((questionIndex + 1) / travelQuestions.length) * 100}%` }}
          />
        </div>
      </header>

      <section className="flex flex-1 flex-col py-6">
        <p className="text-sm font-semibold text-plum">한국어 → 영어</p>
        <h2 className="mt-6 text-2xl font-bold leading-relaxed">{question.korean}</h2>

        <form className="mt-8" onSubmit={gradeAnswer}>
          <label className="text-sm font-semibold" htmlFor="answer">
            영어로 답해 보세요
          </label>
          <textarea
            autoFocus
            className="mt-3 min-h-28 w-full resize-none rounded-md border border-black/15 bg-white p-4 text-base leading-relaxed outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20 disabled:bg-black/5"
            disabled={isAnswered}
            id="answer"
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="영어 문장을 입력하세요"
            value={answer}
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              className="h-11 rounded-md border border-plum/30 bg-plum/10 text-sm font-bold text-plum disabled:opacity-40"
              disabled={hintCount === question.hints.length || isAnswered}
              onClick={showHint}
              type="button"
            >
              힌트 {hintCount > 0 ? `${hintCount}/${question.hints.length}` : ""}
            </button>
            <button
              className="h-11 rounded-md border border-coral/30 bg-coral/10 text-sm font-bold text-coral disabled:opacity-40"
              disabled={isAnswered}
              onClick={revealAnswer}
              type="button"
            >
              정답 보기
            </button>
          </div>

          {hintCount > 0 && (
            <div className="mt-4 rounded-md border border-plum/20 bg-plum/5 p-4">
              <p className="text-sm font-bold text-plum">힌트</p>
              <ol className="mt-2 space-y-1 text-sm leading-relaxed">
                {question.hints.slice(0, hintCount).map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ol>
            </div>
          )}

          {!isAnswered && (
            <button
              className="mt-6 h-12 w-full rounded-md bg-mint text-sm font-bold text-white shadow-sm disabled:opacity-40"
              disabled={!answer.trim()}
              type="submit"
            >
              채점하기
            </button>
          )}
        </form>

        {isAnswered && (
          <section
            className={`mt-6 rounded-md border p-4 ${
              result === "correct"
                ? "border-mint/30 bg-mint/10"
                : result === "partial"
                  ? "border-plum/30 bg-plum/10"
                  : "border-coral/30 bg-coral/10"
            }`}
          >
            <p
              className={`text-sm font-bold ${
                result === "correct"
                  ? "text-mint"
                  : result === "partial"
                    ? "text-plum"
                    : "text-coral"
              }`}
            >
              {result === "correct"
                ? "정답입니다."
                : result === "partial"
                  ? "거의 맞았습니다. 표현을 한 번 더 확인해 보세요."
                : result === "revealed"
                  ? "정답을 확인했습니다."
                  : "다시 복습할 문장입니다."}
            </p>
            {evaluation && (
              <p className="mt-2 text-xs font-semibold text-black/50">
                문자열 유사도 {Math.round(evaluation.similarity * 100)}%
              </p>
            )}
            {answer && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-black/50">나의 답</p>
                <p className="mt-1 text-sm leading-relaxed">{answer}</p>
              </div>
            )}
            <div className="mt-4">
              <p className="text-xs font-semibold text-black/50">정답</p>
              <p className="mt-1 text-sm font-semibold leading-relaxed">
                {question.answers[0]}
              </p>
            </div>
            <button
              className="mt-5 h-12 w-full rounded-md bg-mint text-sm font-bold text-white shadow-sm"
              onClick={goToNextQuestion}
              type="button"
            >
              {questionIndex === travelQuestions.length - 1 ? "결과 보기" : "다음 문제"}
            </button>
          </section>
        )}
      </section>
    </main>
  );
}
