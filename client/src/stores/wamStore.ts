import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Assignment {
  id: string;
  name: string;
  userScore: number | null;
  maxScore: number | null;
  weight: number | null;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  mark: number | null;
  creditPoints: number | null;
  assignments: Assignment[];
}

export interface Semester {
  id: string;
  name: string;
  subjects: Subject[];
}

const uid = () => crypto.randomUUID();

const SAMPLE_SEMESTERS: Semester[] = [
  {
    id: "sample-sem-1",
    name: "Semester 1 2024",
    subjects: [
      { id: "s1", code: "COMP30023", name: "Computer Systems", mark: 82, creditPoints: 12.5, assignments: [] },
      { id: "s2", code: "SWEN30006", name: "Software Modelling and Design", mark: 75, creditPoints: 12.5, assignments: [] },
      { id: "s3", code: "MAST20022", name: "Group Theory and Linear Algebra", mark: 68, creditPoints: 12.5, assignments: [] },
      { id: "s4", code: "INFO30005", name: "Web Information Technologies", mark: 88, creditPoints: 12.5, assignments: [] },
    ],
  },
  {
    id: "sample-sem-2",
    name: "Semester 2 2024",
    subjects: [
      { id: "s5", code: "COMP30026", name: "Models of Computation", mark: 79, creditPoints: 12.5, assignments: [] },
      { id: "s6", code: "SWEN90016", name: "Software Processes and Management", mark: 84, creditPoints: 12.5, assignments: [] },
      { id: "s7", code: "COMP30024", name: "Artificial Intelligence", mark: 91, creditPoints: 12.5, assignments: [] },
      { id: "s8", code: "MGMT20001", name: "Organisational Behaviour", mark: 72, creditPoints: 12.5, assignments: [] },
    ],
  },
];

interface WAMStore {
  semesters: Semester[];
  addSemester: (name: string) => void;
  removeSemester: (semesterId: string) => void;
  updateSemester: (semesterId: string, name: string) => void;
  addSubject: (semesterId: string, code: string, name: string) => void;
  removeSubject: (semesterId: string, subjectId: string) => void;
  updateSubject: (semesterId: string, subjectId: string, updates: Partial<Subject>) => void;
  addAssignment: (semesterId: string, subjectId: string, assignment: Omit<Assignment, "id">) => void;
  removeAssignment: (semesterId: string, subjectId: string, assignmentId: string) => void;
  updateAssignment: (semesterId: string, subjectId: string, assignmentId: string, updates: Partial<Assignment>) => void;
  calculateWAM: () => number | null;
  calculateSemesterWAM: (semesterId: string) => number | null;
  deleteSemester: (semesterId: string) => void;
  deleteSubject: (semesterId: string, subjectId: string) => void;
  loadSampleData: () => void;
}

export const useWAMStore = create<WAMStore>()(
  persist(
    (set, get) => ({
      semesters: [],

      addSemester: (name) =>
        set((s) => ({ semesters: [...s.semesters, { id: uid(), name, subjects: [] }] })),

      removeSemester: (semesterId) =>
        set((s) => ({ semesters: s.semesters.filter((sem) => sem.id !== semesterId) })),

      updateSemester: (semesterId, name) =>
        set((s) => ({
          semesters: s.semesters.map((sem) => (sem.id === semesterId ? { ...sem, name } : sem)),
        })),

      addSubject: (semesterId, code, name) =>
        set((s) => ({
          semesters: s.semesters.map((sem) =>
            sem.id === semesterId
              ? { ...sem, subjects: [...sem.subjects, { id: uid(), code, name, mark: null, creditPoints: null, assignments: [] }] }
              : sem
          ),
        })),

      removeSubject: (semesterId, subjectId) =>
        set((s) => ({
          semesters: s.semesters.map((sem) =>
            sem.id === semesterId
              ? { ...sem, subjects: sem.subjects.filter((sub) => sub.id !== subjectId) }
              : sem
          ),
        })),

      updateSubject: (semesterId, subjectId, updates) =>
        set((s) => ({
          semesters: s.semesters.map((sem) =>
            sem.id === semesterId
              ? { ...sem, subjects: sem.subjects.map((sub) => (sub.id === subjectId ? { ...sub, ...updates } : sub)) }
              : sem
          ),
        })),

      addAssignment: (semesterId, subjectId, assignment) =>
        set((s) => ({
          semesters: s.semesters.map((sem) =>
            sem.id === semesterId
              ? {
                  ...sem,
                  subjects: sem.subjects.map((sub) =>
                    sub.id === subjectId
                      ? { ...sub, assignments: [...sub.assignments, { ...assignment, id: uid() }] }
                      : sub
                  ),
                }
              : sem
          ),
        })),

      removeAssignment: (semesterId, subjectId, assignmentId) =>
        set((s) => ({
          semesters: s.semesters.map((sem) =>
            sem.id === semesterId
              ? {
                  ...sem,
                  subjects: sem.subjects.map((sub) =>
                    sub.id === subjectId
                      ? { ...sub, assignments: sub.assignments.filter((a) => a.id !== assignmentId) }
                      : sub
                  ),
                }
              : sem
          ),
        })),

      updateAssignment: (semesterId, subjectId, assignmentId, updates) =>
        set((s) => ({
          semesters: s.semesters.map((sem) =>
            sem.id === semesterId
              ? {
                  ...sem,
                  subjects: sem.subjects.map((sub) =>
                    sub.id === subjectId
                      ? {
                          ...sub,
                          assignments: sub.assignments.map((a) =>
                            a.id === assignmentId ? { ...a, ...updates } : a
                          ),
                        }
                      : sub
                  ),
                }
              : sem
          ),
        })),

      calculateWAM: () => {
        const { semesters } = get();
        let totalWeighted = 0;
        let totalCredits = 0;
        for (const sem of semesters) {
          for (const sub of sem.subjects) {
            if (sub.mark !== null && sub.creditPoints !== null) {
              totalWeighted += sub.mark * sub.creditPoints;
              totalCredits += sub.creditPoints;
            }
          }
        }
        return totalCredits > 0 ? Math.round((totalWeighted / totalCredits) * 100) / 100 : null;
      },

      deleteSemester: (semesterId) =>
        set((s) => ({ semesters: s.semesters.filter((sem) => sem.id !== semesterId) })),

      deleteSubject: (semesterId, subjectId) =>
        set((s) => ({
          semesters: s.semesters.map((sem) =>
            sem.id === semesterId
              ? { ...sem, subjects: sem.subjects.filter((sub) => sub.id !== subjectId) }
              : sem
          ),
        })),

      loadSampleData: () => set({ semesters: SAMPLE_SEMESTERS }),

      calculateSemesterWAM: (semesterId) => {
        const { semesters } = get();
        const sem = semesters.find((s) => s.id === semesterId);
        if (!sem) return null;
        let totalWeighted = 0;
        let totalCredits = 0;
        for (const sub of sem.subjects) {
          if (sub.mark !== null && sub.creditPoints !== null) {
            totalWeighted += sub.mark * sub.creditPoints;
            totalCredits += sub.creditPoints;
          }
        }
        return totalCredits > 0 ? Math.round((totalWeighted / totalCredits) * 100) / 100 : null;
      },
    }),
    { name: "snl-mobile-wam" }
  )
);
