import RetreatParty from "./retreat-party";

import { physicalSeats } from "./demo-rooms";
const demoCapacity = physicalSeats.length;

export default function ReservationPreview() {
  return <RetreatParty capacity={demoCapacity} />;
}
