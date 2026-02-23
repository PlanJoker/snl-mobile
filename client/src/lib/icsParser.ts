import { RRule, RRuleSet } from "rrule";
import type { CalendarEvent } from "../stores/calendarStore";

let eventId = 1;

export function parseICSFile(text: string): CalendarEvent[] {
  const rangeStart = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const rangeEnd = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);

  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const unfolded = lines.replace(/\n[ \t]/g, "");
  const lineArr = unfolded.split("\n");

  const rawEvents: Array<Record<string, string>> = [];
  let current: Record<string, string> | null = null;

  for (const line of lineArr) {
    if (line === "BEGIN:VEVENT") {
      current = {};
    } else if (line === "END:VEVENT" && current) {
      rawEvents.push(current);
      current = null;
    } else if (current) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const keyPart = line.substring(0, colonIdx).toUpperCase();
      const value = line.substring(colonIdx + 1);
      const baseKey = keyPart.split(";")[0];
      if (baseKey === "DTSTART") current["DTSTART_PARAMS"] = keyPart.substring(7);
      if (baseKey === "DTEND") current["DTEND_PARAMS"] = keyPart.substring(5);
      current[baseKey] = value;
      if (baseKey === "EXDATE") {
        current["EXDATES"] = (current["EXDATES"] ? current["EXDATES"] + "," : "") + value;
      }
    }
  }

  const events: CalendarEvent[] = [];

  for (const raw of rawEvents) {
    if (!raw["DTSTART"] || !raw["SUMMARY"]) continue;

    const { date: startDate, allDay } = parseICSDate(raw["DTSTART"], raw["DTSTART_PARAMS"] || "");
    let endDate: Date;
    if (raw["DTEND"]) {
      endDate = parseICSDate(raw["DTEND"], raw["DTEND_PARAMS"] || "").date;
    } else if (raw["DURATION"]) {
      endDate = new Date(startDate.getTime() + parseDuration(raw["DURATION"]));
    } else {
      endDate = allDay
        ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
        : new Date(startDate.getTime() + 60 * 60 * 1000);
    }

    const durationMs = Math.max(0, endDate.getTime() - startDate.getTime());
    const makeEvent = (start: Date): CalendarEvent => ({
      id: eventId++,
      title: decodeICSText(raw["SUMMARY"]),
      start,
      end: new Date(start.getTime() + durationMs),
      allDay,
      location: raw["LOCATION"] ? decodeICSText(raw["LOCATION"]) : undefined,
      description: raw["DESCRIPTION"] ? decodeICSText(raw["DESCRIPTION"]) : undefined,
      uid: raw["UID"],
      isRecurring: !!raw["RRULE"],
    });

    if (!raw["RRULE"]) {
      events.push(makeEvent(startDate));
    } else {
      try {
        const rruleSet = new RRuleSet();
        const dtStartStr = formatDateForRRule(startDate, allDay);
        const rruleStr = `DTSTART:${dtStartStr}\nRRULE:${raw["RRULE"]}`;
        const rule = RRule.fromString(rruleStr);
        rruleSet.rrule(rule);

        if (raw["EXDATES"]) {
          for (const exStr of raw["EXDATES"].split(",")) {
            try {
              const exDate = parseICSDate(exStr.replace(/;.*?:/, ":").split(":").pop() || exStr, "").date;
              rruleSet.exdate(exDate);
            } catch { /* ignore */ }
          }
        }

        const occurrences = rruleSet.between(rangeStart, rangeEnd, true);
        for (const occ of occurrences) {
          const localOcc = new Date(
            occ.getUTCFullYear(), occ.getUTCMonth(), occ.getUTCDate(),
            allDay ? 0 : occ.getUTCHours(), allDay ? 0 : occ.getUTCMinutes(), allDay ? 0 : occ.getUTCSeconds()
          );
          events.push(makeEvent(localOcc));
        }
        if (occurrences.length === 0) events.push(makeEvent(startDate));
      } catch {
        events.push(makeEvent(startDate));
      }
    }
  }

  events.sort((a, b) => a.start.getTime() - b.start.getTime());
  return events;
}

function parseICSDate(value: string, params: string): { date: Date; allDay: boolean } {
  const clean = value.trim();
  if (clean.length === 8 && !clean.includes("T")) {
    return {
      date: new Date(parseInt(clean.substring(0, 4)), parseInt(clean.substring(4, 6)) - 1, parseInt(clean.substring(6, 8))),
      allDay: true,
    };
  }
  if (params.toUpperCase().includes("VALUE=DATE")) {
    return {
      date: new Date(parseInt(clean.substring(0, 4)), parseInt(clean.substring(4, 6)) - 1, parseInt(clean.substring(6, 8))),
      allDay: true,
    };
  }
  const isUTC = clean.endsWith("Z");
  const s = clean.replace("Z", "");
  const year = parseInt(s.substring(0, 4));
  const month = parseInt(s.substring(4, 6)) - 1;
  const day = parseInt(s.substring(6, 8));
  const hour = parseInt(s.substring(9, 11) || "0");
  const minute = parseInt(s.substring(11, 13) || "0");
  const second = parseInt(s.substring(13, 15) || "0");
  const date = isUTC
    ? new Date(Date.UTC(year, month, day, hour, minute, second))
    : new Date(year, month, day, hour, minute, second);
  return { date, allDay: false };
}

function parseDuration(duration: string): number {
  let ms = 0;
  const m = duration.match(/P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/);
  if (!m) return 0;
  if (m[1]) ms += parseInt(m[1]) * 7 * 24 * 60 * 60 * 1000;
  if (m[2]) ms += parseInt(m[2]) * 24 * 60 * 60 * 1000;
  if (m[3]) ms += parseInt(m[3]) * 60 * 60 * 1000;
  if (m[4]) ms += parseInt(m[4]) * 60 * 1000;
  if (m[5]) ms += parseInt(m[5]) * 1000;
  return ms;
}

function formatDateForRRule(date: Date, allDay: boolean): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  if (allDay) return `${y}${mo}${d}`;
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}${mo}${d}T${h}${mi}${s}`;
}

function decodeICSText(value: string): string {
  return value.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}
