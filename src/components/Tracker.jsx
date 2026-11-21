import React from 'react';
import {
  Package,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  Calendar,
  Plus,
  Minus,
  FlaskConical
} from 'lucide-react';
import { Card, CardHeader, StatusBadge, ClinicalAlert } from './Card.jsx';
import { calculateRefillAndBUD } from '../utils/clinicalEngine.js';
import { getLocalDateISO, formatDateID } from '../utils/storage.js';

export default function Tracker({ medications, onUpdateMedications }) {
  const enrichedMedications = medications.map((med) => ({
    med,
    metrics: calculateRefillAndBUD(med)
  }));

  const criticalItems = enrichedMedications.filter(
    (item) => item.metrics.overallStatus === 'critical'
  );
  const warningItems = enrichedMedications.filter(
    (item) => item.metrics.overallStatus === 'warning'
  );

  const handleAdjustStock = (medId, delta) => {
    const updated = medications.map((med) => {
      if (med.id !== medId) return med;
      const nextRemaining = Math.max(
        0,
        Math.min(Number(med.totalUnits) || 999, Number(med.remainingUnits) + delta)
      );
      return { ...med, remainingUnits: nextRemaining };
    });
    onUpdateMedications(updated);
  };

  const handleRefillNewContainer = (medId) => {
    const todayISO = getLocalDateISO();
    const updated = medications.map((med) => {
      if (med.id !== medId) return med;
      return {
        ...med,
        remainingUnits: Number(med.totalUnits) || 120,
        openedDate: todayISO
      };
    });
    onUpdateMedications(updated);
  };

  const handleUpdateOpenedDate = (medId, newOpenedDate) => {
    const updated = medications.map((med) =>
      med.id === medId ? { ...med, openedDate: newOpenedDate } : med
    );
    onUpdateMedications(updated);
  };

  return (
    <div className="space-y-6">
      {/* Ringkasan Peringatan Stok Kritis (<= 3 Hari) & Kedaluwarsa BUD */}
      {criticalItems.length > 0 && (
        <ClinicalAlert
          severity="critical"
          title={`${criticalItems.length} Obat Memerlukan Tindakan Segera (Stok <= 3 Hari atau Lewat Batas BUD)`}
          message={criticalItems
            .map(
              (item) =>
                `${item.med.name}: ${item.metrics.statusReasons.join('; ')}`
            )
            .join(' • ')}
        />
      )}

      {warningItems.length > 0 && (
        <ClinicalAlert
          severity="warning"
          title={`${warningItems.length} Obat Perlu Persiapan Isi Ulang (Stok 4–7 Hari atau Mendekati BUD)`}
          message={warningItems
            .map(
              (item) =>
                `${item.med.name}: ${item.metrics.statusReasons.join('; ')}`
            )
            .join(' • ')}
        />
      )}

      <Card>
        <CardHeader
          icon={Package}
          title="Kalkulator Sisa Dosis, Stok Inhaler & Pemantau Beyond Use Date (BUD)"
          subtitle="Perhitungan otomatis sisa hari pemakaian berdasarkan frekuensi harian serta batas simpan aman setelah kemasan dibuka atau sirup direkonstitusi."
          badge={
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge variant="critical">
                {criticalItems.length} Kritis (Merah)
              </StatusBadge>
              <StatusBadge variant="warning">
                {warningItems.length} Perhatian (Kuning)
              </StatusBadge>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {enrichedMedications.map(({ med, metrics }) => {
            const isCritical = metrics.overallStatus === 'critical';
            const isWarning = metrics.overallStatus === 'warning';

            return (
              <div
                key={med.id}
                className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                  isCritical
                    ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-500/20'
                    : isWarning
                    ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-500/15'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  {/* Header Kartu & Badge Merah/Kuning/Hijau */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {med.form}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {med.name}
                      </h3>
                    </div>

                    {isCritical ? (
                      <StatusBadge variant="critical" icon={AlertOctagon}>
                        {metrics.isBudExpired
                          ? 'LEWAT BATAS BUD (MERAH)'
                          : metrics.isManufacturerExpired
                          ? 'KEDALUWARSA ED (MERAH)'
                          : `STOK KRITIS: ${metrics.remainingDays} HARI`}
                      </StatusBadge>
                    ) : isWarning ? (
                      <StatusBadge variant="warning" icon={AlertTriangle}>
                        {metrics.isBudWarning
                          ? `BUD ${metrics.daysUntilBUD} HARI LAGI`
                          : `STOK MENIPIS: ${metrics.remainingDays} HARI`}
                      </StatusBadge>
                    ) : (
                      <StatusBadge variant="safe" icon={CheckCircle2}>
                        AMAN ({metrics.remainingDays} HARI)
                      </StatusBadge>
                    )}
                  </div>

                  {/* Alasan Peringatan Spesifik */}
                  {metrics.statusReasons.length > 0 && (
                    <div
                      className={`mb-3.5 p-2.5 rounded-lg text-xs font-semibold border ${
                        isCritical
                          ? 'bg-rose-100/80 text-rose-900 border-rose-300'
                          : 'bg-amber-100/80 text-amber-900 border-amber-300'
                      }`}
                    >
                      {metrics.statusReasons.map((reason, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span>•</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Kalkulator Visual Sisa Dosis / Isapan / Sirup */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-500 block">
                          Sisa Dosis / Volume Saat Ini
                        </span>
                        <span className="text-xl font-extrabold text-slate-900">
                          {metrics.remainingUnits}{' '}
                          <span className="text-xs font-semibold text-slate-600">
                            / {metrics.totalUnits} {med.unitLabel} ({metrics.stockPercentage}%)
                          </span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">
                          Estimasi Cukup Untuk
                        </span>
                        <span
                          className={`text-lg font-extrabold ${
                            metrics.remainingDays <= 3
                              ? 'text-rose-700'
                              : metrics.remainingDays <= 7
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {metrics.remainingDays} Hari
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          metrics.remainingDays <= 3
                            ? 'bg-rose-600'
                            : metrics.remainingDays <= 7
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${metrics.stockPercentage}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-1">
                      <span>
                        Konsumsi harian:{' '}
                        <strong className="text-slate-800">
                          {metrics.dailyUsage} {med.unitLabel}/hari
                        </strong>
                      </span>
                      <span>
                        Perkiraan habis:{' '}
                        <strong className="text-slate-800">
                          {formatDateID(metrics.estimatedRunOutDate)}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Detail Pelacakan Beyond Use Date (BUD) & Kedaluwarsa */}
                  <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div
                      className={`p-2.5 rounded-lg border ${
                        metrics.isBudExpired
                          ? 'bg-rose-100/70 border-rose-300 text-rose-950'
                          : metrics.isBudWarning
                          ? 'bg-amber-100/70 border-amber-300 text-amber-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                        <span>Batas Beyond Use Date (BUD)</span>
                      </div>
                      <p>
                        Batas Pakai:{' '}
                        <strong>
                          {metrics.budExpiryDate
                            ? formatDateID(metrics.budExpiryDate)
                            : '-'}
                        </strong>{' '}
                        ({med.budDaysAfterOpen} hari sejak dibuka)
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <label className="text-[11px] text-slate-600">
                          Tgl Dibuka:
                        </label>
                        <input
                          type="date"
                          value={med.openedDate || ''}
                          onChange={(e) =>
                            handleUpdateOpenedDate(med.id, e.target.value)
                          }
                          className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] font-mono text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-700">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Kedaluwarsa Pabrik (ED)</span>
                      </div>
                      <p>
                        Tanggal ED:{' '}
                        <strong>
                          {med.expiryDate ? formatDateID(med.expiryDate) : '-'}
                        </strong>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {metrics.daysUntilExpiry !== null
                          ? metrics.daysUntilExpiry >= 0
                            ? `${metrics.daysUntilExpiry} hari menuju ED kemasan`
                            : `Sudah lewat ED ${Math.abs(metrics.daysUntilExpiry)} hari`
                          : 'Sesuai kemasan primer'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tombol Penyesuaian Stok & Isi Ulang Kemasan Baru */}
                <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(med.id, -Number(med.dosePerAdmin || 1))}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                      title="Kurangi 1 dosis pemakaian ekstra"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      Pakai 1 Dosis ({med.dosePerAdmin} {med.unitLabel})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(med.id, Number(med.dosePerAdmin || 1))}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                      title="Tambah/koreksi stok"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRefillNewContainer(med.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-colors shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Buka Tabung / Botol Baru (Reset Stok & BUD)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
