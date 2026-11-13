/**
 * AEILORIA.CORE // TRANSFORMATION TELEMETRY PANEL
 * Live tracking of V₁ (Compersion) observables, state divergence Δ = z - x,
 * and post-removal persistence behavior F(z, 0) = z'.
 * Strict zero-prose, zero-mythology visualization parameters.
 * Vibrant Fire & Ether Theme styling.
 */

import React from 'react';
import { FreedomBondVisualizationFrame, BondClassification } from '../types/bond';
import { CheckCircle2, XCircle, Flame, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';

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

  // Primary edge observables
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
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-gradient-to-r from-cyan-950/60 via-purple-950/50 to-orange-950/40 border border-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.25)]">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span className="font-mono text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-purple-200 to-orange-200 tracking-wider">
              SELF_SUSTAINING [ ⧆ FREEDOM BOND ]
            </span>
          </div>
        );
      case 'FORCED':
        return (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-rose-950/40 border border-rose-600/50 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            <span className="font-mono text-xs font-bold text-rose-300 tracking-wider">
              FORCED STATE (COLLAPSED / CAPTURED)
            </span>
          </div>
        );
      case 'ADAPTED':
        return (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-orange-950/40 border border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.2)]">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_6px_#f97316]" />
            <span className="font-mono text-xs font-bold text-orange-200 tracking-wider">
              ADAPTED TRANSIENT (y ACTIVE FLUX)
            </span>
          </div>
        );
      case 'BASELINE':
      default:
        return (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-purple-950/30 border border-purple-800/40">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="font-mono text-xs font-bold text-purple-300 tracking-wider">
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
    <div className="flex flex-col h-full bg-[#0b0614] border-l border-purple-900/40 p-4 overflow-y-auto text-neutral-200">
      {/* Header with Classification Badge */}
      <div className="pb-3 border-b border-purple-900/40">
        <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-purple-400 uppercase">
          <span>TRANSFORMATION TELEMETRY</span>
          <span className="flex items-center gap-1 text-orange-400">
            <Flame className="w-3 h-3" />
            <span>CORE V₁</span>
          </span>
        </div>
        <div className="mt-2">
          {getClassificationBadge(classification)}
        </div>
      </div>

      {/* Primary Mathematical State Vector Gauges */}
      <div className="py-3.5 border-b border-purple-900/40 grid grid-cols-2 gap-2.5">
        <div className="p-2.5 bg-[#140924]/80 border border-purple-900/50 hover:border-orange-500/40 rounded-lg transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="text-[10px] font-mono text-purple-300/80">STATE DELTA ||Δ||</div>
          <div className="text-lg font-mono font-bold text-orange-300 mt-0.5 tracking-tight">
            {telemetry.delta_magnitude.toFixed(4)}
          </div>
          <div className="text-[10px] font-mono text-purple-400/60">Δ = z - x</div>
        </div>

        <div className="p-2.5 bg-[#140924]/80 border border-purple-900/50 hover:border-cyan-500/40 rounded-lg transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="text-[10px] font-mono text-purple-300/80">PERSISTENCE ||z′ - z||</div>
          <div className={`text-lg font-mono font-bold mt-0.5 tracking-tight ${
            classification === 'SELF_SUSTAINING'
              ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
              : 'text-neutral-300'
          }`}>
            {stage === 'STAGE_D' ? telemetry.persistence_divergence.toFixed(4) : 'Pending F(z,0)'}
          </div>
          <div className="text-[10px] font-mono text-purple-400/60">
            Tol ε: {tolerance.toFixed(3)}
          </div>
        </div>

        <div className="p-2.5 bg-[#140924]/80 border border-purple-900/50 hover:border-purple-500/40 rounded-lg transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="text-[10px] font-mono text-purple-300/80">MEAN AUTONOMY</div>
          <div className="text-base font-mono font-semibold text-purple-200 mt-0.5">
            {(telemetry.mean_autonomy * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] font-mono text-purple-400/60">Sovereign unconstraint</div>
        </div>

        <div className="p-2.5 bg-[#140924]/80 border border-purple-900/50 hover:border-cyan-500/40 rounded-lg transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="text-[10px] font-mono text-purple-300/80">PHASE ALIGNMENT</div>
          <div className="text-base font-mono font-semibold text-cyan-200 mt-0.5">
            {(telemetry.phase_alignment * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] font-mono text-purple-400/60">Coherence index</div>
        </div>
      </div>

      {/* V₁ Compersion Observables Checklist */}
      <div className="py-3.5 border-b border-purple-900/40">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-mono font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-pink-300 to-purple-200 tracking-wide uppercase">
            Compersion Observables (V₁)
          </span>
          <span className="text-[10px] font-mono text-orange-300/80 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/30">
            {observableList.filter(o => o.status).length} / {observableList.length} VERIFIED
          </span>
        </div>

        <div className="space-y-2">
          {observableList.map(obs => (
            <div
              key={obs.key}
              className={`p-2.5 rounded-lg border transition-all ${
                obs.status
                  ? 'bg-gradient-to-r from-purple-950/30 to-cyan-950/20 border-cyan-500/35 hover:border-cyan-400/60 shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                  : 'bg-rose-950/20 border-rose-900/40 hover:border-rose-700/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {obs.status ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 shadow-[0_0_6px_#22d3ee]" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs font-mono font-semibold text-neutral-200">
                    {obs.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-purple-300/70 shrink-0 bg-[#0e071a] px-1.5 py-0.5 rounded border border-purple-900/40">
                  {obs.formula}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1 pl-5 leading-relaxed">
                {obs.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Persistence Test Formulation & Tolerance Slider */}
      <div className="py-3.5 border-b border-purple-900/40">
        <div className="text-[11px] font-mono font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-cyan-200 tracking-wide uppercase mb-2">
          Persistence Invariant F(z, 0) = z′
        </div>

        <div className="p-3 bg-[#130924]/85 border border-purple-900/50 rounded-lg font-mono text-xs text-neutral-300 space-y-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex justify-between text-neutral-400 text-[11px]">
            <span>Condition:</span>
            <span className="text-orange-200 font-semibold">||z′ - z|| ≤ ε ∧ ∀i 𝒪_i = 1</span>
          </div>
          <div className="flex justify-between text-neutral-400 text-[11px]">
            <span>Topological Outcome:</span>
            <span className={classification === 'SELF_SUSTAINING' ? 'text-cyan-300 font-bold drop-shadow-[0_0_6px_#22d3ee]' : 'text-neutral-400'}>
              {classification === 'SELF_SUSTAINING' ? '⧆ Freedom’s Bond Lattice' : 'Unsustained / Collapsed'}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-mono text-purple-300/90 mb-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-orange-400" />
              <span>Tolerance Threshold (ε):</span>
            </span>
            <span className="text-orange-300 font-bold">{tolerance.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0.02"
            max="0.25"
            step="0.01"
            value={tolerance}
            onChange={e => onSetTolerance(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#1e0e38] rounded appearance-none cursor-pointer accent-orange-500"
          />
        </div>
      </div>

      {/* Nodes Telemetry List */}
      <div className="py-3.5">
        <div className="text-[11px] font-mono font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-purple-200 tracking-wide uppercase mb-2">
          Node State Vectors ({nodes.length} Agents)
        </div>
        <div className="space-y-2">
          {nodes.map(node => (
            <div key={node.id} className="p-2.5 bg-[#140924]/80 border border-purple-900/50 rounded-lg hover:border-purple-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-mono font-semibold text-neutral-200">
                <span className="text-orange-200">{node.label || node.id}</span>
                <span className="text-cyan-300 text-[11px] px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                  |S| = {node.accessible_states_count}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] font-mono">
                <div className="bg-[#0b0514] p-1.5 rounded border border-purple-900/30">
                  <div className="text-purple-400/80">AUTONOMY</div>
                  <div className="text-purple-200 font-semibold">{node.state_vector.autonomy_index.toFixed(3)}</div>
                </div>
                <div className="bg-[#0b0514] p-1.5 rounded border border-purple-900/30">
                  <div className="text-purple-400/80">RESISTANCE</div>
                  <div className="text-cyan-200 font-semibold">{node.state_vector.coercion_resistance.toFixed(3)}</div>
                </div>
                <div className="bg-[#0b0514] p-1.5 rounded border border-purple-900/30">
                  <div className="text-purple-400/80">ENERGY</div>
                  <div className="text-orange-200 font-semibold">{node.state_vector.energy_reserve.toFixed(3)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
