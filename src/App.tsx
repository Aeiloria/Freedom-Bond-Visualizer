/**
 * AEILORIA.CORE // FREEDOM BOND VISUALIZATION ENGINE
 * Isolated testing engine for Freedom's Bond (⧆) without planetary noise.
 * Strict zero-prose, zero-mythology visualization parameters.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  FreedomBondEngine,
  SCENARIO_PRESETS,
} from './simulation/bondEngine';
import {
  ScenarioConfig,
  StageId,
  BondClassification,
  FreedomBondVisualizationFrame,
} from './types/bond';
import { BondCanvas3D } from './components/BondCanvas3D';
import { PlaybackBar } from './components/PlaybackBar';
import { TelemetryPanel } from './components/TelemetryPanel';
import { PhaseSpacePlot } from './components/PhaseSpacePlot';
import { ScenarioSelector } from './components/ScenarioSelector';
import { NodeInspector } from './components/NodeInspector';
import { EquationReference } from './components/EquationReference';
import {
  Sliders,
  Maximize2,
  Minimize2,
  Layers,
  ArrowRightLeft,
  BookOpen,
  Info,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Simulation parameters
  const [currentScenario, setCurrentScenario] = useState<ScenarioConfig>(SCENARIO_PRESETS[0]);
  const [currentStage, setCurrentStage] = useState<StageId>('STAGE_A');
  const [dosageY, setDosageY] = useState<number>(0.85);
  const [tolerance, setTolerance] = useState<number>(0.08);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Visual options
  const [viewMode, setViewMode] = useState<'topological' | 'state_space'>('topological');
  const [showDeltaVectors, setShowDeltaVectors] = useState<boolean>(true);
  const [isEquationRefOpen, setIsEquationRefOpen] = useState<boolean>(false);

  // Selection
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Engine instance
  const engineRef = useRef<FreedomBondEngine>(new FreedomBondEngine(SCENARIO_PRESETS[0]));

  // Re-initialize engine when scenario changes
  const handleSelectScenario = useCallback((scenario: ScenarioConfig) => {
    setCurrentScenario(scenario);
    setDosageY(scenario.initialDosage);
    setCurrentStage('STAGE_A');
    setIsPlaying(false);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    engineRef.current = new FreedomBondEngine(scenario);
  }, []);

  // Update engine params if scenario re-instantiated
  useEffect(() => {
    engineRef.current.initScenario(currentScenario);
  }, [currentScenario]);

  // Auto-advance stages sequence when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev === 'STAGE_A') return 'STAGE_B';
        if (prev === 'STAGE_B') return 'STAGE_C';
        if (prev === 'STAGE_C') return 'STAGE_D';
        return 'STAGE_A';
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Compute live visualization frame
  const currentFrame: FreedomBondVisualizationFrame = useMemo(() => {
    return engineRef.current.computeFrame(
      currentStage,
      dosageY,
      0,
      currentScenario,
      tolerance
    );
  }, [currentStage, dosageY, currentScenario, tolerance]);

  const baselineNodes = useMemo(() => {
    return engineRef.current.getBaselineNodes();
  }, [currentScenario]);

  // Handle stage change
  const handleSetStage = (stage: StageId) => {
    setCurrentStage(stage);
  };

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleReset = () => {
    setCurrentStage('STAGE_A');
    setIsPlaying(false);
  };

  const handleExecutePersistenceTest = () => {
    setCurrentStage('STAGE_D');
  };

  // Selected entities for inspector
  const selectedNode = selectedNodeId ? currentFrame.nodes.find(n => n.id === selectedNodeId) || null : null;
  const baselineSelectedNode = selectedNodeId ? baselineNodes.find(n => n.id === selectedNodeId) || null : null;
  const selectedEdge = selectedEdgeId ? currentFrame.edges.find(e => e.connection_id === selectedEdgeId) || null : null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07040a] text-neutral-100 overflow-hidden font-sans selection:bg-purple-900 selection:text-orange-200">
      {/* Top Header Bar */}
      <header className="h-14 bg-[#0e0717]/95 backdrop-blur-md border-b border-purple-900/40 px-4 flex items-center justify-between shrink-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-tr from-orange-500 via-rose-500 to-purple-500 shadow-[0_0_10px_#f97316] animate-pulse" />
            <h1 className="font-mono text-xs sm:text-sm font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-pink-300 to-purple-200">
              AEILORIA.CORE <span className="text-purple-500/60 font-normal">//</span> FREEDOM BOND VISUALIZER
            </h1>
            <span className="hidden xl:inline-block px-1.5 py-0.5 text-[9px] font-mono tracking-wider font-semibold rounded bg-orange-950/60 text-orange-300 border border-orange-500/40 shadow-[0_0_8px_rgba(249,115,22,0.2)]">
              FIRE & ETHER
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-purple-300/70 border-l border-purple-900/60 pl-3">
            <span className="text-purple-400/80">Operator:</span>
            <span className="text-orange-200/90 font-medium">z = F(x, y) ⟶ z′ = F(z, 0)</span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Projection mode toggle */}
          <div className="hidden sm:flex items-center p-0.5 bg-[#130924] border border-purple-900/50 rounded-md">
            <button
              onClick={() => setViewMode('topological')}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
                viewMode === 'topological'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.3)] font-semibold'
                  : 'text-neutral-400 hover:text-amber-300'
              }`}
            >
              Topological 3D
            </button>
            <button
              onClick={() => setViewMode('state_space')}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
                viewMode === 'state_space'
                  ? 'bg-orange-500/25 text-orange-200 border border-orange-500/40 shadow-[0_0_8px_rgba(249,115,22,0.3)] font-semibold'
                  : 'text-neutral-400 hover:text-purple-300'
              }`}
            >
              Manifold Space
            </button>
          </div>

          {/* Delta vector toggle */}
          <button
            onClick={() => setShowDeltaVectors(prev => !prev)}
            className={`px-2.5 py-1.5 text-xs font-mono rounded-md border flex items-center gap-1.5 transition-all ${
              showDeltaVectors
                ? 'bg-orange-500/20 text-orange-200 border-orange-500/45 shadow-[0_0_10px_rgba(249,115,22,0.25)] font-semibold'
                : 'bg-[#130924] text-neutral-400 border-purple-900/40 hover:text-neutral-200'
            }`}
            title="Toggle State-Space Delta Vectors (Δ = z - x)"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Δ Vectors</span>
          </button>

          {/* Equation Reference Button */}
          <button
            onClick={() => setIsEquationRefOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-mono rounded-md border border-purple-900/60 bg-[#130924] text-purple-200 hover:bg-purple-950/60 hover:border-purple-500/50 transition-colors flex items-center gap-1.5 shadow-[0_0_8px_rgba(168,85,247,0.15)]"
            title="Open Topological Specification & Formulae"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Topological Spec</span>
          </button>
        </div>
      </header>

      {/* Subheader: Scenario Selection Strip */}
      <div className="bg-[#0b0514] border-b border-purple-950/70 px-4 py-1.5 shrink-0 z-20">
        <ScenarioSelector
          currentScenario={currentScenario}
          onSelectScenario={handleSelectScenario}
        />
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left/Center Canvas Viewport */}
        <div className="flex-1 relative h-[50vh] lg:h-auto overflow-hidden bg-[#07040a]">
          <BondCanvas3D
            nodes={currentFrame.nodes}
            edges={currentFrame.edges}
            baselineNodes={baselineNodes}
            stage={currentStage}
            activeDosageY={currentFrame.active_influence_y}
            classification={currentFrame.classification}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            selectedEdgeId={selectedEdgeId}
            onSelectEdge={setSelectedEdgeId}
            showDeltaVectors={showDeltaVectors}
            viewMode={viewMode}
          />

          {/* Floating Inspector Panel for Selected Node/Edge */}
          <NodeInspector
            selectedNode={selectedNode}
            baselineNode={baselineSelectedNode}
            selectedEdge={selectedEdge}
            onClose={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
          />
        </div>

        {/* Right Sidebar: Transformation Telemetry & Oscilloscope */}
        <div className="w-full lg:w-[380px] xl:w-[420px] h-[50vh] lg:h-auto flex flex-col bg-[#0b0614] shrink-0 border-t lg:border-t-0 border-purple-900/40 overflow-hidden shadow-[-4px_0_20px_rgba(0,0,0,0.5)]">
          {/* Telemetry panel */}
          <div className="flex-1 overflow-y-auto">
            <TelemetryPanel
              frame={currentFrame}
              tolerance={tolerance}
              onSetTolerance={setTolerance}
            />
          </div>

          {/* Bottom Oscilloscope Chart in sidebar */}
          <div className="p-3 border-t border-purple-900/40 bg-[#0d0718] shrink-0">
            <PhaseSpacePlot frame={currentFrame} />
          </div>
        </div>
      </div>

      {/* Bottom 4-Stage Interactive Playback Bar */}
      <footer className="shrink-0 z-30">
        <PlaybackBar
          currentStage={currentStage}
          onSetStage={handleSetStage}
          dosageY={dosageY}
          onChangeDosage={setDosageY}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onReset={handleReset}
          classification={currentFrame.classification}
          onExecutePersistenceTest={handleExecutePersistenceTest}
        />
      </footer>

      {/* Formal Specification Reference Modal */}
      <EquationReference
        isOpen={isEquationRefOpen}
        onClose={() => setIsEquationRefOpen(false)}
      />
    </div>
  );
}
