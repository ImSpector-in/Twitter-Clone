# Exporting RLS Policies into Source Control

This is the procedure to pull the current Supabase schema (including all RLS policies) into committed migration files. Goal: make the "RLS is enabled" claim in `SECURITY.md` §6 verifiable from source.

## Prerequisites

- Supabase CLI installed locally (`npm install -g supabase` or `scoop install supabase`)
- Logged in to the Supabase account that owns project `ujohfqnxtmoraufztjob`
- The database password for that project (Settings → Database in the Supabase dashboard)

## Steps

```powershell
# 1. From the repo root
cd C:\Users\Alex\twitter-clone

# 2. Authenticate (opens a browser)
supabase login

# 3. Link this repo to the remote project
supabase link --project-ref ujohfqnxtmoraufztjob
# You will be prompted for the database password

# 4. Pull the live schema and RLS policies into a migration file
supabase db pull --schema public

# This creates supabase/migrations/<timestamp>_remote_schema.sql
# containing every table, column, index, function, trigger, and POLICY
# currently live in production.
```

## What to do with the output

1. **Review the generated SQL.** Open `supabase/migrations/<timestamp>_remote_schema.sql` and skim for:
   - Every table you expect (`profiles`, `tweets`, `follows`, `likes`, `bookmarks`, `retweets`, `blocks`, `mutes`, `muted_words`, `notifications`, etc.) appears.
   - Every table has at least one `CREATE POLICY` line.
   - Policies use `auth.uid()` to scope rows to the current user — not `true` or unrestricted predicates.
   - Any policy named `... using (true)` is a red flag — investigate.

2. **Rename the file** to something descriptive, e.g. `0001_baseline_schema_and_rls.sql`.

3. **Commit it:**
   ```powershell
   git add supabase/migrations/0001_baseline_schema_and_rls.sql
   git commit -m "chore(security): commit baseline schema and RLS policies"
   git push
   ```

4. **Update SECURITY.md §6** — replace
   > RLS is enabled on all tables (confirmed during development; policies applied via Supabase dashboard). **Caveat:** policies are not committed to source — see §7.

   with
   > RLS is enabled on all tables. Policies are committed at [`supabase/migrations/0001_baseline_schema_and_rls.sql`](./supabase/migrations/0001_baseline_schema_and_rls.sql) and can be reviewed from source.

   Then remove the matching "RLS policies not in version control" subsection in §7.

## Ongoing hygiene

After this baseline lands, every future change to schema or policies should go through migrations rather than the dashboard:

```powershell
# Make schema changes locally, then:
supabase db diff -f short_description_of_change
# Review the generated SQL, commit it, push it, deploy with:
supabase db push
```

This keeps the dashboard and the repo from drifting apart again.

## If something goes wrong

- `supabase link` fails with auth errors → re-run `supabase login`, make sure you're in the correct Supabase org.
- `supabase db pull` complains about an unsupported extension → add it under `[db]` in `supabase/config.toml` and retry.
- The pulled file is enormous and includes auth/storage internals → re-run with `--schema public` to limit scope.
