// Inventory used by the private retreat preview. Room 1 is never selectable.
export const demoRooms = [
  { id: '1', name: 'Chambre 1', floor: 'RDC', beds: [], blocked: true },
  { id: '2', name: 'Chambre 2', floor: 'RDC', beds: ['double', 'single'] },
  { id: '3', name: 'Chambre 3', floor: 'Étage', beds: ['double'] },
  { id: '4', name: 'Chambre 4', floor: 'Étage', beds: ['single', 'single', 'double'] },
  { id: '5', name: 'Chambre 5', floor: 'Étage', beds: ['double', 'single'] },
] as const;
export const physicalSeats = demoRooms.flatMap(room => room.beds.flatMap((bed, index) =>
  Array.from({ length: bed === 'double' ? 2 : 1 }, (_, place) => ({
    id: `${room.id}-${index}-${place}`, roomId: room.id, room: room.name,
    bedId: `${room.id}-${index}`, type: bed as string,
    label: `Lit ${index + 1} · ${bed === 'double' ? `double${room.id === '2' || room.id === '4' ? ' mezzanine' : ''}, place ${place + 1}` : 'individuel'}`,
  }))));
export const demoSeats = [...physicalSeats, {id:'3-private',roomId:'3',room:'Chambre 3',bedId:'3-private',type:'private',label:'Chambre privatisée · une participante'}];
export function seatUnavailable(id:string,unavailable:string[]){
 return id==='3-private'?unavailable.some(s=>s==='3-0-0'||s==='3-0-1'):unavailable.includes(id);
}
export type SleepPreference = 'single' | 'double' | 'any';
export function sameDouble(ids: string[]) {
  const selected = demoSeats.filter(s => ids.includes(s.id));
  return selected.length === 2 && selected.every(s => s.type === 'double' && s.bedId === selected[0].bedId);
}
