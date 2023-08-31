import { styled } from "styled-components";
import { ButtonGroup, Button, IconButton } from "@kvib/react";

const Cell = styled.td`
  display: flex;
  justify-content: end;
  padding: 12px !important;
`;

const EditButton = styled(Button)`
  white-space: nowrap;
  min-width: unset;
`;

const CombinedButton = styled(ButtonGroup)`
  gap: 3px;
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
      <CombinedButton>
        <IconButton
          aria-label="Lagre endringer"
          onClick={onSubmit}
          icon="check"
          isDisabled={!canSave}
        />
        <IconButton
          colorScheme="gray"
          aria-label="Forkast endringer"
          onClick={toggleEditing}
          icon="close"
        />
      </CombinedButton>
    ) : (
      <EditButton
        aria-label="Åpne redigering"
        onClick={toggleEditing}
        iconFill
        variant="secondary"
        colorScheme="gray"
      >
        Rediger
      </EditButton>
    )}
  </Cell>
);

export default EditAndSaveButton;
