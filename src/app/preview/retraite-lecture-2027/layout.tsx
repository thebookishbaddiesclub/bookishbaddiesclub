import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validSession } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Le Week-end des Baddies — Mountain Edition · Aperçu privé",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function RetreatLayout({ children }: { children: React.ReactNode }) {
  if (!await validSession((await cookies()).get("admin_session")?.value)) redirect("/login");
  return <>{children}</>;
}
