import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { requireSessionUser } from "@/lib/session";
import { normalizarRol } from "@/types/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSessionUser();
  const rol = normalizarRol(user.rol?.nombre);

  return (
    <div className="min-h-screen bg-page text-ink">
      <Sidebar role={rol} />

      <div className="min-w-0 lg:ml-64">
        {children}
      </div>
    </div>
  );
}
