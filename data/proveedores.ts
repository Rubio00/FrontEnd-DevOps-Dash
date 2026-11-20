import type { Proveedor } from "@/types/proveedor";

export const proveedores: Proveedor[] = [
  {
    id: "PRV-001",
    nombre: "Café Especial SV",
    contacto: "Mario Hernández",
    telefono: "2200-0001",
    correo: "ventas@cafeespecial.example",
    nit: "0000-000000-001-1",
    nrc: "000001-1",
    condicionPago: "Crédito 30 días",
  },
  {
    id: "PRV-002",
    nombre: "Lácteos El Prado",
    contacto: "Ana Martínez",
    telefono: "2200-0002",
    correo: "pedidos@lacteosprado.example",
    nit: "0000-000000-002-2",
    nrc: "000002-2",
    condicionPago: "Crédito 15 días",
  },
  {
    id: "PRV-003",
    nombre: "Empaques SV",
    contacto: "Luis Rivera",
    telefono: "2200-0003",
    correo: "contacto@empaquessv.example",
    nit: "0000-000000-003-3",
    nrc: "000003-3",
    condicionPago: "Contado",
  },
];