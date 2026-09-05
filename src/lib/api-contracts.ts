import { z } from "zod";

export const roleSchema = z.enum(["ADMIN", "MANAGER", "REP"]);
export type Role = z.infer<typeof roleSchema>;

export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  displayName: z.string(),
  isPlatformAdmin: z.boolean().optional(),
});

export const companyProfileSchema = z.object({
  companyName: z.string().optional(),
  salesMotion: z.string().optional(),
  masteryGoals: z.string().optional(),
}).passthrough();
export type CompanyProfile = z.infer<typeof companyProfileSchema>;

export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  companyProfile: companyProfileSchema.nullable().optional(),
}).passthrough();
export type Organization = z.infer<typeof organizationSchema>;

export const sessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.literal("Bearer"),
  expiresIn: z.number(),
  user: userSchema,
  organization: organizationSchema,
  role: roleSchema,
  isPlatformAdmin: z.boolean().optional(),
});
export type Session = z.infer<typeof sessionSchema>;

export const publicSessionSchema = sessionSchema.omit({
  accessToken: true,
  refreshToken: true,
});
export type PublicSession = z.infer<typeof publicSessionSchema>;

export const currentUserSchema = z.object({
  user: userSchema,
  organization: organizationSchema,
  role: roleSchema,
  isPlatformAdmin: z.boolean().optional(),
  memberships: z.array(z.object({
    organization: organizationSchema,
    role: roleSchema,
  })),
});
export type CurrentUser = z.infer<typeof currentUserSchema>;

export const platformOrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  companyProfile: companyProfileSchema.nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  counts: z.object({
    members: z.number(),
    invitations: z.number().optional(),
    reps: z.number(),
    programs: z.number(),
    assignments: z.number(),
    knowledgeSources: z.number().optional(),
  }),
  admins: z.array(z.object({
    id: z.string(),
    email: z.email(),
    displayName: z.string(),
    role: roleSchema,
  })).optional(),
});
export const platformOrganizationsSchema = z.array(platformOrganizationSchema);
export type PlatformOrganization = z.infer<typeof platformOrganizationSchema>;

export const createOrganizationResultSchema = z.object({
  organization: organizationSchema,
  admin: z.object({
    id: z.string(),
    email: z.email(),
    displayName: z.string(),
  }),
  createdAdminUser: z.boolean(),
});
export type CreateOrganizationResult = z.infer<typeof createOrganizationResultSchema>;

export const learningTaskSchema = z.object({
  id: z.string(),
  type: z.enum(["LESSON", "ASSESSMENT", "SIMULATION"]),
  title: z.string(),
  content: z.unknown(),
  ordinal: z.number(),
});
export type LearningTask = z.infer<typeof learningTaskSchema>;

const programDaySchema = z.object({
  id: z.string(),
  dayNumber: z.number(),
  title: z.string(),
  tasks: z.array(learningTaskSchema),
});

const programVersionSchema = z.object({
  id: z.string(),
  version: z.number(),
  days: z.array(programDaySchema),
});

export const assignmentSchema = z.object({
  id: z.string(),
  status: z.enum(["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  dueAt: z.string().nullable(),
  program: z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(["DRAFT", "REVIEW", "APPROVED", "ARCHIVED"]),
    versions: z.array(programVersionSchema),
  }),
});
export const assignmentsSchema = z.array(assignmentSchema);
export type ProgramAssignment = z.infer<typeof assignmentSchema>;

export const simulationScenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["INTERVIEW", "ROLEPLAY"]),
  persona: z.unknown(),
  rubric: z.unknown(),
  createdAt: z.string(),
});
export const simulationScenariosSchema = z.array(simulationScenarioSchema);
export type SimulationScenario = z.infer<typeof simulationScenarioSchema>;

export const simulationSessionSchema = z.object({
  id: z.string(),
  scenarioId: z.string(),
  status: z.enum(["IN_PROGRESS", "COMPLETED", "ABANDONED"]),
  createdAt: z.string(),
});
export type SimulationSession = z.infer<typeof simulationSessionSchema>;

export const simulationMessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  role: z.enum(["USER", "ASSISTANT", "SYSTEM"]),
  content: z.string(),
  createdAt: z.string(),
});
export const simulationMessagesSchema = z.array(simulationMessageSchema);
export type SimulationMessage = z.infer<typeof simulationMessageSchema>;

export const simulationEvaluationSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  score: z.coerce.number(),
  skillScores: z.record(z.string(), z.coerce.number()),
  feedback: z.array(z.string()),
  createdAt: z.string(),
});
export type SimulationEvaluation = z.infer<typeof simulationEvaluationSchema>;

export const readinessSnapshotSchema = z.object({
  id: z.string(),
  userId: z.string(),
  score: z.coerce.number(),
  status: z.enum(["NOT_READY", "READY"]),
  skillScores: z.unknown(),
  finalRoleplayComplete: z.boolean(),
  calculatedAt: z.string(),
});

export const managementDashboardSchema = z.object({
  members: z.number(),
  assignments: z.array(z.object({
    status: z.enum(["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
    _count: z.union([
      z.number(),
      z.object({ _all: z.number() }),
    ]).transform((value) => (typeof value === "number" ? value : value._all)),
  })),
  latestSnapshots: z.array(readinessSnapshotSchema),
});
export type ManagementDashboard = z.infer<typeof managementDashboardSchema>;

export const membershipSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: roleSchema,
  user: userSchema,
}).passthrough();
export const membershipsSchema = z.array(membershipSchema);
export type Membership = z.infer<typeof membershipSchema>;
