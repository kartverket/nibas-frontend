import { Icon } from "@kvib/react";
import { ReactNode } from "react";
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
  }

  ${(props) =>
    props.$isActive &&
    css`
      font-weight: bold;

      & > .material-symbols-rounded {
        color: var(--kvib-colors-chakra-inverse-text);
        background: var(--kvib-colors-blue-500);
      }
    `};
`;

type Props = {
  icon: string;
  ariaLabel: string;
  isActive?: boolean;
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

const ModeButton = ({
  icon,
  ariaLabel,
  children,
  onClick,
  isActive = false,
  disabled = false,
}: Props) => {
  return (
    <Container
      onClick={onClick}
      aria-label={ariaLabel}
      $isActive={isActive}
      disabled={disabled}
    >
      <Icon icon={icon} />
      {children}
    </Container>
  );
};

export default ModeButton;
