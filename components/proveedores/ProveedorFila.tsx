import type { Proveedor } from "@/types/proveedor";
import { etiquetaCondicion } from "@/types/proveedor";
import { usd } from "@/lib/format";

export default function ProveedorFila({ proveedor, saldo }: { proveedor: Proveedor; saldo: number }) {
  return (
    <tr className="border-t border-stone-100 transition hover:bg-accent/5">
      <td className="px-5 py-4">
        <p className="font-semibold text-primary">{proveedor.nombre}</p>
        <p className="text-xs text-stone-400">PRV-{String(proveedor.id).padStart(3, "0")}</p>
      </td>
      <td className="px-5 py-4 text-sm">
        <p>{proveedor.direccion || "—"}</p>
        <p className="text-xs text-stone-500">
          {proveedor.telefono || "—"} · {proveedor.email || "—"}
        </p>
      </td>
      <td className="px-5 py-4 text-sm">
        <p>NIT {proveedor.nit || "—"}</p>
        <p className="text-xs text-stone-500">NRC {proveedor.nrc || "—"}</p>
      </td>
      <td className="px-5 py-4">
        <span className="rounded-full border border-accent/40 px-3 py-1 text-xs font-medium text-primary">
          {etiquetaCondicion(proveedor.diasCredito)}
        </span>
      </td>
      <td
        className={`px-5 py-4 text-right text-base font-bold ${
          saldo > 0 ? "text-amber-600" : "text-emerald-600"
        }`}
      >
        {usd(saldo)}
      </td>
    </tr>
  );
}
