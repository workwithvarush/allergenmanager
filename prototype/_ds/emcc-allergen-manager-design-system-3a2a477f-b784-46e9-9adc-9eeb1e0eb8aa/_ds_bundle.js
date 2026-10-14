/* @ds-bundle: {"format":3,"namespace":"EMCCAllergenManagerDesignSystem_3a2a47","components":[],"sourceHashes":{"design-canvas.jsx":"3b0e985041dd","prototype/App.jsx":"772eacf01575","prototype/Dashboard.jsx":"a08d3ae1d62f","prototype/Entry.jsx":"141e52ecce5a","prototype/NewEvent.jsx":"b4cfe1272037","prototype/PreviewPrint.jsx":"bbe8846b69ef","prototype/PrintApp.jsx":"d45b69b95e6a","prototype/data.jsx":"ea3fe735fd80","prototype/tweaks-panel.jsx":"22c052960f83","ui_kits/allergen-manager/Components.jsx":"65057bca3024","ui_kits/allergen-manager/Composites.jsx":"0b3e280d55c8","ui_kits/allergen-manager/Icons.jsx":"0ab0ad3d1765","ui_kits/allergen-manager/KitDemo.jsx":"0b7d185fa4f2","ui_kits/allergen-manager/Screens.jsx":"73cede897fbd","variants/Canvas.jsx":"b760f47f04be","variants/data.jsx":"d93632c3b7e1","variants/event-row-variants.jsx":"aff4d349d87a","variants/new-event-variants.jsx":"17ee21eae7cd","variants/print-doc-variants.jsx":"1fb0192868aa"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.EMCCAllergenManagerDesignSystem_3a2a47 = window.EMCCAllergenManagerDesignSystem_3a2a47 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// design-canvas.jsx
try { (() => {
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Artboards are reorderable (grip-drag), deletable, labels/titles are
// inline-editable, and any artboard can be opened in a fullscreen focus
// overlay (←/→/Esc). State persists to a .design-canvas.state.json sidecar
// via the host bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}',
  // isolation:isolate contains artboard content's z-indexes so a
  // z-indexed child (sticky navbar etc.) can't paint over .dc-header or
  // the .dc-menu popover that drops into the top of the card.
  '.dc-card{isolation:isolate;transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}',
  // Per-artboard header: grip + label on the left, delete/expand on the
  // right. Single flex row; when the artboard's on-screen width is too
  // narrow for both the label yields (ellipsis, then hidden entirely below
  // ~4ch via the container query) and the buttons stay on the row.
  '.dc-header{position:absolute;bottom:100%;left:-4px;margin-bottom:calc(4px * var(--dc-inv-zoom,1));z-index:2;', '  display:flex;align-items:center;container-type:inline-size}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px;flex:1 1 auto;min-width:0}', '.dc-grip{flex:0 0 auto;cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s,opacity .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{flex:1 1 auto;min-width:0;cursor:pointer;border-radius:4px;padding:3px 6px;', '  display:flex;align-items:center;transition:background .12s;overflow:hidden}',
  // Below ~4ch of label room: hide the label entirely, and drop the grip to
  // hover-only (same reveal rule as .dc-btns) so a narrow header is clean
  // until the card is moused.
  '@container (max-width: 110px){', '  .dc-labeltext{display:none}', '  .dc-grip{opacity:0}', '  [data-dc-slot]:hover .dc-grip{opacity:1}', '}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-labeltext .dc-editable{overflow:hidden;text-overflow:ellipsis;max-width:100%}', '.dc-labeltext .dc-editable:focus{overflow:visible;text-overflow:clip}', '.dc-btns{flex:0 0 auto;margin-left:auto;display:flex;gap:2px;opacity:0;transition:opacity .12s}', '[data-dc-slot]:hover .dc-btns,.dc-btns:has(.dc-menu){opacity:1}', '.dc-expand,.dc-kebab{width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center;', '  font:inherit;transition:background .12s,color .12s}', '.dc-expand:hover,.dc-kebab:hover{background:rgba(0,0,0,.06);color:#2a251f}',
  // Slot hosting an open menu floats above later siblings (which otherwise
  // paint on top — same z-index:auto, later DOM order) so the popup isn't
  // clipped by the next card.
  '[data-dc-slot]:has(.dc-menu){z-index:10}', '.dc-menu{position:absolute;top:100%;right:0;margin-top:4px;background:#fff;border-radius:8px;', '  box-shadow:0 8px 28px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.05);padding:4px;min-width:160px;z-index:10}', '.dc-menu button{display:block;width:100%;padding:7px 10px;border:0;background:transparent;', '  border-radius:5px;font-family:inherit;font-size:13px;font-weight:500;line-height:1.2;', '  color:#29261b;cursor:pointer;text-align:left;transition:background .12s;white-space:nowrap}', '.dc-menu button:hover{background:rgba(0,0,0,.05)}', '.dc-menu hr{border:0;border-top:1px solid rgba(0,0,0,.08);margin:4px 2px}', '.dc-menu .dc-danger{color:#c96442}', '.dc-menu .dc-danger:hover{background:rgba(201,100,66,.1)}',
  // Chrome (titles / labels / buttons) counter-scales against the viewport
  // zoom so it stays a constant on-screen size. --dc-inv-zoom is set by
  // DCViewport on every transform update and inherits to all descendants —
  // any overlay inside the world (e.g. a TweaksPanel on an artboard) can use
  // it the same way.
  //
  // The header uses transform:scale (out-of-flow, so layout impact doesn't
  // matter) with its world-space width set to card-width / inv-zoom so that
  // after counter-scaling its on-screen width exactly matches the card's —
  // that's what lets the container query + text-overflow behave against the
  // card's visible edge at every zoom level.
  //
  // The section head uses CSS zoom instead of transform so its layout box
  // grows with the counter-scale, pushing the card row down — otherwise the
  // constant-screen-size title would overflow into the (shrinking) world-
  // space gap and overlap the artboard headers at low zoom.
  '.dc-header{width:calc((100% + 4px) / var(--dc-inv-zoom,1));', '  transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom left}', '.dc-sectionhead{zoom:var(--dc-inv-zoom,1)}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// Recursively unwrap React.Fragment so <>…</> grouping doesn't hide
// DCSection/DCArtboard children from the type-based walks below.
function dcFlatten(children) {
  const out = [];
  React.Children.forEach(children, c => {
    if (c && c.type === React.Fragment) out.push(...dcFlatten(c.props.children));else out.push(c);
  });
  return out;
}

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, hidden
// artboards, focused artboard). Order/titles/labels/hidden persist to a
// .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Fragments are flattened; wrapping in other
  // elements still opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  dcFlatten(children).forEach(sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const abs = [];
    dcFlatten(sec.props.children).forEach(ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (aid) abs.push([aid, ab]);
    });
    // hidden is scoped to one source revision — when the agent regenerates
    // (artboard-ID set changes), prior deletes don't apply to new content.
    const srcKey = abs.map(([k]) => k).join('\x1f');
    const hidden = persisted.srcKey === srcKey ? persisted.hidden || [] : [];
    const srcIds = [];
    abs.forEach(([aid, ab]) => {
      if (hidden.includes(aid)) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  // Persist viewport across reloads so the user lands back where they were
  // after an agent edit or browser refresh. The sandbox origin is already
  // per-project; pathname keeps multiple canvas files in one project apart.
  const tfKey = 'dc-viewport:' + location.pathname;
  const saveT = React.useRef(0);
  const lastPostedScale = React.useRef();
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    // Exposed for zoom-invariant chrome (labels, buttons, TweaksPanel).
    el.style.setProperty('--dc-inv-zoom', String(1 / scale));
    // Keep the host toolbar's % readout in sync with the canvas scale. Pan
    // ticks leave scale unchanged — skip the cross-frame post for those.
    if (lastPostedScale.current !== scale) {
      lastPostedScale.current = scale;
      window.parent.postMessage({
        type: '__dc_zoom',
        scale
      }, '*');
    }
    clearTimeout(saveT.current);
    saveT.current = setTimeout(() => {
      try {
        localStorage.setItem(tfKey, JSON.stringify(tf.current));
      } catch {}
    }, 200);
  }, [tfKey]);
  React.useLayoutEffect(() => {
    const flush = () => {
      clearTimeout(saveT.current);
      try {
        localStorage.setItem(tfKey, JSON.stringify(tf.current));
      } catch {}
    };
    try {
      const s = JSON.parse(localStorage.getItem(tfKey) || 'null');
      if (s && Number.isFinite(s.x) && Number.isFinite(s.y) && Number.isFinite(s.scale)) {
        tf.current = {
          x: s.x,
          y: s.y,
          scale: Math.min(maxScale, Math.max(minScale, s.scale))
        };
        apply();
      }
    } catch {}
    // Flush on pagehide and unmount so a reload within the 200ms debounce
    // window doesn't drop the last pan/zoom.
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // --dc-inv-zoom consumers (.dc-sectionhead's CSS zoom, each section's
      // marginBottom) reflow on every scale change, vertically shifting the
      // world layout — so a world point mathematically pinned under the cursor
      // drifts as you zoom (content creeps up on zoom-in, down on zoom-out).
      // Anchor the DOM element under the cursor instead: record its screen Y,
      // apply the transform + --dc-inv-zoom, then cancel whatever vertical
      // drift the reflow introduced so it stays put on screen.
      let marker = null,
        markerY0 = 0;
      if (k !== 1) {
        const hit = document.elementFromPoint(cx, cy);
        marker = hit && hit.closest ? hit.closest('[data-dc-slot],[data-dc-section]') : null;
        if (marker) markerY0 = marker.getBoundingClientRect().top;
      }
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
      if (marker) {
        // A pure zoom around (cx, cy) maps screen Y → cy + (Y - cy) * k. Any
        // departure after the --dc-inv-zoom reflow is the layout drift.
        const drift = marker.getBoundingClientRect().top - (cy + (markerY0 - cy) * k);
        if (Math.abs(drift) > 0.1) {
          t.y -= drift;
          apply();
        }
      }
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if ((e.ctrlKey || e.metaKey) && !isMouseWheel(e)) {
        // trackpad pinch, or ctrl/cmd + smooth-scroll mouse. Notched
        // wheels fall through to the fixed-step branch below.
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };

    // Host-driven zoom (toolbar % menu). Zooms around viewport centre so the
    // visible midpoint stays fixed — matching the host's iframe-zoom feel.
    const onHostMsg = e => {
      const d = e.data;
      if (d && d.type === '__dc_set_zoom' && typeof d.scale === 'number') {
        const r = vp.getBoundingClientRect();
        zoomAt(r.left + r.width / 2, r.top + r.height / 2, d.scale / tf.current.scale);
      } else if (d && d.type === '__dc_probe') {
        // Host's [readyGen] reset asks whether a canvas is present; it
        // fires on the iframe's native 'load', which for canvases with
        // images/fonts is after our mount-time announce, so re-announce.
        // Clear the pan-tick guard so apply() re-posts the current scale
        // even if it's unchanged — the host just reset dcScale to 1.
        window.parent.postMessage({
          type: '__dc_present'
        }, '*');
        lastPostedScale.current = undefined;
        apply();
      }
    };
    window.addEventListener('message', onHostMsg);
    // Announce canvas mode so the host toolbar proxies its % control here
    // instead of scaling the iframe element (which would just shrink the
    // viewport window of an infinite canvas). The apply() that follows emits
    // the initial __dc_zoom so the toolbar % is correct before first pinch.
    // lastPostedScale reset mirrors the __dc_probe handler: the layout
    // effect's restore-path apply() may already have posted the restored
    // scale (before __dc_present), so clear the guard to re-post it in order.
    window.parent.postMessage({
      type: '__dc_present'
    }, '*');
    lastPostedScale.current = undefined;
    apply();
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('message', onHostMsg);
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(dcFlatten(children));
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const sec = ctx && sid && ctx.section(sid) || {};
  // Must match DesignCanvas's srcKey computation exactly (it filters falsy
  // IDs), or onDelete persists a srcKey that DesignCanvas never recognizes.
  const allIds = artboards.map(a => a.props.id ?? a.props.label).filter(Boolean);
  const srcKey = allIds.join('\x1f');
  const hidden = sec.srcKey === srcKey ? sec.hidden || [] : [];
  const srcOrder = allIds.filter(k => !hidden.includes(k));
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));

  // marginBottom counter-scales so the on-screen gap between sections stays
  // constant — otherwise at low zoom the (world-space) gap collapses while
  // the screen-constant sectionhead below it doesn't, and the title reads as
  // belonging to the section above. paddingBottom below is just enough for
  // the 24px artboard-header (abs-positioned above each card) plus ~8px, so
  // the title sits tight against its own row at every zoom.
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 'calc(80px * var(--dc-inv-zoom, 1))',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-sectionhead",
    style: {
      paddingBottom: 36
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onDelete: () => ctx && ctx.patchSection(sid, x => ({
      hidden: [...(x.srcKey === srcKey ? x.hidden || [] : []), k],
      srcKey
    })),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}

// Per-artboard export (kind: 'png' | 'html'). Both paths share the same
// self-contained clone: computed styles baked in, @font-face / <img> /
// inline-style background-image urls inlined as data URIs. PNG wraps the
// clone in foreignObject→canvas at 3× the artboard's natural width×height
// (same pipeline the host uses for page captures); HTML wraps it in a
// minimal standalone document. Both are independent of viewport zoom.
async function dcExport(node, w, h, name, kind) {
  try {
    await document.fonts.ready;
  } catch {}
  const toDataURL = url => fetch(url).then(r => r.blob()).then(b => new Promise(res => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = () => res(url);
    fr.readAsDataURL(b);
  })).catch(() => url);

  // Collect @font-face rules. ss.cssRules throws SecurityError on
  // cross-origin sheets (e.g. fonts.googleapis.com) — in that case fetch
  // the CSS text directly (those endpoints send ACAO:*) and regex-extract
  // the blocks. @import and @media/@supports are walked so nested
  // @font-face rules aren't missed.
  const fontRules = [],
    pending = [],
    seen = new Set();
  const scrapeCss = href => {
    if (seen.has(href)) return;
    seen.add(href);
    pending.push(fetch(href).then(r => r.text()).then(css => {
      for (const m of css.match(/@font-face\s*{[^}]*}/g) || []) fontRules.push({
        css: m,
        base: href
      });
      for (const m of css.matchAll(/@import\s+(?:url\()?['"]?([^'")\s;]+)/g)) scrapeCss(new URL(m[1], href).href);
    }).catch(() => {}));
  };
  const walk = (rules, base) => {
    for (const r of rules) {
      if (r.type === CSSRule.FONT_FACE_RULE) fontRules.push({
        css: r.cssText,
        base
      });else if (r.type === CSSRule.IMPORT_RULE && r.styleSheet) {
        const ibase = r.styleSheet.href || base;
        try {
          walk(r.styleSheet.cssRules, ibase);
        } catch {
          scrapeCss(ibase);
        }
      } else if (r.cssRules) walk(r.cssRules, base);
    }
  };
  for (const ss of document.styleSheets) {
    const base = ss.href || location.href;
    try {
      walk(ss.cssRules, base);
    } catch {
      if (ss.href) scrapeCss(ss.href);
    }
  }
  while (pending.length) await pending.shift();
  const fontCss = (await Promise.all(fontRules.map(async rule => {
    let out = rule.css,
      m;
    const re = /url\((['"]?)([^'")]+)\1\)/g;
    while (m = re.exec(rule.css)) {
      if (m[2].indexOf('data:') === 0) continue;
      let abs;
      try {
        abs = new URL(m[2], rule.base).href;
      } catch {
        continue;
      }
      out = out.split(m[0]).join('url("' + (await toDataURL(abs)) + '")');
    }
    return out;
  }))).join('\n');
  const cloneStyled = src => {
    if (src.nodeType === 8 || src.nodeType === 1 && src.tagName === 'SCRIPT') return document.createTextNode('');
    const dst = src.cloneNode(false);
    if (src.nodeType === 1) {
      const cs = getComputedStyle(src);
      let txt = '';
      for (let i = 0; i < cs.length; i++) txt += cs[i] + ':' + cs.getPropertyValue(cs[i]) + ';';
      dst.setAttribute('style', txt + 'animation:none;transition:none;');
      if (src.tagName === 'CANVAS') try {
        const im = document.createElement('img');
        im.src = src.toDataURL();
        im.setAttribute('style', txt);
        return im;
      } catch {}
    }
    for (let c = src.firstChild; c; c = c.nextSibling) dst.appendChild(cloneStyled(c));
    return dst;
  };
  const clone = cloneStyled(node);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  // Drop the card's own shadow/radius so the export is a flush w×h rect;
  // the artboard's own background (if any) is already in the computed style.
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0';
  const jobs = [];
  clone.querySelectorAll('img').forEach(el => {
    const s = el.getAttribute('src');
    if (s && s.indexOf('data:') !== 0) jobs.push(toDataURL(el.src).then(d => el.setAttribute('src', d)));
  });
  [clone, ...clone.querySelectorAll('*')].forEach(el => {
    const bg = el.style.backgroundImage;
    if (!bg) return;
    let m;
    const re = /url\(["']?([^"')]+)["']?\)/g;
    while (m = re.exec(bg)) {
      const tok = m[0],
        url = m[1];
      if (url.indexOf('data:') === 0) continue;
      jobs.push(toDataURL(url).then(d => {
        el.style.backgroundImage = el.style.backgroundImage.split(tok).join('url("' + d + '")');
      }));
    }
  });
  await Promise.all(jobs);
  const xml = new XMLSerializer().serializeToString(clone);
  const save = (blob, ext) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name + '.' + ext;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  if (kind === 'html') {
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>' + name + '</title>' + (fontCss ? '<style>' + fontCss + '</style>' : '') + '</head><body style="margin:0">' + xml + '</body></html>';
    return save(new Blob([html], {
      type: 'text/html'
    }), 'html');
  }

  // PNG: the SVG's own width/height must be the output resolution — an
  // <img>-loaded SVG rasterizes at its intrinsic size, so sizing it at 1×
  // and ctx.scale()-ing up would just upscale a 1× bitmap. viewBox maps the
  // w×h foreignObject onto the px·w × px·h SVG canvas so the browser renders
  // the HTML at full resolution.
  const px = 3;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w * px + '" height="' + h * px + '" viewBox="0 0 ' + w + ' ' + h + '"><foreignObject width="' + w + '" height="' + h + '">' + (fontCss ? '<style><![CDATA[' + fontCss + ']]></style>' : '') + xml + '</foreignObject></svg>';
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = () => rej(new Error('svg load failed'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  const cv = document.createElement('canvas');
  cv.width = w * px;
  cv.height = h * px;
  cv.getContext('2d').drawImage(img, 0, 0);
  cv.toBlob(blob => save(blob, 'png'), 'image/png');
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus,
  onDelete
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);
  const cardRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  // ⋯ menu: close on any outside pointerdown. Two-click delete lives inside
  // the menu — first click arms the row, second commits; closing disarms.
  React.useEffect(() => {
    if (!menuOpen) {
      setConfirming(false);
      return;
    }
    const off = e => {
      if (!menuRef.current || !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', off, true);
    return () => document.removeEventListener('pointerdown', off, true);
  }, [menuOpen]);
  const doExport = kind => {
    setMenuOpen(false);
    if (!cardRef.current) return;
    const name = String(label || id || 'artboard').replace(/[^\w\s.-]+/g, '_');
    dcExport(cardRef.current, width, height, name, kind).catch(e => console.error('[design-canvas] export failed:', e));
  };

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-header",
    "data-omelette-chrome": "",
    style: {
      color: DC.label
    },
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-btns"
  }, /*#__PURE__*/React.createElement("div", {
    ref: menuRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "dc-kebab",
    title: "More",
    onClick: () => setMenuOpen(o => !o)
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2.5",
    cy: "6",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "6",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9.5",
    cy: "6",
    r: "1.1"
  }))), menuOpen && /*#__PURE__*/React.createElement("div", {
    className: "dc-menu",
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => doExport('png')
  }, "Download PNG"), /*#__PURE__*/React.createElement("button", {
    onClick: () => doExport('html')
  }, "Download HTML"), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("button", {
    className: "dc-danger",
    onClick: () => {
      if (confirming) {
        setMenuOpen(false);
        onDelete();
      } else setConfirming(true);
    }
  }, confirming ? 'Click again to delete' : 'Delete'))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))))), /*#__PURE__*/React.createElement("div", {
    ref: cardRef,
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    // Sections whose artboards are all deleted have slotIds:[] — step past
    // them to the next non-empty section so ↑/↓ doesn't dead-end.
    const n = sectionOrder.length;
    for (let i = 1; i < n; i++) {
      const ns = sectionOrder[((secIdx + d * i) % n + n) % n];
      const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
      if (first) {
        ctx.setFocus(`${ns}/${first}`);
        return;
      }
    }
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.filter(sid => sectionMeta[sid].slotIds.length).map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design-canvas.jsx", error: String((e && e.message) || e) }); }

// prototype/App.jsx
try { (() => {
/* global React, ReactDOM, TopNav, Dashboard, Entry, PreviewPrint, NewEventModal, Icon, Button, DocRow, Badge, Banner, SEED_EVENTS, STANDARD_MENUS, instantiateMenu, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakSelect, eventStatus */
// Top-level state machine + Tweaks wiring for the EMCC Allergen Manager prototype.

const NOW_TIME = "11:47";

// ── Top nav wrapper — three style variants on top of the kit TopNav ──
function TopNavStyled({
  style,
  active,
  onNav,
  breadcrumb
}) {
  if (style === "labelled") {
    const links = [{
      id: "dashboard",
      label: "Dashboard",
      icon: "dashboard"
    }, {
      id: "library",
      label: "Dish library",
      icon: "document"
    }, {
      id: "settings",
      label: "Settings",
      icon: "settings"
    }];
    return /*#__PURE__*/React.createElement("header", {
      className: "topnav topnav-labelled"
    }, /*#__PURE__*/React.createElement("div", {
      className: "topnav-brand"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "pin",
      size: 18
    }), "Allergen manager"), /*#__PURE__*/React.createElement("nav", {
      className: "topnav-links"
    }, links.map(l => /*#__PURE__*/React.createElement("button", {
      key: l.id,
      type: "button",
      className: `nav-link nav-link-iconed${active === l.id ? " active" : ""}`,
      onClick: () => onNav?.(l.id)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: l.icon,
      size: 14
    }), l.label))));
  }
  if (style === "breadcrumb") {
    return /*#__PURE__*/React.createElement("header", {
      className: "topnav topnav-breadcrumb"
    }, /*#__PURE__*/React.createElement("div", {
      className: "topnav-brand"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "pin",
      size: 18
    }), "Allergen manager"), /*#__PURE__*/React.createElement("div", {
      className: "topnav-crumb"
    }, /*#__PURE__*/React.createElement("span", {
      className: "crumb-segment muted",
      onClick: () => onNav?.("dashboard")
    }, "Today"), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 12
    }), /*#__PURE__*/React.createElement("span", {
      className: "crumb-segment"
    }, breadcrumb || "Dashboard")), /*#__PURE__*/React.createElement("nav", {
      className: "topnav-links"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "nav-link",
      onClick: () => onNav?.("library")
    }, "Dish library"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "nav-link",
      onClick: () => onNav?.("settings")
    }, "Settings")));
  }
  // default: minimal (the original kit TopNav)
  return /*#__PURE__*/React.createElement(TopNav, {
    active: active,
    onNav: onNav
  });
}
function PrintSuccessModal({
  event,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-veil",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      color: "var(--color-success)",
      fontSize: 12,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: ".06em"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14
  }), " Sent to printer"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 600,
      color: "var(--fg-1)",
      letterSpacing: "-0.2px",
      marginTop: 6
    }
  }, "All 3 documents queued"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--fg-4)",
      marginTop: 4,
      fontFamily: "var(--font-mono)"
    }
  }, event.name, " \xB7 v", event.version, " \xB7 18 May ", NOW_TIME)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    type: "button",
    style: {
      background: "none",
      border: "none",
      color: "var(--fg-4)",
      cursor: "pointer",
      padding: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Banner, {
    kind: "success"
  }, "Distribute to counters \u2014 every page is stamped ", /*#__PURE__*/React.createElement("strong", null, "v", event.version, " \xB7 18 May \xB7 ", NOW_TIME), ". FOH staff can verify currency at a glance.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(DocRow, {
    title: "Allergen sheet",
    meta: `v${event.version} · 18 May · ${NOW_TIME}`,
    status: "ready",
    statusLabel: "Queued"
  }), /*#__PURE__*/React.createElement(DocRow, {
    title: "Menu",
    meta: `v${event.version} · 18 May · ${NOW_TIME}`,
    status: "ready",
    statusLabel: "Queued"
  }), /*#__PURE__*/React.createElement(DocRow, {
    title: "Placecards",
    meta: `v${event.version} · 18 May · ${NOW_TIME}`,
    status: "ready",
    statusLabel: "Queued"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: onClose
  }, "Back to dashboard"))));
}
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "brand": "forest",
  "printPlacement": "header",
  "startScreen": "dashboard",
  "paperSize": "a4",
  "topNavStyle": "minimal"
} /*EDITMODE-END*/;
function App() {
  const {
    values: tweaks,
    setTweak
  } = useTweaks(TWEAK_DEFAULTS);
  const [events, setEvents] = React.useState(SEED_EVENTS);
  const [selectedEventId, setSelectedEventId] = React.useState(SEED_EVENTS[0].id);
  const [view, setView] = React.useState({
    name: tweaks.startScreen || "dashboard"
  });
  const [printedModal, setPrintedModal] = React.useState(null);
  const [newEventOpen, setNewEventOpen] = React.useState(false);
  const [navTab, setNavTab] = React.useState("dashboard");

  // Apply density + brand to <body> classes
  React.useEffect(() => {
    const cls = [];
    if (tweaks.density === "compact") cls.push("density-compact");
    if (tweaks.brand === "dark") cls.push("brand-dark");
    if (tweaks.brand === "warm") cls.push("brand-warm");
    if (tweaks.printPlacement === "footer") cls.push("print-bar");
    document.body.className = cls.join(" ");
  }, [tweaks.density, tweaks.brand, tweaks.printPlacement]);

  // ── Helpers ────────────────────────────────────────────
  const updateEvent = (id, patcher) => setEvents(es => es.map(e => e.id === id ? patcher(e) : e));
  const bumpVersion = e => ({
    ...e,
    version: e.version + 1,
    lastModifiedAt: NOW_TIME
  });
  const updateDish = (eventId, dishId, patch, logText) => {
    updateEvent(eventId, e => {
      const next = bumpVersion({
        ...e,
        dishes: e.dishes.map(d => d.id === dishId ? {
          ...d,
          ...patch
        } : d)
      });
      if (logText) {
        const type = e.lastPrintedAt && e.lastModifiedAt && e.lastModifiedAt > e.lastPrintedAt ? "warn" : e.lastPrintedAt ? "warn" : "edit";
        next.log = [...e.log, {
          type,
          t: NOW_TIME,
          text: logText
        }];
      }
      return next;
    });
  };
  const toggleAllergen = (eventId, dishId, allergen) => {
    const ev = events.find(e => e.id === eventId);
    const dish = ev.dishes.find(d => d.id === dishId);
    const cur = dish.allergens?.[allergen];
    const next = cur === "present" ? "may" : cur === "may" ? undefined : "present";
    const verb = next === "present" ? "added" : next === "may" ? "moved to may contain" : "removed";
    updateDish(eventId, dishId, {
      allergens: {
        ...dish.allergens,
        [allergen]: next
      }
    }, `${dish.name} — ${allergen} ${verb}`);
  };
  const toggleTag = (eventId, dishId, tag) => {
    const ev = events.find(e => e.id === eventId);
    const dish = ev.dishes.find(d => d.id === dishId);
    const has = (dish.tags || []).includes(tag);
    const tags = has ? dish.tags.filter(t => t !== tag) : [...(dish.tags || []), tag];
    updateDish(eventId, dishId, {
      tags
    }, `${dish.name} — ${tag.toUpperCase()} ${has ? "removed" : "added"}`);
  };
  const updateDishField = (eventId, dishId, patch) => {
    updateEvent(eventId, e => ({
      ...e,
      dishes: e.dishes.map(d => d.id === dishId ? {
        ...d,
        ...patch
      } : d),
      lastModifiedAt: NOW_TIME
    }));
  };
  const renameDish = (eventId, dishId, name) => {
    const ev = events.find(e => e.id === eventId);
    const dish = ev?.dishes.find(d => d.id === dishId);
    if (!dish || dish.name === name) return;
    updateDish(eventId, dishId, {
      name
    }, `Renamed “${dish.name}” → “${name}”`);
  };
  const markComplete = (eventId, dishId) => {
    const ev = events.find(e => e.id === eventId);
    const dish = ev.dishes.find(d => d.id === dishId);
    updateDish(eventId, dishId, {
      complete: !dish.complete
    }, `${dish.name} — marked ${dish.complete ? "in progress" : "complete"}`);
  };
  const changeMenu = (eventId, newMenuId) => {
    updateEvent(eventId, e => bumpVersion({
      ...e,
      menuId: newMenuId,
      dishes: instantiateMenu(newMenuId),
      log: [...e.log, {
        type: "edit",
        t: NOW_TIME,
        text: `Menu changed to ${newMenuId} — dish list refreshed`
      }]
    }));
  };
  const doPrint = eventId => {
    updateEvent(eventId, e => ({
      ...e,
      lastPrintedAt: NOW_TIME,
      log: [...e.log, {
        type: "print",
        t: NOW_TIME,
        text: `Printed all 3 documents · v${e.version}`
      }]
    }));
    setPrintedModal(eventId);
  };
  const createEvent = form => {
    const id = `e${Date.now()}`;
    const dishes = instantiateMenu(form.menuId).map(d => ({
      ...d,
      complete: false,
      allergens: {},
      tags: []
    }));
    const newEvent = {
      id,
      name: form.name,
      room: form.room,
      time: form.time,
      guests: form.guests,
      menuId: form.menuId,
      dishes,
      version: 1,
      lastPrintedAt: null,
      lastModifiedAt: NOW_TIME,
      log: [{
        type: "edit",
        t: NOW_TIME,
        text: `Event created — Menu ${form.menuId} assigned`
      }]
    };
    setEvents(es => [...es, newEvent].sort((a, b) => a.time.localeCompare(b.time)));
    setSelectedEventId(id);
    setNewEventOpen(false);
    // Jump straight into allergen entry
    setView({
      name: "entry",
      eventId: id
    });
  };
  const currentEvent = events.find(e => e.id === (view.eventId || selectedEventId));

  // Topnav handler — only Dashboard is wired up
  const onNav = tab => {
    setNavTab(tab);
    if (tab === "dashboard") {
      setView({
        name: "dashboard"
      });
    }
  };
  const breadcrumb = view.name === "dashboard" ? "Dashboard" : currentEvent ? `${currentEvent.name} · ${view.name === "entry" ? "Fill allergens" : "Preview & print"}` : "—";
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "proto-shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "proto-frame"
  }, /*#__PURE__*/React.createElement(TopNavStyled, {
    style: tweaks.topNavStyle || "minimal",
    active: navTab,
    onNav: onNav,
    breadcrumb: breadcrumb
  }), /*#__PURE__*/React.createElement("div", {
    className: "proto-body"
  }, view.name === "dashboard" && /*#__PURE__*/React.createElement(Dashboard, {
    events: events,
    selectedEventId: selectedEventId,
    onSelectEvent: setSelectedEventId,
    onChangeMenu: changeMenu,
    onFillAllergens: id => {
      setSelectedEventId(id);
      setView({
        name: "entry",
        eventId: id
      });
    },
    onPreviewPrint: id => {
      setSelectedEventId(id);
      setView({
        name: "print",
        eventId: id
      });
    },
    onNewEvent: () => setNewEventOpen(true)
  }), view.name === "entry" && currentEvent && /*#__PURE__*/React.createElement(Entry, {
    event: currentEvent,
    onUpdate: (dishId, patch) => updateDishField(currentEvent.id, dishId, patch),
    onToggleAllergen: (dishId, a) => toggleAllergen(currentEvent.id, dishId, a),
    onToggleTag: (dishId, t) => toggleTag(currentEvent.id, dishId, t),
    onMarkComplete: dishId => markComplete(currentEvent.id, dishId),
    onBack: () => setView({
      name: "dashboard"
    }),
    onPreviewPrint: () => setView({
      name: "print",
      eventId: currentEvent.id
    }),
    onSaveDraft: () => {/* persists implicitly */}
  }), view.name === "print" && currentEvent && /*#__PURE__*/React.createElement(PreviewPrint, {
    event: currentEvent,
    paperSize: tweaks.paperSize || "a4",
    onBack: () => setView({
      name: "dashboard"
    }),
    onEditAllergens: () => setView({
      name: "entry",
      eventId: currentEvent.id
    }),
    onPrint: () => doPrint(currentEvent.id)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "proto-footer-strip"
  }, "Nottingham Venues \xB7 EMCC \xB7 Allergen Manager prototype \xB7 v1.1")), printedModal && /*#__PURE__*/React.createElement(PrintSuccessModal, {
    event: events.find(e => e.id === printedModal),
    onClose: () => {
      setPrintedModal(null);
      setView({
        name: "dashboard"
      });
    }
  }), newEventOpen && /*#__PURE__*/React.createElement(NewEventModal, {
    existingEvents: events,
    onCancel: () => setNewEventOpen(false),
    onCreate: createEvent
  }), /*#__PURE__*/React.createElement(TweaksPanel, {
    title: "Tweaks",
    noDeckControls: true
  }, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Layout"
  }, /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Density",
    value: tweaks.density,
    options: [{
      value: "comfortable",
      label: "Comfortable"
    }, {
      value: "compact",
      label: "Compact"
    }],
    onChange: v => setTweak("density", v)
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Print button placement",
    value: tweaks.printPlacement,
    options: [{
      value: "header",
      label: "Header"
    }, {
      value: "footer",
      label: "Footer bar"
    }],
    onChange: v => setTweak("printPlacement", v)
  }), /*#__PURE__*/React.createElement(TweakSelect, {
    label: "Top nav style",
    value: tweaks.topNavStyle,
    options: [{
      value: "minimal",
      label: "Minimal (current)"
    }, {
      value: "labelled",
      label: "Labelled icons"
    }, {
      value: "breadcrumb",
      label: "With breadcrumb"
    }],
    onChange: v => setTweak("topNavStyle", v)
  })), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Print preview"
  }, /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Paper size",
    value: tweaks.paperSize,
    options: [{
      value: "a4",
      label: "A4"
    }, {
      value: "a5",
      label: "A5"
    }, {
      value: "letter",
      label: "Letter"
    }],
    onChange: v => setTweak("paperSize", v)
  })), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Brand colour"
  }, /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Forest variant",
    value: tweaks.brand,
    options: [{
      value: "forest",
      label: "Default"
    }, {
      value: "dark",
      label: "Darker"
    }, {
      value: "warm",
      label: "Warmer"
    }],
    onChange: v => setTweak("brand", v)
  })), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Quick jump"
  }, /*#__PURE__*/React.createElement(TweakSelect, {
    label: "Go to screen",
    value: view.name,
    options: [{
      value: "dashboard",
      label: "Dashboard"
    }, {
      value: "entry",
      label: "Allergen entry"
    }, {
      value: "print",
      label: "Preview & print"
    }],
    onChange: v => {
      if (v === "dashboard") setView({
        name: "dashboard"
      });else setView({
        name: v,
        eventId: selectedEventId
      });
    }
  }), /*#__PURE__*/React.createElement(TweakSelect, {
    label: "Active event",
    value: selectedEventId,
    options: events.map(e => ({
      value: e.id,
      label: e.name
    })),
    onChange: v => {
      setSelectedEventId(v);
      if (view.name !== "dashboard") setView({
        ...view,
        eventId: v
      });
    }
  }))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "prototype/App.jsx", error: String((e && e.message) || e) }); }

// prototype/Dashboard.jsx
try { (() => {
/* global React, Icon, Button, Badge, Banner, Card, Field, Input, Tag, TagToggle, ProgressBar, StatCard, VersionStamp, STANDARD_MENUS, eventStatus, eventPrinted */
// Dashboard — denser FOH triage view. Filter chips, status strip, event list with
// time-to-service and reprint hints, plus a right-rail event detail.

const NOW_MINUTES = 11 * 60 + 47; // "11:47" — matches App.NOW_TIME

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function minutesUntil(t) {
  return timeToMinutes(t) - NOW_MINUTES;
}
function relServiceLabel(t) {
  const diff = minutesUntil(t);
  if (diff < 0) {
    const past = Math.abs(diff);
    if (past < 60) return {
      text: `${past} min ago`,
      tone: "past"
    };
    const h = Math.floor(past / 60);
    const m = past % 60;
    return {
      text: m ? `${h}h ${m}m ago` : `${h}h ago`,
      tone: "past"
    };
  }
  if (diff < 60) return {
    text: `in ${diff} min`,
    tone: "soon"
  };
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return {
    text: m ? `in ${h}h ${m}m` : `in ${h}h`,
    tone: h < 3 ? "near" : "later"
  };
}
function FilterChip({
  active,
  count,
  onClick,
  children,
  tone = "neutral"
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `filter-chip filter-chip-${tone}${active ? " active" : ""}`,
    onClick: onClick
  }, children, count !== undefined && /*#__PURE__*/React.createElement("span", {
    className: "filter-chip-count"
  }, count));
}
function Dashboard({
  events,
  selectedEventId,
  onSelectEvent,
  onChangeMenu,
  onFillAllergens,
  onPreviewPrint,
  onNewEvent
}) {
  const [filter, setFilter] = React.useState("all");
  const selected = events.find(e => e.id === selectedEventId) || events[0];

  // ── Counts for the filter strip and stats ─────────────
  const counts = React.useMemo(() => {
    const c = {
      all: events.length,
      ready: 0,
      warn: 0,
      incomplete: 0
    };
    for (const e of events) {
      const st = eventStatus(e);
      c[st] = (c[st] || 0) + 1;
    }
    return c;
  }, [events]);
  const totalDishes = events.reduce((n, e) => n + e.dishes.length, 0);
  const allergensPresent = events.reduce((n, e) => {
    return n + e.dishes.reduce((m, d) => m + Object.values(d.allergens || {}).filter(v => v === "present").length, 0);
  }, 0);
  const printedReady = events.filter(eventPrinted).length;
  const reprintEvents = events.filter(e => eventStatus(e) === "warn");

  // ── Filter events ─────────────────────────────────────
  const visible = events.filter(e => {
    if (filter === "all") return true;
    return eventStatus(e) === filter;
  });
  const selStatus = eventStatus(selected);
  const selDone = selected.dishes.filter(d => d.complete).length;
  const selRel = relServiceLabel(selected.time);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "screen-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "screen-title"
  }, "Today's events"), /*#__PURE__*/React.createElement("div", {
    className: "screen-sub"
  }, "Wednesday 20 May \xB7 ", events.length, " events \xB7 ", printedReady, " of ", events.length, " printed")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    icon: "calendar"
  }, "Today \xB7 20 May"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "plus",
    onClick: onNewEvent
  }, "New event"))), reprintEvents.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "dash-reprint-banner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dash-reprint-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "warning",
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    className: "dash-reprint-body"
  }, /*#__PURE__*/React.createElement("strong", null, reprintEvents.length, " event", reprintEvents.length === 1 ? "" : "s", " need", reprintEvents.length === 1 ? "s" : "", " reprinting"), /*#__PURE__*/React.createElement("span", {
    className: "dash-reprint-detail"
  }, reprintEvents.map(e => e.name).join(" · "), " \u2014 allergen data has changed since the last print")), /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    size: "sm",
    icon: "print",
    onClick: () => onPreviewPrint(reprintEvents[0].id)
  }, "Open first")), /*#__PURE__*/React.createElement("div", {
    className: "status-strip"
  }, /*#__PURE__*/React.createElement(StatCard, {
    num: events.length,
    label: "Events"
  }), /*#__PURE__*/React.createElement(StatCard, {
    num: totalDishes,
    label: "Dishes"
  }), /*#__PURE__*/React.createElement(StatCard, {
    num: allergensPresent,
    label: "Allergens flagged"
  }), /*#__PURE__*/React.createElement(StatCard, {
    num: `${printedReady}/${events.length}`,
    label: "Print-ready"
  })), /*#__PURE__*/React.createElement("div", {
    className: "filter-chip-row"
  }, /*#__PURE__*/React.createElement(FilterChip, {
    active: filter === "all",
    count: counts.all,
    onClick: () => setFilter("all")
  }, "All"), /*#__PURE__*/React.createElement(FilterChip, {
    active: filter === "incomplete",
    count: counts.incomplete,
    tone: "danger",
    onClick: () => setFilter("incomplete")
  }, "Incomplete"), /*#__PURE__*/React.createElement(FilterChip, {
    active: filter === "warn",
    count: counts.warn || 0,
    tone: "warn",
    onClick: () => setFilter("warn")
  }, "Reprint"), /*#__PURE__*/React.createElement(FilterChip, {
    active: filter === "ready",
    count: counts.ready || 0,
    tone: "ready",
    onClick: () => setFilter("ready")
  }, "Ready"), /*#__PURE__*/React.createElement("div", {
    className: "filter-chip-spacer"
  }), /*#__PURE__*/React.createElement("span", {
    className: "filter-chip-meta"
  }, "Sorted by service time")), /*#__PURE__*/React.createElement("div", {
    className: "dash-grid"
  }, /*#__PURE__*/React.createElement("div", null, visible.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "dash-empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dash-empty-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    className: "dash-empty-title"
  }, "Nothing in this lane"), /*#__PURE__*/React.createElement("div", {
    className: "dash-empty-sub"
  }, "No ", filter, " events for today. Switch filters or create a new event.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, visible.map(e => {
    const st = eventStatus(e);
    const done = e.dishes.filter(d => d.complete).length;
    const rel = relServiceLabel(e.time);
    return /*#__PURE__*/React.createElement("div", {
      key: e.id,
      className: `event-row${e.id === selected.id ? " selected" : ""}`,
      onClick: () => onSelectEvent(e.id)
    }, /*#__PURE__*/React.createElement("div", {
      className: "event-row-time"
    }, /*#__PURE__*/React.createElement("div", {
      className: "event-row-time-clock"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "clock",
      size: 12,
      style: {
        verticalAlign: -2,
        marginRight: 4
      }
    }), e.time), /*#__PURE__*/React.createElement("div", {
      className: `event-row-time-rel rel-${rel.tone}`
    }, rel.text)), /*#__PURE__*/React.createElement("div", {
      className: "event-row-main"
    }, /*#__PURE__*/React.createElement("div", {
      className: "event-row-title"
    }, e.name), /*#__PURE__*/React.createElement("div", {
      className: "event-row-meta"
    }, e.room, " \xB7 Menu ", e.menuId, " \xB7 ", e.guests, " guests")), /*#__PURE__*/React.createElement("div", {
      className: "event-row-progress"
    }, /*#__PURE__*/React.createElement("div", {
      className: "event-row-progress-label"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)"
      }
    }, done, "/", e.dishes.length)), /*#__PURE__*/React.createElement(ProgressBar, {
      value: done,
      max: e.dishes.length
    })), /*#__PURE__*/React.createElement("div", {
      className: "event-row-status"
    }, st === "ready" && /*#__PURE__*/React.createElement(Badge, {
      kind: "ready",
      dot: true
    }, "Ready"), st === "warn" && /*#__PURE__*/React.createElement(Badge, {
      kind: "warn",
      dot: true
    }, "Reprint"), st === "incomplete" && /*#__PURE__*/React.createElement(Badge, {
      kind: "danger",
      dot: true
    }, "Incomplete"), /*#__PURE__*/React.createElement("div", {
      className: "event-row-version"
    }, "v", e.version, " \xB7 ", e.lastModifiedAt)));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dash-detail-rail"
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dash-detail-name"
  }, selected.name), /*#__PURE__*/React.createElement("div", {
    className: "dash-detail-meta"
  }, selected.room, " \xB7 ", selected.time, " \xB7 ", selected.guests, " guests \xB7 ", /*#__PURE__*/React.createElement("span", {
    className: `rel-${selRel.tone}`
  }, selRel.text))), selStatus === "ready" && /*#__PURE__*/React.createElement(Badge, {
    kind: "ready",
    dot: true
  }, "Ready"), selStatus === "warn" && /*#__PURE__*/React.createElement(Badge, {
    kind: "warn",
    dot: true
  }, "Reprint required"), selStatus === "incomplete" && /*#__PURE__*/React.createElement(Badge, {
    kind: "danger",
    dot: true
  }, "Incomplete")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--fg-3)"
    }
  }, selDone, " of ", selected.dishes.length, " dishes completed"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)"
    }
  }, "v", selected.version, " \xB7 edited ", selected.lastModifiedAt)), /*#__PURE__*/React.createElement(ProgressBar, {
    value: selDone,
    max: selected.dishes.length
  })), selStatus === "warn" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Banner, {
    kind: "warn"
  }, "Edits made after last print at ", /*#__PURE__*/React.createElement("strong", null, selected.lastPrintedAt), ". Counters still hold v", selected.version - 1, ".")), /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Assigned menu"), /*#__PURE__*/React.createElement("div", {
    className: "menu-cards"
  }, ["A", "B", "C"].map(id => {
    const m = STANDARD_MENUS[id];
    const active = selected.menuId === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      type: "button",
      className: `menu-card${active ? " active" : ""}`,
      onClick: () => onChangeMenu(selected.id, id)
    }, /*#__PURE__*/React.createElement("div", {
      className: "menu-card-title"
    }, m.name), /*#__PURE__*/React.createElement("div", {
      className: "menu-card-meta"
    }, m.subtitle), active && /*#__PURE__*/React.createElement("div", {
      className: "menu-card-active-tick"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 12
    }), "Currently assigned"));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--fg-4)",
      marginTop: 4,
      marginBottom: 16
    }
  }, "Switching menu replaces the dish list and resets allergen entry for this event."), /*#__PURE__*/React.createElement("div", {
    className: "dash-detail-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "edit",
    onClick: () => onFillAllergens(selected.id)
  }, selDone === selected.dishes.length ? "Review allergens" : "Fill allergens"), /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    icon: "print",
    onClick: () => onPreviewPrint(selected.id),
    disabled: selStatus === "incomplete"
  }, selStatus === "warn" ? "Reprint all 3" : "Preview & print"))))));
}
Object.assign(window, {
  Dashboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "prototype/Dashboard.jsx", error: String((e && e.message) || e) }); }

// prototype/Entry.jsx
try { (() => {
/* global React, Icon, Button, Field, Input, Tag, TagToggle, Badge, Banner, Card, ProgressBar, VersionStamp, AllergenCell, ALLERGENS, dishContainsList, dishMayList */
// Allergen entry — scrollable list of dish blocks, one per dish.

function DishBlock({
  dish,
  index,
  onUpdate,
  onToggleAllergen,
  onToggleTag,
  onMarkComplete
}) {
  const contains = dishContainsList(dish);
  const may = dishMayList(dish);
  const isEmpty = !contains.length && !may.length && !(dish.tags || []).length;
  return /*#__PURE__*/React.createElement("div", {
    className: `dish-block ${dish.complete ? "complete" : isEmpty ? "draft" : ""}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "dish-block-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dish-block-index"
  }, dish.complete ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14
  }) : index + 1), /*#__PURE__*/React.createElement("div", {
    className: "dish-block-name"
  }, /*#__PURE__*/React.createElement("input", {
    className: "dish-name-input",
    value: dish.name,
    placeholder: "Untitled dish",
    onChange: e => onUpdate(dish.id, {
      name: e.target.value
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)",
      marginTop: 2
    }
  }, dish.section || "—")), /*#__PURE__*/React.createElement("div", {
    className: "dish-block-tags"
  }, /*#__PURE__*/React.createElement(TagToggle, {
    kind: "v",
    active: (dish.tags || []).includes("v"),
    onClick: () => onToggleTag(dish.id, "v")
  }, "V"), /*#__PURE__*/React.createElement(TagToggle, {
    kind: "vg",
    active: (dish.tags || []).includes("vg"),
    onClick: () => onToggleTag(dish.id, "vg")
  }, "VG"), /*#__PURE__*/React.createElement(TagToggle, {
    kind: "ncgi",
    active: (dish.tags || []).includes("ncgi"),
    onClick: () => onToggleTag(dish.id, "ncgi")
  }, "NCGI"), /*#__PURE__*/React.createElement(TagToggle, {
    kind: "df",
    active: (dish.tags || []).includes("df"),
    onClick: () => onToggleTag(dish.id, "df")
  }, "DF")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, dish.complete ? /*#__PURE__*/React.createElement(Badge, {
    kind: "ready",
    dot: true
  }, "Complete") : isEmpty ? /*#__PURE__*/React.createElement(Badge, {
    kind: "neutral"
  }, "Empty") : /*#__PURE__*/React.createElement(Badge, {
    kind: "warn",
    dot: true
  }, "In progress"))), /*#__PURE__*/React.createElement("div", {
    className: "dish-allergen-grid"
  }, ALLERGENS.map(a => /*#__PURE__*/React.createElement(AllergenCell, {
    key: a,
    name: a,
    state: dish.allergens?.[a],
    onClick: () => onToggleAllergen(dish.id, a)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--fg-4)",
      marginTop: -8,
      marginBottom: 8
    }
  }, "Click cell to cycle: absent \u2192 present \u2192 may contain \u2192 absent"), /*#__PURE__*/React.createElement("div", {
    className: "dish-text-fields"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Contains",
    badge: "auto",
    hint: "Auto-generated from ticked allergens"
  }, /*#__PURE__*/React.createElement(Input, {
    auto: true,
    readOnly: true,
    value: contains.join(", ") || "—"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "May contain",
    badge: "manual",
    hint: "Cross-contamination warning \u2014 type any extras"
  }, /*#__PURE__*/React.createElement(Input, {
    value: dish.mayContain || may.join(", "),
    placeholder: "e.g. Sesame, Mustard",
    onChange: e => onUpdate(dish.id, {
      mayContain: e.target.value
    })
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: 14,
      paddingTop: 12,
      borderTop: "1px dashed var(--neutral-200)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: dish.complete ? "ghost" : "primary",
    size: "sm",
    icon: dish.complete ? "refresh" : "check",
    onClick: () => onMarkComplete(dish.id)
  }, dish.complete ? "Mark in progress" : "Mark dish complete")));
}
function Entry({
  event,
  onUpdate,
  onToggleAllergen,
  onToggleTag,
  onMarkComplete,
  onBack,
  onPreviewPrint,
  onSaveDraft
}) {
  const done = event.dishes.filter(d => d.complete).length;
  const allDone = done === event.dishes.length;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "screen",
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "screen-header",
    style: {
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    type: "button",
    style: {
      background: "none",
      border: "none",
      color: "var(--fg-4)",
      fontSize: 12,
      padding: 0,
      marginBottom: 8,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontFamily: "inherit"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 12
  }), "Back to dashboard"), /*#__PURE__*/React.createElement("h1", {
    className: "screen-title"
  }, event.name), /*#__PURE__*/React.createElement("div", {
    className: "screen-sub"
  }, event.room, " \xB7 ", event.time, " \xB7 ", event.guests, " guests \xB7 Menu ", event.menuId)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(VersionStamp, null, "v", event.version, " \xB7 18 May \xB7 ", event.lastModifiedAt), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    icon: "download",
    onClick: onSaveDraft
  }, "Save draft"), /*#__PURE__*/React.createElement(Button, {
    className: "header-print-btn",
    variant: "gold",
    icon: "print",
    onClick: onPreviewPrint,
    disabled: !allDone
  }, "Preview & print"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--fg-3)",
      fontWeight: 500
    }
  }, done, " of ", event.dishes.length, " dishes completed"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)"
    }
  }, Math.round(done / event.dishes.length * 100), "%")), /*#__PURE__*/React.createElement(ProgressBar, {
    value: done,
    max: event.dishes.length
  })), !allDone && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(Banner, {
    kind: "info"
  }, event.dishes.length - done, " dish", event.dishes.length - done === 1 ? "" : "es", " still need allergen entry. ", /*#__PURE__*/React.createElement("strong", null, "Contains"), " auto-fills as you tick. ", /*#__PURE__*/React.createElement("strong", null, "May contain"), " is manual.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, event.dishes.map((d, i) => /*#__PURE__*/React.createElement(DishBlock, {
    key: d.id,
    dish: d,
    index: i,
    onUpdate: onUpdate,
    onToggleAllergen: onToggleAllergen,
    onToggleTag: onToggleTag,
    onMarkComplete: onMarkComplete
  })))), /*#__PURE__*/React.createElement("div", {
    className: "sticky-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sticky-footer-left"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "chevron-left",
    onClick: onBack
  }, "Back to dashboard"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--fg-4)",
      marginLeft: 8
    }
  }, done, " of ", event.dishes.length, " dishes done \xB7 last edited ", event.lastModifiedAt)), /*#__PURE__*/React.createElement("div", {
    className: "sticky-footer-right"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    icon: "download",
    onClick: onSaveDraft
  }, "Save draft"), /*#__PURE__*/React.createElement(Button, {
    className: "footer-print-btn",
    variant: "gold",
    icon: "print",
    onClick: onPreviewPrint,
    disabled: !allDone
  }, "Preview & print all 3"))));
}
Object.assign(window, {
  Entry,
  DishBlock
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "prototype/Entry.jsx", error: String((e && e.message) || e) }); }

// prototype/NewEvent.jsx
try { (() => {
/* global React, Icon, Button, Field, Input, Badge, Banner, STANDARD_MENUS, instantiateMenu */
// New event creation modal — captures core event metadata + starting menu.

function NewEventModal({
  onCancel,
  onCreate,
  existingEvents
}) {
  const [name, setName] = React.useState("");
  const [room, setRoom] = React.useState("Room 4");
  const [time, setTime] = React.useState("12:30");
  const [guests, setGuests] = React.useState("");
  const [menuId, setMenuId] = React.useState("A");
  const [touched, setTouched] = React.useState({});
  const rooms = ["Room 2", "Room 4", "Suite 1", "Suite 2", "Banqueting Hall", "The Atrium"];
  const nameError = touched.name && !name.trim() ? "Event name is required" : null;
  const guestsError = touched.guests && (!guests || Number(guests) <= 0) ? "Guest count must be at least 1" : null;
  const duplicateError = name.trim() && existingEvents.some(e => e.name.toLowerCase() === name.trim().toLowerCase()) ? "An event with this name already exists today" : null;
  const canSubmit = name.trim() && Number(guests) > 0 && !duplicateError;
  const handleSubmit = e => {
    e?.preventDefault?.();
    setTouched({
      name: true,
      guests: true
    });
    if (!canSubmit) return;
    onCreate({
      name: name.trim(),
      room,
      time,
      guests: Number(guests),
      menuId
    });
  };
  const m = STANDARD_MENUS[menuId];
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-veil",
    onClick: onCancel
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal-newevent",
    onClick: e => e.stopPropagation(),
    role: "dialog",
    "aria-label": "Create new event"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-newevent-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "modal-newevent-eyebrow"
  }, "New event"), /*#__PURE__*/React.createElement("div", {
    className: "modal-newevent-title"
  }, "Create event"), /*#__PURE__*/React.createElement("div", {
    className: "modal-newevent-sub"
  }, "Today \xB7 Wednesday 20 May")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onCancel,
    className: "modal-newevent-close",
    "aria-label": "Cancel"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-newevent-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "newevent-grid"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "1 / -1"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Event name",
    error: nameError || duplicateError,
    hint: "Visible on every printed document"
  }, /*#__PURE__*/React.createElement(Input, {
    value: name,
    onChange: e => setName(e.target.value),
    onBlur: () => setTouched(t => ({
      ...t,
      name: true
    })),
    placeholder: "e.g. Quarterly partner briefing",
    error: !!(nameError || duplicateError)
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Room"
  }, /*#__PURE__*/React.createElement("select", {
    className: "input",
    value: room,
    onChange: e => setRoom(e.target.value)
  }, rooms.map(r => /*#__PURE__*/React.createElement("option", {
    key: r,
    value: r
  }, r)))), /*#__PURE__*/React.createElement(Field, {
    label: "Service time",
    hint: "24h clock"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "time",
    value: time,
    onChange: e => setTime(e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Guests",
    error: guestsError
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    value: guests,
    onChange: e => setGuests(e.target.value),
    onBlur: () => setTouched(t => ({
      ...t,
      guests: true
    })),
    placeholder: "e.g. 84",
    error: !!guestsError
  }))), /*#__PURE__*/React.createElement("div", {
    className: "newevent-menu-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "newevent-menu-label"
  }, "Starting menu"), /*#__PURE__*/React.createElement("div", {
    className: "newevent-menu-hint"
  }, "Pick the standard menu to seed this event's dish list. Allergens auto-fill from previous entries; review every dish before printing."), /*#__PURE__*/React.createElement("div", {
    className: "newevent-menu-cards"
  }, Object.values(STANDARD_MENUS).map(menu => {
    const active = menu.id === menuId;
    return /*#__PURE__*/React.createElement("button", {
      key: menu.id,
      type: "button",
      className: `menu-card${active ? " active" : ""}`,
      onClick: () => setMenuId(menu.id)
    }, /*#__PURE__*/React.createElement("div", {
      className: "menu-card-title"
    }, menu.name), /*#__PURE__*/React.createElement("div", {
      className: "menu-card-meta"
    }, menu.subtitle), /*#__PURE__*/React.createElement("div", {
      className: "newevent-menu-dishlist"
    }, menu.dishes.slice(0, 3).map(d => d.name).join(" · "), menu.dishes.length > 3 ? ` · +${menu.dishes.length - 3} more` : ""));
  }))), /*#__PURE__*/React.createElement(Banner, {
    kind: "info"
  }, m.dishes.length, " dishes will be added from ", m.name, ". Allergens carry over from the standard menu but must be re-verified by the chef before service.")), /*#__PURE__*/React.createElement("div", {
    className: "modal-newevent-foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "newevent-foot-meta"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, "Defaults can be changed any time from the event row")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onCancel
  }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "plus",
    type: "submit",
    disabled: !canSubmit
  }, "Create event"))))));
}
Object.assign(window, {
  NewEventModal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "prototype/NewEvent.jsx", error: String((e && e.message) || e) }); }

// prototype/PreviewPrint.jsx
try { (() => {
/* global React, Icon, Button, Badge, Banner, Tag, Card, VersionStamp, ALLERGENS, ALLERGEN_SHORT, dishContainsList, dishMayList, dishTagsString, eventPrinted, eventStatus */
// Preview & print — three document previews + change log + reprint banner.

const TAG_COLOR = {
  v: "var(--tag-v-text)",
  vg: "var(--tag-vg-text)",
  ncgi: "var(--tag-ncgi-text)",
  df: "var(--tag-df-text)"
};
const TAG_LEGEND = [{
  kind: "v",
  label: "Vegetarian"
}, {
  kind: "vg",
  label: "Vegan"
}, {
  kind: "ncgi",
  label: "Not Containing Gluten Ingredients"
}, {
  kind: "df",
  label: "Dairy Free"
}];
function PaperOrgHead() {
  return /*#__PURE__*/React.createElement("div", {
    className: "paper-orghead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "paper-org-main"
  }, "Nottingham Venues"), /*#__PURE__*/React.createElement("div", {
    className: "paper-org-sub"
  }, "EMCC"));
}
function DietaryLegend() {
  return /*#__PURE__*/React.createElement("div", {
    className: "paper-legend-tags"
  }, TAG_LEGEND.map(t => /*#__PURE__*/React.createElement("span", {
    key: t.kind
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: TAG_COLOR[t.kind],
      fontWeight: 700
    }
  }, "(", t.kind.toUpperCase(), ")"), " ", t.label)));
}
function AllergenSheetDoc({
  event,
  paperSize
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `paper paper-${paperSize || "a4"}`
  }, /*#__PURE__*/React.createElement(PaperOrgHead, null), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto"
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "matrix matrix-zebra"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "dish-col"
  }, "Dish"), ALLERGENS.map(a => /*#__PURE__*/React.createElement("th", {
    key: a
  }, /*#__PURE__*/React.createElement("span", {
    className: "allergen-head"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: a.toLowerCase(),
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    className: "allergen-head-name"
  }, a)))))), /*#__PURE__*/React.createElement("tbody", null, event.dishes.map(d => /*#__PURE__*/React.createElement("tr", {
    key: d.id
  }, /*#__PURE__*/React.createElement("td", {
    className: "dish-cell"
  }, d.name, (d.tags || []).length ? /*#__PURE__*/React.createElement("span", {
    className: "dish-cell-tags"
  }, (d.tags || []).map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      color: TAG_COLOR[t],
      fontWeight: 600
    }
  }, "(", t.toUpperCase(), ")"))) : null), ALLERGENS.map(a => {
    const v = d.allergens?.[a];
    return v === "present" ? /*#__PURE__*/React.createElement("td", {
      key: a,
      className: "x-mark"
    }, "\u2715") : v === "may" ? /*#__PURE__*/React.createElement("td", {
      key: a,
      style: {
        background: "var(--allergen-maycontain-bg)",
        color: "var(--allergen-maycontain)",
        fontSize: 11,
        fontWeight: 700
      }
    }, "M") : /*#__PURE__*/React.createElement("td", {
      key: a
    });
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      fontSize: 11,
      color: "var(--fg-4)",
      marginTop: 18,
      paddingTop: 14,
      borderTop: "1px solid var(--neutral-200)"
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-danger)",
      fontWeight: 700
    }
  }, "\u2715"), " Allergen present"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-warning)",
      fontWeight: 700
    }
  }, "M"), " Cross-contamination possible"), /*#__PURE__*/React.createElement("span", null, "Empty cell \u2014 Absent"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontFamily: "var(--font-mono)"
    }
  }, "Page 1 of 1")), /*#__PURE__*/React.createElement(DietaryLegend, null));
}
function MenuDoc({
  event,
  paperSize
}) {
  // Group by section
  const sections = {};
  for (const d of event.dishes) {
    const sec = d.section || "Other";
    sections[sec] = sections[sec] || [];
    sections[sec].push(d);
  }
  const ORDER = ["Starter", "Main", "Side", "Dessert", "AM", "Lunch", "PM", "Other"];
  const sectionKeys = Object.keys(sections).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  return /*#__PURE__*/React.createElement("div", {
    className: `paper paper-${paperSize || "a4"}`
  }, /*#__PURE__*/React.createElement(PaperOrgHead, null), sectionKeys.map(sec => /*#__PURE__*/React.createElement("div", {
    className: "menu-doc-section",
    key: sec
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-doc-section-title"
  }, sec), sections[sec].map(d => /*#__PURE__*/React.createElement("div", {
    className: "menu-doc-dish",
    key: d.id
  }, /*#__PURE__*/React.createElement("span", {
    className: "menu-doc-dish-name"
  }, d.name), (d.tags || []).length > 0 && /*#__PURE__*/React.createElement("span", {
    className: "menu-doc-dish-tags"
  }, (d.tags || []).map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    className: t
  }, "(", t.toUpperCase(), ")"))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      fontSize: 11,
      color: "var(--fg-4)",
      marginTop: 8,
      paddingTop: 14,
      borderTop: "1px solid var(--neutral-200)"
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--tag-v-text)",
      fontWeight: 600
    }
  }, "V"), " Vegetarian"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--tag-vg-text)",
      fontWeight: 600
    }
  }, "VG"), " Vegan"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--tag-ncgi-text)",
      fontWeight: 600
    }
  }, "NCGI"), " Not Containing Gluten Ingredients"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--tag-df-text)",
      fontWeight: 600
    }
  }, "DF"), " Dairy Free"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontFamily: "var(--font-mono)"
    }
  }, "Nottingham Venues \xB7 EMCC")));
}
function PlacecardsDoc({
  event
}) {
  const PER_SHEET = 14; // 2 across × 7 down on A4
  const filler = Math.max(0, PER_SHEET - event.dishes.length);
  return /*#__PURE__*/React.createElement("div", {
    className: "paper paper-a4 paper-labels"
  }, /*#__PURE__*/React.createElement(PaperOrgHead, null), /*#__PURE__*/React.createElement("div", {
    className: "label-sheet-caption"
  }, "Q-Connect Multipurpose Labels \xB7 63.5 \xD7 38 mm \xB7 14 per A4 sheet (2 \xD7 7)"), /*#__PURE__*/React.createElement("div", {
    className: "label-sheet"
  }, event.dishes.map(d => {
    const contains = dishContainsList(d);
    const may = dishMayList(d);
    const mayText = d.mayContain || may.join(", ");
    return /*#__PURE__*/React.createElement("div", {
      className: "label",
      key: d.id
    }, /*#__PURE__*/React.createElement("div", {
      className: "label-name"
    }, d.name, (d.tags || []).length ? /*#__PURE__*/React.createElement("span", {
      className: "label-tags"
    }, (d.tags || []).map(t => /*#__PURE__*/React.createElement("span", {
      key: t,
      style: {
        color: TAG_COLOR[t]
      }
    }, "(", t.toUpperCase(), ")"))) : null), /*#__PURE__*/React.createElement("div", {
      className: "label-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "lbl"
    }, "Contains:"), " ", contains.length ? contains.join(", ") : /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--fg-4)"
      }
    }, "None of the 14")), mayText && /*#__PURE__*/React.createElement("div", {
      className: "label-row may"
    }, /*#__PURE__*/React.createElement("span", {
      className: "lbl"
    }, "May contain:"), " ", mayText));
  }), Array.from({
    length: filler
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    className: "label label-empty",
    key: `empty-${i}`
  }))));
}
function ChangeLog({
  entries
}) {
  if (!entries?.length) return null;
  const ICONS = {
    edit: "edit",
    warn: "warning",
    print: "print",
    add: "plus",
    neutral: "info"
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "log-list"
  }, [...entries].reverse().map((entry, i) => /*#__PURE__*/React.createElement("div", {
    className: "log-item",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: `log-dot ${entry.type || "neutral"}`
  }), /*#__PURE__*/React.createElement("div", {
    className: "log-text"
  }, entry.text), /*#__PURE__*/React.createElement("div", {
    className: "log-time"
  }, entry.t))));
}
function PreviewPrint({
  event,
  onBack,
  onPrint,
  onEditAllergens,
  printed,
  paperSize = "a4"
}) {
  const [tab, setTab] = React.useState("sheet");
  const status = eventStatus(event);
  const needsReprint = status === "warn";
  const wasPrinted = eventPrinted(event);

  // Find latest warn entry for reprint banner
  const lastWarn = needsReprint ? [...event.log].reverse().find(l => l.type === "warn") : null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "screen",
    style: {
      paddingBottom: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "screen-header",
    style: {
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    type: "button",
    style: {
      background: "none",
      border: "none",
      color: "var(--fg-4)",
      fontSize: 12,
      padding: 0,
      marginBottom: 8,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontFamily: "inherit"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 12
  }), "Back to dashboard"), /*#__PURE__*/React.createElement("h1", {
    className: "screen-title"
  }, "Preview & print"), /*#__PURE__*/React.createElement("div", {
    className: "screen-sub"
  }, event.name, " \xB7 ", event.room, " \xB7 ", event.time)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(VersionStamp, null, "v", event.version, " \xB7 18 May \xB7 ", event.lastModifiedAt), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    icon: "edit",
    onClick: onEditAllergens
  }, "Edit allergens"), /*#__PURE__*/React.createElement(Button, {
    className: "header-print-btn",
    variant: "gold",
    size: "lg",
    icon: "print",
    onClick: onPrint
  }, "Print all 3 documents"))), needsReprint && /*#__PURE__*/React.createElement("div", {
    className: "reprint-banner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "reprint-banner-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "warning",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    className: "reprint-banner-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "reprint-banner-title"
  }, "Reprint required"), /*#__PURE__*/React.createElement("div", {
    className: "reprint-banner-detail"
  }, lastWarn?.text || "Allergen data has changed since the last print.", " ", "Last print was v", event.version - 1, " at ", event.lastPrintedAt, ". Counters still hold the previous version.")), /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    icon: "print",
    onClick: onPrint
  }, "Reprint all 3")), wasPrinted && !needsReprint && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Banner, {
    kind: "success"
  }, "All 3 documents are current. Last printed v", event.version, " at ", event.lastPrintedAt, ".")), /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Documents"), /*#__PURE__*/React.createElement("div", {
    className: "print-summary"
  }, [{
    id: "sheet",
    title: "Allergen sheet",
    icon: "document",
    meta: `${event.dishes.length} dishes · 14 allergens · A4`
  }, {
    id: "menu",
    title: "Menu",
    icon: "document",
    meta: "Dish names + dietary tags · A4"
  }, {
    id: "placecards",
    title: "Placecards",
    icon: "document",
    meta: `${event.dishes.length} labels · 63.5 × 38 mm`
  }].map(doc => /*#__PURE__*/React.createElement("div", {
    className: "print-summary-card",
    key: doc.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "print-summary-card-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: doc.icon,
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "print-summary-card-title"
  }, doc.title), /*#__PURE__*/React.createElement("div", {
    className: "print-summary-card-meta"
  }, doc.meta), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 6,
      paddingTop: 8,
      borderTop: "1px dashed var(--neutral-200)"
    }
  }, /*#__PURE__*/React.createElement(VersionStamp, null, "v", event.version, " \xB7 ", event.lastModifiedAt), needsReprint ? /*#__PURE__*/React.createElement(Badge, {
    kind: "warn",
    dot: true
  }, "Reprint") : /*#__PURE__*/React.createElement(Badge, {
    kind: "ready",
    dot: true
  }, "Ready"))))), /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Preview"), /*#__PURE__*/React.createElement("div", {
    className: "doc-tabs"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `doc-tab${tab === "sheet" ? " active" : ""}`,
    onClick: () => setTab("sheet")
  }, "Allergen sheet"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `doc-tab${tab === "menu" ? " active" : ""}`,
    onClick: () => setTab("menu")
  }, "Menu"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `doc-tab${tab === "placecards" ? " active" : ""}`,
    onClick: () => setTab("placecards")
  }, "Placecards")), /*#__PURE__*/React.createElement("div", {
    className: "paper-stage",
    style: {
      marginBottom: 28
    }
  }, tab === "sheet" && /*#__PURE__*/React.createElement(AllergenSheetDoc, {
    event: event,
    paperSize: paperSize
  }), tab === "menu" && /*#__PURE__*/React.createElement(MenuDoc, {
    event: event,
    paperSize: paperSize
  }), tab === "placecards" && /*#__PURE__*/React.createElement(PlacecardsDoc, {
    event: event
  }), /*#__PURE__*/React.createElement("div", {
    className: "paper-stage-caption"
  }, tab === "placecards" ? "A4 label sheet · Q-Connect 63.5 × 38 mm · 14 labels per sheet" : `${paperSize.toUpperCase()} · single-sheet preview · actual print uses the assigned printer's default tray`)), /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Change log \xB7 ", event.name), /*#__PURE__*/React.createElement(ChangeLog, {
    entries: event.log
  })), /*#__PURE__*/React.createElement("div", {
    className: "sticky-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sticky-footer-left"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "chevron-left",
    onClick: onBack
  }, "Back to dashboard"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    icon: "edit",
    onClick: onEditAllergens
  }, "Edit allergens")), /*#__PURE__*/React.createElement("div", {
    className: "sticky-footer-right"
  }, /*#__PURE__*/React.createElement(VersionStamp, null, "v", event.version, " \xB7 18 May \xB7 ", event.lastModifiedAt), /*#__PURE__*/React.createElement(Button, {
    className: "footer-print-btn",
    variant: "gold",
    size: "lg",
    icon: "print",
    onClick: onPrint
  }, "Print all 3 documents"))));
}
Object.assign(window, {
  PreviewPrint,
  AllergenSheetDoc,
  MenuDoc,
  PlacecardsDoc,
  ChangeLog
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "prototype/PreviewPrint.jsx", error: String((e && e.message) || e) }); }

// prototype/PrintApp.jsx
try { (() => {
/* global React, ReactDOM, TopNav, Dashboard, Entry, AllergenSheetDoc, MenuDoc, PlacecardsDoc, ChangeLog, VersionStamp, Badge, Banner, Button, Icon, SEED_EVENTS, instantiateMenu, eventStatus, eventPrinted */
// Print-only renderer: stacks every screen of the prototype into one long static
// document, each section starting on its own page. Replaces App.jsx for the
// -print.html build.

function PrintCover() {
  return /*#__PURE__*/React.createElement("section", {
    className: "print-cover",
    "data-print-page": "cover"
  }, /*#__PURE__*/React.createElement("div", {
    className: "print-cover-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "print-cover-mark"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pin",
    size: 22
  }), /*#__PURE__*/React.createElement("span", null, "Allergen manager")), /*#__PURE__*/React.createElement("div", {
    className: "print-cover-title"
  }, "Hi-fi clickable prototype"), /*#__PURE__*/React.createElement("div", {
    className: "print-cover-sub"
  }, "East Midlands Conference Centre \xB7 Allergen Management Tool"), /*#__PURE__*/React.createElement("div", {
    className: "print-cover-meta"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Version"), /*#__PURE__*/React.createElement("strong", null, "1.0")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Stage"), /*#__PURE__*/React.createElement("strong", null, "Hi-fi prototype")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Date"), /*#__PURE__*/React.createElement("strong", null, "20 May 2026")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Source"), /*#__PURE__*/React.createElement("strong", null, "EMCC Allergen Tool Design Brief v1.0"))), /*#__PURE__*/React.createElement("ol", {
    className: "print-cover-toc"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "01"), " Dashboard ", /*#__PURE__*/React.createElement("span", {
    className: "dots"
  }), /*#__PURE__*/React.createElement("em", null, "Today's events overview")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "02"), " Allergen entry ", /*#__PURE__*/React.createElement("span", {
    className: "dots"
  }), /*#__PURE__*/React.createElement("em", null, "Per-dish allergen + tag entry")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "03"), " Preview & print ", /*#__PURE__*/React.createElement("span", {
    className: "dots"
  }), /*#__PURE__*/React.createElement("em", null, "Reprint banner, doc summary, change log")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "04"), " Document \u2014 Allergen sheet ", /*#__PURE__*/React.createElement("span", {
    className: "dots"
  }), /*#__PURE__*/React.createElement("em", null, "Printed output preview")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "05"), " Document \u2014 Menu ", /*#__PURE__*/React.createElement("span", {
    className: "dots"
  }), /*#__PURE__*/React.createElement("em", null, "Printed output preview")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "06"), " Document \u2014 Placecards ", /*#__PURE__*/React.createElement("span", {
    className: "dots"
  }), /*#__PURE__*/React.createElement("em", null, "Printed output preview")))));
}
function SectionHeader({
  num,
  title,
  subtitle
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "print-section-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "print-section-num"
  }, num), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "print-section-title"
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    className: "print-section-sub"
  }, subtitle)));
}
function PrintShell({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "proto-frame print-frame"
  }, /*#__PURE__*/React.createElement(TopNav, {
    active: "dashboard",
    onNav: () => {}
  }), /*#__PURE__*/React.createElement("div", {
    className: "print-frame-body"
  }, children));
}
function PrintApp() {
  const events = SEED_EVENTS;
  // Use the Tech Summit (incomplete) for dashboard + entry, and Schools Awards (needs reprint) for preview & print
  const dashEvent = events[0];
  const previewEvent = events[2];
  return /*#__PURE__*/React.createElement("div", {
    className: "print-root"
  }, /*#__PURE__*/React.createElement(PrintCover, null), /*#__PURE__*/React.createElement("section", {
    className: "print-page",
    "data-print-page": "dashboard"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    num: "01",
    title: "Dashboard",
    subtitle: "Today's events overview \xB7 the home / landing screen"
  }), /*#__PURE__*/React.createElement(PrintShell, null, /*#__PURE__*/React.createElement(Dashboard, {
    events: events,
    selectedEventId: dashEvent.id,
    onSelectEvent: () => {},
    onChangeMenu: () => {},
    onFillAllergens: () => {},
    onPreviewPrint: () => {},
    onNewEvent: () => {}
  }))), /*#__PURE__*/React.createElement("section", {
    className: "print-page",
    "data-print-page": "entry"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    num: "02",
    title: "Allergen entry",
    subtitle: `${dashEvent.name} · ${dashEvent.dishes.length} dishes`
  }), /*#__PURE__*/React.createElement(PrintShell, null, /*#__PURE__*/React.createElement(Entry, {
    event: dashEvent,
    onUpdate: () => {},
    onToggleAllergen: () => {},
    onToggleTag: () => {},
    onMarkComplete: () => {},
    onBack: () => {},
    onPreviewPrint: () => {},
    onSaveDraft: () => {}
  }))), /*#__PURE__*/React.createElement("section", {
    className: "print-page",
    "data-print-page": "preview-print"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    num: "03",
    title: "Preview & print",
    subtitle: `${previewEvent.name} · reprint flow`
  }), /*#__PURE__*/React.createElement(PrintShell, null, /*#__PURE__*/React.createElement(PreviewPrintStatic, {
    event: previewEvent
  }))), /*#__PURE__*/React.createElement("section", {
    className: "print-page",
    "data-print-page": "doc-sheet"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    num: "04",
    title: "Document \u2014 Allergen sheet",
    subtitle: "Printed output \xB7 matrix layout"
  }), /*#__PURE__*/React.createElement("div", {
    className: "print-doc-frame"
  }, /*#__PURE__*/React.createElement(AllergenSheetDoc, {
    event: previewEvent
  }))), /*#__PURE__*/React.createElement("section", {
    className: "print-page",
    "data-print-page": "doc-menu"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    num: "05",
    title: "Document \u2014 Menu",
    subtitle: "Printed output \xB7 grouped by section"
  }), /*#__PURE__*/React.createElement("div", {
    className: "print-doc-frame"
  }, /*#__PURE__*/React.createElement(MenuDoc, {
    event: previewEvent
  }))), /*#__PURE__*/React.createElement("section", {
    className: "print-page",
    "data-print-page": "doc-placecards"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    num: "06",
    title: "Document \u2014 Placecards",
    subtitle: "Printed output \xB7 one card per dish"
  }), /*#__PURE__*/React.createElement("div", {
    className: "print-doc-frame"
  }, /*#__PURE__*/React.createElement(PlacecardsDoc, {
    event: previewEvent
  }))));
}

// Static rendering of the Preview & Print screen. The interactive version uses
// tabbed previews — here we show the document summary + change log only, then
// the three documents follow on their own pages.
function PreviewPrintStatic({
  event
}) {
  const status = eventStatus(event);
  const needsReprint = status === "warn";
  const lastWarn = needsReprint ? [...event.log].reverse().find(l => l.type === "warn") : null;
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "screen-header",
    style: {
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--fg-4)",
      marginBottom: 8,
      display: "inline-flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 12
  }), "Back to dashboard"), /*#__PURE__*/React.createElement("h1", {
    className: "screen-title"
  }, "Preview & print"), /*#__PURE__*/React.createElement("div", {
    className: "screen-sub"
  }, event.name, " \xB7 ", event.room, " \xB7 ", event.time)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(VersionStamp, null, "v", event.version, " \xB7 18 May \xB7 ", event.lastModifiedAt), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    icon: "edit"
  }, "Edit allergens"), /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    size: "lg",
    icon: "print"
  }, "Print all 3 documents"))), needsReprint && /*#__PURE__*/React.createElement("div", {
    className: "reprint-banner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "reprint-banner-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "warning",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    className: "reprint-banner-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "reprint-banner-title"
  }, "Reprint required"), /*#__PURE__*/React.createElement("div", {
    className: "reprint-banner-detail"
  }, lastWarn?.text, " Last print was v", event.version - 1, " at ", event.lastPrintedAt, ". Counters still hold the previous version.")), /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    icon: "print"
  }, "Reprint all 3")), /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Documents"), /*#__PURE__*/React.createElement("div", {
    className: "print-summary"
  }, [{
    id: "sheet",
    title: "Allergen sheet",
    meta: `${event.dishes.length} dishes · 14 allergens`
  }, {
    id: "menu",
    title: "Menu",
    meta: "Dish names + dietary tags"
  }, {
    id: "placecards",
    title: "Placecards",
    meta: `${event.dishes.length} labels · 63.5 × 38 mm`
  }].map(doc => /*#__PURE__*/React.createElement("div", {
    className: "print-summary-card",
    key: doc.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "print-summary-card-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "document",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "print-summary-card-title"
  }, doc.title), /*#__PURE__*/React.createElement("div", {
    className: "print-summary-card-meta"
  }, doc.meta), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 6,
      paddingTop: 8,
      borderTop: "1px dashed var(--neutral-200)"
    }
  }, /*#__PURE__*/React.createElement(VersionStamp, null, "v", event.version, " \xB7 ", event.lastModifiedAt), needsReprint ? /*#__PURE__*/React.createElement(Badge, {
    kind: "warn",
    dot: true
  }, "Reprint") : /*#__PURE__*/React.createElement(Badge, {
    kind: "ready",
    dot: true
  }, "Ready"))))), /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Preview \xB7 Allergen sheet (other documents on next pages)"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(AllergenSheetDoc, {
    event: event
  })), /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Change log \xB7 ", event.name), /*#__PURE__*/React.createElement(ChangeLog, {
    entries: event.log
  }));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(PrintApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "prototype/PrintApp.jsx", error: String((e && e.message) || e) }); }

// prototype/data.jsx
try { (() => {
/* global window */
// Seed data for the Allergen Manager prototype.
// Three standard menus (A, B, C) with curated dishes from the design brief.

const ALLERGENS = ["Celery", "Gluten", "Crustaceans", "Eggs", "Fish", "Lupin", "Milk", "Molluscs", "Mustard", "Nuts", "Peanuts", "Sesame", "Soya", "Sulphites"];
const ALLERGEN_SHORT = {
  Celery: "Cel",
  Gluten: "Glu",
  Crustaceans: "Cru",
  Eggs: "Egg",
  Fish: "Fis",
  Lupin: "Lup",
  Milk: "Mil",
  Molluscs: "Mol",
  Mustard: "Mus",
  Nuts: "Nut",
  Peanuts: "Pea",
  Sesame: "Ses",
  Soya: "Soy",
  Sulphites: "Sul"
};

// Three standard menus, pre-loaded — straight from brief
const STANDARD_MENUS = {
  A: {
    id: "A",
    name: "Menu A",
    subtitle: "Conference standard · 8 dishes",
    dishes: [{
      name: "Tomato & basil soup",
      section: "Starter",
      allergens: {
        Celery: "present",
        Milk: "may"
      },
      tags: ["v"]
    }, {
      name: "Caesar salad",
      section: "Starter",
      allergens: {
        Fish: "present",
        Eggs: "present",
        Milk: "present",
        Gluten: "present"
      },
      tags: []
    }, {
      name: "Chicken skewers",
      section: "Main",
      allergens: {
        Milk: "present",
        Sesame: "may"
      },
      tags: ["ncgi"]
    }, {
      name: "Beef wellington",
      section: "Main",
      allergens: {
        Gluten: "present",
        Eggs: "present",
        Milk: "present",
        Mustard: "present"
      },
      tags: []
    }, {
      name: "Mexican rice",
      section: "Side",
      allergens: {
        Sulphites: "present"
      },
      tags: ["vg", "ncgi"]
    }, {
      name: "Sourdough rolls",
      section: "Side",
      allergens: {
        Gluten: "present",
        Milk: "may"
      },
      tags: ["v"]
    }, {
      name: "Lemon tart",
      section: "Dessert",
      allergens: {
        Gluten: "present",
        Eggs: "present",
        Milk: "present"
      },
      tags: ["v"]
    }, {
      name: "Fresh fruit plate",
      section: "Dessert",
      allergens: {},
      tags: ["v", "vg", "ncgi"]
    }]
  },
  B: {
    id: "B",
    name: "Menu B",
    subtitle: "AGM / banquet · 4 dishes",
    dishes: [{
      name: "Smoked salmon blini",
      section: "Starter",
      allergens: {
        Fish: "present",
        Milk: "present",
        Gluten: "present"
      },
      tags: []
    }, {
      name: "Roasted vegetable tart",
      section: "Main",
      allergens: {
        Gluten: "present",
        Milk: "present",
        Eggs: "present"
      },
      tags: ["v"]
    }, {
      name: "Seasonal sorbet",
      section: "Dessert",
      allergens: {
        Sulphites: "present"
      },
      tags: ["v", "vg", "ncgi"]
    }, {
      name: "Cheese selection",
      section: "Dessert",
      allergens: {
        Milk: "present"
      },
      tags: ["v"]
    }]
  },
  C: {
    id: "C",
    name: "Menu C",
    subtitle: "Gala dinner · 5 dishes",
    dishes: [{
      name: "Pea & mint soup",
      section: "Starter",
      allergens: {
        Milk: "present",
        Celery: "present"
      },
      tags: ["v"]
    }, {
      name: "Pan-fried sea bass",
      section: "Main",
      allergens: {
        Fish: "present",
        Milk: "present"
      },
      tags: ["ncgi"]
    }, {
      name: "Wild mushroom risotto",
      section: "Main",
      allergens: {
        Milk: "present",
        Sulphites: "may"
      },
      tags: ["v"]
    }, {
      name: "Chocolate fondant",
      section: "Dessert",
      allergens: {
        Gluten: "present",
        Eggs: "present",
        Milk: "present",
        Soya: "may"
      },
      tags: ["v"]
    }, {
      name: "Petit fours",
      section: "Dessert",
      allergens: {
        Gluten: "present",
        Eggs: "present",
        Milk: "present",
        Nuts: "may"
      },
      tags: []
    }]
  }
};

// Convert a menu definition into a working set of dish records (with ids + completion)
function instantiateMenu(menuId) {
  const m = STANDARD_MENUS[menuId];
  if (!m) return [];
  return m.dishes.map((d, i) => ({
    id: `${menuId}-d${i + 1}`,
    name: d.name,
    section: d.section,
    allergens: {
      ...d.allergens
    },
    tags: [...(d.tags || [])],
    mayContain: "",
    complete: true // standard menus seed as already-verified
  }));
}
const SEED_EVENTS = [{
  id: "e1",
  name: "Nottingham Tech Summit",
  room: "Room 4",
  time: "12:30",
  guests: 84,
  menuId: "A",
  dishes: instantiateMenu("A").map((d, i) => i >= 5 ? {
    ...d,
    complete: false,
    allergens: {},
    tags: []
  } : d),
  version: 3,
  lastPrintedAt: null,
  lastModifiedAt: "11:42",
  log: [{
    type: "edit",
    t: "09:14",
    text: "Event created — Menu A assigned"
  }, {
    type: "edit",
    t: "10:08",
    text: "Marked Chicken skewers complete"
  }, {
    type: "edit",
    t: "10:30",
    text: "Mexican rice — added Sulphites"
  }, {
    type: "warn",
    t: "11:42",
    text: "Tomato & basil soup — Celery added (post-print)"
  }]
}, {
  id: "e2",
  name: "Midlands Insurance AGM",
  room: "Suite 1",
  time: "13:00",
  guests: 42,
  menuId: "B",
  dishes: instantiateMenu("B"),
  version: 2,
  lastPrintedAt: "09:15",
  lastModifiedAt: "09:10",
  log: [{
    type: "edit",
    t: "08:12",
    text: "Event created — Menu B assigned"
  }, {
    type: "edit",
    t: "08:55",
    text: "All 4 dishes verified by chef"
  }, {
    type: "print",
    t: "09:15",
    text: "Printed all 3 documents · v2"
  }]
}, {
  id: "e3",
  name: "East Midlands Schools Awards",
  room: "Banqueting Hall",
  time: "18:30",
  guests: 220,
  menuId: "C",
  dishes: instantiateMenu("C"),
  version: 7,
  lastPrintedAt: "10:30",
  lastModifiedAt: "11:18",
  log: [{
    type: "edit",
    t: "06:40",
    text: "Event created — Menu C assigned"
  }, {
    type: "edit",
    t: "09:21",
    text: "Sea bass — confirmed ncgi tag"
  }, {
    type: "print",
    t: "10:30",
    text: "Printed all 3 documents · v6"
  }, {
    type: "warn",
    t: "11:18",
    text: "Petit fours — Nuts moved to 'may contain'"
  }]
}, {
  id: "e4",
  name: "Boots HQ training day",
  room: "Room 2",
  time: "10:00",
  guests: 36,
  menuId: "A",
  dishes: instantiateMenu("A").slice(0, 5).map((d, i) => i >= 2 ? {
    ...d,
    complete: false,
    allergens: {},
    tags: []
  } : d),
  version: 1,
  lastPrintedAt: null,
  lastModifiedAt: "08:02",
  log: [{
    type: "edit",
    t: "07:55",
    text: "Event created — Menu A assigned (reduced to 5 dishes)"
  }, {
    type: "edit",
    t: "08:02",
    text: "Marked first 2 dishes complete"
  }]
}];

// Derived helpers
function eventStatus(event) {
  const allComplete = event.dishes.every(d => d.complete);
  if (!allComplete) return "incomplete";
  // If modified since last print → needs reprint
  if (event.lastPrintedAt && event.lastModifiedAt > event.lastPrintedAt) return "warn";
  if (!event.lastPrintedAt) return "ready";
  return "ready";
}
function eventPrinted(event) {
  return Boolean(event.lastPrintedAt) && (!event.lastModifiedAt || event.lastModifiedAt <= event.lastPrintedAt);
}
function dishContainsList(d) {
  return Object.entries(d.allergens || {}).filter(([, v]) => v === "present").map(([k]) => k);
}
function dishMayList(d) {
  return Object.entries(d.allergens || {}).filter(([, v]) => v === "may").map(([k]) => k);
}
function dishTagsString(d) {
  return (d.tags || []).map(t => `(${t.toUpperCase()})`).join("");
}
Object.assign(window, {
  ALLERGENS,
  ALLERGEN_SHORT,
  STANDARD_MENUS,
  SEED_EVENTS,
  instantiateMenu,
  eventStatus,
  eventPrinted,
  dishContainsList,
  dishMayList,
  dishTagsString
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "prototype/data.jsx", error: String((e && e.message) || e) }); }

// prototype/tweaks-panel.jsx
try { (() => {
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
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
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
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
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
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
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

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
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

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
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

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
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
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
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
  noDeckControls = false,
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  // Auto-inject a rail toggle when a <deck-stage> is on the page. The
  // toggle drives the deck's per-viewer _railVisible via window message;
  // state is mirrored from the same localStorage key the deck reads so
  // the control reflects reality across reloads. The mechanism is the
  // message — authors who want custom placement can post it directly
  // and pass noDeckControls to suppress this one.
  const hasDeckStage = React.useMemo(() => typeof document !== 'undefined' && !!document.querySelector('deck-stage'), []);
  // deck-stage enables its rail in connectedCallback, but this panel can
  // mount before that element has upgraded. The initial read catches the
  // common case; the listener covers mounting first. (Older deck-stage.js
  // copies still wait for the host's __omelette_rail_enabled postMessage —
  // same listener handles those.)
  const [railEnabled, setRailEnabled] = React.useState(() => hasDeckStage && !!document.querySelector('deck-stage')?._railEnabled);
  React.useEffect(() => {
    if (!hasDeckStage || railEnabled) return undefined;
    const onMsg = e => {
      if (e.data && e.data.type === '__omelette_rail_enabled') setRailEnabled(true);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [hasDeckStage, railEnabled]);
  const [railVisible, setRailVisible] = React.useState(() => {
    try {
      return localStorage.getItem('deck-stage.railVisible') !== '0';
    } catch (e) {
      return true;
    }
  });
  const toggleRail = on => {
    setRailVisible(on);
    window.postMessage({
      type: '__deck_rail_visible',
      on
    }, '*');
  };
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
  }, children, hasDeckStage && railEnabled && !noDeckControls && /*#__PURE__*/React.createElement(TweakSection, {
    label: "Deck"
  }, /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Thumbnail rail",
    value: railVisible,
    onChange: toggleRail
  })))));
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
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
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

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
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
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
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
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "prototype/tweaks-panel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/allergen-manager/Components.jsx
try { (() => {
/* global React, Icon */
// Atomic UI components — leans on kit.css for visual styling.

function Button({
  variant = "primary",
  size,
  icon,
  iconAfter,
  children,
  disabled,
  onClick,
  type = "button",
  style,
  className
}) {
  const cls = ["btn", `btn-${variant}`, size ? `btn-${size}` : "", className || ""].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    className: cls,
    onClick: onClick,
    disabled: disabled,
    style: style
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: size === "lg" ? 16 : 14,
    style: {
      marginRight: 0
    }
  }), children, iconAfter && /*#__PURE__*/React.createElement(Icon, {
    name: iconAfter,
    size: 14
  }));
}
function Field({
  label,
  hint,
  error,
  badge,
  children,
  autoFill
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, label, badge && /*#__PURE__*/React.createElement("span", {
    className: "input-auto-badge"
  }, badge)), children, error ? /*#__PURE__*/React.createElement("span", {
    className: "field-error"
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    className: "field-hint"
  }, hint) : null);
}
function Input({
  value,
  onChange,
  placeholder,
  readOnly,
  error,
  auto,
  type = "text"
}) {
  const cls = ["input", error ? "error" : "", auto ? "auto" : ""].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("input", {
    className: cls,
    type: type,
    value: value ?? "",
    onChange: onChange,
    placeholder: placeholder,
    readOnly: readOnly
  });
}
function Tag({
  kind,
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `tag tag-${kind}`
  }, children);
}
function TagToggle({
  kind,
  active,
  onClick,
  children
}) {
  const cls = ["tag-toggle", active ? `on-${kind}` : ""].join(" ");
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: cls,
    onClick: onClick
  }, children);
}
function Badge({
  kind = "neutral",
  dot,
  mono,
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `badge badge-${kind}`,
    style: mono ? {
      fontFamily: "var(--font-mono)"
    } : undefined
  }, dot && /*#__PURE__*/React.createElement("span", {
    className: "badge-dot"
  }), children);
}
function Banner({
  kind = "info",
  icon,
  children
}) {
  const defaultIcon = {
    warn: "warning",
    danger: "close",
    success: "check",
    info: "info"
  }[kind] || "info";
  return /*#__PURE__*/React.createElement("div", {
    className: `banner banner-${kind}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon || defaultIcon,
    size: 16,
    style: {
      flexShrink: 0,
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("span", null, children));
}
function Card({
  children,
  small,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `card${small ? " card-sm" : ""}`,
    style: style
  }, children);
}
function CardHeader({
  title,
  sub,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "card-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card-title"
  }, title), sub && /*#__PURE__*/React.createElement("div", {
    className: "card-sub"
  }, sub)), right && /*#__PURE__*/React.createElement("div", null, right));
}
function StatCard({
  num,
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card-num"
  }, num), /*#__PURE__*/React.createElement("div", {
    className: "stat-card-label"
  }, label));
}
function VersionStamp({
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "version-stamp"
  }, children);
}
function ProgressBar({
  value,
  max = 100,
  complete
}) {
  const pct = Math.min(100, value / max * 100);
  const isComplete = complete ?? pct >= 100;
  return /*#__PURE__*/React.createElement("div", {
    className: "progress-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: `progress-fill${isComplete ? " complete" : ""}`,
    style: {
      width: `${pct}%`
    }
  }));
}
function AllergenCell({
  name,
  state = "absent",
  onClick
}) {
  const cls = ["allergen-cell", state === "present" ? "present" : state === "may" ? "may" : ""].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: cls,
    onClick: onClick,
    style: {
      font: "inherit",
      fontFamily: "var(--font-sans)"
    }
  }, name, state === "present" ? " ✕" : "");
}
function DocRow({
  title,
  meta,
  status,
  statusLabel,
  onPreview
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "doc-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "doc-icon-box"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "document",
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: "var(--fg-2)"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--fg-4)",
      marginTop: 2,
      fontFamily: "var(--font-mono)"
    }
  }, meta)), /*#__PURE__*/React.createElement(Badge, {
    kind: status,
    dot: true
  }, statusLabel), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    onClick: onPreview
  }, "Preview"));
}
Object.assign(window, {
  Button,
  Field,
  Input,
  Tag,
  TagToggle,
  Badge,
  Banner,
  Card,
  CardHeader,
  StatCard,
  VersionStamp,
  ProgressBar,
  AllergenCell,
  DocRow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/allergen-manager/Components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/allergen-manager/Composites.jsx
try { (() => {
/* global React, Icon, Button, Badge, Card, CardHeader, StatCard, ProgressBar, Tag */
// Composite components — top nav, event card, matrix table.

function TopNav({
  active,
  onNav
}) {
  const links = [{
    id: "dashboard",
    label: "Dashboard"
  }, {
    id: "library",
    label: "Dish library"
  }, {
    id: "settings",
    label: "Settings"
  }];
  return /*#__PURE__*/React.createElement("header", {
    className: "topnav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "topnav-brand"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pin",
    size: 18
  }), "Allergen manager"), /*#__PURE__*/React.createElement("nav", {
    className: "topnav-links"
  }, links.map(l => /*#__PURE__*/React.createElement("button", {
    key: l.id,
    type: "button",
    className: `nav-link${active === l.id ? " active" : ""}`,
    onClick: () => onNav?.(l.id)
  }, l.label))));
}
function EventCard({
  event,
  onOpen,
  onPrint
}) {
  const {
    name,
    room,
    time,
    menu,
    dishesDone,
    dishesTotal,
    status,
    version
  } = event;
  const ready = status === "ready";
  return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: name,
    sub: `${room} · ${time} · Menu ${menu}`,
    right: ready ? /*#__PURE__*/React.createElement(Badge, {
      kind: "ready",
      dot: true
    }, "Ready") : status === "warn" ? /*#__PURE__*/React.createElement(Badge, {
      kind: "warn",
      dot: true
    }, "Reprint required") : /*#__PURE__*/React.createElement(Badge, {
      kind: "danger",
      dot: true
    }, "Incomplete")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--fg-3)"
    }
  }, dishesDone, " of ", dishesTotal, " dishes completed"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--fg-4)"
    }
  }, Math.round(dishesDone / dishesTotal * 100), "%")), /*#__PURE__*/React.createElement(ProgressBar, {
    value: dishesDone,
    max: dishesTotal
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    onClick: onOpen
  }, ready ? "Review" : "Fill allergens"), /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    size: "sm",
    icon: "print",
    onClick: onPrint,
    disabled: !ready && status !== "warn"
  }, "Print all 3")), version && /*#__PURE__*/React.createElement("span", {
    className: "version-stamp"
  }, version))));
}
function MatrixTable({
  dishes,
  allergens
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto",
      border: "1px solid var(--neutral-200)",
      borderRadius: "var(--radius-lg)",
      padding: 12,
      background: "var(--white)"
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "matrix"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "dish-col"
  }, "Dish"), allergens.map(a => /*#__PURE__*/React.createElement("th", {
    key: a
  }, a)), /*#__PURE__*/React.createElement("th", {
    className: "tags-col"
  }, "Tags"))), /*#__PURE__*/React.createElement("tbody", null, dishes.map(d => /*#__PURE__*/React.createElement("tr", {
    key: d.name
  }, /*#__PURE__*/React.createElement("td", {
    className: "dish-cell"
  }, d.name), allergens.map(a => {
    const v = d.allergens?.[a];
    return v === "present" ? /*#__PURE__*/React.createElement("td", {
      key: a,
      className: "x-mark"
    }, "\u2715") : v === "may" ? /*#__PURE__*/React.createElement("td", {
      key: a,
      style: {
        background: "var(--allergen-maycontain-bg)",
        color: "var(--allergen-maycontain)",
        fontSize: 9
      }
    }, "may") : /*#__PURE__*/React.createElement("td", {
      key: a
    });
  }), /*#__PURE__*/React.createElement("td", {
    className: "tags-cell"
  }, d.tags?.length ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: d.tags.includes("ncgi") ? "var(--tag-ncgi-text)" : d.tags.includes("vg") ? "var(--tag-vg-text)" : "var(--tag-v-text)"
    }
  }, d.tags.map(t => `(${t.toUpperCase()})`).join("")) : null))))));
}
Object.assign(window, {
  TopNav,
  EventCard,
  MatrixTable
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/allergen-manager/Composites.jsx", error: String((e && e.message) || e) }); }

// ui_kits/allergen-manager/Icons.jsx
try { (() => {
/* global React */
// Inline SVG icon components. Tabler-style outline, 1.8px stroke, currentColor.
// Use as <Icon name="print" size={16} /> or <IconPrint size={16} />

const ICON_PATHS = {
  dashboard: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "7",
    height: "9",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "3",
    width: "7",
    height: "5",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "12",
    width: "7",
    height: "9",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "16",
    width: "7",
    height: "5",
    rx: "1"
  })),
  edit: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 20h4l10-10-4-4L4 16v4z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 6l4 4"
  })),
  print: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M6 9V4h12v5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "9",
    width: "18",
    height: "8",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "14",
    width: "12",
    height: "7",
    rx: "1"
  })),
  search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "20",
    y1: "20",
    x2: "16.65",
    y2: "16.65"
  })),
  warning: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "9",
    x2: "12",
    y2: "13"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "17",
    x2: "12.01",
    y2: "17"
  })),
  check: /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }),
  "chevron-down": /*#__PURE__*/React.createElement("polyline", {
    points: "6 9 12 15 18 9"
  }),
  "chevron-right": /*#__PURE__*/React.createElement("polyline", {
    points: "9 6 15 12 9 18"
  }),
  "chevron-left": /*#__PURE__*/React.createElement("polyline", {
    points: "15 6 9 12 15 18"
  }),
  sort: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
    points: "6 9 12 3 18 9"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "6 15 12 21 18 15"
  })),
  plus: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "5",
    x2: "12",
    y2: "19"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  })),
  close: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  })),
  settings: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33 1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82 1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
  })),
  drag: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "6",
    r: "1.2",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "12",
    r: "1.2",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "18",
    r: "1.2",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "6",
    r: "1.2",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "12",
    r: "1.2",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "18",
    r: "1.2",
    fill: "currentColor",
    stroke: "none"
  })),
  calendar: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "5",
    width: "18",
    height: "16",
    rx: "2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "10",
    x2: "21",
    y2: "10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "3",
    x2: "8",
    y2: "7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    y1: "3",
    x2: "16",
    y2: "7"
  })),
  clock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "12 7 12 12 15 14"
  })),
  filter: /*#__PURE__*/React.createElement("polygon", {
    points: "3 4 21 4 14 13 14 20 10 18 10 13 3 4"
  }),
  document: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "14 3 14 8 19 8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "13",
    x2: "16",
    y2: "13"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "17",
    x2: "13",
    y2: "17"
  })),
  trash: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
    points: "4 7 20 7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 11v6M14 11v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
  })),
  info: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "11",
    x2: "12",
    y2: "16"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "8",
    r: "0.5",
    fill: "currentColor",
    stroke: "none"
  })),
  pin: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 2C8.5 2 6 4.5 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.5-2.5-6-6-6z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "8",
    r: "2"
  })),
  download: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 4v12"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "7 11 12 16 17 11"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "20",
    x2: "20",
    y2: "20"
  })),
  eye: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  })),
  refresh: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3 12a9 9 0 0115-6.7L21 8"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "21 3 21 8 16 8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 12a9 9 0 01-15 6.7L3 16"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "3 21 3 16 8 16"
  })),
  // ── Allergen glyphs (the 14 statutory allergens) ──────────
  celery: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 21l1-9M12 21v-9M15.5 21l-1-9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.5 12c-2-1-3-3-2-5 2 0 3.2 2 3 4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14.5 12c2-1 3-3 2-5-2 0-3.2 2-3 4"
  })),
  gluten: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 21V7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7c0-2 1.6-3.6 3-4.2M12 7c0-2-1.6-3.6-3-4.2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 12c0-2 1.6-3 3-3.6M12 12c0-2-1.6-3-3-3.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 16.5c0-2 1.6-3 3-3.6M12 16.5c0-2-1.6-3-3-3.6"
  })),
  crustaceans: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M17 6c-4.5 0-8.5 3.2-8.5 7.2 0 3 2.2 4.8 5 4.8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 6c1.8 0 2.8 1 3 2.2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.5 18l1 2M11 17.2v2.6M8.8 15l-1.3 2"
  })),
  eggs: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("ellipse", {
    cx: "12",
    cy: "13",
    rx: "6",
    ry: "7"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "14",
    r: "2.6"
  })),
  fish: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 12c2-3 6-4.5 9-4.5s5.5 1.5 6.5 4.5c-1 3-3.5 4.5-6.5 4.5s-7-1.5-9-4.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.5 12l3-3v6z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "11",
    r: "0.7",
    fill: "currentColor",
    stroke: "none"
  })),
  lupin: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 21v-9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.5 6.5a2.5 2 0 015 0M9.5 9a2.5 2 0 015 0M9.5 11.5a2.5 2 0 015 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 21c-2.2-.8-3.5-2.2-3.5-4.2"
  })),
  milk: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 9.5h7v10a1 1 0 01-1 1h-5a1 1 0 01-1-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 9.5l3.5-4 3.5 4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "5.5",
    x2: "12",
    y2: "9.5"
  })),
  molluscs: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 20L5 10a8 8 0 0114 0z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 20V10M8.8 19l-1.6-8M15.2 19l1.6-8"
  })),
  mustard: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M9 21V10.5a3 3 0 013-3 3 3 0 013 3V21z"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "10.3",
    y: "4",
    width: "3.4",
    height: "3.5",
    rx: "0.5"
  })),
  nuts: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("ellipse", {
    cx: "12",
    cy: "13",
    rx: "4.2",
    ry: "5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.2 9.5c1-2 3-3 4.8-3s3.8 1 4.8 3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "6",
    x2: "12",
    y2: "3.8"
  })),
  peanuts: /*#__PURE__*/React.createElement("path", {
    d: "M12 3c2 0 3.2 1.6 3.2 3.6 0 1 .5 1.6 1.1 2.6.8 1.4.8 3.2 0 4.6-.6 1-1.1 1.6-1.1 2.6 0 2-1.2 3.6-3.2 3.6S8.8 18.4 8.8 16.4c0-1-.5-1.6-1.1-2.6-.8-1.4-.8-3.2 0-4.6.6-1 1.1-1.6 1.1-2.6C8.8 4.6 10 3 12 3z"
  }),
  sesame: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("ellipse", {
    cx: "9",
    cy: "13",
    rx: "1.4",
    ry: "3.1",
    transform: "rotate(-22 9 13)"
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "13.2",
    cy: "10.8",
    rx: "1.4",
    ry: "3.1",
    transform: "rotate(16 13.2 10.8)"
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "14",
    cy: "16",
    rx: "1.4",
    ry: "3.1",
    transform: "rotate(-32 14 16)"
  })),
  soya: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "10",
    y: "3.5",
    width: "4",
    height: "17",
    rx: "2",
    transform: "rotate(35 12 12)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.8",
    cy: "15.2",
    r: "1.3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "1.3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15.2",
    cy: "8.8",
    r: "1.3"
  })),
  sulphites: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M8 4h8c0 4.2-2 8-4 8s-4-3.8-4-8z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "12",
    x2: "12",
    y2: "19"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9",
    y1: "19.5",
    x2: "15",
    y2: "19.5"
  }))
};
function Icon({
  name,
  size = 16,
  style
}) {
  const body = ICON_PATHS[name];
  if (!body) return null;
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: style,
    "aria-hidden": "true"
  }, body);
}
Object.assign(window, {
  Icon,
  ICON_PATHS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/allergen-manager/Icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/allergen-manager/KitDemo.jsx
try { (() => {
/* global React, ReactDOM, TopNav, Dashboard, EventEntry, PrintConfirm, ALLERGENS */
// Top-level state machine: dashboard ↔ entry ↔ print confirm.

const SEED_EVENTS = [{
  id: "e1",
  name: "Nottingham Tech Summit",
  room: "Room 4",
  time: "12:30",
  menu: "A",
  status: "incomplete",
  version: 3,
  dishes: [{
    id: "d1",
    name: "Chicken skewers",
    section: "Main",
    complete: true,
    allergens: {
      Milk: "present"
    },
    tags: ["ncgi"]
  }, {
    id: "d2",
    name: "Mexican rice",
    section: "Side",
    complete: true,
    allergens: {
      Sulphites: "present"
    },
    tags: ["vg", "ncgi"]
  }, {
    id: "d3",
    name: "Tomato & basil soup",
    section: "Starter",
    complete: true,
    allergens: {
      Celery: "present"
    },
    tags: ["v", "vg"]
  }, {
    id: "d4",
    name: "Beef wellington",
    section: "Main",
    complete: false,
    allergens: {},
    tags: []
  }, {
    id: "d5",
    name: "Caesar salad",
    section: "Starter",
    complete: false,
    allergens: {},
    tags: []
  }, {
    id: "d6",
    name: "Lemon tart",
    section: "Dessert",
    complete: false,
    allergens: {},
    tags: []
  }, {
    id: "d7",
    name: "Fresh fruit plate",
    section: "Dessert",
    complete: true,
    allergens: {},
    tags: ["v", "vg", "ncgi"]
  }, {
    id: "d8",
    name: "Sourdough rolls",
    section: "Side",
    complete: true,
    allergens: {
      Gluten: "present",
      Milk: "may"
    },
    tags: ["v"]
  }]
}, {
  id: "e2",
  name: "Midlands Insurance AGM",
  room: "Suite 1",
  time: "13:00",
  menu: "B",
  status: "ready",
  version: 2,
  dishes: [{
    id: "d1",
    name: "Smoked salmon blini",
    section: "Starter",
    complete: true,
    allergens: {
      Fish: "present",
      Milk: "present",
      Gluten: "present"
    },
    tags: []
  }, {
    id: "d2",
    name: "Roasted vegetable tart",
    section: "Main",
    complete: true,
    allergens: {
      Gluten: "present",
      Milk: "present",
      Eggs: "present"
    },
    tags: ["v"]
  }, {
    id: "d3",
    name: "Seasonal sorbet",
    section: "Dessert",
    complete: true,
    allergens: {
      Sulphites: "present"
    },
    tags: ["v", "vg", "ncgi"]
  }, {
    id: "d4",
    name: "Cheese selection",
    section: "Dessert",
    complete: true,
    allergens: {
      Milk: "present"
    },
    tags: ["v"]
  }]
}, {
  id: "e3",
  name: "East Midlands Schools Awards",
  room: "Banqueting Hall",
  time: "18:30",
  menu: "C",
  status: "warn",
  version: 7,
  dishes: [{
    id: "d1",
    name: "Pea & mint soup",
    section: "Starter",
    complete: true,
    allergens: {
      Milk: "present",
      Celery: "present"
    },
    tags: ["v"]
  }, {
    id: "d2",
    name: "Pan-fried sea bass",
    section: "Main",
    complete: true,
    allergens: {
      Fish: "present",
      Milk: "present"
    },
    tags: ["ncgi"]
  }, {
    id: "d3",
    name: "Wild mushroom risotto",
    section: "Main",
    complete: true,
    allergens: {
      Milk: "present",
      Sulphites: "may"
    },
    tags: ["v", "vg"]
  }, {
    id: "d4",
    name: "Chocolate fondant",
    section: "Dessert",
    complete: true,
    allergens: {
      Gluten: "present",
      Eggs: "present",
      Milk: "present",
      Soya: "may"
    },
    tags: ["v"]
  }, {
    id: "d5",
    name: "Petit fours",
    section: "Dessert",
    complete: true,
    allergens: {
      Gluten: "present",
      Eggs: "present",
      Milk: "present",
      Nuts: "may"
    },
    tags: []
  }]
}, {
  id: "e4",
  name: "Boots HQ training day",
  room: "Room 2",
  time: "10:00",
  menu: "A",
  status: "incomplete",
  version: 1,
  dishes: [{
    id: "d1",
    name: "Breakfast pastries",
    section: "AM",
    complete: true,
    allergens: {
      Gluten: "present",
      Eggs: "present",
      Milk: "present"
    },
    tags: ["v"]
  }, {
    id: "d2",
    name: "Fruit & yoghurt pots",
    section: "AM",
    complete: true,
    allergens: {
      Milk: "present"
    },
    tags: ["v", "ncgi"]
  }, {
    id: "d3",
    name: "Sandwich platter",
    section: "Lunch",
    complete: false,
    allergens: {},
    tags: []
  }, {
    id: "d4",
    name: "Crisps & dips",
    section: "Lunch",
    complete: false,
    allergens: {},
    tags: []
  }, {
    id: "d5",
    name: "Mini desserts",
    section: "PM",
    complete: false,
    allergens: {},
    tags: []
  }]
}];

// Derived helpers
function deriveStatus(event) {
  const allComplete = event.dishes.every(d => d.complete);
  if (!allComplete) return "incomplete";
  return event.status === "warn" ? "warn" : "ready";
}
function KitDemoApp() {
  const [events, setEvents] = React.useState(SEED_EVENTS);
  const [view, setView] = React.useState({
    name: "dashboard"
  });
  const [selectedDishId, setSelectedDishId] = React.useState(null);
  const [navTab, setNavTab] = React.useState("dashboard");
  const currentEvent = view.eventId ? events.find(e => e.id === view.eventId) : null;
  const dishesComplete = ev => ev.dishes.filter(d => d.complete).length;

  // Annotate computed counts
  const annotatedEvents = events.map(e => ({
    ...e,
    dishesDone: dishesComplete(e),
    dishesTotal: e.dishes.length,
    status: deriveStatus(e)
  }));
  const openEvent = id => {
    const ev = events.find(e => e.id === id);
    setSelectedDishId(ev.dishes.find(d => !d.complete)?.id || ev.dishes[0].id);
    setView({
      name: "entry",
      eventId: id
    });
  };
  const openPrint = id => {
    setView({
      name: "print",
      eventId: id,
      printed: false
    });
  };
  const confirmPrint = () => {
    setView(v => ({
      ...v,
      printed: true
    }));
  };
  const updateDish = (dishId, patch) => {
    setEvents(es => es.map(e => e.id !== view.eventId ? e : {
      ...e,
      dishes: e.dishes.map(d => d.id === dishId ? {
        ...d,
        ...patch
      } : d)
    }));
  };
  const saveDish = dishId => {
    setEvents(es => es.map(e => e.id !== view.eventId ? e : {
      ...e,
      dishes: e.dishes.map(d => d.id === dishId ? {
        ...d,
        complete: !d.complete
      } : d)
    }));
    // Advance to next incomplete dish if any
    const ev = events.find(e => e.id === view.eventId);
    const next = ev.dishes.find(d => !d.complete && d.id !== dishId);
    if (next) setSelectedDishId(next.id);
  };
  const eventAnnotated = currentEvent && annotatedEvents.find(e => e.id === currentEvent.id);
  return /*#__PURE__*/React.createElement("div", {
    className: "app-shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-frame"
  }, /*#__PURE__*/React.createElement(TopNav, {
    active: navTab,
    onNav: tab => {
      setNavTab(tab);
      if (tab === "dashboard") setView({
        name: "dashboard"
      });
    }
  }), view.name === "dashboard" && /*#__PURE__*/React.createElement(Dashboard, {
    events: annotatedEvents,
    onOpen: openEvent,
    onPrint: openPrint
  }), view.name === "entry" && eventAnnotated && /*#__PURE__*/React.createElement(EventEntry, {
    event: eventAnnotated,
    selectedDishId: selectedDishId,
    onSelectDish: setSelectedDishId,
    onBack: () => setView({
      name: "dashboard"
    }),
    onPrint: () => openPrint(eventAnnotated.id),
    onUpdateDish: updateDish,
    onSaveDish: saveDish
  }), view.name === "print" && eventAnnotated && /*#__PURE__*/React.createElement(PrintConfirm, {
    event: eventAnnotated,
    printed: view.printed,
    onClose: () => setView({
      name: "dashboard"
    }),
    onPrint: confirmPrint
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "16px 0 0",
      fontSize: 11,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)"
    }
  }, "Nottingham Venues \xB7 Allergen Manager \xB7 UI kit demo"));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(KitDemoApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/allergen-manager/KitDemo.jsx", error: String((e && e.message) || e) }); }

// ui_kits/allergen-manager/Screens.jsx
try { (() => {
/* global React, Icon, Button, Field, Input, Tag, TagToggle, Badge, Banner, Card, CardHeader, StatCard, VersionStamp, ProgressBar, AllergenCell, DocRow, TopNav, EventCard, MatrixTable */
// Screens: Dashboard, EventEntry, PrintConfirm.
// All state owned by App.jsx and threaded through props.

const ALLERGENS = ["Celery", "Gluten", "Crustaceans", "Eggs", "Fish", "Lupin", "Milk", "Molluscs", "Mustard", "Nuts", "Peanuts", "Sesame", "Soya", "Sulphites"];
function Dashboard({
  events,
  onOpen,
  onPrint
}) {
  const ready = events.filter(e => e.status === "ready").length;
  const incomplete = events.filter(e => e.status === "incomplete").length;
  const reprint = events.filter(e => e.status === "warn").length;
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "screen-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "screen-title"
  }, "Today's events"), /*#__PURE__*/React.createElement("div", {
    className: "screen-sub"
  }, "Wednesday 20 May \xB7 4 events scheduled")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    icon: "filter"
  }, "Filter"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "plus"
  }, "New event"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 12,
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    num: events.length,
    label: "Events"
  }), /*#__PURE__*/React.createElement(StatCard, {
    num: ready,
    label: "Ready"
  }), /*#__PURE__*/React.createElement(StatCard, {
    num: reprint,
    label: "Reprint"
  }), /*#__PURE__*/React.createElement(StatCard, {
    num: incomplete,
    label: "Incomplete"
  })), reprint > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Banner, {
    kind: "warn"
  }, "Tomato & basil soup was updated at 11:42 \u2014 celery added. 1 event affected, reprint required.")), /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "All events"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, events.map(e => /*#__PURE__*/React.createElement(EventCard, {
    key: e.id,
    event: e,
    onOpen: () => onOpen(e.id),
    onPrint: () => onPrint(e.id)
  }))));
}
function EventEntry({
  event,
  onBack,
  onPrint,
  onUpdateDish,
  onSelectDish,
  selectedDishId,
  onSaveDish
}) {
  const dish = event.dishes.find(d => d.id === selectedDishId) || event.dishes[0];
  const done = event.dishes.filter(d => d.complete).length;
  const toggleAllergen = allergen => {
    const cur = dish.allergens?.[allergen];
    const next = cur === "present" ? "may" : cur === "may" ? undefined : "present";
    onUpdateDish(dish.id, {
      allergens: {
        ...dish.allergens,
        [allergen]: next
      }
    });
  };
  const toggleTag = tag => {
    const tags = dish.tags || [];
    const next = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
    onUpdateDish(dish.id, {
      tags: next
    });
  };
  const containsList = Object.entries(dish.allergens || {}).filter(([, v]) => v === "present").map(([k]) => k);
  const mayContainList = Object.entries(dish.allergens || {}).filter(([, v]) => v === "may").map(([k]) => k);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "screen-header",
    style: {
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    type: "button",
    style: {
      background: "none",
      border: "none",
      color: "var(--fg-4)",
      fontSize: 12,
      padding: 0,
      marginBottom: 6,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontFamily: "inherit"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 12
  }), "Back to dashboard"), /*#__PURE__*/React.createElement("h1", {
    className: "screen-title"
  }, event.name), /*#__PURE__*/React.createElement("div", {
    className: "screen-sub"
  }, event.room, " \xB7 ", event.time, " \xB7 Menu ", event.menu)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(VersionStamp, null, "v", event.version, " \xB7 18 May \xB7 11:42"), /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    icon: "print",
    onClick: onPrint,
    disabled: done < event.dishes.length
  }, "Print all 3 documents"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--fg-3)"
    }
  }, done, " of ", event.dishes.length, " dishes completed"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--fg-4)"
    }
  }, Math.round(done / event.dishes.length * 100), "%")), /*#__PURE__*/React.createElement(ProgressBar, {
    value: done,
    max: event.dishes.length
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "260px 1fr",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Dishes"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      background: "var(--white)",
      border: "var(--border-default)",
      borderRadius: "var(--radius-lg)",
      padding: 6
    }
  }, event.dishes.map(d => /*#__PURE__*/React.createElement("button", {
    key: d.id,
    type: "button",
    onClick: () => onSelectDish(d.id),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 10px",
      border: "none",
      background: d.id === dish.id ? "var(--brand-forest-faint)" : "transparent",
      borderRadius: "var(--radius-md)",
      textAlign: "left",
      cursor: "pointer",
      fontFamily: "inherit",
      color: d.id === dish.id ? "var(--brand-forest)" : "var(--fg-2)",
      fontWeight: d.id === dish.id ? 500 : 400,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: d.complete ? "var(--color-success)" : "var(--neutral-300)",
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, d.name), d.tags?.includes("v") && /*#__PURE__*/React.createElement(Tag, {
    kind: "v"
  }, "V"), d.tags?.includes("vg") && /*#__PURE__*/React.createElement(Tag, {
    kind: "vg"
  }, "VG"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Dish name",
    hint: "As it appears on all 3 documents"
  }, /*#__PURE__*/React.createElement(Input, {
    value: dish.name,
    onChange: e => onUpdateDish(dish.id, {
      name: e.target.value
    })
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Menu section",
    hint: "Starter \xB7 Main \xB7 Side \xB7 Dessert"
  }, /*#__PURE__*/React.createElement(Input, {
    value: dish.section || "",
    onChange: e => onUpdateDish(dish.id, {
      section: e.target.value
    }),
    placeholder: "Main"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Contains",
    badge: "auto",
    hint: "Auto-filled from allergen ticks below"
  }, /*#__PURE__*/React.createElement(Input, {
    auto: true,
    readOnly: true,
    value: containsList.join(", ") || "—"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "May contain",
    badge: "manual",
    hint: "Cross-contamination warning"
  }, /*#__PURE__*/React.createElement(Input, {
    value: mayContainList.join(", "),
    readOnly: true,
    placeholder: "None"
  })))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    className: "section-title",
    style: {
      marginBottom: 14
    }
  }, "Allergens \xB7 click to toggle"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: 4
    }
  }, ALLERGENS.map(a => /*#__PURE__*/React.createElement(AllergenCell, {
    key: a,
    name: a,
    state: dish.allergens?.[a],
    onClick: () => toggleAllergen(a)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      paddingTop: 14,
      borderTop: "var(--border-default)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-title",
    style: {
      marginBottom: 8
    }
  }, "Dietary tags"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(TagToggle, {
    kind: "v",
    active: dish.tags?.includes("v"),
    onClick: () => toggleTag("v")
  }, "V"), /*#__PURE__*/React.createElement(TagToggle, {
    kind: "vg",
    active: dish.tags?.includes("vg"),
    onClick: () => toggleTag("vg")
  }, "VG"), /*#__PURE__*/React.createElement(TagToggle, {
    kind: "ncgi",
    active: dish.tags?.includes("ncgi"),
    onClick: () => toggleTag("ncgi")
  }, "NCGI")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: onBack
  }, "Cancel")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary"
  }, "Save draft"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => onSaveDish(dish.id)
  }, dish.complete ? "Mark in progress" : "Mark complete"))))));
}
function PrintConfirm({
  event,
  onClose,
  onPrint,
  printed
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-veil",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      color: "var(--fg-1)",
      letterSpacing: "-0.2px"
    }
  }, printed ? "Printed successfully" : "Print all 3 documents"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--fg-4)",
      marginTop: 4
    }
  }, event.name, " \xB7 ", event.room, " \xB7 ", event.time)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    type: "button",
    style: {
      background: "none",
      border: "none",
      color: "var(--fg-4)",
      cursor: "pointer",
      padding: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16
  }))), printed && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Banner, {
    kind: "success"
  }, "All 3 documents printed \xB7 v", event.version, " \xB7 18 May 11:48")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(DocRow, {
    title: "Allergen sheet",
    meta: `All ${event.dishes.length} dishes · 14 allergens · v${event.version} · 18 May 11:42`,
    status: "ready",
    statusLabel: "Ready"
  }), /*#__PURE__*/React.createElement(DocRow, {
    title: "Menu",
    meta: `Dish names + tags · v${event.version} · 18 May 11:42`,
    status: "ready",
    statusLabel: "Ready"
  }), /*#__PURE__*/React.createElement(DocRow, {
    title: "Allergen matrix",
    meta: `Compact grid · v${event.version} · 18 May 11:42`,
    status: "ready",
    statusLabel: "Ready"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: onClose
  }, printed ? "Close" : "Cancel"), !printed && /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    icon: "print",
    onClick: onPrint
  }, "Print all 3 documents"))));
}
Object.assign(window, {
  Dashboard,
  EventEntry,
  PrintConfirm,
  ALLERGENS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/allergen-manager/Screens.jsx", error: String((e && e.message) || e) }); }

// variants/Canvas.jsx
try { (() => {
/* global React, ReactDOM, DesignCanvas, DCSection, DCArtboard, EventRowCurrent, EventRowCardTile, EventRowTimeline, PrintMatrixZebra, PrintDishCards, PrintListStrip, NewEventModalStatic, NewEventInline, NewEventQuickAdd */
// Design canvas — three sets of static variants for review alongside the live prototype.

function Intro() {
  return /*#__PURE__*/React.createElement("div", {
    className: "canvas-intro"
  }, /*#__PURE__*/React.createElement("h1", null, "Allergen Manager \u2014 design variants"), /*#__PURE__*/React.createElement("p", null, "Static comparison frames alongside the live prototype. Each row explores one decision the team will need to settle before developer handoff. Drag to pan; scroll/pinch to zoom; double-click any artboard to open it full-screen."), /*#__PURE__*/React.createElement("div", {
    className: "canvas-intro-meta"
  }, "EMCC \xB7 Nottingham Venues \xB7 companion to ", /*#__PURE__*/React.createElement("strong", null, "Allergen Manager Prototype.html")), /*#__PURE__*/React.createElement("a", {
    href: "Allergen Manager Prototype.html"
  }, "\u2192 Open the live prototype"));
}
function App() {
  return /*#__PURE__*/React.createElement(DesignCanvas, {
    title: "Allergen Manager \u2014 design variants",
    subtitle: "Three open decisions for the EMCC team to choose from before dev handoff."
  }, /*#__PURE__*/React.createElement(DCSection, {
    id: "dashboard-row",
    title: "1. Event list density"
  }, /*#__PURE__*/React.createElement(DCArtboard, {
    id: "evr-a",
    label: "A \xB7 Compact strip (current)",
    width: 680,
    height: 520
  }, /*#__PURE__*/React.createElement(EventRowCurrent, null)), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "evr-b",
    label: "B \xB7 Card tiles",
    width: 680,
    height: 520
  }, /*#__PURE__*/React.createElement(EventRowCardTile, null)), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "evr-c",
    label: "C \xB7 Service-time timeline",
    width: 680,
    height: 520
  }, /*#__PURE__*/React.createElement(EventRowTimeline, null))), /*#__PURE__*/React.createElement(DCSection, {
    id: "print-doc",
    title: "2. Allergen sheet format"
  }, /*#__PURE__*/React.createElement(DCArtboard, {
    id: "pd-a",
    label: "A \xB7 Zebra matrix (current)",
    width: 820,
    height: 720
  }, /*#__PURE__*/React.createElement(PrintMatrixZebra, null)), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "pd-b",
    label: "B \xB7 Dish cards",
    width: 820,
    height: 720
  }, /*#__PURE__*/React.createElement(PrintDishCards, null)), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "pd-c",
    label: "C \xB7 Compact A5 strip",
    width: 620,
    height: 720
  }, /*#__PURE__*/React.createElement(PrintListStrip, null))), /*#__PURE__*/React.createElement(DCSection, {
    id: "new-event",
    title: "3. New event creation"
  }, /*#__PURE__*/React.createElement(DCArtboard, {
    id: "ne-a",
    label: "A \xB7 Modal (current)",
    width: 680,
    height: 680
  }, /*#__PURE__*/React.createElement(NewEventModalStatic, null)), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "ne-b",
    label: "B \xB7 Inline panel",
    width: 680,
    height: 680
  }, /*#__PURE__*/React.createElement(NewEventInline, null)), /*#__PURE__*/React.createElement(DCArtboard, {
    id: "ne-c",
    label: "C \xB7 Quick-add bar",
    width: 680,
    height: 680
  }, /*#__PURE__*/React.createElement(NewEventQuickAdd, null))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "variants/Canvas.jsx", error: String((e && e.message) || e) }); }

// variants/data.jsx
try { (() => {
/* global window */
// Shared seed data for the static variants — a single canonical event to compare against.

const VAR_EVENT = {
  name: "Nottingham Tech Summit",
  room: "Room 4",
  time: "12:30",
  rel: "in 43 min",
  guests: 84,
  menuId: "A",
  version: 3,
  edited: "11:42",
  printed: "10:30",
  done: 5,
  total: 8,
  status: "warn"
};
const VAR_DISHES = [{
  name: "Tomato & basil soup",
  section: "Starter",
  contains: ["Celery"],
  may: ["Milk"],
  tags: ["v"]
}, {
  name: "Caesar salad",
  section: "Starter",
  contains: ["Fish", "Eggs", "Milk", "Gluten"],
  may: [],
  tags: []
}, {
  name: "Chicken skewers",
  section: "Main",
  contains: ["Milk"],
  may: ["Sesame"],
  tags: ["ncgi"]
}, {
  name: "Beef wellington",
  section: "Main",
  contains: ["Gluten", "Eggs", "Milk", "Mustard"],
  may: [],
  tags: []
}, {
  name: "Mexican rice",
  section: "Side",
  contains: ["Sulphites"],
  may: [],
  tags: ["vg", "ncgi"]
}, {
  name: "Lemon tart",
  section: "Dessert",
  contains: ["Gluten", "Eggs", "Milk"],
  may: [],
  tags: ["v"]
}];
Object.assign(window, {
  VAR_EVENT,
  VAR_DISHES
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "variants/data.jsx", error: String((e && e.message) || e) }); }

// variants/event-row-variants.jsx
try { (() => {
/* global React, Icon, Badge, Button, ProgressBar, VAR_EVENT */
// Event row variants — three densities for the dashboard event list.

// A: Current — compact strip (matches the live prototype)
function EventRowCurrent() {
  const e = VAR_EVENT;
  return /*#__PURE__*/React.createElement("div", {
    className: "variant-frame",
    style: {
      padding: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "variant-section-eyebrow"
  }, "A \u2014 Compact strip \xB7 current"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, [VAR_EVENT, {
    ...VAR_EVENT,
    name: "Midlands Insurance AGM",
    room: "Suite 1",
    time: "13:00",
    rel: "in 1h 13m",
    guests: 42,
    menuId: "B",
    version: 2,
    edited: "09:10",
    status: "ready",
    done: 4,
    total: 4
  }, {
    ...VAR_EVENT,
    name: "East Midlands Schools Awards",
    room: "Banqueting Hall",
    time: "18:30",
    rel: "in 6h 43m",
    guests: 220,
    menuId: "C",
    version: 7,
    edited: "11:18",
    status: "warn",
    done: 5,
    total: 5
  }].map((ev, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "event-row",
    style: {
      padding: "10px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "event-row-time"
  }, /*#__PURE__*/React.createElement("div", {
    className: "event-row-time-clock"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 12,
    style: {
      verticalAlign: -2,
      marginRight: 4
    }
  }), ev.time), /*#__PURE__*/React.createElement("div", {
    className: "event-row-time-rel rel-soon"
  }, ev.rel)), /*#__PURE__*/React.createElement("div", {
    className: "event-row-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "event-row-title"
  }, ev.name), /*#__PURE__*/React.createElement("div", {
    className: "event-row-meta"
  }, ev.room, " \xB7 Menu ", ev.menuId, " \xB7 ", ev.guests, " guests")), /*#__PURE__*/React.createElement("div", {
    className: "event-row-progress"
  }, /*#__PURE__*/React.createElement("div", {
    className: "event-row-progress-label"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)"
    }
  }, ev.done, "/", ev.total)), /*#__PURE__*/React.createElement(ProgressBar, {
    value: ev.done,
    max: ev.total
  })), /*#__PURE__*/React.createElement("div", {
    className: "event-row-status"
  }, ev.status === "ready" && /*#__PURE__*/React.createElement(Badge, {
    kind: "ready",
    dot: true
  }, "Ready"), ev.status === "warn" && /*#__PURE__*/React.createElement(Badge, {
    kind: "warn",
    dot: true
  }, "Reprint"), ev.status === "incomplete" && /*#__PURE__*/React.createElement(Badge, {
    kind: "danger",
    dot: true
  }, "Incomplete"), /*#__PURE__*/React.createElement("div", {
    className: "event-row-version"
  }, "v", ev.version, " \xB7 ", ev.edited))))), /*#__PURE__*/React.createElement("div", {
    className: "variant-caption",
    style: {
      marginTop: 18,
      fontSize: 11,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)",
      lineHeight: 1.6
    }
  }, "Pros: fits 6+ events in a viewport. Service time + status visible at a glance.", /*#__PURE__*/React.createElement("br", null), "Cons: small text. Less suited to a tablet on the pass."));
}

// B: Visual card with mini stats
function EventRowCardTile() {
  const e = VAR_EVENT;
  return /*#__PURE__*/React.createElement("div", {
    className: "variant-frame",
    style: {
      padding: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "variant-section-eyebrow"
  }, "B \u2014 Card tile with mini stats"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, [VAR_EVENT, {
    ...VAR_EVENT,
    name: "Midlands Insurance AGM",
    room: "Suite 1",
    time: "13:00",
    rel: "in 1h 13m",
    guests: 42,
    menuId: "B",
    version: 2,
    edited: "09:10",
    status: "ready",
    done: 4,
    total: 4
  }].map((ev, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "evr-card-tile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "evr-card-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "evr-card-title"
  }, ev.name), /*#__PURE__*/React.createElement("div", {
    className: "evr-card-meta"
  }, ev.room, " \xB7 ", ev.time, " \xB7 ", ev.rel, " \xB7 Menu ", ev.menuId)), ev.status === "warn" && /*#__PURE__*/React.createElement(Badge, {
    kind: "warn",
    dot: true
  }, "Reprint"), ev.status === "ready" && /*#__PURE__*/React.createElement(Badge, {
    kind: "ready",
    dot: true
  }, "Ready")), /*#__PURE__*/React.createElement("div", {
    className: "evr-card-stats"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "evr-card-stat-num"
  }, ev.guests), /*#__PURE__*/React.createElement("div", {
    className: "evr-card-stat-label"
  }, "Guests")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "evr-card-stat-num"
  }, ev.done, "/", ev.total), /*#__PURE__*/React.createElement("div", {
    className: "evr-card-stat-label"
  }, "Dishes done")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "evr-card-stat-num"
  }, "v", ev.version), /*#__PURE__*/React.createElement("div", {
    className: "evr-card-stat-label"
  }, "Version"))), /*#__PURE__*/React.createElement(ProgressBar, {
    value: ev.done,
    max: ev.total
  }), /*#__PURE__*/React.createElement("div", {
    className: "evr-card-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    icon: "edit"
  }, "Fill"), /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    size: "sm",
    icon: "print",
    disabled: ev.status === "incomplete"
  }, ev.status === "warn" ? "Reprint" : "Print"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      fontSize: 11,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)",
      lineHeight: 1.6
    }
  }, "Pros: heavier on visual hierarchy, better at-a-glance for fewer events. Good for tablet.", /*#__PURE__*/React.createElement("br", null), "Cons: only 2 events per row at this width; scroll-heavy for a full day."));
}

// C: Vertical timeline
function EventRowTimeline() {
  const events = [{
    ...VAR_EVENT,
    time: "10:00",
    rel: "1h 47m ago",
    name: "Boots HQ training day",
    room: "Room 2",
    guests: 36,
    menuId: "A",
    version: 1,
    edited: "08:02",
    status: "incomplete",
    done: 2,
    total: 5
  }, {
    ...VAR_EVENT,
    time: "12:30",
    rel: "in 43 min",
    name: "Nottingham Tech Summit",
    room: "Room 4",
    guests: 84,
    menuId: "A",
    version: 3,
    edited: "11:42",
    status: "incomplete",
    done: 5,
    total: 8
  }, {
    ...VAR_EVENT,
    time: "13:00",
    rel: "in 1h 13m",
    name: "Midlands Insurance AGM",
    room: "Suite 1",
    guests: 42,
    menuId: "B",
    version: 2,
    edited: "09:10",
    status: "ready",
    done: 4,
    total: 4
  }, {
    ...VAR_EVENT,
    time: "18:30",
    rel: "in 6h 43m",
    name: "East Midlands Schools Awards",
    room: "Banqueting Hall",
    guests: 220,
    menuId: "C",
    version: 7,
    edited: "11:18",
    status: "warn",
    done: 5,
    total: 5
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "variant-frame",
    style: {
      padding: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "variant-section-eyebrow"
  }, "C \u2014 Service-time timeline"), /*#__PURE__*/React.createElement("div", {
    className: "evr-timeline"
  }, events.map((ev, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `evr-tl-row ${ev.status}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "evr-tl-time"
  }, ev.time), /*#__PURE__*/React.createElement("div", {
    className: "evr-tl-rel"
  }, ev.rel), /*#__PURE__*/React.createElement("div", {
    className: "evr-tl-dot"
  }), /*#__PURE__*/React.createElement("div", {
    className: "evr-tl-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "evr-tl-title"
  }, ev.name), /*#__PURE__*/React.createElement("div", {
    className: "evr-tl-meta"
  }, ev.room, " \xB7 Menu ", ev.menuId, " \xB7 ", ev.guests, " guests \xB7 v", ev.version)), /*#__PURE__*/React.createElement("div", {
    className: "evr-tl-side"
  }, ev.status === "ready" && /*#__PURE__*/React.createElement(Badge, {
    kind: "ready",
    dot: true
  }, "Ready"), ev.status === "warn" && /*#__PURE__*/React.createElement(Badge, {
    kind: "warn",
    dot: true
  }, "Reprint"), ev.status === "incomplete" && /*#__PURE__*/React.createElement(Badge, {
    kind: "danger",
    dot: true
  }, "Incomplete"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)"
    }
  }, ev.done, "/", ev.total, " dishes"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      fontSize: 11,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)",
      lineHeight: 1.6
    }
  }, "Pros: timeline metaphor makes proximity to service unmistakable. Past events naturally muted.", /*#__PURE__*/React.createElement("br", null), "Cons: no inline progress bar; less efficient for >10 events."));
}
Object.assign(window, {
  EventRowCurrent,
  EventRowCardTile,
  EventRowTimeline
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "variants/event-row-variants.jsx", error: String((e && e.message) || e) }); }

// variants/new-event-variants.jsx
try { (() => {
/* global React, Icon, Button, Badge, Banner, Field, Input, VAR_EVENT */
// New-event creation flow variants — modal vs. inline vs. quick-bar.

// A — Current modal (mock, not interactive)
function NewEventModalStatic() {
  return /*#__PURE__*/React.createElement("div", {
    className: "variant-frame",
    style: {
      background: "rgba(20,20,20,0.4)",
      padding: 36,
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 28,
      top: 28,
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      color: "var(--white)",
      textTransform: "uppercase",
      letterSpacing: ".1em"
    }
  }, "A \u2014 Modal overlay \xB7 current"), /*#__PURE__*/React.createElement("div", {
    className: "modal modal-newevent",
    style: {
      width: 540,
      position: "relative",
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-newevent-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "modal-newevent-eyebrow"
  }, "New event"), /*#__PURE__*/React.createElement("div", {
    className: "modal-newevent-title"
  }, "Create event"), /*#__PURE__*/React.createElement("div", {
    className: "modal-newevent-sub"
  }, "Today \xB7 Wednesday 20 May")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "modal-newevent-close"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-newevent-body"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Field, {
    label: "Event name",
    hint: "Visible on every printed document"
  }, /*#__PURE__*/React.createElement(Input, {
    value: "Quarterly partner briefing",
    readOnly: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "newevent-grid"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Room"
  }, /*#__PURE__*/React.createElement(Input, {
    value: "Room 4",
    readOnly: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Service time"
  }, /*#__PURE__*/React.createElement(Input, {
    value: "12:30",
    readOnly: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Guests"
  }, /*#__PURE__*/React.createElement(Input, {
    value: "84",
    readOnly: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "newevent-menu-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "newevent-menu-label"
  }, "Starting menu"), /*#__PURE__*/React.createElement("div", {
    className: "newevent-menu-cards"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "menu-card active"
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-card-title"
  }, "Menu A"), /*#__PURE__*/React.createElement("div", {
    className: "menu-card-meta"
  }, "Conference standard \xB7 8 dishes")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "menu-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-card-title"
  }, "Menu B"), /*#__PURE__*/React.createElement("div", {
    className: "menu-card-meta"
  }, "AGM / banquet \xB7 4 dishes")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "menu-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-card-title"
  }, "Menu C"), /*#__PURE__*/React.createElement("div", {
    className: "menu-card-meta"
  }, "Gala dinner \xB7 5 dishes"))))), /*#__PURE__*/React.createElement("div", {
    className: "modal-newevent-foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "newevent-foot-meta"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 12
  }), " Defaults editable later"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary"
  }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "plus"
  }, "Create event")))));
}

// B — Inline panel at top of dashboard
function NewEventInline() {
  return /*#__PURE__*/React.createElement("div", {
    className: "variant-frame",
    style: {
      padding: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "variant-section-eyebrow"
  }, "B \u2014 Inline panel \xB7 expands above event list"), /*#__PURE__*/React.createElement("div", {
    className: "newevent-inline"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: "var(--brand-forest)",
      textTransform: "uppercase",
      letterSpacing: ".08em"
    }
  }, "New event"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 600,
      color: "var(--fg-1)",
      marginTop: 4,
      letterSpacing: "-0.3px"
    }
  }, "Create event for today")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: {
      background: "none",
      border: "none",
      color: "var(--fg-4)",
      cursor: "pointer",
      padding: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Event name"
  }, /*#__PURE__*/React.createElement(Input, {
    value: "",
    placeholder: "e.g. Quarterly partner briefing",
    readOnly: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Room"
  }, /*#__PURE__*/React.createElement(Input, {
    value: "Room 4",
    readOnly: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Time"
  }, /*#__PURE__*/React.createElement(Input, {
    value: "12:30",
    readOnly: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Guests"
  }, /*#__PURE__*/React.createElement(Input, {
    value: "",
    placeholder: "84",
    readOnly: true
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "var(--fg-2)",
      marginBottom: 8
    }
  }, "Starting menu"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "menu-card active"
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-card-title"
  }, "Menu A"), /*#__PURE__*/React.createElement("div", {
    className: "menu-card-meta"
  }, "Conference \xB7 8 dishes")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "menu-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-card-title"
  }, "Menu B"), /*#__PURE__*/React.createElement("div", {
    className: "menu-card-meta"
  }, "AGM \xB7 4 dishes")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "menu-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-card-title"
  }, "Menu C"), /*#__PURE__*/React.createElement("div", {
    className: "menu-card-meta"
  }, "Gala \xB7 5 dishes")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      paddingTop: 8,
      borderTop: "var(--border-default)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost"
  }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "plus"
  }, "Create event"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      fontSize: 11,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)",
      lineHeight: 1.6
    }
  }, "Pros: stays in context with the event list. Less modal fatigue.", /*#__PURE__*/React.createElement("br", null), "Cons: pushes the day's events down on first use. Form fields visible at all times."));
}

// C — Quick-add command bar
function NewEventQuickAdd() {
  return /*#__PURE__*/React.createElement("div", {
    className: "variant-frame",
    style: {
      padding: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "variant-section-eyebrow"
  }, "C \u2014 Quick-add command bar"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "newevent-quickbar"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 14,
    style: {
      color: "var(--brand-forest)"
    }
  }), /*#__PURE__*/React.createElement("input", {
    className: "qb-input",
    type: "text",
    placeholder: "Quarterly partner briefing, 12:30, Room 4, 84 guests, Menu A"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm"
  }, "Add")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      flexWrap: "wrap",
      paddingLeft: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)",
      textTransform: "uppercase",
      letterSpacing: ".06em",
      marginRight: 4
    }
  }, "Parsed"), /*#__PURE__*/React.createElement("span", {
    className: "qb-chip set"
  }, "Quarterly partner briefing"), /*#__PURE__*/React.createElement("span", {
    className: "qb-chip set"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 10
  }), " 12:30"), /*#__PURE__*/React.createElement("span", {
    className: "qb-chip set"
  }, "Room 4"), /*#__PURE__*/React.createElement("span", {
    className: "qb-chip set"
  }, "84 guests"), /*#__PURE__*/React.createElement("span", {
    className: "qb-chip set"
  }, "Menu A")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--white)",
      border: "var(--border-default)",
      borderRadius: "var(--radius-lg)",
      padding: 16,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)",
      textTransform: "uppercase",
      letterSpacing: ".06em",
      marginBottom: 12
    }
  }, "Format examples"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      fontSize: 12,
      color: "var(--fg-2)",
      fontFamily: "var(--font-mono)"
    }
  }, /*#__PURE__*/React.createElement("div", null, "Strategy offsite, 14:00, Suite 1, 24, Menu B"), /*#__PURE__*/React.createElement("div", null, "Board dinner, 19:00, Banqueting, 120 guests, gala"), /*#__PURE__*/React.createElement("div", null, "Recruitment day, 09:30, Room 2, 16, conference")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--fg-4)",
      marginTop: 12,
      lineHeight: 1.5
    }
  }, "Press ", /*#__PURE__*/React.createElement("strong", {
    style: {
      fontFamily: "var(--font-mono)"
    }
  }, "\u21B5"), " to add. Missing values default to last-used. The full form opens if anything is ambiguous."))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      fontSize: 11,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)",
      lineHeight: 1.6
    }
  }, "Pros: fastest for power users. Single keyboard flow. Defaults handle the dull cases.", /*#__PURE__*/React.createElement("br", null), "Cons: opaque to new staff. Requires a parsing rules doc. Better as a secondary action behind a button."));
}
Object.assign(window, {
  NewEventModalStatic,
  NewEventInline,
  NewEventQuickAdd
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "variants/new-event-variants.jsx", error: String((e && e.message) || e) }); }

// variants/print-doc-variants.jsx
try { (() => {
/* global React, Icon, Badge, VersionStamp, VAR_EVENT, VAR_DISHES */
// Allergen sheet variants — three printed-document directions.

const ALLERGENS_SHORT = ["Cel", "Glu", "Cru", "Egg", "Fis", "Lup", "Mil", "Mol", "Mus", "Nut", "Pea", "Ses", "Soy", "Sul"];
const ALLERGENS_FULL = ["Celery", "Gluten", "Crustaceans", "Eggs", "Fish", "Lupin", "Milk", "Molluscs", "Mustard", "Nuts", "Peanuts", "Sesame", "Soya", "Sulphites"];
function PaperHead({
  title
}) {
  const e = VAR_EVENT;
  return /*#__PURE__*/React.createElement("div", {
    className: "paper-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "paper-title"
  }, title, " \xB7 ", e.name), /*#__PURE__*/React.createElement("div", {
    className: "paper-sub"
  }, e.room, " \xB7 ", e.time, " \xB7 ", e.guests, " guests \xB7 Menu ", e.menuId)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement(VersionStamp, null, "v", e.version, " \xB7 18 May \xB7 ", e.edited), /*#__PURE__*/React.createElement("div", {
    className: "paper-sub",
    style: {
      marginTop: 6
    }
  }, "Nottingham Venues \xB7 EMCC")));
}

// A — Current: zebra matrix
function PrintMatrixZebra() {
  return /*#__PURE__*/React.createElement("div", {
    className: "variant-frame",
    style: {
      padding: 28,
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "variant-section-eyebrow"
  }, "A \u2014 Matrix with zebra rows \xB7 current"), /*#__PURE__*/React.createElement("div", {
    className: "paper paper-a4",
    style: {
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement(PaperHead, {
    title: "Allergen sheet"
  }), /*#__PURE__*/React.createElement("table", {
    className: "matrix matrix-zebra"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "dish-col"
  }, "Dish"), ALLERGENS_SHORT.map((a, i) => /*#__PURE__*/React.createElement("th", {
    key: i
  }, a)), /*#__PURE__*/React.createElement("th", {
    className: "tags-col"
  }, "Tags"))), /*#__PURE__*/React.createElement("tbody", null, VAR_DISHES.map(d => /*#__PURE__*/React.createElement("tr", {
    key: d.name
  }, /*#__PURE__*/React.createElement("td", {
    className: "dish-cell"
  }, d.name), ALLERGENS_FULL.map(a => d.contains.includes(a) ? /*#__PURE__*/React.createElement("td", {
    key: a,
    className: "x-mark"
  }, "\u2715") : d.may.includes(a) ? /*#__PURE__*/React.createElement("td", {
    key: a,
    style: {
      background: "var(--allergen-maycontain-bg)",
      color: "var(--allergen-maycontain)",
      fontSize: 9,
      fontWeight: 600
    }
  }, "may") : /*#__PURE__*/React.createElement("td", {
    key: a
  })), /*#__PURE__*/React.createElement("td", {
    className: "tags-cell"
  }, d.tags.map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      color: t === "ncgi" ? "var(--tag-ncgi-text)" : t === "vg" ? "var(--tag-vg-text)" : "var(--tag-v-text)",
      fontWeight: 600,
      marginRight: 4
    }
  }, t.toUpperCase()))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      fontSize: 11,
      color: "var(--fg-4)",
      marginTop: 18,
      paddingTop: 14,
      borderTop: "1px solid var(--neutral-200)"
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-danger)",
      fontWeight: 700
    }
  }, "\u2715"), " Allergen present"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-warning)",
      fontWeight: 700
    }
  }, "may"), " Cross-contamination possible"), /*#__PURE__*/React.createElement("span", null, "Empty \u2014 Absent"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      fontSize: 11,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)",
      lineHeight: 1.6,
      maxWidth: 720
    }
  }, "Pros: regulator-friendly matrix format. Familiar from paper sheets.", /*#__PURE__*/React.createElement("br", null), "Cons: scanning by allergen column on a folded sheet is hard; rotated headers can blur on cheap printers."));
}

// B — Card-per-dish (kitchen-pass style)
function PrintDishCards() {
  return /*#__PURE__*/React.createElement("div", {
    className: "variant-frame",
    style: {
      padding: 28,
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "variant-section-eyebrow"
  }, "B \u2014 Dish-card layout for the kitchen pass"), /*#__PURE__*/React.createElement("div", {
    className: "paper paper-a4",
    style: {
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement(PaperHead, {
    title: "Allergen sheet"
  }), /*#__PURE__*/React.createElement("div", {
    className: "printdoc-cards"
  }, VAR_DISHES.map(d => /*#__PURE__*/React.createElement("div", {
    className: "printdoc-card",
    key: d.name
  }, /*#__PURE__*/React.createElement("div", {
    className: "printdoc-card-name"
  }, d.name, /*#__PURE__*/React.createElement("span", {
    className: "printdoc-card-tags"
  }, d.tags.map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      color: t === "ncgi" ? "var(--tag-ncgi-text)" : t === "vg" ? "var(--tag-vg-text)" : "var(--tag-v-text)",
      marginLeft: 4
    }
  }, t.toUpperCase())))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)",
      textTransform: "uppercase",
      letterSpacing: ".06em",
      marginTop: 2
    }
  }, d.section), /*#__PURE__*/React.createElement("div", {
    className: "printdoc-card-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Contains"), d.contains.length ? /*#__PURE__*/React.createElement("div", {
    className: "printdoc-allergens"
  }, d.contains.map(a => /*#__PURE__*/React.createElement("span", {
    key: a,
    className: "printdoc-allergen-chip"
  }, a))) : /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--fg-4)",
      fontStyle: "italic"
    }
  }, "None of 14")), d.may.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "printdoc-card-row may"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "May contain"), /*#__PURE__*/React.createElement("div", {
    className: "printdoc-allergens"
  }, d.may.map(a => /*#__PURE__*/React.createElement("span", {
    key: a,
    className: "printdoc-allergen-chip may"
  }, a)))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      fontSize: 11,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)",
      lineHeight: 1.6,
      maxWidth: 720
    }
  }, "Pros: scannable per-dish on the pass. Allergen chips visible without head-tilting.", /*#__PURE__*/React.createElement("br", null), "Cons: not a regulator-standard format; 6 dishes already needs 2 pages."));
}

// C — Compact list strip for A5
function PrintListStrip() {
  return /*#__PURE__*/React.createElement("div", {
    className: "variant-frame",
    style: {
      padding: 28,
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "variant-section-eyebrow"
  }, "C \u2014 Compact list strip \xB7 A5 single-page"), /*#__PURE__*/React.createElement("div", {
    className: "paper paper-a5",
    style: {
      maxWidth: 520
    }
  }, /*#__PURE__*/React.createElement(PaperHead, {
    title: "Allergen sheet"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--neutral-200)",
      borderBottom: "1px solid var(--neutral-200)"
    }
  }, VAR_DISHES.map(d => /*#__PURE__*/React.createElement("div", {
    className: "printdoc-strip-row",
    key: d.name
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "printdoc-strip-name"
  }, d.name), /*#__PURE__*/React.createElement("div", {
    className: "printdoc-strip-section"
  }, d.section)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "printdoc-strip-allergens"
  }, d.contains.join(", ") || "—")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "printdoc-strip-may"
  }, d.may.length ? d.may.join(", ") : /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--fg-5)"
    }
  }, "\u2014"))), /*#__PURE__*/React.createElement("div", {
    className: "printdoc-strip-tags"
  }, d.tags.map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      color: t === "ncgi" ? "var(--tag-ncgi-text)" : t === "vg" ? "var(--tag-vg-text)" : "var(--tag-v-text)",
      marginLeft: 3
    }
  }, t.toUpperCase())))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr 1fr auto",
      gap: 14,
      padding: "6px 12px 0",
      fontSize: 9,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)",
      textTransform: "uppercase",
      letterSpacing: ".08em"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Dish"), /*#__PURE__*/React.createElement("span", null, "Contains"), /*#__PURE__*/React.createElement("span", null, "May contain"), /*#__PURE__*/React.createElement("span", null, "Tags"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      fontSize: 11,
      color: "var(--fg-4)",
      fontFamily: "var(--font-mono)",
      lineHeight: 1.6,
      maxWidth: 520
    }
  }, "Pros: fits an entire menu on a single A5 sheet. Cheaper to print; folds into a pocket.", /*#__PURE__*/React.createElement("br", null), "Cons: less defensible if asked for the strict matrix format."));
}
Object.assign(window, {
  PrintMatrixZebra,
  PrintDishCards,
  PrintListStrip
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "variants/print-doc-variants.jsx", error: String((e && e.message) || e) }); }

})();
