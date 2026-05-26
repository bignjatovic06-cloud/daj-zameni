function HeroArt({
  accent
}) {
  const mapFill = accent + '18';
  const mapStroke = accent + '55';
  return /*#__PURE__*/React.createElement("div", {
    className: "hero-art",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 560 480",
    width: "100%",
    height: "100%",
    style: {
      display: 'block',
      overflow: 'visible'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("filter", {
    id: "card-shadow",
    x: "-20%",
    y: "-20%",
    width: "140%",
    height: "140%"
  }, /*#__PURE__*/React.createElement("feDropShadow", {
    dx: "0",
    dy: "6",
    stdDeviation: "10",
    floodColor: "#00000020"
  })), /*#__PURE__*/React.createElement("filter", {
    id: "sm-shadow",
    x: "-30%",
    y: "-30%",
    width: "160%",
    height: "160%"
  }, /*#__PURE__*/React.createElement("feDropShadow", {
    dx: "0",
    dy: "2",
    stdDeviation: "5",
    floodColor: "#00000014"
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: "clip-card1"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "190",
    height: "220",
    rx: "16"
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: "clip-card2"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "175",
    height: "205",
    rx: "16"
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: "clip-card3"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "185",
    height: "148",
    rx: "16"
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: "clip-img1"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "0",
    width: "190",
    height: "128",
    rx: "12"
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: "clip-img2"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "0",
    width: "175",
    height: "118",
    rx: "12"
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: "clip-img3"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "0",
    width: "185",
    height: "88",
    rx: "12"
  }))), /*#__PURE__*/React.createElement("path", {
    d: "M 200 48 C 220 42,260 38,300 44 C 340 50,370 48,395 58 C 420 68,435 80,445 98 C 455 116,450 130,448 148 C 446 166,455 178,452 196 C 449 214,438 228,430 244 C 422 260,425 278,418 294 C 411 310,398 322,385 335 C 372 348,358 356,342 362 C 326 368,310 366,295 370 C 280 374,268 382,252 378 C 236 374,224 362,212 350 C 200 338,192 322,184 306 C 176 290,172 272,168 254 C 164 236,160 218,158 200 C 156 182,158 164,160 146 C 162 128,164 112,172 98 C 180 84,192 56,200 48 Z",
    fill: mapFill,
    stroke: mapStroke,
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "175",
    y1: "160",
    x2: "448",
    y2: "148",
    stroke: mapStroke,
    strokeWidth: "0.8",
    strokeDasharray: "4 5"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "150",
    y1: "240",
    x2: "460",
    y2: "240",
    stroke: mapStroke,
    strokeWidth: "0.4",
    strokeDasharray: "2 9",
    opacity: "0.6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "300",
    y1: "40",
    x2: "300",
    y2: "385",
    stroke: mapStroke,
    strokeWidth: "0.4",
    strokeDasharray: "2 9",
    opacity: "0.6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "295",
    cy: "68",
    r: "3.5",
    fill: accent,
    opacity: "0.7"
  }), /*#__PURE__*/React.createElement("text", {
    x: "302",
    y: "72",
    fontFamily: "Inter,sans-serif",
    fontSize: "9",
    fill: accent,
    opacity: "0.8",
    fontWeight: "500"
  }, "SUBOTICA"), /*#__PURE__*/React.createElement("circle", {
    cx: "270",
    cy: "112",
    r: "3.5",
    fill: accent,
    opacity: "0.7"
  }), /*#__PURE__*/React.createElement("text", {
    x: "278",
    y: "116",
    fontFamily: "Inter,sans-serif",
    fontSize: "9",
    fill: accent,
    opacity: "0.8",
    fontWeight: "500"
  }, "NOVI SAD"), /*#__PURE__*/React.createElement("circle", {
    cx: "228",
    cy: "164",
    r: "4",
    fill: accent,
    opacity: "0.85"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "305",
    cy: "332",
    r: "3",
    fill: accent,
    opacity: "0.6"
  }), /*#__PURE__*/React.createElement("text", {
    x: "312",
    y: "336",
    fontFamily: "Inter,sans-serif",
    fontSize: "9",
    fill: accent,
    opacity: "0.8",
    fontWeight: "500"
  }, "N. PAZAR"), /*#__PURE__*/React.createElement("g", {
    transform: "translate(28 52) rotate(-7, 95, 110)",
    filter: "url(#card-shadow)"
  }, /*#__PURE__*/React.createElement("g", {
    clipPath: "url(#clip-card1)"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "190",
    height: "220",
    rx: "16",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("image", {
    href: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=260&fit=crop&crop=center",
    x: "0",
    y: "0",
    width: "190",
    height: "128",
    preserveAspectRatio: "xMidYMid slice",
    clipPath: "url(#clip-img1)"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "80",
    width: "190",
    height: "48",
    fill: "url(#grad-fade-1)",
    opacity: "0.3"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "12",
    y: "12",
    width: "70",
    height: "22",
    rx: "7",
    fill: accent
  }), /*#__PURE__*/React.createElement("text", {
    x: "16",
    y: "27",
    fontFamily: "'Geist Mono',monospace",
    fontSize: "9.5",
    fontWeight: "700",
    fill: "#fff",
    letterSpacing: "0.05em"
  }, "RAZMENA"), /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "128",
    width: "190",
    height: "92",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("text", {
    x: "14",
    y: "154",
    fontFamily: "'Inter Tight',sans-serif",
    fontSize: "14",
    fontWeight: "700",
    fill: "#1a1a1a"
  }, "Knjige \xB7 komplet"), /*#__PURE__*/React.createElement("circle", {
    cx: "17",
    cy: "170",
    r: "3",
    fill: "#aaa"
  }), /*#__PURE__*/React.createElement("text", {
    x: "26",
    y: "174",
    fontFamily: "Inter,sans-serif",
    fontSize: "11.5",
    fill: "#888"
  }, "Vra\u010Dar \xB7 pre 4h"))), /*#__PURE__*/React.createElement("g", {
    transform: "translate(344 40) rotate(5, 87, 102)",
    filter: "url(#card-shadow)"
  }, /*#__PURE__*/React.createElement("g", {
    clipPath: "url(#clip-card2)"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "175",
    height: "205",
    rx: "16",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("image", {
    href: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=240&fit=crop&crop=center",
    x: "0",
    y: "0",
    width: "175",
    height: "118",
    preserveAspectRatio: "xMidYMid slice",
    clipPath: "url(#clip-img2)"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "10",
    y: "10",
    width: "92",
    height: "22",
    rx: "7",
    fill: "#1a3a5c"
  }), /*#__PURE__*/React.createElement("text", {
    x: "14",
    y: "25",
    fontFamily: "'Geist Mono',monospace",
    fontSize: "8.5",
    fontWeight: "700",
    fill: "#fff",
    letterSpacing: "0.03em"
  }, "U TOP PONUDI"), /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "118",
    width: "175",
    height: "87",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("text", {
    x: "12",
    y: "144",
    fontFamily: "'Inter Tight',sans-serif",
    fontSize: "14",
    fontWeight: "700",
    fill: "#1a1a1a"
  }, "Gradski bicikl"), /*#__PURE__*/React.createElement("text", {
    x: "12",
    y: "161",
    fontFamily: "Inter,sans-serif",
    fontSize: "11.5",
    fill: "#888"
  }, "Novi Beograd"), /*#__PURE__*/React.createElement("rect", {
    x: "12",
    y: "172",
    width: "150",
    height: "26",
    rx: "8",
    fill: "#f5f1e8"
  }), /*#__PURE__*/React.createElement("text", {
    x: "20",
    y: "189",
    fontFamily: "'Geist Mono',monospace",
    fontSize: "12.5",
    fontWeight: "700",
    fill: "#1a1a1a"
  }, "14.500 RSD"))), /*#__PURE__*/React.createElement("g", {
    transform: "translate(44 292) rotate(-3, 92, 74)",
    filter: "url(#card-shadow)"
  }, /*#__PURE__*/React.createElement("g", {
    clipPath: "url(#clip-card3)"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "185",
    height: "148",
    rx: "16",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("image", {
    href: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&h=180&fit=crop&crop=center",
    x: "0",
    y: "0",
    width: "185",
    height: "88",
    preserveAspectRatio: "xMidYMid slice",
    clipPath: "url(#clip-img3)"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "10",
    y: "10",
    width: "46",
    height: "22",
    rx: "7",
    fill: "#1a4a2a"
  }), /*#__PURE__*/React.createElement("text", {
    x: "14",
    y: "25",
    fontFamily: "'Geist Mono',monospace",
    fontSize: "9.5",
    fontWeight: "700",
    fill: "#fff"
  }, "NOVO"), /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "88",
    width: "185",
    height: "60",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("text", {
    x: "13",
    y: "112",
    fontFamily: "'Inter Tight',sans-serif",
    fontSize: "13.5",
    fontWeight: "700",
    fill: "#1a1a1a"
  }, "Saksija \xB7 monstera"), /*#__PURE__*/React.createElement("text", {
    x: "13",
    y: "129",
    fontFamily: "Inter,sans-serif",
    fontSize: "11.5",
    fill: "#888"
  }, "Zvezdara"))), /*#__PURE__*/React.createElement("g", {
    transform: "translate(178 258)",
    filter: "url(#sm-shadow)"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "166",
    height: "46",
    rx: "23",
    fill: "#fff",
    stroke: "#eae6de",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "23",
    cy: "23",
    r: "14",
    fill: accent + '22'
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "23",
    cy: "23",
    r: "5",
    fill: accent
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "23",
    cy: "23",
    r: "2",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("text", {
    x: "46",
    y: "19",
    fontFamily: "'Inter Tight',sans-serif",
    fontSize: "11.5",
    fontWeight: "700",
    fill: "#1a1a1a"
  }, "U tvom kraju"), /*#__PURE__*/React.createElement("text", {
    x: "46",
    y: "34",
    fontFamily: "Inter,sans-serif",
    fontSize: "10.5",
    fill: "#999"
  }, "23 oglasa \xB7 5 min hoda")), /*#__PURE__*/React.createElement("g", {
    transform: "translate(198 350)",
    filter: "url(#sm-shadow)"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "30",
    cy: "28",
    r: "26",
    fill: accent
  }), /*#__PURE__*/React.createElement("text", {
    x: "30",
    y: "34",
    fontFamily: "'Inter Tight',sans-serif",
    fontSize: "15",
    fontWeight: "700",
    fill: "#fff",
    textAnchor: "middle"
  }, "M"), /*#__PURE__*/React.createElement("text", {
    x: "30",
    y: "68",
    fontFamily: "Inter,sans-serif",
    fontSize: "11",
    fontWeight: "600",
    fill: "#1a1a1a",
    textAnchor: "middle"
  }, "Marija"), /*#__PURE__*/React.createElement("text", {
    x: "30",
    y: "81",
    fontFamily: "Inter,sans-serif",
    fontSize: "10",
    fill: "#999",
    textAnchor: "middle"
  }, "\u25CF 1.2 km"), /*#__PURE__*/React.createElement("circle", {
    cx: "90",
    cy: "28",
    r: "20",
    fill: "#fff",
    stroke: "#eae6de",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("g", {
    stroke: accent,
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none",
    transform: "translate(90,28)"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -7 -5 L 0 -13 L 7 -5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M 0 -13 L 0 2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M 7 5 L 0 13 L -7 5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M 0 13 L 0 -2"
  })), /*#__PURE__*/React.createElement("circle", {
    cx: "150",
    cy: "28",
    r: "26",
    fill: "#e8954a"
  }), /*#__PURE__*/React.createElement("text", {
    x: "150",
    y: "34",
    fontFamily: "'Inter Tight',sans-serif",
    fontSize: "15",
    fontWeight: "700",
    fill: "#fff",
    textAnchor: "middle"
  }, "A"), /*#__PURE__*/React.createElement("text", {
    x: "150",
    y: "68",
    fontFamily: "Inter,sans-serif",
    fontSize: "11",
    fontWeight: "600",
    fill: "#1a1a1a",
    textAnchor: "middle"
  }, "Aleksa"), /*#__PURE__*/React.createElement("text", {
    x: "150",
    y: "81",
    fontFamily: "Inter,sans-serif",
    fontSize: "10",
    fill: "#999",
    textAnchor: "middle"
  }, "\u25CF 0.8 km")), /*#__PURE__*/React.createElement("g", {
    transform: "translate(364 326)",
    filter: "url(#sm-shadow)"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "178",
    height: "72",
    rx: "14",
    fill: "#fff",
    stroke: "#eae6de",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "20",
    cy: "20",
    r: "12",
    fill: "#e8954a"
  }), /*#__PURE__*/React.createElement("text", {
    x: "20",
    y: "24",
    fontFamily: "'Inter Tight',sans-serif",
    fontSize: "10",
    fontWeight: "700",
    fill: "#fff",
    textAnchor: "middle"
  }, "A"), /*#__PURE__*/React.createElement("text", {
    x: "38",
    y: "16",
    fontFamily: "Inter,sans-serif",
    fontSize: "10",
    fill: "#aaa"
  }, "Aleksa \xB7 sada"), /*#__PURE__*/React.createElement("text", {
    x: "12",
    y: "43",
    fontFamily: "Inter,sans-serif",
    fontSize: "11.5",
    fill: "#1a1a1a"
  }, "\u201EMo\u017Ee sutra u 18h kod"), /*#__PURE__*/React.createElement("text", {
    x: "12",
    y: "59",
    fontFamily: "Inter,sans-serif",
    fontSize: "11.5",
    fill: "#1a1a1a"
  }, "parka?\"")), /*#__PURE__*/React.createElement("g", {
    transform: "translate(354 412)",
    filter: "url(#sm-shadow)"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "172",
    height: "50",
    rx: "12",
    fill: accent
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "25",
    cy: "25",
    r: "15",
    fill: "#ffffff20"
  }), /*#__PURE__*/React.createElement("g", {
    transform: "translate(25,25)",
    stroke: "#fff",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -6 0 L -2 5 L 7 -5"
  })), /*#__PURE__*/React.createElement("text", {
    x: "48",
    y: "19",
    fontFamily: "'Inter Tight',sans-serif",
    fontSize: "11.5",
    fontWeight: "700",
    fill: "#fff"
  }, "Razmenjeno"), /*#__PURE__*/React.createElement("text", {
    x: "48",
    y: "36",
    fontFamily: "Inter,sans-serif",
    fontSize: "10.5",
    fill: "#ffffffaa"
  }, "pre 2 dana \xB7 \u2605 5.0")), /*#__PURE__*/React.createElement("circle", {
    cx: "152",
    cy: "308",
    r: "4",
    fill: accent,
    opacity: "0.28"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "480",
    cy: "195",
    r: "5",
    fill: "#3b4744",
    opacity: "0.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "462",
    cy: "422",
    r: "3",
    fill: accent,
    opacity: "0.35"
  })));
}
window.HeroArt = HeroArt;