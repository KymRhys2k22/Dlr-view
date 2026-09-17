import React, { useState, useEffect } from 'react';
import { Store, User, ArrowRight, AlertCircle, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { STORES, getStoreNameByCode } from '../data/store';
import { UserSession } from '../types/dlr';

interface LoginFormProps {
  onLogin: (session: UserSession) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [storeCodeInput, setStoreCodeInput] = useState('');
  const [resolvedStoreName, setResolvedStoreName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Dynamically resolve Store Name whenever storeCodeInput changes
  useEffect(() => {
    const trimmed = storeCodeInput.trim();
    if (!trimmed) {
      setResolvedStoreName(null);
      setError(null);
      return;
    }

    const storeName = getStoreNameByCode(trimmed);
    if (storeName) {
      setResolvedStoreName(storeName);
      setError(null);
    } else {
      setResolvedStoreName(null);
      // If user typed 3 or more digits, show validation feedback
      if (trimmed.length >= 3) {
        setError(`Store Code "${trimmed}" does not exist in store directory.`);
      } else {
        setError(null);
      }
    }
  }, [storeCodeInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCode = storeCodeInput.trim();

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }

    if (!trimmedCode) {
      setError('Please enter a Store Code.');
      return;
    }

    const storeName = getStoreNameByCode(trimmedCode);
    if (!storeName) {
      setError(`Invalid Store Code "${trimmedCode}". Please enter a valid registered Daiso store.`);
      return;
    }

    const session: UserSession = {
      name: trimmedName,
      storeCode: trimmedCode,
      storeName,
      loginTime: new Date().toISOString(),
    };

    onLogin(session);
  };

  const handleSelectStore = (storeNum: number) => {
    setStoreCodeInput(String(storeNum));
    setShowStorePicker(false);
    setError(null);
  };

  const filteredStores = STORES.filter(
    (s) =>
      String(s.store).includes(searchFilter.trim()) ||
      s.name.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen bg-[#0F0F12] text-white flex items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Subtle Apple Ambient Light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[360px] bg-rose-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-gradient-to-b from-rose-500 to-rose-600 shadow-2xl shadow-rose-600/35 text-white font-black text-2xl tracking-tighter mb-4 border border-white/25">
            DAISO
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight sf-display">
            Damage & Lost Report
          </h1>
          <p className="text-sm text-slate-400 mt-1 sf-subheadline">
            Store Operations & Inventory Audit Portal
          </p>
        </div>

        {/* Login Card: Apple Frosted Glass */}
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 p-6 sm:p-8 text-[#1D1D1F]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="user-name" className="block text-[11px] font-semibold sf-caption text-slate-500 mb-2">
                Employee / Auditor Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="user-name"
                  type="text"
                  required
                  placeholder="e.g. Kym or Maria Santos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/[0.03] focus:bg-white border border-black/[0.08] focus:border-rose-500/80 rounded-xl text-sm font-medium text-[#1D1D1F] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/15 transition-all sf-subheadline"
                />
              </div>
            </div>

            {/* Store Code Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="store-code" className="block text-[11px] font-semibold sf-caption text-slate-500">
                  Store Code
                </label>
                <button
                  type="button"
                  onClick={() => setShowStorePicker(!showStorePicker)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 apple-pressable cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  {showStorePicker ? 'Hide Directory' : 'Browse Directory'}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Store className="w-4 h-4" />
                </div>
                <input
                  id="store-code"
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder="e.g. 202, 101, 102..."
                  value={storeCodeInput}
                  onChange={(e) => setStoreCodeInput(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-black/[0.03] focus:bg-white border rounded-xl text-sm font-semibold tracking-wide text-[#1D1D1F] placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all sf-subheadline ${
                    resolvedStoreName
                      ? 'border-emerald-500 focus:ring-emerald-500/15'
                      : error && storeCodeInput.length >= 3
                      ? 'border-rose-500 focus:ring-rose-500/15'
                      : 'border-black/[0.08] focus:border-rose-500/80 focus:ring-rose-500/15'
                  }`}
                />
                {resolvedStoreName && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                )}
              </div>

              {/* Dynamic Store Name Display */}
              <div className="mt-2 min-h-[38px]">
                {resolvedStoreName ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs animate-in fade-in duration-200">
                    <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate sf-subheadline">
                      <span className="font-semibold text-emerald-800">Store Name: </span>
                      <span className="font-medium text-emerald-950">{resolvedStoreName}</span>
                    </div>
                  </div>
                ) : storeCodeInput.trim() ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-black/[0.03] border border-black/[0.05] text-slate-500 text-xs sf-subheadline">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Type a valid store code to verify store name...</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Store Picker Directory Drawer */}
            {showStorePicker && (
              <div className="p-3 bg-black/[0.02] rounded-2xl border border-black/[0.06] space-y-2 animate-in fade-in duration-150">
                <input
                  type="text"
                  placeholder="Search store name or code..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-black/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 sf-subheadline"
                />
                <div className="max-h-40 overflow-y-auto divide-y divide-black/[0.04] rounded-xl bg-white border border-black/[0.06]">
                  {filteredStores.length > 0 ? (
                    filteredStores.map((s) => (
                      <button
                        key={s.store}
                        type="button"
                        onClick={() => handleSelectStore(s.store)}
                        className="w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-rose-50/50 transition-colors group cursor-pointer apple-pressable"
                      >
                        <span className="font-medium text-[#1D1D1F] group-hover:text-rose-900 truncate sf-subheadline">
                          {s.name}
                        </span>
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/[0.05] group-hover:bg-rose-100 text-slate-600 group-hover:text-rose-700 shrink-0 ml-2">
                          #{s.store}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400 sf-caption">
                      No matching stores found
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Message Display */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-in fade-in duration-200 sf-subheadline">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button: Apple Primary Filled Pill */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-rose-600/30 border border-white/20 transition-all apple-pressable cursor-pointer sf-subheadline"
            >
              <span>Access DLR Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="mt-6 pt-5 border-t border-black/[0.05] flex items-center justify-center gap-2 text-xs text-slate-400 sf-subheadline">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Store-isolated data access protocol</span>
          </div>
        </div>

        {/* System copyright */}
        <p className="text-center text-xs text-slate-500 mt-6 sf-subheadline">
          © {new Date().getFullYear()} Daiso Japan Philippines · Damage & Lost Reporting System
        </p>
      </div>
    </div>
  );
};
