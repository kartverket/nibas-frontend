import { Card, Heading, Icon, Link, Stack, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@kvib/react";
import { Page, PageContainer } from "components/Page";
import { format } from "date-fns";
import { useGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import { useStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { useUtkasts } from "hooks/inndelinger/useUtkasts";
import LandingHeader from "pages/Landing/LandingHeader";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { styled } from "styled-components";
import { GrunnkretsResponse, StemmekretsResponse, UtkastResponse } from "types/api";
import { routes } from "utils/routes";

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
            <Stack direction={"row"}>
              <Text>Merk at du ikke kan gjøre endringer på allerede publiserte endringer.</Text>
              <FremtidigeUtkastTooltip />
            </Stack>
          </Stack>
        </TitleContainer>
        <SubTitleContainer>
          <Text>Se endringer som inntreffer etter</Text>
          <Text as="b" fontSize={"large"}>
            {format(new Date(), "dd.MM.yyyy")}
          </Text>
        </SubTitleContainer>
        {utkasts != null && utkasts.length > 0 ? (
          <TableContainer>
            <Table colorScheme="gray">
              <Thead>
                <Tr>
                  {Object.keys(utkastColumns).map((column) => (
                    <TitleCell key={column}>{column}</TitleCell>
                  ))}
                </Tr>
              </Thead>

              <Tbody>
                {utkasts.map((utkast) => (
                  <UtkastRow key={utkast.id} utkast={utkast} />
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        ) : (
          <NoUtkastsMessageContainer>
            <Text>{`Det er ingen publiserte utkast med endringer gyldig fra ${format(new Date(), "dd.MM.yyyy")}`}</Text>
          </NoUtkastsMessageContainer>
        )}
      </EndringerPage>
    </PageContainer>
  );
};

interface UtkastRowProps {
  utkast: UtkastResponse;
}

const UtkastRow = ({ utkast }: UtkastRowProps) => {
  const { data: endredeStemmekretser } = useStemmekretser(utkast.endredeInndelinger, utkast.gyldigFra);
  const { data: endredeGrunnkretser } = useGrunnkretser(utkast.endredeInndelinger, utkast.gyldigFra);

  const berørteInndelinger =
    endredeGrunnkretser != null && endredeStemmekretser != null
      ? [
          ...[...endredeStemmekretser, ...endredeGrunnkretser]
            .reduce((acc, current) => {
              acc.set(current.id, current);
              return acc;
            }, new Map())
            .values(),
        ]
      : [];

  return (
    <Tr>
      <StyledCell>{utkast.navn}</StyledCell>
      <StyledCell>{utkast.endringstype}</StyledCell>
      <StyledCell>{format(utkast.gyldigFra, "dd.MM.yyyy")}</StyledCell>
      <StyledCell>
        {berørteInndelinger?.map((inndeling: StemmekretsResponse | GrunnkretsResponse) => (
          <Text
            key={inndeling.id.lokalid.value}
          >{`${inndeling.kommunenummer.kodeverdi}${inndeling.nummer} ${inndeling.navn}`}</Text>
        ))}
      </StyledCell>
    </Tr>
  );
};

const FremtidigeUtkastTooltip = () => {
  const [iconHovered, setIconHovered] = useState(false);

  return (
    <Tooltip
      label={
        <>
          Når er utkast er publisert kan det ikke trekkes tilbake. For å rette det må du lage et <b>nytt utkast</b> med{" "}
          <b>samme gyldig fra-dato som den fremtidige feilen oppstår</b>
        </>
      }
      hasArrow
      placement="bottom"
    >
      <InfoIcon>
        <Icon
          onMouseOver={() => setIconHovered(true)}
          onMouseOut={() => setIconHovered(false)}
          size={24}
          color="var(--kvib-colors-blue-500)"
          isFilled={iconHovered}
          icon="info"
        ></Icon>
      </InfoIcon>
    </Tooltip>
  );
};

const InfoIcon = styled.div`
  display: flex;
  align-items: center;
  cursor: help;
`;

const NoUtkastsMessageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

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
  text-transform: unset;
  color: unset;
  font-size: small;
`;
