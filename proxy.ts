
import { NextRequest, NextResponse } from "next/server";
import { canAccess } from "@/lib/permissions";

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const token = request.cookies.get("session")?.value;

    if (!token) {
        return NextResponse.redirect(
            new URL("/login", request.url)
        );
    }

    try {
        const apiUrl = "http://localhost:3000";

        if (!apiUrl) {
            return new NextResponse("API no configurada", {
                status: 503,
            });
        }

        const response = await fetch(
            `${apiUrl}/api/v1/auth/me`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        if (response.status === 401 || response.status === 403) {
            const redirect = NextResponse.redirect(
                new URL("/login", request.url)
            );

            redirect.cookies.delete("session");
            return redirect;
        }

        if (!response.ok) {
            return new NextResponse(
                "No se pudo verificar la sesión",
                { status: 503 }
            );
        }

        const { data: user } = await response.json();

        if (!user?.activo) {
            return NextResponse.redirect(
                new URL("/login", request.url)
            );
        }

        const role = user.rol?.nombre ?? "";

        if (!canAccess(pathname, role)) {
            return new NextResponse("Acceso denegado", {
                status: 403,
            });
        }

        return NextResponse.next();
    } catch {
        return new NextResponse(
            "Servicio de autenticación no disponible",
            { status: 503 }
        );
    }
}

export const config = {
    matcher: [
        "/inicio/:path*",
        "/ventas/:path*",
        "/balance/:path*",
        "/inventario/:path*",
        "/compras/:path*",
        "/proveedores/:path*",
        "/planilla/:path*",
        "/sucursales/:path*",
        "/admin/:path*",
        "/perfil/:path*",
    ],
};
