import Icon from "components/Icon";
import { ReactNode } from "react";
import styled, { css } from "styled-components";

const Container = styled.button<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;

  border: none;
  background: none;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--blue_dark);
    outline-offset: 2px;
  }

  & > ${Icon} {
    padding: 4px;
    border-radius: 8px;
    margin-bottom: 4px;
    transition: background 0.15s, color 0.2s;
  }

  &:hover > ${Icon} {
    background: var(--blue_light);
    color: var(--black);
  }

  ${(props) =>
    props.isActive &&
    css`
      font-weight: bold;

      & > ${Icon} {
        color: var(--white);
        background: var(--blue_dark);
      }
    `};
`;

type Props = {
  icon: string;
  ariaLabel: string;
  isActive?: boolean;
  children: ReactNode;
  onClick?: () => void;
};

const ModeButton = ({
  icon,
  ariaLabel,
  children,
  onClick,
  isActive = false,
}: Props) => {
  return (
    <Container onClick={onClick} aria-label={ariaLabel} isActive={isActive}>
      <Icon icon={icon} />
      {children}
    </Container>
  );
};

export default ModeButton;
