import { peticionData } from "@/lib/cliente";
import type { DatosEmpleado, Empleado } from "@/types/empleado";

type EmpleadoBackend = Omit<Empleado, "salarioMensual"> & { salarioMensual: string };

function aEmpleado(empleado: EmpleadoBackend): Empleado {
  return {
    ...empleado,
    salarioMensual: Number(empleado.salarioMensual),
    fechaContratacion: String(empleado.fechaContratacion).slice(0, 10),
  };
}

export async function crearEmpleado(datos: DatosEmpleado): Promise<Empleado> {
  const empleado = await peticionData<EmpleadoBackend>("/empleado", { method: "POST", body: datos });
  return aEmpleado(empleado);
}

export async function cambiarEstadoEmpleado(id: number, activo: boolean): Promise<Empleado> {
  const empleado = await peticionData<EmpleadoBackend>(`/empleado/${id}`, {
    method: "PATCH",
    body: { activo },
  });
  return aEmpleado(empleado);
}
