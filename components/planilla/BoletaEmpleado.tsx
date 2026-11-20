import type { Empleado } from "@/types/empleado";
import { usd } from "@/lib/format";
import { calcularBoleta } from "@/lib/planilla";

type Props = {
  empleado: Empleado;
  onCambiarEstado: () => void;
};

function Linea({ etiqueta, valor, negativo }: { etiqueta: string; valor: number; negativo?: boolean }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-stone-600">{etiqueta}</span>
      <span className={negativo ? "text-red-700" : ""}>
        {negativo ? "− " : ""}
        {usd(valor)}
      </span>
    </div>
  );
}

export default function BoletaEmpleado({ empleado, onCambiarEstado }: Props) {
  const b = calcularBoleta(empleado.salario);
  const activo = empleado.estado === "Activo";

  return (
    <aside className="sticky top-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{empleado.id}</p>
      <h3 className="text-xl font-semibold text-primary">{empleado.nombre}</h3>
      <p className="text-sm text-stone-500">
        {empleado.cargo} · {empleado.sucursal}
      </p>
      <p className="mt-1 text-xs text-stone-400">
        DUI {empleado.dui} · Ingreso {empleado.fechaIngreso}
      </p>

      <div className="mt-5 rounded-lg bg-page p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Balance quincenal</p>
        <div className="mt-2 divide-y divide-stone-200">
          <Linea etiqueta="Salario quincenal" valor={b.salario} />
          <Linea etiqueta="ISSS (3%)" valor={b.isss} negativo />
          <Linea etiqueta="AFP (7.25%)" valor={b.afp} negativo />
          <Linea etiqueta="Renta" valor={b.renta} negativo />
        </div>
        <div className="mt-3 flex items-end justify-between border-t-2 border-accent pt-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">Neto a pagar</span>
          <span className="text-2xl font-bold text-primary">{usd(b.neto)}</span>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Aporte del restaurante</p>
        <div className="mt-1 divide-y divide-stone-100">
          <Linea etiqueta="ISSS patronal (7.5%)" valor={b.isssPatronal} />
          <Linea etiqueta="AFP patronal (8.75%)" valor={b.afpPatronal} />
          <div className="flex justify-between py-1.5 text-sm font-semibold">
            <span>Costo total para la empresa</span>
            <span>{usd(b.costoEmpresa)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onCambiarEstado}
        className={`mt-6 w-full rounded-full border px-5 py-2 text-sm font-medium transition ${
          activo
            ? "border-red-300 text-red-700 hover:bg-red-50"
            : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        }`}
      >
        {activo ? "Desactivar empleado" : "Reactivar empleado"}
      </button>
    </aside>
  );
}