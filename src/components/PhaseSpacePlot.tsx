/**
 * AEILORIA.CORE // PHASE SPACE & TELEMETRY OSCILLOSCOPE
 * Renders real-time phase-space trajectories (Autonomy vs Energy)
 * and time-series telemetry curves of V₁ observables.
 */

import React, { useRef, useEffect, useState } from 'react';
import { FreedomBondVisualizationFrame } from '../types/bond';

interface PhaseSpacePlotProps {
  frame: FreedomBondVisualizationFrame;
}

interface HistorySample {
  time: number;
  dosage: number;
  delta: number;
  autonomy: number;
  energy: number;
}

export const PhaseSpacePlot: React.FC<PhaseSpacePlotProps> = ({ frame }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<HistorySample[]>(
    Array.from({ length: 24 }, (_, i) => ({
      time: i * 0.05,
      dosage: frame.active_influence_y,
      delta: frame.telemetry.delta_magnitude,
      autonomy: frame.nodes[0]?.state_vector.autonomy_index ?? 0.85,
      energy: frame.nodes[0]?.state_vector.energy_reserve ?? 0.82,
    }))
  );
  const [plotMode, setPlotMode] = useState<'time_series' | 'phase_portrait'>('time_series');

  // Append frame to history buffer
  useEffect(() => {
    const nodeA = frame.nodes[0];
    const sample: HistorySample = {
      time: frame.timestep,
      dosage: frame.active_influence_y,
      delta: frame.telemetry.delta_magnitude,
      autonomy: nodeA ? nodeA.state_vector.autonomy_index : 0.8,
      energy: nodeA ? nodeA.state_vector.energy_reserve : 0.8,
    };

    historyRef.current.push(sample);
    if (historyRef.current.length > 120) {
      historyRef.current.shift();
    }
  }, [frame]);

  // Render chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const history = historyRef.current;
    if (history.length < 2) {
      ctx.restore();
      return;
    }

    if (plotMode === 'time_series') {
      // Time-series strip
      const padding = 15;
      const chartW = width - padding * 2;
      const chartH = height - padding * 2;

      // Draw series helper
      const drawSeries = (getValue: (s: HistorySample) => number, color: string, lineWidth = 1.5) => {
        ctx.beginPath();
        history.forEach((sample, i) => {
          const x = padding + (i / (history.length - 1)) * chartW;
          const val = Math.max(0, Math.min(1.2, getValue(sample)));
          const y = height - padding - (val / 1.2) * chartH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      };

      // 1. Dosage y(t) - Amber
      drawSeries(s => s.dosage, 'rgba(245, 158, 11, 0.85)', 1.5);

      // 2. State Delta ||Δ|| - Sky
      drawSeries(s => s.delta * 2, 'rgba(56, 189, 248, 0.85)', 1.5);

      // 3. Autonomy - Emerald
      drawSeries(s => s.autonomy, 'rgba(52, 211, 153, 0.75)', 1.2);

      // Current value markers on the right edge
      const latest = history[history.length - 1];
      const rightX = padding + chartW;

      // Dosage
      const yDosage = height - padding - (latest.dosage / 1.2) * chartH;
      ctx.beginPath();
      ctx.arc(rightX, yDosage, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
    } else {
      // Phase Portrait: Autonomy vs Energy
      const padding = 25;
      const chartW = width - padding * 2;
      const chartH = height - padding * 2;

      // Axis labels
      ctx.font = '9px JetBrains Mono';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Autonomy →', padding, height - 6);
      ctx.fillText('↑ Energy', 4, padding - 8);

      // Trajectory curve
      ctx.beginPath();
      history.forEach((sample, i) => {
        const x = padding + sample.autonomy * chartW;
        const y = height - padding - sample.energy * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = frame.classification === 'SELF_SUSTAINING' ? '#22d3ee' : '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Current attractor head
      const latest = history[history.length - 1];
      const curX = padding + latest.autonomy * chartW;
      const curY = height - padding - latest.energy * chartH;
      ctx.beginPath();
      ctx.arc(curX, curY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = frame.classification === 'SELF_SUSTAINING' ? '#06b6d4' : '#f59e0b';
      ctx.stroke();
    }

    ctx.restore();
  }, [frame, plotMode]);

  return (
    <div className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
          {plotMode === 'time_series' ? 'Temporal State Trajectory' : 'Phase Portrait (Autonomy × Energy)'}
        </div>
        <div className="flex items-center gap-1 bg-neutral-900 rounded p-0.5 border border-neutral-800">
          <button
            onClick={() => setPlotMode('time_series')}
            className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
              plotMode === 'time_series' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Time Series
          </button>
          <button
            onClick={() => setPlotMode('phase_portrait')}
            className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
              plotMode === 'phase_portrait' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Phase Portrait
          </button>
        </div>
      </div>

      <div className="w-full h-24 relative rounded overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {plotMode === 'time_series' && (
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Dosage y(t)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>||Δ|| State Delta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Autonomy</span>
          </div>
        </div>
      )}
    </div>
  );
};
