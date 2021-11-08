export type SimpleFylke = {
  fylkesnavn: string;
  fylkesnummer: string;
};

export type SimpleKommune = {
  kommunenavn: string;
  kommunenummer: string;
};

export type Fylke = {
  avgrensningsboks: unknown;
  crs: unknown;
  fylkesnavn: string;
  fylkesnummer: string;
  kommuner: SimpleKommune[];
};
