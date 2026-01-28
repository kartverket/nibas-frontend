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
type KommunalInndelingtype = (typeof KOMMUNAL_INNDELINGTYPE_VALUES)[number];

// Abstraksjon for å hente inndelinger for en kommune i stedet for å måtte bruke hook for hver enkelt inndelingstype som er relevant for funksjonaliteten.
const useKommuneInndelinger = (
  kommuneId: string | null,
  gyldighetsdato: string | undefined,
  inndelingtype: KommunalInndelingtype | undefined,
) => {
  const { data: grunnkretser } = useKommuneGrunnkretser(kommuneId, gyldighetsdato, inndelingtype === "GRUNNKRETS");
  const { data: stemmekretser } = useKommuneStemmekretser(kommuneId, gyldighetsdato, inndelingtype === "STEMMEKRETS");
  const { data: bopliktomraader } = useKommuneBopliktomraade(
    kommuneId,
    gyldighetsdato,
    inndelingtype === "BOPLIKTOMRAADE",
  );

  if (inndelingtype == null) {
    return undefined;
  }

  switch (inndelingtype) {
    case "GRUNNKRETS":
      return grunnkretser;
    case "STEMMEKRETS":
      return stemmekretser;
    case "BOPLIKTOMRAADE":
      return bopliktomraader;
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
