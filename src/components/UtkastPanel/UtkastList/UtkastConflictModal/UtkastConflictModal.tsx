import { Button, Heading } from "@kvib/react";
import Checkbox from "components/Checkbox";
import { ButtonCell } from "components/Kart/OverlayPanels/Flatedata/KretsTable";
import { Modal, ModalContent } from "components/Modal";
import { styled } from "styled-components";

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
  <Modal
    isOpen
    modalElement={ModalElement}
    aria={{
      labelledby: "conflict-modal-header",
      describedby: "conflict-modal-description",
    }}
  >
    <Heading as="h2" size="md" id="conflict-modal-header">
      Konflikt mellom fremtidige endringer
    </Heading>
    <div id="conflict-modal-description">
      <p>
        Endringer du gjorde i dette utkastet har ført til at en annen publisert
        endring må dobbelsjekkes.
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

    <Buttons>
      <Button variant="outline" onClick={onCancel}>
        Avbryt
      </Button>
      <Button onClick={submit} isDisabled={!submit}>
        Publiser
      </Button>
    </Buttons>
  </Modal>
);

const ModalElement = styled(ModalContent)`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid var(--blue);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: var(--white);
  min-width: 900px;
  max-width: 1500px;
  padding: 40px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  button {
    margin-left: 8px;
  }
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
    props.confirmed ? "var(--green_light)" : "transparent"};
  transition: background-color 0.2s ease-in-out;

  td {
    padding: 16px 8px;
    border-bottom: 1px solid var(--gray_light);
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
