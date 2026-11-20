"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Modal, inputClassName, primaryButtonClassName, secondaryButtonClassName } from "./admin-ui";
import { branches } from "./admin-data";
import type { Employee, EmployeeInput, Role } from "./admin-data";

export default function EmployeeFormModal({
  employees,
  roles,
  onClose,
  onSave,
}: {
  employees: Employee[];
  roles: Role[];
  onClose: () => void;
  onSave: (employee: EmployeeInput) => void;
}) {
  const availableRoles = roles.filter((role) => role.active);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dui, setDui] = useState("");
  const [position, setPosition] = useState("");
  const [branchId, setBranchId] = useState(branches[0].id);
  const [salary, setSalary] = useState("");
  const [hiredAt, setHiredAt] = useState(new Date().toISOString().slice(0, 10));
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [systemAccess, setSystemAccess] = useState(true);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  function toggleRole(roleId: string) {
    setSelectedRoleIds((current) => current.includes(roleId) ? current.filter((id) => id !== roleId) : [...current, roleId]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLocaleLowerCase("es");
    const normalizedDui = dui.trim();
    const normalizedUsername = username.trim().toLocaleLowerCase("es");
    const numericSalary = Number(salary);

    if (!normalizedName || !normalizedEmail || !position.trim() || !hiredAt) {
      setError("Completá todos los datos generales del empleado.");
      return;
    }
    if (!/^\d{8}-\d$/.test(normalizedDui)) {
      setError("Ingresá el DUI con el formato 00000000-0.");
      return;
    }
    if (employees.some((employee) => employee.dui === normalizedDui)) {
      setError("Ya existe un empleado registrado con ese DUI.");
      return;
    }
    if (employees.some((employee) => employee.email.toLocaleLowerCase("es") === normalizedEmail)) {
      setError("El correo electrónico ya está registrado.");
      return;
    }
    if (!Number.isFinite(numericSalary) || numericSalary <= 0) {
      setError("Ingresá un salario mensual mayor que cero.");
      return;
    }
    if (systemAccess && !/^[a-z0-9._-]{3,30}$/.test(normalizedUsername)) {
      setError("El usuario debe tener entre 3 y 30 caracteres: letras, números, puntos, guiones o guion bajo.");
      return;
    }
    if (systemAccess && employees.some((employee) => employee.username?.toLocaleLowerCase("es") === normalizedUsername)) {
      setError("Ese nombre de usuario ya está asignado.");
      return;
    }

    onSave({
      name: normalizedName,
      email: normalizedEmail,
      phone: phone.trim(),
      dui: normalizedDui,
      position: position.trim(),
      branchId,
      salary: numericSalary,
      hiredAt,
      active: true,
      roleAssignments: selectedRoleIds.map((roleId) => ({ roleId, active: true, assignedAt: hiredAt })),
      username: systemAccess ? normalizedUsername : null,
    });
  }

  return (
    <Modal description="Registrá los datos laborales, los roles y el acceso al sistema." onClose={onClose} title="Registrar empleado" wide>
      <form className="space-y-6 p-6" onSubmit={handleSubmit}>
        <section>
          <h3 className="text-sm font-bold text-primary">Información personal y laboral</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-primary sm:col-span-2">
              Nombre completo
              <input autoFocus className={inputClassName} onChange={(event) => setName(event.target.value)} placeholder="Ej. María José García" required type="text" value={name} />
            </label>
            <label className="block text-sm font-semibold text-primary">
              DUI
              <input className={inputClassName} onChange={(event) => setDui(event.target.value)} placeholder="00000000-0" required type="text" value={dui} />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Teléfono
              <input className={inputClassName} onChange={(event) => setPhone(event.target.value)} placeholder="0000-0000" type="tel" value={phone} />
            </label>
            <label className="block text-sm font-semibold text-primary sm:col-span-2">
              Correo electrónico
              <input className={inputClassName} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@origenessv.com" required type="email" value={email} />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Cargo
              <input className={inputClassName} onChange={(event) => setPosition(event.target.value)} placeholder="Ej. Barista" required type="text" value={position} />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Sucursal
              <select className={inputClassName} onChange={(event) => setBranchId(event.target.value)} value={branchId}>
                {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-primary">
              Salario mensual (USD)
              <input className={inputClassName} min="0.01" onChange={(event) => setSalary(event.target.value)} placeholder="0.00" required step="0.01" type="number" value={salary} />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Fecha de ingreso
              <input className={inputClassName} max={new Date().toISOString().slice(0, 10)} onChange={(event) => setHiredAt(event.target.value)} required type="date" value={hiredAt} />
            </label>
          </div>
        </section>

        <fieldset className="rounded-2xl border border-primary/10 p-4">
          <legend className="px-2 text-sm font-bold text-primary">Roles asignados</legend>
          <p className="mb-4 text-xs leading-5 text-muted">Podés seleccionar varios roles. Después será posible desactivarlos individualmente.</p>
          {availableRoles.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {availableRoles.map((role) => (
                <label key={role.id} className="flex cursor-pointer items-start gap-3 rounded-xl bg-page p-3 text-sm">
                  <input checked={selectedRoleIds.includes(role.id)} className="mt-1 h-4 w-4 accent-[#65432f]" onChange={() => toggleRole(role.id)} type="checkbox" />
                  <span><span className="block font-bold text-primary">{role.name}</span><span className="mt-1 block text-xs leading-5 text-muted">{role.description}</span></span>
                </label>
              ))}
            </div>
          ) : <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">No hay roles activos. Primero creá un rol.</p>}
        </fieldset>

        <section className="rounded-2xl bg-page p-4">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-primary">
            <input checked={systemAccess} className="h-4 w-4 accent-[#65432f]" onChange={(event) => setSystemAccess(event.target.checked)} type="checkbox" />
            Crear usuario para acceder al sistema
          </label>
          {systemAccess && (
            <label className="mt-4 block text-sm font-semibold text-primary">
              Nombre de usuario
              <input className={inputClassName} onChange={(event) => setUsername(event.target.value)} placeholder="Ej. maria.garcia" required={systemAccess} type="text" value={username} />
              <span className="mt-2 block text-xs font-normal leading-5 text-muted">La contraseña y la autenticación se configurarán cuando se conecte el backend.</span>
            </label>
          )}
        </section>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-900">
          El empleado quedará activo y su salario mensual servirá como base para la futura planilla quincenal.
        </div>
        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">{error}</p>}
        <div className="flex justify-end gap-3 border-t border-primary/10 pt-5">
          <button className={secondaryButtonClassName} onClick={onClose} type="button">Cancelar</button>
          <button className={primaryButtonClassName} type="submit">Registrar empleado</button>
        </div>
      </form>
    </Modal>
  );
}
