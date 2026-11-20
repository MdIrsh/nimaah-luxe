import React from 'react';
import { Volume2, BatteryCharging, Feather, Sparkles, Crown, Shield } from 'lucide-react';

export const ProductHighlights = ({ category = '', customHighlights = null }) => {
  // If custom highlights provided in product document
  if (Array.isArray(customHighlights) && customHighlights.length >= 3) {
    return (
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {customHighlights.slice(0, 3).map((item, idx) => (
          <div
            key={idx}
            className="bg-[#F1F6FD] border border-blue-100/70 rounded-2xl p-3 sm:p-4 text-center flex flex-col items-center justify-center gap-1.5 transition hover:bg-blue-50/80 shadow-2xs"
          >
            <Sparkles size={18} className="text-[#0B192C]" />
            <span className="text-[11px] sm:text-xs font-bold text-[#0B192C] leading-snug">
              {item.label || item}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const isAudioTech =
    category?.toLowerCase().includes('audio') ||
    category?.toLowerCase().includes('earbud') ||
    category?.toLowerCase().includes('electronic');

  // Match the exact Noise earbuds highlight spec or adapt to luxury fashion
  const highlights = isAudioTech
    ? [
        {
          icon: Volume2,
          title: 'Powerful Bass',
          subtitle: '10mm Neodymium',
        },
        {
          icon: BatteryCharging,
          title: 'Up to 50h Playtime',
          subtitle: 'Instacharge™ Fast',
        },
        {
          icon: Feather,
          title: 'Lightweight Design',
          subtitle: 'Ergonomic Snug Fit',
        },
      ]
    : [
        {
          icon: Sparkles,
          title: 'Pure Mulberry Silk',
          subtitle: 'Hand-dyed Luster',
        },
        {
          icon: Crown,
          title: 'Artisanal Zari Weave',
          subtitle: 'Bespoke Needlework',
        },
        {
          icon: Feather,
          title: 'Featherweight Drape',
          subtitle: 'All-Day Flawless Poise',
        },
      ];

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {highlights.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-[#F1F6FD] border border-blue-100/70 rounded-2xl p-3 sm:p-4 text-center flex flex-col items-center justify-center gap-1.5 transition hover:bg-blue-50/80 shadow-2xs"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-2xs text-[#0B192C]">
              <Icon size={16} strokeWidth={2.2} />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#0B192C] leading-tight">
              {item.title}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium hidden sm:block">
              {item.subtitle}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ProductHighlights;
