/**
 * GameMissions.ts
 * 5 Fully Playable, Instant-Evaluating Interactive Biological Missions:
 * 1. The Metabolic Tightrope
 * 2. CRISPR Gene Surgery
 * 3. Outbreak Containment
 * 4. Osmotic Rescue
 * 5. The Extremophile Bio-Engineer
 */

import { MetabolicState } from './MetabolicSimulator';
import { ImmuneState } from './ImmuneSystemEngine';

export interface MissionDefinition {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  targetObjective: string;
  recommendedMode: 'sandbox' | 'dna_lab' | 'immune_defense';
  initialSetup: {
    glucose?: number;
    oxygen?: number;
    atp?: number;
    osmoticPressure?: number;
    temperature?: number;
    spawnViruses?: number;
    geneId?: string;
    mutatedDna?: string;
  };
  checkWinCondition: (
    metabolic: MetabolicState,
    immune: ImmuneState,
    genetics: {
      hasStartCodon: boolean;
      hasTerminated: boolean;
      isSickleCell: boolean;
      isThermostable: boolean;
      polypeptideLength: number;
    },
    elapsedSeconds: number
  ) => { isCompleted: boolean; progressPercent: number; statusMessage: string };
}

export const MISSIONS: MissionDefinition[] = [
  {
    id: 1,
    title: 'The Metabolic Tightrope',
    subtitle: 'Cellular Respiration & ATP Equilibrium',
    description: 'Cellular respiration is dangerously low! Regulate Glucose and Oxygen pipettes to reach and maintain 100±5 ATP for 5 continuous seconds without causing hypoxia (O2 < 20%) or lactic acidosis (pH < 7.20).',
    targetObjective: 'Maintain 95 - 105 ATP for 5 seconds with pH > 7.25',
    recommendedMode: 'sandbox',
    initialSetup: {
      glucose: 25,
      oxygen: 30,
      atp: 40,
      osmoticPressure: 290
    },
    checkWinCondition: (metabolic, _immune, _genetics, elapsed) => {
      const atpOk = metabolic.atp >= 95 && metabolic.atp <= 108;
      const phOk = metabolic.intracellularPh >= 7.25;
      const oxygenOk = metabolic.oxygen >= 25;

      let progress = 0;
      if (metabolic.atp > 40) {
        progress = Math.min(100, Math.round(((metabolic.atp - 40) / 60) * 100));
      }

      if (atpOk && phOk && oxygenOk) {
        return {
          isCompleted: elapsed >= 5,
          progressPercent: Math.min(100, Math.round((elapsed / 5) * 100)),
          statusMessage: `Equilibrium holding: ${elapsed.toFixed(1)}s / 5.0s (ATP: ${metabolic.atp.toFixed(0)}, pH: ${metabolic.intracellularPh.toFixed(2)})`
        };
      } else {
        let msg = 'Inject Glucose and Oxygen to ramp up oxidative phosphorylation!';
        if (metabolic.atp > 115) msg = 'ATP overflowing! Pause glucose injection.';
        if (!phOk) msg = 'Warning: Lactic acidosis! Oxygenate immediately to clear lactate.';
        return {
          isCompleted: false,
          progressPercent: progress,
          statusMessage: msg
        };
      }
    }
  },
  {
    id: 2,
    title: 'CRISPR Gene Surgery',
    subtitle: 'Hemoglobin Subunit Beta Repair',
    description: 'A missense point mutation in the Beta-Globin (HBB) gene changed codon 6 from GAG (Glutamic Acid) to GTG (Valine), causing Sickle Cell disease. Use the Genetic Lab editor to repair codon 6 back to GAG.',
    targetObjective: 'Repair codon 6 to synthesize healthy wild-type Beta-Globin (Glu6)',
    recommendedMode: 'dna_lab',
    initialSetup: {
      geneId: 'hbb',
      // Mutated codon 6 has 'CAC' on template strand (transcribes to 'GUG' = Valine)
      // Normal template codon 6 is 'CTC' (transcribes to 'GAG' = Glutamic Acid)
      mutatedDna: 'TAC CAC GTG GAC TGA GGA CAC CTC TTC AGA CGG ATT'
    },
    checkWinCondition: (_metabolic, _immune, genetics) => {
      const isFixed = !genetics.isSickleCell && genetics.hasStartCodon && genetics.polypeptideLength >= 7;
      return {
        isCompleted: isFixed,
        progressPercent: isFixed ? 100 : 35,
        statusMessage: isFixed
          ? 'CRISPR Repair Verified! Wild-type Glutamic Acid (E6) restored.'
          : 'Sickle mutation detected: Codon 6 translates to hydrophobic Valine (V). Repair base to GAG!'
      };
    }
  },
  {
    id: 3,
    title: 'Outbreak Containment',
    subtitle: 'Pathogen Neutralization & Phagocytosis',
    description: 'A pathogenic viral swarm of 25 virions has invaded the extracellular fluid! Boost Plasma B-Cell antibody production and eliminate all virions before the host cell is hijacked and lyses.',
    targetObjective: 'Eliminate or neutralize all 25 virions before internal viral load reaches 60',
    recommendedMode: 'immune_defense',
    initialSetup: {
      spawnViruses: 25
    },
    checkWinCondition: (_metabolic, immune) => {
      const remaining = immune.virionsExtracellular.length;
      const eliminated = immune.totalVirusesEngulfed + immune.totalVirusesNeutralized;
      const progress = Math.min(100, Math.round((eliminated / 25) * 100));

      const won = remaining === 0 && immune.viralLoadInternal === 0 && eliminated >= 10;
      return {
        isCompleted: won,
        progressPercent: progress,
        statusMessage: won
          ? 'Swarm neutralized! All virions cleared by antibodies and macrophages.'
          : `Viruses remaining: ${remaining} | Neutralized/Engulfed: ${eliminated}/25 (Internal Load: ${immune.viralLoadInternal.toFixed(0)})`
      };
    }
  },
  {
    id: 4,
    title: 'Osmotic Rescue',
    subtitle: 'Tonicity Shock & Na+/K+ Pump Defense',
    description: 'The cell has been plunged into a pure hypotonic distilled water solution! Rapidly upgrade membrane ion channels and energize active Na+/K+ ATPase pumps to evacuate water before cytolysis.',
    targetObjective: 'Prevent cell lysis and restore osmotic pressure to healthy range (280 - 310 mOsm)',
    recommendedMode: 'sandbox',
    initialSetup: {
      osmoticPressure: 410, // Near bursting point
      atp: 120
    },
    checkWinCondition: (metabolic) => {
      const isSafe = metabolic.osmoticPressure >= 275 && metabolic.osmoticPressure <= 315;
      const diff = Math.abs(metabolic.osmoticPressure - 290);
      const progress = Math.max(0, Math.min(100, Math.round(100 - (diff / 120) * 100)));

      return {
        isCompleted: isSafe,
        progressPercent: progress,
        statusMessage: isSafe
          ? 'Osmotic equilibrium restored! Membrane tension stabilized at 290 mOsm.'
          : `Current pressure: ${metabolic.osmoticPressure.toFixed(0)} mOsm (Target: 290 mOsm). Upgrade pumps & maintain ATP!`
      };
    }
  },
  {
    id: 5,
    title: 'The Extremophile Bio-Engineer',
    subtitle: 'Hydrothermal Vent Thermostability',
    description: 'Synthesize a synthetic extremophile sulfur oxidoreductase (SOX) protein with stable cysteine disulfide bridges capable of surviving in a boiling 95°C volcanic sulfur vent.',
    targetObjective: 'Transcribe & translate a thermostable chaperone gene at 95°C',
    recommendedMode: 'dna_lab',
    initialSetup: {
      geneId: 'sox',
      temperature: 95
    },
    checkWinCondition: (_metabolic, _immune, genetics) => {
      const isComplete = genetics.isThermostable && genetics.hasStartCodon && genetics.hasTerminated;
      return {
        isCompleted: isComplete,
        progressPercent: isComplete ? 100 : 40,
        statusMessage: isComplete
          ? 'Extremophile protein folded! Disulfide bridges resist 95°C boiling vent heat.'
          : 'Translate thermostable SOX chaperone with Cysteine residues to withstand thermal denaturation!'
      };
    }
  }
];
