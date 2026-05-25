// Shared Nav — identical copy lives in each city repo (no shared package layer).
// Renders:
//   - Top bar: wordmark + mobile hamburger
//   - Sub bar (desktop): 5 items (Rent Map, Check, Share, For Business, Français)
//   - Mobile drawer: stacked nav links
//
// Props:
//   citySuffix?   string  e.g. "Ottawa", "Toronto", "Vancouver" (omit on hub)
//   onWordmark?   fn      handler for clicking the wordmark; defaults to /
//   actions       object  { onCheckRent, onShareRent, onForBusiness, onRentMap, onToggleLang, langLabel }
//   labels        object  { checkRent, shareRent, forBusiness, rentMap, langLabel, menu, close }

import { useEffect, useState } from "react";

const CSS = `
  .frc-nav{background:#1c2b36;border-bottom:3px solid #1a5c34;}
  .frc-nav-inner{max-width:1100px;margin:0 auto;padding:0 16px;height:52px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
  .frc-wordmark{font-size:14px;font-weight:600;color:#fff;text-decoration:none;white-space:nowrap;letter-spacing:0.01em;}
  .frc-wordmark span{font-weight:400;color:#aab8c2;margin-left:2px;}

  .frc-subnav{background:#2f4553;border-bottom:1px solid #3d5a6e;}
  .frc-subnav-inner{max-width:1100px;margin:0 auto;padding:0 16px;height:42px;display:flex;align-items:center;gap:24px;}
  .frc-subnav-item{background:none;border:none;color:#dde6ec;font-size:13px;font-weight:500;cursor:pointer;padding:0;font-family:inherit;letter-spacing:0.01em;}
  .frc-subnav-item:hover{color:#fff;}
  .frc-subnav-item.frc-share{margin-left:auto;background:#1a5c34;color:#fff;padding:6px 14px;border-radius:3px;font-weight:600;}
  .frc-subnav-item.frc-share:hover{background:#15492a;}
  .frc-subnav-item.frc-lang{font-size:12px;color:#aab8c2;border:1px solid rgba(255,255,255,0.18);padding:5px 12px;border-radius:3px;}
  .frc-subnav-item.frc-lang:hover{color:#fff;border-color:rgba(255,255,255,0.35);}

  .frc-hamburger{display:none;background:none;border:none;color:#fff;font-size:22px;cursor:pointer;padding:6px 8px;line-height:1;}
  .frc-hamburger svg{display:block;}

  @media(max-width:760px){
    .frc-nav-inner{height:52px;}
    .frc-subnav{display:none;}
    .frc-hamburger{display:block;}
  }

  /* Mobile drawer */
  .frc-drawer-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:60;opacity:0;pointer-events:none;transition:opacity .15s ease;}
  .frc-drawer-backdrop.open{opacity:1;pointer-events:auto;}
  .frc-drawer{position:fixed;top:0;right:0;bottom:0;width:min(320px,82vw);background:#1c2b36;color:#fff;z-index:61;transform:translateX(100%);transition:transform .2s ease;display:flex;flex-direction:column;}
  .frc-drawer.open{transform:translateX(0);}
  .frc-drawer-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.12);height:52px;}
  .frc-drawer-head-title{font-size:13px;font-weight:600;color:#fff;}
  .frc-drawer-head-title span{color:#aab8c2;font-weight:400;}
  .frc-drawer-close{background:none;border:none;color:#aab8c2;font-size:22px;cursor:pointer;line-height:1;padding:4px 8px;}
  .frc-drawer-close:hover{color:#fff;}
  .frc-drawer-body{padding:10px 0;flex-grow:1;overflow-y:auto;}
  .frc-drawer-link{display:block;padding:14px 22px;background:none;border:none;color:#fff;font-size:15px;font-weight:500;text-align:left;width:100%;cursor:pointer;font-family:inherit;border-bottom:1px solid rgba(255,255,255,0.06);}
  .frc-drawer-link:hover{background:rgba(255,255,255,0.05);}
  .frc-drawer-link.primary{background:#1a5c34;border-bottom:none;}
  .frc-drawer-link.primary:hover{background:#15492a;}
  .frc-drawer-foot{padding:14px 22px;border-top:1px solid rgba(255,255,255,0.12);font-size:11px;color:#7a8d99;line-height:1.6;}
`;

export default function Nav({ citySuffix, onWordmark, actions = {}, labels = {} }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const L = {
    checkRent: "Check Your Rent",
    shareRent: "Share Your Rent",
    forBusiness: "For Business",
    rentMap: "Rent Map",
    langLabel: "Français",
    menu: "Menu",
    close: "Close",
    ...labels,
  };

  const fire = (fn) => () => {
    setOpen(false);
    try { window.frc?.track?.("nav_click", { item: fn?.name || "unknown" }); } catch {}
    if (typeof fn === "function") fn();
  };

  const wordmarkClick = (e) => {
    e.preventDefault();
    if (typeof onWordmark === "function") onWordmark();
    else window.location.href = "/";
  };

  return (
    <>
      <style>{CSS}</style>
      <nav className="frc-nav" aria-label="Primary">
        <div className="frc-nav-inner">
          <a href="/" onClick={wordmarkClick} className="frc-wordmark">
            FairRent{citySuffix ? <span>/ {citySuffix}</span> : null}
          </a>
          <button className="frc-hamburger" onClick={() => setOpen(true)} aria-label={L.menu} aria-expanded={open}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="19" y2="6"/>
              <line x1="3" y1="11" x2="19" y2="11"/>
              <line x1="3" y1="16" x2="19" y2="16"/>
            </svg>
          </button>
        </div>
      </nav>
      <div className="frc-subnav">
        <div className="frc-subnav-inner">
          <button className="frc-subnav-item" onClick={fire(actions.onRentMap)}>{L.rentMap}</button>
          <button className="frc-subnav-item" onClick={fire(actions.onCheckRent)}>{L.checkRent}</button>
          <button className="frc-subnav-item" onClick={fire(actions.onForBusiness)}>{L.forBusiness}</button>
          <button className="frc-subnav-item frc-lang" onClick={fire(actions.onToggleLang)}>{L.langLabel}</button>
          <button className="frc-subnav-item frc-share" onClick={fire(actions.onShareRent)}>{L.shareRent}</button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={"frc-drawer-backdrop" + (open ? " open" : "")} onClick={() => setOpen(false)} aria-hidden="true"/>
      <aside className={"frc-drawer" + (open ? " open" : "")} role="dialog" aria-modal="true" aria-label={L.menu}>
        <div className="frc-drawer-head">
          <span className="frc-drawer-head-title">FairRent{citySuffix ? <span> / {citySuffix}</span> : null}</span>
          <button className="frc-drawer-close" onClick={() => setOpen(false)} aria-label={L.close}>&times;</button>
        </div>
        <div className="frc-drawer-body">
          <button className="frc-drawer-link primary" onClick={fire(actions.onShareRent)}>{L.shareRent}</button>
          <button className="frc-drawer-link" onClick={fire(actions.onCheckRent)}>{L.checkRent}</button>
          <button className="frc-drawer-link" onClick={fire(actions.onRentMap)}>{L.rentMap}</button>
          <button className="frc-drawer-link" onClick={fire(actions.onForBusiness)}>{L.forBusiness}</button>
          <button className="frc-drawer-link" onClick={fire(actions.onToggleLang)}>{L.langLabel}</button>
        </div>
        <div className="frc-drawer-foot">
          Anonymous renter submissions. Public market data. Informational only.
        </div>
      </aside>
    </>
  );
}
