export type MetodoPago = "efectivo" | "tarjeta" | "transferencia";
export type TipoComprobante = "FCF" | "CCF";
export type Periodo = "hoy" | "7d" | "30d";

export type LineaVenta = {
  producto: string;
  cantidad: number;
  subtotal: number;
};

export type VentaBalance = {
  id: string;
  fecha: string; // AAAA-MM-DD
  sucursalId: string;
  metodo: MetodoPago;
  comprobante: TipoComprobante;
  lineas: LineaVenta[];
  total: number;
};

export type ResumenBalance = {
  total: number;
  ordenes: number;
  ticketPromedio: number;
  ccf: number;
  porMetodo: { metodo: MetodoPago; total: number }[];
  porSucursal: { sucursalId: string; total: number }[];
  topProductos: { producto: string; cantidad: number; monto: number }[];
  porDia: { fecha: string; total: number }[];
};