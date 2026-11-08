/**
 * App.tsx
 * MicroCraft: The Cellular Biology & Genetics Sandbox
 * Production-Grade Master Orchestration Component
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CellPhysicsEngine } from './engine/CellPhysicsEngine';
import { MetabolicSimulator, MetabolicState } from './engine/MetabolicSimulator';
import { ImmuneSystemEngine, ImmuneState } from './engine/ImmuneSystemEngine';
import { GeneticsEngine, PRESET_GENES } from './engine/GeneticsTranslator';
import { audioSynth } from './engine/OrganicAudioSynth';
import { MISSIONS } from './engine/GameMissions';

import { MicroscopeCanvas } from './components/MicroscopeCanvas';
import { TopControlBar, SimulationMode } from './components/TopControlBar';
import { PipetteToolbar } from './components/PipetteToolbar';
import { BioTelemetryHUD } from './components/BioTelemetryHUD';
import { CodonSequenceRibbon } from './components/CodonSequenceRibbon';
import { MissionModal } from './components/MissionModal';
import { BiologicalDiagramsModal } from './components/BiologicalDiagramsModal';
import { OrganelleInspectorModal, OrganelleId } from './components/OrganelleInspectorModal';

export const App: React.FC = () => {
  // Engine Instances
  const physicsEngineRef = useRef<CellPhysicsEngine>(new CellPhysicsEngine(0, 0, 180));
  const metabolicSimulatorRef = useRef<MetabolicSimulator>(new MetabolicSimulator());
  const immuneEngineRef = useRef<ImmuneSystemEngine>(new ImmuneSystemEngine());

  // Simulation Controls State
  const [activeMode, setActiveMode] = useState<SimulationMode>('sandbox');
  const [speed, setSpeed] = useState<number>(1.0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(100); // 10, 100, 1000
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('microcraft_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('microcraft_theme', next);
      return next;
    });
  };

  // Biological Dynamic State (Synced from engines for React rendering)
  const [metabolicState, setMetabolicState] = useState<MetabolicState>(
    metabolicSimulatorRef.current.getState()
  );
  const [immuneState, setImmuneState] = useState<ImmuneState>(
    immuneEngineRef.current.state
  );
  const [isBurst, setIsBurst] = useState<boolean>(false);

  // Responsive Drawer Coordination (Guarantees zero overlap on mobile/desktop)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const [mobileDrawer, setMobileDrawer] = useState<'none' | 'pipettes' | 'telemetry'>('none');
  const [desktopPipettesCollapsed, setDesktopPipettesCollapsed] = useState<boolean>(false);
  const [desktopTelemetryCollapsed, setDesktopTelemetryCollapsed] = useState<boolean>(false);
  const [isCodonRibbonExpanded, setIsCodonRibbonExpanded] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : false;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setMobileDrawer('none');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectSimulationMode = (mode: SimulationMode) => {
    setActiveMode(mode);
    if (mode === 'dna_lab') {
      setZoomScale(1000);
      setIsCodonRibbonExpanded(true);
    } else if (mode === 'sandbox') {
      setZoomScale(100);
      if (isMobile) setIsCodonRibbonExpanded(false);
    } else if (mode === 'immune_defense') {
      setZoomScale(60);
      if (isMobile) setIsCodonRibbonExpanded(false);
      if (immuneEngineRef.current.state.virionsExtracellular.length === 0) {
        for (let i = 0; i < 15; i++) {
          immuneEngineRef.current.spawnVirion(i % 2 === 0 ? 'coronavirus' : 'bacteriophage');
        }
      }
    }
  };

  // Interactive Organelle Deep-Dive Inspector State
  const [isOrganelleModalOpen, setIsOrganelleModalOpen] = useState<boolean>(false);
  const [selectedOrganelleForInspection, setSelectedOrganelleForInspection] = useState<OrganelleId>('mitochondria');

  const handleOpenOrganelleInspector = useCallback((orgId: OrganelleId = 'mitochondria') => {
    setSelectedOrganelleForInspection(orgId);
    setIsOrganelleModalOpen(true);
  }, []);

  const handleExecuteOrganelleAction = useCallback((actionType: string) => {
    switch (actionType) {
      case 'respiration':
        metabolicSimulatorRef.current.injectGlucose(30);
        metabolicSimulatorRef.current.injectOxygen(25);
        break;
      case 'crispr':
        handleSelectSimulationMode('dna_lab');
        break;
      case 'vesicle':
        audioSynth.playAtpChime(1.2);
        break;
      case 'autophagy':
        immuneEngineRef.current.clearExtracellularDebris();
        audioSynth.playPhagocytosisPop();
        break;
      case 'pump':
        metabolicSimulatorRef.current.upgradeIonPumps(5);
        break;
      case 'antibodies':
        immuneEngineRef.current.emitAntibodies(8);
        break;
      case 'shock':
        metabolicSimulatorRef.current.setEnvironmentalTonicity('hypotonic');
        break;
    }
  }, []);

  // Genetics & Transcription State
  const [activeGeneId, setActiveGeneId] = useState<string>('gfp');
  const [mRnaSequence, setMRnaSequence] = useState<string>(() => {
    return GeneticsEngine.transcribeDnaToMRna(PRESET_GENES[0].wildTypeDnaTemplate);
  });
  const [translationResult, setTranslationResult] = useState(() => {
    return GeneticsEngine.translateMRna(
      GeneticsEngine.transcribeDnaToMRna(PRESET_GENES[0].wildTypeDnaTemplate)
    );
  });

  // Gamified Challenges State
  const [isMissionModalOpen, setIsMissionModalOpen] = useState<boolean>(false);
  const [isAtlasModalOpen, setIsAtlasModalOpen] = useState<boolean>(false);
  const [activeMissionId, setActiveMissionId] = useState<number>(1);
  const [isMissionCompleted, setIsMissionCompleted] = useState<boolean>(false);
  const [missionProgressPercent, setMissionProgressPercent] = useState<number>(0);
  const [missionStatusMessage, setMissionStatusMessage] = useState<string>('Initializing objective...');
  const [missionElapsedSeconds, setMissionElapsedSeconds] = useState<number>(0);

  // Initialize Genetics translation when mRNA changes
  const handleUpdateMRna = useCallback((newMRna: string) => {
    setMRnaSequence(newMRna);
    const result = GeneticsEngine.translateMRna(newMRna);
    setTranslationResult(result);
  }, []);

  // Handle Gene selection
  const handleSelectGene = useCallback((geneId: string) => {
    setActiveGeneId(geneId);
    const gene = PRESET_GENES.find(g => g.id === geneId) || PRESET_GENES[0];
    const transcribed = GeneticsEngine.transcribeDnaToMRna(gene.wildTypeDnaTemplate);
    setMRnaSequence(transcribed);
    const result = GeneticsEngine.translateMRna(transcribed);
    setTranslationResult(result);
  }, []);

  // Start procedural ambient audio on first interaction
  useEffect(() => {
    const handleFirstTouch = () => {
      audioSynth.startAmbientHum();
      window.removeEventListener('pointerdown', handleFirstTouch);
      window.removeEventListener('keydown', handleFirstTouch);
    };
    window.addEventListener('pointerdown', handleFirstTouch);
    window.addEventListener('keydown', handleFirstTouch);

    return () => {
      window.removeEventListener('pointerdown', handleFirstTouch);
      window.removeEventListener('keydown', handleFirstTouch);
      audioSynth.stopAmbientHum();
    };
  }, []);

  // Set audio mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioSynth.setMuted(nextMuted);
  };

  // Reset Cell
  const handleReset = useCallback(() => {
    physicsEngineRef.current.initMembrane();
    metabolicSimulatorRef.current.reset();
    immuneEngineRef.current.reset();
    setIsBurst(false);
    setIsMissionCompleted(false);
    setMissionElapsedSeconds(0);
    setMetabolicState(metabolicSimulatorRef.current.getState());
    setImmuneState({ ...immuneEngineRef.current.state });
    audioSynth.playNucleotideClick('C');
  }, []);

  // Switch Mission
  const handleSelectMission = useCallback((missionId: number) => {
    setActiveMissionId(missionId);
    setIsMissionCompleted(false);
    setMissionElapsedSeconds(0);

    const mission = MISSIONS.find(m => m.id === missionId);
    if (!mission) return;

    // Apply mission initial conditions
    if (mission.initialSetup) {
      if (mission.initialSetup.geneId) {
        handleSelectGene(mission.initialSetup.geneId);
      }
      if (mission.initialSetup.mutatedDna) {
        const mutatedMRna = GeneticsEngine.transcribeDnaToMRna(mission.initialSetup.mutatedDna);
        handleUpdateMRna(mutatedMRna);
      }
      if (mission.initialSetup.spawnViruses) {
        immuneEngineRef.current.reset();
        for (let i = 0; i < mission.initialSetup.spawnViruses; i++) {
          immuneEngineRef.current.spawnVirion(i % 2 === 0 ? 'coronavirus' : 'bacteriophage');
        }
      }
      if (mission.initialSetup.osmoticPressure !== undefined) {
        metabolicSimulatorRef.current.reset({ osmoticPressure: mission.initialSetup.osmoticPressure });
      }
      if (mission.initialSetup.temperature !== undefined) {
        metabolicSimulatorRef.current.setTemperature(mission.initialSetup.temperature);
      }
      if (mission.initialSetup.atp !== undefined) {
        metabolicSimulatorRef.current.reset({ atp: mission.initialSetup.atp });
      }
    }

    // Set recommended mode & zoom
    setActiveMode(mission.recommendedMode);
    if (mission.recommendedMode === 'dna_lab') setZoomScale(1000);
    else if (mission.recommendedMode === 'immune_defense') setZoomScale(50);
    else setZoomScale(100);

    audioSynth.playNucleotideClick('G');
  }, [handleSelectGene, handleUpdateMRna]);

  // Main 60 FPS Biological Simulation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let tickCount = 0;

    const simLoop = (now: number) => {
      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;

      if (!isPaused) {
        const flagActive = translationResult.mutationEffects.flagellinActive;
        const thermoActive = translationResult.mutationEffects.isThermostable;

        // 1. Metabolic Pathway Step
        const metabolicResult = metabolicSimulatorRef.current.update(
          dt,
          speed,
          flagActive,
          thermoActive
        );

        if (metabolicResult.atpProduced > 1.2 && Math.random() < 0.08) {
          audioSynth.playAtpChime(1.0);
        }

        // 2. Soft-Body Cell Physics Step
        const curMetabolic = metabolicSimulatorRef.current.getState();
        const physicsResult = physicsEngineRef.current.update(
          dt,
          curMetabolic.osmoticPressure,
          speed
        );

        // If osmotic burst triggered
        if (physicsResult.cytolysisOccurred || metabolicResult.wasLysisInduced) {
          if (!physicsEngineRef.current.isBurst) {
            physicsEngineRef.current.triggerCytolysis();
            audioSynth.playLysisExplosion();
            setIsBurst(true);
          }
        }

        // 3. Immune System Warfare Step
        const immuneResult = immuneEngineRef.current.update(
          dt,
          physicsEngineRef.current.centerX,
          physicsEngineRef.current.centerY,
          physicsEngineRef.current.currentRadius,
          physicsEngineRef.current.nodes,
          speed
        );

        if (immuneResult.virionsEngulfedCount > 0) {
          audioSynth.playPhagocytosisPop();
        }

        if (immuneResult.didLysisOccur && !physicsEngineRef.current.isBurst) {
          physicsEngineRef.current.triggerCytolysis();
          audioSynth.playLysisExplosion();
          setIsBurst(true);
        }

        // 4. Update Mission Evaluation every 10 frames
        tickCount++;
        if (tickCount % 10 === 0) {
          setMetabolicState({ ...curMetabolic });
          setImmuneState({ ...immuneEngineRef.current.state });

          // Mission checking
          const currentMission = MISSIONS.find(m => m.id === activeMissionId);
          if (currentMission && !isMissionCompleted) {
            const check = currentMission.checkWinCondition(
              curMetabolic,
              immuneEngineRef.current.state,
              {
                hasStartCodon: translationResult.hasStartCodon,
                hasTerminated: translationResult.hasTerminated,
                isSickleCell: translationResult.mutationEffects.isSickleCell,
                isThermostable: translationResult.mutationEffects.isThermostable,
                polypeptideLength: translationResult.polypeptide.length
              },
              missionElapsedSeconds + dt * 10
            );

            setMissionProgressPercent(check.progressPercent);
            setMissionStatusMessage(check.statusMessage);

            if (check.isCompleted) {
              setIsMissionCompleted(true);
            }
          }

          setMissionElapsedSeconds(prev => prev + dt * 10);
        }
      }

      animId = requestAnimationFrame(simLoop);
    };

    animId = requestAnimationFrame(simLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPaused, speed, translationResult, activeMissionId, isMissionCompleted, missionElapsedSeconds]);


  return (
    <div className={`relative w-screen h-screen overflow-hidden font-sans transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Top Orchestrator Control Bar */}
      <TopControlBar
        activeMode={activeMode}
        onSelectMode={handleSelectSimulationMode}
        speed={speed}
        onSetSpeed={setSpeed}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        zoomScale={zoomScale}
        onSetZoom={setZoomScale}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onReset={handleReset}
        onOpenMissions={() => setIsMissionModalOpen(true)}
        onOpenAtlas={() => setIsAtlasModalOpen(true)}
        onOpenOrganelles={() => handleOpenOrganelleInspector('mitochondria')}
        activeMissionTitle={MISSIONS.find(m => m.id === activeMissionId)?.title}
        missionProgress={missionProgressPercent}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Dual-Layer 3D WebGL & 2D Scientific Canvas Viewport */}
      <MicroscopeCanvas
        physicsEngine={physicsEngineRef.current}
        metabolicState={metabolicState}
        immuneEngine={immuneEngineRef.current}
        geneticsInfo={{
          gfpActive: translationResult.mutationEffects.gfpActive,
          flagellinActive: translationResult.mutationEffects.flagellinActive,
          isSickleCell: translationResult.mutationEffects.isSickleCell,
          isThermostable: translationResult.mutationEffects.isThermostable
        }}
        zoomScale={zoomScale}
        activeMode={activeMode}
        theme={theme}
        onInspectOrganelle={handleOpenOrganelleInspector}
      />

      {/* Left Pipette & Environmental Toolbar */}
      <PipetteToolbar
        onInjectGlucose={() => metabolicSimulatorRef.current.injectGlucose(30)}
        onInjectOxygen={() => metabolicSimulatorRef.current.injectOxygen(25)}
        onInjectToxin={() => metabolicSimulatorRef.current.injectToxin(20)}
        onInjectAntibiotic={() => {
          immuneEngineRef.current.emitAntibodies(6);
          immuneEngineRef.current.boostAntibodyProduction(1.5);
        }}
        onDropVirion={(type) => {
          for (let i = 0; i < 5; i++) {
            immuneEngineRef.current.spawnVirion(type);
          }
        }}
        onActivateCrispr={() => {
          handleSelectSimulationMode('dna_lab');
        }}
        onSetTonicity={(tonicity) => metabolicSimulatorRef.current.setEnvironmentalTonicity(tonicity)}
        onUpgradePumps={() => metabolicSimulatorRef.current.upgradeIonPumps(5)}
        onSetHeatVent={() => metabolicSimulatorRef.current.setTemperature(95)}
        activePumps={metabolicState.activePumps}
        theme={theme}
        isCollapsed={isMobile ? mobileDrawer !== 'pipettes' : desktopPipettesCollapsed}
        onToggleCollapse={(col) => {
          if (isMobile) {
            setMobileDrawer(col ? 'none' : 'pipettes');
          } else {
            setDesktopPipettesCollapsed(col);
          }
        }}
        isMobile={isMobile}
      />

      {/* Right Bio-Telemetry HUD */}
      <BioTelemetryHUD
        metabolicState={metabolicState}
        immuneState={immuneState}
        geneticsInfo={{
          gfpActive: translationResult.mutationEffects.gfpActive,
          flagellinActive: translationResult.mutationEffects.flagellinActive,
          isSickleCell: translationResult.mutationEffects.isSickleCell,
          isThermostable: translationResult.mutationEffects.isThermostable,
          polypeptideLength: translationResult.polypeptide.length,
          foldingStabilityScore: translationResult.foldingStabilityScore
        }}
        isBurst={isBurst}
        theme={theme}
        isCollapsed={isMobile ? mobileDrawer !== 'telemetry' : desktopTelemetryCollapsed}
        onToggleCollapse={(col) => {
          if (isMobile) {
            setMobileDrawer(col ? 'none' : 'telemetry');
          } else {
            setDesktopTelemetryCollapsed(col);
          }
        }}
        isMobile={isMobile}
      />

      {/* Bottom Genetic Transcription & Codon Reading Ribbon */}
      <CodonSequenceRibbon
        activeGeneId={activeGeneId}
        onSelectGene={handleSelectGene}
        mRnaSequence={mRnaSequence}
        onUpdateMRna={handleUpdateMRna}
        translationResult={translationResult}
        theme={theme}
        isExpanded={isCodonRibbonExpanded}
        onToggleExpanded={(exp) => setIsCodonRibbonExpanded(exp)}
        isMobile={isMobile}
      />

      {/* Gamified Challenges Selector & Victory Modal */}
      <MissionModal
        isOpen={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        activeMissionId={activeMissionId}
        onSelectMission={handleSelectMission}
        isMissionCompleted={isMissionCompleted}
        missionProgressPercent={missionProgressPercent}
        missionStatusMessage={missionStatusMessage}
        theme={theme}
      />

      {/* Biological Diagrams & Anatomical Atlas Modal */}
      <BiologicalDiagramsModal
        isOpen={isAtlasModalOpen}
        onClose={() => setIsAtlasModalOpen(false)}
        theme={theme}
      />

      {/* University & Medical Grade Organelle Inspector Modal */}
      <OrganelleInspectorModal
        isOpen={isOrganelleModalOpen}
        onClose={() => setIsOrganelleModalOpen(false)}
        selectedOrganelleId={selectedOrganelleForInspection}
        onSelectOrganelle={(id) => setSelectedOrganelleForInspection(id)}
        onExecuteSimulationAction={handleExecuteOrganelleAction}
        theme={theme}
      />
    </div>
  );
};
