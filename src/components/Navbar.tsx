import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { formatRupiah } from '../utils/formatters';
import {
  ShieldCheck,
  ShieldAlert,
  PlusCircle,
  Lock,
  ChevronDown,
  User
} from 'lucide-react';

interface NavbarProps {
  onOpenTopUp: () => void;
  onOpenFreezeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTopUp, onOpenFreezeModal }) => {
  const { activeTab, setActiveTab, userAccount, securityProfile } = useBanking();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Wordmark area */}
        <div className="flex items-center gap-3">
        </div>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('transfer')}
            className={`transition-colors relative py-1 ${
              activeTab === 'transfer'
                ? 'text-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Transfer Antar Bank
            {activeTab === 'transfer' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`transition-colors relative py-1 flex items-center gap-1.5 ${
              activeTab === 'tracking'
                ? 'text-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Lacak Real-Time
            {activeTab === 'tracking' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`transition-colors relative py-1 ${
              activeTab === 'history'
                ? 'text-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Riwayat Mutasi
            {activeTab === 'history' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`transition-colors relative py-1 flex items-center gap-1 ${
              activeTab === 'security'
                ? 'text-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Pusat Keamanan
            {securityProfile.isAccountFrozen ? (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            {activeTab === 'security' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('banks')}
            className={`transition-colors relative py-1 ${
              activeTab === 'banks'
                ? 'text-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Daftar Bank
            {activeTab === 'banks' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {/* Quick Balance indicator */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Saldo Utama</span>
              <span className="text-xs sm:text-sm font-semibold text-emerald-400 tabular-nums">
                {securityProfile.isAccountFrozen ? 'DIBEKUKAN' : formatRupiah(userAccount.balance)}
              </span>
            </div>
            <button
              onClick={onOpenTopUp}
              title="Isi Saldo Tambahan"
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-emerald-400 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>

          {/* User profile dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <User className="w-4 h-4" />
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                    securityProfile.isAccountFrozen ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                />
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white truncate">{userAccount.name}</p>
                    <p className="text-slate-400 text-[11px] font-mono tabular-nums">
                      {userAccount.bankCode} · {userAccount.accountNumber}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Terverifikasi BI-FAST & Dukcapil</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveTab('security');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                    >
                      <span>Pengaturan Keamanan & PIN</span>
                      <span className="text-[10px] text-slate-400">Tingkat 4/4</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenFreezeModal();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-950/40 text-rose-400 flex items-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>
                        {securityProfile.isAccountFrozen ? 'Buka Kunci Rekening' : 'Bekukan Rekening Darurat'}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/95 py-2 px-2 text-xs">
        <button
          onClick={() => setActiveTab('transfer')}
          className={`px-2 py-1 rounded-lg ${
            activeTab === 'transfer' ? 'text-emerald-400 font-bold bg-emerald-950/40' : 'text-slate-400'
          }`}
        >
          Transfer
        </button>
        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-2 py-1 rounded-lg flex items-center gap-1 ${
            activeTab === 'tracking' ? 'text-emerald-400 font-bold bg-emerald-950/40' : 'text-slate-400'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Lacak
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-2 py-1 rounded-lg ${
            activeTab === 'history' ? 'text-emerald-400 font-bold bg-emerald-950/40' : 'text-slate-400'
          }`}
        >
          Riwayat
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-2 py-1 rounded-lg ${
            activeTab === 'security' ? 'text-emerald-400 font-bold bg-emerald-950/40' : 'text-slate-400'
          }`}
        >
          Keamanan
        </button>
        <button
          onClick={() => setActiveTab('banks')}
          className={`px-2 py-1 rounded-lg ${
            activeTab === 'banks' ? 'text-emerald-400 font-bold bg-emerald-950/40' : 'text-slate-400'
          }`}
        >
          Bank
        </button>
      </div>
    </header>
  );
};
