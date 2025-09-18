const VAT_DEFAULT = 0.15;

function parseNumber(envValue: string | undefined, fallback: number): number {
  if (!envValue) return fallback;
  const parsed = Number(envValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const VAT_RATE = parseNumber(process.env.VAT_RATE, VAT_DEFAULT);

export const DEFAULT_MARKUPS = {
  RETAIL: parseNumber(process.env.MARKUP_RETAIL, 0.4),
  CONTRACTOR: parseNumber(process.env.MARKUP_CONTRACTOR, 0.3),
  TENDER: parseNumber(process.env.MARKUP_TENDER, 0.15),
  INHOUSE: parseNumber(process.env.MARKUP_INHOUSE, 0.1),
};
