import {
  Kommuneendringer,
  Kretsendringer,
  KretsSplittingEndring,
  Metadataendringer,
} from "components/Endringslogg/hooks/utkastEndringerTypes";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { GrunnkretsEntry, HistoryChange, HistoryEntry, StemmekretsEntry } from "contexts/HistoryContext/types";
import { getUniqueItems, removeNil } from "utils/list-utils";
import { KontekstType } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";
import { useStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { useGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import {
  GrunnkretsResponse,
  KommuneResponse,
  KretsDelingEndringRequest,
  StemmekretsResponse,
} from "../../../types/api";
import {
  getGrenseDelingEntries,
  getGrunnkretsMetadataEntries,
  getKommuneMetadataEntries,
  getKretsDelingEntries,
  getStemmekretsMetadataEntries,
} from "contexts/HistoryContext/history-utils";
import { inndelingResponseNavnToString } from "utils/language/language";
import useKommuner from "hooks/inndelinger/useKommuner";

type UseUnsavedEndringerReturnType = {
  harEndringer: boolean;
  antallEndringer: number;
  kretsendringer: Kretsendringer;
  kommuneendringer: Kommuneendringer[];
  laster: boolean;
};

export const useUnsavedEndringer = (): UseUnsavedEndringerReturnType => {
  const { getHistoryEntries } = useHistory();
  const history = getHistoryEntries();
  const { isLoading: lasterKommuner, kommuner: alleKommuner } = useKommuner();

  const antallNyeGrenser = countNewGrenser(history);
  const antallArkiverteGrenser = countArchivedGrenser(history);
  const antallEndredeGrenser = countChangedGrenser(history);
  const metadataendringer = getMetadataChanges(history);
  const { laster: lasterDelinger, endringer: kretsdelinger } = useKretsdelingChanges(history);
  const kommuneendringer = getKommuneendringer(history, alleKommuner);

  const antallKommuneNavnendringer = kommuneendringer.filter((k) => k.nyttNavn != null).length;
  const antallKommuneEndringSamiskForvaltningsomraade = kommuneendringer.filter(
    (k) => k.samiskforvaltningsomraade != null,
  ).length;

  console.log("ENDRINGER FUNNET:", kommuneendringer);
  console.log("antallKommuneNavnendringer:", antallKommuneNavnendringer);
  console.log("antallKommuneEndringSamiskForvaltningsomraade:", antallKommuneEndringSamiskForvaltningsomraade);

  const antallEndringer =
    antallNyeGrenser +
    antallArkiverteGrenser +
    antallEndredeGrenser +
    metadataendringer.length +
    kretsdelinger.length +
    antallKommuneNavnendringer +
    antallKommuneEndringSamiskForvaltningsomraade;

  return {
    harEndringer: antallEndringer > 0,
    antallEndringer,
    laster: lasterDelinger || lasterKommuner,
    kretsendringer: {
      metadataendringer,
      antallArkiverteGrenser,
      antallNyeGrenser,
      antallEndredeGrenser,
      sammenslaaing: null, // Sammenslåing blir lagret med en gang
      delinger: kretsdelinger,
    },
    kommuneendringer: kommuneendringer,
  };
};

const getKommuneendringer = (
  entries: HistoryEntry[],
  alleKommuner: KommuneResponse[] | undefined,
): Kommuneendringer[] => {
  const kommuneentries = getKommuneMetadataEntries(entries);
  const kommunechanges = kommuneentries.flatMap((entry) => entry.changes);

  const kommunerMedEndringer = getUniqueItems(kommunechanges.map((change) => change.id));

  console.log("KOMMUNER MED ENDRINGER:", kommunerMedEndringer);

  return removeNil(
    kommunerMedEndringer.map((kommuneid) => {
      const firstChange = kommunechanges.find((change) => change.id === kommuneid)!;
      const lastChange = kommunechanges.findLast((change) => change.id === kommuneid)!;

      const kommune = alleKommuner?.find((kommuneResponse) => kommuneResponse.id.lokalid.value === kommuneid);
      const fromNavn = inndelingResponseNavnToString(firstChange.from.administrativenhetnavn);
      const toNavn = inndelingResponseNavnToString(lastChange.to.administrativenhetnavn);
      const fromSamiskForvalt = firstChange.from.samiskforvaltningsomraade;
      const toSamiskForvalt = lastChange.to.samiskforvaltningsomraade;

      console.log("CHANGE?!", fromNavn, toNavn, fromSamiskForvalt, toSamiskForvalt);

      if (fromNavn === toNavn && fromSamiskForvalt === toSamiskForvalt) {
        return null;
      }

      console.log("DETTE ER EN ENDRING", kommuneid);

      return {
        gammeltNavn: fromNavn,
        nummer: kommune?.nummer ?? "",
        nyttNavn: fromNavn !== toNavn ? toNavn : undefined,
        samiskforvaltningsomraade: fromSamiskForvalt !== toSamiskForvalt ? toSamiskForvalt : undefined,
      };
    }),
  );
};

const countNewGrenser = (entries: HistoryEntry[]): number => {
  const nyeGrenserFraTegning = entries.filter((entry) => entry.type === "nygrense").length;
  const nyeGrenseFraDeling = getGrenseDelingEntries(entries)
    .flatMap((entry) => entry.changes)
    .flatMap((change) => change.to).length;

  return nyeGrenserFraTegning + nyeGrenseFraDeling;
};

const countArchivedGrenser = (entries: HistoryEntry[]): number => {
  const arkiverteGrenser = entries.filter((entry) => entry.type === "grensearkivering").length;
  const arkiverteGrenserFraDeling = getGrenseDelingEntries(entries)
    .flatMap((entry) => entry.changes)
    .flatMap((change) => change.from).length;

  return arkiverteGrenser + arkiverteGrenserFraDeling;
};

const countChangedGrenser = (entries: HistoryEntry[]) => {
  const changedGrenserTypes = ["grense", "property", "grensetilhorighetendring"];
  const changedGrenseIds = entries
    .filter((entry) => changedGrenserTypes.includes(entry.type))
    .flatMap((entry) => entry.changes.map((c) => c.id));
  return getUniqueItems(changedGrenseIds).length;
};

type UseKretsdelingChangesReturnType = {
  laster: boolean;
  endringer: KretsSplittingEndring[];
};

const useKretsdelingChanges = (entries: HistoryEntry[]): UseKretsdelingChangesReturnType => {
  const kretsdelingentries = getKretsDelingEntries(entries);
  const changes = kretsdelingentries.flatMap((entry) => entry.changes);
  const stemmekretsIds = getUniqueItems(
    changes.filter((change) => change.from.flatetype === "STEMMEKRETS").map((change) => change.id),
  );
  const grunnkretsIds = getUniqueItems(
    changes.filter((change) => change.from.flatetype === "GRUNNKRETS").map((change) => change.id),
  );

  const { data: stemmekretser, isLoading: isLoadingStemmekretser } = useStemmekretser(stemmekretsIds);
  const { data: grunnkretser, isLoading: isLoadingGrunnkretser } = useGrunnkretser(grunnkretsIds);

  const stemmekretsdelinger: KretsSplittingEndring[] =
    stemmekretser?.map((stemmekrets) => getLastKretsdeling(changes, stemmekrets)) ?? [];

  const grunnkretsdelinger: KretsSplittingEndring[] =
    grunnkretser?.map((grunnkrets) => getLastKretsdeling(changes, grunnkrets)) ?? [];

  return {
    laster: isLoadingGrunnkretser || isLoadingStemmekretser,
    endringer: stemmekretsdelinger.concat(grunnkretsdelinger),
  };
};

const getLastKretsdeling = (
  changes: HistoryChange<KretsDelingEndringRequest>[],
  krets: StemmekretsResponse | GrunnkretsResponse,
): KretsSplittingEndring => {
  const lastDelingAvKrets = changes.findLast((entry) => entry.id === krets.id.lokalid.value);
  const opprinneligKrets = {
    kretsNavn: krets.navn,
    kretsNummer: krets.nummer,
  };

  return {
    opprinneligKrets,
    nyeKretser: lastDelingAvKrets?.to.nyeKretser.concat(opprinneligKrets) ?? [],
  };
};

const getMetadataChanges = (entries: HistoryEntry[]): Metadataendringer[] => {
  const grunnkretschanges = getGrunnkretsMetadataEntries(entries).flatMap((entry) =>
    mapMetadataEntryToMetadataendringerForStemmekretsOgGrunnkrets(entry),
  );
  const stemmekretschanges = getStemmekretsMetadataEntries(entries).flatMap((entry) =>
    mapMetadataEntryToMetadataendringerForStemmekretsOgGrunnkrets(entry),
  );
  return combineMetadataChangesForSameId(grunnkretschanges.concat(stemmekretschanges));
};

type MetadataendringerWithId = Metadataendringer & { id: string };
const mapMetadataEntryToMetadataendringerForStemmekretsOgGrunnkrets = (
  entry: StemmekretsEntry | GrunnkretsEntry,
): MetadataendringerWithId[] => {
  return entry.changes.map((change) => ({
    kretsType: mapEntrytypeToKonteksttype(entry.type),
    id: change.id,
    opprinneligKrets: {
      navn: change.from.navn ?? "",
      nummer: change.from.nummer ?? "",
    },
    navn: change.to.navn ?? "",
    nummer: change.to.nummer ?? "",
  }));
};

const combineMetadataChangesForSameId = (metadataendringer: MetadataendringerWithId[]): Metadataendringer[] => {
  const changedKretser = getUniqueItems(metadataendringer.map((endring) => endring.id));

  return changedKretser.map((kretsId) => {
    const firstChangeForKrets = metadataendringer.find((endring) => endring.id === kretsId);
    const lastChangeForKrets = metadataendringer.findLast((endring) => endring.id === kretsId);

    if (firstChangeForKrets == null || lastChangeForKrets == null) {
      // Dette skal egentlig aldri kunne skje - så dette er egentlig mest for å gjøre typescript glad. Oppstår
      // denne situsjonen har det blir gjort en kodeendring som innførte en feil.
      throw new Error(
        "Noe gikk galt ved oppbygning av endringsloggen. Klarte ikke finne igjen endringen for kretsen. Dette burde ikke kunne skje.",
      );
    }

    return { ...lastChangeForKrets, opprinneligKrets: firstChangeForKrets?.opprinneligKrets };
  });
};

const mapEntrytypeToKonteksttype = (entrytype: "grunnkrets" | "stemmekrets"): KontekstType => {
  switch (entrytype) {
    case "grunnkrets":
      return KontekstType.GRUNNKRETS;
    case "stemmekrets":
      return KontekstType.GRUNNKRETS;
  }
};
