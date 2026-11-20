export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  active: boolean;
};

export type Employee = {
  id: string;
  name: string;
  position: string;
};

export type RoleAssignment = {
  roleId: string;
  active: boolean;
  assignedAt: string;
};

export type SystemUser = {
  id: string;
  employeeId: string;
  username: string;
  email: string;
  active: boolean;
  lastAccess: string | null;
  roleAssignments: RoleAssignment[];
};

export type UserInput = Omit<SystemUser, "id" | "lastAccess">;
export type RoleInput = Omit<Role, "id" | "active">;

export const permissionOptions = [
  "Gestionar ventas",
  "Consultar inventario",
  "Gestionar inventario",
  "Registrar compras",
  "Abrir y cerrar caja",
  "Consultar planilla",
  "Gestionar empleados",
  "Administrar roles",
] as const;

export const initialRoles: Role[] = [
  {
    id: "administrador",
    name: "Administrador",
    description: "Control general del sistema y de la configuración administrativa.",
    permissions: [...permissionOptions],
    active: true,
  },
  {
    id: "gerente",
    name: "Gerente de sucursal",
    description: "Supervisa operaciones, inventario, compras y personal de su sucursal.",
    permissions: ["Gestionar ventas", "Gestionar inventario", "Registrar compras", "Abrir y cerrar caja", "Consultar planilla"],
    active: true,
  },
  {
    id: "cajero",
    name: "Cajero",
    description: "Registra ventas y controla los movimientos de caja del turno.",
    permissions: ["Gestionar ventas", "Abrir y cerrar caja"],
    active: true,
  },
  {
    id: "barista",
    name: "Barista",
    description: "Consulta recetas y existencias para la preparación de productos.",
    permissions: ["Consultar inventario"],
    active: true,
  },
  {
    id: "supervisor-temporal",
    name: "Supervisor temporal",
    description: "Rol histórico para coberturas temporales; no admite nuevas asignaciones.",
    permissions: ["Gestionar ventas", "Consultar inventario"],
    active: false,
  },
];

export const existingEmployees: Employee[] = [
  { id: "emp-1", name: "Ana María Rodríguez", position: "Gerente general" },
  { id: "emp-2", name: "Carlos Eduardo Méndez", position: "Gerente de sucursal" },
  { id: "emp-3", name: "Sofía Isabel Castro", position: "Cajera" },
  { id: "emp-4", name: "Luis Alberto Hernández", position: "Barista senior" },
  { id: "emp-5", name: "Marta Elena Flores", position: "Barista" },
  { id: "emp-6", name: "Jorge Antonio Ramírez", position: "Cajero" },
  { id: "emp-7", name: "Daniela Beatriz Ortiz", position: "Supervisora" },
];

export const initialUsers: SystemUser[] = [
  {
    id: "user-1",
    employeeId: "emp-1",
    username: "ana.rodriguez",
    email: "ana.rodriguez@origenessv.example",
    active: true,
    lastAccess: "Hoy, 08:42",
    roleAssignments: [{ roleId: "administrador", active: true, assignedAt: "2023-02-15" }],
  },
  {
    id: "user-2",
    employeeId: "emp-2",
    username: "carlos.mendez",
    email: "carlos.mendez@origenessv.example",
    active: true,
    lastAccess: "Hoy, 08:15",
    roleAssignments: [{ roleId: "gerente", active: true, assignedAt: "2023-06-01" }],
  },
  {
    id: "user-3",
    employeeId: "emp-3",
    username: "sofia.castro",
    email: "sofia.castro@origenessv.example",
    active: true,
    lastAccess: "Ayer, 18:06",
    roleAssignments: [{ roleId: "cajero", active: true, assignedAt: "2024-01-08" }],
  },
  {
    id: "user-4",
    employeeId: "emp-4",
    username: "luis.hernandez",
    email: "luis.hernandez@origenessv.example",
    active: true,
    lastAccess: "Hoy, 07:58",
    roleAssignments: [{ roleId: "barista", active: true, assignedAt: "2024-03-18" }],
  },
  {
    id: "user-5",
    employeeId: "emp-5",
    username: "marta.flores",
    email: "marta.flores@origenessv.example",
    active: false,
    lastAccess: "12 nov 2026, 17:45",
    roleAssignments: [{ roleId: "supervisor-temporal", active: false, assignedAt: "2025-04-14" }],
  },
];
