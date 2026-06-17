// Reference geological sites — a curated layer of classic, well-documented
// localities, shown as distinct pins you can toggle on/off. Tapping one
// pre-fills the "Log a site" form so you can adopt it as your own entry
// (which then fetches its BGS geology like any other site).
//
// These are famous, long-established localities; coordinates are approximate
// centroids of the feature, fine for a 1:625k geology lookup. Sources:
// Edinburgh Geological Society / Lothian & Borders GeoConservation excursion
// guides, the Geological Society's "100 Great Geosites", and BGS locality
// descriptions. Notes are brief, in our own words.

const REFERENCE_SITES = [
  {
    name: "Siccar Point",
    lat: 55.9319, lon: -2.3019,
    note: "Hutton's Unconformity — Devonian Old Red Sandstone resting on near-vertical Silurian greywackes. The locality that established deep time. (Berwickshire)",
  },
  {
    name: "Arthur's Seat & Salisbury Crags",
    lat: 55.9442, lon: -3.1618,
    note: "Carboniferous volcano remnant in central Edinburgh; the Salisbury Crags dolerite sill helped Hutton argue igneous rock was once molten.",
  },
  {
    name: "Knockan Crag",
    lat: 58.0356, lon: -5.0808,
    note: "The Moine Thrust exposed — older Moine schists pushed over younger rocks, the discovery that defined thrust tectonics. (Assynt, NW Highlands)",
  },
  {
    name: "Glencoe",
    lat: 56.6700, lon: -5.0000,
    note: "A Devonian cauldron-subsidence caldera — one of the first recognised anywhere. Andesites and ignimbrites ringed by fault. (Lochaber)",
  },
  {
    name: "Fingal's Cave, Staffa",
    lat: 56.4314, lon: -6.3414,
    note: "Columnar-jointed Palaeocene basalt of the British Tertiary Volcanic Province — the same lava province as the Giant's Causeway.",
  },
  {
    name: "Hutton's Section, Holyrood Park",
    lat: 55.9410, lon: -3.1540,
    note: "Where Hutton showed dolerite veins cutting and baking the sedimentary country rock — field evidence for intrusion. (Edinburgh)",
  },
  {
    name: "Rubha Hunish / Trotternish",
    lat: 57.6900, lon: -6.3600,
    note: "Jurassic sediments capped by Tertiary basalt lavas; the landslipped Trotternish ridge (the Quiraing, the Storr). (Skye)",
  },
  {
    name: "Loch Assynt / Ardvreck",
    lat: 58.1670, lon: -4.9930,
    note: "Cambrian quartzite and Durness limestone over Lewisian gneiss — the foreland of the Moine Thrust belt. (Sutherland)",
  },
  {
    name: "St Abb's Head",
    lat: 55.9050, lon: -2.1340,
    note: "Silurian–Devonian andesitic lavas forming sea cliffs; volcanic rocks of the Southern Uplands margin. (Berwickshire)",
  },
  {
    name: "Ben Nevis",
    lat: 56.7969, lon: -5.0036,
    note: "A Devonian granitic complex with a down-faulted slab of its own volcanic roof preserved in the summit — like Glencoe's. (Lochaber)",
  },
];

// Expose to the module-scoped app.js (a bare top-level const wouldn't be visible).
window.REFERENCE_SITES = REFERENCE_SITES;
