/**
 * Direct UPI payment to the owner (20 Nov 2026), offered alongside Razorpay. These payments don't
 * reach the website: the customer sends a screenshot on WhatsApp and the owner marks the booking
 * paid by hand. public/brand/upi-qr.png encodes UPI_ID; regenerate it if the ID changes.
 */
export const UPI_PAYEE = "Himalayan Arc Adventure";
/** The owner's Google Pay UPI ID; any UPI app (PhonePe, Paytm, BHIM) can pay it. */
export const UPI_ID = "kuldeeprawat18081984-1@oksbi";

/** upi://pay link (any UPI app on Android). `scheme` swaps in an app's own scheme for iPhones. */
export function upiLink(amountInr?: number, note?: string, scheme = "upi://pay") {
  const p = new URLSearchParams({ pa: UPI_ID, pn: UPI_PAYEE, cu: "INR" });
  if (amountInr && amountInr > 0) p.set("am", amountInr.toFixed(2));
  if (note) p.set("tn", note.slice(0, 50));
  return `${scheme}?${p.toString()}`;
}
