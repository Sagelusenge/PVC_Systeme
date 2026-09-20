export const formatNumber = (value, digits = 2) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(value || 0));
