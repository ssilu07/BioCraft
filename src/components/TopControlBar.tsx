/**
 * TopControlBar.tsx
 * Top Navigation & Simulation Orchestrator Bar:
 * - Dual-Theme Switcher (Dark Cyber-Navy vs Light Clinical Bio-Lab)
 * - Mobile-First Responsive Layout (Never Congested, Adaptive Buttons)
 * - Mode Switcher: [Cell Sandbox] | [DNA Codon Lab] | [Immune Defense]
 * - Multi-scale Virtual Zoom Slider (10x -> 100x -> 1000x)
 * - Simulation Speeds & Sound Mute Toggle
 */

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Target,
  Sparkles,
  Dna,
  Shield,
  Activity,
  Layers,
  Sun,
  Moon
} from 'lucide-react';
import { Dna3DIcon } from './Bio3DIcons';
import { audioSynth } from '../engine/OrganicAudioSynth';

export type SimulationMode = 'sandbox' | 'dna_lab' | 'immune_defense';

interface TopControlBarProps {
  activeMode: SimulationMode;
  onSelectMode: (mode: SimulationMode) => void;
  speed: number;
  onSetSpeed: (speed: number) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  zoomScale: number;
  onSetZoom: (zoom: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onReset: () => void;
  onOpenMissions: () => void;
  onOpenAtlas: () => void;
  onOpenOrganelles?: () => void;
  activeMissionTitle?: string;
  missionProgress?: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const TopControlBar: React.FC<TopControlBarProps> = ({
  activeMode,
  onSelectMode,
  speed,
  onSetSpeed,
  isPaused,
  onTogglePause,
  zoomScale,
  onSetZoom,
  isMuted,
  onToggleMute,
  onReset,
  onOpenMissions,
  onOpenAtlas,
  onOpenOrganelles,
  activeMissionTitle,
  missionProgress = 0,
  theme,
  onToggleTheme
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className={`absolute top-2.5 left-2.5 right-2.5 z-40 flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border backdrop-blur-md shadow-2xl transition-all ${
        isDark
          ? 'bg-slate-950/85 border-cyan-500/30 text-slate-100'
          : 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-200'
      }`}
    >
      {/* Brand & Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className={`relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border ${
          isDark
            ? 'bg-gradient-to-br from-cyan-950 to-slate-900 border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
            : 'bg-gradient-to-br from-cyan-100 to-white border-cyan-600/40 shadow-sm'
        }`}>
          <img src="/icon.png" alt="BioCraft Icon" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-extrabold tracking-tight flex items-center gap-1.5 font-sans">
            <span className={isDark ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-lime-300' : 'text-cyan-900'}>
              BioCraft
            </span>
            <span className="hidden sm:inline text-[9px] font-mono px-1 py-0.5 rounded bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 font-bold uppercase">
              3D Bio
            </span>
          </h1>
        </div>
      </div>

      {/* Mode Switcher */}
      <nav className={`flex items-center gap-0.5 p-0.5 rounded-xl border ${
        isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          onClick={() => {
            onSelectMode('sandbox');
            audioSynth.playNucleotideClick('A');
          }}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeMode === 'sandbox'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity size={13} />
          <span className="hidden md:inline">Cell</span>
        </button>

        <button
          onClick={() => {
            onSelectMode('dna_lab');
            audioSynth.playNucleotideClick('G');
          }}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeMode === 'dna_lab'
              ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Dna size={13} />
          <span className="hidden md:inline">DNA</span>
        </button>

        <button
          onClick={() => {
            onSelectMode('immune_defense');
            audioSynth.playNucleotideClick('U');
          }}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeMode === 'immune_defense'
              ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield size={13} />
          <span className="hidden md:inline">Immune</span>
        </button>
      </nav>

      {/* Scale Zoom Pills (Visible on all viewports, compact on mobile) */}
      <div className={`flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-0.5 sm:py-1 rounded-xl border text-[10px] sm:text-[11px] font-mono ${
        isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          onClick={() => {
            onSetZoom(10);
            audioSynth.playNucleotideClick('A');
          }}
          className={`px-1 sm:px-1.5 py-0.5 rounded font-bold transition-all ${
            zoomScale <= 25
              ? isDark
                ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-400/50 shadow-sm'
                : 'bg-cyan-600 text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-cyan-400'
              : 'text-slate-600 hover:text-cyan-700'
          }`}
          title="Macro Scale (10x): Petri dish & blood vessel overview"
        >
          10×
        </button>
        <button
          onClick={() => {
            onSetZoom(100);
            audioSynth.playNucleotideClick('T');
          }}
          className={`px-1 sm:px-1.5 py-0.5 rounded font-bold transition-all ${
            zoomScale > 25 && zoomScale < 300
              ? isDark
                ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-400/50 shadow-sm'
                : 'bg-cyan-600 text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-cyan-400'
              : 'text-slate-600 hover:text-cyan-700'
          }`}
          title="Cellular Scale (100x): Living cell, organelles & membrane"
        >
          100×
        </button>
        <button
          onClick={() => {
            onSetZoom(1000);
            audioSynth.playNucleotideClick('G');
          }}
          className={`px-1 sm:px-1.5 py-0.5 rounded font-bold transition-all ${
            zoomScale >= 300
              ? isDark
                ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-400/50 shadow-sm'
                : 'bg-cyan-600 text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-cyan-400'
              : 'text-slate-600 hover:text-cyan-700'
          }`}
          title="Nanoscale (1000x): DNA Double Helix & Ribosome Codon Translation"
        >
          1000×
        </button>
      </div>

      {/* Bio Atlas & Mission Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Organelles Inspector Button */}
        <button
          onClick={onOpenOrganelles}
          title="Open Organelle Deep-Dive Inspector & Biochemistry"
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all ${
            isDark
              ? 'bg-slate-900/80 hover:bg-slate-800 border-amber-500/30 text-amber-300'
              : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
          }`}
        >
          <Layers size={13} className="text-amber-500" />
          <span className="hidden sm:inline">Organelles</span>
        </button>

        {/* Bio Atlas Button */}
        <button
          onClick={onOpenAtlas}
          title="Open Biological Atlas & Chemical Diagrams"
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all ${
            isDark
              ? 'bg-slate-900/80 hover:bg-slate-800 border-cyan-500/30 text-cyan-300'
              : 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-800'
          }`}
        >
          <Sparkles size={13} className="text-cyan-500" />
          <span className="hidden sm:inline">Atlas</span>
        </button>

        {/* Missions Button */}
        <button
          onClick={onOpenMissions}
          title="Open Biological Missions"
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/40 text-xs font-semibold text-indigo-200 hover:scale-102 transition-all shadow-sm"
        >
          <Target size={13} className="text-indigo-400" />
          <span className="hidden lg:inline truncate max-w-[100px]">
            {activeMissionTitle || 'Missions'}
          </span>
          <div className="w-8 h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${missionProgress}%` }}
            />
          </div>
        </button>
      </div>

      {/* Right Controls: Theme Toggle, Audio, Speed, Pause, Reset */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Theme Switcher Toggle (Sun / Moon) */}
        <button
          onClick={() => {
            onToggleTheme();
            audioSynth.playNucleotideClick('C');
          }}
          title={isDark ? 'Switch to Light Clinical Theme' : 'Switch to Dark Bioluminescent Theme'}
          className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border transition-all ${
            isDark
              ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-amber-300 hover:text-amber-200'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900'
          }`}
        >
          {isDark ? <Sun size={14} className="animate-spin-slow" /> : <Moon size={14} />}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border transition-all ${
            isDark
              ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300'
          }`}
        >
          {isMuted ? <VolumeX size={14} className="text-rose-400" /> : <Volume2 size={14} className="text-cyan-500" />}
        </button>

        {/* Play/Pause */}
        <button
          onClick={onTogglePause}
          title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
          className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border transition-all ${
            isDark
              ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
          }`}
        >
          {isPaused ? <Play size={13} className="text-emerald-400 fill-emerald-400" /> : <Pause size={13} />}
        </button>

        {/* Speed */}
        <div className={`hidden sm:flex items-center rounded-lg border p-0.5 text-[10px] font-mono ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-300'
        }`}>
          {[0.5, 1.0, 2.0].map((s) => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                speed === s
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>

        {/* Reset */}
        <button
          onClick={onReset}
          title="Reset Simulation"
          className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border transition-all ${
            isDark
              ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-rose-400'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-rose-600'
          }`}
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </header>
  );
};
