/**
 * Recherches sans résultat sur le site : une tâche par mot dans le projet Odoo
 * « Recherches sans résultat », nommée « <mot> — N recherche(s) ».
 */
import { odooCall } from "./client";

export const MISSED_SEARCH_PROJECT = "Recherches sans résultat";

let projectId: number | null = null;

async function getProjectId(): Promise<number> {
  if (projectId) return projectId;
  const found = await odooCall<{ id: number }[]>("project.project", "search_read", {
    domain: [["name", "=", MISSED_SEARCH_PROJECT]],
    fields: ["id"],
    limit: 1,
  });
  if (found[0]) return (projectId = found[0].id);
  const created = await odooCall<number[] | number>("project.project", "create", {
    vals_list: [{ name: MISSED_SEARCH_PROJECT, company_id: false }],
  });
  projectId = Array.isArray(created) ? created[0] : created;
  return projectId;
}

const label = (term: string, n: number) =>
  `${term} — ${n} recherche${n > 1 ? "s" : ""}`;

/** `term` doit déjà être normalisé (lettres, chiffres, espaces, +). */
export async function recordMissedSearch(term: string): Promise<void> {
  const project = await getProjectId();
  const existing = await odooCall<{ id: number; name: string }[]>("project.task", "search_read", {
    domain: [
      ["project_id", "=", project],
      ["name", "=like", `${term} — %`],
    ],
    fields: ["name"],
    limit: 1,
    context: { active_test: false },
  });
  if (existing[0]) {
    const n = Number(existing[0].name.match(/— (\d+) recherche/)?.[1] ?? 1) + 1;
    await odooCall("project.task", "write", {
      ids: [existing[0].id],
      vals: { name: label(term, n), active: true },
    });
    return;
  }
  await odooCall("project.task", "create", {
    vals_list: [
      {
        name: label(term, 1),
        project_id: project,
        description: `<p>Un client a cherché « ${term} » sur le site sans rien trouver.</p>`,
      },
    ],
  });
}
