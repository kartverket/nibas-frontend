import { styled } from "styled-components";
import { ButtonGroup, IconButton, Button } from "@kvib/react";

type Props = {
  isEditing: boolean;
  canSave?: boolean;
  toggleEditing: () => void;
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const EditAndSaveButton = ({ isEditing, toggleEditing, canSave = true, onSubmit }: Props) => (
  <Container>
    {isEditing ? (
      <CombinedButton>
        <IconButton aria-label="Lagre endringer" onClick={onSubmit} icon="check" isDisabled={!canSave} />
        <IconButton variant="ghost" aria-label="Forkast endringer" onClick={toggleEditing} icon="close" />
      </CombinedButton>
    ) : (
      <EditButton rightIcon="edit_note" onClick={toggleEditing}>
        Rediger flatedetaljer
      </EditButton>
    )}
  </Container>
);

const Container = styled.div`
  display: flex;
  justify-content: end;
  padding: 16px;
  border-top: 1px solid var(--kvib-colors-chakra-border-color);
`;

const EditButton = styled(Button)`
  white-space: nowrap;
  min-width: unset;
`;

const CombinedButton = styled(ButtonGroup)`
  gap: 3px;
`;

export default EditAndSaveButton;
