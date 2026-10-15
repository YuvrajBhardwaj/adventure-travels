// Money and date rules for bookings and payments (specs/001-persistent-backend, research R4/R5).
// All amounts are integer paise (INR). Pure functions: no I/O, so they're unit-tested.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ADVANCE_RATE = 0.3;
const ADVANCE_CUTOFF_DAYS = 15; // advance only when the start is MORE than this many days away
const BALANCE_DUE_DAYS_BEFORE = 15;
const MAX_TREK_GROUP = 10; // larger groups get a custom quote
const MAX_COURSE_GROUP = 20;

const isWholeNumber = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;

/** Price for a trek booking, or null when the catalog can't price it (→ quote). */
function trekAmount(trek, groupSize, roomSharing) {
  if (!trek || !isWholeNumber(groupSize, 1, MAX_TREK_GROUP)) return null;
  let unit = trek.price;
  if (roomSharing) {
    // A room label only makes sense for treks priced by room, and must be one of its tiers.
    if (!trek.roomSharing || !Object.prototype.hasOwnProperty.call(trek.roomSharing, roomSharing)) return null;
    unit = trek.roomSharing[roomSharing];
  }
  // No room chosen on a tiered trek → the base tier, which the catalog guarantees equals `price`.
  return Number.isInteger(unit) && unit > 0 ? unit * groupSize * 100 : null;
}

/** Price for a course booking, or null when it can't be priced. */
function courseAmount(course, tierId, stay, groupSize) {
  if (!course || !isWholeNumber(groupSize, 1, MAX_COURSE_GROUP)) return null;
  let unit = course.price;
  if (course.tiers && course.tiers.length > 0) {
    const tier = course.tiers.find((t) => t.id === tierId) || course.tiers[0];
    unit = stay === "full" ? tier.priceFull : tier.priceBase;
  }
  return Number.isInteger(unit) && unit > 0 ? unit * groupSize * 100 : null;
}

/** 30% of the booking amount, rounded UP to a whole rupee. */
function advanceAmount(amount) {
  return Math.ceil((amount * ADVANCE_RATE) / 100) * 100;
}

function balanceAmount(amount, amountPaid) {
  return Math.max(0, amount - amountPaid);
}

/** Today's date in India (Asia/Kolkata) as YYYY-MM-DD. */
function istDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function toUtcMs(iso) {
  return Date.parse(`${iso}T00:00:00Z`);
}

/** Whole days from `fromIso` to `toIso` (negative when `toIso` is earlier). */
function daysBetween(fromIso, toIso) {
  return Math.round((toUtcMs(toIso) - toUtcMs(fromIso)) / 86400000);
}

function addDays(iso, days) {
  return new Date(toUtcMs(iso) + days * 86400000).toISOString().slice(0, 10);
}

function isValidIsoDate(iso) {
  return typeof iso === "string" && ISO_DATE.test(iso) && addDays(iso, 0) === iso;
}

/** True when the start date is after today in India. */
function isFutureStart(startIso, now = new Date()) {
  return isValidIsoDate(startIso) && daysBetween(istDate(now), startIso) > 0;
}

/** Advance allowed only before any payment, and only when the start is > 15 days away (FR-020a). */
function isAdvanceAllowed(startIso, amountPaid, now = new Date()) {
  return amountPaid === 0 && isValidIsoDate(startIso) && daysBetween(istDate(now), startIso) > ADVANCE_CUTOFF_DAYS;
}

/** Balance after an advance is due 15 days before the start (FR-020c). */
function balanceDueDate(startIso) {
  return addDays(startIso, -BALANCE_DUE_DAYS_BEFORE);
}

const PAYMENT_KINDS = ["advance", "balance", "full"];

/**
 * How much a new Razorpay order of `kind` should be for a stored booking, from the
 * booking's own locked `amount` (never the catalog). Returns { amount } or
 * { status, error } with the HTTP status the API should answer (contracts/http-api.md).
 * booking: { status, paymentState, quoteRequired, amount, amountPaid, startDate }
 */
function orderAmount(booking, kind, now = new Date()) {
  if (booking.status === "cancelled") return { status: 409, error: "This booking was cancelled." };
  if (booking.paymentState === "fully_paid") return { status: 409, error: "This booking is already paid in full." };
  if (booking.paymentState === "refunded") return { status: 409, error: "This booking was refunded." };
  if (booking.quoteRequired || !Number.isInteger(booking.amount) || booking.amount <= 0) {
    return { status: 422, error: "This booking needs a custom quote. Please contact us on WhatsApp." };
  }
  if (!PAYMENT_KINDS.includes(kind)) return { status: 400, error: "Choose how much to pay." };

  const paid = booking.amountPaid || 0;
  if (kind === "advance") {
    if (paid > 0) return { status: 400, error: "An advance is already paid. Pay the balance instead." };
    if (!isAdvanceAllowed(booking.startDate, paid, now)) {
      return { status: 400, error: "Your trip starts within 15 days, so full payment is needed." };
    }
    return { amount: advanceAmount(booking.amount) };
  }
  if (kind === "balance") {
    if (booking.paymentState !== "advance_paid") return { status: 400, error: "There's no balance to pay on this booking yet." };
    return { amount: balanceAmount(booking.amount, paid) };
  }
  if (booking.paymentState !== "unpaid") return { status: 400, error: "An advance is already paid. Pay the balance instead." };
  return { amount: balanceAmount(booking.amount, paid) };
}

module.exports = {
  ADVANCE_CUTOFF_DAYS,
  MAX_TREK_GROUP,
  MAX_COURSE_GROUP,
  trekAmount,
  courseAmount,
  advanceAmount,
  balanceAmount,
  istDate,
  daysBetween,
  addDays,
  isValidIsoDate,
  isFutureStart,
  isAdvanceAllowed,
  balanceDueDate,
  PAYMENT_KINDS,
  orderAmount,
};
