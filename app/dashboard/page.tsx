"use client";

import { useEffect, useState, useCallback } from "react";
import type { DashboardMetrics, OrderRecord } from "@/lib/metrics";
import { computeDashboardMetrics } from "@/lib/metrics";
import {
  IconRevenue,
  IconOrders,
  IconAvgOrder,
  IconItemsSold,
  IconCoffee,
  IconTea,
  IconPastry,
  IconHot,
  IconCold,
  IconWarning,
  IconBulb,
} from "@/app/Icons";
import "./dashboard.css";

type TimeRange = "today" | "all";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [range, setRange] = useState<TimeRange>("all");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to load");
      const orders: OrderRecord[] = await res.json();
      const m = computeDashboardMetrics(orders, range === "today");
      setMetrics(m);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    setLoading(true);
    fetchMetrics();
    const timer = setInterval(fetchMetrics, 30_000); // refresh every 30s
    return () => clearInterval(timer);
  }, [fetchMetrics]);

  if (loading && !metrics) {
    return (
      <div className="dash">
        <div className="dash-inner">
          <div className="dash-loading">Brewing your metrics...</div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="dash">
        <div className="dash-inner">
          <div className="dash-loading">Could not load dashboard data.</div>
        </div>
      </div>
    );
  }

  const hasData = metrics.totalOrders > 0;

  return (
    <div className="dash">
      <div className="dash-inner">
      {/* ── Header ── */}
      <header className="dash-header">
        <div className="dash-header-text">
          <h1>Spill the Beans</h1>
          <span className="dash-subtitle">
            {range === "today" ? "Today's Pulse" : "All-Time Overview"}
          </span>
        </div>
        <div className="dash-range-toggle">
          <button
            className={`range-btn ${range === "today" ? "active" : ""}`}
            onClick={() => setRange("today")}
          >
            Today
          </button>
          <button
            className={`range-btn ${range === "all" ? "active" : ""}`}
            onClick={() => setRange("all")}
          >
            All Time
          </button>
        </div>
      </header>

      {/* ── Top-line KPI Cards ── */}
      <section className="kpi-row">
        <KPICard
          label="Revenue"
          value={`$${metrics.totalRevenue.toFixed(2)}`}
          icon={<IconRevenue size={22} color="var(--sage)" />}
          accent="var(--sage)"
        />
        <KPICard
          label="Orders"
          value={metrics.totalOrders.toString()}
          icon={<IconOrders size={22} color="var(--accent)" />}
          accent="var(--accent)"
        />
        <KPICard
          label="Avg Order"
          value={`$${metrics.avgOrderValue.toFixed(2)}`}
          icon={<IconAvgOrder size={22} color="var(--toffee)" />}
          accent="var(--toffee)"
        />
        <KPICard
          label="Items Sold"
          value={metrics.totalItemsSold.toString()}
          icon={<IconItemsSold size={22} color="var(--latte)" />}
          accent="var(--latte)"
        />
      </section>

      {!hasData && (
        <div className="dash-empty">
          <p>No orders yet {range === "today" ? "today" : ""}. Once customers start ordering, your metrics will appear here.</p>
        </div>
      )}

      {hasData && (
        <>
          {/* ── Order Status ── */}
          <section className="dash-card">
            <h2 className="card-title">Order Status</h2>
            <div className="status-row">
              <StatusPill label="Pending" count={metrics.statusCounts.pending} color="var(--accent)" />
              <StatusPill label="Making" count={metrics.statusCounts.in_progress} color="var(--toffee)" />
              <StatusPill label="Done" count={metrics.statusCounts.completed} color="var(--sage)" />
            </div>
            {metrics.statusCounts.pending > 3 && (
              <p className="card-insight warning">
                <IconWarning size={14} /> {metrics.statusCounts.pending} orders waiting — might need extra hands.
              </p>
            )}
          </section>

          {/* ── Top Sellers ── */}
          <section className="dash-card">
            <h2 className="card-title">Top Sellers</h2>
            <p className="card-subtitle">By units sold</p>
            {metrics.topItems.length === 0 ? (
              <p className="card-empty">No items yet</p>
            ) : (
              <div className="rank-list">
                {metrics.topItems.map((item, i) => (
                  <RankBar
                    key={item.name}
                    rank={i + 1}
                    name={item.name}
                    value={item.count}
                    label={`${item.count} sold`}
                    maxValue={metrics.topItems[0].count}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Revenue Drivers ── */}
          <section className="dash-card">
            <h2 className="card-title">Revenue Drivers</h2>
            <p className="card-subtitle">By total revenue</p>
            {metrics.topByRevenue.length === 0 ? (
              <p className="card-empty">No items yet</p>
            ) : (
              <div className="rank-list">
                {metrics.topByRevenue.map((item, i) => (
                  <RankBar
                    key={item.name}
                    rank={i + 1}
                    name={item.name}
                    value={item.revenue}
                    label={`$${item.revenue.toFixed(2)}`}
                    maxValue={metrics.topByRevenue[0].revenue}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Category Mix ── */}
          <section className="dash-card">
            <h2 className="card-title">Category Mix</h2>
            <div className="category-bars">
              {metrics.categoryBreakdown.map((cat) => (
                <div key={cat.category} className="cat-row">
                  <span className="cat-icon">
                    {cat.category === "Coffee" ? (
                      <IconCoffee size={16} />
                    ) : cat.category === "Tea" ? (
                      <IconTea size={16} />
                    ) : (
                      <IconPastry size={16} />
                    )}
                  </span>
                  <span className="cat-name">{cat.category}</span>
                  <div className="cat-bar-track">
                    <div
                      className="cat-bar-fill"
                      style={{ width: `${Math.max(cat.pct, 4)}%` }}
                      data-category={cat.category.toLowerCase()}
                    />
                  </div>
                  <span className="cat-pct">{cat.pct}%</span>
                  <span className="cat-rev">${cat.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
            {metrics.categoryBreakdown.find((c) => c.category === "Pastry" && c.pct < 15) && (
              <p className="card-insight">
                <IconBulb size={14} /> Pastry sales are under 15% of items — try featuring them at the register.
              </p>
            )}
          </section>

          {/* ── Milk Preferences ── */}
          {metrics.milkBreakdown.length > 0 && (
            <section className="dash-card">
              <h2 className="card-title">Milk Preferences</h2>
              <p className="card-subtitle">% of drink orders</p>
              <div className="mod-grid">
                {metrics.milkBreakdown.map((m) => (
                  <ModChip key={m.name} name={m.name} pct={m.pct} count={m.count} />
                ))}
              </div>
              {metrics.milkBreakdown[0]?.name === "oat" && metrics.milkBreakdown[0]?.pct > 50 && (
                <p className="card-insight">
                  <IconBulb size={14} /> Over half your drinks use oat milk — make sure stock is healthy.
                </p>
              )}
            </section>
          )}

          {/* ── Hot vs Iced + Size ── */}
          <section className="dash-card two-col">
            <div>
              <h2 className="card-title">Temperature</h2>
              <div className="split-pills">
                {metrics.tempBreakdown.map((t) => (
                  <SplitPill
                    key={t.name}
                    label={t.name === "hot" ? "Hot" : "Iced"}
                    icon={t.name === "hot" ? <IconHot size={14} /> : <IconCold size={14} />}
                    pct={t.pct}
                  />
                ))}
              </div>
            </div>
            <div>
              <h2 className="card-title">Size</h2>
              <div className="split-pills">
                {metrics.sizeBreakdown.map((s) => (
                  <SplitPill
                    key={s.name}
                    label={s.name === "small" ? "S (12oz)" : "L (16oz)"}
                    pct={s.pct}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ── Popular Add-ons ── */}
          {metrics.popularAddOns.length > 0 && (
            <section className="dash-card">
              <h2 className="card-title">Add-On Popularity</h2>
              <p className="card-subtitle">% of drink orders</p>
              <div className="mod-grid">
                {metrics.popularAddOns.map((a) => (
                  <ModChip key={a.name} name={a.name} pct={a.pct} count={a.count} />
                ))}
              </div>
            </section>
          )}

          {/* ── Peak Hours ── */}
          {metrics.hourlyBreakdown.length > 0 && (
            <section className="dash-card">
              <h2 className="card-title">Orders by Hour</h2>
              {metrics.peakHour && (
                <p className="card-subtitle">
                  Peak: <strong>{metrics.peakHour.label}</strong> ({metrics.peakHour.orders} orders, ${metrics.peakHour.revenue.toFixed(2)})
                </p>
              )}
              <div className="hour-chart">
                {metrics.hourlyBreakdown.map((h) => {
                  const maxOrders = metrics.peakHour?.orders ?? 1;
                  const pct = Math.max((h.orders / maxOrders) * 100, 6);
                  return (
                    <div key={h.hour} className="hour-col">
                      <div className="hour-bar-wrap">
                        <div className="hour-bar" style={{ height: `${pct}%` }}>
                          <span className="hour-count">{h.orders}</span>
                        </div>
                      </div>
                      <span className="hour-label">{h.label}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Quick Insights ── */}
          <section className="dash-card insights-card">
            <h2 className="card-title">Quick Insights</h2>
            <ul className="insights-list">
              <li>
                Average <strong>{metrics.avgItemsPerOrder}</strong> items per order
              </li>
              {metrics.topItems[0] && (
                <li>
                  <strong className="capitalize">{metrics.topItems[0].name}</strong> is the most ordered item
                </li>
              )}
              {metrics.topByRevenue[0] && metrics.topByRevenue[0].name !== metrics.topItems[0]?.name && (
                <li>
                  <strong className="capitalize">{metrics.topByRevenue[0].name}</strong> brings in the most revenue — not the same as the most popular!
                </li>
              )}
              {metrics.tempBreakdown.length === 2 && (
                <li>
                  {metrics.tempBreakdown[0].pct > 65
                    ? `${metrics.tempBreakdown[0].name === "iced" ? "Iced" : "Hot"} drinks dominate at ${metrics.tempBreakdown[0].pct}% — typical for ${metrics.tempBreakdown[0].name === "iced" ? "warm" : "cold"} weather`
                    : `Hot/iced split is fairly even (${metrics.tempBreakdown.map((t) => `${t.pct}% ${t.name}`).join(", ")})`}
                </li>
              )}
              {metrics.sizeBreakdown.length === 2 && metrics.sizeBreakdown[0].name === "large" && metrics.sizeBreakdown[0].pct > 60 && (
                <li>
                  <strong>{metrics.sizeBreakdown[0].pct}%</strong> of drinks are large — customers prefer the bigger size
                </li>
              )}
            </ul>
          </section>
        </>
      )}

      {/* ── Footer ── */}
      <footer className="dash-footer">
        {lastUpdated && (
          <span className="dash-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
        <span className="dash-auto">Auto-refreshes every 30s</span>
      </footer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   Sub-components
   ═══════════════════════════════════ */

function KPICard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="kpi-card" style={{ borderTopColor: accent }}>
      <span className="kpi-icon">{icon}</span>
      <span className="kpi-value">{value}</span>
      <span className="kpi-label">{label}</span>
    </div>
  );
}

function StatusPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="status-pill" style={{ background: color }}>
      <span className="status-pill-count">{count}</span>
      <span className="status-pill-label">{label}</span>
    </div>
  );
}

function RankBar({
  rank,
  name,
  value,
  label,
  maxValue,
}: {
  rank: number;
  name: string;
  value: number;
  label: string;
  maxValue: number;
}) {
  const pct = maxValue === 0 ? 0 : Math.max((value / maxValue) * 100, 8);
  return (
    <div className="rank-row">
      <span className="rank-num">#{rank}</span>
      <span className="rank-name capitalize">{name}</span>
      <div className="rank-bar-track">
        <div className="rank-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="rank-label">{label}</span>
    </div>
  );
}

function ModChip({ name, pct, count }: { name: string; pct: number; count: number }) {
  return (
    <div className="mod-chip">
      <span className="mod-name capitalize">{name}</span>
      <span className="mod-pct">{pct}%</span>
      <span className="mod-count">{count} orders</span>
    </div>
  );
}

function SplitPill({ label, pct, icon }: { label: string; pct: number; icon?: React.ReactNode }) {
  return (
    <div className="split-pill">
      <span className="split-label">{icon} {label}</span>
      <div className="split-bar-track">
        <div className="split-bar-fill" style={{ width: `${Math.max(pct, 6)}%` }} />
      </div>
      <span className="split-pct">{pct}%</span>
    </div>
  );
}
