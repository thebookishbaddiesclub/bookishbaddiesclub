export type Offer = { name: string; cents: number; seats: number };
export type TicketConfig = { capacity: number; offers: Offer[]; diet: boolean; questions: string[] };
export type Guest = { first: string; last: string; diet?: string; answers: string[] };
export const blankTickets: TicketConfig = { capacity: 20, offers: [{ name: "Billet individuel", cents: 1000, seats: 1 }], diet: false, questions: [] };
export function validTickets(config: TicketConfig | null): boolean {
  return !!config && Number.isInteger(config.capacity) && config.capacity > 0 && config.capacity <= 10000
    && Array.isArray(config.offers) && config.offers.length > 0 && config.offers.length <= 20
    && config.offers.every(o => o && typeof o.name === "string" && o.name.trim() && o.name.length <= 100 && Number.isSafeInteger(o.cents) && o.cents >= 50 && o.cents <= 1000000 && Number.isInteger(o.seats) && o.seats >= 1 && o.seats <= Math.min(20, config.capacity))
    && typeof config.diet === "boolean" && Array.isArray(config.questions) && config.questions.length <= 10 && config.questions.every(q => typeof q === "string" && q.trim() && q.length <= 150);
}
