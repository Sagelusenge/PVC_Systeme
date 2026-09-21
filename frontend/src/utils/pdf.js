import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function printable(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (value instanceof Date) return value.toLocaleString("fr-FR");
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function exportTablePdf({ title, subtitle = "", columns, rows, filename, orientation = "landscape", summary = [] }) {
  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
  doc.setFillColor(8, 17, 35);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("PVC Renovee", 14, 11);
  doc.setFontSize(11);
  doc.text(title, 14, 20);
  doc.setTextColor(70, 78, 92);
  doc.setFontSize(8);
  doc.text(subtitle || `Genere le ${new Date().toLocaleString("fr-FR")}`, 14, 34);

  let startY = 40;
  if (summary.length) {
    summary.forEach(([label, value], index) => {
      const x = 14 + (index % 3) * 62;
      const y = startY + Math.floor(index / 3) * 8;
      doc.setFont(undefined, "bold");
      doc.text(`${label} :`, x, y);
      doc.setFont(undefined, "normal");
      doc.text(printable(value), x + 24, y);
    });
    startY += Math.ceil(summary.length / 3) * 8 + 3;
  }

  autoTable(doc, {
    startY,
    head: [columns.map((column) => column.label)],
    body: rows.map((row) => columns.map((column) => printable(column.value ? column.value(row) : row[column.key]))),
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [45, 107, 234], textColor: 255 },
    alternateRowStyles: { fillColor: [242, 245, 250] },
    margin: { left: 14, right: 14 },
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFontSize(7);
    doc.setTextColor(110, 118, 132);
    doc.text(`PVC Renovee - Page ${page}/${pageCount}`, 14, doc.internal.pageSize.getHeight() - 7);
  }
  doc.save(filename || `${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.pdf`);
}

export function reportColumns(rows) {
  if (!rows.length) return [];
  return Object.keys(rows[0]).map((key) => ({ key, label: key.replaceAll("_", " ").toUpperCase() }));
}
