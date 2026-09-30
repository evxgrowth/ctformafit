import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "square" as const,
  strokeLinejoin: "miter" as const,
  "aria-hidden": true,
  ...p,
});

export const Icon = {
  bell: (p: P) => (
    <svg {...base(p)}>
      <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z" />
      <path d="M10 21h4" />
      <path d="M3 8.5C3.6 6.2 4.8 4.4 6.5 3M21 8.5c-.6-2.3-1.8-4.1-3.5-5.5" />
    </svg>
  ),
  scan: (p: P) => (
    <svg {...base(p)}>
      <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" />
      <circle cx="12" cy="7.5" r="1.8" />
      <path d="M9 20v-5l-1.5-3.5L12 10l4.5 1.5L15 15v5" />
    </svg>
  ),
  bolt: (p: P) => (
    <svg {...base(p)}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  ),
  ice: (p: P) => (
    <svg {...base(p)}>
      <path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17" />
      <path d="m9.5 3.5 2.5 2 2.5-2M9.5 20.5l2.5-2 2.5 2M3.6 10.2l3.1-.6-1-3M18.4 13.8l-3.1.6 1 3M20.4 10.2l-3.1-.6 1-3M3.6 13.8l3.1.6-1 3" />
    </svg>
  ),
  run: (p: P) => (
    <svg {...base(p)}>
      <circle cx="15" cy="4" r="2" />
      <path d="m7 22 3.5-6.5L14 17v5M6 12l3-4 4 1 2.5 3.5H19M10.5 15.5 12 9" />
    </svg>
  ),
  wind: (p: P) => (
    <svg {...base(p)}>
      <path d="M3 8h11a3 3 0 1 0-3-3M3 16h14a3 3 0 1 1-3 3M3 12h17" />
    </svg>
  ),
  shower: (p: P) => (
    <svg {...base(p)}>
      <path d="M4 20V7a4 4 0 0 1 4-4h1a4 4 0 0 1 4 4" />
      <path d="M10 8h6M11 12v1M14 12v1M17 12v1M12.5 16v1M15.5 16v1M9.5 16v1" />
    </svg>
  ),
  pool: (p: P) => (
    <svg {...base(p)}>
      <rect x="2.5" y="6" width="19" height="12" />
      <circle cx="9" cy="12" r="1.3" />
      <circle cx="14" cy="10.5" r="1.3" />
      <path d="m15 20 6-17" />
    </svg>
  ),
  sofa: (p: P) => (
    <svg {...base(p)}>
      <path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
      <path d="M3 11h4v3h10v-3h4v6H3v-6ZM5 17v2M19 17v2" />
    </svg>
  ),
  coffee: (p: P) => (
    <svg {...base(p)}>
      <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9ZM17 11h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 2.5c-.8 1 .8 2 0 3M12 2.5c-.8 1 .8 2 0 3" />
    </svg>
  ),
  fridge: (p: P) => (
    <svg {...base(p)}>
      <rect x="5" y="2.5" width="14" height="19" />
      <path d="M5 9.5h14M8.5 5.5v1.5M8.5 12.5v3" />
    </svg>
  ),
  shield: (p: P) => (
    <svg {...base(p)}>
      <path d="M12 2.5 4 5.5v6c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10v-6l-8-3Z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  ),
  car: (p: P) => (
    <svg {...base(p)}>
      <path d="M3 16v-4l2.5-5h13L21 12v4H3ZM3 16v3h3v-3M18 16v3h3v-3M3 12h18" />
      <circle cx="7" cy="14" r=".6" fill="currentColor" />
      <circle cx="17" cy="14" r=".6" fill="currentColor" />
    </svg>
  ),
  pin: (p: P) => (
    <svg {...base(p)}>
      <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  road: (p: P) => (
    <svg {...base(p)}>
      <path d="M8 2 4 22M16 2l4 20M12 3v3M12 10v3M12 17v4" />
    </svg>
  ),
  bag: (p: P) => (
    <svg {...base(p)}>
      <path d="M4 7h16l-1 14H5L4 7Z" />
      <path d="M9 10V5a3 3 0 0 1 6 0v5" />
    </svg>
  ),
  dumbbell: (p: P) => (
    <svg {...base(p)}>
      <path d="M2.5 12h19M5 8v8M8 6.5v11M16 6.5v11M19 8v8" />
    </svg>
  ),
  users: (p: P) => (
    <svg {...base(p)}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
      <path d="M15.5 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.5 3.5 5.2" />
    </svg>
  ),
  star: (p: P) => (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...p}>
      <path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8L12 2.8Z" />
    </svg>
  ),
  instagram: (p: P) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (p: P) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
      <path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.4V21h3.1Z" />
    </svg>
  ),
  whatsapp: (p: P) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.2Z" />
    </svg>
  ),
  google: (p: P) => (
    <svg viewBox="0 0 24 24" aria-hidden {...p}>
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.2Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14Z" />
      <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1Z" />
    </svg>
  ),
  plus: (p: P) => (
    <svg {...base(p)} strokeWidth={2.4}>
      <path d="M12 4v16M4 12h16" />
    </svg>
  ),
  check: (p: P) => (
    <svg {...base(p)} strokeWidth={2.6}>
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  ),
};
