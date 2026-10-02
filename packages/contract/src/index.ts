import * as z from "zod/mini";

export const PERIODS = ["last-12-months", "last-6-months", "last-3-months", "last-month"] as const;
export const periodSchema = z.enum(PERIODS);
export type Period = z.infer<typeof periodSchema>;
export const DEFAULT_PERIOD: Period = "last-12-months";

export const CLIENT_COUNTS_PATH = "/api/client-counts";

export const DEMO_HEADER = "X-Demo";
export const DEMO_SLOW = "slow";
export const DEMO_FAIL = "fail";

const monthSchema = z.string().check(z.regex(/^\d{4}-(0[1-9]|1[0-2])$/));
const valuesSchema = z.array(z.int().check(z.nonnegative()));

export const apiChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: valuesSchema,
});
export type ApiChannel = z.infer<typeof apiChannelSchema>;

export const apiEmployeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: valuesSchema,
  avatarUrl: z.optional(z.string()),
  channels: z.optional(z.array(apiChannelSchema)),
});
export type ApiEmployee = z.infer<typeof apiEmployeeSchema>;

export const apiBranchSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: valuesSchema,
  employees: z.optional(z.array(apiEmployeeSchema)),
});
export type ApiBranch = z.infer<typeof apiBranchSchema>;

export const apiCompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  values: valuesSchema,
  branches: z.optional(z.array(apiBranchSchema)),
});
export type ApiCompany = z.infer<typeof apiCompanySchema>;

export const clientCountsResponseSchema = z
  .object({
    months: z.array(monthSchema),
    company: apiCompanySchema,
  })
  .check(
    z.refine(({ months, company }) => {
      const branches = company.branches ?? [];
      const employees = branches.flatMap((branch) => branch.employees ?? []);
      const channels = employees.flatMap((employee) => employee.channels ?? []);
      const rows = [company, ...branches, ...employees, ...channels];
      return rows.every((row) => row.values.length === months.length);
    }),
  );
export type ClientCountsResponse = z.infer<typeof clientCountsResponseSchema>;

const apiErrorCodeSchema = z.enum(["invalid_period", "internal_error"]);
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

export const apiErrorBodySchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
  }),
});
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;
