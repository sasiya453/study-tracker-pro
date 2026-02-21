import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RoundData {
  mcq: boolean;
  essay: boolean;
}

export interface RowData {
  id: string;
  name: string;
  rounds: RoundData[];
}

export interface SubjectData {
  rows: RowData[];
}

export interface SubjectInfo {
  key: string;
  label: string;
  icon: string;
  dbId?: string;
}

export const TOTAL_ROUNDS = 8;

function createEmptyRounds(): RoundData[] {
  return Array.from({ length: TOTAL_ROUNDS }, () => ({ mcq: false, essay: false }));
}

export function getSubjectProgress(data: SubjectData): number {
  const total = data.rows.length * TOTAL_ROUNDS * 2;
  if (total === 0) return 0;
  let done = 0;
  for (const row of data.rows) {
    for (const r of row.rounds) {
      if (r.mcq) done++;
      if (r.essay) done++;
    }
  }
  return Math.round((done / total) * 100);
}

export function getTotalProgress(subjects: SubjectInfo[], data: Record<string, SubjectData>): number {
  let total = 0;
  let done = 0;
  for (const s of subjects) {
    const d = data[s.key];
    if (!d) continue;
    total += d.rows.length * TOTAL_ROUNDS * 2;
    for (const row of d.rows) {
      for (const r of row.rounds) {
        if (r.mcq) done++;
        if (r.essay) done++;
      }
    }
  }
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

export function useStudyData() {
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [data, setData] = useState<Record<string, SubjectData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: subjectsData, error: sErr } = await supabase
        .from('subjects')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (sErr) { toast.error('Failed to load subjects'); setLoading(false); return; }
      
      const subs: SubjectInfo[] = (subjectsData || []).map((s: any) => ({
        key: s.key,
        label: s.label,
        icon: s.icon,
        dbId: s.id,
      }));

      const { data: rowsData, error: rErr } = await supabase
        .from('study_rows')
        .select('*')
        .order('sort_order', { ascending: true });

      if (rErr) { toast.error('Failed to load data'); setLoading(false); return; }

      const idToKey: Record<string, string> = {};
      for (const s of subjectsData || []) idToKey[s.id] = s.key;

      const dataMap: Record<string, SubjectData> = {};
      for (const s of subs) dataMap[s.key] = { rows: [] };

      for (const row of rowsData || []) {
        const key = idToKey[row.subject_id];
        if (!key || !dataMap[key]) continue;
        const rounds = Array.isArray(row.rounds) ? (row.rounds as unknown as RoundData[]) : createEmptyRounds();
        while (rounds.length < TOTAL_ROUNDS) rounds.push({ mcq: false, essay: false });
        dataMap[key].rows.push({ id: row.id, name: row.name, rounds });
      }

      setSubjects(subs);
      setData(dataMap);
      setLoading(false);
    };

    load();
  }, []);

  const getSubjectDbId = useCallback((subjectKey: string) => {
    return subjects.find(s => s.key === subjectKey)?.dbId;
  }, [subjects]);

  const toggleCheck = useCallback(async (subject: string, rowId: string, roundIndex: number, field: 'mcq' | 'essay') => {
    setData(prev => {
      const subjectData = { ...prev[subject] };
      subjectData.rows = subjectData.rows.map(row => {
        if (row.id !== rowId) return row;
        const rounds = row.rounds.map((r, i) => i !== roundIndex ? r : { ...r, [field]: !r[field] });
        return { ...row, rounds };
      });
      return { ...prev, [subject]: subjectData };
    });

    const row = data[subject]?.rows.find(r => r.id === rowId);
    if (!row) return;
    const updatedRounds = row.rounds.map((r, i) => i !== roundIndex ? r : { ...r, [field]: !r[field] });

    const { error } = await supabase
      .from('study_rows')
      .update({ rounds: updatedRounds as any })
      .eq('id', rowId);
    if (error) toast.error('Failed to save');
  }, [data]);

  const addRow = useCallback(async (subject: string, name: string) => {
    const subjectDbId = getSubjectDbId(subject);
    if (!subjectDbId) return;

    const rounds = createEmptyRounds();
    const { data: inserted, error } = await supabase
      .from('study_rows')
      .insert({ subject_id: subjectDbId, name, rounds: rounds as any })
      .select()
      .single();

    if (error || !inserted) { toast.error('Failed to add row'); return; }

    setData(prev => {
      const subjectData = { ...prev[subject] };
      subjectData.rows = [...subjectData.rows, { id: inserted.id, name, rounds }];
      return { ...prev, [subject]: subjectData };
    });
  }, [getSubjectDbId]);

  const addRows = useCallback(async (subject: string, names: string[]) => {
    if (names.length === 0) return;
    const subjectDbId = getSubjectDbId(subject);
    if (!subjectDbId) return;

    const rows = names.map(name => ({
      subject_id: subjectDbId,
      name,
      rounds: createEmptyRounds() as any,
    }));

    const { data: inserted, error } = await supabase
      .from('study_rows')
      .insert(rows)
      .select();

    if (error || !inserted) { toast.error('Failed to add rows'); return; }

    setData(prev => {
      const subjectData = { ...prev[subject] };
      const newRows = inserted.map((r: any) => ({
        id: r.id,
        name: r.name,
        rounds: Array.isArray(r.rounds) ? r.rounds as RoundData[] : createEmptyRounds(),
      }));
      subjectData.rows = [...subjectData.rows, ...newRows];
      return { ...prev, [subject]: subjectData };
    });

    toast.success(`Added ${inserted.length} rows`);
  }, [getSubjectDbId]);

  const deleteRow = useCallback(async (subject: string, rowId: string) => {
    setData(prev => {
      const subjectData = { ...prev[subject] };
      subjectData.rows = subjectData.rows.filter(r => r.id !== rowId);
      return { ...prev, [subject]: subjectData };
    });

    const { error } = await supabase.from('study_rows').delete().eq('id', rowId);
    if (error) toast.error('Failed to delete');
  }, []);

  const renameRow = useCallback(async (subject: string, rowId: string, name: string) => {
    setData(prev => {
      const subjectData = { ...prev[subject] };
      subjectData.rows = subjectData.rows.map(r => r.id === rowId ? { ...r, name } : r);
      return { ...prev, [subject]: subjectData };
    });

    const { error } = await supabase.from('study_rows').update({ name }).eq('id', rowId);
    if (error) toast.error('Failed to rename');
  }, []);

  const addSubject = useCallback(async (label: string, icon: string) => {
    const key = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data: inserted, error } = await supabase
      .from('subjects')
      .insert({ key, label, icon, sort_order: subjects.length })
      .select()
      .single();

    if (error || !inserted) { toast.error('Failed to add subject'); return ''; }

    setSubjects(prev => [...prev, { key, label, icon, dbId: inserted.id }]);
    setData(prev => ({ ...prev, [key]: { rows: [] } }));
    return key;
  }, [subjects.length]);

  const editSubject = useCallback(async (key: string, label: string, icon: string) => {
    const dbId = getSubjectDbId(key);
    if (!dbId) return;

    setSubjects(prev => prev.map(s => s.key === key ? { ...s, label, icon } : s));

    const { error } = await supabase.from('subjects').update({ label, icon }).eq('id', dbId);
    if (error) toast.error('Failed to update subject');
  }, [getSubjectDbId]);

  const deleteSubject = useCallback(async (key: string) => {
    const dbId = getSubjectDbId(key);
    if (!dbId) return;

    setSubjects(prev => prev.filter(s => s.key !== key));
    setData(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    const { error } = await supabase.from('subjects').delete().eq('id', dbId);
    if (error) toast.error('Failed to delete subject');
  }, [getSubjectDbId]);

  return { data, subjects, loading, toggleCheck, addRow, addRows, deleteRow, renameRow, addSubject, editSubject, deleteSubject };
}
