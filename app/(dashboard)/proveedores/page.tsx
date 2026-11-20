import { getProveedores } from "@/services/proveedores";
import { getCompras } from "@/services/compras";
import PageHeader from "@/components/PageHeader";
import ProveedoresPanel from "@/components/proveedores/ProveedoresPanel";

export const dynamic = "force-dynamic";

export default async function ProveedoresPage() {
  const [proveedores, compras] = await Promise.all([getProveedores(), getCompras()]);

  // Saldo por pagar de cada proveedor: suma de sus facturas en estado "Por pagar".
  const saldos: Record<number, number> = {};
  for (const compra of compras) {
    if (compra.estado === "Por pagar") {
      saldos[compra.proveedorId] = (saldos[compra.proveedorId] ?? 0) + compra.total;
    }
  }

  return (
    <main className="min-h-screen">
      <PageHeader titulo="Proveedores" />
      <div className="mx-auto max-w-6xl p-8">
        <ProveedoresPanel iniciales={proveedores} saldos={saldos} />
      </div>
    </main>
  );
}
