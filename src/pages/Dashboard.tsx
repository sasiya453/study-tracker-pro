import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import CircularProgress from '@/components/CircularProgress';
import SubjectCard from '@/components/SubjectCard';
import { useStudyData, getSubjectProgress, getTotalProgress } from '@/hooks/useStudyData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const EMOJI_OPTIONS = ['📚', '⚗️', '⚛️', '📐', '🧬', '🌍', '📖', '🔬', '💻', '🎨', '🎵', '📊', '🧮', '🏛️', '✏️'];

const Dashboard = () => {
  const { data, subjects, addSubject, editSubject, deleteSubject, loading } = useStudyData();
  const totalProgress = getTotalProgress(subjects, data);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('📚');

  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editIcon, setEditIcon] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    addSubject(newLabel.trim(), newIcon);
    setNewLabel('');
    setNewIcon('📚');
    setShowAddDialog(false);
  };

  const startEdit = (key: string, label: string, icon: string) => {
    setEditingSubject(key);
    setEditLabel(label);
    setEditIcon(icon);
  };

  const confirmEdit = () => {
    if (editingSubject && editLabel.trim()) {
      editSubject(editingSubject, editLabel.trim(), editIcon);
    }
    setEditingSubject(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

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
          {subjects.map((subject, i) => (
            <div key={subject.key} style={{ animationDelay: `${0.15 + i * 0.08}s` }} className="animate-fade-in opacity-0 relative group">
              <SubjectCard
                subjectKey={subject.key}
                label={subject.label}
                icon={subject.icon}
                progress={getSubjectProgress(data[subject.key] || { rows: [] })}
              />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); startEdit(subject.key, subject.label, subject.icon); }}
                  className="p-1.5 rounded-md bg-card/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Edit subject"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(subject.key); }}
                  className="p-1.5 rounded-md bg-card/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Delete subject"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          <div
            onClick={() => setShowAddDialog(true)}
            className="subject-card animate-scale-in flex flex-col items-center justify-center gap-2 min-h-[120px] border-dashed border-2 border-border hover:border-primary/50"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setShowAddDialog(true)}
          >
            <Plus className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Add Subject</span>
          </div>
        </div>
      </div>

      {/* Add Subject Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription>Create a new subject to track your progress.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Subject Name</label>
              <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} placeholder="e.g. Biology" className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" autoFocus />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Icon</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map(emoji => (
                  <button key={emoji} type="button" onClick={() => setNewIcon(emoji)} className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${newIcon === emoji ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted hover:bg-muted/80'}`}>{emoji}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddDialog(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={!newLabel.trim()} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Add Subject</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>Update the subject name or icon.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Subject Name</label>
              <input type="text" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmEdit()} className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" autoFocus />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Icon</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map(emoji => (
                  <button key={emoji} type="button" onClick={() => setEditIcon(emoji)} className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${editIcon === emoji ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted hover:bg-muted/80'}`}>{emoji}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingSubject(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={confirmEdit} disabled={!editLabel.trim()} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Save Changes</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
            <DialogDescription>This will permanently delete the subject and all its progress data. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button onClick={() => { if (deleteConfirm) deleteSubject(deleteConfirm); setDeleteConfirm(null); }} className="px-4 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all">Delete</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
