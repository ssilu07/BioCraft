/**
 * MissionModal.tsx
 * Gamified Challenges & Interactive Mission Selector Modal:
 * - 5 Fully Playable Biological Missions
 * - Real-time Objective Evaluation & Feedback
 * - Mitotic Cell Division Victory Animation
 * - Confetti Celebration & Sound Fanfare
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MISSIONS, MissionDefinition } from '../engine/GameMissions';
import { audioSynth } from '../engine/OrganicAudioSynth';
import { Target, CheckCircle2, AlertCircle, X, ChevronRight, Award, Sparkles } from 'lucide-react';

interface MissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMissionId: number;
  onSelectMission: (missionId: number) => void;
  isMissionCompleted: boolean;
  missionProgressPercent: number;
  missionStatusMessage: string;
  theme: 'dark' | 'light';
}

export const MissionModal: React.FC<MissionModalProps> = ({
  isOpen,
  onClose,
  activeMissionId,
  onSelectMission,
  isMissionCompleted,
  missionProgressPercent,
  missionStatusMessage,
  theme
}) => {
  const isDark = theme === 'dark';
  // Fire confetti and play fanfare when mission is completed
  useEffect(() => {
    if (isMissionCompleted) {
      audioSynth.playMitosisCelebration();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#84cc16', '#facc15', '#ec4899', '#38bdf8']
        });
      } catch {
        // Fallback
      }
    }
  }, [isMissionCompleted]);

  if (!isOpen) return null;

  const currentMission = MISSIONS.find(m => m.id === activeMissionId) || MISSIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border p-4 sm:p-6 flex flex-col gap-4 shadow-2xl transition-all ${
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

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-lime-300 font-sans">
              BIOLOGICAL CHALLENGES & MISSIONS
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              5 Precision Cellular Engineering Scenarios
            </p>
          </div>
        </div>

        {/* Victory Celebration Card (If Active Mission is Completed) */}
        {isMissionCompleted && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-cyan-950/90 border border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-pulse-subtle flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40">
                <Award size={22} />
              </div>
              <div>
                <div className="text-sm font-black text-emerald-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  MISSION ACCOMPLISHED! MITOSIS ACHIEVED
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  Cell successfully duplicated into 2 healthy daughter cells.
                </div>
              </div>
            </div>

            {activeMissionId < 5 && (
              <button
                onClick={() => onSelectMission(activeMissionId + 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shrink-0"
              >
                <span>Next Mission</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}

        {/* Mission Level Selector Pills */}
        <div className="grid grid-cols-5 gap-2">
          {MISSIONS.map(mission => {
            const isSelected = mission.id === activeMissionId;
            return (
              <button
                key={mission.id}
                onClick={() => onSelectMission(mission.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-102'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-slate-400">LVL {mission.id}</span>
                <span className="text-xs font-bold truncate max-w-full">
                  {mission.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Mission Details Body */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                Level {currentMission.id} Mission
              </span>
              <h3 className="text-base font-bold text-white">
                {currentMission.title}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {currentMission.subtitle}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-slate-800 border border-slate-700 text-slate-300">
              Mode: {currentMission.recommendedMode.replace('_', ' ')}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {currentMission.description}
          </p>

          {/* Objective Box */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/20">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold mb-1">
              Target Directive:
            </div>
            <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
              <ChevronRight size={14} className="text-cyan-400 shrink-0" />
              <span>{currentMission.targetObjective}</span>
            </div>
          </div>

          {/* Real-time Progress Bar & Status */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Objective Progress:</span>
              <span className="font-bold text-cyan-400">{missionProgressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${missionProgressPercent}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5 pt-1">
              {isMissionCompleted ? (
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={13} className="text-amber-400 shrink-0" />
              )}
              <span className="truncate">{missionStatusMessage}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-800/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-lg"
          >
            Start Scenario & Close
          </button>
        </div>
      </div>
    </div>
  );
};
