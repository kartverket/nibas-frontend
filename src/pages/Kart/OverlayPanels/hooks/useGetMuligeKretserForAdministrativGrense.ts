import {
  KontekstType,
  mapGrunnkretsResponseToKrets,
  mapStemmekretResponseToKrets,
} from "../../../../pages/Kart/OverlayPanels/hooks/tilhorighet-utils";
import useNibasApi from "../../../../hooks/useNibasApi";
import { useMemo } from "react";
import { useValgtGyldighetsdato } from "../../../../contexts/GyldighetsdatoContext";

export const useGetMuligeKretserForAdministrativGrense = (
  kontekstType: KontekstType,
  kommuneId: string | null | undefined,
) => {
  const { gyldighetsdato } = useValgtGyldighetsdato();
  // for fylker er problemet at samme fylkeId blir brukt for alternativ A og B lista, mens vi må hente fra.
  const urlForKrets =
    kontekstType === KontekstType.GRUNNKRETS ? "/v1/kommuner/{id}/grunnkretser" : "/v1/kommuner/{id}/stemmekretser";
  const url = kommuneId != null ? urlForKrets : null;

  const { data, isLoading } = useNibasApi(url, { id: kommuneId!, gyldighetsdato });

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
