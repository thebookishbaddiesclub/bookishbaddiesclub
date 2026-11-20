# Automatic installments — private Stripe test integration

## Deployment and activation

This implementation deliberately accepts only a separate Stripe test secret. It does not change the existing merchant/ticket Stripe client, webhook or keys. The preview stays admin-only. Production sales, legal terms, refunds/cancellation policy, live email delivery and live keys still need a separate launch step.

1. Apply `202611190001_retreat_booking_v2.sql` if not already applied, then `202611190002_retreat_automatic_payments.sql`.
2. In the project's Vercel Production environment (the private preview runs on the production domain), add:
   - `RETREAT_STRIPE_TEST_SECRET_KEY`: a secret beginning with `sk_test_` from the Stripe test account/sandbox. Never replace `STRIPE_SECRET_KEY`.
   - `RETREAT_STRIPE_TEST_WEBHOOK_SECRET`: the signing secret for the test destination below.
   - Optional `RETREAT_TEST_EMAIL_RECIPIENT`: an email owned by the operator. Test emails go only to this address. Otherwise no emails are sent by the retreat integration.
3. Create a Stripe **test-mode** webhook destination at `https://www.thebookishbaddiesclub.fr/api/retreat/webhook`. Subscribe to:
   - checkout.session.completed
   - checkout.session.expired
   - checkout.session.async_payment_succeeded
   - invoice.paid
   - invoice.payment_failed
   - invoice.payment_action_required
   - invoice.finalization_failed
   - invoice.finalized
   - invoice.voided
   - invoice.marked_uncollectible
   - invoice.deleted
4. Redeploy after setting environment values. Both key and signing secret must be configured for the existing payment step to show Stripe testing.
5. Keep the existing production merchant webhook unchanged.

## Flow

The existing room wizard posts its selection and explicit payment agreement to the private checkout API. Server-generated installments are checked against the displayed plan, and the consent text/version/date are stored. Inventory is held atomically before a Checkout Session is created.

The first payment uses Stripe Checkout, card-only. For three installments, `setup_future_usage=off_session` attaches the card to the booking's dedicated Customer. A signed webhook retrieves the successful PaymentIntent and validates amount, currency, customer and session before confirming the place. The one-hour invitation timer begins at the first charge timestamp, not at checkout creation or webhook delivery.

The other two payments are one-off invoices, first created as drafts with auto advancement disabled, then populated and checked, then scheduled with `automatically_finalizes_at`. No subscription is created; there is no fourth payment. Scheduling is handled by Stripe, not a Vercel cron.

The final date is February 1, 2027 at 10:00 Paris. The middle date is the midpoint in Paris calendar days. Three installments are available until January 30. Amounts are integers in cents and always sum to the full tariff.

Pending Stripe payments temporarily protect their Early entitlement. If all four remaining Early slots are in checkout, another standard booking waits rather than being quoted Classic before the first four confirmations. Invitation-only holds don't consume Early. A confirmed payment cannot be undone by an older expiration notification.

A friend entering Stripe near the group's deadline keeps that individual checkout hold until Stripe confirms completion or expiration; other unpaid invitations still expire at the group deadline. This checkout grace period (up to 35 minutes) must be disclosed/approved before public launch if the requested one-hour deadline is to remain strict.

## Failures and recovery

- No credit-card details are stored by the website.
- Checkout/customer/invoice/item/schedule creation use stable idempotency keys.
- Invoice creation also recovers by Customer + booking metadata if a response/database save was lost, including after the Stripe idempotency retention period.
- A failed or action-required future invoice is paused (`auto_advance=false`) instead of repeatedly charging after the agreed deadline. Its hosted payment link is shown in admin and optionally mailed to the configured test recipient. The reservation is retained for manual resolution.
- Draft finalization failures and overdue unscheduled installments are flagged for review, not silently charged on a changed date.
- No live emails are sent to participant addresses in this test integration.
- Refunds and cancellation of Stripe-managed reservations are not automated. The simulation admin cancel/move actions reject Stripe-managed reservations so they cannot free seats while scheduled debits remain active.
- Admin “Vérifier et synchroniser avec Stripe” recovers a missed webhook or session ID write. A payment with no created session can be released after its expiry. The test does not add a global background reconciliation job; configure operational reconciliation before public launch.

## Verification

Local:
`npm run typecheck`
`node --import tsx --test tests/retreat-installments.test.ts`
`node --test tests/retreat-automatic-payments.test.mjs tests/retreat-booking-v2.test.mjs tests/retreat-preview-groups.test.mjs`
`npm run build`

The tests cover exact amounts/dates, live-key refusal, draft-first scheduling, duplicate scheduling recovery, overdue scheduling, reservation atomicity, amount validation, idempotency, Early contention, pending hold expiry and existing room rules. Stripe network calls are mocked in scheduler unit tests. PGlite tests the SQL but not PostgreSQL multi-connection contention.

Still perform end-to-end tests in the configured Stripe sandbox: one-time and 3x successful Checkout, SCA, refusal/abandonment, webhook retry, future invoice success/failure, invoice deletion, and no impact on merchant checkout. No real Stripe test transaction has been performed by the agent yet.

References:
- https://docs.stripe.com/invoicing/scheduled-finalization
- https://docs.stripe.com/api/invoices/create
- https://docs.stripe.com/payments/checkout/save-during-payment
