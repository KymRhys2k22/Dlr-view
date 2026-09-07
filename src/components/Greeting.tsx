import React from 'react';
import { Store, Calendar, Sparkles } from 'lucide-react';
import { UserSession } from '../types/dlr';

interface GreetingProps {
  session: UserSession;
}

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export const Greeting: React.FC<GreetingProps> = ({ session }) => {
  const timeGreeting = getTimeOfDayGreeting();
  const todayFormatted = new Intl.DateTimeFormat('en-PH', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Greeting & Welcome Text */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {timeGreeting}, <span className="text-rose-600">{session?.name || 'User'}</span>!
            </h2>
            <Sparkles className="w-5 h-5 text-amber-500 hidden sm:inline" />
          </div>
          <p className="text-sm text-slate-500">
            Welcome to the Damage & Lost Report dashboard. Review, audit, and export store defect records.
          </p>
        </div>

        {/* Right: Store Name & Store Code Card */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Store
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>{session?.storeName || 'Daiso Store'}</span>
                <span className="font-mono text-[11px] font-semibold text-rose-600 px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200">
                  #{session?.storeCode || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs text-xs text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-medium">{todayFormatted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
