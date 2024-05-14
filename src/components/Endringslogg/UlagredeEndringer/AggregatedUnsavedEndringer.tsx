import { Text } from "@kvib/react";
import { HistoryTypeValues } from "contexts/HistoryContext/types";
import { styled } from "styled-components";
import { AbstractedHistoryEntry } from "../hooks/useUnsavedEndringer";
import { EndringerCard } from "./EndringerCard";

type Props = {
  abstractedHistory: AbstractedHistoryEntry[];
};

const getAggregatedEndringer = (abstractedHistoryEndringer: AbstractedHistoryEntry[]) => {
  const aggregatedEndringer: Record<HistoryTypeValues, AbstractedHistoryEntry[]> = {
    grense: [],
    property: [],
    kommune: [],
    grunnkrets: [],
    stemmekrets: [],
    utkast: [],
    stemmekretssammenslaaingsendring: [],
    grensearkivering: [],
    grensetilhorighetendring: [],
    nygrense: [],
    grensedeling: [],
  };

  for (const entry of abstractedHistoryEndringer) {
    aggregatedEndringer[entry.type].push(entry);
  }

  return Object.entries(aggregatedEndringer).map(
    ([type, endringer]) =>
      endringer.length > 0 && <EndringerCard key={type} type={type as HistoryTypeValues} endringer={endringer} />,
  );
};

export const AggregatedUnsavedEndringer = ({ abstractedHistory }: Props) => {
  return (
    <Container>
      <Text fontSize={"sm"}>
        {`Publiserer du uten å lagre først vil ${abstractedHistory.length > 1 ? "endringene" : "endringen"} nedenfor ikke bli med.`}
      </Text>
      {getAggregatedEndringer(abstractedHistory)}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--kvib-space-4);
`;
