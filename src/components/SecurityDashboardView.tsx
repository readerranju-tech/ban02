import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { formatRupiah } from '../utils/formatters';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Fingerprint,
  ScanFace,
  Smartphone,
  Sliders,
  KeyRound,
  AlertTriangle,
  History,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface SecurityDashboardViewProps {
  onOpenFreezeModal: () => void;
}

export const SecurityDashboardView: React.FC<SecurityDashboardViewProps> = ({
  onOpenFreezeModal
}) => {
  const { securityProfile, updateSecurityProfile, unfreezeAccount } = useBanking();

  // PIN Change State
  const [showPinModal, setShowPinModal] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  // Daily Limit state
  const [tempLimit, setTempLimit] = useState(securityProfile.dailyTransferLimit);

  // Unfreeze State
  const [unfreezePin, setUnfreezePin] = useState('');
  const [unfreezeError, setUnfreezeError] = useState('');

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError('');
    setPinChangeSuccess(false);

    if (oldPin !== securityProfile.pin) {
      setPinChangeError('PIN lama yang Anda masukkan salah.');
      return;
    }
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setPinChangeError('PIN baru harus terdiri dari 6 digit angka.');
      return;
    }
    if (newPin !== confirmNewPin) {
      setPinChangeError('Konfirmasi PIN baru tidak sesuai.');
      return;
    }

    updateSecurityProfile({ pin: newPin });
    setPinChangeSuccess(true);
    setOldPin('');
    setNewPin('');
    setConfirmNewPin('');
    setTimeout(() => {
      setShowPinModal(false);
      setPinChangeSuccess(false);
    }, 1500);
  };

  const handleUpdateLimit = () => {
    updateSecurityProfile({ dailyTransferLimit: tempLimit });
    alert('Limit transfer harian berhasil diperbarui.');
  };

  const handleUnfreeze = (e: React.FormEvent) => {
    e.preventDefault();
    setUnfreezeError('');
    const success = unfreezeAccount(unfreezePin);
    if (success) {
      setUnfreezePin('');
    } else {
      setUnfreezeError('PIN tidak sesuai. Rekening tetap dibekukan.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Pusat Keamanan & Proteksi Finansial
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Konfigurasi perlindungan multi-faktor, audit keamanan, anti-fraud perbankan tingkat lanjut, dan pembekuan darurat.
          </p>
        </div>

        {/* Security Score Badge */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-sm">
            100%
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Kesehatan Keamanan
            </span>
            <span className="text-xs font-bold text-emerald-400">
              Proteksi Maksimal Aktif
            </span>
          </div>
        </div>
      </div>

      {/* Account Freeze Status Banner if Frozen */}
      {securityProfile.isAccountFrozen && (
        <div className="p-5 rounded-3xl bg-rose-950/50 border border-rose-600/50 space-y-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">
                Rekening Anda Sedang Dibekukan Sementara (Emergency Lock)
              </h3>
              <p className="text-xs text-rose-200 mt-1">
                Alasan: {securityProfile.freezeReason || 'Inisiatif Pengamanan Nasabah'}. Seluruh transaksi transfer keluar dihentikan demi mencegah akses tanpa izin.
              </p>
            </div>
          </div>

          <form onSubmit={handleUnfreeze} className="flex flex-col sm:flex-row gap-2 pt-2">
            <input
              type="password"
              maxLength={6}
              value={unfreezePin}
              onChange={(e) => setUnfreezePin(e.target.value.replace(/\D/g, ''))}
              placeholder="Masukkan PIN 6-digit untuk membuka"
              className="bg-slate-950 border border-rose-500/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Buka Kunci Rekening Sekarang
            </button>
          </form>
          {unfreezeError && (
            <p className="text-xs text-rose-400 font-medium">{unfreezeError}</p>
          )}
        </div>
      )}

      {/* Main Grid: Controls & Audit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Multi-Factor & PIN Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            Otentikasi & Akses Finansial
          </h3>

          <div className="space-y-4">
            
            {/* Scrambled Keypad Toggle */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">
                  Acak Tombol PIN (Anti-Shoulder Surfing)
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Mengacak posisi keypad 0-9 saat memasukkan PIN untuk mencegah pengintip.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateSecurityProfile({
                    isScrambledKeypad: !securityProfile.isScrambledKeypad
                  })
                }
                className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                  securityProfile.isScrambledKeypad ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    securityProfile.isScrambledKeypad ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Biometric Toggle */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  {securityProfile.biometricType === 'FACE_ID' ? (
                    <ScanFace className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Fingerprint className="w-4 h-4 text-emerald-400" />
                  )}
                  Autentikasi Sensor Biometrik
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Gunakan sensor {securityProfile.biometricType === 'FACE_ID' ? 'Face ID' : 'Sidik Jari'} untuk otorisasi transfer instan.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateSecurityProfile({
                    isBiometricEnabled: !securityProfile.isBiometricEnabled
                  })
                }
                className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                  securityProfile.isBiometricEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    securityProfile.isBiometricEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Change PIN Action */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">
                  PIN Transaksi 6-Digit
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Diperlukan untuk menandatangani setiap transaksi finansial.
                </p>
              </div>
              <button
                onClick={() => setShowPinModal(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
              >
                Ubah PIN
              </button>
            </div>

            {/* Large Tx OTP Guard */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">
                  Verifikasi Tambahan Transfer Nominal Tinggi
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Memerlukan otorisasi ganda untuk nominal di atas Rp 25 Juta.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                AKTIF
              </span>
            </div>

          </div>
        </div>

        {/* Card 2: Daily Limits & Emergency Freeze */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Manajemen Limit & Perlindungan Darurat
          </h3>

          <div className="space-y-4">
            
            {/* Daily Limit Slider */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">Limit Transfer Harian</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {formatRupiah(tempLimit)}
                </span>
              </div>

              <input
                type="range"
                min={10000000}
                max={5000000000}
                step={50000000}
                value={tempLimit}
                onChange={(e) => setTempLimit(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Min: Rp 10 Jt</span>
                <span>Max Prioritas: Rp 5 Miliar</span>
              </div>

              {tempLimit !== securityProfile.dailyTransferLimit && (
                <button
                  type="button"
                  onClick={handleUpdateLimit}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Simpan Perubahan Limit
                </button>
              )}
            </div>

            {/* Emergency Freeze Trigger Card */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-2">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold">Tombol Panik / Kunci Darurat</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Jika Anda mencurigai aktivitas tidak wajar atau kehilangan perangkat, Anda dapat membekukan saldo & rekening seketika.
              </p>
              <button
                type="button"
                onClick={onOpenFreezeModal}
                className="w-full py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                {securityProfile.isAccountFrozen ? 'Buka Kunci Rekening' : 'Bekukan Rekening Sekarang'}
              </button>
            </div>

            {/* Device Info */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Perangkat Terdaftar:</span>
                <span className="font-semibold text-white">Apple Safari 19 (Enkripsi Biometrik)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lokasi IP Sesi:</span>
                <span className="font-mono text-emerald-400">182.253.140.82 (Jakarta - Aman)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sertifikat SSL/TLS:</span>
                <span className="font-mono text-slate-300">TLS 1.3 / AES-256-GCM</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Change PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Ubah PIN Finansial</h3>
            <p className="text-xs text-slate-400 mb-4">
              Pastikan Anda tidak membagikan PIN kepada pihak mana pun.
            </p>

            <form onSubmit={handleSavePin} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">PIN Lama</label>
                <input
                  type="password"
                  maxLength={6}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="6 digit PIN lama"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">PIN Baru</label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="6 digit angka baru"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Konfirmasi PIN Baru</label>
                <input
                  type="password"
                  maxLength={6}
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ulangi 6 digit angka baru"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              {pinChangeError && (
                <p className="text-xs text-rose-400 font-medium">{pinChangeError}</p>
              )}
              {pinChangeSuccess && (
                <p className="text-xs text-emerald-400 font-medium">PIN berhasil diperbarui!</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
                >
                  Simpan PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
