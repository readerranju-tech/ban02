import React, { useState, useEffect, useMemo } from 'react';
import { useBanking } from '../context/BankingContext';
import { Bank, TransferRail } from '../types/banking';
import { formatRupiah } from '../utils/formatters';
import { getScrambledKeypad } from '../utils/security';
import {
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  ScanFace,
  Lock,
  Delete,
  X,
  AlertTriangle
} from 'lucide-react';

interface SecurityAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (authMethod: 'PIN_6_DIGIT' | 'BIOMETRIC_FACE_ID' | 'BIOMETRIC_FINGERPRINT') => void;
  transferDetails: {
    bank: Bank;
    accountHolder: string;
    accountNumber: string;
    amount: number;
    fee: number;
    rail: TransferRail;
  };
  riskEvaluation: {
    riskScore: number;
    riskLevel: 'AMAN' | 'WASPADA' | 'BERBAHAYA';
    reasons: string[];
    requiresExtra2FA: boolean;
  };
}

export const SecurityAuthModal: React.FC<SecurityAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  transferDetails,
  riskEvaluation
}) => {
  const { securityProfile } = useBanking();
  const [authMode, setAuthMode] = useState<'PIN' | 'BIOMETRIC'>('PIN');
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [useScrambled, setUseScrambled] = useState(securityProfile.isScrambledKeypad);

  // Keypad arrangement
  const keypadNumbers = useMemo(() => {
    return useScrambled ? getScrambledKeypad() : [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  }, [useScrambled]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setPinDigits([]);
      setErrorMessage('');
      setIsBiometricScanning(false);
      setBiometricSuccess(false);
      // Auto prefer biometric if enabled
      if (securityProfile.isBiometricEnabled) {
        setAuthMode('BIOMETRIC');
      } else {
        setAuthMode('PIN');
      }
    }
  }, [isOpen, securityProfile.isBiometricEnabled]);

  // Trigger biometric simulation
  const triggerBiometricScan = () => {
    setIsBiometricScanning(true);
    setErrorMessage('');
    setTimeout(() => {
      setIsBiometricScanning(false);
      setBiometricSuccess(true);
      setTimeout(() => {
        onSuccess(
          securityProfile.biometricType === 'FACE_ID'
            ? 'BIOMETRIC_FACE_ID'
            : 'BIOMETRIC_FINGERPRINT'
        );
      }, 600);
    }, 1400);
  };

  const handleDigitPress = (digit: number) => {
    if (pinDigits.length >= 6) return;
    const newDigits = [...pinDigits, digit.toString()];
    setPinDigits(newDigits);
    setErrorMessage('');

    if (newDigits.length === 6) {
      const enteredPin = newDigits.join('');
      if (enteredPin === securityProfile.pin) {
        onSuccess('PIN_6_DIGIT');
      } else {
        const nextAttempts = attemptsLeft - 1;
        setAttemptsLeft(nextAttempts);
        if (nextAttempts <= 0) {
          setErrorMessage('Terlalu banyak percobaan salah. Transaksi dibatalkan demi keamanan.');
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setErrorMessage(`PIN tidak sesuai. Sisa ${nextAttempts} percobaan lagi.`);
          setPinDigits([]);
        }
      }
    }
  };

  const handleDeleteDigit = () => {
    if (pinDigits.length > 0) {
      setPinDigits(pinDigits.slice(0, -1));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Otorisasi Keamanan Transaksi
              </h3>
              <p className="text-[11px] text-slate-400">
                Enkripsi TLS 1.3 · Standar BI-FAST ISO 20022
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transfer Confirmation Summary Badge */}
        <div className="bg-slate-950/60 px-5 py-3 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Nominal Ditransfer</span>
            <span className="text-base font-bold text-emerald-400 tabular-nums">
              {formatRupiah(transferDetails.amount + transferDetails.fee)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
            <span className="truncate max-w-[200px]">
              Ke: {transferDetails.accountHolder} ({transferDetails.bank.shortName})
            </span>
            <span className="text-teal-400 font-mono">
              {transferDetails.rail} · Biaya {formatRupiah(transferDetails.fee)}
            </span>
          </div>
        </div>

        {/* Real-time Risk Assessment Alert if Elevated */}
        {riskEvaluation.riskLevel !== 'AMAN' && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">
                Peringatan Sistem Anti-Fraud ({riskEvaluation.riskLevel})
              </p>
              <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[11px] text-amber-300/90">
                {riskEvaluation.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Auth Method Switcher Tabs */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setAuthMode('PIN')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                authMode === 'PIN'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              PIN 6-Digit
            </button>
            <button
              onClick={() => {
                setAuthMode('BIOMETRIC');
                if (!isBiometricScanning && !biometricSuccess) {
                  triggerBiometricScan();
                }
              }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                authMode === 'BIOMETRIC'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {securityProfile.biometricType === 'FACE_ID' ? (
                <ScanFace className="w-3.5 h-3.5" />
              ) : (
                <Fingerprint className="w-3.5 h-3.5" />
              )}
              {securityProfile.biometricType === 'FACE_ID' ? 'Face ID' : 'Sidik Jari'}
            </button>
          </div>
        </div>

        {/* PIN MODE */}
        {authMode === 'PIN' && (
          <div className="p-5 flex flex-col items-center">
            <div className="text-center mb-3">
              <p className="text-xs font-medium text-slate-300">
                Masukkan 6 Digit PIN Finansial Anda
              </p>
            </div>

            {/* PIN Dots Display */}
            <div className="flex items-center gap-3.5 my-3">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const filled = pinDigits.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                      filled
                        ? 'bg-emerald-400 scale-125 shadow-lg shadow-emerald-500/50'
                        : 'border border-slate-600 bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-400 font-medium mt-1 mb-2 text-center animate-shake">
                {errorMessage}
              </p>
            )}

            {/* Scrambled Keypad Anti-Shoulder Surfing Toggle */}
            <div className="w-full flex items-center justify-between text-xs py-1.5 px-2 mb-2 bg-slate-950/40 rounded-lg">
              <span className="text-slate-400 text-[11px]">Acak Posisi Tombol (Anti-Intip)</span>
              <button
                type="button"
                onClick={() => setUseScrambled(!useScrambled)}
                className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                  useScrambled
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {useScrambled ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>

            {/* Numeric Keypad Grid */}
            <div className="w-full grid grid-cols-3 gap-2.5 max-w-xs">
              {keypadNumbers.slice(0, 9).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigitPress(num)}
                  className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-emerald-600 text-white font-mono text-lg font-bold border border-slate-700/60 shadow-sm transition-all"
                >
                  {num}
                </button>
              ))}

              {/* Bottom row: Blank/Scramble toggle, 10th number, Delete */}
              <button
                type="button"
                onClick={() => setUseScrambled(!useScrambled)}
                title="Kocok ulang urutan angka"
                className="h-12 rounded-xl bg-slate-950/40 hover:bg-slate-800 text-slate-400 text-[10px] uppercase font-semibold flex items-center justify-center border border-slate-800 transition-colors"
              >
                Acak
              </button>

              <button
                type="button"
                onClick={() => handleDigitPress(keypadNumbers[9])}
                className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-emerald-600 text-white font-mono text-lg font-bold border border-slate-700/60 shadow-sm transition-all"
              >
                {keypadNumbers[9]}
              </button>

              <button
                type="button"
                onClick={handleDeleteDigit}
                className="h-12 rounded-xl bg-slate-950/40 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 flex items-center justify-center border border-slate-800 transition-colors"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* BIOMETRIC MODE */}
        {authMode === 'BIOMETRIC' && (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="relative my-4">
              <div
                className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  biometricSuccess
                    ? 'border-emerald-400 bg-emerald-950/50 text-emerald-400 scale-105'
                    : isBiometricScanning
                    ? 'border-teal-400 bg-teal-950/30 text-teal-400 animate-pulse'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400'
                }`}
              >
                {biometricSuccess ? (
                  <ShieldCheck className="w-12 h-12 stroke-[2.5]" />
                ) : securityProfile.biometricType === 'FACE_ID' ? (
                  <ScanFace className="w-12 h-12 stroke-[1.8]" />
                ) : (
                  <Fingerprint className="w-12 h-12 stroke-[1.8]" />
                )}
              </div>

              {isBiometricScanning && (
                <div className="absolute inset-0 rounded-full border-2 border-teal-400 animate-ping opacity-75" />
              )}
            </div>

            <h4 className="text-base font-bold text-white mt-2">
              {biometricSuccess
                ? 'Biometrik Terverifikasi Sah!'
                : isBiometricScanning
                ? 'Memindai Sensor Biometrik Perangkat...'
                : `Sentuh Sensor ${
                    securityProfile.biometricType === 'FACE_ID' ? 'Face ID' : 'Sidik Jari'
                  }`}
            </h4>

            <p className="text-xs text-slate-400 max-w-xs mt-1">
              {biometricSuccess
                ? 'Kunci privat kriptografis berhasil didekripsi. Menginisiasi transfer...'
                : 'Pindai wajah atau sidik jari Anda untuk menandatangani transfer BI-FAST secara aman.'}
            </p>

            {!isBiometricScanning && !biometricSuccess && (
              <button
                onClick={triggerBiometricScan}
                className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition-all"
              >
                Mulai Pindai Biometrik
              </button>
            )}
          </div>
        )}

        {/* Security Footer Note */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Anti-Fraud Engine Aktif</span>
          </div>
          <span className="font-mono text-slate-500">ISO 20022 · PCI-DSS</span>
        </div>

      </div>
    </div>
  );
};
