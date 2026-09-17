import React, { useEffect } from 'react';
import { X, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { CopyImageButton } from './CopyImageButton';
import { CopyUPCButton } from './CopyUPCButton';
import { optimizeImageUrl, getOriginalImageUrl } from '../utils/imageUrl';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  imageType: string;
  itemInfo?: {
    sku: string;
    description: string;
    reason: string;
    upc?: string;
  };
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageType,
  itemInfo,
  onToast,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const displayUrl = optimizeImageUrl(imageUrl);
  const originalUrl = getOriginalImageUrl(imageUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col max-w-4xl w-full max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-black/[0.08] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.05] bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <ImageIcon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-[#1D1D1F] leading-tight sf-headline">
                {imageType} Photo
              </h3>
              {itemInfo && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate max-w-md flex-wrap mt-0.5 sf-subheadline">
                  <span className="font-mono font-medium text-slate-700">SKU: {itemInfo.sku}</span>
                  {itemInfo.upc && (
                    <CopyUPCButton
                      upc={itemInfo.upc}
                      onToast={onToast}
                      className="text-[10px] py-0 px-2"
                    />
                  )}
                  <span className="text-slate-400 truncate">· {itemInfo.description}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CopyImageButton
              url={displayUrl}
              variant="standard"
              onSuccess={(msg) => onToast(msg, 'success')}
              onError={(msg) => onToast(msg, 'error')}
            />
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-slate-700 border border-black/[0.06] transition-all apple-pressable sf-subheadline"
              title="Open full uncompressed image in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Original</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[#1D1D1F] rounded-full bg-black/[0.04] hover:bg-black/[0.08] transition-colors ml-1 apple-pressable cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="relative flex-1 flex items-center justify-center p-4 bg-black/[0.02] overflow-auto min-h-[300px]">
          <img
            src={displayUrl}
            alt={`${imageType} preview`}
            className="max-h-[68vh] max-w-full object-contain rounded-2xl shadow-sm"
          />
        </div>

        {/* Footer info */}
        {itemInfo && (
          <div className="px-6 py-3 border-t border-black/[0.05] bg-black/[0.02] flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 sf-subheadline">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Reason:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20 font-semibold sf-caption">
                {itemInfo.reason}
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
              {displayUrl}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
