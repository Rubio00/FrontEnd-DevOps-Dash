"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar, Icon, Modal, StatusBadge } from "./admin-ui";
import type { IconName } from "./admin-ui";
import EmployeeFormModal from "./employee-form-modal";
import RoleFormModal from "./role-form-modal";
import { branches, initialEmployees, initialRoles } from "./admin-data";
import type { Employee, EmployeeInput, Role, RoleInput } from "./admin-data";

type Tab = "empleados" | "roles" | "usuarios";
type EmployeeFilter = "todos" | "activos" | "inactivos";
type Toast = { type: "success" | "error"; message: string };

const currencyFormatter = new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" });
const dateFormatter = new Intl.DateTimeFormat("es-SV", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

function RoleManagerModal({
  employee,
  roles,
  onClose,
  onToggle,
  onAssign,
}: {
  employee: Employee;
  roles: Role[];
  onClose: () => void;
  onToggle: (roleId: string) => void;
  onAssign: (roleId: string) => void;
}) {
  const assignedIds = employee.roleAssignments.map((assignment) => assignment.roleId);
  const availableRoles = roles.filter((role) => role.active && !assignedIds.includes(role.id));
  const [roleToAssign, setRoleToAssign] = useState(availableRoles[0]?.id ?? "");
  const selectedRoleId = availableRoles.some((role) => role.id === roleToAssign) ? roleToAssign : availableRoles[0]?.id ?? "";

  return (
    <Modal description="Activá o desactivá cada rol sin eliminar su historial de asignación." onClose={onClose} title={`Roles de ${employee.name}`} wide>
      <div className="space-y-5 p-6">
        <div className="flex items-center gap-4 rounded-xl bg-page p-4">
          <Avatar name={employee.name} large />
          <div>
            <p className="font-bold text-primary">{employee.position}</p>
            <p className="mt-1 text-sm text-muted">{employee.code} · {branches.find((branch) => branch.id === employee.branchId)?.name}</p>
          </div>
          <div className="ml-auto"><StatusBadge active={employee.active} activeLabel="Empleado activo" inactiveLabel="Empleado inactivo" /></div>
        </div>

        <div className="space-y-3">
          {employee.roleAssignments.map((assignment) => {
            const role = roles.find((item) => item.id === assignment.roleId);
            if (!role) return null;
            const canActivate = employee.active && role.active;
            return (
              <article key={assignment.roleId} className="flex flex-col gap-4 rounded-xl border border-primary/10 p-4 sm:flex-row sm:items-center">
                <span className={`rounded-xl p-3 ${assignment.active ? "bg-primary/10 text-primary" : "bg-stone-100 text-stone-500"}`}><Icon name="roles" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-primary">{role.name}</h3>
                    <StatusBadge active={assignment.active} />
                  </div>
                  <p className="mt-1 text-sm leading-5 text-muted">{role.description}</p>
                  <p className="mt-2 text-xs text-ink/40">Asignado el {formatDate(assignment.assignedAt)}</p>
                  {!role.active && <p className="mt-2 text-xs font-semibold text-amber-700">El rol está inactivo globalmente y no puede habilitarse.</p>}
                </div>
                <button
                  className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${assignment.active ? "border-red-200 text-red-700 hover:bg-red-50 focus:ring-red-400" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-400"}`}
                  disabled={!assignment.active && !canActivate}
                  onClick={() => onToggle(assignment.roleId)}
                  type="button"
                >
                  {assignment.active ? "Desactivar rol" : "Activar rol"}
                </button>
              </article>
            );
          })}
          {employee.roleAssignments.length === 0 && <p className="rounded-xl bg-page px-4 py-8 text-center text-sm text-muted">Este empleado todavía no tiene roles asignados.</p>}
        </div>

        <section className="rounded-xl border border-dashed border-primary/20 p-4">
          <h3 className="text-sm font-bold text-primary">Asignar otro rol</h3>
          {employee.active ? (
            availableRoles.length > 0 ? (
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <select aria-label="Rol por asignar" className="min-w-0 flex-1 rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" onChange={(event) => setRoleToAssign(event.target.value)} value={selectedRoleId}>
                  {availableRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
                <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent" onClick={() => onAssign(selectedRoleId)} type="button">Asignar rol</button>
              </div>
            ) : <p className="mt-2 text-sm text-muted">No hay más roles activos disponibles para asignar.</p>
          ) : <p className="mt-2 text-sm text-amber-700">Un empleado inactivo no puede recibir nuevos roles.</p>}
        </section>
      </div>
    </Modal>
  );
}

export default function AdminDashboard() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [roles, setRoles] = useState(initialRoles);
  const [activeTab, setActiveTab] = useState<Tab>("empleados");
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("todas");
  const [employeeFilter, setEmployeeFilter] = useState<EmployeeFilter>("todos");
  const [userSearch, setUserSearch] = useState("");
  const [employeeFormOpen, setEmployeeFormOpen] = useState(false);
  const [roleFormOpen, setRoleFormOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const roleById = useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles]);
  const selectedEmployee = employees.find((employee) => employee.id === selectedEmployeeId);
  const selectedUser = employees.find((employee) => employee.id === selectedUserId);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");
    return employees.filter((employee) => {
      const matchesSearch = !query || [employee.name, employee.code, employee.email, employee.position].some((value) => value.toLocaleLowerCase("es").includes(query));
      const matchesBranch = branchFilter === "todas" || employee.branchId === branchFilter;
      const matchesStatus = employeeFilter === "todos" || (employeeFilter === "activos" ? employee.active : !employee.active);
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [branchFilter, employeeFilter, employees, search]);

  const users = useMemo(() => {
    const query = userSearch.trim().toLocaleLowerCase("es");
    return employees.filter((employee) => {
      if (!employee.username) return false;
      return !query || [employee.name, employee.username, employee.email].some((value) => value.toLocaleLowerCase("es").includes(query));
    });
  }, [employees, userSearch]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function addEmployee(input: EmployeeInput) {
    const nextNumber = Math.max(...employees.map((employee) => Number(employee.code.replace("EMP-", ""))), 0) + 1;
    const employee: Employee = {
      ...input,
      id: `emp-${Date.now()}`,
      code: `EMP-${String(nextNumber).padStart(3, "0")}`,
      lastAccess: null,
    };
    setEmployees((current) => [...current, employee]);
    setEmployeeFormOpen(false);
    setActiveTab("empleados");
    setSearch("");
    setBranchFilter("todas");
    setEmployeeFilter("todos");
    setToast({ type: "success", message: `${employee.name} fue registrado como ${employee.code} y ya está disponible para planilla.` });
  }

  function addRole(input: RoleInput) {
    const baseId = input.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const role: Role = { ...input, id: `${baseId || "rol"}-${Date.now()}`, active: true };
    setRoles((current) => [...current, role]);
    setRoleFormOpen(false);
    setActiveTab("roles");
    setToast({ type: "success", message: `El rol ${role.name} fue creado con ${role.permissions.length} permisos.` });
  }

  function toggleEmployeeRole(employeeId: string, roleId: string) {
    const employee = employees.find((item) => item.id === employeeId);
    const assignment = employee?.roleAssignments.find((item) => item.roleId === roleId);
    const role = roleById.get(roleId);
    if (!employee || !assignment || !role) return;
    if (!assignment.active && (!employee.active || !role.active)) {
      setToast({ type: "error", message: "No se puede activar un rol si el empleado o el rol están inactivos." });
      return;
    }
    setEmployees((current) => current.map((item) => item.id === employeeId ? {
      ...item,
      roleAssignments: item.roleAssignments.map((itemAssignment) => itemAssignment.roleId === roleId ? { ...itemAssignment, active: !itemAssignment.active } : itemAssignment),
    } : item));
    setToast({ type: "success", message: `${role.name} fue ${assignment.active ? "desactivado" : "activado"} para ${employee.name}.` });
  }

  function assignRole(employeeId: string, roleId: string) {
    const employee = employees.find((item) => item.id === employeeId);
    const role = roleById.get(roleId);
    if (!employee?.active || !role?.active || employee.roleAssignments.some((assignment) => assignment.roleId === roleId)) return;
    setEmployees((current) => current.map((item) => item.id === employeeId ? {
      ...item,
      roleAssignments: [...item.roleAssignments, { roleId, active: true, assignedAt: new Date().toISOString().slice(0, 10) }],
    } : item));
    setToast({ type: "success", message: `${role.name} fue asignado a ${employee.name}.` });
  }

  function getActiveRoles(employee: Employee) {
    return employee.roleAssignments.filter((assignment) => assignment.active && roleById.get(assignment.roleId)?.active);
  }

  const activeEmployees = employees.filter((employee) => employee.active);
  const systemUsers = employees.filter((employee) => employee.username && employee.active);
  const biweeklyPayroll = activeEmployees.reduce((total, employee) => total + employee.salary / 2, 0);
  const stats = [
    { label: "Empleados activos", value: activeEmployees.length, detail: `${employees.length} registros en total`, icon: "employees" as IconName, color: "bg-primary/10 text-primary" },
    { label: "Roles activos", value: roles.filter((role) => role.active).length, detail: "Perfiles y permisos configurados", icon: "roles" as IconName, color: "bg-accent/15 text-accent" },
    { label: "Usuarios del sistema", value: systemUsers.length, detail: "Empleados activos con credenciales", icon: "users" as IconName, color: "bg-sky-100 text-sky-700" },
    { label: "Base planilla quincenal", value: currencyFormatter.format(biweeklyPayroll), detail: "Salarios antes de deducciones", icon: "wallet" as IconName, color: "bg-emerald-100 text-emerald-700" },
  ];
  const tabs: { id: Tab; label: string; icon: IconName; count: number }[] = [
    { id: "empleados", label: "Empleados", icon: "employees", count: employees.length },
    { id: "roles", label: "Roles y permisos", icon: "roles", count: roles.length },
    { id: "usuarios", label: "Usuarios del sistema", icon: "users", count: employees.filter((employee) => employee.username).length },
  ];

  return (
    <div className="min-h-screen bg-page text-ink lg:flex">
      <aside className="flex w-full flex-col bg-sidebar text-[#F8F0E5] lg:fixed lg:inset-y-0 lg:w-64">
        <div className="border-b border-white/10 px-6 py-7">
          <Link href="/admin" className="flex w-fit items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B58A60] text-white"><Icon name="store" className="h-6 w-6" /></span>
            <span><span className="block text-lg font-bold tracking-wide">ORÍGENES SV</span><span className="block text-xs text-[#C9B7A4]">Sistema de gestión</span></span>
          </Link>
        </div>
        <div className="px-5 py-7">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#A99583]">Menú principal</p>
          <nav aria-label="Módulos principales" className="space-y-2">
            {[
              { href: "/ventas", label: "Ventas", icon: "menu" as IconName, badge: "POS" },
              { href: "/inventario", label: "Inventario", icon: "menu" as IconName, badge: "STOCK" },
              { href: "/compras", label: "Compras", icon: "wallet" as IconName },
              { href: "/admin", label: "Administración", icon: "employees" as IconName, active: true },
            ].map((item) => (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#B58A60] ${item.active ? "bg-[#8B6347] font-medium text-white" : "text-[#C9B7A4] hover:bg-white/10"}`}>
                <Icon name={item.icon} />{item.label}
                {item.badge && <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 text-xs">{item.badge}</span>}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto hidden border-t border-white/10 p-5 lg:block"><p className="text-sm font-medium">Restaurante Orígenes</p><p className="mt-1 text-xs text-[#A99583]">Administración · El Salvador</p></div>
      </aside>

      <section className="min-w-0 flex-1 lg:ml-64">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface px-5 py-5 md:px-8">
          <div><p className="text-sm text-muted">Restaurante Orígenes SV / Configuración</p><h1 className="mt-1 text-2xl font-bold">Administración</h1></div>
          <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-bold">Ana Rodríguez</p><p className="text-xs text-muted">Administradora</p></div><Avatar name="Ana Rodríguez" /></div>
        </header>

        <main className="p-5 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-accent">Personal y seguridad</p>
              <h2 className="mt-2 text-2xl font-bold">Empleados, roles y accesos</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Registrá al personal, definí permisos y controlá los roles asignados a cada usuario.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm font-semibold text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-accent" onClick={() => setRoleFormOpen(true)} type="button"><Icon name="plus" className="h-4 w-4" />Crear rol</button>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#493020] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2" onClick={() => setEmployeeFormOpen(true)} type="button"><Icon name="plus" className="h-4 w-4" />Registrar empleado</button>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900"><Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>Plantilla de demostración:</strong> los datos y cambios se guardan únicamente en memoria y se restablecen al recargar.</p></div>

          <section aria-label="Resumen administrativo" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-ink/55">{stat.label}</p><p className="mt-2 text-2xl font-extrabold text-primary">{stat.value}</p></div><span className={`rounded-xl p-3 ${stat.color}`}><Icon name={stat.icon} /></span></div>
                <p className="mt-3 text-xs font-medium text-ink/45">{stat.detail}</p>
              </article>
            ))}
          </section>

          <div className="mt-8 border-b border-primary/10">
            <div aria-label="Vistas de administración" className="flex gap-1 overflow-x-auto" role="tablist">
              {tabs.map((tab) => (
                <button key={tab.id} aria-selected={activeTab === tab.id} className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent ${activeTab === tab.id ? "border-accent text-primary" : "border-transparent text-ink/45 hover:text-primary"}`} onClick={() => setActiveTab(tab.id)} role="tab" type="button">
                  <Icon name={tab.icon} className="h-4 w-4" />{tab.label}<span className="rounded-full bg-primary/5 px-2 py-0.5 text-xs">{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          {activeTab === "empleados" && (
            <section className="mt-6 overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-primary/10 p-5 xl:flex-row xl:items-center xl:justify-between">
                <div><h2 className="text-lg font-bold text-primary">Directorio de empleados</h2><p className="mt-1 text-sm text-muted">Información laboral y roles asignados.</p></div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(250px,1fr)_170px_150px]">
                  <label className="relative sm:col-span-2 xl:col-span-1"><span className="sr-only">Buscar empleado</span><span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink/35"><Icon name="search" className="h-4 w-4" /></span><input className="w-full rounded-xl border border-primary/15 bg-page/50 py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-ink/35 focus:border-accent focus:ring-2 focus:ring-accent/20" onChange={(event) => setSearch(event.target.value)} placeholder="Nombre, código, cargo o correo" type="search" value={search} /></label>
                  <select aria-label="Filtrar por sucursal" className="rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" onChange={(event) => setBranchFilter(event.target.value)} value={branchFilter}><option value="todas">Todas las sucursales</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select>
                  <select aria-label="Filtrar por estado laboral" className="rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" onChange={(event) => setEmployeeFilter(event.target.value as EmployeeFilter)} value={employeeFilter}><option value="todos">Todos</option><option value="activos">Activos</option><option value="inactivos">Inactivos</option></select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead><tr className="bg-page/70 text-xs font-bold uppercase tracking-wider text-ink/45"><th className="px-6 py-4">Empleado</th><th className="px-4 py-4">Cargo y sucursal</th><th className="px-4 py-4">Ingreso</th><th className="px-4 py-4">Salario mensual</th><th className="px-4 py-4">Roles</th><th className="px-4 py-4">Estado</th><th className="px-6 py-4 text-right">Acción</th></tr></thead>
                  <tbody className="divide-y divide-primary/8">
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="transition hover:bg-page/45">
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><Avatar name={employee.name} /><div><p className="font-bold text-primary">{employee.name}</p><p className="mt-1 text-xs text-ink/45">{employee.code} · {employee.email}</p></div></div></td>
                        <td className="px-4 py-4"><p className="text-sm font-semibold text-ink/70">{employee.position}</p><p className="mt-1 text-xs text-muted">{branches.find((branch) => branch.id === employee.branchId)?.name}</p></td>
                        <td className="px-4 py-4 text-sm text-ink/60">{formatDate(employee.hiredAt)}</td>
                        <td className="px-4 py-4"><p className="text-sm font-bold text-primary">{currencyFormatter.format(employee.salary)}</p><p className="mt-1 text-xs text-emerald-700">{employee.active ? "Incluido en planilla" : "Fuera de planilla"}</p></td>
                        <td className="max-w-64 px-4 py-4"><div className="flex flex-wrap gap-1.5">{employee.roleAssignments.map((assignment) => { const role = roleById.get(assignment.roleId); return role ? <span key={assignment.roleId} className={`rounded-full px-2 py-1 text-xs font-semibold ${assignment.active && role.active ? "bg-primary/8 text-primary" : "bg-stone-100 text-stone-400 line-through"}`}>{role.name}</span> : null; })}{employee.roleAssignments.length === 0 && <span className="text-xs text-muted">Sin roles</span>}</div></td>
                        <td className="px-4 py-4"><StatusBadge active={employee.active} /></td>
                        <td className="px-6 py-4 text-right"><button className="rounded-lg border border-primary/15 px-3 py-2 text-xs font-bold text-primary transition hover:border-accent hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-accent" onClick={() => setSelectedEmployeeId(employee.id)} type="button">Gestionar roles</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEmployees.length === 0 && <div className="px-6 py-16 text-center"><Icon name="search" className="mx-auto h-8 w-8 text-ink/25" /><h3 className="mt-3 font-bold text-primary">No encontramos empleados</h3><p className="mt-1 text-sm text-muted">Prueba con otros filtros o términos de búsqueda.</p></div>}
              </div>
              <div className="border-t border-primary/10 bg-page/35 px-6 py-3 text-xs font-medium text-ink/45">Mostrando {filteredEmployees.length} de {employees.length} empleados</div>
            </section>
          )}

          {activeTab === "roles" && (
            <section className="mt-6">
              <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold text-primary">Perfiles de acceso</h2><p className="mt-1 text-sm text-muted">Cada empleado puede tener varios roles y desactivarlos de forma individual.</p></div>
              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {roles.map((role) => {
                  const assignedCount = employees.filter((employee) => employee.roleAssignments.some((assignment) => assignment.roleId === role.id && assignment.active)).length;
                  return (
                    <article key={role.id} className="flex flex-col rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3"><span className="rounded-xl bg-primary/10 p-3 text-primary"><Icon name="roles" /></span><StatusBadge active={role.active} /></div>
                      <h3 className="mt-4 text-xl font-bold text-primary">{role.name}</h3><p className="mt-2 text-sm leading-6 text-muted">{role.description}</p>
                      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink/40">Permisos</p>
                      <div className="mt-3 flex flex-1 flex-wrap content-start gap-2">{role.permissions.map((permission) => <span key={permission} className="rounded-lg bg-page px-2.5 py-1.5 text-xs font-medium text-ink/65">{permission}</span>)}</div>
                      <div className="mt-5 flex items-center gap-2 border-t border-primary/10 pt-4 text-sm text-ink/55"><Icon name="employees" className="h-4 w-4" /><strong className="text-primary">{assignedCount}</strong> {assignedCount === 1 ? "empleado asignado" : "empleados asignados"}</div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {activeTab === "usuarios" && (
            <section className="mt-6 overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-primary/10 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold text-primary">Usuarios del sistema</h2><p className="mt-1 text-sm text-muted">Consultá credenciales, accesos y vigencia de cada cuenta.</p></div><label className="relative"><span className="sr-only">Buscar usuario</span><span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink/35"><Icon name="search" className="h-4 w-4" /></span><input className="w-full rounded-xl border border-primary/15 bg-page/50 py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-ink/35 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:w-72" onChange={(event) => setUserSearch(event.target.value)} placeholder="Usuario, nombre o correo" type="search" value={userSearch} /></label></div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead><tr className="bg-page/70 text-xs font-bold uppercase tracking-wider text-ink/45"><th className="px-6 py-4">Usuario</th><th className="px-4 py-4">Empleado</th><th className="px-4 py-4">Roles vigentes</th><th className="px-4 py-4">Último acceso</th><th className="px-4 py-4">Acceso</th><th className="px-6 py-4 text-right">Detalle</th></tr></thead>
                  <tbody className="divide-y divide-primary/8">
                    {users.map((employee) => {
                      const activeRoles = getActiveRoles(employee);
                      const enabled = employee.active && activeRoles.length > 0;
                      return (
                        <tr key={employee.id} className="transition hover:bg-page/45">
                          <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="rounded-xl bg-sky-50 p-2.5 text-sky-700"><Icon name="lock" className="h-4 w-4" /></span><div><p className="font-bold text-primary">{employee.username}</p><p className="mt-1 text-xs text-muted">{employee.email}</p></div></div></td>
                          <td className="px-4 py-4"><p className="text-sm font-semibold text-ink/70">{employee.name}</p><p className="mt-1 text-xs text-muted">{employee.code}</p></td>
                          <td className="max-w-56 px-4 py-4 text-sm text-ink/60">{activeRoles.length > 0 ? activeRoles.map((assignment) => roleById.get(assignment.roleId)?.name).filter(Boolean).join(", ") : "Sin roles vigentes"}</td>
                          <td className="px-4 py-4 text-sm text-ink/60">{employee.lastAccess ?? "Sin accesos"}</td>
                          <td className="px-4 py-4"><StatusBadge active={enabled} activeLabel="Habilitado" inactiveLabel="Suspendido" /></td>
                          <td className="px-6 py-4 text-right"><button aria-label={`Ver información de ${employee.username}`} className="inline-flex items-center gap-2 rounded-lg border border-primary/15 px-3 py-2 text-xs font-bold text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-accent" onClick={() => setSelectedUserId(employee.id)} type="button"><Icon name="eye" className="h-4 w-4" />Ver</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {users.length === 0 && <div className="px-6 py-16 text-center"><Icon name="users" className="mx-auto h-8 w-8 text-ink/25" /><h3 className="mt-3 font-bold text-primary">No encontramos usuarios</h3><p className="mt-1 text-sm text-muted">Prueba con otra búsqueda.</p></div>}
              </div>
              <div className="border-t border-primary/10 bg-page/35 px-6 py-3 text-xs font-medium text-ink/45">Las cuentas se suspenden cuando el empleado no está activo o no tiene roles vigentes.</div>
            </section>
          )}
        </main>

        <footer className="border-t border-primary/10 py-6 text-center text-xs font-medium text-ink/40">Orígenes SV · Administración frontend · Datos simulados</footer>

        {employeeFormOpen && <EmployeeFormModal employees={employees} onClose={() => setEmployeeFormOpen(false)} onSave={addEmployee} roles={roles} />}
        {roleFormOpen && <RoleFormModal onClose={() => setRoleFormOpen(false)} onSave={addRole} roles={roles} />}
        {selectedEmployee && <RoleManagerModal employee={selectedEmployee} onAssign={(roleId) => assignRole(selectedEmployee.id, roleId)} onClose={() => setSelectedEmployeeId(null)} onToggle={(roleId) => toggleEmployeeRole(selectedEmployee.id, roleId)} roles={roles} />}
        {selectedUser && (
          <Modal description="Información de la cuenta y del empleado asociado." onClose={() => setSelectedUserId(null)} title="Detalle del usuario">
            <div className="p-6">
              <div className="flex items-center gap-4 rounded-xl bg-page p-4"><Avatar name={selectedUser.name} large /><div><p className="font-bold text-primary">{selectedUser.name}</p><p className="mt-1 text-sm text-muted">@{selectedUser.username}</p></div></div>
              <dl className="mt-5 divide-y divide-primary/8 rounded-xl border border-primary/10">
                {[
                  ["Código de empleado", selectedUser.code],
                  ["Correo", selectedUser.email],
                  ["Teléfono", selectedUser.phone || "No registrado"],
                  ["DUI", selectedUser.dui],
                  ["Cargo", selectedUser.position],
                  ["Sucursal", branches.find((branch) => branch.id === selectedUser.branchId)?.name ?? "No asignada"],
                  ["Último acceso", selectedUser.lastAccess ?? "Sin accesos"],
                ].map(([label, value]) => <div key={label} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:justify-between sm:gap-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/40">{label}</dt><dd className="text-sm font-semibold text-primary sm:text-right">{value}</dd></div>)}
              </dl>
              <div className="mt-5"><p className="text-xs font-bold uppercase tracking-wide text-ink/40">Roles vigentes</p><div className="mt-3 flex flex-wrap gap-2">{getActiveRoles(selectedUser).map((assignment) => <span key={assignment.roleId} className="rounded-lg bg-primary/8 px-3 py-2 text-xs font-semibold text-primary">{roleById.get(assignment.roleId)?.name}</span>)}{getActiveRoles(selectedUser).length === 0 && <p className="text-sm text-muted">Sin roles vigentes</p>}</div></div>
              <button className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent" onClick={() => setSelectedUserId(null)} type="button">Cerrar detalle</button>
            </div>
          </Modal>
        )}
        {toast && <div className={`fixed bottom-5 left-4 right-4 z-[60] flex items-start gap-3 rounded-xl border px-4 py-4 shadow-xl sm:left-auto sm:max-w-md ${toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`} role="status"><Icon name={toast.type === "success" ? "check" : "alert"} className="mt-0.5 h-5 w-5 shrink-0" /><p className="flex-1 text-sm font-semibold leading-6">{toast.message}</p><button aria-label="Cerrar notificación" className="rounded p-0.5 hover:bg-black/5" onClick={() => setToast(null)} type="button"><Icon name="close" className="h-4 w-4" /></button></div>}
      </section>
    </div>
  );
}
