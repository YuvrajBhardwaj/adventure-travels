# Contract: Email Notifications

Delivered through the `notifications` outbox ([data-model.md](../data-model.md#notification-notifications-new--the-outbox-research-r7)).

- **Order of operations**: the business record is always committed first. The email is attempted after, retried by `/api/cron` (maximum 3 attempts), and never blocks or undoes a booking or payment (FR-032).
- **Content**: amounts are always shown in INR, never in the converted display currency.

| kind | Trigger | Recipient | Must include | dedupe_key | Requirement |
|---|---|---|---|---|---|
| `booking_received` | `api/bookings` success | customer | booking reference, item, date, group size, room or package, amount or "quote to follow", advance/full options with due-date rule, WhatsApp contact | `booking_received:<booking_id>` | FR-030 |
| `booking_alert` | `api/bookings` success | business inbox (`BOOKING_TO_EMAIL`) | all booking fields + customer contact + message | `booking_alert:<booking_id>` | FR-030 |
| `payment_receipt` | `apply_payment` success | customer | amount paid, kind (advance/balance/full), method, total, remaining balance and due date (if any), non-refundable advance note | `payment_receipt:<razorpay_payment_id>` | FR-031 |
| `payment_alert` | `apply_payment` success | business inbox | booking ref, customer, amount, kind, new payment state | `payment_alert:<razorpay_payment_id>` | FR-031 |
| `balance_reminder_7d` | cron, due date = today + 7 (IST) | customer | balance amount, due date, "Pay balance" link to `/checkout?…&kind=balance` | `balance_reminder_7d:<booking_id>` | FR-020d |
| `balance_reminder_due` | cron, due date = today (IST) | customer | same as above, framed as due today | `balance_reminder_due:<booking_id>` | FR-020d |

Auth emails (sign-up confirmation, password reset) are sent by **Supabase Auth through its custom SMTP setting** (research R8). They are not part of this outbox.

## Rules
- A duplicate trigger, such as the webhook and verify-payment both firing, hits the unique `dedupe_key`, and the second insert is ignored.
- The From address is the business mailbox (`SMTP_USER`). Reply-To is the business inbox for customer mails, and the customer for business alerts.
- Messages are plain text and short. Every customer email includes the WhatsApp number as a fallback contact.
