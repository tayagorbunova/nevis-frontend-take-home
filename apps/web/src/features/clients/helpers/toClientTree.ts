import type { ApiBranch, ApiChannel, ApiCompany, ApiEmployee } from "@nevis/contract";

type RowBase = {
  id: string;
  name: string;
  values: number[];
};

type CompanyRow = RowBase & {
  level: "company";
  children: BranchRow[];
};

type BranchRow = RowBase & {
  level: "branch";
  children: AdvisorRow[];
};

type AdvisorRow = RowBase & {
  level: "advisor";
  avatarUrl?: string;
  children: ChannelRow[];
};

type ChannelRow = RowBase & {
  level: "channel";
  children: never[];
};

export type ClientRow = CompanyRow | BranchRow | AdvisorRow | ChannelRow;

export function toClientTree(company: ApiCompany): CompanyRow {
  return {
    id: company.id,
    name: company.name,
    level: "company",
    values: company.values,
    children: (company.branches ?? []).map(toBranchRow),
  };
}

function toBranchRow(branch: ApiBranch): BranchRow {
  return {
    id: branch.id,
    name: branch.name,
    level: "branch",
    values: branch.values,
    children: (branch.employees ?? []).map(toAdvisorRow),
  };
}

function toAdvisorRow(employee: ApiEmployee): AdvisorRow {
  return {
    id: employee.id,
    name: employee.name,
    level: "advisor",
    values: employee.values,
    avatarUrl: employee.avatarUrl,
    children: (employee.channels ?? []).map(toChannelRow),
  };
}

function toChannelRow(channel: ApiChannel): ChannelRow {
  return {
    id: channel.id,
    name: channel.name,
    level: "channel",
    values: channel.values,
    children: [],
  };
}
