import { Alert, AlertTitle, Box, Button, Collapsible } from "@kvib/react";
import { useState } from "react";
import { styled } from "styled-components";
import { UnsavedEndringer } from "components/Endringslogg/UlagredeEndringer/UnsavedEndringer";
import { useUnsavedEndringer } from "components/Endringslogg/hooks/useUnsavedEndringer";

type Props = {
  expandedByDefault?: boolean;
};

export const UnsavedEndringerCollapse = ({ expandedByDefault = false }: Props) => {
  const [isExpanded, setIsExpanded] = useState(expandedByDefault);
  const { antallEndringer, kretsendringer, kommuneendringer } = useUnsavedEndringer();

  return (
    antallEndringer > 0 && (
      <CustomCollapse open={isExpanded}>
        <AlertWithButton status="warning">
          <Wrapper>
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
          <UnsavedEndringer
            antall={antallEndringer}
            kretsendringer={kretsendringer}
            kommuneendringer={kommuneendringer}
          />
        </EndringerContent>
      </CustomCollapse>
    )
  );
};

// TODO: check that this works..
const CustomCollapse = styled(Collapsible)`
  background-color: var(--kvib-colors-orange-100);
  border-radius: 8px;

  [data-state="closed"] {
    height: 64px;
    overflow: hidden;
  }

  [data-state="open"] {
    animation: expand-height 200ms ease-out;
  }
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
