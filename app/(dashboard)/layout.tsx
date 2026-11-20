import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getSessionUser } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-page text-ink">
      <Sidebar role={user.rol?.nombre ?? ""} />

      <div className="min-w-0 lg:ml-64">
        {children}
      </div>
    </div>
  );
}