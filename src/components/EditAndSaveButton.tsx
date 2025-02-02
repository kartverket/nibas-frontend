import { styled } from "styled-components";
import { ButtonGroup, Button, Tooltip } from "@kvib/react";
import { TooltipBody } from "pages/Kart/Toolbar/CustomTooltip";

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
  tooltip?: string | null;
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
  tooltip,
}: Props) => {
  const renderButton = () =>
    isEditing ? (
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
    );

  return (
    <Container className={className}>
      {tooltip != null ? <Tooltip label={<TooltipBody text={tooltip} />}>{renderButton()}</Tooltip> : renderButton()}
    </Container>
  );
};

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
