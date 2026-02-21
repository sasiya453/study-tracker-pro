import { useState, Fragment } from 'react';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import AnimatedCheckbox from './AnimatedCheckbox';
import { type SubjectData, TOTAL_ROUNDS } from '@/hooks/useStudyData';

interface TrackerTableProps {
  subject: string;
  data: SubjectData;
  onToggle: (rowId: string, roundIndex: number, field: 'mcq' | 'essay') => void;
  onAddRow: (name: string) => void;
  onDeleteRow: (rowId: string) => void;
  onRenameRow?: (rowId: string, name: string) => void;
}

const TrackerTable = ({ data, onToggle, onAddRow, onDeleteRow, onRenameRow }: TrackerTableProps) => {
  const [newRowName, setNewRowName] = useState('');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = () => {
    const name = newRowName.trim();
    if (!name) return;
    onAddRow(name);
    setNewRowName('');
  };

  const startEditing = (rowId: string, currentName: string) => {
    setEditingRowId(rowId);
    setEditingName(currentName);
  };

  const confirmEdit = () => {
    if (editingRowId && editingName.trim() && onRenameRow) {
      onRenameRow(editingRowId, editingName.trim());
    }
    setEditingRowId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditingName('');
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-header-cell text-left min-w-[140px]">Paper / Year</th>
                {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
                  <th key={i} colSpan={2} className="table-header-cell">
                    Round {i + 1}
                  </th>
                ))}
                <th className="table-header-cell w-10"></th>
              </tr>
              <tr>
                <th className="table-header-cell text-left"></th>
                {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
                  <Fragment key={i}>
                    <th className="table-header-cell text-[10px]">MCQ</th>
                    <th className="table-header-cell text-[10px]">Essay</th>
                  </Fragment>
                ))}
                <th className="table-header-cell"></th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, rowIndex) => (
                <tr key={row.id} className={`row-hover ${rowIndex % 2 === 0 ? 'zebra-even' : 'zebra-odd'}`}>
                  <td className="table-cell text-left font-medium text-foreground">
                    {editingRowId === row.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          autoFocus
                          className="w-24 rounded border border-border bg-background px-2 py-0.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <button onClick={confirmEdit} className="p-0.5 text-success hover:text-success/80 transition-colors">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={cancelEdit} className="p-0.5 text-muted-foreground hover:text-foreground transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group">
                        <span>{row.name}</span>
                        {onRenameRow && (
                          <button
                            onClick={() => startEditing(row.id, row.name)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-foreground transition-all"
                            aria-label={`Edit ${row.name}`}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  {row.rounds.map((round, ri) => (
                    <Fragment key={ri}>
                      <td className="table-cell">
                        <div className="flex justify-center">
                          <AnimatedCheckbox
                            checked={round.mcq}
                            onChange={() => onToggle(row.id, ri, 'mcq')}
                          />
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex justify-center">
                          <AnimatedCheckbox
                            checked={round.essay}
                            onChange={() => onToggle(row.id, ri, 'essay')}
                          />
                        </div>
                      </td>
                    </Fragment>
                  ))}
                  <td className="table-cell">
                    <button
                      onClick={() => onDeleteRow(row.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
                      aria-label={`Delete ${row.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newRowName}
          onChange={(e) => setNewRowName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Enter year or unit name..."
          className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
        />
        <button
          onClick={handleAdd}
          disabled={!newRowName.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>
      </div>
    </div>
  );
};

export default TrackerTable;
