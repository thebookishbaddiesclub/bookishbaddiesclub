export function installments(unitCents: number, people: number, split: boolean) {
  if (![19900, 21500, 31500].includes(unitCents) || !Number.isInteger(people) || people < 1 || people > 12) throw Error('Invalid demo price');
  if (!split) return [unitCents * people];
  const first = Math.floor(unitCents / 3);
  return [first * people, first * people, (unitCents - 2 * first) * people];
}
export function monthAfter(date: Date, months: number) {
  const result = new Date(date);
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const last = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(date.getDate(), last));
  return result;
}
export const euros = (cents: number) => new Intl.NumberFormat('fr-FR', {style:'currency',currency:'EUR'}).format(cents / 100);
