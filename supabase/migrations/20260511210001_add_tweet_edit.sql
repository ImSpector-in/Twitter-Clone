ALTER TABLE "public"."tweets" ADD COLUMN "edited_at" timestamp with time zone;

create policy "Users can edit own tweets"
on "public"."tweets"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));
