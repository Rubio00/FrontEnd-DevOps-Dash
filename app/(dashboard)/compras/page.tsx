import { getCompras } from "@/services/compras";
import PageHeader from "@/components/PageHeader";
import ComprasPanel from "@/components/compras/ComprasPanel";

export default async function ComprasPage() {
  const compras = await getCompras();

  return (
    <main className="min-h-screen">
      <PageHeader titulo="Compras y Proveedores" />
      <div className="mx-auto max-w-6xl p-8">
        <ComprasPanel iniciales={compras} />
      </div>
    </main>
  );
}