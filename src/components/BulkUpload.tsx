import { useRef } from 'react';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface BulkUploadProps {
  onUpload: (names: string[]) => void;
}

const BulkUpload = ({ onUpload }: BulkUploadProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Extract names from first column, skip empty
        const names = rows
          .map(row => String(row[0] ?? '').trim())
          .filter(name => name.length > 0 && name !== 'undefined');

        if (names.length === 0) {
          toast.error('No data found in the file. Put names in the first column.');
          return;
        }

        onUpload(names);
      } catch {
        toast.error('Failed to parse the Excel file');
      }

      // Reset input
      if (fileRef.current) fileRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFile}
        className="hidden"
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-all"
        title="Bulk add rows from Excel file"
      >
        <Upload className="w-4 h-4" />
        Upload .xlsx
      </button>
    </>
  );
};

export default BulkUpload;
