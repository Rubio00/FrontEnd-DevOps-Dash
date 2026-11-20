/** Tipos del punto de venta (POS). */

export type ProductoPos = {
  id: number;
  nombre: string;
  categoria: string | null;
  tipo: "elaborado" | "reventa";
  precio: number;
};

export type ClientePos = {
  id: number;
  nombre: string;
  nit: string | null;
  nrc: string | null;
  giro: string | null;
  direccion: string | null;
  email: string | null;
};

export type MetodoPago = {
  id: number;
  nombre: string;
  esEfectivo: boolean;
};

export type CajaPos = {
  id: number;
  sucursalId: number;
  usuarioId: number;
  turno: "manana" | "tarde" | "noche";
  fechaApertura: string;
  montoInicial: number;
  estado: "abierta" | "cerrada";
  efectivoEsperado: number | null;
  efectivoReal: number | null;
  diferencia: number | null;
  observaciones: string | null;
};

export type VentaResumen = {
  id: number;
  fecha: string;
  tipoDoc: "FCF" | "CCF";
  serie: string;
  numeroDoc: number;
  total: number;
  estado: string;
  cliente: { id: number; nombre: string } | null;
};

export type LineaVenta = {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type PagoVenta = {
  metodoPagoId: number;
  monto: number;
  referencia?: string | null;
};

export type NuevaVenta = {
  sucursalId: number;
  cajaId: number;
  usuarioId: number;
  tipoDoc: "FCF" | "CCF";
  clienteId?: number | null;
  subtotal: number;
  iva: number;
  total: number;
  detalles: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
  pagos: PagoVenta[];
};

export type DatosCliente = {
  nombre: string;
  nit: string;
  nrc: string;
  giro: string;
  direccion: string;
  email: string;
};

/** El precio de venta incluye IVA: se separa la base imponible. */
export function desglosarPrecio(precioConIva: number, cantidad = 1) {
  const total = redondear(precioConIva * cantidad);
  const subtotal = redondear(total / 1.13);
  return { subtotal, iva: redondear(total - subtotal), total };
}

export function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}
