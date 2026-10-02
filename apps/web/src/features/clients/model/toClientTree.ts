import type { ApiBranch, ApiChannel, ApiCompany, ApiEmployee } from "@nevis/contract";

export type RowLevel = "company" | "branch" | "advisor" | "channel";

export type ClientRow = {
  id: string;
  name: string;
  level: RowLevel;
  values: number[];
  avatarUrl?: string;
  children: ClientRow[];
};

export function toClientTree(company: ApiCompany): ClientRow {
  return {
    id: company.id,
    name: company.name,
    level: "company",
    values: company.values,
    children: (company.branches ?? []).map(toBranchRow),
  };
}

function toBranchRow(branch: ApiBranch): ClientRow {
  return {
    id: branch.id,
    name: branch.name,
    level: "branch",
    values: branch.values,
    children: (branch.employees ?? []).map(toAdvisorRow),
  };
}

function toAdvisorRow(employee: ApiEmployee): ClientRow {
  return {
    id: employee.id,
    name: employee.name,
    level: "advisor",
    values: employee.values,
    avatarUrl: employee.avatarUrl,
    children: (employee.channels ?? []).map(toChannelRow),
  };
}

function toChannelRow(channel: ApiChannel): ClientRow {
  return {
    id: channel.id,
    name: channel.name,
    level: "channel",
    values: channel.values,
    children: [],
  };
}
