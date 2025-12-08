import React, { useEffect, useRef, useState } from "react";
import { Flame, Droplets, Thermometer } from "lucide-react";

export default function LiveReactionPanel({ reactions, placedEquipment }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [reactions, placedEquipment]);

  // ⭐ SAFE LAST REACTION
  const lastReaction = reactions && reactions.length > 0 ? reactions.at(-1) : null;

  return (
    <div
      className={`
        h-full flex flex-col bg-white border-r border-slate-300 shadow-xl
        transition-all duration-300 relative
        ${collapsed ? "w-[32px]" : "w-[300px]"}
      `}
    >
      {/* COLLAPSE BUTTON */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute top-1/2 -right-3 transform -translate-y-1/2 
          w-7 h-7 rounded-full bg-white border shadow-md 
          flex items-center justify-center text-xs font-bold
          hover:bg-slate-100 transition-all z-50
        "
      >
        {collapsed ? ">" : "<"}
      </button>

      {!collapsed && (
        <>
          {/* HEADER */}
          <div className="px-8 py-4 border-b bg-[#fafafa] shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Live Reaction Monitor</h2>
            <p className="text-[11px] text-slate-500">Real-time experiment tracking</p>
          </div>

          {/* SCROLL AREA */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-10">
            
            {/* EQUIPMENT CONTENTS */}
            <section>
              <h3 className="text-[11px] px-4 font-semibold text-slate-500 tracking-wide mb-2">
                EQUIPMENT CONTENTS
              </h3>

              {placedEquipment.map((eq) => (
                <div
                  key={eq.id}
                  className="
                    p-4 rounded-xl bg-white border border-slate-200 
                    shadow-sm hover:shadow-md transition
                  "
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">{eq.type}</span>

                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-[2px] rounded-full">
                      {Number(eq.totalVolume).toFixed(0)}ml
                    </span>
                  </div>

                  {/* CHEMICAL LIST */}
                  <div className="mt-3 space-y-2">
                    {eq.chemicalObjects.map((chem, i) => (
                      <div
                        key={i}
                        className="
                          flex items-center justify-between
                          bg-slate-50 px-3 py-2 rounded-lg border
                          text-[12px]
                        "
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full border"
                            style={{ background: chem.color }}
                          />
                          <span className="font-medium">{chem.name}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-700 min-w-[55px] text-right">
                            {Number(chem.volume).toFixed(2)} ml
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            {22 + i * 2}°C
                          </span>
                        </div>
                      </div>
                    ))}

                    {eq.chemicalObjects.length === 0 && (
                      <p className="text-[12px] text-slate-400 italic">No chemicals added</p>
                    )}
                  </div>
                </div>
              ))}
            </section>

            {/* ⭐ FINAL RESULT (SAFE, CLEAN) */}
            {lastReaction && (
              <section
                className="
                  p-4 bg-green-50 border border-green-300 
                  rounded-xl shadow-sm
                "
              >
                <h3 className="text-[11px] font-bold text-green-700">FINAL RESULT</h3>

                {/* Reaction Name */}
                <p className="text-[12px] mt-1">
                  <strong>Reaction:</strong>{" "}
                  {lastReaction.reactionName || "No reaction detected"}
                </p>

                {/* Output Chemical */}
                {lastReaction.outputChemical && (
                  <p className="text-[12px] mt-1">
                    <strong>Product Formed:</strong> {lastReaction.outputChemical}
                  </p>
                )}

                {/* Volume */}
                {lastReaction.outputVolume !== undefined && lastReaction.outputVolume !== null && (
                  <p className="text-[12px] mt-1">
                    <strong>Final Volume:</strong> {lastReaction.outputVolume} ml
                  </p>
                )}

                {/* Color */}
                {lastReaction.finalColor && (
                  <p className="text-[12px] mt-1">
                    <strong>Final Color:</strong> {lastReaction.finalColor}
                  </p>
                )}

                {/* Gas */}
                {lastReaction.gas && (
                  <p className="text-[12px] mt-1 flex items-center gap-1">
                    <Flame size={12} className="text-orange-600" />
                    <strong>Gas Released:</strong> {lastReaction.gas}
                  </p>
                )}

                {/* Precipitate */}
                {lastReaction.precipitate && (
                  <p className="text-[12px] mt-1 flex items-center gap-1">
                    <Droplets size={12} className="text-blue-600" />
                    <strong>Precipitate:</strong> {lastReaction.precipitate}
                  </p>
                )}

                {/* Temperature */}
                <p className="text-[12px] mt-2 flex items-center gap-1">
                  <Thermometer size={12} className="text-red-600" />
                  <strong>Temp:</strong>{" "}
                  {20 + Math.round((lastReaction.energy ?? 0) / 3)}°C
                </p>
              </section>
            )}

            <div ref={bottomRef} />
          </div>
        </>
      )}
    </div>
  );
}
