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
  const [employeeId, setEmployeeId] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeListOpen, setEmployeeListOpen] = useState(false);
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
    !normalizedEmployeeSearch || employee.name.toLocaleLowerCase("es").includes(normalizedEmployeeSearch),
  );
  const selectedEmployee = employees.find((employee) => employee.id === employeeId);

  return (
    <Modal description="Creá las credenciales y asocialas a un empleado registrado en planilla." onClose={onClose} title="Registrar usuario" wide>
      <form className="space-y-6 p-6" onSubmit={handleSubmit}>
        <section>
          <h3 className="text-sm font-bold text-primary">Empleado y credenciales</h3>
          <p className="mt-1 text-xs leading-5 text-muted">Buscá y seleccioná un empleado existente que todavía no tenga un usuario.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="relative sm:col-span-2" onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setEmployeeListOpen(false);
            }}>
              <label className="block text-sm font-semibold text-primary" htmlFor="employee-search">Buscar y seleccionar empleado</label>
              <input
                aria-autocomplete="list"
                aria-controls="employee-options"
                aria-expanded={employeeListOpen}
                autoComplete="off"
                autoFocus
                className={inputClassName}
                id="employee-search"
                onChange={(event) => {
                  setEmployeeSearch(event.target.value);
                  setEmployeeId("");
                  setEmployeeListOpen(true);
                }}
                onFocus={() => setEmployeeListOpen(true)}
                placeholder="Escribí el nombre del empleado"
                role="combobox"
                type="text"
                value={employeeSearch}
              />
              {employeeListOpen && (
                <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-primary/15 bg-white p-1.5 shadow-xl" id="employee-options" role="listbox">
                  {filteredEmployees.map((employee) => (
                    <button
                      aria-selected={employee.id === employeeId}
                      className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-page focus:bg-page focus:outline-none ${employee.id === employeeId ? "bg-primary/8 font-bold text-primary" : "text-ink/70"}`}
                      key={employee.id}
                      onClick={() => {
                        setEmployeeId(employee.id);
                        setEmployeeSearch(employee.name);
                        setEmployeeListOpen(false);
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      role="option"
                      type="button"
                    >
                      {employee.name}
                    </button>
                  ))}
                  {filteredEmployees.length === 0 && <p className="px-3 py-4 text-center text-sm text-muted">No hay empleados que coincidan con la búsqueda.</p>}
                </div>
              )}
              {selectedEmployee && <p className="mt-2 text-xs font-semibold text-emerald-700">Empleado seleccionado: {selectedEmployee.name}</p>}
            </div>
            <label className="block text-sm font-semibold text-primary sm:col-span-2">
              Cargo del empleado
              <input className={`${inputClassName} cursor-default bg-page text-muted`} placeholder="Se completará al seleccionar un empleado" readOnly tabIndex={-1} type="text" value={selectedEmployee?.position ?? ""} />
              <span className="mt-2 block text-xs font-normal text-muted">Campo informativo; no forma parte de los datos enviados.</span>
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
