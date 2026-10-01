import { seeded } from "@/lib/math";

/** Still compositions for the editorial (no-WebGL / reduced-motion) edition, after the design reference boards. */

export function BookStill() {
  return (
    <svg viewBox="80 140 900 480" className="still" role="img" aria-label="The NIMBUSWORLD book, closed, lit from above">
      <defs>
        <linearGradient id="ed-leather" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22355F" />
          <stop offset="0.45" stopColor="#132343" />
          <stop offset="1" stopColor="#070D1C" />
        </linearGradient>
        <linearGradient id="ed-spine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0A1226" />
          <stop offset="1" stopColor="#16264A" />
        </linearGradient>
        <linearGradient id="ed-pages" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8E8676" />
          <stop offset="0.5" stopColor="#D9D1C1" />
          <stop offset="1" stopColor="#3A372F" />
        </linearGradient>
        <linearGradient id="ed-foil" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8C6B37" />
          <stop offset="0.5" stopColor="#E0C592" />
          <stop offset="1" stopColor="#9C7A43" />
        </linearGradient>
        <filter id="ed-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
      </defs>
      <g transform="translate(-60 20)">
        <ellipse cx="560" cy="500" rx="470" ry="70" fill="#000" opacity="0.8" filter="url(#ed-soft)" />
        <polygon points="170,300 390,540 390,580 170,338" fill="url(#ed-spine)" />
        <polygon points="390,540 940,410 940,448 390,580" fill="url(#ed-pages)" />
        <g opacity="0.35" stroke="#6E675A" strokeWidth="0.4">
          {[548, 554, 560, 566, 572].map((y) => (
            <line key={y} x1="390" y1={y} x2="940" y2={y - 130} />
          ))}
        </g>
        <polygon points="170,300 720,170 940,410 390,540" fill="url(#ed-leather)" />
        <polyline points="170,300 390,540 940,410" fill="none" stroke="#2D4272" strokeWidth="1.2" opacity="0.7" />
        <g transform="matrix(0.55 -0.13 0.22 0.24 170 300)">
          <rect x="70" y="70" width="860" height="860" fill="none" stroke="url(#ed-foil)" strokeWidth="3" />
          <rect x="92" y="92" width="816" height="816" fill="none" stroke="url(#ed-foil)" strokeWidth="1.2" opacity="0.7" />
          <text x="500" y="455" textAnchor="middle" fontFamily="var(--font-display), serif" fontSize="34" letterSpacing="22" fill="url(#ed-foil)">
            NIMBUSWORLD
          </text>
          <line x1="440" y1="505" x2="560" y2="505" stroke="url(#ed-foil)" strokeWidth="2" />
          <text x="500" y="590" textAnchor="middle" fontFamily="var(--font-display), serif" fontStyle="italic" fontSize="58" fill="url(#ed-foil)">
            Your Next Chapter
          </text>
        </g>
      </g>
    </svg>
  );
}

/** Paper-white isometric blocks around a point of light — Pune in miniature. */
export function PuneStill() {
  const rand = seeded(1852);
  const blocks: { x: number; y: number; h: number }[] = [];
  for (let gy = -3; gy <= 3; gy++) {
    for (let gx = -3; gx <= 3; gx++) {
      if (Math.hypot(gx, gy) > 3.3 || rand() < 0.15) continue;
      const r = Math.hypot(gx, gy);
      blocks.push({ x: gx, y: gy, h: 8 + rand() * 12 + Math.max(0, 3 - r) * (10 + rand() * 12) });
    }
  }
  blocks.sort((a, b) => a.x + a.y - (b.x + b.y));
  const iso = (x: number, y: number) => [(x - y) * 22.5, (x + y) * 13] as const;
  return (
    <svg viewBox="-210 -125 420 230" className="still" role="img" aria-label="A miniature of Pune rising from the page">
      <defs>
        <radialGradient id="ed-spark">
          <stop offset="0" stopColor="#FFE8B8" stopOpacity="0.95" />
          <stop offset="0.25" stopColor="#E0B874" stopOpacity="0.5" />
          <stop offset="1" stopColor="#E0B874" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="40" rx="190" ry="96" fill="none" stroke="#D9CFBC" strokeWidth="0.8" />
      <path d="M -200 70 C -120 40, -60 90, 10 60 S 120 20, 210 50" fill="none" stroke="#9FB0C2" strokeWidth="2.2" opacity="0.7" />
      {blocks.map((b, i) => {
        const [cx, cy] = iso(b.x, b.y);
        const w = 15.6;
        const d = 9;
        return (
          <g key={i}>
            <polygon points={`${cx - w},${cy} ${cx},${cy + d} ${cx},${cy + d - b.h} ${cx - w},${cy - b.h}`} fill="#DCD3C2" />
            <polygon points={`${cx + w},${cy} ${cx},${cy + d} ${cx},${cy + d - b.h} ${cx + w},${cy - b.h}`} fill="#CFC5B2" />
            <polygon
              points={`${cx},${cy - d - b.h} ${cx + w},${cy - b.h} ${cx},${cy + d - b.h} ${cx - w},${cy - b.h}`}
              fill="#FBF8F1"
              stroke="#E6DDCC"
              strokeWidth="0.5"
            />
          </g>
        );
      })}
      <circle cx="0" cy="-58" r="46" fill="url(#ed-spark)" />
      <circle cx="0" cy="-58" r="3" fill="#FFF3D6" />
    </svg>
  );
}

export function FinaleStill() {
  const lines = Array.from({ length: 26 }, (_, i) => i);
  return (
    <svg viewBox="140 0 1160 800" className="still" role="img" aria-label="The book, now thick with pages, lying open">
      <defs>
        <filter id="ed-sh" x="-10%" y="-10%" width="120%" height="130%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>
      <rect x="200" y="200" width="1040" height="560" fill="#000" opacity="0.9" filter="url(#ed-sh)" />
      {lines.map((i) => (
        <path
          key={i}
          d={`M${164.4 + i * 0.6},${747.2 - i * 2.2} Q450,${733.2 - i * 2.2} 720,${757.2 - i * 2.2} Q990,${733.2 - i * 2.2} ${1275.6 - i * 0.6},${747.2 - i * 2.2}`}
          fill="none"
          stroke={i % 2 ? "#CFC5B2" : "#A89E8A"}
          strokeWidth="1"
        />
      ))}
      <path d="M180 150 Q450 130 720 154 L720 690 Q450 676 180 690 Z" fill="#F3EEE4" />
      <path d="M720 154 Q990 130 1260 150 L1260 690 Q990 676 720 690 Z" fill="#EFE9DD" />
      {[
        [1124, 121, 613, 0.55],
        [1018, 99, 552, 0.45],
        [882, 70, 475, 0.35],
        [731, 38, 389, 0.25],
      ].map(([x, y, b, o], i) => (
        <path
          key={i}
          d={`M720,150 Q880,${103 - i * 40} ${x},${y} L${x},${b} Q880,${654 - i * 30} 720,690 Z`}
          fill="#F6F1E8"
          stroke="#D9CFBC"
          strokeWidth="0.8"
          opacity={o}
        />
      ))}
    </svg>
  );
}
