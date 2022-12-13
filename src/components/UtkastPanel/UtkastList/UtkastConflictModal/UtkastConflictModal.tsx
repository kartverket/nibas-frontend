import Checkbox from "components/Checkbox";
import { CustomModalWrapper, ModalOverlay } from "components/Feedback/Feedback";
import Button from "components/form/Button";
import { ButtonCell } from "components/Kart/OverlayPanels/KretsTable";
import Heading from "components/typography/Heading";
import { FC } from "react";
import ReactModal from "react-modal";
import styled from "styled-components";

if (process.env.NODE_ENV !== "test") {
  ReactModal.setAppElement("#root");
}

type Props = {
  currentRow: string[];
  columns: string[];
  onCancel: () => void;
  submit?: () => void;
};

const UtkastConflictModal: FC<Props> = ({
  currentRow,
  onCancel,
  submit,
  columns,
  children,
}) => {
  return (
    <ReactModal
      isOpen
      overlayElement={(props, overlayChildren) => (
        <ModalOverlay {...props}>{overlayChildren}</ModalOverlay>
      )}
      contentElement={(props, contentChildren) => (
        <ModalWrapper {...props}>{contentChildren}</ModalWrapper>
      )}
      aria={{
        labelledby: "conflict-modal-header",
        describedby: "conflict-modal-description",
      }}
      className="_"
      overlayClassName="_"
    >
      <Heading tag="h2" size="xs" id="conflict-modal-header">
        Konflikt mellom fremtidige endringer
      </Heading>
      <div id="conflict-modal-description">
        <p>
          Endringer du gjorde i dette utkastet har ført til at en annen
          publisert endring må dobbelsjekkes.
        </p>
        <p>Dobbeltsjekk feltene i endringen nedenfor før du publiserer.</p>
      </div>
      <Heading tag="h3" size="xs">
        Endringer i dette utkastet
      </Heading>
      <Table>
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
      <Heading tag="h3" size="xs">
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
        <Button variant="secondary" onClick={onCancel}>
          Avbryt
        </Button>
        <Button onClick={submit} disabled={!submit}>
          Publiser
        </Button>
      </Buttons>
    </ReactModal>
  );
};

const ModalWrapper = styled(CustomModalWrapper)`
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

export const ConflictTableRow = styled.tr<{
  confirmed?: boolean;
  numColumns?: number;
}>`
  background-color: ${(props) =>
    props.confirmed ? props.theme.colors.greenLight : "transparent"};
  transition: background-color 0.2s ease-in-out;

  td {
    padding: 16px;
    border-bottom: 1px solid ${(props) => props.theme.colors.grayLight};
    // de blir ikke faktisk 200px, men de blir like på tvers av tabeller 🤷‍♀️
    width: calc(100% / ${(props) => props.numColumns || 1});
    min-width: calc(100% / ${(props) => props.numColumns || 1});
    max-width: calc(100% / ${(props) => props.numColumns || 1});
  }

  label {
    margin-bottom: 0;
    margin-right: 0;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: "fixed";

  th {
    text-align: left;
    padding: 8px 16px;
  }
`;

const HiddenCheckbox = styled(Checkbox)`
  visibility: hidden;
`;

export default UtkastConflictModal;
