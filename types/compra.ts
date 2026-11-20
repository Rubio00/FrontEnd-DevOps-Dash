/** Tipos alineados con los recursos `compras` e `insumos` del backend. */

export type EstadoCompra = "Por pagar" | "Pagada";

export type InsumoCompra = {
  id: number;
  nombre: string;
  unidad: string;
  costo: number;
};

export type LineaCompra = {
  insumoId: number;
  nombre: string;
  unidad: string;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
};

export type Compra = {
  id: number;
  ref: string;
  proveedorId: number;
  proveedor: string;
  sucursalId: number;
  sucursal: string;
  fecha: string;
  tipoPago: "contado" | "credito";
  estado: EstadoCompra;
  lineas: LineaCompra[];
  subtotal: number;
  iva: number;
  total: number;
};

/** Cuerpo aceptado por POST /api/v1/compras */
export type NuevaCompra = {
  sucursalId: number;
  proveedorId: number;
  numeroFactura: string;
  fecha: string;
  tipoPago: "contado" | "credito";
  subtotal: number;
  iva: number;
  total: number;
  detalles: {
    insumoId: number;
    cantidad: number;
    costoUnitario: number;
    subtotal: number;
  }[];
};
