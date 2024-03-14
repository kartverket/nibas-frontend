import { components, paths } from "./api-gen";
import { EditingType } from "contexts/EditGrenserContext/types";

export type Spraak = {
  navn: string;
  spraak: string;
};

export type InndelingerKontekst = {
  id: string;
  type: EditingType;
};

// renaming av typer fra generert api doc
export type AdministrativEnhetNavn = components["schemas"]["AdministrativEnhetNavn"];
export type AdministrativGrenseMetadata = components["schemas"]["AdministrativGrenseMetadata"];
export type AvtaltAvgrensningslinjeMetadata = components["schemas"]["AvtaltAvgrensningslinjeMetadata"];
export type CommonMetadata = components["schemas"]["CommonMetadata"];
export type FeatureCollection = components["schemas"]["FeatureCollection"];
export type FeatureProperties = components["schemas"]["FeatureProperties"] & {
  inndelingerKontekst: InndelingerKontekst;
};
export type FylkeRequest = components["schemas"]["FylkeRequest"];
export type FylkeResponse = components["schemas"]["FylkeResponse"];
export type Fylkesnummer = components["schemas"]["Fylkesnummer"];
export type GrunnlinjeMetadata = components["schemas"]["GrunnlinjeMetadata"];
export type Identifikasjon = components["schemas"]["Identifikasjon"];
export type KodelisteItem = components["schemas"]["KodelisteItem"];
export type KodelisteRespons = components["schemas"]["KodelisteRespons"];
export type KommuneRequest = components["schemas"]["KommuneRequest"];
export type KommuneResponse = components["schemas"]["KommuneResponse"];
export type Kommunenummer = components["schemas"]["Kommunenummer"];
export type KontekstEgenskaper = components["schemas"]["KontekstEgenskaper"];
export type Land = components["schemas"]["TekstHolder"];
export type NasjonRequest = components["schemas"]["NasjonRequest"];
export type Posisjonskvalitet = components["schemas"]["Posisjonskvalitet"];
export type RiksgrenseMetadata = components["schemas"]["RiksgrenseMetadata"];
export type TerritorialgrenseMetadata = components["schemas"]["TerritorialgrenseMetadata"];
export type CommonGrenseMetadata = components["schemas"]["CommonGrenseMetadata"];
export type GrunnkretsRequest = components["schemas"]["GrunnkretsRequest"];
export type GrunnkretsResponse = components["schemas"]["GrunnkretsResponse"];
export type StatistiskgrenseMetadata = components["schemas"]["StatistiskgrenseMetadata"];
export type StemmekretsResponse = components["schemas"]["StemmekretsResponse"];
export type StemmekretsRequest = components["schemas"]["StemmekretsRequest"];
export type StemmekretsSammenslaaingsendringRequest = components["schemas"]["StemmekretsSammenslaaingsendringRequest"];
export type DokumentasjonsreferanseDTO = components["schemas"]["DokumentasjonsreferanseDTO"];
export type StatistiskGrenseMetadata = components["schemas"]["StatistiskgrenseMetadata"] & {
  dokumentasjonsreferanser: undefined;
};
export type ObjektIdentifikator = components["schemas"]["ObjektIdentifikator"];
export type IdentifikatorMedVersjon = components["schemas"]["IdentifikatorMedVersjon"];
export type OpprettUtkastRequest = components["schemas"]["OpprettUtkastRequest"];
export type OppdaterUtkastRequest = components["schemas"]["OppdaterUtkastRequest"];
export type UtkastResponse = components["schemas"]["UtkastResponse"];
export type UtkastRef = components["schemas"]["UtkastRef"];
export type UtkastMetadataendringer = components["schemas"]["Metadataendringer"];
export type UtkastGrenseendringer = components["schemas"]["Grenseendringer"];
export type KretsDelingEndringRequest = components["schemas"]["KretsDelingEndringRequest"];
export type Point = components["schemas"]["Point"];
export type ApiErrorResponse = components["schemas"]["ApiErrorResponse"];
export type KretsNavnOgNummer = components["schemas"]["KretsNavnOgNummer"];

// custom typer basert på api doc
export type ApiPath = keyof paths;
export type KodelistePath =
  | "/v1/kodeliste/maalemetode-koder"
  | "/v1/kodeliste/landkoder"
  | "/v1/kodeliste/kommunenumre"
  | "/v1/kodeliste/grensetyper"
  | "/v1/kodeliste/fylkesnumre";
export type Metadata =
  | AvtaltAvgrensningslinjeMetadata
  | AdministrativGrenseMetadata
  | GrunnlinjeMetadata
  | RiksgrenseMetadata
  | TerritorialgrenseMetadata
  | StatistiskGrenseMetadata;
export type KretsResponse = GrunnkretsResponse | StemmekretsResponse;
export type GrenseRef = FylkeResponse | KommuneResponse;
export type UtkastOperasjoner = UtkastResponse["operasjoner"];
