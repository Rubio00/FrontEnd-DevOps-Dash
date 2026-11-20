import type { Compra } from "@/types/compra";
import { usd } from "@/lib/format";
import EstadoBadge from "@/components/EstadoBadge";

export default function CompraCard({ compra }: { compra: Compra }) {
  const visibles = compra.lineas.slice(0, 3);
  const resto = compra.lineas.length - visibles.length;

  return (
    <article className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Factura</p>
          <p className="font-semibold text-primary">{compra.ref}</p>
        </div>
        <EstadoBadge estado={compra.estado} />
      </div>

      <p className="mt-4 text-lg font-medium">{compra.proveedor}</p>
      <div className="mt-1 flex items-center gap-2 text-sm text-stone-500">
        <span>{compra.fecha}</span>
        <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{compra.sucursal}</span>
      </div>

      <ul className="mt-3 space-y-1 text-sm text-stone-600">
        {visibles.map((l, i) => (
          <li key={i}>
            {l.cantidad} {l.unidad} · {l.nombre}
          </li>
        ))}
        {resto > 0 && <li className="text-stone-400">+{resto} más</li>}
      </ul>

      <div className="mt-4 flex items-end justify-between border-t border-stone-100 pt-4">
        <span className="text-xs uppercase tracking-wide text-stone-500">Total con IVA</span>
        <span className="text-2xl font-bold text-primary">{usd(compra.total)}</span>
      </div>
    </article>
  );
}
