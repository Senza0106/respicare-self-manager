import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://virpgbodcvhwpztamcra.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_4YrA3YOdTPXzxUPwYooVfA_O7sMh4UP';

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const inFlightSyncKeys = new Set();

export async function syncAccountToSupabase(account) {
  if (!supabase || !account) return false;

  const role = account.role || 'pasien';
  const cleanEmail = (account.email || '').trim().toLowerCase();
  const cleanRm = (account.rm || account.pairingCode || '').trim().toUpperCase();
  const lockKey = `${role}:${cleanEmail}:${cleanRm}:${account.name || ''}`;

  if (inFlightSyncKeys.has(lockKey)) return true;
  inFlightSyncKeys.add(lockKey);

  try {
    const payload = {
      role,
      name: account.name || '-',
      email: cleanEmail || null,
      phone: account.phone || account.guardianPhone || null,
      rm: cleanRm || null,
      pairing_code: (account.pairingCode || account.rm || '').trim().toUpperCase() || null,
      condition: account.condition || null,
      age: account.age || null,
      gender: account.gender || null,
      address: account.address || null,
      emergency_contact: account.emergencyContact || null,
      updated_at: new Date().toISOString(),
    };

    // Simpan password jika tersedia agar tidak menimpa password lama dengan null
    if (account.password && String(account.password).trim() !== '') {
      payload.password = String(account.password).trim();
    }

    let existingRows = [];
    if (cleanEmail) {
      const { data } = await supabase
        .from('respicare_accounts')
        .select('id, password')
        .eq('role', role)
        .ilike('email', cleanEmail)
        .order('id', { ascending: true });
      if (Array.isArray(data)) existingRows = data;
    } else if (cleanRm) {
      const { data } = await supabase
        .from('respicare_accounts')
        .select('id, password')
        .eq('role', role)
        .eq('rm', cleanRm)
        .order('id', { ascending: true });
      if (Array.isArray(data)) existingRows = data;
    }

    if (existingRows.length > 0) {
      const keepId = existingRows[0].id;
      if (!payload.password && existingRows[0].password) {
        payload.password = existingRows[0].password;
      }
      const { error } = await supabase
        .from('respicare_accounts')
        .update(payload)
        .eq('id', keepId);

      if (existingRows.length > 1) {
        const extraIds = existingRows.slice(1).map((r) => r.id);
        await supabase.from('respicare_accounts').delete().in('id', extraIds);
      }

      if (error) {
        console.error('Supabase update account error:', error.message);
        return false;
      }
      return true;
    }

    const { error } = await supabase.from('respicare_accounts').insert([payload]);
    if (error) {
      console.error('Supabase insert account error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase syncAccount exception:', err);
    return false;
  } finally {
    setTimeout(() => inFlightSyncKeys.delete(lockKey), 1500);
  }
}

export async function authenticateWithSupabase({ email, password, role }) {
  if (!supabase) return { ok: false, reason: 'not_configured' };
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();
  if (!cleanEmail || !cleanPassword) return { ok: false, reason: 'empty' };

  try {
    const { data, error } = await supabase
      .from('respicare_accounts')
      .select('*')
      .ilike('email', cleanEmail);

    if (error || !Array.isArray(data) || data.length === 0) {
      return { ok: false, reason: 'not_found' };
    }

    // 1. Cek kecocokan role + password (atau jika password di Supabase masih NULL pada akun lama, otomatis simpan password baru)
    const exactMatch = data.find((row) => {
      const sameRole = (row.role || 'pasien') === role;
      const dbPass = String(row.password || '').trim();
      return sameRole && (dbPass === cleanPassword || dbPass === '');
    });

    if (exactMatch) {
      // Jika kolom password di Supabase sebelumnya kosong (NULL), simpan password ini secara permanen
      if (!exactMatch.password || String(exactMatch.password).trim() === '') {
        await supabase
          .from('respicare_accounts')
          .update({ password: cleanPassword, updated_at: new Date().toISOString() })
          .eq('id', exactMatch.id);
      }

      return {
        ok: true,
        account: {
          role: exactMatch.role || role,
          name: exactMatch.name || '-',
          email: exactMatch.email || cleanEmail,
          password: cleanPassword,
          phone: exactMatch.phone || '',
          guardianPhone: exactMatch.role === 'pendamping' ? exactMatch.phone || '' : '',
          rm: exactMatch.rm || exactMatch.pairing_code || '',
          pairingCode: exactMatch.pairing_code || exactMatch.rm || '',
          condition: exactMatch.condition || 'Asma Bronkial',
          age: exactMatch.age || '18',
          gender: exactMatch.gender || 'Laki-laki',
          address: exactMatch.address || 'Kediri, Jawa Timur',
          emergencyContact: exactMatch.emergency_contact || '',
        },
      };
    }

    // 2. Cek apakah email cocok tetapi terdaftar di peran berbeda
    const otherRoleMatch = data.find((row) => {
      const dbPass = String(row.password || '').trim();
      return dbPass === cleanPassword || dbPass === '';
    });
    if (otherRoleMatch) {
      return {
        ok: false,
        reason: 'wrong_role',
        actualRole: otherRoleMatch.role || 'pasien',
      };
    }

    return { ok: false, reason: 'wrong_password' };
  } catch (err) {
    console.error('Supabase auth exception:', err);
    return { ok: false, reason: 'error' };
  }
}

export async function syncAllLocalAccountsToSupabase() {
  if (!supabase) return;
  try {
    const savedAccounts = JSON.parse(localStorage.getItem('respicare-accounts') || '[]');
    if (!Array.isArray(savedAccounts) || savedAccounts.length === 0) return;

    const syncedKeys = new Set(
      JSON.parse(localStorage.getItem('respicare-supabase-synced-v4') || '[]')
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
        'respicare-supabase-synced-v4',
        JSON.stringify(Array.from(syncedKeys))
      );
    }
  } catch (err) {
    console.error('Supabase syncAllLocalAccounts error:', err);
  }
}

export async function deduplicateSupabaseAccounts() {
  if (!supabase) return { ok: false, removed: 0, error: 'Supabase belum terkonfigurasi' };
  try {
    const { data, error } = await supabase
      .from('respicare_accounts')
      .select('id, role, email, rm, name')
      .order('id', { ascending: true });

    if (error) return { ok: false, removed: 0, error: error.message };

    const seen = new Set();
    const duplicateIds = [];

    (data || []).forEach((row) => {
      const role = (row.role || 'pasien').toLowerCase();
      const email = (row.email || '').trim().toLowerCase();
      const rm = (row.rm || '').trim().toUpperCase();
      const sig = email ? `${role}:email:${email}` : `${role}:rm:${rm}:${row.name || ''}`;

      if (seen.has(sig)) {
        duplicateIds.push(row.id);
      } else {
        seen.add(sig);
      }
    });

    if (duplicateIds.length > 0) {
      const { error: delErr } = await supabase
        .from('respicare_accounts')
        .delete()
        .in('id', duplicateIds);
      if (delErr) return { ok: false, removed: 0, error: delErr.message };
    }

    return { ok: true, removed: duplicateIds.length, error: null };
  } catch (err) {
    return { ok: false, removed: 0, error: err?.message || 'Gagal membersihkan duplikat' };
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

    ['respicare-supabase-synced-v4', 'respicare-supabase-synced-v3', 'respicare-supabase-synced-v2', 'respicare-supabase-synced-keys'].forEach((key) => {
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
  localStorage.removeItem('respicare-supabase-synced-v4');
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