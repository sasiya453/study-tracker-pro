import { useState, useEffect, useCallback } from 'react';

export interface SubjectData {
  rows: RowData[];
}

export interface RowData {
  id: string;
  name: string;
  rounds: RoundData[];
}

export interface RoundData {
  mcq: boolean;
  essay: boolean;
}

export type SubjectKey = 'chemistry' | 'physics' | 'combined-maths';

export const SUBJECTS: { key: SubjectKey; label: string; icon: string }[] = [
  { key: 'chemistry', label: 'Chemistry', icon: '⚗️' },
  { key: 'physics', label: 'Physics', icon: '⚛️' },
  { key: 'combined-maths', label: 'Combined Maths', icon: '📐' },
];

export const TOTAL_ROUNDS = 8;

const STORAGE_KEY = 'al-study-tracker';

function createEmptyRounds(): RoundData[] {
  return Array.from({ length: TOTAL_ROUNDS }, () => ({ mcq: false, essay: false }));
}

function createDefaultData(): Record<SubjectKey, SubjectData> {
  const subjects: Record<string, SubjectData> = {};
  for (const s of SUBJECTS) {
    subjects[s.key] = {
      rows: [
        { id: crypto.randomUUID(), name: '2015', rounds: createEmptyRounds() },
        { id: crypto.randomUUID(), name: '2016', rounds: createEmptyRounds() },
        { id: crypto.randomUUID(), name: '2017', rounds: createEmptyRounds() },
        { id: crypto.randomUUID(), name: '2018', rounds: createEmptyRounds() },
        { id: crypto.randomUUID(), name: '2019', rounds: createEmptyRounds() },
      ],
    };
  }
  return subjects as Record<SubjectKey, SubjectData>;
}

function loadData(): Record<SubjectKey, SubjectData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return createDefaultData();
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

export function getTotalProgress(data: Record<SubjectKey, SubjectData>): number {
  let total = 0;
  let done = 0;
  for (const key of SUBJECTS.map(s => s.key)) {
    const d = data[key];
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
  const [data, setData] = useState<Record<SubjectKey, SubjectData>>(loadData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const toggleCheck = useCallback((subject: SubjectKey, rowId: string, roundIndex: number, field: 'mcq' | 'essay') => {
    setData(prev => {
      const subjectData = { ...prev[subject] };
      subjectData.rows = subjectData.rows.map(row => {
        if (row.id !== rowId) return row;
        const rounds = row.rounds.map((r, i) => {
          if (i !== roundIndex) return r;
          return { ...r, [field]: !r[field] };
        });
        return { ...row, rounds };
      });
      return { ...prev, [subject]: subjectData };
    });
  }, []);

  const addRow = useCallback((subject: SubjectKey, name: string) => {
    setData(prev => {
      const subjectData = { ...prev[subject] };
      subjectData.rows = [...subjectData.rows, { id: crypto.randomUUID(), name, rounds: createEmptyRounds() }];
      return { ...prev, [subject]: subjectData };
    });
  }, []);

  const deleteRow = useCallback((subject: SubjectKey, rowId: string) => {
    setData(prev => {
      const subjectData = { ...prev[subject] };
      subjectData.rows = subjectData.rows.filter(r => r.id !== rowId);
      return { ...prev, [subject]: subjectData };
    });
  }, []);

  const renameRow = useCallback((subject: SubjectKey, rowId: string, name: string) => {
    setData(prev => {
      const subjectData = { ...prev[subject] };
      subjectData.rows = subjectData.rows.map(r => r.id === rowId ? { ...r, name } : r);
      return { ...prev, [subject]: subjectData };
    });
  }, []);

  return { data, toggleCheck, addRow, deleteRow, renameRow };
}
