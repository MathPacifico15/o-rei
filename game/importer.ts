import { requiredCompetitionNames, validateCatalog } from "./catalog";
import type { Club, Competition } from "./types";

export interface LicensedCatalogPack {
  version: string;
  source: string;
  competitions: Competition[];
  clubs: Club[];
}

export interface ImportReport {
  valid: boolean;
  errors: string[];
  missingRequiredCompetitions: string[];
  missingCrests: string[];
}

/**
 * Validates public or licensed packs before they are exposed in the game. The UI can show a
 * temporary generic crest in development, but a release must have a crest key for every club.
 */
export function validateImport(pack: LicensedCatalogPack): ImportReport {
  const errors = validateCatalog(pack);
  const competitionNames = new Set(pack.competitions.map((entry) => entry.name));
  const missingRequiredCompetitions = requiredCompetitionNames.filter((name) => !competitionNames.has(name));
  const missingCrests = pack.clubs.filter((club) => !club.crest.trim()).map((club) => club.name);
  return {
    valid: errors.length === 0 && missingCrests.length === 0 && missingRequiredCompetitions.length === 0,
    errors: missingRequiredCompetitions.length ? [...errors, `Competições obrigatórias ausentes: ${missingRequiredCompetitions.join(", ")}`] : errors,
    missingRequiredCompetitions,
    missingCrests,
  };
}

export function mergeCatalog(base: LicensedCatalogPack, incoming: LicensedCatalogPack): LicensedCatalogPack {
  const mergeById = <T extends { id: string }>(left: T[], right: T[]) => {
    const result = new Map(left.map((item) => [item.id, item]));
    right.forEach((item) => result.set(item.id, { ...result.get(item.id), ...item }));
    return [...result.values()];
  };
  return {
    version: incoming.version,
    source: incoming.source,
    competitions: mergeById(base.competitions, incoming.competitions),
    clubs: mergeById(base.clubs, incoming.clubs),
  };
}
