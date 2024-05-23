import { Text } from "@kvib/react";
import { styled } from "styled-components";
import { Kretsendringer } from "components/Endringslogg/hooks/utkastEndringerTypes";
import { EndringerCardList } from "components/Endringslogg/EndringerCardList";

type UnsavedEndringerProps = {
  antall: number;
  endringer: Kretsendringer;
};

export const UnsavedEndringer = ({ antall, endringer }: UnsavedEndringerProps) => {
  return (
    <Container>
      <Text fontSize={"sm"} marginBottom="8px">
        {`Publiserer du uten å lagre først vil ${antall > 1 ? "endringene" : "endringen"} nedenfor ikke bli med.`}
      </Text>
      <EndringerCardList endringer={endringer} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
