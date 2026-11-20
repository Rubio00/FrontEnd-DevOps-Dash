import PageHeader from "@/components/PageHeader";
import SucursalesPanel from "@/components/sucursales/SucursalesPanel";
import { getSucursales } from "@/services/sucursales";

export default async function SucursalesPage() {
  const sucursales = await getSucursales();

  return (
    <div className="min-h-screen bg-page text-ink">
      <PageHeader titulo="Sucursales" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <SucursalesPanel inicial={sucursales} />
      </main>
    </div>
  );
}