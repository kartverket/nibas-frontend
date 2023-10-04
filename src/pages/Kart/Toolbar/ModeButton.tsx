import { Icon } from "@kvib/react";
import { MaterialSymbol } from "material-symbols";
import { forwardRef, ReactNode } from "react";
import { styled, css } from "styled-components";

const Container = styled.button<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;

  border: none;
  background: none;
  cursor: pointer;

  .material-symbols-rounded {
    padding: 4px;
    border-radius: 8px;
    transition: background 0.15s, color 0.2s;
  }

  &:disabled {
    color: var(--kvib-colors-gray-500);
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--kvib-colors-blue-500);
    outline-offset: 2px;
  }

  &:hover:not(:disabled) > .material-symbols-rounded {
    background: var(--kvib-colors-blue-50);
    color: var(--kvib-colors-blue-500);
  }

  ${(props) =>
    props.$isActive &&
    css`
      & > .material-symbols-rounded {
        color: var(--kvib-colors-blue-500);
        background: var(--kvib-colors-blue-50);
      }
    `};
`;

type Props = {
  icon: MaterialSymbol;
  ariaLabel: string;
  isActive?: boolean;
  children?: ReactNode;
  onClick?: () => void;
  isDisabled?: boolean;
};

const InnerModeButton = (
  {
    icon,
    ariaLabel,
    children,
    onClick,
    isActive = false,
    isDisabled = false,
  }: Props,
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  return (
    <Container
      onClick={onClick}
      aria-label={ariaLabel}
      $isActive={isActive}
      disabled={isDisabled}
      ref={ref}
    >
      <Icon icon={icon} />
      {children}
    </Container>
  );
};

const ModeButton = forwardRef(InnerModeButton);

export default ModeButton;
