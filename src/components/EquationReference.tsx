/**
 * AEILORIA.CORE // MATHEMATICAL EQUATION REFERENCE
 * Formal specification of Freedom's Bond (⧆), Compersion observables,
 * state-space delta, and persistence test invariants.
 * Zero-prose, zero-mythology format.
 */

import React from 'react';
import { X, BookOpen, ExternalLink } from 'lucide-react';

interface EquationReferenceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EquationReference: React.FC<EquationReferenceProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 font-mono text-xs text-neutral-300">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-cyan-400">
            <BookOpen className="w-4 h-4" />
            <span className="font-bold text-sm text-neutral-100">
              TOPOLOGICAL SPECIFICATION // FREEDOM’S BOND (⧆)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <section className="p-3 bg-neutral-950/80 rounded-lg border border-neutral-800">
            <h4 className="text-cyan-300 font-bold mb-1.5 uppercase text-[11px]">
              01. Core State Transformation Operator
            </h4>
            <div className="text-neutral-100 bg-neutral-900/90 p-2.5 rounded border border-neutral-800 mb-2">
              z = F(x, y) &emsp;;&emsp; Δ = z - x
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Where <span className="text-neutral-200">x ∈ ℝⁿ</span> represents raw independent agent state vectors,{' '}
              <span className="text-amber-300">y ∈ [0, 1]</span> denotes the applied influence dosage (Compersion V₁),{' '}
              and <span className="text-sky-300">z</span> represents candidate coupled configuration.
            </p>
          </section>

          <section className="p-3 bg-neutral-950/80 rounded-lg border border-neutral-800">
            <h4 className="text-cyan-300 font-bold mb-1.5 uppercase text-[11px]">
              02. Post-Removal Persistence Invariant
            </h4>
            <div className="text-neutral-100 bg-neutral-900/90 p-2.5 rounded border border-neutral-800 mb-2">
              z′ = F(z, 0) &emsp;;&emsp; ⧆ ⟺ (||z′ - z|| ≤ ε) ∧ ⋀ᵢ 𝒪ᵢ
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Upon complete removal of active external dosage (<span className="text-neutral-200">y → 0</span>),{' '}
              the state converges to <span className="text-neutral-200">z′</span>. Freedom’s Bond (⧆) exists if and only if{' '}
              the transformation persists (<span className="text-cyan-300">z′ ≈ z</span>) and all 5 compersion observables hold invariant.
            </p>
          </section>

          <section className="p-3 bg-neutral-950/80 rounded-lg border border-neutral-800">
            <h4 className="text-cyan-300 font-bold mb-1.5 uppercase text-[11px]">
              03. The 5 Compersion Observables (V₁)
            </h4>
            <ul className="space-y-2 text-[11px] text-neutral-400">
              <li className="flex gap-2">
                <span className="text-emerald-400 font-bold">𝒪₁</span>
                <div>
                  <strong className="text-neutral-200">B-gain Verified:</strong> ΔE_B &gt; 0 ∧ ΔAut_B ≥ 0.{' '}
                  Recipient agent increases capacity without sovereign compromise.
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400 font-bold">𝒪₂</span>
                <div>
                  <strong className="text-neutral-200">A-response Positive:</strong> Corr(ψ_A, ψ_B) &gt; 0.{' '}
                  Mutual resonance without unilateral coercion or resentment.
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400 font-bold">𝒪₃</span>
                <div>
                  <strong className="text-neutral-200">Non-Deprivation:</strong> E_A(t) ≥ E_min.{' '}
                  Source agent is protected against zero-sum or parasitic drainage.
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400 font-bold">𝒪₄</span>
                <div>
                  <strong className="text-neutral-200">Non-Capture:</strong> |S_B| ≥ |S_B,0|.{' '}
                  Accessible state manifold volume is preserved or expanded; escape paths unimpeded.
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400 font-bold">𝒪₅</span>
                <div>
                  <strong className="text-neutral-200">Distinctness Maintained:</strong> ||z_A - z_B|| ≥ r_min.{' '}
                  Eigenvector identity boundaries preserved; immunity to enmeshment singularity.
                </div>
              </li>
            </ul>
          </section>

          <section className="p-3 bg-neutral-950/80 rounded-lg border border-neutral-800">
            <h4 className="text-cyan-300 font-bold mb-1.5 uppercase text-[11px]">
              04. Visual Rendering Rules
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-neutral-900/80 rounded border border-neutral-800">
                <div className="text-slate-400 font-bold">Baseline (x)</div>
                <div className="text-neutral-500 mt-0.5">Neutral grey-blue vector nodes; raw kinetic trajectories.</div>
              </div>
              <div className="p-2 bg-neutral-900/80 rounded border border-neutral-800">
                <div className="text-amber-400 font-bold">Applied Influence (y / V₁)</div>
                <div className="text-neutral-500 mt-0.5">Amber-gold flux lines with dynamic particle streams.</div>
              </div>
              <div className="p-2 bg-neutral-900/80 rounded border border-neutral-800">
                <div className="text-cyan-300 font-bold">The Bond (⧆)</div>
                <div className="text-neutral-500 mt-0.5">Iridescent cyan-white crystal lattice formation when z′ ≈ z.</div>
              </div>
              <div className="p-2 bg-neutral-900/80 rounded border border-neutral-800">
                <div className="text-neutral-400 font-bold">Forced Collapse</div>
                <div className="text-neutral-500 mt-0.5">Fades to dashed grey trace when y removed without persistence.</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
