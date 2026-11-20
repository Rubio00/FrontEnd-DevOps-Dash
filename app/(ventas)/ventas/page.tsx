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
    "San Salvador Centro",
    "San Salvador Este",
    "San Salvador Oeste",
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

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cart]
  );

  const iva = useMemo(
    () => subtotal * 0.13,
    [subtotal]
  );

  const total = subtotal + iva;

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const formatMoney = (amount: number) =>
    `$${amount.toFixed(2)}`;

  const addToCart = (product: Product) => {
    setMessage("");

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const increaseQuantity = (productId: number) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (productId: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  };

  const handleSale = () => {
    if (cart.length === 0) {
      setMessage("Agregá al menos un producto para continuar.");
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
      "Datos validados. La integración para procesar la venta se realizará con el backend."
    );
  };

  const inputClass =
    "w-full rounded-xl border border-[#E5D9CB] bg-white px-3 py-2.5 text-sm text-[#35251D] outline-none transition placeholder:text-[#B5A595] focus:border-[#A27B59] focus:ring-2 focus:ring-[#A27B59]/20";

  const labelClass =
    "mb-1.5 block text-xs font-semibold text-[#806B59]";

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#35251D]">

      {/* ENCABEZADO CAFÉ */}
      <header className="sticky top-0 z-30 bg-primary px-6 py-5 text-white shadow-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-wide">
              Restaurante Orígenes SV
            </h1>
            <p className="mt-1 text-sm text-[#D9C5B2]">
              Punto de venta
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-[#D9C5B2]">
              Módulo de ventas
            </p>
            <p className="text-sm font-semibold">
              Sistema POS
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_420px]">

        {/* CATÁLOGO DE PRODUCTOS */}
        <section className="min-w-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#65432F]">
              Catálogo de productos
            </h2>
            <p className="mt-1 text-sm text-[#927D6B]">
              Seleccioná los productos para agregarlos a la venta.
            </p>
          </div>

          {/* BUSCADOR */}
          <div className="mb-5">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto..."
              className={inputClass}
            />
          </div>

          {/* CATEGORÍAS */}
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedCategory === category
                    ? "bg-[#65432F] text-white"
                    : "border border-[#E5D9CB] bg-white text-[#806B59] hover:bg-[#EFE5DA]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* TARJETAS DE PRODUCTOS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-[#E9DFD3] bg-white p-3 shadow-sm transition hover:shadow-md"
              >
                <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl bg-[#F7F3EC]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, 250px"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <h3 className="font-bold text-[#65432F]">
                    {product.name}
                  </h3>

                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-bold ${
                      product.type === "reventa"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-[#F1E5D8] text-[#80583B]"
                    }`}
                  >
                    {product.type === "reventa"
                      ? "REVENTA"
                      : "ELABORADO"}
                  </span>
                </div>

                <p className="mt-1 min-h-8 text-xs text-[#927D6B]">
                  {product.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-[#65432F]">
                    {formatMoney(product.price)}
                  </span>

                  <button
                    type="button"
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
        <aside className="flex min-w-0 flex-col border-t border-[#E8DED1] bg-[#FBF9F5] lg:sticky lg:top-[80px] lg:h-[calc(100vh-80px)] lg:overflow-y-auto lg:border-l lg:border-t-0">
          <div className="space-y-5 p-4 md:p-5">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#65432F]">
                  Carrito de compra
                </h2>
                <p className="text-xs text-[#927D6B]">
                  Productos seleccionados
                </p>
              </div>

              <span className="rounded-full bg-[#EDE1D4] px-3 py-1 text-sm font-bold text-[#65432F]">
                {totalItems} artículos
              </span>
            </div>

            {/* PRODUCTOS DEL CARRITO */}
            <div className="space-y-3">
              {cart.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D8C6B3] p-6 text-center text-sm text-[#927D6B]">
                  El carrito está vacío.
                  <p className="mt-1 text-xs">
                    Agregá productos del catálogo.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-[#E9DFD3] bg-white p-3"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#F7F3EC]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        sizes="56px"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#65432F]">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#927D6B]">
                        {formatMoney(item.price)} c/u
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5D9CB] text-[#65432F]"
                        >
                          −
                        </button>

                        <span className="min-w-5 text-center text-sm font-bold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5D9CB] text-[#65432F]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-[#65432F]">
                        {formatMoney(item.price * item.quantity)}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="mt-2 text-xs font-semibold text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* TIPO DE DOCUMENTO */}
            <div className="border-t border-[#E8DED1] pt-5">
              <h3 className="mb-3 font-bold text-[#65432F]">
                Información de facturación
              </h3>

              <label className={labelClass}>
                Tipo de documento
              </label>

              <select
                value={invoiceType}
                onChange={(event) => {
                  setInvoiceType(event.target.value);
                  setMessage("");
                }}
                className={inputClass}
              >
                <option value="Consumidor final">
                  Consumidor final
                </option>
                <option value="Comprobante de crédito fiscal (CCF)">
                  Comprobante de crédito fiscal (CCF)
                </option>
              </select>
            </div>

            {/* DATOS DEL CLIENTE */}
            <div className="space-y-3 border-t border-[#E8DED1] pt-5">
              <div>
                <h3 className="font-bold text-[#65432F]">
                  Datos del cliente
                </h3>

                {isCCF && (
                  <p className="mt-1 text-[11px] text-[#A27B59]">
                    * Campos solicitados para el formulario CCF
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  Nombre completo {isCCF && "*"}
                </label>
                <input
                  type="text"
                  value={customer.nombre}
                  onChange={(event) =>
                    setCustomer({
                      ...customer,
                      nombre: event.target.value,
                    })
                  }
                  placeholder="Nombre del cliente"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    Tipo de documento
                  </label>
                  <select
                    value={customer.tipoDocumento}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        tipoDocumento: event.target.value as "NIT" | "DUI",
                        nrc: "",
                      })
                    }
                    className={inputClass}
                  >
                    <option value="NIT">NIT</option>
                    <option value="DUI">DUI</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Número {isCCF && "*"}
                  </label>
                  <input
                    type="text"
                    value={customer.numeroDocumento}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        numeroDocumento: event.target.value,
                      })
                    }
                    placeholder="Número"
                    className={inputClass}
                  />
                </div>
              </div>

              {showNRC && (
                <div>
                  <label className={labelClass}>
                    NRC *
                  </label>
                  <input
                    type="text"
                    value={customer.nrc}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        nrc: event.target.value,
                      })
                    }
                    placeholder="Número de registro de contribuyente"
                    className={inputClass}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={customer.telefono}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        telefono: event.target.value,
                      })
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
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        email: event.target.value,
                      })
                    }
                    placeholder="correo@ejemplo.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    Departamento {isCCF && "*"}
                  </label>
                  <select
                    value={customer.departamento}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        departamento: event.target.value,
                        municipio: "",
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">Seleccionar</option>
                    {departamentos.map((departamento) => (
                      <option key={departamento} value={departamento}>
                        {departamento}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Municipio {isCCF && "*"}
                  </label>
                  <select
                    value={customer.municipio}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        municipio: event.target.value,
                      })
                    }
                    disabled={!customer.departamento}
                    className={inputClass}
                  >
                    <option value="">Seleccionar</option>
                    {customer.departamento &&
                      departamentosMunicipios[customer.departamento]?.map(
                        (municipio) => (
                          <option key={municipio} value={municipio}>
                            {municipio}
                          </option>
                        )
                      )}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Dirección {isCCF && "*"}
                </label>
                <textarea
                  value={customer.direccion}
                  onChange={(event) =>
                    setCustomer({
                      ...customer,
                      direccion: event.target.value,
                    })
                  }
                  placeholder="Dirección del cliente"
                  rows={2}
                  className={inputClass}
                />
              </div>

              {isCCF && (
                <>
                  <div>
                    <label className={labelClass}>
                      Código de actividad económica *
                    </label>
                    <input
                      type="text"
                      value={customer.codigoActividad}
                      onChange={(event) =>
                        setCustomer({
                          ...customer,
                          codigoActividad: event.target.value,
                        })
                      }
                      placeholder="Código de actividad"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Giro o actividad económica *
                    </label>
                    <input
                      type="text"
                      value={customer.giro}
                      onChange={(event) =>
                        setCustomer({
                          ...customer,
                          giro: event.target.value,
                        })
                      }
                      placeholder="Giro del contribuyente"
                      className={inputClass}
                    />
                  </div>
                </>
              )}
            </div>

            {/* MÉTODO DE PAGO */}
            <div className="border-t border-[#E8DED1] pt-5">
              <h3 className="mb-3 font-bold text-[#65432F]">
                Método de pago
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {["Efectivo", "Tarjeta"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method);
                      setMessage("");
                    }}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      paymentMethod === method
                        ? "border-[#65432F] bg-[#65432F] text-white"
                        : "border-[#E5D9CB] bg-white text-[#806B59]"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {paymentMethod === "Tarjeta" && (
                <div className="mt-4 space-y-3 rounded-xl border border-[#E9DFD3] bg-white p-3">
                  <p className="text-xs font-semibold text-[#806B59]">
                    Datos de tarjeta (demostración)
                  </p>

                  <div>
                    <label className={labelClass}>
                      Número de tarjeta
                    </label>
                    <input
                      type="text"
                      value={card.numero}
                      onChange={(event) =>
                        setCard({
                          ...card,
                          numero: event.target.value,
                        })
                      }
                      placeholder="0000 0000 0000 0000"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Titular de la tarjeta
                    </label>
                    <input
                      type="text"
                      value={card.titular}
                      onChange={(event) =>
                        setCard({
                          ...card,
                          titular: event.target.value,
                        })
                      }
                      placeholder="Nombre del titular"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>
                        Vencimiento
                      </label>
                      <input
                        type="text"
                        value={card.vencimiento}
                        onChange={(event) =>
                          setCard({
                            ...card,
                            vencimiento: event.target.value,
                          })
                        }
                        placeholder="MM/AA"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        CVV
                      </label>
                      <input
                        type="password"
                        value={card.cvv}
                        onChange={(event) =>
                          setCard({
                            ...card,
                            cvv: event.target.value,
                          })
                        }
                        placeholder="000"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <p className="text-[10px] leading-relaxed text-[#A18F7E]">
                    Campos ilustrativos. No ingresés datos de una tarjeta real.
                  </p>
                </div>
              )}
            </div>

            {/* RESUMEN DE COMPRA */}
            <div className="space-y-3 border-t border-[#E8DED1] pt-5">
              <h3 className="font-bold text-[#65432F]">
                Resumen de compra
              </h3>

              <div className="flex justify-between text-sm">
                <span className="text-[#806B59]">Subtotal</span>
                <span className="font-medium">
                  {formatMoney(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-[#806B59]">IVA (13 %)</span>
                <span className="font-medium">
                  {formatMoney(iva)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[#E8DED1] pt-3">
                <span className="font-bold text-[#65432F]">
                  Total a pagar
                </span>

                <span className="text-2xl font-bold text-[#65432F]">
                  {formatMoney(total)}
                </span>
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

            {/* PROCESAR VENTA */}
            <button
              type="button"
              onClick={handleSale}
              disabled={cart.length === 0}
              className="w-full rounded-xl bg-[#65432F] py-4 font-bold text-white shadow-md transition hover:bg-[#493020] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Procesar venta →
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


