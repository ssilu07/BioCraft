/**
 * BiologicalDiagramsModal.tsx
 * Scientific Biological Diagrams & Anatomical Atlas Modal:
 * - Dual-Theme Support (Dark Cyber-Navy & Light Clinical Bio-Lab)
 * - Mobile-First Responsive Layout
 * - Clear Chemical Formulas, Diagrams & Reaction Mechanisms
 */

import React, { useState } from 'react';
import { X, BookOpen, Layers, Activity, Dna, Shield, Sparkles } from 'lucide-react';

interface BiologicalDiagramsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const BiologicalDiagramsModal: React.FC<BiologicalDiagramsModalProps> = ({
  isOpen,
  onClose,
  theme
}) => {
  const [activeTab, setActiveTab] = useState<'cell' | 'respiration' | 'genetics' | 'pathogens' | 'osmosis'>('cell');
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border p-4 sm:p-6 flex flex-col gap-3.5 shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-950/95 border-cyan-500/30 text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.25)]'
            : 'bg-white/95 border-slate-300 text-slate-900 shadow-xl'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-xl border transition-all ${
            isDark
              ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600 hover:text-slate-900'
          }`}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-lg">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight font-sans">
              Cellular Biology & Genetics Atlas
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Scientific Anatomical Diagrams & Biochemical Reaction Pathways
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl border ${
          isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('cell')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'cell'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={13} />
            <span>1. Eukaryotic Cell</span>
          </button>

          <button
            onClick={() => setActiveTab('respiration')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'respiration'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity size={13} />
            <span>2. Respiration & ATP</span>
          </button>

          <button
            onClick={() => setActiveTab('genetics')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'genetics'
                ? 'bg-purple-500 text-white font-bold shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Dna size={13} />
            <span>3. Central Dogma</span>
          </button>

          <button
            onClick={() => setActiveTab('pathogens')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'pathogens'
                ? 'bg-red-500 text-white font-bold shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield size={13} />
            <span>4. Viral Anatomy</span>
          </button>

          <button
            onClick={() => setActiveTab('osmosis')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'osmosis'
                ? 'bg-blue-500 text-white font-bold shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles size={13} />
            <span>5. Osmotic Tonicity</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className={`overflow-y-auto max-h-[55vh] p-3.5 sm:p-4 rounded-2xl border text-xs leading-relaxed space-y-3.5 ${
          isDark ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          {/* TAB 1: Cell */}
          {activeTab === 'cell' && (
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                    Eukaryotic Living Cell Anatomy
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Membrane-bound organelle ecosystem in streaming cytoplasm
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-900/30 text-cyan-400 border border-cyan-500/30">
                  Size: 20-30 µm
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="font-bold text-cyan-500 mb-0.5">Phospholipid Bilayer Membrane</div>
                  <p className="text-[11px]">7.5 nm fluid mosaic with hydrophilic phosphate heads and hydrophobic fatty acid cores regulating osmosis.</p>
                </div>

                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="font-bold text-indigo-400 mb-0.5">Nucleus & Nuclear Pores</div>
                  <p className="text-[11px]">Double-membrane vault safeguarding DNA chromosomes. 120 nm pores export mRNA transcripts to ribosomes.</p>
                </div>

                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="font-bold text-amber-500 mb-0.5">Mitochondria (Powerhouse)</div>
                  <p className="text-[11px]">Folded cristae house Complexes I-IV and spinning F0/F1 ATP Synthase rotary nanomotors.</p>
                </div>

                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="font-bold text-rose-500 mb-0.5">Rough ER & Golgi Complex</div>
                  <p className="text-[11px]">Ribosomes assemble nascent peptides; Golgi cisternae package them into glowing transport vesicles.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Respiration */}
          {activeTab === 'respiration' && (
            <div className="space-y-3">
              <div>
                <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                  Cellular Respiration & ATP Turbine
                </h3>
                <p className="text-[11px] text-slate-400">
                  Oxidative phosphorylation converting biochemical energy into 36-38 ATP
                </p>
              </div>

              <div className={`p-2.5 rounded-xl border text-center font-mono text-xs sm:text-sm font-bold ${
                isDark ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' : 'bg-amber-100 border-amber-300 text-amber-900'
              }`}>
                C₆H₁₂O₆ + 6 O₂ ➔ 6 CO₂ + 6 H₂O + 36-38 ATP
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="font-bold text-cyan-500 mb-0.5">1. Glycolysis</div>
                  <p className="text-[11px]">Cytosol: 1 Glucose ➔ 2 Pyruvate + 2 ATP + 2 NADH.</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="font-bold text-amber-500 mb-0.5">2. Krebs Cycle</div>
                  <p className="text-[11px]">Matrix: Pyruvate oxidation produces 6 NADH, 2 FADH₂, 4 CO₂ waste.</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="font-bold text-yellow-500 mb-0.5">3. ATP Synthase</div>
                  <p className="text-[11px]">Cristae: Proton motive force (ΔΨ) spins F0/F1 rotor up to 6000 RPM ➔ 34 ATP.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Genetics */}
          {activeTab === 'genetics' && (
            <div className="space-y-3">
              <div>
                <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                  The Central Dogma (DNA ➔ mRNA ➔ Protein)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Watson-Crick base pairing & 64-Codon Genetic Code Translation
                </p>
              </div>

              <div className={`p-2 rounded-xl border font-mono text-[11px] flex items-center justify-around flex-wrap gap-2 ${
                isDark ? 'bg-purple-950/40 border-purple-500/40 text-purple-300' : 'bg-purple-100 border-purple-300 text-purple-900'
              }`}>
                <span>DNA: A↔T, C↔G</span>
                <span>➔ mRNA: A➔U, T➔A</span>
                <span>➔ Ribosome: AUG➔Met ... Stop</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="font-bold text-purple-500 mb-0.5">Sickle Cell (HBB E6V)</div>
                  <p className="text-[11px]">A single missense mutation (GAG➔GTG) replaces hydrophilic Glutamic acid with hydrophobic Valine at codon 6, causing cellular sickling.</p>
                </div>

                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="font-bold text-lime-500 mb-0.5">Phenotype Targets</div>
                  <p className="text-[11px]">• <strong>GFP:</strong> 509nm bioluminescent green glow.<br />• <strong>FLA:</strong> Whipping flagellum motor (+140% swimming speed).</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Pathogens */}
          {activeTab === 'pathogens' && (
            <div className="space-y-3">
              <div>
                <h3 className={`text-sm sm:text-base font-bold text-red-500`}>
                  Pathogen Warfare & Host Immunity
                </h3>
                <p className="text-[11px] text-slate-400">
                  Virion architecture, Spike docking, and Macrophage Phagocytosis
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-red-500/30' : 'bg-white border-red-200'}`}>
                  <div className="font-bold text-red-400 mb-0.5">Bacteriophage</div>
                  <p className="text-[11px]">Icosahedral protein capsid with contractile sheath and tail pins that mechanically pierce host membranes to inject viral genomes.</p>
                </div>

                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-red-500/30' : 'bg-white border-red-200'}`}>
                  <div className="font-bold text-amber-500 mb-0.5">Enveloped Coronavirus</div>
                  <p className="text-[11px]">Lipid bilayer studded with trimeric Spike glycoproteins that latch onto surface receptors, releasing (+)ssRNA to hijack ribosomes.</p>
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="font-bold text-emerald-500 mb-0.5">B-Cells & Macrophages</div>
                <p className="text-[11px]">Y-shaped antibodies agglutinate and neutralize viral spikes. Amoeboid macrophages project pseudopodia to engulf and dissolve tagged antigens.</p>
              </div>
            </div>
          )}

          {/* TAB 5: Osmosis */}
          {activeTab === 'osmosis' && (
            <div className="space-y-3">
              <div>
                <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-sky-300' : 'text-sky-800'}`}>
                  Osmotic Tonicity & Cell Volume
                </h3>
                <p className="text-[11px] text-slate-400">
                  Water potential dynamics and active Na⁺/K⁺ ATPase regulation
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-blue-950/30 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="font-bold text-blue-500 mb-0.5">Hypotonic (&lt;200 mOsm)</div>
                  <p className="text-[11px]">Water rushes inward. Membrane stretches until catastrophic cytolysis (bursting) occurs.</p>
                </div>

                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-cyan-950/30 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'}`}>
                  <div className="font-bold text-cyan-500 mb-0.5">Isotonic (290 mOsm)</div>
                  <p className="text-[11px]">Perfect physiological equilibrium maintained by active Na⁺/K⁺ ATPase pumps consuming ATP.</p>
                </div>

                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-amber-950/30 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="font-bold text-amber-500 mb-0.5">Hypertonic (&gt;380 mOsm)</div>
                  <p className="text-[11px]">Water rushes out. Cell undergoes crenation/wrinkling and volume shrinkage.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs border transition-all ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-300'
            }`}
          >
            Close Atlas
          </button>
        </div>
      </div>
    </div>
  );
};
