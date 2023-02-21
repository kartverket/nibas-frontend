type ApiEntity = {
  id: {
    lokalid: {
      value: string;
    };
  };
};

type ApiEntityWithIdentifikasjon = {
  identifikasjon: {
    lokalid: string;
  };
};

export const getIdFromEntity = (
  entity: ApiEntity | ApiEntityWithIdentifikasjon
) => {
  if ((entity as ApiEntityWithIdentifikasjon).identifikasjon) {
    return (entity as ApiEntityWithIdentifikasjon).identifikasjon.lokalid;
  } else if ((entity as ApiEntity).id) {
    return (entity as ApiEntity).id.lokalid.value;
  }

  return "";
};
