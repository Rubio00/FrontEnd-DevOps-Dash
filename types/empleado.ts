export type EstadoEmpleado = "Activo" | "Inactivo";

export type Empleado = {
  id: string;
  nombre: string;
  dui: string;
  cargo: string;
  sucursal: string;
  fechaIngreso: string;
  salario: number;
  estado: EstadoEmpleado;
};