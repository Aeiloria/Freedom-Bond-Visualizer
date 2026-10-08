/**
 * AEILORIA.CORE // STATE INSPECTOR
 * Detailed mathematical telemetry breakdown for a selected node or edge.
 */

import React from 'react';
import { BondVisualizerNode, BondVisualizerEdge } from '../types/bond';
import { X, Cpu, Link2, Check, AlertCircle } from 'lucide-react';

interface NodeInspectorProps {
  selectedNode: BondVisualizerNode | null;
  baselineNode: BondVisualizerNode | null;
  selectedEdge: BondVisualizerEdge | null;
  onClose: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedNode,
  baselineNode,
  selectedEdge,
  onClose,
}) => {
  if (!selectedNode && !selectedEdge) return null;

  return (
    <div className="absolute top-16 right-4 z-20 w-80 bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-lg shadow-2xl p-4 text-xs font-mono text-neutral-300">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          {selectedNode ? <Cpu className="w-4 h-4 text-sky-400" /> : <Link2 className="w-4 h-4 text-amber-400" />}
          <span className="font-semibold text-neutral-100">
            {selectedNode ? `AGENT // ${selectedNode.id}` : `CONNECTION // ${selectedEdge?.connection_id}`}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {selectedNode && (
        <div className="mt-3 space-y-3">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase">State Vector Coordinates</div>
            <div className="mt-1 space-y-1">
              <div className="flex justify-between py-1 px-2 bg-neutral-950/70 rounded border border-neutral-800">
                <span className="text-neutral-400">Autonomy Index:</span>
                <span className="text-emerald-400 font-bold">{selectedNode.state_vector.autonomy_index.toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-1 px-2 bg-neutral-950/70 rounded border border-neutral-800">
                <span className="text-neutral-400">Coercion Resistance:</span>
                <span className="text-sky-400 font-bold">{selectedNode.state_vector.coercion_resistance.toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-1 px-2 bg-neutral-950/70 rounded border border-neutral-800">
                <span className="text-neutral-400">Energy Reserve:</span>
                <span className="text-amber-400 font-bold">{selectedNode.state_vector.energy_reserve.toFixed(4)}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-neutral-500 uppercase">Accessible State Space</div>
            <div className="mt-1 flex justify-between py-1.5 px-2 bg-neutral-950/70 rounded border border-neutral-800">
              <span className="text-neutral-400">Cardinality |S(x)|:</span>
              <span className="text-cyan-300 font-bold">{selectedNode.accessible_states_count} states</span>
            </div>
          </div>

          {baselineNode && (
            <div>
              <div className="text-[10px] text-neutral-500 uppercase">Displacement from Baseline (Δ = z - x)</div>
              <div className="mt-1 space-y-1 text-[11px]">
                <div className="flex justify-between text-neutral-400">
                  <span>Δ Autonomy:</span>
                  <span className="text-neutral-200">
                    {(selectedNode.state_vector.autonomy_index - baselineNode.state_vector.autonomy_index >= 0 ? '+' : '')}
                    {(selectedNode.state_vector.autonomy_index - baselineNode.state_vector.autonomy_index).toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Δ Energy:</span>
                  <span className="text-neutral-200">
                    {(selectedNode.state_vector.energy_reserve - baselineNode.state_vector.energy_reserve >= 0 ? '+' : '')}
                    {(selectedNode.state_vector.energy_reserve - baselineNode.state_vector.energy_reserve).toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Δ Position Euclidean:</span>
                  <span className="text-sky-300">
                    {Math.hypot(
                      selectedNode.position[0] - baselineNode.position[0],
                      selectedNode.position[1] - baselineNode.position[1],
                      selectedNode.position[2] - baselineNode.position[2]
                    ).toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedEdge && (
        <div className="mt-3 space-y-3">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase">Structural Status</div>
            <div className="mt-1 p-2 bg-neutral-950/70 rounded border border-neutral-800">
              <div className="flex justify-between">
                <span className="text-neutral-400">Self-Sustaining (⧆):</span>
                <span className={selectedEdge.is_self_sustaining_bond ? 'text-cyan-300 font-bold' : 'text-neutral-400'}>
                  {selectedEdge.is_self_sustaining_bond ? 'CONFIRMED' : 'FALSE'}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-neutral-400">Persistence Ratio:</span>
                <span className="text-neutral-200">{(selectedEdge.persistence_ratio * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-neutral-400">Flux Intensity:</span>
                <span className="text-amber-400">{selectedEdge.flux_intensity.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-neutral-500 uppercase">Compersion Observables</div>
            <div className="mt-1 space-y-1">
              {Object.entries(selectedEdge.compersion_observables).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-1 px-2 bg-neutral-950/50 rounded border border-neutral-800 text-[11px]">
                  <span className="text-neutral-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className={value ? 'text-emerald-400 flex items-center gap-1' : 'text-rose-400 flex items-center gap-1'}>
                    {value ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {value ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
