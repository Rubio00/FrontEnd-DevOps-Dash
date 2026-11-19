"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { InventoryItem, Supplier } from "./inventory-data";

type SupplierManagerProps = {
  suppliers: Supplier[];
  items: InventoryItem[];
  onAdd: (supplier: Supplier) => void;
  onDelete: (supplierId: string) => void;
};

export default function SupplierManager({
  suppliers,
  items,
  onAdd,
  onDelete,
}: SupplierManagerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function addSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName) {
      setError("El nombre del proveedor es obligatorio.");
      return;
    }
    if (suppliers.some((supplier) => supplier.name.toLocaleLowerCase("es") === normalizedName.toLocaleLowerCase("es"))) {
      setError("Ya existe un proveedor con ese nombre.");
      return;
    }

    onAdd({
      id: `supplier-${normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: normalizedName,
      contact: contact.trim(),
      phone: phone.trim(),
      email: email.trim(),
    });
    setName("");
    setContact("");
    setPhone("");
    setEmail("");
    setError("");
    setFormOpen(false);
  }

  function deleteSupplier(supplier: Supplier) {
    const assignedItems = items.filter((item) => item.supplierIds.includes(supplier.id));
    const detail = assignedItems.length > 0
      ? ` También se quitará su asignación de ${assignedItems.length} productos.`
      : "";
    if (window.confirm(`¿Eliminar a ${supplier.name}?${detail}`)) {
      onDelete(supplier.id);
    }
  }

  return (
    <section className="mt-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-primary/10 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-primary">Proveedores</h2>
          <p className="mt-1 text-sm text-muted">
            Administrá proveedores y sus asignaciones a insumos o productos de reventa.
          </p>
        </div>
        <button
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#493020] focus:outline-none focus:ring-2 focus:ring-accent"
          onClick={() => {
            setFormOpen((current) => !current);
            setError("");
          }}
          type="button"
        >
          {formOpen ? "Cerrar formulario" : "+ Nuevo proveedor"}
        </button>
      </div>

      {formOpen && (
        <form className="mt-5 rounded-2xl border border-primary/10 bg-white p-5 shadow-sm" onSubmit={addSupplier}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-primary">
              Nombre del proveedor
              <input
                autoFocus
                className="mt-2 w-full rounded-xl border border-primary/15 px-3 py-3 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                onChange={(event) => setName(event.target.value)}
                required
                type="text"
                value={name}
              />
            </label>
            <label className="text-sm font-semibold text-primary">
              Persona de contacto
              <input
                className="mt-2 w-full rounded-xl border border-primary/15 px-3 py-3 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                onChange={(event) => setContact(event.target.value)}
                type="text"
                value={contact}
              />
            </label>
            <label className="text-sm font-semibold text-primary">
              Teléfono
              <input
                className="mt-2 w-full rounded-xl border border-primary/15 px-3 py-3 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                onChange={(event) => setPhone(event.target.value)}
                type="tel"
                value={phone}
              />
            </label>
            <label className="text-sm font-semibold text-primary">
              Correo
              <input
                className="mt-2 w-full rounded-xl border border-primary/15 px-3 py-3 text-sm font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                value={email}
              />
            </label>
          </div>
          {error && <p className="mt-4 text-sm font-semibold text-red-700" role="alert">{error}</p>}
          <div className="mt-5 flex justify-end">
            <button
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent"
              type="submit"
            >
              Guardar proveedor
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {suppliers.map((supplier) => {
          const assignedItems = items.filter((item) => item.supplierIds.includes(supplier.id));
          return (
            <article key={supplier.id} className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-primary">{supplier.name}</h3>
                  <p className="mt-1 text-sm text-muted">{supplier.contact || "Sin contacto registrado"}</p>
                </div>
                <button
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                  onClick={() => deleteSupplier(supplier)}
                  type="button"
                >
                  Eliminar
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink/55">
                <span>{supplier.phone || "Sin teléfono"}</span>
                <span>{supplier.email || "Sin correo"}</span>
              </div>
              <div className="mt-5 border-t border-primary/10 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink/40">
                  Productos asignados · {assignedItems.length}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {assignedItems.length > 0 ? assignedItems.map((item) => (
                    <span key={item.id} className="rounded-lg bg-page px-2.5 py-1.5 text-xs font-medium text-ink/65">
                      {item.name}
                    </span>
                  )) : (
                    <span className="text-sm text-muted">Todavía no tiene productos asignados.</span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
