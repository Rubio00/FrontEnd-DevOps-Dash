import PageHeader from "@/components/PageHeader";
import BalancePanel from "@/components/balance/BalancePanel";
import { getVentasBalance } from "@/services/balance";
import { getSucursales } from "@/services/sucursales";

export default async function BalancePage() {
  const [ventas, sucursales] = await Promise.all([getVentasBalance(), getSucursales()]);

  return (
    <div className="min-h-screen bg-page text-ink">
      <PageHeader titulo="Balance de ventas" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <BalancePanel
          ventas={ventas}
          sucursales={sucursales.map((s) => ({ id: s.id, nombre: s.nombre }))}
        />
      </main>
    </div>
  );
}