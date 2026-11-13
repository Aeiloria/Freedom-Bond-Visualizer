/**
 * AEILORIA.CORE // SCENARIO SELECTOR
 * Quick test presets for verifying different coupling regimes:
 * - Canonical Freedom's Bond (⧆)
 * - Coercive Capture (Forced State Collapse)
 * - Parasitic Deprivation
 * - Identity Fusion / Enmeshment
 * - Sub-Critical Transient
 * - Multi-Agent Tetrahedral Lattice (⧆₄)
 */

import React from 'react';
import { ScenarioConfig } from '../types/bond';
import { SCENARIO_PRESETS } from '../simulation/bondEngine';
import { Layers, Sparkles, AlertTriangle, ShieldX, RefreshCw } from 'lucide-react';

interface ScenarioSelectorProps {
  currentScenario: ScenarioConfig;
  onSelectScenario: (scenario: ScenarioConfig) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  currentScenario,
  onSelectScenario,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
      <div className="flex items-center gap-1.5 text-xs font-mono text-purple-400/80 shrink-0 pr-1">
        <Layers className="w-3.5 h-3.5 text-orange-400" />
        <span>Regime:</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {SCENARIO_PRESETS.map(preset => {
          const isSelected = currentScenario.id === preset.id;
          const isSelfSustaining = preset.expectedClassification === 'SELF_SUSTAINING';
          const isForced = preset.expectedClassification === 'FORCED';

          let borderStyle = 'border-purple-950/60 bg-[#130924]/60 text-purple-300/70 hover:text-orange-200 hover:border-orange-500/40 hover:bg-[#1c0c36]';
          if (isSelected) {
            if (isSelfSustaining) {
              borderStyle = 'border-purple-500/80 bg-purple-950/50 text-purple-200 shadow-[0_0_14px_rgba(168,85,247,0.35)] font-semibold';
            } else if (isForced) {
              borderStyle = 'border-rose-600/80 bg-rose-950/40 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.25)] font-semibold';
            } else {
              borderStyle = 'border-orange-500/80 bg-orange-950/40 text-orange-200 shadow-[0_0_12px_rgba(249,115,22,0.25)] font-semibold';
            }
          }

          return (
            <button
              key={preset.id}
              onClick={() => onSelectScenario(preset)}
              className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-all flex items-center gap-1.5 whitespace-nowrap ${borderStyle}`}
              title={preset.description}
            >
              {isSelfSustaining && <Sparkles className="w-3 h-3 text-cyan-400" />}
              {isForced && <ShieldX className="w-3 h-3 text-rose-400" />}
              {!isSelfSustaining && !isForced && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
              <span>{preset.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
