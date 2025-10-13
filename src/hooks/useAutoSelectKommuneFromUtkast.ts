import { useEffect, useState } from "react";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { useKommunerByIds } from "hooks/inndelinger/useKommuner";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";

export const useAutoSelectKommuneFromUtkast = () => {
  const { selectInndelinger, setSelectedFylkeIds, currentlyEditingInndelinger } = useInndelinger();
  const { utkast } = useUtkast();
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const [kommuneIdsToFetch, setKommuneIdsToFetch] = useState<string[]>([]);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  useEffect(() => {
    if (!utkast) {
      setKommuneIdsToFetch([]);
      setHasAutoSelected(false);
      return;
    }

    const features = utkast.operasjoner?.grenseendringer?.endredeFeatures ?? [];
    if (features.length === 0) {
      setKommuneIdsToFetch([]);
      return;
    }

    const kommuneIds = new Set<string>();
    for (const feature of features) {
      const kontekstEgenskaper = feature.properties?.kontekstEgenskaper ?? [];
      for (const egenskap of kontekstEgenskaper) {
        const kommuneId = egenskap?.kommuneId?.lokalid?.value;
        if (kommuneId != null && kommuneId !== "") {
          kommuneIds.add(kommuneId);
        }
      }
    }

    setKommuneIdsToFetch(Array.from(kommuneIds));
  }, [utkast]);

  const { data: kommuner } = useKommunerByIds(kommuneIdsToFetch, gyldighetsdato);

  useEffect(() => {
    if (kommuner && kommuner.length > 0 && !hasAutoSelected && currentlyEditingInndelinger.length === 0) {
      const inndelinger = kommuner.map((kommune) => ({
        id: kommune.id.lokalid.value,
        nummer: kommune.nummer,
        navn: kommune.navn,
        inndelingtype: "kommune" as const,
        isEditing: true,
        isViewing: false,
      }));

      const fylkeIds = Array.from(new Set(kommuner.map((kommune) => kommune.fylkeId)));

      selectInndelinger(inndelinger);
      setSelectedFylkeIds(fylkeIds);
      setHasAutoSelected(true);
    }
  }, [kommuner, hasAutoSelected, currentlyEditingInndelinger, selectInndelinger, setSelectedFylkeIds]);
};
