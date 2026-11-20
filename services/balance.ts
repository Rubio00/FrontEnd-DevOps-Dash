import "server-only";

import { apiData } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { MetodoPago, VentaBalance } from "@/types/balance";

type VentaBackend = {
  id: number;
  fecha: string;
  sucursalId: number;
  tipoDoc: "FCF" | "CCF";
  total: string;
  detalles?: {
    cantidad: string | number;
    subtotal: string;
    producto?: { id: number; nombre: string } | null;
  }[];
  pagos?: {
    monto: string;
    metodoPago?: { id: number; nombre: string } | null;
  }[];
};

function normalizarMetodo(nombre: string | undefined): MetodoPago {
  const metodo = (nombre ?? "efectivo").toLowerCase();
  if (metodo === "tarjeta") return "tarjeta";
  if (metodo === "transferencia") return "transferencia";
  return "efectivo";
}

export async function getVentasBalance(): Promise<VentaBalance[]> {
  const token = await getSessionToken();
  const ventas = await apiData<VentaBackend[]>("/api/v1/ventas", { token });

  return ventas.map((venta) => ({
    id: String(venta.id),
    fecha: String(venta.fecha).slice(0, 10),
    sucursalId: String(venta.sucursalId),
    metodo: normalizarMetodo(venta.pagos?.[0]?.metodoPago?.nombre),
    comprobante: venta.tipoDoc,
    lineas: (venta.detalles ?? []).map((detalle) => ({
      producto: detalle.producto?.nombre ?? "Producto",
      cantidad: Number(detalle.cantidad),
      subtotal: Number(detalle.subtotal),
    })),
    total: Number(venta.total),
  }));
}
