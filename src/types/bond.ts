/**
 * AEILORIA.CORE // VISUALIZATION ENGINE STATE SPECIFICATION
 * Renders the transformation test chamber (z = F(x,y)) for Freedom's Bond.
 */

export interface BondVisualizerNode {
  readonly id: string;
  readonly label?: string;
  readonly position: [number, number, number]; // [X, Y, Z] spatial / state coordinates
  readonly velocity?: [number, number, number];
  readonly state_vector: {
    autonomy_index: number;      // [0, 1] - measure of unconstrained sovereign choice
    coercion_resistance: number; // [0, 1] - resistance against unilateral capture
    energy_reserve: number;      // [0, 1] - vitality / operational capacity
  };
  readonly accessible_states_count: number; // |S(x)| cardinality of viable state configurations
}

export interface BondVisualizerEdge {
  readonly connection_id: string;
  readonly source_id: string;
  readonly target_id: string;
  readonly compersion_observables: {
    b_gain_verified: boolean;         // ΔE_B > 0 & ΔAutonomy_B ≥ 0
    a_response_positive: boolean;     // Mutual resonant affirmation without resentment
    non_deprivation: boolean;         // Source agent E_A remains protected / non-depleted
    non_capture: boolean;             // No trapping; rank(S) preserved, free escape paths
    distinctness_maintained: boolean; // ||z_A - z_B|| ≥ r_min, no identity enmeshment
  };
  readonly is_self_sustaining_bond: boolean; // True if z' ≈ z after y removal (Freedom's Bond ⧆)
  readonly flux_intensity: number;           // Current energetic flux on the link [0, 1]
  readonly persistence_ratio: number;        // Metric of structural memory [0, 1]
}

export type BondClassification = 'FORCED' | 'ADAPTED' | 'SELF_SUSTAINING' | 'BASELINE';

export type StageId = 'STAGE_A' | 'STAGE_B' | 'STAGE_C' | 'STAGE_D';

export interface FreedomBondVisualizationFrame {
  readonly frame_id: number;
  readonly timestep: number;
  readonly stage: StageId;
  readonly active_influence_y: number; // Dosage: 0.0 to 1.0
  readonly nodes: BondVisualizerNode[];
  readonly edges: BondVisualizerEdge[];
  readonly classification: BondClassification;
  readonly telemetry: {
    delta_magnitude: number;              // ||z - x||
    mean_autonomy: number;
    mean_coercion_resistance: number;
    all_observables_passed: boolean;
    persistence_divergence: number;       // ||z' - z||
    phase_alignment: number;              // Coherence index [0, 1]
  };
}

export interface ScenarioConfig {
  id: string;
  name: string;
  tag: string;
  description: string;
  agentCount: number;
  initialDosage: number;
  expectedClassification: BondClassification;
  intrinsicCoercionResistance: number;
  couplingType: 'harmonic_compersion' | 'asymmetric_capture' | 'parasitic_drain' | 'identity_collapse' | 'subcritical_transient' | 'lattice_network';
}
