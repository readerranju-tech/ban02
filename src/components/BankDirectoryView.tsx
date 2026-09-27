import React, { useState, useMemo } from 'react';
import { useBanking } from '../context/BankingContext';
import { Bank, BankCategory } from '../types/banking';
import { INDONESIAN_BANKS } from '../data/indonesianBanks';
import { formatRupiah } from '../utils/formatters';
import {
  Search,
  Building2,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';

const CATEGORIES: ('Semua' | BankCategory)[] = [
  'Semua',
  'BUMN & Nasional',
  'Swasta Nasional',
  'Bank Syariah',
  'Bank Digital',
  'BPD (Bank Daerah)',
  'Dompet Digital'
];

export const BankDirectoryView: React.FC = () => {
  const { setActiveTab } = useBanking();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | BankCategory>('Semua');

  const filteredBanks = useMemo(() => {
    return INDONESIAN_BANKS.filter((bank) => {
      const matchesCategory =
        selectedCategory === 'Semua' || bank.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        bank.name.toLowerCase().includes(q) ||
        bank.shortName.toLowerCase().includes(q) ||
        bank.code.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Direktori Bank Seluruh Indonesia
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Katalog lengkap bank peserta BI-FAST, Sandi Bank Kliring, dan status operasional interkoneksi switching 24/7.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Terhubung ke {INDONESIAN_BANKS.length} Institusi Finansial</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama bank, singkatan (BCA, Mandiri, BJB, Jago), atau kode bank (014, 002)..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bank Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBanks.map((bank) => (
          <div
            key={bank.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow"
                    style={{ backgroundColor: bank.color }}
                  >
                    {bank.logoText}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                      {bank.shortName}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      Sandi Bank: <strong className="text-white">{bank.code}</strong>
                    </span>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-medium">
                  {bank.category}
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2">
                {bank.name}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Jalur BI-FAST:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    Mendukung 24/7
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Maksimum BI-FAST:</span>
                  <span className="font-mono text-slate-300">
                    {formatRupiah(bank.maxTransferBiFast)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status Jaringan:</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Normal (Operasional)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('transfer')}
              className="mt-4 w-full py-2 bg-slate-800/80 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Kirim Uang Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
