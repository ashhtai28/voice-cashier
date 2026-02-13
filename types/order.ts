/**
 * Order types matching the NYC Coffee menu.
 */

// ── Drinks ──
export type CoffeeDrink = "americano" | "latte" | "cold_brew" | "mocha" | "frappuccino";
export type TeaDrink = "black_tea" | "jasmine_tea" | "lemon_green_tea" | "matcha_latte";
export type DrinkName = CoffeeDrink | TeaDrink;

// ── Pastries ──
export type Pastry = "plain_croissant" | "chocolate_croissant" | "chocolate_chip_cookie" | "banana_bread";

// ── Modifiers ──
export type Size = "small" | "large";
export type Temperature = "hot" | "iced";
export type Milk = "whole" | "skim" | "oat" | "almond";
export type Sweetness = "no_sugar" | "less_sugar" | "regular" | "extra_sugar";
export type IceLevel = "no_ice" | "less_ice" | "regular" | "extra_ice";

export type AddOn =
  | "extra_espresso_shot"
  | "extra_matcha_shot"
  | "caramel_syrup"
  | "hazelnut_syrup";

// ── Order items ──
export interface DrinkItem {
  type: "drink";
  name: DrinkName;
  size: Size | null;
  temperature: Temperature | null;
  milk: Milk | null;
  sweetness: Sweetness | null;
  iceLevel: IceLevel | null;
  addOns: AddOn[];
}

export interface PastryItem {
  type: "pastry";
  name: Pastry;
  quantity: number;
}

export type OrderItem = DrinkItem | PastryItem;

export interface OrderState {
  items: OrderItem[];
}

export interface ChatResponsePayload {
  assistantMessage: string;
  updatedOrderState: OrderState;
  isComplete: boolean;
}
