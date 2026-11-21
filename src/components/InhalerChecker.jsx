import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  ShieldCheck,
  AlertOctagon,
  Wind,
  Timer,
  Droplets,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, StatusBadge } from './Card.jsx';
import { INHALER_PROTOCOLS } from '../data/clinicalDefaults.js';
import { playClinicalAlarmChime } from '../utils/clinicalEngine.js';
import { getLocalDateISO, formatDateID } from '../utils/storage.js';

export default function InhalerChecker({
  medications,
  techniqueValidations,
  onConfirmTechniqueToday,
  onNavigateTab
}) {
  const todayISO = getLocalDateISO();
  const todayValidation = techniqueValidations[todayISO] || {
    confirmed: false,
    confirmedAt: null,
    devicesChecked: []
  };

  // Deteksi jenis perangkat yang ada pada resep aktif pasien
  const activeDeviceIds = Array.from(
    new Set(medications.map((m) => m.deviceType).filter(Boolean))
  );

  const [selectedDeviceId, setSelectedDeviceId] = useState(
    activeDeviceIds[0] || INHALER_PROTOCOLS[0].id
  );
  const [openStepNumber, setOpenStepNumber] = useState(1);
  const [checkedSteps, setCheckedSteps] = useState({});

  // State untuk Timer Tahan Napas 10 Detik Interaktif
  const [timerSeconds, setTimerSeconds] = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);

  const currentProtocol =
    INHALER_PROTOCOLS.find((p) => p.id === selectedDeviceId) || INHALER_PROTOCOLS[0];

  useEffect(() => {
    if (!isTimerRunning) return undefined;
    if (timerSeconds <= 0) {
      setIsTimerRunning(false);
      setTimerCompleted(true);
      playClinicalAlarmChime();
      return undefined;
    }
    const id = setTimeout(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [isTimerRunning, timerSeconds]);

  const handleSelectDevice = (deviceId) => {
    setSelectedDeviceId(deviceId);
    setOpenStepNumber(1);
  };

  const handleToggleStepCheck = (stepNum) => {
    const key = `${selectedDeviceId}__${stepNum}`;
    setCheckedSteps((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
    // Buka otomatis langkah berikutnya untuk memandu pasien secara berurutan
    if (!checkedSteps[key] && stepNum < currentProtocol.steps.length) {
      setOpenStepNumber(stepNum + 1);
    }
  };

  const handleCheckAllCurrentDevice = () => {
    const updates = { ...checkedSteps };
    currentProtocol.steps.forEach((s) => {
      updates[`${selectedDeviceId}__${s.stepNumber}`] = true;
    });
    setCheckedSteps(updates);
  };

  const completedStepsForCurrent = currentProtocol.steps.filter(
    (s) => checkedSteps[`${selectedDeviceId}__${s.stepNumber}`]
  ).length;

  const handleStartBreathTimer = () => {
    setTimerCompleted(false);
    setTimerSeconds(currentProtocol.breathHoldSeconds || 10);
    setIsTimerRunning(true);
  };

  const handleResetBreathTimer = () => {
    setIsTimerRunning(false);
    setTimerCompleted(false);
    setTimerSeconds(currentProtocol.breathHoldSeconds || 10);
  };

  const handleConfirmButton = () => {
    handleCheckAllCurrentDevice();
    onConfirmTechniqueToday(selectedDeviceId);
  };

  return (
    <div className="space-y-6">
      {/* Pemilih Jenis Alat Inhaler (Interactive Device Cards) */}
      <Card>
        <CardHeader
          icon={Wind}
          title="Modul Validasi Teknik Penggunaan Alat Hirup (Inhaler Device Checker)"
          subtitle="Pilih jenis alat hirup Anda, ikuti panduan langkah demi langkah, dan konfirmasi teknik yang benar sebelum menyelesaikan log harian."
          badge={
            todayValidation.confirmed ? (
              <StatusBadge variant="safe" icon={CheckCircle2}>
                Tervalidasi Hari Ini ({todayValidation.confirmedAt})
              </StatusBadge>
            ) : (
              <StatusBadge variant="warning">Belum Dikonfirmasi Hari Ini</StatusBadge>
            )
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {INHALER_PROTOCOLS.map((proto) => {
            const isSelected = proto.id === selectedDeviceId;
            const isInPatientRegimen = activeDeviceIds.includes(proto.id);
            return (
              <button
                key={proto.id}
                type="button"
                onClick={() => handleSelectDevice(proto.id)}
                className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-900 text-white border-teal-900 shadow-sm ring-2 ring-teal-600/30'
                    : 'bg-slate-50/80 text-slate-800 border-slate-200 hover:border-teal-400 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-teal-700 text-teal-100'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {proto.shortLabel}
                    </span>
                    {isInPatientRegimen && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        Resep Anda
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs font-semibold line-clamp-2 ${
                      isSelected ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {proto.name}
                  </p>
                </div>
                <p
                  className={`text-[11px] mt-2 line-clamp-1 ${
                    isSelected ? 'text-teal-200' : 'text-slate-500'
                  }`}
                >
                  {proto.examples}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Parameter Kunci Aliran Inspirasi & Alat Bantu Timer Tahan Napas 10 Detik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Panduan Langkah Demi Langkah (Interactive Accordion)
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {currentProtocol.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge
                variant={
                  completedStepsForCurrent === currentProtocol.steps.length ? 'safe' : 'info'
                }
              >
                {completedStepsForCurrent} / {currentProtocol.steps.length} Langkah Dicentang
              </StatusBadge>
              <button
                type="button"
                onClick={handleCheckAllCurrentDevice}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline"
              >
                Centang Semua
              </button>
            </div>
          </div>

          {/* Prinsip Kecepatan Tarikan Napas */}
          <div className="mb-4 p-3.5 rounded-xl bg-teal-50/90 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs sm:text-sm text-teal-950">
              <strong className="font-bold">Kunci Aliran Inspirasi Alat Ini:</strong>{' '}
              {currentProtocol.inspiratoryFlowRule}
            </div>
          </div>

          {/* Step-by-Step Accordion */}
          <div className="space-y-2.5">
            {currentProtocol.steps.map((step) => {
              const isOpen = openStepNumber === step.stepNumber;
              const isChecked = Boolean(
                checkedSteps[`${selectedDeviceId}__${step.stepNumber}`]
              );
              return (
                <div
                  key={step.stepNumber}
                  className={`rounded-xl border transition-colors ${
                    isChecked
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : isOpen
                      ? 'bg-white border-teal-500 ring-1 ring-teal-500/20'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="p-3.5 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenStepNumber(isOpen ? 0 : step.stepNumber)
                      }
                      className="flex items-center gap-3 text-left flex-1"
                    >
                      <span
                        className={`w-7 h-7 rounded-full text-xs font-extrabold flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-emerald-600 text-white'
                            : isOpen
                            ? 'bg-teal-700 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {step.stepNumber}
                      </span>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block">
                          {step.phase}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {step.title}
                        </h4>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-teal-400">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleStepCheck(step.stepNumber)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Selesai</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenStepNumber(isOpen ? 0 : step.stepNumber)
                        }
                        className="p-1 text-slate-500 hover:text-slate-800"
                        aria-label="Buka atau tutup detail langkah"
                      >
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-2.5">
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                        {step.instruction}
                      </p>
                      <div className="p-2.5 rounded-lg bg-slate-100/90 border border-slate-200 text-xs text-slate-700">
                        <strong className="text-slate-900">Alasan Farmasi Klinis:</strong>{' '}
                        {step.clinicalWhy}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Kolom Kanan: Timer Tahan Napas 10 Detik & Kesalahan Umum */}
        <div className="space-y-6">
          {/* Interactive 10-Second Breath-Hold Timer */}
          <Card className="bg-slate-900 text-white border-slate-800">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Pemandu Tahan Napas ({currentProtocol.breathHoldSeconds} Detik)
                </h3>
                <p className="text-xs text-slate-300">
                  Bantu hitung waktu tahan napas setelah menghirup obat
                </p>
              </div>
            </div>

            <div className="my-4 p-4 rounded-xl bg-slate-800/90 border border-slate-700 text-center">
              <div className="text-4xl font-extrabold font-mono tracking-tight text-teal-300">
                00:{String(timerSeconds).padStart(2, '0')}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {timerCompleted
                  ? 'Selesai! Hembuskan napas perlahan melalui hidung.'
                  : isTimerRunning
                  ? 'Tahan napas... biarkan partikel obat mengendap di paru.'
                  : 'Tekan Mulai tepat setelah selesai menarik napas dalam.'}
              </p>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-teal-400 transition-all duration-500"
                  style={{
                    width: `${
                      ((currentProtocol.breathHoldSeconds - timerSeconds) /
                        currentProtocol.breathHoldSeconds) *
                      100
                    }%`
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartBreathTimer}
                disabled={isTimerRunning}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                {isTimerRunning ? 'Menghitung...' : 'Mulai Tahan Napas 10d'}
              </button>
              <button
                type="button"
                onClick={handleResetBreathTimer}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </Card>

          {/* Peringatan Kesalahan Kritis & Kumur Mulut */}
          <Card>
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-2.5">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
              <h4>Kesalahan Kritis yang Wajib Dihindari</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 list-disc pl-4">
              {currentProtocol.commonMistakes.map((mistake, idx) => (
                <li key={idx} className="leading-relaxed">
                  {mistake}
                </li>
              ))}
            </ul>

            <div className="mt-4 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 flex items-start gap-2">
              <Droplets className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5">
                  Pencegahan Sariawan / Jamur Mulut:
                </strong>
                {currentProtocol.requiresMouthRinseNote}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Panel Konfirmasi Wajib Sebelum Menyelesaikan Log Harian */}
      <Card
        className={`border-2 transition-colors ${
          todayValidation.confirmed
            ? 'border-emerald-500 bg-emerald-50/40'
            : 'border-teal-600 bg-white'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded-xl shrink-0 ${
                todayValidation.confirmed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Validasi Kepatuhan Teknik Penggunaan Alat Hirup ({formatDateID(todayISO)})
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {todayValidation.confirmed ? (
                  <>
                    Anda telah mengonfirmasi teknik inhalasi yang benar hari ini pada pukul{' '}
                    <strong className="text-emerald-800">{todayValidation.confirmedAt}</strong>. Status ini otomatis tercatat pada Log Harian dan Laporan 30 Hari.
                  </>
                ) : (
                  'Tekan tombol konfirmasi di samping setelah Anda memahami dan mempraktikkan urutan penggunaan alat hirup dengan benar hari ini.'
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleConfirmButton}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all ${
                todayValidation.confirmed
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  : 'bg-teal-700 hover:bg-teal-800 text-white ring-4 ring-teal-600/20'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Saya Mengerti & Telah Melakukan Teknik yang Benar</span>
            </button>

            {todayValidation.confirmed && (
              <button
                type="button"
                onClick={() => onNavigateTab('log')}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold bg-white text-slate-800 border border-slate-300 hover:bg-slate-100"
              >
                Lanjut ke Log Harian
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
