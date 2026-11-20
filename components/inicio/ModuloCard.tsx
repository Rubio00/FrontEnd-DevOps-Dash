import Link from "next/link";
import ModuloIcon from "@/components/inicio/ModuloIcon";
import type { Modulo } from "@/types/menu";

export default function ModuloCard({ modulo }: { modulo: Modulo }) {
  return (
    <Link
      href={modulo.href}
      className="group flex flex-col gap-4 rounded-2xl border border-primary/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-page"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
          <ModuloIcon icono={modulo.icono} className="h-6 w-6" />
        </span>
        <span className="rounded-full bg-page px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
          {modulo.etiqueta}
        </span>
      </div>
      <div>
        <h3 className="text-lg font-bold text-ink">{modulo.nombre}</h3>
        <p className="mt-1 text-sm leading-6 text-muted">{modulo.descripcion}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
        Entrar
        <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}
