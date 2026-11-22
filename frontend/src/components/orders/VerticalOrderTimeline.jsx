import React from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

export const WORKFLOW_STAGES = [
  {
    step: 1,
    key: 'Order Placed',
    label: 'Order Placed',
    description: 'Bespoke acquisition verified and logged in sanctuary ledger.',
    icon: ShoppingBag,
  },
  {
    step: 2,
    key: 'Admin Received',
    label: 'Admin Received',
    description: 'Atelier master confirmed order. Materials and artisan allocated.',
    icon: ShieldCheck,
  },
  {
    step: 3,
    key: 'Processing & Tailoring',
    label: 'Processing & Tailoring',
    description: 'Master craftsmen tailoring silhouette with royal bespoke finishing.',
    icon: Sparkles,
  },
  {
    step: 4,
    key: 'Shipped',
    label: 'Shipped',
    description: 'Dispatched via insured luxury courier with real-time tracking.',
    icon: Truck,
  },
  {
    step: 5,
    key: 'Delivered',
    label: 'Delivered',
    description: 'White-glove arrival completed. Bespoke wardrobe received by patron.',
    icon: CheckCircle2,
  },
];

export const getStageIndex = (status) => {
  if (!status) return 1;
  const normalized = String(status).trim().toLowerCase();
  if (normalized.includes('placed')) return 1;
  if (normalized.includes('admin') || normalized.includes('received') || normalized.includes('confirmed')) return 2;
  if (normalized.includes('tailor') || normalized.includes('process') || normalized.includes('packed')) return 3;
  if (normalized.includes('ship') || normalized.includes('transit') || normalized.includes('way')) return 4;
  if (normalized.includes('deliver')) return 5;
  if (normalized.includes('cancel')) return 0;
  return 1;
};

export const VerticalOrderTimeline = ({
  order = {},
  compact = false,
}) => {
  const [copied, setCopied] = React.useState(false);
  const currentStatus = order.orderStatus || 'Order Placed';
  const currentIndex = getStageIndex(currentStatus);
  const isCancelled = String(currentStatus).toLowerCase().includes('cancel');

  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
  const paidAt = order.paidAt ? new Date(order.paidAt) : createdAt;
  const updatedAt = order.updatedAt ? new Date(order.updatedAt) : createdAt;
  const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt) : null;

  const trackingNumber =
    order.trackingNumber ||
    (currentIndex >= 4 ? `BD-LUXE-${order._id ? order._id.toString().slice(-8).toUpperCase() : '89241024'}` : '');
  const courierPartner = order.courierPartner || 'BlueDart Luxury Express';

  const copyTracking = () => {
    if (!trackingNumber) return;
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Milestone timestamp resolver
  const getStageTimestamp = (stepNumber) => {
    if (stepNumber === 1) {
      return createdAt.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (stepNumber === 2 && currentIndex >= 2) {
      const d = new Date(paidAt.getTime() + 15 * 60 * 1000);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (stepNumber === 3 && currentIndex >= 3) {
      const d = new Date(paidAt.getTime() + 18 * 60 * 60 * 1000);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (stepNumber === 4 && currentIndex >= 4) {
      return updatedAt.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (stepNumber === 5 && currentIndex >= 5) {
      return deliveredAt
        ? deliveredAt.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        : updatedAt.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });
    }
    return null;
  };

  if (isCancelled) {
    return (
      <div className="p-4 sm:p-5 bg-red-50/70 border border-red-200 rounded-xl text-red-900 flex items-start gap-3">
        <Clock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-serif-luxury font-bold text-sm sm:text-base text-red-950">
            Order Cancelled
          </h4>
          <p className="text-xs text-red-800 mt-0.5">
            This bespoke silhouette order has been cancelled and any applied payments are being refunded to source.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${compact ? 'space-y-4' : 'space-y-6'}`}>
      {/* Timeline Header Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E9E1D6]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
          <span className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#29251F]">
            Fulfillment Journey (5 Stages)
          </span>
        </div>
        <span className="text-[11px] font-medium text-[#A68B66] bg-[#FAF9F6] border border-[#E9E1D6] px-2.5 py-0.5 rounded-full">
          Stage {currentIndex} of 5 Active
        </span>
      </div>

      {/* Modern Vertical Timeline */}
      <div className="relative pl-1 sm:pl-2">
        {WORKFLOW_STAGES.map((stage, idx) => {
          const isCompleted = currentIndex > stage.step;
          const isCurrent = currentIndex === stage.step;
          const isPending = currentIndex < stage.step;
          const isLast = idx === WORKFLOW_STAGES.length - 1;
          const timestamp = getStageTimestamp(stage.step);
          const Icon = stage.icon;

          return (
            <div key={stage.step} className="relative flex items-start gap-3.5 sm:gap-5 pb-6 last:pb-1 group">
              {/* Connecting Vertical Bar */}
              {!isLast && (
                <div
                  className={`absolute left-[17px] sm:left-[19px] top-9 -bottom-2 w-[2px] transition-colors duration-500 ${
                    currentIndex > stage.step
                      ? 'bg-gradient-to-b from-[#C5A059] to-[#A68B66]'
                      : isCurrent
                      ? 'bg-gradient-to-b from-[#C5A059] to-[#E9E1D6]'
                      : 'bg-[#E9E1D6]'
                  }`}
                />
              )}

              {/* Node Indicator */}
              <div
                className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#14110C] border-[#C5A059] text-[#C5A059] shadow-sm'
                    : isCurrent
                    ? 'bg-[#C5A059] border-white text-[#14110C] shadow-md ring-4 ring-[#C5A059]/30'
                    : 'bg-[#FAF9F6] border-[#E9E1D6] text-gray-300'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={18} className="text-[#C5A059] stroke-[2.5]" />
                ) : (
                  <Icon size={17} className={isCurrent ? 'text-[#14110C] stroke-[2.2]' : 'text-gray-400'} />
                )}

                {/* Pulsing beacon on current step */}
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-ping" />
                )}
              </div>

              {/* Step Details & Description */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5
                      className={`text-sm sm:text-base font-serif-luxury font-bold tracking-tight ${
                        isCurrent
                          ? 'text-[#C5A059]'
                          : isCompleted
                          ? 'text-[#14110C]'
                          : 'text-gray-400 font-normal'
                      }`}
                    >
                      {stage.label}
                    </h5>

                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#C5A059] text-[#14110C] shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#14110C] animate-pulse" />
                        Active Stage
                      </span>
                    )}

                    {isCompleted && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>

                  {timestamp && (
                    <span className="text-[11px] text-gray-500 font-mono">
                      {timestamp}
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    isCurrent ? 'text-[#29251F] font-medium' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {stage.description}
                </p>

                {/* Special Extra Info for "Shipped" stage */}
                {stage.step === 4 && (isCurrent || isCompleted) && (
                  <div className="mt-3 p-3 sm:p-3.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#29251F] text-[#C5A059] flex items-center justify-center shrink-0">
                        <Truck size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 block">
                          Insured Courier Waybill
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-xs text-[#29251F] truncate">
                            {courierPartner}
                          </span>
                          {trackingNumber && (
                            <code className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 border border-[#E9E1D6] rounded text-[#A68B66]">
                              {trackingNumber}
                            </code>
                          )}
                        </div>
                      </div>
                    </div>

                    {trackingNumber && (
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={copyTracking}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#FAF9F6] border border-[#E9E1D6] text-[11px] font-medium text-[#29251F] rounded-lg transition"
                          title="Copy tracking number"
                        >
                          {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{copied ? 'Copied' : 'Copy AWB'}</span>
                        </button>
                        <a
                          href={`https://www.bluedart.com/tracking?numbers=${trackingNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#29251F] hover:bg-[#C5A059] text-white text-[11px] font-semibold rounded-lg transition"
                        >
                          <span>Live Portal</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Special Extra Info for "Delivered" stage */}
                {stage.step === 5 && isCompleted && (
                  <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                    <span className="font-medium">
                      ✓ Package safely received at delivery address with white-glove verification.
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VerticalOrderTimeline;
