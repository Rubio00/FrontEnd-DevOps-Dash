import { empleados } from "@/data/empleados";
import type { Empleado, EstadoEmpleado } from "@/types/empleado";

export async function getEmpleados(): Promise<Empleado[]> {
  return empleados;
}

export async function crearEmpleado(empleado: Empleado): Promise<Empleado> {
  return empleado;
}

export async function cambiarEstadoEmpleado(
  id: string,
  estado: EstadoEmpleado,
): Promise<{ id: string; estado: EstadoEmpleado }> {
  return { id, estado };
}