import { getLocalDateISO, getPastDatesISO, formatDateID } from './storage.js';

/**
 * Konversi string jam "HH:mm" menjadi menit sejak 00:00
 */
export function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

/**
 * Deteksi otomatis benturan jadwal, interval antar dosis terlalu rapat,
 * atau dosis harian yang melewati batas aman maksimum.
 */
export function analyzeMedicationScheduleSafety(medications = []) {
  const warnings = [];

  // 1. Periksa batas aman tiap obat (interval minimum & dosis maksimum harian)
  medications.forEach((med) => {
    const times = Array.isArray(med.scheduledTimes) ? [...med.scheduledTimes].sort() : [];
    const dosePerAdmin = Number(med.dosePerAdmin) || 1;
    const totalDailyDose = times.length * dosePerAdmin;
    const maxDailyDose = Number(med.maxDailyDose) || 999;
    const minIntervalHours = Number(med.minIntervalHours) || 0;

    if (totalDailyDose > maxDailyDose) {
      warnings.push({
        id: `max-dose-${med.id}`,
        severity: 'critical',
        title: `Melewati Batas Dosis Aman Harian: ${med.name}`,
        message: `Total dosis terjadwal (${totalDailyDose} ${med.unitLabel}/hari) melebihi batas aman maksimal (${maxDailyDose} ${med.unitLabel}/hari). Risiko efek samping sistemik meningkat (takikardia, tremor, atau toksisitas dosis).`,
        medicationIds: [med.id]
      });
    }

    if (times.length > 1 && minIntervalHours > 0) {
      for (let i = 0; i < times.length - 1; i++) {
        const diffMinutes = timeToMinutes(times[i + 1]) - timeToMinutes(times[i]);
        const diffHours = diffMinutes / 60;
        if (diffHours < minIntervalHours) {
          warnings.push({
            id: `interval-short-${med.id}-${times[i]}-${times[i + 1]}`,
            severity: 'critical',
            title: `Jeda Antar Dosis Terlalu Dekat: ${med.name}`,
            message: `Jadwal pukul ${times[i]} dan ${times[i + 1]} hanya berjarak ${diffHours.toFixed(1)} jam, kurang dari batas aman minimal ${minIntervalHours} jam untuk sediaan ini.`,
            medicationIds: [med.id]
          });
        }
      }
    }
  });

  // 2. Periksa benturan antar obat yang berbeda pada waktu yang sama / berdekatan (<15 menit)
  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const medA = medications[i];
      const medB = medications[j];
      const timesA = Array.isArray(medA.scheduledTimes) ? medA.scheduledTimes : [];
      const timesB = Array.isArray(medB.scheduledTimes) ? medB.scheduledTimes : [];

      timesA.forEach((tA) => {
        timesB.forEach((tB) => {
          const diffMin = Math.abs(timeToMinutes(tA) - timeToMinutes(tB));
          if (diffMin <= 10) {
            const isInhalerPair =
              ['MDI', 'DPI', 'SMI'].includes(medA.form) &&
              ['MDI', 'DPI', 'SMI'].includes(medB.form);

            const hasRelieverAndSteroid =
              (medA.category === 'Reliever' && medB.containsCorticosteroid) ||
              (medB.category === 'Reliever' && medA.containsCorticosteroid);

            if (hasRelieverAndSteroid) {
              warnings.push({
                id: `clash-seq-${medA.id}-${medB.id}-${tA}`,
                severity: 'warning',
                title: `Benturan Jadwal Inhaler (${tA} & ${tB}): Urutan Pemberian Penting`,
                message: `${medA.name} dan ${medB.name} dijadwalkan berdekatan. Secara farmasi klinis, hirup bronkodilator pelega (SABA) 10–15 menit lebih dahulu untuk membuka bronkus sebelum menghirup kortikosteroid pengontrol.`,
                medicationIds: [medA.id, medB.id]
              });
            } else if (isInhalerPair && diffMin === 0) {
              warnings.push({
                id: `clash-inhaler-${medA.id}-${medB.id}-${tA}`,
                severity: 'info',
                title: `Jadwal Inhaler Bersamaan pada Pukul ${tA}`,
                message: `${medA.name} dan ${medB.name} dijadwalkan pada jam yang sama (${tA}). Beri jeda minimal 5 menit antar kedua jenis inhaler dan kumur mulut di akhir sesi.`,
                medicationIds: [medA.id, medB.id]
              });
            }
          }
        });
      });
    }
  }

  return warnings;
}

/**
 * Kalkulator stok tersisa, estimasi hari habis, dan batas kedaluwarsa / Beyond Use Date (BUD)
 */
export function calculateRefillAndBUD(med) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const timesCount = Array.isArray(med.scheduledTimes) && med.scheduledTimes.length > 0
    ? med.scheduledTimes.length
    : Number(med.frequencyPerDay) || 1;
  const dosePerAdmin = Number(med.dosePerAdmin) || 1;
  const dailyUsage = Math.max(0.5, timesCount * dosePerAdmin);

  const totalUnits = Math.max(1, Number(med.totalUnits) || 100);
  const remainingUnits = Math.max(0, Number(med.remainingUnits) || 0);
  const stockPercentage = Math.min(100, Math.round((remainingUnits / totalUnits) * 100));

  const remainingDaysRaw = remainingUnits / dailyUsage;
  const remainingDays = Math.round(remainingDaysRaw * 10) / 10;

  const runOutDateObj = new Date(today);
  runOutDateObj.setDate(today.getDate() + Math.floor(remainingDaysRaw));
  const estimatedRunOutDate = getLocalDateISO(runOutDateObj);

  // Perhitungan Beyond Use Date (BUD) sejak tanggal dibuka/direkonstitusi
  let budExpiryDate = null;
  let daysUntilBUD = null;
  if (med.openedDate && med.budDaysAfterOpen) {
    const [oy, om, od] = med.openedDate.split('-').map(Number);
    const openedObj = new Date(oy, om - 1, od);
    if (!Number.isNaN(openedObj.getTime())) {
      const budObj = new Date(openedObj);
      budObj.setDate(openedObj.getDate() + Number(med.budDaysAfterOpen));
      budExpiryDate = getLocalDateISO(budObj);
      daysUntilBUD = Math.round((budObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  // Perhitungan Expiry Date (ED) kemasan pabrik
  let daysUntilExpiry = null;
  if (med.expiryDate) {
    const [ey, em, ed] = med.expiryDate.split('-').map(Number);
    const expObj = new Date(ey, em - 1, ed);
    if (!Number.isNaN(expObj.getTime())) {
      daysUntilExpiry = Math.round((expObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  const isBudExpired = daysUntilBUD !== null && daysUntilBUD < 0;
  const isBudWarning = daysUntilBUD !== null && daysUntilBUD >= 0 && daysUntilBUD <= 5;
  const isManufacturerExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
  const isLowStockCritical = remainingDays <= 3;
  const isLowStockWarning = remainingDays > 3 && remainingDays <= 7;

  const statusReasons = [];
  if (isBudExpired) {
    statusReasons.push(
      `Melewati batas Beyond Use Date (BUD) ${Math.abs(daysUntilBUD)} hari lalu (${formatDateID(budExpiryDate)})`
    );
  }
  if (isManufacturerExpired) {
    statusReasons.push(`Melewati tanggal kedaluwarsa kemasan (${formatDateID(med.expiryDate)})`);
  }
  if (isLowStockCritical) {
    statusReasons.push(
      `Stok kritis: cukup untuk ${remainingDays} hari ke depan (<= 3 hari)`
    );
  } else if (isLowStockWarning) {
    statusReasons.push(`Stok menipis: estimasi cukup untuk ${remainingDays} hari`);
  }
  if (isBudWarning && !isBudExpired) {
    statusReasons.push(`Mendekati batas BUD dalam ${daysUntilBUD} hari (${formatDateID(budExpiryDate)})`);
  }

  let overallStatus = 'safe';
  if (isBudExpired || isManufacturerExpired || isLowStockCritical) {
    overallStatus = 'critical';
  } else if (isLowStockWarning || isBudWarning) {
    overallStatus = 'warning';
  }

  return {
    dailyUsage,
    totalUnits,
    remainingUnits,
    stockPercentage,
    remainingDays,
    estimatedRunOutDate,
    budExpiryDate,
    daysUntilBUD,
    daysUntilExpiry,
    isBudExpired,
    isBudWarning,
    isManufacturerExpired,
    isLowStockCritical,
    isLowStockWarning,
    overallStatus,
    statusReasons
  };
}

/**
 * Evaluasi komprehensif kepatuhan dosis & kontrol gejala selama N hari terakhir (7 atau 30 hari)
 */
export function calculateAdherenceAndControlSummary(
  medications = [],
  doseLogs = {},
  symptomLogs = [],
  techniqueValidations = {},
  daysCount = 30
) {
  const dateRange = getPastDatesISO(daysCount);
  const symptomByDate = {};
  symptomLogs.forEach((entry) => {
    if (entry && entry.date) {
      symptomByDate[entry.date] = entry;
    }
  });

  // Hitung total slot jadwal per hari dari obat aktif
  const dailySlots = [];
  medications.forEach((med) => {
    const times = Array.isArray(med.scheduledTimes) ? med.scheduledTimes : [];
    times.forEach((t) => {
      dailySlots.push({ key: `${med.id}__${t}`, medId: med.id, time: t });
    });
  });

  let totalScheduledTracked = 0;
  let totalTakenTracked = 0;
  let activeDaysCount = 0;
  let techniqueVerifiedDays = 0;

  const dailySeries = dateRange.map((dateISO) => {
    const dayLog = doseLogs[dateISO] || {};
    const symptomEntry = symptomByDate[dateISO] || null;
    const techEntry = techniqueValidations[dateISO] || null;

    const scheduledCount = dailySlots.length;
    let takenCount = 0;

    dailySlots.forEach((slot) => {
      if (dayLog[slot.key]?.taken) {
        takenCount += 1;
      }
    });

    // Selain slot saat ini, hitung juga log historis yang tersimpan pada tanggal tsb
    const rawKeys = Object.keys(dayLog);
    const effectiveTaken =
      takenCount > 0
        ? takenCount
        : rawKeys.filter((k) => dayLog[k]?.taken).length;
    const effectiveScheduled =
      scheduledCount > 0 ? scheduledCount : Math.max(rawKeys.length, 1);

    const hasAnyRecord =
      rawKeys.length > 0 || symptomEntry !== null || Boolean(techEntry?.confirmed);

    if (hasAnyRecord) {
      activeDaysCount += 1;
      totalScheduledTracked += effectiveScheduled;
      totalTakenTracked += Math.min(effectiveScheduled, effectiveTaken);
      if (techEntry?.confirmed || symptomEntry?.techniqueConfirmed) {
        techniqueVerifiedDays += 1;
      }
    }

    const adherencePct = hasAnyRecord
      ? Math.min(100, Math.round((effectiveTaken / effectiveScheduled) * 100))
      : null;

    return {
      date: dateISO,
      scheduledCount: effectiveScheduled,
      takenCount: effectiveTaken,
      adherencePct,
      hasAnyRecord,
      symptomEntry,
      techniqueConfirmed: Boolean(techEntry?.confirmed || symptomEntry?.techniqueConfirmed)
    };
  });

  const overallAdherencePct =
    totalScheduledTracked > 0
      ? Math.round((totalTakenTracked / totalScheduledTracked) * 100)
      : 0;

  const loggedSymptomsInPeriod = dailySeries
    .map((d) => d.symptomEntry)
    .filter(Boolean);

  const symptomFreeDaysCount = loggedSymptomsInPeriod.filter(
    (s) => Number(s.dyspneaScore) === 0 && s.nightCough === 'none' && Number(s.rescuePuffsUsed) === 0
  ).length;

  const symptomFreePct =
    loggedSymptomsInPeriod.length > 0
      ? Math.round((symptomFreeDaysCount / loggedSymptomsInPeriod.length) * 100)
      : 0;

  const totalRescuePuffs = loggedSymptomsInPeriod.reduce(
    (acc, s) => acc + (Number(s.rescuePuffsUsed) || 0),
    0
  );

  const nightAwakeningDays = loggedSymptomsInPeriod.filter(
    (s) => s.nightCough && s.nightCough !== 'none'
  ).length;

  const moderateSevereDyspneaDays = loggedSymptomsInPeriod.filter(
    (s) => Number(s.dyspneaScore) >= 2
  ).length;

  const pefReadings = loggedSymptomsInPeriod
    .map((s) => Number(s.pefValue))
    .filter((v) => v > 0);
  const averagePEF =
    pefReadings.length > 0
      ? Math.round(pefReadings.reduce((a, b) => a + b, 0) / pefReadings.length)
      : null;

  const sideEffectMap = {};
  const triggerMap = {};
  loggedSymptomsInPeriod.forEach((s) => {
    (s.sideEffects || []).forEach((ef) => {
      if (ef && ef !== 'Tidak ada keluhan') {
        sideEffectMap[ef] = (sideEffectMap[ef] || 0) + 1;
      }
    });
    (s.triggers || []).forEach((tr) => {
      if (tr) {
        triggerMap[tr] = (triggerMap[tr] || 0) + 1;
      }
    });
  });

  const techniqueVerifiedDaysPct =
    activeDaysCount > 0
      ? Math.round((techniqueVerifiedDays / activeDaysCount) * 100)
      : 0;

  // Klasifikasi Kontrol Gejala berbasis kriteria klinis GINA / GOLD
  let riskPoints = 0;
  if (nightAwakeningDays >= 2) riskPoints += 1;
  if (totalRescuePuffs > 8) riskPoints += 1;
  if (moderateSevereDyspneaDays >= 2) riskPoints += 1;
  if (overallAdherencePct < 75) riskPoints += 1;

  let controlClassification = {
    level: 'Terkontrol Baik',
    badgeColor: 'emerald',
    clinicalSummary:
      'Kepatuhan dosis pengontrol terjaga baik dan gejala harian minimal. Pertahankan teknik inhalasi dan kumur mulut rutin setelah penggunaan steroid inhalasi.'
  };

  if (riskPoints === 1 || riskPoints === 2) {
    controlClassification = {
      level: 'Terkontrol Sebagian',
      badgeColor: 'amber',
      clinicalSummary:
        'Ditemukan episode gejala malam hari atau penggunaan pelega darurat berkala. Evaluasi kepatuhan jadwal dosis malam dan pastikan teknik menahan napas 10 detik dilakukan dengan benar.'
    };
  } else if (riskPoints >= 3) {
    controlClassification = {
      level: 'Tidak Terkontrol (Perlu Evaluasi Dokter)',
      badgeColor: 'rose',
      clinicalSummary:
        'Frekuensi sesak napas, terbangun malam, atau pemakaian pelega tinggi. Bawa laporan 30 hari ini ke Puskesmas/Dokter Paru untuk evaluasi step-up terapi atau koreksi alat hirup.'
    };
  }

  return {
    daysCount,
    dailySeries,
    activeDaysCount,
    totalScheduledTracked,
    totalTakenTracked,
    overallAdherencePct,
    loggedSymptomsCount: loggedSymptomsInPeriod.length,
    symptomFreeDaysCount,
    symptomFreePct,
    totalRescuePuffs,
    nightAwakeningDays,
    moderateSevereDyspneaDays,
    averagePEF,
    sideEffectMap,
    triggerMap,
    techniqueVerifiedDays,
    techniqueVerifiedDaysPct,
    controlClassification
  };
}

/**
 * Bunyi alarm klinis lembut menggunakan Web Audio API (tanpa aset eksternal)
 */
export function playClinicalAlarmChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99]; // C5 - E5 - G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.16);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + idx * 0.16 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.16 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.16);
      osc.stop(ctx.currentTime + idx * 0.16 + 0.36);
    });
  } catch {
    // Abaikan jika browser memblokir autoplay audio sebelum interaksi
  }
}
