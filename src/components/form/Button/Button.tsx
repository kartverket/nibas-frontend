import { ButtonHTMLAttributes, forwardRef } from "react";
import styled from "styled-components";

type Size = "xs" | "sm" | "l";

type Variant = "unstyled" | "primary" | "secondary" | "tertiary";

type IconDirection = "right" | "left";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: Size;
  variant?: Variant;
  icon?: React.ReactElement;
  iconDirection?: IconDirection;
};

const getKvibClassName = (variant: Variant, size: Size, iconDirection: IconDirection) =>
  `kv-button kv-button--${variant}--blue kv-button--${size} kv-button__icon--${iconDirection}`;

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", size = "xs", children, icon, iconDirection = "right", ...props }, ref) => {
    const ButtonWrapper =
      variant === "unstyled" ? UnstyledButton : StyledButton;

    const kvibClassName = getKvibClassName(variant, size, iconDirection);

    const className =
      variant === "unstyled"
        ? props.className
        : `${kvibClassName} ${props.className ?? ""}`;

    return (
      <ButtonWrapper {...props} ref={ref} className={className}>
        {(iconDirection == "left" && icon) && (icon)}
        {children && <span>{children}</span>}
        {(iconDirection == "right" && icon) && (icon)}
      </ButtonWrapper>
    );
  }
);

Button.displayName = "Button";

const StyledButton = styled.button`
  &:disabled {
    cursor: not-allowed;
    outline: 0;
  }

  &:disabled:hover {
    background: var(--gray_light);
    color: var(--gray_dark);
  }
`;

const UnstyledButton = styled(StyledButton)`
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  text-align: left;

  * {
    // gjør at children ikke gir ekstra plass til tekst
    vertical-align: middle;
  }

  :disabled {
    cursor: initial;
    background-color: var(--gray_light);
    color: var(--gray_dark);
    outline-style: solid;
    outline-color: var(--gray_dark);
  }

  :disabled:hover {
    background: var(--gray_light);
    color: var(--gray_dark);
  }

  svg {
    margin: 0;
  }
`;

export const LinkButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))`
  color: var(--blue);
  text-decoration: underline;
  text-underline-offset: 4px;

  &:disabled {
    background: none;
    cursor: not-allowed;

    &:hover {
      background: none;
    }
  }
`;

export default Button;
