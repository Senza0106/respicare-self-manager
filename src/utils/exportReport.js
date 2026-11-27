import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function getSessionMetadata(customMeta = {}) {
  let storedUser = {};
  let storedPatients = [];
  let storedSchedules = [];

  try {
    storedUser = JSON.parse(localStorage.getItem('respicare_current_user') || localStorage.getItem('respicare_user') || '{}') || {};
  } catch {}
  try {
    storedPatients = JSON.parse(localStorage.getItem('respicare_patients') || '[]') || [];
  } catch {}
  try {
    storedSchedules = JSON.parse(localStorage.getItem('respicare_schedules') || localStorage.getItem('schedules') || '[]') || [];
  } catch {}

  const roleRaw = (customMeta.role || storedUser.role || 'pasien').toString().toLowerCase();
  const isCaregiver = roleRaw.includes('pendamping') || roleRaw.includes('caregiver');

  const rmCode =
    customMeta.rmCode ||
    storedUser.rmCode ||
    storedUser.noRM ||
    storedUser.medicalRecordNumber ||
    storedUser.patientRmCode ||
    'RM-2026-001';

  let patientName = customMeta.patientName || '';
  if (!patientName) {
    if (isCaregiver && Array.isArray(storedPatients) && storedPatients.length > 0) {
      const matched = storedPatients.find((p) => (p.rmCode || p.noRM) === rmCode) || storedPatients[0];
      patientName = matched?.name || matched?.nama || storedUser.patientName || 'Pasien Terpantau';
    } else {
      patientName = storedUser.name || storedUser.nama || 'Pasien RespiCare';
    }
  }

  const caregiverName = isCaregiver ? (storedUser.name || storedUser.nama || 'Pendamping Keluarga') : '-';
  const printedAt = new Date().toLocaleString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';

  return {
    patientName,
    rmCode,
    roleLabel: isCaregiver ? `Pendamping (${caregiverName})` : 'Pasien Mandiri',
    isCaregiver,
    printedAt,
    schedules: Array.isArray(customMeta.schedules) && customMeta.schedules.length > 0 ? customMeta.schedules : storedSchedules,
  };
}

function extractReportRows(customRows = []) {
  if (Array.isArray(customRows) && customRows.length > 0) {
    return customRows.map((r) => ({
      tanggal: r.tanggal || r.dateLabel || r.date || '-',
      totalJadwal: typeof r.totalJadwal === 'number' ? `${r.totalJadwal} jadwal` : (r.totalJadwal || `${r.total || 0} jadwal`),
      tepatWaktu: Number(r.tepatWaktu ?? r.onTime ?? r.completed ?? 0),
      terlewat: Number(r.terlewat ?? r.missed ?? 0),
      persentase: typeof r.persentase === 'string' ? r.persentase : `${Number(r.persentase ?? r.percentage ?? 0)}%`,
    }));
  }

  // Fallback: baca langsung baris tabel yang sedang tampil di layar
  const tableRows = Array.from(document.querySelectorAll('table tbody tr'));
  const extracted = [];
  for (const tr of tableRows) {
    const cells = Array.from(tr.querySelectorAll('td')).map((td) =>
      td.innerText.replace(/\s+/g, ' ').trim()
    );
    if (cells.length >= 5) {
      extracted.push({
        tanggal: cells[0] || '-',
        totalJadwal: cells[1] || '0 jadwal',
        tepatWaktu: Number(cells[2]) || 0,
        terlewat: Number(cells[3]) || 0,
        persentase: cells[4] || '0%',
      });
    }
  }
  return extracted;
}

function computeSummary(rows) {
  let totalSchedules = 0;
  let totalOnTime = 0;
  let totalMissed = 0;

  for (const r of rows) {
    const numTotal = parseInt(String(r.totalJadwal).replace(/\D/g, ''), 10) || (r.tepatWaktu + r.terlewat);
    totalSchedules += numTotal;
    totalOnTime += Number(r.tepatWaktu) || 0;
    totalMissed += Number(r.terlewat) || 0;
  }

  const avgRate = totalSchedules > 0 ? Math.round((totalOnTime / totalSchedules) * 100) : 0;
  return { totalSchedules, totalOnTime, totalMissed, avgRate };
}

export function exportReportToExcel(options = {}) {
  const meta = getSessionMetadata(options);
  const rows = extractReportRows(options.rows);
  const summary = computeSummary(rows);

  const wb = XLSX.utils.book_new();

  // Sheet 1: Rekapitulasi Kepatuhan Harian
  const sheetData = [
    ['LAPORAN KEPATUHAN TERAPI PERNAPASAN - RESPICARE'],
    ['Sistem Manajemen Terapi & Monitoring Kepatuhan Obat'],
    [],
    ['Nama Pasien', meta.patientName, '', 'Total Jadwal Terpantau', summary.totalSchedules],
    ['No. Rekam Medis (RM)', meta.rmCode, '', 'Dosis Tepat Waktu', summary.totalOnTime],
    ['Dicetak Oleh', meta.roleLabel, '', 'Dosis Terlewat', summary.totalMissed],
    ['Waktu Cetak', meta.printedAt, '', 'Rata-rata Kepatuhan', `${summary.avgRate}%`],
    [],
    ['NO', 'TANGGAL', 'TOTAL JADWAL', 'TEPAT WAKTU', 'TERLEWAT', 'PERSENTASE KEPATUHAN', 'STATUS EVALUASI'],
  ];

  if (rows.length === 0) {
    sheetData.push([1, 'Belum ada riwayat kepatuhan tercatat', '0 jadwal', 0, 0, '0%', '-']);
  } else {
    rows.forEach((r, idx) => {
      const pctNum = parseInt(String(r.persentase).replace(/\D/g, ''), 10) || 0;
      const status = pctNum >= 80 ? 'Sangat Patuh' : pctNum >= 50 ? 'Perlu Pemantauan' : 'Kurang Patuh';
      sheetData.push([idx + 1, r.tanggal, r.totalJadwal, r.tepatWaktu, r.terlewat, r.persentase, status]);
    });
  }

  const wsMain = XLSX.utils.aoa_to_sheet(sheetData);
  wsMain['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 22 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMain, 'Rekap Kepatuhan');

  // Sheet 2: Rincian Jadwal Obat Terapi (jika tersedia)
  if (Array.isArray(meta.schedules) && meta.schedules.length > 0) {
    const schedData = [
      ['DAFTAR JADWAL OBAT & TERAPI PERNAPASAN AKTIF'],
      [`Pasien: ${meta.patientName} (${meta.rmCode})`],
      [],
      ['NO', 'NAMA OBAT / SEDIAAN', 'BENTUK SEDIAAN', 'WAKTU MINUM', 'DOSIS / TAKARAN', 'STATUS HARI INI'],
    ];

    meta.schedules.forEach((s, idx) => {
      schedData.push([
        idx + 1,
        s.name || s.medicineName || s.namaObat || '-',
        s.form || s.type || s.sediaan || 'Inhaler / Oral',
        s.time || s.waktu || '-',
        s.dose || s.dosage || s.dosis || '-',
        s.taken || s.completed || s.status === 'taken' ? 'Sudah Diminum' : 'Belum / Terjadwal',
      ]);
    });

    const wsSched = XLSX.utils.aoa_to_sheet(schedData);
    wsSched['!cols'] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 18 },
      { wch: 16 },
      { wch: 18 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, wsSched, 'Jadwal Obat');
  }

  const safeRm = String(meta.rmCode).replace(/[^a-zA-Z0-9-_]/g, '_');
  const dateStamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Laporan_Kepatuhan_RespiCare_${safeRm}_${dateStamp}.xlsx`);
}

export function exportReportToPDF(options = {}) {
  const meta = getSessionMetadata(options);
  const rows = extractReportRows(options.rows);
  const summary = computeSummary(rows);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner Medis RespiCare
  doc.setFillColor(14, 116, 144); // Cyan-700
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RESPICARE', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Laporan Rekapitulasi Kepatuhan Terapi Pernapasan & Inhalasi', 14, 20);
  doc.setFontSize(8.5);
  doc.text(`Dicetak: ${meta.printedAt}`, 14, 26);

  // Kotak Identitas Pasien
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 36, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('IDENTITAS PASIEN & SESI LAPORAN', 18, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Nama Pasien : ${meta.patientName}`, 18, 48.5);
  doc.text(`No. Rekam Medis : ${meta.rmCode}`, 18, 54.5);
  doc.text(`Peran Pencetak : ${meta.roleLabel}`, 110, 48.5);
  doc.text(`Tingkat Kepatuhan : ${summary.avgRate}% (${summary.totalOnTime}/${summary.totalSchedules} dosis)`, 110, 54.5);

  // 4 Kartu Ringkasan Statistik
  const cardW = (pageWidth - 28 - 9) / 4;
  const kpis = [
    { label: 'TOTAL JADWAL', val: `${summary.totalSchedules}`, color: [30, 41, 59] },
    { label: 'TEPAT WAKTU', val: `${summary.totalOnTime}`, color: [5, 150, 105] },
    { label: 'TERLEWAT', val: `${summary.totalMissed}`, color: [217, 119, 6] },
    { label: 'PERSENTASE', val: `${summary.avgRate}%`, color: [2, 132, 199] },
  ];

  kpis.forEach((kpi, i) => {
    const x = 14 + i * (cardW + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x, 65, cardW, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + cardW / 2, 71, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(...kpi.color);
    doc.text(kpi.val, x + cardW / 2, 79, { align: 'center' });
  });

  // Tabel Riwayat Kepatuhan Harian
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Riwayat Kepatuhan Terapi Harian', 14, 93);

  const tableBody =
    rows.length > 0
      ? rows.map((r, idx) => [idx + 1, r.tanggal, r.totalJadwal, r.tepatWaktu, r.terlewat, r.persentase])
      : [['-', 'Belum ada data kepatuhan tercatat', '0 jadwal', 0, 0, '0%']];

  autoTable(doc, {
    startY: 96,
    head: [['No', 'Tanggal', 'Total Jadwal', 'Tepat Waktu', 'Terlewat', 'Persentase']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'left', fontStyle: 'bold' },
      2: { halign: 'center' },
      3: { halign: 'center', textColor: [5, 150, 105], fontStyle: 'bold' },
      4: { halign: 'center', textColor: [217, 119, 6], fontStyle: 'bold' },
      5: { halign: 'center', textColor: [2, 132, 199], fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  let finalY = (doc.lastAutoTable?.finalY || 130) + 10;

  // Tabel Rincian Jadwal Obat jika ada
  if (Array.isArray(meta.schedules) && meta.schedules.length > 0) {
    if (finalY > 235) {
      doc.addPage();
      finalY = 20;
    }
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Daftar Sediaan & Jadwal Terapi Pasien', 14, finalY);

    autoTable(doc, {
      startY: finalY + 3,
      head: [['No', 'Nama Obat / Sediaan', 'Bentuk', 'Waktu', 'Dosis']],
      body: meta.schedules.map((s, idx) => [
        idx + 1,
        s.name || s.medicineName || s.namaObat || '-',
        s.form || s.type || s.sediaan || 'Inhaler/Oral',
        s.time || s.waktu || '-',
        s.dose || s.dosage || s.dosis || '-',
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [14, 116, 144],
        textColor: [255, 255, 255],
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [30, 41, 59],
      },
    });
    finalY = (doc.lastAutoTable?.finalY || finalY) + 12;
  }

  // Blok Catatan & Validasi
  if (finalY > 255) {
    doc.addPage();
    finalY = 20;
  }
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Catatan: Dokumen ini dihasilkan otomatis oleh sistem RespiCare sebagai rekapitulasi kepatuhan terapi pasien untuk evaluasi pendamping & tenaga kefarmasian.',
    14,
    finalY,
    { maxWidth: pageWidth - 28 }
  );

  const safeRm = String(meta.rmCode).replace(/[^a-zA-Z0-9-_]/g, '_');
  const dateStamp = new Date().toISOString().slice(0, 10);
  doc.save(`Laporan_Kepatuhan_RespiCare_${safeRm}_${dateStamp}.pdf`);
}