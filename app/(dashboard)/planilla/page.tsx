import { getEmpleados } from "@/services/empleados";
import { getSucursales } from "@/services/sucursales";
import PageHeader from "@/components/PageHeader";
import PlanillaPanel from "@/components/planilla/PlanillaPanel";

export const dynamic = "force-dynamic";

export default async function PlanillaPage() {
  const [empleados, sucursales] = await Promise.all([getEmpleados(), getSucursales()]);

  return (
    <main className="min-h-screen">
      <PageHeader titulo="Planilla" />
      <div className="mx-auto max-w-6xl p-8">
        <PlanillaPanel
          iniciales={empleados}
          sucursales={sucursales.map((s) => ({ id: s.id, nombre: s.nombre }))}
        />
      </div>
    </main>
  );
}
