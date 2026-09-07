import React, { useState } from 'react';
import { Copy, Check, Barcode } from 'lucide-react';

interface CopyUPCButtonProps {
  upc: string | null | undefined;
  prefix?: string;
  className?: string;
  onToast?: (msg: string) => void;
  showIcon?: boolean;
}

export const CopyUPCButton: React.FC<CopyUPCButtonProps> = ({
  upc,
  prefix = 'UPC: ',
  className = '',
  onToast,
  showIcon = true,
}) => {
  const [copied, setCopied] = useState(false);

  const cleanUpc = upc ? String(upc).trim() : '';

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!cleanUpc || cleanUpc === 'N/A') return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(cleanUpc);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = cleanUpc;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      if (onToast) {
        onToast(`UPC ${cleanUpc} copied to clipboard!`);
      }
      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to copy UPC:', err);
    }
  };

  if (!cleanUpc || cleanUpc === 'N/A') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono text-[11px] text-slate-400 ${className}`}>
        {prefix}N/A
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied to clipboard!' : `Click to copy UPC: ${cleanUpc}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-xs font-medium transition-all duration-150 cursor-pointer select-none group border ${
        copied
          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400/40'
          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border-slate-200 hover:border-slate-300'
      } ${className}`}
    >
      {showIcon && !copied && (
        <Barcode className="w-3 h-3 text-slate-400 group-hover:text-slate-600 shrink-0" />
      )}
      <span className="truncate">
        {prefix}
        {cleanUpc}
      </span>
      {copied ? (
        <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5] animate-in zoom-in-50 duration-150" />
      ) : (
        <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-700 shrink-0 transition-colors" />
      )}
    </button>
  );
};
