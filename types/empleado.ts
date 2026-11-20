/** Tipos alineados con el recurso `empleado` del backend. */

export type Puesto = "barista" | "cajero" | "gerente";

export type Empleado = {
  id: number;
  sucursalId: number;
  nombres: string;
  apellidos: string;
  dui: string | null;
  nit: string | null;
  puesto: Puesto;
  salarioMensual: number;
  fechaContratacion: string;
  activo: boolean;
  sucursal?: { id: number; nombre: string } | null;
};

export type DatosEmpleado = {
  sucursalId: number;
  nombres: string;
  apellidos: string;
  dui: string;
  nit: string;
  puesto: Puesto;
  salarioMensual: number;
  fechaContratacion: string;
  activo: boolean;
};

export const puestos: { valor: Puesto; etiqueta: string }[] = [
  { valor: "barista", etiqueta: "Barista" },
  { valor: "cajero", etiqueta: "Cajero" },
  { valor: "gerente", etiqueta: "Gerente" },
];

export function nombreEmpleado(empleado: Empleado): string {
  return `${empleado.nombres} ${empleado.apellidos}`.trim();
}
