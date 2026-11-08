/**
 * BioTelemetryHUD.tsx
 * Right Bio-Telemetry Panel:
 * - Mobile-First Collapsible Architecture (Toggleable Pill / Full Telemetry Drawer)
 * - Dual-Theme Support (High Contrast Light Mode vs Glowing Dark Mode)
 * - Live Meters: ATP Battery, Osmotic Tonicity, Intracellular pH, Waste & Lysis Integrity
 */

import React, { useState } from 'react';
import { MetabolicState } from '../engine/MetabolicSimulator';
import { ImmuneState } from '../engine/ImmuneSystemEngine';
import { Atp3DIcon } from './Bio3DIcons';
import { audioSynth } from '../engine/OrganicAudioSynth';
import {
  Zap,
  AlertTriangle,
  ShieldCheck,
  Droplet,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Activity
} from 'lucide-react';

interface BioTelemetryHUDProps {
  metabolicState: MetabolicState;
  immuneState: ImmuneState;
  geneticsInfo: {
    gfpActive: boolean;
    flagellinActive: boolean;
    isSickleCell: boolean;
    isThermostable: boolean;
    polypeptideLength: number;
    foldingStabilityScore: number;
  };
  isBurst: boolean;
  theme: 'dark' | 'light';
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  isMobile?: boolean;
}

export const BioTelemetryHUD: React.FC<BioTelemetryHUDProps> = ({
  metabolicState,
  immuneState,
  geneticsInfo,
  isBurst,
  theme,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  isMobile = false
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const isDark = theme === 'dark';

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = (nextVal: boolean) => {
    if (onToggleCollapse) {
      onToggleCollapse(nextVal);
    } else {
      setInternalCollapsed(nextVal);
    }
  };

  const atpPercent = Math.min(100, (metabolicState.atp / 150) * 100);
  const glucosePercent = Math.min(100, (metabolicState.glucose / 160) * 100);
  const oxygenPercent = Math.min(100, metabolicState.oxygen);

  const ph = metabolicState.intracellularPh;
  let phColor = isDark ? 'text-emerald-400' : 'text-emerald-700';
  let phLabel = 'Normal (7.4)';
  if (ph < 7.15) {
    phColor = isDark ? 'text-rose-400 font-bold' : 'text-rose-700 font-bold';
    phLabel = 'Acidosis';
  } else if (ph < 7.3) {
    phColor = isDark ? 'text-amber-400' : 'text-amber-700';
    phLabel = 'Mild Acid';
  }

  const osm = metabolicState.osmoticPressure;
  let osmStatus = 'Isotonic';
  let osmColor = isDark ? 'text-cyan-400' : 'text-cyan-700';
  if (osm > 380) {
    osmStatus = 'Hypertonic';
    osmColor = isDark ? 'text-amber-400' : 'text-amber-700';
  } else if (osm < 210) {
    osmStatus = 'Hypotonic (Risk)';
    osmColor = isDark ? 'text-rose-400' : 'text-rose-700';
  }

  return (
    <>
      {/* Mobile Backdrop when open */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-25 animate-fade-in"
          onClick={() => handleToggle(true)}
        />
      )}

      <aside className="absolute top-20 right-3 z-30 transition-all duration-300 ease-in-out">
        {/* Collapsed Compact Pill */}
        {isCollapsed ? (
          <button
            onClick={() => {
              handleToggle(false);
              audioSynth.playNucleotideClick('A');
            }}
            title="Open Bio-Telemetry HUD"
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-slate-900/90 border-cyan-500/40 text-slate-100'
                : 'bg-white/95 border-cyan-600/40 text-slate-900 shadow-slate-200'
            }`}
          >
            <ChevronLeft size={14} className="text-cyan-400" />
            <Activity size={16} className="text-cyan-400 animate-pulse" />
            <div className="flex items-center gap-2 text-xs font-mono font-bold">
              <span className={isDark ? 'text-amber-400' : 'text-amber-700'}>
                {metabolicState.atp.toFixed(0)} ATP
              </span>
              <span className="text-slate-400">|</span>
              <span className={phColor}>pH {ph.toFixed(2)}</span>
            </div>
          </button>
        ) : (
          /* Full Telemetry Drawer */
          <div
            className={`max-w-[calc(100vw-28px)] w-72 sm:w-80 max-h-[calc(100vh-140px)] overflow-y-auto rounded-2xl border p-3.5 shadow-2xl backdrop-blur-md flex flex-col gap-3 text-xs transition-all ${
              isDark
                ? 'bg-slate-950/90 border-cyan-500/40 text-slate-100'
                : 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-300'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/20">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className={isDark ? 'text-cyan-400' : 'text-cyan-700'}>Bio-Telemetry</span>
              </div>
              <button
                onClick={() => {
                  handleToggle(true);
                  audioSynth.playNucleotideClick('T');
                }}
                className={`p-1 rounded-lg transition-all ${
                  isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
                }`}
                title="Collapse Telemetry Drawer"
              >
                <ChevronRight size={14} />
              </button>
            </div>

          {/* Lysis Alert */}
          {isBurst && (
            <div className="p-2 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center gap-2 text-red-200">
              <AlertTriangle size={16} className="text-red-400 shrink-0 animate-bounce" />
              <div className="text-[10px] font-bold">
                MEMBRANE RUPTURED (LYSIS)
              </div>
            </div>
          )}

          {/* 1. ATP Reserves & F0/F1 Turbine */}
          <div
            className={`p-2.5 rounded-xl border ${
              isDark
                ? 'bg-slate-900/60 border-amber-500/30'
                : 'bg-amber-50/70 border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className={`flex items-center gap-1 font-semibold ${
                isDark ? 'text-amber-300' : 'text-amber-900'
              }`}>
                <Atp3DIcon size={16} />
                <span>ATP Energy Battery</span>
              </div>
              <span className={`font-mono text-xs font-black ${
                isDark ? 'text-amber-400' : 'text-amber-800'
              }`}>
                {metabolicState.atp.toFixed(0)} <span className="text-[9px] font-normal text-slate-400">/ 100</span>
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden mb-1.5">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-200"
                style={{ width: `${atpPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[9.5px] font-mono text-slate-400">
              <span>F0/F1 Turbine: <strong className={isDark ? 'text-yellow-400' : 'text-yellow-700'}>{metabolicState.atpSynthaseRpm} RPM</strong></span>
              <span>ΔΨ: <strong className={isDark ? 'text-cyan-400' : 'text-cyan-700'}>{metabolicState.protonGradient.toFixed(0)}%</strong></span>
            </div>
          </div>

          {/* 2. Osmotic Tonicity & pH in 2 Columns */}
          <div className="grid grid-cols-2 gap-2">
            {/* Osmosis */}
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-slate-900/60 border-cyan-500/30' : 'bg-cyan-50/70 border-cyan-300'
            }`}>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                <Droplet size={12} className="text-cyan-500" />
                <span>Osmotic</span>
              </div>
              <div className={`font-mono text-xs font-bold mt-0.5 ${
                isDark ? 'text-cyan-300' : 'text-cyan-900'
              }`}>
                {metabolicState.osmoticPressure.toFixed(0)} <span className="text-[8px] font-normal text-slate-400">mOsm</span>
              </div>
              <div className={`text-[9px] font-mono font-semibold truncate ${osmColor}`}>
                {osmStatus}
              </div>
            </div>

            {/* pH */}
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-300'
            }`}>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                <Zap size={12} className="text-emerald-500" />
                <span>Intracellular</span>
              </div>
              <div className={`font-mono text-xs font-bold mt-0.5 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                pH {ph.toFixed(2)}
              </div>
              <div className={`text-[9px] font-mono font-semibold truncate ${phColor}`}>
                {phLabel}
              </div>
            </div>
          </div>

          {/* 3. Substrates (Glucose & Oxygen) */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-slate-400 block">Glucose</span>
              <span className={`font-mono font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                {metabolicState.glucose.toFixed(0)} mg/dL
              </span>
              <div className="w-full h-1 bg-slate-800/80 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${glucosePercent}%` }} />
              </div>
            </div>

            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-slate-400 block">Oxygen (O2)</span>
              <span className={`font-mono font-bold ${isDark ? 'text-sky-300' : 'text-sky-800'}`}>
                {metabolicState.oxygen.toFixed(0)}%
              </span>
              <div className="w-full h-1 bg-slate-800/80 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-sky-400" style={{ width: `${oxygenPercent}%` }} />
              </div>
            </div>
          </div>

          {/* 4. Pathogen & Immune Status */}
          <div className={`p-2.5 rounded-xl border ${
            isDark ? 'bg-slate-900/60 border-red-500/25' : 'bg-rose-50/70 border-rose-300'
          }`}>
            <div className="flex items-center justify-between mb-1 font-semibold text-[10px]">
              <span className={isDark ? 'text-red-300' : 'text-red-900'}>
                Viral Load & Immunity
              </span>
              <span className="font-mono text-slate-400">
                {immuneState.virionsExtracellular.length} Extracellular
              </span>
            </div>

            <div className="space-y-0.5 text-[9.5px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Internal Load:</span>
                <span className={immuneState.viralLoadInternal > 20 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                  {immuneState.viralLoadInternal.toFixed(0)} / {immuneState.lysisThreshold} Lysis
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phagocytoses:</span>
                <span className="text-emerald-500 font-bold">{immuneState.totalVirusesEngulfed} Virions</span>
              </div>
            </div>
          </div>

          {/* 5. Active Phenotypes */}
          <div className={`p-2 rounded-xl border text-[10px] ${
            isDark ? 'bg-slate-900/60 border-lime-500/30' : 'bg-lime-50/70 border-lime-300'
          }`}>
            <div className="font-semibold mb-1 flex items-center gap-1 text-lime-400">
              <Sparkles size={12} />
              <span>Active Phenotype Readout</span>
            </div>
            <div className="flex justify-between text-[9px] font-mono">
              <span>GFP: <strong className={geneticsInfo.gfpActive ? 'text-lime-400' : 'text-slate-400'}>{geneticsInfo.gfpActive ? 'ON' : 'OFF'}</strong></span>
              <span>Flagellin: <strong className={geneticsInfo.flagellinActive ? 'text-cyan-400' : 'text-slate-400'}>{geneticsInfo.flagellinActive ? 'ON' : 'OFF'}</strong></span>
              <span>HBB: <strong className={geneticsInfo.isSickleCell ? 'text-rose-400' : 'text-emerald-400'}>{geneticsInfo.isSickleCell ? 'Sickle' : 'Wild'}</strong></span>
            </div>
          </div>
        </div>
      )}
      </aside>
    </>
  );
};
