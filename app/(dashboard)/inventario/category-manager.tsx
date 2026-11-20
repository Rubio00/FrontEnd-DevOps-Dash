"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Category, InventoryItem, Product } from "./inventory-data";

type CategoryManagerProps = {
  categories: Category[];
  items: InventoryItem[];
  products: Product[];
  onAdd: (category: Category) => void;
};

export default function CategoryManager({ categories, items, products, onAdd }: CategoryManagerProps) {
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const query = search.trim().toLocaleLowerCase("es");
  const filteredCategories = categories.filter((category) => !query || category.name.toLocaleLowerCase("es").includes(query));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName) {
      setError("Ingresá el nombre de la categoría.");
      return;
    }
    if (categories.some((category) => category.name.toLocaleLowerCase("es") === normalizedName.toLocaleLowerCase("es"))) {
      setError("Ya existe una categoría con ese nombre.");
      return;
    }
    const id = normalizedName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    onAdd({ id: `${id || "categoria"}-${Date.now()}`, name: normalizedName });
    setName("");
    setError("");
  }

  function getProductCount(categoryName: string) {
    return items.filter((item) => item.category === categoryName).length + products.filter((product) => product.category === categoryName).length;
  }

  return (
    <section className="mt-6 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="h-fit rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-primary">Nueva categoría</h2>
        <p className="mt-1 text-sm leading-6 text-muted">Creá una clasificación para organizar insumos, reventa o recetas del menú.</p>
        <form className="mt-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-primary">
            Nombre de la categoría
            <input
              className="mt-2 w-full rounded-xl border border-primary/15 px-3 py-3 text-sm font-normal outline-none placeholder:text-ink/30 focus:border-accent focus:ring-2 focus:ring-accent/20"
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="Ej. Repostería"
              type="text"
              value={name}
            />
          </label>
          {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">{error}</p>}
          <button className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent" type="submit">
            + Agregar categoría
          </button>
        </form>
        <div className="mt-5 rounded-xl bg-page p-4 text-xs leading-5 text-muted">
          La nueva categoría estará disponible al registrar productos y en los filtros de existencias.
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-primary/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-bold text-primary">Categorías registradas</h2><p className="mt-1 text-sm text-muted">{categories.length} clasificaciones del catálogo.</p></div>
          <label className="relative">
            <span className="sr-only">Buscar categoría</span>
            <input className="w-full rounded-xl border border-primary/15 bg-page/50 px-3 py-2.5 text-sm outline-none placeholder:text-ink/35 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:w-64" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar categoría" type="search" value={search} />
          </label>
        </div>
        <div className="divide-y divide-primary/8">
          {filteredCategories.map((category) => {
            const productCount = getProductCount(category.name);
            return (
              <article key={category.id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-page/35">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-extrabold uppercase text-primary">{category.name.slice(0, 2)}</span>
                <div className="min-w-0 flex-1"><h3 className="font-bold text-primary">{category.name}</h3><p className="mt-1 text-xs text-muted">Disponible para todo el catálogo</p></div>
                <span className="rounded-full bg-page px-3 py-1.5 text-xs font-semibold text-ink/55">{productCount} {productCount === 1 ? "producto" : "productos"}</span>
              </article>
            );
          })}
          {filteredCategories.length === 0 && <div className="px-6 py-16 text-center"><h3 className="font-bold text-primary">No encontramos categorías</h3><p className="mt-1 text-sm text-muted">Prueba con otro nombre o agregá una nueva categoría.</p></div>}
        </div>
      </div>
    </section>
  );
}
