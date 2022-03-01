export type KodelisteItem = {
  type: KodelisteType;
  item: GeonorgeKodelisteItem;
};

type KodelisteType = "KOMMUNENUMMER" | "FYLKESNUMMER" | "MALEMETODE_KODE";

type GeonorgeKodelisteItem = {
  id: string;
  label: string;
  lang: string;
  uuid: string;
  status: string;
  description: string;
  codevalue: string;
};
