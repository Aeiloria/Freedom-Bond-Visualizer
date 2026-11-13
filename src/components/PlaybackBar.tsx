/**
 * AEILORIA.CORE // 4-STAGE INTERACTIVE PLAYBACK BAR
 * Controls the 4 required transformation verification stages:
 * - Stage A: Baseline (x)
 * - Stage B: Apply V₁ (y = 0.1 -> 1.0)
 * - Stage C: Produce z (Δ = z - x)
 * - Stage D: Remove y (Persistence check F(z, 0) = z')
 * Vibrant Fire & Ether Theme styling.
 */

import React from 'react';
import { StageId, BondClassification } from '../types/bond';
import { Play, Pause, SkipBack, SkipForward, RefreshCw, Zap, Sparkles, Flame } from 'lucide-react';

interface PlaybackBarProps {
  currentStage: StageId;
  onSetStage: (stage: StageId) => void;
  dosageY: number;
  onChangeDosage: (newDosage: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  classification: BondClassification;
  onExecutePersistenceTest: () => void;
}

interface StageStep {
  id: StageId;
  letter: string;
  name: string;
  formula: string;
  summary: string;
}

const STAGES: StageStep[] = [
  {
    id: 'STAGE_A',
    letter: 'A',
    name: 'Baseline',
    formula: 'x ∈ X',
    summary: 'Raw agent dispersion & independent kinetic trajectories',
  },
  {
    id: 'STAGE_B',
    letter: 'B',
    name: 'Apply V₁',
    formula: 'y ∈ [0.1, 1.0]',
    summary: 'Introduce influence dosage & candidate compersion flux',
  },
  {
    id: 'STAGE_C',
    letter: 'C',
    name: 'Produce z',
    formula: 'Δ = z - x',
    summary: 'Measure state divergence & observable validation',
  },
  {
    id: 'STAGE_D',
    letter: 'D',
    name: 'Remove y',
    formula: 'z′ = F(z, 0)',
    summary: 'Execute persistence check (z′ ≈ z vs collapse)',
  },
];

export const PlaybackBar: React.FC<PlaybackBarProps> = ({
  currentStage,
  onSetStage,
  dosageY,
  onChangeDosage,
  isPlaying,
  onTogglePlay,
  onReset,
  classification,
  onExecutePersistenceTest,
}) => {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSetStage(STAGES[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < STAGES.length - 1) {
      onSetStage(STAGES[currentIndex + 1].id);
    }
  };

  return (
    <div className="w-full bg-[#0c0617]/95 backdrop-blur-md border-t border-purple-900/50 px-4 py-3 flex flex-col gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">
      {/* Top Row: Playback Controls & Stage Cards */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Playback sequence controls */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          <button
            onClick={onReset}
            className="p-2 text-purple-300 hover:text-orange-200 hover:bg-purple-900/30 rounded-md transition-colors"
            title="Reset to Stage A (Baseline)"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 text-purple-300 hover:text-orange-200 disabled:opacity-30 disabled:hover:bg-transparent hover:bg-purple-900/30 rounded-md transition-colors"
            title="Previous Stage"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className={`px-3 py-1.5 rounded-md font-mono text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isPlaying
                ? 'bg-gradient-to-r from-orange-600 via-rose-600 to-purple-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] border border-orange-400'
                : 'bg-[#150a26] hover:bg-[#200e3a] text-purple-200 border border-purple-800/60 hover:border-orange-500/50'
            }`}
            title={isPlaying ? 'Pause Auto Sequence' : 'Play 4-Stage Verification Sequence'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-orange-400" />}
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === STAGES.length - 1}
            className="p-2 text-purple-300 hover:text-orange-200 disabled:opacity-30 disabled:hover:bg-transparent hover:bg-purple-900/30 rounded-md transition-colors"
            title="Next Stage"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* The 4 Stage Interactive Segmented Track */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:max-w-3xl">
          {STAGES.map((stageItem, idx) => {
            const isActive = currentStage === stageItem.id;
            const isCompleted = currentIndex > idx;

            let stageBadgeColor = 'text-purple-400/80';
            let borderStyle = 'border-purple-950/60';
            let bgStyle = 'bg-[#120822]/70 hover:bg-[#1a0c32]';
            let activeGlowBar = 'bg-orange-500 shadow-[0_0_8px_#f97316]';

            if (isActive) {
              if (stageItem.id === 'STAGE_D') {
                if (classification === 'SELF_SUSTAINING') {
                  borderStyle = 'border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.35)]';
                  bgStyle = 'bg-gradient-to-b from-cyan-950/50 via-purple-950/40 to-[#0e071a]';
                  stageBadgeColor = 'text-cyan-300';
                  activeGlowBar = 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]';
                } else if (classification === 'FORCED') {
                  borderStyle = 'border-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.3)]';
                  bgStyle = 'bg-gradient-to-b from-rose-950/50 to-[#0e071a]';
                  stageBadgeColor = 'text-rose-300';
                  activeGlowBar = 'bg-rose-500 shadow-[0_0_10px_#f43f5e]';
                } else {
                  borderStyle = 'border-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.3)]';
                  bgStyle = 'bg-gradient-to-b from-orange-950/40 to-[#0e071a]';
                  stageBadgeColor = 'text-orange-300';
                  activeGlowBar = 'bg-orange-500 shadow-[0_0_10px_#f97316]';
                }
              } else if (stageItem.id === 'STAGE_B' || stageItem.id === 'STAGE_C') {
                borderStyle = 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]';
                bgStyle = 'bg-gradient-to-b from-orange-950/40 via-purple-950/30 to-[#0e071a]';
                stageBadgeColor = 'text-orange-300 font-semibold';
                activeGlowBar = 'bg-gradient-to-r from-orange-500 to-pink-500 shadow-[0_0_10px_#f97316]';
              } else {
                borderStyle = 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]';
                bgStyle = 'bg-gradient-to-b from-purple-950/40 to-[#0e071a]';
                stageBadgeColor = 'text-purple-300 font-semibold';
                activeGlowBar = 'bg-purple-400 shadow-[0_0_10px_#c084fc]';
              }
            } else if (isCompleted) {
              borderStyle = 'border-purple-900/60';
              bgStyle = 'bg-[#150a28]/60';
            }

            return (
              <button
                key={stageItem.id}
                onClick={() => onSetStage(stageItem.id)}
                className={`text-left p-2.5 rounded-lg border transition-all relative overflow-hidden group ${borderStyle} ${bgStyle}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[11px] font-bold ${
                        isActive
                          ? 'bg-gradient-to-br from-orange-400 to-purple-600 text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                          : 'bg-[#1a0c30] text-purple-300 group-hover:text-orange-200'
                      }`}
                    >
                      {stageItem.letter}
                    </span>
                    <span className="font-semibold text-xs text-neutral-200 group-hover:text-white">{stageItem.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono ${stageBadgeColor}`}>{stageItem.formula}</span>
                </div>
                <p className="text-[11px] text-purple-300/60 line-clamp-1 group-hover:text-purple-200">
                  {stageItem.summary}
                </p>

                {isActive && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${activeGlowBar}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Sub-Bar: Dosage Controls & Stage Action Hints */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-purple-900/40 text-xs">
        {/* Dosage y Slider */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-purple-300/80 font-mono text-xs whitespace-nowrap">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Influence Dosage (y):</span>
            <span className="font-bold text-orange-300 w-10 text-right">{dosageY.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={dosageY}
            onChange={e => onChangeDosage(parseFloat(e.target.value))}
            className="w-36 h-1.5 bg-[#1f0e38] rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex gap-1">
            {[0.25, 0.5, 0.85, 1.0].map(val => (
              <button
                key={val}
                onClick={() => onChangeDosage(val)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                  Math.abs(dosageY - val) < 0.03
                    ? 'border-orange-500 bg-orange-500/25 text-orange-200 shadow-[0_0_8px_rgba(249,115,22,0.3)] font-semibold'
                    : 'border-purple-900/50 bg-[#140924] text-purple-300 hover:text-orange-200 hover:border-purple-700'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Stage-specific direct action */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {currentStage === 'STAGE_D' ? (
            <button
              onClick={onExecutePersistenceTest}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md flex items-center gap-1.5 transition-all ${
                classification === 'SELF_SUSTAINING'
                  ? 'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-orange-500/20 text-cyan-200 border border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.35)]'
                  : 'bg-[#160a28] text-purple-200 border border-purple-700/60 hover:bg-[#220f3e] hover:border-purple-500'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Re-Test Persistence F(z, 0)</span>
            </button>
          ) : (
            <div className="text-purple-400/70 font-mono text-[11px] flex items-center gap-2">
              <span className="text-purple-500">Next verification:</span>
              <span className="text-orange-200 font-medium">
                {currentStage === 'STAGE_A' && 'Stage B (Introduce V₁ coupling)'}
                {currentStage === 'STAGE_B' && 'Stage C (Calculate Δ = z - x)'}
                {currentStage === 'STAGE_C' && 'Stage D (Remove y & verify persistence)'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
