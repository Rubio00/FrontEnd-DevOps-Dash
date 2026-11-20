export type CondicionPago = "Contado" | "Crédito 15 días" | "Crédito 30 días";

export type Proveedor = {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  correo: string;
  nit: string;
  nrc: string;
  condicionPago: CondicionPago;
};