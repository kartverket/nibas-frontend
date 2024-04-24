import {
  KontekstType,
  mapGrunnkretsResponseToKrets,
  mapStemmekretResponseToKrets,
} from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";
import useNibasApi from "hooks/useNibasApi";
import { useMemo } from "react";

export const useGetMuligeKretserForKommuneGrense = (kontekstType: KontekstType, fylkeId: string | null | undefined) => {
  const urlForKrets =
    kontekstType === KontekstType.GRUNNKRETS ? "/v1/fylker/{id}/grunnkretser" : "/v1/fylker/{id}/stemmekretser";
  const url = fylkeId != null ? urlForKrets : null;

  const { data, isLoading } = useNibasApi(url, { id: fylkeId! });

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
