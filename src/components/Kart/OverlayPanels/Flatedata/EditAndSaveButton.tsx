import Icon from "components/Icon";
import styled from "styled-components";
import { ButtonGroup, Button } from "@kvib/react";

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
      <ButtonGroup isAttached={true} colorScheme="blue" size="md">
        <Button
          colorScheme="blue"
          aria-label="Lagre endringer"
          onClick={onSubmit}
          leftIcon={<Icon icon="edit" />}
          disabled={!canSave}
        >
          Endre
        </Button>
        <Button
          variant="outline"
          aria-label="Forkast endringer"
          onClick={toggleEditing}
        >
          <Icon icon="close" />
        </Button>
      </ButtonGroup>
    ) : (
      <EditButton
        size="md"
        colorScheme="blue"
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
