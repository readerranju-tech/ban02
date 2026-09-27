import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { ShieldAlert, X, Lock, Unlock } from 'lucide-react';

interface EmergencyFreezeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REASONS = [
  'Melihat aktivitas transaksi yang tidak dikenal',
  'Ponsel / kartu ATM hilang atau dicuri',
  'Menerima pesan mencurigakan mengatasnamakan bank',
  'Inisiatif pencegahan pengeluaran sementara'
];

export const EmergencyFreezeModal: React.FC<EmergencyFreezeModalProps> = ({
  isOpen,
  onClose
}) => {
  const { securityProfile, freezeAccount, unfreezeAccount } = useBanking();
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [unfreezePin, setUnfreezePin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFreeze = (e: React.FormEvent) => {
    e.preventDefault();
    freezeAccount(selectedReason);
    onClose();
  };

  const handleUnfreeze = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = unfreezeAccount(unfreezePin);
    if (success) {
      setUnfreezePin('');
      onClose();
    } else {
      setErrorMsg('PIN yang Anda masukkan salah.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">
              {securityProfile.isAccountFrozen
                ? 'Buka Kunci Rekening'
                : 'Kunci & Bekukan Rekening Darurat'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {securityProfile.isAccountFrozen ? (
          <form onSubmit={handleUnfreeze} className="space-y-4 pt-4">
            <p className="text-xs text-slate-300">
              Rekening saat ini terkunci. Masukkan PIN 6-digit finansial Anda untuk memulihkan akses transaksi penuh.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                PIN Finansial 6-Digit
              </label>
              <input
                type="password"
                maxLength={6}
                value={unfreezePin}
                onChange={(e) => setUnfreezePin(e.target.value.replace(/\D/g, ''))}
                placeholder="Masukkan 6 angka PIN"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono tracking-widest text-center focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Buka Kunci Rekening</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleFreeze} className="space-y-4 pt-4">
            <p className="text-xs text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-800/40">
              Peringatan: Seluruh transaksi transfer keluar akan langsung diblokir seketika sampai Anda membukanya kembali dengan PIN otorisasi.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Alasan Pembekuan Rekening
              </label>
              <div className="space-y-2">
                {REASONS.map((r) => (
                  <label
                    key={r}
                    className={`block p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selectedReason === r
                        ? 'bg-rose-950/60 border-rose-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="freeze_reason"
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                      className="hidden"
                    />
                    {r}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Konfirmasi Bekukan Rekening Sekarang</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
