import Link from "next/link";

const categories = ["일상생활", "여행", "음식", "비즈니스", "취미"];

const weakAreas = [
  { name: "비즈니스", score: 58 },
  { name: "일상생활", score: 81 },
  { name: "여행", score: 92 }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-paper px-5 py-6 text-ink">
      <header className="flex items-center justify-between border-b border-black/10 pb-4">
        <div>
          <p className="text-sm font-semibold text-mint">InterLingo</p>
          <h1 className="mt-1 text-2xl font-bold">오늘의 회상 학습</h1>
        </div>
        <div className="rounded-full border border-coral/30 bg-coral/10 px-3 py-1 text-sm font-semibold text-coral">
          5일
        </div>
      </header>

      <section className="border-b border-black/10 py-6">
        <p className="text-sm font-semibold text-plum">오늘의 복습</p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold">12</p>
            <p className="mt-1 text-sm text-black/60">개 남음</p>
          </div>
          <Link
            className="flex h-11 items-center rounded-md bg-mint px-5 text-sm font-bold text-white shadow-sm"
            href="/learn"
          >
            복습 시작
          </Link>
        </div>
      </section>

      <section className="border-b border-black/10 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">새 학습</h2>
          <span className="text-sm text-black/50">10문제</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <button
              className="h-12 rounded-md border border-black/10 bg-white text-sm font-semibold shadow-sm"
              key={category}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="py-6">
        <h2 className="text-base font-bold">나의 약점</h2>
        <div className="mt-4 space-y-3">
          {weakAreas.map((area) => (
            <div key={area.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{area.name}</span>
                <span className="font-semibold">{area.score}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-plum"
                  style={{ width: `${area.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
