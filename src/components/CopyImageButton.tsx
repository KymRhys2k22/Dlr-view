import React, { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';

interface CopyImageButtonProps {
  url: string;
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
  label?: string;
  variant?: 'compact' | 'standard';
}

export const CopyImageButton: React.FC<CopyImageButtonProps> = ({
  url,
  onSuccess,
  onError,
  label = 'Copy Link',
  variant = 'compact',
}) => {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!url) {
      if (onError) onError('No image URL available');
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for non-https or restricted contexts
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!success) throw new Error('Fallback execCommand copy failed');
      }

      setCopied(true);
      setFailed(false);
      if (onSuccess) onSuccess('Image link copied!');

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy image URL:', err);
      setFailed(true);
      if (onError) onError('Failed to copy image link to clipboard.');
      setTimeout(() => {
        setFailed(false);
      }, 2500);
    }
  };

  if (variant === 'standard') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
          copied
            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
            : failed
            ? 'bg-rose-50 text-rose-700 border-rose-300'
            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs'
        }`}
        title="Copy image link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-50 duration-200" />
            <span>Copied!</span>
          </>
        ) : failed ? (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Failed</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-all border ${
        copied
          ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
          : failed
          ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
          : 'bg-white/95 backdrop-blur-xs text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-white shadow-xs'
      }`}
      title="Copy image URL"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-white" />
          <span>Copied!</span>
        </>
      ) : failed ? (
        <>
          <AlertCircle className="w-3 h-3 text-white" />
          <span>Error</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 text-slate-500" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};
