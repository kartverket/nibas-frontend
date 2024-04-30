import { Inndeling } from "contexts/InndelingerContext/InndelingerContext";
import { useUtkastEntity } from "contexts/UtkastContext/UtkastContext";
import { useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import useKommuner, { useKommune } from "hooks/inndelinger/useKommuner";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { StemmekretsResponse, GrunnkretsResponse, KommuneResponse } from "types/api";

type Flatedata = StemmekretsResponse[] | GrunnkretsResponse[] | KommuneResponse[] | undefined;

export const useFlatedata = (inndeling: Inndeling): Flatedata => {
  const { kommuner } = useKommuner(inndeling.id, inndeling.inndelingtype === "fylke");
  const { kommune } = useKommune(inndeling.id, inndeling.inndelingtype === "kommune");

  const { data: stemmekretserByKommune } = useKommuneStemmekretser(
    inndeling.inndelingtype === "stemmekrets" ? inndeling.id : null,
  );
  const stemmekretser = useUtkastEntity(stemmekretserByKommune, "stemmekretsendringer") as
    | StemmekretsResponse[]
    | undefined;

  const { data: grunnkretserByKommune } = useKommuneGrunnkretser(
    inndeling.inndelingtype === "grunnkrets" ? inndeling.id : null,
  );
  const grunnkretser = useUtkastEntity(grunnkretserByKommune, "grunnkretsendringer") as
    | GrunnkretsResponse[]
    | undefined;

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
