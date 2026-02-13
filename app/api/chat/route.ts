import { NextResponse } from "next/server";
import { getChatCompletion } from "@/lib/openai";
import { validateOrderState } from "@/lib/orderRules";
import type { OrderState, DrinkItem, PastryItem } from "@/types/order";

export interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  currentOrderState: OrderState;
}

/**
 * Deduplicate items the LLM may have accidentally repeated during
 * clarification turns. A duplicate is an item that is a strict SUBSET
 * of another item (same name, and every non-null field matches).
 * This preserves legitimate orders of 2+ drinks with the same name
 * but different specs (e.g. a large hot oat latte AND a small iced almond latte).
 */
/** Count how many optional fields are filled on a drink (used to distinguish
 *  a partial clarification duplicate from a legitimate repeat order). */
function filledFieldCount(item: DrinkItem): number {
  let count = 0;
  if (item.size) count++;
  if (item.temperature) count++;
  if (item.milk) count++;
  if (item.sweetness) count++;
  if (item.iceLevel) count++;
  count += (item.addOns?.length ?? 0);
  return count;
}

function drinkIsSubsetOf(a: DrinkItem, b: DrinkItem): boolean {
  if (a.name !== b.name) return false;
  // Every non-null field on 'a' must match the same field on 'b'
  if (a.size && a.size !== b.size) return false;
  if (a.temperature && a.temperature !== b.temperature) return false;
  if (a.milk && a.milk !== b.milk) return false;
  if (a.sweetness && a.sweetness !== b.sweetness) return false;
  if (a.iceLevel && a.iceLevel !== b.iceLevel) return false;
  // addOns: a's addOns must be a subset of b's
  if (a.addOns?.length) {
    const bSet = new Set(b.addOns ?? []);
    if (!a.addOns.every((ao) => bSet.has(ao))) return false;
  }
  // Only a true subset if 'a' has strictly fewer filled fields than 'b'.
  // Two identical fully-specified drinks are legitimate duplicate orders.
  return filledFieldCount(a) < filledFieldCount(b);
}

function deduplicateItems(items: OrderState["items"]): OrderState["items"] {
  const result: OrderState["items"] = [];

  for (const item of items) {
    if (item.type === "drink") {
      const drink = item as DrinkItem;
      // Check if this drink is a less-filled duplicate of one already in result
      const supersetIdx = result.findIndex(
        (r) => r.type === "drink" && drinkIsSubsetOf(drink, r as DrinkItem)
      );
      if (supersetIdx >= 0) {
        // 'drink' is a subset of result[supersetIdx] — skip the duplicate
        continue;
      }
      // Check if an existing item in result is a subset of this new drink
      const subsetIdx = result.findIndex(
        (r) => r.type === "drink" && drinkIsSubsetOf(r as DrinkItem, drink)
      );
      if (subsetIdx >= 0) {
        // Replace the less-complete version with this more-complete one
        result[subsetIdx] = drink;
      } else {
        result.push(drink);
      }
    } else if (item.type === "pastry") {
      // Pastries: only dedup if exact same name AND same quantity (true duplicate)
      const pastry = item as PastryItem;
      const exactDupe = result.findIndex(
        (r) =>
          r.type === "pastry" &&
          (r as PastryItem).name === pastry.name &&
          (r as PastryItem).quantity === pastry.quantity
      );
      if (exactDupe >= 0) {
        // Skip exact duplicate
        continue;
      }
      result.push(pastry);
    }
  }

  return result;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const { messages, currentOrderState } = body;

    if (!messages?.length || !currentOrderState) {
      return NextResponse.json({ error: "messages and currentOrderState required" }, { status: 400 });
    }

    // Only send user/assistant messages
    const chatMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const payload = await getChatCompletion(chatMessages, currentOrderState);
    if (!payload) {
      return NextResponse.json({ error: "Failed to get valid response from assistant" }, { status: 500 });
    }

    // Deduplicate items the LLM may have accidentally repeated
    payload.updatedOrderState.items = deduplicateItems(payload.updatedOrderState.items);

    // Server-side guard: if LLM says complete but items fail validation, override
    const validationErrors = validateOrderState(payload.updatedOrderState);
    if (payload.isComplete && validationErrors.length > 0) {
      const firstError = validationErrors[0].message;
      return NextResponse.json({
        ...payload,
        isComplete: false,
        assistantMessage: firstError,
      });
    }

    return NextResponse.json(payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("chat error:", message);

    if (message.includes("API key")) {
      return NextResponse.json({ error: "OpenAI API key is invalid or not set" }, { status: 500 });
    }
    if (message.includes("quota") || message.includes("rate")) {
      return NextResponse.json({ error: "OpenAI rate limit or quota exceeded" }, { status: 429 });
    }

    return NextResponse.json({ error: `Chat failed: ${message}` }, { status: 500 });
  }
}
