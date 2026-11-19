# Retreat inventory v2 — private preview

Deployment does not open public reservations or charge Stripe. Every confirmation here is a simulation, labeled in the checkout and admin. Live payments must call an equivalent transactional confirmation only after verified Stripe success; do not expose this simulator publicly.

Apply `supabase/migrations/202611190001_retreat_booking_v2.sql` in Supabase. It is standalone: previous preview group migrations are not required. The new room numbering gets separate tables; historical demo reservations are retained, not reassigned or deleted. Only tariff-specific editorial fields are updated in the text editor, other saved copy stays intact.

## Rules

Room 1 is the organizer's and is absent from selectable seats. Rooms 2/3/4/5 contain 3/2/4/3 physical places. Room 3's private option is one participant occupying both slots, €315, never Early. A paid, held or admin-blocked slot prevents privatization. All inventory mutations, including admin actions and expiration, use the same PostgreSQL transaction advisory lock; direct API-role writes are revoked.

First four confirmed non-private participants receive €199; subsequent confirmations €215. Invitations held for one hour do not consume Early. Cancelled Early confirmations are retained in the first-four count, rather than recycling promotional slots. A stale price rejects confirmation with no writes and asks the participant to refresh the price; no silent price increase. Retry keys preserve confirmed bookings and do not restart the group timer.

Availability is polled every five seconds, with a final authoritative transactional check. Expired holds are logically unavailable only until their deadline; the next server request releases them. Paid bookings persist. Three installments are rejected server-side after January 30, 2027.

## Administration

`/admin/retraite/reservations`: guest details, couchages, tariffs, statuses, simulated 1x/3x, Early remaining, occupancy. Can block/release unoccupied seats, cancel simulated reservations, move shared-room participants while retaining their tariff. Cancellation releases pending invitations in the same group but preserves other paid participants. No actual refund or mail is performed. Private reservations cannot be moved to shared beds by this action.

## Validation

`node --test tests/retreat-booking-v2.test.mjs tests/retreat-preview-groups.test.mjs`

PGlite exercises database behavior, stale quotes at the fourth Early, private-room exclusion in both directions, retry/expiry, capacity 12 vs 11, admin occupancy and role permissions. PGlite serializes sessions; a production multi-connection load test is still needed before real checkout.
