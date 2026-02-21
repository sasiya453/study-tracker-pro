import { useNavigate } from 'react-router-dom';

interface SubjectCardProps {
  subjectKey: string;
  label: string;
  icon: string;
  progress: number;
}

const SubjectCard = ({ subjectKey, label, icon, progress }: SubjectCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="subject-card animate-scale-in"
      onClick={() => navigate(`/subject/${subjectKey}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/subject/${subjectKey}`)}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-semibold text-card-foreground">{label}</h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-primary">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;
