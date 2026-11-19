export type Unit = "g" | "ml" | "unidad";
export type InventoryItemKind = "insumo" | "reventa";

export type Branch = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Supplier = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
};

export type StockLevel = {
  stock: number;
  minStock: number;
  updatedAt: string;
};

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  kind: InventoryItemKind;
  unit: Unit;
  supplierIds: string[];
  stockByBranch: Record<string, StockLevel>;
};

export type StockedInventoryItem = InventoryItem & StockLevel;

export type RecipeItem = {
  ingredientId: string;
  quantity: number;
};

export type Product = {
  id: string;
  sku?: string;
  name: string;
  category: string;
  price: number;
  kind: "elaborado" | "reventa";
  recipe: RecipeItem[];
};

export type Movement = {
  id: string;
  branchId: string;
  type: "entrada" | "venta" | "ajuste";
  item: string;
  quantity: string;
  detail: string;
  time: string;
  user: string;
};

export const branches: Branch[] = [
  { id: "centro", name: "Centro" },
  { id: "santa-tecla", name: "Santa Tecla" },
  { id: "san-miguel", name: "San Miguel" },
];

export const categories: Category[] = [
  { id: "alimentos-empacados", name: "Alimentos empacados" },
  { id: "alternativas", name: "Alternativas" },
  { id: "bebidas-empacadas", name: "Bebidas empacadas" },
  { id: "bebidas-sin-cafe", name: "Bebidas sin café" },
  { id: "cafe-caliente", name: "Café caliente" },
  { id: "cafe-frio", name: "Café frío" },
  { id: "empacados", name: "Empacados" },
  { id: "empaques", name: "Empaques" },
  { id: "lacteos", name: "Lácteos" },
  { id: "materia-prima", name: "Materia prima" },
];

export const initialSuppliers: Supplier[] = [
  {
    id: "beneficio-manzano",
    name: "Beneficio El Manzano",
    contact: "Carlos Méndez",
    phone: "2234-1180",
    email: "ventas@el-manzano.example",
  },
  {
    id: "cafe-ardiente",
    name: "Café Ardiente SV",
    contact: "Ana Rivas",
    phone: "2298-4412",
    email: "contacto@ardiente.example",
  },
  {
    id: "lacteos-valle",
    name: "Lácteos del Valle",
    contact: "Marta Flores",
    phone: "2312-7788",
    email: "pedidos@lacteosvalle.example",
  },
  {
    id: "empaques-sv",
    name: "Empaques SV",
    contact: "Luis Hernández",
    phone: "2560-9031",
    email: "ventas@empaquessv.example",
  },
  {
    id: "alimentos-naturales",
    name: "Alimentos Naturales",
    contact: "Sofía Castro",
    phone: "2271-6640",
    email: "hola@naturales.example",
  },
  {
    id: "distribuidora-centro",
    name: "Distribuidora Centro",
    contact: "Jorge Ramírez",
    phone: "2221-3098",
    email: "ventas@distribuidoracentro.example",
  },
];

function createStockLevels(
  stock: number,
  minStock: number,
  updatedAt: string,
  santaTeclaStock = Math.round(stock * 0.6),
  sanMiguelStock = Math.round(stock * 0.4),
): Record<string, StockLevel> {
  return {
    centro: { stock, minStock, updatedAt },
    "santa-tecla": { stock: santaTeclaStock, minStock, updatedAt },
    "san-miguel": { stock: sanMiguelStock, minStock, updatedAt },
  };
}

export function createEmptyStockLevels(minStock: number): Record<string, StockLevel> {
  return Object.fromEntries(
    branches.map((branch) => [
      branch.id,
      { stock: 0, minStock, updatedAt: "Ahora" },
    ]),
  );
}

export const initialItems: InventoryItem[] = [
  {
    id: "cafe",
    sku: "INS-CAF-001",
    name: "Café de especialidad",
    category: "Materia prima",
    kind: "insumo",
    unit: "g",
    supplierIds: ["beneficio-manzano", "cafe-ardiente"],
    stockByBranch: createStockLevels(8500, 2000, "Hoy, 08:15"),
  },
  {
    id: "leche",
    sku: "INS-LEC-002",
    name: "Leche entera",
    category: "Lácteos",
    kind: "insumo",
    unit: "ml",
    supplierIds: ["lacteos-valle", "distribuidora-centro"],
    stockByBranch: createStockLevels(12000, 5000, "Hoy, 08:10"),
  },
  {
    id: "avena",
    sku: "INS-AVE-003",
    name: "Bebida de avena",
    category: "Alternativas",
    kind: "insumo",
    unit: "ml",
    supplierIds: ["alimentos-naturales", "distribuidora-centro"],
    stockByBranch: createStockLevels(1800, 2000, "Ayer, 17:40"),
  },
  {
    id: "cacao",
    sku: "INS-CAC-004",
    name: "Cacao en polvo",
    category: "Materia prima",
    kind: "insumo",
    unit: "g",
    supplierIds: ["alimentos-naturales", "distribuidora-centro"],
    stockByBranch: createStockLevels(2400, 500, "Hoy, 07:55"),
  },
  {
    id: "chai",
    sku: "INS-CHA-005",
    name: "Mezcla de té chai",
    category: "Materia prima",
    kind: "insumo",
    unit: "g",
    supplierIds: ["alimentos-naturales"],
    stockByBranch: createStockLevels(1200, 300, "Ayer, 16:20"),
  },
  {
    id: "matcha",
    sku: "INS-MAT-006",
    name: "Matcha culinario",
    category: "Materia prima",
    kind: "insumo",
    unit: "g",
    supplierIds: ["alimentos-naturales"],
    stockByBranch: createStockLevels(0, 200, "Ayer, 18:02"),
  },
  {
    id: "hielo",
    sku: "INS-HIE-007",
    name: "Hielo",
    category: "Materia prima",
    kind: "insumo",
    unit: "g",
    supplierIds: ["distribuidora-centro"],
    stockByBranch: createStockLevels(15000, 3000, "Hoy, 08:20"),
  },
  {
    id: "azucar",
    sku: "INS-AZU-008",
    name: "Azúcar",
    category: "Materia prima",
    kind: "insumo",
    unit: "g",
    supplierIds: ["distribuidora-centro"],
    stockByBranch: createStockLevels(5000, 1000, "Ayer, 15:30"),
  },
  {
    id: "vaso-12",
    sku: "INS-VAS-012",
    name: "Vaso 12 oz",
    category: "Empaques",
    kind: "insumo",
    unit: "unidad",
    supplierIds: ["empaques-sv", "distribuidora-centro"],
    stockByBranch: createStockLevels(120, 50, "Hoy, 08:05"),
  },
  {
    id: "vaso-16",
    sku: "INS-VAS-016",
    name: "Vaso 16 oz",
    category: "Empaques",
    kind: "insumo",
    unit: "unidad",
    supplierIds: ["empaques-sv", "distribuidora-centro"],
    stockByBranch: createStockLevels(34, 40, "Hoy, 08:05"),
  },
  {
    id: "tapa-12",
    sku: "INS-TAP-012",
    name: "Tapadera 12 oz",
    category: "Empaques",
    kind: "insumo",
    unit: "unidad",
    supplierIds: ["empaques-sv", "distribuidora-centro"],
    stockByBranch: createStockLevels(130, 50, "Hoy, 08:05"),
  },
  {
    id: "tapa-16",
    sku: "INS-TAP-016",
    name: "Tapadera 16 oz",
    category: "Empaques",
    kind: "insumo",
    unit: "unidad",
    supplierIds: ["empaques-sv", "distribuidora-centro"],
    stockByBranch: createStockLevels(90, 40, "Hoy, 08:05"),
  },
  {
    id: "vineta",
    sku: "INS-VIN-001",
    name: "Viñeta",
    category: "Empaques",
    kind: "insumo",
    unit: "unidad",
    supplierIds: ["empaques-sv"],
    stockByBranch: createStockLevels(220, 80, "Ayer, 17:45"),
  },
  {
    id: "agua",
    sku: "REV-AGU-001",
    name: "Agua embotellada 600 ml",
    category: "Bebidas empacadas",
    kind: "reventa",
    unit: "unidad",
    supplierIds: ["distribuidora-centro"],
    stockByBranch: createStockLevels(48, 12, "Hoy, 07:50"),
  },
  {
    id: "galleta",
    sku: "REV-GAL-001",
    name: "Galleta artesanal empacada",
    category: "Alimentos empacados",
    kind: "reventa",
    unit: "unidad",
    supplierIds: ["alimentos-naturales", "distribuidora-centro"],
    stockByBranch: createStockLevels(24, 10, "Ayer, 16:10"),
  },
];

export const products: Product[] = [
  {
    id: "espresso",
    name: "Espresso",
    category: "Café caliente",
    price: 2,
    kind: "elaborado",
    recipe: [{ ingredientId: "cafe", quantity: 18 }],
  },
  {
    id: "espresso-doble",
    name: "Espresso doble",
    category: "Café caliente",
    price: 2.75,
    kind: "elaborado",
    recipe: [{ ingredientId: "cafe", quantity: 36 }],
  },
  {
    id: "americano",
    name: "Americano",
    category: "Café caliente",
    price: 2.5,
    kind: "elaborado",
    recipe: [
      { ingredientId: "cafe", quantity: 18 },
      { ingredientId: "vaso-12", quantity: 1 },
      { ingredientId: "tapa-12", quantity: 1 },
      { ingredientId: "vineta", quantity: 1 },
    ],
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    category: "Café caliente",
    price: 3.25,
    kind: "elaborado",
    recipe: [
      { ingredientId: "cafe", quantity: 18 },
      { ingredientId: "leche", quantity: 180 },
      { ingredientId: "vaso-12", quantity: 1 },
      { ingredientId: "tapa-12", quantity: 1 },
      { ingredientId: "vineta", quantity: 1 },
    ],
  },
  {
    id: "latte-grande",
    name: "Latte grande",
    category: "Café caliente",
    price: 3.75,
    kind: "elaborado",
    recipe: [
      { ingredientId: "cafe", quantity: 18 },
      { ingredientId: "leche", quantity: 250 },
      { ingredientId: "vaso-16", quantity: 1 },
      { ingredientId: "tapa-16", quantity: 1 },
      { ingredientId: "vineta", quantity: 1 },
    ],
  },
  {
    id: "mocha-grande",
    name: "Mocha grande",
    category: "Café caliente",
    price: 4.25,
    kind: "elaborado",
    recipe: [
      { ingredientId: "cafe", quantity: 18 },
      { ingredientId: "leche", quantity: 220 },
      { ingredientId: "cacao", quantity: 20 },
      { ingredientId: "vaso-16", quantity: 1 },
      { ingredientId: "tapa-16", quantity: 1 },
      { ingredientId: "vineta", quantity: 1 },
    ],
  },
  {
    id: "latte-avena",
    name: "Latte de avena",
    category: "Café caliente",
    price: 4.25,
    kind: "elaborado",
    recipe: [
      { ingredientId: "cafe", quantity: 18 },
      { ingredientId: "avena", quantity: 250 },
      { ingredientId: "vaso-16", quantity: 1 },
      { ingredientId: "tapa-16", quantity: 1 },
      { ingredientId: "vineta", quantity: 1 },
    ],
  },
  {
    id: "cafe-helado",
    name: "Café helado",
    category: "Café frío",
    price: 3.75,
    kind: "elaborado",
    recipe: [
      { ingredientId: "cafe", quantity: 18 },
      { ingredientId: "leche", quantity: 150 },
      { ingredientId: "hielo", quantity: 150 },
      { ingredientId: "vaso-16", quantity: 1 },
      { ingredientId: "tapa-16", quantity: 1 },
      { ingredientId: "vineta", quantity: 1 },
    ],
  },
  {
    id: "chai-latte",
    name: "Chai latte",
    category: "Bebidas sin café",
    price: 3.75,
    kind: "elaborado",
    recipe: [
      { ingredientId: "chai", quantity: 18 },
      { ingredientId: "leche", quantity: 250 },
      { ingredientId: "vaso-16", quantity: 1 },
      { ingredientId: "tapa-16", quantity: 1 },
      { ingredientId: "vineta", quantity: 1 },
    ],
  },
  {
    id: "matcha-latte",
    name: "Matcha latte",
    category: "Bebidas sin café",
    price: 4,
    kind: "elaborado",
    recipe: [
      { ingredientId: "matcha", quantity: 8 },
      { ingredientId: "leche", quantity: 250 },
      { ingredientId: "vaso-16", quantity: 1 },
      { ingredientId: "tapa-16", quantity: 1 },
      { ingredientId: "vineta", quantity: 1 },
    ],
  },
  {
    id: "chocolate-caliente",
    name: "Chocolate caliente",
    category: "Bebidas sin café",
    price: 3.25,
    kind: "elaborado",
    recipe: [
      { ingredientId: "cacao", quantity: 25 },
      { ingredientId: "leche", quantity: 250 },
      { ingredientId: "vaso-12", quantity: 1 },
      { ingredientId: "tapa-12", quantity: 1 },
      { ingredientId: "vineta", quantity: 1 },
    ],
  },
  {
    id: "chai-helado",
    name: "Chai helado",
    category: "Bebidas sin café",
    price: 3.75,
    kind: "elaborado",
    recipe: [
      { ingredientId: "chai", quantity: 18 },
      { ingredientId: "leche", quantity: 150 },
      { ingredientId: "hielo", quantity: 150 },
      { ingredientId: "vaso-16", quantity: 1 },
      { ingredientId: "tapa-16", quantity: 1 },
      { ingredientId: "vineta", quantity: 1 },
    ],
  },
  {
    id: "agua-embotellada",
    name: "Agua embotellada",
    category: "Empacados",
    price: 1.25,
    kind: "reventa",
    recipe: [{ ingredientId: "agua", quantity: 1 }],
  },
  {
    id: "galleta-empacada",
    name: "Galleta artesanal",
    category: "Empacados",
    price: 1.5,
    kind: "reventa",
    recipe: [{ ingredientId: "galleta", quantity: 1 }],
  },
];

export const initialMovements: Movement[] = [
  {
    id: "mov-1",
    branchId: "centro",
    type: "entrada",
    item: "Café de especialidad",
    quantity: "+5,000 g",
    detail: "Recepción de abastecimiento ABS-00128",
    time: "Hoy, 08:15",
    user: "Demo",
  },
  {
    id: "mov-2",
    branchId: "centro",
    type: "venta",
    item: "Latte grande",
    quantity: "-18 g café · -250 ml leche",
    detail: "Consumo registrado por el módulo de ventas",
    time: "Hoy, 08:12",
    user: "Demo",
  },
  {
    id: "mov-3",
    branchId: "santa-tecla",
    type: "entrada",
    item: "Leche entera",
    quantity: "+12,000 ml",
    detail: "Recepción de abastecimiento ABS-00127",
    time: "Hoy, 08:10",
    user: "Demo",
  },
  {
    id: "mov-4",
    branchId: "centro",
    type: "ajuste",
    item: "Vaso 16 oz",
    quantity: "-6 unidades",
    detail: "Ajuste manual por empaques dañados",
    time: "Ayer, 17:50",
    user: "Demo",
  },
];
