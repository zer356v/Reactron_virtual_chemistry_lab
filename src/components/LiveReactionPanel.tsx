import React, { useEffect, useRef, useState } from "react";
import { Flame, Droplets, Thermometer, Beaker } from "lucide-react";

export default function LiveReactionPanel({ reactions, placedEquipment }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [reactions, placedEquipment]);

  const lastReaction = reactions && reactions.length > 0 ? reactions.at(-1) : null;

  return (
    <div
      className={`
        h-full flex flex-col bg-white border-r border-slate-300 shadow-xl
        transition-all duration-300 relative
        ${collapsed ? "w-[32px]" : "w-full"}
      `}
    >
     

      {!collapsed && (
        <>
          {/* HEADER - Reduced padding */}
          <div className="px-3 py-2.5 border-b bg-gradient-to-r from-slate-50 to-slate-100">
            <h2 className="text-xs font-bold text-slate-900">Live Reaction Monitor</h2>
            <p className="text-[10px] text-slate-500">Real-time tracking</p>
          </div>

          {/* SCROLL AREA - Reduced padding */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
            
            {/* EQUIPMENT CONTENTS */}
            <section>
              <h3 className="text-[10px] px-2 font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Equipment Contents
              </h3>

              {placedEquipment.length === 0 ? (
                <div className="text-center py-6 text-[10px] text-slate-400">
                  No equipment placed
                </div>
              ) : (
                <div className="space-y-2">
                  {placedEquipment.map((eq) => {
                    // 🔥 CHEMICAL BOTTLE - Compact Design
                    if (eq.type === "chemical-bottle" && eq.chemical) {
                      const volume = eq.volumeRemaining || 0;
                      const maxVol = eq.maxVolume || 500;
                      const percentage = (volume / maxVol) * 100;
                      
                      return (
                        <div
                          key={eq.id}
                          className="
                            px-2.5 py-2 rounded-lg
                            bg-gradient-to-br from-blue-50 to-blue-100/50
                            border border-blue-200
                            shadow-sm
                          "
                        >
                          {/* Bottle Header - Compact */}
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <Droplets 
                                className="w-3.5 h-3.5 flex-shrink-0" 
                                style={{ color: eq.chemical.color }}
                              />
                              <div className="min-w-0">
                                <div className="text-[11px] font-bold text-slate-800 truncate">
                                  {eq.chemical.name}
                                </div>
                                <div className="text-[9px] text-slate-600">
                                  {eq.chemical.formula} • {eq.chemical.concentration}M
                                </div>
                              </div>
                            </div>
                            
                            <span className="text-[9px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                              BOTTLE
                            </span>
                          </div>

                          {/* Volume Display - Compact */}
                          <div className="space-y-1">
                            {/* Volume Text */}
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-600 font-medium">Volume:</span>
                              <span className="text-base font-bold text-blue-700">
                                {volume.toFixed(0)} mL
                              </span>
                            </div>

                            {/* Progress Bar - Thinner */}
                            <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full transition-all duration-500 ease-out"
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: eq.chemical.color,
                                }}
                              />
                            </div>

                            {/* Status - Smaller text */}
                            <div className="text-center text-[9px] font-semibold">
                              {volume === 0 ? (
                                <span className="text-red-600">
                                  🔄 Empty - Refilling...
                                </span>
                              ) : volume < 100 ? (
                                <span className="text-orange-600">
                                  ⚠️ Low ({percentage.toFixed(0)}%)
                                </span>
                              ) : (
                                <span className="text-green-600">
                                  ✓ {percentage.toFixed(0)}% Full
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // 🔥 REGULAR EQUIPMENT - Compact Design
                    return (
                      <div
                        key={eq.id}
                        className="
                          px-2.5 py-2 rounded-lg
                          bg-white border border-slate-200 
                          shadow-sm
                        "
                      >
                        {/* Equipment Header - Compact */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Beaker className="w-3 h-3 text-slate-600 flex-shrink-0" />
                            <span className="text-[11px] font-semibold text-slate-800 capitalize truncate">
                              {eq.type.replace("-", " ")}
                            </span>
                          </div>

                          <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                            {Number(eq.totalVolume || 0).toFixed(0)} mL
                          </span>
                        </div>

                        {/* CHEMICAL LIST - Compact */}
                        <div className="space-y-1">
                          {eq.chemicalObjects && eq.chemicalObjects.length > 0 ? (
                            eq.chemicalObjects.map((chem, i) => (
                              <div
                                key={i}
                                className="
                                  flex items-center justify-between
                                  bg-slate-50 px-2 py-1 rounded
                                  text-[10px]
                                "
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className="w-2 h-2 rounded-full border flex-shrink-0"
                                    style={{ background: chem.color }}
                                  />
                                  <span className="font-medium truncate">{chem.name}</span>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-slate-700 font-semibold">
                                    {Number(chem.volume).toFixed(1)} mL
                                  </span>
                                  <span className="text-slate-500 text-[9px]">
                                    {22 + i * 2}°C
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-slate-400 italic text-center py-1">
                              No chemicals added
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* FINAL RESULT - Compact */}
            {lastReaction && (
              <section
                className="
                  px-2.5 py-2 
                  bg-green-50 border border-green-300 
                  rounded-lg shadow-sm
                "
              >
                <h3 className="text-[10px] font-bold text-green-700 uppercase tracking-wide mb-1">
                  ⚗️ Final Result
                </h3>

                <div className="space-y-0.5 text-[10px]">
                  {/* Reaction Name */}
                  <p>
                    <strong>Reaction:</strong>{" "}
                    {lastReaction.reactionName || "No reaction"}
                  </p>

                  {/* Output Chemical */}
                  {lastReaction.outputChemical && (
                    <p>
                      <strong>Product:</strong> {lastReaction.outputChemical}
                    </p>
                  )}

                  {/* Volume */}
                  {lastReaction.outputVolume !== undefined && (
                    <p>
                      <strong>Volume:</strong> {lastReaction.outputVolume} mL
                    </p>
                  )}

                  {/* Color */}
                  {lastReaction.finalColor && (
                    <div className="flex items-center gap-1">
                      <strong>Color:</strong>
                      <span
                        className="w-2 h-2 rounded-full border"
                        style={{ backgroundColor: lastReaction.finalColor }}
                      />
                      <span>{lastReaction.finalColor}</span>
                    </div>
                  )}

                  {/* Gas */}
                  {lastReaction.gas && (
                    <p className="flex items-center gap-1">
                      <Flame size={10} className="text-orange-600" />
                      <strong>Gas:</strong> {lastReaction.gas}
                    </p>
                  )}

                  {/* Precipitate */}
                  {lastReaction.precipitate && (
                    <p className="flex items-center gap-1">
                      <Droplets size={10} className="text-blue-600" />
                      <strong>Precipitate:</strong> {lastReaction.precipitate}
                    </p>
                  )}

                  {/* Temperature */}
                  <p className="flex items-center gap-1">
                    <Thermometer size={10} className="text-red-600" />
                    <strong>Temp:</strong>{" "}
                    {20 + Math.round((lastReaction.energy ?? 0) / 3)}°C
                  </p>
                </div>
              </section>
            )}

            <div ref={bottomRef} />
          </div>
        </>
      )}
    </div>
  );
}