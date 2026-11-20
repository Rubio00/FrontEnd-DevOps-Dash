"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import {
  branches,
  categories as initialCategories,
  initialItems,
  initialMovements,
  initialSuppliers,
  products as initialProducts,
} from "./inventory-data";
import CategoryManager from "./category-manager";
import ProductFormModal from "./product-form-modal";
import type { ProductFormResult } from "./product-form-modal";
import type {
  Category,
  InventoryItemKind,
  StockedInventoryItem,
  Unit,
} from "./inventory-data";

type Tab = "existencias" | "productos" | "categorias" | "movimientos";
type StockStatus = "disponible" | "bajo" | "agotado";
type StatusFilter = "todos" | StockStatus;
type ItemKindFilter = "todos" | InventoryItemKind;
type Toast = { type: "success" | "error"; message: string };
type IconName =
  | "alert"
  | "arrow-down"
  | "arrow-up"
  | "box"
  | "check"
  | "history"
  | "plus"
  | "recipe"
  | "search"
  | "store"
  | "x";

const iconPaths: Record<IconName, string> = {
  alert: "M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z M12 9v4 M12 17h.01",
  "arrow-down": "M12 5v14 M19 12l-7 7-7-7",
  "arrow-up": "M12 19V5 M5 12l7-7 7 7",
  box: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z M3.3 7 12 12l8.7-5 M12 22V12",
  check: "M20 6 9 17l-5-5",
  history: "M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5 M12 7v5l3 2",
  plus: "M12 5v14 M5 12h14",
  recipe: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h6",
  search: "M21 21l-4.35-4.35 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  store: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M9 22V12h6v10",
  x: "M18 6 6 18 M6 6l12 12",
};

const numberFormatter = new Intl.NumberFormat("es-SV", { maximumFractionDigits: 1 });
const currencyFormatter = new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" });

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

function getStockStatus(item: StockedInventoryItem): StockStatus {
  if (item.stock === 0) return "agotado";
  if (item.stock <= item.minStock) return "bajo";
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
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
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
            <h2 id="modal-title" className="text-xl font-bold text-primary">{title}</h2>
            <p id="modal-description" className="mt-1 text-sm text-muted">{description}</p>
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
  const [items, setItems] = useState(initialItems);
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
    const [suppliers] = useState(initialSuppliers);
  const [movements] = useState(initialMovements);
  const [branchId, setBranchId] = useState(branches[0].id);
  const [activeTab, setActiveTab] = useState<Tab>("existencias");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [itemKindFilter, setItemKindFilter] = useState<ItemKindFilter>("todos");
  const [productSearch, setProductSearch] = useState("");
  const [productKind, setProductKind] = useState("todos");
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const currentBranch = branches.find((branch) => branch.id === branchId) ?? branches[0];
  const branchItems = useMemo(
    () => items.map((item) => ({ ...item, ...item.stockByBranch[branchId] })),
    [branchId, items],
  );
  const itemById = useMemo(
    () => new Map(branchItems.map((item) => [item.id, item])),
    [branchItems],
  );
  const supplierById = useMemo(
    () => new Map(suppliers.map((supplier) => [supplier.id, supplier])),
    [suppliers],
  );
  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");
    return branchItems.filter((item) => {
      const matchesSearch = !query || item.name.toLocaleLowerCase("es").includes(query) || item.sku.toLocaleLowerCase("es").includes(query);
      const matchesCategory = categoryFilter === "todas" || item.category === categoryFilter;
      const matchesStatus = statusFilter === "todos" || getStockStatus(item) === statusFilter;
      const matchesKind = itemKindFilter === "todos" || item.kind === itemKindFilter;
      return matchesSearch && matchesCategory && matchesStatus && matchesKind;
    });
  }, [branchItems, categoryFilter, itemKindFilter, search, statusFilter]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLocaleLowerCase("es");
    return products.filter((product) => {
      const matchesSearch = !query || product.name.toLocaleLowerCase("es").includes(query) || product.category.toLocaleLowerCase("es").includes(query);
      const matchesKind = productKind === "todos" || product.kind === productKind;
      return matchesSearch && matchesKind;
    });
  }, [productKind, productSearch, products]);

  const branchMovements = movements.filter((movement) => movement.branchId === branchId);
  const selectedProduct = products.find((product) => product.id === selectedProductId);

  function createCatalogEntry({ product, item }: ProductFormResult) {
    if (item) setItems((current) => [...current, item]);
    if (product) setProducts((current) => [...current, product]);
    setProductFormOpen(false);
    setProductSearch("");
    setProductKind("todos");
    setSearch("");
    setCategoryFilter("todas");
    setStatusFilter("todos");
    setItemKindFilter("todos");
    setActiveTab(product ? "productos" : "existencias");
    setToast({
      type: "success",
      message: item?.kind === "insumo"
        ? `${item.name} se agregó como insumo y no aparecerá en el menú.`
        : `${product?.name ?? item?.name} se agregó correctamente al menú.`,
    });
  }

  function addCategory(category: Category) {
    setCategories((current) => [...current, category]);
    setToast({ type: "success", message: `${category.name} se agregó a las categorías del catálogo.` });
  }

  const stats = [
    {
      label: "Insumos registrados",
      value: items.filter((item) => item.kind === "insumo").length.toString(),
      detail: "Ingredientes y productos básicos",
      icon: "box" as IconName,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Items de reventa",
      value: items.filter((item) => item.kind === "reventa").length.toString(),
      detail: "Productos empacados en el menú",
      icon: "store" as IconName,
      color: "bg-accent/15 text-accent",
    },
    {
      label: "Recetas de menú",
      value: products.filter((product) => product.kind === "elaborado").length.toString(),
      detail: "Compuestas únicamente por insumos",
      icon: "recipe" as IconName,
      color: "bg-emerald-100 text-emerald-700",
    },
  ];

  const tabs: { id: Tab; label: string; icon: IconName; count: number }[] = [
    { id: "existencias", label: "Existencias", icon: "box", count: items.length },
    { id: "productos", label: "Menú y recetas", icon: "recipe", count: products.length },
    { id: "categorias", label: "Categorías", icon: "recipe", count: categories.length },
    { id: "movimientos", label: "Movimientos", icon: "history", count: branchMovements.length },
  ];

  return (
    <div className="min-h-screen bg-page text-ink">
      <section className="min-w-0 flex-1">
        <PageHeader titulo="Inventario y recetas" />

        <main className="p-5 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-accent">Control operativo</p>
              <h2 className="mt-2 text-2xl font-bold">Existencias y consumo por recetas</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                Gestioná insumos, reventa y recetas por sucursal.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm font-semibold text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-accent"
                onClick={() => setProductFormOpen(true)}
                type="button"
              >
                <Icon name="plus" className="h-4 w-4" />
                Nuevo producto
              </button>
              <label className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2">
                <Icon name="store" className="h-4 w-4 shrink-0" />
                <span className="sr-only">Sucursal</span>
                <select
                  aria-label="Seleccionar sucursal"
                  className="cursor-pointer bg-primary text-sm font-semibold text-white outline-none"
                  onChange={(event) => setBranchId(event.target.value)}
                  value={branchId}
                >
                  {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
            <p><strong>Plantilla de demostración:</strong> los datos y cambios se guardan únicamente en memoria y se restablecen al recargar.</p>
          </div>

          <section aria-label="Resumen de inventario" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-ink/55">{stat.label}</p>
                    <p className="mt-2 text-3xl font-extrabold text-primary">{stat.value}</p>
                  </div>
                  <span className={`rounded-xl p-3 ${stat.color}`}><Icon name={stat.icon} /></span>
                </div>
                <p className="mt-3 text-xs font-medium text-ink/45">{stat.detail}</p>
              </article>
            ))}
          </section>

          <div className="mt-8 border-b border-primary/10">
            <div aria-label="Vistas de inventario" className="flex gap-1 overflow-x-auto" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  aria-selected={activeTab === tab.id}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent ${activeTab === tab.id ? "border-accent text-primary" : "border-transparent text-ink/45 hover:text-primary"}`}
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
                  <h2 className="text-lg font-bold text-primary">Existencias · {currentBranch.name}</h2>
                  <p className="mt-1 text-sm text-muted">Insumos y productos de reventa con proveedores asignados.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_170px_160px_160px]">
                  <label className="relative sm:col-span-2 xl:col-span-1">
                    <span className="sr-only">Buscar producto</span>
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink/35"><Icon name="search" className="h-4 w-4" /></span>
                    <input
                      className="w-full rounded-xl border border-primary/15 bg-page/50 py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-ink/35 focus:border-accent focus:ring-2 focus:ring-accent/20"
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Buscar por nombre o SKU"
                      type="search"
                      value={search}
                    />
                  </label>
                  <select
                    aria-label="Filtrar por tipo"
                    className="rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    onChange={(event) => setItemKindFilter(event.target.value as ItemKindFilter)}
                    value={itemKindFilter}
                  >
                    <option value="todos">Todos los tipos</option>
                    <option value="insumo">Insumos</option>
                    <option value="reventa">Reventa</option>
                  </select>
                  <select
                    aria-label="Filtrar por categoría"
                    className="rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    value={categoryFilter}
                  >
                    <option value="todas">Todas las categorías</option>
                    {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
                  </select>
                  <select
                    aria-label="Filtrar por estado"
                    className="rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                    value={statusFilter}
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="bajo">Stock bajo</option>
                    <option value="agotado">Agotado</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] text-left">
                  <thead>
                    <tr className="bg-page/70 text-xs font-bold uppercase tracking-wider text-ink/45">
                      <th className="px-6 py-4">Producto</th>
                      <th className="px-4 py-4">Categoría</th>
                      <th className="px-4 py-4">Proveedores</th>
                      <th className="px-4 py-4">Existencias</th>
                      <th className="px-4 py-4">Mínimo</th>
                      <th className="px-4 py-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/8">
                    {filteredItems.map((item) => {
                      const status = getStockStatus(item);
                      const percentage = Math.min(100, (item.stock / Math.max(item.minStock * 2, 1)) * 100);
                      return (
                        <tr key={item.id} className="transition hover:bg-page/45">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-primary">{item.name}</p>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.kind === "insumo" ? "bg-[#E5EDE2] text-[#55704E]" : "bg-[#E8D9C8] text-[#79543A]"}`}>
                                {item.kind === "insumo" ? "INSUMO" : "REVENTA"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs font-medium tracking-wide text-ink/40">{item.sku}</p>
                          </td>
                          <td className="px-4 py-4 text-sm text-ink/60">{item.category}</td>
                          <td className="max-w-56 px-4 py-4 text-xs leading-5 text-ink/55">
                            {item.supplierIds.length > 0
                              ? item.supplierIds.map((id) => supplierById.get(id)?.name).filter(Boolean).join(" · ")
                              : "Sin proveedores asignados"}
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-bold text-primary">{formatQuantity(item.stock, item.unit)}</p>
                            <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-primary/8">
                              <div className={`h-full rounded-full ${status === "agotado" ? "bg-red-500" : status === "bajo" ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${percentage}%` }} />
                            </div>
                            <p className="mt-1 text-xs text-ink/35">{item.updatedAt}</p>
                          </td>
                          <td className="px-4 py-4 text-sm text-ink/60">{formatQuantity(item.minStock, item.unit)}</td>
                          <td className="px-4 py-4"><StockBadge status={status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredItems.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <Icon name="search" className="mx-auto h-8 w-8 text-ink/25" />
                    <h3 className="mt-3 font-bold text-primary">No encontramos productos</h3>
                    <p className="mt-1 text-sm text-muted">Prueba con otros filtros o términos de búsqueda.</p>
                  </div>
                )}
              </div>
              <div className="border-t border-primary/10 bg-page/35 px-6 py-3 text-xs font-medium text-ink/45">
                Mostrando {filteredItems.length} de {items.length} productos · Sucursal {currentBranch.name}
              </div>
            </section>
          )}

          {activeTab === "productos" && (
            <section className="mt-6">
              <div className="flex flex-col gap-4 rounded-2xl border border-primary/10 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-primary">Menú y fichas técnicas</h2>
                  <p className="mt-1 text-sm text-muted">Aquí solo aparecen recetas de menú y productos de reventa.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="relative">
                    <span className="sr-only">Buscar producto</span>
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink/35"><Icon name="search" className="h-4 w-4" /></span>
                    <input
                      className="w-full rounded-xl border border-primary/15 bg-page/50 py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-ink/35 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:w-64"
                      onChange={(event) => setProductSearch(event.target.value)}
                      placeholder="Buscar en el menú"
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
                    <option value="todos">Todo el menú</option>
                    <option value="elaborado">Recetas</option>
                    <option value="reventa">Reventa</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="flex flex-col rounded-2xl border border-primary/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${product.kind === "elaborado" ? "bg-[#E5EDE2] text-[#55704E]" : "bg-[#E8D9C8] text-[#79543A]"}`}>
                        {product.kind === "elaborado" ? "RECETA" : "REVENTA"}
                      </span>
                      <span className="text-lg font-extrabold text-primary">{currencyFormatter.format(product.price)}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-primary">{product.name}</h3>
                    <p className="mt-1 text-sm text-ink/45">{product.category}</p>
                    <div className="mt-5 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-ink/40">
                        {product.kind === "elaborado" ? "Consume por unidad" : `Stock en ${currentBranch.name}`}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.recipe.slice(0, 3).map((recipeItem) => {
                          const item = itemById.get(recipeItem.ingredientId);
                          return item ? (
                            <span key={recipeItem.ingredientId} className="rounded-lg bg-page px-2.5 py-1.5 text-xs font-medium text-ink/65">
                              {product.kind === "reventa" ? formatQuantity(item.stock, item.unit) : `${recipeItem.quantity} ${item.unit} ${item.name}`}
                            </span>
                          ) : null;
                        })}
                        {product.recipe.length > 3 && <span className="rounded-lg bg-page px-2.5 py-1.5 text-xs font-semibold text-ink/45">+{product.recipe.length - 3} insumos</span>}
                      </div>
                    </div>
                    <div className="mt-6 border-t border-primary/10 pt-4">
                      <button
                        className="w-full rounded-xl border border-primary/15 px-3 py-2.5 text-sm font-bold text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-accent"
                        onClick={() => setSelectedProductId(product.id)}
                        type="button"
                      >
                        Ver detalle
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {filteredProducts.length === 0 && (
                <div className="mt-5 rounded-2xl border border-primary/10 bg-white px-6 py-16 text-center">
                  <Icon name="search" className="mx-auto h-8 w-8 text-ink/25" />
                  <h3 className="mt-3 font-bold text-primary">No encontramos productos</h3>
                  <p className="mt-1 text-sm text-muted">Prueba con otra búsqueda o tipo de producto.</p>
                </div>
              )}
            </section>
          )}

          {activeTab === "categorias" && (
            <CategoryManager categories={categories} items={items} onAdd={addCategory} products={products} />
          )}

          


          {activeTab === "movimientos" && (
            <section className="mt-6 overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
              <div className="border-b border-primary/10 p-5">
                <h2 className="text-lg font-bold text-primary">Historial · {currentBranch.name}</h2>
                <p className="mt-1 text-sm text-muted">Movimientos recibidos desde otros módulos.</p>
              </div>
              <div className="divide-y divide-primary/8">
                {branchMovements.map((movement) => (
                  <article key={movement.id} className="flex flex-col gap-4 px-5 py-5 transition hover:bg-page/35 sm:flex-row sm:items-center">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${movement.type === "entrada" ? "bg-emerald-50 text-emerald-700" : movement.type === "venta" ? "bg-accent/10 text-accent" : "bg-amber-50 text-amber-700"}`}>
                      <Icon name={movement.type === "entrada" ? "arrow-down" : movement.type === "venta" ? "arrow-up" : "history"} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-primary">{movement.item}</h3>
                        <span className="rounded-full bg-page px-2 py-0.5 text-xs font-semibold capitalize text-ink/50">{movement.type}</span>
                      </div>
                      <p className="mt-1 break-words text-sm leading-6 text-muted">{movement.detail}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className={`text-sm font-bold ${movement.type === "entrada" ? "text-emerald-700" : "text-primary"}`}>{movement.quantity}</p>
                      <p className="mt-1 text-xs text-ink/40">{movement.time} · {movement.user}</p>
                    </div>
                  </article>
                ))}
                {branchMovements.length === 0 && <p className="px-6 py-16 text-center text-sm text-muted">No hay movimientos para esta sucursal.</p>}
              </div>
            </section>
          )}
        </main>

        <footer className="border-t border-primary/10 py-6 text-center text-xs font-medium text-ink/40">
          Orígenes SV · Inventario frontend · Datos simulados
        </footer>

        {productFormOpen && (
          <ProductFormModal
            categories={categories}
            existingNames={[...items.map((item) => item.name), ...products.map((product) => product.name)]}
            existingSkus={[...items.map((item) => item.sku), ...products.map((product) => product.sku ?? product.id)]}
            items={items}
            onClose={() => setProductFormOpen(false)}
            onSave={createCatalogEntry}
            suppliers={suppliers}
          />
        )}

        {selectedProduct && (
          <Modal
            description={selectedProduct.kind === "elaborado" ? "Insumos necesarios para preparar una unidad." : `Existencias de reventa en ${currentBranch.name}.`}
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
                {selectedProduct.recipe.map((recipeItem) => {
                  const item = itemById.get(recipeItem.ingredientId);
                  if (!item) return null;
                  const enough = item.stock >= recipeItem.quantity;
                  return (
                    <div key={recipeItem.ingredientId} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-primary">{item.name}</p>
                        <p className="mt-1 text-xs text-muted">Disponible: {formatQuantity(item.stock, item.unit)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-ink/70">-{formatQuantity(recipeItem.quantity, item.unit)}</p>
                        <p className={`mt-1 text-xs font-semibold ${enough ? "text-emerald-600" : "text-red-600"}`}>{enough ? "Suficiente" : "Insuficiente"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 rounded-xl bg-page p-4 text-xs leading-5 text-muted">
                Consulta de inventario para {currentBranch.name}. Las órdenes se gestionan desde el módulo de ventas.
              </div>
              <button
                className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent"
                onClick={() => setSelectedProductId(null)}
                type="button"
              >
                Cerrar detalle
              </button>
            </div>
          </Modal>
        )}

        {toast && (
          <div className={`fixed bottom-5 left-4 right-4 z-[60] flex items-start gap-3 rounded-xl border px-4 py-4 shadow-xl sm:left-auto sm:max-w-md ${toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`} role="status">
            <Icon name={toast.type === "success" ? "check" : "alert"} className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="flex-1 text-sm font-semibold leading-6">{toast.message}</p>
            <button aria-label="Cerrar notificación" className="rounded p-0.5 hover:bg-black/5" onClick={() => setToast(null)} type="button">
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
