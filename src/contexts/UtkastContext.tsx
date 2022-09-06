import { GrunnkretsRequest } from "types/api";

const grunnkretsUtkast: GrunnkretsRequest = {
  grunnkretsnummer: "12345678",
  identifikasjon: {
    lokalid: "lokalid",
    navnerom: "navnerom",
    versjonid: "versjonId",
  },
  navn: "Mock grunnkrets",
};

type Context = Record<string, Record<string, any>>;

type Response = {
  id: string;
};

// utkastet per ID må byttes ut med de nye verdiene på lagring
// det er kun den siste versjonen av en request som skal brukes,
// de andre er unødvendige

const utkast: Context = {
  grunnkretser: {
    "db1f6e5e-6bac-4d79-87ff-2d3d43e61844": grunnkretsUtkast,
  },
};

const applyUtkast = <T extends Response>(
  entity: T,
  utkastSlice: any | undefined
) => {
  // spread utkast på originale typen for å overskrive verdier
  const utkastForEntity = utkastSlice[entity.id];

  console.log("Utkast for entity", utkastForEntity);

  if (utkastForEntity) {
    return {
      ...entity,
      ...utkastForEntity,
    } as T;
  }

  return entity;
};

export const useUtkast = <T extends Response | Response[] | undefined>(
  entity: T,
  type: string
) => {
  if (!entity) return;

  const utkastSlice = utkast[type];

  console.log("Utkast slice", utkastSlice);

  if (Array.isArray(entity)) {
    console.log("Entity is an array", entity);
    return entity.map((e) => applyUtkast(e, utkastSlice));
  }

  return applyUtkast(entity, utkastSlice);
};
