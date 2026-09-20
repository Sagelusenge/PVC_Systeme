import EmptyState from "./EmptyState";
export default function Table({ columns, rows = [], keyField = "id" }) {
  if (!rows.length) return <EmptyState />;
  return <div className="data-table-wrap"><table className="data-table"><thead><tr>{columns.map((column) => <th key={column.key} className={column.numeric ? "number" : ""}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row[keyField] ?? index}>{columns.map((column) => <td key={column.key} className={column.numeric ? "number" : ""}>{column.render ? column.render(row[column.key], row) : row[column.key] ?? "-"}</td>)}</tr>)}</tbody></table></div>;
}
