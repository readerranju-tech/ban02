export type BankCategory =
  | 'BUMN & Nasional'
  | 'Swasta Nasional'
  | 'Bank Syariah'
  | 'Bank Digital'
  | 'BPD (Bank Daerah)'
  | 'Dompet Digital';

export type TransferRail = 'BI-FAST' | 'REALTIME_ONLINE' | 'RTGS' | 'SKNBI';

export interface Bank {
  id: string;
  code: string;
  name: string;
  shortName: string;
  category: BankCategory;
  color: string;
  badgeColor: string;
  biFastSupported: boolean;
  rtgsSupported: boolean;
  minTransfer: number;
  maxTransferBiFast: number;
  operationalStatus: 'NORMAL' | 'MAINTENANCE' | 'HIGH_TRAFFIC';
  logoText: string;
}

export type TransactionStatus =
  | 'PENDING_VALIDATION'
  | 'SWITCHING_NETWORK'
  | 'CLEARING_SETTLEMENT'
  | 'COMPLETED'
  | 'FAILED'
  | 'SCHEDULED'
  | 'CANCELLED';

export interface TrackingStage {
  id: string;
  title: string;
  subtitle: string;
  networkEntity: string;
  timestamp?: string;
  status: 'completed' | 'processing' | 'pending' | 'failed';
  technicalCode?: string;
  progressPercent?: number; // 0 to 100
  durationSeconds?: number; // 60 seconds (1 minute per stage)
  elapsedSeconds?: number;
}

export interface SecurityAudit {
  riskScore: number; // 0 - 100 (lower is safer)
  riskLevel: 'AMAN' | 'WASPADA' | 'BERBAHAYA';
  authMethod: 'PIN_6_DIGIT' | 'BIOMETRIC_FACE_ID' | 'BIOMETRIC_FINGERPRINT';
  encryptionStandard: string;
  deviceFingerprint: string;
  ipAddress: string;
  antiPhishingVerified: boolean;
}

export interface TransactionRecord {
  id: string;
  biFastRef: string;
  stan: string; // System Trace Audit Number (6 digits)
  date: string;
  timestamp: number;
  sourceAccount: {
    accountNumber: string;
    accountHolder: string;
    bankName: string;
  };
  destinationBank: Bank;
  destinationAccountNumber: string;
  destinationAccountHolder: string;
  amount: number;
  fee: number;
  total: number;
  rail: TransferRail;
  purpose: string;
  note: string;
  status: TransactionStatus;
  stages: TrackingStage[];
  currentStageIndex: number;
  security: SecurityAudit;
}

export interface SavedBeneficiary {
  id: string;
  name: string;
  bankId: string;
  accountNumber: string;
  alias?: string;
  avatarColor: string;
  transferCount: number;
  lastTransferDate?: string;
}

export interface UserSecurityProfile {
  pin: string;
  isScrambledKeypad: boolean;
  isBiometricEnabled: boolean;
  biometricType: 'FACE_ID' | 'FINGERPRINT';
  dailyTransferLimit: number;
  usedTodayLimit: number;
  requireOtpForLargeTx: boolean;
  largeTxThreshold: number;
  isAccountFrozen: boolean;
  frozenAt?: string;
  freezeReason?: string;
}
