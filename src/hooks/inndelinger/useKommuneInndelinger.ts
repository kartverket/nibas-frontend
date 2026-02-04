import { Krets } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";
import {
  BopliktomraadeResponse,
  GrunnkretsResponse,
  INNDELINGTYPE_VALUES,
  Inndelingtype,
  StemmekretsResponse,
} from "types/api";
import { useKommuneBopliktomraade } from "./useBopliktomraader";
import { useKommuneGrunnkretser } from "./useGrunnkretser";
import { useKommuneStemmekretser } from "./useStemmekretser";

export const KOMMUNAL_INNDELINGTYPE_VALUES = INNDELINGTYPE_VALUES.filter(
  (type) => type === "GRUNNKRETS" || type === "STEMMEKRETS" || type === "BOPLIKTOMRAADE",
);
export type KommunalInndelingtype = (typeof KOMMUNAL_INNDELINGTYPE_VALUES)[number];
export type KommunalInndelingResponse = GrunnkretsResponse | StemmekretsResponse | BopliktomraadeResponse;

// Abstraksjon for å hente inndelinger for en kommune i stedet for å måtte bruke hook for hver enkelt inndelingstype som er relevant for funksjonaliteten.
const useKommuneInndelinger = (
  kommuneId: string | null,
  gyldighetsdato: string | undefined,
  inndelingtype: KommunalInndelingtype | undefined,
): { data: KommunalInndelingResponse[] | undefined; isLoading: boolean } => {
  const { data: grunnkretser, isLoading: isLoadingGrunnkretser } = useKommuneGrunnkretser(
    kommuneId,
    gyldighetsdato,
    inndelingtype === "GRUNNKRETS",
  );
  const { data: stemmekretser, isLoading: isLoadingStemmekretser } = useKommuneStemmekretser(
    kommuneId,
    gyldighetsdato,
    inndelingtype === "STEMMEKRETS",
  );
  const { data: bopliktomraader, isLoading: isLoadingBopliktomraader } = useKommuneBopliktomraade(
    kommuneId,
    gyldighetsdato,
    inndelingtype === "BOPLIKTOMRAADE",
  );

  if (inndelingtype == null) {
    return { data: undefined, isLoading: false };
  }

  switch (inndelingtype) {
    case "GRUNNKRETS":
      return { data: grunnkretser, isLoading: isLoadingGrunnkretser };
    case "STEMMEKRETS":
      return { data: stemmekretser, isLoading: isLoadingStemmekretser };
    case "BOPLIKTOMRAADE":
      return { data: bopliktomraader, isLoading: isLoadingBopliktomraader };
  }
};

export const mapKommunalKretserResponseToKrets = (
  kretser: GrunnkretsResponse[] | StemmekretsResponse[] | BopliktomraadeResponse[],
  inndelingtype: KommunalInndelingtype,
): Krets[] => {
  return kretser.map(({ id, version, nummer, navn, kommuneIdentifikator, kommunenummer }) => ({
    id,
    kommuneId: kommuneIdentifikator,
    kommunenummer: kommunenummer.kodeverdi,
    version,
    nummer,
    navn,
    type: inndelingtype,
  }));
};

export const isKommunalInndelingtype = (inndelingtype: Inndelingtype): boolean => {
  return KOMMUNAL_INNDELINGTYPE_VALUES.find((type) => type === inndelingtype) != null;
};

export default useKommuneInndelinger;
