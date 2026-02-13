import { NextResponse } from "next/server";
import { getSupabaseService } from "@/lib/supabase";
import { validateOrderState } from "@/lib/orderRules";
import type { OrderState } from "@/types/order";

export async function GET() {
  try {
    const supabase = getSupabaseService();
    const { data, error } = await supabase
      .from("orders")
      .select("id, created_at, updated_at, status, payload")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("orders list error", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { payload: OrderState };
    const { payload } = body;

    if (!payload?.items?.length) {
      return NextResponse.json({ error: "payload.items required" }, { status: 400 });
    }

    const errors = validateOrderState(payload);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0].message, validationErrors: errors }, { status: 400 });
    }

    const supabase = getSupabaseService();
    const { data, error } = await supabase
      .from("orders")
      .insert({ payload })
      .select("id, created_at, status, payload")
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("orders create error", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
