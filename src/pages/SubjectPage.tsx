import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TrackerTable from '@/components/TrackerTable';
import { useStudyData, SUBJECTS, getSubjectProgress, type SubjectKey } from '@/hooks/useStudyData';

const SubjectPage = () => {
  const { subjectKey } = useParams<{ subjectKey: string }>();
  const navigate = useNavigate();
  const { data, toggleCheck, addRow, deleteRow } = useStudyData();

  const subject = SUBJECTS.find(s => s.key === subjectKey);
  if (!subject || !subjectKey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Subject not found.</p>
      </div>
    );
  }

  const key = subjectKey as SubjectKey;
  const subjectData = data[key];
  const progress = getSubjectProgress(subjectData);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{subject.icon}</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                {subject.label}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-primary">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <TrackerTable
            subject={key}
            data={subjectData}
            onToggle={(rowId, roundIndex, field) => toggleCheck(key, rowId, roundIndex, field)}
            onAddRow={(name) => addRow(key, name)}
            onDeleteRow={(rowId) => deleteRow(key, rowId)}
          />
        </div>
      </div>
    </div>
  );
};

export default SubjectPage;
