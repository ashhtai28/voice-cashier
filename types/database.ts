import type { OrderState } from "./order";

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          status: "pending" | "in_progress" | "completed";
          payload: OrderState;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          status?: "pending" | "in_progress" | "completed";
          payload: OrderState;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          status?: "pending" | "in_progress" | "completed";
          payload?: OrderState;
        };
      };
    };
  };
}
