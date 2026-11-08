/**
 * Bio3DIcons.tsx
 * Ultra-High-Definition 3D Bioluminescent Biological Icon System:
 * Scientifically authentic 3D isometric designs with volumetric gradients,
 * Fresnel rim-lighting, normal depth, and biological accuracy.
 */

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

/**
 * 3D D-Glucose Molecule (Hexose Pyranose Ring in Chair Conformation)
 */
export const Glucose3DIcon: React.FC<IconProps> = ({ size = 32, className = '', glow = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter ${glow ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : ''} ${className}`}
  >
    <defs>
      <linearGradient id="glucGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
      <radialGradient id="carbonSphere" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#7dd3fc" />
        <stop offset="60%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#082f49" />
      </radialGradient>
      <radialGradient id="oxygenSphere" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="60%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </radialGradient>
      <radialGradient id="goldEnergy" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="70%" stopColor="#ca8a04" />
        <stop offset="100%" stopColor="#713f12" />
      </radialGradient>
    </defs>
    {/* 3D Hexose Ring Bonds */}
    <path
      d="M20 22 L38 16 L48 28 L40 46 L22 48 L14 34 Z"
      stroke="url(#glucGrad1)"
      strokeWidth="4"
      strokeLinejoin="round"
      fill="rgba(6, 182, 212, 0.12)"
    />
    {/* Oxygen Ring Heteroatom */}
    <circle cx="38" cy="16" r="6" fill="url(#oxygenSphere)" />
    {/* Carbon Spheres */}
    <circle cx="20" cy="22" r="5.5" fill="url(#carbonSphere)" />
    <circle cx="48" cy="28" r="5.5" fill="url(#carbonSphere)" />
    <circle cx="40" cy="46" r="5.5" fill="url(#carbonSphere)" />
    <circle cx="22" cy="48" r="5.5" fill="url(#carbonSphere)" />
    <circle cx="14" cy="34" r="5.5" fill="url(#carbonSphere)" />
    {/* Hydroxyl & CH2OH groups */}
    <line x1="20" y1="22" x2="16" y2="12" stroke="#38bdf8" strokeWidth="2.5" />
    <circle cx="15" cy="10" r="4.2" fill="url(#goldEnergy)" />
    <line x1="48" y1="28" x2="56" y2="30" stroke="#f87171" strokeWidth="2.5" />
    <circle cx="58" cy="31" r="3.5" fill="url(#oxygenSphere)" />
  </svg>
);

/**
 * 3D Diatomic Oxygen (O=O Molecular Orbital Dumbbell)
 */
export const Oxygen3DIcon: React.FC<IconProps> = ({ size = 32, className = '', glow = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter ${glow ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''} ${className}`}
  >
    <defs>
      <radialGradient id="oxySphere1" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#bae6fd" />
        <stop offset="40%" stopColor="#38bdf8" />
        <stop offset="85%" stopColor="#0369a1" />
        <stop offset="100%" stopColor="#082f49" />
      </radialGradient>
      <radialGradient id="oxySphere2" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#bae6fd" />
        <stop offset="40%" stopColor="#0284c7" />
        <stop offset="85%" stopColor="#075985" />
        <stop offset="100%" stopColor="#082f49" />
      </radialGradient>
    </defs>
    {/* Pi Double Bond Glow */}
    <line x1="20" y1="28" x2="44" y2="28" stroke="#38bdf8" strokeWidth="4.5" strokeLinecap="round" opacity="0.8" />
    <line x1="20" y1="36" x2="44" y2="36" stroke="#38bdf8" strokeWidth="4.5" strokeLinecap="round" opacity="0.8" />
    {/* Diatomic 3D Spheres */}
    <circle cx="20" cy="32" r="14" fill="url(#oxySphere1)" />
    <circle cx="44" cy="32" r="14" fill="url(#oxySphere2)" />
    {/* Specular Highlights */}
    <ellipse cx="16" cy="27" rx="3.5" ry="2" fill="#ffffff" opacity="0.75" />
    <ellipse cx="40" cy="27" rx="3.5" ry="2" fill="#ffffff" opacity="0.75" />
  </svg>
);

/**
 * 3D Biohazard Toxin / Acid Vial
 */
export const Toxin3DIcon: React.FC<IconProps> = ({ size = 32, className = '', glow = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter ${glow ? 'drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]' : ''} ${className}`}
  >
    <defs>
      <linearGradient id="vialGlass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fda4af" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#e11d48" stopOpacity="0.8" />
      </linearGradient>
      <radialGradient id="toxicSludge" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fb7185" />
        <stop offset="60%" stopColor="#e11d48" />
        <stop offset="100%" stopColor="#4c0519" />
      </radialGradient>
    </defs>
    {/* Glass Bottle Cylinder */}
    <path
      d="M26 12 L38 12 L38 20 L46 32 L46 50 C46 54 42 56 38 56 L26 56 C22 56 18 54 18 50 L18 32 L26 20 Z"
      fill="url(#vialGlass)"
      stroke="#f43f5e"
      strokeWidth="2.5"
    />
    {/* Toxic Liquid Pool */}
    <path
      d="M20 40 C24 38 40 42 44 40 L44 50 C44 53 40 54 38 54 L26 54 C24 54 20 53 20 50 Z"
      fill="url(#toxicSludge)"
    />
    {/* Cork Cap */}
    <rect x="25" y="8" width="14" height="5" rx="1.5" fill="#a16207" stroke="#713f12" strokeWidth="1" />
    {/* Toxic Bubbles */}
    <circle cx="32" cy="45" r="2.5" fill="#fecdd3" opacity="0.8" />
    <circle cx="27" cy="48" r="1.5" fill="#fecdd3" opacity="0.6" />
    {/* Hazard cross */}
    <path d="M30 31 L34 35 M34 31 L30 35" stroke="#fecdd3" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * 3D Antibiotic Syringe / Capsule
 */
export const Antibiotic3DIcon: React.FC<IconProps> = ({ size = 32, className = '', glow = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter ${glow ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]' : ''} ${className}`}
  >
    <defs>
      <linearGradient id="capGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#7e22ce" />
      </linearGradient>
      <linearGradient id="capGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
    </defs>
    {/* 3D Angled Pharmaceutical Capsule */}
    <g transform="rotate(-35 32 32)">
      {/* Left Half (Magenta/Purple) */}
      <path
        d="M18 24 C18 17 24 17 28 17 L32 17 L32 47 L28 47 C24 47 18 47 18 40 Z"
        fill="url(#capGradLeft)"
        stroke="#e9d5ff"
        strokeWidth="1.5"
      />
      {/* Right Half (Cyan) */}
      <path
        d="M32 17 L36 17 C40 17 46 17 46 24 L46 40 C46 47 40 47 36 47 L32 47 Z"
        fill="url(#capGradRight)"
        stroke="#bae6fd"
        strokeWidth="1.5"
      />
      {/* Center Band */}
      <line x1="32" y1="17" x2="32" y2="47" stroke="#ffffff" strokeWidth="2.5" />
      {/* Specular Highlight */}
      <rect x="22" y="21" width="20" height="4" rx="2" fill="#ffffff" opacity="0.4" />
    </g>
  </svg>
);

/**
 * 3D Bacteriophage / Pathogen Virion
 */
export const Virus3DIcon: React.FC<IconProps> = ({ size = 32, className = '', glow = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter ${glow ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]' : ''} ${className}`}
  >
    <defs>
      <radialGradient id="phageHead" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="65%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#450a0a" />
      </radialGradient>
      <linearGradient id="phageSheath" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    {/* Icosahedral Head */}
    <polygon
      points="32,8 46,16 46,30 32,38 18,30 18,16"
      fill="url(#phageHead)"
      stroke="#fca5a5"
      strokeWidth="2"
    />
    <line x1="32" y1="8" x2="32" y2="38" stroke="#fca5a5" strokeWidth="1" opacity="0.5" />
    <line x1="18" y1="16" x2="46" y2="30" stroke="#fca5a5" strokeWidth="1" opacity="0.5" />
    <line x1="18" y1="30" x2="46" y2="16" stroke="#fca5a5" strokeWidth="1" opacity="0.5" />

    {/* Contractile Sheath (Neck/Tail) */}
    <rect x="29" y="38" width="6" height="12" fill="url(#phageSheath)" stroke="#334155" strokeWidth="1" />

    {/* Tail Fibers (Legs) */}
    <path d="M29 50 L16 58 M32 50 L32 60 M35 50 L48 58" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/**
 * 3D CRISPR-Cas9 Molecular Scalpel
 */
export const Crispr3DIcon: React.FC<IconProps> = ({ size = 32, className = '', glow = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter ${glow ? 'drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]' : ''} ${className}`}
  >
    <defs>
      <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#854d0e" />
      </linearGradient>
      <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>
    {/* Angled Scalpel Blade */}
    <g transform="rotate(45 32 32)">
      {/* Precision Blade */}
      <path
        d="M30 6 L34 6 L34 24 L27 24 Z"
        fill="url(#bladeGrad)"
        stroke="#ffffff"
        strokeWidth="1.5"
      />
      {/* Guide-RNA Glow Channel */}
      <line x1="32" y1="8" x2="32" y2="22" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
      {/* Surgical Handle */}
      <rect x="28" y="24" width="8" height="34" rx="2" fill="url(#handleGrad)" stroke="#475569" strokeWidth="1.5" />
      {/* Grip Ribs */}
      <line x1="29" y1="32" x2="35" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="29" y1="38" x2="35" y2="38" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="29" y1="44" x2="35" y2="44" stroke="#94a3b8" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * 3D ATP Molecule (High Energy Phosphate Bond)
 */
export const Atp3DIcon: React.FC<IconProps> = ({ size = 32, className = '', glow = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter ${glow ? 'drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : ''} ${className}`}
  >
    <defs>
      <radialGradient id="atpGold" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#713f12" />
      </radialGradient>
      <radialGradient id="riboseBlue" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="70%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#082f49" />
      </radialGradient>
    </defs>
    {/* Adenine + Ribose Base */}
    <rect x="8" y="26" width="16" height="14" rx="3" fill="url(#riboseBlue)" stroke="#7dd3fc" strokeWidth="1.5" />
    {/* High-Energy Triphosphate Bonds (3 Golden Spheres linked by springs) */}
    <line x1="24" y1="33" x2="33" y2="33" stroke="#facc15" strokeWidth="3" />
    <circle cx="33" cy="33" r="6" fill="url(#atpGold)" stroke="#fef08a" strokeWidth="1" />

    <line x1="39" y1="33" x2="46" y2="33" stroke="#facc15" strokeWidth="3" />
    <circle cx="46" cy="33" r="6.5" fill="url(#atpGold)" stroke="#fef08a" strokeWidth="1" />

    <line x1="52.5" y1="33" x2="57" y2="33" stroke="#facc15" strokeWidth="3" strokeDasharray="2 1" />
    <circle cx="57" cy="33" r="7" fill="url(#atpGold)" stroke="#ffffff" strokeWidth="1.5" />

    {/* High energy spark */}
    <path d="M57 18 L55 23 L60 22 L56 28" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * 3D DNA Double Helix
 */
export const Dna3DIcon: React.FC<IconProps> = ({ size = 32, className = '', glow = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter ${glow ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : ''} ${className}`}
  >
    <defs>
      <linearGradient id="dnaStrand1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <linearGradient id="dnaStrand2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    {/* Base Pair Rungs */}
    <line x1="20" y1="14" x2="44" y2="14" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
    <line x1="24" y1="24" x2="40" y2="24" stroke="#84cc16" strokeWidth="3" strokeLinecap="round" />
    <line x1="30" y1="32" x2="34" y2="32" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
    <line x1="24" y1="40" x2="40" y2="40" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
    <line x1="20" y1="50" x2="44" y2="50" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />

    {/* Strand 1 Sine Wave */}
    <path
      d="M20 10 C36 18 36 28 20 36 C8 44 8 54 24 60"
      stroke="url(#dnaStrand1)"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    {/* Strand 2 Antiparallel Wave */}
    <path
      d="M44 10 C28 18 28 28 44 36 C56 44 56 54 40 60"
      stroke="url(#dnaStrand2)"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);
