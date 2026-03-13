import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const CITY         = "vancouver";
const COOLDOWN_KEY = "vancouver_fair_rent_last_submit";
const COOLDOWN_MS  = 60_000;
const MIN_RENT     = 500;
const MAX_RENT     = 8000;
const CUTOFF_YEARS = 2;

// ─── Market data ──────────────────────────────────────────────────────────────
const BASE_AVERAGES = {
  "bachelor": 1950,
  "1br": 2600,
  "2br": 3400,
  "3br": 4300,
  "3plus": 5200
};

const HOOD_MULTIPLIERS = {
  "Burnaby": 0.93,
  "Cambie": 1.08,
  "Chinatown": 0.89,
  "Coal Harbour": 1.35,
  "Commercial Drive": 0.97,
  "Downtown": 1.2,
  "Dunbar": 1.14,
  "Fairview": 1.1,
  "Fraser": 0.95,
  "Gastown": 1,
  "Grandview Woodland": 0.98,
  "Hastings Sunrise": 0.94,
  "Kerrisdale": 1.16,
  "Kitsilano": 1.22,
  "Main Street": 1.02,
  "Marpole": 0.87,
  "Mount Pleasant": 1.04,
  "New Westminster": 0.9,
  "North Vancouver": 1.07,
  "Oakridge": 1.05,
  "Point Grey": 1.3,
  "Richmond": 0.92,
  "Riley Park": 1.01,
  "Shaughnessy": 1.28,
  "South Granville": 1.12,
  "Strathcona": 0.91,
  "Sunset": 0.88,
  "West End": 1.18,
  "West Vancouver": 1.38,
  "Yaletown": 1.25
};

const UNIT_TYPES = [
  { label: "Bachelor / Studio", key: "bachelor" },
  { label: "1 Bedroom",         key: "1br"      },
  { label: "2 Bedroom",         key: "2br"      },
  { label: "3 Bedroom",         key: "3br"      },
  { label: "3+ Bedroom",        key: "3plus"    },
];

const ADDON_COSTS = { parking: 250, utilities: 120 };
const YEARLY_INFLATION = 0.04;
const NEIGHBORHOODS = Object.keys(HOOD_MULTIPLIERS).sort((a, b) => a.localeCompare(b));

// BC: flat guideline cap (3% for 2025)
function calcGuidelineCap(moveInRent, moveInYear) {
  const curYear = new Date().getFullYear();
  const years = Math.max(0, curYear - moveInYear);
  return Math.round(moveInRent * Math.pow(1.03, years));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const currency = (v) =>
  Number(v).toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

const pct = (actual, bench) =>
  !bench ? 0 : Math.round(((actual - bench) / bench) * 100);

function getMarket(neighborhood, unitType, moveInYear, parking, utilities) {
  const base     = BASE_AVERAGES[unitType] ?? BASE_AVERAGES["1br"];
  const mult     = HOOD_MULTIPLIERS[neighborhood] ?? 1;
  const addons   = (parking ? ADDON_COSTS.parking : 0) + (utilities ? ADDON_COSTS.utilities : 0);
  const curYear  = new Date().getFullYear();
  const yearsAgo = Math.max(0, curYear - moveInYear);
  const today    = Math.round(base * mult) + addons;
  const movein   = Math.round(base * mult * Math.pow(1 - YEARLY_INFLATION, yearsAgo)) + addons;
  const inflationTracked = Math.round(movein * Math.pow(1 + YEARLY_INFLATION, yearsAgo));
  return { today, movein, inflationTracked };
}

function communityWeight(n) {
  if (n < 5)  return 0;
  if (n < 10) return 0.2;
  if (n < 20) return 0.4;
  if (n < 50) return 0.6;
  return 0.8;
}

function median(arr) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function getVerdict(p) {
  if (p >  20) return { label: "Well Above Market", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", pill: "#fee2e2" };
  if (p >   5) return { label: "Above Market",      color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", pill: "#ffedd5" };
  if (p >= -5) return { label: "At Market Rate",    color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", pill: "#dcfce7" };
  if (p >= -15) return { label: "Below Market",     color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", pill: "#dbeafe" };
  return              { label: "Well Below Market", color: "#7c3aed", bg: "#faf5ff", border: "#ddd6fe", pill: "#ede9fe" };
}

function useCountUp(target, dur = 1000) {
  const [val, set] = useState(0);
  const raf = useRef(null);
  const prev = useRef(0);
  useEffect(() => {
    if (!target) return;
    const from = prev.current;
    prev.current = target;
    let t0 = null;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      set(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return val;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const curYear = new Date().getFullYear();

  // Form
  const [neighborhood, setNeighborhood] = useState("");
  const [unitType,     setUnitType]     = useState("");
  const [rent,         setRent]         = useState("");
  const [moveInYear,   setMoveInYear]   = useState("");
  const [parking,      setParking]      = useState(false);
  const [utilities,    setUtilities]    = useState(false);
  
  const [errors,       setErrors]       = useState({});

  // Results
  const [result,      setResult]      = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [saveWarning, setSaveWarning] = useState("");
  const [revealed,    setRevealed]    = useState(false);
  const [shareOpen,   setShareOpen]   = useState(false);
  const [copied,      setCopied]      = useState(false);

  // Counts
  const [realCount,   setRealCount]   = useState(0);
  const [countLoaded, setCountLoaded] = useState(false);
  const displayCount = useCountUp(countLoaded ? realCount : 0);

  // Smart benchmark
  const [smartBenchmark, setSmartBenchmark] = useState(null);
  const [benchSource,    setBenchSource]    = useState("baseline");
  const [communityCount, setCommunityCount] = useState(0);

  const copyRef = useRef(null);

  // Load city submission count
  useEffect(() => {
    supabase
      .from("rent_submissions")
      .select("*", { count: "exact", head: true })
      .eq("city", CITY)
      .then(({ count, error }) => {
        if (!error) setRealCount(count ?? 0);
        setCountLoaded(true);
      });
  }, []);

  // Load smart benchmark whenever neighbourhood + unit changes
  useEffect(() => {
    if (!neighborhood || !unitType) {
      setSmartBenchmark(null);
      setBenchSource("baseline");
      setCommunityCount(0);
      return;
    }
    const cutoff = new Date();
    cutoff.setFullYear(curYear - CUTOFF_YEARS);
    supabase
      .from("rent_submissions")
      .select("monthly_rent")
      .eq("city", CITY)
      .eq("neighborhood", neighborhood)
      .eq("unit_type", unitType)
      .gte("monthly_rent", MIN_RENT)
      .lte("monthly_rent", MAX_RENT)
      .gte("created_at", cutoff.toISOString())
      .then(({ data, error }) => {
        const baseline = Math.round((BASE_AVERAGES[unitType] ?? BASE_AVERAGES["1br"]) * (HOOD_MULTIPLIERS[neighborhood] ?? 1));
        if (error || !data?.length) {
          setSmartBenchmark(baseline); setBenchSource("baseline"); setCommunityCount(0); return;
        }
        const rents = data.map(r => r.monthly_rent);
        const med   = median(rents);
        const n     = rents.length;
        const w     = communityWeight(n);
        setCommunityCount(n);
        if (w === 0) { setSmartBenchmark(baseline); setBenchSource("baseline"); return; }
        const blended = Math.round(baseline * (1 - w) + med * w);
        setSmartBenchmark(blended);
        setBenchSource(w >= 0.6 ? "community" : "blended");
      });
  }, [neighborhood, unitType]);

  useEffect(() => {
    if (result) setTimeout(() => setRevealed(true), 40);
    else setRevealed(false);
  }, [result]);

  function validate() {
    const e = {};
    if (!neighborhood)                                         e.neighborhood = "Select a neighbourhood";
    if (!unitType)                                             e.unitType     = "Select a unit type";
    if (!rent || isNaN(+rent) || +rent < 300)                 e.rent         = "Enter a valid monthly rent";
    const yr = +moveInYear;
    if (!moveInYear || yr < 1980 || yr > curYear)             e.moveInYear   = `Enter a year between 1980–${curYear}`;
    
    return e;
  }

  async function handleCalculate() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSaveWarning("");
    setSubmitting(true);
    setShareOpen(false);

    const rentNum    = +rent;
    const moveInNum  = +moveInYear;
    const addons     = (parking ? ADDON_COSTS.parking : 0) + (utilities ? ADDON_COSTS.utilities : 0);
    const sameYear   = moveInNum === curYear;
    const { today: todayBaseline, movein, inflationTracked } = getMarket(neighborhood, unitType, moveInNum, parking, utilities);
    const todayBench  = smartBenchmark != null ? (smartBenchmark + addons) : todayBaseline;
    const moveinBench = sameYear ? todayBench : movein;

    // Guideline cap calculation
    const guidelineCap = sameYear ? null : calcGuidelineCap(moveinBench, moveInNum);

    setResult({
      rent: rentNum, todayBench, moveinBench, inflationTracked, sameYear,
      todayPct:  pct(rentNum, todayBench),
      moveinPct: pct(rentNum, moveinBench),
      todayDiff: rentNum - todayBench,
      moveinDiff: rentNum - moveinBench,
      guidelineCap,
      isRentControlled: true,
      benchSource, communityCount, moveInYear: moveInNum,
    });

    try {
      const last = Number(localStorage.getItem(COOLDOWN_KEY) ?? 0);
      if (Date.now() - last >= COOLDOWN_MS) {
        const { error } = await supabase.from("rent_submissions").insert({
          neighborhood, unit_type: unitType, monthly_rent: rentNum,
          move_in_year: moveInNum, includes_parking: parking,
          includes_utilities: utilities, city: CITY,
        });
        if (!error) { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); setRealCount(p => p + 1); }
        else setSaveWarning("Result shown — submission not saved.");
      }
    } catch { setSaveWarning("Result shown — submission not saved."); }
    finally  { setSubmitting(false); }
  }

  function handleReset() {
    setResult(null); setNeighborhood(""); setUnitType(""); setRent(""); setMoveInYear("");
    setParking(false); setUtilities(false);
    
    setErrors({}); setSaveWarning(""); setShareOpen(false);
  }

  function getShareText() {
    const u = UNIT_TYPES.find(u => u.key === unitType)?.label?.toLowerCase() ?? "unit";
    return `Vancouver Rent Check: ${result.todayPct > 0 ? "+" : ""}${result.todayPct}% vs market for a ${u} in ${neighborhood}. vancouverfairrent.ca`;
  }

  function copyLink() {
    navigator.clipboard?.writeText("https://vancouverfairrent.ca");
    setCopied(true);
    clearTimeout(copyRef.current);
    copyRef.current = setTimeout(() => setCopied(false), 2000);
  }

  const verdict     = result ? getVerdict(result.todayPct) : null;
  const benchLabel  = benchSource === "community" ? `Community · ${communityCount} submissions`
                    : benchSource === "blended"   ? `Blended · ${communityCount}+ CMHC`
                    : "CMHC baseline";

  // Shared input styles
  const inp = (err) => ({
    width: "100%", padding: "11px 14px",
    border: `1.5px solid ${err ? "#ef4444" : "#e2e8f0"}`,
    borderRadius: 8, fontSize: 15, fontFamily: "inherit",
    background: "#fff", color: "#0f172a", outline: "none",
    transition: "border-color .15s, box-shadow .15s", appearance: "none",
  });
  const sel = (err) => ({
    ...inp(err), paddingRight: 36, cursor: "pointer",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: "#0f172a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        html, body, #root { width: 100%; margin: 0; padding: 0; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input, select { font-family: inherit; }
        input:focus, select:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,.12) !important; outline: none; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }

        .fade-in { opacity: 0; transform: translateY(8px); animation: fadeUp .35s ease forwards; }
        @keyframes fadeUp { to { opacity: 1; transform: none; } }
        .d1 { animation-delay: .04s; } .d2 { animation-delay: .09s; }
        .d3 { animation-delay: .14s; } .d4 { animation-delay: .19s; }
        .d5 { animation-delay: .24s; }

        .btn-primary { width: 100%; padding: 13px; background: #0f172a; color: #fff; border: none; border-radius: 8px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: background .15s; letter-spacing: .01em; }
        .btn-primary:hover:not(:disabled) { background: #1e293b; }
        .btn-primary:disabled { opacity: .45; cursor: not-allowed; }

        .btn-ghost { padding: 11px 18px; background: #fff; color: #0f172a; border: 1.5px solid #e2e8f0; border-radius: 8px; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: border-color .15s, background .15s; }
        .btn-ghost:hover { border-color: #94a3b8; }

        .share-btn { display: flex; align-items: center; justify-content: center; padding: 10px; border-radius: 7px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 500; text-decoration: none; cursor: pointer; border: none; transition: opacity .15s; }
        .share-btn:hover { opacity: .82; }

        .stat-card { text-align: center; padding: 16px 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; }

        .option-btn { flex: 1; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; background: #fff; font-family: inherit; font-size: 13px; font-weight: 500; color: #475569; cursor: pointer; transition: all .15s; text-align: center; }
        .option-btn.selected { border-color: #06b6d4; background: #06b6d415; color: #0891b2; font-weight: 600; }
        .option-btn:hover:not(.selected) { border-color: #cbd5e1; }

        @media (max-width: 580px) {
          .g2, .g3, .gshare { grid-template-columns: 1fr !important; }
          .gcta { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{ background: "#0f172a", borderBottom: "1px solid #1e293b" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 3 }}>
                <a href="https://fairrent.ca" style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, background: "#06b6d4", borderRadius: 6, fontSize: 11, fontWeight: 800, color: "#0f172a", flexShrink: 0 }}>FR</a>
                <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-.02em" }}>Vancouver Rent Calculator</span>
              </div>
              <p style={{ fontSize: 12, color: "#64748b" }}>Free · anonymous · no account needed</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 500, color: "#06b6d4", lineHeight: 1 }}>
                {countLoaded ? displayCount.toLocaleString() : "—"}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#475569", marginTop: 2, letterSpacing: ".06em", textTransform: "uppercase" }}>submissions</div>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 700, margin: "0 auto", padding: "28px 20px 72px" }}>
        {!result ? (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>

            <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9" }}>
              <h1 style={{ fontSize: 19, fontWeight: 700, color: "#0f172a", letterSpacing: "-.02em", marginBottom: 5 }}>
                Is your Vancouver rent fair?
              </h1>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                Compare to CMHC benchmarks and anonymous community data. Takes 30 seconds.
              </p>
            </div>

            <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Row 1: neighbourhood + unit */}
              <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: ".04em", textTransform: "uppercase" }}>Neighbourhood</label>
                  <select value={neighborhood} onChange={e => setNeighborhood(e.target.value)} style={sel(errors.neighborhood)}>
                    <option value="">Select…</option>
                    {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  {errors.neighborhood && <span style={{ fontSize: 11, color: "#ef4444" }}>{errors.neighborhood}</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: ".04em", textTransform: "uppercase" }}>Unit Type</label>
                  <select value={unitType} onChange={e => setUnitType(e.target.value)} style={sel(errors.unitType)}>
                    <option value="">Select…</option>
                    {UNIT_TYPES.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                  </select>
                  {errors.unitType && <span style={{ fontSize: 11, color: "#ef4444" }}>{errors.unitType}</span>}
                </div>
              </div>

              {/* Row 2: rent + year */}
              <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: ".04em", textTransform: "uppercase" }}>Monthly Rent</label>
                  <input type="number" placeholder="e.g. 2200" value={rent} onChange={e => setRent(e.target.value)} style={inp(errors.rent)} />
                  {errors.rent && <span style={{ fontSize: 11, color: "#ef4444" }}>{errors.rent}</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: ".04em", textTransform: "uppercase" }}>Year Moved In</label>
                  <input type="number" placeholder={String(curYear)} value={moveInYear} onChange={e => setMoveInYear(e.target.value)} style={inp(errors.moveInYear)} />
                  {errors.moveInYear && <span style={{ fontSize: 11, color: "#ef4444" }}>{errors.moveInYear}</span>}
                </div>
              </div>

              

              {/* Parking + utilities toggles */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 8 }}>Rent includes</div>
                <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {/* Parking toggle */}
                  <button
                    type="button"
                    onClick={() => setParking(v => !v)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "11px 14px", border: `1.5px solid ${parking ? "#bfdbfe" : "#e2e8f0"}`,
                      borderRadius: 8, background: parking ? "#eff6ff" : "#fff",
                      cursor: "pointer", textAlign: "left", transition: "all .15s",
                    }}
                  >
                    <div style={{ width: 34, height: 18, borderRadius: 18, background: parking ? "#3b82f6" : "#e2e8f0", position: "relative", flexShrink: 0, transition: "background .15s" }}>
                      <div style={{ position: "absolute", top: 2, left: parking ? 18 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left .15s" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Parking</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>+$250/mo to benchmark</div>
                    </div>
                  </button>

                  {/* Utilities toggle */}
                  <button
                    type="button"
                    onClick={() => setUtilities(v => !v)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "11px 14px", border: `1.5px solid ${utilities ? "#bfdbfe" : "#e2e8f0"}`,
                      borderRadius: 8, background: utilities ? "#eff6ff" : "#fff",
                      cursor: "pointer", textAlign: "left", transition: "all .15s",
                    }}
                  >
                    <div style={{ width: 34, height: 18, borderRadius: 18, background: utilities ? "#3b82f6" : "#e2e8f0", position: "relative", flexShrink: 0, transition: "background .15s" }}>
                      <div style={{ position: "absolute", top: 2, left: utilities ? 18 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left .15s" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Utilities</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>+$120/mo to benchmark</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* CMHC benchmark preview */}
              {neighborhood && unitType && smartBenchmark != null && (
                <div style={{ padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748b" }}>
                    Vancouver benchmark — {neighborhood}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                      {currency(smartBenchmark + (parking ? ADDON_COSTS.parking : 0) + (utilities ? ADDON_COSTS.utilities : 0))}/mo
                    </span>
                    <span style={{ padding: "2px 8px", background: benchSource === "baseline" ? "#f1f5f9" : "#06b6d420", border: `1px solid ${benchSource === "baseline" ? "#e2e8f0" : "#06b6d450"}`, borderRadius: 100, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: benchSource === "baseline" ? "#94a3b8" : "#0891b2", textTransform: "uppercase", letterSpacing: ".06em" }}>
                      {benchLabel}
                    </span>
                  </div>
                </div>
              )}

              <button className="btn-primary" onClick={handleCalculate} disabled={submitting}>
                {submitting ? "Saving…" : "Check My Rent →"}
              </button>

              <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
                Anonymous · no account · no personal data stored
              </p>
            </div>
          </div>

        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Verdict */}
            <div className={revealed ? "fade-in d1" : ""} style={{ background: verdict.bg, border: `1.5px solid ${verdict.border}`, borderRadius: 12, padding: "24px 22px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: verdict.color, letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 6, opacity: .85 }}>
                vs today's market · {neighborhood}
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div style={{ fontSize: "clamp(56px,14vw,84px)", fontWeight: 800, lineHeight: 1, color: verdict.color, letterSpacing: "-.04em" }}>
                  {result.todayPct > 0 ? "+" : ""}{result.todayPct}%
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", padding: "6px 13px", background: verdict.pill, border: `1px solid ${verdict.border}`, borderRadius: 100, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500, color: verdict.color, alignSelf: "flex-start", marginTop: 6 }}>
                  {verdict.label}
                </div>
              </div>

              {/* Spectrum */}
              <div style={{ marginTop: 18 }}>
                <div style={{ position: "relative", height: 4, borderRadius: 4, background: "linear-gradient(to right, #7c3aed, #2563eb, #16a34a, #ea580c, #dc2626)" }}>
                  <div style={{ position: "absolute", top: "50%", left: `${((Math.max(-50, Math.min(50, result.todayPct)) + 50) / 100) * 100}%`, transform: "translate(-50%,-50%)", width: 14, height: 14, borderRadius: "50%", background: verdict.color, border: "2px solid #fff", boxShadow: `0 0 0 2px ${verdict.color}50`, transition: "left .8s cubic-bezier(.34,1.3,.64,1)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#94a3b8" }}>
                  <span>−50%</span><span>Market</span><span>+50%</span>
                </div>
              </div>

              {/* Benchmark source */}
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#94a3b8" }}>BENCHMARK</span>
                <span style={{ padding: "1px 7px", background: result.benchSource === "baseline" ? "#f1f5f9" : "#06b6d418", border: `1px solid ${result.benchSource === "baseline" ? "#e2e8f0" : "#06b6d440"}`, borderRadius: 100, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: result.benchSource === "baseline" ? "#94a3b8" : "#0891b2", textTransform: "uppercase", letterSpacing: ".05em" }}>
                  {result.benchSource === "community" ? `Community · ${result.communityCount} submissions` : result.benchSource === "blended" ? `Blended · ${result.communityCount}+ CMHC` : "CMHC baseline"}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className={`g3 ${revealed ? "fade-in d2" : ""}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "Your Rent", value: currency(result.rent), hi: true },
                { label: result.sameYear ? "Market Now" : "Move-in Market", value: currency(result.moveinBench) },
                { label: "Today's Market", value: currency(result.todayBench) },
              ].map(({ label, value, hi }) => (
                <div key={label} className="stat-card">
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>{label}</div>
                  <div style={{ fontSize: hi ? 20 : 16, fontWeight: 700, color: hi ? "#0f172a" : "#475569", letterSpacing: "-.02em" }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className={revealed ? "fade-in d3" : ""} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Breakdown</div>
              {result.sameYear ? (
                <p style={{ fontSize: 14, color: "#334155" }}>
                  You moved in this year. Your rent is <strong>{currency(Math.abs(result.todayDiff))}/mo {result.todayDiff >= 0 ? "above" : "below"} today's market.</strong>
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[
                    { label: `When you moved in (${result.moveInYear})`, val: result.moveinDiff, pctVal: result.moveinPct },
                    { label: "Today's market", val: result.todayDiff, pctVal: result.todayPct },
                    { label: "If tracked with inflation", val: null, custom: currency(result.inflationTracked) + "/mo expected" },
                  ].map(({ label, val, pctVal, custom }, i, arr) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
                      {custom ? (
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{custom}</span>
                      ) : (
                        <span style={{ fontSize: 13, fontWeight: 600, color: val > 0 ? "#ea580c" : "#16a34a" }}>
                          {pctVal > 0 ? "+" : ""}{pctVal}% · {currency(Math.abs(val))}/mo {val >= 0 ? "over" : "under"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            
            {/* BC tenant rights */}
            {!result.sameYear && (
              <div className={revealed ? "fade-in d4" : ""} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 18px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#16a34a", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>BC Rent Control</div>
                <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.65, marginBottom: 8 }}>
                  BC caps rent increases for existing tenants at the provincial guideline — <strong>3.0% for 2025</strong>. This applies regardless of when your unit was built.
                  Your legally expected max today is approximately <strong>{currency(result.guidelineCap)}/mo</strong>.
                  {result.rent > result.guidelineCap && <span style={{ color: "#dc2626" }}> Your rent exceeds this — you may have grounds to dispute at the Residential Tenancy Branch.</span>}
                </p>
                <a href="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/rent-increases" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "#16a34a", textDecoration: "none" }}>BC Rent Increase Guidelines →</a>
              </div>
            )}
            

            {saveWarning && (
              <div style={{ fontSize: 12, color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px" }}>⚠ {saveWarning}</div>
            )}

            {/* CTA row */}
            <div className={`gcta ${revealed ? "fade-in d5" : ""}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button className="btn-ghost" onClick={handleReset}>← Check Another</button>
              <button className="btn-ghost" onClick={() => setShareOpen(s => !s)} style={{ background: shareOpen ? "#0f172a" : "#fff", color: shareOpen ? "#fff" : "#0f172a", borderColor: shareOpen ? "#0f172a" : "#e2e8f0" }}>
                Share {shareOpen ? "↑" : "↗"}
              </button>
            </div>

            {/* Share panel */}
            {shareOpen && (
              <div className="fade-in" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Share your result</div>
                <div className="gshare" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                  <a className="share-btn" href={`https://www.reddit.com/submit?url=https://vancouverfairrent.ca&title=${encodeURIComponent(getShareText())}`} target="_blank" rel="noopener noreferrer" style={{ background: "#ff4500", color: "#fff" }}>Reddit</a>
                  <a className="share-btn" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}`} target="_blank" rel="noopener noreferrer" style={{ background: "#000", color: "#fff" }}>X</a>
                  <a className="share-btn" href={`https://www.threads.net/intent/post?text=${encodeURIComponent(getShareText())}`} target="_blank" rel="noopener noreferrer" style={{ background: "#000", color: "#fff" }}>Threads</a>
                  {navigator.share ? (
                    <button className="share-btn" onClick={() => navigator.share({ title: "Vancouver Rent Calculator", text: getShareText(), url: "https://vancouverfairrent.ca" }).catch(() => {})} style={{ background: "#0f172a", color: "#fff" }}>More ↗</button>
                  ) : (
                    <button className="share-btn" onClick={copyLink} style={{ background: copied ? "#16a34a" : "#0f172a", color: "#fff" }}>{copied ? "Copied ✓" : "Copy"}</button>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {["CMHC Rental Market Survey (Oct 2024)", "Rentals.ca Monthly Report (Feb 2025)", "Community Submissions"].map(s => (
              <span key={s} style={{ padding: "3px 9px", background: "#f1f5f9", borderRadius: 100, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#64748b" }}>{s}</span>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.7 }}>
            Benchmarks blend CMHC/Rentals.ca data with anonymous community submissions (last 2 years).
            BC guideline (3%/yr) used for historical model. Not legal or financial advice.
          </p>
        </div>
      </main>
    </div>
  );
}
