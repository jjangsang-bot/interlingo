"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  AnswerEvaluation,
  evaluateAnswer
} from "../../lib/answer-normalize";
import {
  createLearningSessionRecord,
  createSentenceId,
  getTodayKey,
  isReviewDue,
  LearnedSentenceRecord,
  LearningResult,
  getLearningModeServerSnapshot,
  loadLearningMode,
  loadSentenceReviewStates,
  saveLearningSession,
  subscribeLearningHistory,
  updateSentenceReviewState
} from "../../lib/learning-history";
import {
  AnswerMode,
  combineWordOrderChunks,
  getAnswerMode,
  getAnswersForLanguage,
  getDirectionLabel,
  getMultipleChoiceOptions,
  getTranslation,
  getWordOrderChunkOptions,
  languageLabels,
  StudyDirection,
  studyDirections,
  TravelQuestion,
  travelQuestions
} from "../../lib/travel-questions";

type Result = "correct" | "partial" | "wrong" | "revealed" | null;

type SelectedChunk = {
  chunk: string;
  index: number;
  isDistractor: boolean;
};

const CATEGORY = "여행";

const modeReportItems = [
  { answerMode: "multipleChoice", label: "쉬움" },
  { answerMode: "wordOrder", label: "보통" },
  { answerMode: "typing", label: "어려움" }
];

function getResultLabel(result: LearningResult) {
  if (result === "correct") {
    return "정답";
  }

  if (result === "partial") {
    return "부분 정답";
  }

  if (result === "revealed") {
    return "정답 확인";
  }

  return "오답";
}

function getModeLabel(answerMode: string) {
  return modeReportItems.find((item) => item.answerMode === answerMode)?.label ?? "기타";
}

function getAccuracy(attempts: LearnedSentenceRecord[]) {
  if (attempts.length === 0) {
    return 0;
  }

  const correctCount = attempts.filter((attempt) => attempt.result === "correct").length;

  return Math.round((correctCount / attempts.length) * 100);
}

function getModeReport(attempts: LearnedSentenceRecord[]) {
  return modeReportItems.map((item) => {
    const modeAttempts = attempts.filter(
      (attempt) => attempt.answerMode === item.answerMode
    );

    return {
      ...item,
      totalCount: modeAttempts.length,
      accuracy: getAccuracy(modeAttempts)
    };
  });
}

function getFutureDateKey(daysFromToday: number) {
  const date = new Date();

  date.setDate(date.getDate() + daysFromToday);

  return getTodayKey(date);
}

function getReviewScheduleSummary(attempts: LearnedSentenceRecord[]) {
  const reviewStates = loadSentenceReviewStates();
  const sentenceIds = new Set(attempts.map((attempt) => attempt.sentenceId));

  return [
    { label: "내일 복습 예정", date: getFutureDateKey(1), count: 0 },
    { label: "3일 후 복습 예정", date: getFutureDateKey(3), count: 0 },
    { label: "7일 후 복습 예정", date: getFutureDateKey(7), count: 0 }
  ].map((item) => ({
    ...item,
    count: Object.values(reviewStates).filter(
      (state) => sentenceIds.has(state.sentenceId) && state.nextReviewAt === item.date
    ).length
  }));
}

function selectSessionQuestions(
  reviewStates: ReturnType<typeof loadSentenceReviewStates>
) {
  const dueQuestions = travelQuestions.filter((question) =>
    isReviewDue(reviewStates[createSentenceId(CATEGORY, question.id)])
  );

  if (dueQuestions.length > 0) {
    return dueQuestions;
  }

  const newQuestions = travelQuestions.filter(
    (question) => !reviewStates[createSentenceId(CATEGORY, question.id)]
  );

  return newQuestions.length > 0 ? newQuestions : travelQuestions;
}

function getDirectionForQuestion(index: number) {
  return studyDirections[index % studyDirections.length];
}

function subscribeClientHydration() {
  return () => {};
}

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

function createAttempt(params: {
  answer: string;
  direction: StudyDirection;
  question: TravelQuestion;
  answerMode: AnswerMode;
  recommendedAnswer: string;
  result: LearningResult;
  similarity: number;
}) {
  return {
    sentenceId: createSentenceId(CATEGORY, params.question.id),
    questionId: params.question.id,
    korean: params.question.korean,
    english: params.question.english,
    japanese: params.question.japanese,
    directionLabel: getDirectionLabel(params.direction),
    promptText: getTranslation(params.question, params.direction.source),
    promptLanguage: languageLabels[params.direction.source],
    targetLanguage: languageLabels[params.direction.target],
    answerMode: params.answerMode,
    userAnswer: params.answer,
    recommendedAnswer: params.recommendedAnswer,
    result: params.result,
    similarity: params.similarity
  };
}

export default function LearnPage() {
  const [sessionQuestions, setSessionQuestions] =
    useState<TravelQuestion[]>(travelQuestions);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [selectedChunks, setSelectedChunks] = useState<SelectedChunk[]>([]);
  const [hintCount, setHintCount] = useState(0);
  const [result, setResult] = useState<Result>(null);
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<LearnedSentenceRecord | null>(null);
  const [sessionAttempts, setSessionAttempts] = useState<LearnedSentenceRecord[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const hasSavedSession = useRef(false);
  const learningMode = useSyncExternalStore(
    subscribeLearningHistory,
    loadLearningMode,
    getLearningModeServerSnapshot
  );
  const isLearningModeHydrated = useSyncExternalStore(
    subscribeClientHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );

  const question = sessionQuestions[questionIndex];
  const direction = getDirectionForQuestion(questionIndex);
  const answerMode =
    learningMode === "recognition"
      ? "multipleChoice"
      : learningMode === "recall"
        ? "wordOrder"
        : learningMode === "production"
          ? "typing"
          : getAnswerMode(direction, questionIndex);
  const directionLabel = getDirectionLabel(direction);
  const promptText = getTranslation(question, direction.source);
  const targetAnswers = getAnswersForLanguage(question, direction.target);
  const targetHints = question.hints[direction.target];
  const multipleChoiceOptions = getMultipleChoiceOptions(question, direction.target);
  const wordOrderChunkOptions = getWordOrderChunkOptions(question, direction.target);
  const currentAnswer =
    answerMode === "multipleChoice"
      ? selectedChoice
      : answerMode === "wordOrder"
        ? combineWordOrderChunks(
            selectedChunks.map((selectedChunk) => selectedChunk.chunk),
            direction.target
          )
        : answer;
  const hasSelectedDistractor = selectedChunks.some(
    (selectedChunk) => selectedChunk.isDistractor
  );
  const canSubmit = currentAnswer.trim().length > 0;
  const isAnswered = result !== null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSessionQuestions(selectSessionQuestions(loadSentenceReviewStates()));
      setQuestionIndex(0);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isComplete || hasSavedSession.current || sessionAttempts.length === 0) {
      return;
    }

    const sessionRecord = createLearningSessionRecord({
      category: CATEGORY,
      attempts: sessionAttempts
    });

    saveLearningSession(sessionRecord);
    hasSavedSession.current = true;
  }, [isComplete, sessionAttempts]);

  function gradeAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || isAnswered) {
      return;
    }

    const nextEvaluation: AnswerEvaluation = hasSelectedDistractor
      ? {
          matchedAnswer: targetAnswers[0],
          result: "wrong",
          similarity: 0
        }
      : evaluateAnswer(currentAnswer, targetAnswers);
    const sentenceId = createSentenceId(CATEGORY, question.id);
    const nextAttempt: LearnedSentenceRecord = createAttempt({
      answer: currentAnswer,
      answerMode,
      direction,
      question,
      recommendedAnswer: nextEvaluation.matchedAnswer,
      result: nextEvaluation.result,
      similarity: nextEvaluation.similarity
    });

    setEvaluation(nextEvaluation);
    setResult(nextEvaluation.result);
    setCurrentAttempt(nextAttempt);
    setSessionAttempts((attempts) => [...attempts, nextAttempt]);
    updateSentenceReviewState({
      sentenceId,
      result: nextEvaluation.result
    });
  }

  function showHint() {
    setHintCount((count) => Math.min(count + 1, targetHints.length));
  }

  function revealAnswer() {
    if (!isAnswered) {
      const sentenceId = createSentenceId(CATEGORY, question.id);
      const nextAttempt: LearnedSentenceRecord = createAttempt({
        answer: currentAnswer,
        answerMode,
        direction,
        question,
        recommendedAnswer: targetAnswers[0],
        result: "revealed",
        similarity: 0
      });

      setResult("revealed");
      setCurrentAttempt(nextAttempt);
      setSessionAttempts((attempts) => [...attempts, nextAttempt]);
      updateSentenceReviewState({
        sentenceId,
        result: "revealed"
      });
    }
  }

  function goToNextQuestion() {
    if (questionIndex === sessionQuestions.length - 1) {
      setIsComplete(true);
      return;
    }

    setQuestionIndex((index) => index + 1);
    setAnswer("");
    setSelectedChoice("");
    setSelectedChunks([]);
    setHintCount(0);
    setResult(null);
    setEvaluation(null);
    setCurrentAttempt(null);
  }

  function selectWordChunk(
    chunk: string,
    index: number,
    isDistractor: boolean
  ) {
    setSelectedChunks((chunks) => [...chunks, { chunk, index, isDistractor }]);
  }

  function removeSelectedWordChunk(index: number) {
    setSelectedChunks((chunks) =>
      chunks.filter((selectedChunk) => selectedChunk.index !== index)
    );
  }

  if (isComplete) {
    const sessionRecord = createLearningSessionRecord({
      category: CATEGORY,
      attempts: sessionAttempts
    });
    const wrongAttempts = sessionRecord.wrongSentences;
    const modeReport = getModeReport(sessionAttempts);
    const reviewSchedule = getReviewScheduleSummary(sessionAttempts);

    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-paper px-5 py-6 text-ink">
        <header className="border-b border-black/10 pb-4">
          <p className="text-sm font-semibold text-mint">InterLingo</p>
          <h1 className="mt-1 text-2xl font-bold">오늘의 학습 리포트</h1>
        </header>

        <section className="py-6">
          <p className="text-sm font-semibold text-plum">{CATEGORY} · 인터리빙</p>
          <p className="mt-2 text-lg font-bold">오늘 배운 표현을 한눈에 정리했습니다.</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-md border border-black/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-black/50">총 문제 수</p>
              <p className="mt-1 text-2xl font-bold">{sessionRecord.totalCount}</p>
            </div>
            <div className="rounded-md border border-mint/20 bg-mint/10 p-4 shadow-sm">
              <p className="text-xs font-semibold text-black/50">정답률</p>
              <p className="mt-1 text-2xl font-bold text-mint">{sessionRecord.accuracy}%</p>
            </div>
            <div className="rounded-md border border-mint/20 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-black/50">정답 수</p>
              <p className="mt-1 text-2xl font-bold text-mint">{sessionRecord.correctCount}</p>
            </div>
            <div className="rounded-md border border-plum/20 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-black/50">부분 정답 수</p>
              <p className="mt-1 text-2xl font-bold text-plum">{sessionRecord.partialCount}</p>
            </div>
            <div className="rounded-md border border-coral/20 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-black/50">오답 수</p>
              <p className="mt-1 text-2xl font-bold text-coral">{sessionRecord.wrongCount}</p>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-base font-bold">모드별 결과</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {modeReport.map((item) => (
                <article
                  className="rounded-md border border-black/10 bg-white p-3 text-center shadow-sm"
                  key={item.answerMode}
                >
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className="mt-2 text-xl font-bold text-mint">{item.totalCount}</p>
                  <p className="text-xs text-black/50">풀이 수</p>
                  <p className="mt-2 text-xs font-semibold text-plum">
                    정답률 {item.accuracy}%
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-base font-bold">복습 예정 요약</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {reviewSchedule.map((item) => (
                <article
                  className="rounded-md border border-black/10 bg-white p-3 text-center shadow-sm"
                  key={item.label}
                >
                  <p className="text-xs font-semibold text-black/50">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-plum">{item.count}</p>
                  <p className="text-xs text-black/45">문장</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-base font-bold">오늘 배운 표현</h2>
            <div className="mt-3 space-y-3">
              {sessionAttempts.map((attempt, index) => (
                <article
                  className="rounded-md border border-black/10 bg-white p-4 shadow-sm"
                  key={attempt.questionId}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-black/40">{index + 1}</p>
                    <p
                      className={`rounded-full px-2 py-1 text-xs font-bold ${
                        attempt.result === "correct"
                          ? "bg-mint/10 text-mint"
                          : attempt.result === "partial"
                            ? "bg-plum/10 text-plum"
                            : "bg-coral/10 text-coral"
                      }`}
                    >
                      {getResultLabel(attempt.result)}
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-md border border-plum/10 bg-plum/5 p-3 text-xs">
                    <div>
                      <p className="font-semibold text-black/50">출제 방향</p>
                      <p className="mt-1 font-bold text-plum">
                        {attempt.directionLabel}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-black/50">정답 여부</p>
                      <p className="mt-1 font-bold text-plum">
                        {getResultLabel(attempt.result)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-semibold text-black/50">학습 모드</p>
                      <p className="mt-1 font-bold text-plum">
                        {getModeLabel(attempt.answerMode)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 rounded-md bg-black/5 p-3 text-sm leading-relaxed">
                    <p>
                      <span className="font-semibold text-black/50">한국어</span>{" "}
                      {attempt.korean}
                    </p>
                    <p>
                      <span className="font-semibold text-black/50">영어</span>{" "}
                      {attempt.english}
                    </p>
                    <p>
                      <span className="font-semibold text-black/50">일본어</span>{" "}
                      {attempt.japanese}
                    </p>
                  </div>
                  <div className="mt-3 space-y-2 text-sm leading-relaxed">
                    <div>
                      <p className="text-xs font-semibold text-black/50">사용자 답</p>
                      <p>{attempt.userAnswer || "입력 없이 정답을 확인함"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-black/50">추천 정답</p>
                      <p className="font-semibold">{attempt.recommendedAnswer}</p>
                    </div>
                  </div>
                  {attempt.result !== "revealed" && (
                    <p className="mt-3 text-xs font-semibold text-black/50">
                      문자열 유사도 {Math.round(attempt.similarity * 100)}%
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-base font-bold">틀린 문제 다시 보기</h2>
            <div className="mt-3 space-y-3">
              {wrongAttempts.length === 0 ? (
                <p className="rounded-md border border-mint/20 bg-mint/10 p-4 text-sm font-semibold text-mint">
                  틀린 문장이 없습니다.
                </p>
              ) : (
                wrongAttempts.map((attempt) => (
                  <article
                    className="rounded-md border border-coral/20 bg-coral/10 p-4"
                    key={attempt.questionId}
                  >
                    <p className="text-xs font-semibold text-plum">
                      {attempt.directionLabel}
                    </p>
                    <div className="mt-3 space-y-1 text-sm leading-relaxed">
                      <p>
                        <span className="font-semibold text-black/50">한국어</span>{" "}
                        {attempt.korean}
                      </p>
                      <p>
                        <span className="font-semibold text-black/50">영어</span>{" "}
                        {attempt.english}
                      </p>
                      <p>
                        <span className="font-semibold text-black/50">일본어</span>{" "}
                        {attempt.japanese}
                      </p>
                    </div>
                    <div className="mt-3 space-y-2 text-sm leading-relaxed">
                      <div>
                        <p className="text-xs font-semibold text-black/50">사용자 답</p>
                        <p>{attempt.userAnswer || "입력 없이 정답을 확인함"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-black/50">추천 정답</p>
                        <p className="font-semibold">{attempt.recommendedAnswer}</p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

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
            {questionIndex + 1} / {sessionQuestions.length}
          </p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-mint transition-all"
            style={{ width: `${((questionIndex + 1) / sessionQuestions.length) * 100}%` }}
          />
        </div>
      </header>

      <section className="flex flex-1 flex-col py-6">
        <p className="text-sm font-semibold text-plum">
          {CATEGORY} · {directionLabel}
        </p>
        <h2 className="mt-6 text-2xl font-bold leading-relaxed">{promptText}</h2>

        <form className="mt-8" onSubmit={gradeAnswer}>
          <label className="text-sm font-semibold" htmlFor="answer">
            {languageLabels[direction.target]}로 답해 보세요
          </label>

          {!isLearningModeHydrated && (
            <div className="mt-3 rounded-md border border-black/10 bg-white p-4 text-sm text-black/50 shadow-sm">
              저장된 학습 모드를 불러오는 중입니다.
            </div>
          )}

          {isLearningModeHydrated && answerMode === "typing" && (
            <textarea
              autoFocus
              className="mt-3 min-h-28 w-full resize-none rounded-md border border-black/15 bg-white p-4 text-base leading-relaxed outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20 disabled:bg-black/5"
              disabled={isAnswered}
              id="answer"
              onChange={(event) => setAnswer(event.target.value)}
              placeholder={`${languageLabels[direction.target]} 문장을 입력하세요`}
              value={answer}
            />
          )}

          {isLearningModeHydrated && answerMode === "multipleChoice" && (
            <div className="mt-3 space-y-2">
              {multipleChoiceOptions.map((option) => (
                <button
                  className={`w-full rounded-md border p-3 text-left text-sm font-semibold transition ${
                    selectedChoice === option
                      ? "border-mint bg-mint/10 text-mint"
                      : "border-black/10 bg-white"
                  }`}
                  disabled={isAnswered}
                  key={option}
                  onClick={() => setSelectedChoice(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {isLearningModeHydrated && answerMode === "wordOrder" && (
            <div className="mt-3 space-y-3">
              <div className="min-h-16 rounded-md border border-black/15 bg-white p-3 text-base font-semibold leading-relaxed">
                {selectedChunks.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedChunks.map((selectedChunk) => (
                      <button
                        className="rounded-md bg-mint/10 px-3 py-2 text-sm font-bold text-mint"
                        disabled={isAnswered}
                        key={`${selectedChunk.chunk}-${selectedChunk.index}`}
                        onClick={() => removeSelectedWordChunk(selectedChunk.index)}
                        type="button"
                      >
                        {selectedChunk.chunk}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm font-normal text-black/40">
                    아래 조각을 순서대로 선택하세요
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {wordOrderChunkOptions.map((option, index) => (
                  <button
                    className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold shadow-sm disabled:opacity-30"
                    disabled={
                      isAnswered ||
                      selectedChunks.some(
                        (selectedChunk) => selectedChunk.index === index
                      )
                    }
                    key={`${option.chunk}-${index}`}
                    onClick={() =>
                      selectWordChunk(option.chunk, index, option.isDistractor)
                    }
                    type="button"
                  >
                    {option.chunk}
                  </button>
                ))}
              </div>
              <p className="text-xs text-black/45">
                선택한 조각을 다시 누르면 해당 조각만 제거됩니다.
              </p>
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              className="h-11 rounded-md border border-plum/30 bg-plum/10 text-sm font-bold text-plum disabled:opacity-40"
              disabled={
                !isLearningModeHydrated ||
                hintCount === targetHints.length ||
                isAnswered
              }
              onClick={showHint}
              type="button"
            >
              힌트 {hintCount > 0 ? `${hintCount}/${targetHints.length}` : ""}
            </button>
            <button
              className="h-11 rounded-md border border-coral/30 bg-coral/10 text-sm font-bold text-coral disabled:opacity-40"
              disabled={!isLearningModeHydrated || isAnswered}
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
                {targetHints.slice(0, hintCount).map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ol>
            </div>
          )}

          {!isAnswered && (
            <button
              className="mt-6 h-12 w-full rounded-md bg-mint text-sm font-bold text-white shadow-sm disabled:opacity-40"
              disabled={!isLearningModeHydrated || !canSubmit}
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
            {currentAnswer && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-black/50">나의 답</p>
                <p className="mt-1 text-sm leading-relaxed">{currentAnswer}</p>
              </div>
            )}
            <div className="mt-4">
              <p className="text-xs font-semibold text-black/50">정답</p>
              <p className="mt-1 text-sm font-semibold leading-relaxed">
                {currentAttempt?.recommendedAnswer ?? targetAnswers[0]}
              </p>
            </div>
            <button
              className="mt-5 h-12 w-full rounded-md bg-mint text-sm font-bold text-white shadow-sm"
              onClick={goToNextQuestion}
              type="button"
            >
              {questionIndex === sessionQuestions.length - 1 ? "결과 보기" : "다음 문제"}
            </button>
          </section>
        )}
      </section>
    </main>
  );
}
