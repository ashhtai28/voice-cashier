"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMenu, IconMic, IconOrders, IconDashboard } from "./Icons";

const NAV_ITEMS = [
  { href: "/", label: "Menu", Icon: IconMenu },
  { href: "/customer", label: "Order", Icon: IconMic },
  { href: "/orders", label: "Queue", Icon: IconOrders },
  { href: "/dashboard", label: "Dashboard", Icon: IconDashboard },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="global-nav">
      <Link href="/" className="nav-brand">
        NYC Coffee
      </Link>
      <div className="nav-links">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <item.Icon size={16} />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
