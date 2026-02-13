"use client";

import { useState, useEffect, useCallback } from "react";
import { itemLabel } from "@/lib/pricing";
import type { OrderState, DrinkItem, PastryItem } from "@/types/order";
import { IconCoffee, IconPastry } from "@/app/Icons";
import "./orders.css";

type Status = "pending" | "in_progress" | "completed";

interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  status: Status;
  payload: OrderState;
}

type Filter = "all" | Status;

const NEXT_STATUS: Record<Status, Status | null> = {
  pending: "in_progress",
  in_progress: "completed",
  completed: null,
};

const STATUS_LABEL: Record<Status, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

const STATUS_ACTION: Record<Status, string> = {
  pending: "Start Making",
  in_progress: "Mark Completed",
  completed: "",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

function isDrink(item: { type: string }): item is DrinkItem {
  return item.type === "drink";
}

function isPastry(item: { type: string }): item is PastryItem {
  return item.type === "pastry";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data: Order[] = await res.json();
        setOrders(data);
      }
    } catch {
      // silent retry
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + auto-refresh every 5s
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (id: string, status: Status) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated: Order = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      }
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts: Record<Status, number> = {
    pending: orders.filter((o) => o.status === "pending").length,
    in_progress: orders.filter((o) => o.status === "in_progress").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="orders-page">
      <div className="orders-card">
      {/* Header */}
      <header className="orders-header">
        <h1>Orders</h1>
        <span className="orders-count">{orders.length}</span>
      </header>

      {/* Filter tabs */}
      <nav className="orders-tabs">
        <button
          className={`tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All <span className="tab-count">{orders.length}</span>
        </button>
        <button
          className={`tab pending ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending <span className="tab-count">{counts.pending}</span>
        </button>
        <button
          className={`tab in-progress ${filter === "in_progress" ? "active" : ""}`}
          onClick={() => setFilter("in_progress")}
        >
          In Progress <span className="tab-count">{counts.in_progress}</span>
        </button>
        <button
          className={`tab completed ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed <span className="tab-count">{counts.completed}</span>
        </button>
      </nav>

      {/* Order list */}
      <div className="orders-list">
        {loading && (
          <div className="orders-empty">Loading orders…</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="orders-empty">
            {filter === "all" ? "No orders yet." : `No ${STATUS_LABEL[filter as Status].toLowerCase()} orders.`}
          </div>
        )}

        {filtered.map((order) => {
          const next = NEXT_STATUS[order.status];
          const itemCount = order.payload?.items?.length ?? 0;

          return (
            <div key={order.id} className={`order-card ${order.status}`}>
              {/* Card header */}
              <div className="order-card-top">
                <div className="order-id">#{order.id.slice(0, 8)}</div>
                <span className={`status-badge ${order.status}`}>
                  {STATUS_LABEL[order.status]}
                </span>
              </div>

              <div className="order-time">{timeAgo(order.created_at)} · {itemCount} item{itemCount !== 1 ? "s" : ""}</div>

              {/* Items */}
              <ul className="order-items">
                {(order.payload?.items ?? []).map((item, i) => (
                  <li key={i} className="order-item">
                    <span className="order-item-type">
                      {isDrink(item) ? (
                        <IconCoffee size={14} />
                      ) : isPastry(item) ? (
                        <IconPastry size={14} />
                      ) : (
                        <span>·</span>
                      )}
                    </span>
                    <span className="order-item-label">{itemLabel(item)}</span>
                  </li>
                ))}
              </ul>

              {/* Action button */}
              {next && (
                <button
                  className={`order-action ${next}`}
                  onClick={() => updateStatus(order.id, next)}
                  disabled={updating === order.id}
                >
                  {updating === order.id ? "Updating…" : STATUS_ACTION[order.status]}
                </button>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
