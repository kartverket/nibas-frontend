import { Alert, AlertIcon, AlertTitle, Box, Button, Collapse } from "@kvib/react";
import { HistoryState } from "contexts/HistoryContext/types";
import { useState } from "react";
import { styled } from "styled-components";
import { useUlagredeEndringer } from "../hooks/useUlagredeEndringer";
import { AggregatedUlagredeEndringer } from "./AggregatedUlagredeEndringer";

type Props = {
  history: HistoryState;
  harLagredeEndringer: boolean;
};

export const UlagredeEndringerCollapse = ({ history, harLagredeEndringer }: Props) => {
  const [isExpanded, setIsExpanded] = useState(!harLagredeEndringer);
  const ulagredeEndringer = useUlagredeEndringer();

  return (
    history.index > 0 && (
      <CustomCollapse animateOpacity={false} in={isExpanded} startingHeight={64}>
        <AlertWithButton status="warning">
          <Wrapper>
            <AlertIcon />
            <AlertTitle>
              Du har {ulagredeEndringer.length}{" "}
              {ulagredeEndringer.length > 1 ? "ulagrede endringer" : "ulagret endring"} i utkastet
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
          <AggregatedUlagredeEndringer abstrahertHistory={ulagredeEndringer} />
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
