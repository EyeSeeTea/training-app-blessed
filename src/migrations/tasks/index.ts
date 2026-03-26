import { MigrationTasks, migration } from "../types";

export async function getMigrationTasks(): Promise<MigrationTasks> {
    return [migration(1, (await import("./01.support-multiple-landing-move-customizations")).default)];
}
