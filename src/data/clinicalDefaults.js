import { getLocalDateISO } from '../utils/storage.js';

function offsetDateISO(daysDelta) {
  const d = new Date();
  d.setDate(d.getDate() + daysDelta);
  return getLocalDateISO(d);
}

export const DEFAULT_PATIENT_PROFILE = {
  name: 'Bpk. Hendra Wijaya',
  age: 54,
  gender: 'Laki-laki',
  diagnosis: 'Asma Persisten Sedang & PPOK Stabil (GOLD Grup B)',
  personalBestPEF: 420,
  facilityName: 'Poliklinik Paru Puskesmas / RSUD — dr. Rina Kusuma, Sp.P',
  emergencyContact: 'Ibu Sari (Istri) - 0812-3456-7890',
  allergies: 'Debu rumah, udara dingin pagi hari, NSAID (Aspirin)'
};

export const MEDICATION_PRESETS = [
  {
    label: 'Budesonide/Formoterol 160/4.5 mcg (Turbuhaler DPI)',
    name: 'Budesonide/Formoterol 160/4.5 mcg (Symbicort)',
    form: 'DPI',
    deviceType: 'dpi_turbuhaler',
    category: 'Controller',
    unitLabel: 'isapan',
    dosePerAdmin: 1,
    frequencyPerDay: 2,
    scheduledTimes: ['07:00', '19:00'],
    minIntervalHours: 10,
    maxDailyDose: 8,
    totalUnits: 120,
    remainingUnits: 120,
    budDaysAfterOpen: 90,
    containsCorticosteroid: true,
    instructions: 'Wajib berkumur air bersih lalu buang setelah menghirup untuk mencegah jamur mulut (kandidiasis oral) dan suara serak.'
  },
  {
    label: 'Salbutamol Sulfate 100 mcg (Ventolin MDI Inhaler)',
    name: 'Salbutamol Sulfate 100 mcg (Ventolin MDI)',
    form: 'MDI',
    deviceType: 'mdi_standard',
    category: 'Reliever',
    unitLabel: 'isapan',
    dosePerAdmin: 2,
    frequencyPerDay: 2,
    scheduledTimes: ['06:45', '18:45'],
    minIntervalHours: 4,
    maxDailyDose: 8,
    totalUnits: 200,
    remainingUnits: 200,
    budDaysAfterOpen: 180,
    containsCorticosteroid: false,
    instructions: 'Kocok tabung 5 detik sebelum disemprot. Jika digunakan bersama inhaler pengontrol (steroid), gunakan Salbutamol 10-15 menit lebih dulu.'
  },
  {
    label: 'Tiotropium Bromide 2.5 mcg (Spiriva Respimat SMI)',
    name: 'Tiotropium Bromide 2.5 mcg (Spiriva Respimat)',
    form: 'SMI',
    deviceType: 'smi_respimat',
    category: 'Controller',
    unitLabel: 'semprotan',
    dosePerAdmin: 2,
    frequencyPerDay: 1,
    scheduledTimes: ['08:00'],
    minIntervalHours: 20,
    maxDailyDose: 2,
    totalUnits: 60,
    remainingUnits: 60,
    budDaysAfterOpen: 90,
    containsCorticosteroid: false,
    instructions: 'Putar bagian bawah transparan 180 derajat hingga bunyi klik sebelum membuka tutup. Hindari semprotan mengenai mata.'
  },
  {
    label: 'Fluticasone/Salmeterol 250/50 mcg (Seretide Diskus DPI)',
    name: 'Fluticasone/Salmeterol 250/50 mcg (Seretide Diskus)',
    form: 'DPI',
    deviceType: 'dpi_turbuhaler',
    category: 'Controller',
    unitLabel: 'isapan',
    dosePerAdmin: 1,
    frequencyPerDay: 2,
    scheduledTimes: ['07:30', '19:30'],
    minIntervalHours: 10,
    maxDailyDose: 2,
    totalUnits: 60,
    remainingUnits: 60,
    budDaysAfterOpen: 60,
    containsCorticosteroid: true,
    instructions: 'Pegang Diskus secara horizontal saat menggeser tuas dosis. Kumur mulut dengan air bersih setelah digunakan.'
  },
  {
    label: 'Indacaterol 150 mcg Kapsul Inhalasi (Onbrez Breezhaler)',
    name: 'Indacaterol 150 mcg (Onbrez Breezhaler)',
    form: 'DPI',
    deviceType: 'dpi_capsule',
    category: 'Controller',
    unitLabel: 'kapsul',
    dosePerAdmin: 1,
    frequencyPerDay: 1,
    scheduledTimes: ['08:00'],
    minIntervalHours: 20,
    maxDailyDose: 1,
    totalUnits: 30,
    remainingUnits: 30,
    budDaysAfterOpen: 60,
    containsCorticosteroid: false,
    instructions: 'JANGAN MENELAN KAPSUL. Masukkan kapsul ke dalam ruang alat Breezhaler, tekan tombol penusuk 1 kali, lalu hirup cepat dan dalam.'
  },
  {
    label: 'Cefixime Sirup Kering Rekonstitusi 100 mg/5 mL (BUD 14 Hari)',
    name: 'Cefixime Sirup Rekonstitusi 100 mg/5 mL',
    form: 'Sirup Rekonstitusi',
    deviceType: null,
    category: 'Add-on Oral',
    unitLabel: 'mL',
    dosePerAdmin: 5,
    frequencyPerDay: 2,
    scheduledTimes: ['08:00', '20:00'],
    minIntervalHours: 10,
    maxDailyDose: 20,
    totalUnits: 30,
    remainingUnits: 30,
    budDaysAfterOpen: 14,
    containsCorticosteroid: false,
    instructions: 'Kocok botol sirup rekonstitusi setiap sebelum dituang. Buang sisa sirup setelah 14 hari sejak dicampur air (Beyond Use Date).'
  },
  {
    label: 'Ambroxol HCl Sirup 15 mg/5 mL (Mukolitik Pengencer Dahak)',
    name: 'Ambroxol HCl Sirup 15 mg/5 mL',
    form: 'Sirup Oral',
    deviceType: null,
    category: 'Add-on Oral',
    unitLabel: 'mL',
    dosePerAdmin: 10,
    frequencyPerDay: 3,
    scheduledTimes: ['07:30', '13:30', '19:30'],
    minIntervalHours: 5,
    maxDailyDose: 30,
    totalUnits: 60,
    remainingUnits: 60,
    budDaysAfterOpen: 60,
    containsCorticosteroid: false,
    instructions: 'Diminum sesudah makan dengan segelas air putih hangat untuk membantu pengenceran dahak.'
  },
  {
    label: 'Metilprednisolon 4 mg Tablet (Antiinflamasi Oral)',
    name: 'Metilprednisolon 4 mg Tablet',
    form: 'Tablet Oral',
    deviceType: null,
    category: 'Add-on Oral',
    unitLabel: 'tablet',
    dosePerAdmin: 1,
    frequencyPerDay: 2,
    scheduledTimes: ['08:00', '16:00'],
    minIntervalHours: 6,
    maxDailyDose: 4,
    totalUnits: 20,
    remainingUnits: 20,
    budDaysAfterOpen: 90,
    containsCorticosteroid: true,
    instructions: 'Minum sesudah makan. Jangan menghentikan penggunaan secara mendadak tanpa instruksi dokter.'
  }
];

export function buildDefaultMedications() {
  return [
    {
      id: 'med-symbicort-1',
      name: 'Budesonide/Formoterol 160/4.5 mcg (Symbicort Turbuhaler)',
      form: 'DPI',
      deviceType: 'dpi_turbuhaler',
      category: 'Controller',
      unitLabel: 'isapan',
      dosePerAdmin: 1,
      frequencyPerDay: 2,
      scheduledTimes: ['07:00', '19:00'],
      minIntervalHours: 10,
      maxDailyDose: 8,
      totalUnits: 120,
      remainingUnits: 54,
      openedDate: offsetDateISO(-32),
      budDaysAfterOpen: 90,
      expiryDate: offsetDateISO(210),
      containsCorticosteroid: true,
      instructions:
        'Wajib berkumur air bersih lalu buang airnya setelah menghirup (mencegah kandidiasis oral & suara serak).'
    },
    {
      id: 'med-salbutamol-2',
      name: 'Salbutamol Sulfate 100 mcg (Ventolin MDI Inhaler)',
      form: 'MDI',
      deviceType: 'mdi_standard',
      category: 'Reliever',
      unitLabel: 'isapan',
      dosePerAdmin: 2,
      frequencyPerDay: 2,
      scheduledTimes: ['07:00', '15:00'],
      minIntervalHours: 4,
      maxDailyDose: 8,
      totalUnits: 200,
      remainingUnits: 10, // 10 isapan / (4 isapan/hari) = 2.5 hari -> memicu peringatan merah <= 3 hari
      openedDate: offsetDateISO(-45),
      budDaysAfterOpen: 180,
      expiryDate: offsetDateISO(150),
      containsCorticosteroid: false,
      instructions:
        'Kocok tabung 5 detik sebelum disemprot. Jika jadwal bersamaan dengan steroid inhalasi, gunakan Salbutamol 10-15 menit lebih dahulu untuk membuka bronkus.'
    },
    {
      id: 'med-spiriva-3',
      name: 'Tiotropium Bromide 2.5 mcg (Spiriva Respimat)',
      form: 'SMI',
      deviceType: 'smi_respimat',
      category: 'Controller',
      unitLabel: 'semprotan',
      dosePerAdmin: 2,
      frequencyPerDay: 1,
      scheduledTimes: ['08:00'],
      minIntervalHours: 20,
      maxDailyDose: 2,
      totalUnits: 60,
      remainingUnits: 12, // 12 / 2 = 6 hari -> memicu peringatan kuning (4-7 hari)
      openedDate: offsetDateISO(-24),
      budDaysAfterOpen: 90,
      expiryDate: offsetDateISO(180),
      containsCorticosteroid: false,
      instructions:
        'Putar dasar cartridge 180 derajat hingga terdengar bunyi klik sebelum tutup dibuka.'
    },
    {
      id: 'med-cefixime-syrup-4',
      name: 'Cefixime Sirup Kering Rekonstitusi 100 mg/5 mL',
      form: 'Sirup Rekonstitusi',
      deviceType: null,
      category: 'Add-on Oral',
      unitLabel: 'mL',
      dosePerAdmin: 5,
      frequencyPerDay: 2,
      scheduledTimes: ['08:00', '20:00'],
      minIntervalHours: 10,
      maxDailyDose: 20,
      totalUnits: 60,
      remainingUnits: 25,
      openedDate: offsetDateISO(-16), // Direkonstitusi 16 hari lalu, padahal BUD = 14 hari -> memicu peringatan merah BUD Lewat!
      budDaysAfterOpen: 14,
      expiryDate: offsetDateISO(120),
      containsCorticosteroid: false,
      instructions:
        'Sirup rekonstitusi air matang: batas simpan Beyond Use Date (BUD) maksimal 14 hari sejak dicampur air. Jangan digunakan bila sudah lewat BUD.'
    }
  ];
}

export const INHALER_PROTOCOLS = [
  {
    id: 'mdi_standard',
    name: 'MDI (Metered Dose Inhaler / Inhaler Semprot Tekan)',
    shortLabel: 'MDI Standar',
    examples: 'Ventolin Evohaler, Seretide Inhaler, Flixotide, Berotec MDI',
    inspiratoryFlowRule: 'Tarik napas LAMBAT & DALAM (3–5 detik) bersamaan saat menekan tabung',
    breathHoldSeconds: 10,
    requiresMouthRinseNote:
      'Jika mengandung kortikosteroid (contoh: Budesonide, Fluticasone, Beclomethasone), wajib berkumur air bersih dan buang airnya.',
    commonMistakes: [
      'Tidak mengocok tabung sebelum digunakan sehingga propelan dan zat aktif tidak homogen.',
      'Menarik napas terlalu cepat dan menyentak (menyebabkan obat menempel di tenggorokan/orofaring, bukan paru-paru).',
      'Tidak menahan napas minimal 5–10 detik setelah inhalasi.'
    ],
    steps: [
      {
        stepNumber: 1,
        phase: 'Persiapan Alat',
        title: 'Buka tutup & kocok tabung inhaler secara vertikal',
        instruction:
          'Lepaskan tutup mouthpiece, periksa kebersihan corong, lalu pegang inhaler tegak lurus dan kocok selama 5 detik.',
        clinicalWhy:
          'Mengocok mendistribusikan suspensi obat secara merata di dalam propelan HFA sehingga dosis yang keluar akurat.'
      },
      {
        stepNumber: 2,
        phase: 'Ekshalasi Awal',
        title: 'Buang napas perlahan menjauhi inhaler',
        instruction:
          'Berdiri atau duduk tegak. Hembuskan napas perlahan sampai terasa nyaman (jangan menghembuskan napas ke dalam corong alat).',
        clinicalWhy:
          'Mengosongkan volume residu fungsional paru agar kapasitas tarikan napas berikutnya maksimal.'
      },
      {
        stepNumber: 3,
        phase: 'Posisi Mouthpiece',
        title: 'Rapatkan bibir mengelilingi mouthpiece',
        instruction:
          'Masukkan mouthpiece di antara gigi (jangan digigit), lalu katupkan bibir rapat-rapat tanpa celah. Lidah berada di bawah corong.',
        clinicalWhy:
          'Mencegah kebocoran aerosol dan mencegah lidah menghalangi semburan partikel obat.'
      },
      {
        stepNumber: 4,
        phase: 'Koordinasi Aktuasi & Inhalasi',
        title: 'Tekan tabung 1 kali sambil menarik napas LAMBAT & DALAM',
        instruction:
          'Mulai tarik napas perlahan melalui mulut, dan tepat setelah mulai menghirup, tekan bagian atas tabung 1 kali. Lanjutkan menghirup lambat dan dalam selama 3–5 detik.',
        clinicalWhy:
          'Aliran inspirasi lambat (30 L/menit) meminimalkan impaksi inersia di faring dan memaksimalkan deposisi di bronkiolus.'
      },
      {
        stepNumber: 5,
        phase: 'Tahan Napas (Breath-Hold)',
        title: 'Tahan napas selama 10 detik (atau semampunya)',
        instruction:
          'Lepaskan inhaler dari mulut, tutup bibir, dan tahan napas selama 10 detik. Setelah itu hembuskan napas perlahan melalui hidung atau bibir mencucu.',
        clinicalWhy:
          'Memberi waktu partikel aerosol berukuran 1–5 mikron mengendap (sedimentasi gravitasi) di saluran napas kecil.'
      },
      {
        stepNumber: 6,
        phase: 'Jeda Dosis Kedua & Pasca-Inhalasi',
        title: 'Beri jeda 60 detik bila perlu isapan kedua & kumur mulut',
        instruction:
          'Jika diresepkan 2 isapan, tunggu 1 menit lalu ulangi langkah 1–5. Tutup kembali inhaler. Berkumurlah dengan air bersih dan buang bila obat mengandung steroid.',
        clinicalWhy:
          'Jeda 1 menit menjaga suhu katup terukur (metering valve) stabil. Berkumur mencegah kandidiasis orofaring dan disfonia.'
      }
    ]
  },
  {
    id: 'dpi_turbuhaler',
    name: 'DPI (Dry Powder Inhaler — Turbuhaler / Diskus / Accuhaler)',
    shortLabel: 'DPI Turbuhaler / Diskus',
    examples: 'Symbicort Turbuhaler, Pulmicort Turbuhaler, Seretide Diskus',
    inspiratoryFlowRule: 'Tarik napas CEPAT, KUAT & DALAM sejak awal (aliran >= 60 L/menit)',
    breathHoldSeconds: 10,
    requiresMouthRinseNote:
      'Hampir seluruh DPI pengontrol mengandung kortikosteroid: wajib berkumur air bersih dan ludahkan airnya setelah selesai.',
    commonMistakes: [
      'Mengocok alat setelah dosis dimuat atau memiringkan Turbuhaler saat memutar grip merah.',
      'Menghirup terlalu pelan (serbuk obat tidak terdeagregasi menjadi partikel halus).',
      'Membuang napas ke dalam corong alat (kelembapan napas membuat serbuk menggumpal).'
    ],
    steps: [
      {
        stepNumber: 1,
        phase: 'Pemuatan Dosis (Loading)',
        title: 'Buka tutup & muat dosis sesuai mekanisme alat',
        instruction:
          'Untuk Turbuhaler: pegang TEGAK LURUS, putar grip bawah ke satu arah mentok lalu putar balik sampai terdengar bunyi "KLIK". Untuk Diskus: pegang horizontal, buka penutup dan geser tuas sampai bunyi "KLIK".',
        clinicalWhy:
          'Posisi tegak pada Turbuhaler memastikan takaran serbuk mikro jatuh tepat ke kanal dosis.'
      },
      {
        stepNumber: 2,
        phase: 'Ekshalasi Menjauhi Alat',
        title: 'Buang napas keluar MENJAUHI corong inhaler',
        instruction:
          'Palingkan kepala dari alat, lalu hembuskan napas perlahan sampai tuntas. Dilarang keras meniup ke dalam mouthpiece.',
        clinicalWhy:
          'Uap air dari hembusan napas akan membasahi serbuk kering di dalam alat dan merusak dosis.'
      },
      {
        stepNumber: 3,
        phase: 'Inhalasi Kuat & Cepat',
        title: 'Katupkan bibir & tarik napas CEPAT, KUAT, dan DALAM',
        instruction:
          'Rapatkan bibir pada mouthpiece (jangan menutupi lubang ventilasi udara alat), lalu tarik napas sekuat dan sedalam mungkin sejak detik pertama selama 2–3 detik.',
        clinicalWhy:
          'DPI tidak memiliki propelan; turbulensi dari tarikan napas kuat pasien dibutuhkan untuk memecah serbuk pembawa laktosa dari zat aktif.'
      },
      {
        stepNumber: 4,
        phase: 'Tahan Napas 10 Detik',
        title: 'Lepaskan alat dari mulut & tahan napas 10 detik',
        instruction:
          'Keluarkan mouthpiece dari mulut sebelum menghembuskan napas. Tahan napas 10 detik, lalu buang napas perlahan menjauhi alat.',
        clinicalWhy:
          'Memastikan partikel mikronisasi mengendap optimal di percabangan bronkus.'
      },
      {
        stepNumber: 5,
        phase: 'Penutupan & Dekontaminasi Mulut',
        title: 'Lap corong dengan tisu kering, tutup alat & kumur air',
        instruction:
          'Jangan pernah mencuci mouthpiece DPI dengan air. Tutup rapat kembali, lalu berkumurlah dengan air bersih (jangan ditelan).',
        clinicalWhy:
          'Menjaga silika pengering di dalam tutup tetap bekerja dan membilas sisa steroid di rongga mulut.'
      }
    ]
  },
  {
    id: 'smi_respimat',
    name: 'SMI (Soft Mist Inhaler — Respimat)',
    shortLabel: 'SMI Respimat',
    examples: 'Spiriva Respimat, Spiolto Respimat, Striverdi Respimat',
    inspiratoryFlowRule: 'Tarik napas LAMBAT & DALAM sambil menekan tombol pelepas dosis',
    breathHoldSeconds: 10,
    requiresMouthRinseNote:
      'Kumur mulut jika diresepkan bersama steroid. Jaga agar kabut semprotan tidak mengenai mata (risiko midriasis/glaukoma akut pada antikolinergik).',
    commonMistakes: [
      'Membuka tutup sebelum memutar bagian bawah transparan (menyebabkan tombol tertekan tidak sengaja saat memutar).',
      'Semprotan mengenai mata karena bibir tidak rapat pada mouthpiece.'
    ],
    steps: [
      {
        stepNumber: 1,
        phase: 'Putar Basis (Tutup Tertutup)',
        title: 'Pastikan tutup TERTUTUP, putar bagian bawah 180 derajat',
        instruction:
          'Pegang Respimat tegak dengan tutup masih tertutup. Putar bagian bawah transparan searah tanda panah pada label hingga terdengar bunyi "KLIK" (setengah putaran).',
        clinicalWhy:
          'Menarik pegas mekanis dan mengambil tepat 1 takaran larutan mikro tanpa memicu keluarnya kabut.'
      },
      {
        stepNumber: 2,
        phase: 'Buka Tutup & Buang Napas',
        title: 'Buka tutup sepenuhnya & hembuskan napas menjauhi alat',
        instruction:
          'Buka tutup hingga terbuka penuh. Hembuskan napas perlahan dan tuntas menjauhi corong.',
        clinicalWhy:
          'Mempersiapkan volume paru untuk inspirasi dalam.'
      },
      {
        stepNumber: 3,
        phase: 'Aktuasi Kabut Halus',
        title: 'Katupkan bibir, tarik napas LAMBAT sambil tekan tombol dosis',
        instruction:
          'Rapatkan bibir pada mouthpiece tanpa menutupi ventilasi samping. Arahkan alat ke bagian belakang tenggorokan. Sambil mulai menarik napas lambat dan dalam, tekan tombol pelepas dosis dan teruskan menghirup.',
        clinicalWhy:
          'Kabut Soft Mist keluar selama ~1.5 detik (lebih lambat dari MDI), sehingga tarikan napas lambat dan dalam menghasilkan deposisi paru >50%.'
      },
      {
        stepNumber: 4,
        phase: 'Tahan Napas & Ulangi',
        title: 'Tahan napas 10 detik, lalu ulangi bila dosis 2 semprotan',
        instruction:
          'Tahan napas selama 10 detik lalu buang perlahan. Tutup kembali cap sebelum mengulangi langkah 1 untuk semprotan kedua.',
        clinicalWhy:
          'Mengoptimalkan retensi partikel antikolinergik/bronkodilator pada reseptor muskarinik saluran napas.'
      }
    ]
  },
  {
    id: 'dpi_capsule',
    name: 'DPI Kapsul Inhalasi (Breezhaler / HandiHaler / Rotahaler)',
    shortLabel: 'DPI Kapsul',
    examples: 'Onbrez Breezhaler, Ultibro Breezhaler, Spiriva HandiHaler',
    inspiratoryFlowRule: 'Tarik napas CEPAT & STABIL hingga terdengar suara kapsul bergetar/berputar',
    breathHoldSeconds: 10,
    requiresMouthRinseNote:
      'INGAT: Kapsul hanya untuk dimasukkan ke dalam alat hirup, DILARANG DITELAN.',
    commonMistakes: [
      'Menelan kapsul secara oral seperti obat minum (obat tidak berefek ke paru).',
      'Menekan tombol penusuk berkali-kali sehingga cangkang kapsul pecah dan serpihannya terhirup.'
    ],
    steps: [
      {
        stepNumber: 1,
        phase: 'Pemasangan Kapsul',
        title: 'Buka mouthpiece & masukkan 1 kapsul ke ruang tengah',
        instruction:
          'Dengan tangan kering, keluarkan kapsul dari blister tepat sebelum digunakan. Masukkan kapsul ke ruang berbentuk kapsul, lalu tutup kembali mouthpiece sampai bunyi "KLIK".',
        clinicalWhy:
          'Kapsul gelatin sangat sensitif terhadap kelembapan tangan maupun udara luar.'
      },
      {
        stepNumber: 2,
        phase: 'Penusukan Kapsul',
        title: 'Pegang tegak, tekan tombol samping 1 KALI saja lalu lepas',
        instruction:
          'Tekan tombol penusuk di sisi alat secara penuh sebanyak 1 kali saja, kemudian lepaskan tombol.',
        clinicalWhy:
          'Menekan lebih dari sekali dapat meremukkan cangkang gelatin dan menyumbat lubang keluarnya serbuk.'
      },
      {
        stepNumber: 3,
        phase: 'Inhalasi Berbunyi (Whirring Sound)',
        title: 'Buang napas menjauh, lalu hirup CEPAT & DALAM melalui mulut',
        instruction:
          'Setelah membuang napas menjauhi alat, katupkan bibir pada mouthpiece dan hirup cepat serta dalam. Anda harus mendengar suara kapsul berputar ("whirring") di dalam ruang alat.',
        clinicalWhy:
          'Suara getaran kapsul menandakan aliran inspirasi cukup kuat untuk mengosongkan serbuk dari dalam kapsul.'
      },
      {
        stepNumber: 4,
        phase: 'Tahan Napas & Cek Kapsul Kosong',
        title: 'Tahan napas 10 detik & pastikan kapsul sudah kosong',
        instruction:
          'Tahan napas 10 detik. Buka ruang alat dan periksa apakah serbuk di dalam kapsul sudah habis. Jika masih tersisa serbuk, tutup dan hirup sekali lagi tanpa menekan tombol penusuk. Buang cangkang kapsul kosong.',
        clinicalWhy:
          'Memastikan pasien menerima 100% dosis terapeutik yang diresepkan.'
      }
    ]
  },
  {
    id: 'mdi_spacer',
    name: 'MDI + Spacer / Holding Chamber (Tabung Perantara)',
    shortLabel: 'MDI + Spacer',
    examples: 'MDI dengan AeroChamber / Volumatic / Babyhaler',
    inspiratoryFlowRule: 'Tarik napas lambat 1 kali tahan 10 detik, ATAU bernapas biasa 4–5 kali lewat spacer',
    breathHoldSeconds: 10,
    requiresMouthRinseNote:
      'Bila menggunakan masker wajah pada anak/lansia, seka area wajah dengan air bersih setelah inhalasi steroid.',
    commonMistakes: [
      'Menyemprotkan beberapa puff sekaligus ke dalam spacer sebelum dihirup (partikel saling bertumbukan dan menempel di dinding spacer).',
      'Mencuci spacer dengan lap kering (menimbulkan listrik statis yang menarik partikel obat ke dinding plastik).'
    ],
    steps: [
      {
        stepNumber: 1,
        phase: 'Perakitan & Pengocokan',
        title: 'Kocok MDI 5 detik & pasang ke ujung belakang Spacer',
        instruction:
          'Buka tutup MDI dan spacer, kocok MDI, lalu pasang tegak lurus pada lubang karet di belakang tabung spacer.',
        clinicalWhy:
          'Spacer menahan laju semburan aerosol berkecepatan tinggi sehingga partikel besar tertahan di ruang spacer, bukan di tenggorokan.'
      },
      {
        stepNumber: 2,
        phase: 'Semprot 1 Puff & Hirup Segera',
        title: 'Rapatkan bibir/masker, tekan 1 semprotan & langsung hirup',
        instruction:
          'Semprotkan HANYA 1 puff ke dalam spacer, lalu segera tarik napas lambat dan dalam melalui spacer (atau bernapas tenang 4–5 kali bila memakai masker/kesulitan menahan napas).',
        clinicalWhy:
          'Menghilangkan kendala koordinasi tangan-napas dan meningkatkan deposisi paru hingga 2 kali lipat.'
      },
      {
        stepNumber: 3,
        phase: 'Tahan Napas & Ulangi Per Puff',
        title: 'Tahan napas 10 detik & ulangi 1 per 1 jika perlu dosis kedua',
        instruction:
          'Tahan napas 10 detik. Jika diresepkan 2 puff, tunggu 30–60 detik, kocok lagi, dan semprotkan puff kedua secara terpisah.',
        clinicalWhy:
          'Menyemprotkan 1 puff per siklus mencegah aglomerasi aerosol di dalam chamber.'
      }
    ]
  }
];

/**
 * Menghasilkan riwayat data 14 hari terakhir (sebelum hari ini) agar grafik kepatuhan
 * mingguan/bulanan serta laporan evaluasi 30 hari langsung informatif sejak pertama dibuka.
 */
export function buildDefaultDoseLogs() {
  const logs = {};
  for (let i = 14; i >= 1; i--) {
    const dateISO = offsetDateISO(-i);
    // Simulasi kepatuhan realistis ~88%
    const missedEvening = i === 4 || i === 11;
    const missedAfternoon = i === 7;
    logs[dateISO] = {
      'med-symbicort-1__07:00': { taken: true, takenAt: '07:04', techniqueVerified: true },
      'med-symbicort-1__19:00': missedEvening
        ? { taken: false, takenAt: null, techniqueVerified: false }
        : { taken: true, takenAt: '19:10', techniqueVerified: true },
      'med-salbutamol-2__07:00': { taken: true, takenAt: '06:50', techniqueVerified: true },
      'med-salbutamol-2__15:00': missedAfternoon
        ? { taken: false, takenAt: null, techniqueVerified: false }
        : { taken: true, takenAt: '15:05', techniqueVerified: true },
      'med-spiriva-3__08:00': { taken: true, takenAt: '08:02', techniqueVerified: true },
      'med-cefixime-syrup-4__08:00':
        i <= 14 && i >= 3
          ? { taken: true, takenAt: '08:15', techniqueVerified: true }
          : { taken: false, takenAt: null, techniqueVerified: false },
      'med-cefixime-syrup-4__20:00':
        i <= 14 && i >= 3 && !missedEvening
          ? { taken: true, takenAt: '20:10', techniqueVerified: true }
          : { taken: false, takenAt: null, techniqueVerified: false }
    };
  }
  return logs;
}

export function buildDefaultSymptomLogs() {
  const logs = [];
  const samplePatterns = [
    { daysAgo: 14, dyspnea: 1, nightCough: 'once', rescuePuffs: 1, pef: 380, sideEffects: ['Mulut kering'], triggers: ['Udara dingin'], notes: 'Pagi agak dingin, batuk ringan subuh.' },
    { daysAgo: 13, dyspnea: 0, nightCough: 'none', rescuePuffs: 0, pef: 400, sideEffects: [], triggers: [], notes: 'Napas lega sepanjang hari.' },
    { daysAgo: 12, dyspnea: 0, nightCough: 'none', rescuePuffs: 0, pef: 405, sideEffects: [], triggers: [], notes: 'Kondisi stabil.' },
    { daysAgo: 11, dyspnea: 2, nightCough: 'multiple', rescuePuffs: 2, pef: 340, sideEffects: ['Suara serak / disfonia'], triggers: ['Debu rumah', 'Lupa dosis malam'], notes: 'Lupa pakai Symbicort malam, terbangun jam 2 pagi karena batuk.' },
    { daysAgo: 10, dyspnea: 1, nightCough: 'once', rescuePuffs: 1, pef: 375, sideEffects: [], triggers: ['Debu rumah'], notes: 'Mulai membaik setelah kembali rutin.' },
    { daysAgo: 9, dyspnea: 0, nightCough: 'none', rescuePuffs: 0, pef: 400, sideEffects: [], triggers: [], notes: 'Tidur nyenyak tanpa batuk.' },
    { daysAgo: 8, dyspnea: 0, nightCough: 'none', rescuePuffs: 0, pef: 410, sideEffects: [], triggers: [], notes: 'Jalan pagi 20 menit lancar.' },
    { daysAgo: 7, dyspnea: 1, nightCough: 'none', rescuePuffs: 1, pef: 390, sideEffects: ['Jantung berdebar ringan'], triggers: ['Aktivitas fisik'], notes: 'Sedikit ngos-ngosan saat naik tangga.' },
    { daysAgo: 6, dyspnea: 0, nightCough: 'none', rescuePuffs: 0, pef: 410, sideEffects: [], triggers: [], notes: 'Terkontrol baik.' },
    { daysAgo: 5, dyspnea: 0, nightCough: 'none', rescuePuffs: 0, pef: 415, sideEffects: [], triggers: [], notes: 'Kumur mulut rutin setiap selesai inhalasi.' },
    { daysAgo: 4, dyspnea: 1, nightCough: 'once', rescuePuffs: 1, pef: 370, sideEffects: [], triggers: ['Udara dingin'], notes: 'Hujan deras malam hari, sempat batuk 1x.' },
    { daysAgo: 3, dyspnea: 0, nightCough: 'none', rescuePuffs: 0, pef: 405, sideEffects: [], triggers: [], notes: 'Kondisi pernapasan nyaman.' },
    { daysAgo: 2, dyspnea: 0, nightCough: 'none', rescuePuffs: 0, pef: 410, sideEffects: [], triggers: [], notes: 'Tidak ada keluhan.' },
    { daysAgo: 1, dyspnea: 0, nightCough: 'none', rescuePuffs: 0, pef: 415, sideEffects: [], triggers: [], notes: 'Teknik hirup sudah dicek dan benar.' }
  ];

  for (const item of samplePatterns) {
    logs.push({
      date: offsetDateISO(-item.daysAgo),
      dyspneaScore: item.dyspnea, // 0: Tidak ada, 1: Ringan, 2: Sedang, 3: Berat
      nightCough: item.nightCough, // 'none' | 'once' | 'multiple'
      rescuePuffsUsed: item.rescuePuffs,
      pefValue: item.pef,
      sideEffects: item.sideEffects,
      triggers: item.triggers,
      techniqueConfirmed: true,
      notes: item.notes,
      updatedAt: `${offsetDateISO(-item.daysAgo)}T20:00:00`
    });
  }
  return logs;
}

export function buildDefaultTechniqueValidations() {
  const validations = {};
  for (let i = 14; i >= 1; i--) {
    validations[offsetDateISO(-i)] = {
      confirmed: true,
      confirmedAt: '07:02',
      devicesChecked: ['dpi_turbuhaler', 'mdi_standard', 'smi_respimat']
    };
  }
  return validations;
}
