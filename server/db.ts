import { and, eq, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { ENV } from "./_core/env";
import {
  users, type InsertUser,
  announcements, type Announcement,
  sessions, type Session,
  galleryPhotos,
  userPhotos,
  wamSemesters,
  wamSubjects, type WamSubject,
  wamAssignments, type WamAssignment,
  calendarEvents,
  studyGoals,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "university", "displayName"] as const;
    for (const field of textFields) {
      const value = user[field];
      if (value !== undefined) {
        const normalized = value ?? null;
        values[field] = normalized;
        updateSet[field] = normalized;
      }
    }

    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Announcements ────────────────────────────────────────────────────────────
export async function getAnnouncements() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(announcements).orderBy(desc(announcements.pinned), desc(announcements.createdAt));
}

export async function createAnnouncement(data: { title: string; content: string; pinned?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(announcements).values(data);
}

export async function updateAnnouncement(id: number, data: Partial<Pick<Announcement, "title" | "content" | "pinned">>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(announcements).set(data).where(eq(announcements.id, id));
}

export async function deleteAnnouncement(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(announcements).where(eq(announcements.id, id));
}

// ─── Sessions ─────────────────────────────────────────────────────────────────
export async function getSessions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessions).orderBy(asc(sessions.date));
}

export async function createSession(data: Omit<Session, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(sessions).values(data);
}

export async function deleteSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(sessions).where(eq(sessions.id, id));
}

// ─── Gallery Photos ───────────────────────────────────────────────────────────
export async function getGalleryPhotos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(galleryPhotos).where(eq(galleryPhotos.visible, true)).orderBy(desc(galleryPhotos.uploadedAt));
}

export async function getAllGalleryPhotos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(galleryPhotos).orderBy(desc(galleryPhotos.uploadedAt));
}

export async function createGalleryPhoto(data: { src: string; caption?: string; source: "admin" | "user"; uploadedBy?: number }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(galleryPhotos).values({ ...data, visible: true });
}

export async function updateGalleryPhotoVisibility(id: number, visible: boolean) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(galleryPhotos).set({ visible }).where(eq(galleryPhotos.id, id));
}

export async function deleteGalleryPhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
}

// ─── User Photos ──────────────────────────────────────────────────────────────
export async function getUserPhotos(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userPhotos).where(eq(userPhotos.userId, userId)).orderBy(desc(userPhotos.uploadedAt));
}

export async function getAllUserPhotos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userPhotos).orderBy(desc(userPhotos.uploadedAt));
}

export async function createUserPhoto(data: { userId: number; src: string; caption?: string }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(userPhotos).values({ ...data, submitted: false, status: "pending" });
  return result;
}

export async function submitUserPhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(userPhotos).set({ submitted: true }).where(eq(userPhotos.id, id));
}

export async function updateUserPhotoStatus(id: number, status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(userPhotos).set({ status }).where(eq(userPhotos.id, id));
  if (status === "approved") {
    const photos = await db.select().from(userPhotos).where(eq(userPhotos.id, id)).limit(1);
    if (photos[0]) {
      await db.insert(galleryPhotos).values({
        src: photos[0].src,
        caption: photos[0].caption ?? undefined,
        source: "user",
        uploadedBy: photos[0].userId,
        visible: true,
      });
    }
  }
}

export async function deleteUserPhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(userPhotos).where(eq(userPhotos.id, id));
}

// ─── WAM ──────────────────────────────────────────────────────────────────────
export async function getWamSemesters(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const sems = await db.select().from(wamSemesters).where(eq(wamSemesters.userId, userId)).orderBy(asc(wamSemesters.createdAt));
  const result = await Promise.all(sems.map(async (sem) => {
    const subjects = await db!.select().from(wamSubjects).where(eq(wamSubjects.semesterId, sem.id)).orderBy(asc(wamSubjects.createdAt));
    return { ...sem, subjects };
  }));
  return result;
}

export async function createWamSemester(userId: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(wamSemesters).values({ userId, name });
  const insertId = (result as unknown as { insertId: number }).insertId;
  return { insertId };
}

export async function deleteWamSemester(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const subs = await db.select().from(wamSubjects).where(eq(wamSubjects.semesterId, id));
  for (const sub of subs) {
    await db.delete(wamAssignments).where(eq(wamAssignments.subjectId, sub.id));
  }
  await db.delete(wamSubjects).where(eq(wamSubjects.semesterId, id));
  await db.delete(wamSemesters).where(eq(wamSemesters.id, id));
}

export async function getWamSubjects(semesterId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(wamSubjects).where(eq(wamSubjects.semesterId, semesterId)).orderBy(asc(wamSubjects.createdAt));
}

export async function createWamSubject(data: { semesterId: number; code: string; name: string; mark?: number; creditPoints?: number }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(wamSubjects).values(data);
  return result;
}

export async function updateWamSubject(id: number, data: Partial<Pick<WamSubject, "mark" | "creditPoints" | "code" | "name">>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(wamSubjects).set(data).where(eq(wamSubjects.id, id));
}

export async function deleteWamSubject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(wamAssignments).where(eq(wamAssignments.subjectId, id));
  await db.delete(wamSubjects).where(eq(wamSubjects.id, id));
}

export async function getWamAssignments(subjectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(wamAssignments).where(eq(wamAssignments.subjectId, subjectId)).orderBy(asc(wamAssignments.createdAt));
}

export async function createWamAssignment(data: { subjectId: number; name: string; userScore?: number; maxScore?: number; weight?: number }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(wamAssignments).values(data);
}

export async function updateWamAssignment(id: number, data: Partial<Pick<WamAssignment, "name" | "userScore" | "maxScore" | "weight">>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(wamAssignments).set(data).where(eq(wamAssignments.id, id));
}

export async function deleteWamAssignment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(wamAssignments).where(eq(wamAssignments.id, id));
}

// ─── Calendar Events ──────────────────────────────────────────────────────────
export async function getCalendarEvents(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId)).orderBy(asc(calendarEvents.startAt));
}

export async function createCalendarEvent(data: {
  userId: number; title: string; startAt: Date; endAt: Date;
  allDay?: boolean; location?: string; description?: string; isRecurring?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(calendarEvents).values(data);
}

export async function bulkCreateCalendarEvents(events: Array<{
  userId: number; title: string; startAt: Date; endAt: Date;
  allDay?: boolean; location?: string; description?: string; isRecurring?: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (events.length === 0) return;
  // Insert in batches of 100
  for (let i = 0; i < events.length; i += 100) {
    await db.insert(calendarEvents).values(events.slice(i, i + 100));
  }
}

export async function deleteCalendarEvents(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(calendarEvents).where(eq(calendarEvents.userId, userId));
}

export async function deleteCalendarEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
}

// ─── Study Goals ──────────────────────────────────────────────────────────────
export async function getStudyGoals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studyGoals).where(eq(studyGoals.userId, userId)).orderBy(desc(studyGoals.createdAt));
}

export async function createStudyGoal(data: { userId: number; semesterName: string; targetWAM: number; targetGrade?: string; note?: string }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(studyGoals).values(data);
}

export async function deleteStudyGoal(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(studyGoals).where(eq(studyGoals.id, id));
}

// ─── Auto Seed ────────────────────────────────────────────────────────────────
const SNL_PHOTO_URLS = [
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/LuSoHgPuFedJlkOV.png", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/hfwndFshCbODmDNI.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/wTJIgAyVHyJWqrHv.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/yvPtyKZxRYNZCHWR.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/YwJNflsjECeQRfmA.webp", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/BZTkVrqJFEjFdoZc.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/ihTxhGTNBNyGCAnJ.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/oOOdAbroiKfSssLs.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/rhCFLLOHlDvGNmGG.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/rLGOhhPiogoIxbXh.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/WMiPSJoDeuquMmMV.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/YFOsvnfKxGDdlMeS.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/iJdIUogZxQYpoXkn.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/yWyLnNLHzMLSJWpo.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/adQGyOVCrFHluyxN.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/CYVgJZRAfVGicDYA.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/xxorekwSAdyqMhKW.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/LwHGCkxIlXtMfdjF.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/ituZelnonEgBgvQN.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/YJHvlwltRaVLBaHi.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/PpYyupaMfmthxwQN.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/arlsmpUOYsDttZVP.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/QsbfUJeDlMipuoAW.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/iYxYyhyOyBEMNNWE.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/oPbvvHRSlvdcCMwm.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/URPWPMcXGeZXCJFq.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/LIOLCjqpAqHKPZYF.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/xFVhLJHQkkfVrLph.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/YXwHPwOmXxxtoxkk.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/ekvFXDosLwxDVSWn.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/ETvzqnYCbarKaGPI.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/ajRoneiDsDJsQwnL.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/mLjtQBPDkVLOcsMI.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/FUIiAEIsYtcpNnCU.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/ArHgnegVyltdbAAb.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/oXYuKflncGaDuHCj.jpg", caption: "SNL Study Session" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663322273601/yBUfZuYGXGYvRjxe.jpg", caption: "SNL Study Session" },
];

export async function autoSeedGalleryIfEmpty(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    const existing = await db.select().from(galleryPhotos).limit(1);
    if (existing.length > 0) return; // Already seeded
    console.log("[DB] Gallery is empty, auto-seeding SNL photos...");
    for (const photo of SNL_PHOTO_URLS) {
      await db.insert(galleryPhotos).values({ src: photo.url, caption: photo.caption, source: "admin", visible: true });
    }
    console.log(`[DB] Auto-seeded ${SNL_PHOTO_URLS.length} SNL photos.`);
  } catch (error) {
    console.error("[DB] Auto-seed failed:", error);
  }
}
