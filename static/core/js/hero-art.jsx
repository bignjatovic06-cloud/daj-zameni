function HeroArt({ accent }) {
  const mapFill   = accent + '18';
  const mapStroke = accent + '55';

  return (
    <div className="hero-art" aria-hidden="true">
      <svg viewBox="0 0 560 480" width="100%" height="100%" style={{display:'block', overflow:'visible'}}>
        <defs>
          <filter id="card-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#00000018"/>
          </filter>
          <filter id="sm-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#00000012"/>
          </filter>
          <pattern id="stripe-warm" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="8" fill="#e8e4d8"/>
            <rect x="4" width="4" height="8" fill="#f0ece2"/>
          </pattern>
          <pattern id="stripe-blue" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="8" fill="#dde8f0"/>
            <rect x="4" width="4" height="8" fill="#e8f0f6"/>
          </pattern>
          <pattern id="stripe-green" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="8" fill="#d8e8dc"/>
            <rect x="4" width="4" height="8" fill="#e4f0e6"/>
          </pattern>
          <clipPath id="card-clip-1"><rect width="190" height="220" rx="16"/></clipPath>
          <clipPath id="card-clip-2"><rect width="175" height="205" rx="16"/></clipPath>
          <clipPath id="card-clip-3"><rect width="185" height="215" rx="16"/></clipPath>
        </defs>

        {/* ── Serbia map shape ── */}
        <g opacity="0.9">
          {/* Main map blob - simplified Serbia outline */}
          <path
            d="M 200 48
               C 220 42, 260 38, 300 44
               C 340 50, 370 48, 395 58
               C 420 68, 435 80, 445 98
               C 455 116, 450 130, 448 148
               C 446 166, 455 178, 452 196
               C 449 214, 438 228, 430 244
               C 422 260, 425 278, 418 294
               C 411 310, 398 322, 385 335
               C 372 348, 358 356, 342 362
               C 326 368, 310 366, 295 370
               C 280 374, 268 382, 252 378
               C 236 374, 224 362, 212 350
               C 200 338, 192 322, 184 306
               C 176 290, 172 272, 168 254
               C 164 236, 160 218, 158 200
               C 156 182, 158 164, 160 146
               C 162 128, 164 112, 172 98
               C 180 84, 192 56, 200 48 Z"
            fill={mapFill}
            stroke={mapStroke}
            strokeWidth="1.5"
          />
          {/* Vojvodina separator line (approximate) */}
          <line x1="175" y1="160" x2="448" y2="148" stroke={mapStroke} strokeWidth="0.8" strokeDasharray="4 4"/>

          {/* Decorative map grid lines */}
          <line x1="150" y1="240" x2="460" y2="240" stroke={mapStroke} strokeWidth="0.5" strokeDasharray="2 8"/>
          <line x1="300" y1="40" x2="300" y2="385" stroke={mapStroke} strokeWidth="0.5" strokeDasharray="2 8"/>

          {/* City dots */}
          <g fill={accent} fontFamily="Inter, sans-serif">
            {/* Subotica */}
            <circle cx="295" cy="68" r="3.5" opacity="0.7"/>
            <text x="302" y="72" fontSize="9" fill={accent} opacity="0.8" fontWeight="500">SUBOTICA</text>

            {/* Novi Sad */}
            <circle cx="270" cy="112" r="3.5" opacity="0.7"/>
            <text x="278" y="116" fontSize="9" fill={accent} opacity="0.8" fontWeight="500">NOVI SAD</text>

            {/* Beograd */}
            <circle cx="228" cy="164" r="4.5" opacity="0.9"/>

            {/* Kragujevac */}
            <circle cx="278" cy="262" r="3" opacity="0.6"/>

            {/* N. Pazar */}
            <circle cx="305" cy="332" r="3" opacity="0.6"/>
            <text x="312" y="336" fontSize="9" fill={accent} opacity="0.8" fontWeight="500">N. PAZAR</text>

            {/* Niš */}
            <circle cx="355" cy="308" r="3" opacity="0.6"/>
          </g>
        </g>

        {/* ── Card 1: Knjige (top-left, rotated) ── */}
        <g transform="translate(32 55) rotate(-7, 95, 110)" filter="url(#card-shadow)">
          <rect width="190" height="215" rx="16" fill="#fff" stroke="#ece8df" strokeWidth="1"/>
          {/* Image area */}
          <rect x="0" y="0" width="190" height="130" rx="16" fill="url(#stripe-warm)"/>
          <rect x="0" y="114" width="190" height="16" fill="#fff"/>
          {/* RAZMENA badge */}
          <rect x="12" y="12" width="68" height="20" rx="6" fill={accent}/>
          <text x="16" y="25" fontFamily="'Geist Mono',monospace" fontSize="9" fontWeight="700" fill="#fff" letterSpacing="0.04em">RAZMENA</text>
          {/* Card text */}
          <text x="14" y="152" fontFamily="'Inter Tight',sans-serif" fontSize="13" fontWeight="700" fill="#1a1a1a">Knjige · komplet</text>
          <g transform="translate(14 162)">
            <circle r="3" cx="3" cy="3" fill="#999"/>
            <text x="10" y="7" fontFamily="Inter,sans-serif" fontSize="11" fill="#888">Vračar · pre 4h</text>
          </g>
        </g>

        {/* ── Card 2: Bicikl (top-right, rotated) ── */}
        <g transform="translate(346 42) rotate(5, 87, 102)" filter="url(#card-shadow)">
          <rect width="175" height="205" rx="16" fill="#fff" stroke="#ece8df" strokeWidth="1"/>
          {/* Image area */}
          <rect x="0" y="0" width="175" height="120" rx="16" fill="url(#stripe-blue)"/>
          <rect x="0" y="104" width="175" height="16" fill="#fff"/>
          {/* U top ponudi badge */}
          <rect x="10" y="10" width="88" height="20" rx="6" fill="#1a3a5c"/>
          <text x="14" y="23" fontFamily="'Geist Mono',monospace" fontSize="8.5" fontWeight="700" fill="#fff" letterSpacing="0.03em">U TOP PONUDI</text>
          {/* Card text */}
          <text x="12" y="142" fontFamily="'Inter Tight',sans-serif" fontSize="13" fontWeight="700" fill="#1a1a1a">Gradski bicikl</text>
          <text x="12" y="158" fontFamily="Inter,sans-serif" fontSize="11" fill="#888">Novi Beograd</text>
          {/* Price */}
          <rect x="12" y="170" width="148" height="24" rx="8" fill="#f5f1e6"/>
          <text x="20" y="186" fontFamily="'Geist Mono',monospace" fontSize="12" fontWeight="700" fill="#1a1a1a">14.500 RSD</text>
        </g>

        {/* ── Card 3: Saksija (bottom-left) ── */}
        <g transform="translate(48 295) rotate(-3, 92, 107)" filter="url(#card-shadow)">
          <rect width="185" height="150" rx="16" fill="#fff" stroke="#ece8df" strokeWidth="1"/>
          {/* Image area */}
          <rect x="0" y="0" width="185" height="92" rx="16" fill="url(#stripe-green)"/>
          <rect x="0" y="76" width="185" height="16" fill="#fff"/>
          {/* NOVO badge */}
          <rect x="10" y="10" width="44" height="20" rx="6" fill="#1a4a2a"/>
          <text x="14" y="23" fontFamily="'Geist Mono',monospace" fontSize="9" fontWeight="700" fill="#fff">NOVO</text>
          {/* Card text */}
          <text x="12" y="114" fontFamily="'Inter Tight',sans-serif" fontSize="13" fontWeight="700" fill="#1a1a1a">Saksija · monstera</text>
          <text x="12" y="130" fontFamily="Inter,sans-serif" fontSize="11" fill="#888">Zvezdara</text>
        </g>

        {/* ── Location pill ── */}
        <g transform="translate(178 260)" filter="url(#sm-shadow)">
          <rect width="160" height="44" rx="22" fill="#fff" stroke="#ece8df" strokeWidth="1"/>
          <circle cx="22" cy="22" r="14" fill={accent + '20'}/>
          <g transform="translate(22,22)">
            <circle r="5" fill={accent}/>
            <circle r="2" fill="#fff"/>
          </g>
          <text x="44" y="18" fontFamily="'Inter Tight',sans-serif" fontSize="11" fontWeight="700" fill="#1a1a1a">U tvom kraju</text>
          <text x="44" y="32" fontFamily="Inter,sans-serif" fontSize="10" fill="#888">23 oglasa · 5 min hoda</text>
        </g>

        {/* ── User swap element ── */}
        <g transform="translate(200 352)" filter="url(#sm-shadow)">
          {/* Marija */}
          <circle cx="30" cy="30" r="24" fill={accent} opacity="0.85"/>
          <text x="30" y="35" fontFamily="'Inter Tight',sans-serif" fontSize="14" fontWeight="700" fill="#fff" textAnchor="middle">M</text>
          <text x="30" y="66" fontFamily="Inter,sans-serif" fontSize="10" fontWeight="600" fill="#1a1a1a" textAnchor="middle">Marija</text>
          <text x="30" y="78" fontFamily="Inter,sans-serif" fontSize="9" fill="#888" textAnchor="middle">● 1.2 km</text>

          {/* Swap icon */}
          <circle cx="88" cy="30" r="18" fill="#fff" stroke="#ece8df" strokeWidth="1.5"/>
          <g stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(88,30)">
            <path d="M -7 -5 L 0 -12 L 7 -5"/>
            <path d="M 0 -12 L 0 2"/>
            <path d="M 7 5 L 0 12 L -7 5"/>
            <path d="M 0 12 L 0 -2"/>
          </g>

          {/* Aleksa */}
          <circle cx="146" cy="30" r="24" fill="#e8954a" opacity="0.85"/>
          <text x="146" y="35" fontFamily="'Inter Tight',sans-serif" fontSize="14" fontWeight="700" fill="#fff" textAnchor="middle">A</text>
          <text x="146" y="66" fontFamily="Inter,sans-serif" fontSize="10" fontWeight="600" fill="#1a1a1a" textAnchor="middle">Aleksa</text>
          <text x="146" y="78" fontFamily="Inter,sans-serif" fontSize="9" fill="#888" textAnchor="middle">● 0.8 km</text>
        </g>

        {/* ── Chat bubble ── */}
        <g transform="translate(368 330)" filter="url(#sm-shadow)">
          <rect width="172" height="62" rx="14" fill="#fff" stroke="#ece8df" strokeWidth="1"/>
          {/* Aleksa avatar small */}
          <circle cx="20" cy="18" r="12" fill="#e8954a" opacity="0.85"/>
          <text x="20" y="22" fontFamily="'Inter Tight',sans-serif" fontSize="10" fontWeight="700" fill="#fff" textAnchor="middle">A</text>
          {/* Message */}
          <text x="38" y="14" fontFamily="Inter,sans-serif" fontSize="10" fill="#555">Aleksa · sada</text>
          <text x="14" y="40" fontFamily="Inter,sans-serif" fontSize="11" fill="#1a1a1a">„Može sutra u 18h kod</text>
          <text x="14" y="54" fontFamily="Inter,sans-serif" fontSize="11" fill="#1a1a1a">parka?"</text>
        </g>

        {/* ── Razmenjeno badge ── */}
        <g transform="translate(355 408)" filter="url(#sm-shadow)">
          <rect width="168" height="48" rx="12" fill={accent}/>
          <circle cx="24" cy="24" r="14" fill="#ffffff22"/>
          <g transform="translate(24,24)" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M -6 0 L -2 4 L 7 -5"/>
          </g>
          <text x="46" y="18" fontFamily="'Inter Tight',sans-serif" fontSize="11" fontWeight="700" fill="#fff">Razmenjeno</text>
          <text x="46" y="33" fontFamily="Inter,sans-serif" fontSize="10" fill="#ffffff99">pre 2 dana · ★ 5.0</text>
        </g>

        {/* Decorative dots */}
        <circle cx="155" cy="310" r="4" fill={accent} opacity="0.3"/>
        <circle cx="480" cy="200" r="5" fill="#3b4744" opacity="0.12"/>
        <circle cx="460" cy="420" r="3" fill={accent} opacity="0.4"/>
        <circle cx="128" cy="210" r="3" fill="#3b4744" opacity="0.15"/>
      </svg>
    </div>
  );
}

window.HeroArt = HeroArt;
