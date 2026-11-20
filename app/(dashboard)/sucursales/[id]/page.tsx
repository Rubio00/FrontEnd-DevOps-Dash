import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import SucursalDetalle from "@/components/sucursales/SucursalDetalle";
import { getSucursalPorId } from "@/services/sucursales";

export const dynamic = "force-dynamic";

export default async function SucursalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sucursal = await getSucursalPorId(id);
  if (!sucursal) notFound();

  return (
    <div className="min-h-screen bg-page text-ink">
      <PageHeader titulo="Sucursales" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <SucursalDetalle inicial={sucursal} />
      </main>
    </div>
  );
}