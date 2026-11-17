import RetreatParty from "./retreat-party";

import { demoSeats } from "./demo-rooms";
const demoCapacity = demoSeats.length;

export default function ReservationPreview() {
  return <RetreatParty capacity={demoCapacity} />;
}
