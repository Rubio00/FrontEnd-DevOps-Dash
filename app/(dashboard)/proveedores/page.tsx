import { getProveedores } from "@/services/proveedores";
import { getCompras } from "@/services/compras";
import { totalCompra } from "@/lib/compras";
import PageHeader from "@/components/PageHeader";
import ProveedoresPanel from "@/components/proveedores/ProveedoresPanel";

export default async function ProveedoresPage() {
  const [proveedores, compras] = await Promise.all([getProveedores(), getCompras()]);

  // Saldo por pagar de cada proveedor: suma de sus facturas en estado "Por pagar".
  const saldos: Record<string, number> = {};
  for (const c of compras) {
    if (c.estado === "Por pagar") {
      saldos[c.proveedor] = (saldos[c.proveedor] ?? 0) + totalCompra(c);
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