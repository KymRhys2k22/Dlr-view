import React, { useEffect } from 'react';
import { X, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { CopyImageButton } from './CopyImageButton';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  imageType: string;
  itemInfo?: {
    sku: string;
    description: string;
    reason: string;
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-rose-100 text-rose-600">
              <ImageIcon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900 leading-tight">
                {imageType} Photo
              </h3>
              {itemInfo && (
                <p className="text-xs text-slate-500 truncate max-w-md">
                  SKU: <span className="font-mono font-medium text-slate-700">{itemInfo.sku}</span> · {itemInfo.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CopyImageButton
              url={imageUrl}
              variant="standard"
              onSuccess={(msg) => onToast(msg, 'success')}
              onError={(msg) => onToast(msg, 'error')}
            />
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors"
              title="Open full image in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Original</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="relative flex-1 flex items-center justify-center p-4 bg-slate-900/5 overflow-auto min-h-[300px]">
          <img
            src={imageUrl}
            alt={`${imageType} preview`}
            className="max-h-[68vh] max-w-full object-contain rounded-lg shadow-sm"
          />
        </div>

        {/* Footer info */}
        {itemInfo && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Reason:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                {itemInfo.reason}
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
              {imageUrl}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
