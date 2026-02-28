import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import * as db from "./db";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  // ─── Auth ──────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Announcements ─────────────────────────────────────────────────────────
  announcements: router({
    list: publicProcedure.query(() => db.getAnnouncements()),
    create: adminProcedure
      .input(z.object({ title: z.string().min(1), content: z.string().min(1), pinned: z.boolean().optional() }))
      .mutation(({ input }) => db.createAnnouncement(input)),
    update: adminProcedure
      .input(z.object({ id: z.number(), title: z.string().optional(), content: z.string().optional(), pinned: z.boolean().optional() }))
      .mutation(({ input: { id, ...data } }) => db.updateAnnouncement(id, data)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteAnnouncement(input.id)),
  }),

  // ─── Sessions ──────────────────────────────────────────────────────────────
  sessions: router({
    list: publicProcedure.query(() => db.getSessions()),
    create: adminProcedure
      .input(z.object({
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        location: z.string(),
        topic: z.string(),
        maxAttendees: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createSession({ ...input, maxAttendees: input.maxAttendees ?? 50, notes: input.notes ?? null })),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteSession(input.id)),
  }),

  // ─── Gallery ───────────────────────────────────────────────────────────────
  gallery: router({
    list: publicProcedure.query(() => db.getGalleryPhotos()),
    listAll: adminProcedure.query(() => db.getAllGalleryPhotos()),
    upload: adminProcedure
      .input(z.object({ base64: z.string(), caption: z.string().optional(), mimeType: z.string().default("image/jpeg") }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.base64.replace(/^data:[^;]+;base64,/, ""), "base64");
        const key = `gallery/admin-${nanoid(8)}.jpg`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await db.createGalleryPhoto({ src: url, caption: input.caption, source: "admin", uploadedBy: ctx.user.id });
        return { url };
      }),
    toggleVisibility: adminProcedure
      .input(z.object({ id: z.number(), visible: z.boolean() }))
      .mutation(({ input }) => db.updateGalleryPhotoVisibility(input.id, input.visible)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteGalleryPhoto(input.id)),
    addByUrl: adminProcedure
      .input(z.object({ url: z.string().url(), caption: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await db.createGalleryPhoto({ src: input.url, caption: input.caption, source: "admin", uploadedBy: ctx.user.id });
        return { url: input.url };
      }),
    seedDefault: adminProcedure
      .mutation(async ({ ctx }) => {
        const SNL_PHOTOS = [
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
        for (const photo of SNL_PHOTOS) {
          await db.createGalleryPhoto({ src: photo.url, caption: photo.caption, source: "admin", uploadedBy: ctx.user.id });
        }
        return { count: SNL_PHOTOS.length };
      }),
  }),

  // ─── User Photos ───────────────────────────────────────────────────────────
  userPhotos: router({
    myPhotos: protectedProcedure.query(({ ctx }) => db.getUserPhotos(ctx.user.id)),
    allPhotos: adminProcedure.query(() => db.getAllUserPhotos()),
    upload: protectedProcedure
      .input(z.object({ base64: z.string(), caption: z.string().optional(), mimeType: z.string().default("image/jpeg") }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.base64.replace(/^data:[^;]+;base64,/, ""), "base64");
        const key = `user-photos/${ctx.user.id}-${nanoid(8)}.jpg`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await db.createUserPhoto({ userId: ctx.user.id, src: url, caption: input.caption });
        return { url };
      }),
    submit: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.submitUserPhoto(input.id)),
    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["pending", "approved", "rejected"]) }))
      .mutation(({ input }) => db.updateUserPhotoStatus(input.id, input.status)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteUserPhoto(input.id)),
  }),

  // ─── WAM ───────────────────────────────────────────────────────────────────
  wam: router({
    semesters: protectedProcedure.query(({ ctx }) => db.getWamSemesters(ctx.user.id)),
    createSemester: protectedProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(({ ctx, input }) => db.createWamSemester(ctx.user.id, input.name)),
    deleteSemester: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteWamSemester(input.id)),

    subjects: protectedProcedure
      .input(z.object({ semesterId: z.number() }))
      .query(({ input }) => db.getWamSubjects(input.semesterId)),
    createSubject: protectedProcedure
      .input(z.object({ semesterId: z.number(), code: z.string(), name: z.string(), mark: z.number().optional(), creditPoints: z.number().optional() }))
      .mutation(({ input }) => db.createWamSubject(input)),
    updateSubject: protectedProcedure
      .input(z.object({ id: z.number(), mark: z.number().optional(), creditPoints: z.number().optional(), code: z.string().optional(), name: z.string().optional() }))
      .mutation(({ input: { id, ...data } }) => db.updateWamSubject(id, data)),
    deleteSubject: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteWamSubject(input.id)),

    assignments: protectedProcedure
      .input(z.object({ subjectId: z.number() }))
      .query(({ input }) => db.getWamAssignments(input.subjectId)),
    createAssignment: protectedProcedure
      .input(z.object({ subjectId: z.number(), name: z.string(), userScore: z.number().optional(), maxScore: z.number().optional(), weight: z.number().optional() }))
      .mutation(({ input }) => db.createWamAssignment(input)),
    updateAssignment: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), userScore: z.number().optional(), maxScore: z.number().optional(), weight: z.number().optional() }))
      .mutation(({ input: { id, ...data } }) => db.updateWamAssignment(id, data)),
    deleteAssignment: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteWamAssignment(input.id)),
    loadSample: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Clear existing semesters
        const existing = await db.getWamSemesters(ctx.user.id);
        for (const sem of existing) {
          await db.deleteWamSemester(sem.id);
        }
        // Semester 1 2024
        const s1 = await db.createWamSemester(ctx.user.id, "Semester 1 2024");
        const s1id = s1.insertId;
        await db.createWamSubject({ semesterId: s1id, code: "COMP1511", name: "Programming Fundamentals", mark: 88, creditPoints: 6 });
        await db.createWamSubject({ semesterId: s1id, code: "MATH1131", name: "Mathematics 1A", mark: 75, creditPoints: 6 });
        await db.createWamSubject({ semesterId: s1id, code: "ENGG1000", name: "Engineering Design", mark: 82, creditPoints: 6 });
        await db.createWamSubject({ semesterId: s1id, code: "COMP1521", name: "Computer Systems Fundamentals", mark: 91, creditPoints: 6 });
        // Semester 2 2024
        const s2 = await db.createWamSemester(ctx.user.id, "Semester 2 2024");
        const s2id = s2.insertId;
        await db.createWamSubject({ semesterId: s2id, code: "COMP2521", name: "Data Structures & Algorithms", mark: 79, creditPoints: 6 });
        await db.createWamSubject({ semesterId: s2id, code: "MATH1231", name: "Mathematics 1B", mark: 68, creditPoints: 6 });
        await db.createWamSubject({ semesterId: s2id, code: "COMP2041", name: "Software Construction", mark: 85, creditPoints: 6 });
        await db.createWamSubject({ semesterId: s2id, code: "COMP3311", name: "Database Systems", mark: 72, creditPoints: 6 });
        return { success: true, count: 2 };
      }),
  }),

  // ─── Calendar ──────────────────────────────────────────────────────────────
  calendar: router({
    events: protectedProcedure.query(({ ctx }) => db.getCalendarEvents(ctx.user.id)),
    importIcs: protectedProcedure
      .input(z.object({
        events: z.array(z.object({
          title: z.string(),
          startAt: z.date(),
          endAt: z.date(),
          allDay: z.boolean().optional(),
          location: z.string().optional(),
          description: z.string().optional(),
          isRecurring: z.boolean().optional(),
        })),
        replaceAll: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.replaceAll) await db.deleteCalendarEvents(ctx.user.id);
        await db.bulkCreateCalendarEvents(input.events.map((e) => ({ ...e, userId: ctx.user.id })));
        return { count: input.events.length };
      }),
    deleteEvent: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteCalendarEvent(input.id)),
    clearAll: protectedProcedure.mutation(({ ctx }) => db.deleteCalendarEvents(ctx.user.id)),
    loadSample: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.deleteCalendarEvents(ctx.user.id);
        const now = new Date();
        const d = (offset: number, h: number, m = 0) => {
          const dt = new Date(now); dt.setDate(dt.getDate() + offset); dt.setHours(h, m, 0, 0); return dt;
        };
        const nextSat = (7 - now.getDay()) % 7 || 7;
        const events = [
          { title: "SNL Study Session — Algorithms", startAt: d(nextSat, 10), endAt: d(nextSat, 13), allDay: false, location: "Fisher Library Level 2", description: "Focus: Graph algorithms & dynamic programming" },
          { title: "SNL Study Session — Databases", startAt: d(nextSat + 7, 10), endAt: d(nextSat + 7, 13), allDay: false, location: "Fisher Library Level 2", description: "Focus: SQL & normalisation" },
          { title: "SNL Study Session — OS Concepts", startAt: d(nextSat + 14, 10), endAt: d(nextSat + 14, 13), allDay: false, location: "Fisher Library Level 2", description: "Focus: Processes, threads & memory" },
          { title: "COMP2521 Assignment 2 Due", startAt: d(5, 23, 59), endAt: d(5, 23, 59), allDay: false, description: "Binary search tree implementation" },
          { title: "MATH1231 Mid-term Exam", startAt: d(10, 9), endAt: d(10, 11), allDay: false, location: "Mathews Theatre A", description: "Covers Chapters 1–5" },
          { title: "COMP3311 Quiz 3", startAt: d(3, 14), endAt: d(3, 15), allDay: false, location: "Online (Moodle)", description: "Relational algebra & SQL" },
          { title: "COMP2041 Final Project Due", startAt: d(18, 23, 59), endAt: d(18, 23, 59), allDay: false, description: "Shell scripting project" },
          { title: "COMP2521 Lecture", startAt: d(1, 10), endAt: d(1, 12), allDay: false, location: "Clancy Auditorium", isRecurring: true },
          { title: "COMP3311 Lecture", startAt: d(2, 13), endAt: d(2, 15), allDay: false, location: "Mathews Theatre B", isRecurring: true },
          { title: "SNL Welcome BBQ", startAt: d(nextSat + 21, 12), endAt: d(nextSat + 21, 15), allDay: false, location: "Quad Lawn", description: "End-of-term celebration!" },
        ];
        await db.bulkCreateCalendarEvents(events.map((e) => ({ ...e, userId: ctx.user.id })));
        return { count: events.length };
      }),
  }),

  // ─── Study Goals ───────────────────────────────────────────────────────────
  goals: router({
    list: protectedProcedure.query(({ ctx }) => db.getStudyGoals(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({ semesterName: z.string().min(1), targetWAM: z.number(), targetGrade: z.string().optional(), note: z.string().optional() }))
      .mutation(({ ctx, input }) => db.createStudyGoal({ ...input, userId: ctx.user.id })),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteStudyGoal(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
