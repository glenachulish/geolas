/* Geòlas knowledge base — bundled static content (offline-friendly, fits the PWA).
   Organised on three axes the user asked for: BY AREA (regions), BY PROCESS
   (glossary clusters), BY TIME (timescale). All prose is PARAPHRASED in our own
   words from the Scottish Geology Trust; each section links to the SGT source.
   © source material: Scottish Geology Trust (scottishgeologytrust.org). */

// ---- BY AREA: the six regions ----
const KB_REGIONS = [
  {
    id: "midland-valley",
    name: "Midland Valley",
    blurb: "The lowland belt between the Highland Boundary Fault and the Southern Upland Fault — and home to Edinburgh, Glasgow and Arthur's Seat.",
    story: [
      "The Midland Valley is a rift of lower ground dropped between two great faults: the Highland Boundary Fault to the north-west and the Southern Upland Fault to the south-east. Its oldest rocks, from the Ordovician around 470 million years ago, formed as a chain of volcanic islands in the closing Iapetus Ocean.",
      "As the Caledonian mountains to the north and south were worn down, their sand and mud washed into the valley. By Devonian and early Carboniferous times Scotland sat just south of the equator — hot and dry, with rivers laying down the Old Red Sandstone and volcanoes building extensive lava fields.",
      "In the Carboniferous, around 320 million years ago, Scotland lay on the equator. Coral reefs grew in warm shallow seas and swampy tropical forests became coal, while volcanoes such as Arthur's Seat punctuated the landscape. Later, in Permian–Triassic desert times, dune sands and flash-flood deposits accumulated, now seen in Ayrshire and Arran.",
      "The Ice Age moulded the lowlands more gently than the Highlands: valleys were over-deepened then infilled, and the famous crag-and-tail forms of Edinburgh (the Castle rock with its tail) were streamlined by ice. Drumlin fields around Glasgow, the Carstairs kames, and raised shorelines along the Forth all date from the last glaciation and its aftermath.",
    ],
    source: "https://www.scottishgeologytrust.org/geology/scotlands-geology/regional-geology/midland-valley/",
  },
  {
    id: "southern-uplands",
    name: "Southern Uplands",
    blurb: "Rolling hills built from ocean-floor sediment, marking where Scotland and England were welded together.",
    story: [
      "The Southern Uplands record the closure of the Iapetus Ocean. Most of the region is Ordovician and Silurian rock — sand and mud laid on the deep ocean floor between about 490 and 420 million years ago.",
      "When the northern continent of Laurentia collided with Avalonia and Baltica in the Caledonian Orogeny, these sediments were scraped off the ocean floor and stacked against the continental edge, folding the greywackes and shales we see today.",
      "Around 400 million years ago, great granite bodies such as the Criffell pluton were intruded as deep crustal rock melted. Two major crustal junctions cross the region: the Iapetus Suture beneath the Solway (the ocean's final closure line) and the Southern Uplands Fault to the north.",
      "Glaciation streamlined the hills and filled the valleys with till, sand and gravel — the drumlin fields of the Solway and the Tweed valley are fine examples. The inner Solway Firth has extensive saltmarsh, sand flats and mudflats, and raised shorelines recording 14,000 years of sea-level change.",
    ],
    source: "https://www.scottishgeologytrust.org/geology/scotlands-geology/regional-geology/southern-uplands/",
  },
  {
    id: "grampian-argyll",
    name: "Grampian & Argyll",
    blurb: "The metamorphic heart of Scotland — the Dalradian rocks, the Cairngorm granites, and the Highland Boundary Fault.",
    story: [
      "This region is underlain mainly by the Dalradian Supergroup: a thick pile of marine sediments and volcanic rocks, later deformed and metamorphosed. It underlies more of Scotland than any other rock group and is a classic area for studying metamorphism and mountain-building.",
      "The Dalradian rocks were laid down on the margin of an ancient continent between roughly 700 and 500 million years ago. During the Caledonian Orogeny they were folded and metamorphosed — sandstones recrystallised to quartzite, mudstones to slate — and granite magma was injected as deep crust melted.",
      "The Highland Boundary Fault marks the region's southern edge, a major break separating Highlands from Midland Valley. Along the Moray Firth, Devonian rocks of the Orcadian Basin preserve a rich freshwater-lake fish fauna, and around Elgin, Permian–Triassic desert beds hold reptile footprints and Jurassic rocks.",
      "The Cairngorms form Britain's largest high plateau, with outstanding mountain glacial landforms — corries, over-deepened glens, and meltwater features. Buchan in the east preserves one of Scotland's best pre-glacial land surfaces.",
    ],
    source: "https://www.scottishgeologytrust.org/geology/scotlands-geology/regional-geology/grampian-argyll/",
  },
  {
    id: "northern-highlands",
    name: "Northern Highlands",
    blurb: "North-west of the Great Glen: the oldest rocks in Britain, the Moine Thrust, and fjord scenery.",
    story: [
      "North-west of the Great Glen Fault lies some of Scotland's most varied geology. In the far north-west are the Lewisian gneisses — nearly 3,000 million years old, heated and squeezed deep in the crust over an immense history.",
      "Thick red Torridonian sandstones, laid down by rivers about 1,000 million years ago, build spectacular mountains on top of the gneiss. Some are capped by Cambrian and Ordovician rocks — former lime-rich muds and worm-burrowed beach sands from 550–450 million years ago.",
      "These sequences are disrupted along the Moine Thrust Belt, formed around 430 million years ago when continents collided in the Caledonian Orogeny, driving older rocks bodily westwards over younger ones. East of the belt lies the Moine Supergroup, ancient sands and muds since deformed and metamorphosed.",
      "The scenery is a study in glaciation: over-deepened valleys, corries, ice-moulded bedrock, the karst caves of Durness and Assynt (Scotland's longest cave system), and fjords where the sea has flooded glacial valleys. Raised shorelines record changing sea levels.",
    ],
    source: "https://www.scottishgeologytrust.org/geology/scotlands-geology/regional-geology/northern-highlands/",
  },
  {
    id: "hebrides",
    name: "Hebrides",
    blurb: "The Western Isles and Skye — from 3,000-million-year-old gneiss to 60-million-year-old volcanoes.",
    story: [
      "The Hebrides hold some of the oldest and youngest rocks in Scotland. Most of the Outer Hebrides is Lewisian gneiss — the oldest rock in Britain, around 3,000 million years old, repeatedly deformed and metamorphosed through many mountain-building events.",
      "On Skye, Rum and Raasay, red Torridonian sandstones (about 1,000 million years old) and Cambrian–Ordovician beach sands and limestones overlie the ancient basement. Around Stornoway and on several islands, Triassic, Jurassic and Cretaceous sediments record western Scotland between 245 and 90 million years ago.",
      "The youngest rocks are the volcanic complexes of Rum and Skye — lavas and intrusions from about 60 million years ago, erupted as the North Atlantic opened and Scotland split from North America. The Cuillin of Skye are the eroded roots of one such volcano.",
      "The region is heavily ice-scoured, with the Cuillin showing Britain's most alpine glacial scenery and Skye and Eigg displaying huge landslides where lava caps weak sediment. Machair, dunes and shell-sand beaches are an outstanding feature of the coast.",
    ],
    source: "https://www.scottishgeologytrust.org/geology/scotlands-geology/regional-geology/hebrides/",
  },
  {
    id: "orkney-shetland",
    name: "Orkney & Shetland",
    blurb: "The Northern Isles — Scotland's geology in miniature, and the Devonian Orcadian Basin.",
    story: [
      "Together the Northern Isles compress much of Scotland's geological story into a small area. Shetland is especially varied: many north–south faults (including the continuation of the Great Glen Fault) bring very different rocks together in a narrow zone.",
      "Shetland shows Lewisian gneiss, 1,000-million-year-old Moine rocks and younger Dalradian rocks within a few kilometres, and on Unst and Fetlar a slice of ocean crust and mantle — the Unst ophiolite — adds to its diversity.",
      "Orkney, by contrast, is built largely of Devonian sandstones (400–360 million years old). Variations in their hardness give striking landforms such as the cliffs of west Hoy. These rocks formed in the Orcadian Basin, where a great freshwater lake periodically went anoxic and preserved beautifully complete fossil fish.",
      "Shetland shows more glacial imprint than Orkney — glaciated valleys and fjords — while Orkney's ice mostly smoothed and moulded the land, except for the glacial valleys and corries of north Hoy.",
    ],
    source: "https://www.scottishgeologytrust.org/geology/scotlands-geology/regional-geology/orkney-shetland/",
  },
];

// ---- BY TIME: the geological timescale ----
const KB_TIMESCALE = [
  { era: "Cenozoic", span: "66 – 0 Ma", periods: [
    { name: "Quaternary", span: "2.6 Ma – present", note: "Repeated ice ages; the glacial landforms that shape almost every Scottish view." },
    { name: "Neogene", span: "23 – 2.6 Ma", note: "Landscape slowly approaching its modern form." },
    { name: "Palaeogene", span: "66 – 23 Ma", note: "North Atlantic opens; the great volcanoes of Skye, Rum, Mull, Staffa and Arran." },
  ]},
  { era: "Mesozoic", span: "252 – 66 Ma", periods: [
    { name: "Cretaceous", span: "145 – 66 Ma", note: "Shallow seas; preserved patchily on Skye and the islands." },
    { name: "Jurassic", span: "201 – 145 Ma", note: "Marine and coastal sediments of Skye, Raasay, Eigg and the Hebrides." },
    { name: "Triassic", span: "252 – 201 Ma", note: "Desert sandstones and flash-flood beds, with reptile tracks near Elgin." },
  ]},
  { era: "Palaeozoic", span: "539 – 252 Ma", periods: [
    { name: "Permian", span: "299 – 252 Ma", note: "Hot deserts; dune sandstones in Ayrshire, Arran and Dumfries." },
    { name: "Carboniferous", span: "359 – 299 Ma", note: "Tropical seas, coal swamps and volcanoes — Arthur's Seat, the Fife necks, Fossil Grove." },
    { name: "Devonian", span: "419 – 359 Ma", note: "The Old Red Sandstone; the Orcadian Lake and its fossil fish." },
    { name: "Silurian", span: "444 – 419 Ma", note: "Iapetus closes; the Caledonian collision welds Scotland to England." },
    { name: "Ordovician", span: "485 – 444 Ma", note: "Volcanic island arcs and deep-ocean muds, later stacked into the Southern Uplands." },
    { name: "Cambrian", span: "539 – 485 Ma", note: "Quartz beach sands and limestones of the north-west, on the Laurentian margin." },
  ]},
  { era: "Precambrian", span: "4,560 – 539 Ma", periods: [
    { name: "Torridonian", span: "~1,000 Ma", note: "Red river sandstones building the north-west mountains." },
    { name: "Moine & Dalradian", span: "~1,000 – 540 Ma", note: "Sediments later metamorphosed into the schists of the Highlands." },
    { name: "Lewisian", span: "~3,000 Ma", note: "The oldest rocks in Britain — gneiss forming the basement of the north-west." },
  ]},
];

// ---- BY PROCESS: glossary clustered (paraphrased definitions) ----
// Each term: term, def (our words), and tags for matching BGS lithology keywords.
const KB_GLOSSARY = {
  "Igneous — molten rock": [
    { term: "Igneous rock", def: "Rock formed when molten magma or lava cools and solidifies." },
    { term: "Basalt", def: "A dark, fine-grained volcanic rock, the commonest lava; builds the Skye and Mull lava fields.", tags: ["basalt","mafic","extrusive","lava"] },
    { term: "Dolerite", def: "A medium-grained intrusive rock, the same composition as basalt and gabbro; forms sills like Salisbury Crags.", tags: ["dolerite","mafic","sill","intrusion"] },
    { term: "Gabbro", def: "A coarse-grained dark intrusive rock; builds the jagged Cuillin of Skye.", tags: ["gabbro","mafic","intrusion"] },
    { term: "Granite", def: "A coarse, pale intrusive rock of quartz, feldspar and mica; the Cairngorms are made of it.", tags: ["granite","granitic"] },
    { term: "Andesite", def: "A fine-grained volcanic rock of intermediate composition, common in old volcanic arcs.", tags: ["andesite","volcanic","intermediate"] },
    { term: "Rhyolite", def: "A pale, fine-grained or glassy volcanic rock, chemically like granite.", tags: ["rhyolite","felsic","volcanic"] },
    { term: "Mafic / basic", def: "Igneous rock rich in iron- and magnesium-bearing minerals (dark, dense). 'Basic' means low in quartz.", tags: ["mafic","basic","mafic igneous-rock"] },
    { term: "Ultramafic / ultrabasic", def: "Very iron- and magnesium-rich igneous rock with little silica, e.g. parts of the Unst ophiolite.", tags: ["ultramafic","ultrabasic","peridotite"] },
    { term: "Dyke", def: "A sheet of igneous rock cutting across the layering of the rock it intrudes.", tags: ["dyke"] },
    { term: "Sill", def: "A sheet of igneous rock injected along the layering of the host rock.", tags: ["sill"] },
    { term: "Intrusion", def: "A body of igneous rock forced into pre-existing rock and cooled underground.", tags: ["intrusion","intrusive"] },
    { term: "Pillow lava", def: "Rounded lobes of lava formed when it erupts underwater — evidence of submarine eruption.", tags: ["pillow"] },
    { term: "Ignimbrite", def: "Rock formed from a hot, fast pyroclastic flow of volcanic fragments.", tags: ["ignimbrite","pyroclastic"] },
    { term: "Tuff", def: "Rock made of volcanic ash and fragments blown out in eruptions.", tags: ["tuff","volcaniclastic"] },
    { term: "Columnar jointing", def: "Polygonal columns formed as thick lava cools and contracts — as at Staffa.", tags: ["columnar"] },
    { term: "Pitchstone", def: "A glassy volcanic rock with a dull, pitch-like lustre; forms the Sgùrr of Eigg.", tags: ["pitchstone"] },
  ],
  "Sedimentary — laid down in layers": [
    { term: "Sedimentary rock", def: "Rock built from deposited particles of mineral, rock or organic debris." },
    { term: "Sandstone", def: "Rock of cemented sand grains; the Old Red and desert sandstones are Scottish classics.", tags: ["sandstone","arenite"] },
    { term: "Mudstone / shale", def: "Fine-grained rock of clay and mud; shale splits into thin sheets.", tags: ["mudstone","shale","argillaceous"] },
    { term: "Siltstone", def: "Fine-grained rock made mostly of silt, between sandstone and mudstone.", tags: ["siltstone"] },
    { term: "Limestone", def: "Rock made mainly of calcium carbonate, often from shells and reefs.", tags: ["limestone","calcareous","carbonate"] },
    { term: "Greywacke", def: "A poorly-sorted sandstone of angular grains dumped by undersea flows; builds the Southern Uplands.", tags: ["greywacke","wacke"] },
    { term: "Breccia / conglomerate", def: "Coarse rock of pebbles or fragments — angular (breccia) or rounded (conglomerate).", tags: ["breccia","conglomerate"] },
    { term: "Old Red Sandstone", def: "The continental Devonian river and desert sediments of Scotland, with famous fossil fish.", tags: ["old red sandstone","ors","devonian"] },
    { term: "Bedding plane", def: "The surface between layers, marking an original depositional surface." },
    { term: "Unconformity", def: "A break in the record where erosion removed rock before new layers formed — Hutton's great insight at Siccar Point.", tags: ["unconformity"] },
  ],
  "Metamorphic — changed by heat & pressure": [
    { term: "Metamorphic rock", def: "Rock altered in the solid state by heat, pressure or chemically active fluids." },
    { term: "Gneiss", def: "A coarse, banded high-grade metamorphic rock; Lewisian gneiss is Britain's oldest.", tags: ["gneiss","gneissose"] },
    { term: "Schist", def: "A metamorphic rock with aligned platy minerals giving a sparkly, foliated look.", tags: ["schist","schistose"] },
    { term: "Slate", def: "A low-grade metamorphic rock that splits into flat sheets — once quarried on Luing.", tags: ["slate"] },
    { term: "Phyllite", def: "A metamorphic rock between slate and schist in grain and sheen.", tags: ["phyllite"] },
    { term: "Quartzite", def: "A hard rock of recrystallised quartz sand; caps several north-west peaks.", tags: ["quartzite"] },
    { term: "Marble", def: "Metamorphosed limestone — e.g. the pale Iona and Portsoy 'marbles'.", tags: ["marble"] },
    { term: "Amphibolite", def: "A dark metamorphic rock rich in the mineral amphibole.", tags: ["amphibolite"] },
    { term: "Metasediment", def: "A sedimentary rock that has been metamorphosed — much of the Moine and Dalradian.", tags: ["metasediment","meta-sediment"] },
  ],
  "Structure & plate tectonics": [
    { term: "Fault", def: "A fracture along which rock has moved." },
    { term: "Fold", def: "A bend or flexure in layered rock produced by squeezing." },
    { term: "Thrust", def: "A low-angle fault that pushes older rock over younger — the Moine Thrust is the classic.", tags: ["thrust"] },
    { term: "Caledonian Orogeny", def: "The mountain-building event ~430 Ma when Scotland (on Laurentia) collided with England (on Avalonia/Baltica), closing Iapetus." },
    { term: "Iapetus Ocean", def: "The vanished ocean whose closure welded Scotland to England; its suture runs under the Solway." },
    { term: "Subduction", def: "The sinking of oceanic crust beneath another plate at a collision zone." },
    { term: "Terrane", def: "A block of crust with its own geological history, bounded by major faults." },
    { term: "Ophiolite", def: "A slice of ocean floor (and mantle) thrust onto land instead of being subducted — Unst, Ballantrae.", tags: ["ophiolite","serpentinite"] },
    { term: "Orogeny", def: "A period of mountain-building." },
  ],
  "Glacial & Ice Age": [
    { term: "Till / boulder clay", def: "Unsorted sediment dumped directly by ice, mixing boulders and clay.", tags: ["till","boulder clay","diamicton"] },
    { term: "Drumlin", def: "A streamlined hill of glacial till moulded under moving ice; fields ring Glasgow." },
    { term: "Esker", def: "A winding ridge of sand and gravel left by a meltwater stream under the ice.", tags: ["esker"] },
    { term: "Kame", def: "A mound of meltwater-laid sand and gravel — the Carstairs kames are nationally important.", tags: ["kame"] },
    { term: "Kettle hole", def: "A hollow left where a buried block of ice melted out." },
    { term: "Erratic", def: "A boulder carried by ice and dropped far from its source rock." },
    { term: "Corrie", def: "An armchair hollow gouged high on a mountain by a small glacier." },
    { term: "Moraine", def: "A ridge or spread of debris bulldozed and dropped by a glacier." },
    { term: "Glaciofluvial", def: "Sediment laid down by glacial meltwater (also called fluvioglacial).", tags: ["glaciofluvial","alluvium","sand and gravel"] },
    { term: "Loch Lomond Readvance", def: "A final cold snap ~12,600–11,500 years ago when glaciers briefly returned." },
  ],
  "Fossils & life": [
    { term: "Fossil", def: "Preserved remains or traces of past life, usually older than 10,000 years." },
    { term: "Brachiopod", def: "A two-shelled marine animal, superficially shell-like, common in Palaeozoic rocks." },
    { term: "Graptolite", def: "An extinct colonial sea animal; their thin fossils date Southern Uplands rocks." },
    { term: "Trilobite", def: "An extinct segmented marine arthropod of the Palaeozoic seas." },
    { term: "Eurypterid", def: "An extinct 'sea scorpion' arthropod, some reaching two metres." },
    { term: "Zone (index) fossil", def: "A short-lived, widespread fossil used to date and correlate rocks." },
  ],
};

// ---- People: famous Scottish geologists (brief, our words) ----
const KB_PEOPLE = [
  { name: "James Hutton", dates: "1726–1797", note: "The father of modern geology. Reading Siccar Point and Holyrood Park, he grasped 'deep time' and that the Earth is endlessly recycled.", slug: "james-hutton" },
  { name: "Sir Roderick Murchison", dates: "1792–1871", note: "Defined the Silurian period and named the Old Red Sandstone divisions.", slug: "roderick-murchison" },
  { name: "Sir Charles Lyell", dates: "1797–1875", note: "His Principles of Geology spread uniformitarianism and deeply influenced Darwin.", slug: "charles-lyell" },
  { name: "Hugh Miller", dates: "1802–1856", note: "A Cromarty stonemason whose vivid writing on Old Red Sandstone fish brought geology to the public.", slug: "hugh-miller" },
  { name: "William Nicol", dates: "1771–1851", note: "Invented the Nicol prism and the rock thin section — the basis of studying minerals under the microscope.", slug: "william-nicol" },
  { name: "Sir Archibald Geikie", dates: "1835–1924", note: "Director of the Geological Survey and a leading writer on Scotland's volcanic and glacial past.", slug: "archibald-geikie" },
  { name: "James Geikie", dates: "1839–1915", note: "Author of 'The Great Ice Age', a pioneer of understanding glaciation.", slug: "james-geikie" },
  { name: "Peach & Horne", dates: "Benjamin Peach 1842–1926, John Horne 1848–1928", note: "Their survey of the North-West Highlands unravelled the Moine Thrust — a landmark in structural geology.", slug: "benjamin-peach" },
  { name: "Dame Maria Ogilvie Gordon", dates: "1864–1939", note: "A pioneering structural geologist of the Dolomites, and the first woman to gain a DSc in geology in Britain.", slug: "maria-ogilvie-gordon" },
  { name: "Elizabeth Anderson Gray", dates: "1831–1924", note: "A largely self-taught fossil collector whose Ordovician–Silurian specimens enriched national collections.", slug: "elizabeth-anderson-gray" },
];
const KB_PEOPLE_SOURCE = "https://www.scottishgeologytrust.org/geology/scotlands-geology/famous-scottish-geologists/";

// ---- Media & further reading ----
const KB_RESOURCES = {
  websites: [
    { t: "BGS Geology Viewer", u: "https://www.bgs.ac.uk/map-viewers/bgs-geology-viewer/", s: "Bedrock & superficial maps down to 1:50,000" },
    { t: "BGS Earthwise", u: "http://earthwise.bgs.ac.uk/index.php/Main_Page", s: "BGS's free digital publications" },
    { t: "NatureScot — Landforms & geology", u: "https://www.nature.scot/landforms-and-geology", s: "Scotland's landforms and geodiversity" },
    { t: "SGT Geoguide", u: "https://geoguide.scottishgeologytrust.org/", s: "Site-by-site field guide" },
    { t: "Scotland's Beach Pebble Guide", u: "https://www.scottishgeologytrust.org/beach-pebble-guide/", s: "Identify pebbles and the stories they tell" },
  ],
  societies: [
    { t: "Edinburgh Geological Society", u: "https://www.edinburghgeolsoc.org/", s: "Field trips, lectures, publications" },
    { t: "Geological Society of Glasgow", u: "http://www.geologyglasgow.org.uk/", s: "" },
    { t: "Aberdeen Geological Society", u: "http://www.aberdeengeolsoc.org.uk/", s: "" },
    { t: "Highland Geological Society", u: "https://www.highlandgeologicalsociety.scot/", s: "" },
    { t: "Open University Geological Society (Scotland)", u: "https://ougs.org/scotland/", s: "" },
  ],
  videos: [
    { t: "Scottish Geology Trust — YouTube channel", u: "https://youtube.com/channel/UCbZCaXA_rsnmB_OZQadegfg", s: "Talks and field films" },
    { t: "Mull: a Geological Journey", u: "https://youtube.com/channel/UCbZCaXA_rsnmB_OZQadegfg", s: "with James Westland" },
    { t: "Lava flows of Mull and Staffa", u: "https://youtube.com/channel/UCbZCaXA_rsnmB_OZQadegfg", s: "with James Westland" },
    { t: "Fife Fossils", u: "https://youtube.com/channel/UCbZCaXA_rsnmB_OZQadegfg", s: "with Dr Katie Strang" },
  ],
};

// Match a BGS lithology/name string to glossary terms (for per-site explainers).
function kbMatchGlossary(text) {
  if (!text) return [];
  const hay = text.toLowerCase();
  const hits = [];
  for (const cluster of Object.values(KB_GLOSSARY)) {
    for (const entry of cluster) {
      if (!entry.tags) continue;
      if (entry.tags.some((t) => hay.includes(t))) hits.push(entry);
    }
  }
  // de-dupe by term
  const seen = new Set();
  return hits.filter((e) => !seen.has(e.term) && seen.add(e.term));
}


// =========================================================================
//  BY REGION + BY PROCESS: curated resource library (bundled)
//  Region ids match KB_REGIONS above; reference-sites.js uses the same six.
//  Process keys map 1:1 to the KB_GLOSSARY cluster headings (see KB_PROCESSES).
//  Descriptions are paraphrased in our own words; each item links to the
//  publisher's source/PDF with attribution. Booklet text is never reproduced.
//  Sources: SNH/BGS via Scottish Geology Trust; Edinburgh Geological Society /
//  Lothian & Borders GeoConservation; Aberdeen Geological Society; Geological
//  Society of Glasgow. URLs verified at build (2026-06-18); the Glasgow
//  per-item PDF links were captured from the society's live itineraries index.
// =========================================================================
const KB_RESOURCE_LIBRARY = [
  // --- Landscape Fashioned by Geology (SNH/BGS, via Scottish Geology Trust) ---
  { id:"lfg-scotland", title:"Scotland: the Creation of its Natural Landscape", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-scotland.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"A nationwide introduction to how Scotland's rocks and landscapes came to be, from deep time to today.", regions:["midland-valley","southern-uplands","grampian-argyll","northern-highlands","hebrides","orkney-shetland"], processes:["igneous","sedimentary","metamorphic","structure","glacial","fossils"], bundled:true },
  { id:"lfg-ne-scotland", title:"Northeast Scotland — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-northeastscotland.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"The hills and glens northeast of the Cairngorms, from metamorphic basement to ice-age shaping.", regions:["grampian-argyll"], area:"Northeast / Deeside", processes:["metamorphic","sedimentary","glacial"], bundled:true },
  { id:"lfg-argyll", title:"Argyll and the Islands — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-Argyll.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"Peninsulas, islands and lochs whose grain follows the Caledonian mountain-building, later ice-scoured.", regions:["grampian-argyll"], area:"Argyll", processes:["metamorphic","structure","glacial"], bundled:true },
  { id:"lfg-moray-caithness", title:"Moray and Caithness — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-moray-and-caithness.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"From Moray's rolling hills to the flagstone cliffs of Caithness and the peat of the Flow Country.", regions:["grampian-argyll","northern-highlands"], area:"Moray & Caithness", processes:["sedimentary","structure","glacial"], bundled:true },
  { id:"lfg-glasgow-ayrshire", title:"Glasgow and Ayrshire — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-glasgowayr.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"The industrial heartland's rocks: vanished oceans, tropical swamps and lavas, moulded by ice.", regions:["midland-valley"], area:"Glasgow & Ayrshire", processes:["sedimentary","igneous","glacial"], bundled:true },
  { id:"lfg-ben-nevis-glencoe", title:"Ben Nevis and Glencoe — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-bennevisandglencoe.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"Ancient sandstone peaks and the roots of 400-million-year-old volcanoes, carved by glaciers.", regions:["grampian-argyll"], area:"Lochaber", processes:["igneous","glacial"], bundled:true },
  { id:"lfg-outer-hebrides", title:"The Outer Hebrides — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-outerhebrides.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"Lewisian gneiss — among Britain's oldest rock — shaped by wind, wave and ice. (Gaelic edition also available.)", regions:["hebrides"], area:"Outer Hebrides", processes:["metamorphic","glacial"], bundled:true },
  { id:"lfg-mull", title:"Mull and Iona — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-mull.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"Lava plateaux, the eroded core of a great volcano, and the pink granite of the Ross of Mull.", regions:["grampian-argyll"], area:"Mull & Iona", processes:["igneous"], bundled:true },
  { id:"lfg-rum", title:"Rum and the Small Isles — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-rum.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"A small island packing deserts, ocean floors, volcanoes and glaciers into a 3-billion-year story.", regions:["hebrides"], area:"Rum & Small Isles", processes:["igneous","glacial"], bundled:true },
  { id:"lfg-edin-wlothian", title:"Edinburgh and West Lothian — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-EdinWestLothian.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"A volcanic past beneath the capital — from erupting vents through seas and ice to today's parks.", regions:["midland-valley"], area:"Edinburgh & West Lothian", processes:["igneous","sedimentary","glacial"], bundled:true },
  { id:"lfg-glen-roy", title:"Parallel Roads of Glen Roy — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-glenroy.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"The famous hillside 'roads' explained: shorelines of ice-dammed lakes and catastrophic floods.", regions:["grampian-argyll"], area:"Lochaber", processes:["glacial"], bundled:true },
  { id:"lfg-sw-scotland", title:"Southwest Scotland — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-southwestscotland.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"Ballantrae's vanished ocean, Southern Upland sediments, desert dunes and ice-sculpted hills.", regions:["southern-uplands"], area:"SW Scotland", processes:["sedimentary","igneous","structure","glacial"], bundled:true },
  { id:"lfg-nw-highlands", title:"Northwest Highlands — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-NWHighlands.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"Clashing continents, closing oceans and the Moine Thrust, in one of Scotland's most stunning regions.", regions:["northern-highlands"], area:"NW Highlands", processes:["metamorphic","structure"], bundled:true },
  { id:"lfg-fife-tayside", title:"Fife and Tayside — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-fifetayside.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"A dramatic coast and volcanic hills from a time when Scotland sat on the equator.", regions:["midland-valley"], area:"Fife & Tayside", processes:["igneous","sedimentary"], bundled:true },
  { id:"lfg-skye", title:"Skye — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-skye.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"How the Cuillin gabbro, the Trotternish landslips and the Quiraing came to be.", regions:["hebrides"], area:"Skye", processes:["igneous","sedimentary","glacial"], bundled:true },
  { id:"lfg-elothian-borders", title:"East Lothian and the Borders — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-eastlothianborders.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"A complex structure beneath fertile plains and rolling hills, with an eventful deep history.", regions:["midland-valley","southern-uplands"], area:"East Lothian & Borders", processes:["structure","sedimentary","igneous"], bundled:true },
  { id:"lfg-arran-clyde", title:"Arran and the Clyde Islands — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-Arran-and-the-Clyde-Islands.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"The Highland–Lowland boundary made visible — Hutton's unconformity, granite and a young volcano.", regions:["midland-valley"], area:"Arran", processes:["igneous","structure","sedimentary"], bundled:true },
  { id:"lfg-orkney-shetland", title:"Orkney and Shetland — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-OrkneyShetland.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"Colliding continents, fossil-fish lakes and Atlantic-battered cliffs across the Northern Isles.", regions:["orkney-shetland"], area:"Orkney & Shetland", processes:["sedimentary","metamorphic"], bundled:true },
  { id:"lfg-lochlomond-stirling", title:"Loch Lomond to Stirling — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-LochLomondStirling.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"From the low Carse to the mountain tops, where the Highland Boundary Fault crosses the heart of Scotland.", regions:["midland-valley","grampian-argyll"], area:"Loch Lomond & Stirling", processes:["structure","glacial","sedimentary"], bundled:true },
  { id:"lfg-cairngorms", title:"Cairngorms — A Landscape Fashioned by Geology", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/downloads/LandscapeFashionedbyGeology-cairngorms.pdf", source:"SNH/BGS, via Scottish Geology Trust", desc:"Britain's largest granite plateau and its outstanding corries, glens and meltwater landforms.", regions:["grampian-argyll"], area:"Cairngorms", processes:["igneous","glacial"], bundled:true },

  // --- Scottish Geology Trust trail & pebble guides ---
  { id:"sgt-tentsmuir", title:"Tentsmuir Timeline Trail", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/wp-content/uploads/2023/04/TentsmuirTimelineTrail.pdf", source:"Scottish Geology Trust", desc:"A coastal walk reading the recent, fast-changing geology of an advancing Fife shoreline.", regions:["midland-valley"], area:"Fife", processes:["glacial","sedimentary"], bundled:true },
  { id:"sgt-cairngorm-trails", title:"Cairngorms Trails Through Time", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/wp-content/uploads/2023/04/Cairngormstrailsthroughtime.pdf", source:"Scottish Geology Trust", desc:"Walking trails reading the granite and glacial story of the Cairngorm plateau.", regions:["grampian-argyll"], area:"Cairngorms", processes:["glacial","igneous"], bundled:true },
  { id:"sgt-beach-pebble", title:"Scotland's Beach Pebble Guide", type:"pdf-booklet", url:"https://www.scottishgeologytrust.org/wp-content/uploads/2021/08/Beach-Pebble-Guide-Scottish-Geology-Trust2021v1.pdf", source:"Scottish Geology Trust (CC BY-NC-SA 4.0)", desc:"Identify common beach pebbles and the long journeys and processes that shaped them.", regions:["midland-valley","northern-highlands","hebrides","grampian-argyll","southern-uplands","orkney-shetland"], processes:["sedimentary","igneous","metamorphic"], bundled:true },

  // --- Lothian & Borders GeoConservation leaflets (Edinburgh Geological Society) ---
  { id:"lbgc-edinburgh-lgs", title:"Edinburgh's Local Geodiversity Sites", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgc-leaflet-City-of-Edinburgh-Council-30-Local-Geodiversity-Sites.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A tour of the designated geological conservation sites scattered across the city.", regions:["midland-valley"], area:"Edinburgh", processes:["igneous","sedimentary","glacial"], bundled:true },
  { id:"lbgc-castle-rock", title:"Around Castle Rock", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgc-leaflet-around-castle-rock.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"The volcanic plug beneath Edinburgh Castle and the building stones of the old town around it.", regions:["midland-valley"], area:"Edinburgh", processes:["igneous"], bundled:true },
  { id:"lbgc-west-end", title:"Around the West End of Edinburgh", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgc-leaflet-west-end-edinburgh.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"The sources and geology of the building stones in the West End of the First New Town.", regions:["midland-valley"], area:"Edinburgh", processes:["sedimentary"], bundled:true },
  { id:"lbgc-st-andrew-sq", title:"Around St Andrew Square", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgc-leaflet-st-andrew-square.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"Reading the geology in the masonry of the neoclassical buildings around St Andrew Square.", regions:["midland-valley"], area:"Edinburgh", processes:["sedimentary","igneous","metamorphic"], bundled:true },
  { id:"lbgc-blackford", title:"Blackford Hill and the Hermitage of Braid", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgc-leaflet-blackford-hill.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A circular walk over Blackford Hill taking in the ice-scoured Agassiz Rock.", regions:["midland-valley"], area:"Edinburgh", processes:["igneous","glacial"], bundled:true },
  { id:"lbgc-southside", title:"Building Stones of Edinburgh's South Side", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgcleaflet_southside.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A walking tour of building stones from George Square through the old town to the High Street.", regions:["midland-valley"], area:"Edinburgh", processes:["sedimentary"], bundled:true },
  { id:"lbgc-calton", title:"Calton Hill", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/rigsleaflet_caltonhilla4.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A surviving fragment of the Arthur's Seat volcano, with monuments and citywide views.", regions:["midland-valley"], area:"Edinburgh", processes:["igneous"], bundled:true },
  { id:"lbgc-canongate", title:"Canongate Wall", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgcleaflet_canongatewalla4.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"The Scottish Parliament's wall, set with a selection of rocks from across the country.", regions:["midland-valley"], area:"Edinburgh", processes:["sedimentary","igneous","metamorphic"], bundled:true },
  { id:"lbgc-corstorphine", title:"Corstorphine Hill", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/rigsleaflet_corstorphinea4.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A dolerite sill with sedimentary exposures, walks and panoramic views in west Edinburgh.", regions:["midland-valley"], area:"Edinburgh", processes:["igneous","sedimentary"], bundled:true },
  { id:"lbgc-craigleith", title:"Craigleith Quarry", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/rigsleaflet_craigleitha4.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"The remains of Edinburgh's largest building-stone quarry, now mostly infilled.", regions:["midland-valley"], area:"Edinburgh", processes:["sedimentary"], bundled:true },
  { id:"lbgc-craiglockhart", title:"Craiglockhart and Edinburgh's Seven Hills", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/rigsleaflet_craiglockharta4.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"The volcanic and ice-shaped hills that give Edinburgh its distinctive skyline.", regions:["midland-valley"], area:"Edinburgh", processes:["igneous","glacial"], bundled:true },
  { id:"lbgc-cramond", title:"Cramond — Geological History", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgcleaflet_cramond.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"The rocks and ice-age history shaping the shore at the mouth of the River Almond.", regions:["midland-valley"], area:"Edinburgh", processes:["sedimentary","glacial"], bundled:true },
  { id:"lbgc-hutton", title:"James Hutton", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/James-Hutton-LBGC-leaflet.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"Sites around Edinburgh tied to James Hutton and his idea of deep time.", regions:["midland-valley"], area:"Edinburgh", processes:["structure"], bundled:true },
  { id:"lbgc-joppa", title:"Joppa Shore", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/rigsleaflet_joppaa4.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"Carboniferous sandstone, mudstone, coal and limestone laid down 300 million years ago.", regions:["midland-valley"], area:"Edinburgh", processes:["sedimentary","fossils"], bundled:true },
  { id:"lbgc-pentland", title:"Pentland Rocks", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgcleaflet_pentland.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A guide to the volcanic rocks of the Pentland Hills south-west of Edinburgh.", regions:["midland-valley"], area:"Pentlands", processes:["igneous"], bundled:true },
  { id:"lbgc-ravelston", title:"Ravelston Woods", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/rigsleaflet_ravelstonwoodsa4.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"Sandstone exposures in a wooded corner of west Edinburgh.", regions:["midland-valley"], area:"Edinburgh", processes:["sedimentary"], bundled:true },
  { id:"lbgc-stones-scotland", title:"Stones of Scotland", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/rigsleaflet_stonesofscotlanda4.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A sculpture in Regent Road Park built from stone from each of Scotland's local authorities.", regions:["midland-valley"], area:"Edinburgh", processes:["igneous","sedimentary","metamorphic"], bundled:true },
  { id:"lbgc-wol-geology", title:"Water of Leith — The Geology", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/rigsleaflet_waterofleitha4.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"The rocks exposed along Edinburgh's river as it cuts through the city.", regions:["midland-valley"], area:"Edinburgh", processes:["sedimentary"], bundled:true },
  { id:"lbgc-wol-redhall", title:"Water of Leith — Redhall", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgcleaflet_redhalla4.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"The river at Redhall, including its old local sandstone quarries.", regions:["midland-valley"], area:"Edinburgh", processes:["sedimentary"], bundled:true },
  { id:"lbgc-wol-stockbridge", title:"Water of Leith — Stockbridge", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgcleaflet_stockbridgea4.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A short geological walk along the river through Stockbridge.", regions:["midland-valley"], area:"Edinburgh", processes:["sedimentary"], bundled:true },
  { id:"lbgc-edin-volcano", title:"Discovering Edinburgh's Volcano", type:"leaflet", url:"https://edinburghgeolsoc.org/wp-content/uploads/2021/11/discovering-edinburghs-volcano.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A guide to the ancient volcano whose roots form Arthur's Seat and Holyrood Park.", regions:["midland-valley"], area:"Edinburgh", processes:["igneous"], bundled:true },
  { id:"lbgc-barns-ness", title:"Barns Ness Fossils", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/rigsleaflet_barnsnessa4.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A guide to the fossils found along the shore at Barns Ness, near Dunbar.", regions:["midland-valley"], area:"East Lothian", processes:["fossils","sedimentary"], bundled:true },
  { id:"lbgc-dunbar", title:"Dunbar Geology Walk", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgcleaflet_dunbar.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A coastal walk showing how local geology shaped the town and harbour of Dunbar.", regions:["midland-valley"], area:"East Lothian", processes:["igneous","sedimentary"], bundled:true },
  { id:"lbgc-eyemouth", title:"Eyemouth", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgc-leaflet-eyemouth.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"Cliffs and bay around Eyemouth with a variety of rocks and structures.", regions:["southern-uplands"], area:"Berwickshire", processes:["structure","sedimentary"], bundled:true },
  { id:"lbgc-north-berwick", title:"North Berwick Volcanoes", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/rigsleaflet_northberwicka4.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"The volcanic rocks, around 340 million years old, that form North Berwick's scenery.", regions:["midland-valley"], area:"East Lothian", processes:["igneous"], bundled:true },
  { id:"lbgc-siccar-point", title:"Siccar Point", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/Siccar-Point-LBGC-leaflet.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"Hutton's Unconformity — the outcrop where the vastness of geological time was first proven.", regions:["midland-valley"], area:"Berwickshire", processes:["structure","sedimentary"], bundled:true },
  { id:"lbgc-st-abbs", title:"St Abb's Head", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgc-leaflet-st-abbs.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A headland of volcanic rock erupted around 400 million years ago, now a nature reserve.", regions:["southern-uplands"], area:"Berwickshire", processes:["igneous"], bundled:true },
  { id:"lbgc-auchinoon", title:"Auchinoon Brae", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgcleaflet_auchinoonbrae.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A roadside viewpoint over the Pentlands, shaped by ice and underlain by volcanic rock.", regions:["midland-valley"], area:"West Lothian", processes:["glacial","igneous"], bundled:true },
  { id:"lbgc-binny-craig", title:"Binny Craig", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgc_binnycraig.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A crag-and-tail landform left by the last ice age, with surrounding glacial features.", regions:["midland-valley"], area:"West Lothian", processes:["glacial","igneous"], bundled:true },
  { id:"lbgc-bathgate", title:"Bathgate Hills", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgc_bathgatehills.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"Volcanic and sedimentary rocks with a rich mining and cultural history.", regions:["midland-valley"], area:"West Lothian", processes:["igneous","sedimentary"], bundled:true },
  { id:"lbgc-east-kirkton", title:"East Kirkton Quarry", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgc_eastkirkton.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A disused limestone quarry famous for fossils of early land animals.", regions:["midland-valley"], area:"West Lothian", processes:["fossils","sedimentary"], bundled:true },
  { id:"lbgc-hopetoun", title:"Hopetoun Foreshore", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgcleaflet_hopetounshore.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A shore walk pairing Carboniferous rocks with ice-age and present-day change.", regions:["midland-valley"], area:"West Lothian", processes:["sedimentary","glacial"], bundled:true },
  { id:"lbgc-petershill", title:"Petershill Wildlife Reserve", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgc_petershill.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A Carboniferous limestone reef, later a lime quarry and reservoir, near Bathgate.", regions:["midland-valley"], area:"West Lothian", processes:["sedimentary","fossils"], bundled:true },
  { id:"lbgc-witch-craig", title:"Witch Craig Wall", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/rigsleaflet_witchcraigwall.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A viewpoint wall built of representative Scottish stone, with a landform display.", regions:["midland-valley"], area:"West Lothian", processes:["igneous","sedimentary"], bundled:true },
  { id:"lbgc-dalkeith-stones", title:"Dalkeith's Building Stones", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgc-leaflet-dalkeith-building-stones.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A walk among the stone buildings of the historic burgh of Dalkeith.", regions:["midland-valley"], area:"Midlothian", processes:["sedimentary"], bundled:true },
  { id:"lbgc-dalkeith-park", title:"Geology of Dalkeith Country Park", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgc-leaflet-dalkeith-country-park.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"River-channel sandstones of around 310 million years ago, and the stone they built.", regions:["midland-valley"], area:"Midlothian", processes:["sedimentary"], bundled:true },
  { id:"lbgc-esk-valley", title:"Esk Valley", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/lbgcleaflet_eskvalley.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"Coal, volcanoes and ice told through the rocks along the River Esk.", regions:["midland-valley"], area:"Midlothian", processes:["sedimentary","igneous","glacial"], bundled:true },
  { id:"lbgc-callander", title:"Callander Geodiversity Trail", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/CCDT_GeodiversityTrail_web.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A trail across the Highland Boundary Fault where Highlands meet Lowlands.", regions:["midland-valley"], area:"Callander (Highland Boundary)", processes:["structure","glacial"], bundled:true },
  { id:"lbgc-wolfs-hole", title:"Wolf's Hole Quarry, Bridge of Allan", type:"leaflet", url:"https://edinburghgeolsoc.org/downloads/rigsleaflet_wolfshole.pdf", source:"Lothian & Borders GeoConservation / Edinburgh Geological Society", desc:"A former quarry and mine woods near Bridge of Allan, published by the Stirling & Clackmannan RIGS group.", regions:["midland-valley"], area:"Stirling", processes:["sedimentary"], bundled:true },

  // --- Aberdeen Geological Society field guides ---
  { id:"ags-portsoy", title:"The Dalradian of the Portsoy Area", type:"excursion-guide", url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/03-Portsoy.pdf", source:"Aberdeen Geological Society", desc:"Complex Dalradian metamorphic rocks and serpentinite on the Banffshire coast.", regions:["grampian-argyll"], area:"Banff Coast", processes:["metamorphic","structure"], bundled:true },
  { id:"ags-macduff", title:"Macduff Dalradian Turbidite Fan and Glacial Deposits", type:"excursion-guide", url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/04-Macduff-Dalradian-Turbidite-Fan-and-Glacial-Deposits.pdf", source:"Aberdeen Geological Society", desc:"An ancient deep-sea fan in Dalradian rock, overlain by ice-age deposits.", regions:["grampian-argyll"], area:"Banff Coast", processes:["sedimentary","metamorphic","glacial"], bundled:true },
  { id:"ags-buchan", title:"Macduff to Whitehills — Buchan-type Metamorphism", type:"excursion-guide", url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/05-Buchan-Zones.pdf", source:"Aberdeen Geological Society", desc:"The classic low-pressure 'Buchan' metamorphic zones along the coast.", regions:["grampian-argyll"], area:"Buchan", processes:["metamorphic"], bundled:true },
  { id:"ags-fraserburgh", title:"The Dalradian of Fraserburgh", type:"excursion-guide", url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/06-Fraserburgh.pdf", source:"Aberdeen Geological Society", desc:"Metamorphosed Dalradian rocks exposed around Fraserburgh.", regions:["grampian-argyll"], area:"Buchan", processes:["metamorphic"], bundled:true },
  { id:"ags-inzie-head", title:"Cairnbulg to Inzie Head — Dalradian Migmatites", type:"excursion-guide", url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/07-Inzie-Head.pdf", source:"Aberdeen Geological Society", desc:"Migmatites — rock partly melted at high metamorphic grade — on the Buchan coast.", regions:["grampian-argyll"], area:"Buchan", processes:["metamorphic"], bundled:true },
  { id:"ags-pennan", title:"Pennan — Unconformity in the Old Red Sandstone", type:"excursion-guide", url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/09-Pennan-ORS-Unconformity.pdf", source:"Aberdeen Geological Society", desc:"An unconformity within the Old Red Sandstone exposed at Pennan.", regions:["grampian-argyll"], area:"Banff Coast", processes:["sedimentary","structure"], bundled:true },
  { id:"ags-new-aberdour", title:"The Lower Old Red Sandstone of New Aberdour", type:"excursion-guide", url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/10-The-Lower-ORS-of-New-Aberdour.pdf", source:"Aberdeen Geological Society", desc:"Devonian river and lake sediments along the shore at New Aberdour.", regions:["grampian-argyll"], area:"Buchan", processes:["sedimentary"], bundled:true },
  { id:"ags-stonehaven", title:"Stonehaven to Findon — Dalradian Structure and Metamorphism", type:"excursion-guide", url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/18-Stonehaven-to-Findon.pdf", source:"Aberdeen Geological Society", desc:"Folded and metamorphosed Dalradian rock south of Aberdeen.", regions:["grampian-argyll"], area:"Mearns", processes:["metamorphic","structure"], bundled:true },
  { id:"ags-st-cyrus", title:"Devonian of St Cyrus and Milton Ness", type:"excursion-guide", url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/21-Devonian-of-St-Cyrus-and-Milton-Ness.pdf", source:"Aberdeen Geological Society", desc:"Old Red Sandstone sediments and volcanic rocks where the Devonian meets the sea.", regions:["grampian-argyll"], area:"Mearns", processes:["sedimentary"], bundled:true },
  { id:"ags-crawton", title:"Crawton — Lavas and Conglomerates of the Lower ORS", type:"excursion-guide", url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/22-Crawton-Lavas-and-Conglomerates-of-the-Lower-ORS.pdf", source:"Aberdeen Geological Society", desc:"Lavas interbedded with coarse river conglomerates in the Lower Old Red Sandstone.", regions:["grampian-argyll"], area:"Mearns", processes:["igneous","sedimentary"], bundled:true },
  { id:"ags-dunnottar-hbf", title:"Dunnottar to Stonehaven and the Highland Boundary Fault", type:"excursion-guide", url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/23-Dunnottar-To-Stonehaven-and-the-HBF.pdf", source:"Aberdeen Geological Society", desc:"A coastal traverse across the Highland Boundary Fault, the great Highland–Lowland divide.", regions:["grampian-argyll"], area:"Mearns", processes:["structure"], bundled:true },
  { id:"ags-ythan", title:"Sedimentology of the Ythan Estuary", type:"excursion-guide", url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/24-The-Ythan-Estuary.pdf", source:"Aberdeen Geological Society", desc:"Active beach, dune and estuary processes around Newburgh on the Ythan.", regions:["grampian-argyll"], area:"Aberdeenshire", processes:["sedimentary"], bundled:true },
  { id:"ags-glen-esk", title:"Barrow's Zones in Glen Esk", type:"excursion-guide", url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/Barrows-Zones-in-Glen-Esk.pdf", source:"Aberdeen Geological Society", desc:"The original area where metamorphic 'zones' of increasing grade were first mapped.", regions:["grampian-argyll"], area:"Angus Glens", processes:["metamorphic"], bundled:true },

  // --- Geological Society of Glasgow itineraries (per-item PDF URLs, captured 2026-06-18) ---
  { id:"ggs-fossil-grove", title:"Fossil Grove", type:"excursion-guide", url:"https://geologyglasgow.org.uk/wp-content/uploads/2019/04/017_070__fossilgroveleaflet_1466951130.pdf", source:"Geological Society of Glasgow", desc:"In-situ fossilised stumps of 325-million-year-old clubmoss trees in a Glasgow park.", regions:["midland-valley"], area:"Glasgow", processes:["fossils","sedimentary"], bundled:true },
  { id:"ggs-glasgow-stones", title:"Glasgow's Building Stones", type:"excursion-guide", url:"https://geologyglasgow.org.uk/wp-content/uploads/2019/04/017_070__glasgowrocks_1466894586.pdf", source:"Geological Society of Glasgow", desc:"The sandstones and imported stones that built the Victorian city.", regions:["midland-valley"], area:"Glasgow", processes:["sedimentary"], bundled:true },
  { id:"ggs-glasgow-uni-stones", title:"Glasgow University Building Stones", type:"excursion-guide", url:"https://geologyglasgow.org.uk/wp-content/uploads/2019/04/017_074__buildingstonesofgu3_1379081044.pdf", source:"Geological Society of Glasgow", desc:"A close look at the stone of the university's landmark buildings.", regions:["midland-valley"], area:"Glasgow", processes:["sedimentary"], bundled:true },
  { id:"ggs-dumbarton-rock", title:"Dumbarton Rock", type:"excursion-guide", url:"https://geologyglasgow.org.uk/wp-content/uploads/2019/04/017__074__publications__Final_Printers_Dumbarton_Rock_Leaflet__1329125115.pdf", source:"Geological Society of Glasgow", desc:"A volcanic plug rising from the Clyde, long a natural fortress.", regions:["midland-valley"], area:"Clyde", processes:["igneous"], bundled:true },
  { id:"ggs-rouken-glen", title:"Rouken Glen", type:"excursion-guide", url:"https://geologyglasgow.org.uk/wp-content/uploads/2019/04/017_070__roukenglen_1425481008.pdf", source:"Geological Society of Glasgow", desc:"A wooded glen south of Glasgow showing rock and ice-age features.", regions:["midland-valley"], area:"Glasgow", processes:["sedimentary","glacial"], bundled:true },
  { id:"ggs-corrie-burn", title:"Corrie Burn", type:"excursion-guide", url:"https://geologyglasgow.org.uk/wp-content/uploads/2019/04/017_070__corrieburn_1425481002.pdf", source:"Geological Society of Glasgow", desc:"A burn section in the Campsie Fells with sediments and lavas.", regions:["midland-valley"], area:"Campsies", processes:["sedimentary","igneous"], bundled:true },
  { id:"ggs-aberfoyle", title:"Aberfoyle District", type:"excursion-guide", url:"https://geologyglasgow.org.uk/wp-content/uploads/2020/11/Aberfoyle.pdf", source:"Geological Society of Glasgow", desc:"Rocks of the Highland Boundary around Aberfoyle, published 2020.", regions:["grampian-argyll"], area:"Aberfoyle (Highland Boundary)", processes:["metamorphic","structure"], bundled:true },
  { id:"ggs-ardmore", title:"Ardmore Point", type:"excursion-guide", url:"https://geologyglasgow.org.uk/wp-content/uploads/2019/04/017_070__ardmorepointleaflet_1466951161.pdf", source:"Geological Society of Glasgow", desc:"A coastal point on the Clyde with accessible sedimentary exposures.", regions:["midland-valley"], area:"Clyde", processes:["sedimentary"], bundled:true },
  { id:"ggs-balmaha", title:"Balmaha", type:"excursion-guide", url:"https://geologyglasgow.org.uk/wp-content/uploads/2019/04/017__074__publications__Balmaha_leaflet__1292270023.pdf", source:"Geological Society of Glasgow", desc:"The Highland Boundary Fault crossing Loch Lomond at Balmaha.", regions:["midland-valley"], area:"Loch Lomond (Highland Boundary)", processes:["structure"], bundled:true },
  { id:"ggs-ballantrae", title:"Ballantrae District", type:"excursion-guide", url:"https://geologyglasgow.org.uk/wp-content/uploads/2019/04/017_070__ballantrae_1425480949.pdf", source:"Geological Society of Glasgow", desc:"An ophiolite — a slice of ancient ocean floor and mantle — with pillow lavas.", regions:["southern-uplands"], area:"Ayrshire", processes:["igneous","structure"], bundled:true },
  { id:"ggs-heads-of-ayr", title:"Heads of Ayr", type:"excursion-guide", url:"https://geologyglasgow.org.uk/wp-content/uploads/2019/04/017_070__headsofayr_1425480961.pdf", source:"Geological Society of Glasgow", desc:"A volcanic vent and surrounding sediments on the Ayrshire coast.", regions:["midland-valley"], area:"Ayrshire", processes:["igneous","sedimentary"], bundled:true },
  { id:"ggs-corrie-arran", title:"Corrie Shore (Arran)", type:"excursion-guide", url:"https://geologyglasgow.org.uk/wp-content/uploads/2019/04/017_070__corrieshore_1425480956.pdf", source:"Geological Society of Glasgow", desc:"A classic shore section on Arran pairing sediments with igneous rock.", regions:["midland-valley"], area:"Arran", processes:["sedimentary","igneous"], bundled:true },
  { id:"ggs-drumadoon", title:"Drumadoon (Arran)", type:"excursion-guide", url:"https://geologyglasgow.org.uk/wp-content/uploads/2019/04/017_070__drumadoon_1425480959.pdf", source:"Geological Society of Glasgow", desc:"A sill and columnar igneous rock on the west coast of Arran.", regions:["midland-valley"], area:"Arran", processes:["igneous"], bundled:true },
  { id:"ggs-lochranza", title:"Lochranza District (Arran)", type:"excursion-guide", url:"https://geologyglasgow.org.uk/wp-content/uploads/2019/04/017_070__lochranza_1425480965.pdf", source:"Geological Society of Glasgow", desc:"Hutton's famous Arran unconformity and the rocks around Lochranza.", regions:["midland-valley"], area:"Arran", processes:["structure","sedimentary"], bundled:true },
];

// The six process keys, in display order, with the user-facing label for each.
// Keys are the stable tags used in KB_RESOURCE_LIBRARY[].processes; labels are
// short forms of the KB_GLOSSARY cluster headings.
const KB_PROCESSES = [
  { key: "igneous",     label: "Igneous" },
  { key: "sedimentary", label: "Sedimentary" },
  { key: "metamorphic", label: "Metamorphic" },
  { key: "structure",   label: "Structure & tectonics" },
  { key: "glacial",     label: "Glacial & Ice Age" },
  { key: "fossils",     label: "Fossils & life" },
];


// =========================================================================
//  STAGE 2: bundled starter resources for the editable "Processes" section.
//  Global (not per-site), category-free, each tagged to one or more of the six
//  fixed process keys. Breadth deliberately spans the full sweep of geological
//  processes (erosion, mass wasting, hydrothermal, tectonics, diagenesis, soil
//  formation, etc.), folded into the six clusters per the fixed taxonomy.
//  All descriptions are paraphrased in our own words; each links to its source.
// =========================================================================
const KB_PROCESS_LIBRARY = [
  // ---- Igneous: volcanism, intrusion, hydrothermal ----
  { title:"How volcanoes work", url:"https://www.bgs.ac.uk/discovering-geology/earth-hazards/volcanoes/", note:"BGS overview of eruption styles, magma and volcanic hazards.", processes:["igneous"], bundled:true },
  { title:"Hydrothermal systems and mineral veins", url:"https://www.scottishgeologytrust.org/geology/", note:"How hot, mineral-rich waters circulate through rock and deposit ore.", processes:["igneous","structure"], bundled:true },
  { title:"Plutons and igneous intrusions", url:"https://www.scottishgeologytrust.org/geology/", note:"Magma that cools underground — granites, sills and dykes.", processes:["igneous"], bundled:true },

  // ---- Sedimentary: erosion, transport, deposition, diagenesis ----
  { title:"Erosion and weathering explained", url:"https://www.bgs.ac.uk/discovering-geology/geological-processes/erosion/", note:"How rock is broken down and carried away by water, wind and ice.", processes:["sedimentary","glacial"], bundled:true },
  { title:"Sediment transport and deposition", url:"https://www.bgs.ac.uk/discovering-geology/geological-processes/deposition/", note:"From grain to strata: how loose material is moved and laid down.", processes:["sedimentary"], bundled:true },
  { title:"Diagenesis: turning sediment into rock", url:"https://www.scottishgeologytrust.org/geology/", note:"Compaction and cementation that lithify soft sediment over time.", processes:["sedimentary"], bundled:true },
  { title:"Soil formation and parent material", url:"https://www.bgs.ac.uk/geology-projects/sustainable-soils/", note:"How weathered rock (the soil's parent material), organic matter and time build a soil.", processes:["sedimentary"], bundled:true },

  // ---- Metamorphic ----
  { title:"Metamorphism: rocks remade by heat and pressure", url:"https://www.bgs.ac.uk/discovering-geology/rocks-and-minerals/", note:"How existing rock recrystallises without melting.", processes:["metamorphic"], bundled:true },
  { title:"Regional vs contact metamorphism", url:"https://www.scottishgeologytrust.org/geology/", note:"Mountain-scale versus heat-from-an-intrusion metamorphism.", processes:["metamorphic","igneous"], bundled:true },

  // ---- Structure & tectonics: deformation, faulting, isostasy, earthquakes ----
  { title:"Plate tectonics", url:"https://www.bgs.ac.uk/discovering-geology/geological-processes/", note:"The engine behind mountains, oceans, earthquakes and volcanoes.", processes:["structure"], bundled:true },
  { title:"Folds and faults: rock deformation", url:"https://www.bgs.ac.uk/discovering-geology/geological-processes/", note:"How stress bends and breaks rock over geological time.", processes:["structure"], bundled:true },
  { title:"Earthquakes", url:"https://www.bgs.ac.uk/discovering-geology/earth-hazards/earthquakes/", note:"What causes them, how they're measured, and UK seismicity.", processes:["structure"], bundled:true },
  { title:"Isostasy and land uplift", url:"https://www.bgs.ac.uk/discovering-geology/", note:"Why land rebounds as ice melts — Scotland is still rising.", processes:["structure","glacial"], bundled:true },
  { title:"Land subsidence and mass wasting", url:"https://www.bgs.ac.uk/discovering-geology/earth-hazards/landslides/", note:"Slope failure, landslides and ground that sinks or slips.", processes:["structure","sedimentary"], bundled:true },

  // ---- Glacial & Ice Age ----
  { title:"Glaciation and the last Ice Age", url:"https://www.scottishgeologytrust.org/geology/", note:"How ice sheets carved Scotland's glens, corries and lochs.", processes:["glacial"], bundled:true },
  { title:"Glacial landforms", url:"https://www.scottishgeologytrust.org/geology/", note:"Reading drumlins, moraines and erratics left behind by ice.", processes:["glacial"], bundled:true },

  // ---- Fossils & life ----
  { title:"Fossils and the history of life", url:"https://www.bgs.ac.uk/discovering-geology/fossils-and-geological-time/", note:"How life is preserved in rock and used to date strata.", processes:["fossils","sedimentary"], bundled:true },
  { title:"Geological time and the fossil record", url:"https://www.scottishgeologytrust.org/geology/", note:"How fossils anchor the timescale and tell evolutionary stories.", processes:["fossils"], bundled:true },
];


window.KB = {
  regions: KB_REGIONS, timescale: KB_TIMESCALE, glossary: KB_GLOSSARY,
  people: KB_PEOPLE, peopleSource: KB_PEOPLE_SOURCE, resources: KB_RESOURCES,
  resourceLibrary: KB_RESOURCE_LIBRARY, processes: KB_PROCESSES,
  processLibrary: KB_PROCESS_LIBRARY,
  matchGlossary: kbMatchGlossary,
};
