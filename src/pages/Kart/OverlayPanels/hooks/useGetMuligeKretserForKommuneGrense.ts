import {
  KontekstType,
  mapGrunnkretsResponseToKrets,
  mapStemmekretResponseToKrets,
} from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";
import useNibasApi from "hooks/useNibasApi";
import { useMemo } from "react";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";

export const useGetMuligeKretserForKommuneGrense = (kontekstType: KontekstType, fylkeId: string | null | undefined) => {
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const urlForKrets =
    kontekstType === KontekstType.GRUNNKRETS ? "/v1/fylker/{id}/grunnkretser" : "/v1/fylker/{id}/stemmekretser";
  const url = fylkeId != null ? urlForKrets : null;

  const { data, isLoading } = useNibasApi(url, { id: fylkeId!, gyldighetsdato });

  const kretserForFylket = useMemo(() => {
    if (data == null) {
      return [];
    }

    switch (kontekstType) {
      case KontekstType.STEMMEKRETS:
        return mapStemmekretResponseToKrets(data);
      case KontekstType.GRUNNKRETS:
        return mapGrunnkretsResponseToKrets(data);
    }
  }, [kontekstType, data]);

  return {
    muligeKretser: kretserForFylket,
    isLoading,
  };
};
