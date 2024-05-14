import { Alert, AlertIcon, AlertTitle, Box, Button, Collapse } from "@kvib/react";
import { useState } from "react";
import { styled } from "styled-components";
import { UnsavedEndringer } from "components/Endringslogg/UlagredeEndringer/UnsavedEndringer";
import { useUnsavedEndringer } from "components/Endringslogg/hooks/useUnsavedEndringer";

type Props = {
  expandedByDefault?: boolean;
};

export const UnsavedEndringerCollapse = ({ expandedByDefault = false }: Props) => {
  const [isExpanded, setIsExpanded] = useState(expandedByDefault);
  const { antallEndringer, endringer } = useUnsavedEndringer();

  return (
    antallEndringer > 0 && (
      <CustomCollapse animateOpacity={false} in={isExpanded} startingHeight={64}>
        <AlertWithButton status="warning">
          <Wrapper>
            <AlertIcon />
            <AlertTitle>
              Du har {antallEndringer} {antallEndringer > 1 ? "ulagrede endringer" : "ulagret endring"} i utkastet
            </AlertTitle>
          </Wrapper>
          <CustomButton
            rightIcon={isExpanded ? "arrow_upward" : "arrow_downward"}
            variant="tertiary"
            onClick={() => setIsExpanded((prevState) => !prevState)}
          >
            {isExpanded ? "Skjul" : "Vis"} {antallEndringer > 1 ? "ulagrede endringer" : "ulagret endring"}
          </CustomButton>
        </AlertWithButton>
        <EndringerContent>
          <UnsavedEndringer antall={antallEndringer} endringer={endringer} />
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
