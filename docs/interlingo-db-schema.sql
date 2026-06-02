-- InterLingo MVP database schema draft
-- Target: Supabase PostgreSQL

create table public.languages (
  code text primary key,
  name text not null,
  native_name text not null,
  is_active boolean not null default true
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ko text not null,
  name_en text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  native_language_code text references public.languages(code),
  created_at timestamptz not null default now()
);

create table public.learning_routes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  steps jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.learning_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  unit_type text not null check (unit_type in ('word', 'sentence', 'paragraph')),
  source_language_code text not null references public.languages(code),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.learning_item_translations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.learning_items(id) on delete cascade,
  language_code text not null references public.languages(code),
  content text not null,
  normalized_content text,
  hint_keywords text[] not null default '{}',
  hint_structure text,
  first_letter_hint text,
  unique (item_id, language_code)
);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id),
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  route_id uuid references public.learning_routes(id),
  mode text not null check (mode in ('new', 'review')),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table public.study_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.learning_items(id),
  prompt_language_code text not null references public.languages(code),
  answer_language_code text not null references public.languages(code),
  user_answer text,
  correct_answer text not null,
  result text not null check (result in ('correct', 'partial', 'wrong', 'revealed')),
  similarity_score numeric,
  ai_feedback text,
  natural_expression text,
  hints_used int not null default 0,
  xp_awarded int not null default 0,
  answered_at timestamptz not null default now()
);

create table public.review_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.learning_items(id) on delete cascade,
  due_at timestamptz not null,
  interval_days int not null default 0,
  ease_factor numeric not null default 2.5,
  repetition_count int not null default 0,
  lapse_count int not null default 0,
  priority_score numeric not null default 0,
  last_result text check (last_result in ('correct', 'partial', 'wrong', 'revealed')),
  updated_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create table public.user_item_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.learning_items(id) on delete cascade,
  total_attempts int not null default 0,
  correct_attempts int not null default 0,
  wrong_attempts int not null default 0,
  revealed_count int not null default 0,
  avg_similarity numeric,
  mastery_score numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create table public.user_category_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  total_attempts int not null default 0,
  accuracy numeric not null default 0,
  weak_score numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, category_id)
);

create table public.user_gamification (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp int not null default 0,
  level int not null default 1,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_studied_on date,
  updated_at timestamptz not null default now()
);

create table public.ai_evaluations (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.study_attempts(id) on delete set null,
  provider text not null,
  model text not null,
  input jsonb not null,
  output jsonb not null,
  latency_ms int,
  created_at timestamptz not null default now()
);

create index idx_learning_items_category_difficulty
  on public.learning_items(category_id, difficulty, is_active);

create index idx_review_schedules_user_due
  on public.review_schedules(user_id, due_at, priority_score desc);

create index idx_attempts_user_answered
  on public.study_attempts(user_id, answered_at desc);

