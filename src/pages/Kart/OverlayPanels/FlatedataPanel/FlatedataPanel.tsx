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
import { ModalPanel, PanelHeader, PanelProps } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import KretsTable from "./KretsTable";
import { Inndeling, pluralizeInndelingtype, useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { getNavnInSpraak } from "utils/language/language";
import { capitalize } from "utils/string-utils";

const FlatedataPanel = ({ isOpen }: PanelProps) => {
  const { closeOverlayModal } = useOverlayPanel();
  const { inndelinger } = useInndelinger();

  const allInndelinger = Object.values(inndelinger)
    .flatMap((inndelingerMap) => [...inndelingerMap.values()])
    .toSorted((a, b) => (a.isEditing === b.isEditing ? 0 : a.isEditing ? -1 : 1));

  const getTabText = (inndeling: Inndeling) => {
    const nameAndNumber = inndeling.nummer + " " + getNavnInSpraak(inndeling.navn, "nor");
    const inndelingIsUnique = !allInndelinger.some(
      (i) => i.id === inndeling.id && i.inndelingtype !== inndeling.inndelingtype,
    );
    const inndelingType = !inndelingIsUnique ? ` (${capitalize(pluralizeInndelingtype(inndeling.inndelingtype))})` : "";
    const isEditable = inndeling.isEditing ? " (Kan redigeres)" : "";
    return nameAndNumber + inndelingType + isEditable;
  };

  return (
    <Modal isOpen={isOpen} onClose={closeOverlayModal} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as={FlatedataPanelContent} $isOpen={isOpen}>
        <FlatedataPanelHeader onClose={closeOverlayModal}>
          <span>Flateinformasjon</span>
          <SearchInput>
            <InputLeftElement>
              <Icon icon="search" />
            </InputLeftElement>
            <Input placeholder="TODO" />
          </SearchInput>
        </FlatedataPanelHeader>
        <FlatedataTabs size="md">
          <FlatedataTabList>
            {allInndelinger.map((inndeling) => (
              <FlatedataTab key={inndeling.id + inndeling.inndelingtype}>{getTabText(inndeling)}</FlatedataTab>
            ))}
          </FlatedataTabList>
          <FlatedataTabPanels>
            {allInndelinger.map((inndeling) => (
              <KretsTable key={inndeling.id + inndeling.inndelingtype} inndeling={inndeling} />
            ))}
          </FlatedataTabPanels>
        </FlatedataTabs>
      </ModalContent>
    </Modal>
  );
};

const SearchInput = styled(InputGroup)`
  max-width: 300px;
`;

const FlatedataPanelContent = styled(ModalPanel)`
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
`;

const FlatedataPanelHeader = styled(PanelHeader)`
  border: none;
  margin-bottom: 8px;
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
  padding: 0 24px;

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
