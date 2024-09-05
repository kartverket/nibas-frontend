import { Text, Heading, Icon, Link, Stack, Table, Thead, Tr, Th, Tbody, Card } from "@kvib/react";
import { Page, PageContainer } from "components/Page";
import LandingHeader from "pages/Landing/LandingHeader";
import { styled } from "styled-components";
import { routes } from "utils/routes";
import { Link as RouterLink } from "react-router-dom";

export const Endringer = () => {
  return (
    <PageContainer>
      <LandingHeader />
      <EndringerPage>
        <TitleContainer>
          <ReturnButton to={routes.index}>
            <Icon icon="arrow_back" />
            <span>Gå tilbake</span>
          </ReturnButton>
          <Stack>
            <Heading as="h1" size="lg">
              Fremtidige endringer
            </Heading>
            <Text>Merk at du ikke kan gjøre endringer på allerede publiserte endringer.</Text>{" "}
          </Stack>
        </TitleContainer>
        <SubTitleContainer>
          <Text>Se endringer som inntreffer etter:</Text>
          <Text as="b">{new Date().toDateString()}</Text>
        </SubTitleContainer>
        <TableContainer>
          <Table colorScheme="gray">
            <Thead>
              <Tr>
                <StyledCell>Beskrivelse</StyledCell>
                <StyledCell>Type endring</StyledCell>
                <StyledCell>Gyldig fra</StyledCell>
                <StyledCell>Berørte inndelinger</StyledCell>
              </Tr>
            </Thead>
            <Tbody></Tbody>
          </Table>
        </TableContainer>
      </EndringerPage>
    </PageContainer>
  );
};

const EndringerPage = styled(Page)`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto 1fr;
  grid-template-areas:
    "title"
    "subtitle"
    "table";
  justify-items: unset;
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

const ReturnButton = styled(Link).attrs({ as: RouterLink })`
  display: flex;
  gap: 4px;
  align-items: center;
  grid-column: 1 / -1;
  align-self: start;
  color: var(--kvib-colors-blue-500);

  & > .material-symbols-rounded {
    font-size: 20px;
    transition: transform 0.2s;
  }

  &:hover {
    & > .material-symbols-rounded {
      transform: translateX(-4px);
    }

    & > span:last-child {
      text-decoration: underline;
    }
  }
`;

const SubTitleContainer = styled(Card)`
  margin-top: 48px;
  grid-area: subtitle;
  box-shadow: none;
  padding: 28px;
`;

const TableContainer = styled(Card)`
  grid-area: table;
  box-shadow: none;
`;

const StyledCell = styled(Th)`
  padding: 16px 28px;
  text-transform: capitalize;
  color: unset;
`;
