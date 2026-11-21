import React, { useState, useMemo } from 'react';
import {
  Clock,
  Bell,
  BellRing,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Edit3,
  X,
  Wind,
  Droplets
} from 'lucide-react';
import { Card, CardHeader, StatusBadge, ClinicalAlert } from './Card.jsx';
import { MEDICATION_PRESETS } from '../data/clinicalDefaults.js';
import { analyzeMedicationScheduleSafety, playClinicalAlarmChime } from '../utils/clinicalEngine.js';
import { getLocalDateISO, formatDateID } from '../utils/storage.js';

const EMPTY_FORM = {
  name: '',
  form: 'MDI',
  deviceType: 'mdi_standard',
  category: 'Controller',
  unitLabel: 'isapan',
  dosePerAdmin: 1,
  frequencyPerDay: 2,
  scheduledTimes: ['07:00', '19:00'],
  minIntervalHours: 8,
  maxDailyDose: 8,
  totalUnits: 120,
  remainingUnits: 120,
  openedDate: getLocalDateISO(),
  budDaysAfterOpen: 90,
  expiryDate: '',
  containsCorticosteroid: false,
  instructions: ''
};

export default function Scheduler({
  medications,
  onUpdateMedications,
  doseLogs,
  onToggleDoseSlot,
  techniqueConfirmedToday,
  onNavigateTab,
  notificationPrefs,
  onUpdateNotificationPrefs,
  onTriggerTestNotification
}) {
  const todayISO = getLocalDateISO();
  const todayLog = doseLogs[todayISO] || {};

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Analisis keamanan & benturan jadwal secara real-time
  const scheduleWarnings = useMemo(
    () => analyzeMedicationScheduleSafety(medications),
    [medications]
  );

  // Susun daftar slot jadwal harian secara kronologis
  const chronologicalSlots = useMemo(() => {
    const slots = [];
    medications.forEach((med) => {
      const times = Array.isArray(med.scheduledTimes) ? med.scheduledTimes : [];
      times.forEach((timeStr) => {
        const slotKey = `${med.id}__${timeStr}`;
        const logEntry = todayLog[slotKey] || { taken: false, takenAt: null };
        slots.push({
          slotKey,
          time: timeStr,
          med,
          taken: Boolean(logEntry.taken),
          takenAt: logEntry.takenAt,
          techniqueVerified: Boolean(logEntry.techniqueVerified)
        });
      });
    });
    return slots.sort((a, b) => a.time.localeCompare(b.time));
  }, [medications, todayLog]);

  const completedCount = chronologicalSlots.filter((s) => s.taken).length;
  const totalSlotsCount = chronologicalSlots.length;

  // Fungsi koreksi cepat jika ada benturan jadwal SABA + ICS pada jam yang sama
  const handleAutoResolveClash = () => {
    const updated = medications.map((med) => {
      if (med.category === 'Reliever' && med.scheduledTimes.includes('07:00')) {
        return {
          ...med,
          scheduledTimes: med.scheduledTimes.map((t) => (t === '07:00' ? '06:45' : t))
        };
      }
      return med;
    });
    onUpdateMedications(updated);
  };

  const handleOpenAddForm = () => {
    setEditingId(null);
    const defaultExpiry = new Date();
    defaultExpiry.setMonth(defaultExpiry.getMonth() + 6);
    setFormData({
      ...EMPTY_FORM,
      openedDate: getLocalDateISO(),
      expiryDate: getLocalDateISO(defaultExpiry)
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (med) => {
    setEditingId(med.id);
    setFormData({
      name: med.name || '',
      form: med.form || 'MDI',
      deviceType: med.deviceType || 'mdi_standard',
      category: med.category || 'Controller',
      unitLabel: med.unitLabel || 'isapan',
      dosePerAdmin: med.dosePerAdmin || 1,
      frequencyPerDay: med.scheduledTimes?.length || med.frequencyPerDay || 1,
      scheduledTimes: Array.isArray(med.scheduledTimes) ? [...med.scheduledTimes] : ['07:00'],
      minIntervalHours: med.minIntervalHours ?? 6,
      maxDailyDose: med.maxDailyDose ?? 8,
      totalUnits: med.totalUnits ?? 120,
      remainingUnits: med.remainingUnits ?? 120,
      openedDate: med.openedDate || getLocalDateISO(),
      budDaysAfterOpen: med.budDaysAfterOpen ?? 90,
      expiryDate: med.expiryDate || '',
      containsCorticosteroid: Boolean(med.containsCorticosteroid),
      instructions: med.instructions || ''
    });
    setIsFormOpen(true);
  };

  const handleApplyPreset = (presetIndex) => {
    const preset = MEDICATION_PRESETS[presetIndex];
    if (!preset) return;
    const defaultExpiry = new Date();
    defaultExpiry.setMonth(defaultExpiry.getMonth() + 8);
    setFormData({
      ...EMPTY_FORM,
      ...preset,
      openedDate: getLocalDateISO(),
      expiryDate: getLocalDateISO(defaultExpiry)
    });
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'form') {
        if (value === 'MDI') {
          next.deviceType = 'mdi_standard';
          next.unitLabel = 'isapan';
        } else if (value === 'DPI') {
          next.deviceType = 'dpi_turbuhaler';
          next.unitLabel = 'isapan';
        } else if (value === 'SMI') {
          next.deviceType = 'smi_respimat';
          next.unitLabel = 'semprotan';
        } else if (value === 'Sirup Rekonstitusi') {
          next.deviceType = null;
          next.unitLabel = 'mL';
          next.budDaysAfterOpen = 14;
        } else if (value === 'Sirup Oral') {
          next.deviceType = null;
          next.unitLabel = 'mL';
          next.budDaysAfterOpen = 60;
        } else if (value === 'Tablet Oral') {
          next.deviceType = null;
          next.unitLabel = 'tablet';
          next.budDaysAfterOpen = 90;
        }
      }
      return next;
    });
  };

  const handleFrequencyChange = (newFreq) => {
    const count = Math.max(1, Math.min(6, Number(newFreq) || 1));
    const defaultSchedules = {
      1: ['08:00'],
      2: ['07:00', '19:00'],
      3: ['07:00', '14:00', '21:00'],
      4: ['06:00', '12:00', '18:00', '22:00'],
      5: ['06:00', '10:00', '14:00', '18:00', '22:00'],
      6: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
    };
    setFormData((prev) => ({
      ...prev,
      frequencyPerDay: count,
      scheduledTimes: defaultSchedules[count] || ['08:00']
    }));
  };

  const handleTimeSlotChange = (idx, newTime) => {
    setFormData((prev) => {
      const updatedTimes = [...prev.scheduledTimes];
      updatedTimes[idx] = newTime;
      return { ...prev, scheduledTimes: updatedTimes };
    });
  };

  const handleSaveMedication = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const cleanMed = {
      id: editingId || `med-${Date.now()}`,
      name: formData.name.trim(),
      form: formData.form,
      deviceType: formData.deviceType,
      category: formData.category,
      unitLabel: formData.unitLabel || 'isapan',
      dosePerAdmin: Math.max(0.5, Number(formData.dosePerAdmin) || 1),
      frequencyPerDay: formData.scheduledTimes.length,
      scheduledTimes: [...formData.scheduledTimes].sort(),
      minIntervalHours: Number(formData.minIntervalHours) || 4,
      maxDailyDose: Number(formData.maxDailyDose) || 8,
      totalUnits: Math.max(1, Number(formData.totalUnits) || 100),
      remainingUnits: Math.max(0, Number(formData.remainingUnits) || 0),
      openedDate: formData.openedDate || getLocalDateISO(),
      budDaysAfterOpen: Number(formData.budDaysAfterOpen) || 90,
      expiryDate: formData.expiryDate || '',
      containsCorticosteroid: Boolean(formData.containsCorticosteroid),
      instructions: formData.instructions.trim()
    };

    if (editingId) {
      onUpdateMedications(medications.map((m) => (m.id === editingId ? cleanMed : m)));
    } else {
      onUpdateMedications([...medications, cleanMed]);
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleDeleteMedication = (id) => {
    onUpdateMedications(medications.filter((m) => m.id !== id));
  };

  const handleRequestBrowserNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      onUpdateNotificationPrefs({
        ...notificationPrefs,
        enabled: true,
        permissionStatus: 'unsupported'
      });
      playClinicalAlarmChime();
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      onUpdateNotificationPrefs({
        ...notificationPrefs,
        enabled: perm === 'granted',
        permissionStatus: perm
      });
      if (perm === 'granted') {
        onTriggerTestNotification();
      }
    } catch {
      onUpdateNotificationPrefs({
        ...notificationPrefs,
        enabled: true
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Peringatan Keamanan & Sinkronisasi Jadwal Otomatis */}
      {scheduleWarnings.length > 0 && (
        <div className="space-y-3">
          {scheduleWarnings.map((warn) => (
            <ClinicalAlert
              key={warn.id}
              severity={warn.severity}
              title={warn.title}
              message={warn.message}
              action={
                warn.id.startsWith('clash-seq-') ? (
                  <button
                    type="button"
                    onClick={handleAutoResolveClash}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-800 text-white hover:bg-amber-900 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Sesuaikan Otomatis (-15 Menit)
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      )}

      {/* Panel Kontrol Alarm & Web Notifications API */}
      <Card className="bg-gradient-to-r from-teal-900 to-slate-900 text-white border-teal-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 shrink-0">
              {notificationPrefs.enabled ? (
                <BellRing className="w-6 h-6" />
              ) : (
                <Bell className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Pengingat Dosis & Alarm Browser (Web Notifications API)
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    notificationPrefs.enabled
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {notificationPrefs.enabled ? 'Alarm Aktif' : 'Belum Diaktifkan'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-teal-100/85 mt-1 max-w-2xl">
                Sistem memantau jadwal hirup/minum obat secara real-time di perangkat Anda dan mengirimkan notifikasi browser beserta nada pengingat klinis saat tiba waktu dosis.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRequestBrowserNotification}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {notificationPrefs.enabled ? 'Segarkan Izin Notifikasi' : 'Aktifkan Notifikasi Browser'}
            </button>
            <button
              type="button"
              onClick={onTriggerTestNotification}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              <BellRing className="w-4 h-4" />
              Uji Alarm & Notifikasi
            </button>
          </div>
        </div>
      </Card>

      {/* Jadwal Dosis Hari Ini (Kronologis) */}
      <Card>
        <CardHeader
          icon={Clock}
          title={`Jadwal Sinkronisasi Dosis Hari Ini (${formatDateID(todayISO, true)})`}
          subtitle="Centang setiap dosis setelah Anda selesai menggunakan obat. Stok sisa pada tabung/botol akan terpotong otomatis."
          badge={
            <StatusBadge variant={completedCount === totalSlotsCount && totalSlotsCount > 0 ? 'safe' : 'info'}>
              {completedCount} / {totalSlotsCount} Dosis Selesai
            </StatusBadge>
          }
          action={
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Obat Baru
            </button>
          }
        />

        {/* Gatekeeper pengingat validasi teknik inhaler hari ini */}
        {!techniqueConfirmedToday && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-amber-900 text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Validasi Teknik Inhaler Hari Ini Belum Dikonfirmasi.</span>{' '}
                Pastikan Anda mengecek urutan langkah hirup & tahan napas 10 detik agar obat benar-benar mencapai paru-paru.
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('inhaler')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-700 text-white hover:bg-amber-800 shrink-0 transition-colors"
            >
              Buka Validasi Teknik Alat
            </button>
          </div>
        )}

        {chronologicalSlots.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-sm text-slate-600 font-medium">
              Belum ada jadwal obat pernapasan yang terdaftar.
            </p>
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-teal-700 text-white"
            >
              <Plus className="w-4 h-4" />
              Tambah Obat Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {chronologicalSlots.map((slot) => {
              const isInhaler = ['MDI', 'DPI', 'SMI'].includes(slot.med.form);
              return (
                <div
                  key={slot.slotKey}
                  className={`flex flex-col justify-between p-4 rounded-xl border transition-all ${
                    slot.taken
                      ? 'bg-emerald-50/60 border-emerald-300'
                      : 'bg-white border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`px-2.5 py-1.5 rounded-lg text-sm font-extrabold font-mono tracking-tight border ${
                          slot.taken
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-slate-900 text-white border-slate-900'
                        }`}
                      >
                        {slot.time}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {slot.med.form}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              slot.med.category === 'Controller'
                                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                : slot.med.category === 'Reliever'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                            }`}
                          >
                            {slot.med.category === 'Controller'
                              ? 'Pengontrol Rutin'
                              : slot.med.category === 'Reliever'
                              ? 'Pelega (SABA)'
                              : 'Terapi Oral'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                          {slot.med.name}
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Dosis sekali pakai:{' '}
                          <strong className="text-slate-900">
                            {slot.med.dosePerAdmin} {slot.med.unitLabel}
                          </strong>{' '}
                          • Sisa stok: {slot.med.remainingUnits} {slot.med.unitLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  {slot.med.instructions && (
                    <p className="mt-2.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <strong className="text-slate-800">Instruksi Klinis:</strong> {slot.med.instructions}
                    </p>
                  )}

                  <div className="mt-3.5 pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-slate-500">
                      {slot.taken ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Tercatat pukul {slot.takenAt || slot.time}
                          {isInhaler && slot.techniqueVerified && ' • Teknik Tervalidasi'}
                        </span>
                      ) : (
                        <span>Menunggu konfirmasi pemakaian</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleDoseSlot(slot.med, slot.time)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        slot.taken
                          ? 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                          : 'bg-teal-700 text-white hover:bg-teal-800 shadow-sm'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {slot.taken ? 'Batalkan Catatan' : 'Tandai Sudah Digunakan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Form Modal / Panel Tambah & Edit Obat */}
      {isFormOpen && (
        <Card className="border-2 border-teal-600 bg-teal-50/20">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Ubah Data & Jadwal Obat Pernapasan' : 'Tambah Obat Pernapasan Baru'}
              </h3>
              <p className="text-xs text-slate-600">
                Pilih dari daftar template obat standar asma/PPOK atau masukkan sesuai resep dokter Anda.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60"
              aria-label="Tutup form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!editingId && (
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Isi Cepat dari Presets Obat Standar Klinis (Opsional)
              </label>
              <select
                onChange={(e) => handleApplyPreset(Number(e.target.value))}
                defaultValue=""
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-600 focus:outline-none"
              >
                <option value="" disabled>
                  -- Pilih contoh obat inhaler / sirup standar untuk mengisi otomatis --
                </option>
                {MEDICATION_PRESETS.map((preset, idx) => (
                  <option key={preset.name} value={idx}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={handleSaveMedication} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Obat & Kekuatan Dosis *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Contoh: Salbutamol 100 mcg / Symbicort 160/4.5 mcg"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Sediaan *
                </label>
                <select
                  value={formData.form}
                  onChange={(e) => handleFormChange('form', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
                >
                  <option value="MDI">MDI Inhaler (Semprot Aerosol)</option>
                  <option value="DPI">DPI Inhaler (Serbuk Kering / Turbuhaler / Diskus)</option>
                  <option value="SMI">SMI Inhaler (Soft Mist / Respimat)</option>
                  <option value="Sirup Rekonstitusi">Sirup Kering Rekonstitusi (Wajib Pantau BUD)</option>
                  <option value="Sirup Oral">Sirup Oral / Mukolitik Cair</option>
                  <option value="Tablet Oral">Obat Oral (Tablet / Kapsul Minum)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Klasifikasi Terapi
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
                >
                  <option value="Controller">Pengontrol Rutin (Controller)</option>
                  <option value="Reliever">Pelega Pernapasan (Reliever / SABA)</option>
                  <option value="Add-on Oral">Terapi Tambahan Oral / Antibiotik / Mukolitik</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dosis Sekali Pakai & Satuan
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={formData.dosePerAdmin}
                    onChange={(e) => handleFormChange('dosePerAdmin', e.target.value)}
                    className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={formData.unitLabel}
                    onChange={(e) => handleFormChange('unitLabel', e.target.value)}
                    placeholder="isapan / mL / tablet"
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Frekuensi per Hari
                </label>
                <select
                  value={formData.scheduledTimes.length}
                  onChange={(e) => handleFrequencyChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
                >
                  <option value={1}>1x Sehari</option>
                  <option value={2}>2x Sehari (Tiap 12 Jam)</option>
                  <option value={3}>3x Sehari (Tiap 8 Jam)</option>
                  <option value={4}>4x Sehari (Tiap 6 Jam)</option>
                </select>
              </div>
            </div>

            {/* Waktu Pemberian Dosis */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Jam Pemberian Obat (Dapat Disesuaikan)
              </label>
              <div className="flex flex-wrap gap-3">
                {formData.scheduledTimes.map((timeVal, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-500">Dosis #{idx + 1}:</span>
                    <input
                      type="time"
                      required
                      value={timeVal}
                      onChange={(e) => handleTimeSlotChange(idx, e.target.value)}
                      className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-mono focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Parameter Keamanan Dosis & Stok / BUD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jeda Aman Minimal (Jam)
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={formData.minIntervalHours}
                  onChange={(e) => handleFormChange('minIntervalHours', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batas Dosis Maksimal / Hari
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxDailyDose}
                  onChange={(e) => handleFormChange('maxDailyDose', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kapasitas Total Kemasan ({formData.unitLabel})
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalUnits}
                  onChange={(e) => handleFormChange('totalUnits', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sisa Stok Saat Ini ({formData.unitLabel})
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.remainingUnits}
                  onChange={(e) => handleFormChange('remainingUnits', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Dibuka / Rekonstitusi
                </label>
                <input
                  type="date"
                  value={formData.openedDate}
                  onChange={(e) => handleFormChange('openedDate', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batas Simpan / BUD (Hari sejak dibuka)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.budDaysAfterOpen}
                  onChange={(e) => handleFormChange('budDaysAfterOpen', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Kedaluwarsa Pabrik (ED)
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.containsCorticosteroid}
                    onChange={(e) => handleFormChange('containsCorticosteroid', e.target.checked)}
                    className="w-4 h-4 rounded text-teal-700 focus:ring-teal-600"
                  />
                  Mengandung Kortikosteroid (Wajib Kumur)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instruksi Penggunaan Khusus
              </label>
              <input
                type="text"
                value={formData.instructions}
                onChange={(e) => handleFormChange('instructions', e.target.value)}
                placeholder="Contoh: Kumur mulut dengan air bersih setelah menghirup, jangan ditelan."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 shadow-sm"
              >
                {editingId ? 'Simpan Perubahan' : 'Simpan Obat ke Jadwal'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Daftar Regimen Obat Aktif */}
      <Card>
        <CardHeader
          icon={ShieldCheck}
          title="Regimen Obat Pernapasan Aktif"
          subtitle="Daftar seluruh inhaler, nebulizer, dan obat oral yang sedang Anda gunakan beserta parameter batas amannya."
        />

        <div className="space-y-3">
          {medications.map((med) => (
            <div
              key={med.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-900">
                    {['MDI', 'DPI', 'SMI'].includes(med.form) ? (
                      <Wind className="w-3.5 h-3.5" />
                    ) : (
                      <Droplets className="w-3.5 h-3.5" />
                    )}
                    {med.form}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{med.name}</h3>
                  {med.containsCorticosteroid && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                      Steroid • Wajib Kumur Mulut
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600">
                  Jadwal:{' '}
                  <strong className="font-mono text-slate-900">
                    {(med.scheduledTimes || []).join(', ')}
                  </strong>{' '}
                  ({med.dosePerAdmin} {med.unitLabel} setiap kali) • Jeda aman minimal:{' '}
                  <strong>{med.minIntervalHours} jam</strong> • Maks harian:{' '}
                  <strong>
                    {med.maxDailyDose} {med.unitLabel}/hari
                  </strong>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEditForm(med)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Ubah Jadwal
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMedication(med.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
