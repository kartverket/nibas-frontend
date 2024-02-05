import { GrenseType } from "hooks/layers/types";
import { FeatureProperties, KontekstEgenskaper } from "types/api";
import { FeatureLike } from "ol/Feature";
import { editableBorderTypes } from "hooks/layers/constants";
import { EditingType, useEditAllGrenser } from "contexts/EditGrenserContext";
import { isAdministrativGrense } from "utils/grenser";

const useFeature = () => {
  const { alleKretserStatuser } = useEditAllGrenser();

  const isFeatureEditable = (feature: FeatureLike, isArchived: boolean) => {
    const featureType = feature.get("type") as GrenseType;

    if (isAdministrativGrense(featureType)) {
      const properties = feature.getProperties() as FeatureProperties;
      const kontekstEgenskaper = properties.kontekstEgenskaper as KontekstEgenskaper[];

      if (!kontekstEgenskaper || kontekstEgenskaper.length == 0) return false;

      // Kontekstegenskaper inneholder hvilke kretser som grensen tilhører (f. eks stemme/grunnkrets)
      // Alle disse kretsene må være synlige for at en administrativ grense skal være synlig
      // Vi vet bare om synligheten til kommuner, og må derfor undersøke alle kontekstegenskapene, finne ut
      // hvilken kommune egenskapen tilhører, og så sjekke om den kommunen er synlig. Hvis den er synlig, kan vi
      // vise den administrative grensen
      const alleKretserIKontekstEgenskaperErSynlig = kontekstEgenskaper.every((egenskap) => {
        const kommuneId = egenskap.kommuneId?.lokalid.value;
        if (!kommuneId) return false;

        // TODO Better casting
        const type = egenskap.type.toLowerCase() as EditingType;
        const kretsStatuserForEgenskapType = alleKretserStatuser[type];

        if (kretsStatuserForEgenskapType && kretsStatuserForEgenskapType[kommuneId]) {
          return kretsStatuserForEgenskapType[kommuneId].visible;
        }
      });

      if (!alleKretserIKontekstEgenskaperErSynlig) return false;
    }

    const isEditableFeatureType = editableBorderTypes.includes(featureType);

    return isEditableFeatureType && !isArchived;
  };

  return {
    isFeatureEditable,
  };
};

export default useFeature;
