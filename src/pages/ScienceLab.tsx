import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Grid, ContactShadows } from "@react-three/drei";
import { EnhancedLabEquipment } from "@/components/EnhancedLabEquipment";
import { EquipmentRack } from "@/components/EquipmentRack";
import { EnhancedLabTable } from "@/components/EnhancedLabTable";
import { EnhancedChemicalLibrary } from "@/components/EnhancedChemicalLibrary";
import { DragDropProvider, useDragDrop } from "@/components/DragDropProvider";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useExperimentProtection } from "@/hooks/useExperimentProtection";
import {
  Beaker,
  Settings,
  ChevronDown,
  Play,
  RotateCcw,
  Save,
  Layers,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import useChemicalReactionEngine from "@/components/ChemicalReactionEngine";
import useExperimentScoring, {
  ExperimentScorePanel,
} from "@/components/ExperimentScoring";
import EducationalTooltips from "@/components/EducationalTooltips";
import SafetyWarnings from "@/components/SafetyWarnings";
import logo from "../assets/logo3.png";
import { Navigate, useNavigate } from "react-router-dom";
import { FireEffect, Precipitation, UltraLightningV2, VolumetricSmoke  } from "@/components/AdvancedVisualEffects";
import LiveReactionPanel from "@/components/LiveReactionPanel";
import * as THREE from "three";
import { EffectComposer, Bloom, SSAO, ToneMapping } from "@react-three/postprocessing";
import { ChemicalBottleModel } from "@/components/AdvancedEquipmentModels";

interface PlacedEquipment {
  id: string;
  position: [number, number, number];
  originalPosition?: [number, number, number];
  type: string;
  contents: string[];
  chemicalObjects: Array<{ name: string; volume: number; color: string }>;
  totalVolume: number;
  
  chemical?: {
    name: string;
    formula: string;
    color: string;
    concentration: number;
  };
  volumeRemaining?: number;
  maxVolume?: number;
  lastRefillTime?: number;
}

interface ExperimentState {
  status: "idle" | "active" | "paused" | "completed";
  startTime?: Date;
  currentSession?: string;
  autoSaveEnabled: boolean;
  endTime?: Date;
}

const STORAGE_KEY = "virtual-lab-state";

const ScienceLab = () => {
  const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [reactions, setReactions] = useState<any[]>([]);
  const [experimentState, setExperimentState] = useState<ExperimentState>({
    status: "idle",
    autoSaveEnabled: true,
  });
  const [isExperimentStarted, setIsExperimentStarted] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const navigate = useNavigate();

  const reactionEngine = useChemicalReactionEngine();
  const scoring = useExperimentScoring();

  const [activeEffects, setActiveEffects] = useState<any[]>([]);

  const spawnEffect = (type: string, position: [number, number, number], intensity = 1) => {
    const id = crypto.randomUUID();

    setActiveEffects(prev => [
      ...prev,
      { id, type, position, intensity }
    ]);

    setTimeout(() => {
      setActiveEffects(prev => prev.filter(e => e.id !== id));
    }, 5000);
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);

      setPlacedEquipment(parsed.placedEquipment || []);
      setReactions(parsed.reactions || []);

      setExperimentState(() => {
        const state: ExperimentState =
          parsed.experimentState || {
            status: "idle",
            autoSaveEnabled: true,
          };
        if (state.startTime && typeof state.startTime === "string") {
          state.startTime = new Date(state.startTime);
        }
        if (state.endTime && typeof state.endTime === "string") {
          state.endTime = new Date(state.endTime);
        }
        return state;
      });

      setIsExperimentStarted(parsed.isExperimentStarted || false);

      if (parsed.score) {
        for (let i = 0; i < Math.floor(parsed.score / 10); i++) {
          scoring.award(10);
        }
      }
      if (parsed.badges && parsed.badges.length > 0) {
        parsed.badges.forEach((b: string) => scoring.awardBadge(b));
      }
    }
  }, []);

  useEffect(() => {
    const data = {
      placedEquipment,
      reactions,
      experimentState,
      isExperimentStarted,
      score: scoring.score,
      badges: scoring.badges,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [
    placedEquipment,
    reactions,
    experimentState,
    isExperimentStarted,
    scoring.score,
    scoring.badges,
  ]);

  useExperimentProtection({
    isExperimentActive: isExperimentStarted,
    onBeforeUnload: () => {
      if (placedEquipment.length || reactions.length) saveExperiment(true);
    },
  });

  useEffect(() => {
    if (!isExperimentStarted || !experimentState.autoSaveEnabled || !user)
      return;
    const interval = setInterval(() => {
      if (placedEquipment.length || reactions.length) saveExperiment(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [
    isExperimentStarted,
    placedEquipment,
    reactions,
    experimentState.autoSaveEnabled,
    user,
  ]);

  const startExperiment = () => {
    if (isExperimentStarted) return;
    const sessionId = `exp-${Date.now()}`;
    setExperimentState({
      status: "active",
      startTime: new Date(),
      currentSession: sessionId,
      autoSaveEnabled: true,
    });
    setIsExperimentStarted(true);
    scoring.award(10, "Experiment Started");
    toast({
      title: "Experiment Started! 🧪",
      description: "You can now interact with equipment and chemicals.",
    });
  };

  const performReset = () => {
    setReactions([]);
    setSelectedEquipment(null);
    setPlacedEquipment([]);
    setIsExperimentStarted(false);
    setExperimentState({ status: "idle", autoSaveEnabled: true });
    scoring.reset();
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: "Lab Reset",
      description: "All equipment cleared. Click Start to begin a new experiment.",
    });
  };

  const resetLab = () => {
    if (experimentState.status === "active") setShowResetConfirm(true);
    else performReset();
  };

  const saveExperiment = async (isAutoSave = false) => {
    if (!user)
      return toast({
        title: "Authentication Required",
        description: "Please sign in to save your experiments.",
        variant: "destructive",
      });
    if (experimentState.status === "idle")
      return toast({
        title: "No Active Experiment",
        description: "Start an experiment first to save progress.",
        variant: "destructive",
      });

    try {
      const experimentData = {
        user_id: user.uid,
        experiment_name: `Lab Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        chemicals_used: placedEquipment.flatMap((eq) => eq.contents),
        results: {
          reactions: reactions.length,
          equipment_used: placedEquipment.length,
          chemicals_mixed: placedEquipment.reduce(
            (total, eq) => total + eq.chemicalObjects.length,
            0
          ),
          session_duration: experimentState.startTime
            ? Math.round(
                (Date.now() - experimentState.startTime.getTime()) / 1000
              )
            : 0,
          equipment_details: placedEquipment.map((eq) => ({
            type: eq.type,
            chemicals: eq.chemicalObjects,
            totalVolume: eq.totalVolume,
          })),
          reactions_performed: reactions.map((r) => ({
            name: r.name,
            type: r.type,
            timestamp: r.startedAt,
          })),
          timestamp: new Date().toISOString(),
        },
        score: scoring.score,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/add-experiment`,
        { experimentData }
      );
      if (response.status === 200)
        toast({
          title: isAutoSave ? "Auto-saved" : "Experiment Saved! 💾",
          description: `Progress saved with ${scoring.score} points.`,
        });
    } catch {
      toast({
        title: "Save Failed",
        description: "Could not save experiment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVolumeChange = (equipmentId: string, newTotalVolume: number) => {
    if (!isExperimentStarted)
      return toast({
        title: "Experiment Not Started",
        description: "Click 'Start' in Lab Controls to begin experimenting.",
        variant: "destructive",
      });

    setPlacedEquipment((prev) =>
      prev.map((eq) => {
        if (eq.id !== equipmentId) return eq;
        const chemicals = eq.chemicalObjects || [];
        if (chemicals.length) {
          const total = chemicals.reduce(
            (s, c) => s + Number(c.volume || 0),
            0
          );
          const scale = total ? Number(newTotalVolume) / total : 0;
          const scaled = chemicals.map((c) => ({
            ...c,
            volume: Number(c.volume || 0) * scale,
          }));
          return {
            ...eq,
            chemicalObjects: scaled,
            totalVolume: scaled.reduce(
              (s, c) => s + Number(c.volume || 0),
              0
            ),
          };
        }
        return { ...eq, totalVolume: Number(newTotalVolume || 0) };
      })
    );
    toast({
      title: "Volume Adjusted",
      description: `Volume set to ${newTotalVolume}ml`,
    });
  };

  const handleEquipmentPlace = (
    equipmentId: string,
    position: [number, number, number],
    itemData?: any
  ) => {
    if (!isExperimentStarted)
      return toast({
        title: "Experiment Not Started",
        description: "Click 'Start' to place equipment.",
        variant: "destructive",
      });

    if (itemData?.type === "chemical-bottle") {
      console.log("🧪 Placing bottle with data:", itemData);
      
      setPlacedEquipment((prev) => [
        ...prev,
        {
          id: equipmentId,
          position,
          originalPosition: position,
          type: "chemical-bottle",
          contents: [],
          chemicalObjects: [],
          totalVolume: 0,
          chemical: itemData.chemical,
          volumeRemaining: 500,
          maxVolume: 500,
          lastRefillTime: Date.now(),
        },
      ]);
      
      scoring.award(10, `Placed ${itemData.chemical.name} bottle`);
      toast({
        title: "Bottle Placed 🧪",
        description: `${itemData.chemical.name} bottle (500ml) placed on workbench.`,
      });
    } else {
      setPlacedEquipment((prev) => [
        ...prev,
        {
          id: `${equipmentId}-${Date.now()}`,
          position,
          originalPosition: position,
          type: equipmentId,
          contents: [],
          chemicalObjects: [],
          totalVolume: 0,
        },
      ]);
      
      scoring.award(10, `Placed ${equipmentId}`);
      toast({
        title: "Equipment Placed",
        description: `${equipmentId} placed on workbench.`,
      });
    }
  };

  const handleBottleAutoRefill = (bottleId: string) => {
    setPlacedEquipment((prev) =>
      prev.map((eq) => {
        if (eq.id === bottleId && eq.type === "chemical-bottle") {
          const timeSinceRefill = Date.now() - (eq.lastRefillTime || 0);
          
          if (eq.volumeRemaining === 0 && timeSinceRefill > 5000) {
            toast({
              title: "Bottle Refilled 🔄",
              description: `${eq.chemical?.name} bottle refilled to 500ml`,
            });
            
            return {
              ...eq,
              volumeRemaining: 500,
              lastRefillTime: Date.now(),
            };
          }
        }
        return eq;
      })
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      placedEquipment.forEach((eq) => {
        if (eq.type === "chemical-bottle" && eq.volumeRemaining === 0) {
          handleBottleAutoRefill(eq.id);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [placedEquipment]);

  const handleEquipmentMove = (id: string, newPosition: [number, number, number]) => {
    if (!isExperimentStarted) return;
    
    setPlacedEquipment(prev =>
      prev.map(eq => eq.id === id ? { ...eq, position: newPosition } : eq)
    );
  };

  const handleEquipmentRemove = (id: string) => {
    if (!isExperimentStarted) return;
    
    setPlacedEquipment(prev => prev.filter(eq => eq.id !== id));
    
    toast({
      title: "Equipment Removed",
      description: "Equipment has been removed from the workbench.",
    });
  };

  const handleBottleClick = (bottleId: string) => {
    const bottle = placedEquipment.find(eq => eq.id === bottleId);
    
    if (!bottle || bottle.volumeRemaining === 0) {
      toast({
        title: "Cannot Select",
        description: "Bottle is empty or refilling",
        variant: "destructive",
      });
      return;
    }

    setSelectedEquipment(bottleId);
    toast({
      title: "Bottle Selected 💧",
      description: "Use Pour Controls in left panel to pour into equipment",
    });
  };

  // 🔥 NEW: Handle pour from left panel
  const handlePourChemical = async (bottleId: string, targetId: string, amount: number) => {
    const bottle = placedEquipment.find(eq => eq.id === bottleId);
    const target = placedEquipment.find(eq => eq.id === targetId);

    if (!bottle || !target || !bottle.chemical) {
      toast({
        title: "Pour Failed",
        description: "Bottle or target equipment not found",
        variant: "destructive",
      });
      return;
    }

    if (amount > (bottle.volumeRemaining || 0)) {
      toast({
        title: "Insufficient Volume",
        description: `Bottle only has ${bottle.volumeRemaining}mL remaining`,
        variant: "destructive",
      });
      return;
    }

    const chemical = bottle.chemical;

    // Update volumes immediately
    setPlacedEquipment(prev =>
      prev.map(eq => {
        if (eq.id === bottleId) {
          return {
            ...eq,
            volumeRemaining: Math.max(0, (eq.volumeRemaining || 0) - amount),
          };
        }
        if (eq.id === targetId) {
          const newChemicals = [
            ...(eq.chemicalObjects || []),
            {
              name: chemical.name,
              volume: amount,
              color: chemical.color || "#87CEEB",
            },
          ];

          return {
            ...eq,
            totalVolume: (eq.totalVolume || 0) + amount,
            contents: [...(eq.contents || []), chemical.name],
            chemicalObjects: newChemicals,
          };
        }
        return eq;
      })
    );

    toast({
      title: "Pour Complete! 💧",
      description: `Added ${amount}mL of ${chemical.name} to ${target.type}`,
    });

    scoring.award(15, "Poured chemical");

    // Check for reaction
    setTimeout(() => {
      const updatedTarget = placedEquipment.find(eq => eq.id === targetId);
      if (updatedTarget && updatedTarget.chemicalObjects.length >= 2) {
        const A = updatedTarget.chemicalObjects.at(-2);
        const B = updatedTarget.chemicalObjects.at(-1);
        if (A && B) {
          checkForReaction(targetId, A, B);
        }
      }
    }, 100);
  };

  const checkForReaction = async (equipmentId: string, chemA: any, chemB: any) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/reaction`,
        {
          chemicalA: chemA.name,
          chemicalB: chemB.name,
          volumeA: chemA.volume,
          volumeB: chemB.volume,
        }
      );

      const result = response.data;
      setReactions((prev) => [...prev, result]);

      if (result.danger) {
        reactionEngine.safetyAlerts.push(result.danger);
      }

      scoring.award(20, result.reactionName);

      toast({
        title: result.reactionName || "Reaction Occurred!",
        description: result.description || "Chemical reaction detected.",
      });

      const equipment = placedEquipment.find(eq => eq.id === equipmentId);
      if (equipment) {
        const pos = equipment.position;

        if (result.energy > 50) spawnEffect("lightning", pos, 1.2);
        if (result.energy > 80) spawnEffect("fire", pos, 1.5);
        if (result.gas) spawnEffect("smoke", pos, 1);
        if (result.precipitate) spawnEffect("precipitation", pos, 1);
      }

      if (result.outputChemical) {
        setPlacedEquipment(prev =>
          prev.map(eq => {
            if (eq.id !== equipmentId) return eq;

            return {
              ...eq,
              chemicalObjects: [
                {
                  name: result.outputChemical,
                  volume: Number(result.outputVolume || 0),
                  color: result.finalColor || "#cccccc",
                }
              ],
              contents: [result.outputChemical],
              totalVolume: Number(result.outputVolume || 0)
            };
          })
        );
      }

    } catch (err) {
      console.error("AI Reaction Error:", err);
    }
  };

  const handleChemicalAdd = async (
    equipmentId: string,
    chemical: any,
    volume: number
  ) => {
    if (!isExperimentStarted) {
      return toast({
        title: "Experiment Not Started",
        description: "Click 'Start' in Lab Controls to begin experimenting.",
        variant: "destructive",
      });
    }

    const vol = Number(volume || 0);
    let updatedEquipment: any = null;

    setPlacedEquipment((prev) =>
      prev.map((eq) => {
        if (eq.id !== equipmentId) return eq;

        const newChemicals = [
          ...(eq.chemicalObjects || []),
          {
            name: chemical.name,
            volume: vol,
            color: chemical.color || "#87CEEB",
          },
        ];

        updatedEquipment = {
          ...eq,
          chemicalObjects: newChemicals,
          contents: [...eq.contents, chemical.name],
          totalVolume: newChemicals.reduce(
            (sum, c) => sum + Number(c.volume),
            0
          ),
        };

        return updatedEquipment;
      })
    );

    toast({
      title: "Chemical Added",
      description: `${chemical.name} (${vol} ml) added to equipment.`,
    });

    if (!updatedEquipment || updatedEquipment.chemicalObjects.length < 2) return;

    const A = updatedEquipment.chemicalObjects.at(-2);
    const B = updatedEquipment.chemicalObjects.at(-1);

    checkForReaction(equipmentId, A, B);
  };

  const handleChemicalSelect = (chemical: any) => {
    if (!isExperimentStarted)
      return toast({
        title: "Experiment Not Started",
        description: "Click 'Start' in Lab Controls to begin experimenting.",
        variant: "destructive",
      });
    if (selectedEquipment) handleChemicalAdd(selectedEquipment, chemical, 5);
    else
      toast({
        title: "No Equipment Selected",
        description: "Please select equipment first.",
        variant: "destructive",
      });
  };

  const experimentDetails = [
    { label: "Equipment placed", value: placedEquipment.length },
    {
      label: "Chemicals added",
      value: placedEquipment.reduce(
        (total, eq) => total + eq.chemicalObjects.length,
        0
      ),
    },
    { label: "Reactions performed", value: reactions.length },
    { label: "Current score", value: `${scoring.score} points` },
    {
      label: "Session duration",
      value: experimentState.startTime
        ? `${Math.round(
            (Date.now() - experimentState.startTime.getTime()) / 60000
          )} min`
        : "0 min",
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#f3f4f6] text-slate-900">
      <SafetyWarnings
        alerts={reactionEngine.safetyAlerts}
        onClear={reactionEngine.clearSafetyAlerts}
      />
      <EducationalTooltips
        reaction={
          reactionEngine.activeReactions[
            reactionEngine.activeReactions.length - 1
          ]
        }
      />

      {reactions.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50 bg-white border border-slate-300 shadow-xl rounded-lg px-4 py-3 w-72">
          <div className="text-sm font-bold text-slate-700">
            {reactions[reactions.length - 1].reactionName}
          </div>

          <div className="text-xs text-slate-600 mt-1">
            {reactions[reactions.length - 1].description}
          </div>

          {reactions[reactions.length - 1].equation && (
            <div className="text-xs text-slate-500 mt-1">
              <strong>Equation:</strong> {reactions[reactions.length - 1].equation}
            </div>
          )}

          {reactions[reactions.length - 1].colorChange && (
            <div className="text-xs mt-1">
              <strong>Color Change:</strong>{" "}
              {reactions[reactions.length - 1].colorChange}
            </div>
          )}

          {reactions[reactions.length - 1].gas && (
            <div className="text-xs mt-1">
              <strong>Gas Released:</strong>{" "}
              {reactions[reactions.length - 1].gas}
            </div>
          )}
        </div>
      )}

      <DragDropProvider>
        <header className="flex items-center justify-between px-5 py-2.5 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <img
                alt="logo"
                className="h-9 w-auto object-contain -mb-[2px]"
                src={logo}
              />
            </button>

            <div className="hidden lg:flex items-center gap-4 text-[14px] text-slate-500">
              <span className="hover:text-slate-800 cursor-default">File</span>
              <span className="hover:text-slate-800 cursor-default">Edit</span>
              <span className="hover:text-slate-800 cursor-default">View</span>
              <span className="hover:text-slate-800 cursor-default">Window</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isExperimentStarted ? "default" : "outline"}
              className="flex items-center gap-1.5 rounded-full px-3"
              onClick={startExperiment}
              disabled={isExperimentStarted}
            >
              <Play className="w-3.5 h-3.5" />
              <span className="text-xs">
                {isExperimentStarted ? "Running" : "Start"}
              </span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1.5 rounded-full px-3"
              onClick={resetLab}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-xs">Reset</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1.5 rounded-full px-3"
              onClick={() => saveExperiment(false)}
              disabled={!isExperimentStarted}
            >
              <Save className="w-3.5 h-3.5" />
              <span className="text-xs">Save</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="ml-1 rounded-full border border-transparent hover:border-slate-200"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem
                  onClick={startExperiment}
                  disabled={isExperimentStarted}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isExperimentStarted ? "Experiment Active" : "Start"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={resetLab}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => saveExperiment(false)}
                  disabled={!isExperimentStarted}
                >
                  <Save className="w-4 h-4 mr-2" /> Save
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 bg-slate-50 text-[11px] text-slate-600">
              <span
                className={`w-2 h-2 rounded-full ${
                  isExperimentStarted ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
              {isExperimentStarted ? "Session Active" : "No Active Session"}
            </div>

            <UserMenu />
          </div>
        </header>

        <div className="flex flex-1 min-h-0 px-3 pb-3 pt-2 gap-3">
          <div
            className={`${
              leftCollapsed ? "w-10" : "w-64"
            } transition-all duration-300 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative`}
          >
            <button
              onClick={() => setLeftCollapsed((v) => !v)}
              className="absolute top-2 right-2 z-20 px-2 py-1 text-[10px] bg-white border rounded shadow"
            >
              {leftCollapsed ? "▶" : "◀"}
            </button>

            {!leftCollapsed && (
              <LiveReactionPanel
                placedEquipment={placedEquipment}
                reactions={reactions}
                selectedEquipment={selectedEquipment}
                onPourChemical={handlePourChemical}
              />
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Workspace
                </span>
                <span className="text-xs text-slate-500">
                  3D Lab Environment
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>
                  Equipment: {placedEquipment.length.toString().padStart(2, "0")}
                </span>
                <span className="w-px h-3 bg-slate-300" />
                <span>Reactions: {reactions.length}</span>
              </div>
            </div>

            <div className="relative flex-1 bg-[#e5e7eb] border border-slate-200 rounded-2xl shadow-inner overflow-hidden">
              <Canvas
                camera={{ position: [0, 6, 18], fov: 32 }}
                shadows
                dpr={[1, 1.5]}
                gl={{
                  antialias: true,
                  toneMapping: THREE.ACESFilmicToneMapping,
                  outputColorSpace: THREE.SRGBColorSpace,
                  powerPreference: "high-performance",
                  alpha: false,
                  stencil: false,
                }}
                className="w-full h-full"
              >
                <ambientLight intensity={0.5} color="#ffffff" />

                <directionalLight
                  position={[10, 15, 8]}
                  intensity={1.8}
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                  shadow-bias={-0.0003}
                  shadow-camera-left={-15}
                  shadow-camera-right={15}
                  shadow-camera-top={15}
                  shadow-camera-bottom={-15}
                  shadow-camera-near={0.5}
                  shadow-camera-far={50}
                />

                <directionalLight
                  position={[-8, 10, -6]}
                  intensity={0.4}
                  color="#e3f2fd"
                />

                <pointLight
                  position={[0, 8, -12]}
                  intensity={0.3}
                  color="#fff3e0"
                  distance={30}
                  decay={2}
                />

                <hemisphereLight
                  args={[
                    "#87CEEB",
                    "#8B7355",
                    0.4
                  ]}
                />

                <color attach="background" args={["#e5e7eb"]} />

                <ContactShadows
                  opacity={0.25}
                  scale={12}
                  blur={1.2}
                  far={1.5}
                  position={[0, -0.5, 0]}
                />

                <EffectComposer>
                  <Bloom
                    intensity={0.25}
                    luminanceThreshold={0.5}
                    luminanceSmoothing={0.2}
                  />
                  <ToneMapping adaptive />
                </EffectComposer>

                <OrbitControls enableZoom enableRotate />

                <EnhancedLabTable
                  onEquipmentPlace={handleEquipmentPlace}
                  onEquipmentMove={handleEquipmentMove}
                  onEquipmentRemove={handleEquipmentRemove}
                  placedEquipment={placedEquipment}
                />

                {placedEquipment
                  .filter(eq => eq.type !== "chemical-bottle")
                  .map((eq) => (
                    <EnhancedLabEquipment
                      key={eq.id}
                      selectedEquipment={selectedEquipment}
                      setSelectedEquipment={setSelectedEquipment}
                      reactions={reactions}
                      setReactions={setReactions}
                      position={eq.position}
                      equipmentType={eq.type}
                      equipmentId={eq.id}
                      equipmentContents={eq.contents}
                      chemicalObjects={eq.chemicalObjects}
                      totalVolume={eq.totalVolume}
                      onVolumeChange={(newVol) => handleVolumeChange(eq.id, newVol)}
                      onChemicalAdd={(chem, vol) => handleChemicalAdd(eq.id, chem, vol)}
                    />
                  ))
                }

                {placedEquipment
                  .filter(eq => eq.type === "chemical-bottle")
                  .map((bottle) => (
                    <ChemicalBottleModel
                      key={bottle.id}
                      position={bottle.position}
                      chemical={bottle.chemical!}
                      volumeRemaining={bottle.volumeRemaining || 500}
                      maxVolume={bottle.maxVolume || 500}
                      isSelected={selectedEquipment === bottle.id}
                      onClick={() => handleBottleClick(bottle.id)}
                    />
                  ))
                }

                {activeEffects.map((fx) => {
                  if (fx.type === "lightning")
                    return <UltraLightningV2 key={fx.id} position={fx.position} intensity={fx.intensity} />;

                  if (fx.type === "fire")
                    return <FireEffect key={fx.id} position={fx.position} intensity={fx.intensity} />;

                  if (fx.type === "smoke")
                    return <VolumetricSmoke key={fx.id} position={fx.position} intensity={fx.intensity} />;

                  if (fx.type === "precipitation")
                    return <Precipitation key={fx.id} position={fx.position} intensity={fx.intensity} />;

                  return null;
                })}

                <Grid
                  args={[30, 30]}
                  position={[0, -0.5, 0]}
                  cellSize={1}
                  cellThickness={0.5}
                  cellColor="#6B7280"
                  sectionSize={5}
                  sectionThickness={1}
                  sectionColor="#374151"
                  fadeDistance={25}
                  fadeStrength={1}
                />
              </Canvas>
            </div>
          </div>

          <div
            className={`${
              rightCollapsed ? "w-7" : "w-[320px] xl:w-[360px]"
            } transition-all duration-200 flex flex-col`}
          >
            <div
              className={`h-full bg-[#f9fafb] border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col ${
                rightCollapsed ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              {!isExperimentStarted && (
                <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-[11px] font-medium text-amber-700 gap-2">
                  <div className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5" />
                    <span>Click "Start" to unlock chemicals & equipment.</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] px-2"
                    onClick={startExperiment}
                    disabled={isExperimentStarted}
                  >
                    Start
                  </Button>
                </div>
              )}
              <Tabs defaultValue="chemicals" className="flex flex-col h-full">
                <div className="px-3 pt-2 pb-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Lab Assets
                      </span>
                      <span className="text-xs text-slate-500">
                        Chemicals & Equipment Library
                      </span>
                    </div>
                  </div>

                  <TabsList className="grid grid-cols-2 bg-slate-100 rounded-full p-1 border border-slate-200">
                    <TabsTrigger
                      value="chemicals"
                      disabled={!isExperimentStarted}
                      className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Chemicals
                    </TabsTrigger>
                    <TabsTrigger
                      value="equipment"
                      disabled={!isExperimentStarted}
                      className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Equipment
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value="chemicals"
                  className="px-3 pb-3 pt-0 flex-1 overflow-y-auto"
                >
                  <div
                    className={
                      !isExperimentStarted
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }
                  >
                    <EnhancedChemicalLibrary
                      onChemicalSelect={handleChemicalSelect}
                      selectedEquipment={selectedEquipment}
                    />
                  </div>
                </TabsContent>

                <TabsContent
                  value="equipment"
                  className="px-3 pb-3 pt-0 flex-1 overflow-y-auto"
                >
                  <div
                    className={
                      !isExperimentStarted
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }
                  >
                    <EquipmentRack
                      onEquipmentSelect={() => {}}
                      position={[0, 0, 0]}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <button
              type="button"
              onClick={() => setRightCollapsed((v) => !v)}
              className="mt-1 self-end mr-1 rounded-full border border-slate-200 bg-white/80 px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-white shadow-sm flex items-center gap-1"
            >
              <span>{rightCollapsed ? "Open Panel" : "Collapse"}</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  rightCollapsed ? "rotate-90" : "-rotate-90"
                }`}
              />
            </button>
          </div>
        </div>

        <ConfirmationDialog
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={performReset}
          title="Reset Active Experiment?"
          description="You have an active experiment in progress. Resetting will permanently delete all your progress:"
          icon={AlertTriangle}
          iconColor="text-orange-600"
          confirmText="Reset Anyway"
          cancelText="Save First"
          confirmVariant="destructive"
          details={experimentDetails}
        >
          <p className="text-xs text-muted-foreground mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
            💡 <strong>Tip:</strong> Consider saving your experiment first to
            preserve your progress and points.
          </p>
        </ConfirmationDialog>
      </DragDropProvider>
    </div>
  );
};

export default ScienceLab;