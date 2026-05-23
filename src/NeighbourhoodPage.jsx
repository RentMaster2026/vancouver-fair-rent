import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const fmt = v => Number(v).toLocaleString("en-CA", { style:"currency", currency:"CAD", maximumFractionDigits:0 });

const UNIT_LABELS = {
  bachelor:"Bachelor / Studio",
  "1br":"1 Bedroom",
  "2br":"2 Bedroom",
  "3br":"3 Bedroom",
  "3plus":"3+ Bedroom",
};

function getRangeForUnit(base, hoodMult, confLabel) {
  const bench  = Math.round(base * hoodMult);
  const spread = confLabel==="Strong" ? 0.07 : confLabel==="Growing" ? 0.10 : 0.16;
  return {
    low:   Math.round(bench*(1-spread)/50)*50,
    high:  Math.round(bench*(1+spread)/50)*50,
    bench,
  };
}

function getConf(n) {
  if (n>=20) return { label:"Strong",   cls:"conf-strong" };
  if (n>=8)  return { label:"Growing",  cls:"conf-growing" };
  if (n>=1)  return { label:"Limited",  cls:"conf-limited" };
  return       { label:"Baseline", cls:"conf-base" };
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-trigger" aria-expanded={open} onClick={() => setOpen(o=>!o)}>
        <span className="faq-q">{q}</span>
        <span className="faq-icon">{open?"−":"+"}</span>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

const CSS = `
  :root {
    --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    --mono: "Courier New", Courier, monospace;
    --bg:#f5f5f5; --white:#ffffff; --border:#cccccc; --border-dark:#999999;
    --t1:#111111; --t2:#444444; --t3:#767676;
    --accent:#1a5c34; --accent-bg:#f0f7f2;
    --nav-bg:#1c2b36; --bar-bg:#2f4553;
  }
  html,body,#root{margin:0;padding:0;width:100%;background:var(--bg);}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:var(--sans);font-size:15px;color:var(--t1);-webkit-font-smoothing:antialiased;line-height:1.5;}
  button,a{font-family:var(--sans);}
  button{cursor:pointer;}
  a{color:var(--accent);}
  button:focus-visible,a:focus-visible,input:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:2px;}

  .gov-nav{background:var(--nav-bg);}
  .gov-nav-inner{max-width:1100px;margin:0 auto;padding:0 16px;display:flex;align-items:center;justify-content:space-between;height:48px;gap:16px;}
  .gov-wordmark{font-size:13px;font-weight:700;color:#fff;text-decoration:none;white-space:nowrap;}
  .gov-wordmark span{font-weight:400;color:#aab8c2;}
  .back-btn{background:none;border:none;font-size:12px;color:#aab8c2;cursor:pointer;padding:0;}
  .back-btn:hover{color:#fff;text-decoration:underline;}

  .gov-subbar{background:var(--bar-bg);}
  .gov-subbar-inner{max-width:1100px;margin:0 auto;padding:6px 16px;display:flex;flex-wrap:wrap;align-items:center;gap:14px;min-height:34px;}
  .gov-subbar a,.gov-subbar button{color:#dde6ec;text-decoration:none;font-size:12px;font-weight:600;background:none;border:none;padding:0;cursor:pointer;}
  .gov-subbar a:hover,.gov-subbar button:hover{color:#fff;}
  .gov-subbar a.primary{background:var(--accent);color:#fff;padding:4px 11px;border-radius:3px;}
  .gov-subbar a.primary:hover{background:#15492a;color:#fff;}

  .bc{background:#243748;padding:6px 16px;display:flex;flex-wrap:wrap;align-items:center;font-size:11px;color:#aab8c2;gap:4px;}
  .bc a{color:#aab8c2;text-decoration:none;}
  .bc a:hover{color:#fff;text-decoration:underline;}

  .wrap{max-width:880px;margin:0 auto;padding:24px 16px 80px;}

  /* Hero */
  .hero{border-bottom:1px solid var(--border);padding-bottom:24px;margin-bottom:24px;}
  .eyebrow{font-size:11px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;}
  .h1{font-size:clamp(22px,4vw,32px);font-weight:700;color:var(--t1);margin-bottom:10px;line-height:1.18;letter-spacing:-0.01em;}
  .hero-sub{font-size:14px;color:var(--t2);line-height:1.6;max-width:660px;margin-bottom:14px;}
  .hero-meta{display:flex;flex-wrap:wrap;gap:10px 20px;font-size:11px;color:var(--t3);margin-bottom:14px;font-family:var(--mono);letter-spacing:0.02em;}
  .hero-meta strong{color:var(--t2);font-family:var(--sans);}
  .vs-badge{display:inline-block;padding:4px 10px;font-family:var(--mono);font-size:12px;font-weight:700;margin-bottom:14px;}
  .vs-up{background:#fdf8f0;color:#7a4f00;border:1px solid #e8c97a;}
  .vs-down{background:#f0f4fd;color:#1a3a8b;border:1px solid #a8b8e8;}
  .vs-flat{background:#f0f7f2;color:#1a4a28;border:1px solid #a8d5b5;}
  .assure{display:inline-block;background:var(--accent-bg);color:var(--accent);border:1px solid #a8d5b5;padding:4px 10px;font-size:12px;font-weight:600;border-radius:2px;margin-right:10px;}
  .cta{display:inline-block;padding:11px 20px;background:var(--accent);color:#fff;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.01em;border-radius:3px;border:1px solid var(--accent);cursor:pointer;}
  .cta:hover{background:#15492a;}
  .cta-out{background:#fff;color:var(--accent);}
  .cta-out:hover{background:var(--accent-bg);}
  .cta-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:10px;}
  .cta-sub{font-size:12px;color:var(--t3);font-style:italic;margin-top:8px;}

  /* Sections */
  .section{margin-bottom:30px;}
  .sh{font-size:11px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;}
  .h2{font-size:18px;font-weight:700;color:var(--t1);margin-bottom:10px;line-height:1.25;}
  .body{font-size:14px;color:var(--t2);line-height:1.65;}
  .body p+p{margin-top:10px;}

  /* Snapshot table */
  .snap-table{width:100%;border-collapse:collapse;font-size:13px;background:#fff;border:1px solid var(--border);}
  .snap-table th{padding:9px 12px;background:#f0f0f0;border:1px solid var(--border);font-weight:700;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:var(--t2);}
  .snap-table td{padding:10px 12px;border:1px solid #e8e8e8;color:var(--t1);}
  .snap-table td:nth-child(2){font-family:var(--mono);font-weight:700;}
  .conf{display:inline-block;padding:2px 7px;border-radius:2px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;border:1px solid;}
  .conf-base{background:#f0f0f0;color:#666;border-color:#ccc;}
  .conf-strong{background:#f0f7f2;color:#1a5c34;border-color:#a8d5b5;}
  .conf-growing{background:#fdf8f0;color:#7a4f00;border-color:#e8c97a;}
  .conf-limited{background:#fdf0f0;color:#8b1a1a;border-color:#e8a8a8;}
  .src-line{font-size:11px;color:var(--t3);margin-top:8px;line-height:1.5;}

  /* Nearby pills */
  .pill-row{display:flex;gap:8px;flex-wrap:wrap;}
  .pill{display:inline-block;padding:6px 12px;background:#fff;border:1px solid var(--border);font-size:12px;color:var(--t2);text-decoration:none;border-radius:2px;}
  .pill:hover{background:var(--accent-bg);border-color:var(--accent);color:var(--accent);}

  /* Submit CTA */
  .submit-cta{background:#fff;border:1px solid var(--border);border-left:3px solid var(--accent);padding:22px 22px 20px;}
  .submit-cta h2{font-size:18px;font-weight:700;color:var(--t1);margin-bottom:6px;}
  .submit-cta p{font-size:13px;color:var(--t2);line-height:1.6;margin-bottom:14px;}
  .submit-cta .microcopy{font-size:11px;color:var(--t3);margin-top:10px;line-height:1.55;}

  /* Data block */
  .data-block{background:#fff;border:1px solid var(--border);padding:18px 18px 16px;}
  .data-block ul{padding-left:18px;margin-top:8px;font-size:13px;color:var(--t2);line-height:1.7;}

  /* Check list */
  .check-list{padding:0;list-style:none;}
  .check-list li{padding:9px 0;border-bottom:1px solid #ebebeb;font-size:13px;color:var(--t2);line-height:1.6;display:flex;gap:10px;align-items:flex-start;}
  .check-list li:last-child{border-bottom:none;}
  .check-list .dot{flex-shrink:0;width:6px;height:6px;border-radius:50%;background:var(--accent);margin-top:7px;}
  .check-list strong{color:var(--t1);font-weight:700;}

  /* FAQ */
  .faq-item{border-bottom:1px solid #ebebeb;}
  .faq-item:last-child{border-bottom:none;}
  .faq-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;padding:12px 0;background:none;border:none;cursor:pointer;text-align:left;gap:16px;font-family:var(--sans);}
  .faq-q{font-size:13px;font-weight:700;color:var(--t1);line-height:1.45;}
  .faq-icon{font-size:16px;color:var(--t3);font-weight:700;flex-shrink:0;}
  .faq-a{font-size:13px;color:var(--t2);line-height:1.7;padding-bottom:12px;}

  /* Internal link grid */
  .link-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin-top:10px;}
  .link-grid a{display:block;padding:10px 12px;background:#fff;border:1px solid var(--border);text-decoration:none;font-size:13px;font-weight:600;color:var(--accent);}
  .link-grid a:hover{background:var(--accent-bg);border-color:var(--accent);}

  /* Footer */
  .footer-line{margin-top:40px;padding-top:18px;border-top:1px solid var(--border);font-size:11px;color:var(--t3);font-family:var(--mono);line-height:1.6;}
  .footer-line a{color:var(--t3);}

  /* Limited-data notice */
  .data-notice{padding:14px 16px;border-left:3px solid #7a4f00;background:#fdf8f0;color:#5a3d00;font-size:13px;line-height:1.6;}

  /* Sticky mobile CTA */
  .sticky-cta{display:none;}
  @media(max-width:760px){
    .sticky-cta{display:block;position:fixed;left:0;right:0;bottom:0;padding:10px 14px;background:rgba(28,43,54,0.96);border-top:1px solid #3d5a6e;z-index:50;}
    .sticky-cta a{display:block;background:var(--accent);color:#fff;text-align:center;padding:12px;font-size:14px;font-weight:700;text-decoration:none;border-radius:3px;}
    .wrap{padding-bottom:90px;}
  }

  @media(max-width:560px){.wrap{padding:18px 12px 80px;}.gov-subbar-inner{gap:8px 12px;}.gov-subbar a,.gov-subbar button{font-size:11.5px;}}
`;

export default function NeighbourhoodPage({ hood, city, onBack }) {
  const [submissions, setSubmissions] = useState({});
  const [ready,       setReady]       = useState(false);

  useEffect(() => {
    const cutoff = new Date();
    cutoff.setFullYear(new Date().getFullYear() - 2);
    Promise.all(
      Object.keys(UNIT_LABELS).map(unit =>
        supabase.from("rent_submissions")
          .select("monthly_rent", { count:"exact", head:false })
          .eq("city", city.key)
          .eq("neighborhood", hood.name)
          .eq("unit_type", unit)
          .gte("monthly_rent", 500).lte("monthly_rent", 8000)
          .gte("created_at", cutoff.toISOString())
          .then(({ data, count }) => ({ unit, count:count||0, data:data||[] }))
      )
    ).then(results => {
      const m = {};
      results.forEach(r => { m[r.unit] = { count:r.count, conf:getConf(r.count) }; });
      setSubmissions(m);
      setReady(true);
    });
  }, [hood.name, city.key]);

  const totalSubmissions = Object.values(submissions).reduce((a,b) => a+b.count, 0);
  const pct = hood.vsAvgPct;
  const vsLabel = pct > 0 ? `+${pct}%` : pct < 0 ? `${pct}%` : "in line";
  const vsClass = pct > 0 ? "vs-up" : pct < 0 ? "vs-down" : "vs-flat";
  const vsText  = pct > 0 ? `${pct}% above the ${city.name} average`
                : pct < 0 ? `${Math.abs(pct)}% below the ${city.name} average`
                : `in line with the ${city.name} average`;

  const compareLine = pct > 0
    ? `${hood.name} rents run ${pct}% above the ${city.name} average for comparable units. ${hood.context}`
    : pct < 0
    ? `${hood.name} rents run ${Math.abs(pct)}% below the ${city.name} average for comparable units. ${hood.context}`
    : `${hood.name} rents are broadly in line with the ${city.name} average. ${hood.context}`;

  const rc = city.rentControlled ? "ontario" : "bc";
  const rcLine = rc === "ontario"
    ? "In Ontario, units first occupied before November 15, 2018 are rent controlled at the provincial guideline. Newer units are exempt between tenancies."
    : "In BC, annual rent increases are capped at the provincial guideline for all existing tenancies.";

  const lastUpdated = "May 2026";
  const slug = hood.slug || hood.name.toLowerCase().replace(/\s+/g, '-');
  const checkUrl = `${city.calcUrl}?hood=${encodeURIComponent(hood.name)}`;
  const mapUrl   = `https://fairrent.ca/map?city=${city.key}`;
  const methodologyUrl = "https://fairrent.ca/methodology";

  // ── FAQ data (live counts substituted into a few answers) ────────────────
  const oneBrRange = getRangeForUnit(city.bases["1br"], hood.hoodMult, "Strong");
  const pctDir = pct > 0 ? "above" : pct < 0 ? "below" : "in line with";
  const pctStr = pct !== 0 ? `${Math.abs(pct)}% ${pctDir}` : "in line with";
  const submitInfo = ready
    ? totalSubmissions >= 20
      ? `${hood.name} has strong local data with ${totalSubmissions} recent submissions. Estimates blend CMHC data with real rents reported by renters here.`
      : totalSubmissions >= 8
      ? `${hood.name} has growing local data with ${totalSubmissions} recent submissions. Confidence improves as more renters submit.`
      : totalSubmissions >= 1
      ? `${hood.name} has limited local data so far (${totalSubmissions} submission${totalSubmissions===1?"":"s"}). Estimates rely primarily on CMHC and Rentals.ca data.`
      : `${hood.name} does not have enough anonymous submissions yet for a strong local benchmark. You can still compare with ${city.name}-wide data and help improve this page by sharing your rent anonymously.`
    : "Loading local data...";

  const faqs = [
    {
      q: `What is the average rent in ${hood.name}?`,
      a: `The estimated fair range for a 1-bedroom in ${hood.name} is ${fmt(oneBrRange.low)} to ${fmt(oneBrRange.high)} per month, based on CMHC data and Rentals.ca market listings. ${hood.name} rents run ${pctStr} the ${city.name} average for comparable units. See the snapshot table above for all unit types.`,
    },
    {
      q: `Is ${hood.name} more expensive than the rest of ${city.name}?`,
      a: `${compareLine} Use this as a benchmark, not a final appraisal. Building age, condition, floor, and included amenities affect individual rents.`,
    },
    {
      q: "How does Fair Rent Canada calculate rent benchmarks?",
      a: "We combine public CMHC Rental Market Survey data, Rentals.ca market listing data, and anonymous renter submissions. CMHC data is comprehensive but lags. Listings show asking rents. Anonymous submissions show what renters report paying. The blend gets more accurate as more renters contribute.",
    },
    {
      q: "Is my rent submission anonymous?",
      a: "Yes. We do not collect your name, email, address, phone, or IP. We store only your neighbourhood, unit type, monthly rent, move-in year, city, and whether parking or utilities are included. There is no way to trace a submission back to a person.",
    },
    {
      q: "Does Fair Rent Canada show my exact address?",
      a: "No. We never display individual rent submissions publicly. We only show grouped data: ranges, medians, and confidence scores by neighbourhood and unit type. Your submission becomes one of many anonymous data points feeding the neighbourhood benchmark.",
    },
    {
      q: `Why should I submit my rent in ${hood.name}?`,
      a: `The data improves when more renters contribute. Your submission makes the ${hood.name} benchmark better for the next renter checking their rent here. Submission takes about 60 seconds and stays anonymous. ${submitInfo}`,
    },
    {
      q: "How often is this page updated?",
      a: `Last updated ${lastUpdated}. CMHC data is refreshed annually each fall. Rentals.ca data updates monthly. Anonymous renter submissions feed in continuously. Submissions older than two years are excluded so the benchmark stays current.`,
    },
    {
      q: `What if there is not enough data for ${hood.name}?`,
      a: `When local submissions are limited, the estimate relies primarily on CMHC and Rentals.ca data adjusted for ${hood.name}. Confidence labels in the table make this clear. The more renters in ${hood.name} submit, the stronger the local benchmark gets.`,
    },
    {
      q: "Does Fair Rent Canada use Rentals.ca data?",
      a: "Yes. Fair Rent Canada uses Rentals.ca market listing data as one source of market context. This does not mean Rentals.ca has endorsed, sponsored, or partnered with Fair Rent Canada. We reference Rentals.ca by name only to be transparent about our market context source.",
    },
    {
      q: "Is this legal or financial advice?",
      a: "No. Fair Rent Canada provides market estimates for information only. Results are not professional appraisals, legal opinions, or official determinations. For rent disputes or formal proceedings, consult a licensed paralegal or your provincial tenant rights organization.",
    },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:"var(--bg)" }}>

        {/* NAV */}
        <div className="gov-nav" style={{ borderBottom:`3px solid ${city.accent}` }}>
          <div className="gov-nav-inner">
            <a href={city.calcUrl} className="gov-wordmark">
              Fair Rent Canada <span>/ {city.name}</span>
            </a>
            <button className="back-btn" onClick={onBack}>&#8592; All neighbourhoods</button>
          </div>
        </div>

        {/* SUB-NAV */}
        <div className="gov-subbar">
          <div className="gov-subbar-inner">
            <a className="primary" href={checkUrl}>Check my rent</a>
            <a href={mapUrl}>{city.name} rent map</a>
            <a href={methodologyUrl}>Methodology</a>
            <a href="https://fairrent.ca/about">About</a>
            <a href="https://fairrent.ca/faq">FAQ</a>
            <a href="https://fairrent.ca/intelligence">For business</a>
          </div>
        </div>

        {/* BREADCRUMB */}
        <div className="bc">
          <a href="https://fairrent.ca">Fair Rent Canada</a>&nbsp;/&nbsp;
          <a href={city.calcUrl}>{city.name}</a>&nbsp;/&nbsp;
          {hood.name}
        </div>

        <div className="wrap">

          {/* HERO */}
          <section className="hero">
            <div className="eyebrow">{city.name} &middot; Neighbourhood report</div>
            <h1 className="h1">{hood.name} rent data</h1>
            <p className="hero-sub">Compare rents in {hood.name} using public CMHC data, Rentals.ca market listing data, and anonymous renter submissions.</p>
            <div className="hero-meta">
              <span><strong>City:</strong> {city.name}, {city.province}</span>
              <span><strong>Neighbourhood:</strong> {hood.name}</span>
              <span><strong>Last updated:</strong> {lastUpdated}</span>
              {ready && totalSubmissions>0 && <span><strong>Local submissions:</strong> {totalSubmissions}</span>}
            </div>
            <div className={"vs-badge "+vsClass}>{hood.name} rents are {vsText}</div>
            <div className="cta-row">
              <span className="assure">Free. Anonymous. No signup.</span>
              <a className="cta" href={checkUrl}>Check my rent in {hood.name} →</a>
            </div>
            <div className="cta-sub">Your check is your submission. Always anonymous.</div>
          </section>

          {/* RENT SNAPSHOT */}
          <section className="section">
            <div className="sh">Rent snapshot</div>
            <h2 className="h2">Average rent in {hood.name}</h2>
            <table className="snap-table">
              <thead><tr><th>Unit type</th><th>Estimated range / mo</th><th>Confidence</th></tr></thead>
              <tbody>
                {Object.entries(UNIT_LABELS).map(([key,label]) => {
                  const conf = ready ? (submissions[key]?.conf || getConf(0)) : getConf(0);
                  const r = getRangeForUnit(city.bases[key] || city.bases["1br"], hood.hoodMult, conf.label);
                  return (
                    <tr key={key}>
                      <td>{label}</td>
                      <td>{fmt(r.low)} to {fmt(r.high)}</td>
                      <td><span className={"conf "+conf.cls}>{conf.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="src-line">Estimates combine CMHC Rental Market Survey, Rentals.ca market listing data, and anonymous renter submissions. Confidence rises as more renters in {hood.name} submit. Last updated {lastUpdated}.</p>
            {ready && totalSubmissions === 0 && (
              <div className="data-notice" style={{ marginTop:14 }}>
                We do not have enough anonymous submissions in {hood.name} yet to show a strong local benchmark. You can still compare with {city.name}-wide data and help improve this page by sharing your rent anonymously below.
              </div>
            )}
          </section>

          {/* IS RENT HIGH OR LOW */}
          <section className="section">
            <div className="sh">Local context</div>
            <h2 className="h2">Are rents in {hood.name} high or low?</h2>
            <div className="body">
              <p>{compareLine}</p>
              <p>Listing rents show what landlords are asking. Anonymous renter submissions help show what people report paying. Use this as a benchmark, not a final appraisal. Building age, condition, floor, and included amenities affect individual rents.</p>
            </div>
          </section>

          {/* COMPARISON / NEARBY */}
          {hood.nearbyHoods?.length > 0 && (
            <section className="section">
              <div className="sh">Compare</div>
              <h2 className="h2">Nearby neighbourhoods</h2>
              <p className="body" style={{marginBottom:12}}>See how rents in {hood.name} compare with nearby {city.name} neighbourhoods.</p>
              <div className="pill-row">
                {hood.nearbyHoods.map(n => {
                  const nSlug = n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  return <a key={n} className="pill" href={`/${nSlug}`}>{n}</a>;
                })}
              </div>
            </section>
          )}

          {/* MAP */}
          <section className="section">
            <div className="sh">Map</div>
            <h2 className="h2">Explore the {city.name} rent map</h2>
            <p className="body" style={{marginBottom:14}}>Click any {city.name} neighbourhood to see rent ranges by bedroom type, with sample sizes and confidence scores.</p>
            <a className="cta cta-out" href={mapUrl}>Explore the {city.name} rent map →</a>
          </section>

          {/* MID-PAGE SUBMIT CTA */}
          <section className="section">
            <div className="submit-cta">
              <h2>Help improve rent data for {hood.name}</h2>
              <p>Anonymous renter submissions make this page more useful. If you rent in {hood.name}, sharing your rent helps other renters compare prices before signing or renewing a lease.</p>
              <a className="cta" href={checkUrl}>Check my rent in {hood.name} →</a>
              <div className="microcopy">No signup. About 60 seconds. Individual submissions are never publicly shown. Personal data is never sold.</div>
            </div>
          </section>

          {/* DATA SOURCES */}
          <section className="section">
            <div className="sh">How this estimate was built</div>
            <h2 className="h2">Data sources and methodology</h2>
            <div className="data-block">
              <p className="body">This page combines three sources:</p>
              <ul>
                <li><strong>Public CMHC data.</strong> Annual Rental Market Survey covering purpose-built rentals.</li>
                <li><strong>Rentals.ca market listing data.</strong> Used as one source of market context. Listings show asking rents, not necessarily signed rents.</li>
                <li><strong>Anonymous renter submissions.</strong> Real rents reported by renters in {hood.name}.</li>
              </ul>
              <p className="body" style={{marginTop:12}}>Results are grouped by neighbourhood and unit type. Individual submissions are never shown publicly. Use the numbers above as a benchmark, not an exact appraisal.</p>
              <p className="src-line" style={{marginTop:12}}><a href={methodologyUrl} style={{ color:"var(--accent)", fontWeight:700 }}>Read the full methodology →</a></p>
            </div>
          </section>

          {/* LOCAL RENTER GUIDE */}
          <section className="section">
            <div className="sh">For renters</div>
            <h2 className="h2">Before renting in {hood.name}</h2>
            <p className="body" style={{marginBottom:10}}>Practical things to check before signing or renewing a lease.</p>
            <ul className="check-list">
              <li><span className="dot"/><div><strong>Compare by unit type.</strong> Bachelor, 1-bedroom, and 2-bedroom rents vary widely in {hood.name}. Use the snapshot table above for the right benchmark.</div></li>
              <li><span className="dot"/><div><strong>Check what is included.</strong> A unit at the top of the range may include heat, water, or parking. A bare unit at the same price is more expensive in practice.</div></li>
              <li><span className="dot"/><div><strong>Ask about parking.</strong> Indoor parking can add $100 to $250 per month depending on the building.</div></li>
              <li><span className="dot"/><div><strong>Compare building age and condition.</strong> A renovated unit in a newer building often rents above the neighbourhood range.</div></li>
              <li><span className="dot"/><div><strong>Ask about rent increase rules.</strong> {rcLine}</div></li>
              <li><span className="dot"/><div><strong>Compare asking rent with submitted rent.</strong> Listing sites show asking rents. Submitted rents help show what renters report paying. Both matter when negotiating.</div></li>
            </ul>
          </section>

          {/* FAQ */}
          <section className="section">
            <div className="sh">Frequently asked questions</div>
            <h2 className="h2">FAQ for renters in {hood.name}</h2>
            {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a}/>)}
          </section>

          {/* INTERNAL LINKS */}
          <section className="section">
            <div className="sh">More from Fair Rent Canada</div>
            <div className="link-grid">
              <a href={city.calcUrl}>Compare more {city.name} neighbourhoods →</a>
              <a href={mapUrl}>Explore the {city.name} rent map →</a>
              <a href={checkUrl}>Submit your rent anonymously →</a>
              <a href={methodologyUrl}>How our benchmarks work →</a>
              <a href="https://fairrent.ca/privacy">Privacy policy →</a>
              <a href="https://fairrent.ca/faq">All FAQ →</a>
            </div>
          </section>

          <p className="footer-line">
            Fair Rent Canada &middot; {city.name} Rent Calculator &middot; {hood.name} rent data.<br/>
            Sources: CMHC Rental Market Survey (October 2024), Rentals.ca market listing data (2025), anonymous renter submissions. Results are estimates only. Not legal, financial, or real estate advice. Last updated {lastUpdated}.<br/>
            <a href="https://fairrent.ca">fairrent.ca</a> &middot; <a href={methodologyUrl}>Methodology</a> &middot; <a href="https://fairrent.ca/privacy">Privacy</a> &middot; <a href="https://fairrent.ca/contact">Contact</a>
          </p>
        </div>

        {/* Sticky mobile CTA */}
        <div className="sticky-cta">
          <a href={checkUrl}>Check my rent in {hood.name} →</a>
        </div>
      </div>
    </>
  );
}
