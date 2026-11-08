/**
 * CodonSequenceRibbon.tsx
 * Bottom Genetic Transcription & Codon Reading Ribbon:
 * - Mobile-First Collapsible Architecture (Mini-ticker vs Full Codon Studio)
 * - Dual-Theme Support (Dark Bioluminescent / Light Clinical Sterile)
 * - Interactive mRNA Tape with Codon Triplets & tRNA Anticodons
 * - Point Mutation Tools (Substitution, Insertion, Deletion)
 */

import React, { useState } from 'react';
import {
  GeneticsEngine,
  PRESET_GENES,
  NucleotideRNA,
  CodonTranslationResult,
  AminoAcidInfo
} from '../engine/GeneticsTranslator';
import { audioSynth } from '../engine/OrganicAudioSynth';
import { Dna3DIcon } from './Bio3DIcons';
import { Scissors, Plus, Trash2, RotateCcw, ChevronUp, ChevronDown, Dna } from 'lucide-react';

interface CodonSequenceRibbonProps {
  activeGeneId: string;
  onSelectGene: (geneId: string) => void;
  mRnaSequence: string;
  onUpdateMRna: (newMRna: string) => void;
  translationResult: {
    codons: CodonTranslationResult[];
    polypeptide: AminoAcidInfo[];
    hasStartCodon: boolean;
    hasTerminated: boolean;
    foldingStabilityScore: number;
  };
  theme: 'dark' | 'light';
  isExpanded?: boolean;
  onToggleExpanded?: (expanded: boolean) => void;
  isMobile?: boolean;
}

export const CodonSequenceRibbon: React.FC<CodonSequenceRibbonProps> = ({
  activeGeneId,
  onSelectGene,
  mRnaSequence,
  onUpdateMRna,
  translationResult,
  theme,
  isExpanded: controlledExpanded,
  onToggleExpanded,
  isMobile = false
}) => {
  const [internalExpanded, setInternalExpanded] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });
  const [selectedCodonIndex, setSelectedCodonIndex] = useState<number>(0);
  const [mutationType, setMutationType] = useState<'substitute' | 'insert' | 'delete'>('substitute');

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggleExpand = (nextVal: boolean) => {
    if (onToggleExpanded) {
      onToggleExpanded(nextVal);
    } else {
      setInternalExpanded(nextVal);
    }
  };

  const isDark = theme === 'dark';

  const baseColors: Record<string, string> = {
    A: isDark ? 'border-cyan-400 text-cyan-300 bg-cyan-950/60' : 'border-cyan-600 text-cyan-800 bg-cyan-100',
    U: isDark ? 'border-rose-400 text-rose-300 bg-rose-950/60' : 'border-rose-600 text-rose-800 bg-rose-100',
    C: isDark ? 'border-amber-400 text-amber-300 bg-amber-950/60' : 'border-amber-600 text-amber-800 bg-amber-100',
    G: isDark ? 'border-lime-400 text-lime-300 bg-lime-950/60' : 'border-lime-600 text-lime-800 bg-lime-100'
  };

  const handleBaseClick = (charIndex: number, newBase: NucleotideRNA) => {
    audioSynth.playNucleotideClick(newBase);
    const chars = mRnaSequence.split('');

    if (mutationType === 'substitute') {
      chars[charIndex] = newBase;
    } else if (mutationType === 'insert') {
      chars.splice(charIndex, 0, newBase);
    } else if (mutationType === 'delete') {
      chars.splice(charIndex, 1);
    }

    onUpdateMRna(chars.join(''));
  };

  const resetCurrentGene = () => {
    const gene = PRESET_GENES.find(g => g.id === activeGeneId) || PRESET_GENES[0];
    const originalMRna = GeneticsEngine.transcribeDnaToMRna(gene.wildTypeDnaTemplate);
    onUpdateMRna(originalMRna);
    audioSynth.playNucleotideClick('A');
  };

  const activeGene = PRESET_GENES.find(g => g.id === activeGeneId) || PRESET_GENES[0];

  return (
    <footer
      className={`absolute bottom-3 left-3 right-3 z-30 transition-all duration-300 rounded-2xl border p-2.5 sm:p-3 shadow-2xl backdrop-blur-md ${
        isDark
          ? 'bg-slate-950/85 border-cyan-500/30 text-slate-100'
          : 'bg-white/95 border-slate-300 text-slate-900'
      }`}
    >
      {/* Header Bar with Toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              handleToggleExpand(!isExpanded);
              audioSynth.playNucleotideClick('G');
            }}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-500/20 text-cyan-500 transition-all active:scale-95"
            title={isExpanded ? 'Minimize Ribbon' : 'Expand Ribbon'}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            <Dna size={16} />
          </button>

          <span className={`font-mono text-xs font-bold uppercase tracking-wide ${
            isDark ? 'text-cyan-400' : 'text-cyan-800'
          }`}>
            DNA / mRNA Tape:
          </span>

          {/* Gene Presets */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {PRESET_GENES.map(gene => (
              <button
                key={gene.id}
                onClick={() => {
                  onSelectGene(gene.id);
                  audioSynth.playNucleotideClick('G');
                }}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  activeGeneId === gene.id
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {gene.symbol}
              </button>
            ))}
          </div>

          <button
            onClick={resetCurrentGene}
            title="Reset to Wild-Type Sequence"
            className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-slate-700/60 hover:border-cyan-400 text-slate-400 hover:text-cyan-400 transition-all"
          >
            <RotateCcw size={11} />
            <span>Wild-Type</span>
          </button>
        </div>

        {/* Right Mutation Tools (Only in expanded) */}
        {isExpanded && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-slate-700/60 text-xs">
              <button
                onClick={() => setMutationType('substitute')}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                  mutationType === 'substitute' ? 'bg-amber-500/30 text-amber-300 font-bold' : 'text-slate-400'
                }`}
              >
                <Scissors size={10} />
                <span className="hidden sm:inline">Substitute</span>
              </button>
              <button
                onClick={() => setMutationType('insert')}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                  mutationType === 'insert' ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                <Plus size={10} />
                <span className="hidden sm:inline">Insert</span>
              </button>
              <button
                onClick={() => setMutationType('delete')}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                  mutationType === 'delete' ? 'bg-rose-500/30 text-rose-300 font-bold' : 'text-slate-400'
                }`}
              >
                <Trash2 size={10} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>

            {/* Quick Nucleotides */}
            <div className="flex items-center gap-1">
              {(['A', 'U', 'C', 'G'] as NucleotideRNA[]).map(base => (
                <button
                  key={base}
                  onClick={() => handleBaseClick(selectedCodonIndex * 3, base)}
                  className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px] border transition-transform hover:scale-110 ${baseColors[base]}`}
                >
                  {base}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Ribbon Content */}
      {isExpanded && (
        <div className="space-y-2 mt-1">
          {/* mRNA Tape Triplets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
            <span className="text-[9px] font-mono font-bold text-cyan-400 shrink-0">5' &gt;</span>

            <div className="flex items-center gap-1.5 shrink-0">
              {translationResult.codons.map((cResult, idx) => {
                const isStart = cResult.isStart;
                const isStop = cResult.isStop;
                const isSelected = selectedCodonIndex === idx;

                let badgeBorder = isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-300 bg-slate-100';
                if (isStart) badgeBorder = 'border-emerald-400 bg-emerald-950/40 text-emerald-300';
                if (isStop) badgeBorder = 'border-rose-400 bg-rose-950/40 text-rose-300';

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedCodonIndex(idx)}
                    className={`flex flex-col items-center px-1.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      isSelected ? 'border-cyan-400 scale-105 shadow-md' : badgeBorder
                    }`}
                  >
                    <div className="text-[9px] font-mono font-bold">
                      {cResult.aminoAcid ? (
                        <span style={{ color: cResult.aminoAcid.color }}>
                          {cResult.aminoAcid.code3}
                        </span>
                      ) : isStop ? (
                        <span className="text-rose-400">STOP</span>
                      ) : (
                        <span className="text-slate-400">UTR</span>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5 font-mono text-[11px] font-black tracking-wider">
                      {cResult.codon.split('').map((char, cIdx) => (
                        <span
                          key={cIdx}
                          className={
                            char === 'A'
                              ? 'text-cyan-400'
                              : char === 'U'
                              ? 'text-rose-400'
                              : char === 'C'
                              ? 'text-amber-400'
                              : 'text-lime-400'
                          }
                        >
                          {char}
                        </span>
                      ))}
                    </div>

                    <div className="text-[7.5px] font-mono text-slate-400">
                      {cResult.tRNAAnticodon}
                    </div>
                  </div>
                );
              })}
            </div>

            <span className="text-[9px] font-mono font-bold text-cyan-400 shrink-0">&gt; 3'</span>
          </div>

          {/* Synthesized Peptide Chain */}
          <div className="flex items-center justify-between gap-3 text-[10px] font-mono pt-1 border-t border-slate-700/30">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-slate-400 shrink-0">Peptide:</span>
              {translationResult.polypeptide.length === 0 ? (
                <span className="text-slate-400 italic">Awaiting AUG Start...</span>
              ) : (
                <div className="flex items-center gap-1 shrink-0">
                  {translationResult.polypeptide.map((aa, aIdx) => (
                    <span
                      key={aIdx}
                      className="px-1 py-0.5 rounded text-[9px] font-bold border"
                      style={{
                        backgroundColor: `${aa.color}25`,
                        borderColor: aa.color,
                        color: aa.color
                      }}
                    >
                      {aa.code3}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-400">Stability:</span>
              <span className="font-bold text-amber-400">
                {translationResult.foldingStabilityScore}%
              </span>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
