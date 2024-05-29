import { Text } from "@kvib/react";
import { styled } from "styled-components";
import { Kommuneendringer, Kretsendringer } from "components/Endringslogg/hooks/utkastEndringerTypes";
import { EndringerKommuneCardList } from "components/Endringslogg/EndringerKommuneCardList";
import { EndringerFylkeCardList } from "components/Endringslogg/EndringerFylkeCardList";

type UnsavedEndringerProps = {
  antall: number;
  kretsendringer: Kretsendringer;
  kommuneendringer: Kommuneendringer[];
};

export const UnsavedEndringer = ({ antall, kretsendringer, kommuneendringer }: UnsavedEndringerProps) => {
  return (
    <Container>
      <Text fontSize={"sm"} marginBottom="8px">
        {`Publiserer du uten å lagre først vil ${antall > 1 ? "endringene" : "endringen"} nedenfor ikke bli med.`}
      </Text>
      <EndringerKommuneCardList endringer={kretsendringer} />
      <EndringerFylkeCardList endringer={kommuneendringer} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
