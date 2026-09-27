/**
 * Indonesian Rupiah and Banking Utility Formatters
 */

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function formatDateWIB(dateInput: string | number | Date): string {
  const d = new Date(dateInput);
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'Asia/Jakarta',
  }).format(d) + ' WIB';
}

export function formatDateShort(dateInput: string | number | Date): string {
  const d = new Date(dateInput);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(d);
}

export function maskAccountNumber(acc: string): string {
  if (!acc || acc.length <= 4) return acc;
  const visible = acc.slice(-4);
  const masked = '•••• '.repeat(Math.max(1, Math.floor((acc.length - 4) / 4)));
  return `${masked}${visible}`;
}

export function generateBiFastRef(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randNum = Math.floor(1000000000 + Math.random() * 9000000000);
  return `BIF${dateStr}${randNum}`;
}

export function generateTransactionId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randSeq = Math.floor(100000 + Math.random() * 900000);
  return `TRX-${dateStr}-BIF-${randSeq}`;
}

export function generateSTAN(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
