import type { Empleado, EstadoEmpleado } from "@/types/empleado";

type Props = {
  empleado: Empleado;
  onCerrar: () => void;
  onCambiar: (nuevo: EstadoEmpleado) => void;
};

export default function EstadoEmpleadoModal({ empleado, onCerrar, onCambiar }: Props) {
  const activo = empleado.estado === "Activo";
  const iniciales = empleado.nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const ingreso = new Date(`${empleado.fechaIngreso}T00:00:00`).toLocaleDateString("es-SV", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-primary">Estado de {empleado.nombre}</h2>
            <p className="mt-1 text-sm text-stone-500">
              Activa o desactiva al empleado sin eliminar su historial.
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="rounded-lg border border-stone-200 px-2.5 py-1 text-stone-400 transition hover:text-stone-700"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-page p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/30 font-semibold text-primary">
              {iniciales}
            </div>
            <div>
              <p className="font-semibold text-primary">{empleado.cargo}</p>
              <p className="text-xs text-stone-500">
                {empleado.id} · {empleado.sucursal}
              </p>
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              activo ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-500"
            }`}
          >
            ● Empleado {activo ? "activo" : "inactivo"}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-stone-200 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-page text-primary">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-primary">
                Planilla quincenal{" "}
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    activo ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-500"
                  }`}
                >
                  {activo ? "Activo" : "Inactivo"}
                </span>
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {activo
                  ? "Se incluye en los cálculos de la planilla. Al desactivarlo deja de aparecer en ella."
                  : "No se incluye en la planilla. Al reactivarlo vuelve a entrar en los cálculos."}
              </p>
              <p className="mt-1 text-xs text-stone-400">Ingresó el {ingreso}</p>
            </div>
          </div>
          <button
            onClick={() => onCambiar(activo ? "Inactivo" : "Activo")}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              activo
                ? "border-red-300 text-red-700 hover:bg-red-50"
                : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            {activo ? "Desactivar" : "Reactivar"}
          </button>
        </div>
      </div>
    </div>
  );
}