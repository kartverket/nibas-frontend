import Icon from "components/Icon";
import Button from "components/form/Button";
import styled from "styled-components";

const EditButton = styled(Button)`
  width: 100%;
  white-space: nowrap;
`;

const SaveAndDiscard = styled.div`
  display: flex;
`;

const SaveButton = styled(Button)`
  width: 100%;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
`;

const DiscardButton = styled(Button)`
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
`;

type Props = {
  isEditing: boolean;
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  toggleEditing: () => void;
};

const EditAndSaveButton = ({ isEditing, toggleEditing, onSubmit }: Props) => (
  <td>
    {isEditing ? (
      <SaveAndDiscard>
        <SaveButton
          aria-label="Lagre endringer"
          onClick={onSubmit}
          icon={<Icon icon="save" />}
        >
          Lagre
        </SaveButton>
        <DiscardButton aria-label="Forkast endringer" onClick={toggleEditing}>
          <Icon icon="close" />
        </DiscardButton>
      </SaveAndDiscard>
    ) : (
      <EditButton
        aria-label="Åpne redigering"
        onClick={toggleEditing}
        icon={<Icon icon="settings" />}
      >
        Endre detaljer
      </EditButton>
    )}
  </td>
);

export default EditAndSaveButton;
