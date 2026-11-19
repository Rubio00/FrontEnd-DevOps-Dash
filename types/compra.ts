export type Estado = "Borrador"  | "Por pagar" | "Pagada";

export type Sucursal = { id: string; nombre: string };

export type InsumoCompra = { id: string; nombre: string; unidad: string; costo: number };

export type LineaCompra = {
  insumoId: string;
  nombre: string;
  unidad: string;
  cantidad: number;
  costoUnitario: number;
};

export type Compra = {
  ref: string;
  proveedor: string;
  sucursal: string;
  fecha: string;
  estado: Estado;
  lineas: LineaCompra[];
};