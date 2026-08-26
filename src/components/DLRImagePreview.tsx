import React from 'react';
import { ImageOff, ZoomIn } from 'lucide-react';
import { CopyImageButton } from './CopyImageButton';

interface DLRImagePreviewProps {
  images: string[];
  sku: string;
  description: string;
  reason: string;
  onOpenModal: (
    url: string,
    type: string,
    item?: { sku: string; description: string; reason: string }
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
        const url = images && images[index] ? images[index] : null;

        return (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 p-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 transition-colors w-24 sm:w-28 shrink-0"
          >
            {/* Thumbnail Box */}
            <div
              onClick={() =>
                url && onOpenModal(url, label, { sku, description, reason })
              }
              className={`relative w-full aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white group select-none ${
                url ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {url ? (
                <>
                  <img
                    src={url}
                    alt={`${label} photo`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-5 h-5 text-white drop-shadow-md" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1 bg-slate-50">
                  <ImageOff className="w-5 h-5" />
                  <span className="text-[10px] text-slate-400 font-medium">None</span>
                </div>
              )}
            </div>

            {/* Label and Copy Link Button */}
            <div className="flex flex-col items-center gap-1 w-full text-center">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border w-full truncate ${badgeColor}`}
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
                <span className="text-[10px] text-slate-400 py-1 select-none">No Link</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
