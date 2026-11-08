/**
 * GeneticsTranslator.ts
 * Rigorous Biological Central Dogma & Genetic Engine:
 * - 64-Codon Universal Genetic Code Table
 * - DNA Double Helix Unzipper (Helicase) & Complementary Base Pairing
 * - mRNA Transcription via RNA Polymerase
 * - Ribosomal Codon Translation (Start AUG -> Stop UAA/UAG/UGA)
 * - Real-Time Mutation Engine with Phenotypic Consequences:
 *    * GFP (Green Fluorescent Protein)
 *    * FLA (Flagellin Tail Motility)
 *    * HBB (Beta-Globin / Sickle Cell E6V)
 *    * SOX (Hydrothermal Extremophile Resistance)
 */

export type NucleotideDNA = 'A' | 'T' | 'C' | 'G';
export type NucleotideRNA = 'A' | 'U' | 'C' | 'G';

export interface AminoAcidInfo {
  name: string;
  code3: string;
  code1: string;
  polarity: 'nonpolar' | 'polar' | 'positive' | 'negative';
  hydrophobicity: number; // Kyte-Doolittle scale (-4.5 to +4.5)
  color: string;
}

export interface CodonTranslationResult {
  aminoAcid: AminoAcidInfo | null;
  isStart: boolean;
  isStop: boolean;
  tRNAAnticodon: string;
  codon: string;
}

export interface GeneDefinition {
  id: string;
  name: string;
  symbol: string;
  description: string;
  wildTypeDnaTemplate: string; // 3' to 5' template strand
  phenotypeDescription: string;
  category: 'luminescence' | 'motility' | 'hemoglobin' | 'extremophile';
}

// 20 Standard Amino Acids + Stop
export const AMINO_ACID_MAP: Record<string, AminoAcidInfo> = {
  Ala: { name: 'Alanine', code3: 'Ala', code1: 'A', polarity: 'nonpolar', hydrophobicity: 1.8, color: '#38bdf8' },
  Arg: { name: 'Arginine', code3: 'Arg', code1: 'R', polarity: 'positive', hydrophobicity: -4.5, color: '#818cf8' },
  Asn: { name: 'Asparagine', code3: 'Asn', code1: 'N', polarity: 'polar', hydrophobicity: -3.5, color: '#a78bfa' },
  Asp: { name: 'Aspartic Acid', code3: 'Asp', code1: 'D', polarity: 'negative', hydrophobicity: -3.5, color: '#f43f5e' },
  Cys: { name: 'Cysteine', code3: 'Cys', code1: 'C', polarity: 'polar', hydrophobicity: 2.5, color: '#fbbf24' },
  Gln: { name: 'Glutamine', code3: 'Gln', code1: 'Q', polarity: 'polar', hydrophobicity: -3.5, color: '#c084fc' },
  Glu: { name: 'Glutamic Acid', code3: 'Glu', code1: 'E', polarity: 'negative', hydrophobicity: -3.5, color: '#e11d48' },
  Gly: { name: 'Glycine', code3: 'Gly', code1: 'G', polarity: 'nonpolar', hydrophobicity: -0.4, color: '#94a3b8' },
  His: { name: 'Histidine', code3: 'His', code1: 'H', polarity: 'positive', hydrophobicity: -3.2, color: '#6366f1' },
  Ile: { name: 'Isoleucine', code3: 'Ile', code1: 'I', polarity: 'nonpolar', hydrophobicity: 4.5, color: '#0ea5e9' },
  Leu: { name: 'Leucine', code3: 'Leu', code1: 'L', polarity: 'nonpolar', hydrophobicity: 3.8, color: '#0284c7' },
  Lys: { name: 'Lysine', code3: 'Lys', code1: 'K', polarity: 'positive', hydrophobicity: -3.9, color: '#4f46e5' },
  Met: { name: 'Methionine', code3: 'Met', code1: 'M', polarity: 'nonpolar', hydrophobicity: 1.9, color: '#10b981' },
  Phe: { name: 'Phenylalanine', code3: 'Phe', code1: 'F', polarity: 'nonpolar', hydrophobicity: 2.8, color: '#059669' },
  Pro: { name: 'Proline', code3: 'Pro', code1: 'P', polarity: 'nonpolar', hydrophobicity: -1.6, color: '#64748b' },
  Ser: { name: 'Serine', code3: 'Ser', code1: 'S', polarity: 'polar', hydrophobicity: -0.8, color: '#2dd4bf' },
  Thr: { name: 'Threonine', code3: 'Thr', code1: 'T', polarity: 'polar', hydrophobicity: -0.7, color: '#14b8a6' },
  Trp: { name: 'Tryptophan', code3: 'Trp', code1: 'W', polarity: 'nonpolar', hydrophobicity: -0.9, color: '#0d9488' },
  Tyr: { name: 'Tyrosine', code3: 'Tyr', code1: 'Y', polarity: 'polar', hydrophobicity: -1.3, color: '#f59e0b' },
  Val: { name: 'Valine', code3: 'Val', code1: 'V', polarity: 'nonpolar', hydrophobicity: 4.2, color: '#06b6d4' }
};

// Full 64-Codon Genetic Code Dictionary
export const GENETIC_CODE_TABLE: Record<string, string> = {
  // U*
  UUU: 'Phe', UUC: 'Phe', UUA: 'Leu', UUG: 'Leu',
  UCU: 'Ser', UCC: 'Ser', UCA: 'Ser', UCG: 'Ser',
  UAU: 'Tyr', UAC: 'Tyr', UAA: 'STOP', UAG: 'STOP',
  UGU: 'Cys', UGC: 'Cys', UGA: 'STOP', UGG: 'Trp',

  // C*
  CUU: 'Leu', CUC: 'Leu', CUA: 'Leu', CUG: 'Leu',
  CCU: 'Pro', CCC: 'Pro', CCA: 'Pro', CCG: 'Pro',
  CAU: 'His', CAC: 'His', CAA: 'Gln', CAG: 'Gln',
  CGU: 'Arg', CGC: 'Arg', CGA: 'Arg', CGG: 'Arg',

  // A*
  AUU: 'Ile', AUC: 'Ile', AUA: 'Ile', AUG: 'Met', // AUG is Start
  ACU: 'Thr', ACC: 'Thr', ACA: 'Thr', ACG: 'Thr',
  AAU: 'Asn', AAC: 'Asn', AAA: 'Lys', AAG: 'Lys',
  AGU: 'Ser', AGC: 'Ser', AGA: 'Arg', AGG: 'Arg',

  // G*
  GUU: 'Val', GUC: 'Val', GUA: 'Val', GUG: 'Val',
  GCU: 'Ala', GCC: 'Ala', GCA: 'Ala', GCG: 'Ala',
  GAU: 'Asp', GAC: 'Asp', GAA: 'Glu', GAG: 'Glu',
  GGU: 'Gly', GGC: 'Gly', GGA: 'Gly', GGG: 'Gly'
};

// Preset Genomic Library for MicroCraft
export const PRESET_GENES: GeneDefinition[] = [
  {
    id: 'gfp',
    name: 'Green Fluorescent Protein',
    symbol: 'GFP',
    description: 'Aequorea victoria bioluminescent fluorophore that synthesizes a vibrant cyan-green light emitter in cytoplasm.',
    // Template strand 3' -> 5' (Transcribes into: AUG UCG AAA GGC GAA GAG UUG UAA)
    wildTypeDnaTemplate: 'TAC AGC TTT CCG CTT CTC AAC ATT',
    phenotypeDescription: 'Bioluminescent cytoplasmic glow (Phosphor Green #84cc16)',
    category: 'luminescence'
  },
  {
    id: 'fla',
    name: 'Flagellin Filament Subunit',
    symbol: 'FLA',
    description: 'Structural building block for the bacterial rotary flagellum that propels cellular movement.',
    // Template strand (Transcribes into: AUG GCC GUA GCG UUG GAG GCC UGA)
    wildTypeDnaTemplate: 'TAC CGG CAT CGC AAC CTC CGG ACT',
    phenotypeDescription: 'Whipping flagellum motor (+140% cellular swimming velocity)',
    category: 'motility'
  },
  {
    id: 'hbb',
    name: 'Hemoglobin Subunit Beta',
    symbol: 'HBB',
    description: 'Oxygen-binding globin chain. Sickle-cell disease is caused by an A->T transversion in codon 6 (GAG->GTG).',
    // Template strand (Transcribes into: AUG GUG CAC CUG ACU CCU GAG GAG AAG UCU GCC UAA)
    wildTypeDnaTemplate: 'TAC CAC GTG GAC TGA GGA CTC CTC TTC AGA CGG ATT',
    phenotypeDescription: 'Healthy biconcave cell morphology & optimal O2 affinity',
    category: 'hemoglobin'
  },
  {
    id: 'sox',
    name: 'Sulfur Extremophile Chaperone',
    symbol: 'SOX',
    description: 'Thermostable sulfur oxidoreductase chaperone that protects cell membranes at boiling temperatures.',
    // Template strand (Transcribes into: AUG UGG UGU GAG CUC UAU GCG UAA)
    wildTypeDnaTemplate: 'TAC ACC ACA CTC GAG ATA CGC ATT',
    phenotypeDescription: 'Thermal resistance to hydrothermal vents (survival up to 105°C)',
    category: 'extremophile'
  }
];

export class GeneticsEngine {
  /**
   * Returns complementary DNA coding strand for a template strand (3' -> 5' vs 5' -> 3')
   */
  public static getComplementaryDnaStrand(strand: string): string {
    const pairs: Record<string, string> = { A: 'T', T: 'A', C: 'G', G: 'C', ' ': ' ' };
    return strand
      .toUpperCase()
      .split('')
      .map(b => pairs[b] || 'N')
      .join('');
  }

  /**
   * Transcribes DNA template strand (3' to 5') into mRNA transcript (5' to 3')
   * A -> U, T -> A, C -> G, G -> C
   */
  public static transcribeDnaToMRna(dnaTemplate: string): string {
    const transcriptionMap: Record<string, string> = {
      A: 'U',
      T: 'A',
      C: 'G',
      G: 'C',
      ' ': ''
    };
    return dnaTemplate
      .toUpperCase()
      .split('')
      .map(base => transcriptionMap[base] || '')
      .join('');
  }

  /**
   * Calculates tRNA anticodon for an mRNA codon (Watson-Crick pairing: A-U, U-A, G-C, C-G)
   */
  public static getTRNAAnticodon(codon: string): string {
    const antiMap: Record<string, string> = { A: 'U', U: 'A', G: 'C', C: 'G' };
    return codon
      .toUpperCase()
      .split('')
      .map(b => antiMap[b] || 'N')
      .join('');
  }

  /**
   * Translates an mRNA sequence into a polypeptide chain using the standard 64-codon table
   */
  public static translateMRna(mRna: string): {
    codons: CodonTranslationResult[];
    polypeptide: AminoAcidInfo[];
    hasStartCodon: boolean;
    hasTerminated: boolean;
    foldingStabilityScore: number;
    mutationEffects: {
      isTruncated: boolean;
      gfpActive: boolean;
      flagellinActive: boolean;
      isSickleCell: boolean;
      isThermostable: boolean;
    };
  } {
    const cleanedMRna = mRna.replace(/[^AUCG]/gi, '').toUpperCase();
    const codons: CodonTranslationResult[] = [];
    const polypeptide: AminoAcidInfo[] = [];

    let hasStartCodon = false;
    let hasTerminated = false;
    let readingStarted = false;

    for (let i = 0; i + 3 <= cleanedMRna.length; i += 3) {
      const codon = cleanedMRna.substring(i, i + 3);
      const aaKey = GENETIC_CODE_TABLE[codon] || null;

      const isStart = codon === 'AUG';
      const isStop = aaKey === 'STOP';

      if (isStart) {
        readingStarted = true;
        hasStartCodon = true;
      }

      if (readingStarted && !hasTerminated) {
        if (isStop) {
          hasTerminated = true;
          codons.push({
            codon,
            aminoAcid: null,
            isStart: false,
            isStop: true,
            tRNAAnticodon: this.getTRNAAnticodon(codon)
          });
          break;
        }

        const aaInfo = aaKey ? AMINO_ACID_MAP[aaKey] || null : null;
        if (aaInfo) {
          polypeptide.push(aaInfo);
        }

        codons.push({
          codon,
          aminoAcid: aaInfo,
          isStart,
          isStop: false,
          tRNAAnticodon: this.getTRNAAnticodon(codon)
        });
      } else if (!readingStarted) {
        // Untranslated Leader Region (5' UTR)
        codons.push({
          codon,
          aminoAcid: aaKey ? AMINO_ACID_MAP[aaKey] || null : null,
          isStart,
          isStop,
          tRNAAnticodon: this.getTRNAAnticodon(codon)
        });
      }
    }

    // Folding stability calculation based on hydrophobic core formation
    let hydrophobicSum = 0;
    polypeptide.forEach(aa => {
      hydrophobicSum += Math.abs(aa.hydrophobicity);
    });
    const avgHydrophobicity = polypeptide.length > 0 ? hydrophobicSum / polypeptide.length : 0;
    const lengthScore = Math.min(1.0, polypeptide.length / 8);
    const foldingStabilityScore = Math.min(100, Math.round((avgHydrophobicity * 14 + lengthScore * 40)));

    // Phenotype checks
    const peptide1Letter = polypeptide.map(a => a.code1).join('');
    const isTruncated = polypeptide.length < 5;
    const gfpActive = peptide1Letter.startsWith('MSKGEEL') || (peptide1Letter.length >= 7 && polypeptide.some(p => p.code3 === 'Gly'));
    const flagellinActive = peptide1Letter.startsWith('MAVALEA') || (peptide1Letter.length >= 6 && polypeptide.some(p => p.code3 === 'Ala'));
    
    // Check if 6th amino acid of beta-globin changed Glu (E) -> Val (V)
    // Wildtype HBB: MVHLTPEEKSA... (Glu at pos 6)
    // Sickle HBB:   MVHLTPVEKSA... (Val at pos 6)
    const isSickleCell = peptide1Letter.length >= 7 && peptide1Letter.charAt(5) === 'V';
    const isThermostable = peptide1Letter.startsWith('MWCEYA') || (peptide1Letter.length >= 6 && polypeptide.some(p => p.code3 === 'Cys'));

    return {
      codons,
      polypeptide,
      hasStartCodon,
      hasTerminated,
      foldingStabilityScore,
      mutationEffects: {
        isTruncated,
        gfpActive: !isTruncated && gfpActive,
        flagellinActive: !isTruncated && flagellinActive,
        isSickleCell,
        isThermostable: !isTruncated && isThermostable
      }
    };
  }

  /**
   * Applies a point mutation to DNA string
   */
  public static applyMutation(
    dnaSequence: string,
    index: number,
    type: 'substitution' | 'insertion' | 'deletion',
    newBase?: NucleotideDNA
  ): string {
    const bases = dnaSequence.replace(/\s+/g, '').split('');
    if (index < 0 || index >= bases.length && type !== 'insertion') return dnaSequence;

    if (type === 'substitution' && newBase) {
      bases[index] = newBase;
    } else if (type === 'insertion' && newBase) {
      bases.splice(index, 0, newBase);
    } else if (type === 'deletion') {
      bases.splice(index, 1);
    }

    // Regroup into triplets for visual neatness
    const grouped: string[] = [];
    for (let i = 0; i < bases.length; i += 3) {
      grouped.push(bases.slice(i, i + 3).join(''));
    }
    return grouped.join(' ');
  }
}
