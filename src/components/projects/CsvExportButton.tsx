import { Button } from "@/components/ui/button";

interface CsvExportButtonProps {
  filename?: string;
  headers: string[]; // header cells in order
  rows: (string | number)[][]; // 2D array of rows
  className?: string;
}

const CsvExportButton = ({ filename = "export.csv", headers, rows, className }: CsvExportButtonProps) => {
  const onClick = () => {
    const header = headers.join(",") + "\n";
    const escapeCell = (v: string | number) => {
      const s = String(v);
      const needsQuotes = s.includes(",") || s.includes("\n") || s.includes("\"");
      const escaped = s.replace(/\"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };
    const body = rows.map(r => r.map(escapeCell).join(",")).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <Button variant="outline" size="sm" onClick={onClick} className={className}>Export CSV</Button>
  );
};

export default CsvExportButton;
