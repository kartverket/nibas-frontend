import Icon from "components/Icon";
import Button from "components/form/Button";
import styled from "styled-components";

const EditButton = styled(Button)``;

const SaveAndDiscard = styled.div`
  display: flex;
  gap: 4px;
`;

const SaveButton = styled(Button)``;

const DiscardButton = styled(Button)``;

type Props = {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
};

const EditAndSaveButton = ({ isEditing, setIsEditing }: Props) => {
  // TODO: håndter submit med react hook form, må sikekrt få inn noen props

  return (
    <td>
      {isEditing ? (
        <EditButton
          aria-label="Åpne redigering"
          onClick={() => setIsEditing(true)}
        >
          Endre detaljer
          <Icon icon="settings" />
        </EditButton>
      ) : (
        <SaveAndDiscard>
          <SaveButton aria-label="Lukk redigering">
            Lagre endringer
            <Icon icon="save" />
          </SaveButton>
          <DiscardButton
            aria-label="Forkast endringer"
            onClick={() => setIsEditing(false)}
          >
            <Icon icon="cross" />
          </DiscardButton>
        </SaveAndDiscard>
      )}
    </td>
  );
};

export default EditAndSaveButton;
