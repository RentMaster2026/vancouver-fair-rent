// Shared Nav — copy lives in each city repo (no shared package layer).
// Glassdoor-inspired renter-first nav. Light header, soft green accents, no B2B.
//
// Props:
//   citySuffix?   string  e.g. "Ottawa" — appended to wordmark on city sites
//   homeHref?     string  where the wordmark points (hub: "/", cities: "https://fairrent.ca")
//   onWordmark?   fn      optional handler instead of plain navigation
//   actions       object  { onExploreCities, onNeighbourhoods, onBlog, onAbout, onSubmitRent, onToggleLang }
//   labels        object  optional override of the default English labels
//   activeKey?    string  one of "cities"|"neighbourhoods"|"blog"|"about" — highlights current nav item
//
// The persistent green "Share my rent" CTA on the right of the header uses
// onSubmitRent; there is no separate "Share my rent" nav item.

import { useEffect, useState } from "react";

const CSS = `
  .frc-nav{background:#fff;border-bottom:1px solid #e5e7eb;box-shadow:0 1px 0 rgba(0,0,0,0.02);}
  .frc-nav-inner{max-width:1180px;margin:0 auto;padding:0 20px;height:60px;display:flex;align-items:center;justify-content:space-between;gap:24px;}
  .frc-wordmark-wrap{display:flex;align-items:baseline;gap:8px;min-width:0;}
  .frc-wordmark{font-size:18px;font-weight:700;color:#0e7c3a;text-decoration:none;white-space:nowrap;letter-spacing:-0.01em;}
  .frc-wordmark:hover{text-decoration:underline;}
  .frc-city{font-size:14px;font-weight:500;color:#5b6770;margin-left:6px;text-decoration:none;white-space:nowrap;}
  .frc-city:hover{text-decoration:underline;color:#0e7c3a;}

  .frc-primary{display:flex;align-items:center;gap:4px;}
  .frc-primary-item{background:none;border:none;color:#1d2a35;font-size:14px;font-weight:500;cursor:pointer;padding:8px 14px;border-radius:6px;font-family:inherit;letter-spacing:0;line-height:1;text-decoration:none;display:inline-flex;align-items:center;}
  .frc-primary-item:hover{background:#f4f6f8;color:#0e7c3a;}
  .frc-primary-item.is-active{color:#0e7c3a;}
  .frc-primary-item.is-active::after{content:"";display:block;height:2px;background:#0e7c3a;margin-top:4px;}

  .frc-right{display:flex;align-items:center;gap:10px;}
  .frc-lang{background:none;border:1px solid #d6dade;color:#5b6770;font-size:12px;font-weight:600;cursor:pointer;padding:6px 12px;border-radius:6px;font-family:inherit;letter-spacing:0.02em;}
  .frc-lang:hover{border-color:#0e7c3a;color:#0e7c3a;}
  .frc-cta{background:#0e7c3a;color:#fff;border:none;padding:9px 16px;border-radius:6px;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit;text-decoration:none;display:inline-flex;align-items:center;line-height:1;}
  .frc-cta:hover{background:#0a6630;}

  .frc-hamburger{display:none;background:none;border:none;color:#1d2a35;cursor:pointer;padding:8px;line-height:1;border-radius:6px;}
  .frc-hamburger:hover{background:#f4f6f8;}
  .frc-hamburger svg{display:block;}

  @media(max-width:880px){
    .frc-primary{display:none;}
    .frc-right .frc-lang{display:none;}
    .frc-hamburger{display:block;}
  }
  @media(max-width:520px){
    .frc-nav-inner{padding:0 14px;height:56px;}
    .frc-right .frc-cta{padding:8px 12px;font-size:13px;}
  }

  /* Mobile drawer */
  .frc-drawer-backdrop{position:fixed;inset:0;background:rgba(15,22,28,0.45);z-index:60;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .15s ease,visibility 0s linear .15s;}
  .frc-drawer-backdrop.open{opacity:1;visibility:visible;pointer-events:auto;transition:opacity .15s ease,visibility 0s linear 0s;}
  .frc-drawer{position:fixed;top:0;right:0;bottom:0;width:min(340px,86vw);background:#fff;color:#1d2a35;z-index:61;transform:translateX(100%);transition:transform .22s ease;display:flex;flex-direction:column;}
  .frc-drawer.open{transform:translateX(0);}
  .frc-drawer-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #eef0f2;height:60px;}
  .frc-drawer-head-title{font-size:16px;font-weight:700;color:#0e7c3a;}
  .frc-drawer-head-title .frc-city{font-size:13px;font-weight:500;color:#5b6770;margin-left:6px;}
  .frc-drawer-close{background:none;border:none;color:#5b6770;font-size:26px;cursor:pointer;line-height:1;padding:4px 10px;border-radius:6px;}
  .frc-drawer-close:hover{background:#f4f6f8;color:#1d2a35;}
  .frc-drawer-body{padding:8px 0;flex-grow:1;overflow-y:auto;}
  .frc-drawer-link{display:block;padding:16px 22px;background:none;border:none;color:#1d2a35;font-size:16px;font-weight:500;text-align:left;width:100%;cursor:pointer;font-family:inherit;border:none;}
  .frc-drawer-link:hover,.frc-drawer-link:focus{background:#f4f6f8;color:#0e7c3a;}
  .frc-drawer-cta{margin:14px 18px 6px;display:block;background:#0e7c3a;color:#fff;text-align:center;padding:14px;border:none;border-radius:8px;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit;text-decoration:none;}
  .frc-drawer-cta:hover{background:#0a6630;}
  .frc-drawer-divider{height:1px;background:#eef0f2;margin:8px 0;}
  .frc-drawer-lang{margin:6px 18px;background:none;border:1px solid #d6dade;color:#5b6770;font-size:13px;font-weight:600;cursor:pointer;padding:10px;border-radius:6px;font-family:inherit;width:calc(100% - 36px);}
  .frc-drawer-foot{padding:14px 22px;border-top:1px solid #eef0f2;font-size:11px;color:#7a8d99;line-height:1.6;}
`;

export default function Nav({ citySuffix, homeHref, onWordmark, actions = {}, labels = {}, activeKey }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
      };
    }
    // Defensive: ensure body scroll is restored whenever open is false.
    // Belt-and-braces in case the cleanup above didn't run (e.g. the parent
    // unmounted Nav during a navigation while the drawer was open, leaving
    // body.style.overflow stuck at "hidden" — which is what was causing
    // the "page stays grey after closing the menu" report on iOS Safari).
    document.body.style.overflow = "";
  }, [open]);

  // Final safety net: if Nav unmounts entirely (e.g. user navigates to a
  // different page that renders a different shell), restore scroll.
  useEffect(() => {
    return () => { document.body.style.overflow = ""; };
  }, []);

  const L = {
    cities: "Cities",
    neighbourhoods: "Neighbourhoods",
    blog: "Blog",
    about: "About",
    langLabel: "Français",
    menu: "Menu",
    close: "Close",
    primaryCta: "Share my rent",
    submit: "Share my rent", // used by mobile drawer primary CTA
    ...labels,
  };

  const home = homeHref || "/";

  const fire = (fn, name) => () => {
    setOpen(false);
    try { window.frc?.track?.("nav_click", { item: name }); } catch {}
    if (typeof fn === "function") fn();
  };

  const wordmarkClick = (e) => {
    if (typeof onWordmark === "function") {
      e.preventDefault();
      onWordmark();
    }
  };

  const navItems = [
    { key: "cities",         label: L.cities,         fn: actions.onExploreCities },
    { key: "neighbourhoods", label: L.neighbourhoods, fn: actions.onNeighbourhoods },
    { key: "blog",           label: L.blog,           fn: actions.onBlog },
    { key: "about",          label: L.about,          fn: actions.onAbout },
  ];

  return (
    <>
      <style>{CSS}</style>
      <nav className="frc-nav" aria-label="Primary">
        <div className="frc-nav-inner">
          <div className="frc-wordmark-wrap">
            <a href={home} onClick={wordmarkClick} className="frc-wordmark">FairRent</a>
            {citySuffix ? <a href="/" className="frc-city">/ {citySuffix}</a> : null}
          </div>

          <div className="frc-primary" role="menubar">
            {navItems.map(item => (
              <button
                key={item.key}
                role="menuitem"
                className={"frc-primary-item" + (activeKey === item.key ? " is-active" : "")}
                onClick={fire(item.fn, item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="frc-right">
            <button className="frc-lang" onClick={fire(actions.onToggleLang, "lang")}>{L.langLabel}</button>
            <button className="frc-cta" onClick={fire(actions.onSubmitRent, "header_cta")}>{L.primaryCta}</button>
            <button className="frc-hamburger" onClick={() => setOpen(true)} aria-label={L.menu} aria-expanded={open}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7"/>
                <line x1="4" y1="12" x2="20" y2="12"/>
                <line x1="4" y1="17" x2="20" y2="17"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={"frc-drawer-backdrop" + (open ? " open" : "")} onClick={() => setOpen(false)} aria-hidden="true"/>
      <aside className={"frc-drawer" + (open ? " open" : "")} role="dialog" aria-modal="true" aria-label={L.menu}>
        <div className="frc-drawer-head">
          <span className="frc-drawer-head-title">FairRent{citySuffix ? <span className="frc-city">/ {citySuffix}</span> : null}</span>
          <button className="frc-drawer-close" onClick={() => setOpen(false)} aria-label={L.close}>&times;</button>
        </div>
        <div className="frc-drawer-body">
          <button className="frc-drawer-cta" onClick={fire(actions.onSubmitRent, "drawer_submit")}>{L.submit}</button>
          <div className="frc-drawer-divider"/>
          {navItems.map(item => (
            <button key={item.key} className="frc-drawer-link" onClick={fire(item.fn, "drawer_" + item.key)}>
              {item.label}
            </button>
          ))}
          <div className="frc-drawer-divider"/>
          <button className="frc-drawer-lang" onClick={fire(actions.onToggleLang, "drawer_lang")}>{L.langLabel}</button>
        </div>
        <div className="frc-drawer-foot">
          Anonymous renter submissions. Privacy-first. Built by renters, for renters.
        </div>
      </aside>
    </>
  );
}
