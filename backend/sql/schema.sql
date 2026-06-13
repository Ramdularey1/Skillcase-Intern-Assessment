create extension if not exists "pgcrypto";

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,
  file_path text not null,
  like_count integer not null default 0 check (like_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_videos_category on videos (category);
create index if not exists idx_videos_created_at on videos (created_at desc);

create table if not exists likes (
  user_id uuid not null references app_users(id) on delete cascade,
  video_id uuid not null references videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  video_id uuid not null references videos(id) on delete cascade,
  parent_id uuid references comments(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table comments add column if not exists parent_id uuid references comments(id) on delete cascade;
create index if not exists idx_comments_video_created_at on comments (video_id, created_at desc);
create index if not exists idx_comments_parent_id on comments (parent_id);

create table if not exists bookmarks (
  user_id uuid not null references app_users(id) on delete cascade,
  video_id uuid not null references videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);
