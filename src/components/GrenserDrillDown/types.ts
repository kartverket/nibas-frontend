export type Grense = {
  id: number;
};

export type SimpleFylke = Grense & {
  navn: string;
  nummer: string;
};

export type SimpleKommune = Grense & {
  navn: string;
  nummer: string;
};

export type Fylke = {
  avgrensningsboks: unknown;
  crs: unknown;
  fylkesnavn: string;
  fylkesnummer: string;
  kommuner: SimpleKommune[];
};
