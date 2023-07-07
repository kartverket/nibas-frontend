import { Heading } from "@kvib/react";
import { BasePage } from "components/Page";
import { useUtkasts } from "hooks/inndelinger/useUtkasts";
import { Endringstype } from "pages/Kart/constants";
import styled from "styled-components";
import { UtkastResponse } from "types/api";
import UtkastCard from "./UtkastCard";
import UtkastOpprett from "./UtkastOpprett";

const endringstypeOrder: Record<Endringstype, "left" | "right"> = {
  "Vedtatt grensejustering": "left",
  "Vedtatt sammenslåing": "left",
  "Vedtatt deling": "left",
  Fastsetting: "right",
  Kvalitetsheving: "right",
  Navneendring: "right",
  Nummerendring: "right",
  Retting: "right",
};

type UtkastGroup = Record<UtkastResponse["endringstype"], UtkastResponse[]>;

const sortUtkastByCreatedDesc = (
  a: UtkastResponse,
  b: UtkastResponse
): number => b.opprettetDato.localeCompare(a.opprettetDato);

const Utkast = () => {
  const { data: utkasts } = useUtkasts();

  // TODO: håndter bedre
  if (!utkasts) return null;

  // Vi deler opp utkast i to kolonner manuelt i et forsøk på å holde lengden jevn
  // Grupperer utkast etter endringstype
  const rightColumn: UtkastGroup = {};
  const leftColumn: UtkastGroup = {};
  for (const utkast of utkasts) {
    if (endringstypeOrder[utkast.endringstype as Endringstype] === "left") {
      leftColumn[utkast.endringstype] = [
        ...(leftColumn[utkast.endringstype] || []),
        utkast,
      ];
    } else {
      rightColumn[utkast.endringstype] = [
        ...(rightColumn[utkast.endringstype] || []),
        utkast,
      ];
    }
  }

  return (
    <>
      <Header>TODO: Jeg skal bli en Header en dag!</Header>
      <Container>
        <TitleContainer>
          <Heading as="h1" size="lg">
            Upubliserte utkast
          </Heading>
          <UtkastOpprett />
        </TitleContainer>
        {[leftColumn, rightColumn].map((column, i) => (
          <EndringstypeList key={i}>
            {Object.entries(column)
              .sort()
              .map(([endringstype, utkastsInGroup]) => (
                <EndringstypeGroup key={endringstype}>
                  <Heading size="md">{endringstype}</Heading>
                  {utkastsInGroup
                    .sort(sortUtkastByCreatedDesc)
                    .map((utkast) => (
                      <UtkastCard key={utkast.id} utkast={utkast} />
                    ))}
                </EndringstypeGroup>
              ))}
          </EndringstypeList>
        ))}
      </Container>
    </>
  );
};

const Container = styled(BasePage)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "title title"
    "left right";
  gap: 48px;
  padding: 64px;
`;

const TitleContainer = styled.div`
  display: flex;
  gap: 24px;
  grid-area: title;
`;

const Header = styled.header`
  background: white;
  padding: 20px;
`;

const EndringstypeList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 48px;
`;

const EndringstypeGroup = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export default Utkast;
