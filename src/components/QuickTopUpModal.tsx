import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { formatRupiah, formatNumber } from '../utils/formatters';
import { PlusCircle, X, Check, Wallet } from 'lucide-react';

interface QuickTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOPUP_PRESETS = [5000000, 25000000, 100000000, 500000000, 1000000000, 2500000000];

export const QuickTopUpModal: React.FC<QuickTopUpModalProps> = ({
  isOpen,
  onClose
}) => {
  const { topUpBalance, userAccount } = useBanking();
  const [selectedAmount, setSelectedAmount] = useState<number>(100000000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount
      ? Number(customAmount.replace(/\D/g, ''))
      : selectedAmount;

    if (finalAmount <= 0) return;

    topUpBalance(finalAmount);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Isi Saldo Rekening Utama</h3>
              <p className="text-[11px] text-slate-400">
                Saldo Saat Ini: {formatRupiah(userAccount.balance)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleTopUp} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Pilih Nominal Tambah Saldo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TOPUP_PRESETS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                    selectedAmount === amt && !customAmount
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  +{formatRupiah(amt)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Atau Masukkan Nominal Kustom (IDR)
            </label>
            <input
              type="text"
              value={customAmount}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                setCustomAmount(digits ? formatNumber(Number(digits)) : '');
              }}
              placeholder="Contoh: 15.000.000"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {successMsg && (
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 justify-center py-1">
              <Check className="w-4 h-4" />
              Saldo berhasil ditambahkan ke rekening!
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>
              Konfirmasi Isi Saldo{' '}
              {customAmount ? `Rp ${customAmount}` : formatRupiah(selectedAmount)}
            </span>
          </button>
        </form>

      </div>
    </div>
  );
};
