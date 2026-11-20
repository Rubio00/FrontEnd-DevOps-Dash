"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");


  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Error al iniciar sesión");
        return;
      }

      router.replace("/inicio");
      router.refresh();
    } catch {
      setMessage("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-[#f8f1e8]">

      {/* LADO IZQUIERDO: IMAGEN DE LA CAFETERÍA */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/images/login/login.png"
          alt="Interior de Orígenes SV"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 flex flex-col justify-end p-16 text-white">
          <span className="text-sm uppercase tracking-[0.35em] mb-4">
            Café · Sabor · Tradición
          </span>

          <h2 className="text-5xl font-serif font-bold mb-5">
            Un buen café,
            <br />
            un nuevo comienzo.
          </h2>

          <p className="text-lg text-white/85 max-w-md">
            Bienvenido a Orígenes SV, donde cada taza
            representa una experiencia llena de sabor.
          </p>

          <div className="mt-10 w-20 h-1 bg-[#d49a55]" />
        </div>
      </section>

      {/* LADO DERECHO: FORMULARIO LOGIN */}
      <section className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">

        <div className="w-full max-w-md">

          {/* LOGOTIPO ORÍGENES SV */}
          <div className="text-center mb-10">

            <div className="flex justify-center mb-3">
              <svg
                viewBox="0 0 120 100"
                className="w-24 h-20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M57 30 C35 8 67 9 57 0 M68 31 C91 8 62 9 68 0"
                  stroke="#683817"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                <path
                  d="M20 35 H95 L88 73 Q58 90 27 73 Z"
                  stroke="#683817"
                  strokeWidth="5"
                  strokeLinejoin="round"
                />

                <path
                  d="M95 43 Q120 38 111 62 Q106 74 91 70"
                  stroke="#683817"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                <path
                  d="M34 82 H91"
                  stroke="#683817"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                <ellipse
                  cx="49"
                  cy="53"
                  rx="7"
                  ry="12"
                  transform="rotate(-35 49 53)"
                  fill="#683817"
                />

                <ellipse
                  cx="67"
                  cy="53"
                  rx="7"
                  ry="12"
                  transform="rotate(35 67 53)"
                  fill="#683817"
                />
              </svg>
            </div>

            <h1 className="text-4xl font-serif font-bold text-[#49250f]">
              Orígenes SV
            </h1>

            <div className="flex items-center justify-center gap-3 mt-3">
              <span className="w-10 h-[2px] bg-[#c47b35]" />

              <p className="text-xs tracking-[0.2em] text-[#683817] font-semibold">
                CAFÉ · SABOR · TRADICIÓN
              </p>

              <span className="w-10 h-[2px] bg-[#c47b35]" />
            </div>
          </div>

          {/* MENSAJE DE BIENVENIDA */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-[#49250f]">
              ¡Bienvenido de nuevo!
            </h2>

            <p className="text-gray-600 mt-3">
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* CORREO ELECTRÓNICO */}
            <div>
              <label className="block text-sm font-semibold text-[#49250f] mb-2">
                Correo electrónico
              </label>

              <div className="flex items-center border border-[#d9c2ad] rounded-xl px-4 bg-white/60 focus-within:border-[#79401d] transition">

                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-[#683817]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>

                <input
                  type="email"
                  placeholder="Ingresa tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent outline-none px-4 py-4 text-gray-800 placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* CONTRASEÑA */}
            <div>
              <label className="block text-sm font-semibold text-[#49250f] mb-2">
                Contraseña
              </label>

              <div className="flex items-center border border-[#d9c2ad] rounded-xl px-4 bg-white/60 focus-within:border-[#79401d] transition">

                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-[#683817]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10 V7a4 4 0 0 1 8 0v3" />
                </svg>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent outline-none px-4 py-4 text-gray-800 placeholder:text-gray-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-[#683817] hover:text-[#a05b2d]"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            {/* RECUPERAR CONTRASEÑA */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setMessage(
                    "La recuperación de contraseña se habilitará posteriormente."
                  )
                }
                className="text-sm text-[#683817] font-semibold underline hover:text-[#a05b2d]"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* MENSAJES */}
            {message && (
              <p
                role="status"
                className="text-sm text-center text-[#683817] bg-[#efe2d4] rounded-lg p-3"
              >
                {message}
              </p>
            )}

            {/* BOTÓN INICIAR SESIÓN */}
            <button
              type="submit"
              className="w-full bg-[#642f14] hover:bg-[#824522] text-white font-semibold py-4 rounded-xl transition duration-300 shadow-md"
            >
              Iniciar sesión
            </button>

          </form>

          {/* CONTACTO ADMINISTRADOR */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <span className="font-semibold text-[#683817]">
                Contacta al administrador
              </span>
            </p>
          </div>

          {/* PIE DE PÁGINA */}
          <p className="text-center text-xs text-[#987c68] mt-12">
            © 2026 Orígenes SV · Todos los derechos reservados
          </p>

        </div>
      </section>
    </main>
  );
}
