// BuildingRankingsPage.jsx
// City-level and neighbourhood-level building ranking pages for FairRent Canada.
//
// Props:
//   city        VANCOUVER_CITY object from hoodData.js
//   buildings   VANCOUVER_BUILDINGS array from buildingData.js
//   hood        optional - VANCOUVER_HOODS[key] object for neighbourhood filtering
//   onBack      fn - navigate back to main page
//   onSubmit    fn - scroll to / trigger submission form

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import {
  MIN_SUBS_FOR_AVG,
  MIN_SUBS_FOR_SCORE,
  getBuildingScoreLabel,
  getBuildingConfidence,
  calcBuildingScore,
  searchBuildings,
  VANCOUVER_NEIGHBOURHOODS,
} from "./buildingData";
import { lookupBuildingEstimate, getEstimateRatingTier } from "./buildingEstimates";

// Building-side neighbourhood keys that map to a given VANCOUVER_HOODS key.
// E.g. hoodKey "centretown" includes building-side hoods centretown,
// downtown, golden-triangle, little-italy, dows-lake.
function buildingHoodsFor(hoodKey) {
  return Object.entries(VANCOUVER_NEIGHBOURHOODS)
    .filter(([, v]) => v.hoodKey === hoodKey)
    .map(([k]) => k);
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const fmt = v => Number(v).toLocaleString("en-CA", {
  style: "currency", currency: "CAD", maximumFractionDigits: 0,
});

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
  :root {
    --serif: Charter, Georgia, "Iowan Old Style", "Times New Roman", serif;
    --sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --mono: "SF Mono", Menlo, Consolas, "Courier New", monospace;
    --bg:#f4f5f7; --white:#ffffff; --surface:#ffffff;
    --border:#e3e6ea; --border-soft:#eef0f3;
    --t1:#0d1418; --t2:#3b4753; --t3:#6a7682; --t4:#9aa4af;
    --accent:#0e7c3a; --accent-hover:#0a6630;
    --accent-soft:#eef7f1; --accent-line:#cfe6d8;
  }
  html,body,#root{margin:0;padding:0;width:100%;background:var(--bg);}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:var(--sans);font-size:15px;color:var(--t1);-webkit-font-smoothing:antialiased;line-height:1.55;}
  a{color:var(--accent);text-decoration:none;}
  a:hover{text-decoration:underline;}
  button:focus-visible,a:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:3px;}

  .br-wrap{max-width:960px;margin:0 auto;padding:24px 20px 72px;}
  @media(max-width:640px){.br-wrap{padding:18px 16px 56px;}}

  /* Breadcrumb */
  .br-crumb{font-size:13px;color:var(--t3);margin-bottom:20px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
  .br-crumb a,.br-crumb button{color:var(--t3);font-weight:500;background:none;border:none;cursor:pointer;font-family:inherit;font-size:13px;padding:0;text-decoration:none;}
  .br-crumb a:hover,.br-crumb button:hover{color:var(--accent);}
  .br-crumb .sep{color:var(--t4);}

  /* Hero */
  .br-hero{padding-bottom:28px;margin-bottom:28px;border-bottom:1px solid var(--border-soft);}
  .br-eyebrow{font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:0.14em;margin-bottom:10px;}
  .br-h1{font-family:var(--serif);font-size:clamp(26px,3.4vw,40px);font-weight:700;color:var(--t1);line-height:1.12;letter-spacing:-0.01em;margin-bottom:12px;max-width:800px;}
  .br-sub{font-size:15px;color:var(--t2);line-height:1.65;max-width:680px;margin-bottom:18px;}
  .br-cta-row{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;}
  .btn{display:inline-flex;align-items:center;justify-content:center;padding:11px 18px;font-size:14px;font-weight:600;border-radius:6px;border:1px solid transparent;font-family:inherit;cursor:pointer;text-decoration:none;line-height:1.2;}
  .btn:hover{text-decoration:none;}
  .btn-primary{background:var(--accent);color:#fff;border-color:var(--accent);}
  .btn-primary:hover{background:var(--accent-hover);color:#fff;}
  .btn-ghost{background:transparent;color:var(--t2);border-color:var(--border);}
  .btn-ghost:hover{border-color:var(--t3);color:var(--t1);}
  @media(max-width:560px){.br-cta-row .btn{flex:1 1 100%;}}

  /* Section headings */
  .br-section{margin-top:40px;}
  .br-sh{font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:0.14em;margin-bottom:8px;}
  .br-h2{font-family:var(--serif);font-size:clamp(20px,2.4vw,27px);font-weight:700;color:var(--t1);letter-spacing:-0.005em;line-height:1.25;margin-bottom:10px;}
  .br-body{font-size:15px;color:var(--t2);line-height:1.7;max-width:720px;}
  .br-body p+p{margin-top:10px;}

  /* Score methodology accordion */
  .meth-card{background:var(--surface);border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-top:16px;}
  .meth-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:none;border:none;cursor:pointer;font-family:inherit;text-align:left;gap:16px;}
  .meth-trigger-label{font-size:14px;font-weight:600;color:var(--t1);}
  .meth-icon{font-size:18px;color:var(--t3);font-weight:600;flex-shrink:0;}
  .meth-body{padding:0 18px 18px;display:flex;flex-direction:column;gap:12px;}
  .meth-row{display:flex;gap:12px;align-items:flex-start;}
  .meth-badge{flex-shrink:0;min-width:38px;background:var(--accent-soft);color:var(--accent);font-size:12px;font-weight:700;padding:3px 8px;border-radius:4px;text-align:center;}
  .meth-text{font-size:13.5px;color:var(--t2);line-height:1.55;}
  .meth-text strong{color:var(--t1);}

  /* Building search bar */
  .bsearch-wrap{margin-top:16px;}
  .bsearch-input{width:100%;padding:14px 16px;border:1px solid var(--border);background:#fff;font-size:16px;color:var(--t1);font-family:inherit;}
  .bsearch-input:focus{outline:2px solid var(--accent);outline-offset:-1px;border-color:var(--accent);}
  .bsearch-input::placeholder{color:var(--t4);}
  .bsearch-hint{margin-top:8px;font-size:12.5px;color:var(--t3);}

  /* Building cards grid */
  .buildings-grid{display:flex;flex-direction:column;gap:14px;margin-top:16px;}
  .results-meta{margin-top:14px;margin-bottom:6px;font-size:12.5px;color:var(--t3);}

  /* Building card */
  .bcard{background:var(--surface);border:1px solid var(--border);border-radius:8px;overflow:hidden;}
  .bcard-head{padding:14px 16px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;border-bottom:1px solid var(--border-soft);}
  .bcard-name{font-size:15px;font-weight:700;color:var(--t1);line-height:1.3;}
  .bcard-addr{font-size:12px;color:var(--t3);margin-top:2px;}
  .bcard-hood-tag{font-size:11px;font-weight:600;color:var(--t2);background:#f4f6f8;padding:3px 9px;border:1px solid var(--border);border-radius:3px;white-space:nowrap;margin-top:4px;display:inline-block;}
  .bcard-score-wrap{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;}
  .bcard-score-num{font-family:var(--mono);font-size:28px;font-weight:700;line-height:1;}
  .bcard-score-of{font-family:var(--mono);font-size:12px;font-weight:400;color:var(--t3);}
  .bcard-score-label{font-size:10px;font-weight:700;padding:2px 8px;border-radius:3px;text-align:right;white-space:nowrap;}
  .bcard-body{padding:14px 16px;display:flex;flex-direction:column;gap:10px;}
  .bcard-meta-row{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:12.5px;color:var(--t3);}
  .bcard-meta-row strong{color:var(--t1);font-weight:600;}
  .bcard-verdict{font-size:13.5px;color:var(--t2);line-height:1.6;}
  .bcard-conf{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:var(--t3);}
  .bcard-conf-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
  .bcard-cta{display:inline-flex;align-items:center;font-size:13px;font-weight:600;color:var(--accent);background:var(--accent-soft);border:1px solid var(--accent-line);padding:7px 12px;border-radius:6px;cursor:pointer;text-decoration:none;}
  .bcard-cta:hover{background:#dff0e6;border-color:#8ec9a5;text-decoration:none;}
  .bcard-placeholder{padding:14px 16px;background:#fafbfc;border-top:1px solid var(--border-soft);}
  .bcard-placeholder-lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--t4);margin-bottom:5px;}
  .bcard-placeholder-txt{font-size:13px;color:var(--t3);line-height:1.55;}

  /* Limited data notice */
  .limited-notice{padding:18px 20px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-top:16px;}
  .limited-notice strong{color:var(--t1);}

  /* Neighbourhood comparison table */
  .hood-table-wrap{overflow-x:auto;margin-top:14px;border:1px solid var(--border);border-radius:8px;}
  .hood-table{width:100%;border-collapse:collapse;font-size:13.5px;}
  .hood-table th{padding:11px 14px;background:#fbfcfd;border-bottom:1px solid var(--border);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--t3);text-align:left;white-space:nowrap;}
  .hood-table td{padding:12px 14px;border-bottom:1px solid var(--border-soft);color:var(--t1);vertical-align:middle;}
  .hood-table tr:last-child td{border-bottom:none;}
  .hood-table tr:hover td{background:#fafbfc;}
  .hood-link{background:none;border:none;cursor:pointer;color:var(--accent);font-size:13.5px;font-weight:600;font-family:inherit;padding:0;text-align:left;}
  .hood-link:hover{text-decoration:underline;}
  .tag-pill{display:inline-block;font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;}
  .tag-above-avg{background:#fdf8f0;color:#7a4f00;border:1px solid #e8c97a;}
  .tag-avg{background:#f0f7f2;color:#1a5c34;border:1px solid #a8d5b5;}
  .tag-below-avg{background:#f0f4fd;color:#1a3a8b;border:1px solid #a8b8e8;}

  /* FAQ */
  .faq-wrap{margin-top:14px;}
  .faq-item{border-bottom:1px solid var(--border-soft);}
  .faq-item:last-child{border-bottom:none;}
  .faq-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 0;background:none;border:none;cursor:pointer;text-align:left;gap:16px;font-family:inherit;}
  .faq-q{font-size:14px;font-weight:600;color:var(--t1);line-height:1.45;}
  .faq-icon{font-size:18px;color:var(--t3);font-weight:600;flex-shrink:0;}
  .faq-a{font-size:13.5px;color:var(--t2);line-height:1.7;padding-bottom:14px;max-width:720px;}

  /* Help card */
  .help-card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:24px 22px;margin-top:16px;}
  .help-card p{margin-bottom:14px;}
  .help-microcopy{font-size:12.5px;color:var(--t3);margin-top:14px;line-height:1.6;}

  /* Disclaimer */
  .disclaimer{margin-top:36px;padding-top:18px;border-top:1px solid var(--border-soft);font-size:12px;color:var(--t3);line-height:1.65;max-width:720px;}

  @media(max-width:640px){
    .bcard-head{flex-direction:column;}
    .bcard-score-wrap{align-items:flex-start;flex-direction:row;align-items:center;gap:10px;}
    .bcard-score-num{font-size:22px;}
  }
`;

// ─── FAQ items ───────────────────────────────────────────────────────────────

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-trigger" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span className="faq-q">{q}</span>
        <span className="faq-icon">{open ? "-" : "+"}</span>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

// ─── Score methodology panel ──────────────────────────────────────────────────

function ScoreMethodology() {
  const [open, setOpen] = useState(false);
  const cats = [
    { pts: "35 pts", label: "Rent fairness", desc: "Compares the building's average rent to similar units in the same neighbourhood, adjusting for bedrooms, unit type, amenities, and building type. A building that prices fairly for its category scores well here, whether it is affordable or upscale." },
    { pts: "15 pts", label: "Value for location", desc: "Looks at whether the rent makes sense for where the building sits. Factors include transit access, walkability, distance to downtown, campus proximity, and local demand." },
    { pts: "15 pts", label: "Building features", desc: "Scores the amenities renters actually care about: in-unit laundry, parking, air conditioning, gym, concierge, elevator, balcony, pet friendliness, and storage." },
    { pts: "15 pts", label: "Market competitiveness", desc: "Compares the building to other active listings and renter submissions nearby. A building priced below similar buildings in the area scores higher here." },
    { pts: "10 pts", label: "Renter data confidence", desc: "Scores how reliable the ranking is based on how much renter data FairRent has collected for that building. More recent submissions from more renters means a more reliable score." },
    { pts: "10 pts", label: "Affordability pressure", desc: "Looks at whether the building is accessible relative to local income and typical renter budgets, especially near student campuses." },
  ];
  return (
    <div className="meth-card">
      <button className="meth-trigger" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="meth-trigger-label">How the FairRent Canada Score is calculated</span>
        <span className="meth-icon">{open ? "-" : "+"}</span>
      </button>
      {open && (
        <div className="meth-body">
          <p style={{ fontSize:13.5, color:"var(--t2)", lineHeight:1.6, marginBottom:4 }}>
            Every building score is out of 100. Scores are estimates based on anonymous renter submissions, public rental listings, and local market data. They are not official ratings.
          </p>
          {cats.map(c => (
            <div key={c.label} className="meth-row">
              <div className="meth-badge">{c.pts}</div>
              <div className="meth-text"><strong>{c.label}.</strong> {c.desc}</div>
            </div>
          ))}
          <p style={{ fontSize:12, color:"var(--t3)", lineHeight:1.6, marginTop:4 }}>
            Scores improve as more renters submit data. A building with fewer than 5 submissions shows "Limited data" rather than a score.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Building card ────────────────────────────────────────────────────────────

function BuildingCard({ building, score, estimate, hoodName, showHoodTag, onSubmit }) {
  const hasScore = score !== null && score !== undefined;
  const n = score?.submissions ?? 0;
  const conf = getBuildingConfidence(n);

  let scoreBadge = null;
  if (hasScore && n >= MIN_SUBS_FOR_SCORE) {
    const sl = getBuildingScoreLabel(score.total);
    scoreBadge = { ...sl, value: score.total };
  }

  // No real submissions yet: fall back to the seed estimate when we have one.
  // Always labelled "Estimated" + "Low confidence" per the public-wording spec.
  const estTier = (!scoreBadge && estimate) ? getEstimateRatingTier(estimate.score) : null;

  const amenityIcons = {
    elevator: "Elevator", gym: "Gym", pool: "Pool", concierge: "Concierge",
    parking: "Parking", laundry: "Laundry", balcony: "Balcony",
    storage: "Storage", "pet-friendly": "Pet friendly", ac: "A/C",
  };

  return (
    <div className="bcard">
      <div className="bcard-head">
        <div>
          <div className="bcard-name">{building.name}</div>
          <div className="bcard-addr">{building.address}</div>
          {showHoodTag && hoodName && (
            <div className="bcard-hood-tag">{hoodName}</div>
          )}
        </div>
        <div className="bcard-score-wrap">
          {scoreBadge ? (
            <>
              <div>
                <span className="bcard-score-num" style={{ color: scoreBadge.color }}>{scoreBadge.value}</span>
                <span className="bcard-score-of"> /100</span>
              </div>
              <div className="bcard-score-label" style={{ background: scoreBadge.bg, color: scoreBadge.color, border: `1px solid ${scoreBadge.border}` }}>
                {scoreBadge.label}
              </div>
            </>
          ) : estTier ? (
            <>
              <div>
                <span className="bcard-score-num" style={{ color: estTier.color }}>{estimate.score}</span>
                <span className="bcard-score-of"> /100</span>
              </div>
              <div className="bcard-score-label" style={{ background: estTier.bg, color: estTier.color, border: `1px solid ${estTier.border}` }}>
                Estimated
              </div>
            </>
          ) : (
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"var(--mono)", fontSize:13, fontWeight:700, color:"var(--t3)" }}>-</div>
              <div style={{ fontSize:10, fontWeight:700, color:"var(--t4)", textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>
                {n >= MIN_SUBS_FOR_AVG ? "Early score" : "Limited data"}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bcard-body">
        {/* Rent data */}
        {hasScore && n >= MIN_SUBS_FOR_AVG ? (
          <div className="bcard-meta-row">
            <span>Avg submitted rent: <strong>{fmt(score.avgRent)}/mo</strong></span>
            <span>Neighbourhood benchmark: <strong>{fmt(score.bench)}/mo</strong></span>
          </div>
        ) : (
          <div className="bcard-meta-row">
            <span style={{ color:"var(--t4)" }}>Rent data: not enough submissions yet</span>
          </div>
        )}

        {/* Amenities */}
        {building.amenities?.length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {building.amenities.map(a => (
              <span key={a} style={{ fontSize:11, padding:"2px 8px", background:"#f4f5f7", border:"1px solid #e3e6ea", borderRadius:999, color:"#6a7682" }}>
                {amenityIcons[a] ?? a}
              </span>
            ))}
          </div>
        )}

        {/* Verdict / explanation */}
        <div className="bcard-verdict">
          {hasScore && n >= MIN_SUBS_FOR_SCORE ? (
            <>
              Based on {n} anonymous submission{n !== 1 ? "s" : ""} and nearby listings, this building appears to be priced{" "}
              {score.rentRatio <= 0.95 ? "below or near" : score.rentRatio <= 1.10 ? "around" : "above"}{" "}
              the typical range for comparable rentals in {hoodName || "this area"}. The score is{" "}
              {conf.label.toLowerCase()} and may change as more renters submit data.
            </>
          ) : estTier ? (
            <>
              <strong>Estimated FairRent score · {estimate.confidence === "Very Low" ? "Very low" : estimate.confidence} confidence.</strong>{" "}
              Based on available market signals like neighbourhood, building type, and nearby rent pressure.
              Needs more renter submissions before we publish a verified score. Submit your rent anonymously to help.
            </>
          ) : (
            <>
              This building does not have enough renter-submitted data yet to show a reliable score.
              Every submission helps improve the ranking. If you live here, your anonymous rent helps other renters
              understand what is fair in this building.
            </>
          )}
        </div>

        {/* Confidence + last updated */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div className="bcard-conf">
            <span className="bcard-conf-dot" style={{ background: conf.dot }}/>
            {conf.label}
          </div>
          {n > 0 && (
            <span style={{ fontSize:11, color:"var(--t4)" }}>{n} submission{n !== 1 ? "s" : ""}</span>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Neighbourhood comparison table ──────────────────────────────────────────

function HoodComparisonTable({ hoods, cityBases, onHoodClick }) {
  const rows = Object.entries(hoods).map(([key, h]) => {
    const base1br = cityBases["1br"] ?? 2600;
    const est = Math.round(base1br * h.hoodMult);
    const diff = h.vsAvgPct;
    return { key, name: h.name, est, diff, slug: h.slug };
  });
  rows.sort((a, b) => b.est - a.est);

  return (
    <div className="hood-table-wrap">
      <table className="hood-table" aria-label="Neighbourhood rent comparison">
        <thead>
          <tr>
            <th>Neighbourhood</th>
            <th>Est. 1-bed benchmark</th>
            <th>vs. Vancouver average</th>
            <th>Building data</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.key}>
              <td>
                <button className="hood-link" onClick={() => onHoodClick(r.key, r.slug)}>
                  {r.name}
                </button>
              </td>
              <td style={{ fontVariantNumeric:"tabular-nums", fontWeight:600 }}>{fmt(r.est)}/mo</td>
              <td>
                <span className={"tag-pill " + (r.diff > 5 ? "tag-above-avg" : r.diff < -5 ? "tag-below-avg" : "tag-avg")}>
                  {r.diff > 0 ? "+" : ""}{r.diff}%
                </span>
              </td>
              <td style={{ fontSize:12, color:"var(--t3)" }}>Collecting</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const CITY_FAQS = [
  {
    q: "How does FairRent Canada score rental buildings?",
    a: "Each building gets a score out of 100 based on six categories: rent fairness (35 points), value for location (15 points), building features and amenities (15 points), market competitiveness (15 points), renter data confidence (10 points), and affordability pressure (10 points). Scores are estimates based on anonymous renter submissions and public rental listings. They are not official ratings.",
  },
  {
    q: "Why does my building show Limited data?",
    a: "A score only appears when FairRent has at least 5 renter submissions for that building. Fewer than that and we show Limited data to protect renter privacy and avoid misleading averages. The easiest way to improve your building's score is to submit your own rent anonymously.",
  },
  {
    q: "Can a high-priced building still score well?",
    a: "Yes. We do not punish a building just because it is expensive. A luxury building in Coal Harbour can still score well if its rent is fair compared to similar luxury buildings in the same neighbourhood. The score compares apples to apples, not luxury buildings to student apartments.",
  },
  {
    q: "How is this different from Yelp or Google Reviews?",
    a: "FairRent Canada focuses on rent data, not reviews. We collect anonymous rent amounts and building details from current and past tenants to build a data picture of what renters actually pay. We do not publish reviews, complaints, or accusations about landlords.",
  },
  {
    q: "Is my submission anonymous?",
    a: "Yes. We do not collect your name, unit number, email, or any details that could identify you. We group building-level data so individual submissions are never shown on their own. We need at least 3 submissions before showing any average, and at least 5 before publishing a score.",
  },
  {
    q: "Are these scores legal ratings or official findings?",
    a: "No. FairRent Canada scores are estimates for general comparison only. They are based on available market data and anonymous submissions. Nothing on this page is legal advice, an official building rating, or a finding about any landlord or property.",
  },
];

const HOOD_FAQS = [
  {
    q: "How are buildings ranked in this neighbourhood?",
    a: "Buildings are ranked using the FairRent Canada Score, which weighs rent fairness, location value, amenities, market competitiveness, submission count, and affordability. A building needs at least 5 renter submissions to appear with a score. All others show Limited data.",
  },
  {
    q: "Why do some buildings show no score?",
    a: "We need at least 5 anonymous rent submissions before we show a building-level score. This protects renter privacy and avoids misleading averages from too little data. Submit your rent and help your building get its first score.",
  },
  {
    q: "Does a higher score mean it is the cheapest building?",
    a: "Not exactly. A high score means the building appears to offer fair value for its category and location. An affordable building that is still overpriced for its area will score lower than an expensive building that prices fairly compared to similar buildings nearby.",
  },
];

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function BuildingRankingsPage({
  city,
  buildings,
  hood,
  hoodKey,
  allHoods,
  onBack,
  onSubmit,
  onHoodRankings,
}) {
  const [buildingScores, setBuildingScores] = useState({});
  const [scoresReady, setScoresReady] = useState(false);
  const [query, setQuery] = useState("");

  const isHoodPage = !!hood;
  // Match buildings via the building-side neighbourhood map: one hood key
  // (e.g. "centretown") covers several building-side hoods (centretown,
  // downtown, golden-triangle, little-italy, dows-lake, ...).
  const hoodBuildingKeys = isHoodPage ? buildingHoodsFor(hoodKey) : [];
  const pageBuildings = isHoodPage
    ? buildings.filter(b => hoodBuildingKeys.includes(b.neighbourhood))
    : buildings;

  // Fetch per-building submission counts from Supabase.
  // This requires the building_name column to exist in rent_submissions.
  // Until then, all buildings will show Limited data (which is fine and honest).
  useEffect(() => {
    const names = pageBuildings.map(b => b.address ? `${b.name} - ${b.address}` : b.name);
    if (!names.length) { setScoresReady(true); return; }

    supabase
      .from("rent_submissions")
      .select("building_name, monthly_rent, unit_type")
      .eq("city", city.key)
      .in("building_name", names)
      .gte("monthly_rent", 500)
      .lte("monthly_rent", 8000)
      .then(({ data }) => {
        if (!data?.length) { setScoresReady(true); return; }

        const grouped = {};
        data.forEach(row => {
          if (!row.building_name) return;
          if (!grouped[row.building_name]) grouped[row.building_name] = [];
          grouped[row.building_name].push(row);
        });
        setBuildingScores(grouped);
        setScoresReady(true);
      })
      .catch(() => setScoresReady(true));
  }, [city.key, hoodKey]);

  // Scroll to form / submit CTA
  function handleSubmitCta() {
    if (typeof onSubmit === "function") {
      onSubmit();
    } else {
      window.location.href = `https://${city.key}fairrent.ca/#form`;
    }
  }

  const pageTitle = isHoodPage
    ? `${hood.name} Rental Building Rankings`
    : `Vancouver Rental Building Rankings`;

  const pageSubtitle = isHoodPage
    ? `See how rental buildings in ${hood.name} compare on rent fairness, location value, amenities, and data confidence. Scores are based on anonymous renter submissions and public listings.`
    : `Compare large rental buildings across Vancouver using anonymous renter submissions, public rental listings, and local market data. Every score is an estimate, not an official rating.`;

  const totalBuildings = pageBuildings.length;

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
        <Nav
          homeHref="https://fairrent.ca"
          citySuffix="Vancouver"
          actions={{
            onBlog:           () => { window.location.href = "https://fairrent.ca/blog"; },
            onExploreCities:  () => { window.location.href = "https://fairrent.ca/"; },
            onNeighbourhoods: () => { window.location.href = "https://fairrent.ca/map?city=vancouver"; },
            onSubmitRent:     handleSubmitCta,
            onAbout:          () => { window.location.href = "https://fairrent.ca/about"; },
          }}
          labels={{ primaryCta: "Submit my rent" }}
        />

        <div className="br-wrap">

          {/* Breadcrumb */}
          <div className="br-crumb">
            <button onClick={onBack}>Vancouver</button>
            {isHoodPage && (
              <>
                <span className="sep">/</span>
                <button onClick={() => onHoodRankings ? onHoodRankings(null) : onBack()}>Building rankings</button>
                <span className="sep">/</span>
                <span>{hood.name}</span>
              </>
            )}
            {!isHoodPage && (
              <>
                <span className="sep">/</span>
                <span>Building rankings</span>
              </>
            )}
          </div>

          {/* Hero */}
          <section className="br-hero">
            <div className="br-eyebrow">FairRent Canada - Vancouver</div>
            <h1 className="br-h1">{pageTitle}</h1>
            <p className="br-sub">{pageSubtitle}</p>
            <div className="br-cta-row">
              <button className="btn btn-primary" onClick={onBack}>
                Check my rent
              </button>
            </div>
            <p style={{ fontSize:12, color:"var(--t3)", lineHeight:1.6 }}>
              {scoresReady
                ? `Search across ${totalBuildings} rental building${totalBuildings !== 1 ? "s" : ""} ${isHoodPage ? `in ${hood.name}` : "in Vancouver"}. Scores improve as renters submit data.`
                : "Loading building data..."}
            </p>
          </section>

          {/* Score methodology */}
          <section className="br-section">
            <div className="br-sh">About the score</div>
            <ScoreMethodology />
          </section>

          {/* Building rankings — search-first */}
          <section className="br-section" id="rankings">
            <div className="br-sh">Find a building</div>
            <h2 className="br-h2">
              {isHoodPage
                ? `Search rental buildings in ${hood.name}`
                : "Search Vancouver rental buildings"}
            </h2>
            <div className="br-body">
              <p>
                {isHoodPage
                  ? `Type a building name or address to see how it compares. Scores are based on anonymous renter submissions and public market data. Buildings with fewer than 5 submissions show as Limited data.`
                  : "Type a building name or address to see how it compares. Scores are based on anonymous renter submissions and public market data. Buildings with fewer than 5 submissions show as Limited data."}
              </p>
            </div>

            <div className="bsearch-wrap">
              <input
                className="bsearch-input"
                type="text"
                placeholder={isHoodPage ? `Search buildings in ${hood.name}…` : "Search building name or address…"}
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search buildings"
              />
              <div className="bsearch-hint">
                {query.trim()
                  ? "Showing the closest matches. Click a building to focus its details."
                  : `Tip: try a name like "SoHo" or an address like "340 Queen". Or browse the top buildings below.`}
              </div>
            </div>

            {!scoresReady ? (
              <div style={{ padding:"24px", textAlign:"center", color:"var(--t3)", fontSize:14, marginTop:16 }}>
                Loading…
              </div>
            ) : pageBuildings.length === 0 ? (
              <div className="limited-notice" style={{ marginTop:16 }}>
                <strong>No buildings tracked yet in this area.</strong>{" "}
                If you rent in this neighbourhood, share your rent on the calculator to get the ranking started.
              </div>
            ) : (() => {
              const restrictedHoodKey = isHoodPage ? hoodKey : null;
              const trimmed = query.trim();
              // Empty query: show top 10 from the page pool (priority order).
              // Non-empty: full searchBuildings ranking, then filter to page pool if hood-scoped.
              let results;
              if (!trimmed) {
                results = pageBuildings.slice(0, 10);
              } else {
                const raw = searchBuildings(trimmed, restrictedHoodKey, 30);
                results = isHoodPage
                  ? raw.filter(b => hoodBuildingKeys.includes(b.neighbourhood)).slice(0, 10)
                  : raw.slice(0, 10);
              }
              return results.length === 0 ? (
                <div className="limited-notice" style={{ marginTop:16 }}>
                  <strong>No matches.</strong> Try a different spelling, or share your rent so this building gets added.
                </div>
              ) : (
                <>
                  <div className="results-meta">
                    {trimmed
                      ? `${results.length} match${results.length === 1 ? "" : "es"} for "${trimmed}"`
                      : `Top ${results.length} ${isHoodPage ? hood.name : "Vancouver"} building${results.length === 1 ? "" : "s"}`}
                  </div>
                  <div className="buildings-grid">
                    {results.map(b => {
                      const key = b.address ? `${b.name} - ${b.address}` : b.name;
                      const subs = buildingScores[key] || [];
                      const bHood = VANCOUVER_NEIGHBOURHOODS[b.neighbourhood];
                      const hoodObj = bHood?.hoodKey && allHoods ? allHoods[bHood.hoodKey] : null;
                      const hoodName = bHood?.name ?? b.neighbourhood;
                      const hoodMult = hoodObj?.hoodMult ?? 1;
                      let score = null;
                      if (subs.length >= MIN_SUBS_FOR_AVG) {
                        const avgRent = Math.round(subs.reduce((s, r) => s + r.monthly_rent, 0) / subs.length);
                        const bench = Math.round((city.bases?.["1br"] ?? 2600) * hoodMult);
                        if (subs.length >= MIN_SUBS_FOR_SCORE) {
                          const fullScore = calcBuildingScore({
                            building: b,
                            submissions: subs,
                            cityBaseBedroom: city.bases?.["1br"] ?? 2600,
                            hoodMult,
                          });
                          score = fullScore ? { ...fullScore, avgRent } : { submissions: subs.length, avgRent, bench, rentRatio: avgRent / bench };
                        } else {
                          score = { submissions: subs.length, avgRent, bench, rentRatio: avgRent / bench };
                        }
                      }
                      const estimate = lookupBuildingEstimate(b);
                      return (
                        <BuildingCard
                          key={b.id}
                          building={b}
                          score={score}
                          estimate={estimate}
                          hoodName={hoodName}
                          showHoodTag={!isHoodPage}
                          onSubmit={handleSubmitCta}
                        />
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </section>

          {/* Community CTA */}
          <section className="br-section">
            <div className="help-card">
              <div className="br-sh">Why your submission matters</div>
              <h2 className="br-h2">Help improve these rankings</h2>
              <p className="br-body">
                Every score on this page gets better when more renters submit data.
                Right now most buildings show Limited data because we do not have enough anonymous submissions
                to build a reliable picture. You can change that in under a minute.
              </p>
              <p className="br-body">
                Your submission is completely anonymous. We never show your name, unit number,
                or any details that could identify you. We group all data before publishing it.
              </p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:16 }}>
                <button className="btn btn-primary" onClick={onBack}>Check my rent</button>
              </div>
              <p className="help-microcopy">
                Anonymous - No signup - Your submission helps other Vancouver renters understand what is fair.
              </p>
            </div>
          </section>

          {/* Neighbourhood comparison table (city page only) */}
          {!isHoodPage && allHoods && (
            <section className="br-section">
              <div className="br-sh">Neighbourhood comparison</div>
              <h2 className="br-h2">Vancouver rent by neighbourhood</h2>
              <div className="br-body">
                <p>
                  Rent varies dramatically across Metro Vancouver. Coal Harbour, Yaletown, and Kitsilano
                  typically run well above the city average. New Westminster, Richmond, and Burnaby offer more
                  affordable options closer to or below average. Click any neighbourhood to see
                  its building rankings.
                </p>
              </div>
              <HoodComparisonTable
                hoods={allHoods}
                cityBases={city.bases}
                onHoodClick={(key, slug) => {
                  if (typeof onHoodRankings === "function") onHoodRankings(key);
                }}
              />
              <p style={{ fontSize:12, color:"var(--t3)", marginTop:10, lineHeight:1.6 }}>
                Benchmarks estimated from CMHC 2025 Rental Market Report and Rentals.ca. Figures represent
                1-bedroom medians and are not a guarantee of what you will find listed.
              </p>
            </section>
          )}

          {/* Neighbourhood tips (hood page only) */}
          {isHoodPage && hood.localTips?.length > 0 && (
            <section className="br-section">
              <div className="br-sh">What renters should know in {hood.name}</div>
              <h2 className="br-h2">Local renter tips</h2>
              <ul style={{ listStyle:"none", padding:0, marginTop:10, display:"flex", flexDirection:"column", gap:0 }}>
                {hood.localTips.map((tip, i) => (
                  <li key={i} style={{ padding:"12px 0", borderBottom: i < hood.localTips.length - 1 ? "1px solid var(--border-soft)" : "none", display:"flex", gap:12, alignItems:"flex-start" }}>
                    <span style={{ flexShrink:0, width:6, height:6, borderRadius:"50%", background:"var(--accent)", marginTop:9 }}/>
                    <span style={{ fontSize:14.5, color:"var(--t2)", lineHeight:1.65 }}>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* FAQ */}
          <section className="br-section">
            <div className="br-sh">Common questions</div>
            <h2 className="br-h2">FAQ</h2>
            <div className="faq-wrap">
              {(isHoodPage ? HOOD_FAQS : CITY_FAQS).map(f => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </section>

          {/* Internal links */}
          <section className="br-section">
            <div className="br-sh">More from FairRent Canada</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:10, marginTop:10 }}>
              {[
                { label: "Check if your rent is fair", href: "#", fn: onBack },
                { label: "Browse Vancouver neighbourhoods", href: "https://fairrent.ca/map?city=vancouver" },
                { label: "How we calculate scores", href: "https://fairrent.ca/methodology" },
                { label: "Privacy policy", href: "https://fairrent.ca/privacy" },
              ].map(l => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={l.fn ? e => { e.preventDefault(); l.fn(); } : undefined}
                  style={{ display:"block", padding:"12px 16px", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:6, fontSize:14, fontWeight:600, color:"var(--t1)", textDecoration:"none" }}
                  onMouseOver={e => { e.currentTarget.style.background = "var(--accent-soft)"; e.currentTarget.style.color = "var(--accent)"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--t1)"; }}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </section>

          {/* Brand protection disclaimer */}
          <div className="disclaimer">
            <strong>About these scores.</strong> FairRent Canada scores are estimates based on available market data,
            public rental listings, and anonymous renter submissions. Scores are not official ratings,
            legal findings, or guarantees. They are meant to help renters compare options and
            understand local rent patterns. Building rankings should be treated as general guidance,
            not a recommendation for or against any specific building or landlord.
            Scores change as new data comes in. When data is limited, scores show as "Limited data"
            or "Early score" rather than a number.
            <br/><br/>
            Data sources: CMHC 2025 Rental Market Report, Rentals.ca February 2025, anonymous renter submissions.
          </div>

        </div>

        <Footer compact={false} citySuffix="Vancouver" />
      </div>
    </>
  );
}
