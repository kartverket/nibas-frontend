import { Feature } from "ol";
import Polygon from "ol/geom/Polygon";

export type Grense = {
  id: number;
};

type Spraak = {
  navn: string;
  spraak: string;
};

export type SimpleFylke = Grense & {
  navn: Spraak[];
  href: string;
};

export type Fylke = Grense & {
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

export type SimpleKommune = Grense & {
  // samme som fylker, splitt til generell type?
  navn: Spraak[];
  href: string;
};

export type Kommune = Grense & {
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
