"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  type?: "elaborado" | "reventa";
};

type CartItem = Product & {
  quantity: number;
};

type Customer = {
  nombre: string;
  tipoDocumento: "NIT" | "DUI";
  numeroDocumento: string;
  nrc: string;
  telefono: string;
  email: string;
  departamento: string;
  municipio: string;
  direccion: string;
  codigoActividad: string;
  giro: string;
};

type CardData = {
  numero: string;
  titular: string;
  vencimiento: string;
  cvv: string;
};

const products: Product[] = [
  { id: 1, name: "Espresso", category: "Cafés", price: 2.00, image: "/images/productos/espresso.jpg", description: "Café intenso y aromático" },
  { id: 2, name: "Americano", category: "Cafés", price: 2.50, image: "/images/productos/americano.jpg", description: "Espresso con agua caliente" },
  { id: 3, name: "Cappuccino", category: "Cafés", price: 3.50, image: "/images/productos/cappuccino.jpg", description: "Espresso con leche espumada" },
  { id: 4, name: "Latte Grande", category: "Cafés", price: 4.00, image: "/images/productos/latte-grande.jpg", description: "Café con leche cremosa" },
  { id: 5, name: "Mocha", category: "Cafés", price: 4.25, image: "/images/productos/mocha.jpg", description: "Café con chocolate" },
  { id: 6, name: "Cold Brew", category: "Bebidas", price: 3.75, image: "/images/productos/cold-brew.jpg", description: "Café frío de extracción lenta" },
  { id: 7, name: "Limonada", category: "Bebidas", price: 2.50, image: "/images/productos/limonada.jpg", description: "Limonada natural" },
  { id: 8, name: "Té Helado", category: "Bebidas", price: 2.75, image: "/images/productos/te-helado.jpg", description: "Té refrescante" },
  { id: 9, name: "Cheesecake", category: "Postres", price: 3.50, image: "/images/productos/cheesecake.jpg", description: "Pastel cremoso de queso" },
  { id: 10, name: "Brownie", category: "Postres", price: 2.75, image: "/images/productos/brownie.jpg", description: "Brownie de chocolate" },
  { id: 11, name: "Croissant", category: "Alimentos", price: 2.50, image: "/images/productos/croissant.jpg", description: "Croissant recién horneado" },
  { id: 12, name: "Sándwich Club", category: "Alimentos", price: 5.50, image: "/images/productos/sandwich-club.jpg", description: "Sándwich especial de la casa" },
  { id: 13, name: "Agua embotellada", category: "Reventa", price: 0.75, image: "/images/productos/agua.jpg", description: "Agua purificada embotellada", type: "reventa" },
  { id: 14, name: "Gaseosa en lata", category: "Reventa", price: 1.25, image: "/images/productos/gaseosa.jpg", description: "Bebida gaseosa en presentación de lata", type: "reventa" },
  { id: 15, name: "Galletas empacadas", category: "Reventa", price: 1.50, image: "/images/productos/galletas.jpg", description: "Galletas listas para consumir", type: "reventa" },
];

const categories = [
  "Todos",
  "Cafés",
  "Bebidas",
  "Postres",
  "Alimentos",
  "Reventa",
];

const initialCustomer: Customer = {
  nombre: "",
  tipoDocumento: "NIT",
  numeroDocumento: "",
  nrc: "",
  telefono: "",
  email: "",
  departamento: "",
  municipio: "",
  direccion: "",
  codigoActividad: "",
  giro: "",
};

const initialCard: CardData = {
  numero: "",
  titular: "",
  vencimiento: "",
  cvv: "",
};

const departamentosMunicipios: Record<string, string[]> = {
  "Ahuachapán": [
    "Ahuachapán Norte",
    "Ahuachapán Centro",
    "Ahuachapán Sur",
  ],
  "Santa Ana": [
    "Santa Ana Norte",
    "Santa Ana Centro",
    "Santa Ana Este",
    "Santa Ana Oeste",
  ],
  "Sonsonate": [
    "Sonsonate Norte",
    "Sonsonate Centro",
    "Sonsonate Este",
    "Sonsonate Oeste",
  ],
  "Chalatenango": [
    "Chalatenango Norte",
    "Chalatenango Centro",
    "Chalatenango Sur",
  ],
  "La Libertad": [
    "La Libertad Norte",
    "La Libertad Centro",
    "La Libertad Oeste",
    "La Libertad Este",
    "La Libertad Costa",
    "La Libertad Sur",
  ],
  "San Salvador": [
    "San Salvador Norte",
    "San Salvador Oeste",
    "San Salvador Este",
    "San Salvador Centro",
    "San Salvador Sur",
  ],
  "Cuscatlán": [
    "Cuscatlán Norte",
    "Cuscatlán Sur",
  ],
  "La Paz": [
    "La Paz Oeste",
    "La Paz Centro",
    "La Paz Este",
  ],
  "Cabañas": [
    "Cabañas Este",
    "Cabañas Oeste",
  ],
  "San Vicente": [
    "San Vicente Norte",
    "San Vicente Sur",
  ],
  "Usulután": [
    "Usulután Norte",
    "Usulután Este",
    "Usulután Oeste",
  ],
  "San Miguel": [
    "San Miguel Norte",
    "San Miguel Centro",
    "San Miguel Oeste",
  ],
  "Morazán": [
    "Morazán Norte",
    "Morazán Sur",
  ],
  "La Unión": [
    "La Unión Norte",
    "La Unión Sur",
  ],
};

const departamentos = Object.keys(departamentosMunicipios);

export default function VentasPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [invoiceType, setInvoiceType] = useState("Consumidor final");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [message, setMessage] = useState("");

  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [card, setCard] = useState<CardData>(initialCard);

  const isCCF =
    invoiceType === "Comprobante de crédito fiscal (CCF)";

  const showNRC =
    isCCF && customer.tipoDocumento === "NIT";

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

  const updateCustomer = (
    field: keyof Customer,
    value: string
  ) => {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  };

  const updateCard = (
    field: keyof CardData,
    value: string
  ) => {
    setCard((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  };

  const handleDocumentTypeChange = (value: "NIT" | "DUI") => {
    setCustomer((current) => ({
      ...current,
      tipoDocumento: value,
      nrc: value === "DUI" ? "" : current.nrc,
    }));

    setMessage("");
  };

  const handleDepartmentChange = (department: string) => {
    setCustomer((current) => ({
      ...current,
      departamento: department,
      municipio: "",
    }));

    setMessage("");
  };

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + item.price * item.quantity,
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
    if (cart.length === 0) {
      setMessage(
        "Agregá al menos un producto para continuar."
      );
      return;
    }

    if (isCCF) {
      const requiredFields: (keyof Customer)[] = [
        "nombre",
        "numeroDocumento",
        "departamento",
        "municipio",
        "direccion",
        "codigoActividad",
        "giro",
      ];

      if (customer.tipoDocumento === "NIT") {
        requiredFields.push("nrc");
      }

      const missingFields = requiredFields.filter(
        (field) => !customer[field].trim()
      );

      if (missingFields.length > 0) {
        setMessage(
          "Para emitir un CCF, completá los campos fiscales solicitados."
        );
        return;
      }
    }

    if (paymentMethod === "Tarjeta") {
      if (
        !card.numero.trim() ||
        !card.titular.trim() ||
        !card.vencimiento.trim() ||
        !card.cvv.trim()
      ) {
        setMessage(
          "Completá los datos de la tarjeta para continuar."
        );
        return;
      }
    }

    setMessage(
      "Venta preparada correctamente. La conexión con el backend está pendiente."
    );
  };

  const inputClass =
    "w-full rounded-xl border border-[#E5D9CB] bg-white px-3 py-2.5 text-sm text-[#35251D] outline-none transition placeholder:text-[#B5A595] focus:border-[#A27B59] focus:ring-2 focus:ring-[#A27B59]/20";

  const labelClass =
    "mb-1.5 block text-xs font-semibold text-[#806B59]";

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#35251D]">
      {/* ENCABEZADO CAFÉ */}
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-[#49372C] bg-[#30221B] px-5 py-5 text-[#F8F0E5] shadow-md md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B58A60] text-2xl">
            ☕
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-wide">
              ORÍGENES SV
            </h1>
            <p className="text-xs text-[#C9B7A4]">
              Punto de venta · Restaurante
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2">
            <p className="text-xs text-[#C9B7A4]">
              Estado de caja
            </p>
            <p className="text-sm font-semibold text-green-300">
              ● Disponible
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E9D8C5] font-bold text-[#67452F]">
            A
          </div>
        </div>
      </header>

      {/* ÁREA PRINCIPAL */}
      <div className="grid min-h-[calc(100vh-80px)] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(430px,500px)]">
        {/* CATÁLOGO */}
        <section className="min-w-0 p-5 md:p-8">
          <div className="mb-7">
            <p className="text-sm font-medium uppercase tracking-widest text-[#A27B59]">
              Nuestra carta
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              ¿Qué vamos a servir hoy?
            </h2>

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
            <h3 className="font-bold">
              Productos disponibles
            </h3>

            <span className="text-xs text-[#927D6B]">
              {filteredProducts.length} productos
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group rounded-2xl border border-[#E9DFD3] bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-[#F5EEE5]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={200}
                    priority={product.id === 1}
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                  />
                </div>

                <p className="text-xs font-medium uppercase tracking-wider text-[#A27B59]">
                  {product.category}
                </p>

                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${
                    product.type === "reventa"
                      ? "bg-[#E8D9C8] text-[#79543A]"
                      : "bg-[#E5EDE2] text-[#55704E]"
                  }`}
                >
                  {product.type === "reventa"
                    ? "REVENTA"
                    : "ELABORADO"}
                </span>

                <h4 className="mt-1 font-bold">
                  {product.name}
                </h4>

                <p className="mt-1 min-h-8 text-xs text-[#927D6B]">
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

        {/* CARRITO Y FACTURACIÓN */}
        <aside className="flex min-w-0 flex-col border-t border-[#E8DED1] bg-[#FBF9F5] xl:sticky xl:top-[80px] xl:h-[calc(100vh-80px)] xl:overflow-y-auto xl:border-l xl:border-t-0">
          <div className="border-b border-[#E8DED1] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Orden actual
                </h2>

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
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
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
                      className="shrink-0 text-xs text-red-500 hover:text-red-700"
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
          <div className="space-y-5 border-t border-[#E8DED1] p-5 md:p-6">
            <div>
              <label className={labelClass}>
                Tipo de comprobante
              </label>

              <select
                value={invoiceType}
                onChange={(e) => {
                  setInvoiceType(e.target.value);
                  setMessage("");
                }}
                className={inputClass}
              >
                <option>Consumidor final</option>
                <option>
                  Comprobante de crédito fiscal (CCF)
                </option>
              </select>
            </div>

            {/* DATOS DEL CLIENTE */}
            <div className="space-y-4 rounded-xl border border-[#E8DED1] bg-white p-4">
              <div>
                <h3 className="font-bold text-[#65432F]">
                  {isCCF
                    ? "Datos del cliente"
                    : "Datos del consumidor"}
                </h3>

                <p className="mt-1 text-xs text-[#927D6B]">
                  {isCCF
                    ? "Completá la información fiscal del cliente."
                    : "Estos datos son opcionales para consumidor final."}
                </p>
              </div>

              {/* NOMBRE */}
              <div>
                <label className={labelClass}>
                  {isCCF
                    ? "Nombre o razón social *"
                    : "Nombre del cliente"}
                </label>

                <input
                  type="text"
                  value={customer.nombre}
                  onChange={(e) =>
                    updateCustomer("nombre", e.target.value)
                  }
                  placeholder="Nombre o razón social"
                  className={inputClass}
                />
              </div>

              {/* TIPO Y NÚMERO DE DOCUMENTO */}
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>
                    Tipo de documento
                  </label>

                  <select
                    value={customer.tipoDocumento}
                    onChange={(e) =>
                      handleDocumentTypeChange(
                        e.target.value as "NIT" | "DUI"
                      )
                    }
                    className={inputClass}
                  >
                    <option value="NIT">NIT</option>
                    <option value="DUI">DUI</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Número de {customer.tipoDocumento}
                    {isCCF ? " *" : ""}
                  </label>

                  <input
                    type="text"
                    value={customer.numeroDocumento}
                    onChange={(e) =>
                      updateCustomer(
                        "numeroDocumento",
                        e.target.value
                      )
                    }
                    placeholder={
                      customer.tipoDocumento === "NIT"
                        ? "Ingresá el NIT"
                        : "Ingresá el DUI"
                    }
                    className={inputClass}
                  />
                </div>

                {/* NRC SOLO CUANDO ES CCF Y NIT */}
                {showNRC && (
                  <div>
                    <label className={labelClass}>
                      NRC *
                    </label>

                    <input
                      type="text"
                      value={customer.nrc}
                      onChange={(e) =>
                        updateCustomer("nrc", e.target.value)
                      }
                      placeholder="Número de registro"
                      className={inputClass}
                    />
                  </div>
                )}
              </div>

              {/* CONTACTO */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Teléfono
                  </label>

                  <input
                    type="tel"
                    value={customer.telefono}
                    onChange={(e) =>
                      updateCustomer("telefono", e.target.value)
                    }
                    placeholder="0000-0000"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Correo electrónico
                  </label>

                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) =>
                      updateCustomer("email", e.target.value)
                    }
                    placeholder="correo@ejemplo.com"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* DEPARTAMENTO Y MUNICIPIO */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Departamento {isCCF ? "*" : ""}
                  </label>

                  <select
                    value={customer.departamento}
                    onChange={(e) =>
                      handleDepartmentChange(e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">
                      Seleccionar departamento
                    </option>

                    {departamentos.map((departamento) => (
                      <option
                        key={departamento}
                        value={departamento}
                      >
                        {departamento}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Municipio {isCCF ? "*" : ""}
                  </label>

                  <select
                    value={customer.municipio}
                    onChange={(e) =>
                      updateCustomer("municipio", e.target.value)
                    }
                    disabled={!customer.departamento}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:bg-[#F2EBE2] disabled:text-[#A18F7E]`}
                  >
                    <option value="">
                      {customer.departamento
                        ? "Seleccionar municipio"
                        : "Primero seleccioná un departamento"}
                    </option>

                    {customer.departamento &&
                      departamentosMunicipios[
                        customer.departamento
                      ].map((municipio) => (
                        <option
                          key={municipio}
                          value={municipio}
                        >
                          {municipio}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* DIRECCIÓN */}
              <div>
                <label className={labelClass}>
                  Dirección
                </label>

                <textarea
                  value={customer.direccion}
                  onChange={(e) =>
                    updateCustomer("direccion", e.target.value)
                  }
                  placeholder="Dirección completa"
                  rows={2}
                  className={inputClass}
                />
              </div>

              {/* ACTIVIDAD ECONÓMICA SOLO CCF */}
              {isCCF && (
                <div className="border-t border-[#EEE5DC] pt-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#A27B59]">
                    Actividad económica
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>
                        Código de actividad económica *
                      </label>

                      <input
                        type="text"
                        value={customer.codigoActividad}
                        onChange={(e) =>
                          updateCustomer(
                            "codigoActividad",
                            e.target.value
                          )
                        }
                        placeholder="Código de actividad"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Giro o descripción de actividad económica *
                      </label>

                      <textarea
                        value={customer.giro}
                        onChange={(e) =>
                          updateCustomer("giro", e.target.value)
                        }
                        placeholder="Descripción de la actividad económica"
                        rows={2}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NOTA CCF */}
              {isCCF && (
                <p className="text-[11px] text-[#A18F7E]">
                  * Campos solicitados para el formulario CCF
                </p>
              )}
            </div>

            {/* MÉTODO DE PAGO */}
            <div>
              <label className={labelClass}>
                Método de pago
              </label>

              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setMessage("");
                }}
                className={inputClass}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>

            {/* DATOS DE TARJETA */}
            {paymentMethod === "Tarjeta" && (
              <div className="space-y-4 rounded-xl border border-[#E8DED1] bg-white p-4">
                <div>
                  <h3 className="font-bold text-[#65432F]">
                    Datos de tarjeta
                  </h3>

                  <p className="mt-1 text-xs text-[#927D6B]">
                    Información de pago con tarjeta (demostración).
                  </p>
                </div>

                <div>
                  <label className={labelClass}>
                    Número de tarjeta *
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={19}
                    value={card.numero}
                    onChange={(e) =>
                      updateCard(
                        "numero",
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 16)
                      )
                    }
                    placeholder="0000 0000 0000 0000"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Nombre del titular *
                  </label>

                  <input
                    type="text"
                    autoComplete="off"
                    value={card.titular}
                    onChange={(e) =>
                      updateCard("titular", e.target.value)
                    }
                    placeholder="Nombre como aparece en la tarjeta"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>
                      Vencimiento *
                    </label>

                    <input
                      type="text"
                      autoComplete="off"
                      maxLength={5}
                      value={card.vencimiento}
                      onChange={(e) =>
                        updateCard(
                          "vencimiento",
                          e.target.value
                        )
                      }
                      placeholder="MM/AA"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      CVV *
                    </label>

                    <input
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={4}
                      value={card.cvv}
                      onChange={(e) =>
                        updateCard(
                          "cvv",
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4)
                        )
                      }
                      placeholder="•••"
                      className={inputClass}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-[#A18F7E]">
                  Formulario de demostración. No procesa pagos
                  ni debe almacenar datos reales de tarjetas.
                </p>
              </div>
            )}

            {/* RESUMEN */}
            <div className="space-y-3 rounded-xl bg-[#F2EBE2] p-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#806B59]">
                  Subtotal
                </span>
                <span>{formatMoney(subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-[#806B59]">
                  IVA (13 %)
                </span>
                <span>{formatMoney(iva)}</span>
              </div>

              <div className="border-t border-[#DCCBBB] pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold">
                    Total a pagar
                  </span>

                  <span className="text-2xl font-bold text-[#65432F]">
                    {formatMoney(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* MENSAJE */}
            {message && (
              <p
                role="status"
                className="rounded-xl bg-green-50 p-3 text-xs leading-relaxed text-green-800"
              >
                {message}
              </p>
            )}

            {/* REGISTRAR VENTA */}
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
    </main>
  );
}
