import React, { useState, useEffect, useRef } from 'react';
import {
  Wind,
  HeartPulse,
  ArrowRight,
  Calendar,
  Play,
  BarChart3,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Activity,
  FileDown,
  Pill,
  Timer,
  ChevronDown,
  X,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';

export default function LandingPage({ onLogin, onStart, theme = 'dark', toggleTheme }) {
  // ==========================================================
  // 1. NAVBAR SCROLL & DROPDOWN STATE
  // ==========================================================
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('beranda');
  const [hoveredNav, setHoveredNav] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavMouseEnter = (navId) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setHoveredNav(navId);
  };

  const handleNavMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setHoveredNav(null);
    }, 200);
  };

  const scrollToSection = (id) => {
    setHoveredNav(null);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ==========================================================
  // 2. INTERACTIVE FEATURE SWITCHER STATE (STABLE ONCLICK)
  // ==========================================================
  const [activeFeature, setActiveFeature] = useState(0);

  const featureItems = [
    {
      id: '01',
      menuTitle: '01. Jadwal Terapi Harian',
      title: 'Jadwal Terapi Harian Presisi',
      subtitle: 'Sinkronisasi Waktu Dosis',
      description:
        'Pengingat dosis otomatis yang membedakan inhaler controller harian dan reliever saat darurat. Mencegah fluktuasi penyempitan saluran napas dengan kedisiplinan minum obat.',
      badge: 'Bebas Dosis Terlewat',
    },
    {
      id: '02',
      menuTitle: '02. Panduan Video Inhaler',
      title: 'Panduan Teknik Inhaler 30 Detik',
      subtitle: 'Memastikan Deposisi Obat Optimal',
      description:
        'Simulasi panduan visual langkah demi langkah sebelum dosis ditandai diminum. Memastikan koordinasi tekan tabung dan tarikan napas dalam mencapai alveolus paru-paru.',
      badge: 'Verifikasi Klinis 30s',
    },
    {
      id: '03',
      menuTitle: '03. Pelacak Stok Obat',
      title: 'Pelacak Sisa Dosis & Stok Obat',
      subtitle: 'Peringatan Dini Kebutuhan Refill',
      description:
        'Kalkulasi otomatis jumlah semprotan inhaler dan tablet yang tersisa. Memberikan notifikasi proaktif sebelum obat habis agar terapi pemeliharaan tidak terputus.',
      badge: 'Monitoring Otomatis',
    },
    {
      id: '04',
      menuTitle: '04. Laporan PDF Dokter',
      title: 'Laporan Kepatuhan PDF untuk Dokter',
      subtitle: 'Rekam Jejak Terstandarisasi',
      description:
        'Menyusun grafik kepatuhan bulanan, persentase keteraturan dosis, dan riwayat validasi dalam format PDF siap cetak untuk mempermudah evaluasi dokter spesialis paru.',
      badge: 'Siap Konsultasi',
    },
  ];

  // Dropdown Sub-menus content
  const dropdownContent = {
    beranda: [
      {
        title: 'Ringkasan Sistem RespiCare',
        desc: 'Asisten terapi mandiri untuk pasien Asma & PPOK',
        action: () => scrollToSection('hero'),
        icon: Wind,
      },
      {
        title: 'Mulai Atur Jadwal Terapi',
        desc: 'Buat dan pantau jadwal dosis pertama Anda sekarang',
        action: onStart,
        icon: ArrowRight,
      },
    ],
    tentang: [
      {
        title: 'Mengapa RespiCare',
        desc: 'Pentingnya konsistensi terapi untuk mencegah kekambuhan',
        action: () => scrollToSection('pernyataan'),
        icon: ShieldCheck,
      },
      {
        title: 'Standar Klinis Terapi',
        desc: 'Mengikuti pedoman penanganan global GINA & GOLD',
        action: () => scrollToSection('pernyataan'),
        icon: CheckCircle2,
      },
    ],
    fitur: [
      {
        title: 'Jadwal Terapi Harian',
        desc: 'Pengingat dosis inhaler & oral tepat waktu',
        action: () => {
          setActiveFeature(0);
          scrollToSection('fitur-section');
        },
        icon: Calendar,
      },
      {
        title: 'Panduan Teknik Inhaler',
        desc: 'Validasi visual simulasi hirup 30 detik',
        action: () => {
          setActiveFeature(1);
          scrollToSection('video-showcase');
        },
        icon: Play,
      },
      {
        title: 'Pelacak Stok Obat',
        desc: 'Hitung sisa dosis otomatis & notifikasi refill',
        action: () => {
          setActiveFeature(2);
          scrollToSection('fitur-section');
        },
        icon: Pill,
      },
      {
        title: 'Laporan Kepatuhan PDF',
        desc: 'Rekapitulasi riwayat terapi untuk konsultasi dokter',
        action: () => {
          setActiveFeature(3);
          scrollToSection('fitur-section');
        },
        icon: BarChart3,
      },
    ],
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#051226] text-[#e0f7fa]' : 'bg-[#f0f9ff] text-[#051226]'} font-sans antialiased selection:bg-[#4dd0e1] selection:text-slate-950 overflow-x-hidden`}>
      {/* ======================================================== */}
      {/* 1. ADAPTIVE FLOATING PILL NAVBAR & DROPDOWN PANEL        */}
      {/* ======================================================== */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-in-out px-4 sm:px-8 ${
          isScrolled ? 'pt-4' : 'pt-6'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          {/* Sisi Kiri: Logo Teks Tebal (Fade out saat scroll > 80px) */}
          <div
            onClick={() => scrollToSection('hero')}
            className={`flex items-center gap-2.5 cursor-pointer transition-all duration-500 ${
              isScrolled
                ? 'opacity-0 -translate-y-4 pointer-events-none'
                : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0d47a1] to-[#1976d2] text-[#e0f7fa] border border-[#4dd0e1]/30 flex items-center justify-center shadow-inner shrink-0">
              <HeartPulse className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className={`text-xl font-extrabold tracking-tight font-sans ${
              theme === 'light' ? 'text-[#051226]' : 'text-white'
            }`}>
              Respi<span className={theme === 'light' ? 'text-[#0d47a1]' : 'text-[#4dd0e1]'}>Care</span>
            </span>
          </div>

          {/* Sisi Tengah: Kapsul Navigasi Melayang (Floating Pill) */}
          <div
            className={`relative transition-all duration-500 ${
              isScrolled
                ? 'fixed left-1/2 -translate-x-1/2 top-4 shadow-sky-500/10'
                : 'mx-auto'
            }`}
            onMouseLeave={handleNavMouseLeave}
          >
            <nav
              aria-label="Floating Navigation Pill"
              className={`rounded-full backdrop-blur-md px-4 sm:px-6 py-2 shadow-2xl flex items-center gap-2 sm:gap-3 ${
                theme === 'light'
                  ? 'bg-white/95 border border-slate-200 text-slate-700 shadow-md'
                  : 'bg-slate-900/80 border border-white/10 text-white'
              }`}
            >
              {[
                { id: 'beranda', label: 'Beranda', target: 'hero' },
                { id: 'tentang', label: 'Tentang', target: 'pernyataan' },
                { id: 'fitur', label: 'Fitur', target: 'fitur-section' },
              ].map((item) => {
                const isItemActive = activeNav === item.id;
                const isItemHovered = hoveredNav === item.id;
                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => handleNavMouseEnter(item.id)}
                    className="relative"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNav(item.id);
                        scrollToSection(item.target);
                        setHoveredNav(null);
                      }}
                      className={`px-3.5 sm:px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 text-xs sm:text-sm ${
                        isItemActive || isItemHovered
                          ? theme === 'light'
                            ? 'bg-[#0d47a1] text-white font-semibold shadow-xs'
                            : 'bg-white/15 text-white font-semibold'
                          : theme === 'light'
                          ? 'text-slate-700 hover:text-[#0d47a1] font-medium'
                          : 'text-slate-300 hover:text-white font-medium'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isItemHovered
                            ? theme === 'light'
                              ? 'rotate-180 text-white'
                              : 'rotate-180 text-[#38BDF8]'
                            : theme === 'light'
                            ? 'text-slate-500'
                            : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </nav>

            {/* Floating Dropdown Panel saat Hover */}
            {hoveredNav && dropdownContent[hoveredNav] && (
              <div
                onMouseEnter={() => handleNavMouseEnter(hoveredNav)}
                onMouseLeave={handleNavMouseLeave}
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[360px] sm:w-[420px] max-w-[95vw] rounded-2xl backdrop-blur-xl p-4 sm:p-5 shadow-2xl z-50 animate-fade-in ${
                  theme === 'light'
                    ? 'bg-white/98 border border-slate-200 text-slate-800'
                    : 'bg-slate-900/95 border border-white/10 text-white'
                }`}
              >
                <div className="space-y-1.5">
                  {dropdownContent[hoveredNav].map((sub, idx) => {
                    const Icon = sub.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          sub.action();
                          setActiveNav(hoveredNav);
                          setHoveredNav(null);
                        }}
                        className={`w-full flex items-start gap-3.5 p-3 rounded-xl transition-colors text-left group ${
                          theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border group-hover:scale-105 transition-transform ${
                          theme === 'light'
                            ? 'bg-[#0d47a1]/10 text-[#0d47a1] border-[#0d47a1]/20'
                            : 'bg-blue-500/20 text-[#38BDF8] border-sky-400/20'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                            theme === 'light'
                              ? 'text-[#051226] group-hover:text-[#0d47a1]'
                              : 'text-white group-hover:text-[#38BDF8]'
                          }`}>
                            <span>{sub.title}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h4>
                          <p className={`text-xs mt-0.5 leading-snug ${
                            theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                            {sub.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sisi Kanan: Tombol Kapsul MASUK & Theme Toggle */}
          <div
            className={`flex items-center gap-2.5 transition-all duration-500 ${
              isScrolled
                ? 'opacity-0 -translate-y-4 pointer-events-none'
                : 'opacity-100 translate-y-0'
            }`}
          >
            {toggleTheme && (
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-sm ${
                  theme === 'light'
                    ? 'bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                }`}
                title={theme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-300" />
                ) : (
                  <Moon className="w-4 h-4 text-[#051226]" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onLogin}
              className={`rounded-full px-5 py-2 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 group shadow-sm cursor-pointer ${
                theme === 'light'
                  ? 'bg-[#0d47a1] text-white hover:bg-[#1976d2] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md hover:shadow-sky-400/20'
              }`}
            >
              <span>Masuk</span>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center group-hover:translate-x-0.5 transition-transform ${
                theme === 'light' ? 'bg-white text-[#0d47a1]' : 'bg-[#4dd0e1] text-slate-950'
              }`}>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION: VERTICAL CENTERED & PRATINJAU OBAT      */}
      {/* ======================================================== */}
      <section
        id="hero"
        className="min-h-[90vh] relative flex flex-col justify-center pt-28 pb-16 px-6 sm:px-12 md:px-16 overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 75% 28%, rgba(56, 189, 248, 0.16) 0%, transparent 55%), radial-gradient(circle at 18% 75%, rgba(59, 130, 246, 0.12) 0%, transparent 55%)',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center max-w-7xl mx-auto w-full z-10">
          {/* Kolom Kiri: Headline, Badge, Deskripsi, Tombol Mulai Terapi */}
          <div className="lg:col-span-7 space-y-6">
            {/* Badge Kapsul Status Menyala */}
            <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase ${
              theme === 'light'
                ? 'bg-[#0d47a1]/10 border border-[#0d47a1]/20 text-[#0d47a1]'
                : 'bg-sky-500/10 border border-sky-400/25 text-sky-300'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                theme === 'light' ? 'bg-[#0d47a1]' : 'bg-sky-400'
              }`} />
              <span>ASISTEN PENGINGAT MINUM OBAT &amp; TERAPI HARIAN</span>
            </div>

            {/* Deskripsi Singkat */}
            <p className={`text-sm sm:text-base font-medium max-w-lg leading-relaxed ${
              theme === 'light' ? 'text-slate-700' : 'text-slate-300'
            }`}>
              Mendampingi kepatuhan minum obat harian lewat pengingat jadwal cerdas dan panduan teknik inhaler yang mudah diikuti.
            </p>

            {/* Judul Raksasa RespiCare. Sejajar dengan Tombol Kapsul MULAI TERAPI */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-7 pt-1">
              <h1 className={`text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter leading-none font-sans ${
                theme === 'light' ? 'text-[#051226]' : 'text-white'
              }`}>
                RespiCare<span className={theme === 'light' ? 'text-[#00acc1]' : 'text-[#38BDF8]'}>.</span>
              </h1>

              <div>
                <button
                  type="button"
                  onClick={onStart}
                  className={`font-bold px-7 py-3.5 rounded-full hover:scale-105 transition-all duration-300 flex items-center gap-3 shadow-lg cursor-pointer text-sm sm:text-base tracking-wider uppercase ${
                    theme === 'light'
                      ? 'bg-[#0d47a1] hover:bg-[#1976d2] text-white shadow-[#0d47a1]/25'
                      : 'bg-[#38BDF8] hover:bg-sky-400 active:bg-sky-500 text-slate-950 shadow-sky-400/30'
                  }`}
                >
                  <span>MULAI TERAPI</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    theme === 'light' ? 'bg-white text-[#0d47a1]' : 'bg-slate-950 text-[#38BDF8]'
                  }`}>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </button>
              </div>
            </div>

            {/* 3 Poin Ringkas Berjejer Horizontal */}
            <div className={`flex flex-wrap gap-5 sm:gap-6 mt-6 pt-6 border-t text-xs font-medium ${
              theme === 'light' ? 'border-slate-200 text-slate-700' : 'border-white/10 text-slate-400'
            }`}>
              <span className={`flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
                <span className={theme === 'light' ? 'text-[#00acc1] font-bold' : 'text-[#38BDF8] font-bold'}>✓</span> Pengingat Dosis Tepat Waktu
              </span>
              <span className={`flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
                <span className={theme === 'light' ? 'text-[#00acc1] font-bold' : 'text-[#38BDF8] font-bold'}>✓</span> Panduan Pakai Obat
              </span>
              <span className={`flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
                <span className={theme === 'light' ? 'text-[#00acc1] font-bold' : 'text-[#38BDF8] font-bold'}>✓</span> Pantau Sisa Stok Obat
              </span>
            </div>
          </div>

          {/* Kolom Kanan: Kartu Pratinjau Pengingat Obat Hari Ini (Relevan Klinis) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className={`rounded-2xl backdrop-blur-md p-6 space-y-4 max-w-md w-full ${
              theme === 'light'
                ? 'bg-white border border-slate-200 shadow-xl text-[#051226]'
                : 'bg-slate-900/80 border border-white/10 shadow-2xl text-white'
            }`}>
              {/* Header Kartu */}
              <div className={`flex items-center justify-between pb-3 border-b ${
                theme === 'light' ? 'border-slate-200' : 'border-white/10'
              }`}>
                <span className={`text-xs font-mono font-bold tracking-wider ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                }`}>
                  PENGINGAT OBAT HARI INI
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                  theme === 'light'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    theme === 'light' ? 'bg-emerald-600' : 'bg-emerald-400'
                  }`} />
                  AKTIF
                </span>
              </div>

              {/* 3 Baris Jadwal Obat Realistis */}
              <div className="space-y-3">
                {/* 1. 07:00 Inhaler Budesonide */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-[#051226]'
                    : 'bg-white/5 border-white/10 text-white'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-mono shrink-0 ${
                      theme === 'light'
                        ? 'bg-blue-100 text-[#0d47a1]'
                        : 'bg-blue-500/15 text-[#38BDF8]'
                    }`}>
                      <span className="text-xs font-bold leading-none">07:00</span>
                      <span className={`text-[9px] mt-0.5 ${
                        theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-400'
                      }`}>PAGI</span>
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${
                        theme === 'light' ? 'text-[#051226]' : 'text-white'
                      }`}>Inhaler Budesonide</h4>
                      <p className={`text-xs ${
                        theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'
                      }`}>Controller • 2 Hirupan</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-medium shrink-0 ${
                    theme === 'light'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    Sudah Diminum ✓
                  </span>
                </div>

                {/* 2. 08:30 Teofilin 150mg */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-inner ${
                  theme === 'light'
                    ? 'bg-blue-50/80 border-blue-200 text-[#051226]'
                    : 'bg-sky-500/10 border-sky-400/30 text-white'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-mono shrink-0 ${
                      theme === 'light'
                        ? 'bg-blue-200 text-[#0d47a1]'
                        : 'bg-sky-500/25 text-[#38BDF8]'
                    }`}>
                      <span className="text-xs font-bold leading-none">08:30</span>
                      <span className={`text-[9px] mt-0.5 ${
                        theme === 'light' ? 'text-[#0d47a1] font-bold' : 'text-sky-300'
                      }`}>SIAP</span>
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${
                        theme === 'light' ? 'text-[#051226]' : 'text-white'
                      }`}>Teofilin 150mg</h4>
                      <p className={`text-xs ${
                        theme === 'light' ? 'text-slate-700 font-medium' : 'text-slate-300'
                      }`}>Obat Oral • 1 Tablet</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-bold shrink-0 ${
                    theme === 'light'
                      ? 'bg-[#0d47a1] text-white shadow-xs'
                      : 'bg-sky-500/20 text-[#38BDF8] border border-sky-400/30 animate-pulse'
                  }`}>
                    Berikutnya
                  </span>
                </div>

                {/* 3. 13:00 Inhaler Salbutamol */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-[#051226]'
                    : 'bg-white/5 border-white/10 opacity-80 text-white'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-mono shrink-0 ${
                      theme === 'light'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-white/10 text-slate-400'
                    }`}>
                      <span className="text-xs font-bold leading-none">13:00</span>
                      <span className={`text-[9px] mt-0.5 ${
                        theme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-400'
                      }`}>SIANG</span>
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${
                        theme === 'light' ? 'text-[#051226]' : 'text-white'
                      }`}>Inhaler Salbutamol</h4>
                      <p className={`text-xs ${
                        theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'
                      }`}>Reliever • Saat Sesak</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg shrink-0 ${
                    theme === 'light'
                      ? 'bg-slate-200 text-slate-700 border border-slate-300 font-medium'
                      : 'bg-white/5 text-slate-400 border border-white/10'
                  }`}>
                    Terjadwal
                  </span>
                </div>
              </div>

              {/* Indikator Sisa Stok Obat */}
              <div className={`pt-2 border-t flex items-center justify-between text-xs font-medium ${
                theme === 'light' ? 'border-slate-200 text-slate-600' : 'border-white/10 text-slate-400'
              }`}>
                <span className="flex items-center gap-1.5">
                  <Pill className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-[#00acc1]' : 'text-[#38BDF8]'}`} />
                  <span>Sisa Stok Obat:</span>
                </span>
                <span className={`font-semibold font-mono ${
                  theme === 'light' ? 'text-[#051226] font-bold' : 'text-white'
                }`}>
                  40 Dosis Tersedia
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. DUAL-ROW KINETIC MARQUEE                              */}
      {/* ======================================================== */}
      <section className="bg-[#38BDF8] text-slate-950 border-y-2 border-slate-950/20 py-2.5 overflow-hidden select-none">
        <div className="animate-marquee-left text-xs sm:text-sm md:text-base font-extrabold tracking-widest uppercase py-1">
          <span className="mx-4">RESPICARE SELF-MANAGER</span>
          <span className="mx-4">•</span>
          <span className="mx-4">PENGINGAT INHALER PINTAR</span>
          <span className="mx-4">•</span>
          <span className="mx-4">VALIDASI TEKNIK 30 DETIK</span>
          <span className="mx-4">•</span>
          <span className="mx-4">KONTROL ASMA &amp; PPOK</span>
          <span className="mx-4">•</span>
          <span className="mx-4">RESPICARE SELF-MANAGER</span>
          <span className="mx-4">•</span>
          <span className="mx-4">PENGINGAT INHALER PINTAR</span>
          <span className="mx-4">•</span>
          <span className="mx-4">VALIDASI TEKNIK 30 DETIK</span>
          <span className="mx-4">•</span>
          <span className="mx-4">KONTROL ASMA &amp; PPOK</span>
          <span className="mx-4">•</span>
        </div>

        <div className="animate-marquee-right text-xs sm:text-sm md:text-base font-extrabold tracking-widest uppercase py-1 border-t border-slate-950/15">
          <span className="mx-4">JADWAL TERAPI HARIAN</span>
          <span className="mx-4">•</span>
          <span className="mx-4">PANTAU STOK OBAT</span>
          <span className="mx-4">•</span>
          <span className="mx-4">LAPORAN KEPATUHAN PDF</span>
          <span className="mx-4">•</span>
          <span className="mx-4">RAMAH AKSESIBILITAS LANSIA</span>
          <span className="mx-4">•</span>
          <span className="mx-4">JADWAL TERAPI HARIAN</span>
          <span className="mx-4">•</span>
          <span className="mx-4">PANTAU STOK OBAT</span>
          <span className="mx-4">•</span>
          <span className="mx-4">LAPORAN KEPATUHAN PDF</span>
          <span className="mx-4">•</span>
          <span className="mx-4">RAMAH AKSESIBILITAS LANSIA</span>
          <span className="mx-4">•</span>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. BAGIAN PERNYATAAN EDITORIAL                           */}
      {/* ======================================================== */}
      <section id="pernyataan" className="py-24 px-6 sm:px-12 md:px-16 max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16">
          <div className="md:w-1/4">
            <span className={`tracking-widest text-xs font-bold uppercase block ${
              theme === 'light' ? 'text-[#00acc1]' : 'text-[#38BDF8]'
            }`}>
              MENGAPA RESPICARE
            </span>
          </div>

          <div className="md:w-3/4">
            <p className={`text-2xl sm:text-3xl md:text-4xl font-serif font-normal leading-relaxed ${
              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <span className={theme === 'light' ? 'text-[#051226] font-bold' : 'text-white font-semibold'}>Banyak pasien menghentikan terapi</span> saat gejala mereda, padahal{' '}
              <span className={theme === 'light' ? 'text-[#051226] font-bold' : 'text-white font-semibold'}>konsistensi dosis</span> dan{' '}
              <span className={theme === 'light' ? 'text-[#051226] font-bold' : 'text-white font-semibold'}>ketepatan teknik inhaler</span> adalah kunci utama mencegah{' '}
              <span className={theme === 'light' ? 'text-[#051226] font-bold' : 'text-white font-semibold'}>kekambuhan sesak napas</span> dan risiko rawat inap ulang.
            </p>
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 border-t ${
          theme === 'light' ? 'border-slate-200' : 'border-white/10'
        }`}>
          <div className={`rounded-3xl overflow-hidden border p-6 sm:p-8 shadow-2xl relative ${
            theme === 'light'
              ? 'bg-white border-slate-200 text-[#051226]'
              : 'border-white/10 bg-slate-900/60 text-white'
          }`}>
            <div className={`flex items-center justify-between text-xs font-mono mb-6 ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <span className={`font-bold ${theme === 'light' ? 'text-[#00acc1]' : 'text-[#38BDF8]'}`}>RITME KONTROL MANDIRI</span>
              <span>STANDAR GINA / GOLD</span>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono ${
                    theme === 'light' ? 'bg-blue-100 text-[#0d47a1]' : 'bg-blue-500/20 text-[#38BDF8]'
                  }`}>
                    07
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${theme === 'light' ? 'text-[#051226]' : 'text-white'}`}>Inhaler Controller</h4>
                    <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Dosis Pagi • Terverifikasi Video</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  theme === 'light' ? 'text-emerald-800 bg-emerald-100 border-emerald-300' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  100% Tepat
                </span>
              </div>

              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono ${
                    theme === 'light' ? 'bg-sky-100 text-[#00acc1]' : 'bg-sky-500/20 text-sky-400'
                  }`}>
                    19
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${theme === 'light' ? 'text-[#051226]' : 'text-white'}`}>Inhaler Malam</h4>
                    <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Dosis Malam • Pengingat Aktif</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  theme === 'light' ? 'text-[#0d47a1] bg-sky-100 border-sky-300' : 'text-sky-400 bg-sky-500/10 border-sky-500/20'
                }`}>
                  Terjadwal
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className={`text-xs font-bold tracking-wider uppercase font-mono ${
                theme === 'light' ? 'text-[#00acc1]' : 'text-[#38BDF8]'
              }`}>
                01. WAKTU KONSISTEN
              </span>
              <h4 className={`text-lg font-bold ${theme === 'light' ? 'text-[#051226]' : 'text-white'}`}>Mencegah Fluktuasi Obstruksi</h4>
              <p className={`text-sm leading-relaxed font-normal ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Jadwal terapi yang presisi menjaga kestabilan barier bronkus dan mencegah spasme saluran napas yang tidak terduga.
              </p>
            </div>

            <div className={`space-y-1.5 pt-2 border-t ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
              <span className={`text-xs font-bold tracking-wider uppercase font-mono ${
                theme === 'light' ? 'text-[#00acc1]' : 'text-[#38BDF8]'
              }`}>
                02. DEPOSISI MAKSIMAL
              </span>
              <h4 className={`text-lg font-bold ${theme === 'light' ? 'text-[#051226]' : 'text-white'}`}>Meniadakan Kesalahan Teknik</h4>
              <p className={`text-sm leading-relaxed font-normal ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Validasi 30 detik memandu posisi mouthpiece dan waktu tahan napas 10 detik agar obat sampai ke alveolus terdalam.
              </p>
            </div>

            <div className={`space-y-1.5 pt-2 border-t ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
              <span className={`text-xs font-bold tracking-wider uppercase font-mono ${
                theme === 'light' ? 'text-[#00acc1]' : 'text-[#38BDF8]'
              }`}>
                03. PENGAWASAN NYATA
              </span>
              <h4 className={`text-lg font-bold ${theme === 'light' ? 'text-[#051226]' : 'text-white'}`}>Rekapitulasi Klinis Dokter</h4>
              <p className={`text-sm leading-relaxed font-normal ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Data harian otomatis terekam dalam format laporan kepatuhan yang memperkuat dasar evaluasi terapi saat kontrol rutin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SHOWCASE PRATINJAU VIDEO PANDUAN 30 DETIK             */}
      {/* ======================================================== */}
      <section id="video-showcase" className="py-24 px-6 sm:px-12 md:px-16 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className={`tracking-widest text-xs font-bold uppercase block ${
            theme === 'light' ? 'text-[#00acc1]' : 'text-[#38BDF8]'
          }`}>
            VALIDASI TEKNIK INHALER
          </span>
          <h2 className={`text-2xl sm:text-4xl font-serif font-bold ${
            theme === 'light' ? 'text-[#051226]' : 'text-white'
          }`}>
            Simulasi Panduan Langkah Demi Langkah 30 Detik
          </h2>
        </div>

        <div className={`max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl relative p-6 sm:p-10 border ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-[#051226]'
            : 'bg-slate-900/90 border-white/10 text-white'
        }`}>
          <div className={`flex items-center justify-between text-xs font-mono pb-4 border-b ${
            theme === 'light' ? 'border-slate-200 text-slate-600' : 'border-white/10 text-slate-400'
          }`}>
            <span className={`flex items-center gap-2 font-bold ${
              theme === 'light' ? 'text-[#051226]' : 'text-white'
            }`}>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              SIMULASI MANDIRI INTERAKTIF
            </span>
            <span className={`px-3 py-1 rounded-full font-bold ${
              theme === 'light' ? 'bg-blue-100 text-[#0d47a1]' : 'bg-blue-500/20 text-[#38BDF8]'
            }`}>
              HITUNG MUNDUR: 00:30
            </span>
          </div>

          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg animate-bounce border ${
              theme === 'light'
                ? 'bg-sky-100 text-[#0d47a1] border-sky-300 shadow-sky-500/10'
                : 'bg-sky-400/20 text-[#38BDF8] border-sky-400/30 shadow-sky-500/20'
            }`}>
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <h3 className={`text-xl sm:text-2xl font-bold font-sans ${
                theme === 'light' ? 'text-[#051226]' : 'text-white'
              }`}>
                "Kocok Inhaler, Buang Napas Penuh, Hirup Perlahan &amp; Tahan 10 Detik"
              </h3>
              <p className={`text-sm font-normal ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Sistem pengunci memastikan pasien mengamati simulasi hingga selesai sebelum tombol verifikasi dapat diaktifkan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl pt-4">
              <div className={`p-3.5 rounded-2xl border text-left ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <span className={`text-xs font-bold font-mono block ${
                  theme === 'light' ? 'text-[#00acc1]' : 'text-[#38BDF8]'
                }`}>LANGKAH 1</span>
                <span className={`text-xs font-medium ${
                  theme === 'light' ? 'text-slate-700' : 'text-slate-200'
                }`}>Kocok Inhaler 5 Detik</span>
              </div>
              <div className={`p-3.5 rounded-2xl border text-left ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <span className={`text-xs font-bold font-mono block ${
                  theme === 'light' ? 'text-[#00acc1]' : 'text-[#38BDF8]'
                }`}>LANGKAH 2</span>
                <span className={`text-xs font-medium ${
                  theme === 'light' ? 'text-slate-700' : 'text-slate-200'
                }`}>Hirup Perlahan &amp; Dalam</span>
              </div>
              <div className={`p-3.5 rounded-2xl border text-left ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <span className={`text-xs font-bold font-mono block ${
                  theme === 'light' ? 'text-[#00acc1]' : 'text-[#38BDF8]'
                }`}>LANGKAH 3</span>
                <span className={`text-xs font-medium ${
                  theme === 'light' ? 'text-slate-700' : 'text-slate-200'
                }`}>Tahan Napas 10 Detik</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. INTERACTIVE FEATURE SWITCHER (RUANG ATAS pt-28 pb-20) */}
      {/* ======================================================== */}
      <section
        id="fitur-section"
        className="bg-[#E0F2FE] text-slate-900 pt-28 pb-20 px-6 sm:px-12 md:px-16 rounded-t-[40px] shadow-2xl relative z-10 space-y-16"
      >
        {/* Header Tengah */}
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold tracking-widest text-blue-700 uppercase block font-mono">
            FITUR UTAMA SISTEM
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 max-w-3xl mx-auto leading-tight">
            "Dirancang untuk Kepatuhan Terapi yang Konsisten dan Mudah Dipahami"
          </h2>
        </div>

        {/* Layout Interaktif 3 Kolom Proporsional (Grid 12 Kolom) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto">
          {/* Kolom Kiri (lg:col-span-4): Label, Judul Aktif, Deskripsi, Tombol Coba */}
          <div className="lg:col-span-4 space-y-6">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono">
              {featureItems[activeFeature].badge}
            </span>

            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block font-mono">
                {featureItems[activeFeature].subtitle}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans leading-tight">
                {featureItems[activeFeature].title}
              </h3>
            </div>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
              {featureItems[activeFeature].description}
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={onStart}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-7 py-3.5 rounded-full shadow-lg transition-all duration-300 flex items-center gap-3 text-sm cursor-pointer"
              >
                <span>COBA FITUR</span>
                <ArrowRight className="w-4 h-4 text-[#38BDF8]" />
              </button>
            </div>
          </div>

          {/* Kolom Tengah (lg:col-span-4): Kartu Pratinjau UI Putih (min-h-[340px] Tetap) */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl shadow-xl bg-white p-6 border border-slate-200/80 min-h-[340px] flex flex-col justify-between transition-all duration-300">
              {/* Feature 0: Jadwal Terapi Harian */}
              {activeFeature === 0 && (
                <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-600 font-mono">
                        SIMULASI JADWAL HARIAN
                      </span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                        HARI INI
                      </span>
                    </div>
                    <div className="mt-3 space-y-2.5">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-600 font-medium">Pukul 07:00</span>
                          <h4 className="text-sm font-bold text-slate-900">Budesonide (Controller)</h4>
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          Konfirmasi
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-emerald-800 font-medium">Pukul 13:00</span>
                          <h4 className="text-sm font-bold text-slate-900">Salbutamol (Reliever)</h4>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                          Sudah Diminum ✓
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-600 text-center font-medium pt-2 border-t border-slate-100">
                    Notifikasi otomatis terkirim 30 menit sebelum jadwal
                  </div>
                </div>
              )}

              {/* Feature 1: Panduan Video Inhaler */}
              {activeFeature === 1 && (
                <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-600 font-mono">
                      SIMULASI MONITOR 30S
                    </span>
                    <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full">
                      PENGUNCI AKTIF
                    </span>
                  </div>
                  <div className="aspect-video w-full rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center">
                    <Timer className="w-8 h-8 text-[#38BDF8] animate-spin mb-1.5" />
                    <span className="text-base font-bold font-mono">00:05 / 00:30</span>
                    <span className="text-xs text-slate-300 mt-0.5">Panduan Visual Sedang Berjalan</span>
                  </div>
                  <div className="w-full bg-slate-100 text-slate-600 py-2.5 rounded-xl text-center text-xs font-bold cursor-not-allowed border border-slate-300">
                    Tombol Terbuka Setelah 30 Detik
                  </div>
                </div>
              )}

              {/* Feature 2: Pelacak Stok Obat */}
              {activeFeature === 2 && (
                <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-600 font-mono">
                        PELACAK SISA DOSIS
                      </span>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
                        STOK AKTIF
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 mt-3">
                      <div className="flex justify-between text-sm font-bold text-slate-800">
                        <span>Budesonide 200mcg</span>
                        <span className="text-blue-600 font-mono">40 / 120 Dosis</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full w-[33%] rounded-full" />
                      </div>
                      <span className="text-[11px] text-slate-600 block font-medium">Sisa estimasi penggunaan: 20 hari lagi</span>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                    ⚠️ Pengingat: Siapkan resep ulang saat sisa dosis di bawah 20 semprotan.
                  </div>
                </div>
              )}

              {/* Feature 3: Laporan PDF Dokter */}
              {activeFeature === 3 && (
                <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-600 font-mono">
                        REKAPITULASI KLINIS
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        FORMAT PDF
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center gap-3 mt-3">
                      <FileDown className="w-8 h-8 text-blue-600 shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Laporan_Kepatuhan_November.pdf</h4>
                        <p className="text-xs text-slate-600 font-medium">60 Dosis Terjadwal • 92% Patuh</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-center text-xs font-bold shadow-sm">
                    Unduh Dokumen Konsultasi Dokter
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan (lg:col-span-4): Daftar 4 Menu Fitur Stabil via onClick */}
          <div className="lg:col-span-4 space-y-3">
            {featureItems.map((f, idx) => {
              const isActive = activeFeature === idx;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFeature(idx)}
                  className={`w-full text-left py-4 px-4 rounded-xl transition-all duration-200 cursor-pointer whitespace-normal ${
                    isActive
                      ? 'bg-white text-blue-600 font-bold shadow-sm border border-slate-200/70 scale-[1.02]'
                      : 'text-slate-700 hover:bg-white/50 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base leading-snug">{f.menuTitle}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold transition-opacity ${
                        isActive ? 'bg-blue-50 text-blue-600 opacity-100' : 'opacity-0'
                      }`}
                    >
                      Aktif
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Sederhana */}
        <div className="pt-16 border-t border-slate-300/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
          <p>© 2026 RespiCare Self-Manager • Sistem Mandiri Terapi Asma &amp; PPOK</p>
          <div className="flex items-center gap-6 font-medium">
            <button type="button" onClick={onLogin} className="hover:text-slate-900">
              Portal Pasien
            </button>
            <button type="button" onClick={() => scrollToSection('hero')} className="hover:text-slate-900">
              Kembali ke Atas ↑
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
