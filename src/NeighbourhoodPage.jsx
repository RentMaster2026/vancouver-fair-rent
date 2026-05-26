import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const fmt = v => Number(v).toLocaleString("en-CA", { style:"currency", currency:"CAD", maximumFractionDigits:0 });

const UNIT_LABELS = {
  bachelor:"Studio",
  "1br":"1 bedroom",
  "2br":"2 bedroom",
  "3br":"3 bedroom",
  "3plus":"3+ bedroom",
};

function getRangeForUnit(base, hoodMult, confLabel) {
  const bench  = Math.round(base * hoodMult);
  const spread = confLabel === "Strong" ? 0.07 : confLabel === "Growing" ? 0.10 : 0.16;
  return {
    low:  Math.round(bench * (1 - spread) / 50) * 50,
    high: Math.round(bench * (1 + spread) / 50) * 50,
    bench,
  };
}

function getConf(n) {
  if (n >= 20) return { label:"Strong",   cls:"conf-strong"   };
  if (n >= 8)  return { label:"Growing",  cls:"conf-growing"  };
  if (n >= 1)  return { label:"Limited",  cls:"conf-limited"  };
  return         { label:"Baseline", cls:"conf-base"     };
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-trigger" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span className="faq-q">{q}</span>
        <span className="faq-icon">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

const CSS = `
  :root {
    --serif: Charter, Georgia, "Iowan Old Style", "Times New Roman", serif;
    --sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --bg:#f4f5f7; --white:#ffffff; --surface:#ffffff;
    --border:#e3e6ea; --border-soft:#eef0f3;
    --t1:#0d1418; --t2:#3b4753; --t3:#6a7682; --t4:#9aa4af;
    --accent:#0e7c3a; --accent-hover:#0a6630; --accent-soft:#eef7f1; --accent-line:#cfe6d8;
  }
  html,body,#root{margin:0;padding:0;width:100%;background:var(--bg);}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:var(--sans);font-size:15px;color:var(--t1);-webkit-font-smoothing:antialiased;line-height:1.55;}
  a{color:var(--accent);text-decoration:none;}
  a:hover{text-decoration:underline;}
  button:focus-visible,a:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:3px;}

  .hood-wrap{max-width:920px;margin:0 auto;padding:24px 20px 64px;}
  @media(max-width:640px){.hood-wrap{padding:18px 16px 48px;}}

  /* Inline breadcrumb (no dark banner) */
  .hood-crumb{font-size:13px;color:var(--t3);margin-bottom:18px;}
  .hood-crumb a{color:var(--t3);font-weight:500;}
  .hood-crumb a:hover{color:var(--accent);}
  .hood-crumb .sep{color:var(--t4);margin:0 6px;}
  .hood-back{background:none;border:none;font-size:13px;color:var(--t3);cursor:pointer;font-family:inherit;padding:0;text-decoration:none;}
  .hood-back:hover{color:var(--accent);text-decoration:underline;}

  /* Hero */
  .hood-hero{padding-bottom:24px;margin-bottom:24px;border-bottom:1px solid var(--border-soft);}
  .hood-eyebrow{font-size:11px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.14em;margin-bottom:10px;}
  .hood-title{font-family:var(--serif);font-size:clamp(28px,3.6vw,42px);font-weight:700;color:var(--t1);letter-spacing:-0.01em;line-height:1.12;margin-bottom:14px;max-width:780px;}
  .hood-sub{font-size:15.5px;color:var(--t2);line-height:1.6;max-width:680px;margin-bottom:18px;}
  .hood-meta{display:flex;flex-wrap:wrap;gap:8px 22px;font-size:12.5px;color:var(--t3);margin-bottom:18px;}
  .hood-meta strong{color:var(--t1);font-weight:600;}
  .hood-meta .meta-sep{color:var(--t4);}
  .hood-vs{display:inline-block;font-family:var(--serif);font-size:16px;font-style:italic;color:var(--t2);margin-bottom:18px;line-height:1.5;}
  .hood-vs strong{color:var(--t1);font-style:normal;font-weight:600;}
  .hood-cta-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;}
  .btn{display:inline-flex;align-items:center;justify-content:center;padding:11px 18px;font-size:14px;font-weight:600;border-radius:6px;border:1px solid transparent;font-family:inherit;cursor:pointer;text-decoration:none;line-height:1.2;}
  .btn-primary{background:var(--accent);color:#fff;border-color:var(--accent);}
  .btn-primary:hover{background:var(--accent-hover);border-color:var(--accent-hover);color:#fff;text-decoration:none;}
  .btn-ghost{background:transparent;color:var(--t2);border-color:var(--border);}
  .btn-ghost:hover{border-color:var(--t3);color:var(--t1);text-decoration:none;}
  @media(max-width:560px){
    .hood-cta-row .btn{flex:1 1 100%;}
  }

  /* Section heads */
  .section{margin-top:34px;}
  .sh{font-size:11px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.14em;margin-bottom:8px;}
  .h2{font-family:var(--serif);font-size:clamp(20px,2.4vw,26px);font-weight:700;color:var(--t1);letter-spacing:-0.005em;line-height:1.25;margin-bottom:10px;}
  .body{font-size:15px;color:var(--t2);line-height:1.7;max-width:720px;}
  .body p+p{margin-top:10px;}

  /* Snapshot table */
  .snap-card{background:var(--surface);border:1px solid var(--border);border-radius:8px;overflow:hidden;}
  .snap-table{width:100%;border-collapse:collapse;font-size:14px;}
  .snap-table th{padding:12px 16px;background:#fbfcfd;border-bottom:1px solid var(--border-soft);font-weight:600;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--t3);}
  .snap-table td{padding:14px 16px;border-bottom:1px solid var(--border-soft);color:var(--t1);}
  .snap-table tr:last-child td{border-bottom:none;}
  .snap-table td:nth-child(2){font-variant-numeric:tabular-nums;font-weight:600;}
  /* Confidence is rendered as plain text annotation, not a coloured pill.
     Visually quieter and reads like editorial rather than a data dashboard. */
  .conf{font-size:13px;color:var(--t3);font-style:italic;}
  .conf-strong{color:var(--accent);font-style:normal;font-weight:600;}
  .src-line{font-size:12.5px;color:var(--t3);margin-top:12px;line-height:1.55;max-width:720px;}

  /* Empty / building-data notice */
  .data-notice{padding:16px 18px;background:var(--surface);border:1px solid var(--border);border-radius:8px;color:var(--t2);font-size:14px;line-height:1.6;margin-top:16px;}
  .data-notice strong{color:var(--t1);}

  /* Privacy note — plain inline editorial line, not a boxed callout */
  .privacy-line{font-size:14px;color:var(--t3);line-height:1.65;margin-top:12px;}
  .privacy-line strong{color:var(--t2);font-weight:600;}

  /* Help-improve panel */
  .help-card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:24px;}
  .help-card h2{margin-bottom:8px;}
  .help-card p{margin-bottom:16px;}
  .help-card .microcopy{font-size:12.5px;color:var(--t3);margin-top:14px;line-height:1.6;}

  /* Nearby pills */
  .pill-row{display:flex;gap:8px;flex-wrap:wrap;}
  .pill{display:inline-block;padding:7px 14px;background:var(--surface);border:1px solid var(--border);font-size:13px;font-weight:500;color:var(--t2);text-decoration:none;border-radius:999px;}
  .pill:hover{background:var(--accent-soft);border-color:var(--accent);color:var(--accent);text-decoration:none;}

  /* Methodology / data sources block */
  .data-block{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:20px;}
  .data-block ul{padding-left:18px;margin-top:10px;font-size:14px;color:var(--t2);line-height:1.75;}
  .data-block ul strong{color:var(--t1);}

  /* Renter check-list */
  .check-list{padding:0;list-style:none;}
  .check-list li{padding:11px 0;border-bottom:1px solid var(--border-soft);font-size:14.5px;color:var(--t2);line-height:1.6;display:flex;gap:12px;align-items:flex-start;}
  .check-list li:last-child{border-bottom:none;}
  .check-list .dot{flex-shrink:0;width:6px;height:6px;border-radius:50%;background:var(--accent);margin-top:9px;}
  .check-list strong{color:var(--t1);font-weight:600;}

  /* FAQ */
  .faq-item{border-bottom:1px solid var(--border-soft);}
  .faq-item:last-child{border-bottom:none;}
  .faq-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 0;background:none;border:none;cursor:pointer;text-align:left;gap:16px;font-family:inherit;}
  .faq-q{font-size:14.5px;font-weight:600;color:var(--t1);line-height:1.45;}
  .faq-icon{font-size:18px;color:var(--t3);font-weight:600;flex-shrink:0;}
  .faq-a{font-size:14px;color:var(--t2);line-height:1.7;padding-bottom:14px;max-width:720px;}

  /* Internal link grid */
  .link-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin-top:14px;}
  .link-grid a{display:block;padding:12px 16px;background:var(--surface);border:1px solid var(--border);border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;color:var(--t1);}
  .link-grid a:hover{background:var(--accent-soft);border-color:var(--accent);color:var(--accent);text-decoration:none;}

  /* Footnote */
  .footer-line{margin-top:40px;padding-top:18px;border-top:1px solid var(--border-soft);font-size:12px;color:var(--t3);line-height:1.6;max-width:720px;}
  .footer-line a{color:var(--t3);text-decoration:underline;}
`;

// Format a Date-ish to "Month YYYY" — used for the "Last updated" stamp.
function monthYear(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-CA", { month:"long", year:"numeric" });
  } catch { return ""; }
}

export default function NeighbourhoodPage({ hood, city, onBack }) {
  const [submissions, setSubmissions] = useState({});
  const [lastSubmittedAt, setLastSubmittedAt] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cutoff = new Date();
    cutoff.setFullYear(new Date().getFullYear() - 2);
    Promise.all([
      // Per-unit counts (drives the snapshot table's confidence labels)
      ...Object.keys(UNIT_LABELS).map(unit =>
        supabase.from("rent_submissions")
          .select("monthly_rent", { count:"exact", head:false })
          .eq("city", city.key)
          .eq("neighborhood", hood.name)
          .eq("unit_type", unit)
          .gte("monthly_rent", 500).lte("monthly_rent", 8000)
          .gte("created_at", cutoff.toISOString())
          .then(({ data, count }) => ({ unit, count: count || 0, data: data || [] }))
      ),
      // Most recent submission for this neighbourhood — drives "Last updated"
      supabase.from("rent_submissions")
        .select("created_at")
        .eq("city", city.key)
        .eq("neighborhood", hood.name)
        .order("created_at", { ascending: false })
        .limit(1)
        .then(({ data }) => ({ latest: data?.[0]?.created_at || null })),
    ]).then(results => {
      const latest = results.pop();
      const m = {};
      results.forEach(r => { m[r.unit] = { count: r.count, conf: getConf(r.count) }; });
      setSubmissions(m);
      setLastSubmittedAt(latest.latest);
      setReady(true);
    });
  }, [hood.name, city.key]);

  // Neighbourhood-specific metadata (title, description, canonical, OpenGraph,
  // Twitter). Each neighbourhood page is the canonical SEO surface for
  // "average rent in <hood>, <city>" queries.
  useEffect(() => {
    const slug = hood.slug || hood.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const url       = `${city.calcUrl}/${slug}`;
    const fullTitle = `Average rent in ${hood.name}, ${city.name} | FairRent Canada`;
    const desc      = `See what renters pay in ${hood.name}, ${city.name}. Compare your rent against CMHC data, market listings and anonymous submissions from renters who live here. Free. Anonymous. No sign-up.`;

    const prevTitle = document.title;
    document.title = fullTitle;

    const setMeta = (sel, attr, value) => {
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        const [k, v] = sel.replace(/[\[\]"]/g, '').split('=');
        el.setAttribute(k, v);
        document.head.appendChild(el);
      }
      const prev = el.getAttribute(attr);
      el.setAttribute(attr, value);
      return prev;
    };
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      const prev = el.getAttribute('href');
      el.setAttribute('href', href);
      return prev;
    };

    const prevDesc = setMeta('meta[name="description"]', 'content', desc);
    const prevOgT  = setMeta('meta[property="og:title"]', 'content', fullTitle);
    const prevOgD  = setMeta('meta[property="og:description"]', 'content', desc);
    const prevOgU  = setMeta('meta[property="og:url"]', 'content', url);
    const prevOgTy = setMeta('meta[property="og:type"]', 'content', 'article');
    const prevTwT  = setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    const prevTwD  = setMeta('meta[name="twitter:description"]', 'content', desc);
    const prevTwC  = setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    const prevCan  = setLink('canonical', url);

    return () => {
      document.title = prevTitle;
      if (prevDesc != null) setMeta('meta[name="description"]', 'content', prevDesc);
      if (prevOgT  != null) setMeta('meta[property="og:title"]', 'content', prevOgT);
      if (prevOgD  != null) setMeta('meta[property="og:description"]', 'content', prevOgD);
      if (prevOgU  != null) setMeta('meta[property="og:url"]', 'content', prevOgU);
      if (prevOgTy != null) setMeta('meta[property="og:type"]', 'content', prevOgTy);
      if (prevTwT  != null) setMeta('meta[name="twitter:title"]', 'content', prevTwT);
      if (prevTwD  != null) setMeta('meta[name="twitter:description"]', 'content', prevTwD);
      if (prevTwC  != null) setMeta('meta[name="twitter:card"]', 'content', prevTwC);
      if (prevCan  != null) setLink('canonical', prevCan);
    };
  }, [hood.name, hood.slug, city.name, city.calcUrl]);

  const totalSubmissions = Object.values(submissions).reduce((a, b) => a + b.count, 0);
  const pct = hood.vsAvgPct;
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

  // Honest "last updated": use the latest local submission if any, otherwise
  // fall back to the current month (the CMHC + market data are refreshed
  // continuously in our backend).
  const lastUpdated = lastSubmittedAt ? monthYear(lastSubmittedAt) : monthYear(new Date().toISOString());

  const checkUrl = `${city.calcUrl}?hood=${encodeURIComponent(hood.name)}`;
  const mapUrl   = `https://fairrent.ca/map?city=${city.key}`;
  const methodologyUrl = "https://fairrent.ca/methodology";
  const privacyUrl     = "https://fairrent.ca/privacy";

  const oneBrRange = getRangeForUnit(city.bases["1br"], hood.hoodMult, "Strong");
  const pctDir = pct > 0 ? "above" : pct < 0 ? "below" : "in line with";
  const pctStr = pct !== 0 ? `${Math.abs(pct)}% ${pctDir}` : "in line with";
  const submitInfo = ready
    ? totalSubmissions >= 20
      ? `${hood.name} has strong local data with ${totalSubmissions} recent submissions. Estimates blend CMHC data with real rents reported by renters here.`
      : totalSubmissions >= 8
      ? `${hood.name} has growing local data with ${totalSubmissions} recent submissions. Confidence improves as more renters submit.`
      : totalSubmissions >= 1
      ? `${hood.name} has limited local data so far (${totalSubmissions} submission${totalSubmissions === 1 ? "" : "s"}). Estimates rely primarily on CMHC and Rentals.ca data.`
      : `We are still building stronger data coverage for ${hood.name}. Add your rent anonymously to improve this page.`
    : "Loading local data.";

  const faqs = [
    {
      q: `What is the average rent in ${hood.name}?`,
      a: `The estimated fair range for a 1 bedroom in ${hood.name} is ${fmt(oneBrRange.low)} to ${fmt(oneBrRange.high)} per month, based on CMHC data and Rentals.ca market listings. ${hood.name} rents run ${pctStr} the ${city.name} average for comparable units. See the snapshot table above for all unit types.`,
    },
    {
      q: `Is ${hood.name} more expensive than the rest of ${city.name}?`,
      a: `${compareLine} Use this as a benchmark, not a final appraisal. Building age, condition, floor, and included amenities affect individual rents.`,
    },
    {
      q: "How does FairRent calculate rent benchmarks?",
      a: "We combine public CMHC Rental Market Survey data, Rentals.ca market listing data, and anonymous renter submissions. CMHC data is comprehensive but lags. Listings show asking rents. Anonymous submissions show what renters report paying. The blend gets more accurate as more renters contribute.",
    },
    {
      q: "Is my rent submission anonymous?",
      a: "Yes. We do not collect your name, email, address, phone, or IP. We store only your neighbourhood, unit type, monthly rent, move-in year, city, and whether parking or utilities are included. There is no way to trace a submission back to a person.",
    },
    {
      q: "Does FairRent show my exact address?",
      a: "No. We never display individual rent submissions publicly. We only show grouped data: ranges, medians, and confidence labels by neighbourhood and unit type. Your submission becomes one of many anonymous data points feeding the neighbourhood benchmark.",
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
      q: "Is this legal or financial advice?",
      a: "No. FairRent provides market estimates for information only. Results are not professional appraisals, legal opinions, or official determinations. For rent disputes or formal proceedings, consult a licensed paralegal or your provincial tenant rights organization.",
    },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:"var(--bg)" }}>

        <Nav
          homeHref="https://fairrent.ca"
          citySuffix={city.name}
          actions={{
            onBlog:           () => { window.location.href = "https://fairrent.ca/blog"; },
            onExploreCities:  () => { window.location.href = "https://fairrent.ca/"; },
            onNeighbourhoods: () => { window.location.href = mapUrl; },
            onSubmitRent:     () => { window.location.href = checkUrl; },
            onAbout:          () => { window.location.href = "https://fairrent.ca/about"; },
            onToggleLang:     () => {},
          }}
          labels={{
            blog:           "Blog",
            cities:         "Cities",
            neighbourhoods: "Neighbourhoods",
            submit:         "Share my rent",
            about:          "About",
            primaryCta:     "Share my rent",
            langLabel:      "Français",
            menu:           "Menu",
            close:          "Close",
          }}
        />

        <div className="hood-wrap">

          {/* Inline breadcrumb */}
          <div className="hood-crumb">
            <a href="https://fairrent.ca">FairRent</a>
            <span className="sep">/</span>
            <a href={city.calcUrl}>{city.name}</a>
            <span className="sep">/</span>
            <span>{hood.name}</span>
            <span className="sep">·</span>
            <button className="hood-back" onClick={onBack}>All {city.name} neighbourhoods</button>
          </div>

          {/* HERO */}
          <section className="hood-hero">
            <div className="hood-eyebrow">{city.name} · Neighbourhood</div>
            <h1 className="hood-title">Rent data for {hood.name}</h1>
            <p className="hood-sub">Compare rents in {hood.name} using public CMHC data, Rentals.ca market listings, and anonymous submissions from renters who live here.</p>
            <div className="hood-meta">
              <span><strong>City:</strong> {city.name}, {city.province}</span>
              <span className="meta-sep">·</span>
              <span><strong>Last updated:</strong> {lastUpdated}</span>
              {ready && totalSubmissions > 0 && (
                <>
                  <span className="meta-sep">·</span>
                  <span><strong>{totalSubmissions}</strong> local submission{totalSubmissions === 1 ? "" : "s"}</span>
                </>
              )}
            </div>
            <p className="hood-vs"><strong>{hood.name} rents</strong> are {vsText}.</p>
            <div className="hood-cta-row">
              <a className="btn btn-primary" href={checkUrl}>Share my rent in {hood.name}</a>
              <a className="btn btn-ghost" href={mapUrl}>Explore the {city.name} map</a>
            </div>
          </section>

          {/* RENT SNAPSHOT */}
          <section className="section">
            <div className="sh">Rent snapshot</div>
            <h2 className="h2">Estimated fair rent in {hood.name}</h2>
            <div className="snap-card">
              <table className="snap-table">
                <thead>
                  <tr>
                    <th>Unit type</th>
                    <th>Estimated range / mo</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(UNIT_LABELS).map(([key, label]) => {
                    const conf = ready ? (submissions[key]?.conf || getConf(0)) : getConf(0);
                    const r = getRangeForUnit(city.bases[key] || city.bases["1br"], hood.hoodMult, conf.label);
                    return (
                      <tr key={key}>
                        <td>{label}</td>
                        <td>{fmt(r.low)} to {fmt(r.high)}</td>
                        <td><span className={"conf " + conf.cls}>{conf.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="src-line">Ranges combine CMHC Rental Market Survey, Rentals.ca market listings, and anonymous renter submissions. Confidence rises as more renters in {hood.name} submit. Last updated {lastUpdated}.</p>
            {ready && totalSubmissions === 0 && (
              <div className="data-notice">
                <strong>We are still building stronger data coverage for {hood.name}.</strong> Add your rent anonymously to improve this page. Estimates above are derived from CMHC and Rentals.ca data adjusted for {hood.name}.
              </div>
            )}
          </section>

          {/* Privacy note — inline, not a boxed callout */}
          <p className="privacy-line">
            <strong>Privacy comes first.</strong> We never collect your name or email and we never display individual rent submissions on this page. The numbers above are aggregated ranges across many anonymous submissions. <a href={privacyUrl}>Read the privacy policy</a>.
          </p>

          {/* LOCAL CONTEXT */}
          <section className="section">
            <div className="sh">Local context</div>
            <h2 className="h2">Are rents in {hood.name} high or low?</h2>
            <div className="body">
              <p>{compareLine}</p>
              <p>Listing rents show what landlords are asking. Anonymous renter submissions help show what people report paying. Use these numbers as a benchmark, not a final appraisal. Building age, condition, floor, and included amenities all affect individual rents.</p>
            </div>
          </section>

          {/* HELP IMPROVE */}
          <section className="section">
            <div className="help-card">
              <div className="sh">Help improve this page</div>
              <h2 className="h2">Help build better data for {hood.name}</h2>
              <p className="body">{submitInfo} Anonymous submissions make the {hood.name} benchmark sharper for the next renter who lands here.</p>
              <a className="btn btn-primary" href={checkUrl}>Share my rent in {hood.name}</a>
              <div className="microcopy">No name. No email. No sign-up. Takes about 60 seconds. We never display individual submissions.</div>
            </div>
          </section>

          {/* NEARBY */}
          {hood.nearbyHoods?.length > 0 && (
            <section className="section">
              <div className="sh">Compare</div>
              <h2 className="h2">Nearby neighbourhoods</h2>
              <p className="body" style={{ marginBottom: 12 }}>See how rents in {hood.name} compare with nearby {city.name} neighbourhoods.</p>
              <div className="pill-row">
                {hood.nearbyHoods.map(n => {
                  const nSlug = n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                  return <a key={n} className="pill" href={`/${nSlug}`}>{n}</a>;
                })}
              </div>
            </section>
          )}

          {/* DATA SOURCES */}
          <section className="section">
            <div className="sh">How this estimate was built</div>
            <h2 className="h2">Data sources</h2>
            <div className="data-block">
              <p className="body">This page combines three sources, in order of how much weight each carries once enough local data exists:</p>
              <ul>
                <li><strong>Anonymous renter submissions.</strong> Real rents reported by renters in {hood.name}.</li>
                <li><strong>CMHC Rental Market Survey.</strong> Annual data covering purpose-built rentals.</li>
                <li><strong>Rentals.ca market listings.</strong> Used for market context. Listings show asking rents, not necessarily signed rents.</li>
              </ul>
              <p className="body" style={{ marginTop: 12 }}>Results are grouped by neighbourhood and unit type. Individual submissions are never shown publicly.</p>
              <p className="src-line" style={{ marginTop: 14 }}>
                <a href={methodologyUrl} style={{ color:"var(--accent)", fontWeight:600 }}>Read the full methodology →</a>
              </p>
            </div>
          </section>

          {/* RENTER GUIDE */}
          <section className="section">
            <div className="sh">For renters</div>
            <h2 className="h2">Before renting in {hood.name}</h2>
            <p className="body" style={{ marginBottom: 12 }}>Practical things to check before signing or renewing a lease.</p>
            <ul className="check-list">
              <li><span className="dot"/><div><strong>Compare by unit type.</strong> Bachelor, 1 bedroom, and 2 bedroom rents vary widely in {hood.name}. Use the snapshot table above for the right benchmark.</div></li>
              <li><span className="dot"/><div><strong>Check what is included.</strong> A unit at the top of the range may include heat, water, or parking. A bare unit at the same price is more expensive in practice.</div></li>
              <li><span className="dot"/><div><strong>Ask about parking.</strong> Indoor parking can add $100 to $250 per month depending on the building.</div></li>
              <li><span className="dot"/><div><strong>Compare building age and condition.</strong> A renovated unit in a newer building often rents above the neighbourhood range.</div></li>
              <li><span className="dot"/><div><strong>Ask about rent increase rules.</strong> {rcLine}</div></li>
              <li><span className="dot"/><div><strong>Compare asking rent with reported rent.</strong> Listing sites show asking rents. Anonymous submissions help show what renters report paying.</div></li>
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
            <div className="sh">More from FairRent</div>
            <div className="link-grid">
              <a href={city.calcUrl}>Compare more {city.name} neighbourhoods →</a>
              <a href={mapUrl}>Explore the {city.name} rent map →</a>
              <a href={checkUrl}>Share my rent anonymously →</a>
              <a href={methodologyUrl}>How our benchmarks work →</a>
              <a href={privacyUrl}>Privacy policy →</a>
              <a href="https://fairrent.ca/faq">All FAQ →</a>
            </div>
          </section>

          <p className="footer-line">
            FairRent Canada · {city.name} Rent Calculator · {hood.name} rent data.<br/>
            Sources: CMHC Rental Market Survey (October 2024), Rentals.ca market listings (2025), anonymous renter submissions. Results are estimates only. Not legal, financial, or real estate advice. Last updated {lastUpdated}.<br/>
            <a href="https://fairrent.ca">fairrent.ca</a> · <a href={methodologyUrl}>Methodology</a> · <a href={privacyUrl}>Privacy</a> · <a href="https://fairrent.ca/contact">Contact</a>
          </p>
        </div>

        <Footer compact={true} citySuffix={city.name} />
      </div>
    </>
  );
}
