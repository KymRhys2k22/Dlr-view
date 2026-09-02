import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopySKUButtonProps {
  sku: string;
  prefix?: string;
  className?: string;
  onToast?: (msg: string) => void;
}

export const CopySKUButton: React.FC<CopySKUButtonProps> = ({
  sku,
  prefix = '',
  className = '',
  onToast,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!sku || sku === 'N/A') return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(sku);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = sku;
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
        onToast(`SKU ${sku} copied to clipboard!`);
      }
      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to copy SKU:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied to clipboard!' : `Click to copy SKU: ${sku}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-xs font-bold transition-all duration-150 cursor-pointer select-none group border ${
        copied
          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400/40'
          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-900 border-slate-200 hover:border-slate-300'
      } ${className}`}
    >
      <span>
        {prefix}
        {sku || 'N/A'}
      </span>
      {copied ? (
        <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5] animate-in zoom-in-50 duration-150" />
      ) : (
        <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-700 shrink-0 transition-colors" />
      )}
    </button>
  );
};
