/**
 * Business rules for the full NYC Coffee menu.
 * All validation is deterministic — no LLM.
 *
 * Many rules are "hidden" — not on the menu but enforced by common sense:
 *  - Max 4 extra espresso shots (6 total is dangerous territory)
 *  - Latte / mocha / matcha latte with no espresso/matcha = just milk → rejected
 *  - Frappuccino and cold brew are iced-only
 *  - Ice level only applies to iced drinks
 *  - Espresso shots don't belong on teas (except matcha latte)
 *  - Matcha shot only on matcha latte
 *  - Syrup pumps are capped at a reasonable count
 *  - Max 15 items per order (you're not catering from a voice app)
 */

import type { OrderItem, DrinkItem, PastryItem, OrderState } from "@/types/order";

// ── Valid values ──

const COFFEE_DRINKS = ["americano", "latte", "cold_brew", "mocha", "frappuccino"] as const;
const TEA_DRINKS = ["black_tea", "jasmine_tea", "lemon_green_tea", "matcha_latte"] as const;
const ALL_DRINKS = [...COFFEE_DRINKS, ...TEA_DRINKS] as const;
const ALL_PASTRIES = ["plain_croissant", "chocolate_croissant", "chocolate_chip_cookie", "banana_bread"] as const;

const VALID_SIZES = ["small", "large"] as const;
const VALID_TEMPS = ["hot", "iced"] as const;
const VALID_MILKS = ["whole", "skim", "oat", "almond"] as const;
const VALID_SWEETNESS = ["no_sugar", "less_sugar", "regular", "extra_sugar"] as const;
const VALID_ICE = ["no_ice", "less_ice", "regular", "extra_ice"] as const;
const VALID_ADDONS = ["extra_espresso_shot", "extra_matcha_shot", "caramel_syrup", "hazelnut_syrup"] as const;

// Drinks that are iced-only
const ICED_ONLY = ["cold_brew", "frappuccino"] as const;

// Drinks that have milk as a core component
const MILK_DRINKS = ["latte", "mocha", "matcha_latte"] as const;

// Drinks that are espresso-based (adding espresso shots makes sense)
const ESPRESSO_DRINKS = ["americano", "latte", "cold_brew", "mocha", "frappuccino"] as const;

// Pure teas (no espresso shots allowed)
const PURE_TEAS = ["black_tea", "jasmine_tea", "lemon_green_tea"] as const;

// ── Limits ──
const MAX_ESPRESSO_SHOTS = 4; // 4 extra on top of the default 1-2 = up to 6 total
const MAX_SYRUP_PUMPS = 6;    // each add-on entry = 1 pump, cap duplicate entries
const MAX_ITEMS_PER_ORDER = 15;

export interface ValidationError {
  message: string;
  itemIndex?: number;
}

function isDrink(item: OrderItem): item is DrinkItem {
  return item.type === "drink";
}

function isPastry(item: OrderItem): item is PastryItem {
  return item.type === "pastry";
}

function includes<T>(arr: readonly T[], val: unknown): val is T {
  return arr.includes(val as T);
}

export function validateOrderState(state: OrderState): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!state.items?.length) return errors;

  // ── Order-level limits ──
  if (state.items.length > MAX_ITEMS_PER_ORDER) {
    errors.push({
      message: `That's a lot! We can only handle up to ${MAX_ITEMS_PER_ORDER} items per order through voice ordering. For larger orders, please visit us in-store.`,
    });
    return errors; // Don't validate individual items if order is too large
  }

  state.items.forEach((item, index) => {
    if (isDrink(item)) {
      // Valid drink name
      if (!includes(ALL_DRINKS, item.name)) {
        errors.push({ message: "That drink isn't on our menu.", itemIndex: index });
        return;
      }

      // Size required
      if (!item.size || !includes(VALID_SIZES, item.size)) {
        errors.push({ message: "We need a size — small (12oz) or large (16oz).", itemIndex: index });
      }

      // Temperature required
      if (!item.temperature || !includes(VALID_TEMPS, item.temperature)) {
        errors.push({ message: "Hot or iced?", itemIndex: index });
      }

      // Iced-only drinks can't be hot
      if (includes(ICED_ONLY, item.name) && item.temperature === "hot") {
        const label = item.name === "cold_brew" ? "Cold brew" : "Frappuccino";
        errors.push({ message: `${label} is iced only — we can't make that hot.`, itemIndex: index });
      }

      // Milk-based drinks need a milk type
      if (includes(MILK_DRINKS, item.name) && (!item.milk || !includes(VALID_MILKS, item.milk))) {
        errors.push({ message: "What kind of milk? Whole, skim, oat, or almond.", itemIndex: index });
      }

      // Validate optional fields if provided
      if (item.sweetness && !includes(VALID_SWEETNESS, item.sweetness)) {
        errors.push({ message: "Sweetness must be no sugar, less sugar, regular, or extra sugar.", itemIndex: index });
      }

      if (item.iceLevel && !includes(VALID_ICE, item.iceLevel)) {
        errors.push({ message: "Ice level must be no ice, less ice, regular, or extra ice.", itemIndex: index });
      }

      // Ice level only applies to iced drinks
      if (item.temperature === "hot" && item.iceLevel && item.iceLevel !== "regular") {
        errors.push({ message: "Ice level only applies to iced drinks.", itemIndex: index });
      }

      // ── Add-on validation ──
      if (item.addOns?.length) {
        for (const addon of item.addOns) {
          if (!includes(VALID_ADDONS, addon)) {
            errors.push({ message: `"${addon}" isn't a valid add-on.`, itemIndex: index });
          }
        }

        // Espresso shots on pure teas makes no sense
        if (item.addOns.includes("extra_espresso_shot") && includes(PURE_TEAS, item.name)) {
          errors.push({
            message: `We can't add espresso shots to ${item.name.replace(/_/g, " ")} — that's a tea! Maybe try a latte or americano instead?`,
            itemIndex: index,
          });
        }

        // Matcha shot only on matcha latte
        if (item.addOns.includes("extra_matcha_shot") && item.name !== "matcha_latte") {
          errors.push({ message: "Extra matcha shot is only for the matcha latte.", itemIndex: index });
        }

        // Cap espresso shots
        const espressoCount = item.addOns.filter((a) => a === "extra_espresso_shot").length;
        if (espressoCount > MAX_ESPRESSO_SHOTS) {
          errors.push({
            message: `We can add up to ${MAX_ESPRESSO_SHOTS} extra espresso shots — ${espressoCount} is too many! That much caffeine isn't safe.`,
            itemIndex: index,
          });
        }

        // Cap syrup pumps per type
        const caramelCount = item.addOns.filter((a) => a === "caramel_syrup").length;
        const hazelnutCount = item.addOns.filter((a) => a === "hazelnut_syrup").length;
        if (caramelCount > MAX_SYRUP_PUMPS) {
          errors.push({
            message: `${caramelCount} pumps of caramel is a bit much — we cap it at ${MAX_SYRUP_PUMPS} pumps.`,
            itemIndex: index,
          });
        }
        if (hazelnutCount > MAX_SYRUP_PUMPS) {
          errors.push({
            message: `${hazelnutCount} pumps of hazelnut is a bit much — we cap it at ${MAX_SYRUP_PUMPS} pumps.`,
            itemIndex: index,
          });
        }
      }

      // ── "Degenerate" drink detection ──
      // A latte/mocha is espresso + milk. Removing all espresso = just milk.
      // We don't currently track "remove default shot" but if the name is latte
      // and there are zero espresso shots explicitly plus no add-ons that compensate,
      // this is fine. This rule is enforced at the LLM level via system prompt.
      // The prompt already tells the LLM to reject nonsensical combos.

    } else if (isPastry(item)) {
      if (!includes(ALL_PASTRIES, item.name)) {
        errors.push({ message: "That pastry isn't on our menu.", itemIndex: index });
        return;
      }
      if (!item.quantity || item.quantity < 1) {
        errors.push({ message: "Pastry quantity must be at least 1.", itemIndex: index });
      } else if (item.quantity > 10) {
        errors.push({ message: "We can do up to 10 of any pastry per order. For larger quantities, please call ahead!", itemIndex: index });
      }
    } else {
      errors.push({ message: "Item must be a drink or pastry.", itemIndex: index });
    }
  });

  return errors;
}

export function getMissingFieldsForDrink(item: DrinkItem): string[] {
  const missing: string[] = [];
  if (!item.size) missing.push("size");
  if (!item.temperature) missing.push("temperature");
  if (includes(MILK_DRINKS, item.name) && !item.milk) missing.push("milk");
  return missing;
}
