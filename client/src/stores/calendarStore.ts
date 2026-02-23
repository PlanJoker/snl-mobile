import { create } from "zustand";

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
}

export const useCalendarStore = create<CalendarState>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  addEvents: (events) => set((s) => ({ events: [...s.events, ...events] })),
  deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
  clearEvents: () => set({ events: [] }),
}));
