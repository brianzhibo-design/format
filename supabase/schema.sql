-- ============================================
-- WallCraft 数据库 Schema
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- 用户等级表
create table if not exists user_tiers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  tier text default 'free' check (tier in ('free', 'premium')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 使用记录表
create table if not exists usage_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date default current_date not null,
  count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

-- 启用 RLS
alter table user_tiers enable row level security;
alter table usage_records enable row level security;

-- RLS 策略：用户只能读取自己的记录
create policy "Users can read own tier"
  on user_tiers for select using (auth.uid() = user_id);

create policy "Users can read own usage"
  on usage_records for select using (auth.uid() = user_id);

-- 自动更新 updated_at 的触发器函数
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_tiers_updated_at
  before update on user_tiers
  for each row execute function update_updated_at();

create trigger usage_records_updated_at
  before update on usage_records
  for each row execute function update_updated_at();

-- 为新注册用户自动创建 free tier 记录
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into user_tiers (user_id, tier)
  values (new.id, 'free');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
