import { ventasBalance } from "@/data/balanceMock";
import type { VentaBalance } from "@/types/balance";

export async function getVentasBalance(): Promise<VentaBalance[]> {
  return ventasBalance;
}