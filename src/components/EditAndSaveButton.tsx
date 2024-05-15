import { styled } from "styled-components";
import { ButtonGroup, IconButton, Button } from "@kvib/react";

type Props = {
  className?: string;
  isEditing: boolean;
  isDisabled?: boolean;
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
  variant = "primary",
  hasIcon = false,
  toggleEditing,
  onSubmit,
  size,
}: Props) => (
  <Container className={className}>
    {isEditing ? (
      <CombinedButton>
        <IconButton variant="ghost" aria-label="Forkast endringer" onClick={toggleEditing} icon="close" size={size} />
        <IconButton aria-label="Lagre endringer" onClick={onSubmit} icon="check" isDisabled={isDisabled} size={size} />
      </CombinedButton>
    ) : (
      <EditButton
        aria-label="Åpne redigering"
        onClick={toggleEditing}
        size={size}
        rightIcon={hasIcon ? "edit_note" : undefined}
        variant={variant}
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
