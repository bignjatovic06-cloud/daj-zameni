function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Inline SVG icons — stroke-based, no emoji.

const Icon = ({
  name,
  size = 18,
  stroke = 1.6,
  filled,
  ...rest
}) => {
  const s = size,
    sw = stroke;
  const p = {
    width: s,
    height: s,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: sw,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...rest
  };
  switch (name) {
    /* ── navigation / UI ── */
    case 'search':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
        cx: "11",
        cy: "11",
        r: "7"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m20 20-3.5-3.5"
      }));
    case 'plus':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M12 5v14M5 12h14"
      }));
    case 'x':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M18 6 6 18M6 6l12 12"
      }));
    case 'menu':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M3 12h18M3 6h18M3 18h18"
      }));
    case 'caret':
    case 'chevron-down':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "m6 9 6 6 6-6"
      }));
    case 'chevron-right':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "m9 6 6 6-6 6"
      }));
    case 'chevron-left':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "m15 6-6 6 6 6"
      }));
    case 'arrow-r':
    case 'arrow-right':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M5 12h14"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m12 5 7 7-7 7"
      }));
    case 'arrow-l':
    case 'arrow-left':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M19 12H5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m12 5-7 7 7 7"
      }));
    case 'logout':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m16 17 5-5-5-5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M21 12H9"
      }));
    case 'check':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M20 6 9 17l-5-5"
      }));
    case 'check-circle':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "10"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m9 12 2 2 4-4"
      }));
    case 'filter':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M22 3H2l8 9.46V19l4 2v-8.54z"
      }));
    case 'lock':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("rect", {
        x: "4",
        y: "11",
        width: "16",
        height: "10",
        rx: "2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M8 11V7a4 4 0 0 1 8 0v4"
      }));
    case 'trash':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("polyline", {
        points: "3 6 5 6 21 6"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M19 6l-1 14H6L5 6"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M10 11v6M14 11v6"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M9 6V4h6v2"
      }));
    case 'more':
    case 'dots':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
        cx: "5",
        cy: "12",
        r: "1.5",
        fill: "currentColor"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "1.5",
        fill: "currentColor"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "19",
        cy: "12",
        r: "1.5",
        fill: "currentColor"
      }));
    /* ── user / social ── */
    case 'user':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "7",
        r: "4"
      }));
    case 'user-check':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
        cx: "9",
        cy: "8",
        r: "4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m17 11 2 2 4-4"
      }));
    case 'shield':
    case 'shield-check':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m9 12 2 2 4-4"
      }));
    case 'google':
      return /*#__PURE__*/React.createElement("svg", {
        width: s,
        height: s,
        viewBox: "0 0 48 48"
      }, /*#__PURE__*/React.createElement("path", {
        fill: "#4285F4",
        d: "M45 24c0-1.5-.1-3-.4-4.4H24v8.4h11.8c-.5 2.7-2 5-4.3 6.6v5.4h7c4.1-3.8 6.5-9.4 6.5-16z"
      }), /*#__PURE__*/React.createElement("path", {
        fill: "#34A853",
        d: "M24 46c5.8 0 10.7-1.9 14.3-5.2l-7-5.4c-1.9 1.3-4.4 2-7.3 2-5.6 0-10.4-3.8-12.1-8.9H4.7v5.6C8.3 41.2 15.6 46 24 46z"
      }), /*#__PURE__*/React.createElement("path", {
        fill: "#FBBC05",
        d: "M11.9 28.5c-.4-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1v-5.6H4.7C3.2 17.7 2.4 20.7 2.4 24s.8 6.3 2.3 9.2z"
      }), /*#__PURE__*/React.createElement("path", {
        fill: "#EA4335",
        d: "M24 9.5c3.2 0 6 1.1 8.2 3.2l6.2-6.2C34.7 2.9 29.8 1 24 1 15.6 1 8.3 5.8 4.7 12.8l7.2 5.6C13.6 13.3 18.4 9.5 24 9.5z"
      }));
    /* ── interaction ── */
    case 'heart':
      return /*#__PURE__*/React.createElement("svg", _extends({}, p, {
        fill: filled ? 'currentColor' : 'none'
      }), /*#__PURE__*/React.createElement("path", {
        d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
      }));
    case 'heart-fill':
      return /*#__PURE__*/React.createElement("svg", _extends({}, p, {
        fill: "currentColor",
        stroke: "none"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
      }));
    case 'heart-pulse':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M20.8 12.6 12 21l-8.8-8.4a5.5 5.5 0 0 1 7.8-7.8l1 1 1-1a5.5 5.5 0 0 1 7.8 7.8z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M3.2 12.6h4l1.5-3 3 6 1.5-3h4.5"
      }));
    case 'bell':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M10 21a2 2 0 0 0 4 0"
      }));
    case 'swap':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "m7 4 4 4-4 4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M3 8h12a4 4 0 0 1 4 4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m17 20-4-4 4-4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M21 16H9a4 4 0 0 1-4-4"
      }));
    case 'msg':
    case 'message':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      }));
    case 'send':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "m22 2-7 20-4-9-9-4Z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M22 2 11 13"
      }));
    case 'star':
      return /*#__PURE__*/React.createElement("svg", _extends({}, p, {
        fill: "currentColor"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01Z"
      }));
    case 'tag':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M20.59 13.41 13.42 20.59a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "7",
        cy: "7",
        r: "1.5"
      }));
    case 'ticket':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M13 5v14"
      }));
    case 'gift':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("polyline", {
        points: "20 12 20 22 4 22 4 12"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "2",
        y: "7",
        width: "20",
        height: "5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"
      }));
    /* ── content / misc ── */
    case 'eye':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "3"
      }));
    case 'camera':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "13",
        r: "4"
      }));
    case 'image':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "3",
        width: "18",
        height: "18",
        rx: "2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "9",
        cy: "9",
        r: "2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m21 15-5-5L5 21"
      }));
    case 'map':
    case 'pin':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "10",
        r: "3"
      }));
    case 'sliders':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M4 21v-7"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M4 10V3"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 21v-9"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 8V3"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M20 21v-5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M20 12V3"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "4",
        cy: "12",
        r: "2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "10",
        r: "2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "20",
        cy: "14",
        r: "2"
      }));
    case 'sparkles':
    case 'sparkle':
    case 'spark':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "m12 2 2 7 7 2-7 2-2 7-2-7-7-2 7-2z"
      }));
    /* ── category icons ── */
    case 'grid':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "3",
        width: "7",
        height: "7",
        rx: "1.5"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "14",
        y: "3",
        width: "7",
        height: "7",
        rx: "1.5"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "14",
        width: "7",
        height: "7",
        rx: "1.5"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "14",
        y: "14",
        width: "7",
        height: "7",
        rx: "1.5"
      }));
    case 'cpu':
    case 'device':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("rect", {
        x: "6",
        y: "6",
        width: "12",
        height: "12",
        rx: "2"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "9",
        y: "9",
        width: "6",
        height: "6",
        rx: "1"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"
      }));
    case 'sofa':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M3 12V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M15 12V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M3 12a2 2 0 0 0-2 2v4h22v-4a2 2 0 0 0-2-2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M5 18v2M19 18v2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M9 12h6"
      }));
    case 'appliance':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("rect", {
        x: "4",
        y: "3",
        width: "16",
        height: "18",
        rx: "2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M4 9h16"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "8",
        cy: "14",
        r: "2.5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M16 13v3"
      }));
    case 'tool':
    case 'wrench':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5z"
      }));
    case 'car':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M5 17H3v-3l2-5h14l2 5v3h-2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "7",
        cy: "17",
        r: "2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "17",
        cy: "17",
        r: "2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M9 17h6"
      }));
    case 'shirt':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "m20 6-4-2-2 2c0 1-1 2-2 2s-2-1-2-2L8 4 4 6l2 4 2-1v9h8v-9l2 1z"
      }));
    case 'sport':
    case 'ball':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "10"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 2a14 14 0 0 0 0 20"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 2a14 14 0 0 1 0 20"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M2 12h20"
      }));
    case 'book':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
      }));
    case 'baby':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "9",
        r: "4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M9 8.5h.01M15 8.5h.01"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M10 11s.5 1 2 1 2-1 2-1"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"
      }));
    case 'paw':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
        cx: "6",
        cy: "11",
        r: "2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "10",
        cy: "6",
        r: "2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "14",
        cy: "6",
        r: "2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "18",
        cy: "11",
        r: "2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M8 17a4 4 0 0 1 8 0c0 3-4 4-4 4s-4-1-4-4z"
      }));
    case 'leaf':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M11 20A7 7 0 0 1 4 13V5a17 17 0 0 0 13 7 7 7 0 0 1-6 8Z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M2 22c2-4 6-6 10-7"
      }));
    case 'wheat':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M12 22V8"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M8 12c-2-2-2-5 0-7 2 2 2 5 0 7zM16 12c2-2 2-5 0-7-2 2-2 5 0 7zM8 17c-2-2-2-5 0-7 2 2 2 5 0 7zM16 17c2-2 2-5 0-7-2 2-2 5 0 7z"
      }));
    case 'briefcase':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "7",
        width: "18",
        height: "13",
        rx: "2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M3 13h18"
      }));
    case 'art':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "10"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "7.5",
        cy: "10.5",
        r: "1"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "7.5",
        r: "1"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "16.5",
        cy: "10.5",
        r: "1"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 22a4 4 0 0 0 0-8 2 2 0 0 1-2-2"
      }));
    case 'hands':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M9 11V5a2 2 0 1 1 4 0v5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M13 8a2 2 0 1 1 4 0v6a6 6 0 0 1-12 0v-3a2 2 0 1 1 4 0"
      }));
    case 'home':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "m3 11 9-8 9 8v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"
      }));
    case 'phone':
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
      }));
    default:
      return null;
  }
};
window.Icon = Icon;