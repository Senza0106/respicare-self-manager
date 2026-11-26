import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Plus,
  BarChart3,
  User,
  LogOut,
  BellRing,
  Check,
  CheckCircle2,
  Clock,
  Wind,
  Pill,
  Droplets,
  Timer,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Activity,
  FileDown,
  Printer,
  FileSpreadsheet,
  Database,
  Lock,
  X,
  RotateCcw,
  Sun,
  Moon,
  Phone,
  PhoneCall,
  MessageCircle,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Users,
  AlertTriangle,
  Copy,
  Edit3,
  Trash2,
  Key,
  HeartPulse,
  Info,
} from 'lucide-react';
import { RespiCareLogo } from './Login';

export default function Dashboard({
  theme,
  toggleTheme,
  userRole,
  currentUser,
  profile,
  setProfile,
  schedules,
  setSchedules,
  isDemo,
  onLogout,
  toastMessage,
  setToastMessage,
  playGentleChime,
}) {
  const isDark = theme === 'dark';

  // Navigation Tabs:
  // Pasien: 'jadwal' | 'laporan' | 'akun'
  // Pendamping: 'jadwal' | 'tambah' | 'kontak' | 'laporan' | 'akun'
  const [activeTab, setActiveTab] = useState('jadwal');

  // Form Tambah / Edit Obat (Tab 'tambah' khusus Pendamping)
  const [editingMedId, setEditingMedId] = useState(null);
  const [newMed, setNewMed] = useState({
    name: '',
    type: 'Inhaler',
    time: '18:00',
    stock: 40,
    dosePerTake: 2,
    syrupVolume: 60,
    syrupDose: 5,
  });

  // Modal 30-Second Video Validation State (Pasien)
  const [activeMedication, setActiveMedication] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Modal Alarm Berdering
  const [alarmModal, setAlarmModal] = useState({
    isOpen: false,
    med: null,
  });
  const alarmIntervalRef = useRef(null);

  // Modal Call Simulation
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

  // Logout Modal & Developer DB Inspector
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDevDbModal, setShowDevDbModal] = useState(false);
  const [devPinInput, setDevPinInput] = useState('');
  const [devUnlocked, setDevUnlocked] = useState(false);
  const [devPinError, setDevPinError] = useState('');
  const [devTapCount, setDevTapCount] = useState(0);

  useEffect(() => {
    const handleSecretShortcut = (e) => {
      if ((e.ctrlKey || e.altKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setDevPinError('');
        setShowDevDbModal(true);
      }
    };
    window.addEventListener('keydown', handleSecretShortcut);
    return () => window.removeEventListener('keydown', handleSecretShortcut);
  }, []);
  const [lastTriggeredMinute, setLastTriggeredMinute] = useState('');
  const [copiedPairing, setCopiedPairing] = useState(false);

  // Password Change State
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  // ==========================================================
  // SALIN KODE PAIRING (HANYA STRING BERSIH RM-2026-...)
  // ==========================================================
  const handleCopyPairing = () => {
    const cleanRm = (profile.rm || 'RM-2026-040').trim();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cleanRm);
    }
    setCopiedPairing(true);
    setToastMessage(`Kode ${cleanRm} berhasil disalin!`);
    setTimeout(() => setCopiedPairing(false), 2500);
  };

  // ==========================================================
  // ALARM ACTIONS
  // ==========================================================
  const triggerAlarmSound = (medication) => {
    if (!medication) return;
    setAlarmModal({ isOpen: true, med: medication });
    if (playGentleChime) playGentleChime();
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    alarmIntervalRef.current = setInterval(() => {
      if (playGentleChime) playGentleChime();
    }, 1800);

    // Browser Push Notification
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
    setToastMessage(`Alarm "${medName}" ditunda selama 5 menit.`);
  };

  // Cek jadwal obat otomatis setiap 10 detik
  useEffect(() => {
    const checker = setInterval(() => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (hhmm === lastTriggeredMinute) return;
      const due = schedules.find((s) => s.status !== 'Sudah Minum' && s.time === hhmm);
      if (due) {
        setLastTriggeredMinute(hhmm);
        triggerAlarmSound(due);
      }
    }, 10000);
    return () => clearInterval(checker);
  }, [schedules, lastTriggeredMinute]);

  // ==========================================================
  // CALL ACTIONS
  // ==========================================================
  const handleStartCall = (targetName, targetPhone, reason) => {
    let waPhone = String(targetPhone || '').replace(/\D/g, '');
    if (!waPhone) {
      setToastMessage('Nomor telepon belum diatur. Lengkapi di menu Profil terlebih dahulu.');
      return;
    }
    if (waPhone.startsWith('0')) {
      waPhone = '62' + waPhone.slice(1);
    } else if (!waPhone.startsWith('62')) {
      waPhone = '62' + waPhone;
    }
    const msg = encodeURIComponent(
      `Halo ${targetName || 'Pendamping/Pasien'}, saya menghubungi melalui RespiCare Self-Manager (${profile.name || 'Pasien'} - ${profile.rm || 'RM-2026'}) terkait: ${reason || 'Konsultasi Terapi Pernapasan'}.`
    );
    window.open(`https://wa.me/${waPhone}?text=${msg}`, '_blank', 'noopener,noreferrer');
    setToastMessage(`Membuka WhatsApp (${targetName || waPhone})...`);
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

  // ==========================================================
  // VALIDASI DOSIS (30s COUNTDOWN)
  // ==========================================================
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

    const updated = schedules.map((item) => {
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
    });

    setSchedules(updated);
    if (profile.rm) {
      localStorage.setItem(`respicare-schedules-${profile.rm}`, JSON.stringify(updated));
    }
    handleCloseValidation();
    setToastMessage(
      `✓ Dosis "${activeMedication.name}" berhasil dikonfirmasi! Stok berkurang -${doseToDeduct} ${unitText}.`
    );
  };

  // ==========================================================
  // TAMBAH / EDIT / HAPUS OBAT (KHUSUS PENDAMPING)
  // ==========================================================
  const handleEditMedication = (med) => {
    setEditingMedId(med.id);
    setNewMed({
      name: med.name,
      type: med.type,
      time: med.time,
      stock: med.stock,
      dosePerTake:
        med.dosePerTake || (med.type === 'Inhaler' ? 2 : med.type === 'Sirup' ? 5 : 1),
      syrupVolume: med.type === 'Sirup' ? med.stock : 60,
      syrupDose: med.type === 'Sirup' ? med.dosePerTake || 5 : 5,
    });
    setActiveTab('tambah');
  };

  const handleDeleteMedication = (medId) => {
    const medToDelete = schedules.find((s) => s.id === medId);
    const updated = schedules.filter((item) => item.id !== medId);
    setSchedules(updated);
    if (profile.rm) {
      localStorage.setItem(`respicare-schedules-${profile.rm}`, JSON.stringify(updated));
    }
    setToastMessage(`🗑️ Jadwal "${medToDelete?.name || 'Obat'}" berhasil dihapus.`);
  };

  const handleCancelEdit = () => {
    setEditingMedId(null);
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
      id: editingMedId || Date.now(),
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

    let updated;
    if (editingMedId) {
      updated = schedules.map((item) =>
        item.id === editingMedId ? { ...item, ...medToAdd } : item
      );
      setToastMessage(`✓ Jadwal "${newMed.name.trim()}" berhasil diperbarui!`);
    } else {
      updated = [...schedules, medToAdd];
      setToastMessage(
        `✓ Jadwal "${medToAdd.name}" (${doseVal} ${unitVal}/kali) berhasil ditambahkan!`
      );
    }

    setSchedules(updated);
    if (profile.rm) {
      localStorage.setItem(`respicare-schedules-${profile.rm}`, JSON.stringify(updated));
    }

    setEditingMedId(null);
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
  };

  // Simpan Perubahan Profil oleh Pendamping
  const handleSaveProfileByPendamping = (e) => {
    e.preventDefault();
    const savedAccounts = JSON.parse(localStorage.getItem('respicare-accounts') || '[]');
    const updatedAccounts = savedAccounts.map((acc) => {
      if (acc.role === 'pasien' && acc.rm === profile.rm) {
        return {
          ...acc,
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          birthPlace: profile.birthPlace,
          birthDate: profile.birthDate,
          gender: profile.gender,
          condition: profile.condition,
        };
      }
      return acc;
    });
    localStorage.setItem('respicare-accounts', JSON.stringify(updatedAccounts));
    setToastMessage('✓ Data profil & rekam medis pasien berhasil diperbarui!');
  };

  // ==========================================================
  // KALKULASI STATISTIK (KOSONG JIKA AKUN BARU)
  // ==========================================================
  const totalSchedules = schedules.length;
  const completedCount = schedules.filter((s) => s.status === 'Sudah Minum').length;
  const pendingMedications = schedules.filter((s) => s.status !== 'Sudah Minum');
  const missedCount = 0;
  const adherenceRate =
    totalSchedules > 0 ? Math.round((completedCount / totalSchedules) * 100) : 0;
  const streakDays = isDemo ? 7 : completedCount > 0 ? 1 : 0;

  // 7-day Historical Statistics Data (Hanya untuk Demo, Kosong untuk Akun Baru)
  const historyData = isDemo
    ? [
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
      ]
    : totalSchedules > 0
    ? [
        {
          date: 'Hari Ini',
          isToday: true,
          total: `${totalSchedules} jadwal`,
          completed: completedCount,
          missed: 0,
          percentage: `${adherenceRate}%`,
          status: adherenceRate >= 80 ? 'Bagus' : 'Kurang',
        },
      ]
    : [];

  // Navigation Items
  const navItems =
    userRole === 'pasien'
      ? [
          { id: 'jadwal', label: 'Jadwal Terapi', icon: Calendar },
          { id: 'laporan', label: 'Laporan Kepatuhan', icon: BarChart3 },
          { id: 'akun', label: 'Profil & Medis', icon: User },
        ]
      : [
          { id: 'jadwal', label: 'Pantauan Pasien', icon: Calendar },
          { id: 'tambah', label: 'Atur Jadwal Obat', icon: Plus },
          { id: 'kontak', label: 'Telepon Pasien', icon: PhoneCall },
          { id: 'laporan', label: 'Laporan Pasien', icon: BarChart3 },
          { id: 'akun', label: 'Data Pasien & Akses', icon: User },
        ];

  // Theme Tokens
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
  const borderLight = isDark ? 'border-white/10' : 'border-slate-200';
  const borderSubtle = isDark ? 'border-white/5' : 'border-slate-200';

  return (
    <div
      className={`min-h-screen ${bgMain} ${textMain} font-sans antialiased selection:bg-[#4dd0e1] selection:text-[#051226] relative flex flex-col lg:flex-row overflow-x-hidden w-full`}
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
          <div className="px-2 py-3 mb-6">
            <RespiCareLogo isDark={isDark} />
            <p
              className={`text-[11px] font-medium mt-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {userRole === 'pasien'
                ? 'Portal Pasien Mandiri'
                : 'Portal Pendamping Pasien'}
            </p>
          </div>

          {/* LENCANA STATIS PERAN: SESI AKTIF */}
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
                Sesi Aktif:{' '}
                {userRole === 'pasien' ? 'Pasien' : 'Pendamping Keluarga'}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            <p
              className={`text-[10px] font-bold tracking-wider px-3 mb-2 uppercase ${
                isDark ? 'text-slate-400' : 'text-slate-600 font-semibold'
              }`}
            >
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

          {/* Tombol Tes Alarm Audio */}
          {true && (
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
          )}
        </div>

        {/* Bottom Sidebar: Theme & Profile Card */}
        <div className={`space-y-3 pt-4 border-t ${borderLight}`}>
          
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
              <span>{isDark ? 'Mode Gelap' : 'Mode Terang'}</span>
            </span>
            <span
              className={`text-[10px] uppercase font-bold ${
                isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
              }`}
            >
              Ganti
            </span>
          </button>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0d47a1] to-[#1976d2] text-[#e0f7fa] font-bold flex items-center justify-center shrink-0 text-sm shadow-inner">
                {userRole === 'pasien'
                  ? (profile.name || 'P').charAt(0)
                  : (currentUser?.name || 'K').charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p
                  className={`text-xs font-bold truncate leading-tight ${
                    isDark ? 'text-white' : 'text-[#051226]'
                  }`}
                >
                  {userRole === 'pasien'
                    ? profile.name || 'Pasien'
                    : currentUser?.name || 'Pendamping'}
                </p>
                <p
                  className={`text-[10px] truncate ${
                    isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                  }`}
                >
                  <span
                    onClick={() => {
                      const next = devTapCount + 1;
                      if (next >= 7) {
                        setDevTapCount(0);
                        setDevPinError('');
                        setShowDevDbModal(true);
                      } else {
                        setDevTapCount(next);
                      }
                    }}
                  >
                    {profile.rm || 'No. RM'}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className={`p-2 transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-600 hover:text-red-600'
              }`}
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. AREA KONTEN UTAMA                                         */}
      {/* ============================================================ */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar Mobile & Tablet */}
        <header
          className={`lg:hidden sticky top-0 z-30 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 backdrop-blur-xl border-b ${
            isDark
              ? 'bg-[#051226]/90 border-[#00acc1]/20'
              : 'bg-white/95 border-slate-200 shadow-sm'
          }`}
        >
          <RespiCareLogo isDark={isDark} size="sm" />
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                isDark
                  ? 'bg-[#4dd0e1]/15 text-[#4dd0e1]'
                  : 'bg-[#0d47a1]/10 text-[#0d47a1]'
              }`}
            >
              {userRole === 'pasien' ? 'Pasien' : 'Pendamping'}
            </span>

            {/* Toggle Theme Mobile */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-amber-300 hover:bg-white/10'
                  : 'bg-slate-100 border-slate-300 text-[#051226] hover:bg-slate-200'
              }`}
              title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-[#051226]" />}
            </button>

            {/* Tombol Keluar Mobile */}
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className={`p-2 rounded-xl border text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors ${
                isDark ? 'border-red-500/25' : 'border-red-200'
              }`}
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Konten Tab */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 lg:pb-8">
          {/* ==================================================== */}
          {/* TAB 1: JADWAL / PANTAUAN UTAMA                       */}
          {/* ==================================================== */}
          {activeTab === 'jadwal' && (
            <div className="space-y-6 animate-fade-in">
              {/* -------------------------------------------------- */}
              {/* KONDISIONAL ROLE: PASIEN (READ-ONLY)               */}
              {/* -------------------------------------------------- */}
              {userRole === 'pasien' && (
                <>
                  {/* Hero Banner Pasien */}
                  <div
                    className={`rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${cardBg}`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                          }`}
                        >
                          PORTAL MANDIRI PASIEN
                        </span>
                        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>•</span>
                        <span
                          className={`text-xs ${
                            isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                          }`}
                        >
                          {profile.condition || 'Terapi Pernapasan Mandiri'}
                        </span>
                      </div>
                      <h2
                        className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${
                          isDark ? 'text-white' : 'text-[#051226]'
                        }`}
                      >
                        Selamat Datang, {profile.name || 'Pasien'} 👋
                      </h2>
                      <div
                        className={`flex items-center gap-2 text-xs mt-1 font-medium ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        <Calendar
                          className={`w-3.5 h-3.5 ${
                            isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                          }`}
                        />
                        <span>No. RM: {profile.rm}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                          isDark
                            ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/25'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full animate-pulse ${
                            isDark ? 'bg-emerald-400' : 'bg-emerald-600'
                          }`}
                        />
                        <span>Alarm Suara Aktif</span>
                      </span>

                      {/* Tombol Hubungi Pendamping */}
                      <button
                        type="button"
                        onClick={() =>
                          handleStartCall(
                            profile.emergencyContact || 'Pendamping Keluarga',
                            profile.guardianPhone || '081234567890',
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

                  {/* 4 Kartu Statistik Pasien (0 untuk Akun Baru) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        label: 'Jadwal Hari Ini',
                        value: `${completedCount}/${totalSchedules}`,
                        sub:
                          totalSchedules === 0
                            ? 'Belum ada jadwal aktif'
                            : completedCount === totalSchedules
                            ? 'Semua jadwal selesai ✓'
                            : `${totalSchedules - completedCount} jadwal menunggu`,
                        accent: 'border-l-[#4dd0e1]',
                        color: isDark ? 'text-[#4dd0e1]' : 'text-[#051226]',
                      },
                      {
                        label: 'Kepatuhan Terapi',
                        value: `${adherenceRate}%`,
                        sub:
                          totalSchedules === 0
                            ? 'Belum ada data kepatuhan'
                            : adherenceRate >= 80
                            ? 'Disiplin kepatuhan sangat baik'
                            : 'Perlu peningkatan disiplin',
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
                        value: `${streakDays}`,
                        sub:
                          streakDays === 0
                            ? '0 hari berturut-turut'
                            : 'Hari berturut tanpa henti 🔥',
                        accent: 'border-l-[#1976d2]',
                        color: isDark ? 'text-[#1976d2]' : 'text-[#0d47a1]',
                      },
                    ].map((st, i) => (
                      <div
                        key={i}
                        className={`rounded-2xl p-5 flex flex-col justify-between border-l-4 ${st.accent} ${cardBg}`}
                      >
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider ${
                            isDark ? 'text-slate-400' : 'text-slate-600 font-semibold'
                          }`}
                        >
                          {st.label}
                        </span>
                        <div className="my-2">
                          <span
                            className={`text-3xl font-extrabold tracking-tight ${st.color}`}
                          >
                            {st.value}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {st.sub}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* KARTU JADWAL PASIEN DENGAN EMPTY STATE JELAS */}
                  <div className={`rounded-2xl p-6 space-y-5 ${cardBg}`}>
                    <div className="flex items-center justify-between pb-3 border-b borderLight">
                      <div>
                        <h3
                          className={`text-lg font-bold tracking-tight ${
                            isDark ? 'text-white' : 'text-[#051226]'
                          }`}
                        >
                          Jadwal Minum Obat Pasien Hari Ini
                        </h3>
                        <p
                          className={`text-xs font-medium ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          Klik "Konfirmasi Minum" untuk membuka panduan teknik pakai obat 30 detik
                        </p>
                      </div>
                    </div>

                    {schedules.length === 0 ? (
                      /* EMPTY STATE PASIEN */
                      <div
                        className={`p-10 rounded-2xl border text-center space-y-3 ${
                          isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div
                          className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
                            isDark
                              ? 'bg-[#00acc1]/15 text-[#4dd0e1]'
                              : 'bg-blue-100 text-[#0d47a1]'
                          }`}
                        >
                          <Calendar className="w-7 h-7" />
                        </div>
                        <h4
                          className={`text-base font-bold ${
                            isDark ? 'text-white' : 'text-[#051226]'
                          }`}
                        >
                          Belum Ada Jadwal Terapi
                        </h4>
                        <p
                          className={`text-sm max-w-md mx-auto ${
                            isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                          }`}
                        >
                          Belum ada jadwal obat yang diatur. Menunggu Pendamping Keluarga
                          menambahkan jadwal terapi Anda.
                        </p>
                      </div>
                    ) : (
                      /* LIST JADWAL PASIEN (READ-ONLY) */
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
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                      isDark
                                        ? 'bg-[#00acc1]/15 text-[#4dd0e1] border border-[#00acc1]/30'
                                        : 'bg-[#0d47a1]/10 text-[#0d47a1] border border-[#0d47a1]/20 font-bold'
                                    }`}
                                  >
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
                                  className={`text-base font-bold ${
                                    isDark ? 'text-white' : 'text-[#051226]'
                                  }`}
                                >
                                  {med.name}
                                </h4>
                                <p
                                  className={`text-xs mt-1 ${
                                    isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                                  }`}
                                >
                                  Jadwal Pukul: <strong>{med.time} WIB</strong>
                                </p>
                                <p
                                  className={`text-xs mt-0.5 ${
                                    isDark ? 'text-slate-400' : 'text-slate-600'
                                  }`}
                                >
                                  Sisa Stok:{' '}
                                  <strong className={isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}>
                                    {med.type === 'Sirup'
                                      ? `${med.stock} ml`
                                      : `${med.stock} ${med.unit || 'dosis'}`}
                                  </strong>
                                </p>
                              </div>

                              <div className="pt-4 mt-3 border-t borderLight">
                                {isTaken ? (
                                  <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                                    <Check className="w-4 h-4 stroke-[3]" />
                                    <span>Sudah Diminum ✓</span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenValidation(med)}
                                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${btnPrimary}`}
                                  >
                                    <Timer className="w-3.5 h-3.5" />
                                    <span>Konfirmasi Minum (30s)</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* -------------------------------------------------- */}
              {/* KONDISIONAL ROLE: PENDAMPING KELUARGA (FULL AKSES) */}
              {/* -------------------------------------------------- */}
              {userRole === 'pendamping' && (
                <>
                  {/* Header Banner Pendamping */}
                  <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0d47a1] to-[#1976d2] text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-5 border border-[#4dd0e1]/30">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[#e0f7fa] text-xs font-bold mb-3 border border-white/20">
                        <Users className="w-3.5 h-3.5" />
                        <span>PORTAL PENDAMPING KELUARGA</span>
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        Pendamping: {currentUser?.name || 'Keluarga'} • Memantau Pasien:{' '}
                        {profile.name || 'Pasien'}
                      </h2>
                      <p className="text-sm text-[#e0f7fa]/90 mt-1 font-medium">
                        No. RM: {profile.rm} • Diagnosis:{' '}
                        {profile.condition || 'Terapi Pernapasan'}
                      </p>
                      <p className="text-xs text-[#e0f7fa]/75 mt-0.5">
                        Kontak Pasien: {profile.phone || '-'} • Alamat:{' '}
                        {profile.address || '-'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Tombol Tambah Obat */}
                      <button
                        type="button"
                        onClick={() => setActiveTab('tambah')}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#0d47a1] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Obat Pasien</span>
                      </button>

                      {/* Telepon Pasien */}
                      <button
                        type="button"
                        onClick={() =>
                          handleStartCall(
                            profile.name,
                            profile.phone,
                            'Mengingatkan jadwal terapi harian pasien'
                          )
                        }
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                          isDark
                            ? 'bg-[#4dd0e1] hover:brightness-110 text-[#051226]'
                            : 'bg-sky-100 hover:bg-sky-200 text-[#0d47a1]'
                        }`}
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Telepon Pasien</span>
                      </button>
                    </div>
                  </div>

                  {/* KARTU PANTAUAN REALTIME & EMPTY STATE PENDAMPING */}
                  <div className={`rounded-2xl p-6 space-y-4 ${cardBg}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b borderLight">
                      <div>
                        <h3
                          className={`text-lg font-bold tracking-tight ${
                            isDark ? 'text-white' : 'text-[#051226]'
                          }`}
                        >
                          Pantauan Jadwal Terapi Pasien Real-Time
                        </h3>
                        <p
                          className={`text-xs font-medium ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          Kelola jadwal obat pasien, edit dosis, atau hapus jadwal yang sudah tidak aktif
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab('tambah')}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer shadow-sm ${btnPrimary}`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Jadwal</span>
                      </button>
                    </div>

                    {schedules.length === 0 ? (
                      /* EMPTY STATE PENDAMPING */
                      <div
                        className={`p-10 rounded-2xl border text-center space-y-4 ${
                          isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div
                          className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
                            isDark
                              ? 'bg-[#00acc1]/15 text-[#4dd0e1]'
                              : 'bg-blue-100 text-[#0d47a1]'
                          }`}
                        >
                          <Calendar className="w-7 h-7" />
                        </div>
                        <h4
                          className={`text-base font-bold ${
                            isDark ? 'text-white' : 'text-[#051226]'
                          }`}
                        >
                          Belum Ada Jadwal Obat untuk Pasien Ini
                        </h4>
                        <p
                          className={`text-sm max-w-md mx-auto ${
                            isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                          }`}
                        >
                          Belum ada jadwal obat untuk pasien ini. Klik tombol Tambah Obat untuk
                          membuat jadwal pertama.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('tambah')}
                          className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm cursor-pointer shadow-lg ${btnPrimary}`}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Obat Pertama</span>
                        </button>
                      </div>
                    ) : (
                      /* LIST JADWAL PENDAMPING (DENGAN TOMBOL EDIT & HAPUS) */
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
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    isTaken
                                      ? isDark
                                        ? 'bg-emerald-400/15 text-emerald-400'
                                        : 'bg-emerald-100 text-emerald-800'
                                      : isDark
                                      ? 'bg-amber-400/15 text-amber-400'
                                      : 'bg-amber-100 text-amber-800'
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
                                  <h4
                                    className={`text-base font-bold ${
                                      isDark ? 'text-white' : 'text-[#051226]'
                                    }`}
                                  >
                                    {med.name}
                                  </h4>
                                  <p
                                    className={`text-xs ${
                                      isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                                    }`}
                                  >
                                    Jadwal: <strong>Pukul {med.time} WIB</strong> • Sisa Stok:{' '}
                                    {med.type === 'Sirup'
                                      ? `${med.stock} ml (${Math.floor(
                                          med.stock / (med.dosePerTake || 5)
                                        )} takaran)`
                                      : `${med.stock} ${med.unit || 'dosis'} (${
                                          med.dosePerTake || 1
                                        } ${med.unit || 'dosis'}/minum)`}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <span
                                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                    isTaken
                                      ? isDark
                                        ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30'
                                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : isDark
                                      ? 'bg-red-400/15 text-red-400 border-red-400/30 animate-pulse'
                                      : 'bg-red-100 text-red-800 border-red-300'
                                  }`}
                                >
                                  {med.status}
                                </span>

                                {/* TOMBOL EDIT & HAPUS (PENDAMPING ONLY) */}
                                <button
                                  type="button"
                                  onClick={() => handleEditMedication(med)}
                                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                    isDark
                                      ? 'border-white/10 text-slate-300 hover:text-white hover:bg-white/5'
                                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                                  }`}
                                  title="Edit Jadwal Obat"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteMedication(med.id)}
                                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                    isDark
                                      ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                                      : 'border-red-200 text-red-600 hover:bg-red-50'
                                  }`}
                                  title="Hapus Jadwal Obat"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: TAMBAH / ATUR OBAT (PENDAMPING ONLY)          */}
          {/* ==================================================== */}
          {activeTab === 'tambah' && userRole === 'pendamping' && (
            <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className={`text-2xl font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-[#051226]'
                    }`}
                  >
                    {editingMedId ? 'Edit Jadwal Obat Pasien' : 'Atur Jadwal Obat Pasien'}
                  </h2>
                  <p
                    className={`text-sm mt-1 font-medium ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Atur jenis sediaan, waktu minum, dan dosis takaran terapi
                  </p>
                </div>
                {editingMedId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-xs font-bold text-red-400 hover:underline cursor-pointer"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              <form
                onSubmit={handleAddMedicationSubmit}
                className={`rounded-2xl p-6 sm:p-8 space-y-5 ${cardBg}`}
              >
                <div>
                  <label
                    className={`block text-xs uppercase tracking-wider mb-2 ${
                      isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                    }`}
                  >
                    Nama Obat / Merek Sediaan
                  </label>
                  <input
                    type="text"
                    required
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    placeholder="Contoh: Inhaler Budesonide atau Teofilin 150mg"
                    className={`w-full py-3 px-4 rounded-xl text-sm font-medium focus:outline-none transition-all ${inputBg}`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs uppercase tracking-wider mb-2 ${
                      isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                    }`}
                  >
                    Bentuk Sediaan Obat
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        type: 'Inhaler',
                        label: 'Inhaler',
                        sub: 'Semprot / Hirup',
                        icon: Wind,
                      },
                      {
                        type: 'Oral',
                        label: 'Oral',
                        sub: 'Tablet / Kapsul',
                        icon: Pill,
                      },
                      {
                        type: 'Sirup',
                        label: 'Sirup',
                        sub: 'Cairan / Takar ml',
                        icon: Droplets,
                      },
                    ].map((s) => {
                      const Icon = s.icon;
                      const isSelected = newMed.type === s.type;
                      return (
                        <button
                          key={s.type}
                          type="button"
                          onClick={() => setNewMed({ ...newMed, type: s.type })}
                          className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 ${
                            isSelected
                              ? isDark
                                ? 'border-2 border-[#00acc1] bg-[#00acc1]/15 text-white shadow-lg shadow-[#00acc1]/20'
                                : 'border-2 border-[#0d47a1] bg-[#0d47a1]/10 text-[#0d47a1] shadow-md shadow-[#0d47a1]/15'
                              : isDark
                              ? 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                isSelected
                                  ? isDark
                                    ? 'bg-[#4dd0e1] text-[#051226]'
                                    : 'bg-[#0d47a1] text-white'
                                  : isDark
                                  ? 'bg-white/10 text-[#4dd0e1]'
                                  : 'bg-white text-[#0d47a1] border border-slate-200'
                              }`}
                            >
                              <Icon className="w-5 h-5 stroke-[2.2]" />
                            </div>
                            {isSelected && (
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isDark ? 'bg-[#4dd0e1]' : 'bg-[#0d47a1]'
                                } animate-pulse`}
                              />
                            )}
                          </div>
                          <div>
                            <p
                              className={`font-bold text-sm ${
                                isSelected ? (isDark ? 'text-white' : 'text-[#0d47a1]') : ''
                              }`}
                            >
                              {s.label}
                            </p>
                            <p
                              className={`text-[11px] leading-tight mt-0.5 ${
                                isSelected
                                  ? isDark
                                    ? 'text-[#4dd0e1] font-medium'
                                    : 'text-[#0d47a1] font-semibold'
                                  : isDark
                                  ? 'text-slate-400'
                                  : 'text-slate-500'
                              }`}
                            >
                              {s.sub}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-xs uppercase tracking-wider mb-2 ${
                        isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                      }`}
                    >
                      Waktu Minum (WIB)
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        required
                        value={newMed.time}
                        onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                        style={{ colorScheme: isDark ? 'dark' : 'light' }}
                        className={`w-full py-3 px-4 pr-10 rounded-xl text-sm font-medium focus:outline-none transition-all dark:[&::-webkit-calendar-picker-indicator]:invert dark:[&::-webkit-calendar-picker-indicator]:brightness-200 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${inputBg}`}
                      />
                      <Clock
                        className={`w-4 h-4 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 ${
                          isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-xs uppercase tracking-wider mb-2 ${
                        isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                      }`}
                    >
                      {newMed.type === 'Sirup'
                        ? 'Takaran Sekali Minum (ml)'
                        : newMed.type === 'Inhaler'
                        ? 'Jumlah Semprotan'
                        : 'Jumlah Tablet'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={
                        newMed.type === 'Sirup' ? newMed.syrupDose : newMed.dosePerTake
                      }
                      onChange={(e) =>
                        newMed.type === 'Sirup'
                          ? setNewMed({ ...newMed, syrupDose: Number(e.target.value) })
                          : setNewMed({ ...newMed, dosePerTake: Number(e.target.value) })
                      }
                      className={`w-full py-3 px-4 rounded-xl text-sm font-medium focus:outline-none transition-all ${inputBg}`}
                    />
                  </div>
                </div>

                {newMed.type === 'Sirup' ? (
                  <div>
                    <label
                      className={`block text-xs uppercase tracking-wider mb-2 ${
                        isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                      }`}
                    >
                      Volume Total Botol (ml)
                    </label>
                    <input
                      type="number"
                      min="10"
                      required
                      value={newMed.syrupVolume}
                      onChange={(e) =>
                        setNewMed({ ...newMed, syrupVolume: Number(e.target.value) })
                      }
                      className={`w-full py-3 px-4 rounded-xl text-sm font-medium focus:outline-none transition-all ${inputBg}`}
                    />
                  </div>
                ) : (
                  <div>
                    <label
                      className={`block text-xs uppercase tracking-wider mb-2 ${
                        isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                      }`}
                    >
                      Total Stok Awal ({newMed.type === 'Inhaler' ? 'Semprotan' : 'Tablet'})
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newMed.stock}
                      onChange={(e) => setNewMed({ ...newMed, stock: Number(e.target.value) })}
                      className={`w-full py-3 px-4 rounded-xl text-sm font-medium focus:outline-none transition-all ${inputBg}`}
                    />
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  {editingMedId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className={`flex-1 py-3.5 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                        isDark
                          ? 'border-white/10 text-slate-300 hover:bg-white/5'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`flex-1 py-3.5 px-4 rounded-xl text-base font-bold transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${btnPrimary}`}
                  >
                    <Plus className="w-5 h-5" />
                    <span>{editingMedId ? 'Simpan Perubahan Jadwal' : 'Tambahkan ke Jadwal Pasien'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: TELEPON PASIEN (PENDAMPING ONLY)              */}
          {/* ==================================================== */}
          {activeTab === 'kontak' && userRole === 'pendamping' && (
            <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
              <div>
                <h2
                  className={`text-2xl font-bold tracking-tight ${
                    isDark ? 'text-white' : 'text-[#051226]'
                  }`}
                >
                  Kontak &amp; Panggilan Cepat Pasien
                </h2>
                <p
                  className={`text-sm mt-1 font-medium ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Hubungi pasien satu sentuhan untuk mengingatkan jadwal terapi
                </p>
              </div>

              <div className={`rounded-2xl p-6 sm:p-8 space-y-6 ${cardBg}`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0d47a1] to-[#1976d2] text-[#e0f7fa] font-extrabold text-2xl flex items-center justify-center shadow-lg">
                    {(profile.name || 'P').charAt(0)}
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-bold ${
                        isDark ? 'text-white' : 'text-[#051226]'
                      }`}
                    >
                      {profile.name || 'Pasien'}
                    </h3>
                    <p
                      className={`text-sm ${
                        isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                      }`}
                    >
                      No. RM: {profile.rm} • Usia: {profile.age || '-'}
                    </p>
                    <p
                      className={`text-xs font-bold mt-0.5 ${
                        isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                      }`}
                    >
                      Diagnosis: {profile.condition || 'Terapi Pernapasan'}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    isDark ? 'bg-[#051226] border-[#00acc1]/20' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span
                      className={`text-xs uppercase ${
                        isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                      }`}
                    >
                      Nomor Telepon Pasien:
                    </span>
                    <p
                      className={`text-lg font-mono font-bold ${
                        isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                      }`}
                    >
                      {profile.phone || 'Belum diatur'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                          href={`tel:${(profile?.phone || '').replace(/[^0-9+]/g, '')}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const cleanTel = (profile?.phone || '').replace(/[^0-9+]/g, '');
                            if (!cleanTel) {
                              e.preventDefault();
                              alert('Nomor telepon pasien belum diisi pada profil medis.');
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#4dd0e1] hover:bg-[#26c6da] text-[#051226] font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Telepon Langsung</span>
                        </a>

                    <a
                      href={`https://wa.me/62${(profile.phone || '').replace(/^0/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: LAPORAN KEPATUHAN                             */}
          {/* ==================================================== */}
          {activeTab === 'laporan' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2
                    className={`text-2xl font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-[#051226]'
                    }`}
                  >
                    Laporan Kepatuhan Terapi
                  </h2>
                  <p
                    className={`text-sm mt-1 font-medium ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Rekapitulasi kedisiplinan minum obat dan teknik inhalasi
                  </p>
                </div>
              </div>

              <div className={`rounded-2xl p-6 ${cardBg}`}>
                <h3
                  className={`text-lg font-bold mb-4 ${
                    isDark ? 'text-white' : 'text-[#051226]'
                  }`}
                >
                  Riwayat Kepatuhan Terapi Harian
                </h3>

                {historyData.length === 0 ? (
                  /* EMPTY STATE LAPORAN */
                  <div
                    className={`p-10 rounded-2xl border text-center space-y-3 ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <BarChart3
                      className={`w-12 h-12 mx-auto ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    />
                    <h4
                      className={`text-base font-bold ${
                        isDark ? 'text-white' : 'text-[#051226]'
                      }`}
                    >
                      Belum Ada Riwayat Kepatuhan
                    </h4>
                    <p
                      className={`text-sm ${
                        isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                      }`}
                    >
                      Belum ada riwayat kepatuhan obat untuk ditampilkan. Riwayat akan otomatis
                      tercatat setelah pasien mengonfirmasi jadwal minum obat.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <th className="py-3.5 px-4">Tanggal</th>
                          <th className="py-3.5 px-4">Total Jadwal</th>
                          <th className="py-3.5 px-4">Tepat Waktu</th>
                          <th className="py-3.5 px-4">Terlewat</th>
                          <th className="py-3.5 px-4">Persentase</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                        {(() => {
                          const todayObj = new Date();
                          const todayKey = todayObj.toLocaleDateString('en-CA');
                          const rmKey = String(
                            profile?.rm || patientProfile?.rm || user?.rm || 'DEFAULT'
                          ).toUpperCase();
                          const historyStorageKey = `respicare-compliance-history-v2-${rmKey}`;

                          let storedHistory = {};
                          try {
                            storedHistory = JSON.parse(localStorage.getItem(historyStorageKey) || '{}') || {};
                          } catch {
                            storedHistory = {};
                          }

                          const isTakenCheck = (s) =>
                            Boolean(
                              s &&
                                (s.taken === true ||
                                  s.isTaken === true ||
                                  s.completed === true ||
                                  s.status === 'taken' || s.status === 'diminum' ||
                                  s.status === 'completed' ||
                                  s.status === 'done')
                            );

                          const activeList = Array.isArray(schedules) ? schedules : [];
                          const totalToday = activeList.length;
                          const takenToday = activeList.filter((s) => isTakenCheck(s)).length;
                          const missedToday = Math.max(0, totalToday - takenToday);
                          const pctToday = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;

                          storedHistory[todayKey] = {
                            total: totalToday,
                            taken: takenToday,
                            missed: missedToday,
                            percentage: pctToday,
                          };

                          try {
                            localStorage.setItem(historyStorageKey, JSON.stringify(storedHistory));
                          } catch {}

                          const allKeysSet = new Set(Object.keys(storedHistory));
                          for (let d = 0; d < 7; d++) {
                            const dt = new Date(todayObj);
                            dt.setDate(todayObj.getDate() - d);
                            allKeysSet.add(dt.toLocaleDateString('en-CA'));
                          }

                          const sortedKeys = Array.from(allKeysSet).sort((a, b) => b.localeCompare(a));

                          const formatIndoDate = (isoKey) => {
                            const [y, m, day] = isoKey.split('-').map(Number);
                            const dateInstance = new Date(y, (m || 1) - 1, day || 1);
                            return dateInstance.toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            });
                          };

                          return sortedKeys.map((dateKey) => {
                            const rec = storedHistory[dateKey] || {
                              total: totalToday,
                              taken: 0,
                              missed: totalToday,
                              percentage: 0,
                            };
                            const isTodayRow = dateKey === todayKey;
                            return (
                              <tr key={dateKey} className="hover:bg-slate-800/30 transition-colors">
                                <td className="py-3.5 px-4 font-semibold text-white">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span>{formatIndoDate(dateKey)}</span>
                                    {isTodayRow && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                        Hari Ini
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-slate-300">{rec.total} jadwal</td>
                                <td className="py-3.5 px-4 font-bold text-emerald-400">{rec.taken}</td>
                                <td className="py-3.5 px-4 font-bold text-amber-400">{rec.missed}</td>
                                <td className="py-3.5 px-4 font-extrabold text-cyan-400">{rec.percentage}%</td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: PROFIL & MEDIS / DATA PASIEN & AKSES          */}
          {/* ==================================================== */}
          {activeTab === 'akun' && (
            <div className="space-y-6 animate-fade-in">
              <div
                className={`rounded-2xl p-6 flex items-center justify-between ${cardBg}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d47a1] to-[#1976d2] text-[#e0f7fa] border border-[#4dd0e1]/30 flex items-center justify-center text-2xl font-extrabold shrink-0">
                    {(profile.name || 'P').charAt(0)}
                  </div>
                  <div>
                    <h2
                      className={`text-2xl font-bold tracking-tight ${
                        isDark ? 'text-white' : 'text-[#051226]'
                      }`}
                    >
                      {profile.name || 'Data Rekam Medis Pasien'}
                    </h2>
                    <p
                      className={`text-sm font-medium ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      No. RM: {profile.rm} • {profile.condition || 'Terapi Pernapasan'}
                    </p>
                  </div>
                </div>

                <span
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                    isDark
                      ? 'bg-[#4dd0e1]/15 text-[#4dd0e1] border border-[#4dd0e1]/30'
                      : 'bg-[#0d47a1]/10 text-[#0d47a1] border border-[#0d47a1]/20'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Rekam Medis Terverifikasi
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* FORM DATA PASIEN */}
                <form
                  onSubmit={handleSaveProfileByPendamping}
                  className={`rounded-2xl p-6 space-y-4 ${cardBg}`}
                >
                  <div className="flex items-center justify-between pb-3 border-b borderLight">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <User
                        className={`w-5 h-5 ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`}
                      />
                      <h3
                        className={`text-base font-bold ${
                          isDark ? 'text-white' : 'text-[#051226]'
                        }`}
                      >
                        Informasi Pasien
                      </h3>
                    </div>
                    {userRole === 'pasien' ? (
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isDark
                            ? 'bg-amber-400/10 text-amber-300 border-amber-400/25'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        Read-Only (Pasien)
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isDark
                            ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/25'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        Mode Edit (Pendamping)
                      </span>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-xs uppercase tracking-wider mb-1.5 ${
                        isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                      }`}
                    >
                      No. Rekam Medis (RM)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profile.rm}
                      className={`w-full py-2.5 px-4 rounded-xl cursor-not-allowed ${
                        isDark
                          ? 'opacity-60 bg-[#051226]/80 border border-[#00acc1]/30 text-[#e0f7fa]'
                          : 'bg-slate-100 border border-slate-300 text-slate-700 font-medium'
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs uppercase tracking-wider mb-1.5 ${
                        isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                      }`}
                    >
                      Nama Lengkap Pasien
                    </label>
                    <input
                      type="text"
                      disabled={userRole === 'pasien'}
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium ${
                        userRole === 'pasien'
                          ? isDark
                            ? 'opacity-70 bg-[#051226]/80 border border-[#00acc1]/20 cursor-not-allowed'
                            : 'bg-slate-100 border border-slate-300 text-slate-800 cursor-not-allowed'
                          : inputBg
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs uppercase tracking-wider mb-1.5 ${
                        isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                      }`}
                    >
                      Nomor Telepon Pasien
                    </label>
                    <input
                      type="text"
                      disabled={userRole === 'pasien'}
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium ${
                        userRole === 'pasien'
                          ? isDark
                            ? 'opacity-70 bg-[#051226]/80 border border-[#00acc1]/20 cursor-not-allowed'
                            : 'bg-slate-100 border border-slate-300 text-slate-800 cursor-not-allowed'
                          : inputBg
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs uppercase tracking-wider mb-1.5 ${
                        isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                      }`}
                    >
                      Penyakit / Diagnosis Pernapasan
                    </label>
                    <input
                      type="text"
                      disabled={userRole === 'pasien'}
                      value={profile.condition}
                      onChange={(e) => setProfile({ ...profile, condition: e.target.value })}
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium ${
                        userRole === 'pasien'
                          ? isDark
                            ? 'opacity-70 bg-[#051226]/80 border border-[#00acc1]/20 cursor-not-allowed'
                            : 'bg-slate-100 border border-slate-300 text-slate-800 cursor-not-allowed'
                          : inputBg
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs uppercase tracking-wider mb-1.5 ${
                        isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                      }`}
                    >
                      Alamat Tinggal
                    </label>
                    <textarea
                      rows={2}
                      disabled={userRole === 'pasien'}
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium resize-none ${
                        userRole === 'pasien'
                          ? isDark
                            ? 'opacity-70 bg-[#051226]/80 border border-[#00acc1]/20 cursor-not-allowed'
                            : 'bg-slate-100 border border-slate-300 text-slate-800 cursor-not-allowed'
                          : inputBg
                      }`}
                    />
                  </div>

                  <div className="pt-2">
                    {userRole === 'pasien' ? (
                      <div
                        className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                          isDark
                            ? 'bg-[#051226] border-white/10 text-slate-400'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-[#4dd0e1] shrink-0" />
                        <span>
                          Data profil Anda dikunci untuk keamanan rekam medis. Perubahan data dapat
                          dilakukan melalui portal Pendamping Keluarga.
                        </span>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        className={`w-full py-2.5 px-5 rounded-xl text-sm font-bold cursor-pointer ${btnPrimary}`}
                      >
                        Simpan Perubahan Data Pasien
                      </button>
                    )}
                  </div>
                </form>

                {/* Kolom Kanan: KARTU KODE PAIRING (HANYA RM) & MEDIS */}
                <div className="space-y-5">
                  {/* KARTU KODE PAIRING KELUARGA (HANYA MENYALIN RM BERSIH) */}
                  <div className={`rounded-2xl p-6 space-y-4 border ${cardBg}`}>
                    <div className="flex items-center justify-between pb-3 border-b borderLight">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                            isDark
                              ? 'bg-[#00acc1]/20 text-[#4dd0e1] border-[#00acc1]/30'
                              : 'bg-blue-100 text-[#0d47a1] border-blue-200'
                          }`}
                        >
                          <Key className="w-4 h-4" />
                        </div>
                        <div>
                          <h3
                            className={`text-base font-bold ${
                              isDark ? 'text-white' : 'text-[#051226]'
                            }`}
                          >
                            Kode Pairing Keluarga
                          </h3>
                          <p
                            className={`text-xs ${
                              isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                            }`}
                          >
                            Sinkronisasi pemantauan pendamping
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          isDark
                            ? 'bg-[#4dd0e1]/10 text-[#4dd0e1] border border-[#4dd0e1]/25'
                            : 'bg-[#0d47a1]/10 text-[#0d47a1] border border-[#0d47a1]/20'
                        }`}
                      >
                        Sesi Terhubung
                      </span>
                    </div>

                    <div
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                        isDark ? 'bg-[#051226] border-[#00acc1]/25' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <span
                          className={`text-[11px] uppercase font-bold tracking-wider ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          Kode Rekam Medis Pasien:
                        </span>
                        <div>
                          <span
                            className={`text-2xl font-mono font-extrabold tracking-wider ${
                              isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                            }`}
                          >
                            {profile.rm}
                          </span>
                        </div>
                        <p
                          className={`text-xs ${
                            isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                          }`}
                        >
                          Atas Nama: <strong>{profile.name}</strong>
                        </p>
                      </div>

                      {/* TOMBOL SALIN KODE PAIRING (HANYA MENYALIN RM BERSIH) */}
                      <button
                        type="button"
                        onClick={handleCopyPairing}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shrink-0 ${
                          copiedPairing ? 'bg-emerald-600 text-white' : btnPrimary
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

                    <div
                      className={`text-xs flex items-center gap-2 ${
                        isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Berikan kode rekam medis ini kepada keluarga agar dapat masuk melalui
                        portal pendamping.
                      </span>
                    </div>
                  </div>

                  {/* Informasi Medis */}
                  <div className={`rounded-2xl p-6 space-y-4 ${cardBg}`}>
                    <div className="flex items-center gap-2 pb-3 border-b borderLight">
                      <HeartPulse
                        className={`w-5 h-5 ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`}
                      />
                      <h3
                        className={`text-base font-bold ${
                          isDark ? 'text-white' : 'text-[#051226]'
                        }`}
                      >
                        Informasi Medis Pasien
                      </h3>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      {profile.birthPlace && (
                        <div className={`flex items-center justify-between py-1 border-b ${borderSubtle}`}>
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>
                            Tempat Lahir
                          </span>
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                            {profile.birthPlace}
                          </span>
                        </div>
                      )}
                      <div className={`flex items-center justify-between py-1 border-b ${borderSubtle}`}>
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>
                          Tanggal Lahir
                        </span>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                          {profile.birthDate || '-'}
                        </span>
                      </div>
                      <div className={`flex items-center justify-between py-1 border-b ${borderSubtle}`}>
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>
                          Usia Pasien
                        </span>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                          {profile.age || '-'}
                        </span>
                      </div>
                      <div className={`flex items-center justify-between py-1 border-b ${borderSubtle}`}>
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>
                          Jenis Kelamin
                        </span>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#051226]'}`}>
                          {profile.gender || '-'}
                        </span>
                      </div>
                      <div className={`flex items-center justify-between py-1 border-b ${borderSubtle}`}>
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>
                          Diagnosis Utama
                        </span>
                        <span
                          className={`font-bold ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`}
                        >
                          {profile.condition || '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>
                          Kontak Pendamping
                        </span>
                        <span
                          className={`font-semibold ${
                            isDark ? 'text-emerald-400' : 'text-emerald-700 font-bold'
                          }`}
                        >
                          {profile.emergencyContact || '-'}
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
      {/* 3. MODAL ALARM OBAT BERDERING (AUDIO & NOTIFIKASI)           */}
      {/* ============================================================ */}
      {alarmModal.isOpen && alarmModal.med && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{
            background: isDark ? 'rgba(5, 18, 38, 0.85)' : 'rgba(5, 18, 38, 0.65)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className={`w-full max-w-md rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl border ${
              isDark
                ? 'bg-[#081b3a] border-amber-400/40 text-[#e0f7fa]'
                : 'bg-white border-2 border-amber-400 text-[#051226]'
            }`}
          >
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
              <h3
                className={`text-2xl font-bold tracking-tight mt-1 ${
                  isDark ? 'text-white' : 'text-[#051226]'
                }`}
              >
                {alarmModal.med.name}
              </h3>
              <p
                className={`text-sm mt-1 font-semibold ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Jadwal Pukul {alarmModal.med.time} WIB
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleStopAlarmAndOpenGuide}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-base shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Matikan Alarm &amp; Buka Panduan Pakai</span>
              </button>

              <button
                type="button"
                onClick={handleSnoozeAlarm}
                className={`w-full py-2.5 px-4 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isDark
                    ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                    : 'bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Tunda 5 Menit (Snooze)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MODAL VALIDASI 30-DETIK INHALER GUIDE (PASIEN)            */}
      {/* ============================================================ */}
      {activeMedication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{
            background: isDark ? 'rgba(5, 18, 38, 0.85)' : 'rgba(5, 18, 38, 0.65)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border ${
              isDark
                ? 'bg-[#081b3a] border-[#00acc1]/30 text-[#e0f7fa]'
                : 'bg-white border border-slate-200 text-[#051226]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b borderLight">
              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                  }`}
                >
                  Panduan Teknik Pakai Obat
                </span>
                <h3
                  className={`text-xl font-bold tracking-tight ${
                    isDark ? 'text-white' : 'text-[#051226]'
                  }`}
                >
                  {activeMedication.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseValidation}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div
              className={`p-4 rounded-2xl border text-center space-y-3 ${
                isDark ? 'bg-[#051226] border-[#00acc1]/20' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
                  isDark
                    ? 'bg-[#00acc1]/20 text-[#4dd0e1]'
                    : 'bg-[#0d47a1] text-white'
                }`}
              >
                <Wind className="w-6 h-6" />
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700 font-medium'
                }`}
              >
                {activeMedication.instructions}
              </p>

              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
                  {countdown > 0
                    ? `Perhatikan panduan selama ${countdown} detik...`
                    : 'Panduan selesai! Anda dapat mengonfirmasi dosis sekarang.'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleCloseValidation}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                  isDark
                    ? 'border-white/10 text-slate-300 hover:bg-white/5'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={!isUnlocked}
                onClick={handleConfirmDose}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  isUnlocked
                    ? btnPrimary + ' cursor-pointer shadow-lg'
                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Konfirmasi Sudah Minum</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MODAL SIMULASI PANGGILAN CEPAT                            */}
      {/* ============================================================ */}
      {callModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{
            background: 'rgba(5, 18, 38, 0.90)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="w-full max-w-sm rounded-3xl p-6 sm:p-8 text-center space-y-6 bg-[#081b3a] border border-[#00acc1]/30 text-white shadow-2xl">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              {callModal.isConnected && (
                <span className="absolute inset-0 rounded-full bg-emerald-400/25 animate-ping" />
              )}
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#0d47a1] to-[#1976d2] text-white flex items-center justify-center text-3xl font-extrabold shadow-lg">
                {(callModal.targetName || 'P').charAt(0)}
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold tracking-tight">
                {callModal.targetName}
              </h4>
              <p className="text-xs mt-0.5 font-mono text-slate-400">
                {callModal.targetPhone}
              </p>
              <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-sky-300">
                {callModal.isConnected
                  ? `Terhubung (${Math.floor(callModal.duration / 60)}:${
                      callModal.duration % 60 < 10 ? '0' : ''
                    }${callModal.duration % 60})`
                  : 'Memanggil...'}
              </span>
            </div>

            <div className="pt-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/40 cursor-pointer transition-all"
              >
                <LogOut className="w-7 h-7 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DEVELOPER DATABASE INSPECTOR (PIN: DEV-2026)           */}
      {/* ============================================================ */}
      

      {/* ============================================================ */}
      {/* 6. MODAL LOGOUT                                              */}
      {/* ============================================================ */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{
            background: isDark ? 'rgba(5, 18, 38, 0.85)' : 'rgba(5, 18, 38, 0.65)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            className={`w-full max-w-sm rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl border ${
              isDark
                ? 'bg-[#081b3a] border-[#00acc1]/30 text-[#e0f7fa]'
                : 'bg-white border border-slate-200 text-[#051226]'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-red-500/10 text-red-500">
              <LogOut className="w-7 h-7" />
            </div>

            <div>
              <h4
                className={`text-xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-[#051226]'
                }`}
              >
                Keluar dari Sesi?
              </h4>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                }`}
              >
                Anda akan diarahkan kembali ke halaman beranda. Data rekam medis dan jadwal tetap
                tersimpan dengan aman.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm border transition-all cursor-pointer font-semibold ${
                  isDark
                    ? 'border-white/10 text-slate-300 hover:bg-white/5'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm cursor-pointer shadow-md"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. TOAST NOTIFICATION CONTAINER                              */}
      {/* ============================================================ */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-sm font-bold flex items-center gap-2 ${
              isDark
                ? 'bg-[#081b3a] border-[#4dd0e1] text-[#4dd0e1]'
                : 'bg-[#0d47a1] border-[#0d47a1] text-white'
            }`}
          >
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
      {/* ============================================================ */}
      {/* 8. BOTTOM NAVIGATION BAR UNTUK MOBILE & TABLET (< lg)         */}
      {/* ============================================================ */}
      <nav
        className={`lg:hidden fixed bottom-0 inset-x-0 z-40 px-2 py-1.5 backdrop-blur-xl border-t flex items-center justify-around shadow-2xl ${
          isDark
            ? 'bg-[#051226]/95 border-[#00acc1]/20 text-[#e0f7fa]'
            : 'bg-white/95 border-slate-200 text-[#051226]'
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 min-h-[48px] py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? isDark
                    ? 'text-[#4dd0e1] font-bold bg-[#4dd0e1]/10'
                    : 'text-[#0d47a1] font-bold bg-[#0d47a1]/10'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-[#051226]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] tracking-tight truncate max-w-[64px] text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
