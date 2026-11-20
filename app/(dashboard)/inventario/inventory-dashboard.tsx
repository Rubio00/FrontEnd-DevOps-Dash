"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { usd } from "@/lib/format";
import CategoryManager from "./category-manager";
import ProductFormModal from "./product-form-modal";
import type { ProductFormResult } from "./product-form-modal";
import {
  actualizarCategoria,
  crearCategoria,
  crearInsumo,
  crearProducto,
  eliminarCategoria,
  guardarReceta,
  setStockMinimo,
} from "@/services/inventario.client";
import { estadoStock } from "@/types/inventario";
import type {
  Categoria,
  Insumo,
  MovimientoStock,
  ProductoInventario,
  ProveedorOpcion,
  StockSucursal,
} from "@/types/inventario";

type Tab = "existencias" | "productos" | "categorias" | "movimientos";
type StockStatus = "disponible" | "bajo" | "agotado";
type StatusFilter = "todos" | StockStatus;
type ItemKind = "insumo" | "reventa";
type ItemKindFilter = "todos" | ItemKind;

type Props = {
  inicialStock: StockSucursal[];
  inicialMovimientos: MovimientoStock[];
  inicialInsumos: Insumo[];
  inicialProductos: ProductoInventario[];
  inicialCategorias: Categoria[];
  sucursales: { id: number; nombre: string }[];
  proveedores: ProveedorOpcion[];
  sucursalInicial: number;
  puedeEditar: boolean;
};

type FilaExistencia = {
  key: string;
  kind: ItemKind;
  nombre: string;
  sku: string;
  categoria: string;
  proveedores: string;
  unidad: string;
  stock: number;
  minStock: number;
  actualizadoEn: string | null;
};

const iconPaths = {
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
} as const;

type IconName = keyof typeof iconPaths;

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={iconPaths[name]} />
    </svg>
  );
}

const numberFormatter = new Intl.NumberFormat("es-SV", { maximumFractionDigits: 1 });
const dateFormatter = new Intl.DateTimeFormat("es-SV", { day: "2-digit", month: "short", year: "numeric" });

function formatQuantity(cantidad: number, unidad: string) {
  return `${numberFormatter.format(cantidad)} ${unidad}`;
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

function Modal({ title, description, children, onClose }: { title: string; description: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <section className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="flex items-start justify-between border-b border-primary/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-primary">{title}</h2>
            <p className="mt-1 text-sm text-muted">{description}</p>
          </div>
          <button className="rounded-lg px-3 py-2 text-sm font-bold text-ink/50 hover:bg-page hover:text-primary" onClick={onClose} type="button">
            Cerrar
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function InventoryDashboard({
  inicialStock,
  inicialMovimientos,
  inicialInsumos,
  inicialProductos,
  inicialCategorias,
  sucursales,
  proveedores,
  sucursalInicial,
  puedeEditar,
}: Props) {
  const router = useRouter();
  const [stock, setStock] = useState(inicialStock);
  const [movimientos, setMovimientos] = useState(inicialMovimientos);
  const [insumos, setInsumos] = useState(inicialInsumos);
  const [productos, setProductos] = useState(inicialProductos);
  const [categorias, setCategorias] = useState(inicialCategorias);
  const [branchId, setBranchId] = useState(sucursalInicial);
  const [activeTab, setActiveTab] = useState<Tab>("existencias");
  const [search, setSearch] = useState("");
  const [itemKindFilter, setItemKindFilter] = useState<ItemKindFilter>("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [productSearch, setProductSearch] = useState("");
  const [productKindFilter, setProductKindFilter] = useState<"todos" | "elaborado" | "reventa">("todos");
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => setStock(inicialStock), [inicialStock]);
  useEffect(() => setMovimientos(inicialMovimientos), [inicialMovimientos]);
  useEffect(() => setInsumos(inicialInsumos), [inicialInsumos]);
  useEffect(() => setProductos(inicialProductos), [inicialProductos]);
  useEffect(() => setCategorias(inicialCategorias), [inicialCategorias]);

  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(""), 4500);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  const currentBranch = sucursales.find((sucursal) => sucursal.id === branchId) ?? sucursales[0];
  const stockPorInsumo = useMemo(() => {
    const mapa = new Map<number, StockSucursal>();
    for (const fila of stock) {
      if (fila.sucursalId === branchId) mapa.set(fila.insumoId, fila);
    }
    return mapa;
  }, [stock, branchId]);

  const insumoPorId = useMemo(() => new Map(insumos.map((insumo) => [insumo.id, insumo])), [insumos]);

  const filas = useMemo<FilaExistencia[]>(() => {
    const deInsumos: FilaExistencia[] = insumos.map((insumo) => {
      const fila = stockPorInsumo.get(insumo.id);
      return {
        key: `insumo-${insumo.id}`,
        kind: "insumo",
        nombre: insumo.nombre,
        sku: insumo.sku ?? `INS-${String(insumo.id).padStart(4, "0")}`,
        categoria: insumo.categoria ?? "Sin categoría",
        proveedores: insumo.proveedores.map((proveedor) => proveedor.nombre).join(" · "),
        unidad: insumo.unidad,
        stock: fila?.stockActual ?? 0,
        minStock: fila?.stockMinimo ?? 0,
        actualizadoEn: fila?.actualizadoEn ?? null,
      };
    });

    const deReventa: FilaExistencia[] = productos
      .filter((producto) => producto.tipo === "reventa" && producto.insumoId)
      .map((producto) => {
        const insumo = insumoPorId.get(producto.insumoId as number);
        const fila = insumo ? stockPorInsumo.get(insumo.id) : undefined;
        return {
          key: `producto-${producto.id}`,
          kind: "reventa",
          nombre: producto.nombre,
          sku: producto.sku ?? insumo?.sku ?? `PRD-${String(producto.id).padStart(4, "0")}`,
          categoria: producto.categoria ?? insumo?.categoria ?? "Sin categoría",
          proveedores: insumo?.proveedores.map((proveedor) => proveedor.nombre).join(" · ") ?? "",
          unidad: insumo?.unidad ?? "und",
          stock: fila?.stockActual ?? 0,
          minStock: fila?.stockMinimo ?? 0,
          actualizadoEn: fila?.actualizadoEn ?? null,
        };
      });

    return [...deInsumos, ...deReventa];
  }, [insumos, productos, insumoPorId, stockPorInsumo]);

  const texto = search.trim().toLowerCase();
  const filteredItems = filas.filter((fila) => {
    const coincideTexto = [fila.nombre, fila.sku, fila.categoria, fila.proveedores]
      .join(" ")
      .toLowerCase()
      .includes(texto);
    const coincideKind = itemKindFilter === "todos" || fila.kind === itemKindFilter;
    const coincideCategoria = categoryFilter === "todas" || fila.categoria === categoryFilter;
    const status = estadoStock(fila.stock, fila.minStock);
    const coincideStatus = statusFilter === "todos" || status === statusFilter;
    return coincideTexto && coincideKind && coincideCategoria && coincideStatus;
  });

  const productText = productSearch.trim().toLowerCase();
  const filteredProducts = productos.filter((producto) => {
    const coincideTexto = [producto.nombre, producto.categoria ?? "", producto.sku ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(productText);
    const coincideKind = productKindFilter === "todos" || producto.tipo === productKindFilter;
    return coincideTexto && coincideKind;
  });

  const branchMovements = movimientos.filter((movimiento) => movimiento.sucursalId === branchId);

  const bajos = filas.filter((fila) => estadoStock(fila.stock, fila.minStock) === "bajo").length;
  const agotados = filas.filter((fila) => estadoStock(fila.stock, fila.minStock) === "agotado").length;

  const stats = [
    { label: "Registros de inventario", value: filas.length, detail: `En ${currentBranch?.nombre ?? "la sucursal"}`, icon: "box" as IconName, color: "bg-primary/10 text-primary" },
    { label: "Stock bajo", value: bajos, detail: "Requieren reposición", icon: "alert" as IconName, color: "bg-amber-50 text-amber-700" },
    { label: "Agotados", value: agotados, detail: "Sin existencias", icon: "alert" as IconName, color: "bg-red-50 text-red-700" },
  ];

  const tabs = [
    { id: "existencias" as Tab, label: "Existencias", icon: "box" as IconName, count: filas.length },
    { id: "productos" as Tab, label: "Productos", icon: "recipe" as IconName, count: productos.length },
    { id: "categorias" as Tab, label: "Categorías", icon: "store" as IconName, count: categorias.length },
    { id: "movimientos" as Tab, label: "Movimientos", icon: "history" as IconName, count: branchMovements.length },
  ];

  const selectedProduct = productos.find((producto) => producto.id === selectedProductId) ?? null;

  function disponibilidadProducto(producto: ProductoInventario): number | null {
    if (producto.tipo === "reventa") {
      const insumo = producto.insumoId ? insumoPorId.get(producto.insumoId) : undefined;
      const fila = insumo ? stockPorInsumo.get(insumo.id) : undefined;
      return fila?.stockActual ?? 0;
    }
    if (producto.receta.length === 0) return null;
    let minimo = Number.POSITIVE_INFINITY;
    for (const ingrediente of producto.receta) {
      const fila = stockPorInsumo.get(ingrediente.insumoId);
      const disponible = fila?.stockActual ?? 0;
      minimo = Math.min(minimo, Math.floor(disponible / ingrediente.cantidad));
    }
    return Number.isFinite(minimo) ? minimo : null;
  }

  async function aplicarMinimo(insumoId: number, valor: number) {
    await Promise.all(
      sucursales.map((sucursal) =>
        setStockMinimo({ sucursalId: sucursal.id, insumoId, stockMinimo: valor }),
      ),
    );
  }

  async function crear(result: ProductFormResult) {
    if (result.kind === "insumo") {
      const insumo = await crearInsumo(result.insumo!);
      await aplicarMinimo(insumo.id, result.stockMinimo);
      setInsumos((prev) => [...prev, insumo]);
      setAviso(`Insumo "${insumo.nombre}" creado. El stock se carga desde Compras.`);
    } else if (result.kind === "reventa") {
      const insumo = await crearInsumo(result.insumo!);
      await aplicarMinimo(insumo.id, result.stockMinimo);
      const producto = await crearProducto({ ...result.producto!, insumoId: insumo.id });
      setInsumos((prev) => [...prev, insumo]);
      setProductos((prev) => [...prev, producto]);
      setAviso(`Producto de reventa "${producto.nombre}" creado.`);
    } else {
      const producto = await crearProducto(result.producto!);
      const receta = await guardarReceta(producto.id, result.receta!);
      setProductos((prev) => [...prev, { ...producto, receta }]);
      setAviso(`Producto "${producto.nombre}" creado con ${receta.length} ingrediente(s).`);
    }
    setProductFormOpen(false);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-page text-ink">
      <PageHeader titulo="Inventario" />

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-accent">Operación</p>
            <h2 className="mt-2 text-2xl font-bold">Inventario</h2>
            <p className="mt-1 text-sm text-muted">
              Existencias por sucursal, recetas del menú y kardex de movimientos.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {puedeEditar && (
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm font-semibold text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-accent"
                onClick={() => setProductFormOpen(true)}
                type="button"
              >
                <Icon name="plus" className="h-4 w-4" />
                Nuevo producto
              </button>
            )}
            <label className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md">
              <Icon name="store" className="h-4 w-4 shrink-0" />
              <span className="sr-only">Sucursal</span>
              <select
                aria-label="Seleccionar sucursal"
                className="cursor-pointer bg-primary text-sm font-semibold text-white outline-none"
                onChange={(event) => setBranchId(Number(event.target.value))}
                value={branchId}
              >
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            El stock se abastece desde <strong>Compras</strong> y se descuenta al vender. Desde Inventario
            solo se consulta y se define el mínimo por sucursal.
          </p>
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
                <h2 className="text-lg font-bold text-primary">Existencias · {currentBranch?.nombre}</h2>
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
                <select aria-label="Filtrar por tipo" className="rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent" onChange={(event) => setItemKindFilter(event.target.value as ItemKindFilter)} value={itemKindFilter}>
                  <option value="todos">Todos los tipos</option>
                  <option value="insumo">Insumos</option>
                  <option value="reventa">Reventa</option>
                </select>
                <select aria-label="Filtrar por categoría" className="rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent" onChange={(event) => setCategoryFilter(event.target.value)} value={categoryFilter}>
                  <option value="todas">Todas las categorías</option>
                  {categorias.map((categoria) => <option key={categoria.id} value={categoria.nombre}>{categoria.nombre}</option>)}
                </select>
                <select aria-label="Filtrar por estado" className="rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent" onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} value={statusFilter}>
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
                  {filteredItems.map((fila) => {
                    const status = estadoStock(fila.stock, fila.minStock);
                    const percentage = Math.min(100, (fila.stock / Math.max(fila.minStock * 2, 1)) * 100);
                    return (
                      <tr key={fila.key} className="transition hover:bg-page/45">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-primary">{fila.nombre}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${fila.kind === "insumo" ? "bg-[#E5EDE2] text-[#55704E]" : "bg-[#E8D9C8] text-[#79543A]"}`}>
                              {fila.kind === "insumo" ? "INSUMO" : "REVENTA"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-medium tracking-wide text-ink/40">{fila.sku}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-ink/60">{fila.categoria}</td>
                        <td className="max-w-56 px-4 py-4 text-xs leading-5 text-ink/55">
                          {fila.proveedores || "Sin proveedores asignados"}
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-primary">{formatQuantity(fila.stock, fila.unidad)}</p>
                          <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-primary/8">
                            <div className={`h-full rounded-full ${status === "agotado" ? "bg-red-500" : status === "bajo" ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${percentage}%` }} />
                          </div>
                          <p className="mt-1 text-xs text-ink/35">
                            {fila.actualizadoEn ? dateFormatter.format(new Date(fila.actualizadoEn)) : "Sin movimientos"}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm text-ink/60">{formatQuantity(fila.minStock, fila.unidad)}</td>
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
                  <p className="mt-1 text-sm text-muted">Probá con otros filtros o términos de búsqueda.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "productos" && (
          <section className="mt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-primary">Productos del menú</h2>
                <p className="mt-1 text-sm text-muted">Recetas, precios y disponibilidad en {currentBranch?.nombre}.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative">
                  <span className="sr-only">Buscar producto</span>
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink/35"><Icon name="search" className="h-4 w-4" /></span>
                  <input
                    className="w-full rounded-xl border border-primary/15 bg-white py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-ink/35 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:w-64"
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Buscar producto"
                    type="search"
                    value={productSearch}
                  />
                </label>
                <select aria-label="Filtrar por tipo de producto" className="rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent" onChange={(event) => setProductKindFilter(event.target.value as typeof productKindFilter)} value={productKindFilter}>
                  <option value="todos">Todos</option>
                  <option value="elaborado">Elaborados</option>
                  <option value="reventa">Reventa</option>
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((producto) => {
                const disponible = disponibilidadProducto(producto);
                return (
                  <article key={producto.id} className="flex flex-col rounded-2xl border border-primary/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${producto.tipo === "elaborado" ? "bg-[#E5EDE2] text-[#55704E]" : "bg-[#E8D9C8] text-[#79543A]"}`}>
                        {producto.tipo}
                      </span>
                      <span className="text-lg font-extrabold text-primary">{usd(producto.precio)}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-primary">{producto.nombre}</h3>
                    <p className="mt-1 text-xs font-medium tracking-wide text-ink/40">{producto.sku ?? `PRD-${String(producto.id).padStart(4, "0")}`}</p>
                    <p className="mt-2 text-sm text-muted">{producto.categoria || "Sin categoría"}</p>

                    <dl className="mt-4 space-y-1 border-t border-primary/10 pt-3 text-xs text-ink/55">
                      <div className="flex justify-between">
                        <dt>{producto.tipo === "elaborado" ? "Ingredientes" : "Stock vinculado"}</dt>
                        <dd className="font-semibold text-primary">
                          {producto.tipo === "elaborado" ? producto.receta.length : formatQuantity(disponible ?? 0, producto.insumo?.unidad ?? "und")}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Disponible</dt>
                        <dd className={`font-semibold ${disponible === null || disponible === 0 ? "text-red-600" : "text-emerald-600"}`}>
                          {disponible === null ? "Sin receta" : `${disponible} porciones`}
                        </dd>
                      </div>
                    </dl>

                    <button
                      className="mt-4 rounded-xl border border-primary/15 px-4 py-2 text-sm font-bold text-primary transition hover:bg-page"
                      onClick={() => setSelectedProductId(producto.id)}
                      type="button"
                    >
                      Ver detalle
                    </button>
                  </article>
                );
              })}
            </div>
            {filteredProducts.length === 0 && (
              <div className="mt-5 rounded-2xl border border-primary/10 bg-white px-6 py-16 text-center">
                <Icon name="search" className="mx-auto h-8 w-8 text-ink/25" />
                <h3 className="mt-3 font-bold text-primary">No encontramos productos</h3>
                <p className="mt-1 text-sm text-muted">Probá con otra búsqueda o tipo de producto.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === "categorias" && (
          <CategoryManager
            categorias={categorias}
            insumos={insumos}
            productos={productos}
            puedeEditar={puedeEditar}
            onCrear={async (nombre) => {
              const nueva = await crearCategoria(nombre);
              setCategorias((prev) => [...prev, nueva]);
              router.refresh();
            }}
            onRenombrar={async (id, nombre) => {
              const anterior = categorias.find((categoria) => categoria.id === id)?.nombre;
              const actualizada = await actualizarCategoria(id, nombre);
              setCategorias((prev) => prev.map((categoria) => (categoria.id === id ? actualizada : categoria)));
              if (anterior) {
                setProductos((prev) => prev.map((producto) => (producto.categoria === anterior ? { ...producto, categoria: nombre } : producto)));
                setInsumos((prev) => prev.map((insumo) => (insumo.categoria === anterior ? { ...insumo, categoria: nombre } : insumo)));
              }
              router.refresh();
            }}
            onEliminar={async (id) => {
              await eliminarCategoria(id);
              setCategorias((prev) => prev.filter((categoria) => categoria.id !== id));
              router.refresh();
            }}
          />
        )}

        {activeTab === "movimientos" && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
            <div className="border-b border-primary/10 p-5">
              <h2 className="text-lg font-bold text-primary">Historial · {currentBranch?.nombre}</h2>
              <p className="mt-1 text-sm text-muted">Movimientos recibidos desde Compras y Ventas.</p>
            </div>
            <div className="divide-y divide-primary/8">
              {branchMovements.map((movimiento) => (
                <article key={movimiento.id} className="flex flex-col gap-4 px-5 py-5 transition hover:bg-page/35 sm:flex-row sm:items-center">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${movimiento.tipo === "entrada" ? "bg-emerald-50 text-emerald-700" : movimiento.tipo === "salida" ? "bg-accent/10 text-accent" : "bg-amber-50 text-amber-700"}`}>
                    <Icon name={movimiento.tipo === "entrada" ? "arrow-down" : "arrow-up"} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-primary">{movimiento.insumo?.nombre ?? `Insumo #${movimiento.insumoId}`}</h3>
                      <span className="rounded-full bg-page px-2 py-0.5 text-xs font-semibold capitalize text-ink/50">{movimiento.tipo}</span>
                    </div>
                    <p className="mt-1 break-words text-sm leading-6 text-muted">
                      {movimiento.motivo}{movimiento.usuario?.email ? ` · ${movimiento.usuario.email}` : ""}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className={`text-sm font-bold ${movimiento.tipo === "entrada" ? "text-emerald-700" : "text-primary"}`}>
                      {movimiento.tipo === "entrada" ? "+" : "−"}{formatQuantity(movimiento.cantidad, movimiento.insumo?.unidad ?? "")}
                    </p>
                    <p className="mt-1 text-xs text-ink/40">{dateFormatter.format(new Date(movimiento.fecha))}</p>
                  </div>
                </article>
              ))}
              {branchMovements.length === 0 && <p className="px-6 py-16 text-center text-sm text-muted">No hay movimientos para esta sucursal.</p>}
            </div>
          </section>
        )}
      </section>

      {selectedProduct && (
        <Modal
          description={
            selectedProduct.tipo === "elaborado"
              ? "Insumos necesarios para preparar una unidad."
              : `Existencias de reventa en ${currentBranch?.nombre}.`
          }
          onClose={() => setSelectedProductId(null)}
          title={selectedProduct.nombre}
        >
          <div className="p-6">
            <div className="flex items-center justify-between rounded-xl bg-page p-4">
              <span className="text-sm font-semibold text-ink/55">Precio de venta</span>
              <span className="text-xl font-extrabold text-primary">{usd(selectedProduct.precio)}</span>
            </div>

            {selectedProduct.tipo === "elaborado" ? (
              <>
                <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-ink/40">Detalle de consumo</h3>
                <div className="mt-3 divide-y divide-primary/8 rounded-xl border border-primary/10">
                  {selectedProduct.receta.map((linea) => {
                    const insumo = insumoPorId.get(linea.insumoId);
                    const fila = stockPorInsumo.get(linea.insumoId);
                    const disponible = fila?.stockActual ?? 0;
                    const suficiente = disponible >= linea.cantidad;
                    return (
                      <div key={linea.id} className="flex items-center justify-between gap-4 px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-primary">{insumo?.nombre ?? linea.insumo.nombre}</p>
                          <p className="mt-1 text-xs text-muted">
                            Disponible: {formatQuantity(disponible, insumo?.unidad ?? linea.insumo.unidad)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-ink/70">
                            −{formatQuantity(linea.cantidad, insumo?.unidad ?? linea.insumo.unidad)}
                          </p>
                          <p className={`mt-1 text-xs font-semibold ${suficiente ? "text-emerald-600" : "text-red-600"}`}>
                            {suficiente ? "Suficiente" : "Insuficiente"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {selectedProduct.receta.length === 0 && (
                    <p className="px-4 py-6 text-center text-sm text-muted">Este producto todavía no tiene receta.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-xl border border-primary/10 p-4">
                <p className="text-sm font-semibold text-primary">Stock vinculado</p>
                <p className="mt-2 text-2xl font-extrabold text-primary">
                  {formatQuantity(disponibilidadProducto(selectedProduct) ?? 0, selectedProduct.insumo?.unidad ?? "und")}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Se descuenta del insumo {selectedProduct.insumo?.nombre ?? "vinculado"}.
                </p>
              </div>
            )}

            <div className="mt-6 rounded-xl bg-page p-4 text-xs leading-5 text-muted">
              Consulta de inventario para {currentBranch?.nombre}. El abastecimiento se registra desde Compras.
            </div>
            <button
              className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90"
              onClick={() => setSelectedProductId(null)}
              type="button"
            >
              Cerrar detalle
            </button>
          </div>
        </Modal>
      )}

      {productFormOpen && puedeEditar && (
        <ProductFormModal
          categorias={categorias}
          insumos={insumos}
          proveedores={proveedores}
          nombresExistentes={[...insumos.map((insumo) => insumo.nombre), ...productos.map((producto) => producto.nombre)]}
          skusExistentes={[
            ...insumos.map((insumo) => insumo.sku ?? ""),
            ...productos.map((producto) => producto.sku ?? ""),
          ].filter(Boolean)}
          onClose={() => setProductFormOpen(false)}
          onSave={crear}
        />
      )}

      {aviso && (
        <div className={`fixed bottom-5 left-4 right-4 z-[60] flex items-start gap-3 rounded-xl border px-4 py-4 shadow-xl sm:left-auto sm:max-w-md border-emerald-200 bg-emerald-50 text-emerald-900`} role="status">
          <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="flex-1 text-sm font-semibold leading-6">{aviso}</p>
          <button aria-label="Cerrar notificación" className="rounded p-0.5 hover:bg-black/5" onClick={() => setAviso("")} type="button">
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
