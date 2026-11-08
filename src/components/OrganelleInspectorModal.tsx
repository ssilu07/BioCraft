/**
 * OrganelleInspectorModal.tsx
 * University & Medical Grade Organelle Deep-Dive Inspector:
 * - Interactive 3D Callout Tapping or Direct Inspector Selection
 * - Dual-Theme Support (Dark Bioluminescent / Light Clinical Sterile)
 * - Microscopic Ultrastructure, Exact Chemical Equations, Thermodynamics
 * - Clinical Pathology & Pharmacology Links (Diseases, Inhibitors, Antibiotics)
 * - Live Simulation Actions (Trigger Respiration, Autophagy, Exocytosis, Mutations)
 */

import React, { useState } from 'react';
import {
  X,
  Zap,
  Activity,
  Dna,
  Shield,
  Layers,
  FlaskConical,
  AlertCircle,
  Pill,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { audioSynth } from '../engine/OrganicAudioSynth';

export type OrganelleId =
  | 'mitochondria'
  | 'nucleus'
  | 'golgi'
  | 'er'
  | 'lysosome'
  | 'membrane'
  | 'virus'
  | 'macrophage';

export interface OrganelleProfile {
  id: OrganelleId;
  name: string;
  scientificName: string;
  category: string;
  color: string;
  dimensions: string;
  tagline: string;
  ultrastructure: {
    membranes: string;
    subcompartments: string[];
    specializedProteins: string[];
    summary: string;
  };
  biochemicalMechanism: {
    primaryPathway: string;
    formula?: string;
    keyEnzymes: string[];
    thermodynamics: string;
    atpYieldOrCost: string;
    stepByStep: string[];
  };
  clinicalPathology: {
    geneticDiseases: { name: string; mechanism: string }[];
    pharmacologyInhibitors: { drug: string; target: string; effect: string }[];
  };
  simulationExperiment: {
    actionLabel: string;
    description: string;
    actionType: 'respiration' | 'crispr' | 'vesicle' | 'autophagy' | 'pump' | 'antibodies' | 'shock';
  };
}

export const ORGANELLE_PROFILES: Record<OrganelleId, OrganelleProfile> = {
  mitochondria: {
    id: 'mitochondria',
    name: 'Mitochondria',
    scientificName: 'Mitochondrion (pl. Mitochondria)',
    category: 'Bioenergetics & Cellular Respiration',
    color: '#eab308',
    dimensions: '0.5 – 1.0 µm diameter, up to 7 µm length',
    tagline: 'The Cellular Powerhouse driving chemiosmotic ATP synthesis',
    ultrastructure: {
      membranes: 'Dual Phospholipid Bilayer (Smooth outer membrane + extensively folded inner cristae)',
      subcompartments: [
        'Outer Membrane: Porin channels permeable to molecules < 5 kDa',
        'Intermembrane Space: High [H⁺] proton reservoir (pH ~7.0)',
        'Inner Cristae Membrane: Cardiolipin-rich, houses ETC Complexes I-IV & ATP Synthase',
        'Mitochondrial Matrix: Houses Krebs cycle enzymes, circular mtDNA (16.5 kb), and 70S ribosomes'
      ],
      specializedProteins: [
        'Complex I (NADH:ubiquinone oxidoreductase)',
        'Complex II (Succinate dehydrogenase)',
        'Complex III (CoQH2:cytochrome c oxidoreductase)',
        'Complex IV (Cytochrome c oxidase)',
        'F₀F₁-ATP Synthase (Rotary Nanomotor)'
      ],
      summary: 'Believed to have originated via endosymbiosis of an alpha-proteobacterium ~1.5 billion years ago. Maintains its own maternal circular DNA encoding 13 respiratory chain polypeptides.'
    },
    biochemicalMechanism: {
      primaryPathway: 'Aerobic Cellular Respiration & Oxidative Phosphorylation',
      formula: 'C₆H₁₂O₆ + 6 O₂ + 36-38 ADP + 36-38 Pᵢ ➔ 6 CO₂ + 6 H₂O + 36-38 ATP',
      keyEnzymes: ['Pyruvate Dehydrogenase', 'Citrate Synthase', 'Isocitrate Dehydrogenase', 'ATP Synthase'],
      thermodynamics: 'ΔG°′ = -2,880 kJ/mol (Standard Gibbs Free Energy released per mole of glucose)',
      atpYieldOrCost: '+30 to +38 ATP per single Glucose hexose molecule',
      stepByStep: [
        'Glycolysis (Cytosol): 1 Glucose ➔ 2 Pyruvate + 2 NADH + 2 net ATP.',
        'Pyruvate Decarboxylation (Matrix): Pyruvate + CoA ➔ Acetyl-CoA + CO₂ + NADH.',
        'Krebs Cycle (Matrix): Acetyl-CoA is oxidized to yield 6 NADH, 2 FADH₂, 2 GTP/ATP, and 4 CO₂ waste.',
        'Electron Transport Chain: Electrons flow from NADH/FADH₂ to O₂, pumping protons into intermembrane space.',
        'Chemiosmosis & Rotary Torque: Protons flow down electrochemical gradient (ΔΨ ~160 mV) through F₀ turbine, spinning the γ subunit to drive ATP synthesis in F₁ catalytic head at 3,000–6,000 RPM.'
      ]
    },
    clinicalPathology: {
      geneticDiseases: [
        {
          name: 'MELAS Syndrome',
          mechanism: 'mtDNA point mutation (commonly A3243G in MTTL1 gene) impairing mitochondrial protein synthesis, leading to stroke-like episodes, muscle weakness, and lactic acidosis.'
        },
        {
          name: 'Leigh Syndrome (Subacute Necrotizing Encephalomyelopathy)',
          mechanism: 'Defects in Complex I or ATP6 causing rapid neurodegenerative failure of basal ganglia and brainstem in infants.'
        }
      ],
      pharmacologyInhibitors: [
        {
          drug: 'Cyanide (CN⁻) & Carbon Monoxide (CO)',
          target: 'Complex IV (Cytochrome c oxidase)',
          effect: 'Competitively blocks electron transfer to oxygen; ceases ATP synthesis within seconds, fatal cellular asphyxiation.'
        },
        {
          drug: 'Rotenone',
          target: 'Complex I (NADH Dehydrogenase)',
          effect: 'Blocks electron transfer from iron-sulfur clusters to ubiquinone, generating lethal reactive oxygen species (ROS).'
        },
        {
          drug: '2,4-Dinitrophenol (DNP)',
          target: 'Inner Mitochondrial Membrane Proton Gradient',
          effect: 'Lipophilic proton ionophore that uncouples electron transport from phosphorylation; energy dissipates uncontrollably as lethal hyperthermic heat.'
        }
      ]
    },
    simulationExperiment: {
      actionLabel: 'Inject Substrate Boost (+30 Glucose, +25% O₂)',
      description: 'Supercharges matrix electron transport, accelerates the F₀/F₁ turbine RPM, and maximizes cellular ATP output.',
      actionType: 'respiration'
    }
  },

  nucleus: {
    id: 'nucleus',
    name: 'Nucleus & Nuclear Pores',
    scientificName: 'Cell Nucleus (Karyon)',
    category: 'Genomic Governance & Central Dogma',
    color: '#818cf8',
    dimensions: '5 – 8 µm diameter (~10% of total cell volume)',
    tagline: 'The Command Vault safeguarding the diploid genome and transcribing mRNA',
    ultrastructure: {
      membranes: 'Double Nuclear Envelope: Outer membrane continuous with Rough ER, Inner membrane lined with Nuclear Lamina',
      subcompartments: [
        'Nuclear Pore Complexes (NPCs): ~120 nm supramolecular rings with 8-fold rotational symmetry and FG-nucleoporins',
        'Nucleolus: Non-membrane dense sub-region synthesizing ribosomal RNA (rRNA) and assembling pre-ribosomal subunits',
        'Euchromatin: Transcriptionally active, decondensed 10 nm beads-on-a-string nucleosome filaments',
        'Heterochromatin: Transcriptionally repressed, densely condensed chromatin anchored to nuclear lamina'
      ],
      specializedProteins: [
        'RNA Polymerase II (mRNA synthesis)',
        'Histone Octamers (H2A, H2B, H3, H4)',
        'Ran GTPase (Karyopherin-mediated directional transport)',
        'Lamin A/C & Lamin B (Structural intermediate filaments)'
      ],
      summary: 'Safeguards 3.2 billion base pairs of genetic instructions in human somatic cells. Governs cell cycle checkpoint controls, DNA replication, and selective export of mRNA through ~3,000 nuclear pores.'
    },
    biochemicalMechanism: {
      primaryPathway: 'DNA Replication, Watson-Crick Base Pairing & mRNA Transcription',
      formula: 'DNA (Template Strand) + NTPs ➔ pre-mRNA Transcript + PPᵢ (Catalyzed by RNA Pol II)',
      keyEnzymes: ['DNA Helicase', 'RNA Polymerase II', 'Topoisomerase I/II', 'Spliceosome snRNPs'],
      thermodynamics: 'Pyrophosphate hydrolysis (PPᵢ ➔ 2 Pᵢ) by inorganic pyrophosphatase pulls polymerization forward irreversibly.',
      atpYieldOrCost: 'Consumes 2 high-energy phosphate bonds per nucleotide added to the nascent transcript.',
      stepByStep: [
        'Promoter Recognition: Transcription factor TFIID recognizes TATA box in promoter region.',
        'Helicase Unzipping: Helicase unwinds 14-17 base pairs of double helix, creating transcription bubble.',
        'Transcript Elongation: RNA Pol II reads template 3′➔5′ and synthesizes mRNA 5′➔3′ using Watson-Crick rules (A➔U, T➔A, C➔G, G➔C).',
        'Post-Transcriptional Capping: 7-methylguanosine 5′ cap added; introns spliced by spliceosome; poly-A tail added at 3′ end.',
        'Nuclear Pore Export: Mature mRNP complexes are translocated through FG-nucleoporin hydrogel mesh via Exportin/Ran-GTP.'
      ]
    },
    clinicalPathology: {
      geneticDiseases: [
        {
          name: 'Hutchinson-Gilford Progeria Syndrome (HGPS)',
          mechanism: 'De novo point mutation in LMNA gene (c.1824C>T) creates cryptic splice site, producing truncated toxic "progerin". Progerin disrupts nuclear envelope architecture, causing premature cellular senescence.'
        },
        {
          name: 'Spinal Muscular Atrophy (SMA)',
          mechanism: 'Loss of SMN1 gene prevents proper snRNP assembly in the nucleolus/nucleus, crippling spliceosome function and killing motor neurons.'
        }
      ],
      pharmacologyInhibitors: [
        {
          drug: 'Selinexor (KPT-330)',
          target: 'Exportin-1 (XPO1 / CRM1)',
          effect: 'Blocks nuclear export of tumor suppressor proteins (p53, IκB), forcing malignant cells to undergo apoptosis in multiple myeloma.'
        },
        {
          drug: 'Actinomycin D',
          target: 'DNA Guanine-Cytosine Base Pairs',
          effect: 'Intercalates between adjacent G-C base pairs, physically obstructing RNA polymerase progression and halting transcription.'
        }
      ]
    },
    simulationExperiment: {
      actionLabel: 'Teleport to Nanoscale 1000× DNA/mRNA Lab',
      description: 'Inspect the unzipping double-helix strand, watch tRNA codon translation in real time, and edit codons via CRISPR.',
      actionType: 'crispr'
    }
  },

  golgi: {
    id: 'golgi',
    name: 'Golgi Apparatus',
    scientificName: 'Complexus Golgiensis (Dictyosome)',
    category: 'Protein Modification & Vesicular Secretion',
    color: '#a855f7',
    dimensions: '1 – 3 µm diameter stacks of 4 to 8 cisternae',
    tagline: 'The Cellular Shipping Hub packaging glycoproteins into transport vesicles',
    ultrastructure: {
      membranes: 'Polarized stacks of smooth membranous flattened cisternae with budding vesicle peripheries',
      subcompartments: [
        'Cis-Golgi Network (CGN): Convex face receiving COPII vesicles from endoplasmic reticulum',
        'Medial Cisternae: Central enzymatic processing chambers for glycosylation trimming and sugar addition',
        'Trans-Golgi Network (TGN): Concave exit face sorting proteins into lysosomes, secretory granules, or plasma membrane'
      ],
      specializedProteins: [
        'Mannosyltransferases & Glycosyltransferases',
        'GlcNAc Phosphotransferase (Mannose-6-phosphate tagging)',
        'Clathrin & Adaptor Protein 1 (AP-1)',
        'v-SNARE (VAMP/Synaptobrevin) & t-SNARE (Syntaxin/SNAP-25)'
      ],
      summary: 'Discovered in 1898 by Italian Nobel laureate Camillo Golgi. Functions as the molecular sorting facility where proteins undergo extensive post-translational modifications before targeted dispatch.'
    },
    biochemicalMechanism: {
      primaryPathway: 'Post-Translational Glycosylation & Vesicular Budding (Exocytosis)',
      formula: 'Core Oligosaccharide + UDP-Sugars ➔ Complex N-Linked & O-Linked Glycoprotein + UDP',
      keyEnzymes: ['Galactosyltransferase', 'Sialyltransferase', 'Sphingomyelin Synthase', 'Fucosyltransferase'],
      thermodynamics: 'Driven by nucleotide sugar donor hydrolysis (UDP-Gal, CMP-NANA) releasing free energy.',
      atpYieldOrCost: 'Consumes ATP for vacuolar acidification and GTP for ARF1/Rab GTPase vesicle coat assembly and scission.',
      stepByStep: [
        'Vesicle Arrival: COPII coated vesicles bud from ER and fuse with Cis-Golgi network using Rab and SNARE proteins.',
        'Oligosaccharide Trimming: Mannosidases strip terminal mannose residues from N-linked high-mannose trees.',
        'Sugar Chain Elongation: Medial and trans cisternae add N-acetylglucosamine (GlcNAc), Galactose, and Sialic acid.',
        'Mannose-6-Phosphate (M6P) Tagging: Hydrolase enzymes designated for lysosomes are tagged with M6P in cis-Golgi.',
        'Vesicle Pinching & Exocytosis: Dynamin and clathrin pinch off glowing transport vesicles from TGN to fuse with cell membrane.'
      ]
    },
    clinicalPathology: {
      geneticDiseases: [
        {
          name: 'I-Cell Disease (Inclusion-Cell Disease / Mucolipidosis II)',
          mechanism: 'Deficiency of UDP-N-acetylglucosamine:lysosomal enzyme N-acetylglucosaminyl-1-phosphotransferase. Hydrolases fail to receive M6P tag and are mistakenly secreted into blood, causing fatal organ accumulation of dense inclusions.'
        },
        {
          name: 'Congenital Disorders of Glycosylation (CDG)',
          mechanism: 'Enzyme defects in Golgi N-glycosylation pathways causing multi-system developmental and neurological delays.'
        }
      ],
      pharmacologyInhibitors: [
        {
          drug: 'Brefeldin A',
          target: 'ARF1 Guanine Nucleotide Exchange Factor (GEF)',
          effect: 'Prevents assembly of COPI coatomer; results in rapid collapse and absorption of Golgi cisternae back into the ER.'
        },
        {
          drug: 'Monensin',
          target: 'Golgi Na⁺/H⁺ Antiporter Gradient',
          effect: 'Disrupts luminal Golgi pH gradient, arresting intracellular protein transport and inhibiting glycoprotein secretion.'
        }
      ]
    },
    simulationExperiment: {
      actionLabel: 'Trigger Exocytosis Vesicle Secretion',
      description: 'Stimulates Golgi trans-cisternae budding, sending glowing cargo vesicles toward the cell membrane for secretion.',
      actionType: 'vesicle'
    }
  },

  er: {
    id: 'er',
    name: 'Rough Endoplasmic Reticulum & Ribosomes',
    scientificName: 'Reticulum Endoplasmicum Granulosum',
    category: 'Protein Translation & Luminal Folding',
    color: '#ec4899',
    dimensions: 'Extends throughout cytoplasm (~50% of all cell membrane area)',
    tagline: 'The Protein Synthesis Factory translating genetic transcripts into peptide chains',
    ultrastructure: {
      membranes: 'Extensive interconnected network of flattened sacs (cisternae) studded with 80S ribosomes on cytoplasmic face',
      subcompartments: [
        'Ribosomal 80S Complex: 60S Large Subunit (28S, 5.8S, 5S rRNA + 49 proteins) + 40S Small Subunit (18S rRNA + 33 proteins)',
        'Sec61 Translocon: Protein conducting channel spanning ER membrane',
        'ER Lumen: Chaperone-rich oxidizing environment promoting disulfide bond (-S-S-) formation',
        'Transitional ER: Smooth specialized exit sites where COPII vesicles bud'
      ],
      specializedProteins: [
        'Signal Recognition Particle (SRP) & SRP Receptor',
        'BiP / GRP78 (Hsp70 family molecular chaperone)',
        'Protein Disulfide Isomerase (PDI)',
        'Calnexin & Calreticulin (Lectins inspecting N-glycan folding)'
      ],
      summary: 'Continuous with the outer membrane of the nuclear envelope. Directly translates all transmembrane proteins, secreted hormones, antibodies, and lysosomal enzymes.'
    },
    biochemicalMechanism: {
      primaryPathway: 'Co-Translational Translocation & Peptide Bond Synthesis',
      formula: 'Aminoacyl-tRNA + Peptidyl-tRNA ➔ Elongated Peptidyl-tRNA + Deacylated tRNA (Peptidyl transferase)',
      keyEnzymes: ['Peptidyl Transferase (28S Ribozyme)', 'Signal Peptidase', 'Oligosaccharyltransferase (OST)'],
      thermodynamics: 'Coupled to GTP hydrolysis by EF-Tu (eEF1A) and EF-G (eEF2) ensuring 99.99% translational fidelity.',
      atpYieldOrCost: 'Consumes 4 high-energy phosphate equivalents (2 ATP for amino acid charging, 2 GTP for translation steps) per peptide bond.',
      stepByStep: [
        'Initiation: 40S subunit binds mRNA 5′ cap, scans for Start Codon (AUG), recruits Met-tRNA and 60S subunit.',
        'Signal Recognition: Hydrophobic N-terminal signal sequence emerges; SRP binds and arrests translation.',
        'Docking to Translocon: SRP docks to SRP receptor; ribosome aligns over Sec61 channel, resuming translation.',
        'Luminal Insertion: Signal peptidase cleaves signal sequence; nascent polypeptide feeds directly into ER lumen.',
        'Chaperone Folding: BiP and PDI catalyze correct disulfide bonding and secondary/tertiary protein folding.'
      ]
    },
    clinicalPathology: {
      geneticDiseases: [
        {
          name: 'Cystic Fibrosis (ΔF508 Mutation)',
          mechanism: 'Deletion of Phenylalanine-508 in CFTR causes misfolding in ER lumen. ER quality control chaperones retrotranslocate and destroy CFTR via ERAD proteasome, leaving epithelial membranes devoid of chloride channels.'
        },
        {
          name: 'Alpha-1 Antitrypsin Deficiency',
          mechanism: 'Glu342Lys (Z-allele) mutation causes misfolded polymers to precipitate inside hepatocyte ER, causing cirrhosis and pulmonary emphysema.'
        }
      ],
      pharmacologyInhibitors: [
        {
          drug: 'Puromycin',
          target: 'Ribosome A-Site (Tyrosyl-tRNA Mimic)',
          effect: 'Incorporates into nascent peptide chain and causes premature chain termination; potent broad-spectrum toxin.'
        },
        {
          drug: 'Tetracyclines & Macrolides (Erythromycin)',
          target: 'Bacterial 70S Ribosome Subunits (30S and 50S)',
          effect: 'Selectively halts bacterial translation while sparing eukaryotic 80S ribosomes; foundational class of life-saving antibiotics.'
        }
      ]
    },
    simulationExperiment: {
      actionLabel: 'Trigger CRISPR Gene Surgery',
      description: 'Mutates mRNA codons in real time (GFP glow, Flagellin tail, Sickle cell) and translates altered polypeptide chains.',
      actionType: 'crispr'
    }
  },

  lysosome: {
    id: 'lysosome',
    name: 'Lysosome & Autophagy',
    scientificName: 'Lysosoma (Cellular Digestive Vacuole)',
    category: 'Cellular Digestion, Autophagy & Waste Recycling',
    color: '#ef4444',
    dimensions: '0.1 – 1.2 µm diameter spherical vesicle',
    tagline: 'The Acidic Hydrolytic Stomach breaking down worn organelles and pathogens',
    ultrastructure: {
      membranes: 'Single phospholipid bilayer heavily glycosylated internally with LAMP-1 & LAMP-2 to resist self-digestion',
      subcompartments: [
        'Acidic Lumen: Maintained at pH 4.5 – 5.0 (100-fold more acidic than cytosol at pH 7.4)',
        'Vacuolar H⁺-ATPase (V-ATPase): Multi-subunit electrogenic proton pump consuming ATP to acidify lumen',
        'Hydrolytic Matrix: Loaded with ~50 distinct acid hydrolase enzymes'
      ],
      specializedProteins: [
        'V-ATPase Proton Pump',
        'Cathepsins (Acidic Proteases: B, D, L)',
        'Acid Sphingomyelinase',
        'β-Hexosaminidase A',
        'Glucocerebrosidase'
      ],
      summary: 'Discovered in 1955 by Christian de Duve. Acts as the cellular waste clearance and recycling system. Degradation products (amino acids, nucleotides, sugars) are exported back to cytosol via permeases.'
    },
    biochemicalMechanism: {
      primaryPathway: 'Acid Hydrolysis of Biomacromolecules & Macroautophagy',
      formula: 'Biopolymers + H₂O ➔ Monomeric Subunits (Catalyzed by Acid Hydrolases at pH 4.8)',
      keyEnzymes: ['Acid Hydrolases', 'Phosphatases', 'Sulfatases', 'Glycosidases', 'DNase II'],
      thermodynamics: 'Hydrolases have strict acidic pH optima (4.5–5.0); if a lysosome ruptures, cytosolic pH (7.4) neutralizes enzymes, preventing catastrophic self-destruction.',
      atpYieldOrCost: 'Consumes ATP continuously via V-ATPase to pump H⁺ protons against a 2.5 pH unit concentration gradient.',
      stepByStep: [
        'Endocytosis / Phagocytosis: External material engulfed into endosome; matures and fuses with primary lysosome.',
        'Autophagy Induction: Nutrient deprivation or damaged organelles (e.g. depolarized mitochondria) triggers LC3-II autophagosome closure.',
        'Autolysosome Fusion: Autophagosome membrane fuses with lysosome via SNARE complexes, forming autolysosome.',
        'Hydrolytic Digestion: Acid hydrolases dismantle proteins into amino acids, lipids into fatty acids, and DNA into nucleotides.',
        'Nutrient Recycling: Transporters in lysosomal membrane export nutrients into cytosol to fuel cell survival and mTOR reactivation.'
      ]
    },
    clinicalPathology: {
      geneticDiseases: [
        {
          name: 'Tay-Sachs Disease',
          mechanism: 'Autosomal recessive mutation in HEXA gene encoding β-hexosaminidase A. Inability to degrade GM2 ganglioside leads to fatal lipid accumulation in neuronal lysosomes, cherry-red macular spot, blindness, and early death.'
        },
        {
          name: 'Gaucher Disease (Most Common LSD)',
          mechanism: 'Glucocerebrosidase (GBA) deficiency leads to accumulation of glucosylceramide in macrophages ("Gaucher cells" with wrinkled tissue-paper appearance), causing hepatosplenomegaly, anemia, and bone crises.'
        },
        {
          name: 'Pompe Disease (Glycogen Storage Disease Type II)',
          mechanism: 'Acid alpha-glucosidase (GAA) deficiency causes massive lysosomal glycogen storage, leading to fatal infantile hypertrophic cardiomyopathy.'
        }
      ],
      pharmacologyInhibitors: [
        {
          drug: 'Chloroquine & Hydroxychloroquine',
          target: 'Lysosomal Proton Concentration (V-ATPase Buffering)',
          effect: 'Lipophilic weak base that diffuses into lysosomes and becomes protonated; raises luminal pH, inactivating hydrolases and blocking autophagic flux.'
        },
        {
          drug: 'Bafilomycin A1',
          target: 'Vacuolar H⁺-ATPase (V-ATPase)',
          effect: 'Potently and specifically inhibits V-ATPase proton pumping, abolishing lysosomal acidification and arresting protein degradation.'
        }
      ]
    },
    simulationExperiment: {
      actionLabel: 'Trigger Autophagy & Debris Clearance',
      description: 'Deploys simulated acid hydrolases to track, engulf, and dissolve cytoplasmic debris, damaged proteins, and neutralised virions.',
      actionType: 'autophagy'
    }
  },

  membrane: {
    id: 'membrane',
    name: 'Phospholipid Bilayer Membrane & Ion Pumps',
    scientificName: 'Plasmalemma (Cellular Membrane)',
    category: 'Selective Permeability & Osmotic Homeostasis',
    color: '#06b6d4',
    dimensions: '7.5 – 10 nm thickness',
    tagline: 'The Dynamic 32-Node Fluid Mosaic regulating osmosis and electrical potential',
    ultrastructure: {
      membranes: 'Amphipathic Phospholipid Bilayer with hydrophilic phosphate heads (outer/inner) and hydrophobic fatty acyl tails (interior)',
      subcompartments: [
        'Outer Leaflet: Phosphatidylcholine, Sphingomyelin, and glycolipids forming the glycocalyx',
        'Inner Leaflet: Phosphatidylethanolamine, Phosphatidylserine (- charge), and Phosphatidylinositol',
        'Lipid Rafts: Microdomains enriched in cholesterol and sphingolipids organizing signaling receptor platforms',
        'Transmembrane Channels: Voltage-gated ion channels, Aquaporins, and ATP-binding cassette (ABC) transporters'
      ],
      specializedProteins: [
        'Na⁺/K⁺ ATPase (Sodium-Potassium Ion Pump)',
        'Aquaporin-1 (Water Channel, ~3 billion H₂O molecules/sec)',
        'Glucose Transporter 1 (GLUT1)',
        'Receptor Tyrosine Kinases (RTKs)'
      ],
      summary: 'Described by Singer and Nicolson’s 1972 Fluid Mosaic Model. Maintains transmembrane resting potential (-70 mV in animal cells) and osmotic equilibrium.'
    },
    biochemicalMechanism: {
      primaryPathway: 'Primary Active Ion Transport & Osmotic Tonicity Maintenance',
      formula: '3 Na⁺(in) + 2 K⁺(out) + ATP + H₂O ➔ 3 Na⁺(out) + 2 K⁺(in) + ADP + Pᵢ',
      keyEnzymes: ['Na⁺/K⁺ ATPase', 'Ca²⁺ ATPase (PMCA)', 'Aquaporin-1 Channels'],
      thermodynamics: 'Consumes ~30% of ALL ATP generated by a resting human body (up to 70% in brain neurons).',
      atpYieldOrCost: 'Consumes 1 ATP molecule per transport cycle: pumps 3 Na⁺ out against gradient and 2 K⁺ in against gradient.',
      stepByStep: [
        'Cytosolic Binding: 3 Na⁺ ions bind high-affinity sites on intracellular face of pump in E1 conformation.',
        'ATP Phosphorylation: Pump hydrolyzes ATP and transfers terminal phosphate to Aspartate residue, forming high-energy phosphoenzyme.',
        'Conformational Flip (E1➔E2): Phosphorylation triggers rotation, exposing ions to extracellular fluid and releasing 3 Na⁺.',
        'Extracellular Binding: 2 K⁺ ions from extracellular fluid bind high-affinity sites in E2 conformation.',
        'Dephosphorylation: Phosphate is hydrolyzed; pump reverts to E1 conformation, releasing 2 K⁺ into cytoplasm to complete cycle.'
      ]
    },
    clinicalPathology: {
      geneticDiseases: [
        {
          name: 'Cystic Fibrosis (CFTR Channel Mutation)',
          mechanism: 'Mutations in the CFTR chloride channel prevent ATP-gated chloride secretion, causing viscous dehydrated mucus that obstructs lungs and pancreatic ducts.'
        },
        {
          name: 'Hereditary Spherocytosis',
          mechanism: 'Deficiency in spectrin, ankyrin, or band 3 membrane skeleton proteins causes red blood cells to lose lipid surface area, forming fragile osmotic spheres that hemolyze in the spleen.'
        }
      ],
      pharmacologyInhibitors: [
        {
          drug: 'Digoxin & Ouabain (Cardiac Glycosides)',
          target: 'Extracellular K⁺ Binding Site of Na⁺/K⁺ ATPase',
          effect: 'Inhibits pump; increases intracellular Na⁺, reducing driving force for Na⁺/Ca²⁺ exchanger (NCX), elevating intracellular Ca²⁺ to strengthen myocardial cardiac contraction.'
        },
        {
          drug: 'Tetrodotoxin (TTX from Pufferfish)',
          target: 'Voltage-Gated Na⁺ Channels (Nav1.1 – Nav1.7)',
          effect: 'Selectively occludes the outer pore of voltage-gated sodium channels, abolishing action potentials and causing fatal respiratory paralysis.'
        }
      ]
    },
    simulationExperiment: {
      actionLabel: 'Upgrade Na⁺/K⁺ ATPase Ion Pumps (+5)',
      description: 'Increases the rate of active sodium extrusion, counteracting hypotonic osmotic swelling and reinforcing membrane integrity.',
      actionType: 'pump'
    }
  },

  virus: {
    id: 'virus',
    name: 'Viral Pathogens (Bacteriophage & Coronavirus)',
    scientificName: 'Virion (Obligate Intracellular Parasite)',
    category: 'Pathogen Warfare & Host Hijacking',
    color: '#f43f5e',
    dimensions: '20 – 120 nm (Bacteriophage T4: 90x200 nm, Coronavirus: ~100 nm)',
    tagline: 'Nanoscale Molecular Hijackers overriding host ribosomes to induce cytolysis',
    ultrastructure: {
      membranes: 'Non-enveloped protein capsid (Bacteriophage) vs Host-derived lipid envelope with trimeric Spike glycoproteins (Coronavirus)',
      subcompartments: [
        'Bacteriophage Icosahedral Head: Houses tightly coiled 169 kb double-stranded DNA genome under 20 atm pressure',
        'Contractile Tail Sheath: Injects genome through bacterial cell wall like a molecular syringe',
        'Coronavirus Spike Glycoprotein (S): Trimeric class-I fusion protein (S1 receptor-binding domain + S2 fusion machinery)',
        'Nucleocapsid (N): Protein spool stabilizing the single-stranded positive-sense RNA genome (~30 kb)'
      ],
      specializedProteins: [
        'Spike Glycoprotein (ACE2 receptor binding)',
        'RNA-Dependent RNA Polymerase (RdRp)',
        'Holin & Endolysin (Lytic cell-burst enzymes)',
        'Main Protease (Mpro / 3CLpro)'
      ],
      summary: 'Viruses possess no autonomous metabolism and cannot produce ATP. They hijack host metabolic energy and ribosomes to mass-produce copies, culminating in host cell membrane lysis.'
    },
    biochemicalMechanism: {
      primaryPathway: 'Receptor Docking, Genetic Payload Injection & Ribosomal Hijacking',
      formula: '1 Virion + Host ATP/Amino Acids ➔ 100-1000 Progeny Virions + Host Cytolysis',
      keyEnzymes: ['Viral Replicase (RdRp)', 'Spike Furin / TMPRSS2 Protease', 'Viral Helicosome', 'Endolysins'],
      thermodynamics: 'Completely parasitic: exploits host cell’s chemical potential, free nucleotides, and amino acid pools.',
      atpYieldOrCost: 'Depletes host cell ATP pools rapidly to fuel viral RNA replication and capsid assembly.',
      stepByStep: [
        'Receptor Docking: Viral spike proteins bind specific cell surface receptors (e.g. ACE2 or bacterial surface proteins).',
        'Genome Injection / Membrane Fusion: S2 subunit mediates fusion with host membrane, releasing viral genome into cytoplasm.',
        'Ribosomal Hijacking: Host ribosomes translate viral RNA directly into polyproteins; viral proteases cleave them into replicase.',
        'Genome Replication: RdRp synthesizes thousands of copies of viral RNA genomes and capsid structural proteins.',
        'Lytic Rupture (Endgame): When intracellular viral load exceeds structural limit (~60 virions in sandbox), holin creates pores in membrane, triggering cytolytic explosion.'
      ]
    },
    clinicalPathology: {
      geneticDiseases: [
        {
          name: 'Viral Induced Cytokine Storm & ARDS',
          mechanism: 'Hyperactivation of inflammatory macrophages and monocytes during massive viral lysis releases uncontrolled IL-6 and TNF-alpha, damaging endothelial barriers.'
        },
        {
          name: 'Bacteriophage Therapy for Superbugs',
          mechanism: 'Targeted lysis of multi-drug resistant Pseudomonas and Staphylococcus using engineered lytic phages that destroy bacterial membranes without harming human cells.'
        }
      ],
      pharmacologyInhibitors: [
        {
          drug: 'Paxlovid (Nirmatrelvir + Ritonavir)',
          target: 'SARS-CoV-2 Main Protease (Mpro / 3CLpro)',
          effect: 'Competitively inhibits 3CLpro, preventing cleavage of viral polyproteins into functional replication machinery.'
        },
        {
          drug: 'Remdesivir (Veklury)',
          target: 'Viral RNA-Dependent RNA Polymerase (RdRp)',
          effect: 'Adenosine nucleotide analog that incorporates into growing viral RNA chain, causing delayed chain termination 3 nucleotides downstream.'
        }
      ]
    },
    simulationExperiment: {
      actionLabel: 'Deploy Monoclonal IgG Antibodies',
      description: 'Shoots Y-shaped antibodies that bind viral surface spikes, causing agglutination (immobilization) for macrophage destruction.',
      actionType: 'antibodies'
    }
  },

  macrophage: {
    id: 'macrophage',
    name: 'Immune Macrophage & Phagocytosis',
    scientificName: 'Macrophagus (Innate Immune Phagocyte)',
    category: 'Innate Immunity & Antigen Presentation',
    color: '#10b981',
    dimensions: '21 – 30 µm amoeboid cell',
    tagline: 'The Phagocytic Giant projecting pseudopodia to engulf and dissolve antibody-tagged virions',
    ultrastructure: {
      membranes: 'Extremely deformable plasma membrane with high turnover for pseudopod extension and phagocytic cup formation',
      subcompartments: [
        'Pseudopodia: Dynamic actin-rich protrusions driven by Arp2/3 branched actin polymerization',
        'Phagosome: Large intracellular vesicle enclosing engulfed virions or debris',
        'Phagolysosome: Hybrid digestive organelle formed by fusion of phagosome with multiple lysosomes',
        'Respiratory Burst Vesicles: Membrane complexes loaded with NADPH oxidase generating reactive oxygen species (ROS)'
      ],
      specializedProteins: [
        'Fc Receptors (FcγR binding antibody tails)',
        'Toll-Like Receptors (TLR3, TLR4, TLR7, TLR9)',
        'NADPH Oxidase (NOX2 superoxide generator)',
        'Inducible Nitric Oxide Synthase (iNOS)'
      ],
      summary: 'Derived from circulating bone marrow monocytes. Serves as frontline sentinel, professional phagocyte, and antigen-presenting cell (APC) linking innate immunity to adaptive T-cell immunity.'
    },
    biochemicalMechanism: {
      primaryPathway: 'Fc-Mediated Phagocytosis & Respiratory Burst Digestion',
      formula: 'NADPH + 2 O₂ ➔ NADP⁺ + 2 O₂•⁻ + H⁺ (NOX2 Superoxide Free Radical Generation)',
      keyEnzymes: ['NADPH Oxidase', 'Myeloperoxidase (MPO)', 'Inducible Nitric Oxide Synthase', 'Acid Hydrolases'],
      thermodynamics: 'Consumes massive quantities of oxygen (the "respiratory burst") and glucose via pentose phosphate pathway.',
      atpYieldOrCost: 'High ATP consumption for rapid actin-myosin cytoskeleton remodeling and vesicle trafficking.',
      stepByStep: [
        'Opsonization Detection: B-cell antibodies (IgG) bind surface spikes of viruses, coating them (opsonization).',
        'Fc Receptor Engagement: Macrophage Fcγ receptors dock with constant Fc stems of antibodies clustered on virions.',
        'Pseudopod Extension: Rho family GTPases (Cdc42, Rac1) polymerize branched actin, throwing pseudopodia around the pathogen.',
        'Phagosome Closure: Pseudopodia tips fuse to seal the pathogen inside an intracellular phagosome.',
        'Respiratory Burst & Lysis: Phagosome fuses with lysosomes; NADPH oxidase generates toxic superoxide (O₂•⁻) and bleach (HOCl), obliterating the virus.'
      ]
    },
    clinicalPathology: {
      geneticDiseases: [
        {
          name: 'Chronic Granulomatous Disease (CGD)',
          mechanism: 'X-linked or autosomal mutations in CYBB/CYBA genes encoding NADPH oxidase. Macrophages cannot generate superoxide to kill catalase-positive bacteria and fungi, leading to recurrent severe infections and granuloma formation.'
        },
        {
          name: 'Hemophagocytic Lymphohistiocytosis (HLH)',
          mechanism: 'Hyperinflammatory activation of macrophages and cytotoxic T-cells without resolution, leading to engulfment of patient’s own blood cells and multi-organ failure.'
        }
      ],
      pharmacologyInhibitors: [
        {
          drug: 'Anti-TNF Biologics (Infliximab, Adalimumab)',
          target: 'Tumor Necrosis Factor-alpha secreted by Macrophages',
          effect: 'Neutralizes macrophage-driven pro-inflammatory signaling, treating rheumatoid arthritis, Crohn’s disease, and psoriasis.'
        },
        {
          drug: 'Colchicine',
          target: 'Microtubule Tubulin Polymerization',
          effect: 'Inhibits macrophage pseudopodia motility and inflammasome activation; standard treatment for acute gout flare-ups.'
        }
      ]
    },
    simulationExperiment: {
      actionLabel: 'Engulf & Dissolve Neutralized Viruses',
      description: 'Activates macrophage pseudopodia to track, engulf, and dissolve antibody-bound viruses in the extracellular matrix.',
      actionType: 'autophagy'
    }
  }
};

interface OrganelleInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrganelleId?: OrganelleId;
  onSelectOrganelle?: (id: OrganelleId) => void;
  onExecuteSimulationAction?: (actionType: string) => void;
  theme: 'dark' | 'light';
}

export const OrganelleInspectorModal: React.FC<OrganelleInspectorModalProps> = ({
  isOpen,
  onClose,
  selectedOrganelleId = 'mitochondria',
  onSelectOrganelle,
  onExecuteSimulationAction,
  theme
}) => {
  const [activeOrganelle, setActiveOrganelle] = useState<OrganelleId>(selectedOrganelleId);
  const [activeTab, setActiveTab] = useState<'ultrastructure' | 'biochemistry' | 'clinical'>('ultrastructure');

  // Sync if prop changes
  React.useEffect(() => {
    if (selectedOrganelleId) {
      setActiveOrganelle(selectedOrganelleId);
    }
  }, [selectedOrganelleId]);

  if (!isOpen) return null;

  const profile = ORGANELLE_PROFILES[activeOrganelle] || ORGANELLE_PROFILES.mitochondria;
  const isDark = theme === 'dark';

  const handleSelect = (id: OrganelleId) => {
    setActiveOrganelle(id);
    onSelectOrganelle?.(id);
    audioSynth.playNucleotideClick('A');
  };

  const handleExecuteAction = () => {
    audioSynth.playAtpChime(1.2);
    onExecuteSimulationAction?.(profile.simulationExperiment.actionType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border flex flex-col shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-950/95 border-cyan-500/40 text-slate-100 shadow-[0_0_60px_rgba(6,182,212,0.3)]'
            : 'bg-white/95 border-slate-300 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-11 h-11 rounded-2xl shadow-lg font-bold text-lg text-white"
              style={{ backgroundColor: profile.color }}
            >
              🔬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-extrabold tracking-tight font-sans">
                  {profile.name}
                </h2>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${profile.color}25`,
                    color: profile.color,
                    border: `1px solid ${profile.color}60`
                  }}
                >
                  {profile.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono italic">
                {profile.scientificName} • {profile.dimensions}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600 hover:text-slate-900'
            }`}
            title="Close Inspector"
          >
            <X size={18} />
          </button>
        </div>

        {/* Organelle Selector Pills */}
        <div className={`flex items-center gap-1.5 p-2 px-4 overflow-x-auto border-b text-xs ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          {(Object.keys(ORGANELLE_PROFILES) as OrganelleId[]).map((orgId) => {
            const org = ORGANELLE_PROFILES[orgId];
            const isSelected = activeOrganelle === orgId;
            return (
              <button
                key={orgId}
                onClick={() => handleSelect(orgId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? isDark
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-cyan-600 text-white font-bold shadow-md'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: org.color }} />
                <span>{org.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-Tabs: Ultrastructure | Biochemistry | Clinical Pathology */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-slate-800/40">
          <button
            onClick={() => setActiveTab('ultrastructure')}
            className={`flex items-center gap-1.5 pb-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'ultrastructure'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={14} />
            <span>1. Microscopic Ultrastructure</span>
          </button>

          <button
            onClick={() => setActiveTab('biochemistry')}
            className={`flex items-center gap-1.5 pb-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'biochemistry'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap size={14} />
            <span>2. Biochemical Mechanism & Equations</span>
          </button>

          <button
            onClick={() => setActiveTab('clinical')}
            className={`flex items-center gap-1.5 pb-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'clinical'
                ? 'border-rose-400 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pill size={14} />
            <span>3. Genetic Diseases & Pharmacology</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs leading-relaxed">
          {/* TAB 1: Ultrastructure */}
          {activeTab === 'ultrastructure' && (
            <div className="space-y-4 animate-fade-in">
              <div className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-cyan-950/25 border-cyan-500/30 text-cyan-200' : 'bg-cyan-50 border-cyan-200 text-cyan-900'
              }`}>
                <div className="font-bold text-sm mb-1">{profile.tagline}</div>
                <p className="text-xs">{profile.ultrastructure.summary}</p>
              </div>

              {/* Membrane Architecture */}
              <div className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className="font-bold text-xs uppercase font-mono tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
                  <Layers size={13} />
                  <span>Membrane Barrier Architecture</span>
                </div>
                <p className={isDark ? 'text-slate-300' : 'text-slate-800'}>
                  {profile.ultrastructure.membranes}
                </p>
              </div>

              {/* Sub-Compartments List */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase font-mono tracking-wider text-slate-400">
                  Sub-Compartments & Anatomical Zones:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {profile.ultrastructure.subcompartments.map((comp, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-start gap-2 ${
                        isDark ? 'bg-slate-900/40 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                      <span>{comp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialized Molecular Complexes */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase font-mono tracking-wider text-slate-400">
                  Specialized Supramolecular Complexes:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.ultrastructure.specializedProteins.map((prot, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] font-semibold ${
                        isDark
                          ? 'bg-slate-900/70 border-slate-700 text-slate-200'
                          : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      {prot}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Biochemistry */}
          {activeTab === 'biochemistry' && (
            <div className="space-y-4 animate-fade-in">
              {/* Primary Chemical Equation */}
              {profile.biochemicalMechanism.formula && (
                <div className={`p-4 rounded-2xl border text-center font-mono font-bold text-xs sm:text-sm ${
                  isDark
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                    : 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                }`}>
                  <div className="text-[10px] uppercase tracking-wider text-amber-500 font-sans mb-1">
                    Master Stoichiometric Equation
                  </div>
                  <div>{profile.biochemicalMechanism.formula}</div>
                </div>
              )}

              {/* Energetics & ATP Yield */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3.5 rounded-2xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">Thermodynamics (ΔG)</div>
                  <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {profile.biochemicalMechanism.thermodynamics}
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">ATP Yield / Energy Cost</div>
                  <div className="font-bold text-emerald-400">
                    {profile.biochemicalMechanism.atpYieldOrCost}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Reaction Cascade */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase font-mono tracking-wider text-slate-400">
                  Step-by-Step Molecular Mechanism:
                </div>
                <div className="space-y-2">
                  {profile.biochemicalMechanism.stepByStep.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                        isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className={isDark ? 'text-slate-300' : 'text-slate-800'}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Clinical Pathology */}
          {activeTab === 'clinical' && (
            <div className="space-y-4 animate-fade-in">
              {/* Human Genetic Diseases */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase font-mono tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>Human Genetic Pathology & Inborn Errors:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {profile.clinicalPathology.geneticDiseases.map((dis, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border ${
                        isDark ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50/60 border-rose-200'
                      }`}
                    >
                      <div className="font-bold text-xs text-rose-500 mb-1">{dis.name}</div>
                      <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                        {dis.mechanism}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Targeted Pharmacology & Inhibitor Drugs */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase font-mono tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Pill size={14} />
                  <span>Targeted Pharmacology, Toxins & Clinical Drugs:</span>
                </div>
                <div className="space-y-2">
                  {profile.clinicalPathology.pharmacologyInhibitors.map((pharm, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-amber-400">{pharm.drug}</div>
                        <div className="text-[10px] font-mono text-slate-400">Target: {pharm.target}</div>
                      </div>
                      <p className={`text-[11px] sm:max-w-md ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {pharm.effect}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Interactive Simulation Action Bar */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? 'bg-slate-900/60 border-cyan-500/20' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <FlaskConical size={18} className="text-cyan-400 shrink-0 animate-bounce" />
            <p className="text-[11px] text-slate-400">
              {profile.simulationExperiment.description}
            </p>
          </div>

          <button
            onClick={() => {
              handleExecuteAction();
              onClose();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 text-white font-bold text-xs shadow-lg hover:scale-102 active:scale-98 transition-all shrink-0 cursor-pointer"
          >
            <Sparkles size={14} />
            <span>{profile.simulationExperiment.actionLabel}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
