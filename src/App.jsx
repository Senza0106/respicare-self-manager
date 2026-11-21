import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './components/LandingPage';
import {
  LayoutDashboard,
  Calendar,
  Plus,
  BarChart3,
  User,
  LogOut,
  HeartPulse,
  Bell,
  BellRing,
  Mail,
  Check,
  CheckCircle2,
  Clock,
  Wind,
  Pill,
  Play,
  X,
  Timer,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Lock,
  Key,
  Lightbulb,
  Flame,
  TrendingUp,
  Info,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  Activity,
  FileDown,
  RotateCcw,
  Sun,
  Moon,
  Phone,
  PhoneCall,
  PhoneOff,
  MessageCircle,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Users,
  UserCheck,
  AlertTriangle,
  Copy,
  Share2,
} from 'lucide-react';

// ==========================================================
// WEB AUDIO API GENTLE REMINDER CHIME ENGINE
// Melodic alert tones (E5 -> G#5 -> B5 -> E6) without external files
// ==========================================================
let audioCtxInstance = null;

const playGentleChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtxInstance) {
      audioCtxInstance = new AudioContextClass();
    }
    if (audioCtxInstance.state === 'suspended') {
      audioCtxInstance.resume();
    }

    const now = audioCtxInstance.currentTime;
    const notes = [659.25, 830.61, 987.77, 1318.51]; // Harmonic gentle chime

    notes.forEach((freq, idx) => {
      const osc = audioCtxInstance.createOscillator();
      const gain = audioCtxInstance.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.38);

      osc.connect(gain);
      gain.connect(audioCtxInstance.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.42);
    });
  } catch (err) {
    console.warn('Audio playback not permitted or unavailable:', err);
  }
};

export default function App() {
  // ==========================================================
  // TOP-LEVEL VIEW ROUTING: 'landing' | 'login' | 'dashboard'
  // Disetel default 'dashboard' atau 'login' agar langsung aktif
  // ==========================================================
  const [currentView, setCurrentView] = useState('login');

  // Peran Pengguna Aktif: 'pasien' | 'pendamping'
  const [userRole, setUserRole] = useState('pasien');

  // Pilihan Tab Peran di Halaman Login: 'pasien' | 'pendamping'
  const [loginRole, setLoginRole] = useState('pasien');

  // Mode Tema Global: 'dark' | 'light' (tersimpan di localStorage)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('respicare-theme') || 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    localStorage.setItem('respicare-theme', theme);
  }, [theme]);

  const isDark = theme === 'dark';

  // Navigation Tabs in Dashboard: 'jadwal' | 'tambah' | 'laporan' | 'kontak' | 'akun'
  const [activeTab, setActiveTab] = useState('jadwal');

  // Patient Profile Data
  const [profile, setProfile] = useState({
    name: 'Sendy Nevertheless',
    rm: 'RM-2026-040',
    email: 'sendyi0110@gmail.com',
    phone: '085832713744',
    address: 'Dusun Dawung Desa Bedug Kec. Ngadiluwih',
    birthDate: '01 Sep 2008',
    age: '18 tahun',
    gender: 'Laki-laki',
    condition: 'Asma Bronkial & PPOK Derajat 2',
    targetBp: '- mmHg',
    emergencyContact: 'Siti Rahayu (0812-3456-7890)',
    guardianPhone: '081234567890',
  });

  // Login Form State
  const [loginForm, setLoginForm] = useState({
    email: 'sendyi0110@gmail.com',
    password: 'password123',
    rememberMe: true,
  });
  const [showPassword, setShowPassword] = useState(false);

  // State untuk Validasi Kode Pairing Pendamping Keluarga
  const [pairingCode, setPairingCode] = useState('');
  const [pairingError, setPairingError] = useState('');
  const [copiedPairing, setCopiedPairing] = useState(false);

  // Verifikasi Kode Pairing (No. RM RM-2026-040 atau PIN 8492)
  const isPairingVerified =
    loginRole === 'pendamping' &&
    (pairingCode.trim().toUpperCase() === profile.rm.toUpperCase() ||
      pairingCode.trim() === '8492');

  const handleCopyPairing = () => {
    const textToCopy = `Kode Pairing RespiCare Pasien\nNama: ${profile.name}\nNo. RM: ${profile.rm}\nPIN: 8492`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopiedPairing(true);
    setToastMessage(`✓ Kode Pairing Pasien (${profile.rm} / PIN 8492) berhasil disalin!`);
    setTimeout(() => setCopiedPairing(false), 2500);
  };

  // Schedule Medications Data (dengan Dosis per Kali Minum & Satuan Sediaan)
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      name: 'Inhaler Budesonide (Controller)',
      time: '07:00',
      type: 'Inhaler',
      status: 'Belum Minum',
      stock: 40,
      dosePerTake: 2,
      unit: 'semprotan',
      instructions:
        'Kocok inhaler 5 detik, buang napas penuh, rapatkan bibir di mouthpiece, hirup perlahan sambil menekan tabung, lalu tahan napas 10 detik.',
      steps: ['Kocok & Buang Napas', 'Hirup Perlahan', 'Tahan Napas 10 Detik'],
    },
    {
      id: 2,
      name: 'Teofilin 150mg',
      time: '08:30',
      type: 'Oral',
      status: 'Belum Minum',
      stock: 24,
      dosePerTake: 1,
      unit: 'tablet',
      instructions:
        'Minum bersama segelas air putih penuh (200-250 ml) setelah makan. Telan tablet secara utuh tanpa dikunyah atau digerus.',
      steps: ['Siapkan Air Putih', 'Minum Sesudah Makan', 'Telan Utuh'],
    },
    {
      id: 3,
      name: 'Inhaler Salbutamol',
      time: '13:00',
      type: 'Inhaler',
      status: 'Sudah Minum',
      stock: 55,
      dosePerTake: 2,
      unit: 'semprotan',
      instructions:
        'Gunakan pelega saat sesak atau pencegahan. Beri jeda 1 menit antar semprotan jika membutuhkan dosis kedua.',
      steps: ['Kocok Inhaler', 'Hisap Kuat & Cepat', 'Bilas Mulut'],
    },
    {
      id: 4,
      name: 'Ambroxol Sirup 30mg/5ml',
      time: '18:00',
      type: 'Sirup',
      status: 'Belum Minum',
      stock: 60,
      dosePerTake: 5,
      unit: 'ml',
      instructions:
        'Kocok botol sirup sebelum diminum. Gunakan sendok takar 5 ml yang disertakan, minum sesudah makan.',
      steps: ['Kocok Botol Sirup', 'Ukur 5 ml Sendok Takar', 'Minum Perlahan & Bilas Sendok'],
    },
  ]);

  // Form Tambah Obat Baru (Tab 'tambah')
  const [newMed, setNewMed] = useState({
    name: '',
    type: 'Inhaler',
    time: '18:00',
    stock: 40,
    dosePerTake: 2,
    syrupVolume: 60,
    syrupDose: 5,
  });

  // Modal 30-Second Video Validation State
  const [activeMedication, setActiveMedication] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // ==========================================================
  // ALARM OTOMATIS & MODAL PERINGATAN ALARM
  // ==========================================================
  const [alarmModal, setAlarmModal] = useState({
    isOpen: false,
    med: null,
  });
  const alarmIntervalRef = useRef(null);

  const triggerAlarmSound = (medication) => {
    setAlarmModal({ isOpen: true, med: medication });
    playGentleChime();
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    alarmIntervalRef.current = setInterval(playGentleChime, 1800);

    // Kirim Browser Push Notification jika diizinkan
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`Waktunya Terapi: ${medication.name}! ⏰`, {
          body: `Jadwal ${medication.time} WIB. Segera lakukan terapi mandiri dan buka panduan teknik pakai.`,
          icon: '/favicon.ico',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification(`Waktunya Terapi: ${medication.name}! ⏰`, {
              body: `Jadwal ${medication.time} WIB. Segera lakukan terapi mandiri dan buka panduan teknik pakai.`,
              icon: '/favicon.ico',
            });
          }
        });
      }
    }
  };

  const handleStopAlarmAndOpenGuide = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    const med = alarmModal.med;
    setAlarmModal({ isOpen: false, med: null });
    if (med) {
      handleOpenValidation(med);
    }
  };

  const handleSnoozeAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    const medName = alarmModal.med?.name || 'Obat';
    setAlarmModal({ isOpen: false, med: null });
    setToastMessage(`⏰ Alarm "${medName}" ditunda selama 5 menit.`);
  };

  // ==========================================================
  // MODAL SIMULASI PANGGILAN CEPAT (ONE-TAP CALL)
  // ==========================================================
  const [callModal, setCallModal] = useState({
    isOpen: false,
    targetName: '',
    targetPhone: '',
    callReason: '',
    duration: 0,
    isConnected: false,
    isMuted: false,
    isSpeakerOn: true,
  });
  const callTimerRef = useRef(null);

  const handleStartCall = (targetName, targetPhone, reason) => {
    setCallModal({
      isOpen: true,
      targetName,
      targetPhone,
      callReason: reason,
      duration: 0,
      isConnected: false,
      isMuted: false,
      isSpeakerOn: true,
    });

    // Simulasi panggilan terhubung dalam 1.2 detik
    setTimeout(() => {
      setCallModal((prev) => ({ ...prev, isConnected: true }));
    }, 1200);
  };

  useEffect(() => {
    if (callModal.isOpen && callModal.isConnected) {
      callTimerRef.current = setInterval(() => {
        setCallModal((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [callModal.isOpen, callModal.isConnected]);

  const handleEndCall = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    const dur = callModal.duration;
    const mins = Math.floor(dur / 60);
    const secs = dur % 60;
    const durStr = `${mins > 0 ? `${mins}m ` : ''}${secs}s`;
    setCallModal((prev) => ({ ...prev, isOpen: false }));
    setToastMessage(`📞 Panggilan selesai (Durasi: ${durStr}).`);
  };

  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  // Password Change Form State
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  // Auto-dismiss Toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Countdown Timer for Validation Modal (5 detik simulasi dari 30 detik)
  useEffect(() => {
    let timerId;
    if (activeMedication) {
      if (countdown > 0) {
        timerId = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      } else {
        setIsUnlocked(true);
      }
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [activeMedication, countdown]);

  const handleOpenValidation = (med) => {
    setActiveMedication(med);
    setCountdown(5);
    setIsUnlocked(false);
  };

  const handleCloseValidation = () => {
    setActiveMedication(null);
    setCountdown(5);
    setIsUnlocked(false);
  };

  const handleConfirmDose = () => {
    if (!isUnlocked || !activeMedication) return;

    const doseToDeduct =
      Number(activeMedication.dosePerTake) ||
      (activeMedication.type === 'Inhaler'
        ? 2
        : activeMedication.type === 'Sirup'
        ? 5
        : 1);

    const unitText =
      activeMedication.unit ||
      (activeMedication.type === 'Inhaler'
        ? 'semprotan'
        : activeMedication.type === 'Sirup'
        ? 'ml'
        : 'tablet');

    setSchedules((prev) =>
      prev.map((item) => {
        if (item.id === activeMedication.id) {
          const currentStock = Number(item.stock) || 0;
          const newStock = Math.max(0, currentStock - doseToDeduct);
          return {
            ...item,
            status: 'Sudah Minum',
            stock: newStock,
          };
        }
        return item;
      })
    );
    handleCloseValidation();
    setToastMessage(
      `✓ Dosis "${activeMedication.name}" berhasil dikonfirmasi! Stok berkurang -${doseToDeduct} ${unitText}.`
    );
  };

  const handleAddMedicationSubmit = (e) => {
    e.preventDefault();
    if (!newMed.name.trim()) return;

    const isSirup = newMed.type === 'Sirup';
    const isInhaler = newMed.type === 'Inhaler';

    const stockVal = isSirup
      ? Number(newMed.syrupVolume) || 60
      : Number(newMed.stock) || 30;

    const doseVal = isSirup
      ? Number(newMed.syrupDose) || 5
      : Number(newMed.dosePerTake) || (isInhaler ? 2 : 1);

    const unitVal = isSirup ? 'ml' : isInhaler ? 'semprotan' : 'tablet';

    const medToAdd = {
      id: Date.now(),
      name: newMed.name.trim(),
      type: newMed.type,
      time: newMed.time || '18:00',
      stock: stockVal,
      dosePerTake: doseVal,
      unit: unitVal,
      status: 'Belum Minum',
      instructions:
        newMed.type === 'Inhaler'
          ? 'Kocok inhaler 5 detik, buang napas penuh, rapatkan bibir di mouthpiece, hirup perlahan lalu tahan napas 10 detik.'
          : newMed.type === 'Sirup'
          ? `Kocok botol sirup, gunakan sendok takar presisi ${doseVal} ml, minum sesudah makan.`
          : `Minum ${doseVal} tablet bersama air putih hangat setelah makan, telan utuh tanpa digerus.`,
      steps:
        newMed.type === 'Inhaler'
          ? ['Kocok & Buang Napas', 'Hirup Perlahan', 'Tahan Napas 10 Detik']
          : newMed.type === 'Sirup'
          ? ['Kocok Botol Sirup', `Ukur ${doseVal} ml di Sendok Takar`, 'Minum Perlahan & Bilas Sendok']
          : ['Siapkan Air Putih', 'Minum Sesudah Makan', 'Telan Utuh'],
    };

    setSchedules((prev) => [...prev, medToAdd]);
    setNewMed({
      name: '',
      type: 'Inhaler',
      time: '18:00',
      stock: 40,
      dosePerTake: 2,
      syrupVolume: 60,
      syrupDose: 5,
    });
    setActiveTab('jadwal');
    setToastMessage(`✓ Jadwal "${medToAdd.name}" (${doseVal} ${unitVal}/kali) berhasil disimpan!`);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setToastMessage('✓ Informasi data diri berhasil diperbarui!');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwords.newPass || passwords.newPass !== passwords.confirm) {
      alert('Password baru dan konfirmasi password tidak cocok.');
      return;
    }
    setPasswords({ current: '', newPass: '', confirm: '' });
    setToastMessage('✓ Password Anda berhasil diubah!');
  };

  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();

    // Validasi Kode Pairing Pasien khusus untuk Pendamping Keluarga
    if (loginRole === 'pendamping') {
      const code = pairingCode.trim().toUpperCase();
      if (!code) {
        setPairingError('Kode Pairing Pasien / No. Rekam Medis wajib diisi.');
        return;
      }
      if (code !== profile.rm.toUpperCase() && code !== '8492') {
        setPairingError(
          `Kode "${pairingCode}" tidak terdaftar. Masukkan No. RM pasien yang sesuai (contoh: ${profile.rm}) atau PIN 8492.`
        );
        return;
      }
      setPairingError('');
    }

    setUserRole(loginRole);
    setCurrentView('dashboard');
    setActiveTab('jadwal');
    setToastMessage(
      `Selamat Datang, ${
        loginRole === 'pasien' ? profile.name : 'Pendamping Keluarga'
      }! 👋`
    );
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    setCurrentView('landing');
    setToastMessage('Anda telah berhasil keluar dari sesi.');
  };

  const handleDownloadPdf = () => {
    setToastMessage(
      '✅ Laporan PDF Terapi Berhasil Dibuat! Dokumen siap dibagikan kepada Dokter Spesialis Paru.'
    );
  };

  // Stats Calculations
  const totalSchedules = schedules.length;
  const completedCount = schedules.filter((s) => s.status === 'Sudah Minum').length;
  const pendingMedications = schedules.filter((s) => s.status !== 'Sudah Minum');
  const missedCount = 0;
  const adherenceRate =
    totalSchedules > 0 ? Math.round((completedCount / totalSchedules) * 100) : 0;

  // 7-day Historical Statistics Data
  const historyData = [
    {
      date: '11 Nov 2026',
      isToday: true,
      total: `${totalSchedules} jadwal`,
      completed: completedCount,
      missed: missedCount,
      percentage: `${adherenceRate}%`,
      status: adherenceRate >= 80 ? 'Bagus' : 'Kurang',
    },
    {
      date: '10 Nov 2026',
      isToday: false,
      total: '3 jadwal',
      completed: 3,
      missed: 0,
      percentage: '100%',
      status: 'Bagus',
    },
    {
      date: '09 Nov 2026',
      isToday: false,
      total: '3 jadwal',
      completed: 3,
      missed: 0,
      percentage: '100%',
      status: 'Bagus',
    },
    {
      date: '08 Nov 2026',
      isToday: false,
      total: '3 jadwal',
      completed: 2,
      missed: 1,
      percentage: '67%',
      status: 'Kurang',
    },
    {
      date: '07 Nov 2026',
      isToday: false,
      total: '3 jadwal',
      completed: 3,
      missed: 0,
      percentage: '100%',
      status: 'Bagus',
    },
    {
      date: '06 Nov 2026',
      isToday: false,
      total: '3 jadwal',
      completed: 3,
      missed: 0,
      percentage: '100%',
      status: 'Bagus',
    },
    {
      date: '05 Nov 2026',
      isToday: false,
      total: '3 jadwal',
      completed: 2,
      missed: 1,
      percentage: '67%',
      status: 'Kurang',
    },
  ];

  // Navigation Items for Dashboard
  const navItems =
    userRole === 'pasien'
      ? [
          { id: 'jadwal', label: 'Jadwal Terapi', icon: Calendar },
          { id: 'tambah', label: 'Atur Jadwal Baru', icon: Plus },
          { id: 'laporan', label: 'Laporan Kepatuhan', icon: BarChart3 },
          { id: 'akun', label: 'Profil & Medis', icon: User },
        ]
      : [
          { id: 'jadwal', label: 'Pantauan Pasien', icon: Calendar },
          { id: 'kontak', label: 'Telepon Pasien', icon: PhoneCall },
          { id: 'laporan', label: 'Laporan Pasien', icon: BarChart3 },
          { id: 'akun', label: 'Data Pasien & Akses', icon: User },
        ];

  // Style Tokens based on Theme (5-color cyan-blue palette: #e0f7fa, #4dd0e1, #00acc1, #1976d2, #0d47a1)
  const bgMain = isDark ? 'bg-[#051226]' : 'bg-[#f0f9ff]';
  const textMain = isDark ? 'text-[#e0f7fa]' : 'text-[#051226]';
  const cardBg = isDark
    ? 'bg-[#081b3a] border border-[#00acc1]/25 text-[#e0f7fa] shadow-2xl'
    : 'bg-white border border-slate-200 text-[#051226] shadow-sm';
  const inputBg = isDark
    ? 'bg-[#051226]/80 border border-[#00acc1]/30 text-[#e0f7fa] placeholder:text-slate-500 focus:border-[#4dd0e1]'
    : 'bg-slate-50 border border-slate-300 text-[#051226] placeholder:text-slate-400 focus:border-[#1976d2] shadow-2xs';
  const btnPrimary = isDark
    ? 'bg-[#4dd0e1] hover:brightness-110 active:brightness-95 text-[#051226] font-bold shadow-md shadow-[#00acc1]/25'
    : 'bg-[#0d47a1] hover:bg-[#1976d2] active:bg-[#0d47a1] text-white font-bold shadow-md shadow-[#0d47a1]/20';
  const textTitle = isDark ? 'text-white' : 'text-[#051226] font-bold';
  const textBody = isDark ? 'text-slate-300' : 'text-slate-700';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-600 font-medium';
  const textLabel = isDark ? 'text-slate-400' : 'text-slate-600 font-semibold';
  const borderLight = isDark ? 'border-white/10' : 'border-slate-200';
  const borderSubtle = isDark ? 'border-white/5' : 'border-slate-200';

  // ==========================================================
  // VIEW 1: LANDING PAGE
  // ==========================================================
  if (currentView === 'landing') {
    return (
      <LandingPage
        onLogin={() => setCurrentView('login')}
        onStart={() => setCurrentView('login')}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  // ==========================================================
  // VIEW 2: HALAMAN LOGIN — ASYMMETRICAL SPLIT-SCREEN DARK EDITORIAL
  // ==========================================================
  if (currentView === 'login') {
    return (
      <div
        className={`min-h-screen grid grid-cols-1 lg:grid-cols-12 ${
          isDark ? 'bg-[#051226] text-[#e0f7fa]' : 'bg-[#f0f9ff] text-[#051226]'
        } selection:bg-[#4dd0e1] selection:text-[#051226] font-sans antialiased`}
      >
        {/* ============================================================ */}
        {/* KOLOM KIRI (lg:col-span-7) — TAMPIL DI DESKTOP               */}
        {/* ============================================================ */}
        <div
          className="hidden lg:flex lg:col-span-7 flex-col justify-between p-8 xl:p-14 relative overflow-hidden"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse 80% 65% at 10% 90%, rgba(0, 172, 193, 0.22) 0%, rgba(25, 118, 210, 0.16) 40%, rgba(13, 71, 161, 0.10) 70%, transparent 85%), radial-gradient(ellipse 55% 45% at 85% 15%, rgba(77, 208, 225, 0.12) 0%, transparent 60%)'
              : 'radial-gradient(ellipse 80% 65% at 10% 90%, rgba(77, 208, 225, 0.25) 0%, rgba(224, 247, 250, 0.4) 40%, transparent 80%)',
          }}
        >
          {/* Subtle grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-15"
            style={{
              backgroundImage:
                'radial-gradient(rgba(0, 172, 193, 0.4) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Header kiri: Tombol Kembali ke Beranda & Theme Toggle */}
          <div className="relative z-10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentView('landing')}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200 backdrop-blur-sm cursor-pointer shadow-sm group ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                  : 'bg-white border border-slate-300 text-slate-700 hover:text-[#0d47a1] hover:bg-slate-50 font-semibold'
              }`}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>← Kembali ke Beranda</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all cursor-pointer backdrop-blur-sm ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-amber-300 hover:bg-white/10'
                  : 'bg-slate-100 border border-slate-300 text-[#051226] shadow-sm hover:bg-slate-200'
              }`}
              title={isDark ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-[#051226]" />}
            </button>
          </div>

          {/* Konten Tengah Kiri: Headline Editorial */}
          <div className="relative z-10 max-w-xl my-auto py-12">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 backdrop-blur-sm ${
              isDark
                ? 'bg-[#00acc1]/15 border border-[#4dd0e1]/30 text-[#4dd0e1]'
                : 'bg-[#0d47a1]/10 border border-[#0d47a1]/20 text-[#0d47a1] font-bold'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                isDark ? 'bg-[#4dd0e1]' : 'bg-[#0d47a1]'
              }`} />
              <span>Portal Terapi Mandiri Pasien</span>
            </div>
            <h1 className={`text-4xl xl:text-5xl font-bold tracking-tight leading-tight font-serif ${
              isDark ? 'text-white' : 'text-[#051226]'
            }`}>
              Disiplin Terapi Harian untuk Napas yang Lebih Lega.
            </h1>
            <p className={`text-base xl:text-lg mt-4 leading-relaxed ${
              isDark ? 'text-slate-400 font-normal' : 'text-slate-600 font-medium'
            }`}>
              Pantau kepatuhan konsumsi obat pengendali dan pelega pernapasan Anda
              dengan verifikasi teknik pakai secara presisi.
            </p>

            <div className={`mt-8 flex items-center gap-6 text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-600 font-semibold'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Teknik Inhalasi MDI Tervalidasi</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`} />
                <span>Monitoring Rekam Medis Real-time</span>
              </div>
            </div>
          </div>

          {/* Bagian Bawah Kiri: Kartu Pratinjau Jadwal Mini */}
          <div className="relative z-10">
            <div
              className={`rounded-2xl p-5 max-w-md shadow-2xl space-y-3 backdrop-blur-md ${
                isDark
                  ? 'bg-[#081b3a]/90 border border-[#00acc1]/30 text-white'
                  : 'bg-white border border-slate-200 text-[#051226] shadow-xl'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`} />
                  Pengingat Terdekat
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  isDark
                    ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/30'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                }`}>
                  <Check className="w-3 h-3 stroke-[3]" />
                  Terkendali ✓
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                  isDark
                    ? 'bg-blue-500/20 text-[#4dd0e1] border border-[#4dd0e1]/30'
                    : 'bg-blue-100 text-[#0d47a1] border border-blue-200'
                }`}>
                  <Wind className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="overflow-hidden">
                  <h4 className={`text-sm font-bold truncate ${
                    isDark ? 'text-white' : 'text-[#051226]'
                  }`}>
                    Inhaler Budesonide (Controller)
                  </h4>
                  <p className={`text-xs ${
                    isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                  }`}>
                    07:00 WIB • Dosis Pagi (2 Semprotan)
                  </p>
                </div>
              </div>

              <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${
                isDark ? 'border-white/8 text-slate-400' : 'border-slate-200 text-slate-600 font-medium'
              }`}>
                <span>
                  Evaluasi Mingguan: <strong className={isDark ? 'text-white' : 'text-[#051226] font-bold'}>90.5% Patuh</strong>
                </span>
                <span className={`font-semibold ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`}>RespiCare Sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* KOLOM KANAN (lg:col-span-5) — PANEL FORMULIR LOGIN           */}
        {/* ============================================================ */}
        <div
          className={`lg:col-span-5 backdrop-blur-xl lg:border-l flex flex-col justify-center px-6 sm:px-12 py-12 relative min-h-screen lg:min-h-0 ${
            isDark
              ? 'bg-[#081b3a]/70 lg:border-[#00acc1]/20'
              : 'bg-white lg:border-slate-200 shadow-sm'
          }`}
        >
          {/* Header Bar Mobile */}
          <div className="lg:hidden mb-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentView('landing')}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-slate-300'
                  : 'bg-slate-100 border border-slate-300 text-slate-700 font-semibold'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Kembali</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-full border text-xs cursor-pointer ${
                isDark
                  ? 'bg-white/10 border-white/15 text-amber-300'
                  : 'bg-slate-100 border-slate-300 text-[#051226]'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#051226]" />}
            </button>
          </div>

          <div className="w-full max-w-sm mx-auto space-y-6">
            {/* Header Form */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0d47a1] to-[#1976d2] text-white border border-[#4dd0e1]/30 flex items-center justify-center shadow-inner">
                  <HeartPulse className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className={`text-xl font-extrabold tracking-tight font-sans ${
                  isDark ? 'text-white' : 'text-[#051226]'
                }`}>
                  Respi<span className={isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}>Care</span>
                </span>
              </div>
              <h2 className={`text-2xl font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-[#051226]'
              }`}>
                Selamat Datang Kembali
              </h2>
              <p className={`text-sm mt-1 leading-snug ${
                isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
              }`}>
                Masuk untuk memantau jadwal obat &amp; teknik inhaler Anda
              </p>
            </div>

            {/* Segmented Role Switcher: Pasien / Pendamping Keluarga */}
            <div
              className={`p-1 rounded-full border grid grid-cols-2 mb-6 ${
                isDark
                  ? 'bg-[#051226] border-[#00acc1]/25'
                  : 'bg-slate-100 border border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setLoginRole('pasien');
                  setPairingError('');
                }}
                className={`py-2 text-xs sm:text-sm font-bold rounded-full transition-all duration-200 text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginRole === 'pasien'
                    ? isDark
                      ? 'bg-[#4dd0e1] text-[#051226] shadow-md shadow-[#00acc1]/25'
                      : 'bg-[#0d47a1] text-white shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-[#051226] font-semibold'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Pasien</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginRole('pendamping');
                  setPairingError('');
                }}
                className={`py-2 text-xs sm:text-sm font-bold rounded-full transition-all duration-200 text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginRole === 'pendamping'
                    ? isDark
                      ? 'bg-[#4dd0e1] text-[#051226] shadow-md shadow-[#00acc1]/25'
                      : 'bg-[#0d47a1] text-white shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-[#051226] font-semibold'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Pendamping</span>
              </button>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs uppercase tracking-wider mb-2 ${
                  isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                }`}>
                  Email atau Nomor Rekam Medis
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    placeholder="nama@email.com atau RM-2026-xxx"
                    className={`w-full rounded-xl px-4 py-3.5 text-base focus:outline-none transition-all ${inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs uppercase tracking-wider mb-2 ${
                  isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                }`}>
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    placeholder="••••••••••••"
                    className={`w-full rounded-xl px-4 py-3.5 text-base focus:outline-none transition-all pr-12 ${inputBg}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer ${
                      isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* KHUSUS ROLE PENDAMPING KELUARGA: KODE PAIRING PASIEN / NO. RM */}
              {loginRole === 'pendamping' && (
                <div className={`p-4 rounded-2xl border space-y-2.5 transition-all animate-fade-in ${
                  isDark
                    ? 'bg-[#00acc1]/5 border-[#00acc1]/30'
                    : 'bg-blue-50/80 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <label className={`block text-xs uppercase tracking-wider font-bold ${
                      isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                    }`}>
                      Kode Pairing Pasien / No. Rekam Medis <span className="text-red-500 font-bold">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setPairingCode('RM-2026-040');
                        setPairingError('');
                      }}
                      className={`text-[11px] underline font-semibold cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#0d47a1]'
                      }`}
                      title="Klik untuk mengisi RM-2026-040 secara otomatis"
                    >
                      Gunakan RM-2026-040
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={pairingCode}
                      onChange={(e) => {
                        setPairingCode(e.target.value);
                        if (pairingError) setPairingError('');
                      }}
                      placeholder="RM-2026-040"
                      className={`w-full rounded-xl px-4 py-3.5 text-base font-mono uppercase tracking-wider focus:outline-none transition-all ${
                        pairingError
                          ? 'border-2 border-red-500 bg-red-500/10'
                          : isPairingVerified
                          ? 'border-2 border-emerald-500 bg-emerald-500/10'
                          : inputBg
                      }`}
                    />
                    {isPairingVerified && (
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                    )}
                  </div>

                  {/* Lencana Pasien Terverifikasi jika kode valid */}
                  {isPairingVerified && (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border animate-fade-in ${
                      isDark
                        ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>✓ Pasien Terverifikasi: {profile.name}</span>
                    </div>
                  )}

                  {/* Pesan Error jika kode salah atau belum cocok */}
                  {pairingError && (
                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{pairingError}</span>
                    </p>
                  )}

                  <p className={`text-[11px] leading-tight ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                    Wajib diisi untuk menghubungkan sesi ke rekam medis dan pantauan terapi pasien.
                  </p>
                </div>
              )}

              {/* Baris opsi: Checkbox Ingat Sesi & Lupa Kata Sandi */}
              <div className="flex items-center justify-between text-sm pt-1">
                <label className={`flex items-center gap-2 cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-700 hover:text-[#051226] font-medium'
                }`}>
                  <input
                    type="checkbox"
                    checked={loginForm.rememberMe}
                    onChange={(e) =>
                      setLoginForm({
                        ...loginForm,
                        rememberMe: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded bg-slate-950 border-white/20 accent-[#00acc1] cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm">Ingat sesi saya</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      'Tautan pemulihan kata sandi telah dikirimkan ke kontak terdaftar Anda.'
                    )
                  }
                  className={`text-xs sm:text-sm font-semibold hover:underline cursor-pointer ${
                    isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                  }`}
                >
                  Lupa kata sandi?
                </button>
              </div>

              {/* Tombol Utama */}
              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full font-bold text-base py-4 rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                    isDark
                      ? 'bg-[#4dd0e1] hover:brightness-110 active:brightness-95 text-[#051226] shadow-[#00acc1]/20'
                      : 'bg-[#0d47a1] hover:bg-[#1976d2] active:bg-[#0d47a1] text-white shadow-[#0d47a1]/25'
                  }`}
                >
                  <span>
                    MASUK SEBAGAI{' '}
                    {loginRole === 'pasien'
                      ? 'PASIEN'
                      : 'PENDAMPING KELUARGA'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Pendaftaran Pasien */}
            <div className={`pt-2 text-center text-xs sm:text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
            }`}>
              <span>Belum memiliki akun terapi? </span>
              <button
                type="button"
                onClick={() =>
                  alert(
                    'Pendaftaran akun baru divalidasi oleh Fasilitas Kesehatan (RS/Puskesmas). Silakan hubungi dokter spesialis paru Anda untuk registrasi nomor RM.'
                  )
                }
                className={`font-bold underline hover:brightness-125 cursor-pointer ${
                  isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                }`}
              >
                Daftar sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // VIEW 3: DASHBOARD LENGKAP DENGAN SIDEBAR & PERAN
  // ==========================================================
  return (
    <div
      className={`min-h-screen ${bgMain} ${textMain} font-sans antialiased selection:bg-[#4dd0e1] selection:text-[#051226] relative flex flex-col lg:flex-row`}
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 60% 50% at 10% 90%, rgba(0, 172, 193, 0.15) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 90% 15%, rgba(25, 118, 210, 0.12) 0%, transparent 65%)'
            : 'radial-gradient(ellipse 60% 50% at 10% 90%, rgba(77, 208, 225, 0.20) 0%, transparent 65%)',
        }}
      />

      {/* ============================================================ */}
      {/* 1. SIDEBAR KIRI TUNGGAL DI DESKTOP (lg:flex)                 */}
      {/* ============================================================ */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 z-40 p-5 justify-between backdrop-blur-xl ${
          isDark
            ? 'bg-[#051226]/95 border-r border-[#00acc1]/20'
            : 'bg-white border-r border-slate-200 shadow-sm'
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0d47a1] to-[#1976d2] text-[#e0f7fa] border border-[#4dd0e1]/30 flex items-center justify-center shadow-inner">
              <HeartPulse className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className={`text-xl font-extrabold tracking-tight font-sans leading-none ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                Respi<span className={isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}>Care</span>
              </h1>
              <p className={`text-[11px] font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {userRole === 'pasien'
                  ? 'Portal Pasien Mandiri'
                  : 'Portal Pendamping Pasien'}
              </p>
            </div>
          </div>

          {/* Lencana Statis Peran Terkunci (Read-only Badge) */}
          <div className="mb-6 px-1">
            <div
              className={`w-full inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                isDark
                  ? 'bg-[#4dd0e1]/10 text-[#4dd0e1] border-[#4dd0e1]/25'
                  : 'bg-[#0d47a1]/10 text-[#0d47a1] border border-[#0d47a1]/20'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isDark ? 'bg-[#4dd0e1]' : 'bg-[#0d47a1]'
                } animate-pulse`}
              />
              <span className="truncate">
                Sesi Aktif: {userRole === 'pasien' ? 'Pasien' : 'Pendamping Keluarga'}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            <p className={`text-[10px] font-bold tracking-wider px-3 mb-2 uppercase ${isDark ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>
              Menu Navigasi
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-left cursor-pointer ${
                    isActive
                      ? isDark
                        ? 'bg-[#4dd0e1] text-[#051226] font-bold shadow-md shadow-[#00acc1]/20'
                        : 'bg-[#0d47a1] text-white font-bold shadow-sm'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-white/5'
                      : 'text-slate-700 hover:text-[#051226] hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tombol Cepat Tes Alarm */}
          <div className={`mt-6 pt-4 border-t ${borderLight}`}>
            <button
              type="button"
              onClick={() => triggerAlarmSound(schedules[0])}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-amber-400/10 text-amber-300 border border-amber-400/25 hover:bg-amber-400/20'
                  : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 font-semibold'
              }`}
            >
              <BellRing className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>Tes Alarm Obat (Audio)</span>
            </button>
          </div>
        </div>

        {/* Bottom Sidebar: Theme Switcher & Profile Card */}
        <div className={`space-y-3 pt-4 border-t ${borderLight}`}>
          {/* Theme Switcher Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
              isDark
                ? 'bg-[#081b3a] border-[#00acc1]/20 text-[#e0f7fa] hover:border-[#00acc1]/40'
                : 'bg-slate-100 border border-slate-300 text-[#051226] font-semibold hover:bg-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              {isDark ? (
                <Moon className="w-4 h-4 text-sky-300" />
              ) : (
                <Sun className="w-4 h-4 text-amber-600" />
              )}
              <span>{isDark ? 'Mode Gelap (Dark)' : 'Mode Terang (Light)'}</span>
            </span>
            <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`}>
              Ganti
            </span>
          </button>

          {/* Profile Mini Bar */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0d47a1] to-[#1976d2] text-[#e0f7fa] font-bold flex items-center justify-center shrink-0 text-sm shadow-inner">
                {profile.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className={`text-xs font-bold truncate leading-tight ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                  {profile.name}
                </p>
                <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                  {profile.rm}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className={`p-2 transition-colors cursor-pointer ${isDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-600 hover:text-red-600'}`}
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MOBILE TOP HEADER (< 1024px)                              */}
      {/* ============================================================ */}
      <header
        className={`lg:hidden sticky top-0 z-30 px-4 py-3 flex items-center justify-between backdrop-blur-xl ${
          isDark
            ? 'bg-[#051226]/90 border-b border-[#00acc1]/20 text-white'
            : 'bg-white border-b border-slate-200 text-[#051226] shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0d47a1] to-[#1976d2] text-[#e0f7fa] flex items-center justify-center">
            <HeartPulse className="w-4 h-4" />
          </div>
          <span className={`font-extrabold text-base tracking-tight ${isDark ? 'text-white' : 'text-[#051226]'}`}>
            Respi<span className={isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}>Care</span>
          </span>
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              isDark
                ? 'bg-[#4dd0e1]/10 text-[#4dd0e1] border-[#4dd0e1]/25'
                : 'bg-[#0d47a1]/10 text-[#0d47a1] border border-[#0d47a1]/20'
            }`}
          >
            Sesi: {userRole === 'pasien' ? 'Pasien' : 'Pendamping'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-1.5 rounded-full cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-[#051226]'}`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#051226]" />}
          </button>
          <button
            type="button"
            onClick={() => triggerAlarmSound(schedules[0])}
            className="p-1.5 rounded-full text-amber-500 cursor-pointer"
            title="Tes Alarm"
          >
            <BellRing className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className={`p-1.5 cursor-pointer ${isDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-600 hover:text-red-600'}`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 3. MAIN CONTENT CONTAINER                                    */}
      {/* ============================================================ */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-12 relative z-10">
          {/* Toast Notification */}
          {toastMessage && (
            <div
              className={`mb-6 p-4 rounded-2xl flex items-center justify-between animate-fade-in ${
                isDark
                  ? 'bg-[#081b3a]/95 border border-[#00acc1]/40 text-[#e0f7fa]'
                  : 'bg-white border border-[#00acc1]/40 text-[#051226] shadow-md'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-sm">{toastMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 1: JADWAL / PANTAUAN UTAMA                       */}
          {/* ==================================================== */}
          {activeTab === 'jadwal' && (
            <div className="space-y-6 animate-fade-in">
              {/* -------------------------------------------------- */}
              {/* KONDISIONAL ROLE: DASHBOARD PASIEN                 */}
              {/* -------------------------------------------------- */}
              {userRole === 'pasien' && (
                <>
                  {/* Hero Banner Pasien */}
                  <div
                    className={`rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${cardBg}`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                        }`}>
                          Portal Mandiri Pasien
                        </span>
                        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>•</span>
                        <span className={`text-xs ${
                          isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                        }`}>
                          {profile.condition}
                        </span>
                      </div>
                      <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${
                        isDark ? 'text-white' : 'text-[#051226]'
                      }`}>
                        Selamat Datang, {profile.name} 👋
                      </h2>
                      <div className={`flex items-center gap-2 text-xs mt-1 font-medium ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        <Calendar className={`w-3.5 h-3.5 ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`} />
                        <span>Rabu, 11 November 2026 • {profile.rm}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Badge Alarm HP Aktif */}
                      <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                        isDark
                          ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/25'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                      }`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`} />
                        <span>Alarm &amp; Notif HP Aktif</span>
                      </span>

                      {/* Tombol Tes Alarm */}
                      <button
                        type="button"
                        onClick={() => triggerAlarmSound(schedules[0])}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isDark
                            ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 hover:bg-amber-400/25'
                            : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                        }`}
                      >
                        <BellRing className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                        <span>Tes Alarm Obat</span>
                      </button>

                      {/* Tombol Hubungi Pendamping */}
                      <button
                        type="button"
                        onClick={() =>
                          handleStartCall(
                            'Siti Rahayu (Pendamping Keluarga)',
                            profile.guardianPhone,
                            'Menghubungi Pendamping untuk Konsultasi Terapi'
                          )
                        }
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isDark
                            ? 'bg-[#1976d2]/20 hover:bg-[#1976d2]/30 text-sky-400 border border-[#1976d2]/30'
                            : 'bg-[#0d47a1] hover:bg-[#1976d2] text-white border border-[#0d47a1]'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Hubungi Pendamping</span>
                      </button>
                    </div>
                  </div>

                  {/* Grid 4 Kartu Statistik Pasien */}
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                      {
                        label: 'Jadwal Hari Ini',
                        value: `${completedCount}/${totalSchedules}`,
                        sub:
                          completedCount === totalSchedules
                            ? 'Semua jadwal selesai ✓'
                            : `${totalSchedules - completedCount} jadwal menunggu`,
                        accent: 'border-l-[#4dd0e1]',
                        color: isDark ? 'text-[#4dd0e1]' : 'text-[#051226]',
                      },
                      {
                        label: 'Kepatuhan Minggu Ini',
                        value: `${adherenceRate}%`,
                        sub: '↑ Meningkat dari minggu lalu',
                        accent: 'border-l-emerald-400',
                        color: isDark ? 'text-emerald-400' : 'text-emerald-700',
                      },
                      {
                        label: 'Terlewat Hari Ini',
                        value: String(missedCount),
                        sub: 'Kondisi disiplin terjaga',
                        accent: 'border-l-amber-400',
                        color: isDark ? 'text-amber-400' : 'text-amber-800',
                      },
                      {
                        label: 'Streak Berturut',
                        value: '7',
                        sub: 'Hari berturut tanpa henti 🔥',
                        accent: 'border-l-[#1976d2]',
                        color: isDark ? 'text-[#1976d2]' : 'text-[#0d47a1]',
                      },
                    ].map((st, i) => (
                      <div
                        key={i}
                        className={`rounded-2xl p-5 flex flex-col justify-between border-l-4 ${st.accent} ${cardBg}`}
                      >
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${
                          isDark ? 'text-slate-400' : 'text-slate-600 font-semibold'
                        }`}>
                          {st.label}
                        </span>
                        <div className="my-2">
                          <span
                            className={`text-3xl font-extrabold tracking-tight ${st.color}`}
                          >
                            {st.value}
                          </span>
                        </div>
                        <span className={`text-xs font-medium ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {st.sub}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Kartu Jadwal Minum Obat Pasien Hari Ini */}
                  <div className={`rounded-2xl p-6 space-y-5 ${cardBg}`}>
                    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b ${
                      borderLight
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          isDark
                            ? 'bg-[#00acc1]/20 text-[#4dd0e1] border-[#00acc1]/30'
                            : 'bg-blue-100 text-[#0d47a1] border-blue-200'
                        }`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                            Jadwal Minum Obat Hari Ini
                          </h3>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                            Validasi teknik hirup 30 detik sebelum menandai selesai
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('tambah')}
                          className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${btnPrimary}`}
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Tambah Obat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('laporan')}
                          className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isDark
                              ? 'border-white/10 hover:bg-white/5 text-slate-300'
                              : 'border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Riwayat</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                      {schedules.map((med) => {
                        const isTaken = med.status === 'Sudah Minum';
                        const isInhaler = med.type === 'Inhaler';

                        return (
                          <div
                            key={med.id}
                            className={`rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 border ${
                              isTaken ? 'opacity-65' : ''
                            } ${
                              isDark
                                ? 'bg-[#051226]/80 border-[#00acc1]/25 hover:border-[#4dd0e1]/50'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-2xs'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  isDark
                                    ? 'bg-[#00acc1]/15 text-[#4dd0e1] border border-[#00acc1]/30'
                                    : 'bg-[#0d47a1]/10 text-[#0d47a1] border border-[#0d47a1]/20 font-bold'
                                }`}>
                                  {isInhaler ? (
                                    <Wind className="w-3 h-3" />
                                  ) : med.type === 'Sirup' ? (
                                    <Activity className="w-3 h-3" />
                                  ) : (
                                    <Pill className="w-3 h-3" />
                                  )}
                                  {med.type}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    isTaken
                                      ? isDark
                                        ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/30'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                                      : isDark
                                      ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300 font-bold'
                                  }`}
                                >
                                  {med.status}
                                </span>
                              </div>

                              <h4
                                className={`text-base font-bold mb-3 leading-snug ${
                                  isTaken
                                    ? isDark ? 'line-through text-slate-400' : 'line-through text-slate-500 font-semibold'
                                    : isDark ? 'text-white' : 'text-[#051226]'
                                }`}
                              >
                                {med.name}
                              </h4>

                              <div
                                className={`flex items-center justify-between text-xs mb-4 p-2.5 rounded-xl font-medium border ${
                                  isDark
                                    ? 'bg-[#081b3a] border-white/5 text-white'
                                    : 'bg-white border-slate-200 text-[#051226]'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <Clock className={`w-4 h-4 ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`} />
                                  <span className="font-bold">
                                    Pukul {med.time} WIB
                                  </span>
                                </div>
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>
                                  {med.type === 'Sirup'
                                    ? `Sisa: ${med.stock} ml (${Math.floor(med.stock / (med.dosePerTake || 5))} takaran)`
                                    : `Sisa: ${med.stock} ${med.unit || 'dosis'} (${med.dosePerTake || 1} ${med.unit || 'dosis'}/minum)`}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {isTaken ? (
                                <button
                                  type="button"
                                  disabled
                                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2 border ${
                                    isDark
                                      ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/25'
                                      : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                                  }`}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Sudah Diminum ✓</span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenValidation(med)}
                                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${btnPrimary}`}
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    <span>Konfirmasi Minum (30s)</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => triggerAlarmSound(med)}
                                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                                      isDark
                                        ? 'border-amber-400/30 text-amber-400 hover:bg-amber-400/10'
                                        : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                                    }`}
                                    title="Uji Alarm Obat Ini"
                                  >
                                    <BellRing className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* -------------------------------------------------- */}
              {/* KONDISIONAL ROLE: DASHBOARD PENDAMPING KELUARGA    */}
              {/* -------------------------------------------------- */}
              {userRole === 'pendamping' && (
                <>
                  {/* Banner Status Pasien yang Didampingi */}
                  <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0d47a1] to-[#1976d2] text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-5 border border-[#4dd0e1]/30">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[#e0f7fa] text-xs font-bold mb-3 border border-white/20">
                        <Users className="w-3.5 h-3.5" />
                        <span>Portal Pendamping Keluarga Terintegrasi</span>
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        Memantau Pasien: {profile.name}
                      </h2>
                      <p className="text-sm text-[#e0f7fa]/90 mt-1 font-medium">
                        {profile.rm} • Diagnosis: {profile.condition}
                      </p>
                      <p className="text-xs text-[#e0f7fa]/75 mt-0.5">
                        Kontak Pasien: {profile.phone} • Alamat: {profile.address}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleStartCall(
                            profile.name,
                            profile.phone,
                            'Mengingatkan jadwal Inhaler Budesonide pukul 07:00'
                          )
                        }
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                          isDark
                            ? 'bg-[#4dd0e1] hover:brightness-110 text-[#051226]'
                            : 'bg-white hover:bg-slate-100 text-[#0d47a1] font-extrabold'
                        }`}
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Telepon Pasien Langsung</span>
                      </button>

                      <a
                        href={`https://wa.me/62${profile.phone.replace(/^0/, '')}?text=Halo%20${encodeURIComponent(
                          profile.name
                        )},%20apakah%20sudah%20minum%20obat%20pernapasan%20jadwal%20hari%20ini?%20Jangan%20lupa%20ikuti%20panduan%20teknik%20inhaler%20di%20RespiCare.`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Kirim WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* KARTU PERINGATAN KONTRAS TINGGI: JIKA ADA OBAT BELUM DIMINUM */}
                  {pendingMedications.length > 0 && (
                    <div className={`rounded-2xl p-6 border-2 shadow-2xl animate-pulse ${
                      isDark
                        ? 'bg-red-950/80 border-red-500/60 text-white'
                        : 'bg-red-50 border-red-500 text-slate-900'
                    }`}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                            isDark
                              ? 'bg-red-500/20 border-red-400 text-red-400'
                              : 'bg-red-100 border-red-300 text-red-600'
                          }`}>
                            <AlertTriangle className="w-7 h-7" />
                          </div>
                          <div>
                            <span className={`text-xs font-extrabold uppercase tracking-widest ${
                              isDark ? 'text-red-400' : 'text-red-700'
                            }`}>
                              Peringatan Kepatuhan Obat Pasien
                            </span>
                            <h3 className={`text-lg sm:text-xl font-bold mt-0.5 ${
                              isDark ? 'text-white' : 'text-red-950'
                            }`}>
                              {pendingMedications[0].name} Belum Terkonfirmasi!
                            </h3>
                            <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                              isDark ? 'text-red-200' : 'text-slate-700 font-medium'
                            }`}>
                              Jadwal pukul{' '}
                              <strong className={isDark ? 'text-white' : 'text-red-900'}>{pendingMedications[0].time} WIB</strong>{' '}
                              belum diminum oleh pasien. Segera ingatkan pasien
                              untuk mencegah serangan sesak asma berulang.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleStartCall(
                                profile.name,
                                profile.phone,
                                `Mengingatkan jadwal ${pendingMedications[0].name} pukul ${pendingMedications[0].time}`
                              )
                            }
                            className="py-3 px-5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition-all"
                          >
                            <PhoneCall className="w-4 h-4" />
                            <span>Telepon Pasien Sekarang</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grid 3 Metrik Pantauan Pendamping */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`rounded-2xl p-5 border-l-4 border-l-[#4dd0e1] ${cardBg}`}>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${
                        isDark ? 'text-slate-400' : 'text-slate-600 font-semibold'
                      }`}>
                        Tingkat Kepatuhan Pasien
                      </span>
                      <div className="my-2">
                        <span className={`text-3xl font-extrabold ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`}>
                          {adherenceRate}%
                        </span>
                      </div>
                      <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {completedCount} dari {totalSchedules} jadwal telah
                        selesai
                      </span>
                    </div>

                    <div className={`rounded-2xl p-5 border-l-4 border-l-amber-400 ${cardBg}`}>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${
                        isDark ? 'text-slate-400' : 'text-slate-600 font-semibold'
                      }`}>
                        Obat Perlu Diingatkan
                      </span>
                      <div className="my-2">
                        <span className={`text-3xl font-extrabold ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                          {pendingMedications.length} Obat
                        </span>
                      </div>
                      <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {pendingMedications.length === 0
                          ? 'Semua jadwal tuntas ✓'
                          : 'Memerlukan pemantauan berkala'}
                      </span>
                    </div>

                    <div className={`rounded-2xl p-5 border-l-4 border-l-emerald-400 ${cardBg}`}>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${
                        isDark ? 'text-slate-400' : 'text-slate-600 font-semibold'
                      }`}>
                        Status Kontak Cepat
                      </span>
                      <div className="my-2">
                        <span className={`text-2xl font-extrabold truncate ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          Siap Siaga
                        </span>
                      </div>
                      <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Panggilan satu sentuhan ke {profile.phone}
                      </span>
                    </div>
                  </div>

                  {/* Kartu Pantauan Jadwal Real-Time Pasien */}
                  <div className={`rounded-2xl p-6 space-y-4 ${cardBg}`}>
                    <div className={`flex items-center justify-between pb-3 border-b ${borderLight}`}>
                      <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                          Pantauan Jadwal Terapi Pasien Real-Time
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                          Status langsung dari perangkat pasien Sendy Nevertheless
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        isDark
                          ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/25'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                      }`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`} />
                        Sinkronisasi Real-time
                      </span>
                    </div>

                    <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-slate-200'}`}>
                      {schedules.map((med) => {
                        const isTaken = med.status === 'Sudah Minum';
                        return (
                          <div
                            key={med.id}
                            className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  isTaken
                                    ? isDark ? 'bg-emerald-400/15 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                                    : isDark ? 'bg-amber-400/15 text-amber-400' : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {med.type === 'Inhaler' ? (
                                  <Wind className="w-5 h-5" />
                                ) : med.type === 'Sirup' ? (
                                  <Activity className="w-5 h-5" />
                                ) : (
                                  <Pill className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                                  {med.name}
                                </h4>
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                                  Jadwal: <strong>Pukul {med.time} WIB</strong>{' '}
                                  • Sisa Stok:{' '}
                                  {med.type === 'Sirup'
                                    ? `${med.stock} ml (${Math.floor(med.stock / (med.dosePerTake || 5))} takaran)`
                                    : `${med.stock} ${med.unit || 'dosis'} (${med.dosePerTake || 1} ${med.unit || 'dosis'}/minum)`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                  isTaken
                                    ? isDark
                                      ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30'
                                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : isDark
                                    ? 'bg-red-400/15 text-red-400 border-red-400/30 animate-pulse'
                                    : 'bg-red-100 text-red-800 border-red-300 animate-pulse'
                                }`}
                              >
                                {isTaken
                                  ? 'Sudah Diminum Pasien ✓'
                                  : 'Belum Terkonfirmasi'}
                              </span>

                              {!isTaken && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStartCall(
                                      profile.name,
                                      profile.phone,
                                      `Mengingatkan jadwal ${med.name} pukul ${med.time}`
                                    )
                                  }
                                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isDark
                                      ? 'bg-[#4dd0e1] text-[#051226]'
                                      : 'bg-[#0d47a1] text-white hover:bg-[#1976d2]'
                                  }`}
                                >
                                  <PhoneCall className="w-3.5 h-3.5" />
                                  <span>Telepon</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: TAMBAH OBAT (JADWAL BARU)                     */}
          {/* ==================================================== */}
          {activeTab === 'tambah' && (
            <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
              <div>
                <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                  Atur Jadwal Terapi Baru
                </h2>
                <p className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Tambahkan obat inhaler atau obat oral ke dalam daftar pantau
                  harian
                </p>
              </div>

              <form
                onSubmit={handleAddMedicationSubmit}
                className={`rounded-2xl p-6 sm:p-8 space-y-5 ${cardBg}`}
              >
                <div>
                  <label className={`block text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'}`}>
                    Nama Obat <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMed.name}
                    onChange={(e) =>
                      setNewMed({ ...newMed, name: e.target.value })
                    }
                    placeholder="Contoh: Salbutamol Inhaler, Fluticasone, Teofilin"
                    className={`w-full py-3 px-4 rounded-xl text-sm font-medium focus:outline-none transition-all ${inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'}`}>
                    Jenis Sediaan
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'Inhaler', label: 'Inhaler', icon: Wind, defDose: 2, defStock: 40 },
                      { id: 'Oral', label: 'Oral', icon: Pill, defDose: 1, defStock: 24 },
                      { id: 'Sirup', label: 'Sirup', icon: Activity, defDose: 5, defStock: 60 },
                    ].map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() =>
                            setNewMed({
                              ...newMed,
                              type: t.id,
                              dosePerTake: t.defDose,
                              stock: t.defStock,
                              syrupVolume: t.id === 'Sirup' ? 60 : newMed.syrupVolume,
                              syrupDose: t.id === 'Sirup' ? 5 : newMed.syrupDose,
                            })
                          }
                          className={`py-3 px-3 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                            newMed.type === t.id
                              ? isDark
                                ? 'bg-[#4dd0e1] text-[#051226] font-bold border-[#4dd0e1] shadow-md'
                                : 'bg-[#0d47a1] text-white font-bold border-[#0d47a1] shadow-sm'
                              : isDark
                              ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                              : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 font-semibold'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Jam Minum Terapi */}
                <div>
                  <label className={`block text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'}`}>
                    Jam Minum / Jadwal Terapi <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={newMed.time}
                    onChange={(e) =>
                      setNewMed({ ...newMed, time: e.target.value })
                    }
                    className={`w-full py-3 px-4 rounded-xl text-sm font-medium focus:outline-none transition-all ${inputBg}`}
                  />
                </div>

                {/* LOGIKA KHUSUS SIRUP: 2 KOLOM (VOLUME TOTAL & TAKARAN SEKALI MINUM) */}
                {newMed.type === 'Sirup' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'}`}>
                          Volume Total Botol (ml) <span className="text-red-500 font-bold">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={newMed.syrupVolume}
                          onChange={(e) =>
                            setNewMed({ ...newMed, syrupVolume: e.target.value })
                          }
                          placeholder="Contoh: 60"
                          className={`w-full py-3 px-4 rounded-xl text-sm font-medium focus:outline-none transition-all ${inputBg}`}
                        />
                        <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Kapasitas bersih cairan botol sirup (ml)
                        </span>
                      </div>

                      <div>
                        <label className={`block text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'}`}>
                          Takaran Sekali Minum (ml) <span className="text-red-500 font-bold">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={newMed.syrupDose}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewMed({ ...newMed, syrupDose: val, dosePerTake: val });
                          }}
                          placeholder="Contoh: 5"
                          className={`w-full py-3 px-4 rounded-xl text-sm font-medium focus:outline-none transition-all ${inputBg}`}
                        />
                        <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Dosis per kali konsumsi (contoh: 5 ml)
                        </span>
                      </div>
                    </div>

                    {/* KARTU PRATINJAU LANGSUNG KALKULASI OTOMATIS DOSIS SIRUP */}
                    <div className={`p-4 rounded-2xl border space-y-1.5 transition-all ${
                      isDark
                        ? 'bg-[#00acc1]/10 border-[#00acc1]/30 text-[#e0f7fa]'
                        : 'bg-blue-50 border-blue-200 text-[#051226]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                        }`}>
                          <Activity className="w-4 h-4" />
                          Kalkulasi Otomatis Dosis Sirup
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isDark ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          -{newMed.syrupDose || 5} ml / konfirmasi
                        </span>
                      </div>
                      <p className="text-lg font-extrabold tracking-tight">
                        Total: {Number(newMed.syrupDose) > 0 ? Math.floor(Number(newMed.syrupVolume) / Number(newMed.syrupDose)) : 0} Takaran Minum{' '}
                        <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          ({newMed.syrupVolume || 0} ml ÷ {newMed.syrupDose || 0} ml)
                        </span>
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                        Stok botol sirup hanya akan berkurang sebanyak {newMed.syrupDose || 5} ml setiap kali pasien mengklik tombol <strong>Konfirmasi Minum</strong>.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* LOGIKA UNTUK INHALER & TABLET ORAL (STOK & DOSIS PER KALI MINUM) */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'}`}>
                          Jumlah Stok Awal ({newMed.type === 'Inhaler' ? 'Semprotan' : 'Tablet'}) <span className="text-red-500 font-bold">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={newMed.stock}
                          onChange={(e) =>
                            setNewMed({ ...newMed, stock: e.target.value })
                          }
                          placeholder={newMed.type === 'Inhaler' ? 'Contoh: 60 atau 120' : 'Contoh: 30'}
                          className={`w-full py-3 px-4 rounded-xl text-sm font-medium focus:outline-none transition-all ${inputBg}`}
                        />
                        <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Total isi tabung atau strip obat
                        </span>
                      </div>

                      <div>
                        <label className={`block text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'}`}>
                          Dosis per Kali Minum ({newMed.type === 'Inhaler' ? 'Semprotan' : 'Tablet'}) <span className="text-red-500 font-bold">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={newMed.dosePerTake}
                          onChange={(e) =>
                            setNewMed({ ...newMed, dosePerTake: e.target.value })
                          }
                          placeholder={newMed.type === 'Inhaler' ? 'Default: 2' : 'Default: 1'}
                          className={`w-full py-3 px-4 rounded-xl text-sm font-medium focus:outline-none transition-all ${inputBg}`}
                        />
                        <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {newMed.type === 'Inhaler' ? 'Default 2 semprotan per waktu terapi' : 'Default 1 tablet per waktu minum'}
                        </span>
                      </div>
                    </div>

                    {/* KARTU PRATINJAU LANGSUNG ESTIMASI PEMAKAIAN */}
                    <div className={`p-4 rounded-2xl border space-y-1.5 transition-all ${
                      isDark
                        ? 'bg-[#00acc1]/10 border-[#00acc1]/30 text-[#e0f7fa]'
                        : 'bg-blue-50 border-blue-200 text-[#051226]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                        }`}>
                          {newMed.type === 'Inhaler' ? <Wind className="w-4 h-4" /> : <Pill className="w-4 h-4" />}
                          Kalkulasi Estimasi Pemakaian Obat
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isDark ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          -{newMed.dosePerTake || (newMed.type === 'Inhaler' ? 2 : 1)} {newMed.type === 'Inhaler' ? 'semprotan' : 'tablet'} / konfirmasi
                        </span>
                      </div>
                      <p className="text-lg font-extrabold tracking-tight">
                        Total: {Number(newMed.dosePerTake) > 0 ? Math.floor(Number(newMed.stock) / Number(newMed.dosePerTake)) : 0} Kali Terapi{' '}
                        <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          ({newMed.stock || 0} ÷ {newMed.dosePerTake || (newMed.type === 'Inhaler' ? 2 : 1)} {newMed.type === 'Inhaler' ? 'semprotan' : 'tablet'})
                        </span>
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                        Stok obat hanya berkurang saat Anda mengklik tombol <strong>Konfirmasi Minum</strong> sesuai dosis yang ditentukan.
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-3">
                  <button
                    type="submit"
                    className={`w-full py-3.5 px-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${btnPrimary}`}
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>Simpan &amp; Tampilkan di Jadwal</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: KONTAK & PANGGILAN CEPAT                      */}
          {/* ==================================================== */}
          {activeTab === 'kontak' && (
            <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
              <div>
                <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                  Kontak &amp; Panggilan Cepat Pasien
                </h2>
                <p className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Hubungi pasien satu sentuhan untuk mengingatkan jadwal terapi
                  atau evaluasi kondisi darurat
                </p>
              </div>

              {/* Kartu Profil Telepon Pasien */}
              <div className={`rounded-2xl p-6 sm:p-8 space-y-6 ${cardBg}`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0d47a1] to-[#1976d2] text-[#e0f7fa] font-extrabold text-2xl flex items-center justify-center shadow-lg">
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#051226]'}`}>{profile.name}</h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                      No. RM: {profile.rm} • Usia: {profile.age}
                    </p>
                    <p className={`text-xs font-bold mt-0.5 ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`}>
                      Kondisi: {profile.condition}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    isDark
                      ? 'bg-[#051226] border-[#00acc1]/20'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span className={`text-xs uppercase ${isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'}`}>
                      Nomor Telepon Seluler:
                    </span>
                    <p className={`text-lg font-mono font-bold ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`}>
                      +62 858-3271-3744
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleStartCall(
                          profile.name,
                          profile.phone,
                          'Mengingatkan jadwal terapi harian pasien'
                        )
                      }
                      className={`px-4 py-2.5 font-bold text-sm rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-all ${
                        isDark
                          ? 'bg-[#4dd0e1] hover:brightness-110 text-[#051226]'
                          : 'bg-[#0d47a1] hover:bg-[#1976d2] text-white'
                      }`}
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Telepon Langsung</span>
                    </button>

                    <a
                      href={`https://wa.me/62${profile.phone.replace(/^0/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Info Alamat & Kontak Darurat */}
                <div className="space-y-3 pt-2">
                  <div className={`text-xs flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                    <Info className={`w-4 h-4 ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`} />
                    <span>
                      Alamat Terdaftar: {profile.address}
                    </span>
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                    <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
                    <span>
                      Pendamping Terdaftar: {profile.emergencyContact}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: LAPORAN (STATISTIK & KEPATUHAN)                */}
          {/* ==================================================== */}
          {activeTab === 'laporan' && (
            <div className="space-y-6 animate-fade-in">
              <div
                className={`rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${cardBg}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                    isDark
                      ? 'bg-[#00acc1]/20 text-[#4dd0e1] border-[#00acc1]/30'
                      : 'bg-blue-100 text-[#0d47a1] border-blue-200'
                  }`}>
                    <BarChart3 className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                      Laporan &amp; Riwayat Kepatuhan Terapi
                    </h2>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Rekam jejak pengobatan &amp; evaluasi berkala dokter
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className={`px-4 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all ${btnPrimary}`}
                >
                  <FileDown className="w-4 h-4" />
                  <span>Unduh Laporan PDF</span>
                </button>
              </div>

              {/* Grid 3 Kartu Ringkasan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Total Jadwal Terpantau',
                    value: '21',
                    sub: '7 hari terakhir',
                    accent: isDark ? 'text-[#4dd0e1]' : 'text-[#051226]',
                  },
                  {
                    label: 'Obat Berhasil Diminum',
                    value: '19',
                    sub: 'Selesai tepat waktu',
                    accent: isDark ? 'text-emerald-400' : 'text-emerald-700',
                  },
                  {
                    label: 'Rata-Rata Kepatuhan',
                    value: '90.5%',
                    sub: 'Tingkat disiplin sangat baik',
                    accent: isDark ? 'text-[#1976d2]' : 'text-[#0d47a1]',
                  },
                ].map((card, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl p-5 flex flex-col justify-between ${cardBg}`}
                  >
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-slate-600 font-semibold'
                    }`}>
                      {card.label}
                    </span>
                    <div className="my-2">
                      <span
                        className={`text-3xl font-extrabold tracking-tight ${card.accent}`}
                      >
                        {card.value}
                      </span>
                    </div>
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {card.sub}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tabel Statistik Harian */}
              <div className={`rounded-2xl p-6 overflow-hidden ${cardBg}`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-[#051226]'}`}>Statistik Harian</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className={`border-b text-xs uppercase tracking-wider ${
                        isDark ? 'border-white/10 text-slate-400 font-bold' : 'border-slate-200 text-slate-600 font-semibold'
                      }`}>
                        <th className="pb-3 px-3">Tanggal</th>
                        <th className="pb-3 px-3">Total Jadwal</th>
                        <th className="pb-3 px-3">Sudah Diminum</th>
                        <th className="pb-3 px-3">Terlewat</th>
                        <th className="pb-3 px-3">Persentase</th>
                        <th className="pb-3 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-200'}`}>
                      {historyData.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                        >
                          <td className={`py-4 px-3 font-semibold flex items-center gap-2 whitespace-nowrap ${
                            isDark ? 'text-white' : 'text-[#051226]'
                          }`}>
                            <span>{row.date}</span>
                            {row.isToday && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isDark
                                  ? 'bg-[#00acc1]/20 text-[#4dd0e1] border border-[#00acc1]/30'
                                  : 'bg-[#0d47a1]/10 text-[#0d47a1] border border-[#0d47a1]/20 font-bold'
                              }`}>
                                Hari Ini
                              </span>
                            )}
                          </td>
                          <td className={`py-4 px-3 ${isDark ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                            {row.total}
                          </td>
                          <td className={`py-4 px-3 font-bold ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                            {row.completed}
                          </td>
                          <td className={`py-4 px-3 ${isDark ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                            {row.missed}
                          </td>
                          <td
                            className={`py-4 px-3 font-bold ${
                              row.status === 'Bagus'
                                ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                                : isDark ? 'text-amber-400' : 'text-amber-800'
                            }`}
                          >
                            {row.percentage}
                          </td>
                          <td className="py-4 px-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                row.status === 'Bagus'
                                  ? isDark
                                    ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/25'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                                  : isDark
                                  ? 'bg-amber-400/15 text-amber-400 border border-amber-400/25'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300 font-bold'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: AKUN / PROFIL PASIEN                          */}
          {/* ==================================================== */}
          {activeTab === 'akun' && (
            <div className="space-y-6 animate-fade-in">
              <div
                className={`rounded-2xl p-6 flex items-center justify-between ${cardBg}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d47a1] to-[#1976d2] text-[#e0f7fa] border border-[#4dd0e1]/30 flex items-center justify-center text-2xl font-extrabold shrink-0">
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                      {profile.name}
                    </h2>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {profile.rm} • Asma Bronkial &amp; PPOK Derajat 2
                    </p>
                  </div>
                </div>

                <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                  isDark ? 'bg-[#4dd0e1]/15 text-[#4dd0e1] border border-[#4dd0e1]/30' : 'bg-[#0d47a1]/10 text-[#0d47a1] border border-[#0d47a1]/20'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Data Pasien Terverifikasi
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Form Informasi Pribadi */}
                <form
                  onSubmit={handleSaveProfile}
                  className={`rounded-2xl p-6 space-y-4 ${cardBg}`}
                >
                  <div className={`flex items-center gap-2 pb-3 border-b ${borderLight}`}>
                    <User className={`w-5 h-5 ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`} />
                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#051226]'}`}>Informasi Pribadi</h3>
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'}`}>
                      No. Rekam Medis (RM)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profile.rm}
                      className={`w-full py-2.5 px-4 rounded-xl cursor-not-allowed ${
                        isDark ? 'opacity-60 bg-[#051226]/80 border border-[#00acc1]/30 text-[#e0f7fa]' : 'bg-slate-100 border border-slate-300 text-slate-700 font-medium'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'}`}>
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'}`}>
                      Nomor Telepon Pasien
                    </label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'}`}>
                      Alamat Tinggal
                    </label>
                    <textarea
                      rows={2}
                      value={profile.address}
                      onChange={(e) =>
                        setProfile({ ...profile, address: e.target.value })
                      }
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium resize-none ${inputBg}`}
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className={`py-2.5 px-5 rounded-xl text-sm font-bold cursor-pointer ${btnPrimary}`}
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </form>

                {/* Kolom Kanan: Kode Pairing Keluarga, Keamanan & Informasi Medis */}
                <div className="space-y-5">
                  {/* KARTU KODE PAIRING KELUARGA (RM-2026-040 / PIN 8492) */}
                  <div className={`rounded-2xl p-6 space-y-4 border ${cardBg}`}>
                    <div className={`flex items-center justify-between pb-3 border-b ${borderLight}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          isDark ? 'bg-[#00acc1]/20 text-[#4dd0e1] border-[#00acc1]/30' : 'bg-blue-100 text-[#0d47a1] border-blue-200'
                        }`}>
                          <Key className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                            Kode Pairing Keluarga
                          </h3>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                            Sinkronisasi pemantauan pendamping
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        isDark ? 'bg-[#4dd0e1]/10 text-[#4dd0e1] border border-[#4dd0e1]/25' : 'bg-[#0d47a1]/10 text-[#0d47a1] border border-[#0d47a1]/20'
                      }`}>
                        Sesi Terhubung
                      </span>
                    </div>

                    <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                      isDark ? 'bg-[#051226] border-[#00acc1]/25' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="space-y-1">
                        <span className={`text-[11px] uppercase font-bold tracking-wider ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          Kode Pasien &amp; PIN Akses:
                        </span>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className={`text-xl font-mono font-extrabold tracking-wider ${
                            isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                          }`}>
                            {profile.rm}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-bold border ${
                            isDark ? 'bg-amber-400/10 text-amber-300 border-amber-400/30' : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            PIN 8492
                          </span>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                          Atas Nama: <strong>{profile.name}</strong>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyPairing}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shrink-0 ${
                          copiedPairing
                            ? 'bg-emerald-600 text-white'
                            : btnPrimary
                        }`}
                      >
                        {copiedPairing ? (
                          <>
                            <Check className="w-4 h-4 stroke-[2.5]" />
                            <span>Tersalin! ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Salin Kode Pairing</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className={`text-xs flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Berikan kode ini kepada keluarga agar dapat masuk melalui portal pendamping.</span>
                    </div>
                  </div>

                  <div className={`rounded-2xl p-6 space-y-4 ${cardBg}`}>
                    <div className={`flex items-center gap-2 pb-3 border-b ${borderLight}`}>
                      <HeartPulse className={`w-5 h-5 ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`} />
                      <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#051226]'}`}>Informasi Medis</h3>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <div className={`flex items-center justify-between py-1 border-b ${borderSubtle}`}>
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>Tanggal Lahir</span>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                          {profile.birthDate}
                        </span>
                      </div>
                      <div className={`flex items-center justify-between py-1 border-b ${borderSubtle}`}>
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>Usia Pasien</span>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#051226]'}`}>{profile.age}</span>
                      </div>
                      <div className={`flex items-center justify-between py-1 border-b ${borderSubtle}`}>
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>Jenis Kelamin</span>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#051226]'}`}>{profile.gender}</span>
                      </div>
                      <div className={`flex items-center justify-between py-1 border-b ${borderSubtle}`}>
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>Diagnosis Utama</span>
                        <span className={`font-bold ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`}>
                          {profile.condition}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>Kontak Pendamping</span>
                        <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700 font-bold'}`}>
                          {profile.emergencyContact}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    className={`w-full py-3.5 px-4 font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isDark
                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25'
                        : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-300'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar dari Akun (Logout)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ============================================================ */}
      {/* 4. MODAL ALARM OBAT BERDERING (WEB AUDIO & PUSH)             */}
      {/* ============================================================ */}
      {alarmModal.isOpen && alarmModal.med && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: isDark ? 'rgba(5, 18, 38, 0.85)' : 'rgba(5, 18, 38, 0.65)', backdropFilter: 'blur(12px)' }}
        >
          <div
            className={`w-full max-w-md rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl border ${
              isDark
                ? 'bg-[#081b3a] border-amber-400/40 text-[#e0f7fa]'
                : 'bg-white border-2 border-amber-400 text-[#051226]'
            }`}
          >
            {/* Animasi Bell Berdering & Bergetar */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/40">
                <BellRing className="w-8 h-8 animate-bounce" />
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
                Pengingat Waktu Terapi Tiba!
              </span>
              <h3 className={`text-2xl font-bold tracking-tight mt-1 ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                {alarmModal.med.name}
              </h3>
              <p className={`text-sm mt-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Jadwal Pukul {alarmModal.med.time} WIB • Sisa Stok:{' '}
                {alarmModal.med.type === 'Sirup'
                  ? `${alarmModal.med.stock} ml (${Math.floor(alarmModal.med.stock / (alarmModal.med.dosePerTake || 5))} takaran)`
                  : `${alarmModal.med.stock} ${alarmModal.med.unit || 'dosis'} (${alarmModal.med.dosePerTake || 1} ${alarmModal.med.unit || 'dosis'}/minum)`}
              </p>
            </div>

            {/* Kotak Instruksi Cepat */}
            <div
              className={`p-4 rounded-2xl text-left text-xs leading-relaxed border ${
                isDark
                  ? 'bg-[#051226] border-[#00acc1]/20 text-slate-300'
                  : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}
            >
              <div className={`flex items-center gap-1.5 font-bold uppercase mb-1 ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`}>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Instruksi Singkat:</span>
              </div>
              <p>"{alarmModal.med.instructions}"</p>
            </div>

            {/* Tombol Aksi Alarm */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleStopAlarmAndOpenGuide}
                className={`w-full py-3.5 px-4 font-bold rounded-xl text-base shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${btnPrimary}`}
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Minum &amp; Buka Panduan 30s</span>
              </button>

              <button
                type="button"
                onClick={handleSnoozeAlarm}
                className={`w-full py-2.5 px-4 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 font-semibold ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/15 text-slate-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                <Timer className="w-4 h-4" />
                <span>Tunda 5 Menit (Snooze)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MODAL SIMULASI PANGGILAN CEPAT TERHUBUNG (ONE-TAP CALL)   */}
      {/* ============================================================ */}
      {callModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: isDark ? 'rgba(5, 18, 38, 0.85)' : 'rgba(5, 18, 38, 0.65)', backdropFilter: 'blur(12px)' }}
        >
          <div
            className={`w-full max-w-sm rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl border ${
              isDark
                ? 'bg-[#081b3a] border-[#00acc1]/30 text-[#e0f7fa]'
                : 'bg-white border border-slate-200 text-[#051226]'
            }`}
          >
            {/* Avatar & Pulse Waveform */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              {callModal.isConnected && (
                <span className="absolute inset-0 rounded-full bg-emerald-400/25 animate-ping" />
              )}
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#0d47a1] to-[#1976d2] text-white flex items-center justify-center text-3xl font-extrabold shadow-lg">
                {callModal.targetName.charAt(0)}
              </div>
            </div>

            <div>
              <h4 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                {callModal.targetName}
              </h4>
              <p className={`text-xs mt-0.5 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                {callModal.targetPhone}
              </p>

              <div className="mt-3">
                {callModal.isConnected ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Panggilan Terhubung (
                    {String(Math.floor(callModal.duration / 60)).padStart(2, '0')}:
                    {String(callModal.duration % 60).padStart(2, '0')})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full animate-pulse">
                    Memanggil Pasien...
                  </span>
                )}
              </div>
            </div>

            {/* Catatan Alasan Panggilan Otomatis */}
            <div
              className={`p-3 rounded-xl text-xs text-left border ${
                isDark
                  ? 'bg-[#051226] border-[#00acc1]/20 text-slate-300'
                  : 'bg-slate-50 border border-slate-200 text-slate-700'
              }`}
            >
              <span className={`font-bold block mb-0.5 ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`}>
                Alasan Panggilan:
              </span>
              <p>"{callModal.callReason}"</p>
            </div>

            {/* Tombol Kontrol Panggilan */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() =>
                  setCallModal((prev) => ({ ...prev, isMuted: !prev.isMuted }))
                }
                className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                  callModal.isMuted
                    ? 'bg-amber-400/20 text-amber-500 border-amber-400/30'
                    : isDark
                    ? 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/15'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
                title={callModal.isMuted ? 'Buka Mikrofon' : 'Bisukan Mikrofon'}
              >
                {callModal.isMuted ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-95 cursor-pointer"
                title="Akhiri Panggilan"
              >
                <PhoneOff className="w-7 h-7" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setCallModal((prev) => ({
                    ...prev,
                    isSpeakerOn: !prev.isSpeakerOn,
                  }))
                }
                className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                  callModal.isSpeakerOn
                    ? isDark
                      ? 'bg-[#4dd0e1]/20 text-[#4dd0e1] border-[#4dd0e1]/30'
                      : 'bg-blue-100 text-[#0d47a1] border-blue-200'
                    : isDark
                    ? 'bg-white/10 text-slate-300 border-white/10'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
                title="Speaker"
              >
                {callModal.isSpeakerOn ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. MODAL PANDUAN TEKNIK INHALER (30 DETIK)                   */}
      {/* ============================================================ */}
      {activeMedication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: isDark ? 'rgba(5, 18, 38, 0.85)' : 'rgba(5, 18, 38, 0.65)', backdropFilter: 'blur(12px)' }}
        >
          <div
            className={`w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border ${
              isDark
                ? 'bg-[#081b3a] border-[#00acc1]/30 text-[#e0f7fa]'
                : 'bg-white border border-slate-200 text-[#051226]'
            }`}
          >
            {/* Header Modal */}
            <div className={`p-5 flex items-center justify-between border-b sticky top-0 z-10 backdrop-blur-md ${borderLight}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  isDark ? 'bg-[#00acc1]/20 text-[#4dd0e1] border-[#00acc1]/30' : 'bg-blue-100 text-[#0d47a1] border-blue-200'
                }`}>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                    Panduan Teknik Pakai (30s)
                  </h3>
                  <p className={`text-xs truncate max-w-[220px] ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                    {activeMedication.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseValidation}
                className={`p-2 rounded-full transition-colors cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#051226]'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Simulasi Video / Visual Frame */}
              <div className="relative aspect-video w-full rounded-2xl bg-gradient-to-br from-[#051226] to-[#081b3a] text-white overflow-hidden flex flex-col justify-between p-4 border border-[#00acc1]/30">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 bg-[#051226]/80 px-2 py-0.5 rounded-md backdrop-blur">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    SIMULASI RESPI-GUIDE
                  </span>
                  <span className="font-mono bg-[#051226]/80 px-2 py-0.5 rounded-md text-[#4dd0e1] font-bold">
                    00:{countdown < 10 ? `0${countdown}` : countdown} / 00:30
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center text-center my-auto">
                  <div className="w-14 h-14 rounded-full bg-[#00acc1]/20 border border-[#4dd0e1]/30 flex items-center justify-center mb-2 animate-bounce">
                    {activeMedication.type === 'Inhaler' ? (
                      <Wind className="w-7 h-7 text-[#4dd0e1]" />
                    ) : activeMedication.type === 'Sirup' ? (
                      <Activity className="w-7 h-7 text-[#4dd0e1]" />
                    ) : (
                      <Pill className="w-7 h-7 text-[#4dd0e1]" />
                    )}
                  </div>
                  <h4 className="font-semibold text-sm text-white">
                    {activeMedication.type === 'Inhaler'
                      ? 'Simulasi Teknik Inhalasi MDI'
                      : activeMedication.type === 'Sirup'
                      ? 'Simulasi Konsumsi Obat Sirup Presisi'
                      : 'Simulasi Konsumsi Obat Oral'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-[280px]">
                    {activeMedication.type === 'Inhaler'
                      ? `Kocok 5s, buang napas penuh, rapatkan bibir, tekan & hirup perlahan ${activeMedication.dosePerTake || 2} semprotan, tahan 10s`
                      : activeMedication.type === 'Sirup'
                      ? `Kocok botol sirup, gunakan sendok takar presisi ${activeMedication.dosePerTake || 5} ml, dan minum perlahan`
                      : `Pastikan minum ${activeMedication.dosePerTake || 1} tablet dengan segelas air putih dan jangan dikunyah`}
                  </p>
                </div>

                <div>
                  <div className="w-full bg-[#051226] h-1.5 rounded-full overflow-hidden mb-1">
                    <div
                      className="bg-[#4dd0e1] h-full transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Edukasi Pasien Mandiri</span>
                    <span>
                      {countdown === 0 ? 'Selesai ✓' : `Menonton (${countdown}s)`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instruksi Klinis */}
              <div
                className={`rounded-xl p-4 border ${
                  isDark
                    ? 'bg-[#051226] border-[#00acc1]/20 text-[#e0f7fa]'
                    : 'bg-slate-50 border border-slate-200 text-[#051226]'
                }`}
              >
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`}>
                  <AlertCircle className="w-4 h-4" />
                  <span>Instruksi Klinis:</span>
                </div>
                <p className="text-sm leading-relaxed font-medium">
                  "{activeMedication.instructions}"
                </p>
              </div>

              {/* Urutan Tindakan */}
              <div className="space-y-2">
                <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'}`}>
                  Urutan Tindakan:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {activeMedication.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-2.5 rounded-xl text-sm border ${
                        isDark
                          ? 'bg-[#051226] border-white/5 text-white'
                          : 'bg-slate-50 border-slate-200 text-[#051226]'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 border ${
                        isDark
                          ? 'bg-[#00acc1]/20 text-[#4dd0e1] border-[#00acc1]/30'
                          : 'bg-[#0d47a1]/10 text-[#0d47a1] border border-[#0d47a1]/20'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className={`p-5 border-t sticky bottom-0 ${borderLight}`}>
              <button
                type="button"
                disabled={!isUnlocked}
                onClick={handleConfirmDose}
                className={`w-full py-3.5 px-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  isUnlocked
                    ? `${btnPrimary} cursor-pointer`
                    : isDark
                    ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-300 font-semibold'
                }`}
              >
                {!isUnlocked ? (
                  <>
                    <Timer className="w-5 h-5 animate-spin" />
                    <span>Tonton Video Selesai ({countdown}s)...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      Selesai &amp; Konfirmasi Minum (-{activeMedication.dosePerTake || (activeMedication.type === 'Inhaler' ? 2 : activeMedication.type === 'Sirup' ? 5 : 1)} {activeMedication.unit || (activeMedication.type === 'Inhaler' ? 'semprotan' : activeMedication.type === 'Sirup' ? 'ml' : 'tablet')})
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. MODAL KONFIRMASI KELUAR (LOGOUT)                          */}
      {/* ============================================================ */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: isDark ? 'rgba(5, 18, 38, 0.85)' : 'rgba(5, 18, 38, 0.65)', backdropFilter: 'blur(12px)' }}
        >
          <div
            className={`w-full max-w-sm rounded-3xl p-6 text-center space-y-5 shadow-2xl border ${cardBg}`}
          >
            <div className="w-14 h-14 rounded-2xl bg-red-400/10 text-red-400 flex items-center justify-center mx-auto border border-red-400/20">
              <LogOut className="w-7 h-7" />
            </div>
            <div>
              <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#051226]'}`}>Keluar dari Sesi?</h4>
              <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                Data jadwal dan rekaman kepatuhan terapi Anda tersimpan aman
                pada sistem ini.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm border transition-all cursor-pointer font-semibold ${
                  isDark
                    ? 'bg-white/8 hover:bg-white/14 text-slate-300 border-white/10'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. BOTTOM NAVIGATION BAR UNTUK MOBILE (< 1024px)             */}
      {/* ============================================================ */}
      <nav
        aria-label="Navigasi Bawah Mobile"
        className={`lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 py-2 border-t backdrop-blur-xl ${
          isDark
            ? 'bg-[#051226]/95 border-[#00acc1]/20'
            : 'bg-white/95 border-slate-200 shadow-lg'
        }`}
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'text-[#4dd0e1] font-bold'
                      : 'text-[#0d47a1] font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-[#051226] font-medium'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
