import React, { useEffect, useRef, useState } from "react";
import { Flame, Droplets, Thermometer, Beaker, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LiveReactionPanelProps {
  reactions: any[];
  placedEquipment: any[];
  selectedEquipment?: string | null;
  onPourChemical?: (bottleId: string, targetId: string, amount: number) => void;
}

export default function LiveReactionPanel({ 
  reactions, 
  placedEquipment,
  selectedEquipment,
  onPourChemical
}: LiveReactionPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [pourAmount, setPourAmount] = useState(50);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [reactions, placedEquipment]);

  const lastReaction = reactions && reactions.length > 0 ? reactions.at(-1) : null;

  // 🔥 Get selected bottle
  const selectedBottle = placedEquipment.find(
    eq => eq.id === selectedEquipment && eq.type === "chemical-bottle"
  );

  // 🔥 Get available target equipment (not bottles)
  const availableTargets = placedEquipment.filter(
    eq => eq.type !== "chemical-bottle" && 
         (eq.type.includes("beaker") || 
          eq.type.includes("flask") || 
          eq.type.includes("test-tube"))
  );

  // 🔥 Handle pour button click
  const handlePour = (targetId: string) => {
    if (selectedBottle && onPourChemical && pourAmount > 0) {
      onPourChemical(selectedBottle.id, targetId, pourAmount);
    }
  };

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
          {/* HEADER */}
          <div className="px-3 py-2.5 border-b bg-gradient-to-r from-slate-50 to-slate-100">
            <h2 className="text-xs font-bold text-slate-900">Live Reaction Monitor</h2>
            <p className="text-[10px] text-slate-500">Real-time tracking</p>
          </div>

          {/* SCROLL AREA */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
            
            {/* 🔥 POUR CONTROLS - ONLY SHOW IF BOTTLE IS SELECTED */}
            {selectedBottle && (
              <section className="px-3 py-2.5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg shadow-md">
                <h3 className="text-[11px] font-bold text-blue-900 mb-2 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" />
                  Pour Controls
                </h3>

                {/* Selected Bottle Info */}
                <div className="mb-2 p-2 bg-white rounded border border-blue-200">
                  <div className="text-[10px] text-slate-600 mb-0.5">Selected Bottle:</div>
                  <div className="text-[11px] font-bold text-slate-900">
                    {selectedBottle.chemical.name}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    Available: {selectedBottle.volumeRemaining || 0} mL
                  </div>
                </div>

                {/* Pour Amount Input */}
                <div className="mb-2">
                  <label className="text-[10px] text-slate-700 font-medium block mb-1">
                    Pour Amount (mL):
                  </label>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2"
                      onClick={() => setPourAmount(Math.max(5, pourAmount - 5))}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>

                    <Input
                      type="number"
                      value={pourAmount}
                      onChange={(e) => setPourAmount(Math.max(5, Math.min(100, Number(e.target.value))))}
                      className="h-7 text-center text-sm font-bold"
                      min={5}
                      max={Math.min(100, selectedBottle.volumeRemaining || 0)}
                    />

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2"
                      onClick={() => setPourAmount(Math.min(100, (selectedBottle.volumeRemaining || 0), pourAmount + 5))}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Quick Amounts */}
                  <div className="flex gap-1 mt-1.5">
                    {[10, 25, 50, 100].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setPourAmount(Math.min(amount, selectedBottle.volumeRemaining || 0))}
                        className="flex-1 text-[9px] py-1 px-1 bg-white border border-blue-200 rounded hover:bg-blue-50 font-semibold"
                        disabled={amount > (selectedBottle.volumeRemaining || 0)}
                      >
                        {amount}ml
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Equipment List */}
                <div>
                  <div className="text-[10px] text-slate-700 font-medium mb-1">
                    Pour into:
                  </div>

                  {availableTargets.length === 0 ? (
                    <div className="text-[10px] text-slate-500 italic text-center py-2 bg-white rounded border border-dashed">
                      No equipment on table
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {availableTargets.map(target => (
                        <Button
                          key={target.id}
                          size="sm"
                          className="w-full h-8 text-[11px] justify-between bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          onClick={() => handlePour(target.id)}
                          disabled={pourAmount > (selectedBottle.volumeRemaining || 0) || pourAmount <= 0}
                        >
                          <span className="flex items-center gap-1">
                            <Beaker className="w-3 h-3" />
                            {target.type.replace("-", " ")}
                          </span>
                          <span className="text-[10px] opacity-90">
                            Pour {pourAmount}mL →
                          </span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Warning */}
                {pourAmount > (selectedBottle.volumeRemaining || 0) && (
                  <div className="mt-2 text-[9px] text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                    ⚠️ Not enough volume in bottle
                  </div>
                )}
              </section>
            )}

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
                    // 🔥 CHEMICAL BOTTLE
                    if (eq.type === "chemical-bottle" && eq.chemical) {
                      const volume = eq.volumeRemaining || 0;
                      const maxVol = eq.maxVolume || 500;
                      const percentage = (volume / maxVol) * 100;
                      const isSelected = eq.id === selectedEquipment;
                      
                      return (
                        <div
                          key={eq.id}
                          className={`
                            px-2.5 py-2 rounded-lg
                            transition-all duration-200
                            ${isSelected 
                              ? 'bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-400 shadow-md' 
                              : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 shadow-sm'
                            }
                          `}
                        >
                          {/* Bottle Header */}
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <Droplets 
                                className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'animate-pulse' : ''}`}
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
                            
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                              isSelected ? 'bg-blue-500 text-white' : 'bg-blue-200 text-blue-800'
                            }`}>
                              {isSelected ? 'SELECTED' : 'BOTTLE'}
                            </span>
                          </div>

                          {/* Volume Display */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-600 font-medium">Volume:</span>
                              <span className="text-base font-bold text-blue-700">
                                {volume.toFixed(0)} mL
                              </span>
                            </div>

                            <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full transition-all duration-500 ease-out"
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: eq.chemical.color,
                                }}
                              />
                            </div>

                            <div className="text-center text-[9px] font-semibold">
                              {volume === 0 ? (
                                <span className="text-red-600">🔄 Empty - Refilling...</span>
                              ) : volume < 100 ? (
                                <span className="text-orange-600">⚠️ Low ({percentage.toFixed(0)}%)</span>
                              ) : (
                                <span className="text-green-600">✓ {percentage.toFixed(0)}% Full</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // 🔥 REGULAR EQUIPMENT
                    return (
                      <div
                        key={eq.id}
                        className="px-2.5 py-2 rounded-lg bg-white border border-slate-200 shadow-sm"
                      >
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

                        <div className="space-y-1">
                          {eq.chemicalObjects && eq.chemicalObjects.length > 0 ? (
                            eq.chemicalObjects.map((chem, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded text-[10px]"
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

            {/* FINAL RESULT */}
            {lastReaction && (
              <section className="px-2.5 py-2 bg-green-50 border border-green-300 rounded-lg shadow-sm">
                <h3 className="text-[10px] font-bold text-green-700 uppercase tracking-wide mb-1">
                  ⚗️ Final Result
                </h3>

                <div className="space-y-0.5 text-[10px]">
                  <p>
                    <strong>Reaction:</strong> {lastReaction.reactionName || "No reaction"}
                  </p>

                  {lastReaction.outputChemical && (
                    <p>
                      <strong>Product:</strong> {lastReaction.outputChemical}
                    </p>
                  )}

                  {lastReaction.outputVolume !== undefined && (
                    <p>
                      <strong>Volume:</strong> {lastReaction.outputVolume} mL
                    </p>
                  )}

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

                  {lastReaction.gas && (
                    <p className="flex items-center gap-1">
                      <Flame size={10} className="text-orange-600" />
                      <strong>Gas:</strong> {lastReaction.gas}
                    </p>
                  )}

                  {lastReaction.precipitate && (
                    <p className="flex items-center gap-1">
                      <Droplets size={10} className="text-blue-600" />
                      <strong>Precipitate:</strong> {lastReaction.precipitate}
                    </p>
                  )}

                  <p className="flex items-center gap-1">
                    <Thermometer size={10} className="text-red-600" />
                    <strong>Temp:</strong> {20 + Math.round((lastReaction.energy ?? 0) / 3)}°C
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