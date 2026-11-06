import { odooCall } from "./client";

/** Première colonne (étape) d’un projet Odoo, pour que la tâche s’affiche. */
export async function firstStageId(projectId: number): Promise<number | false> {
  const stages = await odooCall<{ id: number }[]>("project.task.type", "search_read", {
    domain: [["project_ids", "in", [projectId]]],
    fields: ["id"],
    order: "sequence asc, id asc",
    limit: 1,
  }).catch(() => []);
  return stages[0]?.id ?? false;
}
