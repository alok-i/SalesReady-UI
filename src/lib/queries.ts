import { useQuery } from "@tanstack/react-query";
import {
  assignmentsSchema,
  createOrganizationResultSchema,
  currentUserSchema,
  managementDashboardSchema,
  membershipsSchema,
  platformOrganizationsSchema,
  simulationScenariosSchema,
} from "./api-contracts";
import { api } from "./api";

export const queryKeys = {
  currentUser: ["current-user"] as const,
  dailyTasks: ["daily-tasks"] as const,
  simulationScenarios: ["simulation-scenarios"] as const,
  platformOrganizations: ["platform-organizations"] as const,
  managerDashboard: ["manager-dashboard"] as const,
  memberships: ["memberships"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => api.get("/auth/me", currentUserSchema),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useDailyTasks() {
  return useQuery({
    queryKey: queryKeys.dailyTasks,
    queryFn: () => api.get("/learning/daily-tasks", assignmentsSchema),
  });
}

export function useSimulationScenarios() {
  return useQuery({
    queryKey: queryKeys.simulationScenarios,
    queryFn: () => api.get("/learning/simulations", simulationScenariosSchema),
  });
}

export function usePlatformOrganizations() {
  return useQuery({
    queryKey: queryKeys.platformOrganizations,
    queryFn: () => api.get("/platform/organizations", platformOrganizationsSchema),
  });
}

export function useManagerDashboard() {
  return useQuery({
    queryKey: queryKeys.managerDashboard,
    queryFn: () => api.get("/management/dashboard", managementDashboardSchema),
  });
}

export function useMemberships() {
  return useQuery({
    queryKey: queryKeys.memberships,
    queryFn: () => api.get("/organizations/memberships", membershipsSchema),
  });
}

export function createPlatformOrganization(input: {
  name: string;
  companyProfile?: Record<string, unknown>;
  admin: { email: string; displayName: string; password: string };
}) {
  return api.post("/platform/organizations", input, createOrganizationResultSchema);
}
