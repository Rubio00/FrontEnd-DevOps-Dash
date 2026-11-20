"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Categoria, Insumo, ProductoInventario } from "@/types/inventario";

type Props = {
  categorias: Categoria[];
  insumos: Insumo[];
  productos: ProductoInventario[];
  puedeEditar: boolean;
  onCrear: (nombre: string) => Promise<void>;
  onRenombrar: (id: number, nombre: string) => Promise<void>;
  onEliminar: (id: number) => Promise<void>;
};

export default function CategoryManager({
  categorias,
  insumos,
  productos,
  puedeEditar,
  onCrear,
  onRenombrar,
  onEliminar,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState("");

  const texto = busqueda.trim().toLowerCase();
  const visibles = categorias.filter((categoria) =>
    categoria.nombre.toLowerCase().includes(texto),
  );

  function contar(nombreCategoria: string) {
    return (
      insumos.filter((insumo) => insumo.categoria === nombreCategoria).length +
      productos.filter((producto) => producto.categoria === nombreCategoria).length
    );
  }

  async function crear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const limpio = nombre.trim();

    if (!limpio) {
      setError("Ingresá el nombre de la categoría.");
      return;
    }
    if (categorias.some((categoria) => categoria.nombre.toLowerCase() === limpio.toLowerCase())) {
      setError("Ya existe una categoría con ese nombre.");
      return;
    }

    setGuardando(true);
    try {
      await onCrear(limpio);
      setNombre("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear la categoría.");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarNombre(id: number) {
    setError("");
    try {
      await onRenombrar(id, nombreEditado.trim());
      setEditandoId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo renombrar la categoría.");
    }
  }

  async function eliminar(id: number) {
    setError("");
    try {
      await onEliminar(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar la categoría.");
    }
  }

  return (
    <section className="mt-6 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      {puedeEditar && (
        <div className="h-fit rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-primary">Nueva categoría</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Creá una clasificación para organizar insumos, reventa o recetas del menú.
          </p>
          <form className="mt-5" onSubmit={crear}>
            <label className="block text-sm font-semibold text-primary">
              Nombre de la categoría
              <input
                className="mt-2 w-full rounded-xl border border-primary/15 px-3 py-3 text-sm font-normal outline-none placeholder:text-ink/30 focus:border-accent focus:ring-2 focus:ring-accent/20"
                onChange={(event) => {
                  setNombre(event.target.value);
                  setError("");
                }}
                placeholder="Ej. Repostería"
                type="text"
                value={nombre}
              />
            </label>
            {error && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
                {error}
              </p>
            )}
            <button
              className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-60"
              disabled={guardando}
              type="submit"
            >
              {guardando ? "Guardando..." : "+ Agregar categoría"}
            </button>
          </form>
          <div className="mt-5 rounded-xl bg-page p-4 text-xs leading-5 text-muted">
            La nueva categoría estará disponible al registrar productos y en los filtros de existencias.
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-primary/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary">Categorías registradas</h2>
            <p className="mt-1 text-sm text-muted">{categorias.length} clasificaciones del catálogo.</p>
          </div>
          <label className="relative">
            <span className="sr-only">Buscar categoría</span>
            <input
              className="w-full rounded-xl border border-primary/15 bg-page/50 px-3 py-2.5 text-sm outline-none placeholder:text-ink/35 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:w-64"
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar categoría"
              type="search"
              value={busqueda}
            />
          </label>
        </div>

        {error && !puedeEditar && (
          <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-800" role="alert">{error}</p>
        )}

        <div className="divide-y divide-primary/8">
          {visibles.map((categoria) => {
            const total = contar(categoria.nombre);
            const editando = editandoId === categoria.id;
            return (
              <article key={categoria.id} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-page/35 sm:flex-row sm:items-center">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-extrabold uppercase text-primary">
                  {categoria.nombre.slice(0, 2)}
                </span>

                <div className="min-w-0 flex-1">
                  {editando ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        className="rounded-lg border border-primary/15 px-3 py-1.5 text-sm outline-none focus:border-accent"
                        value={nombreEditado}
                        onChange={(event) => setNombreEditado(event.target.value)}
                      />
                      <button type="button" onClick={() => guardarNombre(categoria.id)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white">
                        Guardar
                      </button>
                      <button type="button" onClick={() => setEditandoId(null)} className="rounded-lg border border-primary/15 px-3 py-1.5 text-xs font-bold text-ink/60">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-bold text-primary">{categoria.nombre}</h3>
                      <p className="mt-1 text-xs text-muted">Disponible para todo el catálogo</p>
                    </>
                  )}
                </div>

                <span className="rounded-full bg-page px-3 py-1.5 text-xs font-semibold text-ink/55">
                  {total} {total === 1 ? "registro" : "registros"}
                </span>

                {puedeEditar && !editando && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditandoId(categoria.id);
                        setNombreEditado(categoria.nombre);
                      }}
                      className="rounded-lg border border-primary/15 px-3 py-1.5 text-xs font-bold text-primary hover:bg-page"
                    >
                      Renombrar
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminar(categoria.id)}
                      disabled={total > 0}
                      title={total > 0 ? "No se puede eliminar: tiene registros asociados" : "Eliminar categoría"}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </article>
            );
          })}
          {visibles.length === 0 && (
            <div className="px-6 py-16 text-center">
              <h3 className="font-bold text-primary">No encontramos categorías</h3>
              <p className="mt-1 text-sm text-muted">Probá con otro nombre o agregá una nueva categoría.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
