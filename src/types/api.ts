import { components, paths } from "./api-gen";

/**
 * Diverse
 */
export type Spraak = {
  navn: string;
  spraak: string;
};

export const ENDRINGSTYPE_VALUES = [
  "Kvalitetsheving",
  "Retting",
  "Vedtatt deling",
  "Vedtatt sletting",
  "Vedtatt sammenslåing",
  "Vedtatt grensejustering",
  "Fastsetting",
  "Navneendring",
  "Nummerendring",
  "Ny forskrift",
  "Utgått forskrift",
  "Forskriftsendring",
  "Oppdatert geometri",
  "Import",
] as const satisfies readonly components["schemas"]["UtkastResponse"]["endringstype"][];
export type Endringstype = (typeof ENDRINGSTYPE_VALUES)[number];

export const INNDELINGTYPE_VALUES = [
  "FYLKE",
  "KOMMUNE",
  "GRUNNKRETS",
  "STEMMEKRETS",
  "BOPLIKTOMRAADE",
] as const satisfies readonly components["schemas"]["InndelingResponse"]["type"][];
export type Inndelingtype = (typeof INNDELINGTYPE_VALUES)[number];

export type AdministrativEnhetNavn = components["schemas"]["AdministrativEnhetNavn"][];
export type FeatureDTO = components["schemas"]["Feature"];
export type FeatureCollection = components["schemas"]["FeatureCollection"];
export type KodelisteRespons = components["schemas"]["KodelisteRespons"];
export type ObjektIdentifikator = components["schemas"]["ObjektIdentifikator"];
export type InndelingSearchType = components["schemas"]["InndelingSearchResponse"]["type"];

/**
 * Inndelinger
 */
export type GrunnkretsRequest = components["schemas"]["GrunnkretsRequest"];
export type GrunnkretsResponse = components["schemas"]["GrunnkretsResponse"];
export type StemmekretsResponse = components["schemas"]["StemmekretsResponse"];
export type StemmekretsRequest = components["schemas"]["StemmekretsRequest"];
export type BopliktomraadeRequest = components["schemas"]["BopliktomraadeRequest"];
export type KommuneRequest = components["schemas"]["KommuneRequest"];
export type KommuneResponse = components["schemas"]["KommuneResponse"];
export type FylkeRequest = components["schemas"]["FylkeRequest"];
export type FylkeResponse = components["schemas"]["FylkeResponse"];
export type NasjonRequest = components["schemas"]["NasjonRequest"];
export type BopliktomraadeResponse = components["schemas"]["BopliktomraadeResponse"];

export type GjeldendeMaterielleVilkaar = components["schemas"]["BopliktomraadeResponse"]["gjeldendeMaterielleVilkaar"];

type KretsResponse = GrunnkretsResponse | StemmekretsResponse | BopliktomraadeResponse;
type AdministrativEnhetResponse = FylkeResponse | KommuneResponse;
export type FullInndelingResponse = KretsResponse | AdministrativEnhetResponse;
export type SimpleInndelingResponse = components["schemas"]["InndelingResponse"];
export type InndelingNavn = components["schemas"]["AdministrativEnhetNavn"][] | string;
export type KretsNavnOgNummer = components["schemas"]["KretsNavnOgNummer"];
export type InndelingSearchResponse = components["schemas"]["InndelingSearchResponse"];

/**
 * Utkast
 */
export type UtkastOperasjoner = UtkastResponse["operasjoner"];
export type UtkastResponse = components["schemas"]["UtkastResponse"];
export type UtkastMetadataendringer = components["schemas"]["Metadataendringer"];
export type OpprettUtkastRequest = components["schemas"]["OpprettUtkastRequest"];
export type OppdaterUtkastRequest = components["schemas"]["OppdaterUtkastRequest"];
export type StemmekretsSammenslaaingsendringRequest = components["schemas"]["StemmekretsSammenslaaingsendringRequest"];
export type GrunnkretsSammenslaaingsendringRequest = components["schemas"]["GrunnkretsSammenslaaingsendringRequest"];
export type KretsDelingEndringRequest = components["schemas"]["KretsDelingEndringRequest"];
/**
 * NB: Denne unionen må oppdateres manuelt når nye typer legges til i
 * CreateInndelingRequest i backend (sealed interface).
 *
 * Den genererte CreateInndelingRequest i api-gen.ts kan ikke brukes direkte,
 * siden springdoc/swagger-core genererer en sirkulær type når en klasse både
 * implementerer et Schema-annotert interface (for oneOf/discriminator) og
 * blir tolket som en subtype via arv (allOf).
 *
 * Husk å legge til nye varianter her når de dukker opp i de genererte
 * schemaene
 */
export type CreateInndelingRequest = components["schemas"]["CreateBopliktomraadeRequest"];
export type CreateInndelingRequestDiscriminator = CreateInndelingRequest["discriminator"];

/**
 * API kall
 */
export type ApiErrorResponse = components["schemas"]["ApiErrorResponse"];
export type ApiPath = keyof paths;

/**
 * Metadata
 */

export type MetadataRequest = KommuneRequest | StemmekretsRequest | GrunnkretsRequest | BopliktomraadeRequest;
export type MetadataResponse = KommuneResponse | StemmekretsResponse | GrunnkretsResponse | BopliktomraadeResponse;
export type AdministrativGrenseMetadata = components["schemas"]["AdministrativGrenseMetadata"];
type AvtaltAvgrensningslinjeMetadata = components["schemas"]["AvtaltAvgrensningslinjeMetadata"];
type GrunnlinjeMetadata = components["schemas"]["GrunnlinjeMetadata"];
type RiksgrenseMetadata = components["schemas"]["RiksgrenseMetadata"];
type TerritorialgrenseMetadata = components["schemas"]["TerritorialgrenseMetadata"];
type StatistiskGrenseMetadata = components["schemas"]["StatistiskgrenseMetadata"] & {
  dokumentasjonsreferanser: undefined;
};
type KommunalKretsgrenseMetadata = components["schemas"]["KommunalKretsgrenseMetadata"] & {
  dokumentasjonsreferanser: undefined;
};
export type CommonMetadata = components["schemas"]["CommonMetadata"];
export type CommonGrenseMetadata = components["schemas"]["CommonGrenseMetadata"];
export type Posisjonskvalitet = components["schemas"]["CommonGrenseMetadata"]["posisjonskvalitet"];
export type Metadata =
  | AvtaltAvgrensningslinjeMetadata
  | AdministrativGrenseMetadata
  | GrunnlinjeMetadata
  | RiksgrenseMetadata
  | TerritorialgrenseMetadata
  | StatistiskGrenseMetadata
  | KommunalKretsgrenseMetadata;
export type MetadataDiscriminator = Metadata["discriminator"];

export type KontekstEgenskaper = components["schemas"]["KontekstEgenskaper"];
export type FeatureProperties = components["schemas"]["FeatureProperties"] & {
  inndelingerKontekst: {
    id: string;
    type: Inndelingtype;
  };
};
export type DokumentasjonsreferanseDTO = components["schemas"]["DokumentasjonsreferanseDTO"];
