import React, { useState, useMemo } from 'react';
import {
  Printer,
  FileText,
  UserCheck,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, StatusBadge } from './Card.jsx';
import {
  calculateAdherenceAndControlSummary,
  calculateRefillAndBUD
} from '../utils/clinicalEngine.js';
import { getLocalDateISO, formatDateID } from '../utils/storage.js';

export default function SummaryReport({
  patientProfile,
  onUpdatePatientProfile,
  medications,
  doseLogs,
  symptomLogs,
  techniqueValidations
}) {
  const todayISO = getLocalDateISO();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState(patientProfile);

  const report30Days = useMemo(
    () =>
      calculateAdherenceAndControlSummary(
        medications,
        doseLogs,
        symptomLogs,
        techniqueValidations,
        30
      ),
    [medications, doseLogs, symptomLogs, techniqueValidations]
  );

  const recordedDaysList = useMemo(
    () =>
      [...report30Days.dailySeries]
        .filter((d) => d.hasAnyRecord)
        .reverse(),
    [report30Days]
  );

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onUpdatePatientProfile(draftProfile);
    setIsEditingProfile(false);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const sideEffectEntries = Object.entries(report30Days.sideEffectMap);
  const triggerEntries = Object.entries(report30Days.triggerMap);

  return (
    <div className="space-y-6">
      {/* Toolbar Aksi Cetak / Ekspor PDF (Disembunyikan saat mode cetak) */}
      <Card className="no-print bg-gradient-to-r from-slate-900 to-teal-950 text-white border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Laporan Evaluasi Mandiri 30 Hari Terakhir (Siap Cetak / Simpan PDF)
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-2xl">
                Format ringkasan klinis terstandar untuk dibawa saat kontrol rutin ke Puskesmas, Dokter Spesialis Paru, atau Konseling Apoteker.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setDraftProfile(patientProfile);
                setIsEditingProfile(!isEditingProfile);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              {isEditingProfile ? 'Tutup Edit Profil' : 'Ubah Data Pasien'}
            </button>

            <button
              type="button"
              onClick={handlePrintReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF (30 Hari)
            </button>
          </div>
        </div>
      </Card>

      {/* Form Edit Profil Pasien (Hanya tampil saat diedit, disembunyikan saat print) */}
      {isEditingProfile && (
        <Card className="no-print border-2 border-teal-600">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Perbarui Identitas Pasien & Target Klinis (Tersimpan Lokal di Perangkat)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Pasien
                </label>
                <input
                  type="text"
                  required
                  value={draftProfile.name}
                  onChange={(e) =>
                    setDraftProfile({ ...draftProfile, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Usia (Tahun)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={draftProfile.age}
                  onChange={(e) =>
                    setDraftProfile({ ...draftProfile, age: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nilai Terbaik Peak Flow (L/menit)
                </label>
                <input
                  type="number"
                  min="100"
                  max="800"
                  value={draftProfile.personalBestPEF}
                  onChange={(e) =>
                    setDraftProfile({
                      ...draftProfile,
                      personalBestPEF: Number(e.target.value)
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnosis Pernapasan Utama (Asma / PPOK)
                </label>
                <input
                  type="text"
                  value={draftProfile.diagnosis}
                  onChange={(e) =>
                    setDraftProfile({ ...draftProfile, diagnosis: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faskes / Puskesmas / Dokter Pemeriksa
                </label>
                <input
                  type="text"
                  value={draftProfile.facilityName}
                  onChange={(e) =>
                    setDraftProfile({
                      ...draftProfile,
                      facilityName: e.target.value
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Riwayat Alergi / Pemicu Utama
                </label>
                <input
                  type="text"
                  value={draftProfile.allergies}
                  onChange={(e) =>
                    setDraftProfile({ ...draftProfile, allergies: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kontak Pendamping Keluarga
                </label>
                <input
                  type="text"
                  value={draftProfile.emergencyContact}
                  onChange={(e) =>
                    setDraftProfile({
                      ...draftProfile,
                      emergencyContact: e.target.value
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-bold bg-teal-700 text-white"
              >
                Simpan Profil Pasien
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* LEMBAR LAPORAN UTAMA (Tercetak Rapi di Kertas A4 / PDF) */}
      <Card className="space-y-6">
        {/* Kop Laporan Klinis */}
        <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-teal-800 font-extrabold text-xs uppercase tracking-widest">
              <Stethoscope className="w-4 h-4" />
              <span>RespiCare Self-Manager • Lembar Evaluasi Terapi Pernapasan Mandiri</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              LAPORAN PEMANTAUAN 30 HARI KEPATUHAN OBAT & GEJALA HARIAN
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Periode Evaluasi: {formatDateID(report30Days.dailySeries[0]?.date)} s/d{' '}
              {formatDateID(todayISO)} • Dicetak pada: {formatDateID(todayISO, true)}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-[11px] font-bold uppercase text-slate-500 block">
              Status Kontrol Gejala (GINA/GOLD)
            </span>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-extrabold border ${
                report30Days.controlClassification.badgeColor === 'emerald'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-400'
                  : report30Days.controlClassification.badgeColor === 'amber'
                  ? 'bg-amber-50 text-amber-900 border-amber-400'
                  : 'bg-rose-50 text-rose-900 border-rose-400'
              }`}
            >
              {report30Days.controlClassification.level}
            </span>
          </div>
        </div>

        {/* Data Demografi & Klinis Pasien */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Nama Pasien & Usia:</span>
            <strong className="text-slate-900 text-sm">
              {patientProfile.name} ({patientProfile.age} Tahun)
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">Diagnosis Kerja:</span>
            <strong className="text-slate-900">{patientProfile.diagnosis}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Faskes / Dokter Pemeriksa:</span>
            <strong className="text-slate-900">{patientProfile.facilityName}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Target Peak Flow (Personal Best):</span>
            <strong className="text-slate-900">{patientProfile.personalBestPEF} L/menit</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Riwayat Alergi / Pemicu:</span>
            <strong className="text-slate-900">{patientProfile.allergies || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Pendamping Keluarga:</span>
            <strong className="text-slate-900">{patientProfile.emergencyContact || '-'}</strong>
          </div>
        </div>

        {/* Indikator Kinerja Terapi 30 Hari Terakhir */}
        <div className="print-break-inside-avoid">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5">
            A. Ringkasan Indikator Kepatuhan & Kontrol Gejala (30 Hari Terakhir)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] text-slate-500 block">Kepatuhan Dosis</span>
              <span className="text-lg font-extrabold text-slate-900">
                {report30Days.overallAdherencePct}%
              </span>
              <span className="text-[10px] text-slate-500 block">
                {report30Days.totalTakenTracked}/{report30Days.totalScheduledTracked} dosis
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] text-slate-500 block">Hari Bebas Gejala</span>
              <span className="text-lg font-extrabold text-emerald-800">
                {report30Days.symptomFreePct}%
              </span>
              <span className="text-[10px] text-slate-500 block">
                {report30Days.symptomFreeDaysCount} dari {report30Days.loggedSymptomsCount} hari
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] text-slate-500 block">Total Pelega (SABA)</span>
              <span className="text-lg font-extrabold text-amber-800">
                {report30Days.totalRescuePuffs} puff
              </span>
              <span className="text-[10px] text-slate-500 block">
                Selama 30 hari terakhir
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] text-slate-500 block">Batuk / Bangun Malam</span>
              <span className="text-lg font-extrabold text-slate-900">
                {report30Days.nightAwakeningDays} malam
              </span>
              <span className="text-[10px] text-slate-500 block">
                Sesak sedang-berat: {report30Days.moderateSevereDyspneaDays} hr
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] text-slate-500 block">Rata-rata Peak Flow</span>
              <span className="text-lg font-extrabold text-slate-900">
                {report30Days.averagePEF ? `${report30Days.averagePEF}` : '-'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                L/menit (Target: {patientProfile.personalBestPEF})
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] text-slate-500 block">Teknik Inhaler Benar</span>
              <span className="text-lg font-extrabold text-teal-800">
                {report30Days.techniqueVerifiedDaysPct}%
              </span>
              <span className="text-[10px] text-slate-500 block">
                {report30Days.techniqueVerifiedDays} hari tervalidasi
              </span>
            </div>
          </div>

          <div className="mt-3 p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-950">
            <strong className="font-bold">Kesimpulan & Rekomendasi Farmasi Klinis:</strong>{' '}
            {report30Days.controlClassification.clinicalSummary}
          </div>
        </div>

        {/* Tabel Regimen Obat Aktif & Status BUD */}
        <div className="print-break-inside-avoid">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5">
            B. Daftar Regimen Obat Pernapasan, Sisa Stok & Status Beyond Use Date (BUD)
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-bold">Nama Obat & Sediaan</th>
                  <th className="py-2.5 px-3 font-bold">Kategori</th>
                  <th className="py-2.5 px-3 font-bold">Aturan Pakai & Jam</th>
                  <th className="py-2.5 px-3 font-bold">Sisa Stok (Estimasi)</th>
                  <th className="py-2.5 px-3 font-bold">Batas Simpan (BUD)</th>
                  <th className="py-2.5 px-3 font-bold">Status Keamanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {medications.map((med) => {
                  const m = calculateRefillAndBUD(med);
                  return (
                    <tr key={med.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {med.name}{' '}
                        <span className="text-[11px] font-normal text-slate-500">
                          ({med.form})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{med.category}</td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {med.scheduledTimes.length}x/hari @ {med.dosePerAdmin} {med.unitLabel} (
                        <span className="font-mono">{med.scheduledTimes.join(', ')}</span>)
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">
                        <strong>
                          {m.remainingUnits}/{m.totalUnits} {med.unitLabel}
                        </strong>{' '}
                        (~{m.remainingDays} hari)
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {m.budExpiryDate ? formatDateID(m.budExpiryDate) : '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        {m.overallStatus === 'critical' ? (
                          <span className="font-bold text-rose-700">
                            PERLU TINDAKAN ({m.isBudExpired ? 'Lewat BUD' : 'Stok <=3 hr'})
                          </span>
                        ) : m.overallStatus === 'warning' ? (
                          <span className="font-bold text-amber-700">
                            Siapkan Refill ({m.remainingDays} hr)
                          </span>
                        ) : (
                          <span className="font-semibold text-emerald-700">Aman</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ringkasan Efek Samping & Faktor Pemicu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print-break-inside-avoid">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
              C. Keluhan Efek Samping yang Tercatat (30 Hari)
            </h4>
            {sideEffectEntries.length === 0 ? (
              <p className="text-xs text-slate-600">
                Tidak ada keluhan efek samping obat (suara serak, kandidiasis mulut, atau tremor) yang dilaporkan.
              </p>
            ) : (
              <ul className="space-y-1 text-xs text-slate-800">
                {sideEffectEntries.map(([name, count]) => (
                  <li key={name} className="flex items-center justify-between">
                    <span>• {name}</span>
                    <strong className="px-2 py-0.5 rounded bg-rose-100 text-rose-900">
                      {count} hari
                    </strong>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
              D. Faktor Pemicu Gejala Terbanyak
            </h4>
            {triggerEntries.length === 0 ? (
              <p className="text-xs text-slate-600">
                Tidak ada faktor pemicu spesifik yang tercatat selama periode ini.
              </p>
            ) : (
              <ul className="space-y-1 text-xs text-slate-800">
                {triggerEntries.map(([name, count]) => (
                  <li key={name} className="flex items-center justify-between">
                    <span>• {name}</span>
                    <strong className="px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      {count} kejadian
                    </strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Tabel Riwayat Evaluasi Harian */}
        <div className="print-break-inside-avoid">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5">
            E. Riwayat Detail Log Kepatuhan & Gejala Harian ({recordedDaysList.length} Hari Tercatat)
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                  <th className="py-2 px-3 font-bold">Tanggal</th>
                  <th className="py-2 px-3 font-bold">Kepatuhan Dosis</th>
                  <th className="py-2 px-3 font-bold">Skor Sesak</th>
                  <th className="py-2 px-3 font-bold">Batuk Malam</th>
                  <th className="py-2 px-3 font-bold">Pelega (SABA)</th>
                  <th className="py-2 px-3 font-bold">PEF (L/m)</th>
                  <th className="py-2 px-3 font-bold">Efek Samping & Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recordedDaysList.map((day) => {
                  const s = day.symptomEntry;
                  const nightMap = {
                    none: 'Tidak ada',
                    once: '1x terbangun',
                    multiple: '>=2x terbangun'
                  };
                  return (
                    <tr key={day.date} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {formatDateID(day.date)}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`font-bold ${
                            (day.adherencePct ?? 0) >= 80
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {day.adherencePct !== null ? `${day.adherencePct}%` : '-'}
                        </span>{' '}
                        <span className="text-[11px] text-slate-500">
                          ({day.takenCount}/{day.scheduledCount})
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-800">
                        {s ? `Skala ${s.dyspneaScore}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-800">
                        {s ? nightMap[s.nightCough] || s.nightCough : '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-800">
                        {s ? `${s.rescuePuffsUsed} puff` : '-'}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-800">
                        {s?.pefValue || '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-700">
                        {s?.sideEffects?.length > 0 && (
                          <span className="font-semibold text-rose-700 mr-1.5">
                            [{s.sideEffects.join(', ')}]
                          </span>
                        )}
                        <span>{s?.notes || '-'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Verifikasi Dokter / Apoteker Saat Kontrol Rutin */}
        <div className="pt-4 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-700 print-break-inside-avoid">
          <div className="p-3.5 rounded-xl border border-dashed border-slate-300">
            <strong className="block text-slate-900 mb-6">
              Catatan Evaluasi Dokter Pemeriksa / Puskesmas:
            </strong>
            <div className="h-10 border-b border-slate-200 mb-2" />
            <div className="flex justify-between text-[11px] text-slate-500 pt-2">
              <span>Tanda Tangan & Nama Dokter</span>
              <span>Tanggal Kontrol: ____/____/2026</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-dashed border-slate-300">
            <strong className="block text-slate-900 mb-6">
              Verifikasi Teknik Inhaler & Konseling Apoteker:
            </strong>
            <div className="h-10 border-b border-slate-200 mb-2" />
            <div className="flex justify-between text-[11px] text-slate-500 pt-2">
              <span>Paraf Pasien ({patientProfile.name})</span>
              <span>Paraf Apoteker Klinis</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
