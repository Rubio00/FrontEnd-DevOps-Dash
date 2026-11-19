import type { Compra, LineaCompra } from "@/types/compra";

export const IVA = 0.13;

export const subtotalLineas = (lineas: LineaCompra[]) =>
  lineas.reduce((s, l) => s + l.cantidad * l.costoUnitario, 0);

export const totalCompra = (c: Compra) => subtotalLineas(c.lineas) * (1 + IVA);