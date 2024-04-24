import { styled } from "styled-components";
import { Icon, Input, InputGroup, InputLeftElement, Modal, ModalContent, ModalOverlay } from "@kvib/react";
import { ModalPanel, PanelHeader, PanelProps } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";

const FlatedataPanel = ({ isOpen }: PanelProps) => {
  const { closeOverlayModal } = useOverlayPanel();

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
            <Input placeholder="Søk etter navn eller nummer" />
          </SearchInput>
        </PanelHeader>
        <Table>
          <thead>
            <tr>
              <th>Nummer</th>
              <th>Navn</th>
              <th>Merknad</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>lorem</td>
              <td>ipsum</td>
              <td>schmipsum</td>
            </tr>
            <tr>
              <td>lorem</td>
              <td>ipsum</td>
              <td>schmipsum</td>
            </tr>
            <tr>
              <td>lorem</td>
              <td>ipsum</td>
              <td>schmipsum</td>
            </tr>
          </tbody>
        </Table>
      </ModalContent>
    </Modal>
  );
};

const Table = styled.table`
  display: grid;
  grid-template-columns: auto auto 1fr;

  thead,
  tbody,
  tr {
    display: contents;
  }

  th {
    font-weight: normal;
    text-align: left;
  }

  th,
  td {
    padding: 12px 18px;
    border-bottom: 1px solid var(--kvib-colors-chakra-border-color);
  }
`;

const SearchInput = styled(InputGroup)`
  max-width: 300px;
`;

export default FlatedataPanel;
