'use client';

import React from 'react';

export type LogoVariant = 'geopin' | 'hyperplug' | 'ecospark';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LogoTheme = 'light' | 'dark' | 'auto';

export interface LogoProps {
  /**
   * Visual emblem concept:
   * - 'geopin': Map location beacon + high-voltage lightning bolt (recommended default)
   * - 'hyperplug': Aerodynamic interlocking 'E' & 'V' automotive charging monogram
   * - 'ecospark': Rwanda green hills & clean solar-electric energy arc
   */
  variant?: LogoVariant;
  /** Size preset for emblem and typography */
  size?: LogoSize;
  /** Whether to render the location/network pill badge (e.g. 'Kigali') */
  showBadge?: boolean;
  /** Whether to render the 'EVchargers' wordmark */
  showWordmark?: boolean;
  /** Optional custom text for the badge pill */
  badgeText?: string;
  /** Theme contrast for wordmark: light (default for light header) or dark (for dark cards/heroes) */
  theme?: LogoTheme;
  /** Optional container class name */
  className?: string;
}

const sizeConfig: Record<
  LogoSize,
  {
    iconSize: string;
    iconPixels: number;
    titleSize: string;
    badgeSize: string;
    gap: string;
  }
> = {
  xs: {
    iconSize: 'h-6 w-6',
    iconPixels: 24,
    titleSize: 'text-sm',
    badgeSize: 'text-[9px] px-1 py-0.2',
    gap: 'gap-1.5',
  },
  sm: {
    iconSize: 'h-8 w-8',
    iconPixels: 32,
    titleSize: 'text-base',
    badgeSize: 'text-[9px] px-1.5 py-0.5',
    gap: 'gap-2',
  },
  md: {
    iconSize: 'h-9 w-9 sm:h-10 sm:w-10',
    iconPixels: 38,
    titleSize: 'text-lg sm:text-xl',
    badgeSize: 'text-[10px] px-1.5 py-0.5',
    gap: 'gap-2.5',
  },
  lg: {
    iconSize: 'h-12 w-12',
    iconPixels: 48,
    titleSize: 'text-xl sm:text-2xl',
    badgeSize: 'text-[11px] px-2 py-0.5',
    gap: 'gap-3',
  },
  xl: {
    iconSize: 'h-16 w-16',
    iconPixels: 64,
    titleSize: 'text-2xl sm:text-3xl',
    badgeSize: 'text-xs px-2.5 py-1',
    gap: 'gap-3.5',
  },
};

export function Logo({
  variant = 'ecospark',
  size = 'md',
  showBadge = true,
  showWordmark = true,
  badgeText = 'Kigali',
  theme = 'light',
  className = '',
}: LogoProps) {
  const currentSize = sizeConfig[size] || sizeConfig.md;
  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center ${currentSize.gap} select-none ${className}`}>
      {/* SVG Emblem Mark */}
      <div
        className={`${currentSize.iconSize} flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}
        aria-hidden="true"
      >
        {variant === 'geopin' && <GeoPinEmblem />}
        {variant === 'hyperplug' && <HyperPlugEmblem />}
        {variant === 'ecospark' && <EcoSparkEmblem />}
      </div>

      {/* Typography & Brand Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              } ${currentSize.titleSize}`}
            >
              EV<span className="text-emerald-500 font-extrabold">chargers</span>
            </span>

            {/* Region / Network Pill Badge */}
            {showBadge && (
              <span
                className={`inline-flex items-center gap-1 rounded-md font-bold uppercase tracking-wider ${
                  currentSize.badgeSize
                } ${
                  isDark
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {badgeText}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Concept 1: The Geo-Volt Pin (Recommended)
 * Seamlessly integrates an EV map station beacon pin with a high-velocity lightning bolt.
 */
export function GeoPinEmblem({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} drop-shadow-sm`}
    >
      <defs>
        {/* Dynamic Multi-Stop Gradient: Emerald to Electric Cyan */}
        <linearGradient id="ev-geo-bg" x1="4" y1="4" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* High-Luminance Bolt Gradient */}
        <linearGradient id="ev-geo-bolt" x1="20" y1="12" x2="36" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#ECFDF5" />
          <stop offset="100%" stopColor="#A7F3D0" />
        </linearGradient>

        {/* Soft Drop Shadow for Inner Cutouts */}
        <filter id="ev-geo-shadow" x="12" y="8" width="32" height="40" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#047857" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Rounded Squircle Badge Base */}
      <rect x="4" y="4" width="48" height="48" rx="14" fill="url(#ev-geo-bg)" />

      {/* Modern Inner Border Glint */}
      <rect
        x="4.5"
        y="4.5"
        width="47"
        height="47"
        rx="13.5"
        stroke="#FFFFFF"
        strokeOpacity="0.28"
        strokeWidth="1"
      />

      {/* Map Station Pin Silhouette Watermark */}
      <path
        d="M28 10C20.5 10 14.5 16 14.5 23.5C14.5 32 25.5 42.5 27.2 44.1C27.65 44.52 28.35 44.52 28.8 44.1C30.5 42.5 41.5 32 41.5 23.5C41.5 16 35.5 10 28 10Z"
        fill="#FFFFFF"
        fillOpacity="0.16"
      />

      {/* Dynamic EV Lightning Bolt Cutout */}
      <path
        filter="url(#ev-geo-shadow)"
        d="M30 13L18 28H27L24 43L38 26H28.5L30 13Z"
        fill="url(#ev-geo-bolt)"
      />

      {/* Active Charging Pulse Node */}
      <circle cx="28" cy="18" r="2.2" fill="#34D399" />
    </svg>
  );
}

/**
 * Concept 2: HyperPlug Monogram
 * Clean automotive tech styling featuring interlocking 'E' and 'V' shapes with charging prongs.
 */
export function HyperPlugEmblem({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} drop-shadow-sm`}
    >
      <defs>
        <linearGradient id="hp-bg" x1="4" y1="4" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="hp-e" x1="12" y1="12" x2="28" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="hp-v" x1="26" y1="12" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/* Obsidian Container */}
      <rect x="4" y="4" width="48" height="48" rx="14" fill="url(#hp-bg)" />
      <rect x="4.5" y="4.5" width="47" height="47" rx="13.5" stroke="#334155" strokeWidth="1" />

      {/* Stylized 'E' connector bracket */}
      <path
        d="M15 16C15 14.8954 15.8954 14 17 14H28C29.1046 14 30 14.8954 30 16V18C30 19.1046 29.1046 20 28 20H21V25H27C28.1046 25 29 25.8954 29 27V29C29 30.1046 28.1046 31 27 31H21V36H28C29.1046 36 30 36.8954 30 38V40C30 41.1046 29.1046 42 28 42H17C15.8954 42 15 41.1046 15 40V16Z"
        fill="url(#hp-e)"
      />

      {/* Dynamic 'V' lightning wing */}
      <path
        d="M29 14H35L42 34L37 34L35 28L31 42L29 42L33 28H29V24L35 14Z"
        fill="url(#hp-v)"
      />

      {/* Charging Terminal Dots */}
      <circle cx="34" cy="18" r="2.2" fill="#38BDF8" />
      <circle cx="41" cy="18" r="2.2" fill="#10B981" />
    </svg>
  );
}

/**
 * Concept 3: EcoSpark Kigali Arc
 * Tribute to Rwanda's green hills combined with a solar-electric lightning spark.
 */
export function EcoSparkEmblem({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} drop-shadow-sm`}
    >
      <defs>
        {/* Dynamic Rwanda Lush Emerald to Solar Amber Gradient */}
        <linearGradient id="es-bg" x1="4" y1="4" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="55%" stopColor="#059669" />
          <stop offset="85%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* High-Luminance Bolt Gradient */}
        <linearGradient id="es-bolt" x1="20" y1="10" x2="36" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>

        <filter id="es-shadow" x="12" y="8" width="32" height="40" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#064E3B" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Rounded Squircle Container */}
      <rect x="4" y="4" width="48" height="48" rx="14" fill="url(#es-bg)" />

      {/* Subtle Inner Highlight Border */}
      <rect
        x="4.5"
        y="4.5"
        width="47"
        height="47"
        rx="13.5"
        stroke="#FFFFFF"
        strokeOpacity="0.3"
        strokeWidth="1"
      />

      {/* Rolling Hills Arc 1 (Distant Hill) */}
      <path
        d="M6 42C12 34 20 36 28 32C36 28 42 33 50 27V42C50 46.4 46.4 50 42 50H14C9.6 50 6 46.4 6 42Z"
        fill="#022C22"
        fillOpacity="0.35"
      />

      {/* Rolling Hills Arc 2 (Near Hill) */}
      <path
        d="M6 44C14 38 22 41 32 37C40 33 46 38 50 35V42C50 46.4 46.4 50 42 50H14C9.6 50 6 46.4 6 42V44Z"
        fill="#064E3B"
        fillOpacity="0.5"
      />

      {/* Solar/Beacon Corona Glow */}
      <circle cx="37" cy="15" r="5" fill="#FBBF24" fillOpacity="0.25" />
      {/* Solar Accent Beacon Node */}
      <circle cx="37" cy="15" r="2.8" fill="#FDE047" stroke="#F59E0B" strokeWidth="0.8" />

      {/* Dynamic Lightning Bolt */}
      <path
        filter="url(#es-shadow)"
        d="M30 11L18 27H27L23 43L39 25H29.5L33 11H30Z"
        fill="url(#es-bolt)"
      />
    </svg>
  );
}

export default Logo;
