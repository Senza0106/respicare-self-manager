import TrialAccountManager from './components/TrialAccountManager';
import { syncAccountToSupabase, syncAllLocalAccountsToSupabase } from './lib/supabase';
import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  ArrowLeft,
  ArrowRight,
  User,
  Users,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  Clock,
  Wind,
  ShieldCheck,
  AlertCircle,
  Copy,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

export function RespiCareLogo({ isDark, onClick, size = 'default' }) {
  const isSmall = size === 'sm';
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div
        className={`${
          isSmall ? 'w-8 h-8 rounded-xl' : 'w-10 h-10 rounded-xl'
        } bg-gradient-to-br from-[#0d47a1] to-[#1976d2] text-[#e0f7fa] border border-[#4dd0e1]/30 flex items-center justify-center shadow-inner shrink-0`}
      >
        <HeartPulse className={`${isSmall ? 'w-4 h-4' : 'w-5 h-5'} stroke-[2.2]`} />
      </div>
      <span
        className={`font-extrabold tracking-tight font-sans ${
          isSmall ? 'text-lg' : 'text-xl'
        } ${isDark ? 'text-white' : 'text-[#051226]'}`}
      >
        Respi<span className={isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}>Care</span>
      </span>
    </div>
  );
}

export default function Login({
  theme,
  toggleTheme,
  onBackToLanding,
  onLoginSuccess,
  onDemoLogin,
  demoPatient,
}) {
  const isDark = theme === 'dark';

  // Tab Login: 'pasien' | 'pendamping'
  const [loginRole, setLoginRole] = useState('pasien');
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [pairingCode, setPairingCode] = useState('');
  const [pairingError, setPairingError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Mode State
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerRole, setRegisterRole] = useState('pasien');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [copiedRmPrompt, setCopiedRmPrompt] = useState(false);

  // Auto-generated RM for Pasien register
  const [generatedRm, setGeneratedRm] = useState(() => {
    return `RM-2026-${Math.floor(Math.random() * 900 + 100)}`;
  });

  // Re-generate unique RM when switching to Pasien register
  useEffect(() => {
    if (isRegisterMode && registerRole === 'pasien') {
      setGeneratedRm(`RM-2026-${Math.floor(Math.random() * 900 + 100)}`);
    }
  }, [isRegisterMode, registerRole]);

  // Form State: Pasien (Super Simpel 4 Kolom)
  const [pasienRegisterForm, setPasienRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Form State: Pendamping (Lengkap & Data Medis Pasien)
  const [pendampingRegisterForm, setPendampingRegisterForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    pairingCode: '',
    patientBirthPlace: '',
    patientBirthDate: '',
    patientGender: 'Laki-laki',
    patientPhone: '',
    patientDiagnosis: '',
    patientAddress: '',
  });

  // Helper hitung usia dari tanggal lahir
  const calculateAge = (birthDateStr) => {
    if (!birthDateStr) return '';
    const birth = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // Salin Kode RM Otomatis saat daftar pasien
  const handleCopyGeneratedRm = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(generatedRm);
    }
    setCopiedRmPrompt(true);
    setTimeout(() => setCopiedRmPrompt(false), 2000);
  };

  // Submit Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    const savedAccounts = JSON.parse(
      localStorage.getItem('respicare-accounts') || '[]'
    );
    const demoEmail = 'sendyi0110@gmail.com';

    if (registerRole === 'pasien') {
      // 1. VALIDASI REGISTER PASIEN (SUPER SIMPEL 4 KOLOM)
      const { name, email, password } = pasienRegisterForm;
      if (!name.trim() || !email.trim() || !password.trim()) {
        setRegisterError('Semua field wajib diisi.');
        return;
      }
      if (password.length < 6) {
        setRegisterError('Kata sandi minimal 6 karakter.');
        return;
      }
      const allEmails = [
        demoEmail,
        ...savedAccounts.map((a) => (a.email || '').toLowerCase()),
      ];
      if (allEmails.includes(email.trim().toLowerCase())) {
        setRegisterError('Email ini sudah terdaftar. Silakan masuk.');
        return;
      }

      const newPasienAccount = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'pasien',
        rm: generatedRm,
        pin: '8492',
        phone: '',
        address: '',
        birthPlace: '',
        birthDate: '',
        age: '',
        gender: '',
        condition: 'Belum Diatur oleh Pendamping',
        emergencyContact: '',
        guardianPhone: '',
        createdAt: new Date().toISOString(),
      };

      const updatedAccounts = [...savedAccounts, newPasienAccount];
      localStorage.setItem('respicare-accounts', JSON.stringify(updatedAccounts));
      
      await syncAccountToSupabase(newPasienAccount);
      syncAllLocalAccountsToSupabase();

      setRegisterSuccess(
        `✓ Akun Pasien berhasil dibuat! No. RM Anda: ${generatedRm}. Salin dan berikan kode ini kepada Pendamping Keluarga Anda.`
      );
      setLoginForm((prev) => ({ ...prev, email: email.trim().toLowerCase() }));

      setTimeout(() => {
        setIsRegisterMode(false);
        setPasienRegisterForm({ name: '', email: '', password: '' });
        setRegisterSuccess('');
      }, 3500);
    } else {
      // 2. VALIDASI REGISTER PENDAMPING KELUARGA (LENGKAP + DATA MEDIS PASIEN)
      const {
        name,
        phone,
        email,
        password,
        pairingCode: pCode,
        patientBirthPlace,
        patientBirthDate,
        patientGender,
        patientPhone,
        patientDiagnosis,
        patientAddress,
      } = pendampingRegisterForm;

      if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) {
        setRegisterError('Nama, No. Telepon/WA, Email, dan Sandi Pendamping wajib diisi.');
        return;
      }
      if (!pCode.trim()) {
        setRegisterError('Kode Pairing Pasien (No. RM) wajib diisi untuk menghubungkan akun.');
        return;
      }
      if (password.length < 6) {
        setRegisterError('Kata sandi minimal 6 karakter.');
        return;
      }

      const allEmails = [
        demoEmail,
        ...savedAccounts.map((a) => (a.email || '').toLowerCase()),
      ];
      if (allEmails.includes(email.trim().toLowerCase())) {
        setRegisterError('Email pendamping ini sudah terdaftar. Silakan masuk.');
        return;
      }

      const cleanPairingCode = pCode.trim().toUpperCase();
      const computedAge = calculateAge(patientBirthDate);

      // Buat akun pendamping
      const newPendampingAccount = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'pendamping',
        pairingCode: cleanPairingCode,
        createdAt: new Date().toISOString(),
      };

      // Tautkan & Simpan data medis langsung ke profil pasien pemilik RM tersebut
      let patientUpdated = false;
      const updatedAccounts = savedAccounts.map((acc) => {
        if (
          acc.role === 'pasien' &&
          (acc.rm?.toUpperCase() === cleanPairingCode || acc.pin === cleanPairingCode)
        ) {
          patientUpdated = true;
          return {
            ...acc,
            birthPlace: patientBirthPlace.trim() || acc.birthPlace || '',
            birthDate: patientBirthDate || acc.birthDate || '',
            age: computedAge ? `${computedAge} tahun` : acc.age || '',
            gender: patientGender || acc.gender || 'Laki-laki',
            condition: patientDiagnosis.trim() || acc.condition || 'Asma Bronkial',
            phone: patientPhone.trim() || acc.phone || '',
            address: patientAddress.trim() || acc.address || '',
            emergencyContact: `${name.trim()} (${phone.trim()})`,
            guardianPhone: phone.trim(),
          };
        }
        return acc;
      });

      // Jika pasien belum terdaftar di accounts, buatkan placeholder record pasien agar data medis tidak hilang
      if (!patientUpdated && cleanPairingCode !== 'RM-2026-040') {
        updatedAccounts.push({
          name: `Pasien ${cleanPairingCode}`,
          email: '',
          password: '',
          role: 'pasien',
          rm: cleanPairingCode,
          pin: '8492',
          birthPlace: patientBirthPlace.trim(),
          birthDate: patientBirthDate,
          age: computedAge ? `${computedAge} tahun` : '',
          gender: patientGender,
          condition: patientDiagnosis.trim() || 'Asma Bronkial',
          phone: patientPhone.trim(),
          address: patientAddress.trim(),
          emergencyContact: `${name.trim()} (${phone.trim()})`,
          guardianPhone: phone.trim(),
          createdAt: new Date().toISOString(),
        });
      }

      updatedAccounts.push(newPendampingAccount);
      localStorage.setItem('respicare-accounts', JSON.stringify(updatedAccounts));
      
      await syncAccountToSupabase(newPendampingAccount);
      const linkedPatient = updatedAccounts.find((a) => a.role === 'pasien' && a.rm?.toUpperCase() === cleanPairingCode);
      if (linkedPatient) { await syncAccountToSupabase(linkedPatient); }
      syncAllLocalAccountsToSupabase();

      setRegisterSuccess(
        `✓ Akun Pendamping berhasil dibuat! Data medis pasien ${cleanPairingCode} telah ditautkan dan disimpan.`
      );
      setLoginForm((prev) => ({ ...prev, email: email.trim().toLowerCase() }));

      setTimeout(() => {
        setIsRegisterMode(false);
        setPendampingRegisterForm({
          name: '',
          phone: '',
          email: '',
          password: '',
          pairingCode: '',
          patientBirthPlace: '',
          patientBirthDate: '',
          patientGender: 'Laki-laki',
          patientPhone: '',
          patientDiagnosis: '',
          patientAddress: '',
        });
        setRegisterSuccess('');
      }, 3500);
    }
  };

  // Submit Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setPairingError('');

    const savedAccounts = JSON.parse(
      localStorage.getItem('respicare-accounts') || '[]'
    );
    const demoEmail = 'sendyi0110@gmail.com';
    const demoPassword = 'password123';
    const inputEmail = loginForm.email.trim().toLowerCase();
    const inputPassword = loginForm.password;

    const isDemoUser = inputEmail === demoEmail && inputPassword === demoPassword;
    const registeredUser = savedAccounts.find(
      (a) =>
        (a.email || '').toLowerCase() === inputEmail &&
        a.password === inputPassword
    );

    if (!isDemoUser && !registeredUser) {
      setPairingError('Email atau kata sandi tidak cocok. Silakan periksa kembali.');
      return;
    }

    // Role enforcement: pastikan akun sesuai dengan tab login yang dipilih
    if (!isDemoUser && registeredUser) {
      if (loginRole === 'pasien' && registeredUser.role === 'pendamping') {
        setPairingError(
          'Akun ini terdaftar sebagai Pendamping Keluarga. Silakan beralih ke tab Pendamping di atas.'
        );
        return;
      }
      if (loginRole === 'pendamping' && registeredUser.role === 'pasien') {
        setPairingError(
          'Akun ini terdaftar sebagai Pasien. Silakan beralih ke tab Pasien di atas.'
        );
        return;
      }
    }

    // Login sebagai PENDAMPING KELUARGA
    if (loginRole === 'pendamping') {
      const code = pairingCode.trim().toUpperCase();
      if (!code) {
        setPairingError('Kode Pairing Pasien / No. Rekam Medis wajib diisi.');
        return;
      }

      const matchDemo =
        code === demoPatient.rm.toUpperCase() || code === demoPatient.pin;
      const pairedPatientFromStorage = savedAccounts.find(
        (a) =>
          a.role === 'pasien' &&
          (code === (a.rm || '').toUpperCase() || code === (a.pin || ''))
      );

      if (!matchDemo && !pairedPatientFromStorage) {
        setPairingError(
          `Kode "${pairingCode}" tidak ditemukan. Pastikan No. RM pasien sudah benar.`
        );
        return;
      }

      const resolvedPatient = matchDemo ? demoPatient : pairedPatientFromStorage;
      const pendampingUser = isDemoUser
        ? {
            name: 'Pendamping Keluarga Demo',
            email: demoEmail,
            role: 'pendamping',
            phone: '081234567890',
          }
        : registeredUser;

      onLoginSuccess({
        currentUser: pendampingUser,
        userRole: 'pendamping',
        profile: {
          ...resolvedPatient,
          emergencyContact: `${pendampingUser.name} (${pendampingUser.phone || '-'})`,
          guardianPhone: pendampingUser.phone || '-',
        },
      });
      return;
    }

    // Login sebagai PASIEN
    if (loginRole === 'pasien') {
      const patientUser = isDemoUser ? demoPatient : registeredUser;
      onLoginSuccess({
        currentUser: patientUser,
        userRole: 'pasien',
        profile: patientUser,
      });
    }
  };

  // Helper tokens
  const inputBg = isDark
    ? 'bg-[#051226]/80 border border-[#00acc1]/30 text-[#e0f7fa] placeholder:text-slate-500 focus:border-[#4dd0e1]'
    : 'bg-slate-50 border border-slate-300 text-[#051226] placeholder:text-slate-400 focus:border-[#1976d2] shadow-2xs';

  const btnPrimary = isDark
    ? 'bg-[#4dd0e1] hover:brightness-110 active:brightness-95 text-[#051226] font-bold shadow-md shadow-[#00acc1]/25'
    : 'bg-[#0d47a1] hover:bg-[#1976d2] active:bg-[#0d47a1] text-white font-bold shadow-md shadow-[#0d47a1]/20';

  return (
    <div
      className={`min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-x-hidden w-full ${
        isDark ? 'bg-[#051226] text-[#e0f7fa]' : 'bg-[#f0f9ff] text-[#051226]'
      } selection:bg-[#4dd0e1] selection:text-[#051226] font-sans antialiased`}
    >
      {/* ============================================================ */}
      {/* KOLOM KIRI (lg:col-span-7) — TAMPIL DI DESKTOP               */}
      {/* ============================================================ */}
      <div
        className="hidden lg:flex lg:col-span-7 flex-col justify-between p-8 xl:p-14 relative overflow-hidden lg:sticky lg:top-0 lg:h-screen"
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
            onClick={onBackToLanding}
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
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 backdrop-blur-sm ${
              isDark
                ? 'bg-[#00acc1]/15 border border-[#4dd0e1]/30 text-[#4dd0e1]'
                : 'bg-[#0d47a1]/10 border border-[#0d47a1]/20 text-[#0d47a1] font-bold'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isDark ? 'bg-[#4dd0e1]' : 'bg-[#0d47a1]'
              }`}
            />
            <span>Portal Terapi Mandiri Pasien</span>
          </div>
          <h1
            className={`text-4xl xl:text-5xl font-bold tracking-tight leading-tight font-serif ${
              isDark ? 'text-white' : 'text-[#051226]'
            }`}
          >
            Disiplin Terapi Harian untuk Napas yang Lebih Lega.
          </h1>
          <p
            className={`text-base xl:text-lg mt-4 leading-relaxed ${
              isDark ? 'text-slate-400 font-normal' : 'text-slate-600 font-medium'
            }`}
          >
            Pantau kepatuhan konsumsi obat pengendali dan pelega pernapasan Anda
            dengan verifikasi teknik pakai secara presisi.
          </p>

          <div
            className={`mt-8 flex items-center gap-6 text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-600 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Teknik Inhalasi MDI Tervalidasi</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                className={`w-4 h-4 ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`}
              />
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
              <span
                className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                <Clock
                  className={`w-3.5 h-3.5 ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`}
                />
                Pengingat Terdekat
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  isDark
                    ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/30'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
                Terkendali ✓
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                  isDark
                    ? 'bg-blue-500/20 text-[#4dd0e1] border border-[#4dd0e1]/30'
                    : 'bg-blue-100 text-[#0d47a1] border border-blue-200'
                }`}
              >
                <Wind className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="overflow-hidden">
                <h4
                  className={`text-sm font-bold truncate ${
                    isDark ? 'text-white' : 'text-[#051226]'
                  }`}
                >
                  Inhaler Budesonide (Controller)
                </h4>
                <p
                  className={`text-xs ${
                    isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                  }`}
                >
                  07:00 WIB • Dosis Pagi (2 Semprotan)
                </p>
              </div>
            </div>

            <div
              className={`pt-2 border-t flex items-center justify-between text-[11px] ${
                isDark
                  ? 'border-white/8 text-slate-400'
                  : 'border-slate-200 text-slate-600 font-medium'
              }`}
            >
              <span>
                Evaluasi Mingguan:{' '}
                <strong className={isDark ? 'text-white' : 'text-[#051226] font-bold'}>
                  90.5% Patuh
                </strong>
              </span>
              <span className={`font-semibold ${isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'}`}>
                RespiCare Sync
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* KOLOM KANAN (lg:col-span-5) — PANEL FORMULIR                */}
      {/* ============================================================ */}
      <div
        className={`lg:col-span-5 backdrop-blur-xl lg:border-l flex flex-col justify-start pt-10 lg:pt-14 px-6 sm:px-12 py-10 relative min-h-screen lg:min-h-0 overflow-y-auto ${
          isDark
            ? 'bg-[#081b3a]/70 lg:border-[#00acc1]/20'
            : 'bg-white lg:border-slate-200 shadow-sm'
        }`}
      >
        {/* Header Bar Mobile */}
        <div className="lg:hidden mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLanding}
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
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-[#051226]" />
            )}
          </button>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-6">
          {/* ======================================================== */}
          {/* MODE: REGISTER FORM                                       */}
          {/* ======================================================== */}
          {isRegisterMode ? (
            <div className="space-y-5 animate-fade-in">
              {/* Header Register */}
              <div>
                <div className="mb-3">
                  <RespiCareLogo isDark={isDark} />
                </div>
                <h2
                  className={`text-2xl font-bold tracking-tight ${
                    isDark ? 'text-white' : 'text-[#051226]'
                  }`}
                >
                  Buat Akun Baru
                </h2>
                <p
                  className={`text-sm mt-1 leading-snug ${
                    isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                  }`}
                >
                  {registerRole === 'pasien'
                    ? 'Pendaftaran Pasien Mandiri (Mudah & Cepat)'
                    : 'Pendaftaran Pendamping Keluarga & Data Pasien'}
                </p>
              </div>

              {/* Segmented Role Switcher Register */}
              <div
                className={`p-1 rounded-full border grid grid-cols-2 ${
                  isDark
                    ? 'bg-[#051226] border-[#00acc1]/25'
                    : 'bg-slate-100 border border-slate-300'
                }`}
              >
                {['pasien', 'pendamping'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRegisterRole(r);
                      setRegisterError('');
                    }}
                    className={`py-2 text-xs sm:text-sm font-bold rounded-full transition-all duration-200 text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                      registerRole === r
                        ? isDark
                          ? 'bg-[#4dd0e1] text-[#051226] shadow-md shadow-[#00acc1]/25'
                          : 'bg-[#0d47a1] text-white shadow-sm'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-[#051226] font-semibold'
                    }`}
                  >
                    {r === 'pasien' ? (
                      <User className="w-3.5 h-3.5" />
                    ) : (
                      <Users className="w-3.5 h-3.5" />
                    )}
                    <span className="capitalize">
                      {r === 'pendamping' ? 'Pendamping' : 'Pasien'}
                    </span>
                  </button>
                ))}
              </div>

              {/* ==================================================== */}
              {/* ALUR 1: DAFTAR PASIEN (SUPER SIMPEL — HANYA 4 KOLOM) */}
              {/* ==================================================== */}
              {registerRole === 'pasien' ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label
                      className={`block text-xs uppercase tracking-wider mb-1.5 ${
                        isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                      }`}
                    >
                      Nama Lengkap Pasien <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={pasienRegisterForm.name}
                      onChange={(e) =>
                        setPasienRegisterForm({
                          ...pasienRegisterForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Nama lengkap Anda"
                      className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs uppercase tracking-wider mb-1.5 ${
                        isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                      }`}
                    >
                      Email <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={pasienRegisterForm.email}
                      onChange={(e) =>
                        setPasienRegisterForm({
                          ...pasienRegisterForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="nama@email.com"
                      className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs uppercase tracking-wider mb-1.5 ${
                        isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                      }`}
                    >
                      Kata Sandi <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={pasienRegisterForm.password}
                      onChange={(e) =>
                        setPasienRegisterForm({
                          ...pasienRegisterForm,
                          password: e.target.value,
                        })
                      }
                      placeholder="Min. 6 karakter"
                      className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${inputBg}`}
                    />
                  </div>

                  {/* KOLOM KODE PASIEN (NO. RM) OTOMATIS + TOMBOL SALIN */}
                  <div
                    className={`p-3.5 rounded-2xl border space-y-2 ${
                      isDark
                        ? 'bg-[#00acc1]/10 border-[#00acc1]/30'
                        : 'bg-blue-50/80 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label
                        className={`block text-xs uppercase tracking-wider font-bold ${
                          isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                        }`}
                      >
                        Kode Pasien (No. RM Otomatis)
                      </label>
                      <button
                        type="button"
                        onClick={handleCopyGeneratedRm}
                        className={`text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                          copiedRmPrompt
                            ? 'text-emerald-500'
                            : isDark
                            ? 'text-[#4dd0e1] hover:underline'
                            : 'text-[#0d47a1] hover:underline'
                        }`}
                      >
                        {copiedRmPrompt ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Kode</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={generatedRm}
                        className={`w-full rounded-xl px-4 py-2.5 text-base font-mono font-bold tracking-wider cursor-default ${
                          isDark
                            ? 'bg-[#051226] border border-[#00acc1]/40 text-[#4dd0e1]'
                            : 'bg-white border border-blue-300 text-[#0d47a1]'
                        }`}
                      />
                    </div>
                    <p
                      className={`text-[11px] leading-snug ${
                        isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                      }`}
                    >
                      💡 Simpan dan berikan kode ini kepada Pendamping Keluarga Anda agar mereka
                      dapat menghubungkan akun dan mengatur jadwal obat Anda.
                    </p>
                  </div>

                  {/* Error & Success Notification */}
                  {registerError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{registerError}</span>
                    </div>
                  )}
                  {registerSuccess && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{registerSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`w-full font-bold text-base py-3.5 rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer mt-2 ${btnPrimary}`}
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>Daftar sebagai Pasien</span>
                  </button>
                </form>
              ) : (
                /* ==================================================== */
                /* ALUR 2: DAFTAR PENDAMPING KELUARGA (LENGKAP + MEDIS) */
                /* ==================================================== */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="space-y-3">
                    <p
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                      }`}
                    >
                      1. Data Diri Pendamping Keluarga
                    </p>

                    <div>
                      <label
                        className={`block text-xs uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                        }`}
                      >
                        Nama Lengkap Pendamping <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={pendampingRegisterForm.name}
                        onChange={(e) =>
                          setPendampingRegisterForm({
                            ...pendampingRegisterForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Nama Anda (Keluarga/Pendamping)"
                        className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-xs uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                        }`}
                      >
                        No. Telepon / WhatsApp Pendamping <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={pendampingRegisterForm.phone}
                        onChange={(e) =>
                          setPendampingRegisterForm({
                            ...pendampingRegisterForm,
                            phone: e.target.value,
                          })
                        }
                        placeholder="08xxxxxxxxxx (untuk tombol bantuan pasien)"
                        className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-xs uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                        }`}
                      >
                        Email Pendamping <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={pendampingRegisterForm.email}
                        onChange={(e) =>
                          setPendampingRegisterForm({
                            ...pendampingRegisterForm,
                            email: e.target.value,
                          })
                        }
                        placeholder="pendamping@email.com"
                        className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-xs uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                        }`}
                      >
                        Kata Sandi <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={pendampingRegisterForm.password}
                        onChange={(e) =>
                          setPendampingRegisterForm({
                            ...pendampingRegisterForm,
                            password: e.target.value,
                          })
                        }
                        placeholder="Min. 6 karakter"
                        className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${inputBg}`}
                      />
                    </div>
                  </div>

                  {/* KODE PAIRING PASIEN */}
                  <div
                    className={`p-3.5 rounded-2xl border space-y-2 ${
                      isDark
                        ? 'bg-[#00acc1]/10 border-[#00acc1]/30'
                        : 'bg-blue-50/80 border-blue-200'
                    }`}
                  >
                    <label
                      className={`block text-xs uppercase tracking-wider font-bold ${
                        isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                      }`}
                    >
                      2. Kode Pairing Pasien (No. RM) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={pendampingRegisterForm.pairingCode}
                      onChange={(e) =>
                        setPendampingRegisterForm({
                          ...pendampingRegisterForm,
                          pairingCode: e.target.value,
                        })
                      }
                      placeholder="Contoh: RM-2026-040"
                      className={`w-full rounded-xl px-4 py-3 text-sm font-mono uppercase tracking-wider focus:outline-none transition-all ${inputBg}`}
                    />
                    <p
                      className={`text-[11px] leading-tight ${
                        isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                      }`}
                    >
                      Masukkan No. RM pasien yang ingin Anda pantau.
                    </p>
                  </div>

                  {/* DATA MEDIS PASIEN YANG DIDAMPINGI */}
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isDark
                        ? 'bg-white/5 border-white/10'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <p
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                      }`}
                    >
                      3. Data Medis Pasien yang Didampingi
                    </p>

                    <div>
                      <label
                        className={`block text-xs uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                        }`}
                      >
                        Tempat Lahir Pasien
                      </label>
                      <input
                        type="text"
                        value={pendampingRegisterForm.patientBirthPlace}
                        onChange={(e) =>
                          setPendampingRegisterForm({
                            ...pendampingRegisterForm,
                            patientBirthPlace: e.target.value,
                          })
                        }
                        placeholder="Kota / Kabupaten lahir pasien"
                        className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-xs uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                        }`}
                      >
                        Tanggal Lahir Pasien
                      </label>
                      <input
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={pendampingRegisterForm.patientBirthDate}
                        onChange={(e) =>
                          setPendampingRegisterForm({
                            ...pendampingRegisterForm,
                            patientBirthDate: e.target.value,
                          })
                        }
                        className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${inputBg}`}
                      />
                      {pendampingRegisterForm.patientBirthDate && (
                        <p
                          className={`text-[11px] mt-1 font-semibold ${
                            isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                          }`}
                        >
                          Usia Pasien:{' '}
                          {calculateAge(pendampingRegisterForm.patientBirthDate)} tahun
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-xs uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                        }`}
                      >
                        Jenis Kelamin Pasien
                      </label>
                      <select
                        value={pendampingRegisterForm.patientGender}
                        onChange={(e) =>
                          setPendampingRegisterForm({
                            ...pendampingRegisterForm,
                            patientGender: e.target.value,
                          })
                        }
                        className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${inputBg}`}
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label
                        className={`block text-xs uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                        }`}
                      >
                        Nomor Telepon Pasien (Opsional)
                      </label>
                      <input
                        type="tel"
                        value={pendampingRegisterForm.patientPhone}
                        onChange={(e) =>
                          setPendampingRegisterForm({
                            ...pendampingRegisterForm,
                            patientPhone: e.target.value,
                          })
                        }
                        placeholder="Nomor HP pasien untuk panggilan"
                        className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${inputBg}`}
                      />
                    </div>

                    {/* INPUT TEKS BEBAS UNTUK DIAGNOSIS / PENYAKIT */}
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
                        value={pendampingRegisterForm.patientDiagnosis}
                        onChange={(e) =>
                          setPendampingRegisterForm({
                            ...pendampingRegisterForm,
                            patientDiagnosis: e.target.value,
                          })
                        }
                        placeholder="Ketik diagnosis spesifik (contoh: Asma Bronkial persisten)"
                        className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-xs uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                        }`}
                      >
                        Alamat Pasien
                      </label>
                      <textarea
                        rows={2}
                        value={pendampingRegisterForm.patientAddress}
                        onChange={(e) =>
                          setPendampingRegisterForm({
                            ...pendampingRegisterForm,
                            patientAddress: e.target.value,
                          })
                        }
                        placeholder="Alamat tinggal pasien"
                        className={`w-full rounded-xl px-4 py-2 text-sm focus:outline-none transition-all resize-none ${inputBg}`}
                      />
                    </div>
                  </div>

                  {/* Error & Success Notification */}
                  {registerError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{registerError}</span>
                    </div>
                  )}
                  {registerSuccess && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{registerSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`w-full font-bold text-base py-3.5 rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer mt-2 ${btnPrimary}`}
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>Daftar sebagai Pendamping</span>
                  </button>
                </form>
              )}

              {/* Balik ke Login */}
              <div
                className={`text-center text-xs sm:text-sm ${
                  isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                }`}
              >
                <span>Sudah punya akun? </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setRegisterError('');
                    setRegisterSuccess('');
                  }}
                  className={`font-bold underline hover:brightness-125 cursor-pointer ${
                    isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                  }`}
                >
                  Masuk
                </button>
              </div>

              {/* Demo Login shortcut */}
              <div
                className={`pt-2 border-t ${
                  isDark ? 'border-white/10' : 'border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <p
                    className={`text-[11px] text-center font-semibold ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Akses Cepat Akun Demo (Pilih Peran):
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => onDemoLogin('pasien')}
                      className={`py-2.5 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isDark
                          ? 'bg-[#4dd0e1]/10 border-[#4dd0e1]/30 text-[#4dd0e1] hover:bg-[#4dd0e1]/20'
                          : 'bg-blue-50 border-blue-200 text-[#0d47a1] hover:bg-blue-100'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 shrink-0" />
                      <span>Demo Pasien</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDemoLogin('pendamping')}
                      className={`py-2.5 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isDark
                          ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/20'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>Demo Pendamping</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* MODE: LOGIN FORM                                         */
            /* ======================================================== */
            <div className="space-y-6 animate-fade-in">
              {/* Header Form */}
              <div>
                <div className="mb-3">
                  <RespiCareLogo isDark={isDark} />
                </div>
                <h2
                  className={`text-2xl font-bold tracking-tight ${
                    isDark ? 'text-white' : 'text-[#051226]'
                  }`}
                >
                  Selamat Datang Kembali
                </h2>
                <p
                  className={`text-sm mt-1 leading-snug ${
                    isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                  }`}
                >
                  Masuk untuk memantau jadwal obat &amp; terapi pernapasan
                </p>
              </div>

              {/* Segmented Role Switcher: Pasien / Pendamping */}
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
                  <label
                    className={`block text-xs uppercase tracking-wider mb-2 ${
                      isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                    }`}
                  >
                    Email Akun
                  </label>
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    placeholder="nama@email.com"
                    className={`w-full rounded-xl px-4 py-3.5 text-base focus:outline-none transition-all ${inputBg}`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs uppercase tracking-wider mb-2 ${
                      isDark ? 'text-slate-400 font-semibold' : 'text-slate-600 font-semibold'
                    }`}
                  >
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
                        isDark
                          ? 'text-slate-400 hover:text-slate-200'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* KHUSUS PENDAMPING: INPUT KODE PAIRING PASIEN (NO. RM) */}
                {loginRole === 'pendamping' && (
                  <div
                    className={`p-4 rounded-2xl border space-y-2.5 transition-all animate-fade-in ${
                      isDark
                        ? 'bg-[#00acc1]/5 border-[#00acc1]/30'
                        : 'bg-blue-50/80 border-blue-200'
                    }`}
                  >
                    <label
                      className={`block text-xs uppercase tracking-wider font-bold ${
                        isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                      }`}
                    >
                      Kode Pairing Pasien / No. Rekam Medis{' '}
                      <span className="text-red-500 font-bold">*</span>
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={pairingCode}
                        onChange={(e) => {
                          setPairingCode(e.target.value);
                          if (pairingError) setPairingError('');
                        }}
                        placeholder="Contoh: RM-2026-040"
                        className={`w-full rounded-xl px-4 py-3.5 text-base font-mono uppercase tracking-wider focus:outline-none transition-all ${inputBg}`}
                      />
                    </div>

                    <p
                      className={`text-[11px] leading-tight ${
                        isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                      }`}
                    >
                      Wajib diisi untuk menghubungkan sesi ke rekam medis dan pantauan terapi pasien.
                    </p>
                  </div>
                )}

                {/* Error Box */}
                {pairingError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{pairingError}</span>
                  </div>
                )}

                {/* Baris opsi: Checkbox Ingat Sesi & Lupa Kata Sandi */}
                <div className="flex items-center justify-between text-sm pt-1">
                  <label
                    className={`flex items-center gap-2 cursor-pointer ${
                      isDark
                        ? 'text-slate-400 hover:text-slate-300'
                        : 'text-slate-700 hover:text-[#051226] font-medium'
                    }`}
                  >
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

                {/* Tombol Masuk */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className={`w-full font-bold text-base py-4 rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${btnPrimary}`}
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
              <div
                className={`pt-2 text-center text-xs sm:text-sm ${
                  isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                }`}
              >
                <span>Belum memiliki akun terapi? </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setRegisterError('');
                    setRegisterSuccess('');
                  }}
                  className={`font-bold underline hover:brightness-125 cursor-pointer ${
                    isDark ? 'text-[#4dd0e1]' : 'text-[#0d47a1]'
                  }`}
                >
                  Daftar sekarang
                </button>
              </div>

              {/* Tombol Akun Demo */}
              <div
                className={`pt-2 border-t ${
                  isDark ? 'border-white/10' : 'border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <p
                    className={`text-[11px] text-center font-semibold ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Akses Cepat Akun Demo (Pilih Peran):
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => onDemoLogin('pasien')}
                      className={`py-2.5 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isDark
                          ? 'bg-[#4dd0e1]/10 border-[#4dd0e1]/30 text-[#4dd0e1] hover:bg-[#4dd0e1]/20'
                          : 'bg-blue-50 border-blue-200 text-[#0d47a1] hover:bg-blue-100'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 shrink-0" />
                      <span>Demo Pasien</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDemoLogin('pendamping')}
                      className={`py-2.5 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isDark
                          ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/20'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>Demo Pendamping</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    
      <TrialAccountManager />
    </div>
  );
}
