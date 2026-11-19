/**
 * Direct UPI payment to the owner (20 Nov 2026), offered alongside Razorpay. These payments don't
 * reach the website: the customer sends a screenshot on WhatsApp and the owner marks the booking
 * paid by hand. public/brand/upi-qr.png encodes UPI_QR_ID; regenerate it if that ID changes.
 */
export const UPI_PAYEE = "Himalayan Arc Adventure";
/** PhonePe UPI ID (also in the QR code). */
export const UPI_PHONEPE_ID = "7817912062@ybl";
/** Google Pay UPI ID. */
export const UPI_GPAY_ID = "kuldeeprawat18081984-1@oksbi";
export const UPI_QR_ID = UPI_PHONEPE_ID;

/** upi://pay link (any UPI app on Android). `scheme` swaps in an app's own scheme for iPhones. */
export function upiLink(id: string, amountInr?: number, note?: string, scheme = "upi://pay") {
  const p = new URLSearchParams({ pa: id, pn: UPI_PAYEE, cu: "INR" });
  if (amountInr && amountInr > 0) p.set("am", amountInr.toFixed(2));
  if (note) p.set("tn", note.slice(0, 50));
  return `${scheme}?${p.toString()}`;
}
