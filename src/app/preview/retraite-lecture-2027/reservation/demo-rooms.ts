// Provisional demonstration only: no real participants or inventory.
export const demoRooms = [
  { id: '1', name: 'Chambre 1', beds: ['double', 'single'] },
  { id: '2', name: 'Chambre 2', beds: ['double'] },
  { id: '3', name: 'Chambre 3', beds: ['double', 'single'] },
  { id: '4', name: 'Chambre 4', beds: ['double', 'single', 'single'] },
  { id: '5', name: 'Chambre organisatrice', beds: [], blocked: true },
] as const;
export const demoSeats = demoRooms.flatMap(room => room.beds.flatMap((bed, index) =>
  Array.from({ length: bed === 'double' ? 2 : 1 }, (_, place) => ({
    id: `${room.id}-${index}-${place}`, roomId: room.id, room: room.name,
    bedId: `${room.id}-${index}`, type: bed, label: `Lit ${index + 1} · ${bed === 'double' ? `double, place ${place + 1}` : 'individuel'}`,
  }))));
export type SleepPreference = 'single' | 'double' | 'any';
export function sameDouble(ids: string[]) {
  const selected = demoSeats.filter(s => ids.includes(s.id));
  return selected.length === 2 && selected.every(s => s.type === 'double' && s.bedId === selected[0].bedId);
}
