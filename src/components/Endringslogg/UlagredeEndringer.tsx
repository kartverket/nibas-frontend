import { Alert, AlertIcon, AlertTitle, Box, Button, Collapse } from "@kvib/react";
import { HistoryState, HistoryTypeValues, MinimalGrense } from "contexts/HistoryContext/types";
import { UtkastRequestWithoutOperations } from "contexts/UtkastContext/types";
import { Feature } from "ol";
import { useState } from "react";
import { styled } from "styled-components";
import {
  FeatureProperties,
  GrunnkretsRequest,
  KontekstEgenskaper,
  StemmekretsRequest,
  StemmekretsSammenslaaingsendringRequest,
} from "types/api";
import { HistoryEndringer } from "./HistoryEndring";
import { useUlagredeEndringer } from "./hooks/useUlagredeEndringer";

type Props = {
  history: HistoryState;
  harLagredeEndringer: boolean;
};

type historyData =
  | MinimalGrense
  | FeatureProperties
  | GrunnkretsRequest
  | StemmekretsRequest
  | UtkastRequestWithoutOperations
  | StemmekretsSammenslaaingsendringRequest
  | FeatureProperties
  | KontekstEgenskaper[]
  | (MinimalGrense & FeatureProperties)
  | Feature[];

export type MinimalHistoryEntry = {
  type: HistoryTypeValues;
  lokalid: string;
  from: historyData;
  to: historyData;
};

export const UlagredeEndringer = ({ history, harLagredeEndringer }: Props) => {
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
          <HistoryEndringer entries={ulagredeEndringer} />
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
