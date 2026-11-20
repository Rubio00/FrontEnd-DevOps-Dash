import { modulos } from "@/data/menu";
import { modulosBloqueados, modulosPorRol } from "@/lib/auth";
import { etiquetasRol, roles } from "@/types/auth";
import type { UsuarioSesion } from "@/types/auth";
import ModuloCard from "@/components/inicio/ModuloCard";

export default function InicioDashboard({ usuario }: { usuario: UsuarioSesion }) {
  const disponibles = modulosPorRol(usuario.rol).filter((modulo) => modulo.id !== "inicio");
  const bloqueados = modulosBloqueados(usuario.rol).filter((modulo) => modulo.id !== "inicio");

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="bg-primary text-[#F8F0E5]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-end">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E9D8C5] font-bold text-[#67452F]">
              {usuario.iniciales}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{usuario.nombre}</p>
              <p className="text-xs text-[#C9B7A4]">
                {usuario.cargo} · {usuario.sucursal ?? "Sin sucursal"}
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
              <p className="text-sm font-medium uppercase tracking-widest text-accent">Sesión activa</p>
              <h1 className="mt-2 text-2xl font-bold md:text-3xl">
                Hola, {usuario.nombre.split(" ")[0]}. Este es tu menú.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Los módulos visibles se calculan con el rol que devuelve el backend para tu usuario.
                La API valida ese mismo rol en cada petición, así que la protección no depende solo de la UI.
              </p>
            </div>
            <span className="w-fit rounded-full border border-accent/40 bg-page px-4 py-2 text-sm font-semibold text-primary">
              {disponibles.length} módulo{disponibles.length === 1 ? "" : "s"} disponible
              {disponibles.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-primary/10 bg-page/60 px-4 py-3 text-sm">
            <span className="font-semibold text-primary">{usuario.email}</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {etiquetasRol[usuario.rol]}
            </span>
            <span className="text-muted">{usuario.sucursal ?? "Sin sucursal asignada"}</span>
          </div>

          <nav aria-label="Módulos disponibles" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {disponibles.map((modulo) => (
              <ModuloCard key={modulo.id} modulo={modulo} />
            ))}
          </nav>
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
