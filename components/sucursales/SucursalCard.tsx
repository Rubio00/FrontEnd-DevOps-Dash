import Link from "next/link";
import { Icon } from "@/components/Icon";
import { numeroDocumento, serieDe, siguienteNumero } from "@/lib/correlativos";
import type { Sucursal } from "@/types/sucursal";

export default function SucursalCard({ sucursal }: { sucursal: Sucursal }) {
  return (
    <Link
      href={`/sucursales/${sucursal.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent"
    >
      <div className={`h-1.5 ${sucursal.activa ? "bg-accent" : "bg-stone-300"}`} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-page text-primary">
            <Icon name="branch" className="h-5 w-5" />
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
              sucursal.activa ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
            }`}
          >
            {sucursal.activa ? "Activa" : "Inactiva"}
          </span>
        </div>

        <h3 className="mt-4 text-lg font-bold text-primary">{sucursal.nombre}</h3>
        <p className="mt-0.5 text-xs font-semibold tracking-widest text-accent">
          SUC-{String(sucursal.id).padStart(3, "0")}
        </p>
        <p className="mt-3 text-sm text-muted">{sucursal.direccion || "Sin dirección registrada"}</p>
        <p className="mt-1 text-sm text-muted">Teléfono: {sucursal.telefono || "—"}</p>

        <dl className="mt-5 space-y-2 border-t border-primary/10 pt-4 text-xs">
          {(["FCF", "CCF"] as const).map((tipo) => (
            <div key={tipo} className="flex items-center justify-between gap-2">
              <dt className="font-bold text-ink/45">Próximo {tipo}</dt>
              <dd className="font-mono text-ink/70">
                {numeroDocumento(tipo, serieDe(sucursal, tipo), siguienteNumero(sucursal, tipo))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Link>
  );
}
