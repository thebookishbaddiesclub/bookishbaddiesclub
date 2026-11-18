# Group reservations — private preview

Apply `supabase/migrations/202611180001_retreat_preview_groups.sql` in the existing project's SQL editor. The migration only creates isolated `retreat_preview_*` tables and an RPC; it does not alter event or merchandise orders. Repeatable via IF NOT EXISTS / CREATE OR REPLACE.

All group routes and RPC calls from the site require the existing signed admin session. The invitation token travels in the URL fragment, not in query strings. No emails or real Stripe operations run in this preview. Use fictitious details: simulated confirmations now persist those details in the private test tables.

The first simulated confirmation creates the group, marks the organiser's participant seat paid, and holds companions' seats for exactly one hour of server time. Each companion fills only her own details and individually chooses one/three installments. The original deadline never changes. All inventory and payment operations acquire a common transaction lock; successful request IDs are idempotent. An expired hold is unavailable through its old link and becomes available in inventory. Expired holds are materialized as released during the next server operation; release does not depend on an open browser. Paid places are never released by this expiry.

Validate with two admin-connected browser sessions. Open the group link, observe the common deadline, claim a different place, then reload both. A refused/abandoned simulation must not claim a place. The database test covers expiry, repeated confirmations, overlap, private data suppression and paid-seat preservation.

## Required before real bookings

- Replace simulated confirmations with signature-verified Stripe first-payment events; never accept browser payment claims.
- Atomically reserve inventory during initial checkout and resolve abandoned/failed/late payment cases before enabling real money.
- Production tables and price/room configuration must be separate from this demo.
- Send the first participant's invitation through an idempotent email outbox after payment confirmation, with retries on failure.
- Replace admin-only invitation access with scoped token access that exposes only the group’s slots and consented display identities; never emails, diet, full surnames or other private details.
- Implement per-participant installment schedules, failed-charge recovery, refunds and cancellation policies; last installment no later than 2027-02-01.
- Confirm terms, accommodation, capacity, Early Bird quotas and official opening date.
