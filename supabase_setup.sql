-- ================================================================
-- FLOWSPACE — SUPABASE FULL SETUP SCRIPT (PHASE 2)
-- ================================================================

-- 1. CLEANUP
drop table if exists daily_stats cascade;
drop table if exists tasks       cascade;
drop table if exists projects    cascade;
drop table if exists users       cascade;

-- 2. USERS TABLE
create table users (
  id          uuid        primary key default gen_random_uuid(),
  email       text        unique not null,
  password    text        not null,
  name        text        not null,
  department  text        default '',
  bio         text        default '',
  avatar_url  text        default '',
  created_at  timestamptz not null default now()
);

-- 3. PROJECTS TABLE
create table projects (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references users(id) on delete cascade,
  name        text        not null,
  is_muted    boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 4. TASKS TABLE
create table tasks (
  id          bigserial   primary key,
  project_id  uuid        not null references projects(id) on delete cascade,
  title       text        not null,
  description text        not null default '',
  status      text        not null default 'todo' check (status in ('todo', 'in-progress', 'done')),
  tag         text        not null default 'Low'  check (tag in ('High', 'Medium', 'Low')),
  priority    text        not null default 'Thấp' check (priority in ('Thấp', 'Trung bình', 'Quan trọng')),
  deadline    date,
  tags        text[]      not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 5. DAILY STATS TABLE
create table daily_stats (
  id               bigserial   primary key,
  user_id          uuid        not null references users(id) on delete cascade,
  date             date        not null,
  total_tasks      integer     not null default 0,
  completed_tasks  integer     not null default 0,
  active_tasks     integer     not null default 0,
  overdue_tasks    integer     not null default 0,
  created_at       timestamptz not null default now(),
  unique(user_id, date)
);

-- 6. INDEXES
create index idx_users_email        on users(email);
create index idx_projects_user_id   on projects(user_id);
create index idx_tasks_project_id   on tasks(project_id);
create index idx_daily_stats_date    on daily_stats(date);

-- 7. AUTO-UPDATE triggers
create or replace function update_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_projects_updated_at before update on projects for each row execute function update_updated_at();
create trigger trg_tasks_updated_at    before update on tasks    for each row execute function update_updated_at();

-- 8. ROW LEVEL SECURITY (RLS)
alter table users       enable row level security;
alter table projects    enable row level security;
alter table tasks       enable row level security;
alter table daily_stats enable row level security;

create policy "public_access" on users       for all using (true) with check (true);
create policy "public_access" on projects    for all using (true) with check (true);
create policy "public_access" on tasks       for all using (true) with check (true);
create policy "public_access" on daily_stats for all using (true) with check (true);
