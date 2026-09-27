import React, { useState, useMemo } from 'react';
import { useBanking } from '../context/BankingContext';
import { TransactionRecord, TransactionStatus } from '../types/banking';
import { formatRupiah, formatDateShort } from '../utils/formatters';
import {
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileText,
  Download,
  Trash2,
  AlertTriangle,
  X,
  Send
} from 'lucide-react';

export const TransactionHistoryView: React.FC = () => {
  const {
    transactions,
    openTrackingFor,
    openReceipt,
    deleteTransaction,
    clearAllTransactions,
    setActiveTab
  } = useBanking();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TransactionStatus>('ALL');

  // Modal confirmation states
  const [txToDelete, setTxToDelete] = useState<TransactionRecord | null>(null);
  const [isConfirmClearAllOpen, setIsConfirmClearAllOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesStatus =
        statusFilter === 'ALL' || tx.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tx.destinationAccountHolder.toLowerCase().includes(q) ||
        tx.destinationAccountNumber.includes(q) ||
        tx.destinationBank.shortName.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q) ||
        tx.biFastRef.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [transactions, statusFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['ID Transaksi', 'No Ref BI-FAST', 'Tanggal (WIB)', 'Penerima', 'Bank Tujuan', 'No Rekening', 'Nominal', 'Biaya', 'Total', 'Jalur', 'Status'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.biFastRef,
      new Date(tx.date).toLocaleString('id-ID'),
      `"${tx.destinationAccountHolder}"`,
      `"${tx.destinationBank.name}"`,
      tx.destinationAccountNumber,
      tx.amount,
      tx.fee,
      tx.total,
      tx.rail,
      tx.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mutasi_transfer_bank_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmDeleteSingle = () => {
    if (txToDelete) {
      deleteTransaction(txToDelete.id);
      setTxToDelete(null);
    }
  };

  const handleConfirmClearAll = () => {
    clearAllTransactions();
    setIsConfirmClearAllOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header and Export / Clear Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Riwayat Mutasi & Transaksi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Daftar lengkap transaksi transfer dana antar bank dengan kontrol penghapusan mutasi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {transactions.length > 0 && (
            <button
              onClick={() => setIsConfirmClearAllOpen(true)}
              className="px-3.5 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-rose-800/60 transition-colors shadow-sm"
              title="Hapus seluruh riwayat mutasi transaksi"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Hapus Semua Mutasi</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-800 shadow-sm transition-colors shrink-0"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Laporan (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama penerima, no rekening, bank, atau no referensi..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              Semua Mutasi
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              Berhasil
            </button>
            <button
              onClick={() => setStatusFilter('CLEARING_SETTLEMENT')}
              className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'CLEARING_SETTLEMENT'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              Diproses Real-time
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden divide-y divide-slate-800/60">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">Tidak Ada Transaksi</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {transactions.length === 0
                ? 'Seluruh riwayat mutasi transaksi telah dibersihkan. Anda dapat membuat transaksi baru kapan saja.'
                : 'Tidak ditemukan data transaksi yang sesuai dengan filter pencarian.'}
            </p>
            {transactions.length === 0 && (
              <button
                onClick={() => setActiveTab('transfer')}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Mulai Transfer Baru</span>
              </button>
            )}
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isDone = tx.status === 'COMPLETED';

            return (
              <div
                key={tx.id}
                className="p-4 sm:p-5 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left side info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md"
                    style={{ backgroundColor: tx.destinationBank.color }}
                  >
                    {tx.destinationBank.logoText}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white truncate">
                        {tx.destinationAccountHolder}
                      </h3>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400">
                        {tx.destinationBank.shortName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono tabular-nums">{tx.destinationAccountNumber}</span>
                      <span>·</span>
                      <span>{formatDateShort(tx.date)}</span>
                      <span>·</span>
                      <span className="text-teal-400 font-semibold">{tx.rail}</span>
                    </div>

                    {tx.note && (
                      <p className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5 italic">
                        &quot;{tx.note}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side amount and actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
                  <div className="text-left sm:text-right">
                    <p className="text-sm sm:text-base font-bold text-white font-mono tabular-nums">
                      - {formatRupiah(tx.amount)}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Biaya: {formatRupiah(tx.fee)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Live status badge */}
                    <button
                      onClick={() => openTrackingFor(tx)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Klik untuk melacak perjalanan dana secara real-time"
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Sukses</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                          <span className="text-teal-400">Lacak</span>
                        </>
                      )}
                    </button>

                    {/* Receipt button */}
                    {isDone && (
                      <button
                        onClick={() => openReceipt(tx)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Lihat Bukti Transfer Sah"
                      >
                        <FileText className="w-4 h-4 text-emerald-400" />
                      </button>
                    )}

                    {/* Delete single mutation button */}
                    <button
                      onClick={() => setTxToDelete(tx)}
                      className="p-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/70 border border-slate-800/80 hover:border-rose-800/80 text-slate-400 hover:text-rose-300 transition-colors"
                      title="Hapus riwayat mutasi transaksi ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal: Delete Single Mutation */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-white text-base">Hapus Catatan Mutasi</h3>
              </div>
              <button
                onClick={() => setTxToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Apakah Anda yakin ingin menghapus catatan mutasi transaksi ini dari riwayat dan pelacakan?
              </p>
              
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Penerima</span>
                  <span className="font-semibold text-white truncate max-w-[200px]">
                    {txToDelete.destinationAccountHolder}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rekening Tujuan</span>
                  <span className="font-mono text-slate-200">
                    {txToDelete.destinationBank.shortName} · {txToDelete.destinationAccountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nominal Transfer</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatRupiah(txToDelete.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">No. Referensi</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {txToDelete.biFastRef}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                *Catatan: Penghapusan ini bersifat permanen pada riwayat aplikasi Anda.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTxToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSingle}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-950/40 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Mutasi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear All Mutations */}
      {isConfirmClearAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-white text-base">Hapus Semua Riwayat Mutasi</h3>
              </div>
              <button
                onClick={() => setIsConfirmClearAllOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Anda akan menghapus <span className="font-bold text-white">{transactions.length} transaksi</span> dari seluruh riwayat mutasi dan pelacakan real-time.
              </p>
              <div className="p-3 bg-rose-950/30 border border-rose-800/50 rounded-xl text-rose-300 text-[11px] leading-relaxed">
                Peringatan: Seluruh arsip bukti transfer dan riwayat pelacakan siklus switching yang tersimpan di perangkat ini akan dikosongkan.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmClearAllOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-950/40 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Semua</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
