import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/lib/api";
import { COOKIE_SESION } from "@/lib/session";

/**
 * BFF (Backend For Frontend).
 *
 * Los componentes de cliente nunca llaman al backend ni ven el JWT: llaman a
 * `/api/backend/<recurso>` y este handler reenvía la petición agregando el
 * Bearer desde la cookie httpOnly. Ventajas:
 *  - El token no es accesible desde JavaScript (mitiga XSS).
 *  - No hay que exponer la URL del backend ni configurar CORS.
 *  - Un único punto para validar rutas permitidas.
 */

const RECURSOS = new Set([
    "auth",
    "sucursal",
    "proveedor",
    "empleado",
    "compras",
    "ventas",
    "producto",
    "insumos",
    "recetas",
    "inventario",
    "caja",
    "planilla",
    "roles",
    "usuarios",
    "metodos-pago",
    "categorias",
    "clientes",
]);

const METODOS = new Set(["GET", "POST", "PATCH", "PUT", "DELETE"]);
const SEGMENTO_VALIDO = /^[A-Za-z0-9._-]+$/;

type Contexto = { params: Promise<{ ruta?: string[] }> };

async function proxy(request: NextRequest, { params }: Contexto): Promise<NextResponse> {
    const { ruta = [] } = await params;

    if (ruta.length === 0 || !RECURSOS.has(ruta[0])) {
        return NextResponse.json({ message: "Recurso no permitido" }, { status: 404 });
    }

    if (!ruta.every((segmento) => SEGMENTO_VALIDO.test(segmento))) {
        return NextResponse.json({ message: "Ruta inválida" }, { status: 400 });
    }

    const metodo = request.method.toUpperCase();
    if (!METODOS.has(metodo)) {
        return NextResponse.json({ message: "Método no permitido" }, { status: 405 });
    }

    const token = request.cookies.get(COOKIE_SESION)?.value;
    if (!token) {
        return NextResponse.json({ message: "Sesión requerida" }, { status: 401 });
    }

    const destino = `${API_URL}/api/v1/${ruta.join("/")}${request.nextUrl.search}`;
    const headers = new Headers({ Accept: "application/json", Authorization: `Bearer ${token}` });
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);

    const body = metodo === "GET" || metodo === "DELETE" ? undefined : await request.text();

    let respuesta: Response;
    try {
        respuesta = await fetch(destino, {
            method: metodo,
            headers,
            body: body || undefined,
            cache: "no-store",
            signal: AbortSignal.timeout(15_000),
        });
    } catch {
        return NextResponse.json({ message: "No se pudo conectar con la API" }, { status: 503 });
    }

    const texto = respuesta.status === 204 ? "" : await respuesta.text();
    const salida = new NextResponse(texto, {
        status: respuesta.status,
        headers: {
            "Content-Type": respuesta.headers.get("content-type") ?? "application/json",
        },
    });

    // Si el token expiró o fue revocado, limpiamos la cookie para forzar login.
    if (respuesta.status === 401) {
        salida.cookies.delete(COOKIE_SESION);
    }

    return salida;
}

export async function GET(request: NextRequest, contexto: Contexto) {
    return proxy(request, contexto);
}

export async function POST(request: NextRequest, contexto: Contexto) {
    return proxy(request, contexto);
}

export async function PATCH(request: NextRequest, contexto: Contexto) {
    return proxy(request, contexto);
}

export async function PUT(request: NextRequest, contexto: Contexto) {
    return proxy(request, contexto);
}

export async function DELETE(request: NextRequest, contexto: Contexto) {
    return proxy(request, contexto);
}
