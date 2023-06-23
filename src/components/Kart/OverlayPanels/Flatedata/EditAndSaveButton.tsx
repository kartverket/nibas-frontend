import Icon from "components/Icon";
import { styled } from "styled-components";
import { ButtonGroup, Button, IconButton } from "@kvib/react";

const EditButton = styled(Button)`
  white-space: nowrap;
`;

type Props = {
  isEditing: boolean;
  canSave: boolean;
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  toggleEditing: () => void;
};

const EditAndSaveButton = ({
  isEditing,
  toggleEditing,
  canSave,
  onSubmit,
}: Props) => (
  <td>
    {isEditing ? (
      <ButtonGroup isAttached={true} size="md">
        <Button
          aria-label="Lagre endringer"
          onClick={onSubmit}
          leftIcon={<Icon icon="edit" />}
          isDisabled={!canSave}
        >
          Endre
        </Button>
        <IconButton
          variant="outline"
          aria-label="Forkast endringer"
          onClick={toggleEditing}
          icon={<Icon icon="close" />}
        />
      </ButtonGroup>
    ) : (
      <EditButton
        size="md"
        aria-label="Åpne redigering"
        onClick={toggleEditing}
        leftIcon={<Icon icon="settings" />}
      >
        Endre detaljer
      </EditButton>
    )}
  </td>
);

export default EditAndSaveButton;
