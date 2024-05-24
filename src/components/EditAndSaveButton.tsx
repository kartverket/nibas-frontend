import { styled } from "styled-components";
import { ButtonGroup, Button } from "@kvib/react";

type Props = {
  className?: string;
  isEditing: boolean;
  isDisabled?: boolean;
  canSave?: boolean;
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  toggleEditing: () => void;
  size?: string;
  variant?: "primary" | "secondary";
  hasIcon?: boolean;
  children: React.ReactNode;
};

const EditAndSaveButton = ({
  className,
  children,
  isEditing,
  isDisabled,
  canSave = true,
  variant = "primary",
  hasIcon = false,
  toggleEditing,
  onSubmit,
  size,
}: Props) => (
  <Container className={className}>
    {isEditing ? (
      <CombinedButton>
        <Button variant="tertiary" aria-label="Forkast endringer" onClick={toggleEditing} size={size}>
          Avbryt
        </Button>
        <Button aria-label="Lagre endringer" onClick={onSubmit} isDisabled={!canSave} size={size}>
          Bekreft
        </Button>
      </CombinedButton>
    ) : (
      <EditButton
        aria-label="Åpne redigering"
        onClick={toggleEditing}
        size={size}
        rightIcon={hasIcon ? "edit_note" : undefined}
        variant={variant}
        isDisabled={isDisabled}
      >
        {children}
      </EditButton>
    )}
  </Container>
);

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

export default EditAndSaveButton;
