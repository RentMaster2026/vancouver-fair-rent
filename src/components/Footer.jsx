// Shared Footer — copy lives in each city repo (no shared package layer).
// Glassdoor-inspired renter-first footer.
//   Desktop: 4-column grid (FairRent / Explore / Contribute + brand).
//   Mobile:  a structured grouped layout (FairRent / Cities / Legal /
//            Language) instead of the old one-line mini bar, so it reads
//            as a real footer rather than a footnote.

const CSS = `
  .frc-footer{background:#fff;border-top:1px solid #e5e7eb;margin-top:64px;}

  /* Desktop 4-column grid */
  .frc-footer-inner{max-width:1180px;margin:0 auto;padding:36px 20px 24px;display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:36px;align-items:start;}
  .frc-footer-brand-col{display:flex;flex-direction:column;gap:10px;}
  .frc-footer-brand{font-size:18px;font-weight:700;color:#0e7c3a;text-decoration:none;display:inline-block;}
  .frc-footer-brand:hover{color:#0a6630;}
  .frc-footer-tag{font-size:13px;color:#5b6770;line-height:1.6;max-width:340px;}

  .frc-footer-col{display:flex;flex-direction:column;gap:8px;}
  .frc-footer-h{font-size:12px;font-weight:700;color:#1d2a35;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;}
  .frc-footer-link{font-size:13px;color:#5b6770;text-decoration:none;background:none;border:none;padding:0;cursor:pointer;text-align:left;font-family:inherit;line-height:1.5;}
  .frc-footer-link:hover{color:#0e7c3a;}

  .frc-footer-bottom{max-width:1180px;margin:0 auto;padding:14px 20px 18px;border-top:1px solid #eef0f2;font-size:12px;color:#7a8d99;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;}
  .frc-footer-bottom a,.frc-footer-bottom button{color:#7a8d99;text-decoration:none;background:none;border:none;cursor:pointer;font-family:inherit;font-size:12px;}
  .frc-footer-bottom a:hover,.frc-footer-bottom button:hover{color:#0e7c3a;}

  /* Mobile grouped footer — replaces the old single-line mini bar with a
     structured layout (FairRent / Cities / Legal / Language) so the
     footer reads as intentional rather than crammed. Used on every city
     subdomain (where compact=true) and as the mobile fallback on the hub. */
  .frc-footer-mobile{padding:24px 18px 28px;background:#fff;border-top:1px solid #eef0f2;font-family:inherit;}
  .frc-footer-mobile-brand{font-size:16px;font-weight:700;color:#0e7c3a;text-decoration:none;display:inline-block;margin-bottom:6px;}
  .frc-footer-mobile-tag{font-size:13px;color:#7a8d99;line-height:1.55;max-width:300px;margin-bottom:20px;}
  .frc-footer-mobile-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px 18px;margin-bottom:22px;}
  .frc-footer-mobile-col{display:flex;flex-direction:column;gap:8px;}
  .frc-footer-mobile-h{font-size:11px;font-weight:700;color:#1d2a35;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px;}
  .frc-footer-mobile-link{font-size:14px;color:#3b4753;text-decoration:none;background:none;border:none;padding:0;cursor:pointer;text-align:left;font-family:inherit;line-height:1.5;}
  .frc-footer-mobile-link:hover{color:#0e7c3a;}
  .frc-footer-mobile-meta{padding-top:18px;border-top:1px solid #eef0f2;font-size:11.5px;color:#9aa4af;line-height:1.6;}

  @media(max-width:880px){
    .frc-footer-inner{grid-template-columns:1fr 1fr;gap:24px;padding:28px 18px 20px;}
    .frc-footer-brand-col{grid-column:1 / -1;}
  }
  @media(max-width:560px){
    .frc-footer-full{display:none;}
    .frc-footer-mobile-on-mobile{display:block;}
    .frc-footer{margin-top:32px;}
  }
  @media(min-width:561px){
    .frc-footer-mobile-on-mobile{display:none;}
  }
`;

// Renders the mobile grouped footer. Used:
//   - on every city subdomain (compact=true, always shown)
//   - on the hub on small viewports (.frc-footer-mobile-on-mobile)
function MobileGroupedFooter({ year, citySuffix, actions }) {
  const click = (fn) => (e) => {
    if (typeof fn === "function") { e.preventDefault(); fn(); }
  };
  return (
    <div className="frc-footer-mobile">
      <a className="frc-footer-mobile-brand" href="https://fairrent.ca">FairRent</a>
      <div className="frc-footer-mobile-tag">
        Anonymous renter submissions, public market data. Free, no sign-up.
      </div>

      <div className="frc-footer-mobile-grid">
        <div className="frc-footer-mobile-col">
          <div className="frc-footer-mobile-h">FairRent</div>
          <a className="frc-footer-mobile-link" href="https://fairrent.ca/about" onClick={click(actions?.onAbout)}>About</a>
          <a className="frc-footer-mobile-link" href="https://fairrent.ca/blog" onClick={click(actions?.onBlog)}>Blog</a>
          <a className="frc-footer-mobile-link" href="https://fairrent.ca/methodology" onClick={click(actions?.onMethodology)}>Methodology</a>
          <a className="frc-footer-mobile-link" href="https://fairrent.ca/contact" onClick={click(actions?.onContact)}>Contact</a>
        </div>

        <div className="frc-footer-mobile-col">
          <div className="frc-footer-mobile-h">Cities</div>
          <a className="frc-footer-mobile-link" href="https://ottawafairrent.ca">Ottawa</a>
          <a className="frc-footer-mobile-link" href="https://torontofairrent.ca">Toronto</a>
          <a className="frc-footer-mobile-link" href="https://vancouverfairrent.ca">Vancouver</a>
          <a className="frc-footer-mobile-link" href="https://fairrent.ca/map" onClick={click(actions?.onMap)}>Neighbourhoods</a>
        </div>

        <div className="frc-footer-mobile-col">
          <div className="frc-footer-mobile-h">Legal</div>
          <a className="frc-footer-mobile-link" href="https://fairrent.ca/privacy" onClick={click(actions?.onPrivacy)}>Privacy</a>
          <a className="frc-footer-mobile-link" href="https://fairrent.ca/terms" onClick={click(actions?.onTerms)}>Terms</a>
        </div>

        <div className="frc-footer-mobile-col">
          <div className="frc-footer-mobile-h">Language</div>
          <button className="frc-footer-mobile-link" onClick={click(actions?.onToggleLang)}>Français</button>
        </div>
      </div>

      <div className="frc-footer-mobile-meta">
        © {year} FairRent Canada{citySuffix ? ` · ${citySuffix}` : ""}. Informational only. Not legal or financial advice.<br/>
        Sources: CMHC, Rentals.ca, anonymous renter submissions.
      </div>
    </div>
  );
}

export default function Footer({ actions = {}, citySuffix, compact = false }) {
  const year = new Date().getFullYear();
  const click = (fn, fallbackHref) => (e) => {
    if (typeof fn === "function") {
      e.preventDefault();
      try { window.frc?.track?.("footer_click", { href: fallbackHref }); } catch {}
      fn();
    }
  };

  // The grouped mobile footer is rendered in both compact-mode (city
  // subdomains, always visible) and as the mobile-only fallback on the hub.
  const mobileGrouped = (
    <div className={compact ? "" : "frc-footer-mobile-on-mobile"}>
      <MobileGroupedFooter year={year} citySuffix={citySuffix} actions={actions} />
    </div>
  );

  if (compact) {
    return (
      <>
        <style>{CSS}</style>
        <footer className="frc-footer">{mobileGrouped}</footer>
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
              <a className="frc-footer-link" href="https://ottawafairrent.ca/#form" onClick={click(actions.onSubmitRent, "/submit")}>Share your rent</a>
              <a className="frc-footer-link" href="https://fairrent.ca/map" onClick={click(actions.onMap, "/map")}>Explore the rent map</a>
              <button className="frc-footer-link" onClick={click(actions.onToggleLang, "/lang")}>Français</button>
            </div>
          </div>

          <div className="frc-footer-bottom">
            <span>© {year} FairRent Canada{citySuffix ? ` · ${citySuffix}` : ""}. Informational only. Not legal or financial advice.</span>
            <span>Sources: CMHC, Rentals.ca, anonymous renter submissions.</span>
          </div>
        </div>

        {mobileGrouped}
      </footer>
    </>
  );
}
