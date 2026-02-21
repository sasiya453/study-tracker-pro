import CircularProgress from '@/components/CircularProgress';
import SubjectCard from '@/components/SubjectCard';
import { useStudyData, SUBJECTS, getSubjectProgress, getTotalProgress } from '@/hooks/useStudyData';

const Dashboard = () => {
  const { data } = useStudyData();
  const totalProgress = getTotalProgress(data);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            A/L Study Tracker
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track your past paper progress across all subjects
          </p>
        </div>

        {/* Progress Ring */}
        <div className="flex justify-center mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col items-center gap-3">
            <CircularProgress percentage={totalProgress} />
            <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
          </div>
        </div>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SUBJECTS.map((subject, i) => (
            <div key={subject.key} style={{ animationDelay: `${0.15 + i * 0.08}s` }} className="animate-fade-in opacity-0">
              <SubjectCard
                subjectKey={subject.key}
                label={subject.label}
                icon={subject.icon}
                progress={getSubjectProgress(data[subject.key])}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
