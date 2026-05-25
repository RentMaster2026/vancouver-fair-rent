// Shared Footer — identical copy lives in each city repo.
// Single column on mobile, two columns on desktop (brand left, links right).

const CSS = `
  .frc-footer{background:#f5f5f5;border-top:1px solid #e1e5ea;margin-top:48px;}
  .frc-footer-inner{max-width:1100px;margin:0 auto;padding:32px 16px 28px;display:grid;grid-template-columns:1fr auto;gap:32px;align-items:start;}
  .frc-footer-brand{font-size:14px;font-weight:600;color:#111;margin-bottom:8px;}
  .frc-footer-tag{font-size:12px;color:#5a6571;line-height:1.55;max-width:380px;}
  .frc-footer-grid{display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:16px 24px;}
  .frc-footer-col{display:flex;flex-direction:column;gap:6px;}
  .frc-footer-h{font-size:11px;font-weight:600;color:#111;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;}
  .frc-footer-link{font-size:13px;color:#5a6571;text-decoration:none;background:none;border:none;padding:0;cursor:pointer;text-align:left;font-family:inherit;}
  .frc-footer-link:hover{color:#1a5c34;}
  .frc-footer-bottom{max-width:1100px;margin:0 auto;padding:16px;border-top:1px solid #e1e5ea;font-size:11px;color:#7a8590;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;}
  .frc-footer-bottom a,.frc-footer-bottom button{color:#7a8590;text-decoration:none;background:none;border:none;cursor:pointer;font-family:inherit;font-size:11px;}
  .frc-footer-bottom a:hover,.frc-footer-bottom button:hover{color:#1a5c34;}

  @media(max-width:760px){
    .frc-footer-inner{grid-template-columns:1fr;gap:24px;}
    .frc-footer-grid{grid-template-columns:repeat(2,1fr);gap:18px;}
  }
`;

// Default link config. Cities can override individual handlers via props.actions.
//
// Props:
//   actions  object with { onOttawa, onToronto, onVancouver, onMap, onContact,
//                          onPrivacy, onMethodology, onAbout, onFaq, onTerms,
//                          onForBusiness, onToggleLang }
//   citySuffix?  string for the bottom legal line
export default function Footer({ actions = {}, citySuffix }) {
  const year = new Date().getFullYear();
  const click = (fn, fallbackHref) => (e) => {
    if (typeof fn === "function") {
      e.preventDefault();
      try { window.frc?.track?.("footer_click", { href: fallbackHref }); } catch {}
      fn();
    }
  };
  return (
    <>
      <style>{CSS}</style>
      <footer className="frc-footer">
        <div className="frc-footer-inner">
          <div>
            <div className="frc-footer-brand">FairRent Canada</div>
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
              <a className="frc-footer-link" href="https://fairrent.ca/newcomers" onClick={click(actions.onNewcomers, "/newcomers")}>For newcomers</a>
              <a className="frc-footer-link" href="https://fairrent.ca/students" onClick={click(actions.onStudents, "/students")}>For students</a>
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
      </footer>
    </>
  );
}
