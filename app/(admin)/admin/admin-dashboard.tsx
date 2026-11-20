"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar, Icon, Modal, StatusBadge } from "./admin-ui";
import type { IconName } from "./admin-ui";
import RoleFormModal from "./role-form-modal";
import UserFormModal from "./user-form-modal";
import { existingEmployees, initialRoles, initialUsers } from "./admin-data";
import type { Employee, Role, RoleInput, SystemUser, UserInput } from "./admin-data";

type Tab = "usuarios" | "roles";
type AccessFilter = "todos" | "habilitados" | "suspendidos";
type Toast = { type: "success" | "error"; message: string };

const dateFormatter = new Intl.DateTimeFormat("es-SV", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

function RoleManagerModal({
  user,
  employee,
  roles,
  onClose,
  onToggle,
  onAssign,
}: {
  user: SystemUser;
  employee: Employee;
  roles: Role[];
  onClose: () => void;
  onToggle: (roleId: string) => void;
  onAssign: (roleId: string) => void;
}) {
  const assignedIds = user.roleAssignments.map((assignment) => assignment.roleId);
  const availableRoles = roles.filter((role) => role.active && !assignedIds.includes(role.id));
  const [roleToAssign, setRoleToAssign] = useState(availableRoles[0]?.id ?? "");
  const selectedRoleId = availableRoles.some((role) => role.id === roleToAssign) ? roleToAssign : availableRoles[0]?.id ?? "";

  return (
    <Modal description="Activá o desactivá cada rol sin eliminar su historial de asignación." onClose={onClose} title={`Roles de ${employee.name}`} wide>
      <div className="space-y-5 p-6">
        <div className="flex items-center gap-4 rounded-xl bg-page p-4">
          <Avatar name={employee.name} large />
          <div><p className="font-bold text-primary">{employee.name}</p><p className="mt-1 text-sm text-muted">{employee.position} · @{user.username}</p></div>
          <div className="ml-auto"><StatusBadge active={user.active} activeLabel="Usuario activo" inactiveLabel="Usuario inactivo" /></div>
        </div>

        <div className="space-y-3">
          {user.roleAssignments.map((assignment) => {
            const role = roles.find((item) => item.id === assignment.roleId);
            if (!role) return null;
            const canActivate = user.active && role.active;
            return (
              <article key={assignment.roleId} className="flex flex-col gap-4 rounded-xl border border-primary/10 p-4 sm:flex-row sm:items-center">
                <span className={`rounded-xl p-3 ${assignment.active ? "bg-primary/10 text-primary" : "bg-stone-100 text-stone-500"}`}><Icon name="roles" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-primary">{role.name}</h3><StatusBadge active={assignment.active} /></div>
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
          {user.roleAssignments.length === 0 && <p className="rounded-xl bg-page px-4 py-8 text-center text-sm text-muted">Este usuario todavía no tiene roles asignados.</p>}
        </div>

        <section className="rounded-xl border border-dashed border-primary/20 p-4">
          <h3 className="text-sm font-bold text-primary">Asignar otro rol</h3>
          {user.active ? (
            availableRoles.length > 0 ? (
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <select aria-label="Rol por asignar" className="min-w-0 flex-1 rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" onChange={(event) => setRoleToAssign(event.target.value)} value={selectedRoleId}>
                  {availableRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
                <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent" onClick={() => onAssign(selectedRoleId)} type="button">Asignar rol</button>
              </div>
            ) : <p className="mt-2 text-sm text-muted">No hay más roles activos disponibles para asignar.</p>
          ) : <p className="mt-2 text-sm text-amber-700">Un usuario inactivo no puede recibir nuevos roles.</p>}
        </section>
      </div>
    </Modal>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState(initialUsers);
  const [roles, setRoles] = useState(initialRoles);
  const [activeTab, setActiveTab] = useState<Tab>("usuarios");
  const [search, setSearch] = useState("");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("todos");
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [roleFormOpen, setRoleFormOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const roleById = useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles]);
  const employeeById = useMemo(() => new Map(existingEmployees.map((employee) => [employee.id, employee])), []);
  const selectedUser = users.find((user) => user.id === selectedUserId);
  const detailUser = users.find((user) => user.id === detailUserId);
  const employeesWithoutUser = existingEmployees.filter((employee) => !users.some((user) => user.employeeId === employee.id));

  function getActiveRoles(user: SystemUser) {
    return user.roleAssignments.filter((assignment) => assignment.active && roleById.get(assignment.roleId)?.active);
  }

  function hasAccess(user: SystemUser) {
    return user.active && getActiveRoles(user).length > 0;
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");
    return users.filter((user) => {
      const employee = employeeById.get(user.employeeId);
      const matchesSearch = !query || [user.username, user.email, employee?.name ?? "", employee?.position ?? ""].some((value) => value.toLocaleLowerCase("es").includes(query));
      const enabled = user.active && user.roleAssignments.some((assignment) => assignment.active && roleById.get(assignment.roleId)?.active);
      const matchesAccess = accessFilter === "todos" || (accessFilter === "habilitados" ? enabled : !enabled);
      return matchesSearch && matchesAccess;
    });
  }, [accessFilter, employeeById, roleById, search, users]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function addUser(input: UserInput) {
    const user: SystemUser = { ...input, id: `user-${Date.now()}`, lastAccess: null };
    const employee = employeeById.get(user.employeeId);
    setUsers((current) => [...current, user]);
    setUserFormOpen(false);
    setActiveTab("usuarios");
    setSearch("");
    setAccessFilter("todos");
    setToast({ type: "success", message: `El usuario @${user.username} quedó relacionado con ${employee?.name ?? "el empleado seleccionado"}.` });
  }

  function addRole(input: RoleInput) {
    const baseId = input.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const role: Role = { ...input, id: `${baseId || "rol"}-${Date.now()}`, active: true };
    setRoles((current) => [...current, role]);
    setRoleFormOpen(false);
    setActiveTab("roles");
    setToast({ type: "success", message: `El rol ${role.name} fue creado con ${role.permissions.length} permisos.` });
  }

  function toggleUserRole(userId: string, roleId: string) {
    const user = users.find((item) => item.id === userId);
    const assignment = user?.roleAssignments.find((item) => item.roleId === roleId);
    const role = roleById.get(roleId);
    const employee = user ? employeeById.get(user.employeeId) : undefined;
    if (!user || !assignment || !role) return;
    if (!assignment.active && (!user.active || !role.active)) {
      setToast({ type: "error", message: "No se puede activar un rol si el usuario o el rol están inactivos." });
      return;
    }
    setUsers((current) => current.map((item) => item.id === userId ? {
      ...item,
      roleAssignments: item.roleAssignments.map((itemAssignment) => itemAssignment.roleId === roleId ? { ...itemAssignment, active: !itemAssignment.active } : itemAssignment),
    } : item));
    setToast({ type: "success", message: `${role.name} fue ${assignment.active ? "desactivado" : "activado"} para ${employee?.name ?? `@${user.username}`}.` });
  }

  function assignRole(userId: string, roleId: string) {
    const user = users.find((item) => item.id === userId);
    const role = roleById.get(roleId);
    const employee = user ? employeeById.get(user.employeeId) : undefined;
    if (!user?.active || !role?.active || user.roleAssignments.some((assignment) => assignment.roleId === roleId)) return;
    setUsers((current) => current.map((item) => item.id === userId ? {
      ...item,
      roleAssignments: [...item.roleAssignments, { roleId, active: true, assignedAt: new Date().toISOString().slice(0, 10) }],
    } : item));
    setToast({ type: "success", message: `${role.name} fue asignado a ${employee?.name ?? `@${user.username}`}.` });
  }

  const stats = [
    { label: "Usuarios activos", value: users.filter((user) => user.active).length, detail: `${users.length} cuentas registradas`, icon: "users" as IconName, color: "bg-primary/10 text-primary" },
    { label: "Roles activos", value: roles.filter((role) => role.active).length, detail: "Perfiles y permisos configurados", icon: "roles" as IconName, color: "bg-accent/15 text-accent" },
    { label: "Empleados con usuario", value: users.length, detail: `De ${existingEmployees.length} empleados existentes`, icon: "employees" as IconName, color: "bg-sky-100 text-sky-700" },
    { label: "Empleados sin usuario", value: employeesWithoutUser.length, detail: "Disponibles para crear una cuenta", icon: "plus" as IconName, color: "bg-emerald-100 text-emerald-700" },
  ];

  return (
    <div className="min-h-screen bg-page text-ink lg:flex">
      <aside className="flex w-full flex-col bg-sidebar text-[#F8F0E5] lg:fixed lg:inset-y-0 lg:w-64">
        <div className="border-b border-white/10 px-6 py-7">
          <Link href="/admin" className="flex w-fit items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B58A60] text-white"><Icon name="store" className="h-6 w-6" /></span><span><span className="block text-lg font-bold tracking-wide">ORÍGENES SV</span><span className="block text-xs text-[#C9B7A4]">Sistema de gestión</span></span></Link>
        </div>
        <div className="px-5 py-7">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#A99583]">Menú principal</p>
          <nav aria-label="Módulos principales" className="space-y-2">
            {[
              { href: "/ventas", label: "Ventas", icon: "menu" as IconName, badge: "POS" },
              { href: "/inventario", label: "Inventario", icon: "menu" as IconName, badge: "STOCK" },
              { href: "/compras", label: "Compras", icon: "wallet" as IconName },
              { href: "/admin", label: "Administración", icon: "users" as IconName, active: true },
            ].map((item) => (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#B58A60] ${item.active ? "bg-[#8B6347] font-medium text-white" : "text-[#C9B7A4] hover:bg-white/10"}`}><Icon name={item.icon} />{item.label}{item.badge && <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 text-xs">{item.badge}</span>}</Link>
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
            <div><p className="text-sm font-medium uppercase tracking-widest text-accent">Usuarios y seguridad</p><h2 className="mt-2 text-2xl font-bold">Accesos, roles y permisos</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Creá usuarios para empleados existentes y administrá los permisos asociados a cada cuenta.</p></div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm font-semibold text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-accent" onClick={() => setRoleFormOpen(true)} type="button"><Icon name="plus" className="h-4 w-4" />Crear rol</button>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#493020] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={employeesWithoutUser.length === 0} onClick={() => setUserFormOpen(true)} title={employeesWithoutUser.length === 0 ? "Todos los empleados ya tienen usuario" : undefined} type="button"><Icon name="plus" className="h-4 w-4" />Registrar usuario</button>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900"><Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>Plantilla de demostración:</strong> los empleados provienen de datos locales de planilla. Los usuarios y cambios se guardan únicamente en memoria.</p></div>

          <section aria-label="Resumen administrativo" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => <article key={stat.label} className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-ink/55">{stat.label}</p><p className="mt-2 text-3xl font-extrabold text-primary">{stat.value}</p></div><span className={`rounded-xl p-3 ${stat.color}`}><Icon name={stat.icon} /></span></div><p className="mt-3 text-xs font-medium text-ink/45">{stat.detail}</p></article>)}
          </section>

          <div className="mt-8 border-b border-primary/10">
            <div aria-label="Vistas de administración" className="flex gap-1 overflow-x-auto" role="tablist">
              {[{ id: "usuarios" as Tab, label: "Usuarios del sistema", icon: "users" as IconName, count: users.length }, { id: "roles" as Tab, label: "Roles y permisos", icon: "roles" as IconName, count: roles.length }].map((tab) => (
                <button key={tab.id} aria-selected={activeTab === tab.id} className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent ${activeTab === tab.id ? "border-accent text-primary" : "border-transparent text-ink/45 hover:text-primary"}`} onClick={() => setActiveTab(tab.id)} role="tab" type="button"><Icon name={tab.icon} className="h-4 w-4" />{tab.label}<span className="rounded-full bg-primary/5 px-2 py-0.5 text-xs">{tab.count}</span></button>
              ))}
            </div>
          </div>

          {activeTab === "usuarios" && (
            <section className="mt-6 overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-primary/10 p-5 xl:flex-row xl:items-center xl:justify-between">
                <div><h2 className="text-lg font-bold text-primary">Usuarios y empleados relacionados</h2><p className="mt-1 text-sm text-muted">Cada cuenta está vinculada a un único empleado existente.</p></div>
                <div className="grid gap-3 sm:grid-cols-[minmax(260px,1fr)_170px]">
                  <label className="relative"><span className="sr-only">Buscar usuario</span><span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink/35"><Icon name="search" className="h-4 w-4" /></span><input className="w-full rounded-xl border border-primary/15 bg-page/50 py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-ink/35 focus:border-accent focus:ring-2 focus:ring-accent/20" onChange={(event) => setSearch(event.target.value)} placeholder="Usuario, empleado, cargo o correo" type="search" value={search} /></label>
                  <select aria-label="Filtrar por acceso" className="rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" onChange={(event) => setAccessFilter(event.target.value as AccessFilter)} value={accessFilter}><option value="todos">Todos los accesos</option><option value="habilitados">Habilitados</option><option value="suspendidos">Suspendidos</option></select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead><tr className="bg-page/70 text-xs font-bold uppercase tracking-wider text-ink/45"><th className="px-6 py-4">Empleado</th><th className="px-4 py-4">Usuario</th><th className="px-4 py-4">Roles vigentes</th><th className="px-4 py-4">Último acceso</th><th className="px-4 py-4">Acceso</th><th className="px-6 py-4 text-right">Acciones</th></tr></thead>
                  <tbody className="divide-y divide-primary/8">
                    {filteredUsers.map((user) => {
                      const employee = employeeById.get(user.employeeId);
                      if (!employee) return null;
                      return (
                        <tr key={user.id} className="transition hover:bg-page/45">
                          <td className="px-6 py-4"><div className="flex items-center gap-3"><Avatar name={employee.name} /><div><p className="font-bold text-primary">{employee.name}</p><p className="mt-1 text-xs text-muted">{employee.position}</p></div></div></td>
                          <td className="px-4 py-4"><p className="text-sm font-bold text-primary">@{user.username}</p><p className="mt-1 text-xs text-muted">{user.email}</p></td>
                          <td className="max-w-64 px-4 py-4"><div className="flex flex-wrap gap-1.5">{user.roleAssignments.map((assignment) => { const role = roleById.get(assignment.roleId); return role ? <span key={assignment.roleId} className={`rounded-full px-2 py-1 text-xs font-semibold ${assignment.active && role.active ? "bg-primary/8 text-primary" : "bg-stone-100 text-stone-400 line-through"}`}>{role.name}</span> : null; })}{user.roleAssignments.length === 0 && <span className="text-xs text-muted">Sin roles</span>}</div></td>
                          <td className="px-4 py-4 text-sm text-ink/60">{user.lastAccess ?? "Sin accesos"}</td>
                          <td className="px-4 py-4"><StatusBadge active={hasAccess(user)} activeLabel="Habilitado" inactiveLabel="Suspendido" /></td>
                          <td className="px-6 py-4"><div className="flex justify-end gap-2"><button aria-label={`Ver información de ${user.username}`} className="inline-flex items-center gap-2 rounded-lg border border-primary/15 px-3 py-2 text-xs font-bold text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-accent" onClick={() => setDetailUserId(user.id)} type="button"><Icon name="eye" className="h-4 w-4" />Ver</button><button className="rounded-lg border border-primary/15 px-3 py-2 text-xs font-bold text-primary transition hover:border-accent hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-accent" onClick={() => setSelectedUserId(user.id)} type="button">Gestionar roles</button></div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <div className="px-6 py-16 text-center"><Icon name="search" className="mx-auto h-8 w-8 text-ink/25" /><h3 className="mt-3 font-bold text-primary">No encontramos usuarios</h3><p className="mt-1 text-sm text-muted">Prueba con otros filtros o términos de búsqueda.</p></div>}
              </div>
              <div className="border-t border-primary/10 bg-page/35 px-6 py-3 text-xs font-medium text-ink/45">Mostrando {filteredUsers.length} de {users.length} usuarios · Las cuentas sin roles vigentes quedan suspendidas.</div>
            </section>
          )}

          {activeTab === "roles" && (
            <section className="mt-6">
              <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold text-primary">Perfiles de acceso</h2><p className="mt-1 text-sm text-muted">Cada usuario puede tener varios roles y desactivarlos de forma individual.</p></div>
              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {roles.map((role) => {
                  const assignedCount = users.filter((user) => user.roleAssignments.some((assignment) => assignment.roleId === role.id && assignment.active)).length;
                  return (
                    <article key={role.id} className="flex flex-col rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3"><span className="rounded-xl bg-primary/10 p-3 text-primary"><Icon name="roles" /></span><StatusBadge active={role.active} /></div>
                      <h3 className="mt-4 text-xl font-bold text-primary">{role.name}</h3><p className="mt-2 text-sm leading-6 text-muted">{role.description}</p>
                      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink/40">Permisos</p>
                      <div className="mt-3 flex flex-1 flex-wrap content-start gap-2">{role.permissions.map((permission) => <span key={permission} className="rounded-lg bg-page px-2.5 py-1.5 text-xs font-medium text-ink/65">{permission}</span>)}</div>
                      <div className="mt-5 flex items-center gap-2 border-t border-primary/10 pt-4 text-sm text-ink/55"><Icon name="users" className="h-4 w-4" /><strong className="text-primary">{assignedCount}</strong> {assignedCount === 1 ? "usuario asignado" : "usuarios asignados"}</div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </main>

        <footer className="border-t border-primary/10 py-6 text-center text-xs font-medium text-ink/40">Orígenes SV · Administración frontend · Datos simulados</footer>

        {userFormOpen && <UserFormModal employees={employeesWithoutUser} onClose={() => setUserFormOpen(false)} onSave={addUser} roles={roles} users={users} />}
        {roleFormOpen && <RoleFormModal onClose={() => setRoleFormOpen(false)} onSave={addRole} roles={roles} />}
        {selectedUser && employeeById.get(selectedUser.employeeId) && <RoleManagerModal employee={employeeById.get(selectedUser.employeeId)!} onAssign={(roleId) => assignRole(selectedUser.id, roleId)} onClose={() => setSelectedUserId(null)} onToggle={(roleId) => toggleUserRole(selectedUser.id, roleId)} roles={roles} user={selectedUser} />}
        {detailUser && employeeById.get(detailUser.employeeId) && (
          <Modal description="Cuenta del sistema y datos básicos del empleado relacionado." onClose={() => setDetailUserId(null)} title="Detalle del usuario">
            <div className="p-6">
              <div className="flex items-center gap-4 rounded-xl bg-page p-4"><Avatar name={employeeById.get(detailUser.employeeId)!.name} large /><div><p className="font-bold text-primary">{employeeById.get(detailUser.employeeId)!.name}</p><p className="mt-1 text-sm text-muted">{employeeById.get(detailUser.employeeId)!.position}</p></div></div>
              <dl className="mt-5 divide-y divide-primary/8 rounded-xl border border-primary/10">
                {[["Usuario", `@${detailUser.username}`], ["Correo", detailUser.email], ["Último acceso", detailUser.lastAccess ?? "Sin accesos"]].map(([label, value]) => <div key={label} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:justify-between sm:gap-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/40">{label}</dt><dd className="text-sm font-semibold text-primary sm:text-right">{value}</dd></div>)}
              </dl>
              <div className="mt-5"><p className="text-xs font-bold uppercase tracking-wide text-ink/40">Roles vigentes</p><div className="mt-3 flex flex-wrap gap-2">{getActiveRoles(detailUser).map((assignment) => <span key={assignment.roleId} className="rounded-lg bg-primary/8 px-3 py-2 text-xs font-semibold text-primary">{roleById.get(assignment.roleId)?.name}</span>)}{getActiveRoles(detailUser).length === 0 && <p className="text-sm text-muted">Sin roles vigentes</p>}</div></div>
              <button className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent" onClick={() => setDetailUserId(null)} type="button">Cerrar detalle</button>
            </div>
          </Modal>
        )}
        {toast && <div className={`fixed bottom-5 left-4 right-4 z-[60] flex items-start gap-3 rounded-xl border px-4 py-4 shadow-xl sm:left-auto sm:max-w-md ${toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`} role="status"><Icon name={toast.type === "success" ? "check" : "alert"} className="mt-0.5 h-5 w-5 shrink-0" /><p className="flex-1 text-sm font-semibold leading-6">{toast.message}</p><button aria-label="Cerrar notificación" className="rounded p-0.5 hover:bg-black/5" onClick={() => setToast(null)} type="button"><Icon name="close" className="h-4 w-4" /></button></div>}
      </section>
    </div>
  );
}
