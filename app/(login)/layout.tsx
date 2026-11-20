import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "Orígenes SV",
  description: "Sistema de gestión de cafetería Orígenes SV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
