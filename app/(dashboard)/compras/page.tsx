import { getCompras, getInsumos } from "@/services/compras";
import { getSucursales } from "@/services/sucursales";
import { getProveedores } from "@/services/proveedores";
import PageHeader from "@/components/PageHeader";
import ComprasPanel from "@/components/compras/ComprasPanel";

export const dynamic = "force-dynamic";

export default async function ComprasPage() {
  const [compras, sucursales, proveedores, catalogo] = await Promise.all([
    getCompras(),
    getSucursales(),
    getProveedores(),
    getInsumos(),
  ]);

  return (
    <main className="min-h-screen">
      <PageHeader titulo="Compras y Proveedores" />
      <div className="mx-auto max-w-6xl p-8">
        <ComprasPanel
          iniciales={compras}
          sucursales={sucursales.map((s) => ({ id: s.id, nombre: s.nombre }))}
          proveedores={proveedores
            .filter((p) => p.activo)
            .map((p) => ({ id: p.id, nombre: p.nombre }))}
          catalogo={catalogo}
        />
      </div>
    </main>
  );
}
