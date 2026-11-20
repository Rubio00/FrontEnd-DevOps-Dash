import "server-only";

import { apiData } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { Empleado } from "@/types/empleado";

type EmpleadoBackend = Omit<Empleado, "salarioMensual"> & { salarioMensual: string };

function aEmpleado(empleado: EmpleadoBackend): Empleado {
  return {
    ...empleado,
    salarioMensual: Number(empleado.salarioMensual),
    fechaContratacion: String(empleado.fechaContratacion).slice(0, 10),
  };
}

export async function getEmpleados(): Promise<Empleado[]> {
  const token = await getSessionToken();
  const empleados = await apiData<EmpleadoBackend[]>("/api/v1/empleado", { token });
  return empleados.map(aEmpleado);
}
