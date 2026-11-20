import { FECHA_REFERENCIA, restarDias } from "@/lib/fechas";
import type { MetodoPago, Periodo, ResumenBalance, VentaBalance } from "@/types/balance";

export function diasDelPeriodo(periodo: Periodo) {
  return periodo === "hoy" ? 1 : periodo === "7d" ? 7 : 30;
}

function redondear(n: number) {
  return Math.round(n * 100) / 100;
}

export function filtrarVentas(ventas: VentaBalance[], periodo: Periodo, sucursalId: string) {
  const desde = restarDias(FECHA_REFERENCIA, diasDelPeriodo(periodo) - 1);
  return ventas.filter(
    (v) =>
      v.fecha >= desde &&
      v.fecha <= FECHA_REFERENCIA &&
      (sucursalId === "todas" || v.sucursalId === sucursalId),
  );
}

export function calcularBalance(ventas: VentaBalance[], periodo: Periodo): ResumenBalance {
  const dias = diasDelPeriodo(periodo);
  const metodos: MetodoPago[] = ["efectivo", "tarjeta", "transferencia"];

  const porSucursalMapa = new Map<string, number>();
  const porProductoMapa = new Map<string, { cantidad: number; monto: number }>();
  const porDiaMapa = new Map<string, number>();

  for (const venta of ventas) {
    porSucursalMapa.set(venta.sucursalId, (porSucursalMapa.get(venta.sucursalId) ?? 0) + venta.total);
    porDiaMapa.set(venta.fecha, (porDiaMapa.get(venta.fecha) ?? 0) + venta.total);
    for (const linea of venta.lineas) {
      const actual = porProductoMapa.get(linea.producto) ?? { cantidad: 0, monto: 0 };
      porProductoMapa.set(linea.producto, {
        cantidad: actual.cantidad + linea.cantidad,
        monto: actual.monto + linea.subtotal,
      });
    }
  }

  const total = redondear(ventas.reduce((suma, v) => suma + v.total, 0));

  return {
    total,
    ordenes: ventas.length,
    ticketPromedio: ventas.length > 0 ? redondear(total / ventas.length) : 0,
    ccf: ventas.filter((v) => v.comprobante === "CCF").length,
    porMetodo: metodos.map((metodo) => ({
      metodo,
      total: redondear(ventas.filter((v) => v.metodo === metodo).reduce((suma, v) => suma + v.total, 0)),
    })),
    porSucursal: [...porSucursalMapa.entries()]
      .map(([sucursalId, monto]) => ({ sucursalId, total: redondear(monto) }))
      .sort((a, b) => b.total - a.total),
    topProductos: [...porProductoMapa.entries()]
      .map(([producto, datos]) => ({ producto, cantidad: datos.cantidad, monto: redondear(datos.monto) }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5),
    porDia: Array.from({ length: dias }, (_, i) => {
      const fecha = restarDias(FECHA_REFERENCIA, dias - 1 - i);
      return { fecha, total: redondear(porDiaMapa.get(fecha) ?? 0) };
    }),
  };
}