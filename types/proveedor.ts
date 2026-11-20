/** Tipos alineados con el recurso `proveedor` del backend. */

export type Proveedor = {
  id: number;
  nombre: string;
  nit: string | null;
  nrc: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  diasCredito: number;
  activo: boolean;
};

export type DatosProveedor = {
  nombre: string;
  nit: string;
  nrc: string;
  telefono: string;
  email: string;
  direccion: string;
  diasCredito: number;
  activo: boolean;
};

export const condicionesCredito = [
  { dias: 0, etiqueta: "Contado" },
  { dias: 15, etiqueta: "Crédito 15 días" },
  { dias: 30, etiqueta: "Crédito 30 días" },
] as const;

export function etiquetaCondicion(dias: number): string {
  return condicionesCredito.find((condicion) => condicion.dias === dias)?.etiqueta ?? `${dias} días`;
}
