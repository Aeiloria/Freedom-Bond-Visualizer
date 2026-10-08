/**
 * AEILORIA.CORE // BOND CANVAS 3D
 * Topological state-space rendering engine:
 * - Neutral grey-blue baseline nodes & kinetic trajectories (x)
 * - Amber-gold flux lines & dynamic particles for applied V1 (y)
 * - Iridescent cyan-white crystal lattice for Freedom's Bond (⧆) when z' ≈ z
 * - Dashed grey collapsing trace for Forced State collapse
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BondVisualizerNode, BondVisualizerEdge, StageId, BondClassification } from '../types/bond';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Compass } from 'lucide-react';

interface BondCanvas3DProps {
  nodes: BondVisualizerNode[];
  edges: BondVisualizerEdge[];
  baselineNodes: BondVisualizerNode[];
  stage: StageId;
  activeDosageY: number;
  classification: BondClassification;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  selectedEdgeId: string | null;
  onSelectEdge: (edgeId: string | null) => void;
  showDeltaVectors: boolean;
  viewMode: 'topological' | 'state_space';
}

interface Particle {
  t: number; // 0 to 1 along edge
  speed: number;
  offsetAngle: number;
  radius: number;
}

// 3D Projection math (pure static function)
const projectPoint = (
  pos: [number, number, number],
  width: number,
  height: number,
  currentYaw: number,
  currentPitch: number,
  currentZoom: number
): { screenX: number; screenY: number; depth: number } => {
  // Rotation around Y (yaw)
  const cosY = Math.cos(currentYaw);
  const sinY = Math.sin(currentYaw);
  const x1 = pos[0] * cosY - pos[2] * sinY;
  const z1 = pos[0] * sinY + pos[2] * cosY;

  // Rotation around X (pitch)
  const cosP = Math.cos(currentPitch);
  const sinP = Math.sin(currentPitch);
  const y2 = pos[1] * cosP - z1 * sinP;
  const z2 = pos[1] * sinP + z1 * cosP;

  // Perspective projection
  const cameraDistance = 9.0;
  const fov = 520 * currentZoom;
  const zDepth = cameraDistance + z2;
  const scale = fov / Math.max(1.0, zDepth);

  const screenX = width / 2 + x1 * scale;
  const screenY = height / 2 - y2 * scale; // Invert Y for screen

  return { screenX, screenY, depth: zDepth };
};

export const BondCanvas3D: React.FC<BondCanvas3DProps> = ({
  nodes,
  edges,
  baselineNodes,
  stage,
  activeDosageY,
  classification,
  selectedNodeId,
  onSelectNode,
  selectedEdgeId,
  onSelectEdge,
  showDeltaVectors,
  viewMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synchronize latest props in a ref for 60fps render loop without triggering effect re-runs
  const propsRef = useRef({
    nodes,
    edges,
    baselineNodes,
    stage,
    activeDosageY,
    classification,
    selectedNodeId,
    selectedEdgeId,
    showDeltaVectors,
    viewMode,
  });
  propsRef.current = {
    nodes,
    edges,
    baselineNodes,
    stage,
    activeDosageY,
    classification,
    selectedNodeId,
    selectedEdgeId,
    showDeltaVectors,
    viewMode,
  };

  // Camera state refs for smooth 60fps rendering without React re-renders
  const yawRef = useRef<number>(0.55);
  const pitchRef = useRef<number>(0.32);
  const zoomRef = useRef<number>(1.0);
  const isDraggingRef = useRef<boolean>(false);
  const isAutoRotateRef = useRef<boolean>(true);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Animated flame ember particles along flux lines
  const particlesRef = useRef<Particle[]>(
    Array.from({ length: 48 }, () => ({
      t: Math.random(),
      speed: 0.007 + Math.random() * 0.010,
      offsetAngle: Math.random() * Math.PI * 2,
      radius: 0.15 + Math.random() * 0.35,
    }))
  );

  // Ambient thermal embers floating through test chamber
  const ambientEmbersRef = useRef(
    Array.from({ length: 36 }, () => ({
      x: (Math.random() - 0.5) * 7,
      y: -2.2 + Math.random() * 4.4,
      z: (Math.random() - 0.5) * 7,
      speedY: 0.006 + Math.random() * 0.012,
      driftPhase: Math.random() * Math.PI * 2,
      size: 1.2 + Math.random() * 2.2,
      isFire: Math.random() > 0.35,
    }))
  );

  // Iridescent pulse phase
  const animTimeRef = useRef<number>(0);

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    isAutoRotateRef.current = false;
    setIsAutoRotate(false);
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    // Node hit testing
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check click on nodes
    let clickedNodeId: string | null = null;
    projectedNodesRef.current.forEach(({ id, screenX, screenY, radius }) => {
      const dist = Math.hypot(mouseX - screenX, mouseY - screenY);
      if (dist <= radius + 8) {
        clickedNodeId = id;
      }
    });

    if (clickedNodeId) {
      onSelectNode(clickedNodeId);
      onSelectEdge(null);
    } else {
      // Check click on edges
      let clickedEdgeId: string | null = null;
      projectedEdgesRef.current.forEach(({ id, x1, y1, x2, y2 }) => {
        // Distance from point to segment
        const d = distToSegment(mouseX, mouseY, x1, y1, x2, y2);
        if (d < 14) {
          clickedEdgeId = id;
        }
      });
      if (clickedEdgeId) {
        onSelectEdge(clickedEdgeId);
        onSelectNode(null);
      } else {
        onSelectNode(null);
        onSelectEdge(null);
      }
    }
  };

  const distToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    yawRef.current += dx * 0.008;
    pitchRef.current = Math.max(-1.4, Math.min(1.4, pitchRef.current + dy * 0.008));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    zoomRef.current = Math.max(0.45, Math.min(2.8, zoomRef.current * zoomFactor));
  };

  const resetView = () => {
    yawRef.current = 0.55;
    pitchRef.current = 0.32;
    zoomRef.current = 1.0;
    isAutoRotateRef.current = false;
    setIsAutoRotate(false);
  };

  // References for click hit testing
  const projectedNodesRef = useRef<{ id: string; screenX: number; screenY: number; radius: number }[]>([]);
  const projectedEdgesRef = useRef<{ id: string; x1: number; y1: number; x2: number; y2: number }[]>([]);

  // Render loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animTimeRef.current += 0.016;
      const animTime = animTimeRef.current;

      const {
        nodes,
        edges,
        baselineNodes,
        stage,
        activeDosageY,
        classification,
        selectedNodeId,
        selectedEdgeId,
        showDeltaVectors,
        viewMode,
      } = propsRef.current;

      if (isAutoRotateRef.current && !isDraggingRef.current) {
        yawRef.current += 0.0035;
      }

      const curYaw = yawRef.current;
      const curPitch = pitchRef.current;
      const curZoom = zoomRef.current;

      // Handle retina resolution
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

      // 1. Clear background - deep cosmic ether obsidian
      ctx.fillStyle = '#08040d';
      ctx.fillRect(0, 0, width, height);

      // Vibrant Fire & Ether radial backdrop glow
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, Math.max(width, height) * 0.75);
      if (classification === 'SELF_SUSTAINING') {
        // Synthesis: electric purple & cyan aura with warm fire heart
        bgGrad.addColorStop(0, 'rgba(168, 85, 247, 0.24)');
        bgGrad.addColorStop(0.35, 'rgba(34, 211, 238, 0.14)');
        bgGrad.addColorStop(0.65, 'rgba(249, 115, 22, 0.09)');
        bgGrad.addColorStop(1, 'rgba(8, 4, 13, 1)');
      } else if (stage === 'STAGE_B' || stage === 'STAGE_C') {
        // Radiant fire furnace & ember heat
        bgGrad.addColorStop(0, 'rgba(249, 115, 22, 0.24)');
        bgGrad.addColorStop(0.4, 'rgba(239, 68, 68, 0.14)');
        bgGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.08)');
        bgGrad.addColorStop(1, 'rgba(8, 4, 13, 1)');
      } else {
        // Ethereal electric violet / cyan baseline aura
        bgGrad.addColorStop(0, 'rgba(147, 51, 234, 0.18)');
        bgGrad.addColorStop(0.45, 'rgba(34, 211, 238, 0.08)');
        bgGrad.addColorStop(1, 'rgba(8, 4, 13, 1)');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 1.5 Render floating ambient thermal embers
      ambientEmbersRef.current.forEach(ember => {
        ember.y += ember.speedY;
        if (ember.y > 2.6) {
          ember.y = -2.2;
          ember.x = (Math.random() - 0.5) * 7;
          ember.z = (Math.random() - 0.5) * 7;
        }
        const driftX = Math.sin(animTime * 1.5 + ember.driftPhase) * 0.08;
        const emberProj = projectPoint([ember.x + driftX, ember.y, ember.z], width, height, curYaw, curPitch, curZoom);
        if (emberProj.depth > 1) {
          const alpha = Math.min(0.85, Math.max(0.15, ((2.6 - ember.y) / 4.8) * 0.9));
          ctx.beginPath();
          ctx.arc(emberProj.screenX, emberProj.screenY, ember.size * Math.max(0.5, 9 / emberProj.depth), 0, Math.PI * 2);
          if (ember.isFire) {
            ctx.fillStyle = `rgba(251, 146, 60, ${alpha})`;
            ctx.shadowColor = '#f97316';
            ctx.shadowBlur = 6;
          } else {
            ctx.fillStyle = `rgba(192, 132, 252, ${alpha})`;
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 6;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // 2. Render Test Chamber Grid & Boundary Cage (Ethereal purple & flame accents)
      const chamberSize = 3.6;
      const gridSteps = 4;
      const floorY = -2.2;

      // Floor grid lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.22)';

      for (let i = -gridSteps; i <= gridSteps; i++) {
        const offset = (i / gridSteps) * chamberSize;
        // Lines parallel to Z
        const p1 = projectPoint([-chamberSize, floorY, offset], width, height, curYaw, curPitch, curZoom);
        const p2 = projectPoint([chamberSize, floorY, offset], width, height, curYaw, curPitch, curZoom);
        ctx.beginPath();
        ctx.moveTo(p1.screenX, p1.screenY);
        ctx.lineTo(p2.screenX, p2.screenY);
        ctx.stroke();

        // Lines parallel to X
        const q1 = projectPoint([offset, floorY, -chamberSize], width, height, curYaw, curPitch, curZoom);
        const q2 = projectPoint([offset, floorY, chamberSize], width, height, curYaw, curPitch, curZoom);
        ctx.beginPath();
        ctx.moveTo(q1.screenX, q1.screenY);
        ctx.lineTo(q2.screenX, q2.screenY);
        ctx.stroke();
      }

      // Chamber Bounding Frame (Electric violet & flame warmth)
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.3)';
      ctx.setLineDash([3, 4]);
      const corners: [number, number, number][] = [
        [-chamberSize, -chamberSize * 0.7, -chamberSize],
        [chamberSize, -chamberSize * 0.7, -chamberSize],
        [chamberSize, -chamberSize * 0.7, chamberSize],
        [-chamberSize, -chamberSize * 0.7, chamberSize],
        [-chamberSize, chamberSize * 0.7, -chamberSize],
        [chamberSize, chamberSize * 0.7, -chamberSize],
        [chamberSize, chamberSize * 0.7, chamberSize],
        [-chamberSize, chamberSize * 0.7, chamberSize],
      ];
      const pCorners = corners.map(c => projectPoint(c, width, height, curYaw, curPitch, curZoom));

      // Draw bottom square
      ctx.beginPath();
      ctx.moveTo(pCorners[0].screenX, pCorners[0].screenY);
      for (let i = 1; i < 4; i++) ctx.lineTo(pCorners[i].screenX, pCorners[i].screenY);
      ctx.closePath();
      ctx.stroke();

      // Draw top square
      ctx.beginPath();
      ctx.moveTo(pCorners[4].screenX, pCorners[4].screenY);
      for (let i = 5; i < 8; i++) ctx.lineTo(pCorners[i].screenX, pCorners[i].screenY);
      ctx.closePath();
      ctx.stroke();

      // Vertical pillars
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(pCorners[i].screenX, pCorners[i].screenY);
        ctx.lineTo(pCorners[i + 4].screenX, pCorners[i + 4].screenY);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Chamber Origin & Coordinate Axis Indicators (Fire & Ether Palette)
      const originP = projectPoint([0, 0, 0], width, height, curYaw, curPitch, curZoom);
      const axisLen = 1.2;
      const xAxisP = projectPoint([axisLen, 0, 0], width, height, curYaw, curPitch, curZoom);
      const yAxisP = projectPoint([0, axisLen, 0], width, height, curYaw, curPitch, curZoom);
      const zAxisP = projectPoint([0, 0, axisLen], width, height, curYaw, curPitch, curZoom);

      ctx.lineWidth = 1.4;
      // X axis (Autonomy - Warm Flame Orange/Red)
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.85)';
      ctx.beginPath();
      ctx.moveTo(originP.screenX, originP.screenY);
      ctx.lineTo(xAxisP.screenX, xAxisP.screenY);
      ctx.stroke();
      ctx.font = 'bold 9px JetBrains Mono';
      ctx.fillStyle = '#fb923c';
      ctx.fillText(viewMode === 'state_space' ? 'Autonomy (Fire)' : 'X', xAxisP.screenX + 4, xAxisP.screenY);

      // Y axis (Resistance - Ethereal Electric Purple)
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.85)';
      ctx.beginPath();
      ctx.moveTo(originP.screenX, originP.screenY);
      ctx.lineTo(yAxisP.screenX, yAxisP.screenY);
      ctx.stroke();
      ctx.fillStyle = '#c084fc';
      ctx.fillText(viewMode === 'state_space' ? 'Resistance (Ether)' : 'Y', yAxisP.screenX + 4, yAxisP.screenY);

      // Z axis (Energy - Luminous Ethereal Cyan)
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)';
      ctx.beginPath();
      ctx.moveTo(originP.screenX, originP.screenY);
      ctx.lineTo(zAxisP.screenX, zAxisP.screenY);
      ctx.stroke();
      ctx.fillStyle = '#22d3ee';
      ctx.fillText(viewMode === 'state_space' ? 'Energy (Cyan)' : 'Z', zAxisP.screenX + 4, zAxisP.screenY);

      // 3. Project current and baseline nodes
      const projectedNodes = nodes.map(n => {
        let pos = n.position;
        if (viewMode === 'state_space') {
          // Map state vectors [Autonomy, Resistance, Energy] into centered 3D space
          pos = [
            (n.state_vector.autonomy_index - 0.5) * 4.2,
            (n.state_vector.coercion_resistance - 0.5) * 4.2,
            (n.state_vector.energy_reserve - 0.5) * 4.2,
          ];
        }
        const proj = projectPoint(pos, width, height, curYaw, curPitch, curZoom);
        return {
          ...n,
          screenX: proj.screenX,
          screenY: proj.screenY,
          depth: proj.depth,
          radius: 12 * Math.max(0.6, (12 / proj.depth) * curZoom),
        };
      });

      // Cache for click testing
      projectedNodesRef.current = projectedNodes.map(n => ({
        id: n.id,
        screenX: n.screenX,
        screenY: n.screenY,
        radius: n.radius,
      }));

      // Project baseline nodes for Delta vector rendering
      const projectedBaselines = baselineNodes.map(bn => {
        let bpos = bn.position;
        if (viewMode === 'state_space') {
          bpos = [
            (bn.state_vector.autonomy_index - 0.5) * 4.2,
            (bn.state_vector.coercion_resistance - 0.5) * 4.2,
            (bn.state_vector.energy_reserve - 0.5) * 4.2,
          ];
        }
        return projectPoint(bpos, width, height, curYaw, curPitch, curZoom);
      });

      // 4. Render Delta Vectors (Δ = z - x)
      if (showDeltaVectors && stage !== 'STAGE_A') {
        projectedNodes.forEach((node, idx) => {
          const baseProj = projectedBaselines[idx];
          if (!baseProj) return;

          // Dotted baseline node anchor (Electric purple)
          ctx.beginPath();
          ctx.arc(baseProj.screenX, baseProj.screenY, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(192, 132, 252, 0.5)';
          ctx.fill();

          // Vector displacement line (Luminous cyan)
          ctx.beginPath();
          ctx.setLineDash([2, 3]);
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)';
          ctx.lineWidth = 1.6;
          ctx.moveTo(baseProj.screenX, baseProj.screenY);
          ctx.lineTo(node.screenX, node.screenY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Vector arrowhead (Incandescent flame orange)
          const dx = node.screenX - baseProj.screenX;
          const dy = node.screenY - baseProj.screenY;
          const angle = Math.atan2(dy, dx);
          const arrowLen = 7;
          ctx.beginPath();
          ctx.moveTo(node.screenX, node.screenY);
          ctx.lineTo(node.screenX - arrowLen * Math.cos(angle - Math.PI / 6), node.screenY - arrowLen * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(node.screenX - arrowLen * Math.cos(angle + Math.PI / 6), node.screenY - arrowLen * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fillStyle = '#f97316';
          ctx.shadowColor = '#ea580c';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Label: Δ (Flame amber with ether cyan highlight)
          ctx.font = 'bold 10px JetBrains Mono';
          ctx.fillStyle = '#fb923c';
          ctx.fillText(`Δ${node.id.replace('NODE_', '')}`, (baseProj.screenX + node.screenX) / 2 + 5, (baseProj.screenY + node.screenY) / 2 - 5);
        });
      }

      // 5. Render Edges (Interactions / Flux / Crystal Lattice / Forced Collapse)
      const cachedProjectedEdges: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];

      edges.forEach(edge => {
        const sourceNode = projectedNodes.find(n => n.id === edge.source_id);
        const targetNode = projectedNodes.find(n => n.id === edge.target_id);
        if (!sourceNode || !targetNode) return;

        cachedProjectedEdges.push({
          id: edge.connection_id,
          x1: sourceNode.screenX,
          y1: sourceNode.screenY,
          x2: targetNode.screenX,
          y2: targetNode.screenY,
        });

        const isSelected = selectedEdgeId === edge.connection_id;

        // Stage A: Baseline - independent agents (no edge or ultra faint trace)
        if (stage === 'STAGE_A') {
          ctx.beginPath();
          ctx.setLineDash([2, 6]);
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.15)';
          ctx.lineWidth = 1;
          ctx.moveTo(sourceNode.screenX, sourceNode.screenY);
          ctx.lineTo(targetNode.screenX, targetNode.screenY);
          ctx.stroke();
          ctx.setLineDash([]);
          return;
        }

        // Stage D: Post-Removal Persistence Check
        if (stage === 'STAGE_D') {
          if (edge.is_self_sustaining_bond) {
            // ==========================================
            // THE BOND (⧆): Iridescent Cyan-White Crystal Lattice Formation!
            // ==========================================
            renderCrystalLattice(
              ctx,
              sourceNode.screenX,
              sourceNode.screenY,
              targetNode.screenX,
              targetNode.screenY,
              animTime,
              isSelected
            );
          } else {
            // ==========================================
            // FORCED STATE: Collapses to dashed grey trace
            // ==========================================
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = isSelected ? 'rgba(203, 213, 225, 0.6)' : 'rgba(148, 163, 184, 0.35)';
            ctx.lineWidth = 1.8;
            ctx.moveTo(sourceNode.screenX, sourceNode.screenY);
            ctx.lineTo(targetNode.screenX, targetNode.screenY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Dissipating particles (indicating collapse)
            const collapsePhase = (animTime * 1.5) % 1;
            const px = sourceNode.screenX + (targetNode.screenX - sourceNode.screenX) * collapsePhase;
            const py = sourceNode.screenY + (targetNode.screenY - sourceNode.screenY) * collapsePhase;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
            ctx.fill();
          }
          return;
        }

        // Stage B or C: Applied Influence (y / V₁) - Amber-gold flux lines
        const fluxStrength = edge.flux_intensity;
        renderAmberGoldFlux(
          ctx,
          sourceNode.screenX,
          sourceNode.screenY,
          targetNode.screenX,
          targetNode.screenY,
          fluxStrength,
          animTime,
          isSelected
        );
      });

      projectedEdgesRef.current = cachedProjectedEdges;

      // 6. Render Nodes
      // Sort nodes by depth for correct painter's order
      const sortedNodes = [...projectedNodes].sort((a, b) => b.depth - a.depth);

      sortedNodes.forEach(node => {
        const isSelected = selectedNodeId === node.id;
        const radius = node.radius;

        // Ground shadow projection
        const groundY = -2.2;
        const groundPos = projectPoint([node.position[0], groundY, node.position[2]], width, height, curYaw, curPitch, curZoom);
        ctx.beginPath();
        ctx.ellipse(groundPos.screenX, groundPos.screenY, radius * 1.1, radius * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fill();

        // Drop line from node to ground
        ctx.beginPath();
        ctx.setLineDash([1, 4]);
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
        ctx.lineWidth = 1;
        ctx.moveTo(node.screenX, node.screenY);
        ctx.lineTo(groundPos.screenX, groundPos.screenY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Determine node styling based on state
        if (stage === 'STAGE_A') {
          // Neutral grey-blue vector node representing raw kinetic actor
          renderBaselineNode(ctx, node, radius, isSelected);
        } else if (stage === 'STAGE_D' && classification === 'SELF_SUSTAINING') {
          // Crystallized node with iridescent cyan halo
          renderCrystallizedNode(ctx, node, radius, animTime, isSelected);
        } else if (stage === 'STAGE_D' && classification === 'FORCED') {
          // Collapsed / exhausted node state
          renderForcedNode(ctx, node, radius, isSelected);
        } else {
          // Interactive / Transforming node (Stage B & C)
          renderActiveTransformingNode(ctx, node, radius, activeDosageY, animTime, isSelected);
        }

        // Label and autonomy indicator
        ctx.font = '11px JetBrains Mono';
        ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText(node.label || node.id, node.screenX, node.screenY - radius - 10);

        // Subtitle: Autonomy & Accessible States count
        ctx.font = '9px JetBrains Mono';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Aut: ${(node.state_vector.autonomy_index * 100).toFixed(0)}% · |S|: ${node.accessible_states_count}`, node.screenX, node.screenY + radius + 14);
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Helper renderers for Vibrant Fire & Ether Theme
  const renderBaselineNode = (
    ctx: CanvasRenderingContext2D,
    node: BondVisualizerNode & { screenX: number; screenY: number },
    radius: number,
    isSelected: boolean
  ) => {
    // Ethereal Electric Purple / Cyan Aura Node
    // Outer electric purple aura glow
    const auraRad = radius * 2.2;
    const auraGrad = ctx.createRadialGradient(node.screenX, node.screenY, radius * 0.4, node.screenX, node.screenY, auraRad);
    auraGrad.addColorStop(0, 'rgba(192, 132, 252, 0.45)');
    auraGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.22)');
    auraGrad.addColorStop(1, 'rgba(168, 85, 247, 0.0)');

    ctx.beginPath();
    ctx.arc(node.screenX, node.screenY, auraRad, 0, Math.PI * 2);
    ctx.fillStyle = auraGrad;
    ctx.fill();

    // Inner ethereal cyan resonance ring
    ctx.beginPath();
    ctx.arc(node.screenX, node.screenY, radius * 1.35, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Deep amethyst-violet celestial sphere
    const grad = ctx.createRadialGradient(node.screenX - radius * 0.35, node.screenY - radius * 0.35, radius * 0.1, node.screenX, node.screenY, radius);
    grad.addColorStop(0, '#f5d0fe');
    grad.addColorStop(0.3, '#c084fc');
    grad.addColorStop(0.7, '#7e22ce');
    grad.addColorStop(1, '#2e1065');

    ctx.beginPath();
    ctx.arc(node.screenX, node.screenY, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.lineWidth = isSelected ? 3 : 1.8;
    ctx.strokeStyle = isSelected ? '#ffffff' : '#e879f9';
    ctx.stroke();

    // Orbiting cyan ether mote
    const moteAngle = node.id.charCodeAt(node.id.length - 1) * 2;
    const moteDist = radius * 1.5;
    const mx = node.screenX + Math.cos(moteAngle) * moteDist;
    const my = node.screenY + Math.sin(moteAngle) * moteDist;
    ctx.beginPath();
    ctx.arc(mx, my, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = '#22d3ee';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const renderActiveTransformingNode = (
    ctx: CanvasRenderingContext2D,
    node: BondVisualizerNode & { screenX: number; screenY: number },
    radius: number,
    dosage: number,
    time: number,
    isSelected: boolean
  ) => {
    // Fire Ignition over Ether Core!
    // Outer flame heat corona
    const flameHaloRad = radius * (1.6 + dosage * 0.8);
    const flameGrad = ctx.createRadialGradient(node.screenX, node.screenY, radius * 0.5, node.screenX, node.screenY, flameHaloRad);
    flameGrad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
    flameGrad.addColorStop(0.3, 'rgba(249, 115, 22, 0.5)');
    flameGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.25)');
    flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

    ctx.beginPath();
    ctx.arc(node.screenX, node.screenY, flameHaloRad, 0, Math.PI * 2);
    ctx.fillStyle = flameGrad;
    ctx.fill();

    // Ethereal Electric Purple core fused with incandescent flame
    const grad = ctx.createRadialGradient(node.screenX - radius * 0.3, node.screenY - radius * 0.3, radius * 0.1, node.screenX, node.screenY, radius);
    grad.addColorStop(0, '#fff7ed');
    grad.addColorStop(0.35, '#fb923c');
    grad.addColorStop(0.7, '#c084fc');
    grad.addColorStop(1, '#4c1d95');

    ctx.beginPath();
    ctx.arc(node.screenX, node.screenY, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.lineWidth = isSelected ? 3.5 : 2.2;
    ctx.strokeStyle = isSelected ? '#ffffff' : '#fb923c';
    ctx.stroke();

    // Dual pulsation resonance rings: one flame orange, one electric purple/cyan
    const flameRingRad = radius * (1.3 + Math.sin(time * 4) * 0.18);
    ctx.beginPath();
    ctx.arc(node.screenX, node.screenY, flameRingRad, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.75)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    const etherRingRad = radius * (1.55 + Math.cos(time * 3.5) * 0.15);
    ctx.beginPath();
    ctx.arc(node.screenX, node.screenY, etherRingRad, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.55)';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const renderCrystallizedNode = (
    ctx: CanvasRenderingContext2D,
    node: BondVisualizerNode & { screenX: number; screenY: number },
    radius: number,
    time: number,
    isSelected: boolean
  ) => {
    // Ultimate synthesis: Ethereal Electric Purple/Cyan crystal lattice with warm ember corona
    const haloRad = radius * 2.5;
    const haloGrad = ctx.createRadialGradient(node.screenX, node.screenY, radius * 0.4, node.screenX, node.screenY, haloRad);
    haloGrad.addColorStop(0, 'rgba(254, 240, 138, 0.6)');
    haloGrad.addColorStop(0.3, 'rgba(192, 132, 252, 0.45)');
    haloGrad.addColorStop(0.65, 'rgba(34, 211, 238, 0.25)');
    haloGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

    ctx.beginPath();
    ctx.arc(node.screenX, node.screenY, haloRad, 0, Math.PI * 2);
    ctx.fillStyle = haloGrad;
    ctx.fill();

    // Octagonal faceted crystal outline
    const sides = 8;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + time * 0.3;
      const x = node.screenX + Math.cos(angle) * radius;
      const y = node.screenY + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Iridescent Fire & Ether gradient
    const crystalGrad = ctx.createLinearGradient(node.screenX - radius, node.screenY - radius, node.screenX + radius, node.screenY + radius);
    crystalGrad.addColorStop(0, '#ffffff');
    crystalGrad.addColorStop(0.25, '#fde047');
    crystalGrad.addColorStop(0.5, '#e879f9');
    crystalGrad.addColorStop(0.75, '#22d3ee');
    crystalGrad.addColorStop(1, '#9333ea');

    ctx.fillStyle = crystalGrad;
    ctx.fill();

    ctx.lineWidth = isSelected ? 3.5 : 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Star lattice cross inside
    ctx.beginPath();
    ctx.moveTo(node.screenX - radius * 0.65, node.screenY);
    ctx.lineTo(node.screenX + radius * 0.65, node.screenY);
    ctx.moveTo(node.screenX, node.screenY - radius * 0.65);
    ctx.lineTo(node.screenX, node.screenY + radius * 0.65);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  };

  const renderForcedNode = (
    ctx: CanvasRenderingContext2D,
    node: BondVisualizerNode & { screenX: number; screenY: number },
    radius: number,
    isSelected: boolean
  ) => {
    // Smoldering charcoal sphere with dying dark crimson ember ring
    const grad = ctx.createRadialGradient(node.screenX, node.screenY, radius * 0.2, node.screenX, node.screenY, radius);
    grad.addColorStop(0, '#44403c');
    grad.addColorStop(0.7, '#292524');
    grad.addColorStop(1, '#0c0a09');

    ctx.beginPath();
    ctx.arc(node.screenX, node.screenY, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.lineWidth = isSelected ? 2.5 : 1.2;
    ctx.strokeStyle = '#78716c';
    ctx.stroke();

    // Faint dying ember ring
    ctx.beginPath();
    ctx.arc(node.screenX, node.screenY, radius * 1.15, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const renderAmberGoldFlux = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    intensity: number,
    time: number,
    isSelected: boolean
  ) => {
    // Blazing Fire & Ether Conduit!
    // 1. Broad thermal radiant heat envelope
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `rgba(249, 115, 22, ${0.25 + intensity * 0.35})`;
    ctx.lineWidth = 14 + intensity * 12;
    ctx.stroke();

    // 2. Central incandescent flame carrier beam
    const fireBeamGrad = ctx.createLinearGradient(x1, y1, x2, y2);
    fireBeamGrad.addColorStop(0, '#ffffff');
    fireBeamGrad.addColorStop(0.2, '#fde047');
    fireBeamGrad.addColorStop(0.5, '#f97316');
    fireBeamGrad.addColorStop(0.8, '#ef4444');
    fireBeamGrad.addColorStop(1, '#ffffff');

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = fireBeamGrad;
    ctx.lineWidth = isSelected ? 4.5 : 2.5 + intensity * 2.5;
    ctx.stroke();

    // 3. Dual intertwined sinusoidal filaments: Filament 1 (Fire wave), Filament 2 (Ether wave)
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);

    const steps = 28;
    const amp = 16 * intensity;

    // Filament 1: Blazing gold/amber fire wave
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const wave = Math.sin(frac * Math.PI * 4 - time * 7) * amp * Math.sin(frac * Math.PI);
      const px = x1 + dx * frac + perpX * wave;
      const py = y1 + dy * frac + perpY * wave;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = `rgba(253, 224, 71, ${0.6 + intensity * 0.35})`;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Filament 2: Ethereal electric purple / cyan wave (counter-phase spiral)
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const wave = Math.sin(frac * Math.PI * 4 + time * 7 + Math.PI) * amp * Math.sin(frac * Math.PI);
      const px = x1 + dx * frac + perpX * wave;
      const py = y1 + dy * frac + perpY * wave;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = `rgba(192, 132, 252, ${0.55 + intensity * 0.4})`;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // 4. Flowing incandescent flame ember particles
    particlesRef.current.forEach((p, idx) => {
      p.t = (p.t + p.speed * (0.8 + intensity * 0.9)) % 1;
      const waveOffset = Math.sin(p.t * Math.PI * 4 + time * 5) * (amp * 0.75);
      const pX = x1 + dx * p.t + perpX * waveOffset;
      const pY = y1 + dy * p.t + perpY * waveOffset;

      ctx.beginPath();
      ctx.arc(pX, pY, idx % 3 === 0 ? 3.0 : 2.0, 0, Math.PI * 2);
      if (idx % 2 === 0) {
        ctx.fillStyle = '#fef08a'; // gold flame spark
        ctx.shadowColor = '#f97316';
      } else {
        ctx.fillStyle = '#e879f9'; // electric ether spark
        ctx.shadowColor = '#c084fc';
      }
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  };

  const renderCrystalLattice = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    time: number,
    isSelected: boolean
  ) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);

    // Transcendent Fire & Ether Crystal Lattice!
    // Central incandescent luminescent beam
    const beamGrad = ctx.createLinearGradient(x1, y1, x2, y2);
    beamGrad.addColorStop(0, '#ffffff');
    beamGrad.addColorStop(0.2, '#fde047'); // flame gold
    beamGrad.addColorStop(0.5, '#e879f9'); // electric violet
    beamGrad.addColorStop(0.8, '#22d3ee'); // ethereal cyan
    beamGrad.addColorStop(1, '#ffffff');

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = beamGrad;
    ctx.lineWidth = isSelected ? 5.0 : 3.8;
    ctx.stroke();

    // Refractive dual prism glow envelope
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = 22;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.2)';
    ctx.lineWidth = 14;
    ctx.stroke();

    // Multi-faceted crystal diamond cell cages along the bond
    const diamondCells = 5;
    const cellWidth = length / diamondCells;
    const latticeAperture = 24;

    for (let c = 0; c < diamondCells; c++) {
      const midFrac = (c + 0.5) / diamondCells;
      const startFrac = c / diamondCells;
      const endFrac = (c + 1) / diamondCells;

      const pStart = { x: x1 + dx * startFrac, y: y1 + dy * startFrac };
      const pEnd = { x: x1 + dx * endFrac, y: y1 + dy * endFrac };
      const pMidTop = {
        x: x1 + dx * midFrac + perpX * (latticeAperture + Math.sin(time * 2.5 + c) * 3.5),
        y: y1 + dy * midFrac + perpY * (latticeAperture + Math.sin(time * 2.5 + c) * 3.5),
      };
      const pMidBottom = {
        x: x1 + dx * midFrac - perpX * (latticeAperture + Math.sin(time * 2.5 + c) * 3.5),
        y: y1 + dy * midFrac - perpY * (latticeAperture + Math.sin(time * 2.5 + c) * 3.5),
      };

      // Draw diamond facet
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pMidTop.x, pMidTop.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.lineTo(pMidBottom.x, pMidBottom.y);
      ctx.closePath();

      // Shimmering translucent crystal facet fill (Fire & Ether blending)
      const facetGrad = ctx.createLinearGradient(pMidTop.x, pMidTop.y, pMidBottom.x, pMidBottom.y);
      facetGrad.addColorStop(0, 'rgba(232, 121, 249, 0.22)');
      facetGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.15)');
      facetGrad.addColorStop(1, 'rgba(249, 115, 22, 0.22)');
      ctx.fillStyle = facetGrad;
      ctx.fill();

      // Facet wireframe
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Cross internal facet struts
      ctx.beginPath();
      ctx.moveTo(pMidTop.x, pMidTop.y);
      ctx.lineTo(pMidBottom.x, pMidBottom.y);
      ctx.strokeStyle = 'rgba(165, 243, 252, 0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Crystal vertex points (White-hot jewel sparks)
      [pMidTop, pMidBottom].forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    // Centered Freedom Bond Glyph ⧆ & Harmonic Rings
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    // Inner flame-gold harmonic ring
    const ringRadius = 20 + Math.sin(time * 4) * 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.0;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Outer concentric electric purple & cyan resonant ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, ringRadius * 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glyph text: ⧆
    ctx.font = 'bold 16px JetBrains Mono';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#e879f9';
    ctx.shadowBlur = 12;
    ctx.fillText('⧆', centerX, centerY);
    ctx.shadowBlur = 0;
    ctx.textBaseline = 'alphabetic'; // reset
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-neutral-950">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating Canvas Camera / View Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1 bg-[#130924]/85 backdrop-blur-md border border-purple-900/60 rounded-lg text-neutral-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        <button
          onClick={() => setIsAutoRotate(prev => !prev)}
          className={`px-2.5 py-1.5 text-xs font-mono flex items-center gap-1.5 rounded transition-colors ${
            isAutoRotate
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-[0_0_10px_rgba(192,132,252,0.3)]'
              : 'hover:bg-purple-950/50 text-neutral-400'
          }`}
          title="Toggle Chamber Orbit"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span>Orbit</span>
        </button>

        <button
          onClick={() => { zoomRef.current = Math.min(2.8, zoomRef.current * 1.15); }}
          className="p-1.5 hover:bg-purple-900/40 rounded text-neutral-400 hover:text-amber-300 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => { zoomRef.current = Math.max(0.45, zoomRef.current * 0.85); }}
          className="p-1.5 hover:bg-purple-900/40 rounded text-neutral-400 hover:text-amber-300 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={resetView}
          className="p-1.5 hover:bg-purple-900/40 rounded text-neutral-400 hover:text-purple-300 transition-colors"
          title="Reset Camera View"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chamber State Watermark */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <div className="text-[10px] font-mono tracking-wider text-purple-400/70 uppercase">
          AEILORIA.CORE // STROKES: FREEDOM BOND VISUALIZER [FIRE & ETHER]
        </div>
        <div className="text-xs font-mono text-neutral-300 flex items-center gap-2 mt-0.5">
          <span>Test Chamber: <strong className="text-purple-300 font-semibold">{viewMode === 'state_space' ? 'State Manifold (A×R×E)' : 'Topological 3D'}</strong></span>
          <span className="text-purple-600">·</span>
          <span>Dosage y: <strong className="text-orange-400 font-mono">{(activeDosageY).toFixed(2)}</strong></span>
          <span className="text-purple-600">·</span>
          <span>Camera: <strong className="text-cyan-300 font-mono">{isAutoRotate ? 'Orbiting' : 'Manual'}</strong></span>
        </div>
      </div>
    </div>
  );
};
