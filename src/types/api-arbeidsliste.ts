import { components, paths } from "./api-gen-arbeidsliste";

/**
 * Avvik Types
 */
export type AvvikRequestDTO = components["schemas"]["AvvikRequestDTO"];
export type BulkAvvikRequestDTO = components["schemas"]["BulkAvvikRequestDTO"];
export type KommuneParAvvikDTO = components["schemas"]["KommuneParAvvikDTO"];
export type AvvikDTO = components["schemas"]["AvvikDTO"];

/**
 * Pagination Types
 */
export type Page = components["schemas"]["Page"];
export type PageableObject = components["schemas"]["PageableObject"];
export type SortObject = components["schemas"]["SortObject"];

/**
 * API Paths
 */
export type HentAlleAvvik = paths["/internal-api/api/v1/avvik"]["get"];
export type OppdaterFlereAvvik = paths["/internal-api/api/v1/avvik"]["post"];
export type HentKommuneParMedAvvikSummary = paths["/internal-api/api/v1/avvik/kommunepar"]["get"];
export type HentAvvikForKommunePar = paths["/internal-api/api/v1/avvik/kommunepar/{lokalId1}/{lokalId2}"]["get"];

export type HentGrenselinjer = paths["/internal-api/api/v1/matrikkel/grenselinjer"]["get"];
export type HentGrenselinjerResponse = components["schemas"]["MatrikkelGrenselinjeFeatureCollection"];

export type HentTilgjengeligeKommuner = paths["/internal-api/api/v1/matrikkel/grenselinjer/kommuner"]["get"];
export type HentTilgjengeligeKommunerResponse = string[];
