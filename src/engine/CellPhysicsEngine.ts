/**
 * CellPhysicsEngine.ts
 * Real-time Verlet Integration & Spring-Mass Soft Body Physics Engine:
 * - 32-Node Deformable Cell Membrane Boundary with Area-Preserving Pressure
 * - Fluid Osmosis & Tonicity Simulation (Hypotonic Cytolysis vs Hypertonic Crenation)
 * - Cytosolic Streaming Particle Hydrodynamics
 * - Organelle Dynamic Anchoring & Collision Constraints
 */

export interface PhysicsNode {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  vx: number;
  vy: number;
  mass: number;
  normalX: number;
  normalY: number;
  originalAngle: number;
  isPinned: boolean;
}

export interface SpringConstraint {
  nodeA: number;
  nodeB: number;
  restLength: number;
  stiffness: number;
}

export interface CytosolParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  type: 'nutrient' | 'vesicle' | 'atp' | 'debris';
}

export class CellPhysicsEngine {
  public nodeCount: number = 32;
  public nodes: PhysicsNode[] = [];
  public springs: SpringConstraint[] = [];
  public cytosolParticles: CytosolParticle[] = [];

  // Cell dimensions
  public baseRadius: number = 180;
  public currentRadius: number = 180;
  public centerX: number = 0;
  public centerY: number = 0;

  // Membrane physical properties
  public stiffness: number = 0.85;
  public damping: number = 0.982;
  public targetArea: number = Math.PI * 180 * 180;
  public currentArea: number = Math.PI * 180 * 180;

  // Lysis state
  public isBurst: boolean = false;
  public burstDebris: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

  // Mouse interaction
  private draggedNodeIndex: number = -1;

  constructor(centerX: number = 0, centerY: number = 0, radius: number = 180) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.baseRadius = radius;
    this.currentRadius = radius;
    this.initMembrane();
    this.initCytosolParticles(65);
  }

  public initMembrane(): void {
    this.nodes = [];
    this.springs = [];
    this.isBurst = false;
    this.burstDebris = [];

    const angleStep = (Math.PI * 2) / this.nodeCount;

    // 1. Initialize 32 circular boundary nodes
    for (let i = 0; i < this.nodeCount; i++) {
      const angle = i * angleStep;
      const x = this.centerX + Math.cos(angle) * this.baseRadius;
      const y = this.centerY + Math.sin(angle) * this.baseRadius;

      this.nodes.push({
        x,
        y,
        oldX: x,
        oldY: y,
        vx: 0,
        vy: 0,
        mass: 1.0,
        normalX: Math.cos(angle),
        normalY: Math.sin(angle),
        originalAngle: angle,
        isPinned: false
      });
    }

    // 2. Connect perimeter springs between adjacent nodes
    for (let i = 0; i < this.nodeCount; i++) {
      const next = (i + 1) % this.nodeCount;
      const dx = this.nodes[next].x - this.nodes[i].x;
      const dy = this.nodes[next].y - this.nodes[i].y;
      const restLength = Math.hypot(dx, dy);

      this.springs.push({
        nodeA: i,
        nodeB: next,
        restLength,
        stiffness: 0.92
      });
    }

    // 3. Connect structural cross-diameter structural spokes for spring-mass firmness
    for (let i = 0; i < this.nodeCount / 2; i++) {
      const opposite = (i + this.nodeCount / 2) % this.nodeCount;
      const dx = this.nodes[opposite].x - this.nodes[i].x;
      const dy = this.nodes[opposite].y - this.nodes[i].y;
      const restLength = Math.hypot(dx, dy);

      this.springs.push({
        nodeA: i,
        nodeB: opposite,
        restLength,
        stiffness: 0.35 // Softer internal pressure spokes
      });
    }

    this.calculateArea();
    this.targetArea = this.currentArea;
  }

  public initCytosolParticles(count: number): void {
    this.cytosolParticles = [];
    const colors = ['#06b6d4', '#84cc16', '#facc15', '#ec4899', '#38bdf8'];
    const types: ('nutrient' | 'vesicle' | 'atp' | 'debris')[] = ['nutrient', 'vesicle', 'atp', 'debris'];

    for (let i = 0; i < count; i++) {
      const r = Math.random() * (this.baseRadius * 0.72);
      const theta = Math.random() * Math.PI * 2;
      this.cytosolParticles.push({
        x: this.centerX + Math.cos(theta) * r,
        y: this.centerY + Math.sin(theta) * r,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.5) * 18,
        size: Math.random() * 2.8 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.3,
        type: types[Math.floor(Math.random() * types.length)]
      });
    }
  }

  /**
   * Calculates polygon area using Shoelace formula
   */
  public calculateArea(): number {
    let area = 0;
    const n = this.nodes.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += this.nodes[i].x * this.nodes[j].y;
      area -= this.nodes[j].x * this.nodes[i].y;
    }
    this.currentArea = Math.abs(area) * 0.5;
    return this.currentArea;
  }

  /**
   * Primary physics integration step (Verlet + Spring constraints + Osmotic pressure)
   */
  public update(
    dt: number,
    osmoticPressure: number = 290,
    speedMultiplier: number = 1.0
  ): { cytolysisOccurred: boolean; currentMeanRadius: number } {
    if (this.isBurst) {
      this.updateBurstDebris(dt);
      return { cytolysisOccurred: false, currentMeanRadius: 0 };
    }

    const effectiveDt = Math.min(0.033, dt * speedMultiplier);

    // 1. Calculate Osmotic Tonicity Target
    // Normal isotonic is 290 mOsm -> targetRadius = baseRadius
    // Hypotonic < 250 -> swells up to 1.55x baseRadius
    // Hypertonic > 350 -> shrinks down to 0.72x baseRadius
    const tonicityRatio = 290.0 / Math.max(100, osmoticPressure);
    const targetScale = Math.max(0.68, Math.min(1.52, tonicityRatio));
    const targetPressureRadius = this.baseRadius * targetScale;

    // Check catastrophic cytolysis threshold (when swollen over 1.48x or osmotic pressure > 415 mOsm)
    let cytolysisOccurred = false;
    if (targetScale > 1.48 || (osmoticPressure < 180 && this.currentArea > this.targetArea * 1.9)) {
      this.triggerCytolysis();
      return { cytolysisOccurred: true, currentMeanRadius: 0 };
    }

    // 2. Verlet Integration step on nodes
    let meanRadiusSum = 0;
    const n = this.nodes.length;

    for (let i = 0; i < n; i++) {
      const node = this.nodes[i];
      if (node.isPinned) continue;

      // Current velocity from Verlet history
      node.vx = (node.x - node.oldX) * this.damping;
      node.vy = (node.y - node.oldY) * this.damping;

      node.oldX = node.x;
      node.oldY = node.y;

      // Natural gentle undulating wobble (living membrane breathing)
      const wobble = Math.sin(Date.now() * 0.003 + node.originalAngle * 4) * 0.8;

      // Update positions
      node.x += node.vx + Math.cos(node.originalAngle) * wobble * effectiveDt;
      node.y += node.vy + Math.sin(node.originalAngle) * wobble * effectiveDt;

      // Radial vector from cell center
      const rdx = node.x - this.centerX;
      const rdy = node.y - this.centerY;
      const dist = Math.hypot(rdx, rdy) || 1;
      node.normalX = rdx / dist;
      node.normalY = rdy / dist;

      meanRadiusSum += dist;
    }

    this.currentRadius = meanRadiusSum / n;

    // 3. Area Preservation & Osmotic Expansion Pressure Force
    this.calculateArea();
    const areaDifference = (Math.PI * targetPressureRadius * targetPressureRadius) - this.currentArea;
    const pressureMultiplier = (areaDifference / (Math.PI * this.baseRadius * 2)) * 0.45;

    for (let i = 0; i < n; i++) {
      const node = this.nodes[i];
      if (node.isPinned) continue;

      node.x += node.normalX * pressureMultiplier * effectiveDt;
      node.y += node.normalY * pressureMultiplier * effectiveDt;
    }

    // 4. Spring Constraint Relaxation (3 iterations for stability)
    for (let iter = 0; iter < 3; iter++) {
      for (let s = 0; s < this.springs.length; s++) {
        const spring = this.springs[s];
        const nodeA = this.nodes[spring.nodeA];
        const nodeB = this.nodes[spring.nodeB];

        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const currentLen = Math.hypot(dx, dy) || 1;
        const diff = (currentLen - spring.restLength) / currentLen;

        const offsetX = dx * 0.5 * diff * spring.stiffness;
        const offsetY = dy * 0.5 * diff * spring.stiffness;

        if (!nodeA.isPinned) {
          nodeA.x += offsetX;
          nodeA.y += offsetY;
        }
        if (!nodeB.isPinned) {
          nodeB.x -= offsetX;
          nodeB.y -= offsetY;
        }
      }
    }

    // 5. Update Cytoplasmic Fluid Particles & Streaming Current
    this.updateCytosolParticles(effectiveDt);

    return {
      cytolysisOccurred,
      currentMeanRadius: this.currentRadius
    };
  }

  /**
   * Cytoplasmic cyclosis streaming & membrane bounce
   */
  private updateCytosolParticles(dt: number): void {
    const time = Date.now() * 0.001;

    for (let i = 0; i < this.cytosolParticles.length; i++) {
      const p = this.cytosolParticles[i];

      // Circular cytoplasmic vortex streaming (cyclosis)
      const dx = p.x - this.centerX;
      const dy = p.y - this.centerY;
      const dist = Math.hypot(dx, dy) || 1;

      // Angular velocity creates gentle clockwise circular streaming
      const tangentialVx = -dy * 0.22;
      const tangentialVy = dx * 0.22;

      p.vx = p.vx * 0.94 + tangentialVx * dt * 3.5;
      p.vy = p.vy * 0.94 + tangentialVy * dt * 3.5;

      p.x += p.vx * dt * 50;
      p.y += p.vy * dt * 50;

      // Collide with soft-body membrane boundary
      const maxInnerDist = this.currentRadius * 0.88;
      if (dist > maxInnerDist) {
        const nx = dx / dist;
        const ny = dy / dist;
        p.x = this.centerX + nx * maxInnerDist;
        p.y = this.centerY + ny * maxInnerDist;

        // Inward bounce
        p.vx = -nx * 15;
        p.vy = -ny * 15;
      }

      // Avoid central nucleus core
      const nucleusRadius = 55;
      if (dist < nucleusRadius) {
        const nx = dx / dist;
        const ny = dy / dist;
        p.x = this.centerX + nx * nucleusRadius;
        p.y = this.centerY + ny * nucleusRadius;
        p.vx = nx * 10;
        p.vy = ny * 10;
      }
    }
  }

  /**
   * Catastrophic cytolysis burst explosion
   */
  public triggerCytolysis(): void {
    this.isBurst = true;
    this.burstDebris = [];

    // Explode membrane nodes outward
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const angle = Math.atan2(node.y - this.centerY, node.x - this.centerX);
      const speed = Math.random() * 220 + 80;
      this.burstDebris.push({
        x: node.x,
        y: node.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: '#06b6d4'
      });
    }

    // Explode cytosol particles
    for (let i = 0; i < this.cytosolParticles.length; i++) {
      const p = this.cytosolParticles[i];
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 260 + 50;
      this.burstDebris.push({
        x: p.x,
        y: p.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: p.color
      });
    }
  }

  private updateBurstDebris(dt: number): void {
    for (let i = 0; i < this.burstDebris.length; i++) {
      const d = this.burstDebris[i];
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vx *= 0.96;
      d.vy *= 0.96;
      d.life -= dt * 0.7;
    }
    this.burstDebris = this.burstDebris.filter(d => d.life > 0);
  }

  // --- Interaction Controls ---

  public handlePointerDown(worldX: number, worldY: number): boolean {
    if (this.isBurst) return false;
    let closestDist = Infinity;
    let closestIdx = -1;

    for (let i = 0; i < this.nodes.length; i++) {
      const dist = Math.hypot(this.nodes[i].x - worldX, this.nodes[i].y - worldY);
      if (dist < closestDist && dist < 45) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    if (closestIdx !== -1) {
      this.draggedNodeIndex = closestIdx;
      this.nodes[closestIdx].isPinned = true;
      return true;
    }
    return false;
  }

  public handlePointerMove(worldX: number, worldY: number): void {
    if (this.draggedNodeIndex !== -1 && this.nodes[this.draggedNodeIndex]) {
      const node = this.nodes[this.draggedNodeIndex];
      node.x = worldX;
      node.y = worldY;
      node.oldX = worldX;
      node.oldY = worldY;
    }
  }

  public handlePointerUp(): void {
    if (this.draggedNodeIndex !== -1 && this.nodes[this.draggedNodeIndex]) {
      this.nodes[this.draggedNodeIndex].isPinned = false;
      this.draggedNodeIndex = -1;
    }
  }
}
