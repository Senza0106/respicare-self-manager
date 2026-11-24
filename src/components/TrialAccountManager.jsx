import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Database, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  fetchSupabaseAccounts,
  deleteAccountEverywhere,
  resetAllTrialAccounts,
} from '../lib/supabase';

export default function TrialAccountManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingKey, setDeletingKey] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  const loadAllAccounts = async () => {
    setLoading(true);
    setStatusMsg(null);

    const { data: sbData, error: sbError } = await fetchSupabaseAccounts();
    if (sbError) {
      setStatusMsg({
        type: 'error',
        text: `Catatan Supabase: ${sbError}. Pastikan policy DELETE sudah aktif di SQL Editor.`,
      });
    }

    let localData = [];
    try {
      const raw = JSON.parse(localStorage.getItem('respicare-accounts') || '[]');
      if (Array.isArray(raw)) localData = raw;
    } catch {
      localData = [];
    }

    const merged = [];
    const seen = new Set();

    // Masukkan data dari Supabase terlebih dahulu
    (sbData || []).forEach((item) => {
      const emailKey = (item.email || '').toLowerCase();
      const rmKey = (item.rm || item.pairing_code || '').toUpperCase();
      const uniqueKey = `sb-${item.id}`;
      seen.add(`${item.role || 'pasien'}:${emailKey}:${rmKey}`);
      merged.push({
        key: uniqueKey,
        id: item.id,
        role: item.role || 'pasien',
        name: item.name || '-',
        email: item.email || '',
        phone: item.phone || '-',
        rm: item.rm || item.pairing_code || '-',
        source: 'Supabase',
      });
    });

    // Tambahkan akun lokal yang belum tercatat di Supabase
    localData.forEach((item, idx) => {
      const emailKey = (item.email || '').toLowerCase();
      const rmKey = (item.rm || item.pairingCode || '').toUpperCase();
      const signature = `${item.role || 'pasien'}:${emailKey}:${rmKey}`;
      if (!seen.has(signature)) {
        seen.add(signature);
        merged.push({
          key: `local-${idx}-${emailKey}`,
          id: null,
          role: item.role || 'pasien',
          name: item.name || '-',
          email: item.email || '',
          phone: item.phone || item.guardianPhone || '-',
          rm: item.rm || item.pairingCode || '-',
          source: 'Browser Lokal',
        });
      }
    });

    setAccounts(merged);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadAllAccounts();
    }
  }, [isOpen]);

  const handleDeleteOne = async (acc) => {
    setDeletingKey(acc.key);
    const res = await deleteAccountEverywhere({
      id: acc.id,
      email: acc.email,
      rm: acc.rm,
    });

    if (!res.ok) {
      setStatusMsg({
        type: 'error',
        text: `Gagal menghapus di Supabase (${res.error}). Jalankan policy "for all to anon" di SQL Editor Supabase.`,
      });
    } else {
      setStatusMsg({
        type: 'success',
        text: `Akun ${acc.email || acc.name} berhasil dihapus. Email tersebut kini bisa dipakai daftar ulang.`,
      });
    }

    await loadAllAccounts();
    setDeletingKey(null);
  };

  const handleResetAll = async () => {
    if (!window.confirm('Hapus SEMUA akun uji coba di Supabase dan browser lokal?')) {
      return;
    }
    setLoading(true);
    const res = await resetAllTrialAccounts();
    if (!res.ok) {
      setStatusMsg({
        type: 'error',
        text: `Gagal mengosongkan Supabase (${res.error}).`,
      });
    } else {
      setStatusMsg({
        type: 'success',
        text: 'Seluruh data akun uji coba berhasil dibersihkan!',
      });
    }
    await loadAllAccounts();
    setLoading(false);
  };

  return (
    <>
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 border border-slate-700/60 transition-colors cursor-pointer"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Kelola & Hapus Akun Uji Coba</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0b192c] border border-slate-700 text-slate-100 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#081322]">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Manajemen Akun Uji Coba (Supabase & Lokal)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Hapus akun lama agar Gmail yang sama bisa dipakai daftar ulang
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
              {statusMsg && (
                <div
                  className={`flex items-start gap-2 p-3 rounded-xl text-xs border ${
                    statusMsg.type === 'error'
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {statusMsg.type === 'error' ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  Total terdaftar: <strong className="text-white">{accounts.length}</strong> akun
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadAllAccounts}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  {accounts.length > 0 && (
                    <button
                      type="button"
                      onClick={handleResetAll}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Semua</span>
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  Memuat daftar akun dari Supabase...
                </div>
              ) : accounts.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400 border border-dashed border-slate-800 rounded-xl">
                  Belum ada akun terdaftar. Semua alamat Gmail bebas digunakan untuk mendaftar.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {accounts.map((acc) => (
                    <div
                      key={acc.key}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm text-white truncate">
                            {acc.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              acc.role === 'pendamping'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {acc.role}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-400">
                            {acc.source}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 truncate">
                          Email: <span className="text-cyan-300">{acc.email || '(Tanpa email)'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          RM/Kode: {acc.rm} • Telp: {acc.phone}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteOne(acc)}
                        disabled={deletingKey === acc.key}
                        className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingKey === acc.key ? 'Menghapus...' : 'Hapus Akun'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}