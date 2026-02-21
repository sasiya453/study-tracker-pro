import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AnimatedCheckbox from './AnimatedCheckbox';
import { type SubjectData, type SubjectKey, TOTAL_ROUNDS } from '@/hooks/useStudyData';

interface TrackerTableProps {
  subject: SubjectKey;
  data: SubjectData;
  onToggle: (rowId: string, roundIndex: number, field: 'mcq' | 'essay') => void;
  onAddRow: (name: string) => void;
  onDeleteRow: (rowId: string) => void;
}

const TrackerTable = ({ data, onToggle, onAddRow, onDeleteRow }: TrackerTableProps) => {
  const [newRowName, setNewRowName] = useState('');

  const handleAdd = () => {
    const name = newRowName.trim();
    if (!name) return;
    onAddRow(name);
    setNewRowName('');
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
                    {row.name}
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

// Need to import Fragment
import { Fragment } from 'react';

export default TrackerTable;
