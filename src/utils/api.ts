import { EditingType } from "contexts/EditGrenserContext";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { FeatureProperties } from "types/api";
import { v4 as uuidv4 } from "uuid";

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

export const setEmptyFeatureProperties = (
  feature: Feature<Geometry>,
  editingType: EditingType
) => {
  const tempFeatureId = `temp-${uuidv4()}`; // TODO: bedre håndtering av dette
  feature.setId(tempFeatureId);

  const emptyProperties: FeatureProperties = {
    type: "", // TODO: finn ut hva slags type det er, kanskje få den sendt inn
    srid: 25833, // TODO
    version: 0, // TODO
    inndelingerKontekst: {
      id: tempFeatureId, // TODO: ta imot en id
      type: editingType,
    },
  };
  feature.setProperties(emptyProperties);
};
