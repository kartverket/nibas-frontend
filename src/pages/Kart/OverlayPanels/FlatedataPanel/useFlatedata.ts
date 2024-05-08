import { Inndeling } from "contexts/InndelingerContext/InndelingerContext";
import { useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import useKommuner, { useKommune } from "hooks/inndelinger/useKommuner";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { StemmekretsResponse, GrunnkretsResponse, KommuneResponse, MetadataResponse } from "types/api";

export const useFlatedata = (inndeling: Inndeling): MetadataResponse[] | undefined => {
  const { kommuner } = useKommuner(inndeling.id, inndeling.inndelingtype === "fylke");
  const { kommune } = useKommune(inndeling.id, inndeling.inndelingtype === "kommune");
  const { data: grunnkretser } = useKommuneGrunnkretser(inndeling.inndelingtype === "grunnkrets" ? inndeling.id : null);
  const { data: stemmekretser } = useKommuneStemmekretser(
    inndeling.inndelingtype === "stemmekrets" ? inndeling.id : null,
  );

  switch (inndeling.inndelingtype) {
    case "fylke":
      return kommuner;
    case "kommune": {
      return kommune ? [kommune] : [];
    }
    case "stemmekrets": {
      return stemmekretser;
    }
    case "grunnkrets": {
      return grunnkretser;
    }
  }
};

export const isKommuneInndeling = (
  value: StemmekretsResponse | GrunnkretsResponse | KommuneResponse,
): value is KommuneResponse => "samiskforvaltningsomraade" in value;

export const isStemmekretsInndeling = (
  value: StemmekretsResponse | GrunnkretsResponse | KommuneResponse,
): value is StemmekretsResponse => "valgdistriktsnummer" in value;
