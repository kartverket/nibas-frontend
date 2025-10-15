import { Badge, Card, Heading, Icon, IconButton, Link, Menu, MenuButton, MenuDivider, MenuList } from "@kvib/react";
import AlertModal from "components/Modals/AlertModal";
import { Page, PageContainer } from "components/Page";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { format } from "date-fns";
import { useUtkasts } from "hooks/inndelinger/useUtkasts";
import useMapReset from "hooks/useMapReset";
import LandingHeader from "pages/Landing/LandingHeader";
import PrivacyFooter from "pages/Landing/PrivacyFooter";
import { useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { UtkastResponse } from "types/api";
import { routes } from "utils/routes";
import { Column, HeadlessUtkastTable } from "./HeadlessUtkastTable";
import UtkastEndre from "./UtkastEndre";
import UtkastEndringslogg from "./UtkastEndringslogg";
import UtkastOpprett from "./UtkastOpprett";
import UtkastPubliser from "./UtkastPubliser";
import UtkastSlett from "./UtkastSlett";

const Utkast = () => {
  const { error, setError } = useErrorHandling();
  const { data: utkasts, mutate, isLoading } = useUtkasts();
  const resetMap = useMapReset();
  const navigate = useNavigate();

  useEffect(() => {
    resetMap();
  }, [resetMap]);

  const columns: Column<UtkastResponse>[] = [
    { header: "Navn", renderCell: (utkast) => utkast.navn },
    { header: "Endringstype", renderCell: (utkast) => <Badge colorScheme="blue">{utkast.endringstype}</Badge> },
    {
      header: "Oppdatert",
      renderCell: (utkast) => format(utkast.auditInfoResponse?.oppdateringsdato, "dd.MM.yyyy HH:mm"),
    },
    { header: "Gyldig fra", renderCell: (utkast) => format(utkast.gyldigFra, "dd.MM.yyyy") },
    { header: "", renderCell: (utkast) => <OptionsMenu utkast={utkast} /> },
  ];

  return (
    <PageContainer>
      <LandingHeader />
      <UtkastPage>
        <TitleContainer>
          <ReturnButton to={routes.index}>
            <Icon icon="arrow_back" />
            <span>Tilbake til forsiden</span>
          </ReturnButton>
          <Heading as="h1" size="lg">
            Upubliserte utkast
          </Heading>
          <UtkastOpprett onUtkastCreated={mutate} />
        </TitleContainer>
        <TableContainer>
          <HeadlessUtkastTable
            columns={columns}
            utkasts={utkasts}
            isLoading={isLoading}
            onRowClick={(utkast) => {
              navigate(`${routes.utkast}/${utkast.id}`);
            }}
          />
        </TableContainer>
      </UtkastPage>
      {error && (
        <AlertModal
          status="error"
          title={error.title}
          description={error.description}
          additionalInfo={error.additionalInfo}
          errorCode={error.errorCode}
          isOpen={true}
          onClose={() => setError(null)}
          primaryAction={{
            text: "Lukk",
            onClick: () => setError(null),
          }}
        />
      )}
      <PrivacyFooter />
    </PageContainer>
  );
};

const OptionsMenu = ({ utkast }: { utkast: UtkastResponse }) => {
  return (
    <Menu>
      <MenuButton
        onClick={(e) => e.stopPropagation()}
        as={IconButton}
        aria-label="Utkast alternativer"
        icon="more_horiz"
        variant="secondary"
      />
      <MenuList onClick={(event) => event.stopPropagation()}>
        <UtkastEndre utkast={utkast} />
        <UtkastEndringslogg utkast={utkast} />
        <MenuDivider />
        <UtkastPubliser utkast={utkast} />
        <UtkastSlett utkast={utkast} />
      </MenuList>
    </Menu>
  );
};

const TableContainer = styled(Card)`
  box-shadow: unset;
  overflow-y: scroll;
`;

const UtkastPage = styled(Page)`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "title title"
    "table table";
  justify-items: unset;
  row-gap: 48px;
  padding: 64px 120px;
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

export default Utkast;
