alter table public.roleplay_sessions
  add column partner_voice text not null default 'emma'
    check (partner_voice in ('emma', 'james', 'sofia')),
  add column speech_speed numeric(2, 1) not null default 1.0
    check (speech_speed >= 0.7 and speech_speed <= 1.3);
