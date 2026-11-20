"use client";

import { Playfair_Display } from "next/font/google";
import { modulos } from "@/data/menu";
import { sucursales } from "@/data/sucursales";
import { usuarios } from "@/data/usuarios";
import { modulosBloqueados, modulosPorRol } from "@/lib/auth";
import { etiquetasRol, roles } from "@/types/auth";
import { useSesion } from "@/lib/useSesion";
import ModuloCard from "@/components/inicio/ModuloCard";
import ModuloIcon from "@/components/inicio/ModuloIcon";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], display: "swap" });

export default function InicioDashboard() {
  const { usuario, cambiarUsuario } = useSesion();

  const disponibles = modulosPorRol(usuario.rol).filter((modulo) => modulo.id !== "inicio");
  const bloqueados = modulosBloqueados(usuario.rol).filter((modulo) => modulo.id !== "inicio");
  const sucursal = sucursales.find((item) => item.id === usuario.sucursalId);

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="bg-sidebar text-[#F8F0E5]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B58A60] text-white">
              <ModuloIcon icono="inicio" className="h-6 w-6" />
            </span>
            <div>
              <p className={`${playfair.className} text-xl font-bold tracking-wide`}>ORÍGENES SV</p>
              <p className="text-xs text-[#C9B7A4]">Sistema de gestión · Inicio</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E9D8C5] font-bold text-[#67452F]">
              {usuario.iniciales}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{usuario.nombre}</p>
              <p className="text-xs text-[#C9B7A4]">
                {usuario.cargo} · {sucursal?.nombre ?? "Sin sucursal"}
              </p>
            </div>
            <span className="ml-2 rounded-full bg-accent/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#F0DCC8]">
              {etiquetasRol[usuario.rol]}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-accent">Sesión simulada</p>
              <h1 className="mt-2 text-2xl font-bold md:text-3xl">
                Hola, {usuario.nombre.split(" ")[0]}. Este es tu menú.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Cambia de usuario para comprobar que cada rol ve únicamente los módulos a los que tiene acceso.
                Mientras no exista la API, los usuarios y la sesión se simulan con datos locales.
              </p>
            </div>
            <span className="w-fit rounded-full border border-accent/40 bg-page px-4 py-2 text-sm font-semibold text-primary">
              {disponibles.length} módulo{disponibles.length === 1 ? "" : "s"} disponible
              {disponibles.length === 1 ? "" : "s"}
            </span>
          </div>

          <fieldset className="mt-6">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Usuarios de demostración
            </legend>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {usuarios.map((demo) => {
                const activo = demo.id === usuario.id;
                return (
                  <button
                    key={demo.id}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => cambiarUsuario(demo.id)}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                      activo
                        ? "border-primary bg-primary text-white shadow-md"
                        : "border-stone-200 bg-white text-ink hover:border-accent hover:bg-page"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        activo ? "bg-white/15 text-white" : "bg-page text-primary"
                      }`}
                    >
                      {demo.iniciales}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{demo.nombre}</span>
                      <span className={`block text-xs ${activo ? "text-white/70" : "text-muted"}`}>
                        {etiquetasRol[demo.rol]}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </section>

        <section aria-labelledby="modulos-disponibles" className="mt-8">
          <div className="flex items-center gap-4">
            <h2 id="modulos-disponibles" className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Módulos habilitados
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-accent to-transparent" />
          </div>

          <p className="mt-2 text-sm text-muted">
            Visibles para el rol <strong className="text-ink">{etiquetasRol[usuario.rol]}</strong>.
          </p>

          {disponibles.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-stone-300 bg-white py-10 text-center text-sm text-muted">
              Este rol no tiene módulos asignados. Contacta al administrador del sistema.
            </p>
          ) : (
            <nav aria-label="Módulos disponibles" className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {disponibles.map((modulo) => (
                <ModuloCard key={modulo.id} modulo={modulo} />
              ))}
            </nav>
          )}

          <p className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <strong>Demostración:</strong> los datos y la sesión se guardan solo en este navegador. Al conectar la
            API, esta pantalla debe alimentarse del usuario autenticado.
          </p>
        </section>

        {bloqueados.length > 0 && (
          <section aria-labelledby="modulos-ocultos" className="mt-8 rounded-2xl border border-stone-200 bg-surface p-6">
            <h2 id="modulos-ocultos" className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
              Ocultos para tu rol
            </h2>
            <p className="mt-2 text-sm text-muted">
              Estos módulos existen en el sistema, pero se muestran solo a otros roles:
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {bloqueados.map((modulo) => (
                <li
                  key={modulo.id}
                  className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-500"
                >
                  {modulo.nombre}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="matriz-permisos" className="mt-8">
          <h2 id="matriz-permisos" className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
            Matriz de permisos
          </h2>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-page/60 text-left text-xs uppercase tracking-wide text-muted">
                  <th scope="col" className="px-4 py-3 font-semibold">Módulo</th>
                  {roles.map((rol) => (
                    <th key={rol} scope="col" className="px-4 py-3 text-center font-semibold">
                      {etiquetasRol[rol]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modulos.map((modulo) => (
                  <tr key={modulo.id} className="border-b border-stone-100 last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-medium text-ink">
                      {modulo.nombre}
                    </th>
                    {roles.map((rol) => {
                      const permitido = modulo.roles.includes(rol);
                      return (
                        <td key={rol} className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              permitido ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-400"
                            }`}
                          >
                            {permitido ? "✓" : "—"}
                            <span className="sr-only">
                              {permitido ? "Permitido" : "Sin acceso"} para {etiquetasRol[rol]}
                            </span>
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
