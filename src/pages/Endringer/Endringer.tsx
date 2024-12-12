import {
  Card,
  Heading,
  Icon,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
} from "@kvib/react";
import { createUtkast } from "api/utkast";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { Page, PageContainer } from "components/Page";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { format, subDays } from "date-fns";
import { useFylkerByIds } from "hooks/inndelinger/useFylker";
import { useGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import { useKommunerByIds } from "hooks/inndelinger/useKommuner";
import { useStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { useUtkasts } from "hooks/inndelinger/useUtkasts";
import Loading from "pages/App/Loading";
import { endringstyper } from "pages/Kart/constants";
import LandingHeader from "pages/Landing/LandingHeader";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { ApiErrorResponse, UtkastResponse } from "types/api";
import { statusCode } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";
import { inndelingColors } from "utils/map/layerStyles";
import { routes } from "utils/routes";

const utkastColumns = {
  Beskrivelse: "navn",
  "Type endring": "endringstype",
  "Gyldig fra": "gyldigFra",
  "Berørte inndelinger": "endredeInndelinger",
};

export const Endringer = () => {
  const { data: utkasts, isLoading } = useUtkasts(["PUBLISERT"], format(new Date(), "yyyy-MM-dd"));

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
        {isLoading ? (
          <Loading />
        ) : utkasts != null && utkasts.length > 0 ? (
          <TableContainer>
            <Table colorScheme="gray">
              <Thead>
                <Tr>
                  {Object.keys(utkastColumns).map((column) => (
                    <TitleCell key={column}>{column}</TitleCell>
                  ))}
                  <TitleCell />
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
  const { token } = useAuthentication();
  const toast = useToast();
  const navigate = useNavigate();
  const { setError } = useErrorHandling();

  // Vi ønsker å vise opprinnelige navn og nummere for inndelingene, og må derfor bruke dagen før utkastet sine endringer trer i kraft.
  const beforePublisering = format(subDays(new Date(utkast.gyldigFra), 1), "yyyy-MM-dd");

  const { data: endredeStemmekretser } = useStemmekretser(
    utkast.endredeInndelinger.endredeStemmekretser,
    beforePublisering,
  );
  const { data: endredeGrunnkretser } = useGrunnkretser(
    utkast.endredeInndelinger.endredeGrunnkretser,
    beforePublisering,
  );
  const { data: endredeKommuner } = useKommunerByIds(utkast.endredeInndelinger.endredeKommuner, beforePublisering);

  const { data: endredeFylker } = useFylkerByIds(utkast.endredeInndelinger.endredeFylker, beforePublisering);

  const opprettFeilrettingUtkast = async () => {
    const response = await createUtkast(
      {
        navn: "Feilretting: ".concat(utkast.navn),
        endringstype: endringstyper[7],
        gyldigFra: utkast.gyldigFra,
      },
      token,
    );

    if (statusCode.isSuccessful(response.status)) {
      const json = await response.json();
      const utkastId = json.id;
      toast({ title: "Utkast opprettet", status: "success" });
      navigate(`../utkast/${utkastId}`);
    } else if (statusCode.isError(response.status)) {
      const wrapper = (await response.json()) as ApiErrorResponse;
      setError({
        ...wrapper.errorDescription,
        errorCode: wrapper.errorCode,
      });
    }
  };

  const openVisningsmodusPaaUtkastGyldigFra = (gyldigFra: string) => {
    navigate(`../kart/${format(new Date(gyldigFra), "yyyy-MM-dd")}`);
  };

  return (
    <Tr>
      <StyledCell>{utkast.navn}</StyledCell>
      <StyledCell>{utkast.endringstype}</StyledCell>
      <StyledCell>{format(utkast.gyldigFra, "dd.MM.yyyy")}</StyledCell>
      <StyledCell>
        <InndelingerList bulletcolor={inndelingColors.grunnkrets}>
          {endredeGrunnkretser?.map((inndeling) => (
            <li key={inndeling.id.lokalid.value}>{`${inndeling.nummer} ${inndeling.navn}`}</li>
          ))}
        </InndelingerList>
        <InndelingerList bulletcolor={inndelingColors.stemmekrets}>
          {endredeStemmekretser?.map((inndeling) => (
            <li
              key={inndeling.id.lokalid.value}
            >{`(${inndeling.kommunenummer.kodeverdi}) ${inndeling.nummer} ${inndeling.navn}`}</li>
          ))}
        </InndelingerList>
        <InndelingerList bulletcolor={inndelingColors.kommune}>
          {endredeKommuner?.map((inndeling) => (
            <li key={inndeling.id.lokalid.value}>{`${inndeling.nummer} ${getNavnInSpraak(inndeling.navn, "nor")}`}</li>
          ))}
        </InndelingerList>
        <InndelingerList bulletcolor={inndelingColors.fylke}>
          {endredeFylker?.map((inndeling) => (
            <li key={inndeling.id.lokalid.value}>{`${inndeling.nummer} ${inndeling.navn}`}</li>
          ))}
        </InndelingerList>
      </StyledCell>
      <OptionsCell>
        <Menu>
          <MenuButton
            onClick={(e) => e.stopPropagation()}
            as={IconButton}
            aria-label="Utkast alternativer"
            icon="more_horiz"
            variant="ghost"
          />
          <MenuList onClick={(e) => e.stopPropagation()}>
            <MenuItem icon={<Icon icon={"draw"} />} onClick={opprettFeilrettingUtkast}>
              Gjør en feilretting i et nytt utkast
            </MenuItem>
            <MenuItem
              icon={<Icon icon={"travel_explore"} />}
              onClick={() => openVisningsmodusPaaUtkastGyldigFra(utkast.gyldigFra)}
            >
              Åpne visningsmodus på gjeldende dato
            </MenuItem>
          </MenuList>
        </Menu>
      </OptionsCell>
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

const OptionsCell = styled(StyledCell)`
  text-align: right;
`;

const TitleCell = styled(Th)`
  padding: 16px 28px;
  text-transform: unset;
  color: unset;
  font-size: small;
`;

const InndelingerList = styled.ul<{ bulletcolor: string }>`
  list-style-type: disc;
  margin-left: 20px;

  li::marker {
    color: ${(props) => props.bulletcolor};
    font-size: 20px;
  }
`;
