"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Modal, inputClassName, primaryButtonClassName, secondaryButtonClassName } from "./admin-ui";
import { permissionOptions } from "./admin-data";
import type { Role, RoleInput } from "./admin-data";

export default function RoleFormModal({ roles, onClose, onSave }: { roles: Role[]; onClose: () => void; onSave: (role: RoleInput) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [error, setError] = useState("");

  function togglePermission(permission: string) {
    setPermissions((current) => current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName || !description.trim()) {
      setError("Completá el nombre y la descripción del rol.");
      return;
    }
    if (roles.some((role) => role.name.toLocaleLowerCase("es") === normalizedName.toLocaleLowerCase("es"))) {
      setError("Ya existe un rol con ese nombre.");
      return;
    }
    if (permissions.length === 0) {
      setError("Seleccioná al menos un permiso para el rol.");
      return;
    }
    onSave({ name: normalizedName, description: description.trim(), permissions });
  }

  return (
    <Modal description="Definí los permisos que recibirán los empleados con este rol." onClose={onClose} title="Crear nuevo rol" wide>
      <form className="space-y-5 p-6" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-primary">
            Nombre del rol
            <input autoFocus className={inputClassName} onChange={(event) => setName(event.target.value)} placeholder="Ej. Encargado de compras" required type="text" value={name} />
          </label>
          <label className="block text-sm font-semibold text-primary sm:col-span-1">
            Descripción
            <input className={inputClassName} onChange={(event) => setDescription(event.target.value)} placeholder="Resumen de responsabilidades" required type="text" value={description} />
          </label>
        </div>
        <fieldset className="rounded-2xl border border-primary/10 p-4">
          <legend className="px-2 text-sm font-bold text-primary">Permisos del sistema</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {permissionOptions.map((permission) => (
              <label key={permission} className="flex cursor-pointer items-center gap-3 rounded-xl bg-page p-3 text-sm font-medium text-ink/70">
                <input checked={permissions.includes(permission)} className="h-4 w-4 accent-[#65432f]" onChange={() => togglePermission(permission)} type="checkbox" />
                {permission}
              </label>
            ))}
          </div>
        </fieldset>
        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">{error}</p>}
        <div className="flex justify-end gap-3 border-t border-primary/10 pt-5">
          <button className={secondaryButtonClassName} onClick={onClose} type="button">Cancelar</button>
          <button className={primaryButtonClassName} type="submit">Crear rol</button>
        </div>
      </form>
    </Modal>
  );
}
