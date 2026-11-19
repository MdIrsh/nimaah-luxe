import React, { useState } from 'react';
import { Truck, Copy, Check, ExternalLink, RefreshCw, Radio } from 'lucide-react';

export const ParcelTrackingCard = ({ trackingData, onRefresh, isRefreshing }) => {
  const [copied, setCopied] = useState(false);

  if (!trackingData) return null;

  const copyToClipboard = () => {
    if (!trackingData.trackingNumber) return;
    navigator.clipboard.writeText(trackingData.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedLastUpdated = trackingData.lastUpdated
    ? new Date(trackingData.lastUpdated).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent';

  // Construct courier URL fallback
  const courierUrl =
    trackingData.trackingUrl ||
    (trackingData.trackingNumber
      ? `https://www.bluedart.com/tracking?numbers=${trackingData.trackingNumber}`
      : 'https://www.bluedart.com/tracking');

  return (
    <div className="bg-white border border-[#E8DEC8] rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
        <div className="flex items-center space-x-2">
          <Truck size={18} className="text-[#C5A059]" />
          <h3 className="font-serif-luxury text-base font-bold text-[#14110C]">
            Parcel Dispatch & Logistics
          </h3>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-xs text-gray-500 hover:text-[#C5A059] flex items-center space-x-1 transition font-medium disabled:opacity-50"
            title="Refresh Tracking Scans"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-[#C5A059]' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        )}
      </div>

      {/* Courier & AWB Display */}
      <div className="p-4 bg-gradient-to-r from-[#FAF7F2] to-[#FFFDF9] border border-[#EAE1D1] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059]">
              {trackingData.courierPartner || 'BlueDart Luxury Express'}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 mr-2">Waybill / AWB:</span>
            <code className="font-mono text-sm font-bold text-[#14110C]">
              {trackingData.trackingNumber || 'Waybill Generation in Progress'}
            </code>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {trackingData.trackingNumber && (
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 rounded-lg border border-[#E8DEC8] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-gray-700 transition flex items-center space-x-1"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}

          <a
            href={courierUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#14110C] hover:bg-[#C5A059] text-white text-xs font-semibold transition shadow-xs"
          >
            <span>Track on Courier Site</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Latest Shipment Update */}
      <div className="p-4 rounded-xl border border-[#F0E6D8] bg-[#FAF7F2] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[10.5px] uppercase font-bold tracking-wider text-gray-500">
            <Radio size={12} className="text-[#C5A059]" />
            <span>Latest Shipment Scan</span>
          </div>
          <span className="text-[10px] text-gray-400">
            Updated: {formattedLastUpdated}
          </span>
        </div>

        <p className="text-xs text-[#14110C] font-medium leading-relaxed">
          {trackingData.latestScan || 'Order assigned to BlueDart express courier network.'}
        </p>
      </div>
    </div>
  );
};

export default ParcelTrackingCard;
