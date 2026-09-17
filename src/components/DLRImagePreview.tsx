import React from 'react';
import { ImageOff, ZoomIn } from 'lucide-react';
import { CopyImageButton } from './CopyImageButton';
import { optimizeImageUrl } from '../utils/imageUrl';

interface DLRImagePreviewProps {
  images: string[];
  sku: string;
  upc?: string;
  description: string;
  reason: string;
  onOpenModal: (
    url: string,
    type: string,
    item?: { sku: string; description: string; reason: string; upc?: string }
  ) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  layout?: 'row' | 'grid';
}

interface ImageSlot {
  index: number;
  label: 'Quantity' | 'Damage' | 'Barcode';
  badgeColor: string;
}

const SLOTS: ImageSlot[] = [
  { index: 0, label: 'Quantity', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { index: 1, label: 'Damage', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
  { index: 2, label: 'Barcode', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
];

export const DLRImagePreview: React.FC<DLRImagePreviewProps> = ({
  images,
  sku,
  upc,
  description,
  reason,
  onOpenModal,
  onToast,
  layout = 'row',
}) => {
  return (
    <div
      className={`flex gap-2.5 ${
        layout === 'grid' ? 'grid grid-cols-3 gap-2 w-full' : 'items-center'
      }`}
    >
      {SLOTS.map(({ index, label, badgeColor }) => {
        const rawUrl = images && images[index] ? images[index] : null;
        const url = rawUrl ? optimizeImageUrl(rawUrl) : null;

        return (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 p-1.5 rounded-2xl border border-black/[0.05] bg-black/[0.02] hover:bg-black/[0.04] transition-all w-24 sm:w-28 shrink-0"
          >
            {/* Thumbnail Box */}
            <div
              onClick={() =>
                url && onOpenModal(url, label, { sku, upc, description, reason })
              }
              className={`relative w-full aspect-square rounded-xl overflow-hidden border border-black/[0.06] bg-white group select-none apple-pressable ${
                url ? 'cursor-pointer shadow-2xs' : 'cursor-default'
              }`}
            >
              {url ? (
                <>
                  <img
                    src={url}
                    alt={`${label} photo`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-5 h-5 text-white drop-shadow-md" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1 bg-black/[0.02]">
                  <ImageOff className="w-4 h-4" />
                  <span className="text-[10px] text-slate-400 font-medium sf-caption">None</span>
                </div>
              )}
            </div>

            {/* Label and Copy Link Button */}
            <div className="flex flex-col items-center gap-1 w-full text-center">
              <span
                className={`text-[10px] font-semibold sf-caption px-2 py-0.5 rounded-full border w-full truncate ${badgeColor}`}
              >
                {label}
              </span>

              {url ? (
                <CopyImageButton
                  url={url}
                  label="Copy Link"
                  variant="compact"
                  onSuccess={(msg) => onToast(msg, 'success')}
                  onError={(msg) => onToast(msg, 'error')}
                />
              ) : (
                <span className="text-[10px] text-slate-400 py-1 select-none sf-caption">No Link</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
