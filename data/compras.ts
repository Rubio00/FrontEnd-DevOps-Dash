import type { Compra } from "@/types/compra";

export const compras: Compra[] = [
  {
    ref: "FC-0016",
    proveedor: "Café Especial SV",
    sucursal: "Centro Histórico",
    fecha: "2026-11-17",
    estado: "Por pagar",
    lineas: [{ insumoId: "INS-001", nombre: "Café de especialidad", unidad: "kg", cantidad: 40, costoUnitario: 18 }],
  },
  {
    ref: "FC-0015",
    proveedor: "Lácteos El Prado",
    sucursal: "Escalón",
    fecha: "2026-11-16",
    estado: "Pagada",
    lineas: [{ insumoId: "INS-002", nombre: "Leche entera", unidad: "l", cantidad: 120, costoUnitario: 1.1 }],
  },
  {
    ref: "FC-0014",
    proveedor: "Empaques SV",
    sucursal: "Santa Tecla",
    fecha: "2026-11-15",
    estado: "Pagada",
    lineas: [
      { insumoId: "INS-003", nombre: "Vaso 16oz", unidad: "u", cantidad: 1000, costoUnitario: 0.12 },
      { insumoId: "INS-004", nombre: "Tapadera", unidad: "u", cantidad: 1000, costoUnitario: 0.05 },
      { insumoId: "INS-005", nombre: "Viñeta", unidad: "u", cantidad: 1000, costoUnitario: 0.03 },
    ],
  },
  {
    ref: "FC-0013",
    proveedor: "Lácteos El Prado",
    sucursal: "Centro Histórico",
    fecha: "2026-11-12",
    estado: "Borrador",
    lineas: [{ insumoId: "INS-002", nombre: "Leche entera", unidad: "l", cantidad: 100, costoUnitario: 1.1 }],
  },
];