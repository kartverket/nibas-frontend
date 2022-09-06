import { components, paths } from "./api-gen";
import { EditingType } from "contexts/EditGrenserContext";

export type Spraak = {
  navn: string;
  spraak: string;
};

// renaming av typer fra generert api doc
export type AdministrativEnhetNavn =
  components["schemas"]["AdministrativEnhetNavn"];
export type AdministrativGrenseMetadata =
  components["schemas"]["AdministrativGrenseMetadata"];
export type AvtaltAvgrensningslinjeMetadata =
  components["schemas"]["AvtaltAvgrensningslinjeMetadata"];
export type CommonMetadata = components["schemas"]["CommonMetadata"];
export type Coordinate = components["schemas"]["Coordinate"];
export type CoordinateSequence = components["schemas"]["CoordinateSequence"];
export type CoordinateSequenceFactory =
  components["schemas"]["CoordinateSequenceFactory"];
export type Dokref = components["schemas"]["Dokref"];
export type Envelope = components["schemas"]["Envelope"];
export type FeatureCollection = components["schemas"]["FeatureCollection"];
export type FeatureProperties = components["schemas"]["FeatureProperties"] & {
  inndelingerKontekst: {
    id: string;
    type: EditingType;
  };
};
export type FylkeRef = components["schemas"]["FylkeRef"];
export type FylkeRequest = components["schemas"]["FylkeRequest"];
export type FylkeResponse = components["schemas"]["FylkeResponse"];
export type Fylkesnummer = components["schemas"]["Fylkesnummer"];
export type GrunnlinjeMetadata = components["schemas"]["GrunnlinjeMetadata"];
export type Identifikasjon = components["schemas"]["Identifikasjon"];
export type KodelisteItem = components["schemas"]["KodelisteItem"];
export type KodelisteRespons = components["schemas"]["KodelisteRespons"];
export type KommuneRef = components["schemas"]["KommuneRef"];
export type KommuneRequest = components["schemas"]["KommuneRequest"];
export type KommuneResponse = components["schemas"]["KommuneResponse"];
export type Kommunenummer = components["schemas"]["Kommunenummer"];
export type KontekstEgenskaper = components["schemas"]["KontekstEgenskaper"];
export type Land = components["schemas"]["TekstHolder"];
export type MaritimeGrenserMetadata =
  components["schemas"]["MaritimeGrenserMetadata"];
export type NasjonRef = components["schemas"]["NasjonRef"];
export type NasjonRequest = components["schemas"]["NasjonRequest"];
export type NasjonResponse = components["schemas"]["NasjonResponse"];
export type Posisjonskvalitet = components["schemas"]["Posisjonskvalitet"];
export type PrecisionModel = components["schemas"]["PrecisionModel"];
export type RiksgrenseMetadata = components["schemas"]["RiksgrenseMetadata"];
export type TerritorialgrenseMetadata =
  components["schemas"]["TerritorialgrenseMetadata"];
export type Type = components["schemas"]["Type"];
export type CommonGrenseMetadata =
  components["schemas"]["CommonGrenseMetadata"];
export type GrunnkretsRef = components["schemas"]["GrunnkretsRef"];
export type GrunnkretsRequest = components["schemas"]["GrunnkretsRequest"];
export type GrunnkretsResponse = components["schemas"]["GrunnkretsResponse"];
export type StatistiskgrenseMetadata =
  components["schemas"]["StatistiskgrenseMetadata"];
export type StemmekretsRef = components["schemas"]["StemmekretsRef"];
export type StemmekretsResponse = components["schemas"]["StemmekretsResponse"];
export type StemmekretsRequest = components["schemas"]["StemmekretsRequest"];
export type StatistiskGrenseMetadata =
  components["schemas"]["StatistiskgrenseMetadata"] & {
    dokumentasjonsreferanser: undefined;
  };

// custom typer basert på api doc
export type ApiPath = keyof paths;
export type KodelistePath =
  | "/v1/kodeliste/terrengdetaljkoder"
  | "/v1/kodeliste/noeyaktighetsklasser"
  | "/v1/kodeliste/maalemetode-koder"
  | "/v1/kodeliste/landkoder"
  | "/v1/kodeliste/kommunenumre"
  | "/v1/kodeliste/grensetyper"
  | "/v1/kodeliste/grensestatuser"
  | "/v1/kodeliste/fylkesnumre"
  | "/v1/kodeliste/fastsettingstyper";
export type Metadata =
  | AvtaltAvgrensningslinjeMetadata
  | AdministrativGrenseMetadata
  | GrunnlinjeMetadata
  | RiksgrenseMetadata
  | TerritorialgrenseMetadata
  | StatistiskGrenseMetadata;
export type KretsRef = GrunnkretsRef | StemmekretsRef;
export type GrenseRef = FylkeRef | KommuneRef | KretsRef;
