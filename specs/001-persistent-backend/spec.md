# Feature Specification: Persistent Customer Backend

**Feature Branch**: `001-persistent-backend` (spec directory; no git branch was created)

**Created**: 2026-10-16

**Status**: Draft

**Input**: User description: "Production-ready persistent backend for the Himalayan Arc Adventure website (guided Himalayan treks, ski/snowboard courses and activities in Uttarakhand & Himachal, Indian audience, prices in INR). Today accounts, trek bookings and activity bookings fall back to each visitor's browser storage in production because no database is connected; course bookings are only emailed; payments, profiles and the admin activity feed exist in code but are untested and not deployed. The feature: every customer's data must persist server-side and be visible to them on any device — account (email/password and Google sign-in), profile (name, phone, city, emergency contact), trek bookings, course bookings (including ones made while logged out, linked once they sign in with the same verified email), activity bookings, and payments (Razorpay, UPI-first, charged in INR, with paid/failed/pending states and history). Customers can view, pay for, and cancel their own pending bookings. A business admin can see all customers, bookings and payments, change booking status (pending/confirmed/cancelled), and see an activity timeline of sign-ups, logins, bookings and payments. Customers and the business receive email confirmations for bookings and successful payments; a failed email must never lose a booking. Prices are always computed server-side from the published catalogue, never trusted from the browser. Existing browser-only accounts need a migration or clear path. Must work with the current static-export site plus serverless API functions, and degrade gracefully (WhatsApp fallback) when a dependency is down."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - My account and bookings follow me to any device (Priority: P1)

A trekker creates an account (email and password, or Google), books the Kedarkantha trek on their laptop, then opens the site on their phone and sees the same account and the same booking. Today this fails: in production the account and booking exist only inside the laptop's browser, and the business never sees the booking in any system.

**Why this priority**: Without durable storage, every other capability (payments, admin, emails) has nothing reliable to act on. It is also the core trust promise to customers: "your booking is safe with us".

**Independent Test**: Create an account and a trek booking on one device, sign in on a second device (or a private window), and confirm both the profile and the booking appear. Delivers value on its own: bookings stop being lost.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they sign up with email and password and confirm their email, **Then** they can sign in from any device and see the same account.
2. **Given** a visitor with a Google account, **When** they choose "Continue with Google", **Then** an account is created (or reused) for that email and they land signed in.
3. **Given** a signed-in customer, **When** they submit a trek booking request, **Then** the booking is stored server-side with status "pending" and appears in their bookings list on every device.
4. **Given** a signed-in customer, **When** they submit a course booking, **Then** it appears in the same account alongside their trek bookings.
5. **Given** a customer signed in on two devices, **When** they sign out on one, **Then** the other device's session is unaffected, and the data remains intact.

---

### User Story 2 - The business sees and manages every booking (Priority: P2)

The business admin opens an admin area and sees all customers, all trek, course and activity bookings, and all payments, newest first. They can search or filter them, open one, and move a booking between pending, confirmed and cancelled. They also see a timeline of sign-ups, logins, bookings and payments.

**Why this priority**: Stored bookings only become revenue when the business can act on them. Today the business relies on WhatsApp messages and emails, which can be missed.

**Independent Test**: As an admin, find a booking made by a test customer in under 30 seconds, change its status to "confirmed", and confirm the customer sees the new status in their account. A non-admin account must be refused access.

**Acceptance Scenarios**:

1. **Given** an admin account, **When** the admin opens the admin area, **Then** they see all bookings across all customers with customer name, contact details, item, date, group size, amount and payment state.
2. **Given** a pending booking, **When** the admin marks it "confirmed" or "cancelled", **Then** the change is saved, timestamped, attributed to that admin, and visible to the customer.
3. **Given** a customer (non-admin) account, **When** it tries to open the admin area or read another customer's data, **Then** access is refused and no data is revealed.
4. **Given** new sign-ups, logins, bookings and payments, **When** the admin views the activity timeline, **Then** each event appears with who, what and when, newest first, and new events appear without a manual page reload.

---

### User Story 3 - Pay online and see payment history (Priority: P3)

A customer with a pending booking selects "Pay now", chooses to pay a 30% advance or the full amount, pays with a UPI app (PhonePe, Google Pay, Paytm, BHIM) or another method the payment provider offers, and sees a clear success state. Their account shows every payment with its amount, date, method and status (paid, failed, pending).

**Why this priority**: Online payment converts interest into committed revenue and reduces manual follow-up. It depends on stories 1 and 2 to be meaningful.

**Independent Test**: In the payment provider's test mode, pay for a test booking, confirm the booking becomes "confirmed" and a "paid" payment record appears, then repeat with a deliberately failed payment and confirm a "failed" record with no confirmation.

**Acceptance Scenarios**:

1. **Given** a pending booking with a catalogue price, **When** the customer pays successfully, **Then** the payment is recorded as "paid", the booking becomes "confirmed", and the customer sees a success confirmation.
2. **Given** a payment in progress, **When** the customer closes the browser before returning to the site, **Then** the payment is still recorded correctly once the provider reports it.
3. **Given** a failed or abandoned payment, **When** the customer returns, **Then** the booking stays "pending", the attempt shows as failed (or not completed), and they can try again without creating a duplicate charge.
4. **Given** a booking that is already paid, **When** anyone tries to pay for it again, **Then** the system refuses and explains that it is already paid.
5. **Given** any payment, **When** the amount is shown and charged, **Then** it is in INR and equals the price determined by the business's catalogue rules, regardless of anything the browser sends.
6. **Given** a payable booking whose trek or course starts more than 15 days away, **When** the customer reaches checkout, **Then** they can choose "Pay 30% advance" or "Pay in full", and both amounts are shown before they choose.
7. **Given** a customer who paid the 30% advance, **When** they view the booking, **Then** they see the amount paid, the remaining balance and its due date, plus a "Pay balance" action.
8. **Given** a booking whose start date is 15 days away or less, **When** the customer reaches checkout, **Then** only "Pay in full" is offered, with a short explanation.

---

### User Story 4 - Confirmations reach the customer and the business (Priority: P4)

When a booking is received and when a payment succeeds, the customer gets a confirmation email and the business gets a notification email with the booking details. If email sending fails, the booking and payment are still saved and the business can still see them in the admin area.

**Why this priority**: Confirmations build trust and reduce "did my booking go through?" calls, but the system must be correct even without them.

**Independent Test**: Make a booking with email delivery working and confirm both emails arrive; then disable email delivery and confirm the booking is still saved and visible to the customer and admin.

**Acceptance Scenarios**:

1. **Given** a successful booking submission, **When** email delivery works, **Then** the customer receives a confirmation and the business receives the booking details.
2. **Given** a successful payment, **When** email delivery works, **Then** the customer receives a payment receipt and the business is notified.
3. **Given** email delivery is down, **When** a customer books, **Then** the booking is still saved, the customer still sees a success message, and the failed notification is recorded so it can be re-sent.

---

### User Story 5 - Manage my profile and cancel a pending booking (Priority: P5)

A customer updates their name, phone, city and emergency contact, and cancels a booking that is still pending and unpaid.

**Why this priority**: Emergency contact details matter for safety on high-altitude treks, and self-service cancellation reduces support load. Valuable but not blocking revenue.

**Independent Test**: Edit each profile field and confirm the changes persist across devices; cancel a pending booking and confirm the admin sees it as cancelled.

**Acceptance Scenarios**:

1. **Given** a signed-in customer, **When** they edit and save their profile, **Then** the changes persist and are used to prefill future bookings.
2. **Given** a pending, unpaid booking, **When** the customer cancels it, **Then** its status becomes "cancelled" and it can no longer be paid.
3. **Given** a confirmed or paid booking, **When** the customer looks for a cancel option, **Then** none is offered; instead they are directed to the cancellation policy and a way to contact the business.

---

### User Story 6 - A booking made before signing in joins my account (Priority: P6)

A visitor books a ski course without an account. Later they sign up or sign in with the same email address, verify it, and the course booking appears in their account, where they can pay for it.

**Why this priority**: Course bookings are allowed while signed out, so without this they would be orphaned from the customer's account.

**Independent Test**: Book a course while signed out using a test email, then sign up with that email, verify it, and confirm the booking appears in the account and can be paid.

**Acceptance Scenarios**:

1. **Given** a signed-out course booking made with email X, **When** a customer signs in with a verified email X, **Then** the booking is attached to their account.
2. **Given** an account whose email is not yet verified, **When** it signs in, **Then** no signed-out bookings are attached to it.
3. **Given** a signed-out booking made with email X, **When** someone signs in with a different email, **Then** that booking is never visible to them.

---

### User Story 7 - Customers from the old browser-only mode are not stranded (Priority: P7)

Customers who signed up or booked while the site was in browser-only mode get a clear path forward when the persistent backend goes live.

**Why this priority**: Affects a limited, existing group of users once, at launch.

**Independent Test**: In a browser holding an old browser-only account and booking, visit the site after launch. Confirm the one-time notice appears, that the old data (including the stored password) is gone afterwards, and that the notice does not appear again.

**Acceptance Scenarios**:

1. **Given** a browser holding old browser-only data, **When** the customer visits after launch, **Then** a one-time notice explains the upgrade, asks them to sign up again, and offers WhatsApp for questions about earlier bookings.
2. **Given** that notice has been shown, **When** the customer checks the same browser, **Then** none of the old browser-only data, including any stored password, remains.
3. **Given** a browser with no old browser-only data, **When** anyone visits, **Then** no notice is shown.

---

### Edge Cases

- **Price changes after booking**: a trek's price changes between booking and payment. The customer pays the price recorded when the booking was made (FR-016).
- **Unpriced online bookings**: group sizes or packages the catalogue can't price online (for example groups above 10 for treks) are saved as requests and the customer is offered a quote via WhatsApp instead of online payment.
- **Duplicate payments**: a customer opens two tabs and pays twice. Only one payment may confirm the booking; any second successful charge is flagged to the admin for refund.
- **Payment report races**: the provider reports success after the customer has already seen "pending", or reports the same payment twice. The final state is correct and no duplicate confirmations or emails are sent.
- **Tampering**: amount or price data sent from the browser is altered. The charge still matches the catalogue price; a mismatch is rejected and logged.
- **Cancelled booking payments**: a customer tries to pay for a booking the admin has cancelled. Payment is refused with an explanation.
- **Same email, two sign-in methods**: someone signs up with email and password, and later uses "Continue with Google" with the same email. Both lead to one account and never to two separate accounts.
- **Changed email**: a customer's email changes after signed-out bookings were made with the old address. Those bookings are not auto-attached; the admin can attach them manually.
- **Dependencies down**: the payment provider, email service or data store is unavailable. The customer gets a clear message and a WhatsApp fallback. No booking that was accepted is lost, and no false success is shown.
- **Missing contact**: a customer books without an emergency contact. Booking is allowed; the profile prompts them to add one before the trek date.
- **Displayed currency**: a visitor views prices in a converted display currency. Payment and records are always in INR, and the customer is told this before paying.
- **Early balance**: a customer pays the advance, then wants to pay the balance early. They can do so at any time; the booking becomes "fully paid".
- **Booking near the trek date**: a customer books within 15 days of the start date. Only full payment is offered (FR-020a).
- **Unpaid balance**: the balance due date passes without payment. The booking stays confirmed but is flagged overdue for the admin to decide (FR-020e). It is never cancelled automatically.
- **Duplicate advance**: a customer pays the advance twice, for example from two tabs. Only one advance counts; the extra charge is flagged to the admin for refund.
- **Cancellation after advance**: the admin cancels a booking that has an advance paid. The advance is handled per the published non-refundable policy, and the admin records any refund made.

## Requirements *(mandatory)*

### Functional Requirements

**Accounts & profile**

- **FR-001**: The system MUST store customer accounts server-side so a customer can sign in from any device and see the same data.
- **FR-002**: Customers MUST be able to sign up and sign in with email and password, with email verification required before sensitive actions (attaching signed-out bookings, paying).
- **FR-003**: Customers MUST be able to sign up and sign in with Google; an email already registered by another method MUST resolve to the same customer account.
- **FR-004**: Customers MUST be able to reset a forgotten password via their verified email.
- **FR-005**: Customers MUST be able to view and edit their profile: full name, phone, city, emergency contact name and emergency contact phone.
- **FR-006**: The system MUST never store or transmit passwords in readable form.

**Bookings**

- **FR-010**: Customers MUST be able to submit trek booking requests (trek, preferred date, group size, message) that are stored server-side with status "pending".
- **FR-011**: Visitors MUST be able to submit course booking requests (course, package, stay option, preferred date, group size, contact details, message) whether or not they are signed in; every such request MUST be stored server-side.
- **FR-012**: Course bookings made while signed out MUST be attached to an account only when that account signs in with the same, verified email address.
- **FR-013**: Activity bookings MUST be storable as requests; they are priced by the business on confirmation and are not payable online in this release.
- **FR-014**: Customers MUST be able to see all their trek, course and activity bookings with status, date, group size and amount.
- **FR-015**: Customers MUST be able to cancel their own booking only while it is pending and unpaid.
- **FR-016**: The amount payable for a booking MUST be calculated by the business's catalogue rules at the time the booking is created, and MUST be recorded on the booking: price per person × group size, using the chosen room-sharing tier for treks that offer one, and the chosen package and stay option for courses. Browser-supplied prices MUST be ignored.
- **FR-017**: Bookings the catalogue cannot price online (unsupported group sizes or packages) MUST be saved as quote requests and MUST NOT be payable online.

**Payments**

- **FR-020**: At checkout the customer MUST be able to choose between paying a 30% advance (30% of the recorded booking amount, rounded to the nearest rupee) or paying the full amount, for both trek and course bookings.
- **FR-020a**: The advance option MUST NOT be offered when the start date is 15 days away or less; only full payment is offered then.
- **FR-020b**: A booking MUST become "confirmed" (place held) once either the advance or the full amount is paid. Its payment state MUST be tracked separately as one of: unpaid, advance paid, fully paid, refunded.
- **FR-020c**: After an advance, the remaining balance MUST be due 15 days before the start date; the customer MUST be able to pay it from their account at any time before then.
- **FR-020d**: Customers with an outstanding balance MUST receive a reminder 7 days before the due date and on the due date.
- **FR-020e**: Bookings whose balance is past due MUST be flagged to the admin as overdue; what happens next (extend, cancel) is the admin's decision.
- **FR-020f**: Before the customer pays an advance, checkout MUST show that the advance is non-refundable, as the published cancellation policy already states.
- **FR-021**: Payment MUST be offered UPI-first (PhonePe, Google Pay, Paytm, BHIM and other UPI apps), with other methods the business's payment provider supports also available.
- **FR-022**: All charges and payment records MUST be in INR.
- **FR-023**: Each payment attempt MUST be recorded with amount, currency, method, time and status (pending, paid, failed).
- **FR-024**: A payment MUST be confirmed only after the payment provider's report is verified as authentic; unverified or mismatched-amount reports MUST be rejected and logged.
- **FR-025**: A successful payment MUST mark the related booking "confirmed" exactly once, even if the success is reported more than once or by more than one route.
- **FR-026**: A booking that is already paid or cancelled MUST NOT accept a new payment.
- **FR-027**: Customers MUST be able to see their full payment history.
- **FR-028**: Refunds are processed by the business outside this system according to the published cancellation policy; the admin MUST be able to record that a booking was refunded.

**Notifications**

- **FR-030**: On every stored booking, the system MUST send a confirmation to the customer and the booking details to the business.
- **FR-031**: On every successful payment, the system MUST send a receipt to the customer and a notification to the business.
- **FR-032**: A booking or payment MUST be saved before any notification is attempted; a failed notification MUST NOT undo or block it, and MUST be recorded so it can be retried.

**Administration**

- **FR-040**: Only designated admin accounts MUST be able to access the admin area; admin status MUST NOT be something a customer can grant themselves.
- **FR-041**: Admins MUST be able to list, search (by customer name, email, phone or booking reference) and filter (by type, status, date range, payment state) all bookings and payments.
- **FR-042**: Admins MUST be able to change a booking's status between pending, confirmed and cancelled; each change MUST record who made it and when.
- **FR-043**: Admins MUST be able to view all customers and their profiles, bookings and payments.
- **FR-044**: The admin activity timeline MUST show sign-ups, logins, booking creations, payment starts, payment successes, payment failures, profile updates and admin status changes, newest first, updating without a manual reload.
- **FR-045**: Customers MUST only ever be able to read their own account, bookings and payments.
- **FR-046**: Security-relevant events (sign-ups, payments, admin status changes) MUST be recorded by the server, so customers cannot forge or erase them.

**Migration from browser-only mode**

- **FR-050**: When a browser holding old browser-only account or booking data first visits after launch, the site MUST show a one-time notice. It MUST explain that accounts have been upgraded, ask the customer to sign up again, and offer a WhatsApp link to ask about any earlier booking.
- **FR-051**: Old browser-only data (accounts, readable passwords, bookings) MUST NOT be imported, and MUST be cleared from the browser when that notice is shown, whether or not the customer acts on it.

**Resilience**

- **FR-060**: When the payment provider is unavailable, customers MUST see a clear message and a WhatsApp fallback, and their booking MUST remain saved and payable later.
- **FR-061**: When the data store is unavailable, booking forms MUST NOT show a false success; they MUST offer a WhatsApp fallback pre-filled with the booking details.
- **FR-062**: The solution MUST work within the site's current hosting model (pre-rendered pages plus on-demand server functions) without requiring an always-on server.

**Privacy**

- **FR-070**: Customers MUST be able to request deletion of their account; personal data MUST be removed or anonymised, except payment records the business must keep for legal and tax purposes.

### Key Entities

- **Customer Account**: a person who can sign in. Email (unique, verified or not), sign-in methods (password and/or Google), role (customer or admin), created date.
- **Profile**: belongs to one account. Full name, phone, city, emergency contact name and phone, last updated.
- **Trek Booking**: belongs to one account. Trek, preferred date, group size, room-sharing tier (where offered), message, recorded amount (or "quote required"), booking status (pending/confirmed/cancelled), payment state (unpaid/advance paid/fully paid/refunded), amount paid so far, balance due date, created and updated times, status-change history.
- **Course Booking**: optionally belongs to an account (none if made while signed out). Course, package, stay option, preferred date, group size, contact name/email/phone, message, recorded amount, booking status, payment state, amount paid so far, balance due date, timestamps.
- **Activity Booking**: belongs to one account. Activity, type, preferred date, group size, message, status. Priced by the business, not payable online.
- **Payment**: belongs to one account and exactly one trek or course booking. Kind (advance, balance or full), amount (INR), method, status (pending/paid/failed), provider reference, attempt and completion times.
- **Activity Event**: one entry in the admin timeline. Actor (customer or admin), event type, related booking or payment, time, non-sensitive context (for example browser type).
- **Catalogue Price**: the business's published price per person for each trek (and each room-sharing tier, where offered), and for each course package and stay option. The single source for every amount charged.
- **Notification Record**: an attempted email. Recipient, type (booking confirmation, payment receipt, balance reminder, business alert), status (sent/failed), attempts, related booking or payment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of bookings accepted by the site are visible to the customer on a second device and to the admin within 1 minute of submission.
- **SC-002**: 0 bookings or payments are lost when email delivery is deliberately disabled during testing.
- **SC-003**: 90% of customers complete payment, from selecting "Pay now" to seeing confirmation, in under 2 minutes.
- **SC-004**: In 100% of test payments where the customer closes the browser mid-payment, the payment and booking status are correct within 5 minutes.
- **SC-005**: 0 cases in testing where the amount charged differs from the catalogue-derived booking amount, including deliberate tampering attempts.
- **SC-006**: An admin can locate any booking by customer name, email, phone or reference and change its status in under 30 seconds.
- **SC-007**: 95% of booking and payment confirmation emails arrive within 5 minutes.
- **SC-008**: When the payment provider, email service or data store is unavailable, 100% of affected customer actions show a clear message with a WhatsApp fallback instead of an error page or a false success.
- **SC-009**: Access testing shows 0 cases of one customer viewing another customer's account, bookings or payments, and 0 cases of a non-admin opening the admin area.
- **SC-010**: Within 1 month of launch, booking-status enquiries to the business over WhatsApp and phone fall by at least 30%.
- **SC-011**: For 100% of advance-paid test bookings, the customer and the admin see the same amount paid, remaining balance and due date, and the balance can be paid in one step.
- **SC-012**: 95% of balance reminders are delivered on their scheduled day (7 days before, and on, the due date).
- **SC-013**: After launch, 0 browsers retain old browser-only passwords once the upgrade notice has been shown.

## Assumptions

- The audience is primarily Indian; all prices are published and charged in INR. Converted foreign-currency prices on the site are display-only estimates.
- The business's existing payment provider (Razorpay) is used. UPI is the primary method. Accepting international cards depends on the business enabling it with the provider and is out of scope here.
- There is a single admin role with full permissions. Granular staff roles are out of scope for this release.
- Refunds are executed in the payment provider's own dashboard per the published cancellation policy; this system only records that a refund happened.
- Activity bookings remain request-only (no online payment) because activity prices vary by session and group.
- Prices are fixed at booking time. Later catalogue changes don't affect existing bookings.
- Payment terms (chosen by the business): customers choose a 30% advance or full payment. The 15-day cut-off and the balance due 15 days before the start date are defaults the business can change. The site's trek pages, Terms & Conditions and cancellation policy must be updated to state these same terms, since today they contradict each other.
- Migration (chosen by the business): old browser-only data is cleared rather than imported. Customers re-register, and earlier requests are handled over WhatsApp.
- Trek bookings require an account; course bookings do not.
- Business notification emails go to the business's existing booking inbox; customer emails are sent from a business-owned address.
- Scholarship and group-waiver claims continue to be handled manually by the business after the trek; automating them is out of scope.
- Data retention follows standard Indian legal requirements for financial records; other personal data is kept while the account is active.
- The site keeps its current hosting model of pre-rendered pages with on-demand server functions.
- The business's WhatsApp number remains the fallback contact channel.
