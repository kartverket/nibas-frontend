import {
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalContent,
  ModalOverlay,
  Tab,
  TabList,
  TabPanels,
  Tabs,
} from "@kvib/react";
import { useConfirmationModal } from "contexts/ConfirmationModalContext";
import { InndelingOfType, useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import useSearch from "hooks/useSearch";
import { useState } from "react";
import { styled } from "styled-components";
import { INNDELINGTYPE_VALUES } from "types/api";
import { pluralizeInndelingtype } from "utils/inndelinger-utils";
import { getNavnInSpraak } from "utils/language/language";
import { getInndelingtypeLabel } from "utils/inndelinger-utils";
import { ModalPanel, PanelHeader } from "../Panel";
import FlatedataTable from "./FlatedataTable";

export const FLATEDATA_TABLE_INNDELINGTYPE_VALUES = INNDELINGTYPE_VALUES.filter(
  (type) =>
    type === "FYLKE" ||
    type === "KOMMUNE" ||
    type === "STEMMEKRETS" ||
    type === "GRUNNKRETS" ||
    type === "BOPLIKTOMRAADE",
);
export type FlatedataTableInndelingtype = (typeof FLATEDATA_TABLE_INNDELINGTYPE_VALUES)[number];
export type FlatedataTableInndeling = InndelingOfType<FlatedataTableInndelingtype>;

const getTabText = (inndeling: FlatedataTableInndeling, allInndelinger: FlatedataTableInndeling[]) => {
  const nameAndNumber = inndeling.nummer + " " + getNavnInSpraak(inndeling.navn, "nor");
  const inndelingIsUnique = !allInndelinger.some(
    (i) => i.id === inndeling.id && i.inndelingtype !== inndeling.inndelingtype,
  );
  const inndelingType = !inndelingIsUnique
    ? ` (${getInndelingtypeLabel(inndeling.inndelingtype, { pluralizeLabel: false, capitalizeLabel: false })})`
    : "";
  return nameAndNumber + inndelingType;
};

const FlatedataPanel = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const { inputValue, searchValue, setInputValue, clearSearch } = useSearch();

  const { closeOverlayModal } = useOverlayPanel();
  const { getInndelingerOfType } = useInndelinger();
  const { open } = useConfirmationModal();

  const allInndelinger = FLATEDATA_TABLE_INNDELINGTYPE_VALUES.flatMap((type) =>
    getInndelingerOfType(type).filter((inndeling) => inndeling.isViewing === true || inndeling.isEditing === true),
  ).toSorted((a, b) => (a.isEditing === b.isEditing ? 0 : a.isEditing === true ? -1 : 1));

  // Dersom brukeren lukker panelet med ulagrede endringer ønsker vi en bekreftelse
  const handleDraft = (callback: () => void) => {
    if (isEditing) {
      open({
        title: "Du har ulagrede endringer",
        description:
          "Hvis du går ut av flateinformasjon uten å fullføre redigeringen vil du miste endringene du har gjort.",
        declineText: "Gå tilbake til redigering",
        acceptText: "Forkast endringene",
        onAccept: callback,
      });
    } else {
      callback();
    }
  };

  const handleTabsChange = (index: number) => {
    handleDraft(() => {
      setTabIndex(index);
      setIsEditing(false);
      clearSearch();
    });
  };

  const handleCloseModal = () => {
    handleDraft(() => {
      closeOverlayModal();
      setIsEditing(false);
      setTabIndex(0);
      clearSearch();
    });
  };

  return (
    <Modal isOpen={true} onClose={handleCloseModal} scrollBehavior="inside">
      <ModalOverlay onClick={handleCloseModal} />
      <ModalContent as={FlatedataPanelContent}>
        <FlatedataPanelHeader onClose={handleCloseModal}>
          <span>Flateinformasjon</span>
          <SearchInput>
            <InputLeftElement>
              <Icon icon="search" />
            </InputLeftElement>
            <Input
              value={inputValue}
              placeholder="Søk etter navn eller nummer"
              onChange={(e) => setInputValue(e.currentTarget.value)}
            />
          </SearchInput>
        </FlatedataPanelHeader>
        <FlatedataTabs size="md" index={tabIndex} onChange={handleTabsChange}>
          <FlatedataTabList>
            {allInndelinger.map((inndeling) => (
              <FlatedataTab key={inndeling.id + inndeling.inndelingtype}>
                {getTabText(inndeling, allInndelinger)}
                {inndeling.isEditing === true ? (
                  <Icon icon="edit_document" aria-hidden />
                ) : (
                  <Icon icon="visibility" aria-hidden />
                )}
              </FlatedataTab>
            ))}
          </FlatedataTabList>
          <FlatedataTabPanels>
            {allInndelinger.map((inndeling) => (
              <FlatedataTable
                key={inndeling.id + inndeling.inndelingtype}
                mainInndeling={inndeling}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                searchValue={searchValue}
                clearSearch={clearSearch}
              />
            ))}
          </FlatedataTabPanels>
        </FlatedataTabs>
      </ModalContent>
    </Modal>
  );
};

const FlatedataPanelContent = styled(ModalPanel)`
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
`;

const FlatedataPanelHeader = styled(PanelHeader)`
  border: none;
  margin-bottom: 8px;
`;

const SearchInput = styled(InputGroup)`
  max-width: 300px;
`;

const FlatedataTabs = styled(Tabs)`
  display: grid;
  grid-template-rows: auto 1fr;
  width: calc(100% + var(--panel-padding) * 2);
  margin: 0 calc(var(--panel-padding) * -1);
  overflow: hidden;
`;

const FlatedataTabList = styled(TabList)`
  position: relative;
  overflow-x: auto;
  border-bottom: none;
  box-shadow: inset 0 -2px var(--kvib-colors-chakra-border-color);
  padding-left: 16px;

  ::after {
    content: "";
    position: sticky;
    top: 0;
    right: 0;
    padding: 0 24px;
    margin-bottom: 2px;
    background: linear-gradient(to right, transparent, white);
  }
`;

const FlatedataTabPanels = styled(TabPanels)`
  height: 100%;
  overflow: hidden;
`;

const FlatedataTab = styled(Tab)`
  white-space: nowrap;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export default FlatedataPanel;
