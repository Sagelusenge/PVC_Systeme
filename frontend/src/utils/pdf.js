import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND = {
  name: "PVC Renovee",
  activity: "Industrie PVC et gestion integree",
  location: "Lubumbashi, Republique democratique du Congo",
  primary: [8, 17, 35],
  accent: [45, 107, 234],
  green: [39, 190, 151],
};

function printable(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (value instanceof Date) return value.toLocaleString("fr-FR");
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function drawBrandMark(doc) {
  doc.setFillColor(...BRAND.accent);
  doc.roundedRect(13, 7, 20, 20, 2.5, 2.5, "F");

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1.8);
  doc.line(19, 22.5, 19, 12);
  doc.line(19, 12, 25, 12);
  doc.roundedRect(24, 12, 4, 5, 2, 2, "S");

  doc.setDrawColor(...BRAND.green);
  doc.setLineWidth(1.7);
  doc.line(18.5, 23.5, 28.5, 13.5);
}

function drawHeader(doc, { title, documentNumber }) {
  const width = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, width, 34, "F");
  drawBrandMark(doc);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(BRAND.name, 38, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(BRAND.activity, 38, 20);
  doc.text(BRAND.location, 38, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title, width - 14, 14, { align: "right" });
  if (documentNumber) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Reference : ${documentNumber}`, width - 14, 21, { align: "right" });
  }
  doc.setFillColor(...BRAND.green);
  doc.rect(0, 34, width, 1.4, "F");
}

function drawFooter(doc, page, pageCount) {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  doc.setDrawColor(211, 218, 230);
  doc.line(14, height - 12, width - 14, height - 12);
  doc.setTextColor(92, 102, 120);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`${BRAND.name} | Document genere par PVC Systeme`, 14, height - 7);
  doc.text(`Page ${page}/${pageCount}`, width - 14, height - 7, { align: "right" });
}

function drawInformation(doc, { subtitle, recipient, generatedAt, startY = 42 }) {
  const width = doc.internal.pageSize.getWidth();
  doc.setTextColor(49, 58, 74);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(subtitle || "Document officiel", 14, startY);
  doc.text(`Date d'edition : ${generatedAt}`, width - 14, startY, { align: "right" });
  if (!recipient) return startY + 7;
  doc.setFillColor(245, 247, 251);
  doc.setDrawColor(218, 224, 234);
  doc.roundedRect(14, startY + 4, width - 28, 18, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.primary);
  doc.text(recipient.title || "Destinataire", 18, startY + 10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(70, 78, 92);
  doc.text([recipient.name, recipient.details].filter(Boolean).join(" | "), 18, startY + 16, { maxWidth: width - 36 });
  return startY + 28;
}

function drawSummary(doc, summary, startY) {
  if (!summary.length) return startY;
  const width = doc.internal.pageSize.getWidth();
  const gap = 4;
  const count = Math.min(summary.length, 4);
  const boxWidth = (width - 28 - gap * (count - 1)) / count;
  summary.slice(0, 4).forEach(([label, value], index) => {
    const x = 14 + index * (boxWidth + gap);
    doc.setFillColor(245, 247, 251);
    doc.setDrawColor(218, 224, 234);
    doc.roundedRect(x, startY, boxWidth, 16, 1.5, 1.5, "FD");
    doc.setTextColor(92, 102, 120);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(String(label).toUpperCase(), x + 3, startY + 5);
    doc.setTextColor(...BRAND.primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(printable(value), x + 3, startY + 12, { maxWidth: boxWidth - 6 });
  });
  return startY + 22;
}

export async function exportTablePdf({
  title, subtitle = "", columns, rows, filename, orientation = "landscape", summary = [],
  documentNumber = "", recipient = null, notes = "", signatures = false,
}) {
  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const generatedAt = new Date().toLocaleString("fr-FR");
  drawHeader(doc, { title, documentNumber });
  let startY = drawInformation(doc, { subtitle, recipient, generatedAt });
  startY = drawSummary(doc, summary, startY);

  autoTable(doc, {
    startY,
    head: [columns.map((column) => column.label)],
    body: rows.map((row) => columns.map((column) => printable(column.value ? column.value(row) : row[column.key]))),
    theme: "grid",
    styles: { fontSize: 7.5, cellPadding: 2.4, overflow: "linebreak", textColor: [49, 58, 74], lineColor: [218, 224, 234], lineWidth: 0.15 },
    headStyles: { fillColor: BRAND.accent, textColor: 255, fontStyle: "bold", halign: "left" },
    alternateRowStyles: { fillColor: [247, 249, 252] },
    margin: { left: 14, right: 14, top: 42, bottom: 18 },
    willDrawPage: () => drawHeader(doc, { title, documentNumber }),
  });

  let finalY = (doc.lastAutoTable?.finalY || startY) + 8;
  const pageHeight = doc.internal.pageSize.getHeight();
  if ((notes || signatures) && finalY > pageHeight - 42) {
    doc.addPage();
    drawHeader(doc, { title, documentNumber });
    finalY = 46;
  }
  if (notes) {
    doc.setTextColor(70, 78, 92);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text(notes, 14, finalY, { maxWidth: doc.internal.pageSize.getWidth() - 28 });
    finalY += 14;
  }
  if (signatures) {
    const width = doc.internal.pageSize.getWidth();
    doc.setDrawColor(150, 160, 176);
    doc.line(20, finalY + 16, 78, finalY + 16);
    doc.line(width - 78, finalY + 16, width - 20, finalY + 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Responsable", 49, finalY + 21, { align: "center" });
    doc.text("Client / Beneficiaire", width - 49, finalY + 21, { align: "center" });
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    drawFooter(doc, page, pageCount);
  }
  doc.save(filename || `${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.pdf`);
}

export function reportColumns(rows, labels = {}) {
  if (!rows.length) return [];
  return Object.keys(rows[0]).map((key) => ({
    key,
    label: labels[key] || key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
  }));
}
