/**
 * AEILORIA.CORE // 4-STAGE INTERACTIVE PLAYBACK BAR
 * Controls the 4 required transformation verification stages:
 * - Stage A: Baseline (x)
 * - Stage B: Apply V₁ (y = 0.1 -> 1.0)
 * - Stage C: Produce z (Δ = z - x)
 * - Stage D: Remove y (Persistence check F(z, 0) = z')
 */

import React from 'react';
import { StageId, BondClassification } from '../types/bond';
import { Play, Pause, SkipBack, SkipForward, RefreshCw, Zap, ShieldAlert, Sparkles } from 'lucide-react';

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
    <div className="w-full bg-neutral-900/90 backdrop-blur-md border-t border-neutral-800 px-4 py-3 flex flex-col gap-3">
      {/* Top Row: Playback Controls & Stage Cards */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Playback sequence controls */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          <button
            onClick={onReset}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-md transition-colors"
            title="Reset to Stage A (Baseline)"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 text-neutral-400 hover:text-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent hover:bg-neutral-800 rounded-md transition-colors"
            title="Previous Stage"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className={`px-3 py-1.5 rounded-md font-mono text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
            }`}
            title={isPlaying ? 'Pause Auto Sequence' : 'Play 4-Stage Verification Sequence'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === STAGES.length - 1}
            className="p-2 text-neutral-400 hover:text-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent hover:bg-neutral-800 rounded-md transition-colors"
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

            let stageBadgeColor = 'text-neutral-400';
            let borderStyle = 'border-neutral-800';
            let bgStyle = 'bg-neutral-950/60 hover:bg-neutral-900';

            if (isActive) {
              if (stageItem.id === 'STAGE_D') {
                if (classification === 'SELF_SUSTAINING') {
                  borderStyle = 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]';
                  bgStyle = 'bg-cyan-950/40';
                  stageBadgeColor = 'text-cyan-300';
                } else if (classification === 'FORCED') {
                  borderStyle = 'border-neutral-600';
                  bgStyle = 'bg-neutral-900/80';
                  stageBadgeColor = 'text-neutral-300';
                } else {
                  borderStyle = 'border-amber-500';
                  bgStyle = 'bg-amber-950/30';
                  stageBadgeColor = 'text-amber-300';
                }
              } else if (stageItem.id === 'STAGE_B' || stageItem.id === 'STAGE_C') {
                borderStyle = 'border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
                bgStyle = 'bg-amber-950/30';
                stageBadgeColor = 'text-amber-300';
              } else {
                borderStyle = 'border-sky-500';
                bgStyle = 'bg-sky-950/30';
                stageBadgeColor = 'text-sky-300';
              }
            } else if (isCompleted) {
              borderStyle = 'border-neutral-700';
              bgStyle = 'bg-neutral-900/40';
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
                          ? 'bg-neutral-100 text-neutral-900'
                          : 'bg-neutral-800 text-neutral-400 group-hover:text-neutral-200'
                      }`}
                    >
                      {stageItem.letter}
                    </span>
                    <span className="font-semibold text-xs text-neutral-200">{stageItem.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono ${stageBadgeColor}`}>{stageItem.formula}</span>
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-1 group-hover:text-neutral-300">
                  {stageItem.summary}
                </p>

                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-current text-cyan-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Sub-Bar: Dosage Controls & Stage Action Hints */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-neutral-800/60 text-xs">
        {/* Dosage y Slider */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-xs whitespace-nowrap">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Influence Dosage (y):</span>
            <span className="font-semibold text-amber-300 w-10 text-right">{dosageY.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={dosageY}
            onChange={e => onChangeDosage(parseFloat(e.target.value))}
            className="w-36 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex gap-1">
            {[0.25, 0.5, 0.85, 1.0].map(val => (
              <button
                key={val}
                onClick={() => onChangeDosage(val)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                  Math.abs(dosageY - val) < 0.03
                    ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
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
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Re-Test Persistence F(z, 0)</span>
            </button>
          ) : (
            <div className="text-neutral-500 font-mono text-[11px] flex items-center gap-2">
              <span>Next verification:</span>
              <span className="text-neutral-300">
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
