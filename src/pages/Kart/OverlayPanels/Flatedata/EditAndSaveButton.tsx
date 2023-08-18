import { styled } from "styled-components";
import { ButtonGroup, Button, IconButton } from "@kvib/react";

const Cell = styled.td`
  padding: 12px !important;
`;

const CombinedButton = styled(ButtonGroup)`
  width: 100%;
`;

const EditButton = styled(Button)`
  width: 100%;
  white-space: nowrap;
`;

const ChangeButton = styled(Button)`
  width: 100%;
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
  <Cell>
    {isEditing ? (
      <CombinedButton isAttached={true} size="md">
        <ChangeButton
          aria-label="Lagre endringer"
          onClick={onSubmit}
          leftIcon="edit"
          isDisabled={!canSave}
        >
          Endre
        </ChangeButton>
        <IconButton
          variant="outline"
          aria-label="Forkast endringer"
          onClick={toggleEditing}
          icon="close"
        />
      </CombinedButton>
    ) : (
      <EditButton
        size="md"
        aria-label="Åpne redigering"
        onClick={toggleEditing}
        leftIcon="settings"
      >
        Endre detaljer
      </EditButton>
    )}
  </Cell>
);

export default EditAndSaveButton;
