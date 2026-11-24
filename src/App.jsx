import { logLoginToSupabase, syncAccountToSupabase, syncAllLocalAccountsToSupabase, syncSchedulesToSupabase } from './lib/supabase';
import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Login, { RespiCareLogo } from './Login';
import Dashboard from './Dashboard';

// Re-export RespiCareLogo
export { RespiCareLogo };

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
    const notes = [659.25, 830.61, 987.77, 1318.51];

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

// ==========================================================
// DEMO DATA (HANYA DIGUNAKAN UNTUK AKUN DEMO)
// ==========================================================
const DEMO_PATIENT = {
  name: 'Sendy Nevertheless',
  rm: 'RM-2026-040',
  email: 'sendyi0110@gmail.com',
  phone: '085832713744',
  address: 'Dusun Dawung Desa Bedug Kec. Ngadiluwih',
  birthPlace: 'Kediri',
  birthDate: '2008-09-01',
  age: '18 tahun',
  gender: 'Laki-laki',
  condition: 'Asma Bronkial & PPOK Derajat 2',
  targetBp: '- mmHg',
  emergencyContact: 'Siti Rahayu (0812-3456-7890)',
  guardianPhone: '081234567890',
  pin: '8492',
  role: 'pasien',
};

const DEMO_GUARDIAN = {
  name: 'Siti Rahayu (Pendamping Demo)',
  email: 'pendamping.demo@respicare.id',
  phone: '081234567890',
  role: 'pendamping',
  pairingCode: 'RM-2026-040',
};

const recordLoginAudit = ({ user, role, patientProfile, isDemoAccount }) => {
  try {
    const logs = JSON.parse(localStorage.getItem('respicare-login-logs') || '[]');
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      loggedInAt: new Date().toISOString(),
      role,
      name: user?.name || patientProfile?.name || '-',
      email: user?.email || patientProfile?.email || '-',
      phone: user?.phone || patientProfile?.phone || patientProfile?.guardianPhone || '-',
      rm: patientProfile?.rm || user?.pairingCode || '-',
      patientName: patientProfile?.name || '-',
      condition: patientProfile?.condition || '-',
      isDemo: Boolean(isDemoAccount),
    };
    const updated = [entry, ...logs].slice(0, 100);
    localStorage.setItem('respicare-login-logs', JSON.stringify(updated));
  } catch (e) {
    console.warn('Gagal mencatat audit login:', e);
  }
};

const DEMO_SCHEDULES = [
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
];

// Helper memuat jadwal berdasarkan RM pasien
const loadSchedulesForRm = (rm, isDemoUser) => {
  if (isDemoUser || rm === 'RM-2026-040') {
    return DEMO_SCHEDULES;
  }
  if (!rm) return [];
  try {
    const raw = localStorage.getItem(`respicare-schedules-${rm}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export default function App() {
  React.useEffect(() => { syncAllLocalAccountsToSupabase(); }, []);
  // Routing: 'landing' | 'login' | 'dashboard' (default landing)
  const [currentView, setCurrentView] = useState('landing');

  // Mode Tema Global
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('respicare-theme') || 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    localStorage.setItem('respicare-theme', theme);
  }, [theme]);

  // Sesi Pengguna
  const [userRole, setUserRole] = useState('pasien');
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    rm: '',
    email: '',
    phone: '',
    address: '',
    birthPlace: '',
    birthDate: '',
    age: '',
    gender: '',
    condition: '',
    targetBp: '- mmHg',
    emergencyContact: '',
    guardianPhone: '',
    pin: '',
  });

  // State Jadwal Obat (KOSONG [] secara default untuk akun baru)
  const [schedules, setSchedules] = useState([]);
  const [isDemo, setIsDemo] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handler Login Berhasil
  const handleLoginSuccess = ({ currentUser: user, userRole: role, profile: patientProfile }) => {
    setCurrentUser(user);
    setUserRole(role);
    setProfile(patientProfile);

    const isDemoAccount =
      user.email === 'sendyi0110@gmail.com' || patientProfile.rm === 'RM-2026-040';
    setIsDemo(isDemoAccount);

    const loadedSchedules = loadSchedulesForRm(patientProfile.rm, isDemoAccount);
    setSchedules(loadedSchedules);
    logLoginToSupabase({ user, role, patientProfile, isDemo: isDemoAccount });
    syncAllLocalAccountsToSupabase();
    if (role === 'pendamping' && user) {
      syncAccountToSupabase({ ...user, role: 'pendamping', pairingCode: patientProfile?.rm || user.pairingCode });
    } else if (patientProfile) {
      syncAccountToSupabase({ ...(user || {}), ...patientProfile, role: 'pasien' });
    }
    syncSchedulesToSupabase(patientProfile?.rm, loadedSchedules);
    recordLoginAudit({ user, role, patientProfile, isDemoAccount });

    setCurrentView('dashboard');
    setToastMessage(
      `Selamat Datang, ${role === 'pasien' ? patientProfile.name : user.name}! 👋`
    );
  };

  // Handler Login Akun Demo (2 Role: Pasien & Pendamping)
  const handleDemoLogin = (role = 'pasien') => {
    if (role === 'pendamping') {
      setCurrentUser(DEMO_GUARDIAN);
      setUserRole('pendamping');
      setProfile(DEMO_PATIENT);
      setIsDemo(true);
      setSchedules(DEMO_SCHEDULES);
      logLoginToSupabase({
        user: DEMO_GUARDIAN,
        role: 'pendamping',
        patientProfile: DEMO_PATIENT,
        isDemo: true,
      });
      syncAccountToSupabase(DEMO_GUARDIAN);
      syncSchedulesToSupabase(DEMO_PATIENT.rm, DEMO_SCHEDULES);
      setCurrentView('dashboard');
      setToastMessage(`Selamat Datang (Demo Pendamping), ${DEMO_GUARDIAN.name}!`);
      return;
    }

    setCurrentUser(DEMO_PATIENT);
    setUserRole('pasien');
    setProfile(DEMO_PATIENT);
    setIsDemo(true);
    setSchedules(DEMO_SCHEDULES);
    logLoginToSupabase({
      user: DEMO_PATIENT,
      role: 'pasien',
      patientProfile: DEMO_PATIENT,
      isDemo: true,
    });
    syncAccountToSupabase(DEMO_PATIENT);
    syncSchedulesToSupabase(DEMO_PATIENT.rm, DEMO_SCHEDULES);
    setCurrentView('dashboard');
    setToastMessage(`Selamat Datang (Demo Pasien), ${DEMO_PATIENT.name}!`);
  };

  // Handler Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole('pasien');
    setProfile({
      name: '',
      rm: '',
      email: '',
      phone: '',
      address: '',
      birthPlace: '',
      birthDate: '',
      age: '',
      gender: '',
      condition: '',
      targetBp: '- mmHg',
      emergencyContact: '',
      guardianPhone: '',
      pin: '',
    });
    setSchedules([]);
    setIsDemo(false);
    setCurrentView('landing');
    setToastMessage('Anda telah berhasil keluar dari sesi.');
  };

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
  // VIEW 2: HALAMAN LOGIN / REGISTER
  // ==========================================================
  if (currentView === 'login') {
    return (
      <Login
        theme={theme}
        toggleTheme={toggleTheme}
        onBackToLanding={() => setCurrentView('landing')}
        onLoginSuccess={handleLoginSuccess}
        onDemoLogin={handleDemoLogin}
        demoPatient={DEMO_PATIENT}
      />
    );
  }

  // ==========================================================
  // VIEW 3: DASHBOARD LENGKAP
  // ==========================================================
  return (
    <Dashboard
      theme={theme}
      toggleTheme={toggleTheme}
      userRole={userRole}
      currentUser={currentUser}
      profile={profile}
      setProfile={setProfile}
      schedules={schedules}
      setSchedules={setSchedules}
      isDemo={isDemo}
      onLogout={handleLogout}
      toastMessage={toastMessage}
      setToastMessage={setToastMessage}
      playGentleChime={playGentleChime}
    />
  );
}
