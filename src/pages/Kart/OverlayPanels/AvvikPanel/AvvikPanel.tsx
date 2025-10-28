import { Fragment, ReactNode, useState } from "react";
import { PanelHeader, SidePanel } from "../Panel";
import { useOverlayPanel } from "../../../../contexts/OverlayPanelContext";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertProps,
  AlertTitle,
  Divider,
  IconButton,
  Spinner,
  Tab,
  TabList,
  TabPanels,
  Tabs,
  Text,
} from "@kvib/react";
import AvvikRow from "./AvvikRow";
import AvvikRowKommuner from "./AvvikRowKommuner";
import { AvvikStatus } from "./avvik-utils";
import { useAvvikPanel } from "./useAvvikPanel";
import { styled } from "styled-components";

export const AvvikPanel = () => {
  const { avvikPanelProps, avvikRowKommunerProps, avvikRowProps } = useAvvikPanel();
  const { closeOverlayPanel } = useOverlayPanel();
  const [tabIndex, setTabIndex] = useState(0);
  const tabList = [
    { label: "Uløst", value: AvvikStatus.NY },
    { label: "Utsatt", value: AvvikStatus.VENT },
    { label: "Løst", value: AvvikStatus.FIKSET },
  ];

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };
  const getAvvikCountByStatus = (status: AvvikStatus): number => {
    return avvikData?.filter((row) => row.status === status).length ?? 0;
  };
  const handleBackButton = () => {
    setTabIndex(0);
    resetAvvikPanel();
  };
  const selectedKommuner = avvikPanelProps.selectedKommuner;
  const isLoadingAvvik = avvikPanelProps.isLoadingAvvik;
  const avvikData = avvikPanelProps.avvikData;
  const isLoadingKommuneParMedAvvik = avvikPanelProps.isLoadingKommuneParMedAvvik;
  const kommuneParMedAvvikData = avvikPanelProps.kommuneParMedAvvikData;
  const pagination = avvikPanelProps.pagination;
  const currentPage = avvikPanelProps.currentPage;
  const setCurrentPage = avvikPanelProps.setCurrentPage;
  const resetAvvikPanel = avvikPanelProps.resetAvvikPanel;
  const avvikByCurrentTab =
    avvikData?.filter((row) => row.status.toLowerCase() === tabList[tabIndex].value.toLowerCase()) ?? [];

  return (
    <SidePanel>
      {selectedKommuner?.length === 2 ? (
        <>
          <AvvikPanelHeader onClose={closeOverlayPanel}>
            <IconButton aria-label="Tilbake" icon="arrow_back" onClick={() => handleBackButton()}></IconButton>
            <Text width={"100%"} fontSize={"lg"} padding={"12px"} gap={"var(--kvib-spacing-12)"}>
              Avvik mellom {selectedKommuner[0].nummer + " " + selectedKommuner[0].navn[0].navn} og{" "}
              {selectedKommuner[1].nummer + " " + selectedKommuner[1].navn[0].navn}
            </Text>
          </AvvikPanelHeader>
          {isLoadingAvvik === true ? (
            <AvvikSpinnerContainer>
              <Spinner thickness="2px" emptyColor="gray.200" color="blue.500" size="xl" />
            </AvvikSpinnerContainer>
          ) : avvikData != null && avvikData.length > 0 ? (
            <AvvikTabs size="md" index={tabIndex} onChange={handleTabsChange}>
              <AvvikTabList>
                {tabList.map((tab) => (
                  <AvvikTab key={tab.value}>
                    {tab.label} ({getAvvikCountByStatus(tab.value)})
                  </AvvikTab>
                ))}
              </AvvikTabList>
              <AvvikTabPanels>
                {avvikByCurrentTab.length > 0 ? (
                  avvikByCurrentTab.map((row) => (
                    <Fragment key={row.id}>
                      <AvvikRow avvikItem={row} {...avvikRowProps} />
                      <Divider />
                    </Fragment>
                  ))
                ) : tabList[tabIndex].value === AvvikStatus.NY ? (
                  <NoUlostAvvikAlert />
                ) : tabList[tabIndex].value === AvvikStatus.VENT ? (
                  <NoUtsattAvvikAlert />
                ) : (
                  <NoLostAvvikAlert />
                )}
              </AvvikTabPanels>
            </AvvikTabs>
          ) : (
            <NoAvvikAlert
              status="info"
              title="Ingen avvik funnet"
              body="Det ble ikke funnet noen avvik på kommune- eller fylkesgrenser mellom NIBAS og Matrikkelen. Hvis du mener det skulle vært avvik, vennligst kontakt Kartverket."
            />
          )}
        </>
      ) : (
        <AvvikMainContainer>
          <AvvikPanelHeader onClose={closeOverlayPanel}>Avvik fra matrikkelen</AvvikPanelHeader>
          <AvvikContentContainer>
            {isLoadingKommuneParMedAvvik === true ? (
              <AvvikSpinnerContainer>
                <Spinner thickness="2px" emptyColor="gray.200" color="blue.500" size="xl" />
              </AvvikSpinnerContainer>
            ) : (
              kommuneParMedAvvikData.map((row, i) => (
                <Fragment key={(row.kommune1.kommunenummer ?? "") + (row.kommune2.kommunenummer ?? "")}>
                  <AvvikRowKommuner
                    kommuneParMedAvvikItem={row}
                    handleGotoKommunePar={avvikRowKommunerProps.handleGotoKommunePar}
                  />
                  {i !== kommuneParMedAvvikData.length - 1 && <Divider />}
                </Fragment>
              ))
            )}
          </AvvikContentContainer>
          {pagination !== undefined && pagination !== null && kommuneParMedAvvikData.length > 0 ? (
            <PaginationContainer>
              <PaginationButton disabled={pagination.first} onClick={() => setCurrentPage(currentPage - 1)}>
                Forrige
              </PaginationButton>
              <PaginationSpan>
                Side {(pagination.number ?? 0) + 1} av {pagination.totalPages}
              </PaginationSpan>
              <PaginationButton disabled={pagination.last} onClick={() => setCurrentPage(currentPage + 1)}>
                Neste
              </PaginationButton>
            </PaginationContainer>
          ) : (
            <NoAvvikAlert
              status="info"
              title="Ingen avvik funnet"
              body="Det ble ikke funnet noen avvik på kommune- eller fylkesgrenser mellom NIBAS og Matrikkelen. Hvis du mener det skulle vært avvik, vennligst kontakt Kartverket."
            />
          )}
        </AvvikMainContainer>
      )}
    </SidePanel>
  );
};

const NoAvvikAlert = ({ status, title, body }: { status: AlertProps["status"]; title: string; body: ReactNode }) => {
  return (
    <StyledAlert status={status}>
      <AlertIcon />
      <AlertDescription>
        <AlertTitle>{title}</AlertTitle>
        {body}
      </AlertDescription>
    </StyledAlert>
  );
};

const NoUlostAvvikAlert = () => (
  <NoAvvikAlert
    status="success"
    title="Ingen uløste avvik"
    body="Du har håndtert alle avvike mellom disse kommunene."
  />
);

const NoUtsattAvvikAlert = () => (
  <NoAvvikAlert
    status="info"
    title="Ingen utsatt avvik"
    body="Du kan utsette uløste avvik hvis du vil håndtere de senere."
  />
);

const NoLostAvvikAlert = () => (
  <NoAvvikAlert
    status="info"
    title="Ingen løste avvik"
    body="Du har ikke løst noen av avvikene mellom disse kommunene. Når du markerer avvik som løst vil du kunne se de her."
  />
);

const AvvikPanelHeader = styled(PanelHeader)`
  border: none;
  margin-bottom: 8px;
`;
export const PaginationButton = styled.button`
  font-weight: var(--kvib-fontWeights-normal);
  font-size: var(--kvib-fontSizes-md);
  border-radius: var(--kvib-radii-md);
  padding: var(--kvib-space-2) var(--kvib-space-4);

  &:hover {
    background-color: var(--kvib-colors-gray-200);
    color: var(--kvib-colors-blue-500);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationSpan = styled.span`
  font-size: var(--kvib-fontSizes-sm);
  padding: var(--kvib-space-1);
`;
const AvvikMainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const AvvikContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: var(--kvib-space-4);
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: var(--kvib-space-4);
  gap: var(--kvib-spacing-12);
  border-top: 1px solid var(--kvib-colors-gray-100);
  background: white;
  flex-shrink: 0;
`;

const AvvikSpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const AvvikTabs = styled(Tabs)`
  display: grid;
  grid-template-rows: auto 1fr;
  width: calc(100%);
  overflow: hidden;
`;

const AvvikTabList = styled(TabList)`
  position: relative;
  overflow-x: auto;
  border-bottom: none;
  box-shadow: inset 0 -2px var(--kvib-colors-chakra-border-color);
  padding-left: 16px;

  &::after {
    content: "";
    position: sticky;
    top: 0;
    right: 0;
    margin-bottom: 2px;
    background: linear-gradient(to right, transparent, white);
  }
`;

const AvvikTabPanels = styled(TabPanels)`
  height: 100%;
  overflow: hidden;
`;

const AvvikTab = styled(Tab)`
  white-space: nowrap;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
`;

const StyledAlert = styled(Alert)`
  margin-top: 12px;
  border-radius: 8px;
`;
