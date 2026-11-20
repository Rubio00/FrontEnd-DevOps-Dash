import { FECHA_REFERENCIA, restarDias } from "@/lib/fechas";
import type { MetodoPago, VentaBalance } from "@/types/balance";

const productos = [
  { nombre: "Café americano", precio: 2.5 },
  { nombre: "Capuchino", precio: 3.25 },
  { nombre: "Latte de avena", precio: 3.75 },
  { nombre: "Té chai", precio: 3.0 },
  { nombre: "Croissant", precio: 2.9 },
  { nombre: "Pan dulce", precio: 1.5 },
  { nombre: "Sándwich de pollo", precio: 5.5 },
];

const metodos: MetodoPago[] = ["efectivo", "efectivo", "tarjeta", "tarjeta", "transferencia"];

// Generador pseudoaleatorio determinista: siempre produce las mismas ventas.
function semilla(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function redondear(n: number) {
  return Math.round(n * 100) / 100;
}

function generarVentas(): VentaBalance[] {
  const ventas: VentaBalance[] = [];
  let contador = 0;

  for (const sucursalId of ["SUC-001", "SUC-002", "SUC-003"]) {
    for (let dia = 0; dia < 30; dia++) {
      // Santa Tecla está inactiva: solo tiene ventas antiguas.
      if (sucursalId === "SUC-003" && dia < 20) continue;

      const cantidadVentas = 4 + Math.floor(semilla(contador * 7 + dia) * 5);
      for (let i = 0; i < cantidadVentas; i++) {
        contador++;
        const numeroLineas = 1 + Math.floor(semilla(contador + 1) * 3);
        const lineas = Array.from({ length: numeroLineas }, (_, j) => {
          const producto = productos[Math.floor(semilla(contador * 13 + j) * productos.length)];
          const cantidad = 1 + Math.floor(semilla(contador * 17 + j) * 3);
          return { producto: producto.nombre, cantidad, subtotal: redondear(producto.precio * cantidad) };
        });

        ventas.push({
          id: `V-${String(contador).padStart(5, "0")}`,
          fecha: restarDias(FECHA_REFERENCIA, dia),
          sucursalId,
          metodo: metodos[Math.floor(semilla(contador * 5) * metodos.length)],
          comprobante: semilla(contador * 3) > 0.8 ? "CCF" : "FCF",
          lineas,
          total: redondear(lineas.reduce((suma, l) => suma + l.subtotal, 0)),
        });
      }
    }
  }
  return ventas;
}

export const ventasBalance = generarVentas();