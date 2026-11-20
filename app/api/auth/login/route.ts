import { NextRequest, NextResponse } from "next/server";

import { ApiError, apiJson } from "@/lib/api";
import { COOKIE_SESION } from "@/lib/session";

type RespuestaLogin = {
    message?: string;
    token?: string;
    user?: unknown;
};

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

        const data = await apiJson<RespuestaLogin>("/api/v1/auth/login", {
            method: "POST",
            body: { email: email.trim().toLowerCase(), password },
        });

        if (typeof data.token !== "string") {
            return NextResponse.json(
                { message: "Respuesta inválida del backend" },
                { status: 502 }
            );
        }

        const result = NextResponse.json({
            message: data.message ?? "Inicio de sesión exitoso",
            user: data.user,
        });

        result.cookies.set(COOKIE_SESION, data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 8,
        });

        return result;
    } catch (error) {
        if (error instanceof ApiError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json(
            { message: "Error de conexión con el servidor" },
            { status: 502 }
        );
    }
}

