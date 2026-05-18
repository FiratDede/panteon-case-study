export function formatMoney(value: string | number) {
  return new Intl.NumberFormat("en-US").format(Number(value));
}

export function formatDuration(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);

  return `${days}d ${hours}h ${minutes}m`;
}
