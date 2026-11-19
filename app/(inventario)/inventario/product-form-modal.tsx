"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { categories, createEmptyStockLevels } from "./inventory-data";
import type {
  InventoryItem,
  InventoryItemKind,
  Product,
  Supplier,
  Unit,
} from "./inventory-data";

type CatalogKind = "elaborado" | InventoryItemKind;

type RecipeDraft = {
  key: string;
  ingredientId: string;
  quantity: string;
};

export type ProductFormResult = {
  product?: Product;
  item?: InventoryItem;
};

type ProductFormModalProps = {
  items: InventoryItem[];
  suppliers: Supplier[];
  existingNames: string[];
  existingSkus: string[];
  onClose: () => void;
  onSave: (result: ProductFormResult) => void;
};

export default function ProductFormModal({
  items,
  suppliers,
  existingNames,
  existingSkus,
  onClose,
  onSave,
}: ProductFormModalProps) {
  const ingredients = items.filter((item) => item.kind === "insumo");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [kind, setKind] = useState<CatalogKind>("elaborado");
  const [unit, setUnit] = useState<Unit>("unidad");
  const [minStock, setMinStock] = useState("10");
  const [supplierIds, setSupplierIds] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<RecipeDraft[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState(ingredients[0]?.id ?? "");
  const [error, setError] = useState("");

  const availableIngredients = ingredients.filter(
    (ingredient) => !recipe.some((item) => item.ingredientId === ingredient.id),
  );
  const numericPrice = Number(price);
  const priceError = price !== "" && (!Number.isFinite(numericPrice) || numericPrice <= 0)
    ? "El precio de venta debe ser mayor que cero."
    : "";
  const numericMinStock = Number(minStock);
  const minStockError = minStock !== "" && (
    !Number.isFinite(numericMinStock) ||
    numericMinStock < 0 ||
    ((kind === "reventa" || unit === "unidad") && !Number.isInteger(numericMinStock))
  )
    ? "Ingresá una cantidad válida; para unidades usá números enteros."
    : "";

  function updateRecipeQuantity(key: string, value: string) {
    setError("");
    setRecipe((current) =>
      current.map((item) => (item.key === key ? { ...item, quantity: value } : item)),
    );
  }

  function addIngredient() {
    const ingredient = availableIngredients.find((item) => item.id === selectedIngredientId);
    if (!ingredient) return;

    const remainingIngredients = availableIngredients.filter((item) => item.id !== ingredient.id);
    setRecipe((current) => [
      ...current,
      {
        key: `recipe-${Date.now()}`,
        ingredientId: ingredient.id,
        quantity: "",
      },
    ]);
    setSelectedIngredientId(remainingIngredients[0]?.id ?? "");
    setError("");
  }

  function removeIngredient(key: string) {
    const removedIngredient = recipe.find((item) => item.key === key);
    setRecipe((current) => current.filter((item) => item.key !== key));
    if (removedIngredient && !selectedIngredientId) setSelectedIngredientId(removedIngredient.ingredientId);
    setError("");
  }

  function toggleSupplier(supplierId: string) {
    setSupplierIds((current) =>
      current.includes(supplierId)
        ? current.filter((id) => id !== supplierId)
        : [...current, supplierId],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedCategory = category.trim();
    const normalizedSku = sku.trim().toUpperCase();

    if (!normalizedName || !normalizedCategory || !normalizedSku) {
      setError("Completá el nombre, la categoría y el SKU.");
      return;
    }
    if (existingNames.some((item) => item.toLocaleLowerCase("es") === normalizedName.toLocaleLowerCase("es"))) {
      setError("Ya existe un producto o insumo con ese nombre.");
      return;
    }
    if (existingSkus.some((item) => item.toLocaleLowerCase("es") === normalizedSku.toLocaleLowerCase("es"))) {
      setError("El SKU ya está asignado a otro producto.");
      return;
    }

    const recordId = normalizedSku.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let numericPrice = 0;
    if (kind !== "insumo") {
      numericPrice = Number(price);
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        setError("Ingresá un precio de venta mayor que cero.");
        return;
      }
    }

    if (kind === "insumo" || kind === "reventa") {
      if (supplierIds.length === 0) {
        setError("Seleccioná al menos un proveedor disponible.");
        return;
      }
      const numericMinStock = Number(minStock);
      const itemUnit: Unit = kind === "reventa" ? "unidad" : unit;
      if (
        !Number.isFinite(numericMinStock) ||
        numericMinStock < 0 ||
        (itemUnit === "unidad" && !Number.isInteger(numericMinStock))
      ) {
        setError("Ingresá un stock mínimo válido para la unidad seleccionada.");
        return;
      }

      const item: InventoryItem = {
        id: `${kind}-${recordId}`,
        sku: normalizedSku,
        name: normalizedName,
        category: normalizedCategory,
        kind,
        unit: itemUnit,
        supplierIds,
        stockByBranch: createEmptyStockLevels(numericMinStock),
      };

      if (kind === "insumo") {
        onSave({ item });
        return;
      }

      onSave({
        item,
        product: {
          id: `product-${recordId}`,
          sku: normalizedSku,
          name: normalizedName,
          category: normalizedCategory,
          price: numericPrice,
          kind: "reventa",
          recipe: [{ ingredientId: item.id, quantity: 1 }],
        },
      });
      return;
    }

    if (ingredients.length === 0 || recipe.length === 0) {
      setError("Necesitás al menos un insumo para crear una receta.");
      return;
    }
    const ingredientIds = recipe.map((item) => item.ingredientId);
    if (new Set(ingredientIds).size !== ingredientIds.length) {
      setError("Cada ingrediente puede aparecer solamente una vez en la receta.");
      return;
    }
    const parsedRecipe = recipe.map((item) => ({
      ingredientId: item.ingredientId,
      quantity: Number(item.quantity),
    }));
    if (parsedRecipe.some((item) => {
      const ingredient = ingredients.find((current) => current.id === item.ingredientId);
      return !ingredient || !Number.isFinite(item.quantity) || item.quantity <= 0;
    })) {
      setError("Cada ingrediente debe ser un insumo válido con cantidad mayor que cero.");
      return;
    }

    onSave({
      product: {
        id: `product-${recordId}`,
          sku: normalizedSku,
        name: normalizedName,
        category: normalizedCategory,
        price: numericPrice,
        kind: "elaborado",
        recipe: parsedRecipe,
      },
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <section
        aria-describedby="product-modal-description"
        aria-labelledby="product-modal-title"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between border-b border-primary/10 px-6 py-5">
          <div>
            <h2 id="product-modal-title" className="text-xl font-bold text-primary">Nuevo producto</h2>
            <p id="product-modal-description" className="mt-1 text-sm text-muted">
              Registrá una receta de menú, un item de reventa o un insumo.
            </p>
          </div>
          <button
            aria-label="Cerrar ventana"
            className="rounded-lg px-3 py-2 text-sm font-bold text-ink/50 transition hover:bg-page hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent"
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
              <input
                autoFocus
                className="mt-2 w-full rounded-xl border border-primary/15 px-3 py-3 text-sm font-normal outline-none placeholder:text-ink/30 focus:border-accent focus:ring-2 focus:ring-accent/20"
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Pan dulce"
                required
                type="text"
                value={name}
              />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Categoría
              <select
                className="mt-2 w-full rounded-xl border border-primary/15 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                onChange={(event) => {
                  setCategory(event.target.value);
                  setError("");
                }}
                required
                value={category}
              >
                <option disabled value="">Seleccioná una categoría</option>
                {categories.map((option) => (
                  <option key={option.id} value={option.name}>{option.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-primary">
              SKU
              <input
                className="mt-2 w-full rounded-xl border border-primary/15 px-3 py-3 text-sm font-normal uppercase outline-none placeholder:text-ink/30 focus:border-accent focus:ring-2 focus:ring-accent/20"
                onChange={(event) => setSku(event.target.value)}
                placeholder="Ej. INS-PAN-001"
                required
                type="text"
                value={sku}
              />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Tipo de producto
              <select
                className="mt-2 w-full rounded-xl border border-primary/15 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                onChange={(event) => {
                  setKind(event.target.value as CatalogKind);
                  setError("");
                }}
                value={kind}
              >
                <option value="elaborado">Receta de menú</option>
                <option value="reventa">Item de reventa</option>
                <option value="insumo">Insumo / ingrediente</option>
              </select>
            </label>
            {kind !== "insumo" && (
              <label className="block text-sm font-semibold text-primary">
                Precio de venta (USD)
                <input
                  aria-invalid={Boolean(priceError)}
                  className={`mt-2 w-full rounded-xl border px-3 py-3 text-sm font-normal outline-none placeholder:text-ink/30 focus:ring-2 ${priceError ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "border-primary/15 focus:border-accent focus:ring-accent/20"}`}
                  min="0.01"
                  onChange={(event) => {
                    setPrice(event.target.value);
                    setError("");
                  }}
                  placeholder="0.00"
                  required
                  step="0.01"
                  type="number"
                  value={price}
                />
                {priceError && <span className="mt-2 block text-xs font-medium text-red-700" role="alert">{priceError}</span>}
              </label>
            )}
          </div>

          {kind === "elaborado" ? (
            <fieldset className="rounded-2xl border border-primary/10 p-4">
              <legend className="px-2 text-sm font-bold text-primary">Receta por unidad</legend>
              <p className="mb-4 text-xs leading-5 text-muted">
                Solo se pueden seleccionar insumos. Los items de reventa no forman parte de las recetas.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="min-w-0 flex-1 text-xs font-semibold text-primary">
                  Ingrediente
                  <select
                    className="mt-2 w-full rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    disabled={availableIngredients.length === 0}
                    onChange={(event) => setSelectedIngredientId(event.target.value)}
                    value={selectedIngredientId}
                  >
                    {availableIngredients.map((option) => (
                      <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                  </select>
                </label>
                <button
                  className="self-end rounded-xl border border-primary/15 px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={availableIngredients.length === 0}
                  onClick={addIngredient}
                  type="button"
                >
                  + Agregar ingrediente
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {recipe.map((item, index) => {
                  const ingredient = ingredients.find((current) => current.id === item.ingredientId);
                  const quantityError = item.quantity !== "" && (!Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0)
                    ? "La cantidad debe ser mayor que cero."
                    : "";
                  return (
                    <div key={item.key} className="grid gap-3 rounded-xl bg-page p-3 sm:grid-cols-[minmax(0,1fr)_160px_90px] sm:items-start">
                      <div className="self-center">
                        <p className="text-xs font-semibold text-primary">Ingrediente {index + 1}</p>
                        <p className="mt-2 text-sm font-medium text-ink">{ingredient?.name}</p>
                      </div>
                      <label className="text-xs font-semibold text-primary">
                        Cantidad {ingredient ? `(${ingredient.unit})` : ""}
                        <input
                          aria-invalid={Boolean(quantityError)}
                          className="mt-2 w-full rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                          min="0.01"
                          onChange={(event) => updateRecipeQuantity(item.key, event.target.value)}
                          placeholder="0"
                          required
                          step="0.01"
                          type="number"
                          value={item.quantity}
                        />
                        {quantityError && <span className="mt-2 block text-xs font-medium text-red-700" role="alert">{quantityError}</span>}
                      </label>
                      <button
                        className="self-center rounded-xl border border-red-200 px-3 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                        onClick={() => removeIngredient(item.key)}
                        type="button"
                      >
                        Quitar
                      </button>
                    </div>
                  );
                })}
                {recipe.length === 0 && (
                  <p className="rounded-xl bg-page p-4 text-center text-sm text-muted">
                    Seleccioná un insumo y agregalo a la receta.
                  </p>
                )}
              </div>
            </fieldset>
          ) : (
            <div className="space-y-5">
              <fieldset className="rounded-2xl border border-primary/10 p-4">
                <legend className="px-2 text-sm font-bold text-primary">Proveedores disponibles</legend>
                <p className="mb-4 text-xs leading-5 text-muted">
                  Seleccioná uno o varios proveedores que pueden suministrar este producto.
                </p>
                {suppliers.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {suppliers.map((supplier) => (
                      <label key={supplier.id} className="flex cursor-pointer items-start gap-3 rounded-xl bg-page p-3 text-sm">
                        <input
                          checked={supplierIds.includes(supplier.id)}
                          className="mt-1 h-4 w-4 accent-[#65432f]"
                          onChange={() => toggleSupplier(supplier.id)}
                          type="checkbox"
                        />
                        <span>
                          <span className="block font-bold text-primary">{supplier.name}</span>
                          <span className="mt-1 block text-xs text-muted">{supplier.contact}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                    Primero registrá un proveedor desde la pestaña Proveedores.
                  </p>
                )}
              </fieldset>

              <fieldset className="rounded-2xl border border-primary/10 p-4">
                <legend className="px-2 text-sm font-bold text-primary">Control de existencias</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  {kind === "insumo" && (
                    <label className="text-sm font-semibold text-primary">
                      Unidad de medida
                      <select
                        className="mt-2 w-full rounded-xl border border-primary/15 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                        onChange={(event) => setUnit(event.target.value as Unit)}
                        value={unit}
                      >
                        <option value="unidad">Unidad</option>
                        <option value="g">Gramos (g)</option>
                        <option value="ml">Mililitros (ml)</option>
                      </select>
                    </label>
                  )}
                  <label className="text-sm font-semibold text-primary">
                    Stock mínimo por sucursal {kind === "reventa" ? "(unidades)" : `(${unit})`}
                    <input
                      aria-invalid={Boolean(minStockError)}
                      className="mt-2 w-full rounded-xl border border-primary/15 px-3 py-3 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                      min="0"
                      onChange={(event) => {
                        setMinStock(event.target.value);
                        setError("");
                      }}
                      required
                      step={kind === "reventa" || unit === "unidad" ? "1" : "0.01"}
                      type="number"
                      value={minStock}
                    />
                    {minStockError && <span className="mt-2 block text-xs font-medium text-red-700" role="alert">{minStockError}</span>}
                  </label>
                </div>
              </fieldset>
            </div>
          )}

          <div className="rounded-xl bg-page p-4 text-xs leading-5 text-muted">
            {kind === "elaborado"
              ? "La receta aparecerá en el menú y su disponibilidad dependerá de los insumos."
              : kind === "reventa"
                ? "El item aparecerá en el menú y comenzará sin existencias; abastecimiento registrará las adquisiciones."
                : "El insumo no aparecerá en el menú y comenzará sin existencias en todas las sucursales."}
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-primary/10 pt-5">
            <button
              className="rounded-xl border border-primary/15 px-4 py-2.5 text-sm font-bold text-ink/60 transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-accent"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent"
              type="submit"
            >
              Crear producto
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
