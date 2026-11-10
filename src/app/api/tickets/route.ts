import { NextResponse } from "next/server";
import { getSiteOrigin, getStockDatabase, getStripe } from "@/lib/server/clients";
import { validTickets, type Guest, type TicketConfig } from "@/lib/tickets";
import {passesFor} from "@/lib/server/event-passes";
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
const short = (s: unknown, max: number) => typeof s === "string" && s.trim().length > 0 && s.length <= max;
export async function POST(request: Request) {
  try {
    const { id, index, phone, guests, configuration, passId, expectedTotal } = await request.json();
    if (!short(id, 36) || !Number.isInteger(index) || index < 0 || !short(phone, 30) || !/^[+\d(). -]{6,30}$/.test(phone)) return fail("Vérifie le numéro de téléphone.");
    const db = getStockDatabase();
    const { data: event } = await db.from("events").select("id,title,starts_at,ticketing").eq("id", id).maybeSingle();
    const pass = passId ? (await passesFor(id)).find(p=>p.id===passId) : undefined;
    if (passId && (!pass || pass.total !== expectedTotal)) return fail("Le pass a changé ou est fermé. Recharge la page.",409);
    const config = (pass?.config || event?.ticketing) as TicketConfig;
    if (!event || !validTickets(event.ticketing) || new Date(event.starts_at).getTime() <= Date.now()) return fail("La billetterie est fermée.", 409);
    const offer = config.offers[index];
    if (!offer || JSON.stringify(config) !== JSON.stringify(configuration)) return fail("Les tarifs ou le questionnaire ont changé. Recharge la page.", 409);
    if (!Array.isArray(guests) || guests.length !== offer.seats || !guests.every(g => g && short(g.first,100) && short(g.last,100) && (!config.diet || typeof g.diet === "string" && g.diet.length <= 300) && Array.isArray(g.answers) && g.answers.length === config.questions.length && g.answers.every((v:unknown) => typeof v === "string" && v.length <= 500))) return fail("Vérifie les coordonnées de chaque participant.");
    const clean = guests.map((g: Guest) => ({ first:g.first.trim(), last:g.last.trim(), diet:config.diet ? g.diet : "", answers:g.answers }));
    const stripe = getStripe(), origin = getSiteOrigin();
    const session = await stripe.checkout.sessions.create({
      mode:"payment", payment_method_types:["card"], metadata:{ticket_flow:"v1"},
      line_items:[{quantity:1,price_data:{currency:"eur",unit_amount:offer.cents,product_data:{name:(pass ? pass.first.title + " + " + pass.second.title + " · Pass 2 événements" : event.title + " · " + offer.name).slice(0,250)}}}],
      expires_at:Math.floor(Date.now()/1000)+35*60, success_url:origin+"/billetterie/merci", cancel_url:origin+"/billetterie/"+id,
    });
    const { error } = pass ? await db.rpc("reserve_event_pass",{
      p_session:session.id,p_pass:pass.id,p_first_config:pass.first.ticketing,p_second_config:pass.second.ticketing,
      p_cents:offer.cents,p_questions:config.questions,p_phone:phone,p_guests:clean
    }) : await db.rpc("reserve_event_ticket", {p_session:session.id,p_event:id,p_config:config,p_offer:index,p_phone:phone,p_guests:clean});
    if (error || !session.url) {
      await stripe.checkout.sessions.expire(session.id);
      return fail(error?.message.includes("SOLD_OUT") ? "Il ne reste plus assez de places pour ce tarif." : "Réservation indisponible. Recharge la page.",409);
    }
    return NextResponse.json({url:session.url});
  } catch { return fail("Impossible de préparer le paiement. Réessaie.",503); }
}
