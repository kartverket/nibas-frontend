import { Feature } from "ol";
import Polygon from "ol/geom/Polygon";

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
