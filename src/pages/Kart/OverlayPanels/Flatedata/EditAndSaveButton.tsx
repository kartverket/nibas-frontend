import { styled } from "styled-components";
import { ButtonGroup, IconButton, Button } from "@kvib/react";

const Container = styled.div`
  display: flex;
  justify-content: end;
`;

const EditButton = styled(Button)`
  white-space: nowrap;
  min-width: unset;
`;

const CombinedButton = styled(ButtonGroup)`
  gap: 3px;
`;

type Props = {
  className?: string;
  isEditing: boolean;
  isDisabled?: boolean;
  canSave: boolean;
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  toggleEditing: () => void;
};

const EditAndSaveButton = ({
  className,
  isEditing,
  isDisabled,
  toggleEditing,
  canSave,
  onSubmit,
}: Props) => (
  <Container className={className}>
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
        variant="secondary"
        colorScheme="gray"
      >
        Rediger
      </EditButton>
    )}
  </Container>
);

export default EditAndSaveButton;
