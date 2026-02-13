import { NextResponse } from "next/server";
import { getSupabaseService } from "@/lib/supabase";
import type { Database } from "@/types/database";

type Status = Database["public"]["Tables"]["orders"]["Row"]["status"];

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await _request.json()) as { status?: Status };
    const { status } = body;

    if (!status || !["pending", "in_progress", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "status must be pending, in_progress, or completed" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseService();
    const update: Database["public"]["Tables"]["orders"]["Update"] = { status };
    const { data, error } = await supabase
      .from("orders")
      .update(update)
      .eq("id", id)
      .select("id, created_at, updated_at, status, payload")
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("orders update error", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
