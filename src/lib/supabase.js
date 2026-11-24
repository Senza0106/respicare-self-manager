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
      updated_at: new Date().toISOString(),
    };
    await supabase.from('respicare_accounts').insert([payload]);
  } catch (err) {
    console.warn('Supabase syncAccount dilewati:', err?.message || err);
  }
}

export async function logLoginToSupabase({ user, role, patientProfile, isDemo }) {
  if (!supabase) return;
  try {
    const payload = {
      role: role || 'pasien',
      name: user?.name || patientProfile?.name || '-',
      email: (user?.email || patientProfile?.email || '').toLowerCase() || null,
      phone: user?.phone || patientProfile?.phone || patientProfile?.guardianPhone || null,
      rm: patientProfile?.rm || user?.pairingCode || null,
      patient_name: patientProfile?.name || '-',
      condition: patientProfile?.condition || null,
      is_demo: Boolean(isDemo),
      logged_in_at: new Date().toISOString(),
    };
    await supabase.from('respicare_login_logs').insert([payload]);
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