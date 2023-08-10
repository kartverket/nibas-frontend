import { Heading, Link } from "@kvib/react";
import { BasePage } from "components/Page";
import { useUtkasts } from "hooks/inndelinger/useUtkasts";
import { Endringstype } from "pages/Kart/constants";
import styled from "styled-components";
import { UtkastResponse } from "types/api";
import UtkastCard from "./UtkastCard";
import UtkastOpprett from "./UtkastOpprett";
import LandingHeader from "pages/Landing/LandingHeader";
import Icon from "components/Icon/Icon";
import { Link as RouterLink } from "react-router-dom";
import { routes } from "utils/routes";
import Loading from "pages/App/Loading";

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
  const { data: utkasts, isLoading } = useUtkasts();

  // Vi deler opp utkast i to kolonner manuelt i et forsøk på å holde lengden jevn
  const rightColumn: UtkastGroup = {};
  const leftColumn: UtkastGroup = {};

  utkasts?.forEach((u) => {
    // Grupperer utkast etter endringstype
    if (endringstypeOrder[u.endringstype as Endringstype] === "left") {
      leftColumn[u.endringstype] = [...(leftColumn[u.endringstype] || []), u];
    } else {
      rightColumn[u.endringstype] = [...(rightColumn[u.endringstype] || []), u];
    }
  });

  return (
    <>
      <LandingHeader />
      <Container>
        <TitleContainer>
          <ReturnButton to={routes.index}>
            <Icon icon="arrow_back" />
            <span>Gå tilbake</span>
          </ReturnButton>
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
                  {utkastsInGroup.sort(sortUtkastByCreatedDesc).map((u) => (
                    <UtkastCard key={u.id} utkast={u} />
                  ))}
                </EndringstypeGroup>
              ))}
          </EndringstypeList>
        ))}
      </Container>
      <Loading isLoading={isLoading} />
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
  display: grid;
  grid-template-columns: auto auto;
  justify-items: start;
  gap: 12px 24px;
  grid-area: title;
  width: fit-content;
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

const ReturnButton = styled(Link).attrs({ as: RouterLink })`
  display: flex;
  gap: 4px;
  align-items: center;
  grid-column: 1 / -1;
  align-self: start;
  color: var(--kvib-colors-blue-500);

  & > ${Icon} {
    font-size: 20px;
    transition: transform 0.2s;
  }

  &:hover {
    & > ${Icon} {
      transform: translateX(-4px);
    }
    & > span:last-child {
      text-decoration: underline;
    }
  }
`;

export default Utkast;
