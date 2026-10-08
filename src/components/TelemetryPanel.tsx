/**
 * AEILORIA.CORE // TRANSFORMATION TELEMETRY PANEL
 * Live tracking of V₁ (Compersion) observables, state divergence Δ = z - x,
 * and post-removal persistence behavior F(z, 0) = z'.
 * Strict zero-prose, zero-mythology visualization parameters.
 */

import React from 'react';
import { FreedomBondVisualizationFrame, BondClassification, StageId } from '../types/bond';
import { CheckCircle2, XCircle, Activity, Compass, Zap, Shield, Flame, GitBranch } from 'lucide-react';

interface TelemetryPanelProps {
  frame: FreedomBondVisualizationFrame;
  tolerance: number;
  onSetTolerance: (val: number) => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  frame,
  tolerance,
  onSetTolerance,
}) => {
  const { stage, active_influence_y, nodes, edges, classification, telemetry } = frame;

  // Aggregate observables across active edges
  const primaryEdge = edges[0];
  const observables = primaryEdge?.compersion_observables || {
    b_gain_verified: false,
    a_response_positive: false,
    non_deprivation: true,
    non_capture: true,
    distinctness_maintained: true,
  };

  const getClassificationBadge = (cls: BondClassification) => {
    switch (cls) {
      case 'SELF_SUSTAINING':
        return (
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
              SELF_SUSTAINING [ ⧆ FREEDOM BOND ]
            </span>
          </div>
        );
      case 'FORCED':
        return (
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            <span className="font-mono text-xs font-bold text-rose-300 tracking-wider">
              FORCED STATE (COLLAPSED / CAPTURED)
            </span>
          </div>
        );
      case 'ADAPTED':
        return (
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-300 tracking-wider">
              ADAPTED TRANSIENT (y ACTIVE)
            </span>
          </div>
        );
      case 'BASELINE':
      default:
        return (
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="font-mono text-xs font-bold text-slate-300 tracking-wider">
              BASELINE INDEPENDENT (x)
            </span>
          </div>
        );
    }
  };

  const observableList = [
    {
      key: 'b_gain_verified',
      label: 'B-gain Verified (ΔE_B > 0 ∧ ΔAut_B ≥ 0)',
      formula: '∂E_B/∂y > 0, ∇Aut_B ≥ 0',
      status: observables.b_gain_verified,
      description: 'Recipient agent experiences capacity expansion without loss of sovereign autonomy.',
    },
    {
      key: 'a_response_positive',
      label: 'A-response Positive (Resonant Affirmation)',
      formula: 'Corr(ψ_A, ψ_B) > 0',
      status: observables.a_response_positive,
      description: 'Source agent acts without coercion, resentment, or unilateral compulsion.',
    },
    {
      key: 'non_deprivation',
      label: 'Non-Deprivation (E_A ≥ E_min)',
      formula: 'E_A(t) ≥ 0.45',
      status: observables.non_deprivation,
      description: 'Source energy reserves remain guarded; zero extractive or parasitic siphoning.',
    },
    {
      key: 'non_capture',
      label: 'Non-Capture (dim(S_B) Preserved)',
      formula: '|S_B| ≥ |S_B,0|, rank(𝒥) = max',
      status: observables.non_capture,
      description: 'Accessible state volume open; escape vectors unobstructed; no geometric trapping.',
    },
    {
      key: 'distinctness_maintained',
      label: 'Distinctness Maintained (||z_A - z_B|| ≥ r_min)',
      formula: 'dist(z_A, z_B) ≥ 0.90',
      status: observables.distinctness_maintained,
      description: 'Identity boundaries invariant; immune to entanglement collapse or singularity.',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-l border-neutral-800 p-4 overflow-y-auto text-neutral-200">
      {/* Header with Classification */}
      <div className="pb-3 border-b border-neutral-800">
        <div className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
          TRANSFORMATION TELEMETRY // CORE V₁
        </div>
        <div className="mt-1 flex items-center justify-between">
          {getClassificationBadge(classification)}
        </div>
      </div>

      {/* Primary Mathematical State Vector Gauges */}
      <div className="py-4 border-b border-neutral-800 grid grid-cols-2 gap-3">
        <div className="p-2.5 bg-neutral-950/70 border border-neutral-800/80 rounded-md">
          <div className="text-[10px] font-mono text-neutral-400">STATE DELTA ||Δ||</div>
          <div className="text-lg font-mono font-bold text-sky-400 mt-0.5">
            {telemetry.delta_magnitude.toFixed(4)}
          </div>
          <div className="text-[10px] font-mono text-neutral-500">Δ = z - x</div>
        </div>

        <div className="p-2.5 bg-neutral-950/70 border border-neutral-800/80 rounded-md">
          <div className="text-[10px] font-mono text-neutral-400">PERSISTENCE ||z′ - z||</div>
          <div className={`text-lg font-mono font-bold mt-0.5 ${
            classification === 'SELF_SUSTAINING' ? 'text-cyan-300' : 'text-neutral-400'
          }`}>
            {stage === 'STAGE_D' ? telemetry.persistence_divergence.toFixed(4) : 'Pending F(z,0)'}
          </div>
          <div className="text-[10px] font-mono text-neutral-500">
            Tol ε: {tolerance.toFixed(3)}
          </div>
        </div>

        <div className="p-2.5 bg-neutral-950/70 border border-neutral-800/80 rounded-md">
          <div className="text-[10px] font-mono text-neutral-400">MEAN AUTONOMY</div>
          <div className="text-base font-mono font-semibold text-neutral-200 mt-0.5">
            {(telemetry.mean_autonomy * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] font-mono text-neutral-500">Sovereign unconstraint</div>
        </div>

        <div className="p-2.5 bg-neutral-950/70 border border-neutral-800/80 rounded-md">
          <div className="text-[10px] font-mono text-neutral-400">PHASE ALIGNMENT</div>
          <div className="text-base font-mono font-semibold text-neutral-200 mt-0.5">
            {(telemetry.phase_alignment * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] font-mono text-neutral-500">Coherence index</div>
        </div>
      </div>

      {/* V₁ Compersion Observables Checklist */}
      <div className="py-4 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-mono font-semibold text-neutral-300 tracking-wide uppercase">
            Compersion Observables (V₁)
          </span>
          <span className="text-[10px] font-mono text-neutral-500">
            {observableList.filter(o => o.status).length} / {observableList.length} VERIFIED
          </span>
        </div>

        <div className="space-y-2">
          {observableList.map(obs => (
            <div
              key={obs.key}
              className={`p-2 rounded border transition-colors ${
                obs.status
                  ? 'bg-emerald-950/20 border-emerald-800/40'
                  : 'bg-rose-950/15 border-rose-900/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {obs.status ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs font-mono font-semibold text-neutral-200">
                    {obs.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                  {obs.formula}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1 pl-5">
                {obs.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Persistence Test Formulation & Tolerance Slider */}
      <div className="py-4 border-b border-neutral-800">
        <div className="text-[11px] font-mono font-semibold text-neutral-300 tracking-wide uppercase mb-2">
          Persistence Invariant F(z, 0) = z′
        </div>

        <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded font-mono text-xs text-neutral-300 space-y-1.5">
          <div className="flex justify-between text-neutral-400 text-[11px]">
            <span>Condition:</span>
            <span className="text-neutral-200">||z′ - z|| ≤ ε ∧ ∀i 𝒪_i = 1</span>
          </div>
          <div className="flex justify-between text-neutral-400 text-[11px]">
            <span>Topological Outcome:</span>
            <span className={classification === 'SELF_SUSTAINING' ? 'text-cyan-300 font-bold' : 'text-neutral-400'}>
              {classification === 'SELF_SUSTAINING' ? '⧆ Freedom’s Bond Lattice' : 'Unsustained / Collapsed'}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-mono text-neutral-400 mb-1">
            <span>Tolerance Threshold (ε):</span>
            <span className="text-neutral-200">{tolerance.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0.02"
            max="0.25"
            step="0.01"
            value={tolerance}
            onChange={e => onSetTolerance(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      </div>

      {/* Nodes Telemetry List */}
      <div className="py-4">
        <div className="text-[11px] font-mono font-semibold text-neutral-300 tracking-wide uppercase mb-2">
          Node State Vectors ({nodes.length} Agents)
        </div>
        <div className="space-y-2">
          {nodes.map(node => (
            <div key={node.id} className="p-2.5 bg-neutral-950/60 border border-neutral-800/80 rounded">
              <div className="flex items-center justify-between text-xs font-mono font-semibold text-neutral-200">
                <span>{node.label || node.id}</span>
                <span className="text-cyan-400 text-[11px]">|S| = {node.accessible_states_count}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] font-mono">
                <div>
                  <div className="text-neutral-500">AUTONOMY</div>
                  <div className="text-neutral-200 font-semibold">{node.state_vector.autonomy_index.toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-neutral-500">RESISTANCE</div>
                  <div className="text-neutral-200 font-semibold">{node.state_vector.coercion_resistance.toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-neutral-500">ENERGY</div>
                  <div className="text-neutral-200 font-semibold">{node.state_vector.energy_reserve.toFixed(3)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
