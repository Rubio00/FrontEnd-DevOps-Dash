import type { Correlativo, Sucursal, TipoDocumento } from "@/types/sucursal";

export const documentos = [
  { tipo: "FCF", nombre: "Factura consumidor final", detalle: "Ventas a clientes sin NRC" },
  { tipo: "CCF", nombre: "Comprobante de crédito fiscal", detalle: "Ventas a contribuyentes con NRC" },
] as const satisfies readonly { tipo: TipoDocumento; nombre: string; detalle: string }[];

export function numeroDocumento(tipo: TipoDocumento, serie: string, numero: number) {
  return `${tipo}-${serie}-${String(numero).padStart(8, "0")}`;
}

export function correlativoDe(sucursal: Sucursal, tipo: TipoDocumento): Correlativo | undefined {
  return sucursal.correlativos?.find((correlativo) => correlativo.tipoDoc === tipo);
}

/** El backend guarda el último número emitido; el próximo es +1. */
export function siguienteNumero(sucursal: Sucursal, tipo: TipoDocumento): number {
  const correlativo = correlativoDe(sucursal, tipo);
  return (correlativo?.ultimoNumero ?? 0) + 1;
}

export function serieDe(sucursal: Sucursal, tipo: TipoDocumento): string {
  return correlativoDe(sucursal, tipo)?.serie ?? "A";
}

export function documentosEmitidos(sucursal: Sucursal, tipo: TipoDocumento): number {
  return correlativoDe(sucursal, tipo)?.ultimoNumero ?? 0;
}
