export function formatDate(value) { if (!value) return "-"; return new Intl.DateTimeFormat("fr-FR").format(new Date(value)); }
