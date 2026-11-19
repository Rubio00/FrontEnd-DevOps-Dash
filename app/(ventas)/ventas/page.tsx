
"use client";

import { useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  emoji: string;
  description: string;
};

type CartItem = Product & {
  quantity: number;
};

const products: Product[] = [
  { id: 1, name: "Espresso", category: "Cafés", price: 2.00, emoji: "☕", description: "Café intenso y aromático" },
  { id: 2, name: "Americano", category: "Cafés", price: 2.50, emoji: "☕", description: "Espresso con agua caliente" },
  { id: 3, name: "Cappuccino", category: "Cafés", price: 3.50, emoji: "🥛", description: "Espresso con leche espumada" },
  { id: 4, name: "Latte Grande", category: "Cafés", price: 4.00, emoji: "☕", description: "Café con leche cremosa" },
  { id: 5, name: "Mocha", category: "Cafés", price: 4.25, emoji: "🍫", description: "Café con chocolate" },
  { id: 6, name: "Cold Brew", category: "Bebidas", price: 3.75, emoji: "🧋", description: "Café frío de extracción lenta" },
  { id: 7, name: "Limonada", category: "Bebidas", price: 2.50, emoji: "🍋", description: "Limonada natural" },
  { id: 8, name: "Té Helado", category: "Bebidas", price: 2.75, emoji: "🧊", description: "Té refrescante" },
  { id: 9, name: "Cheesecake", category: "Postres", price: 3.50, emoji: "🍰", description: "Pastel cremoso de queso" },
  { id: 10, name: "Brownie", category: "Postres", price: 2.75, emoji: "🍫", description: "Brownie de chocolate" },
  { id: 11, name: "Croissant", category: "Alimentos", price: 2.50, emoji: "🥐", description: "Croissant recién horneado" },
  { id: 12, name: "Sándwich Club", category: "Alimentos", price: 5.50, emoji: "🥪", description: "Sándwich especial de la casa" },
];

const categories = ["Todos", "Cafés", "Bebidas", "Postres", "Alimentos"];

export default function VentasPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [invoiceType, setInvoiceType] = useState("Consumidor final");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [message, setMessage] = useState("");

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "Todos" ||
      product.category === selectedCategory;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setMessage("");

    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, amount: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeProduct = (id: number) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cart]
  );

  const iva = subtotal * 0.13;
  const total = subtotal + iva;

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const formatMoney = (amount: number) =>
    `$${amount.toFixed(2)}`;

  const handleSale = () => {
    if (cart.length === 0) return;

    setMessage(
      "Venta preparada correctamente. La conexión con el backend está pendiente."
    );
  };

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#35251D] lg:flex">

      {/* BARRA LATERAL */}
      <aside className="flex w-full flex-col bg-[#30221B] text-[#F8F0E5] lg:fixed lg:inset-y-0 lg:w-64">

        <div className="border-b border-white/10 px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B58A60] text-2xl">
              ☕
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">
                ORÍGENES SV
              </h1>
              <p className="text-xs text-[#C9B7A4]">
                Sistema de gestión
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-7">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#A99583]">
            Menú principal
          </p>

          <nav className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl bg-[#8B6347] px-4 py-3 font-medium text-white">
              <span>🛒</span>
              Ventas
              <span className="ml-auto rounded-md bg-white/20 px-2 py-0.5 text-xs">
                POS
              </span>
            </div>

            {[
              ["📦", "Inventario"],
              ["🧾", "Facturación"],
              ["💰", "Caja"],
              ["📊", "Reportes"],
              ["⚙️", "Configuración"],
            ].map(([icon, name]) => (
              <div
                key={name}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#C9B7A4] transition hover:bg-white/10"
              >
                <span>{icon}</span>
                {name}
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-auto hidden border-t border-white/10 p-5 lg:block">
          <p className="text-sm font-medium">Restaurante Orígenes</p>
          <p className="mt-1 text-xs text-[#A99583]">
            Punto de venta · El Salvador
          </p>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <section className="min-w-0 flex-1 lg:ml-64">

        {/* ENCABEZADO */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8DED1] bg-[#FBF9F5] px-5 py-5 md:px-8">
          <div>
            <p className="text-sm text-[#927D6B]">
              Restaurante Orígenes SV / Operaciones
            </p>
            <h2 className="mt-1 text-2xl font-bold">
              Punto de venta
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#E8DED1] bg-white px-4 py-2">
              <p className="text-xs text-[#927D6B]">Estado de caja</p>
              <p className="text-sm font-semibold text-green-700">
                ● Disponible
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E9D8C5] font-bold text-[#67452F]">
              A
            </div>
          </div>
        </header>

        {/* ÁREA DE TRABAJO */}
        <div className="grid min-h-[calc(100vh-90px)] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px]">

          {/* CATÁLOGO */}
          <section className="p-5 md:p-8">

            <div className="mb-7">
              <p className="text-sm font-medium uppercase tracking-widest text-[#A27B59]">
                Nuestra carta
              </p>
              <h3 className="mt-2 text-2xl font-bold">
                ¿Qué vamos a servir hoy?
              </h3>
              <p className="mt-1 text-sm text-[#927D6B]">
                Seleccioná los productos para agregarlos a la venta.
              </p>
            </div>

            {/* BUSCADOR */}
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full rounded-xl border border-[#E5D9CB] bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-[#A27B59] focus:ring-2 focus:ring-[#A27B59]/20"
              />
            </div>

            {/* CATEGORÍAS */}
            <div className="mb-7 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                    selectedCategory === category
                      ? "bg-[#65432F] text-white shadow-md"
                      : "border border-[#E5D9CB] bg-white text-[#806B59] hover:bg-[#EFE5D9]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* PRODUCTOS */}
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-bold">Productos disponibles</h4>
              <span className="text-xs text-[#927D6B]">
                {filteredProducts.length} productos
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group rounded-2xl border border-[#E9DFD3] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-28 items-center justify-center rounded-xl bg-[#F5EEE5] text-5xl transition group-hover:bg-[#EFE1D1]">
                    {product.emoji}
                  </div>

                  <p className="text-xs font-medium uppercase tracking-wider text-[#A27B59]">
                    {product.category}
                  </p>

                  <h5 className="mt-1 font-bold">
                    {product.name}
                  </h5>

                  <p className="mt-1 min-h-10 text-xs text-[#927D6B]">
                    {product.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-[#65432F]">
                      {formatMoney(product.price)}
                    </span>

                    <button
                      onClick={() => addToCart(product)}
                      className="rounded-lg bg-[#65432F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#493020]"
                    >
                      + Agregar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#D8C6B3] p-10 text-center text-[#927D6B]">
                No encontramos productos con esa búsqueda.
              </div>
            )}
          </section>

          {/* CARRITO */}
          <aside className="flex flex-col border-t border-[#E8DED1] bg-[#FBF9F5] xl:border-l xl:border-t-0">

            <div className="border-b border-[#E8DED1] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    Orden actual
                  </h3>
                  <p className="mt-1 text-sm text-[#927D6B]">
                    Detalle de la compra
                  </p>
                </div>

                <span className="rounded-full bg-[#EDE1D4] px-3 py-1 text-sm font-bold text-[#65432F]">
                  {totalItems} artículos
                </span>
              </div>
            </div>

            {/* PRODUCTOS DEL CARRITO */}
            <div className="min-h-40 flex-1 space-y-4 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
                  <span className="text-5xl">🛍️</span>
                  <p className="mt-4 font-semibold">
                    Tu carrito está vacío
                  </p>
                  <p className="mt-1 text-sm text-[#927D6B]">
                    Agregá productos para comenzar.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-[#EAE1D7] pb-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0E5D8] text-2xl">
                          {item.emoji}
                        </div>

                        <div>
                          <p className="text-sm font-bold">
                            {item.name}
                          </p>
                          <p className="text-xs text-[#927D6B]">
                            {formatMoney(item.price)} c/u
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeProduct(item.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                        aria-label={`Eliminar ${item.name}`}
                      >
                        Eliminar
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#DDCBBB] hover:bg-[#EFE5D9]"
                        >
                          −
                        </button>

                        <span className="w-4 text-center text-sm font-bold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#DDCBBB] hover:bg-[#EFE5D9]"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold">
                        {formatMoney(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FACTURACIÓN Y PAGO */}
            <div className="space-y-5 border-t border-[#E8DED1] p-6">

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#927D6B]">
                  Tipo de comprobante
                </label>

                <select
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.value)}
                  className="w-full rounded-xl border border-[#E5D9CB] bg-white px-4 py-3 text-sm outline-none focus:border-[#A27B59]"
                >
                  <option>Consumidor final</option>
                  <option>Comprobante de crédito fiscal (CCF)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#927D6B]">
                  Método de pago
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-[#E5D9CB] bg-white px-4 py-3 text-sm outline-none focus:border-[#A27B59]"
                >
                  <option>Efectivo</option>
                  <option>Tarjeta</option>
                  <option>Chivo Wallet</option>
                  <option>Bitcoin</option>
                </select>
              </div>

              {/* RESUMEN */}
              <div className="space-y-3 rounded-xl bg-[#F2EBE2] p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#806B59]">Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-[#806B59]">IVA (13 %)</span>
                  <span>{formatMoney(iva)}</span>
                </div>

                <div className="border-t border-[#DCCBBB] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Total a pagar</span>
                    <span className="text-2xl font-bold text-[#65432F]">
                      {formatMoney(total)}
                    </span>
                  </div>
                </div>
              </div>

              {message && (
                <p
                  role="status"
                  className="rounded-xl bg-green-50 p-3 text-xs leading-relaxed text-green-800"
                >
                  {message}
                </p>
              )}

              <button
                onClick={handleSale}
                disabled={cart.length === 0}
                className="w-full rounded-xl bg-[#65432F] py-4 font-bold text-white shadow-md transition hover:bg-[#493020] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Registrar venta →
              </button>

              <p className="text-center text-xs text-[#A18F7E]">
                Restaurante Orígenes SV · Sistema POS
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
