export const formatters = {
  number: new Intl.NumberFormat(),
  usd: new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  })
};

export function shortenAddress(address: string): string {
  return address ? address.slice(0, 5) + '..' + address.slice(-5) : '';
}

export function formatId(id: string): string {
  if (!id) return '';
  return id.slice(0, 4) + '..' + id.slice(4, 8);
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString('en', { month: 'short' });
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year} - ${hours}:${minutes}`;
}
