import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db module
vi.mock("./db", () => ({
  getAnnouncements: vi.fn().mockResolvedValue([
    { id: 1, title: "Test Announcement", content: "Test content", pinned: true, createdAt: new Date() }
  ]),
  createAnnouncement: vi.fn().mockResolvedValue(undefined),
  deleteAnnouncement: vi.fn().mockResolvedValue(undefined),
  updateAnnouncement: vi.fn().mockResolvedValue(undefined),
  getSessions: vi.fn().mockResolvedValue([
    { id: 1, topic: "Study Session", date: "2025-01-01", startTime: "10:00", endTime: "12:00", location: "Library", maxAttendees: 50, notes: null, createdAt: new Date() }
  ]),
  createSession: vi.fn().mockResolvedValue(undefined),
  deleteSession: vi.fn().mockResolvedValue(undefined),
  getGalleryPhotos: vi.fn().mockResolvedValue([
    { id: 1, src: "https://example.com/photo.jpg", caption: "Test photo", source: "admin", visible: true, uploadedAt: new Date() }
  ]),
  getAllGalleryPhotos: vi.fn().mockResolvedValue([]),
  createGalleryPhoto: vi.fn().mockResolvedValue(undefined),
  updateGalleryPhotoVisibility: vi.fn().mockResolvedValue(undefined),
  deleteGalleryPhoto: vi.fn().mockResolvedValue(undefined),
  getUserPhotos: vi.fn().mockResolvedValue([]),
  getAllUserPhotos: vi.fn().mockResolvedValue([]),
  createUserPhoto: vi.fn().mockResolvedValue({ insertId: 1 }),
  submitUserPhoto: vi.fn().mockResolvedValue(undefined),
  updateUserPhotoStatus: vi.fn().mockResolvedValue(undefined),
  deleteUserPhoto: vi.fn().mockResolvedValue(undefined),
  getWamSemesters: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, name: "Semester 1 2025", createdAt: new Date(), subjects: [
      { id: 1, semesterId: 1, code: "COMP1234", name: "Intro to CS", mark: 85, creditPoints: 6, createdAt: new Date() }
    ]}
  ]),
  createWamSemester: vi.fn().mockResolvedValue({ insertId: 1 }),
  deleteWamSemester: vi.fn().mockResolvedValue(undefined),
  getWamSubjects: vi.fn().mockResolvedValue([]),
  createWamSubject: vi.fn().mockResolvedValue({ insertId: 1 }),
  updateWamSubject: vi.fn().mockResolvedValue(undefined),
  deleteWamSubject: vi.fn().mockResolvedValue(undefined),
  getWamAssignments: vi.fn().mockResolvedValue([]),
  createWamAssignment: vi.fn().mockResolvedValue(undefined),
  updateWamAssignment: vi.fn().mockResolvedValue(undefined),
  deleteWamAssignment: vi.fn().mockResolvedValue(undefined),
  getCalendarEvents: vi.fn().mockResolvedValue([]),
  createCalendarEvent: vi.fn().mockResolvedValue(undefined),
  bulkCreateCalendarEvents: vi.fn().mockResolvedValue(undefined),
  deleteCalendarEvents: vi.fn().mockResolvedValue(undefined),
  deleteCalendarEvent: vi.fn().mockResolvedValue(undefined),
  getStudyGoals: vi.fn().mockResolvedValue([]),
  createStudyGoal: vi.fn().mockResolvedValue(undefined),
  deleteStudyGoal: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/test.jpg", key: "test.jpg" }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserCtx(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-open-id",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { headers: {}, cookies: {} } as unknown as TrpcContext["req"],
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminCtx(): TrpcContext {
  return createUserCtx("admin");
}

describe("Announcements Router", () => {
  it("list returns announcements for public users", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.announcements.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("title");
  });

  it("create requires admin role", async () => {
    const caller = appRouter.createCaller(createUserCtx("user"));
    await expect(
      caller.announcements.create({ title: "Test", content: "Content" })
    ).rejects.toThrow();
  });

  it("admin can create announcement", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    await expect(
      caller.announcements.create({ title: "Test", content: "Content", pinned: false })
    ).resolves.not.toThrow();
  });
});

describe("Sessions Router", () => {
  it("list returns sessions for public users", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.sessions.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("create requires admin role", async () => {
    const caller = appRouter.createCaller(createUserCtx("user"));
    await expect(
      caller.sessions.create({
        topic: "Study",
        date: "2025-01-01",
        startTime: "10:00",
        endTime: "12:00",
        location: "Library",
      })
    ).rejects.toThrow();
  });
});

describe("Gallery Router", () => {
  it("list returns visible gallery photos", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.gallery.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("listAll requires admin role", async () => {
    const caller = appRouter.createCaller(createUserCtx("user"));
    await expect(caller.gallery.listAll()).rejects.toThrow();
  });

  it("admin can access listAll", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.gallery.listAll();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("WAM Router", () => {
  it("semesters requires authentication", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] });
    await expect(caller.wam.semesters()).rejects.toThrow();
  });

  it("authenticated user can get semesters", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.wam.semesters();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("subjects");
  });

  it("authenticated user can create semester", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.wam.createSemester({ name: "Semester 2 2025" })
    ).resolves.not.toThrow();
  });

  it("authenticated user can create subject", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.wam.createSubject({ semesterId: 1, code: "COMP5678", name: "Advanced CS", mark: 90, creditPoints: 6 })
    ).resolves.not.toThrow();
  });
});

describe("User Photos Router", () => {
  it("myPhotos requires authentication", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] });
    await expect(caller.userPhotos.myPhotos()).rejects.toThrow();
  });

  it("authenticated user can get their photos", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.userPhotos.myPhotos();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allPhotos requires admin role", async () => {
    const caller = appRouter.createCaller(createUserCtx("user"));
    await expect(caller.userPhotos.allPhotos()).rejects.toThrow();
  });

  it("admin can access all user photos", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.userPhotos.allPhotos();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Calendar Router", () => {
  it("events requires authentication", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] });
    await expect(caller.calendar.events()).rejects.toThrow();
  });

  it("authenticated user can get events", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.calendar.events();
    expect(Array.isArray(result)).toBe(true);
  });

  it("authenticated user can import ICS events", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.calendar.importIcs({
      events: [
        {
          title: "Test Event",
          startAt: new Date("2025-01-15T10:00:00"),
          endAt: new Date("2025-01-15T12:00:00"),
          allDay: false,
        }
      ],
      replaceAll: false,
    });
    expect(result).toHaveProperty("count", 1);
  });
});
