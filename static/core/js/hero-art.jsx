// Hero illustration — abstract barter scene built from CSS shapes + minimal SVG.
// Two stylized "hands" exchanging stylized objects, floating cards above.
// No realistic SVG illustration — abstract geometric composition only.

function HeroArt({ accent }) {
  return (
    <div className="hero-art" aria-hidden="true">
      <svg viewBox="0 0 520 520" width="100%" height="100%" style={{display:'block'}}>
        <defs>
          <linearGradient id="bg-circle" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor={accent} stopOpacity=".10"/>
            <stop offset="1" stopColor={accent} stopOpacity=".02"/>
          </linearGradient>
          <linearGradient id="card-1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff"/>
            <stop offset="1" stopColor="#f5f1e6"/>
          </linearGradient>
          <pattern id="stripe" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="5" height="10" fill="#e6e1d2"/>
            <rect x="5" width="5" height="10" fill="#efece2"/>
          </pattern>
        </defs>

        {/* Soft background blob */}
        <circle cx="260" cy="260" r="230" fill="url(#bg-circle)"/>
        <circle cx="260" cy="260" r="180" fill="none" stroke={accent} strokeOpacity=".10" strokeDasharray="2 6"/>

        {/* Center exchange icon — two arrows */}
        <g transform="translate(260 260)">
          <circle r="56" fill="#fff" stroke={accent} strokeWidth="1.5"/>
          <g stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="m -22 -10 18 -18 18 18"/>
            <path d="M -4 -28 V 14"/>
            <path d="m 22 10 -18 18 -18 -18" transform="translate(0 0)"/>
            <path d="M 4 28 V -14"/>
          </g>
        </g>

        {/* Floating card — left (item being offered) */}
        <g transform="translate(60 110) rotate(-8)">
          <rect width="180" height="200" rx="16" fill="url(#card-1)" stroke="#e6e3dc"/>
          <rect x="14" y="14" width="152" height="112" rx="10" fill="url(#stripe)"/>
          <rect x="14" y="138" width="120" height="10" rx="5" fill="#d8d3c4"/>
          <rect x="14" y="156" width="80" height="8" rx="4" fill="#e6e1d2"/>
          <rect x="14" y="174" width="64" height="14" rx="4" fill={accent} fillOpacity=".15"/>
          <text x="22" y="184.5" fontFamily="Geist Mono, monospace" fontSize="9" fontWeight="600" fill={accent}>RAZMENA</text>
        </g>

        {/* Floating card — right (item being requested) */}
        <g transform="translate(290 90) rotate(6)">
          <rect width="170" height="190" rx="16" fill="url(#card-1)" stroke="#e6e3dc"/>
          <rect x="14" y="14" width="142" height="106" rx="10" fill="url(#stripe)"/>
          <rect x="14" y="132" width="108" height="10" rx="5" fill="#d8d3c4"/>
          <rect x="14" y="150" width="72" height="8" rx="4" fill="#e6e1d2"/>
          <rect x="14" y="166" width="58" height="14" rx="4" fill="#3b4744" fillOpacity=".10"/>
          <text x="22" y="176.5" fontFamily="Geist Mono, monospace" fontSize="9" fontWeight="600" fill="#3b4744">14.500 RSD</text>
        </g>

        {/* Floating card — bottom (recently swapped) */}
        <g transform="translate(170 340) rotate(-3)">
          <rect width="220" height="120" rx="14" fill="#fff" stroke="#e6e3dc"/>
          <circle cx="34" cy="60" r="20" fill={accent} fillOpacity=".18"/>
          <text x="34" y="65" fontFamily="Inter Tight, sans-serif" fontSize="16" fontWeight="700" fill={accent} textAnchor="middle">M</text>
          <rect x="68" y="40" width="120" height="12" rx="6" fill="#d8d3c4"/>
          <rect x="68" y="60" width="90" height="8" rx="4" fill="#e6e1d2"/>
          <g transform="translate(68 80)">
            <path d="M 0 6 L 4 10 L 12 2" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <text x="20" y="9" fontFamily="Geist Mono, monospace" fontSize="9" fontWeight="600" fill={accent}>RAZMENJENO • 2 dana</text>
          </g>
        </g>

        {/* Decorative dots */}
        <circle cx="80" cy="380" r="4" fill={accent} fillOpacity=".4"/>
        <circle cx="450" cy="380" r="6" fill="#3b4744" fillOpacity=".18"/>
        <circle cx="430" cy="430" r="3" fill={accent} fillOpacity=".5"/>
        <circle cx="100" cy="80" r="3" fill="#3b4744" fillOpacity=".25"/>
      </svg>
    </div>
  );
}

window.HeroArt = HeroArt;
