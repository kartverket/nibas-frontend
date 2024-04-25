import { styled } from "styled-components";
import {
  Badge,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalContent,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@kvib/react";
import { ModalPanel, PanelHeader, PanelProps } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import KretsTable from "./KretsTable";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { getNavnInSpraak } from "utils/language/language";

const FlatedataPanel = ({ isOpen }: PanelProps) => {
  const { closeOverlayModal } = useOverlayPanel();
  const { inndelinger } = useInndelinger();

  const allInndelinger = Object.values(inndelinger)
    .flatMap((inndelingerMap) => [...inndelingerMap.values()])
    .toSorted((a, b) => (a.isEditing === b.isEditing ? 0 : a.isEditing ? -1 : 1));

  return (
    <Modal isOpen={isOpen} onClose={closeOverlayModal} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as={ModalPanel} $isOpen={isOpen}>
        <PanelHeader onClose={closeOverlayModal}>
          <span>Flateinformasjon</span>
          <SearchInput>
            <InputLeftElement>
              <Icon icon="search" />
            </InputLeftElement>
            <Input placeholder="TODO" />
          </SearchInput>
        </PanelHeader>
        {allInndelinger.length > 0 ? (
          <Tabs size="md">
            <TabList>
              {allInndelinger.map((inndeling) => (
                <Tab key={inndeling.id + inndeling.inndelingtype}>
                  {`${inndeling.nummer} ${getNavnInSpraak(inndeling.navn, "nor")}`}
                  {inndeling.isEditing && <EditBadge colorScheme="blue">Kan redigeres</EditBadge>}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {allInndelinger.map((inndeling) => (
                <TabPanel key={inndeling.id + inndeling.inndelingtype}>
                  <KretsTable inndeling={inndeling} />
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        ) : (
          <p>TODO empty state</p>
        )}
      </ModalContent>
    </Modal>
  );
};

const SearchInput = styled(InputGroup)`
  max-width: 300px;
`;

const EditBadge = styled(Badge)`
  margin-left: 4px;
`;

export default FlatedataPanel;
