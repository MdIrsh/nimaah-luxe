import React from 'react';
import { ShieldCheck, ChevronRight } from 'lucide-react';

export const AuthenticityBanner = ({ brand = "Brand" }) => {
  return (
    <div className="bg-[#EBF3FE] border border-blue-100 hover:border-blue-200 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between transition cursor-pointer group shadow-2xs">
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#0B192C] flex items-center justify-center text-white flex-shrink-0 shadow-2xs group-hover:scale-105 transition">
          <ShieldCheck size={20} strokeWidth={2.4} />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-[#0B192C] leading-snug">
            100% Authentic Products
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            With Official {brand || 'Brand'} Warranty & Quality Guarantee
          </p>
        </div>
      </div>
      <ChevronRight
        size={18}
        className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition flex-shrink-0 ml-2"
      />
    </div>
  );
};

export default AuthenticityBanner;
