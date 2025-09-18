export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function computePriceExVat(landed: number, markup: number): number {
  if (!Number.isFinite(landed)) return NaN;
  return round2(landed * (1 + markup));
}

export function gpPct(priceExVat: number, landed: number): number {
  if (!Number.isFinite(priceExVat) || priceExVat <= 0) return NaN;
  if (!Number.isFinite(landed)) return NaN;
  return round2(((priceExVat - landed) / priceExVat) * 100);
}
