import { styled } from "styled-components";
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
import { ModalPanel, PanelHeader } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import FlatedataTable from "./FlatedataTable";
import { Inndeling, pluralizeInndelingtype, useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { getNavnInSpraak } from "utils/language/language";
import { capitalize } from "utils/string-utils";
import { useState } from "react";
import { useConfirmationModal } from "contexts/ConfirmationModalContext";
import useSearch from "hooks/useSearch";
import { useForm } from "react-hook-form";
import { FlatedataInputs } from "./flatedata-utils";

const getTabText = (inndeling: Inndeling, allInndelinger: Inndeling[]) => {
  const nameAndNumber = inndeling.nummer + " " + getNavnInSpraak(inndeling.navn, "nor");
  const inndelingIsUnique = !allInndelinger.some(
    (i) => i.id === inndeling.id && i.inndelingtype !== inndeling.inndelingtype,
  );
  const inndelingType = !inndelingIsUnique ? ` (${capitalize(pluralizeInndelingtype(inndeling.inndelingtype))})` : "";
  const isEditable = inndeling.isEditing ? " (Kan redigeres)" : "";
  return nameAndNumber + inndelingType + isEditable;
};

const FlatedataPanel = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const { inputValue, searchValue, setInputValue, clearSearch } = useSearch();

  const { closeOverlayModal } = useOverlayPanel();
  const { inndelinger } = useInndelinger();
  const { open } = useConfirmationModal();

  const allInndelinger = Object.values(inndelinger)
    .flatMap((inndelingerMap) => [...inndelingerMap.values()])
    .filter((inndeling) => inndeling.isVisible || inndeling.isEditing)
    .toSorted((a, b) => (a.isEditing === b.isEditing ? 0 : a.isEditing ? -1 : 1));

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

  &::after {
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
`;

export default FlatedataPanel;
