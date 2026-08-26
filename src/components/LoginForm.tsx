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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/40 flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-600 shadow-xl shadow-rose-600/30 text-white font-black text-2xl tracking-tighter mb-4 border border-rose-400/30">
            DAISO
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Damage & Lost Report
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Store Operations & Inventory Audit Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="user-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            {/* Store Code Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="store-code" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Store Code
                </label>
                <button
                  type="button"
                  onClick={() => setShowStorePicker(!showStorePicker)}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  {showStorePicker ? 'Hide Directory' : 'Browse Store Directory'}
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
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold tracking-wide text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                    resolvedStoreName
                      ? 'border-emerald-500 focus:ring-emerald-500/20'
                      : error && storeCodeInput.length >= 3
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-rose-500 focus:ring-rose-500/20'
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
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs animate-in fade-in duration-200">
                    <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-emerald-800">Store Name: </span>
                      <span className="font-medium text-emerald-950">{resolvedStoreName}</span>
                    </div>
                  </div>
                ) : storeCodeInput.trim() ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Type a valid store code to verify store name...</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Store Picker Directory Drawer/Modal */}
            {showStorePicker && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-in fade-in duration-150">
                <input
                  type="text"
                  placeholder="Search store name or code..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-rose-500"
                />
                <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 rounded-lg bg-white border border-slate-200">
                  {filteredStores.length > 0 ? (
                    filteredStores.map((s) => (
                      <button
                        key={s.store}
                        type="button"
                        onClick={() => handleSelectStore(s.store)}
                        className="w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-rose-50 transition-colors group"
                      >
                        <span className="font-medium text-slate-800 group-hover:text-rose-900 truncate">
                          {s.name}
                        </span>
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 group-hover:bg-rose-100 text-slate-600 group-hover:text-rose-700 shrink-0 ml-2">
                          #{s.store}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No matching stores found
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Message Display */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-rose-600/25 hover:shadow-rose-600/35 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              <span>Access DLR Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Store-isolated data access protocol</span>
          </div>
        </div>

        {/* System copyright */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © {new Date().getFullYear()} Daiso Japan Philippines · Damage & Lost Reporting System
        </p>
      </div>
    </div>
  );
};
