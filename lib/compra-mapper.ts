import type { Compra } from "@/types/compra";

/**
 * Forma en que el backend devuelve una compra (montos y cantidades como
 * strings decimales). Se normaliza a números para la UI.
 */
export type CompraBackend = {
  id: number;
  numeroFactura: string;
  fecha: string;
  tipoPago: "contado" | "credito";
  subtotal: string;
  iva: string;
  total: string;
  proveedorId: number;
  sucursalId: number;
  proveedor?: { id: number; nombre: string } | null;
  sucursal?: { id: number; nombre: string } | null;
  cuentaPorPagar?: { id: number; estado: string; saldo: string } | null;
  detalles?: {
    insumoId: number;
    cantidad: string;
    costoUnitario: string;
    subtotal: string;
    insumo?: { id: number; nombre: string; unidad: string } | null;
  }[];
};

export function aCompra(compra: CompraBackend): Compra {
  const cuenta = compra.cuentaPorPagar;

  return {
    id: compra.id,
    ref: compra.numeroFactura,
    proveedorId: compra.proveedorId,
    proveedor: compra.proveedor?.nombre ?? `Proveedor #${compra.proveedorId}`,
    sucursalId: compra.sucursalId,
    sucursal: compra.sucursal?.nombre ?? `Sucursal #${compra.sucursalId}`,
    fecha: String(compra.fecha).slice(0, 10),
    tipoPago: compra.tipoPago,
    estado: cuenta && cuenta.estado !== "pagada" ? "Por pagar" : "Pagada",
    lineas: (compra.detalles ?? []).map((detalle) => ({
      insumoId: detalle.insumoId,
      nombre: detalle.insumo?.nombre ?? `Insumo #${detalle.insumoId}`,
      unidad: detalle.insumo?.unidad ?? "",
      cantidad: Number(detalle.cantidad),
      costoUnitario: Number(detalle.costoUnitario),
      subtotal: Number(detalle.subtotal),
    })),
    subtotal: Number(compra.subtotal),
    iva: Number(compra.iva),
    total: Number(compra.total),
  };
}
