import {
  Button,
  ButtonGroup,
  Checkbox,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@kvib/react";
import { ButtonCell } from "components/Kart/OverlayPanels/Flatedata/KretsTable";
import styled from "styled-components";

type Props = {
  currentRow: string[];
  columns: string[];
  onCancel: () => void;
  submit?: () => void;
  children?: React.ReactNode;
};

const UtkastConflictModal = ({
  currentRow,
  onCancel,
  submit,
  columns,
  children,
}: Props) => (
  <Modal isOpen onClose={onCancel} isCentered>
    <ModalOverlay />
    <ModalElement>
      <ModalHeader>Konflikt mellom fremtidige endringer</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <div id="conflict-modal-description">
          <p>
            Endringer du gjorde i dette utkastet har ført til at en annen
            publisert endring må dobbelsjekkes.
          </p>
          <p>Dobbeltsjekk feltene i endringen nedenfor før du publiserer.</p>
        </div>
        <Heading as="h3" size="sm">
          Endringer i dette utkastet
        </Heading>
        <Table cellSpacing={0}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
              <th>{/* Bekreft-knapp */}</th>
            </tr>
          </thead>
          <tbody>
            <ConflictTableRow numColumns={currentRow.length}>
              {currentRow.map((row, i) => (
                <td key={i}>{row}</td>
              ))}
              <ButtonCell>
                <HiddenCheckbox type="checkbox" label="Bekreft" />
              </ButtonCell>
            </ConflictTableRow>
          </tbody>
        </Table>
        <Heading as="h3" size="sm">
          Fremtidig endring i konflikt
        </Heading>
        <Table cellSpacing={0}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
              <th>{/* Bekreft-knapp */}</th>
            </tr>
          </thead>
          {children}
        </Table>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button variant="outline" onClick={onCancel}>
            Avbryt
          </Button>
          <Button onClick={submit} isDisabled={!submit}>
            Publiser
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </ModalElement>
  </Modal>
);

const ModalElement = styled(ModalContent)`
  min-width: 900px;
  max-width: 1500px;
  padding: 40px;
`;

const Table = styled.table`
  width: 100%;

  th {
    text-align: left;
    padding: 8px;
  }
`;

export const ConflictTableRow = styled.tr<{
  confirmed?: boolean;
  numColumns?: number;
}>`
  background-color: ${(props) =>
    props.confirmed ? "var(--kvib-colors-green-100)" : "transparent"};
  transition: background-color 0.2s ease-in-out;

  td {
    padding: 16px 8px;
    border-bottom: 1px solid var(--kvib-colors-gray-50);
    // de blir ikke faktisk like store, men de blir like store på tvers av tabeller og det ser nice ut 🤷‍♀️
    width: calc(100% / ${(props) => props.numColumns || 1});
    min-width: calc(100% / ${(props) => props.numColumns || 1});
    max-width: calc(100% / ${(props) => props.numColumns || 1});

    > input {
      width: 100%;
    }
  }

  label {
    margin-bottom: 0;
    margin-right: 0;
  }
`;

const HiddenCheckbox = styled(Checkbox)`
  visibility: hidden;
`;

export default UtkastConflictModal;
