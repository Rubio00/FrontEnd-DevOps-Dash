import type { Correlativo } from "@/types/sucursal";

export const documentos = [
  { tipo: "FCF", nombre: "Factura consumidor final", detalle: "Ventas a clientes sin NRC" },
  { tipo: "CCF", nombre: "Comprobante de crédito fiscal", detalle: "Ventas a contribuyentes con NRC" },
] as const;

export type TipoDocumento = (typeof documentos)[number]["tipo"];

export function numeroDocumento(tipo: TipoDocumento, codigo: string, numero: number) {
  return `${tipo}-${codigo}-${String(numero).padStart(8, "0")}`;
}

export function generarCorrelativoBase(inicial = 1): Correlativo {
  return { inicial, siguiente: inicial };
}

export function documentosEmitidos(correlativo: Correlativo) {
  return correlativo.siguiente - correlativo.inicial;
}

export function siguienteIdSucursal(ids: string[]) {
  const max = ids.reduce((mayor, id) => Math.max(mayor, Number(id.replace(/\D/g, "")) || 0), 0);
  return `SUC-${String(max + 1).padStart(3, "0")}`;
}