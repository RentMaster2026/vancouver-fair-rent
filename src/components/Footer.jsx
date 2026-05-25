// Shared Footer — identical copy lives in each city repo.
// - Hub (compact=false): full 4-column grid on desktop, compact line on mobile.
// - City sites (compact=true): single compact line on every viewport.

const CSS = `
  .frc-footer{background:#f5f5f5;border-top:1px solid #e1e5ea;margin-top:48px;}
  .frc-footer-inner{max-width:1100px;margin:0 auto;padding:28px 16px 22px;display:grid;grid-template-columns:1fr auto;gap:32px;align-items:start;}
  .frc-footer-brand{font-size:13px;font-weight:600;color:#111;margin-bottom:6px;text-decoration:none;display:inline-block;}
  .frc-footer-brand:hover{color:#1a5c34;}
  .frc-footer-tag{font-size:12px;color:#6a7480;line-height:1.55;max-width:380px;}
  .frc-footer-grid{display:grid;grid-template-columns:repeat(4,minmax(110px,1fr));gap:14px 22px;}
  .frc-footer-col{display:flex;flex-direction:column;gap:5px;}
  .frc-footer-h{font-size:10px;font-weight:600;color:#111;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px;}
  .frc-footer-link{font-size:12px;color:#6a7480;text-decoration:none;background:none;border:none;padding:0;cursor:pointer;text-align:left;font-family:inherit;}
  .frc-footer-link:hover{color:#1a5c34;}
  .frc-footer-bottom{max-width:1100px;margin:0 auto;padding:12px 16px;border-top:1px solid #e6e9ed;font-size:11px;color:#8a939c;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;}
  .frc-footer-bottom a,.frc-footer-bottom button{color:#8a939c;text-decoration:none;background:none;border:none;cursor:pointer;font-family:inherit;font-size:11px;}
  .frc-footer-bottom a:hover,.frc-footer-bottom button:hover{color:#1a5c34;}

  /* Compact: tiny centered footer for city subdomains (and the mobile hub footer fallback). */
  .frc-footer-mini{padding:14px 16px;text-align:center;font-size:11px;color:#8a939c;line-height:1.6;background:#f5f5f5;border-top:1px solid #e6e9ed;}
  .frc-footer-mini-row{display:inline-flex;flex-wrap:wrap;justify-content:center;gap:4px 10px;margin-top:4px;}
  .frc-footer-mini-row a,.frc-footer-mini-row button{color:#8a939c;text-decoration:none;background:none;border:none;cursor:pointer;font-family:inherit;font-size:11px;padding:0;}
  .frc-footer-mini-row a:hover,.frc-footer-mini-row button:hover{color:#1a5c34;}

  @media(max-width:760px){
    .frc-footer-full{display:none;}            /* hide the 4-column grid on mobile */
    .frc-footer-mini-on-mobile{display:block;} /* show the mini bar instead */
    .frc-footer{margin-top:24px;}
  }
  @media(min-width:761px){
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

  // The compact mini footer — used by city sites always, and by the hub on mobile.
  const mini = (
    <div className={"frc-footer-mini" + (compact ? "" : " frc-footer-mini-on-mobile")}>
      <span>© {year} FairRent Canada{citySuffix ? ` · ${citySuffix}` : ""}. Informational only.</span>
      <div className="frc-footer-mini-row">
        <a href="https://fairrent.ca">FairRent Canada</a>
        <span>·</span>
        <a href="https://fairrent.ca/methodology">Methodology</a>
        <span>·</span>
        <a href="https://fairrent.ca/privacy">Privacy</a>
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
            <div>
              <a className="frc-footer-brand" href="https://fairrent.ca">FairRent Canada</a>
              <div className="frc-footer-tag">
                Anonymous renter submissions and public market data. Compare your rent across Canadian cities. Informational only, not legal advice.
              </div>
            </div>

            <div className="frc-footer-grid">
              <div className="frc-footer-col">
                <div className="frc-footer-h">Cities</div>
                <a className="frc-footer-link" href="https://ottawafairrent.ca">Ottawa</a>
                <a className="frc-footer-link" href="https://torontofairrent.ca">Toronto</a>
                <a className="frc-footer-link" href="https://vancouverfairrent.ca">Vancouver</a>
                <a className="frc-footer-link" href="https://fairrent.ca/map" onClick={click(actions.onMap, "/map")}>Rent Map</a>
              </div>
              <div className="frc-footer-col">
                <div className="frc-footer-h">Product</div>
                <a className="frc-footer-link" href="https://fairrent.ca/intelligence" onClick={click(actions.onForBusiness, "/intelligence")}>For Business</a>
                <a className="frc-footer-link" href="https://fairrent.ca/blog" onClick={click(actions.onBlog, "/blog")}>Blog</a>
                <a className="frc-footer-link" href="https://fairrent.ca/newcomers" onClick={click(actions.onNewcomers, "/newcomers")}>Newcomers</a>
                <a className="frc-footer-link" href="https://fairrent.ca/students" onClick={click(actions.onStudents, "/students")}>Students</a>
              </div>
              <div className="frc-footer-col">
                <div className="frc-footer-h">Trust</div>
                <a className="frc-footer-link" href="https://fairrent.ca/methodology" onClick={click(actions.onMethodology, "/methodology")}>Methodology</a>
                <a className="frc-footer-link" href="https://fairrent.ca/about" onClick={click(actions.onAbout, "/about")}>About</a>
                <a className="frc-footer-link" href="https://fairrent.ca/faq" onClick={click(actions.onFaq, "/faq")}>FAQ</a>
                <a className="frc-footer-link" href="https://fairrent.ca/privacy" onClick={click(actions.onPrivacy, "/privacy")}>Privacy</a>
              </div>
              <div className="frc-footer-col">
                <div className="frc-footer-h">FairRent</div>
                <a className="frc-footer-link" href="https://fairrent.ca/contact" onClick={click(actions.onContact, "/contact")}>Contact</a>
                <a className="frc-footer-link" href="https://fairrent.ca/terms" onClick={click(actions.onTerms, "/terms")}>Terms</a>
                <button className="frc-footer-link" onClick={click(actions.onToggleLang, "/lang")}>Français</button>
              </div>
            </div>
          </div>

          <div className="frc-footer-bottom">
            <span>© {year} FairRent Canada{citySuffix ? ` · ${citySuffix}` : ""}. Informational only — not legal or financial advice.</span>
            <span>Sources: CMHC, Rentals.ca market listings, anonymous renter submissions.</span>
          </div>
        </div>

        {mini}
      </footer>
    </>
  );
}
