import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <DashboardHeader
        email={user.email ?? ""}
        name={user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User"}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
      <footer className="border-t py-6">
        <p className="text-center text-xs text-muted-foreground">
          ShipTrack · Track 1 — dashboard shell only, shipment APIs arrive in
          Track 2
        </p>
      </footer>
    </div>
  );
}
