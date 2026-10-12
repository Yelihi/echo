alter table public.user_profiles
add column example_difficulty smallint not null default 2
check (example_difficulty between 1 and 3);
