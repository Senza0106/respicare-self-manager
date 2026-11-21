import React, { useState, useMemo, useEffect } from 'react';
import {
  ClipboardCheck,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Moon,
  Wind,
  ShieldCheck,
  Save
} from 'lucide-react';
import { Card, CardHeader, StatusBadge } from './Card.jsx';
import { calculateAdherenceAndControlSummary } from '../utils/clinicalEngine.js';
import { getLocalDateISO, formatDateID } from '../utils/storage.js';

const SIDE_EFFECT_OPTIONS = [
  'Suara serak / disfonia',
  'Sariawan / bercak putih di mulut',
  'Jantung berdebar ringan',
  'Tremor tangan halus',
  'Mulut / tenggorokan kering',
  'Batuk sesaat setelah inhalasi'
];

const TRIGGER_OPTIONS = [
  'Udara dingin / hujan',
  'Debu rumah / kasur',
  'Asap rokok / polusi',
  'Aktivitas fisik berat',
  'Gejala flu / infeksi',
  'Terlambat / lupa dosis'
];

const DYSPNEA_LEVELS = [
  { score: 0, label: '0 - Tidak Ada Sesak', desc: 'Napas lega sepanjang hari', color: 'emerald' },
  { score: 1, label: '1 - Sesak Ringan', desc: 'Muncul saat jalan cepat / tanjakan', color: 'sky' },
  { score: 2, label: '2 - Sesak Sedang', desc: 'Jalan datar harus berhenti ambil napas', color: 'amber' },
  { score: 3, label: '3 - Sesak Berat', desc: 'Sesak saat istirahat / bicara pendek', color: 'rose' }
];

export default function Log({
  medications,
  doseLogs,
  symptomLogs,
  onSaveSymptomLog,
  techniqueValidations,
  onConfirmTechniqueToday,
  patientProfile,
  onNavigateTab
}) {
  const todayISO = getLocalDateISO();
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [chartRangeDays, setChartRangeDays] = useState(7); // 7 (Mingguan) atau 30 (Bulanan)
  const [saveFeedback, setSaveFeedback] = useState(false);

  const existingLogForDate = useMemo(
    () => symptomLogs.find((item) => item.date === selectedDate) || null,
    [symptomLogs, selectedDate]
  );

  const isTechniqueValidatedForDate = Boolean(
    techniqueValidations[selectedDate]?.confirmed || existingLogForDate?.techniqueConfirmed
  );

  const [dyspneaScore, setDyspneaScore] = useState(0);
  const [nightCough, setNightCough] = useState('none');
  const [rescuePuffsUsed, setRescuePuffsUsed] = useState(0);
  const [pefValue, setPefValue] = useState('');
  const [sideEffects, setSideEffects] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [notes, setNotes] = useState('');
  const [inlineTechniqueConfirm, setInlineTechniqueConfirm] = useState(false);

  useEffect(() => {
    if (existingLogForDate) {
      setDyspneaScore(Number(existingLogForDate.dyspneaScore) || 0);
      setNightCough(existingLogForDate.nightCough || 'none');
      setRescuePuffsUsed(Number(existingLogForDate.rescuePuffsUsed) || 0);
      setPefValue(existingLogForDate.pefValue ? String(existingLogForDate.pefValue) : '');
      setSideEffects(Array.isArray(existingLogForDate.sideEffects) ? existingLogForDate.sideEffects : []);
      setTriggers(Array.isArray(existingLogForDate.triggers) ? existingLogForDate.triggers : []);
      setNotes(existingLogForDate.notes || '');
      setInlineTechniqueConfirm(Boolean(existingLogForDate.techniqueConfirmed));
    } else {
      setDyspneaScore(0);
      setNightCough('none');
      setRescuePuffsUsed(0);
      setPefValue('');
      setSideEffects([]);
      setTriggers([]);
      setNotes('');
      setInlineTechniqueConfirm(Boolean(techniqueValidations[selectedDate]?.confirmed));
    }
  }, [existingLogForDate, selectedDate, techniqueValidations]);

  const summaryMetrics = useMemo(
    () =>
      calculateAdherenceAndControlSummary(
        medications,
        doseLogs,
        symptomLogs,
        techniqueValidations,
        chartRangeDays
      ),
    [medications, doseLogs, symptomLogs, techniqueValidations, chartRangeDays]
  );

  const handleToggleItem = (list, setList, value) => {
    if (list.includes(value)) {
      setList(list.filter((i) => i !== value));
    } else {
      setList([...list, value]);
    }
  };

  const canSubmitLog = isTechniqueValidatedForDate || inlineTechniqueConfirm;

  const handleSubmitCheckIn = (e) => {
    e.preventDefault();
    if (!canSubmitLog) return;

    if (selectedDate === todayISO && inlineTechniqueConfirm && !isTechniqueValidatedForDate) {
      onConfirmTechniqueToday('mdi_standard');
    }

    const entry = {
      date: selectedDate,
      dyspneaScore: Number(dyspneaScore),
      nightCough,
      rescuePuffsUsed: Math.max(0, Number(rescuePuffsUsed) || 0),
      pefValue: pefValue ? Number(pefValue) : null,
      sideEffects,
      triggers,
      techniqueConfirmed: true,
      notes: notes.trim(),
      updatedAt: new Date().toISOString()
    };

    onSaveSymptomLog(entry);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 3000);
  };

  // Evaluasi Zona Peak Flow Meter (Hijau >=80%, Kuning 50-79%, Merah <50%)
  const personalBest = Number(patientProfile?.personalBestPEF) || 400;
  const currentPefNum = Number(pefValue) || 0;
  const pefPct = currentPefNum > 0 ? Math.round((currentPefNum / personalBest) * 100) : null;

  return (
    <div className="space-y-6">
      {/* Bagian 1: Form Check-In Gejala & Kepatuhan Harian */}
      <Card>
        <CardHeader
          icon={ClipboardCheck}
          title="Check-In Kondisi Pernapasan & Evaluasi Harian"
          subtitle="Catat derajat sesak napas, frekuensi terbangun malam, pemakaian inhaler pelega, dan keluhan efek samping."
          badge={
            existingLogForDate ? (
              <StatusBadge variant="safe" icon={CheckCircle2}>
                Log {formatDateID(selectedDate)} Tersimpan
              </StatusBadge>
            ) : (
              <StatusBadge variant="info">Belum Diisi untuk {formatDateID(selectedDate)}</StatusBadge>
            )
          }
          action={
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Tanggal Log:</label>
              <input
                type="date"
                max={todayISO}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono text-slate-900"
              />
            </div>
          }
        />

        <form onSubmit={handleSubmitCheckIn} className="space-y-5">
          {/* 1. Status Sesak Napas */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              1. Status Sesak Napas Hari Ini (Skala Gejala Harian)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {DYSPNEA_LEVELS.map((lvl) => {
                const isSelected = Number(dyspneaScore) === lvl.score;
                return (
                  <button
                    key={lvl.score}
                    type="button"
                    onClick={() => setDyspneaScore(lvl.score)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-teal-900 text-white border-teal-900 shadow-sm ring-2 ring-teal-600/30'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-white hover:border-teal-400'
                    }`}
                  >
                    <div className="text-xs font-extrabold">{lvl.label}</div>
                    <div
                      className={`text-[11px] mt-1 ${
                        isSelected ? 'text-teal-100' : 'text-slate-500'
                      }`}
                    >
                      {lvl.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Batuk Malam Hari, Pemakaian Inhaler Pelega & Peak Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                <Moon className="w-4 h-4 text-teal-700" />
                2. Frekuensi Batuk / Terbangun Malam
              </label>
              <select
                value={nightCough}
                onChange={(e) => setNightCough(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
              >
                <option value="none">Tidak ada (Tidur nyenyak semalaman)</option>
                <option value="once">Terbangun 1 kali karena batuk / sesak</option>
                <option value="multiple">Terbangun &gt;= 2 kali / batuk terus</option>
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                <Wind className="w-4 h-4 text-teal-700" />
                3. Pemakaian Pelega Darurat (SABA)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={rescuePuffsUsed}
                  onChange={(e) => setRescuePuffsUsed(e.target.value)}
                  className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900"
                />
                <span className="text-xs text-slate-600">
                  isapan darurat di luar jadwal rutin
                </span>
              </div>
              {Number(rescuePuffsUsed) >= 4 && (
                <p className="text-[11px] text-rose-700 font-semibold mt-1.5">
                  Perhatian: Pemakaian pelega &gt;= 4 isapan/hari menandakan gejala kurang terkontrol.
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                <Activity className="w-4 h-4 text-teal-700" />
                4. Nilai Peak Flow Meter (Opsional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="850"
                  placeholder={`Target: ${personalBest}`}
                  value={pefValue}
                  onChange={(e) => setPefValue(e.target.value)}
                  className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900"
                />
                <span className="text-xs text-slate-600">L/menit</span>
                {pefPct !== null && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      pefPct >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : pefPct >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {pefPct}% ({pefPct >= 80 ? 'Zona Hijau' : pefPct >= 50 ? 'Zona Kuning' : 'Zona Merah'})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3. Keluhan Efek Samping & Faktor Pemicu */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                5. Keluhan Efek Samping Lokal / Sistemik (Pilih bila ada)
              </label>
              <div className="flex flex-wrap gap-2">
                {SIDE_EFFECT_OPTIONS.map((effect) => {
                  const active = sideEffects.includes(effect);
                  return (
                    <button
                      key={effect}
                      type="button"
                      onClick={() => handleToggleItem(sideEffects, setSideEffects, effect)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        active
                          ? 'bg-rose-700 text-white border-rose-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-rose-400'
                      }`}
                    >
                      {effect}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                6. Faktor Pemicu yang Dirasakan Hari Ini (Opsional)
              </label>
              <div className="flex flex-wrap gap-2">
                {TRIGGER_OPTIONS.map((trig) => {
                  const active = triggers.includes(trig);
                  return (
                    <button
                      key={trig}
                      type="button"
                      onClick={() => handleToggleItem(triggers, setTriggers, trig)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        active
                          ? 'bg-teal-800 text-white border-teal-800'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-teal-500'
                      }`}
                    >
                      {trig}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Catatan Harian */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Catatan Tambahan Pasien / Keluarga (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Sudah kumur air bersih setelah pakai Symbicort pagi dan malam."
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
            />
          </div>

          {/* Konfirmasi Wajib Validasi Teknik Inhaler Sebelum Menyimpan Log */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              canSubmitLog
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={canSubmitLog}
                onChange={(e) => setInlineTechniqueConfirm(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded text-teal-700 focus:ring-teal-600"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold block">
                  Saya Mengerti & Telah Melakukan Teknik Penggunaan Inhaler yang Benar
                </span>
                <span className="text-xs opacity-85">
                  Konfirmasi ini wajib dicentang (atau dilakukan melalui modul Validasi Alat) sebelum menyelesaikan log harian.
                </span>
              </div>
            </label>

            <button
              type="button"
              onClick={() => onNavigateTab('inhaler')}
              className="text-xs font-bold text-teal-800 hover:text-teal-950 underline shrink-0"
            >
              Lihat Panduan Alat Hirup
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div>
              {saveFeedback && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                  Catatan kepatuhan & gejala harian berhasil disimpan ke perangkat!
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmitLog}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:text-slate-500 text-white transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Simpan Log Harian ({formatDateID(selectedDate)})
            </button>
          </div>
        </form>
      </Card>

      {/* Bagian 2: Grafik Riwayat Kepatuhan & Gejala (Mingguan 7 Hari / Bulanan 30 Hari) */}
      <Card>
        <CardHeader
          icon={BarChart3}
          title={`Grafik Konsistensi Kepatuhan & Gejala (${
            chartRangeDays === 7 ? 'Mingguan - 7 Hari Terakhir' : 'Bulanan - 30 Hari Terakhir'
          })`}
          subtitle="Visualisasi persentase dosis terjadwal yang terpenuhi setiap hari beserta indikator gejala sesak napas."
          action={
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setChartRangeDays(7)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  chartRangeDays === 7
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mingguan (7 Hari)
              </button>
              <button
                type="button"
                onClick={() => setChartRangeDays(30)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  chartRangeDays === 30
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulanan (30 Hari)
              </button>
            </div>
          }
        />

        {/* Ringkasan Metrik Periode */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Rata-rata Kepatuhan Dosis</span>
            <span className="text-2xl font-extrabold text-teal-800">
              {summaryMetrics.overallAdherencePct}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {summaryMetrics.totalTakenTracked} dari {summaryMetrics.totalScheduledTracked} dosis tercatat
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Hari Bebas Gejala</span>
            <span className="text-2xl font-extrabold text-emerald-700">
              {summaryMetrics.symptomFreePct}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {summaryMetrics.symptomFreeDaysCount} dari {summaryMetrics.loggedSymptomsCount} hari log
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Total Inhaler Pelega (SABA)</span>
            <span className="text-2xl font-extrabold text-amber-700">
              {summaryMetrics.totalRescuePuffs}{' '}
              <span className="text-xs font-semibold">isapan</span>
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Terbangun malam: {summaryMetrics.nightAwakeningDays} malam
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Validasi Teknik Inhaler</span>
            <span className="text-2xl font-extrabold text-slate-900">
              {summaryMetrics.techniqueVerifiedDaysPct}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Status: {summaryMetrics.controlClassification.level}
            </span>
          </div>
        </div>

        {/* Bar Chart Visualisasi Harian */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs text-slate-600">
            <span className="font-bold text-slate-800">
              Tinggi Batang = % Kepatuhan Jadwal Dosis Harian (Klik batang untuk memilih tanggal)
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                Patuh &ge;80% & Gejala Terkontrol
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
                Kepatuhan Sedang / Gejala Ringan
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-600 inline-block" />
                Dosis Terlewat / Sesak Sedang-Berat
              </span>
            </div>
          </div>

          <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 px-1 overflow-x-auto">
            {summaryMetrics.dailySeries.map((day) => {
              const pct = day.adherencePct !== null ? day.adherencePct : 0;
              const dyspnea = day.symptomEntry ? Number(day.symptomEntry.dyspneaScore) : 0;
              const isSelected = day.date === selectedDate;

              let barColor = 'bg-slate-300';
              if (day.hasAnyRecord) {
                if (dyspnea >= 2 || pct < 60) {
                  barColor = 'bg-rose-600';
                } else if (dyspnea === 1 || pct < 85) {
                  barColor = 'bg-amber-500';
                } else {
                  barColor = 'bg-emerald-600';
                }
              }

              const dayLabel = day.date.slice(8, 10);
              const monthLabel = day.date.slice(5, 7);

              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  title={`${formatDateID(day.date)}: Kepatuhan ${
                    day.adherencePct !== null ? `${day.adherencePct}%` : 'Belum ada data'
                  }${
                    day.symptomEntry
                      ? `, Sesak Skala ${day.symptomEntry.dyspneaScore}`
                      : ''
                  }`}
                  className={`group flex-1 min-w-[20px] flex flex-col items-center h-full justify-end rounded-lg p-0.5 transition-colors ${
                    isSelected ? 'bg-teal-100/80 ring-1 ring-teal-600' : 'hover:bg-slate-200/60'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-600 mb-1">
                    {day.hasAnyRecord ? `${pct}%` : '-'}
                  </span>
                  <div className="w-full bg-slate-200/80 rounded-t-md h-28 flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${barColor}`}
                      style={{ height: `${day.hasAnyRecord ? Math.max(12, pct) : 6}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-700 mt-1.5">
                    {dayLabel}/{monthLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
