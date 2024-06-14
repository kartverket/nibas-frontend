import { Inndeling, Inndelingtype } from "contexts/InndelingerContext/InndelingerContext";
import { useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import useKommuner, { useKommune } from "hooks/inndelinger/useKommuner";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { StemmekretsResponse, GrunnkretsResponse, KommuneResponse, MetadataResponse } from "types/api";
import { useUtkastEntity } from "contexts/UtkastContext/UtkastContext";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { HistoryEntry } from "contexts/HistoryContext/types";
import {
  getGrunnkretsMetadataEntries,
  getKommuneMetadataEntries,
  getStemmekretsMetadataEntries,
} from "contexts/HistoryContext/history-utils";

const useFlatedataFromBackend = (inndeling: Inndeling): MetadataResponse[] | undefined => {
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

const addHistoryChangesToMetadata = (
  metadataresponses: MetadataResponse[],
  historyEntries: HistoryEntry[],
  inndelingstype: Inndelingtype,
): MetadataResponse[] => {
  switch (inndelingstype) {
    case "grunnkrets": {
      const changes = getGrunnkretsMetadataEntries(historyEntries).flatMap((entry) => entry.changes);
      return metadataresponses.map((metadatareponse) => {
        const change = changes.findLast((c) => c.id === metadatareponse.id.lokalid.value);
        if (change) {
          return { ...metadatareponse, navn: change.to.navn, nummer: change.to.nummer } as MetadataResponse;
        }
        return metadatareponse;
      });
    }
    case "stemmekrets": {
      const changes = getStemmekretsMetadataEntries(historyEntries).flatMap((entry) => entry.changes);
      return metadataresponses.map((metadatareponse) => {
        const change = changes.findLast((c) => c.id === metadatareponse.id.lokalid.value);
        if (change) {
          return { ...metadatareponse, navn: change.to.navn, nummer: change.to.nummer } as MetadataResponse;
        }
        return metadatareponse;
      });
    }
    case "fylke":
    case "kommune": {
      const changes = getKommuneMetadataEntries(historyEntries).flatMap((entry) => entry.changes);
      return metadataresponses.map((metadatareponse) => {
        const change = changes.findLast((c) => c.id === metadatareponse.id.lokalid.value);
        if (change) {
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
  const flatedataFromBackend = useFlatedataFromBackend(inndeling);
  const { getHistoryEntries } = useHistory();

  const utkastFlatedata = (useUtkastEntity(
    flatedataFromBackend,
    `${inndeling.inndelingtype === "fylke" ? "kommune" : inndeling.inndelingtype}endringer`,
  ) ?? []) as MetadataResponse[];
  return addHistoryChangesToMetadata(utkastFlatedata, getHistoryEntries(), inndeling.inndelingtype);
};

export const isKommuneInndeling = (
  value: StemmekretsResponse | GrunnkretsResponse | KommuneResponse,
): value is KommuneResponse => "samiskforvaltningsomraade" in value;

export const isStemmekretsInndeling = (
  value: StemmekretsResponse | GrunnkretsResponse | KommuneResponse,
): value is StemmekretsResponse => "valgdistriktsnummer" in value;
