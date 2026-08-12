import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import {
  getBopliktomraadeMetadataEntries,
  getGrunnkretsMetadataEntries,
  getKommuneMetadataEntries,
  getNyInndelingEntries,
  getStemmekretsMetadataEntries,
} from "contexts/HistoryContext/history-utils";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { HistoryEntry } from "contexts/HistoryContext/types";
import { Inndeling } from "contexts/InndelingerContext/InndelingerContext";
import { getEntityUtkastTypeForInndelingtype } from "contexts/UtkastContext/types";
import { useUtkastEntity } from "contexts/UtkastContext/UtkastContext";
import useKommuneInndelinger from "hooks/inndelinger/useKommuneInndelinger";
import useKommuner, { useKommune } from "hooks/inndelinger/useKommuner";
import {
  BopliktomraadeResponse,
  Inndelingtype,
  KommuneResponse,
  MetadataResponse,
  StemmekretsResponse,
} from "types/api";
import {
  getDefaultFlatedataForInndelingtype,
  isBopliktomraadeRequest,
  isInndelingNonExhaustive,
} from "./flatedata-utils";
import { NonExhaustiveInndelingtype } from "./FlatedataTable";

const useFlatedataFromBackend = (
  inndeling: Inndeling,
  gyldighetsdato: string | undefined,
): MetadataResponse[] | undefined => {
  const { kommuner } = useKommuner(inndeling.id, gyldighetsdato, inndeling.inndelingtype === "FYLKE");
  const { kommune } = useKommune(inndeling.id, gyldighetsdato, inndeling.inndelingtype === "KOMMUNE");

  const nonAdmininndelingtype =
    inndeling.inndelingtype !== "FYLKE" && inndeling.inndelingtype !== "KOMMUNE" ? inndeling.inndelingtype : undefined;
  const { data: inndelinger } = useKommuneInndelinger(inndeling.id, gyldighetsdato, nonAdmininndelingtype);

  switch (inndeling.inndelingtype) {
    case "FYLKE":
      return kommuner;
    case "KOMMUNE": {
      return kommune ? [kommune] : [];
    }
    case "STEMMEKRETS":
    case "GRUNNKRETS":
    case "BOPLIKTOMRAADE":
      return inndelinger;
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
          return {
            ...metadatareponse,
            navn: change.to.navn,
            nummer: change.to.nummer,
            forskriftsreferanse: change.to.forskriftsreferanse,
            andreLokaleAvgrensninger: change.to.andreLokaleAvgrensninger,
            gjelderKunDelAvKommunen: change.to.gjelderKunDelAvKommunen,
            gjeldendeMaterielleVilkaar: change.to.gjeldendeMaterielleVilkaar,
            harUsikkerAvgrensning: change.to.harUsikkerAvgrensning,
          } as MetadataResponse;
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

const getNyeInndelingerMetadataForInndelingtype = (
  entries: HistoryEntry[],
  inndelingtype: NonExhaustiveInndelingtype,
): MetadataResponse[] => {
  const nyInndelingEntries = getNyInndelingEntries(entries);
  switch (inndelingtype) {
    case "BOPLIKTOMRAADE":
      return nyInndelingEntries
        .filter((entry) => entry.changes[0].to != null && isBopliktomraadeRequest(entry.changes[0].to))
        .flatMap((entry) => {
          if (entry.changes.length > 0) {
            const change = entry.changes[0];
            const newInndelingRequest = change.to;
            if (newInndelingRequest != null) {
              return {
                ...getDefaultFlatedataForInndelingtype(inndelingtype),
                navn: newInndelingRequest.navn,
                nummer: newInndelingRequest.nummer,
                forskriftsreferanse: newInndelingRequest.forskriftsreferanse,
                gjelderKunDelAvKommunen: newInndelingRequest.gjelderKunDelAvKommunen,
                gjeldendeMaterielleVilkaar: newInndelingRequest.gjeldendeMaterielleVilkaar,
                andreLokaleAvgrensninger: newInndelingRequest.andreLokaleAvgrensninger,
              } as MetadataResponse;
            }
            return [];
          }
          return [];
        });
  }
};

const isNonExhaustiveInndelingtype = (inndelingtype: Inndelingtype): inndelingtype is NonExhaustiveInndelingtype => {
  return isInndelingNonExhaustive(inndelingtype);
};

export const useFlatedata = (inndeling: Inndeling): MetadataResponse[] | undefined => {
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const flatedataFromBackend = useFlatedataFromBackend(inndeling, gyldighetsdato);
  const { getHistoryEntries } = useHistory();

  const inndelingtype = inndeling.inndelingtype;

  const utkastFlatedata = (useUtkastEntity(flatedataFromBackend, getEntityUtkastTypeForInndelingtype(inndelingtype)) ??
    []) as MetadataResponse[];

  const newFlatedataFromHistory = isNonExhaustiveInndelingtype(inndelingtype)
    ? getNyeInndelingerMetadataForInndelingtype(getHistoryEntries(), inndelingtype)
    : [];

  return [
    ...addHistoryChangesToMetadata(utkastFlatedata, getHistoryEntries(), inndelingtype),
    ...newFlatedataFromHistory,
  ];
};

export const isKommuneInndeling = (value: object): value is KommuneResponse => "samiskforvaltningsomraade" in value;

export const isStemmekretsInndeling = (value: object): value is StemmekretsResponse => "valgdistriktsnummer" in value;

export const isBopliktomraadeInndeling = (value: object): value is BopliktomraadeResponse =>
  "gjelderKunDelAvKommunen" in value;
