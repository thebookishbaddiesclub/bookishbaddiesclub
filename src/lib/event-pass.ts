import { type TicketConfig, validTickets } from "./tickets";
export type PassEvent = {id:string;title:string;starts_at:string;ticketing:TicketConfig};
export type PassRow = {id:string;first_id:string;second_id:string;cents:number};
export function singlePrice(config:TicketConfig) {
  return validTickets(config) ? Math.min(...config.offers.filter(o=>o.seats===1).map(o=>o.cents)) : Infinity;
}
export function passDetails(row:PassRow, first:PassEvent, second:PassEvent) {
  const prices = [singlePrice(first.ticketing),singlePrice(second.ticketing)];
  const total = prices[0]+prices[1];
  if (!Number.isFinite(total) || row.cents>=total || [first,second].some(e=>Date.parse(e.starts_at)<=Date.now())) return null;
  const config:TicketConfig = {
    capacity:1,offers:[{name:"Pass 2 événements",seats:1,cents:row.cents}],
    diet:first.ticketing.diet || second.ticketing.diet,
    questions:[...new Set([...first.ticketing.questions,...second.ticketing.questions])]
  };
  return {id:row.id,first,second,total,prices,config};
}
export type PassDetails = NonNullable<ReturnType<typeof passDetails>>;
export const euros = (cents:number) => (cents/100).toLocaleString("fr-FR",{style:"currency",currency:"EUR"});
