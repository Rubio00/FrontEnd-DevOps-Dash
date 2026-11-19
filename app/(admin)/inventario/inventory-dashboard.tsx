"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  initialIngredients,
  initialMovements,
  products,
} from "./inventory-data";
import type {
  Ingredient,
  Movement,
  Product,
  Unit,
} from "./inventory-data";

type Tab = "existencias" | "productos" | "movimientos";
type StockStatus = "disponible" | "bajo" | "agotado";
type StatusFilter = "todos" | StockStatus;
type Toast = { type: "success" | "error"; message: string };
type IconName =
  | "alert"
  | "arrow-down"
  | "arrow-up"
  | "box"
  | "check"
  | "history"
  | "menu"
  | "plus"
  | "recipe"
  | "search"
  | "store"
  | "x";

const iconPaths: Record<IconName, string> = {
  alert:
    "M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z M12 9v4 M12 17h.01",
  "arrow-down": "M12 5v14 M19 12l-7 7-7-7",
  "arrow-up": "M12 19V5 M5 12l7-7 7 7",
  box: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z M3.3 7 12 12l8.7-5 M12 22V12",
  check: "M20 6 9 17l-5-5",
  history:
    "M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5 M12 7v5l3 2",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  plus: "M12 5v14 M5 12h14",
  recipe:
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h6",
  search:
    "M21 21l-4.35-4.35 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  store:
    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M9 22V12h6v10",
  x: "M18 6 6 18 M6 6l12 12",
};

const numberFormatter = new Intl.NumberFormat("es-SV", {
  maximumFractionDigits: 1,
});

const currencyFormatter = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
});

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

function formatQuantity(quantity: number, unit: Unit) {
  return `${numberFormatter.format(quantity)} ${unit}`;
}

function getStockStatus(ingredient: Ingredient): StockStatus {
  if (ingredient.stock === 0) return "agotado";
  if (ingredient.stock <= ingredient.minStock) return "bajo";
  return "disponible";
}

function StockBadge({ status }: { status: StockStatus }) {
  const styles: Record<StockStatus, string> = {
    disponible: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    bajo: "bg-amber-50 text-amber-700 ring-amber-600/20",
    agotado: "bg-red-50 text-red-700 ring-red-600/20",
  };
  const labels: Record<StockStatus, string> = {
    disponible: "Disponible",
    bajo: "Stock bajo",
    agotado: "Agotado",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}

function Modal({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <section
        aria-describedby="modal-description"
        aria-labelledby="modal-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between border-b border-primary/10 px-6 py-5">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-primary">
              {title}
            </h2>
            <p id="modal-description" className="mt-1 text-sm text-ink/60">
              {description}
            </p>
          </div>
          <button
            aria-label="Cerrar ventana"
            className="rounded-lg p-2 text-ink/50 transition hover:bg-page hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            onClick={onClose}
            type="button"
          >
            <Icon name="x" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function InventoryDashboard() {
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [movements, setMovements] = useState(initialMovements);
  const [activeTab, setActiveTab] = useState<Tab>("existencias");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [productSearch, setProductSearch] = useState("");
  const [productKind, setProductKind] = useState("todos");
  const [entryOpen, setEntryOpen] = useState(false);
  const [entryIngredientId, setEntryIngredientId] = useState(initialIngredients[0].id);
  const [entryQuantity, setEntryQuantity] = useState("");
  const [entryReference, setEntryReference] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const ingredientById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  );

  const categories = useMemo(
    () => [...new Set(ingredients.map((ingredient) => ingredient.category))].sort(),
    [ingredients],
  );

  const filteredIngredients = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");
    return ingredients.filter((ingredient) => {
      const matchesSearch =
        !query ||
        ingredient.name.toLocaleLowerCase("es").includes(query) ||
        ingredient.sku.toLocaleLowerCase("es").includes(query);
      const matchesCategory =
        categoryFilter === "todas" || ingredient.category === categoryFilter;
      const matchesStatus =
        statusFilter === "todos" || getStockStatus(ingredient) === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, ingredients, search, statusFilter]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLocaleLowerCase("es");
    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLocaleLowerCase("es").includes(query) ||
        product.category.toLocaleLowerCase("es").includes(query);
      const matchesKind = productKind === "todos" || product.kind === productKind;
      return matchesSearch && matchesKind;
    });
  }, [productKind, productSearch]);

  const alerts = ingredients.filter((ingredient) => getStockStatus(ingredient) !== "disponible");
  const selectedProduct = products.find((product) => product.id === selectedProductId);
  const selectedEntryIngredient = ingredientById.get(entryIngredientId);

  function currentTime() {
    return `Hoy, ${new Date().toLocaleTimeString("es-SV", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  function openEntry(ingredientId = ingredients[0].id) {
    setEntryIngredientId(ingredientId);
    setEntryQuantity("");
    setEntryReference("");
    setEntryOpen(true);
  }

  function registerEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const quantity = Number(entryQuantity);
    const ingredient = ingredientById.get(entryIngredientId);

    if (!ingredient || !Number.isFinite(quantity) || quantity <= 0) {
      setToast({ type: "error", message: "Ingresa una cantidad mayor que cero." });
      return;
    }

    const time = currentTime();
    setIngredients((current) =>
      current.map((item) =>
        item.id === ingredient.id
          ? { ...item, stock: item.stock + quantity, updatedAt: time }
          : item,
      ),
    );
    setMovements((current) => [
      {
        id: `entrada-${Date.now()}`,
        type: "entrada",
        item: ingredient.name,
        quantity: `+${formatQuantity(quantity, ingredient.unit)}`,
        detail: entryReference.trim() || "Entrada manual de demostración",
        time,
        user: "Demo",
      },
      ...current,
    ]);
    setEntryOpen(false);
    setToast({
      type: "success",
      message: `Entrada registrada: +${formatQuantity(quantity, ingredient.unit)} de ${ingredient.name}.`,
    });
  }

  function simulateSale(product: Product) {
    const missing = product.recipe
      .map((item) => ({ item, ingredient: ingredientById.get(item.ingredientId) }))
      .find(({ item, ingredient }) => !ingredient || ingredient.stock < item.quantity);

    if (missing) {
      setToast({
        type: "error",
        message: `No hay suficiente ${missing.ingredient?.name ?? "insumo"} para vender ${product.name}.`,
      });
      return;
    }

    const time = currentTime();
    const recipeDetail = product.recipe
      .map((item) => {
        const ingredient = ingredientById.get(item.ingredientId);
        return ingredient
          ? `-${formatQuantity(item.quantity, ingredient.unit)} ${ingredient.name}`
          : "";
      })
      .join(" · ");

    setIngredients((current) =>
      current.map((ingredient) => {
        const recipeItem = product.recipe.find((item) => item.ingredientId === ingredient.id);
        return recipeItem
          ? {
              ...ingredient,
              stock: ingredient.stock - recipeItem.quantity,
              updatedAt: time,
            }
          : ingredient;
      }),
    );
    setMovements((current) => [
      {
        id: `venta-${Date.now()}`,
        type: "venta",
        item: product.name,
        quantity: product.kind === "reventa" ? "-1 unidad" : "Receta descontada",
        detail: `Venta simulada · ${recipeDetail}`,
        time,
        user: "Demo",
      },
      ...current,
    ]);
    setToast({
      type: "success",
      message: `Venta simulada de ${product.name}: inventario actualizado.`,
    });
  }

  function reviewAlerts() {
    setActiveTab("existencias");
    setStatusFilter("todos");
    setSearch("");
    setCategoryFilter("todas");
  }

  const stats = [
    {
      label: "Insumos registrados",
      value: ingredients.length.toString(),
      detail: `${categories.length} categorías`,
      icon: "box" as IconName,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Productos en menú",
      value: products.length.toString(),
      detail: `${products.filter((product) => product.kind === "elaborado").length} elaborados · ${products.filter((product) => product.kind === "reventa").length} de reventa`,
      icon: "menu" as IconName,
      color: "bg-accent/15 text-accent",
    },
    {
      label: "Alertas de stock",
      value: alerts.length.toString(),
      detail: `${alerts.filter((item) => item.stock === 0).length} agotados · ${alerts.filter((item) => item.stock > 0).length} bajos`,
      icon: "alert" as IconName,
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Movimientos",
      value: movements.length.toString(),
      detail: "Entradas, ventas y ajustes",
      icon: "history" as IconName,
      color: "bg-emerald-100 text-emerald-700",
    },
  ];

  const tabs: { id: Tab; label: string; icon: IconName; count?: number }[] = [
    { id: "existencias", label: "Existencias", icon: "box", count: ingredients.length },
    { id: "productos", label: "Productos y recetas", icon: "recipe", count: products.length },
    { id: "movimientos", label: "Movimientos", icon: "history", count: movements.length },
  ];

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="border-b border-primary/10 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/admin" className="flex w-fit items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-lg font-black text-white">
              O
            </span>
            <span>
              <span className="block text-base font-extrabold tracking-[0.18em] text-primary">
                ORÍGENES SV
              </span>
              <span className="block text-xs font-medium text-ink/50">ERP + Punto de venta</span>
            </span>
          </Link>
          <nav aria-label="Módulos principales" className="flex flex-wrap items-center gap-1">
            {[
              { href: "/admin", label: "Administración" },
              { href: "/ventas", label: "Ventas" },
              { href: "/compras", label: "Compras" },
              { href: "/inventario", label: "Inventario", active: true },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent ${
                  item.active
                    ? "bg-primary text-white"
                    : "text-ink/60 hover:bg-page hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink/50">
              <span>Operaciones</span>
              <span aria-hidden="true">/</span>
              <span className="text-accent">Inventario</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
              Inventario y recetas
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60 sm:text-base">
              Controla insumos, existencias y el consumo automático de ingredientes por cada venta.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-2 text-xs font-semibold text-primary">
              <Icon name="store" className="h-4 w-4" />
              Sucursal Centro
            </span>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              onClick={() => openEntry()}
              type="button"
            >
              <Icon name="plus" className="h-4 w-4" />
              Registrar entrada
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>Plantilla de demostración:</strong> los datos y cambios se guardan únicamente en
            memoria y se restablecen al recargar. La conexión con compras y ventas se integrará con el
            backend.
          </p>
        </div>

        <section aria-label="Resumen de inventario" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink/55">{stat.label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-primary">{stat.value}</p>
                </div>
                <span className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon name={stat.icon} />
                </span>
              </div>
              <p className="mt-3 text-xs font-medium text-ink/45">{stat.detail}</p>
            </article>
          ))}
        </section>

        {alerts.length > 0 ? (
          <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
                <Icon name="alert" />
              </span>
              <div>
                <h2 className="font-bold text-amber-950">Hay {alerts.length} insumos que requieren atención</h2>
                <p className="mt-1 text-sm leading-6 text-amber-900/70">
                  {alerts.map((ingredient) => ingredient.name).join(" · ")}
                </p>
              </div>
            </div>
            <button
              className="shrink-0 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              onClick={reviewAlerts}
              type="button"
            >
              Revisar existencias
            </button>
          </section>
        ) : (
          <section className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            <Icon name="check" />
            <p className="text-sm font-semibold">Todos los insumos están por encima de su stock mínimo.</p>
          </section>
        )}

        <div className="mt-8 border-b border-primary/10">
          <div aria-label="Vistas de inventario" className="flex gap-1 overflow-x-auto" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                aria-selected={activeTab === tab.id}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent ${
                  activeTab === tab.id
                    ? "border-accent text-primary"
                    : "border-transparent text-ink/45 hover:text-primary"
                }`}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
              >
                <Icon name={tab.icon} className="h-4 w-4" />
                {tab.label}
                <span className="rounded-full bg-primary/5 px-2 py-0.5 text-xs">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === "existencias" && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-primary/10 p-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-primary">Existencias actuales</h2>
                <p className="mt-1 text-sm text-ink/50">Consulta disponibilidad y registra entradas de insumos.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_170px]">
                <label className="relative sm:col-span-2 xl:col-span-1">
                  <span className="sr-only">Buscar insumo</span>
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink/35">
                    <Icon name="search" className="h-4 w-4" />
                  </span>
                  <input
                    className="w-full rounded-xl border border-primary/15 bg-page/50 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-accent focus:ring-2 focus:ring-accent/20"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por nombre o SKU"
                    type="search"
                    value={search}
                  />
                </label>
                <label>
                  <span className="sr-only">Filtrar por categoría</span>
                  <select
                    className="w-full rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    value={categoryFilter}
                  >
                    <option value="todas">Todas las categorías</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="sr-only">Filtrar por estado</span>
                  <select
                    className="w-full rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                    value={statusFilter}
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="bajo">Stock bajo</option>
                    <option value="agotado">Agotado</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[940px] text-left">
                <thead>
                  <tr className="bg-page/70 text-xs font-bold uppercase tracking-wider text-ink/45">
                    <th className="px-6 py-4">Insumo</th>
                    <th className="px-4 py-4">Categoría</th>
                    <th className="px-4 py-4">Existencias</th>
                    <th className="px-4 py-4">Stock mínimo</th>
                    <th className="px-4 py-4">Estado</th>
                    <th className="px-4 py-4">Actualización</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/8">
                  {filteredIngredients.map((ingredient) => {
                    const status = getStockStatus(ingredient);
                    const percentage = Math.min(100, (ingredient.stock / Math.max(ingredient.minStock * 2, 1)) * 100);
                    return (
                      <tr key={ingredient.id} className="transition hover:bg-page/45">
                        <td className="px-6 py-4">
                          <p className="font-bold text-primary">{ingredient.name}</p>
                          <p className="mt-1 text-xs font-medium tracking-wide text-ink/40">{ingredient.sku}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-ink/60">{ingredient.category}</td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-primary">{formatQuantity(ingredient.stock, ingredient.unit)}</p>
                          <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-primary/8">
                            <div
                              className={`h-full rounded-full ${
                                status === "agotado" ? "bg-red-500" : status === "bajo" ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-ink/60">{formatQuantity(ingredient.minStock, ingredient.unit)}</td>
                        <td className="px-4 py-4"><StockBadge status={status} /></td>
                        <td className="px-4 py-4 text-sm text-ink/50">{ingredient.updatedAt}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="rounded-lg border border-primary/15 px-3 py-2 text-xs font-bold text-primary transition hover:border-accent hover:bg-accent/5 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent"
                            onClick={() => openEntry(ingredient.id)}
                            type="button"
                          >
                            + Entrada
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredIngredients.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <Icon name="search" className="mx-auto h-8 w-8 text-ink/25" />
                  <h3 className="mt-3 font-bold text-primary">No encontramos insumos</h3>
                  <p className="mt-1 text-sm text-ink/50">Prueba con otros filtros o términos de búsqueda.</p>
                </div>
              )}
            </div>
            <div className="border-t border-primary/10 bg-page/35 px-6 py-3 text-xs font-medium text-ink/45">
              Mostrando {filteredIngredients.length} de {ingredients.length} insumos
            </div>
          </section>
        )}

        {activeTab === "productos" && (
          <section className="mt-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-primary/10 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-primary">Menú y fichas técnicas</h2>
                <p className="mt-1 text-sm text-ink/50">
                  Cada venta simulada descuenta la receta completa o una unidad de reventa.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative">
                  <span className="sr-only">Buscar producto</span>
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink/35">
                    <Icon name="search" className="h-4 w-4" />
                  </span>
                  <input
                    className="w-full rounded-xl border border-primary/15 bg-page/50 py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-ink/35 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:w-64"
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Buscar producto"
                    type="search"
                    value={productSearch}
                  />
                </label>
                <select
                  aria-label="Filtrar por tipo de producto"
                  className="rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  onChange={(event) => setProductKind(event.target.value)}
                  value={productKind}
                >
                  <option value="todos">Todos los productos</option>
                  <option value="elaborado">Elaborados</option>
                  <option value="reventa">Reventa</option>
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const available = product.recipe.every((item) => {
                  const ingredient = ingredientById.get(item.ingredientId);
                  return ingredient && ingredient.stock >= item.quantity;
                });
                return (
                  <article key={product.id} className="flex flex-col rounded-2xl border border-primary/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.kind === "elaborado" ? "bg-accent/10 text-accent" : "bg-sky-50 text-sky-700"}`}>
                        {product.kind === "elaborado" ? "Elaborado" : "Reventa"}
                      </span>
                      <span className="text-lg font-extrabold text-primary">{currencyFormatter.format(product.price)}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-primary">{product.name}</h3>
                    <p className="mt-1 text-sm text-ink/45">{product.category}</p>
                    <div className="mt-5 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-ink/40">
                        {product.kind === "elaborado" ? "Consume por unidad" : "Existencia de reventa"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.recipe.slice(0, 3).map((item) => {
                          const ingredient = ingredientById.get(item.ingredientId);
                          return ingredient ? (
                            <span key={item.ingredientId} className="rounded-lg bg-page px-2.5 py-1.5 text-xs font-medium text-ink/65">
                              {item.quantity} {ingredient.unit} {ingredient.name}
                            </span>
                          ) : null;
                        })}
                        {product.recipe.length > 3 && (
                          <span className="rounded-lg bg-page px-2.5 py-1.5 text-xs font-semibold text-ink/45">
                            +{product.recipe.length - 3} insumos
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 flex gap-2 border-t border-primary/10 pt-4">
                      <button
                        className="flex-1 rounded-xl border border-primary/15 px-3 py-2.5 text-sm font-bold text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-accent"
                        onClick={() => setSelectedProductId(product.id)}
                        type="button"
                      >
                        Ver receta
                      </button>
                      <button
                        className="flex-1 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:bg-ink/15"
                        disabled={!available}
                        onClick={() => simulateSale(product)}
                        title={available ? "Descontar una venta del inventario" : "No hay existencias suficientes"}
                        type="button"
                      >
                        {available ? "Vender 1" : "Sin existencias"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            {filteredProducts.length === 0 && (
              <div className="mt-5 rounded-2xl border border-primary/10 bg-white px-6 py-16 text-center">
                <Icon name="search" className="mx-auto h-8 w-8 text-ink/25" />
                <h3 className="mt-3 font-bold text-primary">No encontramos productos</h3>
                <p className="mt-1 text-sm text-ink/50">Prueba con otra búsqueda o tipo de producto.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === "movimientos" && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
            <div className="border-b border-primary/10 p-5">
              <h2 className="text-lg font-bold text-primary">Historial de movimientos</h2>
              <p className="mt-1 text-sm text-ink/50">Trazabilidad de entradas, consumos por venta y ajustes.</p>
            </div>
            <div className="divide-y divide-primary/8">
              {movements.map((movement: Movement) => (
                <article key={movement.id} className="flex flex-col gap-4 px-5 py-5 transition hover:bg-page/35 sm:flex-row sm:items-center">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    movement.type === "entrada"
                      ? "bg-emerald-50 text-emerald-700"
                      : movement.type === "venta"
                        ? "bg-accent/10 text-accent"
                        : "bg-amber-50 text-amber-700"
                  }`}>
                    <Icon name={movement.type === "entrada" ? "arrow-down" : movement.type === "venta" ? "arrow-up" : "history"} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-primary">{movement.item}</h3>
                      <span className="rounded-full bg-page px-2 py-0.5 text-xs font-semibold capitalize text-ink/50">
                        {movement.type}
                      </span>
                    </div>
                    <p className="mt-1 break-words text-sm leading-6 text-ink/50">{movement.detail}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className={`text-sm font-bold ${movement.type === "entrada" ? "text-emerald-700" : "text-primary"}`}>
                      {movement.quantity}
                    </p>
                    <p className="mt-1 text-xs text-ink/40">{movement.time} · {movement.user}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-primary/10 py-6 text-center text-xs font-medium text-ink/40">
        Orígenes SV · Inventario frontend · Datos simulados
      </footer>

      {entryOpen && (
        <Modal
          description="La cantidad se sumará a las existencias actuales."
          onClose={() => setEntryOpen(false)}
          title="Registrar entrada de inventario"
        >
          <form className="space-y-5 p-6" onSubmit={registerEntry}>
            <label className="block text-sm font-semibold text-primary">
              Insumo
              <select
                autoFocus
                className="mt-2 w-full rounded-xl border border-primary/15 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                onChange={(event) => setEntryIngredientId(event.target.value)}
                value={entryIngredientId}
              >
                {ingredients.map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name} · {formatQuantity(ingredient.stock, ingredient.unit)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-primary">
              Cantidad recibida {selectedEntryIngredient ? `(${selectedEntryIngredient.unit})` : ""}
              <input
                className="mt-2 w-full rounded-xl border border-primary/15 px-3 py-3 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                min="0.01"
                onChange={(event) => setEntryQuantity(event.target.value)}
                placeholder="Ej. 1000"
                required
                step="0.01"
                type="number"
                value={entryQuantity}
              />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Referencia <span className="font-normal text-ink/40">(opcional)</span>
              <input
                className="mt-2 w-full rounded-xl border border-primary/15 px-3 py-3 text-sm font-normal outline-none placeholder:text-ink/30 focus:border-accent focus:ring-2 focus:ring-accent/20"
                onChange={(event) => setEntryReference(event.target.value)}
                placeholder="Factura de compra o proveedor"
                type="text"
                value={entryReference}
              />
            </label>
            <div className="rounded-xl bg-page p-4 text-xs leading-5 text-ink/55">
              En la versión integrada, una factura de compra confirmada generará esta entrada automáticamente.
            </div>
            <div className="flex justify-end gap-3 border-t border-primary/10 pt-5">
              <button
                className="rounded-xl border border-primary/15 px-4 py-2.5 text-sm font-bold text-ink/60 transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-accent"
                onClick={() => setEntryOpen(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent"
                type="submit"
              >
                Guardar entrada
              </button>
            </div>
          </form>
        </Modal>
      )}

      {selectedProduct && (
        <Modal
          description={selectedProduct.kind === "elaborado" ? "Insumos necesarios para preparar una unidad." : "Producto empacado destinado a reventa."}
          onClose={() => setSelectedProductId(null)}
          title={selectedProduct.name}
        >
          <div className="p-6">
            <div className="flex items-center justify-between rounded-xl bg-page p-4">
              <span className="text-sm font-semibold text-ink/55">Precio de venta</span>
              <span className="text-xl font-extrabold text-primary">{currencyFormatter.format(selectedProduct.price)}</span>
            </div>
            <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-ink/40">Detalle de consumo</h3>
            <div className="mt-3 divide-y divide-primary/8 rounded-xl border border-primary/10">
              {selectedProduct.recipe.map((item) => {
                const ingredient = ingredientById.get(item.ingredientId);
                if (!ingredient) return null;
                const enough = ingredient.stock >= item.quantity;
                return (
                  <div key={item.ingredientId} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-primary">{ingredient.name}</p>
                      <p className="mt-1 text-xs text-ink/45">Disponible: {formatQuantity(ingredient.stock, ingredient.unit)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-ink/70">-{formatQuantity(item.quantity, ingredient.unit)}</p>
                      <p className={`mt-1 text-xs font-semibold ${enough ? "text-emerald-600" : "text-red-600"}`}>
                        {enough ? "Suficiente" : "Insuficiente"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent"
              onClick={() => {
                setSelectedProductId(null);
                setActiveTab("productos");
                simulateSale(selectedProduct);
              }}
              type="button"
            >
              Simular venta y descontar
            </button>
          </div>
        </Modal>
      )}

      {toast && (
        <div className={`fixed bottom-5 left-4 right-4 z-[60] flex items-start gap-3 rounded-xl border px-4 py-4 shadow-xl sm:left-auto sm:max-w-md ${
          toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"
        }`} role="status">
          <Icon name={toast.type === "success" ? "check" : "alert"} className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="flex-1 text-sm font-semibold leading-6">{toast.message}</p>
          <button aria-label="Cerrar notificación" className="rounded p-0.5 hover:bg-black/5" onClick={() => setToast(null)} type="button">
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
