import { Feature } from "ol";
import Polygon from "ol/geom/Polygon";
import { components } from "./api-gen";

export type RotGrense = {
  id: string;
};

type Spraak = {
  navn: string;
  spraak: string;
};

export type SimpleGrense = RotGrense & {
  navn: Spraak[];
  href: string;
};

export type SimpleFylke = SimpleGrense;

export type Fylke = RotGrense & {
  administrativenhetnavn: Spraak[];
  lokalid: string;
  navnerom: string;
  fylkesnummer: {
    id: string;
    kodeverdi: number;
  };
  samiskforvaltningsomraade: boolean;
  oppdateringsdato: string;
  features: Feature<Polygon>;
};

export type SimpleKommune = SimpleGrense;

export type Kommune = RotGrense & {
  administrativenhetnavn: Spraak[];
  lokalid: string;
  navnerom: string;
  kommunenummer: {
    id: string;
    kodeverdi: number;
  };
  samiskforvaltningsomraade: boolean;
  oppdateringsdato: string;
  features: Feature<Polygon>;
};

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
export type FeatureProperties = components["schemas"]["FeatureProperties"];
export type FylkeRef = components["schemas"]["FylkeRef"];
export type FylkeRequest = components["schemas"]["FylkeRequest"];
export type FylkeResponse = components["schemas"]["FylkeResponse"];
export type Fylkesnummer = components["schemas"]["Fylkesnummer"];
export type GeonorgeKodelisteItem =
  components["schemas"]["GeonorgeKodelisteItem"];
export type GrunnlinjeMetadata = components["schemas"]["GrunnlinjeMetadata"];
export type HistorikkRef = components["schemas"]["HistorikkRef"];
export type Identifikasjon = components["schemas"]["Identifikasjon"];
export type KodelisteItem = components["schemas"]["KodelisteItem"];
export type KommuneRef = components["schemas"]["KommuneRef"];
export type KommuneRequest = components["schemas"]["KommuneRequest"];
export type KommuneResponse = components["schemas"]["KommuneResponse"];
export type Kommunenummer = components["schemas"]["Kommunenummer"];
export type KontekstEgenskaper = components["schemas"]["KontekstEgenskaper"];
export type Land = components["schemas"]["Land"];
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

export type Metadata =
  | AvtaltAvgrensningslinjeMetadata
  | AdministrativGrenseMetadata
  | GrunnlinjeMetadata
  | RiksgrenseMetadata
  | TerritorialgrenseMetadata;
