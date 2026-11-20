import React from 'react';

export const ColorSelector = ({
  colors = [],
  selectedColor = '',
  onSelectColor,
}) => {
  if (!Array.isArray(colors) || colors.length === 0) return null;

  // Normalized list of colors
  const normalizedColors = colors.map((col, idx) => {
    if (typeof col === 'string') {
      const lower = col.toLowerCase();
      let hex = '#2563EB'; // fallback blue
      if (lower.includes('blue') || lower.includes('navy')) hex = '#0B192C';
      else if (lower.includes('black') || lower.includes('onyx') || lower.includes('charcoal')) hex = '#18181B';
      else if (lower.includes('white') || lower.includes('pearl') || lower.includes('ivory')) hex = '#F8FAFC';
      else if (lower.includes('green') || lower.includes('emerald')) hex = '#064E3B';
      else if (lower.includes('gold') || lower.includes('champagne')) hex = '#FEF08A';
      else if (lower.includes('red') || lower.includes('ruby') || lower.includes('rose')) hex = '#E11D48';
      return { name: col, hexCode: hex };
    }
    return {
      name: col.name || `Color ${idx + 1}`,
      hexCode: col.hexCode || '#0B192C',
    };
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0B192C] tracking-tight">Select Color</h3>
        {selectedColor && (
          <span className="text-xs text-slate-500 font-medium">
            Selected: <strong className="text-[#0B192C]">{selectedColor}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-5 sm:gap-6 flex-wrap">
        {normalizedColors.map((col, idx) => {
          const isSelected = selectedColor === col.name || (!selectedColor && idx === 0);
          const isLight =
            col.hexCode?.toLowerCase() === '#ffffff' ||
            col.hexCode?.toLowerCase() === '#f8fafc' ||
            col.hexCode?.toLowerCase() === '#faf9f6' ||
            col.hexCode?.toLowerCase() === '#fef08a';

          return (
            <div
              key={idx}
              onClick={() => onSelectColor(col.name)}
              className="flex flex-col items-center gap-2 cursor-pointer group"
            >
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'ring-3 ring-[#2563EB] ring-offset-2 ring-offset-white scale-105 shadow-sm'
                    : 'hover:scale-105 opacity-85 hover:opacity-100'
                }`}
              >
                <span
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-shadow ${
                    isLight ? 'border border-slate-300' : 'border border-black/10'
                  }`}
                  style={{ backgroundColor: col.hexCode }}
                />
              </div>
              <span
                className={`text-xs font-semibold text-center max-w-[80px] truncate transition ${
                  isSelected ? 'text-[#0B192C] font-bold' : 'text-slate-600 group-hover:text-[#0B192C]'
                }`}
              >
                {col.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSelector;
