import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  university: varchar("university", { length: 128 }),
  displayName: varchar("displayName", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Announcements ────────────────────────────────────────────────────────────
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  pinned: boolean("pinned").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 16 }).notNull(),
  startTime: varchar("startTime", { length: 8 }).notNull(),
  endTime: varchar("endTime", { length: 8 }).notNull(),
  location: varchar("location", { length: 256 }).notNull(),
  topic: varchar("topic", { length: 256 }).notNull(),
  maxAttendees: int("maxAttendees").default(50).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;

// ─── Gallery Photos ───────────────────────────────────────────────────────────
export const galleryPhotos = mysqlTable("gallery_photos", {
  id: int("id").autoincrement().primaryKey(),
  src: text("src").notNull(),
  caption: varchar("caption", { length: 512 }),
  visible: boolean("visible").default(true).notNull(),
  source: mysqlEnum("source", ["admin", "user"]).default("admin").notNull(),
  uploadedBy: int("uploadedBy"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type GalleryPhoto = typeof galleryPhotos.$inferSelect;

// ─── User Photos ──────────────────────────────────────────────────────────────
export const userPhotos = mysqlTable("user_photos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  src: text("src").notNull(),
  caption: varchar("caption", { length: 512 }),
  submitted: boolean("submitted").default(false).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type UserPhoto = typeof userPhotos.$inferSelect;

// ─── WAM Semesters ────────────────────────────────────────────────────────────
export const wamSemesters = mysqlTable("wam_semesters", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WamSemester = typeof wamSemesters.$inferSelect;

// ─── WAM Subjects ─────────────────────────────────────────────────────────────
export const wamSubjects = mysqlTable("wam_subjects", {
  id: int("id").autoincrement().primaryKey(),
  semesterId: int("semesterId").notNull(),
  code: varchar("code", { length: 32 }).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  mark: float("mark"),
  creditPoints: float("creditPoints"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WamSubject = typeof wamSubjects.$inferSelect;

// ─── WAM Assignments ──────────────────────────────────────────────────────────
export const wamAssignments = mysqlTable("wam_assignments", {
  id: int("id").autoincrement().primaryKey(),
  subjectId: int("subjectId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  userScore: float("userScore"),
  maxScore: float("maxScore"),
  weight: float("weight"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WamAssignment = typeof wamAssignments.$inferSelect;

// ─── Calendar Events ──────────────────────────────────────────────────────────
export const calendarEvents = mysqlTable("calendar_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  startAt: timestamp("startAt").notNull(),
  endAt: timestamp("endAt").notNull(),
  allDay: boolean("allDay").default(false).notNull(),
  location: varchar("location", { length: 512 }),
  description: text("description"),
  isRecurring: boolean("isRecurring").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;

// ─── Study Goals ──────────────────────────────────────────────────────────────
export const studyGoals = mysqlTable("study_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  semesterName: varchar("semesterName", { length: 128 }).notNull(),
  targetWAM: float("targetWAM").notNull(),
  targetGrade: varchar("targetGrade", { length: 32 }),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudyGoal = typeof studyGoals.$inferSelect;
