import React, { useMemo, useState } from "react";
import elements from "../../data/elements_118_final.json";
import { useNavigate } from "react-router-dom";


/* =====================================================
   COLORS
===================================================== */
const categoryColors: Record<string, string> = {
  "alkali metal": "#fde68a",
  "alkaline earth metal": "#bbf7d0",
  "transition metal": "#bfdbfe",
  "post-transition metal": "#e9d5ff",
  metalloid: "#fecaca",
  nonmetal: "#ddd6fe",
  halogen: "#fbcfe8",
  "noble gas": "#bae6fd",
  lanthanide: "#fed7aa",
  actinide: "#fca5a5",
};

const families = [
  "Alkali Metals",
  "Alkaline Earth Metals",
  "Transition Metals",
  "Post-Transition Metals",
  "Metalloids",
  "Nonmetals",
  "Halogens",
  "Noble Gases",
  "Lanthanides",
  "Actinides",
];

const categoryToFamily: Record<string, string> = {
  "alkali metal": "Alkali Metals",
  "alkaline earth metal": "Alkaline Earth Metals",
  "transition metal": "Transition Metals",
  "post-transition metal": "Post-Transition Metals",
  metalloid: "Metalloids",
  nonmetal: "Nonmetals",
  halogen: "Halogens",
  "noble gas": "Noble Gases",
  lanthanide: "Lanthanides",
  actinide: "Actinides",
};

function getBlock(el: any) {
  if (el.category === "lanthanide" || el.category === "actinide")
    return "f-block";
  if (el.group <= 2) return "s-block";
  if (el.group >= 13) return "p-block";
  return "d-block";
}

/* =====================================================
   UI NORMALIZER (NO NULLS)
===================================================== */
function normalize(el: any) {
  return {
    ...el,
    valenceElectrons:
      el.valenceElectrons ??
      (el.group <= 2 ? el.group : el.group >= 13 ? el.group - 10 : "—"),
    valency:
      el.valency ??
      (el.group <= 2 ? el.group : el.group >= 13 ? el.group - 10 : "—"),
    density: el.density ?? "—",
    atomicRadius: el.atomicRadius ?? "—",
    electronegativity: el.electronegativity ?? "—",
    meltingPoint: el.meltingPoint ?? "—",
    boilingPoint: el.boilingPoint ?? "—",
    electronConfiguration: el.electronConfiguration ?? `[${el.symbol}]`,
    oxidationStates: el.oxidationStates ?? "—",
    yearDiscovered: el.yearDiscovered ?? "—",
  };
}

/* =====================================================
   COMPONENT
===================================================== */
export default function PeriodicTableWhite() {
  const navigate = useNavigate() 
  const periodicElements = useMemo(() => {
    return elements.map((el: any) =>
      normalize({
        ...el,
        color: categoryColors[el.category.toLowerCase()] || "#e5e7eb",
      })
    );
  }, []);

  const [selected, setSelected] = useState(periodicElements[0]);
  const [query, setQuery] = useState("");

  /* ================= SEARCH HANDLER ================= */
  const handleSearch = (value: string) => {
    setQuery(value);

    const q = value.trim().toLowerCase();
    if (!q) return;

    const found = periodicElements.find(
      (el) =>
        el.symbol.toLowerCase() === q ||
        el.name.toLowerCase().includes(q) ||
        String(el.atomicNumber) === q
    );

    if (found) setSelected(found);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#fafafa] text-gray-900 grid grid-rows-[36px_auto_1fr]">

      {/* ================= TOP TITLE ================= */}
      <div className="relative flex items-center justify-center text-[11px] tracking-widest font-semibold">

        {/* TITLE */}
        <span>THE PERIODIC TABLE OF ELEMENTS</span>

        {/* RETURN TO LAB BUTTON */}
        <button
          onClick={() => navigate("/lab")}
          className="absolute right-4 top-1/2 -translate-y-1/2
                    px-3 py-1 text-[10px] font-semibold
                    border border-gray-400 rounded
                    bg-white hover:bg-blue-500 hover:text-white
                    transition"
        >
          ⬅ Return to Lab
        </button>
      </div>


      {/* ================= MAIN AREA ================= */}
      <div className="grid grid-cols-[1fr_340px] mt-12 gap-3 px-4">

        {/* ===== PERIODIC TABLE ===== */}
        <div className="flex justify-center">
          <div
            className="grid grid-cols-18 grid-rows-7 gap-[3px]"
            style={{ height: "360px", maxWidth: "1000px", width: "100%" }}
          >
            {periodicElements.map((el) => (
              <div
                key={el.atomicNumber}
                onClick={() => setSelected(el)}
                style={{
                  gridColumn: el.group,
                  gridRow: el.period,
                  backgroundColor: el.color,
                }}
                className={`rounded border text-center cursor-pointer
                  text-[9px] leading-[1.05] hover:scale-[1.05] transition
                  ${
                    selected.atomicNumber === el.atomicNumber
                      ? "ring-2 ring-blue-500"
                      : "border-gray-300"
                  }`}
              >
                <div className="opacity-70">{el.atomicNumber}</div>
                <div className="font-bold text-[12px]">{el.symbol}</div>
                <div className="opacity-70 truncate">{el.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== RIGHT INFO PANEL ===== */}
        <div className="border rounded-md bg-white shadow-sm p-2 text-[10px] font-mono">
          <div className="text-center font-semibold text-sm mb-1">
            {selected.name}
          </div>

          <Info label="Atomic Number" value={selected.atomicNumber} />
          <Info label="Symbol" value={selected.symbol} />
          <Info label="State" value={selected.phase} />
          <Info label="Atomic Mass" value={`${selected.mass} u`} />
          <Info label="Protons" value={selected.protons} />
          <Info label="Neutrons" value={selected.neutrons} />
          <Info label="Electrons" value={selected.electrons} />
          <Info label="Valence Electrons" value={selected.valenceElectrons} />
          <Info label="Valency" value={selected.valency} />
          <Info label="Atomic Radius" value={selected.atomicRadius} />
          <Info label="Density" value={selected.density} />
          <Info label="Electronegativity" value={selected.electronegativity} />
          <Info label="Melting Point" value={selected.meltingPoint} />
          <Info label="Boiling Point" value={selected.boilingPoint} />
          <Info label="Radioactive" value={selected.radioactive ? "Yes" : "No"} />
          <Info label="Occurrence" value={selected.occurrence} />
          <Info label="Year" value={selected.yearDiscovered} />
          <Info label="Electron Config" value={selected.electronConfiguration} />
          <Info label="Oxidation States" value={selected.oxidationStates} />
        </div>
      </div>

      {/* ================= BOTTOM AREA ================= */}
      <div className="grid grid-cols-2 gap-6 px-6 text-[10px]">

        {/* ===== ELEMENT FAMILIES ===== */}
        <div>
          <div className="font-semibold mb-1 tracking-wider">
            ELEMENT FAMILIES
          </div>
          <div className="grid grid-cols-5 border">
            {families.map((family) => (
              <div
                key={family}
                className={`px-2 py-1 text-center border
                  ${
                    categoryToFamily[selected.category] === family
                      ? "bg-blue-500 text-white font-semibold"
                      : "bg-white text-gray-700"
                  }`}
              >
                {family}
              </div>
            ))}
          </div>
        </div>

        {/* ===== SEARCH + BLOCKS ===== */}
        <div className="space-y-2">
          <div>
            <div className="font-semibold mb-1 tracking-wider">
              SEARCH ELEMENT
            </div>
            <input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Name / Symbol / Atomic Number"
              className="w-full border px-2 py-1 text-[11px] outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="font-semibold mb-1 tracking-wider">
              ELECTRON CONFIGURATIONS
            </div>
            <div className="grid grid-cols-4 border">
              {["s-block", "p-block", "d-block", "f-block"].map((block) => (
                <div
                  key={block}
                  className={`px-2 py-1 text-center border
                    ${
                      getBlock(selected) === block
                        ? "bg-blue-500 text-white font-semibold"
                        : "bg-white text-gray-700"
                    }`}
                >
                  {block}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   INFO ROW
===================================================== */
function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between border-b py-[2px]">
      <span className="opacity-70">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
