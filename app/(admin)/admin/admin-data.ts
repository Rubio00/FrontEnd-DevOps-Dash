export type Branch = {
  id: string;
  name: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  active: boolean;
};

export type RoleAssignment = {
  roleId: string;
  active: boolean;
  assignedAt: string;
};

export type Employee = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  dui: string;
  position: string;
  branchId: string;
  salary: number;
  hiredAt: string;
  active: boolean;
  roleAssignments: RoleAssignment[];
  username: string | null;
  lastAccess: string | null;
};

export type EmployeeInput = Omit<Employee, "id" | "code" | "lastAccess">;
export type RoleInput = Omit<Role, "id" | "active">;

export const branches: Branch[] = [
  { id: "centro", name: "Centro" },
  { id: "santa-tecla", name: "Santa Tecla" },
  { id: "san-miguel", name: "San Miguel" },
];

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

export const initialEmployees: Employee[] = [
  {
    id: "emp-1",
    code: "EMP-001",
    name: "Ana María Rodríguez",
    email: "ana.rodriguez@origenessv.example",
    phone: "7890-1201",
    dui: "01234567-8",
    position: "Gerente general",
    branchId: "centro",
    salary: 1200,
    hiredAt: "2023-02-15",
    active: true,
    roleAssignments: [{ roleId: "administrador", active: true, assignedAt: "2023-02-15" }],
    username: "ana.rodriguez",
    lastAccess: "Hoy, 08:42",
  },
  {
    id: "emp-2",
    code: "EMP-002",
    name: "Carlos Eduardo Méndez",
    email: "carlos.mendez@origenessv.example",
    phone: "7123-4589",
    dui: "02345678-9",
    position: "Gerente de sucursal",
    branchId: "santa-tecla",
    salary: 900,
    hiredAt: "2023-06-01",
    active: true,
    roleAssignments: [{ roleId: "gerente", active: true, assignedAt: "2023-06-01" }],
    username: "carlos.mendez",
    lastAccess: "Hoy, 08:15",
  },
  {
    id: "emp-3",
    code: "EMP-003",
    name: "Sofía Isabel Castro",
    email: "sofia.castro@origenessv.example",
    phone: "7456-2310",
    dui: "03456789-0",
    position: "Cajera",
    branchId: "centro",
    salary: 550,
    hiredAt: "2024-01-08",
    active: true,
    roleAssignments: [{ roleId: "cajero", active: true, assignedAt: "2024-01-08" }],
    username: "sofia.castro",
    lastAccess: "Ayer, 18:06",
  },
  {
    id: "emp-4",
    code: "EMP-004",
    name: "Luis Alberto Hernández",
    email: "luis.hernandez@origenessv.example",
    phone: "7654-9087",
    dui: "04567890-1",
    position: "Barista senior",
    branchId: "centro",
    salary: 600,
    hiredAt: "2024-03-18",
    active: true,
    roleAssignments: [{ roleId: "barista", active: true, assignedAt: "2024-03-18" }],
    username: "luis.hernandez",
    lastAccess: "Hoy, 07:58",
  },
  {
    id: "emp-5",
    code: "EMP-005",
    name: "Marta Elena Flores",
    email: "marta.flores@origenessv.example",
    phone: "7788-1122",
    dui: "05678901-2",
    position: "Barista",
    branchId: "san-miguel",
    salary: 525,
    hiredAt: "2024-09-02",
    active: true,
    roleAssignments: [
      { roleId: "barista", active: true, assignedAt: "2024-09-02" },
      { roleId: "cajero", active: false, assignedAt: "2025-01-15" },
    ],
    username: "marta.flores",
    lastAccess: "Ayer, 16:34",
  },
  {
    id: "emp-6",
    code: "EMP-006",
    name: "Jorge Antonio Ramírez",
    email: "jorge.ramirez@origenessv.example",
    phone: "7012-3344",
    dui: "06789012-3",
    position: "Cajero",
    branchId: "san-miguel",
    salary: 550,
    hiredAt: "2025-02-10",
    active: true,
    roleAssignments: [{ roleId: "cajero", active: true, assignedAt: "2025-02-10" }],
    username: "jorge.ramirez",
    lastAccess: "Hoy, 08:03",
  },
  {
    id: "emp-7",
    code: "EMP-007",
    name: "Daniela Beatriz Ortiz",
    email: "daniela.ortiz@origenessv.example",
    phone: "7234-5566",
    dui: "07890123-4",
    position: "Supervisora temporal",
    branchId: "santa-tecla",
    salary: 650,
    hiredAt: "2025-04-14",
    active: false,
    roleAssignments: [{ roleId: "supervisor-temporal", active: false, assignedAt: "2025-04-14" }],
    username: "daniela.ortiz",
    lastAccess: "12 nov 2026, 17:45",
  },
];
