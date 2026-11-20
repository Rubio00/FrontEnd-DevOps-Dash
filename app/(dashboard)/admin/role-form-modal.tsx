"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Modal, inputClassName, primaryButtonClassName, secondaryButtonClassName } from "./admin-ui";
import type { RolAdmin } from "@/types/admin";

type Props = {
  rol?: RolAdmin;
  onClose: () => void;
  onGuardar: (nombre: string, id?: number) => Promise<void>;
};

export default function RoleFormModal({ rol, onClose, onGuardar }: Props) {
  const editando = Boolean(rol);
  const [nombre, setNombre] = useState(rol?.nombre ?? "");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await onGuardar(nombre.trim().toLowerCase(), rol?.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el rol.");
      setGuardando(false);
    }
  }

  return (
    <Modal
      title={editando ? "Editar rol" : "Nuevo rol"}
      description="El nombre del rol es el que valida el backend en cada petición."
      onClose={onClose}
    >
      <form onSubmit={guardar} className="space-y-5 p-6">
        <label className="block text-sm font-semibold text-primary">
          Nombre del rol
          <input
            className={inputClassName}
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Ej. gerente"
            minLength={2}
            maxLength={30}
            required
            autoFocus
          />
        </label>

        <p className="rounded-xl bg-page px-4 py-3 text-xs leading-5 text-muted">
          Roles usados por el API: <span className="font-mono">admin</span>, <span className="font-mono">gerente</span>,{" "}
          <span className="font-mono">cajero</span>, <span className="font-mono">barista</span>,{" "}
          <span className="font-mono">compras</span>. Otros nombres se pueden crear, pero no habilitan rutas.
        </p>

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
            {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear rol"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
