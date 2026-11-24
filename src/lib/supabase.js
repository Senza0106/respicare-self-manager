import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://virpgbodcvhwpztamcra.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_4YrA3YOdTPXzxUPwYooVfA_O7sMh4UP';

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function syncAccountToSupabase(account) {
  if (!supabase || !account) return false;
  try {
    const payload = {
      role: account.role || 'pasien',
      name: account.name || '-',
      email: (account.email || '').toLowerCase() || null,
      phone: account.phone || account.guardianPhone || null,
      rm: account.rm || account.pairingCode || null,
      pairing_code: account.pairingCode || account.rm || null,
      condition: account.condition || null,
      age: account.age || null,
      gender: account.gender || null,
      address: account.address || null,
      emergency_contact: account.emergencyContact || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('respicare_accounts').insert([payload]);
    if (error) {
      console.error('Supabase insert account error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase syncAccount exception:', err);
    return false;
  }
}

export async function syncAllLocalAccountsToSupabase() {
  if (!supabase) return;
  try {
    const savedAccounts = JSON.parse(localStorage.getItem('respicare-accounts') || '[]');
    if (!Array.isArray(savedAccounts) || savedAccounts.length === 0) return;

    const syncedKeys = new Set(
      JSON.parse(localStorage.getItem('respicare-supabase-synced-v3') || '[]')
    );

    let hasNew = false;
    for (const acc of savedAccounts) {
      const uniqueKey = `${acc.role || 'pasien'}:${(acc.email || '').toLowerCase()}:${(acc.rm || acc.pairingCode || '').toUpperCase()}:${acc.name || ''}`;
      if (!syncedKeys.has(uniqueKey)) {
        const ok = await syncAccountToSupabase(acc);
        if (ok) {
          syncedKeys.add(uniqueKey);
          hasNew = true;
        }
      }
    }

    if (hasNew) {
      localStorage.setItem(
        'respicare-supabase-synced-v3',
        JSON.stringify(Array.from(syncedKeys))
      );
    }
  } catch (err) {
    console.error('Supabase syncAllLocalAccounts error:', err);
  }
}

export async function fetchSupabaseAccounts() {
  if (!supabase) return { data: [], error: 'Supabase belum terkonfigurasi' };
  try {
    const { data, error } = await supabase
      .from('respicare_accounts')
      .select('*')
      .order('id', { ascending: false });
    if (error) return { data: [], error: error.message };
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err?.message || 'Gagal memuat data Supabase' };
  }
}

export async function deleteAccountEverywhere({ id, email, rm }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanRm = (rm || '').trim().toUpperCase();
  let supabaseError = null;

  // 1. Hapus dari Supabase (berdasarkan ID dan/atau Email agar duplikat ikut bersih)
  if (supabase) {
    try {
      if (id) {
        const { error } = await supabase
          .from('respicare_accounts')
          .delete()
          .eq('id', id);
        if (error) supabaseError = error.message;
      }
      if (cleanEmail) {
        const { error } = await supabase
          .from('respicare_accounts')
          .delete()
          .ilike('email', cleanEmail);
        if (error && !supabaseError) supabaseError = error.message;
      }
    } catch (err) {
      supabaseError = err?.message || 'Gagal menghapus di Supabase';
    }
  }

  // 2. Hapus dari localStorage agar email bisa langsung dipakai daftar ulang
  try {
    const localAccounts = JSON.parse(localStorage.getItem('respicare-accounts') || '[]');
    if (Array.isArray(localAccounts)) {
      const filtered = localAccounts.filter((acc) => {
        const accEmail = (acc.email || '').trim().toLowerCase();
        const accRm = (acc.rm || acc.pairingCode || '').trim().toUpperCase();
        if (cleanEmail && accEmail === cleanEmail) return false;
        if (!cleanEmail && cleanRm && accRm === cleanRm) return false;
        return true;
      });
      localStorage.setItem('respicare-accounts', JSON.stringify(filtered));
    }

    // Bersihkan penanda sinkronisasi untuk email/RM tersebut
    ['respicare-supabase-synced-v3', 'respicare-supabase-synced-v2', 'respicare-supabase-synced-keys'].forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          const nextArr = arr.filter(
            (item) =>
              (!cleanEmail || !item.toLowerCase().includes(cleanEmail)) &&
              (!cleanRm || !item.toUpperCase().includes(cleanRm))
          );
          localStorage.setItem(key, JSON.stringify(nextArr));
        }
      }
    });
  } catch (err) {
    console.warn('Gagal membersihkan localStorage:', err);
  }

  return { ok: !supabaseError, error: supabaseError };
}

export async function resetAllTrialAccounts() {
  let supabaseError = null;
  if (supabase) {
    try {
      const { error } = await supabase
        .from('respicare_accounts')
        .delete()
        .neq('id', 0);
      if (error) supabaseError = error.message;
    } catch (err) {
      supabaseError = err?.message || 'Gagal mengosongkan tabel Supabase';
    }
  }

  localStorage.removeItem('respicare-accounts');
  localStorage.removeItem('respicare-supabase-synced-v3');
  localStorage.removeItem('respicare-supabase-synced-v2');
  localStorage.removeItem('respicare-supabase-synced-keys');

  return { ok: !supabaseError, error: supabaseError };
}

export async function logLoginToSupabase({ user, role, patientProfile, isDemo }) {
  if (!supabase) return false;
  try {
    const isPendamping = role === 'pendamping';
    const payload = {
      role: role || 'pasien',
      name: isPendamping
        ? user?.name || 'Pendamping'
        : user?.name || patientProfile?.name || '-',
      email: (
        (isPendamping ? user?.email : user?.email || patientProfile?.email) || ''
      ).toLowerCase() || null,
      phone: isPendamping
        ? user?.phone || patientProfile?.guardianPhone || null
        : user?.phone || patientProfile?.phone || null,
      rm: patientProfile?.rm || user?.pairingCode || user?.rm || null,
      patient_name: patientProfile?.name || '-',
      condition: patientProfile?.condition || null,
      is_demo: Boolean(isDemo),
      logged_in_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('respicare_login_logs').insert([payload]);
    if (error) {
      console.error('Supabase insert login log error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase logLogin exception:', err);
    return false;
  }
}

export async function syncSchedulesToSupabase(rm, schedules) {
  if (!supabase || !rm || !Array.isArray(schedules)) return;
  try {
    await supabase.from('respicare_schedules').upsert(
      {
        rm,
        schedules_json: schedules,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'rm' }
    );
  } catch (err) {
    console.error('Supabase syncSchedules error:', err);
  }
}