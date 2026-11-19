import type { Estado } from "@/types/compra";

const colores: Record<Estado, string> = {
  Borrador: "bg-stone-100 text-stone-600",
  "Por pagar": "bg-amber-100 text-amber-700",
  Pagada: "bg-emerald-100 text-emerald-700",
};

export default function EstadoBadge({ estado }: { estado: Estado }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${colores[estado]}`}>{estado}</span>
  );
}