/**
 * IST (Indian Standard Time - Asia/Kolkata, UTC+5:30) Date Utilities
 * Ensures all dates and timestamps across Perkfy / Cashback Hub are consistently
 * formatted and displayed in Indian Standard Time regardless of visitor client timezone.
 */

export function formatISTDateTime(val, includeTzLabel = false) {
  if (!val) return 'N/A';
  const d = new Date(val);
  if (isNaN(d.getTime())) return 'N/A';
  const str = d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return includeTzLabel ? `${str} IST` : str;
}

export function formatISTDate(val) {
  if (!val) return 'N/A';
  const d = new Date(val);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatISTTime(val, includeTzLabel = false) {
  if (!val) return 'N/A';
  const d = new Date(val);
  if (isNaN(d.getTime())) return 'N/A';
  const str = d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return includeTzLabel ? `${str} IST` : str;
}

export function getISTDateString(offsetMs = 0) {
  const d = new Date(Date.now() + offsetMs);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
}

export default {
  formatISTDateTime,
  formatISTDate,
  formatISTTime,
  getISTDateString
};
