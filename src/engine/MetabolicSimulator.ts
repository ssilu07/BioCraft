/**
 * MetabolicSimulator.ts
 * Real-time Biochemic & Metabolic Pathway Simulator:
 * - Cellular Respiration: C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + 36-38 ATP
 * - Glycolysis & Anaerobic Lactic Acid Fermentation (Hypoxia pathway)
 * - Mitochondrial Electron Transport Chain & Proton Motive Force (ΔΨ)
 * - ATP Synthase Turbine Rotor RPM
 * - Intracellular pH Regulation & Buffer Equilibrium
 * - Active Na+/K+ ATPase Pump Osmotic Load
 */

export interface MetabolicState {
  glucose: number; // 0 to 200 (normal: 80 - 120)
  oxygen: number;  // 0 to 100% (normal: 75 - 95%)
  atp: number;     // 0 to 250 units (target: 100)
  adp: number;     // available unphosphorylated substrate
  nadh: number;    // electron carriers
  protonGradient: number; // 0 to 100% across inner mitochondrial cristae
  atpSynthaseRpm: number; // 0 to 9000 RPM (rotor speed)
  lacticAcid: number;     // toxic byproduct of anaerobic fermentation
  co2Waste: number;       // byproduct of Krebs cycle
  intracellularPh: number; // normal: 7.35 - 7.42; acidosis < 7.1
  osmoticPressure: number; // mOsm/kg: normal 290; hypotonic < 220, hypertonic > 380
  aminoAcids: number;      // raw substrate pool for translation
  temperature: number;     // °C: normal 37°C
  toxinLevel: number;      // respiratory chain inhibitors (e.g., cyanide / oligomycin)
  activePumps: number;     // Na+/K+ ATPase pumps active
  efficiency: number;      // mitochondrial coupling efficiency
}

export class MetabolicSimulator {
  private state: MetabolicState;
  private tickCounter: number = 0;

  constructor() {
    this.state = {
      glucose: 95.0,
      oxygen: 85.0,
      atp: 100.0,
      adp: 40.0,
      nadh: 15.0,
      protonGradient: 80.0,
      atpSynthaseRpm: 3600,
      lacticAcid: 0.8,
      co2Waste: 4.2,
      intracellularPh: 7.40,
      osmoticPressure: 290.0,
      aminoAcids: 80.0,
      temperature: 37.0,
      toxinLevel: 0.0,
      activePumps: 10,
      efficiency: 0.92
    };
  }

  public getState(): MetabolicState {
    return { ...this.state };
  }

  public reset(customState?: Partial<MetabolicState>): void {
    this.state = {
      glucose: 95.0,
      oxygen: 85.0,
      atp: 100.0,
      adp: 40.0,
      nadh: 15.0,
      protonGradient: 80.0,
      atpSynthaseRpm: 3600,
      lacticAcid: 0.8,
      co2Waste: 4.2,
      intracellularPh: 7.40,
      osmoticPressure: 290.0,
      aminoAcids: 80.0,
      temperature: 37.0,
      toxinLevel: 0.0,
      activePumps: 10,
      efficiency: 0.92,
      ...customState
    };
  }

  /**
   * Primary metabolic simulation step (called every frame or physics sub-step)
   * @param dt Delta time in seconds (e.g. 0.016 for 60 FPS)
   * @param speedMultiplier Simulation speed (0.5x, 1x, 2x)
   * @param isFlagellinActive Whether flagellum is actively consuming motility ATP
   * @param isThermostable Whether extremophile gene shields against temperature
   */
  public update(
    dt: number,
    speedMultiplier: number = 1.0,
    isFlagellinActive: boolean = false,
    isThermostable: boolean = false
  ): { atpProduced: number; atpConsumed: number; wasLysisInduced: boolean } {
    const effectiveDt = dt * speedMultiplier;
    this.tickCounter++;

    let atpProduced = 0;
    let atpConsumed = 0;

    // 1. Passive Capillary Perfusion & Basal Diffusion
    // Keeps baseline nutrients stable in physiological saline
    this.state.glucose += (95.0 - this.state.glucose) * 0.08 * effectiveDt;
    this.state.oxygen += (85.0 - this.state.oxygen) * 0.08 * effectiveDt;

    // Temperature Stress & Toxin Degradation
    if (this.state.toxinLevel > 0) {
      this.state.toxinLevel = Math.max(0, this.state.toxinLevel - 0.06 * effectiveDt);
    }

    // High temperature thermal denaturation unless extremophile gene is active
    let thermalInhibition = 1.0;
    if (this.state.temperature > 41.0 && !isThermostable) {
      thermalInhibition = Math.max(0.1, 1.0 - (this.state.temperature - 41.0) * 0.08);
    }

    // Toxin inhibition of ETC (Complex IV)
    const toxinInhibition = Math.max(0.05, 1.0 - this.state.toxinLevel * 0.02);

    // Allosteric Feedback: High ATP inhibits PFK-1 (Phosphofructokinase) to prevent ATP overload
    const atpFeedback = Math.max(0.1, 1.0 - Math.max(0, (this.state.atp - 95.0) / 40.0));
    const overallEnzymeActivity = thermalInhibition * toxinInhibition * atpFeedback;

    // 2. Glycolysis (Cytoplasm): 1 Glucose -> 2 Pyruvate + 2 ATP + 2 NADH
    const glucoseConsumptionRate = Math.min(this.state.glucose, 1.1 * effectiveDt * overallEnzymeActivity);
    if (glucoseConsumptionRate > 0 && this.state.atp < 140.0) {
      this.state.glucose -= glucoseConsumptionRate;
      const glycolysisAtp = glucoseConsumptionRate * 2.0;
      atpProduced += glycolysisAtp;
      this.state.atp = Math.min(140.0, this.state.atp + glycolysisAtp);
      this.state.nadh += glucoseConsumptionRate * 1.5;
    }

    // 3. Aerobic Respiration (Mitochondria) vs. Anaerobic Fermentation
    if (this.state.oxygen > 18.0 && overallEnzymeActivity > 0.2) {
      // Aerobic: Krebs Cycle + Oxidative Phosphorylation
      const oxygenConsumptionRate = Math.min(this.state.oxygen, 1.8 * effectiveDt * overallEnzymeActivity);
      this.state.oxygen -= oxygenConsumptionRate;

      // Pump protons into intermembrane space (charging proton motive force)
      const protonPumpRate = oxygenConsumptionRate * 3.2;
      this.state.protonGradient = Math.min(95.0, this.state.protonGradient + protonPumpRate);

      // Krebs Cycle generates CO2 waste
      this.state.co2Waste += oxygenConsumptionRate * 0.75;

      // Lactic acid clearance by gluconeogenesis / Cori cycle
      if (this.state.lacticAcid > 0.6) {
        this.state.lacticAcid = Math.max(0.6, this.state.lacticAcid - 1.2 * effectiveDt);
      }
    } else {
      // Hypoxia: Anaerobic Glycolysis -> Lactic Acid Accumulation
      const lacticProduced = glucoseConsumptionRate * 2.5;
      this.state.lacticAcid += lacticProduced;

      // Deplete proton gradient without oxygen as terminal electron acceptor
      this.state.protonGradient = Math.max(5, this.state.protonGradient - 3.5 * effectiveDt);
    }

    // 4. ATP Synthase Turbine Rotor (F0/F1 Motor)
    // Protons flow down gradient: drives rotation and phosphorylates ADP -> ATP
    if (this.state.protonGradient > 15.0 && this.state.adp > 2.0 && this.state.atp < 140.0) {
      const gradientFlow = (this.state.protonGradient / 100.0) * overallEnzymeActivity;
      this.state.atpSynthaseRpm = Math.round(gradientFlow * 6000);

      const oxidativeAtp = gradientFlow * 3.8 * effectiveDt;
      atpProduced += oxidativeAtp;
      this.state.atp = Math.min(140.0, this.state.atp + oxidativeAtp);
      this.state.adp = Math.max(5.0, this.state.adp - oxidativeAtp * 0.4);

      this.state.protonGradient = Math.max(10, this.state.protonGradient - oxidativeAtp * 1.0);
    } else {
      this.state.atpSynthaseRpm = Math.max(0, Math.round(this.state.atpSynthaseRpm * 0.92));
    }

    // 5. Intracellular pH Dynamics (Bicarbonate Buffer)
    const acidLoad = ((this.state.lacticAcid - 0.6) * 0.06) + ((this.state.co2Waste - 2.0) * 0.02);
    const targetPh = Math.max(6.2, Math.min(7.45, 7.40 - acidLoad));
    this.state.intracellularPh += (targetPh - this.state.intracellularPh) * 0.08 * effectiveDt;

    // Passive CO2 diffusion
    this.state.co2Waste = Math.max(1.5, this.state.co2Waste - 1.5 * effectiveDt);

    // 6. ATP Consumption Ecosystem
    const pumpAtpCost = (this.state.activePumps * 0.16) * effectiveDt;
    atpConsumed += pumpAtpCost;

    const basalCost = 0.8 * effectiveDt;
    atpConsumed += basalCost;

    if (isFlagellinActive) {
      const flagellarCost = 1.0 * effectiveDt;
      atpConsumed += flagellarCost;
    }

    const totalCost = Math.min(this.state.atp, atpConsumed);
    this.state.atp -= totalCost;
    this.state.adp = Math.min(75.0, this.state.adp + totalCost * 0.8);

    // 7. Osmotic Pressure Regulation via Na+/K+ ATPase
    if (this.state.atp < 12.0) {
      this.state.osmoticPressure = Math.min(450, this.state.osmoticPressure + 10.0 * effectiveDt);
    } else {
      const returnRate = (290.0 - this.state.osmoticPressure) * 0.20 * effectiveDt;
      this.state.osmoticPressure += returnRate;
    }

    // Check for catastrophic cytolysis condition
    const wasLysisInduced = this.state.osmoticPressure > 425.0 || this.state.intracellularPh < 6.35;

    return {
      atpProduced,
      atpConsumed,
      wasLysisInduced
    };
  }

  // --- External Pipette & Environmental Actions ---

  public injectGlucose(amount: number = 30.0): void {
    this.state.glucose = Math.min(200.0, this.state.glucose + amount);
  }

  public injectOxygen(amount: number = 25.0): void {
    this.state.oxygen = Math.min(100.0, this.state.oxygen + amount);
  }

  public injectToxin(amount: number = 20.0): void {
    this.state.toxinLevel = Math.min(50.0, this.state.toxinLevel + amount);
  }

  public setEnvironmentalTonicity(tonicity: 'hypotonic' | 'isotonic' | 'hypertonic'): void {
    if (tonicity === 'hypotonic') {
      // Distilled water environment: water rushes into cell
      this.state.osmoticPressure = Math.min(430, this.state.osmoticPressure + 75.0);
    } else if (tonicity === 'hypertonic') {
      // High saline environment: water rushes out of cell (crenation)
      this.state.osmoticPressure = Math.max(160, this.state.osmoticPressure - 70.0);
    } else {
      // Isotonic: 290 mOsm physiological saline
      this.state.osmoticPressure = 290.0;
    }
  }

  public upgradeIonPumps(count: number = 5): void {
    this.state.activePumps = Math.min(30, this.state.activePumps + count);
  }

  public setTemperature(tempCelsius: number): void {
    this.state.temperature = tempCelsius;
  }
}
