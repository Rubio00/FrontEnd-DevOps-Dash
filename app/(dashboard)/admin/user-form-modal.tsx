"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Modal, inputClassName, primaryButtonClassName, secondaryButtonClassName } from "./admin-ui";
import type { DatosUsuario, RolAdmin, UsuarioAdmin } from "@/types/admin";
import type { Empleado } from "@/types/empleado";
import { nombreEmpleado } from "@/types/empleado";

type Props = {
  usuario?: UsuarioAdmin;
  empleados: Empleado[];
  sucursales: { id: number; nombre: string }[];
  roles: RolAdmin[];
  onClose: () => void;
  onGuardar: (datos: DatosUsuario, id?: number) => Promise<void>;
};

export default function UserFormModal({ usuario, empleados, sucursales, roles, onClose, onGuardar }: Props) {
  const editando = Boolean(usuario);
  const [empleadoId, setEmpleadoId] = useState<number | "">(usuario?.empleadoId ?? "");
  const [sucursalId, setSucursalId] = useState<number | "">(usuario?.sucursalId ?? sucursales[0]?.id ?? "");
  const [rolId, setRolId] = useState<number | "">(usuario?.rolId ?? roles[0]?.id ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [password, setPassword] = useState("");
  const [activo, setActivo] = useState(usuario?.activo ?? true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await onGuardar(
        {
          empleadoId: empleadoId === "" ? null : Number(empleadoId),
          sucursalId: Number(sucursalId),
          rolId: Number(rolId),
          email: email.trim().toLowerCase(),
          ...(password ? { password } : {}),
          activo,
        },
        usuario?.id,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el usuario.");
      setGuardando(false);
    }
  }

  return (
    <Modal
      title={editando ? "Editar usuario" : "Nuevo usuario"}
      description={editando ? "Actualizá los datos de acceso y el rol." : "Vinculá un empleado, asignale un rol y definí su contraseña."}
      onClose={onClose}
      wide
    >
      <form onSubmit={guardar} className="space-y-5 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-primary sm:col-span-2">
            Empleado
            <select className={inputClassName} value={empleadoId} onChange={(event) => setEmpleadoId(event.target.value === "" ? "" : Number(event.target.value))}>
              <option value="">Sin empleado vinculado</option>
              {empleados.map((empleado) => (
                <option key={empleado.id} value={empleado.id}>
                  {nombreEmpleado(empleado)} · {empleado.puesto}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-primary">
            Sucursal
            <select className={inputClassName} value={sucursalId} onChange={(event) => setSucursalId(Number(event.target.value))} required>
              {sucursales.map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-primary">
            Rol
            <select className={inputClassName} value={rolId} onChange={(event) => setRolId(Number(event.target.value))} required>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-primary sm:col-span-2">
            Correo electrónico
            <input className={inputClassName} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          <label className="block text-sm font-semibold text-primary sm:col-span-2">
            {editando ? "Nueva contraseña (opcional)" : "Contraseña"}
            <input
              className={inputClassName}
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required={!editando}
              placeholder="Mínimo 6 caracteres"
            />
          </label>

          <label className="flex items-center gap-3 text-sm font-semibold text-primary sm:col-span-2">
            <input type="checkbox" checked={activo} onChange={(event) => setActivo(event.target.checked)} className="h-4 w-4 rounded border-primary/30" />
            Usuario activo
          </label>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-primary/10 pt-5">
          <button type="button" onClick={onClose} className={secondaryButtonClassName}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className={`${primaryButtonClassName} disabled:opacity-60`}>
            {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
