export type Unit = "g" | "ml" | "unidad";

export type Ingredient = {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: Unit;
  updatedAt: string;
};

export type RecipeItem = {
  ingredientId: string;
  quantity: number;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  kind: "elaborado" | "reventa";
  recipe: RecipeItem[];
};

export type Movement = {
  id: string;
  type: "entrada" | "venta" | "ajuste";
  item: string;
  quantity: string;
  detail: string;
  time: string;
  user: string;
};

export const initialIngredients: Ingredient[] = [
  {
    id: "cafe",
    sku: "INS-CAF-001",
    name: "Café de especialidad",
    category: "Materia prima",
    stock: 8500,
    minStock: 2000,
    unit: "g",
    updatedAt: "Hoy, 08:15",
  },
  {
    id: "leche",
    sku: "INS-LEC-002",
    name: "Leche entera",
    category: "Lácteos",
    stock: 12000,
    minStock: 5000,
    unit: "ml",
    updatedAt: "Hoy, 08:10",
  },
  {
    id: "avena",
    sku: "INS-AVE-003",
    name: "Bebida de avena",
    category: "Alternativas",
    stock: 1800,
    minStock: 2000,
    unit: "ml",
    updatedAt: "Ayer, 17:40",
  },
  {
    id: "cacao",
    sku: "INS-CAC-004",
    name: "Cacao en polvo",
    category: "Materia prima",
    stock: 2400,
    minStock: 500,
    unit: "g",
    updatedAt: "Hoy, 07:55",
  },
  {
    id: "chai",
    sku: "INS-CHA-005",
    name: "Mezcla de té chai",
    category: "Materia prima",
    stock: 1200,
    minStock: 300,
    unit: "g",
    updatedAt: "Ayer, 16:20",
  },
  {
    id: "matcha",
    sku: "INS-MAT-006",
    name: "Matcha culinario",
    category: "Materia prima",
    stock: 0,
    minStock: 200,
    unit: "g",
    updatedAt: "Ayer, 18:02",
  },
  {
    id: "hielo",
    sku: "INS-HIE-007",
    name: "Hielo",
    category: "Materia prima",
    stock: 15000,
    minStock: 3000,
    unit: "g",
    updatedAt: "Hoy, 08:20",
  },
  {
    id: "azucar",
    sku: "INS-AZU-008",
    name: "Azúcar",
    category: "Materia prima",
    stock: 5000,
    minStock: 1000,
    unit: "g",
    updatedAt: "Ayer, 15:30",
  },
  {
    id: "vaso-12",
    sku: "EMP-VAS-012",
    name: "Vaso 12 oz",
    category: "Empaques",
    stock: 120,
    minStock: 50,
    unit: "unidad",
    updatedAt: "Hoy, 08:05",
  },
  {
    id: "vaso-16",
    sku: "EMP-VAS-016",
    name: "Vaso 16 oz",
    category: "Empaques",
    stock: 34,
    minStock: 40,
    unit: "unidad",
    updatedAt: "Hoy, 08:05",
  },
  {
    id: "tapa-12",
    sku: "EMP-TAP-012",
    name: "Tapadera 12 oz",
    category: "Empaques",
    stock: 130,
    minStock: 50,
    unit: "unidad",
    updatedAt: "Hoy, 08:05",
  },
  {
    id: "tapa-16",
    sku: "EMP-TAP-016",
    name: "Tapadera 16 oz",
    category: "Empaques",
    stock: 90,
    minStock: 40,
    unit: "unidad",
    updatedAt: "Hoy, 08:05",
  },
  {
    id: "vineta",
    sku: "EMP-VIN-001",
    name: "Viñeta",
    category: "Empaques",
    stock: 220,
    minStock: 80,
    unit: "unidad",
    updatedAt: "Ayer, 17:45",
  },
  {
    id: "agua",
    sku: "REV-AGU-001",
    name: "Agua embotellada 600 ml",
    category: "Reventa",
    stock: 48,
    minStock: 12,
    unit: "unidad",
    updatedAt: "Hoy, 07:50",
  },
  {
    id: "galleta",
    sku: "REV-GAL-001",
    name: "Galleta artesanal empacada",
    category: "Reventa",
    stock: 24,
    minStock: 10,
    unit: "unidad",
    updatedAt: "Ayer, 16:10",
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
    type: "entrada",
    item: "Café de especialidad",
    quantity: "+5,000 g",
    detail: "Compra FC-00128 · Beneficio El Manzano",
    time: "Hoy, 08:15",
    user: "Demo",
  },
  {
    id: "mov-2",
    type: "venta",
    item: "Latte grande",
    quantity: "-18 g café · -250 ml leche",
    detail: "Venta DEMO-0042 · 1 unidad",
    time: "Hoy, 08:12",
    user: "Demo",
  },
  {
    id: "mov-3",
    type: "entrada",
    item: "Leche entera",
    quantity: "+12,000 ml",
    detail: "Compra FC-00127 · Lácteos del Valle",
    time: "Hoy, 08:10",
    user: "Demo",
  },
  {
    id: "mov-4",
    type: "ajuste",
    item: "Vaso 16 oz",
    quantity: "-6 unidades",
    detail: "Ajuste por empaques dañados",
    time: "Ayer, 17:50",
    user: "Demo",
  },
];
