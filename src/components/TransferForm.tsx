import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { Bank, TransferRail } from '../types/banking';
import { INDONESIAN_BANKS, TRANSFER_RAILS_CONFIG } from '../data/indonesianBanks';
import { formatRupiah, formatNumber } from '../utils/formatters';
import { verifyBankAccount, evaluateTransactionRisk } from '../utils/security';
import { BankSelectorModal } from './BankSelectorModal';
import { SecurityAuthModal } from './SecurityAuthModal';
import {
  Building2,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Zap,
  Lock,
  Landmark,
  Clock,
  Layers
} from 'lucide-react';

const QUICK_AMOUNTS = [500000, 1000000, 5000000, 25000000, 50000000, 100000000, 250000000];

const PURPOSES = [
  'Pribadi & Kebutuhan Harian',
  'Bisnis & Pekerjaan',
  'Keluarga & Orang Tua',
  'Investasi & Tabungan',
  'Zakat, Infaq & Donasi',
  'Belanja Online / E-Commerce'
];

export const TransferForm: React.FC = () => {
  const {
    userAccount,
    securityProfile,
    initiateTransfer,
    setActiveTab
  } = useBanking();

  // Transfer State
  const [selectedBank, setSelectedBank] = useState<Bank>(() => {
    return INDONESIAN_BANKS.find((b) => b.id === 'mandiri') || INDONESIAN_BANKS[0];
  });
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [accountError, setAccountError] = useState('');

  const [rawAmount, setRawAmount] = useState('');
  const [selectedRail, setSelectedRail] = useState<TransferRail>('BI-FAST');
  const [selectedPurpose, setSelectedPurpose] = useState(PURPOSES[0]);
  const [note, setNote] = useState('');

  // Security Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const numericAmount = Number(rawAmount.replace(/\D/g, '')) || 0;
  const currentRailConfig = TRANSFER_RAILS_CONFIG[selectedRail];
  const adminFee = currentRailConfig.fee;
  const totalDeduction = numericAmount + adminFee;

  // Real-time Anti-Fraud Risk Evaluation
  const riskEvaluation = evaluateTransactionRisk(
    numericAmount,
    accountNumber,
    false,
    securityProfile.usedTodayLimit,
    securityProfile.dailyTransferLimit
  );

  // Trigger account verification
  const handleVerifyAccount = async (targetBankCode: string, accNum: string) => {
    const cleanAcc = accNum.replace(/\s|-/g, '');
    if (cleanAcc.length < 5) return;

    setIsVerifyingAccount(true);
    setAccountError('');
    setAccountVerified(false);

    try {
      const res = await verifyBankAccount(targetBankCode, cleanAcc);
      setAccountHolder(res.accountHolder);
      setAccountVerified(true);
    } catch {
      setAccountError('Gagal memeriksa rekening. Pastikan nomor rekening valid.');
      setAccountVerified(false);
    } finally {
      setIsVerifyingAccount(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setRawAmount(digitsOnly ? formatNumber(Number(digitsOnly)) : '');
  };

  const handleQuickAmount = (val: number) => {
    setRawAmount(formatNumber(val));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (securityProfile.isAccountFrozen) {
      alert('Rekening Anda saat ini dibekukan sementara demi keamanan.');
      return;
    }

    if (!accountVerified || !accountHolder) {
      setAccountError('Silakan verifikasi nomor rekening penerima terlebih dahulu.');
      return;
    }

    if (numericAmount < selectedBank.minTransfer) {
      alert(`Minimal transfer untuk bank ini adalah ${formatRupiah(selectedBank.minTransfer)}.`);
      return;
    }

    if (totalDeduction > userAccount.balance) {
      alert('Saldo Anda tidak mencukupi untuk nominal transfer ini beserta biaya layanan.');
      return;
    }

    if (securityProfile.usedTodayLimit + totalDeduction > securityProfile.dailyTransferLimit) {
      alert('Transfer melebihi sisa batas limit harian Anda.');
      return;
    }

    // Open security PIN / Biometric modal
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = async (
    authMethod: 'PIN_6_DIGIT' | 'BIOMETRIC_FACE_ID' | 'BIOMETRIC_FINGERPRINT'
  ) => {
    setIsAuthModalOpen(false);

    try {
      await initiateTransfer({
        destinationBank: selectedBank,
        destinationAccountNumber: accountNumber,
        destinationAccountHolder: accountHolder,
        amount: numericAmount,
        fee: adminFee,
        rail: selectedRail,
        purpose: selectedPurpose,
        note: note || 'Transfer Dana Antar Bank',
        authMethod
      });

      // Reset form
      setRawAmount('');
      setNote('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Terjadi kesalahan transfer.');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Main Grid: Left Form (60%) + Right Security Intelligence (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Transfer Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
          <form onSubmit={handleFormSubmit} className="space-y-5">
            
            {/* Step 1: Destination Bank Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bank Tujuan Transfer
              </label>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(true)}
                className="w-full p-3.5 bg-slate-950 border border-slate-700/80 rounded-2xl flex items-center justify-between hover:border-emerald-500/80 transition-colors group text-left shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md"
                    style={{ backgroundColor: selectedBank.color }}
                  >
                    {selectedBank.logoText}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                        {selectedBank.shortName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({selectedBank.code})
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-xs">
                      {selectedBank.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-emerald-400 font-medium">
                  <span className="hidden sm:inline">Ubah Bank</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Step 2: Account Number & Live Inquiry */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Nomor Rekening Penerima
                </label>
                <span className="text-[11px] text-slate-400">
                  Inquiry Otomatis Bank Sentral
                </span>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setAccountNumber(val);
                      setAccountVerified(false);
                      setAccountHolder('');
                      setAccountError('');
                    }}
                    placeholder={`Masukkan nomor rekening ${selectedBank.shortName}`}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  {accountVerified && (
                    <CheckCircle className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyAccount(selectedBank.code, accountNumber)}
                  disabled={isVerifyingAccount || accountNumber.length < 5}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 border border-slate-700"
                >
                  {isVerifyingAccount ? (
                    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Cek Rekening</span>
                  )}
                </button>
              </div>

              {/* Inquiry Result Badge */}
              {accountVerified && accountHolder && (
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">
                        {accountHolder}
                      </p>
                      <p className="text-[10px] text-emerald-400">
                        Rekening Aktif Terverifikasi · Bank {selectedBank.shortName}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    VALID
                  </span>
                </div>
              )}

              {accountError && (
                <p className="text-xs text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {accountError}
                </p>
              )}
            </div>

            {/* Step 3: Nominal Amount & Quick Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Nominal Transfer (IDR)
                </label>
                <span className="text-[11px] text-slate-400">
                  Saldo: <strong className="text-emerald-400 tabular-nums">{formatRupiah(userAccount.balance)}</strong>
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  value={rawAmount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-12 pr-4 py-3 text-lg font-bold text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1 no-scrollbar">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAmount(amt)}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors shrink-0"
                  >
                    +{formatNumber(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Transfer Rail Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Pilih Jalur / Mekanisme Pengiriman Dana
                </label>
                <span className="text-[11px] font-medium text-emerald-400">
                  {selectedRail === 'RTGS'
                    ? 'Mekanisme BI-RTGS'
                    : selectedRail === 'SKNBI'
                    ? 'Mekanisme Kliring SKNBI'
                    : selectedRail === 'BI-FAST'
                    ? 'Mekanisme BI-FAST'
                    : 'Switching Online'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                {/* BI-FAST Option */}
                <button
                  type="button"
                  onClick={() => setSelectedRail('BI-FAST')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedRail === 'BI-FAST'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      BI-FAST
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      Rp 2.500
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Real-time 24/7 · Maks. Rp 250 Juta per transfer
                  </p>
                </button>

                {/* Realtime Online Switching Option */}
                <button
                  type="button"
                  onClick={() => setSelectedRail('REALTIME_ONLINE')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedRail === 'REALTIME_ONLINE'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-sky-400" />
                      Realtime Online
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      Rp 6.500
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Jaringan Prima / Alto / ATM Bersama
                  </p>
                </button>

                {/* RTGS (Real Time Gross Settlement) Option */}
                <button
                  type="button"
                  onClick={() => setSelectedRail('RTGS')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedRail === 'RTGS'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-amber-400" />
                      RTGS
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      Rp 25.000
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Real Time Gross Settlement · Antar Bank Sentral
                  </p>
                </button>

                {/* SKNBI (Sistem Kliring Nasional Bank Indonesia) Option */}
                <button
                  type="button"
                  onClick={() => setSelectedRail('SKNBI')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedRail === 'SKNBI'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      SKNBI
                    </span>
                    <span className="text-xs font-bold text-teal-400">
                      Rp 2.900
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sistem Kliring Nasional BI · Batch Terjadwal
                  </p>
                </button>
              </div>

              {/* Informative notification regarding the selected mechanism */}
              {selectedRail === 'RTGS' && (
                <div className="mt-2.5 p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                  <Landmark className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-200">Mekanisme RTGS (Real Time Gross Settlement):</span>
                    <p className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">
                      Bank akan memproses transfer melalui mekanisme penyelesaian seketika (gross settlement) antarbank langsung di Bank Indonesia pada hari kerja (08:30 - 15:00 WIB).
                    </p>
                  </div>
                </div>
              )}

              {selectedRail === 'SKNBI' && (
                <div className="mt-2.5 p-3 bg-teal-950/30 border border-teal-500/40 rounded-xl flex items-start gap-2.5 text-xs text-teal-300">
                  <Clock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-teal-200">Mekanisme SKNBI (Sistem Kliring Nasional Bank Indonesia):</span>
                    <p className="text-[11px] text-teal-300/80 mt-0.5 leading-relaxed">
                      Bank akan memproses transfer melalui mekanisme kliring terjadwal batch Bank Indonesia dengan biaya hemat. Dana diproses sesuai siklus kliring BI.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 5: Purpose and Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tujuan Transaksi
                </label>
                <select
                  value={selectedPurpose}
                  onChange={(e) => setSelectedPurpose(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Berita Transfer / Catatan
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Misal: Bayar sewa, tagihan, honor"
                  maxLength={50}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Total Breakdown & Action Button */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Biaya Transfer ({selectedRail})</span>
                <span className="font-mono text-slate-300">{formatRupiah(adminFee)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-white">Total Pendebetan</span>
                <span className="font-mono text-emerald-400 tabular-nums">
                  {formatRupiah(totalDeduction)}
                </span>
              </div>

              <button
                type="submit"
                disabled={!accountVerified || numericAmount <= 0}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Lanjutkan ke Otorisasi Keamanan</span>
              </button>
            </div>

          </form>

        </div>

        {/* RIGHT COLUMN: Real-time Security & Network Intelligence */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Security Shield Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Analisis Risiko & Keamanan Finansial
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                100% TERENKRIPSI
              </span>
            </div>

            {/* Risk Meter */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400">Tingkat Risiko Transaksi:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {riskEvaluation.riskLevel} (Skor: {riskEvaluation.riskScore}/100)
                </span>
              </div>

              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    riskEvaluation.riskLevel === 'BERBAHAYA'
                      ? 'bg-rose-500'
                      : riskEvaluation.riskLevel === 'WASPADA'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(riskEvaluation.riskScore, 10)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 mt-2">
                {riskEvaluation.reasons[0]}
              </p>
            </div>

            {/* Daily Limit Usage */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Limit Transfer Harian</span>
                <span className="font-mono text-white">
                  {formatRupiah(securityProfile.dailyTransferLimit)}
                </span>
              </div>

              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-400 rounded-full"
                  style={{
                    width: `${Math.min(
                      ((securityProfile.usedTodayLimit + numericAmount) /
                        securityProfile.dailyTransferLimit) *
                        100,
                      100
                    )}%`
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Terpakai: {formatRupiah(securityProfile.usedTodayLimit)}</span>
                <span>Sisa: {formatRupiah(Math.max(securityProfile.dailyTransferLimit - securityProfile.usedTodayLimit, 0))}</span>
              </div>
            </div>

          </div>

          {/* Quick Bank Network Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Status Jaringan Bank Indonesia
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Normal 24/7
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Jalur BI-FAST</span>
                <span className="font-semibold text-white">0.4 Detik Rata-rata</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Switch Bersama/Prima</span>
                <span className="font-semibold text-white">Aktif 100%</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('banks')}
              className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <span>Lihat Daftar 100+ Bank & Sandi Kliring</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Bank Selection Modal */}
      <BankSelectorModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        selectedBankId={selectedBank.id}
        onSelectBank={(bank) => {
          setSelectedBank(bank);
          setAccountVerified(false);
          setAccountHolder('');
          setAccountError('');
        }}
      />

      {/* Security Auth Modal */}
      <SecurityAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        transferDetails={{
          bank: selectedBank,
          accountHolder,
          accountNumber,
          amount: numericAmount,
          fee: adminFee,
          rail: selectedRail
        }}
        riskEvaluation={riskEvaluation}
      />

    </div>
  );
};
