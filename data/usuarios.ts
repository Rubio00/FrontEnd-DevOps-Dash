import type { Usuario } from "@/types/auth";

/**
 * Datos simulados de usuarios. Cuando exista la API, este archivo se reemplaza
 * por la respuesta del endpoint de sesión y el resto del código no cambia.
 */
export const usuarios: Usuario[] = [
  {
    id: "u-ana",
    nombre: "Ana Martínez",
    email: "ana.martinez@origenes.sv",
    cargo: "Gerente general",
    iniciales: "AM",
    rol: "administrador",
    sucursalId: "S01",
  },
  {
    id: "u-carlos",
    nombre: "Carlos Rivera",
    email: "carlos.rivera@origenes.sv",
    cargo: "Gerente de sucursal",
    iniciales: "CR",
    rol: "gerente",
    sucursalId: "S02",
  },
  {
    id: "u-maria",
    nombre: "María López",
    email: "maria.lopez@origenes.sv",
    cargo: "Cajera",
    iniciales: "ML",
    rol: "cajero",
    sucursalId: "S03",
  },
  {
    id: "u-jose",
    nombre: "José Hernández",
    email: "jose.hernandez@origenes.sv",
    cargo: "Encargado de bodega",
    iniciales: "JH",
    rol: "bodega",
    sucursalId: "S01",
  },
];

export const usuarioDemoPorDefecto = usuarios[0].id;
