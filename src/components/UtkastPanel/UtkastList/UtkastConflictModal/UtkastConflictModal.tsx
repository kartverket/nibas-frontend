import Checkbox from "components/Checkbox";
import Button from "components/form/Button";
import { ButtonCell } from "components/Kart/OverlayPanels/KretsTable";
import Modal, {
  CustomModalWrapper,
  ModalOverlay,
} from "components/Modal/Modal";
import Heading from "components/typography/Heading";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

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
  const { t } = useTranslation();

  return (
    <Modal
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
        {t("utkast.Konflikt mellom fremtidige endringer")}
      </Heading>
      <div id="conflict-modal-description">
        <p>
          {t(
            "utkast.Endringer du gjorde i dette utkastet har ført til at en annen publisert endring må dobbelsjekkes"
          )}
          .
        </p>
        <p>
          {t(
            "utkast.Dobbeltsjekk feltene i endringen nedenfor før du publiserer"
          )}
          .
        </p>
      </div>
      <Heading tag="h3" size="xs">
        {t("utkast.Endringer i dette utkastet")}
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
      <Heading tag="h3" size="xs">
        {t("utkast.Fremtidig endring i konflikt")}
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
          {t("action.Avbryt")}
        </Button>
        <Button onClick={submit} disabled={!submit}>
          {t("action.Publiser")}
        </Button>
      </Buttons>
    </Modal>
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
