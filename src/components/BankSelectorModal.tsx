import React, { useState, useMemo } from 'react';
import { Bank, BankCategory } from '../types/banking';
import { INDONESIAN_BANKS } from '../data/indonesianBanks';
import { Search, X, Check, Zap } from 'lucide-react';

interface BankSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBank: (bank: Bank) => void;
  selectedBankId?: string;
}

const CATEGORIES: ('Semua' | BankCategory)[] = [
  'Semua',
  'BUMN & Nasional',
  'Swasta Nasional',
  'Bank Syariah',
  'Bank Digital',
  'BPD (Bank Daerah)',
  'Dompet Digital'
];

export const BankSelectorModal: React.FC<BankSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectBank,
  selectedBankId
}) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Pilih Bank Tujuan Transfer
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Mendukung seluruh bank komersial, syariah, digital, dan daerah di Indonesia
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama bank, singkatan (BCA, Mandiri, BSI, Jago), atau kode bank..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Category filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Bank List */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-800/40 space-y-1">
          {filteredBanks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 text-sm font-medium">Bank tidak ditemukan</p>
              <p className="text-slate-500 text-xs mt-1">
                Coba gunakan kata kunci lain atau pilih kategori &quot;Semua&quot;
              </p>
            </div>
          ) : (
            filteredBanks.map((bank) => {
              const isSelected = selectedBankId === bank.id;
              return (
                <button
                  key={bank.id}
                  onClick={() => {
                    onSelectBank(bank);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all group ${
                    isSelected
                      ? 'bg-emerald-950/40 border border-emerald-500/40'
                      : 'hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md"
                      style={{ backgroundColor: bank.color }}
                    >
                      {bank.logoText}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors truncate">
                          {bank.shortName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                          Kode: {bank.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-sm mt-0.5">
                        {bank.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {bank.biFastSupported && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-teal-400 font-medium">
                        <Zap className="w-3 h-3 text-teal-400" />
                        BI-FAST
                      </span>
                    )}
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Menampilkan {filteredBanks.length} institusi perbankan</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Switching BI-FAST Aktif 24/7
          </span>
        </div>

      </div>
    </div>
  );
};
