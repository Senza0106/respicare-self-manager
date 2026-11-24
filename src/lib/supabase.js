import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes('ISI-PROJECT-ID-ANDA');

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function syncAccountToSupabase(account) {
  if (!supabase || !account) return;
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
      updated_at: account.createdAt || new Date().toISOString(),
    };
    const { error } = await supabase.from('respicare_accounts').insert([payload]);
    if (error) console.warn('Gagal simpan akun ke Supabase:', error.message);
  } catch (err) {
    console.warn('Supabase syncAccount dilewati:', err?.message || err);
  }
}

export async function syncAllLocalAccountsToSupabase() {
  if (!supabase) return;
  try {
    const savedAccounts = JSON.parse(localStorage.getItem('respicare-accounts') || '[]');
    if (!Array.isArray(savedAccounts) || savedAccounts.length === 0) return;

    const syncedKeys = new Set(
      JSON.parse(localStorage.getItem('respicare-supabase-synced-keys') || '[]')
    );

    let hasNew = false;
    for (const acc of savedAccounts) {
      const uniqueKey = `${acc.role || 'pasien'}:${(acc.email || '').toLowerCase()}:${(acc.rm || acc.pairingCode || '').toUpperCase()}:${acc.name || ''}`;
      if (!syncedKeys.has(uniqueKey)) {
        await syncAccountToSupabase(acc);
        syncedKeys.add(uniqueKey);
        hasNew = true;
      }
    }

    if (hasNew) {
      localStorage.setItem(
        'respicare-supabase-synced-keys',
        JSON.stringify(Array.from(syncedKeys))
      );
    }
  } catch (err) {
    console.warn('Supabase syncAllLocalAccounts dilewati:', err?.message || err);
  }
}

export async function logLoginToSupabase({ user, role, patientProfile, isDemo }) {
  if (!supabase) return;
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
    if (error) console.warn('Gagal simpan log login ke Supabase:', error.message);
  } catch (err) {
    console.warn('Supabase logLogin dilewati:', err?.message || err);
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
    console.warn('Supabase syncSchedules dilewati:', err?.message || err);
  }
}