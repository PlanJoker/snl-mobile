// Design: Dark Brutalism + Neon Accent — Calendar page with ICS upload
// Brand: #012E2B bg, #FFDC73 accent, Space Grotesk headers
import { useState, useRef, useMemo } from "react";
import { Upload, ChevronLeft, ChevronRight, X, CalendarDays, Clock, MapPin, FileText, Trash2, Plus } from "lucide-react";
import { useCalendarStore } from "../stores/calendarStore";
import { parseICSFile } from "../lib/icsParser";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type ViewMode = "month" | "week" | "agenda";

export default function CalendarPage() {
  const { events, addEvents, deleteEvent, clearEvents } = useCalendarStore();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const today = new Date();

  // Month grid
  const monthGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [currentDate]);

  // Week dates
  const weekDates = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const nd = new Date(d);
      nd.setDate(d.getDate() + i);
      return nd;
    });
  }, [currentDate]);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const getEventsForDay = (date: Date) =>
    events.filter((e) => isSameDay(e.start, date));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const text = await file.text();
      const parsed = parseICSFile(text);
      if (parsed.length === 0) {
        setUploadError("No events found in this ICS file.");
      } else {
        addEvents(parsed);
      }
    } catch (err) {
      setUploadError("Failed to parse ICS file. Please try again.");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() + dir);
    else if (viewMode === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  // Agenda: next 30 days events
  const agendaEvents = useMemo(() => {
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 60);
    return events
      .filter((e) => e.start >= start && e.start <= end)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, today]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (d: Date) =>
    d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="page-container bg-[#012E2B]">
      <PageHeader
        title="Calendar"
        subtitle={`${events.length} events`}
        accent
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 bg-[#FFDC73] text-[#012E2B] rounded-xl px-3 py-1.5 text-xs font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Upload size={12} />
              ICS
            </button>
            {events.length > 0 && (
              <button
                type="button"
                onClick={clearEvents}
                className="w-7 h-7 rounded-xl bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] flex items-center justify-center text-[#8fa8a5]"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        }
      />

      <input ref={fileRef} type="file" accept=".ics" onChange={handleFileUpload} className="hidden" />

      <div className="px-4 pt-2 pb-4">
        {uploadError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-3 flex items-center justify-between">
            <p className="text-red-400 text-sm">{uploadError}</p>
            <button type="button" onClick={() => setUploadError("")}><X size={14} className="text-red-400" /></button>
          </div>
        )}

        {uploading && (
          <div className="bg-[#FFDC73]/10 border border-[#FFDC73]/20 rounded-xl p-3 mb-3">
            <p className="text-[#FFDC73] text-sm">Parsing ICS file...</p>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex bg-[#0a3d39] rounded-xl p-1 mb-4">
          {(["month", "week", "agenda"] as ViewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setViewMode(m)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                viewMode === m
                  ? "bg-[#FFDC73] text-[#012E2B]"
                  : "text-[#8fa8a5]"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Navigation */}
        {viewMode !== "agenda" && (
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] flex items-center justify-center text-[#8fa8a5]">
              <ChevronLeft size={16} />
            </button>
            <div className="text-center">
              <p className="text-[#F8F8FF] font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {viewMode === "month"
                  ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                  : `${formatDate(weekDates[0])} – ${formatDate(weekDates[6])}`}
              </p>
            </div>
            <button type="button" onClick={() => navigate(1)} className="w-8 h-8 rounded-xl bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] flex items-center justify-center text-[#8fa8a5]">
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Month View */}
        {viewMode === "month" && (
          <>
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[#8fa8a5] text-[10px] font-semibold py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {monthGrid.map((date, i) => {
                if (!date) return <div key={i} />;
                const isToday = isSameDay(date, today);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const dayEvents = getEventsForDay(date);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedDate(isSelected ? null : date)}
                    className={`aspect-square flex flex-col items-center justify-start pt-1 rounded-xl transition-all ${
                      isSelected
                        ? "bg-[#FFDC73]/20 border border-[#FFDC73]/40"
                        : isToday
                        ? "bg-[#FFDC73]/10 border border-[#FFDC73]/20"
                        : "hover:bg-[#0a3d39]"
                    }`}
                  >
                    <span className={`text-xs font-semibold ${
                      isToday ? "text-[#FFDC73]" : isSelected ? "text-[#FFDC73]" : "text-[#F8F8FF]"
                    }`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                        {dayEvents.slice(0, 3).map((_, ei) => (
                          <span key={ei} className="w-1 h-1 rounded-full bg-[#FFDC73]" />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Day Events */}
            {selectedDate && (
              <div className="mt-4">
                <p className="text-[#F8F8FF] text-sm font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {formatDate(selectedDate)}
                </p>
                {selectedDayEvents.length === 0 ? (
                  <Card><p className="text-[#8fa8a5] text-sm text-center py-2">No events</p></Card>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedDayEvents.map((ev) => (
                      <Card key={ev.id} onClick={() => setSelectedEvent(ev)} className="border-l-2 border-l-[#FFDC73]">
                        <p className="text-[#F8F8FF] text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{ev.title}</p>
                        {!ev.allDay && (
                          <p className="text-[#8fa8a5] text-xs mt-0.5">
                            {formatTime(ev.start)} – {formatTime(ev.end)}
                          </p>
                        )}
                        {ev.location && <p className="text-[#8fa8a5] text-xs">{ev.location}</p>}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Week View */}
        {viewMode === "week" && (
          <div className="flex flex-col gap-2">
            {weekDates.map((date) => {
              const dayEvs = getEventsForDay(date);
              const isToday = isSameDay(date, today);
              return (
                <div key={date.toISOString()} className={`rounded-2xl overflow-hidden ${isToday ? "border border-[#FFDC73]/30" : ""}`}>
                  <div className={`px-3 py-2 flex items-center gap-2 ${isToday ? "bg-[#FFDC73]/10" : "bg-[#0a3d39]"}`}>
                    <span className={`text-xs font-bold ${isToday ? "text-[#FFDC73]" : "text-[#8fa8a5]"}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {DAYS[date.getDay()]}
                    </span>
                    <span className={`text-sm font-bold ${isToday ? "text-[#FFDC73]" : "text-[#F8F8FF]"}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {date.getDate()}
                    </span>
                    {dayEvs.length > 0 && (
                      <span className="ml-auto text-[#8fa8a5] text-xs">{dayEvs.length} event{dayEvs.length > 1 ? "s" : ""}</span>
                    )}
                  </div>
                  {dayEvs.length > 0 && (
                    <div className="bg-[#0a3d39]/50 px-3 pb-2 flex flex-col gap-1.5 pt-1.5">
                      {dayEvs.map((ev) => (
                        <button key={ev.id} type="button" onClick={() => setSelectedEvent(ev)} className="text-left flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FFDC73] mt-1.5 shrink-0" />
                          <div>
                            <p className="text-[#F8F8FF] text-xs font-semibold">{ev.title}</p>
                            {!ev.allDay && <p className="text-[#8fa8a5] text-[10px]">{formatTime(ev.start)}</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Agenda View */}
        {viewMode === "agenda" && (
          <div>
            <p className="text-[#8fa8a5] text-xs mb-3">Next 60 days ({agendaEvents.length} events)</p>
            {agendaEvents.length === 0 ? (
              <Card>
                <div className="flex flex-col items-center gap-3 py-6">
                  <CalendarDays size={32} className="text-[#8fa8a5]" />
                  <p className="text-[#8fa8a5] text-sm text-center">No upcoming events.<br />Upload an ICS file to get started.</p>
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 bg-[#FFDC73] text-[#012E2B] rounded-xl px-4 py-2 text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Upload size={14} /> Upload ICS
                  </button>
                </div>
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {agendaEvents.map((ev) => (
                  <Card key={ev.id} onClick={() => setSelectedEvent(ev)} className="border-l-2 border-l-[#FFDC73]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[#F8F8FF] text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{ev.title}</p>
                        <p className="text-[#FFDC73] text-xs mt-0.5">{formatDate(ev.start)}</p>
                        {!ev.allDay && <p className="text-[#8fa8a5] text-xs">{formatTime(ev.start)} – {formatTime(ev.end)}</p>}
                        {ev.location && <p className="text-[#8fa8a5] text-xs">{ev.location}</p>}
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id); }} className="text-[#8fa8a5] p-1 active:text-red-400">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {events.length === 0 && viewMode !== "agenda" && (
          <div className="mt-6">
            <Card>
              <div className="flex flex-col items-center gap-3 py-4">
                <Upload size={28} className="text-[#8fa8a5]" />
                <p className="text-[#8fa8a5] text-sm text-center">Upload your .ics calendar file<br />to see events here</p>
                <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 bg-[#FFDC73] text-[#012E2B] rounded-xl px-4 py-2 text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Upload size={14} /> Upload ICS
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={() => setSelectedEvent(null)}>
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="relative w-full max-w-[480px] bg-[#0a3d39] border-t border-[rgba(255,220,115,0.2)] rounded-t-3xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-[rgba(255,220,115,0.2)] mx-auto mb-4" />
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-[#F8F8FF] text-lg font-bold flex-1 pr-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{selectedEvent.title}</h3>
              <button type="button" onClick={() => setSelectedEvent(null)} className="text-[#8fa8a5]"><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <CalendarDays size={15} className="text-[#FFDC73] shrink-0" />
                <span className="text-[#F8F8FF] text-sm">{formatDate(selectedEvent.start)}</span>
              </div>
              {!selectedEvent.allDay && (
                <div className="flex items-center gap-2.5">
                  <Clock size={15} className="text-[#FFDC73] shrink-0" />
                  <span className="text-[#F8F8FF] text-sm">{formatTime(selectedEvent.start)} – {formatTime(selectedEvent.end)}</span>
                </div>
              )}
              {selectedEvent.location && (
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-[#FFDC73] shrink-0 mt-0.5" />
                  <span className="text-[#F8F8FF] text-sm">{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.description && (
                <div className="flex items-start gap-2.5">
                  <FileText size={15} className="text-[#FFDC73] shrink-0 mt-0.5" />
                  <span className="text-[#8fa8a5] text-sm leading-relaxed">{selectedEvent.description}</span>
                </div>
              )}
              {selectedEvent.isRecurring && (
                <div className="bg-[#FFDC73]/10 border border-[#FFDC73]/20 rounded-xl px-3 py-2">
                  <p className="text-[#FFDC73] text-xs font-semibold">Recurring event</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => { deleteEvent(selectedEvent.id); setSelectedEvent(null); }}
              className="mt-4 w-full flex items-center justify-center gap-2 border border-red-500/30 text-red-400 rounded-xl py-2.5 text-sm"
            >
              <Trash2 size={14} /> Delete this occurrence
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
