/**
 * Bio3DRenderer.ts
 * High-Performance Three.js 3D Biological Simulation Renderer:
 * - Crystal-Clear Translucent Lipid Bilayer Membrane (Zero visual obstruction)
 * - Properly Spaced Organelles with breathing room (Nucleus, Mitochondria, Golgi, ER, Lysosomes)
 * - 3D-to-2D World Projection Tracking for Leader Lines & Callouts
 * - Seamless Scale Isolation:
 *   * Macro 10x: Extracellular fluid, red blood cells, virus swarms, macrophages
 *   * Cellular 100x: Organelles spaced cleanly without clipping or central bunching
 *   * Nanoscale 1000x: Dedicated molecular studio with centered DNA double helix & 3D Ribosome
 * - Dual-Theme Lighting & Background (Dark Cyber-Navy vs Light Clinical Bio-Lab)
 */

import * as THREE from 'three';
import { CellPhysicsEngine } from './CellPhysicsEngine';
import { MetabolicState } from './MetabolicSimulator';
import { ImmuneSystemEngine } from './ImmuneSystemEngine';

export interface OrganelleScreenPos {
  id: string;
  name: string;
  detail: string;
  screenX: number;
  screenY: number;
  color: string;
  visible: boolean;
}

export class Bio3DRenderer {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;

  // Scene Scale Groups
  private macroGroup: THREE.Group;
  private cellularGroup: THREE.Group;
  private nanoscaleGroup: THREE.Group;

  // Cellular 3D Elements
  private membraneMesh: THREE.Mesh | null = null;
  private membraneGeometry: THREE.SphereGeometry | null = null;
  private originalMembranePositions: Float32Array | null = null;
  private membraneMaterial: THREE.MeshPhysicalMaterial | null = null;

  // Organelles
  public nucleusMesh: THREE.Group | null = null;
  public mitochondria1: THREE.Group | null = null;
  public mitochondria2: THREE.Group | null = null;
  public atpSynthaseRotor1: THREE.Group | null = null;
  public atpSynthaseRotor2: THREE.Group | null = null;
  public golgiGroup: THREE.Group | null = null;
  public erGroup: THREE.Group | null = null;
  public lysosomes: THREE.Mesh[] = [];
  public vesicles: THREE.Mesh[] = [];
  public flagellumMesh: THREE.Line | null = null;
  private cytosolParticles: THREE.Points | null = null;

  // Pathogens & Immune Meshes
  private virionMeshes: Map<string, THREE.Group> = new Map();
  private antibodyMeshes: Map<string, THREE.Group> = new Map();
  private macrophageMeshes: Map<string, THREE.Group> = new Map();
  private redBloodCells: THREE.Mesh[] = [];

  // Nanoscale 3D Elements
  public dnaHelixGroup: THREE.Group | null = null;
  public ribosomeGroup: THREE.Group | null = null;
  public peptideChainGroup: THREE.Group | null = null;
  private mrnaFilamentMesh: THREE.Line | null = null;

  // Lights & Atmosphere
  private ambientLight: THREE.AmbientLight | null = null;
  private dirLight1: THREE.DirectionalLight | null = null;
  private dirLight2: THREE.DirectionalLight | null = null;
  private gfpLight: THREE.PointLight | null = null;
  private atpLight1: THREE.PointLight | null = null;
  public currentTheme: 'dark' | 'light' = 'dark';

  // Camera & Interaction
  private targetZoom: number = 100; // 10, 100, 1000
  public currentZoom: number = 100;
  private cameraDistance: number = 520;
  private targetCamDistance: number = 520;
  private isPointerDown: boolean = false;
  private pointerPrevX: number = 0;
  private pointerPrevY: number = 0;
  private targetRotX: number = 0.22;
  private targetRotY: number = 0.35;
  private rotX: number = 0.22;
  private rotY: number = 0.35;

  // Projected Callout Cache
  public projectedCallouts: OrganelleScreenPos[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 6000);
    this.camera.position.set(0, 60, 520);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    container.appendChild(this.renderer.domElement);
    this.clock = new THREE.Clock();

    // Scale Groups
    this.macroGroup = new THREE.Group();
    this.cellularGroup = new THREE.Group();
    this.nanoscaleGroup = new THREE.Group();

    this.scene.add(this.macroGroup);
    this.scene.add(this.cellularGroup);
    this.scene.add(this.nanoscaleGroup);

    this.initLights();
    this.buildCellular3D();
    this.buildMacro3D();
    this.buildNanoscale3D();
    this.setupInteractionListeners();
    this.setTheme('dark');
  }

  public setTheme(theme: 'dark' | 'light'): void {
    this.currentTheme = theme;
    if (theme === 'dark') {
      this.scene.background = new THREE.Color(0x030712);
      this.scene.fog = new THREE.FogExp2(0x030712, 0.0005);
      if (this.ambientLight) {
        this.ambientLight.color.setHex(0x0f1d36);
        this.ambientLight.intensity = 1.9;
      }
      if (this.dirLight1) {
        this.dirLight1.color.setHex(0x38bdf8);
        this.dirLight1.intensity = 2.4;
      }
      if (this.membraneMaterial) {
        this.membraneMaterial.color.setHex(0x06b6d4);
        this.membraneMaterial.emissive.setHex(0x042f2e);
        this.membraneMaterial.emissiveIntensity = 0.25;
        this.membraneMaterial.opacity = 0.35; // Translucent crystal shell!
        this.membraneMaterial.transmission = 0.92;
        this.membraneMaterial.roughness = 0.12;
      }
    } else {
      // Light Mode: Clinical Bio-Lab White/Slate
      this.scene.background = new THREE.Color(0xf8fafc);
      this.scene.fog = new THREE.FogExp2(0xf1f5f9, 0.0003);
      if (this.ambientLight) {
        this.ambientLight.color.setHex(0xffffff);
        this.ambientLight.intensity = 2.5;
      }
      if (this.dirLight1) {
        this.dirLight1.color.setHex(0x0284c7);
        this.dirLight1.intensity = 1.8;
      }
      if (this.membraneMaterial) {
        this.membraneMaterial.color.setHex(0x0284c7);
        this.membraneMaterial.emissive.setHex(0x0369a1);
        this.membraneMaterial.emissiveIntensity = 0.15;
        this.membraneMaterial.opacity = 0.32;
        this.membraneMaterial.transmission = 0.94;
        this.membraneMaterial.roughness = 0.15;
      }
    }
  }

  private initLights(): void {
    this.ambientLight = new THREE.AmbientLight(0x0f1d36, 1.9);
    this.scene.add(this.ambientLight);

    this.dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.4);
    this.dirLight1.position.set(300, 450, 300);
    this.scene.add(this.dirLight1);

    this.dirLight2 = new THREE.DirectionalLight(0x818cf8, 1.4);
    this.dirLight2.position.set(-300, -250, -200);
    this.scene.add(this.dirLight2);

    this.gfpLight = new THREE.PointLight(0x84cc16, 0, 260);
    this.gfpLight.position.set(0, 0, 0);
    this.cellularGroup.add(this.gfpLight);

    this.atpLight1 = new THREE.PointLight(0xfacc15, 1.5, 200);
    this.atpLight1.position.set(65, -20, 25);
    this.cellularGroup.add(this.atpLight1);
  }

  /**
   * Builds the 3D Eukaryotic Cell with crystal-clear membrane and well-spaced organelles
   */
  private buildCellular3D(): void {
    // 1. Crystal-Clear Translucent Cell Membrane
    this.membraneGeometry = new THREE.SphereGeometry(160, 48, 36);
    this.originalMembranePositions = new Float32Array(this.membraneGeometry.attributes.position.array);

    this.membraneMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      emissive: 0x042f2e,
      emissiveIntensity: 0.25,
      metalness: 0.05,
      roughness: 0.12,
      transmission: 0.92,
      thickness: 8.0,
      transparent: true,
      opacity: 0.35, // Clear view to the inside!
      depthWrite: false
    });

    this.membraneMesh = new THREE.Mesh(this.membraneGeometry, this.membraneMaterial);
    this.cellularGroup.add(this.membraneMesh);

    // 2. Nucleus (Centered, compact radius 38)
    this.nucleusMesh = new THREE.Group();
    const nucleusGeo = new THREE.SphereGeometry(38, 32, 24);
    const nucleusMat = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      emissive: 0x312e81,
      emissiveIntensity: 0.7,
      roughness: 0.35,
      transmission: 0.55,
      transparent: true,
      opacity: 0.9
    });
    const nucleusSphere = new THREE.Mesh(nucleusGeo, nucleusMat);
    this.nucleusMesh.add(nucleusSphere);

    // Chromatin Core inside nucleus
    const chromatinGeo = new THREE.DodecahedronGeometry(24, 2);
    const chromatinMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.9,
      wireframe: true
    });
    const chromatinMesh = new THREE.Mesh(chromatinGeo, chromatinMat);
    this.nucleusMesh.add(chromatinMesh);

    // Nuclear Pores (Gold rings)
    for (let i = 0; i < 14; i++) {
      const phi = Math.acos(-1 + (2 * i) / 14);
      const theta = Math.sqrt(14 * Math.PI) * phi;
      const poreGeo = new THREE.TorusGeometry(2.6, 0.9, 8, 16);
      const poreMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xb45309 });
      const pore = new THREE.Mesh(poreGeo, poreMat);
      pore.position.setFromSphericalCoords(38, phi, theta);
      pore.lookAt(0, 0, 0);
      this.nucleusMesh.add(pore);
    }
    this.nucleusMesh.position.set(0, 0, 0);
    this.cellularGroup.add(this.nucleusMesh);

    // 3. Golgi Apparatus (Placed cleanly on Left at x = -70, y = 8, z = -15)
    this.golgiGroup = new THREE.Group();
    for (let g = 0; g < 4; g++) {
      const cisternGeo = new THREE.TorusGeometry(24 - g * 3.5, 3.2, 12, 32, Math.PI * 0.85);
      const cisternMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        emissive: 0x9d174d,
        emissiveIntensity: 0.5,
        roughness: 0.35
      });
      const cistern = new THREE.Mesh(cisternGeo, cisternMat);
      cistern.position.set(0, g * 6.5, 0);
      cistern.rotation.x = Math.PI / 2;
      this.golgiGroup.add(cistern);
    }
    this.golgiGroup.position.set(-70, 8, -15);
    this.golgiGroup.rotation.y = Math.PI / 5;
    this.cellularGroup.add(this.golgiGroup);

    // 4. Primary Mitochondrion (Placed on Right at x = 65, y = -22, z = 15)
    this.mitochondria1 = new THREE.Group();
    const mitoGeo1 = new THREE.CapsuleGeometry(18, 44, 16, 24);
    const mitoMat1 = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      emissive: 0x92400e,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      transmission: 0.65,
      transparent: true,
      opacity: 0.92
    });
    const mitoBody1 = new THREE.Mesh(mitoGeo1, mitoMat1);
    mitoBody1.rotation.z = Math.PI / 3.5;
    this.mitochondria1.add(mitoBody1);

    // Spinning ATP Synthase Rotor
    this.atpSynthaseRotor1 = new THREE.Group();
    const rotorHeadGeo = new THREE.CylinderGeometry(4.5, 4.5, 6, 8);
    const rotorHeadMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04, metalness: 0.8, roughness: 0.2 });
    const rotorHead = new THREE.Mesh(rotorHeadGeo, rotorHeadMat);
    this.atpSynthaseRotor1.add(rotorHead);

    for (let b = 0; b < 6; b++) {
      const bladeGeo = new THREE.BoxGeometry(1.6, 4.5, 6.5);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.y = (b * Math.PI) / 3;
      this.atpSynthaseRotor1.add(blade);
    }
    this.atpSynthaseRotor1.position.set(16, 12, 10);
    this.mitochondria1.add(this.atpSynthaseRotor1);
    this.mitochondria1.position.set(65, -22, 15);
    this.cellularGroup.add(this.mitochondria1);

    // 5. Secondary Mitochondrion (Balanced at x = -25, y = -60, z = 20)
    this.mitochondria2 = new THREE.Group();
    const mitoBody2 = new THREE.Mesh(mitoGeo1, mitoMat1);
    mitoBody2.rotation.z = -Math.PI / 4;
    mitoBody2.scale.set(0.75, 0.75, 0.75);
    this.mitochondria2.add(mitoBody2);
    this.mitochondria2.position.set(-25, -60, 20);
    this.cellularGroup.add(this.mitochondria2);

    // 6. Rough Endoplasmic Reticulum (Arching gently above nucleus at x = -10, y = 48, z = 8)
    this.erGroup = new THREE.Group();
    for (let r = 0; r < 3; r++) {
      const sheetGeo = new THREE.TorusGeometry(32 + r * 7, 2.5, 8, 24, Math.PI * 0.7);
      const sheetMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x5b21b6, roughness: 0.45 });
      const sheet = new THREE.Mesh(sheetGeo, sheetMat);
      sheet.rotation.y = Math.PI / 4 + r * 0.15;
      sheet.position.set(0, -6 + r * 5, 0);
      this.erGroup.add(sheet);

      // Ribosomes
      for (let s = 0; s < 6; s++) {
        const riboGeo = new THREE.SphereGeometry(1.5, 8, 8);
        const riboMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0x9f1239 });
        const ribo = new THREE.Mesh(riboGeo, riboMat);
        ribo.position.set(
          Math.cos(s * 0.48) * (32 + r * 7),
          -6 + r * 5 + (Math.random() - 0.5) * 2,
          Math.sin(s * 0.48) * (32 + r * 7)
        );
        this.erGroup.add(ribo);
      }
    }
    this.erGroup.position.set(-10, 48, 8);
    this.cellularGroup.add(this.erGroup);

    // 7. Translucent Lysosomes (Distributed at upper right and lower left)
    this.lysosomes = [];
    const lysoPositions = [
      new THREE.Vector3(60, 45, -20),
      new THREE.Vector3(-55, -40, -25),
      new THREE.Vector3(75, 10, -35)
    ];

    for (let l = 0; l < lysoPositions.length; l++) {
      const lysoGeo = new THREE.SphereGeometry(11, 16, 16);
      const lysoMat = new THREE.MeshPhysicalMaterial({
        color: 0xef4444,
        emissive: 0x991b1b,
        emissiveIntensity: 0.75,
        roughness: 0.2,
        transmission: 0.65,
        transparent: true
      });
      const lyso = new THREE.Mesh(lysoGeo, lysoMat);
      lyso.position.copy(lysoPositions[l]);
      this.cellularGroup.add(lyso);
      this.lysosomes.push(lyso);
    }

    // 8. Transport Vesicles (Drifting between Golgi and Membrane)
    this.vesicles = [];
    for (let v = 0; v < 6; v++) {
      const vesGeo = new THREE.SphereGeometry(4.5, 12, 12);
      const vesMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 });
      const ves = new THREE.Mesh(vesGeo, vesMat);
      ves.position.set(-75 - v * 8, 12 + (v % 2) * 8, -12 + v * 5);
      this.cellularGroup.add(ves);
      this.vesicles.push(ves);
    }

    // 9. Whipping Flagellum
    const curvePoints: THREE.Vector3[] = [];
    for (let p = 0; p < 35; p++) {
      curvePoints.push(new THREE.Vector3(-160 - p * 7, Math.sin(p * 0.5) * 7, Math.cos(p * 0.5) * 7));
    }
    const flagGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const flagMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 3 });
    this.flagellumMesh = new THREE.Line(flagGeo, flagMat);
    this.flagellumMesh.visible = false;
    this.cellularGroup.add(this.flagellumMesh);

    // 10. Cytosolic Streaming Particles
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r = Math.random() * 125 + 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePos[i * 3 + 2] = r * Math.cos(phi);

      particleColors[i * 3] = 0.05 + Math.random() * 0.5;
      particleColors[i * 3 + 1] = 0.65 + Math.random() * 0.35;
      particleColors[i * 3 + 2] = 0.85 + Math.random() * 0.15;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    this.cytosolParticles = new THREE.Points(particleGeo, particleMat);
    this.cellularGroup.add(this.cytosolParticles);
  }

  /**
   * Builds Macro Scale (10x) elements
   */
  private buildMacro3D(): void {
    this.redBloodCells = [];
    for (let i = 0; i < 28; i++) {
      const rbcGeo = new THREE.CylinderGeometry(16, 16, 4.5, 24);
      const rbcMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35, metalness: 0.1 });
      const rbc = new THREE.Mesh(rbcGeo, rbcMat);
      rbc.scale.set(1.0, 0.45, 1.0);
      rbc.position.set((Math.random() - 0.5) * 1500, (Math.random() - 0.5) * 1100, (Math.random() - 0.5) * 450);
      rbc.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.macroGroup.add(rbc);
      this.redBloodCells.push(rbc);
    }
  }

  /**
   * Builds Nanoscale (1000x) elements: Centered Clean Molecular Studio
   */
  private buildNanoscale3D(): void {
    this.nanoscaleGroup.position.set(0, 0, 0);
    this.nanoscaleGroup.visible = false;

    // 1. 3D DNA Double Helix Strand (Centered cleanly at x = -28)
    this.dnaHelixGroup = new THREE.Group();
    const baseColors: Record<string, number> = {
      A: 0x38bdf8,
      T: 0xf43f5e,
      C: 0xfacc15,
      G: 0x84cc16
    };

    const helixPairs = [
      ['A', 'T'], ['C', 'G'], ['T', 'A'], ['G', 'C'],
      ['A', 'T'], ['A', 'T'], ['C', 'G'], ['G', 'C'],
      ['T', 'A'], ['C', 'G'], ['A', 'T'], ['G', 'C']
    ];

    for (let i = 0; i < helixPairs.length; i++) {
      const y = (i - helixPairs.length / 2) * 14;
      const angle = i * 0.55;
      const radius = 22;

      const p1X = Math.cos(angle) * radius;
      const p1Z = Math.sin(angle) * radius;
      const p2X = -p1X;
      const p2Z = -p1Z;

      const s1Geo = new THREE.SphereGeometry(2.8, 12, 12);
      const s1Mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
      const s1 = new THREE.Mesh(s1Geo, s1Mat);
      s1.position.set(p1X, y, p1Z);
      this.dnaHelixGroup.add(s1);

      const s2 = new THREE.Mesh(s1Geo, s1Mat);
      s2.position.set(p2X, y, p2Z);
      this.dnaHelixGroup.add(s2);

      const base1Type = helixPairs[i][0];
      const base2Type = helixPairs[i][1];

      const rung1Geo = new THREE.CylinderGeometry(1.4, 1.4, radius, 8);
      const rung1Mat = new THREE.MeshStandardMaterial({ color: baseColors[base1Type], emissive: baseColors[base1Type], emissiveIntensity: 0.35 });
      const rung1 = new THREE.Mesh(rung1Geo, rung1Mat);
      rung1.position.set(p1X * 0.5, y, p1Z * 0.5);
      rung1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(p1X, 0, p1Z).normalize());
      this.dnaHelixGroup.add(rung1);

      const rung2Geo = new THREE.CylinderGeometry(1.4, 1.4, radius, 8);
      const rung2Mat = new THREE.MeshStandardMaterial({ color: baseColors[base2Type], emissive: baseColors[base2Type], emissiveIntensity: 0.35 });
      const rung2 = new THREE.Mesh(rung2Geo, rung2Mat);
      rung2.position.set(p2X * 0.5, y, p2Z * 0.5);
      rung2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(p2X, 0, p2Z).normalize());
      this.dnaHelixGroup.add(rung2);
    }

    this.dnaHelixGroup.position.set(-28, 0, 0);
    this.nanoscaleGroup.add(this.dnaHelixGroup);

    // 2. 3D Ribosome Translation Machine (Scaled and positioned neatly beside DNA)
    this.ribosomeGroup = new THREE.Group();
    const largeGeo = new THREE.DodecahedronGeometry(24, 2);
    const largeMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.4, emissive: 0x831843 });
    const largeSubunit = new THREE.Mesh(largeGeo, largeMat);
    largeSubunit.position.set(0, 13, 0);
    this.ribosomeGroup.add(largeSubunit);

    const smallGeo = new THREE.SphereGeometry(16, 20, 20);
    const smallMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.4, emissive: 0x581c87 });
    const smallSubunit = new THREE.Mesh(smallGeo, smallMat);
    smallSubunit.position.set(0, -12, 0);
    this.ribosomeGroup.add(smallSubunit);

    // Peptide chain
    this.peptideChainGroup = new THREE.Group();
    for (let c = 0; c < 7; c++) {
      const beadGeo = new THREE.SphereGeometry(2.6, 12, 12);
      const beadMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 });
      const bead = new THREE.Mesh(beadGeo, beadMat);
      bead.position.set(c * 5, 26 + Math.sin(c) * 2.2, (c % 2) * 2.5);
      this.peptideChainGroup.add(bead);
    }
    this.ribosomeGroup.add(this.peptideChainGroup);

    this.ribosomeGroup.scale.set(0.65, 0.65, 0.65);
    this.ribosomeGroup.position.set(26, -3, 0);
    this.nanoscaleGroup.add(this.ribosomeGroup);

    // 3. Glowing mRNA Filament connecting DNA transcription fork to Ribosome
    const filamentPoints = [
      new THREE.Vector3(-10, 0, 0),
      new THREE.Vector3(2, 6, 4),
      new THREE.Vector3(14, 1, 0),
      new THREE.Vector3(26, -3, 0)
    ];
    const filamentGeo = new THREE.BufferGeometry().setFromPoints(filamentPoints);
    const filamentMat = new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 2 });
    this.mrnaFilamentMesh = new THREE.Line(filamentGeo, filamentMat);
    this.nanoscaleGroup.add(this.mrnaFilamentMesh);
  }

  private createBacteriophage3D(): THREE.Group {
    const group = new THREE.Group();
    const headGeo = new THREE.IcosahedronGeometry(7, 0);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.6 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 10;
    group.add(head);

    const sheathGeo = new THREE.CylinderGeometry(1.6, 1.6, 10, 8);
    const sheathMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const sheath = new THREE.Mesh(sheathGeo, sheathMat);
    sheath.position.y = 2;
    group.add(sheath);

    for (let l = 0; l < 6; l++) {
      const legGeo = new THREE.CylinderGeometry(0.4, 0.4, 9, 6);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      const leg = new THREE.Mesh(legGeo, legMat);
      const angle = (l * Math.PI * 2) / 6;
      leg.position.set(Math.cos(angle) * 3.0, -5, Math.sin(angle) * 3.0);
      leg.rotation.z = Math.PI / 4;
      leg.rotation.y = angle;
      group.add(leg);
    }
    return group;
  }

  private createCoronavirus3D(): THREE.Group {
    const group = new THREE.Group();
    const envelopeGeo = new THREE.SphereGeometry(10, 16, 16);
    const envelopeMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.35, emissive: 0x450a0a });
    const envelope = new THREE.Mesh(envelopeGeo, envelopeMat);
    group.add(envelope);

    for (let s = 0; s < 18; s++) {
      const phi = Math.acos(-1 + (2 * s) / 18);
      const theta = Math.sqrt(18 * Math.PI) * phi;
      const spikeGeo = new THREE.ConeGeometry(1.6, 4.5, 6);
      const spikeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0x78350f });
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.setFromSphericalCoords(11, phi, theta);
      spike.lookAt(spike.position.clone().multiplyScalar(2));
      group.add(spike);
    }
    return group;
  }

  private createAntibody3D(): THREE.Group {
    const group = new THREE.Group();
    const stemGeo = new THREE.CylinderGeometry(1.0, 1.0, 8, 6);
    const mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 });

    const stem = new THREE.Mesh(stemGeo, mat);
    stem.position.y = -3;
    group.add(stem);

    const arm1 = new THREE.Mesh(stemGeo, mat);
    arm1.position.set(-2.8, 3, 0);
    arm1.rotation.z = Math.PI / 3;
    group.add(arm1);

    const arm2 = new THREE.Mesh(stemGeo, mat);
    arm2.position.set(2.8, 3, 0);
    arm2.rotation.z = -Math.PI / 3;
    group.add(arm2);

    return group;
  }

  private createMacrophage3D(): THREE.Group {
    const group = new THREE.Group();
    const bodyGeo = new THREE.DodecahedronGeometry(28, 2);
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      emissive: 0x064e3b,
      roughness: 0.45,
      transmission: 0.5,
      transparent: true,
      opacity: 0.9
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);
    return group;
  }

  private setupInteractionListeners(): void {
    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e: PointerEvent) => {
      this.isPointerDown = true;
      this.pointerPrevX = e.clientX;
      this.pointerPrevY = e.clientY;
    });

    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isPointerDown) return;
      const dx = e.clientX - this.pointerPrevX;
      const dy = e.clientY - this.pointerPrevY;

      this.targetRotY += dx * 0.005;
      this.targetRotX += dy * 0.005;

      this.pointerPrevX = e.clientX;
      this.pointerPrevY = e.clientY;
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    dom.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        if (this.targetZoom >= 1000) this.targetZoom = 100;
        else if (this.targetZoom >= 100) this.targetZoom = 10;
      } else {
        if (this.targetZoom <= 10) this.targetZoom = 100;
        else if (this.targetZoom <= 100) this.targetZoom = 1000;
      }
    }, { passive: false });
  }

  public setZoom(zoom: number): void {
    this.targetZoom = zoom;
  }

  public getZoom(): number {
    return this.targetZoom;
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Projects a 3D world position into 2D screen space (width, height)
   */
  public projectToScreen(x: number, y: number, z: number): { x: number; y: number; visible: boolean } {
    const v = new THREE.Vector3(x, y, z);
    v.project(this.camera);

    const w = this.renderer.domElement.clientWidth;
    const h = this.renderer.domElement.clientHeight;

    return {
      x: (v.x * 0.5 + 0.5) * w,
      y: (-v.y * 0.5 + 0.5) * h,
      visible: v.z < 1.0
    };
  }

  /**
   * Main Render Loop with STRICT Scale Isolation & Clean Organelle Spacing
   */
  public update(
    dt: number,
    physicsEngine: CellPhysicsEngine,
    metabolicState: MetabolicState,
    immuneEngine: ImmuneSystemEngine,
    geneticsInfo: { gfpActive: boolean; flagellinActive: boolean; isSickleCell: boolean; isThermostable: boolean },
    activeMode: string
  ): void {
    const time = this.clock.getElapsedTime();

    this.rotX += (this.targetRotX - this.rotX) * 0.1;
    this.rotY += (this.targetRotY - this.rotY) * 0.1;
    this.currentZoom += (this.targetZoom - this.currentZoom) * 0.09;

    const isNanoscale = this.currentZoom >= 300 || activeMode === 'dna_lab';
    const isMacro = !isNanoscale && this.currentZoom <= 30;
    const isCellular = !isNanoscale && !isMacro;

    // Strict visibility gating
    this.macroGroup.visible = isMacro;
    this.cellularGroup.visible = isCellular || (isMacro && !physicsEngine.isBurst);
    this.nanoscaleGroup.visible = isNanoscale;

    if (isNanoscale) {
      this.targetCamDistance = 180; // Perfect framing for DNA & Ribosome
    } else if (isMacro) {
      this.targetCamDistance = 1250;
    } else {
      this.targetCamDistance = 500;
    }

    this.cameraDistance += (this.targetCamDistance - this.cameraDistance) * 0.08;

    this.camera.position.x = Math.sin(this.rotY) * Math.cos(this.rotX) * this.cameraDistance;
    this.camera.position.y = Math.sin(this.rotX) * this.cameraDistance;
    this.camera.position.z = Math.cos(this.rotY) * Math.cos(this.rotX) * this.cameraDistance;
    this.camera.lookAt(0, 0, 0);

    // 1. Nanoscale Studio Updates
    if (isNanoscale) {
      if (this.dnaHelixGroup) {
        this.dnaHelixGroup.rotation.y += dt * 0.4;
      }
      if (this.ribosomeGroup) {
        this.ribosomeGroup.rotation.y = Math.sin(time * 0.4) * 0.12;
      }
    }

    // 2. Cellular Scale Updates
    if (this.cellularGroup.visible) {
      // Soft-Body Deformable Membrane
      if (this.membraneGeometry && this.originalMembranePositions && this.membraneMesh) {
        const posAttr = this.membraneGeometry.attributes.position;
        const count = posAttr.count;
        const scaleFactor = physicsEngine.isBurst ? 0.001 : (physicsEngine.currentRadius / physicsEngine.baseRadius) * 0.92;

        const isHypertonic = metabolicState.osmoticPressure > 360;
        const wrinkleAmplitude = isHypertonic ? 8 : 1.8;

        for (let i = 0; i < count; i++) {
          const ox = this.originalMembranePositions[i * 3];
          const oy = this.originalMembranePositions[i * 3 + 1];
          const oz = this.originalMembranePositions[i * 3 + 2];

          const wave = Math.sin(ox * 0.04 + time * 1.8) * Math.cos(oz * 0.04 + time * 1.4) * wrinkleAmplitude;
          posAttr.setXYZ(i, (ox + wave) * scaleFactor, (oy + wave) * scaleFactor, (oz + wave) * scaleFactor);
        }
        posAttr.needsUpdate = true;
        this.membraneGeometry.computeVertexNormals();
      }

      // ATP Synthase Rotor
      if (this.atpSynthaseRotor1) {
        const rotorSpeed = (metabolicState.atpSynthaseRpm / 60) * Math.PI * 2 * dt;
        this.atpSynthaseRotor1.rotation.y += rotorSpeed;
      }

      // GFP Lighting
      if (this.gfpLight) {
        const targetGfp = geneticsInfo.gfpActive ? 2.4 : 0.05;
        this.gfpLight.intensity += (targetGfp - this.gfpLight.intensity) * 0.1;
      }

      // Flagellin Whip
      if (this.flagellumMesh) {
        this.flagellumMesh.visible = geneticsInfo.flagellinActive;
        if (geneticsInfo.flagellinActive) {
          const posAttr = this.flagellumMesh.geometry.attributes.position;
          for (let p = 0; p < posAttr.count; p++) {
            const wave = Math.sin(time * 8 - p * 0.35) * (p * 0.6);
            posAttr.setY(p, wave);
            posAttr.setZ(p, Math.cos(time * 8 - p * 0.35) * (p * 0.45));
          }
          posAttr.needsUpdate = true;
        }
      }

      // Subtle Organelle Drift
      if (this.nucleusMesh) this.nucleusMesh.rotation.y += dt * 0.03;
      if (this.golgiGroup) this.golgiGroup.rotation.y = Math.PI / 5 + Math.sin(time * 0.4) * 0.05;

      // Update Real-Time Projected Screen Coordinates for Callouts
      this.updateProjectedCallouts(metabolicState, geneticsInfo);
    } else {
      this.projectedCallouts = [];
    }

    // 3. Extracellular Pathogens & Immune Updates
    const activeVirions = immuneEngine.state.virionsExtracellular;
    const currentVirionIds = new Set(activeVirions.map(v => v.id));

    for (const [id, mesh] of this.virionMeshes.entries()) {
      if (!currentVirionIds.has(id)) {
        this.cellularGroup.remove(mesh);
        this.macroGroup.remove(mesh);
        this.virionMeshes.delete(id);
      }
    }

    for (const v of activeVirions) {
      let vMesh = this.virionMeshes.get(v.id);
      if (!vMesh) {
        vMesh = v.type === 'bacteriophage' ? this.createBacteriophage3D() : this.createCoronavirus3D();
        this.cellularGroup.add(vMesh);
        this.virionMeshes.set(v.id, vMesh);
      }
      vMesh.position.set(v.x, v.y, 0);
      vMesh.rotation.z = v.angle;
    }

    const activeAntibodies = immuneEngine.state.antibodies;
    const currentAntibodyIds = new Set(activeAntibodies.map(a => a.id));

    for (const [id, mesh] of this.antibodyMeshes.entries()) {
      if (!currentAntibodyIds.has(id)) {
        this.cellularGroup.remove(mesh);
        this.antibodyMeshes.delete(id);
      }
    }

    for (const ab of activeAntibodies) {
      let abMesh = this.antibodyMeshes.get(ab.id);
      if (!abMesh) {
        abMesh = this.createAntibody3D();
        this.cellularGroup.add(abMesh);
        this.antibodyMeshes.set(ab.id, abMesh);
      }
      abMesh.position.set(ab.x, ab.y, 0);
    }

    const activeMacros = immuneEngine.state.macrophages;
    const currentMacroIds = new Set(activeMacros.map(m => m.id));

    for (const [id, mesh] of this.macrophageMeshes.entries()) {
      if (!currentMacroIds.has(id)) {
        this.cellularGroup.remove(mesh);
        this.macrophageMeshes.delete(id);
      }
    }

    for (const macro of activeMacros) {
      let mMesh = this.macrophageMeshes.get(macro.id);
      if (!mMesh) {
        mMesh = this.createMacrophage3D();
        this.cellularGroup.add(mMesh);
        this.macrophageMeshes.set(macro.id, mMesh);
      }
      mMesh.position.set(macro.x, macro.y, 0);
      mMesh.rotation.z += dt * 0.15;
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Projects 3D organelle world positions to 2D screen positions for tracking callouts
   */
  private updateProjectedCallouts(
    metabolicState: MetabolicState,
    geneticsInfo: { flagellinActive: boolean }
  ): void {
    const list: OrganelleScreenPos[] = [];

    // Mitochondria 1
    if (this.mitochondria1) {
      const pos = this.mitochondria1.position;
      const proj = this.projectToScreen(pos.x + 18, pos.y - 12, pos.z);
      list.push({
        id: 'mito',
        name: 'Mitochondria (F0/F1 Turbine)',
        detail: `${metabolicState.atpSynthaseRpm} RPM | ΔΨ ${metabolicState.protonGradient.toFixed(0)}%`,
        screenX: proj.x,
        screenY: proj.y,
        color: '#facc15',
        visible: proj.visible
      });
    }

    // Nucleus (offset upwards so it does not cover chromatin center)
    if (this.nucleusMesh) {
      const pos = this.nucleusMesh.position;
      const proj = this.projectToScreen(pos.x, pos.y + 42, pos.z);
      list.push({
        id: 'nuc',
        name: 'Nucleus (DNA Vault)',
        detail: 'Active Nuclear Pores',
        screenX: proj.x,
        screenY: proj.y,
        color: '#818cf8',
        visible: proj.visible
      });
    }

    // Golgi
    if (this.golgiGroup) {
      const pos = this.golgiGroup.position;
      const proj = this.projectToScreen(pos.x - 22, pos.y + 18, pos.z);
      list.push({
        id: 'golgi',
        name: 'Golgi Complex',
        detail: 'Transport Vesicle Secretion',
        screenX: proj.x,
        screenY: proj.y,
        color: '#ec4899',
        visible: proj.visible
      });
    }

    // Lysosome
    if (this.lysosomes.length > 0) {
      const pos = this.lysosomes[0].position;
      const proj = this.projectToScreen(pos.x + 10, pos.y + 12, pos.z);
      list.push({
        id: 'lyso',
        name: 'Lysosome',
        detail: 'Acid Hydrolases pH 4.8',
        screenX: proj.x,
        screenY: proj.y,
        color: '#ef4444',
        visible: proj.visible
      });
    }

    // Flagellin
    if (geneticsInfo.flagellinActive && this.flagellumMesh) {
      const proj = this.projectToScreen(-160, 0, 0);
      list.push({
        id: 'flag',
        name: 'Flagellum Motor',
        detail: 'Motility Active (+140%)',
        screenX: proj.x,
        screenY: proj.y,
        color: '#38bdf8',
        visible: proj.visible
      });
    }

    this.projectedCallouts = list;
  }

  public dispose(): void {
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
