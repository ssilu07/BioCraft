/**
 * PipetteToolbar.tsx
 * Interactive Left Workbench Pipette & Environmental Tool Drawer:
 * - Mobile-First Collapsible Architecture (Zero congestion on phones/tablets)
 * - Dual-Theme Support (Dark Cyber-Navy / Light Clinical Bio-Lab)
 * - 3D Bioluminescent Pipette Tools with Tactile Audio Feedback
 */

import React, { useState } from 'react';
import {
  Glucose3DIcon,
  Oxygen3DIcon,
  Toxin3DIcon,
  Antibiotic3DIcon,
  Virus3DIcon,
  Crispr3DIcon
} from './Bio3DIcons';
import { audioSynth } from '../engine/OrganicAudioSynth';
import { ShieldPlus, Droplets, Flame, ChevronLeft, ChevronRight, FlaskConical } from 'lucide-react';

interface PipetteToolbarProps {
  onInjectGlucose: () => void;
  onInjectOxygen: () => void;
  onInjectToxin: () => void;
  onInjectAntibiotic: () => void;
  onDropVirion: (type: 'bacteriophage' | 'coronavirus') => void;
  onActivateCrispr: () => void;
  onSetTonicity: (tonicity: 'hypotonic' | 'isotonic' | 'hypertonic') => void;
  onUpgradePumps: () => void;
  onSetHeatVent: () => void;
  activePumps: number;
  theme: 'dark' | 'light';
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  isMobile?: boolean;
}

export const PipetteToolbar: React.FC<PipetteToolbarProps> = ({
  onInjectGlucose,
  onInjectOxygen,
  onInjectToxin,
  onInjectAntibiotic,
  onDropVirion,
  onActivateCrispr,
  onSetTonicity,
  onUpgradePumps,
  onSetHeatVent,
  activePumps,
  theme,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  isMobile = false
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = (nextVal: boolean) => {
    if (onToggleCollapse) {
      onToggleCollapse(nextVal);
    } else {
      setInternalCollapsed(nextVal);
    }
  };

  const isDark = theme === 'dark';

  const triggerAction = (toolName: string, action: () => void) => {
    setActiveTool(toolName);
    audioSynth.playNucleotideClick('A');
    action();
    setTimeout(() => setActiveTool(null), 250);
  };

  return (
    <>
      {/* Mobile Backdrop when open */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-25 animate-fade-in"
          onClick={() => handleToggle(true)}
        />
      )}

      <aside
        className={`absolute top-20 left-3 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'translate-x-0' : 'translate-x-0'
        }`}
      >
        {/* Collapsed Pill Button */}
        {isCollapsed ? (
          <button
            onClick={() => {
              handleToggle(false);
              audioSynth.playNucleotideClick('C');
            }}
            title="Open Pipette Tool Drawer"
            className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-slate-900/90 border-cyan-500/40 text-cyan-300'
                : 'bg-white/95 border-cyan-600/40 text-cyan-800 shadow-slate-200'
            }`}
          >
            <FlaskConical size={18} className="animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase">Tools</span>
            <ChevronRight size={14} />
          </button>
        ) : (
          /* Expanded Drawer */
          <div
            className={`flex flex-col gap-2 p-2 rounded-2xl border backdrop-blur-md shadow-2xl max-h-[calc(100vh-140px)] overflow-y-auto transition-all ${
              isDark
                ? 'bg-slate-950/90 border-cyan-500/40 text-slate-100'
                : 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-300'
            }`}
          >
            {/* Header with Collapse Button */}
            <div className="flex items-center justify-between pb-1 px-1 border-b border-cyan-500/20">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                isDark ? 'text-cyan-400' : 'text-cyan-700'
              }`}>
                Pipettes
              </span>
              <button
                onClick={() => {
                  handleToggle(true);
                  audioSynth.playNucleotideClick('A');
                }}
                className={`p-1 rounded-lg transition-all ${
                  isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
                }`}
                title="Minimize Pipette Drawer"
              >
                <ChevronLeft size={14} />
              </button>
            </div>

          {/* Tools Grid */}
          <div className="flex flex-col gap-1.5">
            {/* Glucose */}
            <button
              onClick={() => triggerAction('glucose', onInjectGlucose)}
              title="Inject Glucose (C6H12O6)"
              className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all border ${
                activeTool === 'glucose'
                  ? 'bg-cyan-500/30 border-cyan-400 scale-95'
                  : isDark
                  ? 'bg-slate-900/70 border-slate-800 hover:border-cyan-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-300 hover:border-cyan-500 hover:bg-slate-200'
              }`}
            >
              <Glucose3DIcon size={24} />
              <span className="hidden sm:block absolute left-12 whitespace-nowrap px-2 py-1 text-[11px] font-medium rounded-lg bg-slate-900 text-white border border-cyan-500/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-40">
                +30 Glucose
              </span>
            </button>

            {/* Oxygen */}
            <button
              onClick={() => triggerAction('oxygen', onInjectOxygen)}
              title="Diffuse Oxygen (O2)"
              className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all border ${
                activeTool === 'oxygen'
                  ? 'bg-sky-500/30 border-sky-400 scale-95'
                  : isDark
                  ? 'bg-slate-900/70 border-slate-800 hover:border-sky-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-300 hover:border-sky-500 hover:bg-slate-200'
              }`}
            >
              <Oxygen3DIcon size={24} />
              <span className="hidden sm:block absolute left-12 whitespace-nowrap px-2 py-1 text-[11px] font-medium rounded-lg bg-slate-900 text-white border border-sky-500/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-40">
                +25% Oxygen
              </span>
            </button>

            {/* Toxin */}
            <button
              onClick={() => triggerAction('toxin', onInjectToxin)}
              title="Inject Respiratory Toxin / Acid"
              className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all border ${
                activeTool === 'toxin'
                  ? 'bg-rose-500/30 border-rose-400 scale-95'
                  : isDark
                  ? 'bg-slate-900/70 border-slate-800 hover:border-rose-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-300 hover:border-rose-500 hover:bg-slate-200'
              }`}
            >
              <Toxin3DIcon size={24} />
              <span className="hidden sm:block absolute left-12 whitespace-nowrap px-2 py-1 text-[11px] font-medium rounded-lg bg-slate-900 text-white border border-rose-500/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-40">
                +Toxin / Acid
              </span>
            </button>

            {/* Antibiotic */}
            <button
              onClick={() => triggerAction('antibiotic', onInjectAntibiotic)}
              title="Inject Antibiotics & Boost Antibodies"
              className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all border ${
                activeTool === 'antibiotic'
                  ? 'bg-purple-500/30 border-purple-400 scale-95'
                  : isDark
                  ? 'bg-slate-900/70 border-slate-800 hover:border-purple-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-300 hover:border-purple-500 hover:bg-slate-200'
              }`}
            >
              <Antibiotic3DIcon size={24} />
              <span className="hidden sm:block absolute left-12 whitespace-nowrap px-2 py-1 text-[11px] font-medium rounded-lg bg-slate-900 text-white border border-purple-500/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-40">
                Antibodies + Antibiotic
              </span>
            </button>

            {/* Virus Dropper */}
            <button
              onClick={() => triggerAction('virus', () => onDropVirion('coronavirus'))}
              title="Drop Virions (+5 Virions)"
              className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all border ${
                activeTool === 'virus'
                  ? 'bg-red-500/30 border-red-400 scale-95'
                  : isDark
                  ? 'bg-slate-900/70 border-slate-800 hover:border-red-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-300 hover:border-red-500 hover:bg-slate-200'
              }`}
            >
              <Virus3DIcon size={24} />
              <span className="hidden sm:block absolute left-12 whitespace-nowrap px-2 py-1 text-[11px] font-medium rounded-lg bg-slate-900 text-white border border-red-500/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-40">
                +5 Virions Swarm
              </span>
            </button>

            {/* CRISPR Scalpel */}
            <button
              onClick={() => triggerAction('crispr', onActivateCrispr)}
              title="CRISPR-Cas9 Gene Scalpel"
              className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all border ${
                activeTool === 'crispr'
                  ? 'bg-amber-500/30 border-amber-400 scale-95'
                  : isDark
                  ? 'bg-slate-900/70 border-slate-800 hover:border-amber-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-300 hover:border-amber-500 hover:bg-slate-200'
              }`}
            >
              <Crispr3DIcon size={24} />
              <span className="hidden sm:block absolute left-12 whitespace-nowrap px-2 py-1 text-[11px] font-medium rounded-lg bg-slate-900 text-white border border-amber-500/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-40">
                CRISPR Gene Surgery
              </span>
            </button>
          </div>

          <div className="w-full my-0.5 border-t border-slate-700/40" />

          {/* Environmental Shocks */}
          <div className="flex flex-col gap-1">
            {/* Ion Pump */}
            <button
              onClick={() => triggerAction('pump', onUpgradePumps)}
              title="Upgrade Na+/K+ ATPase Pumps"
              className={`flex items-center justify-center w-10 h-7 rounded-lg border text-[10px] font-mono font-bold transition-all ${
                isDark
                  ? 'bg-slate-900/60 border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40'
                  : 'bg-slate-100 border-emerald-600/40 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <ShieldPlus size={13} />
              <span className="ml-1">{activePumps}</span>
            </button>

            {/* Hypotonic Shock */}
            <button
              onClick={() => triggerAction('hypo', () => onSetTonicity('hypotonic'))}
              title="Hypotonic Distilled Water Shock"
              className={`flex items-center justify-center w-10 h-7 rounded-lg border text-[10px] transition-all ${
                isDark
                  ? 'bg-slate-900/60 border-blue-500/40 text-blue-400 hover:bg-blue-950/40'
                  : 'bg-slate-100 border-blue-600/40 text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Droplets size={14} />
            </button>

            {/* Hydrothermal Heat Vent */}
            <button
              onClick={() => triggerAction('heat', onSetHeatVent)}
              title="95°C Boiling Heat Vent Shock"
              className={`flex items-center justify-center w-10 h-7 rounded-lg border text-[10px] transition-all ${
                isDark
                  ? 'bg-slate-900/60 border-orange-500/40 text-orange-400 hover:bg-orange-950/40'
                  : 'bg-slate-100 border-orange-600/40 text-orange-700 hover:bg-orange-50'
              }`}
            >
              <Flame size={14} />
            </button>
          </div>
        </div>
      )}
      </aside>
    </>
  );
};
