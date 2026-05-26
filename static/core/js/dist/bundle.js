// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-noncommentable": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;

  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}
function TweakColor({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
    type: "color",
    className: "twk-swatch",
    value: value,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});// static/core/js/data.jsx

async function apiListingDetail(id) {
  const res = await fetch(`/listings/${id}/`, {
    credentials: 'same-origin'
  });
  return res.json();
}
async function apiChatMessages(conversationId) {
  const res = await fetch(`/inbox/${conversationId}/`, {
    credentials: 'same-origin'
  });
  return res.json();
}
async function apiSendMessage(conversationId, body) {
  return apiFetch(`/inbox/${conversationId}/`, {
    method: 'POST',
    body: JSON.stringify({
      body
    })
  });
}function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
window.Icon = Icon;const {
  useState,
  useEffect,
  useRef
} = React;
const SERBIAN_CITIES = [{
  id: '',
  name: 'Cela Srbija'
}, {
  id: 'Beograd',
  name: 'Beograd'
}, {
  id: 'Novi Sad',
  name: 'Novi Sad'
}, {
  id: 'Niš',
  name: 'Niš'
}, {
  id: 'Kragujevac',
  name: 'Kragujevac'
}, {
  id: 'Subotica',
  name: 'Subotica'
}, {
  id: 'Zrenjanin',
  name: 'Zrenjanin'
}, {
  id: 'Pančevo',
  name: 'Pančevo'
}, {
  id: 'Čačak',
  name: 'Čačak'
}, {
  id: 'Novi Pazar',
  name: 'Novi Pazar'
}, {
  id: 'Kraljevo',
  name: 'Kraljevo'
}, {
  id: 'Smederevo',
  name: 'Smederevo'
}, {
  id: 'Leskovac',
  name: 'Leskovac'
}, {
  id: 'Valjevo',
  name: 'Valjevo'
}, {
  id: 'Vranje',
  name: 'Vranje'
}, {
  id: 'Šabac',
  name: 'Šabac'
}, {
  id: 'Užice',
  name: 'Užice'
}, {
  id: 'Požarevac',
  name: 'Požarevac'
}, {
  id: 'Sombor',
  name: 'Sombor'
}, {
  id: 'Kikinda',
  name: 'Kikinda'
}];

/* ─── NAV ─────────────────────────────────────── */
function Nav({
  unreadNotifs,
  unreadThreads,
  currentUser,
  onPostAd,
  onOpenNotifs,
  onOpenRazmene,
  onOpenUser,
  openNotifs,
  openUser,
  onSearch,
  onNav,
  onLogin,
  onLogout,
  onMarkRead,
  onNotifClick,
  notifications,
  categories,
  onSelectCat
}) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [burgerOpen, setBurgerOpen] = useState(false);
  const userRef = useRef(null);
  const initials = currentUser ? currentUser.first_name && currentUser.last_name ? (currentUser.first_name[0] + currentUser.last_name[0]).toUpperCase() : currentUser.username.slice(0, 2).toUpperCase() : '';
  const displayName = currentUser ? currentUser.first_name || currentUser.username : '';
  const handleSubmit = e => {
    e.preventDefault();
    if (cat) onSelectCat && onSelectCat(cat);
    onSearch(q);
  };
  const handleCatChange = e => {
    const val = e.target.value;
    setCat(val);
    onSelectCat && onSelectCat(val || 'sve');
  };
  const closeBurger = () => setBurgerOpen(false);
  const burgerNav = view => {
    closeBurger();
    onNav && onNav(view);
  };
  const totalBadge = (unreadNotifs || 0) + (unreadThreads || 0);
  return /*#__PURE__*/React.createElement("header", {
    className: "nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand",
    onClick: () => onNav('home'),
    style: {
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand-mark",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m7 4 4 4-4 4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 8h12a4 4 0 0 1 4 4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m17 20-4-4 4-4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 16H9a4 4 0 0 1-4-4"
  }))), /*#__PURE__*/React.createElement("span", null, "Daj Zameni"), /*#__PURE__*/React.createElement("small", {
    className: "nav-beta"
  }, "beta")), /*#__PURE__*/React.createElement("form", {
    className: "nav-search",
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16,
    stroke: 1.8,
    style: {
      color: 'var(--ink-3)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "\u0160ta nudite?"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "s-btn"
  }, "Pretra\u017Ei")), /*#__PURE__*/React.createElement("div", {
    className: "nav-actions nav-actions-desktop"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: onPostAd
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 15,
    stroke: 2.2
  }), /*#__PURE__*/React.createElement("span", null, "Oglas")), currentUser ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn icon",
    onClick: onOpenNotifs,
    "aria-label": "Obave\u0161tenja"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 17
  }), unreadNotifs > 0 && /*#__PURE__*/React.createElement("span", {
    className: "badge"
  }, unreadNotifs)), openNotifs && /*#__PURE__*/React.createElement(NotificationsPopover, {
    notifications: notifications || [],
    onMarkRead: onMarkRead,
    onNotifClick: onNotifClick
  })), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: onOpenRazmene
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "swap",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, "Poruke"), unreadThreads > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--accent)',
      color: '#fff',
      fontSize: 10,
      fontWeight: 700,
      padding: '1px 6px',
      borderRadius: 8,
      fontFamily: 'var(--font-mono)'
    }
  }, unreadThreads)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    },
    ref: userRef
  }, /*#__PURE__*/React.createElement("button", {
    className: "user-chip",
    onClick: onOpenUser
  }, /*#__PURE__*/React.createElement("span", {
    className: "avatar"
  }, initials), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, displayName), /*#__PURE__*/React.createElement(Icon, {
    name: "caret",
    size: 11,
    className: "caret"
  })), openUser && /*#__PURE__*/React.createElement("div", {
    className: "menu",
    role: "menu"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px 8px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 13.5
    }
  }, currentUser.username), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      marginTop: 1
    }
  }, currentUser.email)), /*#__PURE__*/React.createElement("div", {
    className: "item",
    onClick: () => {
      onNav && onNav('my-listings');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tag",
    size: 15
  }), " Moji oglasi"), /*#__PURE__*/React.createElement("div", {
    className: "item",
    onClick: () => {
      onNav && onNav('saved');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "heart",
    size: 15
  }), " Sa\u010Duvano"), /*#__PURE__*/React.createElement("div", {
    className: "item",
    onClick: () => {
      onNav && onNav('ratings');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 15
  }), " Ocene i istorija"), /*#__PURE__*/React.createElement("div", {
    className: "item",
    onClick: () => {
      onNav && onNav('settings');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sliders",
    size: 15
  }), " Pode\u0161avanja"), /*#__PURE__*/React.createElement("div", {
    className: "sep"
  }), /*#__PURE__*/React.createElement("div", {
    className: "item danger",
    onClick: onLogout
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "logout",
    size: 15
  }), " Odjava")))) : /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: onLogin,
    style: {
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, "Prijava"))), /*#__PURE__*/React.createElement("div", {
    className: "nav-actions-mobile"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn icon",
    onClick: () => setBurgerOpen(true),
    style: {
      position: 'relative',
      width: 40,
      height: 40
    },
    "aria-label": "Meni"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "menu",
    size: 22
  }), totalBadge > 0 && /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      top: 4,
      right: 4
    }
  }, totalBadge > 9 ? '9+' : totalBadge)))), burgerOpen && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,.5)'
    },
    onClick: closeBurger
  }, /*#__PURE__*/React.createElement("div", {
    className: "mobile-drawer",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px',
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, currentUser ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "avatar",
    style: {
      width: 38,
      height: 38,
      fontSize: 14
    }
  }, initials), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--ink)'
    }
  }, displayName), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ink-3)',
      marginTop: 1
    }
  }, currentUser.email))) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 16,
      color: 'var(--ink)'
    }
  }, "Meni"), /*#__PURE__*/React.createElement("button", {
    onClick: closeBurger,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--ink-3)',
      display: 'grid',
      placeItems: 'center',
      padding: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 22
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      closeBurger();
      onPostAd && onPostAd();
    },
    style: {
      width: '100%',
      padding: '13px 0',
      background: 'var(--accent)',
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      fontWeight: 700,
      fontSize: 15,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 18,
    stroke: 2.5
  }), "Postavi oglas")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, currentUser ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "drawer-item",
    onClick: () => {
      closeBurger();
      onOpenNotifs && onOpenNotifs();
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Obave\u0161tenja")), unreadNotifs > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--accent)',
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 10,
      fontFamily: 'var(--font-mono)'
    }
  }, unreadNotifs)), /*#__PURE__*/React.createElement("div", {
    className: "drawer-item",
    onClick: () => {
      closeBurger();
      onOpenRazmene && onOpenRazmene();
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "swap",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Poruke")), unreadThreads > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--accent)',
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 10,
      fontFamily: 'var(--font-mono)'
    }
  }, unreadThreads)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--line)',
      margin: '6px 20px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "drawer-item",
    onClick: () => burgerNav('my-listings')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tag",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Moji oglasi"))), /*#__PURE__*/React.createElement("div", {
    className: "drawer-item",
    onClick: () => burgerNav('saved')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "heart",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Sa\u010Duvano"))), /*#__PURE__*/React.createElement("div", {
    className: "drawer-item",
    onClick: () => burgerNav('ratings')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Ocene i istorija"))), /*#__PURE__*/React.createElement("div", {
    className: "drawer-item",
    onClick: () => burgerNav('settings')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sliders",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Pode\u0161avanja"))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--line)',
      margin: '6px 20px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "drawer-item danger",
    onClick: () => {
      closeBurger();
      onLogout && onLogout();
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "logout",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Odjava")))) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      closeBurger();
      onLogin && onLogin();
    },
    style: {
      width: '100%',
      padding: '13px 0',
      background: 'var(--accent)',
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      fontWeight: 700,
      fontSize: 15,
      cursor: 'pointer'
    }
  }, "Prijava"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      closeBurger();
      onLogin && onLogin();
    },
    style: {
      width: '100%',
      padding: '13px 0',
      background: 'transparent',
      color: 'var(--ink)',
      border: '1.5px solid var(--line)',
      borderRadius: 10,
      fontWeight: 600,
      fontSize: 15,
      cursor: 'pointer'
    }
  }, "Registracija"))))), document.body));
}

/* ─── NOTIFICATIONS POPOVER ──────────────────── */
function NotificationsPopover({
  notifications = [],
  onMarkRead,
  onNotifClick
}) {
  const fmtTime = iso => {
    if (!iso) return '';
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return 'upravo';
    if (diff < 3600) return Math.floor(diff / 60) + ' min';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    return Math.floor(diff / 86400) + 'd';
  };
  const typeIcon = type => {
    if (type === 'offer' || type === 'offer_accepted' || type === 'offer_declined') return 'swap';
    if (type === 'message') return 'msg';
    return 'bell';
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "pop",
    role: "dialog",
    "aria-label": "Obave\u0161tenja"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("h4", null, "Obave\u0161tenja"), notifications.some(n => !n.is_read) && /*#__PURE__*/React.createElement("button", {
    onClick: onMarkRead
  }, "Ozna\u010Di sve kao pro\u010Ditano")), /*#__PURE__*/React.createElement("div", {
    className: "pl"
  }, notifications.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '32px 16px',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 13
    }
  }, "Nema novih obave\u0161tenja") : notifications.map(n => /*#__PURE__*/React.createElement("div", {
    key: n.id,
    className: 'notif' + (!n.is_read ? ' unread' : ''),
    onClick: () => onNotifClick && onNotifClick(n),
    style: {
      cursor: onNotifClick ? 'pointer' : 'default'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ni"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: typeIcon(n.type),
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nt"
  }, n.text), /*#__PURE__*/React.createElement("div", {
    className: "ntime"
  }, fmtTime(n.created_at)))))));
}

/* ─── NOTIFICATIONS DRAWER (mobile) ─────────────── */
function NotificationsDrawer({
  notifications = [],
  onClose,
  onMarkRead,
  onNotifClick
}) {
  const fmtTime = iso => {
    if (!iso) return '';
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return 'upravo';
    if (diff < 3600) return Math.floor(diff / 60) + ' min';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    return Math.floor(diff / 86400) + 'd';
  };
  const typeIcon = type => {
    if (type === 'offer' || type === 'offer_accepted' || type === 'offer_declined') return 'swap';
    if (type === 'message') return 'msg';
    return 'bell';
  };
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,.5)'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInRight .22s cubic-bezier(.22,.61,.36,1) both'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px',
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 17,
      color: 'var(--ink)'
    }
  }, "Obave\u0161tenja"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, notifications.some(n => !n.is_read) && /*#__PURE__*/React.createElement("button", {
    onClick: onMarkRead,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: 13,
      color: 'var(--accent)',
      fontWeight: 600,
      padding: 0
    }
  }, "Sve pro\u010Ditano"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--ink-3)',
      display: 'grid',
      placeItems: 'center',
      padding: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 22
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, notifications.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '60px 20px',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 14
    }
  }, "Nema novih obave\u0161tenja") : notifications.map(n => /*#__PURE__*/React.createElement("div", {
    key: n.id,
    onClick: () => onNotifClick && onNotifClick(n),
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      padding: '16px 20px',
      borderBottom: '1px solid var(--line)',
      background: n.is_read ? 'transparent' : 'var(--accent-soft)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: n.is_read ? 'var(--line)' : 'var(--accent-soft)',
      border: n.is_read ? 'none' : '1.5px solid var(--accent)',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: typeIcon(n.type),
    size: 16,
    style: {
      color: n.is_read ? 'var(--ink-3)' : 'var(--accent)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--ink)',
      fontWeight: n.is_read ? 400 : 600,
      lineHeight: 1.4
    }
  }, n.text), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      marginTop: 4
    }
  }, fmtTime(n.created_at))), !n.is_read && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: 'var(--accent)',
      flexShrink: 0,
      marginTop: 4
    }
  })))))), document.body);
}

/* ─── HERO ─────────────────────────────────────── */
function Hero({
  layout,
  accent,
  onSearch,
  onPostAd,
  onCityChange,
  pendingOffers = [],
  onOfferRespond
}) {
  const [q, setQ] = useState('');
  const [mode, setMode] = useState('find');
  const [city, setCity] = useState('');
  const [radius, setRadius] = useState(10);
  const [showPicker, setShowPicker] = useState(false);
  const locRef = useRef(null);
  useEffect(() => {
    const handler = e => {
      if (locRef.current && !locRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const cityLabel = city ? city + ' · ' + radius + ' km' : 'Cela Srbija';
  const applyLocation = (c, r) => {
    onCityChange && onCityChange(c, r);
    setShowPicker(false);
  };
  const handleSubmit = e => {
    e.preventDefault();
    onCityChange && onCityChange(city, radius);
    onSearch(q, mode);
  };
  return /*#__PURE__*/React.createElement("section", {
    className: 'hero layout-' + layout
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-inner"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Daj \u0161to ne ", /*#__PURE__*/React.createElement("em", null, "koristi\u0161"), ".", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "amp"
  }, "\u2014"), " Uzmi \u0161to ti ", /*#__PURE__*/React.createElement("em", null, "treba"), "."), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, "Pove\u017Ei se sa ljudima na druga\u010Diji na\u010Din. Razmeni, kupi ili prodaj predmete \u2014 bez agencija, bez naknada, bez komplikacija."), /*#__PURE__*/React.createElement("div", {
    className: "search-tabs"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'search-tab' + (mode === 'find' ? ' active' : ''),
    onClick: () => setMode('find')
  }, "Tra\u017Eim predmet"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'search-tab' + (mode === 'offer' ? ' active' : ''),
    onClick: () => setMode('offer')
  }, "Nudim za zamenu")), /*#__PURE__*/React.createElement("form", {
    className: "hero-search",
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 18,
    stroke: 1.8
  }), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: mode === 'find' ? 'Koji predmet tražite?' : 'Šta nudite za zamenu?'
  })), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "loc",
    ref: locRef,
    style: {
      position: 'relative',
      cursor: 'pointer',
      userSelect: 'none'
    },
    onClick: () => setShowPicker(p => !p)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pin",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, cityLabel), /*#__PURE__*/React.createElement(Icon, {
    name: "caret",
    size: 11,
    style: {
      color: 'var(--ink-3)'
    }
  }), showPicker && /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 'calc(100% + 10px)',
      left: 0,
      background: 'var(--bg, #fff)',
      border: '1px solid var(--line, #e5e7eb)',
      borderRadius: 12,
      padding: 16,
      minWidth: 230,
      boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
      zIndex: 200
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.06em',
      color: 'var(--ink-3)',
      marginBottom: 6,
      textTransform: 'uppercase'
    }
  }, "Grad"), /*#__PURE__*/React.createElement("select", {
    value: city,
    onChange: e => setCity(e.target.value),
    style: {
      width: '100%',
      padding: '8px 10px',
      borderRadius: 8,
      border: '1px solid var(--line, #e5e7eb)',
      fontSize: 14,
      color: 'var(--ink-1)',
      background: 'var(--bg, #fff)',
      cursor: 'pointer',
      outline: 'none'
    }
  }, SERBIAN_CITIES.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.name)))), city && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.06em',
      color: 'var(--ink-3)',
      marginBottom: 8,
      textTransform: 'uppercase'
    }
  }, "Razdaljina"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, [5, 10, 25, 50].map(r => /*#__PURE__*/React.createElement("button", {
    key: r,
    type: "button",
    onClick: () => setRadius(r),
    style: {
      flex: 1,
      padding: '7px 4px',
      borderRadius: 8,
      border: '1.5px solid ' + (radius === r ? 'var(--accent)' : 'var(--line, #e5e7eb)'),
      background: radius === r ? 'var(--accent)' : 'transparent',
      color: radius === r ? '#fff' : 'var(--ink-1)',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all .15s'
    }
  }, r, " km")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, city && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setCity('');
      applyLocation('', radius);
    },
    style: {
      flex: 1,
      padding: '8px',
      borderRadius: 8,
      border: '1px solid var(--line)',
      background: 'transparent',
      color: 'var(--ink-2)',
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer'
    }
  }, "Resetuj"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => applyLocation(city, radius),
    style: {
      flex: 2,
      padding: '8px',
      borderRadius: 8,
      background: 'var(--accent)',
      color: '#fff',
      border: 'none',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "Primeni")))), /*#__PURE__*/React.createElement("button", {
    className: "go",
    type: "submit"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 15,
    stroke: 2.2
  }), " Pretra\u017Ei")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '10px 0 0',
      fontSize: 13,
      color: 'var(--ink-3)',
      lineHeight: 1.5
    }
  }, "Prona\u0111i to \u0161to tra\u017Ei\u0161, ili osobu koja tra\u017Ei \u0161to ti nudi\u0161."), pendingOffers.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "hero-pending-strip"
  }, pendingOffers.slice(0, 3).map(o => /*#__PURE__*/React.createElement("div", {
    key: o.id,
    className: "hero-pending-item"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "swap",
    size: 15,
    style: {
      color: 'var(--accent)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "hero-pending-text"
  }, /*#__PURE__*/React.createElement("b", null, o.other_user), " \u017Eeli da zameni", o.listing ? /*#__PURE__*/React.createElement(React.Fragment, null, " tvoj oglas ", /*#__PURE__*/React.createElement("b", null, "\u201E", o.listing.title, "\"")) : '', o.offered_listing ? /*#__PURE__*/React.createElement(React.Fragment, null, " za ", /*#__PURE__*/React.createElement("b", null, "\u201E", o.offered_listing.title, "\"")) : ''), /*#__PURE__*/React.createElement("div", {
    className: "hero-pending-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "hero-pending-btn accept",
    onClick: () => onOfferRespond && onOfferRespond(o.id, 'accept')
  }, "Prihvati"), /*#__PURE__*/React.createElement("button", {
    className: "hero-pending-btn decline",
    onClick: () => onOfferRespond && onOfferRespond(o.id, 'decline')
  }, "Odbij")))))), layout === 'split' && /*#__PURE__*/React.createElement(HeroArt, {
    accent: accent
  })), layout === 'grid' && /*#__PURE__*/React.createElement("div", {
    className: "section-inner",
    style: {
      maxWidth: 1280,
      margin: '0 auto',
      padding: '0 24px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-grid-strip"
  }, [1, 2, 3, 4, 5, 6].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hgs"
  }, "slika ", i)))));
}

/* ─── TRUST STRIP ──────────────────────────────── */
function TrustStrip() {
  return /*#__PURE__*/React.createElement("div", {
    className: "trust"
  }, /*#__PURE__*/React.createElement("div", {
    className: "trust-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-i"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 16,
    style: {
      color: 'var(--accent)'
    }
  }), " ", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Verifikovani profili"), " \u2014 broj telefona obavezan")), /*#__PURE__*/React.createElement("div", {
    className: "t-i"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "leaf",
    size: 16,
    style: {
      color: 'var(--accent)'
    }
  }), " ", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "23.840 razmena"), " ostvareno ove godine")), /*#__PURE__*/React.createElement("div", {
    className: "t-i"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 16,
    style: {
      color: 'var(--accent)'
    }
  }), " ", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "4.8/5"), " prose\u010Dna ocena zajednice")), /*#__PURE__*/React.createElement("div", {
    className: "t-i"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pin",
    size: 16,
    style: {
      color: 'var(--accent)'
    }
  }), " ", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "72 grada"), " u Srbiji aktivno"))));
}

/* ─── CATEGORIES ─────────────────────────────────── */
function Categories({
  categories = [],
  onSelect
}) {
  const displayCats = categories.filter(c => c.id !== 'sve');
  const scrollRef = useRef(null);
  const scroll = function (dir) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir * 380,
      behavior: 'smooth'
    });
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Pregledaj po kategoriji"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, displayCats.reduce((s, c) => s + (c.count || 0), 0).toLocaleString(), " aktivnih oglasa danas.")), /*#__PURE__*/React.createElement("div", {
    className: "link",
    onClick: () => onSelect('sve')
  }, "Sve kategorije ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-r",
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "cat-arr cat-arr-l",
    onClick: () => scroll(-1),
    "aria-label": "Prethodno"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-r",
    size: 16,
    style: {
      transform: 'rotate(180deg)',
      display: 'block'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "cat-carousel",
    ref: scrollRef
  }, displayCats.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '32px 0',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 13,
      whiteSpace: 'nowrap'
    }
  }, "U\u010Ditavanje kategorija...") : displayCats.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    className: "cat-tile",
    onClick: () => onSelect(c.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "ic"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.icon || 'tag',
    size: 22,
    stroke: 1.5
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, c.name), /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, (c.count || 0).toLocaleString(), " oglasa"))))), /*#__PURE__*/React.createElement("button", {
    className: "cat-arr cat-arr-r",
    onClick: () => scroll(1),
    "aria-label": "Slede\u0107e"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-r",
    size: 16,
    style: {
      display: 'block'
    }
  })))));
}

/* ─── LISTING CARD ─────────────────────────────── */
function relTime(iso) {
  if (!iso) return '';
  var diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 3600) return Math.floor(diff / 60) + ' min';
  if (diff < 86400) return Math.floor(diff / 3600) + ' h';
  if (diff < 86400 * 30) return 'pre ' + Math.floor(diff / 86400) + ' d';
  return 'pre ' + Math.floor(diff / (86400 * 30)) + ' mj';
}
function ListingCard({
  item,
  fav,
  onFav,
  onClick,
  onOpenProfile
}) {
  const isBarter = item.type === 'barter' || item.type === 'both';
  const isPremium = item.is_premium || item.is_featured;
  return /*#__PURE__*/React.createElement("div", {
    className: "card",
    onClick: onClick
  }, /*#__PURE__*/React.createElement("div", {
    className: "img"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, item.images && item.images.length > 0 ? /*#__PURE__*/React.createElement("img", {
    src: item.images[0].url,
    alt: item.title,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    loading: "lazy"
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)',
      textAlign: 'center',
      padding: '0 8px'
    }
  }, item.catName || '📦')), /*#__PURE__*/React.createElement("div", {
    className: "badges"
  }, isPremium && /*#__PURE__*/React.createElement("span", {
    className: "b",
    style: {
      background: '#1a365d',
      color: '#fff',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      padding: '3px 7px',
      borderRadius: 5,
      fontWeight: 700,
      letterSpacing: '.05em'
    }
  }, "\u2605 PREMIUM"), isBarter && /*#__PURE__*/React.createElement("span", {
    className: "b barter"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "swap",
    size: 10,
    stroke: 2
  }), " Razmena")), /*#__PURE__*/React.createElement("button", {
    className: 'fav' + (fav ? ' on' : ''),
    onClick: e => {
      e.stopPropagation();
      onFav();
    },
    "aria-label": "Sa\u010Duvaj"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "heart",
    size: 15
  }))), /*#__PURE__*/React.createElement("div", {
    className: "body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "title"
  }, item.title), item.seek && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      fontStyle: 'italic',
      marginBottom: 2
    }
  }, "\u21B3 ", item.seek), /*#__PURE__*/React.createElement("div", {
    className: "price"
  }, /*#__PURE__*/React.createElement("span", {
    className: 'p' + (isBarter && !item.price ? ' barter' : '')
  }, item.price ? parseFloat(item.price).toLocaleString('sr-RS') + ' RSD' : 'Razmena')), /*#__PURE__*/React.createElement("div", {
    className: "meta",
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pin",
    size: 11
  }), " ", item.city), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-4)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11
    }
  }, relTime(item.created))), item.user && /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      e.stopPropagation();
      onOpenProfile && onOpenProfile(item.user);
    },
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      marginTop: 4,
      cursor: onOpenProfile ? 'pointer' : 'default'
    }
  }, item.user)));
}

/* ─── HOW IT WORKS ─────────────────────────────── */
function HowItWorks() {
  const steps = [{
    n: '01',
    t: 'Postavi oglas',
    p: 'Slikaj predmet, opiši ga i reci šta tražiš — razmenu, novac ili oboje. Gotovo za manje od minuta.'
  }, {
    n: '02',
    t: 'Razmeni poruke',
    p: 'Neko je zainteresovan — piše ti direktno. Bez posrednika, samo vi dvoje.'
  }, {
    n: '03',
    t: 'Završi razmenu',
    p: 'Dogovorite se, nađite se, razmenite. Ocenite jedno drugo i gradite poverenje u zajednici.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Kako funkcioni\u0161e"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Tri koraka. Bez pretplata, bez provizija."))), /*#__PURE__*/React.createElement("div", {
    className: "how"
  }, steps.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.n,
    className: "step"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, s.n), /*#__PURE__*/React.createElement("h3", null, s.t), /*#__PURE__*/React.createElement("p", null, s.p))))));
}

/* ─── FOOTER ───────────────────────────────────── */
const FOOT_CATEGORIES = [['Elektronika', 'elektronika'], ['Vozila', 'vozila'], ['Moda', 'moda'], ['Dom', 'dom'], ['Sport', 'sport'], ['Deca', 'deca'], ['Nekretnine', 'nekretnine'], ['Bela tehnika', 'bela-tehnika'], ['Hobi', 'hobi'], ['Ljubimci', 'ljubimci']];
const FOOT_CITIES = [['Beograd', 'beograd'], ['Novi Sad', 'novi-sad'], ['Niš', 'nis'], ['Kragujevac', 'kragujevac'], ['Subotica', 'subotica'], ['Čačak', 'cacak']];
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    className: "foot"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "foot-seo",
    "aria-label": "Kategorije i gradovi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "foot-col"
  }, /*#__PURE__*/React.createElement("h4", null, "Popularne kategorije"), /*#__PURE__*/React.createElement("div", {
    className: "foot-tags"
  }, FOOT_CATEGORIES.map(([name, slug]) => /*#__PURE__*/React.createElement("a", {
    key: slug,
    href: '/kategorija/' + slug + '/'
  }, name)))), /*#__PURE__*/React.createElement("div", {
    className: "foot-col"
  }, /*#__PURE__*/React.createElement("h4", null, "Pretraga po gradu"), /*#__PURE__*/React.createElement("div", {
    className: "foot-tags"
  }, FOOT_CITIES.map(([name, slug]) => /*#__PURE__*/React.createElement("a", {
    key: slug,
    href: '/grad/' + slug + '/'
  }, name))))), /*#__PURE__*/React.createElement("div", {
    className: "foot-inner"
  }, /*#__PURE__*/React.createElement("div", null, "\xA9 2026 Daj Zameni \xB7 Made in Serbia"), /*#__PURE__*/React.createElement("div", {
    className: "links"
  }, /*#__PURE__*/React.createElement("a", {
    href: "/o-nama/"
  }, "O nama"), /*#__PURE__*/React.createElement("a", {
    href: "/pravila/"
  }, "Pravila zajednice"), /*#__PURE__*/React.createElement("a", {
    href: "/privatnost/"
  }, "Privatnost"), /*#__PURE__*/React.createElement("a", {
    href: "/pomoc/"
  }, "Pomo\u0107"), /*#__PURE__*/React.createElement("a", null, "Kontakt"))));
}
Object.assign(window, {
  Nav,
  Hero,
  TrustStrip,
  Categories,
  ListingCard,
  HowItWorks,
  Footer,
  NotificationsPopover,
  NotificationsDrawer
});function HeroArt({
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
window.HeroArt = HeroArt;const {
  useState: useS,
  useEffect: useE,
  useRef: useR
} = React;

/* ─── CITY LIST ──────────────────────────────────── */
const CITIES = ['Ada', 'Aleksandrovac', 'Aleksinac', 'Alibunar', 'Apatin', 'Aranđelovac', 'Arilje', 'Bajina Bašta', 'Batočina', 'Bač', 'Bačka Palanka', 'Bačka Topola', 'Bela Palanka', 'Bela Crkva', 'Beograd', 'Beočin', 'Bečej', 'Blace', 'Bogatić', 'Bojnik', 'Boljevac', 'Bor', 'Bosilegrad', 'Brus', 'Bujanovac', 'Valjevo', 'Varvarin', 'Velika Plana', 'Veliko Gradište', 'Vladimirci', 'Vladičin Han', 'Vlasotince', 'Vranje', 'Vrbas', 'Vrnjačka Banja', 'Vršac', 'Gadžin Han', 'Golubac', 'Gornji Milanovac', 'Despotovac', 'Dimitrovgrad', 'Doljevac', 'Žabalj', 'Žabari', 'Žagubica', 'Žitište', 'Zaječar', 'Zrenjanin', 'Ivanjica', 'Inđija', 'Irig', 'Jagodina', 'Kanjiža', 'Kikinda', 'Kladovo', 'Knić', 'Knjaževac', 'Kovin', 'Koceljeva', 'Kosjerić', 'Kovačica', 'Kragujevac', 'Kraljevo', 'Kruševac', 'Kučevo', 'Kuršumlija', 'Lazarevac', 'Lapovo', 'Lebane', 'Leskovac', 'Ljig', 'Ljubovija', 'Majdanpek', 'Mali Zvornik', 'Mali Iđoš', 'Merošina', 'Mionica', 'Mladenovac', 'Negotin', 'Niš', 'Nova Crnja', 'Nova Varoš', 'Novi Bečej', 'Novi Kneževac', 'Novi Pazar', 'Novi Sad', 'Odžaci', 'Opovo', 'Pančevo', 'Paraćin', 'Petrovac na Mlavi', 'Pećinci', 'Pirot', 'Plandište', 'Požarevac', 'Požega', 'Predejane', 'Preševo', 'Priboj', 'Prijepolje', 'Prokuplje', 'Rača', 'Raška', 'Rekovac', 'Ruma', 'Senta', 'Sečanj', 'Sjenica', 'Smederevo', 'Smederevska Palanka', 'Sokobanja', 'Sombor', 'Srbobran', 'Sremska Mitrovica', 'Sremski Karlovci', 'Stara Pazova', 'Subotica', 'Surdulica', 'Svrljig', 'Temerin', 'Titel', 'Topola', 'Trgovište', 'Trstenik', 'Tutin', 'Ub', 'Užice', 'Ćićevac', 'Ćuprija', 'Čajetina', 'Čačak', 'Čoka', 'Šabac', 'Šid'];

/* ─── CITY PICKER ────────────────────────────────── */
function CityPicker({
  value,
  onChange,
  className,
  inputStyle
}) {
  var [q, setQ] = useS('');
  var [open, setOpen] = useS(false);
  var wrapRef = useR(null);
  useE(function () {
    if (!open) return;
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return function () {
      document.removeEventListener('mousedown', handler);
    };
  }, [open]);
  var ql = q.toLowerCase();
  var matches = ql ? CITIES.filter(function (c) {
    return c.toLowerCase().includes(ql);
  }) : CITIES;
  function select(city) {
    onChange(city);
    setQ('');
    setOpen(false);
  }
  return React.createElement('div', {
    ref: wrapRef,
    style: {
      position: 'relative'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      position: 'relative'
    }
  }, React.createElement('input', {
    className: className || 'input',
    style: Object.assign({
      width: '100%',
      boxSizing: 'border-box',
      paddingRight: 28
    }, inputStyle || {}),
    value: open ? q : value || '',
    placeholder: value || 'Izaberi grad...',
    onFocus: function () {
      setOpen(true);
      setQ('');
    },
    onChange: function (e) {
      setQ(e.target.value);
      if (!open) setOpen(true);
    },
    autoComplete: 'off'
  }), React.createElement('span', {
    style: {
      position: 'absolute',
      right: 8,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: 'var(--ink-3)',
      fontSize: 11
    }
  }, open ? '▲' : '▼')), open && React.createElement('div', {
    style: {
      position: 'absolute',
      zIndex: 999,
      top: 'calc(100% + 4px)',
      left: 0,
      right: 0,
      background: '#fff',
      border: '1px solid var(--line)',
      borderRadius: 10,
      boxShadow: '0 4px 20px rgba(0,0,0,.12)',
      maxHeight: 220,
      overflowY: 'auto'
    }
  }, matches.length === 0 ? React.createElement('div', {
    style: {
      padding: '10px 14px',
      fontSize: 13,
      color: 'var(--ink-3)'
    }
  }, 'Nema rezultata') : matches.map(function (city) {
    return React.createElement('div', {
      key: city,
      onMouseDown: function (e) {
        e.preventDefault();
        select(city);
      },
      style: {
        padding: '8px 14px',
        fontSize: 14,
        cursor: 'pointer',
        background: city === value ? 'var(--accent-soft)' : 'transparent',
        fontWeight: city === value ? 600 : 400,
        color: 'var(--ink)'
      },
      onMouseEnter: function (e) {
        e.currentTarget.style.background = 'var(--hover)';
      },
      onMouseLeave: function (e) {
        e.currentTarget.style.background = city === value ? 'var(--accent-soft)' : 'transparent';
      }
    }, city);
  })));
}

/* ─── CATEGORY PICKER MODAL ────────────────────── */
function CategoryPickerModal({
  categories,
  selected,
  onSelect,
  onClose
}) {
  var [q, setQ] = useS('');
  var [activeCat, setActiveCat] = useS(null);
  var [drillCat, setDrillCat] = useS(null);
  var inputRef = useR(null);
  var isMobile = window.innerWidth < 640;
  var displayCats = categories.filter(function (c) {
    return c.id !== 'sve';
  });
  useE(function () {
    if (inputRef.current) inputRef.current.focus();
    if (!isMobile && displayCats.length > 0) setActiveCat(displayCats[0]);
  }, []);
  var ql = q.toLowerCase();
  var searchResults = [];
  if (q) {
    displayCats.forEach(function (cat) {
      if (cat.name.toLowerCase().includes(ql)) {
        searchResults.push({
          type: 'cat',
          id: cat.id,
          name: cat.name,
          count: cat.count,
          parentName: null
        });
      }
      (cat.children || []).forEach(function (sub) {
        if (sub.name.toLowerCase().includes(ql)) {
          searchResults.push({
            type: 'sub',
            id: sub.id,
            name: sub.name,
            count: sub.count,
            parentName: cat.name
          });
        }
      });
    });
  }
  var handleKey = function (e) {
    if (e.key === 'Escape') {
      if (isMobile && drillCat) {
        setDrillCat(null);
        return;
      }
      onClose();
    }
  };
  var overlayStyle = isMobile ? {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.55)',
    zIndex: 1000
  } : {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.55)',
    zIndex: 1000,
    display: 'grid',
    placeItems: 'center',
    padding: 24
  };
  var panelStyle = isMobile ? {
    background: '#fff',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  } : {
    background: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 900,
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,.2)',
    overflow: 'hidden'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: overlayStyle,
    onClick: isMobile ? undefined : onClose,
    onKeyDown: handleKey
  }, /*#__PURE__*/React.createElement("div", {
    style: panelStyle,
    onClick: function (e) {
      e.stopPropagation();
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px',
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, isMobile && drillCat ? /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      setDrillCat(null);
    },
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--ink-3)',
      display: 'grid',
      placeItems: 'center',
      padding: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-l",
    size: 20
  })) : /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 18,
    style: {
      color: 'var(--ink-3)',
      flexShrink: 0
    }
  }), isMobile && drillCat ? /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontWeight: 700,
      fontSize: 16,
      color: 'var(--ink)'
    }
  }, drillCat.name) : /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    value: q,
    onChange: function (e) {
      setQ(e.target.value);
      if (isMobile) setDrillCat(null);
    },
    placeholder: "Pretra\u017Ei kategorije i podkategorije...",
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      fontSize: 15,
      color: 'var(--ink)',
      background: 'transparent'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--ink-3)',
      display: 'grid',
      placeItems: 'center',
      padding: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 20
  }))), q ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '8px 12px'
    }
  }, searchResults.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '40px 0',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 14
    }
  }, "Nema rezultata za \u201E", q, "\"") : searchResults.map(function (r) {
    var isSel = selected === r.id;
    return /*#__PURE__*/React.createElement("div", {
      key: r.type + r.id,
      onClick: function () {
        onSelect(r.id);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderRadius: 8,
        cursor: 'pointer',
        background: isSel ? 'var(--accent-soft)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 14,
        color: isSel ? 'var(--accent)' : 'var(--ink)'
      }
    }, r.name), r.parentName && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--ink-3)',
        fontFamily: 'var(--font-mono)',
        marginTop: 1
      }
    }, r.parentName)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--ink-3)',
        fontFamily: 'var(--font-mono)'
      }
    }, r.count || 0));
  }))

  /* Mobile drill-down view */ : isMobile ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, drillCat ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: function () {
      onSelect(drillCat.id);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 20px',
      borderBottom: '1px solid var(--line)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: 'var(--accent)'
    }
  }, "Sve u kategoriji ", drillCat.name), /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-r",
    size: 14,
    style: {
      color: 'var(--accent)'
    }
  })), !drillCat.children || drillCat.children.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '40px 0',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 14
    }
  }, "Nema podkategorija.") : drillCat.children.map(function (sub) {
    var isSel = selected === sub.id;
    return /*#__PURE__*/React.createElement("div", {
      key: sub.id,
      onClick: function () {
        onSelect(sub.id);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 20px',
        borderBottom: '1px solid var(--line)',
        cursor: 'pointer',
        background: isSel ? 'var(--accent-soft)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        color: isSel ? 'var(--accent)' : 'var(--ink)',
        fontWeight: isSel ? 600 : 400
      }
    }, sub.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: 'var(--ink-3)',
        fontFamily: 'var(--font-mono)'
      }
    }, sub.count || 0));
  })) : displayCats.map(function (cat) {
    var hasChildren = cat.children && cat.children.length > 0;
    return /*#__PURE__*/React.createElement("div", {
      key: cat.id,
      onClick: function () {
        hasChildren ? setDrillCat(cat) : onSelect(cat.id);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 20px',
        borderBottom: '1px solid var(--line)',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: cat.icon || 'tag',
      size: 20,
      stroke: 1.5,
      style: {
        color: 'var(--accent)',
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 500,
        color: 'var(--ink)'
      }
    }, cat.name), hasChildren && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--ink-3)',
        marginTop: 1
      }
    }, cat.children.length, " podkategorija"))), /*#__PURE__*/React.createElement(Icon, {
      name: hasChildren ? 'arrow-r' : 'check',
      size: 16,
      style: {
        color: selected === cat.id ? 'var(--accent)' : 'var(--ink-3)',
        flexShrink: 0
      }
    }));
  }))

  /* Desktop two-column view */ : /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: '220px 1fr',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRight: '1px solid var(--line)',
      overflowY: 'auto'
    }
  }, displayCats.map(function (cat) {
    var isAct = activeCat && activeCat.id === cat.id;
    return /*#__PURE__*/React.createElement("div", {
      key: cat.id,
      onClick: function () {
        setActiveCat(cat);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '11px 16px',
        cursor: 'pointer',
        background: isAct ? 'var(--accent-soft)' : 'transparent',
        color: isAct ? 'var(--accent)' : 'var(--ink)',
        fontWeight: isAct ? 700 : 500,
        fontSize: 14,
        borderLeft: isAct ? '3px solid var(--accent)' : '3px solid transparent'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: cat.icon || 'tag',
      size: 16,
      stroke: 1.5
    }), /*#__PURE__*/React.createElement("span", null, cat.name)), /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-r",
      size: 12,
      style: {
        color: 'var(--ink-3)'
      }
    }));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowY: 'auto',
      padding: '18px 20px'
    }
  }, activeCat ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 18,
      fontFamily: 'var(--font-display)',
      fontWeight: 700
    }
  }, activeCat.name), /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      onSelect(activeCat.id);
    },
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--accent)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, "Vidi sve u kategoriji ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-r",
    size: 13
  }))), !activeCat.children || activeCat.children.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-3)',
      padding: '20px 0'
    }
  }, "Nema podkategorija.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 2
    }
  }, activeCat.children.map(function (sub) {
    var isSel = selected === sub.id;
    return /*#__PURE__*/React.createElement("div", {
      key: sub.id,
      onClick: function () {
        onSelect(sub.id);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 12px',
        borderRadius: 8,
        cursor: 'pointer',
        background: isSel ? 'var(--accent-soft)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        color: isSel ? 'var(--accent)' : 'var(--ink)',
        fontWeight: isSel ? 600 : 400
      }
    }, sub.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--ink-3)',
        fontFamily: 'var(--font-mono)',
        marginLeft: 8,
        flexShrink: 0
      }
    }, sub.count || 0));
  }))) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '40px 0',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 14
    }
  }, "Izaberi kategoriju"))), !isMobile && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 20px',
      borderTop: '1px solid var(--line)',
      background: '#faf8f1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)'
    }
  }, "\u26A1 Brzi tip: kucaj naziv predmeta i predlo\u017Ei\u0107emo kategoriju"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--line)',
      padding: '2px 7px',
      borderRadius: 4,
      marginRight: 4
    }
  }, "Esc"), "za izlaz"))));
}

/* ─── LOGIN MODAL ──────────────────────────────── */
function LoginModal({
  onClose,
  onSuccess,
  onSwitchToRegister
}) {
  const [username, setUsername] = useS('');
  const [password, setPassword] = useS('');
  const [error, setError] = useS('');
  const [loading, setLoading] = useS(false);
  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await apiLogin(username, password);
    setLoading(false);
    if (res.ok) {
      onSuccess(res.user);
      onClose();
    } else setError(res.error || 'Greška pri prijavi.');
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "scrim",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation(),
    style: {
      maxWidth: 440
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mh"
  }, /*#__PURE__*/React.createElement("h3", null, "Prijava"), /*#__PURE__*/React.createElement("button", {
    className: "x-btn",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement("form", {
    className: "mb",
    onSubmit: submit
  }, error && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      background: '#fff0ee',
      border: '1px solid #fdc5bc',
      borderRadius: 8,
      fontSize: 13,
      color: 'var(--warn)',
      marginBottom: 14
    }
  }, error), /*#__PURE__*/React.createElement("a", {
    href: "/social/login/google-oauth2/",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      width: '100%',
      padding: '10px 16px',
      borderRadius: 10,
      border: '1.5px solid var(--line)',
      background: '#fff',
      color: 'var(--ink)',
      fontSize: 14,
      fontWeight: 600,
      textDecoration: 'none',
      cursor: 'pointer',
      marginBottom: 16,
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "#EA4335",
    d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#4285F4",
    d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#FBBC05",
    d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#34A853",
    d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "none",
    d: "M0 0h48v48H0z"
  })), "Nastavi sa Google"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--line)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)'
    }
  }, "ili"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--line)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Korisni\u010Dko ime"), /*#__PURE__*/React.createElement("input", {
    className: "input",
    value: username,
    onChange: e => setUsername(e.target.value),
    placeholder: "npr. marko_bg",
    autoFocus: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Lozinka"), /*#__PURE__*/React.createElement("input", {
    className: "input",
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  })), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    type: "submit",
    disabled: loading,
    style: {
      width: '100%',
      justifyContent: 'center',
      height: 42,
      fontSize: 15,
      marginTop: 6
    }
  }, loading ? 'Prijavljujem…' : 'Prijavi se'), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 13,
      color: 'var(--ink-3)',
      marginTop: 14
    }
  }, "Nema\u0161 nalog?", ' ', /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)',
      fontWeight: 600,
      cursor: 'pointer'
    },
    onClick: onSwitchToRegister
  }, "Registruj se")))));
}

/* ─── REGISTER MODAL ──────────────────────────────── */
function RegisterModal({
  onClose,
  onSuccess,
  onSwitchToLogin
}) {
  const [username, setUsername] = useS('');
  const [email, setEmail] = useS('');
  const [password, setPassword] = useS('');
  const [error, setError] = useS('');
  const [loading, setLoading] = useS(false);
  const [pending, setPending] = useS(false);
  const submit = async e => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Lozinka mora imati najmanje 8 karaktera.');
      return;
    }
    setLoading(true);
    const res = await apiRegister(username, email, password);
    setLoading(false);
    if (res.ok && res.pending_verification) {
      setPending(true);
      return;
    }
    if (res.ok) {
      onSuccess(res.user);
      onClose();
      return;
    }
    // Surface the first specific field error if backend returned one
    const firstFieldErr = res.username && res.username[0] || res.password && res.password[0] || res.email && res.email[0];
    setError(firstFieldErr || res.error || 'Greška pri registraciji.');
  };
  if (pending) {
    return /*#__PURE__*/React.createElement("div", {
      className: "scrim",
      onClick: onClose
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal",
      onClick: e => e.stopPropagation(),
      style: {
        maxWidth: 440
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "mh"
    }, /*#__PURE__*/React.createElement("h3", null, "Proveri inbox"), /*#__PURE__*/React.createElement("button", {
      className: "x-btn",
      onClick: onClose
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 16
    }))), /*#__PURE__*/React.createElement("div", {
      className: "mb",
      style: {
        textAlign: 'center',
        padding: '24px 8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 44,
        marginBottom: 12
      }
    }, "\uD83D\uDCEC"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 10,
        color: 'var(--ink)'
      }
    }, "Poslat ti je verifikacioni email."), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: 'var(--ink-3)',
        lineHeight: 1.55,
        marginBottom: 22
      }
    }, "Klikni na link u poruci da aktivira\u0161 nalog i da te ulogujemo. Ako ne vidi\u0161 email u inbox-u, proveri spam."), /*#__PURE__*/React.createElement("button", {
      className: "nav-btn primary",
      onClick: onClose,
      style: {
        width: '100%',
        justifyContent: 'center',
        height: 42,
        fontSize: 15
      }
    }, "U redu"))));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "scrim",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation(),
    style: {
      maxWidth: 440
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mh"
  }, /*#__PURE__*/React.createElement("h3", null, "Registracija"), /*#__PURE__*/React.createElement("button", {
    className: "x-btn",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement("form", {
    className: "mb",
    onSubmit: submit
  }, error && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      background: '#fff0ee',
      border: '1px solid #fdc5bc',
      borderRadius: 8,
      fontSize: 13,
      color: 'var(--warn)',
      marginBottom: 14
    }
  }, error), /*#__PURE__*/React.createElement("a", {
    href: "/social/login/google-oauth2/",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      width: '100%',
      padding: '10px 16px',
      borderRadius: 10,
      border: '1.5px solid var(--line)',
      background: '#fff',
      color: 'var(--ink)',
      fontSize: 14,
      fontWeight: 600,
      textDecoration: 'none',
      cursor: 'pointer',
      marginBottom: 16,
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "#EA4335",
    d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#4285F4",
    d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#FBBC05",
    d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#34A853",
    d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "none",
    d: "M0 0h48v48H0z"
  })), "Registruj se sa Google"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--line)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)'
    }
  }, "ili kreiraj nalog"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--line)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Korisni\u010Dko ime"), /*#__PURE__*/React.createElement("input", {
    className: "input",
    value: username,
    onChange: e => setUsername(e.target.value),
    placeholder: "npr. marko_bg",
    autoFocus: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "hint"
  }, "Bez razmaka, koristi\u0107e se javno.")), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Email"), /*#__PURE__*/React.createElement("input", {
    className: "input",
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "marko@email.com"
  })), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Lozinka"), /*#__PURE__*/React.createElement("input", {
    className: "input",
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    placeholder: "najmanje 8 karaktera"
  })), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    type: "submit",
    disabled: loading,
    style: {
      width: '100%',
      justifyContent: 'center',
      height: 42,
      fontSize: 15,
      marginTop: 6
    }
  }, loading ? 'Registrujem…' : 'Kreiraj nalog'), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 13,
      color: 'var(--ink-3)',
      marginTop: 14
    }
  }, "Ve\u0107 ima\u0161 nalog?", ' ', /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)',
      fontWeight: 600,
      cursor: 'pointer'
    },
    onClick: onSwitchToLogin
  }, "Prijavi se")))));
}

/* ─── OFFER MODAL ──────────────────────────────── */
function OfferModal({
  item,
  onClose,
  onSuccess
}) {
  const [myListings, setMyListings] = useS(null);
  const [selected, setSelected] = useS(null);
  const [cash, setCash] = useS('');
  const [msg, setMsg] = useS('');
  const [loading, setLoading] = useS(false);
  const [err, setErr] = useS('');
  useE(() => {
    apiMyListings().then(res => {
      if (Array.isArray(res.results)) setMyListings(res.results);else setMyListings([]);
    });
  }, []);
  const cashNum = parseFloat(cash.replace(/\./g, '').replace(',', '.')) || null;
  const isBarter = item.type === 'barter';
  const noListings = myListings !== null && myListings.length === 0;
  const submit = async () => {
    setLoading(true);
    setErr('');
    const offerCash = noListings ? item.price || null : cashNum;
    const res = await apiCreateOffer(item.id, selected ? selected.id : null, msg, offerCash);
    setLoading(false);
    if (res.ok) {
      onSuccess();
    } else if (res.error === 'already_offered') setErr('Već si poslao/la ponudu za ovaj oglas.');else if (res.error === 'barter_only') setErr('Korisnik ne želi otkup, samo razmenu.');else setErr(res.error || 'Greška pri slanju ponude.');
  };
  const condLabel = {
    new: 'Novo',
    like_new: 'Polovno — kao novo',
    good: 'Polovno — odlično',
    fair: 'Polovno — vrlo dobro',
    poor: 'Polovno — dobro',
    antique: 'Antikvitet'
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "scrim",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation(),
    style: {
      maxWidth: 560
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mh"
  }, /*#__PURE__*/React.createElement("h3", null, "Predlo\u017Ei razmenu"), /*#__PURE__*/React.createElement("button", {
    className: "x-btn",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mb"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--ink-3)',
      fontSize: 13,
      marginBottom: 16
    }
  }, "Nudite u zamenu za: ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--ink)'
    }
  }, item.title)), myListings === null ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '24px 0',
      color: 'var(--ink-3)',
      fontSize: 13
    }
  }, "U\u010Ditavam tvoje oglase\u2026") : noListings && isBarter ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 16px',
      background: '#fff8ee',
      border: '1px solid #f6d860',
      borderRadius: 12,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      marginBottom: 10
    }
  }, "\uD83D\uDD04"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 600,
      marginBottom: 6
    }
  }, "Korisnik ne \u017Eeli otkup, samo razmenu"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--ink-3)'
    }
  }, "Da bi predlo\u017Eio/la razmenu, postavi oglas i ponudi ga u zamenu.")) : noListings ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--ink-3)',
      marginBottom: 16
    }
  }, "Nema\u0161 aktivnih oglasa. Mo\u017Ee\u0161 poslati ponudu za otkup po ceni oglasa:"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      background: 'var(--accent-soft)',
      border: '1.5px solid var(--accent)',
      borderRadius: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--ink-2)'
    }
  }, "Cena oglasa"), /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 20,
      color: 'var(--accent)',
      fontFamily: 'var(--font-display)'
    }
  }, item.price ? Number(item.price).toLocaleString('sr-RS') + ' RSD' : 'Nije navedena')), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Poruka ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: 'var(--ink-3)'
    }
  }, "(opciono)")), /*#__PURE__*/React.createElement("textarea", {
    className: "textarea",
    value: msg,
    onChange: e => setMsg(e.target.value),
    placeholder: "Dodaj napomenu\u2026",
    rows: 2
  })), err && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      background: '#fff0ee',
      border: '1px solid #fdc5bc',
      borderRadius: 8,
      fontSize: 13,
      color: 'var(--warn)',
      marginTop: 8
    }
  }, err)) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)',
      letterSpacing: '.06em',
      marginBottom: 10
    }
  }, "IZABERI KOJI OGLAS NUDI\u0160"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      maxHeight: 280,
      overflowY: 'auto',
      marginBottom: 16
    }
  }, myListings.map(l => {
    const isSelected = selected?.id === l.id;
    return /*#__PURE__*/React.createElement("div", {
      key: l.id,
      onClick: () => setSelected(l),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 10,
        cursor: 'pointer',
        border: isSelected ? '2px solid var(--accent)' : '1.5px solid var(--line)',
        background: isSelected ? 'var(--accent-soft)' : '#fff',
        transition: 'all .15s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 48,
        height: 48,
        borderRadius: 8,
        flexShrink: 0,
        background: '#f0ede4',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center'
      }
    }, l.image ? /*#__PURE__*/React.createElement("img", {
      src: l.image,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20
      }
    }, "\uD83D\uDCE6")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 14,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, l.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--ink-3)',
        fontFamily: 'var(--font-mono)',
        marginTop: 2
      }
    }, condLabel[l.condition] || l.condition, " \xB7 ", l.city)), isSelected && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'var(--accent)',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 11,
      stroke: 2.5,
      style: {
        color: '#fff'
      }
    })));
  })), /*#__PURE__*/React.createElement("div", {
    className: "field-group",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", null, "Nov\u010Dana doplata uz oglas ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: 'var(--ink-3)'
    }
  }, "(opciono)")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "input",
    type: "number",
    min: "0",
    step: "100",
    value: cash,
    onChange: e => setCash(e.target.value),
    placeholder: "npr. 2000",
    style: {
      paddingRight: 48
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: 13,
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)',
      pointerEvents: 'none'
    }
  }, "RSD")), cashNum > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      marginTop: 4
    }
  }, "Nudi\u0161: ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--accent)'
    }
  }, cashNum.toLocaleString('sr-RS'), " RSD"), " + izabrani oglas")), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Poruka ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: 'var(--ink-3)'
    }
  }, "(opciono)")), /*#__PURE__*/React.createElement("textarea", {
    className: "textarea",
    value: msg,
    onChange: e => setMsg(e.target.value),
    placeholder: "Dodaj kratku napomenu uz ponudu\u2026",
    rows: 2
  })), err && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      background: '#fff0ee',
      border: '1px solid #fdc5bc',
      borderRadius: 8,
      fontSize: 13,
      color: 'var(--warn)',
      marginTop: 8
    }
  }, err))), myListings !== null && !isBarter && noListings && /*#__PURE__*/React.createElement("div", {
    className: "mf"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: onClose,
    disabled: loading
  }, "Odustani"), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: submit,
    disabled: loading || !item.price
  }, loading ? 'Šalje se…' : '💸 Pošalji ponudu')), myListings !== null && myListings.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "mf"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: onClose,
    disabled: loading
  }, "Odustani"), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: submit,
    disabled: loading || !selected
  }, loading ? 'Šalje se…' : '🔄 Pošalji ponudu'))));
}

/* ─── LISTING MINI (za prikaz u chat karticama) ──── */
function ListingMini({
  listing
}) {
  if (!listing) return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 90,
      height: 90,
      borderRadius: 10,
      background: '#f0ede4',
      display: 'grid',
      placeItems: 'center',
      fontSize: 24
    }
  }, "\uD83D\uDCE6");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 90,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 90,
      height: 90,
      borderRadius: 10,
      overflow: 'hidden',
      background: '#f0ede4',
      display: 'grid',
      placeItems: 'center',
      marginBottom: 6
    }
  }, listing.image ? /*#__PURE__*/React.createElement("img", {
    src: listing.image,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28
    }
  }, "\uD83D\uDCE6")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      lineHeight: 1.3,
      color: 'var(--ink)',
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical'
    }
  }, listing.title), listing.city && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)',
      marginTop: 2
    }
  }, listing.city));
}
function OfferCard({
  msg,
  who,
  currentUserId,
  onOfferAction,
  isReviewed
}) {
  const {
    offer,
    body
  } = msg;
  const [acting, setActing] = useS(null);
  const statusColor = {
    accepted: 'var(--good)',
    declined: '#e53e3e',
    pending: 'var(--ink-3)',
    completed: 'var(--good)'
  };
  const statusLabel = {
    accepted: '✓ Prihvaćeno',
    declined: '✗ Odbijeno',
    pending: '⏳ Na čekanju',
    completed: '✓ Završeno'
  };
  const me = who === 'me';
  const isRecipient = currentUserId && offer.to_user_id === currentUserId;
  const isSender = currentUserId && offer.from_user_id === currentUserId;
  const myConfirmed = isSender ? offer.completed_by_from : isRecipient ? offer.completed_by_to : false;
  const otherConfirmed = isSender ? offer.completed_by_to : isRecipient ? offer.completed_by_from : false;
  const canRespond = offer.status === 'pending' && isRecipient;
  const canComplete = offer.status === 'accepted' && (isSender || isRecipient) && !myConfirmed;
  const canReview = offer.status === 'completed' && (isSender || isRecipient) && !isReviewed;
  const doAct = async function (action) {
    setActing(action);
    var res;
    if (action === 'accept') res = await apiRespondToOffer(offer.id, 'accept');
    if (action === 'decline') res = await apiRespondToOffer(offer.id, 'decline');
    if (action === 'complete') res = await apiCompleteOffer(offer.id);
    setActing(null);
    if (res && res.ok && onOfferAction) onOfferAction(action, res);
  };
  const openListing = () => {
    const id = me ? offer.target_listing?.id : offer.offered_listing?.id;
    if (!id) return;
    const detail = {
      id
    };
    if (!me && offer.status === 'pending') {
      detail.offer = offer;
      detail.senderUsername = msg.sender;
    }
    window.dispatchEvent(new CustomEvent('dj:viewListing', {
      detail
    }));
  };
  const linkId = me ? offer.target_listing?.id : offer.offered_listing?.id;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      alignSelf: me ? 'flex-end' : 'flex-start',
      maxWidth: '88%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1.5px solid var(--line)',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '7px 14px',
      background: 'var(--accent-soft)',
      borderBottom: '1px solid var(--line)',
      fontSize: 10,
      fontWeight: 700,
      fontFamily: 'var(--font-mono)',
      letterSpacing: '.07em',
      color: 'var(--accent)'
    }
  }, "\uD83D\uDD04 PREDLOG RAZMENE"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement(ListingMini, {
    listing: offer.offered_listing
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      color: 'var(--ink-3)',
      flexShrink: 0
    }
  }, "\u21C4"), /*#__PURE__*/React.createElement(ListingMini, {
    listing: offer.target_listing
  })), offer.cash_offer > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 8px',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-3)'
    }
  }, "+ doplata:"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: 'var(--accent)',
      fontFamily: 'var(--font-mono)'
    }
  }, offer.cash_offer.toLocaleString('sr-RS'), " RSD")), body ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 10px',
      fontSize: 13,
      color: 'var(--ink-2)',
      fontStyle: 'italic'
    }
  }, "\u201E", body, "\"") : null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 16px 10px',
      borderTop: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: statusColor[offer.status] || 'var(--ink-3)'
    }
  }, statusLabel[offer.status] || offer.status), linkId && /*#__PURE__*/React.createElement("button", {
    onClick: openListing,
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--accent)',
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      letterSpacing: '.04em',
      whiteSpace: 'nowrap'
    }
  }, "Pogledaj oglas \u2197")), offer.status === 'accepted' && otherConfirmed && !myConfirmed && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 6px',
      fontSize: 12,
      color: '#b7791f',
      fontStyle: 'italic'
    }
  }, "Druga strana je potvrdila \u2014 \u010Deka se tvoja potvrda."), (canRespond || canComplete || canReview) && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 14px',
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, canRespond && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: () => doAct('accept'),
    disabled: !!acting,
    style: {
      fontSize: 12
    }
  }, acting === 'accept' ? '…' : '✓ Prihvati'), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: () => doAct('decline'),
    disabled: !!acting,
    style: {
      fontSize: 12,
      color: 'var(--warn)',
      borderColor: 'var(--warn)'
    }
  }, acting === 'decline' ? '…' : '✗ Odbij')), canComplete && /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: () => doAct('complete'),
    disabled: !!acting,
    style: {
      fontSize: 12
    }
  }, acting === 'complete' ? '…' : '✓ Potvrdi razmenu'), canReview && /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: () => onOfferAction && onOfferAction('review', {
      offerId: offer.id
    }),
    style: {
      fontSize: 12,
      color: '#b7791f',
      borderColor: '#b7791f'
    }
  }, "\u2605 Ostavi ocenu"))));
}

/* ─── SAVED SCREEN ──────────────────────────────── */
function SavedScreen({
  onOpenItem,
  onPostAd
}) {
  const [listings, setListings] = useS(null);
  useE(() => {
    apiWishlist().then(function (res) {
      setListings(Array.isArray(res.results) ? res.results : []);
    });
  }, []);
  var normalized = listings ? listings.map(function (l) {
    return {
      id: l.id,
      title: l.title,
      price: l.price,
      type: l.listing_type,
      condition: l.condition,
      status: l.status,
      city: l.city,
      views: l.views,
      cat: l.category ? l.category.slug : '',
      catName: l.category ? l.category.name : '',
      user: l.user ? l.user.username : '',
      rating: l.user ? l.user.rating : 0,
      seek: l.wants_in_exchange || '',
      created: l.created_at,
      images: l.images || [],
      desc: l.description || ''
    };
  }) : [];
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    style: {
      paddingTop: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Sa\u010Duvani oglasi"), listings !== null && /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, normalized.length, " ", normalized.length === 1 ? 'oglas' : normalized.length < 5 ? 'oglasa' : 'oglasa'))), listings === null ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '48px 0',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 14
    }
  }, "U\u010Ditavam\u2026") : normalized.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '60px 20px',
      textAlign: 'center',
      color: 'var(--ink-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 14
    }
  }, "\uD83E\uDD0D"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      color: 'var(--ink-2)',
      marginBottom: 6,
      fontFamily: 'var(--font-display)'
    }
  }, "Jo\u0161 nisi sa\u010Duvao/la nijedan oglas"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      marginBottom: 20
    }
  }, "Klikni srce na oglasu da ga sa\u010Duva\u0161 za kasnije."), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: onPostAd
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 14
  }), " Postavi oglas")) : /*#__PURE__*/React.createElement("div", {
    className: "list-grid"
  }, normalized.map(function (l) {
    return /*#__PURE__*/React.createElement(ListingCard, {
      key: l.id,
      item: l,
      fav: true,
      onFav: function () {},
      onClick: function () {
        onOpenItem(l);
      }
    });
  }))));
}

/* ─── REPORT MODAL ──────────────────────────────── */
const REPORT_REASONS = [{
  value: 'spam',
  label: 'Spam ili prevara'
}, {
  value: 'inappropriate',
  label: 'Neprikladni sadržaj'
}, {
  value: 'duplicate',
  label: 'Duplikat oglasa'
}, {
  value: 'wrong_category',
  label: 'Pogrešna kategorija'
}, {
  value: 'other',
  label: 'Ostalo'
}];
function ReportModal({
  item,
  onClose
}) {
  const [reason, setReason] = useS('spam');
  const [details, setDetails] = useS('');
  const [loading, setLoading] = useS(false);
  const [done, setDone] = useS(false);
  const submit = async () => {
    setLoading(true);
    try {
      await apiReportListing(item.id, reason, details);
    } catch (e) {}
    setDone(true);
    setLoading(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "scrim",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation(),
    style: {
      maxWidth: 420
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mh"
  }, /*#__PURE__*/React.createElement("h3", null, "Prijavi oglas"), /*#__PURE__*/React.createElement("button", {
    className: "x-btn",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }))), done ? /*#__PURE__*/React.createElement("div", {
    className: "mb",
    style: {
      textAlign: 'center',
      padding: '32px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: 'var(--accent-soft)',
      color: 'var(--accent)',
      display: 'grid',
      placeItems: 'center',
      margin: '0 auto 16px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 28,
    stroke: 2.4
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 600,
      marginBottom: 6
    }
  }, "Hvala! Prijava je primljena."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--ink-3)',
      fontSize: 13,
      marginBottom: 20
    }
  }, "Pregleda\u0107emo oglas i preduzeti odgovaraju\u0107e mere."), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: onClose
  }, "Zatvori")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "mb"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--ink-3)',
      fontSize: 13,
      marginBottom: 12
    }
  }, "Razlog prijave:"), REPORT_REASONS.map(r => /*#__PURE__*/React.createElement("label", {
    key: r.value,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10,
      cursor: 'pointer',
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "report_reason",
    value: r.value,
    checked: reason === r.value,
    onChange: () => setReason(r.value)
  }), r.label)), reason === 'other' && /*#__PURE__*/React.createElement("div", {
    className: "field-group",
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    className: "textarea",
    value: details,
    onChange: e => setDetails(e.target.value),
    placeholder: "Opi\u0161ite problem\u2026",
    rows: 3
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mf"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: onClose,
    disabled: loading
  }, "Odustani"), /*#__PURE__*/React.createElement("button", {
    onClick: submit,
    disabled: loading,
    style: {
      padding: '8px 18px',
      borderRadius: 10,
      border: 'none',
      background: '#e53e3e',
      color: '#fff',
      fontWeight: 600,
      fontSize: 14,
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? .7 : 1
    }
  }, loading ? 'Šalje se…' : '⚑ Prijavi')))));
}

/* ─── LISTING DETAIL ──────────────────────────────── */
function ListingDetail({
  item,
  onBack,
  onMessage,
  onEdit,
  onDelete,
  categories = [],
  currentUser = null,
  onLogin = null,
  pendingOffer = null,
  onOfferRespond = null,
  isSaved = false,
  onSaveToggle = null,
  onOpenProfile = null
}) {
  const [active, setActive] = useS(0);
  const [lightbox, setLightbox] = useS(false);
  const [statsOpen, setStatsOpen] = useS(false);
  const [saved, setSaved] = useS(isSaved);
  const [savePending, setSavePending] = useS(false);
  const [fullItem, setFullItem] = useS(item);
  useE(() => {
    apiListingDetail(item.id).then(res => {
      if (res.ok !== false) {
        setFullItem({
          ...item,
          desc: res.description || item.desc || '',
          seek: res.wants_in_exchange || item.seek || '',
          images: res.images && res.images.length > 0 ? res.images.map(img => ({
            url: img.url,
            is_cover: img.is_cover
          })) : item.images,
          views: res.views ?? item.views,
          saves: res.saves ?? item.saves ?? null
        });
      }
    }).catch(() => {});
  }, [item.id]);
  const [offerSent, setOfferSent] = useS(false);
  const [showOffer, setShowOffer] = useS(false);
  const [showReport, setShowReport] = useS(false);
  const [respondDone, setRespondDone] = useS(null);
  const [respondLoading, setRespondLoading] = useS(false);
  const thumbs = fullItem.images && fullItem.images.length > 0 ? fullItem.images : [null, null, null, null];
  const catName = (categories.find(c => c.id === fullItem.cat) || {}).name || fullItem.catName || 'Kategorija';
  const isBarter = fullItem.type === 'barter' || fullItem.type === 'both';
  const isNew = fullItem.condition === 'new' || fullItem.condition === 'like_new';
  const priceNum = fullItem.price ? parseFloat(fullItem.price) : null;
  const isOwner = currentUser && currentUser.username === fullItem.user;
  const conditionLabel = {
    new: 'Novo',
    like_new: 'Polovno — kao novo',
    good: 'Polovno — odlično',
    fair: 'Polovno — vrlo dobro',
    poor: 'Polovno — dobro',
    antique: 'Antikvitet'
  }[fullItem.condition] || fullItem.condition;
  const handleMessage = () => {
    if (!currentUser) {
      onLogin?.();
      return;
    }
    onMessage?.();
  };
  const handleOffer = () => {
    if (!currentUser) {
      onLogin?.();
      return;
    }
    setShowOffer(true);
  };
  const handleSave = async () => {
    if (!currentUser) {
      onLogin && onLogin();
      return;
    }
    if (savePending) return;
    setSavePending(true);
    try {
      const res = await apiToggleWishlist(item.id);
      setSaved(res.saved);
      if (onSaveToggle) onSaveToggle(item.id, res.saved);
    } catch (e) {}
    setSavePending(false);
  };
  const handleReport = () => {
    if (!currentUser) {
      onLogin?.();
      return;
    }
    setShowReport(true);
  };
  const handleRespond = async action => {
    if (!pendingOffer || respondLoading) return;
    setRespondLoading(true);
    try {
      await onOfferRespond(pendingOffer.offer.id, action);
      setRespondDone(action === 'accept' ? 'accepted' : 'declined');
    } catch (e) {}
    setRespondLoading(false);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, pendingOffer && /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '0 24px',
      marginBottom: 4
    }
  }, respondDone ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      borderRadius: 12,
      background: respondDone === 'accepted' ? '#f0fff4' : '#fff5f5',
      border: '1.5px solid ' + (respondDone === 'accepted' ? 'var(--good)' : '#e53e3e'),
      fontSize: 14,
      fontWeight: 600,
      color: respondDone === 'accepted' ? 'var(--good)' : '#e53e3e'
    }
  }, respondDone === 'accepted' ? '✓ Razmena prihvaćena!' : '✗ Razmena odbijena.') : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      borderRadius: 12,
      background: 'var(--accent-soft)',
      border: '1.5px solid var(--accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--accent)',
      fontFamily: 'var(--font-mono)',
      letterSpacing: '.06em',
      marginBottom: 4
    }
  }, "\uD83D\uDD04 PREDLOG RAZMENE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement("b", null, pendingOffer.senderUsername), " nudi", ' ', /*#__PURE__*/React.createElement("b", null, "\u201E", pendingOffer.offer.offered_listing ? pendingOffer.offer.offered_listing.title : 'oglas', "\""), ' ', "u zamenu za tvoj oglas")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: () => handleRespond('decline'),
    disabled: respondLoading,
    style: {
      color: '#e53e3e',
      borderColor: '#e53e3e'
    }
  }, "\u2717 Odbij"), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: () => handleRespond('accept'),
    disabled: respondLoading
  }, respondLoading ? '…' : '✓ Prihvati')))), /*#__PURE__*/React.createElement("div", {
    className: "breadcrumb"
  }, /*#__PURE__*/React.createElement("a", {
    onClick: onBack
  }, "Po\u010Detna"), /*#__PURE__*/React.createElement("span", null, "/"), /*#__PURE__*/React.createElement("a", {
    onClick: onBack
  }, catName), /*#__PURE__*/React.createElement("span", null, "/"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-2)'
    }
  }, item.title.slice(0, 40), "\u2026")), /*#__PURE__*/React.createElement("div", {
    className: "detail"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gallery"
  }, /*#__PURE__*/React.createElement("div", {
    className: "main",
    style: thumbs[active] && thumbs[active].url ? {
      cursor: 'zoom-in'
    } : {},
    onClick: () => {
      if (thumbs[active] && thumbs[active].url) setLightbox(true);
    }
  }, thumbs[active] && thumbs[active].url ? /*#__PURE__*/React.createElement("img", {
    src: thumbs[active].url,
    alt: item.title,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--ink-3)'
    }
  }, item.catName || '📦')), /*#__PURE__*/React.createElement("div", {
    className: "thumbs"
  }, thumbs.map((th, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: 'th' + (i === active ? ' active' : ''),
    onClick: () => setActive(i),
    style: th && th.url ? {
      backgroundImage: 'url(' + th.url + ')',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    } : {}
  })))), /*#__PURE__*/React.createElement("div", {
    className: "desc"
  }, /*#__PURE__*/React.createElement("h3", null, "Opis"), /*#__PURE__*/React.createElement("p", null, fullItem.desc || 'Nema opisa.')), /*#__PURE__*/React.createElement("div", {
    className: "specs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Stanje"), /*#__PURE__*/React.createElement("span", null, conditionLabel)), /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Kategorija"), /*#__PURE__*/React.createElement("span", null, catName)), /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Lokacija"), /*#__PURE__*/React.createElement("span", null, fullItem.city)), /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Pregledan"), /*#__PURE__*/React.createElement("span", null, fullItem.views, " puta")), /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "\u0160ifra oglasa"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)'
    }
  }, "DZ-", String(fullItem.id).slice(-6).toUpperCase())))), /*#__PURE__*/React.createElement("div", {
    className: "info"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 8
    }
  }, isBarter && /*#__PURE__*/React.createElement("span", {
    className: "b",
    style: {
      background: 'var(--accent)',
      color: '#fff',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      padding: '4px 8px',
      borderRadius: 6,
      fontWeight: 700,
      letterSpacing: '.04em'
    }
  }, "RAZMENA PRIORITET"), isNew && /*#__PURE__*/React.createElement("span", {
    className: "b",
    style: {
      background: '#f4d35e',
      color: '#3b2e00',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      padding: '4px 8px',
      borderRadius: 6,
      fontWeight: 700,
      letterSpacing: '.04em'
    }
  }, "KAO NOVO")), /*#__PURE__*/React.createElement("h1", null, fullItem.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: 'var(--ink-3)',
      fontSize: 13,
      fontFamily: 'var(--font-mono)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pin",
    size: 13
  }), " ", fullItem.city), /*#__PURE__*/React.createElement("div", {
    className: "pricerow"
  }, /*#__PURE__*/React.createElement("div", {
    className: 'price-big' + (isBarter && !priceNum ? ' barter' : '')
  }, priceNum ? priceNum.toLocaleString('sr-RS') + ' rsd' : 'Razmena'), priceNum && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-3)',
      fontSize: 13
    }
  }, "\xB7 cena dogovorljiva")), fullItem.seek && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      background: 'var(--accent-soft)',
      borderRadius: 10,
      fontSize: 14,
      color: 'var(--ink)',
      marginTop: 4,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--accent)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '.04em'
    }
  }, "U ZAMENU TRA\u017DIM"), /*#__PURE__*/React.createElement("br", null), fullItem.seek), /*#__PURE__*/React.createElement("div", {
    className: "seller"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "av"
  }, (item.user || 'K').slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nm",
    onClick: () => onOpenProfile && onOpenProfile(item.user),
    style: {
      cursor: onOpenProfile ? 'pointer' : 'default'
    }
  }, item.user), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 11,
    style: {
      verticalAlign: '-2px'
    }
  }), " ", item.rating), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--good)'
    }
  }, "\u25CF aktivan")))), !pendingOffer && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "actions"
  }, isOwner ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: () => onEdit(fullItem)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "edit",
    size: 15
  }), " Uredi oglas"), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    style: {
      color: fullItem.status === 'reserved' ? 'var(--accent)' : 'var(--ink-2)',
      borderColor: fullItem.status === 'reserved' ? 'var(--accent)' : 'var(--line)'
    },
    onClick: async () => {
      const res = await apiReserveListing(fullItem.id);
      if (res.ok) setFullItem(fi => ({
        ...fi,
        status: res.status
      }));
    }
  }, fullItem.status === 'reserved' ? '● Rezervisano' : '○ Označi kao rezervisano'), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    style: {
      color: 'var(--warn)',
      borderColor: 'var(--warn)'
    },
    onClick: onDelete
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash",
    size: 15
  }), " Obri\u0161i oglas")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: handleMessage
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "msg",
    size: 15
  }), " Po\u0161alji poruku"), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: offerSent ? undefined : handleOffer,
    disabled: offerSent,
    style: offerSent ? {
      opacity: .65,
      cursor: 'default'
    } : {}
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "swap",
    size: 15
  }), " ", offerSent ? '✓ Ponuda poslata' : 'Predloži razmenu'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 10
    }
  }, !isOwner && /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    style: {
      flex: 1,
      justifyContent: 'center',
      color: saved ? '#e53e3e' : undefined,
      borderColor: saved ? '#e53e3e' : undefined
    },
    onClick: handleSave,
    disabled: savePending
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "heart",
    size: 15
  }), " ", saved ? 'Sačuvano' : 'Sačuvaj'), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    style: {
      flex: 1,
      justifyContent: 'center'
    },
    onClick: () => isOwner ? setStatsOpen(v => !v) : handleReport()
  }, isOwner ? statsOpen ? 'Zatvori' : 'Statistike' : 'Prijavi'))), isOwner && statsOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      padding: '12px 14px',
      background: 'var(--accent-soft)',
      borderRadius: 10,
      fontSize: 13,
      color: 'var(--ink-2)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Pregledi"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--ink)'
    }
  }, fullItem.views ?? 0)), fullItem.saves != null && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Sa\u010Duvano"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--ink)'
    }
  }, fullItem.saves)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u0160ifra oglasa"), /*#__PURE__*/React.createElement("b", {
    style: {
      fontFamily: 'var(--font-mono)',
      color: 'var(--ink)'
    }
  }, "DZ-", String(item.id).slice(-6).toUpperCase())), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Status"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--good)'
    }
  }, item.status || 'aktivan')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Kategorija"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--ink)'
    }
  }, catName)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Datum objave"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--ink)'
    }
  }, item.created ? new Date(item.created).toLocaleDateString('sr-RS') : '—'))))))), showOffer && /*#__PURE__*/React.createElement(OfferModal, {
    item: item,
    onClose: () => setShowOffer(false),
    onSuccess: () => {
      setShowOffer(false);
      setOfferSent(true);
    }
  }), showReport && /*#__PURE__*/React.createElement(ReportModal, {
    item: item,
    onClose: () => setShowReport(false)
  }), lightbox && thumbs[active] && thumbs[active].url && /*#__PURE__*/React.createElement("div", {
    onClick: () => setLightbox(false),
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'zoom-out',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: thumbs[active].url,
    alt: item.title,
    onClick: e => e.stopPropagation(),
    style: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      cursor: 'default'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setLightbox(false),
    style: {
      position: 'absolute',
      top: 16,
      right: 16,
      background: 'rgba(255,255,255,0.15)',
      color: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: 40,
      height: 40,
      fontSize: 24,
      cursor: 'pointer',
      lineHeight: 1
    },
    "aria-label": "Zatvori"
  }, "\xD7")));
}

/* ─── EDIT AD MODAL ──────────────────────────────── */
function EditAdModal({
  item,
  onClose,
  categories = [],
  onSaved
}) {
  const [title, setTitle] = useS(item.title || '');
  const [desc, setDesc] = useS(item.desc || '');
  const [price, setPrice] = useS(item.price ? String(item.price) : '');
  const [seek, setSeek] = useS(item.seek || '');
  const [city, setCity] = useS(item.city || '');
  const [cat, setCat] = useS(item.cat || '');
  const [loading, setLoading] = useS(false);
  const [error, setError] = useS('');
  const displayCats = categories.filter(c => c.id !== 'sve');
  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await apiUpdateListing(item.id, {
      title,
      description: desc,
      price: price || null,
      wants_in_exchange: seek,
      city,
      category: cat
    });
    setLoading(false);
    if (res.ok) onSaved(res.listing);else setError(res.error || 'Greška pri čuvanju.');
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "scrim",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "mh"
  }, /*#__PURE__*/React.createElement("h3", null, "Uredi oglas"), /*#__PURE__*/React.createElement("button", {
    className: "x-btn",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement("form", {
    className: "mb",
    onSubmit: submit
  }, error && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      background: '#fff0ee',
      border: '1px solid #fdc5bc',
      borderRadius: 8,
      fontSize: 13,
      color: 'var(--warn)',
      marginBottom: 14
    }
  }, error), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Naziv oglasa"), /*#__PURE__*/React.createElement("input", {
    className: "input",
    value: title,
    onChange: e => setTitle(e.target.value),
    autoFocus: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Kategorija"), /*#__PURE__*/React.createElement("select", {
    className: "select",
    value: cat,
    onChange: e => setCat(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Izaberi kategoriju\u2026"), displayCats.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.name)))), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Opis"), /*#__PURE__*/React.createElement("textarea", {
    className: "textarea",
    value: desc,
    onChange: e => setDesc(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Cena (rsd)"), /*#__PURE__*/React.createElement("input", {
    className: "input",
    value: price,
    onChange: e => setPrice(e.target.value),
    placeholder: "0"
  })), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "\u0160ta tra\u017Ei\u0161 u zamenu?"), /*#__PURE__*/React.createElement("textarea", {
    className: "textarea",
    value: seek,
    onChange: e => setSeek(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Grad"), /*#__PURE__*/React.createElement(CityPicker, {
    value: city,
    onChange: setCity
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mf"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: onClose
  }, "Otka\u017Ei"), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: submit,
    disabled: loading
  }, loading ? 'Čuvam…' : 'Sačuvaj izmene'))));
}

/* --- POST AD MODAL --- */
function PostAdModal({
  onClose,
  categories = [],
  onCreated,
  onView
}) {
  var [step, setStep] = useS(1);
  var [title, setTitle] = useS('');
  var [imageFiles, setImageFiles] = useS([]);
  var [imagePreviews, setImagePreviews] = useS([]);
  var [createdListing, setCreatedListing] = useS(null);
  var [mainCat, setMainCat] = useS(null);
  var [sub, setSub] = useS(null);
  var [suggestions, setSuggestions] = useS([]);
  var [condition, setCondition] = useS('');
  var [city, setCity] = useS('Beograd');
  var [price, setPrice] = useS('');
  var [currency, setCurrency] = useS('RSD');
  var [desc, setDesc] = useS('');
  var [swappable, setSwappable] = useS(true);
  var [allowMoney, setAllowMoney] = useS(false);
  var [wantsList, setWantsList] = useS([]);
  var [wantsInput, setWantsInput] = useS('');
  var [loading, setLoading] = useS(false);
  var [error, setError] = useS('');
  var [done, setDone] = useS(false);
  var fileInputRef = useR(null);
  var conditionOpts = [{
    v: 'new',
    l: 'Novo'
  }, {
    v: 'like_new',
    l: 'Kao novo'
  }, {
    v: 'good',
    l: 'Odlicno'
  }, {
    v: 'fair',
    l: 'Vrlo dobro'
  }, {
    v: 'poor',
    l: 'Dobro'
  }, {
    v: 'antique',
    l: 'Antikvitet'
  }];
  var stepLabels = ['Naziv i slike', 'Kategorija', 'Detalji', 'Zamena', 'Pregled'];
  var displayCats = categories.filter(function (c) {
    return c.slug !== 'sve';
  });
  useE(function () {
    if (!title || title.length < 3) {
      setSuggestions([]);
      return;
    }
    var words = title.toLowerCase().split(/\s+/);
    var matched = [];
    displayCats.forEach(function (c) {
      var cWords = (c.name + ' ' + (c.slug || '')).toLowerCase();
      var cScore = 0;
      words.forEach(function (w) {
        if (w.length > 2 && cWords.indexOf(w) !== -1) cScore++;
      });
      if (c.children && c.children.length > 0) {
        c.children.forEach(function (s) {
          var sWords = (s.name + ' ' + (s.slug || '')).toLowerCase();
          var sScore = 0;
          words.forEach(function (w) {
            if (w.length > 2 && sWords.indexOf(w) !== -1) sScore++;
          });
          if (sScore > 0 || cScore > 0) {
            matched.push({
              main: c,
              s: s,
              score: sScore * 2 + cScore
            });
          }
        });
      } else if (cScore > 0) {
        matched.push({
          main: c,
          s: null,
          score: cScore
        });
      }
    });
    matched.sort(function (a, b) {
      return b.score - a.score;
    });
    setSuggestions(matched.slice(0, 3));
  }, [title]);
  useE(function () {
    var previews = imageFiles.map(function (f) {
      return URL.createObjectURL(f);
    });
    setImagePreviews(previews);
  }, [imageFiles]);
  var handleFileSelect = function (e) {
    var incoming = Array.from(e.target.files);
    setImageFiles(function (prev) {
      return prev.concat(incoming).slice(0, 10);
    });
  };
  var removeImage = function (i) {
    setImageFiles(function (prev) {
      return prev.filter(function (_, idx) {
        return idx !== i;
      });
    });
  };
  var handleWantsKey = function (e) {
    if (e.key === 'Enter' && wantsInput.trim()) {
      e.preventDefault();
      var val = wantsInput.trim();
      setWantsList(function (prev) {
        return prev.concat([val]);
      });
      setWantsInput('');
    }
  };
  var removeWant = function (i) {
    setWantsList(function (prev) {
      return prev.filter(function (_, idx) {
        return idx !== i;
      });
    });
  };
  var canProceed = function () {
    if (step === 1) return title.trim().length >= 3;
    if (step === 2) return !!(sub || mainCat);
    if (step === 3) return !!(condition && city.trim() && desc.trim());
    return true;
  }();
  var next = function () {
    if (canProceed) setStep(function (s) {
      return Math.min(5, s + 1);
    });
  };
  var prev = function () {
    setStep(function (s) {
      return Math.max(1, s - 1);
    });
  };
  var submit = async function () {
    setError('');
    setLoading(true);
    var listingType = 'barter';
    if (swappable && allowMoney) listingType = 'both';else if (allowMoney) listingType = 'sell';
    var catSlug = sub ? sub.slug : mainCat ? mainCat.slug : '';
    var res = await apiCreateListing({
      title: title.trim(),
      description: desc.trim(),
      listing_type: listingType,
      category: catSlug,
      price: price || null,
      wants_in_exchange: (wantsInput.trim() ? [...wantsList, wantsInput.trim()] : wantsList).join(', '),
      city: city.trim(),
      condition: condition
    });
    if (!res.ok) {
      if (res.error === 'email_not_verified') {
        setError('Moraš verifikovati email adresu pre postavljanja oglasa. Proveri inbox ili pošalji novi verifikacioni email iz Podešavanja.');
      } else {
        setError(res.error || 'Greška pri objavljivanju. Status: ' + res.status);
      }
      setLoading(false);
      return;
    }
    if (imageFiles.length > 0) {
      var imgRes = await apiUploadImages(res.listing.id, imageFiles);
      if (imgRes.ok && imgRes.images) res.listing.images = imgRes.images;
    }
    setLoading(false);
    setCreatedListing(res.listing);
    setDone(true);
    if (onCreated) onCreated(res.listing);
  };
  if (done) {
    return /*#__PURE__*/React.createElement("div", {
      className: "scrim",
      onClick: onClose
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal",
      onClick: function (e) {
        e.stopPropagation();
      },
      style: {
        maxWidth: 480
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "mb",
      style: {
        textAlign: 'center',
        padding: '40px 32px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'var(--accent-soft)',
        color: 'var(--accent)',
        display: 'grid',
        placeItems: 'center',
        margin: '0 auto 18px'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 30,
      stroke: 2.4
    })), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontFamily: 'var(--font-display)',
        margin: '0 0 8px',
        fontSize: 24
      }
    }, "Oglas je objavljen!"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--ink-3)',
        margin: '0 0 14px',
        fontSize: 14.5
      }
    }, "Tvoj oglas ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--ink)'
      }
    }, "\"", title, "\""), " je sada vidljiv."), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--ink-3)',
        margin: '0 0 22px',
        fontSize: 13,
        lineHeight: 1.5,
        background: 'var(--accent-soft)',
        borderRadius: 10,
        padding: '12px 14px'
      }
    }, "Oglas je aktivan ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--ink-2)'
      }
    }, "15 dana"), ". Pre isteka \u0107e\u0161 dobiti podsetnik i mo\u0107i \u0107e\u0161 da ga ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--ink-2)'
      }
    }, "besplatno produ\u017Ei\u0161"), "."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "nav-btn",
      onClick: onClose
    }, "Zatvori"), /*#__PURE__*/React.createElement("button", {
      className: "nav-btn primary",
      onClick: function () {
        onClose();
        if (onView && createdListing) onView(createdListing);
      }
    }, "Pogledaj oglas")))));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "scrim",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: function (e) {
      e.stopPropagation();
    },
    style: {
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mh"
  }, /*#__PURE__*/React.createElement("h3", null, "Postavi oglas"), /*#__PURE__*/React.createElement("button", {
    className: "x-btn",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      padding: '0 24px 16px',
      gap: 0
    }
  }, stepLabels.map(function (label, idx) {
    var n = idx + 1;
    var isDone = step > n;
    var isActive = step === n;
    return React.createElement(React.Fragment, {
      key: n
    }, React.createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: '0 0 auto'
      }
    }, React.createElement('div', {
      style: {
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: isDone ? '#22c55e' : isActive ? 'var(--accent)' : 'var(--line)',
        color: isDone || isActive ? '#fff' : 'var(--ink-3)',
        display: 'grid',
        placeItems: 'center',
        fontSize: 12,
        fontWeight: 700,
        transition: 'background .2s'
      }
    }, isDone ? '✓' : n), React.createElement('div', {
      style: {
        fontSize: 9,
        marginTop: 4,
        fontFamily: 'var(--font-mono)',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        color: isActive ? 'var(--accent)' : 'var(--ink-3)'
      }
    }, label)), idx < stepLabels.length - 1 ? React.createElement('div', {
      style: {
        flex: 1,
        height: 2,
        margin: '14px 4px 0',
        background: step > n ? '#22c55e' : 'var(--line)',
        transition: 'background .2s'
      }
    }) : null);
  })), /*#__PURE__*/React.createElement("div", {
    className: "mb"
  }, error && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      background: '#fff0ee',
      border: '1px solid #fdc5bc',
      borderRadius: 8,
      fontSize: 13,
      color: 'var(--warn)',
      marginBottom: 14
    }
  }, error), step === 1 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Naziv oglasa"), /*#__PURE__*/React.createElement("input", {
    className: "input",
    value: title,
    onChange: function (e) {
      setTitle(e.target.value);
    },
    placeholder: "npr. Bicikl Capriolo MTB 27.5, malo koris\u0107en",
    autoFocus: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "hint"
  }, "Budi konkretan \u2014 dobar naziv donosi vi\u0161e pregleda.")), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Fotografije", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-3)',
      fontWeight: 400,
      fontSize: 12,
      marginLeft: 6
    }
  }, "\xB7 do 10, prva je naslovna")), /*#__PURE__*/React.createElement("input", {
    ref: fileInputRef,
    type: "file",
    accept: "image/*",
    multiple: true,
    style: {
      display: 'none'
    },
    onChange: handleFileSelect
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5,1fr)',
      gap: 8
    }
  }, [0, 1, 2, 3, 4].map(function (i) {
    var url = imagePreviews[i] || null;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      onClick: function () {
        fileInputRef.current.click();
      },
      style: {
        aspectRatio: '1/1',
        borderRadius: 10,
        border: url ? '2px solid var(--accent)' : '1px dashed var(--ink-4)',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--ink-3)',
        cursor: 'pointer',
        background: url ? 'transparent' : '#faf8f1',
        overflow: 'hidden',
        position: 'relative'
      }
    }, url ? React.createElement(React.Fragment, null, React.createElement('img', {
      src: url,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }), i === 0 ? React.createElement('span', {
      style: {
        position: 'absolute',
        bottom: 3,
        left: 3,
        background: 'var(--accent)',
        color: '#fff',
        fontSize: 7,
        fontWeight: 700,
        padding: '2px 4px',
        borderRadius: 3,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '.04em'
      }
    }, 'NASLOVNA') : null, React.createElement('button', {
      onClick: function (e) {
        e.stopPropagation();
        removeImage(i);
      },
      style: {
        position: 'absolute',
        top: 3,
        right: 3,
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: 'rgba(0,0,0,.5)',
        border: 0,
        color: '#fff',
        cursor: 'pointer',
        display: 'grid',
        placeItems: 'center',
        fontSize: 11,
        lineHeight: 1
      }
    }, '×')) : React.createElement(Icon, {
      name: i === 0 ? 'camera' : 'plus',
      size: 16
    }));
  })), /*#__PURE__*/React.createElement("div", {
    className: "hint"
  }, imageFiles.length > 0 ? imageFiles.length + (imageFiles.length === 1 ? ' slika izabrana' : ' slike izabrane') + ' · klikni za dodavanje' : 'Klikni na kvadrat da dodas fotografije'))), step === 2 && /*#__PURE__*/React.createElement("div", null, suggestions.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      color: 'var(--ink-3)',
      letterSpacing: '.06em',
      marginBottom: 8
    }
  }, "PRIJEDLOZI"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, suggestions.map(function (sg, idx) {
    var lbl = sg.s ? sg.main.name + ' › ' + sg.s.name : sg.main.name;
    var isSel = sg.s ? sub && sub.slug === sg.s.slug : mainCat && mainCat.slug === sg.main.slug && !sub;
    return /*#__PURE__*/React.createElement("button", {
      key: idx,
      onClick: function () {
        setMainCat(sg.main);
        setSub(sg.s || null);
      },
      style: {
        padding: '6px 12px',
        borderRadius: 20,
        fontSize: 13,
        border: isSel ? '2px solid var(--accent)' : '1px solid var(--line)',
        background: isSel ? 'var(--accent-soft)' : '#fff',
        color: isSel ? 'var(--accent)' : 'var(--ink-2)',
        cursor: 'pointer',
        fontWeight: isSel ? 700 : 400
      }
    }, lbl, sg.s && sg.s.count ? ' (' + sg.s.count + ')' : '');
  }))), !mainCat ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      color: 'var(--ink-3)',
      letterSpacing: '.06em',
      marginBottom: 10
    }
  }, "SVE KATEGORIJE"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 8
    }
  }, displayCats.map(function (c) {
    return /*#__PURE__*/React.createElement("button", {
      key: c.id,
      onClick: function () {
        setMainCat(c);
        setSub(null);
      },
      style: {
        padding: '12px 10px',
        borderRadius: 10,
        fontSize: 13,
        border: '1px solid var(--line)',
        background: '#fff',
        color: 'var(--ink)',
        cursor: 'pointer',
        textAlign: 'center',
        fontWeight: 500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6
      }
    }, c.icon ? React.createElement(Icon, {
      name: c.icon,
      size: 20,
      style: {
        color: 'var(--accent)',
        flexShrink: 0
      }
    }) : null, /*#__PURE__*/React.createElement("span", {
      style: {
        lineHeight: 1.2
      }
    }, c.name), c.children && c.children.length > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: 'var(--ink-3)',
        fontFamily: 'var(--font-mono)'
      }
    }, c.children.length + ' podkat.'));
  }))) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      setMainCat(null);
      setSub(null);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: 'none',
      border: 0,
      cursor: 'pointer',
      color: 'var(--accent)',
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 12,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-l",
    size: 14
  }), " ", mainCat.name), mainCat.children && mainCat.children.length > 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 8
    }
  }, mainCat.children.map(function (s) {
    var isSel = sub && sub.slug === s.slug;
    return /*#__PURE__*/React.createElement("button", {
      key: s.id,
      onClick: function () {
        setSub(s);
      },
      style: {
        padding: '10px 12px',
        borderRadius: 10,
        fontSize: 13,
        border: isSel ? '2px solid var(--accent)' : '1px solid var(--line)',
        background: isSel ? 'var(--accent-soft)' : '#fff',
        color: isSel ? 'var(--accent)' : 'var(--ink)',
        cursor: 'pointer',
        textAlign: 'left',
        fontWeight: isSel ? 700 : 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", null, s.name), s.count ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: isSel ? 'var(--accent)' : 'var(--ink-3)',
        fontFamily: 'var(--font-mono)',
        flexShrink: 0
      }
    }, s.count) : null);
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 13
    }
  }, "Nema podkategorija. Nastavi s ovom kategorijom."))), step === 3 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Cena (RSD)"), /*#__PURE__*/React.createElement("input", {
    className: "input",
    value: price,
    onChange: function (e) {
      setPrice(e.target.value);
    },
    placeholder: "0",
    type: "number",
    min: "0"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "field-group",
    style: {
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("label", null, "Grad"), /*#__PURE__*/React.createElement(CityPicker, {
    value: city,
    onChange: setCity
  })), /*#__PURE__*/React.createElement("div", {
    className: "field-group",
    style: {
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("label", null, "Stanje"), /*#__PURE__*/React.createElement("select", {
    className: "select",
    value: condition,
    onChange: function (e) {
      setCondition(e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Izaberi..."), conditionOpts.map(function (o) {
    return React.createElement('option', {
      key: o.v,
      value: o.v
    }, o.l);
  })))), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Opis"), /*#__PURE__*/React.createElement("textarea", {
    className: "textarea",
    value: desc,
    onChange: function (e) {
      setDesc(e.target.value);
    },
    placeholder: "Opi\u0161i stanje, dimenzije, \u0161ta je uklju\u010Deno...",
    rows: 4
  }))), step === 4 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-3)',
      marginBottom: 14
    }
  }, "Kako mo\u017Ee\u0161 primiti ovaj predmet?"), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: swappable,
    onChange: function (e) {
      setSwappable(e.target.checked);
    },
    style: {
      width: 18,
      height: 18
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, "Razmena"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)'
    }
  }, "Primam predmete u zamenu"))), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: allowMoney,
    onChange: function (e) {
      setAllowMoney(e.target.checked);
    },
    style: {
      width: 18,
      height: 18
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, "Prodaja"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)'
    }
  }, "Primam novac")))), swappable && /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "\u0160ta tra\u017Ei\u0161 u zamenu?"), wantsList.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 8
    }
  }, wantsList.map(function (w, i) {
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        background: 'var(--accent-soft)',
        color: 'var(--accent)',
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 500
      }
    }, w, /*#__PURE__*/React.createElement("button", {
      onClick: function () {
        removeWant(i);
      },
      style: {
        background: 'none',
        border: 0,
        cursor: 'pointer',
        color: 'var(--accent)',
        fontSize: 15,
        lineHeight: 1,
        padding: 0,
        display: 'grid',
        placeItems: 'center'
      }
    }, "\xD7"));
  })), /*#__PURE__*/React.createElement("input", {
    className: "input",
    value: wantsInput,
    onChange: function (e) {
      setWantsInput(e.target.value);
    },
    onKeyDown: handleWantsKey,
    placeholder: "npr. knjige, biljke... (Enter za dodavanje)"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hint"
  }, "Pritisni Enter da dodas stavku."))), step === 5 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      background: '#faf8f1',
      borderRadius: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      color: 'var(--ink-3)',
      letterSpacing: '.06em',
      marginBottom: 10
    }
  }, "PREGLED OGLASA"), imagePreviews.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 12,
      overflowX: 'auto'
    }
  }, imagePreviews.map(function (url, i) {
    return /*#__PURE__*/React.createElement("img", {
      key: i,
      src: url,
      style: {
        width: 56,
        height: 56,
        borderRadius: 8,
        objectFit: 'cover',
        flexShrink: 0,
        border: i === 0 ? '2px solid var(--accent)' : '1px solid var(--line)'
      }
    });
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      marginBottom: 8
    }
  }, title || 'Bez naziva'), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      fontSize: 13,
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '3px 0',
      color: 'var(--ink-3)',
      width: 110
    }
  }, "Kategorija"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '3px 0',
      fontWeight: 500
    }
  }, sub ? mainCat ? mainCat.name + ' › ' + sub.name : sub.name : mainCat ? mainCat.name : '—')), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '3px 0',
      color: 'var(--ink-3)'
    }
  }, "Stanje"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '3px 0',
      fontWeight: 500
    }
  }, (conditionOpts.find(function (o) {
    return o.v === condition;
  }) || {}).l || '—')), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '3px 0',
      color: 'var(--ink-3)'
    }
  }, "Grad"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '3px 0',
      fontWeight: 500
    }
  }, city || '—')), price ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '3px 0',
      color: 'var(--ink-3)'
    }
  }, "Cena"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '3px 0',
      fontWeight: 500
    }
  }, price + ' ' + currency)) : null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '3px 0',
      color: 'var(--ink-3)'
    }
  }, "Tip"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '3px 0',
      fontWeight: 500
    }
  }, swappable && allowMoney ? 'Razmena i prodaja' : swappable ? 'Razmena' : 'Prodaja')), wantsList.length > 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '3px 0',
      color: 'var(--ink-3)'
    }
  }, "Tra\u017Eim"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '3px 0',
      fontWeight: 500
    }
  }, (wantsInput.trim() ? [...wantsList, wantsInput.trim()] : wantsList).join(', '))) : null)), desc ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: 13,
      color: 'var(--ink-2)',
      borderTop: '1px solid var(--line)',
      paddingTop: 10
    }
  }, desc) : null), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      gap: 10,
      fontSize: 13.5,
      color: 'var(--ink-2)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), "Sla\u017Eem se sa ", /*#__PURE__*/React.createElement("a", {
    style: {
      color: 'var(--accent)',
      fontWeight: 600
    }
  }, "pravilima zajednice")))), /*#__PURE__*/React.createElement("div", {
    className: "mf"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: step === 1 ? onClose : prev
  }, step === 1 ? 'Otkaži' : 'Nazad'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)'
    }
  }, stepLabels[step - 1]), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: step === 5 ? submit : next,
    disabled: !canProceed || loading
  }, loading ? 'Objavljujem...' : step === 5 ? 'Objavi oglas' : 'Dalje', step !== 5 && !loading && React.createElement(Icon, {
    name: 'arrow-r',
    size: 14,
    stroke: 2
  })))));
}

/* ─── STAR RATING ──────────────────────────────── */
function StarRating({
  value,
  onChange,
  size
}) {
  var s = size || 28;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, [1, 2, 3, 4, 5].map(function (n) {
    return /*#__PURE__*/React.createElement("span", {
      key: n,
      onClick: function () {
        if (onChange) onChange(n);
      },
      style: {
        fontSize: s,
        cursor: onChange ? 'pointer' : 'default',
        color: n <= value ? '#f6ad55' : 'var(--line)',
        lineHeight: 1,
        userSelect: 'none',
        transition: 'color .1s'
      }
    }, "\u2605");
  }));
}

/* ─── REVIEW MODAL ──────────────────────────────── */
function ReviewModal({
  offer,
  onClose,
  onSuccess
}) {
  var [rating, setRating] = useS(0);
  var [comment, setComment] = useS('');
  var [loading, setLoading] = useS(false);
  var [error, setError] = useS('');
  var submit = async function () {
    if (!rating) {
      setError('Izaberi ocenu od 1 do 5 zvezdica.');
      return;
    }
    setLoading(true);
    setError('');
    var res = await apiReviewOffer(offer.id, rating, comment);
    setLoading(false);
    if (res.ok) onSuccess();else setError(res.error || 'Greška pri slanju ocene.');
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "scrim",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: function (e) {
      e.stopPropagation();
    },
    style: {
      maxWidth: 440
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mh"
  }, /*#__PURE__*/React.createElement("h3", null, "Ostavi ocenu"), /*#__PURE__*/React.createElement("button", {
    className: "x-btn",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mb"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--ink-3)',
      marginBottom: 6
    }
  }, "Razmena za oglas:"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--ink)',
      marginBottom: 20
    }
  }, offer.listing ? offer.listing.title : '—'), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--ink-3)',
      marginBottom: 8
    }
  }, "Oceni korisnika ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--ink)'
    }
  }, offer.other_user), ":"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(StarRating, {
    value: rating,
    onChange: setRating,
    size: 36
  }), rating > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      marginTop: 6,
      fontFamily: 'var(--font-mono)'
    }
  }, ['', 'Loše', 'Prihvatljivo', 'Dobro', 'Vrlo dobro', 'Odlično'][rating])), /*#__PURE__*/React.createElement("div", {
    className: "field-group"
  }, /*#__PURE__*/React.createElement("label", null, "Komentar (opciono)"), /*#__PURE__*/React.createElement("textarea", {
    className: "textarea",
    value: comment,
    onChange: function (e) {
      setComment(e.target.value);
    },
    placeholder: "Opi\u0161i iskustvo razmene\u2026",
    rows: 3
  })), error && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      background: '#fff0ee',
      border: '1px solid #fdc5bc',
      borderRadius: 8,
      fontSize: 13,
      color: 'var(--warn)',
      marginTop: 8
    }
  }, error)), /*#__PURE__*/React.createElement("div", {
    className: "mf"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: onClose,
    disabled: loading
  }, "Odustani"), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: submit,
    disabled: loading || !rating
  }, loading ? 'Šalje se…' : '★ Pošalji ocenu'))));
}

/* ─── RATINGS SCREEN ──────────────────────────────── */
function RatingsScreen({
  onOpenItem
}) {
  var [tab, setTab] = useS('swaps');
  var [offers, setOffers] = useS(null);
  var [reviews, setReviews] = useS(null);
  var [reviewTarget, setReviewTarget] = useS(null);
  var [completing, setCompleting] = useS(null);
  useE(function () {
    apiMyOffers().then(function (res) {
      setOffers(Array.isArray(res.results) ? res.results : []);
    });
    apiMyReviews().then(function (res) {
      setReviews(Array.isArray(res.results) ? res.results : []);
    });
  }, []);
  var handleComplete = async function (offerId) {
    setCompleting(offerId);
    var res = await apiCompleteOffer(offerId);
    if (res.ok) {
      setOffers(function (prev) {
        return prev.map(function (o) {
          return o.id === offerId ? Object.assign({}, o, {
            status: 'completed',
            can_complete: false,
            can_review: true
          }) : o;
        });
      });
    }
    setCompleting(null);
  };
  var handleReviewSuccess = function (offerId) {
    setReviewTarget(null);
    setOffers(function (prev) {
      return prev.map(function (o) {
        return o.id === offerId ? Object.assign({}, o, {
          can_review: false,
          i_reviewed: true
        }) : o;
      });
    });
  };
  var STATUS_LABEL = {
    pending: 'Na čekanju',
    accepted: 'Prihvaćena',
    declined: 'Odbijena',
    completed: 'Završena',
    cancelled: 'Otkazana'
  };
  var STATUS_COLOR = {
    pending: '#b7791f',
    accepted: '#276749',
    declined: '#e53e3e',
    completed: '#276749',
    cancelled: 'var(--ink-3)'
  };
  var STATUS_BG = {
    pending: '#fefcbf',
    accepted: '#f0fff4',
    declined: '#fff5f5',
    completed: '#f0fff4',
    cancelled: '#f5f5f5'
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    style: {
      paddingTop: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Ocene i istorija"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Tvoje razmene i primljene ocene"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      marginBottom: 24,
      borderBottom: '1px solid var(--line)',
      paddingBottom: 0
    }
  }, [{
    id: 'swaps',
    label: 'Razmene',
    count: offers ? offers.length : null
  }, {
    id: 'reviews',
    label: 'Ocene',
    count: reviews ? reviews.length : null
  }].map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: function () {
        setTab(t.id);
      },
      style: {
        padding: '10px 18px',
        border: 'none',
        background: 'none',
        borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
        color: tab === t.id ? 'var(--accent)' : 'var(--ink-2)',
        fontWeight: tab === t.id ? 700 : 500,
        fontSize: 14,
        cursor: 'pointer',
        marginBottom: -1,
        transition: 'all .15s'
      }
    }, t.label, t.count !== null && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 6,
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        background: tab === t.id ? 'var(--accent-soft)' : 'var(--line)',
        color: tab === t.id ? 'var(--accent)' : 'var(--ink-3)',
        padding: '1px 6px',
        borderRadius: 8
      }
    }, t.count));
  })), tab === 'swaps' && (offers === null ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '48px 0',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 14
    }
  }, "U\u010Ditavam\u2026") : offers.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '60px 20px',
      textAlign: 'center',
      color: 'var(--ink-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 14
    }
  }, "\uD83D\uDD04"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      color: 'var(--ink-2)',
      marginBottom: 6,
      fontFamily: 'var(--font-display)'
    }
  }, "Jo\u0161 nema\u0161 razmena"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5
    }
  }, "Kad po\u0161alje\u0161 ili primi\u0161 ponudu za razmenu, pojavi\u0107e se ovde.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, offers.map(function (offer) {
    var isCompleting = completing === offer.id;
    return /*#__PURE__*/React.createElement("div", {
      key: offer.id,
      style: {
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 56,
        height: 56,
        borderRadius: 8,
        flexShrink: 0,
        background: '#f0ede4',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center'
      }
    }, offer.listing && offer.listing.image ? /*#__PURE__*/React.createElement("img", {
      src: offer.listing.image,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22
      }
    }, "\uD83D\uDCE6")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 14,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, offer.listing ? offer.listing.title : '—'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--ink-3)',
        fontFamily: 'var(--font-mono)',
        marginTop: 3
      }
    }, offer.is_sender ? 'Ti → ' : '← Ti · od ', offer.other_user, ' · ', new Date(offer.created_at).toLocaleDateString('sr-RS')), offer.offered_listing && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--ink-2)',
        marginTop: 3
      }
    }, "Ponu\u0111eno: ", /*#__PURE__*/React.createElement("b", null, offer.offered_listing.title), offer.cash_offer > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--accent)',
        fontFamily: 'var(--font-mono)',
        marginLeft: 6
      }
    }, "+ ", offer.cash_offer.toLocaleString('sr-RS'), " RSD"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 6,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '.04em',
        color: STATUS_COLOR[offer.status] || 'var(--ink-3)',
        background: STATUS_BG[offer.status] || '#f5f5f5'
      }
    }, STATUS_LABEL[offer.status] || offer.status), offer.can_complete && /*#__PURE__*/React.createElement("button", {
      className: "nav-btn primary",
      onClick: function () {
        handleComplete(offer.id);
      },
      disabled: isCompleting,
      style: {
        fontSize: 12
      }
    }, isCompleting ? '…' : '✓ Potvrdi razmenu'), offer.status === 'accepted' && offer.i_confirmed && !offer.can_complete && offer.status !== 'completed' && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: 'var(--ink-3)',
        fontFamily: 'var(--font-mono)'
      }
    }, "\u23F3 \u010Ceka se potvrda druge strane"), offer.can_review && /*#__PURE__*/React.createElement("button", {
      className: "nav-btn",
      onClick: function () {
        setReviewTarget(offer);
      },
      style: {
        fontSize: 12,
        color: '#b7791f',
        borderColor: '#b7791f'
      }
    }, "\u2605 Ostavi ocenu"), offer.i_reviewed && offer.status === 'completed' && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: 'var(--ink-3)',
        fontFamily: 'var(--font-mono)'
      }
    }, "\u2713 Ocenjeno")));
  }))), tab === 'reviews' && (reviews === null ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '48px 0',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 14
    }
  }, "U\u010Ditavam\u2026") : reviews.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '60px 20px',
      textAlign: 'center',
      color: 'var(--ink-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 14
    }
  }, "\u2605"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      color: 'var(--ink-2)',
      marginBottom: 6,
      fontFamily: 'var(--font-display)'
    }
  }, "Jo\u0161 nema\u0161 ocena"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5
    }
  }, "Zavr\u0161i razmenu i drugi korisnici \u0107e mo\u0107i da te ocenjuju.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, reviews.map(function (r) {
    return /*#__PURE__*/React.createElement("div", {
      key: r.id,
      style: {
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 12,
        padding: '14px 16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'var(--accent-soft)',
        color: 'var(--accent)',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
        fontSize: 13
      }
    }, r.from_user.slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 14
      }
    }, r.from_user), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--ink-3)',
        fontFamily: 'var(--font-mono)'
      }
    }, new Date(r.created_at).toLocaleDateString('sr-RS'), r.listing ? ' · ' + r.listing : '')), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: 'auto'
      }
    }, /*#__PURE__*/React.createElement(StarRating, {
      value: r.rating,
      size: 18
    }))), r.comment && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        color: 'var(--ink-2)',
        lineHeight: 1.6,
        padding: '8px 12px',
        background: '#faf8f1',
        borderRadius: 8,
        fontStyle: 'italic'
      }
    }, "\u201E", r.comment, "\""));
  })))), reviewTarget && /*#__PURE__*/React.createElement(ReviewModal, {
    offer: reviewTarget,
    onClose: function () {
      setReviewTarget(null);
    },
    onSuccess: function () {
      handleReviewSuccess(reviewTarget.id);
    }
  }));
}

/* ─── RAZMENE DRAWER ──────────────────────────────── */
function RazmeneDrawer({
  onClose,
  currentUser,
  targetListing
}) {
  const [threads, setThreads] = useS([]);
  const [active, setActive] = useS(null);
  const [messages, setMessages] = useS([]);
  const [text, setText] = useS('');
  const [loading, setLoading] = useS(true);
  const [sending, setSending] = useS(false);
  const [reviewTarget, setReviewTarget] = useS(null);
  const [reviewedOfferIds, setReviewedOfferIds] = useS([]);
  const [mobileView, setMobileView] = useS('list');
  const isMobile = window.innerWidth < 640;
  const bottomRef = useR(null);
  const activeRef = useR(null);
  useE(() => {
    activeRef.current = active;
  }, [active]);
  const refreshMessages = function () {
    if (!activeRef.current) return;
    apiChatMessages(activeRef.current.id).then(function (res) {
      if (Array.isArray(res.results)) setMessages(res.results);
    });
  };
  const handleOfferAction = function (action, res) {
    if (action === 'review') {
      var a = activeRef.current;
      setReviewTarget({
        id: res.offerId,
        other_user: a ? a.other_user?.username : '',
        listing: a ? a.listing : null
      });
    } else {
      refreshMessages();
    }
  };
  const handleReviewSuccess = function () {
    if (reviewTarget) {
      setReviewedOfferIds(function (prev) {
        return prev.concat(reviewTarget.id);
      });
    }
    setReviewTarget(null);
  };
  useE(() => {
    var loadInbox = function (targetConvId) {
      apiInbox().then(function (res) {
        if (Array.isArray(res.results)) {
          setThreads(res.results);
          if (targetConvId) {
            var match = res.results.find(function (t) {
              return t.id === targetConvId;
            });
            setActive(match || (res.results.length > 0 ? res.results[0] : null));
          } else if (res.results.length > 0) {
            setActive(res.results[0]);
          }
        }
        setLoading(false);
      });
    };
    if (targetListing) {
      apiStartThread(targetListing.id).then(function (res) {
        loadInbox(res.ok ? res.conversation_id : null);
      });
    } else {
      loadInbox(null);
    }
  }, []);
  useE(() => {
    if (!active) return;
    const id = active.id;
    apiChatMessages(id).then(res => {
      if (Array.isArray(res.results)) setMessages(res.results);
    });
  }, [active?.id]);
  useE(() => {
    if (!active) return;
    const iv = setInterval(() => {
      apiChatMessages(active.id).then(res => {
        if (Array.isArray(res.results)) setMessages(res.results);
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [active?.id]);
  useE(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);
  const send = async e => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    setSending(true);
    const res = await apiSendMessage(active.id, text.trim());
    setSending(false);
    if (res.ok && res.message) {
      setMessages(prev => [...prev, res.message]);
      setText('');
    }
  };
  const handleDeleteMessage = async msgId => {
    const res = await apiDeleteMessage(active.id, msgId);
    if (res.ok) setMessages(prev => prev.filter(m => m.id !== msgId));
  };
  const handleDeleteConversation = async () => {
    if (!window.confirm('Obrisati ceo chat? Ova radnja se ne može poništiti.')) return;
    const res = await apiDeleteConversation(active.id);
    if (res.ok) {
      const remaining = threads.filter(t => t.id !== active.id);
      setThreads(remaining);
      setActive(remaining.length > 0 ? remaining[0] : null);
      setMessages([]);
      if (isMobile) setMobileView('list');
    }
  };
  const fmtTime = iso => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('sr-RS', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const openThread = t => {
    setActive(t);
    setMessages([]);
    if (isMobile) setMobileView('chat');
  };
  if (loading) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "scrim",
      onClick: onClose
    }), /*#__PURE__*/React.createElement("aside", {
      className: "drawer",
      style: {
        width: isMobile ? '100%' : 'min(820px,100%)',
        display: 'grid',
        placeItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--ink-3)',
        fontSize: 14
      }
    }, "U\u010Ditavam\u2026")));
  }
  if (!active) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "scrim",
      onClick: onClose
    }), /*#__PURE__*/React.createElement("aside", {
      className: "drawer",
      style: {
        width: isMobile ? '100%' : 'min(820px,100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: 'var(--ink-3)'
      }
    }, "Nema aktivnih razmena."), /*#__PURE__*/React.createElement("button", {
      className: "nav-btn",
      onClick: onClose
    }, "Zatvori")));
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "scrim",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: "drawer",
    style: {
      width: isMobile ? '100%' : 'min(820px,100%)',
      display: isMobile ? 'flex' : 'grid',
      flexDirection: 'column',
      gridTemplateColumns: isMobile ? undefined : '320px 1fr'
    }
  }, isMobile && mobileView === 'list' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dh"
  }, /*#__PURE__*/React.createElement("h3", null, "Razmene"), /*#__PURE__*/React.createElement("button", {
    className: "x-btn",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "db",
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, threads.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    className: 'thread' + (t.unread ? ' unread' : ''),
    onClick: () => openThread(t)
  }, /*#__PURE__*/React.createElement("div", {
    className: "av"
  }, (t.other_user?.username || 'K').slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, /*#__PURE__*/React.createElement("span", null, t.other_user?.username || '—'), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, fmtTime(t.last_time))), /*#__PURE__*/React.createElement("div", {
    className: "pv"
  }, t.last_message || 'Nema poruka')), t.unread && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: 'var(--accent)',
      flexShrink: 0
    }
  }))))), isMobile && mobileView === 'chat' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#faf8f1'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dh",
    style: {
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setMobileView('list'),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--ink)',
      display: 'grid',
      placeItems: 'center',
      padding: '4px 8px 4px 0',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-l",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--ink)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, active.other_user?.username), active.listing && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ink-3)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, active.listing.title))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexShrink: 0
    }
  }, active.listing && /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    style: {
      fontSize: 12,
      padding: '0 10px',
      height: 32
    },
    onClick: () => {
      onClose();
      window.dispatchEvent(new CustomEvent('dj:viewListing', {
        detail: {
          id: active.listing.id
        }
      }));
    }
  }, "Oglas"), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    style: {
      fontSize: 12,
      padding: '0 10px',
      height: 32,
      color: '#e53e3e',
      borderColor: '#e53e3e'
    },
    onClick: handleDeleteConversation,
    title: "Obri\u0161i chat"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash",
    size: 14
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: '14px 16px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, messages.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 13,
      color: 'var(--ink-3)',
      margin: 'auto'
    }
  }, "Zapo\u010Dni razgovor\u2026"), messages.map(msg => {
    const who = msg.sender === currentUser?.username ? 'me' : 'them';
    return msg.offer ? /*#__PURE__*/React.createElement(OfferCard, {
      key: msg.id,
      msg: msg,
      who: who,
      currentUserId: currentUser?.id,
      onOfferAction: handleOfferAction,
      isReviewed: reviewedOfferIds.indexOf(msg.offer.id) !== -1
    }) : /*#__PURE__*/React.createElement(Bubble, {
      key: msg.id,
      who: who,
      onDelete: who === 'me' ? () => handleDeleteMessage(msg.id) : null
    }, msg.body);
  }), /*#__PURE__*/React.createElement("div", {
    ref: bottomRef
  })), /*#__PURE__*/React.createElement("form", {
    onSubmit: send,
    style: {
      padding: '10px 12px',
      borderTop: '1px solid var(--line)',
      background: '#fff',
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "input",
    value: text,
    onChange: e => setText(e.target.value),
    placeholder: "Napi\u0161i poruku\u2026",
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    type: "submit",
    disabled: sending
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "send",
    size: 15
  })))), !isMobile && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRight: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dh"
  }, /*#__PURE__*/React.createElement("h3", null, "Poruke"), /*#__PURE__*/React.createElement("button", {
    className: "x-btn",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "db"
  }, threads.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    className: 'thread' + (t.unread ? ' unread' : ''),
    onClick: () => openThread(t),
    style: active.id === t.id ? {
      background: 'var(--accent-softer)'
    } : {}
  }, /*#__PURE__*/React.createElement("div", {
    className: "av"
  }, (t.other_user?.username || 'K').slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, /*#__PURE__*/React.createElement("span", null, t.other_user?.username || '—'), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, fmtTime(t.last_time))), /*#__PURE__*/React.createElement("div", {
    className: "pv"
  }, t.last_message || 'Nema poruka')))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      background: '#faf8f1'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dh",
    style: {
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, active.other_user?.username), active.listing && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)',
      marginTop: 2
    }
  }, active.listing.title)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, active.listing && /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: () => window.dispatchEvent(new CustomEvent('dj:viewListing', {
      detail: {
        id: active.listing.id
      }
    }))
  }, "Pogledaj oglas"), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    style: {
      color: '#e53e3e',
      borderColor: '#e53e3e'
    },
    onClick: handleDeleteConversation,
    title: "Obri\u0161i chat"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash",
    size: 14
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: '18px 22px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, messages.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 13,
      color: 'var(--ink-3)',
      margin: 'auto'
    }
  }, "Zapo\u010Dni razgovor\u2026"), messages.map(msg => {
    const who = msg.sender === currentUser?.username ? 'me' : 'them';
    return msg.offer ? /*#__PURE__*/React.createElement(OfferCard, {
      key: msg.id,
      msg: msg,
      who: who,
      currentUserId: currentUser?.id,
      onOfferAction: handleOfferAction,
      isReviewed: reviewedOfferIds.indexOf(msg.offer.id) !== -1
    }) : /*#__PURE__*/React.createElement(Bubble, {
      key: msg.id,
      who: who
    }, msg.body);
  }), /*#__PURE__*/React.createElement("div", {
    ref: bottomRef
  })), /*#__PURE__*/React.createElement("form", {
    onSubmit: send,
    style: {
      padding: 14,
      borderTop: '1px solid var(--line)',
      background: '#fff',
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "input",
    value: text,
    onChange: e => setText(e.target.value),
    placeholder: "Napi\u0161i poruku\u2026",
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    type: "submit",
    disabled: sending
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "send",
    size: 15
  })))))), reviewTarget && /*#__PURE__*/React.createElement(ReviewModal, {
    offer: reviewTarget,
    onClose: () => setReviewTarget(null),
    onSuccess: handleReviewSuccess
  }));
}

/* ─── BUBBLE ──────────────────────────────────────── */
function Bubble({
  who,
  children,
  onDelete
}) {
  const me = who === 'me';
  const [hovered, setHovered] = useS(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      alignSelf: me ? 'flex-end' : 'flex-start',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      maxWidth: '80%'
    },
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false)
  }, me && hovered && onDelete && /*#__PURE__*/React.createElement("button", {
    onClick: onDelete,
    title: "Obri\u0161i poruku",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--ink-3)',
      padding: 2,
      display: 'grid',
      placeItems: 'center',
      borderRadius: 4,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 13
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: me ? 'var(--accent)' : '#fff',
      color: me ? '#fff' : 'var(--ink)',
      padding: '10px 14px',
      borderRadius: 14,
      borderTopRightRadius: me ? 4 : 14,
      borderTopLeftRadius: me ? 14 : 4,
      fontSize: 14,
      boxShadow: me ? 'none' : '0 1px 2px rgba(0,0,0,.04)',
      border: me ? '0' : '1px solid var(--line)'
    }
  }, children));
}

/* ─── PHONE GATE MODAL ────────────────────────────── */
function PhoneGateModal({
  onClose,
  onSaved
}) {
  const [phone, setPhone] = useS('');
  const [saving, setSaving] = useS(false);
  const [error, setError] = useS('');
  const handleSave = async () => {
    const clean = phone.trim();
    if (!clean) {
      setError('Broj telefona je obavezan.');
      return;
    }
    setSaving(true);
    const res = await apiSavePhone(clean);
    setSaving(false);
    if (res.ok) onSaved(clean);else setError('Greška pri čuvanju. Pokušaj ponovo.');
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "scrim",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation(),
    style: {
      maxWidth: 400
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mh"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mt"
  }, "Ostavi broj telefona"), /*#__PURE__*/React.createElement("button", {
    className: "mx",
    onClick: onClose
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 24px 24px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 16px',
      fontSize: 14,
      color: 'var(--ink-2)',
      lineHeight: 1.6
    }
  }, "Broj telefona je neophodan kako bi ostali korisnici mogli da te kontaktiraju. Vidljiv je samo ulogovanim korisnicima."), /*#__PURE__*/React.createElement("input", {
    className: "finput",
    type: "tel",
    placeholder: "+381 60 123 4567",
    value: phone,
    onChange: e => {
      setPhone(e.target.value);
      setError('');
    },
    autoFocus: true,
    style: {
      width: '100%',
      boxSizing: 'border-box'
    }
  }), error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#dc2626',
      fontSize: 13,
      marginTop: 6
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    style: {
      width: '100%',
      marginTop: 16,
      justifyContent: 'center'
    },
    onClick: handleSave,
    disabled: saving
  }, saving ? 'Čuvanje...' : 'Sačuvaj i nastavi'))));
}

/* ─── PROFILE SCREEN ──────────────────────────────── */
function ProfileScreen({
  user: profileData,
  currentUser,
  onBack,
  onOpenItem,
  onOpenProfile
}) {
  const u = profileData.user || {};
  const listings = profileData.listings || [];
  const reviews = profileData.reviews || [];
  const joined = u.joined ? new Date(u.joined).toLocaleDateString('sr-Latn-RS', {
    year: 'numeric',
    month: 'long'
  }) : '';
  const initials = u.username ? u.username.slice(0, 2).toUpperCase() : '??';
  const displayName = u.first_name ? (u.first_name + ' ' + (u.last_name || '')).trim() : u.username;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 900,
      margin: '0 auto',
      padding: '24px 24px 60px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--ink-3)',
      fontSize: 13,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      marginBottom: 24,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-l",
    size: 14
  }), " Nazad"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      marginBottom: 32,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 72,
      height: 72,
      borderRadius: '50%',
      background: 'var(--accent-soft)',
      color: 'var(--accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 26,
      fontWeight: 700,
      flexShrink: 0
    }
  }, initials), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--ink)',
      fontFamily: 'var(--font-display)'
    }
  }, displayName), u.is_verified && /*#__PURE__*/React.createElement("span", {
    title: "Verifikovan korisnik",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      background: '#e6f4ea',
      color: '#276749',
      borderRadius: 20,
      padding: '2px 8px',
      fontSize: 12,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 12
  }), " Verifikovan")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap',
      marginTop: 6,
      fontSize: 13,
      color: 'var(--ink-3)'
    }
  }, u.city && /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "pin",
    size: 13,
    style: {
      verticalAlign: -2,
      marginRight: 2
    }
  }), u.city), joined && /*#__PURE__*/React.createElement("span", null, "\u010Clan od ", joined), u.rating_count > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)',
      fontWeight: 600
    }
  }, "\u2605 ", parseFloat(u.rating).toFixed(1), " \xB7 ", u.rating_count, " ", u.rating_count === 1 ? 'ocena' : 'ocene')), currentUser && u.phone && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--ink)',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "phone",
    size: 14,
    style: {
      color: 'var(--accent)'
    }
  }), /*#__PURE__*/React.createElement("a", {
    href: 'tel:' + u.phone,
    style: {
      color: 'inherit',
      textDecoration: 'none'
    }
  }, u.phone)))), listings.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 36
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--ink)',
      marginBottom: 16,
      fontFamily: 'var(--font-display)'
    }
  }, "Aktivni oglasi (", listings.length, ")"), /*#__PURE__*/React.createElement("div", {
    className: "list-grid"
  }, listings.map(l => {
    const norm = {
      id: l.id,
      title: l.title,
      price: l.price,
      type: l.listing_type,
      condition: l.condition,
      city: l.city,
      images: l.images || [],
      user: u.username,
      rating: u.rating,
      seek: l.wants_in_exchange || '',
      cat: l.category ? l.category.slug : '',
      desc: l.description || '',
      status: l.status
    };
    return /*#__PURE__*/React.createElement(ListingCard, {
      key: l.id,
      item: norm,
      onClick: () => onOpenItem(norm),
      fav: false,
      onFav: () => {},
      onOpenProfile: onOpenProfile
    });
  }))), reviews.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--ink)',
      marginBottom: 16,
      fontFamily: 'var(--font-display)'
    }
  }, "Recenzije (", reviews.length, ")"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, reviews.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: '#fff',
      border: '1px solid var(--line)',
      borderRadius: 12,
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 14,
      color: 'var(--ink)'
    }
  }, r.from_user), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#f59e0b',
      letterSpacing: 1
    }
  }, '★'.repeat(r.rating))), r.comment && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--ink-2)',
      lineHeight: 1.5
    }
  }, r.comment))))), listings.length === 0 && reviews.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '60px 0',
      color: 'var(--ink-3)',
      fontSize: 14
    }
  }, "Ovaj korisnik jo\u0161 nema aktivnih oglasa."));
}

/* ─── SETTINGS SCREEN ────────────────────── */
function SettingsScreen({
  currentUser,
  onUserUpdated
}) {
  const [tab, setTab] = useS('profile');

  // ── Javni profil ──
  const [bio, setBio] = useS(currentUser.bio || '');
  const [city, setCity] = useS(currentUser.city || '');
  const [phone, setPhone] = useS(currentUser.phone || '');
  const [saving, setSaving] = useS(false);
  const [saveMsg, setSaveMsg] = useS('');
  const [resendSent, setResendSent] = useS(false);
  const [resendErr, setResendErr] = useS('');
  const [saveErr, setSaveErr] = useS('');

  // ── Avatar ──
  const avatarRef = useR(null);
  const [avatarPreview, setAvatarPreview] = useS(currentUser.avatar || null);
  const [avatarUploading, setAvatarUploading] = useS(false);
  const [avatarErr, setAvatarErr] = useS('');

  // ── Lozinka ──
  const [oldPwd, setOldPwd] = useS('');
  const [newPwd, setNewPwd] = useS('');
  const [confPwd, setConfPwd] = useS('');
  const [pwdSaving, setPwdSaving] = useS(false);
  const [pwdMsg, setPwdMsg] = useS('');
  const [pwdErr, setPwdErr] = useS('');
  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg('');
    setSaveErr('');
    const res = await apiUpdateProfile({
      bio,
      city,
      phone
    });
    setSaving(false);
    if (res.ok) {
      onUserUpdated(res.user);
      setSaveMsg('Sačuvano.');
      setTimeout(() => setSaveMsg(''), 3000);
    } else {
      setSaveErr(res.error || 'Greška pri čuvanju.');
    }
  };
  const handleAvatarChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarErr('');
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    const res = await apiUploadAvatar(file);
    setAvatarUploading(false);
    if (res.ok) {
      onUserUpdated({
        ...currentUser,
        avatar: res.avatar
      });
      setAvatarPreview(res.avatar);
    } else {
      setAvatarErr(res.error || 'Greška pri uploadu.');
      setAvatarPreview(currentUser.avatar || null);
    }
  };
  const handleChangePassword = async () => {
    setPwdMsg('');
    setPwdErr('');
    if (newPwd !== confPwd) {
      setPwdErr('Lozinke se ne podudaraju.');
      return;
    }
    if (newPwd.length < 8) {
      setPwdErr('Nova lozinka mora imati najmanje 8 karaktera.');
      return;
    }
    setPwdSaving(true);
    const res = await apiChangePassword(oldPwd, newPwd);
    setPwdSaving(false);
    if (res.ok) {
      setOldPwd('');
      setNewPwd('');
      setConfPwd('');
      setPwdMsg('Lozinka uspešno promenjena.');
      setTimeout(() => setPwdMsg(''), 4000);
    } else {
      setPwdErr(res.error || 'Greška pri promeni lozinke.');
    }
  };
  const initials = currentUser.username ? currentUser.username.slice(0, 2).toUpperCase() : '??';
  const tabStyle = id => ({
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: tab === id ? 600 : 400,
    color: tab === id ? 'var(--accent)' : 'var(--ink-3)',
    borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
    background: 'none',
    border: 'none',
    borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
    cursor: 'pointer',
    transition: 'color .15s'
  });
  const card = {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 12,
    padding: '24px',
    marginBottom: 20
  };
  const label = {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--ink-2)',
    display: 'block',
    marginBottom: 6
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    style: {
      paddingTop: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-inner",
    style: {
      maxWidth: 640
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Pode\u0161avanja"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Upravljaj nalogom i li\u010Dnim podacima"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 0,
      borderBottom: '1px solid var(--line)',
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: tabStyle('profile'),
    onClick: () => setTab('profile')
  }, "Profil"), /*#__PURE__*/React.createElement("button", {
    style: tabStyle('security'),
    onClick: () => setTab('security')
  }, "Bezbednost")), tab === 'profile' && /*#__PURE__*/React.createElement("div", null, !currentUser.is_verified && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fffbeb',
      border: '1px solid #fcd34d',
      borderRadius: 10,
      padding: '14px 16px',
      marginBottom: 20,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "alert",
    size: 18,
    style: {
      color: '#b45309',
      flexShrink: 0,
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: '#92400e',
      marginBottom: 4
    }
  }, "Email nije verifikovan"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: '#b45309',
      lineHeight: 1.5
    }
  }, "Verifikuj svoju email adresu kako bi dobio/la oznaku verifikovanog korisnika."), resendSent ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontSize: 13,
      color: '#276749',
      fontWeight: 500
    }
  }, "Email je poslat na ", currentUser.email) : /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      setResendErr('');
      const r = await apiResendVerification();
      if (r.ok) setResendSent(true);else setResendErr('Greška. Pokušaj ponovo.');
    },
    style: {
      marginTop: 8,
      background: 'none',
      border: '1px solid #b45309',
      borderRadius: 6,
      padding: '5px 12px',
      fontSize: 13,
      color: '#92400e',
      cursor: 'pointer',
      fontWeight: 600
    }
  }, "Po\u0161alji verifikacioni email"), resendErr && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontSize: 12,
      color: '#dc2626'
    }
  }, resendErr))), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--ink)',
      marginBottom: 16,
      fontFamily: 'var(--font-display)'
    }
  }, "Profilna slika"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => avatarRef.current && avatarRef.current.click(),
    style: {
      width: 72,
      height: 72,
      borderRadius: '50%',
      flexShrink: 0,
      cursor: 'pointer',
      background: avatarPreview ? 'none' : 'var(--accent-soft)',
      color: 'var(--accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 26,
      fontWeight: 700,
      overflow: 'hidden',
      border: '2px solid var(--line)',
      position: 'relative'
    }
  }, avatarPreview ? /*#__PURE__*/React.createElement("img", {
    src: avatarPreview,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials, avatarUploading && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 20,
      border: '2px solid #fff',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin .7s linear infinite'
    }
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: () => avatarRef.current && avatarRef.current.click(),
    disabled: avatarUploading,
    style: {
      marginBottom: 6
    }
  }, avatarUploading ? 'Učitavanje...' : 'Promeni sliku'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)'
    }
  }, "JPG, PNG ili WebP \xB7 max 5 MB"), avatarErr && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#dc2626',
      fontSize: 13,
      marginTop: 4
    }
  }, avatarErr))), /*#__PURE__*/React.createElement("input", {
    ref: avatarRef,
    type: "file",
    accept: "image/*",
    style: {
      display: 'none'
    },
    onChange: handleAvatarChange
  })), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--ink)',
      marginBottom: 20,
      fontFamily: 'var(--font-display)'
    }
  }, "Li\u010Dni podaci"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: label
  }, "Korisni\u010Dko ime"), /*#__PURE__*/React.createElement("input", {
    className: "finput",
    value: currentUser.username,
    disabled: true,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      opacity: .6
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: label
  }, "Email"), /*#__PURE__*/React.createElement("input", {
    className: "finput",
    value: currentUser.email,
    disabled: true,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      opacity: .6
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: label
  }, "Grad"), /*#__PURE__*/React.createElement(CityPicker, {
    value: city,
    onChange: setCity,
    className: "finput",
    inputStyle: {
      width: '100%',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: label
  }, "Broj telefona ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: 'var(--ink-3)'
    }
  }, "(vidljiv samo ulogovanim korisnicima)")), /*#__PURE__*/React.createElement("input", {
    className: "finput",
    type: "tel",
    placeholder: "+381 60 123 4567",
    value: phone,
    onChange: e => setPhone(e.target.value),
    style: {
      width: '100%',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: label
  }, "Kratka bio"), /*#__PURE__*/React.createElement("textarea", {
    className: "finput",
    placeholder: "Nekoliko re\u010Di o tebi...",
    value: bio,
    onChange: e => setBio(e.target.value),
    rows: 3,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      resize: 'vertical',
      minHeight: 80
    }
  })), saveErr && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#dc2626',
      fontSize: 13,
      marginBottom: 12
    }
  }, saveErr), saveMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#276749',
      fontSize: 13,
      marginBottom: 12
    }
  }, saveMsg), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: handleSaveProfile,
    disabled: saving,
    style: {
      minWidth: 140
    }
  }, saving ? 'Čuvanje...' : 'Sačuvaj izmene'))), tab === 'security' && /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--ink)',
      marginBottom: 20,
      fontFamily: 'var(--font-display)'
    }
  }, "Promena lozinke"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: label
  }, "Trenutna lozinka"), /*#__PURE__*/React.createElement("input", {
    className: "finput",
    type: "password",
    value: oldPwd,
    onChange: e => {
      setOldPwd(e.target.value);
      setPwdErr('');
    },
    style: {
      width: '100%',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: label
  }, "Nova lozinka"), /*#__PURE__*/React.createElement("input", {
    className: "finput",
    type: "password",
    value: newPwd,
    onChange: e => {
      setNewPwd(e.target.value);
      setPwdErr('');
    },
    style: {
      width: '100%',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: label
  }, "Potvrdi novu lozinku"), /*#__PURE__*/React.createElement("input", {
    className: "finput",
    type: "password",
    value: confPwd,
    onChange: e => {
      setConfPwd(e.target.value);
      setPwdErr('');
    },
    style: {
      width: '100%',
      boxSizing: 'border-box'
    }
  })), pwdErr && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#dc2626',
      fontSize: 13,
      marginBottom: 12
    }
  }, pwdErr), pwdMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#276749',
      fontSize: 13,
      marginBottom: 12
    }
  }, pwdMsg), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: handleChangePassword,
    disabled: pwdSaving || !oldPwd || !newPwd || !confPwd,
    style: {
      minWidth: 180
    }
  }, pwdSaving ? 'Menjanje...' : 'Promeni lozinku'))));
}
Object.assign(window, {
  ListingDetail,
  PostAdModal,
  RazmeneDrawer,
  LoginModal,
  RegisterModal,
  EditAdModal,
  SavedScreen,
  RatingsScreen,
  CategoryPickerModal,
  ProfileScreen,
  PhoneGateModal,
  SettingsScreen
});function normalizeListings(apiListings) {
  return apiListings.map(l => ({
    id: l.id,
    title: l.title,
    price: l.price,
    type: l.listing_type,
    condition: l.condition,
    status: l.status,
    city: l.city,
    views: l.views,
    is_featured: l.is_featured || false,
    is_premium: l.is_premium || false,
    cat: l.category ? l.category.slug : '',
    catName: l.category ? l.category.name : '',
    user: l.user ? l.user.username : '',
    rating: l.user ? l.user.rating : 0,
    seek: l.wants_in_exchange || '',
    created: l.created_at,
    images: l.images || [],
    desc: l.description || ''
  }));
}
function normalizeCategories(apiCats) {
  return apiCats.map(c => ({
    id: c.slug,
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    tint: c.tint,
    count: c.count,
    children: (c.children || []).map(s => ({
      id: s.slug,
      slug: s.slug,
      name: s.name,
      icon: s.icon,
      count: s.count
    }))
  }));
}
const {
  useState: uS,
  useEffect: uE,
  useMemo,
  useRef: uR
} = React;
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#0d6e6f",
  "fontPair": "inter",
  "heroLayout": "split"
} /*EDITMODE-END*/;
const FONT_PAIRS = {
  inter: {
    display: '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
    ui: '"Inter", ui-sans-serif, system-ui, sans-serif',
    label: 'Inter Tight + Inter'
  },
  manrope: {
    display: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    ui: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    label: 'Manrope'
  },
  jakarta: {
    display: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    ui: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    label: 'Plus Jakarta'
  },
  fraunces: {
    display: '"Fraunces", ui-serif, Georgia, serif',
    ui: '"Inter", ui-sans-serif, system-ui, sans-serif',
    label: 'Fraunces + Inter'
  },
  geist: {
    display: '"Geist", ui-sans-serif, system-ui, sans-serif',
    ui: '"Geist", ui-sans-serif, system-ui, sans-serif',
    label: 'Geist'
  }
};
const ACCENTS = [{
  id: 'teal',
  value: '#0d6e6f'
}, {
  id: 'olive',
  value: '#5a6b2a'
}, {
  id: 'rust',
  value: '#b8590a'
}, {
  id: 'navy',
  value: '#1e3a5f'
}, {
  id: 'plum',
  value: '#6b2a5e'
}, {
  id: 'slate',
  value: '#374151'
}];
const FILTER_CHIPS = [{
  id: 'sve',
  label: 'Sve'
}, {
  id: 'barter',
  label: 'Razmena'
}, {
  id: 'sell',
  label: 'Prodaja'
}, {
  id: 'newest',
  label: 'Najnovije'
}, {
  id: 'with_img',
  label: 'Sa slikom'
}];
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = uS(() => window.__PRELOADED_LISTING__ ? 'detail' : 'home');
  const [selectedItem, setSelectedItem] = uS(() => {
    if (!window.__PRELOADED_LISTING__) return null;
    const [norm] = normalizeListings([window.__PRELOADED_LISTING__]);
    return norm;
  });
  const [profileUser, setProfileUser] = uS(null);
  const [phoneGate, setPhoneGate] = uS(null); // callback to run after phone saved
  const [filterCat, setFilterCat] = uS('sve');
  const [filterChip, setFilterChip] = uS('sve');
  const [searchQuery, setSearchQuery] = uS('');
  const [searchMode, setSearchMode] = uS('find');
  const [filterCity, setFilterCity] = uS('');
  const [filterRadius, setFilterRadius] = uS(10);
  const [filterConditions, setFilterConditions] = uS([]);
  const [filterMaxPrice, setFilterMaxPrice] = uS(300000);
  const [filterBarter, setFilterBarter] = uS(false);
  const [filterPremium, setFilterPremium] = uS(false);
  const [filterSort, setFilterSort] = uS('newest');
  const [catPickerOpen, setCatPickerOpen] = uS(false);
  const [page, setPage] = uS(1);
  const [totalPages, setTotalPages] = uS(1);
  const [totalCount, setTotalCount] = uS(0);
  const [listingsLoading, setListingsLoading] = uS(false);
  const [favPending, setFavPending] = uS({});
  const [postOpen, setPostOpen] = uS(false);
  const [razmeneOpen, setRazmeneOpen] = uS(false);
  const [messageTarget, setMessageTarget] = uS(null);
  const [notifsOpen, setNotifsOpen] = uS(false);
  const [mobileNotifsOpen, setMobileNotifsOpen] = uS(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = uS(false);
  const [userOpen, setUserOpen] = uS(false);
  const [loginOpen, setLoginOpen] = uS(false);
  const [registerOpen, setRegisterOpen] = uS(false);
  const [editItem, setEditItem] = uS(null);
  const [deleteConfirm, setDeleteConfirm] = uS(false);
  const [pendingOffer, setPendingOffer] = uS(null);
  const [heroPendingOffers, setHeroPendingOffers] = uS([]);
  const [listings, setListings] = uS([]);
  const [categories, setCategories] = uS([]);
  const [currentUser, setCurrentUser] = uS(null);
  const [notifications, setNotifications] = uS([]);
  const [wishlistIds, setWishlistIds] = uS({});
  const [loading, setLoading] = uS(true);
  const [apiError, setApiError] = uS(null);
  const [ownerListings, setOwnerListings] = uS(null);
  const [verifiedToast, setVerifiedToast] = uS(() => {
    const p = new URLSearchParams(window.location.search);
    const v = p.get('verified');
    if (v === '1') return 'success';
    if (v === 'expired') return 'expired';
    if (v === 'invalid') return 'invalid';
    return false;
  });
  const unreadNotifs = notifications.filter(n => !n.is_read).length;
  const unreadThreads = 0;

  // ── URL helpers ──────────────────────────────────────────────
  const viewToPath = (v, item) => {
    if (v === 'detail' && item) return '/oglasi/' + item.id;
    if (v === 'profile' && item) return '/profil/' + item.username;
    if (v === 'search') return '/pretraga';
    if (v === 'my-listings') return '/moji-oglasi';
    if (v === 'saved') return '/sacuvano';
    if (v === 'ratings') return '/ocene';
    if (v === 'settings') return '/podesavanja';
    return '/';
  };
  const pathToView = path => {
    if (path.startsWith('/oglasi/')) return 'detail';
    if (path.startsWith('/profil/')) return 'profile';
    if (path === '/pretraga') return 'search';
    if (path === '/moji-oglasi') return 'my-listings';
    if (path === '/sacuvano') return 'saved';
    if (path === '/ocene') return 'ratings';
    if (path === '/podesavanja') return 'settings';
    return 'home';
  };
  const navigate = (v, item, replace) => {
    const path = viewToPath(v, item);
    const state = {
      view: v,
      itemId: item ? item.id || item.username : null
    };
    if (replace) history.replaceState(state, '', path);else history.pushState(state, '', path);
    setView(v);
    if (v === 'profile' && item) {
      apiUserProfile(item.username).then(res => {
        if (res.user) setProfileUser(res);
      });
    } else {
      if (item !== undefined) setSelectedItem(item);
    }
  };
  const onOpenProfile = username => {
    navigate('profile', {
      username
    });
  };
  const loadHeroPending = () => {
    apiMyOffers().then(res => {
      if (res.ok && res.results) {
        setHeroPendingOffers(res.results.filter(o => o.status === 'pending' && !o.is_sender));
      }
    });
  };
  uE(() => {
    // read initial URL so direct links and refreshes work
    const initView = pathToView(window.location.pathname);
    const initItemId = window.location.pathname.startsWith('/oglasi/') ? window.location.pathname.split('/oglasi/')[1] : null;

    // seed the current history entry with state so popstate works on first back
    history.replaceState({
      view: initView,
      itemId: initItemId
    }, '', window.location.pathname);
    Promise.all([apiAuthStatus(), apiCategories()]).then(([auth, catData]) => {
      if (auth.authenticated) {
        setCurrentUser(auth.user);
        apiNotifications().then(res => {
          if (res.ok && res.results) setNotifications(res.results);
        });
        loadHeroPending();
        apiWishlistIds().then(res => {
          if (res.ids) {
            const map = {};
            res.ids.forEach(id => {
              map[id] = true;
            });
            setWishlistIds(map);
          }
        });
      }
      setCategories([{
        id: 'sve',
        slug: 'sve',
        name: 'Sve kategorije',
        icon: 'grid',
        count: 0,
        children: []
      }, ...normalizeCategories(catData.results || [])]);

      // if landing on /oglasi/<id> directly, load the listing
      if (initView === 'detail' && initItemId) {
        apiListingDetail(initItemId).then(res => {
          if (res.id) {
            const [norm] = normalizeListings([res]);
            setSelectedItem(norm);
            setView('detail');
          } else {
            setView('home');
          }
        });
      } else {
        setView(initView);
      }
      setLoading(false);
    }).catch(err => {
      console.error('API greška:', err);
      setApiError('Nije moguće učitati podatke. Provjeri da li server radi.');
      setLoading(false);
    });
  }, []);

  // poll for new notifications every 30s when logged in
  uE(() => {
    if (!currentUser) return;
    const id = setInterval(() => {
      apiNotifications().then(res => {
        if (res.ok && res.results) setNotifications(res.results);
      });
    }, 30000);
    return () => clearInterval(id);
  }, [currentUser]);

  // Service worker + push notifications
  uE(() => {
    if (!currentUser || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.pushManager.getSubscription().then(existing => {
        if (existing) return; // already subscribed
        if (Notification.permission === 'default') {
          Notification.requestPermission().then(perm => {
            if (perm !== 'granted') return;
            _subscribePush(reg);
          });
        } else if (Notification.permission === 'granted') {
          _subscribePush(reg);
        }
      });
    }).catch(() => {});
  }, [currentUser]);
  function _subscribePush(reg) {
    const vapidKey = document.querySelector('meta[name="vapid-public-key"]');
    if (!vapidKey || !vapidKey.content) return;
    const appServerKey = _urlBase64ToUint8Array(vapidKey.content);
    reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey
    }).then(sub => apiPushSubscribe(sub.toJSON())).catch(() => {});
  }
  function _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
  }

  // handle browser back/forward
  uE(() => {
    const onPop = e => {
      const state = e.state || {};
      const v = state.view || pathToView(window.location.pathname);
      if (v === 'detail' && state.itemId) {
        const found = listings.find(l => String(l.id) === String(state.itemId));
        if (found) {
          setSelectedItem(found);
          setView('detail');
        } else {
          apiListingDetail(state.itemId).then(res => {
            if (res.id) {
              const [norm] = normalizeListings([res]);
              setSelectedItem(norm);
              setView('detail');
            } else {
              setView('home');
            }
          });
        }
      } else {
        setSelectedItem(null);
        setView(v);
      }
      window.scrollTo({
        top: 0
      });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [listings]);
  uE(() => {
    const r = document.documentElement;
    r.style.setProperty('--accent', t.accent);
    r.style.setProperty('--accent-soft', 'color-mix(in oklab, ' + t.accent + ' 12%, #fff)');
    r.style.setProperty('--accent-softer', 'color-mix(in oklab, ' + t.accent + ' 6%, #fff)');
    const pair = FONT_PAIRS[t.fontPair] || FONT_PAIRS.inter;
    r.style.setProperty('--font-display', pair.display);
    r.style.setProperty('--font-ui', pair.ui);
  }, [t.accent, t.fontPair]);
  uE(() => {
    if (!notifsOpen && !userOpen) return;
    const onClick = e => {
      if (!e.target.closest('.pop') && !e.target.closest('.menu') && !e.target.closest('button')) {
        setNotifsOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [notifsOpen, userOpen]);
  uE(() => {
    const onKey = e => {
      if (e.key !== 'Escape') return;
      if (deleteConfirm) setDeleteConfirm(false);else if (editItem) setEditItem(null);else if (loginOpen) setLoginOpen(false);else if (registerOpen) setRegisterOpen(false);else if (postOpen) setPostOpen(false);else if (razmeneOpen) setRazmeneOpen(false);else if (notifsOpen) setNotifsOpen(false);else if (userOpen) setUserOpen(false);else if (view === 'detail') {
        navigate('home', null);
        setPendingOffer(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  uE(() => {
    if (!notifsOpen || unreadNotifs === 0) return;
    apiMarkNotificationsRead().then(() => {
      setNotifications(prev => prev.map(n => ({
        ...n,
        is_read: true
      })));
    });
  }, [notifsOpen]);
  uE(() => {
    const handler = e => {
      const {
        id,
        offer,
        senderUsername
      } = e.detail;
      const item = listings.find(l => String(l.id) === String(id));
      if (item) {
        setRazmeneOpen(false);
        setMessageTarget(null);
        setPendingOffer(offer ? {
          offer,
          senderUsername
        } : null);
        navigate('detail', item);
        window.scrollTo({
          top: 0
        });
      }
    };
    window.addEventListener('dj:viewListing', handler);
    return () => window.removeEventListener('dj:viewListing', handler);
  }, [listings]);
  const handleLoginSuccess = user => {
    setCurrentUser(user);
    setLoginOpen(false);
    setRegisterOpen(false);
    apiNotifications().then(res => {
      if (res.ok && res.results) setNotifications(res.results);
    });
    apiWishlistIds().then(res => {
      if (res.ids) {
        const map = {};
        res.ids.forEach(id => {
          map[id] = true;
        });
        setWishlistIds(map);
      }
    });
  };
  const handleLogout = async () => {
    await apiLogout();
    setCurrentUser(null);
    setNotifications([]);
    setWishlistIds({});
    setUserOpen(false);
  };
  const handleSaveToggle = (id, saved) => {
    setWishlistIds(prev => {
      const next = Object.assign({}, prev);
      if (saved) next[id] = true;else delete next[id];
      return next;
    });
  };
  const handleMarkRead = async () => {
    await apiMarkNotificationsRead();
    setNotifications(prev => prev.map(n => ({
      ...n,
      is_read: true
    })));
  };
  const handleNotifClick = notif => {
    setNotifsOpen(false);
    setMessageTarget(null);
    setRazmeneOpen(true);
  };
  const requirePhone = action => {
    if (!currentUser) {
      setLoginOpen(true);
      return;
    }
    if (currentUser.has_phone) {
      action();
      return;
    }
    setPhoneGate(() => action);
  };
  const requireAuth = action => {
    if (currentUser) action();else setLoginOpen(true);
  };
  const handleOfferRespond = async (offerId, action) => {
    const res = await apiRespondToOffer(offerId, action);
    if (res.ok) setPendingOffer(null);
  };
  const handleHeroOfferRespond = async (offerId, action) => {
    const res = await apiRespondToOffer(offerId, action);
    if (res.ok) setHeroPendingOffers(prev => prev.filter(o => o.id !== offerId));
  };
  const buildParams = p => {
    const params = {
      page: p || page
    };
    if (searchQuery) params.q = searchQuery;
    if (filterCat !== 'sve') {
      const cat = categories.find(c => c.id === filterCat);
      if (cat) params.category = cat.slug;
    }
    if (filterCity) params.city = filterCity;
    if (filterBarter) params.type = 'barter';
    if (filterChip === 'sell') params.type = 'sell';
    if (filterPremium) params.premium = '1';
    if (filterConditions.length > 0) params.condition = filterConditions.join(',');
    if (filterMaxPrice < 300000) params.max_price = filterMaxPrice;
    const sortMap = {
      newest: '-created_at',
      price_asc: 'price',
      price_desc: '-price'
    };
    params.sort = sortMap[filterSort] || '-created_at';
    if (searchMode === 'offer') params.search_mode = 'offer';
    return params;
  };
  const fetchListings = p => {
    setListingsLoading(true);
    apiListings(buildParams(p)).then(res => {
      setListings(normalizeListings(res.results || []));
      setTotalPages(res.pages || 1);
      setTotalCount(res.count || 0);
      setListingsLoading(false);
    });
  };
  uE(() => {
    if (view !== 'search' && view !== 'home') return;
    setPage(1);
    fetchListings(1);
  }, [filterCat, searchQuery, filterCity, filterBarter, filterChip, filterPremium, filterConditions, filterMaxPrice, filterSort, searchMode]);
  uE(() => {
    if (view !== 'search' && view !== 'home') return;
    if (page === 1) return; // filter effect handles page 1
    fetchListings(page);
  }, [page]);
  uE(() => {
    if (view !== 'my-listings') return;
    apiMyListings(true).then(res => {
      if (res.ok) setOwnerListings(res.results || []);
    });
  }, [view]);
  const handleRenew = async id => {
    const res = await apiRenewListing(id);
    if (res.ok) {
      apiMyListings(true).then(r => {
        if (r.ok) setOwnerListings(r.results || []);
      });
    }
  };
  const filtered = listings;
  const resetFilters = () => {
    setFilterBarter(false);
    setFilterPremium(false);
    setFilterCity('');
    setFilterConditions([]);
    setFilterMaxPrice(300000);
    setFilterCat('sve');
    setFilterSort('newest');
  };
  const hasActiveFilters = filterBarter || filterPremium || filterCity || filterConditions.length > 0 || filterMaxPrice < 300000 || filterCat !== 'sve';
  const onSearch = (q, mode) => {
    setSearchQuery(q);
    if (mode) setSearchMode(mode);
    setFilterChip('sve');
    navigate('search', null);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const onSelectCat = id => {
    setFilterCat(id);
    setFilterChip('sve');
    navigate('search', null);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const onOpenItem = item => {
    navigate('detail', item);
    window.scrollTo({
      top: 0
    });
  };
  const toggleFav = async id => {
    if (!currentUser) {
      setLoginOpen(true);
      return;
    }
    if (favPending[id]) return;
    setFavPending(p => Object.assign({}, p, {
      [id]: true
    }));
    const res = await apiToggleWishlist(id);
    if (res.ok) handleSaveToggle(id, res.saved);
    setFavPending(p => {
      const n = Object.assign({}, p);
      delete n[id];
      return n;
    });
  };
  const onCreatedListing = newListing => {
    if (!newListing) return;
    const [normalized] = normalizeListings([newListing]);
    setListings(prev => [normalized, ...prev]);
    setOwnerListings(null);
    apiCategories().then(catData => {
      if (catData && catData.results) {
        setCategories([{
          id: 'sve',
          slug: 'sve',
          name: 'Sve kategorije',
          icon: 'grid',
          tint: '',
          count: 0,
          children: []
        }, ...normalizeCategories(catData.results)]);
      }
    });
  };
  const handleDelete = async () => {
    await apiDeleteListing(selectedItem.id);
    setListings(prev => prev.filter(l => l.id !== selectedItem.id));
    setOwnerListings(null);
    setDeleteConfirm(false);
    navigate('home', null);
  };
  if (loading) return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      background: 'var(--bg)',
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      border: '3px solid var(--line)',
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }
  }), /*#__PURE__*/React.createElement("style", null, '@keyframes spin { to { transform: rotate(360deg) } }'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14
    }
  }, "U\u010Ditavanje..."));
  if (apiError) return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      background: 'var(--bg)',
      color: 'var(--ink-2)',
      fontFamily: 'var(--font-ui)',
      padding: 24,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 32
    }
  }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      color: 'var(--ink)'
    }
  }, "Gre\u0161ka pri u\u010Ditavanju"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      maxWidth: 360
    }
  }, apiError), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    style: {
      marginTop: 8
    },
    onClick: () => window.location.reload()
  }, "Poku\u0161aj ponovo"));
  const myListings = listings.filter(l => l.user === currentUser?.username);
  const VIEW_LABELS = {
    saved: 'Sačuvani oglasi',
    ratings: 'Ocene i istorija',
    settings: 'Podešavanja'
  };
  const activeCat = categories.find(c => c.id === filterCat);
  return /*#__PURE__*/React.createElement("div", {
    className: "app",
    "data-screen-label": "01 Daj Zameni \u2014 Home"
  }, /*#__PURE__*/React.createElement(Nav, {
    notifications: notifications,
    unreadNotifs: unreadNotifs,
    unreadThreads: unreadThreads,
    currentUser: currentUser,
    onPostAd: () => requirePhone(() => setPostOpen(true)),
    onOpenNotifs: e => {
      if (e && e.stopPropagation) e.stopPropagation();
      if (window.innerWidth < 640) {
        setMobileNotifsOpen(true);
        if (unreadNotifs > 0) apiMarkNotificationsRead().then(() => setNotifications(prev => prev.map(n => ({
          ...n,
          is_read: true
        }))));
      } else {
        setUserOpen(false);
        setNotifsOpen(v => !v);
      }
    },
    onOpenRazmene: () => requireAuth(() => {
      setMessageTarget(null);
      setRazmeneOpen(true);
    }),
    onOpenUser: e => {
      e.stopPropagation();
      setNotifsOpen(false);
      setUserOpen(v => !v);
    },
    openNotifs: notifsOpen,
    openUser: userOpen,
    onSearch: onSearch,
    onNav: v => {
      navigate(v, null);
      setSearchQuery('');
      setFilterCat('sve');
      setFilterChip('sve');
      setUserOpen(false);
    },
    onLogin: () => setLoginOpen(true),
    onLogout: handleLogout,
    onMarkRead: handleMarkRead,
    onNotifClick: handleNotifClick,
    categories: categories,
    onSelectCat: onSelectCat
  }), verifiedToast && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2000,
      background: verifiedToast === 'success' ? '#276749' : '#c53030',
      color: '#fff',
      borderRadius: 10,
      padding: '14px 20px',
      fontSize: 14,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxShadow: '0 4px 20px rgba(0,0,0,.18)',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16
  }), verifiedToast === 'success' && 'Email uspešno verifikovan!', verifiedToast === 'expired' && 'Verifikacioni link je istekao. Pošalji novi.', verifiedToast === 'invalid' && 'Verifikacioni link nije validan.', /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setVerifiedToast(false);
      window.history.replaceState({}, '', '/');
    },
    style: {
      background: 'none',
      border: 'none',
      color: '#fff',
      cursor: 'pointer',
      fontSize: 18,
      lineHeight: 1,
      marginLeft: 4
    }
  }, "\xD7")), document.body), view === 'home' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Hero, {
    layout: t.heroLayout,
    accent: t.accent,
    onSearch: onSearch,
    onPostAd: () => requirePhone(() => setPostOpen(true)),
    onCityChange: (city, radius) => {
      setFilterCity(city);
      setFilterRadius(radius);
      if (city) {
        navigate('search', null);
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    },
    pendingOffers: heroPendingOffers,
    onOfferRespond: handleHeroOfferRespond
  }), /*#__PURE__*/React.createElement(TrustStrip, null), /*#__PURE__*/React.createElement(Categories, {
    categories: categories,
    onSelect: onSelectCat
  }), /*#__PURE__*/React.createElement("section", {
    className: "section",
    "data-screen-label": "01b Featured listings"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Najnoviji oglasi u tvojoj okolini"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, listings.length, " oglasa \xB7 sortirano po datumu")), /*#__PURE__*/React.createElement("div", {
    className: "link",
    onClick: () => onSelectCat('sve')
  }, "Pogledaj sve ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-r",
    size: 14
  }))), listings.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '48px 0',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 14
    }
  }, "Jo\u0161 nema oglasa. Budi prvi!", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    style: {
      marginTop: 14
    },
    onClick: () => requirePhone(() => setPostOpen(true))
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 14
  }), " Postavi oglas")) : /*#__PURE__*/React.createElement("div", {
    className: "list-grid"
  }, listings.slice(0, 12).map(l => /*#__PURE__*/React.createElement(ListingCard, {
    key: l.id,
    item: l,
    fav: !!wishlistIds[l.id],
    onFav: () => toggleFav(l.id),
    onClick: () => onOpenItem(l),
    onOpenProfile: onOpenProfile
  }))))), /*#__PURE__*/React.createElement(HowItWorks, null), /*#__PURE__*/React.createElement(Footer, null)), view === 'search' && /*#__PURE__*/React.createElement("div", {
    className: "search-layout"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "search-aside"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--line)',
      borderRadius: 12,
      padding: '16px',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.07em',
      color: 'var(--ink-3)',
      marginBottom: 10,
      textTransform: 'uppercase'
    }
  }, "Kategorija"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCatPickerOpen(true),
    style: {
      width: '100%',
      padding: '9px 12px',
      borderRadius: 8,
      border: '1px solid ' + (filterCat !== 'sve' ? 'var(--accent)' : 'var(--line)'),
      background: filterCat !== 'sve' ? 'var(--accent-soft)' : '#faf8f1',
      fontSize: 13,
      color: filterCat !== 'sve' ? 'var(--accent)' : 'var(--ink-2)',
      cursor: 'pointer',
      fontWeight: filterCat !== 'sve' ? 600 : 400,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "grid",
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, filterCat !== 'sve' ? activeCat ? activeCat.name : filterCat : 'Izaberi kategoriju'), filterCat !== 'sve' && /*#__PURE__*/React.createElement("span", {
    onClick: e => {
      e.stopPropagation();
      setFilterCat('sve');
    },
    style: {
      color: 'var(--accent)',
      fontSize: 16,
      lineHeight: 1,
      fontWeight: 700
    }
  }, "\xD7")), activeCat && activeCat.children && activeCat.children.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 5
    }
  }, activeCat.children.map(s => /*#__PURE__*/React.createElement("span", {
    key: s.id,
    onClick: () => setFilterCat(s.id),
    style: {
      fontSize: 11,
      padding: '3px 8px',
      borderRadius: 6,
      cursor: 'pointer',
      border: '1px solid ' + (filterCat === s.id ? 'var(--accent)' : 'var(--line)'),
      background: filterCat === s.id ? 'var(--accent-soft)' : '#fff',
      color: filterCat === s.id ? 'var(--accent)' : 'var(--ink-2)',
      fontWeight: filterCat === s.id ? 600 : 400
    }
  }, s.name)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--line)',
      borderRadius: 12,
      padding: '16px',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.07em',
      color: 'var(--ink-3)',
      marginBottom: 12,
      textTransform: 'uppercase'
    }
  }, "Tip oglasa"), [{
    state: filterBarter,
    set: setFilterBarter,
    label: 'Spreman za razmenu',
    count: listings.filter(l => l.type === 'barter' || l.type === 'both').length
  }, {
    state: filterPremium,
    set: setFilterPremium,
    label: 'Premium oglasi',
    count: listings.filter(l => l.is_premium || l.is_featured).length
  }].map(opt => /*#__PURE__*/React.createElement("label", {
    key: opt.label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      cursor: 'pointer',
      marginBottom: 10,
      fontSize: 13,
      color: 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: opt.state,
    onChange: e => opt.set(e.target.checked),
    style: {
      width: 16,
      height: 16,
      accentColor: 'var(--accent)',
      cursor: 'pointer'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, opt.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)'
    }
  }, opt.count)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--line)',
      borderRadius: 12,
      padding: '16px',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.07em',
      color: 'var(--ink-3)',
      marginBottom: 10,
      textTransform: 'uppercase'
    }
  }, "Grad ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      textTransform: 'none',
      fontSize: 10,
      color: 'var(--ink-4)'
    }
  }, "(obavezno)")), /*#__PURE__*/React.createElement("select", {
    value: filterCity,
    onChange: e => setFilterCity(e.target.value),
    style: {
      width: '100%',
      padding: '9px 10px',
      borderRadius: 8,
      border: '1px solid var(--line)',
      fontSize: 13,
      color: 'var(--ink)',
      background: '#faf8f1',
      outline: 'none',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Svi gradovi"), (typeof CITIES !== 'undefined' ? CITIES : []).map(c => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: c
  }, c)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--line)',
      borderRadius: 12,
      padding: '16px',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.07em',
      color: 'var(--ink-3)',
      marginBottom: 4,
      textTransform: 'uppercase'
    }
  }, "Cena ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: 0,
      color: 'var(--ink-2)'
    }
  }, "do ", filterMaxPrice >= 300000 ? '300.000+' : filterMaxPrice.toLocaleString('sr-RS'), " RSD")), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 1000,
    max: 300000,
    step: 1000,
    value: filterMaxPrice,
    onChange: e => setFilterMaxPrice(Number(e.target.value)),
    style: {
      width: '100%',
      accentColor: 'var(--accent)',
      marginTop: 10,
      marginBottom: 4
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 11,
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "1.000"), /*#__PURE__*/React.createElement("span", null, "300.000+"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--line)',
      borderRadius: 12,
      padding: '16px',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.07em',
      color: 'var(--ink-3)',
      marginBottom: 12,
      textTransform: 'uppercase'
    }
  }, "Stanje"), [{
    id: 'new',
    label: 'Novo'
  }, {
    id: 'like_new',
    label: 'Polovno — kao novo'
  }, {
    id: 'good',
    label: 'Polovno — odlično'
  }, {
    id: 'fair',
    label: 'Polovno — vrlo dobro'
  }, {
    id: 'poor',
    label: 'Polovno — dobro'
  }, {
    id: 'antique',
    label: 'Antikvitet'
  }].map(opt => /*#__PURE__*/React.createElement("label", {
    key: opt.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      cursor: 'pointer',
      marginBottom: 9,
      fontSize: 13,
      color: 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: filterConditions.includes(opt.id),
    onChange: e => setFilterConditions(prev => e.target.checked ? [...prev, opt.id] : prev.filter(c => c !== opt.id)),
    style: {
      width: 16,
      height: 16,
      accentColor: 'var(--accent)',
      cursor: 'pointer'
    }
  }), opt.label))), hasActiveFilters && /*#__PURE__*/React.createElement("button", {
    onClick: resetFilters,
    style: {
      width: '100%',
      padding: '9px',
      borderRadius: 8,
      border: '1px solid var(--line)',
      background: '#fff',
      fontSize: 13,
      color: 'var(--ink-2)',
      cursor: 'pointer',
      fontWeight: 500
    }
  }, "Resetuj filtere")), mobileFiltersOpen && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    className: "filter-sheet-overlay",
    onClick: () => setMobileFiltersOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "filter-sheet",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "filter-sheet-handle"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      fontFamily: 'var(--font-display)',
      color: 'var(--ink)'
    }
  }, "Filteri"), hasActiveFilters && /*#__PURE__*/React.createElement("button", {
    onClick: resetFilters,
    style: {
      background: 'none',
      border: 'none',
      fontSize: 13,
      color: 'var(--accent)',
      cursor: 'pointer',
      fontWeight: 600
    }
  }, "Resetuj")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.07em',
      color: 'var(--ink-3)',
      marginBottom: 8,
      textTransform: 'uppercase'
    }
  }, "Kategorija"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setMobileFiltersOpen(false);
      setCatPickerOpen(true);
    },
    style: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: 8,
      border: '1px solid ' + (filterCat !== 'sve' ? 'var(--accent)' : 'var(--line)'),
      background: filterCat !== 'sve' ? 'var(--accent-soft)' : '#faf8f1',
      fontSize: 13,
      color: filterCat !== 'sve' ? 'var(--accent)' : 'var(--ink-2)',
      cursor: 'pointer',
      fontWeight: filterCat !== 'sve' ? 600 : 400,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "grid",
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, filterCat !== 'sve' ? activeCat ? activeCat.name : filterCat : 'Izaberi kategoriju'), filterCat !== 'sve' && /*#__PURE__*/React.createElement("span", {
    onClick: e => {
      e.stopPropagation();
      setFilterCat('sve');
    },
    style: {
      color: 'var(--accent)',
      fontSize: 16,
      fontWeight: 700
    }
  }, "\xD7"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.07em',
      color: 'var(--ink-3)',
      marginBottom: 10,
      textTransform: 'uppercase'
    }
  }, "Tip oglasa"), [{
    state: filterBarter,
    set: setFilterBarter,
    label: 'Spreman za razmenu'
  }, {
    state: filterPremium,
    set: setFilterPremium,
    label: 'Premium oglasi'
  }].map(opt => /*#__PURE__*/React.createElement("label", {
    key: opt.label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      marginBottom: 12,
      fontSize: 14,
      color: 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: opt.state,
    onChange: e => opt.set(e.target.checked),
    style: {
      width: 18,
      height: 18,
      accentColor: 'var(--accent)',
      cursor: 'pointer'
    }
  }), opt.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.07em',
      color: 'var(--ink-3)',
      marginBottom: 8,
      textTransform: 'uppercase'
    }
  }, "Grad"), /*#__PURE__*/React.createElement("select", {
    value: filterCity,
    onChange: e => setFilterCity(e.target.value),
    style: {
      width: '100%',
      padding: '10px',
      borderRadius: 8,
      border: '1px solid var(--line)',
      fontSize: 14,
      color: 'var(--ink)',
      background: '#faf8f1',
      outline: 'none'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Svi gradovi"), (typeof CITIES !== 'undefined' ? CITIES : []).map(c => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: c
  }, c)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.07em',
      color: 'var(--ink-3)',
      marginBottom: 4,
      textTransform: 'uppercase'
    }
  }, "Cena do ", filterMaxPrice >= 300000 ? '300.000+' : filterMaxPrice.toLocaleString('sr-RS'), " RSD"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 1000,
    max: 300000,
    step: 1000,
    value: filterMaxPrice,
    onChange: e => setFilterMaxPrice(Number(e.target.value)),
    style: {
      width: '100%',
      accentColor: 'var(--accent)',
      marginTop: 8
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 11,
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, "1.000"), /*#__PURE__*/React.createElement("span", null, "300.000+"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.07em',
      color: 'var(--ink-3)',
      marginBottom: 10,
      textTransform: 'uppercase'
    }
  }, "Stanje"), [{
    id: 'new',
    label: 'Novo'
  }, {
    id: 'like_new',
    label: 'Polovno — kao novo'
  }, {
    id: 'good',
    label: 'Polovno — odlično'
  }, {
    id: 'fair',
    label: 'Polovno — vrlo dobro'
  }, {
    id: 'poor',
    label: 'Polovno — dobro'
  }, {
    id: 'antique',
    label: 'Antikvitet'
  }].map(opt => /*#__PURE__*/React.createElement("label", {
    key: opt.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      marginBottom: 10,
      fontSize: 14,
      color: 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: filterConditions.includes(opt.id),
    onChange: e => setFilterConditions(prev => e.target.checked ? [...prev, opt.id] : prev.filter(c => c !== opt.id)),
    style: {
      width: 18,
      height: 18,
      accentColor: 'var(--accent)',
      cursor: 'pointer'
    }
  }), opt.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.07em',
      color: 'var(--ink-3)',
      marginBottom: 10,
      textTransform: 'uppercase'
    }
  }, "Sortiranje"), [{
    id: 'newest',
    label: 'Najnovije'
  }, {
    id: 'price_asc',
    label: 'Cena: rastuće'
  }, {
    id: 'price_desc',
    label: 'Cena: opadajuće'
  }].map(opt => /*#__PURE__*/React.createElement("label", {
    key: opt.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      marginBottom: 10,
      fontSize: 14,
      color: 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "sort",
    checked: filterSort === opt.id,
    onChange: () => setFilterSort(opt.id),
    style: {
      width: 18,
      height: 18,
      accentColor: 'var(--accent)',
      cursor: 'pointer'
    }
  }), opt.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      position: 'sticky',
      bottom: 0,
      background: '#fff',
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    style: {
      width: '100%',
      justifyContent: 'center',
      fontSize: 15
    },
    onClick: () => setMobileFiltersOpen(false)
  }, "Prika\u017Ei ", totalCount, " ", totalCount === 1 ? 'oglas' : 'oglasa')))), document.body), /*#__PURE__*/React.createElement("main", {
    className: "search-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mobile-filter-bar",
    style: {
      display: 'none',
      alignItems: 'center',
      gap: 8,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setMobileFiltersOpen(true),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '9px 14px',
      borderRadius: 8,
      border: '1px solid ' + (hasActiveFilters ? 'var(--accent)' : 'var(--line)'),
      background: hasActiveFilters ? 'var(--accent-soft)' : '#fff',
      fontSize: 13,
      fontWeight: 600,
      color: hasActiveFilters ? 'var(--accent)' : 'var(--ink)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "filter",
    size: 14
  }), "Filteri", hasActiveFilters && /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--accent)',
      color: '#fff',
      borderRadius: '50%',
      width: 18,
      height: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      fontWeight: 700
    }
  }, [filterBarter, filterPremium, filterCity, filterConditions.length > 0, filterMaxPrice < 300000, filterCat !== 'sve'].filter(Boolean).length)), hasActiveFilters && /*#__PURE__*/React.createElement("button", {
    onClick: resetFilters,
    style: {
      background: 'none',
      border: 'none',
      fontSize: 13,
      color: 'var(--ink-3)',
      cursor: 'pointer',
      padding: '4px 0'
    }
  }, "Resetuj")), /*#__PURE__*/React.createElement("div", {
    className: "search-text-row",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      color: 'var(--ink-3)',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      cursor: 'pointer',
      color: 'var(--accent)'
    },
    onClick: () => navigate('home', null)
  }, "Po\u010Detna"), /*#__PURE__*/React.createElement("span", null, "\u203A"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-2)'
    }
  }, filterCat !== 'sve' ? activeCat?.name || 'Oglasi' : 'Oglasi')), /*#__PURE__*/React.createElement("div", {
    className: "search-text-row",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 22,
      fontFamily: 'var(--font-display)',
      fontWeight: 700
    }
  }, searchQuery ? 'Rezultati: \u201e' + searchQuery + '\u201c' : activeCat?.name || 'Svi oglasi'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-3)',
      marginTop: 3
    }
  }, totalCount, " oglasa")), /*#__PURE__*/React.createElement("select", {
    value: filterSort,
    onChange: e => setFilterSort(e.target.value),
    className: "sort-select-desktop",
    style: {
      padding: '8px 12px',
      borderRadius: 8,
      border: '1px solid var(--line)',
      fontSize: 13,
      color: 'var(--ink)',
      background: '#fff',
      outline: 'none',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "newest"
  }, "Najnovije"), /*#__PURE__*/React.createElement("option", {
    value: "price_asc"
  }, "Cena: rastu\u0107e"), /*#__PURE__*/React.createElement("option", {
    value: "price_desc"
  }, "Cena: opadaju\u0107e"))), listingsLoading ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '80px 20px',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 14
    }
  }, "U\u010Ditavam\u2026") : filtered.length > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "list-grid"
  }, filtered.map(l => /*#__PURE__*/React.createElement(ListingCard, {
    key: l.id,
    item: l,
    fav: !!wishlistIds[l.id],
    onFav: () => toggleFav(l.id),
    onClick: () => onOpenItem(l),
    onOpenProfile: onOpenProfile
  }))), totalPages > 1 && /*#__PURE__*/React.createElement("div", {
    className: "search-text-row",
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      marginTop: 32,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setPage(p => p - 1);
      window.scrollTo(0, 0);
    },
    disabled: page === 1,
    style: {
      padding: '8px 14px',
      borderRadius: 8,
      border: '1px solid var(--line)',
      background: '#fff',
      cursor: page === 1 ? 'default' : 'pointer',
      color: page === 1 ? 'var(--ink-3)' : 'var(--ink)',
      fontSize: 13
    }
  }, "\u2190 Prethodna"), Array.from({
    length: totalPages
  }, (_, i) => i + 1).filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2).reduce((acc, n, i, arr) => {
    if (i > 0 && n - arr[i - 1] > 1) acc.push('...');
    acc.push(n);
    return acc;
  }, []).map((n, i) => n === '...' ? /*#__PURE__*/React.createElement("span", {
    key: 'dots' + i,
    style: {
      color: 'var(--ink-3)',
      fontSize: 13,
      padding: '0 4px'
    }
  }, "\u2026") : /*#__PURE__*/React.createElement("button", {
    key: n,
    onClick: () => {
      setPage(n);
      window.scrollTo(0, 0);
    },
    style: {
      width: 36,
      height: 36,
      borderRadius: 8,
      border: '1px solid ' + (page === n ? 'var(--accent)' : 'var(--line)'),
      background: page === n ? 'var(--accent)' : '#fff',
      color: page === n ? '#fff' : 'var(--ink)',
      fontWeight: page === n ? 700 : 400,
      cursor: 'pointer',
      fontSize: 13
    }
  }, n)), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setPage(p => p + 1);
      window.scrollTo(0, 0);
    },
    disabled: page === totalPages,
    style: {
      padding: '8px 14px',
      borderRadius: 8,
      border: '1px solid var(--line)',
      background: '#fff',
      cursor: page === totalPages ? 'default' : 'pointer',
      color: page === totalPages ? 'var(--ink-3)' : 'var(--ink)',
      fontSize: 13
    }
  }, "Slede\u0107a \u2192"))) : /*#__PURE__*/React.createElement("div", {
    className: "search-text-row",
    style: {
      padding: '80px 20px',
      textAlign: 'center',
      color: 'var(--ink-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      color: 'var(--ink-2)',
      marginBottom: 8,
      fontFamily: 'var(--font-display)'
    }
  }, searchQuery ? 'Nema rezultata za \u201e' + searchQuery + '\u201c' : 'Nema rezultata'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      marginBottom: 20
    }
  }, "Probaj drugu re\u010D ili promeni filtere."), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: () => requirePhone(() => setPostOpen(true))
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 14,
    stroke: 2.2
  }), " Postavi oglas")))), view === 'detail' && selectedItem && /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "03 Listing detail",
    style: {
      padding: '12px 0 60px'
    }
  }, /*#__PURE__*/React.createElement(ListingDetail, {
    item: selectedItem,
    categories: categories,
    currentUser: currentUser,
    onBack: () => {
      navigate('home', null);
      setPendingOffer(null);
    },
    onMessage: () => requireAuth(() => {
      setMessageTarget(selectedItem);
      setRazmeneOpen(true);
    }),
    onEdit: fullItem => setEditItem(fullItem || selectedItem),
    onDelete: () => setDeleteConfirm(true),
    onLogin: () => setLoginOpen(true),
    pendingOffer: pendingOffer,
    onOfferRespond: handleOfferRespond,
    isSaved: !!wishlistIds[selectedItem.id],
    onSaveToggle: handleSaveToggle,
    onOpenProfile: onOpenProfile
  })), view === 'my-listings' && /*#__PURE__*/React.createElement("section", {
    className: "section",
    "data-screen-label": "04 Moji oglasi",
    style: {
      paddingTop: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Moji oglasi"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, ownerListings ? ownerListings.length : myListings.length, " oglasa")), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: () => requirePhone(() => setPostOpen(true))
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 14
  }), " Novi oglas")), ownerListings === null ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '40px 20px',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 14
    }
  }, "U\u010Ditavanje...") : ownerListings.length > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "list-grid"
  }, ownerListings.map(l => {
    const full = listings.find(x => x.id === l.id) || l;
    const isExpired = l.status === 'expired';
    return /*#__PURE__*/React.createElement("div", {
      key: l.id,
      style: {
        display: 'flex',
        flexDirection: 'column',
        opacity: isExpired ? 0.6 : 1
      }
    }, /*#__PURE__*/React.createElement(ListingCard, {
      item: full,
      fav: !!wishlistIds[l.id],
      onFav: () => toggleFav(l.id),
      onClick: () => onOpenItem(full),
      onOpenProfile: onOpenProfile
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        paddingTop: 4,
        paddingLeft: 2,
        fontSize: 11.5,
        color: 'var(--ink-3)'
      }
    }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDC41 ", l.views ?? 0), /*#__PURE__*/React.createElement("span", null, "\u2661 ", l.saves ?? 0), isExpired && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--warn)',
        fontWeight: 600
      }
    }, "Istekao"), /*#__PURE__*/React.createElement("button", {
      className: "nav-btn",
      style: {
        padding: '4px 10px',
        fontSize: 11.5
      },
      onClick: e => {
        e.stopPropagation();
        handleRenew(l.id);
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "swap",
      size: 12
    }), " Obnovi"))));
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '60px 20px',
      textAlign: 'center',
      color: 'var(--ink-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      color: 'var(--ink-2)',
      marginBottom: 6,
      fontFamily: 'var(--font-display)'
    }
  }, "Jo\u0161 nema\u0161 oglasa"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      marginBottom: 18
    }
  }, "Postavi prvi oglas i pove\u017Ei se sa zajednicom."), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: () => requirePhone(() => setPostOpen(true))
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 14
  }), " Postavi oglas")))), view === 'saved' && /*#__PURE__*/React.createElement(SavedScreen, {
    onOpenItem: onOpenItem,
    onPostAd: () => requirePhone(() => setPostOpen(true))
  }), view === 'ratings' && /*#__PURE__*/React.createElement(RatingsScreen, {
    onOpenItem: onOpenItem
  }), view === 'settings' && currentUser && /*#__PURE__*/React.createElement(SettingsScreen, {
    currentUser: currentUser,
    onUserUpdated: updated => setCurrentUser(u => ({
      ...u,
      ...updated
    }))
  }), view === 'profile' && profileUser && /*#__PURE__*/React.createElement(ProfileScreen, {
    user: profileUser,
    currentUser: currentUser,
    onBack: () => navigate('home', null),
    onOpenItem: onOpenItem,
    onOpenProfile: onOpenProfile
  }), phoneGate && /*#__PURE__*/React.createElement(PhoneGateModal, {
    onClose: () => setPhoneGate(null),
    onSaved: phone => {
      setCurrentUser(u => ({
        ...u,
        phone,
        has_phone: true
      }));
      setPhoneGate(null);
      phoneGate();
    }
  }), postOpen && /*#__PURE__*/React.createElement(PostAdModal, {
    onClose: () => setPostOpen(false),
    categories: categories,
    onCreated: onCreatedListing,
    onView: listing => {
      const [n] = normalizeListings([listing]);
      navigate('detail', n);
    }
  }), editItem && /*#__PURE__*/React.createElement(EditAdModal, {
    item: editItem,
    categories: categories,
    onClose: () => setEditItem(null),
    onSaved: updated => {
      const [norm] = normalizeListings([updated]);
      setListings(prev => prev.map(l => l.id === norm.id ? norm : l));
      setSelectedItem(norm);
      setEditItem(null);
    }
  }), deleteConfirm && selectedItem && /*#__PURE__*/React.createElement("div", {
    className: "scrim",
    onClick: () => setDeleteConfirm(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation(),
    style: {
      maxWidth: 400
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mh"
  }, /*#__PURE__*/React.createElement("h3", null, "Obri\u0161i oglas"), /*#__PURE__*/React.createElement("button", {
    className: "x-btn",
    onClick: () => setDeleteConfirm(false)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mb"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--ink-2)',
      lineHeight: 1.6
    }
  }, "Sigurno \u017Eeli\u0161 da obri\u0161e\u0161 oglas", ' ', /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--ink)'
    }
  }, "\u201E", selectedItem.title, "\""), "? Ova akcija je nepovratna.")), /*#__PURE__*/React.createElement("div", {
    className: "mf"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: () => setDeleteConfirm(false)
  }, "Otka\u017Ei"), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    style: {
      background: 'var(--warn)',
      color: '#fff',
      borderColor: 'var(--warn)'
    },
    onClick: handleDelete
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash",
    size: 14
  }), " Obri\u0161i")))), razmeneOpen && /*#__PURE__*/React.createElement(RazmeneDrawer, {
    onClose: () => {
      setRazmeneOpen(false);
      setMessageTarget(null);
    },
    currentUser: currentUser,
    targetListing: messageTarget
  }), mobileNotifsOpen && /*#__PURE__*/React.createElement(NotificationsDrawer, {
    notifications: notifications,
    onClose: () => setMobileNotifsOpen(false),
    onMarkRead: () => {
      handleMarkRead();
    },
    onNotifClick: notif => {
      setMobileNotifsOpen(false);
      handleNotifClick(notif);
    }
  }), loginOpen && /*#__PURE__*/React.createElement(LoginModal, {
    onClose: () => setLoginOpen(false),
    onSuccess: handleLoginSuccess,
    onSwitchToRegister: () => {
      setLoginOpen(false);
      setRegisterOpen(true);
    }
  }), registerOpen && /*#__PURE__*/React.createElement(RegisterModal, {
    onClose: () => setRegisterOpen(false),
    onSuccess: handleLoginSuccess,
    onSwitchToLogin: () => {
      setRegisterOpen(false);
      setLoginOpen(true);
    }
  }), catPickerOpen && /*#__PURE__*/React.createElement(CategoryPickerModal, {
    categories: categories,
    selected: filterCat,
    onSelect: id => {
      setFilterCat(id);
      setCatPickerOpen(false);
      navigate('search', null);
      window.scrollTo({
        top: 0
      });
    },
    onClose: () => setCatPickerOpen(false)
  }), /*#__PURE__*/React.createElement(TweaksPanel, {
    title: "Tweaks"
  }, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Boja akcenta"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6,1fr)',
      gap: 6,
      padding: '4px 0'
    }
  }, ACCENTS.map(a => /*#__PURE__*/React.createElement("button", {
    key: a.id,
    onClick: () => setTweak('accent', a.value),
    title: a.id,
    style: {
      width: '100%',
      aspectRatio: '1/1',
      borderRadius: 8,
      border: t.accent === a.value ? '2px solid #29261b' : '1px solid rgba(0,0,0,.1)',
      background: a.value,
      cursor: 'pointer',
      padding: 0
    }
  }))), /*#__PURE__*/React.createElement(TweakColor, {
    label: "Custom",
    value: t.accent,
    onChange: v => setTweak('accent', v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Font"
  }), /*#__PURE__*/React.createElement(TweakSelect, {
    label: "Tipografija",
    value: t.fontPair,
    options: Object.entries(FONT_PAIRS).map(([k, v]) => ({
      value: k,
      label: v.label
    })),
    onChange: v => setTweak('fontPair', v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Hero"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Layout",
    value: t.heroLayout,
    options: [{
      value: 'split',
      label: 'Split'
    }, {
      value: 'center',
      label: 'Centar'
    }, {
      value: 'grid',
      label: 'Grid'
    }],
    onChange: v => setTweak('heroLayout', v)
  })));
}
(function () {
  const container = document.getElementById('root');
  if (!container) return;
  if (container.__reactRoot) {
    container.__reactRoot.render(/*#__PURE__*/React.createElement(App, null));
  } else {
    container.__reactRoot = ReactDOM.createRoot(container);
    container.__reactRoot.render(/*#__PURE__*/React.createElement(App, null));
  }
})();