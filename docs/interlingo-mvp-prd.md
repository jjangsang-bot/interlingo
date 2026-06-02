# InterLingo MVP PRD

## 1. Product Goal

InterLingo is a recall-first multilingual learning app that combines interleaving practice with spaced repetition.

The MVP validates whether learners will repeatedly return to practice real words, sentences, and short paragraphs across Korean, English, and Japanese.

## 2. Target User

- Korean-speaking learners studying English and Japanese
- Learners who are tired of simple flashcards
- Learners preparing for travel, business, OPIC, JLPT, or TOEIC expression recall

## 3. MVP Scope

Included:

- Korean, English, Japanese
- Beginner, intermediate, advanced difficulty
- Category selection
- Text answer input
- Browser speech input when supported
- Three-step hints
- Reveal answer
- Spaced repetition scheduling
- AI semantic answer evaluation
- XP, level, streak, category accuracy

Excluded from MVP:

- Native Android/iOS apps
- Payment
- Full admin dashboard
- Pronunciation scoring
- Weekly ranking
- Advanced achievements

## 4. Core Learning Flow

1. User selects learning language route.
2. User selects category.
3. User selects difficulty.
4. App generates a 10-question session.
5. User answers by text or speech input.
6. App evaluates answer locally first, then uses AI for semantic judgment if needed.
7. App shows result, correction, and natural expression.
8. App updates review schedule.

## 5. Learning Routes

Initial routes:

- Korean -> English -> Japanese
- Korean -> Japanese -> English
- English -> Korean -> Japanese

Routes should be data-driven so more routes can be added later without changing the session engine.

## 6. Difficulty Model

| Difficulty | Unit Type | Example |
|---|---|---|
| Beginner | Word | 사과 -> apple -> りんご |
| Intermediate | Sentence | 나는 공원 산책을 좋아한다. -> I like taking walks in the park. |
| Advanced | Paragraph | 2-4 sentence paragraph translation/recall |

## 7. Categories

Initial categories:

- Daily life
- Travel
- Food
- Business
- Hobbies

Future categories:

- Movie
- OPIC
- JLPT
- TOEIC
- Business Japanese

## 8. Answer Evaluation

Evaluation order:

1. Normalize both expected answer and user answer.
2. Check exact normalized match.
3. Check simple similarity.
4. If ambiguous, call AI semantic evaluator.
5. Store result and feedback.

Result types:

- correct
- partial
- wrong
- revealed

## 9. Hint Rules

Hints:

- Hint 1: key words
- Hint 2: sentence structure
- Hint 3: first letters

Scoring:

- Base correct answer: +10 XP
- Hint 1: -2 XP
- Hint 2: -3 XP
- Hint 3: -4 XP
- Partial answer: +4 XP
- Revealed answer: +0 XP

## 10. Review Scheduling

Correct answers:

- 1st success: after 1 day
- 2nd success: after 3 days
- 3rd success: after 7 days
- 4th success: after 14 days
- 5th+ success: after 30 days

Wrong answers:

- Due again today
- Also prioritized tomorrow if repeatedly wrong

Reveal answer:

- Treated as wrong
- Priority score increases
- Review interval resets

## 11. MVP Success Metrics

| Metric | Target |
|---|---:|
| First session completion rate | 70%+ |
| Next-day return rate | 35%+ |
| 7-day retention | 15-25% |
| Review completion rate | 50%+ |
| AI judgment satisfaction | 80%+ |

## 12. First Beta Content Target

| Category | Beginner | Intermediate | Advanced |
|---|---:|---:|---:|
| Daily life | 30 | 30 | 10 |
| Travel | 30 | 30 | 10 |
| Food | 30 | 30 | 10 |
| Business | 30 | 30 | 10 |
| Hobbies | 30 | 30 | 10 |

Total: 350 learning items.

