This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Integración con la API (DevOps-Dash)

El frontend consume el backend Express de `../DevOps-Dash` a través de `/api/v1`.

### Configuración

```bash
cp .env.example .env.local
# API_URL debe apuntar al backend (por defecto http://localhost:3000)
```

`API_URL` es **privada** (solo servidor). No se usa `NEXT_PUBLIC_*`: el navegador nunca
conoce la URL del backend ni el token.

> ⚠️ El backend y `next dev` usan el puerto 3000 por defecto. Levantá el front en otro
> puerto: `npm run dev -- -p 3001`.

### Arquitectura de datos

```
Componente cliente ──► /api/backend/<recurso>  (BFF, cookie httpOnly → Bearer)
Componente servidor ─► lib/api.ts (apiFetch/apiData con token desde cookies)
```

- `lib/api.ts`: cliente HTTP de servidor (timeout, `ApiError`, errores Joi/Sequelize).
- `lib/cliente.ts`: cliente de navegador; llama al BFF y normaliza errores.
- `app/api/backend/[...ruta]/route.ts`: BFF con lista blanca de recursos. Evita CORS y
  mantiene el JWT fuera de JavaScript (mitiga XSS).
- `lib/session.ts`: `getSessionUser()` / `requireSessionUser()` tipados.
- `services/*.ts`: lecturas server-side (`server-only`).
- `services/*.client.ts`: mutaciones desde componentes de cliente vía BFF.
- `lib/compra-mapper.ts`: normaliza los montos decimales (`"12.50"`) del backend a `number`.

### Módulos migrados a la API

Todos los módulos del menú trabajan contra el backend:

| Módulo | Operaciones |
|---|---|
| Inicio | sesión y permisos reales |
| Perfil | datos de sesión + logout |
| Sucursales | listar, ver, crear, editar |
| Proveedores | listar, crear |
| Compras | listar, crear (impacta stock y CxP) |
| Planilla | empleados, altas y activación/desactivación |
| Balance | ventas reales |
| **Administración** | usuarios (rol único) y catálogo de roles |
| **Inventario** | diseño original: existencias por sucursal, categorías, productos y receta dentro del formulario de producto. Sin ajustes manuales: el stock entra por Compras |
| **Ventas / POS** | caja, carrito, clientes, pagos y comprobantes |

Autenticación completa: `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, logout con
borrado de cookie.

### Pendiente

- Registrar pagos de cuentas por cobrar/pagar desde la UI (el servicio existe, falta la ruta).
- Anulación de ventas desde la UI (el servicio existe, falta la ruta).
- Edición de perfil y cambio de contraseña (no hay endpoints de autoservicio).
- Reportes agregados en el backend (el Balance se calcula en el front).
- Impresión térmica / PDF del comprobante del POS.


### Roles del backend

El backend valida con `checkRoles(...)` y los routers aceptan:

| Recurso | Roles |
|---|---|
| `sucursal` | `admin`, `gerente` |
| `usuario`, `rol` | `admin`, `gerente` |
| `empleado`, `planilla` | `admin`, `gerente` |
| `proveedor`, `compras` | `admin`, `gerente`, `compras` |
| `insumos`, `inventario` | `admin`, `gerente`, `compras`, `barista` |
| `ventas`, `clientes`, `caja` | `admin`, `gerente`, `cajero` |
| `recetas` | `admin`, `gerente`, `barista`, `compras` |

El seeder crea el rol `admin` y el usuario **`admin@origenes.sv`** (contraseña
`Origenes2026`), además de los 7 usuarios de prueba. Todos los recursos salvo
`auth/login` exigen JWT.


## Getting Started


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
