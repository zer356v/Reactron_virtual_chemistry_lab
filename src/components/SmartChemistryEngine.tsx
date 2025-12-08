import { useCallback, useState } from "react";
import * as THREE from "three";


/* -------------------------------------------------
   TYPES
------------------------------------------------- */
export interface ReactionData {
  id: string;
  name: string;
  reactants: string[];
  products: string[];
  type: string;
  energy: string;
  temperatureRequired: number;
  catalysts?: string[];
  conditions: string[];
  heatGenerated: number;
  colorChange?: { from: string; to: string };
  gasEvolution?: boolean;
  precipitateFormed?: string;
  dangerLevel: string;
  safetyWarnings: string[];
  description: string;
  balancedEquation: string;
  mechanism?: string[];
  educationalNotes: string[];
}

export interface SafetyAlert {
  id: string;
  level: "warning" | "danger" | "critical";
  message: string;
  chemical?: string;
  action: string;
  timestamp: Date;
}

/* -------------------------------------------------
   LOCAL FALLBACK CHEMICAL REACTION DATABASE
------------------------------------------------- */
const reactionDatabase: ReactionData[] = [
  {
    id: "hcl_naoh_neutralization",
    name: "Acid-Base Neutralization",
    reactants: ["HCl", "NaOH"],
    products: ["NaCl", "H₂O"],
    type: "acid_base",
    energy: "exothermic",
    temperatureRequired: 20,
    conditions: ["room temperature"],
    heatGenerated: 57.3,
    dangerLevel: "medium",
    safetyWarnings: ["Generates heat"],
    description: "Strong acid reacts with strong base to form salt + water.",
    balancedEquation: "HCl + NaOH → NaCl + H₂O",
    educationalNotes: ["Classic neutralization example"]
  },
  // Add your other reactions here…
];

/* -------------------------------------------------
   SAFETY RULE TYPES
------------------------------------------------- */
type TemperatureLimit = {
  max?: number;
  ignition?: number;
  warning: string;
};

/* -------------------------------------------------
   LOCAL SAFETY RULES
------------------------------------------------- */
const safetyRules: {
  incompatibleCombinations: { chemicals: string[]; warning: string }[];
  temperatureLimits: Record<string, TemperatureLimit>;
} = {
  incompatibleCombinations: [
    {
      chemicals: ["H2SO4", "organic"],
      warning: "DANGER: Sulfuric acid reacts explosively with organic compounds"
    }
  ],

  temperatureLimits: {
    H2SO4: {
      max: 80,
      warning: "Sulfuric acid becomes more reactive at high temperatures"
    },
    HCl: {
      max: 85,
      warning: "HCl vapor pressure increases rapidly"
    },
    Mg: {
      ignition: 650,
      warning: "Magnesium ignition temperature exceeded!"
    }
  }
};

/* -------------------------------------------------
   SMART CHEMISTRY ENGINE (Main Hook)
------------------------------------------------- */
export const useSmartChemistryEngine = () => {
  const [activeReactions, setActiveReactions] = useState<ReactionData[]>([]);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [reactionHistory, setReactionHistory] = useState<ReactionData[]>([]);

  const applyColorToEquipment = (scene, equipmentId, color) => {
    if (!scene) return;

    const obj = scene.getObjectByName(equipmentId);
    if (!obj) {
      console.warn("No equipment found:", equipmentId);
      return;
    }

    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(mat => {
          mat.color = new THREE.Color(color);
        });
      } else {
        obj.material.color = new THREE.Color(color);
      }
    }
  };

  /* -------------------------------------------------
     AI BACKEND CALL → DeepSeek (via Express Server)
  ------------------------------------------------- */
  const fetchAIReaction = useCallback(
    async (
      chemicalA: string,
      chemicalB: string,
      volumeA: number,
      volumeB: number
    ): Promise<ReactionData | null> => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/reaction`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chemicalA, chemicalB, volumeA, volumeB })
          }
        );

        const result = await res.json();
        if (!result) return null;
        return {
          id: "ai_reaction",
          name: result.reactionName ?? `AI Reaction: ${chemicalA} + ${chemicalB}`,
          reactants: [chemicalA, chemicalB],
          products: result.products ?? [],
          type: result.type ?? "analysis",
          energy: result.energy ?? "unknown",
          temperatureRequired: result.temperatureRequired ?? 20,
          conditions: [result.conditions ?? "AI estimated"],
          heatGenerated: result.heat ?? 0,
          dangerLevel: result.danger ?? "low",
          safetyWarnings: result.safety ? [result.safety] : [],
          description: result.description ?? "",
          balancedEquation: result.equation ?? "",
          educationalNotes: []
        };
      } catch (e) {
        console.error("AI API error:", e);
        return null;
      }
    },
    []
  );

  /* -------------------------------------------------
     SAFETY CHECKER
  ------------------------------------------------- */
  const checkSafety = useCallback((chemicals: string[], temperature: number) => {
    const alerts: SafetyAlert[] = [];

    // 1️⃣ check incompatible chemicals
    safetyRules.incompatibleCombinations.forEach(rule => {
      const match = rule.chemicals.every(keyword =>
        chemicals.some(selected => selected.includes(keyword))
      );

      if (match) {
        alerts.push({
          id: `critical_${Date.now()}`,
          level: "critical",
          message: rule.warning,
          action: "STOP IMMEDIATELY",
          timestamp: new Date()
        });
      }
    });

    // 2️⃣ temperature safety
    chemicals.forEach(chemical => {
      Object.entries(safetyRules.temperatureLimits).forEach(([key, limits]) => {
        if (!chemical.includes(key)) return;

        // max temperature rule
        if (limits.max !== undefined && temperature > limits.max) {
          alerts.push({
            id: `temp_${Date.now()}`,
            level: "danger",
            message: limits.warning,
            action: "Cool down mixture",
            timestamp: new Date()
          });
        }

        // ignition rule
        if (limits.ignition !== undefined && temperature > limits.ignition) {
          alerts.push({
            id: `ignition_${Date.now()}`,
            level: "critical",
            message: `${key} ignition threshold exceeded!`,
            action: "EVACUATE IMMEDIATELY",
            timestamp: new Date()
          });
        }
      });
    });

    if (alerts.length > 0) {
      setSafetyAlerts(prev => [...prev, ...alerts]);
    }
  }, []);

  /* -------------------------------------------------
     LOCAL FALLBACK REACTION ENGINE
  ------------------------------------------------- */
  const detectReaction = useCallback(
    (chemicals: string[], temperature = 20): ReactionData | null => {
      checkSafety(chemicals, temperature);

      for (const r of reactionDatabase) {
        const match = r.reactants.every(required =>
          chemicals.some(chosen => chosen.includes(required))
        );
        if (match && temperature >= r.temperatureRequired) {
          return r;
        }
      }

      return null;
    },
    [checkSafety]
  );

  /* -------------------------------------------------
     MAIN ENGINE: AI FIRST → FALLBACK LOCAL
  ------------------------------------------------- */
  const performReaction = useCallback(
    async (
      chemicals: string[],
      temperature = 20,
      catalyst?: string,
      volumeA = 0,
      volumeB = 0
    ): Promise<ReactionData | null> => {
      if (chemicals.length < 2) return null;

      const [A, B] = chemicals;

      // 1️⃣ AI DeepSeek Reaction
      const ai = await fetchAIReaction(A, B, volumeA, volumeB);
      if (ai) {
        setActiveReactions(prev => [...prev, ai]);
        setReactionHistory(prev => [...prev, ai]);
        return ai;
      }

      // 2️⃣ Local fallback
      const local = detectReaction(chemicals, temperature);
      if (local) {
        setActiveReactions(prev => [...prev, local]);
        setReactionHistory(prev => [...prev, local]);
        return local;
      }

      return null;
    },
    [fetchAIReaction, detectReaction]
  );

  /* -------------------------------------------------
     HELPERS
  ------------------------------------------------- */
  const clearSafetyAlerts = () => setSafetyAlerts([]);

  const getReactionsByType = (type: string) =>
    reactionDatabase.filter(r => r.type === type);

  const predictProductProperties = () => ({
    state: "liquid",
    color: "#ffffff",
    density: 1.0,
    boilingPoint: 100,
    stability: "stable"
  });

  /* -------------------------------------------------
     PUBLIC API
  ------------------------------------------------- */
 return {
  detectReaction,
  performReaction,
  clearSafetyAlerts,
  getReactionsByType,
  predictProductProperties,
  activeReactions,
  safetyAlerts,
  reactionHistory,

  // ⭐ NEW FUNCTION
  applyColorToEquipment
};

};
