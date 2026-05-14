-- Direct Messaging System
-- Security mitigations built in:
--   - direct_key UNIQUE prevents race-condition duplicate conversations
--   - SECURITY DEFINER helper avoids RLS infinite recursion on conversation_participants
--   - soft-delete on messages avoids Realtime DELETE event RLS leak
--   - INSERT on conversation_participants restricted to service role only

-- ─── Tables ──────────────────────────────────────────────────────────────────

create table public.conversations (
  id               uuid        primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  last_message_at  timestamptz not null default now(),
  is_group         boolean     not null default false,
  direct_key       text        unique          -- sorted user-id pair; prevents duplicate 1:1 convos
);

create table public.conversation_participants (
  conversation_id    uuid        not null references public.conversations(id) on delete cascade,
  user_id            uuid        not null references public.profiles(id)      on delete cascade,
  joined_at          timestamptz not null default now(),
  last_read_at       timestamptz,
  primary key (conversation_id, user_id)
);

create table public.messages (
  id               uuid        primary key default gen_random_uuid(),
  conversation_id  uuid        not null references public.conversations(id)  on delete cascade,
  sender_id        uuid        not null references public.profiles(id)       on delete cascade,
  content          text        not null check (char_length(content) between 1 and 1000),
  created_at       timestamptz not null default now(),
  deleted_at       timestamptz          -- soft delete; hard delete leaks via Realtime DELETE events
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

create index on public.messages               (conversation_id, created_at desc);
create index on public.conversation_participants (user_id);
create index on public.conversations          (last_message_at desc);

-- ─── Trigger: keep last_message_at current ───────────────────────────────────

create or replace function public.update_conversation_last_message()
returns trigger language plpgsql security definer as $$
begin
  update public.conversations
  set last_message_at = now()
  where id = NEW.conversation_id;
  return NEW;
end;
$$;

create trigger on_message_insert
  after insert on public.messages
  for each row execute procedure public.update_conversation_last_message();

-- ─── RLS ─────────────────────────────────────────────────────────────────────

alter table public.conversations             enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages                  enable row level security;

-- SECURITY DEFINER helper: prevents infinite recursion if policies on
-- conversation_participants try to query conversation_participants themselves.
create or replace function public.is_conversation_member(conv_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = conv_id
      and user_id = auth.uid()
  );
$$;

-- conversations: members can read their own conversations
create policy "members read conversation"
  on public.conversations for select
  using (public.is_conversation_member(id));

-- conversation_participants: members can read who is in their conversations
create policy "members read participants"
  on public.conversation_participants for select
  using (public.is_conversation_member(conversation_id));

-- conversation_participants INSERT is restricted to service role (admin client in startConversation).
-- No authenticated-user INSERT policy = regular users cannot add themselves to any conversation.

-- messages: members can read non-deleted messages
create policy "members read messages"
  on public.messages for select
  using (public.is_conversation_member(conversation_id) and deleted_at is null);

-- messages: members can send messages as themselves
create policy "members send messages"
  on public.messages for insert
  with check (sender_id = auth.uid() and public.is_conversation_member(conversation_id));

-- messages: only sender can soft-delete their own message (sets deleted_at)
create policy "sender soft-deletes own message"
  on public.messages for update
  using  (sender_id = auth.uid())
  with check (sender_id = auth.uid());

-- ─── Realtime ────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.messages;
