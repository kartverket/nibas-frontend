import {
  EndringsloggInndelingType,
  Kommuneendringer,
  Kretsendringer,
  KretsSplittingEndring,
  Metadataendringer,
} from "components/Endringslogg/hooks/utkastEndringerTypes";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import {
  getGrenseArkiveringEntries,
  getGrenseDelingEntries,
  getGrenseMergeEntries,
  getKommuneMetadataEntries,
  getKretsDelingEntries,
  getNyGrenserEntriesEntries,
} from "contexts/HistoryContext/history-utils";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import {
  BopliktomraadeEntry,
  GrunnkretsEntry,
  HistoryChange,
  HistoryEntry,
  KommuneEntry,
  StemmekretsEntry,
} from "contexts/HistoryContext/types";
import { useGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import useKommuner from "hooks/inndelinger/useKommuner";
import { useStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { inndelingResponseNavnToString } from "utils/language/language";
import { getUniqueItems, removeNil } from "utils/list-utils";
import {
  GrunnkretsResponse,
  KommuneResponse,
  KretsDelingEndringRequest,
  StemmekretsResponse,
} from "../../../types/api";

type UseUnsavedEndringerReturnType = {
  harEndringer: boolean;
  antallEndringer: number;
  kretsendringer: Kretsendringer;
  kommuneendringer: Kommuneendringer[];
  laster: boolean;
};

export const useUnsavedEndringer = (): UseUnsavedEndringerReturnType => {
  const { getHistoryEntries } = useHistory();
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const history = getHistoryEntries();
  const { isLoading: lasterKommuner, kommuner: alleKommuner } = useKommuner(null, gyldighetsdato, history.length > 0);

  const nyeGrenser = getNyeGrenser(history);
  const arkiverteGrenser = getArkiverteGrenser(history);
  const endredeGrenser = getEndredeGrenser(history);
  const metadataendringer = getMetadataChanges(history);
  const { laster: lasterDelinger, endringer: kretsdelinger } = useKretsdelingChanges(history);
  const kommuneendringer = getKommuneendringer(history, alleKommuner);

  const antallNyeGrenserArkivert = nyeGrenser.filter((id) => arkiverteGrenser.includes(id)).length;
  const antallNyeGrenserEndret = nyeGrenser.filter((id) => endredeGrenser.includes(id)).length;
  const antallEndredeGrenserArkivert = arkiverteGrenser.filter((id) => endredeGrenser.includes(id)).length;

  const antallNyeGrenser = nyeGrenser.length - antallNyeGrenserArkivert;
  const antallArkiverteGrenser = arkiverteGrenser.length - antallNyeGrenserArkivert;
  const antallEndredeGrenser = endredeGrenser.length - antallNyeGrenserEndret - antallEndredeGrenserArkivert;

  const antallKommuneNavnendringer = kommuneendringer.filter((k) => k.nyttNavn != null).length;
  const antallKommuneEndringSamiskForvaltningsomraade = kommuneendringer.filter(
    (k) => k.samiskforvaltningsomraade != null,
  ).length;

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

  return removeNil(
    kommunerMedEndringer.map((kommuneid) => {
      const firstChange = kommunechanges.find((change) => change.id === kommuneid)!;
      const lastChange = kommunechanges.findLast((change) => change.id === kommuneid)!;

      const kommune = alleKommuner?.find((kommuneResponse) => kommuneResponse.id.lokalid.value === kommuneid);
      const fromNavn = inndelingResponseNavnToString(firstChange.from.administrativenhetnavn);
      const toNavn = inndelingResponseNavnToString(lastChange.to.administrativenhetnavn);
      const fromSamiskForvalt = firstChange.from.samiskforvaltningsomraade;
      const toSamiskForvalt = lastChange.to.samiskforvaltningsomraade;

      if (fromNavn === toNavn && fromSamiskForvalt === toSamiskForvalt) {
        return null;
      }

      return {
        gammeltNavn: fromNavn,
        nummer: kommune?.nummer ?? "",
        nyttNavn: fromNavn !== toNavn ? toNavn : undefined,
        samiskforvaltningsomraade: fromSamiskForvalt !== toSamiskForvalt ? toSamiskForvalt : undefined,
      };
    }),
  );
};

const getArkiverteGrenser = (entries: HistoryEntry[]): string[] => {
  const arkiverteGrenser = getGrenseArkiveringEntries(entries)
    .flatMap((entry) => entry.changes)
    .map((change) => change.id);

  const arkiverteGrenserFraGrensedelinger = removeNil(
    getGrenseDelingEntries(entries)
      .flatMap((entry) => entry.changes)
      .flatMap((change) => change.from)
      .map((feature) => feature.getId()?.toString()),
  );

  const arkiverteGrenserFraGrenseMerge = removeNil(
    getGrenseMergeEntries(entries)
      .flatMap((entry) => entry.changes[0].from)
      .map((f) => f.getId()?.toString()),
  );

  return getUniqueItems(
    arkiverteGrenser.concat(arkiverteGrenserFraGrensedelinger).concat(arkiverteGrenserFraGrenseMerge),
  );
};

const getNyeGrenser = (entries: HistoryEntry[]): string[] => {
  const nyeGrenser = getNyGrenserEntriesEntries(entries)
    .flatMap((entry) => entry.changes)
    .map((change) => change.id);

  const nyeGrenserFraGrensedelinger = removeNil(
    getGrenseDelingEntries(entries)
      .flatMap((entry) => entry.changes)
      .flatMap((change) => {
        return change.to;
      })
      .map((feature) => feature.getId()?.toString()),
  );

  const nyeGrenserFraGrenseMerge = removeNil(
    getGrenseMergeEntries(entries)
      .flatMap((entry) => entry.changes[0].to)
      .map((f) => f.getId()?.toString()),
  );

  return getUniqueItems(nyeGrenser.concat(nyeGrenserFraGrensedelinger).concat(nyeGrenserFraGrenseMerge));
};

const getEndredeGrenser = (entries: HistoryEntry[]): string[] => {
  const changedGrenserTypes = ["grense", "property", "grensetilhorighetendring"];
  const changedGrenseIds = entries
    .filter((entry) => changedGrenserTypes.includes(entry.type))
    .flatMap((entry) => entry.changes.map((c) => c.id));
  return getUniqueItems(changedGrenseIds);
};

type UseKretsdelingChangesReturnType = {
  laster: boolean;
  endringer: KretsSplittingEndring[];
};

const useKretsdelingChanges = (entries: HistoryEntry[]): UseKretsdelingChangesReturnType => {
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const kretsdelingentries = getKretsDelingEntries(entries);
  const changes = kretsdelingentries.flatMap((entry) => entry.changes);
  const stemmekretsIds = getUniqueItems(
    changes.filter((change) => change.from.flatetype === "STEMMEKRETS").map((change) => change.id),
  );
  const grunnkretsIds = getUniqueItems(
    changes.filter((change) => change.from.flatetype === "GRUNNKRETS").map((change) => change.id),
  );

  const { data: stemmekretser, isLoading: isLoadingStemmekretser } = useStemmekretser(stemmekretsIds, gyldighetsdato);
  const { data: grunnkretser, isLoading: isLoadingGrunnkretser } = useGrunnkretser(grunnkretsIds, gyldighetsdato);

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
  const METADATA_ENTRY_TYPES = ["grunnkrets", "stemmekrets", "bopliktomraade", "kommune"];
  const metadataendringer = entries
    .filter((entry): entry is GrunnkretsEntry | StemmekretsEntry | BopliktomraadeEntry | KommuneEntry =>
      METADATA_ENTRY_TYPES.includes(entry.type),
    )
    .flatMap((entry) => {
      switch (entry.type) {
        case "grunnkrets":
          return mapMetadataEntryToMetadataendringerForInndeling(entry);
        case "stemmekrets":
          return mapMetadataEntryToMetadataendringerForInndeling(entry);
        case "bopliktomraade":
          return mapMetadataEntryToMetadataendringerForInndeling(entry);
        case "kommune": {
          throw new Error('Not implemented yet: "kommune" case');
        }
        default:
          return null;
      }
    });
  return combineMetadataChangesForSameId(removeNil(metadataendringer));
};

type MetadataendringerWithId = Metadataendringer & { id: string };
const mapMetadataEntryToMetadataendringerForInndeling = (
  entry: StemmekretsEntry | GrunnkretsEntry | BopliktomraadeEntry,
): MetadataendringerWithId[] => {
  return entry.changes.map((change) => ({
    kretsType: mapEntrytypeToEndringsloggInndelingType(entry.type),
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
        "Noe gikk galt ved oppbygning av endringsloggen. Klarte ikke finne igjen endringen for kretsen. Dette burde ikke kunne skje. Kontakt derfor Kartverket og oppgi at du har mottatt denne feilmeldingen.",
      );
    }

    return { ...lastChangeForKrets, opprinneligKrets: firstChangeForKrets?.opprinneligKrets };
  });
};

const mapEntrytypeToEndringsloggInndelingType = (
  entrytype: "grunnkrets" | "stemmekrets" | "bopliktomraade",
): EndringsloggInndelingType => {
  switch (entrytype) {
    case "grunnkrets":
      return "GRUNNKRETS";
    case "stemmekrets":
      return "STEMMEKRETS";
    case "bopliktomraade":
      return "BOPLIKTOMRAADE";
  }
};
