/** Mot cherché ramené à une forme simple (même clé pour « Coque  iPhone » et « coque iphone »). */
export function normalizeSearchTerm(q: string): string {
  return q
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9+ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}
