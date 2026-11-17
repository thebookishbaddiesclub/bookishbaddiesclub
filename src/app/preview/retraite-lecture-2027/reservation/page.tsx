import RetreatParty from "./retreat-party";

// Temporary demonstration capacity; no real inventory or reservations are used.
const demoCapacity = 10;

export default function ReservationPreview() {
  return <RetreatParty capacity={demoCapacity} />;
}
