import React, { useState } from 'react';
import { BankingProvider, useBanking } from './context/BankingContext';
import { Navbar } from './components/Navbar';
import { TransferForm } from './components/TransferForm';
import { RealtimeTrackingView } from './components/RealtimeTrackingView';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { SecurityDashboardView } from './components/SecurityDashboardView';
import { BankDirectoryView } from './components/BankDirectoryView';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';
import { EmergencyFreezeModal } from './components/EmergencyFreezeModal';
import { QuickTopUpModal } from './components/QuickTopUpModal';
import { X } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    activeTrackingTx,
    isTrackingModalOpen,
    closeTracking,
    selectedReceiptTx,
    closeReceipt
  } = useBanking();

  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-400">
      
      {/* Top Bar Navigation */}
      <Navbar
        onOpenTopUp={() => setIsTopUpOpen(true)}
        onOpenFreezeModal={() => setIsFreezeModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'transfer' && <TransferForm />}
        {activeTab === 'tracking' && <RealtimeTrackingView />}
        {activeTab === 'history' && <TransactionHistoryView />}
        {activeTab === 'security' && (
          <SecurityDashboardView onOpenFreezeModal={() => setIsFreezeModalOpen(true)} />
        )}
        {activeTab === 'banks' && <BankDirectoryView />}
      </main>

      {/* Real-time Tracking Modal (Auto pops up when transfer begins) */}
      {isTrackingModalOpen && activeTrackingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Pelacakan Siklus BI-FAST Real-Time
                </h3>
              </div>
              <button
                onClick={closeTracking}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-2 sm:p-4">
              <RealtimeTrackingView
                initialTx={activeTrackingTx}
                isModal={true}
                onCloseModal={closeTracking}
              />
            </div>
          </div>
        </div>
      )}

      {/* Transaction Official Proof Receipt Modal */}
      <TransactionReceiptModal
        transaction={selectedReceiptTx}
        onClose={closeReceipt}
      />

      {/* Quick Top Up Modal */}
      <QuickTopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
      />

      {/* Emergency Account Freeze Modal */}
      <EmergencyFreezeModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <BankingProvider>
      <MainAppContent />
    </BankingProvider>
  );
}
