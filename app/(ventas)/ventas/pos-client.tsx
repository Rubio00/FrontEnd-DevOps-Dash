"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usd } from "@/lib/format";
import { abrirCaja, cerrarCaja, crearCliente, registrarVenta } from "@/services/pos.client";
import { redondear } from "@/types/pos";
import type {
  CajaPos,
  ClientePos,
  DatosCliente,
  MetodoPago,
  ProductoPos,
  VentaResumen,
} from "@/types/pos";

type Props = {
  usuarioId: number;
  sucursalId: number;
  sucursalNombre: string;
  productos: ProductoPos[];
  clientes: ClientePos[];
  metodos: MetodoPago[];
  cajaInicial: CajaPos | null;
  ventasIniciales: VentaResumen[];
};

type LineaCarrito = { producto: ProductoPos; cantidad: number };

const campo =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export default function PosClient({
  usuarioId,
  sucursalId,
  sucursalNombre,
  productos,
  clientes,
  metodos,
  cajaInicial,
  ventasIniciales,
}: Props) {
  const router = useRouter();
  const [caja, setCaja] = useState(cajaInicial);
  const [ventas, setVentas] = useState(ventasIniciales);
  const [carrito, setCarrito] = useState<LineaCarrito[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [cobrando, setCobrando] = useState(false);
  const [gestionCaja, setGestionCaja] = useState(false);
  const [aviso, setAviso] = useState("");
  const [ticket, setTicket] = useState<{ tipoDoc: string; numero: string; total: number } | null>(null);

  const categorias = useMemo(
    () => ["Todas", ...new Set(productos.map((producto) => producto.categoria || "Sin categoría"))],
    [productos],
  );

  const texto = busqueda.trim().toLowerCase();
  const visibles = productos.filter((producto) => {
    const coincideTexto = [producto.nombre, producto.categoria ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(texto);
    const coincideCategoria =
      categoria === "Todas" || (producto.categoria || "Sin categoría") === categoria;
    return coincideTexto && coincideCategoria;
  });

  const lineas = carrito.map((linea) => {
    const precioUnitario = redondear(linea.producto.precio / 1.13);
    return {
      productoId: linea.producto.id,
      nombre: linea.producto.nombre,
      cantidad: linea.cantidad,
      precioUnitario,
      subtotal: redondear(precioUnitario * linea.cantidad),
    };
  });
  const subtotal = redondear(lineas.reduce((suma, linea) => suma + linea.subtotal, 0));
  const total = redondear(carrito.reduce((suma, linea) => suma + linea.producto.precio * linea.cantidad, 0));
  const iva = redondear(total - subtotal);

  function agregar(producto: ProductoPos) {
    setCarrito((prev) => {
      const existente = prev.find((linea) => linea.producto.id === producto.id);
      if (existente) {
        return prev.map((linea) =>
          linea.producto.id === producto.id ? { ...linea, cantidad: linea.cantidad + 1 } : linea,
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  }

  function cambiarCantidad(productoId: number, cantidad: number) {
    if (cantidad <= 0) {
      setCarrito((prev) => prev.filter((linea) => linea.producto.id !== productoId));
      return;
    }
    setCarrito((prev) =>
      prev.map((linea) => (linea.producto.id === productoId ? { ...linea, cantidad } : linea)),
    );
  }

  return (
    <main className="min-h-screen bg-page text-ink">
      <header className="bg-primary text-[#F8F0E5]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#C9B7A4]">Punto de venta</p>
            <h1 className="mt-1 text-2xl font-bold">Ventas · {sucursalNombre}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${caja ? "bg-emerald-500/20 text-emerald-100" : "bg-red-500/20 text-red-100"}`}>
              {caja ? `Caja #${caja.id} abierta · ${caja.turno}` : "Caja cerrada"}
            </span>
            <button
              type="button"
              onClick={() => setGestionCaja(true)}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              {caja ? "Cerrar caja" : "Abrir caja"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-6 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar producto..."
              className="w-full max-w-sm rounded-full border border-primary/15 bg-white px-5 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <select
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
              className="rounded-full border border-primary/15 bg-white px-4 py-2 text-sm text-primary"
              aria-label="Categoría"
            >
              {categorias.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {!caja && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Abrí la caja para poder cobrar. El backend rechaza ventas sin una caja abierta.
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {visibles.map((producto) => (
              <button
                key={producto.id}
                type="button"
                onClick={() => agregar(producto)}
                disabled={!caja}
                className="flex flex-col items-start rounded-2xl border border-primary/10 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-page text-sm font-bold text-primary">
                  {producto.nombre.slice(0, 2).toUpperCase()}
                </span>
                <span className="mt-3 text-sm font-bold text-primary">{producto.nombre}</span>
                <span className="text-xs text-ink/50">{producto.categoria || "Sin categoría"}</span>
                <span className="mt-2 text-lg font-bold text-accent">{usd(producto.precio)}</span>
              </button>
            ))}
          </div>
          {visibles.length === 0 && (
            <p className="mt-6 rounded-xl border border-dashed border-stone-300 bg-white py-10 text-center text-sm text-stone-400">
              No hay productos activos que coincidan.
            </p>
          )}
        </section>

        <aside className="sticky top-6 h-fit rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">Carrito</h2>
            <span className="rounded-full bg-page px-3 py-1 text-xs font-semibold text-primary">
              {carrito.reduce((suma, linea) => suma + linea.cantidad, 0)} ítems
            </span>
          </div>

          {carrito.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-stone-300 py-8 text-center text-sm text-stone-400">
              Agregá productos para comenzar.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-stone-100">
              {carrito.map((linea) => (
                <li key={linea.producto.id} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-primary">{linea.producto.nombre}</p>
                      <p className="text-xs text-ink/50">{usd(linea.producto.precio)} c/u</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(linea.producto.id, 0)}
                      className="text-stone-400 hover:text-red-600"
                      aria-label="Quitar"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => cambiarCantidad(linea.producto.id, linea.cantidad - 1)} className="h-7 w-7 rounded-lg border border-stone-300 text-sm">−</button>
                      <span className="w-8 text-center text-sm font-semibold">{linea.cantidad}</span>
                      <button type="button" onClick={() => cambiarCantidad(linea.producto.id, linea.cantidad + 1)} className="h-7 w-7 rounded-lg border border-stone-300 text-sm">+</button>
                    </div>
                    <span className="text-sm font-bold text-primary">{usd(linea.producto.precio * linea.cantidad)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <dl className="mt-4 space-y-1 border-t border-stone-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500">Subtotal</dt>
              <dd>{usd(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">IVA (13%)</dt>
              <dd>{usd(iva)}</dd>
            </div>
            <div className="flex justify-between text-lg font-bold text-primary">
              <dt>Total</dt>
              <dd>{usd(total)}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() => setCobrando(true)}
            disabled={!caja || carrito.length === 0}
            className="mt-5 w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cobrar {usd(total)}
          </button>
          <button
            type="button"
            onClick={() => setCarrito([])}
            disabled={carrito.length === 0}
            className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-600 disabled:opacity-40"
          >
            Vaciar carrito
          </button>
        </aside>
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/45">Últimas ventas</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-primary/10 bg-white shadow-sm">
          <table className="w-full min-w-[620px] text-left">
            <thead className="bg-page/60 text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3 font-semibold">Documento</th>
                <th className="px-5 py-3 font-semibold">Fecha</th>
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id} className="border-t border-primary/8">
                  <td className="px-5 py-3 font-mono text-sm font-semibold text-primary">
                    {venta.tipoDoc}-{venta.serie}-{String(venta.numeroDoc).padStart(8, "0")}
                  </td>
                  <td className="px-5 py-3 text-sm">{String(venta.fecha).slice(0, 10)}</td>
                  <td className="px-5 py-3 text-sm">{venta.cliente?.nombre ?? "Consumidor final"}</td>
                  <td className="px-5 py-3 text-sm capitalize">{venta.estado}</td>
                  <td className="px-5 py-3 text-right text-sm font-bold">{usd(venta.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ventas.length === 0 && (
            <p className="py-8 text-center text-sm text-ink/40">Todavía no hay ventas en esta sucursal.</p>
          )}
        </div>
      </section>

      {cobrando && caja && (
        <CobroModal
          subtotal={subtotal}
          iva={iva}
          total={total}
          clientes={clientes}
          metodos={metodos}
          onClose={() => setCobrando(false)}
          onConfirmar={async (datos) => {
            const venta = await registrarVenta({
              sucursalId,
              cajaId: caja.id,
              usuarioId,
              tipoDoc: datos.tipoDoc,
              clienteId: datos.tipoDoc === "CCF" ? datos.clienteId : null,
              subtotal,
              iva,
              total,
              detalles: lineas.map((linea) => ({
                productoId: linea.productoId,
                cantidad: linea.cantidad,
                precioUnitario: linea.precioUnitario,
                subtotal: linea.subtotal,
              })),
              pagos: [
                {
                  metodoPagoId: datos.metodoPagoId,
                  monto: total,
                  referencia: datos.referencia || null,
                },
              ],
            });

            setTicket({
              tipoDoc: venta.tipoDoc,
              numero: `${venta.serie}-${String(venta.numeroDoc).padStart(8, "0")}`,
              total: Number(venta.total),
            });
            setVentas((prev) => [
              {
                id: venta.id,
                fecha: new Date().toISOString(),
                tipoDoc: venta.tipoDoc,
                serie: venta.serie,
                numeroDoc: venta.numeroDoc,
                total: Number(venta.total),
                estado: "emitida",
                cliente: clientes.find((cliente) => cliente.id === datos.clienteId) ?? null,
              },
              ...prev,
            ]);
            setCarrito([]);
            setCobrando(false);
            setAviso("Venta registrada correctamente.");
            router.refresh();
          }}
        />
      )}

      {gestionCaja && (
        <CajaModal
          caja={caja}
          sucursalId={sucursalId}
          usuarioId={usuarioId}
          onClose={() => setGestionCaja(false)}
          onCambio={(nueva, mensaje) => {
            setCaja(nueva);
            setGestionCaja(false);
            setAviso(mensaje);
            router.refresh();
          }}
        />
      )}

      {ticket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/45">Comprobante emitido</p>
            <p className="mt-3 font-mono text-xl font-bold text-primary">{ticket.tipoDoc}-{ticket.numero}</p>
            <p className="mt-2 text-3xl font-bold text-accent">{usd(ticket.total)}</p>
            <button
              type="button"
              onClick={() => setTicket(null)}
              className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary/90"
            >
              Nueva venta
            </button>
          </div>
        </div>
      )}

      {aviso && (
        <div className="fixed bottom-5 right-5 z-[60] max-w-md rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-900 shadow-xl" role="status">
          {aviso}
        </div>
      )}
    </main>
  );
}

type DatosCobro = {
  tipoDoc: "FCF" | "CCF";
  clienteId: number | null;
  metodoPagoId: number;
  referencia: string;
};

function CobroModal({
  subtotal,
  iva,
  total,
  clientes,
  metodos,
  onClose,
  onConfirmar,
}: {
  subtotal: number;
  iva: number;
  total: number;
  clientes: ClientePos[];
  metodos: MetodoPago[];
  onClose: () => void;
  onConfirmar: (datos: DatosCobro) => Promise<void>;
}) {
  const [tipoDoc, setTipoDoc] = useState<"FCF" | "CCF">("FCF");
  const [clienteId, setClienteId] = useState<number | "">(clientes[0]?.id ?? "");
  const [metodoPagoId, setMetodoPagoId] = useState<number | "">(metodos[0]?.id ?? "");
  const [referencia, setReferencia] = useState("");
  const [nuevoCliente, setNuevoCliente] = useState(false);
  const [cliente, setCliente] = useState<DatosCliente>({ nombre: "", nit: "", nrc: "", giro: "", direccion: "", email: "" });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const metodo = metodos.find((item) => item.id === metodoPagoId);

  async function confirmar() {
    setError("");
    setGuardando(true);
    try {
      let clienteFinal = clienteId;
      if (tipoDoc === "CCF") {
        if (nuevoCliente) {
          if (!cliente.nombre.trim()) throw new Error("El nombre del cliente es obligatorio.");
          const creado = await crearCliente(cliente);
          clienteFinal = creado.id;
        }
        if (clienteFinal === "") throw new Error("Seleccioná un cliente para emitir CCF.");
      }
      await onConfirmar({
        tipoDoc,
        clienteId: clienteFinal === "" ? null : Number(clienteFinal),
        metodoPagoId: Number(metodoPagoId),
        referencia: referencia.trim(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar la venta.");
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary">Cobrar venta</h2>
            <p className="mt-1 text-sm text-stone-500">Elegí el documento y el método de pago.</p>
          </div>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-700" aria-label="Cerrar">✕</button>
        </div>

        <div className="mt-5 flex gap-2">
          {(["FCF", "CCF"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTipoDoc(item)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${tipoDoc === item ? "border-primary bg-primary text-white" : "border-stone-300 bg-white text-stone-600"}`}
            >
              {item === "FCF" ? "Consumidor final" : "Crédito fiscal"}
            </button>
          ))}
        </div>

        {tipoDoc === "CCF" && (
          <div className="mt-4 rounded-xl border border-stone-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary">Cliente</p>
              <button type="button" onClick={() => setNuevoCliente((prev) => !prev)} className="text-xs font-semibold text-accent hover:underline">
                {nuevoCliente ? "Elegir existente" : "+ Nuevo cliente"}
              </button>
            </div>
            {nuevoCliente ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input className={campo} placeholder="Nombre *" value={cliente.nombre} onChange={(event) => setCliente({ ...cliente, nombre: event.target.value })} />
                <input className={campo} placeholder="NIT" value={cliente.nit} onChange={(event) => setCliente({ ...cliente, nit: event.target.value })} />
                <input className={campo} placeholder="NRC" value={cliente.nrc} onChange={(event) => setCliente({ ...cliente, nrc: event.target.value })} />
                <input className={campo} placeholder="Giro" value={cliente.giro} onChange={(event) => setCliente({ ...cliente, giro: event.target.value })} />
                <input className={campo} placeholder="Dirección" value={cliente.direccion} onChange={(event) => setCliente({ ...cliente, direccion: event.target.value })} />
                <input className={campo} placeholder="Correo" type="email" value={cliente.email} onChange={(event) => setCliente({ ...cliente, email: event.target.value })} />
              </div>
            ) : (
              <select className={`${campo} mt-3`} value={clienteId} onChange={(event) => setClienteId(event.target.value === "" ? "" : Number(event.target.value))}>
                <option value="">Selecciona un cliente...</option>
                {clientes.map((item) => (
                  <option key={item.id} value={item.id}>{item.nombre} · {item.nit || "sin NIT"}</option>
                ))}
              </select>
            )}
          </div>
        )}

        <label className="mt-4 block text-sm">
          <span className="mb-1 block font-medium">Método de pago</span>
          <select className={campo} value={metodoPagoId} onChange={(event) => setMetodoPagoId(Number(event.target.value))}>
            {metodos.map((item) => (
              <option key={item.id} value={item.id}>{item.nombre}</option>
            ))}
          </select>
        </label>

        {metodo && !metodo.esEfectivo && (
          <label className="mt-3 block text-sm">
            <span className="mb-1 block font-medium">Referencia</span>
            <input className={campo} value={referencia} onChange={(event) => setReferencia(event.target.value)} placeholder="Número de voucher o transferencia" />
          </label>
        )}

        <dl className="mt-5 space-y-1 rounded-xl bg-page p-4 text-sm">
          <div className="flex justify-between"><dt className="text-stone-500">Subtotal</dt><dd>{usd(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-stone-500">IVA</dt><dd>{usd(iva)}</dd></div>
          <div className="flex justify-between text-lg font-bold text-primary"><dt>Total</dt><dd>{usd(total)}</dd></div>
        </dl>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600">Cancelar</button>
          <button type="button" onClick={confirmar} disabled={guardando} className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
            {guardando ? "Registrando..." : "Confirmar venta"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CajaModal({
  caja,
  sucursalId,
  usuarioId,
  onClose,
  onCambio,
}: {
  caja: CajaPos | null;
  sucursalId: number;
  usuarioId: number;
  onClose: () => void;
  onCambio: (caja: CajaPos | null, mensaje: string) => void;
}) {
  const [turno, setTurno] = useState<"manana" | "tarde" | "noche">("manana");
  const [montoInicial, setMontoInicial] = useState("0");
  const [efectivoReal, setEfectivoReal] = useState("0");
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setError("");
    setGuardando(true);
    try {
      if (caja) {
        const cerrada = await cerrarCaja(caja.id, { efectivoReal: Number(efectivoReal), observaciones });
        onCambio(null, `Caja cerrada. Diferencia: ${usd(cerrada.diferencia ?? 0)}`);
      } else {
        const abierta = await abrirCaja({ sucursalId, usuarioId, turno, montoInicial: Number(montoInicial) });
        onCambio(abierta, `Caja #${abierta.id} abierta.`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar la caja.");
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary">{caja ? "Cerrar caja" : "Abrir caja"}</h2>
            <p className="mt-1 text-sm text-stone-500">
              {caja ? `Caja #${caja.id} · turno ${caja.turno}` : "Registrá el turno y el fondo inicial."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-700" aria-label="Cerrar">✕</button>
        </div>

        {caja ? (
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Efectivo contado</span>
              <input className={campo} type="number" min="0" step="0.01" value={efectivoReal} onChange={(event) => setEfectivoReal(event.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Observaciones</span>
              <input className={campo} value={observaciones} onChange={(event) => setObservaciones(event.target.value)} maxLength={300} />
            </label>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Turno</span>
              <select className={campo} value={turno} onChange={(event) => setTurno(event.target.value as "manana" | "tarde" | "noche")}>
                <option value="manana">Mañana</option>
                <option value="tarde">Tarde</option>
                <option value="noche">Noche</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Fondo inicial</span>
              <input className={campo} type="number" min="0" step="0.01" value={montoInicial} onChange={(event) => setMontoInicial(event.target.value)} />
            </label>
          </div>
        )}

        {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600">Cancelar</button>
          <button type="button" onClick={guardar} disabled={guardando} className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
            {guardando ? "Guardando..." : caja ? "Cerrar caja" : "Abrir caja"}
          </button>
        </div>
      </div>
    </div>
  );
}
