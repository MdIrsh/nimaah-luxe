import React from 'react';
import { Check, Clock, PackageCheck, Truck, MapPin, Sparkles, AlertCircle } from 'lucide-react';

export const TrackingStep = ({ step, isLast }) => {
  const { title, description, timestamp, isCompleted, isCurrent } = step;

  // Icons matching step key
  const renderIcon = () => {
    if (isCompleted && !isCurrent) {
      return <Check size={14} className="text-white stroke-[2.5]" />;
    }
    if (isCurrent) {
      return (
        <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059] animate-ping inline-block" />
      );
    }
    return <Clock size={13} className="text-gray-400" />;
  };

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="relative flex items-start space-x-4">
      {/* Vertical Connecting Line */}
      {!isLast && (
        <div
          className={`absolute left-4 top-8 -bottom-3 w-0.5 -ml-px transition-colors duration-500 ${
            isCompleted ? 'bg-emerald-500' : 'bg-[#EAE1D1]'
          }`}
        />
      )}

      {/* Step Indicator Node */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border transition-all duration-300 ${
          isCompleted && !isCurrent
            ? 'bg-emerald-600 border-emerald-600 shadow-sm'
            : isCurrent
            ? 'bg-[#14110C] border-[#C5A059] shadow-md ring-4 ring-[#C5A059]/20'
            : 'bg-[#FAF7F2] border-[#DED4C5]'
        }`}
      >
        {renderIcon()}
      </div>

      {/* Step Content */}
      <div className="flex-1 pb-7 min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-1">
          <h4
            className={`text-xs sm:text-sm font-bold tracking-tight ${
              isCurrent
                ? 'text-[#C5A059] font-serif-luxury text-base'
                : isCompleted
                ? 'text-[#14110C]'
                : 'text-gray-400'
            }`}
          >
            {title}
            {isCurrent && (
              <span className="ml-2 px-2 py-0.5 rounded-md text-[9.5px] uppercase font-bold tracking-widest bg-[#C5A059] text-white">
                Current Stage
              </span>
            )}
          </h4>

          {formattedTime && (
            <span className="text-[10px] text-gray-500 font-medium">
              {formattedTime}
            </span>
          )}
        </div>

        <p
          className={`text-xs mt-0.5 leading-relaxed ${
            isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default TrackingStep;
