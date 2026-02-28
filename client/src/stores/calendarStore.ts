import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
  description?: string;
  uid?: string;
  isRecurring?: boolean;
}

interface CalendarState {
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
  addEvents: (events: CalendarEvent[]) => void;
  deleteEvent: (id: number) => void;
  clearEvents: () => void;
  clearAll: () => void;
  loadSampleData: () => void;
}

const now = new Date();
const nextSat = new Date(now);
nextSat.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7));

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: 1,
    title: "SNL Study Session",
    start: new Date(nextSat),
    end: new Date(nextSat),
    allDay: false,
    location: "oSpace, Brunswick VIC",
    description: "Weekly Saturday study session",
  },
  {
    id: 2,
    title: "Assignment 1 Due",
    start: new Date(new Date().setDate(now.getDate() + 5)),
    end: new Date(new Date().setDate(now.getDate() + 5)),
    allDay: true,
    description: "COMP30023 Computer Systems",
  },
  {
    id: 3,
    title: "Mid-Semester Exam",
    start: new Date(new Date().setDate(now.getDate() + 12)),
    end: new Date(new Date().setDate(now.getDate() + 12)),
    allDay: false,
    location: "Wilson Hall",
    description: "MAST20022 Group Theory and Linear Algebra",
  },
  {
    id: 4,
    title: "SNL Study Session",
    start: new Date(new Date(nextSat).setDate(nextSat.getDate() + 7)),
    end: new Date(new Date(nextSat).setDate(nextSat.getDate() + 7)),
    allDay: false,
    location: "oSpace, Brunswick VIC",
    description: "Weekly Saturday study session",
  },
  {
    id: 5,
    title: "Project Presentation",
    start: new Date(new Date().setDate(now.getDate() + 20)),
    end: new Date(new Date().setDate(now.getDate() + 20)),
    allDay: false,
    location: "Engineering Building",
    description: "SWEN30006 Software Modelling and Design",
  },
  {
    id: 6,
    title: "Final Exam Period Starts",
    start: new Date(new Date().setDate(now.getDate() + 35)),
    end: new Date(new Date().setDate(now.getDate() + 49)),
    allDay: true,
    description: "Semester 1 final examinations",
  },
];

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  addEvents: (events) => set((s) => ({ events: [...s.events, ...events] })),
  deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
  clearEvents: () => set({ events: [] }),
  clearAll: () => set({ events: [] }),
  loadSampleData: () => set({ events: SAMPLE_EVENTS }),
    }),
    { name: "snl-mobile-calendar" }
  )
);
