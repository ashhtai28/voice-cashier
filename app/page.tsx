"use client";

import { useState, useCallback, useMemo } from "react";
import { IconArrowRight } from "./Icons";
import { itemPrice, itemLabel } from "@/lib/pricing";
import type { OrderItem, DrinkItem, PastryItem, DrinkName, Pastry, Size, Temperature, Milk } from "@/types/order";
import "./home.css";

/* ═══════════════════════════════════════════
   Hand-drawn SVG icons
   ═══════════════════════════════════════════ */

function LatteIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="drink-icon" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 22 C28 16, 32 12, 30 6" stroke="var(--latte)" strokeWidth="2.2" opacity="0.6" />
      <path d="M40 20 C38 14, 42 10, 40 4" stroke="var(--latte)" strokeWidth="2.2" opacity="0.6" />
      <path d="M50 22 C48 16, 52 12, 50 6" stroke="var(--latte)" strokeWidth="2.2" opacity="0.6" />
      <path d="M22 30 L22 62 C22 68 28 72 40 72 C52 72 58 68 58 62 L58 30" stroke="var(--espresso)" strokeWidth="2.5" fill="var(--cream)" />
      <path d="M32 38 C36 34, 44 34, 48 38" stroke="var(--latte)" strokeWidth="2" fill="none" />
      <path d="M35 42 C38 39, 42 39, 45 42" stroke="var(--latte)" strokeWidth="1.8" fill="none" />
      <circle cx="40" cy="46" r="2" fill="var(--latte)" />
      <path d="M58 36 C66 36, 68 46, 58 50" stroke="var(--espresso)" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

function CappuccinoIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="drink-icon" strokeLinecap="round" strokeLinejoin="round">
      <path d="M34 24 C32 18, 36 14, 34 8" stroke="var(--latte)" strokeWidth="2.2" opacity="0.6" />
      <path d="M46 24 C44 18, 48 14, 46 8" stroke="var(--latte)" strokeWidth="2.2" opacity="0.6" />
      <path d="M18 32 L24 64 C24 70 30 72 40 72 C50 72 56 70 56 64 L62 32" stroke="var(--espresso)" strokeWidth="2.5" fill="var(--cream)" />
      <path d="M18 32 C18 24, 30 20, 40 20 C50 20, 62 24, 62 32" stroke="var(--espresso)" strokeWidth="2.5" fill="var(--oat)" />
      <path d="M28 28 C32 25, 36 27, 40 26 C44 25, 48 27, 52 28" stroke="var(--latte)" strokeWidth="1.5" fill="none" />
      <path d="M62 38 C70 38, 72 48, 62 52" stroke="var(--espresso)" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

function AmericanoIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="drink-icon" strokeLinecap="round" strokeLinejoin="round">
      <path d="M36 18 C34 12, 38 8, 36 2" stroke="var(--latte)" strokeWidth="2.2" opacity="0.6" />
      <path d="M46 16 C44 10, 48 6, 46 2" stroke="var(--latte)" strokeWidth="2.2" opacity="0.6" />
      <path d="M26 24 L28 64 C28 70 32 72 40 72 C48 72 52 70 52 64 L54 24" stroke="var(--espresso)" strokeWidth="2.5" fill="var(--cream)" />
      <rect x="28" y="34" width="24" height="32" rx="3" fill="var(--dark-roast)" opacity="0.25" />
      <path d="M24 24 L56 24" stroke="var(--espresso)" strokeWidth="2.8" />
      <path d="M54 32 C62 32, 64 44, 54 48" stroke="var(--espresso)" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

function ColdBrewIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="drink-icon" strokeLinecap="round" strokeLinejoin="round">
      <path d="M28 12 L32 68 C32 74 36 76 40 76 C44 76 48 74 48 68 L52 12" stroke="var(--espresso)" strokeWidth="2.5" fill="var(--cream)" />
      <rect x="32" y="28" width="16" height="38" rx="2" fill="var(--dark-roast)" opacity="0.3" />
      <rect x="34" y="32" width="6" height="5" rx="1.5" fill="var(--latte)" opacity="0.5" transform="rotate(-5 37 34)" />
      <rect x="40" y="40" width="5" height="4" rx="1.5" fill="var(--latte)" opacity="0.5" transform="rotate(8 42 42)" />
      <rect x="35" y="48" width="7" height="5" rx="1.5" fill="var(--latte)" opacity="0.5" />
      <path d="M26 12 L54 12" stroke="var(--espresso)" strokeWidth="2.8" />
      <line x1="40" y1="2" x2="40" y2="28" stroke="var(--espresso)" strokeWidth="2.5" />
    </svg>
  );
}

function MochaIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="drink-icon" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 22 C28 16, 32 12, 30 6" stroke="var(--latte)" strokeWidth="2.2" opacity="0.6" />
      <path d="M42 20 C40 14, 44 10, 42 4" stroke="var(--latte)" strokeWidth="2.2" opacity="0.6" />
      <path d="M22 30 L22 62 C22 68 28 72 40 72 C52 72 58 68 58 62 L58 30" stroke="var(--espresso)" strokeWidth="2.5" fill="var(--cream)" />
      <rect x="24" y="42" width="32" height="24" rx="3" fill="var(--dark-roast)" opacity="0.3" />
      <path d="M30 36 C34 32, 38 38, 42 34 C46 30, 50 36, 50 36" stroke="var(--accent)" strokeWidth="2" fill="none" />
      <path d="M58 36 C66 36, 68 46, 58 50" stroke="var(--espresso)" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

function FrappuccinoIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="drink-icon" strokeLinecap="round" strokeLinejoin="round">
      <path d="M26 26 C26 16, 54 16, 54 26" stroke="var(--espresso)" strokeWidth="2.5" fill="var(--oat)" />
      <line x1="40" y1="6" x2="40" y2="42" stroke="var(--espresso)" strokeWidth="2.8" />
      <path d="M24 26 L30 70 C30 74 34 76 40 76 C46 76 50 74 50 70 L56 26" stroke="var(--espresso)" strokeWidth="2.5" fill="var(--cream)" />
      <rect x="32" y="36" width="8" height="6" rx="1.5" fill="var(--latte)" opacity="0.5" transform="rotate(-5 36 39)" />
      <rect x="40" y="42" width="7" height="5" rx="1.5" fill="var(--latte)" opacity="0.5" transform="rotate(8 43 44)" />
      <rect x="34" y="50" width="9" height="6" rx="1.5" fill="var(--latte)" opacity="0.5" />
      <path d="M33 24 C35 20, 39 22, 40 18 C41 22, 45 20, 47 24" stroke="var(--espresso)" strokeWidth="1.5" fill="var(--foam)" />
      <path d="M24 26 L56 26" stroke="var(--espresso)" strokeWidth="2.5" />
    </svg>
  );
}

function TeaCupIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="drink-icon" strokeLinecap="round" strokeLinejoin="round">
      <path d="M32 22 C30 16, 34 12, 32 8" stroke="var(--sage)" strokeWidth="2" opacity="0.5" />
      <path d="M44 20 C42 14, 46 10, 44 6" stroke="var(--sage)" strokeWidth="2" opacity="0.5" />
      <path d="M20 30 L20 56 C20 66 28 70 40 70 C52 70 60 66 60 56 L60 30" stroke="var(--espresso)" strokeWidth="2.5" fill="var(--cream)" />
      <path d="M20 30 L60 30" stroke="var(--espresso)" strokeWidth="2.5" />
      <path d="M28 40 Q34 36 40 40 Q46 44 52 40" stroke="var(--sage)" strokeWidth="1.8" fill="none" opacity="0.6" />
      <path d="M60 36 C68 36, 70 48, 60 52" stroke="var(--espresso)" strokeWidth="2.5" fill="none" />
      <ellipse cx="40" cy="30" rx="20" ry="3" fill="var(--sage)" opacity="0.15" />
    </svg>
  );
}

function MatchaIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="drink-icon" strokeLinecap="round" strokeLinejoin="round">
      <path d="M34 24 C32 18, 36 14, 34 8" stroke="var(--sage)" strokeWidth="2.2" opacity="0.5" />
      <path d="M46 22 C44 16, 48 12, 46 6" stroke="var(--sage)" strokeWidth="2.2" opacity="0.5" />
      <path d="M22 30 L22 62 C22 68 28 72 40 72 C52 72 58 68 58 62 L58 30" stroke="var(--espresso)" strokeWidth="2.5" fill="var(--cream)" />
      <rect x="24" y="36" width="32" height="30" rx="3" fill="var(--sage)" opacity="0.2" />
      <path d="M30 42 C34 38, 38 44, 42 40 C46 36, 50 42, 50 42" stroke="var(--sage)" strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M58 36 C66 36, 68 46, 58 50" stroke="var(--espresso)" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

function CroissantIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="drink-icon" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 50 C20 30, 34 20, 40 18 C46 20, 60 30, 64 50" stroke="var(--espresso)" strokeWidth="2.5" fill="var(--peach)" />
      <path d="M16 50 C20 56, 28 60, 40 60 C52 60, 60 56, 64 50" stroke="var(--espresso)" strokeWidth="2.5" fill="var(--peach)" />
      <path d="M24 44 C30 36, 36 30, 40 28" stroke="var(--accent)" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M56 44 C50 36, 44 30, 40 28" stroke="var(--accent)" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M32 48 C36 44, 44 44, 48 48" stroke="var(--accent)" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}

function CookieIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="drink-icon" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="40" cy="42" r="22" stroke="var(--espresso)" strokeWidth="2.5" fill="var(--peach)" />
      <circle cx="32" cy="36" r="3" fill="var(--dark-roast)" opacity="0.6" />
      <circle cx="44" cy="32" r="2.5" fill="var(--dark-roast)" opacity="0.6" />
      <circle cx="48" cy="46" r="3" fill="var(--dark-roast)" opacity="0.6" />
      <circle cx="36" cy="50" r="2.5" fill="var(--dark-roast)" opacity="0.6" />
      <circle cx="42" cy="42" r="2" fill="var(--dark-roast)" opacity="0.4" />
    </svg>
  );
}

function BreadIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="drink-icon" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 38 C18 26, 30 20, 40 20 C50 20, 62 26, 62 38 L62 58 C62 62 52 66 40 66 C28 66 18 62 18 58 Z" stroke="var(--espresso)" strokeWidth="2.5" fill="var(--peach)" />
      <path d="M28 34 L28 58" stroke="var(--accent)" strokeWidth="1.5" opacity="0.4" />
      <path d="M40 30 L40 60" stroke="var(--accent)" strokeWidth="1.5" opacity="0.4" />
      <path d="M52 34 L52 58" stroke="var(--accent)" strokeWidth="1.5" opacity="0.4" />
      <path d="M18 38 C28 42, 52 42, 62 38" stroke="var(--accent)" strokeWidth="1.5" fill="none" opacity="0.3" />
    </svg>
  );
}

/* ── Latte art swirl (top-down cup view) ── */

function LatteArtSwirl({ className = "", size = 120 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={`latte-swirl ${className}`} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Saucer */}
      <ellipse cx="60" cy="62" rx="58" ry="52" fill="var(--oat)" opacity="0.3" />
      {/* Cup rim */}
      <ellipse cx="60" cy="60" rx="48" ry="44" fill="var(--dark-roast)" stroke="var(--espresso)" strokeWidth="2" />
      {/* Coffee surface */}
      <ellipse cx="60" cy="60" rx="42" ry="38" fill="var(--hazelnut)" />
      {/* Latte art swirl — concentric rings */}
      <ellipse cx="60" cy="58" rx="32" ry="26" fill="none" stroke="var(--cream)" strokeWidth="2.5" opacity="0.85" />
      <ellipse cx="60" cy="56" rx="22" ry="18" fill="none" stroke="var(--cream)" strokeWidth="2.2" opacity="0.75" />
      <ellipse cx="60" cy="54" rx="13" ry="10" fill="none" stroke="var(--cream)" strokeWidth="2" opacity="0.65" />
      {/* Heart center */}
      <path d="M55 50 C55 44, 60 42, 60 48 C60 42, 65 44, 65 50 C65 55, 60 60, 60 60 C60 60, 55 55, 55 50Z" fill="var(--cream)" opacity="0.9" />
      {/* Drip line from heart */}
      <path d="M60 60 C60 64, 59 70, 60 76" stroke="var(--cream)" strokeWidth="1.8" opacity="0.5" />
    </svg>
  );
}

function SwirlDivider() {
  return (
    <div className="swirl-divider">
      <svg viewBox="0 0 600 40" preserveAspectRatio="none" className="swirl-line">
        {/* Flowing spiral line */}
        <path d="M0 20 C30 8, 60 32, 90 20 C120 8, 150 32, 180 20 C210 8, 240 32, 270 20 C300 8, 330 32, 360 20 C390 8, 420 32, 450 20 C480 8, 510 32, 540 20 C570 8, 600 32, 600 20" stroke="var(--latte)" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Swirl accent circles at peaks */}
        <circle cx="90" cy="18" r="4" fill="none" stroke="var(--toffee)" strokeWidth="1.2" opacity="0.5" />
        <circle cx="270" cy="18" r="3" fill="none" stroke="var(--toffee)" strokeWidth="1.2" opacity="0.4" />
        <circle cx="450" cy="18" r="4" fill="none" stroke="var(--toffee)" strokeWidth="1.2" opacity="0.5" />
      </svg>
    </div>
  );
}

function SwirlCorner({ position }: { position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const flip = position.includes("right") ? "scaleX(-1)" : "none";
  const flipY = position.includes("bottom") ? "scaleY(-1)" : "none";
  return (
    <svg viewBox="0 0 80 80" className={`swirl-corner swirl-corner-${position}`} style={{ transform: `${flip} ${flipY}` }} fill="none" strokeLinecap="round">
      <path d="M10 70 C10 40, 20 20, 50 10" stroke="var(--latte)" strokeWidth="2" opacity="0.3" />
      <path d="M10 70 C10 50, 25 30, 45 20" stroke="var(--toffee)" strokeWidth="1.5" opacity="0.2" />
      <circle cx="50" cy="10" r="5" fill="none" stroke="var(--latte)" strokeWidth="1.5" opacity="0.25" />
      <circle cx="50" cy="10" r="2" fill="var(--latte)" opacity="0.15" />
    </svg>
  );
}

/* ── Squiggly dividers ── */

function Squiggle({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 600 30" className="squiggle" preserveAspectRatio="none" style={flip ? { transform: "scaleY(-1)" } : undefined}>
      <path d="M0 15 C50 5, 100 25, 150 15 C200 5, 250 25, 300 15 C350 5, 400 25, 450 15 C500 5, 550 25, 600 15" stroke="var(--latte)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SquiggleDouble() {
  return (
    <svg viewBox="0 0 600 40" className="squiggle-double" preserveAspectRatio="none">
      <path d="M0 14 C40 4, 80 24, 120 14 C160 4, 200 24, 240 14 C280 4, 320 24, 360 14 C400 4, 440 24, 480 14 C520 4, 560 24, 600 14" stroke="var(--oat)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M0 26 C40 16, 80 36, 120 26 C160 16, 200 36, 240 26 C280 16, 320 36, 360 26 C400 16, 440 36, 480 26 C520 16, 560 36, 600 26" stroke="var(--latte)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Menu data
   ═══════════════════════════════════════════ */

interface MenuItem {
  id: string;
  name: string;
  icon: () => React.JSX.Element;
  small: number;
  large: number;
  tempNote?: string;
}

interface PastryMenuItem {
  id: string;
  name: string;
  icon: () => React.JSX.Element;
  price: number;
}

const COFFEES: MenuItem[] = [
  { id: "americano", name: "Americano", icon: AmericanoIcon, small: 3.00, large: 4.00, tempNote: "Hot / Iced" },
  { id: "latte", name: "Latte", icon: LatteIcon, small: 4.00, large: 5.00, tempNote: "Hot / Iced" },
  { id: "cold_brew", name: "Cold Brew", icon: ColdBrewIcon, small: 4.00, large: 5.00, tempNote: "Iced only" },
  { id: "mocha", name: "Mocha", icon: MochaIcon, small: 4.50, large: 5.50, tempNote: "Hot / Iced" },
  { id: "frappuccino", name: "Coffee Frappuccino", icon: FrappuccinoIcon, small: 5.50, large: 6.00, tempNote: "Iced only" },
];

const TEAS: MenuItem[] = [
  { id: "black_tea", name: "Black Tea", icon: TeaCupIcon, small: 3.00, large: 3.75, tempNote: "Hot / Iced" },
  { id: "jasmine_tea", name: "Jasmine Tea", icon: TeaCupIcon, small: 3.00, large: 3.75, tempNote: "Hot / Iced" },
  { id: "lemon_green_tea", name: "Lemon Green Tea", icon: TeaCupIcon, small: 3.50, large: 4.25, tempNote: "Hot / Iced" },
  { id: "matcha_latte", name: "Matcha Latte", icon: MatchaIcon, small: 4.50, large: 5.25, tempNote: "Hot / Iced" },
];

const PASTRIES: PastryMenuItem[] = [
  { id: "plain_croissant", name: "Plain Croissant", icon: CroissantIcon, price: 3.50 },
  { id: "chocolate_croissant", name: "Chocolate Croissant", icon: CroissantIcon, price: 4.00 },
  { id: "chocolate_chip_cookie", name: "Choc Chip Cookie", icon: CookieIcon, price: 2.50 },
  { id: "banana_bread", name: "Banana Bread", icon: BreadIcon, price: 3.00 },
];

const ADDONS = [
  { label: "Whole Milk", price: "free" },
  { label: "Skim Milk", price: "free" },
  { label: "Oat Milk", price: "+$0.50" },
  { label: "Almond Milk", price: "+$0.75" },
  { label: "Extra Espresso Shot", price: "+$1.50" },
  { label: "Extra Matcha Shot", price: "+$1.50" },
  { label: "Caramel Syrup", price: "+$0.50" },
  { label: "Hazelnut Syrup", price: "+$0.50" },
];

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */

const MILK_OPTIONS: { value: Milk; label: string; note: string }[] = [
  { value: "whole", label: "Whole", note: "" },
  { value: "skim", label: "Skim", note: "" },
  { value: "oat", label: "Oat", note: "+$0.50" },
  { value: "almond", label: "Almond", note: "+$0.75" },
];

export default function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  /* ── Drink customization modal ── */
  const [selectedDrink, setSelectedDrink] = useState<MenuItem | null>(null);
  const [modalSize, setModalSize] = useState<Size>("small");
  const [modalTemp, setModalTemp] = useState<Temperature>("hot");
  const [modalMilk, setModalMilk] = useState<Milk | null>(null);
  const [modalQty, setModalQty] = useState(1);

  const openDrinkModal = useCallback((d: MenuItem) => {
    setSelectedDrink(d);
    setModalSize("small");
    setModalTemp(d.tempNote === "Iced only" ? "iced" : "hot");
    setModalMilk(null);
    setModalQty(1);
  }, []);

  const confirmAddToCart = useCallback(() => {
    if (!selectedDrink) return;
    const item: DrinkItem = {
      type: "drink",
      name: selectedDrink.id as DrinkName,
      size: modalSize,
      temperature: modalTemp,
      milk: modalMilk,
      sweetness: null,
      iceLevel: null,
      addOns: [],
    };
    const items = Array.from({ length: modalQty }, () => ({ ...item }));
    setCartItems((prev) => [...prev, ...items]);
    setSelectedDrink(null);
  }, [selectedDrink, modalSize, modalTemp, modalMilk, modalQty]);

  const modalPrice = selectedDrink
    ? itemPrice({
        type: "drink",
        name: selectedDrink.id as DrinkName,
        size: modalSize,
        temperature: modalTemp,
        milk: modalMilk,
        sweetness: null,
        iceLevel: null,
        addOns: [],
      })
    : 0;

  /* ── Pastry add (increment if exists, max 20) ── */
  const addPastryToCart = useCallback((p: PastryMenuItem) => {
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (it) => it.type === "pastry" && (it as PastryItem).name === p.id
      );
      if (idx >= 0) {
        const current = (prev[idx] as PastryItem).quantity;
        if (current >= 20) return prev;
        const updated = [...prev];
        updated[idx] = {
          ...(updated[idx] as PastryItem),
          quantity: current + 1,
        };
        return updated;
      }
      return [
        ...prev,
        { type: "pastry", name: p.id as Pastry, quantity: 1 } as PastryItem,
      ];
    });
    setDrawerOpen(true);
  }, []);

  const updatePastryQty = useCallback((index: number, delta: number) => {
    setCartItems((prev) => {
      const item = prev[index];
      if (item?.type !== "pastry") return prev;
      const pastry = item as PastryItem;
      const newQty = pastry.quantity + delta;
      if (newQty <= 0) return prev.filter((_, i) => i !== index);
      if (newQty > 20) return prev;
      const updated = [...prev];
      updated[index] = { ...pastry, quantity: newQty };
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setOrderPlaced(false);
    setOrderId(null);
  }, []);

  /* ── Group identical items for display ── */
  interface CartGroup {
    item: OrderItem;
    qty: number;
    indices: number[];
    unitPrice: number;
    lineTotal: number;
  }

  const cartGroups: CartGroup[] = useMemo(() => {
    const groups: CartGroup[] = [];
    const drinkKeyFn = (d: DrinkItem) =>
      `${d.name}|${d.size}|${d.temperature}|${d.milk}|${d.sweetness}|${d.iceLevel}|${(d.addOns || []).sort().join(",")}`;

    cartItems.forEach((item, i) => {
      if (item.type === "pastry") {
        // Pastries already carry their own quantity
        groups.push({
          item,
          qty: (item as PastryItem).quantity,
          indices: [i],
          unitPrice: itemPrice({ ...item, quantity: 1 } as PastryItem),
          lineTotal: itemPrice(item),
        });
      } else {
        const key = drinkKeyFn(item as DrinkItem);
        const existing = groups.find(
          (g) => g.item.type === "drink" && drinkKeyFn(g.item as DrinkItem) === key
        );
        if (existing) {
          existing.qty += 1;
          existing.indices.push(i);
          existing.lineTotal += itemPrice(item);
        } else {
          const up = itemPrice(item);
          groups.push({ item, qty: 1, indices: [i], unitPrice: up, lineTotal: up });
        }
      }
    });
    return groups;
  }, [cartItems]);

  const incrementGroup = useCallback((group: CartGroup) => {
    if (group.qty >= 20) return;
    if (group.item.type === "pastry") {
      updatePastryQty(group.indices[0], 1);
    } else {
      // Add another copy of the same drink
      setCartItems((prev) => [...prev, { ...group.item }]);
    }
  }, [updatePastryQty]);

  const decrementGroup = useCallback((group: CartGroup) => {
    if (group.item.type === "pastry") {
      updatePastryQty(group.indices[0], -1);
    } else {
      // Remove the last index in this group
      const idxToRemove = group.indices[group.indices.length - 1];
      setCartItems((prev) => prev.filter((_, i) => i !== idxToRemove));
    }
  }, [updatePastryQty]);

  const removeGroup = useCallback((group: CartGroup) => {
    const toRemove = new Set(group.indices);
    setCartItems((prev) => prev.filter((_, i) => !toRemove.has(i)));
  }, []);

  const cartCount = cartGroups.reduce((s, g) => s + g.qty, 0);
  const cartTotal = cartGroups.reduce((s, g) => s + g.lineTotal, 0);

  /* ── Place order ── */
  const placeOrder = useCallback(async () => {
    if (cartItems.length === 0) return;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: { items: cartItems } }),
      });
      if (res.ok) {
        const order = await res.json();
        setOrderId(order.id);
      }
    } catch { /* ignore */ }
    setOrderPlaced(true);
  }, [cartItems]);

  return (
    <div className={`landing ${drawerOpen ? "drawer-open" : ""}`}>
      {/* ══ Hero ══ */}
      <section className="hero">
        <div className="hero-swirls">
          <SwirlCorner position="top-left" />
          <SwirlCorner position="top-right" />
          <SwirlCorner position="bottom-left" />
          <SwirlCorner position="bottom-right" />
        </div>
        <LatteArtSwirl className="hero-latte-art" size={100} />
        <span className="hero-badge">NYC Coffee</span>
        <h1>Good coffee,<br /> <span className="wiggle">zero wait</span></h1>
        <p className="hero-sub">Order with your voice or text. Our AI barista takes your order in seconds.</p>
        <button onClick={() => setDrawerOpen(true)} className="hero-cta">Start Ordering <IconArrowRight size={16} /></button>
      </section>

      <div className="menu-column">
      <Squiggle />

      {/* ══ Coffee ══ */}
      <section className="menu-section">
        <div className="section-header">
          <LatteArtSwirl className="section-swirl" size={48} />
          <h2 className="section-title">Coffee</h2>
          <p className="section-sub">Sizes: Small 12oz · Large 16oz</p>
        </div>
        <div className="drink-grid">
          {COFFEES.map((d) => {
            const Icon = d.icon;
            return (
              <button key={d.id} className="drink-card" onClick={() => openDrinkModal(d)}>
                <Icon />
                <div className="drink-name">{d.name}</div>
                <div className="drink-temp">{d.tempNote}</div>
                <div className="drink-price">${d.small.toFixed(2)} / ${d.large.toFixed(2)}</div>
              </button>
            );
          })}
        </div>

        <SwirlDivider />

        {/* ══ Tea ══ */}
        <div className="section-header">
          <LatteArtSwirl className="section-swirl" size={48} />
          <h2 className="section-title">Tea</h2>
          <p className="section-sub">Sizes: Small 12oz · Large 16oz</p>
        </div>
        <div className="drink-grid">
          {TEAS.map((d) => {
            const Icon = d.icon;
            return (
              <button key={d.id} className="drink-card" onClick={() => openDrinkModal(d)}>
                <Icon />
                <div className="drink-name">{d.name}</div>
                <div className="drink-temp">{d.tempNote}</div>
                <div className="drink-price">${d.small.toFixed(2)} / ${d.large.toFixed(2)}</div>
              </button>
            );
          })}
        </div>

        <SwirlDivider />

        {/* ══ Pastry ══ */}
        <div className="section-header">
          <h2 className="section-title">Pastry</h2>
          <p className="section-sub">Tap to add to cart</p>
        </div>
        <div className="drink-grid">
          {PASTRIES.map((p) => {
            const Icon = p.icon;
            return (
              <button key={p.id} className="drink-card" onClick={() => addPastryToCart(p)}>
                <Icon />
                <div className="drink-name">{p.name}</div>
                <div className="drink-price">${p.price.toFixed(2)}</div>
              </button>
            );
          })}
        </div>

        <SwirlDivider />

        {/* ══ Add-Ons & Modifiers ══ */}
        <h2 className="section-title">Add-Ons</h2>
        <p className="section-sub">Customize during your order</p>
        <div className="addon-grid">
          {ADDONS.map((a) => (
            <div key={a.label} className="addon-row">
              <span>{a.label}</span>
              <span className="addon-price">{a.price}</span>
            </div>
          ))}
        </div>

        <div className="modifier-tags">
          <div className="options-group">
            <div className="options-group-title">Sweetness</div>
            <div className="tag-row">
              <span className="tag tan">No Sugar</span>
              <span className="tag tan">Less Sugar</span>
              <span className="tag tan">Regular</span>
              <span className="tag tan">Extra Sugar</span>
            </div>
          </div>
          <div className="options-group">
            <div className="options-group-title">Ice Level</div>
            <div className="tag-row">
              <span className="tag cool">No Ice</span>
              <span className="tag cool">Less Ice</span>
              <span className="tag cool">Regular</span>
              <span className="tag cool">Extra Ice</span>
            </div>
          </div>
        </div>
      </section>

      <Squiggle flip />
      </div>

      {/* ══ Drink Customization Modal ══ */}
      {selectedDrink && (
        <div className="modal-backdrop" onClick={() => setSelectedDrink(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDrink(null)}>×</button>
            <h2 className="modal-title">{selectedDrink.name}</h2>

            <div className="modal-group">
              <label>Size</label>
              <div className="size-picker">
                <button className={`size-btn ${modalSize === "small" ? "active" : ""}`} onClick={() => setModalSize("small")}>
                  <span className="size-label">Small</span>
                  <span className="size-oz">12 oz</span>
                  <span className="size-price">${selectedDrink.small.toFixed(2)}</span>
                </button>
                <button className={`size-btn ${modalSize === "large" ? "active" : ""}`} onClick={() => setModalSize("large")}>
                  <span className="size-label">Large</span>
                  <span className="size-oz">16 oz</span>
                  <span className="size-price">${selectedDrink.large.toFixed(2)}</span>
                </button>
              </div>
            </div>

            <div className="modal-group">
              <label>Temperature</label>
              <div className="modal-options">
                {selectedDrink.tempNote !== "Iced only" && (
                  <button className={`opt-btn ${modalTemp === "hot" ? "active" : ""}`} onClick={() => setModalTemp("hot")}>Hot</button>
                )}
                <button className={`opt-btn ${modalTemp === "iced" ? "active" : ""}`} onClick={() => setModalTemp("iced")}>Iced</button>
              </div>
            </div>

            <div className="modal-group">
              <label>Milk</label>
              <div className="modal-options">
                {MILK_OPTIONS.map((m) => (
                  <button
                    key={m.value}
                    className={`opt-btn ${modalMilk === m.value ? "active" : ""}`}
                    onClick={() => setModalMilk(modalMilk === m.value ? null : m.value)}
                  >
                    {m.label}{m.note && ` ${m.note}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-qty">
              <button className="qty-btn" onClick={() => setModalQty((q) => Math.max(1, q - 1))} disabled={modalQty <= 1}>−</button>
              <span className="qty-value">{modalQty}</span>
              <button className="qty-btn" onClick={() => setModalQty((q) => Math.min(20, q + 1))} disabled={modalQty >= 20}>+</button>
            </div>
            <div className="modal-price">${(modalPrice * modalQty).toFixed(2)}</div>
            <button className="add-btn" onClick={confirmAddToCart}>
              Add {modalQty > 1 ? `${modalQty} ` : ""}to Cart · ${(modalPrice * modalQty).toFixed(2)}
            </button>
          </div>
        </div>
      )}

      {/* ══ Cart Drawer ══ */}
      {drawerOpen && <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />}
      <div className={`chat-drawer ${drawerOpen ? "open" : ""}`}>
        <button className="drawer-tab" onClick={() => setDrawerOpen((v) => !v)}>
          <span className="drawer-pill" />
          {drawerOpen ? (
            <span>← Back to Menu</span>
          ) : cartCount > 0 ? (
            <span className="drawer-tab-summary">
              <span className="drawer-tab-count">{cartCount}</span>
              <span>Your Cart · ${cartTotal.toFixed(2)}</span>
            </span>
          ) : (
            <span>Tap a drink to start</span>
          )}
        </button>
        <div className="drawer-body">
          {orderPlaced ? (
            <div className="cart-confirmation">
              <h2>Order Placed</h2>
              {orderId && <p className="cart-order-id">Order #{orderId.slice(0, 8)}</p>}
              {!orderId && <p className="cart-order-error">Could not submit — please show your cart to a barista.</p>}
              <p className="cart-order-total">${cartTotal.toFixed(2)}</p>
              <button className="add-btn" onClick={clearCart}>New Order</button>
            </div>
          ) : cartItems.length > 0 ? (
            <div className="cart-panel cart-panel-full">
              <div className="cart-header">
                <span className="cart-title">Your Cart</span>
                <button className="cart-clear" onClick={clearCart}>Clear All</button>
              </div>
              <ul className="cart-items">
                {cartGroups.map((group, gi) => (
                  <li key={gi} className="cart-item">
                    <span className="cart-qty-controls">
                      <button className="cart-qty-btn" onClick={() => decrementGroup(group)}>−</button>
                      <span className="cart-qty-value">{group.qty}</span>
                      <button className="cart-qty-btn" onClick={() => incrementGroup(group)} disabled={group.qty >= 20}>+</button>
                    </span>
                    <span className="cart-item-label">
                      {group.item.type === "pastry"
                        ? itemLabel({ ...(group.item as PastryItem), quantity: 1 })
                        : itemLabel(group.item)}
                    </span>
                    <span className="cart-item-right">
                      <span className="cart-item-price">${group.lineTotal.toFixed(2)}</span>
                      <button className="cart-item-remove" onClick={() => removeGroup(group)} title="Remove">×</button>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="cart-total">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="cart-actions">
                <button className="add-btn" onClick={placeOrder}>Place Order · ${cartTotal.toFixed(2)}</button>
              </div>
            </div>
          ) : (
            <div className="cart-empty">
              <p>Your cart is empty</p>
              <p className="cart-empty-hint">Tap a drink or pastry to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
