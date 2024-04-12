import { Alert, AlertIcon, AlertTitle, Button, Collapse, Box, Stack, Text } from "@kvib/react";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useState } from "react";
import { styled } from "styled-components";

export const UlagredeEndringer = () => {
  const { history } = useHistory();
  const [isExpanded, setIsExpanded] = useState(false);

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
          <Stack>
            {history.entries.map((entry, i) => (
              <div key={i}>{entry.type}</div>
            ))}
          </Stack>
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
