/* ═══════════════════════════════════════════
   Unified SVG Icon System — NYC Coffee
   
   Clean, minimal line icons using the app's
   warm brown palette. All icons share a 24×24
   viewBox and accept className + size props.
   ═══════════════════════════════════════════ */

import React from "react";

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

const defaults: Required<Pick<IconProps, "size" | "color">> = {
  size: 20,
  color: "currentColor",
};

function wrap(
  children: React.ReactNode,
  { size = defaults.size, className, color = defaults.color }: IconProps
) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* ── Navigation icons ── */

export function IconMenu(props: IconProps) {
  return wrap(
    <>
      {/* Coffee cup */}
      <path d="M5 8h12v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8z" />
      <path d="M17 10h1.5a2 2 0 0 1 0 4H17" />
      {/* Steam */}
      <path d="M8 5c0-1.5 1.5-1.5 1.5-3" strokeWidth="1.4" opacity="0.5" />
      <path d="M12 5c0-1.5 1.5-1.5 1.5-3" strokeWidth="1.4" opacity="0.5" />
    </>,
    props
  );
}

export function IconChat(props: IconProps) {
  return wrap(
    <>
      <path d="M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 0 1-4-.8L3 21l1.5-3.6C3.56 16.04 3 14.56 3 13c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      <circle cx="8.5" cy="13" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="13" r="0.8" fill="currentColor" stroke="none" />
    </>,
    props
  );
}

export function IconOrders(props: IconProps) {
  return wrap(
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </>,
    props
  );
}

export function IconDashboard(props: IconProps) {
  return wrap(
    <>
      <rect x="3" y="13" width="4" height="8" rx="1" />
      <rect x="10" y="8" width="4" height="13" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </>,
    props
  );
}

/* ── Dashboard KPI icons ── */

export function IconRevenue(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10" />
      <path d="M9 9.5a2.5 2 0 0 1 3-1.5c1.5.5 2 2 .5 3s-2.5 1.5-1 3a2.5 2 0 0 1-2.5 1.5" />
    </>,
    props
  );
}

export function IconAvgOrder(props: IconProps) {
  return wrap(
    <>
      <line x1="4" y1="20" x2="20" y2="4" />
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="16" r="3" />
    </>,
    props
  );
}

export function IconItemsSold(props: IconProps) {
  return wrap(
    <>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>,
    props
  );
}

/* ── Category icons (for dashboard + orders) ── */

export function IconCoffee(props: IconProps) {
  return wrap(
    <>
      <path d="M5 8h12v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8z" />
      <path d="M17 10h1.5a2 2 0 0 1 0 4H17" />
    </>,
    props
  );
}

export function IconTea(props: IconProps) {
  return wrap(
    <>
      <path d="M5 8h12v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8z" />
      <path d="M17 10h1.5a2 2 0 0 1 0 4H17" />
      {/* Tea leaf */}
      <path d="M10 4c1-2 3-2 4 0" strokeWidth="1.4" opacity="0.5" />
    </>,
    props
  );
}

export function IconPastry(props: IconProps) {
  return wrap(
    <>
      {/* Croissant shape */}
      <path d="M6 15c1-5 4-8 6-9 2 1 5 4 6 9" />
      <path d="M6 15c2 2 5 3 6 3s4-1 6-3" />
      <path d="M9 12c1.5-2 2.5-3 3-3.5" strokeWidth="1.2" opacity="0.4" />
      <path d="M15 12c-1.5-2-2.5-3-3-3.5" strokeWidth="1.2" opacity="0.4" />
    </>,
    props
  );
}

/* ── Voice / chat control icons ── */

export function IconMic(props: IconProps) {
  return wrap(
    <>
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <line x1="8" y1="21" x2="16" y2="21" />
    </>,
    props
  );
}

export function IconKeyboard(props: IconProps) {
  return wrap(
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="6" y1="9" x2="6" y2="9.01" strokeWidth="2" />
      <line x1="10" y1="9" x2="10" y2="9.01" strokeWidth="2" />
      <line x1="14" y1="9" x2="14" y2="9.01" strokeWidth="2" />
      <line x1="18" y1="9" x2="18" y2="9.01" strokeWidth="2" />
      <line x1="7" y1="15" x2="17" y2="15" />
    </>,
    props
  );
}

export function IconSpeaker(props: IconProps) {
  return wrap(
    <>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
      <path d="M15 9a4 4 0 0 1 0 6" />
      <path d="M18 6a8 8 0 0 1 0 12" />
    </>,
    props
  );
}

export function IconSpeakerOff(props: IconProps) {
  return wrap(
    <>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </>,
    props
  );
}

export function IconThinking(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="12" r="9" strokeDasharray="4 3" />
      <circle cx="12" cy="12" r="3" />
    </>,
    props
  );
}

export function IconSpeaking(props: IconProps) {
  return wrap(
    <>
      <path d="M3 12h2" />
      <path d="M7 8v8" />
      <path d="M11 5v14" />
      <path d="M15 8v8" />
      <path d="M19 10v4" />
    </>,
    props
  );
}

/* ── Temperature icons (dashboard) ── */

export function IconHot(props: IconProps) {
  return wrap(
    <>
      <path d="M8 14a5 5 0 1 0 8 0c0-3-4-6-4-10 0 4-4 7-4 10z" />
    </>,
    props
  );
}

export function IconCold(props: IconProps) {
  return wrap(
    <>
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="4" y1="7" x2="20" y2="17" />
      <line x1="20" y1="7" x2="4" y2="17" />
      <line x1="12" y1="2" x2="14" y2="5" strokeWidth="1.4" />
      <line x1="12" y1="2" x2="10" y2="5" strokeWidth="1.4" />
      <line x1="12" y1="22" x2="14" y2="19" strokeWidth="1.4" />
      <line x1="12" y1="22" x2="10" y2="19" strokeWidth="1.4" />
    </>,
    props
  );
}

/* ── Utility icons ── */

export function IconWarning(props: IconProps) {
  return wrap(
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" />
    </>,
    props
  );
}

export function IconBulb(props: IconProps) {
  return wrap(
    <>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
    </>,
    props
  );
}

export function IconArrowRight(props: IconProps) {
  return wrap(
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>,
    props
  );
}

export function IconStop(props: IconProps) {
  return wrap(
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />
    </>,
    props
  );
}
