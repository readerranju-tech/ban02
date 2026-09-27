import React, { useState, useEffect } from 'react';
import { useBanking } from '../context/BankingContext';
import { TransactionRecord, TrackingStage } from '../types/banking';
import { formatRupiah, formatDateWIB } from '../utils/formatters';
import {
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Building2,
  Cpu,
  RefreshCw,
  ExternalLink,
  Zap,
  Radio,
  Trash2,
  XCircle,
  AlertTriangle,
  Send,
  X,
  Play,
  RotateCcw,
  FastForward,
  Timer
} from 'lucide-react';

interface RealtimeTrackingViewProps {
  initialTx?: TransactionRecord | null;
  isModal?: boolean;
  onCloseModal?: () => void;
}

function formatMMSS(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getPhaseSubstatus(percent: number, isDone: boolean): string {
  if (isDone) return 'Tahap selesai dan seluruh parameter audit telah terverifikasi 100%.';
  if (percent === 0) return 'Menunggu antrean antarmuka perbankan (Estimasi 1 Menit)...';
  if (percent < 25) return 'Inisialisasi handshake aman & sinkronisasi kunci sesi TLS 1.3...';
  if (percent < 50) return 'Pembuatan tanda tangan digital kriptografi & enkripsi pesan ISO 20022...';
  if (percent < 75) return 'Validasi konsensus node antarbank & verifikasi kepatuhan switching...';
  if (percent < 99) return 'Pencatatan mutasi kredit ledger & sinkronisasi audit trace Bank Indonesia...';
  return 'Finalisasi validasi tahap perbankan (100%).';
}

export const RealtimeTrackingView: React.FC<RealtimeTrackingViewProps> = ({
  initialTx,
  isModal = false,
  onCloseModal
}) => {
  const {
    transactions,
    activeTrackingTx,
    openReceipt,
    findTransactionByRef,
    deleteTransaction,
    clearActiveTracking,
    setActiveTab,
    trackingSpeedMultiplier,
    setTrackingSpeedMultiplier,
    restartTrackingSimulation,
    completeTrackingInstantly
  } = useBanking();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Priority: initialTx -> activeTrackingTx -> most recent transaction
  const [currentTx, setCurrentTx] = useState<TransactionRecord | null>(() => {
    return initialTx || activeTrackingTx || transactions[0] || null;
  });

  // Keep currentTx synced if activeTrackingTx changes
  useEffect(() => {
    if (activeTrackingTx) {
      setCurrentTx(activeTrackingTx);
    }
  }, [activeTrackingTx]);

  // Keep currentTx synchronized with transactions array (for live percentage animation & status)
  useEffect(() => {
    if (currentTx) {
      const match = transactions.find((t) => t.id === currentTx.id);
      if (match) {
        setCurrentTx(match);
      } else {
        setCurrentTx(transactions[0] || null);
      }
    }
  }, [transactions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    if (!searchQuery.trim()) return;

    const found = findTransactionByRef(searchQuery);
    if (found) {
      setCurrentTx(found);
      setSearchError('');
    } else {
      setSearchError('Nomor referensi atau ID transaksi tidak ditemukan di sistem.');
    }
  };

  const handleDeleteCurrent = () => {
    if (currentTx) {
      deleteTransaction(currentTx.id);
      setIsConfirmDeleteOpen(false);
      clearActiveTracking();
      if (onCloseModal) {
        onCloseModal();
      }
    }
  };

  const handleClearView = () => {
    setCurrentTx(null);
    clearActiveTracking();
    if (onCloseModal) {
      onCloseModal();
    }
  };

  const isCompleted = currentTx?.status === 'COMPLETED';

  // Calculate overall transaction lifecycle completion percentage (0 - 100%)
  const overallPercentage = currentTx
    ? Math.round(
        currentTx.stages.reduce((acc, stage) => {
          if (stage.status === 'completed') return acc + 100;
          if (stage.status === 'processing') return acc + (stage.progressPercent || 0);
          return acc;
        }, 0) / currentTx.stages.length
      )
    : 0;

  return (
    <div className={`space-y-6 ${isModal ? 'p-1 sm:p-2' : 'max-w-5xl mx-auto py-6 px-4'}`}>
      
      {/* Header section (if not in modal) */}
      {!isModal && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Pelacakan Transaksi Real-Time
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Pantau siklus perpindahan dana antar bank melalui jaringan switching BI-FAST dengan animasi persentase real-time 1 menit per tahap.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Node BI-FAST Gateway:</span>
            <span className="text-emerald-400 font-mono font-semibold">ONLINE (0.4s Latency)</span>
          </div>
        </div>
      )}

      {/* Real-time Reference Search Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Masukkan ID Transaksi (misal: TRX-2026...) atau No. Referensi BI-FAST (BIF...)"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shrink-0 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <Search className="w-4 h-4" />
            <span>Lacak Status</span>
          </button>
        </form>

        {searchError && (
          <p className="text-xs text-rose-400 font-medium mt-2">{searchError}</p>
        )}

        {/* Quick Recent Selection */}
        {transactions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-slate-500 shrink-0 text-[11px]">Transaksi Terakhir:</span>
            {transactions.slice(0, 4).map((tx) => (
              <button
                key={tx.id}
                onClick={() => {
                  setCurrentTx(tx);
                  setSearchError('');
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  currentTx?.id === tx.id
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800/70 text-slate-400 hover:text-white'
                }`}
              >
                <span>{tx.destinationBank.shortName} · {formatRupiah(tx.amount)}</span>
              </button>
            ))}
            {currentTx && (
              <button
                onClick={handleClearView}
                className="ml-auto px-2 py-1 text-[11px] text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                title="Tutup / bersihkan tampilan pelacakan saat ini"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Bersihkan Layar</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Tracking Details Canvas */}
      {currentTx ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
          
          {/* Top Overview Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">ID: {currentTx.id}</span>
                <span className="text-slate-600">·</span>
                <span className="text-xs font-semibold text-teal-400">{currentTx.rail}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {formatRupiah(currentTx.amount)}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ke {currentTx.destinationAccountHolder} ({currentTx.destinationBank.name})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="text-left sm:text-right mr-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Status Transaksi
                </span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1 bg-slate-950 border border-slate-800">
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">SUKSES / LUNAS</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                      <span className="text-teal-400">SEDANG BERJALAN</span>
                    </>
                  )}
                </div>
              </div>

              {isCompleted && (
                <button
                  onClick={() => openReceipt(currentTx)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Lihat Bukti</span>
                </button>
              )}

              {/* Delete transaction & tracking button */}
              <button
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                title="Hapus transaksi ini dari pelacakan dan mutasi"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Hapus Pelacakan</span>
              </button>
            </div>
          </div>

          {/* Visual Routing Map: Source -> Central Switch -> Destination */}
          <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-3">
              Visualisasi Rute Jaringan Pembayaran
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              
              {/* Origin Hop */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-600/40 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                  MDR
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block">Bank Asal Pengirim</span>
                  <p className="text-xs font-bold text-white truncate">
                    {currentTx.sourceAccount.bankName}
                  </p>
                  <p className="text-[10px] font-mono text-emerald-400 mt-0.5">
                    Mutasi Debet: OK
                  </p>
                </div>
              </div>

              {/* Central Switch Hop */}
              <div className="p-3 rounded-xl bg-slate-900 border border-teal-500/30 flex items-center gap-3 relative">
                <div className="w-10 h-10 rounded-xl bg-teal-950/80 border border-teal-500/50 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                  <Zap className="w-5 h-5 text-teal-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-teal-400 block font-semibold">Central Switching Hub</span>
                  <p className="text-xs font-bold text-white truncate">
                    {currentTx.rail === 'BI-FAST'
                      ? 'BI-FAST (Bank Indonesia)'
                      : currentTx.rail === 'RTGS'
                      ? 'BI-RTGS (Bank Indonesia)'
                      : currentTx.rail === 'SKNBI'
                      ? 'SKNBI Clearing House (Bank Indonesia)'
                      : 'Jaringan PRIMA / ALTO Hub'}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Protokol:{' '}
                    {currentTx.rail === 'RTGS'
                      ? 'BI-RTGS Gross Settlement'
                      : currentTx.rail === 'SKNBI'
                      ? 'SKNBI Batch Gen-2'
                      : currentTx.rail === 'BI-FAST'
                      ? 'ISO 20022 MX'
                      : 'ISO 8583 Online Switch'}
                  </p>
                </div>
              </div>

              {/* Destination Hop */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow"
                  style={{ backgroundColor: currentTx.destinationBank.color }}
                >
                  {currentTx.destinationBank.logoText}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block">Bank Tujuan Penerima</span>
                  <p className="text-xs font-bold text-white truncate">
                    {currentTx.destinationBank.name}
                  </p>
                  <p className="text-[10px] font-mono text-emerald-400 mt-0.5">
                    {isCompleted ? 'Kredit Terposting: OK' : 'Menunggu Settlement'}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Overall Cycle Progress Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950/40 border border-teal-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-teal-400 animate-spin" />
                <span className="text-xs font-bold text-white">
                  Siklus Pelacakan Audit: Durasi 1 Menit per Tahap
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  Total 4 Tahap
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Total Progres:</span>
                <span className="font-mono font-extrabold text-teal-300 text-sm">
                  {overallPercentage}%
                </span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800/90 relative">
              <div
                className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-emerald-300 rounded-full transition-all duration-700 ease-out shadow-sm shadow-emerald-400/30"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>

            {/* Controls Bar: Restart Simulation / Speed Toggle */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => restartTrackingSimulation(currentTx.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium flex items-center gap-1.5 transition-colors border border-slate-700 text-[11px]"
                  title="Mulai ulang simulasi rangkaian audit dengan durasi 1 menit per tahap dari awal"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
                  <span>Ulangi Pelacakan (1 Menit/Tahap)</span>
                </button>

                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => completeTrackingInstantly(currentTx.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-600/40 text-emerald-300 font-medium flex items-center gap-1.5 transition-colors text-[11px]"
                    title="Langsung selesaikan seluruh tahap pelacakan 100%"
                  >
                    <FastForward className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Selesaikan Seketika</span>
                  </button>
                )}
              </div>

              {/* Speed multiplier selector */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-400">Kecepatan:</span>
                <button
                  type="button"
                  onClick={() => setTrackingSpeedMultiplier(1)}
                  className={`px-2 py-1 rounded-lg font-mono transition-colors ${
                    trackingSpeedMultiplier === 1
                      ? 'bg-teal-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Kecepatan normal (60 detik per tahap)"
                >
                  1 Menit (Standar)
                </button>
                <button
                  type="button"
                  onClick={() => setTrackingSpeedMultiplier(6)}
                  className={`px-2 py-1 rounded-lg font-mono transition-colors ${
                    trackingSpeedMultiplier === 6
                      ? 'bg-teal-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Percepat menjadi 10 detik per tahap"
                >
                  6x (10 dtk)
                </button>
              </div>
            </div>
          </div>

          {/* Real-time 4-Stage Lifecycle Progression */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Rangkaian Tahapan Audit & Pelacakan</span>
                <span className="text-[11px] font-normal text-slate-400">
                  (Setiap tahap berdurasi 1 menit dengan animasi persen real-time)
                </span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Tahap {currentTx.currentStageIndex + 1} dari 4
              </span>
            </div>

            {/* Stage Timeline */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {currentTx.stages.map((stage: TrackingStage, idx: number) => {
                const isStageDone = stage.status === 'completed';
                const isStageActive = stage.status === 'processing';
                const isStagePending = stage.status === 'pending';

                const percent = isStageDone ? 100 : isStageActive ? stage.progressPercent || 0 : 0;
                const elapsedSec = isStageDone ? 60 : isStageActive ? stage.elapsedSeconds || 0 : 0;
                const remainingSec = Math.max(0, 60 - elapsedSec);

                return (
                  <div key={stage.id} className="relative group">
                    {/* Stage Bullet */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-0.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                        isStageDone
                          ? 'bg-emerald-950 border-2 border-emerald-400 text-emerald-400 shadow-md shadow-emerald-900/40'
                          : isStageActive
                          ? 'bg-teal-950 border-2 border-teal-400 text-teal-400 ring-4 ring-teal-500/20'
                          : 'bg-slate-900 border-2 border-slate-700 text-slate-600'
                      }`}
                    >
                      {isStageDone ? (
                        <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
                      ) : isStageActive ? (
                        <RefreshCw className="w-3.5 sm:w-4 h-3.5 sm:h-4 animate-spin text-teal-400" />
                      ) : (
                        <span className="text-[11px] font-mono font-bold">{idx + 1}</span>
                      )}
                    </div>

                    {/* Stage Content Card */}
                    <div
                      className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                        isStageActive
                          ? 'bg-gradient-to-br from-teal-950/40 via-slate-950/80 to-slate-900 border-teal-500/50 shadow-xl ring-1 ring-teal-500/30'
                          : isStageDone
                          ? 'bg-slate-950/50 border-slate-800/90'
                          : 'bg-slate-950/20 border-slate-800/40 opacity-70'
                      }`}
                    >
                      {/* Stage Header & Animated Percent Indicator */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            {stage.title}
                          </h4>
                          {isStageActive && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                              PROSES REAL-TIME (1 MENIT)
                            </span>
                          )}
                        </div>

                        {/* Animated Percentage Badge */}
                        <div className="flex items-center gap-2">
                          {isStageDone ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>100% Selesai</span>
                            </div>
                          ) : isStageActive ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-950 border border-teal-400/60 shadow-lg shadow-teal-950 text-teal-300 font-mono font-extrabold text-sm sm:text-base">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                              <span className="tabular-nums">{percent}%</span>
                            </div>
                          ) : (
                            <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-mono text-xs">
                              0% Menunggu
                            </div>
                          )}

                          {stage.timestamp && (
                            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                              {stage.timestamp}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stage Description */}
                      <p className="text-xs text-slate-300">
                        {stage.subtitle}
                      </p>

                      {/* ANIMATED PROGRESS BAR (0% to 100% over 1 minute) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-teal-400" />
                            {isStageDone ? (
                              <span className="text-emerald-400">Durasi: 01:00 Selesai (60 dtk)</span>
                            ) : isStageActive ? (
                              <span className="text-teal-300">
                                Berjalan: {formatMMSS(elapsedSec)} / 01:00 (Sisa {remainingSec} dtk)
                              </span>
                            ) : (
                              <span>Estimasi Durasi: 1 Menit (01:00)</span>
                            )}
                          </span>
                          <span className="font-bold text-white tabular-nums">
                            {percent}%
                          </span>
                        </div>

                        {/* Progress track */}
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80 relative">
                          <div
                            className={`h-full rounded-full transition-all ease-linear ${
                              isStageDone
                                ? 'bg-emerald-500 duration-500'
                                : isStageActive
                                ? 'bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 duration-1000 shadow-md shadow-teal-500/40'
                                : 'bg-slate-800 duration-300'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {/* Dynamic micro-phase description during 1-minute run */}
                        <p className="text-[11px] text-teal-400/90 italic flex items-center gap-1.5 pt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                          <span>{getPhaseSubstatus(percent, isStageDone)}</span>
                        </p>
                      </div>

                      {/* Node & Technical Response Details */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-slate-400" />
                          Node: {stage.networkEntity}
                        </span>
                        {stage.technicalCode && (
                          <span className="font-mono text-slate-400">
                            Respon: {stage.technicalCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technical Trace Audit Information Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Data Teknis Audit BI-FAST (ISO 20022)
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                End-to-End TLS 1.3
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">No. Ref BI-FAST</span>
                <span className="text-slate-300 truncate block">{currentTx.biFastRef}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">STAN</span>
                <span className="text-slate-300 block">{currentTx.stan}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Perangkat Audit</span>
                <span className="text-slate-300 block">{currentTx.security.deviceFingerprint}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Skor Risiko</span>
                <span className="text-emerald-400 block font-bold">
                  {currentTx.security.riskScore}/100 ({currentTx.security.riskLevel})
                </span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 sm:p-12 text-center">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Tidak Ada Pelacakan Aktif</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            {transactions.length === 0
              ? 'Seluruh riwayat transaksi telah dihapus. Lakukan transfer baru untuk mulai melacak perpindahan dana secara real-time.'
              : 'Gunakan kotak pencarian di atas untuk memasukkan nomor referensi BI-FAST atau pilih transaksi dari riwayat Anda.'}
          </p>
          <button
            onClick={() => setActiveTab('transfer')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Mulai Transfer Baru</span>
          </button>
        </div>
      )}

      {/* Confirmation Modal: Delete from Tracking */}
      {isConfirmDeleteOpen && currentTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-white text-base">Hapus Pelacakan Transaksi</h3>
              </div>
              <button
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Apakah Anda yakin ingin menghapus data pelacakan transaksi ini? Transaksi ini juga akan dihapus dari riwayat mutasi Anda.
              </p>
              
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Penerima</span>
                  <span className="font-semibold text-white truncate max-w-[200px]">
                    {currentTx.destinationAccountHolder}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nominal Transfer</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatRupiah(currentTx.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">No. Referensi</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {currentTx.biFastRef}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteCurrent}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-950/40 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
