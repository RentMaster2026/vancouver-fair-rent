// buildingData.js
// Vancouver and Metro Vancouver building seed database for the FairRent
// Canada rent calculator, submission flow, and building ranking pages.
//
// This is a seed list, not a complete index of every rental building in
// Metro Vancouver. The submission form must always let renters choose:
//   - Other building or address
//   - I prefer not to say
//
// Privacy thresholds:
//   MIN_SUBS_FOR_AVG   = 3   minimum to show a grouped average
//   MIN_SUBS_FOR_SCORE = 5   minimum to publish a building score
//   MIN_SUBS_FOR_MED   = 8   medium confidence label
//   MIN_SUBS_FOR_HIGH  = 20  high confidence label

export const MIN_SUBS_FOR_AVG   = 3;
export const MIN_SUBS_FOR_SCORE = 5;
export const MIN_SUBS_FOR_MED   = 8;
export const MIN_SUBS_FOR_HIGH  = 20;

// ─── Neighbourhood groups (canonical building-side labels) ────────────────────

export const VANCOUVER_NEIGHBOURHOODS = {
  "downtown":              { name: "Downtown Vancouver", hoodKey: "downtown" },
  "yaletown":              { name: "Yaletown",            hoodKey: "yaletown" },
  "west-end":              { name: "West End",            hoodKey: "westend" },
  "coal-harbour":          { name: "Coal Harbour",        hoodKey: "coalharbour" },
  "gastown":               { name: "Gastown",             hoodKey: "gastown" },
  "chinatown":             { name: "Chinatown",           hoodKey: "chinatown" },
  "crosstown":             { name: "Crosstown",           hoodKey: "downtown" },
  "false-creek":           { name: "False Creek",         hoodKey: "fairview" },
  "olympic-village":       { name: "Olympic Village",     hoodKey: "mountpleasant" },
  "mount-pleasant":        { name: "Mount Pleasant",      hoodKey: "mountpleasant" },
  "main-street":           { name: "Main Street",         hoodKey: "mainstreet" },
  "commercial-drive":      { name: "Commercial Drive",    hoodKey: "commercialdrive" },
  "grandview-woodland":    { name: "Grandview Woodland",  hoodKey: "grandviewwoodland" },
  "hastings-sunrise":      { name: "Hastings Sunrise",    hoodKey: "grandviewwoodland" },
  "renfrew-collingwood":   { name: "Renfrew Collingwood", hoodKey: "grandviewwoodland" },
  "joyce-collingwood":     { name: "Joyce Collingwood",   hoodKey: "grandviewwoodland" },
  "kensington":            { name: "Kensington Cedar Cottage", hoodKey: "mainstreet" },
  "fraser":                { name: "Fraser",              hoodKey: "mainstreet" },
  "killarney":             { name: "Killarney",           hoodKey: "mainstreet" },
  "river-district":        { name: "River District",      hoodKey: "mainstreet" },
  "marpole":               { name: "Marpole",             hoodKey: "richmond" },
  "cambie-corridor":       { name: "Cambie Corridor",     hoodKey: "southgranville" },
  "oakridge":              { name: "Oakridge",            hoodKey: "southgranville" },
  "south-vancouver":       { name: "South Vancouver",     hoodKey: "richmond" },
  "kitsilano":             { name: "Kitsilano",           hoodKey: "kitsilano" },
  "point-grey":            { name: "Point Grey",          hoodKey: "dunbar" },
  "ubc":                   { name: "UBC",                 hoodKey: "dunbar" },
  "burnaby":               { name: "Burnaby",             hoodKey: "burnaby" },
  "brentwood":             { name: "Brentwood",           hoodKey: "burnaby" },
  "metrotown":             { name: "Metrotown",           hoodKey: "burnaby" },
  "lougheed":              { name: "Lougheed",            hoodKey: "burnaby" },
  "edmonds":               { name: "Edmonds",             hoodKey: "burnaby" },
  "highgate":              { name: "Highgate",            hoodKey: "burnaby" },
  "sfu":                   { name: "SFU",                 hoodKey: "burnaby" },
  "new-westminster":       { name: "New Westminster",     hoodKey: "newwestminster" },
  "sapperton":             { name: "Sapperton",           hoodKey: "newwestminster" },
  "downtown-new-west":     { name: "Downtown New Westminster", hoodKey: "newwestminster" },
  "quayside":              { name: "Quayside",            hoodKey: "newwestminster" },
  "richmond":              { name: "Richmond",            hoodKey: "richmond" },
  "brighouse":             { name: "Brighouse",           hoodKey: "richmond" },
  "lansdowne":             { name: "Lansdowne",           hoodKey: "richmond" },
  "richmond-oval":         { name: "Richmond Oval",       hoodKey: "richmond" },
  "steveston":             { name: "Steveston",           hoodKey: "richmond" },
  "north-vancouver":       { name: "North Vancouver",     hoodKey: "northvancouver" },
  "lower-lonsdale":        { name: "Lower Lonsdale",      hoodKey: "northvancouver" },
  "central-lonsdale":      { name: "Central Lonsdale",    hoodKey: "northvancouver" },
  "lynn-creek":            { name: "Lynn Creek",          hoodKey: "northvancouver" },
  "lynn-valley":           { name: "Lynn Valley",         hoodKey: "northvancouver" },
  "lions-gate":            { name: "Lions Gate",          hoodKey: "northvancouver" },
  "west-vancouver":        { name: "West Vancouver",      hoodKey: "northvancouver" },
  "ambleside":             { name: "Ambleside",           hoodKey: "northvancouver" },
  "park-royal":            { name: "Park Royal",          hoodKey: "northvancouver" },
  "surrey":                { name: "Surrey",              hoodKey: null },
  "surrey-central":        { name: "Surrey Central",      hoodKey: null },
  "guildford":             { name: "Guildford",           hoodKey: null },
  "fleetwood":             { name: "Fleetwood",           hoodKey: null },
  "newton":                { name: "Newton",              hoodKey: null },
  "south-surrey":          { name: "South Surrey",        hoodKey: null },
  "coquitlam":             { name: "Coquitlam",           hoodKey: null },
  "coquitlam-centre":      { name: "Coquitlam Centre",    hoodKey: null },
  "burquitlam":            { name: "Burquitlam",          hoodKey: null },
  "port-moody":            { name: "Port Moody",          hoodKey: null },
  "suter-brook":           { name: "Suter Brook",         hoodKey: null },
  "newport-village":       { name: "Newport Village",     hoodKey: null },
};

// ─── Building seed list ───────────────────────────────────────────────────────

export const VANCOUVER_BUILDINGS = [

  // ─── West End / Coal Harbour / Downtown Vancouver ──────────────────────────
  { id: "the-lauren",            name: "The Lauren",                aliases: ["1051 Broughton", "1051 Broughton Street"],                                                neighbourhood: "west-end",     address: "1051 Broughton Street",  type: "purpose-built", priority: "high",   sourceType: "verified" },
  { id: "the-duke-vancouver",    name: "The Duke",                  aliases: ["The Duke Vancouver", "The Duke West End"],                                                neighbourhood: "west-end",     address: null,                     type: "purpose-built", priority: "high",   sourceType: "verified" },
  { id: "the-melbourne",         name: "The Melbourne",             aliases: [],                                                                                         neighbourhood: "west-end",     address: null,                     type: "purpose-built", priority: "medium", sourceType: "partial" },
  { id: "the-remington",         name: "The Remington",             aliases: [],                                                                                         neighbourhood: "west-end",     address: null,                     type: "purpose-built", priority: "medium", sourceType: "partial" },
  { id: "the-standard",          name: "The Standard",              aliases: [],                                                                                         neighbourhood: "west-end",     address: null,                     type: "purpose-built", priority: "medium", sourceType: "partial" },
  { id: "the-westridge",         name: "The Westridge",             aliases: ["4170 Nanaimo", "4180 Nanaimo"],                                                            neighbourhood: "renfrew-collingwood", address: "4170 Nanaimo Street", type: "purpose-built", priority: "medium", sourceType: "partial" },
  { id: "the-charleson",         name: "The Charleson",             aliases: ["499 Pacific", "The Pacific"],                                                              neighbourhood: "yaletown",     address: "499 Pacific Street",     type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "grosvenor-pacific",     name: "Grosvenor Pacific",         aliases: [],                                                                                         neighbourhood: "yaletown",     address: null,                     type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "the-arc",               name: "The Arc",                   aliases: ["Arc Vancouver"],                                                                          neighbourhood: "yaletown",     address: "89 Nelson Street",       type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "vancouver-house",       name: "Vancouver House",           aliases: ["Vancouver House Rentals"],                                                                neighbourhood: "yaletown",     address: "1480 Howe Street",       type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "the-butterfly",         name: "The Butterfly",             aliases: [],                                                                                         neighbourhood: "downtown",     address: "969 Burrard Street",     type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "the-alberni",           name: "The Alberni",               aliases: ["1550 Alberni", "Alberni by Kengo Kuma", "Kengo Kuma Tower", "Westbank Alberni"],          neighbourhood: "coal-harbour", address: "1550 Alberni Street",    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "the-cardero",           name: "The Cardero",               aliases: ["Cardero"],                                                                                neighbourhood: "coal-harbour", address: "1335 West Cordova Street", type: "condo",       priority: "high",   sourceType: "verified" },
  { id: "the-jervis",            name: "The Jervis",                aliases: ["Jervis"],                                                                                 neighbourhood: "west-end",     address: "1335 Jervis Street",     type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "one-burrard-place",     name: "One Burrard Place",         aliases: ["Burrard Place"],                                                                          neighbourhood: "downtown",     address: "1290 Burrard Street",    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "the-smithe",            name: "The Smithe",                aliases: [],                                                                                         neighbourhood: "downtown",     address: null,                     type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "8x-on-the-park",        name: "8X on the Park",            aliases: ["8X"],                                                                                     neighbourhood: "downtown",     address: "1111 Richards Street",   type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "the-maddox",            name: "The Maddox",                aliases: ["Maddox"],                                                                                 neighbourhood: "downtown",     address: "1351 Continental Street", type: "condo",        priority: "medium", sourceType: "verified" },
  { id: "the-mark",              name: "The Mark",                  aliases: [],                                                                                         neighbourhood: "yaletown",     address: "1372 Seymour Street",    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "yaletown-park",         name: "Yaletown Park",             aliases: ["Yaletown Park 1", "Yaletown Park 2", "Yaletown Park 3"],                                  neighbourhood: "yaletown",     address: "909 Mainland Street",    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "the-savoy",             name: "The Savoy",                 aliases: [],                                                                                         neighbourhood: "yaletown",     address: null,                     type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "the-bentley",           name: "The Bentley",               aliases: [],                                                                                         neighbourhood: "downtown",     address: null,                     type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "the-max",               name: "The Max",                   aliases: ["The Max II"],                                                                             neighbourhood: "downtown",     address: null,                     type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "the-oscar",             name: "The Oscar",                 aliases: [],                                                                                         neighbourhood: "downtown",     address: null,                     type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "the-beasley",           name: "The Beasley",               aliases: [],                                                                                         neighbourhood: "downtown",     address: "888 Homer Street",       type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "the-donovan",           name: "The Donovan",               aliases: ["Donovan"],                                                                                neighbourhood: "downtown",     address: "1133 Hornby Street",     type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "the-hamilton",          name: "The Hamilton",              aliases: [],                                                                                         neighbourhood: "downtown",     address: null,                     type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "the-hudson-van",        name: "The Hudson",                aliases: [],                                                                                         neighbourhood: "downtown",     address: "610 Granville Street",   type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "the-spot",              name: "The Spot",                  aliases: [],                                                                                         neighbourhood: "downtown",     address: null,                     type: "condo",         priority: "low",    sourceType: "partial" },
  { id: "electric-avenue",       name: "Electric Avenue",           aliases: [],                                                                                         neighbourhood: "downtown",     address: "1199 Seymour Street",    type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "capitol-residences",    name: "Capitol Residences",        aliases: [],                                                                                         neighbourhood: "downtown",     address: "833 Seymour Street",     type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "tv-towers",             name: "TV Towers",                 aliases: [],                                                                                         neighbourhood: "downtown",     address: "233 Robson Street",      type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "telus-garden",          name: "Telus Garden",              aliases: ["TELUS Garden"],                                                                           neighbourhood: "downtown",     address: "777 Richards Street",    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "the-rolston",           name: "The Rolston",               aliases: [],                                                                                         neighbourhood: "downtown",     address: "1308 Hornby Street",     type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "wall-centre",           name: "Wall Centre",               aliases: ["Sheraton Wall Centre"],                                                                   neighbourhood: "downtown",     address: "1088 Burrard Street",    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "rosedale-on-robson",    name: "Rosedale on Robson",        aliases: ["Rosedale Gardens"],                                                                       neighbourhood: "downtown",     address: "838 Hamilton Street",    type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "spectrum",              name: "Spectrum",                  aliases: ["Spectrum 1", "Spectrum 2", "Spectrum 3", "Spectrum 4"],                                   neighbourhood: "downtown",     address: "111 West Georgia Street", type: "condo",        priority: "high",   sourceType: "verified" },
  { id: "espana",                name: "Espana",                    aliases: ["Espana 1", "Espana 2", "Espana 3"],                                                       neighbourhood: "downtown",     address: "188 Keefer Place",       type: "condo",         priority: "high",   sourceType: "verified" },

  // ─── Coal Harbour ──────────────────────────────────────────────────────────
  { id: "residences-on-georgia", name: "Residences on Georgia",     aliases: ["1200 West Georgia", "1288 West Georgia", "1281 West Georgia"],                            neighbourhood: "coal-harbour", address: "1200 West Georgia Street", type: "condo",       priority: "high",   sourceType: "verified" },
  { id: "the-pointe",            name: "The Pointe",                aliases: [],                                                                                         neighbourhood: "coal-harbour", address: "1351 West Cordova Street", type: "condo",       priority: "medium", sourceType: "verified" },
  { id: "harbourside-park",      name: "Harbourside Park",          aliases: [],                                                                                         neighbourhood: "coal-harbour", address: "555 Jervis Street",      type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "bayshore-gardens",      name: "Bayshore Gardens",          aliases: [],                                                                                         neighbourhood: "coal-harbour", address: "1717 Bayshore Drive",    type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "cascina",               name: "Cascina",                   aliases: ["Carina"],                                                                                 neighbourhood: "coal-harbour", address: "1281 Cordova Way",       type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "callisto",              name: "Callisto",                  aliases: ["Cielo"],                                                                                  neighbourhood: "coal-harbour", address: null,                     type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "the-melville",          name: "The Melville",              aliases: [],                                                                                         neighbourhood: "coal-harbour", address: "1189 Melville Street",   type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "orca-place",            name: "Orca Place",                aliases: [],                                                                                         neighbourhood: "coal-harbour", address: null,                     type: "condo",         priority: "low",    sourceType: "partial" },
  { id: "dockside",              name: "Dockside",                  aliases: [],                                                                                         neighbourhood: "coal-harbour", address: null,                     type: "condo",         priority: "low",    sourceType: "partial" },
  { id: "denia",                 name: "Denia",                     aliases: [],                                                                                         neighbourhood: "coal-harbour", address: null,                     type: "condo",         priority: "low",    sourceType: "partial" },
  { id: "ritz",                  name: "Ritz",                      aliases: ["Flatiron Vancouver"],                                                                     neighbourhood: "coal-harbour", address: "1211 Melville Street",   type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "waterfront-place",      name: "Waterfront Place",          aliases: [],                                                                                         neighbourhood: "coal-harbour", address: null,                     type: "condo",         priority: "low",    sourceType: "partial" },
  { id: "the-erickson",          name: "The Erickson",              aliases: ["Erickson"],                                                                               neighbourhood: "yaletown",     address: "1455 Howe Street",       type: "condo",         priority: "high",   sourceType: "verified" },

  // ─── Gastown / Chinatown / Crosstown ───────────────────────────────────────
  { id: "woodwards",             name: "Woodwards",                 aliases: ["W43", "W32"],                                                                             neighbourhood: "gastown",      address: "33 West Pender Street",  type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "koret-lofts",           name: "Koret Lofts",               aliases: [],                                                                                         neighbourhood: "gastown",      address: "55 East Cordova Street", type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "the-keefer",            name: "The Keefer",                aliases: ["Keefer Block"],                                                                           neighbourhood: "chinatown",    address: "189 Keefer Street",      type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "carrall-station",       name: "Carrall Station",           aliases: [],                                                                                         neighbourhood: "chinatown",    address: "189 Keefer Street",      type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "v6a",                   name: "V6A",                       aliases: [],                                                                                         neighbourhood: "chinatown",    address: "221 Union Street",       type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "meccanica",             name: "Meccanica",                 aliases: ["Lido", "Central"],                                                                        neighbourhood: "olympic-village", address: "108 West 1st Avenue", type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "city-gate",             name: "City Gate",                 aliases: ["City Gate 1", "City Gate 2", "City Gate 3", "City Gate 4"],                              neighbourhood: "crosstown",    address: "1483 Quebec Street",     type: "condo",         priority: "medium", sourceType: "verified" },

  // ─── False Creek / Olympic Village ─────────────────────────────────────────
  { id: "olympic-village",       name: "Olympic Village",           aliases: ["Village on False Creek", "Southeast False Creek"],                                       neighbourhood: "olympic-village", address: null,                  type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "false-creek-gen",       name: "False Creek",               aliases: [],                                                                                         neighbourhood: "false-creek",  address: null,                     type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "james",                 name: "James",                     aliases: ["Pinnacle Living False Creek", "Wall Centre False Creek"],                                neighbourhood: "false-creek",  address: "1661 Quebec Street",     type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "opsal",                 name: "Opsal",                     aliases: [],                                                                                         neighbourhood: "olympic-village", address: "1775 Quebec Street",  type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "proximity",             name: "Proximity",                 aliases: ["The One"],                                                                                neighbourhood: "olympic-village", address: null,                  type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "brook",                 name: "Brook",                     aliases: [],                                                                                         neighbourhood: "olympic-village", address: null,                  type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "shoreline",             name: "Shoreline",                 aliases: ["Kayak", "Foundry", "Bridge", "Compass"],                                                  neighbourhood: "olympic-village", address: null,                  type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "maynards-block",        name: "Maynards Block",            aliases: ["Exchange"],                                                                               neighbourhood: "olympic-village", address: "1919 Manitoba Street", type: "condo",        priority: "medium", sourceType: "verified" },
  { id: "residences-at-west",    name: "Residences at West",        aliases: ["West"],                                                                                   neighbourhood: "olympic-village", address: null,                  type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "navio",                 name: "Navio",                     aliases: ["Navio North", "Navio South"],                                                             neighbourhood: "olympic-village", address: null,                  type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "pinnacle-on-the-park",  name: "Pinnacle on the Park",      aliases: [],                                                                                         neighbourhood: "olympic-village", address: "1708 Ontario Street", type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "block-100",             name: "Block 100",                 aliases: [],                                                                                         neighbourhood: "olympic-village", address: null,                  type: "condo",         priority: "medium", sourceType: "partial" },

  // ─── Mount Pleasant / Main Street ──────────────────────────────────────────
  { id: "the-independent",       name: "The Independent",           aliases: [],                                                                                         neighbourhood: "mount-pleasant", address: "2520 Guelph Street",   type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "the-wohlsein",          name: "The Wohlsein",              aliases: [],                                                                                         neighbourhood: "mount-pleasant", address: null,                   type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "midtown-mount",         name: "Midtown",                   aliases: ["Midtown Central"],                                                                        neighbourhood: "mount-pleasant", address: null,                   type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "forte",                 name: "Forte",                     aliases: [],                                                                                         neighbourhood: "mount-pleasant", address: null,                   type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "bluetree-on-main",      name: "Bluetree on Main",          aliases: ["Main Space"],                                                                             neighbourhood: "main-street",   address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "the-social",            name: "The Social",                aliases: ["District"],                                                                               neighbourhood: "main-street",   address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "3333-main",             name: "3333 Main",                 aliases: ["3333 Main Street"],                                                                       neighbourhood: "main-street",   address: "3333 Main Street",      type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "the-sophia",            name: "The Sophia",                aliases: [],                                                                                         neighbourhood: "main-street",   address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "uno",                   name: "UNO",                       aliases: [],                                                                                         neighbourhood: "main-street",   address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "vya",                   name: "Vya",                       aliases: ["Vya Living"],                                                                             neighbourhood: "main-street",   address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "soho",                  name: "Soho",                      aliases: ["The District"],                                                                           neighbourhood: "main-street",   address: null,                    type: "condo",         priority: "low",    sourceType: "partial" },
  { id: "fraser-commons",        name: "Fraser Commons",            aliases: ["Fraser Flats"],                                                                           neighbourhood: "fraser",        address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "century-sig",           name: "Century",                   aliases: ["Century Signature"],                                                                      neighbourhood: "main-street",   address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "king-edward-village",   name: "King Edward Village",       aliases: [],                                                                                         neighbourhood: "kensington",    address: "4078 Knight Street",    type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "kensington-gardens",    name: "Kensington Gardens",        aliases: ["Kensington Gardens East", "Kensington Gardens West"],                                     neighbourhood: "kensington",    address: "4815 Earles Street",    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "eliot-at-norquay",      name: "Eliot at Norquay",          aliases: [],                                                                                         neighbourhood: "kensington",    address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "the-windsor",           name: "The Windsor",               aliases: [],                                                                                         neighbourhood: "kensington",    address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "the-saint-george",      name: "The Saint George",          aliases: [],                                                                                         neighbourhood: "kensington",    address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "format",                name: "Format",                    aliases: [],                                                                                         neighbourhood: "main-street",   address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "hensley",               name: "Hensley",                   aliases: [],                                                                                         neighbourhood: "main-street",   address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },

  // ─── GEC / student housing ─────────────────────────────────────────────────
  { id: "gec-viva",              name: "GEC Viva Tower",            aliases: ["GEC Viva", "828 Drake", "Viva Tower"],                                                    neighbourhood: "downtown",      address: "828 Drake Street",      type: "student",       priority: "high",   sourceType: "verified" },
  { id: "gec-kingsway",          name: "GEC Kingsway",              aliases: ["Kingsway Student Residence"],                                                             neighbourhood: "kensington",    address: null,                    type: "student",       priority: "high",   sourceType: "verified" },
  { id: "gec-pearson",           name: "GEC Pearson",               aliases: ["Pearson Student Residence"],                                                              neighbourhood: "marpole",       address: null,                    type: "student",       priority: "high",   sourceType: "verified" },
  { id: "gec-marine-gateway",    name: "GEC Marine Gateway",        aliases: ["Marine Gateway Student Residence"],                                                       neighbourhood: "marpole",       address: null,                    type: "student",       priority: "high",   sourceType: "verified" },
  { id: "gec-king-edward",       name: "GEC King Edward",           aliases: ["King Edward Student Residence"],                                                          neighbourhood: "cambie-corridor", address: null,                  type: "student",       priority: "high",   sourceType: "verified" },
  { id: "gec-burnaby-heights",   name: "GEC Burnaby Heights",       aliases: ["438 Gamma", "Burnaby Heights Apartments"],                                                neighbourhood: "burnaby",       address: "438 Gamma Avenue",      type: "student",       priority: "high",   sourceType: "verified" },
  { id: "gec-oakridge",          name: "GEC Oakridge",              aliases: ["GEC Oakridge Coming Soon"],                                                               neighbourhood: "oakridge",      address: null,                    type: "student",       priority: "high",   sourceType: "verified" },

  // ─── Marine Gateway / Cambie Corridor / Marpole / Oakridge ─────────────────
  { id: "marine-gateway",        name: "Marine Gateway",            aliases: ["Signal", "Signal at Marine Gateway", "Marine Gateway North Tower", "Marine Gateway South Tower", "488 SW Marine Drive", "489 Interurban Way"], neighbourhood: "marpole", address: "488 SW Marine Drive", type: "condo", priority: "high", sourceType: "verified" },
  { id: "mc2",                   name: "MC2",                       aliases: ["MC2 North Tower", "MC2 South Tower"],                                                     neighbourhood: "marpole",       address: "8131 Nunavut Lane",     type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "cambie-gardens",        name: "Cambie Gardens",            aliases: ["Cambie Gardens Rentals"],                                                                 neighbourhood: "cambie-corridor", address: null,                  type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "langara-gardens",       name: "Langara Gardens",           aliases: ["Langara Gardens Apartments", "Langara College Apartments"],                              neighbourhood: "cambie-corridor", address: "555 West 57th Avenue", type: "purpose-built", priority: "high",   sourceType: "verified" },
  { id: "oakridge-park",         name: "Oakridge Park",             aliases: ["Oakridge x Westbank", "Oakridge Park Rentals", "Oakridge Towers", "Oakridge Apartments"], neighbourhood: "oakridge",      address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "the-grant",             name: "The Grant",                 aliases: ["The Grant Vancouver", "W68"],                                                             neighbourhood: "oakridge",      address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "winona-park",           name: "Winona Park Apartments",    aliases: [],                                                                                         neighbourhood: "cambie-corridor", address: null,                  type: "purpose-built", priority: "medium", sourceType: "partial" },
  { id: "pearson-dogwood",       name: "Pearson Dogwood",           aliases: [],                                                                                         neighbourhood: "cambie-corridor", address: null,                  type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "heather-lands",         name: "Heather Lands",             aliases: [],                                                                                         neighbourhood: "cambie-corridor", address: null,                  type: "condo",         priority: "medium", sourceType: "partial" },

  // ─── River District / South East ───────────────────────────────────────────
  { id: "avalon-park",           name: "Avalon Park Vancouver",     aliases: ["Avalon 1", "Avalon 2", "Avalon 3"],                                                       neighbourhood: "river-district", address: null,                  type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "mode-vancouver",        name: "MODE",                      aliases: ["MODE Vancouver"],                                                                         neighbourhood: "river-district", address: null,                  type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "town-centre",           name: "One Town Centre",           aliases: ["Two Town Centre", "Three Town Centre", "Quartet", "Town Centre River District"],         neighbourhood: "river-district", address: null,                  type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "encore",                name: "Encore",                    aliases: ["Rhythm"],                                                                                 neighbourhood: "river-district", address: null,                  type: "condo",         priority: "medium", sourceType: "partial" },

  // ─── UBC / Wesbrook Village ────────────────────────────────────────────────
  { id: "wesbrook-village",      name: "Wesbrook Village",          aliases: ["Wesbrook Village Apartments", "UBC Exchange Residence", "University Marketplace", "University Village Apartments"], neighbourhood: "ubc", address: null, type: "purpose-built", priority: "high", sourceType: "verified" },
  { id: "brock-commons",         name: "Brock Commons",             aliases: [],                                                                                         neighbourhood: "ubc",           address: "6088 Walter Gage Road", type: "student",       priority: "high",   sourceType: "verified" },
  { id: "ponderosa-commons",     name: "Ponderosa Commons",         aliases: [],                                                                                         neighbourhood: "ubc",           address: "6445 University Boulevard", type: "student",     priority: "high",   sourceType: "verified" },
  { id: "marine-drive-residence",name: "Marine Drive Residence",    aliases: [],                                                                                         neighbourhood: "ubc",           address: null,                    type: "student",       priority: "high",   sourceType: "verified" },
  { id: "walter-gage",           name: "Walter Gage Residence",     aliases: ["Gage Apartments"],                                                                        neighbourhood: "ubc",           address: null,                    type: "student",       priority: "high",   sourceType: "verified" },
  { id: "acadia-park",           name: "Acadia Park",               aliases: [],                                                                                         neighbourhood: "ubc",           address: null,                    type: "student",       priority: "high",   sourceType: "verified" },
  { id: "thunderbird-residence", name: "Thunderbird Residence",     aliases: [],                                                                                         neighbourhood: "ubc",           address: null,                    type: "student",       priority: "medium", sourceType: "verified" },
  { id: "the-conservatory",      name: "The Conservatory",          aliases: [],                                                                                         neighbourhood: "ubc",           address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "cedar-walk",            name: "Cedar Walk",                aliases: [],                                                                                         neighbourhood: "ubc",           address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "ivy-on-the-park",       name: "Ivy on the Park",           aliases: [],                                                                                         neighbourhood: "ubc",           address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "virtuoso",              name: "Virtuoso",                  aliases: [],                                                                                         neighbourhood: "ubc",           address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "eton",                  name: "Eton",                      aliases: ["Polygon Eton"],                                                                           neighbourhood: "ubc",           address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "ubc-sail",              name: "Sail",                      aliases: ["Sage", "Prodigy", "West Wind", "Binning Tower"],                                          neighbourhood: "ubc",           address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "academy-ubc",           name: "Academy",                   aliases: ["Academy UBC"],                                                                            neighbourhood: "ubc",           address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },

  // ─── Burnaby: Brentwood ────────────────────────────────────────────────────
  { id: "amazing-brentwood",     name: "The Amazing Brentwood",     aliases: ["Brentwood Tower 1", "Brentwood Tower 2", "Brentwood Tower 3", "Brentwood Tower 4", "Brentwood Rentals", "Brentwood Apartments"], neighbourhood: "brentwood", address: "4567 Lougheed Highway", type: "condo", priority: "high", sourceType: "verified" },
  { id: "solo-district",         name: "Solo District",             aliases: ["Solo District Altus", "Solo District Stratus", "Solo District Cirrus", "Solo District Aerius"], neighbourhood: "brentwood", address: "4670 Assembly Way", type: "condo", priority: "high", sourceType: "verified" },
  { id: "the-dawson",            name: "The Dawson",                aliases: ["Dawson"],                                                                                 neighbourhood: "brentwood",     address: null,                    type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "akimbo",                name: "Akimbo",                    aliases: [],                                                                                         neighbourhood: "brentwood",     address: null,                    type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "gilmore-place",         name: "Gilmore Place",             aliases: ["Gilmore Place Tower 1", "Gilmore Place Tower 2", "Gilmore Place Tower 3"],               neighbourhood: "brentwood",     address: "4168 Lougheed Highway", type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "triomphe",              name: "Triomphe",                  aliases: [],                                                                                         neighbourhood: "brentwood",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "lumina",                name: "Lumina",                    aliases: ["Lumina Brentwood", "Waterfall at Lumina", "Alpha at Lumina", "Beta at Lumina"],          neighbourhood: "brentwood",     address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "escala",                name: "Escala",                    aliases: ["Escala Brentwood"],                                                                       neighbourhood: "brentwood",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "tandem",                name: "Tandem",                    aliases: ["Tandem 1", "Tandem 2", "Tandem 3"],                                                       neighbourhood: "brentwood",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "heights-on-austin",     name: "The Heights on Austin",     aliases: [],                                                                                         neighbourhood: "brentwood",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "concord-brentwood",     name: "Concord Brentwood",         aliases: ["Hillside West", "Hillside East"],                                                         neighbourhood: "brentwood",     address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "oma",                   name: "Oma",                       aliases: ["Oma 1", "Oma 2"],                                                                         neighbourhood: "brentwood",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "fulton-house",          name: "Fulton House",              aliases: ["Fulton House Brentwood"],                                                                 neighbourhood: "brentwood",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "juneau",                name: "Juneau",                    aliases: ["Juneau Brentwood"],                                                                       neighbourhood: "brentwood",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "milano",                name: "Milano",                    aliases: ["Milano Brentwood"],                                                                       neighbourhood: "brentwood",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "etoile",                name: "Etoile",                    aliases: ["Etoile Gold", "Etoile Tower"],                                                            neighbourhood: "brentwood",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },

  // ─── Burnaby: Metrotown ────────────────────────────────────────────────────
  { id: "the-standard-metrotown",name: "The Standard Metrotown",    aliases: [],                                                                                         neighbourhood: "metrotown",     address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "station-square",        name: "Station Square",            aliases: ["Station Square Tower 1", "Station Square Tower 2", "Station Square Tower 3", "Station Square Tower 4", "Station Square Tower 5"], neighbourhood: "metrotown", address: "6098 Silver Avenue", type: "condo", priority: "high", sourceType: "verified" },
  { id: "sussex-metrotown",      name: "Sussex",                    aliases: ["Sussex Metrotown"],                                                                       neighbourhood: "metrotown",     address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "sun-towers",            name: "Sun Towers",                aliases: ["Sun Towers 1", "Sun Towers 2"],                                                           neighbourhood: "metrotown",     address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "the-met-burnaby",       name: "The Met Burnaby",           aliases: ["The Met", "Met 1", "Met 2", "Metroplace"],                                                neighbourhood: "metrotown",     address: "6080 McKay Avenue",     type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "sovereign",             name: "Sovereign",                 aliases: [],                                                                                         neighbourhood: "metrotown",     address: "4485 Skyline Drive",    type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "modello",               name: "Modello",                   aliases: [],                                                                                         neighbourhood: "metrotown",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "maywood-on-the-park",   name: "Maywood on the Park",       aliases: [],                                                                                         neighbourhood: "metrotown",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "gold-house",            name: "Gold House",                aliases: ["Gold House North", "Gold House South", "Silver"],                                         neighbourhood: "metrotown",     address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "imperial-metrotown",    name: "Imperial",                  aliases: ["Imperial Metrotown"],                                                                     neighbourhood: "metrotown",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "polaris-metrotown",     name: "Polaris",                   aliases: ["Polaris Metrotown"],                                                                      neighbourhood: "metrotown",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "vittorio",              name: "Vittorio",                  aliases: [],                                                                                         neighbourhood: "metrotown",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "telford-on-the-walk",   name: "Telford on the Walk",       aliases: ["Telford"],                                                                                neighbourhood: "metrotown",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "nuvo",                  name: "Nuvo",                      aliases: ["Nuvo Metrotown"],                                                                         neighbourhood: "metrotown",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "aldynne-on-the-park",   name: "Aldynne on the Park",       aliases: ["Aldynne"],                                                                                neighbourhood: "metrotown",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },

  // ─── Burnaby: Edmonds / Highgate / Lougheed / SFU ──────────────────────────
  { id: "kings-crossing",        name: "Kings Crossing",            aliases: ["Kings Crossing 1", "Kings Crossing 2", "Kings Crossing 3"],                              neighbourhood: "edmonds",       address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "southgate-city",        name: "Southgate City",            aliases: ["Southgate City Rentals"],                                                                 neighbourhood: "edmonds",       address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "city-of-lougheed",      name: "City of Lougheed",          aliases: ["The City of Lougheed", "Lougheed Heights", "Lougheed Apartments"],                       neighbourhood: "lougheed",      address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "strathmore-towers",     name: "Strathmore Towers",         aliases: ["Silhouette", "Cameron Apartments"],                                                       neighbourhood: "lougheed",      address: null,                    type: "purpose-built", priority: "medium", sourceType: "partial" },
  { id: "univercity",            name: "SFU UniverCity",            aliases: ["UniverCity Apartments"],                                                                  neighbourhood: "sfu",           address: null,                    type: "purpose-built", priority: "high",   sourceType: "verified" },
  { id: "novo",                  name: "Novo",                      aliases: ["Novo 1", "Novo 2"],                                                                       neighbourhood: "sfu",           address: null,                    type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "altaire",               name: "Altaire",                   aliases: ["Aurora", "Oslo", "Hamilton Sfu", "Fraser Sfu"],                                           neighbourhood: "sfu",           address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },

  // ─── New Westminster ───────────────────────────────────────────────────────
  { id: "the-point-new-west",    name: "The Point",                 aliases: ["The Point New Westminster"],                                                              neighbourhood: "downtown-new-west", address: null,                type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "riversky",              name: "Riversky",                  aliases: ["Riversky 1", "Riversky 2"],                                                               neighbourhood: "downtown-new-west", address: null,                type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "the-columbia",          name: "The Columbia",              aliases: ["Columbia Apartments"],                                                                    neighbourhood: "downtown-new-west", address: null,                type: "purpose-built", priority: "medium", sourceType: "partial" },
  { id: "trapp-and-holbrook",    name: "Trapp and Holbrook",        aliases: [],                                                                                         neighbourhood: "downtown-new-west", address: null,                type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "brewery-district",      name: "The Brewery District",      aliases: ["Brewery District Apartments"],                                                            neighbourhood: "sapperton",     address: "258 Nelson's Court",    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "nelsons-court",         name: "Nelson's Court",            aliases: ["258 Nelson's Court"],                                                                     neighbourhood: "sapperton",     address: "258 Nelson's Court",    type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "dominion-new-west",     name: "Dominion",                  aliases: ["Dominion New West"],                                                                      neighbourhood: "downtown-new-west", address: null,                type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "viceroy",               name: "Viceroy",                   aliases: ["Viceroy New Westminster"],                                                                neighbourhood: "downtown-new-west", address: null,                type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "pier-west",             name: "Pier West",                 aliases: ["Pier West Tower 1", "Pier West Tower 2"],                                                 neighbourhood: "quayside",      address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "plaza-88",              name: "Plaza 88",                  aliases: [],                                                                                         neighbourhood: "downtown-new-west", address: "888 Carnarvon Street", type: "condo",        priority: "high",   sourceType: "verified" },
  { id: "carnarvon-towers",      name: "Carnarvon Towers",          aliases: ["Carnarvon Place"],                                                                        neighbourhood: "downtown-new-west", address: null,                type: "purpose-built", priority: "medium", sourceType: "partial" },
  { id: "8th-and-royal",         name: "8th and Royal",             aliases: [],                                                                                         neighbourhood: "downtown-new-west", address: null,                type: "condo",         priority: "medium", sourceType: "partial" },

  // ─── Richmond ──────────────────────────────────────────────────────────────
  { id: "oval-village",          name: "Oval Village",              aliases: ["Richmond Oval Apartments"],                                                               neighbourhood: "richmond-oval", address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "river-green",           name: "River Green",               aliases: ["River Green 1", "River Green 2"],                                                         neighbourhood: "richmond-oval", address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "river-park-place",      name: "River Park Place",          aliases: ["River Park Place 1", "River Park Place 2", "River Park Place 3", "One River Park Place", "Two River Park Place", "Three River Park Place"], neighbourhood: "richmond-oval", address: null, type: "condo", priority: "high", sourceType: "verified" },
  { id: "cascade-city",          name: "Cascade City",              aliases: ["Cascade City Richmond"],                                                                  neighbourhood: "lansdowne",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "concord-gardens",       name: "Concord Gardens",           aliases: ["Concord Gardens South Estates", "Concord Gardens Park Estates"],                         neighbourhood: "brighouse",     address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "tempo-richmond",        name: "Tempo",                     aliases: ["Tempo Richmond"],                                                                         neighbourhood: "brighouse",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "quintet",               name: "Quintet",                   aliases: ["Quintet Tower A", "Quintet Tower B", "Quintet Tower C", "Quintet Tower D", "Quintet Tower E"], neighbourhood: "brighouse", address: null, type: "condo", priority: "high", sourceType: "verified" },
  { id: "the-paramount-richmond",name: "The Paramount",             aliases: ["The Paramount Richmond", "Paramount"],                                                    neighbourhood: "brighouse",     address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "mandarin-residences",   name: "Mandarin Residences",       aliases: ["Mandarin Residences North", "Mandarin Residences South"],                                neighbourhood: "brighouse",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "ora-richmond",          name: "Ora",                       aliases: ["Ora Richmond"],                                                                           neighbourhood: "brighouse",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "avanti-richmond",       name: "Avanti",                    aliases: ["Avanti Richmond"],                                                                        neighbourhood: "brighouse",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "lansdowne-square",      name: "Lansdowne Square",          aliases: [],                                                                                         neighbourhood: "lansdowne",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "viewstar",              name: "ViewStar",                  aliases: ["ViewStar Richmond"],                                                                      neighbourhood: "richmond",      address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "fiorella",              name: "Fiorella",                  aliases: ["Fiorella Richmond"],                                                                      neighbourhood: "richmond",      address: null,                    type: "condo",         priority: "low",    sourceType: "partial" },
  { id: "berkeley-house",        name: "Berkeley House",            aliases: ["Berkeley House Richmond"],                                                                neighbourhood: "richmond",      address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "cambridge-park",        name: "Cambridge Park",            aliases: ["Cambridge Park Richmond"],                                                                neighbourhood: "richmond",      address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "alexandra-court",       name: "Alexandra Court",           aliases: ["Alexandra Court Richmond"],                                                               neighbourhood: "richmond",      address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },

  // ─── North Vancouver ───────────────────────────────────────────────────────
  { id: "the-lonsdale",          name: "The Lonsdale",              aliases: ["Lonsdale Square"],                                                                        neighbourhood: "central-lonsdale", address: null,                 type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "the-shipyards",         name: "The Shipyards Apartments",  aliases: [],                                                                                         neighbourhood: "lower-lonsdale", address: null,                   type: "purpose-built", priority: "high",   sourceType: "verified" },
  { id: "the-versatile",         name: "The Versatile Building",    aliases: [],                                                                                         neighbourhood: "lower-lonsdale", address: null,                   type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "trophy-at-the-pier",    name: "Trophy at the Pier",        aliases: [],                                                                                         neighbourhood: "lower-lonsdale", address: null,                   type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "cascade-at-the-pier",   name: "Cascade at the Pier",       aliases: [],                                                                                         neighbourhood: "lower-lonsdale", address: null,                   type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "atrium-at-the-pier",    name: "Atrium at the Pier",        aliases: [],                                                                                         neighbourhood: "lower-lonsdale", address: null,                   type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "promenade-at-the-quay", name: "Promenade at the Quay",     aliases: ["Promenade North Vancouver"],                                                              neighbourhood: "lower-lonsdale", address: null,                   type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "centreview",            name: "CentreView",                aliases: ["CentreView North Vancouver"],                                                             neighbourhood: "central-lonsdale", address: null,                 type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "15-west",               name: "15 West",                   aliases: ["15 West North Vancouver"],                                                                neighbourhood: "central-lonsdale", address: null,                 type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "local-on-lonsdale",     name: "Local on Lonsdale",         aliases: [],                                                                                         neighbourhood: "central-lonsdale", address: null,                 type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "one-park-lane",         name: "One Park Lane",             aliases: [],                                                                                         neighbourhood: "central-lonsdale", address: null,                 type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "the-grande-nv",         name: "The Grande",                aliases: ["The Grande North Vancouver", "Millennium Central Lonsdale"],                              neighbourhood: "central-lonsdale", address: null,                 type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "crest-nv",              name: "Crest",                     aliases: ["Crest North Vancouver"],                                                                  neighbourhood: "central-lonsdale", address: null,                 type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "apex-nv",               name: "Apex",                      aliases: ["Apex North Vancouver"],                                                                   neighbourhood: "central-lonsdale", address: null,                 type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "park-west-lions-gate",  name: "Park West",                 aliases: ["Park West Lions Gate", "Lions Gate Village", "Lions Gate Apartments"],                    neighbourhood: "lions-gate",    address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "belle-isle",            name: "Belle Isle",                aliases: ["Belle Isle Lions Gate"],                                                                  neighbourhood: "lions-gate",    address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "hunter-at-lynn-creek",  name: "Hunter",                    aliases: ["Hunter at Lynn Creek"],                                                                   neighbourhood: "lynn-creek",    address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "seylynn-village",       name: "Seylynn Village",           aliases: ["Compass Seylynn", "Denna", "Beacon", "Taluswood"],                                        neighbourhood: "lynn-creek",    address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },

  // ─── West Vancouver ────────────────────────────────────────────────────────
  { id: "the-sentinel",          name: "The Sentinel",              aliases: ["Sentinel West Vancouver"],                                                                neighbourhood: "ambleside",     address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "evelyn",                name: "Evelyn",                    aliases: ["Evelyn by Onni"],                                                                         neighbourhood: "ambleside",     address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "grosvenor-ambleside",   name: "Grosvenor Ambleside",       aliases: [],                                                                                         neighbourhood: "ambleside",     address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "hollyburn",             name: "Hollyburn Apartments",      aliases: ["Hollyburn Court", "Hollyburn House"],                                                     neighbourhood: "west-vancouver",address: null,                    type: "purpose-built", priority: "medium", sourceType: "partial" },
  { id: "horseshoe-bay-sanctuary", name: "Horseshoe Bay Sanctuary", aliases: [],                                                                                         neighbourhood: "west-vancouver",address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },

  // ─── Surrey ────────────────────────────────────────────────────────────────
  { id: "king-george-hub",       name: "King George Hub",           aliases: ["King George Hub 1", "King George Hub 2", "King George Hub 3", "King George Hub 4"],     neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "the-holland",           name: "The Holland",               aliases: ["Holland Parkside"],                                                                       neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "park-george",           name: "Park George",               aliases: ["Park George Surrey"],                                                                     neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "university-district",   name: "University District",       aliases: ["University District South", "University District North"],                                neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "prime-civic-plaza",     name: "Prime on the Plaza",        aliases: ["Prime", "3 Civic Plaza", "Civic Plaza"],                                                  neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "park-avenue",           name: "Park Avenue",               aliases: ["Park Boulevard", "Park Avenue East", "Park Avenue West"],                                neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "ultra-surrey",          name: "Ultra",                     aliases: ["Ultra Surrey"],                                                                           neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "wave-surrey",           name: "Wave",                      aliases: ["Wave Surrey"],                                                                            neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "evolve-surrey",         name: "Evolve",                    aliases: ["Evolve Surrey"],                                                                          neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "lineage-surrey",        name: "Lineage",                   aliases: ["Lineage Surrey"],                                                                         neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "georgetown",            name: "Georgetown",                aliases: ["Georgetown One", "Georgetown Two", "Anthem Georgetown"],                                  neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "dcorize",               name: "D'Corize",                  aliases: ["D Corize"],                                                                               neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "agenda-surrey",         name: "Agenda",                    aliases: ["Agenda Surrey"],                                                                          neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "access-surrey",         name: "Access",                    aliases: ["Access Surrey"],                                                                          neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "infinity-surrey",       name: "Infinity",                  aliases: ["Infinity Surrey"],                                                                        neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "city-point",            name: "City Point",                aliases: ["City Point Surrey"],                                                                      neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "hq-dwell",              name: "HQ Dwell",                  aliases: ["HQ Thrive"],                                                                              neighbourhood: "surrey-central",address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "guildhouse",            name: "Guildhouse",                aliases: ["Guildhouse Surrey", "Guildford Town Centre Apartments"],                                  neighbourhood: "guildford",     address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "charlton-park",         name: "Charlton Park",             aliases: ["Charlton Park Surrey"],                                                                   neighbourhood: "guildford",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "fleetwood-village",     name: "Fleetwood Village",         aliases: ["Fleetwood Village 1", "Fleetwood Village 2"],                                            neighbourhood: "fleetwood",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "morgan-crossing",       name: "Morgan Crossing",           aliases: ["Morgan Crossing Apartments"],                                                             neighbourhood: "south-surrey",  address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },

  // ─── Coquitlam / Port Moody ────────────────────────────────────────────────
  { id: "mthree-coquitlam",      name: "MThree",                    aliases: ["MThree Coquitlam", "MOne", "MTwo"],                                                       neighbourhood: "coquitlam-centre", address: null,                  type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "levo-coquitlam",        name: "Levo",                      aliases: ["Levo Coquitlam"],                                                                         neighbourhood: "coquitlam-centre", address: null,                  type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "grand-central",         name: "Grand Central",             aliases: ["Grand Central 1", "Grand Central 2", "Grand Central 3"],                                neighbourhood: "coquitlam-centre", address: null,                  type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "the-obelisk",           name: "The Obelisk",               aliases: ["Obelisk"],                                                                                neighbourhood: "coquitlam-centre", address: null,                  type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "oasis-coquitlam",       name: "Oasis",                     aliases: ["Oasis Coquitlam"],                                                                        neighbourhood: "coquitlam-centre", address: null,                  type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "uptown-coquitlam",      name: "Uptown",                    aliases: ["Uptown Coquitlam"],                                                                       neighbourhood: "coquitlam-centre", address: null,                  type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "highpoint-coquitlam",   name: "The Highpoint",             aliases: ["Highpoint Coquitlam"],                                                                    neighbourhood: "coquitlam-centre", address: null,                  type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "567-clarke",            name: "567 Clarke",                aliases: ["567 Clarke and Como"],                                                                    neighbourhood: "burquitlam",    address: "567 Clarke Road",       type: "condo",         priority: "medium", sourceType: "verified" },
  { id: "smith-and-farrow",      name: "Smith and Farrow",          aliases: ["Smith and Farrow Coquitlam"],                                                             neighbourhood: "burquitlam",    address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "como-living",           name: "Como Living",               aliases: ["Como Living Coquitlam", "Burquitlam Park District"],                                      neighbourhood: "burquitlam",    address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "marquee-coquitlam",     name: "Marquee",                   aliases: ["Marquee Coquitlam"],                                                                      neighbourhood: "coquitlam",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "regans-walk",           name: "Regan's Walk",              aliases: ["Regans Walk"],                                                                            neighbourhood: "coquitlam",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "foster-coquitlam",      name: "Foster",                    aliases: ["Foster Coquitlam"],                                                                       neighbourhood: "coquitlam",     address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },
  { id: "suter-brook-village",   name: "Suter Brook Village",       aliases: ["Suter Brook"],                                                                            neighbourhood: "suter-brook",   address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "newport-village-pm",    name: "Newport Village",           aliases: [],                                                                                         neighbourhood: "newport-village",address: null,                   type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "the-grande-port-moody", name: "The Grande Port Moody",     aliases: [],                                                                                         neighbourhood: "port-moody",    address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "george-port-moody",     name: "George",                    aliases: ["George Port Moody"],                                                                      neighbourhood: "port-moody",    address: null,                    type: "condo",         priority: "high",   sourceType: "verified" },
  { id: "platform-port-moody",   name: "Platform",                  aliases: ["Platform Port Moody"],                                                                    neighbourhood: "port-moody",    address: null,                    type: "condo",         priority: "medium", sourceType: "partial" },

];

// ─── Search and helpers ───────────────────────────────────────────────────────

export function normalize(s) {
  if (!s) return "";
  return String(s)
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function priorityWeight(p) {
  return p === "high" ? 3 : p === "medium" ? 2 : 1;
}

function buildSearchableText(b) {
  const hood = VANCOUVER_NEIGHBOURHOODS[b.neighbourhood];
  return normalize([
    b.name,
    ...(b.aliases || []),
    b.address || "",
    hood?.name || b.neighbourhood,
  ].join(" "));
}

export function searchBuildings(query, neighbourhoodKey, limit = 10) {
  const q = normalize(query);

  if (!q) {
    let pool = VANCOUVER_BUILDINGS;
    if (neighbourhoodKey) {
      pool = pool.filter(b => b.neighbourhood === neighbourhoodKey);
      if (pool.length === 0) pool = VANCOUVER_BUILDINGS;
    }
    return [...pool]
      .sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority))
      .slice(0, limit);
  }

  const matches = [];
  for (const b of VANCOUVER_BUILDINGS) {
    const hay = buildSearchableText(b);
    if (!hay.includes(q)) continue;

    let score = priorityWeight(b.priority);
    if (normalize(b.name).startsWith(q)) score += 10;
    if ((b.aliases || []).some(a => normalize(a).startsWith(q))) score += 6;
    if (b.address && normalize(b.address).includes(q)) score += 4;
    if (neighbourhoodKey && b.neighbourhood === neighbourhoodKey) score += 5;

    matches.push({ b, score });
  }

  matches.sort((x, y) => y.score - x.score);
  return matches.slice(0, limit).map(m => m.b);
}

export function getBuildingById(id) {
  return VANCOUVER_BUILDINGS.find(b => b.id === id) || null;
}

export function getBuildingsForNeighbourhood(key) {
  if (!key) return [];
  return VANCOUVER_BUILDINGS.filter(b => b.neighbourhood === key);
}

// Resolve the canonical building name string to store in a submission.
// mode: "select" | "other" | "skip" | ""
export function resolveBuildingName(mode, id, text) {
  if (!mode || mode === "skip") return null;
  if (mode === "other") return (text || "").trim() || null;
  if (mode === "select") {
    const b = getBuildingById(id);
    if (!b) return null;
    return b.address ? `${b.name} - ${b.address}` : b.name;
  }
  return null;
}

// ─── Backward-compat for older callers ────────────────────────────────────────
//
// HOOD_NAME_TO_KEY maps the calculator's neighbourhood dropdown values
// (e.g. "Kitsilano") to the building-side neighbourhood key (e.g. "kitsilano").

export const HOOD_NAME_TO_KEY = {
  "Burnaby":                "burnaby",
  "Chinatown":              "chinatown",
  "Coal Harbour":           "coal-harbour",
  "Commercial Drive":       "commercial-drive",
  "Downtown Vancouver":     "downtown",
  "Dunbar":                 "point-grey",
  "Fairview":               "false-creek",
  "Gastown":                "gastown",
  "Grandview-Woodland":     "grandview-woodland",
  "Kerrisdale":             "oakridge",
  "Kitsilano":              "kitsilano",
  "Main Street":            "main-street",
  "Mount Pleasant":         "mount-pleasant",
  "New Westminster":        "new-westminster",
  "North Vancouver":        "north-vancouver",
  "Richmond":               "richmond",
  "South Granville":        "cambie-corridor",
  "Strathcona":             "downtown",
  "West End":               "west-end",
  "Yaletown":               "yaletown",
};

export function getBuildingsForHoodName(hoodName) {
  if (!hoodName) return [];
  const key = HOOD_NAME_TO_KEY[hoodName];
  if (!key) return [];
  return getBuildingsForNeighbourhood(key);
}

// ─── Building Score Engine ────────────────────────────────────────────────────
//
// FairRent Canada Building Score is out of 100.

export function calcBuildingScore({ building, submissions, cityBaseBedroom, hoodMult }) {
  const n = submissions.length;
  if (n < MIN_SUBS_FOR_SCORE) return null;

  const rents   = submissions.map(s => s.monthly_rent);
  const avgRent = rents.reduce((a, b) => a + b, 0) / rents.length;
  const bench   = Math.round(cityBaseBedroom * hoodMult);
  const ratio   = avgRent / bench;

  let rentFairness;
  if      (ratio <= 0.85) rentFairness = 35;
  else if (ratio <= 0.95) rentFairness = 30;
  else if (ratio <= 1.05) rentFairness = 24;
  else if (ratio <= 1.15) rentFairness = 16;
  else if (ratio <= 1.30) rentFairness = 9;
  else                    rentFairness = 4;

  const transitPts = { excellent: 15, good: 11, fair: 7, limited: 3 };
  const locationValue = transitPts[building.transit] ?? 8;

  const amenPts = {
    elevator: 2, gym: 2, pool: 2, concierge: 2, parking: 2,
    laundry: 1, balcony: 1, storage: 1, "pet-friendly": 1, ac: 1,
  };
  const featuresScore = Math.min(15,
    (building.amenities || []).reduce((sum, a) => sum + (amenPts[a] ?? 0), 0)
  );

  let marketComp;
  if      (ratio <= 0.90) marketComp = 15;
  else if (ratio <= 1.00) marketComp = 12;
  else if (ratio <= 1.10) marketComp = 8;
  else if (ratio <= 1.20) marketComp = 4;
  else                    marketComp = 2;

  let confidence;
  if      (n >= MIN_SUBS_FOR_HIGH) confidence = 10;
  else if (n >= MIN_SUBS_FOR_MED)  confidence = 8;
  else if (n >= MIN_SUBS_FOR_SCORE)confidence = 5;
  else                             confidence = 2;

  let affordability;
  if      (ratio <= 0.85) affordability = 10;
  else if (ratio <= 0.95) affordability = 8;
  else if (ratio <= 1.05) affordability = 6;
  else if (ratio <= 1.15) affordability = 4;
  else                    affordability = 2;

  const total = Math.min(100, Math.max(0,
    rentFairness + locationValue + featuresScore + marketComp + confidence + affordability
  ));

  return {
    total: Math.round(total),
    breakdown: { rentFairness, locationValue, featuresScore, marketComp, confidence, affordability },
    avgRent: Math.round(avgRent),
    bench,
    rentRatio: ratio,
    submissions: n,
  };
}

export function getBuildingScoreLabel(score) {
  if (score >= 90) return { label: "Strong value",                color: "#1a5c34", bg: "#f0f7f2", border: "#a8d5b5" };
  if (score >= 80) return { label: "Good value",                  color: "#1a5c34", bg: "#f0f7f2", border: "#a8d5b5" };
  if (score >= 70) return { label: "Fair - watch the price",      color: "#7a4f00", bg: "#fdf8f0", border: "#e8c97a" };
  if (score >= 60) return { label: "Expensive vs. similar",       color: "#b45309", bg: "#fffbeb", border: "#fde68a" };
  return               { label: "Limited value (early data)",      color: "#8b1a1a", bg: "#fdf0f0", border: "#e8a8a8" };
}

export function getBuildingConfidence(n) {
  if (n >= MIN_SUBS_FOR_HIGH)  return { label: "High confidence",   dot: "#1a5c34", text: "#1a5c34" };
  if (n >= MIN_SUBS_FOR_MED)   return { label: "Medium confidence", dot: "#7a4f00", text: "#7a4f00" };
  if (n >= MIN_SUBS_FOR_SCORE) return { label: "Low confidence",    dot: "#8b1a1a", text: "#8b1a1a" };
  if (n >= MIN_SUBS_FOR_AVG)   return { label: "Early score",       dot: "#9aa4af", text: "#6a7682" };
  return                              { label: "Limited data",      dot: "#9aa4af", text: "#6a7682" };
}
