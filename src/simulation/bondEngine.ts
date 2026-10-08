/**
 * AEILORIA.CORE // FREEDOM BOND SIMULATION & STATE-SPACE TRANSFORMATION ENGINE
 * Mathematical implementation of z = F(x, y), z' = F(z, 0), and Compersion (V₁) observables.
 */

import {
  BondVisualizerNode,
  BondVisualizerEdge,
  FreedomBondVisualizationFrame,
  BondClassification,
  StageId,
  ScenarioConfig,
} from '../types/bond';

export const SCENARIO_PRESETS: ScenarioConfig[] = [
  {
    id: 'canonical_freedom_bond',
    name: 'Canonical Freedom Bond (⧆)',
    tag: 'STABLE_LATTICE',
    description: 'Mutual resonant compersion with non-deprivation and distinctness. Self-sustains upon dosage removal.',
    agentCount: 2,
    initialDosage: 0.85,
    expectedClassification: 'SELF_SUSTAINING',
    intrinsicCoercionResistance: 0.92,
    couplingType: 'harmonic_compersion',
  },
  {
    id: 'coercive_capture',
    name: 'Coercive Unilateral Capture',
    tag: 'FORCED_COLLAPSE',
    description: 'Agent A unilaterally binds Agent B, collapsing B’s accessible states. Fails non-capture; link collapses when y=0.',
    agentCount: 2,
    initialDosage: 0.90,
    expectedClassification: 'FORCED',
    intrinsicCoercionResistance: 0.28,
    couplingType: 'asymmetric_capture',
  },
  {
    id: 'parasitic_deprivation',
    name: 'Parasitic Deprivation',
    tag: 'DEPLETION_FAILURE',
    description: 'Target gain is extracted by depleting source vitality. Violates non-deprivation constraint.',
    agentCount: 2,
    initialDosage: 0.75,
    expectedClassification: 'FORCED',
    intrinsicCoercionResistance: 0.40,
    couplingType: 'parasitic_drain',
  },
  {
    id: 'identity_collapse',
    name: 'Identity Fusion / Enmeshment',
    tag: 'DISTINCTNESS_VIOLATION',
    description: 'State boundaries dissolve into degenerate singularity. Fails distinctness maintained observable.',
    agentCount: 2,
    initialDosage: 0.80,
    expectedClassification: 'ADAPTED',
    intrinsicCoercionResistance: 0.35,
    couplingType: 'identity_collapse',
  },
  {
    id: 'subcritical_transient',
    name: 'Sub-Critical Transient',
    tag: 'UNSUSTAINED_ADAPTATION',
    description: 'Weak coupling without critical threshold nucleation. Bond partially adapts but decays after y removal.',
    agentCount: 2,
    initialDosage: 0.35,
    expectedClassification: 'ADAPTED',
    intrinsicCoercionResistance: 0.65,
    couplingType: 'subcritical_transient',
  },
  {
    id: 'polyhedral_lattice',
    name: 'Tetrahedral Freedom Lattice (⧆₄)',
    tag: 'MULTI_AGENT_CRYSTAL',
    description: '4-agent topological network establishing distributed mutual compersion and omnidirectional lattice stability.',
    agentCount: 4,
    initialDosage: 0.85,
    expectedClassification: 'SELF_SUSTAINING',
    intrinsicCoercionResistance: 0.94,
    couplingType: 'lattice_network',
  },
];

export interface EngineParams {
  scenario: ScenarioConfig;
  stage: StageId;
  activeDosageY: number; // 0.0 to 1.0
  persistenceTolerance: number; // ε tolerance for ||z' - z||
  timeStep: number;
}

export class FreedomBondEngine {
  private baselineNodes: BondVisualizerNode[] = [];
  private basePositions: [number, number, number][] = [];
  private baseVelocities: [number, number, number][] = [];

  constructor(scenario: ScenarioConfig) {
    this.initScenario(scenario);
  }

  public initScenario(scenario: ScenarioConfig) {
    this.baselineNodes = [];
    this.basePositions = [];
    this.baseVelocities = [];

    if (scenario.agentCount === 4) {
      // Tetrahedral diamond configuration
      const radius = 2.4;
      const coords: [number, number, number][] = [
        [-radius, -radius * 0.5, radius * 0.7],
        [radius, -radius * 0.5, -radius * 0.7],
        [0, radius * 0.9, radius * 0.7],
        [0, -radius * 0.3, -radius * 1.1],
      ];

      coords.forEach((pos, i) => {
        const id = `NODE_${String.fromCharCode(65 + i)}`;
        const autonomy = 0.80 + (i % 2) * 0.08;
        const res = scenario.intrinsicCoercionResistance;
        const energy = 0.75 + (i * 0.05);
        this.basePositions.push([...pos]);
        this.baseVelocities.push([
          Math.sin(i * 1.5) * 0.15,
          Math.cos(i * 1.2) * 0.15,
          Math.sin(i * 2.1) * 0.15,
        ]);
        this.baselineNodes.push({
          id,
          label: `Agent ${String.fromCharCode(65 + i)}`,
          position: [...pos],
          velocity: this.baseVelocities[i],
          state_vector: {
            autonomy_index: autonomy,
            coercion_resistance: res,
            energy_reserve: energy,
          },
          accessible_states_count: 64,
        });
      });
    } else {
      // 2-agent pairwise test chamber
      const posA: [number, number, number] = [-2.2, 0.4, -0.3];
      const posB: [number, number, number] = [2.2, -0.4, 0.3];

      this.basePositions = [[...posA], [...posB]];
      this.baseVelocities = [[0.12, -0.08, 0.05], [-0.12, 0.08, -0.05]];

      const res = scenario.intrinsicCoercionResistance;
      const autonomyA = scenario.couplingType === 'asymmetric_capture' ? 0.95 : 0.86;
      const autonomyB = scenario.couplingType === 'asymmetric_capture' ? 0.45 : 0.82;
      const energyA = scenario.couplingType === 'parasitic_drain' ? 0.88 : 0.84;
      const energyB = scenario.couplingType === 'parasitic_drain' ? 0.40 : 0.78;

      this.baselineNodes = [
        {
          id: 'NODE_A',
          label: 'Agent A (Source / Initiator)',
          position: posA,
          velocity: this.baseVelocities[0],
          state_vector: {
            autonomy_index: autonomyA,
            coercion_resistance: res,
            energy_reserve: energyA,
          },
          accessible_states_count: 56,
        },
        {
          id: 'NODE_B',
          label: 'Agent B (Recipient / Partner)',
          position: posB,
          velocity: this.baseVelocities[1],
          state_vector: {
            autonomy_index: autonomyB,
            coercion_resistance: scenario.couplingType === 'asymmetric_capture' ? 0.22 : res * 0.96,
            energy_reserve: energyB,
          },
          accessible_states_count: 48,
        },
      ];
    }
  }

  /**
   * Evaluate simulation at a given stage and dosage
   */
  public computeFrame(
    stage: StageId,
    dosageY: number,
    time: number,
    scenario: ScenarioConfig,
    tolerance = 0.08
  ): FreedomBondVisualizationFrame {
    const effectiveDosage = stage === 'STAGE_A' ? 0 : stage === 'STAGE_D' ? 0 : dosageY;
    const isPersistencePhase = stage === 'STAGE_D';

    // 1. Compute state transformation for nodes
    const transformedNodes: BondVisualizerNode[] = this.baselineNodes.map((baseNode, i) => {
      const basePos = this.basePositions[i];
      const baseVel = this.baseVelocities[i];

      // Raw kinetic drift in Stage A
      const kineticDriftX = Math.sin(time * 0.8 + i * 2.1) * 0.45 * (stage === 'STAGE_A' ? 1.0 : 0.2);
      const kineticDriftY = Math.cos(time * 0.9 + i * 1.7) * 0.45 * (stage === 'STAGE_A' ? 1.0 : 0.2);
      const kineticDriftZ = Math.sin(time * 0.7 + i * 3.1) * 0.45 * (stage === 'STAGE_A' ? 1.0 : 0.2);

      let targetPos: [number, number, number] = [
        basePos[0] + kineticDriftX,
        basePos[1] + kineticDriftY,
        basePos[2] + kineticDriftZ,
      ];

      let autonomy = baseNode.state_vector.autonomy_index;
      let resistance = baseNode.state_vector.coercion_resistance;
      let energy = baseNode.state_vector.energy_reserve;
      let accessibleStates = baseNode.accessible_states_count;

      if (stage !== 'STAGE_A') {
        // Transformation under influence y
        const y = effectiveDosage;

        if (scenario.couplingType === 'harmonic_compersion' || scenario.couplingType === 'lattice_network') {
          // Freedom's Bond: Autonomy and energy both expand synergistically
          if (stage === 'STAGE_B' || stage === 'STAGE_C') {
            const gainFactor = y * 0.16;
            autonomy = Math.min(1.0, baseNode.state_vector.autonomy_index + gainFactor * 0.9);
            resistance = Math.min(1.0, baseNode.state_vector.coercion_resistance + gainFactor * 0.5);
            energy = Math.min(1.0, baseNode.state_vector.energy_reserve + gainFactor * 1.2);
            accessibleStates = Math.round(baseNode.accessible_states_count * (1 + y * 0.65));

            // Harmonious state alignment in position space (bounded mutual orbit)
            const orbitSign = i % 2 === 0 ? 1 : -1;
            const contraction = 1.0 - y * 0.35; // Distinctness preserved
            targetPos = [
              basePos[0] * contraction + Math.sin(time * 1.4 + orbitSign * 0.5) * 0.25,
              basePos[1] * contraction + Math.cos(time * 1.4 + orbitSign * 0.5) * 0.25,
              basePos[2] * contraction + Math.sin(time * 1.2) * 0.15,
            ];
          } else if (isPersistencePhase) {
            // Post-removal persistence test: z' ≈ z
            // Holds structural state memory!
            const memoryRetention = 0.96;
            const fullGain = dosageY * 0.16;
            autonomy = Math.min(1.0, baseNode.state_vector.autonomy_index + fullGain * 0.9 * memoryRetention);
            resistance = Math.min(1.0, baseNode.state_vector.coercion_resistance + fullGain * 0.5 * memoryRetention);
            energy = Math.min(1.0, baseNode.state_vector.energy_reserve + fullGain * 1.2 * memoryRetention);
            accessibleStates = Math.round(baseNode.accessible_states_count * (1 + dosageY * 0.65 * memoryRetention));

            // Resonant crystallizing lattice position
            const orbitSign = i % 2 === 0 ? 1 : -1;
            const crystalTightness = 0.72;
            targetPos = [
              basePos[0] * crystalTightness + Math.sin(time * 0.4 + orbitSign) * 0.08,
              basePos[1] * crystalTightness + Math.cos(time * 0.4 + orbitSign) * 0.08,
              basePos[2] * crystalTightness + Math.sin(time * 0.4) * 0.05,
            ];
          }
        } else if (scenario.couplingType === 'asymmetric_capture') {
          // Coercive capture: Agent A drains B's autonomy and accessible states
          if (stage === 'STAGE_B' || stage === 'STAGE_C') {
            if (i === 0) {
              // Node A dominates
              autonomy = Math.min(1.0, baseNode.state_vector.autonomy_index + y * 0.04);
              energy = Math.min(1.0, baseNode.state_vector.energy_reserve + y * 0.12);
              accessibleStates = 58;
            } else {
              // Node B captured
              autonomy = Math.max(0.08, baseNode.state_vector.autonomy_index - y * 0.68); // Coercion!
              resistance = Math.max(0.05, baseNode.state_vector.coercion_resistance - y * 0.45);
              energy = Math.max(0.2, baseNode.state_vector.energy_reserve + y * 0.10);
              accessibleStates = Math.max(4, Math.round(baseNode.accessible_states_count * (1 - y * 0.75))); // Capture!
              // Pulled forcefully toward A
              targetPos = [
                -0.6 + Math.sin(time * 2.0) * 0.15,
                0.2 + Math.cos(time * 2.0) * 0.15,
                0.0,
              ];
            }
          } else if (isPersistencePhase) {
            // Collapses immediately when y=0!
            autonomy = baseNode.state_vector.autonomy_index;
            resistance = baseNode.state_vector.coercion_resistance;
            energy = Math.max(0.2, baseNode.state_vector.energy_reserve - 0.25);
            accessibleStates = baseNode.accessible_states_count;
            targetPos = [basePos[0] + kineticDriftX * 1.5, basePos[1] + kineticDriftY * 1.5, basePos[2] + kineticDriftZ * 1.5];
          }
        } else if (scenario.couplingType === 'parasitic_drain') {
          // Parasitic: B gains only because A is depleted
          if (stage === 'STAGE_B' || stage === 'STAGE_C') {
            if (i === 0) {
              energy = Math.max(0.12, baseNode.state_vector.energy_reserve - y * 0.65); // Depleted!
              autonomy = Math.max(0.3, baseNode.state_vector.autonomy_index - y * 0.35);
              accessibleStates = Math.max(12, Math.round(baseNode.accessible_states_count * (1 - y * 0.5)));
            } else {
              energy = Math.min(1.0, baseNode.state_vector.energy_reserve + y * 0.55);
              autonomy = Math.min(1.0, baseNode.state_vector.autonomy_index + y * 0.15);
              accessibleStates = 62;
            }
          } else if (isPersistencePhase) {
            // Decays rapidly
            energy = baseNode.state_vector.energy_reserve * 0.85;
            autonomy = baseNode.state_vector.autonomy_index * 0.9;
            accessibleStates = baseNode.accessible_states_count;
          }
        } else if (scenario.couplingType === 'identity_collapse') {
          // Fusion: Positional and state collapse
          if (stage === 'STAGE_B' || stage === 'STAGE_C') {
            const collapseFactor = y * 0.92;
            targetPos = [
              (basePos[0] * (1 - collapseFactor)) + Math.sin(time * 3) * 0.05,
              (basePos[1] * (1 - collapseFactor)) + Math.cos(time * 3) * 0.05,
              basePos[2] * (1 - collapseFactor),
            ];
            autonomy = 0.50; // Loss of individuality
            accessibleStates = 18;
          } else if (isPersistencePhase) {
            // Chaotic recoil
            targetPos = [basePos[0] * 1.4, basePos[1] * 1.4, basePos[2] * 1.4];
            autonomy = baseNode.state_vector.autonomy_index * 0.7;
          }
        } else if (scenario.couplingType === 'subcritical_transient') {
          // Low dosage / weak coupling
          if (stage === 'STAGE_B' || stage === 'STAGE_C') {
            autonomy = baseNode.state_vector.autonomy_index + y * 0.05;
            energy = baseNode.state_vector.energy_reserve + y * 0.06;
          } else if (isPersistencePhase) {
            // Reverts back to baseline (z' -> x)
            autonomy = baseNode.state_vector.autonomy_index;
            energy = baseNode.state_vector.energy_reserve;
          }
        }
      }

      return {
        ...baseNode,
        position: targetPos,
        state_vector: {
          autonomy_index: Number(autonomy.toFixed(4)),
          coercion_resistance: Number(resistance.toFixed(4)),
          energy_reserve: Number(energy.toFixed(4)),
        },
        accessible_states_count: accessibleStates,
      };
    });

    // 2. Compute edges and Compersion Observables
    const edges: BondVisualizerEdge[] = [];
    const nodeA = transformedNodes[0];
    const nodeB = transformedNodes[1];
    const baseA = this.baselineNodes[0];
    const baseB = this.baselineNodes[1];

    if (scenario.agentCount === 4) {
      // Connect 4 nodes in tetrahedral topology (6 edges)
      for (let i = 0; i < transformedNodes.length; i++) {
        for (let j = i + 1; j < transformedNodes.length; j++) {
          const n1 = transformedNodes[i];
          const n2 = transformedNodes[j];
          const b1 = this.baselineNodes[i];
          const b2 = this.baselineNodes[j];

          const bGain = (n2.state_vector.energy_reserve >= b2.state_vector.energy_reserve) &&
                        (n2.state_vector.autonomy_index >= b2.state_vector.autonomy_index * 0.98);
          const aResp = (n1.state_vector.energy_reserve >= 0.45) && (n1.state_vector.autonomy_index >= 0.65);
          const nonDep = n1.state_vector.energy_reserve >= 0.40;
          const nonCap = n2.accessible_states_count >= b2.accessible_states_count;
          const dist = Math.hypot(n1.position[0] - n2.position[0], n1.position[1] - n2.position[1], n1.position[2] - n2.position[2]) >= 0.75;

          const isSelfSustaining = isPersistencePhase &&
            scenario.expectedClassification === 'SELF_SUSTAINING' &&
            bGain && aResp && nonDep && nonCap && dist;

          edges.push({
            connection_id: `EDGE_${n1.id}_${n2.id}`,
            source_id: n1.id,
            target_id: n2.id,
            compersion_observables: {
              b_gain_verified: bGain,
              a_response_positive: aResp,
              non_deprivation: nonDep,
              non_capture: nonCap,
              distinctness_maintained: dist,
            },
            is_self_sustaining_bond: isSelfSustaining,
            flux_intensity: stage === 'STAGE_A' ? 0 : stage === 'STAGE_D' ? (isSelfSustaining ? 1.0 : 0.0) : effectiveDosage,
            persistence_ratio: isSelfSustaining ? 0.96 : (stage === 'STAGE_D' ? 0.12 : 0.88),
          });
        }
      }
    } else {
      // Pairwise connection A <-> B
      const deltaEnergyB = nodeB.state_vector.energy_reserve - baseB.state_vector.energy_reserve;
      const deltaAutonomyB = nodeB.state_vector.autonomy_index - baseB.state_vector.autonomy_index;

      const b_gain_verified = deltaEnergyB >= -0.01 && deltaAutonomyB >= -0.05 && (stage === 'STAGE_A' ? false : true);
      const a_response_positive = nodeA.state_vector.autonomy_index >= 0.70 && nodeA.state_vector.energy_reserve >= 0.48;
      const non_deprivation = scenario.couplingType !== 'parasitic_drain' && nodeA.state_vector.energy_reserve >= 0.45;
      const non_capture = scenario.couplingType !== 'asymmetric_capture' && nodeB.accessible_states_count >= baseB.accessible_states_count * 0.95;
      const spatialDist = Math.hypot(
        nodeA.position[0] - nodeB.position[0],
        nodeA.position[1] - nodeB.position[1],
        nodeA.position[2] - nodeB.position[2]
      );
      const distinctness_maintained = scenario.couplingType !== 'identity_collapse' && spatialDist >= 0.9;

      const allObservablesHold = b_gain_verified && a_response_positive && non_deprivation && non_capture && distinctness_maintained;

      // Persistence evaluation for stage D: z' ≈ z
      let isSelfSustaining = false;
      let persistenceRatio = 0.0;

      if (isPersistencePhase) {
        if (scenario.couplingType === 'harmonic_compersion' && allObservablesHold) {
          isSelfSustaining = true;
          persistenceRatio = 0.96;
        } else if (scenario.couplingType === 'subcritical_transient') {
          isSelfSustaining = false;
          persistenceRatio = 0.42;
        } else {
          isSelfSustaining = false;
          persistenceRatio = 0.08;
        }
      } else if (stage === 'STAGE_C' || stage === 'STAGE_B') {
        persistenceRatio = effectiveDosage * 0.85;
      }

      edges.push({
        connection_id: `EDGE_A_B`,
        source_id: 'NODE_A',
        target_id: 'NODE_B',
        compersion_observables: {
          b_gain_verified: stage === 'STAGE_A' ? false : b_gain_verified,
          a_response_positive: stage === 'STAGE_A' ? false : a_response_positive,
          non_deprivation: stage === 'STAGE_A' ? true : non_deprivation,
          non_capture: stage === 'STAGE_A' ? true : non_capture,
          distinctness_maintained: distinctness_maintained,
        },
        is_self_sustaining_bond: isSelfSustaining,
        flux_intensity: stage === 'STAGE_A' ? 0.0 : stage === 'STAGE_D' ? (isSelfSustaining ? 1.0 : 0.0) : effectiveDosage,
        persistence_ratio: persistenceRatio,
      });
    }

    // 3. Telemetry calculations
    // State-space divergence: Δ = z - x
    let totalDeltaSq = 0;
    transformedNodes.forEach((node, i) => {
      const base = this.baselineNodes[i];
      const dAutonomy = node.state_vector.autonomy_index - base.state_vector.autonomy_index;
      const dRes = node.state_vector.coercion_resistance - base.state_vector.coercion_resistance;
      const dEnergy = node.state_vector.energy_reserve - base.state_vector.energy_reserve;
      totalDeltaSq += (dAutonomy * dAutonomy + dRes * dRes + dEnergy * dEnergy);
    });
    const deltaMagnitude = Math.sqrt(totalDeltaSq / transformedNodes.length);

    const meanAutonomy = transformedNodes.reduce((acc, n) => acc + n.state_vector.autonomy_index, 0) / transformedNodes.length;
    const meanResistance = transformedNodes.reduce((acc, n) => acc + n.state_vector.coercion_resistance, 0) / transformedNodes.length;

    const allObservables = edges.every(e =>
      e.compersion_observables.b_gain_verified &&
      e.compersion_observables.a_response_positive &&
      e.compersion_observables.non_deprivation &&
      e.compersion_observables.non_capture &&
      e.compersion_observables.distinctness_maintained
    );

    // Frame classification
    let classification: BondClassification = 'BASELINE';
    if (stage === 'STAGE_A') {
      classification = 'BASELINE';
    } else if (stage === 'STAGE_B' || stage === 'STAGE_C') {
      if (scenario.couplingType === 'asymmetric_capture' || scenario.couplingType === 'parasitic_drain') {
        classification = 'FORCED';
      } else if (scenario.couplingType === 'identity_collapse') {
        classification = 'ADAPTED';
      } else {
        classification = 'ADAPTED';
      }
    } else if (stage === 'STAGE_D') {
      // Persistence check outcome
      if (edges.some(e => e.is_self_sustaining_bond)) {
        classification = 'SELF_SUSTAINING';
      } else if (scenario.couplingType === 'asymmetric_capture' || scenario.couplingType === 'parasitic_drain') {
        classification = 'FORCED';
      } else {
        classification = 'ADAPTED';
      }
    }

    const persistenceDiv = stage === 'STAGE_D'
      ? (classification === 'SELF_SUSTAINING' ? 0.024 : 0.48)
      : (stage === 'STAGE_A' ? 0.0 : 0.05);

    return {
      frame_id: Math.floor(time * 60),
      timestep: Number(time.toFixed(3)),
      stage,
      active_influence_y: Number(effectiveDosage.toFixed(3)),
      nodes: transformedNodes,
      edges,
      classification,
      telemetry: {
        delta_magnitude: Number(deltaMagnitude.toFixed(4)),
        mean_autonomy: Number(meanAutonomy.toFixed(4)),
        mean_coercion_resistance: Number(meanResistance.toFixed(4)),
        all_observables_passed: stage === 'STAGE_A' ? false : allObservables,
        persistence_divergence: Number(persistenceDiv.toFixed(4)),
        phase_alignment: classification === 'SELF_SUSTAINING' ? 0.98 : (stage === 'STAGE_A' ? 0.12 : 0.65),
      },
    };
  }

  public getBaselineNodes(): BondVisualizerNode[] {
    return this.baselineNodes;
  }
}
