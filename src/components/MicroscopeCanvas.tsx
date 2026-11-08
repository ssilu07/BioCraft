/**
 * MicroscopeCanvas.tsx
 * Dual-Layer High-Performance Biological Viewport:
 * Layer 1: Three.js 3D WebGL Renderer with Volumetric Organelles, 3D Soft-Body Mesh, 3D DNA & Viruses
 * Layer 2: 2D HTML5 HUD Canvas with 3D-Projected Real-Time Tracking Callout Annotations & Reticle
 */

import React, { useEffect, useRef, useState } from 'react';
import { Bio3DRenderer } from '../engine/Bio3DRenderer';
import { CellPhysicsEngine } from '../engine/CellPhysicsEngine';
import { MetabolicState } from '../engine/MetabolicSimulator';
import { ImmuneSystemEngine } from '../engine/ImmuneSystemEngine';
import { audioSynth } from '../engine/OrganicAudioSynth';
import { Tag } from 'lucide-react';
import { OrganelleId } from './OrganelleInspectorModal';

interface MicroscopeCanvasProps {
  physicsEngine: CellPhysicsEngine;
  metabolicState: MetabolicState;
  immuneEngine: ImmuneSystemEngine;
  geneticsInfo: {
    gfpActive: boolean;
    flagellinActive: boolean;
    isSickleCell: boolean;
    isThermostable: boolean;
  };
  zoomScale: number; // 10, 100, 1000
  activeMode: string;
  theme: 'dark' | 'light';
  onInspectOrganelle?: (organelleId: OrganelleId) => void;
}

export const MicroscopeCanvas: React.FC<MicroscopeCanvasProps> = ({
  physicsEngine,
  metabolicState,
  immuneEngine,
  geneticsInfo,
  zoomScale,
  activeMode,
  theme,
  onInspectOrganelle
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Bio3DRenderer | null>(null);
  const [showCallouts, setShowCallouts] = useState<boolean>(true);
  const badgeClickTargetsRef = useRef<Array<{ id: string; x: number; y: number; w: number; h: number }>>([]);

  // Initialize 3D Three.js Renderer
  useEffect(() => {
    if (!containerRef.current) return;

    const renderer3D = new Bio3DRenderer(containerRef.current);
    rendererRef.current = renderer3D;
    renderer3D.setTheme(theme);

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer3D.resize(w, h);

      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.width = w;
        overlayCanvasRef.current.height = h;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;

      // Update 3D Scene
      renderer3D.update(
        dt,
        physicsEngine,
        metabolicState,
        immuneEngine,
        geneticsInfo,
        activeMode
      );

      // Render 2D Annotations
      draw2DOverlay();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer3D.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setZoom(zoomScale);
    }
  }, [zoomScale]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setTheme(theme);
    }
  }, [theme]);

  /**
   * Draws 2D Scientific Overlay:
   * Uses actual 3D world projected organelle coordinates to draw leader lines outward!
   */
  const draw2DOverlay = () => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const isDark = theme === 'dark';

    ctx.save();

    // 1. Subtle Microscope Crosshairs & Reticle (Only in cellular/macro)
    const curZoom = rendererRef.current ? rendererRef.current.currentZoom : zoomScale;
    const isNanoscale = curZoom >= 300 || activeMode === 'dna_lab';

    if (!isNanoscale) {
      ctx.strokeStyle = isDark ? 'rgba(6, 182, 212, 0.12)' : 'rgba(2, 132, 199, 0.20)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(w, h) * 0.38, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = isDark ? 'rgba(6, 182, 212, 0.08)' : 'rgba(2, 132, 199, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy);
      ctx.lineTo(cx + 20, cy);
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx, cy + 20);
      ctx.stroke();
    }

    // 2. Real-Time 3D-to-2D Projected Organelle Callouts (STRICTLY Cellular Scale Only)
    if (
      showCallouts &&
      curZoom >= 40 &&
      curZoom <= 260 &&
      !isNanoscale &&
      !physicsEngine.isBurst &&
      rendererRef.current
    ) {
      const callouts = rendererRef.current.projectedCallouts;
      const nextBadges: Array<{ id: string; x: number; y: number; w: number; h: number }> = [];

      for (let i = 0; i < callouts.length; i++) {
        const item = callouts[i];
        if (!item.visible) continue;

        // Calculate outward direction vector from screen center to organelle point
        const dx = item.screenX - cx;
        const dy = item.screenY - cy;
        const angle = Math.atan2(dy, dx);

        // Leader line elbow extending outward away from center
        const elbowX = item.screenX + Math.cos(angle) * 35;
        const elbowY = item.screenY + Math.sin(angle) * 35;
        const textOffsetX = dx >= 0 ? 85 : -85;
        const endX = elbowX + textOffsetX;
        const endY = elbowY;

        // Draw Leader line
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = isDark ? 0.65 : 0.85;

        // Anchor circle on organelle
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(item.screenX, item.screenY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Elbow line
        ctx.beginPath();
        ctx.moveTo(item.screenX, item.screenY);
        ctx.lineTo(elbowX, elbowY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Badge pill background
        ctx.save();
        const badgeWidth = 114;
        const badgeHeight = 24;
        const badgeX = dx >= 0 ? elbowX + 4 : elbowX - badgeWidth - 4;
        const badgeY = elbowY - 14;

        nextBadges.push({ id: item.id, x: badgeX, y: badgeY, w: badgeWidth, h: badgeHeight });

        ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.96)';
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 6);
        ctx.fill();
        ctx.stroke();

        // Label Tag Text inside badge
        ctx.font = '600 10px Inter, sans-serif';
        ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
        ctx.textAlign = 'left';
        ctx.fillText(item.name, badgeX + 6, badgeY + 10);

        ctx.font = '500 8.5px monospace';
        ctx.fillStyle = item.color;
        ctx.fillText(item.detail, badgeX + 6, badgeY + 20);
        ctx.restore();
      }

      badgeClickTargetsRef.current = nextBadges;
    } else {
      badgeClickTargetsRef.current = [];
    }

    // 3. Render Lysis Debris Explosions if Burst (Only on cellular view)
    if (physicsEngine.isBurst && !isNanoscale && curZoom < 280) {
      for (const d of physicsEngine.burstDebris) {
        ctx.fillStyle = d.color;
        ctx.globalAlpha = Math.max(0, d.life);
        ctx.beginPath();
        ctx.arc(cx + d.x * 0.8, cy + d.y * 0.8, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CRITICAL CELLULAR LYSIS — MEMBRANE RUPTURED', cx, cy - 110);
    }

    ctx.restore();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if clicked an organelle badge
    const clickedBadge = badgeClickTargetsRef.current.find(b =>
      clickX >= b.x && clickX <= b.x + b.w && clickY >= b.y && clickY <= b.y + b.h
    );

    if (clickedBadge && onInspectOrganelle) {
      const idMap: Record<string, OrganelleId> = {
        nuc: 'nucleus',
        mito: 'mitochondria',
        golgi: 'golgi',
        lyso: 'lysosome',
        flag: 'membrane'
      };
      const orgId = idMap[clickedBadge.id] || 'mitochondria';
      audioSynth.playAtpChime(1.1);
      onInspectOrganelle(orgId);
      return;
    }

    const px = e.clientX - rect.left - rect.width / 2;
    const py = e.clientY - rect.top - rect.height / 2;

    const hit = physicsEngine.handlePointerDown(px, py);
    if (hit) {
      audioSynth.playMembraneStretch(0.6);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const moveX = e.clientX - rect.left;
    const moveY = e.clientY - rect.top;

    const isHoveringBadge = badgeClickTargetsRef.current.some(b =>
      moveX >= b.x && moveX <= b.x + b.w && moveY >= b.y && moveY <= b.y + b.h
    );
    e.currentTarget.style.cursor = isHoveringBadge ? 'pointer' : 'crosshair';

    const px = e.clientX - rect.left - rect.width / 2;
    const py = e.clientY - rect.top - rect.height / 2;
    physicsEngine.handlePointerMove(px, py);
  };

  const handlePointerUp = () => {
    physicsEngine.handlePointerUp();
  };

  return (
    <div className={`relative w-full h-full overflow-hidden select-none transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#030712]' : 'bg-[#f8fafc]'
    }`}>
      {/* 3D WebGL Three.js Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* 2D Scientific HUD Canvas Overlay */}
      <canvas
        ref={overlayCanvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair"
      />

      {/* Lens Vignette */}
      <div className={`absolute inset-0 pointer-events-none ${
        theme === 'dark' ? 'microscope-overlay' : 'opacity-20'
      }`} />

      {/* Floating Center Indicator: Magnification Scale & Annotation Toggle */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] sm:text-[11px] font-mono shadow-lg backdrop-blur-md ${
          theme === 'dark'
            ? 'bg-slate-950/85 border-cyan-500/30 text-cyan-400'
            : 'bg-white/95 border-cyan-600/40 text-cyan-800'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>{zoomScale.toFixed(0)}× ({zoomScale <= 25 ? 'Macro' : zoomScale <= 280 ? 'Cellular' : 'Nanoscale'})</span>
        </div>

        {/* Toggle Callouts Button */}
        <button
          onClick={() => {
            setShowCallouts(!showCallouts);
            audioSynth.playNucleotideClick('A');
          }}
          title={showCallouts ? 'Hide Organelle Labels' : 'Show Organelle Labels'}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] sm:text-[11px] font-mono font-bold transition-all shadow-md backdrop-blur-md ${
            showCallouts
              ? theme === 'dark'
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
                : 'bg-cyan-100 border-cyan-500 text-cyan-900'
              : theme === 'dark'
              ? 'bg-slate-900/80 border-slate-700 text-slate-400'
              : 'bg-slate-100 border-slate-300 text-slate-600'
          }`}
        >
          <Tag size={11} />
          <span>{showCallouts ? 'Labels ON' : 'Labels OFF'}</span>
        </button>
      </div>
    </div>
  );
};
