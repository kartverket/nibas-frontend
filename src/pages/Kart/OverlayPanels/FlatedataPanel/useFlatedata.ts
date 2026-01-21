import { Inndeling } from "contexts/InndelingerContext/InndelingerContext";
import { useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import useKommuner, { useKommune } from "hooks/inndelinger/useKommuner";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import {
  StemmekretsResponse,
  GrunnkretsResponse,
  KommuneResponse,
  MetadataResponse,
  BopliktomraadeResponse,
  Inndelingtype,
} from "types/api";
import { useUtkastEntity } from "contexts/UtkastContext/UtkastContext";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { HistoryEntry } from "contexts/HistoryContext/types";
import {
  getBopliktomraadeMetadataEntries,
  getGrunnkretsMetadataEntries,
  getKommuneMetadataEntries,
  getStemmekretsMetadataEntries,
} from "contexts/HistoryContext/history-utils";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { useKommuneBopliktomraade } from "hooks/inndelinger/useBopliktomraader";
import { getEntityUtkastTypeForInndelingtype } from "contexts/UtkastContext/types";

const useFlatedataFromBackend = (
  inndeling: Inndeling,
  gyldighetsdato: string | undefined,
): MetadataResponse[] | undefined => {
  const { kommuner } = useKommuner(inndeling.id, gyldighetsdato, inndeling.inndelingtype === "FYLKE");
  const { kommune } = useKommune(inndeling.id, gyldighetsdato, inndeling.inndelingtype === "KOMMUNE");
  const { data: grunnkretser } = useKommuneGrunnkretser(
    inndeling.inndelingtype === "GRUNNKRETS" ? inndeling.id : null,
    gyldighetsdato,
  );
  const { data: stemmekretser } = useKommuneStemmekretser(
    inndeling.inndelingtype === "STEMMEKRETS" ? inndeling.id : null,
    gyldighetsdato,
  );
  const { data: bopliktomraade } = useKommuneBopliktomraade(
    inndeling.inndelingtype === "BOPLIKTOMRAADE" ? inndeling.id : null,
    gyldighetsdato,
  );

  switch (inndeling.inndelingtype) {
    case "FYLKE":
      return kommuner;
    case "KOMMUNE": {
      return kommune ? [kommune] : [];
    }
    case "STEMMEKRETS": {
      return stemmekretser;
    }
    case "GRUNNKRETS": {
      return grunnkretser;
    }
    case "BOPLIKTOMRAADE": {
      return bopliktomraade;
    }
  }
};

const addHistoryChangesToMetadata = (
  metadataresponses: MetadataResponse[],
  historyEntries: HistoryEntry[],
  inndelingstype: Inndelingtype,
): MetadataResponse[] => {
  switch (inndelingstype) {
    case "GRUNNKRETS": {
      const changes = getGrunnkretsMetadataEntries(historyEntries).flatMap((entry) => entry.changes);
      return metadataresponses.map((metadatareponse) => {
        const change = changes.findLast((c) => c.id === metadatareponse.id.lokalid.value);
        if (change != null) {
          return { ...metadatareponse, navn: change.to.navn, nummer: change.to.nummer } as MetadataResponse;
        }
        return metadatareponse;
      });
    }
    case "STEMMEKRETS": {
      const changes = getStemmekretsMetadataEntries(historyEntries).flatMap((entry) => entry.changes);
      return metadataresponses.map((metadatareponse) => {
        const change = changes.findLast((c) => c.id === metadatareponse.id.lokalid.value);
        if (change != null) {
          return {
            ...metadatareponse,
            navn: change.to.navn,
            nummer: change.to.nummer,
            tellekretsnummer: change.to.tellekretsnummer,
            tellekretsnavn: change.to.tellekretsnavn,
          } as MetadataResponse;
        }
        return metadatareponse;
      });
    }
    case "BOPLIKTOMRAADE": {
      const changes = getBopliktomraadeMetadataEntries(historyEntries).flatMap((entry) => entry.changes);
      return metadataresponses.map((metadatareponse) => {
        const change = changes.findLast((c) => c.id === metadatareponse.id.lokalid.value);
        if (change != null) {
          return { ...metadatareponse, navn: change.to.navn, nummer: change.to.nummer } as MetadataResponse;
        }
        return metadatareponse;
      });
    }
    case "FYLKE":
    case "KOMMUNE": {
      const changes = getKommuneMetadataEntries(historyEntries).flatMap((entry) => entry.changes);
      return metadataresponses.map((metadatareponse) => {
        const change = changes.findLast((c) => c.id === metadatareponse.id.lokalid.value);
        if (change != null) {
          return {
            ...metadatareponse,
            samiskforvaltningsomraade: change.to.samiskforvaltningsomraade,
          } as MetadataResponse;
        }
        return metadatareponse;
      });
    }
  }
};

export const useFlatedata = (inndeling: Inndeling): MetadataResponse[] | undefined => {
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const flatedataFromBackend = useFlatedataFromBackend(inndeling, gyldighetsdato);
  const { getHistoryEntries } = useHistory();

  const utkastFlatedata = (useUtkastEntity(
    flatedataFromBackend,
    getEntityUtkastTypeForInndelingtype(inndeling.inndelingtype),
  ) ?? []) as MetadataResponse[];
  return addHistoryChangesToMetadata(utkastFlatedata, getHistoryEntries(), inndeling.inndelingtype);
};

export const isKommuneInndeling = (
  value: StemmekretsResponse | GrunnkretsResponse | KommuneResponse,
): value is KommuneResponse => "samiskforvaltningsomraade" in value;

export const isStemmekretsInndeling = (
  value: StemmekretsResponse | GrunnkretsResponse | KommuneResponse,
): value is StemmekretsResponse => "valgdistriktsnummer" in value;

export const isBopliktomraadeInndeling = (value: object): value is BopliktomraadeResponse => "delvisBoplikt" in value;
