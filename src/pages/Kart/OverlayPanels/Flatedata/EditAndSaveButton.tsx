import { styled } from "styled-components";
import { ButtonGroup, IconButton } from "@kvib/react";

const Cell = styled.td`
  display: flex;
  justify-content: end;
  padding: 12px !important;
`;

const EditButton = styled(IconButton)`
  white-space: nowrap;
`;

const CombinedButton = styled(ButtonGroup)`
  gap: 3px;
`;

type Props = {
  isEditing: boolean;
  isDisabled?: boolean;
  canSave: boolean;
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  toggleEditing: () => void;
};

const EditAndSaveButton = ({
  isEditing,
  isDisabled,
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
        isDisabled={isDisabled}
        aria-label="Åpne redigering"
        onClick={toggleEditing}
        icon="edit"
        variant="secondary"
        colorScheme="gray"
      />
    )}
  </Cell>
);

export default EditAndSaveButton;
