export type KodelisteItem = {
  type: KodelisteType;
  item: GeonorgeKodelisteItem;
};

enum KodelisteType {
  KOMMUNENUMMER,
  FYLKESNUMMER,
  MALEMETODE_KODE,
}

type GeonorgeKodelisteItem = {
  id: string;
  label: string;
  lang: string;
  uuid: string;
  status: string;
  description: string;
  codevalue: string;
};

export const fetchKommunenumre = async (): Promise<KodelisteItem[]> => {
  const kommunenrResponse = await fetch(`v1/kodeliste/kommunenumre`);
  const json = await kommunenrResponse.json();
  return json as KodelisteItem[];
};

export const fetchFylkesnumre = async (): Promise<KodelisteItem[]> => {
  const kommunenrResponse = await fetch(`v1/kodeliste/fylkesnumre`);
  const json = await kommunenrResponse.json();
  return json as KodelisteItem[];
};

export const fetchMaalemetodeKoder = async (): Promise<KodelisteItem[]> => {
  const kommunenrResponse = await fetch(`v1/kodeliste/malemetode-koder`);
  const json = await kommunenrResponse.json();
  return json as KodelisteItem[];
};
