import { useEffect, useState } from "react";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { useKommunerByIds } from "hooks/inndelinger/useKommuner";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { GrenseType, getInndelingtypeFromGrensetype } from "hooks/layers/types";
import { Inndelingtype } from "types/api";

// Denne fungerer for vanlige brukstilfeller, men den kan ikke autoselekere alle tilfeller korrekt.
// Dette er fordi vi mangler informasjon for å finne inndelingstypen vi skal bruke.
export const useAutoSelectInndelingFromUtkast = (enabled: boolean) => {
  const { selectInndelinger, setSelectedFylkeIds, currentlyEditingInndelinger } = useInndelinger();
  const { utkast } = useUtkast();
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [kommuneLokalidWithContext, setKommuneLokalidWithContext] = useState<Map<string, Set<Inndelingtype>>>(
    new Map(),
  );

  useEffect(() => {
    if (!utkast) {
      setKommuneLokalidWithContext(new Map());
      setHasAutoSelected(false);
      return;
    }

    const features = utkast.operasjoner?.grenseendringer?.endredeFeatures ?? [];
    if (features.length === 0) {
      setKommuneLokalidWithContext(new Map());
      return;
    }

    const inndelingTypeForKommune = new Map<string, Set<Inndelingtype>>();
    for (const feature of features) {
      const kontekstEgenskaper = feature.properties?.kontekstEgenskaper ?? [];
      const grenseType = feature.properties?.type as GrenseType | undefined;
      const inndelingType = grenseType != null ? getInndelingtypeFromGrensetype(grenseType) : undefined;
      for (const egenskap of kontekstEgenskaper) {
        const kommuneId = egenskap?.kommuneId?.lokalid?.value;
        if (kommuneId != null && kommuneId !== "") {
          if (inndelingType != null) {
            const setForKommune = inndelingTypeForKommune.get(kommuneId) ?? new Set<Inndelingtype>();
            setForKommune.add(inndelingType);
            inndelingTypeForKommune.set(kommuneId, setForKommune);
          }
        }
      }
    }

    setKommuneLokalidWithContext(inndelingTypeForKommune);
  }, [utkast]);

  const { data: kommuner } = useKommunerByIds(Array.from(kommuneLokalidWithContext.keys()), gyldighetsdato);

  useEffect(() => {
    if (kommuner && kommuner.length > 0 && !hasAutoSelected && currentlyEditingInndelinger.length === 0) {
      if (!enabled) {
        return;
      }

      // Det er mulig å redigere stemmekretsgrenser og grunnkretsgrenser i kommuneredigeringsmodus,
      // men det er ingen måte å vite om det ble gjort i kommuneredigeringsmodus eller stemmekrets- eller grunnkretsmodus.
      // Derfor velger vi kommune som default da det er mest sannsynlig.
      const resolveInndelingtypeForKommune = (kommuneId: string): Inndelingtype => {
        const context = kommuneLokalidWithContext.get(kommuneId) ?? new Set<Inndelingtype>();
        const hasKommune = context.has("KOMMUNE");
        const hasStemmekrets = context.has("STEMMEKRETS");
        const hasGrunnkrets = context.has("GRUNNKRETS");
        const hasBopliktomraade = context.has("BOPLIKTOMRAADE");

        if (hasKommune || (hasStemmekrets && hasGrunnkrets)) {
          return "KOMMUNE";
        }

        if (hasStemmekrets) {
          return "STEMMEKRETS";
        }
        if (hasGrunnkrets) {
          return "GRUNNKRETS";
        }
        if (hasBopliktomraade) {
          return "BOPLIKTOMRAADE";
        }
        return "KOMMUNE";
      };

      const inndelinger = kommuner.map((kommune) => ({
        id: kommune.id.lokalid.value,
        nummer: kommune.nummer,
        navn: kommune.navn,
        inndelingtype: resolveInndelingtypeForKommune(kommune.id.lokalid.value),
        isEditing: true,
        isViewing: false,
      }));

      const fylkeIds = Array.from(new Set(kommuner.map((kommune) => kommune.fylkeId)));

      selectInndelinger(inndelinger);
      setSelectedFylkeIds(fylkeIds);
      setHasAutoSelected(true);
    }
  }, [
    kommuner,
    hasAutoSelected,
    currentlyEditingInndelinger,
    selectInndelinger,
    setSelectedFylkeIds,
    kommuneLokalidWithContext,
  ]);
};
