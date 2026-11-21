import React from 'react';

export function Card({ children, className = '', noPadding = false }) {
  return (
    <section
      className={`bg-white border border-slate-200 rounded-xl shadow-sm print-card ${
        noPadding ? '' : 'p-5 sm:p-6'
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, action, badge }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 shrink-0 mt-0.5">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        )}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
            {badge}
          </div>
          {subtitle && <p className="text-sm text-slate-600 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatusBadge({ variant = 'neutral', children, icon: Icon }) {
  const styles = {
    critical: 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-500/20',
    warning: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-500/20',
    safe: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        styles[variant] || styles.neutral
      }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function ClinicalAlert({ severity = 'warning', title, message, action }) {
  const palette = {
    critical: {
      box: 'bg-rose-50/90 border-rose-300 text-rose-950',
      badge: 'bg-rose-600 text-white',
      label: 'PERINGATAN KRITIS'
    },
    warning: {
      box: 'bg-amber-50/90 border-amber-300 text-amber-950',
      badge: 'bg-amber-600 text-white',
      label: 'PERHATIAN KLINIS'
    },
    info: {
      box: 'bg-sky-50/90 border-sky-300 text-sky-950',
      badge: 'bg-sky-600 text-white',
      label: 'INFO SINKRONISASI'
    }
  };

  const current = palette[severity] || palette.warning;

  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 transition-colors ${current.box}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${current.badge}`}>
              {current.label}
            </span>
            <h3 className="text-sm font-bold">{title}</h3>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed opacity-90">{message}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
