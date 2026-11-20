"use client";

import { useMemo, useState } from "react";
import { Avatar, Icon, Modal, StatusBadge } from "./admin-ui";
import RoleFormModal from "./role-form-modal";
import UserFormModal from "./user-form-modal";
import { actualizarUsuario, actualizarRol, crearRol, crearUsuario } from "@/services/admin.client";
import { nombreDeUsuario } from "@/types/admin";
import type { RolAdmin, UsuarioAdmin } from "@/types/admin";
import type { Empleado } from "@/types/empleado";
import { nombreEmpleado } from "@/types/empleado";

 type Tab = "usuarios" | "roles";
type Filtro = "todos" | "activos" | "inactivos";
type Toast = { type: "success" | "error"; message: string };

type Props = {
  usuarios: UsuarioAdmin[];
  roles: RolAdmin[];
  empleados: Empleado[];
  sucursales: { id: number; nombre: string }[];
};

export default function AdminDashboard({ usuarios: iniciales, roles, empleados, sucursales }: Props) {
  const [usuarios, setUsuarios] = useState(iniciales);
  const [tab, setTab] = useState<Tab>("usuarios");
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [userModal, setUserModal] = useState<UsuarioAdmin | "nuevo" | null>(null);
  const [roleModal, setRoleModal] = useState<RolAdmin | "nuevo" | null>(null);
  const [detalle, setDetalle] = useState<UsuarioAdmin | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const texto = busqueda.trim().toLowerCase();
  const visibles = useMemo(
    () =>
      usuarios.filter((usuario) => {
        const contenido = [
          nombreDeUsuario(usuario),
          usuario.email,
          usuario.rol?.nombre ?? "",
          usuario.sucursal?.nombre ?? "",
        ]
          .join(" ")
          .toLowerCase();
        const pasaFiltro =
          filtro === "todos" || (filtro === "activos" ? usuario.activo : !usuario.activo);
        return contenido.includes(texto) && pasaFiltro;
      }),
    [usuarios, texto, filtro],
  );

  const usuariosPorRol = (rolId: number) => usuarios.filter((usuario) => usuario.rolId === rolId).length;
  const empleadosSinUsuario = empleados.filter(
    (empleado) => !usuarios.some((usuario) => usuario.empleadoId === empleado.id),
  );

  async function alternarActivo(usuario: UsuarioAdmin) {
    try {
      const actualizado = await actualizarUsuario(usuario.id, { activo: !usuario.activo });
      setUsuarios((prev) => prev.map((item) => (item.id === actualizado.id ? actualizado : item)));
      setToast({ type: "success", message: `${actualizado.email} quedó ${actualizado.activo ? "activo" : "inactivo"}.` });
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "No se pudo actualizar el usuario." });
    }
  }

  const kpis = [
    { etiqueta: "Usuarios", valor: usuarios.length },
    { etiqueta: "Activos", valor: usuarios.filter((usuario) => usuario.activo).length },
    { etiqueta: "Roles", valor: roles.length },
    { etiqueta: "Empleados sin usuario", valor: empleadosSinUsuario.length },
  ];

  return (
    <div className="min-h-screen bg-page text-ink">
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-accent">Sistema</p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">Administración</h1>
            <p className="mt-1 text-sm text-muted">Usuarios, roles y acceso al sistema.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRoleModal("nuevo")}
              className="rounded-xl border border-primary/15 bg-white px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-page"
            >
              + Nuevo rol
            </button>
            <button
              type="button"
              onClick={() => setUserModal("nuevo")}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
            >
              + Nuevo usuario
            </button>
          </div>
        </div>

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <article key={kpi.etiqueta} className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{kpi.etiqueta}</p>
              <p className="mt-2 text-2xl font-bold text-primary">{kpi.valor}</p>
            </article>
          ))}
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-primary/15 bg-white p-1">
            {(["usuarios", "roles"] as Tab[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                  tab === item ? "bg-primary text-white" : "text-primary hover:bg-page"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {tab === "usuarios" && (
            <>
              <input
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por nombre, correo, rol o sucursal..."
                className="w-full max-w-sm rounded-full border border-primary/15 bg-white px-5 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <div className="flex gap-2">
                {(["todos", "activos", "inactivos"] as Filtro[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFiltro(item)}
                    className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${
                      filtro === item
                        ? "bg-primary text-white"
                        : "border border-primary/15 bg-white text-primary hover:bg-page"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {tab === "usuarios" ? (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-primary/10 bg-white shadow-sm">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-page/60 text-xs uppercase tracking-wide text-ink/45">
                <tr>
                  <th className="px-5 py-3 font-semibold">Usuario</th>
                  <th className="px-5 py-3 font-semibold">Rol</th>
                  <th className="px-5 py-3 font-semibold">Sucursal</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((usuario) => (
                  <tr key={usuario.id} className="border-t border-primary/8">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={nombreDeUsuario(usuario)} />
                        <div>
                          <p className="font-semibold text-primary">{nombreDeUsuario(usuario)}</p>
                          <p className="text-xs text-ink/50">{usuario.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
                        {usuario.rol?.nombre ?? "Sin rol"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm">{usuario.sucursal?.nombre ?? "—"}</td>
                    <td className="px-5 py-4">
                      <StatusBadge active={usuario.activo} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDetalle(usuario)}
                          className="rounded-lg border border-primary/15 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-page"
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserModal(usuario)}
                          className="rounded-lg border border-primary/15 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-page"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => alternarActivo(usuario)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                            usuario.activo
                              ? "border-red-200 text-red-700 hover:bg-red-50"
                              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {usuario.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visibles.length === 0 && (
              <p className="py-10 text-center text-sm text-ink/40">No hay usuarios que coincidan.</p>
            )}
          </div>
        ) : (
          <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((rol) => (
              <article key={rol.id} className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon name="roles" />
                  </span>
                  <button
                    type="button"
                    onClick={() => setRoleModal(rol)}
                    className="rounded-lg border border-primary/15 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-page"
                  >
                    Editar
                  </button>
                </div>
                <h3 className="mt-4 text-lg font-bold text-primary">{rol.nombre}</h3>
                <p className="mt-1 text-sm text-muted">
                  {usuariosPorRol(rol.id)} usuario{usuariosPorRol(rol.id) === 1 ? "" : "s"} asignado
                  {usuariosPorRol(rol.id) === 1 ? "" : "s"}
                </p>
              </article>
            ))}
          </section>
        )}

        {userModal && (
          <UserFormModal
            usuario={userModal === "nuevo" ? undefined : userModal}
            empleados={empleados}
            sucursales={sucursales}
            roles={roles}
            onClose={() => setUserModal(null)}
            onGuardar={async (datos, id) => {
              if (id) {
                const actualizado = await actualizarUsuario(id, datos);
                setUsuarios((prev) => prev.map((item) => (item.id === id ? actualizado : item)));
                setToast({ type: "success", message: "Usuario actualizado." });
              } else {
                const creado = await crearUsuario(datos);
                setUsuarios((prev) => [...prev, creado]);
                setToast({ type: "success", message: "Usuario creado." });
              }
              setUserModal(null);
            }}
          />
        )}

        {roleModal && (
          <RoleFormModal
            rol={roleModal === "nuevo" ? undefined : roleModal}
            onClose={() => setRoleModal(null)}
            onGuardar={async (nombre, id) => {
              if (id) {
                await actualizarRol(id, nombre);
                setToast({ type: "success", message: "Rol actualizado." });
              } else {
                await crearRol(nombre);
                setToast({ type: "success", message: "Rol creado." });
              }
              setRoleModal(null);
            }}
          />
        )}

        {detalle && (
          <Modal description="Datos de la cuenta y del empleado asociado." onClose={() => setDetalle(null)} title="Detalle del usuario">
            <div className="p-6">
              <div className="flex items-center gap-4 rounded-xl bg-page p-4">
                <Avatar name={nombreDeUsuario(detalle)} large />
                <div>
                  <p className="font-bold text-primary">{nombreDeUsuario(detalle)}</p>
                  <p className="mt-1 text-sm text-muted">{detalle.email}</p>
                </div>
              </div>
              <dl className="mt-5 divide-y divide-primary/8 rounded-xl border border-primary/10">
                {[
                  ["Rol", detalle.rol?.nombre ?? "Sin rol"],
                  ["Sucursal", detalle.sucursal?.nombre ?? "—"],
                  ["Puesto", detalle.empleado?.puesto ?? "—"],
                  ["Estado", detalle.activo ? "Activo" : "Inactivo"],
                ].map(([etiqueta, valor]) => (
                  <div key={etiqueta} className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-xs font-bold uppercase tracking-wide text-ink/40">{etiqueta}</dt>
                    <dd className="text-sm font-semibold text-primary">{valor}</dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                onClick={() => setDetalle(null)}
                className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary/90"
              >
                Cerrar detalle
              </button>
            </div>
          </Modal>
        )}

        {toast && (
          <div
            role="status"
            className={`fixed bottom-5 right-5 z-[60] max-w-md rounded-xl border px-4 py-4 text-sm font-semibold shadow-xl ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            <div className="flex items-start gap-3">
              <Icon name={toast.type === "success" ? "check" : "alert"} className="mt-0.5 h-5 w-5" />
              <p className="flex-1">{toast.message}</p>
              <button type="button" aria-label="Cerrar" onClick={() => setToast(null)}>
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
