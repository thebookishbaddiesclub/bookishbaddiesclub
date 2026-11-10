import type Stripe from "stripe";
import { getStockDatabase } from "./clients";
export async function handleTicket(session: Stripe.Checkout.Session) {
  const db = getStockDatabase();
  if (session.status === "expired" && session.payment_status !== "paid") {
    const {error} = await db.from("event_bookings").delete().eq("session_id",session.id).eq("state","pending");
    if (error) throw error;
    return;
  }
  if (session.payment_status !== "paid") return;
  const email = session.customer_details?.email;
  if (session.currency !== "eur" || !email) throw Error("Invalid payment");
  const {data: booking,error} = await db.from("event_bookings").update({state:"paid",email}).eq("session_id",session.id).eq("cents",session.amount_total).select("emailed,title,offer,seats").single();
  if (error || !booking) throw Error("Booking missing");
  if (booking.emailed) return;
  const response = await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json","Idempotency-Key":"ticket-"+session.id},body:JSON.stringify({
    from:process.env.EMAIL_FROM,to:[email],subject:"Réservation confirmée · "+booking.title,
    text:`Ta réservation pour ${booking.title} est confirmée.\n${booking.offer} · ${booking.seats} place(s)\nRéférence : ${session.id}\nÀ bientôt au Bookish Baddies Club !`
  })});
  if (!response.ok) throw Error("Confirmation email failed");
  const result = await db.from("event_bookings").update({emailed:true}).eq("session_id",session.id);
  if (result.error) throw result.error;
}
