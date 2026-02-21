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

export interface SubjectInfo {
  key: string;
  label: string;
  icon: string;
}

export const DEFAULT_SUBJECTS: SubjectInfo[] = [
  { key: 'chemistry', label: 'Chemistry', icon: '⚗️' },
  { key: 'physics', label: 'Physics', icon: '⚛️' },
  { key: 'combined-maths', label: 'Combined Maths', icon: '📐' },
];

export const TOTAL_ROUNDS = 8;

const STORAGE_KEY = 'al-study-tracker';
const SUBJECTS_KEY = 'al-study-subjects';

function createEmptyRounds(): RoundData[] {
  return Array.from({ length: TOTAL_ROUNDS }, () => ({ mcq: false, essay: false }));
}

function loadSubjects(): SubjectInfo[] {
  try {
    const raw = localStorage.getItem(SUBJECTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_SUBJECTS;
}

function createDefaultData(subjects: SubjectInfo[]): Record<string, SubjectData> {
  const data: Record<string, SubjectData> = {};
  for (const s of subjects) {
    data[s.key] = {
      rows: [
        { id: crypto.randomUUID(), name: '2015', rounds: createEmptyRounds() },
        { id: crypto.randomUUID(), name: '2016', rounds: createEmptyRounds() },
        { id: crypto.randomUUID(), name: '2017', rounds: createEmptyRounds() },
        { id: crypto.randomUUID(), name: '2018', rounds: createEmptyRounds() },
        { id: crypto.randomUUID(), name: '2019', rounds: createEmptyRounds() },
      ],
    };
  }
  return data;
}

function loadData(subjects: SubjectInfo[]): Record<string, SubjectData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all subjects have data
      for (const s of subjects) {
        if (!parsed[s.key]) {
          parsed[s.key] = {
            rows: [
              { id: crypto.randomUUID(), name: '2015', rounds: createEmptyRounds() },
              { id: crypto.randomUUID(), name: '2016', rounds: createEmptyRounds() },
              { id: crypto.randomUUID(), name: '2017', rounds: createEmptyRounds() },
            ],
          };
        }
      }
      return parsed;
    }
  } catch { /* ignore */ }
  return createDefaultData(subjects);
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
  const [subjects, setSubjects] = useState<SubjectInfo[]>(loadSubjects);
  const [data, setData] = useState<Record<string, SubjectData>>(() => loadData(subjects));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  }, [subjects]);

  const toggleCheck = useCallback((subject: string, rowId: string, roundIndex: number, field: 'mcq' | 'essay') => {
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

  const addRow = useCallback((subject: string, name: string) => {
    setData(prev => {
      const subjectData = { ...prev[subject] };
      subjectData.rows = [...subjectData.rows, { id: crypto.randomUUID(), name, rounds: createEmptyRounds() }];
      return { ...prev, [subject]: subjectData };
    });
  }, []);

  const deleteRow = useCallback((subject: string, rowId: string) => {
    setData(prev => {
      const subjectData = { ...prev[subject] };
      subjectData.rows = subjectData.rows.filter(r => r.id !== rowId);
      return { ...prev, [subject]: subjectData };
    });
  }, []);

  const renameRow = useCallback((subject: string, rowId: string, name: string) => {
    setData(prev => {
      const subjectData = { ...prev[subject] };
      subjectData.rows = subjectData.rows.map(r => r.id === rowId ? { ...r, name } : r);
      return { ...prev, [subject]: subjectData };
    });
  }, []);

  const addSubject = useCallback((label: string, icon: string) => {
    const key = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newSubject: SubjectInfo = { key, label, icon };
    setSubjects(prev => [...prev, newSubject]);
    setData(prev => ({
      ...prev,
      [key]: { rows: [] },
    }));
    return key;
  }, []);

  const editSubject = useCallback((key: string, label: string, icon: string) => {
    setSubjects(prev => prev.map(s => s.key === key ? { ...s, label, icon } : s));
  }, []);

  const deleteSubject = useCallback((key: string) => {
    setSubjects(prev => prev.filter(s => s.key !== key));
    setData(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return { data, subjects, toggleCheck, addRow, deleteRow, renameRow, addSubject, editSubject, deleteSubject };
}
