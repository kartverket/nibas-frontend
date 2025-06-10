import { Fragment, useState } from "react";
import { PanelHeader, SidePanel } from "../Panel";
import { useOverlayPanel } from "../../../../contexts/OverlayPanelContext";
import { Divider, IconButton, Spinner, Tab, TabList, TabPanels, Tabs, Text } from "@kvib/react";
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
    return avvikData.filter((row) => row.status === status).length;
  };
  const handleBackButton = () => {
    setTabIndex(0);
    resetAvvikPanel();
  };
  const selectedKommune = avvikPanelProps.selectedKommune;
  const isLoadingAvvik = avvikPanelProps.isLoadingAvvik;
  const avvikData = avvikPanelProps.avvikData;
  const isLoadingKommunerMedAvvik = avvikPanelProps.isLoadingKommunerMedAvvik;
  const kommunerMedAvvikData = avvikPanelProps.kommunerMedAvvikData;
  const pagination = avvikPanelProps.pagination;
  const currentPage = avvikPanelProps.currentPage;
  const setCurrentPage = avvikPanelProps.setCurrentPage;
  const resetAvvikPanel = avvikPanelProps.resetAvvikPanel;

  return (
    <SidePanel>
      {/* ========== VISER ENTEN Avvik-liste for valgt kommune ELLER Kommuneliste ========== */}
      {selectedKommune ? (
        // ========== VIS AVVIK for den valgte kommunen ==========
        <>
          <AvvikPanelHeader onClose={closeOverlayPanel}>
            <IconButton aria-label="Tilbake" icon="arrow_back" onClick={() => handleBackButton()}></IconButton>
            <Text width={"100%"} fontSize={"lg"} padding={"12px"} gap={"var(--kvib-spacing-12)"}>
              Avvik for {selectedKommune?.nummer + " " + selectedKommune?.navn[0].navn}
            </Text>
          </AvvikPanelHeader>
          <AvvikTabs size="md" index={tabIndex} onChange={handleTabsChange}>
            <AvvikTabList>
              {tabList.map((tab) => (
                <AvvikTab key={tab.value}>
                  {tab.label} ({getAvvikCountByStatus(tab.value)})
                </AvvikTab>
              ))}
            </AvvikTabList>
            <AvvikTabPanels>
              {isLoadingAvvik ? (
                <AvvikSpinnerContainer>
                  <Spinner thickness="2px" emptyColor="gray.200" color="blue.500" size="xl" />
                </AvvikSpinnerContainer>
              ) : (
                avvikData
                  ?.filter((row) => row.status.toLowerCase() === tabList[tabIndex].value.toLowerCase())
                  .map((row) => (
                    <Fragment key={row.id}>
                      <AvvikRow avvikItem={row} {...avvikRowProps} />
                      <Divider />
                    </Fragment>
                  ))
              )}
            </AvvikTabPanels>
          </AvvikTabs>
        </>
      ) : (
        // ========== VIS KOMMUNER med avvik, første steg ==========
        <>
          <AvvikPanelHeader onClose={closeOverlayPanel}>Avvik fra matrikkelen</AvvikPanelHeader>
          {isLoadingKommunerMedAvvik === true ? (
            <AvvikSpinnerContainer>
              <Spinner thickness="2px" emptyColor="gray.200" color="blue.500" size="xl" />
            </AvvikSpinnerContainer>
          ) : (
            kommunerMedAvvikData.map((row) => (
              <Fragment key={row.kommuneLokalID}>
                <AvvikRowKommuner
                  kommuneMedAvvikItem={row}
                  handleGoToKommuneClick={avvikRowKommunerProps.handleGoToKommuneClick}
                />
                <Divider />
              </Fragment>
            ))
          )}
          {pagination !== undefined && pagination !== null && (
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
          )}
        </>
      )}
    </SidePanel>
  );
};

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
const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: var(--kvib-space-4);
  padding: var(--kvib-space-4);
  gap: var(--kvib-spacing-12);
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
