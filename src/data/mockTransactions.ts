import { TransactionRecord, SavedBeneficiary } from '../types/banking';
import { INDONESIAN_BANKS } from './indonesianBanks';

const bankBCA = INDONESIAN_BANKS.find((b) => b.id === 'bca')!;
const bankMandiri = INDONESIAN_BANKS.find((b) => b.id === 'mandiri')!;
const bankBRI = INDONESIAN_BANKS.find((b) => b.id === 'bri')!;
const bankBSI = INDONESIAN_BANKS.find((b) => b.id === 'bsi')!;
const bankJago = INDONESIAN_BANKS.find((b) => b.id === 'jago')!;

export const INITIAL_SAVED_BENEFICIARIES: SavedBeneficiary[] = [
  {
    id: 'fav-1',
    name: 'RADEN ARYA WIRATAMA',
    bankId: 'bca',
    accountNumber: '1234567890',
    alias: 'Arya (Kantor)',
    avatarColor: 'bg-blue-600',
    transferCount: 14,
    lastTransferDate: '2026-09-24T10:30:00Z'
  },
  {
    id: 'fav-2',
    name: 'SITI AMINAH RAHAYU',
    bankId: 'bca',
    accountNumber: '8830192841',
    alias: 'Ibu Aminah',
    avatarColor: 'bg-emerald-600',
    transferCount: 28,
    lastTransferDate: '2026-09-20T14:15:00Z'
  },
  {
    id: 'fav-3',
    name: 'MOHAMMAD FAJAR SIDIQ',
    bankId: 'mandiri',
    accountNumber: '1420018928374',
    alias: 'Fajar Tim Kreatif',
    avatarColor: 'bg-indigo-600',
    transferCount: 9,
    lastTransferDate: '2026-09-18T09:00:00Z'
  },
  {
    id: 'fav-4',
    name: 'MUHAMMAD ILHAM HIDAYAT',
    bankId: 'bsi',
    accountNumber: '7123984712',
    alias: 'Ilham (Keluarga)',
    avatarColor: 'bg-teal-600',
    transferCount: 6,
    lastTransferDate: '2026-09-15T19:40:00Z'
  },
  {
    id: 'fav-5',
    name: 'BAYU SAPUTRA',
    bankId: 'jago',
    accountNumber: '1082938471',
    alias: 'Bayu Freelance',
    avatarColor: 'bg-purple-600',
    transferCount: 4,
    lastTransferDate: '2026-09-10T11:20:00Z'
  }
];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'TRX-20260925-BIF-782103',
    biFastRef: 'BIF20260925014002981742',
    stan: '381920',
    date: '2026-09-25T14:22:15+07:00',
    timestamp: Date.now() - 86400000 * 1.2,
    sourceAccount: {
      accountNumber: '1680001627122',
      accountHolder: 'BARLIANTO SURONO HADI',
      bankName: 'PT Bank Mandiri (Persero) Tbk'
    },
    destinationBank: bankMandiri,
    destinationAccountNumber: '1420018928374',
    destinationAccountHolder: 'MOHAMMAD FAJAR SIDIQ',
    amount: 3500000,
    fee: 2500,
    total: 3502500,
    rail: 'BI-FAST',
    purpose: 'Bisnis & Pekerjaan',
    note: 'Pembayaran Honor Desain UI/UX September',
    status: 'COMPLETED',
    currentStageIndex: 3,
    stages: [
      {
        id: 'stage-1',
        title: 'Validasi Enkripsi & Biometrik',
        subtitle: 'Autentikasi PIN 6-Digit & Token Enkripsi Perangkat',
        networkEntity: 'Mandiri Security Gateway',
        timestamp: '14:22:15 WIB',
        status: 'completed',
        technicalCode: 'AUTH_OK_200'
      },
      {
        id: 'stage-2',
        title: 'Switching Jaringan Bank Indonesia',
        subtitle: 'Pengiriman pesan ISO 20022 via Central Switch BI-FAST',
        networkEntity: 'Bank Indonesia Fast Hub',
        timestamp: '14:22:16 WIB',
        status: 'completed',
        technicalCode: 'BIF_ACTC_ACCEPTED'
      },
      {
        id: 'stage-3',
        title: 'Kliring Bank Penerima',
        subtitle: 'Posting kredit ke rekening Bank Mandiri',
        networkEntity: 'PT Bank Mandiri (Persero) Tbk Core',
        timestamp: '14:22:17 WIB',
        status: 'completed',
        technicalCode: 'CORE_POST_SUCCESS'
      },
      {
        id: 'stage-4',
        title: 'Dana Berhasil Diterima',
        subtitle: 'Saldo efektif telah masuk ke rekening tujuan',
        networkEntity: 'Bank Mandiri Endpoint',
        timestamp: '14:22:18 WIB',
        status: 'completed',
        technicalCode: 'RC_00_SUCCESS'
      }
    ],
    security: {
      riskScore: 12,
      riskLevel: 'AMAN',
      authMethod: 'BIOMETRIC_FACE_ID',
      encryptionStandard: 'AES-256-GCM / ISO 20022',
      deviceFingerprint: 'SEC-DEV-F89A12',
      ipAddress: '182.253.140.82',
      antiPhishingVerified: true
    }
  },
  {
    id: 'TRX-20260924-BIF-649021',
    biFastRef: 'BIF20260924014008271630',
    stan: '491024',
    date: '2026-09-24T09:15:40+07:00',
    timestamp: Date.now() - 86400000 * 2.3,
    sourceAccount: {
      accountNumber: '1680001627122',
      accountHolder: 'BARLIANTO SURONO HADI',
      bankName: 'PT Bank Mandiri (Persero) Tbk'
    },
    destinationBank: bankBCA,
    destinationAccountNumber: '8830192841',
    destinationAccountHolder: 'SITI AMINAH RAHAYU',
    amount: 1200000,
    fee: 2500,
    total: 1202500,
    rail: 'BI-FAST',
    purpose: 'Keluarga',
    note: 'Uang bulanan rumah',
    status: 'COMPLETED',
    currentStageIndex: 3,
    stages: [
      {
        id: 'stage-1',
        title: 'Validasi Enkripsi & Biometrik',
        subtitle: 'Autentikasi PIN Berhasil',
        networkEntity: 'Mandiri Security Gateway',
        timestamp: '09:15:40 WIB',
        status: 'completed',
        technicalCode: 'AUTH_OK_200'
      },
      {
        id: 'stage-2',
        title: 'Switching Jaringan Bank Indonesia',
        subtitle: 'Pesan BI-FAST ISO 20022 terverifikasi',
        networkEntity: 'Bank Indonesia Fast Hub',
        timestamp: '09:15:41 WIB',
        status: 'completed',
        technicalCode: 'BIF_ACTC_ACCEPTED'
      },
      {
        id: 'stage-3',
        title: 'Kliring Bank Penerima',
        subtitle: 'Posting mutasi kredit rekening BCA',
        networkEntity: 'PT Bank Central Asia Tbk Core',
        timestamp: '09:15:42 WIB',
        status: 'completed',
        technicalCode: 'CORE_POST_SUCCESS'
      },
      {
        id: 'stage-4',
        title: 'Dana Berhasil Diterima',
        subtitle: 'Transaksi berhasil diselesaikan',
        networkEntity: 'BCA Endpoint',
        timestamp: '09:15:43 WIB',
        status: 'completed',
        technicalCode: 'RC_00_SUCCESS'
      }
    ],
    security: {
      riskScore: 8,
      riskLevel: 'AMAN',
      authMethod: 'PIN_6_DIGIT',
      encryptionStandard: 'AES-256-GCM / ISO 20022',
      deviceFingerprint: 'SEC-DEV-F89A12',
      ipAddress: '182.253.140.82',
      antiPhishingVerified: true
    }
  },
  {
    id: 'TRX-20260923-BIF-510938',
    biFastRef: 'BIF20260923014009182741',
    stan: '182930',
    date: '2026-09-23T19:45:00+07:00',
    timestamp: Date.now() - 86400000 * 3.5,
    sourceAccount: {
      accountNumber: '1680001627122',
      accountHolder: 'BARLIANTO SURONO HADI',
      bankName: 'PT Bank Mandiri (Persero) Tbk'
    },
    destinationBank: bankBSI,
    destinationAccountNumber: '7123984712',
    destinationAccountHolder: 'MUHAMMAD ILHAM HIDAYAT',
    amount: 500000,
    fee: 2500,
    total: 502500,
    rail: 'BI-FAST',
    purpose: 'Zakat & Donasi',
    note: 'Infaq & sedekah jumat berkah',
    status: 'COMPLETED',
    currentStageIndex: 3,
    stages: [
      {
        id: 'stage-1',
        title: 'Validasi Enkripsi & Biometrik',
        subtitle: 'Autentikasi PIN Berhasil',
        networkEntity: 'Mandiri Security Gateway',
        timestamp: '19:45:00 WIB',
        status: 'completed',
        technicalCode: 'AUTH_OK_200'
      },
      {
        id: 'stage-2',
        title: 'Switching Jaringan Bank Indonesia',
        subtitle: 'BI-FAST Settlement',
        networkEntity: 'Bank Indonesia Fast Hub',
        timestamp: '19:45:01 WIB',
        status: 'completed',
        technicalCode: 'BIF_ACTC_ACCEPTED'
      },
      {
        id: 'stage-3',
        title: 'Kliring Bank Penerima',
        subtitle: 'Posting mutasi kredit BSI',
        networkEntity: 'PT Bank Syariah Indonesia Core',
        timestamp: '19:45:02 WIB',
        status: 'completed',
        technicalCode: 'CORE_POST_SUCCESS'
      },
      {
        id: 'stage-4',
        title: 'Dana Berhasil Diterima',
        subtitle: 'Transaksi berhasil diselesaikan',
        networkEntity: 'BSI Endpoint',
        timestamp: '19:45:03 WIB',
        status: 'completed',
        technicalCode: 'RC_00_SUCCESS'
      }
    ],
    security: {
      riskScore: 5,
      riskLevel: 'AMAN',
      authMethod: 'BIOMETRIC_FINGERPRINT',
      encryptionStandard: 'AES-256-GCM / ISO 20022',
      deviceFingerprint: 'SEC-DEV-F89A12',
      ipAddress: '182.253.140.82',
      antiPhishingVerified: true
    }
  },
  {
    id: 'TRX-20260921-ONL-409182',
    biFastRef: 'SWT20260921901827461920',
    stan: '849201',
    date: '2026-09-21T11:05:12+07:00',
    timestamp: Date.now() - 86400000 * 5.1,
    sourceAccount: {
      accountNumber: '1680001627122',
      accountHolder: 'BARLIANTO SURONO HADI',
      bankName: 'PT Bank Mandiri (Persero) Tbk'
    },
    destinationBank: bankBRI,
    destinationAccountNumber: '020601002345501',
    destinationAccountHolder: 'HENDRA PRASETYO',
    amount: 8500000,
    fee: 6500,
    total: 8506500,
    rail: 'REALTIME_ONLINE',
    purpose: 'Bisnis & Pekerjaan',
    note: 'Pelunasan invoice percetakan brosur',
    status: 'COMPLETED',
    currentStageIndex: 3,
    stages: [
      {
        id: 'stage-1',
        title: 'Validasi Enkripsi & Biometrik',
        subtitle: 'Autentikasi PIN Berhasil',
        networkEntity: 'Mandiri Security Gateway',
        timestamp: '11:05:12 WIB',
        status: 'completed',
        technicalCode: 'AUTH_OK_200'
      },
      {
        id: 'stage-2',
        title: 'Switching Jaringan Bersama / Prima',
        subtitle: 'Interkoneksi switching nasional',
        networkEntity: 'Jaringan PRIMA / ALTO Hub',
        timestamp: '11:05:13 WIB',
        status: 'completed',
        technicalCode: 'SWT_00_APPROVED'
      },
      {
        id: 'stage-3',
        title: 'Kliring Bank Penerima',
        subtitle: 'Posting mutasi kredit BRI',
        networkEntity: 'PT Bank Rakyat Indonesia Core',
        timestamp: '11:05:14 WIB',
        status: 'completed',
        technicalCode: 'CORE_POST_SUCCESS'
      },
      {
        id: 'stage-4',
        title: 'Dana Berhasil Diterima',
        subtitle: 'Transaksi berhasil diselesaikan',
        networkEntity: 'BRI Endpoint',
        timestamp: '11:05:15 WIB',
        status: 'completed',
        technicalCode: 'RC_00_SUCCESS'
      }
    ],
    security: {
      riskScore: 18,
      riskLevel: 'AMAN',
      authMethod: 'PIN_6_DIGIT',
      encryptionStandard: 'AES-256-GCM / ISO 8583',
      deviceFingerprint: 'SEC-DEV-F89A12',
      ipAddress: '182.253.140.82',
      antiPhishingVerified: true
    }
  }
];
