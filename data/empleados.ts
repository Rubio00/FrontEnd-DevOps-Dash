import type { Empleado } from "@/types/empleado";

export const empleados: Empleado[] = [
  { id: "EMP-001", nombre: "Carlos Mejía", dui: "00000001-1", cargo: "Chef", sucursal: "Centro Histórico", fechaIngreso: "2024-03-01", salario: 850, estado: "Activo" },
  { id: "EMP-002", nombre: "Sofía Ramos", dui: "00000002-2", cargo: "Barista", sucursal: "Escalón", fechaIngreso: "2025-01-15", salario: 420, estado: "Activo" },
  { id: "EMP-003", nombre: "José Flores", dui: "00000003-3", cargo: "Cajero", sucursal: "Santa Tecla", fechaIngreso: "2025-06-10", salario: 480, estado: "Activo" },
  { id: "EMP-004", nombre: "Marta Cruz", dui: "00000004-4", cargo: "Gerente", sucursal: "Centro Histórico", fechaIngreso: "2023-08-20", salario: 1500, estado: "Activo" },
  { id: "EMP-005", nombre: "Pedro Alas", dui: "00000005-5", cargo: "Barista", sucursal: "Escalón", fechaIngreso: "2024-11-05", salario: 450, estado: "Inactivo" },
];