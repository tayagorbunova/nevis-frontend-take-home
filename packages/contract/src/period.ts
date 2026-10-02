import * as z from "zod/mini";

export const PERIODS = ["last-12-months", "last-6-months", "last-3-months", "last-month"] as const;
export const periodSchema = z.enum(PERIODS);
export type Period = z.infer<typeof periodSchema>;
export const DEFAULT_PERIOD: Period = "last-12-months";
