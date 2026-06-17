// Reference geological sites — the Scottish Geodiversity Forum's "51 Best
// Places to see Scotland's Geology" (2017), shown as a toggleable map layer.
// Tapping one opens a popup with a short note (our own words), a link to the
// Scottish Geology Trust page, and a "Log this site" button that adopts it as
// your own entry (fetching its BGS geology like any site).
//
// Coordinates are approximate feature centroids — fine for a 1:625k geology
// lookup, and good enough to place the pin. Region tags match the six regional
// pages in the library so the layer and the "by area" browse stay consistent.
//
// Source: scottishgeologytrust.org/geology/51-best-places/ (© Scottish Geology
// Trust / Scottish Geodiversity Forum). Notes paraphrased, not copied.

const SGT_BASE = "https://www.scottishgeologytrust.org/geology/51-best-places/";

const REFERENCE_SITES = [
  { name: "Unst, Shetland", lat: 60.75, lon: -0.85, region: "Orkney & Shetland", slug: "unst-shetland",
    note: "Ancient ocean-floor and mantle rocks (the Unst ophiolite) on Britain's most northerly inhabited island." },
  { name: "Eshaness Coast, Shetland", lat: 60.47, lon: -1.62, region: "Orkney & Shetland", slug: "eshaness-coast-shetland",
    note: "Dramatic cliffs cut into the eroded remains of an ancient volcano." },
  { name: "St Ninian's Tombolo, Shetland", lat: 59.97, lon: -1.34, region: "Orkney & Shetland", slug: "st-ninians-tombolo-shetland",
    note: "The finest sand tombolo in Britain — a wave-built bar linking an island to the mainland." },
  { name: "Heart of Neolithic Orkney", lat: 58.99, lon: -3.21, region: "Orkney & Shetland", slug: "the-heart-of-neolithic-orkney",
    note: "Standing stones of Stenness, built from the local thinly-bedded Devonian flagstones." },
  { name: "North-West Hoy, Orkney", lat: 58.88, lon: -3.43, region: "Orkney & Shetland", slug: "north-west-hoy-orkney",
    note: "The Old Man of Hoy — a sea stack of Devonian Old Red Sandstone." },

  { name: "Achanarras Quarry, Caithness", lat: 58.44, lon: -3.58, region: "Northern Highlands", slug: "achanarras-quarry-caithness",
    note: "A world-famous fish bed from the Devonian Orcadian Lake." },
  { name: "Smoo Cave, Durness", lat: 58.56, lon: -4.72, region: "Northern Highlands", slug: "smoo-cave-durness",
    note: "A sea and freshwater cave dissolved out of Cambrian Durness limestone." },
  { name: "Scourie Bay & Laxford", lat: 58.35, lon: -5.16, region: "Northern Highlands", slug: "scourie-bay-and-laxford",
    note: "Classic Lewisian gneiss, cut by the dark Scourie dykes — billions of years of crust." },
  { name: "Loch Glencoul", lat: 58.25, lon: -4.91, region: "Northern Highlands", slug: "loch-glencoul",
    note: "The Glencoul Thrust — older rocks pushed bodily over younger along the Moine Thrust Belt." },
  { name: "Knockan Crag", lat: 58.04, lon: -5.08, region: "Northern Highlands", slug: "knockan-crag",
    note: "Where the Moine Thrust was first understood — older Moine schist lying on younger rock." },
  { name: "Corrieshalloch Gorge", lat: 57.75, lon: -5.00, region: "Northern Highlands", slug: "corrieshalloch-gorge",
    note: "A deep box canyon cut by glacial meltwater." },
  { name: "Beinn Eighe & Loch Maree", lat: 57.62, lon: -5.35, region: "Northern Highlands", slug: "beinn-eighe-nnr-and-loch-maree-torridon",
    note: "Torridonian sandstone peaks capped with white Cambrian quartzite, on Lewisian gneiss." },
  { name: "Black Isle & Hugh Miller Museum", lat: 57.68, lon: -4.04, region: "Northern Highlands", slug: "the-black-isle-and-hugh-miller-museum",
    note: "Cromarty: birthplace of Hugh Miller, the stonemason who popularised Old Red Sandstone fish." },
  { name: "Falls of Foyers, Great Glen", lat: 57.25, lon: -4.49, region: "Northern Highlands", slug: "falls-of-foyers-great-glen",
    note: "A waterfall on the line of the Great Glen Fault, Scotland's largest strike-slip fault." },
  { name: "Loch Monar", lat: 57.42, lon: -5.10, region: "Northern Highlands", slug: "loch-monar",
    note: "Folded and refolded Moine schists, beautifully displayed around the loch and dam." },

  { name: "Luskentyre, Harris", lat: 57.89, lon: -7.04, region: "Hebrides", slug: "luskentyre-harris",
    note: "Shell-sand beaches and dunes over some of the oldest rock in Britain, Lewisian gneiss." },
  { name: "Trotternish, Skye", lat: 57.65, lon: -6.30, region: "Hebrides", slug: "trotternish-skye",
    note: "Britain's largest landslip — Palaeogene lava slumping over weak Jurassic clay (the Quiraing, the Storr)." },
  { name: "Cuillin Hills, Skye", lat: 57.20, lon: -6.22, region: "Hebrides", slug: "cuillin-hills-skye",
    note: "Jagged gabbro peaks, the roots of a 60-million-year-old volcano, sharpened by glaciers." },
  { name: "Isle of Eigg", lat: 56.90, lon: -6.13, region: "Hebrides", slug: "isle-of-eigg",
    note: "The Sgurr — a ridge of pitchstone lava, and Jurassic fossil beds on the shore." },

  { name: "Laich Sandstones, Elgin", lat: 57.65, lon: -3.32, region: "Grampian & Argyll", slug: "laich-sandstones-elgin",
    note: "Permian-Triassic desert sandstones with reptile footprints near Elgin." },
  { name: "Spey Bay", lat: 57.66, lon: -3.05, region: "Grampian & Argyll", slug: "spey-bay",
    note: "A large shingle complex at the mouth of a fast river — active geomorphology." },
  { name: "Portsoy, Banff Coast", lat: 57.68, lon: -2.69, region: "Grampian & Argyll", slug: "portsoy-banff-coast",
    note: "Serpentinite ('Portsoy marble') and complex Dalradian metamorphic rocks on the coast." },
  { name: "Burn o' Vat, Dinnet", lat: 57.06, lon: -2.93, region: "Grampian & Argyll", slug: "burn-o-vat-dinnet",
    note: "A giant glacial meltwater pothole carved at the end of the ice age." },
  { name: "Corrie Fee, Glen Clova", lat: 56.87, lon: -3.10, region: "Grampian & Argyll", slug: "corrie-fee-glen-clova",
    note: "A textbook glacial corrie cut into Dalradian schists." },
  { name: "Cairngorms", lat: 57.08, lon: -3.67, region: "Grampian & Argyll", slug: "cairngorms",
    note: "Britain's largest granite massif, with the finest mountain glacial landforms." },
  { name: "River Feshie", lat: 57.00, lon: -3.90, region: "Grampian & Argyll", slug: "river-feshie",
    note: "A wandering braided river — one of the best active examples in Britain." },
  { name: "Schiehallion", lat: 56.67, lon: -4.10, region: "Grampian & Argyll", slug: "schiehallion",
    note: "The quartzite cone where the Earth's mass was first estimated (1774), inspiring contour lines." },
  { name: "Isle of Staffa", lat: 56.43, lon: -6.34, region: "Grampian & Argyll", slug: "isle-of-staffa",
    note: "Fingal's Cave — columnar-jointed Palaeogene basalt, the same lava province as the Giant's Causeway." },
  { name: "Isle of Iona", lat: 56.33, lon: -6.40, region: "Grampian & Argyll", slug: "isle-of-iona",
    note: "Lewisian gneiss and the pale 'Iona marble', a metamorphosed limestone." },
  { name: "Luing & the Atlantic Islands", lat: 56.22, lon: -5.62, region: "Grampian & Argyll", slug: "luing-and-the-atlantic-islands",
    note: "Dalradian slate, once quarried and shipped worldwide as roofing." },
  { name: "Glen Coe", lat: 56.67, lon: -5.00, region: "Grampian & Argyll", slug: "glen-coe-lochaber",
    note: "One of the first recognised cauldron-subsidence calderas — a collapsed Devonian volcano." },
  { name: "Parallel Roads of Glen Roy", lat: 56.93, lon: -4.85, region: "Grampian & Argyll", slug: "parallel-roads-of-glen-roy-lochaber",
    note: "Shorelines of a vanished ice-dammed lake, terraced into the hillsides." },
  { name: "Islay & the Garvellachs", lat: 55.80, lon: -6.20, region: "Grampian & Argyll", slug: "islay-and-the-garvellachs",
    note: "Rocks recording a global 'Snowball Earth' glaciation, around 700 million years ago." },

  { name: "Stonehaven", lat: 56.96, lon: -2.21, region: "Midland Valley", slug: "stonehaven",
    note: "The Highland Boundary Fault meets the coast; some of the oldest land-animal fossils." },
  { name: "St Cyrus", lat: 56.78, lon: -2.42, region: "Midland Valley", slug: "st-cyrus-beach",
    note: "Volcanic cliffs and dunes where Devonian lavas meet the sea." },
  { name: "Seaton Cliffs, Arbroath", lat: 56.57, lon: -2.56, region: "Midland Valley", slug: "seaton-cliffs-arbroath",
    note: "Old Red Sandstone sea cliffs sculpted into arches, stacks and caves." },
  { name: "Balmaha, Loch Lomond", lat: 56.08, lon: -4.57, region: "Midland Valley", slug: "balmaha-loch-lomond",
    note: "The Highland Boundary Fault crosses the loch — Highlands and Lowlands side by side." },
  { name: "Flanders Moss", lat: 56.15, lon: -4.20, region: "Midland Valley", slug: "flanders-moss",
    note: "One of Britain's largest intact raised peat bogs — a post-glacial archive." },
  { name: "Callander (Keltie Water)", lat: 56.24, lon: -4.21, region: "Midland Valley", slug: "callander-keltie-water",
    note: "A river section across the Highland Boundary Fault." },
  { name: "East Neuk of Fife", lat: 56.22, lon: -2.70, region: "Midland Valley", slug: "east-neuk-of-fife",
    note: "Carboniferous volcanic necks and fossil-rich sediments along the coast." },
  { name: "Isle of Arran", lat: 55.58, lon: -5.22, region: "Midland Valley", slug: "isle-of-arran",
    note: "'Scotland in miniature' — Hutton's unconformity, granite, and a Palaeogene volcano." },
  { name: "Fossil Grove, Glasgow", lat: 55.87, lon: -4.34, region: "Midland Valley", slug: "fossil-grove-glasgow",
    note: "Fossilised stumps of 325-million-year-old Carboniferous clubmoss trees, in situ." },
  { name: "Falls of Clyde & Carstairs Kames", lat: 55.66, lon: -3.78, region: "Midland Valley", slug: "falls-of-clyde-and-carstairs-kames",
    note: "Waterfalls in a gorge, plus a nationally important set of glacial meltwater ridges." },
  { name: "Holyrood Park, Edinburgh", lat: 55.94, lon: -3.16, region: "Midland Valley", slug: "holyrood-park-edinburgh",
    note: "Arthur's Seat (a Carboniferous volcano) and Salisbury Crags, where Hutton read the rocks." },
  { name: "Dunbar & Barns Ness, East Lothian", lat: 56.00, lon: -2.46, region: "Midland Valley", slug: "barns-ness-dunbar-east-lothian",
    note: "Carboniferous limestones, coals and fossils along an accessible shore." },
  { name: "Siccar Point", lat: 55.9319, lon: -2.3019, region: "Midland Valley", slug: "siccar-point",
    note: "Hutton's Unconformity — the most famous outcrop in geology, where deep time was proven." },

  { name: "Ballantrae", lat: 55.11, lon: -5.01, region: "Southern Uplands", slug: "ballantrae-bay-carrick",
    note: "An ophiolite — a slice of ancient ocean floor and mantle, complete with pillow lavas." },
  { name: "Loch Skeen & Grey Mare's Tail", lat: 55.41, lon: -3.31, region: "Southern Uplands", slug: "loch-skeen-and-the-grey-mares-tail",
    note: "A hanging valley and waterfall left by glacial over-deepening." },
  { name: "Eildon Hills, Melrose", lat: 55.58, lon: -2.71, region: "Southern Uplands", slug: "eildon-hills-melrose",
    note: "Three hills of intruded Devonian igneous rock standing above the Tweed valley." },
  { name: "Back Bay, Monreith", lat: 54.70, lon: -4.36, region: "Southern Uplands", slug: "back-bay-monreith",
    note: "Folded Silurian greywackes — sediment scraped off the floor of the Iapetus Ocean." },
  { name: "Southerness", lat: 54.86, lon: -3.60, region: "Southern Uplands", slug: "southerness",
    note: "Carboniferous limestones and sandstones on the Solway coast." },
];

function sgtUrl(site) { return SGT_BASE + site.slug + "/"; }

window.REFERENCE_SITES = REFERENCE_SITES;
window.sgtUrl = sgtUrl;
