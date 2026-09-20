export function formatCurrency(value, currency = "USD") {
  const safeCurrency = typeof currency === "string" && /^[A-Z]{3}$/.test(currency) ? currency : "USD";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: safeCurrency, maximumFractionDigits: 2 }).format(Number(value || 0));
}
