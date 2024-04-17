import { HistoryTypeValues } from "contexts/HistoryContext/types";
import { EndringerCard } from "./EndringerCard";
import { Stack, Text } from "@kvib/react";
import { ReactNode } from "react";
import { AbstrahertHistroyEntry } from "../hooks/useUlagredeEndringer";

type Props = {
  abstrahertHistory: AbstrahertHistroyEntry[];
};

const getAggregatedEndringer = (abstraherteHistoryEndringer: AbstrahertHistroyEntry[]): ReactNode => {
  const aggregatedEndringer: Record<HistoryTypeValues, AbstrahertHistroyEntry[]> = {
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

  abstraherteHistoryEndringer.forEach((entry) => aggregatedEndringer[entry.type].push(entry));

  return Object.entries(aggregatedEndringer).map(
    ([type, endringer]) =>
      endringer.length > 0 && <EndringerCard key={type} type={type as HistoryTypeValues} endringer={endringer} />,
  );
};

export const AggregatedUlagredeEndringer = ({ abstrahertHistory }: Props) => {
  return (
    <Stack spacing={4}>
      <Text fontSize={"sm"}>
        {`Publiserer du uten å lagre først vil ${abstrahertHistory.length > 1 ? "endringene" : "endringen"} nedenfor ikke bli med.`}
      </Text>
      {getAggregatedEndringer(abstrahertHistory)}
    </Stack>
  );
};
