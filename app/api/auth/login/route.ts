
import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return NextResponse.json(
                { message: "Correo y contraseña requeridos" },
                { status: 400 }
            );
        }

        const response = await apiFetch("/api/v1/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: "No se pudo iniciar sesión" },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (typeof data.token !== "string") {
            return NextResponse.json(
                { message: "Respuesta inválida del backend" },
                { status: 502 }
            );
        }

        const result = NextResponse.json({
            message: data.message,
            user: data.user,
        });

        result.cookies.set("session", data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 8,
        });

        return result;
    } catch {
        return NextResponse.json(
            { message: "Error de conexión con el servidor" },
            { status: 502 }
        );
    }
}
