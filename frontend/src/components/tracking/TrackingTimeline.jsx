import React from 'react';
import TrackingStep from './TrackingStep';
import { Route } from 'lucide-react';

export const TrackingTimeline = ({ steps, currentStatus }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="bg-white border border-[#E8DEC8] rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
        <div className="flex items-center space-x-2">
          <Route size={18} className="text-[#C5A059]" />
          <h3 className="font-serif-luxury text-base font-bold text-[#14110C]">
            Live Journey Timeline
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          5 Fulfillment Stages
        </span>
      </div>

      {/* Vertical Steps List */}
      <div className="pt-2">
        {steps.map((step, index) => (
          <TrackingStep
            key={step.key || index}
            step={step}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default TrackingTimeline;
