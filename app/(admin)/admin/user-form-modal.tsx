"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Modal, inputClassName, primaryButtonClassName, secondaryButtonClassName } from "./admin-ui";
import type { Employee, Role, SystemUser, UserInput } from "./admin-data";

export default function UserFormModal({
  employees,
  roles,
  users,
  onClose,
  onSave,
}: {
  employees: Employee[];
  roles: Role[];
  users: SystemUser[];
  onClose: () => void;
  onSave: (user: UserInput) => void;
}) {
  const availableRoles = roles.filter((role) => role.active);
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  function toggleRole(roleId: string) {
    setSelectedRoleIds((current) => current.includes(roleId) ? current.filter((id) => id !== roleId) : [...current, roleId]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedUsername = username.trim().toLocaleLowerCase("es");
    const normalizedEmail = email.trim().toLocaleLowerCase("es");
    const employee = employees.find((item) => item.id === employeeId);

    if (!employee) {
      setError("Seleccioná un empleado existente.");
      return;
    }
    if (users.some((user) => user.employeeId === employeeId)) {
      setError("El empleado seleccionado ya tiene un usuario asociado.");
      return;
    }
    if (!/^[a-z0-9._-]{3,30}$/.test(normalizedUsername)) {
      setError("El usuario debe tener entre 3 y 30 caracteres: letras, números, puntos, guiones o guion bajo.");
      return;
    }
    if (users.some((user) => user.username.toLocaleLowerCase("es") === normalizedUsername)) {
      setError("Ese nombre de usuario ya está asignado.");
      return;
    }
    if (users.some((user) => user.email.toLocaleLowerCase("es") === normalizedEmail)) {
      setError("El correo electrónico ya está asociado a otro usuario.");
      return;
    }

    onSave({
      employeeId,
      username: normalizedUsername,
      email: normalizedEmail,
      active: true,
      roleAssignments: selectedRoleIds.map((roleId) => ({
        roleId,
        active: true,
        assignedAt: new Date().toISOString().slice(0, 10),
      })),
    });
  }

  const normalizedEmployeeSearch = employeeSearch.trim().toLocaleLowerCase("es");
  const filteredEmployees = employees.filter((employee) =>
    !normalizedEmployeeSearch || `${employee.name} ${employee.position}`.toLocaleLowerCase("es").includes(normalizedEmployeeSearch),
  );

  return (
    <Modal description="Creá las credenciales y asocialas a un empleado registrado en planilla." onClose={onClose} title="Registrar usuario" wide>
      <form className="space-y-6 p-6" onSubmit={handleSubmit}>
        <section>
          <h3 className="text-sm font-bold text-primary">Empleado y credenciales</h3>
          <p className="mt-1 text-xs leading-5 text-muted">Solo aparecen empleados existentes que todavía no tienen un usuario.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-primary sm:col-span-2">
              Buscar empleado
              <input autoFocus className={inputClassName} onChange={(event) => {
                const value = event.target.value;
                const query = value.trim().toLocaleLowerCase("es");
                const firstMatch = employees.find((employee) => !query || `${employee.name} ${employee.position}`.toLocaleLowerCase("es").includes(query));
                setEmployeeSearch(value);
                setEmployeeId(firstMatch?.id ?? "");
              }} placeholder="Escribí el nombre o cargo del empleado" type="search" value={employeeSearch} />
            </label>
            <label className="block text-sm font-semibold text-primary sm:col-span-2">
              Empleado
              <select className={inputClassName} disabled={filteredEmployees.length === 0} onChange={(event) => setEmployeeId(event.target.value)} required value={employeeId}>
                {filteredEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.position}</option>)}
              </select>
              <span className="mt-2 block text-xs font-normal text-muted">
                {filteredEmployees.length > 0 ? `${filteredEmployees.length} de ${employees.length} empleados disponibles.` : "No hay empleados que coincidan con la búsqueda."}
              </span>
            </label>
            <label className="block text-sm font-semibold text-primary">
              Nombre de usuario
              <input className={inputClassName} onChange={(event) => setUsername(event.target.value)} placeholder="Ej. jorge.ramirez" required type="text" value={username} />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Correo electrónico
              <input className={inputClassName} onChange={(event) => setEmail(event.target.value)} placeholder="usuario@origenessv.com" required type="email" value={email} />
            </label>
          </div>
        </section>

        <fieldset className="rounded-2xl border border-primary/10 p-4">
          <legend className="px-2 text-sm font-bold text-primary">Roles asignados</legend>
          <p className="mb-4 text-xs leading-5 text-muted">Podés seleccionar varios roles y desactivarlos individualmente después.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {availableRoles.map((role) => (
              <label key={role.id} className="flex cursor-pointer items-start gap-3 rounded-xl bg-page p-3 text-sm">
                <input checked={selectedRoleIds.includes(role.id)} className="mt-1 h-4 w-4 accent-[#65432f]" onChange={() => toggleRole(role.id)} type="checkbox" />
                <span><span className="block font-bold text-primary">{role.name}</span><span className="mt-1 block text-xs leading-5 text-muted">{role.description}</span></span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-900">
          La contraseña y la autenticación se configurarán cuando se conecte el backend. Los datos laborales del empleado se administran desde planilla.
        </div>
        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">{error}</p>}
        <div className="flex justify-end gap-3 border-t border-primary/10 pt-5">
          <button className={secondaryButtonClassName} onClick={onClose} type="button">Cancelar</button>
          <button className={primaryButtonClassName} disabled={employees.length === 0} type="submit">Registrar usuario</button>
        </div>
      </form>
    </Modal>
  );
}
