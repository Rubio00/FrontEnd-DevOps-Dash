"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Ingredient, Product } from "./inventory-data";

type RecipeDraft = {
  key: string;
  ingredientId: string;
  quantity: string;
};

type ProductFormModalProps = {
  ingredients: Ingredient[];
  existingProductNames: string[];
  onClose: () => void;
  onSave: (product: Product, resaleIngredient?: Ingredient) => void;
};

export default function ProductFormModal({
  ingredients,
  existingProductNames,
  onClose,
  onSave,
}: ProductFormModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [kind, setKind] = useState<Product["kind"]>("elaborado");
  const [recipe, setRecipe] = useState<RecipeDraft[]>([
    { key: "recipe-0", ingredientId: ingredients[0]?.id ?? "", quantity: "" },
  ]);
  const [minStock, setMinStock] = useState("10");
  const [error, setError] = useState("");

  function updateRecipe(key: string, field: "ingredientId" | "quantity", value: string) {
    setRecipe((current) =>
      current.map((item) => (item.key === key ? { ...item, [field]: value } : item)),
    );
  }

  function addIngredient() {
    setRecipe((current) => [
      ...current,
      {
        key: `recipe-${Date.now()}`,
        ingredientId: ingredients[0]?.id ?? "",
        quantity: "",
      },
    ]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedCategory = category.trim();
    const numericPrice = Number(price);

    if (!normalizedName || !normalizedCategory) {
      setError("Completá el nombre y la categoría del producto.");
      return;
    }
    if (existingProductNames.some((item) => item.toLocaleLowerCase("es") === normalizedName.toLocaleLowerCase("es"))) {
      setError("Ya existe un producto con ese nombre.");
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Ingresá un precio de venta mayor que cero.");
      return;
    }

    const timestamp = Date.now();

    if (kind === "reventa") {
      const numericMinStock = Number(minStock);
      if (!Number.isInteger(numericMinStock) || numericMinStock < 0) {
        setError("El stock mínimo debe ser una unidad entera igual o mayor que cero.");
        return;
      }

      const ingredientId = `reventa-${timestamp}`;
      const resaleIngredient: Ingredient = {
        id: ingredientId,
        sku: `REV-${timestamp.toString().slice(-6)}`,
        name: normalizedName,
        category: "Reventa",
        stock: 0,
        minStock: numericMinStock,
        unit: "unidad",
        updatedAt: "Ahora",
      };
      onSave(
        {
          id: `product-${timestamp}`,
          name: normalizedName,
          category: normalizedCategory,
          price: numericPrice,
          kind,
          recipe: [{ ingredientId, quantity: 1 }],
        },
        resaleIngredient,
      );
      return;
    }

    if (recipe.length === 0) {
      setError("Agregá al menos un ingrediente a la receta.");
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
    if (parsedRecipe.some((item) => !item.ingredientId || !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      setError("Cada ingrediente debe tener una cantidad mayor que cero.");
      return;
    }

    onSave({
      id: `product-${timestamp}`,
      name: normalizedName,
      category: normalizedCategory,
      price: numericPrice,
      kind,
      recipe: parsedRecipe,
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
            <h2 id="product-modal-title" className="text-xl font-bold text-primary">
              Nuevo producto
            </h2>
            <p id="product-modal-description" className="mt-1 text-sm text-muted">
              Creá un producto del menú y definí cómo controlará sus existencias.
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
              Nombre del producto
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
              <input
                className="mt-2 w-full rounded-xl border border-primary/15 px-3 py-3 text-sm font-normal outline-none placeholder:text-ink/30 focus:border-accent focus:ring-2 focus:ring-accent/20"
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Ej. Repostería"
                required
                type="text"
                value={category}
              />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Precio de venta (USD)
              <input
                className="mt-2 w-full rounded-xl border border-primary/15 px-3 py-3 text-sm font-normal outline-none placeholder:text-ink/30 focus:border-accent focus:ring-2 focus:ring-accent/20"
                min="0.01"
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0.00"
                required
                step="0.01"
                type="number"
                value={price}
              />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Tipo de producto
              <select
                className="mt-2 w-full rounded-xl border border-primary/15 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                onChange={(event) => {
                  setKind(event.target.value as Product["kind"]);
                  setError("");
                }}
                value={kind}
              >
                <option value="elaborado">Elaborado con receta</option>
                <option value="reventa">Empacado para reventa</option>
              </select>
            </label>
          </div>

          {kind === "elaborado" ? (
            <fieldset className="rounded-2xl border border-primary/10 p-4">
              <legend className="px-2 text-sm font-bold text-primary">Receta por unidad</legend>
              <p className="mb-4 text-xs leading-5 text-muted">
                Seleccioná los insumos y las cantidades que consumirá el POS al vender una unidad.
              </p>
              <div className="space-y-3">
                {recipe.map((item, index) => {
                  const ingredient = ingredients.find((current) => current.id === item.ingredientId);
                  return (
                    <div key={item.key} className="grid gap-3 rounded-xl bg-page p-3 sm:grid-cols-[minmax(0,1fr)_140px_90px] sm:items-end">
                      <label className="text-xs font-semibold text-primary">
                        Ingrediente {index + 1}
                        <select
                          className="mt-2 w-full rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                          onChange={(event) => updateRecipe(item.key, "ingredientId", event.target.value)}
                          value={item.ingredientId}
                        >
                          {ingredients.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs font-semibold text-primary">
                        Cantidad {ingredient ? `(${ingredient.unit})` : ""}
                        <input
                          className="mt-2 w-full rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                          min="0.01"
                          onChange={(event) => updateRecipe(item.key, "quantity", event.target.value)}
                          placeholder="0"
                          required
                          step="0.01"
                          type="number"
                          value={item.quantity}
                        />
                      </label>
                      <button
                        className="rounded-xl border border-red-200 px-3 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-35"
                        disabled={recipe.length === 1}
                        onClick={() => setRecipe((current) => current.filter((currentItem) => currentItem.key !== item.key))}
                        type="button"
                      >
                        Quitar
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                className="mt-4 rounded-xl border border-primary/15 px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-accent"
                onClick={addIngredient}
                type="button"
              >
                + Agregar ingrediente
              </button>
            </fieldset>
          ) : (
            <fieldset className="rounded-2xl border border-primary/10 p-4">
              <legend className="px-2 text-sm font-bold text-primary">Existencia de reventa</legend>
              <p className="mb-4 text-xs leading-5 text-muted">
                Se creará una existencia asociada sin unidades iniciales. El abastecimiento registrará las adquisiciones.
              </p>
              <label className="block text-sm font-semibold text-primary">
                Stock mínimo (unidades)
                <input
                  className="mt-2 w-full rounded-xl border border-primary/15 px-3 py-3 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  min="0"
                  onChange={(event) => setMinStock(event.target.value)}
                  required
                  step="1"
                  type="number"
                  value={minStock}
                />
              </label>
            </fieldset>
          )}

          <div className="rounded-xl bg-page p-4 text-xs leading-5 text-muted">
            {kind === "elaborado"
              ? "El producto elaborado no tendrá stock terminado: su disponibilidad dependerá de los ingredientes de la receta."
              : "La existencia comenzará en cero. Las unidades adquiridas ingresarán mediante el flujo de abastecimiento."}
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
