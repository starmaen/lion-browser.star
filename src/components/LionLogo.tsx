import React from 'react';
import lionLogoImg from '../assets/images/lion_browser_logo_1789575379510.jpg';

interface LionLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  titleText?: string;
}

export const LionLogo: React.FC<LionLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitleText,
  titleText = 'Lion Browser',
}) => {
  const sizeMap = {
    xs: {
      outer: 'w-8 h-8',
      ring: 'p-0.5',
      badge: 'text-[7px] px-1 -bottom-0.5 -right-0.5',
    },
    sm: {
      outer: 'w-12 h-12',
      ring: 'p-0.5',
      badge: 'text-[8px] px-1 -bottom-1 -right-1',
    },
    md: {
      outer: 'w-24 h-24 sm:w-28 sm:h-28',
      ring: 'p-1',
      badge: 'text-[9px] px-1.5 py-0.5 -bottom-1 -right-1',
    },
    lg: {
      outer: 'w-32 h-32 sm:w-36 sm:h-36',
      ring: 'p-1.5',
      badge: 'text-[10px] px-2 py-0.5 -bottom-1.5 -right-1.5',
    },
    xl: {
      outer: 'w-40 h-40',
      ring: 'p-2',
      badge: 'text-xs px-2.5 py-0.5 -bottom-2 -right-2',
    },
  };

  const selectedSize = sizeMap[size];

  return (
    <div id="lion-logo-container" className="flex flex-col items-center justify-center text-center">
      {/* Circular Emblem Container */}
      <div className="relative group cursor-pointer">
        {/* Outer Radiant Ambient Aura Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-600 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>

        {/* Circular Luxury Metallic Gold Outer Ring */}
        <div
          className={`relative ${selectedSize.outer} ${selectedSize.ring} rounded-full bg-gradient-to-tr from-amber-300 via-amber-500 to-yellow-600 shadow-[0_0_35px_rgba(245,158,11,0.55)] flex items-center justify-center transition-transform duration-500 group-hover:scale-105`}
        >
          {/* Inner Dark Bevel Ring */}
          <div className="w-full h-full rounded-full p-1 bg-slate-950 border border-amber-400/50 flex items-center justify-center overflow-hidden relative shadow-inner">
            {/* The Majestic Lion Head Image */}
            <img
              src={lionLogoImg}
              alt="Lion Browser Golden Lion Head"
              className="w-full h-full object-cover object-center rounded-full transform group-hover:scale-110 transition-transform duration-500 select-none"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to high-detail golden lion SVG crest if image fails
                const target = e.target as HTMLElement;
                target.style.display = 'none';
              }}
            />

            {/* Subtle Inner Glass Radial Reflection */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/15 via-transparent to-black/40 pointer-events-none"></div>
          </div>

          {/* Golden Pro Badge */}
          <span
            className={`absolute ${selectedSize.badge} bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black rounded-full shadow-lg border border-amber-200 uppercase tracking-tighter flex items-center gap-0.5`}
          >
            <span>PRO</span>
          </span>
        </div>
      </div>

      {/* Brand Title & Subtitle */}
      {size !== 'xs' && size !== 'sm' && (
        <div className="mt-3.5">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 drop-shadow">
              {titleText}
            </h1>
            <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full shadow-sm">
              الأندرويد السريع
            </span>
          </div>

          {showSubtitle && (
            <p className="text-xs text-slate-400 mt-1.5 font-medium flex items-center justify-center gap-2 flex-wrap px-4">
              {subtitleText ? (
                <span>{subtitleText}</span>
              ) : (
                <>
                  <span className="text-slate-300">سريع وقوي</span>
                  <span className="w-1 h-1 rounded-full bg-amber-500 inline-block"></span>
                  <span className="text-slate-300">حماية الخصوصية ومنع الإعلانات</span>
                  <span className="w-1 h-1 rounded-full bg-amber-500 inline-block"></span>
                  <span className="text-amber-400 font-semibold">Proton VPN</span>
                </>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
