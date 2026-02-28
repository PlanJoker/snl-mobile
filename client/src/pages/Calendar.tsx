// Design: Dark Brutalism + Neon Accent — Calendar page with ICS upload
// Brand: #012E2B bg, #FFDC73 accent, Space Grotesk headers
import { useState, useRef, useMemo } from "react";
import { Upload, ChevronLeft, ChevronRight, X, CalendarDays, Clock, MapPin, Trash2, RefreshCw, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── ICS Parser ───────────────────────────────────────────────────────────────
function parseICS(icsText: string) {
  const events: Array<{
    title: string; startAt: Date; endAt: Date; allDay: boolean;
    location?: string; description?: string; isRecurring?: boolean;
  }> = [];
  const lines = icsText.replace(/\r\n /g, "").replace(/\r\n\t/g, "").split(/\r\n|\n|\r/);
  let current: Record<string, string> | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") { current = {}; continue; }
    if (line === "END:VEVENT" && current) {
      const title = current["SUMMARY"] || "Untitled";
      const dtstart = current["DTSTART"] || current["DTSTART;VALUE=DATE"] || "";
      const dtend = current["DTEND"] || current["DTEND;VALUE=DATE"] || dtstart;
      const allDay = dtstart.length === 8 || dtstart.includes("VALUE=DATE");
      const parseDate = (s: string): Date => {
        const clean = s.replace(/[TZ]/g, "");
        if (clean.length === 8) return new Date(`${clean.slice(0,4)}-${clean.slice(4,6)}-${clean.slice(6,8)}`);
        return new Date(`${clean.slice(0,4)}-${clean.slice(4,6)}-${clean.slice(6,8)}T${clean.slice(8,10)}:${clean.slice(10,12)}:${clean.slice(12,14)}`);
      };
      try {
        events.push({
          title, startAt: parseDate(dtstart), endAt: parseDate(dtend), allDay,
          location: current["LOCATION"] || undefined,
          description: current["DESCRIPTION"] || undefined,
          isRecurring: !!current["RRULE"],
        });
      } catch { /* skip invalid */ }
      current = null; continue;
    }
    if (current !== null) {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).split(";")[0];
        const val = line.slice(colonIdx + 1).replace(/\\n/g, "\n").replace(/\\,/g, ",");
        current[key] = val;
      }
    }
  }
  return events;
}

type ViewMode = "month" | "week" | "agenda";

export default function CalendarPage() {
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { events, addEvents, deleteEvent: deleteCalEvent, clearAll, loadSampleData } = useCalendarStore();
  const handleLoadSample = () => {
    if (events.length > 0) {
      if (!confirm("This will replace all your calendar events with sample data. Continue?")) return;
    }
    loadSampleData();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = parseICS(text);
      if (parsed.length === 0) { toast.error("No events found in ICS file"); return; }
      addEvents({ events: parsed, replaceAll: true });
    } catch { toast.error("Failed to parse ICS file"); }
    finally { setImporting(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  // Month grid
  const monthGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [currentDate]);

  // Week dates
  const weekDates = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay());
    return Array.from({ length: 7 }, (_, i) => { const nd = new Date(d); nd.setDate(d.getDate() + i); return nd; });
  }, [currentDate]);

  // Build event map: "YYYY-MM-DD" -> events[]
  const eventMap = useMemo(() => {
    const map: Record<string, typeof events> = {};
    for (const ev of events) {
      const d = new Date(ev.startAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    }
    return map;
  }, [events]);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };

  const formatTime = (d: Date) => new Date(d).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: Date) => new Date(d).toLocaleDateString("en-AU", { weekday: "short", month: "short", day: "numeric" });

  const selectedEvents = selectedDate ? (eventMap[selectedDate] || []) : [];
  const selectedEventDetail = selectedEventId !== null ? events.find(e => e.id === selectedEventId) : null;

  // Upcoming events (next 60 days)
  const upcomingEvents = useMemo(() => {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(end.getDate() + 60);
    return events.filter(ev => new Date(ev.startAt) >= start && new Date(ev.startAt) <= end)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [events]);

  return (
    <div className="page-container bg-[#012E2B]">
      <PageHeader
        title="Calendar"
        subtitle={`${events.length} events`}
        accent
        right={
          <div className="flex gap-2">
            <button type="button" onClick={handleLoadSample} disabled={false}
              className="flex items-center gap-1.5 bg-[#0a3d39] border border-[rgba(255,220,115,0.2)] text-[#FFDC73] rounded-xl px-3 py-1.5 text-xs font-bold disabled:opacity-50"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <FlaskConical size={12} />
              {false ? "..." : "Sample"}
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={importing || false}
              className="flex items-center gap-1.5 bg-[#FFDC73] text-[#012E2B] rounded-xl px-3 py-1.5 text-xs font-bold disabled:opacity-50"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Upload size={12} /> {importing || false ? "..." : "ICS"}
            </button>
            {events.length > 0 && (
              <button type="button" onClick={() => clearAll()}
                className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        }
      />

      <input ref={fileRef} type="file" accept=".ics,text/calendar" onChange={handleFileChange} className="hidden" />

      <div className="px-4 pt-2 pb-24 flex flex-col gap-4">
        {/* View Mode Toggle */}
        <div className="flex bg-[#0a3d39] rounded-xl p-1">
          {(["month", "week", "agenda"] as ViewMode[]).map((m) => (
            <button key={m} type="button" onClick={() => setViewMode(m)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${viewMode === m ? "bg-[#FFDC73] text-[#012E2B]" : "text-[#8fa8a5]"}`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {m}
            </button>
          ))}
        </div>

        {/* Navigation */}
        {viewMode !== "agenda" && (
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] flex items-center justify-center text-[#8fa8a5]">
              <ChevronLeft size={16} />
            </button>
            <p className="text-[#F8F8FF] font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {viewMode === "month"
                ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : `${formatDate(weekDates[0])} – ${formatDate(weekDates[6])}`}
            </p>
            <button type="button" onClick={() => navigate(1)} className="w-8 h-8 rounded-xl bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] flex items-center justify-center text-[#8fa8a5]">
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Month View */}
        {viewMode === "month" && (
          <Card className="p-0 overflow-hidden">
            <div className="grid grid-cols-7 bg-[#0d4a45]">
              {DAYS.map((d) => <div key={d} className="text-center text-[#8fa8a5] text-[10px] font-semibold py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px bg-[rgba(255,220,115,0.05)] p-1">
              {monthGrid.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const hasEvents = !!eventMap[dateStr];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                return (
                  <button key={day} type="button" onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`flex flex-col items-center justify-start pt-1.5 pb-1 rounded-xl transition-all min-h-[44px] ${
                      isSelected ? "bg-[#FFDC73] text-[#012E2B]" :
                      isToday ? "bg-[#FFDC73]/20" : "active:bg-[#0d4a45]"
                    }`}>
                    <span className={`text-xs font-semibold ${isSelected ? "text-[#012E2B]" : isToday ? "text-[#FFDC73]" : "text-[#F8F8FF]"}`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{day}</span>
                    {hasEvents && <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-[#012E2B]" : "bg-[#FFDC73]"}`} />}
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Week View */}
        {viewMode === "week" && (
          <div className="flex flex-col gap-2">
            {weekDates.map((date) => {
              const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
              const dayEvs = eventMap[dateStr] || [];
              const isToday = dateStr === todayStr;
              return (
                <div key={dateStr} className={`rounded-2xl overflow-hidden ${isToday ? "border border-[#FFDC73]/30" : ""}`}>
                  <div className={`px-3 py-2 flex items-center gap-2 ${isToday ? "bg-[#FFDC73]/10" : "bg-[#0a3d39]"}`}>
                    <span className={`text-xs font-bold ${isToday ? "text-[#FFDC73]" : "text-[#8fa8a5]"}`}>{DAYS[date.getDay()]}</span>
                    <span className={`text-sm font-bold ${isToday ? "text-[#FFDC73]" : "text-[#F8F8FF]"}`}>{date.getDate()}</span>
                    {dayEvs.length > 0 && <span className="ml-auto text-[#8fa8a5] text-xs">{dayEvs.length} event{dayEvs.length > 1 ? "s" : ""}</span>}
                  </div>
                  {dayEvs.length > 0 && (
                    <div className="bg-[#0a3d39]/50 px-3 pb-2 pt-1.5 flex flex-col gap-1.5">
                      {dayEvs.map((ev) => (
                        <button key={ev.id} type="button" onClick={() => setSelectedEventId(ev.id)} className="text-left flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FFDC73] mt-1.5 shrink-0" />
                          <div>
                            <p className="text-[#F8F8FF] text-xs font-semibold">{ev.title}</p>
                            {!ev.allDay && <p className="text-[#8fa8a5] text-[10px]">{formatTime(new Date(ev.startAt))}</p>}
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
            <p className="text-[#8fa8a5] text-xs mb-3">Next 60 days ({upcomingEvents.length} events)</p>
            {upcomingEvents.length === 0 ? (
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
                {upcomingEvents.map((ev) => (
                  <Card key={ev.id} className="border-l-2 border-l-[#FFDC73]">
                    <div className="flex items-start justify-between">
                      <button type="button" onClick={() => setSelectedEventId(ev.id)} className="flex-1 text-left">
                        <p className="text-[#F8F8FF] text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{ev.title}</p>
                        <p className="text-[#FFDC73] text-xs mt-0.5">{formatDate(new Date(ev.startAt))}</p>
                        {!ev.allDay && <p className="text-[#8fa8a5] text-xs">{formatTime(new Date(ev.startAt))} – {formatTime(new Date(ev.endAt))}</p>}
                        {ev.location && <p className="text-[#8fa8a5] text-xs">{ev.location}</p>}
                      </button>
                      <button type="button" onClick={() => deleteEvent({ id: ev.id })} className="text-[#8fa8a5] p-1 active:text-red-400 ml-2">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected day events (month view) */}
        {viewMode === "month" && selectedDate && (
          <div>
            <p className="text-[#F8F8FF] text-sm font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-AU", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            {selectedEvents.length === 0 ? (
              <Card><p className="text-[#8fa8a5] text-sm text-center py-2">No events on this day</p></Card>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedEvents.map((ev) => (
                  <Card key={ev.id} className="border-l-2 border-l-[#FFDC73]">
                    <div className="flex items-start justify-between">
                      <button type="button" onClick={() => setSelectedEventId(ev.id)} className="flex-1 text-left">
                        <p className="text-[#F8F8FF] text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{ev.title}</p>
                        {!ev.allDay && <p className="text-[#8fa8a5] text-xs mt-0.5">{formatTime(new Date(ev.startAt))} – {formatTime(new Date(ev.endAt))}</p>}
                        {ev.location && <p className="text-[#8fa8a5] text-xs">{ev.location}</p>}
                      </button>
                      <button type="button" onClick={() => deleteEvent({ id: ev.id })} className="text-[#8fa8a5] p-1 active:text-red-400 ml-2">
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
          <Card>
            <div className="flex flex-col items-center gap-3 py-4">
              <Upload size={28} className="text-[#8fa8a5]" />
              <p className="text-[#8fa8a5] text-sm text-center">Upload your .ics calendar file<br />to see events here</p>
              <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 bg-[#FFDC73] text-[#012E2B] rounded-xl px-4 py-2 text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <Upload size={14} /> Upload ICS
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEventDetail && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70" onClick={() => setSelectedEventId(null)}>
          <div className="w-full max-w-[480px] bg-[#0a3d39] rounded-t-3xl p-6 pb-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-[#F8F8FF] font-bold text-base flex-1 pr-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{selectedEventDetail.title}</h3>
              <button type="button" onClick={() => setSelectedEventId(null)} className="text-[#8fa8a5]"><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-[#FFDC73]" />
                <span className="text-[#F8F8FF] text-sm">{formatDate(new Date(selectedEventDetail.startAt))}</span>
              </div>
              {!selectedEventDetail.allDay && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#FFDC73]" />
                  <span className="text-[#F8F8FF] text-sm">{formatTime(new Date(selectedEventDetail.startAt))} – {formatTime(new Date(selectedEventDetail.endAt))}</span>
                </div>
              )}
              {selectedEventDetail.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#FFDC73]" />
                  <span className="text-[#F8F8FF] text-sm">{selectedEventDetail.location}</span>
                </div>
              )}
              {selectedEventDetail.isRecurring && <span className="text-[#FFDC73]/60 text-xs">↻ Recurring event</span>}
            </div>
            <button type="button" onClick={() => { deleteEvent({ id: selectedEventDetail.id }); setSelectedEventId(null); }}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl py-2.5 text-red-400 text-sm font-semibold">
              <Trash2 size={14} /> Delete Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
