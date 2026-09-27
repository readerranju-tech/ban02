import { SecurityAudit } from '../types/banking';

// Preset verified account directory for authentic Indonesian bank inquiry simulation
export const KNOWN_ACCOUNTS: Record<string, string> = {
  // Akun Terverifikasi Khusus
  '008-1390035048689': 'MUHAMMAD DZIYAAUL HAQQI',
  '1390035048689': 'MUHAMMAD DZIYAAUL HAQQI',
  '008-1800013815750': 'KHAERUNASIKIN',
  '1800013815750': 'KHAERUNASIKIN',
  '008-166003122439': 'LILIANA',
  '166003122439': 'LILIANA',
  '008-1660003122439': 'LILIANA',
  '1660003122439': 'LILIANA',

  // BCA
  '014-1234567890': 'RADEN ARYA WIRATAMA',
  '014-8830192841': 'SITI AMINAH RAHAYU',
  '014-5540918234': 'PT TOKOPEDIA NUSANTARA',
  // Mandiri
  '008-1680001627122': 'BARLIANTO SURONO HADI',
  '008-1420018928374': 'MOHAMMAD FAJAR SIDIQ',
  '008-1370029384712': 'DEWI LESTARI KUSUMA',
  // BRI
  '002-020601002345501': 'HENDRA PRASETYO',
  '002-330101019283509': 'KOPERASI SIMPAN PINJAM MAJU',
  // BNI
  '009-0829103948': 'DR. ANGGIE PRATIWI',
  // BSI
  '451-7123984712': 'MUHAMMAD ILHAM HIDAYAT',
  // Jago
  '542-1082938471': 'BAYU SAPUTRA',
  // SeaBank
  '535-9012837461': 'RINA ANGGRAENI',
  // CIMB
  '022-7061928374': 'FARHAN AL-RASYID',
  // DANA
  '3901-081234567890': 'DANA BALANCE - AHMAD',
  // GoPay
  '70001-081298765432': 'GOPAY BALANCE - NURUL'
};

const INDONESIAN_FIRST_NAMES = ['BAMBANG', 'AGUS', 'DIAN', 'RIZKY', 'PUTRI', 'EKO', 'DIMAS', 'RATNA', 'WAHYU', 'NUR', 'TAUFIK', 'FITRI'];
const INDONESIAN_LAST_NAMES = ['WIJAYA', 'SANTOSO', 'HIDAYAT', 'SETIAWAN', 'KUSUMA', 'LESTARI', 'PRATAMA', 'SAPUTRA', 'NURHALIZA', 'UTAMI'];

/**
 * Simulates Bank Account Inquiry (Cek Rekening Penerima Otomatis via API BI-FAST)
 */
export async function verifyBankAccount(
  bankCode: string,
  accountNumber: string
): Promise<{ accountHolder: string; isVerified: boolean; message: string }> {
  // Simulate network latency (250ms - 450ms)
  await new Promise((resolve) => setTimeout(resolve, 350));

  const cleanAcc = accountNumber.replace(/\s|-/g, '');
  const lookupKey = `${bankCode}-${cleanAcc}`;

  if (KNOWN_ACCOUNTS[lookupKey]) {
    return {
      accountHolder: KNOWN_ACCOUNTS[lookupKey],
      isVerified: true,
      message: 'Rekening aktif dan terverifikasi di jaringan Bank Sentral.'
    };
  }

  // Also check if account number is recognized universally across any bank code
  if (KNOWN_ACCOUNTS[cleanAcc]) {
    return {
      accountHolder: KNOWN_ACCOUNTS[cleanAcc],
      isVerified: true,
      message: 'Rekening aktif dan terverifikasi di jaringan Bank Sentral.'
    };
  }

  // If not in pre-seeded lookup, deterministically generate an authentic Indonesian name based on the account digits
  let hash = 0;
  for (let i = 0; i < cleanAcc.length; i++) {
    hash = (hash << 5) - hash + cleanAcc.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const firstName = INDONESIAN_FIRST_NAMES[absHash % INDONESIAN_FIRST_NAMES.length];
  const lastName = INDONESIAN_LAST_NAMES[(absHash >> 3) % INDONESIAN_LAST_NAMES.length];
  const middleInitial = String.fromCharCode(65 + ((absHash >> 5) % 26));

  return {
    accountHolder: `${firstName} ${middleInitial}. ${lastName}`,
    isVerified: true,
    message: 'Rekening aktif dan valid via BI-FAST Inquiry.'
  };
}

/**
 * Anti-Fraud & Real-time Risk Assessment
 */
export function evaluateTransactionRisk(
  amount: number,
  destinationAccount: string,
  isKnownBeneficiary: boolean,
  dailyUsed: number,
  dailyLimit: number
): {
  riskScore: number; // 0 to 100
  riskLevel: 'AMAN' | 'WASPADA' | 'BERBAHAYA';
  reasons: string[];
  requiresExtra2FA: boolean;
} {
  let score = 5; // Base safe score
  const reasons: string[] = [];

  // Check 1: Amount threshold
  if (amount >= 50000000) {
    score += 40;
    reasons.push('Nominal transaksi tinggi (≥ Rp 50 Juta)');
  } else if (amount >= 15000000) {
    score += 20;
    reasons.push('Nominal transaksi di atas rata-rata (≥ Rp 15 Juta)');
  }

  // Check 2: Beneficiary familiarity
  if (!isKnownBeneficiary) {
    score += 15;
    reasons.push('Transfer ke rekening tujuan baru (belum pernah tersimpan)');
  }

  // Check 3: Daily Limit proximity
  if (dailyUsed + amount > dailyLimit * 0.8) {
    score += 25;
    reasons.push('Mendekati akumulasi limit harian nasabah');
  }

  // Cap score
  score = Math.min(Math.max(score, 5), 95);

  let riskLevel: 'AMAN' | 'WASPADA' | 'BERBAHAYA' = 'AMAN';
  if (score >= 65) {
    riskLevel = 'BERBAHAYA';
  } else if (score >= 35) {
    riskLevel = 'WASPADA';
  }

  const requiresExtra2FA = score >= 35 || amount >= 25000000;

  return {
    riskScore: score,
    riskLevel,
    reasons: reasons.length > 0 ? reasons : ['Semua parameter keamanan normal & terenkripsi TLS 1.3'],
    requiresExtra2FA
  };
}

/**
 * Produces a randomized 0-9 digits array for anti-shoulder surfing keypad
 */
export function getScrambledKeypad(): number[] {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits;
}

export function generateSecurityAudit(
  authMethod: 'PIN_6_DIGIT' | 'BIOMETRIC_FACE_ID' | 'BIOMETRIC_FINGERPRINT',
  riskScore: number
): SecurityAudit {
  return {
    riskScore,
    riskLevel: riskScore >= 65 ? 'BERBAHAYA' : riskScore >= 35 ? 'WASPADA' : 'AMAN',
    authMethod,
    encryptionStandard: 'AES-256-GCM / ISO 20022 End-to-End',
    deviceFingerprint: `SEC-DEV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    ipAddress: '182.253.140.82 (Jakarta - Secure Tunnel)',
    antiPhishingVerified: true
  };
}
