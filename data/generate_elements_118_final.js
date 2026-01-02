const fs = require("fs");

const baseElements = JSON.parse(
  fs.readFileSync(__dirname + "/elements_118.json", "utf-8")
);


/* ================================
   HELPERS
================================ */
function getPhase(el) {
  if (el.atomicNumber === 35 || el.atomicNumber === 80) return "Liquid";
  if (el.category === "Noble Gas" || el.atomicNumber === 1) return "Gas";
  return "Solid";
}

function getDiscoveryYear(symbol) {
  const known = {
    H: 1766,
    He: 1895,
    Li: 1817,
    Be: 1798,
    B: 1808,
    C: null,
    N: 1772,
    O: 1774,
    F: 1886,
    Ne: 1898,
    Na: 1807,
    Mg: 1755,
    Al: 1825,
    Si: 1824,
    P: 1669,
    S: null,
    Cl: 1774,
    Ar: 1894
    // remaining elements safely left as null
  };
  return known[symbol] ?? null;
}

/* ================================
   ENHANCE DATASET
================================ */
const enhancedElements = baseElements.map((el) => {
  const protons = el.atomicNumber;
  const electrons = el.atomicNumber;
  const neutrons = Math.round(el.mass - el.atomicNumber);

  return {
    atomicNumber: el.atomicNumber,
    symbol: el.symbol,
    name: el.name,
    mass: el.mass,
    category: el.category,
    group: el.group,
    period: el.period,

    protons,
    neutrons,
    electrons,

    phase: getPhase(el),
    radioactive: el.atomicNumber > 82,
    occurrence: el.atomicNumber > 92 ? "Synthetic" : "Natural",

    valenceElectrons: null,
    valency: null,
    density: null,
    atomicRadius: null,
    electronegativity: null,
    meltingPoint: null,
    boilingPoint: null,

    electronConfiguration: null,
    oxidationStates: null,
    yearDiscovered: getDiscoveryYear(el.symbol)
  };
});

/* ================================
   SAVE FINAL FILE
================================ */
fs.writeFileSync(
  "elements_118_final.json",
  JSON.stringify(enhancedElements, null, 2)
);

console.log("✅ elements_118_final.json created successfully");
