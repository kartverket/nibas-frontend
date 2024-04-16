import { HistoryTypeValues } from "contexts/HistoryContext/types";
import { Endring } from "./Endring";
import { MinimalHistoryEntry } from "./UlagredeEndringer";
import { Stack, Text } from "@kvib/react";
import { ReactNode } from "react";

type Props = {
  minimalHistoryEntries: MinimalHistoryEntry[];
};

const getAggregatedEndringer = (minimaleHistoryEndringer: MinimalHistoryEntry[]): ReactNode => {
  const aggregatedEndringer: Record<HistoryTypeValues, MinimalHistoryEntry[]> = {
    grense: [],
    property: [],
    grunnkrets: [],
    stemmekrets: [],
    utkast: [],
    stemmekretssammenslaaingsendring: [],
    grensearkivering: [],
    grensetilhorighetendring: [],
    nygrense: [],
    grensedeling: [],
  };

  minimaleHistoryEndringer.forEach((entry) => aggregatedEndringer[entry.type].push(entry));

  return (
    <>
      {Object.entries(aggregatedEndringer).map(
        ([type, endringer]) =>
          endringer.length > 0 && <Endring key={type} type={type as HistoryTypeValues} endringer={endringer} />,
      )}
    </>
  );
};

export const HistoryEndringer = ({ minimalHistoryEntries }: Props) => {
  return (
    <Stack spacing={4}>
      <Text fontSize={"sm"}>Publiserer du uten å lagre først vil endringene nedenfor ikke bli med.</Text>
      {getAggregatedEndringer(minimalHistoryEntries)}
    </Stack>
  );
};
