import React, { useState } from 'react';
import { TransactionRecord } from '../types/banking';
import { formatRupiah, formatDateWIB, maskAccountNumber } from '../utils/formatters';
import {
  CheckCircle2,
  X,
  Share2,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Download
} from 'lucide-react';

interface TransactionReceiptModalProps {
  transaction: TransactionRecord | null;
  onClose: () => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  transaction,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const handleCopyText = () => {
    const railLabel =
      transaction.rail === 'RTGS'
        ? 'RTGS (Real Time Gross Settlement)'
        : transaction.rail === 'SKNBI'
        ? 'SKNBI (Sistem Kliring Nasional Bank Indonesia)'
        : transaction.rail === 'REALTIME_ONLINE'
        ? 'Realtime Online'
        : 'BI-FAST';

    const text = `BUKTI TRANSFER RESMI ${transaction.rail}
No. Referensi: ${transaction.biFastRef}
STAN: ${transaction.stan}
Waktu: ${formatDateWIB(transaction.date)}
Bank Asal: ${transaction.sourceAccount.bankName}
Pengirim: ${transaction.sourceAccount.accountHolder}
Bank Tujuan: ${transaction.destinationBank.name}
Penerima: ${transaction.destinationAccountHolder}
No. Rekening: ${transaction.destinationAccountNumber}
Nominal: ${formatRupiah(transaction.amount)}
Biaya: ${formatRupiah(transaction.fee)}
Total: ${formatRupiah(transaction.total)}
Mekanisme Jalur: ${railLabel}
Berita: ${transaction.note}
Status: BERHASIL (TERVALIDASI ISO 20022)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWA = () => {
    const text = `Halo, saya telah mentransfer dana via ${transaction.rail}:
Nominal: ${formatRupiah(transaction.amount)}
Ke: ${transaction.destinationAccountHolder} (${transaction.destinationBank.shortName})
No. Rekening: ${transaction.destinationAccountNumber}
No. Referensi: ${transaction.biFastRef}
Status: BERHASIL`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in print:p-0 print:bg-white">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Header bar (hidden in print) */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400">Bukti Transfer Sah</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">{transaction.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Printable Canvas */}
        <div className="p-6 overflow-y-auto space-y-5 print:p-8">
          
          {/* Top Receipt Header */}
          <div className="text-center pb-4 border-b border-slate-800 print:border-slate-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 mb-3 print:bg-emerald-100 print:border-emerald-600 print:text-emerald-700">
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold text-white print:text-black">
              Transfer Berhasil & Terverifikasi
            </h3>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
              {formatDateWIB(transaction.date)}
            </p>
            <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-emerald-400 print:text-emerald-700 tabular-nums">
              {formatRupiah(transaction.amount)}
            </div>
            <p className="text-[11px] text-slate-400 print:text-slate-500 font-mono mt-1">
              Biaya Layanan {transaction.rail}: {formatRupiah(transaction.fee)} · Total Debet: {formatRupiah(transaction.total)}
            </p>
          </div>

          {/* Details Table */}
          <div className="space-y-3 text-xs bg-slate-950/60 print:bg-slate-50 p-4 rounded-2xl border border-slate-800/80 print:border-slate-200">
            
            <div className="flex justify-between items-start">
              <span className="text-slate-400 print:text-slate-600">Penerima</span>
              <div className="text-right">
                <p className="font-bold text-white print:text-black">
                  {transaction.destinationAccountHolder}
                </p>
                <p className="text-slate-400 print:text-slate-600">
                  {transaction.destinationBank.name}
                </p>
                <p className="font-mono text-slate-400 print:text-slate-700 tabular-nums">
                  {transaction.destinationAccountNumber}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800/80 print:border-slate-200 pt-2.5 flex justify-between items-start">
              <span className="text-slate-400 print:text-slate-600">Pengirim</span>
              <div className="text-right">
                <p className="font-semibold text-white print:text-black">
                  {transaction.sourceAccount.accountHolder}
                </p>
                <p className="font-mono text-slate-400 print:text-slate-600 tabular-nums">
                  {maskAccountNumber(transaction.sourceAccount.accountNumber)}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800/80 print:border-slate-200 pt-2.5 flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Mekanisme Jalur</span>
              <span className="font-semibold text-teal-400 print:text-teal-700">
                {transaction.rail === 'BI-FAST'
                  ? 'BI-FAST (Bank Indonesia Fast)'
                  : transaction.rail === 'RTGS'
                  ? 'RTGS (Real Time Gross Settlement)'
                  : transaction.rail === 'SKNBI'
                  ? 'SKNBI (Sistem Kliring Nasional BI)'
                  : 'Realtime Online Switching'}
              </span>
            </div>

            <div className="border-t border-slate-800/80 print:border-slate-200 pt-2.5 flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Kategori / Tujuan</span>
              <span className="font-medium text-slate-200 print:text-slate-800">
                {transaction.purpose}
              </span>
            </div>

            <div className="border-t border-slate-800/80 print:border-slate-200 pt-2.5 flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Berita Acara</span>
              <span className="font-medium text-slate-200 print:text-slate-800 max-w-[220px] text-right truncate">
                {transaction.note || '-'}
              </span>
            </div>

            <div className="border-t border-slate-800/80 print:border-slate-200 pt-2.5 flex justify-between">
              <span className="text-slate-400 print:text-slate-600">
                {transaction.rail === 'RTGS'
                  ? 'No. Referensi BI-RTGS'
                  : transaction.rail === 'SKNBI'
                  ? 'No. Referensi SKNBI'
                  : 'No. Referensi BI-FAST'}
              </span>
              <span className="font-mono font-semibold text-emerald-400 print:text-emerald-700 tabular-nums">
                {transaction.biFastRef}
              </span>
            </div>

            <div className="border-t border-slate-800/80 print:border-slate-200 pt-2.5 flex justify-between">
              <span className="text-slate-400 print:text-slate-600">STAN (Trace Audit)</span>
              <span className="font-mono text-slate-300 print:text-slate-700 tabular-nums">
                {transaction.stan}
              </span>
            </div>

            <div className="border-t border-slate-800/80 print:border-slate-200 pt-2.5 flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Metode Otorisasi</span>
              <span className="text-slate-300 print:text-slate-700">
                {transaction.security.authMethod === 'PIN_6_DIGIT'
                  ? 'PIN Finansial 6-Digit'
                  : transaction.security.authMethod === 'BIOMETRIC_FACE_ID'
                  ? 'Biometrik Face ID'
                  : 'Biometrik Sidik Jari'}
              </span>
            </div>
          </div>

          {/* Security & Authenticity Stamp */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between text-[11px] print:bg-emerald-50 print:border-emerald-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 print:text-emerald-700" />
              <div>
                <p className="font-bold text-white print:text-black">
                  Tanda Tangan Digital Kriptografi Sah
                </p>
                <p className="text-slate-400 print:text-slate-600">
                  {transaction.security.encryptionStandard} · {transaction.security.deviceFingerprint}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 print:text-emerald-700 font-mono text-[10px] font-bold">
                RC-00 LUNAS
              </span>
            </div>
          </div>

        </div>

        {/* Action buttons (hidden in print) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2 print:hidden">
          <button
            onClick={handleCopyText}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>Salin Data</span>
              </>
            )}
          </button>

          <button
            onClick={handleShareWA}
            className="flex-1 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Bagikan WA</span>
          </button>

          <button
            onClick={handlePrint}
            title="Cetak Bukti Transfer"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
