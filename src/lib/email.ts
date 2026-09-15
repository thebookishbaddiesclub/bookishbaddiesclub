type OrderEmail = { customerEmail?: string | null; customerName?: string | null; sessionId: string; items: string; total?: number | null; promoCode?: string | null };

export async function sendOrderEmails(order: OrderEmail) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Bookish Baddies Club <onboarding@resend.dev>";
  const admin = process.env.ADMIN_NOTIFICATION_EMAIL || "thebookishbaddiesclub@gmail.com";
  if (!key) return;
  const subject = `Commande confirmée — ${order.sessionId}`;
  const details = `<p>Merci ${order.customerName || "pour ta commande"} !</p><p>${order.items}</p><p>Total : ${((order.total || 0) / 100).toFixed(2)} €</p>${order.promoCode ? `<p>Code promo : ${order.promoCode}</p>` : ""}`;
  const messages = [
    order.customerEmail ? { from, to: [order.customerEmail], subject, html: details } : null,
    { from, to: [admin], subject: `Nouvelle commande — ${order.sessionId}`, html: `<p>Nouvelle commande reçue.</p>${details}` },
  ].filter(Boolean);
  await Promise.all(messages.map(message => fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(message) })));
}
