export function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/\b(i)'d\b/g, "$1 would")
    .replace(/\b(you|we|they)'d\b/g, "$1 would")
    .replace(/\b(he|she|it|that|there|what|who|where|when|why|how)'s\b/g, "$1 is")
    .replace(/\b(i)'m\b/g, "$1 am")
    .replace(/\b(you|we|they)'re\b/g, "$1 are")
    .replace(/\b(i|you|we|they|he|she|it)'ll\b/g, "$1 will")
    .replace(/\b(i|you|we|they|he|she|it)'ve\b/g, "$1 have")
    .replace(/\bcan't\b/g, "cannot")
    .replace(/\bwon't\b/g, "will not")
    .replace(/\b(is|are|was|were|do|does|did|can|could|should|would|will|have|has|had)n't\b/g, "$1 not")
    .replace(/[.,!?;:'"()[\]{}]/g, "")
    .replace(/\s+/g, " ");
}

export function isExactNormalizedMatch(userAnswer: string, correctAnswer: string) {
  return normalizeForComparison(userAnswer) === normalizeForComparison(correctAnswer);
}

export type AnswerEvaluation = {
  result: "correct" | "partial" | "wrong";
  similarity: number;
  matchedAnswer: string;
};

const CORRECT_THRESHOLD = 0.85;
const PARTIAL_THRESHOLD = 0.65;

export function evaluateAnswer(
  userAnswer: string,
  correctAnswers: string[]
): AnswerEvaluation {
  const evaluations = correctAnswers.map((correctAnswer) => ({
    matchedAnswer: correctAnswer,
    similarity: calculateSimilarity(userAnswer, correctAnswer)
  }));

  const bestMatch = evaluations.reduce((best, current) =>
    current.similarity > best.similarity ? current : best
  );

  if (bestMatch.similarity >= CORRECT_THRESHOLD) {
    return { ...bestMatch, result: "correct" };
  }

  if (bestMatch.similarity >= PARTIAL_THRESHOLD) {
    return { ...bestMatch, result: "partial" };
  }

  return { ...bestMatch, result: "wrong" };
}

export function calculateSimilarity(value: string, candidate: string) {
  const normalizedValue = normalizeForComparison(value);
  const normalizedCandidate = normalizeForComparison(candidate);

  if (normalizedValue === normalizedCandidate) {
    return 1;
  }

  const longestLength = Math.max(normalizedValue.length, normalizedCandidate.length);

  if (longestLength === 0) {
    return 1;
  }

  return 1 - levenshteinDistance(normalizedValue, normalizedCandidate) / longestLength;
}

function normalizeForComparison(value: string) {
  return normalizeAnswer(value).replace(/\s/g, "");
}

function levenshteinDistance(left: string, right: string) {
  const previousRow = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const currentRow = [leftIndex];

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;

      currentRow[rightIndex] = Math.min(
        currentRow[rightIndex - 1] + 1,
        previousRow[rightIndex] + 1,
        previousRow[rightIndex - 1] + substitutionCost
      );
    }

    previousRow.splice(0, previousRow.length, ...currentRow);
  }

  return previousRow[right.length];
}
