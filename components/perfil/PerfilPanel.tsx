"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { etiquetasRol } from "@/types/auth";
import type { UsuarioSesion } from "@/types/auth";

type Props = {
  usuario: UsuarioSesion;
  sucursalDireccion: string | null;
};

export default function PerfilPanel({ usuario, sucursalDireccion }: Props) {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  async function cerrarSesion() {
    setSaliendo(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  const datos: [string, string][] = [
    ["Correo", usuario.email],
    ["Cargo", usuario.cargo],
    ["Rol", etiquetasRol[usuario.rol]],
    ["Sucursal", usuario.sucursal ?? "Sin sucursal"],
    ["Dirección de la sucursal", sucursalDireccion || "—"],
  ];

  return (
    <>
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-accent">Mi cuenta</p>
        <h2 className="mt-2 text-2xl font-bold">Perfil</h2>
        <p className="mt-1 text-sm text-muted">Datos que la API devuelve para tu sesión.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="h-fit rounded-2xl border border-primary/10 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            {usuario.iniciales}
          </div>
          <h3 className="mt-4 text-xl font-bold text-primary">{usuario.nombre}</h3>
          <span className="mt-2 inline-block rounded-full bg-accent/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
            {etiquetasRol[usuario.rol]}
          </span>

          <dl className="mt-6 divide-y divide-primary/8 text-left">
            {datos.map(([etiqueta, valor]) => (
              <div key={etiqueta} className="py-3">
                <dt className="text-xs font-semibold text-ink/45">{etiqueta}</dt>
                <dd className="mt-1 break-words text-sm font-medium text-ink">{valor}</dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={cerrarSesion}
            disabled={saliendo}
            className="mt-6 block w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            {saliendo ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink/45">Seguridad</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Tu sesión se mantiene en una cookie <span className="font-semibold text-primary">httpOnly</span>, así que el
              token no es accesible desde JavaScript. Todas las llamadas al backend pasan por el BFF del frontend.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>• El token expira a las 8 horas.</li>
              <li>• Si el backend responde 401, la cookie se elimina y se te redirige al login.</li>
              <li>• Los permisos se revalidan en cada petición del API, no solo en el menú.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800">Funciones pendientes en el API</h3>
            <p className="mt-3 text-sm leading-6 text-amber-900">
              La edición de contacto y el cambio de contraseña necesitan endpoints propios
              (<span className="font-mono text-xs">PATCH /api/v1/usuarios/:id</span> requiere rol gerente y no permite
              autoservicio). Cuando el backend los exponga, este panel se conecta sin cambiar la sesión.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
