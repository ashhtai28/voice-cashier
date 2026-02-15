/**
 * Centralized pricing matching the Spill the Beans menu.
 * Used by metrics.ts and the customer receipt.
 */

import type { OrderItem, DrinkItem, PastryItem } from "@/types/order";

// ── Base drink prices: [small, large] ──

const DRINK_PRICES: Record<string, [number, number]> = {
  americano:        [3.00, 4.00],
  latte:            [4.00, 5.00],
  cold_brew:        [4.00, 5.00],
  mocha:            [4.50, 5.50],
  frappuccino:      [5.50, 6.00],
  black_tea:        [3.00, 3.75],
  jasmine_tea:      [3.00, 3.75],
  lemon_green_tea:  [3.50, 4.25],
  matcha_latte:     [4.50, 5.25],
};

const MILK_UPCHARGE: Record<string, number> = {
  whole: 0,
  skim: 0,
  oat: 0.50,
  almond: 0.75,
};

const ADDON_PRICES: Record<string, number> = {
  extra_espresso_shot: 1.50,
  extra_matcha_shot: 1.50,
  caramel_syrup: 0.50,
  hazelnut_syrup: 0.50,
};

const PASTRY_PRICES: Record<string, number> = {
  plain_croissant: 3.50,
  chocolate_croissant: 4.00,
  chocolate_chip_cookie: 2.50,
  banana_bread: 3.00,
};

function isDrink(item: OrderItem): item is DrinkItem {
  return item.type === "drink";
}

function isPastry(item: OrderItem): item is PastryItem {
  return item.type === "pastry";
}

/** Title-case a snake_case string: "extra_espresso_shot" → "Extra Espresso Shot" */
function titleCase(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Friendly short names for add-ons shown on the receipt */
const ADDON_LABELS: Record<string, string> = {
  extra_espresso_shot: "Extra Shot",
  extra_matcha_shot: "Extra Matcha",
  caramel_syrup: "Caramel Syrup",
  hazelnut_syrup: "Hazelnut Syrup",
};

export function itemPrice(item: OrderItem): number {
  if (isDrink(item)) {
    const prices = DRINK_PRICES[item.name] ?? [4.00, 5.00];
    const base = item.size === "large" ? prices[1] : item.size === "small" ? prices[0] : prices[0];
    const milkUp = item.milk ? (MILK_UPCHARGE[item.milk] ?? 0) : 0;
    const addOnTotal = (item.addOns ?? []).reduce((s, a) => s + (ADDON_PRICES[a] ?? 0), 0);
    return base + milkUp + addOnTotal;
  }
  if (isPastry(item)) {
    const unitPrice = PASTRY_PRICES[item.name] ?? 3.00;
    return unitPrice * (item.quantity ?? 1);
  }
  return 0;
}

/** Unit price for a pastry (before × quantity) */
export function pastryUnitPrice(item: PastryItem): number {
  return PASTRY_PRICES[item.name] ?? 3.00;
}

export function itemLabel(item: OrderItem): string {
  if (isDrink(item)) {
    const parts: string[] = [];
    if (item.size) parts.push(titleCase(item.size));
    if (item.temperature) parts.push(titleCase(item.temperature));
    parts.push(titleCase(item.name));
    if (item.milk) parts.push(titleCase(item.milk) + " Milk");
    if (item.sweetness && item.sweetness !== "regular") parts.push(titleCase(item.sweetness));
    if (item.iceLevel && item.iceLevel !== "regular") parts.push(titleCase(item.iceLevel));
    if (item.addOns?.length) {
      item.addOns.forEach((a) => parts.push("+ " + (ADDON_LABELS[a] ?? titleCase(a))));
    }
    return parts.join(" · ");
  }
  if (isPastry(item)) {
    const name = titleCase(item.name);
    return item.quantity > 1 ? `${name} ×${item.quantity}` : name;
  }
  return "Unknown item";
}

export { DRINK_PRICES, PASTRY_PRICES, MILK_UPCHARGE, ADDON_PRICES };
