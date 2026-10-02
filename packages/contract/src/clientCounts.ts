import * as z from "zod/mini";

export const CLIENT_COUNTS_PATH = "/api/client-counts";

const monthSchema = z.string().check(z.regex(/^\d{4}-(0[1-9]|1[0-2])$/));
const valuesSchema = z.array(z.int().check(z.nonnegative()));

const apiChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: valuesSchema,
});
export type ApiChannel = z.infer<typeof apiChannelSchema>;

const apiEmployeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: valuesSchema,
  avatarUrl: z.optional(z.string()),
  channels: z.optional(z.array(apiChannelSchema)),
});
export type ApiEmployee = z.infer<typeof apiEmployeeSchema>;

const apiBranchSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: valuesSchema,
  employees: z.optional(z.array(apiEmployeeSchema)),
});
export type ApiBranch = z.infer<typeof apiBranchSchema>;

const apiCompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  values: valuesSchema,
  branches: z.optional(z.array(apiBranchSchema)),
});
export type ApiCompany = z.infer<typeof apiCompanySchema>;

export function listRows(company: ApiCompany) {
  const branches = company.branches ?? [];
  const employees = branches.flatMap((branch) => branch.employees ?? []);
  const channels = employees.flatMap((employee) => employee.channels ?? []);

  return [company, ...branches, ...employees, ...channels];
}

export const clientCountsResponseSchema = z
  .object({
    months: z.array(monthSchema),
    company: apiCompanySchema,
  })
  .check(
    z.refine(({ months, company }) =>
      listRows(company).every((row) => row.values.length === months.length),
    ),
  );
export type ClientCountsResponse = z.infer<typeof clientCountsResponseSchema>;
