import { components, paths } from "./api-gen-arbeidsliste";

/**
 * Avvik Types
 */
export type AvvikRequestDTO = components["schemas"]["AvvikRequestDTO"];
export type BulkAvvikRequestDTO = components["schemas"]["BulkAvvikRequestDTO"];
export type KommuneAvvikDTO = components["schemas"]["KommuneAvvikDTO"];

/**
 * Pagination Types
 */
export type Page = components["schemas"]["Page"];
export type PageableObject = components["schemas"]["PageableObject"];
export type SortObject = components["schemas"]["SortObject"];

/**
 * API Paths
 */
export type HentAlleAvvik = paths["/api/v1/avvik"]["get"];
export type OppdaterFlereAvvik = paths["/api/v1/avvik"]["post"];
export type HentKommunerMedAvvikSummary = paths["/api/v1/avvik/kommuner"]["get"];
export type HentAvvik = paths["/api/v1/avvik/kommune/{lokalId}"]["get"];

export type HentGrenselinjer = paths["/api/v1/matrikkel/grenselinjer"]["get"];
export type HentGrenselinjerResponse = components["schemas"]["MatrikkelGrenselinjeFeatureCollection"];

export type HentTilgjengeligeKommuner = paths["/api/v1/matrikkel/grenselinjer/kommuner"]["get"];
export type HentTilgjengeligeKommunerResponse = string[];
