/**
 * Tipos alineados 1:1 con el recurso `sucursal` del backend.
 */

export type TipoDocumento = "FCF" | "CCF";

export type Correlativo = {
  id: number;
  tipoDoc: TipoDocumento;
  serie: string;
  ultimoNumero: number;
};

export type Sucursal = {
  id: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  activa: boolean;
  correlativos?: Correlativo[];
};

/** Cuerpo aceptado por POST/PATCH /api/v1/sucursal */
export type DatosSucursal = {
  nombre: string;
  direccion: string;
  telefono: string;
  activa: boolean;
};
