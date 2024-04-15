import { Alert, AlertIcon, AlertTitle, Button, Collapse, Box, Text } from "@kvib/react";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { HistoryEntry, HistoryTypeValues } from "contexts/HistoryContext/types";
import { useMemo, useState } from "react";
import { styled } from "styled-components";

type MinimalHistoryEntry<T> = {
  type: HistoryTypeValues;
  lokalid: string;
  from: T;
  to: T;
};

export const UlagredeEndringer = () => {
  const { history } = useHistory();
  const [isExpanded, setIsExpanded] = useState(false);

  // History lagrer absolutt alt, men vi er kun interessert i å vise bruker hva som er forskjellen sammenlignet med utkastet.
  // Dermed må vi finne de siste endringene for hver lokalid, og sammenligne dette med den første endringen sin "from" (utgangspunktet) for å se hva som faktisk blir endringen man utfører hvis man lagrer.
  const minimalHistory = useMemo(() => {
    const firstEntriesForLokalids: Record<string, HistoryEntry> = {};
    const latestEntriesForLokalids: Record<string, HistoryEntry> = {};

    history.entries.forEach((entry) => {
      const change = entry.changes[0];
      if (!(change.id in firstEntriesForLokalids)) {
        firstEntriesForLokalids[change.id] = entry;
      }
    });

    history.entries
      .slice()
      .reverse()
      .forEach((entry) => {
        const change = entry.changes[0];
        if (!(change.id in latestEntriesForLokalids)) {
          latestEntriesForLokalids[change.id] = entry;
        }
      });

    const minimalChanges: MinimalHistoryEntry<unknown>[] = Object.entries(firstEntriesForLokalids).map(
      ([lokalid, entry]) => {
        const firstFrom = entry.changes[0].from;
        const lastTo = latestEntriesForLokalids[lokalid].changes[0].to;
        return { type: entry.type, lokalid: lokalid, from: firstFrom, to: lastTo };
      },
    );

    return minimalChanges;
  }, [history.entries]);

  return (
    history.index > 0 && (
      <CustomCollapse animateOpacity={false} in={isExpanded} startingHeight={64}>
        <AlertWithButton status="warning">
          <Wrapper>
            <AlertIcon />
            <AlertTitle>
              Du har {history.index} {history.index > 1 ? "ulagrede endringer" : "ulagret endring"} i utkastet
            </AlertTitle>
          </Wrapper>
          <CustomButton
            rightIcon={isExpanded ? "arrow_upward" : "arrow_downward"}
            variant="tertiary"
            onClick={() => setIsExpanded((prevState) => !prevState)}
          >
            {isExpanded ? "Skjul" : "Vis"} {history.index > 1 ? "ulagrede endringer" : "ulagret endring"}
          </CustomButton>
        </AlertWithButton>
        <EndringerContent>
          <Text fontSize={"sm"}>Publiserer du uten å lagre først vil endringene nedenfor ikke bli med.</Text>
        </EndringerContent>
      </CustomCollapse>
    )
  );
};

const CustomCollapse = styled(Collapse)`
  background-color: var(--kvib-colors-orange-100);
  border-radius: 8px;
`;

const AlertWithButton = styled(Alert)`
  justify-content: space-between;
`;

const Wrapper = styled.div`
  display: flex;
`;

const CustomButton = styled(Button)`
  padding: 0;
`;

const EndringerContent = styled(Box)`
  padding: 0 var(--kvib-space-4) var(--kvib-space-4) var(--kvib-space-4);
`;
