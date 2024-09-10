import { Text, Heading, Icon, Link, Stack, Table, Thead, Tr, Th, Tbody, Card, Td } from "@kvib/react";
import { Page, PageContainer } from "components/Page";
import LandingHeader from "pages/Landing/LandingHeader";
import { styled } from "styled-components";
import { routes } from "utils/routes";
import { Link as RouterLink } from "react-router-dom";
import { useUtkasts } from "hooks/inndelinger/useUtkasts";
import { format } from "date-fns";
import { UtkastResponse } from "types/api";
import { useStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { useGrunnkretser } from "hooks/inndelinger/useGrunnkretser";

const utkastColumns = {
  Beskrivelse: "navn",
  "Type endring": "endringstype",
  "Gyldig fra": "gyldigFra",
  "Berørte inndelinger": "endredeInndelinger",
};

export const Endringer = () => {
  const { data: utkasts } = useUtkasts(["PUBLISERT"], format(new Date(), "yyyy-MM-dd"));

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
          <Text as="b" fontSize={"large"}>
            {format(new Date(), "dd.MM.yyyy")}
          </Text>
        </SubTitleContainer>
        <TableContainer>
          <Table colorScheme="gray">
            <Thead>
              <Tr>
                {Object.keys(utkastColumns).map((column) => (
                  <TitleCell key={column}>{column}</TitleCell>
                ))}
              </Tr>
            </Thead>
            {utkasts != null && (
              <Tbody>
                {utkasts.map((utkast) => (
                  <UtkastRow key={utkast.id} utkast={utkast} />
                ))}
              </Tbody>
            )}
          </Table>
        </TableContainer>
      </EndringerPage>
    </PageContainer>
  );
};

interface UtkastRowProps {
  utkast: UtkastResponse;
}

const UtkastRow = ({ utkast }: UtkastRowProps) => {
  const { data: endredeStemmekretser } = useStemmekretser(utkast.endredeInndelinger, utkast.gyldigFra);
  const foundStemmekretserIds = endredeStemmekretser?.map((sk) => sk.id.lokalid.value);
  const { data: endredeGrunnkretser } = useGrunnkretser(
    utkast.endredeInndelinger.filter((id) => foundStemmekretserIds?.includes(id) === false),
    utkast.gyldigFra,
  );

  return (
    <Tr>
      <StyledCell>{utkast.navn}</StyledCell>
      <StyledCell>{utkast.endringstype}</StyledCell>
      <StyledCell>{format(utkast.gyldigFra, "dd.MM.yyyy")}</StyledCell>
      <StyledCell>
        {endredeGrunnkretser?.map((gk) => (
          <Text key={gk.id.lokalid.value}>{`${gk.kommunenummer.kodeverdi}${gk.nummer} ${gk.navn}`}</Text>
        ))}
        {endredeStemmekretser?.map((sk) => (
          <Text key={sk.id.lokalid.value}>{`${sk.kommunenummer.kodeverdi}${sk.nummer} ${sk.navn}`}</Text>
        ))}
      </StyledCell>
    </Tr>
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

const StyledCell = styled(Td)`
  padding: 16px 28px;
`;

const TitleCell = styled(Th)`
  padding: 16px 28px;
  text-transform: capitalize;
  color: unset;
`;
