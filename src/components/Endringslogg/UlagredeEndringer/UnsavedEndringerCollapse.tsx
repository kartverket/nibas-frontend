import { Alert, AlertIcon, AlertTitle, Box, Button, Collapse } from "@kvib/react";
import { useState } from "react";
import { styled } from "styled-components";
import { useUnsavedEndringer } from "../hooks/useUnsavedEndringer";
import { AggregatedUnsavedEndringer } from "./AggregatedUnsavedEndringer";

type Props = {
  expandedByDefault?: boolean;
};

export const UnsavedEndringerCollapse = ({ expandedByDefault = false }: Props) => {
  const [isExpanded, setIsExpanded] = useState(expandedByDefault);
  const abstractedHistory = useUnsavedEndringer();

  const numberOfUnsavedEndringer = abstractedHistory.length;

  return (
    numberOfUnsavedEndringer > 0 && (
      <CustomCollapse animateOpacity={false} in={isExpanded} startingHeight={64}>
        <AlertWithButton status="warning">
          <Wrapper>
            <AlertIcon />
            <AlertTitle>
              Du har {numberOfUnsavedEndringer}{" "}
              {numberOfUnsavedEndringer > 1 ? "ulagrede endringer" : "ulagret endring"} i utkastet
            </AlertTitle>
          </Wrapper>
          <CustomButton
            rightIcon={isExpanded ? "arrow_upward" : "arrow_downward"}
            variant="tertiary"
            onClick={() => setIsExpanded((prevState) => !prevState)}
          >
            {isExpanded ? "Skjul" : "Vis"} {numberOfUnsavedEndringer > 1 ? "ulagrede endringer" : "ulagret endring"}
          </CustomButton>
        </AlertWithButton>
        <EndringerContent>
          <AggregatedUnsavedEndringer abstractedHistory={abstractedHistory} />
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
