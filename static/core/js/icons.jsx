// Inline SVG icons — stroke-based, simple, no emoji.

const Icon = ({ name, size = 18, stroke = 1.6, ...rest }) => {
  const s = size, sw = stroke;
  const common = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', ...rest };
  switch (name) {
    case 'search':   return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case 'plus':     return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case 'bell':     return <svg {...common}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
    case 'swap':     return <svg {...common}><path d="m7 4 4 4-4 4"/><path d="M3 8h12a4 4 0 0 1 4 4"/><path d="m17 20-4-4 4-4"/><path d="M21 16H9a4 4 0 0 1-4-4"/></svg>;
    case 'caret':    return <svg {...common}><path d="m6 9 6 6 6-6"/></svg>;
    case 'logout':   return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>;
    case 'x':        return <svg {...common}><path d="M18 6 6 18M6 6l12 12"/></svg>;
    case 'arrow-r':  return <svg {...common}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
    case 'pin':      return <svg {...common}><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
    case 'heart':    return <svg {...common} fill={rest.filled ? 'currentColor' : 'none'}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"/></svg>;
    case 'check':    return <svg {...common}><path d="M20 6 9 17l-5-5"/></svg>;
    case 'shield':   return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>;
    case 'leaf':     return <svg {...common}><path d="M11 20A7 7 0 0 1 4 13V5a17 17 0 0 0 13 7 7 7 0 0 1-6 8Z"/><path d="M2 22c2-4 6-6 10-7"/></svg>;
    case 'tag':      return <svg {...common}><path d="M20.59 13.41 13.42 20.59a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"/><circle cx="7" cy="7" r="1.5"/></svg>;
    case 'msg':      return <svg {...common}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case 'eye':      return <svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'star':     return <svg {...common}><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
    case 'camera':   return <svg {...common}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
    case 'send':     return <svg {...common}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
    case 'sliders':  return <svg {...common}><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><circle cx="4" cy="12" r="2"/><circle cx="12" cy="10" r="2"/><circle cx="20" cy="14" r="2"/></svg>;
    /* category icons */
    case 'grid':     return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
    case 'cpu':      return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>;
    case 'shirt':    return <svg {...common}><path d="m20 6-4-2-2 2c0 1-1 2-2 2s-2-1-2-2L8 4 4 6l2 4 2-1v9h8v-9l2 1z"/></svg>;
    case 'sofa':     return <svg {...common}><path d="M3 12V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/><path d="M15 12V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/><path d="M3 12a2 2 0 0 0-2 2v4h22v-4a2 2 0 0 0-2-2"/><path d="M5 18v2M19 18v2"/><path d="M9 12h6"/></svg>;
    case 'book':     return <svg {...common}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
    case 'baby':     return <svg {...common}><circle cx="12" cy="9" r="4"/><path d="M9 8.5h.01M15 8.5h.01"/><path d="M10 11s.5 1 2 1 2-1 2-1"/><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/></svg>;
    case 'tool':     return <svg {...common}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5z"/></svg>;
    case 'sport':    return <svg {...common}><circle cx="12" cy="12" r="10"/><path d="M12 2a14 14 0 0 0 0 20"/><path d="M12 2a14 14 0 0 1 0 20"/><path d="M2 12h20"/></svg>;
    case 'car':      return <svg {...common}><path d="M5 17H3v-3l2-5h14l2 5v3h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6"/></svg>;
    case 'home':     return <svg {...common}><path d="m3 11 9-8 9 8v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></svg>;
    case 'art':      return <svg {...common}><circle cx="12" cy="12" r="10"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="10.5" r="1"/><path d="M12 22a4 4 0 0 0 0-8 2 2 0 0 1-2-2"/></svg>;
    case 'hands':    return <svg {...common}><path d="M9 11V5a2 2 0 1 1 4 0v5"/><path d="M13 8a2 2 0 1 1 4 0v6a6 6 0 0 1-12 0v-3a2 2 0 1 1 4 0"/></svg>;
    default: return null;
  }
};

window.Icon = Icon;
