import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface HabitLogEntry {
    date: bigint;
    timestamp: bigint;
    quantity: number;
    category: HabitCategory;
}
export enum HabitCategory {
    exercise = "exercise",
    sleep = "sleep",
    study = "study"
}
export interface backendInterface {
    createLog(category: HabitCategory, quantity: number, date: bigint): Promise<void>;
    getAllLogs(): Promise<Array<HabitLogEntry>>;
    getLogsByCategory(category: HabitCategory): Promise<Array<HabitLogEntry>>;
    getLogsByDateRange(startDate: bigint, endDate: bigint): Promise<Array<HabitLogEntry>>;
}
