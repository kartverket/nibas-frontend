import { Inndelingtype } from "contexts/InndelingerContext/InndelingerContext";
import { components, paths } from "./api-gen";

/**
 * Diverse
 */
export type Spraak = {
  navn: string;
  spraak: string;
};

export type FeatureDTO = components["schemas"]["Feature"];
export type FeatureCollection = components["schemas"]["FeatureCollection"];
export type KodelisteRespons = components["schemas"]["KodelisteRespons"];
export type ObjektIdentifikator = components["schemas"]["ObjektIdentifikator"];

/**
 * Inndelinger
 */
export type GrunnkretsRequest = components["schemas"]["GrunnkretsRequest"];
export type GrunnkretsResponse = components["schemas"]["GrunnkretsResponse"];
export type StemmekretsResponse = components["schemas"]["StemmekretsResponse"];
export type StemmekretsRequest = components["schemas"]["StemmekretsRequest"];
export type KommuneRequest = components["schemas"]["KommuneRequest"];
export type KommuneResponse = components["schemas"]["KommuneResponse"];
export type FylkeRequest = components["schemas"]["FylkeRequest"];
export type FylkeResponse = components["schemas"]["FylkeResponse"];
export type NasjonRequest = components["schemas"]["NasjonRequest"];

type KretsResponse = GrunnkretsResponse | StemmekretsResponse;
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
export type UtkastRef = components["schemas"]["UtkastRef"];
export type UtkastMetadataendringer = components["schemas"]["Metadataendringer"];
export type OpprettUtkastRequest = components["schemas"]["OpprettUtkastRequest"];
export type OppdaterUtkastRequest = components["schemas"]["OppdaterUtkastRequest"];
export type StemmekretsSammenslaaingsendringRequest = components["schemas"]["StemmekretsSammenslaaingsendringRequest"];
export type KretsDelingEndringRequest = components["schemas"]["KretsDelingEndringRequest"];

/**
 * API kall
 */
export type ApiErrorResponse = components["schemas"]["ApiErrorResponse"];
export type ApiPath = keyof paths;

/**
 * Metadata
 */

export type MetadataRequest = KommuneRequest | StemmekretsRequest | GrunnkretsRequest;
export type MetadataResponse = KommuneResponse | StemmekretsResponse | GrunnkretsResponse;
export type AdministrativGrenseMetadata = components["schemas"]["AdministrativGrenseMetadata"];
type AvtaltAvgrensningslinjeMetadata = components["schemas"]["AvtaltAvgrensningslinjeMetadata"];
type GrunnlinjeMetadata = components["schemas"]["GrunnlinjeMetadata"];
type RiksgrenseMetadata = components["schemas"]["RiksgrenseMetadata"];
type TerritorialgrenseMetadata = components["schemas"]["TerritorialgrenseMetadata"];
type StatistiskGrenseMetadata = components["schemas"]["StatistiskgrenseMetadata"] & {
  dokumentasjonsreferanser: undefined;
};

export type Metadata =
  | AvtaltAvgrensningslinjeMetadata
  | AdministrativGrenseMetadata
  | GrunnlinjeMetadata
  | RiksgrenseMetadata
  | TerritorialgrenseMetadata
  | StatistiskGrenseMetadata;

export type KontekstEgenskaper = components["schemas"]["KontekstEgenskaper"];
export type FeatureProperties = components["schemas"]["FeatureProperties"] & {
  inndelingerKontekst: {
    id: string;
    type: Inndelingtype;
  };
};
export type DokumentasjonsreferanseDTO = components["schemas"]["DokumentasjonsreferanseDTO"];
