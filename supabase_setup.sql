-- ================================================================
-- FLOWSPACE — SUPABASE FULL SETUP SCRIPT
-- Chạy toàn bộ script này trong Supabase > SQL Editor > New query
-- ================================================================


-- ================================================================
-- PHẦN 1: XÓA DỮ LIỆU CŨ (nếu cần chạy lại từ đầu)
-- Bỏ comment block dưới nếu muốn reset sạch
-- ================================================================
/*
drop table if exists tasks    cascade;
drop table if exists projects cascade;
*/


-- ================================================================
-- PHẦN 2: TẠO BẢNG
-- ================================================================

-- 2.1 Bảng projects
create table if not exists projects (
  id         uuid        primary key default gen_random_uuid(),
  user_id    integer     not null,                      -- ID người dùng (lưu trong localStorage)
  name       text        not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table  projects            is 'Danh sách dự án của người dùng';
comment on column projects.user_id   is 'ID người dùng (từ bảng users cục bộ)';
comment on column projects.name      is 'Tên dự án';

-- 2.2 Bảng tasks
create table if not exists tasks (
  id          bigserial   primary key,
  project_id  uuid        not null references projects(id) on delete cascade,
  title       text        not null,
  description text        not null default '',
  status      text        not null default 'todo'
                          check (status in ('todo', 'in-progress', 'done')),
  tag         text        not null default 'Low'
                          check (tag in ('High', 'Medium', 'Low')),
  priority    text        not null default 'Thấp'
                          check (priority in ('Thấp', 'Trung bình', 'Quan trọng')),
  deadline    date,
  tags        text[]      not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table  tasks              is 'Nhiệm vụ trong mỗi dự án';
comment on column tasks.status      is 'todo | in-progress | done';
comment on column tasks.tag         is 'High | Medium | Low (dùng để hiển thị badge màu)';
comment on column tasks.priority    is 'Thấp | Trung bình | Quan trọng';
comment on column tasks.tags        is 'Mảng các tag tùy chỉnh (ví dụ: Design, Code)';


-- ================================================================
-- PHẦN 3: INDEXES (tăng tốc query)
-- ================================================================

create index if not exists idx_projects_user_id   on projects(user_id);
create index if not exists idx_projects_created   on projects(created_at);
create index if not exists idx_tasks_project_id   on tasks(project_id);
create index if not exists idx_tasks_status       on tasks(status);
create index if not exists idx_tasks_deadline     on tasks(deadline);
create index if not exists idx_tasks_created      on tasks(created_at);


-- ================================================================
-- PHẦN 4: AUTO-UPDATE updated_at
-- ================================================================

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

drop trigger if exists trg_tasks_updated_at on tasks;
create trigger trg_tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();


-- ================================================================
-- PHẦN 5: ROW LEVEL SECURITY (RLS)
-- ================================================================

alter table projects enable row level security;
alter table tasks    enable row level security;

-- Xóa policies cũ trước (tránh conflict khi chạy lại)
drop policy if exists "allow_all_projects" on projects;
drop policy if exists "allow_all_tasks"    on tasks;

-- Policy: cho phép tất cả thao tác với anon key
-- (phù hợp cho ứng dụng demo không có Supabase Auth)
create policy "allow_all_projects" on projects
  for all
  using (true)
  with check (true);

create policy "allow_all_tasks" on tasks
  for all
  using (true)
  with check (true);


-- ================================================================
-- PHẦN 6: VIEW TIỆN ÍCH (optional – dùng để xem nhanh)
-- ================================================================

create or replace view v_tasks_with_project as
select
  t.id,
  t.title,
  t.description,
  t.status,
  t.tag,
  t.priority,
  t.deadline,
  t.tags,
  t.created_at,
  t.updated_at,
  p.name  as project_name,
  p.user_id
from tasks t
join projects p on p.id = t.project_id;

comment on view v_tasks_with_project is 'Task kèm tên dự án – dùng để debug/xem nhanh';


-- ================================================================
-- PHẦN 7: STORED PROCEDURES TIỆN ÍCH
-- ================================================================

-- 7.1 Đếm task quá hạn của 1 user
create or replace function count_overdue_tasks(p_user_id integer)
returns integer language sql stable as $$
  select count(*)::integer
  from tasks t
  join projects p on p.id = t.project_id
  where p.user_id = p_user_id
    and t.status  <> 'done'
    and t.deadline < current_date;
$$;

-- 7.2 Thống kê task theo trạng thái trong 1 project
create or replace function project_stats(p_project_id uuid)
returns table(
  status       text,
  count        bigint
) language sql stable as $$
  select status, count(*)
  from tasks
  where project_id = p_project_id
  group by status;
$$;

-- 7.3 Lấy tất cả task quá hạn của 1 user (dùng cho notification)
create or replace function get_overdue_tasks(p_user_id integer)
returns setof v_tasks_with_project language sql stable as $$
  select *
  from v_tasks_with_project
  where user_id  = p_user_id
    and status   <> 'done'
    and deadline < current_date
  order by deadline asc;
$$;


-- ================================================================
-- PHẦN 8: DỮ LIỆU MẪU (demo data)
-- Chạy PHẦN NÀY ĐỘC LẬP sau khi đã tạo bảng xong
-- Thay user_id = 1 nếu bạn dùng ID khác
-- ================================================================

-- Xóa data mẫu cũ (nếu cần reset)
-- delete from projects where user_id = 1;

-- Dự án mẫu
insert into projects (id, user_id, name) values
  ('00000000-0000-0000-0000-000000000001', 1, 'Dự án chính'),
  ('00000000-0000-0000-0000-000000000002', 1, 'Đồ án 1')
on conflict (id) do update set name = excluded.name;

-- Task mẫu
insert into tasks (project_id, title, description, status, tag, priority, deadline, tags) values
  -- Dự án chính
  ('00000000-0000-0000-0000-000000000001',
   'Thiết kế logo', 'Thiết kế logo đỏ gradient cho FlowSpace',
   'todo', 'High', 'Quan trọng', '2026-04-01', array['Design', 'UI']),

  ('00000000-0000-0000-0000-000000000001',
   'Nghiên cứu React Context', 'Tìm hiểu cách dùng Context API trong React 19',
   'in-progress', 'Medium', 'Trung bình', '2026-04-03', array['Code', 'Research']),

  ('00000000-0000-0000-0000-000000000001',
   'Thiết lập CI/CD', 'Cấu hình GitHub Actions + Vercel deploy',
   'todo', 'High', 'Quan trọng', '2026-04-20', array['DevOps']),

  ('00000000-0000-0000-0000-000000000001',
   'Viết unit tests', 'Viết test cho các components chính',
   'done', 'Low', 'Thấp', '2026-04-05', array['Testing']),

  -- Đồ án 1
  ('00000000-0000-0000-0000-000000000002',
   'Phân tích yêu cầu', 'Xác định chức năng và phi chức năng của hệ thống',
   'done', 'High', 'Quan trọng', '2026-03-20', array['Planning']),

  ('00000000-0000-0000-0000-000000000002',
   'Thiết kế database', 'Vẽ ERD và thiết kế schema Supabase',
   'in-progress', 'Medium', 'Trung bình', '2026-04-15', array['Database', 'Design']),

  ('00000000-0000-0000-0000-000000000002',
   'Viết báo cáo chương 1', 'Tổng quan về đề tài và mục tiêu',
   'todo', 'Low', 'Thấp', '2026-04-25', array['Report']);


-- ================================================================
-- PHẦN 10: THỐNG KÊ LỊCH SỬ HÀNG NGÀY
-- ================================================================

create table if not exists daily_stats (
  id               bigserial   primary key,
  user_id          integer     not null,
  date             date        not null,
  total_tasks      integer     not null default 0,
  completed_tasks  integer     not null default 0,
  active_tasks     integer     not null default 0,
  overdue_tasks    integer     not null default 0,
  created_at       timestamptz not null default now(),
  unique(user_id, date)
);

create index if not exists idx_daily_stats_user_date on daily_stats(user_id, date);

comment on table daily_stats is 'Lịch sử thống kê nhiệm vụ theo ngày của người dùng';
