"use client";

import { useState } from "react";
import type { Compra, LineaCompra } from "@/types/compra";
import { sucursales } from "@/data/sucursales";
import { catalogo } from "@/data/catalogoCompras";
import { IVA, subtotalLineas } from "@/lib/compras";
import { usd } from "@/lib/format";

type LineaForm = { insumoId: string; cantidad: number; costoUnitario: number };
const lineaVacia: LineaForm = { insumoId: "", cantidad: 1, costoUnitario: 0 };

const campo =
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

type Props = {
    siguienteRef: string;
    proveedores: string[];
    onCerrar: () => void;
    onGuardar: (c: Compra) => void;
};

export default function NuevaCompraModal({ siguienteRef, proveedores, onCerrar, onGuardar }: Props) {
    const [sucursal, setSucursal] = useState("");
    const [proveedor, setProveedor] = useState("");
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
    const [lineas, setLineas] = useState<LineaForm[]>([{ ...lineaVacia }]);

    const cambiar = (i: number, cambios: Partial<LineaForm>) =>
        setLineas((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...cambios } : l)));

    const elegirInsumo = (i: number, id: string) => {
        const item = catalogo.find((c) => c.id === id);
        cambiar(i, { insumoId: id, costoUnitario: item?.costo ?? 0 });
    };

    const validas: LineaCompra[] = lineas
        .filter((l) => l.insumoId && l.cantidad > 0)
        .map((l) => {
            const item = catalogo.find((c) => c.id === l.insumoId)!;
            return {
                insumoId: item.id,
                nombre: item.nombre,
                unidad: item.unidad,
                cantidad: l.cantidad,
                costoUnitario: l.costoUnitario,
            };
        });

    const subtotal = subtotalLineas(validas);
    const iva = subtotal * IVA;
    const puedeGuardar = sucursal !== "" && proveedor.trim() !== "" && validas.length > 0;

    const guardar = () => {
        onGuardar({
            ref: siguienteRef,
            proveedor: proveedor.trim(),
            sucursal: sucursales.find((s) => s.id === sucursal)!.nombre,
            fecha,
            estado: "Por pagar",
            lineas: validas,
        });
        onCerrar();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-primary">Nueva factura de compra · {siguienteRef}</h2>
                    <button onClick={onCerrar} className="text-stone-400 hover:text-stone-700">
                        ✕
                    </button>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <label className="text-sm">
                        <span className="mb-1 block font-medium">Sucursal</span>
                        <select className={campo} value={sucursal} onChange={(e) => setSucursal(e.target.value)}>
                            <option value="">Selecciona...</option>
                            {sucursales.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nombre}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-sm">
                        <span className="mb-1 block font-medium">Proveedor</span>
                        <input
                            className={campo}
                            list="proveedores"
                            value={proveedor}
                            onChange={(e) => setProveedor(e.target.value)}
                            placeholder="Nombre del proveedor"
                        />
                        <datalist id="proveedores">
                            {proveedores.map((p) => (
                                <option key={p} value={p} />
                            ))}
                        </datalist>
                    </label>
                    <label className="text-sm">
                        <span className="mb-1 block font-medium">Fecha</span>
                        <input type="date" className={campo} value={fecha} onChange={(e) => setFecha(e.target.value)} />
                    </label>
                </div>

                <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-stone-500">
                    ¿Qué se compra?
                </h3>
                <div className="mb-1 grid grid-cols-[1fr_80px_100px_32px] gap-2 text-xs text-stone-500">
                    <span>Insumo</span>
                    <span>Cantidad</span>
                    <span>Costo unit.</span>
                    <span />
                </div>
                <div className="space-y-2">
                    {lineas.map((l, i) => (
                        <div key={i} className="grid grid-cols-[1fr_80px_100px_32px] items-center gap-2">
                            <select className={campo} value={l.insumoId} onChange={(e) => elegirInsumo(i, e.target.value)}>
                                <option value="">Insumo...</option>
                                {catalogo
                                    .filter((c) => c.id === l.insumoId || !lineas.some((x) => x.insumoId === c.id))
                                    .map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre} ({c.unidad})
                                        </option>
                                    ))}
                            </select>
                            <input
                                type="number"
                                min={1}
                                className={campo}
                                value={l.cantidad}
                                onChange={(e) => cambiar(i, { cantidad: Number(e.target.value) })}
                                aria-label="Cantidad"
                            />
                            <input
                                type="number"
                                readOnly
                                className={`${campo} bg-stone-100 text-stone-500`}
                                value={l.costoUnitario}
                                aria-label="Costo unitario"
                            />
                            {lineas.length > 1 ? (
                                <button
                                    onClick={() => setLineas((p) => p.filter((_, idx) => idx !== i))}
                                    className="text-stone-400 hover:text-red-600"
                                    aria-label="Quitar insumo"
                                >
                                    ✕
                                </button>
                            ) : (
                                <span />
                            )}
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => setLineas((p) => [...p, { ...lineaVacia }])}
                    className="mt-3 text-sm font-medium text-accent hover:underline"
                >
                    + Agregar insumo
                </button>

                <dl className="mt-6 space-y-1 border-t border-stone-200 pt-4 text-sm">
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
                        <dd>{usd(subtotal + iva)}</dd>
                    </div>
                </dl>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onCerrar} className="rounded-lg border border-stone-300 px-5 py-2 text-sm text-stone-600">
                        Cancelar
                    </button>
                    <button
                        onClick={guardar}
                        disabled={!puedeGuardar}
                        className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Registrar compra
                    </button>
                </div>
            </div>
        </div>
    );
}