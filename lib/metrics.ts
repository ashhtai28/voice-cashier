/**
 * Owner dashboard metrics. Deterministic calculations from order data.
 *
 * Metric rationale (why these matter to a Spill the Beans owner):
 *
 * 1. REVENUE & ORDER COUNT — The absolute pulse. "How are we doing today?"
 * 2. AVERAGE ORDER VALUE (AOV) — Higher AOV = better upselling.
 *    If AOV is low, the owner might want to train baristas on add-on suggestions.
 * 3. POPULAR ITEMS — Inventory planning. If oat milk lattes outsell everything,
 *    make sure we never run out of oat milk.
 * 4. CATEGORY MIX (coffee vs tea vs pastry) — Tells the owner if the pastry
 *    case is pulling its weight or just decorative.
 * 5. ADD-ON & MODIFIER POPULARITY — Tracks upsell success and milk demand.
 *    Oat milk is expensive wholesale; if 70% of orders use it, margins shrink.
 * 6. ORDER STATUS BREAKDOWN — Operational health. Too many pending = bottleneck.
 * 7. PEAK HOURS — Staffing decisions. If noon is 3x busier than 3pm,
 *    that's when you need two baristas, not one.
 * 8. REVENUE BY ITEM — Which products actually drive the most dollars?
 *    A $5.50 frappuccino sold 20 times > a $3 tea sold 25 times.
 */

import type { OrderState, DrinkItem, PastryItem, OrderItem } from "@/types/order";
import { itemPrice } from "./pricing";

export interface OrderRecord {
  id: string;
  created_at: string;
  updated_at?: string;
  status: string;
  payload: OrderState;
}

// ── Ranking helpers ──

export interface RankedItem {
  name: string;
  count: number;
  revenue: number;
}

export interface HourlyBucket {
  hour: number;      // 0-23
  label: string;     // "8 AM", "12 PM", etc.
  orders: number;
  revenue: number;
}

export interface CategoryBreakdown {
  category: string;  // "Coffee" | "Tea" | "Pastry"
  count: number;
  revenue: number;
  pct: number;       // percentage of total item count
}

export interface ModifierStat {
  name: string;
  count: number;
  pct: number;       // percentage of drinks that use this modifier
}

export interface DashboardMetrics {
  // ── Top-line numbers ──
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  avgItemsPerOrder: number;
  totalItemsSold: number;

  // ── Status breakdown ──
  statusCounts: { pending: number; in_progress: number; completed: number };

  // ── Rankings ──
  topItems: RankedItem[];         // top 5 items by units sold
  topByRevenue: RankedItem[];     // top 5 items by revenue

  // ── Category mix ──
  categoryBreakdown: CategoryBreakdown[];

  // ── Modifier insights (% of drinks) ──
  milkBreakdown: ModifierStat[];
  popularAddOns: ModifierStat[];
  tempBreakdown: ModifierStat[];  // hot vs iced split
  sizeBreakdown: ModifierStat[];  // small vs large split

  // ── Hourly distribution ──
  hourlyBreakdown: HourlyBucket[];
  peakHour: HourlyBucket | null;
}

// ── Helpers ──

function isDrink(item: OrderItem): item is DrinkItem { return item.type === "drink"; }
function isPastry(item: OrderItem): item is PastryItem { return item.type === "pastry"; }

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function prettify(s: string): string {
  return s.replace(/_/g, " ");
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const COFFEE_SET = new Set(["americano", "latte", "cold_brew", "mocha", "frappuccino"]);
const TEA_SET = new Set(["black_tea", "jasmine_tea", "lemon_green_tea", "matcha_latte"]);

function categoryOf(item: OrderItem): string {
  if (isPastry(item)) return "Pastry";
  if (isDrink(item)) {
    if (COFFEE_SET.has(item.name)) return "Coffee";
    if (TEA_SET.has(item.name)) return "Tea";
  }
  return "Other";
}

// ── Main computation ──

export function computeDashboardMetrics(
  orders: OrderRecord[],
  /** Filter to "today" only. Pass false for all-time. Default true. */
  todayOnly = true
): DashboardMetrics {
  let filtered = orders;

  if (todayOnly) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    filtered = orders.filter((o) => new Date(o.created_at) >= todayStart);
  }

  const totalOrders = filtered.length;

  // ── Status counts ──
  const statusCounts = { pending: 0, in_progress: 0, completed: 0 };
  filtered.forEach((o) => {
    if (o.status === "pending") statusCounts.pending++;
    else if (o.status === "in_progress") statusCounts.in_progress++;
    else if (o.status === "completed") statusCounts.completed++;
  });

  // ── Item-level aggregation ──
  const itemCounts: Record<string, number> = {};
  const itemRevenue: Record<string, number> = {};
  const categoryCounts: Record<string, { count: number; revenue: number }> = {};
  const milkCounts: Record<string, number> = {};
  const addOnCounts: Record<string, number> = {};
  const tempCounts: Record<string, number> = {};
  const sizeCounts: Record<string, number> = {};

  let totalRevenue = 0;
  let totalItems = 0;
  let totalDrinks = 0;

  // Hourly buckets (0-23)
  const hourlyOrders: number[] = new Array(24).fill(0);
  const hourlyRevenue: number[] = new Array(24).fill(0);

  filtered.forEach((order) => {
    const items = order.payload?.items ?? [];
    const orderRev = items.reduce((sum, item) => sum + itemPrice(item), 0);
    totalRevenue += orderRev;

    // Hourly
    const hour = new Date(order.created_at).getHours();
    hourlyOrders[hour]++;
    hourlyRevenue[hour] += orderRev;

    items.forEach((item) => {
      const name = prettify(item.name);
      const price = itemPrice(item);
      const qty = isPastry(item) ? (item as PastryItem).quantity : 1;

      // Use actual quantity (not array length) so "3 croissants" = 3 items sold
      totalItems += qty;

      itemCounts[name] = (itemCounts[name] ?? 0) + qty;
      itemRevenue[name] = (itemRevenue[name] ?? 0) + price;

      const cat = categoryOf(item);
      if (!categoryCounts[cat]) categoryCounts[cat] = { count: 0, revenue: 0 };
      categoryCounts[cat].count += qty;
      categoryCounts[cat].revenue += price;

      if (isDrink(item)) {
        totalDrinks++;
        const d = item as DrinkItem;
        if (d.milk) milkCounts[prettify(d.milk)] = (milkCounts[prettify(d.milk)] ?? 0) + 1;
        if (d.temperature) tempCounts[d.temperature] = (tempCounts[d.temperature] ?? 0) + 1;
        if (d.size) sizeCounts[d.size] = (sizeCounts[d.size] ?? 0) + 1;
        d.addOns?.forEach((a) => {
          addOnCounts[prettify(a)] = (addOnCounts[prettify(a)] ?? 0) + 1;
        });
      }
    });
  });

  const avgOrderValue = totalOrders === 0 ? 0 : round2(totalRevenue / totalOrders);
  const avgItemsPerOrder = totalOrders === 0 ? 0 : Math.round((totalItems / totalOrders) * 10) / 10;

  // ── Rankings ──
  const topItems: RankedItem[] = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count, revenue: round2(itemRevenue[name] ?? 0) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topByRevenue: RankedItem[] = Object.entries(itemRevenue)
    .map(([name, revenue]) => ({ name, count: itemCounts[name] ?? 0, revenue: round2(revenue) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ── Category breakdown ──
  const totalQty = Object.values(categoryCounts).reduce((s, c) => s + c.count, 0);
  const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryCounts)
    .map(([category, { count, revenue }]) => ({
      category,
      count,
      revenue: round2(revenue),
      pct: totalQty === 0 ? 0 : Math.round((count / totalQty) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // ── Modifier breakdowns (% of drinks) ──
  const toModStats = (counts: Record<string, number>): ModifierStat[] =>
    Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        pct: totalDrinks === 0 ? 0 : Math.round((count / totalDrinks) * 100),
      }))
      .sort((a, b) => b.count - a.count);

  const milkBreakdown = toModStats(milkCounts);
  const popularAddOns = toModStats(addOnCounts);
  const tempBreakdown = toModStats(tempCounts);
  const sizeBreakdown = toModStats(sizeCounts);

  // ── Hourly breakdown (only non-zero hours) ──
  const hourlyBreakdown: HourlyBucket[] = [];
  for (let h = 0; h < 24; h++) {
    if (hourlyOrders[h] > 0 || !todayOnly) {
      // In today-only mode, only show hours that had orders
      // In all-time mode, show common business hours (6am-9pm)
      if (todayOnly && hourlyOrders[h] === 0) continue;
      if (!todayOnly && h < 6) continue;
      if (!todayOnly && h > 21) continue;
      hourlyBreakdown.push({
        hour: h,
        label: formatHour(h),
        orders: hourlyOrders[h],
        revenue: round2(hourlyRevenue[h]),
      });
    }
  }

  const peakHour = hourlyBreakdown.length === 0
    ? null
    : hourlyBreakdown.reduce((best, cur) => (cur.orders > best.orders ? cur : best));

  return {
    totalOrders,
    totalRevenue: round2(totalRevenue),
    avgOrderValue,
    avgItemsPerOrder,
    totalItemsSold: totalItems,
    statusCounts,
    topItems,
    topByRevenue,
    categoryBreakdown,
    milkBreakdown,
    popularAddOns,
    tempBreakdown,
    sizeBreakdown,
    hourlyBreakdown,
    peakHour,
  };
}
