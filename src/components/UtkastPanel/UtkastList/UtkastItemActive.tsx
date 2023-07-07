import styled from "styled-components";
import { UtkastItemExpanded } from "./UtkastItem";
import useAlertModal from "hooks/useAlertModal";
import { useUtkast } from "contexts/UtkastContext";
import AlertModal from "components/AlertModal";
import { useToolbar } from "contexts/ToolbarContext";
import { Button } from "@kvib/react";

const UtkastItemActive = () => {
  const { closeUtkast, updateUtkastWithHistory } = useUtkast();

  const { modalIsOpen, openModal, closeModal, modalTitle, modalBody } =
    useAlertModal(
      "Du har endringer i utkastet som ikke er lagret",
      "Er du sikker på at du vil gå ut av utkastet? Dersom du lukker utkastet nå mister du alle ulagrede endringer."
    );

  const { canSave } = useToolbar();

  const handleSave = () => {
    if (!canSave) {
      return;
    }
    updateUtkastWithHistory();
  };

  return (
    <UtkastItemExpanded>
      <EditingUtkastText>
        Du er nå i redigeringsmodus av dette utkastet. Alle endringer du gjør i
        inndelingene og kartet vil bli lagret på dette utkastet når du klikker
        på &quot;Lagre&quot;-knappen nederst på skjermen.
      </EditingUtkastText>
      <Buttons>
        <Button variant="ghost" onClick={canSave ? openModal : closeUtkast}>
          Avslutt redigering
        </Button>
        <Button onClick={handleSave}>Lagre</Button>
      </Buttons>
      <AlertModal
        status="warning"
        title={modalTitle}
        description={modalBody}
        isOpen={modalIsOpen}
        onClose={closeModal}
        secondaryAction={{
          text: "Forkast endringer",
          onClick: closeUtkast,
        }}
        primaryAction={{
          text: "Fortsett redigering",
          onClick: closeModal,
        }}
      />
    </UtkastItemExpanded>
  );
};

const EditingUtkastText = styled.p`
  margin: 0;
  margin-bottom: 8px;
  margin-top: 16px;
  font-style: italic;
  font-size: 14px;
  text-align: center;
`;

const Buttons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

export default UtkastItemActive;
