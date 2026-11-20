import { getEmpleados } from "@/services/empleados";
import PageHeader from "@/components/PageHeader";
import PlanillaPanel from "@/components/planilla/PlanillaPanel";

export default async function PlanillaPage() {
  const empleados = await getEmpleados();

  return (
    <main className="min-h-screen">
      <PageHeader titulo="Planilla" />
      <div className="mx-auto max-w-6xl p-8">
        <PlanillaPanel iniciales={empleados} />
      </div>
    </main>
  );
}