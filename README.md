# EoN Day poll

Run `npm install` then `npm run dev`, and open `/l/J6Avq`.

Open `/l/J6Avq/edit/eon-admin` to preview organizer tagging controls. In production, replace this development-only secret route with a generated, hashed secret validated by the Supabase backend.

The app currently persists locally and synchronizes other open tabs through `BroadcastChannel`. `supabase/schema.sql` supplies the production data model; wire its authenticated RPC endpoints into `src/storage.ts` after supplying Supabase credentials and RLS policies.
