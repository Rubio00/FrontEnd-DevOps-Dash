"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type {
  Categoria,
  DatosInsumo,
  DatosProducto,
  Ingrediente,
  Insumo,
  ProveedorOpcion,
} from "@/types/inventario";

type CatalogKind = "elaborado" | "reventa" | "insumo";

type RecipeDraft = {
  key: string;
  insumoId: number | "";
  cantidad: string;
};

export type ProductFormResult = {
  kind: CatalogKind;
  insumo?: DatosInsumo;
  producto?: DatosProducto;
  receta?: Ingrediente[];
  stockMinimo: number;
};

type Props = {
  categorias: Categoria[];
  insumos: Insumo[];
  proveedores: ProveedorOpcion[];
  nombresExistentes: string[];
  skusExistentes: string[];
  onClose: () => void;
  onSave: (result: ProductFormResult) => Promise<void>;
};

const input =
  "mt-2 w-full rounded-xl border border-primary/15 px-3 py-3 text-sm font-normal outline-none placeholder:text-ink/30 focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function ProductFormModal({
  categorias,
  insumos,
  proveedores,
  nombresExistentes,
  skusExistentes,
  onClose,
  onSave,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [sku, setSku] = useState("");
  const [precio, setPrecio] = useState("");
  const [kind, setKind] = useState<CatalogKind>("elaborado");
  const [unidad, setUnidad] = useState("und");
  const [minStock, setMinStock] = useState("10");
  const [proveedorIds, setProveedorIds] = useState<number[]>([]);
  const [receta, setReceta] = useState<RecipeDraft[]>([]);
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<number | "">(
    insumos[0]?.id ?? "",
  );
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const disponibles = insumos.filter(
    (insumo) => !receta.some((linea) => linea.insumoId === insumo.id),
  );

  function agregarIngrediente() {
    const insumo = disponibles.find((item) => item.id === ingredienteSeleccionado);
    if (!insumo) return;

    setReceta((actual) => [
      ...actual,
      { key: `receta-${Date.now()}`, insumoId: insumo.id, cantidad: "" },
    ]);
    setIngredienteSeleccionado(disponibles.find((item) => item.id !== insumo.id)?.id ?? "");
    setError("");
  }

  function cambiarCantidad(key: string, valor: string) {
    setReceta((actual) =>
      actual.map((linea) => (linea.key === key ? { ...linea, cantidad: valor } : linea)),
    );
    setError("");
  }

  function alternarProveedor(id: number) {
    setProveedorIds((actual) =>
      actual.includes(id) ? actual.filter((item) => item !== id) : [...actual, id],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const nombreLimpio = nombre.trim();
    const skuLimpio = sku.trim().toUpperCase();
    const categoriaLimpia = categoria.trim();
    const precioNumero = Number(precio);
    const minimo = Number(minStock);

    if (!nombreLimpio || !categoriaLimpia || !skuLimpio) {
      setError("Completá nombre, categoría y SKU.");
      return;
    }
    if (nombresExistentes.some((item) => item.toLowerCase() === nombreLimpio.toLowerCase())) {
      setError("Ya existe un producto o insumo con ese nombre.");
      return;
    }
    if (skusExistentes.some((item) => item.toUpperCase() === skuLimpio)) {
      setError("Ya existe un registro con ese SKU.");
      return;
    }
    if (!Number.isFinite(minimo) || minimo < 0) {
      setError("El stock mínimo debe ser un número mayor o igual a cero.");
      return;
    }
    if (kind !== "insumo" && (!Number.isFinite(precioNumero) || precioNumero <= 0)) {
      setError("El precio de venta debe ser mayor que cero.");
      return;
    }

    let recetaFinal: Ingrediente[] | undefined;
    if (kind === "elaborado") {
      if (receta.length === 0) {
        setError("Agregá al menos un ingrediente a la receta.");
        return;
      }
      recetaFinal = receta.map((linea) => ({
        insumoId: Number(linea.insumoId),
        cantidad: Number(linea.cantidad),
      }));
      if (recetaFinal.some((linea) => !linea.insumoId || !Number.isFinite(linea.cantidad) || linea.cantidad <= 0)) {
        setError("Cada ingrediente debe tener una cantidad mayor que cero.");
        return;
      }
    }

    setGuardando(true);
    try {
      const datosInsumo: DatosInsumo | undefined =
        kind === "elaborado"
          ? undefined
          : {
              nombre: nombreLimpio,
              sku: skuLimpio,
              categoria: categoriaLimpia,
              unidad: kind === "reventa" ? "und" : unidad,
              costoPromedio: 0,
              activo: true,
              proveedorIds,
            };

      const datosProducto: DatosProducto | undefined =
        kind === "insumo"
          ? undefined
          : {
              nombre: nombreLimpio,
              sku: skuLimpio,
              categoria: categoriaLimpia,
              tipo: kind,
              precio: precioNumero,
              insumoId: null,
              activo: true,
            };

      await onSave({
        kind,
        insumo: datosInsumo,
        producto: datosProducto,
        receta: recetaFinal,
        stockMinimo: minimo,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el producto.");
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <section
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between border-b border-primary/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-primary">Nuevo producto</h2>
            <p className="mt-1 text-sm text-muted">
              Registrá una receta de menú, un item de reventa o un insumo.
            </p>
          </div>
          <button
            aria-label="Cerrar ventana"
            className="rounded-lg px-3 py-2 text-sm font-bold text-ink/50 transition hover:bg-page hover:text-primary"
            onClick={onClose}
            type="button"
          >
            Cerrar
          </button>
        </div>

        <form className="space-y-5 p-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-primary">
              Nombre
              <input autoFocus className={input} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Pan dulce" required value={nombre} />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Categoría
              <select className={input} onChange={(e) => setCategoria(e.target.value)} required value={categoria}>
                <option disabled value="">Seleccioná una categoría</option>
                {categorias.map((opcion) => (
                  <option key={opcion.id} value={opcion.nombre}>{opcion.nombre}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-primary">
              SKU
              <input className={`${input} uppercase`} onChange={(e) => setSku(e.target.value)} placeholder="Ej. INS-PAN-001" required value={sku} />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Tipo de producto
              <select className={input} onChange={(e) => setKind(e.target.value as CatalogKind)} value={kind}>
                <option value="elaborado">Receta de menú</option>
                <option value="reventa">Item de reventa</option>
                <option value="insumo">Insumo / ingrediente</option>
              </select>
            </label>
            {kind !== "insumo" && (
              <label className="block text-sm font-semibold text-primary">
                Precio de venta (USD)
                <input className={input} min="0.01" step="0.01" type="number" onChange={(e) => setPrecio(e.target.value)} placeholder="0.00" required value={precio} />
              </label>
            )}
            {kind === "insumo" && (
              <label className="block text-sm font-semibold text-primary">
                Unidad de medida
                <select className={input} onChange={(e) => setUnidad(e.target.value)} value={unidad}>
                  <option value="und">Unidad</option>
                  <option value="g">Gramos (g)</option>
                  <option value="ml">Mililitros (ml)</option>
                </select>
              </label>
            )}
          </div>

          {kind !== "elaborado" && (
            <fieldset className="rounded-2xl border border-primary/10 p-4">
              <legend className="px-2 text-sm font-bold text-primary">Proveedores</legend>
              <p className="mb-3 text-xs text-muted">Seleccioná quién abastece este insumo.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {proveedores.map((proveedor) => (
                  <label key={proveedor.id} className="flex items-center gap-2 rounded-xl border border-primary/10 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={proveedorIds.includes(proveedor.id)}
                      onChange={() => alternarProveedor(proveedor.id)}
                      className="h-4 w-4 rounded border-primary/30"
                    />
                    {proveedor.nombre}
                  </label>
                ))}
                {proveedores.length === 0 && <p className="text-sm text-muted">No hay proveedores registrados.</p>}
              </div>
            </fieldset>
          )}

          <fieldset className="rounded-2xl border border-primary/10 p-4">
            <legend className="px-2 text-sm font-bold text-primary">Control de existencias</legend>
            <label className="block text-sm font-semibold text-primary">
              Stock mínimo por sucursal
              <input className={input} min="0" step="0.001" type="number" onChange={(e) => setMinStock(e.target.value)} required value={minStock} />
            </label>
            <p className="mt-2 text-xs text-muted">
              El stock real se carga desde Compras; desde Inventario solo se consulta.
            </p>
          </fieldset>

          {kind === "elaborado" && (
            <fieldset className="rounded-2xl border border-primary/10 p-4">
              <legend className="px-2 text-sm font-bold text-primary">Receta</legend>
              <p className="mb-3 text-xs text-muted">Insumos necesarios para preparar una unidad.</p>

              {receta.length === 0 && (
                <p className="rounded-xl border border-dashed border-primary/15 px-4 py-6 text-center text-sm text-muted">
                  Todavía no agregaste ingredientes.
                </p>
              )}

              <div className="space-y-3">
                {receta.map((linea) => {
                  const insumo = insumos.find((item) => item.id === linea.insumoId);
                  return (
                    <div key={linea.key} className="grid grid-cols-[1fr_120px_32px] items-center gap-2">
                      <span className="text-sm font-semibold text-primary">
                        {insumo?.nombre ?? "Insumo"}
                        <span className="ml-1 text-xs font-normal text-muted">({insumo?.unidad})</span>
                      </span>
                      <input
                        className={input}
                        type="number"
                        min="0.001"
                        step="0.001"
                        placeholder="Cantidad"
                        value={linea.cantidad}
                        onChange={(e) => cambiarCantidad(linea.key, e.target.value)}
                        aria-label={`Cantidad de ${insumo?.nombre ?? "insumo"}`}
                      />
                      <button
                        type="button"
                        onClick={() => setReceta((actual) => actual.filter((item) => item.key !== linea.key))}
                        className="text-ink/40 hover:text-red-600"
                        aria-label="Quitar ingrediente"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                <select
                  className={input}
                  value={ingredienteSeleccionado}
                  onChange={(e) => setIngredienteSeleccionado(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">Seleccioná un insumo...</option>
                  {disponibles.map((insumo) => (
                    <option key={insumo.id} value={insumo.id}>{insumo.nombre} ({insumo.unidad})</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={agregarIngrediente}
                  disabled={ingredienteSeleccionado === ""}
                  className="rounded-xl border border-primary/15 px-4 py-2 text-sm font-bold text-primary transition hover:bg-page disabled:opacity-40"
                >
                  + Agregar
                </button>
              </div>
            </fieldset>
          )}

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-primary/10 pt-5">
            <button className="rounded-xl border border-primary/15 px-4 py-2.5 text-sm font-bold text-ink/60 transition hover:bg-page" onClick={onClose} type="button">
              Cancelar
            </button>
            <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-60" disabled={guardando} type="submit">
              {guardando ? "Guardando..." : "Crear producto"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
