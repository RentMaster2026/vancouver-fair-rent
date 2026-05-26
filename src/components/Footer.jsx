// Shared Footer — copy lives in each city repo (no shared package layer).
// Glassdoor-inspired renter-first footer. 3 columns: FairRent / Explore / Contribute.
// No B2B links. Mobile collapses to a clean mini bar.

const CSS = `
  .frc-footer{background:#fff;border-top:1px solid #e5e7eb;margin-top:64px;}
  .frc-footer-inner{max-width:1180px;margin:0 auto;padding:36px 20px 24px;display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:36px;align-items:start;}
  .frc-footer-brand-col{display:flex;flex-direction:column;gap:10px;}
  .frc-footer-brand{font-size:18px;font-weight:700;color:#0e7c3a;text-decoration:none;display:inline-block;}
  .frc-footer-brand:hover{color:#0a6630;}
  .frc-footer-tag{font-size:13px;color:#5b6770;line-height:1.6;max-width:340px;}
  .frc-footer-priv{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:#5b6770;background:#f4f6f8;padding:4px 10px;border-radius:999px;width:fit-content;margin-top:4px;}
  .frc-footer-priv::before{content:"";width:6px;height:6px;border-radius:50%;background:#0e7c3a;display:inline-block;}

  .frc-footer-col{display:flex;flex-direction:column;gap:8px;}
  .frc-footer-h{font-size:12px;font-weight:700;color:#1d2a35;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;}
  .frc-footer-link{font-size:13px;color:#5b6770;text-decoration:none;background:none;border:none;padding:0;cursor:pointer;text-align:left;font-family:inherit;line-height:1.5;}
  .frc-footer-link:hover{color:#0e7c3a;}

  .frc-footer-bottom{max-width:1180px;margin:0 auto;padding:14px 20px 18px;border-top:1px solid #eef0f2;font-size:12px;color:#7a8d99;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;}
  .frc-footer-bottom a,.frc-footer-bottom button{color:#7a8d99;text-decoration:none;background:none;border:none;cursor:pointer;font-family:inherit;font-size:12px;}
  .frc-footer-bottom a:hover,.frc-footer-bottom button:hover{color:#0e7c3a;}

  /* Compact mini footer — city subdomains and mobile fallback */
  .frc-footer-mini{padding:18px 16px;text-align:center;font-size:12px;color:#7a8d99;line-height:1.7;background:#fff;border-top:1px solid #eef0f2;}
  .frc-footer-mini-row{display:inline-flex;flex-wrap:wrap;justify-content:center;gap:4px 12px;margin-top:6px;}
  .frc-footer-mini-row a,.frc-footer-mini-row button{color:#7a8d99;text-decoration:none;background:none;border:none;cursor:pointer;font-family:inherit;font-size:12px;padding:0;}
  .frc-footer-mini-row a:hover,.frc-footer-mini-row button:hover{color:#0e7c3a;}

  @media(max-width:880px){
    .frc-footer-inner{grid-template-columns:1fr 1fr;gap:24px;padding:28px 18px 20px;}
    .frc-footer-brand-col{grid-column:1 / -1;}
  }
  @media(max-width:560px){
    .frc-footer-full{display:none;}
    .frc-footer-mini-on-mobile{display:block;}
    .frc-footer{margin-top:32px;}
  }
  @media(min-width:561px){
    .frc-footer-mini-on-mobile{display:none;}
  }
`;

export default function Footer({ actions = {}, citySuffix, compact = false }) {
  const year = new Date().getFullYear();
  const click = (fn, fallbackHref) => (e) => {
    if (typeof fn === "function") {
      e.preventDefault();
      try { window.frc?.track?.("footer_click", { href: fallbackHref }); } catch {}
      fn();
    }
  };

  const mini = (
    <div className={"frc-footer-mini" + (compact ? "" : " frc-footer-mini-on-mobile")}>
      <span>© {year} FairRent Canada{citySuffix ? ` · ${citySuffix}` : ""}. Anonymous renter submissions.</span>
      <div className="frc-footer-mini-row">
        <a href="https://fairrent.ca">FairRent</a>
        <span>·</span>
        <a href="https://fairrent.ca/about">About</a>
        <span>·</span>
        <a href="https://fairrent.ca/privacy">Privacy</a>
        <span>·</span>
        <a href="https://fairrent.ca/methodology">Methodology</a>
        <span>·</span>
        <a href="https://fairrent.ca/contact">Contact</a>
      </div>
    </div>
  );

  if (compact) {
    return (
      <>
        <style>{CSS}</style>
        <footer className="frc-footer">{mini}</footer>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <footer className="frc-footer">
        <div className="frc-footer-full">
          <div className="frc-footer-inner">
            <div className="frc-footer-brand-col">
              <a className="frc-footer-brand" href="https://fairrent.ca">FairRent Canada</a>
              <div className="frc-footer-tag">
                A tenant-powered rent transparency platform. See what Canadian renters are actually paying. Free, anonymous, no sign-up.
              </div>
              <span className="frc-footer-priv">Privacy-first · 100% anonymous</span>
            </div>

            <div className="frc-footer-col">
              <div className="frc-footer-h">FairRent</div>
              <a className="frc-footer-link" href="https://fairrent.ca/about" onClick={click(actions.onAbout, "/about")}>About</a>
              <a className="frc-footer-link" href="https://fairrent.ca/methodology" onClick={click(actions.onMethodology, "/methodology")}>Methodology</a>
              <a className="frc-footer-link" href="https://fairrent.ca/privacy" onClick={click(actions.onPrivacy, "/privacy")}>Privacy</a>
              <a className="frc-footer-link" href="https://fairrent.ca/contact" onClick={click(actions.onContact, "/contact")}>Contact</a>
            </div>

            <div className="frc-footer-col">
              <div className="frc-footer-h">Explore</div>
              <a className="frc-footer-link" href="https://ottawafairrent.ca">Ottawa</a>
              <a className="frc-footer-link" href="https://torontofairrent.ca">Toronto</a>
              <a className="frc-footer-link" href="https://vancouverfairrent.ca">Vancouver</a>
              <a className="frc-footer-link" href="https://fairrent.ca/map" onClick={click(actions.onMap, "/map")}>Neighbourhoods</a>
            </div>

            <div className="frc-footer-col">
              <div className="frc-footer-h">Contribute</div>
              <a className="frc-footer-link" href="https://ottawafairrent.ca/#form" onClick={click(actions.onSubmitRent, "/submit")}>Submit your rent</a>
              <a className="frc-footer-link" href="https://ottawafairrent.ca/#form" onClick={click(actions.onCheckRent, "/check")}>Check my rent</a>
              <button className="frc-footer-link" onClick={click(actions.onToggleLang, "/lang")}>Français</button>
            </div>
          </div>

          <div className="frc-footer-bottom">
            <span>© {year} FairRent Canada{citySuffix ? ` · ${citySuffix}` : ""}. Informational only. Not legal or financial advice.</span>
            <span>Sources: CMHC, Rentals.ca, anonymous renter submissions.</span>
          </div>
        </div>

        {mini}
      </footer>
    </>
  );
}
