import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import NeighbourhoodPage from "./NeighbourhoodPage";
import { VANCOUVER_HOODS, VANCOUVER_CITY } from "./hoodData";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── Config ───────────────────────────────────────────────────────────────────

const CITY            = "vancouver";
const CITY_NAME       = "Vancouver";
const PROVINCE        = "British Columbia";
const COOLDOWN_KEY    = "vancouver_fair_rent_last_submit";
const COOLDOWN_MS     = 60_000;
const ACCENT          = "#1a5c34";
const ACCENT_BG       = "#f0f7f2";
const SHARE_URL       = "https://vancouverfairrent.ca";
const RENT_CONTROLLED = true;
const INFLATION       = 0.040;

const BASES = { bachelor:1950, "1br":2600, "2br":3400, "3br":4300, "3plus":5200 };
const HOODS = {
  "Burnaby":0.93,"Cambie":1.08,"Chinatown":0.89,
  "Coal Harbour":1.35,"Commercial Drive":0.97,"Downtown":1.20,
  "Dunbar":1.14,"Fairview":1.10,"Fraser":0.95,
  "Gastown":1.00,"Grandview Woodland":0.98,"Hastings Sunrise":0.94,
  "Kerrisdale":1.16,"Kitsilano":1.22,"Main Street":1.02,
  "Marpole":0.87,"Mount Pleasant":1.04,"New Westminster":0.90,
  "North Vancouver":1.07,"Oakridge":1.05,"Point Grey":1.30,
  "Richmond":0.92,"Riley Park":1.01,"Shaughnessy":1.28,
  "South Granville":1.12,"Strathcona":0.91,"Sunset":0.88,
  "West End":1.18,"West Vancouver":1.38,"Yaletown":1.25,
};
const ADDONS = { parking:250, utilities:120 };

// BC Residential Tenancy Branch guideline rates (max allowable annual increase)
const GUIDELINES = {
  2010:0.032,2011:0.028,2012:0.042,2013:0.032,2014:0.027,
  2015:0.025,2016:0.029,2017:0.035,2018:0.040,2019:0.024,
  2020:0.028,2021:0.015,2022:0.015,2023:0.020,2024:0.035,
  2025:0.030,2026:0.030,
};

const UNITS = [
  { key:"bachelor", label:"Bachelor / Studio" },
  { key:"1br",      label:"1 Bedroom"         },
  { key:"2br",      label:"2 Bedroom"         },
  { key:"3br",      label:"3 Bedroom"         },
  { key:"3plus",    label:"3+ Bedroom"        },
];
const NEIGHBORHOODS = Object.keys(HOODS).sort((a,b) => a.localeCompare(b));
const MARKET_SNAPSHOT = [
  { label:"1-bedroom median",        val:"$2,600" },
  { label:"2-bedroom median",        val:"$3,400" },
  { label:"Vacancy rate (2025)",     val:"0.9%"   },
  { label:"BC rent guideline (2026)",val:"3.0%"   },
  { label:"Highest area",            val:"West Vancouver" },
  { label:"Most affordable area",    val:"Marpole" },
];

// Median $/sq ft by unit type (Vancouver metro, estimated from CMHC + Rentals.ca 2025)
const MEDIAN_PSF = { bachelor:5.10, "1br":4.20, "2br":3.70, "3br":3.30, "3plus":3.00 };

// ─── i18n strings ─────────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    submissions:"submissions", rentMap:"Rent Map", allCities:"All cities",
    methodology:"Methodology", about:"About", faq:"FAQ", langToggle:"Français",
    pageTitle:`${CITY_NAME} Rent Calculator: Check If Your Rent Is Fair`,
    pageDesc:`Find out if your ${CITY_NAME} rent is fair. Compare what you pay to real market data from CMHC and local renter submissions. Free. Anonymous. No account required. BC rent control applies to all tenancies.`,
    browseByHood:"Browse by neighbourhood",
    // Community hero (Glassdoor-style) — growing-market framing
    heroEyebrow:`${CITY_NAME} rent transparency community`,
    heroTitle:`See what ${CITY_NAME} renters are actually paying.`,
    heroSubStrong:`${CITY_NAME} rents are difficult to compare.`,
    heroSubRest:`Submit your rent anonymously to help build ${CITY_NAME}'s tenant-powered rent database.`,
    heroCtaPrimary:`Share my ${CITY_NAME} rent`,
    heroCtaSecondary:`Explore neighbourhoods`,
    heroTickerPre:"Joined by",
    heroTickerPost:`anonymous ${CITY_NAME} renters and growing.`,
    heroLoading:"Loading community count.",
    formTitle:"Enter your rental details", formSub:"Anonymous. No signup. Takes about 60 seconds.",
    labelHood:"Neighbourhood", labelUnit:"Unit type", labelRent:"Monthly rent (CAD)", labelYear:"Year moved in", rentMicro:"What you actually pay each month, including any included parking or utilities.", yearMicro:"Used to compare against rents from the same year and apply rent control where it applies.",
    labelSqft:"Unit size in sq ft", sqftOptional:"optional",
    sqftNote:"Adding your unit size improves your score accuracy. Vancouver has many micro-units where price per square foot reveals the true cost.",
    labelParking:"Parking", parkingSub:"+$250/mo added to benchmark",
    labelUtilities:"Utilities", utilitiesSub:"+$120/mo added to benchmark",
    rentIncludes:"Rent includes",
    bcRCNotice:"BC rent control applies to all residential tenancies. The BC government sets an annual rent increase guideline (3.0% for 2025; 3.0% for 2026). We will show an estimated cap based on your move-in rent. Confirm any specific rules with the BC Residential Tenancy Branch.",
    selectDots:"Select...", btnCompare:"Compare my rent", btnProcessing:"Processing...",
    anonNote:"Anonymous · No signup · Never sold as personal data",
    errHood:"Select a neighbourhood", errUnit:"Select a unit type",
    errRent:"Enter a valid monthly rent", errYear:y=>`Enter a year between 1980 and ${y}`,
    errSqft:"Enter a size between 100 and 10,000 sq ft",
    benchLbl:(city,hood)=>`${city} benchmark: ${hood}`,
    snapshotTitle:`${CITY_NAME} rental market: 2025`,
    unit_bachelor:"Bachelor / Studio", unit_1br:"1 Bedroom", unit_2br:"2 Bedroom", unit_3br:"3 Bedroom", unit_3plus:"3+ Bedroom",
    scoreTitle:"Fair Rent Canada Score",
    scoreSumGood:h=>`Your rent is a good deal for ${h}.`,
    scoreSumFair:h=>`Your rent is in line with comparable units in ${h}.`,
    scoreSumAbove:h=>`Your rent is above the typical range for ${h}.`,
    scoreSumHigh:h=>`Your rent is significantly above market for ${h}.`,
    scoreMarket:"Market Position", scorePsf:"$/sq ft", scoreRC:"Rent Control",
    limitedData:"Score estimated with limited local data.",
    yourPsf:"Your price per sq ft", hoodMedian:"median",
    psfLess:p=>`You are paying ${p}% less per sq ft than the local median.`,
    psfMore:p=>`You are paying ${p}% more per sq ft than the local median.`,
    fairRange:"Estimated fair rent range", dataConf:"Data confidence",
    confH:"High", confM:"Medium", confL:"Low",
    confDescH:n=>`${n} local submissions blended with CMHC data.`,
    confDescM:n=>`${n} local submissions blended with CMHC data.`,
    confDescL:"Based primarily on CMHC public data. Fewer than 8 local submissions.",
    howBuilt:"How this estimate was built", hideBreakdown:"Hide calculation details",
    cityBase:u=>`City baseline (${u})`,
    hoodAdjLbl:"Neighbourhood adjustment", hoodAbove:"above", hoodBelow:"below", cityAvg:"city average",
    amenities:"Amenities included", parkingAmt:"Parking (+$250)", utilitiesAmt:"Utilities (+$120)",
    localData:"Local renter data", fewSubs:"Fewer than 5 submissions, not enough to adjust",
    subWeight:(n,w)=>`${n} submissions (${w}% weight)`,
    benchLblMidpoint:"Benchmark (midpoint)",
    bcRC:"BC rent control",
    bcRCApplies:"BC rent control applies.",
    bcRCDesc:"BC caps annual rent increases for existing tenants at the provincial guideline (3.0% for 2025; 3.0% for 2026). Compounding your move-in rent forward by each year's guideline gives an estimated cap of",
    bcRCOver:r=>`Your current rent of ${r} appears higher than this estimated cap. This is informational only. Confirm specifics with the BC Residential Tenancy Branch.`,
    bcRCWithin:r=>`Your rent of ${r} is within the estimated cap.`,
    bcRCLink:"BC Residential Tenancy Branch →",
    bcRCNote:"In BC, rent control applies to all residential tenancies regardless of when the unit was built. This is different from Ontario, where units first occupied after November 15, 2018 are exempt between tenancies. FairRent is informational only and does not provide legal advice. Always confirm rules with the BC Residential Tenancy Branch.",
    startOver:"Start over", shareResult:"Share result", shareLabel:"Share", copyLink:"Copy link", copied:"Copied",
    whatYouGet:"What you will receive",
    resultItems:["Fair Rent Canada Score (1 to 10)","Estimated fair rent range for your neighbourhood","Price per square foot comparison (if size provided)","BC rent control status and estimated legal maximum"],
    resultPlaceholder:"Your result will appear here after you fill in your rental details and click",
    posHeadlineBelow:"Your rent is below the estimated fair range for this area.",
    posHeadlineAbove:"Your rent is above the estimated fair range for this area.",
    posHeadlineWithin:"Your rent is within the estimated fair range for this area.",
    posSubBelow:(d,h)=>`Your rent is ${d}/mo below the lower end of comparable units in ${h}. This is a favourable position.`,
    posSubAbove:(d,h)=>`Your rent is ${d}/mo above the upper end of comparable units in ${h}. It may be worth reviewing what is included.`,
    posSubWithin:h=>`Your rent falls within the range we estimate for comparable units in ${h}. This suggests it is broadly in line with the local market.`,
    posColorBelow:"#1a3a8b", posColorAbove:"#8b1a1a", posColorWithin:"#1a5c34",
    slExcellent:"Excellent", slGood:"Good", slFair:"Fair", slAboveMarket:"Above Market", slHigh:"High", slVeryHigh:"Very High",
  },
  fr: {
    submissions:"soumissions", rentMap:"Carte des loyers", allCities:"Toutes les villes",
    methodology:"Méthodologie", about:"À propos", faq:"FAQ", langToggle:"EN",
    pageTitle:"Calculateur de loyer à Vancouver : Votre loyer est-il juste ?",
    pageDesc:"Découvrez si votre loyer à Vancouver est juste. Comparez ce que vous payez aux données réelles de la SCHL et aux soumissions de locataires locaux. Gratuit. Anonyme. Sans inscription. Le contrôle des loyers de la C.-B. s'applique à tous les logements.",
    browseByHood:"Parcourir par quartier",
    // Community hero
    heroEyebrow:"Communauté de transparence des loyers à Vancouver",
    heroTitle:"Voyez ce que paient vraiment les locataires de Vancouver.",
    heroSubStrong:"Les loyers à Vancouver sont difficiles à comparer.",
    heroSubRest:"Partagez votre loyer anonymement pour aider à bâtir la base de données des loyers de Vancouver.",
    heroCtaPrimary:"Partager mon loyer à Vancouver",
    heroCtaSecondary:"Explorer les quartiers",
    heroTickerPre:"Rejoint par",
    heroTickerPost:"locataires anonymes à Vancouver et en croissance.",
    heroLoading:"Chargement.",
    formTitle:"Entrez vos informations de location", formSub:"Anonyme. Sans inscription. Environ 60 secondes.",
    labelHood:"Quartier", labelUnit:"Type de logement", labelRent:"Loyer mensuel (CAD)", labelYear:"Année d'emménagement",
    labelSqft:"Superficie du logement en pi²", sqftOptional:"facultatif",
    sqftNote:"Ajouter la superficie améliore la précision de votre indice. Vancouver compte de nombreux micro-logements où le prix au pied carré révèle le vrai coût.",
    labelParking:"Stationnement", parkingSub:"+250 $/mois ajouté à la référence",
    labelUtilities:"Services publics", utilitiesSub:"+120 $/mois ajouté à la référence",
    rentIncludes:"Le loyer comprend",
    bcRCNotice:"Le contrôle des loyers s'applique à tous les logements résidentiels en C.-B. Le gouvernement fixe un taux directeur annuel (3,0 % en 2025; 3,0 % en 2026). Nous afficherons un plafond estimé à partir de votre loyer d'emménagement. Confirmez les règles précises auprès de la Direction des locations résidentielles.",
    selectDots:"Sélectionner...", btnCompare:"Comparer mon loyer", btnProcessing:"Traitement en cours...",
    anonNote:"Anonyme · Aucun compte requis · Aucune donnée personnelle stockée",
    errHood:"Sélectionnez un quartier", errUnit:"Sélectionnez un type de logement",
    errRent:"Entrez un loyer mensuel valide", errYear:y=>`Entrez une année entre 1980 et ${y}`,
    errSqft:"Entrez une superficie entre 100 et 10 000 pi²",
    benchLbl:(city,hood)=>`Référence ${city} : ${hood}`,
    snapshotTitle:"Marché locatif de Vancouver : 2025",
    unit_bachelor:"Studio / Garçonnière", unit_1br:"1 chambre", unit_2br:"2 chambres", unit_3br:"3 chambres", unit_3plus:"3+ chambres",
    scoreTitle:"Indice FairRent Canada",
    scoreSumGood:h=>`Votre loyer est avantageux pour ${h}.`,
    scoreSumFair:h=>`Votre loyer est conforme aux logements comparables à ${h}.`,
    scoreSumAbove:h=>`Votre loyer est supérieur à la fourchette habituelle à ${h}.`,
    scoreSumHigh:h=>`Votre loyer est nettement supérieur au marché à ${h}.`,
    scoreMarket:"Position sur le marché", scorePsf:"$/pi²", scoreRC:"Contrôle des loyers",
    limitedData:"Indice estimé avec des données locales limitées.",
    yourPsf:"Votre prix au pi²", hoodMedian:"médiane",
    psfLess:p=>`Vous payez ${p} % de moins au pi² que la médiane locale.`,
    psfMore:p=>`Vous payez ${p} % de plus au pi² que la médiane locale.`,
    fairRange:"Fourchette de loyer juste estimée", dataConf:"Fiabilité des données",
    confH:"Élevée", confM:"Moyenne", confL:"Faible",
    confDescH:n=>`${n} soumissions locales combinées avec les données de la SCHL.`,
    confDescM:n=>`${n} soumissions locales combinées avec les données de la SCHL.`,
    confDescL:"Basé principalement sur les données publiques de la SCHL. Moins de 8 soumissions locales.",
    howBuilt:"Comment cette estimation a été calculée", hideBreakdown:"Masquer les détails du calcul",
    cityBase:u=>`Référence de la ville (${u})`,
    hoodAdjLbl:"Ajustement selon le quartier", hoodAbove:"au-dessus de", hoodBelow:"en dessous de", cityAvg:"la moyenne de la ville",
    amenities:"Commodités incluses", parkingAmt:"Stationnement (+250 $)", utilitiesAmt:"Services publics (+120 $)",
    localData:"Données des locataires locaux", fewSubs:"Moins de 5 soumissions, insuffisant pour ajuster",
    subWeight:(n,w)=>`${n} soumissions (${w} % de pondération)`,
    benchLblMidpoint:"Référence (point médian)",
    bcRC:"Contrôle des loyers en C.-B.",
    bcRCApplies:"Le contrôle des loyers de la C.-B. s'applique.",
    bcRCDesc:"La Colombie-Britannique plafonne les augmentations annuelles de loyer pour les locataires existants au taux directeur provincial. Le taux directeur 2026 est de 3,0 %. Selon votre loyer d'emménagement, le maximum légal estimé aujourd'hui est",
    bcRCOver:r=>`Votre loyer actuel de ${r} semble supérieur à ce plafond estimé. Ceci est à titre informatif seulement. Confirmez les détails auprès de la Direction des locations résidentielles.`,
    bcRCWithin:r=>`Votre loyer de ${r} est dans le plafond estimé.`,
    bcRCLink:"Direction des locations résidentielles →",
    bcRCNote:"En C.-B., le contrôle des loyers s'applique à toutes les locations résidentielles, peu importe la date de construction. C'est différent de l'Ontario, où les logements occupés après le 15 novembre 2018 sont exemptés entre locataires. FairRent est un outil informatif et ne fournit pas de conseils juridiques. Confirmez toujours les règles auprès de la Direction des locations résidentielles de la C.-B.",
    startOver:"Recommencer", shareResult:"Partager le résultat", shareLabel:"Partager", copyLink:"Copier le lien", copied:"Copié",
    whatYouGet:"Ce que vous recevrez",
    resultItems:["Indice FairRent Canada (1 à 10)","Fourchette de loyer juste estimée pour votre quartier","Comparaison du prix au pi² (si la superficie est fournie)","Statut du contrôle des loyers en C.-B. et maximum légal estimé"],
    resultPlaceholder:"Votre résultat apparaîtra ici après avoir rempli vos informations et cliqué sur",
    posHeadlineBelow:"Votre loyer est inférieur à la fourchette juste estimée pour cette zone.",
    posHeadlineAbove:"Votre loyer est supérieur à la fourchette juste estimée pour cette zone.",
    posHeadlineWithin:"Votre loyer est dans la fourchette juste estimée pour cette zone.",
    posSubBelow:(d,h)=>`Votre loyer est de ${d}/mois en dessous de la borne inférieure des logements comparables à ${h}. C'est une position favorable.`,
    posSubAbove:(d,h)=>`Votre loyer est de ${d}/mois au-dessus de la borne supérieure des logements comparables à ${h}. Il peut être utile de vérifier ce qui est inclus.`,
    posSubWithin:h=>`Votre loyer est dans la fourchette estimée pour les logements comparables à ${h}. Cela indique qu'il est globalement en accord avec le marché local.`,
    posColorBelow:"#1a3a8b", posColorAbove:"#8b1a1a", posColorWithin:"#1a5c34",
    slExcellent:"Excellent", slGood:"Bien", slFair:"Juste", slAboveMarket:"Au-dessus du marché", slHigh:"Élevé", slVeryHigh:"Très élevé",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = v => Number(v).toLocaleString("en-CA", { style:"currency", currency:"CAD", maximumFractionDigits:0 });

function calcGuidelineCap(moveInRent, moveInYear) {
  const cur = new Date().getFullYear(); let r = moveInRent;
  for (let yr = moveInYear + 1; yr <= cur; yr++) r *= 1 + (GUIDELINES[yr] ?? 0.030);
  return Math.round(r);
}

function buildBreakdown(hood, unit, parking, utilities, smartBench, communityN) {
  const base         = BASES[unit] ?? BASES["1br"];
  const hoodMult     = HOODS[hood] ?? 1;
  const hoodAdj      = Math.round(base * hoodMult) - base;
  const afterHood    = Math.round(base * hoodMult);
  const parkingAdj   = parking   ? ADDONS.parking   : 0;
  const utilitiesAdj = utilities ? ADDONS.utilities : 0;
  const afterAmenity = afterHood + parkingAdj + utilitiesAdj;
  const w = communityN<5?0:communityN<10?0.2:communityN<20?0.4:communityN<50?0.6:0.8;
  const communityAdj = (smartBench != null && w > 0) ? Math.round((smartBench - afterHood) * w) : 0;
  const finalBench   = afterAmenity + communityAdj;
  return { base, hoodMult, hoodAdj, afterHood, parkingAdj, utilitiesAdj, communityAdj, communityN, w, finalBench };
}

function getRange(bench, confLabel, unit = "1br") {
  const spreads = { bachelor:0.09,"1br":0.10,"2br":0.11,"3br":0.13,"3plus":0.15 };
  const spread  = confLabel==="High" ? 0.07 : confLabel==="Medium" ? 0.10 : (spreads[unit]??0.11);
  return { low:Math.round(bench*(1-spread)/50)*50, high:Math.round(bench*(1+spread)/50)*50 };
}

function getConf(n) {
  if (n>=20) return { label:"High",   dot:"#1a5c34", textColor:"#1a5c34", bg:"#f0f7f2", border:"#a8d5b5", desc:`${n} local submissions blended with CMHC data.` };
  if (n>=8)  return { label:"Medium", dot:"#7a4f00", textColor:"#7a4f00", bg:"#fdf8f0", border:"#e8c97a", desc:`${n} local submissions blended with CMHC data.` };
  return           { label:"Low",    dot:"#8b1a1a", textColor:"#8b1a1a", bg:"#fdf0f0", border:"#e8a8a8", desc:"Based primarily on CMHC public data. Fewer than 8 local submissions." };
}

function median(arr) {
  if (!arr.length) return null;
  const s = [...arr].sort((a,b)=>a-b), m = Math.floor(s.length/2);
  return s.length%2 ? s[m] : (s[m-1]+s[m])/2;
}
function communityWeight(n) { return n<5?0:n<10?0.2:n<20?0.4:n<50?0.6:0.8; }

// ─── Fair Rent Canada Score ──────────────────────────────────────────────────

function calcMarketScore(rentNum, rangeLow, rangeHigh) {
  const span = rangeHigh - rangeLow;
  if (span <= 0) return 5.0;
  const pct = (rentNum - rangeLow) / span;
  if (pct < -0.5) return 10.0;
  if (pct <= 0.0) return 8.0 + ((-pct) / 0.5) * 2.0;
  if (pct <= 0.5) return 6.5 + ((0.5 - pct) / 0.5) * 1.5;
  if (pct <= 1.0) return 5.0 + ((1.0 - pct) / 0.5) * 1.5;
  if (pct <= 1.5) return 2.5 + ((1.5 - pct) / 0.5) * 2.5;
  return 1.0;
}

function calcPsfScore(userPsf, medianPsf) {
  if (!medianPsf || medianPsf <= 0) return null;
  const ratio = userPsf / medianPsf;
  if (ratio < 0.75) return 10.0;
  if (ratio <= 0.90) return 8.0 + ((0.90 - ratio) / 0.15) * 2.0;
  if (ratio <= 1.05) return 6.0 + ((1.05 - ratio) / 0.15) * 2.0;
  if (ratio <= 1.20) return 4.0 + ((1.20 - ratio) / 0.15) * 2.0;
  if (ratio <= 1.40) return 2.0 + ((1.40 - ratio) / 0.20) * 2.0;
  return 1.0;
}

function calcRentControlBonus(guidelineCap, rentNum, sameYear) {
  // In BC, ALL residential tenancies are rent-controlled
  if (sameYear) return 5.0;
  if (!guidelineCap) return 5.0;
  const overPct = (rentNum - guidelineCap) / guidelineCap;
  if (overPct <= 0) return 10.0;
  if (overPct <= 0.10) return 6.0;
  return 3.0;
}

function calcFairRentScore(rentNum, range, sqftNum, unitType, guidelineCap, sameYear) {
  const marketScore = calcMarketScore(rentNum, range.low, range.high);
  const rcBonus = calcRentControlBonus(guidelineCap, rentNum, sameYear);

  let psfScore = null;
  let userPsf = null;
  let medPsf = null;

  if (sqftNum && sqftNum >= 100) {
    userPsf = rentNum / sqftNum;
    medPsf = MEDIAN_PSF[unitType] ?? MEDIAN_PSF["1br"];
    psfScore = calcPsfScore(userPsf, medPsf);
  }

  let finalScore;
  if (psfScore !== null) {
    finalScore = (marketScore * 0.60) + (psfScore * 0.25) + (rcBonus * 0.15);
  } else {
    finalScore = (marketScore * 0.75) + (rcBonus * 0.25);
  }

  finalScore = Math.max(1.0, Math.min(10.0, finalScore));
  finalScore = Math.round(finalScore * 10) / 10;

  return { finalScore, marketScore, psfScore, rcBonus, userPsf, medPsf };
}

function getScoreLabel(score) {
  if (score >= 9.0) return { key:"slExcellent",  color:"#1a5c34", bg:"#f0f7f2", border:"#a8d5b5" };
  if (score >= 7.5) return { key:"slGood",        color:"#1a5c34", bg:"#f0f7f2", border:"#a8d5b5" };
  if (score >= 6.0) return { key:"slFair",         color:"#7a4f00", bg:"#fdf8f0", border:"#e8c97a" };
  if (score >= 4.5) return { key:"slAboveMarket", color:"#b45309", bg:"#fffbeb", border:"#fde68a" };
  if (score >= 3.0) return { key:"slHigh",         color:"#8b1a1a", bg:"#fdf0f0", border:"#e8a8a8" };
  return             { key:"slVeryHigh",  color:"#8b1a1a", bg:"#fdf0f0", border:"#e8a8a8" };
}

// ─── Misc ────────────────────────────────────────────────────────────────────

function useCountUp(target, dur=800) {
  const [val,set] = useState(0), raf = useRef(null), prev = useRef(0);
  useEffect(() => {
    if (!target) return;
    const from = prev.current; prev.current = target; let t0 = null;
    const tick = ts => { if(!t0)t0=ts; const p=Math.min((ts-t0)/dur,1); set(Math.round(from+(target-from)*p)); if(p<1)raf.current=requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return val;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
  :root {
    --serif: Charter, Georgia, "Iowan Old Style", "Times New Roman", serif;
    --sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --mono: "SF Mono", Menlo, Consolas, "Courier New", monospace;
    --bg:   #f4f5f7;
    --white:#ffffff;
    --surface:#ffffff;
    --border:#e3e6ea;
    --border-dark:#cdd2d8;
    --border-soft:#eef0f3;
    --t1:#0d1418; --t2:#3b4753; --t3:#6a7682; --t4:#9aa4af;
    --accent:${ACCENT}; --accent-bg:${ACCENT_BG};
    --accent-hover:#0a6630;
    --accent-soft:#eef7f1;
    --accent-line:#cfe6d8;
  }
  html,body,#root{margin:0;padding:0;width:100%;background:var(--bg);}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:var(--sans);font-size:15px;color:var(--t1);-webkit-font-smoothing:antialiased;line-height:1.5;}
  input,select,button,textarea{font-family:var(--sans);font-size:15px;}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
  a{color:inherit;}

  .gov-nav{background:var(--nav-bg);border-bottom:3px solid var(--accent);}
  .gov-nav-inner{max-width:1100px;margin:0 auto;padding:0 16px;height:48px;display:flex;align-items:center;justify-content:space-between;gap:12px;}
  .gov-wordmark{font-size:13px;font-weight:700;color:#fff;text-decoration:none;white-space:nowrap;flex-shrink:0;}
  .gov-wordmark span{font-weight:400;color:#aab8c2;}
  .gov-count{font-family:var(--mono);font-size:11px;color:#aab8c2;white-space:nowrap;}
  .gov-subbar{background:var(--bar-bg);border-bottom:1px solid #3d5a6e;}
  .gov-subbar-inner{max-width:1100px;margin:0 auto;padding:0 16px;min-height:36px;display:flex;align-items:center;gap:20px;flex-wrap:wrap;}
  @media(max-width:640px){.gov-subbar-inner{gap:8px 12px;padding:6px 12px;}.gov-subbar a{font-size:11.5px;}}
  .gov-subbar-inner::-webkit-scrollbar{display:none;}
  .gov-subbar a{font-size:12px;color:#aab8c2;text-decoration:none;white-space:nowrap;flex-shrink:0;}
  .gov-subbar a:hover{color:#fff;text-decoration:underline;}

  .page-wrap{max-width:1100px;margin:0 auto;padding:24px 20px 60px;}
  .page-heading{margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--border);}
  .page-heading h1{font-size:clamp(18px,2.5vw,24px);font-weight:700;color:var(--t1);margin-bottom:6px;line-height:1.2;}
  .page-heading p{font-size:13px;color:var(--t2);line-height:1.6;max-width:560px;}

  .hood-section{margin-bottom:20px;}
  /* form-first: on mobile, drop the page heading and neighbourhood pills above the form so the calculator is the first thing the user sees on landing. The SEO H1 stays in the DOM. */
  @media(max-width:760px){
    .page-wrap{display:flex;flex-direction:column;}
    .page-wrap > div[style*="border-bottom"]{display:none;}
    .page-grid{order:1;}
    .hood-section{order:2;display:none;}
  }
  .hood-label{font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;}
  .hood-pills{display:flex;flex-wrap:wrap;gap:8px;}
  .hood-pill{padding:6px 12px;border:1px solid var(--border);background:var(--white);font-size:13px;font-weight:500;color:var(--t2);cursor:pointer;border-radius:999px;text-decoration:none;}
  .hood-pill:hover{background:var(--accent-soft);border-color:var(--accent);color:var(--accent);}

  /* City community hero (Glassdoor-style) */
  .city-hero{margin-bottom:24px;padding:8px 0 22px;border-bottom:1px solid var(--border-soft);}
  .city-hero-eyebrow{font-size:11px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.14em;margin-bottom:10px;}
  .city-hero h1{font-family:var(--serif);font-size:clamp(26px,3.4vw,40px);font-weight:700;color:var(--t1);line-height:1.12;letter-spacing:-0.01em;margin-bottom:12px;max-width:760px;}
  .city-hero-sub{font-size:15px;color:var(--t2);line-height:1.6;max-width:620px;margin-bottom:16px;}
  .city-hero-sub strong{color:var(--t1);font-weight:600;}
  .city-hero-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:14px;}
  .city-hero-btn{display:inline-flex;align-items:center;justify-content:center;padding:11px 18px;font-size:14px;font-weight:600;border-radius:6px;border:1px solid transparent;font-family:inherit;cursor:pointer;text-decoration:none;line-height:1.2;}
  .city-hero-btn-primary{background:var(--accent);color:#fff;border-color:var(--accent);}
  .city-hero-btn-primary:hover{background:var(--accent-hover);border-color:var(--accent-hover);color:#fff;text-decoration:none;}
  .city-hero-btn-ghost{background:transparent;color:var(--t2);border-color:var(--border);}
  .city-hero-btn-ghost:hover{border-color:var(--t3);color:var(--t1);text-decoration:none;}
  .city-hero-ticker{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px;font-size:13px;color:var(--t3);margin-top:4px;}
  .city-hero-ticker-num{font-weight:700;color:var(--t1);font-variant-numeric:tabular-nums;}
  @media(max-width:640px){
    .city-hero{padding:4px 0 16px;margin-bottom:16px;}
    .city-hero h1{font-size:26px;}
    .city-hero-sub{font-size:14px;}
    .city-hero-actions .city-hero-btn{flex:1 1 100%;}
  }

  .page-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,0.95fr);gap:20px;align-items:start;}
  .left-col{display:flex;flex-direction:column;gap:16px;}
  .right-col{position:sticky;top:90px;}

  .form-panel{background:var(--white);border:1px solid var(--border);border-radius:8px;overflow:hidden;}
  .form-panel-header{padding:14px 18px 12px;border-bottom:1px solid var(--border-soft);background:#fbfcfd;}
  .form-panel-title{font-size:14px;font-weight:700;color:var(--t1);}
  .form-panel-sub{font-size:11px;color:var(--t3);margin-top:2px;}
  .form-body{padding:14px;display:flex;flex-direction:column;gap:13px;}
  .field-label{display:block;font-size:11px;font-weight:700;color:var(--t2);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.04em;}
  .field-note{font-size:11px;color:var(--t3);margin-top:3px;line-height:1.4;}
  .field-error{font-size:11px;color:#8b1a1a;margin-top:3px;}
  .f-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .f-input{width:100%;padding:8px 10px;border:1px solid var(--border-dark);background:var(--white);color:var(--t1);font-size:14px;border-radius:0;appearance:none;}
  .f-input:focus{outline:2px solid var(--accent);outline-offset:0;border-color:var(--accent);}
  .f-select{width:100%;padding:8px 30px 8px 10px;border:1px solid var(--border-dark);background:var(--white) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23444'/%3E%3C/svg%3E") no-repeat right 10px center;color:var(--t1);font-size:14px;border-radius:0;appearance:none;cursor:pointer;}
  .f-select:focus{outline:2px solid var(--accent);outline-offset:0;}
  .toggle-pair{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .toggle-item{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border:1px solid var(--border-dark);background:var(--white);cursor:pointer;}
  .toggle-item.on{border-color:var(--accent);background:var(--accent-bg);}
  .toggle-item input[type=checkbox]{margin-top:2px;accent-color:var(--accent);width:14px;height:14px;flex-shrink:0;cursor:pointer;}
  .toggle-item-text{font-size:13px;color:var(--t1);line-height:1.3;}
  .toggle-item-sub{font-size:11px;color:var(--t3);}
  .bench-preview{padding:10px 12px;background:var(--accent-bg);border:1px solid #a8d5b5;border-left:3px solid var(--accent);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;}
  .bench-val{font-family:var(--mono);font-size:17px;font-weight:700;color:var(--accent);}
  .bench-label{font-size:11px;color:var(--t3);text-transform:uppercase;letter-spacing:0.04em;}
  .bench-source{font-size:11px;color:var(--t3);font-style:italic;}
  .btn-submit{width:100%;padding:11px 16px;background:var(--accent);color:#fff;border:none;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:0.02em;}
  .btn-submit:hover:not(:disabled){background:#144d2b;}
  .btn-submit:disabled{background:#888;cursor:not-allowed;}
  .btn-anon{text-align:center;font-size:11px;color:var(--t3);margin-top:6px;}

  .snapshot{background:var(--white);border:1px solid var(--border);border-radius:8px;overflow:hidden;}
  .snapshot-header{padding:11px 16px;background:#fbfcfd;border-bottom:1px solid var(--border-soft);font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:0.08em;}
  .snapshot-row{display:flex;justify-content:space-between;align-items:baseline;padding:7px 14px;border-bottom:1px solid #ebebeb;gap:12px;}
  .snapshot-row:last-child{border-bottom:none;}
  .snapshot-key{font-size:13px;color:var(--t2);flex:1;min-width:0;}
  .snapshot-val{font-family:var(--mono);font-size:13px;font-weight:700;color:var(--t1);flex-shrink:0;}

  .result-panel{background:var(--white);border:1px solid var(--border);border-radius:8px;overflow:hidden;}
  .result-placeholder{padding:28px 16px;text-align:center;}
  .result-placeholder-icon{width:44px;height:44px;border:2px solid var(--border);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;}
  .result-placeholder p{font-size:13px;color:var(--t3);line-height:1.6;max-width:240px;margin:0 auto 16px;}
  .result-thanks{padding:11px 14px;background:#f0f7f2;border-bottom:1px solid #a8d5b5;border-left:3px solid var(--accent);}
  .result-thanks-tag{font-size:10px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px;}
  .result-thanks-text{font-size:12px;color:#1a4a28;line-height:1.5;}
  .help-another{margin-top:14px;padding:14px 16px;background:#fafafa;border:1px solid var(--border);border-left:3px solid var(--accent);}
  .help-another-tag{font-size:10px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;}
  .help-another-q{font-size:14px;font-weight:700;color:var(--t1);margin-bottom:4px;}
  .help-another-d{font-size:12px;color:var(--t2);line-height:1.5;margin-bottom:10px;}
  .help-another-row{display:flex;gap:6px;flex-wrap:wrap;}
  .help-another-btn{flex-grow:1;min-width:120px;padding:9px 10px;font-size:12px;font-weight:700;text-decoration:none;text-align:center;cursor:pointer;border:1px solid;border-radius:2px;}
  .help-another-btn-fill{background:var(--accent);color:#fff;border-color:var(--accent);}
  .help-another-btn-fill:hover{background:#15492a;}
  .help-another-btn-out{background:#fff;color:var(--accent);border-color:var(--accent);}
  .help-another-btn-out:hover{background:#f0f7f2;}
    .result-header{padding:12px 14px;border-bottom:1px solid var(--border);background:#fafafa;display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;}
  .result-header-meta{font-size:11px;color:var(--t3);margin-top:2px;}
  .result-verdict-badge{font-size:11px;font-weight:700;padding:3px 8px;letter-spacing:0.04em;white-space:nowrap;}
  .result-body{padding:14px;display:flex;flex-direction:column;gap:14px;}
  .range-bar-track{height:8px;background:#e0e0e0;position:relative;}
  .range-bar-fill{position:absolute;top:0;height:100%;}
  .range-bar-tick{position:absolute;top:50%;transform:translate(-50%,-50%);width:2px;height:14px;border-radius:1px;}
  .range-bar-dot{position:absolute;top:50%;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;border:2px solid;}
  .range-bar-foot{display:flex;justify-content:space-between;font-size:11px;color:var(--t3);margin-top:5px;font-family:var(--mono);}
  .range-bar-your{text-align:center;font-size:11px;font-weight:700;margin-top:3px;font-family:var(--mono);}
  .conf-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;font-size:11px;font-weight:600;border:1px solid;}
  .section-label{font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:7px;}
  .data-table{width:100%;border-collapse:collapse;font-size:13px;}
  .data-table tr{border-bottom:1px solid var(--border);}
  .data-table tr:last-child{border-bottom:none;}
  .data-table td{padding:7px 0;vertical-align:top;}
  .data-table td:last-child{text-align:right;font-family:var(--mono);font-weight:700;white-space:nowrap;}
  .data-table td.sign-pos{color:#1a5c34;}
  .data-table tfoot td{font-weight:700;padding-top:9px;border-top:2px solid var(--t1);}
  .notice{padding:11px 13px;border-left:3px solid;font-size:13px;line-height:1.6;}
  .notice a{color:inherit;font-weight:600;}
  .notice-green{background:#f0f7f2;border-color:var(--accent);color:#1a4a28;}
  .notice-amber{background:#fdf8f0;border-color:#b37a00;color:#5a3d00;}
  /* Muted, government-style information panel (less marketing-y than .notice-green). */
  .info-box{background:#fafbfc;border:1px solid #e3e7e3;border-left:3px solid #708a78;padding:12px 14px;margin:0;border-radius:2px;}
  .info-box-label{font-size:10px;font-weight:600;color:#5a7060;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;}
  .info-box-body{font-size:13px;color:#2f3a32;line-height:1.55;}
  .action-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .btn-secondary{padding:9px 12px;background:var(--white);border:1px solid var(--border-dark);color:var(--t2);font-size:13px;font-weight:600;cursor:pointer;text-align:center;}
  .btn-secondary:hover{background:#f0f0f0;}
  .share-row{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
  .share-btn{padding:8px 4px;font-size:11px;font-weight:700;text-decoration:none;text-align:center;cursor:pointer;border:none;}
  .sources{font-size:11px;color:var(--t3);line-height:1.6;padding-top:14px;border-top:1px solid var(--border);margin-top:20px;}
  .sources a{color:var(--t3);text-decoration:underline;}

  .mobile-sticky-cta{display:none;}
  @media(max-width:760px){
    .mobile-sticky-cta{display:block;position:fixed;left:0;right:0;bottom:0;padding:6px 12px env(safe-area-inset-bottom);background:rgba(255,255,255,0.96);border-top:1px solid #d8dde2;z-index:50;backdrop-filter:saturate(140%) blur(8px);box-shadow:0 -1px 6px rgba(0,0,0,0.05);}
    .mobile-sticky-cta a{display:block;background:#1a5c34;color:#fff;text-align:center;padding:11px;font-size:13px;font-weight:600;text-decoration:none;border-radius:4px;letter-spacing:0.01em;}
    .page-wrap{padding-bottom:68px;}
    .frc-footer{margin-bottom:68px;}   /* keep footer above the sticky CTA */
    /* Calculator mobile ergonomics */
    .form-body{padding:16px;gap:16px;}
    .f-input,.f-select{padding:11px 12px;font-size:15px;}
    .f-select{padding-right:34px;}
    .field-label{font-size:11px;color:#5a6571;letter-spacing:0.03em;margin-bottom:5px;}
    .field-note{font-size:11px;color:#8a939c;line-height:1.5;margin-top:4px;}
  }

  .email-cap{position:relative;margin-top:16px;padding:16px 18px;background:var(--accent-bg);border:1px solid #a8d5b5;border-left:3px solid var(--accent);}
  .email-cap-ok{background:#f0f7f2;}
  .email-cap-x{position:absolute;top:6px;right:8px;background:none;border:none;font-size:16px;color:var(--t3);cursor:pointer;line-height:1;padding:4px;}
  .email-cap-x:hover{color:var(--t1);}
  .email-cap-title{font-size:14px;font-weight:700;color:var(--t1);margin-bottom:4px;}
  .email-cap-sub{font-size:12px;color:var(--t2);line-height:1.5;margin-bottom:10px;}
  .email-cap-form{display:flex;gap:6px;}
  .email-cap-in{flex-grow:1;padding:8px 10px;border:1px solid var(--border-dark);font-size:13px;background:#fff;border-radius:2px;font-family:var(--sans);}
  .email-cap-in:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px #d1e5d8;}
  .email-cap-btn{padding:8px 14px;background:var(--accent);color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer;border-radius:2px;white-space:nowrap;}
  .email-cap-btn:hover{background:#15492a;}
  .email-cap-btn:disabled{opacity:0.6;cursor:not-allowed;}

  .score-hero{text-align:center;padding:20px 14px;border-bottom:1px solid var(--border);}
  .score-number{font-family:var(--mono);font-size:48px;font-weight:700;line-height:1;}
  .score-of-ten{font-family:var(--mono);font-size:18px;font-weight:400;color:var(--t3);}
  .score-label-badge{display:inline-block;padding:3px 10px;font-size:12px;font-weight:700;margin-top:8px;letter-spacing:0.04em;}
  .score-summary{font-size:13px;color:var(--t2);margin-top:8px;line-height:1.5;}
  .score-breakdown{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px;}
  .score-breakdown-item{text-align:center;padding:8px 6px;background:#f9f9f9;border:1px solid var(--border);}
  .score-breakdown-val{font-family:var(--mono);font-size:16px;font-weight:700;color:var(--t1);}
  .score-breakdown-label{font-size:10px;color:var(--t3);margin-top:2px;text-transform:uppercase;letter-spacing:0.04em;}

  .psf-section{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#f9f9f9;border:1px solid var(--border);flex-wrap:wrap;gap:8px;}
  .psf-val{font-family:var(--mono);font-size:15px;font-weight:700;}
  .psf-label{font-size:11px;color:var(--t3);}

  @media(max-width:768px){
    .page-grid{grid-template-columns:1fr;}
    .right-col{position:static;}
    .page-wrap{padding:16px 14px 48px;}
    .score-breakdown{grid-template-columns:1fr;}
  }
  @media(max-width:480px){
    .f-row{grid-template-columns:1fr;}
    .toggle-pair{grid-template-columns:1fr;}
    .share-row{grid-template-columns:1fr 1fr;}
    .gov-count{display:none;}
    .score-number{font-size:40px;}
  }

  /* Accessibility: visible focus for keyboard users */
  button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:2px;}
`;

// ─── Email Capture ────────────────────────────────────────────────────────────

function EmailCapture({ city, cityName }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [hide, setHide] = useState(() => {
    try { return localStorage.getItem("frc_email_"+city)==="1"; } catch { return false; }
  });
  if (hide) return null;

  async function submit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitting");
    const { error } = await supabase.from("email_subscribers").insert([{
      email: email.trim().toLowerCase(),
      city,
      source: "result_panel"
    }]);
    if (error && !String(error.message||"").toLowerCase().includes("duplicate")) {
      setStatus("error"); return;
    }
    try { localStorage.setItem("frc_email_"+city, "1"); } catch {}
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="email-cap email-cap-ok">
        <strong>Thanks. You are on the list.</strong><br/>
        We&apos;ll email you the next monthly {cityName} rent report.{" "}
        <button type="button" className="email-cap-x" aria-label="Dismiss" onClick={()=>setHide(true)}>×</button>
      </div>
    );
  }

  return (
    <div className="email-cap">
      <button type="button" className="email-cap-x" aria-label="Dismiss" onClick={()=>{ try{localStorage.setItem("frc_email_"+city,"1");}catch{}; setHide(true); }} title="Dismiss">×</button>
      <div className="email-cap-title">Get the monthly {cityName} rent report</div>
      <div className="email-cap-sub">One email per month. Free. Unsubscribe anytime. We never share your email.</div>
      <form onSubmit={submit} className="email-cap-form">
        <input
          type="email" required value={email}
          onChange={e=>setEmail(e.target.value)}
          placeholder="you@email.com"
          className="email-cap-in"
          autoComplete="email"
        />
        <button type="submit" className="email-cap-btn" disabled={status==="submitting"}>
          {status==="submitting" ? "..." : "Subscribe"}
        </button>
      </form>
      {status === "error" && (
        <div style={{fontSize:11,color:"#8b1a1a",marginTop:6}}>Something went wrong. Try again or email hello@fairrent.ca</div>
      )}
    </div>
  );
}

// ─── Result Panel ─────────────────────────────────────────────────────────────

function ResultPanel({ result, hood, unitType, onReset, t }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const copyRef = useRef(null);

  const unitLabel = t('unit_'+unitType) ?? unitType;
  const { breakdown:bd, conf, pos, range, rent, communityN, score } = result;
  const sl = getScoreLabel(score.finalScore);
  const posCopy = {
    below:  { headline:t('posHeadlineBelow'),  sub:t('posSubBelow')(fmt(range.low-rent), hood),   color:t('posColorBelow')  },
    above:  { headline:t('posHeadlineAbove'),  sub:t('posSubAbove')(fmt(rent-range.high), hood),  color:t('posColorAbove')  },
    within: { headline:t('posHeadlineWithin'), sub:t('posSubWithin')(hood),                       color:t('posColorWithin') },
  }[pos];
  const confLabelDisp = conf.label==='High' ? t('confH') : conf.label==='Medium' ? t('confM') : t('confL');
  const confDesc = conf.label==='High' ? t('confDescH')(communityN) : conf.label==='Medium' ? t('confDescM')(communityN) : t('confDescL');

  const barMin  = Math.round(range.low  * 0.85 / 50) * 50;
  const barMax  = Math.round(range.high * 1.15 / 50) * 50;
  const barSpan = barMax - barMin;
  const lowPct  = ((range.low  - barMin) / barSpan) * 100;
  const highPct = ((range.high - barMin) / barSpan) * 100;
  const rentPct = Math.max(2, Math.min(98, ((rent - barMin) / barSpan) * 100));

  function copyLink() {
    navigator.clipboard?.writeText(SHARE_URL);
    setCopied(true); clearTimeout(copyRef.current);
    copyRef.current = setTimeout(() => setCopied(false), 2000);
  }

  const shareText = () => {
    return `My ${unitLabel.toLowerCase()} in ${hood} scored ${score.finalScore}/10 on Fair Rent Canada. Check yours at ${SHARE_URL}`;
  };

  return (
    <div className="result-panel">
      {/* Submission acknowledgement */}
      <div className="result-thanks">
        <div className="result-thanks-tag">Thank you</div>
        <div className="result-thanks-text">
          Your anonymous rent helps the next renter in Vancouver understand the market.
          We only show grouped data, never individual submissions.
        </div>
      </div>
      {/* Score Hero */}
      <div className="score-hero" style={{ background:sl.bg, borderBottom:`1px solid ${sl.border}` }}>
        <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--t3)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>{t('scoreTitle')}</div>
        <div>
          <span className="score-number" style={{ color:sl.color }}>{score.finalScore}</span>
          <span className="score-of-ten"> / 10</span>
        </div>
        <div className="score-label-badge" style={{ background:sl.color, color:"#fff" }}>
          {t(sl.key)}
        </div>
        <div className="score-summary">
          {score.finalScore >= 7.5 ? t('scoreSumGood')(hood)
           : score.finalScore >= 6.0 ? t('scoreSumFair')(hood)
           : score.finalScore >= 4.5 ? t('scoreSumAbove')(hood)
           : t('scoreSumHigh')(hood)}
        </div>
        <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--t3)", marginTop:6 }}>
          {CITY_NAME} &middot; {hood} &middot; {unitLabel}
        </div>

        <div className="score-breakdown">
          <div className="score-breakdown-item">
            <div className="score-breakdown-val">{score.marketScore.toFixed(1)}</div>
            <div className="score-breakdown-label">{t('scoreMarket')}</div>
          </div>
          {score.psfScore !== null ? (
            <div className="score-breakdown-item">
              <div className="score-breakdown-val">{score.psfScore.toFixed(1)}</div>
              <div className="score-breakdown-label">{t('scorePsf')}</div>
            </div>
          ) : (
            <div className="score-breakdown-item">
              <div className="score-breakdown-val" style={{ color:"var(--t3)" }}>N/A</div>
              <div className="score-breakdown-label">{t('scorePsf')}</div>
            </div>
          )}
          <div className="score-breakdown-item">
            <div className="score-breakdown-val">{score.rcBonus.toFixed(1)}</div>
            <div className="score-breakdown-label">{t('scoreRC')}</div>
          </div>
        </div>

        {conf.label === "Low" && (
          <div style={{ fontSize:11, color:"var(--t3)", marginTop:8, fontStyle:"italic" }}>
            {t('limitedData')}
          </div>
        )}
      </div>

      <div className="result-body">
        {/* Price per sq ft */}
        {score.userPsf && (
          <div className="psf-section">
            <div>
              <div className="psf-label">{t('yourPsf')}</div>
              <div className="psf-val">${score.userPsf.toFixed(2)}/mo</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div className="psf-label">{hood} {t('hoodMedian')}</div>
              <div className="psf-val">${score.medPsf.toFixed(2)}/mo</div>
            </div>
            <div style={{ width:"100%", fontSize:11, color:"var(--t2)" }}>
              {score.userPsf <= score.medPsf
                ? t('psfLess')(Math.round((1 - score.userPsf/score.medPsf)*100))
                : t('psfMore')(Math.round((score.userPsf/score.medPsf - 1)*100))}
            </div>
          </div>
        )}

        {/* Range bar */}
        <div>
          <div className="section-label">{t('fairRange')}</div>
          <div style={{ fontSize:20, fontWeight:700, fontFamily:"var(--mono)", color:"var(--t1)", marginBottom:4 }}>
            {fmt(range.low)} &ndash; {fmt(range.high)}<span style={{ fontSize:13, fontWeight:400, color:"var(--t3)" }}> /mo</span>
          </div>
          <div style={{ position:"relative" }}>
            <div className="range-bar-track">
              <div className="range-bar-fill" style={{ left:lowPct+"%", width:Math.max(5, highPct-lowPct)+"%", background:posCopy.color }}/>
              <div className="range-bar-tick" style={{ left:lowPct+"%", background:posCopy.color, opacity:.6 }}/>
              <div className="range-bar-tick" style={{ left:highPct+"%", background:posCopy.color, opacity:.6 }}/>
              <div className="range-bar-dot"  style={{ left:rentPct+"%", borderColor:posCopy.color, background:pos==="within"?posCopy.color:"var(--white)" }}/>
            </div>
            <div className="range-bar-foot">
              <span>{fmt(barMin)}</span>
              <span>{fmt(barMax)}</span>
            </div>
            <div className="range-bar-your" style={{ color:posCopy.color }}>Your rent: {fmt(rent)}</div>
          </div>
          <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:"var(--t3)" }}>{t('dataConf')}:</span>
            <span className="conf-badge" style={{ background:conf.bg, borderColor:conf.border, color:conf.textColor }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:conf.dot, display:"inline-block" }}/>
              {confLabelDisp}
            </span>
            <span style={{ fontSize:11, color:"var(--t3)" }}>{confDesc}</span>
          </div>
        </div>

        <p style={{ fontSize:13, color:"var(--t2)", lineHeight:1.65, borderLeft:"3px solid var(--border)", paddingLeft:10 }}>{posCopy.sub}</p>

        {/* Expandable breakdown */}
        <div>
          <button onClick={()=>setShowBreakdown(b=>!b)} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"var(--sans)", fontSize:13, fontWeight:600, color:"var(--accent)", padding:0 }}>
            {showBreakdown ? t('hideBreakdown') : t('howBuilt')} {showBreakdown ? "\u25B2" : "\u25BC"}
          </button>
          {showBreakdown && (
            <table className="data-table" style={{ marginTop:8 }}>
              <tbody>
                <tr>
                  <td style={{ color:"var(--t2)" }}>{t('cityBase')(unitLabel.toLowerCase())}</td>
                  <td>{fmt(bd.base)}</td>
                </tr>
                <tr>
                  <td style={{ color:"var(--t2)" }}>
                    {t('hoodAdjLbl')}<br/>
                    <span style={{ fontSize:11, color:"var(--t3)" }}>{hood}: {bd.hoodMult>=1 ? t('hoodAbove') : t('hoodBelow')} {t('cityAvg')} ({((bd.hoodMult-1)*100).toFixed(0)}%)</span>
                  </td>
                  <td className={bd.hoodAdj>=0?"sign-pos":"sign-neg"}>
                    {bd.hoodAdj>=0?"+":""}{fmt(bd.hoodAdj)}
                  </td>
                </tr>
                {(bd.parkingAdj>0||bd.utilitiesAdj>0) && (
                  <tr>
                    <td style={{ color:"var(--t2)" }}>
                      {t('amenities')}<br/>
                      <span style={{ fontSize:11, color:"var(--t3)" }}>
                        {[bd.parkingAdj>0&&t('parkingAmt'), bd.utilitiesAdj>0&&t('utilitiesAmt')].filter(Boolean).join(", ")}
                      </span>
                    </td>
                    <td>+{fmt(bd.parkingAdj+bd.utilitiesAdj)}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ color:"var(--t2)" }}>
                    {t('localData')}<br/>
                    <span style={{ fontSize:11, color:"var(--t3)" }}>
                      {bd.communityN<5 ? t('fewSubs') : t('subWeight')(bd.communityN, Math.round(bd.w*100))}
                    </span>
                  </td>
                  <td className={bd.communityAdj===0?"":bd.communityAdj>0?"sign-pos":"sign-neg"}>
                    {bd.communityAdj===0?"\u2014":(bd.communityAdj>0?"+":"")+fmt(bd.communityAdj)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ color:"var(--t1)" }}>{t('benchLblMidpoint')}</td>
                  <td>{fmt(bd.finalBench)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* BC Rent control */}
        {!result.sameYear && (
          <div>
            <div className="section-label">{t('bcRC')}</div>
            <div className="notice notice-green">
              <strong>{t('bcRCApplies')}</strong> {t('bcRCDesc')} <strong>{fmt(result.guidelineCap)}/mo</strong>.
              {result.rent > result.guidelineCap
                ? <span style={{ display:"block", marginTop:6, color:"#8b1a1a", fontWeight:600 }}>{t('bcRCOver')(fmt(result.rent))}</span>
                : <span style={{ display:"block", marginTop:4 }}>{t('bcRCWithin')(fmt(result.rent))}</span>
              }
              <a href="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/rent-increases" target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", marginTop:8, fontSize:12 }}>{t('bcRCLink')}</a>
            </div>
            <div style={{ fontSize:11, color:"var(--t3)", marginTop:6, lineHeight:1.5 }}>
              {t('bcRCNote')}
            </div>
          </div>
        )}

        {/* Data note */}
        <div style={{ fontSize:12, color:"var(--t3)", lineHeight:1.6, borderTop:"1px solid var(--border)", paddingTop:12 }}>
          This is a market estimate, not a legal determination. Results vary by building age, condition, floor, and included features.
          Sources: CMHC Rental Market Survey (Oct 2024) &middot; Rentals.ca (Feb 2025) &middot; Anonymous submissions.
        </div>

        {/* Actions */}
        <div className="action-row">
          <button className="btn-secondary" onClick={onReset}>{t('startOver')}</button>
          <button className="btn-secondary" onClick={() => setShareOpen(s=>!s)}>{t('shareResult')}</button>
        </div>

        {shareOpen && (
          <div>
            <div className="section-label" style={{ marginBottom:6 }}>{t('shareLabel')}</div>
            <div className="share-row">
              <a className="share-btn" href={"https://www.reddit.com/submit?url="+SHARE_URL+"&title="+encodeURIComponent(shareText())} target="_blank" rel="noopener noreferrer" style={{ background:"#ff4500", color:"#fff" }}>Reddit</a>
              <a className="share-btn" href={"https://twitter.com/intent/tweet?text="+encodeURIComponent(shareText())} target="_blank" rel="noopener noreferrer" style={{ background:"#000", color:"#fff" }}>X</a>
              <a className="share-btn" href={"https://www.threads.net/intent/post?text="+encodeURIComponent(shareText())} target="_blank" rel="noopener noreferrer" style={{ background:"#111", color:"#fff" }}>Threads</a>
              <button className="share-btn" onClick={copyLink} style={{ background:copied?"#f0f7f2":"#f5f5f5", border:"1px solid #ccc", color:copied?"#1a5c34":"var(--t2)" }}>{copied ? t('copied') : t('copyLink')}</button>
            </div>
          </div>
        )}

        <div className="help-another">
          <div className="help-another-tag">Help another renter</div>
          <div className="help-another-q">Was this helpful?</div>
          <div className="help-another-d">Share Fair Rent with someone else in Vancouver. The more renters submit, the more useful the data becomes for everyone.</div>
          <div className="help-another-row">
            <a className="help-another-btn help-another-btn-fill" href={"https://twitter.com/intent/tweet?text="+encodeURIComponent("I just checked if my "+CITY_NAME+" rent is fair on fairrent.ca")} target="_blank" rel="noopener noreferrer">Share on X</a>
            <a className="help-another-btn help-another-btn-fill" href={"https://www.reddit.com/submit?url="+SHARE_URL+"&title="+encodeURIComponent("Fair Rent Canada — see what real renters pay")} target="_blank" rel="noopener noreferrer">Share on Reddit</a>
            <button className="help-another-btn help-another-btn-out" onClick={copyLink}>{copied ? t('copied') : t('copyLink')}</button>
          </div>
        </div>

        <EmailCapture city="vancouver" cityName="Vancouver"/>
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const curYear = new Date().getFullYear();

  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('frc_lang') || 'en'; } catch { return 'en'; }
  });
  const t = key => (STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key);
  function toggleLang() {
    const next = lang === 'en' ? 'fr' : 'en';
    setLang(next);
    try { localStorage.setItem('frc_lang', next); } catch {}
  }

  const [hood,       setHood]       = useState("");
  const [unitType,   setUnitType]   = useState("");
  const [rent,       setRent]       = useState("");
  const [moveInYear, setMoveInYear] = useState("");
  const [sqft,       setSqft]       = useState("");
  const [parking,    setParking]    = useState(false);
  const [utilities,  setUtilities]  = useState(false);
  const [errors,     setErrors]     = useState({});

  const [result,      setResult]      = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [saveWarning, setSaveWarning] = useState("");

  const [smartBench,  setSmartBench]  = useState(null);
  const [communityN,  setCommunityN]  = useState(0);
  const [benchReady,  setBenchReady]  = useState(false);

  const [rawCount,    setRawCount]    = useState(0);
  const [countLoaded, setCountLoaded] = useState(false);
  const displayCount = useCountUp(countLoaded ? rawCount : 0);
  const [showHood,    setShowHood]    = useState(null);

  useEffect(() => {
    const path = window.location.pathname.replace(/^\//, '');
    if (path && path !== 'map') {
      const found = Object.entries(VANCOUVER_HOODS).find(([, h]) => h.slug === path);
      if (found) setShowHood(found[0]);
    }
    function onPop() {
      const s = window.location.pathname.replace(/^\//, '');
      if (!s || s === 'map') { setShowHood(null); return; }
      const f = Object.entries(VANCOUVER_HOODS).find(([, h]) => h.slug === s);
      setShowHood(f ? f[0] : null);
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // URL hash handler: if landing on /#form (or /#check), scroll to the form
  // panel after React has actually rendered it. The browser's initial native
  // hash-scroll runs before React mounts, so we redo it here.
  useEffect(() => {
    const target = window.location.hash?.replace('#','');
    if (!target) return;
    // Two attempts: one quick (covers fast render), one slower (covers Supabase fetch wait).
    const tries = [60, 350];
    const timers = tries.map(ms => setTimeout(() => {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
    }, ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const KEY = CITY+"_count_cache";
    try { const {count,ts}=JSON.parse(localStorage.getItem(KEY)||"{}"); if(Date.now()-ts<5*60*1000){setRawCount(count);setCountLoaded(true);} } catch{}
    supabase.from("rent_submissions").select("*",{count:"exact",head:true}).eq("city",CITY)
      .then(({count})=>{ const n=count??0; setRawCount(n); setCountLoaded(true); try{localStorage.setItem(KEY,JSON.stringify({count:n,ts:Date.now()}));}catch{} });
  }, []);

  useEffect(() => {
    if (!hood||!unitType){ setSmartBench(null); setCommunityN(0); setBenchReady(false); return; }
    setBenchReady(false);
    const cutoff=new Date(); cutoff.setFullYear(curYear-2);
    supabase.from("rent_submissions").select("monthly_rent")
      .eq("city",CITY).eq("neighborhood",hood).eq("unit_type",unitType)
      .gte("monthly_rent",500).lte("monthly_rent",8000).gte("created_at",cutoff.toISOString())
      .then(({data})=>{
        const base=Math.round((BASES[unitType]??BASES["1br"])*(HOODS[hood]??1));
        if(!data?.length){setSmartBench(base);setCommunityN(0);setBenchReady(true);return;}
        const n=data.length,w=communityWeight(n),med=median(data.map(r=>r.monthly_rent));
        setCommunityN(n); setSmartBench(w===0?base:Math.round(base*(1-w)+med*w)); setBenchReady(true);
      });
  }, [hood, unitType]);

  function validate() {
    const e={};
    if(!hood)                              e.hood=t('errHood');
    if(!unitType)                          e.unitType=t('errUnit');
    if(!rent||isNaN(+rent)||+rent<300)     e.rent=t('errRent');
    const yr=+moveInYear;
    if(!moveInYear||yr<1980||yr>curYear)   e.moveInYear=t('errYear')(curYear);
    if(sqft && (isNaN(+sqft) || +sqft < 100 || +sqft > 10000)) e.sqft=t('errSqft');
    return e;
  }

  async function handleCalc() {
    const e=validate();
    if(Object.keys(e).length){setErrors(e);return;}
    setErrors({}); setSaveWarning(""); setSubmitting(true);

    const rentNum=+rent, yr=+moveInYear, sameYear=yr===curYear;
    const sqftNum = sqft ? +sqft : null;
    const bd    = buildBreakdown(hood,unitType,parking,utilities,smartBench,communityN);
    const conf  = getConf(communityN);
    const range = getRange(bd.finalBench,conf.label,unitType);
    const pos   = rentNum<range.low?"below":rentNum>range.high?"above":"within";

    const yearsAgo    = Math.max(0,curYear-yr);
    const moveinBench = Math.round(bd.finalBench*Math.pow(1-INFLATION,yearsAgo));
    // BC: rent control applies to ALL tenancies, so always calculate guideline cap
    const guidelineCap= !sameYear ? calcGuidelineCap(moveinBench,yr) : null;

    const scoreData = calcFairRentScore(rentNum, range, sqftNum, unitType, guidelineCap, sameYear);

    setResult({rent:rentNum,range,conf,pos,breakdown:bd,moveinBench,guidelineCap,sameYear,moveInYear:yr,communityN,score:scoreData});

    try {
      const last=Number(localStorage.getItem(COOLDOWN_KEY)??0);
      if(Date.now()-last>=COOLDOWN_MS){
        const{error}=await supabase.from("rent_submissions").insert({
          neighborhood:hood,unit_type:unitType,monthly_rent:rentNum,
          move_in_year:yr,includes_parking:parking,includes_utilities:utilities,city:CITY,
        });
        if(!error){localStorage.setItem(COOLDOWN_KEY,String(Date.now()));setRawCount(p=>p+1);}
        else setSaveWarning("Result shown. Your submission was not saved due to a server error.");
      }
    } catch { setSaveWarning("Result shown. Your submission was not saved."); }
    finally { setSubmitting(false); }
  }

  function handleReset() {
    setResult(null); setHood(""); setUnitType(""); setRent(""); setMoveInYear(""); setSqft("");
    setParking(false); setUtilities(false); setErrors({}); setSaveWarning("");
    window.scrollTo(0,0);
  }

  const previewBench = benchReady&&smartBench!=null
    ? Math.round(smartBench)+(parking?ADDONS.parking:0)+(utilities?ADDONS.utilities:0)
    : null;
  const benchLabel = communityN>=20?`${communityN} local submissions`:communityN>=5?`${communityN} submissions + CMHC`:"CMHC baseline";

  if (showHood) return (
    <NeighbourhoodPage
      hood={VANCOUVER_HOODS[showHood]}
      city={VANCOUVER_CITY}
      onBack={() => { setShowHood(null); window.history.pushState({}, '', '/'); window.scrollTo(0,0); }}
    />
  );

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:"var(--bg)" }}>

        <Nav
          homeHref="https://fairrent.ca"
          citySuffix={"Vancouver"}
          actions={{
            onBlog:           () => { window.location.href = "https://fairrent.ca/blog"; },
            onExploreCities:  () => { window.location.href = "https://fairrent.ca/"; },
            onNeighbourhoods: () => { window.location.href = "https://fairrent.ca/map"; },
            onSubmitRent:     () => { const el=document.getElementById("form"); if(el) el.scrollIntoView({behavior:"smooth",block:"start"}); else window.scrollTo({top:0,behavior:"smooth"}); },
            onAbout:          () => { window.location.href = "https://fairrent.ca/about"; },
            onToggleLang:     toggleLang,
          }}
          labels={{
            blog:           lang === "fr" ? "Blogue"             : "Blog",
            cities:         lang === "fr" ? "Villes"             : "Cities",
            neighbourhoods: lang === "fr" ? "Quartiers"          : "Neighbourhoods",
            submit:         lang === "fr" ? "Partager mon loyer" : "Share my rent",
            about:          lang === "fr" ? "À propos"           : "About",
            primaryCta:     lang === "fr" ? "Partager mon loyer" : "Share my rent",
            langLabel:      lang === "fr" ? "English"            : "Français",
            menu:           lang === "fr" ? "Menu"               : "Menu",
            close:          lang === "fr" ? "Fermer"             : "Close",
          }}
        />

        <div className="page-wrap">

          {/* Community hero — Vancouver-focused Glassdoor framing.
              SEO H1 is still the pageTitle string but rendered as a screen-reader-only
              span so the new editorial headline can lead visually. */}
          <section className="city-hero">
            <h1 style={{position:"absolute",width:1,height:1,padding:0,margin:-1,overflow:"hidden",clip:"rect(0,0,0,0)",whiteSpace:"nowrap",border:0}}>{t('pageTitle')}</h1>
            <div className="city-hero-eyebrow">{t('heroEyebrow')}</div>
            <div style={{fontFamily:"var(--serif)",fontSize:"clamp(26px,3.4vw,40px)",fontWeight:700,color:"var(--t1)",lineHeight:1.12,letterSpacing:"-0.01em",marginBottom:12,maxWidth:760}}>{t('heroTitle')}</div>
            <p className="city-hero-sub"><strong>{t('heroSubStrong')}</strong> {t('heroSubRest')}</p>
            <div className="city-hero-actions">
              <button className="city-hero-btn city-hero-btn-primary" onClick={()=>{const el=document.getElementById("form"); if(el) el.scrollIntoView({behavior:"smooth",block:"start"}); window.frc?.track?.('city_hero_primary_click',{city:CITY});}}>{t('heroCtaPrimary')}</button>
              <a className="city-hero-btn city-hero-btn-ghost" href="https://fairrent.ca/map" onClick={()=>window.frc?.track?.('city_hero_explore_click',{city:CITY})}>{t('heroCtaSecondary')}</a>
            </div>
            <div className="city-hero-ticker" aria-live="polite">
              {countLoaded ? (
                <>
                  <span>{t('heroTickerPre')}</span>
                  <span className="city-hero-ticker-num">{displayCount.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA")}</span>
                  <span>{t('heroTickerPost')}</span>
                </>
              ) : (
                <span>{t('heroLoading')}</span>
              )}
            </div>
          </section>

          {/* Neighbourhood browse */}
          <div className="hood-section">
            <div className="hood-label">{t('browseByHood')}</div>
            <div className="hood-pills">
              {Object.keys(VANCOUVER_HOODS).map(key => {
                const h = VANCOUVER_HOODS[key];
                return (
                  <a
                    key={key}
                    href={"/" + h.slug}
                    className="hood-pill"
                    onClick={e => { e.preventDefault(); setShowHood(key); window.history.pushState({}, '', '/' + h.slug); }}
                  >
                    {h.name}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="page-grid">

            {/* LEFT: Form */}
            <div className="left-col">
              <div id="form" className="form-panel" style={{scrollMarginTop:60}}>
                <div className="form-panel-header">
                  <div className="form-panel-title">{t('formTitle')}</div>
                  <div className="form-panel-sub">{t('formSub')}</div>
                </div>
                <div className="form-body">

                  <div className="f-row">
                    <div>
                      <label className="field-label">{t('labelHood')}</label>
                      <select className="f-select" value={hood} onChange={e=>setHood(e.target.value)} style={{ borderColor:errors.hood?"#8b1a1a":undefined }}>
                        <option value="">{t('selectDots')}</option>
                        {NEIGHBORHOODS.map(n=><option key={n} value={n}>{n}</option>)}
                      </select>
                      {errors.hood&&<div className="field-error">{errors.hood}</div>}
                    </div>
                    <div>
                      <label className="field-label">{t('labelUnit')}</label>
                      <select className="f-select" value={unitType} onChange={e=>setUnitType(e.target.value)} style={{ borderColor:errors.unitType?"#8b1a1a":undefined }}>
                        <option value="">{t('selectDots')}</option>
                        {UNITS.map(u=><option key={u.key} value={u.key}>{t('unit_'+u.key)}</option>)}
                      </select>
                      {errors.unitType&&<div className="field-error">{errors.unitType}</div>}
                    </div>
                  </div>

                  <div className="f-row">
                    <div>
                      <label className="field-label">{t('labelRent')}</label>
                      <input className="f-input" type="number" placeholder="e.g. 2800" value={rent} onChange={e=>setRent(e.target.value)} style={{ borderColor:errors.rent?"#8b1a1a":undefined }}/>
                      {errors.rent&&<div className="field-error">{errors.rent}</div>}
                    </div>
                    <div>
                      <label className="field-label">{t('labelYear')}</label>
                      <input className="f-input" type="number" placeholder={String(curYear)} value={moveInYear} onChange={e=>setMoveInYear(e.target.value)} style={{ borderColor:errors.moveInYear?"#8b1a1a":undefined }}/>
                      {errors.moveInYear&&<div className="field-error">{errors.moveInYear}</div>}
                      <div className="field-note">{t('yearMicro')}</div>
                    </div>
                  </div>

                  {/* Square footage (optional) */}
                  <div>
                    <label className="field-label">{t('labelSqft')} <span style={{ fontWeight:400, textTransform:"none" }}>({t('sqftOptional')})</span></label>
                    <input className="f-input" type="number" placeholder="e.g. 550" value={sqft} onChange={e=>setSqft(e.target.value)} style={{ maxWidth:200, borderColor:errors.sqft?"#8b1a1a":undefined }}/>
                    {errors.sqft&&<div className="field-error">{errors.sqft}</div>}
                    <div className="field-note">{t('sqftNote')}</div>
                  </div>

                  {/* No rent control question needed for BC: it applies to ALL tenancies */}
                  <div className="info-box">
                    <div className="info-box-label">BC rent control</div>
                    <div className="info-box-body">{t('bcRCNotice')}</div>
                  </div>

                  {/* Toggles */}
                  <div>
                    <label className="field-label">{t('rentIncludes')}</label>
                    <div className="toggle-pair">
                      <label className={"toggle-item"+(parking?" on":"")}>
                        <input type="checkbox" checked={parking} onChange={e=>setParking(e.target.checked)}/>
                        <div>
                          <div className="toggle-item-text">{t('labelParking')}</div>
                          <div className="toggle-item-sub">{t('parkingSub')}</div>
                        </div>
                      </label>
                      <label className={"toggle-item"+(utilities?" on":"")}>
                        <input type="checkbox" checked={utilities} onChange={e=>setUtilities(e.target.checked)}/>
                        <div>
                          <div className="toggle-item-text">{t('labelUtilities')}</div>
                          <div className="toggle-item-sub">{t('utilitiesSub')}</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Benchmark preview */}
                  {hood&&unitType&&benchReady&&previewBench!=null&&(
                    <div className="bench-preview">
                      <div>
                        <div className="bench-label">{t('benchLbl')(CITY_NAME, hood)}</div>
                        <div className="bench-val">{fmt(previewBench)}<span style={{ fontSize:12, fontWeight:400, color:"var(--t3)" }}>/mo</span></div>
                      </div>
                      <div className="bench-source">{benchLabel}</div>
                    </div>
                  )}

                  <button className="btn-submit" onClick={handleCalc} disabled={submitting}>
                    {submitting ? t('btnProcessing') : t('btnCompare')}
                  </button>
                  <div className="btn-anon">{t('anonNote')}</div>
                </div>
              </div>

              {/* Market snapshot */}
              <div className="snapshot">
                <div className="snapshot-header">{t('snapshotTitle')}</div>
                {MARKET_SNAPSHOT.map(({label,val}) => (
                  <div key={label} className="snapshot-row">
                    <span className="snapshot-key">{label}</span>
                    <span className="snapshot-val">{val}</span>
                  </div>
                ))}
                <div style={{ padding:"8px 14px", fontSize:11, color:"var(--t3)", borderTop:"1px solid var(--border)" }}>
                  Source: CMHC 2025 Rental Market Report &middot; Rentals.ca Feb 2025 &middot; BC Residential Tenancy Branch
                </div>
              </div>

              {saveWarning&&(
                <div className="notice notice-amber">{saveWarning}</div>
              )}
            </div>

            {/* RIGHT: Result */}
            <div className="right-col">
              {result ? (
                <ResultPanel result={result} hood={hood} unitType={unitType} onReset={handleReset} t={t}/>
              ) : (
                <div className="result-panel">
                  <div className="result-placeholder">
                    <div className="result-placeholder-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    </div>
                    <p>{t('resultPlaceholder')} <strong>{t('btnCompare')}</strong>.</p>
                    <div style={{ marginTop:20, textAlign:"left", border:"1px solid var(--border)", padding:"12px 14px" }}>
                      <div className="section-label" style={{ marginBottom:8 }}>{t('whatYouGet')}</div>
                      {t('resultItems').map(item=>(
                        <div key={item} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:6 }}>
                          <span style={{ color:"var(--accent)", fontWeight:700, flexShrink:0, marginTop:1 }}>&#10003;</span>
                          <span style={{ fontSize:13, color:"var(--t2)", lineHeight:1.4 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sources */}
          <div className="sources">
            Data sources: CMHC Rental Market Survey (October 2024) &middot; Rentals.ca National Rent Report (February 2025) &middot; BC Residential Tenancy Branch &middot; Anonymous community submissions. &nbsp;
            Results are market estimates for general reference only. Not legal or financial advice. &nbsp;
            <a href="https://fairrent.ca/methodology" style={{ color:"var(--t3)" }}>Methodology</a> &middot;
            <a href="https://fairrent.ca/privacy" style={{ color:"var(--t3)", marginLeft:6 }}>Privacy</a>
          </div>
        </div>
      </div>
      <div className="mobile-sticky-cta">
        <a href="#top" onClick={e=>{e.preventDefault();const el=document.getElementById('form');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});else window.scrollTo({top:0,behavior:'smooth'});}}>Check my rent →</a>
              <Footer
          compact={true}
          citySuffix={"Vancouver"}
        />
</div>
    </>
  );
}
