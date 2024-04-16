import { HistoryTypeValues } from "contexts/HistoryContext/types";
import { Endringer } from "./Endring";
import { MinimalHistoryEntry } from "./UlagredeEndringer";
import { Stack, Text } from "@kvib/react";
import { ReactNode } from "react";

type Props = {
  entries: MinimalHistoryEntry[];
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
          endringer.length > 0 && <Endringer key={type} type={type as HistoryTypeValues} endringer={endringer} />,
      )}
    </>
  );
};

export const HistoryEndringer = ({ entries: minimalHistoryEntries }: Props) => {
  return (
    <Stack spacing={4}>
      <Text fontSize={"sm"}>
        {`Publiserer du uten å lagre først vil ${minimalHistoryEntries.length > 1 ? "endringene" : "endringen"} nedenfor ikke bli med.`}
      </Text>
      {getAggregatedEndringer(minimalHistoryEntries)}
    </Stack>
  );
};
