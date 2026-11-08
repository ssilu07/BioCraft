/**
 * ImmuneSystemEngine.ts
 * Pathogen Warfare & Cellular Immune Defense Engine:
 * - Virion Lifecycle: Bacteriophage & Enveloped Coronavirus
 * - Spike Protein Receptor Binding & Viral RNA Injection
 * - Ribosomal Hijacking & Intracellular Viral Replication
 * - Catastrophic Viral Lysis Bursting
 * - Humoral Immunity: Plasma B-Cells & Y-Shaped IgG Antibodies (Agglutination)
 * - Cellular Immunity: Phagocytic Macrophages with dynamic Pseudopodia & Acid Hydrolase Digestion
 */

export type PathogenType = 'bacteriophage' | 'coronavirus';

export interface Virion {
  id: string;
  type: PathogenType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  isNeutralized: boolean; // Tagged by antibodies
  antibodiesAttached: number;
  isEngulfed: boolean;
  isInjected: boolean;
  dockedAtNodeIndex: number | null;
  opacity: number;
}

export interface Antibody {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetVirionId: string | null;
  isAttached: boolean;
  life: number;
}

export interface Macrophage {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pseudopodiaNodes: { x: number; y: number; angle: number; length: number }[];
  targetVirionId: string | null;
  engulfedCount: number;
  digestTimer: number;
}

export interface ImmuneState {
  viralLoadInternal: number;
  lysisThreshold: number;
  virionsExtracellular: Virion[];
  antibodies: Antibody[];
  macrophages: Macrophage[];
  bCellProductionRate: number; // Antibodies per second
  totalVirusesNeutralized: number;
  totalVirusesEngulfed: number;
  isHostHijacked: boolean;
}

export class ImmuneSystemEngine {
  public state: ImmuneState;
  private idCounter: number = 0;

  constructor() {
    this.state = {
      viralLoadInternal: 0,
      lysisThreshold: 60,
      virionsExtracellular: [],
      antibodies: [],
      macrophages: [],
      bCellProductionRate: 1.8,
      totalVirusesNeutralized: 0,
      totalVirusesEngulfed: 0,
      isHostHijacked: false
    };

    // Spawn 2 initial sentinel macrophages
    this.spawnMacrophage(-280, -180);
    this.spawnMacrophage(280, 200);
  }

  public reset(): void {
    this.state.viralLoadInternal = 0;
    this.state.virionsExtracellular = [];
    this.state.antibodies = [];
    this.state.macrophages = [];
    this.state.totalVirusesNeutralized = 0;
    this.state.totalVirusesEngulfed = 0;
    this.state.isHostHijacked = false;
    this.spawnMacrophage(-280, -180);
    this.spawnMacrophage(280, 200);
  }

  private nextId(prefix: string): string {
    return `${prefix}_${++this.idCounter}`;
  }

  /**
   * Spawns an amoeboid Macrophage with dynamic pseudopodia tentacles
   */
  public spawnMacrophage(x: number, y: number): void {
    const nodeCount = 12;
    const pseudopodiaNodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i * Math.PI * 2) / nodeCount;
      pseudopodiaNodes.push({
        x: Math.cos(angle) * 32,
        y: Math.sin(angle) * 32,
        angle,
        length: 32
      });
    }

    this.state.macrophages.push({
      id: this.nextId('macro'),
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 36,
      pseudopodiaNodes,
      targetVirionId: null,
      engulfedCount: 0,
      digestTimer: 0
    });
  }

  /**
   * Spawns viral particles outside the cell
   */
  public spawnVirion(
    type: PathogenType = 'coronavirus',
    originX?: number,
    originY?: number
  ): void {
    const x = originX !== undefined ? originX : (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 200 + 350);
    const y = originY !== undefined ? originY : (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 200 + 350);

    this.state.virionsExtracellular.push({
      id: this.nextId('virion'),
      type,
      x,
      y,
      vx: (Math.random() - 0.5) * 25,
      vy: (Math.random() - 0.5) * 25,
      radius: type === 'bacteriophage' ? 12 : 15,
      angle: Math.random() * Math.PI * 2,
      isNeutralized: false,
      antibodiesAttached: 0,
      isEngulfed: false,
      isInjected: false,
      dockedAtNodeIndex: null,
      opacity: 1.0
    });
  }

  /**
   * Fires Y-shaped IgG antibodies from activated Plasma B-Cells
   */
  public emitAntibodies(count: number = 3): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 80 + 120;
      this.state.antibodies.push({
        id: this.nextId('ab'),
        x: Math.cos(angle) * 160,
        y: Math.sin(angle) * 160,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        targetVirionId: null,
        isAttached: false,
        life: 14.0 // Seconds
      });
    }
  }

  /**
   * Main simulation step for immune warfare
   */
  public update(
    dt: number,
    cellCenterX: number,
    cellCenterY: number,
    cellRadius: number,
    membraneNodes: { x: number; y: number }[],
    speedMultiplier: number = 1.0
  ): {
    didLysisOccur: boolean;
    virionsInjectedCount: number;
    virionsEngulfedCount: number;
    newAntibodiesSpawned: number;
  } {
    const effectiveDt = dt * speedMultiplier;
    let didLysisOccur = false;
    let virionsInjectedCount = 0;
    let virionsEngulfedCount = 0;
    let newAntibodiesSpawned = 0;

    // 1. Passive B-cell Antibody Secretion
    if (this.state.virionsExtracellular.length > 0 || this.state.viralLoadInternal > 0) {
      if (Math.random() < this.state.bCellProductionRate * effectiveDt) {
        this.emitAntibodies(2);
        newAntibodiesSpawned += 2;
      }
    }

    // 2. Intracellular Viral Hijacking & Replication
    if (this.state.isHostHijacked) {
      // Replicate internal virions at rate proportional to active viral load
      this.state.viralLoadInternal += effectiveDt * (1.2 + this.state.viralLoadInternal * 0.08);

      // Check if viral load exceeds lysis threshold
      if (this.state.viralLoadInternal >= this.state.lysisThreshold) {
        didLysisOccur = true;
        // Release progeny virions into medium
        const progenyCount = Math.floor(this.state.viralLoadInternal);
        for (let i = 0; i < Math.min(45, progenyCount); i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * 60 + 10;
          this.spawnVirion('coronavirus', cellCenterX + Math.cos(angle) * dist, cellCenterY + Math.sin(angle) * dist);
        }
        this.state.viralLoadInternal = 0;
        this.state.isHostHijacked = false;
      }
    }

    // 3. Update Extracellular Virions (Brownian motion & Chemotaxis toward membrane)
    for (let i = 0; i < this.state.virionsExtracellular.length; i++) {
      const v = this.state.virionsExtracellular[i];
      if (v.isEngulfed) continue;

      if (!v.isNeutralized && !v.isInjected) {
        // Non-neutralized virions drift toward host cell membrane
        const dx = cellCenterX - v.x;
        const dy = cellCenterY - v.y;
        const distToCenter = Math.hypot(dx, dy) || 1;

        // Chemotactic drift
        v.vx += (dx / distToCenter) * 18 * effectiveDt;
        v.vy += (dy / distToCenter) * 18 * effectiveDt;

        // Check docking with membrane nodes
        for (let nIdx = 0; nIdx < membraneNodes.length; nIdx++) {
          const node = membraneNodes[nIdx];
          const distToNode = Math.hypot(node.x - v.x, node.y - v.y);

          // Docking condition: close to membrane node
          if (distToNode < 18) {
            v.isInjected = true;
            v.dockedAtNodeIndex = nIdx;
            v.vx = 0;
            v.vy = 0;
            this.state.viralLoadInternal += 1;
            this.state.isHostHijacked = true;
            virionsInjectedCount++;
            break;
          }
        }
      } else if (v.isNeutralized) {
        // Agglutinated virions drift slowly with high fluid drag
        v.vx *= 0.92;
        v.vy *= 0.92;
      }

      // Position update
      v.x += v.vx * effectiveDt;
      v.y += v.vy * effectiveDt;
      v.angle += 0.4 * effectiveDt;
    }

    // 4. Update Antibodies (Targeting viral spikes)
    for (let aIdx = this.state.antibodies.length - 1; aIdx >= 0; aIdx--) {
      const ab = this.state.antibodies[aIdx];
      ab.life -= effectiveDt;
      if (ab.life <= 0) {
        this.state.antibodies.splice(aIdx, 1);
        continue;
      }

      if (!ab.isAttached) {
        // Seek nearest active virion
        let closestVirion: Virion | null = null;
        let closestDist = Infinity;

        for (const v of this.state.virionsExtracellular) {
          if (!v.isEngulfed && v.antibodiesAttached < 3) {
            const dist = Math.hypot(v.x - ab.x, v.y - ab.y);
            if (dist < closestDist) {
              closestDist = dist;
              closestVirion = v;
            }
          }
        }

        if (closestVirion && closestDist < 300) {
          // Steer towards target virion
          const dx = closestVirion.x - ab.x;
          const dy = closestVirion.y - ab.y;
          ab.vx += (dx / closestDist) * 350 * effectiveDt;
          ab.vy += (dy / closestDist) * 350 * effectiveDt;

          // Check lock-on collision
          if (closestDist < 16) {
            ab.isAttached = true;
            ab.targetVirionId = closestVirion.id;
            closestVirion.antibodiesAttached++;
            if (closestVirion.antibodiesAttached >= 2) {
              closestVirion.isNeutralized = true;
              this.state.totalVirusesNeutralized++;
            }
          }
        }

        ab.x += ab.vx * effectiveDt;
        ab.y += ab.vy * effectiveDt;
        ab.vx *= 0.96;
        ab.vy *= 0.96;
      } else {
        // Locked onto virion: follow it
        const attachedVirion = this.state.virionsExtracellular.find(v => v.id === ab.targetVirionId);
        if (attachedVirion) {
          ab.x = attachedVirion.x;
          ab.y = attachedVirion.y;
        } else {
          ab.life = 0; // Target disappeared
        }
      }
    }

    // 5. Update Phagocytic Macrophages
    for (const macro of this.state.macrophages) {
      // Dynamic pseudopodia tentacle animation
      const time = Date.now() * 0.003;
      for (let i = 0; i < macro.pseudopodiaNodes.length; i++) {
        const pNode = macro.pseudopodiaNodes[i];
        pNode.length = 32 + Math.sin(time + i * 1.5) * 8 + Math.cos(time * 0.7 + i) * 6;
        pNode.x = Math.cos(pNode.angle) * pNode.length;
        pNode.y = Math.sin(pNode.angle) * pNode.length;
      }

      // Seek antibody-tagged or nearest virion
      let target: Virion | null = null;
      let minTargetDist = Infinity;

      for (const v of this.state.virionsExtracellular) {
        if (!v.isEngulfed) {
          const dist = Math.hypot(v.x - macro.x, v.y - macro.y);
          // Prefer neutralized / antibody-tagged virions (opsonization)
          const priorityWeight = v.isNeutralized ? 0.35 : 1.0;
          const effectiveDist = dist * priorityWeight;

          if (effectiveDist < minTargetDist) {
            minTargetDist = effectiveDist;
            target = v;
          }
        }
      }

      if (target) {
        const dx = target.x - macro.x;
        const dy = target.y - macro.y;
        const actualDist = Math.hypot(dx, dy) || 1;

        // Crawl towards antigen with amoeboid locomotion
        macro.vx = (dx / actualDist) * 45;
        macro.vy = (dy / actualDist) * 45;

        // Phagocytosis trigger: engulf target
        if (actualDist < macro.radius + target.radius) {
          target.isEngulfed = true;
          macro.engulfedCount++;
          this.state.totalVirusesEngulfed++;
          virionsEngulfedCount++;
        }
      } else {
        // Patrol around extracellular space
        macro.vx *= 0.95;
        macro.vy *= 0.95;
      }

      macro.x += macro.vx * effectiveDt;
      macro.y += macro.vy * effectiveDt;
    }

    // Cleanup engulfed virions and docked empty shells
    this.state.virionsExtracellular = this.state.virionsExtracellular.filter(
      v => !v.isEngulfed && !(v.isInjected && v.opacity <= 0)
    );

    return {
      didLysisOccur,
      virionsInjectedCount,
      virionsEngulfedCount,
      newAntibodiesSpawned
    };
  }

  public boostAntibodyProduction(amount: number = 2.0): void {
    this.state.bCellProductionRate = Math.min(10.0, this.state.bCellProductionRate + amount);
  }

  public clearExtracellularDebris(): void {
    for (const v of this.state.virionsExtracellular) {
      v.isNeutralized = true;
      v.antibodiesAttached = Math.max(v.antibodiesAttached, 3);
    }
    this.state.totalVirusesEngulfed += Math.min(5, this.state.virionsExtracellular.length);
    this.state.virionsExtracellular = this.state.virionsExtracellular.slice(5);
  }
}
