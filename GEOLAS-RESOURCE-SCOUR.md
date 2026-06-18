# Geòlas — Curated Resource Scour (research stage)

*Research-stage deliverable for the "richer resources" feature. Input to the
build session: the curated set, the region/process tagging (reconciled against
the LIVE `knowledge-base.js` and `reference-sites.js`), and the data shape. No
code is changed here. Descriptions are paraphrased in our own words; every item
links to the publisher's source/PDF and attributes it. Verify each URL resolves
at build time — sites reorganise.*

---

## 1. Verdict: the scour found plenty — build the structure

The prompt's worry ("verify the scour actually finds downloadable guides before
committing to the structure") is settled. Four anchor catalogues yield ~100
free, downloadable, attributable items covering every region and all six
processes. Two of the sources are *already* organised area-by-area, so tagging
is largely transcription, not judgement.

| Source | What it is | Count | Strength |
|---|---|---|---|
| **SGT / NatureScot–BGS "Landscape Fashioned by Geology"** | Region booklets, free PDF each | 20 + 3 trail/pebble | The by-region backbone |
| **Edinburgh Geol. Soc. — Lothian & Borders GeoConservation leaflets** | Per-site leaflets, free PDF | ~38 | Dense Midland Valley site-level coverage |
| **Aberdeen Geol. Soc. — field guides** | Per-locality excursion PDFs | ~20 | NE Scotland; strong process spread |
| **Geological Society of Glasgow — itineraries** | Per-site excursion PDFs | ~14 | West / Clyde / Arran |

Catch-alls for later depth: **GeoGuide** (geoguide.scottishgeologytrust.org, 131
publications, the EGS leaflets re-hosted with interactive maps), **BGS
Earthwise** (full Moine & Skye guides, British Regional Geology), **Geowalks /
Earth Science Outdoors** (teacher excursions).

---

## 2. Region taxonomy — RECONCILED to the live six (decision)

**Decision: reuse the existing six KB regions; do NOT invent a new scheme.**
The earlier draft proposed nine resource-facing regions. Seeing the live code,
that was wrong: `knowledge-base.js` defines six regions and
`reference-sites.js` already tags all 51 geosites against the *same six names*.
They are geographic/tectonic — exactly the axis resources sort on — and are
deployed and load-bearing (`nearestRegion()`, the map layer, the by-area
browse). A parallel taxonomy would duplicate and drift.

The six (use the `id`, not the name, for tagging):

| `id` | `name` |
|---|---|
| `midland-valley` | Midland Valley |
| `southern-uplands` | Southern Uplands |
| `grampian-argyll` | Grampian & Argyll |
| `northern-highlands` | Northern Highlands |
| `hebrides` | Hebrides |
| `orkney-shetland` | Orkney & Shetland |

**One lightweight addition:** an optional `area` string on each resource holding
the finer locality/booklet name ("Skye", "Buchan", "Lothian", "Arran"). Keeps
the six-region alignment while preserving useful granularity — no new region
machinery, the UI can show `area` as a sub-label under the region.

**Two corrections the live data forces (the earlier draft got these wrong):**
- **Arran → `midland-valley`.** `reference-sites.js` tags "Isle of Arran" as
  Midland Valley. So the LFG Arran booklet and the Glasgow Arran itineraries are
  `midland-valley` (with `area: "Arran"`), NOT a separate region.
- **Caithness → `northern-highlands`.** Achanarras and Smoo are tagged Northern
  Highlands. The "Moray and Caithness" booklet therefore spans
  `grampian-argyll` (Moray) + `northern-highlands` (Caithness).

How the earlier nine collapse to six: `nw-highlands`→`northern-highlands`;
`grampian-highlands`+`ne-scotland`→`grampian-argyll`; `argyll-islands`→
`grampian-argyll` (Mull/Iona/Staffa/Islay are tagged Grampian & Argyll in the
live sites) EXCEPT Skye/Rum/Eigg→`hebrides`; `arran-clyde`→`midland-valley`;
`caithness-orkney-shetland`→ split `orkney-shetland` / `northern-highlands`;
`outer-hebrides`→`hebrides`.

---

## 3. Process keys — confirmed against `kbMatchGlossary`

`KB_GLOSSARY` clusters terms under six headings; each term carries machine
`tags` (e.g. `basalt`, `gneiss`, `thrust`, `till`). For resource tagging use six
stable short keys that map 1:1 to the cluster headings:

| process key | KB glossary cluster heading |
|---|---|
| `igneous` | "Igneous — molten rock" |
| `sedimentary` | "Sedimentary — laid down in layers" |
| `metamorphic` | "Metamorphic — changed by heat & pressure" |
| `structure` | "Structure & plate tectonics" |
| `glacial` | "Glacial & Ice Age" |
| `fossils` | "Fossils & life" |

A resource may carry several. Auto-suggest for a logged site (later slice) can
reuse `kbMatchGlossary()` on the site's BGS lithology, then map matched clusters
→ these keys to surface resources sharing a process.

---

## 4. Data shape (proposed)

Mirrors the existing `KB_RESOURCES` style. Add a new `KB_RESOURCE_LIBRARY` array
(the bundled, curated set) alongside the current `KB_RESOURCES` (the short
website/society/video lists, which can stay as-is or fold in):

```js
{
  id: "lfg-skye",                  // stable slug, unique
  title: "Skye — A Landscape Fashioned by Geology",
  type: "pdf-booklet",             // pdf-booklet | excursion-guide | leaflet | web-page | video
  url: "https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-skye.pdf",
  source: "SNH/BGS, via Scottish Geology Trust",
  desc: "How Skye's Cuillin gabbro, the Trotternish lava landslips and the...",  // OUR words
  regions: ["hebrides"],           // existing KB region ids
  area: "Skye",                    // optional finer locality label
  processes: ["igneous", "sedimentary", "glacial"],
  bundled: true
}
```

For **user-added** resources (existing `resources` table): add nullable
`region` and `process` columns (single value each is plenty; keep tagging
optional so adding a link stays a 10-second job). Bundled set in JS; user set
in SQLite with the existing offline-sync path. "Bundled" vs "yours" stays
visually distinct, as now.

---

## 5. The curated set (tagged to the live six regions)

Descriptions below are short cues — the build keeps them paraphrased, never
lifts booklet text.

### 5a. Landscape Fashioned by Geology (SGT / SNH–BGS) — region backbone
Base `https://www.scottishgeologytrust.org/downloads/` + file. `type:
pdf-booklet`. Source "SNH/BGS, via Scottish Geology Trust".

| id | Title | file | regions | area | processes |
|---|---|---|---|---|---|
| `lfg-scotland` | Scotland: the Creation of its Natural Landscape | `LandscapeFashionedbyGeology-scotland.pdf` | *(all six)* | — | igneous, sedimentary, metamorphic, structure, glacial, fossils |
| `lfg-ne-scotland` | Northeast Scotland | `LandscapeFashionedbyGeology-northeastscotland.pdf` | grampian-argyll | Northeast / Deeside | metamorphic, sedimentary, glacial |
| `lfg-argyll` | Argyll and the Islands | `LandscapeFashionedbyGeology-Argyll.pdf` | grampian-argyll | Argyll | metamorphic, structure, glacial |
| `lfg-moray-caithness` | Moray and Caithness | `LandscapeFashionedbyGeology-moray-and-caithness.pdf` | grampian-argyll, northern-highlands | Moray & Caithness | sedimentary, structure, glacial |
| `lfg-glasgow-ayrshire` | Glasgow and Ayrshire | `LandscapeFashionedbyGeology-glasgowayr.pdf` | midland-valley | Glasgow & Ayrshire | sedimentary, igneous, glacial |
| `lfg-ben-nevis-glencoe` | Ben Nevis and Glencoe | `LandscapeFashionedbyGeology-bennevisandglencoe.pdf` | grampian-argyll | Lochaber | igneous, glacial |
| `lfg-outer-hebrides` | The Outer Hebrides *(+ Gaelic ed.)* | `LandscapeFashionedbyGeology-outerhebrides.pdf` *(Gaelic `-innsegall.pdf`)* | hebrides | Outer Hebrides | metamorphic, glacial |
| `lfg-mull` | Mull and Iona | `LandscapeFashionedbyGeology-mull.pdf` | grampian-argyll | Mull & Iona | igneous |
| `lfg-rum` | Rum and the Small Isles | `LandscapeFashionedbyGeology-rum.pdf` | hebrides | Rum & Small Isles | igneous, glacial |
| `lfg-edin-wlothian` | Edinburgh and West Lothian | `LandscapeFashionedbyGeology-EdinWestLothian.pdf` | midland-valley | Edinburgh & W Lothian | igneous, sedimentary, glacial |
| `lfg-glen-roy` | Parallel Roads of Glen Roy | `LandscapeFashionedbyGeology-glenroy.pdf` | grampian-argyll | Lochaber | glacial |
| `lfg-sw-scotland` | Southwest Scotland | `LandscapeFashionedbyGeology-southwestscotland.pdf` | southern-uplands | SW Scotland | sedimentary, igneous, structure, glacial |
| `lfg-nw-highlands` | Northwest Highlands | `LandscapeFashionedbyGeology-NWHighlands.pdf` | northern-highlands | NW Highlands | metamorphic, structure |
| `lfg-fife-tayside` | Fife and Tayside | `LandscapeFashionedbyGeology-fifetayside.pdf` | midland-valley | Fife & Tayside | igneous, sedimentary |
| `lfg-skye` | Skye | `LandscapeFashionedbyGeology-skye.pdf` | hebrides | Skye | igneous, sedimentary, glacial |
| `lfg-elothian-borders` | East Lothian and the Borders | `LandscapeFashionedbyGeology-eastlothianborders.pdf` | midland-valley, southern-uplands | E Lothian & Borders | structure, sedimentary, igneous |
| `lfg-arran-clyde` | Arran and the Clyde Islands | `LandscapeFashionedbyGeology-Arran-and-the-Clyde-Islands.pdf` | midland-valley | Arran | igneous, structure, sedimentary |
| `lfg-orkney-shetland` | Orkney and Shetland | `LandscapeFashionedbyGeology-OrkneyShetland.pdf` | orkney-shetland | Orkney & Shetland | sedimentary, metamorphic |
| `lfg-lochlomond-stirling` | Loch Lomond to Stirling | `LandscapeFashionedbyGeology-LochLomondStirling.pdf` | midland-valley, grampian-argyll | Loch Lomond & Stirling | structure, glacial, sedimentary |
| `lfg-cairngorms` | Cairngorms | `LandscapeFashionedbyGeology-cairngorms.pdf` | grampian-argyll | Cairngorms | igneous, glacial |

Trail / pebble guides (SGT, `type: pdf-booklet`):
- `sgt-tentsmuir` — Tentsmuir Timeline Trail — `…/uploads/2023/04/TentsmuirTimelineTrail.pdf` — midland-valley — Fife — glacial, sedimentary
- `sgt-cairngorm-trails` — Cairngorms Trails Through Time — `…/uploads/2023/04/Cairngormstrailsthroughtime.pdf` — grampian-argyll — Cairngorms — glacial, igneous
- `sgt-beach-pebble` — Beach Pebble Guide *(CC BY-NC-SA)* — `…/uploads/2021/08/Beach-Pebble-Guide-Scottish-Geology-Trust2021v1.pdf` — *(all coastal)* — — sedimentary, igneous, metamorphic

### 5b. Lothian & Borders GeoConservation leaflets (Edinburgh Geol. Soc.)
All `type: leaflet`, source "Lothian & Borders GeoConservation / Edinburgh
Geological Society". Base `https://edinburghgeolsoc.org/downloads/`. Region is
`midland-valley` unless noted; `area` distinguishes locality.

| id | Title | file | region / area | processes |
|---|---|---|---|---|
| `lbgc-edinburgh-lgs` | Edinburgh's Local Geodiversity Sites | `lbgc-leaflet-City-of-Edinburgh-Council-30-Local-Geodiversity-Sites.pdf` | midland-valley / Edinburgh | igneous, sedimentary, glacial |
| `lbgc-castle-rock` | Around Castle Rock | `lbgc-leaflet-around-castle-rock.pdf` | midland-valley / Edinburgh | igneous |
| `lbgc-west-end` | Around the West End of Edinburgh | `lbgc-leaflet-west-end-edinburgh.pdf` | midland-valley / Edinburgh | sedimentary |
| `lbgc-st-andrew-sq` | Around St Andrew Square | `lbgc-leaflet-st-andrew-square.pdf` | midland-valley / Edinburgh | sedimentary, igneous, metamorphic |
| `lbgc-blackford` | Blackford Hill (Agassiz Rock) | `lbgc-leaflet-blackford-hill.pdf` | midland-valley / Edinburgh | igneous, glacial |
| `lbgc-southside` | Building Stones of Edinburgh's South Side | `lbgcleaflet_southside.pdf` | midland-valley / Edinburgh | sedimentary |
| `lbgc-calton` | Calton Hill | `rigsleaflet_caltonhilla4.pdf` | midland-valley / Edinburgh | igneous |
| `lbgc-canongate` | Canongate Wall | `lbgcleaflet_canongatewalla4.pdf` | midland-valley / Edinburgh | sedimentary, igneous, metamorphic |
| `lbgc-corstorphine` | Corstorphine Hill (dolerite sill) | `rigsleaflet_corstorphinea4.pdf` | midland-valley / Edinburgh | igneous, sedimentary |
| `lbgc-craigleith` | Craigleith Quarry | `rigsleaflet_craigleitha4.pdf` | midland-valley / Edinburgh | sedimentary |
| `lbgc-craiglockhart` | Craiglockhart & Edinburgh's Seven Hills | `rigsleaflet_craiglockharta4.pdf` | midland-valley / Edinburgh | igneous, glacial |
| `lbgc-cramond` | Cramond — Geological History | `lbgcleaflet_cramond.pdf` | midland-valley / Edinburgh | sedimentary, glacial |
| `lbgc-hutton` | James Hutton | `James-Hutton-LBGC-leaflet.pdf` | midland-valley / Edinburgh | structure |
| `lbgc-joppa` | Joppa Shore | `rigsleaflet_joppaa4.pdf` | midland-valley / Edinburgh | sedimentary, fossils |
| `lbgc-pentland` | Pentland Rocks | `lbgcleaflet_pentland.pdf` | midland-valley / Pentlands | igneous |
| `lbgc-ravelston` | Ravelston Woods | `rigsleaflet_ravelstonwoodsa4.pdf` | midland-valley / Edinburgh | sedimentary |
| `lbgc-stones-scotland` | Stones of Scotland | `rigsleaflet_stonesofscotlanda4.pdf` | midland-valley / Edinburgh | igneous, sedimentary, metamorphic |
| `lbgc-wol-geology` | Water of Leith — The Geology | `rigsleaflet_waterofleitha4.pdf` | midland-valley / Edinburgh | sedimentary |
| `lbgc-wol-redhall` | Water of Leith — Redhall | `lbgcleaflet_redhalla4.pdf` | midland-valley / Edinburgh | sedimentary |
| `lbgc-wol-stockbridge` | Water of Leith — Stockbridge | `lbgcleaflet_stockbridgea4.pdf` | midland-valley / Edinburgh | sedimentary |
| `lbgc-edin-volcano` | Discovering Edinburgh's Volcano | `…/uploads/2021/11/discovering-edinburghs-volcano.pdf` | midland-valley / Edinburgh | igneous |
| `lbgc-barns-ness` | Barns Ness Fossils | `rigsleaflet_barnsnessa4.pdf` | midland-valley / East Lothian | fossils, sedimentary |
| `lbgc-dunbar` | Dunbar Geology Walk | `lbgcleaflet_dunbar.pdf` | midland-valley / East Lothian | igneous, sedimentary |
| `lbgc-eyemouth` | Eyemouth | `lbgc-leaflet-eyemouth.pdf` | southern-uplands / Berwickshire | structure, sedimentary |
| `lbgc-north-berwick` | North Berwick Volcanoes | `rigsleaflet_northberwicka4.pdf` | midland-valley / East Lothian | igneous |
| `lbgc-siccar-point` | Siccar Point | `Siccar-Point-LBGC-leaflet.pdf` | midland-valley / Berwickshire | structure, sedimentary |
| `lbgc-st-abbs` | St Abb's Head | `lbgc-leaflet-st-abbs.pdf` | southern-uplands / Berwickshire | igneous |
| `lbgc-auchinoon` | Auchinoon Brae | `lbgcleaflet_auchinoonbrae.pdf` | midland-valley / West Lothian | glacial, igneous |
| `lbgc-binny-craig` | Binny Craig (crag-and-tail) | `lbgc_binnycraig.pdf` | midland-valley / West Lothian | glacial, igneous |
| `lbgc-bathgate` | Bathgate Hills | `lbgc_bathgatehills.pdf` | midland-valley / West Lothian | igneous, sedimentary |
| `lbgc-east-kirkton` | East Kirkton Quarry (fossil site) | `lbgc_eastkirkton.pdf` | midland-valley / West Lothian | fossils, sedimentary |
| `lbgc-hopetoun` | Hopetoun Foreshore | `lbgcleaflet_hopetounshore.pdf` | midland-valley / West Lothian | sedimentary, glacial |
| `lbgc-petershill` | Petershill (limestone reef) | `lbgc_petershill.pdf` | midland-valley / West Lothian | sedimentary, fossils |
| `lbgc-witch-craig` | Witch Craig Wall | `rigsleaflet_witchcraigwall.pdf` | midland-valley / West Lothian | igneous, sedimentary |
| `lbgc-dalkeith-stones` | Dalkeith's Building Stones | `lbgc-leaflet-dalkeith-building-stones.pdf` | midland-valley / Midlothian | sedimentary |
| `lbgc-dalkeith-park` | Geology of Dalkeith Country Park | `lbgc-leaflet-dalkeith-country-park.pdf` | midland-valley / Midlothian | sedimentary |
| `lbgc-esk-valley` | Esk Valley | `lbgcleaflet_eskvalley.pdf` | midland-valley / Midlothian | sedimentary, igneous, glacial |
| `lbgc-callander` | Callander Geodiversity Trail | `CCDT_GeodiversityTrail_web.pdf` | midland-valley / Callander (HBF) | structure, glacial |
| `lbgc-wolfs-hole` | Wolf's Hole Quarry, Bridge of Allan | `rigsleaflet_wolfshole.pdf` | midland-valley / Stirling | sedimentary |

### 5c. Aberdeen Geological Society field guides
`type: excursion-guide`, source "Aberdeen Geological Society",
`regions: [grampian-argyll]` (NE Scotland sits in Grampian & Argyll in the live
taxonomy). Base `https://www.aberdeengeolsoc.org.uk/wp-content/uploads/`.

| id | Title | file | area | processes |
|---|---|---|---|---|
| `ags-portsoy` | Dalradian of the Portsoy Area | `2018/10/03-Portsoy.pdf` | Banff Coast | metamorphic, structure |
| `ags-macduff` | Macduff Dalradian Turbidite Fan & Glacial Deposits | `2018/10/04-Macduff-Dalradian-Turbidite-Fan-and-Glacial-Deposits.pdf` | Banff Coast | sedimentary, metamorphic, glacial |
| `ags-buchan` | Macduff–Whitehills: Buchan-type Metamorphism | `2018/10/05-Buchan-Zones.pdf` | Buchan | metamorphic |
| `ags-fraserburgh` | Dalradian of Fraserburgh | `2018/10/06-Fraserburgh.pdf` | Buchan | metamorphic |
| `ags-inzie-head` | Cairnbulg–Inzie Head: Dalradian Migmatites | `2018/10/07-Inzie-Head.pdf` | Buchan | metamorphic |
| `ags-pennan` | Pennan: Unconformity in the ORS | `2018/10/09-Pennan-ORS-Unconformity.pdf` | Banff Coast | sedimentary, structure |
| `ags-new-aberdour` | Lower Old Red Sandstone of New Aberdour | `2018/10/10-The-Lower-ORS-of-New-Aberdour.pdf` | Buchan | sedimentary |
| `ags-stonehaven` | Stonehaven–Findon: Dalradian Structure & Metamorphism | `2018/10/18-Stonehaven-to-Findon.pdf` | Mearns | metamorphic, structure |
| `ags-st-cyrus` | Devonian of St Cyrus & Milton Ness | `2018/10/21-Devonian-of-St-Cyrus-and-Milton-Ness.pdf` | Mearns | sedimentary |
| `ags-crawton` | Crawton: Lavas & Conglomerates of the Lower ORS | `2018/10/22-Crawton-Lavas-and-Conglomerates-of-the-Lower-ORS.pdf` | Mearns | igneous, sedimentary |
| `ags-dunnottar-hbf` | Dunnottar–Stonehaven & the Highland Boundary Fault | `2018/10/23-Dunnottar-To-Stonehaven-and-the-HBF.pdf` | Mearns | structure |
| `ags-ythan` | Sedimentology of the Ythan Estuary | `2018/10/24-The-Ythan-Estuary.pdf` | Aberdeenshire | sedimentary |
| `ags-glen-esk` | Barrow's Zones in Glen Esk | `Barrows-Zones-in-Glen-Esk.pdf` | Angus Glens | metamorphic |

Newer AGS booklets (verify URLs/paths at build): `Tod-Head-Lighthouse.pdf`
(Mearns; sedimentary, igneous), `Dinnet-Glacial-Field-Guide-March-2026-for-Ken.pdf`
(Deeside; glacial), `Hervie-Valley-Glacial-History-1.pdf` (glacial),
`Seagreens-and-Cove-Hill-Geo-guide-short-May-2024.pdf` (Aberdeen; sedimentary),
`Geology-of-Old-Aberdeen.pdf` (Aberdeen; sedimentary), `Kinkell-Ness.pdf`
(St Andrews → midland-valley/Fife; sedimentary, fossils).

### 5d. Geological Society of Glasgow itineraries
`type: excursion-guide`, source "Geological Society of Glasgow", site
`geologyglasgow.org.uk/itineraries/`. **Per-item PDF URLs need fetching at build
time** (index lists titles; capture each link then).

| Title | regions | area | processes |
|---|---|---|---|
| Fossil Grove | midland-valley | Glasgow | fossils, sedimentary |
| Glasgow's Building Stones | midland-valley | Glasgow | sedimentary |
| Glasgow University Building Stones | midland-valley | Glasgow | sedimentary |
| Dumbarton Rock | midland-valley | Clyde | igneous |
| Rouken Glen | midland-valley | Glasgow | sedimentary, glacial |
| Corrie Burn | midland-valley | Campsies | sedimentary, igneous |
| Aberfoyle District (2020) | grampian-argyll | Aberfoyle (HBF) | metamorphic, structure |
| Ardmore Point | midland-valley | Clyde | sedimentary |
| Balmaha | midland-valley | Loch Lomond (HBF) | structure |
| Ballantrae District | southern-uplands | Ayrshire | igneous, structure |
| Heads of Ayr | midland-valley | Ayrshire | igneous, sedimentary |
| Corrie Shore (Arran) | midland-valley | Arran | sedimentary, igneous |
| Drumadoon (Arran) | midland-valley | Arran | igneous |
| Lochranza District (Arran) | midland-valley | Arran | structure, sedimentary |

### 5e. Catch-all sources for later depth (not itemised)
- **GeoGuide** — `geoguide.scottishgeologytrust.org` — 131 publications,
  interactive maps; best "see more" per region.
- **BGS Earthwise** — full Moine (Northern Highlands) & Skye guides; British
  Regional Geology. Strengthens `northern-highlands`, `hebrides`.
- **Geowalks / Earth Science Outdoors** — teacher excursions (Arthur's Seat,
  Siccar Point).

---

## 6. Copyright / licensing
- **LFG booklets**: free-download SNH/BGS (Crown). Link to SGT URL; paraphrase;
  attribute "SNH/BGS, via SGT".
- **SGT-authored** (Beach Pebble, trail guides): CC BY-NC-SA 4.0 — link +
  attribute; paraphrase.
- **EGS / GeoConservation leaflets**: society/group copyright. Linking to the
  public PDF + attribution needs no permission; do **not** reproduce leaflet
  text.
- **AGS / Glasgow**: society copyright; link + attribute, paraphrase.
- Rule across the board: **store the URL, write our own one-line description,
  name the publisher.** No booklet text copied.

---

## 7. Build plan (the scope split, now low-risk)
1. **Data layer** — add `KB_RESOURCE_LIBRARY` (the array in §8) to
   `knowledge-base.js`, exposed on `window.KB`. Migration: nullable
   `region`/`process` on the user `resources` table. Bump `CACHE_VERSION` in
   `sw.js`; no new static file (it's inside the existing knowledge-base.js).
2. **Library UI** — by-region and by-process browse views filtering bundled +
   user sets; "bundled" vs "yours" stays distinct; `area` shown as sub-label.
3. *(Separate, later slice)* **Per-site resource linking** — `site_resources`
   table + attach-from-site UI; auto-suggest via region + `kbMatchGlossary()`.
   Self-contained; doesn't block 1–2.

Do 1–2 first: visible win (press a button → every excursion guide for your
area), and it proves the tagging before per-site linking is layered on.

---

## 8. Ready-to-use array (starter — LFG backbone + a sample of each source)
*Paste target: `knowledge-base.js`. This is the SGT LFG set in full plus a
representative slice of the others, enough to wire and test the UI; the build
session completes 5b–5d from the tables above and confirms every URL.*

```js
// ---- Curated resource library (bundled; by region + process) ----
const KB_RESOURCE_LIBRARY = [
  // Landscape Fashioned by Geology (SNH/BGS via Scottish Geology Trust)
  { id:"lfg-scotland", title:"Scotland: the Creation of its Natural Landscape", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-scotland.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"A nationwide introduction to how Scotland's rocks and landscapes came to be, from deep time to today.",
    regions:["midland-valley","southern-uplands","grampian-argyll","northern-highlands","hebrides","orkney-shetland"],
    processes:["igneous","sedimentary","metamorphic","structure","glacial","fossils"], bundled:true },
  { id:"lfg-ne-scotland", title:"Northeast Scotland — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-northeastscotland.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"The hills and glens northeast of the Cairngorms, from metamorphic basement to ice-age shaping.",
    regions:["grampian-argyll"], area:"Northeast / Deeside", processes:["metamorphic","sedimentary","glacial"], bundled:true },
  { id:"lfg-argyll", title:"Argyll and the Islands — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-Argyll.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"Peninsulas, islands and lochs whose grain follows the Caledonian mountain-building, later ice-scoured.",
    regions:["grampian-argyll"], area:"Argyll", processes:["metamorphic","structure","glacial"], bundled:true },
  { id:"lfg-moray-caithness", title:"Moray and Caithness — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-moray-and-caithness.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"From Moray's rolling hills to the flagstone cliffs of Caithness and the peat of the Flow Country.",
    regions:["grampian-argyll","northern-highlands"], area:"Moray & Caithness", processes:["sedimentary","structure","glacial"], bundled:true },
  { id:"lfg-glasgow-ayrshire", title:"Glasgow and Ayrshire — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-glasgowayr.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"The industrial heartland's rocks: vanished oceans, tropical swamps and lavas, moulded by ice.",
    regions:["midland-valley"], area:"Glasgow & Ayrshire", processes:["sedimentary","igneous","glacial"], bundled:true },
  { id:"lfg-ben-nevis-glencoe", title:"Ben Nevis and Glencoe — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-bennevisandglencoe.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"Ancient sandstone peaks and the roots of 400-million-year-old volcanoes, carved by glaciers.",
    regions:["grampian-argyll"], area:"Lochaber", processes:["igneous","glacial"], bundled:true },
  { id:"lfg-outer-hebrides", title:"The Outer Hebrides — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-outerhebrides.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"Lewisian gneiss — among Britain's oldest rock — shaped by wind, wave and ice. (Gaelic edition also available.)",
    regions:["hebrides"], area:"Outer Hebrides", processes:["metamorphic","glacial"], bundled:true },
  { id:"lfg-mull", title:"Mull and Iona — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-mull.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"Lava plateaux, the eroded core of a great volcano, and the pink granite of the Ross of Mull.",
    regions:["grampian-argyll"], area:"Mull & Iona", processes:["igneous"], bundled:true },
  { id:"lfg-rum", title:"Rum and the Small Isles — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-rum.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"A small island packing deserts, ocean floors, volcanoes and glaciers into a 3-billion-year story.",
    regions:["hebrides"], area:"Rum & Small Isles", processes:["igneous","glacial"], bundled:true },
  { id:"lfg-edin-wlothian", title:"Edinburgh and West Lothian — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-EdinWestLothian.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"A volcanic past beneath the capital — from erupting vents through seas and ice to today's parks.",
    regions:["midland-valley"], area:"Edinburgh & West Lothian", processes:["igneous","sedimentary","glacial"], bundled:true },
  { id:"lfg-glen-roy", title:"Parallel Roads of Glen Roy — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-glenroy.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"The famous hillside 'roads' explained: shorelines of ice-dammed lakes and catastrophic floods.",
    regions:["grampian-argyll"], area:"Lochaber", processes:["glacial"], bundled:true },
  { id:"lfg-sw-scotland", title:"Southwest Scotland — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-southwestscotland.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"Ballantrae's vanished ocean, Southern Upland sediments, desert dunes and ice-sculpted hills.",
    regions:["southern-uplands"], area:"SW Scotland", processes:["sedimentary","igneous","structure","glacial"], bundled:true },
  { id:"lfg-nw-highlands", title:"Northwest Highlands — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-NWHighlands.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"Clashing continents, closing oceans and the Moine Thrust, in one of Scotland's most stunning regions.",
    regions:["northern-highlands"], area:"NW Highlands", processes:["metamorphic","structure"], bundled:true },
  { id:"lfg-fife-tayside", title:"Fife and Tayside — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-fifetayside.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"A dramatic coast and volcanic hills from a time when Scotland sat on the equator.",
    regions:["midland-valley"], area:"Fife & Tayside", processes:["igneous","sedimentary"], bundled:true },
  { id:"lfg-skye", title:"Skye — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-skye.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"How the Cuillin gabbro, the Trotternish landslips and the Quiraing came to be.",
    regions:["hebrides"], area:"Skye", processes:["igneous","sedimentary","glacial"], bundled:true },
  { id:"lfg-elothian-borders", title:"East Lothian and the Borders — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-eastlothianborders.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"A complex structure beneath fertile plains and rolling hills, with an eventful deep history.",
    regions:["midland-valley","southern-uplands"], area:"East Lothian & Borders", processes:["structure","sedimentary","igneous"], bundled:true },
  { id:"lfg-arran-clyde", title:"Arran and the Clyde Islands — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-Arran-and-the-Clyde-Islands.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"The Highland–Lowland boundary made visible — Hutton's unconformity, granite and a young volcano.",
    regions:["midland-valley"], area:"Arran", processes:["igneous","structure","sedimentary"], bundled:true },
  { id:"lfg-orkney-shetland", title:"Orkney and Shetland — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-OrkneyShetland.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"Colliding continents, fossil-fish lakes and Atlantic-battered cliffs across the Northern Isles.",
    regions:["orkney-shetland"], area:"Orkney & Shetland", processes:["sedimentary","metamorphic"], bundled:true },
  { id:"lfg-lochlomond-stirling", title:"Loch Lomond to Stirling — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-LochLomondStirling.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"From the low Carse to the mountain tops, where the Highland Boundary Fault crosses the heart of Scotland.",
    regions:["midland-valley","grampian-argyll"], area:"Loch Lomond & Stirling", processes:["structure","glacial","sedimentary"], bundled:true },
  { id:"lfg-cairngorms", title:"Cairngorms — A Landscape Fashioned by Geology", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-cairngorms.pdf",
    source:"SNH/BGS, via Scottish Geology Trust",
    desc:"Britain's largest granite plateau and its outstanding corries, glens and meltwater landforms.",
    regions:["grampian-argyll"], area:"Cairngorms", processes:["igneous","glacial"], bundled:true },

  // SGT trail / pebble guides
  { id:"sgt-tentsmuir", title:"Tentsmuir Timeline Trail", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/wp-content/uploads/2023/04/TentsmuirTimelineTrail.pdf",
    source:"Scottish Geology Trust",
    desc:"A coastal walk reading the recent, fast-changing geology of an advancing Fife shoreline.",
    regions:["midland-valley"], area:"Fife", processes:["glacial","sedimentary"], bundled:true },
  { id:"sgt-cairngorm-trails", title:"Cairngorms Trails Through Time", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/wp-content/uploads/2023/04/Cairngormstrailsthroughtime.pdf",
    source:"Scottish Geology Trust",
    desc:"Walking trails reading the granite and glacial story of the Cairngorm plateau.",
    regions:["grampian-argyll"], area:"Cairngorms", processes:["glacial","igneous"], bundled:true },
  { id:"sgt-beach-pebble", title:"Scotland's Beach Pebble Guide", type:"pdf-booklet",
    url:"https://www.scottishgeologytrust.org/wp-content/uploads/2021/08/Beach-Pebble-Guide-Scottish-Geology-Trust2021v1.pdf",
    source:"Scottish Geology Trust (CC BY-NC-SA 4.0)",
    desc:"Identify common beach pebbles and the long journeys and processes that shaped them.",
    regions:["midland-valley","northern-highlands","hebrides","grampian-argyll","southern-uplands","orkney-shetland"],
    processes:["sedimentary","igneous","metamorphic"], bundled:true },

  // --- Sample from each remaining source (build session completes per §5) ---
  { id:"lbgc-siccar-point", title:"Siccar Point", type:"leaflet",
    url:"https://edinburghgeolsoc.org/downloads/Siccar-Point-LBGC-leaflet.pdf",
    source:"Lothian & Borders GeoConservation / Edinburgh Geological Society",
    desc:"Hutton's Unconformity — the outcrop where the vastness of geological time was first proven.",
    regions:["midland-valley"], area:"Berwickshire", processes:["structure","sedimentary"], bundled:true },
  { id:"lbgc-castle-rock", title:"Around Castle Rock", type:"leaflet",
    url:"https://edinburghgeolsoc.org/downloads/lbgc-leaflet-around-castle-rock.pdf",
    source:"Lothian & Borders GeoConservation / Edinburgh Geological Society",
    desc:"The volcanic plug beneath Edinburgh Castle and the building stones of the old town around it.",
    regions:["midland-valley"], area:"Edinburgh", processes:["igneous"], bundled:true },
  { id:"ags-dunnottar-hbf", title:"Dunnottar to Stonehaven & the Highland Boundary Fault", type:"excursion-guide",
    url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/23-Dunnottar-To-Stonehaven-and-the-HBF.pdf",
    source:"Aberdeen Geological Society",
    desc:"A coastal traverse across the Highland Boundary Fault, the great divide between Highlands and Lowlands.",
    regions:["grampian-argyll"], area:"Mearns", processes:["structure"], bundled:true },
  { id:"ags-buchan", title:"Macduff to Whitehills — Buchan-type Metamorphism", type:"excursion-guide",
    url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/05-Buchan-Zones.pdf",
    source:"Aberdeen Geological Society",
    desc:"The classic low-pressure 'Buchan' metamorphic zones exposed along the Banffshire coast.",
    regions:["grampian-argyll"], area:"Buchan", processes:["metamorphic"], bundled:true },
];

// expose on window.KB alongside the existing fields (build wires this in)
// window.KB.resourceLibrary = KB_RESOURCE_LIBRARY;
```
