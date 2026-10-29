export const eventCategories = [
  { value: "bookevents", label: "Bookevents" },
  { value: "twitch", label: "Twitch Events" },
] as const;
export function eventCategory(value: unknown) {
  return value === "twitch" ? "twitch" : "bookevents";
}
