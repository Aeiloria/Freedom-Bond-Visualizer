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
      <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 shrink-0 pr-1">
        <Layers className="w-3.5 h-3.5 text-neutral-400" />
        <span>Regime:</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {SCENARIO_PRESETS.map(preset => {
          const isSelected = currentScenario.id === preset.id;
          const isSelfSustaining = preset.expectedClassification === 'SELF_SUSTAINING';
          const isForced = preset.expectedClassification === 'FORCED';

          let borderStyle = 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850';
          if (isSelected) {
            if (isSelfSustaining) {
              borderStyle = 'border-cyan-500/70 bg-cyan-950/40 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-semibold';
            } else if (isForced) {
              borderStyle = 'border-rose-500/70 bg-rose-950/40 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.15)] font-semibold';
            } else {
              borderStyle = 'border-amber-500/70 bg-amber-950/40 text-amber-200 font-semibold';
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
              <span>{preset.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
